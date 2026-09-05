import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    version: '2026.09.05-v1.0.1',
    releaseDate: '2026-09-05',
    timestamp: Date.now()
  });
}
