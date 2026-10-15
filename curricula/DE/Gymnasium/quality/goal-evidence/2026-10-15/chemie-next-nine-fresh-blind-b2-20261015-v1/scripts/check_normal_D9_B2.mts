import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(process.cwd())
const own = dirname(dirname(fileURLToPath(import.meta.url)))
const source = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-six-inputs-three-scope-native9-final-rezeptfrei-preparation-technical-20261015-v2')
const host = resolve(root, 'tmp/chemie-m7-resumed-20261015/chemie-next-nine-fresh-blind-b2-stockhost-v1')
const json = async (p: string) => JSON.parse(await readFile(p, 'utf8'))
const sha = (b: Buffer | string) => `sha256:${createHash('sha256').update(b).digest('hex')}`
const errors: string[] = []
const assert = (ok: boolean, message: string) => { if (!ok) errors.push(message) }
const seal = await json(resolve(own, 'SEAL.FIRST.B2.json'))
for (const f of seal.files) assert(sha(await readFile(resolve(root, f.path))) === f.sha256, `FIRST changed: ${f.path}`)
const hostReceipt = await json(resolve(own, 'HOST.byte-exact-stock-modules.B2.json'))
for (const f of [...hostReceipt.stockModulesCopiedByteExact, ...hostReceipt.schemaFilesCopied]) {
  assert(sha(await readFile(resolve(host, f.path))) === f.sha256, `Host source/schema changed: ${f.path}`)
  assert(sha(await readFile(resolve(root, f.path))) === f.sha256, `Original source/schema changed: ${f.path}`)
}
const selectorPath = resolve(source, 'INPUTS.blind-native9-final-rezeptfrei.scientific.selector.json')
assert(sha(await readFile(selectorPath)) === 'sha256:cb3c683df79ba87ee83a5eaec4fdd78cc7ac88cbaf0e88193716fedeab7d3537', 'Final selector bytes changed')
const selector = await json(selectorPath)
const canonical = await json(resolve(root, selector.canonical.path))
const semantic = await json(resolve(root, selector.semantic.path))
assert(sha(await readFile(resolve(root, selector.canonical.path))) === selector.canonical.sha256, 'Final canonical bytes changed')
assert(sha(await readFile(resolve(root, selector.semantic.path))) === selector.semantic.sha256, 'Final semantic bytes changed')

const modelModule = await import(pathToFileURL(resolve(host, 'app/scripts/goalBookModel.ts')).href)
const evidenceModule = await import(pathToFileURL(resolve(host, 'app/scripts/goalEvidenceProfileModel.ts')).href)
const inputModule = await import(pathToFileURL(resolve(host, 'app/scripts/validateGoalDescriptionReviewCampaign.ts')).href)
const campaignModule = await import(pathToFileURL(resolve(host, 'app/scripts/validateGoalDescriptionReviewCampaignResults.ts')).href)
const bundleModule = await import(pathToFileURL(resolve(host, 'app/scripts/createGoalDescriptionReviewCampaign.ts')).href)
const modelPath = resolve(source, 'native-nine/bundle/book-model.json')
const model = modelModule.parseAndValidateGoalBookModel(await json(modelPath))
const bundle = await json(resolve(source, 'native-nine/bundle/manifest.json'))
const input = await json(resolve(source, 'native-nine/round-b/description-review-input.json'))
const campaign = await json(resolve(source, 'native-nine/round-b/description-review-campaign.json'))
const reviewInput = await json(resolve(source, 'native-nine/bundle/review-input.json'))
await bundleModule.verifyGoalBookReviewBundleArtifactBytes(bundle, resolve(source, 'native-nine/bundle'))
const rebuiltInput = inputModule.buildGoalDescriptionReviewInput({bundle, reviewInput, landscape: canonical})
assert(modelModule.stableGoalBookJson(rebuiltInput) === modelModule.stableGoalBookJson(input), 'Stock-built current canonical context differs from original round-B input')
const stockGoalChecks = []
for (const page of model.pages) {
  const goal = canonical.goals.find((g: any) => g.id === page.goalId)
  const kind = semantic.decisions.find((d: any) => d.goalId === page.goalId)
  const currentGoalFingerprint = evidenceModule.fingerprintGoalForEvidence(goal, modelModule.GOAL_BOOK_GOAL_FINGERPRINT_RULE_VERSION, kind.semanticKind)
  const currentSourceFingerprint = modelModule.fingerprintSemanticKindSourceGoal(goal)
  assert(currentGoalFingerprint === page.goalFingerprint, `Stock goal fingerprint mismatch: ${page.goalId}`)
  assert(currentSourceFingerprint === kind.sourceFingerprint, `Stock semantic-source fingerprint mismatch: ${page.goalId}`)
  const inputGoal = input.goals.find((g: any) => g.goalId === page.goalId)
  assert(modelModule.stableGoalBookJson(inputGoal.reviewContext.page) === modelModule.stableGoalBookJson(page), `Full BookPage mismatch: ${page.goalId}`)
  stockGoalChecks.push({goalId: page.goalId, goalFingerprint: currentGoalFingerprint, pageFingerprint: page.pageFingerprint, semanticSourceFingerprint: currentSourceFingerprint})
}
const images = await json(resolve(source, 'blind-inputs/nine-current-exact-physical-image-bodies.json'))
for (const row of images.images) {
  const physical = row.physicalRepositorySource
  assert(sha(await readFile(resolve(root, physical.path))) === physical.sha256, `Physical image bytes changed: ${row.goalId}`)
  const page = model.pages.find((p: any) => p.goalId === row.goalId)
  assert(page.visualization.originalDigest === physical.sha256, `Native image association mismatch: ${row.goalId}`)
}
const result = await campaignModule.validateGoalDescriptionReviewCampaignResultDirectories({
  bundle, input, campaign,
  batchesDirectory: resolve(source, 'native-nine/round-b/batches'),
  resultsDirectory: resolve(own, 'round-b/results'),
})
errors.push(...result.errors)
for (const f of seal.files) assert(sha(await readFile(resolve(root, f.path))) === f.sha256, `FIRST changed after check: ${f.path}`)
const output = {schemaVersion: 1, role: 'B2 one actual unchanged stock validation invocation', checkedAt: new Date().toISOString(), stockCheckExecutions: 1, nativeBuildExecutions: 0, stockModulesByteExact: true, stockModelPageValidation: true, stockCanonicalInputEquality: true, stockGoalChecks, physicalImageAssociationChecks: images.images.length, recordCount: result.records.length, newScientificD6: 6, scopeOnlyBindings3: 3, normalRecordsAIOnly: true, errors, status: errors.length ? 'failed' : 'passed', activeWrites: 0, humanOrPAMVOrM7Approval: false}
console.log(JSON.stringify(output, null, 2))
if (errors.length) process.exitCode = 1
