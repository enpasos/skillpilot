// SPDX-License-Identifier: Apache-2.0
// Small untrusted caller/receipt controls; all historical review/seal/output bytes remain read-only.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createVisualizationContextVerifier, type VisualizationCurrentContext, type VisualizationContextQualification } from '../../../../app/scripts/goalVisualizationReviewedContext'

const root = resolve(import.meta.dirname, '../../../..'), packet = import.meta.dirname
const sha = (raw: Buffer) => createHash('sha256').update(raw).digest('hex')
const json = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const rows = json(resolve(packet, 'candidate-rows.json'))
const source = json('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
const verifier = createVisualizationContextVerifier({ repositoryRoot: root, acceptedRepositoryCommit: '25a6f2164a81a7e6ae50db3557d20521fecf5124' })
const receipt = (goalId: string): VisualizationContextQualification => json(rows.find((row: { goalId: string }) => row.goalId === goalId).receipt.path)
const current = (value: VisualizationContextQualification): VisualizationCurrentContext => {
  const goal = source.goals.find((g: { id: string }) => g.id === value.context.goalId)
  const link = goal.resourceLinks.find((r: { type: string; role: string }) => r.type === 'goal-visualization' && r.role === 'primary')
  return { ...value.context, title: goal.title, description: goal.description, titleEn: goal.titleEn, descriptionEn: goal.descriptionEn,
    demandLevel: goal.dimensionTags.demandLevel, imageUrl: link.url, publicAssetPath: 'app/public' + link.url,
    canonicalAssetPath: 'curricula/DE/Gymnasium/visualizations/' + link.url.slice('/assets/goal-visualizations/'.length) }
}
mkdirSync(resolve(packet, 'final-code-control-inputs'), { recursive: true })
const results: Array<{ control: string; status: string; issues?: string[] }> = []
function verify(name: string, candidate: VisualizationContextQualification, context: VisualizationCurrentContext, expected: RegExp | null) {
  const path = resolve(packet, 'final-code-control-inputs', name + '.json'), raw = Buffer.from(JSON.stringify(candidate, null, 2) + '\n')
  writeFileSync(path, raw, { flag: 'wx' })
  const checked = verifier({ path: path.slice(root.length + 1), sha256: sha(raw) }, context)
  if (expected === null) assert.equal(checked.ok, true, JSON.stringify(checked))
  else {
    assert.equal(checked.ok, false, name)
    if (!checked.ok) assert.match(checked.issues.join(' '), expected, name)
  }
  results.push({ control: name, status: checked.ok ? 'accepted' : checked.status, ...(!checked.ok ? { issues: checked.issues } : {}) })
}
const human = receipt('1abf08d7-6fc1-5705-b2d4-21cb44ceeba0')
if (process.argv.includes('--changed-current-asset')) {
  verify('changed-current-public-asset', human, current(human), /Current actual image bytes differ/u)
} else {
  verify('positive-original-human', human, current(human), null)
  const retained = receipt('bdbb1a13-f448-5536-86ab-894805e2f6be')
  verify('positive-retained-raster-and-later-native', retained, current(retained), null)
  verify('current-english-context-drift', human, { ...current(human), descriptionEn: human.context.descriptionEn + ' Extra obligation.' }, /Current goal\/image context differs/u)
  verify('untrusted-reviewer-attribution', { ...human, reviewer: 'different current qualifier' }, current(human), /Original decision\/reviewer\/time\/reason differs/u)
  verify('earlier-raster-time-is-not-later-native-time', { ...retained, reviewedAt: '2026-10-07T21:47:05.935778+00:00' }, current(retained), /Original decision\/reviewer\/time\/reason differs/u)
  for (const [name, goalId] of [['excluded-flora-current-asset-drift', '321ea315-37fe-5f9e-8fa8-dd631bb447c7'],
    ['excluded-he-current-english-drift', '1b7f08a1-33df-5779-af66-430c91d699b7'], ['excluded-he-original-split', '3ee4b55c-81c3-5826-9d26-1a8c22cbd0b8']] as const) {
    const base = structuredClone(name.startsWith('excluded-flora') ? retained : receipt('1d8d64b6-b2d8-526a-8e24-23e8b6e9eb30'))
    base.context.goalId = goalId
    verify(name, base, { ...current(human), goalId }, /outside the fixed Human20\/Flora19\/HE17 set/u)
  }
}
writeFileSync(resolve(packet, process.argv.includes('--changed-current-asset') ? 'final-changed-current-asset-control.json' : 'final-focused-controls.json'), JSON.stringify({
  finalReaderSha256: sha(readFileSync(resolve(packet, 'candidate/app/scripts/lib/goalVisualizationBiology56Contexts.ts'))), controls: results, originalReviewOrSealOrOutputBytesManipulated: false, callerAndUntrustedReceiptCopiesOnly: true,
  sourceAOrNamespaceProbes: 0, combinedProducerRuns: 0,
}, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify(results))
