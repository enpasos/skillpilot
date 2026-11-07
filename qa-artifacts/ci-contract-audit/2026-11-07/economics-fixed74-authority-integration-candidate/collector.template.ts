// SPDX-License-Identifier: Apache-2.0
// Exact preserved57 + independently reviewed Economics17 original-byte successor.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { LearningGoal, SkillLandscape } from '../src/landscapeTypes'
import { createVisualizationContextVerifier, parseVisualizationReviewJson,
  type VisualizationContextQualification, type VisualizationReviewArtifact } from './goalVisualizationReviewedContext'
type Row = { landscapeId: string; goalId: string; receipt: { path: string; sha256: string } }
type Original = VisualizationReviewArtifact & { currentCopyRequired: boolean }
type Source = Omit<SkillLandscape, 'goals'> & { goals: Array<LearningGoal & { titleEn?: string; descriptionEn?: string }> }
const root = resolve(import.meta.dirname, '../..')
const hash = (raw: Buffer) => createHash('sha256').update(raw).digest('hex')
const read = (path: string, sha256: string) => {
  const raw = readFileSync(resolve(root, path))
  if (hash(raw) !== sha256) throw new Error('Fixed Economics17 integration input differs: ' + path)
  return parseVisualizationReviewJson(raw)
}
const old = read('contracts/goal-visualization-context/v1/qualified-context-index-math3-2026-11-07.json',
  '46416dd5939db442dd82c9905008cb89c79dbe9db08e9b19b03f10cde7fd3fd0') as { acceptedRepositoryCommit: string; rows: Row[]; originalReferences: Original[] }
const candidate = read('qa-artifacts/ci-contract-audit/2026-11-07/economics-additional-existing-reviewed-context-candidate/candidate-index.json',
  '7c3017af3209149593b24bad5276aa901f9fd9ad66e57ea5262c5edd52a6d530') as { acceptedRepositoryCommit: string; candidateReceipts: Array<Row['receipt'] & { goalId: string }> }
const closure = read('contracts/goal-visualization-context/v1/economics-q2-monetary-social-original-pins-2026-11-07.json',
  'a2a0930765426e53765863296102164d7e6bd1f5c73cd7f849085ac6cc46475b') as { originalReferences: Original[]; goalIds: string[] }
read('qa-artifacts/ci-contract-audit/2026-11-07/economics-additional-existing-reviewed-context-independent-peer/review-seal.json',
  '37bbc0d8ae2468dc4826300646b8d94e28d452d38e0c0ddb621daef3c2d4e6d4')
const anchor = '25a6f2164a81a7e6ae50db3557d20521fecf5124'
const econ = '605bdaf6-32d5-56fd-8d92-5a80c2fd2901'
if (old.acceptedRepositoryCommit !== anchor || candidate.acceptedRepositoryCommit !== anchor || old.rows.length !== 57
  || old.originalReferences.length !== 234 || candidate.candidateReceipts.length !== 17 || closure.originalReferences.length !== 126
  || JSON.stringify(candidate.candidateReceipts.map(row => row.goalId)) !== JSON.stringify(closure.goalIds)) throw new Error('Exact preserved57/new17 selection differs')
const actual = new Map<string, Original>(), expected = new Map<string, Original>()
const add = (map: Map<string, Original>, ref: VisualizationReviewArtifact, currentCopyRequired: boolean) => {
  const key = ref.gitCommit + ':' + ref.path, previous = map.get(key)
  if (previous && previous.sha256 !== ref.sha256) throw new Error('Conflicting authenticated original')
  map.set(key, { path: ref.path, gitCommit: ref.gitCommit, sha256: ref.sha256, currentCopyRequired: currentCopyRequired || previous?.currentCopyRequired || false })
}
for (const ref of [...old.originalReferences, ...closure.originalReferences]) add(expected, ref, ref.currentCopyRequired)
const verify = createVisualizationContextVerifier({ repositoryRoot: root, acceptedRepositoryCommit: anchor,
  onAuthenticatedOriginalRead(ref, currentCopyRequired) { add(actual, ref, currentCopyRequired) } })
const rows: Row[] = [...old.rows, ...candidate.candidateReceipts.map(row => ({ landscapeId: econ, goalId: row.goalId, receipt: { path: row.path, sha256: row.sha256 } }))]
const sourceCache = new Map<string, Source>()
for (const row of rows) {
  const receipt = read(row.receipt.path, row.receipt.sha256) as VisualizationContextQualification
  if (receipt.context.goalId !== row.goalId || receipt.context.landscapeId !== row.landscapeId) throw new Error('Receipt goal/owner differs')
  const sourcePath = receipt.context.subject === 'mathematik' ? 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
    : receipt.context.subject === 'wirtschaftswissenschaften' ? 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json' : ''
  if (!sourcePath) throw new Error('Unselected original owner')
  if (!sourceCache.has(sourcePath)) sourceCache.set(sourcePath, JSON.parse(readFileSync(resolve(root, sourcePath), 'utf8')))
  const source = sourceCache.get(sourcePath)!, goals = source.goals.filter(goal => goal.id === row.goalId)
  if (source.landscapeId !== row.landscapeId || goals.length !== 1) throw new Error('Current source goal/owner is ambiguous')
  const goal = goals[0], primary = (goal.resourceLinks ?? []).filter(link => link.type === 'goal-visualization' && link.role === 'primary')
  if (primary.length !== 1) throw new Error('Current primary image is ambiguous')
  const imageUrl = primary[0].url, publicAssetPath = 'app/public' + imageUrl
  const checked = verify(row.receipt, { landscapeId: source.landscapeId, goalId: goal.id, subject: receipt.context.subject,
    title: goal.title, description: goal.description, titleEn: goal.titleEn, descriptionEn: goal.descriptionEn,
    demandLevel: goal.dimensionTags?.demandLevel, imageUrl, publicAssetPath,
    canonicalAssetPath: 'curricula/DE/Gymnasium/visualizations/' + imageUrl.slice('/assets/goal-visualizations/'.length),
    assetSha256: 'sha256:' + hash(readFileSync(resolve(root, publicAssetPath))) })
  if (!checked.ok) throw new Error(JSON.stringify({ goalId: goal.id, checked }))
}
const sort = (map: Map<string, Original>) => [...map.values()].sort((a, b) => (a.gitCommit + ':' + a.path).localeCompare(b.gitCommit + ':' + b.path))
if (rows.length !== 74 || new Set(rows.map(row => row.landscapeId + ':' + row.goalId)).size !== 74
  || new Set(rows.map(row => row.receipt.path)).size !== 74 || actual.size !== 359
  || [...actual.values()].filter(row => row.currentCopyRequired).length !== 354
  || JSON.stringify(sort(actual)) !== JSON.stringify(sort(expected))) throw new Error('Actual callback-read74 closure differs from exact required union')
console.log(JSON.stringify({ schemaVersion: 1, kind: 'externally-pinned-reviewed-visualization-context-index', acceptedRepositoryCommit: anchor,
  rows: rows.sort((a, b) => (a.landscapeId + ':' + a.goalId).localeCompare(b.landscapeId + ':' + b.goalId)),
  originalReferences: sort(actual), newReviewClaimed: false, runtimeActivationAllowed: false }, null, 2))
