import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// This helper serializes five independently authored AI judgments. It does not
// infer decisions, fetch other reviews, change inputs or grant human authority.
// stdout is an apply_patch payload; the caller applies it with apply_patch.
const roundDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(roundDirectory, '../../../../../../../../../..');
const readJson = (name) => JSON.parse(readFileSync(resolve(roundDirectory, name), 'utf8'));
const digest = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
const campaign = readJson('description-review-campaign.json');
const input = readJson('description-review-input.json');
const batch = campaign.batches[0];
const inputFile = `batches/${batch.batchId}.input.jsonl`;
const batchBytes = readFileSync(resolve(roundDirectory, inputFile));
const nativeRows = batchBytes.toString('utf8').trim().split('\n').map(JSON.parse);
assert.equal(campaign.goalCount, 5);
assert.equal(campaign.batches.length, 1);
assert.equal(digest(batchBytes), batch.batchInputFingerprint);
assert.equal(digest(readFileSync(resolve(roundDirectory, 'prompt.md'))), campaign.promptFingerprint);
assert.equal(digest(readFileSync(resolve(roundDirectory, 'criteria.md'))), campaign.criteriaFingerprint);
assert.equal(digest(readFileSync(resolve(roundDirectory, 'contracts/goal-description-review-record.schema.json'))), campaign.recordSchemaDigest);
nativeRows.forEach((row, index) => assert.deepEqual(row.goal, input.goals[index]));

