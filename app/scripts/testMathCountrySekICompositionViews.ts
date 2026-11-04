import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { compileCompositionView, type CompositionViewNode } from '../src/utils/authoring/compositionViewAuthoring'
import type { CanonicalAuthoringLandscape } from '../src/utils/authoring/canonicalAuthoring'
import {
  assertMathStageMaterializationAllowed,
  deriveMathCountrySekIViews,
  deriveMathExistingStageViews,
  type BoundStageFile,
  type StagePolicy,
  type StageReviewReceipt,
} from './generateMathCountrySekICompositionViews'
import { applyReviewedMathAssessmentVariants } from './mathAssessmentScopeVariants'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const policyPath = 'app/scripts/config/math-country-seki-stage-policy.json'
const generatorPath = 'app/scripts/generateMathCountrySekICompositionViews.ts'
const bytes = readFileSync(resolve(root, policyPath), 'utf8')
const policy = JSON.parse(bytes) as StagePolicy
const canonical = JSON.parse(readFileSync(resolve(root, policy.canonical.path), 'utf8')) as CanonicalAuthoringLandscape
const goalById = new Map(canonical.goals.map(goal => [goal.id, goal]))
const sha = (value: string | Buffer) => createHash('sha256').update(value).digest('hex')
const id = (prefix: string) => canonical.goals.find(goal => goal.id.startsWith(prefix))!.id
const rows = deriveMathCountrySekIViews(root, policy)
assert.equal(rows.length, 12)
assert.deepEqual(deriveMathCountrySekIViews(root, policy), rows, 'generation must be deterministic')
assert(rows.every(row => row.view.scope.stage === 'SekI' && !('courseProfile' in row.view.scope) && !('durationModel' in row.view.scope)))
const country = (jurisdiction: string) => rows.find(row => row.jurisdiction === jurisdiction)!
const targets = (jurisdiction: string) => new Set(country(jurisdiction).courses[0].compiledGoalIds)
const hh = country('DE-HH')
const raw = compileCompositionView({ ...hh.view, rootNodes: hh.view.rootNodes.filter(node => node.kind === 'structure') }, canonical)
const compiledIds = (nodes: typeof raw.compiledRootNodes): string[] => nodes.flatMap(node => [...(node.sourceGoalId ? [node.sourceGoalId] : []), ...compiledIds(node.children)])
assert(compiledIds(raw.compiledRootNodes).some(goalId => !targets('DE-HH').has(goalId)), 'dropping outer masks must expose an actually excluded source reference')
assert(!targets('DE-HH').has(id('2850e8f6')))
assert(!targets('DE-BB').has(id('06bdbecb')), 'explicit BB-LK secondary placement must not reappear in SekI')
assert(!targets('DE-BB').has('509ae03b-96b1-4bb1-b015-b83d14569dae'))
for (const source of policy.countries.find(entry => entry.jurisdiction === 'DE-BY')!.sources) {
  assert(source.secondaryTargets.length >= 5)
  assert(source.secondaryTargets.every(target => !targets('DE-BY').has(target.goalId)), 'BY outer secondary exam targets must remain outside SekI')
}
for (const prefix of ['2fb12329', 'c420e0be', '4ac925cf', '759485a9']) assert(!targets('DE-MV').has(id(prefix)), `overbroad MV target ${prefix}`)
for (const prefix of ['74dc4b0d', '96c55cb6', '671ef00a', '3019e775', 'efc3506a', '647ec09d']) assert(targets('DE-MV').has(id(prefix)), `source-supported MV target ${prefix}`)
for (const prefix of ['17c9e061', '647ec09d']) assert(!targets('DE-NI').has(id(prefix)), `overbroad NI target ${prefix}`)
for (const prefix of ['9278bc5e', 'fbcb4ad3']) assert(targets('DE-NI').has(id(prefix)), `source-supported NI target ${prefix}`)
assert(country('DE-MV').courses.every(course => course.prerequisiteOnlyGoalIds.includes(id('4ac925cf')) && course.prerequisiteOnlyGoalIds.includes(id('759485a9'))), 'required ordinary support remains available without a target assertion')

