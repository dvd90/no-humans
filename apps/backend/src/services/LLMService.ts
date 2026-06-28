import Anthropic from '@anthropic-ai/sdk';
import { Agent } from '../entities/Agent';
import { AgentMemory } from '../entities/AgentMemory';
import { Relationship } from '../entities/Relationship';
import { WorldState } from '../entities/WorldState';
import { ProposedAction } from '../engine/ActionResolver';

const SAFETY_SYSTEM_PROMPT = `You are the narrative engine for Synthetic Island, a reality show with AI characters.
Content rules — ALWAYS follow these:
- No graphic violence, sexual content, or explicit harm
- No hate speech or targeting of protected groups
- No real-world harmful instructions
- No self-harm themes
- Keep tone: Survivor + The Sims + Civilization
- Drama should be social, strategic, and emotional — not physical

All output must be valid JSON matching the schema specified in each prompt.`;

export interface EpisodeNarration {
  title: string;
  previouslySummary: string;
  summary: string;
  mainEvents: { order: number; description: string; involvedAgents: string[] }[];
  cliffhanger: string;
}

export interface GeneratedPrediction {
  question: string;
  optionA: string;
  optionB: string;
}

export class LLMService {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async generateAgentIntention(
    agent: Agent,
    worldState: WorldState,
    relationships: Relationship[],
    recentMemories: AgentMemory[],
  ): Promise<ProposedAction> {
    const relevantRelationships = relationships
      .filter((r) => r.agentAId === agent.id || r.agentBId === agent.id)
      .slice(0, 5);

    const prompt = `You are ${agent.name}, ${agent.role}.
Personality: ${agent.personality}
Goal: ${agent.goal}
Fears: ${agent.fears.join(', ')}
Values: ${agent.values.join(', ')}
Current energy: ${agent.energy}/100
Trust score: ${agent.trustScore}/100

Current world state (Day ${worldState.day}):
- Food: ${worldState.food}/100
- Water: ${worldState.water}/100
- Shelter: ${worldState.shelterQuality}/100
- Morale: ${worldState.morale}/100
- Conflict level: ${worldState.conflictLevel}/100
- Leadership: ${worldState.leadershipStructure ?? 'none'}
- Active crisis: ${worldState.activeCrisis ?? 'none'}
- Factions: ${worldState.factions.join(', ') || 'none'}

Your recent memories:
${recentMemories.map((m) => `- ${m.content}`).join('\n') || '- No significant memories yet'}

Key relationships:
${relevantRelationships.map((r) => {
  const otherId = r.agentAId === agent.id ? r.agentBId : r.agentAId;
  return `- ${otherId}: trust=${r.trust}, respect=${r.respect}, resentment=${r.resentment}`;
}).join('\n') || '- No established relationships'}

Based on your personality and the current situation, decide ONE action to take today.

Available actions: gather_food, build_shelter, share_information, hide_resource, confront_agent, form_alliance, call_group_meeting, explore

Return ONLY valid JSON:
{
  "agentId": "${agent.id}",
  "actionType": "<one of the available actions>",
  "targetAgentId": "<agent id if action targets someone, else null>",
  "reasoning": "<1-2 sentences: why this agent would do this given their personality>",
  "expectedEffect": "<what the agent hopes will happen>"
}`;

    const response = await this.client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: SAFETY_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error(`LLM returned no valid JSON for agent ${agent.name}`);

    const parsed = JSON.parse(jsonMatch[0]) as ProposedAction;
    if (!parsed.targetAgentId || parsed.targetAgentId === 'null') {
      parsed.targetAgentId = undefined;
    }
    return parsed;
  }

  async generateEpisodeNarration(
    resolvedEventDescriptions: string[],
    worldState: WorldState,
    agentNames: string[],
    previousCliffhanger: string,
  ): Promise<EpisodeNarration> {
    const prompt = `You are the narrator for Synthetic Island, a reality show with AI characters.

Day ${worldState.day} events:
${resolvedEventDescriptions.map((e, i) => `${i + 1}. ${e}`).join('\n')}

World status: Food=${worldState.food}, Conflict=${worldState.conflictLevel}, Morale=${worldState.morale}
Active crisis: ${worldState.activeCrisis ?? 'none'}
Factions: ${worldState.factions.join(', ') || 'none'}
Previous cliffhanger: ${previousCliffhanger || 'Season just started'}

Cast: ${agentNames.join(', ')}

Write a dramatic episode recap in the style of a reality show narrator. Keep it under 300 words total. Build tension. End on a cliffhanger that makes viewers want to come back.

Return ONLY valid JSON:
{
  "title": "<dramatic episode title, e.g. 'The Food Scandal'>",
  "previouslySummary": "<2-3 sentence recap of what happened before>",
  "summary": "<3-4 sentence dramatic summary of this episode>",
  "mainEvents": [
    { "order": 1, "description": "<concise dramatic description>", "involvedAgents": ["<name>"] }
  ],
  "cliffhanger": "<1-2 sentences of unresolved tension to hook viewers>"
}`;

    const response = await this.client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SAFETY_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('LLM returned no valid JSON for narration');

    return JSON.parse(jsonMatch[0]) as EpisodeNarration;
  }

  async generatePredictions(
    cliffhanger: string,
    agentNames: string[],
    worldState: WorldState,
  ): Promise<GeneratedPrediction[]> {
    const prompt = `You are generating audience prediction questions for Synthetic Island.

Current cliffhanger: ${cliffhanger}
Day: ${worldState.day}
Cast: ${agentNames.join(', ')}
Conflict level: ${worldState.conflictLevel}/100

Generate exactly 3 yes/no style prediction questions that:
1. Are objectively resolvable within 1-3 episodes
2. Create emotional investment in specific agents
3. Reference the current drama

Return ONLY valid JSON:
{
  "predictions": [
    { "question": "<will X do Y?>", "optionA": "Yes", "optionB": "No" },
    { "question": "<will X do Y?>", "optionA": "Yes", "optionB": "No" },
    { "question": "<will X do Y?>", "optionA": "Yes", "optionB": "No" }
  ]
}`;

    const response = await this.client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: SAFETY_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('LLM returned no valid JSON for predictions');

    const parsed = JSON.parse(jsonMatch[0]) as { predictions: GeneratedPrediction[] };
    return parsed.predictions;
  }
}
