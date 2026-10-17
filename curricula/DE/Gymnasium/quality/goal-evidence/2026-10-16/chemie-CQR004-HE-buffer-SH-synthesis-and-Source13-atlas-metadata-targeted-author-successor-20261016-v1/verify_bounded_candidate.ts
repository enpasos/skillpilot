import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import { evaluateCourseLevelMappingConsistency } from '../../../../../../../app/scripts/generateCurriculumQualityStatus.ts'
import { collectCompositionProjectionRoleGoalIds, compileCompositionView } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'

const out = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-CQR004-HE-buffer-SH-synthesis-and-Source13-atlas-metadata-targeted-author-successor-20261016-v1'
const read = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'))
const checkPin = (p: any) => {
  const b = fs.readFileSync(p.path)
  assert.equal('sha256:' + crypto.createHash('sha256').update(b).digest('hex'), p.sha256)
  assert.equal(b.length, p.bytes)
}
const inputs = read(path.join(out, 'INPUTS.finite-whole-two-primary-cells-and-current-target-contexts.author.json'))
checkPin(inputs.currentWholeCanonical)
const canonical = read(inputs.currentWholeCanonical.path)
const byId = new Map<string, any>(canonical.goals.map((g: any) => [g.id, g]))
const cas = read(path.join(out, 'CAS.finite-seventeen-whole-files-author-candidate.json')).items
const normal = read(path.join(out, 'INPUTS.actual-normal-mapping-and-source-pins-for-bounded-CQR.json'))
const replacement = new Map<string, any>(cas.map((c: any) => [c.normalPath, c]))
for (const c of cas) { checkPin(c.before); checkPin(c.after); checkPin(c.actualHBefore) }
const beforeMapping = normal.mappingFiles.map((m: any) => {
  checkPin(m.actualWhole)
  return { ...read(m.actualWhole.path), file: m.normalPath }
})
const afterMapping = normal.mappingFiles.map((m: any) => ({
  ...read(replacement.get(m.normalPath)?.after.path ?? m.actualWhole.path), file: m.normalPath,
}))
const beforeSources = new Map<string, any>()
const afterSources = new Map<string, any>()
for (const [n, p] of Object.entries(normal.sourceExtractions) as any) {
  checkPin(p)
  beforeSources.set(n, read(p.path))
  afterSources.set(n, read(replacement.get(n)?.after.path ?? p.path))
}
const cqrBefore = evaluateCourseLevelMappingConsistency(canonical, beforeMapping, beforeSources)
const cqrAfter = evaluateCourseLevelMappingConsistency(canonical, afterMapping, afterSources)
assert.equal(cqrBefore.status, 'fail')
assert.equal(cqrBefore.metrics.mismatches, 8)
assert.equal(cqrAfter.status, 'pass')
assert.equal(cqrAfter.metrics.mismatches, 0)
assert.equal(cqrAfter.metrics.sourceGoals, cqrBefore.metrics.sourceGoals)

// The stock CQR skips partial edges. Check the changed contributions explicitly.
const explicitCourseChecks = []
for (const c of cas.filter((x: any) => x.kind.startsWith('HE-') || x.kind.startsWith('SH-two-mapping'))) {
  const after = read(c.after.path)
  for (const delta of c.wholeObjectDeltas.filter((x: any) => x.pointerBefore.startsWith('/mappings/'))) {
    for (const edge of delta.wholeAfterItems ?? [delta.wholeAfter]) {
      const source = afterSources.get(after.sourceExtractionPath).sourceGoals.find((g: any) => g.id === edge.legacyGoalId)
      const expected = source.courseLevel === 'GK_LK' ? ['GK', 'LK'] : [source.courseLevel]
      const target = byId.get(edge.canonicalGoalId)
      assert.ok(expected.every((tag: string) => target.tags.includes(tag)))
      assert.ok(target.applicability.jurisdiction.includes(edge.legacyGoalId.startsWith('he-') ? 'DE-HE' : 'DE-SH'))
      explicitCourseChecks.push({ normalPath: c.normalPath, sourceGoalId: source.id, sourceCourse: source.courseLevel, target: target.id, targetTags: target.tags, compatibleWithoutPartialSkip: true })
    }
  }
}

