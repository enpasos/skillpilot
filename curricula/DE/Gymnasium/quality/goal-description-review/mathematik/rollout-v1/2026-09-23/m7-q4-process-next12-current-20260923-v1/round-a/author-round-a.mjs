import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '../../../../../../../../../../../..')
const here = resolve(import.meta.dirname)
const prefix = 'mathematik-m7-q4-process-next12-current-20260923-v1-first-pass-a.batch-001'
const sha = (value) => `sha256:${createHash('sha256').update(value).digest('hex')}`
const read = async (path) => JSON.parse(await readFile(path, 'utf8'))

// Independent blind first-pass judgments. Each six-field chain is authored for
// its exact goal, not generated from a title or from another review round.
const judgments = [
  {
    id: '08259bad-eb0c-5bd3-b2a1-b6673f796605',
    decision: 'keep',
    de: [
      'Ein Rechen- oder Umformungsverfahren ist nur unter seinen Voraussetzungen gültig; Definitionslücken und Vorzeichenbedingungen bestimmen, welche Fälle erlaubt sind und wie die Lösungsmenge erhalten bleibt.',
      'Die lernende Person benennt bei einem Term mit Nenner und bei einer vorzeichenabhängigen Umformung die jeweiligen Bedingungen, behandelt die zulässigen Fälle getrennt und begründet ausgeschlossene oder zusätzlich zu prüfende Werte.',
      'Bei einer neuen Ungleichung mit unbekanntem Vorzeichen des zu multiplizierenden Terms entscheidet sie selbst, wann Fallunterscheidung und Richtungswechsel erforderlich sind, statt das Schema einer rationalen Gleichung zu kopieren.'
    ],
    en: [
      'A computational or transformation procedure is valid only under its conditions; domain exclusions and sign conditions determine which cases are allowed and how the solution set is preserved.',
      'For an expression with a denominator and a sign-dependent transformation, the learner states the relevant conditions, handles the admissible cases separately, and justifies excluded or additionally checked values.',
      'For a new inequality involving multiplication by an expression of unknown sign, the learner decides independently when case separation and a reversal of the inequality are required instead of copying a rational-equation template.'
    ],
    rationale: 'Die bestehende Beschreibung nennt die Gültigkeitsprüfung und den Umgang mit den betroffenen Fällen ausdrücklich. Die Evidenz konkretisiert Bedingungen und Fallunterscheidung, ohne ein bestimmtes Verfahren zum alleinigen Lernziel zu machen.'
  },
  {
    id: '08a4ae81-b732-50c6-8a3f-c19b6bbd4c2b',
    decision: 'keep',
    de: [
      'Eine äquivalente Umformung bewahrt die Lösungsmenge in beiden Richtungen; eine bloße Folgerung kann zusätzliche Kandidaten erzeugen und verlangt eine Prüfung an der Ausgangsaussage.',
      'Die lernende Person markiert an einer mehrschrittigen Gleichung die Umformungen als Äquivalenz oder einseitige Folgerung, begründet die Richtung und bestimmt die Lösungsmenge durch Prüfung möglicher Scheinlösungen.',
      'Bei einer neuen Aufgabe mit Quadrieren statt Nennerbeseitigung erkennt sie erneut den nur einseitigen Schritt und prüft die gefundenen Kandidaten an der ursprünglichen Gleichung.'
    ],
    en: [
      'An equivalent transformation preserves the solution set in both directions; a one-way implication can introduce extra candidates and requires checking against the original statement.',
      'In a multistep equation, the learner labels transformations as equivalences or one-way implications, justifies their direction, and determines the solution set by testing possible extraneous solutions.',
      'In a new task involving squaring instead of clearing a denominator, the learner again recognizes the one-way step and checks the resulting candidates in the original equation.'
    ],
    rationale: 'Der aktuelle Wortlaut trennt Äquivalenz und bloße Folgerung fachlich richtig und verknüpft sie mit der Lösungsmenge. Das konkrete Prüfen von Scheinlösungen gehört in das Evidenzprofil, nicht in einen längeren Beschreibungstext.'
  },
  {
    id: '14af09c2-999f-52fa-8d42-1f2f6b23629b',
    decision: 'keep',
    de: [
      'Die mathematische Frage bestimmt Werkzeug, Funktion und Eingabe: Ein CAS-Befehl oder eine Tabellenformel muss die gemeinte Größe, den zulässigen Bereich und die gewünschte Operation passend abbilden.',
      'Die lernende Person wählt für eine konkrete Frage CAS oder Tabellenkalkulation, formuliert einen mathematisch passenden Befehl beziehungsweise Zellbezug und erklärt, warum die gewählte Funktion die verlangte Operation ausführt.',
      'Wenn dieselbe Fragestellung statt als Funktionsterm als Wertetabelle vorliegt, passt sie Werkzeugwahl und Eingabestruktur selbst an, ohne eine vorherige Befehlskette blind zu übernehmen.'
    ],
    en: [
      'The mathematical question determines the tool, function, and input: a CAS command or spreadsheet formula must represent the intended quantity, admissible domain, and requested operation appropriately.',
      'For a concrete question, the learner chooses a CAS or spreadsheet, formulates a mathematically suitable command or cell reference, and explains why the chosen function carries out the requested operation.',
      'When the same kind of question is given as a table of values instead of a function term, the learner adapts the tool choice and input structure independently rather than blindly reusing a previous command sequence.'
    ],
    rationale: 'Eingabe, Funktionswahl und zielgerichteter Werkzeugeinsatz bilden hier eine gemeinsame Kompetenz. Die kritische Bewertung der Ausgabe ist als nachfolgendes Lernziel getrennt und wird nicht in diese Beschreibung hineingezogen.'
  },
  {
    id: '1675fdde-cba7-5456-ae70-a846e1924a68',
    decision: 'keep',
    de: [
      'Die Anzahl der Schnittpunkte ergibt sich aus der relativen Lage eines gegebenen Graphen und einer Geraden; eine Berührung zählt als ein Schnittpunkt, auch wenn sich die Graphen dort nicht kreuzen.',
      'Die lernende Person liest an einem vorgegebenen Graphen Abschnitte ober- und unterhalb einer Geraden sowie Berührstellen ab und begründet anschaulich, weshalb genau null, ein oder mehrere Schnittpunkte vorliegen.',
      'Bei einem anders gekrümmten Graphen mit mehreren Extremstellen begründet sie die Schnittpunktanzahl für eine verschobene Gerade und unterscheidet Berührung von Durchgang, ohne eine Parabelregel zu verallgemeinern.'
    ],
    en: [
      'The number of intersections follows from the relative position of a given graph and a line; a point of tangency counts as one intersection even if the curves do not cross there.',
      'On a given graph, the learner identifies regions above and below a line and points of tangency, then visually justifies why there are exactly zero, one, or several intersections.',
      'For a differently shaped graph with several extrema, the learner justifies the intersection count for a shifted line and distinguishes touching from crossing without generalizing a parabola-specific rule.'
    ],
    rationale: 'Die Beschreibung begrenzt den Anspruch klar auf anschauliches Begründen anhand eines vorgegebenen Graphen. Das Profil fordert keine zusätzliche algebraische Schnittpunktberechnung oder eine allgemeine Kurvenklassifikation.'
  },
  {
    id: '499b8a0d-a5da-5cf7-8557-89e16152b752',
    decision: 'keep',
    de: [
      'Ein einzelnes passendes Beispiel beweist keine allgemeine Vermutung; ein gültiges Gegenbeispiel widerlegt sie. Die Stärke einer Lösung oder Argumentationskette hängt davon ab, ob jeder Schluss aus Voraussetzungen und vorherigen Schritten folgt.',
      'Die lernende Person prüft eine vorgelegte mathematische Behauptung und ihren Begründungsweg, benennt eine tragfähige oder fehlerhafte Schlussstelle, konstruiert gegebenenfalls ein Gegenbeispiel und formuliert ein darauf gestütztes Urteil.',
      'Bei einer Behauptung aus einem anderen mathematischen Bereich prüft sie erneut Geltungsbereich und Schlusslogik und entscheidet, ob Beleg, Gegenbeispiel oder weitere Begründung nötig ist.'
    ],
    en: [
      'One matching example does not prove a general conjecture; a valid counterexample refutes it. The strength of a solution or chain of reasoning depends on whether each conclusion follows from the assumptions and preceding steps.',
      'The learner examines a supplied mathematical claim and its reasoning, identifies a valid or faulty inference, constructs a counterexample where appropriate, and states a judgment supported by that analysis.',
      'For a claim from another mathematical area, the learner again checks its domain of validity and inference structure and decides whether an example, counterexample, or further justification is needed.'
    ],
    rationale: 'Lösungen, Argumentationsketten und Vermutungen sind hier Varianten desselben kritischen Beurteilens, nicht drei unverbundene Routineziele. Der Wortlaut ist bereits verständlich und fachlich offen genug.'
  },
  {
    id: '4a53a441-3c2a-53aa-8a1a-e08a6898e826',
    decision: 'keep',
    de: [
      'Mathematische Begriffe bezeichnen verschiedene Objekte: Eine Funktion ist eine Zuordnung, eine Nullstelle ein Argument mit Funktionswert null und eine Ableitung beschreibt lokale Änderung; präzise Sprache verhindert Objektverwechslungen.',
      'Die lernende Person erläutert in einer eigenen Lösung, ob sie eine Funktion, einen Funktionswert, eine Nullstelle oder einen Punkt meint, und korrigiert eine vorgegebene ungenaue Verwendung von Ableitung oder Nullstelle.',
      'In einer neuen Darstellung als Graph statt Term verwendet sie dieselben Begriffe für die passenden Objekte und erläutert, warum etwa der Achsenschnittpunkt nicht selbst die Nullstelle als x-Wert ist.'
    ],
    en: [
      'Mathematical terms denote different objects: a function is a mapping, a zero is an input whose function value is zero, and a derivative describes local change; precise language prevents confusing these objects.',
      'In an original solution, the learner explains whether they mean a function, function value, zero, or point and corrects an imprecise supplied use of derivative or zero.',
      'In a new graph representation instead of a formula, the learner applies the same terms to the appropriate objects and explains, for example, why an x-intercept point is not itself the zero as an x-value.'
    ],
    rationale: 'Die vorhandene Beschreibung fordert genau die terminologische Präzision, die dieses Prozessziel meint. Beispiele und die konkret beobachtbaren Objektunterscheidungen werden im Profil ausgeführt; Notationskompetenz bleibt ein eigenes Nachbarziel.'
  },
  {
    id: '5d9c156b-e5a4-5e91-9da3-22e858eb1f8e',
    decision: 'keep',
    de: [
      'Ein Teilungsverhältnis vergleicht Teilstrecken derselben Strecke; seine Bedeutung hängt von der Lage des Teilpunkts und einer konsistenten Zuordnung der Strecken ab, nicht von der räumlichen Ausrichtung der Zeichnung.',
      'Die lernende Person bestimmt in einer räumlichen Figur die beiden Teilstrecken, gibt ihr Verhältnis in klarer Reihenfolge an, vergleicht es mit einem zweiten Teilpunkt und begründet die Relation geometrisch oder rechnerisch.',
      'Nach einer geänderten Lage der Punkte oder einer anderen räumlichen Ansicht erkennt sie die zu vergleichenden Strecken erneut und begründet, ob das Verhältnis gleich bleibt oder sich ändert.'
    ],
    en: [
      'A division ratio compares subsegments of the same segment; its meaning depends on the position of the dividing point and a consistent assignment of lengths, not on the spatial orientation of the drawing.',
      'In a spatial figure, the learner identifies the two subsegments, states their ratio in an unambiguous order, compares it with a second dividing point, and justifies the relationship geometrically or computationally.',
      'After a change in the positions of the points or a different spatial view, the learner identifies the segments to compare again and justifies whether the ratio is preserved or changes.'
    ],
    rationale: 'Bestimmen, Vergleichen und Begründen beziehen sich auf ein einziges mathematisches Objekt, das Teilungsverhältnis. Die Beschreibung ist deshalb kohärent; die fehlende Visualisierung ist eine eigene V-Frage und kein Anlass, den Text künstlich umzuschreiben.'
  },
  {
    id: 'bab64124-fabf-544c-a2e5-3e6c786531d2',
    decision: 'keep',
    de: [
      'Ein mathematisches Argument ist in einer Diskussion nur tragfähig, wenn Behauptung, Begründung und Geltungsbereich erkennbar sind; Rückmeldungen prüfen den sachlichen Schluss statt die Person.',
      'Die lernende Person stellt zu einer gemeinsamen Behauptung eine begründete eigene Aussage vor, prüft ein abweichendes Argument auf einen konkreten Schlussfehler oder eine gültige Begründung und formuliert eine fachlich begründete Rückmeldung.',
      'In einer neuen Diskussion über eine andere Aussage reagiert sie auf ein zunächst plausibles Beispielargument, indem sie dessen begrenzte Beweiskraft erklärt und eine sachliche Rückfrage oder Korrektur anbietet.'
    ],
    en: [
      'A mathematical argument is useful in discussion only when its claim, justification, and scope are clear; feedback evaluates the reasoning rather than the person.',
      'For a shared claim, the learner contributes a justified statement, checks a differing argument for a specific invalid inference or valid reason, and gives mathematically grounded feedback.',
      'In a new discussion of a different claim, the learner responds to an initially plausible example-based argument by explaining its limited evidential force and offering a substantive question or correction.'
    ],
    rationale: 'Der aktuelle Wortlaut beschreibt einen zusammenhängenden mathematischen Diskussionsbeitrag. Er verlangt weder soziale Bewertung noch eine pauschale Beweisfähigkeit; die fachliche Qualität der Rückmeldung wird im Profil konkretisiert.'
  },
  {
    id: 'c8698478-4662-5b52-a3e5-7994604ff0de',
    decision: 'keep',
    de: [
      'Verschiedene Darstellungen oder Verfahren können dieselbe Aufgabe lösen, aber sich hinsichtlich Genauigkeit, Anschaulichkeit und Aufwand unterscheiden; ein sinnvoller Alternativweg hängt vom Zweck der Lösung ab.',
      'Die lernende Person skizziert zu einer vorliegenden Lösungsstrategie eine mathematisch passende Alternative, etwa grafisch statt rechnerisch, und vergleicht beide anhand eines zum Problem passenden Vor- und Nachteils.',
      'Bei einer neuen Aufgabe mit schwer ablesbarem Schnittpunkt wählt sie eine andere Alternative als im gut lesbaren Graphen und begründet den veränderten Nutzen von genauer Rechnung und anschaulicher Skizze.'
    ],
    en: [
      'Different representations or methods can solve the same problem but differ in precision, visual clarity, and effort; a useful alternative depends on the purpose of the solution.',
      'Given one solution strategy, the learner sketches a mathematically suitable alternative, such as a graphical rather than algebraic approach, and compares the two using a problem-relevant advantage and disadvantage.',
      'For a new task with an intersection that is hard to read from a graph, the learner selects a different alternative from the one used for an easily read graph and justifies the changed value of exact calculation and visual estimation.'
    ],
    rationale: 'Skizzieren und kurz Vergleichen bilden hier eine zusammenhängende strategische Reflexion. Der vorhandene Text benennt beide Leistungen knapp; die aufwendigere Kriterienabwägung liegt im gesonderten LK-Nachfolger.'
  },
  {
    id: 'e75ec65a-9692-5871-b90b-fbebe38ae0c3',
    decision: 'keep',
    de: [
      'Die Lage von Gerade und Ebene wird durch Richtungsvektor, Normalenvektor und eine Punktprobe unterschieden: Senkrechtstellung der beiden Vektoren zeigt Parallelität der Richtungen, aber erst die Punktprobe trennt echte Parallelität vom Liegen in der Ebene.',
      'Die lernende Person berechnet zu einer Gerade und Ebene die relevante Vektorbeziehung, prüft einen Geradenpunkt in der Ebenengleichung und begründet daraus rechnerisch und geometrisch, ob die Gerade in der Ebene liegt, echt parallel ist oder sie schneidet.',
      'Für eine Ebene in anderer Darstellungsform oder einen geänderten Stützpunkt passt sie ihre Prüfung an und erklärt, warum derselbe Richtungsvektor trotz gleicher Vektorbeziehung eine andere Lage zur Ebene haben kann.'
    ],
    en: [
      'The position of a line relative to a plane is distinguished using its direction vector, the plane normal, and a point test: perpendicularity of those vectors shows a parallel direction, but only the point test separates a line lying in the plane from a distinct parallel line.',
      'For a line and plane, the learner computes the relevant vector relation, tests a point on the line in the plane equation, and uses both calculations and geometry to justify whether the line lies in the plane, is distinct and parallel, or intersects it.',
      'For a plane in another representation or a changed support point, the learner adapts the test and explains why the same direction vector can have a different positional relationship to the plane.'
    ],
    rationale: 'Untersuchen, Begründen und Deuten sind hier eine integrierte Vektor-Geometrie-Kette; die Beschreibung ist korrekt und knapp. Das Profil macht besonders die nötige Punktprobe gegen die häufige Verwechslung von parallel und enthalten explizit.'
  },
  {
    id: 'fcb4cef1-b17a-5682-924c-41498fc6c9b2',
    decision: 'keep',
    de: [
      'Eine mathematische Aussage macht Voraussetzungen und Schlussrichtung erkennbar; Symbole und Variablen müssen innerhalb dieser Aussage dieselbe Bedeutung behalten.',
      'Die lernende Person formuliert eine kurze gegebene mathematische Beziehung als Wenn-dann-Aussage mit erklärten Variablen, nennt die Bedingungen vor der Folgerung und verwendet die Notation über mehrere Zeilen hinweg konsistent.',
      'Bei einer neuen Aussage mit verändertem Definitionsbereich formuliert sie die nötigen Bedingungen neu und vermeidet es, aus der ursprünglichen Schlussrichtung unbemerkt eine Äquivalenz zu machen.'
    ],
    en: [
      'A mathematical statement makes its assumptions and direction of inference clear; symbols and variables must retain the same meaning throughout the statement.',
      'The learner formulates a short given mathematical relationship as an if-then statement with defined variables, states the conditions before the conclusion, and uses notation consistently across several lines.',
      'For a new statement with a changed domain, the learner restates the necessary conditions and avoids silently turning the original direction of inference into an equivalence.'
    ],
    rationale: 'Bedingung, Schlussfolgerung und konsistente Notation sind eine kohärente Formulierungskompetenz auf dem angegebenen Niveau. Der aktuelle Text ist verständlich; eine ausführliche Beweisführung wäre ein anderes Ziel.'
  },
  {
    id: 'fde351a8-98b1-5d75-b4df-813beb2bbe3c',
    decision: 'keep',
    de: [
      'Gleichungen, Ungleichungen und Funktionen bilden unterschiedliche Beziehungen zwischen sinnvoll benannten Größen ab; jeder Term muss im Sachkontext eine nachvollziehbare Bedeutung und passende Einheit haben.',
      'Die lernende Person legt für eine beschriebene Situation Größen und Variablen fest, formuliert daraus eine zutreffende Beziehung als Gleichung, Ungleichung oder Funktion und deutet die einzelnen Terme samt ihrer Einheiten im Ausgangskontext.',
      'Wenn im neuen Kontext statt eines festen Werts eine Obergrenze oder statt variabler Einnahmen variable Kosten vorliegen, wählt sie selbst die passende Beziehungsform und erklärt die geänderte Bedeutung der Terme.'
    ],
    en: [
      'Equations, inequalities, and functions express different relationships between meaningfully named quantities; every term must have a traceable meaning and appropriate unit in the real-world context.',
      'For a described situation, the learner defines quantities and variables, formulates an appropriate relationship as an equation, inequality, or function, and interprets its individual terms and units in the original context.',
      'When a new context has an upper bound rather than a fixed value or variable costs rather than variable revenue, the learner independently chooses the suitable relationship and explains the changed meaning of the terms.'
    ],
    rationale: 'Das Formulieren und Deuten derselben Größenbeziehung bleibt ein zusammenhängendes Modellierungsziel. Die bestehende Beschreibung ist klar; die gesichtete Kiosk-Grafik vermischt jedoch „2 Euro pro verkauftem Saft“ mit Kosten und muss separat in V geprüft werden, nicht durch eine Textänderung kaschiert werden.'
  }
]

