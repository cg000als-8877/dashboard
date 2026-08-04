import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // e.g. "2026-08-02"

    const archiveDir = path.join(process.cwd(), 'src', 'data', 'hourly-archives');
    
    if (date) {
        // Fetch specific date
        const filePath = path.join(archiveDir, `${date}.json`);
        try {
            const fileData = await fs.readFile(filePath, 'utf-8');
            return NextResponse.json(JSON.parse(fileData));
        } catch (e) {
            return NextResponse.json({ error: 'Archive not found for this date', date }, { status: 404 });
        }
    } else {
        // List available dates
        try {
            const files = await fs.readdir(archiveDir);
            const dates = files
                .filter(f => f.endsWith('.json'))
                .map(f => f.replace('.json', ''))
                .sort((a, b) => b.localeCompare(a)); // Newest first
            return NextResponse.json({ availableDates: dates });
        } catch (e) {
            return NextResponse.json({ availableDates: [] });
        }
    }
  } catch (error) {
    console.error('Error in hourly API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
