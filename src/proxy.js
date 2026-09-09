import { NextResponse } from 'next/server';
import { createHash } from 'crypto';

const COOKIE_NAME = 'ba_session';

// Same hash function as the auth API — must match exactly
function hashPasscode(passcode) {
  return createHash('sha256').update((passcode || '').trim()).digest('hex');
}

// Paths that are always public
const PUBLIC_PATHS = ['/login', '/api/auth'];

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static assets through
  if (
    PUBLIC_PATHS.some(p => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/icon') ||
    pathname.startsWith('/apple-icon') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/logo') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Get the expected hash from the current passcode (with fallback)
  const currentPasscode = (process.env.DASHBOARD_PASSCODE || 'do1@z1a').trim();
  const expectedToken = hashPasscode(currentPasscode);

  // Check cookie matches current passcode hash
  const session = request.cookies.get(COOKIE_NAME);

  if (!session || session.value !== expectedToken) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // No valid session — send to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
