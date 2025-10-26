import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const DEFAULT_PASSWORD = 'K!ckLab#2025_X9v7';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
    if (typeof password !== 'string' || password !== adminPassword) {
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

