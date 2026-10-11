import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { goalMatchesFilter } from '../../../../../../../app/src/utils/goalFilters'
import { compileCompositionView, normalizeCompositionView } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import { compositionViewExposesGoal, applyCompositionViewProjection } from '../../../../../../../app/src/utils/compositionViewRuntime'
import { normalizeLandscape } from '../../../../../../../app/src/hooks/useLandscapes'
import { normalizeLearnerProjectedEntries } from '../../../../../../../app/src/utils/learnerTreeProjection'
import { validatePositiveGoalEvidenceRecordSemantics } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'

const here = dirname(fileURLToPath(import.meta.url))
let root = here
while (!existsSync(resolve(root, 'AGENTS.md')) || !existsSync(resolve(root, 'curricula'))) root = dirname(root)
const base = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-df8-existing-model-ID-E-GK-LK-source-supported-tag-and-placement-author-v1')
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const hash = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex')
const old = read(resolve(base, 'inputs/whole-existing-df8-goal.LK-predecessor.exact.json'))
const goal = read(resolve(base, 'whole-existing-df8-goal.one-GK-tag-only.candidate.json'))
const fields = Array.from(new Set([...Object.keys(old), ...Object.keys(goal)])).filter(k => JSON.stringify(old[k]) !== JSON.stringify(goal[k]))
if (JSON.stringify(fields) !== JSON.stringify(['tags']) || JSON.stringify(goal.tags) !== JSON.stringify(['GK', ...old.tags])) throw new Error('Unexpected whole goal delta')
const frame = read(resolve(base, 'whole-source3-inert419.only-df8-GK-tag-added.candidate.json'))
if (JSON.stringify(frame.goals.find((g: any) => g.id === goal.id)) !== JSON.stringify(goal)) throw new Error('Probe frame mismatch')
const normalized = normalizeLandscape(frame)
if (!normalized) throw new Error('Native normalization failed')
const probes = ['GK', 'LK'].map(course => {
  const view = normalizeCompositionView(read(resolve(base, `one-goal-explicit-BE-${course}-E-placement.inert-view.json`)))
  if (view.scope.jurisdiction !== 'DE-BE' || view.scope.courseProfile !== course) throw new Error('Authored scope drift')
  const result = compileCompositionView(view, frame)
  if (result.findings.some(f => f.severity === 'error')) throw new Error(JSON.stringify(result.findings))
  const projected = normalizeLearnerProjectedEntries(applyCompositionViewProjection([normalized], view))
  const found = projected.find(e => e.meta.landscapeId === frame.landscapeId)?.goals.filter(g => g.id === goal.id)
  if (!found || found.length !== 1 || !compositionViewExposesGoal([normalized], view, goal.id)) throw new Error('Explicit target absent or duplicated')
  if (!goalMatchesFilter(found[0], course) || !goalMatchesFilter(found[0], 'DE-BE')) throw new Error('Actual learner scope mismatch')
  return { course, actualNativeTargetCount: found.length, actualExplicitEPlacement: true, oldCourseMatch: goalMatchesFilter(old, course), newCourseMatch: goalMatchesFilter(goal, course), compilerFindings: result.findings, retainedCompatibilityPhase: found[0].phase, fullCourseCompletenessProven: false }
})
if (probes[0].oldCourseMatch || !probes[0].newCourseMatch || !probes[1].oldCourseMatch || !probes[1].newCourseMatch) throw new Error('Unexpected native course delta')
const record = read(resolve(base, 'whole-existing-df8-current-P4.one-GK-tag-only-native-bound.candidate.jsonl'))
const oldP = read(resolve(base, 'inputs/whole-df8-P4-real-images.exact-predecessor.jsonl'))
const acceptedP = readFileSync(resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-BE-two-E-source-rests-own-model-household-two-P-successors-author-v1/whole-two-current-real-images-P8-native-bound.author-v3.jsonl'), 'utf8').trim().split('\n').map(s => JSON.parse(s)).find(r => r.goalId === goal.id)
if (JSON.stringify(record.profile) !== JSON.stringify(oldP.profile) || JSON.stringify(record.profile) !== JSON.stringify(acceptedP.profile)) throw new Error('Actual independently accepted whole profile or four cases drift')
const ib = read(resolve(base, 'inputs/actual-current-resource-and-existing-independent-V.bindings.json'))
const actualHash = hash(resolve(root, ib.committableResource.path))
if (actualHash !== ib.expectedApprovedImageSha256) throw new Error('Old approved image drift')
const link = goal.resourceLinks.find((r: any) => r.type === 'goal-visualization')
const errors = validatePositiveGoalEvidenceRecordSemantics(record, goal, { [link.url]: `sha256:${actualHash}` }, 'curricularAtomic')
if (errors.length) throw new Error(errors.join('\n'))
for (const key of ['status', 'reviewAuthority', 'evidenceLevel', 'maximumClaimScope']) if (record[key] !== acceptedP[key]) throw new Error('Truthful status changed')
const result = { reviewer: '/root', independentFromTagPlacementAuthor: true, actualWholeGoalFieldsChanged: fields, actualNativeProbes: probes, wholeProfileAndFourCasesExactToCurrentIndependentRootReview: true, actualPModelErrors: errors, realReviewedImageBytesExact: actualHash, newScientificPOrVisualReviewClaimed: false, wholeCourseOrSource125Approval: false, noRuntimeMutation: true, humanApproval: false, strictNetGain: 0 }
writeFileSync(resolve(here, 'actual-independent-one-tag-two-E-placements-native-compiler-runtime-filter-and-P4.result.json'), JSON.stringify(result, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify({ sourceSupportedScopeDelta: 'GK tag and 2 explicit E targets', nativeTargetProbes: 2, modelErrors: 0, wholeCurrentProfileAndFourCasesExact: true, newScientificPOrVisualReview: false, strictNetGain: 0 }))