const campaign = await read(join(here, 'description-review-campaign.json'))
const bundle = await read(join(here, '..', 'bundle', 'manifest.json'))
const batch = campaign.batches[0]
const inputPath = join(here, 'batches', `${prefix}.input.jsonl`)
const inputs = (await readFile(inputPath, 'utf8')).trim().split('\n').map(JSON.parse)
if (judgments.length !== inputs.length || judgments.some((judgment, index) => judgment.id !== inputs[index].goal.goalId)) {
  throw new Error('Authored judgments do not match bound batch order')
}
const runId = `${campaign.roundId}.run-001`
const fields = ['essentialUnderstandingDe', 'observablePerformanceDe', 'transferExpectationDe']
const englishFields = ['essentialUnderstandingEn', 'observablePerformanceEn', 'transferExpectationEn']
const records = judgments.map((judgment, index) => {
  const source = inputs[index].goal
  const understandingEvidence = Object.fromEntries([
    ...fields.map((name, fieldIndex) => [name, judgment.de[fieldIndex]]),
    ...englishFields.map((name, fieldIndex) => [name, judgment.en[fieldIndex]])
  ])
  return {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1,
    recordId: `${runId}.goal-${index + 1}`,
    runId,
    campaignId: campaign.campaignId,
    roundId: campaign.roundId,
    bundleFingerprint: campaign.bundleFingerprint,
    bookDigest: campaign.bookDigest,
    goalId: source.goalId,
    goalFingerprint: source.goalFingerprint,
    pageFingerprint: source.pageFingerprint,
    currentTitleDe: source.currentTitleDe,
    currentTitleEn: source.currentTitleEn,
    currentDescriptionDe: source.currentDescriptionDe,
    currentDescriptionEn: source.currentDescriptionEn,
    decision: judgment.decision,
    understandingEvidence,
    rationale: judgment.rationale,
    evidenceProfileContract: 'positive-understanding-evidence-v2',
    evidenceProfileRecommendation: source.reviewContext.evidenceProfile === null ? 'create' : 'revise',
    recordStatus: 'candidate',
    reviewAuthority: 'ai_candidate'
  }
})
const resultsDirectory = join(here, 'results')
await mkdir(resultsDirectory, { recursive: true })
const outputBytes = Buffer.from(records.map((record) => JSON.stringify(record)).join('\n') + '\n')
const timestamp = new Date().toISOString()
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
  model: 'codex-runtime-unspecified',
  role: 'subject_reviewer',
  promptFamilyId: 'goal-description-understanding-evidence-review-v2',
  promptFingerprint: campaign.promptFingerprint,
  criteriaFingerprint: campaign.criteriaFingerprint,
  generationParametersFingerprint: sha('host-managed sampling parameters not exposed'),
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherRuns: true,
  goalIds: batch.goalIds,
  inputArtifacts: [
    { role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint },
    ...bundle.artifacts.filter(({ role }) => ['review_prompt', 'review_criteria'].includes(role)).map(({ role, digest }) => ({ role, digest }))
  ],
  startedAt: timestamp,
  completedAt: timestamp,
  status: 'completed',
  outputDigest: sha(outputBytes),
  toolchainVersion: 'codex-manual-blind-review-v1'
}
await writeFile(join(resultsDirectory, `${prefix}.records.jsonl`), outputBytes)
await writeFile(join(resultsDirectory, `${prefix}.run.json`), JSON.stringify(run, null, 2) + '\n')
console.log(`Authored ${records.length} blind candidate records at ${resultsDirectory}`)
