import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { packageContentForRepoSource } from './buildSkillpilotExportPackage'
import { subjectExportCompositionViewIssues, type SubjectCompositionGoal } from './subjectExportCompositionViews'
import { collectCompositionProjectionRoleGoalIds, type CompositionView } from '../src/utils/authoring/compositionViewAuthoring'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const graph = new Map<string, SubjectCompositionGoal>([
  ['regular', { type: 'atomic', requires: ['preparation'], contains: [] }],
  ['preparation', { type: 'atomic', requires: [], contains: [] }],
  ['offer', { type: 'atomic', requires: ['regular'], contains: [] }],
  ['task', { type: 'atomic', requires: ['offer'], contains: [] }],
  ['coverage-only-task', { type: 'atomic', requires: [], contains: [], coveredGoalIds: ['offer'] }],
  ['group', { type: 'cluster', requires: [], contains: ['offer'] }],
  ['root', { type: 'cluster', requires: [], contains: ['regular', 'preparation', 'group', 'task'], tags: ['root'], landscapeId: 'fixture' }],
  ['inherited', { type: 'atomic', requires: [], contains: [] }],
  ['canonical-parent', { type: 'cluster', requires: ['offer'], contains: ['inherited'] }],
  ['group-coverage-task', { type: 'atomic', requires: [], contains: [], coveredGoalIds: ['group'] }],
  ['implicit-task-consumer', { type: 'atomic', requires: ['group-coverage-task'], contains: [] }],
  ['preparation-group', { type: 'cluster', requires: [], contains: ['preparation'] }],
  ['raw-coverage-task', { type: 'atomic', requires: [], contains: [], examData: { coveredGoalIds: ['group'] } }],
])
const source: CompositionView = {
  $schema: 'https://skillpilot.com/schemas/composition-view/v1.3/composition-view.schema.json',
  viewFormatVersion: '1.3', viewId: 'three-roles', landscapeId: 'fixture', language: 'de',
  scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE' },
  rootNodes: [{ kind: 'structure', id: 'unit', label: 'Einheit', children: [
    { kind: 'goalEntry', goalId: 'regular', projectionRole: 'target' },
    { kind: 'goalEntry', goalId: 'preparation', projectionRole: 'prerequisiteOnly', acquisitionPlacement: true },
    { kind: 'structure', id: 'offers', label: 'Freiwillige Angebote',
      placementEvidence: { rationale: 'Eigene didaktische Begründung.' }, children: [
        { kind: 'goalEntry', goalId: 'offer', projectionRole: 'voluntary' },
        { kind: 'goalEntry', goalId: 'task', projectionRole: 'voluntary' },
      ] },
  ] }],
}
assert.deepEqual(subjectExportCompositionViewIssues(source, graph), [])
const original = JSON.stringify(source)
mkdirSync(resolve(root, 'tmp'), { recursive: true })
const scratch = mkdtempSync(resolve(root, 'tmp/voluntary-subject-transport.'))
try {
  const sourcePath = resolve(scratch, 'three-roles.view.json')
  writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}\n`)
  const transported = JSON.parse(packageContentForRepoSource(sourcePath, 'composition-view').toString('utf8'))
  assert.deepEqual(subjectExportCompositionViewIssues(transported, graph), [])
  assert.deepEqual(transported, source, 'the ordinary export preserves all three roles, nested offer-only section and required own rationale')
  const roles = collectCompositionProjectionRoleGoalIds(transported.rootNodes, graph)
  assert.deepEqual([...roles.targetGoalIds], ['regular'])
  assert.deepEqual([...roles.prerequisiteOnlyGoalIds], ['preparation'])
  assert.deepEqual([...roles.voluntaryGoalIds].sort(), ['offer', 'task'])
  assert.deepEqual([...roles.voluntaryAtomicGoalIds].sort(), ['offer', 'task'])
  assert.equal(new Set([...roles.targetAtomicGoalIds, ...roles.prerequisiteOnlyAtomicGoalIds,
    ...roles.voluntaryAtomicGoalIds]).size, roles.targetAtomicGoalIds.size + roles.prerequisiteOnlyAtomicGoalIds.size + roles.voluntaryAtomicGoalIds.size)
  assert.equal(readFileSync(sourcePath, 'utf8').trim(), JSON.stringify(source, null, 2))
  const negatives: Array<(view: any) => void> = [
    ...['unknown', '', null, false, 3].map(role => (view: any) => { view.rootNodes[0].children[2].children[0].projectionRole = role }),
    view => { view.viewFormatVersion = '1.2'; view.$schema = 'https://skillpilot.com/schemas/composition-view/v1.2/composition-view.schema.json' },
    view => { delete view.viewFormatVersion; delete view.$schema },
    view => { view.viewFormatVersion = '9.0' },
    view => { view.$schema = 'https://example.org/unknown.schema.json' },
    view => { view.rootNodes[0].children[2].children[0].acquisitionPlacement = true },
    view => { view.rootNodes[0].children[2].children[0].acquisitionPlacement = false },
    view => { view.rootNodes[0].children[2].projectionRole = 'voluntary' },
    view => { view.rootNodes[0].children[2].children[0].kind = 'canonicalSubtree' },
    view => { view.rootNodes[0].children[2].children[0].goalId = 'group' },
    view => { view.rootNodes[0].children.push({ ...view.rootNodes[0].children[2].children[0] }) },
    view => { view.rootNodes[0].children.push({ kind: 'canonicalSubtree', goalId: 'group' }) },
    view => { view.rootNodes[0].children[0].goalId = 'task'; view.rootNodes[0].children[2].children.pop() },
    view => { view.rootNodes[0].children.push({ kind: 'goalEntry', goalId: 'coverage-only-task', projectionRole: 'prerequisiteOnly' }) },
    view => { view.rootNodes[0].children[0].goalId = 'inherited' },
    view => { view.rootNodes.push({ kind: 'landscapeEntry', landscapeId: 'fixture' }) },
    view => { view.rootNodes[0].children.push({ kind: 'goalEntry', goalId: 'group-coverage-task', projectionRole: 'prerequisiteOnly' }) },
    view => { view.rootNodes[0].children[0].goalId = 'implicit-task-consumer' },
    view => { view.rootNodes[0].children[2].children[0].goalId = 'missing-canonical-offer' },
    view => { view.rootNodes[0].children.push({ kind: 'goalEntry', goalId: 'raw-coverage-task', projectionRole: 'prerequisiteOnly' }) },
  ]
  for (const [index, mutate] of negatives.entries()) {
    const malformed = structuredClone(source)
    mutate(malformed)
    assert(subjectExportCompositionViewIssues(malformed, graph).length > 0, `hostile source ${index} must fail`)
    // The real source-export entry point must reject unsupported wire values
    // even without a canonical graph supplied by its caller.
    if (index < 13) {
      writeFileSync(sourcePath, JSON.stringify(malformed))
      assert.throws(() => packageContentForRepoSource(sourcePath, 'composition-view'))
    }
  }
  const optionalOnly = structuredClone(source)
  optionalOnly.rootNodes = [(optionalOnly.rootNodes[0] as any).children[2]]
  assert.deepEqual(subjectExportCompositionViewIssues(optionalOnly, graph), [], 'An offer-only section remains a valid source view.')
  const repeatedPreparation = structuredClone(source)
  ;(repeatedPreparation.rootNodes[0] as any).children.push(
    { kind: 'goalEntry', goalId: 'preparation', projectionRole: 'prerequisiteOnly', acquisitionPlacement: true },
    { kind: 'canonicalSubtree', goalId: 'preparation-group', projectionRole: 'prerequisiteOnly' },
    { kind: 'canonicalSubtree', goalId: 'preparation-group', projectionRole: 'prerequisiteOnly' },
  )
  assert.deepEqual(subjectExportCompositionViewIssues(repeatedPreparation, graph), [], 'Conditional P templates and broad P metadata may repeat.')
  for (const version of ['1.0', '1.2']) {
    const legacy = structuredClone(repeatedPreparation)
    legacy.$schema = version === '1.2' ? 'https://skillpilot.com/schemas/composition-view/v1.2/composition-view.schema.json'
      : 'https://skillpilot.com/schemas/curriculum-package/v1/composition-view.schema.json'
    legacy.viewFormatVersion = version
    legacy.rootNodes = [{ kind: 'structure', id: 'legacy', label: 'Legacy', children: [
      { kind: 'goalEntry', goalId: 'regular', projectionRole: 'prerequisiteOnly' },
      { kind: 'goalEntry', goalId: 'regular', projectionRole: 'target' },
      { kind: 'canonicalSubtree', goalId: 'group' },
    ] }]
    assert.deepEqual(subjectExportCompositionViewIssues(legacy, graph), [], 'Old authored T/P specificity and closure remain unchanged.')
  }
  const external = structuredClone(source)
  ;(external.rootNodes[0] as any).children[2].children.push({ kind: 'goalEntry', goalId: 'foreign-offer', projectionRole: 'voluntary' })
  const boundForeign = new Map(graph)
  boundForeign.set('foreign-offer', { type: 'atomic', contains: [], requires: [] })
  assert.deepEqual(subjectExportCompositionViewIssues(external, boundForeign), [], 'A caller with a complete bound canonical body can validate a foreign atom.')
  assert(subjectExportCompositionViewIssues(external, graph).some(issue => /no bound|Fehlende/.test(issue)), 'Missing foreign evidence cannot be assumed away.')
  assert(subjectExportCompositionViewIssues(external, boundForeign, { incompleteGoalIds: new Set(['foreign-offer']) })
    .some(issue => /complete foreign canonical body/.test(issue)), 'Partial acquisition excerpts do not prove complete voluntary prerequisite semantics.')
  const canonicalDirectory = resolve(root, 'curricula/DE/Gymnasium/canonical')
  const canonical = readdirSync(canonicalDirectory).filter(file => file.endsWith('.de.json'))
    .map(file => JSON.parse(readFileSync(resolve(canonicalDirectory, file), 'utf8')))
  const completeGraph = new Map<string, SubjectCompositionGoal>(canonical.flatMap(landscape => landscape.goals.map((goal: any) => [goal.id, goal])))
  const roots = new Map<string, string>(canonical.flatMap(landscape => {
    const rootGoal = landscape.goals.find((goal: any) => goal.tags?.includes('root'))
    return rootGoal ? [[landscape.landscapeId, rootGoal.id]] : []
  }))
  const viewFiles = (directory: string): string[] => readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory()
    ? viewFiles(resolve(directory, entry.name)) : entry.name.endsWith('.view.json') ? [resolve(directory, entry.name)] : [])
  let currentViews = 0
  for (const file of viewFiles(resolve(root, 'curricula/DE/Gymnasium/composition-views'))) {
    const view = JSON.parse(readFileSync(file, 'utf8'))
    assert.deepEqual(subjectExportCompositionViewIssues(view, completeGraph), [], file)
    const exported = JSON.parse(packageContentForRepoSource(file, 'composition-view').toString('utf8'))
    const before = collectCompositionProjectionRoleGoalIds(view.rootNodes, completeGraph, roots)
    const after = collectCompositionProjectionRoleGoalIds(exported.rootNodes, completeGraph, roots)
    assert.deepEqual([...after.targetGoalIds].sort(), [...before.targetGoalIds].sort(), file)
    assert.deepEqual([...after.prerequisiteOnlyGoalIds].sort(), [...before.prerequisiteOnlyGoalIds].sort(), file)
    currentViews++
  }
  assert.equal(JSON.stringify(source), original)
  console.log(`Subject-export voluntary transport passed: three roles, actual source export, ${negatives.length} hostile source variants; ${currentViews} existing views keep exact T/P sets through ordinary export.`)
} finally { rmSync(scratch, { recursive: true, force: true }) }
