import { NextResponse } from 'next/server';
import { createHash } from 'crypto';

const COOKIE_NAME = 'ba_session';
// 1 year in seconds — effectively "until you change the passcode or clear cookies"
const MAX_AGE = parseInt(process.env.SESSION_MAX_AGE || '31536000', 10);

/**
 * We store a SHA-256 hash of the passcode in the cookie (not "authenticated").
 * This means:
 *   ✅ Changing the passcode instantly invalidates ALL existing sessions
 *   ✅ Cannot be forged without knowing the actual passcode
 *   ✅ The real passcode is never sent to the browser
 */
function hashPasscode(passcode) {
  return createHash('sha256').update((passcode || '').trim()).digest('hex');
}

// POST /api/auth — verify passcode and set session cookie
export async function POST(request) {
  try {
    const { passcode } = await request.json();
    const correct = (process.env.DASHBOARD_PASSCODE || 'do1@z1a').trim();

    const entered = (passcode || '').trim();

    if (!entered || (entered !== correct && entered.toLowerCase() !== correct.toLowerCase())) {
      // Brief delay to slow down brute-force attempts
      await new Promise(r => setTimeout(r, 800));
      return NextResponse.json(
        { error: 'Incorrect access code. Please try again.' },
        { status: 401 }
      );
    }

    // Store the hash of the canonical passcode
    const sessionToken = hashPasscode(correct);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, sessionToken, {
      httpOnly: true,      // JS cannot read this cookie (protects against XSS)
      secure: process.env.NODE_ENV === 'production', // HTTPS-only in production
      sameSite: 'lax',     // Protects against CSRF
      maxAge: MAX_AGE,     // 1 year — re-login only needed if passcode changes
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  }
}

// DELETE /api/auth — logout (clears the session cookie)
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}

// Export the hash function so proxy.js can use the same logic
export { hashPasscode };

