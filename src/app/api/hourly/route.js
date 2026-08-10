import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

async function fetchLiveHourlyData() {
    const url = 'https://docs.google.com/spreadsheets/d/1sk_chMraCOx2frbK4RqUoU9M1XkGMAkjP2VgClhPJKo/export?format=xlsx';
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return null;
    
    const arrayBuffer = await response.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    
    const hourlySheet = workbook.Sheets['HOURLY P. Report'];
    if (!hourlySheet) return null;
    
    const hData = XLSX.utils.sheet_to_json(hourlySheet, { header: 1 });
    let reportDateStr = null;
    
    for (let r = 0; r < Math.min(10, hData.length); r++) {
      if (!hData[r]) continue;
      for (let c = 0; c < hData[r].length; c++) {
        const cellValue = String(hData[r][c] || '').trim().toLowerCase();
        if (cellValue === 'date :' || cellValue === 'date:') {
          for(let k = 1; k < 5; k++) {
             const maybeDate = hData[r][c+k];
             if (maybeDate && !isNaN(maybeDate) && typeof maybeDate === 'number') {
               const parsedHDate = XLSX.SSF.parse_date_code(maybeDate);
               reportDateStr = `${parsedHDate.y}-${String(parsedHDate.m).padStart(2, '0')}-${String(parsedHDate.d).padStart(2, '0')}`;
               break;
             }
          }
        }
      }
      if (reportDateStr) break;
    }

    if (!reportDateStr) return null;

    let timeLabels = [];
    for (let r = 0; r < Math.min(10, hData.length); r++) {
        if (hData[r] && hData[r].includes('1ST')) {
            const startIndex = hData[r].indexOf('1ST');
            timeLabels = hData[r].slice(startIndex, startIndex + 11).map(String);
            break;
        }
    }
    if (timeLabels.length === 0) {
        timeLabels = ['1ST', '2ND', '3RD', '4TH', '5TH', '6TH', '7TH', '8TH', '9TH', '10TH', '11TH'];
    }

    const hourlyParsed = {
        date: reportDateStr,
        timeLabels: timeLabels,
        lines: []
    };
    
    for (let i = 0; i < hData.length; i++) {
        const row = hData[i] || [];
        
        let lineId = null;
        let lineColIndex = 0;
        for (let c = 0; c < Math.min(3, row.length); c++) {
            const val = String(row[c] || '').trim().toUpperCase();
            if (['A', 'B', 'C', 'D'].includes(val)) {
                lineId = val;
                lineColIndex = c;
                break;
            }
        }

        if (lineId) {
          const targetRow = row;
          const actualRow = hData[i+1] || [];
          let dataStartIndex = lineColIndex + 5;
          for(let c=0; c < targetRow.length; c++) {
              if (String(targetRow[c]).includes('TARGET')) { dataStartIndex = c + 1; break; }
          }
          let actualStartIndex = lineColIndex + 5;
          for(let c=0; c < actualRow.length; c++) {
              if (String(actualRow[c]).includes('ACTUAL')) { actualStartIndex = c + 1; break; }
          }
          hourlyParsed.lines.push({
            line_id: lineId,
            buyer: targetRow[lineColIndex + 1] || 'N/A',
            style: targetRow[lineColIndex + 2] || 'N/A',
            item: targetRow[lineColIndex + 3] || 'N/A',
            mp: targetRow[lineColIndex + 4] || 0,
            target: targetRow.slice(dataStartIndex, dataStartIndex + 11).map(v => Number(v) || 0),
            actual: actualRow.slice(actualStartIndex, actualStartIndex + 11).map(v => Number(v) || 0)
          });
        }
    }
    return hourlyParsed;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    const archiveDir = path.join(process.cwd(), 'src', 'data', 'hourly-archives');
    
    // 1. Always fetch live data directly from Google Sheets to guarantee it's up-to-date
    let liveData = null;
    try {
        liveData = await fetchLiveHourlyData();
    } catch (e) {
        console.error("Failed to fetch live hourly data:", e);
    }

    if (date) {
        // 2. If the user is requesting today's date, return the LIVE data immediately (Bypass GitHub/local files)
        if (liveData && liveData.date === date) {
            return NextResponse.json(liveData);
        }

        // 3. Fallback to Firebase for historical dates
        try {
            const { db } = await import('@/lib/firebase');
            if (db) {
                const doc = await db.collection('hourly_archives').doc(date).get();
                if (doc.exists) {
                    return NextResponse.json(doc.data());
                }
            }
        } catch (firebaseError) {
            console.error('Firebase fetch failed, falling back to local files:', firebaseError);
        }

        // 4. Fallback to local JSON files if Firebase fails or is not configured
        const filePath = path.join(archiveDir, `${date}.json`);
        try {
            const fileData = await fs.readFile(filePath, 'utf-8');
            return NextResponse.json(JSON.parse(fileData));
        } catch (e) {
            return NextResponse.json({ error: 'Archive not found for this date', date }, { status: 404 });
        }
    } else {
        // List available dates
        const dateSet = new Set();

        // Try Firebase first
        try {
            const { db } = await import('@/lib/firebase');
            if (db) {
                const snapshot = await db.collection('hourly_archives').get();
                snapshot.forEach(doc => {
                    dateSet.add(doc.id);
                });
            }
        } catch (firebaseError) {
            console.error('Firebase list failed, falling back to local files:', firebaseError);
        }

        // Merge local files
        try {
            const files = await fs.readdir(archiveDir);
            files.forEach(f => {
                if (f.endsWith('.json')) {
                    dateSet.add(f.replace('.json', ''));
                }
            });
        } catch (e) {
            // Directory might not exist yet
        }
        
        let dates = Array.from(dateSet);

        // Inject the live date into the dropdown menu if it's new
        if (liveData && liveData.date && !dates.includes(liveData.date)) {
            dates.push(liveData.date);
        }

        dates.sort((a, b) => b.localeCompare(a)); // Newest first
        return NextResponse.json({ availableDates: dates });
    }
  } catch (error) {
    console.error('Error in hourly API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
