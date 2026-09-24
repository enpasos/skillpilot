import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(packageRoot, '../../../../../..')
const packagePath = 'curricula/DE/Gymnasium/quality/goal-evidence/m7-e6-bisection-current-p-20260924-v1'
const goalId = '3bfc2747-03e2-57db-b13f-01f78835eefd'
const expectedImageUrl = `/assets/goal-visualizations/mathematik/${goalId}/${goalId}.png`
const sourceConfigPath = 'curricula/DE/Gymnasium/quality/goal-evidence/m7-two-local-png-bound-p-20260923-v1/tangent-source-retained16.retained-before-four-comic-png-20260923-v1.config.json'
const sourceReviewPath = 'curricula/DE/Gymnasium/quality/goal-evidence/m7-two-local-png-bound-p-20260923-v1/tangent-source-retained16.retained-before-four-comic-png-20260923-v1.review.jsonl'

const absolute = (path) => resolve(repositoryRoot, path)
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex')
const pins = JSON.parse(readFileSync(resolve(packageRoot, 'source-pins.json'), 'utf8'))
if (pins.schemaVersion !== 1 || pins.sources.length !== 4 || pins.sources[0].path !== sourceConfigPath || pins.sources[1].path !== sourceReviewPath) {
  throw new Error('Unexpected source-pin contract for the 3bfc P-v2 split')
}
for (const pin of pins.sources) {
  const actual = sha256(readFileSync(absolute(pin.path)))
  if (actual !== pin.sha256) throw new Error(`${pin.path}: expected ${pin.sha256}, received ${actual}`)
}

const landscape = JSON.parse(readFileSync(absolute('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'), 'utf8'))
const currentGoal = landscape.goals.find((goal) => goal.id === goalId)
const visualizations = currentGoal?.resourceLinks?.filter((link) => link.type === 'goal-visualization' && link.role === 'primary') ?? []
if (visualizations.length !== 1 || visualizations[0].url !== expectedImageUrl) {
  throw new Error(`${goalId}: current canonical primary image is not the reviewed PNG`)
}

const sourceConfig = JSON.parse(readFileSync(absolute(sourceConfigPath), 'utf8'))
const sourceLines = readFileSync(absolute(sourceReviewPath), 'utf8').trimEnd().split('\n')
const sourceRecords = sourceLines.map((line) => JSON.parse(line))
if (sourceConfig.scope.goalIds.length !== 15 || sourceRecords.length !== 15 ||
  sourceConfig.scope.goalIds.some((id, index) => id !== sourceRecords[index].goalId) ||
  sourceRecords.filter((record) => record.goalId === goalId).length !== 1) {
  throw new Error('Pinned old owner must contain exactly 15 ordered records including 3bfc once')
}
const retainedIds = sourceConfig.scope.goalIds.filter((id) => id !== goalId)
const retainedLines = sourceLines.filter((line, index) => sourceRecords[index].goalId !== goalId)
if (retainedIds.length !== 14 || retainedLines.length !== 14) throw new Error('Expected 14 unchanged retained records')

const retainedConfig = structuredClone(sourceConfig)
retainedConfig.reviewPath = `${packagePath}/retained14.review.jsonl`
retainedConfig.scope = {
  label: '14 unchanged current P-v2 records mechanically retained from the pinned former 15-goal owner; 3bfc moved to a current-PNG-bound one-goal owner',
  goalIds: retainedIds,
}

