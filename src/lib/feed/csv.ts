export function sanitizeText(input: unknown, max = 5000) {
  const s = String(input ?? '')
    .replace(/<[^>]+>/g, ' ') // strip HTML
    .replace(/\s+/g, ' ') // collapse spaces
    .trim();
  return s.length > max ? s.slice(0, max) : s;
}

export function csvEscape(field: string) {
  const s = String(field ?? '');
  const needs = /[",\n]/.test(s);
  return needs ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export function buildAbsoluteUrl(base: string, path: string) {
  if (!path) return '';
  try {
    return new URL(path, base).toString();
  } catch {
    return path;
  }
}

export function toCsv(rows: string[][]) {
  return rows.map((r) => r.map(csvEscape).join(',')).join('\n');
}

export function toCsvRow(fields: string[]) {
  return fields.map(csvEscape).join(',');
}
