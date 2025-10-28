import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export const runtime = 'nodejs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function GET() {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ ok: false, error: 'Missing Cloudinary env vars' }, { status: 500 });
    }
    // Ping Cloudinary admin API to verify credentials
    const res = await new Promise<unknown>((resolve, reject) => {
      // @ts-expect-error cloudinary types may not include api.ping in the SDK typings
      cloudinary.api.ping((err: unknown, result: unknown) => (err ? reject(err) : resolve(result)));
    });
    return NextResponse.json({ ok: true, result: res });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Cloudinary health check failed:', msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
