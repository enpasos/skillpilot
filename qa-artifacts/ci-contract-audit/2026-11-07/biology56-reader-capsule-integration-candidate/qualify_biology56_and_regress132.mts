// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createVisualizationContextVerifier, type VisualizationCurrentContext, type VisualizationReviewArtifact } from '../../../../app/scripts/goalVisualizationReviewedContext'

const root = resolve(import.meta.dirname, '../../../..'), packet = import.meta.dirname
const read = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const hash = (raw: Buffer) => createHash('sha256').update(raw).digest('hex')
const oldPath = 'contracts/goal-visualization-context/v1/qualified-context-index-math58-132-2026-11-07.candidate.json'
assert.equal(hash(readFileSync(resolve(root, oldPath))), '441b710b8965f529c231f046bbde6ade4be17d2c0bd4a43baf46829ee0287803')
const old = read(oldPath), bio = read(resolve(packet, 'candidate-rows.json'))
const originals = new Map<string, VisualizationReviewArtifact & { currentCopyRequired: boolean }>()
const current = new Map<string, { path: string; sha256: string; bytes: number }>()
const verifier = createVisualizationContextVerifier({ repositoryRoot: root, acceptedRepositoryCommit: old.acceptedRepositoryCommit,
  onAuthenticatedOriginalRead(binding, currentCopyRequired) {
    const key = binding.gitCommit + ':' + binding.path, previous = originals.get(key)
    if (previous) assert.equal(previous.sha256, binding.sha256)
    originals.set(key, { ...binding, currentCopyRequired: currentCopyRequired || previous?.currentCopyRequired || false })
  },
  onBoundCurrentEvidenceRead(binding, fromRepository) {
    if (!fromRepository) return
    const value = { ...binding, bytes: binding.bytes ?? readFileSync(resolve(root, binding.path)).length }
    if (current.has(binding.path)) assert.deepEqual(current.get(binding.path), value)
    current.set(binding.path, value)
  } })
const completed: Array<{ goalId: string; subject: string; receiptSha256: string }> = []
const sourcePaths: Record<string, string> = { biologie: 'BIOLOGIE', mathematik: 'MATHEMATIK', wirtschaftswissenschaften: 'WIRTSCHAFT' }
for (const row of [...bio, ...old.rows]) {
  const receipt = read(row.receipt.path)
  assert.equal(row.receipt.sha256, hash(readFileSync(resolve(root, row.receipt.path))))
  const source = read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_' + sourcePaths[receipt.context.subject] + '.de.json')
  const goals = source.goals.filter((goal: { id: string }) => goal.id === row.goalId)
  assert.equal(goals.length, 1)
  const goal = goals[0], links = goal.resourceLinks.filter((link: { type: string; role: string }) => link.type === 'goal-visualization' && link.role === 'primary')
  assert.equal(links.length, 1)
  const imageUrl = links[0].url, publicAssetPath = 'app/public' + imageUrl
  const input: VisualizationCurrentContext = { landscapeId: source.landscapeId, goalId: goal.id, subject: receipt.context.subject,
    title: goal.title, description: goal.description, titleEn: goal.titleEn, descriptionEn: goal.descriptionEn,
    demandLevel: goal.dimensionTags.demandLevel, imageUrl, publicAssetPath,
    canonicalAssetPath: 'curricula/DE/Gymnasium/visualizations/' + imageUrl.slice('/assets/goal-visualizations/'.length),
    assetSha256: 'sha256:' + hash(readFileSync(resolve(root, publicAssetPath))), ...(goal.level === undefined ? {} : { level: goal.level }) }
  const checked = verifier(row.receipt, input)
  assert.equal(checked.ok, true, JSON.stringify({ goalId: goal.id, checked }))
  completed.push({ goalId: goal.id, subject: receipt.context.subject, receiptSha256: row.receipt.sha256 })
}
assert.equal(completed.length, 188)
assert.equal(new Set(completed.map(row => row.goalId)).size, 188)
const sortOriginals = [...originals.values()].sort((a, b) => (a.gitCommit + ':' + a.path).localeCompare(b.gitCommit + ':' + b.path))
const sortCurrent = [...current.values()].sort((a, b) => a.path.localeCompare(b.path))
writeFileSync(resolve(packet, 'native-qualification-and-regression.json'), JSON.stringify({
  status: 'PRIVATE_DIRECT_NATIVE_56_QUALIFIED_AND_EXISTING132_REGRESSION_ONLY',
  acceptedRepositoryCommit: old.acceptedRepositoryCommit, rows: [...old.rows, ...bio],
  originalReferences: sortOriginals, currentReferencesReadFromRepository: sortCurrent,
  completed, counts: { biologie: 56, mathematik: 63, wirtschaftswissenschaften: 69 },
  newImageReviews: 0, currentWholeNativePageApproval: false, combinedProducerRuns: 0, fullCqrRuns: 0,
}, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify({ directNativeBio: 56, preserved132: 132, originals: originals.size, currentRepositoryRefs: current.size, producerRuns: 0 }))
