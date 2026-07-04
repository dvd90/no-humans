import { AnthropicProvider } from './AnthropicProvider';
import { OpenAICompatProvider } from './OpenAICompatProvider';
import { ChatProvider, ProviderConfig, providerConfigFromEnv } from './Provider';

export { ChatProvider, ProviderConfig, providerConfigFromEnv };
export { AnthropicProvider } from './AnthropicProvider';
export { OpenAICompatProvider } from './OpenAICompatProvider';

export function createProvider(config: ProviderConfig): ChatProvider {
  if (config.provider === 'anthropic') {
    return new AnthropicProvider(config.apiKey, config.model);
  }
  return new OpenAICompatProvider(config.apiKey, config.model, config.baseUrl!);
}

export function createProviderFromEnv(env: NodeJS.ProcessEnv = process.env): ChatProvider {
  return createProvider(providerConfigFromEnv(env));
}
