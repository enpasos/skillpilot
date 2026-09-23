import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// Individually authored blind Round B judgments. This helper only serializes
// those judgments and copies bindings from the assigned Round B inputs.
const authored = {
  'efc3506a-5f35-4d77-9498-d70a091a470b': {
    essentialUnderstandingDe: 'Ein vollständiger Pfad beschreibt eine mögliche Ergebnisfolge des mehrstufigen Experiments. Seine Wahrscheinlichkeit entsteht durch Multiplikation der zum jeweiligen Verlauf passenden Zweigwahrscheinlichkeiten; ein Ereignis aus mehreren disjunkten Pfaden erhält die Summe ihrer Wahrscheinlichkeiten.',
    essentialUnderstandingEn: 'A complete path describes a possible outcome sequence of the multistage experiment. Its probability is the product of the branch probabilities appropriate to that history; an event consisting of several disjoint paths has the sum of their probabilities.',
    observablePerformanceDe: 'Die lernende Person erstellt selbstständig einen beschrifteten Baum für ein beschriebenes Experiment, ordnet einem Ereignis die richtigen Endpfade zu und berechnet dessen Wahrscheinlichkeit. Sie erklärt, warum entlang eines Pfades multipliziert und zwischen den ausgewählten Pfaden addiert wird.',
    observablePerformanceEn: 'The learner independently constructs a labelled tree for a described experiment, assigns the correct terminal paths to an event, and calculates its probability. They explain why probabilities are multiplied along a path and added across the selected paths.',
    transferExpectationDe: 'In einer neuen Aufgabe verändert sich durch Ziehen ohne Zurücklegen die Zusammensetzung nach der ersten Stufe. Die lernende Person passt die Zweigwahrscheinlichkeiten an den bisherigen Verlauf an und bestimmt damit ein Ereignis aus mehreren Pfaden, ohne unveränderte Wahrscheinlichkeiten aus einem Münzbeispiel zu übernehmen.',
    transferExpectationEn: 'In a fresh task, drawing without replacement changes the composition after the first stage. The learner adapts branch probabilities to the preceding history and uses them to determine an event comprising several paths, without carrying over unchanged probabilities from a coin example.',
    rationale: 'KEEP: Die DE/EN-Texte verbinden die Baumdarstellung und Pfadregeln zu einer einheitlichen J10-AB2-Kompetenz. Laplace-Experimente und verknüpfte Ereignisse sind vorausgesetzt; die nachfolgende explizite Bestimmung bedingter Wahrscheinlichkeiten wird nicht vorweggenommen. Das tatsächlich betrachtete Bild zeigt alle vier Münzpfade und korrekt P(KZ)=1/4 sowie P(genau einmal K)=1/2. Es ist Unterrichtshilfe, kein Leistungsnachweis. Der Text behauptet keine Unabhängigkeit aller zusammengesetzten Experimente und benötigt keine Ergänzung. Ein aktuelles V2-Profil fehlt im Input; daher create. Vollständige Quellenabbildung oder effektive Einzelprojektionen wurden nicht extern verifiziert.',
  },
  'f14e1643-ad8d-5235-a832-97987fa18489': {
    essentialUnderstandingDe: 'Der Parameter p bezeichnet den unbekannten Anteil beziehungsweise die Erfolgswahrscheinlichkeit im betrachteten binomialen Modell, nicht die beobachtete relative Häufigkeit. Null- und Alternativhypothese unterscheiden die zu prüfenden Parameterbereiche; die Sachfrage legt fest, ob eine Zunahme, Abnahme oder beliebige Abweichung untersucht wird.',
    essentialUnderstandingEn: 'The parameter p denotes the unknown proportion or success probability in the binomial model, not the observed relative frequency. The null and alternative hypotheses distinguish the parameter regions being tested; the contextual question determines whether an increase, decrease, or deviation in either direction is investigated.',
    observablePerformanceDe: 'Zu einer eigenständig vorgelegten Anteilsfrage benennt die lernende Person das als Erfolg gezählte Ereignis, definiert p in Worten und formuliert H0 sowie H1 symbolisch und inhaltlich passend zur Testrichtung. Sie ordnet den Gleichheitsfall der Nullhypothese zu und erklärt die gewählte Richtung anhand der Fragestellung.',
    observablePerformanceEn: 'For an independently presented question about a proportion, the learner identifies the event counted as success, defines p in words, and formulates H0 and H1 symbolically and contextually in accordance with the test direction. They assign the equality case to the null hypothesis and explain the chosen direction using the question.',
    transferExpectationDe: 'Eine neue Aufgabe beschreibt dasselbe Qualitätsmerkmal über den Anteil funktionsfähiger statt defekter Teile. Die lernende Person definiert den neuen Parameter und übersetzt die sachlich gleiche Vermutung in die dazu passende entgegengesetzte Ungleichungsrichtung; eine Frage nach jeder Abweichung erkennt sie als zweiseitig.',
    transferExpectationEn: 'A fresh task describes the same quality characteristic using the proportion of functioning rather than defective items. The learner defines the new parameter and translates the same substantive suspicion into the corresponding reversed inequality direction; they recognize a question about any deviation as two-sided.',
    rationale: 'KEEP: Die aktuelle Formulierung begrenzt das Ziel in beiden Sprachen ausdrücklich auf Anteile, den Parameter p und binomiale Signifikanztests. Die drei Testrichtungen sind Varianten derselben Hypothesenbildung und keine getrennten Lernziele. Die AB1-Rolle vor der Bestimmung von Testgrößen bleibt erhalten. Das betrachtete Bild zeigt passende komplementäre einseitige Parameterbereiche sowie p=1/6 gegen p≠1/6 und behauptet kein Annehmen von H0 als Wahrheitsbeweis. Seine Verwerfungsbereiche dienen nur der Einordnung; ihre Berechnung gehört nicht zu diesem Ziel. Der sourceRef ist ein Verweis, keine hier geprüfte vollständige Quellenabbildung. Mangels mitgeliefertem V2-Profil: create.',
  },
  '78bfbde4-8e16-529e-bd53-4e29d960b2b2': {
    essentialUnderstandingDe: 'Bei festgelegter Entscheidungsregel ist ein Fehler erster Art das Verwerfen unter der Nullhypothese, ein Fehler zweiter Art das Nichtverwerfen bei einem bestimmten wahren Parameter der Alternative. Für die beiden Wahrscheinlichkeiten werden unterschiedliche Verteilungen und jeweils die zur Fehlentscheidung gehörenden Werte der Testgröße verwendet.',
    essentialUnderstandingEn: 'For a fixed decision rule, a type I error is rejection under the null hypothesis, while a type II error is non-rejection at a particular true parameter in the alternative. The two probabilities use different distributions and the respective test-statistic values corresponding to the erroneous decision.',
    observablePerformanceDe: 'Die lernende Person übersetzt eine gegebene Verwerfungsregel selbstständig in die Summationsereignisse für α und β, setzt die jeweils angegebenen Parameter ein und berechnet die Wahrscheinlichkeiten durch passende Binomialsummen oder nachvollziehbare Werkzeugauswertung. Sie erläutert insbesondere, ob eine Grenze noch zum Verwerfungs- oder bereits zum Nichtverwerfungsbereich gehört.',
    observablePerformanceEn: 'The learner independently translates a given rejection rule into the summation events for α and β, uses the respective specified parameters, and calculates the probabilities through appropriate binomial sums or a traceable tool evaluation. In particular, they explain whether a boundary belongs to the rejection or non-rejection region.',
    transferExpectationDe: 'In einer neuen Aufgabe wird statt oberhalb einer Grenze unterhalb einer Grenze verworfen. Die lernende Person baut die Fehlerereignisse passend zur neuen Richtung neu auf, verwendet für β den eigens angegebenen Alternativwert und erklärt, weshalb die zuvor verwendete obere Verteilungssumme nicht unverändert übernommen werden darf.',
    transferExpectationEn: 'In a fresh task, rejection occurs below rather than above a threshold. The learner reconstructs the error events for the new direction, uses the specifically given alternative value for β, and explains why the previously used upper-tail sum cannot be reused unchanged.',
    rationale: 'KEEP: Die aktuelle DE/EN-Beschreibung benennt eine gegebene Regel sowie einen bestimmten wahren Alternativparameter und verhindert damit ein unspezifisches β für eine ganze Alternative. Berechnen und Nachvollziehen bilden eine einzelne AB2-Kompetenz; die spätere Deutung der Fehlerfolgen und Variation von n werden nicht eingezogen. Bei zusammengesetztem H0 muss die Aufgabe die Auswertung am Parameter beziehungsweise am maßgeblichen Randwert eindeutig machen. Das tatsächlich betrachtete Bild tut dies mit p=0,10 und p=0,25: für n=20 und X≥5 ergeben sich α=0,0431744953 und β=P0,25(X≤4)=0,4148415025, passend zu den gerundeten Bildwerten. Kein aktuelles V2-Profil liegt bei: create; keine externe Quellen- oder Projektionsprüfung behauptet.',
  },
  '77d607e0-0244-55ca-ba0f-214baa94b8de': {
    essentialUnderstandingDe: 'Im Diagramm mit Parameter p und relativer Häufigkeit h_n beschreibt der senkrechte Schnitt bei bekanntem p einen Bereich möglicher Stichprobenergebnisse, der waagerechte Schnitt bei beobachtetem h_n einen Konfidenzbereich für p. Bei sonst vergleichbaren Bedingungen führt größeres n zu engeren und höheres Konfidenzniveau zu breiteren Intervallen; das Niveau kennzeichnet die langfristige Überdeckung des Verfahrens.',
    essentialUnderstandingEn: 'In a diagram with parameter p and relative frequency h_n, a vertical slice at known p describes a range of possible sample results, while a horizontal slice at observed h_n gives a confidence range for p. Under otherwise comparable conditions, a larger n yields narrower intervals and a higher confidence level yields wider intervals; the level describes the procedure’s long-run coverage.',
    observablePerformanceDe: 'An einem unabhängig vorgelegten und beschrifteten Konfidenzdiagramm liest die lernende Person zu einer beobachteten Häufigkeit die Intervallgrenzen auf der Parameterachse ab. Sie vergleicht Diagramme bei getrennt veränderten Stichprobenumfängen oder Konfidenzniveaus und beurteilt die Aussagekraft anhand der Intervallbreite, ohne dem festen Parameter eine nachträgliche Wahrscheinlichkeit zuzuschreiben.',
    observablePerformanceEn: 'Using an independently presented and labelled confidence diagram, the learner reads the interval limits on the parameter axis for an observed frequency. They compare diagrams with separately changed sample sizes or confidence levels and assess informativeness through interval width, without assigning a posterior probability to the fixed parameter.',
    transferExpectationDe: 'In einer neuen Diagrammaufgabe sind Parameter- und Häufigkeitsachse vertauscht. Die lernende Person bestimmt die passende Schnittrichtung aus den Achsenbedeutungen neu und erklärt beim Vergleich eines größeren n mit einem zugleich höheren Konfidenzniveau, warum die gegenläufigen Einflüsse ohne weitere Diagramminformation keine pauschale Breitenentscheidung erlauben.',
    transferExpectationEn: 'In a fresh diagram task, the parameter and frequency axes are interchanged. The learner determines the appropriate slice direction anew from the axis meanings and explains, when comparing a larger n together with a higher confidence level, why the opposing influences do not permit a blanket decision about width without further diagram information.',
    rationale: 'KEEP: Lesen, Deuten und Beurteilen bilden eine zusammenhängende LK-AB3-Kompetenz nach dem Berechnen von Konfidenzintervallen und vor der Stichprobenplanung. DE und EN stimmen überein. Das betrachtete aktuelle Bild klärt die hier gemeinte Konfidenzellipse als Einparameterdiagramm in p und h_n; es zeigt die korrekten horizontalen/vertikalen Schnitte sowie die Näherungsrelation (h_n−p)²≤c²p(1−p)/n und nennt Normalapproximation, Voraussetzungskontrolle und langfristige Überdeckung. Eine bivariate Parameterschätzung wird damit nicht eingeführt. Die generischen Seiten-Scopes sind keine eigenständig geprüfte GK-Freigabe; LK-Titel und Tags bleiben Scope-Grenze dieser Bewertung. Kein V2-Profil im Input: create.',
  },
  'f84ea3d8-c255-552a-998a-202e42843f56': {
    essentialUnderstandingDe: 'Eine universelle Wenn-dann-Aussage ist bereits durch einen Fall widerlegt, der ihre Voraussetzungen erfüllt und ihre Folgerung verletzt. Ein Fall außerhalb des vorausgesetzten Bereichs widerlegt sie nicht; die Gegenbeispiel-Widerlegung beweist auch nicht, dass die Folgerung in allen Fällen falsch ist.',
    essentialUnderstandingEn: 'A universal if-then statement is refuted by a single case that satisfies its assumptions and violates its conclusion. A case outside the assumed domain does not refute it; refutation by counterexample also does not prove that the conclusion is false in every case.',
    observablePerformanceDe: 'Die lernende Person formuliert zu einer vorgelegten allgemeinen Behauptung und einem geeigneten Gegenbeispiel eine vollständige Widerlegung: Sie nennt die Behauptung, weist die erfüllten Voraussetzungen nach, zeigt die verletzte Folgerung und zieht genau den Schluss, dass die allgemeine Aussage falsch ist.',
    observablePerformanceEn: 'For a presented general claim and a suitable counterexample, the learner formulates a complete refutation: they state the claim, establish that the assumptions hold, show the violated conclusion, and draw exactly the conclusion that the general statement is false.',
    transferExpectationDe: 'Eine neue Aufgabe ersetzt die geometrische Aussage durch eine algebraische Behauptung mit ausdrücklich eingeschränktem Definitionsbereich. Die lernende Person erläutert beim vorgelegten Gegenbeispiel zuerst dessen Zulässigkeit und formuliert anschließend die widerlegte Folgerung und den präzisen Schluss, statt nur einen abweichenden Zahlenwert zu nennen.',
    transferExpectationEn: 'A fresh task replaces the geometric statement with an algebraic claim having an explicitly restricted domain. For the presented counterexample, the learner first explains its admissibility and then states the violated conclusion and precise inference, rather than merely reporting a differing numerical value.',
    rationale: 'KEEP: Beide Sprachfassungen benennen nun die entscheidenden Glieder einer Gegenbeispiel-Widerlegung, insbesondere erfüllte Voraussetzungen und verletzte Folgerung. Das ist eine einzelne Darstellungs- und Begründungskompetenz; die Konstruktion des Gegenbeispiels ist eigenes vorausgehendes Ziel. Das tatsächlich betrachtete Bild erfüllt diese Logik mit einem 4 cm mal 2 cm großen Rechteck und vier rechten Winkeln: Rechteckbedingung erfüllt, Gleichheit aller Seiten nicht erfüllt. Es illustriert keinen Beweis durch Widerspruch. Die semantische Einheit trägt auch ohne expliziten semanticAtomic-Wert. Das fehlende V2-Profil sollte neu erstellt werden; keine externe Vollständigkeit der Quellen oder Projektionen behauptet.',
  },
  '01217f4a-5221-5df9-b379-7b241fccf809': {
    essentialUnderstandingDe: 'Die logische Form einer Behauptung und die verfügbaren Voraussetzungen bestimmen, welche Beweiswege zweckmäßig sind. Direkte Ableitung, Kontraposition, Widerspruch und Induktion haben unterschiedliche Ansatzpunkte; eine rekursive Aussage über natürliche Zahlen kann Induktion nahelegen, schließt einen direkten Beweis aber nicht aus.',
    essentialUnderstandingEn: 'The logical form of a claim and the available assumptions determine which proof approaches are suitable. Direct deduction, contraposition, contradiction, and induction have different starting points; a recursive statement about natural numbers may suggest induction without ruling out a direct proof.',
    observablePerformanceDe: 'Die lernende Person vergleicht für eine selbstständig vorgelegte Behauptung zwei sachlich mögliche Beweisansätze, nennt jeweils den Ansatzpunkt und entscheidet sich mit einem auf die Struktur der Behauptung bezogenen Grund. Sie kann etwa erläutern, wann die Negation der Folgerung nutzbarer ist oder ein Übergang von n zu n+1 zugänglich wird.',
    observablePerformanceEn: 'For an independently presented claim, the learner compares two mathematically possible proof approaches, identifies each starting point, and chooses one for a reason tied to the claim’s structure. For example, they can explain when negating the conclusion is more useful or a transition from n to n+1 becomes accessible.',
    transferExpectationDe: 'In einer neuen Aufgabe wechselt die Behauptung von einer Summenformel für natürliche Zahlen zu einer Implikation über Teilbarkeit. Die lernende Person prüft die Eignung der Verfahren erneut und begründet, ob ein direkter oder kontrapositiver Zugang zweckmäßig ist, ohne das zuvor bevorzugte Induktionsverfahren automatisch zu übernehmen.',
    transferExpectationEn: 'In a fresh task, the claim changes from a sum formula for natural numbers to an implication about divisibility. The learner reassesses the suitability of the methods and explains whether a direct or contrapositive approach is useful, without automatically carrying over the previously preferred induction method.',
    rationale: 'KEEP: Die Beschreibung verlangt in DE/EN dieselbe begründete Strategiewahl, nicht vier vollständige eigenständige Beweisdurchführungen. Die bekannte Widerspruchs- und Induktionskompetenz ist Voraussetzung; Formalisieren und Lückensuche bleiben nachgelagert. Daher ist die Liste möglicher Strategien kein Split-Grund. Das betrachtete Bild nutzt die Summenformel als plausiblen Induktionsanlass; sein Hinweis auf n ist eine Orientierung, kein Ausschließlichkeitskriterium und kein Beweis. Im Evidenzprofil muss der Strukturgrund genauer sichtbar werden. LK-Titel und Tag begrenzen den Review trotz weiter gefasster aggregierter Seiten-Scopes; eine externe Projektionsprüfung fand nicht statt. Da kein aktuelles V2-Profil mitgeliefert ist: create.',
  },
  'a288231e-e4bb-5c65-b018-b79a51ca87d8': {
    essentialUnderstandingDe: 'Gegebene Informationen legen den Ausgangspunkt fest, gesuchte Größen das Erkenntnisziel und Nebenbedingungen den zulässigen Bereich einer Lösung. Eine Zahl, Variable oder Gleichung erhält ihre Rolle aus der konkreten Problemfrage; aus einer Skizze dürfen keine zusätzlichen ungenannten Bedingungen übernommen werden.',
    essentialUnderstandingEn: 'Given information establishes the starting point, unknown quantities the target, and constraints the admissible solution domain. A number, variable, or equation gets its role from the particular problem question; a sketch does not justify importing additional unstated conditions.',
    observablePerformanceDe: 'Die lernende Person entnimmt einer eigenständig vorgelegten Text- oder Bildaufgabe die bekannten Größen und Beziehungen, die gesuchten Größen sowie ausdrücklich genannte oder begrifflich notwendige Nebenbedingungen. Sie notiert sie mit passenden Bezeichnungen und gegebenenfalls Einheiten übersichtlich, ohne bereits eine Lösung zu behaupten.',
    observablePerformanceEn: 'From an independently presented verbal or pictorial problem, the learner extracts the known quantities and relationships, the unknown quantities, and the explicitly stated or conceptually necessary constraints. They record these clearly with suitable labels and units where appropriate, without already claiming a solution.',
    transferExpectationDe: 'Eine neue Aufgabe gibt statt des Umfangs eines Rechtecks seine Fläche vor und fragt bei einer vorgegebenen Seitenlänge nach der anderen Seite. Die lernende Person ordnet dieselben geometrischen Größen neu als gegeben oder gesucht ein und hält die positiven Seitenlängen als Nebenbedingung fest, statt die frühere Umfangsbeziehung zu kopieren.',
    transferExpectationEn: 'A fresh task supplies a rectangle’s area rather than its perimeter and, given one side length, asks for the other. The learner reassigns the same geometric quantities as given or unknown and retains positive side lengths as a constraint, rather than copying the previous perimeter relationship.',
    rationale: 'KEEP: Die beiden knappen Texte erfassen eine einheitliche Analyseleistung auf AB1: Rollen von Informationen und Bedingungen erkennen und ordnen. Das mathematische Formulieren der Zielfrage ist ausdrücklich nachgelagert und wird nicht zusätzlich verlangt. Das betrachtete Bild zeigt konsistent U=20 cm, a und b als gesucht, a>0 und b>0; a=4 cm und b=6 cm ist nur ein zulässiges Beispiel. Die Notiz 2a+2b=20 konkretisiert den gegebenen Umfang und begründet keine neue Modellierungskompetenz. DE/EN-Parität und curriculare Abgrenzung sind ausreichend, daher keine stilistische Revision. V2-Profil nicht mitgeliefert: create; vollständige externe Quellen-/Projektionsprüfung nicht behauptet.',
  },
};

