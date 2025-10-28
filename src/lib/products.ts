import { getDb } from './mongodb';
import { WithId } from 'mongodb';

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
  category?: 'shoes' | 'bags';
};

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

export async function readProducts(): Promise<Product[]> {
  if (!hasValidMongoUri()) return [];
  await ensureIndexes();
  const db = await getDb();
  const col = db.collection<WithId<Product>>(COLLECTION);
  const docs = await col.find({}).sort({ name: 1 }).toArray();
  return docs.map((d) => {
    const { _id: _mongoId, ...rest } = d;
    void _mongoId; // mark used to satisfy lint rules
    return rest as Product;
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

export async function getProduct(id: string) {
  if (!hasValidMongoUri()) return null;
  await ensureIndexes();
  const db = await getDb();
  const col = db.collection<Product>(COLLECTION);
  const doc = await col.findOne({ id });
  return doc || null;
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
