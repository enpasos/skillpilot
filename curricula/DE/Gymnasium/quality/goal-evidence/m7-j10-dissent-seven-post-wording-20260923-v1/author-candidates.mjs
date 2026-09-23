// Focused re-authoring of seven current J10 profiles after canonical text changes.
// The old 18-goal candidate is immutable input, not an active approval.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const sourcePath = resolve(here, '../m7-j10-functions-equations-20260923-v1/positive-evidence.candidates.json')
const sourceBytes = readFileSync(sourcePath)
const sourceSha256 = createHash('sha256').update(sourceBytes).digest('hex')
if (sourceSha256 !== 'e3ebe46aa8166380a3c423c507cbe3ab0af55eca9a00f9946bf05aee94300e3c') {
  throw new Error(`Historical source candidate changed: ${sourceSha256}`)
}
const original = JSON.parse(sourceBytes.toString('utf8'))
const ids = [
  '31207307-0cf9-4a56-bf14-90196dc2b3d4',
  'c74d0c7e-44e2-46ab-8f95-b8dc45fcfae7',
  '3c1d6ce7-099e-4267-9ff2-3d1526209a89',
  '3010d965-b9b9-4dc5-9d04-d706725e9a30',
  '1ce8af38-082a-477b-af48-b924c92761bf',
  'ad66009f-55fb-563f-ace0-dbfeae7c76c3',
  'f76d00dc-6b31-59cd-b01a-3610eadc9908',
]
const byId = new Map(original.goals.map(goal => [goal.goalId, goal]))
const goals = ids.map(id => {
  const goal = byId.get(id)
  if (!goal) throw new Error(`Missing historical candidate: ${id}`)
  return structuredClone(goal)
})
const goal = prefix => goals.find(item => item.goalId.startsWith(prefix))
const expectation = (prefix, id) => {
  const result = goal(prefix).profile.expectations.find(item => item.id === id)
  if (!result) throw new Error(`Missing expectation ${prefix}/${id}`)
  return result
}
const caseBrief = (prefix, id) => {
  const result = goal(prefix).profile.applicationCaseBriefs.find(item => item.id === id)
  if (!result) throw new Error(`Missing case ${prefix}/${id}`)
  return result
}

// 31207307: the old cases genuinely test constant factors, representation and
// justified function choice. The new wording clarifies exactly that scope.
goal('31207307').reason = 'DE: Tabelle und Graph zeigen über gleich große Zeitschritte einen konstanten Faktor; zwei unabhängige Fälle begründen Wachstum bzw. Zerfall und die passende Exponentialfunktion. EN: Equal-step tables and graphs expose a constant factor; two independent cases justify growth or decay and a matching exponential function.'

// c74d0c7e: an equation OF an exponential function is not an exponential
// equation to solve. The original cases already reconstruct and interpret
// parameters; correct the misleading candidate rationale.
goal('c74d0c7e').reason = 'DE: Liest bzw. rekonstruiert Parameter einer Funktionsgleichung der Form f(t)=b·a^t aus Termen und Werten und deutet Anfangswert sowie Wachstums- oder Zerfallsfaktor im Kontext; kein Lösen einer Exponentialgleichung. EN: Reads or reconstructs parameters of an exponential function equation f(t)=b·a^t from expressions and values and interprets initial value and growth or decay factor in context; no solving of an exponential equation.'

