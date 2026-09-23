import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const campaign = JSON.parse(await readFile(join(here, 'description-review-campaign.json'), 'utf8'))
const bundle = JSON.parse(await readFile(join(here, '../bundle/manifest.json'), 'utf8'))
const batch = campaign.batches[0]
const batchInputPath = join(here, 'batches', `${batch.batchId}.input.jsonl`)
const batchInput = (await readFile(batchInputPath, 'utf8')).trim().split('\n').map(JSON.parse)
const runId = `${campaign.roundId}.run-001`
const sha256 = (value) => `sha256:${createHash('sha256').update(value).digest('hex')}`
const startedAt = new Date().toISOString()

// These decisions are authored solely from this round's bound pages and criteria.
const findings = [
  {
    decision: 'keep',
    rationale: 'Die Beschreibung benennt Angaben, geometrische Begründung und die drei möglichen Anzahlen von Dreiecken präzise. Die Prüfung von Existenz und Eindeutigkeit ist eine zusammenhängende Kompetenz; die separate Evidenz kann unterschiedliche Angabekonstellationen konkretisieren.',
    understandingEvidence: {
      essentialUnderstandingDe: 'Seiten- und Winkelangaben beschränken eine Dreieckskonstruktion unterschiedlich: geometrische Bedingungen können Angaben unvereinbar machen, Kongruenzbedingungen eine Form festlegen und andere Angaben mehrere Formen zulassen.',
      essentialUnderstandingEn: 'Side and angle data constrain a triangle construction in different ways: geometric conditions can make the data incompatible, congruence conditions can fix one shape, and other data can allow several shapes.',
      observablePerformanceDe: 'Die lernende Person skizziert oder konstruiert zu vorgegebenen Angaben die zulässigen Fälle und begründet mit passenden Seiten-, Winkel- und Kongruenzbeziehungen, warum keine, genau eine oder mehrere Dreiecksformen möglich sind.',
      observablePerformanceEn: 'The learner sketches or constructs the admissible cases for given data and uses appropriate side, angle, and congruence relations to justify why no triangle, exactly one triangle, or several triangle shapes are possible.',
      transferExpectationDe: 'Bei einer unabhängig gestellten Aufgabe mit anderer Art oder Lage der gegebenen Seiten und Winkel, etwa nach einem Wechsel von drei Seiten zu zwei Seiten und einem nicht eingeschlossenen Winkel, beurteilt die lernende Person die Anzahl möglicher Dreiecke erneut und begründet den Unterschied.',
      transferExpectationEn: 'In an independent task with a different type or placement of the given sides and angles, for example changing from three sides to two sides and a non-included angle, the learner reassesses the number of possible triangles and explains the difference.',
    },
  },
  {
    decision: 'split_review',
    rationale: 'Die Formulierung bündelt das Zeichnen kongruenter Figuren, das maßstäbliche Vergrößern oder Verkleinern, den Einsatz von Geometriesoftware und das Begründen geometrischer Eigenschaften. Diese Leistungen können unabhängig voneinander gelingen oder scheitern; eine bloße Umformulierung würde die Atomicity-Frage verdecken. Das fehlende sourceRef belegt keine engere normative Kopplung.',
    understandingEvidence: {
      essentialUnderstandingDe: 'Kongruente Figuren stimmen in Form und Größe überein; bei maßstäblicher Vergrößerung oder Verkleinerung bleiben entsprechende Winkel erhalten und entsprechende Längen ändern sich mit demselben Faktor. Eine Softwarezeichnung muss dieselben Beziehungen erfüllen.',
      essentialUnderstandingEn: 'Congruent figures agree in shape and size; when a figure is enlarged or reduced to scale, corresponding angles stay equal and corresponding lengths change by the same factor. A software drawing must satisfy the same relations.',
      observablePerformanceDe: 'Die lernende Person zeichnet eine kongruente und eine maßstäblich veränderte Figur, nutzt Geometriesoftware für eine passende Konstruktion und prüft an entsprechenden Längen und Winkeln, welche Kongruenz- oder Ähnlichkeitsaussage jeweils begründet ist.',
      observablePerformanceEn: 'The learner draws a congruent figure and a figure changed to scale, uses geometry software for an appropriate construction, and checks corresponding lengths and angles to justify the relevant congruence or similarity claim in each case.',
      transferExpectationDe: 'Bei einer unabhängig vorgelegten Figur mit anderer Form und einem Verkleinerungsfaktor statt einer Vergrößerung konstruiert und überprüft die lernende Person die Entsprechungen erneut; dabei wird sichtbar, welche der Teilkompetenzen tatsächlich übertragen werden.',
      transferExpectationEn: 'For an independently presented figure of a different shape with a reduction factor instead of enlargement, the learner constructs and checks the correspondences again, revealing which of the component competencies actually transfer.',
    },
  },
  {
    decision: 'revise',
    rationale: '„Senkrechten durch die Eckpunkte“ benennt die Gerade nicht, zu der jede Höhe senkrecht stehen muss; durch jeden Eckpunkt lassen sich ohne diese Bezugsgerade viele Senkrechten denken. Die Ergänzung der Gegenseitengeraden präzisiert die vorhandene Konstruktionskompetenz und deckt stumpfwinklige Dreiecke ab.',
    proposedDescriptionDe: 'Die lernende Person kann zu einem gegebenen Dreieck jede Höhe als Senkrechte durch einen Eckpunkt zur Geraden der gegenüberliegenden Seite konstruieren und die Konstruktion anhand dieser Eigenschaft prüfen.',
    proposedDescriptionEn: 'For a given triangle, the learner can construct each altitude as a perpendicular from a vertex to the line containing the opposite side and check the construction against this property.',
    understandingEvidence: {
      essentialUnderstandingDe: 'Eine Dreieckshöhe verläuft durch einen Eckpunkt senkrecht zur Geraden der gegenüberliegenden Seite; der Lotfuß kann bei einem stumpfwinkligen Dreieck auf einer Seitenverlängerung liegen.',
      essentialUnderstandingEn: 'A triangle altitude passes through a vertex perpendicular to the line containing the opposite side; in an obtuse triangle the foot of the perpendicular can lie on an extension of that side.',
      observablePerformanceDe: 'Die lernende Person konstruiert für ein vorgegebenes Dreieck die Höhen, benennt jeweils Eckpunkt und Gegenseitengerade und prüft den rechten Winkel am Lotfuß, gegebenenfalls auf der Verlängerung.',
      observablePerformanceEn: 'The learner constructs the altitudes of a given triangle, identifies the vertex and opposite-side line in each case, and checks the right angle at the perpendicular foot, including on an extension when needed.',
      transferExpectationDe: 'Nach einer unabhängig vorgelegten Änderung von einem spitzwinkligen zu einem stumpfwinkligen Dreieck konstruiert die lernende Person die Höhen weiter korrekt und erklärt, warum einzelne Lotfußpunkte außerhalb der Seitenstrecken liegen.',
      transferExpectationEn: 'When independently given an obtuse triangle instead of an acute one, the learner still constructs the altitudes correctly and explains why some perpendicular feet lie outside the side segments.',
    },
  },
  {
    decision: 'keep',
    rationale: 'Verhältnisdeutung, Einheit und einfache Anwendung bilden hier eine kohärente Kompetenz zur abgeleiteten Größe Dichte. Die Beschreibung ist kurz, bilingual gleichwertig und lässt mehrere sachgerechte Lösungswege zu.',
    understandingEvidence: {
      essentialUnderstandingDe: 'Dichte beschreibt Masse je Volumeneinheit; für gleichartige Stoffe hängen Masse und Volumen proportional zusammen. Die Einheit ist eine Masseneinheit geteilt durch eine Volumeneinheit und gehört zur Deutung des Zahlenwerts.',
      essentialUnderstandingEn: 'Density describes mass per unit of volume; for a uniform material, mass and volume are proportional. Its unit is a mass unit divided by a volume unit and is part of interpreting the numerical value.',
      observablePerformanceDe: 'Die lernende Person bestimmt in einer einfachen Sachsituation aus Masse und Volumen die Dichte, führt die Einheiten passend und erklärt, was das Ergebnis für eine Volumeneinheit des betrachteten Materials bedeutet.',
      observablePerformanceEn: 'In a simple context, the learner determines density from mass and volume, handles the units appropriately, and explains what the result means for one unit of volume of the material.',
      transferExpectationDe: 'In einer unabhängig vorgelegten Situation mit vorgegebener Dichte und gesuchter Masse für ein bestimmtes Volumen verwendet die lernende Person dieselbe Verhältnisbeziehung in umgekehrter Richtung und deutet das Ergebnis mit Einheit.',
      transferExpectationEn: 'In an independent situation giving density and asking for the mass of a specified volume, the learner uses the same ratio relation in the reverse direction and interprets the result with its unit.',
    },
  },
  {
    decision: 'keep',
    rationale: 'Entnehmen, Einheit und Bezugsgröße bestimmen und mathematisch verwenden sind eine zusammenhängende Quellenlesekompetenz. Die Beschreibung ist konkret genug, ohne ein bestimmtes Quellenformat oder Verfahren vorzuschreiben.',
    understandingEvidence: {
      essentialUnderstandingDe: 'Eine Maßangabe aus Quellenmaterial ist nur zusammen mit der gemessenen Größe, ihrer Einheit und ihrem Bezug, etwa einer Legende oder einem Maßstab, mathematisch eindeutig nutzbar.',
      essentialUnderstandingEn: 'A measurement from source material can be used unambiguously in mathematics only together with the quantity measured, its unit, and its reference, such as a legend or scale.',
      observablePerformanceDe: 'Die lernende Person liest aus einer Tabelle, Skizze oder Karte eine benötigte Maßangabe ab, ordnet sie der richtigen Größe und Einheit zu, klärt den angegebenen Bezug und verwendet sie nachvollziehbar in einer passenden Rechnung.',
      observablePerformanceEn: 'The learner reads a needed measurement from a table, diagram, or map, matches it to the correct quantity and unit, establishes its stated reference, and uses it transparently in a suitable calculation.',
      transferExpectationDe: 'Bei unabhängig bereitgestellten Daten in einem anderen Quellenformat, etwa einer Karte statt einer Tabelle, identifiziert die lernende Person die relevante Maßangabe trotz veränderter Darstellung und prüft Einheit und Bezug vor der Rechnung erneut.',
      transferExpectationEn: 'With independently supplied data in another source format, such as a map instead of a table, the learner identifies the relevant measurement despite the changed presentation and checks its unit and reference before calculating.',
    },
  },
  {
    decision: 'keep',
    rationale: 'Das vorsichtige „soweit möglich“ hält die mathematische Aussage offen für nicht eindeutige Grapheninformationen. Grad und möglicher Term sind verwandte Rückschlüsse aus demselben Graphen; die Evidenz muss zwischen zwingenden Folgerungen und passenden, aber nicht eindeutig bestimmten Termen unterscheiden.',
    understandingEvidence: {
      essentialUnderstandingDe: 'Nullstellen, Richtungswechsel und der erkennbare Verlauf eines Polynomgraphen schränken mögliche Grade und Terme ein; ein gezeichneter Ausschnitt legt den exakten Grad oder einen einzigen Funktionsterm im Allgemeinen nicht fest.',
      essentialUnderstandingEn: 'Zeros, changes of direction, and the visible course of a polynomial graph constrain possible degrees and expressions; a drawn portion generally does not determine the exact degree or a unique expression.',
      observablePerformanceDe: 'Die lernende Person benennt am vorgelegten Graphen erkennbare Eigenschaften, leitet daraus begründete Einschränkungen für Grad oder Term ab, gibt gegebenenfalls einen passenden Term an und erklärt, welche Schlüsse der Graph nicht eindeutig trägt.',
      observablePerformanceEn: 'The learner identifies visible features of a given graph, derives justified constraints on its degree or expression, offers a fitting expression where appropriate, and explains which conclusions the graph does not uniquely support.',
      transferExpectationDe: 'Bei einem unabhängig vorgelegten Graphen, dessen Nullstelle den Verlauf berührt statt ihn zu schneiden, überprüft die lernende Person ihre bisherigen Rückschlussregeln und passt mögliche Grade oder Terme an, ohne Eindeutigkeit zu behaupten.',
      transferExpectationEn: 'For an independently presented graph that touches the axis at a zero instead of crossing it, the learner rechecks the inference rules and adjusts possible degrees or expressions without claiming uniqueness.',
    },
  },
  {
    decision: 'keep',
    rationale: 'Die Formulierung bindet die Zahlbereichserweiterung an ein konkretes in den reellen Zahlen unlösbares Gleichungsproblem und fordert eine mathematische Erklärung. Sie bleibt kurz und führt keine fachhistorische Teilkompetenz aus dem Nachbarziel ein.',
    understandingEvidence: {
      essentialUnderstandingDe: 'Das Quadrat einer reellen Zahl ist nicht negativ; deshalb hat etwa x² + 1 = 0 keine reelle Lösung. In den komplexen Zahlen erlaubt eine Zahl i mit i² = −1 Lösungen, sodass die Erweiterung genau diese algebraische Lücke schließt.',
      essentialUnderstandingEn: 'The square of a real number is nonnegative, so an equation such as x² + 1 = 0 has no real solution. In the complex numbers, a number i with i² = −1 provides solutions, so the extension closes this algebraic gap.',
      observablePerformanceDe: 'Die lernende Person begründet für eine vorgelegte Gleichung, warum es keine reelle Lösung gibt, zeigt eine komplexe Lösung und erklärt, welche zusätzliche Zahleneigenschaft die Lösung ermöglicht.',
      observablePerformanceEn: 'For a given equation, the learner explains why there is no real solution, exhibits a complex solution, and explains which additional number property makes that solution possible.',
      transferExpectationDe: 'Bei der unabhängig vorgelegten Gleichung x² + 2x + 2 = 0 formt die lernende Person zu (x + 1)² + 1 = 0 um und erklärt an dieser verschobenen Struktur erneut, warum komplexe Zahlen Lösungen ermöglichen, reelle Zahlen aber nicht.',
      transferExpectationEn: 'For the independently presented equation x² + 2x + 2 = 0, the learner rewrites it as (x + 1)² + 1 = 0 and explains from this shifted structure why complex numbers provide solutions whereas real numbers do not.',
    },
  },
  {
    decision: 'keep',
    rationale: 'Die Beschreibung verlangt ausdrücklich einen belegten fachhistorischen Schritt und eine Erklärung der veränderten Stellung komplexer Zahlen; sie erhebt keine unbelegte Datierungs- oder Erstentdeckerbehauptung. Die separate Evidenz sollte Quelle, damalige Funktion und Beitrag zur späteren Anerkennung unterscheidbar machen.',
    understandingEvidence: {
      essentialUnderstandingDe: 'Die formale Verwendung von Wurzeln negativer Zahlen in Rechnungen und die Anerkennung komplexer Zahlen als eigenständiger Zahlbereich sind historisch unterschiedliche Stufen; ein belegter Entwicklungsschritt zeigt, welche Regeln oder Deutungen diese Anerkennung stützten.',
      essentialUnderstandingEn: 'Using square roots of negative numbers formally in calculations and accepting complex numbers as a number system are historically distinct stages; a documented development shows which rules or interpretations supported that acceptance.',
      observablePerformanceDe: 'Die lernende Person erläutert an einem bereitgestellten fachhistorischen Beleg, welche Rolle komplexe Zahlen im beschriebenen Schritt spielten und wie dieser Schritt über bloße formale Rechenhilfe hinaus zur begründeten Verwendung als Zahlen beitrug.',
      observablePerformanceEn: 'Using a supplied historical source, the learner explains the role complex numbers played in the documented development and how that step contributed beyond a mere formal calculation aid toward their justified use as numbers.',
      transferExpectationDe: 'An einem unabhängig bereitgestellten anderen belegten Entwicklungsschritt ordnet die lernende Person erneut ein, ob dort vor allem symbolisch gerechnet, eine konsistente Rechenregel gesichert oder eine Deutung als Zahlbereich gestützt wird, und begründet die Einordnung am Beleg.',
      transferExpectationEn: 'For another independently supplied and documented development, the learner again classifies whether it mainly used symbols formally, secured consistent calculation rules, or supported an interpretation as a number system, and justifies the classification from the source.',
    },
  },
]

