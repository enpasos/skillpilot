// SPDX-License-Identifier: Apache-2.0
// Technical merge checks only. Scientific judgments remain in their actual original runs.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const repo = process.cwd()
const own = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path: string) => JSON.parse(readFileSync(resolve(repo, path), 'utf8'))
const local = (path: string) => JSON.parse(readFileSync(resolve(own, path), 'utf8'))
const map = local('checks/REBUILD.memory560-native13.physical-exact-map.v2.json')
const host = resolve(repo, map.executionHost)
const config = local('config/central.current422.memory560-genuine13-inactive.config.json').subjects[0]
const landscape = JSON.parse(readFileSync(resolve(host, config.landscapePath), 'utf8'))
const semantic = JSON.parse(readFileSync(resolve(host, config.semanticKindLedgerPath), 'utf8'))
const { fingerprintSemanticKindSourceGoal } = await import(pathToFileURL(resolve(host, 'app/scripts/goalBookModel.ts')).href)
const goals = new Map<string, any>(landscape.goals.map((goal: any) => [goal.id, goal]))
assert.equal(goals.size, 560)
assert.equal(semantic.counts.curricularAtomic, 422)
assert.deepEqual(semantic.decisions.filter((row: any) => row.sourceFingerprint !== fingerprintSemanticKindSourceGoal(goals.get(row.goalId))), [])
for (const field of ['requires', 'contains']) {
  const complete = new Set<string>(), visiting = new Set<string>()
  const visit = (id: string) => {
    assert.ok(!visiting.has(id), `${field} cycle at ${id}`)
    if (complete.has(id)) return
    visiting.add(id)
    for (const ref of goals.get(id)?.[field] ?? []) {
      assert.ok(goals.has(ref), `${field} missing ${ref}`)
      visit(ref)
    }
    visiting.delete(id); complete.add(id)
  }
  for (const id of goals.keys()) visit(id)
  assert.equal(complete.size, 560)
}
const alias = new Map<string, string>(map.aliases.map((row: any) => [row.normalHostAlias, row.physicalRepositorySource.path]))
const actual = (path: string) => alias.get(path) ?? path
const seen = new Map<string, string>()
for (const key of ['positiveEvidenceConfigPaths', 'semanticAtomicityConfigPaths']) {
  for (const path of config[key]) {
    const c = read(actual(path))
    assert.equal(c.landscapePath, config.landscapePath)
    if (c.semanticKindLedgerPath) assert.equal(c.semanticKindLedgerPath, config.semanticKindLedgerPath)
    for (const line of readFileSync(resolve(repo, actual(c.reviewPath)), 'utf8').split('\n').filter(Boolean)) {
      const row = JSON.parse(line), id = `${key}:${row.goalId}`
      assert.ok(!seen.has(id), `Duplicate ${id}: ${seen.get(id)} / ${path}`)
      seen.set(id, path)
    }
  }
}
const baselineRoot = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-lab2-current422-paired-and-inactive-integration-technical-20261015-v1/'
const before = read(baselineRoot + 'candidate/canonical554.current422.lab2-plus-existing-carbonyl3.exact.json')
const prep = local('INPUTS.original-final-science-and-baseline.json')
const selector = read(prep.native13Selector.path)
const thirteen = selector.scopeGoalIds as string[]
for (const id of thirteen) assert.deepEqual(goals.get(id), before.goals.find((goal: any) => goal.id === id))
const index = local('native-thirteen/resolution-index.json')
assert.deepEqual(new Set(index.resolutions.map((row: any) => row.goalId)), new Set(thirteen))
assert.ok(!index.deferredGoalIds?.length)
const ownership = local('CAS.actual-P1-selection-retained-six-and-D13-current-owners.json')
assert.equal(ownership.actualThirteenCurrentOwnersBefore.length, 13)
for (const row of ownership.actualThirteenCurrentOwnersBefore) {
  const edges = config.resolutionSupersessions.filter((edge: any) => edge.goalId === row.goalId)
  const last = edges.filter((edge: any) => edge.replacementIndexPath === ownership.newIndexPathPendingActualGenuineDpair)
  assert.equal(last.length, 1)
  assert.equal(last[0].supersededIndexPath, row.indexPath)
}
for (const row of map.stockPhysicalModules) {
  const bytes = readFileSync(resolve(host, row.path))
  assert.equal('sha256:' + createHash('sha256').update(bytes).digest('hex'), row.sha256)
}
for (const row of map.aliases) {
  const bytes = readFileSync(resolve(host, row.normalHostAlias))
  assert.equal('sha256:' + createHash('sha256').update(bytes).digest('hex'), row.physicalRepositorySource.sha256)
}
const result = {
  pass: true, role: 'Exact bounded technical preflight; no scientific votes',
  wholeGoals: 560, ordinaryDenominator: 422, directRequiresDAG: true, containsDAG: true,
  semanticSourceFingerprintsCurrent: true, duplicatePOrARows: 0,
  thirteenOrdinaryBodiesUnchanged: true, genuineThirteenIndexSelected: true,
  oldDescriptionClaimsKeptWithExplicitLinearSupersessions: true,
  memoryNormalTenScopeCheckPassed: local('checks/M422-ten-scopes-current.command.actual.json').exitCode === 0,
  P1ActualImageReviewCheckPassed: local('checks/P1-actual-image-context-current.command.actual.json').exitCode === 0,
  sixRetainedOriginalAcidProfilesCurrent: local('checks/P7-retained-six-current.command.actual.json').exitCode === 0,
  physicalNormalAliases: map.aliases.length, physicalStockModules: map.stockPhysicalModules.length,
  newScientificStrictClosuresClaimed: 0, sourceCourseHoldsCleared: false,
  activeIntegration: false, humanApproval: false,
}
assert.ok(result.memoryNormalTenScopeCheckPassed && result.P1ActualImageReviewCheckPassed && result.sixRetainedOriginalAcidProfilesCurrent)
writeFileSync(resolve(own, 'checks/CHECK.final-inputs-before-single-central.actual.json'), JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify(result))
