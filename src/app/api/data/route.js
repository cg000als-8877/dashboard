import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic'; // Ensure it always fetches fresh data

export async function GET(request) {
  console.log("=== API DATA ROUTE HIT ===", request.url);
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    // 1. Serve historical data if a specific month is requested
    if (month && month !== 'live') {
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
        
        // Fallback to local files if Firebase fails or is not configured
        const filePath = path.join(process.cwd(), 'src', 'data', `archive-${month}.json`);
        try {
            const fileData = await fs.readFile(filePath, 'utf-8');
            return NextResponse.json(JSON.parse(fileData));
        } catch (e) {
            return NextResponse.json({ error: 'Archive not found for this month', month }, { status: 404 });
        }
    }

    // 2. Fetch live data directly from Google Sheets
    const url = 'https://docs.google.com/spreadsheets/d/1sk_chMraCOx2frbK4RqUoU9M1XkGMAkjP2VgClhPJKo/export?format=xlsx';
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to fetch from Google Sheets: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Read the workbook directly from the buffer
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    
    const lines = [];
    const dailyProduction = [];

    workbook.SheetNames.forEach(sheetName => {
      // e.g. "LINE-A " or "LINE A" -> "A"
      const match = sheetName.match(/LINE[- ]([A-Z])/i);
      if (!match) return;
      
      const lineId = match[1].toUpperCase();
      lines.push({
        id: lineId,
        name: `LINE ${lineId}`,
        active: true
      });

      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      // Data starts at row 4 (index 3 is header)
      for (let i = 4; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;

        const dateSerial = row[0];
        if (!dateSerial || isNaN(dateSerial)) continue; // skip empty or invalid rows

        // Convert Excel date to YYYY-MM-DD
        const parsedDate = XLSX.SSF.parse_date_code(dateSerial);
        const dateStr = `${parsedDate.y}-${String(parsedDate.m).padStart(2, '0')}-${String(parsedDate.d).padStart(2, '0')}`;

        // Check if row has data or is just a date (holiday/no production)
        if (row.length < 5 || !row[4]) {
          dailyProduction.push({
            date: dateStr,
            line_id: lineId,
            status: 'HOLIDAY'
          });
          continue;
        }

        dailyProduction.push({
          date: dateStr,
          line_id: lineId,
          style: row[2] || '',
          item: row[3] || '',
          worker_count: row[4] || 0,
          per_head_cost: row[5] || 0,
          total_cost: row[6] || 0,
          production_qty: row[7] || 0,
          production_dzn: row[8] || 0,
          cm_per_dzn: row[9] || 0,
          total_income: row[10] || 0,
          net_profit: row[11] || 0,
          status: 'ACTIVE'
        });
      }
    });

    // Parse and auto-archive Hourly Report
    try {
      const hourlySheet = workbook.Sheets['HOURLY P. Report'];
      if (hourlySheet) {
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

        if (reportDateStr) {
          let timeLabels = [];
          for (let r = 0; r < Math.min(10, hData.length); r++) {
              if (hData[r] && hData[r].includes('1ST')) {
                  const startIndex = hData[r].indexOf('1ST');
                  timeLabels = hData[r].slice(startIndex, startIndex + 11).map(String);
                  break;
              }
          }

          // Fallback if not found
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
              const lineId = row[0];
              
              if (lineId && typeof lineId === 'string' && ['A', 'B', 'C', 'D'].includes(lineId.toUpperCase())) {
                const targetRow = row;
                const actualRow = hData[i+1] || [];
                
                let dataStartIndex = 6; // default after METRIC
                for(let c=0; c < targetRow.length; c++) {
                    if (String(targetRow[c]).includes('TARGET')) {
                        dataStartIndex = c + 1;
                        break;
                    }
                }

                let actualStartIndex = 6;
                for(let c=0; c < actualRow.length; c++) {
                    if (String(actualRow[c]).includes('ACTUAL')) {
                        actualStartIndex = c + 1;
                        break;
                    }
                }

                hourlyParsed.lines.push({
                  line_id: lineId.toUpperCase(),
                  buyer: targetRow[1] || 'N/A',
                  style: targetRow[2] || 'N/A',
                  item: targetRow[3] || 'N/A',
                  mp: targetRow[4] || 0,
                  target: targetRow.slice(dataStartIndex, dataStartIndex + 11).map(v => Number(v) || 0),
                  actual: actualRow.slice(actualStartIndex, actualStartIndex + 11).map(v => Number(v) || 0)
                });
              }
          }

          // Ensure directory exists for local fallback
          const archiveDir = path.join(process.cwd(), 'src', 'data', 'hourly-archives');
          try { await fs.mkdir(archiveDir, { recursive: true }); } catch (e) {}

          const archivePath = path.join(archiveDir, `${reportDateStr}.json`);
          await fs.writeFile(archivePath, JSON.stringify(hourlyParsed, null, 2));

          // Save to Firebase Firestore if configured
          try {
            const { db } = await import('@/lib/firebase');
            if (db) {
              await db.collection('hourly_archives').doc(reportDateStr).set(hourlyParsed);
              console.log(`Successfully saved hourly data for ${reportDateStr} to Firebase.`);
            }
          } catch (firebaseError) {
            console.error('Failed to save to Firebase:', firebaseError);
          }
        }
      }
    } catch (archiveError) {
      console.error('Error auto-archiving hourly report:', archiveError);
    }

    const payload = {
      lines,
      dailyProduction
    };

    // Auto-backup current month to Firebase
    try {
        if (dailyProduction.length > 0) {
            const firstDate = dailyProduction.find(d => d.date && d.status === 'ACTIVE')?.date;
            if (firstDate) {
                const currentMonthStr = firstDate.substring(0, 7);
                const { db } = await import('@/lib/firebase');
                if (db) {
                    await db.collection('monthly_archives').doc(currentMonthStr).set(payload);
                    console.log(`Successfully auto-backed up month ${currentMonthStr} to Firebase.`);
                }
            }
        }
    } catch (firebaseError) {
        console.error('Failed to auto-backup month to Firebase:', firebaseError);
    }

    return NextResponse.json(payload);

  } catch (error) {
    console.error('Error parsing excel:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
