import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export const SHARED_DURATION_POLICY_PATH = 'curricula/DE/Gymnasium/provenance/gymnasium-duration-model-policy.json'
export const PHYSICS_DURATION_POLICY_PATH = 'curricula/DE/Gymnasium/provenance/gymnasium-physics-duration-model-policy-2026-11-16.json'

interface DurationDecision {
  subject?: string
  jurisdiction?: string
  stage?: string
  sourceExtractionPath?: string
  status?: string
  decision?: string
  durationModels?: string[]
  learnerFacingProjection?: string
  compositionViewIds?: string[]
  evidenceSources?: string[]
  rationale?: string
}
interface DurationPolicy {
  decisions: DurationDecision[]
  parentPolicy?: { path: string; sha256: string }
}

/** The shared ten Physics decisions remain historical evidence. Only the
 * explicitly reviewed Hessen successor replaces its live offering decision. */
export const loadActiveGymnasiumDurationPolicy = (repoRoot: string): DurationPolicy => {
  const read = (path: string) => readFileSync(resolve(repoRoot, path), 'utf8')
  const shared = JSON.parse(read(SHARED_DURATION_POLICY_PATH)) as DurationPolicy
  const successor = JSON.parse(read(PHYSICS_DURATION_POLICY_PATH)) as DurationPolicy
  const parentPath = 'curricula/DE/Gymnasium/provenance/gymnasium-physics-duration-model-policy.json'
  if (successor.parentPolicy?.path !== parentPath
    || createHash('sha256').update(read(parentPath)).digest('hex') !== successor.parentPolicy.sha256) {
    throw new Error('Physics duration successor has an invalid retained parent binding.')
  }
  const parent = JSON.parse(read(parentPath)) as DurationPolicy
  const isHessenPhysics = (row: DurationDecision) => row.subject === 'Physik' && row.jurisdiction === 'DE-HE'
  if (JSON.stringify(successor.decisions.filter(row => !isHessenPhysics(row)))
    !== JSON.stringify(parent.decisions.filter(row => !isHessenPhysics(row)))) {
    throw new Error('Hessen duration successor changed another jurisdiction.')
  }
  const replacements = successor.decisions.filter(isHessenPhysics)
  const expectedSources = ['G8', 'G9'].map(duration =>
    `curricula/DE/Gymnasium/input/HE/lower-secondary/source-extraction/DE_HE_PHYSIK_SEKI_${duration}.source-extraction.json`)
  if (replacements.length !== 2 || replacements.some((row, index) => row.status !== 'reviewed'
    || row.decision !== 'dual-duration-different-projection'
    || row.durationModels?.join(',') !== 'G8,G9' || row.sourceExtractionPath !== expectedSources[index])) {
    throw new Error('Hessen duration successor lacks the two reviewed G8/G9 source decisions.')
  }
  return { ...shared, decisions: [...shared.decisions.filter(row => !isHessenPhysics(row)), ...replacements] }
}
