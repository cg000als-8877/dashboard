import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const monthsSet = new Set();

    // 1. Scan Firebase monthly_archives collection
    try {
      const { db } = await import('@/lib/firebase');
      if (db) {
        const snapshot = await db.collection('monthly_archives').get();
        snapshot.forEach(doc => {
          monthsSet.add(doc.id);
        });
      }
    } catch (e) {
      console.error("Firebase archive fetch failed:", e);
    }

    // 2. Scan local src/data folder for archive-*.json files
    try {
      const dataDir = path.join(process.cwd(), 'src', 'data');
      const files = await fs.readdir(dataDir);
      files.forEach(file => {
        const match = file.match(/^archive-(\d{4}-\d{2})\.json$/);
        if (match) {
          monthsSet.add(match[1]);
        }
      });
    } catch (e) {
      console.error("Local archive file fetch failed:", e);
    }

    // If both scans failed or returned nothing, fall back to July 2026
    if (monthsSet.size === 0) {
      monthsSet.add('2026-07');
    }

    const months = Array.from(monthsSet).map(monthId => {
      const [year, month] = monthId.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      const name = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      return {
        id: monthId,
        name: name,
        description: `Archive data for ${name}.`
      };
    });

    // Sort descending (latest months first)
    months.sort((a, b) => b.id.localeCompare(a.id));

    return NextResponse.json({ months });
  } catch (err) {
    console.error('Error in archive API:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
