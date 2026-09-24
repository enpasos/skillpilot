// Independent first pass B: only the bound B batch, campaign and bundle are read.
// Do not load round A results, prior D records or adjudications here.
import { createHash } from 'node:crypto'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const roundRoot = dirname(fileURLToPath(import.meta.url))
const bundleRoot = join(roundRoot, '..', 'bundle')
const campaign = JSON.parse(readFileSync(join(roundRoot, 'description-review-campaign.json'), 'utf8'))
const bundle = JSON.parse(readFileSync(join(bundleRoot, 'manifest.json'), 'utf8'))
const batch = campaign.batches[0]
const batchPath = join(roundRoot, 'batches', `${batch.batchId}.input.jsonl`)
const batchInput = readFileSync(batchPath, 'utf8')
const goals = batchInput.trimEnd().split('\n').map((line) => JSON.parse(line).goal)
const sha256 = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const runId = 'math-m7-seven-png-d-b-20260924-codex-1'

// These judgments were written from the current seven-page B bundle. The
// illustration supports teaching but is not a learner-performance result.
const judgments = {
  'b431148b-526c-4bde-b04b-48d23101d0d3': {
    decision: 'keep',
    understandingEvidence: {
      essentialUnderstandingDe: 'Eine annähernde Normalverteilung ist eine begründete Modellentscheidung: Viele hinreichend unabhängige Beiträge oder Bernoulli-Versuche mit genügend erwarteten Treffern und Nichttreffern können eine annähernd symmetrische Verteilung ergeben; seltene Treffer mit np nahe 1 bleiben deutlich schief. Eine glockenartige Beobachtung allein beweist das Modell nicht.',
      essentialUnderstandingEn: 'Approximate normality is a reasoned modelling judgement: many sufficiently independent contributions, or Bernoulli trials with enough expected successes and failures, may produce a roughly symmetric distribution; rare successes with np near 1 remain markedly skewed. A bell-like observation alone does not prove the model.',
      observablePerformanceDe: 'Die lernende Person vergleicht eigenständig die Mechanismen zweier Zufallsgrößen, etwa 100 faire Münzwürfe und 100 unabhängige Versuche mit Trefferchance 0,01, erläutert die Rolle von Unabhängigkeit sowie np und n(1−p), und begründet, warum eine Normalnäherung im seltenen Trefferfall unpassend ist.',
      observablePerformanceEn: 'The learner independently compares the mechanisms of two random variables, such as 100 fair coin tosses and 100 independent trials with success probability 0.01, explains the roles of independence, np and n(1−p), and justifies why a normal approximation is unsuitable for the rare-success count.',
      transferExpectationDe: 'Bei einem neuen Fall unterscheidet die lernende Person die Summe vieler kleiner, annähernd unabhängiger Messabweichungen von der Anzahl seltener Störfälle und entscheidet mit ausdrücklich genannten Modellannahmen, wo eine Normalnäherung plausibel ist; sie urteilt nicht bloß nach der gezeichneten Kurvenform.',
      transferExpectationEn: 'In a fresh case, the learner distinguishes a sum of many small, approximately independent measurement errors from a count of rare incidents and decides, with explicit modelling assumptions, where a normal approximation is plausible rather than judging only by a drawn curve.'
    },
    rationale: 'DE und EN verlangen bereits eine begründete Plausibilitätsentscheidung, nicht bloß das Wiedererkennen einer Glocke. Das aktuelle Bild zeigt den fairen und den seltenen Bernoulli-Fall fachlich passend; np=1 erklärt den Gegenfall. Die Abbildung ist Lehrhilfe, kein Leistungsnachweis. Ein gebundenes V2-Evidenzprofil fehlt und sollte erstellt werden; effektive LK-Projektion und Quellenbeleg sind in dieser B-Bindung nicht separat nachgewiesen.'
  },
  '502ecaa7-cca6-5c51-a1cc-da09a7b2382c': {
    decision: 'keep',
    understandingEvidence: {
      essentialUnderstandingDe: 'Die Definitionsmenge bezeichnet die zulässigen Eingaben einer einzelnen reellwertigen Funktion; Term, Graph und Sachkontext liefern jeweils eigene Einschränkungen. Ein verbotener Nennerwert, offene oder geschlossene Graphenränder und physikalisch sinnvolle Zeiten werden verschieden begründet und in Mengenschreibweise ausgedrückt.',
      essentialUnderstandingEn: 'The domain is the set of admissible inputs for an individual real-valued function; a term, graph and real-world context each impose their own restrictions. A forbidden denominator value, open or closed graph endpoints, and physically meaningful times require different justifications expressed in set notation.',
      observablePerformanceDe: 'Die lernende Person bestimmt und begründet eigenständig die drei getrennten Fälle f(x)=1/(x−3), den nur auf [1,4) gezeichneten konstanten Graphen und eine Weg-Zeit-Funktion mit t≥0; sie vermengt diese nicht zu einer vermeintlich gemeinsamen Funktion.',
      observablePerformanceEn: 'The learner independently determines and justifies three separate cases: f(x)=1/(x−3), a constant graph drawn only on [1,4), and a distance-time function with t≥0; they do not merge these into one supposed function.',
      transferExpectationDe: 'Für ein neues Zeitmodell mit dem Term √(5−t) bestimmt die lernende Person die Schnittmenge aus algebraischer Bedingung und Sachbedingung t≥0 als [0,5] und begründet beide Grenzen; das ist mehr als das Ablesen eines bekannten Einzelbeispiels.',
      transferExpectationEn: 'For a new time model with the expression √(5−t), the learner intersects the algebraic restriction with the contextual requirement t≥0 to obtain [0,5] and justifies both bounds, going beyond reading off one familiar example.'
    },
    rationale: 'Die zweisprachige Beschreibung benennt Term, Graph und Sachkontext sowie die nötige fachsprachliche Begründung klar und kompakt. Die drei Bildfelder sind getrennte, mathematisch stimmige Beispiele mit korrekten Randkonventionen; sie belegen keine eigenständige Leistung. Der angegebene HE-E.1-Quellenverweis ist Kontext, kein hier separat geprüfter Quellenauszug. Mangels gebundenem V2-Profil lautet die Empfehlung create.'
  },
  '1e77bb2f-0cd6-5961-b0fb-230317c73fce': {
    decision: 'keep',
    understandingEvidence: {
      essentialUnderstandingDe: 'Beim Prisma ist G der Flächeninhalt einer Grundfläche und h der senkrechte Abstand der parallelen Grundflächen. Kongruente Querschnitte erklären V=G·h; die Multiplikation von Flächeneinheit und Längeneinheit ergibt eine Volumeneinheit.',
      essentialUnderstandingEn: 'For a prism, G is the area of one base and h is the perpendicular distance between its parallel bases. Congruent cross-sections explain V=G·h; multiplying an area unit by a length unit gives a volume unit.',
      observablePerformanceDe: 'Die lernende Person markiert in einer unbekannten Prismenskizze die Grundfläche und die senkrechte Höhe, berechnet daraus G und V mit cm³ und erklärt, warum eine schräge Seitenkante nicht ohne Weiteres als h eingesetzt werden darf.',
      observablePerformanceEn: 'In an unfamiliar prism sketch, the learner identifies the base area and perpendicular height, calculates G and V with cubic units, and explains why a slanted side edge cannot automatically be substituted for h.',
      transferExpectationDe: 'Bei einem schiefen Dreiecksprisma aus Koordinaten bestimmt die lernende Person erst den Flächeninhalt des Dreiecks und den senkrechten Ebenenabstand, bevor sie V=G·h anwendet; die neue Darstellung verlangt mehr als den Austausch der Maße des Quaders.',
      transferExpectationEn: 'For an oblique triangular prism specified by coordinates, the learner first determines the triangular base area and perpendicular plane separation before applying V=G·h; this changed representation requires more than replacing the dimensions of a rectangular prism.'
    },
    rationale: 'DE und EN verbinden eine geometrische Erklärung mit Anwendung aus Skizze oder Koordinaten und korrekten Einheiten; die Kompetenz wird nicht auf Formelsammlungseinsatz reduziert. Das aktuelle Bild zeigt G=20 cm², die senkrechte Höhe 7 cm, gleiche Querschnitte und V=140 cm³ konsistent. Die Bildrechnung ist Illustration, keine Transferprüfung. Kein aktuelles V2-Evidenzprofil ist gebunden; create.'
  },
  '288633c1-f61c-5b48-af7e-a80357f96cad': {
    decision: 'keep',
    understandingEvidence: {
      essentialUnderstandingDe: 'Eine Pyramide hat bei gleicher Grundfläche G und derselben senkrechten Höhe h ein Drittel des Volumens des entsprechenden Prismas. Der Faktor 1/3 ist ein Volumenverhältnis und keine Behauptung, dass drei beliebige Pyramiden die Vergleichsfigur lückenlos zerlegen.',
      essentialUnderstandingEn: 'A pyramid has one third of the volume of the corresponding prism when base area G and perpendicular height h are the same. The factor 1/3 is a volume ratio, not a claim that any three pyramids tile the comparison solid.',
      observablePerformanceDe: 'Die lernende Person identifiziert in einer neuen Pyramidenzeichnung die Grundfläche und die senkrechte Körperhöhe, vergleicht mit einem Prisma gleichen G und h und erklärt eigenständig den Faktor 1/3 sowie die resultierende Volumeneinheit.',
      observablePerformanceEn: 'In a new pyramid drawing, the learner identifies the base area and perpendicular solid height, compares with a prism having the same G and h, and independently explains the factor 1/3 and the resulting volume unit.',
      transferExpectationDe: 'Aus Koordinaten einer Dreieckspyramide mit seitlich versetzter Spitze bestimmt die lernende Person die Dreiecksfläche und den senkrechten Abstand zur Grundebene und nutzt dann das Verhältnis zum Vergleichsprisma; die Seitenkante ersetzt die Höhe nicht.',
      transferExpectationEn: 'From coordinates of a triangular pyramid with an off-centre apex, the learner determines the triangular base area and perpendicular distance to the base plane, then uses the ratio to the matching prism; the lateral edge does not replace the height.'
    },
    rationale: 'Beide Beschreibungen benennen den Vergleich bei gleichem G und h und die Anwendung aus Skizze oder Koordinaten präzise. Auf der aktuellen Seite ergeben 6×6 cm², h=9 cm, 324 cm³ und 108 cm³ das richtige Drittel. Die Volumenplättchen sind eine Zahlenanalogie, keine geometrische Zerlegung; das Bild belegt keine Lernleistung. Gebundenes V2-Profil fehlt, daher create.'
  },
  'c71ae268-f28e-59f0-982d-91db8f963378': {
    decision: 'keep',
    understandingEvidence: {
      essentialUnderstandingDe: 'Die Grundfläche eines Zylinders ist ein Kreis mit Fläche πr²; r ist die Strecke von der Kreismitte zum Rand, nicht der Durchmesser. Die entlang der senkrechten Höhe h gleich großen Kreisquerschnitte tragen die Beziehung V=πr²h.',
      essentialUnderstandingEn: 'A cylinder has a circular base of area πr²; r is the distance from the circle centre to its boundary, not the diameter. Equal circular cross-sections along the perpendicular height h support V=πr²h.',
      observablePerformanceDe: 'Die lernende Person identifiziert in einer Skizze unabhängig Radius und senkrechte Höhe, erklärt die Kreisfläche als G, berechnet V mit kubischer Einheit und begründet, warum der Durchmesser nicht direkt quadriert werden darf.',
      observablePerformanceEn: 'The learner independently identifies radius and perpendicular height in a sketch, explains the circle area as G, calculates V with cubic units, and justifies why the diameter must not be squared directly.',
      transferExpectationDe: 'Bei einer koordinatenbasierten Zylinderaufgabe sind Grundkreisdurchmesser und Abstand zweier paralleler Ebenen gegeben; die lernende Person gewinnt daraus zuerst r und h und erklärt das Volumen über konstante Querschnitte statt die Maße des Bildbeispiels nur auszutauschen.',
      transferExpectationEn: 'In a coordinate-based cylinder task giving the base diameter and the distance between two parallel planes, the learner first derives r and h and explains the volume through constant cross-sections rather than merely replacing the image example’s numbers.'
    },
    rationale: 'Der DE-/EN-Text beansprucht die Deutung der Kreisfläche und die Volumenanwendung aus Skizzen oder Koordinaten; er bleibt auf ein Ziel begrenzt. Das aktuelle Bild kennzeichnet r=3 cm und senkrechtes h=10 cm und zeigt G=9π cm² sowie V=90π cm³ korrekt. Die Scheiben sind Lehrmodell, kein selbstständiger Leistungsnachweis. Kein gebundenes V2-Profil; create.'
  },
  'e8237315-654e-5150-97de-49c4cb49b3d1': {
    decision: 'keep',
    understandingEvidence: {
      essentialUnderstandingDe: 'Das Kegelvolumen ist ein Drittel des Volumens des entsprechenden Zylinders mit gleichem Grundkreisradius und derselben senkrechten Höhe. Die Mantellinie ist nicht die Körperhöhe; aus G=πr² folgt V=(1/3)πr²h.',
      essentialUnderstandingEn: 'A cone has one third of the volume of the corresponding cylinder with the same base radius and perpendicular height. Slant height is not the solid height; G=πr² leads to V=(1/3)πr²h.',
      observablePerformanceDe: 'Die lernende Person vergleicht einen unbekannten Kegel und Zylinder bei gleichem r und h, berechnet erst das Zylindervolumen und begründet daraus eigenständig das Kegelvolumen; sie zeigt in der Skizze die senkrechte Höhe statt der Mantellinie.',
      observablePerformanceEn: 'The learner compares an unfamiliar cone and cylinder with equal r and h, first finds the cylinder volume and independently justifies the cone volume from it; in the sketch they identify perpendicular height rather than slant height.',
      transferExpectationDe: 'Ein neuer Kegel wird durch Grundkreisdurchmesser und Mantellinie dargestellt. Die lernende Person bestimmt über den rechtwinkligen Achsenschnitt erst Radius und senkrechte Höhe und vergleicht dann mit dem zugehörigen Zylinder, statt die schräge Länge als h zu übernehmen.',
      transferExpectationEn: 'A new cone is represented by its base diameter and slant height. Using the right-triangle axial section, the learner first obtains radius and perpendicular height and then compares with the matching cylinder, rather than inserting the sloping length as h.'
    },
    rationale: 'Beide Kurztexte deuten das Drittelverhältnis zum entsprechenden Zylinder und verwenden r und h in Skizzen/Koordinaten ohne unbeanspruchte Zusatzmethode. Die aktuelle Seite vergleicht gleiche r=3 cm und senkrechte h=12 cm: 108π zu 36π cm³ stimmt. Die Mantellinie wird nicht als Höhe behandelt; das Beispiel ersetzt keine unabhängige Transferprüfung. Ein V2-Profil ist nicht gebunden, also create.'
  },
  '2f2c9f1a-07f0-59e4-b84a-60648c3b0bda': {
    decision: 'keep',
    understandingEvidence: {
      essentialUnderstandingDe: 'Der Kugelradius reicht vom Mittelpunkt zur Oberfläche; Kugelvolumen hängt kubisch von ihm ab: V=(4/3)πr³. Wird jede Länge mit k skaliert, wird das Volumen mit k³ skaliert; die ebene Bildfläche begründet dieses räumliche Verhältnis nicht.',
      essentialUnderstandingEn: 'A sphere’s radius runs from its centre to its surface; sphere volume depends cubically on it: V=(4/3)πr³. Scaling every length by k scales volume by k³; the area of a flat drawing does not establish this spatial ratio.',
      observablePerformanceDe: 'Die lernende Person identifiziert aus einer neuen Skizze oder aus Koordinaten den Radius, berechnet das Kugelvolumen mit cm³ und erklärt unabhängig, weshalb eine Radiusverdoppelung das Volumen verachtfacht und nicht nur verdoppelt oder vervierfacht.',
      observablePerformanceEn: 'The learner identifies the radius from a new sketch or coordinates, calculates sphere volume in cubic units, and independently explains why doubling radius multiplies volume by eight, not by two or four.',
      transferExpectationDe: 'Bei einer neuen Kugel ist zunächst nur der Durchmesser angegeben und ein Modell wird in allen Längen um den Faktor 3/2 vergrößert. Die lernende Person halbiert erst den Durchmesser zum Radius und leitet für das neue Volumen den Faktor 27/8 her, statt nur die beiden Bildradien einzusetzen.',
      transferExpectationEn: 'For a new sphere, only the diameter is given and a model is enlarged by a factor of 3/2 in every length. The learner first halves the diameter to get the radius and derives a volume factor of 27/8, rather than merely substituting the two radii shown in the image.'
    },
    rationale: 'Die DE-/EN-Beschreibung trennt kubische Radiusabhängigkeit und Volumenbestimmung aus Skizze/Koordinaten klar. Das aktuelle Bild nutzt Radien 3 und 6 cm, ergibt 36π und 288π cm³ und illustriert den Faktor 8 stimmig; es ist keine 2D-Flächenbegründung oder Lernleistung. Ein gebundenes V2-Evidenzprofil fehlt; create.'
  }
}

