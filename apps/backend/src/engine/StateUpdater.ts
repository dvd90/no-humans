import { WorldState } from '../entities/WorldState';
import { ResolvedEvent } from './ActionResolver';

export function applyStateDeltasToWorldState(
  state: WorldState,
  events: ResolvedEvent[],
): WorldState {
  const updated = { ...state };

  for (const event of events) {
    const d = event.stateDeltas;
    if (d.food !== undefined) updated.food = clamp(updated.food + d.food, 0, 100);
    if (d.water !== undefined) updated.water = clamp(updated.water + d.water, 0, 100);
    if (d.shelterQuality !== undefined)
      updated.shelterQuality = clamp(updated.shelterQuality + d.shelterQuality, 0, 100);
    if (d.morale !== undefined) updated.morale = clamp(updated.morale + d.morale, 0, 100);
    if (d.conflictLevel !== undefined)
      updated.conflictLevel = clamp(updated.conflictLevel + d.conflictLevel, 0, 100);
  }

  return updated;
}

export function applyEnvironmentalDecay(state: WorldState): WorldState {
  return {
    ...state,
    food: clamp(state.food - 3, 0, 100),
    water: clamp(state.water - 2, 0, 100),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
