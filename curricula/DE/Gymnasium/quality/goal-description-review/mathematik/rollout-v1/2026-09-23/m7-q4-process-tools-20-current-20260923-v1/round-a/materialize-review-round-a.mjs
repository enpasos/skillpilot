// Independent blind first pass. Authored decisions are bound mechanically to
// the immutable native campaign input; this script does not approve curriculum.
import { createHash } from 'node:crypto';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const batchRoot = resolve(here, '..');
const campaign = JSON.parse(readFileSync(join(here, 'description-review-campaign.json'), 'utf8'));
const batch = campaign.batches[0];
const bundle = JSON.parse(readFileSync(join(batchRoot, 'bundle/manifest.json'), 'utf8'));
const batchInputPath = join(here, 'batches', `${batch.batchId}.input.jsonl`);
const input = readFileSync(batchInputPath, 'utf8').trim().split('\n').map((line) => JSON.parse(line));
const sha = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
const digestFile = (path) => sha(readFileSync(path));
const runId = `${campaign.campaignId}.run-001`;

// Each decision carries exact-goal essential understanding, independently
// observable performance, meaningful changed-case transfer, and rationale.
const keep = (essentialDe, essentialEn, performanceDe, performanceEn, transferDe, transferEn, rationale) => ({
  decision: 'keep', essentialDe, essentialEn, performanceDe, performanceEn, transferDe, transferEn, rationale,
});
const revise = (proposedDescriptionDe, proposedDescriptionEn, essentialDe, essentialEn, performanceDe, performanceEn, transferDe, transferEn, rationale) => ({
  decision: 'revise', proposedDescriptionDe, proposedDescriptionEn,
  essentialDe, essentialEn, performanceDe, performanceEn, transferDe, transferEn, rationale,
});