const oldRecord = sourceRecords.find((record) => record.goalId === goalId)
const profile = structuredClone(oldRecord.profile)
profile.applicationCaseBriefs[0] = {
  id: 'certified-error-table-other-tolerance',
  taskDemandDe: 'Ein Iterationsverfahren liefert zur unbekannten Zielgröße L die Werte z₁=5,05, z₂=5,04, z₃=5,03 und z₄=5,02. Für jedes n≥1 ist unabhängig vom bloßen Zahlenvergleich die Fehlerschranke |zₙ−L|≤Bₙ=0,8·0,4^(n−1) gesichert. Benötigt wird ein absoluter Fehler von höchstens 0,06. Beurteile die Konvergenz, nenne den ersten durch die Schranke sicher ausreichenden Schritt und erkläre, warum schon früher nahe aufeinanderfolgende Ausgaben nicht als Fehlernachweis genügen.',
  taskDemandEn: 'An iterative procedure reports z₁=5.05, z₂=5.04, z₃=5.03 and z₄=5.02 for an unknown target L. For every n≥1, a bound independent of merely comparing displayed values certifies |zₙ−L|≤Bₙ=0.8·0.4^(n−1). The required absolute error is at most 0.06. Assess convergence, identify the first step guaranteed by the bound to suffice, and explain why earlier close successive outputs do not certify the error.',
  expectedPerformanceDe: 'Die für alle n gültige Schranke Bₙ strebt wegen 0<0,4<1 gegen null; deshalb konvergiert zₙ gegen L. B₁=0,8, B₂=0,32 und B₃=0,128 liegen über 0,06; B₄=0,0512≤0,06. Somit ist n=4 der erste durch die Schranke zertifizierte Abbruchschritt. Die Differenz |z₂−z₁|=0,01 allein begrenzt |z₂−L| nicht; aus der Tabelle wird weder L noch eine frühere tatsächliche Fehlerunterschreitung bewiesen.',
  expectedPerformanceEn: 'The bound Bₙ valid for every n tends to zero because 0<0.4<1; therefore zₙ converges to L. B₁=0.8, B₂=0.32 and B₃=0.128 exceed 0.06, while B₄=0.0512≤0.06. Thus n=4 is the first stopping step certified by the bound. The difference |z₂−z₁|=0.01 alone does not bound |z₂−L|; the table proves neither the exact L nor that an earlier actual error failed the tolerance.',
  understandingFocusDe: 'Einen für alle Iterationen gesicherten Fehlergrenzwert von bloßer Dezimalstellen-Stabilität unterscheiden; Konvergenz und den ersten garantierten Abbruch für eine andere Toleranz als im Bild begründen.',
  understandingFocusEn: 'Distinguish a certified all-iteration error bound from merely stable displayed digits, and justify convergence and the first guaranteed stop for a tolerance different from the image.',
}
profile.applicationCaseBriefs[1] = {
  id: 'rounded-fixed-point-two-cycle',
  taskDemandDe: 'Zur Lösung von x=2,4−x startet die Fixpunktiteration xₙ₊₁=2,4−xₙ bei x₀=1,16. Die Anzeige rundet jeden Iterationswert auf eine Nachkommastelle und zeigt immer 1,2. Berechne x₁ bis x₄ ungerundet. Beurteile, ob die gleiche Anzeige Konvergenz und Abbruch rechtfertigt, benenne die Fehlerquelle und schlage eine passende Prüfung vor.',
  taskDemandEn: 'To solve x=2.4−x, the fixed-point iteration xₙ₊₁=2.4−xₙ starts at x₀=1.16. A display rounds every iterate to one decimal place and always shows 1.2. Calculate x₁ through x₄ without rounding. Assess whether the identical display justifies convergence and stopping, name the error source, and propose a suitable check.',
  expectedPerformanceDe: 'Ungerundet gilt x₁=1,24, x₂=1,16, x₃=1,24 und x₄=1,16: eine dauerhafte Zweier-Oszillation statt Konvergenz aus diesem Startwert. Beide Werte werden auf eine Nachkommastelle als 1,2 angezeigt; die Rundung verdeckt die Oszillation. Die Iteration darf so nicht als konvergiert abgebrochen werden. Weitere ungerundete Schritte beziehungsweise die Abbildung x↦2,4−x (Steigung −1, keine Kontraktion) prüfen den Fehler; anschließend ist ein geeignetes anderes Verfahren nötig.',
  expectedPerformanceEn: 'Without rounding, x₁=1.24, x₂=1.16, x₃=1.24 and x₄=1.16: a persistent two-cycle, not convergence from this start. Both values display as 1.2 to one decimal place, so rounding hides the oscillation. The iteration cannot be stopped as converged. Further unrounded iterates or the map x↦2.4−x (slope −1, not a contraction) expose the problem; a suitable different method is then needed.',
  understandingFocusDe: 'Eine scheinbar konstante gerundete Anzeige gegen den tatsächlichen Iterationsverlauf prüfen und Verfahrensversagen nicht mit fehlender Lösung verwechseln.',
  understandingFocusEn: 'Check apparently constant rounded output against the actual iteration history and do not confuse procedure failure with absence of a solution.',
}

const config = JSON.parse(readFileSync(resolve(packageRoot, 'positive-evidence.config.json'), 'utf8'))
if (config.scope.goalIds.length !== 1 || config.scope.goalIds[0] !== goalId || !config.reviewedResourceTypes.includes('goal-visualization')) {
  throw new Error('New owner must review exactly 3bfc with its current image bytes')
}
const candidates = {
  schemaVersion: 1,
  authoringContract: 'positive-understanding-evidence-candidates-v1',
  reviewId: config.reviewId,
  reviewedAt: '2026-09-24T01:25:38Z',
  reviewer: 'OpenAI Codex Math E.6 current-image P-v2 content review; AI candidate only (exact runtime model identifier unavailable)',
  goals: [{
    goalId,
    reason: 'DE: Das tatsächlich geprüfte PNG SHA c31b38c5… zeigt als eine exemplarische Methode die Intervallhalbierung für f(x)=x²−2, [1;2] und Intervallbreite 1/128<0,01; es ist keine Prüfungsantwort. Der erste neue Leistungsfall nutzt stattdessen eine unabhängige für alle n gesicherte Fehlerschranke bei einer anderen Folge und Toleranz 0,06. Der zweite Fall zeigt eine ungerundete Zweier-Oszillation einer anderen Iteration, die durch Dezimalrundung verdeckt wird. So werden Konvergenz, Abbruch und Fehlerquelle in zwei voneinander unabhängigen Demonstrationen geprüft, ohne aus dem Bild oder gleicher Anzeige Verständnis abzuleiten. EN: The actually reviewed PNG shows only bisection of f=x²−2 on [1,2] to width 1/128<0.01; it is not an assessment answer. The new first case instead uses an independently certified all-n error bound for a different sequence and tolerance 0.06. The second case exposes a two-cycle in another iteration hidden by decimal rounding. These independently assess convergence, stopping and error source without treating image copying or equal displayed values as understanding.',
    evidenceLevel: 'E1',
    maximumClaimScope: 'G1',
    dissent: [],
    profile,
  }],
}

const expected = new Map([
  ['retained14.config.json', `${JSON.stringify(retainedConfig, null, 2)}\n`],
  ['retained14.review.jsonl', `${retainedLines.join('\n')}\n`],
  ['positive-evidence.candidates.json', `${JSON.stringify(candidates, null, 2)}\n`],
])
const mode = process.argv[2]
if (mode !== '--write' && mode !== '--check') throw new Error('Use --write or --check')
for (const [name, bytes] of expected) {
  const path = resolve(packageRoot, name)
  if (mode === '--write') writeFileSync(path, bytes)
  else if (readFileSync(path, 'utf8') !== bytes) throw new Error(`${name}: generated bytes differ from pinned sources and reviewed content`)
  console.log(`${mode === '--write' ? 'Wrote' : 'Verified'} ${path}`)
}
