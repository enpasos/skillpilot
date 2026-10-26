import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseSubjectExportVisualizationMetadata } from './subjectExportVisualizationMetadata'

const landscape = JSON.parse(readFileSync(new URL(
  '../../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json', import.meta.url,
), 'utf8'))
const goal = landscape.goals.find((entry: { id: string }) => entry.id === '7008979d-7890-5f7b-ad07-27b8bb597cbe')
assert.ok(goal, 'the regression uses a real native Biology image link')
const original = goal.resourceLinks.find((entry: { type: string }) => entry.type === 'goal-visualization')
assert.ok(original)
const withoutDescription = { ...original }
delete withoutDescription.description
const before = JSON.stringify(withoutDescription)
const issues: string[] = []
const parsed = parseSubjectExportVisualizationMetadata(withoutDescription, 'native Biology link', issues)
assert.deepEqual(issues, [])
assert.equal(parsed?.description, original.altText)
assert.equal(parsed?.altText, original.altText)
assert.equal(parsed?.license, original.license)
assert.equal(parsed?.reviewStatus, original.reviewStatus)
assert.equal(JSON.stringify(withoutDescription), before, 'normalization does not rewrite canonical source metadata')

const explicit = parseSubjectExportVisualizationMetadata({ ...original, description: 'Declared description' }, 'explicit', [])
assert.equal(explicit?.description, 'Declared description')
for (const description of [null, '', '   ', 42]) {
  const errors: string[] = []
  assert.equal(parseSubjectExportVisualizationMetadata({ ...original, description }, 'invalid', errors), null)
  assert.ok(errors.some((error) => error.includes('description')),
    'explicit malformed descriptions cannot be replaced silently')
}
for (const field of ['altText', 'license', 'provider', 'reviewStatus']) {
  const errors: string[] = []
  const invalid = { ...withoutDescription, [field]: '' }
  assert.equal(parseSubjectExportVisualizationMetadata(invalid, 'missing required field', errors), null)
  assert.ok(errors.some((error) => error.includes(field)))
}
console.log('Subject-export visualization metadata tests passed: native optional description and strict required fields')