const judgments = [
  {
    goalId: '781f133a-08bb-54b9-8fda-efa2f8f9b12c',
    decision: 'keep',
    understandingEvidence: {
      essentialUnderstandingDe: 'Bei positivem Anfangswert bedeutet exponentielles Wachstum oder Zerfall, dass gleiche Zeitabstände denselben Multiplikationsfaktor besitzen. Ein Faktor größer als 1 vergrößert den Bestand, ein Faktor zwischen 0 und 1 verkleinert ihn. Der Anfangswert und dieser Faktor verbinden Kontext, Wertetabelle, Graph und Funktionsterm; konstante absolute Zuwächse kennzeichnen eine andere Struktur.',
      essentialUnderstandingEn: 'For a positive initial value, exponential growth or decay means that equal time intervals have the same multiplicative factor. A factor greater than 1 increases the quantity, while a factor between 0 and 1 decreases it. The initial value and this factor connect the context, value table, graph and function expression; constant absolute increments describe a different structure.',
      observablePerformanceDe: 'Die lernende Person erkennt in einer unabhängig vorgelegten Tabelle mit gleichen Zeitabständen den konstanten Quotienten aufeinanderfolgender Werte, erläutert dessen Bedeutung und ordnet aus vorgelegten Funktionstermen den passenden Anfangswert und Faktor zu. Sie begründet an einem zugehörigen Graphen oder einer Kontextbeschreibung, warum derselbe Zusammenhang Wachstum oder Zerfall beschreibt.',
      observablePerformanceEn: 'In an independently presented table with equal time intervals, the learner identifies the constant ratio of consecutive values, explains its meaning and selects the matching initial value and factor from supplied function expressions. Using a corresponding graph or contextual description, the learner explains why the same relationship represents growth or decay.',
      transferExpectationDe: 'In einer frischen Aufgabe wird statt einer Wachstumstabelle ein verbal beschriebener Prozess mit gleichbleibender prozentualer Abnahme je Zeitintervall vorgelegt. Die lernende Person ordnet einen passenden fallenden Graphen und Term zu und erklärt, weshalb ein linear fallender Verlauf trotz ebenfalls abnehmender Werte nicht dieselbe Struktur beschreibt.',
      transferExpectationEn: 'A fresh task replaces a growth table with a verbally described process having the same percentage decrease in each time interval. The learner selects a suitable decreasing graph and expression and explains why a linearly decreasing graph, although also showing decreasing values, does not represent the same structure.',
    },
    rationale: 'KEEP: Der aktuelle DE/EN-Text benennt mit dem gleichbleibenden Faktor in gleichen Zeitabständen das entscheidende Erkennungsmerkmal und verbindet es ausdrücklich mit Tabelle, Graph, Kontext und Funktionszuordnung. Das ist ein einheitliches AB1-Erkennen und Deuten, keine verdeckte Pflicht zu Regression, Logarithmen oder Ableitungen. Parameterbestimmung und Gleichungslösen bleiben in den benannten Nachfolgezielen. Beide Sprachfassungen haben denselben Umfang. Das tatsächlich betrachtete Bild zeigt konsistente Reihen 100, 200, 400 beziehungsweise 80, 40, 20, passende Terme und Graphpunkte; es liefert Anschauung, keinen selbstständigen Nachweis. Eine weitergehende Lehrplan- oder Projektionsverifikation wird aus den gelieferten Metadaten nicht behauptet. Kein konkreter Anlass für Textrevision oder Aufteilung.',
    imageObservationDe: 'Mit view_image betrachtet: Beide Tabellen verwenden t=0,1,2. B(t)=100·2^t stimmt mit 100,200,400 und den drei beschrifteten Graphpunkten überein. M(t)=80·0,5^t stimmt mit 80,40,20 und den drei Graphpunkten überein. Faktorbereiche und Wachstums-/Zerfallsrichtung sind korrekt; lesbare Beschriftungen. Kein sichtbarer mathematischer Defekt festgestellt.',
  },
  {
    goalId: '346efb31-c400-5bd3-a698-dd9a7e1bc3f7',
    decision: 'keep',
    understandingEvidence: {
      essentialUnderstandingDe: 'In f(t)=b·a^t beschreibt a den Faktor pro festgelegter Zeiteinheit. Für positive Bestände und a>1 ergibt sich eine Verdopplungszeit T aus a^T=2; bei 0<a<1 ergibt sich die Halbwertszeit aus a^T=1/2. Der Faktor bestimmt damit Richtung und Tempo der relativen Veränderung. Die gleiche Dauer ist im Term, in Wertepaaren einer Tabelle und an passenden Höhenpaaren des Graphen erkennbar und hängt nicht vom positiven Anfangswert b ab.',
      essentialUnderstandingEn: 'In f(t)=b·a^t, a is the factor per specified time unit. For positive quantities and a>1, a doubling time T satisfies a^T=2; for 0<a<1, the half-life satisfies a^T=1/2. The factor therefore determines the direction and speed of relative change. The same duration can be identified in the expression, pairs of table values and corresponding pairs of graph heights, and does not depend on the positive initial value b.',
      observablePerformanceDe: 'Die lernende Person deutet den vorgelegten Faktor als relative Zu- oder Abnahme pro Zeiteinheit und bestimmt die passende Verdopplungs- oder Halbwertszeit mit einem nachvollziehbaren rechnerischen oder grafischen Weg. Sie verbindet das Ergebnis mit einem Wertepaar und einer Graphdarstellung und erläutert, weshalb der zweite Bestand nach dieser Dauer das Doppelte beziehungsweise die Hälfte des ersten ist.',
      observablePerformanceEn: 'The learner interprets a supplied factor as a relative increase or decrease per time unit and determines the appropriate doubling time or half-life using an understandable calculation or graphical approach. The learner connects the result to a pair of values and a graph and explains why, after this duration, the second quantity is twice or half the first.',
      transferExpectationDe: 'Eine unabhängig vorgelegte Vergleichsaufgabe zeigt zwei Graphen mit verschiedenen positiven Anfangswerten und demselben Faktor sowie einen dritten mit verändertem Faktor. Die lernende Person entscheidet anhand von Termen oder Wertedaten, welche Verdopplungs- beziehungsweise Halbwertszeiten gleich bleiben, und erklärt die Wirkung des geänderten Faktors. Damit wird Parameterwirkung von bloßer vertikaler Skalierung unterschieden.',
      transferExpectationEn: 'An independently presented comparison shows two graphs with different positive initial values and the same factor, and a third with a changed factor. Using expressions or value data, the learner determines which doubling times or half-lives remain equal and explains the effect of changing the factor. This distinguishes the effect of the factor from simple vertical scaling.',
    },
    rationale: 'KEEP: Bestimmen der Verdopplungs-/Halbwertszeit, Deuten von a und Verknüpfen der Darstellungen bilden hier eine zusammenhängende Parameterkompetenz: Alle Teilhandlungen erschließen denselben relativen Veränderungsfaktor. Die Beschreibung muss weder ein bestimmtes Lösungsverfahren noch sämtliche Parameterfälle vorwegnehmen; rechnerische und grafische Zugänge bleiben möglich. Sie erweitert den Erkennensvorgänger sinnvoll auf AB2, ohne Eigenschaften von e oder kontinuierliche Modelle aus den Nachfolgezielen zu übernehmen. DE und EN sind deckungsgleich. Im betrachteten Bild sind 50·1,2^t, die Werte 50/60/72/86,4, der Hinweis +20 Prozent und die Halbwertszeit 1 für 80·0,5^t konsistent. Dass das Bild exemplarisch Halbwertszeit zeigt, begrenzt nicht den expliziten Zielumfang Verdopplungszeit. Kein konkreter Textmangel und kein hinreichender Grund für split_review.',
    imageObservationDe: 'Mit view_image betrachtet: 50·1,2^t ergibt für t=0,1,2,3 die Tabelle 50,60,72,86,4; die gezeichneten Punkte liegen passend auf der beschrifteten Skala. a=1,2 wird korrekt als +20 Prozent pro Zeitschritt erklärt. Der Zerfallsterm 80·0,5^t halbiert 80 auf 40 in einem Zeitschritt; der markierte Zeitabstand ist 1. Kein sichtbarer mathematischer Defekt festgestellt. Der generische Alttext benennt die Kompetenz, bildet aber die konkreten Beispiele nur indirekt ab; daraus folgt keine Textänderung des Ziels.',
  },
  {
    goalId: 'f05acdc5-4949-54c7-b8cd-56ddd1fbdbad',
    decision: 'keep',
    understandingEvidence: {
      essentialUnderstandingDe: 'Ein kontinuierlicher Prozess mit konstanter relativer Änderungsrate k lässt sich für einen positiven Anfangsbestand als N(t)=N_0·e^(kt) beschreiben. N_0 ist der Bestand am gewählten Zeitnullpunkt, und das Vorzeichen von k unterscheidet Wachstum und Zerfall. k bezieht sich auf die gewählte Zeiteinheit; über ein endliches Intervall Δt ist der Faktor e^(k·Δt), sodass k nicht ungeprüft mit einer prozentualen Änderung über dieses Intervall gleichgesetzt werden darf.',
      essentialUnderstandingEn: 'A continuous process with constant relative rate of change k can be described for a positive initial quantity by N(t)=N_0·e^(kt). N_0 is the quantity at the chosen time origin, and the sign of k distinguishes growth from decay. k refers to the chosen time unit; over a finite interval Δt, the factor is e^(k·Δt), so k must not be equated without justification with the percentage change over that interval.',
      observablePerformanceDe: 'Aus einer unabhängig vorgelegten Beschreibung mit Anfangsbestand und kontinuierlicher relativer Änderungsrate formuliert die lernende Person das passende Modell. Sie erklärt Vorzeichen und Zeiteinheit von k, berechnet einen Bestand zu einem angegebenen Zeitpunkt und deutet ihn mit der Bestands- und Zeiteinheit. Sie erläutert, dass die Prognose den Fortbestand der konstanten relativen Änderungsrate voraussetzt.',
      observablePerformanceEn: 'From an independently presented description giving an initial quantity and a continuous relative rate of change, the learner constructs the appropriate model. The learner explains the sign and time unit of k, calculates the quantity at a specified time and interprets it using the quantity and time units. The learner explains that the prediction assumes the relative rate of change remains constant.',
      transferExpectationDe: 'Eine frische Aufgabe wechselt von Wachstum zu Zerfall und gibt die Zeit in einer anderen Einheit an. Die lernende Person passt Vorzeichen und Zahlenwert von k an, ohne dadurch den beschriebenen zeitlichen Verlauf zu verändern, und deutet eine Prognose zu einer nicht ganzzahligen Zeit. Sie begründet die Anpassung mit demselben Produkt k·t.',
      transferExpectationEn: 'A fresh task changes from growth to decay and expresses time in another unit. The learner adjusts the sign and numerical value of k without thereby changing the described time course and interprets a prediction at a non-integer time. The learner justifies the unit adjustment through the same product k·t.',
    },
    rationale: 'KEEP: Der Text grenzt die modellierbaren kontinuierlichen Prozesse ausdrücklich durch konstante relative Änderungsrate ein. Form und Kontextdeutung sind präzise benannt; beide Sprachen besitzen dieselbe Modellbedingung. Modellieren und Deuten des Ergebnisses sind eine kohärente AB2-Anwendung der vorausgesetzten natürlichen Exponentialfunktion und Parameterdeutung. Ein zusätzlicher Beweis von e-Eigenschaften, ein DGL-Lösungsverfahren oder das breite Auswerten weiterer Modelle wird nicht eingeführt. Die begriffliche Unterscheidung von kontinuierlichem k und endlichem Faktor gehört in die konkrete Evidenzkette, ohne die knappe Beschreibung zu überladen. Das betrachtete Bild zeigt 100·e^(0,3t) mit den korrekten Näherungen 135 und 182 sowie einen passend fallenden Graphen zu 80·e^(-0,4t). Keine konkrete fachliche oder bilinguale Mehrdeutigkeit verlangt eine Revision.',
    imageObservationDe: 'Mit view_image betrachtet: Links passen Anfangswert 100, N(1)≈135 und N(2)≈182 zu 100·e^(0,3t), zur Tabelle mit t in Stunden und zur Aussage nach zwei Stunden etwa 182. Der steigende Graph ordnet die markierten Punkte den passenden Höhen zu. Rechts zeigt 80·e^(-0,4t) einen positiven fallenden Verlauf; ohne quantitative Teilstriche ist er eine qualitative Skizze. Kein sichtbarer mathematischer Defekt festgestellt. Das Bild allein erläutert den Begriff der konstanten relativen Rate nicht vollständig und ersetzt daher keine Erklärung.',
  },
  {
    goalId: 'd900e0a4-0c45-50dd-a37b-01f9f91a134c',
    decision: 'keep',
    understandingEvidence: {
      essentialUnderstandingDe: 'Bei b·a^x=c ist x der gesuchte Exponent. Für a>0, a≠1, b≠0 und c/b>0 führt das Isolieren von a^x und anschließende Logarithmieren äquivalent zu x=log(c/b)/log(a). Die Logarithmusbasis ist frei, wenn sie in Zähler und Nenner dieselbe zulässige Basis ist. Eine Lösung der Gleichung und ihre Zulässigkeit in einer Sachsituation sind getrennt zu prüfen.',
      essentialUnderstandingEn: 'In b·a^x=c, x is the unknown exponent. For a>0, a≠1, b≠0 and c/b>0, isolating a^x and then taking logarithms gives the equivalent expression x=log(c/b)/log(a). The logarithm base may be chosen freely provided the same valid base is used in numerator and denominator. Solving the equation and determining whether the solution is admissible in a context are separate checks.',
      observablePerformanceDe: 'Die lernende Person löst eine eigenständig vorgelegte Exponentialgleichung durch nachvollziehbare logarithmische Umformungen und begründet dabei das Freistellen des Exponentialterms sowie das Herunterholen des Exponenten. Sie prüft das Ergebnis in der Ausgangsgleichung mit angemessener Rundung und deutet den gefundenen Exponenten, etwa als Zeitpunkt mit passender Einheit und zulässigem Zeitbereich.',
      observablePerformanceEn: 'The learner solves an independently presented exponential equation using understandable logarithmic transformations and explains both isolating the exponential term and bringing down the exponent. The learner checks the result in the original equation using appropriate rounding and interprets the exponent found, for example as a time with the correct unit and admissible time range.',
      transferExpectationDe: 'Eine neue Sachsituation verwendet einen Zerfallsfaktor und einen Zielwert, der über dem Anfangswert liegt. Die lernende Person erhält mit demselben logarithmischen Zusammenhang einen negativen Zeitpunkt, überprüft ihn mathematisch und erklärt, weshalb dies im nur für zukünftige Zeiten betrachteten Prozess keinen zukünftigen Erreichungszeitpunkt liefert. Die Änderung betrifft Faktorbereich und Kontextzulässigkeit, nicht nur eingesetzte Zahlen.',
      transferExpectationEn: 'A new contextual problem uses a decay factor and a target value above the initial value. Applying the same logarithmic relationship, the learner obtains a negative time, checks it mathematically and explains why it does not give a future reaching time for a process considered only at future times. The change concerns the factor regime and contextual admissibility, not merely substituted numbers.',
    },
    rationale: 'KEEP: Der Text beschreibt genau eine Lösungskompetenz für b·a^x=c einschließlich Überprüfung und Sachdeutung. Der Logarithmus ist ausdrücklich Teil dieser Kompetenz; seine Verwendung ist deshalb keine unzulässige methodische Verengung, während gültige Basen und äquivalente Umformungen offenbleiben. Übliche Zulässigkeitsbedingungen gehören zur sachgerechten Bearbeitung und können in der Evidenz präzisiert werden; ihr Fehlen als ausgeschriebene Fallliste macht den kurzen Zieltext nicht falsch. Lösen, Prüfen und Interpretieren sind hier zusammengehörig und keine drei getrennten Ziele. DE/EN stimmen überein. Das tatsächlich betrachtete Bild zeigt korrekt 3·2^x=48 mit x=4 und Probe sowie 5·1,2^x=20 mit x=ln(4)/ln(1,2). Es ist ein Lehrbeispiel, kein eigener Kompetenznachweis. Keine Revision allein zur Ergänzung einer Verfahrensliste erforderlich.',
    imageObservationDe: 'Mit view_image betrachtet: Linke Kette 3·2^x=48 → 2^x=16 → x=4 und Probe 3·2^4=48 korrekt. Rechte Kette 5·1,2^x=20 → 1,2^x=4 → x·ln(1,2)=ln(4) → x=ln(4)/ln(1,2) korrekt. Die Frage nach Erreichen des Zielwerts passt zur Sachdeutung. Keine falsche Gleichheit, kein Vorzeichenfehler und kein sichtbarer mathematischer Defekt festgestellt.',
  },
  {
    goalId: 'ab720928-9dbc-53c2-a1f8-865dda92122d',
    decision: 'keep',
    understandingEvidence: {
      essentialUnderstandingDe: 'Ein exponentielles Datenmodell beschreibt einen ungefähr konstanten relativen Faktor über gleiche Zeitintervalle. Anfangswert und Faktor beziehungsweise kontinuierliche Rate werden mit Bezug auf Zeitnullpunkt und Zeiteinheit aus Messwerten bestimmt. Aus dem angepassten Modell folgt eine mathematische Prognose; dass reale zukünftige Werte ihr folgen, setzt die weitere Eignung des Modells und die Gültigkeit seiner Annahmen voraus.',
      essentialUnderstandingEn: 'An exponential data model describes an approximately constant relative factor over equal time intervals. The initial value and factor or continuous rate are determined from measurements with reference to the time origin and unit. The fitted model yields a mathematical prediction; real future values follow it only if the model remains suitable and its assumptions remain valid.',
      observablePerformanceDe: 'Die lernende Person bildet zu unabhängig vorgelegten geeigneten Wachstums- oder Zerfallsdaten eine Exponentialfunktion, erläutert die aus den Messwerten bestimmten Parameter und überprüft die Übereinstimmung mit weiteren vorliegenden Werten. Sie berechnet und deutet eine zukünftige Modellgröße und benennt eine konkrete Annahme des beschriebenen Prozesses, von der diese Aussage abhängt. Ein bestimmtes Regressionsverfahren ist nicht vorgeschrieben.',
      observablePerformanceEn: 'For independently presented suitable growth or decay data, the learner constructs an exponential function, explains the parameters determined from measurements and checks agreement with further supplied values. The learner calculates and interprets a future model quantity and names a concrete assumption of the described process on which that statement depends. No particular regression procedure is prescribed.',
      transferExpectationDe: 'Eine frische Aufgabe stellt Messwerte eines geeigneten exponentiellen Prozesses in ungleichen Zeitabständen bereit. Die lernende Person berücksichtigt die Intervalllängen beim Bestimmen des Faktors pro Zeiteinheit, statt aufeinanderfolgende Quotienten ungeprüft gleichzusetzen, und begründet eine Prognose. Eine zusätzliche Kontextangabe über geänderte Prozessbedingungen veranlasst sie, die Reichweite dieser Prognose ausdrücklich zu begrenzen, ohne ein anderes Modell konstruieren zu müssen.',
      transferExpectationEn: 'A fresh task supplies measurements of a suitable exponential process at unequal time intervals. When determining the factor per time unit, the learner accounts for the interval lengths instead of equating successive ratios without checking and justifies a prediction. Additional contextual information about changed process conditions leads the learner to explicitly limit the reach of that prediction without having to construct another model.',
    },
    rationale: 'KEEP: Die aktuelle Beschreibung begrenzt die Datengrundlage auf geeignete Wachstums-/Zerfallsdaten und bindet die Prognose ausdrücklich an Modellannahmen. Parameter aus Messwerten bestimmen und die daraus folgende Entwicklung deuten gehören zu einer zusammenhängenden AB3-Modellierungsleistung. Die Vorgängerverknüpfung zum Gleichungslösen ist plausibler Kontext, keine Pflicht zu einem konkreten Anpassungsalgorithmus. Die Nachfolger zu begrenztem/logistischem Wachstum, Asymptotik und Differenzialgleichungen werden nicht in dieses Ziel hineingenommen. Die vollständige DE/EN-Parität ist gegeben. Im tatsächlich betrachteten Bild stimmen 120,150,187,5, der Quotient 1,25, f(t)=120·1,25^t und f(4)≈293 miteinander überein; der Hinweis zum passenden Prognosezeitraum ist fachlich angemessen. Kein begründeter Bedarf für eine Textänderung oder Aufteilung.',
    imageObservationDe: 'Mit view_image betrachtet: Die drei beschrifteten Messpunkte (0|120),(1|150),(2|187,5) stimmen mit f(t)=120·1,25^t überein. 150/120=1,25 und auch 187,5/150=1,25. Der angegebene Wert f(4)≈293 entspricht 292,96875; die gestrichelte Fortsetzung und der Hinweis zur Gültigkeit im passenden Zeitraum kennzeichnen die Prognose. Die rechte Werteskala und die markierten Punkte sind konsistent. Kein sichtbarer mathematischer Defekt festgestellt.',
  },
];

