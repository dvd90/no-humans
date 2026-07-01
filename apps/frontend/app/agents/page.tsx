import { serverApi } from '@/lib/server-api';
import { AgentCard } from '@/components/AgentCard';

export const dynamic = 'force-dynamic';

const FALLBACK_CAST = [
  { name: 'Maya', role: 'Former engineer', personality: 'Strategic, skeptical, hates chaos', goal: 'Build a stable society' },
  { name: 'Leo', role: 'Ex-politician', personality: 'Charismatic, ambitious, panics under pressure', goal: 'Become the unchallenged leader' },
  { name: 'Nora', role: 'Psychologist', personality: 'Quiet, observant, secretly manipulative', goal: 'Survive by being indispensable' },
  { name: 'Jonas', role: 'Teacher', personality: 'Sincere peacekeeper, everyone\'s messenger', goal: 'Keep everyone alive together' },
  { name: 'Talia', role: 'Architect', personality: 'Practical builder, impatient with drama', goal: 'Build shelter good enough for anything' },
  { name: 'Oren', role: 'Comedian', personality: 'Funny, lazy, socially powerful', goal: 'Skate through on personality' },
  { name: 'Iris', role: 'Activist', personality: 'Principled idealist, wants democracy', goal: 'Create a democratic system' },
  { name: 'Max', role: 'Survivalist', personality: 'Resourceful, ruthlessly selfish under pressure', goal: 'Ensure his own survival first' },
  { name: 'Sofia', role: 'Nurse', personality: 'Deeply empathetic, trusted by almost everyone', goal: 'Keep everyone healthy' },
  { name: 'Eli', role: 'Data analyst', personality: 'Paranoid, notices patterns nobody else does', goal: 'Figure out who the real threats are' },
];

export default async function AgentsPage() {
  const agents = await serverApi.agents();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">The Agents</h1>
      <p className="text-zinc-400 mb-10">Season 1 cast — 10 characters, no script, no mercy.</p>

      {agents && agents.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {agents.map((agent) => (
            <a key={agent.id} href={`/agents/${agent.id}`}>
              <AgentCard agent={agent} />
            </a>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {FALLBACK_CAST.map((agent) => (
            <div
              key={agent.name}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-start gap-4"
            >
              <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-xl font-bold text-orange-400 shrink-0">
                {agent.name[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-semibold text-white text-lg">{agent.name}</h2>
                  <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                    {agent.role}
                  </span>
                </div>
                <p className="text-sm text-zinc-400 mb-1">{agent.personality}</p>
                <p className="text-xs text-zinc-500">
                  <span className="text-zinc-400">Goal:</span> {agent.goal}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
