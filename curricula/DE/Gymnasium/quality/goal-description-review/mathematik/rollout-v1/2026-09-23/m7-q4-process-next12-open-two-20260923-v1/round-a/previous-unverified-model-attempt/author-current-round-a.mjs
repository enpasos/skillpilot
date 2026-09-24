import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const sha = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const read = async (path) => JSON.parse(await readFile(path, 'utf8'))
const campaign = await read(join(here, 'description-review-campaign.json'))
const bundle = await read(join(here, 'review-bundle-manifest.json'))
const batch = campaign.batches[0]
const prefix = batch.batchId
const inputs = (await readFile(join(here, 'batches', `${prefix}.input.jsonl`), 'utf8'))
  .trim().split('\n').map(JSON.parse)
const judgments = [
  {
    id: 'fcb4cef1-b17a-5682-924c-41498fc6c9b2',
    decision: 'keep',
    de: [
      'Eine mathematische Aussage verbindet Voraussetzungen mit einer Schlussfolgerung; Variablen und Symbole behalten dabei ihren festgelegten Geltungsbereich und ihre Bedeutung.',
      'Die lernende Person formuliert eine vorgegebene mathematische Beziehung mit erkennbaren Bedingungen und einer Schlussfolgerung und verwendet eingeführte Variablen und Symbole konsistent.',
      'Bei einer neuen Aussage mit verändertem Geltungsbereich oder geänderter Schlussrichtung benennt sie die dafür nötigen Bedingungen und formuliert die Aussage passend, ohne eine Implikation unbemerkt als Äquivalenz darzustellen.'
    ],
    en: [
      'A mathematical statement connects assumptions to a conclusion; variables and symbols retain their defined domain and meaning throughout.',
      'The learner formulates a given mathematical relation with identifiable conditions and a conclusion, using introduced variables and symbols consistently.',
      'For a new statement with a changed domain or direction of inference, the learner states the necessary conditions and formulates it accordingly without silently turning an implication into an equivalence.'
    ],
    rationale: 'Die aktuelle Beschreibung nennt genau die zusammenhängende Leistung: Bedingungen, Schlussfolgerung und konsistente Notation. Sie ist als kurze, allgemeine Formulierungskompetenz verständlich; das Beispielbild ist keine Grundlage für die unabhängige Leistung. Eine Beweisführung oder ein bestimmtes Aussageformat wird nicht zusätzlich verlangt.'
  },
  {
    id: 'fde351a8-98b1-5d75-b4df-813beb2bbe3c',
    decision: 'keep',
    de: [
      'Gleichungen, Ungleichungen und Funktionen drücken verschiedene Beziehungen zwischen Größen aus: Gleichungen beschreiben Gleichheit, Ungleichungen Bedingungen oder Schranken und Funktionen ordnen zulässigen Eingaben Werte zu; Terme erhalten ihre Bedeutung aus dem Kontext.',
      'Die lernende Person formuliert für eine beschriebene Situation eine passende Beziehung zwischen Größen als Gleichung, Ungleichung oder Funktion und erläutert, wofür die darin vorkommenden Terme im Kontext stehen.',
      'In einer neuen Situation mit einer anderen Beziehungsform, etwa einer Obergrenze statt einer festen Gleichheit, wählt sie die passende Form und deutet die Terme weiterhin anhand der Größen und Annahmen des Kontexts.'
    ],
    en: [
      'Equations, inequalities, and functions express different relations between quantities: equations describe equality, inequalities express conditions or bounds, and functions assign values to admissible inputs; terms take their meaning from the context.',
      'For a described situation, the learner formulates a suitable relation between quantities as an equation, inequality, or function and explains what its terms represent in context.',
      'In a new situation with a different relation type, such as an upper bound instead of an exact equality, the learner chooses a suitable form and continues to interpret its terms using the quantities and assumptions in that context.'
    ],
    rationale: 'Titel und aktuelle Beschreibung fassen einen kohärenten Modellierungsschritt zusammen: eine Größenbeziehung in einer geeigneten mathematischen Form ausdrücken und die Terme sachlich deuten. Die Auswahl unter Gleichung, Ungleichung und Funktion ist kein unverbundener Methodenmix; sie bleibt an dieselbe Kontextbeziehung gebunden. Das vorhandene Bild wird nicht als Leistungsnachweis verwendet.'
  }
]

if (inputs.length !== judgments.length || inputs.some((input, i) => input.goal.goalId !== judgments[i].id)) {
  throw new Error('Judgments do not match the current bound batch order')
}

const runId = `${campaign.roundId}.run-001`
const deFields = ['essentialUnderstandingDe', 'observablePerformanceDe', 'transferExpectationDe']
const enFields = ['essentialUnderstandingEn', 'observablePerformanceEn', 'transferExpectationEn']
const records = judgments.map((judgment, index) => {
  const source = inputs[index].goal
  const understandingEvidence = Object.fromEntries([
    ...deFields.map((field, i) => [field, judgment.de[i]]),
    ...enFields.map((field, i) => [field, judgment.en[i]])
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
const resultsDirectory = join(here, 'results')
await mkdir(resultsDirectory, { recursive: true })
await writeFile(join(resultsDirectory, `${prefix}.records.jsonl`), outputBytes)
await writeFile(join(resultsDirectory, `${prefix}.run.json`), JSON.stringify(run, null, 2) + '\n')
console.log(`Authored ${records.length} current-binding candidate records for ${campaign.roundId}`)
