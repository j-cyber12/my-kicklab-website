import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export const runtime = 'nodejs';

// Configure Cloudinary from env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function ensureConfigured() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary is not configured');
  }
}

function uploadBuffer(buffer: Buffer, opts: { public_id?: string; folder?: string; resource_type?: 'image' | 'video' | 'auto'; }) {
  return new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      // Use auto to let Cloudinary infer image/video when uncertain
      resource_type: opts.resource_type || 'auto',
      folder: opts.folder,
      public_id: opts.public_id,
      use_filename: !opts.public_id,
      unique_filename: true,
      overwrite: false,
    }, (err, result) => {
      if (err || !result) return reject(err || new Error('No result'));
      resolve({ secure_url: result.secure_url! });
    });
    stream.end(buffer);
  });
}

export async function POST(req: Request) {
  try {
    ensureConfigured();
    const form = await req.formData();
    const files = form.getAll('files');
    if (!files.length) return NextResponse.json({ error: 'No files' }, { status: 400 });

    const out: string[] = [];
    for (const f of files) {
      if (!(f instanceof File)) continue;
      const ab = await f.arrayBuffer();
      const buf = Buffer.from(ab);
      const isVideo = (f.type && f.type.startsWith('video/')) || /\.(mp4|mov|webm|m4v)$/i.test(f.name);
      const folder = isVideo
        ? (process.env.CLOUDINARY_VIDEO_FOLDER || process.env.CLOUDINARY_FOLDER || 'kicklab')
        : (process.env.CLOUDINARY_FOLDER || 'kicklab');
      const res = await uploadBuffer(buf, { resource_type: 'auto', folder });
      out.push(res.secure_url);
    }
    return NextResponse.json({ files: out });
  } catch (err: any) {
    // Log server-side for debugging on the host
    console.error('Cloudinary upload failed:', err?.message || err);
    return NextResponse.json({ error: 'Upload failed', detail: String(err?.message || err) }, { status: 500 });
  }
}
