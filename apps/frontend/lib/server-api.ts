import 'server-only';
import type { Agent, Episode, Vote, Prediction, Relationship } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/** Fetch from the backend; returns null on any failure so pages can render fallbacks. */
async function get<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const serverApi = {
  episodes: () => get<Episode[]>('/api/episodes'),
  episode: (id: string) =>
    get<Episode & { events: unknown[]; predictions: Prediction[] }>(`/api/episodes/${id}`),
  latestEpisode: () => get<Episode>('/api/episodes/latest'),
  agents: () => get<Agent[]>('/api/agents'),
  agent: (id: string) =>
    get<Agent & { relationships: Relationship[]; memories: { content: string; importance: number }[] }>(
      `/api/agents/${id}`,
    ),
  activeVote: () => get<Vote>('/api/votes/active'),
};
