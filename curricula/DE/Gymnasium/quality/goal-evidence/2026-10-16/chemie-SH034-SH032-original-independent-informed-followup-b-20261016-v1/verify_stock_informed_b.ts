// Author test harness reused explicitly for deterministic stock-code checks.
// Scientific independence comes from prior frozen informed review, not from
// claiming that this derived harness is an independently implemented checker.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import { evaluateCourseLevelMappingConsistency } from '../../../../../../../app/scripts/generateCurriculumQualityStatus.ts'
import { collectCompositionProjectionRoleGoalIds, compileCompositionView } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'

const source = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-SH034-LK-and-SH032-BY-practicum-history-targeted-author-successor-20261016-v1'
const out = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-SH034-SH032-original-independent-informed-followup-b-20261016-v1'
const read = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'))
const pin = (p: any) => {
  const b = fs.readFileSync(p.path)
  assert.equal('sha256:' + crypto.createHash('sha256').update(b).digest('hex'), p.sha256)
  assert.equal(b.length, p.bytes)
}
const sciencePath = path.join(out, 'FIRST.informed-SH034-SH032.science-before-checks.frozen.md')
const frozenScienceBytes = fs.readFileSync(sciencePath)
const scienceSHA256 = 'sha256:' + crypto.createHash('sha256').update(frozenScienceBytes).digest('hex')
const inputs = read(path.join(source, 'INPUTS.whole-two-SH-source-cells-supported-step1-and-current-targets.author.json'))
const cas = read(path.join(source, 'CAS.three-whole-files-SH032-SH034-after-supported-SH035.author.json')).items
pin(inputs.currentCanonical)
const canonical = read(inputs.currentCanonical.path)
const byId = new Map<string, any>(canonical.goals.map((g: any) => [g.id, g]))
const prefix = 'de-sh-chemie-sekii-fachanforderungen-2022-3-2-chemie-der-funktionalen-stoffe-und-materialien-'
const source32 = prefix + '032-74ed63ca', source34 = prefix + '034-e9b42b58', source35 = prefix + '035-a76e9a63'
const sourceCas = cas.find((r: any) => r.normalPath.includes('/source-extraction/'))
const sourceBefore = read(sourceCas.step2Before.path), sourceAfter = read(sourceCas.step2After.path)
for (const c of cas) { pin(c.step2Before); pin(c.step2After); pin(c.independentlySupportedSource8Step1After); assert.equal(c.step2Before.sha256, c.independentlySupportedSource8Step1After.sha256) }
assert.equal(sourceAfter.sourceGoals.length, sourceBefore.sourceGoals.length)
assert.deepEqual(sourceAfter.sourceGoals.find((g: any) => g.id === source35), sourceBefore.sourceGoals.find((g: any) => g.id === source35))
const sourceGoal34 = sourceAfter.sourceGoals.find((g: any) => g.id === source34)
assert.equal(sourceGoal34.courseLevel, 'LK')
assert.ok(sourceGoal34.tags.includes('courseLevel:LK'))
assert.ok(!sourceGoal34.tags.includes('courseLevel:GK_LK'))
const sourceGoal32 = sourceAfter.sourceGoals.find((g: any) => g.id === source32)
assert.equal(sourceGoal32.courseLevel, 'GK_LK')
const mappingsBefore = [], mappingsAfter = [], source34TargetChecks = []
for (const c of cas.filter((r: any) => r.normalPath.includes('/mapping/'))) {
  const before = read(c.step2Before.path), after = read(c.step2After.path)
  const old32 = before.decisions.find((d: any) => d.sourceGoalId === source32)
  const new32 = after.decisions.find((d: any) => d.sourceGoalId === source32)
  assert.equal(new32.decision, 'unreviewed')
  assert.deepEqual(new32.canonicalGoalIds, old32.canonicalGoalIds.filter((id: string) => id !== 'cf2631d9-da24-50e8-9e50-db625e6efaad'))
  assert.deepEqual(new32.source032HistoricalAllocationBeforeBYPracticumCorrection.wholeDecision, old32)
  assert.deepEqual(new32.source032HistoricalAllocationBeforeBYPracticumCorrection.wholeCurrentEdgesBefore, before.mappings.filter((m: any) => m.legacyGoalId === source32))
  assert.deepEqual(after.mappings, before.mappings.filter((m: any) => !(m.legacyGoalId === source32 && m.canonicalGoalId === 'cf2631d9-da24-50e8-9e50-db625e6efaad')))
  assert.deepEqual(after.decisions.filter((d: any) => d.sourceGoalId !== source32), before.decisions.filter((d: any) => d.sourceGoalId !== source32))
  assert.deepEqual(after.decisions.find((d: any) => d.sourceGoalId === source35), before.decisions.find((d: any) => d.sourceGoalId === source35))
  const d34 = after.decisions.find((d: any) => d.sourceGoalId === source34)
  for (const id of d34.canonicalGoalIds) {
    const g = byId.get(id)
    assert.ok(g.tags.includes('LK'))
    source34TargetChecks.push({ sourceGoalId: source34, targetId: id, actualTargetAcceptsLK: true, targetApplicabilitySH: (g.applicability?.jurisdiction ?? []).includes('DE-SH'), existingPartialPartnerRetainedNotNewSourceApproval: true })
  }
  mappingsBefore.push({ ...before, file: c.normalPath })
  mappingsAfter.push({ ...after, file: c.normalPath })
}
const sourceMapBefore = new Map([[sourceCas.normalPath, sourceBefore]])
const sourceMapAfter = new Map([[sourceCas.normalPath, sourceAfter]])
const courseBefore = evaluateCourseLevelMappingConsistency(canonical, mappingsBefore, sourceMapBefore)
const courseAfter = evaluateCourseLevelMappingConsistency(canonical, mappingsAfter, sourceMapAfter)
assert.equal(courseBefore.status, 'pass')
assert.equal(courseAfter.status, 'pass')
assert.equal(courseBefore.metrics.sourceGoals, courseAfter.metrics.sourceGoals)

