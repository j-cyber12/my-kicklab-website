import { getDb } from './mongodb';
import fs from 'fs';
import path from 'path';
import { WithId } from 'mongodb';
import { type SaleApplied } from './sales';
export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  thumbnail: string;
  images: string[];
  videoUrl?: string;
  sizes?: string[];
  gender?: 'men' | 'women' | 'unisex';
  category?: 'shoes' | 'bags' | 'heels' | 'slippers';
  onSale?: boolean;
  salePrice?: number;
};

export type PricedProduct = Product & { originalPrice: number; sale?: SaleApplied };

const COLLECTION = 'products';


function hasValidMongoUri() {
  const uri = process.env.MONGODB_URI || '';
  return /^mongodb(\+srv)?:\/\//.test(uri);
}

function readSeedProducts(): Product[] {
  try {
    const file = path.join(process.cwd(), 'data', 'products.json');
    const raw = fs.readFileSync(file, 'utf8');
    const arr = JSON.parse(raw) as Product[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function ensureIndexes() {
  const db = await getDb();
  const col = db.collection(COLLECTION);
  await col.createIndex({ id: 1 }, { unique: true, name: 'uniq_id' });
}

export async function readProducts(): Promise<PricedProduct[]> {
  if (!hasValidMongoUri()) {
    const seed = readSeedProducts();
    return seed.map((p) => {
      const base = p.price;
      const manual = p.onSale && Number(p.salePrice) > 0 && Number(p.salePrice) < base
        ? { type: 'manual', percent: Math.round((1 - Number(p.salePrice) / base) * 100) as number }
        : null;
      if (manual) {
        return { ...p, originalPrice: base, price: Number(p.salePrice), sale: manual } as PricedProduct;
      }
      // No global/category/flash discounts; use base price
      return { ...p, originalPrice: base, price: base, sale: null } as PricedProduct;
    });
  }
  await ensureIndexes();
  const db = await getDb();
  const col = db.collection<WithId<Product>>(COLLECTION);
  const docs = await col.find({}).sort({ name: 1 }).toArray();
  const seed = readSeedProducts();
  return docs.map((d) => {
    const { _id: _mongoId, ...rest } = d;
    void _mongoId;
    const seedItem = seed.find((p) => p.id === (rest as Product).id);
    const merged: Product = {
      ...(rest as Product),
      sizes: (Array.isArray((rest as Product).sizes) && (rest as Product).sizes!.length > 0)
        ? (rest as Product).sizes
        : (seedItem?.sizes || [])
    };
    const base = merged.price;
    const manual = merged.onSale && Number(merged.salePrice) > 0 && Number(merged.salePrice) < base
      ? { type: 'manual', percent: Math.round((1 - Number(merged.salePrice) / base) * 100) as number }
      : null;
    if (manual) {
      const finalPrice = Number(merged.salePrice);
      return { ...merged, originalPrice: base, price: finalPrice, sale: manual } as PricedProduct;
    }
    // No global/category/flash discounts; use base price
    return { ...merged, originalPrice: base, price: base, sale: null } as PricedProduct;
  });
}
// For compatibility; iterates and upserts items by id
export async function writeProducts(products: Product[]) {
  await ensureIndexes();
  const db = await getDb();
  const col = db.collection<Product>(COLLECTION);
  const ops = products.map((p) => col.updateOne({ id: p.id }, { $set: p }, { upsert: true }));
  await Promise.all(ops);
}

export async function getProduct(id: string): Promise<PricedProduct | null> {
  if (!hasValidMongoUri()) {
    const seed = readSeedProducts();
    const found = seed.find((p) => p.id === id);
    if (!found) return null;
    const base = found.price;
    const manual = found.onSale && Number(found.salePrice) > 0 && Number(found.salePrice) < base
      ? { type: 'manual', percent: Math.round((1 - Number(found.salePrice) / base) * 100) as number }
      : null;
    if (manual) {
      return { ...found, originalPrice: base, price: Number(found.salePrice), sale: manual } as PricedProduct;
    }
    // No global/category/flash discounts; use base price
    return { ...found, originalPrice: base, price: base, sale: null } as PricedProduct;
  }
  await ensureIndexes();
  const db = await getDb();
  const col = db.collection<Product>(COLLECTION);
  const doc = await col.findOne({ id });
  if (!doc) return null;
  const { _id: _mongoId, ...rest } = doc as WithId<Product>;
  void _mongoId;
  const seed = readSeedProducts();
  const seedItem = seed.find((p) => p.id === (rest as Product).id);
  const merged: Product = {
    ...(rest as Product),
    sizes: (Array.isArray((rest as Product).sizes) && (rest as Product).sizes!.length > 0)
      ? (rest as Product).sizes
      : (seedItem?.sizes || [])
  };
  const base = merged.price;
  const manual = merged.onSale && Number(merged.salePrice) > 0 && Number(merged.salePrice) < base
    ? { type: 'manual', percent: Math.round((1 - Number(merged.salePrice) / base) * 100) as number }
    : null;
  if (manual) {
    const finalPrice = Number(merged.salePrice);
    return { ...merged, originalPrice: base, price: finalPrice, sale: manual } as PricedProduct;
  }
  // No global/category/flash discounts; use base price
  return { ...merged, originalPrice: base, price: base, sale: null } as PricedProduct;
}
export async function upsertProduct(product: Product) {
  await ensureIndexes();
  const db = await getDb();
  const col = db.collection<Product>(COLLECTION);
  await col.updateOne({ id: product.id }, { $set: product }, { upsert: true });
  return product;
}

export async function deleteProduct(id: string) {
  await ensureIndexes();
  const db = await getDb();
  const col = db.collection<Product>(COLLECTION);
  await col.deleteOne({ id });
}









