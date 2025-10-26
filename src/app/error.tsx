"use client";
import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Log the error in development only
      console.error('App error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-lg w-full rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 p-6 bg-white dark:bg-zinc-900 shadow">
        <h2 className="text-xl font-bold">Something went wrong</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">An unexpected error occurred. Try again or return home.</p>
        {error?.digest && <p className="mt-2 text-xs text-zinc-500">Ref: {error.digest}</p>}
        <div className="mt-4 flex gap-3">
          <button onClick={() => reset()} className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white">Try again</button>
          <Link href="/" className="px-4 py-2 rounded-full border border-zinc-300 dark:border-zinc-700">Home</Link>
        </div>
      </div>
    </div>
  );
}
