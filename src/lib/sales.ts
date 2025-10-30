import { getDb } from './mongodb';

export type SaleWindow = {
  enabled?: boolean;
  percent?: number; // 0-100
  startAt?: string; // ISO string
  endAt?: string;   // ISO string
};

export type SalesSettings = {
  _id?: string;
  global?: SaleWindow;
  categories?: Record<string, SaleWindow>;
  flash?: {
    items?: Array<{
      id: string; // product id
      enabled?: boolean;
      percent?: number;
      startAt?: string;
      endAt?: string;
    }>
  };
  updatedAt?: string;
};

const COLLECTION = 'salesSettings';
const SINGLETON_ID = 'settings';

function nowMs() {
  return Date.now();
}

function isActive(win?: SaleWindow | null): boolean {
  if (!win || win.enabled === false) return false;
  const start = win.startAt ? Date.parse(win.startAt) : NaN;
  const end = win.endAt ? Date.parse(win.endAt) : NaN;
  const t = nowMs();
  if (!Number.isNaN(start) && t < start) return false;
  if (!Number.isNaN(end) && t > end) return false;
  return (win.percent ?? 0) > 0;
}

export async function readSalesSettings(): Promise<SalesSettings> {
  const db = await getDb();
  const col = db.collection<SalesSettings>(COLLECTION);
  const doc = await col.findOne({ _id: SINGLETON_ID });
  return doc || { _id: SINGLETON_ID };
}

export async function writeSalesSettings(settings: SalesSettings): Promise<SalesSettings> {
  const db = await getDb();
  const col = db.collection<SalesSettings>(COLLECTION);
  const next: SalesSettings = { ...settings, _id: SINGLETON_ID, updatedAt: new Date().toISOString() };
  await col.updateOne({ _id: SINGLETON_ID }, { $set: next }, { upsert: true });
  return next;
}

export type SaleApplied = { type: 'global' | 'category' | 'flash' | 'manual'; percent: number } | null;

export function pickSaleForProduct(
  product: { id: string; category?: string },
  settings: SalesSettings
): SaleApplied {
  // Priority: flash > category > global
  const flashList = settings.flash?.items || [];
  const flash = flashList.find((i) => i.id === product.id);
  if (flash && isActive(flash)) {
    const pct = Math.max(0, Math.min(100, Number(flash.percent || 0)));
    if (pct > 0) return { type: 'flash', percent: pct };
  }
  const catKey = (product.category || '').toLowerCase();
  if (catKey && settings.categories && settings.categories[catKey]) {
    const cat = settings.categories[catKey];
    if (isActive(cat)) {
      const pct = Math.max(0, Math.min(100, Number(cat?.percent || 0)));
      if (pct > 0) return { type: 'category', percent: pct };
    }
  }
  if (isActive(settings.global)) {
    const pct = Math.max(0, Math.min(100, Number(settings.global?.percent || 0)));
    if (pct > 0) return { type: 'global', percent: pct };
  }
  return null;
}

export function applySale(price: number, applied: SaleApplied): { finalPrice: number; applied: SaleApplied } {
  if (!applied) return { finalPrice: price, applied: null };
  const pct = Math.max(0, Math.min(100, Number(applied.percent || 0)));
  const finalPrice = Number((price * (1 - pct / 100)).toFixed(2));
  return { finalPrice, applied };
}
