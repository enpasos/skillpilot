import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Blind Round B. Read this round's prepared input only; no Round A or prior D output.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../../../../../..')
const round = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-27/m7-six-independent-next-20260927-v1/round-b'
const at = (path) => resolve(root, path)
const sha = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const jsonBytes = (value) => `${JSON.stringify(value, null, 2)}\n`
const campaign = JSON.parse(readFileSync(at(`${round}/description-review-campaign.json`), 'utf8'))
const input = JSON.parse(readFileSync(at(`${round}/description-review-input.json`), 'utf8'))
const bundle = JSON.parse(readFileSync(at(`${round}/review-bundle-manifest.json`), 'utf8'))
const batch = campaign.batches[0]
const batchPath = `${round}/batches/${batch.batchId}.input.jsonl`
const batchBytes = readFileSync(at(batchPath))
const lines = batchBytes.toString('utf8').trimEnd().split('\n').map(JSON.parse)
if (sha(batchBytes) !== batch.batchInputFingerprint || campaign.goalCount !== 6 ||
    input.goals.length !== 6 || lines.length !== 6 || campaign.batches.length !== 1 ||
    bundle.bundleFingerprint !== campaign.bundleFingerprint ||
    batch.goalIds.some((id, index) => id !== input.goals[index].goalId || id !== lines[index].goal.goalId)) {
  throw new Error('Round B input bindings differ')
}

