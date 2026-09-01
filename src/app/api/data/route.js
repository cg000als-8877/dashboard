import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic'; // Ensure it always fetches fresh data

let cachedLivePayload = null;
let lastLiveFetchTime = 0;
const CACHE_TTL_MS = 10000; // 10s fresh cache

export async function GET(request) {
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

    // 2. For live data, return in-memory cache if within TTL (10s)
    const now = Date.now();
    if (cachedLivePayload && (now - lastLiveFetchTime < CACHE_TTL_MS)) {
      return NextResponse.json(cachedLivePayload);
    }

    // 3. Fetch live data from Google Sheets with fallback
    const url = 'https://docs.google.com/spreadsheets/d/1sk_chMraCOx2frbK4RqUoU9M1XkGMAkjP2VgClhPJKo/export?format=xlsx';
    let fileBuffer;

    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Google Sheets HTTP ${response.status}: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } catch (fetchErr) {
      console.warn("Live Google Sheets fetch failed, attempting cached/backup fallback:", fetchErr.message);
      if (cachedLivePayload) {
        return NextResponse.json(cachedLivePayload);
      }
      // Try disk cache backup
      const backupPath = path.join(process.cwd(), 'src', 'data', 'live-backup.json');
      try {
        const backupData = await fs.readFile(backupPath, 'utf-8');
        cachedLivePayload = JSON.parse(backupData);
        return NextResponse.json(cachedLivePayload);
      } catch (backupErr) {
        throw fetchErr;
      }
    }

    // Read the workbook directly from the buffer
    const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellComments: true });
    
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
                    if (String(targetRow[c]).includes('TARGET')) {
                        dataStartIndex = c + 1;
                        break;
                    }
                }

                let actualStartIndex = lineColIndex + 5;
                for(let c=0; c < actualRow.length; c++) {
                    if (String(actualRow[c]).includes('ACTUAL')) { actualStartIndex = c + 1; break; }
                }

                const actualRowIdx = i + 1;
                const notes = [];
                for (let h = 0; h < 11; h++) {
                  const colIdx = actualStartIndex + h;
                  const cellRef = XLSX.utils.encode_cell({ r: actualRowIdx, c: colIdx });
                  const cellObj = hourlySheet[cellRef];
                  if (cellObj && cellObj.c && cellObj.c.length > 0) {
                    const noteText = cellObj.c.map(c => c.t).filter(Boolean).join('; ').trim();
                    notes.push(noteText || null);
                  } else {
                    notes.push(null);
                  }
                }

                hourlyParsed.lines.push({
                  line_id: lineId,
                  buyer: targetRow[lineColIndex + 1] || 'N/A',
                  style: targetRow[lineColIndex + 2] || 'N/A',
                  item: targetRow[lineColIndex + 3] || 'N/A',
                  mp: targetRow[lineColIndex + 4] || 0,
                  target: targetRow.slice(dataStartIndex, dataStartIndex + 11).map(v => (v === undefined || v === null || String(v).trim() === '') ? null : Number(v)),
                  actual: actualRow.slice(actualStartIndex, actualStartIndex + 11).map(v => (v === undefined || v === null || String(v).trim() === '') ? null : Number(v)),
                  notes: notes
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

    // Update live cache
    cachedLivePayload = payload;
    lastLiveFetchTime = Date.now();

    // Auto-backup live payload to local disk
    try {
      const backupPath = path.join(process.cwd(), 'src', 'data', 'live-backup.json');
      await fs.writeFile(backupPath, JSON.stringify(payload, null, 2));
    } catch (e) {}

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
