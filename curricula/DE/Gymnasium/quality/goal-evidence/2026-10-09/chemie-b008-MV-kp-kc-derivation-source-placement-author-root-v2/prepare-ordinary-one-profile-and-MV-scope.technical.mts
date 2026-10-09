// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel.ts'
import { sourceAtlasFacet } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import { compileCompositionView, normalizeCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'

const folder = dirname(fileURLToPath(import.meta.url))
const root = resolve(folder, '../../../../../../..')
const goalId = 'a8ddb351-3501-5b6d-a908-c82a5d2f14d4'
const json = (p: string) => JSON.parse(readFileSync(resolve(root, p), 'utf8'))
const local = (name: string) => relative(root, resolve(folder, name)).split('\\').join('/')
const bind = (p: string) => { const bytes = readFileSync(resolve(root, p)); return { path: p, sha256: `sha256:${createHash('sha256').update(bytes).digest('hex')}`, bytes: bytes.length } }
const write = (name: string, value: unknown) => { const path = local(name); writeFileSync(resolve(root, path), JSON.stringify(value, null, 2) + '\n', { flag: 'wx' }); return bind(path) }
const now = new Date().toISOString()
const original = json(local('neutral-one-derived-MV-LK-KpKc-source-and-material-successor.author-review.entry.json'))
const canonicalPath = original.currentWholeCanonical504.path
const canonical = json(canonicalPath)
const goal = canonical.goals.find((g: any) => g.id === goalId)
const source = json(original.currentSourceExtraction.path)
const sourceGoal = source.sourceGoals.find((g: any) => g.id === 'mv-chem-sekii-mv-ch-sekii-2022-erprobung-q-gleichgewichte-009-dc7fb7b0')
const passage = source.passages.find((p: any) => p.id === sourceGoal.passageId)
assert.ok(passage)
const levels = [sourceGoal, passage, source.sourceDocument, source]
assert.deepEqual(sourceAtlasFacet(levels, 'stage'), ['SekII'])
assert.deepEqual(sourceAtlasFacet(levels, 'courseProfile'), ['LK'])
assert.ok(goal.applicability.jurisdiction.includes('DE-MV'))
assert.ok(sourceGoal.sourceSpan.endsWith('S. 23'))

const kindsPath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-b008-current-twenty-six-native-preparation-author-v1/candidate/semantic-kinds.current504.technical-review-input.json'
const kinds = json(kindsPath)
kinds.sourceLandscapePath = canonicalPath
const kind = kinds.decisions.find((d: any) => d.goalId === goalId)
assert.equal(kind.semanticKind, 'curricularAtomic')
kind.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
kind.decisionBasis = 'Author classifies this inactive assessable Kp/Kc derivation as curricularAtomic; source fingerprint is technical. Independent semantic atomicity and memory review remain pending.'
const kindsBinding = write('kinds395-one-current-goal.technical-candidate.json', kinds)

const material = json(original.currentWholeGoalProfileAndCases.path)
const predecessorMinimum = material.wholeProfile.coverageExpectations.minimumIndependentDemonstrations
assert.equal(predecessorMinimum, 1)
// The unchanged subject criteria require two distinct evidence demonstrations.
// These can occur as substantive steps within one task; no extra task quota.
material.wholeProfile.coverageExpectations.minimumIndependentDemonstrations = 2
material.role = 'Current actual author whole goal/cases with ordinary two-distinct-demonstration criteria; two meaningful steps can be inside one task'
material.createdAt = now
material.profileCriteriaSuccessor = { predecessor: original.currentWholeGoalProfileAndCases, oldMinimum: 1, currentMinimum: 2, reason: 'Preserve unchanged chemistry criteria; no relaxation and no required number of task labels.' }
const materialBinding = write('one-whole-KpKc-two-cases.criteria-current-v3.author-candidate.json', material)
const candidateSet = json(original.ordinaryPositiveProfileCandidateSet.path)
candidateSet.goals[0].profile = material.wholeProfile
candidateSet.reviewedAt = now
candidateSet.goals[0].reason += ' Current profile retains two distinct substantive demonstrations under unchanged subject criteria, which can occur within one task; the earlier unintegrated author minimum1 is preserved as superseded.'
const candidatesBinding = write('one-derived-positive-profile.criteria-current-v3.author-candidate-set.json', candidateSet)
const config = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json', schemaVersion: 2,
  reviewId: candidateSet.reviewId, goalFingerprintRuleVersion: 'goal-evidence-v1', profileRuleVersion: 'positive-understanding-evidence-v2',
  landscapeId: canonical.landscapeId, landscapePath: canonicalPath, semanticKindLedgerPath: kindsBinding.path,
  reviewCriteriaPath: 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md',
  reviewPath: local('one-derived-positive-profile.current-text-only.author.review.jsonl'),
  reviewRunManifestPaths: [], reviewedResourceTypes: [], requireApproved: false,
  scope: { label: 'One actual bounded MV-LK Kp/Kc derivation author candidate; current native/raster evidence pending', goalIds: [goalId] },
}
const configBinding = write('one-derived-positive-profile.current-text-only.author.config.json', config)
const view = {
  viewFormatVersion: '1.0', viewId: 'chemie-one-MV-LK-KpKc-inactive-20261009-v2', landscapeId: canonical.landscapeId,
  language: 'de-DE', title: 'Kp/Kc – MV Qualifikationsphase LK, gezielte inaktive Prüfsicht',
  scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-MV', stage: 'SekII', courseProfile: 'LK' },
  rootNodes: [{ kind: 'structure', id: 'MV-LK-Qualifikationsphase-KpKc-author', label: 'MV Qualifikationsphase 11/12 – LK-Zusatz', children: [{ kind: 'goalEntry', goalId }] }],
}
const normalizedCanonical = normalizeCanonicalLandscape(canonical)
const normalizedView = normalizeCompositionView(view)
const compiled = compileCompositionView(normalizedView, normalizedCanonical)
assert.deepEqual(compiled.findings.filter(f => f.severity === 'error'), [])
const roles = collectCompositionProjectionRoleGoalIds(normalizedView.rootNodes, new Map(normalizedCanonical.goals.map(g => [g.id, g])))
assert.deepEqual([...roles.targetGoalIds], [goalId])
const viewBinding = write('one-MV-LK-Qualifikationsphase11-12.inactive-unregistered.view.json', view)
const receipt = write('one-actual-MV-LK-source-facet-and-normal-scope-compiler.author-receipt.json', {
  schemaVersion: 1, role: 'Actual existing normal facet/closed view compiler, not a whole source Atlas approval', createdAt: now,
  exactInputs: [bind(canonicalPath), bind(original.currentSourceExtraction.path), bind(original.currentMapping.path), bind(kindsPath)],
  actualSourceStage: sourceAtlasFacet(levels, 'stage'), actualSourceCourse: sourceAtlasFacet(levels, 'courseProfile'),
  actualTargetJurisdiction: goal.applicability.jurisdiction, exactSourceSpan: sourceGoal.sourceSpan,
  currentScopedView: viewBinding, compilerFindings: compiled.findings, actualTargetGoalIds: [...roles.targetGoalIds],
  sourceBlock: 'Actual additional LK block, physical27/printed23; old mixed-page passage/raw span22 unchanged',
  HEQ3NotUsedAsMVProgrammePhase: true, viewNotRegistered: true, normalFull395496GuardChanged: false,
  all395SourceAtlasSuccess: false, semanticAtomicityAndMemoryApproval: false, independentD_P_A_M_V: false,
  ordinaryTextOnlyPConfig: configBinding, currentProfileCandidates: candidatesBinding, currentMaterial: materialBinding,
  activeWrites: 0, strictGain: 0, humanApproval: false,
})
console.log(JSON.stringify({ receipt, config: configBinding, candidates: candidatesBinding, currentMaterial: materialBinding }))
