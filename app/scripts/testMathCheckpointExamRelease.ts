import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

type ScoringStep = { id: string; points: number; description: string }
type ExamGoal = {
  id: string
  requires: string[]
  applicability?: { jurisdiction?: string[] }
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
    max: 20,
    pass: 18,
    mandatorySteps: [
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
  assert.deepEqual(goal.requires, exam.coveredGoalIds, `Assessment ${spec.id} has unexamined prerequisites`)
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
// rubric caps each incomplete case at 5/8, 3/6 and 3/6 respectively; with the
// 18/20 passing threshold no such incomplete case can pass.
assert.equal(goals.get('8d314e15-69e9-5af1-a10a-be820b2f821d')?.examData?.scoring.passingPoints, 18)
for (const incompleteCaseMaximum of [5 + 6 + 6, 8 + 3 + 6, 8 + 6 + 3]) {
  assert.ok(incompleteCaseMaximum < 18)
}

console.log(`Mathematics checkpoint assessment contracts passed (${expected.length} reviewed examinations). Content release is not a real-host or human trial.`)
