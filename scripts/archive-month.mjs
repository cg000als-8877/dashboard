import fs from 'fs/promises';
import path from 'path';
import * as XLSX from 'xlsx';

async function archiveMonth() {
  console.log("Starting September 2026 Monthly Archive process...");
  
  const url = 'https://docs.google.com/spreadsheets/d/1sk_chMraCOx2frbK4RqUoU9M1XkGMAkjP2VgClhPJKo/export?format=xlsx';
  let payload = null;

  try {
    console.log("Fetching live workbook from Google Sheets...");
    const response = await fetch(url, { cache: 'no-store' });
    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);
      const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellComments: true });

      const lines = [];
      const dailyProduction = [];

      workbook.SheetNames.forEach(sheetName => {
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
        
        for (let i = 4; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length === 0) continue;

          const dateSerial = row[0];
          if (!dateSerial || isNaN(dateSerial)) continue;

          const SSF = XLSX.SSF || XLSX.default?.SSF;
          const parsedDate = SSF ? SSF.parse_date_code(dateSerial) : null;
          if (!parsedDate) continue;
          const dateStr = `${parsedDate.y}-${String(parsedDate.m).padStart(2, '0')}-${String(parsedDate.d).padStart(2, '0')}`;

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

      payload = { lines, dailyProduction };
      console.log(`Successfully parsed live sheet: ${dailyProduction.length} daily rows found across ${lines.length} lines.`);
    }
  } catch (err) {
    console.warn("Live Google Sheets fetch failed, reading from live-backup.json:", err.message);
  }

  if (!payload || !payload.dailyProduction || payload.dailyProduction.length === 0) {
    const backupPath = path.join(process.cwd(), 'src', 'data', 'live-backup.json');
    const backupData = await fs.readFile(backupPath, 'utf-8');
    payload = JSON.parse(backupData);
    console.log(`Loaded from live-backup.json: ${payload.dailyProduction.length} daily records.`);
  }

  // Ensure Line B adjustments are respected if not present in raw sheet
  // (e.g. Line B transitioned from Boxer to Boys Shirt)
  payload.dailyProduction.forEach(d => {
    if (d.line_id === 'B' && (d.date === '2026-09-15' || d.date === '2026-09-16' || d.date === '2026-09-17')) {
      if (!d.item || d.item.trim() === '') {
        d.item = 'BOYS SHIRT';
      }
    }
  });

  const archivePath = path.join(process.cwd(), 'src', 'data', 'archive-2026-09.json');
  await fs.writeFile(archivePath, JSON.stringify(payload, null, 2), 'utf-8');
  console.log(`✅ Saved September 2026 monthly archive to: ${archivePath}`);

  // Also update live-backup.json
  const backupPath = path.join(process.cwd(), 'src', 'data', 'live-backup.json');
  await fs.writeFile(backupPath, JSON.stringify(payload, null, 2), 'utf-8');
  console.log(`✅ Synced live-backup.json with closing data.`);
}

archiveMonth();
