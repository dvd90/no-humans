import { ChatProvider } from './Provider';

/**
 * Works with any OpenAI-compatible chat completions API:
 * Grok/xAI (https://api.x.ai/v1), OpenAI, DeepSeek, Together, Groq, Ollama...
 * Uses plain fetch so no extra SDK dependency is needed.
 */
export class OpenAICompatProvider implements ChatProvider {
  readonly name: string;

  constructor(
    private apiKey: string,
    private model: string,
    private baseUrl: string,
  ) {
    this.name = `openai-compatible(${new URL(baseUrl).hostname})`;
  }

  async complete(opts: { system: string; prompt: string; maxTokens: number }): Promise<string> {
    const res = await fetch(`${this.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: opts.maxTokens,
        messages: [
          { role: 'system', content: opts.system },
          { role: 'user', content: opts.prompt },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`LLM API error ${res.status}: ${body.slice(0, 500)}`);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content ?? '';
  }
}
