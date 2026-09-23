// Independent blind Round B authoring for the three newly bound PNG pages.
// Read only this round's supplied input/campaign and common bundle manifest;
// never import another round's decisions.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const parent = resolve(here, '..')
const campaign = JSON.parse(readFileSync(resolve(here, 'description-review-campaign.json')))
const bundle = JSON.parse(readFileSync(resolve(here, 'review-bundle-manifest.json')))
const batch = campaign.batches[0]
const inputPath = resolve(here, 'batches', `${batch.batchId}.input.jsonl`)
const inputBytes = readFileSync(inputPath)
const inputs = inputBytes.toString('utf8').trim().split('\n').map(JSON.parse)
const sha256 = bytes => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
if (sha256(inputBytes) !== batch.batchInputFingerprint || inputs.length !== 3) throw new Error('Bound Round B input differs')
if (bundle.bundleFingerprint !== campaign.bundleFingerprint || bundle.bookModelDigest !== campaign.bookDigest) throw new Error('Round B bundle differs')

const decisions = [
  {
    goalId: '8823e26e-694c-581b-9adf-4db7db6f43c9',
    decision: 'keep',
    rationale: 'Die aktuelle DE-/EN-Beschreibung unterscheidet das Zählen absoluter Ereignistreffer, ihren relativen Anteil und die daraus abgeleitete empirische Schätzung bereits präzise. Sie beansprucht keine exakte theoretische Wahrscheinlichkeit. Die neue PNG-Seite zeigt 6/10 und das Näherungszeichen konsistent, doch die Leistung muss an frischen Daten unabhängig erbracht werden. Der Wechsel zu anders großen Serien prüft die richtige Bezugsgröße, ohne eine Nachfolgerkompetenz hinzuzufügen.',
    understandingEvidence: {
      essentialUnderstandingDe: 'Die absolute Häufigkeit ist die Anzahl der Treffer eines festgelegten Ereignisses in n Versuchen; die relative Häufigkeit k/n setzt sie zur Versuchszahl ins Verhältnis. Dieser beobachtete Anteil kann eine empirische Wahrscheinlichkeit unter vergleichbaren Bedingungen schätzen, ist aber keine exakt bewiesene Modellwahrscheinlichkeit.',
      essentialUnderstandingEn: 'Absolute frequency counts occurrences of a specified event in n trials; relative frequency k/n relates them to the total number of trials. That observed proportion can estimate an empirical probability under comparable conditions, but is not an exactly proved model probability.',
      observablePerformanceDe: 'Die lernende Person legt bei einer neuen Versuchsliste das Ereignis und n fest, zählt k, berechnet k/n und erklärt die daraus formulierte Näherung für P(E) samt Datenbezug.',
      observablePerformanceEn: 'For a fresh trial list, the learner identifies the event and n, counts k, calculates k/n, and explains the resulting approximation for P(E) in relation to the data.',
      transferExpectationDe: 'Bei zwei unterschiedlich großen, vergleichbaren Versuchsserien fasst sie Treffer und Versuche getrennt zusammen und schätzt aus dem Gesamtanteil, statt die beiden Prozentwerte ungewichtet zu mitteln.',
      transferExpectationEn: 'For two comparable trial series of unequal sizes, the learner pools event counts and trial totals separately and estimates from the combined proportion rather than taking an unweighted average of the percentages.',
    },
  },
  {
    goalId: '7c978529-ce62-5adc-897f-24ea80babbc8',
    decision: 'keep',
    rationale: 'Die zweisprachige Beschreibung verbindet Einheitswürfel oder Kantenmaße, kubische Einheiten und den Vergleich erst nach nötiger Umrechnung zu einer kohärenten Volumenkompetenz. Das neue 12er-Quader/8er-Würfel-Bild trägt den Einheitswürfelzugang, gibt aber weder Maßeinheiten noch den frischen Transfer vor. Die nachfolgende Additivität zusammengesetzter Körper wird hier nicht hineingezogen.',
    understandingEvidence: {
      essentialUnderstandingDe: 'Ein Quader lässt sich lücken- und überlappungsfrei mit Einheitswürfeln füllen: Grundschicht mal Schichtzahl erklärt das Produkt dreier senkrechter Kantenlängen; für einen Würfel gilt entsprechend a³. Volumina werden in kubischen Einheiten angegeben und erst nach Umrechnung in eine gemeinsame Einheit verglichen.',
      essentialUnderstandingEn: 'A cuboid can be filled without gaps or overlaps by unit cubes: cubes per base layer times number of layers explains the product of three perpendicular edge lengths; for a cube this becomes a³. Volumes use cubic units and are compared only after conversion to a common unit.',
      observablePerformanceDe: 'Die lernende Person erklärt an einem neuen Würfelmodell oder anhand neuer Kantenmaße die drei Faktoren, bestimmt beide Körpervolumina mit korrekter kubischer Einheit und vergleicht sie nach gegebenenfalls erforderlicher Umrechnung.',
      observablePerformanceEn: 'Using a fresh unit-cube model or new edge measurements, the learner explains the three factors, determines both solid volumes with correct cubic units, and compares them after any necessary conversion.',
      transferExpectationDe: 'Bei einem gedreht dargestellten Quader und einem Würfel mit anders angegebenen Längeneinheiten erkennt sie weiterhin die drei senkrechten Kanten, rechnet die Einheiten konsistent um und begründet den Volumenvergleich unabhängig von der Bildgröße.',
      transferExpectationEn: 'For a rotated cuboid and a cube whose lengths use different units, the learner still identifies the three perpendicular edges, converts units consistently, and justifies the volume comparison independently of the apparent drawing size.',
    },
  },
  {
    goalId: 'e01869db-891c-57a4-8660-789ec6875ec2',
    decision: 'keep',
    rationale: 'Die Beschreibung nennt beide zulässigen Wege zur selben Volumenkompetenz als Alternativen und macht die entscheidenden Bedingungen vollständig, lücken- und überlappungsfrei bzw. genaues Ergänzungsvolumen sichtbar. Die Plausibilitätsprüfung bleibt an der Körperstruktur. Das neue 8+4-Stufenbild zeigt nur eine gültige Zerlegung; für den Transfer muss die lernende Person eine neue Kerbe oder Schnittführung eigenständig bearbeiten.',
    understandingEvidence: {
      essentialUnderstandingDe: 'Volumen ist additiv, wenn Teilquader den ganzen Körper ohne Lücken und Doppelzählung zerlegen. Alternativ ist das Restvolumen das Volumen eines umschließenden Quaders abzüglich genau der ergänzten Region; beide Wege müssen zur selben räumlichen Menge und einer plausiblen Größe führen.',
      essentialUnderstandingEn: 'Volume is additive when component cuboids partition the whole solid without gaps or double counting. Alternatively, the remaining volume is that of an enclosing cuboid minus exactly the complementary region; both approaches must represent the same spatial set and a plausible magnitude.',
      observablePerformanceDe: 'Die lernende Person wählt an einem neuen zusammengesetzten Körper eine passende Zerlegung oder Ergänzung, ordnet jeden Rechenterm einer konkreten disjunkten Region zu, berechnet das Volumen und prüft es gegen die sichtbare Körperstruktur.',
      observablePerformanceEn: 'For a fresh composite solid, the learner chooses a valid partition or completion, associates each calculation term with a concrete disjoint region, calculates the volume, and checks it against the solid structure.',
      transferExpectationDe: 'Bei einer veränderten Stufe oder quaderförmigen Kerbe wechselt sie die Schnittführung oder verwendet den umschließenden Quader, erkennt eine mögliche Überlappung bzw. Lücke und bestätigt die Größenordnung mit einem zweiten zulässigen Blick auf denselben Körper.',
      transferExpectationEn: 'For a changed step or cuboid notch, the learner changes the cut or uses an enclosing cuboid, detects any overlap or gap, and confirms the order of magnitude through a second valid view of the same solid.',
    },
  },
]