// 3c1d6ce7: valid-only examples did not independently expose the explicit
// base/argument restrictions now named by the canonical goal. Add a focused
// invalid-input contrast to the non-simple digital transfer case.
const logTransfer = caseBrief('3c1d6ce7', 'digital-approximation-transfer')
logTransfer.taskDemandDe = 'Bestimme log_2(7) mit einem digitalen Werkzeug näherungsweise und prüfe die Größenordnung ohne Werkzeug. Prüfe zusätzlich, ob log_1(7) und log_2(-7) als reelle Logarithmen definiert sind, und begründe.'
logTransfer.taskDemandEn = 'Approximate log_2(7) using a digital tool and check its order of magnitude without a tool. Also decide whether log_1(7) and log_2(-7) are defined as real logarithms, and justify.'
logTransfer.expectedPerformanceDe = 'Da 2^2=4<7<8=2^3, liegt log_2(7) zwischen 2 und 3; digital etwa 2.807, und 2^2.807 ist näherungsweise 7. log_1(7) ist wegen Basis 1 unzulässig; log_2(-7) wegen negativem Argument.'
logTransfer.expectedPerformanceEn = 'As 2^2=4<7<8=2^3, log_2(7) lies between 2 and 3; a tool gives about 2.807, and 2^2.807 is approximately 7. log_1(7) is inadmissible because its base is 1; log_2(-7) because its argument is negative.'
logTransfer.understandingFocusDe = 'Transfer zum Näherungswert mit Plausibilitätsprüfung und eigenständiger Anwendung beider Definitionsbedingungen.'
logTransfer.understandingFocusEn = 'Transfer to an approximate value with a plausibility check and independent application of both domain conditions.'
goal('3c1d6ce7').profile.variationAxes.push({ id: 'domain', textDe: 'zulässige positive Basis ungleich 1 und positives Argument gegenüber unzulässiger Basis oder unzulässigem Argument', textEn: 'valid positive base other than 1 and positive argument versus an invalid base or argument' })
goal('3c1d6ce7').reason = 'DE: Beide Fälle verbinden die Umkehrrelation mit exakten bzw. digitalen Werten; der Transfer prüft zusätzlich beide ausdrücklich genannten Definitionsbedingungen an unzulässigen Beispielen. EN: Both cases link the inverse relation to exact or digital values; the transfer also tests both explicitly named domain conditions on inadmissible examples.'

// 3010d965: the comparison is linear CHANGE, including decrease, not only
// linear growth. Existing equal-step examples and graph contrast remain valid.
const linearComparison = expectation('3010d965', 'difference-versus-ratio')
linearComparison.essentialUnderstandingDe = 'Lineare Änderung hat bei gleichen Schritten eine konstante Differenz, exponentielle Zu- oder Abnahme positiver Werte einen konstanten Faktor; beide können denselben Startwert und ersten Folgewert besitzen.'
linearComparison.essentialUnderstandingEn = 'Linear change has a constant difference over equal steps, while exponential increase or decrease of positive values has a constant factor; both may share an initial and first subsequent value.'
goal('3010d965').reason = 'DE: Die Fälle unterscheiden konstante Differenz und konstanten Faktor bei gleich großen Schritten sowohl für Zunahme als auch Abnahme und begründen den Verlauf. EN: The cases distinguish constant difference from constant factor over equal steps for increase and decrease, and justify the resulting graph.'

// 1ce8af38: both directions of a bounded term/graph assignment are directly
// checked; no complete curve discussion or unique reconstruction is claimed.
goal('1ce8af38').reason = 'DE: Zwei einfache Polynomfälle ordnen Term und Graph in beiden Richtungen anhand von Nullstellen, Endverhalten und weiteren prüfbaren Merkmalen zu; keine vollständige Kurvendiskussion. EN: Two simple polynomial cases match expression and graph in both directions using zeros, end behaviour and further checkable features; no full curve analysis.'

// ad66009f: the old two cases already contrast a real f″ sign change with a
// stationary zero without sign change, matching the corrected criterion.
goal('ad66009f').reason = 'DE: x³ und x⁴ unterscheiden einen beidseitig geprüften Vorzeichenwechsel von f″ mit Wendestelle von einer bloßen Nullstelle ohne Wechsel. EN: x³ and x⁴ distinguish a two-sided sign change of f″ with inflection from a mere zero without sign change.'

