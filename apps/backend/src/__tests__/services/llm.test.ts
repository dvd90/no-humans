import {
  providerConfigFromEnv,
  createProvider,
  OpenAICompatProvider,
} from '../../services/llm';
import { LLMService, extractJson } from '../../services/LLMService';
import { ChatProvider } from '../../services/llm/Provider';
import { Agent } from '../../entities/Agent';
import { WorldState } from '../../entities/WorldState';

describe('providerConfigFromEnv', () => {
  it('defaults to anthropic with haiku model', () => {
    const config = providerConfigFromEnv({ ANTHROPIC_API_KEY: 'sk-ant-test' } as NodeJS.ProcessEnv);
    expect(config.provider).toBe('anthropic');
    expect(config.model).toBe('claude-haiku-4-5-20251001');
  });

  it('throws when anthropic key is missing', () => {
    expect(() => providerConfigFromEnv({} as NodeJS.ProcessEnv)).toThrow(/ANTHROPIC_API_KEY/);
  });

  it('configures grok via openai-compatible', () => {
    const config = providerConfigFromEnv({
      LLM_PROVIDER: 'openai-compatible',
      LLM_API_KEY: 'xai-test',
      LLM_BASE_URL: 'https://api.x.ai/v1',
      LLM_MODEL: 'grok-3-mini',
    } as NodeJS.ProcessEnv);
    expect(config.provider).toBe('openai-compatible');
    expect(config.baseUrl).toBe('https://api.x.ai/v1');
    expect(config.model).toBe('grok-3-mini');
  });

  it('requires base url and model for openai-compatible', () => {
    expect(() =>
      providerConfigFromEnv({
        LLM_PROVIDER: 'openai-compatible',
        LLM_API_KEY: 'xai-test',
      } as NodeJS.ProcessEnv),
    ).toThrow(/LLM_BASE_URL/);
  });

  it('rejects unknown providers', () => {
    expect(() =>
      providerConfigFromEnv({ LLM_PROVIDER: 'banana' } as NodeJS.ProcessEnv),
    ).toThrow(/Unknown LLM_PROVIDER/);
  });
});

describe('createProvider', () => {
  it('creates an OpenAICompatProvider for grok config', () => {
    const provider = createProvider({
      provider: 'openai-compatible',
      apiKey: 'xai-test',
      model: 'grok-3-mini',
      baseUrl: 'https://api.x.ai/v1',
    });
    expect(provider).toBeInstanceOf(OpenAICompatProvider);
    expect(provider.name).toContain('api.x.ai');
  });
});

describe('OpenAICompatProvider', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('posts an OpenAI-shaped request and extracts the reply', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: '{"ok":true}' } }] }),
    });

    const provider = new OpenAICompatProvider('xai-test', 'grok-3-mini', 'https://api.x.ai/v1');
    const text = await provider.complete({ system: 'sys', prompt: 'hi', maxTokens: 100 });

    expect(text).toBe('{"ok":true}');
    const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('https://api.x.ai/v1/chat/completions');
    const body = JSON.parse(init.body);
    expect(body.model).toBe('grok-3-mini');
    expect(body.messages[0]).toEqual({ role: 'system', content: 'sys' });
    expect(init.headers.Authorization).toBe('Bearer xai-test');
  });

  it('throws a readable error on API failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: async () => 'rate limited',
    });

    const provider = new OpenAICompatProvider('xai-test', 'grok-3-mini', 'https://api.x.ai/v1');
    await expect(
      provider.complete({ system: 's', prompt: 'p', maxTokens: 10 }),
    ).rejects.toThrow(/429.*rate limited/);
  });
});

describe('extractJson', () => {
  it('parses a clean JSON reply', () => {
    expect(extractJson<{ a: number }>('{"a":1}', 'test')).toEqual({ a: 1 });
  });

  it('parses JSON wrapped in markdown fences and prose', () => {
    const reply = 'Sure! Here is the JSON:\n```json\n{"a":1}\n```\nHope that helps.';
    expect(extractJson<{ a: number }>(reply, 'test')).toEqual({ a: 1 });
  });

  it('throws with context when there is no JSON', () => {
    expect(() => extractJson('no json here', 'agent Maya')).toThrow(/agent Maya/);
  });
});

describe('LLMService with a fake provider', () => {
  const agent = {
    id: 'a1',
    name: 'Maya',
    role: 'Engineer',
    personality: 'strategic',
    goal: 'order',
    fears: ['chaos'],
    values: ['order'],
    energy: 80,
    trustScore: 50,
    status: 'active',
  } as unknown as Agent;

  const state = {
    day: 1,
    food: 60,
    water: 70,
    shelterQuality: 30,
    morale: 60,
    conflictLevel: 20,
    leadershipStructure: null,
    factions: [],
    activeCrisis: null,
  } as unknown as WorldState;

  it('injects the safety system prompt into every call', async () => {
    const complete = jest.fn().mockResolvedValue(
      JSON.stringify({ agentId: 'a1', actionType: 'gather_food', reasoning: 'r', expectedEffect: 'e' }),
    );
    const fake: ChatProvider = { name: 'fake', complete };
    const service = new LLMService(fake);

    await service.generateAgentIntention(agent, state, [], []);

    expect(complete).toHaveBeenCalledTimes(1);
    expect(complete.mock.calls[0][0].system).toMatch(/No graphic violence/);
  });

  it('normalizes "null" targetAgentId to undefined', async () => {
    const fake: ChatProvider = {
      name: 'fake',
      complete: jest.fn().mockResolvedValue(
        JSON.stringify({
          agentId: 'a1',
          actionType: 'gather_food',
          targetAgentId: 'null',
          reasoning: 'r',
          expectedEffect: 'e',
        }),
      ),
    };
    const service = new LLMService(fake);
    const action = await service.generateAgentIntention(agent, state, [], []);
    expect(action.targetAgentId).toBeUndefined();
  });
});
