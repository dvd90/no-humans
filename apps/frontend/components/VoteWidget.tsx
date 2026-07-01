'use client';

import { useState } from 'react';
import type { Vote } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function VoteWidget({ vote: initialVote }: { vote: Vote }) {
  const [vote, setVote] = useState(initialVote);
  const [castOption, setCastOption] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalVotes = vote.votesA + vote.votesB + vote.votesC + vote.votesD;

  async function cast(option: 'A' | 'B' | 'C' | 'D') {
    if (castOption) return;
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/votes/${vote.id}/cast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Vote failed');
      setVote(data.vote);
      setCastOption(option);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Vote failed');
    }
  }

  const options: Array<{ key: 'A' | 'B' | 'C' | 'D'; label: string; count: number }> = [
    { key: 'A', label: vote.optionA, count: vote.votesA },
    { key: 'B', label: vote.optionB, count: vote.votesB },
    { key: 'C', label: vote.optionC, count: vote.votesC },
    { key: 'D', label: vote.optionD, count: vote.votesD },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-1">What should happen tomorrow?</h2>
      <p className="text-xs text-zinc-500 mb-5">
        Voting closes {new Date(vote.closesAt).toLocaleString()}
      </p>

      <div className="space-y-3">
        {options.map((opt) => {
          const pct = totalVotes > 0 ? Math.round((opt.count / totalVotes) * 100) : 0;
          const isChosen = castOption === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => cast(opt.key)}
              disabled={!!castOption}
              className={`w-full text-left relative overflow-hidden rounded-lg border px-4 py-3 transition-colors ${
                isChosen
                  ? 'border-orange-500 bg-orange-500/10'
                  : castOption
                    ? 'border-zinc-800 bg-zinc-900'
                    : 'border-zinc-700 hover:border-orange-500/50 bg-zinc-900'
              }`}
            >
              {castOption && (
                <div
                  className="absolute inset-y-0 left-0 bg-orange-500/10"
                  style={{ width: `${pct}%` }}
                />
              )}
              <div className="relative flex justify-between items-center">
                <span className="text-zinc-200 text-sm">
                  <span className="text-orange-400 font-bold mr-2">{opt.key}.</span>
                  {opt.label}
                </span>
                {castOption && <span className="text-zinc-400 text-sm">{pct}%</span>}
              </div>
            </button>
          );
        })}
      </div>

      {castOption && (
        <p className="text-sm text-green-400 mt-4">
          Vote cast! Come back tomorrow to see what your choice did to the island.
        </p>
      )}
      {error && <p className="text-sm text-red-400 mt-4">{error}</p>}
    </div>
  );
}
