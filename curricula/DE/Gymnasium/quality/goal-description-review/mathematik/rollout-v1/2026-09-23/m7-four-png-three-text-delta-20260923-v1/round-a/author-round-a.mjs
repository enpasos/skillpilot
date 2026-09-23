// Independent first-pass Round A. Read only this round's bound input and the
// common bundle metadata. The decisions below were made without Round B.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const campaign = JSON.parse(readFileSync(resolve(here, 'description-review-campaign.json'), 'utf8'))
const bundle = JSON.parse(readFileSync(resolve(here, 'review-bundle-manifest.json'), 'utf8'))
const batch = campaign.batches[0]
const inputBytes = readFileSync(resolve(here, 'batches', `${batch.batchId}.input.jsonl`))
const inputs = inputBytes.toString('utf8').trim().split('\n').map(JSON.parse)
const sha256 = value => `sha256:${createHash('sha256').update(value).digest('hex')}`
if (sha256(inputBytes) !== batch.batchInputFingerprint || inputs.length !== 7) throw new Error('Round A input drift')
if (bundle.bundleFingerprint !== campaign.bundleFingerprint || bundle.bookModelDigest !== campaign.bookDigest) throw new Error('Bundle drift')

const decisions = [
  {
    goalId: '25a3cc39-976e-58a5-b882-73baee5c037c',
    decision: 'keep',
    rationale: 'Die Beschreibung nennt Quelle, Maßangabe, Einheit, Bezugsgröße und mathematische Verwendung als einen zusammenhängenden Lese- und Nutzungsakt. Die neue PNG-Seite mit 18 °C und 21 °C illustriert einen Einzelfall korrekt, ersetzt aber weder das Lesen anderer Quellen noch die Prüfung der Bezugsgröße. Eine Pflicht zum eigenen Vermessen oder zur Kartenskalierung wäre eine Erweiterung. Das Bild ist nur Review-Kandidat; diese Entscheidung ist keine Bildfreigabe.',
    understandingEvidence: {
      essentialUnderstandingDe: 'Eine Maßzahl ist erst zusammen mit ihrer Einheit und Bezugsgröße aussagekräftig; die Quelle legt fest, auf welche Größe, welchen Ort oder welchen Zeitpunkt sie sich bezieht. Erst dann können Angaben sinnvoll verglichen oder verrechnet werden.',
      essentialUnderstandingEn: 'A numerical measurement is meaningful only with its unit and reference quantity; the source identifies which quantity, place, or time it concerns. Only then can measurements be compared or used in calculations meaningfully.',
      observablePerformanceDe: 'Aus einer neuen Tabelle oder Skizze entnimmt die lernende Person die für eine Frage benötigten Werte, benennt zu jedem Wert Einheit und Bezug und verwendet sie in einer passenden Rechnung mit erklärtem Ergebnis.',
      observablePerformanceEn: 'From a fresh table or diagram, the learner extracts the values needed for a question, identifies the unit and reference for each value, and uses them in a suitable calculation with an explained result.',
      transferExpectationDe: 'Bei einer anders aufgebauten Quelle, etwa einem beschrifteten Diagramm statt einer Tabelle, findet sie dieselbe relevante Größe, beachtet Achse oder Legende und begründet, warum eine optisch ähnliche, aber anders bezogene Angabe nicht passt.',
      transferExpectationEn: 'With a differently structured source, such as a labelled graph instead of a table, the learner finds the same relevant quantity, uses its axis or legend, and explains why a visually similar value with a different reference does not fit.',
    },
  },
  {
    goalId: '55d0474b-b82c-59b6-a62a-b6a0a34d9c4b',
    decision: 'keep',
    rationale: 'Die DE-/EN-Beschreibung grenzt die Unterscheidung auf Wertebereich und Wahrscheinlichkeitsbeschreibung ein; passende Beispiele sind die Anwendung derselben Unterscheidung, kein zweites Lernziel. Die neue Münzwurf-/Wartezeit-PNG illustriert einzelne Massen gegenüber einer Dichte mit Intervallfläche. Sie erlaubt keinen Schluss auf unabhängiges Verständnis oder eine zusätzliche Integrationskompetenz. Die angezeigten GK-/LK-Projektionen und Quellzuordnungen werden hier nicht eigenständig freigegeben.',
    understandingEvidence: {
      essentialUnderstandingDe: 'Eine diskrete Zufallsgröße nimmt abzählbare Werte mit zugeordneten Einzelwahrscheinlichkeiten an. Bei einer stetig modellierten Zufallsgröße liegen mögliche Werte in Intervallen; Wahrscheinlichkeiten werden Intervallen über Dichteflächen zugeordnet, nicht einzelnen exakten Messwerten.',
      essentialUnderstandingEn: 'A discrete random variable takes countable values with probabilities assigned to individual values. A continuously modelled random variable ranges over intervals; probabilities are assigned to intervals through density areas, not to individual exact measurements.',
      observablePerformanceDe: 'Die lernende Person ordnet eine neue gezählte Kopfzahl und eine gemessene Zeit begründet den diskreten bzw. stetigen Modellen zu und erklärt, ob Einzelwerte oder Intervalle Wahrscheinlichkeiten tragen.',
      observablePerformanceEn: 'The learner classifies a fresh counted number of heads and a measured time as discrete or continuous models with reasons, and explains whether individual values or intervals carry probabilities.',
      transferExpectationDe: 'Bei einer auf ganze Sekunden gerundeten Wartezeit unterscheidet sie die diskreten aufgezeichneten Werte vom stetigen Modell der zugrunde liegenden Dauer und begründet ihre Wahl der Wahrscheinlichkeitsdarstellung.',
      transferExpectationEn: 'For waiting times rounded to whole seconds, the learner distinguishes the discrete recorded values from a continuous model of the underlying duration and justifies the chosen probability representation.',
    },
  },
  {
    goalId: 'b7cc2fc4-c695-5a97-93b0-3a619c632ca8',
    decision: 'keep',
    rationale: 'Die Beschreibung verbindet Daten bzw. Simulationen mit typischer Stabilisierung und grenzt die falsche Garantie für eine einzelne Folge ausdrücklich aus. Das neue Münzwurf-Bild zeigt 70 %, 54 %, 45 % und 51,2 % bei steigenden n: Die Werte schwanken, so dass gerade keine monotone Annäherung behauptet werden darf. Die Bildprüfung bleibt eine gesonderte V-Entscheidung.',
    understandingEvidence: {
      essentialUnderstandingDe: 'Relative Häufigkeit ist der Trefferanteil nach n Versuchen. Bei einer wiederholbaren Versuchsanordnung schwankt dieser Anteil in endlichen Folgen, stabilisiert sich mit wachsendem n typischerweise in der Nähe der zugrunde gelegten Ereigniswahrscheinlichkeit, muss aber in keiner einzelnen Folge monoton oder garantiert konvergieren.',
      essentialUnderstandingEn: 'Relative frequency is the proportion of occurrences after n trials. In a repeatable experiment, that proportion fluctuates in finite sequences and typically stabilises near the assumed event probability as n grows, but need not move monotonically or be guaranteed to do so in any particular sequence.',
      observablePerformanceDe: 'An unabhängig gegebenen Daten für mehrere Versuchszahlen berechnet oder liest die lernende Person die relativen Häufigkeiten, beschreibt Schwankung und längerfristige Stabilisierung und weist eine Behauptung über den zwingenden nächsten Wert begründet zurück.',
      observablePerformanceEn: 'Using independently supplied data for several trial counts, the learner calculates or reads relative frequencies, describes fluctuation and longer-term stabilisation, and rejects a claim about the supposedly inevitable next value with reasons.',
      transferExpectationDe: 'Bei einer neuen Simulation mit Würfelereignis statt Münzwurf vergleicht sie zwei unterschiedlich lange Versuchsfolgen und erläutert, weshalb auch die längere Folge vorübergehend vom Modellwert abweichen kann.',
      transferExpectationEn: 'In a new simulation of a die event rather than coin tossing, the learner compares two trial sequences of different lengths and explains why even the longer sequence may temporarily differ from the model value.',
    },
  },
  {
    goalId: '4ae9e316-509f-517d-bd94-a165817af24f',
    decision: 'keep',
    rationale: 'Die aktuelle Formulierung deckt die zusammenhängende Modellierungskette aus experimentellen Daten, Begrenzungsgröße, weiteren Parametern und kontextueller Deutung ab. Wachstum und Zerfall sind Varianten desselben begrenzten Modelltyps. Die neue Pflanzengrafik illustriert nur Wachstum und legt keine Datenanpassung offen; der Transfer muss daher unabhängig auch einen Zerfallskontext tragen. Eine einzelne schöne Kurve ist keine Modellfreigabe.',
    understandingEvidence: {
      essentialUnderstandingDe: 'Ein begrenztes Wachstums- oder Zerfallsmodell beschreibt eine sich verändernde Größe mit einem Grenzwert; Anfangswert, Begrenzungsgröße und zeitliche Änderungsrate bestimmen den Verlauf. Experimentelle Daten stützen nur im gemessenen Bereich eine Modellwahl und verlangen im Kontext prüfbare Annahmen.',
      essentialUnderstandingEn: 'A bounded growth or decay model describes a changing quantity with a limiting value; initial value, limit and rate of change determine its course. Experimental data support a model choice only within the measured range and require assumptions that can be checked in context.',
      observablePerformanceDe: 'Die lernende Person erschließt aus einer neuen Messreihe eine plausible Begrenzungsgröße, wählt und parametrisiert ein geeignetes begrenztes Modell, vergleicht Modellwerte mit Daten und erläutert die Bedeutung und Grenzen der Parameter.',
      observablePerformanceEn: 'From a fresh measurement series, the learner infers a plausible limiting value, chooses and parameterises a suitable bounded model, compares model values with data, and explains the meaning and limits of its parameters.',
      transferExpectationDe: 'Für Abkühlungsdaten statt Pflanzenwachstum modelliert sie eine Annäherung an die Umgebungstemperatur, deutet den neuen Grenzwert und prüft, ob die angenommene unveränderte Umgebung zu den Daten passt.',
      transferExpectationEn: 'For cooling data rather than plant growth, the learner models approach to ambient temperature, interprets the new limiting value, and checks whether the assumed constant environment fits the observations.',
    },
  },
  {
    goalId: '4cba85d3-2e25-5c4b-9c4c-37e5b201dce7',
    decision: 'keep',
    rationale: 'Die präzisierte zweisprachige Beschreibung benennt exakt die herzuleitende Identität und schließt cos(α)=0 als undefinierten Quotienten aus. Herleitung bleibt eine einzelne Kompetenz; bloßes Ablesen der Formel im gebundenen rechtwinkligen Dreiecksbild reicht nicht. Das Bild illustriert nur einen positiven spitzen Winkel, während der aktuelle Text allgemeinere Winkel mit cos(α)≠0 umfasst.',
    understandingEvidence: {
      essentialUnderstandingDe: 'Sinus und Kosinus sind bei gleichem Winkel die zur Hypotenuse bezogenen Koordinaten beziehungsweise Kathetenverhältnisse. Ihr Quotient ergibt das Gegenkathete-zu-Ankathete-Verhältnis bzw. die Tangens-Koordinate genau dann, wenn cos(α) nicht null ist.',
      essentialUnderstandingEn: 'For the same angle, sine and cosine are the hypotenuse-normalised coordinates or leg ratios. Their quotient gives the opposite-to-adjacent ratio or tangent coordinate precisely when cos(α) is nonzero.',
      observablePerformanceDe: 'Die lernende Person leitet an einem selbst beschrifteten Dreieck oder Einheitskreis tan(α)=sin(α)/cos(α) schrittweise her, benennt die gemeinsame Bezugsgröße und erklärt den Ausschluss von cos(α)=0.',
      observablePerformanceEn: 'Using a self-labelled triangle or unit circle, the learner derives tan(α)=sin(α)/cos(α) step by step, identifies the common reference quantity, and explains why cos(α)=0 is excluded.',
      transferExpectationDe: 'Für einen Winkel im zweiten Quadranten nutzt sie den Einheitskreis statt eines nur spitzwinkligen Dreiecks, leitet den Quotienten mit korrekten Vorzeichen her und grenzt ihn vom benachbarten Winkel mit cos(α)=0 ab.',
      transferExpectationEn: 'For an angle in the second quadrant, the learner uses the unit circle instead of only an acute-angle triangle, derives the quotient with correct signs, and distinguishes it from a neighbouring angle where cos(α)=0.',
    },
  },
  {
    goalId: 'b431148b-526c-4bde-b04b-48d23101d0d3',
    decision: 'keep',
    rationale: 'Der nun knappe DE-/EN-Text verlangt ein begründetes Urteil über die Plausibilität einer annähernden Normalverteilung und behauptet weder exakte Normalität noch ein Rechenschema. Das gebundene JPG enthält unabhängig davon eine falsche obere Schattengrenze (55 statt 55,5) sowie einen Schreibfehler. Es darf im V-Gate nicht freigegeben werden; dieses D-KEEP ist ausdrücklich keine Bild- oder Seitenpublikationsfreigabe.',
    understandingEvidence: {
      essentialUnderstandingDe: 'Eine Normalverteilung kann ein geeignetes Näherungsmodell für eine annähernd symmetrische, unimodale Streuung ohne dominierende Einflüsse oder harte relevante Grenze sein. Die Entscheidung hängt von Entstehungsmechanismus, beobachteter Form und Modellgrenzen ab; eine Glockenform allein beweist das Modell nicht.',
      essentialUnderstandingEn: 'A normal distribution may be a useful approximation for roughly symmetric, unimodal variation without a dominant influence or a relevant hard bound. The decision depends on the generating mechanism, observed shape and model limits; a bell shape alone does not prove the model.',
      observablePerformanceDe: 'Für eine neue stochastische Situation nennt die lernende Person plausible Gründe für oder gegen eine Normalnäherung, prüft Symmetrie, Konzentration und mögliche Grenzen und formuliert ein begrenztes statt sicheres Urteil.',
      observablePerformanceEn: 'For a fresh stochastic situation, the learner gives plausible reasons for or against a normal approximation, checks symmetry, concentration and possible bounds, and states a qualified rather than certain judgement.',
      transferExpectationDe: 'Sie vergleicht anschließend eine annähernd symmetrische Messgrößenverteilung mit stark rechtsschiefen Wartezeiten und begründet, weshalb derselbe Näherungsansatz nicht ohne erneute Prüfung übertragen werden darf.',
      transferExpectationEn: 'The learner then compares an approximately symmetric measurement distribution with strongly right-skewed waiting times and explains why the same approximation cannot be transferred without a new check.',
    },
  },
  {
    goalId: 'd051857c-0707-544f-ae7a-f20690d182b2',
    decision: 'keep',
    rationale: 'Die korrigierte Formulierung bestimmt für jede Ecke genau die Senkrechte zur Geraden der gegenüberliegenden Seite und die eigene Prüfung. Sie schließt damit auch Höhen mit Fußpunkt außerhalb der Seitenstrecke ein, ohne ein zweites Ziel einzuführen. Auf der gebundenen GoalBook-Seite ist aktuell kein Bild vorhanden; eine Bildfreigabe wird weder behauptet noch aus dem Text abgeleitet.',
    understandingEvidence: {
      essentialUnderstandingDe: 'Eine Dreieckshöhe ist die Gerade oder Strecke durch einen Eckpunkt, die zur Geraden der gegenüberliegenden Seite senkrecht steht. Der Fußpunkt darf auf einer Seitenverlängerung liegen; ein Dreieck besitzt zu seinen drei Seiten drei entsprechende Höhen.',
      essentialUnderstandingEn: 'A triangle altitude is the line or segment through a vertex perpendicular to the line containing the opposite side. Its foot may lie on an extension of that side; the triangle has a corresponding altitude for each of its three sides.',
      observablePerformanceDe: 'Die lernende Person konstruiert an einem unabhängig vorgelegten Dreieck die drei Höhen, kennzeichnet zu jeder die Gegenseite bzw. deren Gerade und kontrolliert die rechten Winkel am jeweiligen Fußpunkt.',
      observablePerformanceEn: 'For an independently presented triangle, the learner constructs all three altitudes, identifies the opposite side or its supporting line for each, and checks the right angle at each foot.',
      transferExpectationDe: 'Bei einem stumpfwinkligen Dreieck verlängert sie nötigenfalls die Gegenseite, konstruiert auch eine äußere Höhe und erklärt, warum ein Lot nur auf die gezeichnete Seitenstrecke hier nicht genügt.',
      transferExpectationEn: 'For an obtuse triangle, the learner extends the opposite side when needed, constructs an exterior altitude, and explains why dropping a perpendicular only to the drawn side segment would be insufficient.',
    },
  },
]

