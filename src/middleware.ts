import { NextResponse, type NextRequest } from 'next/server';

const ADMIN_PATH = '/admin-portal-4f28c1';

export function middleware(req: NextRequest) {
  const url = new URL(req.url);
  // Normalize brand alias path to home to avoid 404s
  const lowerPath = url.pathname.toLowerCase();
  if (lowerPath === '/k!cklab') {
    return NextResponse.redirect(new URL('/', url.origin));
  }
  if (url.pathname.startsWith(ADMIN_PATH)) {
    // Allow login page without cookie
    if (url.pathname.startsWith(`${ADMIN_PATH}/login`)) {
      return NextResponse.next();
    }
    const cookie = req.cookies.get('admin_auth')?.value;
    const authorized = cookie === 'ok';
    if (!authorized) {
      const loginUrl = new URL(`${ADMIN_PATH}/login`, url.origin);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin-portal-4f28c1/:path*', '/K!ckLab', '/k!cklab'],
};
