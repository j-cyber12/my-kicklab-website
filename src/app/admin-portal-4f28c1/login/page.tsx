"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.replace('/admin-portal-4f28c1');
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data?.error || 'Invalid password');
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <div className="rounded-2xl border border-token surface p-6 shadow">
        <h1 className="text-xl font-semibold">Admin Login</h1>
        <p className="text-sm text-muted mt-1">Enter the admin password to continue.</p>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-token bg-transparent px-3 py-2"
              placeholder="••••••••"
              required
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button disabled={loading} className="w-full px-4 py-2 rounded-full accent-gradient text-white font-medium shadow hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? 'Checking…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}