if (findings.length !== batch.goalIds.length) throw new Error('Finding count does not match batch')
const records = batchInput.map(({ goal }, index) => {
  if (goal.goalId !== batch.goalIds[index]) throw new Error(`Unexpected input order at ${index + 1}`)
  const finding = findings[index]
  return {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1,
    recordId: `${campaign.roundId}.record-${String(index + 1).padStart(3, '0')}`,
    runId,
    campaignId: campaign.campaignId,
    roundId: campaign.roundId,
    bundleFingerprint: campaign.bundleFingerprint,
    bookDigest: campaign.bookDigest,
    goalId: goal.goalId,
    goalFingerprint: goal.goalFingerprint,
    pageFingerprint: goal.pageFingerprint,
    currentTitleDe: goal.currentTitleDe,
    currentTitleEn: goal.currentTitleEn,
    currentDescriptionDe: goal.currentDescriptionDe,
    currentDescriptionEn: goal.currentDescriptionEn,
    decision: finding.decision,
    ...(finding.decision === 'revise' ? {
      proposedDescriptionDe: finding.proposedDescriptionDe,
      proposedDescriptionEn: finding.proposedDescriptionEn,
    } : {}),
    understandingEvidence: finding.understandingEvidence,
    rationale: finding.rationale,
    evidenceProfileContract: 'positive-understanding-evidence-v2',
    evidenceProfileRecommendation: goal.reviewContext.evidenceProfile === null ? 'create' : 'revise',
    recordStatus: 'candidate',
    reviewAuthority: 'ai_candidate',
  }
})

