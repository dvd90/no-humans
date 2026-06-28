import { Agent } from '../entities/Agent';
import { Relationship } from '../entities/Relationship';

export interface AgentSeed {
  name: string;
  role: string;
  personality: string;
  goal: string;
  fears: string[];
  values: string[];
}

export const SEASON_1_AGENTS: AgentSeed[] = [
  {
    name: 'Maya',
    role: 'Former engineer',
    personality: 'Strategic and skeptical. Hates chaos and will lie to prevent it. Loyal once trust is deeply earned, but slow to give it.',
    goal: 'Build a stable, functional society with clear rules and roles.',
    fears: ['losing control of the group', 'being betrayed by someone she trusted'],
    values: ['order', 'competence', 'long-term thinking'],
  },
  {
    name: 'Leo',
    role: 'Ex-politician',
    personality: 'Charismatic and ambitious. Craves control and status. Excellent at reading people but panics under public pressure when exposed.',
    goal: 'Become the unchallenged leader of the island.',
    fears: ['public humiliation', 'being seen as weak'],
    values: ['power', 'loyalty from subordinates', 'winning'],
  },
  {
    name: 'Nora',
    role: 'Psychologist',
    personality: 'Quiet and observant. Appears supportive and harmless but is secretly manipulative, using others\' vulnerabilities strategically.',
    goal: 'Survive by making herself indispensable to whoever holds power.',
    fears: ['being truly seen through', 'isolation'],
    values: ['information', 'influence', 'self-preservation'],
  },
  {
    name: 'Jonas',
    role: 'Teacher',
    personality: 'Sincere peacekeeper who avoids conflict at all costs. Everyone uses him as a messenger because he is safe. Underestimates his own influence.',
    goal: 'Keep everyone alive and together, even if it means carrying everyone\'s burdens.',
    fears: ['group collapse', 'having to choose sides'],
    values: ['community', 'fairness', 'harmony'],
  },
  {
    name: 'Talia',
    role: 'Architect',
    personality: 'Practically minded builder. Gets things done and has zero patience for drama or politics. Respected for her competence, underestimated emotionally.',
    goal: 'Build a shelter good enough to survive anything.',
    fears: ['incompetence getting people killed', 'wasted effort'],
    values: ['efficiency', 'practicality', 'honest work'],
  },
  {
    name: 'Oren',
    role: 'Comedian',
    personality: 'Funny, charming, and deliberately lazy. Uses humor to deflect, build alliances, and avoid responsibility. More socially powerful than he appears.',
    goal: 'Skate through on personality and get others to do the hard work.',
    fears: ['having to be serious', 'being disliked'],
    values: ['fun', 'social capital', 'freedom from obligation'],
  },
  {
    name: 'Iris',
    role: 'Activist',
    personality: 'Passionate idealist who wants democracy and fairness above all. Clashes constantly with pragmatists and realists. Principled to the point of self-sabotage.',
    goal: 'Create a democratic system where every voice is heard equally.',
    fears: ['authoritarianism', 'moral compromise'],
    values: ['equality', 'transparency', 'justice'],
  },
  {
    name: 'Max',
    role: 'Survivalist',
    personality: 'Highly resourceful and competent outdoorsman. Cooperative when it serves him, ruthlessly selfish when under real pressure. Hard to read.',
    goal: 'Ensure his own survival first, others second.',
    fears: ['starvation', 'losing physical edge'],
    values: ['self-reliance', 'strength', 'preparedness'],
  },
  {
    name: 'Sofia',
    role: 'Nurse',
    personality: 'Deeply empathetic and trusted by almost everyone. Her emotional intelligence is her superpower. Conflict makes her physically ill.',
    goal: 'Keep everyone healthy — physically and emotionally.',
    fears: ['someone dying because she failed', 'being forced to be cruel'],
    values: ['care', 'healing', 'trust'],
  },
  {
    name: 'Eli',
    role: 'Data analyst',
    personality: 'Paranoid pattern-recognizer. Notices things no one else does and doesn\'t know how to let go of suspicions. Often right. Often annoying about it.',
    goal: 'Figure out who the real threats are before they act.',
    fears: ['being ignored when he is right', 'hidden agendas succeeding'],
    values: ['truth', 'pattern recognition', 'vigilance'],
  },
];

export interface RelationshipSeed {
  agentNameA: string;
  agentNameB: string;
  trust: number;
  fear: number;
  respect: number;
  resentment: number;
  notes: string;
}

