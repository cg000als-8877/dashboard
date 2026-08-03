import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic'; // Ensure it always fetches fresh data

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    // Serve historical data if requested
    if (month === '2026-07') {
      const filePath = path.join(process.cwd(), 'src', 'data', 'archive-2026-07.json');
      const fileData = await fs.readFile(filePath, 'utf-8');
      return NextResponse.json(JSON.parse(fileData));
    }
    // Live Google Sheets export URL
    const url = 'https://docs.google.com/spreadsheets/d/1sk_chMraCOx2frbK4RqUoU9M1XkGMAkjP2VgClhPJKo/export?format=xlsx';
    
    // Fetch live data directly from Google Sheets
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

    return NextResponse.json({
      lines,
      dailyProduction
    });

  } catch (error) {
    console.error('Error parsing excel:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
