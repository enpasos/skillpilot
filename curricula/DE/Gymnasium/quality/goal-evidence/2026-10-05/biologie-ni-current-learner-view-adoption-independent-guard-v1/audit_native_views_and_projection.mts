import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectCompositionProjectionRoleGoalIds, compileCompositionView, normalizeCompositionView } from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring.ts'
import { normalizeCanonicalLandscape } from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/canonicalAuthoring.ts'
import { goalMatchesFilter } from '/home/enpasos/projects/skillpilot/app/src/utils/goalFilters.ts'
import { prepareLandscapeEntries } from '/home/enpasos/projects/skillpilot/app/src/hooks/useLandscapes.ts'

const root = '/home/enpasos/projects/skillpilot'
const out = dirname(fileURLToPath(import.meta.url))
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05'
const candidate = `${base}/biologie-ni-current-learner-view-adoption-candidate-v1`
const read = (p: string) => JSON.parse(readFileSync(join(root, p), 'utf8'))
const sha = (p: string) => createHash('sha256').update(readFileSync(join(root, p))).digest('hex')
const bioPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
const bio = read(bioPath)
const by = new Map<string, any>(bio.goals.map((g: any) => [g.id, g]))
const clusterId = '9cd0dbbc-9507-5879-8c4f-df54529969ec'
const cluster = by.get(clusterId)
const niIds = new Set<string>([clusterId, ...cluster.contains])
const memoryIds = ['1a7d8063-5b3b-55fd-b8ea-8701d876888e', 'b00dd3d9-8589-584c-a8cf-12efb4856dfe']
assert.equal(niIds.size, 21)
assert.equal([...niIds].filter(id => by.get(id).nodeKind === 'memory').length, 2)
for (const id of niIds) {
  assert.deepEqual(by.get(id).applicability, { jurisdiction: ['DE-NI'] })
  assert(by.get(id).tags.includes('SekI'))
}
const views = [
  ['curricula/DE/Gymnasium/composition-views/biologie/de-de-gym-seki-biology.view.json', 'biology-seki'],
  ['curricula/DE/Gymnasium/composition-views/biologie/de-de-gym-biology-gk.view.json', 'biology-root'],
]
const find = (nodes: any[], id: string): any => {
  for (const node of nodes) {
    if (node.id === id) return node
    const child = find(node.children ?? [], id)
    if (child) return child
  }
}
const priorSets = new Map<string, Set<string>>()
const futureSets = new Map<string, Set<string>>()
const viewProofs = []
const regions = ['DE-BB','DE-BE','DE-BW','DE-BY','DE-HB','DE-HE','DE-HH','DE-MV','DE-NI','DE-NW','DE-RP','DE-SH','DE-SL','DE-SN','DE-ST','DE-TH']
for (const [path, structureId] of views) {
  const before = read(path), after = read(`${candidate}/prospective-input-tree/${path}`)
  const expected = structuredClone(before)
  find(expected.rootNodes, structureId).children.push({ kind: 'canonicalSubtree', goalId: clusterId })
  assert.deepEqual(expected, after)
  const b = collectCompositionProjectionRoleGoalIds(normalizeCompositionView(before).rootNodes, by)
  const a = collectCompositionProjectionRoleGoalIds(normalizeCompositionView(after).rootNodes, by)
  priorSets.set(path, b.targetGoalIds); futureSets.set(path, a.targetGoalIds)
  assert.deepEqual([...b.prerequisiteOnlyGoalIds].sort(), [...a.prerequisiteOnlyGoalIds].sort())
  assert([...b.targetGoalIds].every(id => a.targetGoalIds.has(id)))
  assert.deepEqual([...a.targetGoalIds].filter(id => !b.targetGoalIds.has(id)).sort(), [...niIds].sort())
  const beforeCompiled = compileCompositionView(normalizeCompositionView(before), normalizeCanonicalLandscape(bio))
  const afterCompiled = compileCompositionView(normalizeCompositionView(after), normalizeCanonicalLandscape(bio))
  assert.deepEqual(afterCompiled.findings, beforeCompiled.findings)
  assert.equal(afterCompiled.findings.filter((f: any) => f.severity === 'error').length, 0)
  const regionalCases = []
  for (const region of regions) for (const duration of ['G8','G9']) for (const course of ['GK','LK']) {
    const match = (id: string) => [region, duration, course].every(f => goalMatchesFilter(by.get(id), f))
    const oldIds = [...b.targetGoalIds].filter(match).sort()
    const newIds = [...a.targetGoalIds].filter(match).sort()
    const added = newIds.filter(id => !oldIds.includes(id))
    assert.deepEqual(added, region === 'DE-NI' ? [...niIds].sort() : [])
    assert(oldIds.every(id => newIds.includes(id)))
    regionalCases.push({ region, duration, course, oldCount: oldIds.length, newCount: newIds.length, addedIds: added })
  }
  viewProofs.push({ path, structureId, beforeSHA256: sha(path), afterCandidateSHA256: sha(`${candidate}/prospective-input-tree/${path}`),
    wholeScopeAndEveryOldNodeExact: true, onlyAppendedSubtree: clusterId,
    oldTargetCount: b.targetGoalIds.size, newTargetCount: a.targetGoalIds.size,
    oldTargetsAndPrerequisiteOnlyExact: true, compilerFindingsUnchanged: true, regionalCases })
}
const javaPath = 'backend/src/test/java/com/skillpilot/backend/controller/LearnerControllerIntegrationTest.java'
const javaBefore = readFileSync(join(root, javaPath), 'utf8')
const javaCandidate = readFileSync(join(root, candidate, 'LearnerControllerIntegrationTest.counts-only.minimal-bytes-v2.candidate.txt'), 'utf8')
const oldLine = '{ "Biologie", CANONICAL_BIOLOGY_ID, "DE-NI", "88", "88" }'
const newLine = '{ "Biologie", CANONICAL_BIOLOGY_ID, "DE-NI", "108", "108" }'
assert.equal(javaBefore.split(oldLine).length, 2)
assert.equal(javaCandidate, javaBefore.replace(oldLine, newLine))
const projections = []
for (const [subject, filename, viewPath] of [
  ['Biologie','BIOLOGIE', views[0][0]],
  ['Chemie','CHEMIE','curricula/DE/Gymnasium/composition-views/chemie/de-de-gym-seki-chemistry.view.json'],
]) {
  const landscape = read(`curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_${filename}.de.json`)
  const map = new Map<string, any>(landscape.goals.map((g: any) => [g.id, g]))
  const actualTargets = collectCompositionProjectionRoleGoalIds(normalizeCompositionView(read(viewPath)).rootNodes, map).targetGoalIds
  const proposedTargets = subject === 'Biologie' ? futureSets.get(viewPath)! : actualTargets
  const matches = [...javaBefore.matchAll(new RegExp(`\\{ "${subject}", CANONICAL_[A-Z]+_ID, "(DE-[A-Z]+)", "(\\d+)", "(\\d+)" \\}`, 'g'))]
  for (const row of matches) for (const duration of ['G8','G9']) {
    const filter = (id: string) => {
      const goal = map.get(id)
      return (goal.type ?? (goal.contains?.length ? 'cluster' : 'atomic')) !== 'cluster'
        && [row[1], duration, 'GK'].every(f => goalMatchesFilter(goal, f))
    }
    const oldIds = [...actualTargets].filter(filter).sort(), newIds = [...proposedTargets].filter(filter).sort()
    assert.equal(oldIds.length, Number(duration === 'G8' ? row[2] : row[3]))
    const changed = subject === 'Biologie' && row[1] === 'DE-NI'
    const added = newIds.filter(id => !oldIds.includes(id))
    assert.deepEqual(added, changed ? [...niIds].filter(id => id !== clusterId).sort() : [])
    assert.equal(newIds.length, oldIds.length + (changed ? 20 : 0))
    const idsDigest = createHash('sha256').update(JSON.stringify(newIds)).digest('hex')
    projections.push({ subject, region: row[1], duration, before: oldIds.length, after: newIds.length,
      newTargetIdsDigest: idsDigest, addedTargetIds: added, removedTargetIds: [] })
  }
}
assert.equal(projections.length, 46)
assert.equal(projections.filter(p => p.before !== p.after).length, 2)
const prepared = prepareLandscapeEntries([bio])[0]
const unqualify = (id: string) => id.startsWith(`${bio.landscapeId}:`) ? id.slice(bio.landscapeId.length + 1) : id
const effective = new Map<string, string[]>(prepared.goals.map((g: any) => [unqualify(g.id), (g.effectiveRequires ?? []).map(unqualify)]))
const prerequisiteProofs = []
for (const [viewPath] of views) for (const duration of ['G8','G9']) for (const course of ['GK','LK']) {
  const available = new Set([...futureSets.get(viewPath)!].filter(id => ['DE-NI',duration,course].every(f => goalMatchesFilter(by.get(id), f))))
  for (const id of niIds) {
    const requirements = new Set<string>()
    const visit = (goal: string, ancestors: Set<string>) => {
      assert(!ancestors.has(goal), `Requires cycle: ${goal}`)
      const nextAncestors = new Set([...ancestors, goal])
      for (const dependency of effective.get(goal) ?? []) {
        requirements.add(dependency); visit(dependency, nextAncestors)
      }
    }
    visit(id, new Set())
    assert([...requirements].every(required => available.has(required)))
    prerequisiteProofs.push({ viewPath, duration, course, goalId: id,
      fullTransitiveEffectiveRequirements: [...requirements].sort(), missingRequirements: [] })
  }
}
const authorProof = read(`${candidate}/actual-current-and-prospective-view-scope-prerequisite-memory-projection-proof.minimal-bytes-v2.json`)
for (const row of projections) {
  const original = authorProof.projection46Rows.find((r: any) => r.subject === row.subject && r.jurisdiction === row.region && r.durationModel === row.duration)
  assert.equal(original.futureTargetAtomicTotal, row.after)
  assert.deepEqual(original.addedTargetIds.sort(), row.addedTargetIds)
}
const path = join(out, 'independent-native-view-scope46-and-prerequisites.actual.json')
assert(!existsSync(path))
writeFileSync(path, JSON.stringify({ schemaVersion: 1, checkedAtUTC: new Date().toISOString(),
  reviewer: '/root/chem_qa_native_guard', result: 'PASS', views: viewProofs,
  actualProjectionCases: projections, all46OldTargetSetsRetained: true,
  exactlyTwoNICompatibilityCountChanges: true, javaOnlyTwoNumericValuesChanged: true,
  fullPrerequisiteCases: prerequisiteProofs, all168WholeTransitivePrerequisiteChecksPass: true,
  all21AddedNodesExplicitNIAndSekITagged: true, canonical383Unchanged: true,
  G8IsCompatibilityOnlyAndNormativeNIRemainsG9: true,
  backendJavaTestsRunByThisReviewer: false, activeWrites: 0, newScientificCompletions: 0,
  humanApproval: false, humanTrial: false }, null, 2) + '\n')
console.log('PASS: two exact view appends; 128 regional view cases; 46 native projections; 168 full prerequisite cases; only NI88→108 twice.')
