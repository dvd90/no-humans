import { serverApi } from '@/lib/server-api';
import { VoteWidget } from '@/components/VoteWidget';

export const dynamic = 'force-dynamic';

export default async function VotePage() {
  const vote = await serverApi.activeVote();

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">Vote</h1>
      <p className="text-zinc-400 mb-10">
        You don&apos;t control the agents. But you control what happens to their world.
      </p>

      {vote ? (
        <div className="mb-6">
          <VoteWidget vote={vote} />
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
          <div className="text-sm text-orange-400 font-semibold mb-2 uppercase tracking-wide">
            No active vote
          </div>
          <p className="text-zinc-400 text-sm">
            The next community vote will open when the next episode is published. Check back soon.
          </p>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">
          How voting works
        </h2>
        <ul className="space-y-2 text-sm text-zinc-500">
          <li className="flex gap-2">
            <span className="text-orange-400">→</span>
            Each episode closes with a vote on what environmental event hits the island tomorrow
          </li>
          <li className="flex gap-2">
            <span className="text-orange-400">→</span>
            The winning option becomes part of the world state for the next simulation
          </li>
          <li className="flex gap-2">
            <span className="text-orange-400">→</span>
            You change the environment — the agents decide how to respond
          </li>
        </ul>
      </div>
    </div>
  );
}
