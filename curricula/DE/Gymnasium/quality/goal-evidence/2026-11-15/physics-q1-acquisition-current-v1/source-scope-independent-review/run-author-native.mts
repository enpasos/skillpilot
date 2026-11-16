import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import type { SkillLandscape } from '../../../app/src/landscapeTypes'
import { buildApplicabilityCompilation } from '../../../app/scripts/applicabilityCompiler'
import { evaluateJurisdictionCoverage, readCompositionViewAtomicGoalIds, readJurisdictionCoverageByLandscapeId } from '../../../app/scripts/generateCurriculumQualityStatus'

const repository = process.cwd()
const canonicalDirectory = resolve(repository, 'curricula/DE/Gymnasium/canonical')
const files = readdirSync(canonicalDirectory).filter(file => file.endsWith('.json')).map(file => resolve(canonicalDirectory, file))
const catalog = files.map(file => ({ file, landscape: JSON.parse(readFileSync(file, 'utf8')) as SkillLandscape }))
const compilation = buildApplicabilityCompilation(catalog)
const physicsId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const report = compilation.reports.find(candidate => candidate.landscapeId === physicsId)!
const physics = catalog.find(candidate => candidate.landscape.landscapeId === physicsId)!.landscape
const byGoalId = '677a192d-8bbe-57fc-bb7a-1c1ed5fba32b'
const viewDirectory = resolve(repository, 'curricula/DE/Gymnasium/composition-views/physik')
const viewFiles = readdirSync(viewDirectory).filter(file => file.endsWith('.view.json')).map(file => resolve(viewDirectory, file))
const digest = (file: string) => createHash('sha256').update(readFileSync(file)).digest('hex')
const pins = [...files, ...viewFiles].map(file => ({ file, sha256: digest(file) }))
const parent = resolve(import.meta.dirname, 'author-native-fixtures')
mkdirSync(parent, { recursive: true })
const fixture = mkdtempSync(resolve(parent, 'source-coverage-scope-native-'))
try {
  const baseline = readJurisdictionCoverageByLandscapeId({ ...compilation, reports: [report] }).get(physicsId)!
  assert.equal(evaluateJurisdictionCoverage(baseline).status, 'pass')
  assert.equal(baseline.unsupportedAssignedAtomicGoals, 0)
  const exposed = readCompositionViewAtomicGoalIds(report)
  assert(!exposed.viewAtomicGoalIdsByJurisdiction.get('DE-HE')!.has(byGoalId),
    'The actual BY-only child of broad HE subtrees is excluded by the declared HE scope')
  assert(exposed.viewAtomicGoalIdsByJurisdiction.get('DE-BY')!.has(byGoalId))

  // Keep native BY source evidence unchanged, but advertise the ordinary goal
  // as HE-applicable in an isolated canonical fixture. The HE subtree now
  // really renders it: source coverage must reject that unsupported exposure.
  const falselyApplicable = structuredClone(physics)
  falselyApplicable.goals.find(goal => goal.id === byGoalId)!.applicability = { jurisdiction: ['DE-BY', 'DE-HE'] }
  const falseCanonical = resolve(fixture, 'visible-unsupported.de.json')
  writeFileSync(falseCanonical, JSON.stringify(falselyApplicable))
  const falseReport = { ...report, file: falseCanonical }
  assert(readCompositionViewAtomicGoalIds(falseReport).viewAtomicGoalIdsByJurisdiction.get('DE-HE')!.has(byGoalId))
  const unsupported = readJurisdictionCoverageByLandscapeId({ ...compilation, reports: [falseReport] }).get(physicsId)!
  const unsupportedRule = evaluateJurisdictionCoverage(unsupported)
  assert.equal(unsupportedRule.status, 'fail')
  assert.equal(unsupported.jurisdictions.find(row => row.jurisdiction === 'DE-HE')!.unsupportedAssignedAtomicGoals, 1)
  assert(unsupportedRule.details?.some(detail => detail.startsWith('DE-HE:') && detail.includes('without source-backed')))

  const overriddenViews = (kind: 'empty-he' | 'unknown-he' | 'empty-national') => viewFiles.map(file => {
    const selected = kind === 'empty-national' ? basename(file).startsWith('de-de') : basename(file).startsWith('de-he')
    if (!selected) return file
    const view = JSON.parse(readFileSync(file, 'utf8'))
    view.rootNodes = [{ kind: 'structure', id: 'scoped-fixture', label: 'Scoped fixture', children: [{
      kind: 'goalEntry', goalId: kind === 'unknown-he' ? 'unresolvable-fixture-goal' : byGoalId,
      ...(kind === 'empty-national' ? { projectionRole: 'prerequisiteOnly' } : {}),
    }] }]
    const directory = resolve(fixture, kind)
    mkdirSync(directory, { recursive: true })
    const output = resolve(directory, basename(file))
    writeFileSync(output, JSON.stringify(view))
    return output
  })
  const emptyHEFiles = overriddenViews('empty-he')
  const emptyHEProjection = readCompositionViewAtomicGoalIds(report, emptyHEFiles)
  assert(emptyHEProjection.viewAtomicGoalIdsByJurisdiction.has('DE-HE'))
  assert.equal(emptyHEProjection.viewAtomicGoalIdsByJurisdiction.get('DE-HE')!.size, 0)
  const emptyHE = readJurisdictionCoverageByLandscapeId({ ...compilation, reports: [report] }, new Map([[physicsId, emptyHEFiles]])).get(physicsId)!
  const he = emptyHE.jurisdictions.find(row => row.jurisdiction === 'DE-HE')!
  assert.equal(he.visibleAtomicGoals, 0, 'An existing empty view never falls back to compiled goals')
  assert(he.sourceAtomicGoals > 0)
  assert.equal(he.sourceMappedToViewAtomicGoals, 0)
  assert.equal(he.unmappedSourceAtomicGoals, he.sourceAtomicGoals)
  assert.equal(emptyHE.sourceAtomicGoals, baseline.sourceAtomicGoals)
  assert.equal(emptyHE.sourceOriginalGoals, baseline.sourceOriginalGoals)
  assert.equal(evaluateJurisdictionCoverage(emptyHE).status, 'fail')

  const unknownHEFiles = overriddenViews('unknown-he')
  let unknownRejected = false
  try {
    const unknown = readJurisdictionCoverageByLandscapeId({ ...compilation, reports: [report] }, new Map([[physicsId, unknownHEFiles]])).get(physicsId)!
    unknownRejected = evaluateJurisdictionCoverage(unknown).status === 'fail'
  } catch (error) {
    unknownRejected = error instanceof Error
  }
  assert(unknownRejected, 'An unresolvable declared view cannot obtain coverage by fallback')

  const emptyNationalFiles = overriddenViews('empty-national')
  const emptyNational = readJurisdictionCoverageByLandscapeId({ ...compilation, reports: [report] }, new Map([[physicsId, emptyNationalFiles]])).get(physicsId)!
  assert.equal(emptyNational.emptyCanonicalViewProjection, true)
  assert.equal(emptyNational.totalAtomicGoals, 0)
  assert.equal(emptyNational.sourceAtomicGoals, baseline.sourceAtomicGoals)
  assert.equal(emptyNational.sourceOriginalGoals, baseline.sourceOriginalGoals)
  assert.equal(evaluateJurisdictionCoverage(emptyNational).status, 'fail')

  // Test the actual addViewAtoms scope binding with a neutral course, both
  // course-specific projections, a national DE sentinel, and duration filtering.
  const scopeCanonical = resolve(fixture, 'scope-fixture.de.json')
  const scopeLandscape = { ...physics, goals: [
    { id: 'scope-root', title: 'Root', type: 'cluster', contains: ['scope-content'], requires: [], tags: ['root'] },
      { id: 'scope-content', title: 'Content', type: 'cluster', contains: ['gk', 'lk', 'g9'], requires: [],
        tags: ['LK'], applicability: { jurisdiction: ['DE-BY'] } },
    ...[['gk', ['GK', 'G8']], ['lk', ['LK', 'G8']], ['g9', ['GK', 'G9']]].map(([id, tags]) => ({
      id, title: id, type: 'atomic', contains: [], requires: [], tags, applicability: { jurisdiction: ['DE-HE'] },
    })),
  ] }
  writeFileSync(scopeCanonical, JSON.stringify(scopeLandscape))
  const scopedReport = { ...report, file: scopeCanonical }
  const scopedFile = (name: string, scope: object) => {
    const file = resolve(fixture, name)
    writeFileSync(file, JSON.stringify({ viewId: name, landscapeId: physicsId, scope: { schoolForm: 'Gymnasium', stage: 'CrossStage', ...scope },
      rootNodes: [{ kind: 'structure', id: 'scope', label: 'Scope', children: [{ kind: 'canonicalSubtree', goalId: 'scope-content' }] }],
    }))
    return file
  }
  const neutralFile = scopedFile('de-he-neutral.view.json', { jurisdiction: 'DE-HE', durationModel: 'G8' })
  const gkFile = scopedFile('de-he-gk.view.json', { jurisdiction: 'DE-HE', courseProfile: 'GK', durationModel: 'G8' })
  const lkFile = scopedFile('de-he-lk.view.json', { jurisdiction: 'DE-HE', courseProfile: 'LK', durationModel: 'G8' })
  const atoms = (paths: string[]) => readCompositionViewAtomicGoalIds(scopedReport, paths)
  const neutral = atoms([neutralFile]).viewAtomicGoalIdsByJurisdiction.get('DE-HE')!
  const gk = atoms([gkFile]).viewAtomicGoalIdsByJurisdiction.get('DE-HE')!
  const lk = atoms([lkFile]).viewAtomicGoalIdsByJurisdiction.get('DE-HE')!
  assert.deepEqual([...neutral].sort(), [...new Set([...gk, ...lk])].sort())
  assert.deepEqual([...neutral].sort(), ['gk', 'lk'])
  assert.deepEqual([...gk], ['gk'])
  assert.deepEqual([...lk], ['lk'])
  const deFile = scopedFile('de-de-default.view.json', { jurisdiction: 'DE', durationModel: 'G8' })
  assert.deepEqual([...atoms([deFile]).canonicalViewAtomicGoalIds].sort(), ['gk', 'lk'], 'DE is a national sentinel, never a Land filter')
  assert.equal(atoms([neutralFile]).canonicalViewPresent, false, 'A missing national view is distinct from an existing empty one')

  const mathReport = compilation.reports.find(candidate => candidate.landscapeId === '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced')!
  const math = catalog.find(candidate => candidate.landscape.landscapeId === mathReport.landscapeId)!.landscape
  const mappedTaskId = '2f8a3a90-717d-5ac1-b54e-facca26e9008'
  assert(!math.goals.find(goal => goal.id === mappedTaskId)!.applicability?.jurisdiction?.includes('DE-BY'))
  assert(!mathReport.goals.find(goal => goal.goalId === mappedTaskId)!.evidence.some(evidence => evidence.value === 'DE-BY'),
    'Assessment-derived compiler evidence is not the raw backend selection input')
  const mathDirectory = resolve(repository, 'curricula/DE/Gymnasium/composition-views/mathematik')
  const mathViews = readdirSync(mathDirectory).filter(file => file.startsWith('de-by') && file.endsWith('.view.json'))
    .map(file => resolve(mathDirectory, file))
  const byCourse = (course: string) => mathViews.filter(file => JSON.parse(readFileSync(file, 'utf8')).scope.courseProfile === course)
  assert(readCompositionViewAtomicGoalIds(mathReport, byCourse('LK')).viewAtomicGoalIdsByJurisdiction.get('DE-BY')!.has(mappedTaskId),
    'The raw directly mapped BY Mathematics LK task remains selected despite AP excluding BY, matching the actual API')
  assert(!readCompositionViewAtomicGoalIds(mathReport, byCourse('GK')).viewAtomicGoalIdsByJurisdiction.get('DE-BY')!.has(mappedTaskId),
    'The authored GK view still excludes the task: the general BY course rule imports no undeclared goal')

  for (const pin of pins) assert.equal(digest(pin.file), pin.sha256, `Active input changed: ${pin.file}`)
  console.log('Native CQR-003: current scope PASS; visible unsupported HE target FAIL; empty/unknown HE and prerequisiteOnly-only national FAIL with unchanged source obligations; neutral GK/LK, DE, duration and atomic-parent scopes PASS; actual BY-Math direct-mapping fallback preserved. Active inputs unchanged.')
} finally {
  rmSync(fixture, { recursive: true, force: true })
}
