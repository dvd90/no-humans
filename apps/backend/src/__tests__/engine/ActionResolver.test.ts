import { ActionResolver, ProposedAction } from '../../engine/ActionResolver';
import { Agent } from '../../entities/Agent';
import { WorldState } from '../../entities/WorldState';
import { Relationship } from '../../entities/Relationship';

function makeAgent(overrides: Partial<Agent> = {}): Agent {
  return {
    id: 'agent-1',
    worldId: 'world-1',
    name: 'TestAgent',
    role: 'Tester',
    personality: 'calm',
    goal: 'test things',
    fears: [],
    values: [],
    status: 'active',
    energy: 80,
    trustScore: 50,
    publicReputation: 50,
    createdAt: new Date(),
    updatedAt: new Date(),
    world: {} as never,
    memories: [],
    ...overrides,
  };
}

function makeWorldState(overrides: Partial<WorldState> = {}): WorldState {
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

function makeAction(overrides: Partial<ProposedAction> = {}): ProposedAction {
  return {
    agentId: 'agent-1',
    actionType: 'gather_food',
    reasoning: 'food is needed',
    expectedEffect: 'more food',
    ...overrides,
  };
}

describe('ActionResolver', () => {
  let resolver: ActionResolver;

  beforeEach(() => {
    resolver = new ActionResolver();
  });

  describe('agent status checks', () => {
    it('blocks action if agent is dead', () => {
      const agent = makeAgent({ status: 'dead' });
      const result = resolver.resolve(makeAction(), agent, [], makeWorldState(), []);
      expect(result.outcome).toBe('blocked');
    });

    it('blocks action if agent is exiled', () => {
      const agent = makeAgent({ status: 'exiled' });
      const result = resolver.resolve(makeAction(), agent, [], makeWorldState(), []);
      expect(result.outcome).toBe('blocked');
    });

    it('blocks action if agent has insufficient energy', () => {
      const agent = makeAgent({ energy: 5 });
      const result = resolver.resolve(makeAction(), agent, [], makeWorldState(), []);
      expect(result.outcome).toBe('blocked');
    });

    it('allows action if agent is active with sufficient energy', () => {
      const agent = makeAgent({ status: 'active', energy: 80 });
      const result = resolver.resolve(makeAction(), agent, [], makeWorldState(), []);
      expect(result.outcome).not.toBe('blocked');
    });
  });

  describe('gather_food', () => {
    it('succeeds when food is abundant', () => {
      const result = resolver.resolve(
        makeAction({ actionType: 'gather_food' }),
        makeAgent(),
        [],
        makeWorldState({ food: 60 }),
        [],
      );
      expect(result.outcome).toBe('success');
      expect(result.stateDeltas.food).toBeGreaterThan(0);
    });

    it('returns partial result when food is scarce', () => {
      const result = resolver.resolve(
        makeAction({ actionType: 'gather_food' }),
        makeAgent(),
        [],
        makeWorldState({ food: 10 }),
        [],
      );
      expect(result.outcome).toBe('partial');
    });
  });

  describe('build_shelter', () => {
    it('succeeds when agent has high energy', () => {
      const result = resolver.resolve(
        makeAction({ actionType: 'build_shelter' }),
        makeAgent({ energy: 90 }),
        [],
        makeWorldState(),
        [],
      );
      expect(result.outcome).toBe('success');
      expect(result.stateDeltas.shelterQuality).toBeGreaterThan(0);
    });

    it('fails when agent has low energy', () => {
      const result = resolver.resolve(
        makeAction({ actionType: 'build_shelter' }),
        makeAgent({ energy: 20 }),
        [],
        makeWorldState(),
        [],
      );
      expect(result.outcome).toBe('failure');
    });
  });

  describe('share_information', () => {
    it('succeeds when target is active', () => {
      const target = makeAgent({ id: 'agent-2', name: 'Target', status: 'active' });
      const rel: Relationship = {
        id: 'rel-1',
        worldId: 'world-1',
        agentAId: 'agent-1',
        agentBId: 'agent-2',
        trust: 30,
        fear: 0,
        respect: 40,
        resentment: 0,
        notes: null,
        updatedAt: new Date(),
      };

      const result = resolver.resolve(
        makeAction({ actionType: 'share_information', targetAgentId: 'agent-2' }),
        makeAgent(),
        [target],
        makeWorldState(),
        [rel],
      );

      expect(result.outcome).toBe('success');
      expect(result.relationshipDeltas).toHaveLength(1);
      expect(result.relationshipDeltas[0].trustDelta).toBeGreaterThan(0);
    });

    it('blocks when target is dead', () => {
      const target = makeAgent({ id: 'agent-2', name: 'Target', status: 'dead' });
      const result = resolver.resolve(
        makeAction({ actionType: 'share_information', targetAgentId: 'agent-2' }),
        makeAgent(),
        [target],
        makeWorldState(),
        [],
      );
      expect(result.outcome).toBe('blocked');
    });
  });

  describe('confront_agent', () => {
    it('increases conflict level', () => {
      const target = makeAgent({ id: 'agent-2', name: 'Leo', publicReputation: 40 });
      const result = resolver.resolve(
        makeAction({ actionType: 'confront_agent', targetAgentId: 'agent-2' }),
        makeAgent({ publicReputation: 60 }),
        [target],
        makeWorldState(),
        [],
      );
      expect(result.stateDeltas.conflictLevel).toBeGreaterThan(0);
      expect(result.importance).toBeGreaterThanOrEqual(8);
    });

    it('generates negative relationship delta', () => {
      const target = makeAgent({ id: 'agent-2', name: 'Leo', publicReputation: 40 });
      const result = resolver.resolve(
        makeAction({ actionType: 'confront_agent', targetAgentId: 'agent-2' }),
        makeAgent({ publicReputation: 60 }),
        [target],
        makeWorldState(),
        [],
      );
      expect(result.relationshipDeltas[0].trustDelta).toBeLessThan(0);
      expect(result.relationshipDeltas[0].resentmentDelta).toBeGreaterThan(0);
    });
  });

  describe('form_alliance', () => {
    it('succeeds when existing trust is non-negative', () => {
      const target = makeAgent({ id: 'agent-2', name: 'Ally' });
      const rel: Relationship = {
        id: 'rel-1',
        worldId: 'world-1',
        agentAId: 'agent-1',
        agentBId: 'agent-2',
        trust: 10,
        fear: 0,
        respect: 20,
        resentment: 5,
        notes: null,
        updatedAt: new Date(),
      };
      const result = resolver.resolve(
        makeAction({ actionType: 'form_alliance', targetAgentId: 'agent-2' }),
        makeAgent(),
        [target],
        makeWorldState(),
        [rel],
      );
      expect(result.outcome).toBe('success');
      expect(result.relationshipDeltas[0].trustDelta).toBeGreaterThan(0);
    });

    it('fails when trust is deeply negative', () => {
      const target = makeAgent({ id: 'agent-2', name: 'Enemy' });
      const rel: Relationship = {
        id: 'rel-1',
        worldId: 'world-1',
        agentAId: 'agent-1',
        agentBId: 'agent-2',
        trust: -50,
        fear: 20,
        respect: 10,
        resentment: 60,
        notes: null,
        updatedAt: new Date(),
      };
      const result = resolver.resolve(
        makeAction({ actionType: 'form_alliance', targetAgentId: 'agent-2' }),
        makeAgent(),
        [target],
        makeWorldState(),
        [rel],
      );
      expect(result.outcome).toBe('failure');
    });
  });
});
