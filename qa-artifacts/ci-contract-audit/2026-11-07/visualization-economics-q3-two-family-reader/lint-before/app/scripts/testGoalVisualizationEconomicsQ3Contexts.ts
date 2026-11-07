// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { createVisualizationContextVerifier, hasVerifiedVisualizationContext,
  type VisualizationContextQualification, type VisualizationCurrentContext } from './goalVisualizationReviewedContext'

const root = resolve(import.meta.dirname, '../..')
const packet = resolve(root, 'qa-artifacts/ci-contract-audit/2026-11-07/visualization-economics-q3-two-family-reader')
const census = JSON.parse(readFileSync(resolve(packet, 'family-census.json'), 'utf8'))
const sourcePath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
const sourceRaw = readFileSync(resolve(root, sourcePath)), source = JSON.parse(sourceRaw.toString('utf8'))
const sha = (raw: Buffer) => createHash('sha256').update(raw).digest('hex')
const verify = createVisualizationContextVerifier({ acceptedRepositoryCommit: census.acceptedRepositoryCommit })
const selected = census.candidateReceipts.map((entry: any) => ({ entry, reference: { path: entry.path, sha256: entry.sha256 },
  receipt: JSON.parse(readFileSync(resolve(root, entry.path), 'utf8')) as VisualizationContextQualification }))
