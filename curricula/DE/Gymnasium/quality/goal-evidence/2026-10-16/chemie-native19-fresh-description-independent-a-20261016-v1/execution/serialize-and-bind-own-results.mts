import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve, relative } from 'node:path'
import { pathToFileURL } from 'node:url'

const repo = process.cwd()
const own = resolve(repo, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-native19-fresh-description-independent-a-20261016-v1')
const native = resolve(repo, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-current429-nineteen-current-profile-pages-native-technical-20261016-v1/native-nineteen')
const round = resolve(native, 'round-a')
const { stableGoalBookJson } = await import(pathToFileURL(resolve(repo, 'app/scripts/goalBookModel.ts')).href)
const digest = (bytes: string | Buffer) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const readJson = async (path: string) => JSON.parse(await readFile(path, 'utf8'))
const emitJson = async (path: string, value: unknown) => {
  const bytes = JSON.stringify(value, null, 2) + '\n'
  JSON.parse(bytes)
  await writeFile(path, bytes)
}

const input = await readJson(resolve(round, 'description-review-input.json'))
const campaign = await readJson(resolve(round, 'description-review-campaign.json'))
const bundle = await readJson(resolve(round, 'review-bundle-manifest.json'))
const ownJudgments = await readJson(resolve(own, 'review-notes/individual-judgments.actual-agent-inference.json'))
if (ownJudgments.length !== 19 || input.goals.length !== 19) throw new Error('Expected exactly nineteen individually authored decisions')
const batch = campaign.batches[0]
const runId = 'chemie-native19-fresh-description-independent-a-20261016-v1-run-001'
const capturedStart = '2026-10-16T02:42:17Z'
const completedAt = new Date().toISOString()
const parameters = {
  executionMode: 'actual independent interactive Codex AgentInference',
  taskIdentity: '/root/chemie_native19_fresh_description_a_20261016',
  modelFamilyFromInstructions: 'GPT-6',
  exactRuntimeModelIdentifier: null,
  exactModelVersion: null,
  temperature: null,
  topP: null,
  seed: null,
  samplingConfiguration: 'not exposed by the current interactive agent runtime',
  externalModelOrProviderRunInvoked: false,
  scientificDecisionSource: 'Nineteen individually formulated decisions in this live independent agent turn; no imported review records or generated constant verdict',
  knownTimestampBoundary: 'The first exact UTC capture occurred after preparatory reading. The run interval records continued reading, actual decision authoring and serialization from that capture; the earlier preparatory start time is not known exactly.'
}
const records = input.goals.map((goal: any, index: number) => {
  const j = ownJudgments[index]
  if (j.page !== index + 1) throw new Error('Individual judgment order mismatch')
  const record: any = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1,
    recordId: `chemie-native19-fresh-da-20261016-v1-${String(index + 1).padStart(2, '0')}`,
    runId,
    campaignId: campaign.campaignId,
    roundId: campaign.roundId,
    bundleFingerprint: input.bundleFingerprint,
    bookDigest: input.bookDigest,
    goalId: goal.goalId,
    goalFingerprint: goal.goalFingerprint,
    pageFingerprint: goal.pageFingerprint,
    currentTitleDe: goal.currentTitleDe,
    currentTitleEn: goal.currentTitleEn,
    currentDescriptionDe: goal.currentDescriptionDe,
    currentDescriptionEn: goal.currentDescriptionEn,
    decision: j.decision,
    understandingEvidence: {
      essentialUnderstandingDe: j.essentialDe,
      essentialUnderstandingEn: j.essentialEn,
      observablePerformanceDe: j.performanceDe,
      observablePerformanceEn: j.performanceEn,
      transferExpectationDe: j.transferDe,
      transferExpectationEn: j.transferEn,
    },
    rationale: j.rationale,
    evidenceProfileContract: 'positive-understanding-evidence-v2',
    evidenceProfileRecommendation: j.profileRecommendation,
    recordStatus: 'candidate',
    reviewAuthority: 'ai_candidate',
  }
  if (j.decision === 'revise') {
    record.proposedDescriptionDe = j.proposedDe
    record.proposedDescriptionEn = j.proposedEn
  }
  return record
})
// The official stable JSON serializer only transports the nineteen decisions above.
const recordsBytes = records.map((r: unknown) => stableGoalBookJson(r)).join('\n') + '\n'
const reparsed = recordsBytes.trimEnd().split('\n').map((line: string) => JSON.parse(line))
if (reparsed.length !== 19) throw new Error('Actual JSONL line count mismatch')
const resultBase = resolve(own, 'results', batch.batchId)
await writeFile(`${resultBase}.records.jsonl`, recordsBytes)
await emitJson(resolve(own, 'execution/generation-parameters.truthful.json'), parameters)
const manifest = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
  schemaVersion: 1,
  runId,
  campaignId: campaign.campaignId,
  roundId: campaign.roundId,
  batchId: batch.batchId,
  batchInputFingerprint: batch.batchInputFingerprint,
  bundleFingerprint: input.bundleFingerprint,
  bookDigest: input.bookDigest,
  provider: 'OpenAI Codex interactive agent; actual AgentInference',
  model: 'GPT-6 family; exact runtime model identifier not exposed',
  modelVersion: 'exact runtime model version not exposed',
  role: 'subject_reviewer',
  promptFamilyId: 'goal-description-understanding-evidence-v2',
  promptFingerprint: campaign.promptFingerprint,
  criteriaFingerprint: campaign.criteriaFingerprint,
  generationParametersFingerprint: digest(stableGoalBookJson(parameters)),
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherRuns: true,
  goalIds: batch.goalIds,
  inputArtifacts: [
    ...bundle.artifacts.filter((a: any) => ['book_model', 'book_pdf', 'book_pdf_render_manifest', 'book_html', 'book_html_render_manifest', 'review_prompt', 'review_criteria'].includes(a.role)).map(({ role, digest }: any) => ({ role, digest })),
    { role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint },
  ],
  startedAt: capturedStart,
  completedAt,
  status: 'completed',
  outputDigest: digest(recordsBytes),
  toolchainVersion: 'codex-AgentInference-stock-D-v1',
}
await emitJson(`${resultBase}.run.json`, manifest)

