import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { buildPositiveGoalEvidenceCandidateRecords } from './materializePositiveGoalEvidenceCandidates'
import type { PositiveGoalEvidenceProfile } from './positiveGoalEvidenceProfileModel'
import {
  reviewPositiveGoalEvidenceConfig,
  type PositiveGoalEvidenceReviewConfig,
} from './positiveGoalEvidenceReview'

type JsonRecord = Record<string, unknown>
type UnderstandingEvidence = {
  essentialUnderstandingDe: string
  essentialUnderstandingEn: string
  observablePerformanceDe: string
  observablePerformanceEn: string
  transferExpectationDe: string
  transferExpectationEn: string
}
type ProfileSpec = {
  archetype: PositiveGoalEvidenceProfile['archetype']
  axes: PositiveGoalEvidenceProfile['variationAxes']
  cases: PositiveGoalEvidenceProfile['applicationCaseBriefs']
}

const repositoryRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const unknownArguments = process.argv.slice(2).filter((argument) => argument !== '--write')
if (unknownArguments.length > 0) throw new Error(`Unknown arguments: ${unknownArguments.join(', ')}`)

const batchDirectory = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-05/batch-032r-adjudicated-final-recheck-10-v1'
const resolutionIndexPath = `${batchDirectory}/resolution-index.stable-current-carryover-9-v1.json`
const synthesisPath = `${batchDirectory}/synthesis-decisions.stable-current-carryover-9-v1.json`
const roundARecordsPath = `${batchDirectory}/round-a/results/mathematik-rollout-v1-batch-032r-adjudicated-final-recheck-10-v1-20260905-first-pass-a.batch-001.records.jsonl`
const roundBRecordsPath = `${batchDirectory}/round-b/results/mathematik-rollout-v1-batch-032r-adjudicated-final-recheck-10-v1-20260905-first-pass-b.batch-001.records.jsonl`
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const semanticKindLedgerPath = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
const criteriaPath = 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/mathematik-positive-understanding-evidence-profile-criteria-v2.md'
const artifactRoot = 'curricula/DE/Gymnasium/quality/goal-evidence'
const artifactStem = 'canonical-math-positive-understanding-evidence-rollout-v1-batch-032r-stable-current-carryover-9-v1'
const configPath = `${artifactRoot}/${artifactStem}.config.json`
const candidatesPath = `${artifactRoot}/${artifactStem}.candidates.json`
const reviewPath = `${artifactRoot}/${artifactStem}.review.jsonl`
const reviewId = 'canonical-math-positive-evidence-v1-b032r-stable-current-carryover-9-v1'
const landscapeId = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const reviewedAt = '2026-09-05T02:21:22.000Z'
const reviewer = 'codex-math-b032r-stable-nine-positive-understanding-candidate-2026-09-05'
const excludedGoalId = '5bced7dc-6557-4af1-9e70-d87f850d3b7f'

const goalIds = [
  '7676b0f9-340d-4a91-ab1f-92745a8f88db',
  'f9e21454-857c-5a6a-8367-32a34fc0026b',
  '66077296-a8f8-4645-938b-7c3424cb2f14',
  'eb28b403-f9fc-57ea-a793-b4555596fdd7',
  '97b3232d-b89f-48b8-9fa1-7a25a1bdbb3d',
  'c8818eae-0c4d-4fa1-9085-04a9c95a668b',
  '0c8c1ae9-135e-4fe5-bf67-e497eb3a9909',
  '786ae588-a4fb-40e6-a7f5-113cfc2bfd0f',
  'e0c3359d-7d8a-4d01-a25e-a8cd5ebce90e',
] as const

const axis = (id: string, textDe: string, textEn: string) => ({ id, textDe, textEn })
const applicationCase = (
  id: string,
  taskDemandDe: string,
  taskDemandEn: string,
  expectedPerformanceDe: string,
  expectedPerformanceEn: string,
  understandingFocusDe: string,
  understandingFocusEn: string,
) => ({ id, taskDemandDe, taskDemandEn, expectedPerformanceDe, expectedPerformanceEn, understandingFocusDe, understandingFocusEn })

