import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

async function main() {
  const repo = process.cwd()
  const own = dirname(fileURLToPath(import.meta.url))
  const read = async (p: string) => JSON.parse(await readFile(p, 'utf8'))
  const sha = async (p: string) => `sha256:${createHash('sha256').update(await readFile(p)).digest('hex')}`
  const loadModule = async (p: string) => import(pathToFileURL(resolve(repo, p)).href)
  const stockPaths = [
    'app/scripts/validateGoalDescriptionReviewCampaign.ts',
    'app/scripts/validateGoalDescriptionReviewCampaignResults.ts',
    'app/scripts/goalBookModel.ts',
    'app/scripts/goalEvidenceProfileModel.ts',
    'contracts/goal-description-review/v1/goal-description-review-record.schema.json',
    'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
  ]
  const stocksBefore = await Promise.all(stockPaths.map(async path => ({ path, sha256: await sha(resolve(repo, path)) })))
  const description = await loadModule(stockPaths[0])
  const book = await loadModule(stockPaths[2])
  const evidence = await loadModule(stockPaths[3])
  const config = await read(resolve(own, 'run-config.actual-local-serialization.json'))
  const selector = await read(resolve(repo, config.selector.path))
  const input = await read(resolve(repo, config.input.path))
  const campaign = await read(resolve(repo, config.campaign.path))
  const bundle = await read(resolve(repo, config.bundle.path))
  const canonical = await read(resolve(repo, selector.canonical.path))
  const semantic = await read(resolve(repo, selector.semantic.path))
  const model = book.parseAndValidateGoalBookModel(await read(resolve(repo, selector.actualBookModel.path)))
  const bundleReviewInput = await read(resolve(dirname(resolve(repo, config.bundle.path)), 'review-input.json'))
  const rebuilt = description.buildGoalDescriptionReviewInput({ bundle, reviewInput: bundleReviewInput, landscape: canonical })
  assert.equal(book.stableGoalBookJson(rebuilt), book.stableGoalBookJson(input), 'Current whole bilingual canonical target/context must equal the exact supplied round-A input')
  const campaignValidation = await description.validateGoalDescriptionReviewCampaign({ bundle, input, campaign })
  assert.deepEqual(campaignValidation.errors, [])
  assert.equal(model.digest, bundle.bookModelDigest)
  assert.equal(model.source.landscapeDigest, await sha(resolve(repo, selector.canonical.path)))
  assert.equal(model.source.semanticKindLedgerDigest, await sha(resolve(repo, selector.semantic.path)))
  const goalsById = new Map(canonical.goals.map((g: any) => [g.id, g]))
  const semanticById = new Map(semantic.decisions.map((d: any) => [d.goalId, d.semanticKind]))
  const records = (await readFile(resolve(repo, config.records.path), 'utf8')).trimEnd().split('\n').map(line => JSON.parse(line))
  assert.equal(records.length, 8)
  assert.deepEqual(records.map(r => r.goalId), campaign.batches[0].goalIds)
  const checked = []
  for (let index = 0; index < input.goals.length; index++) {
    const goal = input.goals[index]
    const canonicalGoal: any = goalsById.get(goal.goalId)
    const page = model.pages[index]
    const selected = selector.actualPagesAndHashes[index]
    const record = records[index]
    assert.equal(evidence.fingerprintGoalForEvidence(canonicalGoal, book.GOAL_BOOK_GOAL_FINGERPRINT_RULE_VERSION, semanticById.get(goal.goalId)), goal.goalFingerprint)
    assert.equal(page.goalId, goal.goalId)
    assert.equal(page.goalFingerprint, goal.goalFingerprint)
    assert.equal(page.pageFingerprint, goal.pageFingerprint)
    assert.equal(selected.pageFingerprint, page.pageFingerprint)
    assert.equal(page.visualization.url, selected.imageUrl)
    assert.equal(page.visualization.originalDigest, selected.exactPrimaryImageSha256)
    const imageLinks = canonicalGoal.resourceLinks.filter((link: any) => link.resourceType === 'image')
    assert(imageLinks.some((link: any) => link.url === page.visualization.url && link.altText === page.visualization.altText))
    for (const key of ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']) {
      assert.equal(record[key], goal[key], `${goal.goalId} ${key}`)
    }
    assert.equal(record.recordStatus, 'candidate')
    assert.equal(record.reviewAuthority, 'ai_candidate')
    assert.equal(record.decision, 'keep')
    assert.equal(record.evidenceProfileRecommendation, 'none')
    for (const key of ['actualPagePng120dpi', 'actualWholeGoalAndPageInput', 'actualWholePageText']) {
      assert.equal(await sha(resolve(repo, selected[key].path)), selected[key].sha256)
    }
    checked.push({ goalId: goal.goalId, goalFingerprint: goal.goalFingerprint, pageFingerprint: goal.pageFingerprint, exactBilingualTextAndCanonicalContext: true, exactPrimaryImageUrlAltAndDigest: true })
  }
  const amendment = await read(resolve(own, 'FOLLOWUP.actual-final-written-eight-page-bindings.before-stock.json'))
  for (const r of amendment.originalOwnSciencePreserved) assert.equal(await sha(resolve(repo, r.path)), r.sha256)
  const stocksAfter = await Promise.all(stockPaths.map(async path => ({ path, sha256: await sha(resolve(repo, path)) })))
  assert.deepEqual(stocksAfter, stocksBefore)
  console.log(JSON.stringify({
    status: 'valid', actualBoundRecords: checked.length,
    stockModelSchemaDigestAndPageFingerprintsValidated: true,
    stockRebuiltBilingualInputEqualsSuppliedCurrentInputExactly: true,
    stockCampaignAndInputErrors: campaignValidation.errors,
    originalOwnScienceUnchanged: true,
    stockHelpersAndClosedSchemasUnmodifiedDuringCheck: stocksAfter,
    canonicalAndSemanticByteDigestsMatchActualModel: true,
    checked,
    scope: 'Read-only verification using unmodified stock helpers; no rendering, prepare, registry, central, runtime or Git action',
  }, null, 2))
}

main().catch(error => { console.error(error instanceof Error ? error.stack : String(error)); process.exitCode = 1 })
