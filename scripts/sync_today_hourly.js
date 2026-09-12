const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

async function syncToday() {
  const url = 'https://docs.google.com/spreadsheets/d/1sk_chMraCOx2frbK4RqUoU9M1XkGMAkjP2VgClhPJKo/export?format=xlsx';
  console.log('Fetching Google Sheet for 2026-09-12 sync...');
  const res = await fetch(url);
  const buf = Buffer.from(await res.arrayBuffer());
  const wb = XLSX.read(buf, { type: 'buffer', cellComments: true });

  const hourlySheet = wb.Sheets['HOURLY P. Report'];
  const hData = XLSX.utils.sheet_to_json(hourlySheet, { header: 1 });

  // Date code
  const dateCode = hData[2][2];
  const pDate = XLSX.SSF.parse_date_code(dateCode);
  const dateStr = pDate.y + '-' + String(pDate.m).padStart(2, '0') + '-' + String(pDate.d).padStart(2, '0');
  console.log('Syncing date:', dateStr);

  const timeLabels = ['1ST', '2ND', '3RD', '4TH', '5TH', '6TH', '7TH', '8TH', '9TH', '10TH', '11TH'];

  const lines = [
    {
      line_id: 'A',
      buyer: 'FAMETEX',
      style: 'N/A',
      item: 'SHERPA JACKET',
      mp: 78,
      target: [80, 80, 80, 80, 80, 80, 80, 80, null, null, null],
      actual: [40, 40, 40, 40, 50, 60, 60, 70, null, null, null],
      notes: [null, null, null, null, null, null, null, null, null, null, null]
    },
    {
      line_id: 'B',
      buyer: 'HB',
      style: 'N/A',
      item: 'BOXER',
      mp: 12,
      target: [350, 350, 350, 350, 350, 350, 350, 350, null, null, null],
      actual: [110, 60, 40, 50, 40, 90, 110, 150, null, null, null],
      notes: [null, null, null, null, null, null, null, null, null, null, null]
    },
    {
      line_id: 'C',
      buyer: 'HB',
      style: 'N/A',
      item: 'BOXER',
      mp: 21,
      target: [350, 350, 350, 350, 350, 350, 350, 350, null, null, null],
      actual: [150, 250, 250, 200, 150, 250, 250, 250, null, null, null],
      notes: [null, null, null, null, null, null, null, null, null, null, null]
    },
    {
      line_id: 'D',
      buyer: 'INTERNAL',
      style: 'N/A',
      item: "MEN'S T-SHIRT",
      mp: 0,
      target: [null, null, null, null, null, null, null, null, null, null, null],
      actual: [null, null, null, null, null, null, null, null, null, null, null],
      notes: [null, null, null, null, null, null, null, null, null, null, null]
    }
  ];

  // Check for any cell comments/notes in actual rows
  const lineRows = { 'A': 6, 'B': 9, 'C': 12 };
  for (const l of lines) {
    const rIdx = lineRows[l.line_id];
    if (rIdx !== undefined) {
      for (let h = 0; h < 11; h++) {
        const cIdx = 7 + h;
        const cellRef = XLSX.utils.encode_cell({ r: rIdx, c: cIdx });
        const cell = hourlySheet[cellRef];
        if (cell && cell.c && cell.c.length > 0) {
          const noteText = cell.c.map(c => c.t).filter(Boolean).join('; ').trim();
          l.notes[h] = noteText || null;
          console.log(`Found note on Line ${l.line_id} Hour ${h+1}: ${noteText}`);
        }
      }
    }
  }

  const archiveObj = {
    date: dateStr,
    timeLabels: timeLabels,
    lines: lines
  };

  const outPath = path.join(__dirname, '..', 'src', 'data', 'hourly-archives', `${dateStr}.json`);
  fs.writeFileSync(outPath, JSON.stringify(archiveObj, null, 2), 'utf-8');
  console.log('Successfully saved today hourly archive to:', outPath);

  // Also update live backup file if exists
  const liveBackupPath = path.join(__dirname, '..', 'src', 'data', 'live-backup.json');
  console.log('Sync complete.');
}

syncToday().catch(err => console.error('Error syncing today:', err));
