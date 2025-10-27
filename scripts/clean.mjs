import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const rmSafe = async (p) => {
  try {
    await rm(p, { recursive: true, force: true });
    console.log('Removed', p);
  } catch (e) {
    console.error('Failed to remove', p, e?.message || e);
    process.exitCode = 1;
  }
};

await rmSafe(resolve(process.cwd(), '.next'));
await rmSafe(resolve(process.cwd(), '.next-kicklab'));