const evidence = (essentialUnderstandingDe, essentialUnderstandingEn,
  observablePerformanceDe, observablePerformanceEn,
  transferExpectationDe, transferExpectationEn) => ({
  essentialUnderstandingDe, essentialUnderstandingEn,
  observablePerformanceDe, observablePerformanceEn,
  transferExpectationDe, transferExpectationEn,
})
const judgments = {
  '31be24f0-3ab1-54d2-856d-fa9b7f36552f': {
    decision: 'split_review',
    rationale: 'Das Ziel bündelt das eigenständige Finden von Stammfunktionen zu Polynomen ohne Hilfsmittel und das Verwenden bereits vorgegebener Stammfunktionen in Integral- und Rekonstruktionsaufgaben. Man kann die Auswertung einer gegebenen Stammfunktion sicher beherrschen, ohne eine Stammfunktion selbst bilden zu können, und umgekehrt; die beiden Nachweise sind deshalb unabhängig. Die beiden Anwendungsarten des zweiten Teils können zunächst als ein zusammenhängender Nutzungsfall betrachtet werden. Eine lokale Wortlautänderung würde die fachliche Bündelung nicht beseitigen. Die Seite zeigt GK/LK mit BY nur LK; ohne gebundene Mapping-/Kompositionsquelle wird daraus keine bundesweite Bestätigung abgeleitet.',
    understandingEvidence: evidence(
      'Eine Stammfunktion F erfüllt F′=f und ist bis auf eine Konstante bestimmt. Für ganzrationale Funktionen folgt die Bildung aus Potenzregel und Linearität; beim Nutzen einer gegebenen Stammfunktion liefern F(b)−F(a) die bestimmte Integraländerung und ein Anfangswert die passende Rekonstruktion.',
      'An antiderivative F satisfies F′=f and is determined up to a constant. For polynomial functions, construction follows the power rule and linearity; when using a given antiderivative, F(b)−F(a) gives the definite integral change and an initial value fixes a reconstruction.',
      'Die lernende Person bildet zu einem unabhängig vorgelegten Polynom eine Stammfunktion ohne Hilfsmittel, prüft sie durch Ableiten und verwendet für einen separat gegebenen Ratenverlauf eine vorgegebene Stammfunktion samt Anfangswert zur Bestandsrekonstruktion.',
      'The learner constructs an antiderivative for an independently supplied polynomial without aids, verifies it by differentiation, and uses a supplied antiderivative and initial value for a separate rate model to reconstruct a stock.',
      'In einer neuen Aufgabe wird nur eine grafisch oder tabellarisch vorgegebene Stammfunktion mit zwei Randwerten geliefert: Die lernende Person bestimmt die Nettoänderung über das Intervall und erklärt, warum die unbekannte Integrationskonstante dabei wegfällt, ohne das Finden einer Formel vorzutäuschen.',
      'In a fresh task, only a graphically or tabularly supplied antiderivative with two endpoint values is given: the learner determines net change over the interval and explains why the unknown integration constant cancels, without pretending to derive a formula.'),
  },
  '803d910d-96d1-5118-b9ca-29e93d0da76d': {
    decision: 'block',
    rationale: 'Die mathematische Beschreibung ist präzise und LK-getaggt, doch die gebundene Buchseite weist das Ziel für fast alle Länder auch als GK aus; nur der direkte HMKB-Q2.5-Quellenverweis steht im Paket und enthält keinen prüfbaren Wortlaut oder vollständige Mappingbelege. Ein GK/LK-Geltungswiderspruch kann nicht durch Umformulieren des mathematischen Satzes behoben werden. Vor einer KEEP- oder REVISION-Freigabe ist die effektive Scope-/Quellenbindung zu klären. Die Bedingung, dass die Projektionsrichtung nicht in der Zielebene liegt, ist mathematisch wesentlich und darf nicht gestrichen werden.',
    understandingEvidence: evidence(
      'Eine Parallelprojektion auf eine Ebene durch den Ursprung ist entlang eines Richtungsvektors linear und nur eindeutig, wenn dieser Richtungsvektor nicht in der Zielebene liegt. Die Projektion fixiert Punkte der Zielebene, löscht die Projektionsrichtung und erfüllt P²=P.',
      'A parallel projection onto a plane through the origin is linear along a direction vector and is unique only if that vector is not in the target plane. The projection fixes points of the target plane, annihilates the projection direction, and satisfies P²=P.',
      'Für eine unabhängig angegebene Ursprungsebene und eine zulässige Projektionsrichtung bestimmt die lernende Person aus den Bildern der Basisvektoren die Matrix, prüft an einem Vektor das Ziel und die Parallelrichtung und begründet P²=P.',
      'For an independently specified plane through the origin and admissible projection direction, the learner determines the matrix from the images of basis vectors, checks the target and parallel direction on a vector, and justifies P²=P.',
      'Bei einer neuen schiefen Ursprungsebene statt einer Koordinatenebene erkennt die lernende Person, dass bloßes Nullsetzen einer Koordinate falsch wäre, konstruiert die Projektion entlang einer nichtnormalen Richtung und erklärt den Ausfall der Eindeutigkeit, falls die Richtung in die Ebene verlegt wird.',
      'For a fresh oblique origin plane rather than a coordinate plane, the learner recognizes that merely zeroing one coordinate would be wrong, constructs projection along a nonnormal direction, and explains the loss of uniqueness if the direction is moved into the plane.'),
  },
  '9023226b-fc17-412b-807c-2bb45cd551d5': {
    decision: 'split_review',
    rationale: 'Das aktuelle atomar markierte Ziel verlangt sowohl das Lösen bereits gegebener quadratischer Gleichungen mit verschiedenen Verfahren als auch das eigenständige Übersetzen von Sachproblemen in solche Gleichungen. Modellieren und eine fertige Gleichung lösen sind unabhängig überprüfbar; die Methodenwahl grafisch/Ergänzung/Formel gehört zum Lösungsziel und muss nicht in drei Methodenatome zerlegt werden. Das Bild zur quadratischen Ergänzung zeigt eine geometrische Seitenlänge nur für x≥0, obwohl die algebraische Gleichung x=−2 ergibt; der angegebene Bild-Alttext markiert diese Domänengrenze ausdrücklich. Bildkopie ist kein Lernendennachweis.',
    understandingEvidence: evidence(
      'Eine quadratische Gleichung beschreibt Nullstellen bzw. Schnittpunkte einer Parabel mit einer Achse; Ergänzung, Lösungsformel und Graph liefern dieselbe reelle Lösungsmenge unter ihren jeweiligen Voraussetzungen. Bei Sachproblemen müssen Variablen, Gleichung und zulässiger Wertebereich zur Situation passen.',
      'A quadratic equation describes roots or intersections of a parabola with an axis; completing the square, a formula, and a graph yield the same real solution set under their respective conditions. In word problems, variables, equation, and admissible domain must fit the situation.',
      'Die lernende Person löst eine unabhängig gegebene quadratische Gleichung mit einem begründeten Verfahren, prüft die Lösungsmenge durch Einsetzen oder Graph und erstellt zu einer getrennt gestellten einfachen Flächenfrage selbst eine quadratische Gleichung samt Bereichsprüfung.',
      'The learner solves an independently supplied quadratic equation by a justified method, checks the solution set by substitution or graph, and independently forms a quadratic equation for a separate simple area problem, including a domain check.',
      'Bei einer neuen Rechteckaufgabe mit positiver Seitenlänge und zwei algebraischen Wurzeln interpretiert die lernende Person nur die geometrisch zulässige Wurzel und erklärt, weshalb eine korrekte algebraische Lösung nicht automatisch eine Sachlösung ist.',
      'For a fresh rectangle problem with a positive side length and two algebraic roots, the learner interprets only the geometrically admissible root and explains why a correct algebraic root is not automatically a contextual solution.'),
  },
  'c2c49659-5917-5be5-a3bd-e46f1b17126f': {
    decision: 'keep',
    rationale: 'KEEP: Trotz der mehreren ausdrücklich genannten Objektkonfigurationen ist der beanspruchte LK-Mehrwert eine einheitliche Methodenkompetenz: ein geeignetes Lotfußpunktverfahren für den kürzesten Abstand entwickeln, zwischen Fällen auswählen und anwenden. Punkt-Gerade-, Gerade-Gerade- und Punkt-Ebene-Abstände stehen bereits als direkte Voraussetzungen; diese Zielstufe ist damit keine bloße Wiederholung der Einzelrechnungen. Die Liste begrenzt den Geltungsbereich präzise und die DE/EN-Texte sind deckungsgleich. Die Quellenangabe HMKB Q2.3 ist nur ein Verweis, nicht der hier geprüfte Quellentext; effektive BY/HE-Projektion bleibt separat zu prüfen.',
    understandingEvidence: evidence(
      'Der kürzeste Abstand geometrischer Objekte wird durch ein senkrechtes Verbindungsstück realisiert. Bei Punkt–Gerade, Punkt–Ebene, parallelen Objekten und windschiefen Geraden ändern sich die unbekannten Lotpunkte und Orthogonalitätsbedingungen, doch das gemeinsame Lotprinzip entscheidet über das Verfahren.',
      'The shortest distance between geometric objects is realized by a perpendicular connecting segment. For point–line, point–plane, parallel objects, and skew lines, the unknown foot points and orthogonality conditions differ, but the common perpendicular principle determines the method.',
      'Die lernende Person identifiziert für eine unabhängig gegebene Raumkonfiguration die Objektlage, stellt passende Lot- und Zugehörigkeitsbedingungen auf, bestimmt den oder die Lotpunkte und begründet, weshalb deren Verbindungsstrecke den kürzesten Abstand liefert.',
      'For an independently supplied spatial configuration, the learner identifies the positional relation, sets up suitable perpendicular and incidence conditions, determines the foot point or points, and justifies why their connecting segment gives the shortest distance.',
      'In einem neuen Fall wechselt die Konfiguration von Punkt–Ebene zu zwei windschiefen Geraden: Die lernende Person überträgt das Lotprinzip auf zwei bewegliche Fußpunkte und prüft, dass der Verbindungsvektor zu beiden Richtungsvektoren orthogonal ist, statt eine bekannte Punkt-Ebene-Formel blind einzusetzen.',
      'In a fresh case, the configuration changes from point–plane to two skew lines: the learner transfers the perpendicular principle to two variable foot points and verifies that the connecting vector is orthogonal to both line directions, rather than blindly inserting a point–plane formula.'),
  },
  'a97c7cce-1343-5d04-926f-4a4f323b3c21': {
    decision: 'block',
    rationale: '„Geraden in allgemeinen Raumkonfigurationen spiegeln“ legt das Spiegelungsobjekt nicht fest: Spiegelung an einer Ebene, an einem Punkt oder um eine Achse sind im Raum verschiedene Abbildungen mit anderen Symmetrie- und Lotbedingungen. Die direkte Voraussetzung „Punkte an Ebenen spiegeln“ weist auf einen Ebenenspiegelungsfall hin, belegt aber nicht, dass der allgemeinere Titel nur diesen meint; die aktuelle Beschreibung vermeidet ebenfalls eine Festlegung. Der HMKB-Quellenverweis ist ohne Wortlaut nicht genug, diese Mehrdeutigkeit zu lösen. Eine konkrete Ersatzbeschreibung würde somit nicht gedeckten Scope erfinden.',
    understandingEvidence: evidence(
      'Bei Spiegelung einer Geraden an einer festgelegten Ebene entstehen die Bildgerade aus den Bildern zweier verschiedener Geradenpunkte; die Verbindung jedes Punktes mit seinem Bild steht senkrecht zur Spiegelebene und wird von ihr halbiert. Ohne festgelegtes Spiegelungsobjekt ist die Abbildung nicht eindeutig.',
      'When a line is reflected in a specified plane, its image line is determined by the images of two distinct points on it; each point–image segment is perpendicular to the mirror plane and bisected by it. Without a specified mirror object, the map is not unique.',
      'Für eine unabhängig vorgegebene Gerade und ausdrücklich benannte Spiegelebene spiegelt die lernende Person zwei geeignete Punkte mit Lotbedingungen, legt dadurch die Bildgerade fest und prüft die Mittelpunkte und Orthogonalität der Punkt-Bildpunkt-Strecken.',
      'For an independently supplied line and explicitly named mirror plane, the learner reflects two suitable points using perpendicular-foot conditions, determines the image line, and checks the midpoints and orthogonality of point–image segments.',
      'Bei einer neuen Geraden, die die Spiegelebene schneidet, erkennt die lernende Person den Schnittpunkt als Fixpunkt, wählt nur einen weiteren nicht festen Punkt und prüft, dass eine Achsendrehung um eine Raumgerade nicht mit der Ebenenspiegelung verwechselt wird.',
      'For a fresh line intersecting the mirror plane, the learner recognizes the intersection as a fixed point, chooses one further nonfixed point, and checks that an axial half-turn about a spatial line is not confused with reflection in a plane.'),
  },
  '985d5529-a586-50eb-bd7f-2db2be8906d1': {
    decision: 'block',
    rationale: 'Auch „Ebenen in allgemeinen Raumkonfigurationen spiegeln“ benennt die Spiegelungsfläche, den Spiegelungspunkt oder eine andere Achse nicht. Dies sind verschiedene Transformationen, obwohl alle eine Bildebene erzeugen können; die vorausgesetzte Punktspiegelung an Ebenen legt den allgemeinen Titel nicht verbindlich auf eine Ebenenspiegelung fest. Die gebundene Quelle enthält nur die HMKB-Fundstelle, keinen Wortlaut. Erst nach Klärung des Spiegelungsobjekts lässt sich eine fachlich genaue, bilinguale Beschreibung verantworten.',
    understandingEvidence: evidence(
      'Bei Spiegelung einer Ebene an einer festgelegten Spiegelebene werden geeignete, nicht kollineare Punkte der Ausgangsebene punktweise gespiegelt; ihre Bildpunkte bestimmen die Bildebene. Punkte der Schnittgeraden beider Ebenen bleiben fest, und Lot-/Halbierungsbedingungen kennzeichnen die Spiegelung.',
      'When a plane is reflected in a specified mirror plane, suitable noncollinear points of the original plane are reflected pointwise; their images determine the image plane. Points on the intersection of the two planes remain fixed, and perpendicular/bisection conditions characterize the reflection.',
      'Für eine unabhängig gegebene Ausgangs- und ausdrücklich benannte Spiegelebene konstruiert die lernende Person Bildpunkte für drei nicht kollineare Ausgangspunkte, bestimmt die Bildebene und prüft Fixpunkte beziehungsweise Lotbedingungen.',
      'For an independently supplied original plane and explicitly named mirror plane, the learner constructs images of three noncollinear original points, determines the image plane, and checks fixed points or perpendicular conditions.',
      'In einem neuen Fall steht die Ausgangsebene senkrecht statt parallel zur Spiegelebene: Die lernende Person erkennt die gemeinsame Schnittgerade als Fixgerade und erklärt, warum eine Spiegelung an einem Punkt im Raum im Allgemeinen eine andere Bildebene liefern würde.',
      'In a fresh case, the original plane is perpendicular rather than parallel to the mirror plane: the learner identifies the common intersection as a fixed line and explains why reflection in a point in space would generally produce a different image plane.'),
  },
}

