// Small helper to generate Cloudinary transformed URLs and gracefully
// fall back for non‑Cloudinary images.

export type Preset = 'grid' | 'featured' | 'detail' | 'thumb' | 'gallery';

function isCloudinaryUrl(url: string) {
  try {
    const u = new URL(url, 'http://dummy');
    // if relative, host will be dummy; only transform absolute Cloudinary urls
    return u.hostname === 'res.cloudinary.com' || /res\.cloudinary\.com$/.test(u.hostname);
  } catch {
    return false;
  }
}

function applyTransform(url: string, transform: string) {
  // Insert the transform immediately after "/upload" segment
  const idx = url.indexOf('/upload/');
  if (idx === -1) return url; // not a standard upload URL; do nothing
  const before = url.slice(0, idx + '/upload'.length);
  const after = url.slice(idx + '/upload'.length);
  const t = `/${transform.replace(/^\//, '')}`;
  return `${before}${t}${after}`;
}

export function cld(url: string, preset: Preset): string {
  if (!url || !isCloudinaryUrl(url)) return url;
  // Sensible defaults: auto format/quality, secure delivery
  let tr = 'f_auto,q_auto';
  switch (preset) {
    case 'grid':
      // Square-ish card; slightly taller for fashion imagery
      tr += ',c_fill,g_auto,w_600,h_750';
      break;
    case 'featured':
      tr += ',c_fill,g_auto,w_900,h_675';
      break;
    case 'detail':
      tr += ',c_limit,w_1600';
      break;
    case 'thumb':
      tr += ',c_fill,g_auto,w_200,h_200';
      break;
    case 'gallery':
      tr += ',c_fill,g_auto,w_500,h_500';
      break;
    default:
      break;
  }
  return applyTransform(url, tr);
}

