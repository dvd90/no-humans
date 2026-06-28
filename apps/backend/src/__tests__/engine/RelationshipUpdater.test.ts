import { applyRelationshipDeltas } from '../../engine/RelationshipUpdater';
import { Relationship } from '../../entities/Relationship';
import { ResolvedEvent } from '../../engine/ActionResolver';

function makeRelationship(agentAId: string, agentBId: string, overrides: Partial<Relationship> = {}): Relationship {
  return {
    id: `rel-${agentAId}-${agentBId}`,
    worldId: 'world-1',
    agentAId,
    agentBId,
    trust: 0,
    fear: 0,
    respect: 0,
    resentment: 0,
    notes: null,
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeEventWithDelta(
  agentAId: string,
  agentBId: string,
  trustDelta: number,
  resentmentDelta = 0,
  fearDelta = 0,
  respectDelta = 0,
): ResolvedEvent {
  return {
    agentId: agentAId,
    actionType: 'confront_agent',
    outcome: 'success',
    description: 'test',
    stateDeltas: {},
    relationshipDeltas: [{ agentAId, agentBId, trustDelta, resentmentDelta, fearDelta, respectDelta }],
    importance: 5,
  };
}

describe('applyRelationshipDeltas', () => {
  it('applies trust delta correctly', () => {
    const rels = [makeRelationship('a', 'b', { trust: 20 })];
    const events = [makeEventWithDelta('a', 'b', 15)];
    const result = applyRelationshipDeltas(rels, events);
    expect(result.find((r) => r.agentAId === 'a' && r.agentBId === 'b')?.trust).toBe(35);
  });

  it('applies delta regardless of pair direction', () => {
    const rels = [makeRelationship('a', 'b', { trust: 20 })];
    const events = [makeEventWithDelta('b', 'a', 10)];
    const result = applyRelationshipDeltas(rels, events);
    expect(result.find((r) => r.agentAId === 'a' && r.agentBId === 'b')?.trust).toBe(30);
  });

  it('clamps trust at 100', () => {
    const rels = [makeRelationship('a', 'b', { trust: 90 })];
    const events = [makeEventWithDelta('a', 'b', 20)];
    const result = applyRelationshipDeltas(rels, events);
    expect(result.find((r) => r.agentAId === 'a')?.trust).toBe(100);
  });

  it('clamps trust at -100', () => {
    const rels = [makeRelationship('a', 'b', { trust: -90 })];
    const events = [makeEventWithDelta('a', 'b', -20)];
    const result = applyRelationshipDeltas(rels, events);
    expect(result.find((r) => r.agentAId === 'a')?.trust).toBe(-100);
  });

  it('clamps resentment at 100', () => {
    const rels = [makeRelationship('a', 'b', { resentment: 90 })];
    const events = [makeEventWithDelta('a', 'b', 0, 20)];
    const result = applyRelationshipDeltas(rels, events);
    expect(result.find((r) => r.agentAId === 'a')?.resentment).toBe(100);
  });

  it('does not mutate original relationships', () => {
    const rels = [makeRelationship('a', 'b', { trust: 20 })];
    applyRelationshipDeltas(rels, [makeEventWithDelta('a', 'b', 15)]);
    expect(rels[0].trust).toBe(20);
  });

  it('skips delta if relationship pair is not found', () => {
    const rels = [makeRelationship('a', 'b')];
    const events = [makeEventWithDelta('x', 'y', 50)];
    const result = applyRelationshipDeltas(rels, events);
    expect(result[0].trust).toBe(0);
  });
});