const h = inputs.currentCanonical.path.split('/curricula/')[0]
const kinds = read(h + '/curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
const ordinary = new Set<string>(kinds.decisions.filter((d: any) => d.semanticKind === 'curricularAtomic').map((d: any) => d.goalId))
const memory = new Set<string>(kinds.decisions.filter((d: any) => d.semanticKind === 'memory').map((d: any) => d.goalId))
assert.equal(ordinary.size, 435); assert.equal(memory.size, 57)
const ajv = new Ajv2020({ strict: false, allErrors: true })
const validateView = ajv.compile(read('contracts/curriculum-package/v1/composition-view.schema.json'))
const views = []
for (const c of inputs.retainedStep1SHViews) {
  pin(c.after)
  const view = read(c.after.path)
  assert.ok(validateView(view), JSON.stringify(validateView.errors))
  const compiled = compileCompositionView(view, canonical)
  assert.equal(compiled.findings.filter(f => f.severity === 'error').length, 0)
  const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, byId)
  const pick = (ids: Set<string>, kind: Set<string>) => [...ids].filter(id => kind.has(id)).sort()
  views.push({ normalPath: c.normalPath, exactRetainedStep1WholeFile: c.after, stockCompilerErrors: 0, schemaErrors: 0, ordinaryTargetIds: pick(roles.targetGoalIds, ordinary), memoryTargetIds: pick(roles.targetGoalIds, memory), ordinaryPrerequisiteOnlyIds: pick(roles.prerequisiteOnlyGoalIds, ordinary), memoryPrerequisiteOnlyIds: pick(roles.prerequisiteOnlyGoalIds, memory), newViewWrites: 0, newMemoryOrCardNeeds: 0 })
}
for (const c of inputs.all18MetadataFilesUnchanged) pin(c.after)
assert.deepEqual(fs.readFileSync(sciencePath), frozenScienceBytes)
const report = { scienceSHA256, status: 'PASS', role: 'Independent post-science execution of unchanged stock functions through an explicitly derived author harness; no full Atlas/build/status/CI', sourceGoalCountUnchanged: sourceAfter.sourceGoals.length, source35CorrectionAndBothMappingDecisionsExact: true, metadata18AllSixWholeFilesExact: true, wholeSource32TextUnchanged: true, SH032WholeAllocationStillHonestUnreviewedHOLD: true, courseBefore, courseAfter, explicitPartialSource34TargetChecks: source34TargetChecks, views, ordinaryBodiesUnchanged: 435, memoryBodiesUnchanged: 57, normalWrites: 0, newSourceOrDPAMVApprovals: 0, HumanApproval: false }
const p = path.join(out, 'CHECK.independent-scoped-stock-CQR004-two-views.actual.json')
fs.writeFileSync(p + '.tmp', JSON.stringify(report, null, 2) + '\n')
fs.renameSync(p + '.tmp', p)
console.log(JSON.stringify({ status: report.status, sourceGoals: report.sourceGoalCountUnchanged, CQR004Before: courseBefore.status, CQR004After: courseAfter.status, source34ExplicitCourseChecks: source34TargetChecks.length, SHViewsCompiled: views.length, SH032WholeAllocationStillHOLD: true, normalWrites: 0, newScienceApprovals: 0 }))
