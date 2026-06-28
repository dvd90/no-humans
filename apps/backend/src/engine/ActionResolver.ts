import { Agent } from '../entities/Agent';
import { WorldState } from '../entities/WorldState';
import { Relationship } from '../entities/Relationship';

export type ActionType =
  | 'gather_food'
  | 'build_shelter'
  | 'share_information'
  | 'hide_resource'
  | 'confront_agent'
  | 'form_alliance'
  | 'call_group_meeting'
  | 'explore';

export interface ProposedAction {
  agentId: string;
  actionType: ActionType;
  targetAgentId?: string;
  reasoning: string;
  expectedEffect: string;
}

export type OutcomeType = 'success' | 'partial' | 'failure' | 'blocked';

export interface ResolvedEvent {
  agentId: string;
  actionType: ActionType;
  targetAgentId?: string;
  outcome: OutcomeType;
  description: string;
  stateDeltas: Partial<{
    food: number;
    water: number;
    shelterQuality: number;
    morale: number;
    conflictLevel: number;
  }>;
  relationshipDeltas: {
    agentAId: string;
    agentBId: string;
    trustDelta: number;
    resentmentDelta: number;
    fearDelta: number;
    respectDelta: number;
  }[];
  importance: number;
}

export class ActionResolver {
  resolve(
    action: ProposedAction,
    agent: Agent,
    allAgents: Agent[],
    worldState: WorldState,
    relationships: Relationship[],
  ): ResolvedEvent {
    if (agent.status !== 'active') {
      return this.blocked(action, `${agent.name} cannot act (status: ${agent.status})`);
    }

    if (agent.energy < 10) {
      return this.blocked(action, `${agent.name} is too exhausted to act`);
    }

    switch (action.actionType) {
      case 'gather_food':
        return this.resolveGatherFood(action, agent, worldState);
      case 'build_shelter':
        return this.resolveBuildShelter(action, agent, worldState);
      case 'share_information':
        return this.resolveShareInformation(action, agent, allAgents, relationships);
      case 'hide_resource':
        return this.resolveHideResource(action, agent, worldState);
      case 'confront_agent':
        return this.resolveConfront(action, agent, allAgents, worldState, relationships);
      case 'form_alliance':
        return this.resolveFormAlliance(action, agent, allAgents, relationships);
      case 'call_group_meeting':
        return this.resolveGroupMeeting(action, agent, worldState);
      case 'explore':
        return this.resolveExplore(action, agent, worldState);
      default:
        return this.blocked(action, 'Unknown action type');
    }
  }

  private resolveGatherFood(
    action: ProposedAction,
    agent: Agent,
    worldState: WorldState,
  ): ResolvedEvent {
    const foodAvailable = worldState.food > 20;
    const energyBonus = agent.energy > 70 ? 1 : 0.5;
    const foodGain = Math.round(5 * energyBonus);

    return {
      agentId: agent.id,
      actionType: 'gather_food',
      outcome: foodAvailable ? 'success' : 'partial',
      description: foodAvailable
        ? `${agent.name} gathered food successfully, adding ${foodGain} units to supplies.`
        : `${agent.name} searched but resources are scarce. Found very little.`,
      stateDeltas: { food: foodAvailable ? foodGain : 1 },
      relationshipDeltas: [],
      importance: 3,
    };
  }

  private resolveBuildShelter(
    action: ProposedAction,
    agent: Agent,
    worldState: WorldState,
  ): ResolvedEvent {
    const canBuild = agent.energy > 40;
    const improvement = canBuild ? Math.round(agent.energy / 20) : 0;

    return {
      agentId: agent.id,
      actionType: 'build_shelter',
      outcome: canBuild ? 'success' : 'failure',
      description: canBuild
        ? `${agent.name} worked on the shelter, improving its quality.`
        : `${agent.name} attempted to build but was too tired to make progress.`,
      stateDeltas: canBuild ? { shelterQuality: improvement, morale: 2 } : {},
      relationshipDeltas: [],
      importance: 4,
    };
  }

  private resolveShareInformation(
    action: ProposedAction,
    agent: Agent,
    allAgents: Agent[],
    relationships: Relationship[],
  ): ResolvedEvent {
    const target = allAgents.find((a) => a.id === action.targetAgentId);
    if (!target || target.status !== 'active') {
      return this.blocked(action, 'Target agent is not available');
    }

    const rel = this.getRelationship(relationships, agent.id, target.id);
    const trustBonus = rel ? Math.round(rel.trust / 20) : 2;

    return {
      agentId: agent.id,
      actionType: 'share_information',
      targetAgentId: target.id,
      outcome: 'success',
      description: `${agent.name} shared information with ${target.name}, strengthening their bond.`,
      stateDeltas: { morale: 1 },
      relationshipDeltas: [
        {
          agentAId: agent.id,
          agentBId: target.id,
          trustDelta: trustBonus,
          resentmentDelta: 0,
          fearDelta: 0,
          respectDelta: 2,
        },
      ],
      importance: 4,
    };
  }

