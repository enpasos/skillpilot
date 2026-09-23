import { createHash } from 'node:crypto'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const here = dirname(new URL(import.meta.url).pathname)
const campaign = JSON.parse(readFileSync(resolve(here, 'description-review-campaign.json'), 'utf8'))
const bundle = JSON.parse(readFileSync(resolve(here, 'review-bundle-manifest.json'), 'utf8'))
const batch = campaign.batches[0]
const batchPath = resolve(here, 'batches', `${batch.batchId}.input.jsonl`)
const pages = readFileSync(batchPath, 'utf8').trim().split('\n').map((line) => JSON.parse(line))
const runId = `${campaign.roundId}.batch-001-run-b`
const digest = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`

// Independent first pass from Round B pages only. The six bilingual evidence
// fields are goal-specific candidate content, not profile approval.
const decisions = [
  {
    decision: 'keep',
    rationale: 'The description already states a coherent solvability judgment from side and angle data, distinguishes zero, one and multiple solutions, and requires geometric reasons rather than a copied construction.',
    evidence: [
      'Seiten- und Winkelangaben legen nur dann ein Dreieck fest, wenn geometrische Bedingungen wie Dreiecksungleichung und Winkelsumme erfüllt sind; Kongruenzfälle sichern Eindeutigkeit, während andere Angaben mehrere Lagen zulassen können.',
      'Side and angle data define a triangle only when geometric conditions such as the triangle inequality and angle sum hold; congruence cases ensure uniqueness, while other data can allow more than one configuration.',
      'Die lernende Person ordnet vorgegebene Angaben einem möglichen Konstruktionsfall zu, skizziert oder konstruiert die zulässigen Dreiecke und begründet anhand der Bedingungen, warum es kein, genau ein oder mehrere Lösungen gibt.',
      'The learner identifies the construction case from given data, sketches or constructs the admissible triangles, and uses the conditions to explain why there are zero, exactly one, or multiple solutions.',
      'Nach einem eindeutig bestimmten Dreieck mit zwei Seiten und eingeschlossenem Winkel untersucht die lernende Person unabhängig einen Fall mit zwei Seiten und einem nicht eingeschlossenen Winkel und prüft mögliche Mehrdeutigkeit.',
      'After a uniquely determined triangle from two sides and their included angle, the learner independently examines two sides with a non-included angle and checks for possible ambiguity.',
    ],
  },
  {
    decision: 'split_review',
    rationale: 'Drawing a congruent figure and constructing an enlarged or reduced similar figure require distinct invariants and can be mastered independently. The current goal also appends software use and property justification, so one local wording change cannot resolve the combined competence.',
    evidence: [
      'Kongruenz erhält Form und Größe, während eine maßstäbliche Vergrößerung oder Verkleinerung Winkel erhält und alle Längen mit demselben Faktor ändert; geometrische Eigenschaften müssen zum jeweiligen Verhältnis passen.',
      'Congruence preserves shape and size, whereas a scaled enlargement or reduction preserves angles and changes every length by the same factor; geometric properties must match the respective relation.',
      'Die lernende Person zeichnet aus einer Ausgangsfigur eine kongruente und eine maßstäblich veränderte Figur, prüft gleiche beziehungsweise proportionale Längen und begründet erhaltene Winkel auch bei Nutzung von Geometriesoftware.',
      'The learner draws a congruent and a scaled figure from an original, checks equal or proportional lengths, and justifies preserved angles, including when geometry software is used.',
      'Nach einer Vergrößerung mit vorgegebenem Faktor konstruiert die lernende Person in einer neuen Figur eine Verkleinerung und entscheidet anhand von Winkel- und Längenverhältnissen, welche Aussagen Kongruenz und welche Ähnlichkeit begründen.',
      'After an enlargement with a given factor, the learner constructs a reduction of a fresh figure and decides from angle and length relationships which claims use congruence and which use similarity.',
    ],
  },
  {
    decision: 'revise',
    rationale: 'A line through a vertex is an altitude only if it is perpendicular to the opposite side line, including its extension. The current wording omits that reference line and can mislead on obtuse triangles; the replacement makes the existing definition precise.',
    proposedDescriptionDe: 'Die lernende Person kann zu einem gegebenen Dreieck jede Höhe als Senkrechte durch einen Eckpunkt zur gegenüberliegenden Seitengeraden konstruieren und die Konstruktion anhand dieser Eigenschaft prüfen.',
    proposedDescriptionEn: 'For a given triangle, the learner can construct each altitude as a line through a vertex perpendicular to the line containing the opposite side and check the construction against this property.',
    evidence: [
      'Eine Dreieckshöhe verläuft durch einen Eckpunkt senkrecht zur Geraden der gegenüberliegenden Seite; der Lotfuß kann auf der Seite oder auf ihrer Verlängerung liegen.',
      'A triangle altitude passes through a vertex perpendicular to the line containing the opposite side; its foot can lie on the side or on its extension.',
      'Die lernende Person konstruiert zu jedem Eckpunkt die Senkrechte zur gegenüberliegenden Seitengeraden und prüft Eckpunktlage und rechten Winkel, statt nur eine beliebige Senkrechte durch den Eckpunkt zu zeichnen.',
      'The learner constructs the perpendicular from each vertex to the opposite side line and checks passage through the vertex and the right angle rather than drawing any perpendicular through the vertex.',
      'Nach einem spitzwinkligen Dreieck konstruiert die lernende Person die Höhen eines stumpfwinkligen Dreiecks und erklärt, weshalb einzelne Lotfußpunkte außerhalb der Seitenstrecken liegen.',
      'After an acute triangle, the learner constructs the altitudes of an obtuse triangle and explains why some feet lie outside the side segments.',
    ],
  },
  {
    decision: 'keep',
    rationale: 'The description already links mass, volume, density units and simple contextual problems as one derived-quantity competence at the stated stage.',
    evidence: [
      'Dichte beschreibt Masse je Volumeneinheit, also $\\rho=m/V$; ihre Einheit verbindet eine Masseneinheit mit einer Volumeneinheit und die Größe bleibt bei gleichartigem Material trotz anderer Probenmenge vergleichbar.',
      'Density describes mass per unit volume, $\\rho=m/V$; its unit combines a mass and a volume unit, and the quantity remains comparable for uniform material despite a different sample size.',
      'Die lernende Person ordnet Masse, Volumen und Dichte in einer Sachsituation zu, berechnet eine fehlende Größe mit passenden Einheiten und erklärt, ob das Ergebnis für den beschriebenen Körper plausibel ist.',
      'The learner identifies mass, volume, and density in a context, calculates a missing quantity with suitable units, and explains whether the result is plausible for the described object.',
      'Nach einem Quader mit aus Kantenlängen ermitteltem Volumen bearbeitet die lernende Person einen unregelmäßigen Körper mit anderweitig angegebenem Volumen und nutzt dieselbe Verhältnisidee ohne Verwechslung der Einheiten.',
      'After a cuboid whose volume is found from side lengths, the learner handles an irregular object with volume provided in another way and uses the same ratio without confusing the units.',
    ],
  },
  {
    decision: 'keep',
    rationale: 'The description clearly limits the task to extracting and using measurements while retaining their units and reference quantities across source formats.',
    evidence: [
      'Eine Maßangabe gehört zu einer bestimmten Größe und Bezugsmenge; Tabellenüberschriften, Skizzenbeschriftungen oder Kartenlegenden legen fest, welche Zahl und Einheit mathematisch verwendet werden darf.',
      'A measurement refers to a particular quantity and reference object; table headings, diagram labels, or map legends determine which number and unit can be used mathematically.',
      'Die lernende Person entnimmt einer angegebenen Quelle die benötigten Maße, benennt jeweils Einheit und Bezug und verwendet nur die sachlich passenden Angaben in einer einfachen Rechnung oder Darstellung.',
      'The learner extracts needed measurements from a given source, identifies each unit and referent, and uses only the relevant data in a simple calculation or representation.',
      'Nach einer Tabelle mit expliziten Spaltenüberschriften liest die lernende Person eine neue beschriftete Skizze mit mehreren ähnlichen Maßen und entscheidet, welches Maß zum gefragten Objekt gehört.',
      'After a table with explicit column headings, the learner reads a fresh labelled sketch with several similar measurements and decides which one belongs to the object in question.',
    ],
  },
  {
    decision: 'keep',
    rationale: 'The cautious phrase "where possible" properly limits inference from a graph. A concrete evidence contract can require justified possible degrees or expressions without claiming unique recovery from a finite drawing.',
    evidence: [
      'Endverhalten, sichtbare Nullstellen und Berührungen des Graphen schränken mögliche Grade und Termformen einer ganzrationalen Funktion ein; aus einer endlichen Zeichnung folgt normalerweise kein eindeutig bestimmter Funktionsterm.',
      'End behavior, visible zeros, and tangencies in a graph constrain possible degrees and polynomial expressions; a finite drawing normally does not determine a unique expression.',
      'Die lernende Person begründet aus Graphmerkmalen einen möglichen Grad oder Termansatz, prüft dessen Nullstellen- und Endverhalten am Graphen und benennt, welche zusätzlichen Angaben für Eindeutigkeit nötig wären.',
      'The learner justifies a possible degree or expression from graph features, checks its zeros and end behavior against the graph, and states what additional information would be needed for uniqueness.',
      'Bei einem neuen Graphen, der eine Achse berührt statt sie zu schneiden, passt die lernende Person die vermutete Nullstellenvielfachheit und damit die möglichen Grade oder Termfaktoren an.',
      'For a fresh graph that touches an axis instead of crossing it, the learner adjusts the inferred root multiplicity and hence the possible degrees or expression factors.',
    ],
  },
  {
    decision: 'keep',
    rationale: 'An equation unsolvable over the reals is a precise and age-appropriate anchor for the mathematical need to extend the number system; the description does not import the separate historical goal.',
    evidence: [
      'Ein Quadrat einer reellen Zahl ist nicht negativ, daher ist etwa $x^2+1=0$ in $\\mathbb{R}$ unlösbar; in $\\mathbb{C}$ ermöglicht $i^2=-1$ eine konsistente Lösung dieser algebraischen Frage.',
      'A real square cannot be negative, so $x^2+1=0$ has no solution in $\\mathbb{R}$; in $\\mathbb{C}$ the relation $i^2=-1$ enables a consistent solution to this algebraic question.',
      'Die lernende Person zeigt, warum die Beispielgleichung keine reelle Lösung hat, erläutert die neue Zahl $i$ über ihre definierende Eigenschaft und prüft eine komplexe Lösung durch Einsetzen.',
      'The learner shows why the example equation has no real solution, explains the new number $i$ through its defining property, and verifies a complex solution by substitution.',
      'Bei einer neuen quadratischen Gleichung, die erst nach quadratischer Ergänzung ein negatives Quadrat verlangt, erkennt die lernende Person dieselbe Grenze von $\\mathbb{R}$ und erklärt die Lösung in $\\mathbb{C}$.',
      'For a fresh quadratic equation that requires a negative square only after completing the square, the learner recognizes the same limitation of $\\mathbb{R}$ and explains its solution in $\\mathbb{C}$.',
    ],
  },
  {
    decision: 'keep',
    rationale: 'The description asks for one documented historical development and the specific shift from formal calculation aids to an accepted number system. It is sufficiently bounded; the cited source reference alone is not treated as verification of a particular historical claim.',
    evidence: [
      'Die historische Bedeutung liegt im Wandel des Status komplexer Zahlen: Ein zunächst formales Rechenmittel wurde durch begründete Rechenregeln und mathematische Nutzung als eigenständiger Zahlbereich anerkannt.',
      'The historical significance lies in the changing status of complex numbers: an initially formal calculation aid came to be recognized as a number system through justified operations and mathematical use.',
      'Die lernende Person erläutert an einem vorgelegten fachhistorisch belegten Entwicklungsschritt, welches Problem komplexe Ausdrücke zunächst als Rechenhilfe aufwarf und woran die spätere Anerkennung als Zahlen erkennbar wird.',
      'Using a supplied documented historical development, the learner explains what problem first made complex expressions useful as calculation aids and what shows their later acceptance as numbers.',
      'An einem unabhängig vorgelegten zweiten historischen Bericht vergleicht die lernende Person, ob komplexe Zahlen dort nur formal benutzt oder bereits als Teil eines begründeten Zahlbereichs behandelt werden.',
      'In a second independently presented historical account, the learner compares whether complex numbers are used merely formally or treated as part of a justified number system.',
    ],
  },
]

if (pages.length !== 8 || decisions.length !== 8 || batch.goalIds.length !== 8) {
  throw new Error('Round B authoring count differs from the bound eight-goal batch')
}
const records = pages.map((page, index) => {
  const g = page.goal
  const d = decisions[index]
  const [essentialUnderstandingDe, essentialUnderstandingEn, observablePerformanceDe, observablePerformanceEn, transferExpectationDe, transferExpectationEn] = d.evidence
  const record = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1,
    recordId: `${runId}.goal-${String(index + 1).padStart(3, '0')}`,
    runId,
    campaignId: campaign.campaignId,
    roundId: campaign.roundId,
    bundleFingerprint: campaign.bundleFingerprint,
    bookDigest: campaign.bookDigest,
    goalId: g.goalId,
    goalFingerprint: g.goalFingerprint,
    pageFingerprint: g.pageFingerprint,
    currentTitleDe: g.currentTitleDe,
    currentTitleEn: g.currentTitleEn,
    currentDescriptionDe: g.currentDescriptionDe,
    currentDescriptionEn: g.currentDescriptionEn,
    decision: d.decision,
    ...(d.decision === 'revise' ? { proposedDescriptionDe: d.proposedDescriptionDe, proposedDescriptionEn: d.proposedDescriptionEn } : {}),
    understandingEvidence: { essentialUnderstandingDe, essentialUnderstandingEn, observablePerformanceDe, observablePerformanceEn, transferExpectationDe, transferExpectationEn },
    rationale: d.rationale,
    evidenceProfileContract: 'positive-understanding-evidence-v2',
    evidenceProfileRecommendation: g.reviewContext.evidenceProfile ? 'revise' : 'create',
    recordStatus: 'candidate',
    reviewAuthority: 'ai_candidate',
  }
  if (record.goalId !== batch.goalIds[index]) throw new Error(`Wrong goal order at ${index + 1}`)
  return record
})
const resultsDir = resolve(here, 'results')
mkdirSync(resultsDir, { recursive: true })
const recordsBytes = `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
writeFileSync(resolve(resultsDir, `${batch.batchId}.records.jsonl`), recordsBytes)

