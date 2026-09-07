import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import { buildPositiveGoalEvidenceCandidateRecords } from '../../../../../app/scripts/materializePositiveGoalEvidenceCandidates'
import { fingerprintSemanticKindSourceGoal } from '../../../../../app/scripts/goalBookModel'
import { positiveGoalEvidenceReviewInputPayload } from '../../../../../app/scripts/positiveGoalEvidenceProfileModel'
const stem = 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-040-elementary-antiderivatives-1-v1'
const sha = (value: string | Buffer) => 'sha256:' + createHash('sha256').update(value).digest('hex')
const unique = (rows: any[], key: string, id: string) => { const found = rows.filter(row => row[key] === id); assert.equal(found.length, 1, key + ': ' + id); return found[0] }
async function main() {
  assert.ok(process.argv.includes('--stable-confirmed'), 'Root must explicitly confirm final canonical and image stability')
  assert.ok(process.argv.includes('--root-ai-counterreview-confirmed'), 'Wait for root full-body AI counterreview; this is not human approval')
  const configPath = stem + '.config.json', candidatePath = stem + '.candidates.json'
  const config = JSON.parse(readFileSync(configPath, 'utf8')), candidates = JSON.parse(readFileSync(candidatePath, 'utf8'))
  const context = JSON.parse(readFileSync(stem + '.authoring-context.json', 'utf8')), authorCheck = JSON.parse(readFileSync(stem + '.author-check-report.json', 'utf8'))
  assert.equal(candidates.goals.length, 1); assert.deepEqual(config.scope.goalIds, candidates.goals.map((goal: any) => goal.goalId))
  assert.deepEqual(config.reviewedResourceTypes, []); assert.equal(config.requireApproved, false)
  assert.equal(authorCheck.candidateSha256, sha(readFileSync(candidatePath)))
  assert.equal(authorCheck.caseSpecificChecks.length, 2); assert.ok(authorCheck.caseSpecificChecks.every((check: any) => check.status === 'pass'))
  const landscape = JSON.parse(readFileSync(config.landscapePath, 'utf8')), kinds = JSON.parse(readFileSync(config.semanticKindLedgerPath, 'utf8'))
  const candidate = candidates.goals[0], goal = unique(landscape.goals, 'id', candidate.goalId), kind = unique(kinds.decisions, 'goalId', goal.id)
  assert.deepEqual(goal, context.source.goal, 'Unreviewed goal or resource drift after authoring')
  assert.deepEqual(goal.requires.map((id: string) => unique(landscape.goals, 'id', id)), context.source.prerequisites)
  assert.equal(kind.semanticKind, 'curricularAtomic'); assert.equal(kind.decisionStatus, 'authoritative')
  assert.equal(kind.sourceFingerprint, fingerprintSemanticKindSourceGoal(goal))
  const sourceArtifacts = [configPath, candidatePath, stem + '.author.mjs', stem + '.authoring-context.json', stem + '.author-check-report.json', stem + '.bind-current.ts', config.reviewCriteriaPath, config.landscapePath, config.semanticKindLedgerPath, context.source.adjudicationReceipt.path, 'app/scripts/materializePositiveGoalEvidenceCandidates.ts', 'app/scripts/positiveGoalEvidenceProfileModel.ts'].map(path => ({ path, sha256: sha(readFileSync(path)) }))
  assert.equal(sha(readFileSync(context.source.adjudicationReceipt.path)), context.source.adjudicationReceipt.sha256)
  const visualizationInventory = (goal.resourceLinks ?? []).filter((link: any) => link.type === 'goal-visualization').map((link: any) => {
    assert.ok(link.url.startsWith('/assets/goal-visualizations/'))
    const path = 'app/public' + link.url
    return { path, url: link.url, sha256: sha(readFileSync(path)), note: 'Inventory only, not P image-QA evidence or a new visual approval.' }
  })
  const records = await buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet: candidates })
  assert.equal(records.length, 1)
  const record = records[0]
  assert.equal(record.status, 'needs_human_review'); assert.equal(record.reviewAuthority, 'ai_candidate')
  assert.equal(record.evidenceLevel, 'E1'); assert.equal(record.maximumClaimScope, 'G1'); assert.deepEqual(record.reviewRunIds, [])
  assert.deepEqual(record.profile, candidate.profile)
  const reviewBytes = JSON.stringify(record) + '\n'
  const receipt = {
    schemaVersion: 1, artifactType: 'math-b040-p1-final-context-v1', materializedAt: new Date().toISOString(),
    author: { provider: 'OpenAI', model: 'unknown', modelVersion: 'unknown', authority: 'ai_candidate', humanApprovalClaimed: false },
    stableDirection: 'Root explicitly confirmed stable canonical and image inputs and reported its completed full-body AI counterreview before this read-only native emitter was executed. Model agreement is not human approval.',
    sourceArtifacts, currentGoal: goal, prerequisites: context.source.prerequisites, semanticKind: kind,
    activeVisualizationInventory: visualizationInventory,
    nativeReviewInputPayload: positiveGoalEvidenceReviewInputPayload(goal, sha(readFileSync(config.reviewCriteriaPath)), {}, kind.semanticKind),
    caseCoverage: context.caseCoverage,
    bindings: { goalId: record.goalId, goalFingerprint: record.goalFingerprint, reviewInputFingerprint: record.reviewInputFingerprint, profileFingerprint: record.profileFingerprint, reviewCriteriaFingerprint: record.reviewCriteriaFingerprint },
    output: { path: config.reviewPath, sha256: sha(reviewBytes) },
    toolchain: { node: process.versions.node, nativeBuilder: 'app/scripts/materializePositiveGoalEvidenceCandidates.ts#buildPositiveGoalEvidenceCandidateRecords' },
    boundaries: ['Exactly one checked, independently authored profile is bound without body changes.', 'needs_human_review/ai_candidate/E1/G1, no learner execution, model-diversity or human-approval claim.', 'D review and V image QA remain separate; this P record does not approve either.', 'No canonical, A/M/K, existing D/P, registry, claims, source, deck/card, book, aggregate QA or runtime write.'],
  }
  let patch = '*** Begin Patch\n'
  for (const [path, bytes] of [[config.reviewPath, reviewBytes], [stem + '.context-receipt.json', JSON.stringify(receipt, null, 2) + '\n']]) {
    assert.equal(existsSync(path), false, 'Refuse overwrite: ' + path)
    patch += '*** Add File: ' + path + '\n' + bytes.trimEnd().split('\n').map(line => '+' + line).join('\n') + '\n'
  }
  patch += '*** End Patch\n'
  for (const artifact of sourceArtifacts) assert.equal(sha(readFileSync(artifact.path)), artifact.sha256, 'Concurrent source drift')
  for (const image of visualizationInventory) assert.equal(sha(readFileSync(image.path)), image.sha256, 'Concurrent image drift')
  process.stdout.write(JSON.stringify({ patch, summary: { profiles: 1, reviewSha256: sha(reviewBytes), contextReceiptSha256: sha(JSON.stringify(receipt, null, 2) + '\n') } }))
}
void main()
