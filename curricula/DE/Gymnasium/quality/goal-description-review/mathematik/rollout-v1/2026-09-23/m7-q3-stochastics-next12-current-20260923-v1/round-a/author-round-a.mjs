import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const here = resolve(import.meta.dirname)
const prefix = 'mathematik-m7-q3-stochastics-next12-current-20260923-v1-first-pass-a.batch-001'
const sha = (value) => `sha256:${createHash('sha256').update(value).digest('hex')}`
const read = async (path) => JSON.parse(await readFile(path, 'utf8'))

// Independent, blind first-pass judgments for the bound Q3 batch.
const judgments = [
  {
    id: '70efdec0-110c-5564-849b-bc05cfff0f6a',
    decision: 'keep',
    de: [
      'Bei einer ungeordneten Auswahl ohne Zurücklegen zählt jede Gruppe gleich, unabhängig von der Reihenfolge ihrer Elemente; geordnete Auswahlen werden deshalb um die k! Anordnungen jeder Gruppe bereinigt.',
      'Die lernende Person zählt zunächst geordnete Auswahlen aus n unterscheidbaren Objekten mit Fakultäten, erklärt die Mehrfachzählung jeder k-elementigen Gruppe und berechnet sowie prüft die Zahl ungeordneter Auswahlen ohne den Binomialkoeffizientenbegriff.',
      'Bei einer neuen Auswahlsituation, die sprachlich eine Reihenfolge nahelegt, entscheidet sie anhand des Ergebnisses, ob diese Reihenfolge tatsächlich unterscheidet, und passt das Fakultätenmodell entsprechend an.'
    ],
    en: [
      'For an unordered selection without replacement, each group counts once regardless of the order of its elements; ordered selections must therefore be corrected for the k! arrangements of each group.',
      'The learner first counts ordered selections from n distinguishable objects using factorials, explains the overcounting of each k-element group, and computes and checks the number of unordered selections without using the binomial coefficient term.',
      'In a new selection situation whose wording suggests an order, the learner decides from the nature of the outcome whether that order actually distinguishes results and adjusts the factorial model accordingly.'
    ],
    rationale: 'Die Beschreibung grenzt ungeordnete Auswahlen und die Fakultätsmethode klar von der nachfolgenden Abkürzung durch Binomialkoeffizienten ab. Die Herleitung der Mehrfachzählung liefert die konkrete Verständnis-Evidenz.'
  },
  {
    id: 'd81bc960-4eff-5c87-90b8-fec8e1cb8b3a',
    decision: 'keep',
    de: [
      'Der Binomialkoeffizient zählt k-elementige Auswahlen aus n unterscheidbaren Objekten ohne Reihenfolge und ohne Zurücklegen; die Fakultätsformel teilt die Zahl geordneter Auswahlen durch die k! Anordnungen jeder Gruppe.',
      'Die lernende Person erklärt an einer kleinen Auswahl, was n und k bedeuten, zählt oder berechnet die Gruppen ohne Hilfsmittel und begründet, weshalb etwa AB und BA nur einmal gezählt werden.',
      'Wenn statt der ausgewählten Objekte die ausgeschlossenen Objekte benannt werden, deutet sie denselben Auswahlvorgang mit n-k und begründet die Gleichheit der beiden Zählweisen.'
    ],
    en: [
      'A binomial coefficient counts k-element selections from n distinguishable objects without order and without replacement; the factorial formula divides the number of ordered selections by the k! arrangements of each group.',
      'For a small selection, the learner explains what n and k mean, enumerates or calculates the groups without aids, and justifies why, for example, AB and BA are counted only once.',
      'When the excluded objects rather than the selected ones are named, the learner interprets the same selection using n-k and justifies the equality of the two counting approaches.'
    ],
    rationale: 'Kombinatorische Bedeutung und einfache Berechnung sind im bestehenden Wortlaut eindeutig. Das aktuelle Bild veranschaulicht die k!-Korrektur korrekt; es ersetzt die eigenständige Erklärung der lernenden Person nicht.'
  },
  {
    id: '1b67aeb4-2a55-531f-94da-283b4e3df5f1',
    decision: 'keep',
    de: [
      'Der Binomialkoeffizient erfasst genau die Anzahl ungeordneter Auswahlen fester Größe aus unterscheidbaren Objekten ohne Zurücklegen; seine Zahl ist eine Anzahl von Möglichkeiten, noch keine Wahrscheinlichkeit.',
      'Die lernende Person erkennt in einem konkreten Auswahlkontext, dass Reihenfolge keine neue Auswahl erzeugt, setzt n und k passend ein, berechnet die Auswahlanzahl und deutet die Zahl als mögliche Gruppen.',
      'Bei einer neuen Anwendung mit Teams statt gezogenen Lottozahlen unterscheidet sie die Anzahl der Gruppen von der Anzahl geordneter Besetzungen und wählt die Zählweise entsprechend.'
    ],
    en: [
      'The binomial coefficient gives the number of unordered selections of fixed size from distinguishable objects without replacement; its value is a count of possibilities, not yet a probability.',
      'In a concrete selection context, the learner recognizes that order does not create a new selection, assigns n and k appropriately, calculates the selection count, and interprets the number as possible groups.',
      'In a new application involving teams rather than lottery numbers, the learner distinguishes the number of groups from the number of ordered assignments and chooses the counting method accordingly.'
    ],
    rationale: 'Der Text spezifiziert den Anwendungsfall und die Interpretation ausreichend. Die Abgrenzung von bloßer Anzahl und Wahrscheinlichkeit verhindert eine naheliegende Fehlübertragung in nachfolgende Stochastikziele.'
  },
  {
    id: 'e495fa38-b198-5280-a405-9e41cafd6d17',
    decision: 'keep',
    de: [
      'Ein Bernoulli-Versuch hat genau zwei klassifizierte Ausgänge; eine Bernoulli-Kette wiederholt diesen Versuch unabhängig mit gleichbleibender Trefferwahrscheinlichkeit p über n Durchgänge.',
      'Die lernende Person benennt in einer beschriebenen Situation Treffer und Nichttreffer, prüft Unabhängigkeit und Konstanz von p und bestimmt für eine passende Kette n und p aus den Kontextdaten.',
      'Bei einer neuen Ziehung ohne Zurücklegen oder mit wechselnder Trefferchance erklärt sie, welche Bernoulli-Ketten-Voraussetzung verletzt ist, statt n und p nur formal aus dem Text abzulesen.'
    ],
    en: [
      'A Bernoulli trial has exactly two classified outcomes; a Bernoulli chain repeats that trial independently with a constant success probability p over n trials.',
      'In a described situation, the learner identifies success and failure, checks independence and constancy of p, and obtains n and p from the context for a suitable chain.',
      'For a new drawing without replacement or with a changing success probability, the learner explains which Bernoulli-chain assumption fails instead of merely extracting n and p formally from the wording.'
    ],
    rationale: 'Voraussetzungen sowie n und p sind bereits klar genannt. Die Evidenz macht die Modellgrenze sichtbar, ohne Berechnung von Binomialwahrscheinlichkeiten vorwegzunehmen.'
  },
  {
    id: '9b6f4d7d-a804-5666-b7ea-85bb3c73da4a',
    decision: 'keep',
    de: [
      'Für genau k Treffer in n unabhängigen gleichartigen Versuchen beschreibt p^k(1-p)^(n-k) die Wahrscheinlichkeit einer festen Trefferfolge; der Binomialkoeffizient zählt die möglichen Positionen dieser Treffer.',
      'Die lernende Person zerlegt für eine passende Bernoulli-Kette den Term in Trefferfaktor, Nichttrefferfaktor und Anzahl der Folgen, begründet jedes Element am Beispiel und erklärt, warum die Faktoren multipliziert werden.',
      'Bei einem neuen Beispiel mit p ungleich 1/2 und anders bezeichneten Erfolgen überträgt sie diese Zerlegung auf genau k Treffer, statt eine Formel ohne Ereignisbedeutung einzusetzen.'
    ],
    en: [
      'For exactly k successes in n independent, identically distributed trials, p^k(1-p)^(n-k) is the probability of one fixed success pattern; the binomial coefficient counts the possible positions of those successes.',
      'For a suitable Bernoulli chain, the learner separates the term into the success factor, failure factor, and number of patterns, justifies each part from the example, and explains why the factors are multiplied.',
      'In a new example with p different from 1/2 and a differently named success, the learner transfers this decomposition to exactly k successes rather than substituting into a formula without interpreting the event.'
    ],
    rationale: 'Der vorhandene Text verlangt ausdrücklich eine kombinatorische und probabilistische Begründung der Formel an einem Beispiel. Die drei Faktoren lassen sich ohne Erweiterung auf allgemeine Verteilungsbeweise konkret prüfen.'
  },
  {
    id: '0408ac7f-0530-5de5-b248-cf581c9b5a17',
    decision: 'keep',
    de: [
      'Mit Zurücklegen bleiben Zusammensetzung der Urne und Trefferwahrscheinlichkeit je Zug gleich; bei unabhängigen Zügen zählt der Binomialkoeffizient die möglichen Positionen einer vorgegebenen Trefferanzahl.',
      'Die lernende Person bestimmt aus einer Urnenbeschreibung die Trefferwahrscheinlichkeit pro Zug, erkennt die Unabhängigkeit durch Zurücklegen, berechnet die Wahrscheinlichkeit für genau k Treffer in n Zügen und prüft das Ergebnis an einem kleinen Fall.',
      'Bei einer neuen Ereignisfrage nach mindestens k statt genau k Treffern verbindet sie die betreffenden Trefferanzahlen korrekt oder erkennt, dass Ziehen ohne Zurücklegen die bisherige Binomialrechnung nicht mehr zulässt.'
    ],
    en: [
      'Replacement keeps the urn composition and success probability the same on every draw; with independent draws, the binomial coefficient counts the possible positions of a specified number of successes.',
      'From an urn description, the learner determines the success probability per draw, recognizes independence due to replacement, calculates the probability of exactly k successes in n draws, and checks the result in a small case.',
      'For a new event asking for at least k rather than exactly k successes, the learner combines the relevant success counts correctly or recognizes that drawing without replacement no longer permits the previous binomial calculation.'
    ],
    rationale: 'Die Beschreibung und der Klammerzusatz „Binomialmodell“ begrenzen den Fall auf geeignete wiederholte Ziehungen mit Zurücklegen. Die Evidenz präzisiert den gemeinten Trefferzahlfall; eine allgemeine Laplace-Behauptung über jede denkbare Farbfolge wird nicht erhoben.'
  },
  {
    id: 'aa00edfa-cf8d-500e-994f-7e33a5ebd045',
    decision: 'keep',
    de: [
      'Punkt-, Intervall- und kumulierte Binomialwahrscheinlichkeiten unterscheiden sich durch die Menge der zugelassenen Trefferzahlen; Summengrenzen oder Werkzeugabfragen müssen das im Kontext formulierte Ereignis genau abbilden.',
      'Die lernende Person übersetzt „genau“, „höchstens“, „mindestens“ und „zwischen“ in Ereignisse für X, bestimmt die zugehörigen Wahrscheinlichkeiten mit Summen oder einem passenden Werkzeug und deutet das Ergebnis als Wahrscheinlichkeit des beschriebenen Ereignisses.',
      'Bei einer neuen Situation mit komplementär formulierter Grenze wählt sie selbst zwischen direkter Summe und Gegenereignis und erläutert, welche Trefferzahlen jeweils ein- und ausgeschlossen sind.'
    ],
    en: [
      'Point, interval, and cumulative binomial probabilities differ in which success counts are included; summation bounds or tool queries must match the event described in context exactly.',
      'The learner translates “exactly,” “at most,” “at least,” and “between” into events for X, determines the corresponding probabilities using sums or an appropriate tool, and interprets the result as the probability of the stated event.',
      'In a new situation with a complementary wording of the threshold, the learner independently chooses between a direct sum and the complement and explains which success counts are included and excluded.'
    ],
    rationale: 'Die drei Wahrscheinlichkeitsformen hängen an derselben binomialen Zufallsgröße und an der Übersetzung eines Ereignisses in Trefferzahlen. Der bestehende Text ist lang, aber fachlich präzise und keine bloße Formelsammlung.'
  },
  {
    id: '66f432e9-22d3-51a9-8787-35f91db30616',
    decision: 'keep',
    de: [
      'Ein Binomialmodell verbindet feste Versuchszahl, zwei Ausgänge, unabhängige Wiederholungen und konstantes p mit einer diskreten Trefferzahlverteilung; Form und Lage des Histogramms hängen von n und p ab, bleiben aber nur unter passenden Annahmen aussagekräftig.',
      'Die lernende Person modelliert eine passende Situation mit X~B(n,p), erläutert an einem zugehörigen Histogramm Lage und typische Form und beurteilt anhand einer konkreten Kontextannahme, ob das Binomialmodell hier trägt.',
      'Bei einer neuen Situation mit wechselndem p oder voneinander abhängigen Treffern erkennt sie, dass ein ähnlich aussehendes Histogramm die verletzte Modellvoraussetzung nicht heilt, und begründet ihre Modellkritik.'
    ],
    en: [
      'A binomial model connects a fixed trial count, two outcomes, independent repetition, and constant p to a discrete success-count distribution; the histogram shape and location depend on n and p but are informative only when the assumptions fit.',
      'The learner models a suitable situation with X~B(n,p), explains the location and typical shape of its histogram, and judges from a concrete contextual assumption whether the binomial model is suitable here.',
      'In a new situation with changing p or dependent successes, the learner recognizes that a similarly shaped histogram does not repair the violated assumption and justifies the model criticism.'
    ],
    rationale: 'Modellbildung, Histogrammdeutung und Eignungsprüfung bilden hier die integrierte Anwendung bereits vorausgesetzter Kenngrößen- und Histogrammziele. Die Beschreibung verlangt eine begründete Verbindung der drei, nicht beliebige Einzelroutinen.'
  },
  {
    id: '9de07e13-6a5f-5b49-a6d4-0decefb95784',
    decision: 'split_review',
    de: [
      'Bei inversen Fragen wird aus einer vorgegebenen Binomialwahrscheinlichkeit eine noch unbekannte Modellgröße oder Ereignisgrenze erschlossen; n und k sind diskret, p ist eine kontinuierliche Wahrscheinlichkeit und jede Variante hat eigene Zulässigkeitsbedingungen.',
      'Die lernende Person identifiziert in einer inversen Aufgabenstellung, ob n, p oder k gesucht ist, formuliert die zu lösende Wahrscheinlichkeitsbedingung und überprüft einen ermittelten Wert an Verteilung und Kontextgrenzen.',
      'Bei einer strukturell veränderten Frage, in der statt einer Ereignisgrenze k die Trefferwahrscheinlichkeit p unbekannt ist, erkennt sie, dass ein bloßes Übernehmen der diskreten Grenzsuche nicht genügt, und wählt einen passenden Lösungsweg.'
    ],
    en: [
      'Inverse questions infer an unknown model quantity or event threshold from a given binomial probability; n and k are discrete while p is a continuous probability, and each variant has its own admissibility conditions.',
      'In an inverse task, the learner identifies whether n, p, or k is unknown, formulates the probability condition to be solved, and checks any resulting value against the distribution and contextual bounds.',
      'In a structurally changed question where success probability p rather than event threshold k is unknown, the learner recognizes that directly reusing a discrete threshold search is insufficient and chooses a suitable approach.'
    ],
    rationale: 'Die Beschreibung bündelt drei eigenständig prüfbare inverse Routinen: diskrete Suche nach n, diskrete Ereignisgrenze k und kontinuierliche Bestimmung von p. Eine Wortkorrektur löst diese Atomicity-Frage nicht; fachliche Aufteilungsprüfung ist erforderlich.'
  },
  {
    id: '4d906967-9f4b-5dc8-af7a-d403b95d61f5',
    decision: 'keep',
    de: [
      'Ein Prognoseintervall beschreibt bei bekanntem p und festem Stichprobenumfang mögliche zukünftige relative Häufigkeiten mit einer angegebenen Abdeckungswahrscheinlichkeit; es garantiert keinen einzelnen beobachteten Wert.',
      'Die lernende Person deutet ein vorgegebenes Prognoseintervall in einer konkreten Wiederholungssituation, benennt die Rolle des bekannten p und korrigiert die Behauptung, die nächste relative Häufigkeit müsse sicher im Intervall liegen.',
      'Bei verändertem Stichprobenumfang erklärt sie in einer neuen Anwendung, warum die Schwankung der zukünftigen relativen Häufigkeit anders ausfällt und warum das alte Intervall nicht unverändert übernommen werden darf.'
    ],
    en: [
      'Given known p and a fixed sample size, a prediction interval describes possible future relative frequencies at a stated coverage probability; it does not guarantee any single observed value.',
      'The learner interprets a supplied prediction interval in a concrete repeated-trial situation, identifies the role of known p, and corrects the claim that the next relative frequency must certainly lie inside the interval.',
      'For a changed sample size in a new application, the learner explains why the variation in future relative frequency differs and why the old interval cannot simply be reused.'
    ],
    rationale: 'Die vorhandene Beschreibung grenzt den Vorhersagefall mit bekanntem p korrekt ein und nennt Fehlinterpretationen. Der Unterschied zu Konfidenzintervallen bleibt im Profil explizit, ohne die Berechnung dieses Nachbarziels aufzunehmen.'
  },
  {
    id: '5c9ac68c-3928-518c-bbe0-e044667035a6',
    decision: 'keep',
    de: [
      'Ein Konfidenzintervall wird aus zufälligen Stichprobendaten für ein unbekanntes, festes p konstruiert; das Konfidenzniveau kennzeichnet die langfristige Abdeckung der Methode, nicht eine nachträgliche Zufallswahrscheinlichkeit für p im bereits berechneten Intervall.',
      'Die lernende Person deutet ein aus einer Stichprobe angegebenes Intervall als Schätzbereich für p, erklärt die Rolle der Stichprobenzufälligkeit und korrigiert eine Aussage, die dem festen unbekannten p nach Beobachtung eine Intervallwahrscheinlichkeit zuweist.',
      'Bei einer neuen Erhebung mit anderem Stichprobenumfang und beobachtetem Anteil erklärt sie, welche Information sich am Intervall ändert, und trennt den Schätzfall vom Prognosefall mit bekanntem p.'
    ],
    en: [
      'A confidence interval is constructed from random sample data for an unknown, fixed p; the confidence level describes the method’s long-run coverage, not a post-observation probability that p lies in the already calculated interval.',
      'The learner interprets an interval supplied from a sample as an estimate of p, explains the role of sampling randomness, and corrects a statement that assigns the fixed unknown p a probability of lying in the observed interval.',
      'For a new survey with a different sample size and observed proportion, the learner explains what information changes in the interval and separates estimation from prediction when p is known.'
    ],
    rationale: 'Die vorhandene Beschreibung benennt den Schätzbereich aus einer Stichprobe und die unbekannte Trefferwahrscheinlichkeit fachlich richtig. Der anspruchsvollere Unterschied zwischen Intervall und Konfidenzverfahren wird als konkrete Evidenz ausbuchstabiert.'
  },
  {
    id: 'ae483d98-54e0-5985-96d2-fc1351d22e4f',
    decision: 'keep',
    de: [
      'Ein geänderter Stichprobenumfang verändert die diskrete Verteilung der Testgröße; dadurch können sich Verwerfungsgrenze, Fehlerwahrscheinlichkeiten und die Bewertung desselben Beobachtungsergebnisses ändern, ohne dass eine pauschale Richtung für alle Größen gilt.',
      'Die lernende Person rechnet für einen vorgegebenen binomialen Test eine einfache Änderung von n mit unveränderten klar benannten Hypothesen nach, vergleicht eine betroffene Entscheidungsregel oder Fehlerwahrscheinlichkeit und beschreibt die Auswirkung auf die Entscheidung.',
      'In einer neuen Testsituation mit anderer Nullhypothese erklärt sie erneut, welche Größen bei einer Änderung von n festgehalten werden müssen und warum eine früher gefundene Grenze oder Fehlerrate nicht automatisch übertragbar ist.'
    ],
    en: [
      'Changing sample size changes the discrete distribution of the test statistic; the rejection threshold, error probabilities, and assessment of the same observed outcome may change, with no universal direction for every quantity.',
      'For a specified binomial test, the learner works through a simple change of n while holding clearly stated hypotheses fixed, compares an affected decision rule or error probability, and describes the consequence for the decision.',
      'In a new testing situation with a different null hypothesis, the learner again explains what must be held fixed when n changes and why a previously found threshold or error rate cannot automatically be transferred.'
    ],
    rationale: 'Variieren, Nachrechnen und Beschreiben sind eine zusammenhängende Testvergleichs-Kompetenz auf AB3. Der Wortlaut verspricht keine feste monotone Wirkung; das Profil wahrt die diskreten Grenzfälle und hält die Hypothesen explizit.'
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