const profileSpecs = new Map<string, ProfileSpec>([
  [goalIds[0], {
    archetype: 'proof',
    axes: [
      axis('proof-presentation', 'Vollständiger, lückenhafter, umgeordneter und fehlerhafter Beweis wechseln.', 'Complete, incomplete, reordered, and flawed proofs vary.'),
      axis('notation', 'Variablennamen, Teilbarkeitsschreibweise und Form des rationalen Ansatzes wechseln.', 'Variable names, divisibility notation, and the form of the rational assumption vary.'),
    ],
    cases: [
      applicationCase('repair-parity-gap', 'Ein Beweis zu √2 folgert aus p² gerade unmittelbar, dass p gerade ist, ohne Begründung. Ergänze den fehlenden Schritt und führe den Beweis bis zum Widerspruch zu Ende.', 'A proof about √2 infers directly that p is even from p squared being even without justification. Supply the missing step and complete the proof through the contradiction.', 'Die lernende Person begründet den Paritätsschluss etwa über die Kontraposition, setzt p=2k ein, folgert q gerade und verwirft wegen des gemeinsamen Faktors 2 die angenommene vollständig gekürzte Darstellung.', 'The learner justifies the parity inference, for example by contraposition, substitutes p=2k, concludes that q is even, and rejects the assumed lowest-terms representation because of the common factor 2.', 'Jeder Teilbarkeitsschritt und die Rückbindung des Widerspruchs an die Rationalitätsannahme sind notwendig.', 'Every divisibility step and the link from the contradiction back to the rationality assumption are necessary.'),
      applicationCase('diagnose-wrong-conclusion', 'Ein umbenannter Beweis endet nach r und s sind gerade mit „also ist r/s falsch berechnet“. Diagnose und korrigiere die Schlussfolgerung.', 'A relabelled proof ends after r and s are even with “therefore r/s was calculated incorrectly.” Diagnose and correct the conclusion.', 'Die lernende Person erklärt, dass nicht die Rechnung, sondern die Existenz einer teilerfremden Bruchdarstellung von √2 widerlegt ist, und formuliert den indirekten Schluss vollständig.', 'The learner explains that the calculation is not what is refuted; rather, the existence of a coprime fractional representation of √2 is impossible, and states the indirect conclusion completely.', 'Der konkrete Widerspruch widerlegt genau die Ausgangsannahme.', 'The concrete contradiction refutes precisely the initial assumption.'),
    ],
  }],
  [goalIds[1], {
    archetype: 'concept',
    axes: [
      axis('representation', 'Bruch, Dezimaldarstellung, Wurzelausdruck und geometrisch definierte Länge wechseln.', 'Fractions, decimal representations, radical expressions, and geometrically defined lengths vary.'),
      axis('epistemic-status', 'Exakter Wert, äquivalente Umformung und endliche Näherung wechseln.', 'Exact values, equivalent rewrites, and finite approximations vary.'),
    ],
    cases: [
      applicationCase('classify-exact-and-approximate', 'Ordne 0,125, 0,1̅, √18/3 und die Anzeige 1,414 ein. Trenne dabei den exakten Wert von einer möglichen Näherung.', 'Classify 0.125, repeating 0.1, √18/3, and the display 1.414. Distinguish exact values from a possible approximation.', 'Die ersten beiden Zahlen sind rational; √18/3=√2 ist irrational. Die endliche Anzeige 1,414 ist als Zahl rational, kann aber eine Näherung an einen irrationalen Wert sein und beweist dessen Klassifikation nicht.', 'The first two numbers are rational; √18/3=√2 is irrational. The finite display 1.414 is rational as a number but may approximate an irrational value and does not prove that value’s classification.', 'Die Klassifikation hängt vom exakten Wert und einem begründenden Kriterium ab, nicht vom Aussehen.', 'Classification depends on the exact value and a justified criterion, not appearance.'),
      applicationCase('geometric-number-line-gap', 'Ein Quadrat mit Seitenlänge 1 besitzt die Diagonale d. Erkläre, warum d auf der reellen Zahlengeraden liegt, aber nicht durch eine rationale Zahl dargestellt werden kann.', 'A square with side length 1 has diagonal d. Explain why d lies on the real number line but cannot be represented by a rational number.', 'Mit Pythagoras gilt d=√2; der gebundene Widerspruchsbeweis zeigt d∉ℚ, während die geometrische Länge einen reellen Zahlengeradenpunkt liefert. Daher ist ℚ eine echte Teilmenge von ℝ.', 'By Pythagoras, d=√2; the bound contradiction proof shows d is not rational, while the geometric length gives a real number-line point. Thus ℚ is a proper subset of ℝ.', 'Die Zahlbereichserweiterung schließt reale Größen ein, die ℚ nicht erfasst.', 'The extension of the number system includes real quantities not captured by ℚ.'),
    ],
  }],
  [goalIds[2], {
    archetype: 'representation',
    axes: [
      axis('root-index', 'Quadrat- und Kubikwurzelfunktion wechseln.', 'Square-root and cube-root functions vary.'),
      axis('given-form', 'Term, Wertetabelle und unvollständiger Graph wechseln als Ausgangsdarstellung.', 'Formula, value table, and partial graph vary as the starting representation.'),
    ],
    cases: [
      applicationCase('square-root-from-formula', 'Untersuche f(x)=√(x−2)+1: Bestimme Definitions- und Wertemenge, konstruiere den Graphen aus begründeten Punkten und erkläre Randpunkt und Monotonie.', 'Investigate f(x)=√(x−2)+1: determine domain and range, construct the graph from justified points, and explain its endpoint and monotonicity.', 'Aus x−2≥0 folgen D=[2,∞) und W=[1,∞). Punkte wie (2,1), (3,2) und (6,3) begründen den bei (2,1) beginnenden, steigenden Graphen.', 'From x−2≥0, D=[2,∞) and W=[1,∞). Points such as (2,1), (3,2), and (6,3) justify the increasing graph beginning at (2,1).', 'Zulässige Eingaben, Ausgaben und Graphmerkmale müssen aus demselben Term konsistent folgen.', 'Admissible inputs, outputs, and graph features must follow consistently from the same formula.'),
      applicationCase('cube-root-from-partial-graph', 'Ein unvollständiger Graph gehört zu g(x)=∛x−2 und zeigt nur x≥0. Ergänze die fehlende linke Hälfte, bestimme Definitions- und Wertemenge und begründe den Achsenschnitt.', 'A partial graph belongs to g(x)=∛x−2 and shows only x≥0. Complete the missing left half, determine domain and range, and justify the axis intercept.', 'Kubikwurzeln sind für alle reellen x definiert und nehmen alle reellen Werte an. Der Graph setzt sich links fort, ist streng steigend und schneidet die y-Achse bei (0,−2).', 'Cube roots are defined for every real x and take every real value. The graph continues to the left, is strictly increasing, and meets the y-axis at (0,−2).', 'Ein abgeschnittener Ausschnitt darf Definitions- oder Wertemenge nicht künstlich begrenzen.', 'A clipped view must not artificially restrict the domain or range.'),
    ],
  }],
  [goalIds[3], {
    archetype: 'representation',
    axes: [
      axis('transformation-location', 'Änderungen im Argument und außerhalb des Funktionsterms wechseln.', 'Changes inside the argument and outside the function expression vary.'),
      axis('base-family', 'Potenz- und Wurzelgrundfunktionen mit verschiedenen Symmetrien und Definitionsmengen wechseln.', 'Power and root base functions with different symmetries and domains vary.'),
    ],
    cases: [
      applicationCase('transform-square-root', 'Leite den Graphen von h(x)=−2√(x+3)+1 aus y=√x her und bestimme die neue Definitions- und Wertemenge.', 'Derive the graph of h(x)=−2√(x+3)+1 from y=√x and determine the new domain and range.', 'Der Graph wird um 3 nach links verschoben, vertikal mit Faktor 2 gestreckt, an der x-Achse gespiegelt und um 1 nach oben verschoben; D=[−3,∞), W=(−∞,1].', 'The graph shifts 3 units left, is vertically stretched by factor 2, reflected in the x-axis, and shifted 1 unit up; D=[−3,∞), W=(−∞,1].', 'Innere und äußere Änderungen wirken in verschiedenen Richtungen und verändern bei Wurzeln auch die zulässigen Eingaben.', 'Inner and outer changes act in different directions and, for roots, also change admissible inputs.'),
      applicationCase('reconstruct-power-expression', 'Ein Graph entsteht aus y=x³ durch Spiegelung an der y-Achse, horizontale Stauchung und Verschiebung um 2 nach unten. Gib einen passenden Term an und begründe jede Wirkung.', 'A graph is obtained from y=x³ by reflection in the y-axis, horizontal compression, and a shift 2 units down. Give a suitable expression and justify each effect.', 'Ein möglicher Term ist f(x)=(−2x)³−2. Das Minus im Argument spiegelt horizontal, der Betrag 2 staucht horizontal, und −2 wirkt vertikal; äquivalente Terme werden als solche erkannt.', 'One possible expression is f(x)=(−2x)³−2. The negative sign in the argument reflects horizontally, magnitude 2 compresses horizontally, and −2 acts vertically; equivalent expressions are recognized.', 'Term und Graph werden über Parameterwirkung rekonstruiert, nicht nur zugeordnet.', 'Formula and graph are reconstructed through parameter effects, not merely matched.'),
    ],
  }],
  [goalIds[4], {
    archetype: 'representation',
    axes: [
      axis('trigonometric-coordinate', 'Sinus- und Kosinusvorgabe wechseln.', 'Sine and cosine givens vary.'),
      axis('angle-output', 'Positive, negative und koterminale Gradwinkel sowie verschiedene Quadranten wechseln.', 'Positive, negative, and coterminal degree angles and different quadrants vary.'),
    ],
    cases: [
      applicationCase('all-degree-solutions', 'Bestimme alle α∈[0°,360°] mit sin α=−1/2 und begründe Vorzeichen und Symmetrie am Einheitskreis.', 'Determine all α in [0°,360°] satisfying sin α=−1/2 and justify the sign and symmetry on the unit circle.', 'Die y-Koordinate ist in Quadrant III und IV negativ; mit Referenzwinkel 30° erhält man 210° und 330°. Beide Punkte besitzen y=−1/2.', 'The y-coordinate is negative in quadrants III and IV; with reference angle 30°, the solutions are 210° and 330°. Both points have y=−1/2.', 'Koordinate, Quadrant und Symmetrie liefern vollständig alle Lösungen.', 'Coordinate, quadrant, and symmetry produce the complete solution set.'),
      applicationCase('negative-calculator-principal-value', 'Der Taschenrechner liefert arccos(−√3/2)=150°, aber für eine andere Einstellung −210°. Ordne die Angaben ein und nenne die Winkel im Grundintervall.', 'A calculator gives arccos(−√3/2)=150°, but another setting shows −210°. Interpret the outputs and state the angles in the principal degree interval.', '−210° ist zu 150° koterminal. Für cos α=−√3/2 liegen im Intervall 150° und 210°; die zweite Lösung folgt aus der Spiegelung an der x-Achse.', '−210° is coterminal with 150°. For cos α=−√3/2, the interval contains 150° and 210°; the second solution follows by reflection in the x-axis.', 'Ein Rechner-Hauptwert ersetzt weder geometrische Einordnung noch Vollständigkeitsprüfung.', 'A calculator principal value does not replace geometric interpretation or completeness checking.'),
    ],
  }],
  [goalIds[5], {
    archetype: 'representation',
    axes: [
      axis('quadrant', 'Zielwerte in allen vier Quadranten wechseln.', 'Target values in all four quadrants vary.'),
      axis('circle-labelling', 'Standardorientierte, gedrehte und teilweise beschriftete Einheitskreise wechseln.', 'Standard, rotated, and partially labelled unit circles vary.'),
    ],
    cases: [
      applicationCase('all-radian-solutions', 'Bestimme alle α∈[0,2π] mit cos α=−1/2 und erkläre die Lösungen als x-Koordinaten am Einheitskreis.', 'Determine all α in [0,2π] satisfying cos α=−1/2 and explain the solutions as x-coordinates on the unit circle.', 'Die x-Koordinate −1/2 tritt in Quadrant II und III auf; die Winkel sind 2π/3 und 4π/3. Die Vorzeichen der y-Koordinate unterscheiden die Punkte.', 'The x-coordinate −1/2 occurs in quadrants II and III; the angles are 2π/3 and 4π/3. The signs of the y-coordinate distinguish the points.', 'Bogenmaß, Koordinaten und Symmetrie werden als ein Modell genutzt.', 'Radian measure, coordinates, and symmetry are used as one model.'),
      applicationCase('partial-radian-circle', 'Ein Einheitskreis ist nur bei 0, π/2 und π beschriftet. Trage 7π/6 und 11π/6 ein und bestimme Sinus und Kosinus ohne Gradmaßumrechnung.', 'A unit circle is labelled only at 0, π/2, and π. Plot 7π/6 and 11π/6 and determine sine and cosine without converting to degrees.', 'Beide Winkel liegen um π/6 unter beziehungsweise über der negativen oder positiven x-Achse; daraus folgen (−√3/2,−1/2) und (√3/2,−1/2).', 'The two angles lie π/6 beyond or below the negative or positive x-axis; the coordinates are (−√3/2,−1/2) and (√3/2,−1/2).', 'Die Lösung entsteht direkt aus Bogenmaß und Kreissymmetrie statt aus einem Gradmaßschema.', 'The solution follows directly from radian measure and circle symmetry rather than a degree template.'),
    ],
  }],
  [goalIds[6], {
    archetype: 'proof',
    axes: [
      axis('triangle-shape', 'Spitze und stumpfe Dreiecke sowie verschiedene Höhenlagen wechseln.', 'Acute and obtuse triangles and different altitude locations vary.'),
      axis('labelling', 'Seiten-, Winkel- und Eckpunktbezeichnungen wechseln.', 'Side, angle, and vertex labels vary.'),
    ],
    cases: [
      applicationCase('derive-with-altitude', 'Fälle in einem spitzen Dreieck von C die Höhe h auf AB und leite aus beiden rechtwinkligen Teildreiecken a/sin α=b/sin β her.', 'Drop altitude h from C to AB in an acute triangle and derive a/sin α=b/sin β from the two right-triangle parts.', 'Die lernende Person stellt h=a·sin β und h=b·sin α auf, setzt gleich und formt mit korrekter Zuordnung der Gegenwinkel zur Verhältnisgleichung um.', 'The learner writes h=a·sin β and h=b·sin α, equates them, and rearranges to the ratio equation with correct matching of opposite angles.', 'Der Sinussatz entsteht aus zwei Darstellungen derselben Höhe.', 'The sine law arises from two expressions for the same altitude.'),
      applicationCase('adapt-obtuse-derivation', 'Übertrage die Höhenargumentation auf ein stumpfwinkliges, anders beschriftetes Dreieck, bei dem die Höhe außerhalb liegt, und erkläre die Rolle supplementärer Winkel.', 'Adapt the altitude argument to a differently labelled obtuse triangle whose altitude lies outside, and explain the role of supplementary angles.', 'Die Hilfskonstruktion wird außerhalb korrekt fortgesetzt; wegen sin(180°−α)=sin α bleibt dieselbe Seiten-Sinus-Beziehung gültig. Die Formel wird aus der Geometrie neu hergeleitet.', 'The external auxiliary construction is handled correctly; because sin(180°−α)=sin α, the same side-sine relation remains valid. The formula is re-derived from the geometry.', 'Die Herleitung muss Orientierung und stumpfen Fall überstehen, nicht nur Bezeichnungen austauschen.', 'The derivation must survive a changed orientation and the obtuse case, not merely relabel symbols.'),
    ],
  }],
  [goalIds[7], {
    archetype: 'proof',
    axes: [
      axis('derivation-route', 'Koordinaten- und Zerlegungsherleitung wechseln.', 'Coordinate and decomposition derivations vary.'),
      axis('included-angle', 'Spitzer, rechter und stumpfer eingeschlossener Winkel wechseln.', 'Acute, right, and obtuse included angles vary.'),
    ],
    cases: [
      applicationCase('coordinate-cosine-law', 'Setze A=(0,0), B=(c,0), C=(b cos α,b sin α) und leite die Länge a=|BC| vollständig her.', 'Set A=(0,0), B=(c,0), C=(b cos α,b sin α) and derive the length a=|BC| completely.', 'Aus der Abstandsformel folgt a²=(b cos α−c)²+(b sin α)²=b²+c²−2bc cos α; sin²α+cos²α=1 wird explizit verwendet.', 'The distance formula gives a²=(b cos α−c)²+(b sin α)²=b²+c²−2bc cos α; sin²α+cos²α=1 is used explicitly.', 'Der Korrekturterm entsteht nachvollziehbar aus der Projektion einer Seitenkomponente.', 'The correction term arises transparently from projecting a side component.'),
      applicationCase('obtuse-sign-and-right-limit', 'Leite für einen stumpfen Winkel γ dieselbe Formel mit passend gewählter Zerlegung her und erkläre anschließend den Spezialfall γ=90°.', 'Derive the same formula for an obtuse angle γ using a suitable decomposition, then explain the special case γ=90°.', 'Das negative cos γ macht −2ab cos γ positiv und vergrößert die Gegenseite gegenüber dem rechten Vergleichsfall. Bei 90° ist cos γ=0, sodass Pythagoras verbleibt.', 'Negative cos γ makes −2ab cos γ positive and enlarges the opposite side relative to the right-angle comparison. At 90°, cos γ=0, leaving Pythagoras.', 'Vorzeichen und Spezialfall werden aus der Herleitung erklärt, nicht auswendig behauptet.', 'The sign and special case are explained from the derivation rather than asserted from memory.'),
    ],
  }],
  [goalIds[8], {
    archetype: 'representation',
    axes: [
      axis('parabola-shape', 'Öffnungsrichtung, Streckung und Verschiebung wechseln.', 'Opening direction, stretch, and shift vary.'),
      axis('view-window', 'Vollständige und beschnittene, unterschiedlich skalierte Graphen wechseln.', 'Complete and clipped graphs with varied scales are used.'),
    ],
    cases: [
      applicationCase('complete-parabola-analysis', 'Ein Graph zeigt eine nach unten geöffnete Parabel mit S(2|5), Nullstellen −1 und 5 sowie f(0)=25/9. Bestimme Wertemenge, Vorzeichen- und Monotoniebereiche und begründe ihre Konsistenz.', 'A graph shows a downward-opening parabola with vertex S(2,5), roots −1 and 5, and f(0)=25/9. Determine its range, sign intervals, and monotonicity intervals and justify their consistency.', 'Die Wertemenge ist (−∞,5], die Funktion ist zwischen −1 und 5 positiv und außerhalb negativ, steigt bis x=2 und fällt danach. Alle Angaben folgen aus Öffnung, Scheitel und Achsenschnitten.', 'The range is (−∞,5], the function is positive between −1 and 5 and negative outside, increases to x=2 and decreases thereafter. Every statement follows from opening, vertex, and intercepts.', 'Kennwerte und Intervalle müssen sich gegenseitig bestätigen.', 'Key values and intervals must corroborate one another.'),
      applicationCase('clipped-window-claims', 'Ein Ausschnitt zeigt eine steigende Parabelkurve nur für 3≤x≤5 und ohne Scheitel oder Achsenschnitte. Nenne sichere Aussagen und kennzeichne unzulässige globale Schlüsse.', 'A window shows an increasing parabola segment only for 3≤x≤5 and contains neither vertex nor intercepts. State warranted claims and identify invalid global conclusions.', 'Sicher ist nur das beobachtete Monotonieverhalten und der sichtbare Wertebereich im Fenster. Globale Wertemenge, Zahl der Nullstellen, y-Achsenabschnitt und Scheitellage sind ohne weitere Daten nicht bestimmbar.', 'Only the observed monotonic behaviour and visible range within the window are warranted. The global range, number of roots, y-intercept, and vertex location cannot be determined without more data.', 'Graphisches Ablesen bleibt an sichtbare Evidenz und Skalierung gebunden.', 'Reading a graph remains bounded by visible evidence and scale.'),
    ],
  }],
])