assert.deepEqual(judgments.map(({ goalId }) => goalId), batch.goalIds);
const runId = `${campaign.roundId}.codex-independent-b`;
const records = judgments.map(({ goalId, decision, understandingEvidence, rationale }, index) => {
  const source = nativeRows[index].goal;
  assert.equal(goalId, source.goalId);
  return {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1,
    recordId: `math-b038s-b-${goalId}`,
    runId,
    campaignId: campaign.campaignId,
    roundId: campaign.roundId,
    bundleFingerprint: campaign.bundleFingerprint,
    bookDigest: campaign.bookDigest,
    goalId,
    goalFingerprint: source.goalFingerprint,
    pageFingerprint: source.pageFingerprint,
    currentTitleDe: source.currentTitleDe,
    currentTitleEn: source.currentTitleEn,
    currentDescriptionDe: source.currentDescriptionDe,
    currentDescriptionEn: source.currentDescriptionEn,
    decision,
    understandingEvidence,
    rationale,
    evidenceProfileContract: 'positive-understanding-evidence-v2',
    evidenceProfileRecommendation: 'create',
    recordStatus: 'candidate',
    reviewAuthority: 'ai_candidate',
  };
});
const recordsText = records.map((record) => JSON.stringify(record)).join('\n') + '\n';
const metadata = {
  provider: 'OpenAI',
  client: 'Codex',
  servingModelName: null,
  servingModelVersion: null,
  samplingParameters: null,
  reason: 'Exact serving model name, version and sampling parameters are not exposed to this reviewer; no GPT version is asserted.',
};
const logPath = resolve(roundDirectory, 'independent-review-log.json');
const existingLog = existsSync(logPath) ? readJson('independent-review-log.json') : null;
const completedAt = existingLog?.completedAt ?? new Date().toISOString();
const startedAt = '2026-09-06T22:55:16Z';
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
  model: 'Codex (exact serving model not exposed)',
  role: 'subject_reviewer',
  promptFamilyId: 'goal-description-understanding-evidence-review-v2',
  promptFingerprint: campaign.promptFingerprint,
  criteriaFingerprint: campaign.criteriaFingerprint,
  generationParametersFingerprint: digest(JSON.stringify(metadata)),
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherRuns: true,
  goalIds: batch.goalIds,
  inputArtifacts: [
    { role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint },
    { role: 'review_prompt', digest: campaign.promptFingerprint },
    { role: 'review_criteria', digest: campaign.criteriaFingerprint },
  ],
  startedAt,
  completedAt,
  status: 'completed',
  outputDigest: digest(recordsText),
  toolchainVersion: 'skillpilot-native-review-contracts-v1-node20',
};
const imageReviews = judgments.map(({ goalId, imageObservationDe }, index) => {
  const visualization = nativeRows[index].goal.reviewContext.page.visualization;
  const assetPath = `app/public${visualization.url}`;
  const actualDigest = digest(readFileSync(resolve(repositoryRoot, assetPath)));
  assert.equal(actualDigest, visualization.originalDigest);
  return {
    goalId,
    assetPath,
    expectedDigest: visualization.originalDigest,
    actualDigest,
    hashMatches: true,
    inspectionTool: 'view_image',
    actuallyViewed: true,
    observationDe: imageObservationDe,
    disposition: 'no_visible_mathematical_defect_found',
    reviewAuthority: 'ai_candidate',
    grantsHumanApproval: false,
  };
});
const log = {
  schemaVersion: 1,
  runId,
  campaignId: campaign.campaignId,
  roundId: campaign.roundId,
  startedAt,
  completedAt,
  timeScope: 'Recorded interval covers final independent judgment and record authoring. Input reading and image inspection immediately preceded the first recorded clock time; their start was not separately timed.',
  generationParameters: metadata,
  generationParametersFingerprint: run.generationParametersFingerprint,
  independence: {
    ownRoundOnly: true,
    otherRoundOutputsRead: false,
    oldReviewsRead: false,
    positiveEvidenceProfilesRead: false,
    gitDiffsRead: false,
    projectMemoryRead: false,
    scope: 'Five native round-b goals and their supplied local relation/page/visualization context.',
    note: 'An initial filename-only discovery listed review-schema paths elsewhere; no contents of other review rounds were opened or used.',
  },
  inputIntegrity: {
    batchInputFingerprint: batch.batchInputFingerprint,
    reviewInputFingerprint: campaign.reviewInputFingerprint,
    recordSchemaDigest: campaign.recordSchemaDigest,
    nativeBatchGoalsDeepEqualReviewInput: true,
    inputFilesModified: false,
  },
  methodologicalLimits: [
    'All five decisions are individually authored semantic judgments, not generated from statuses or inferred votes.',
    'Current native input supplies no V2 profiles; create is recommended and no profile is written.',
    'Supplied applicability, sourceRef and neighbor metadata were used as scope context; external mappings, composition compilation and original sources were not independently re-audited.',
    'Images were visually inspected through view_image; the displayed previews were resized by the tool. Hashes bind the original active public JPEG bytes.',
    'No real learner evidence, source verification, human approval, release permission, publication or runtime change is claimed.',
  ],
  freezeCheck: { command: 'PATH=/home/enpasos/.nvm/versions/node/v20.20.2/bin:$PATH node scripts/check_openai_plugin_review_freeze.mjs', result: 'PASS skillpilot-coach-v1 1.0.0 state=IN_REVIEW trees=6 files=22' },
  commandCorrection: 'A read-only Node inspection initially used the old shell-default Node and failed on node:fs; it was rerun successfully with the required Node 20 PATH. No data write occurred in the failed call.',
  imageReviews,
  decisions: judgments.map(({ goalId, decision }) => ({ goalId, decision })),
  outputDigest: run.outputDigest,
};
const outputs = [
  [`results/${batch.batchId}.records.jsonl`, recordsText],
  [`results/${batch.batchId}.run.json`, JSON.stringify(run, null, 2) + '\n'],
  ['independent-review-log.json', JSON.stringify(log, null, 2) + '\n'],
];
if (process.argv.includes('--check')) {
  for (const [name, bytes] of outputs) assert.equal(readFileSync(resolve(roundDirectory, name), 'utf8'), bytes, name);
  console.log('PASS: five individual decisions, native bindings, image hashes and reproducible output bytes.');
} else {
  console.log('*** Begin Patch');
  for (const [name, bytes] of outputs) {
    const path = resolve(roundDirectory, name);
    assert.equal(existsSync(path), false, `Refusing to replace existing output: ${name}`);
    console.log(`*** Add File: ${path}`);
    console.log(bytes.trimEnd().split('\n').map((line) => '+' + line).join('\n'));
  }
  console.log('*** End Patch');
}