// f76d00dc: the corrected goal explicitly claims both derivative-sign
// directions and both failed strict converses. Make each sign visible in the
// direct theorem case and its reflected counterexample in the transfer.
const theorem = expectation('f76d00dc', 'theorem-direction-and-domain')
theorem.observablePerformanceDe = 'Die lernende Person benennt Voraussetzung und Folgerung getrennt, prüft positive und negative Ableitungsvorzeichen auf einem Intervall und begründet daraus strenges Steigen bzw. Fallen.'
theorem.observablePerformanceEn = 'The learner separates premise from conclusion, checks positive and negative derivative signs on an interval, and thereby justifies strict increase or decrease.'
const converse = expectation('f76d00dc', 'strict-converse-fails')
converse.essentialUnderstandingDe = 'Aus strengem Steigen folgt nicht f′>0 an jeder Stelle und aus strengem Fallen nicht f′<0 an jeder Stelle: differenzierbare streng monotone Funktionen können einzelne waagerechte Tangenten haben.'
converse.essentialUnderstandingEn = 'Strict increase does not imply f′>0 everywhere, nor does strict decrease imply f′<0 everywhere: differentiable strictly monotone functions may have isolated horizontal tangents.'
converse.observablePerformanceDe = 'Die lernende Person gibt ein gültiges Gegenbeispiel und zeigt an einer Vorzeichen-Spiegelung, dass beide strengen Umkehrungen an einer Stelle mit f′=0 scheitern.'
converse.observablePerformanceEn = 'The learner gives a valid counterexample and uses its sign-reflected counterpart to show that both strict converses fail at a point with f′=0.'
const theoremCase = caseBrief('f76d00dc', 'apply-theorem-on-interval')
theoremCase.taskDemandDe = 'Für f(x)=x² und h(x)=-x² auf [1,3]: Prüfe mithilfe der Ableitungen strenges Steigen bzw. Fallen. Benenne jeweils Voraussetzung und Schluss.'
theoremCase.taskDemandEn = 'For f(x)=x² and h(x)=-x² on [1,3], use their derivatives to check strict increase and decrease. State premise and conclusion in each case.'
theoremCase.expectedPerformanceDe = 'f und h sind stetig auf [1,3] und differenzierbar im Inneren; f′(x)=2x>0, h′(x)=-2x<0 auf (1,3). Daher steigt f auf [1,3] streng und h fällt streng. Das Ableitungsvorzeichen ist jeweils Voraussetzung, die Monotonie die Folgerung.'
theoremCase.expectedPerformanceEn = 'f and h are continuous on [1,3] and differentiable in its interior; f′(x)=2x>0 and h′(x)=-2x<0 on (1,3). Thus f is strictly increasing and h strictly decreasing on [1,3]. Derivative sign is the premise; monotonicity is the conclusion.'
theoremCase.understandingFocusDe = 'Direkte Anwendung beider Vorzeichenrichtungen mit korrekter Implikation.'
theoremCase.understandingFocusEn = 'Direct application of both sign directions with the correct implication.'
const converseCase = caseBrief('f76d00dc', 'cube-counterexample-transfer')
converseCase.taskDemandDe = 'Jemand behauptet: Jede differenzierbare streng steigende Funktion hat überall positive und jede streng fallende Funktion überall negative Ableitung. Prüfe beide Aussagen an g(x)=x³ und k(x)=-x³ auf R.'
converseCase.taskDemandEn = 'Someone claims that every differentiable strictly increasing function has a positive derivative everywhere and every strictly decreasing function a negative derivative everywhere. Check both claims using g(x)=x³ and k(x)=-x³ on R.'
converseCase.expectedPerformanceDe = 'Für x1<x2 gilt x1³<x2³, also steigt g streng und k=-g fällt streng. Doch g′(x)=3x² und k′(x)=-3x² sind bei x=0 beide 0. Damit scheitern beide behaupteten Umkehrungen.'
converseCase.expectedPerformanceEn = 'For x1<x2, x1³<x2³, so g is strictly increasing and k=-g strictly decreasing. Yet g′(x)=3x² and k′(x)=-3x² are both zero at x=0. Thus both claimed converses fail.'
converseCase.understandingFocusDe = 'Transfer zur Nichtumkehrbarkeit für beide Monotonierichtungen.'
converseCase.understandingFocusEn = 'Transfer to the non-reversibility for both monotonicity directions.'
goal('f76d00dc').profile.variationAxes[1] = { id: 'sign-pattern', textDe: 'durchgehend positives bzw. negatives Vorzeichen gegenüber isolierter Ableitungsnullstelle', textEn: 'positive or negative sign throughout versus an isolated zero derivative' }
goal('f76d00dc').reason = 'DE: Zwei unabhängige Fälle prüfen beide Vorzeichenrichtungen des Monotoniesatzes und widerlegen beide strengen Umkehrungen durch x³ und -x³ mit Ableitungsnullstelle. EN: Two independent cases test both derivative-sign directions and refute both strict converses with x³ and -x³, whose derivatives vanish at one point.'

const candidateSet = {
  schemaVersion: 1,
  authoringContract: 'positive-understanding-evidence-candidates-v1',
  reviewId: 'canonical-math-positive-understanding-evidence-m7-j10-dissent-seven-post-wording-20260923-v1',
  reviewedAt: '2026-09-23T02:29:00.000Z',
  reviewer: 'codex-math-m7-j10-dissent-seven-ai-candidate-2026-09-23',
  goals,
}
writeFileSync(resolve(here, 'positive-evidence.candidates.json'), `${JSON.stringify(candidateSet, null, 2)}\n`)