// Exact independently reviewed task scopes must agree across stage choices.
const existingRows = deriveMathExistingStageViews(root, policy)
const allRows = [...rows, ...existingRows]
for (const operation of policy.assessmentScopeOperations) {
  const row = allRows.find(candidate => candidate.view.viewId === operation.viewId)
  if (!row) {
    // These are generated and byte-checked by the existing duration CLI; the
    // country/existing authoring functions deliberately do not duplicate it.
    assert(policy.durationOutputViewIds.includes(operation.viewId), `assessment operation must have a generated view: ${operation.id}`)
    continue
  }
  const preview = compileCompositionView(row.view, canonical)
  const visible = compiledIds(preview.compiledRootNodes)
  const findAnchor = (nodes: typeof preview.compiledRootNodes): typeof preview.compiledRootNodes[number] | undefined => {
    for (const node of nodes) {
      if (node.runtimeId === `structure:${operation.anchorStructureId}`) return node
      const found = findAnchor(node.children)
      if (found) return found
    }
  }
  for (const goalId of operation.goalIds) {
    if (operation.action === 'exclude-target') assert(!visible.includes(goalId), operation.id)
    else {
      assert.equal(visible.filter(id => id === goalId).length, 1, `exactly one visible task parent: ${operation.id}`)
      assert(compiledIds([findAnchor(preview.compiledRootNodes)!]).includes(goalId), `actual stage/focus placement: ${operation.id}`)
    }
  }
}
for (const code of ['ni', 'th']) for (const stage of ['', 'sekii-']) {
  const lk = existingRows.find(row => row.view.viewId === `de-${code}-gym-${stage}math-lk`)!
  assert(compiledIds(compileCompositionView(lk.view, canonical).compiledRootNodes).includes(id('2f8a3a90')), 'GK exclusion must preserve the selected LK task and its course union')
}

// The selector must agree after the separately reviewed selection extension;
// before integration, the mismatch is an explicit materialization hold.
const variantExtensionPresent = policy.variantSelections.every(selection => {
  const actual = JSON.parse(readFileSync(resolve(root, selection.selection.path), 'utf8')) as { targetViewIds: string[] }
  return selection.addedTargetViewIds.every(id => actual.targetViewIds.includes(id))
})
const mv = country('DE-MV').view
if (variantExtensionPresent) assert.deepEqual(applyReviewedMathAssessmentVariants(mv, goalById, root), mv, 'the reviewed registry must preserve the exact generated variant')
else assert.notDeepEqual(applyReviewedMathAssessmentVariants(mv, goalById, root), mv, 'the existing registry must expose the pending extension')
assert.throws(() => assertMathStageMaterializationAllowed(root, policy, bytes),
  policy.openScopeHolds.length ? /HOLD: unresolved stage scope/ : /exact independent/)
const noHolds = structuredClone(policy)
noHolds.openScopeHolds = []
assert.throws(() => assertMathStageMaterializationAllowed(root, noHolds, JSON.stringify(noHolds)), /exact independent/)
const sourceDecisions = JSON.parse(readFileSync(resolve(root, policy.sourceDecisions.path), 'utf8')) as { decisions: Array<{ id: string }> }
const noHoldBytes = JSON.stringify(noHolds)
const receipt: StageReviewReceipt = {
  verdict: 'PASS', authorIndependent: true, policySha256: sha(noHoldBytes), sourceDecisionsSha256: policy.sourceDecisions.sha256,
  generatorSha256: sha(readFileSync(resolve(root, generatorPath))),
  approvedViewIds: [...rows.map(row => row.view.viewId), ...policy.existingStageViews.map(view => view.outputViewId), ...policy.durationOutputViewIds],
  approvedSourceDecisionIds: sourceDecisions.decisions.map(decision => decision.id),
  approvedStageRuleIds: policy.stageRules.map(rule => rule.id),
  approvedAssessmentScopeOperationIds: policy.assessmentScopeOperations.map(operation => operation.id),
  approvedVariantExtensions: policy.variantSelections.filter(selection => selection.addedTargetViewIds.length)
    .map(selection => ({ variantGoalId: selection.variantGoalId, addedTargetViewIds: selection.addedTargetViewIds })),
}
if (variantExtensionPresent) assert.doesNotThrow(() => assertMathStageMaterializationAllowed(root, noHolds, noHoldBytes, receipt))
else assert.throws(() => assertMathStageMaterializationAllowed(root, noHolds, noHoldBytes, receipt), /not present in the bound registry selection/)
assert.throws(() => assertMathStageMaterializationAllowed(root, noHolds, `${noHoldBytes}\n`, receipt), /exact independent/)
assert.throws(() => assertMathStageMaterializationAllowed(root, noHolds, noHoldBytes, { ...receipt, approvedVariantExtensions: [] }), /variant extension/)
const staleSharedHelper = structuredClone(noHolds)
staleSharedHelper.nativeStageHelper.sha256 = '0'.repeat(64)
assert.throws(() => assertMathStageMaterializationAllowed(root, staleSharedHelper, JSON.stringify(staleSharedHelper), receipt), /STALE_INPUT/,
  'a duration entry point cannot activate changed shared authoring code using an older review')
