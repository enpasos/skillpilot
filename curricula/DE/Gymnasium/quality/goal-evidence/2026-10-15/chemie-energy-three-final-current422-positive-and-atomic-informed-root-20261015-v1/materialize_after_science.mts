// SPDX-License-Identifier: Apache-2.0
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, relative } from 'node:path'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'
const repo = process.cwd()
const E = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/'
const own = E + 'chemie-energy-three-final-current422-positive-and-atomic-informed-root-20261015-v1/'
const author = E + 'chemie-energy-three-wording-four-alt-bounded-author-root-20261015-v1/'
const native = E + 'chemie-energy-four-final-contexts-native-preparation-technical-20261015-v1/'
const load = (p: string) => JSON.parse(readFileSync(resolve(repo, p), 'utf8'))
const sha = (b: Buffer | string) => 'sha256:' + createHash('sha256').update(b).digest('hex')
const hash = (p: string) => sha(readFileSync(resolve(repo, p)))
const write = (p: string, x: unknown) => writeFileSync(resolve(repo, own, p), JSON.stringify(x, null, 2) + '\n')
const firstPath = own + 'FIRST.original-informed-P3-and-A3-science.json'
const first = load(firstPath)
const firstSeal = load(own + 'FILES.FIRST-informed-P3-A3-science.seal.json')
for (const r of firstSeal.files) if (hash(r.path) !== r.sha256) throw new Error('FIRST bytes changed')
const start = new Date().toISOString()
const model = await import(pathToFileURL(resolve(repo, 'app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
const canonicalPath = author + 'candidate/canonical560.current422.three-wording-four-alt.author.json'
const semantic = native + 'candidate/semantic560.three-description-source-bindings.json'
const canonical = load(canonicalPath)
const goals = new Map(canonical.goals.map((g: any) => [g.id, g]))
const criteriaPath = 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md'
const prompt = 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/positive-understanding-evidence-profile-authoring-v2.md'
const rawRows = readFileSync(resolve(repo, author, 'candidate/twenty-author-E0G0.two-targeted-briefs-four-input-bindings.jsonl'), 'utf8').trim().split('\n').map(s => JSON.parse(s))
const raw = new Map(rawRows.map((r: any) => [r.goalId, r]))
const group = 'chemie-energy-three-final-informed-root-pa-20261015-v1'
const runId = group + '-P3'
mkdirSync(resolve(repo, own, 'normal'), { recursive: true })
mkdirSync(resolve(repo, own, 'checks'), { recursive: true })
const bindings: any[] = []
const records = first.judgments.map((j: any) => {
  const g: any = goals.get(j.goalId)
  const resources: Record<string, string> = {}
  for (const link of g.resourceLinks ?? []) {
    if (link.type === 'goal-visualization') {
      const filename = decodeURIComponent(link.url.split('/').at(-1)!)
      const source = 'curricula/DE/Gymnasium/visualizations/chemie/' + j.goalId + '/' + filename
      resources[link.url] = hash(source)
    }
  }
  const goalFingerprint = model.fingerprintGoalForPositiveEvidence(g, 'curricularAtomic')
  const reviewInputFingerprint = model.fingerprintPositiveGoalEvidenceReviewInput(g, hash(criteriaPath), resources, 'curricularAtomic')
  const original: any = raw.get(j.goalId)
  if (original.goalFingerprint !== goalFingerprint || original.reviewInputFingerprint !== reviewInputFingerprint) throw new Error('Current author binding mismatch: ' + j.goalId)
  if (JSON.stringify(original.profile) !== JSON.stringify(j.retainedWholeProfile)) throw new Error('Scientific whole profile changed')
  const result = { $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json', schemaVersion: 2,
    reviewId: group + '-p', goalFingerprintRuleVersion: 'goal-evidence-v1', profileRuleVersion: 'positive-understanding-evidence-v2',
    reviewCriteriaFingerprint: hash(criteriaPath), landscapeId: canonical.landscapeId, goalId: j.goalId,
    goalFingerprint, reviewInputFingerprint, profileFingerprint: model.fingerprintPositiveGoalEvidenceProfile(j.retainedWholeProfile),
    status: 'needs_human_review', reviewAuthority: 'ai_candidate', reviewedAt: first.completedAtUTC,
    reviewer: 'Codex root; informed actual P3 science, canonical wording author role disclosed; no blind or human authority',
    reason: j.positiveScientificReason, evidenceLevel: 'E1', maximumClaimScope: 'G1', reviewRunIds: [runId],
    dissent: ['Machine single-goal assessment design only; no actual learner research, laboratory performance or Human approval claimed.',
      'Current original image bytes are actually viewed and input-bound; P does not grant independent V acceptance.',
      'National source/course/partner and optional selection holds remain separate.'], profile: j.retainedWholeProfile }
  const errors = model.validatePositiveGoalEvidenceRecordSemantics(result, g, resources, 'curricularAtomic')
  if (errors.length) throw new Error(errors.join('\n'))
  bindings.push({ goalId: j.goalId, goalFingerprint, reviewInputFingerprint, resources, actualAuthorInputExact: true, profileBodyUnchanged: true })
  return result
})
const pRows = own + 'normal/P3.current-final.image-bound.candidates.jsonl'
writeFileSync(resolve(repo, pRows), records.map((r: any) => JSON.stringify(r)).join('\n') + '\n')
write('checks/P3.current-input-resource-bindings.json', { checkedAtUTC: new Date().toISOString(), entries: bindings })
const aRows = own + 'normal/A3.current-final.candidates.jsonl'
writeFileSync(resolve(repo, aRows), first.judgments.map((j: any) => JSON.stringify({schemaVersion: 1, reviewId: group + '-a', ruleVersion: 'semantic-atomicity-v1', landscapeId: canonical.landscapeId, goalId: j.goalId, fingerprint: 'pending-normal-binding-after-actual-science', status: j.atomicityDecision, semanticAtomic: true, reviewedAt: first.completedAtUTC, reviewer: 'Codex root; separate actual informed A3 science; no Human/source/course/V approval', reason: j.atomicityReason})).join('\n') + '\n')
write('normal/A3.current-final.config.json', { schemaVersion: 1, reviewId: group + '-a', ruleVersion: 'semantic-atomicity-v1', landscapeId: canonical.landscapeId, landscapePath: canonicalPath, reviewPath: aRows, scope: {label: 'Only three changed current Energy goal texts; genuine informed A science before fingerprint binding', leafGoalIds: records.map((r: any) => r.goalId)} })
write('normal/P3.generation-disclosure.json', {role: 'Informed root P3 normal materialization after separately sealed actual science', model: 'GPT-6 Codex; exact revision and decoding settings not exposed', firstSciencePath: firstPath, firstScienceDigest: hash(firstPath), firstScienceAtUTC: first.completedAtUTC, currentContext: 'Three whole current goals, three whole profiles, six complete cases, direct prerequisites and actual original JPGs read/viewed; native PDF full independent D review remains separate.', newBlindVotes: 0})
const runPath = own + 'normal/P3.current-final.informed.run.json'
write('normal/P3.current-final.informed.run.json', {$schema: 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json', schemaVersion: 1, runId, bundleFingerprint: hash(own + 'inputs/P3-whole-current-goals-profiles-cases-prerequisites.json'), bookDigest: hash(native + 'native-four/bundle/book-model.json'), provider: 'OpenAI', model: 'GPT-6 Codex (exact revision and decoding settings not exposed)', role: 'synthesizer', promptFamilyId: 'positive-understanding-evidence-profile-authoring-v2', promptFingerprint: hash(prompt), criteriaFingerprint: hash(criteriaPath), generationParametersFingerprint: hash(own + 'normal/P3.generation-disclosure.json'), independenceGroupId: group + '-informed-not-blind', blindToOtherRuns: false, goalIds: records.map((r: any) => r.goalId), inputArtifacts: [{role: 'book_model', digest: hash(native + 'native-four/bundle/book-model.json')}, {role: 'review_input_json', digest: hash(own + 'inputs/P3-whole-current-goals-profiles-cases-prerequisites.json')}, {role: 'review_markdown', digest: hash(own + 'normal/P3.actual-informed-scientific-context.md')}, {role: 'review_prompt', digest: hash(prompt)}, {role: 'review_criteria', digest: hash(criteriaPath)}], startedAt: start, completedAt: new Date().toISOString(), status: 'completed', outputDigest: hash(pRows), toolchainVersion: 'positive-understanding-evidence-v2'})
write('normal/P3.current-final.image-bound.config.json', {$schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json', schemaVersion: 2, reviewId: group + '-p', goalFingerprintRuleVersion: 'goal-evidence-v1', profileRuleVersion: 'positive-understanding-evidence-v2', landscapeId: canonical.landscapeId, landscapePath: canonicalPath, semanticKindLedgerPath: semantic, reviewCriteriaPath: criteriaPath, reviewPath: pRows, reviewRunManifestPaths: [runPath], reviewedResourceTypes: ['goal-visualization'], requireApproved: false, scope: {label: 'Current changed three Energy goals; informed E1/G1 profile design, Human/learner and V acceptance separate', goalIds: records.map((r: any) => r.goalId)}})
console.log(JSON.stringify({materializedP: 3, materializedA: 3, profileBodiesExact: true, currentAuthorGoalAndInputBindingsExact: true, machineStatus: 'E1/G1 ai_candidate needs_human_review; no blind D or V votes'}))
