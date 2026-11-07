// SPDX-License-Identifier: Apache-2.0
// Bounded successor: authenticate the unchanged fixed54 and exactly three current Math originals.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { LearningGoal, SkillLandscape } from '../src/landscapeTypes'
import { createVisualizationContextVerifier, parseVisualizationReviewJson,
  type VisualizationContextQualification, type VisualizationReviewArtifact } from './goalVisualizationReviewedContext'

type Row = { landscapeId: string; goalId: string; receipt: { path: string; sha256: string } }
type Original = VisualizationReviewArtifact & { currentCopyRequired: boolean }
type LocalizedLandscape = Omit<SkillLandscape, 'goals'> & { goals: Array<LearningGoal & { titleEn?: string; descriptionEn?: string }> }
const root = resolve(import.meta.dirname, '../..')
const hash = (raw: Buffer) => createHash('sha256').update(raw).digest('hex')
const read = (path: string, sha256: string) => {
  const raw = readFileSync(resolve(root, path))
  if (hash(raw) !== sha256) throw new Error('Fixed Math3 integration input differs: ' + path)
  return parseVisualizationReviewJson(raw)
}
const old = read('contracts/goal-visualization-context/v1/qualified-context-index.json',
  '3421fa1a64b0c9ccac607bd283fabc3aeeb2391aec6cad0118f317d81c87742e') as {
    acceptedRepositoryCommit: string; rows: Row[]; originalReferences: Original[] }
const three = read('qa-artifacts/ci-contract-audit/2026-11-07/math3-e4de-visualization-qualification/candidate-index.json',
  '4478c63d329ee7677624f4227410c6243d6a5653dd387709def5aef2b7fa3512') as {
    acceptedRepositoryCommit: string; candidateReceipts: Array<Row['receipt'] & { goalId: string }> }
const closure = read('qa-artifacts/ci-contract-audit/2026-11-07/math3-e4de-visualization-qualification/raw-positive-closure.json',
  '13feef6df70a42c8c8ca317728f4ddc0977069281033ef94929ca16b15d9e0d0') as { originalReferences: Original[] }
const expectedAnchor = '25a6f2164a81a7e6ae50db3557d20521fecf5124'
const mathOwner = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const expectedNew = ['ce198bc9-b014-52ba-814f-25cc3e020668', 'd07ef7b1-8bd2-56e0-9e74-d90c3c3e02fe', '0c2ddfcd-1399-41ad-aaed-4f061812602a']
if (old.acceptedRepositoryCommit !== '6fe35a6b0fa807e5a97475b34f3715dc16a89c00' || old.rows.length !== 54
  || old.originalReferences.length !== 224 || three.acceptedRepositoryCommit !== expectedAnchor
  || three.candidateReceipts.length !== 3 || closure.originalReferences.length !== 10
  || JSON.stringify(three.candidateReceipts.map(row => row.goalId)) !== JSON.stringify(expectedNew)) {
  throw new Error('The exact historical54/current3 selection differs')
}
const references = new Map<string, Original>(), expected = new Map<string, Original>()
const add = (map: Map<string, Original>, ref: VisualizationReviewArtifact, currentCopyRequired: boolean) => {
  const key = ref.gitCommit + ':' + ref.path, previous = map.get(key)
  if (previous && previous.sha256 !== ref.sha256) throw new Error('Conflicting authenticated original')
  map.set(key, { ...ref, currentCopyRequired: currentCopyRequired || previous?.currentCopyRequired || false })
}
for (const ref of [...old.originalReferences, ...closure.originalReferences]) add(expected, ref, ref.currentCopyRequired)
const verify = createVisualizationContextVerifier({ repositoryRoot: root, acceptedRepositoryCommit: expectedAnchor,
  onAuthenticatedOriginalRead(ref, currentCopyRequired) { add(references, ref, currentCopyRequired) } })
const rows: Row[] = [...old.rows, ...three.candidateReceipts.map(entry => ({ landscapeId: mathOwner,
  goalId: entry.goalId, receipt: { path: entry.path, sha256: entry.sha256 } }))]
const sources = new Map<string, LocalizedLandscape>()
for (const row of rows) {
  const qualification = read(row.receipt.path, row.receipt.sha256) as VisualizationContextQualification
  if (qualification.context.goalId !== row.goalId || qualification.context.landscapeId !== row.landscapeId) throw new Error('Receipt owner/goal differs')
  const sourcePath = qualification.context.subject === 'mathematik'
    ? 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
    : qualification.context.subject === 'wirtschaftswissenschaften'
      ? 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json' : ''
  if (!sourcePath) throw new Error('Unselected qualification subject')
  if (!sources.has(sourcePath)) sources.set(sourcePath, JSON.parse(readFileSync(resolve(root, sourcePath), 'utf8')))
  const source = sources.get(sourcePath)!
  const goals = source.goals.filter(goal => goal.id === row.goalId)
  if (source.landscapeId !== row.landscapeId || goals.length !== 1) throw new Error('Current owner/goal is ambiguous')
  const goal = goals[0], primary = (goal.resourceLinks ?? []).filter(link => link.type === 'goal-visualization' && (!link.role || link.role === 'primary'))
  if (primary.length !== 1) throw new Error('Current primary image is ambiguous')
  const imageUrl = primary[0].url, publicAssetPath = 'app/public' + imageUrl
  const checked = verify(row.receipt, { landscapeId: source.landscapeId, goalId: goal.id, subject: qualification.context.subject,
    title: goal.title, description: goal.description, titleEn: goal.titleEn, descriptionEn: goal.descriptionEn,
    demandLevel: goal.dimensionTags?.demandLevel, imageUrl, publicAssetPath,
    canonicalAssetPath: 'curricula/DE/Gymnasium/visualizations/' + imageUrl.slice('/assets/goal-visualizations/'.length),
    assetSha256: 'sha256:' + hash(readFileSync(resolve(root, publicAssetPath))) })
  if (!checked.ok) throw new Error(JSON.stringify({ goalId: goal.id, checked }))
}
const sortRefs = (map: Map<string, Original>) => [...map.values()].map(ref => ({ path: ref.path, gitCommit: ref.gitCommit, sha256: ref.sha256, currentCopyRequired: ref.currentCopyRequired })).sort((a, b) => (a.gitCommit + ':' + a.path).localeCompare(b.gitCommit + ':' + b.path))
if (rows.length !== 57 || new Set(rows.map(row => row.landscapeId + ':' + row.goalId)).size !== 57
  || new Set(rows.map(row => row.receipt.path)).size !== 57 || references.size !== 234
  || [...references.values()].filter(row => row.currentCopyRequired).length !== 229
  || JSON.stringify(sortRefs(references)) !== JSON.stringify(sortRefs(expected))) throw new Error('Actual authenticated57 closure differs')
console.log(JSON.stringify({ schemaVersion: 1, kind: 'externally-pinned-reviewed-visualization-context-index',
  acceptedRepositoryCommit: expectedAnchor, rows: rows.sort((a, b) => (a.landscapeId + ':' + a.goalId).localeCompare(b.landscapeId + ':' + b.goalId)),
  originalReferences: sortRefs(references), newReviewClaimed: false, runtimeActivationAllowed: false }, null, 2))
