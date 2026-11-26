// SPDX-License-Identifier: Apache-2.0
// Actual app projection and filtering, followed by an independent atomic closure.
import assert from 'node:assert/strict'
import {execFileSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import {pathToFileURL} from 'node:url'

async function main() {
  const [repository, output] = process.argv.slice(2)
  assert(repository && output && !fs.existsSync(output))
  const root = path.resolve(repository), baseline = 'eb77c4fb68'
  const digest = (raw: Buffer | string) => createHash('sha256').update(raw).digest('hex')
  const inputs = new Map<string, Buffer>()
  const currentBytes = (p: string) => {
    if (!inputs.has(p)) inputs.set(p, fs.readFileSync(path.join(root, p)))
    return inputs.get(p)!
  }
  const current = (p: string) => JSON.parse(currentBytes(p).toString('utf8'))
  const beforeBytes = (p: string) => execFileSync('git', ['show', `${baseline}:${p}`],
    {cwd: root, maxBuffer: 64 * 1024 * 1024})
  const before = (p: string) => JSON.parse(beforeBytes(p).toString('utf8'))
  const helpers = ['app/src/hooks/useLandscapes.ts', 'app/src/utils/authoring/compositionViewAuthoring.ts',
    'app/src/utils/authoring/canonicalAuthoring.ts', 'app/src/utils/goalFilters.ts']
  for (const p of helpers) assert.deepEqual(currentBytes(p), beforeBytes(p), `native helper changed: ${p}`)
  const load = (p: string) => import(pathToFileURL(path.join(root, p)).href)
  const {prepareLandscapeEntries} = await load(helpers[0])
  const {collectCompositionProjectionRoleGoalIds} = await load(helpers[1])
  const {goalMatchesFilters} = await load(helpers[3])
  const canonical = 'curricula/DE/Gymnasium/canonical'
  const canonicalPaths = fs.readdirSync(path.join(root, canonical)).filter(n => n.endsWith('.json')).sort()
    .map(n => `${canonical}/${n}`)
  assert.equal(canonicalPaths.length, 21)
  function universe(read: (p: string) => any) {
    const docs = canonicalPaths.map(read), entries = prepareLandscapeEntries(docs)
    const goals = new Map<string, any>(entries.flatMap((e: any) => e.goals.map((g: any) => [g.id, g])))
    const roots = new Map(docs.map((d: any) => [d.landscapeId,
      d.goals.find((g: any) => (g.tags ?? []).includes('root'))?.id]))
    return {goals, roots}
  }
  const old = universe(before), now = universe(current)
  function project(view: any, u: ReturnType<typeof universe>, course: string, duration: string) {
    const filters = [view.scope.jurisdiction, course, duration].filter(Boolean)
    const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, u.goals, u.roots)
    const seeds = new Set<string>([...roles.targetGoalIds].filter((id: any) => {
      const g = u.goals.get(id)
      return g && g.type !== 'cluster' && !g.contains.length && goalMatchesFilters(g, filters)
    }) as string[])
    const learning = new Set(seeds), pending = [...seeds]
    while (pending.length) {
      const id = pending.pop()!
      for (const raw of u.goals.get(id)?.requires ?? []) {
        const req = raw.split(':').at(-1)!, g = u.goals.get(req)
        assert(g && !g.contains.length, `unresolved or non-atomic prerequisite ${req}`)
        if (!learning.has(req)) { learning.add(req); pending.push(req) }
      }
    }
    return {seeds: [...seeds].sort(), learning: [...learning].sort()}
  }
  const setDelta = (previous: string[], present: string[]) => ({
    added: present.filter(id => !previous.includes(id)), removed: previous.filter(id => !present.includes(id)),
  })
  const viewDirectory = 'curricula/DE/Gymnasium/composition-views/physik'
  const views = fs.readdirSync(path.join(root, viewDirectory)).filter(n => n.endsWith('.view.json')).sort()
    .map(n => `${viewDirectory}/${n}`)
  assert.equal(views.length, 90)
  const goalSets: Record<string, {count: number; goalIds: string[]}> = {}
  const register = (goalIds: string[]) => {
    const sha256 = digest(goalIds.join('\n') + '\n')
    goalSets[sha256] = {count: goalIds.length, goalIds}
    return {count: goalIds.length, sha256}
  }
  const rows: any[] = [], projected = new Map<string, any>()
  const admittedViews = new Set<string>()
  const newIds = ['b77a7e93-22f9-5722-a4cc-f18a149ab030', '2569d84a-5bf1-542b-bc43-6ade1df971c4'].sort()
  for (const p of views) {
    const previous = before(p), present = current(p)
    for (const course of present.scope.courseProfile ? [present.scope.courseProfile] : ['GK', 'LK']) {
      for (const duration of present.scope.durationModel ? [present.scope.durationModel] : ['G8', 'G9']) {
        const b = project(previous, old, course, duration), a = project(present, now, course, duration)
        const seedDelta = setDelta(b.seeds, a.seeds), learningDelta = setDelta(b.learning, a.learning)
        assert.deepEqual(seedDelta.removed, [], `existing source seeds removed: ${p}`)
        assert(seedDelta.added.every(id => newIds.includes(id)), `unexpected new source seed: ${p}`)
        const shouldAdmit = present.scope.stage !== 'SekII' && !['DE-HE','DE-BW'].includes(present.scope.jurisdiction)
        assert.deepEqual(seedDelta.added, shouldAdmit ? newIds : [], `bounded A2 seed admission: ${p}`)
        assert.deepEqual(learningDelta.removed, [], `existing learning identities removed: ${p}`)
        const expectedLearning = shouldAdmit ? newIds : ['b77a7e93-22f9-5722-a4cc-f18a149ab030']
        // Only a real prerequisite path brings a preparation into a particular filtered learner context.
        if (shouldAdmit || learningDelta.added.length) {
          assert.deepEqual(learningDelta.added, expectedLearning, `bounded A2 learning closure: ${p}`)
        }
        if (shouldAdmit) admittedViews.add(p)
        const row = {sourceViewPath: p, sourceViewId: present.viewId, scope: present.scope, course, duration,
          beforeSeeds: register(b.seeds), currentSeeds: register(a.seeds),
          beforeLearning: register(b.learning), currentLearning: register(a.learning), seedDelta, learningDelta}
        rows.push(row)
        projected.set([present.scope.jurisdiction, present.scope.stage, duration, course, present.scope.durationModel ?? 'neutral'].join('|'),
          {row, previous: b, current: a})
      }
    }
  }
  assert.equal(admittedViews.size, 45)
  // Load the same immutable precedence chain as the real Java consumer.
  const fixturePaths = [
    'contracts/stage-plan-review-evidence/2026-11-16/backend-current-seed-fixtures-v1/seed-scope-comparison.actual.json',
    'contracts/stage-plan-review-evidence/2026-11-17/pr160-backend-ci-repair-v1/sek1-seed-fixtures.actual.json',
    'contracts/stage-plan-review-evidence/2026-11-24/e1-physics-seki-current-v1/sek1-seed-fixtures.actual.json',
    'contracts/stage-plan-review-evidence/2026-11-24/e1-physics-seki-deferred-hh-sn-v2/sek1-seed-fixtures.actual.json',
    'curricula/DE/Gymnasium/quality/learning-units/e2-impuls-newton2-bindings-20261125-v1/inventory/physics-seki-seed-fixtures.actual.json',
    'curricula/DE/Gymnasium/quality/learning-units/e2-impuls-newton2-bindings-20261125-v1/inventory/physics-seki-k2-seed-successor.actual.json',
    'curricula/DE/Gymnasium/quality/learning-units/e2-impuls-newton2-bindings-20261125-v1/inventory/physics-seki-k1-v4-seed-successor.actual.json',
  ]
  const fixtureScopes = Object.assign({}, ...fixturePaths.map(p => current(p).scopes))
  const fixtureChecks: any[] = [], changedFixtureScopes: Record<string, any> = {}
  for (const [key, rawFixture] of Object.entries(fixtureScopes)) {
    if (!key.startsWith('7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a|')) continue
    const fixture = rawFixture as any, [, jurisdiction, stage, duration, course] = key.split('|')
    const rowKey = [jurisdiction, stage, duration, course].join('|')
    const measured = projected.get(`${rowKey}|${duration}`) ?? projected.get(`${rowKey}|neutral`)
    assert(measured, `missing independently projected fixture scope ${key}`)
    assert.deepEqual(measured.previous.seeds, [...fixture.currentSeedAtomicGoalIds].sort(), `baseline fixture seeds ${key}`)
    assert.deepEqual(measured.previous.learning, [...fixture.currentLearningAtomicGoalIds].sort(), `baseline fixture learning ${key}`)
    const seeds = setDelta(fixture.currentSeedAtomicGoalIds, measured.current.seeds)
    const learning = setDelta(fixture.currentLearningAtomicGoalIds, measured.current.learning)
    const changed = seeds.added.length + seeds.removed.length + learning.added.length + learning.removed.length > 0
    fixtureChecks.push({key, sourceViewPath: measured.row.sourceViewPath, changed, seedDelta: seeds, learningDelta: learning})
    if (changed) changedFixtureScopes[key] = {currentSeedAtomicGoalIds: measured.current.seeds,
      currentLearningAtomicGoalIds: measured.current.learning, sourceViewPath: measured.row.sourceViewPath,
      sourceViewId: measured.row.sourceViewId, sourceViewSha256: digest(currentBytes(measured.row.sourceViewPath)),
      addedSeedAtomicGoalIds: seeds.added, removedSeedAtomicGoalIds: seeds.removed,
      addedLearningAtomicGoalIds: learning.added, removedLearningAtomicGoalIds: learning.removed}
  }
  assert.equal(fixtureChecks.length, 20)
  const pins = [...inputs].map(([p, raw]) => ({path: p, sha256: digest(raw)}))
  for (const p of pins) assert.equal(digest(fs.readFileSync(path.join(root, p.path))), p.sha256, `concurrent edit: ${p.path}`)
  const report = {schemaVersion: 1, contract: 'physics-directed-quantity-arrows-native-source-seeds-and-fixtures-v1',
    measuredAt: new Date().toISOString(), baselineCommit: baseline,
    method: 'Actual prepareLandscapeEntries, collectCompositionProjectionRoleGoalIds and goalMatchesFilters, then independent full atomic requires closure. All 90 source views, all represented course/duration contexts; existing 20 Physics fixture rows checked against the actual before and after projections.',
    nativeBackendApiObservation: false, learnerMasteryWritten: false,
    sourceViewCount: views.length, contextCount: rows.length, admittedViewCount: admittedViews.size,
    newSourceSeedGoalIds: newIds, admittedViews: [...admittedViews].sort(), rows,
    exactGoalSetsBySha256: goalSets, setHashEncoding: 'Sorted UTF-8 UUIDs separated by LF, with terminal LF.',
    immutableFixturePrecedence: fixturePaths, fixtureChecks, scopes: changedFixtureScopes,
    changedFixtureScopeCount: Object.keys(changedFixtureScopes).length, inputs: pins}
  fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n', {flag: 'wx'})
  console.log(JSON.stringify({views: views.length, contexts: rows.length, admittedViews: admittedViews.size,
    changedLearningContexts: rows.filter(r => r.learningDelta.added.length || r.learningDelta.removed.length).length,
    checkedExistingFixtureScopes: fixtureChecks.length, changedFixtureScopes: report.changedFixtureScopeCount}))
}
main().catch(error => {console.error(error); process.exit(1)})
