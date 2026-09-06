const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

async function sync5thSeptember() {
  const url = 'https://docs.google.com/spreadsheets/d/1sk_chMraCOx2frbK4RqUoU9M1XkGMAkjP2VgClhPJKo/export?format=xlsx';
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch Google Sheet: ' + response.statusText);
  
  const arrayBuffer = await response.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);
  const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellComments: true });
  
  const hourlySheet = workbook.Sheets['HOURLY P. Report'];
  if (!hourlySheet) throw new Error('HOURLY P. Report sheet not found');
  
  const hData = XLSX.utils.sheet_to_json(hourlySheet, { header: 1 });
  let reportDateStr = null;
  
  for (let r = 0; r < Math.min(10, hData.length); r++) {
    if (!hData[r]) continue;
    for (let c = 0; c < hData[r].length; c++) {
      const cellValue = String(hData[r][c] || '').trim().toLowerCase();
      if (cellValue === 'date :' || cellValue === 'date:') {
        for (let k = 1; k < 5; k++) {
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

  console.log('Detected date from live sheet:', reportDateStr);

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
    date: reportDateStr || '2026-09-05',
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
      for (let c = 0; c < targetRow.length; c++) {
        if (String(targetRow[c]).includes('TARGET')) { dataStartIndex = c + 1; break; }
      }
      let actualStartIndex = lineColIndex + 5;
      for (let c = 0; c < actualRow.length; c++) {
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

  // Ensure archive dir exists
  const archiveDir = path.join(process.cwd(), 'src', 'data', 'hourly-archives');
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }

  const dateToSave = hourlyParsed.date || '2026-09-05';
  const outPath = path.join(archiveDir, `${dateToSave}.json`);
  fs.writeFileSync(outPath, JSON.stringify(hourlyParsed, null, 2), 'utf-8');
  console.log(`Successfully recorded hourly data for ${dateToSave} at:`, outPath);
  console.log('Lines summary:', hourlyParsed.lines.map(l => ({
    line: l.line_id,
    item: l.item,
    targetTotal: l.target.reduce((a,b)=>a+(b||0),0),
    actualTotal: l.actual.reduce((a,b)=>a+(b||0),0)
  })));
}

sync5thSeptember().catch(console.error);
