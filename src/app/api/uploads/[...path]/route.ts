import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';

const PROJECT_ROOT = process.cwd();
const CONFIG_UPLOAD_DIR = process.env.UPLOAD_DIR && process.env.UPLOAD_DIR.trim()
  ? process.env.UPLOAD_DIR
  : path.join(PROJECT_ROOT, 'public', 'uploads');

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.heic': 'image/heic',
  '.mp4': 'video/mp4',
};

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const { path: parts } = await params;
    const safe = parts.join('/').replace(/\\+/g, '/').replace(/\.\.+/g, '');
    const filePath = path.join(CONFIG_UPLOAD_DIR, safe);
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    return new NextResponse(data, {
      headers: {
        'Content-Type': type,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