assert.throws(() => deriveMathCountrySekIViews(root, { ...policy, canonical: { ...policy.canonical, sha256: '0'.repeat(64) } }), /STALE_INPUT/)
const sourceDrift = structuredClone(policy)
sourceDrift.sourceBindings[0].sha256 = '0'.repeat(64)
assert.throws(() => deriveMathCountrySekIViews(root, sourceDrift), /STALE_INPUT/)
const unboundStageCorrection = structuredClone(policy)
unboundStageCorrection.stageRules[0].additionalSourceDecisions = ['unbound-stage-correction.json#case']
assert.throws(() => deriveMathCountrySekIViews(root, unboundStageCorrection), /exact bound independent source decision/)
const missingSupplement = structuredClone(policy)
const hhSource = missingSupplement.countries.find(entry => entry.jurisdiction === 'DE-HH')!.sources[0]
const hhSourceView = JSON.parse(readFileSync(resolve(root, hhSource.view.path), 'utf8')) as { rootNodes: CompositionViewNode[] }
const hhRoot = hhSourceView.rootNodes.find(node => node.kind === 'structure' && node.id === hhSource.rootStructureId)
assert(hhRoot?.kind === 'structure')
const outerSupplement = hhRoot.children.some(node => node.kind === 'structure' && hhSource.supplementIds.includes(node.id))
hhSource.supplementIds = []
if (outerSupplement) assert.throws(() => deriveMathCountrySekIViews(root, missingSupplement), /unassigned or missing root fragment/)
// After source rebase, the same reviewed structure is already inside SekI;
// the unknown-outer-target mutation below still exercises the strict boundary.
const wrongCorrection = structuredClone(policy)
const wrongSource = wrongCorrection.countries.find(entry => entry.jurisdiction === 'DE-NI')!.sources[0]
wrongSource.expectedRemovedTargetGoalIds = []
const wrongReplacement = wrongSource.corrections[0].replacementNodes[0]
if (wrongReplacement.kind === 'structure') wrongReplacement.label += ' (mutation)'
else if (wrongReplacement.kind !== 'landscapeEntry') wrongReplacement.displayLabel = 'Mutation'
assert.throws(() => deriveMathCountrySekIViews(root, wrongCorrection), /source correction target delta differs|exact source before\/after correction reference changed/)

