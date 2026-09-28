#!/usr/bin/env node
// Rebind only the two reworded goals to current text and unchanged images.
// Source candidate sets remain untouched and hash-pinned for provenance.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const packagePath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-two-reworded-image-bound-current-v1/'
const config = JSON.parse(readFileSync(resolve(root, `${packagePath}positive-evidence.config.json`), 'utf8'))
const landscape = JSON.parse(readFileSync(resolve(root, config.landscapePath), 'utf8'))
const outputPath = resolve(root, `${packagePath}positive-evidence.candidates.json`)
const sourceSpecs = [
  {
    path: 'curricula/DE/Gymnasium/quality/goal-evidence/m7-p-gap-first15-20260923-v1/image-bound-14.candidates.json',
    sha256: 'e8ec18c2ec5080d7a60cd7195a706e1e8c598eb55582e9a4c9d40c0b83eb95ba',
    goalId: '09f47964-2cd0-410e-93ee-9632b582fc91',
    description: 'Die lernende Person kann eine reellwertige Funktion als Zuordnung erklären, die jedem zulässigen Eingabewert genau einen Funktionswert zuweist, und Term, Wertetabelle und Graph einer gegebenen Funktion als zusammengehörige Darstellungen verwenden.',
    descriptionEn: 'The learner can explain a real-valued function as assigning exactly one function value to each permitted input and use the expression, value table, and graph of a given function as corresponding representations.',
  },
  {
    path: 'curricula/DE/Gymnasium/quality/goal-evidence/m7-vready-q4-families-five-20260923-v1/positive-evidence.candidates.json',
    sha256: '0f33dd10290c0fbc59d1d86b64b61ffcedc9a7a4f0b5252d24f1215560f21b58',
    goalId: '0e8417d7-effb-5314-93ba-a571b01726ce',
    description: 'Die lernende Person kann Integrale geeigneter Verknüpfungen von Exponential- und ganzrationalen Funktionen berechnen und die verwendeten Stammfunktionen durch Ableiten nachweisen.',
    descriptionEn: 'The learner can compute integrals of suitable combinations of exponential and polynomial functions and verify the antiderivatives used by differentiating them.',
  },
]

const goals = sourceSpecs.map((spec) => {
  const bytes = readFileSync(resolve(root, spec.path))
  const digest = createHash('sha256').update(bytes).digest('hex')
  if (digest !== spec.sha256) throw new Error(`Historical candidate source changed: ${spec.path}`)
  const source = JSON.parse(bytes.toString('utf8'))
  const matches = source.goals.filter(({ goalId }) => goalId === spec.goalId)
  if (matches.length !== 1) throw new Error(`Expected one source candidate for ${spec.goalId}`)
  const canonical = landscape.goals.find(({ id }) => id === spec.goalId)
  if (!canonical || canonical.description !== spec.description || canonical.descriptionEn !== spec.descriptionEn) {
    throw new Error(`Current DE/EN text changed; reinspect ${spec.goalId}`)
  }
  return structuredClone(matches[0])
})
if (goals.some(({ goalId }, index) => goalId !== config.scope.goalIds[index])) {
  throw new Error('Candidate scope differs from config')
}

