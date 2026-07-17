export type {
  SkillContext, Artifact, Relation, Gap, Reference,
  SimulationResult, RiskProfile, CanonicalEntry, Evidence,
  PolicyViolation, LumenDecision, LumenLogEntry,
  ResearchSynthesis, KnowledgeGraph, SkillMetadata,
} from './types';

export { orion } from './orion';
export { sophia } from './sophia';
export { argus } from './argus';
export { mnemos } from './mnemos';
export { lumen } from './lumen';

import type { SkillContext, SkillMetadata } from './types';
import { orion } from './orion';
import { sophia } from './sophia';
import { argus } from './argus';
import { mnemos } from './mnemos';
import { lumen } from './lumen';

interface SkillRegistration {
  skillId: string;
  name: string;
  version: string;
  description: string;
  priority: SkillMetadata['priority'];
  getStats: () => Record<string, unknown>;
}

export const SKILL_REGISTRY: SkillRegistration[] = [
  {
    skillId: 'skill.orion',
    name: 'ORION',
    version: '1.0.0',
    description: 'Motor de arqueología cognitiva para descubrir conocimiento y relaciones ocultas en el ecosistema TAMV',
    priority: 'alto',
    getStats: () => orion.getStats(),
  },
  {
    skillId: 'skill.sophia',
    name: 'SOPHIA',
    version: '1.0.0',
    description: 'Motor de investigación profunda y síntesis para comprender antes de responder',
    priority: 'critico',
    getStats: () => sophia.getStats(),
  },
  {
    skillId: 'skill.argus',
    name: 'ARGUS',
    version: '1.0.0',
    description: 'Motor de simulación de escenarios y evaluación de riesgos para decisiones estratégicas',
    priority: 'critico',
    getStats: () => argus.getStats(),
  },
  {
    skillId: 'skill.mnemos',
    name: 'MNEMOS',
    version: '1.0.0',
    description: 'Motor de preservación histórica y canonización de la memoria civilizatoria TAMV',
    priority: 'maximo',
    getStats: () => mnemos.getStats(),
  },
  {
    skillId: 'skill.lumen',
    name: 'LUMEN',
    version: '1.0.0',
    description: 'Motor de gobernanza constitucional y supervisión ética para todas las acciones del sistema',
    priority: 'maximo',
    getStats: () => lumen.getStats(),
  },
];

export function getAllSkillMetadata(): SkillMetadata[] {
  return SKILL_REGISTRY.map(s => ({
    skillId: s.skillId,
    name: s.name,
    version: s.version,
    description: s.description,
    priority: s.priority,
    enabled: true,
    lastRun: null,
    totalCalls: (s.getStats() as { totalCalls?: number })?.totalCalls ?? 0,
    avgResponseMs: (s.getStats() as { avgResponseMs?: number })?.avgResponseMs ?? 0,
  }));
}