const absolute = (path: string): string => resolve(repositoryRoot, path)
const sha256 = (value: Buffer | string): `sha256:${string}` => `sha256:${createHash('sha256').update(value).digest('hex')}`
const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const jsonlBytes = (values: unknown[]): Buffer => Buffer.from(`${values.map((value) => JSON.stringify(value)).join('\n')}\n`)
const parseJsonl = (path: string): JsonRecord[] => readFileSync(absolute(path), 'utf8').trim().split(/\r?\n/u).map((line) => JSON.parse(line) as JsonRecord)
const sameOrdered = (left: readonly string[], right: readonly string[]): boolean => (
  left.length === right.length && left.every((value, index) => value === right[index])
)
const writeOrCheck = (path: string, bytes: Buffer): void => {
  let current: Buffer | null = null
  try { current = readFileSync(absolute(path)) } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error
  }
  if (current?.equals(bytes)) return
  if (!writeMode) throw new Error(`${path}: missing or stale; run with --write`)
  if (current) throw new Error(`${path}: refusing to overwrite a foreign or stale evidence artifact`)
  mkdirSync(dirname(absolute(path)), { recursive: true })
  writeFileSync(absolute(path), bytes, { flag: 'wx' })
}

const main = async (): Promise<void> => {
  execFileSync('npm', ['exec', '--', 'tsx', 'scripts/materializeMathB032rStableNineCarryoverResolutions.ts'], {
    cwd: resolve(repositoryRoot, 'app'),
    stdio: 'inherit',
  })

  const indexBytes = readFileSync(absolute(resolutionIndexPath))
  const synthesisBytes = readFileSync(absolute(synthesisPath))
  const index = JSON.parse(indexBytes.toString('utf8')) as JsonRecord
  const synthesis = JSON.parse(synthesisBytes.toString('utf8')) as JsonRecord
  const resolutions = index.resolutions as JsonRecord[]
  const decisions = synthesis.decisions as JsonRecord[]
  if (
    index.subject !== 'Mathematik'
    || index.semanticKind !== 'curricularAtomic'
    || index.strictDescriptionReviewCompleteCount !== 9
    || index.curriculumAtomicDenominator !== 794
    || !Array.isArray(resolutions)
    || !Array.isArray(decisions)
    || !sameOrdered(resolutions.map(({ goalId }) => String(goalId)), goalIds)
    || !sameOrdered(decisions.map(({ goalId }) => String(goalId)), goalIds)
    || resolutions.some((entry) => entry.decision !== 'keep_current' || entry.strictDescriptionComplete !== true)
    || resolutions.some((entry) => entry.goalId === excludedGoalId)
  ) throw new Error('B032r stable9 resolution and synthesis scope is not exact-current')

  const roundABytes = readFileSync(absolute(roundARecordsPath))
  const roundBBytes = readFileSync(absolute(roundBRecordsPath))
  if (
    sha256(roundABytes) !== 'sha256:033ccb404485764736226d360cb246521004432b661d9b4e7ec2d39ca7f45a40'
    || sha256(roundBBytes) !== 'sha256:f3143b04c4fb0da1b57bfe97c06c2eb64733e1b98e554d092a43e93a69bbbfd7'
  ) throw new Error('B032r stable9 source round bytes drifted')
  const roundAByGoal = new Map(parseJsonl(roundARecordsPath).map((record) => [String(record.goalId), record]))
  const roundBByGoal = new Map(parseJsonl(roundBRecordsPath).map((record) => [String(record.goalId), record]))
  const sourceGoalBindings: JsonRecord[] = []
  const candidates: Array<{
    goalId: string
    reason: string
    evidenceLevel: 'E1'
    maximumClaimScope: 'G1'
    dissent: string[]
    profile: PositiveGoalEvidenceProfile
  }> = []

  for (const [position, goalId] of goalIds.entries()) {
    const entry = resolutions[position]
    const decision = decisions[position]
    const resolutionPath = `${batchDirectory}/${String(entry.resolutionPath)}`
    const resolutionBytes = readFileSync(absolute(resolutionPath))
    if (sha256(resolutionBytes) !== entry.resolutionDigest) throw new Error(`${goalId}: resolution digest drifted`)
    const resolution = JSON.parse(resolutionBytes.toString('utf8')) as JsonRecord
    const rounds = resolution.rounds as { first: JsonRecord; second: JsonRecord }
    const firstRecord = roundAByGoal.get(goalId)
    const secondRecord = roundBByGoal.get(goalId)
    const spec = profileSpecs.get(goalId)
    const recordPins = decision.records as { first: JsonRecord; second: JsonRecord }
    if (!firstRecord || !secondRecord || !spec || !recordPins) throw new Error(`${goalId}: missing exact source, decision, or profile spec`)
    for (const [round, record, resolutionBinding, decisionBinding] of [
      ['first', firstRecord, rounds.first, recordPins.first],
      ['second', secondRecord, rounds.second, recordPins.second],
    ] as const) {
      const digest = sha256(JSON.stringify(record))
      if (
        record.recordId !== resolutionBinding.recordId
        || digest !== resolutionBinding.recordDigest
        || record.recordId !== decisionBinding.recordId
        || digest !== decisionBinding.recordDigest
        || record.decision !== 'keep'
        || record.evidenceProfileContract !== 'positive-understanding-evidence-v2'
        || record.evidenceProfileRecommendation !== 'create'
        || record.recordStatus !== 'candidate'
        || record.reviewAuthority !== 'ai_candidate'
      ) throw new Error(`${goalId}: ${round} review record is not exactly bound to a KEEP V2 create candidate`)
    }
    const firstEvidence = firstRecord.understandingEvidence as UnderstandingEvidence
    const secondEvidence = secondRecord.understandingEvidence as UnderstandingEvidence
    const profile: PositiveGoalEvidenceProfile = {
      archetype: spec.archetype,
      expectations: [
        {
          id: 'independent-review-a-understanding',
          essentialUnderstandingDe: firstEvidence.essentialUnderstandingDe,
          essentialUnderstandingEn: firstEvidence.essentialUnderstandingEn,
          observablePerformanceDe: firstEvidence.observablePerformanceDe,
          observablePerformanceEn: firstEvidence.observablePerformanceEn,
        },
        {
          id: 'independent-review-b-understanding',
          essentialUnderstandingDe: secondEvidence.essentialUnderstandingDe,
          essentialUnderstandingEn: secondEvidence.essentialUnderstandingEn,
          observablePerformanceDe: secondEvidence.observablePerformanceDe,
          observablePerformanceEn: secondEvidence.observablePerformanceEn,
        },
      ],
      coverageExpectations: {
        requiredExpectationIds: ['independent-review-a-understanding', 'independent-review-b-understanding'],
        alternativeExpectationGroups: [],
        minimumIndependentDemonstrations: 2,
        freshVariationRequired: true,
        independentTransferRequired: true,
      },
      variationAxes: spec.axes,
      applicationCaseBriefs: spec.cases,
    }
    candidates.push({
      goalId,
      reason: `DE: Das Profil bindet die beiden unabhängigen aktuellen KEEP-Records ${String(firstRecord.recordId)} und ${String(secondRecord.recordId)} als verpflichtende Verständnisanforderungen und operationalisiert sie in zwei fachlich konkreten, frisch variierten Transferfällen. EN: The profile binds both independent current KEEP records ${String(firstRecord.recordId)} and ${String(secondRecord.recordId)} as required understanding expectations and operationalizes them in two mathematically concrete, freshly varied transfer cases.`,
      evidenceLevel: 'E1',
      maximumClaimScope: 'G1',
      dissent: [],
      profile,
    })
    sourceGoalBindings.push({
      goalId,
      resolution: { path: resolutionPath, sha256: entry.resolutionDigest },
      selectedSynthesisEvidenceRound: decision.evidenceRound,
      first: { recordId: firstRecord.recordId, recordDigest: rounds.first.recordDigest },
      second: { recordId: secondRecord.recordId, recordDigest: rounds.second.recordDigest },
    })
  }

  const config: PositiveGoalEvidenceReviewConfig = {
    $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',
    schemaVersion: 2,
    reviewId,
    goalFingerprintRuleVersion: 'goal-evidence-v1',
    profileRuleVersion: 'positive-understanding-evidence-v2',
    landscapeId,
    landscapePath: canonicalPath,
    semanticKindLedgerPath,
    reviewCriteriaPath: criteriaPath,
    reviewPath,
    reviewRunManifestPaths: [],
    reviewedResourceTypes: [],
    requireApproved: false,
    scope: {
      label: 'Canonical Mathematics B032r stable-current carryover: exactly nine exact-current KEEP/KEEP goals, with both independent V2 create records bound and disputed split-review goal excluded',
      goalIds: [...goalIds],
    },
  }
  const candidateSet = {
    schemaVersion: 1 as const,
    authoringContract: 'positive-understanding-evidence-candidates-v1' as const,
    reviewId,
    reviewedAt,
    reviewer,
    sourceBindings: {
      bindingContract: 'math-b032r-stable-nine-dual-round-positive-evidence-sources-v1',
      curriculumAtomicDenominator: 794,
      excludedGoalIds: [excludedGoalId],
      resolutionIndex: { path: resolutionIndexPath, sha256: sha256(indexBytes) },
      synthesisManifest: { path: synthesisPath, sha256: sha256(synthesisBytes) },
      rounds: {
        first: { recordsPath: roundARecordsPath, recordsSha256: sha256(roundABytes) },
        second: { recordsPath: roundBRecordsPath, recordsSha256: sha256(roundBBytes) },
      },
      goals: sourceGoalBindings,
    },
    goals: candidates,
  }
  const reviewRecords = await buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet })
  if (writeMode) {
    execFileSync(process.execPath, ['scripts/check_openai_plugin_review_freeze.mjs'], {
      cwd: repositoryRoot,
      stdio: 'inherit',
    })
  }
  writeOrCheck(configPath, jsonBytes(config))
  writeOrCheck(candidatesPath, jsonBytes(candidateSet))
  writeOrCheck(reviewPath, jsonlBytes(reviewRecords))
  const reviewed = reviewPositiveGoalEvidenceConfig(absolute(configPath))
  if (
    reviewed.errors.length > 0
    || reviewed.counts.needsHumanReview !== 9
    || reviewed.counts.approved !== 0
    || reviewed.counts.rejected !== 0
  ) throw new Error(reviewed.errors.join('\n') || 'B032r stable9 evidence counts are invalid')
  console.log(`CHECK math_b032r_stable_nine_positive_evidence ${writeMode ? 'WRITE' : 'PASS'} profiles=9 dualRoundBindings=18 denominator=794`)
  console.log(`CONFIG ${configPath}`)
  console.log(`CANDIDATES ${candidatesPath}`)
  console.log(`REVIEW ${reviewPath}`)
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
