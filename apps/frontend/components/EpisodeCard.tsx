import type { Episode } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  episode: Episode;
}

export function EpisodeCard({ episode }: Props) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-5 transition-colors">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-medium">
          Episode {episode.number}
        </span>
        {episode.publishedAt && (
          <span className="text-xs text-zinc-600">
            {formatDistanceToNow(new Date(episode.publishedAt), { addSuffix: true })}
          </span>
        )}
      </div>
      <h3 className="font-semibold text-white text-lg mb-2">{episode.title}</h3>
      <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{episode.summary}</p>
      {episode.cliffhanger && (
        <div className="border-l-2 border-orange-500 pl-3">
          <p className="text-sm text-orange-300 italic">{episode.cliffhanger}</p>
        </div>
      )}
    </div>
  );
}