const kindsPath = inputs.currentWholeCanonical.path.replace('canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json', 'quality/goal-book-publication/chemie.semantic-kinds.json')
const kinds = read(kindsPath)
const entries = kinds.goals ?? kinds.decisions ?? kinds.entries
const ordinaryIds = new Set<string>(entries.filter((x: any) => x.semanticKind === 'curricularAtomic').map((x: any) => x.goalId))
const memoryIds = new Set<string>(entries.filter((x: any) => x.semanticKind === 'memory').map((x: any) => x.goalId))
assert.equal(ordinaryIds.size, 435)
assert.equal(memoryIds.size, 57)
const ajv = new Ajv2020({ allErrors: true, strict: false })
const validateView = ajv.compile(read('contracts/curriculum-package/v1/composition-view.schema.json'))
const sort = (s: Set<string>) => [...s].sort()
const subset = (s: Set<string>, ids: Set<string>) => new Set([...s].filter(i => ids.has(i)))
const views = []
for (const c of cas.filter((x: any) => x.kind.startsWith('SH-two-isolated'))) {
  const before = read(c.before.path), after = read(c.after.path)
  assert.ok(validateView(after), JSON.stringify(validateView.errors))
  const compiledBefore = compileCompositionView(before, canonical)
  const compiledAfter = compileCompositionView(after, canonical)
  assert.equal(compiledBefore.findings.filter(x => x.severity === 'error').length, 0)
  assert.equal(compiledAfter.findings.filter(x => x.severity === 'error').length, 0)
  const a = collectCompositionProjectionRoleGoalIds(before.rootNodes, byId)
  const b = collectCompositionProjectionRoleGoalIds(after.rootNodes, byId)
  const roles: any = {}
  for (const [label, field] of [['target', 'targetGoalIds'], ['prerequisiteOnly', 'prerequisiteOnlyGoalIds']] as const) {
    for (const [kind, ids] of [['ordinary', ordinaryIds], ['memory', memoryIds]] as const) {
      const aa = sort(subset(a[field], ids)), bb = sort(subset(b[field], ids))
      assert.deepEqual(bb, aa)
      roles[kind + '-' + label] = { before: aa, after: bb, exact: true }
    }
  }
  assert.ok(a.targetGoalIds.has('539476ee-f9cd-5b66-9b2e-ab42c4ea7cf4'))
  assert.ok(b.targetGoalIds.has('539476ee-f9cd-5b66-9b2e-ab42c4ea7cf4'))
  assert.deepEqual(sort(a.prerequisiteOnlyGoalIds), sort(b.prerequisiteOnlyGoalIds))
  assert.deepEqual(sort(new Set([...a.targetGoalIds].filter(id => id !== 'cf2631d9-da24-50e8-9e50-db625e6efaad'))), sort(b.targetGoalIds))
  views.push({ normalPath: c.normalPath, schemaErrors: 0, stockCompilerErrorsBefore: 0, stockCompilerErrorsAfter: 0, roles, onlyRemovedTarget: 'cf2631d9-da24-50e8-9e50-db625e6efaad', removedNodeIsOrdinaryOrMemory: false, noNewCardsOrMemoryNeed: true })
}
const report = {
  role: 'Bounded unchanged-stock code execution on inactive author candidate only; no full Atlas or status generation',
  cqrBefore, cqrAfter, explicitCourseChecks, views,
  canonicalNodesUnchanged: canonical.goals.length, ordinaryIdsUnchanged: ordinaryIds.size,
  memoryIdsUnchanged: memoryIds.size, normalWrites: 0,
  partialEdgesSkippedByStockCQR: true, authorProposalStillNeedsIndependentSourceReview: true,
  newFachlicheClosures: 0, humanApproval: false, humanTrial: false,
}
fs.writeFileSync(path.join(out, 'CHECK.actual-stock-CQR004-and-two-SH-role-schema-compiler.json'), JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify({ status: 'PASS', CQR004Before: cqrBefore.status, CQR004BeforeMismatches: cqrBefore.metrics.mismatches, CQR004Candidate: cqrAfter.status, CQR004CandidateMismatches: cqrAfter.metrics.mismatches, explicitPartialCourseChecks: explicitCourseChecks.length, SHViews: views.length, ordinaryIdsUnchanged: ordinaryIds.size, memoryIdsUnchanged: memoryIds.size, normalWrites: 0, newScienceVotes: 0 }))
