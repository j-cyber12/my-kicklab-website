import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const dir = resolve(process.cwd(), '.next');
try {
  await rm(dir, { recursive: true, force: true });
  console.log('Removed .next');
} catch (e) {
  console.error('Failed to remove .next', e);
  process.exitCode = 1;
}