const decisions = [
  keep(
    'Ein Lösungsplan verbindet bekannte Informationen, gesuchte Größen und passende Zwischenschritte; die Reihenfolge folgt den Abhängigkeiten zwischen diesen Schritten.',
    'A solution plan connects known information, sought quantities, and suitable intermediate steps; their order follows the dependencies among them.',
    'Die lernende Person benennt für ein mathematisches Problem benötigte Angaben, skizziert eine sinnvolle Folge von Teil- und Rechenschritten und begründet, warum diese zum gesuchten Ergebnis führen können.',
    'For a mathematical problem, the learner identifies needed information, sketches a sensible sequence of substeps and calculations, and explains why it can lead to the sought result.',
    'Wenn dieselbe Art von Problem eine fehlende Angabe oder eine zusätzliche Bedingung enthält, passt die lernende Person den Plan begründet an, bevor sie rechnet.',
    'When the same kind of problem has a missing datum or an additional condition, the learner adapts the plan with reasons before calculating.',
    'KEEP: Plan, Informationsbedarf und kurze Begründung sind eine zusammenhängende Vorbereitungsleistung; die anschließende Wahl einer konkreten Heuristik ist ein eigenes Ziel.'
  ),
  keep(
    'Eine Heuristik ist passend, wenn ihre Struktur zum Ziel, zu den gegebenen Beziehungen und zu den Bedingungen der Aufgabe passt; nicht jede Strategie liefert für jede Aufgabe einen nützlichen Einstieg.',
    'A heuristic is suitable when its structure matches the goal, the given relationships, and the task constraints; not every strategy offers a useful entry to every problem.',
    'Die lernende Person wählt für eine vorliegende Aufgabe etwa Rückwärtsarbeiten, Symmetrie oder Spezialfälle und erläutert anhand konkreter Aufgabenmerkmale, warum diese Wahl einen Lösungsansatz eröffnet.',
    'The learner chooses, for a given task, for example backward reasoning, symmetry, or special cases and explains using concrete task features why that choice opens a solution approach.',
    'Bei einer veränderten Aufgabe ohne die zuvor nutzbare Symmetrie wählt die lernende Person eine andere Heuristik und begründet den Wechsel aus der neuen Struktur.',
    'For a changed task without the previously useful symmetry, the learner chooses another heuristic and justifies the switch from the new structure.',
    'KEEP: Das Ziel betrifft die begründete Auswahl, während die nachfolgenden Ziele einzelne Strategien ausführlicher anwenden; die Beschreibung wahrt diese Grenze.'
  ),
  keep(
    'Vorwärtsarbeiten entwickelt Folgerungen aus dem Gegebenen; Rückwärtsarbeiten fragt vom Ziel nach nötigen Zwischenzielen. Beide Richtungen können sich in einem tragfähigen Zwischenschritt treffen.',
    'Forward reasoning develops consequences from what is given; backward reasoning asks what intermediate goals are needed for the target. The two directions can meet at a viable intermediate step.',
    'Die lernende Person formuliert aus Angaben und Ziel passende Zwischenschritte, verknüpft einen vorwärts und einen rückwärts gewonnenen Schritt und erklärt die Richtung jeder Schlussfolgerung.',
    'The learner formulates suitable intermediate steps from givens and target, connects a forward-derived and a backward-derived step, and explains the direction of each inference.',
    'Wenn in einer neuen Aufgabe das Ziel als Gleichung statt als gesuchter Zahlenwert vorliegt, leitet die lernende Person andere nötige Zwischenbedingungen rückwärts ab und verbindet sie mit den Angaben.',
    'When a new task states the target as an equation rather than a sought numerical value, the learner works backward to different necessary intermediate conditions and connects them to the givens.',
    'KEEP: Vorwärts- und Rückwärtsarbeiten bilden hier eine koordinierte Lösungsstrategie; der Text fordert nicht einen unzulässigen Schluss von notwendiger auf hinreichende Bedingung.'
  ),
  keep(
    'Geeignete Spezial-, Grenz- oder Extremfälle können eine verborgene Beziehung sichtbar machen; eine Beobachtung an solchen Fällen liefert zunächst eine Vermutung, keinen allgemeinen Beweis.',
    'Suitable special, limiting, or extreme cases can reveal a hidden relationship; an observation in those cases initially yields a conjecture, not a general proof.',
    'Die lernende Person wählt für ein Problem aussagekräftige Fälle, beschreibt das dabei erkennbare Muster, formuliert eine Hypothese und nennt einen sinnvollen nächsten Lösungsschritt.',
    'The learner selects informative cases for a problem, describes the pattern they reveal, formulates a hypothesis, and names a sensible next solution step.',
    'Wenn eine neue Nebenbedingung einen bisherigen Extremfall ausschließt, findet die lernende Person einen zulässigen Ersatzfall und prüft, ob die frühere Vermutung noch trägt.',
    'When a new constraint excludes a previously used extreme case, the learner finds an admissible replacement case and checks whether the earlier conjecture still holds.',
    'KEEP: Die drei Fallarten sind Alternativen derselben heuristischen Suchhandlung; die Evidenz trennt Hypothesenbildung ausdrücklich von Beweis.'
  ),
  keep(
    'Systematische Variation ändert Beispiele oder Parameter kontrolliert, sodass ein beobachtetes Muster einer bestimmten Änderung zugeordnet werden kann; daraus entsteht ein Lösungsansatz oder eine überprüfbare Vermutung.',
    'Systematic variation changes examples or parameters in a controlled way, so an observed pattern can be linked to a particular change; this yields a solution approach or a testable conjecture.',
    'Die lernende Person ordnet mehrere gezielt gewählte Fälle, hält andere Merkmale konstant, beschreibt das entstandene Muster und leitet daraus eine begründete nächste Untersuchung ab.',
    'The learner organizes several deliberately chosen cases, holds other features constant, describes the resulting pattern, and derives a reasoned next investigation.',
    'Bei einer neuen Aufgabe mit einer zusätzlichen Beschränkung der möglichen Parameter wählt die lernende Person eine neue systematische Fallfolge und prüft, ob das vorherige Muster bestehen bleibt.',
    'For a new task with an extra restriction on possible parameters, the learner chooses a new systematic sequence of cases and checks whether the earlier pattern persists.',
    'KEEP: Variieren, Mustererkennen und daraus einen Weg ableiten sind eine zusammenhängende heuristische Untersuchung, nicht bloß unsystematisches Probieren.'
  ),
  keep(
    'Variablen bezeichnen veränderliche Größen, Parameter legen Modellfamilien oder feste Bedingungen fest; Annahmen vereinfachen die Situation und bestimmen, wann das Modell sinnvoll ist.',
    'Variables denote changing quantities, parameters specify model families or fixed conditions; assumptions simplify the situation and determine when the model is meaningful.',
    'Die lernende Person definiert für eine Sachsituation geeignete Größen samt Bedeutung und gegebenenfalls Einheit, unterscheidet Variable und Parameter und formuliert die für ihren Modellansatz nötigen Annahmen.',
    'For a real-world situation, the learner defines suitable quantities with meanings and, where relevant, units, distinguishes variables from parameters, and states the assumptions needed for the model approach.',
    'Wenn eine bislang als konstant angenommene Größe in einer neuen Situation veränderlich ist, passt die lernende Person Variablen und Annahmen an und erklärt die Auswirkung auf den Modellansatz.',
    'When a quantity previously assumed constant varies in a new situation, the learner adapts the variables and assumptions and explains the effect on the model approach.',
    'KEEP: Benennung der Größen und explizite Annahmen gehören zur Einrichtung eines Modells; Beziehungen zwischen den Größen sind dem Nachfolgeziel vorbehalten.'
  ),
  keep(
    'Nebenbedingungen und Definitionsbereiche schränken die Menge mathematisch möglicher Ergebnisse auf im Kontext zulässige Ergebnisse ein; eine algebraische Lösung kann deshalb unbrauchbar sein.',
    'Constraints and domains narrow mathematically possible results to those admissible in context; an algebraic solution may therefore be unusable.',
    'Die lernende Person übersetzt etwa Nichtnegativität oder Ganzzahligkeit in Modellbedingungen, prüft Lösungskandidaten dagegen und erläutert, welche Ergebnisse ausscheiden.',
    'The learner translates, for example, non-negativity or integrality into model conditions, checks candidate solutions against them, and explains which results must be rejected.',
    'Wenn in einer neuen Situation eine Kapazitätsgrenze oder eine andere diskrete Einheit hinzukommt, bestimmt die lernende Person die geänderte zulässige Lösungsmenge.',
    'When a capacity limit or a different discrete unit is added in a new situation, the learner determines the changed feasible solution set.',
    'KEEP: Definitionsbereich und Nebenbedingungen sind hier zwei Arten derselben Modell-Zulässigkeitsprüfung; ihre Auswirkung bleibt explizit.'
  ),
  keep(
    'Eine Modelländerung soll eine konkrete Abweichung zwischen Situation und bisherigem Modell beheben; geänderte Parameter oder Bedingungen verändern mögliche Ergebnisse und ihre Deutung.',
    'A model change should address a concrete mismatch between the situation and the previous model; changed parameters or constraints alter possible results and their interpretation.',
    'Die lernende Person benennt an einem gegebenen Modell die zu korrigierende Annahme, ändert einen passenden Parameter oder ergänzt eine Bedingung und erklärt die Wirkung der Änderung.',
    'The learner identifies the assumption needing correction in a given model, changes a suitable parameter or adds a constraint, and explains the effect of the change.',
    'Wenn ein zuvor konstanter Preis in einer neuen Situation ab einer Schwelle anders gilt, passt die lernende Person das Modell an der Schwelle an und begründet die neue Gültigkeit.',
    'When a previously constant price changes beyond a threshold in a new situation, the learner adapts the model at that threshold and justifies its new validity.',
    'KEEP: Gezieltes Anpassen und Begründen sind eine Modellrevisionsleistung; der Text verlangt keine neue allgemeine Modellfamilie.'
  ),
  keep(
    'Ein Ergebnis ist nur plausibel, wenn Größenordnung, Bedingungen und Rückbezug zum Ausgangsproblem zusammenpassen; Überschlag, Grenzfall und Einsetzen prüfen unterschiedliche mögliche Fehler, ersetzen aber keinen Beweis.',
    'A result is plausible only if magnitude, constraints, and relation to the original problem agree; estimation, limiting cases, and substitution test different possible errors but do not replace a proof.',
    'Die lernende Person wählt einen passenden Gegencheck, führt ihn an einem erhaltenen Ergebnis aus und erläutert eine erkannte Unstimmigkeit anhand von Größenordnung, Ausgangsbedingung oder Kontext.',
    'The learner chooses a suitable cross-check, applies it to an obtained result, and explains a detected inconsistency using magnitude, an original condition, or context.',
    'Bei einer neuen Aufgabe mit geänderter Einheit oder Skala entdeckt die lernende Person einen scheinbar rechnerisch passenden, aber größenordnungsmäßig unplausiblen Wert.',
    'For a new task with a changed unit or scale, the learner detects a value that may fit an arithmetic step but is implausible in magnitude.',
    'KEEP: Die genannten Prüfweisen sind Alternativen für dieselbe Ergebnis-Plausibilität; fachliche Modellgrenzen werden im Nachfolgeziel gesondert diskutiert.'
  ),
  keep(
    'Ein Modell gilt nur unter seinen Annahmen und innerhalb der Genauigkeit seiner Daten und Vereinfachungen; das berechnete Ergebnis ist nicht automatisch eine genaue Aussage über die reale Situation.',
    'A model is valid only under its assumptions and within the accuracy of its data and simplifications; a calculated result is not automatically an exact claim about the real situation.',
    'Die lernende Person benennt für ein konkretes Modell eine relevante Annahme, Datenunsicherheit oder Vereinfachung und erklärt, wie diese die Aussagekraft eines Ergebnisses begrenzt.',
    'For a concrete model, the learner identifies a relevant assumption, data uncertainty, or simplification and explains how it limits the strength of a result.',
    'Wenn das Modell in einer neuen Situation außerhalb seines ursprünglich beobachteten Bereichs verwendet wird, beurteilt die lernende Person, welche Schlussfolgerung nicht mehr abgesichert ist.',
    'When the model is used in a new situation outside its originally observed range, the learner judges which conclusion is no longer supported.',
    'KEEP: Grenzen benennen und Folgen einschätzen bilden eine zusammenhängende Modellkritik; Plausibilitätschecks allein genügen dafür nicht.'
  ),
  revise(
    'Die lernende Person kann einen mathematischen Lösungsweg durch geeignete Umformungen, Werkzeuge oder Darstellungen verbessern und den Nutzen der Änderung für die Aufgabe erläutern.',
    'The learner can improve a mathematical solution approach through suitable transformations, tools, or representations and explain the benefit of the change for the task.',
    'Ein Lösungsweg kann je nach Aufgabe hinsichtlich Nachvollziehbarkeit, Aufwand oder Genauigkeit verbessert werden; der Nutzen einer Änderung hängt vom Ziel und möglichen Nachteilen ab.',
    'Depending on the task, a solution approach can be improved in clarity, effort, or accuracy; the value of a change depends on the goal and possible drawbacks.',
    'Die lernende Person schlägt für einen vorhandenen mathematischen Lösungsweg eine konkrete Umformung, Werkzeugwahl oder Darstellung vor und erklärt anhand der Aufgabe deren Vorteil.',
    'The learner proposes a concrete transformation, tool choice, or representation for an existing mathematical solution approach and explains its advantage for the task.',
    'Wenn in einer neuen Aufgabe eine bisher nützliche Näherung wegen höherer Genauigkeitsanforderung nicht ausreicht, wählt die lernende Person eine passendere Vorgehensweise und erläutert den Wechsel.',
    'When a previously useful approximation is inadequate in a new task because greater accuracy is required, the learner chooses a more suitable approach and explains the change.',
    'REVISE: „Optimierungen vorschlagen“ lässt offen, was verbessert wird. Der lokale Ersatz macht den im Titel und Vorgänger gemeinten Lösungsweg explizit, ohne eine zusätzliche Kompetenz zu beanspruchen.'
  ),
  keep(
    'Eingabe, Definitionsbereich und Ansichtsparameter eines digitalen Werkzeugs beeinflussen, was von einem mathematischen Objekt untersucht und sichtbar wird; die Bildschirmdarstellung ist nicht das Objekt selbst.',
    'Input, domain, and viewing parameters of a digital tool affect what can be investigated and seen of a mathematical object; the screen display is not the object itself.',
    'Die lernende Person gibt ein mathematisches Objekt korrekt ein, wählt für die Untersuchungsfrage passende Ansichts- oder Berechnungsparameter und begründet diese Einstellungen.',
    'The learner enters a mathematical object correctly, chooses view or calculation parameters suited to the question, and justifies those settings.',
    'Wenn bei einer neuen Funktion ein interessierender Bereich außerhalb des bisherigen Fensters liegt, ändert die lernende Person den sichtbaren Bereich gezielt, statt aus der alten Anzeige eine falsche Aussage abzuleiten.',
    'When a region of interest in a new function lies outside the previous window, the learner deliberately adjusts the visible range rather than drawing a false conclusion from the old display.',
    'KEEP: Korrekte Eingabe und zielgerichtete Darstellung sind die eine Einrichtungshandlung vor der Auswertung; Interpretieren der Ausgabe ist ein separates Nachfolgeziel.'
  ),
  keep(
    'Graph, Tabelle und numerischer Wert sind Darstellungen desselben mathematischen Zusammenhangs, deren Skalen, Einheiten und Rundung die Interpretation im Kontext beeinflussen.',
    'A graph, table, and numerical value represent the same mathematical relationship, while their scales, units, and rounding affect interpretation in context.',
    'Die lernende Person liest eine digitale Ausgabe fachlich korrekt, übersetzt eine relevante Aussage in den Sachkontext und prüft sie mit einer zweiten Information auf Plausibilität.',
    'The learner reads a digital output mathematically correctly, translates a relevant finding into the real-world context, and checks its plausibility against a second piece of information.',
    'Wenn derselbe Zusammenhang in einer neuen Aufgabe als Tabelle statt als Graph ausgegeben wird, erschließt die lernende Person die entsprechende Aussage und beachtet die geänderte Skalierung oder Einheit.',
    'When the same relationship is output as a table rather than a graph in a new task, the learner derives the corresponding conclusion while accounting for a changed scale or unit.',
    'KEEP: Deuten, Kontextbezug und einfacher Plausibilitätscheck sind Teil der Ausgabe-Interpretation; das gesonderte Ziel zum kritischen Gegencheck untersucht gezielt Tool-Fehler.'
  ),
  keep(
    'Ein digitales Ergebnis ist nur reproduzierbar, wenn mathematische Eingaben und relevante Werkzeugparameter wie Bereich, Fenster oder Genauigkeit eindeutig festgehalten werden.',
    'A digital result is reproducible only if mathematical inputs and relevant tool parameters such as domain, window, or precision are recorded unambiguously.',
    'Die lernende Person dokumentiert Term oder Daten, benötigte Parameter und Einstellungen so, dass eine andere Person die gleiche Untersuchung nachvollziehen und wiederholen kann.',
    'The learner documents the expression or data, required parameters, and settings so another person can trace and repeat the same investigation.',
    'Wenn bei einer neuen Untersuchung ein anderes Fenster oder eine andere Rundungsgenauigkeit verwendet wird, kennzeichnet die lernende Person genau diese Änderung und erklärt mögliche Unterschiede der Ausgabe.',
    'When a new investigation uses a different window or rounding precision, the learner records that exact change and explains possible differences in output.',
    'KEEP: Dokumentieren und Reproduzieren sind Absicht und überprüfbare Folge derselben Handlung; die Beschreibung bleibt werkzeugneutral.'
  ),
  keep(
    'Handrechnung und digitales Werkzeug bieten unterschiedliche Kontrollen desselben mathematischen Ergebnisses; Abweichungen können aus Eingabe, Rundung, Darstellung oder einem Fehler im Rechenweg entstehen.',
    'Hand calculation and a digital tool provide different checks on the same mathematical result; discrepancies can come from input, rounding, display, or an error in the calculation.',
    'Die lernende Person vergleicht ein selbst berechnetes Ergebnis mit einer passenden digitalen Kontrolle und erklärt eine Übereinstimmung oder lokalisiert eine Abweichung fachlich.',
    'The learner compares a self-calculated result with a suitable digital check and explains agreement or diagnoses a discrepancy mathematically.',
    'Wenn eine neue digitale Ausgabe gerundet statt exakt ist, erkennt die lernende Person den Näherungsunterschied zum handschriftlichen Bruch und unterscheidet ihn von einem tatsächlichen Rechenfehler.',
    'When a new digital output is rounded rather than exact, the learner recognizes the approximation difference from a handwritten fraction and distinguishes it from a real calculation error.',
    'KEEP: Digitaler Gegencheck und Einordnung der Differenz sind zusammengehörig; ein bloßes Ablesen der Tool-Antwort wäre keine unabhängige Evidenz.'
  ),
  keep(
    'Eine geeignete Visualisierung wählt Größen, Achsen, Skalen und gegebenenfalls Parameter so, dass die für die anspruchsvolle Frage relevante Beziehung erkennbar wird.',
    'An appropriate visualization chooses quantities, axes, scales, and, where relevant, parameters so the relationship relevant to a demanding question becomes visible.',
    'Die lernende Person entwirft für ein gegebenes komplexeres Problem eine passende zwei- oder dreidimensionale beziehungsweise parameterabhängige Darstellung und begründet die Wahl anhand der Untersuchungsfrage.',
    'For a given more complex problem, the learner designs a suitable two- or three-dimensional or parameter-dependent display and justifies the choice using the question being investigated.',
    'Wenn in einer neuen Aufgabe statt eines einzelnen Parameters zwei Größen gemeinsam variieren, passt die lernende Person ihre Visualisierung an und erklärt, was die neue Darstellung sichtbar macht oder verdeckt.',
    'When a new task varies two quantities together rather than a single parameter, the learner adapts the visualization and explains what the new display reveals or obscures.',
    'KEEP: Entwurf und begründete Wahl sind eine einheitliche LK-Leistung; die Beschreibung verlangt nicht pauschal eine 3D-Darstellung.'
  ),
  keep(
    'Unterschiedliche Darstellungen zeigen ergänzende Eigenschaften desselben mathematischen Zusammenhangs; eine tragfähige Argumentation muss ihre Aussagen konsistent verknüpfen.',
    'Different representations reveal complementary properties of the same mathematical relationship; a sound argument must connect their claims consistently.',
    'Die lernende Person verbindet etwa Graph, Tabelle und Text zu einer begründeten Aussage, zeigt die Entsprechung konkreter Werte oder Merkmale und vermeidet Widersprüche zwischen den Darstellungen.',
    'The learner combines, for example, graph, table, and text into a reasoned claim, shows how specific values or features correspond, and avoids contradictions among representations.',
    'Wenn in einer neuen Aufgabe ein Graph einen kleinen Unterschied durch seine Skala verdeckt, nutzt die lernende Person eine passende Tabelle und Erklärung, um die Argumentation zu präzisieren.',
    'When a graph in a new task hides a small difference because of its scale, the learner uses a suitable table and explanation to make the argument precise.',
    'KEEP: Kombinieren dient hier derselben mathematischen Argumentation; einzelne Darstellungen bloß nebeneinanderzustellen genügt nicht.'
  ),
  keep(
    'Eine verwendete Rechenregel oder Umformung ist durch eine passende Definition, einen Satz oder eine gültige Äquivalenz gedeckt; der Schritt muss außerdem einem erkennbaren Teilziel dienen.',
    'An applied calculation rule or transformation is supported by an appropriate definition, theorem, or valid equivalence; the step must also serve a recognizable subgoal.',
    'Die lernende Person benennt an einem eigenen Rechenschritt die tragende Regel oder Aussage, erläutert ihre Anwendung auf die konkreten Terme und erklärt, warum der Schritt im Lösungsweg nützt.',
    'For a step in their own calculation, the learner identifies the supporting rule or statement, explains its application to the actual expressions, and says why the step helps the solution.',
    'Wenn in einer neuen Gleichung eine Umformung nur unter einer zusätzlichen Bedingung gültig ist, benennt die lernende Person diese Bedingung und wählt oder begründet den Schritt entsprechend.',
    'When a transformation in a new equation is valid only under an additional condition, the learner names that condition and chooses or justifies the step accordingly.',
    'KEEP: Fachliche Gültigkeit und Zweck erklären denselben konkret verwendeten Schritt; das Nachfolgeziel untersucht Anwendbarkeitsbedingungen systematischer.'
  ),
  keep(
    'Ein Verfahren ist übertragbar, wenn die für seine Schritte entscheidende mathematische Struktur im neuen Fall erhalten bleibt; bei geänderten Bedingungen müssen Schritte angepasst werden.',
    'A procedure transfers when the mathematical structure required by its steps remains present in the new case; changed conditions require adapted steps.',
    'Die lernende Person erkennt in einer neuen Aufgabe die tragende Struktur eines bekannten Verfahrens, passt nötige Schritte an und begründet, welche Teile unverändert gelten.',
    'In a new task, the learner identifies the structure supporting a known procedure, adapts necessary steps, and explains which parts remain valid.',
    'Wenn eine bekannte Gleichungsmethode auf einen neuen Fall mit eingeschränktem Definitionsbereich trifft, passt die lernende Person die Lösung und Probe an, statt ein Muster blind zu kopieren.',
    'When a familiar equation method meets a new case with a restricted domain, the learner adapts the solution and check rather than copying a pattern blindly.',
    'KEEP: Übertragen, Anpassen und Begründen bilden eine Kompetenz. Der neue Fall muss strukturell verändert sein, nicht nur andere Zahlen enthalten.'
  ),
  keep(
    'Digitale Ausgaben können durch Rundung, Ansichtsfenster oder Eingaben täuschen; ein unabhängiger mathematischer Gegencheck trennt einen Darstellungsfehler vom tatsächlichen Ergebnis.',
    'Digital outputs can mislead because of rounding, viewing window, or inputs; an independent mathematical cross-check distinguishes a display artifact from the actual result.',
    'Die lernende Person erkennt an einer konkreten Tool-Ausgabe einen möglichen Rundungs- oder Darstellungsfehler, ändert eine geeignete Einstellung oder prüft rechnerisch und begründet das korrigierte Urteil.',
    'The learner spots a possible rounding or display error in a concrete tool output, changes a suitable setting or checks by calculation, and justifies the corrected judgment.',
    'Wenn ein enger Graphenausschnitt in einer neuen Aufgabe eine zweite Nullstelle verbirgt, erweitert die lernende Person das Fenster und überprüft die gefundene Aussage unabhängig am Term.',
    'When a narrow graph window in a new task hides a second zero, the learner widens the window and independently checks the finding using the expression.',
    'KEEP: Fehlerverdacht und geeigneter Gegencheck sind eine zusammenhängende kritische Prüfung; dies geht über bloßes Deuten einer Ausgabe hinaus.'
  ),
];

