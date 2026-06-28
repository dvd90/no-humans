import type { Agent } from '@/lib/types';

interface Props {
  agent: Agent;
}

const STATUS_STYLES: Record<Agent['status'], string> = {
  active: 'bg-green-900/40 text-green-400',
  injured: 'bg-yellow-900/40 text-yellow-400',
  exiled: 'bg-red-900/40 text-red-400',
  dead: 'bg-zinc-800 text-zinc-500',
};

export function AgentCard({ agent }: Props) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-orange-400 shrink-0">
          {agent.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-white">{agent.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[agent.status]}`}>
              {agent.status}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mb-2">{agent.role}</p>
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span>Trust <span className="text-zinc-300">{agent.trustScore}</span></span>
            <span>Rep <span className="text-zinc-300">{agent.publicReputation}</span></span>
            <span>Energy <span className="text-zinc-300">{agent.energy}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
