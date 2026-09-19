import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { isMaturityLevel, maturityCopy } from '../src/utils/curriculumQualityPresentation'
import { getCurriculumQualityStatus } from '../src/utils/curriculumQualityTrafficLight'
const artifact = JSON.parse(readFileSync(new URL('../../docs/qa-ci/status/curriculum-quality-status.json', import.meta.url), 'utf8')) as {
  curricula: Array<{ landscapeId: string; maturity: string; qualityStatus?: unknown }>
}
for (const entry of artifact.curricula) {
  assert(isMaturityLevel(entry.maturity), `Unknown generated maturity for ${entry.landscapeId}`)
  assert(maturityCopy.de.legend[entry.maturity] && maturityCopy.en.legend[entry.maturity])
  if (!('qualityStatus' in entry)) assert.equal(getCurriculumQualityStatus(entry), null,
    'a static maturity snapshot does not manufacture a human-trial status')
}
console.log('curriculum quality snapshot presentation contract passed')