  private resolveHideResource(
    action: ProposedAction,
    agent: Agent,
    worldState: WorldState,
  ): ResolvedEvent {
    const detectionRisk = worldState.conflictLevel > 60 ? 0.6 : 0.3;
    const detected = Math.random() < detectionRisk;

    return {
      agentId: agent.id,
      actionType: 'hide_resource',
      outcome: detected ? 'partial' : 'success',
      description: detected
        ? `${agent.name} attempted to hide resources but someone noticed.`
        : `${agent.name} secretly stashed resources away from the group.`,
      stateDeltas: {
        food: -3,
        morale: detected ? -5 : 0,
        conflictLevel: detected ? 10 : 0,
      },
      relationshipDeltas: [],
      importance: detected ? 8 : 5,
    };
  }

  private resolveConfront(
    action: ProposedAction,
    agent: Agent,
    allAgents: Agent[],
    worldState: WorldState,
    relationships: Relationship[],
  ): ResolvedEvent {
    const target = allAgents.find((a) => a.id === action.targetAgentId);
    if (!target || target.status !== 'active') {
      return this.blocked(action, 'Target agent is not available for confrontation');
    }

    const rel = this.getRelationship(relationships, agent.id, target.id);
    const agentRep = agent.publicReputation;
    const targetRep = target.publicReputation;
    const agentWins = agentRep >= targetRep;

    return {
      agentId: agent.id,
      actionType: 'confront_agent',
      targetAgentId: target.id,
      outcome: 'success',
      description: agentWins
        ? `${agent.name} publicly confronted ${target.name}. The group sided with ${agent.name}.`
        : `${agent.name} confronted ${target.name} but ${target.name} defended themselves effectively.`,
      stateDeltas: {
        conflictLevel: 15,
        morale: -5,
      },
      relationshipDeltas: [
        {
          agentAId: agent.id,
          agentBId: target.id,
          trustDelta: -15,
          resentmentDelta: 20,
          fearDelta: agentWins ? 10 : 0,
          respectDelta: agentWins ? 5 : -5,
        },
      ],
      importance: 9,
    };
  }

  private resolveFormAlliance(
    action: ProposedAction,
    agent: Agent,
    allAgents: Agent[],
    relationships: Relationship[],
  ): ResolvedEvent {
    const target = allAgents.find((a) => a.id === action.targetAgentId);
    if (!target || target.status !== 'active') {
      return this.blocked(action, 'Target agent is not available');
    }

    const rel = this.getRelationship(relationships, agent.id, target.id);
    const existingTrust = rel?.trust ?? 0;
    const accepted = existingTrust > -20;

    return {
      agentId: agent.id,
      actionType: 'form_alliance',
      targetAgentId: target.id,
      outcome: accepted ? 'success' : 'failure',
      description: accepted
        ? `${agent.name} and ${target.name} formed a secret alliance.`
        : `${agent.name} approached ${target.name} about an alliance, but was rebuffed.`,
      stateDeltas: {},
      relationshipDeltas: accepted
        ? [
            {
              agentAId: agent.id,
              agentBId: target.id,
              trustDelta: 15,
              resentmentDelta: -5,
              fearDelta: 0,
              respectDelta: 10,
            },
          ]
        : [
            {
              agentAId: agent.id,
              agentBId: target.id,
              trustDelta: -5,
              resentmentDelta: 5,
              fearDelta: 0,
              respectDelta: 0,
            },
          ],
      importance: 7,
    };
  }

  private resolveGroupMeeting(
    action: ProposedAction,
    agent: Agent,
    worldState: WorldState,
  ): ResolvedEvent {
    const rep = agent.publicReputation;
    const effective = rep > 40;

    return {
      agentId: agent.id,
      actionType: 'call_group_meeting',
      outcome: effective ? 'success' : 'partial',
      description: effective
        ? `${agent.name} called a group meeting. The colony gathered and tensions eased slightly.`
        : `${agent.name} tried to call a meeting but few listened.`,
      stateDeltas: effective
        ? { morale: 5, conflictLevel: -5 }
        : { morale: -2 },
      relationshipDeltas: [],
      importance: 6,
    };
  }

  private resolveExplore(
    action: ProposedAction,
    agent: Agent,
    worldState: WorldState,
  ): ResolvedEvent {
    const findsSomething = agent.energy > 50 && Math.random() > 0.3;

    return {
      agentId: agent.id,
      actionType: 'explore',
      outcome: findsSomething ? 'success' : 'partial',
      description: findsSomething
        ? `${agent.name} explored the island and discovered a new resource cache.`
        : `${agent.name} explored but found nothing new.`,
      stateDeltas: findsSomething ? { food: 8, water: 5 } : {},
      relationshipDeltas: [],
      importance: findsSomething ? 7 : 2,
    };
  }

  private blocked(action: ProposedAction, reason: string): ResolvedEvent {
    return {
      agentId: action.agentId,
      actionType: action.actionType,
      targetAgentId: action.targetAgentId,
      outcome: 'blocked',
      description: reason,
      stateDeltas: {},
      relationshipDeltas: [],
      importance: 1,
    };
  }

  private getRelationship(
    relationships: Relationship[],
    agentAId: string,
    agentBId: string,
  ): Relationship | undefined {
    return relationships.find(
      (r) =>
        (r.agentAId === agentAId && r.agentBId === agentBId) ||
        (r.agentAId === agentBId && r.agentBId === agentAId),
    );
  }
}