const artifactDigest = (role) => bundle.artifacts.find((artifact) => artifact.role === role)?.digest
const now = new Date().toISOString()
const run = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
  schemaVersion: 1,
  runId,
  campaignId: campaign.campaignId,
  roundId: campaign.roundId,
  batchId: batch.batchId,
  batchInputFingerprint: batch.batchInputFingerprint,
  bundleFingerprint: campaign.bundleFingerprint,
  bookDigest: campaign.bookDigest,
  provider: 'openai',
  model: 'gpt-6-astra',
  role: 'subject_reviewer',
  promptFamilyId: 'goal-description-understanding-evidence-review-v2',
  promptFingerprint: campaign.promptFingerprint,
  criteriaFingerprint: campaign.criteriaFingerprint,
  generationParametersFingerprint: digest('interactive-codex-independent-round-b-review'),
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherRuns: true,
  goalIds: batch.goalIds,
  inputArtifacts: [
    { role: 'review_prompt', digest: artifactDigest('review_prompt') },
    { role: 'review_criteria', digest: artifactDigest('review_criteria') },
    { role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint },
  ],
  startedAt: now,
  completedAt: now,
  status: 'completed',
  outputDigest: digest(recordsBytes),
  toolchainVersion: 'goal-description-review-v2',
}
writeFileSync(resolve(resultsDir, `${batch.batchId}.run.json`), `${JSON.stringify(run, null, 2)}\n`)
console.log(JSON.stringify({ count: records.length, decisions: records.reduce((counts, record) => (counts[record.decision] = (counts[record.decision] || 0) + 1, counts), {}), outputDigest: run.outputDigest }))
