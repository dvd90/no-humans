import { notFound } from 'next/navigation';
import { serverApi } from '@/lib/server-api';

export const dynamic = 'force-dynamic';

function StatBar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-xs text-zinc-500 mb-1">
        <span>{label}</span>
        <span className="text-zinc-300">{value}</span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default async function AgentPage({ params }: { params: { id: string } }) {
  const agent = await serverApi.agent(params.id);
  if (!agent) notFound();

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center gap-5 mb-8">
        <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center text-3xl font-bold text-orange-400">
          {agent.name[0]}
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white">{agent.name}</h1>
          <p className="text-zinc-400">{agent.role}</p>
          <span className="inline-block mt-1 text-xs bg-green-900/40 text-green-400 px-2 py-0.5 rounded-full">
            {agent.status}
          </span>
        </div>
      </div>

      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">
          Profile
        </h2>
        <p className="text-zinc-300 mb-3">{agent.personality}</p>
        <p className="text-sm text-zinc-400 mb-1">
          <span className="text-zinc-500">Goal:</span> {agent.goal}
        </p>
        <p className="text-sm text-zinc-400 mb-1">
          <span className="text-zinc-500">Fears:</span> {agent.fears.join(', ')}
        </p>
        <p className="text-sm text-zinc-400">
          <span className="text-zinc-500">Values:</span> {agent.values.join(', ')}
        </p>
      </section>

      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">
          Stats
        </h2>
        <div className="space-y-4">
          <StatBar label="Public Trust" value={agent.trustScore} />
          <StatBar label="Reputation" value={agent.publicReputation} />
          <StatBar label="Energy" value={agent.energy} />
        </div>
      </section>

      {agent.memories?.length > 0 && (
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">
            Memory Highlights
          </h2>
          <ul className="space-y-2">
            {agent.memories.map((m, i) => (
              <li key={i} className="text-sm text-zinc-400 flex gap-2">
                <span className="text-orange-400">→</span>
                {m.content}
              </li>
            ))}
          </ul>
        </section>
      )}

      <a
        href="/agents"
        className="inline-block border border-zinc-700 hover:border-zinc-500 text-zinc-300 px-5 py-2.5 rounded-lg text-sm transition-colors"
      >
        ← All Agents
      </a>
    </div>
  );
}
