import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { closeSync, existsSync, mkdirSync, mkdtempSync, openSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { LearningGoal, SkillLandscape } from '../src/landscapeTypes'
import { getOfferedGymnasiumDurationModels, isGymnasiumSubjectOfferedForStageSelection } from '../src/utils/durationModel'
import { getDisplayCourseProfileFilters } from '../src/utils/filterLabels'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
export const DEFAULT_OUTPUT = 'tmp/learning-units/offered-membership.json'
const sha = (value: string | Buffer) => createHash('sha256').update(value).digest('hex')
const sorted = (values: Iterable<string>) => [...new Set(values)].sort()
const json = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const subjectFiles = ['MATHEMATIK', 'PHYSIK'].map((name) =>
  `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_${name}.de.json`)
const stages = ['SekI', 'SekII', 'CrossStage'] as const
const roles = ['ordinary', 'assessment', 'memory', 'structureAndOrientation'] as const
const sources = new Map<string, string>()
const recordSource = (path: string) => {
  sources.set(path, sha(readFileSync(resolve(root, path))))
}
const listJson = (directory: string): string[] => readdirSync(resolve(root, directory), { withFileTypes: true })
  .flatMap((item) => item.isDirectory() ? listJson(`${directory}/${item.name}`)
    : item.isFile() && item.name.endsWith('.json') ? [`${directory}/${item.name}`] : [])

type Request = { key: string; landscapeId: string; scope: Record<string, string> }
type NativeResult = {
  key: string; viewId: string | null; mergedFromViewIds: string[]
  targetGoalIds: string[]; prerequisiteOnlyGoalIds: string[]; compositionViewIds: string[]
  learningScopeApplied: boolean; seedAtomicGoalCount: number | null; closureAddedTargetGoalIds: string[]
}

export const goalSetBits = (universe: readonly string[], ids: ReadonlySet<string>): string => {
  const bytes = Buffer.alloc(Math.ceil(universe.length / 8))
  universe.forEach((id, index) => { if (ids.has(id)) bytes[index >> 3] |= 1 << (index & 7) })
  return bytes.toString('base64')
}

export const decodeGoalSetBits = (universe: readonly string[], encoded: string): string[] => {
  const bytes = Buffer.from(encoded, 'base64')
  assert.equal(bytes.length, Math.ceil(universe.length / 8), 'Goal bitset has the wrong universe size')
  return universe.filter((_, index) => (bytes[index >> 3] & (1 << (index & 7))) !== 0)
}

const role = (goal: LearningGoal): string => {
  if (goal.type !== 'atomic' || goal.semanticKind === 'orientation') return 'structureAndOrientation'
  if (goal.nodeKind === 'exam' || goal.tags?.includes('Assessment') || goal.examData) return 'assessment'
  return goal.nodeKind === 'memory' ? 'memory' : 'ordinary'
}

const roleCounts = (goals: LearningGoal[], ids: ReadonlySet<string>) => Object.fromEntries(
  roles.map((kind) => [kind, goals.filter((goal) => ids.has(goal.id) && role(goal) === kind).length]),
)

function buildRequests(landscapes: SkillLandscape[]): Request[] {
  const overview = json('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_OVERVIEW.de.json') as SkillLandscape
  const jurisdictions = sorted((overview.filters ?? []).map(({ id }) => id).filter((id) => /^DE-[A-Z]{2}$/u.test(id)))
  const requests: Request[] = []
  for (const landscape of landscapes) {
    const profiles = getDisplayCourseProfileFilters(landscape.filters, 'de').map(({ id }) => id)
      .filter((id) => ['GK', 'LK', 'GK+LK'].includes(id))
    assert(profiles.includes('GK') && profiles.includes('LK') && profiles.includes('GK+LK'))
    for (const jurisdiction of [undefined, ...jurisdictions]) {
      for (const stage of stages) {
        if (jurisdiction && !isGymnasiumSubjectOfferedForStageSelection(landscape.landscapeId, jurisdiction,
          { sek1Selected: stage !== 'SekII', sek2Selected: stage !== 'SekI' })) continue
        // Setup exposes duration only when Sek I is selected. No invented G8/G9 for national defaults.
        const offeredDurations = jurisdiction && stage !== 'SekII'
          ? getOfferedGymnasiumDurationModels(landscape.landscapeId, jurisdiction) : []
        const durations: readonly (string | undefined)[] = offeredDurations.length ? offeredDurations : [undefined]
        for (const durationModel of durations) for (const courseProfile of stage === 'SekI' ? [undefined] : profiles) {
          const scope = { schoolForm: 'Gymnasium', ...(jurisdiction ? { jurisdiction } : {}), stage,
            ...(durationModel ? { durationModel } : {}), ...(courseProfile ? { courseProfile } : {}) }
          requests.push({ key: [landscape.landscapeId, jurisdiction ?? 'DE-default', stage,
            durationModel ?? '-', courseProfile ?? '-'].join('|'), landscapeId: landscape.landscapeId, scope })
        }
      }
    }
  }
  assert.equal(requests.length, new Set(requests.map(({ key }) => key)).size)
  return requests.sort((a, b) => a.key.localeCompare(b.key, 'en'))
}

function runNative(requests: Request[]): NativeResult[] {
  const tempRoot = resolve(root, 'tmp/math-physics-native-inventory')
  mkdirSync(tempRoot, { recursive: true })
  const work = mkdtempSync(`${tempRoot}/run-`)
  const requestPath = resolve(work, 'requests.json')
  const resultPath = resolve(work, 'results.json')
  const logPath = resolve(work, 'native.log')
  writeFileSync(requestPath, JSON.stringify(requests))
  // Stream Gradle/JVM output to the log file: backend logging is unbounded and must not hit a pipe buffer limit.
  const log = openSync(logPath, 'w')
  let command: ReturnType<typeof spawnSync>
  try {
    command = spawnSync('./gradlew', ['--console=plain', '--no-daemon', '-q',
      '-I', resolve(root, 'app/scripts/mathPhysicsNativeInventory.init.gradle'),
      'inventoryMathPhysicsNativeProjection', `-PinventoryRequests=${requestPath}`, `-PinventoryResults=${resultPath}`],
    { cwd: resolve(root, 'backend'), stdio: ['ignore', log, log] })
  } finally {
    closeSync(log)
  }
  if (command.error || command.status !== 0) {
    throw new Error(`Native inventory failed; see ${relative(root, logPath)}: ${command.error?.message ?? command.status}`)
  }
  return JSON.parse(readFileSync(resultPath, 'utf8')) as NativeResult[]
}

export function buildInventory() {
  const landscapes = subjectFiles.map((path) => json(path) as SkillLandscape)
  const requests = buildRequests(landscapes)
  const results = runNative(requests)
  assert.deepEqual(sorted(results.map(({ key }) => key)), sorted(requests.map(({ key }) => key)))
  const resultByKey = new Map(results.map((result) => [result.key, result]))
  const goalUniverseIds = sorted(results.flatMap((result) => [...result.targetGoalIds, ...result.prerequisiteOnlyGoalIds]))
  const classes = new Map<string, { landscapeId: string; targetBits: string; prerequisiteOnlyBits: string
    seedTargetBits: string; targetCounts: Record<string, number>; seedTargetCounts: Record<string, number>
    prerequisiteOnlyCounts: Record<string, number>; foreignTargetCount: number; foreignSeedTargetCount: number
    foreignPrerequisiteOnlyCount: number; members: string[] }>()
  const configurations = requests.map((request) => {
    const result = resultByKey.get(request.key)!
    assert.equal(typeof result.learningScopeApplied, 'boolean', `${request.key}: adapter did not report learningScopeApplied`)
    assert(Array.isArray(result.closureAddedTargetGoalIds), `${request.key}: adapter did not report closure-added targets`)
    const landscape = landscapes.find(({ landscapeId }) => landscapeId === request.landscapeId)!
    const local = new Set(landscape.goals.map(({ id }) => id))
    const targets = new Set(result.targetGoalIds)
    const support = new Set(result.prerequisiteOnlyGoalIds)
    assert(![...targets].some((id) => support.has(id)), `${request.key}: overlapping target/support`)
    assert(result.closureAddedTargetGoalIds.every((id) => targets.has(id)), `${request.key}: closure atom outside targets`)
    // Seed targets: what the offered view itself targets, i.e. the backend's closed targets minus the
    // atoms the backend reports as added by the prerequisite closure (no re-derivation here).
    const closureAdded = new Set(result.closureAddedTargetGoalIds)
    const seedTargets = new Set([...targets].filter((id) => !closureAdded.has(id)))
    const targetBits = goalSetBits(goalUniverseIds, targets)
    const prerequisiteOnlyBits = goalSetBits(goalUniverseIds, support)
    const seedTargetBits = goalSetBits(goalUniverseIds, seedTargets)
    assert.deepEqual(decodeGoalSetBits(goalUniverseIds, targetBits), sorted(targets))
    assert.deepEqual(decodeGoalSetBits(goalUniverseIds, prerequisiteOnlyBits), sorted(support))
    assert.deepEqual(decodeGoalSetBits(goalUniverseIds, seedTargetBits), sorted(seedTargets))
    const membership = { landscapeId: request.landscapeId, targetBits, prerequisiteOnlyBits, seedTargetBits }
    const classId = sha(JSON.stringify(membership))
    const existing = classes.get(classId)
    if (existing) assert.equal(JSON.stringify(membership), JSON.stringify({ landscapeId: existing.landscapeId,
      targetBits: existing.targetBits, prerequisiteOnlyBits: existing.prerequisiteOnlyBits,
      seedTargetBits: existing.seedTargetBits }), 'Hash collision')
    else classes.set(classId, { ...membership, targetCounts: roleCounts(landscape.goals, targets),
      seedTargetCounts: roleCounts(landscape.goals, seedTargets),
      prerequisiteOnlyCounts: roleCounts(landscape.goals, support),
      foreignTargetCount: [...targets].filter((id) => !local.has(id)).length,
      foreignSeedTargetCount: [...seedTargets].filter((id) => !local.has(id)).length,
      foreignPrerequisiteOnlyCount: [...support].filter((id) => !local.has(id)).length, members: [] })
    classes.get(classId)!.members.push(request.key)
    return { ...request, viewId: result.viewId, mergedFromViewIds: sorted(result.mergedFromViewIds),
      membershipClass: classId, learningScopeApplied: result.learningScopeApplied,
      seedAtomicGoalCount: result.seedAtomicGoalCount,
      closureAddedTargetCount: result.closureAddedTargetGoalIds.length,
      closureAddedForeignTargetCount: result.closureAddedTargetGoalIds.filter((id) => !local.has(id)).length }
  })
  const decks = landscapes.flatMap((landscape) => landscape.goals.filter((goal) => role(goal) === 'memory').map((goal) => ({
    goalId: goal.id, landscapeId: landscape.landscapeId,
    references: ['vocabularySource', 'vocabularySourceEn'].flatMap((field) => {
      const reference = goal.extendedData?.[field]
      if (typeof reference !== 'string') return []
      assert(/^\/data\/[^/]+\.json$/u.test(reference), `Unexpected deck locator: ${reference}`)
      const path = `curricula/DE/Gymnasium/memory-decks/${reference.slice('/data/'.length)}`
      assert(existsSync(resolve(root, path)), `Missing deck: ${path}`)
      recordSource(path)
      const deck = json(path) as { deckId: string; cards: Array<{ id: string }> }
      const cardIds = deck.cards.map(({ id }) => id)
      assert.equal(cardIds.length, new Set(cardIds).size, `Duplicate card IDs: ${path}`)
      return [{ field, reference, path, deckId: deck.deckId, cardIds }]
    }),
  })))
  const sourceFiles = [
    ...listJson('curricula/DE/Gymnasium/canonical'),
    ...listJson('curricula/DE/Gymnasium/composition-views/mathematik'),
    ...listJson('curricula/DE/Gymnasium/composition-views/physik'),
    ...listJson('curricula/DE/Gymnasium/completion-profiles'),
    ...listJson('curricula/DE/Gymnasium/completion-scopes'),
    'curricula/DE/Gymnasium/provenance/gymnasium-duration-model-policy.json',
    'app/src/generated/gymnasiumDurationOfferings.ts', 'app/src/utils/durationModel.ts',
    'app/src/utils/filterLabels.ts', 'app/scripts/reportMathPhysicsNativeInventory.ts',
    'app/scripts/MathPhysicsNativeProjectionInventory.java', 'app/scripts/mathPhysicsNativeInventory.init.gradle',
    ...['service/CompositionViewService', 'service/LearnerService', 'landscape/LandscapeService',
      'landscape/GoalMappingService', 'composition/CourseProfileCompositionViewMerger',
      'completion/CompletionCanonicalGraphResolver', 'completion/PersonalCurriculumLearningScope'].map((name) =>
      `backend/src/main/java/com/skillpilot/backend/${name}.java`),
  ]
  sourceFiles.forEach(recordSource)
  const bySubject = Object.fromEntries(landscapes.map((landscape) => {
    const rows = configurations.filter(({ landscapeId }) => landscapeId === landscape.landscapeId)
    const subjectClasses = [...classes.values()].filter(({ landscapeId }) => landscapeId === landscape.landscapeId)
    const offeredTargets = new Set(subjectClasses.flatMap(({ targetBits }) => decodeGoalSetBits(goalUniverseIds, targetBits)))
    const neverTarget = (kind: string) => landscape.goals
      .filter((goal) => role(goal) === kind && !offeredTargets.has(goal.id)).map(({ id }) => id).sort()
    return [landscape.landscapeId, {
      subject: landscape.subject,
      configurations: rows.length,
      configurationsByStage: Object.fromEntries(stages.map((stage) => [stage, rows.filter(({ scope }) => scope.stage === stage).length])),
      membershipClasses: subjectClasses.length,
      poolTargetCoverage: Object.fromEntries(roles.map((kind) => [kind, {
        pool: landscape.goals.filter((goal) => role(goal) === kind).length,
        targetInSomeConfiguration: landscape.goals.filter((goal) => role(goal) === kind && offeredTargets.has(goal.id)).length,
      }])),
      assessmentGoalsNeverTarget: neverTarget('assessment'),
      memoryGoalsNeverTarget: neverTarget('memory'),
    }]
  }))
  return {
    schemaVersion: 1, revision: '2026-11-12-v1', sourceMode: 'repository-native-read-only',
    limitations: [
      'Inventory and exact membership only; it proves no curriculum quality, no learning-unit approval, no reviewed assessment coverage, no deployment and no host acceptance.',
      'One selected subject at a time; no Cartesian product across subjects, focus roots, learner mastery or calendar year.',
      'Membership classes prove equal goal sets (targets, seed targets, prerequisite-only goals) only, not equal tree order, assessment alternatives or pedagogical equivalence.',
      'Native loader also reads repository mappings/provenance; listed hashes bind principal inventory inputs, not a sealed runtime release.',
      'No matching learner view is reported explicitly; it never falls back to the full canonical pool.',
      'Targets are the backend projection after the personal-curriculum prerequisite closure; a backend seed-scope fallback is listed in summary.seedScopeFallback.',
    ],
    bitsetEncoding: 'base64; bit i (least-significant bit first) indexes goalUniverseIds[i]; foreign prerequisites remain included',
    bitsetSemantics: 'targetBits: closed learning scope (seed targets plus backend prerequisite closure); '
      + 'seedTargetBits: targets of the offered view itself (targetBits minus backend-reported closure additions); '
      + 'prerequisiteOnlyBits: support goals outside the learning scope. Class identity covers all three.',
    goalUniverseIds,
    pools: Object.fromEntries(landscapes.map((landscape) => [landscape.landscapeId, {
      subject: landscape.subject, goalIds: sorted(landscape.goals.map(({ id }) => id)),
      counts: roleCounts(landscape.goals, new Set(landscape.goals.map(({ id }) => id))),
      assessmentDeclarations: landscape.goals.filter((goal) => role(goal) === 'assessment').map((goal) => ({
        goalId: goal.id, reviewStatus: goal.examData?.reviewStatus ?? null,
        declaredCoveredGoalIds: goal.examData?.coveredGoalIds ?? [],
        taskAndSolutionSha256: sha(JSON.stringify([goal.examData?.taskContent, goal.examData?.solutionContent,
          goal.examData?.taskContentEn, goal.examData?.solutionContentEn])),
        normalScoringSha256: sha(JSON.stringify(goal.examData?.scoring ?? null)),
      })).sort((a, b) => a.goalId.localeCompare(b.goalId, 'en')),
    }])),
    summary: { configurations: configurations.length, membershipClasses: classes.size,
      noMatchedView: configurations.filter(({ viewId }) => !viewId).map(({ key }) => key),
      seedScopeFallback: configurations.filter(({ key, learningScopeApplied }) => !learningScopeApplied
        && resultByKey.get(key)!.targetGoalIds.length > 0).map(({ key }) => key),
      memoryGoals: decks.length, deckReferences: decks.reduce((count, deck) => count + deck.references.length, 0),
      bySubject },
    configurations, membershipClasses: Object.fromEntries([...classes].sort(([a], [b]) => a.localeCompare(b, 'en'))),
    decks, sources: Object.fromEntries([...sources].sort(([a], [b]) => a.localeCompare(b, 'en'))),
  }
}

const parseOutput = (args: readonly string[]): string => {
  let output = DEFAULT_OUTPUT
  for (let index = 0; index < args.length; index++) {
    const arg = args[index]
    if (arg === '--output') {
      output = args[++index] ?? ''
      assert(output && !output.startsWith('--'), '--output needs a repository-relative path')
    } else if (arg.startsWith('--output=')) output = arg.slice('--output='.length)
    else throw new Error(`Unknown argument ${arg}; usage: reportMathPhysicsNativeInventory.ts [--output <repo-relative path>]`)
  }
  assert(output && !isAbsolute(output), `--output must be repository-relative: ${output}`)
  const target = resolve(root, output)
  assert(!relative(root, target).startsWith('..'), `--output must stay inside the repository: ${output}`)
  return target
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const output = parseOutput(process.argv.slice(2))
  const inventory = buildInventory()
  mkdirSync(dirname(output), { recursive: true })
  writeFileSync(output, `${JSON.stringify(inventory, null, 2)}\n`)
  console.log(JSON.stringify(inventory.summary))
}
