import { SimulationService, SimulationDeps } from '../../services/SimulationService';
import { Agent } from '../../entities/Agent';
import { WorldState } from '../../entities/WorldState';
import { Relationship } from '../../entities/Relationship';
import { ProposedAction } from '../../engine/ActionResolver';

function makeAgent(id: string, name: string, overrides: Partial<Agent> = {}): Agent {
  return {
    id,
    worldId: 'world-1',
    name,
    role: 'Tester',
    personality: 'calm',
    goal: 'test',
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

function makeState(overrides: Partial<WorldState> = {}): WorldState {
  return {
    id: 'state-1',
    worldId: 'world-1',
    day: 1,
    food: 60,
    water: 70,
    shelterQuality: 30,
    morale: 60,
    conflictLevel: 20,
    leadershipStructure: null,
    factions: [],
    activeCrisis: null,
    createdAt: new Date(),
    ...overrides,
  };
}

function makeRel(a: string, b: string): Relationship {
  return {
    id: `rel-${a}-${b}`,
    worldId: 'world-1',
    agentAId: a,
    agentBId: b,
    trust: 10,
    fear: 0,
    respect: 20,
    resentment: 0,
    notes: null,
    updatedAt: new Date(),
  };
}

function makeDeps(agents: Agent[], state: WorldState, rels: Relationship[]): SimulationDeps {
  return {
    llm: {
      generateAgentIntention: jest.fn(async (agent: Agent): Promise<ProposedAction> => ({
        agentId: agent.id,
        actionType: 'gather_food',
        reasoning: 'hungry',
        expectedEffect: 'more food',
      })),
      generateEpisodeNarration: jest.fn(async () => ({
        title: 'The First Day',
        previouslySummary: 'The season begins.',
        summary: 'Everyone gathered food.',
        mainEvents: [{ order: 1, description: 'Food gathered', involvedAgents: ['A'] }],
        cliffhanger: 'But supplies are dwindling...',
      })),
      generatePredictions: jest.fn(async () => [
        { question: 'Will food run out?', optionA: 'Yes', optionB: 'No' },
        { question: 'Will Leo lead?', optionA: 'Yes', optionB: 'No' },
        { question: 'Will Maya confront?', optionA: 'Yes', optionB: 'No' },
      ]),
    },
    loadWorldState: jest.fn(async () => state),
    loadAgents: jest.fn(async () => agents),
    loadRelationships: jest.fn(async () => rels),
    loadRecentMemories: jest.fn(async () => []),
    getWinningVoteEffect: jest.fn(async () => null),
  };
}

describe('SimulationService', () => {
  it('generates one intention per active agent', async () => {
    const agents = [makeAgent('a1', 'Maya'), makeAgent('a2', 'Leo')];
    const deps = makeDeps(agents, makeState(), [makeRel('a1', 'a2')]);
    const service = new SimulationService(deps);

    const result = await service.generateEpisode('world-1');

    expect(deps.llm.generateAgentIntention).toHaveBeenCalledTimes(2);
    expect(result.resolvedEvents).toHaveLength(2);
  });

  it('skips dead and exiled agents entirely', async () => {
    const agents = [
      makeAgent('a1', 'Maya'),
      makeAgent('a2', 'Leo', { status: 'dead' }),
      makeAgent('a3', 'Nora', { status: 'exiled' }),
    ];
    const deps = makeDeps(agents, makeState(), []);
    const service = new SimulationService(deps);

    const result = await service.generateEpisode('world-1');

    expect(deps.llm.generateAgentIntention).toHaveBeenCalledTimes(1);
    expect(result.resolvedEvents).toHaveLength(1);
  });

  it('advances the world state day by 1', async () => {
    const deps = makeDeps([makeAgent('a1', 'Maya')], makeState({ day: 4 }), []);
    const service = new SimulationService(deps);

    const result = await service.generateEpisode('world-1');

    expect(result.newWorldState.day).toBe(5);
  });

  it('applies environmental decay plus action deltas to world state', async () => {
    // gather_food success (+5 with high energy) then decay (-3) → net +2
    const deps = makeDeps([makeAgent('a1', 'Maya', { energy: 80 })], makeState({ food: 50 }), []);
    const service = new SimulationService(deps);

    const result = await service.generateEpisode('world-1');

    expect(result.newWorldState.food).toBe(52);
  });

  it('produces narration and 3 predictions', async () => {
    const deps = makeDeps([makeAgent('a1', 'Maya')], makeState(), []);
    const service = new SimulationService(deps);

    const result = await service.generateEpisode('world-1');

    expect(result.narration.title).toBe('The First Day');
    expect(result.narration.cliffhanger).toBeTruthy();
    expect(result.predictions).toHaveLength(3);
  });

  it('applies the winning vote effect to state before actions', async () => {
    const deps = makeDeps([makeAgent('a1', 'Maya')], makeState({ morale: 60 }), []);
    deps.getWinningVoteEffect = jest.fn(async () => ({
      description: 'Heavy storm',
      stateDeltas: { morale: -10, shelterQuality: -15 },
    }));
    const service = new SimulationService(deps);

    const result = await service.generateEpisode('world-1');

    expect(result.newWorldState.morale).toBe(50); // 60 - 10 storm; gather_food has no morale delta
    expect(result.newWorldState.shelterQuality).toBe(15);
    expect(result.appliedVoteEffect?.description).toBe('Heavy storm');
  });

  it('returns updated relationships when actions produce deltas', async () => {
    const agents = [makeAgent('a1', 'Maya'), makeAgent('a2', 'Leo')];
    const rels = [makeRel('a1', 'a2')];
    const deps = makeDeps(agents, makeState(), rels);
    (deps.llm.generateAgentIntention as jest.Mock).mockImplementation(
      async (agent: Agent): Promise<ProposedAction> => ({
        agentId: agent.id,
        actionType: agent.id === 'a1' ? 'share_information' : 'gather_food',
        targetAgentId: agent.id === 'a1' ? 'a2' : undefined,
        reasoning: 'x',
        expectedEffect: 'y',
      }),
    );
    const service = new SimulationService(deps);

    const result = await service.generateEpisode('world-1');

    const rel = result.updatedRelationships.find(
      (r) => r.agentAId === 'a1' && r.agentBId === 'a2',
    );
    expect(rel).toBeDefined();
    expect(rel!.trust).toBeGreaterThan(10);
  });

  it('continues the episode when one agent intention fails', async () => {
    const agents = [makeAgent('a1', 'Maya'), makeAgent('a2', 'Leo')];
    const deps = makeDeps(agents, makeState(), []);
    (deps.llm.generateAgentIntention as jest.Mock)
      .mockRejectedValueOnce(new Error('LLM timeout'))
      .mockImplementation(async (agent: Agent): Promise<ProposedAction> => ({
        agentId: agent.id,
        actionType: 'gather_food',
        reasoning: 'x',
        expectedEffect: 'y',
      }));
    const service = new SimulationService(deps);

    const result = await service.generateEpisode('world-1');

    expect(result.resolvedEvents).toHaveLength(1);
    expect(result.failedAgentIds).toEqual(['a1']);
  });
});
