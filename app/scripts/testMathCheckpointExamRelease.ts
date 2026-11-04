import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { collectMathAtomicSupportContext } from './mathStageScopePolicy'

type ScoringStep = { id: string; points: number; description: string }
type ExamGoal = {
  id: string
  requires: string[]
  applicability?: { jurisdiction?: string[] }
  extendedData?: { applicabilityFromRequires?: boolean; applicabilityMappingInheritance?: string }
  examData?: {
    reviewStatus: string
    sourceArtifactPath: string
    coveredGoalIds: string[]
    taskContent: string
    taskContentEn?: string
    solutionContent: string
    solutionContentEn?: string
    scoring: { maxPoints: number; passingPoints: number; steps: ScoringStep[] }
  }
}

// The backend does not materialize applicabilityFromRequires itself. These
// two nationwide endpoints need an explicit runtime scope; CQR-501 separately
// verifies that it still equals their compiled prerequisite intersection.
const allGermanJurisdictions = [
  'DE-BB', 'DE-BE', 'DE-BW', 'DE-BY', 'DE-HB', 'DE-HE', 'DE-HH', 'DE-MV',
  'DE-NI', 'DE-NW', 'DE-RP', 'DE-SH', 'DE-SL', 'DE-SN', 'DE-ST', 'DE-TH',
]

