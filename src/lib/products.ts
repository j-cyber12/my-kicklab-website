import { getDb } from './mongodb';
import { WithId } from 'mongodb';
import { applySale, pickSaleForProduct, readSalesSettings, type SaleApplied } from './sales';

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

async function ensureIndexes() {
  const db = await getDb();
  const col = db.collection(COLLECTION);
  await col.createIndex({ id: 1 }, { unique: true, name: 'uniq_id' });
}

export async function readProducts(): Promise<PricedProduct[]> {
  if (!hasValidMongoUri()) return [];
  await ensureIndexes();
  const db = await getDb();
  const col = db.collection<WithId<Product>>(COLLECTION);
  const docs = await col.find({}).sort({ name: 1 }).toArray();
  const settings = await readSalesSettings();
  return docs.map((d) => {
    const { _id: _mongoId, ...rest } = d;
    void _mongoId; // mark used to satisfy lint rules
    const base = (rest as Product).price;
    // Manual per-product sale overrides dynamic settings if enabled and valid
    const manual = (rest as Product).onSale && Number((rest as Product).salePrice) > 0 && Number((rest as Product).salePrice) < base
      ? { type: 'manual', percent: Math.round((1 - Number((rest as Product).salePrice) / base) * 100) as number }
      : null;
    if (manual) {
      const finalPrice = Number((rest as Product).salePrice);
      return { ...(rest as Product), originalPrice: base, price: finalPrice, sale: manual } as PricedProduct;
    }
    const applied = pickSaleForProduct(rest as Product, settings);
    const { finalPrice } = applySale(base, applied);
    return { ...(rest as Product), originalPrice: base, price: finalPrice, sale: applied } as PricedProduct;
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
  if (!hasValidMongoUri()) return null;
  await ensureIndexes();
  const db = await getDb();
  const col = db.collection<Product>(COLLECTION);
  const doc = await col.findOne({ id });
  if (!doc) return null;
  const { _id: _mongoId, ...rest } = doc as any;
  void _mongoId;
  const base = (rest as Product).price;
  const manual = (rest as Product).onSale && Number((rest as Product).salePrice) > 0 && Number((rest as Product).salePrice) < base
    ? { type: 'manual', percent: Math.round((1 - Number((rest as Product).salePrice) / base) * 100) as number }
    : null;
  if (manual) {
    const finalPrice = Number((rest as Product).salePrice);
    return { ...(rest as Product), originalPrice: base, price: finalPrice, sale: manual } as PricedProduct;
  }
  const settings = await readSalesSettings();
  const applied = pickSaleForProduct(rest as Product, settings);
  const { finalPrice } = applySale(base, applied);
  return { ...(rest as Product), originalPrice: base, price: finalPrice, sale: applied } as PricedProduct;
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