const runId = 'math-m7-four-png-three-text-delta-a-codex-20260923T1020Z'
const records = decisions.map((decision, index) => {
  const bound = inputs[index]
  const goal = bound.goal
  if (decision.goalId !== goal.goalId || bound.batchId !== batch.batchId) throw new Error(`Goal order drift at ${index}`)
  return {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1,
    recordId: `math-m7-four-png-three-text-a-${String(index + 1).padStart(3, '0')}`,
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
    decision: decision.decision,
    understandingEvidence: decision.understandingEvidence,
    rationale: decision.rationale,
    evidenceProfileContract: 'positive-understanding-evidence-v2',
    evidenceProfileRecommendation: 'create',
    recordStatus: 'candidate',
    reviewAuthority: 'ai_candidate',
  }
})
const outputBytes = Buffer.from(`${records.map(record => JSON.stringify(record)).join('\n')}\n`)
const artifact = role => {
  const found = bundle.artifacts.find(item => item.role === role)
  if (!found) throw new Error(`Missing bundle artifact: ${role}`)
  return { role, digest: found.digest }
}
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
  model: 'Codex agent; exact model identifier and sampling parameters not exposed; independent blind Round A',
  role: 'subject_reviewer',
  promptFamilyId: 'goal-description-understanding-evidence-v2',
  promptFingerprint: campaign.promptFingerprint,
  criteriaFingerprint: campaign.criteriaFingerprint,
  generationParametersFingerprint: sha256('host-managed sampling parameters not exposed'),
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherRuns: true,
  goalIds: batch.goalIds,
  inputArtifacts: [
    artifact('book_model'), artifact('book_html'), artifact('book_pdf'),
    artifact('review_prompt'), artifact('review_criteria'), artifact('run_manifest_schema'),
    { role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint },
  ],
  startedAt: '2026-09-23T10:10:00.000Z',
  completedAt: new Date().toISOString(),
  status: 'completed',
  outputDigest: sha256(outputBytes),
  toolchainVersion: 'codex-agent-description-review-v2',
}
const results = resolve(here, 'results')
mkdirSync(results, { recursive: true })
writeFileSync(resolve(results, `${batch.batchId}.records.jsonl`), outputBytes, { flag: 'wx' })
writeFileSync(resolve(results, `${batch.batchId}.run.json`), `${JSON.stringify(run, null, 2)}\n`, { flag: 'wx' })
process.stdout.write(`Wrote blind Round A for ${records.length} goals; digest ${run.outputDigest}\n`)
