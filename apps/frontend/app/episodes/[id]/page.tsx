import { notFound } from 'next/navigation';
import { serverApi } from '@/lib/server-api';

export const dynamic = 'force-dynamic';

export default async function EpisodePage({ params }: { params: { id: string } }) {
  const episode = await serverApi.episode(params.id);
  if (!episode) notFound();

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="text-sm text-orange-400 font-semibold mb-2">
        Episode {episode.number}
      </div>
      <h1 className="text-4xl font-bold text-white mb-8">{episode.title}</h1>

      {episode.previouslySummary && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-2">
            Previously
          </h2>
          <p className="text-zinc-400">{episode.previouslySummary}</p>
        </section>
      )}

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-2">
          This Episode
        </h2>
        <p className="text-zinc-200 text-lg leading-relaxed">{episode.summary}</p>
      </section>

      {episode.mainEvents?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">
            Main Events
          </h2>
          <ol className="space-y-3">
            {episode.mainEvents.map((event) => (
              <li key={event.order} className="flex gap-3">
                <span className="text-orange-400 font-bold shrink-0">{event.order}.</span>
                <div>
                  <p className="text-zinc-300">{event.description}</p>
                  {event.involvedAgents?.length > 0 && (
                    <p className="text-xs text-zinc-600 mt-1">
                      {event.involvedAgents.join(' · ')}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {episode.cliffhanger && (
        <section className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-5 mb-8">
          <h2 className="text-sm font-semibold text-orange-400 uppercase tracking-wide mb-2">
            Cliffhanger
          </h2>
          <p className="text-orange-200 italic text-lg">{episode.cliffhanger}</p>
        </section>
      )}

      {episode.predictions?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">
            Predictions
          </h2>
          <div className="space-y-3">
            {episode.predictions.map((p) => (
              <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <p className="text-zinc-200 mb-2">{p.question}</p>
                <div className="flex gap-2 text-sm">
                  <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full">
                    {p.optionA}
                  </span>
                  <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full">
                    {p.optionB}
                  </span>
                  {p.correctAnswer && (
                    <span className="bg-green-900/40 text-green-400 px-3 py-1 rounded-full">
                      Resolved: {p.correctAnswer === 'A' ? p.optionA : p.optionB}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="flex gap-3">
        <a
          href="/episodes"
          className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 px-5 py-2.5 rounded-lg text-sm transition-colors"
        >
          ← All Episodes
        </a>
        <a
          href="/vote"
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          Vote on Tomorrow →
        </a>
      </div>
    </div>
  );
}
