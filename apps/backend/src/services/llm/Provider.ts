/**
 * Minimal chat-completion surface every LLM provider must implement.
 * Keeps the rest of the codebase provider-agnostic so we can swap
 * Anthropic for cheaper OpenAI-compatible APIs (Grok/xAI, DeepSeek, ...).
 */
export interface ChatProvider {
  readonly name: string;
  complete(opts: {
    system: string;
    prompt: string;
    maxTokens: number;
  }): Promise<string>;
}

export interface ProviderConfig {
  provider: 'anthropic' | 'openai-compatible';
  apiKey: string;
  model: string;
  /** Required for openai-compatible providers, e.g. https://api.x.ai/v1 */
  baseUrl?: string;
}

export function providerConfigFromEnv(env: NodeJS.ProcessEnv = process.env): ProviderConfig {
  const provider = (env.LLM_PROVIDER ?? 'anthropic') as ProviderConfig['provider'];

  if (provider === 'anthropic') {
    const apiKey = env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is required for the anthropic provider');
    return {
      provider,
      apiKey,
      model: env.LLM_MODEL ?? 'claude-haiku-4-5-20251001',
    };
  }

  if (provider === 'openai-compatible') {
    const apiKey = env.LLM_API_KEY;
    if (!apiKey) throw new Error('LLM_API_KEY is required for openai-compatible providers');
    const baseUrl = env.LLM_BASE_URL;
    if (!baseUrl) throw new Error('LLM_BASE_URL is required for openai-compatible providers (e.g. https://api.x.ai/v1)');
    const model = env.LLM_MODEL;
    if (!model) throw new Error('LLM_MODEL is required for openai-compatible providers (e.g. grok-3-mini)');
    return { provider, apiKey, model, baseUrl };
  }

  throw new Error(`Unknown LLM_PROVIDER: ${provider}. Use "anthropic" or "openai-compatible".`);
}
