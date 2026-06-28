export type AgentStatus = 'active' | 'injured' | 'exiled' | 'dead';

export interface Agent {
  id: string;
  worldId: string;
  name: string;
  role: string;
  personality: string;
  goal: string;
  fears: string[];
  values: string[];
  status: AgentStatus;
  energy: number;
  trustScore: number;
  publicReputation: number;
  createdAt: string;
  updatedAt: string;
}

export interface Relationship {
  id: string;
  agentAId: string;
  agentBId: string;
  trust: number;
  fear: number;
  respect: number;
  resentment: number;
  notes: string | null;
}

export interface WorldState {
  id: string;
  worldId: string;
  day: number;
  food: number;
  water: number;
  shelterQuality: number;
  morale: number;
  conflictLevel: number;
  leadershipStructure: string | null;
  factions: string[];
  activeCrisis: string | null;
  createdAt: string;
}

export interface MainEvent {
  order: number;
  description: string;
  involvedAgents: string[];
}

export interface Episode {
  id: string;
  worldId: string;
  seasonId: string;
  number: number;
  title: string;
  previouslySummary: string;
  summary: string;
  mainEvents: MainEvent[];
  cliffhanger: string;
  status: 'draft' | 'published';
  publishedAt: string | null;
  createdAt: string;
}

export interface Prediction {
  id: string;
  episodeId: string;
  question: string;
  optionA: string;
  optionB: string;
  correctAnswer: 'A' | 'B' | null;
  resolvedAt: string | null;
  createdAt: string;
}

export interface Vote {
  id: string;
  worldId: string;
  episodeId: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  votesA: number;
  votesB: number;
  votesC: number;
  votesD: number;
  winnerId: 'A' | 'B' | 'C' | 'D' | null;
  closesAt: string;
  createdAt: string;
}