const keys = [
  'goalId', 'goalFingerprint', 'pageFingerprint',
  'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn',
]
const runId = `${batch.batchId}.codex-independent-b`
const records = input.goals.map((goal, index) => {
  for (const key of keys) {
    if (goal[key] !== lines[index].goal[key]) throw new Error(`Round B page/input mismatch: ${goal.goalId} ${key}`)
  }
  const judgment = judgments[goal.goalId]
  if (!judgment || goal.reviewContext.evidenceProfile !== null) throw new Error(`Round B scope/P-context changed: ${goal.goalId}`)
  return {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1,
    recordId: `${runId}.${String(index + 1).padStart(3, '0')}`,
    runId,
    campaignId: campaign.campaignId,
    roundId: campaign.roundId,
    bundleFingerprint: campaign.bundleFingerprint,
    bookDigest: campaign.bookDigest,
    ...Object.fromEntries(keys.map((key) => [key, goal[key]])),
    decision: judgment.decision,
    understandingEvidence: judgment.understandingEvidence,
    rationale: judgment.rationale,
    evidenceProfileContract: 'positive-understanding-evidence-v2',
    evidenceProfileRecommendation: 'create',
    recordStatus: 'candidate',
    reviewAuthority: 'ai_candidate',
  }
})
if (Object.keys(judgments).length !== records.length) throw new Error('Unassigned review judgment')
const recordsBytes = `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
const disclosure = {
  execution: 'Independent Codex subagent /root/rebind_two_imagegen_p authored blind Round B; exact serving model identifier not exposed',
  provider: 'openai',
  model: 'Codex; exact serving model identifier not exposed',
  modelVersion: null,
  samplingParameters: 'Not exposed by orchestration; none inferred',
  startedAt: '2026-09-27T17:19:10.000Z',
  timestampScope: 'Clock read during this Round B input review; exact provider execution start not exposed',
  independence: 'The six IDs did not overlap this reviewer’s prior D goals. Only the prepared Round B prompt, criteria, inputs and manifest were used; no six-goal Round A record, older D proposal, adjudication, synthesis or D registry was read. This is reviewer-output blindness, not model-provider diversity.',
  boundary: 'All six records are AI candidates; no human approval, complete source mapping, effective projection verification or canonical/registry mutation is claimed. Supplied visualization alt text was teaching context only, not learner evidence.',
}
const disclosureBytes = jsonBytes(disclosure)
const artifactDigest = (role) => bundle.artifacts.find((item) => item.role === role)?.digest
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
  role: 'subject_reviewer',
  promptFamilyId: 'goal-description-understanding-evidence-v2',
  promptFingerprint: campaign.promptFingerprint,
  criteriaFingerprint: campaign.criteriaFingerprint,
  generationParametersFingerprint: sha(disclosureBytes),
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherRuns: true,
  goalIds: batch.goalIds,
  inputArtifacts: [
    { role: 'book_pdf', digest: artifactDigest('book_pdf') },
    { role: 'review_markdown', digest: artifactDigest('review_markdown') },
    { role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint },
    { role: 'review_prompt', digest: campaign.promptFingerprint },
    { role: 'review_criteria', digest: campaign.criteriaFingerprint },
    { role: 'run_manifest_schema', digest: artifactDigest('run_manifest_schema') },
  ],
  startedAt: disclosure.startedAt,
  completedAt: new Date().toISOString(),
  status: 'completed',
  outputDigest: sha(recordsBytes),
  toolchainVersion: 'goal-description-review-v1',
}
if (run.inputArtifacts.some(({ digest }) => !digest)) throw new Error('Bound input artifact missing')
const files = [
  [`${round}/runtime-disclosure.json`, disclosureBytes],
  [`${round}/results/${batch.batchId}.records.jsonl`, recordsBytes],
  [`${round}/results/${batch.batchId}.run.json`, jsonBytes(run)],
]
process.stdout.write(`*** Begin Patch\n${files.map(([path, content]) =>
  `*** Add File: ${path}\n${content.trimEnd().split('\n').map((line) => `+${line}`).join('\n')}\n`
).join('')}*** End Patch\n`)
