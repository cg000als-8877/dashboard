import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ ok: true, public: true });
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true, public: true });
  response.cookies.delete('ba_session');
  return response;
}