const indexPath = resolve(repo, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-native19-current-material-locations-neutral-technical-20261016-v1/INDEX.neutral-current-whole-case-material-locations.no-review.json')
const locator = await readJson(indexPath)
const pins = new Map<string, any>()
for (const row of locator.rows) for (const loc of row.materialLocations) {
  const bytes = await readFile(resolve(repo, loc.file.path))
  if (digest(bytes) !== loc.file.sha256) throw new Error(`Material drift: ${loc.file.path}`)
  pins.set(loc.file.path, { path: loc.file.path, sha256: digest(bytes), bytes: bytes.length })
}
const pages = []
for (let page = 3; page <= 21; page++) {
  const path = `tmp/chemie-m7-resumed-20261016/current578-one-sparse-host/Native19-actual-page-captures/page-${String(page).padStart(2, '0')}.png`
  const bytes = await readFile(resolve(repo, path))
  pages.push({ physicalPdfPage: page, goalPage: page - 2, sha256: digest(bytes), pixelsActuallyViewed: true })
}
await emitJson(resolve(own, 'review-notes/actual-review-scope-and-input-pins.json'), {
  reviewerTaskIdentity: parameters.taskIdentity,
  authority: 'independent AI candidate only',
  currentInputPath: relative(repo, round),
  nativeBundlePath: relative(repo, resolve(native, 'bundle')),
  nativeGoalCount: 19,
  fullCurriculumCountContextOnly: 429,
  inputBundleFingerprint: input.bundleFingerprint,
  neutralMaterialIndex: { path: relative(repo, indexPath), sha256: digest(await readFile(indexPath)) },
  wholeCurrentMaterialFilesHashVerified: [...pins.values()],
  wholeCasePointersActuallyRead: locator.rows,
  actualPdfPagesViewed: pages,
  html: 'All nineteen complete goal article bodies and their image source/alt attributes read from the actual book.html; PDF captures supply the actual complete page/image pixels. No additional book rendering was performed.',
  blindness: 'No round-b results, earlier independent D outputs, root scientific findings or standalone author verdicts were read. Current bound P profiles include provenance/reason metadata, encountered with the supplied input and treated as context only, never imported as a D judgment. The neutral index only located current whole case bodies.',
  sourceBoundary: 'No official source document or effective composition projection was independently verified by this D review. Findings concern the supplied current descriptions, contexts, profiles, whole task materials and rendered pages.',
  evidenceBoundary: 'E0/G0 authored or synthetic cases remain designs. No learner work, laboratory execution, human approval, human trial or host acceptance was observed or granted.',
  HumanApproval: false,
  HumanTrial: false,
})
console.log(JSON.stringify({ runId, recordCount: records.length, counts: records.reduce((a: any, r: any) => ({ ...a, [r.decision]: (a[r.decision] ?? 0) + 1 }), {}), outputDigest: manifest.outputDigest, completedAt }, null, 2))
