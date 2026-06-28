import axios from 'axios';
import type { Agent, Episode, Vote, Prediction, WorldState } from './types';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const client = axios.create({ baseURL: apiUrl });

export const api = {
  agents: {
    list: () => client.get<Agent[]>('/api/agents').then((r) => r.data),
    get: (id: string) => client.get<Agent & { relationships: unknown[]; memories: unknown[] }>(`/api/agents/${id}`).then((r) => r.data),
  },
  episodes: {
    list: () => client.get<Episode[]>('/api/episodes').then((r) => r.data),
    latest: () => client.get<Episode>('/api/episodes/latest').then((r) => r.data),
    get: (id: string) => client.get<Episode & { events: unknown[]; predictions: Prediction[] }>(`/api/episodes/${id}`).then((r) => r.data),
  },
  votes: {
    active: () => client.get<Vote>('/api/votes/active').then((r) => r.data),
    cast: (voteId: string, option: 'A' | 'B' | 'C' | 'D') =>
      client.post<{ success: boolean; vote: Vote }>(`/api/votes/${voteId}/cast`, { option }).then((r) => r.data),
  },
  worlds: {
    get: (id: string) => client.get<{ currentState: WorldState }>(`/api/worlds/${id}`).then((r) => r.data),
  },
};
