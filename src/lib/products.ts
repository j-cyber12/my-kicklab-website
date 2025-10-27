import { promises as fs } from 'fs';
import path from 'path';

export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  thumbnail: string;
  images: string[];
  videoUrl?: string;
  sizes?: string[];
  gender?: 'men' | 'women';
  category?: 'shoes' | 'bags';
};

const DATA_PATH = process.env.PRODUCTS_PATH && process.env.PRODUCTS_PATH.trim()
  ? process.env.PRODUCTS_PATH
  : path.join(process.cwd(), 'data', 'products.json');

async function ensureDataFile() {
  try {
    await fs.access(DATA_PATH);
  } catch {
    const dir = path.dirname(DATA_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(DATA_PATH, '[]', 'utf-8');
  }
}

// Serialize writes and use atomic replace to avoid partial/corrupted JSON
let writeChain: Promise<void> = Promise.resolve();

async function atomicWriteJSON(products: Product[]) {
  const tmp = DATA_PATH + '.tmp';
  const data = JSON.stringify(products, null, 2);
  const task = async () => {
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.writeFile(tmp, data, 'utf-8');
    await fs.rename(tmp, DATA_PATH);
  };
  const run = writeChain.then(task, task);
  writeChain = run.catch(() => {});
  await run;
}

export async function readProducts(): Promise<Product[]> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_PATH, 'utf-8');
  try {
    const data = JSON.parse(raw) as Product[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function writeProducts(products: Product[]) {
  await ensureDataFile();
  await atomicWriteJSON(products);
}

export async function getProduct(id: string) {
  const all = await readProducts();
  return all.find((p) => p.id === id) || null;
}

export async function upsertProduct(product: Product) {
  const all = await readProducts();
  const idx = all.findIndex((p) => p.id === product.id);
  if (idx >= 0) {
    all[idx] = product;
  } else {
    all.push(product);
  }
  await writeProducts(all);
  return product;
}

export async function deleteProduct(id: string) {
  const all = await readProducts();
  const next = all.filter((p) => p.id !== id);
  await writeProducts(next);
}
