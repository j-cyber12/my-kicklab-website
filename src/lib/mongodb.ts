import { MongoClient } from 'mongodb';

let clientPromise: Promise<MongoClient> | null = null;

function ensureValidUri(uri: string | undefined) {
  if (!uri) throw new Error('Missing MONGODB_URI');
  if (!/^mongodb(\+srv)?:\/\//.test(uri)) {
    throw new Error('MONGODB_URI must start with "mongodb://" or "mongodb+srv://"');
  }
}

export async function getDb() {
  const uri = process.env.MONGODB_URI;
  ensureValidUri(uri);
  if (!clientPromise) {
    // Add conservative, resilient defaults to reduce transient network errors in dev
    const client = new MongoClient(uri as string, {
      // Keep pool small in dev to avoid many concurrent dials
      maxPoolSize: 5,
      // Faster failover when DB is unreachable (e.g., IP not on Atlas allowlist)
      serverSelectionTimeoutMS: 7_000,
      // Reasonable connection/socket timeouts for flaky networks
      connectTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
      retryWrites: true,
    });
    clientPromise = client.connect().then(async (c) => {
      try {
        // Quick ping to surface clearer errors early
        await c.db('admin').command({ ping: 1 });
      } catch (err) {
        // Reset promise so a later attempt can retry connecting
        clientPromise = null;
        throw err;
      }
      return c;
    });
  }
  const client = await clientPromise;
  const dbName = process.env.MONGODB_DB || 'kicklab';
  return client.db(dbName);
}
