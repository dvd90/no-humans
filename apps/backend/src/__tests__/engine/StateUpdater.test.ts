import { applyStateDeltasToWorldState, applyEnvironmentalDecay } from '../../engine/StateUpdater';
import { WorldState } from '../../entities/WorldState';
import { ResolvedEvent } from '../../engine/ActionResolver';

function makeState(overrides: Partial<WorldState> = {}): WorldState {
  return {
    id: 'state-1',
    worldId: 'world-1',
    day: 5,
    food: 60,
    water: 70,
    shelterQuality: 40,
    morale: 60,
    conflictLevel: 30,
    leadershipStructure: null,
    factions: [],
    activeCrisis: null,
    createdAt: new Date(),
    ...overrides,
  };
}

function makeEvent(stateDeltas: ResolvedEvent['stateDeltas']): ResolvedEvent {
  return {
    agentId: 'agent-1',
    actionType: 'gather_food',
    outcome: 'success',
    description: 'test',
    stateDeltas,
    relationshipDeltas: [],
    importance: 3,
  };
}

describe('applyStateDeltasToWorldState', () => {
  it('adds food delta to world state', () => {
    const state = makeState({ food: 50 });
    const result = applyStateDeltasToWorldState(state, [makeEvent({ food: 10 })]);
    expect(result.food).toBe(60);
  });

  it('clamps food at 100 maximum', () => {
    const state = makeState({ food: 95 });
    const result = applyStateDeltasToWorldState(state, [makeEvent({ food: 20 })]);
    expect(result.food).toBe(100);
  });

  it('clamps food at 0 minimum', () => {
    const state = makeState({ food: 5 });
    const result = applyStateDeltasToWorldState(state, [makeEvent({ food: -20 })]);
    expect(result.food).toBe(0);
  });

  it('accumulates deltas from multiple events', () => {
    const state = makeState({ food: 50, morale: 50 });
    const events = [
      makeEvent({ food: 10, morale: 5 }),
      makeEvent({ food: -3, conflictLevel: 8 }),
    ];
    const result = applyStateDeltasToWorldState(state, events);
    expect(result.food).toBe(57);
    expect(result.morale).toBe(55);
    expect(result.conflictLevel).toBe(38);
  });

  it('does not mutate original state', () => {
    const state = makeState({ food: 50 });
    applyStateDeltasToWorldState(state, [makeEvent({ food: 10 })]);
    expect(state.food).toBe(50);
  });
});

describe('applyEnvironmentalDecay', () => {
  it('reduces food by 3 each day', () => {
    const state = makeState({ food: 50 });
    const result = applyEnvironmentalDecay(state);
    expect(result.food).toBe(47);
  });

  it('reduces water by 2 each day', () => {
    const state = makeState({ water: 60 });
    const result = applyEnvironmentalDecay(state);
    expect(result.water).toBe(58);
  });

  it('does not reduce below 0', () => {
    const state = makeState({ food: 2, water: 1 });
    const result = applyEnvironmentalDecay(state);
    expect(result.food).toBe(0);
    expect(result.water).toBe(0);
  });
});