const mapping = goals[0]
mapping.reason = 'Current DE/EN wording and unchanged JPG re-inspected on 2026-09-27. The image gives one concrete function f(x)=2x with consistent table, expression and plotted points; the profile tests only the correspondence of representations for a given function, never a unique formula inferred from a finite table. E1/G1 AI candidate, not human approval.'
mapping.dissent = []
mapping.evidenceLevel = 'E1'
mapping.maximumClaimScope = 'G1'
mapping.profile.expectations[0].observablePerformanceDe = 'Die lernende Person erklärt die Eindeutigkeit der Zuordnung, erstellt zu einer gegebenen Funktionsvorschrift passende Tabellenwerte und Graphpunkte und verknüpft diese mit denselben Eingabewerten.'
mapping.profile.expectations[0].observablePerformanceEn = 'The learner explains uniqueness of the assignment, creates matching table values and graph points from a given function rule, and connects these to the same inputs.'
mapping.profile.variationAxes[0].textDe = 'Zwei verschiedene vorgegebene Funktionsterme auf beschränkten Definitionsbereichen; einmal Darstellungen erzeugen, einmal einen Widerspruch zwischen Darstellungen finden.'
mapping.profile.variationAxes[0].textEn = 'Two different given function rules on restricted domains; first create representations, then find an inconsistency between representations.'
mapping.profile.applicationCaseBriefs = [
  {
    id: 'given-rule-to-corresponding-forms',
    taskDemandDe: 'Für die gegebene Funktion f(x)=2x+1 auf [0,2]: erstelle eine Wertetabelle für x=0,1,2 und die zugehörigen Graphpunkte. Erkläre, weshalb jedem zulässigen x genau ein f(x) zugeordnet ist und die Tabelle nicht den ganzen Definitionsbereich enthält.',
    taskDemandEn: 'For the given function f(x)=2x+1 on [0,2], make a value table for x=0,1,2 and the corresponding graph points. Explain why every permitted x has exactly one f(x) and why the table does not list the entire domain.',
    expectedPerformanceDe: 'Die Werte sind 1,3,5 und die Punkte (0,1),(1,3),(2,5). Der Graph ist das Geradenstück y=2x+1 für alle 0≤x≤2; die drei Tabellenzeilen sind nur Beispiele daraus. Die Vorschrift liefert zu jedem x im Intervall genau einen Wert.',
    expectedPerformanceEn: 'Values are 1,3,5 and points (0,1),(1,3),(2,5). The graph is the line segment y=2x+1 for all 0≤x≤2; the three table rows are only samples. The rule assigns exactly one value to every x in the interval.',
    understandingFocusDe: 'Eindeutige Zuordnung und die gleiche Funktion in Term, Stichprobentabelle und Graph.',
    understandingFocusEn: 'Unique assignment and the same function in expression, sampled table and graph.',
  },
  {
    id: 'given-rule-detect-mismatch',
    taskDemandDe: 'Die gegebene Funktion g(x)=3−x gilt auf [0,3]. Ein Graph ist das Geradenstück von (0,3) bis (3,0), die Tabelle nennt für x=0,1,2,3 die Werte 3,2,2,0. Prüfe Term, Graph und Tabelle auf Übereinstimmung und korrigiere genau den falschen Eintrag.',
    taskDemandEn: 'The given function g(x)=3−x is defined on [0,3]. A graph is the line segment from (0,3) to (3,0), and a table lists values 3,2,2,0 for x=0,1,2,3. Check expression, graph and table for agreement and correct the one wrong entry.',
    expectedPerformanceDe: 'Bei x=2 liefert der Term g(2)=1 und der Graph den Punkt (2,1), nicht den Tabellenwert 2. Korrekt ist die Wertfolge 3,2,1,0; für jeden Eingabewert im Definitionsbereich bleibt die Zuordnung eindeutig.',
    expectedPerformanceEn: 'At x=2 the rule gives g(2)=1 and the graph contains (2,1), not the tabulated value 2. The correct sequence is 3,2,1,0; each input in the domain still has a unique output.',
    understandingFocusDe: 'Transfer durch Prüfung der Übereinstimmung statt Herleitung eines angeblich eindeutigen Terms aus endlich vielen Tabellenwerten.',
    understandingFocusEn: 'Transfer by checking consistency rather than supposedly deriving a unique rule from finitely many table values.',
  },
]

const integrals = goals[1]
integrals.reason = 'Current DE/EN wording and unchanged JPG re-inspected on 2026-09-27. The pictured suitable product case x·e^x correctly gives F=(x−1)e^x, F′=x·e^x and the definite integral 1; the independent reverse-chain case tests transfer. The profile does not imply that every arbitrary polynomial-exponential combination has an elementary antiderivative. E1/G1 AI candidate, not human approval.'
integrals.dissent = []
integrals.evidenceLevel = 'E1'
integrals.maximumClaimScope = 'G1'

const candidateSet = {
  schemaVersion: 1,
  authoringContract: 'positive-understanding-evidence-candidates-v1',
  reviewId: config.reviewId,
  reviewedAt: '2026-09-27T01:30:00.000Z',
  reviewer: 'Codex Math two-goal current-text and unchanged-image reinspection; AI candidate only',
  goals,
}
const expected = `${JSON.stringify(candidateSet, null, 2)}\n`
if (process.argv.slice(2).join(' ') === '--write') {
  writeFileSync(outputPath, expected, { flag: 'wx' })
  console.log(`Wrote ${outputPath}`)
} else if (process.argv.length === 2) {
  if (readFileSync(outputPath, 'utf8') !== expected) throw new Error('Generated candidate set differs from pinned sources and current text')
  console.log(`Verified ${outputPath}`)
} else {
  throw new Error('Usage: node materialize-candidates.mjs [--write]')
}