const fixture = mkdtempSync(resolve(root, 'tmp/math-stage-regression-'))
const bindings: BoundStageFile[] = [policy.canonical, policy.nativeCompiler, policy.nativeCanonicalHelper, policy.nativeStageHelper, policy.durationGenerator, policy.stageDecision, ...policy.stageDecisionBindings,
  ...policy.sourceBindings, policy.sourceDecisions, policy.variantRegistry,
  ...policy.variantSelections.flatMap(selection => [selection.selection, selection.contentReview, selection.placementReview]),
  ...policy.countries.flatMap(entry => entry.sources.flatMap(source => [source.view, ...source.secondaryTargets.map(target => target.view)])),
  ...policy.existingStageViews.map(operation => operation.source),
  ...JSON.parse(readFileSync(resolve(root, policy.sourceDecisions.path), 'utf8')).decisions.flatMap((decision: { primary: BoundStageFile[] }) => decision.primary),
]
try {
  for (const path of new Set([policyPath, ...bindings.map(binding => binding.path)])) {
    mkdirSync(dirname(resolve(fixture, path)), { recursive: true })
    symlinkSync(resolve(root, path), resolve(fixture, path))
  }
  const mutation = (plan: StagePolicy, source: BoundStageFile, mutate: (value: { rootNodes: CompositionViewNode[] }) => void) => {
    const path = resolve(fixture, source.path)
    unlinkSync(path)
    copyFileSync(resolve(root, source.path), path)
    const value = JSON.parse(readFileSync(path, 'utf8'))
    mutate(value)
    const content = JSON.stringify(value)
    writeFileSync(path, content)
    source.sha256 = sha(content)
    for (const operation of plan.existingStageViews) if (operation.source.path === source.path) operation.source.sha256 = source.sha256
  }
  const unknown = structuredClone(policy)
  const firstSource = JSON.parse(readFileSync(resolve(root, unknown.countries[0].sources[0].view.path), 'utf8'))
  const firstSourceIds = new Set(compiledIds(compileCompositionView(firstSource, canonical).compiledRootNodes))
  const unknownGoal = canonical.goals.find(goal => !goal.contains?.length && !firstSourceIds.has(goal.id))!.id
  mutation(unknown, unknown.countries[0].sources[0].view, value => value.rootNodes.push({ kind: 'goalEntry', goalId: unknownGoal }))
  assert.throws(() => deriveMathCountrySekIViews(fixture, unknown), /unassigned outer target/)
  const firstPath = resolve(fixture, unknown.countries[0].sources[0].view.path)
  unlinkSync(firstPath)
  symlinkSync(resolve(root, unknown.countries[0].sources[0].view.path), firstPath)
  const divergent = structuredClone(policy)
  const niSource = divergent.countries.find(entry => entry.jurisdiction === 'DE-NI')!.sources[0]
  mutation(divergent, niSource.view, value => {
    const prune = (nodes: CompositionViewNode[]): void => {
      for (const node of nodes) if (node.kind === 'structure') {
        if (node.id === niSource.supplementIds[0]) node.children = node.children.filter(child => child.kind === 'structure' || child.kind === 'landscapeEntry' || child.goalId !== id('88abc886'))
        else prune(node.children)
      }
    }
    prune(value.rootNodes)
  })
  assert.throws(() => deriveMathCountrySekIViews(fixture, divergent), /GK\/LK stage targets differ/)

  // Exercise the real duration CLI without modifying the live policy. Empty
  // stage rules must not bypass the shared source/task materialization gate.
  const guardHookPath = resolve(fixture, 'empty-rules-guard.mjs')
  writeFileSync(guardHookPath, `
import fs from 'node:fs'
import { syncBuiltinESMExports } from 'node:module'
const originalRead = fs.readFileSync
const policyPath = ${JSON.stringify(resolve(root, policyPath))}
fs.readFileSync = function (path, ...args) {
  const value = originalRead.call(this, path, ...args)
  if (String(path) !== policyPath) return value
  const policy = JSON.parse(String(value))
  policy.stageRules = []
  policy.openScopeHolds = [{ goalId: 'empty-rules-cli-regression' }]
  const content = JSON.stringify(policy)
  return typeof value === 'string' ? content : Buffer.from(content)
}
syncBuiltinESMExports()
`)
  const guardedCheck = spawnSync(process.execPath, [
    '--import', guardHookPath, '--import', 'tsx',
    resolve(root, 'app/scripts/generateMathDurationCompositionViews.ts'), '--check',
  ], { cwd: resolve(root, 'app'), encoding: 'utf8', timeout: 20_000 })
  assert.ifError(guardedCheck.error)
  assert.notEqual(guardedCheck.status, 0, 'an unresolved task/source decision must reject the duration check')
  assert.match(`${guardedCheck.stdout}\n${guardedCheck.stderr}`,
    /HOLD: unresolved stage scope: empty-rules-cli-regression/,
    'the actual duration entry point must invoke the shared gate even without stage rules')
} finally {
  rmSync(fixture, { recursive: true, force: true })
}
console.log('PASS: 12 country views, 24 native source compiles, complete masks, exact source corrections, independent approval and mutation guards')
