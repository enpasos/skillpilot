// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createVisualizationContextVerifier, type VisualizationContextQualification, type VisualizationReviewArtifact } from './goalVisualizationReviewedContext'
import type { LearningGoal, SkillLandscape } from '../src/landscapeTypes'

type LocalizedLandscape = Omit<SkillLandscape, 'goals'> & { goals: Array<LearningGoal & { titleEn?: string; descriptionEn?: string }> }
const root = resolve(import.meta.dirname, '../..')
const hash = (raw: Buffer) => createHash('sha256').update(raw).digest('hex')
const inputs = [
  { path: 'qa-artifacts/ci-contract-audit/2026-11-06/visualization-context-first-two-families/family-census.json', sha256: '3b8c7c3dc08c9a49c51a4c7436459894ee7459a397dc8bfbb252b31d209bad90' },
  { path: 'qa-artifacts/ci-contract-audit/2026-11-07/visualization-economics-q3-two-family-reader/family-census.json', sha256: 'fd6dcf9e343f0b122a0ba55426ccc57b3a5b3783714c7ebeb8a1ea7d9f6ded73' },
]
const references = new Map<string, VisualizationReviewArtifact & { currentCopyRequired: boolean }>()
const expectedAnchor = '6fe35a6b0fa807e5a97475b34f3715dc16a89c00'
const verify = createVisualizationContextVerifier({ repositoryRoot: root, acceptedRepositoryCommit: expectedAnchor,
  onAuthenticatedOriginalRead(binding, currentCopyRequired) {
    const key = binding.gitCommit + ':' + binding.path, previous = references.get(key)
    if (previous && previous.sha256 !== binding.sha256) throw new Error('Contradictory authenticated original binding')
    references.set(key, { ...binding, currentCopyRequired: currentCopyRequired || previous?.currentCopyRequired || false })
  } })
const rows: Array<{ landscapeId: string; goalId: string; receipt: { path: string; sha256: string } }> = []
for (const input of inputs) {
  const raw = readFileSync(resolve(root, input.path))
  if (hash(raw) !== input.sha256) throw new Error('Externally fixed candidate census differs')
  const census: { acceptedRepositoryCommit: string; candidateReceipts: Array<{ path: string; sha256: string }> } = JSON.parse(raw.toString('utf8'))
  if (census.acceptedRepositoryCommit !== expectedAnchor) throw new Error('Candidate original anchor differs')
  for (const entry of census.candidateReceipts) {
    const reference = { path: entry.path, sha256: entry.sha256 }
    const raw = readFileSync(resolve(root, reference.path))
    if (hash(raw) !== reference.sha256) throw new Error('Fixed qualification receipt differs')
    const receipt: VisualizationContextQualification = JSON.parse(raw.toString('utf8'))
    const sourcePath = receipt.context.subject === 'mathematik'
      ? 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
      : 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
    const source: LocalizedLandscape = JSON.parse(readFileSync(resolve(root, sourcePath), 'utf8'))
    const goals = source.goals.filter(goal => goal.id === receipt.context.goalId)
    if (goals.length !== 1) throw new Error('Current qualification owner/goal is ambiguous')
    const goal = goals[0], primary = (goal.resourceLinks ?? []).filter(link => link.type === 'goal-visualization' && (!link.role || link.role === 'primary'))
    if (primary.length !== 1) throw new Error('Current qualification primary asset is ambiguous')
    const imageUrl = primary[0].url, publicAssetPath = 'app/public' + imageUrl
    const checked = verify(reference, { landscapeId: source.landscapeId, goalId: goal.id, subject: receipt.context.subject,
      title: goal.title, description: goal.description, titleEn: goal.titleEn, descriptionEn: goal.descriptionEn,
      demandLevel: goal.dimensionTags?.demandLevel, imageUrl, publicAssetPath,
      canonicalAssetPath: 'curricula/DE/Gymnasium/visualizations/' + imageUrl.slice('/assets/goal-visualizations/'.length),
      assetSha256: 'sha256:' + hash(readFileSync(resolve(root, publicAssetPath))) })
    if (!checked.ok) throw new Error(JSON.stringify({ goalId: goal.id, checked }))
    rows.push({ landscapeId: source.landscapeId, goalId: goal.id, receipt: reference })
  }
}
if (rows.length !== 54 || new Set(rows.map(row => row.landscapeId + ':' + row.goalId)).size !== 54) throw new Error('Fixed54 original selection is incomplete or duplicated')
console.log(JSON.stringify({ schemaVersion: 1, kind: 'externally-pinned-reviewed-visualization-context-index',
  acceptedRepositoryCommit: expectedAnchor, rows: rows.sort((a, b) => (a.landscapeId + ':' + a.goalId).localeCompare(b.landscapeId + ':' + b.goalId)),
  originalReferences: [...references.values()].sort((a, b) => (a.gitCommit + ':' + a.path).localeCompare(b.gitCommit + ':' + b.path)),
  newReviewClaimed: false, runtimeActivationAllowed: false }, null, 2))
