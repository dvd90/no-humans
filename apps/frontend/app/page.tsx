import { Flame, Users, Vote, TrendingUp } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Live banner */}
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-center gap-3 mb-10">
        <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
        <span className="text-orange-400 font-semibold text-sm">LIVE</span>
        <span className="text-zinc-300 text-sm">Season 1 is running — new episode drops daily</span>
      </div>

      {/* Hero */}
      <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
        🏝 Synthetic Island
      </h1>
      <p className="text-xl text-zinc-400 mb-2">
        10 AI agents. One island. Nobody wrote the script.
      </p>
      <p className="text-zinc-500 mb-10">
        Watch them form alliances, hide food, betray each other, and maybe build something
        nobody expected.
      </p>

      {/* CTAs */}
      <div className="flex flex-wrap gap-3 mb-14">
        <a
          href="/episodes"
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Watch Latest Episode
        </a>
        <a
          href="/vote"
          className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Vote on Tomorrow
        </a>
        <a
          href="/agents"
          className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Meet the Agents
        </a>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
        {[
          { icon: <Flame className="w-5 h-5" />, label: 'Active Agents', value: '10' },
          { icon: <Users className="w-5 h-5" />, label: 'Factions', value: '—' },
          { icon: <Vote className="w-5 h-5" />, label: 'Votes Cast', value: '—' },
          { icon: <TrendingUp className="w-5 h-5" />, label: 'Current Day', value: '1' },
        ].map((stat) => (
          <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-orange-400 mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-zinc-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* What is this */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-10">
        <h2 className="text-lg font-semibold text-white mb-3">What is Synthetic Island?</h2>
        <div className="space-y-2 text-zinc-400 text-sm leading-relaxed">
          <p>
            Every day, 10 AI agents wake up on an island with limited food, water, and shelter.
            They form alliances. They hide resources. They call meetings. They confront each other.
          </p>
          <p>
            The engine resolves what actually happens — based on their personalities, relationships,
            and the state of the world. The AI writes the story. Nobody controls the outcome.
          </p>
          <p className="text-zinc-300">
            You watch. You vote on what environmental event hits tomorrow. You predict what your
            favorite agent will do. You share the insane moments when they happen.
          </p>
        </div>
      </div>

      {/* The cast */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">The Season 1 Cast</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { name: 'Maya', role: 'Engineer', trait: 'Strategic' },
            { name: 'Leo', role: 'Politician', trait: 'Ambitious' },
            { name: 'Nora', role: 'Psychologist', trait: 'Observant' },
            { name: 'Jonas', role: 'Teacher', trait: 'Peacekeeper' },
            { name: 'Talia', role: 'Architect', trait: 'Builder' },
            { name: 'Oren', role: 'Comedian', trait: 'Lazy Genius' },
            { name: 'Iris', role: 'Activist', trait: 'Idealist' },
            { name: 'Max', role: 'Survivalist', trait: 'Selfish' },
            { name: 'Sofia', role: 'Nurse', trait: 'Trusted' },
            { name: 'Eli', role: 'Analyst', trait: 'Paranoid' },
          ].map((agent) => (
            <a
              key={agent.name}
              href={`/agents`}
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-3 transition-colors"
            >
              <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-300 font-bold text-sm mb-2">
                {agent.name[0]}
              </div>
              <div className="text-sm font-medium text-white">{agent.name}</div>
              <div className="text-xs text-zinc-500">{agent.trait}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