if (decisions.length !== input.length || input.length !== campaign.goalCount) {
  throw new Error('Authored decision count does not match bound input');
}
const schema = 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json';
const records = input.map((item, index) => {
  const goal = item.goal;
  const decision = decisions[index];
  const { proposedDescriptionDe, proposedDescriptionEn } = decision;
  if ((decision.decision === 'revise') !== Boolean(proposedDescriptionDe && proposedDescriptionEn)) {
    throw new Error(`Replacement mismatch at ordinal ${index + 1}`);
  }
  return {
    $schema: schema,
    schemaVersion: 1,
    recordId: `${runId}.${String(index + 1).padStart(3, '0')}`,
    runId,
    campaignId: campaign.campaignId,
    roundId: campaign.roundId,
    bundleFingerprint: item.bundleFingerprint,
    bookDigest: item.bookDigest,
    goalId: goal.goalId,
    goalFingerprint: goal.goalFingerprint,
    pageFingerprint: goal.pageFingerprint,
    currentTitleDe: goal.currentTitleDe,
    currentTitleEn: goal.currentTitleEn,
    currentDescriptionDe: goal.currentDescriptionDe,
    currentDescriptionEn: goal.currentDescriptionEn,
    decision: decision.decision,
    ...(proposedDescriptionDe ? { proposedDescriptionDe, proposedDescriptionEn } : {}),
    understandingEvidence: {
      essentialUnderstandingDe: decision.essentialDe,
      essentialUnderstandingEn: decision.essentialEn,
      observablePerformanceDe: decision.performanceDe,
      observablePerformanceEn: decision.performanceEn,
      transferExpectationDe: decision.transferDe,
      transferExpectationEn: decision.transferEn,
    },
    rationale: decision.rationale,
    evidenceProfileContract: 'positive-understanding-evidence-v2',
    evidenceProfileRecommendation: 'create',
    recordStatus: 'candidate',
    reviewAuthority: 'ai_candidate',
  };
});

