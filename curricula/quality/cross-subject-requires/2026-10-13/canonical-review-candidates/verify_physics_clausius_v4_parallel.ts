// SPDX-License-Identifier: Apache-2.0
// Independent exact-input verification. No native row or active file is written.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildRequiresInventory, assertFreshRequiresInventory, fingerprint,
  bytesFingerprint, stableJson } from '../../app/scripts/lib/crossSubjectRequiresInventory'
import { validateRequiresDecisions } from '../../app/scripts/lib/crossSubjectRequiresReview'

const root = resolve(process.cwd(), '..')
const prefix = 'tmp/cross-subject-requires/physics-clausius-revision-author-20261013-v4'
const read = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const sha = (path: string) => bytesFingerprint(readFileSync(resolve(root, path)))
const packet = read(prefix + '.proposal-candidate.json')
const context = read(prefix + '.context.exact.json')
const amendments = read(prefix + '.profile-amendments.candidate.json')
const review = read(prefix + '.parallel-independent-review.draft.json')
const failures: string[] = []
const authorManifest = read(prefix + '.manifest.json')
for (const e of authorManifest.artifacts) if (sha(e.path) !== e.sha256) failures.push(`Author manifest drift ${e.path}`)
if (sha(prefix + '.manifest.json') !== 'sha256:93638b2485dd1c2d6c130a41dfd41372bf359cc6a09ac8ffe196df1fc8548c55') failures.push('Wrong exact author manifest')
if (sha(prefix + '.proposal-candidate.json') !== 'sha256:1c4501dd8b8cad9ecc3db5fc60e392369601e65ff0c09f9b2fb7ebcb6b86d236') failures.push('Wrong exact packet')
for (const e of context.frozenInputs) if (sha(e.path) !== e.sha256) failures.push(`Frozen historical/current input drift ${e.path}`)
const physics = read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json')
const math = read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json')
const physicsGoals = new Map<string, any>(physics.goals.map((g: any) => [g.id, g]))
const mathGoals = new Map<string, any>(math.goals.map((g: any) => [g.id, g]))
const goalChecks: any[] = []
const parents = new Map<string, string[]>()
for (const g of physics.goals) for (const child of g.contains ?? []) parents.set(child, [...(parents.get(child) ?? []), g.id])
const effective = (gid: string): string[] => {
  const found = new Set<string>(), visited = new Set<string>(), queue = [gid]
  while (queue.length) {
    const id = queue.shift()!; if (visited.has(id)) continue; visited.add(id)
    for (const rid of physicsGoals.get(id)?.requires ?? []) found.add(rid)
    queue.push(...(parents.get(id) ?? []))
  }
  return [...found].sort()
}
for (const row of review.decisions) {
  const d = packet.decisions.find((x: any) => x.decisionId === row.decisionId)
  const c = context.records.find((x: any) => x.goalId === row.dependentGoalId)
  const a = amendments.amendments.find((x: any) => x.goalId === row.dependentGoalId)
  if (!d || !c || !a) { failures.push('Missing exact input row'); continue }
  row.proposalBindingSha256 = fingerprint(d.proposalBinding)
  if (row.reviewer === d.author || !row.reviewer.includes('/root/requires_parallel_review')) failures.push('Reviewer identity error')
  if (fingerprint(physicsGoals.get(c.goalId)) !== c.currentCanonicalGoalSha256) failures.push(`Current goal drift ${c.goalId}`)
  if (sha(c.actualNativePReviewPath) !== c.actualNativePReviewFileSha256 || sha(c.actualNativePConfigPath) !== c.actualNativePConfigSha256) failures.push(`Current P owner byte drift ${c.goalId}`)
  const actualRow = readFileSync(resolve(root, c.actualNativePReviewPath), 'utf8').split(/\r?\n/).filter(Boolean).map(JSON.parse).find((x: any) => x.goalId === c.goalId)
  if (!actualRow || stableJson(actualRow) !== stableJson(c.actualNativePRecord)) failures.push(`Current P row drift ${c.goalId}`)
  if (fingerprint(actualRow?.profile) !== row.oldNativeProfileBodySha256 || fingerprint(a.proposedProfile) !== row.proposedProfileBodySha256) failures.push(`P body digest mismatch ${c.goalId}`)
  if (stableJson(a.oldProfileFullDeEn) !== stableJson(actualRow.profile)) failures.push(`Old bilingual body mismatch ${c.goalId}`)
  goalChecks.push({ goalId:c.goalId, sourceIndex:row.sourceIndex, decision:row.decision,
    currentGoalSha256:fingerprint(physicsGoals.get(c.goalId)), proposalBindingSha256:row.proposalBindingSha256,
    oldBodySha256:fingerprint(actualRow.profile), proposedBodySha256:fingerprint(a.proposedProfile),
    directRequires:physicsGoals.get(c.goalId).requires, directPlusContainsInheritedRequires:effective(c.goalId) })
}
const mathChecks: any[] = []
for (const [gid, owner] of Object.entries(context.mathematicsFullDescriptionsAndActualCurrentNativePRead) as any[]) {
  if (fingerprint(mathGoals.get(gid)) !== owner.goalSha256 || fingerprint(owner.goal) !== owner.goalSha256) failures.push(`Whole Math goal drift ${gid}`)
  if (sha(owner.reviewPath) !== owner.reviewFileSha256 || sha(owner.configPath) !== owner.configFileSha256) failures.push(`Math native owner drift ${gid}`)
  const row = readFileSync(resolve(root,owner.reviewPath),'utf8').split(/\r?\n/).filter(Boolean).map(JSON.parse).find((x:any)=>x.goalId===gid)
  if (stableJson(row) !== stableJson(owner.record) || fingerprint(row.profile) !== owner.profileBodySha256) failures.push(`Full Math row/body drift ${gid}`)
  mathChecks.push({goalId:gid, goalSha256:owner.goalSha256, nativeProfileBodySha256:owner.profileBodySha256})
}
const config = read('curricula/quality/cross-subject-requires/math-physics.config.json')
const inventory = buildRequiresInventory(root,config)
const inventorySha = assertFreshRequiresInventory(inventory,resolve(root,'curricula/quality/cross-subject-requires/math-physics.inventory.json'))
const familyIds = [...new Set(packet.decisions.map((d: any)=>d.familyId))] as string[]
const validation = validateRequiresDecisions(inventory,packet,{
  familyIds, independentReview:review, authorLedgerSha256:sha(prefix+'.proposal-candidate.json'),
  inventorySha256:inventorySha, sourcePathExists:p=>existsSync(resolve(root,p)),
})
failures.push(...validation.errors)
if (review.inventorySha256 !== inventorySha) failures.push('Current inventory differs from reviewed baseline')
if (packet.proposedGraphCycles.length) failures.push('Proposed graph cycle')
if (failures.length) { console.log(JSON.stringify({failures},null,2)); process.exit(1) }
const output = prefix+'.parallel-independent-review.json'
writeFileSync(resolve(root,output),JSON.stringify(review,null,2)+'\n',{flag:'wx'})
const report = {schemaVersion:1,status:'independent_exact_binding_validation_pass',reviewer:review.reviewer,
  completedAt:new Date().toISOString(), reviewPath:output,reviewSha256:sha(output),
  candidatePacketPath:prefix+'.proposal-candidate.json', candidatePacketSha256:sha(prefix+'.proposal-candidate.json'),
  inventorySha256:inventorySha,familyIds, requireComplete:false,requiresValidation:validation,
  goalChecks,mathChecks,frozenInputsChecked:context.frozenInputs.length,failures,
  authorityBoundary:'Technical validation of independent AI candidate receipt only; no native M7 adoption, mastery inference or active mutation.',license:'Apache-2.0'}
const receipt = prefix+'.parallel-independent-review.validation.json'
writeFileSync(resolve(root,receipt),JSON.stringify(report,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({reviewPath:output,reviewSha256:sha(output),validationPath:receipt,
  validationSha256:sha(receipt),counts:review.counts,requiresValidation:validation,fullMathChecks:mathChecks.length,failures},null,2))
