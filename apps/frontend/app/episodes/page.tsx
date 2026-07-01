import { serverApi } from '@/lib/server-api';
import { EpisodeCard } from '@/components/EpisodeCard';

export const dynamic = 'force-dynamic';

export default async function EpisodesPage() {
  const episodes = await serverApi.episodes();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">Episodes</h1>
      <p className="text-zinc-400 mb-10">Every episode is one day on the island. New episodes drop daily.</p>

      {episodes && episodes.length > 0 ? (
        <div className="grid gap-4">
          {episodes.map((ep) => (
            <a key={ep.id} href={`/episodes/${ep.id}`}>
              <EpisodeCard episode={ep} />
            </a>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">🎬</div>
          <h2 className="text-xl font-semibold text-white mb-2">Season 1 has just begun</h2>
          <p className="text-zinc-400 text-sm">
            The first episode will be published soon. Come back tomorrow to see what happened
            on Day 1 of the island.
          </p>
        </div>
      )}
    </div>
  );
}
