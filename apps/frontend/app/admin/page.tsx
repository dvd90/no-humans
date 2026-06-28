'use client';

import { useState } from 'react';

export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  async function generateEpisode() {
    setStatus('Generating episode...');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/generate-episode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': secret,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus(`Episode generated: ${data.title}`);
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">Admin</h1>
      <p className="text-zinc-400 mb-10">Simulation control panel.</p>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
        <div>
          <label className="text-sm text-zinc-400 block mb-1">Admin Secret</label>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm"
            placeholder="Enter admin secret"
          />
        </div>

        <button
          onClick={generateEpisode}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
        >
          Generate Next Episode
        </button>

        {status && (
          <div className="text-sm text-zinc-300 bg-zinc-800 rounded-lg px-4 py-3">
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