const recordsBytes = Buffer.from(`${records.map((record) => JSON.stringify(record)).join('\n')}\n`, 'utf8');
const artifacts = [
  ['book_pdf', join(batchRoot, 'bundle/book.pdf')],
  ['book_model', join(batchRoot, 'bundle/book-model.json')],
  ['review_input_json', join(batchRoot, 'bundle/review-input.json')],
  ['review_prompt', join(here, 'prompt.md')],
  ['review_criteria', join(here, 'criteria.md')],
  ['description_review_batch_input_jsonl', batchInputPath],
];
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
  model: 'gpt-6',
  role: 'subject_reviewer',
  promptFamilyId: 'goal-description-understanding-evidence-review-v2',
  promptFingerprint: campaign.promptFingerprint,
  criteriaFingerprint: campaign.criteriaFingerprint,
  generationParametersFingerprint: sha(Buffer.from(JSON.stringify({ campaign: campaign.campaignId, round: 'a', mode: 'blind-first-pass', output: 'candidate' }))),
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherRuns: true,
  goalIds: batch.goalIds,
  inputArtifacts: artifacts.map(([role, path]) => ({ role, digest: digestFile(path) })),
  startedAt: '2026-09-23T03:40:00.000Z',
  completedAt: new Date().toISOString(),
  status: 'completed',
  outputDigest: sha(recordsBytes),
  toolchainVersion: 'codex-api-review-v1',
};
if (bundle.bookModelDigest !== run.bookDigest) throw new Error('Book model changed');
const results = join(here, 'results');
mkdirSync(results, { recursive: true });
writeFileSync(join(results, `${batch.batchId}.records.jsonl`), recordsBytes);
writeFileSync(join(results, `${batch.batchId}.run.json`), `${JSON.stringify(run, null, 2)}\n`);
console.log(JSON.stringify({ runId, count: records.length, decisions: records.reduce((counts, item) => ({ ...counts, [item.decision]: (counts[item.decision] ?? 0) + 1 }), {}) }));