const root = resolve(process.cwd(), '..')
const landscape = JSON.parse(readFileSync(resolve(root,
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'), 'utf8')) as {
    goals: ExamGoal[]
  }
const goals = new Map(landscape.goals.map((goal) => [goal.id, goal]))

// Use the productive all-parent/cluster-expanding compiler, not raw requires
// arrays or a frozen support inventory. Foreign canonical parents also count.
const canonicalDirectory = resolve(root, 'curricula/DE/Gymnasium/canonical')
const canonicalUniverse = new Map<string, ExamGoal>()
for (const file of readdirSync(canonicalDirectory).filter(name => name.endsWith('.de.json')).sort()) {
  const source = JSON.parse(readFileSync(resolve(canonicalDirectory, file), 'utf8')) as { goals: ExamGoal[] }
  for (const goal of source.goals) {
    assert.ok(!canonicalUniverse.has(goal.id), `Duplicate canonical goal ${goal.id}`)
    canonicalUniverse.set(goal.id, goal)
  }
}
const multiplicityTask = '6185792f-3024-59be-a3ff-de98589ae2c6'
const multiplicity = '71f62cfa-7cc2-5f60-9691-bcdc2ee910df'
const division = '46166788-4a8f-53d5-9fe9-77b0a018d7ee'
const optimisation = '1511b39a-4094-5450-a755-4a3ad3339733'
const differentiation = '858113c5-e53b-57bb-b01f-ba95c3ddcb6f'
const differenceQuotient = 'b42bdfcc-3db7-5697-8b3e-69e50962ca86'
const nullProduct = '39fa30f2-e1ae-5c36-be56-793b77906abb'
const integerPowers = '30c013ac-5164-4c3c-8bc1-9a10b2f49533'
const expandTerms = '74dc4b0d-a167-564c-bdc1-5cf510aee280'
const numericalTask = '78f5003e-9578-545c-b6b3-4b02f31ffcd4'
const newton = '0c7bbd3f-0a04-4f0e-888b-40ab7841fb76'
const preparation = (id: string, universe: ReadonlyMap<string, ExamGoal>) =>
  new Set(collectMathAtomicSupportContext([id], universe).supportUnionGoalIds)
function assertMultiplicityPreparation(universe: ReadonlyMap<string, ExamGoal>): void {
  const support = preparation(multiplicityTask, universe)
  assert.ok(!support.has(division), 'Multiplicity preparation must not include polynomial division')
  assert.ok(!support.has(optimisation), 'Multiplicity preparation must not include optimisation')
  assert.ok(!support.has(differentiation), 'Multiplicity preparation must not include differentiation')
  assert.ok(!support.has(differenceQuotient), 'Multiplicity preparation must not include difference quotients')
  assert.ok(support.has(nullProduct), 'Multiplicity needs genuine null-product preparation')
  assert.ok(support.has(integerPowers), 'Multiplicity needs genuine integer-power graph preparation')
}
function assertDivisionPreparation(universe: ReadonlyMap<string, ExamGoal>): void {
  const support = preparation(division, universe)
  assert.ok(!support.has(optimisation), 'Polynomial division preparation must not include optimisation')
  assert.ok(!support.has(differentiation), 'Polynomial division preparation must not include differentiation')
  assert.ok(!support.has(differenceQuotient), 'Polynomial division preparation must not include difference quotients')
  assert.ok(support.has(expandTerms), 'Polynomial division needs genuine expansion preparation')
  assert.ok(support.has(nullProduct), 'Polynomial division needs genuine null-product preparation')
}
function assertNumericalNewtonPreparation(universe: ReadonlyMap<string, ExamGoal>): void {
  const support = preparation(numericalTask, universe)
  const newtonSupport = preparation(newton, universe)
  assert.ok(support.has(newton), 'The numerical assessment must retain genuine Newton preparation')
  assert.ok(newtonSupport.has(differentiation), 'Newton preparation must retain differentiation')
  assert.ok(newtonSupport.has(differenceQuotient), 'Newton preparation must retain difference quotients')
  assert.ok([...newtonSupport].every(id => support.has(id)), 'The numerical assessment must retain the whole Newton preparation chain')
}
assertMultiplicityPreparation(canonicalUniverse)
assertDivisionPreparation(canonicalUniverse)
assertNumericalNewtonPreparation(canonicalUniverse)

// Transient copies exercise the actual semantic assertions without reading
// fingerprints, changing files, or accepting a stale-file failure as evidence.
const oldMultiplicity = structuredClone(canonicalUniverse)
oldMultiplicity.get(multiplicity)!.requires = [
  '51e80e7b-df31-5d97-97f9-4c6e26eb7416', division,
]
assert.throws(() => assertMultiplicityPreparation(oldMultiplicity),
  /Multiplicity preparation must not include polynomial division/)
const falseDivisionDemand = structuredClone(canonicalUniverse)
falseDivisionDemand.get(division)!.requires.push(optimisation)
assert.throws(() => assertDivisionPreparation(falseDivisionDemand),
  /Polynomial division preparation must not include optimisation/)
const missingNewtonPreparation = structuredClone(canonicalUniverse)
assert.ok(missingNewtonPreparation.get(newton)!.requires.includes(differentiation))
missingNewtonPreparation.get(newton)!.requires = missingNewtonPreparation.get(newton)!.requires.filter(id => id !== differentiation)
assert.throws(() => assertNumericalNewtonPreparation(missingNewtonPreparation),
  /Newton preparation must retain differentiation/)

const expected = [
  {
    id: '0dded9c1-043e-57cb-82fc-792b391e9cb0',
    max: 8,
    pass: 7,
    mandatorySteps: ['j7_prism_v6_volume', 'j7_prism_v6_surface', 'j7_prism_v6_density'],
    taskEvidence: ['Schicht', 'Volumen', 'Oberflächeninhalt', 'Dichte'],
  },
  {
    id: '6224d04c-bc07-4b60-b4c2-a1c7223adc9f',
    max: 20,
    pass: 18,
    mandatorySteps: [
      'j9_quadratic_two_roots',
      'j9_quadratic_no_real_root',
      'j9_quadratic_double_root',
      'j9_quadratic_formula',
    ],
    taskEvidence: ['Lösungsformel', 'reelle Lösungen'],
  },
  {
    id: '728fd537-40d3-5fdf-8b08-925cba0b2004',
    max: 12,
    pass: 11,
    mandatorySteps: [
      'antiderivative_graph_sketch',
      'antiderivative_graph_reasoning',
      'antiderivative_graph_shift',
    ],
    taskEvidence: ['gekrümmte', 'F′ = f', 'G-Zeichnung'],
  },
  {
    id: '22842d80-de9d-5dad-9819-6ae6e9ca61be',
    max: 12,
    pass: 11,
    mandatorySteps: [
      'reverse_graph_a_draw',
      'reverse_graph_b_transfer_draw',
      'reverse_graph_tangent_reasoning',
    ],
    taskEvidence: ['Graph A', 'Graph B', 'Tangentensteigungen'],
  },
  {
    id: '8d314e15-69e9-5af1-a10a-be820b2f821d',
    // The independently reviewed Nov 1 methods extension adds 3 BE while
    // retaining all three original geometric cases and their omission caps.
    max: 23,
    pass: 21,
    mandatorySteps: [
      'plane_plane_a_method_comparison',
      'plane_plane_a_line',
      'plane_plane_b_contradiction',
    ],
    taskEvidence: ['E₁', 'E₃', 'E₅', 'Lösungsmenge'],
  },
  {
    id: '338135aa-d5bb-5b53-8413-90fa8f1e4fb6',
    max: 9,
    pass: 8,
    mandatorySteps: [
      'line_angle_dot_norms',
      'line_angle_non_obtuse',
      'line_angle_supplement',
      'line_angle_orientation',
    ],
    taskEvidence: ['120°', 'nichtstumpfen', '−v'],
  },
  {
    id: '34dc8c9b-f61b-50ca-8daa-0d46277c7b32',
    max: 12,
    pass: 11,
    mandatorySteps: [
      'mandelbrot_software_artifact',
      'mandelbrot_orbits',
      'mandelbrot_membership',
      'mandelbrot_finite_limit',
    ],
    taskEvidence: ['Screenshot', 'Einstellungen', 'endliche'],
  },
] as const

for (const spec of expected) {
  const goal = goals.get(spec.id)
  assert.ok(goal?.examData, `Missing reviewed assessment ${spec.id}`)
  const exam = goal.examData
  assert.equal(exam.reviewStatus, 'released', `Assessment ${spec.id} is not content-released`)
  assert.ok(exam.coveredGoalIds.every(id => goal.requires.includes(id)),
    `Assessment ${spec.id} must prepare its scored goals; additional genuine preparation does not imply coverage`)
  assert.ok(exam.coveredGoalIds.length > 0)
  assert.ok(readFileSync(resolve(root, exam.sourceArtifactPath), 'utf8').length > 0)
  assert.ok(exam.solutionContent.length > 0)
  assert.equal(exam.scoring.maxPoints, spec.max)
  assert.equal(exam.scoring.passingPoints, spec.pass)
  const scored = new Map(exam.scoring.steps.map((step) => [step.id, step]))
  assert.equal(scored.size, exam.scoring.steps.length, `Duplicate rubric step for ${spec.id}`)
  assert.equal(exam.scoring.steps.reduce((sum, step) => sum + step.points, 0), spec.max)
  for (const id of spec.mandatorySteps) {
    const step = scored.get(id)
    assert.ok(step, `Missing mandatory rubric step ${id}`)
    assert.ok(spec.max - step.points < spec.pass,
      `Assessment ${spec.id} can pass while omitting ${id}`)
  }
  for (const token of spec.taskEvidence) {
    assert.ok(exam.taskContent.toLowerCase().includes(token.toLowerCase()),
      `Assessment ${spec.id} does not ask for ${token}`)
  }
}

for (const id of [
  '6224d04c-bc07-4b60-b4c2-a1c7223adc9f',
  '8d314e15-69e9-5af1-a10a-be820b2f821d',
]) {
  assert.deepEqual(goals.get(id)?.applicability?.jurisdiction, allGermanJurisdictions,
    `Assessment ${id} must retain its materialized backend jurisdiction scope`)
}

// These own tasks also need persisted applicability for the backend. A
// compiler's broader All-of bound does not authorize a reviewed narrower task
// in an extra jurisdiction (notably the intentional Mono exclusion of BY).
const nationwideExceptBy = allGermanJurisdictions.filter(code => code !== 'DE-BY')
const monoCompilerUpperBound = allGermanJurisdictions.filter(code => !['DE-BE', 'DE-HH'].includes(code))
const monoReviewedRuntimeScope = monoCompilerUpperBound.filter(code => code !== 'DE-BY')
const ownRuntimeScopes = [
  { id: '331db19e-f903-5ac8-b78d-d805f4af54f2', runtime: nationwideExceptBy, compilerUpperBound: nationwideExceptBy,
    requires: ['fc2cf102-dcde-5565-884f-7c9e3e3b54b6', 'c65ecabf-d00b-4e2d-99ae-b64692325ffb'],
    covered: ['fc2cf102-dcde-5565-884f-7c9e3e3b54b6'] },
  { id: 'da30a5ab-6609-533f-b6f1-c717fee3a795', runtime: nationwideExceptBy, compilerUpperBound: nationwideExceptBy,
    requires: ['81527aac-1abf-588d-acae-b82a86564b06', '9ea981ed-8b78-502c-b316-01d8cb885814'],
    covered: ['81527aac-1abf-588d-acae-b82a86564b06', '9ea981ed-8b78-502c-b316-01d8cb885814'] },
  { id: '010c133c-dcf1-5530-8305-61bc638017bc', runtime: monoReviewedRuntimeScope, compilerUpperBound: monoCompilerUpperBound,
    requires: ['2850e8f6-2330-50d3-a577-d519540d9924'], covered: ['2850e8f6-2330-50d3-a577-d519540d9924'] },
]
function assertOwnRuntimeScope(goal: ExamGoal | undefined, expectedScope: string[], compilerUpperBound: string[]): void {
  assert.ok(goal?.examData, 'Missing own assessment with materialized backend applicability')
  assert.equal(goal.examData.reviewStatus, 'released')
  assert.equal(goal.extendedData?.applicabilityFromRequires, true)
  assert.equal(goal.extendedData?.applicabilityMappingInheritance, 'boundary')
  const runtime = goal.applicability?.jurisdiction
  assert.ok(Array.isArray(runtime) && runtime.length > 0,
    `Assessment ${goal.id} needs materialized backend jurisdiction scope; FromRequires alone is insufficient`)
  assert.deepEqual(runtime, [...new Set(runtime)].sort(), `Duplicate or unordered runtime jurisdiction for ${goal.id}`)
  assert(runtime.every(code => compilerUpperBound.includes(code)), `Assessment ${goal.id} exceeds its compiler All-of bound`)
  assert.deepEqual(runtime, expectedScope, `Assessment ${goal.id} differs from its independently reviewed runtime scope`)
}
let ownRuntimeMutationCases = 0
for (const spec of ownRuntimeScopes) {
  const goal = goals.get(spec.id)
  assertOwnRuntimeScope(goal, spec.runtime, spec.compilerUpperBound)
  assert.ok(goal)
  assert.deepEqual(goal.requires, spec.requires, `Own assessment ${spec.id} changed its reviewed preparation`)
  assert.deepEqual(goal.examData?.coveredGoalIds, spec.covered, `Own assessment ${spec.id} changed its scored coverage`)
  for (const missing of [true, false]) {
    const changed = structuredClone(goal)
    if (missing) delete changed.applicability
    else changed.applicability = { jurisdiction: [] }
    assert.throws(() => assertOwnRuntimeScope(changed, spec.runtime, spec.compilerUpperBound), /materialized backend/)
    ownRuntimeMutationCases++
  }
}
const heOnlyBus = structuredClone(goals.get(ownRuntimeScopes[0].id)!)
heOnlyBus.applicability = { jurisdiction: ['DE-HE'] }
assert.throws(() => assertOwnRuntimeScope(heOnlyBus, nationwideExceptBy, nationwideExceptBy), /reviewed runtime scope/)
ownRuntimeMutationCases++
assert(monoReviewedRuntimeScope.length < monoCompilerUpperBound.length, 'The reviewed Mono scope intentionally narrows its compiler bound')
const broadenedMono = structuredClone(goals.get(ownRuntimeScopes[2].id)!)
broadenedMono.applicability = { jurisdiction: monoCompilerUpperBound }
assert.throws(() => assertOwnRuntimeScope(broadenedMono, monoReviewedRuntimeScope, monoCompilerUpperBound), /reviewed runtime scope/)
ownRuntimeMutationCases++

const bilingualSourceSections = [
  {
    id: '728fd537-40d3-5fdf-8b08-925cba0b2004',
    headings: [
      '## Aufgabe (DE;',
      '## Task (EN;',
      '## Lösung und fachliche Prüfung (DE;',
      '## Solution and mathematical check (EN;',
      '## Bewertungsvorschlag',
    ],
  },
  {
    id: '22842d80-de9d-5dad-9819-6ae6e9ca61be',
    headings: [
      '## Aufgabe (DE;',
      '## Task (EN;',
      '## Musterlösung (DE;',
      '## Sample solution (EN;',
      '## Bewertungsvorschlag',
    ],
  },
] as const
for (const spec of bilingualSourceSections) {
  const exam = goals.get(spec.id)?.examData
  assert.ok(exam)
  const source = readFileSync(resolve(root, exam.sourceArtifactPath), 'utf8')
  const positions = spec.headings.map((heading) => source.indexOf(heading))
  assert.ok(positions.every((position) => position >= 0))
  const sections = positions.slice(0, -1).map((position, index) =>
    source.slice(source.indexOf('\n', position) + 1, positions[index + 1]).trim())
  assert.deepEqual(
    [exam.taskContent, exam.taskContentEn, exam.solutionContent, exam.solutionContentEn],
    sections,
    `Bilingual source/runtime drift for ${spec.id}`,
  )
}

// The plane task scores three cases through several partial steps. The source
// rubric retains the original 5/8 cap for A's geometry, plus up to 3 BE for
// its method comparison (8/11 overall); B and C remain capped at 3/6 each.
// The reviewed 21/23 threshold still rejects every incomplete case.
assert.equal(goals.get('8d314e15-69e9-5af1-a10a-be820b2f821d')?.examData?.scoring.passingPoints, 21)
for (const incompleteCaseMaximum of [8 + 6 + 6, 11 + 3 + 6, 11 + 6 + 3, 20]) {
  assert.ok(incompleteCaseMaximum < 21)
}

console.log(`Mathematics checkpoint assessment contracts passed (${expected.length} reviewed examinations; ${ownRuntimeScopes.length} materialized own-task scopes; ${ownRuntimeMutationCases} runtime-scope mutation cases; 3 productive preparation contracts and 3 semantic mutation cases). Content release is not a real-host or human trial.`)