assert.equal(selected.length, 36)
const current = (receipt: VisualizationContextQualification): VisualizationCurrentContext => {
  const goal = source.goals.find((row: any) => row.id === receipt.context.goalId)
  assert.ok(goal)
  const primary = goal.resourceLinks.filter((row: any) => row.type === 'goal-visualization' && (!row.role || row.role === 'primary'))
  assert.equal(primary.length, 1)
  const imageUrl = primary[0].url, publicAssetPath = 'app/public' + imageUrl
  return { landscapeId: source.landscapeId, goalId: goal.id, subject: 'wirtschaftswissenschaften', title: goal.title,
    description: goal.description, titleEn: goal.titleEn, descriptionEn: goal.descriptionEn,
    assetSha256: 'sha256:' + sha(readFileSync(resolve(root, publicAssetPath))), imageUrl, publicAssetPath,
    canonicalAssetPath: 'curricula/DE/Gymnasium/visualizations/' + imageUrl.slice('/assets/goal-visualizations/'.length) }
}
const embedded = selected.find((row: any) => row.receipt.reviewProfile === 'economics-q3-embedded-v1')!
const trade = selected.find((row: any) => row.receipt.reviewProfile === 'economics-q3-trade-finance-v1' && !row.entry.correction)!
const corrected = selected.find((row: any) => row.receipt.reviewProfile === 'economics-q3-trade-finance-v1' && row.entry.correction)!
if (process.argv.includes('--private-original-mutation') || process.argv.includes('--private-current-asset-mutation')) {
  const context = current(corrected.receipt)
  if (process.argv.includes('--private-current-asset-mutation')) context.assetSha256 = corrected.receipt.context.assetSha256
  const result = verify(corrected.reference, context)
  assert.equal(result.ok, false)
  if (!result.ok) assert.match(result.issues.join(' '), process.argv.includes('--private-current-asset-mutation')
    ? /Current actual image bytes differ/u : /Original input bytes changed/u)
  console.log('Genuine private original/current-byte mutation rejected.')
} else {
  const cases: string[] = []
  for (const row of selected) {
    const context = current(row.receipt), result = verify(row.reference, context)
    assert.equal(result.ok, true, JSON.stringify({ goalId: context.goalId, result }))
    if (result.ok) assert.equal(hasVerifiedVisualizationContext(result.capability, context), true)
  }
  assert.equal(selected.filter((row: any) => row.entry.correction).length, 8)
  const deny = (name: string, reference: unknown, context: VisualizationCurrentContext, pattern: RegExp) => {
    const result = verify(reference, context)
    assert.equal(result.ok, false, name)
    if (!result.ok) assert.match(result.issues.join(' '), pattern, name)
    cases.push(name)
  }
  const scratch = mkdtempSync(resolve(root, 'qa-artifacts/ci-contract-audit/2026-11-07/v-q3-temporary-test-'))
  try {
    const edited = (row: typeof trade, mutate: (receipt: any) => void) => {
      const receipt = structuredClone(row.receipt); mutate(receipt)
      const raw = Buffer.from(JSON.stringify(receipt)), path = resolve(scratch, 'edited.json')
      writeFileSync(path, raw); return { path: relative(root, path), sha256: sha(raw) }
    }
    for (const row of [embedded, trade]) {
      const context = current(row.receipt), prefix = row.receipt.reviewProfile
      deny(prefix + ': current DE description drift', row.reference, { ...context, description: context.description + ' New competence.' }, /Current goal\/image context differs/u)
      deny(prefix + ': actual foreign owner', row.reference, { ...context, landscapeId: 'different-owner' }, /Current goal\/image context differs/u)
      deny(prefix + ': uppercase owner', edited(row, receipt => { receipt.context.landscapeId = receipt.context.landscapeId.toUpperCase() }), context, /owner\/goal\/subject association/u)
      deny(prefix + ': different original input is not an embedded review', edited(row, receipt => { receipt.originalInput = row === embedded ? trade.receipt.originalReview : embedded.receipt.originalReview }), context, /embedded context must/u)
      deny(prefix + ': fabricated reviewer', edited(row, receipt => { receipt.reviewer += '-invented' }), context, /decision\/reviewer\/time\/reason/u)
      deny(prefix + ': fabricated review time', edited(row, receipt => { receipt.reviewedAt = '2026-11-07T01:00:00Z' }), context, /decision\/reviewer\/time\/reason/u)
      deny(prefix + ': no manufactured midnight for date-only source', edited(row, receipt => { receipt.reviewedAt = receipt.reviewedAt.slice(0, 10) }), context, /Closed context receipt schema/u)
      deny(prefix + ': free JSONpointer is not a reader contract', edited(row, receipt => { receipt.inputPointer = '/today/description' }), context, /Closed context receipt schema/u)
      deny(prefix + ': later co-located commit is not the original family', edited(row, receipt => {
        receipt.originalReview.gitCommit = census.acceptedRepositoryCommit
        receipt.originalInput.gitCommit = census.acceptedRepositoryCommit
        receipt.ownerSource.gitCommit = census.acceptedRepositoryCommit
        if (row === embedded) receipt.ownerSource.sha256 = sha(sourceRaw)
      }), context, row === embedded ? /family\/commit\/owner differs/u : /decision\/reviewer\/time\/reason|fixed review|family\/commit/u)
    }
    // The second family actually supplied and reviewed whole English inputs.
    deny('Trade: changed English cannot borrow DE approval', trade.reference,
      { ...current(trade.receipt), descriptionEn: current(trade.receipt).descriptionEn + ' Extra skill.' }, /Current goal\/image context differs/u)
    // The first family explicitly supplied only DE; do not invent an English review.
    assert.equal(verify(embedded.reference, { ...current(embedded.receipt), descriptionEn: 'Not an original supplied input.' }).ok, true)
    cases.push('Embedded DE-only context remains exactly DE-only')
    for (const entry of census.rejectedOriginalCounterclaims) {
      const receipt = JSON.parse(readFileSync(resolve(root, entry.path), 'utf8')) as VisualizationContextQualification
      deny('Authentic REJECT remains rejected: ' + entry.goalId, { path: entry.path, sha256: entry.sha256 }, current(receipt), /not a positive independent AI review/u)
    }
    assert.equal(census.rejectedOriginalCounterclaims.length, 8)
    for (const entry of census.staleContextFixtures) {
      const receipt = JSON.parse(readFileSync(resolve(root, entry.path), 'utf8')) as VisualizationContextQualification
      deny('Genuine old whole-text drift stays open', { path: entry.path, sha256: entry.sha256 }, current(receipt), /Current goal\/image context differs/u)
      deny('Relabelling that old review with today text cannot close it', edited({ receipt } as typeof trade,
        changed => { changed.context.description = current(receipt).description }), current(receipt), /actual original reviewed context/u)
    }
    const original = JSON.parse(readFileSync(resolve(root, corrected.receipt.originalReview.path), 'utf8'))
    const targets: Array<[string, string, Buffer, string]> = [
      ['wrong current goal metadata cannot replace its original', original.nativeMetadataPath,
        readFileSync(resolve(root, JSON.parse(readFileSync(resolve(root, trade.receipt.originalReview.path), 'utf8')).nativeMetadataPath)), '--private-original-mutation'],
      ['unbound whole DE/EN goal input is rejected', original.wholeGoalCandidatePath, Buffer.from('[]'), '--private-original-mutation'],
      ['inspected derivative bytes are authenticated', original.inspections[1].path, Buffer.from('wrong derivative'), '--private-original-mutation'],
      ['previous REJECT receipt cannot be rewritten', original.priorIndependentReceiptPath, Buffer.from('{"decision":"KEEP"}'), '--private-original-mutation'],
      ['current image bytes must still match', current(corrected.receipt).publicAssetPath, Buffer.from('different image bytes'), '--private-current-asset-mutation'],
    ]
    for (const [name, target, bytes, flag] of targets) {
      const replacement = resolve(scratch, 'replacement.bin'); writeFileSync(replacement, bytes)
      const run = spawnSync('bwrap', ['--die-with-parent', '--unshare-net', '--ro-bind', '/', '/', '--proc', '/proc', '--dev', '/dev', '--tmpfs', '/tmp',
        '--ro-bind', replacement, resolve(root, target), '--chdir', resolve(root, 'app'), '--', './node_modules/.bin/tsx', 'scripts/testGoalVisualizationEconomicsQ3Contexts.ts', flag], { encoding: 'utf8' })
      assert.equal(run.status, 0, JSON.stringify({ name, stdout: run.stdout, stderr: run.stderr }))
      cases.push(name)
    }
    assert.equal(sha(readFileSync(resolve(root, sourcePath))), sha(sourceRaw))
    console.log(JSON.stringify({ status: 'two-concrete-economics-q3-readers-pass', originalPositives: 36,
      embeddedPositives: 20, tradeFinancePositives: 16, genuineCorrectionChains: 8, controls: cases.length, cases,
      suppliedEnglishContexts: { embedded: false, tradeFinance: true },
      activeSourceQaOrApprovalWrites: false, producerOrM7OrWorkflowIntegration: false }, null, 2))
  } finally { rmSync(scratch, { recursive: true, force: true }) }
}
