import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const DEFAULT_PASSWORD = 'K!ckLab#2025_X9v7';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const submitted = typeof body?.password === 'string' ? body.password.trim() : '';
    const adminPassword = (process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD).trim();
    if (!submitted || submitted !== adminPassword) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true });
    // 1 day
    res.cookies.set('admin_auth', 'ok', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}
