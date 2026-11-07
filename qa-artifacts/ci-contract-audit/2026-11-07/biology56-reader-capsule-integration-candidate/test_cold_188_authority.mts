// SPDX-License-Identifier: Apache-2.0
// Actual finite authority/materializer, with no rollout or CQR producer.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createQualifiedVisualizationContextAuthority, qualifiedVisualizationAuthority } from '../../../../app/scripts/lib/qualifiedVisualizationContextAuthority'

const root = resolve(import.meta.dirname, '../../../..'), packet = import.meta.dirname
const json = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const hash = (raw: Buffer) => createHash('sha256').update(raw).digest('hex')
const measurements = json(resolve(packet, 'transport-measurements.json'))
assert.equal(qualifiedVisualizationAuthority.indexSha256, measurements.indexSha256)
assert.equal(qualifiedVisualizationAuthority.capsuleSha256, measurements.capsuleSha256)
const tmp = process.env.TMPDIR!
assert.equal(readdirSync(tmp).filter(name => name.startsWith('skillpilot-qualified-v-')).length, 0)
const verify = createQualifiedVisualizationContextAuthority(root)
const index = json(qualifiedVisualizationAuthority.indexPath)
const old = index.rows.slice(0, 132)
const selected = [...index.rows.slice(132)]
// Two existing Math and two existing Economics profile representatives.
for (const profile of ['math-current62-with-current-viewports-v1', 'matrix-candidate-v1', 'economics-q3-embedded-v1', 'economics-q2-monetary-social-embedded-v1']) {
  const row = old.find((row: { receipt: { path: string } }) => json(row.receipt.path).reviewProfile === profile)
  assert.ok(row, profile)
  selected.push(row)
}
const types: Record<string, string> = { biologie: 'BIOLOGIE', mathematik: 'MATHEMATIK', wirtschaftswissenschaften: 'WIRTSCHAFT' }
const results = []
for (const row of selected) {
  const receipt = json(row.receipt.path), source = json('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_' + types[receipt.context.subject] + '.de.json')
  const goal = source.goals.find((goal: { id: string }) => goal.id === row.goalId)
  const links = goal.resourceLinks.filter((link: { type: string; role: string }) => link.type === 'goal-visualization' && link.role === 'primary')
  assert.equal(links.length, 1)
  const imageUrl = links[0].url, publicAssetPath = 'app/public' + imageUrl
  const checked = verify({ landscapeId: source.landscapeId, goalId: row.goalId, subject: receipt.context.subject,
    title: goal.title, description: goal.description, titleEn: goal.titleEn, descriptionEn: goal.descriptionEn,
    demandLevel: goal.dimensionTags.demandLevel, imageUrl, publicAssetPath,
    canonicalAssetPath: 'curricula/DE/Gymnasium/visualizations/' + imageUrl.slice('/assets/goal-visualizations/'.length),
    assetSha256: 'sha256:' + hash(readFileSync(resolve(root, publicAssetPath))), ...(goal.level === undefined ? {} : { level: goal.level }) })
  assert.equal(checked.ok, true, JSON.stringify({ goalId: row.goalId, checked }))
  results.push({ goalId: row.goalId, profile: receipt.reviewProfile, accepted: checked.ok })
}
const initialized = readdirSync(tmp).filter(name => name.startsWith('skillpilot-qualified-v-'))
assert.equal(initialized.length, 1)
const materialized = resolve(tmp, initialized[0], 'originals')
const shallow = readFileSync(resolve(materialized, '.git/shallow'), 'utf8').trim()
assert.ok(shallow)
writeFileSync(resolve(packet, 'cold-native-authority-results.json'), JSON.stringify({
  status: 'ACTUAL_COLD_FINITE_TRANSPORT_AND_56_NATIVE_BIO_CONTEXTS_PLUS_FOUR_EXISTING_PROFILE_REPRESENTATIVES',
  qualifiedIndexRows: index.rows.length, actualColdInitializations: initialized.length, authenticatedShallowOriginalRepository: true,
  completed: results, biologyContexts: 56, existingProfileRepresentatives: 4,
  full132Regression: 'Separately executed once in native-qualification-and-regression.json; not repeated here.',
  combinedProducerRuns: 0, fullCqrProducerRuns: 0, M7Claimed: false,
}, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify({ actualColdInitializations: 1, authenticatedShallowOriginalRepository: true, nativeBio56: 56, existingRepresentatives: 4, producerRuns: 0 }))
