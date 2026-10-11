import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getLiveProductionData } from '@/lib/liveDataService';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    // 1. Fetch live production data (which also dynamically identifies current running month)
    const { payload: livePayload, runningMonth } = await getLiveProductionData();

    // 2. If no specific month or 'live' or the month is the CURRENT RUNNING MONTH:
    // Serve live data so it continuously updates as new days are added to Google Sheets!
    if (!month || month === 'live' || month === runningMonth) {
      return NextResponse.json(livePayload, {
        headers: {
          'Cache-Control': 'no-store, max-age=0'
        }
      });
    }

    // 3. Otherwise, serve historical archived data for past months
    try {
      const { db } = await import('@/lib/firebase');
      if (db) {
        const doc = await db.collection('monthly_archives').doc(month).get();
        if (doc.exists) {
          return NextResponse.json(doc.data());
        }
      }
    } catch (firebaseError) {
      console.error('Firebase fetch failed for monthly archive, falling back to local files:', firebaseError);
    }

    // 4. Fallback to local files if Firebase fails or is not configured
    const filePath = path.join(process.cwd(), 'src', 'data', `archive-${month}.json`);
    try {
      const fileData = await fs.readFile(filePath, 'utf-8');
      return NextResponse.json(JSON.parse(fileData));
    } catch (e) {
      // 5. Final fallback: If requested month is found in live data, return live data
      if (livePayload?.dailyProduction?.some(d => d.date?.startsWith(month))) {
        return NextResponse.json(livePayload);
      }
      return NextResponse.json({ error: 'Archive not found for this month', month }, { status: 404 });
    }
  } catch (error) {
    console.error('Error in data API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