// All 45 pairs — initial tensions baked in
export const INITIAL_RELATIONSHIPS: RelationshipSeed[] = [
  { agentNameA: 'Maya', agentNameB: 'Leo', trust: -10, fear: 15, respect: 30, resentment: 20, notes: 'Maya sees Leo as a threat to stable leadership. Leo sees Maya as a rival.' },
  { agentNameA: 'Maya', agentNameB: 'Nora', trust: 20, fear: 0, respect: 40, resentment: 0, notes: 'Maya respects Nora\'s calm. Does not suspect her.' },
  { agentNameA: 'Maya', agentNameB: 'Jonas', trust: 40, fear: 0, respect: 35, resentment: 0, notes: 'Maya trusts Jonas as non-threatening and useful.' },
  { agentNameA: 'Maya', agentNameB: 'Talia', trust: 50, fear: 0, respect: 60, resentment: 0, notes: 'Natural allies. Both value competence and results.' },
  { agentNameA: 'Maya', agentNameB: 'Oren', trust: 10, fear: 0, respect: 15, resentment: 15, notes: 'Maya finds Oren infuriating but too popular to dismiss.' },
  { agentNameA: 'Maya', agentNameB: 'Iris', trust: 15, fear: 0, respect: 20, resentment: 30, notes: 'Fundamental clash: order vs. idealism.' },
  { agentNameA: 'Maya', agentNameB: 'Max', trust: 25, fear: 10, respect: 40, resentment: 10, notes: 'Maya respects Max\'s competence but doesn\'t fully trust him.' },
  { agentNameA: 'Maya', agentNameB: 'Sofia', trust: 45, fear: 0, respect: 40, resentment: 0, notes: 'Maya values Sofia as a stabilizing force.' },
  { agentNameA: 'Maya', agentNameB: 'Eli', trust: 30, fear: 5, respect: 35, resentment: 5, notes: 'Maya finds Eli useful but exhausting.' },

  { agentNameA: 'Leo', agentNameB: 'Nora', trust: 35, fear: 20, respect: 45, resentment: 0, notes: 'Leo senses Nora knows more than she shows. Keeps her close.' },
  { agentNameA: 'Leo', agentNameB: 'Jonas', trust: 50, fear: 0, respect: 30, resentment: 0, notes: 'Leo uses Jonas as a messenger. Jonas doesn\'t realize it.' },
  { agentNameA: 'Leo', agentNameB: 'Talia', trust: 20, fear: 5, respect: 50, resentment: 10, notes: 'Leo respects Talia\'s work but she won\'t flatter him.' },
  { agentNameA: 'Leo', agentNameB: 'Oren', trust: 60, fear: 0, respect: 30, resentment: 0, notes: 'Leo enjoys Oren. Sees him as non-threatening and fun.' },
  { agentNameA: 'Leo', agentNameB: 'Iris', trust: -20, fear: 25, respect: 15, resentment: 40, notes: 'Direct ideological clash. Iris threatens Leo\'s authority model.' },
  { agentNameA: 'Leo', agentNameB: 'Max', trust: 30, fear: 30, respect: 50, resentment: 15, notes: 'Leo respects Max\'s physical competence but fears him as a rival.' },
  { agentNameA: 'Leo', agentNameB: 'Sofia', trust: 40, fear: 0, respect: 35, resentment: 0, notes: 'Leo sees Sofia as safe and charming to have on his side.' },
  { agentNameA: 'Leo', agentNameB: 'Eli', trust: -30, fear: 40, respect: 20, resentment: 50, notes: 'Eli makes Leo nervous. Leo knows Eli is watching him.' },

  { agentNameA: 'Nora', agentNameB: 'Jonas', trust: 35, fear: 0, respect: 30, resentment: 0, notes: 'Nora is fond of Jonas but will use him.' },
  { agentNameA: 'Nora', agentNameB: 'Talia', trust: 25, fear: 0, respect: 45, resentment: 0, notes: 'Nora respects Talia\'s bluntness. Rare quality she values.' },
  { agentNameA: 'Nora', agentNameB: 'Oren', trust: 20, fear: 0, respect: 20, resentment: 0, notes: 'Nora sees Oren as entertaining but strategically unimportant.' },
  { agentNameA: 'Nora', agentNameB: 'Iris', trust: 30, fear: 0, respect: 35, resentment: 5, notes: 'Nora admires Iris\'s conviction but finds her naive.' },
  { agentNameA: 'Nora', agentNameB: 'Max', trust: 15, fear: 20, respect: 35, resentment: 10, notes: 'Nora is wary of Max. He is hard to read.' },
  { agentNameA: 'Nora', agentNameB: 'Sofia', trust: 40, fear: 5, respect: 50, resentment: 0, notes: 'Mutual warmth. Nora is careful not to manipulate Sofia obviously.' },
  { agentNameA: 'Nora', agentNameB: 'Eli', trust: -20, fear: 45, respect: 30, resentment: 20, notes: 'Eli is the one person Nora fears might see through her.' },

  { agentNameA: 'Jonas', agentNameB: 'Talia', trust: 45, fear: 5, respect: 55, resentment: 0, notes: 'Jonas appreciates Talia\'s no-nonsense approach.' },
  { agentNameA: 'Jonas', agentNameB: 'Oren', trust: 30, fear: 0, respect: 20, resentment: 10, notes: 'Jonas likes Oren but wishes he\'d help more.' },
  { agentNameA: 'Jonas', agentNameB: 'Iris', trust: 50, fear: 0, respect: 50, resentment: 0, notes: 'Jonas and Iris share values. Natural allies.' },
  { agentNameA: 'Jonas', agentNameB: 'Max', trust: 20, fear: 15, respect: 40, resentment: 10, notes: 'Jonas worries Max would sacrifice others to survive.' },
  { agentNameA: 'Jonas', agentNameB: 'Sofia', trust: 65, fear: 0, respect: 60, resentment: 0, notes: 'Closest friendship on the island. Deeply trust each other.' },
  { agentNameA: 'Jonas', agentNameB: 'Eli', trust: 35, fear: 5, respect: 40, resentment: 0, notes: 'Jonas believes Eli. Even when it\'s uncomfortable.' },

  { agentNameA: 'Talia', agentNameB: 'Oren', trust: 10, fear: 0, respect: 10, resentment: 30, notes: 'Talia deeply resents Oren\'s laziness.' },
  { agentNameA: 'Talia', agentNameB: 'Iris', trust: 25, fear: 0, respect: 30, resentment: 20, notes: 'Talia respects Iris\'s heart but finds her impractical.' },
  { agentNameA: 'Talia', agentNameB: 'Max', trust: 40, fear: 10, respect: 55, resentment: 5, notes: 'Natural work partnership. Talia trusts Max when tasks are clear.' },
  { agentNameA: 'Talia', agentNameB: 'Sofia', trust: 40, fear: 0, respect: 45, resentment: 0, notes: 'Talia values Sofia\'s steadiness.' },
  { agentNameA: 'Talia', agentNameB: 'Eli', trust: 35, fear: 0, respect: 40, resentment: 0, notes: 'Talia takes Eli seriously. She has seen his predictions prove right.' },

  { agentNameA: 'Oren', agentNameB: 'Iris', trust: 30, fear: 0, respect: 35, resentment: 5, notes: 'Oren secretly admires Iris but teases her publicly.' },
  { agentNameA: 'Oren', agentNameB: 'Max', trust: 25, fear: 20, respect: 35, resentment: 5, notes: 'Oren senses Max could become dangerous and keeps a careful distance.' },
  { agentNameA: 'Oren', agentNameB: 'Sofia', trust: 55, fear: 0, respect: 45, resentment: 0, notes: 'Oren and Sofia genuinely like each other. She is one of the few he is honest with.' },
  { agentNameA: 'Oren', agentNameB: 'Eli', trust: 20, fear: 10, respect: 25, resentment: 10, notes: 'Oren jokes about Eli\'s paranoia but privately takes notes.' },

  { agentNameA: 'Iris', agentNameB: 'Max', trust: -10, fear: 20, respect: 25, resentment: 35, notes: 'Iris views Max as proof that survival instincts corrupt ethics.' },
  { agentNameA: 'Iris', agentNameB: 'Sofia', trust: 55, fear: 0, respect: 55, resentment: 0, notes: 'Best natural allies. Shared values, different methods.' },
  { agentNameA: 'Iris', agentNameB: 'Eli', trust: 40, fear: 0, respect: 45, resentment: 0, notes: 'Iris values Eli\'s truth-seeking. He values her ethics.' },

  { agentNameA: 'Max', agentNameB: 'Sofia', trust: 30, fear: 0, respect: 40, resentment: 5, notes: 'Max knows Sofia sees through him more than most. Keeps her at arm\'s length.' },
  { agentNameA: 'Max', agentNameB: 'Eli', trust: -15, fear: 35, respect: 30, resentment: 25, notes: 'Max knows Eli is watching him. Considers preemptive action.' },

  { agentNameA: 'Sofia', agentNameB: 'Eli', trust: 50, fear: 5, respect: 50, resentment: 0, notes: 'Sofia finds Eli\'s paranoia sad but trusts his instincts.' },
];

export function buildInitialWorldState() {
  return {
    day: 1,
    food: 70,
    water: 80,
    shelterQuality: 20,
    morale: 65,
    conflictLevel: 15,
    leadershipStructure: null,
    factions: [],
    activeCrisis: null,
  };
}
