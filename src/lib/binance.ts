import Binance from 'binance-api-node';

let client: ReturnType<typeof Binance> | null = null;

export function getBinance() {
  if (client) return client;
  const apiKey = process.env.BINANCE_API_KEY || '';
  const apiSecret = process.env.BINANCE_API_SECRET || '';
  if (!apiKey || !apiSecret) {
    throw new Error('Missing BINANCE_API_KEY/BINANCE_API_SECRET. Set them in environment variables.');
  }
  client = Binance({ apiKey, apiSecret });
  return client;
}

export type CryptoSession = {
  id: string;
  amount: number; // expected crypto amount (e.g., 25 USDT)
  asset: string; // e.g., 'USDT' | 'BTC'
  network?: string; // e.g., 'TRX', 'BSC', 'ETH'
  address: string; // merchant-provided deposit address
  tagOrMemo?: string; // optional tag/memo
  createdAt: number; // ms
};

// In-memory fallback store for dev/local if Mongo is not configured
const memory = new Map<string, CryptoSession>();

export const cryptoSessions = {
  async set(session: CryptoSession) {
    memory.set(session.id, session);
    return session;
  },
  async get(id: string) {
    return memory.get(id) || null;
  },
};