const recordsBytes = `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
const resultDirectory = join(here, 'results')
await mkdir(resultDirectory, { recursive: true })
await writeFile(join(resultDirectory, `${batch.batchId}.records.jsonl`), recordsBytes)
const artifactByRole = new Map(bundle.artifacts.map(({ role, digest }) => [role, digest]))
const inputArtifacts = [
  'book_model',
  'review_input_json',
  'review_prompt',
  'review_criteria',
].map((role) => ({ role, digest: artifactByRole.get(role) }))
inputArtifacts.push({ role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint })
if (inputArtifacts.some(({ digest }) => !digest)) throw new Error('Missing bundle artifact digest')
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
  provider: 'OpenAI',
  model: 'GPT-6',
  role: 'subject_reviewer',
  promptFamilyId: 'goal-description-understanding-evidence-review-v2',
  promptFingerprint: campaign.promptFingerprint,
  criteriaFingerprint: campaign.criteriaFingerprint,
  generationParametersFingerprint: sha256(JSON.stringify({ mode: 'independent-agent-review', samplingParameters: 'not exposed' })),
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherRuns: true,
  goalIds: batch.goalIds,
  inputArtifacts,
  startedAt,
  completedAt: new Date().toISOString(),
  status: 'completed',
  outputDigest: sha256(recordsBytes),
  toolchainVersion: 'skillpilot-goal-description-review-v2',
}
await writeFile(join(resultDirectory, `${batch.batchId}.run.json`), `${JSON.stringify(run, null, 2)}\n`)
console.log(`Authored ${records.length} round-A candidate records`)
