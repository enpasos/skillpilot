import { readFileSync } from 'node:fs'
import {
  CANONICAL_GYMNASIUM_PHYSICS_ID,
  MANUAL_ORANGE_CURRICULUM_IDS,
} from '../src/utils/curriculumQualityTrafficLight'

interface CurriculumQualityStatusEntry {
  frameworkId?: string
  landscapeId?: string
  maturity?: string
}

interface CurriculumQualityStatusArtifact {
  curricula?: CurriculumQualityStatusEntry[]
}

const artifactUrl = new URL(
  '../../docs/qa-ci/status/curriculum-quality-status.json',
  import.meta.url,
)
const artifact = JSON.parse(
  readFileSync(artifactUrl, 'utf8'),
) as CurriculumQualityStatusArtifact

const currentM6Ids = (artifact.curricula ?? [])
  .filter((entry) => (
    entry.maturity === 'M6'
    && entry.frameworkId?.startsWith('canonical-gymnasium-')
    && entry.frameworkId !== 'canonical-gymnasium-overview'
    && entry.landscapeId
  ))
  .map((entry) => entry.landscapeId as string)
  .sort()

const manualM6Ids = [
  CANONICAL_GYMNASIUM_PHYSICS_ID,
  ...MANUAL_ORANGE_CURRICULUM_IDS,
].sort()

if (JSON.stringify(currentM6Ids) !== JSON.stringify(manualM6Ids)) {
  throw new Error(
    [
      'The manual curriculum traffic-light mapping no longer matches the generated Gymnasium M6 snapshot.',
      `Snapshot: ${currentM6Ids.join(', ')}`,
      `Manual: ${manualM6Ids.join(', ')}`,
    ].join('\n'),
  )
}

console.log('curriculum quality traffic-light drift test passed')