const runId = 'math-m7-three-new-png-binding-round-b-20260923-v1'
const records = decisions.map((decision, index) => {
  const bound = inputs[index]
  const goal = bound.goal
  if (decision.goalId !== goal.goalId || bound.batchId !== batch.batchId) throw new Error(`Round B order or batch changed at ${index}`)
  return {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1,
    recordId: `math-m7-three-png-b-${String(index + 1).padStart(3, '0')}`,
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
  if (!found) throw new Error(`Missing bundle artifact ${role}`)
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
  model: 'Codex agent; exact model identifier and sampling parameters not exposed; independent blind round B, no different-model claim',
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
  startedAt: '2026-09-23T02:42:56.000Z',
  completedAt: '2026-09-23T02:44:15.000Z',
  status: 'completed',
  outputDigest: sha256(outputBytes),
  toolchainVersion: 'codex-agent-description-review-v2',
}
const resultDir = resolve(here, 'results')
writeFileSync(resolve(resultDir, `${batch.batchId}.records.jsonl`), outputBytes, { flag: 'wx' })
writeFileSync(resolve(resultDir, `${batch.batchId}.run.json`), `${JSON.stringify(run, null, 2)}\n`, { flag: 'wx' })
process.stdout.write(`Wrote blind Round B for ${records.length} goals: ${outputBytes.length} bytes; digest ${run.outputDigest}\n`)