const base = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-21/';
const mode = process.argv[2] ?? 'hold-repairs-7';
const dir = `${base}m7-proof-statistics-${mode}-v1/round-b`;
const reviews = mode === 'hold-repairs-7' ? authored : JSON.parse(readFileSync(`${dir}/independent-authoring.json`, 'utf8'));
const campaign = JSON.parse(readFileSync(`${dir}/description-review-campaign.json`, 'utf8'));
const input = JSON.parse(readFileSync(`${dir}/description-review-input.json`, 'utf8'));
const batch = campaign.batches[0];
const batchBytes = readFileSync(`${dir}/batches/${batch.batchId}.input.jsonl`);
const batchLines = batchBytes.toString().trim().split('\n').map(JSON.parse);
const sha256 = value => `sha256:${createHash('sha256').update(value).digest('hex')}`;
if (sha256(batchBytes) !== batch.batchInputFingerprint) throw new Error('Batch binding mismatch');
if (Object.keys(reviews).length !== input.goals.length) throw new Error('Review count mismatch');
const keys = ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn'];
const runId = `${batch.batchId}.codex-independent-b`;
const records = input.goals.map((goal, index) => {
  for (const key of keys) if (goal[key] !== batchLines[index].goal[key]) throw new Error(`Input mismatch: ${goal.goalId} ${key}`);
  if (goal.goalId !== batch.goalIds[index]) throw new Error('Goal order mismatch');
  const review = reviews[goal.goalId];
  if (!review) throw new Error(`Missing authored review ${goal.goalId}`);
  const { rationale, ...understandingEvidence } = review;
  return {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1,
    recordId: `${runId}.${String(index + 1).padStart(3, '0')}`,
    runId,
    campaignId: campaign.campaignId,
    roundId: campaign.roundId,
    bundleFingerprint: campaign.bundleFingerprint,
    bookDigest: campaign.bookDigest,
    ...Object.fromEntries(keys.map(key => [key, goal[key]])),
    decision: 'keep',
    understandingEvidence,
    rationale,
    evidenceProfileContract: 'positive-understanding-evidence-v2',
    evidenceProfileRecommendation: 'create',
    recordStatus: 'candidate',
    reviewAuthority: 'ai_candidate',
  };
});
const recordsBytes = `${records.map(record => JSON.stringify(record)).join('\n')}\n`;
const disclosure = {
  execution: 'Independent Codex subagent /root/math_repaired12_blind_b; exact serving model identifier not exposed',
  provider: 'OpenAI',
  model: 'Codex; exact serving model identifier not exposed',
  modelVersion: null,
  samplingParameters: 'Not exposed by the orchestration environment; no values inferred',
  startedAt: '2026-09-21T21:44:27.000Z',
  timestampScope: 'Actual clock capture before image inspection and final evidence authoring; preliminary input reading occurred earlier and was not separately timed',
  independence: 'No Round A, earlier review output, adjudication, synthesis, canonical diff, or other reviewer result inspected. Independence refers to the reviewer agent, not to provider or model diversity.',
  reviewedImages: input.goals.map(goal => {
    const v = goal.reviewContext.page.visualization;
    const path = `curricula/DE/Gymnasium/visualizations/mathematik/${goal.goalId}/${v.url.split('/').at(-1)}`;
    if (sha256(readFileSync(path)) !== v.originalDigest) throw new Error(`Image hash mismatch: ${goal.goalId}`);
    return { goalId: goal.goalId, path, digest: v.originalDigest, actuallyViewed: true };
  }),
  boundary: 'Description review candidate only. Images were inspected as current page context, not granted visualization QA or human approval. No claim of full source mapping, effective composition projection, or human trial.',
};
const disclosureBytes = `${JSON.stringify(disclosure, null, 2)}\n`;
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
  provider: disclosure.provider,
  model: disclosure.model,
  role: 'didactic_reviewer',
  promptFamilyId: 'goal-description-understanding-evidence-v2',
  promptFingerprint: campaign.promptFingerprint,
  criteriaFingerprint: campaign.criteriaFingerprint,
  generationParametersFingerprint: sha256(disclosureBytes),
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherRuns: true,
  goalIds: batch.goalIds,
  inputArtifacts: [
    { role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint },
    { role: 'review_prompt', digest: campaign.promptFingerprint },
    { role: 'review_criteria', digest: campaign.criteriaFingerprint },
  ],
  startedAt: disclosure.startedAt,
  completedAt: new Date().toISOString(),
  status: 'completed',
  outputDigest: sha256(recordsBytes),
  toolchainVersion: 'goal-description-review-v1',
};
const files = [
  [`${dir}/runtime-disclosure.json`, disclosureBytes],
  [`${dir}/results/${batch.batchId}.records.jsonl`, recordsBytes],
  [`${dir}/results/${batch.batchId}.run.json`, `${JSON.stringify(run, null, 2)}\n`],
];
process.stdout.write(`*** Begin Patch\n${files.map(([path, content]) => `*** Add File: ${path}\n${content.trimEnd().split('\n').map(line => `+${line}`).join('\n')}\n`).join('')}*** End Patch\n`);
