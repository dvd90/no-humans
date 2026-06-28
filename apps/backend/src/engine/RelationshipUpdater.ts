import { Relationship } from '../entities/Relationship';
import { ResolvedEvent } from './ActionResolver';

export function applyRelationshipDeltas(
  relationships: Relationship[],
  events: ResolvedEvent[],
): Relationship[] {
  const map = new Map<string, Relationship>();
  for (const rel of relationships) {
    map.set(pairKey(rel.agentAId, rel.agentBId), { ...rel });
  }

  for (const event of events) {
    for (const delta of event.relationshipDeltas) {
      const key = pairKey(delta.agentAId, delta.agentBId);
      const rel = map.get(key);
      if (!rel) continue;

      rel.trust = clamp(rel.trust + delta.trustDelta, -100, 100);
      rel.resentment = clamp(rel.resentment + delta.resentmentDelta, 0, 100);
      rel.fear = clamp(rel.fear + delta.fearDelta, 0, 100);
      rel.respect = clamp(rel.respect + delta.respectDelta, 0, 100);
      map.set(key, rel);
    }
  }

  return Array.from(map.values());
}

function pairKey(a: string, b: string): string {
  return [a, b].sort().join(':');
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
