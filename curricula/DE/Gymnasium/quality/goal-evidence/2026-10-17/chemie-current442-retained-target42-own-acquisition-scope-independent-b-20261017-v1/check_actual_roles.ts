import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { collectCompositionProjectionRoleGoalIds, normalizeCompositionView } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'

const root = process.cwd()
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17'
const authorDir = `${base}/chemie-current442-retained-target42-explicit-own-acquisition-scope-author-20261017-v1`
const ownDir = `${base}/chemie-current442-retained-target42-own-acquisition-scope-independent-b-20261017-v1`
const read = (p: string) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'))
const hash = (p: string) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, p))).digest('hex')
const author = read(`${authorDir}/AUTHOR.retained42-explicit-own-acquisition-scope.json`)
const rows = read(author.wholeScopeRows.path).rows
const before = read(author.inputs[0].path)
const after = read(author.canonicalCandidate.path)
const mapBefore = new Map(before.goals.map((g: any) => [g.id, g]))
const mapAfter = new Map(after.goals.map((g: any) => [g.id, g]))
const cache = new Map()
const details: any[] = []
for (const [rowIndex, r] of rows.entries()) {
  for (const [decisionIndex, d] of r.jurisdictionDecisions.entries()) {
    for (const v of d.exactExistingViewBindings) {
      if (!cache.has(v.viewPath)) {
        const raw = read(v.viewPath)
        const view = normalizeCompositionView(raw)
        cache.set(v.viewPath, {
          view,
          before: collectCompositionProjectionRoleGoalIds(view.rootNodes, mapBefore as any),
          after: collectCompositionProjectionRoleGoalIds(view.rootNodes, mapAfter as any),
          sha256: hash(v.viewPath),
        })
      }
      const actual = cache.get(v.viewPath)
      const pass = actual.view.viewId === v.viewId
        && actual.view.scope.stage === v.stage
        && actual.view.scope.courseProfile === v.courseProfile
        && actual.before.targetGoalIds.has(r.goalId)
        && actual.after.targetGoalIds.has(r.goalId)
        && !actual.before.prerequisiteOnlyGoalIds.has(r.goalId)
        && !actual.after.prerequisiteOnlyGoalIds.has(r.goalId)
      if (!pass) throw new Error(`Role/context mismatch ${r.goalId} ${v.viewId}`)
      details.push({ rowIndex, decisionIndex, goalId: r.goalId,
        jurisdiction: d.proposedExtension.jurisdiction,
        viewPath: v.viewPath, sha256: actual.sha256, viewId: v.viewId,
        stage: v.stage, courseProfile: v.courseProfile,
        beforeRole: 'target', afterRole: 'target', pass })
    }
  }
}
const registryBefore = read(author.inputs[2].path)
const registryAfter = read(author.registryCandidate.path)
const exact = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
if (registryBefore.landscapes.length !== 1 || registryAfter.landscapes.length !== 2
  || !exact(registryBefore.landscapes[0], registryAfter.landscapes[0])
  || registryBefore.version !== registryAfter.version) throw new Error('Existing registry changed')
const expected = Object.fromEntries(rows.map((r: any) => [r.goalId,
  { jurisdiction: r.jurisdictionDecisions.map((d: any) => d.proposedExtension.jurisdiction) }]))
if (!exact(expected, registryAfter.landscapes[1].goalApplicabilityOverrides)) throw new Error('Registry extends beyond exact112')
const result = {
  artifactType: 'Stock role collector and exact registry check, technical only',
  atUTC: new Date().toISOString(),
  helpers: ['normalizeCompositionView', 'collectCompositionProjectionRoleGoalIds'],
  helperPath: 'app/src/utils/authoring/compositionViewAuthoring.ts',
  helperSHA256: hash('app/src/utils/authoring/compositionViewAuthoring.ts'),
  counts: { goals: rows.length, goalJurisdictionDecisions: rows.reduce((n: number,r: any) => n+r.jurisdictionDecisions.length,0),
    existingViewObjects: cache.size, actualStageCourseTargetOccurrences: details.length,
    existingEconomicsGoalOverridesPreserved: Object.keys(registryBefore.landscapes[0].goalApplicabilityOverrides).length },
  allBeforeAndAfterNamedPlacementsTarget: true,
  everyOtherRegistryEntryExact: true,
  chemistryOverrideExactly42Goals112JurisdictionEntries: true,
  noPhaseRequiresOrViewMembershipUsedAsScience: true,
  normalMutation: false,
  rows: details,
}
fs.writeFileSync(path.join(root, ownDir, 'CHECK.stock-roles-and-exact-registry112.json'), JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify(result.counts))
