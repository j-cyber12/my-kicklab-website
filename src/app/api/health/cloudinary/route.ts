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
    const res = await new Promise((resolve, reject) => {
      // @ts-ignore cloudinary types may not include ping
      cloudinary.api.ping((err: any, result: any) => (err ? reject(err) : resolve(result)));
    });
    return NextResponse.json({ ok: true, result: res });
  } catch (err: any) {
    console.error('Cloudinary health check failed:', err?.message || err);
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}

