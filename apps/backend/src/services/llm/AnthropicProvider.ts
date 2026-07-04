import Anthropic from '@anthropic-ai/sdk';
import { ChatProvider } from './Provider';

export class AnthropicProvider implements ChatProvider {
  readonly name = 'anthropic';
  private client: Anthropic;

  constructor(
    apiKey: string,
    private model: string,
  ) {
    this.client = new Anthropic({ apiKey });
  }

  async complete(opts: { system: string; prompt: string; maxTokens: number }): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: opts.maxTokens,
      system: opts.system,
      messages: [{ role: 'user', content: opts.prompt }],
    });
    const block = response.content[0];
    return block.type === 'text' ? block.text : '';
  }
}