if (goals.length !== batch.goalIds.length || goals.some((goal, index) => goal.goalId !== batch.goalIds[index])) {
  throw new Error('B goal order differs from the bound campaign batch')
}
if (sha256(Buffer.from(batchInput)) !== batch.batchInputFingerprint) {
  throw new Error('B batch input changed after review')
}
const records = goals.map((goal) => {
  const judgment = judgments[goal.goalId]
  if (!judgment) throw new Error(`Missing independent B judgment for ${goal.goalId}`)
  return {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1,
    recordId: `${runId}:${goal.goalId}`,
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
    decision: judgment.decision,
    understandingEvidence: judgment.understandingEvidence,
    rationale: judgment.rationale,
    evidenceProfileContract: 'positive-understanding-evidence-v2',
    evidenceProfileRecommendation: 'create',
    recordStatus: 'candidate',
    reviewAuthority: 'ai_candidate'
  }
})
const recordsBytes = Buffer.from(`${records.map((record) => JSON.stringify(record)).join('\n')}\n`)
const artifactRoles = ['book_model', 'book_pdf', 'review_markdown', 'review_prompt', 'review_criteria', 'run_manifest_schema']
const inputArtifacts = artifactRoles.map((role) => {
  const artifact = bundle.artifacts.find((entry) => entry.role === role)
  if (!artifact) throw new Error(`Missing bundle artifact ${role}`)
  return { role, digest: artifact.digest }
})
inputArtifacts.push({ role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint })
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
  model: 'Codex (exact model identifier unavailable)',
  role: 'subject_reviewer',
  promptFamilyId: 'goal-description-understanding-evidence-review-v2',
  promptFingerprint: campaign.promptFingerprint,
  criteriaFingerprint: campaign.criteriaFingerprint,
  generationParametersFingerprint: sha256('runtime parameters not exposed'),
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherRuns: true,
  goalIds: batch.goalIds,
  inputArtifacts,
  startedAt: '2026-09-24T02:36:36Z',
  completedAt: new Date().toISOString(),
  status: 'completed',
  outputDigest: sha256(recordsBytes),
  toolchainVersion: 'codex-blind-description-review-b-v1'
}
const outputDir = join(roundRoot, 'results')
mkdirSync(outputDir, { recursive: true })
writeFileSync(join(outputDir, `${batch.batchId}.records.jsonl`), recordsBytes)
writeFileSync(join(outputDir, `${batch.batchId}.run.json`), `${JSON.stringify(run, null, 2)}\n`)
console.log(`Materialized ${records.length} blind B candidates: ${run.outputDigest}`)
