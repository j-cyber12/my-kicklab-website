import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';

const PROJECT_ROOT = process.cwd();
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const CONFIG_UPLOAD_DIR = process.env.UPLOAD_DIR && process.env.UPLOAD_DIR.trim()
  ? process.env.UPLOAD_DIR
  : path.join(PUBLIC_DIR, 'uploads');
const UPLOAD_DIR = CONFIG_UPLOAD_DIR;

function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const files = form.getAll('files');
    if (!files.length) {
      return NextResponse.json({ error: 'No files' }, { status: 400 });
    }
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const saved: string[] = [];
    for (const f of files) {
      if (!(f instanceof File)) continue;
      const ab = await f.arrayBuffer();
      const buf = Buffer.from(ab);
      // Derive a safe extension. Prefer original extension; otherwise use MIME type.
      let ext = path.extname(f.name).toLowerCase();
      if (!ext) {
        if (f.type.startsWith('image/')) {
          const map: Record<string, string> = {
            'image/png': '.png',
            'image/jpeg': '.jpg',
            'image/jpg': '.jpg',
            'image/webp': '.webp',
            'image/gif': '.gif',
            'image/svg+xml': '.svg',
            'image/avif': '.avif',
            'image/heic': '.heic',
          };
          ext = map[f.type] || '.png';
        } else if (f.type.includes('video')) {
          ext = '.mp4';
        } else {
          ext = '.bin';
        }
      }
      const base = path.basename(f.name, path.extname(f.name));
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName(base)}${ext}`;
      const dest = path.join(UPLOAD_DIR, filename);
      await fs.writeFile(dest, buf);
      // If we are saving under public/, serve directly; otherwise use API proxy
      const isUnderPublic = path.resolve(dest).startsWith(path.resolve(PUBLIC_DIR + path.sep));
      saved.push(isUnderPublic ? `/uploads/${filename}` : `/api/uploads/${filename}`);
    }
    return NextResponse.json({ files: saved });
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
