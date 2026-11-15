// SPDX-License-Identifier: Apache-2.0
// Activate only actual complete native current resolutions and exact P successors.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
const directory=dirname(fileURLToPath(import.meta.url)),root=resolve(directory,'../../../../../../..')
assert.deepEqual(process.argv.slice(2),['--write'],'Activation requires explicit --write after actual native finalization')
const bytes=path=>readFileSync(resolve(root,path)),json=path=>JSON.parse(bytes(path)),digest=value=>`sha256:${createHash('sha256').update(value).digest('hex')}`
const plan=JSON.parse(readFileSync(resolve(directory,'activation-plan.json'),'utf8'))
const before=bytes(plan.registryPath),registry=JSON.parse(before),subject=registry.subjects.find(item=>item.subject===plan.subject)
assert.ok(subject)
const subjectBefore=structuredClone(subject),allOtherSubjectsBefore=JSON.stringify(registry.subjects.filter(item=>item.subject!==plan.subject))
const ids=plan.goalIds,expectedIds=new Set(ids),descriptionOwners=new Map(),descriptionInputs=[]
assert.equal(expectedIds.size,14)
const currentPages=json('curricula/DE/Gymnasium/quality/goal-evidence/2026-11-15/semiconductor-stage-path-current-v1/post-corrected-independent-review-v3/current14-page-bindings.receipt.json')
assert.equal(currentPages.allCurrentPagesExact,true)
assert.deepEqual([...currentPages.goalIds].sort(),[...expectedIds].sort())
for(const pin of currentPages.sourcePins)assert.equal(digest(bytes(pin.path)),pin.sha256,'Current canonical input changed after exact page comparison')
for(const group of plan.descriptionNewIndexes){
 const index=json(group.indexPath)
 assert.deepEqual(index.batchGoalIds,group.goalIds)
 assert.deepEqual(index.resolutions.map(item=>item.goalId),group.goalIds)
 assert.ok(!subject.resolutionIndexPaths.includes(group.indexPath),'Current index already active')
 for(const entry of index.resolutions){
  assert.equal(entry.strictDescriptionComplete,true);assert.equal(entry.decision,'keep_current')
  assert.ok(expectedIds.has(entry.goalId));assert.ok(!descriptionOwners.has(entry.goalId),'Duplicate current D ownership')
  const path=resolve(root,dirname(group.indexPath),entry.resolutionPath),raw=readFileSync(path),resolution=JSON.parse(raw)
  assert.equal(digest(raw),entry.resolutionDigest);assert.equal(resolution.resolutionFingerprint,entry.resolutionFingerprint)
  assert.equal(resolution.goal.goalId,entry.goalId);assert.equal(resolution.synthesis.authority,'ai_synthesis');assert.equal(resolution.synthesis.humanAttestation,null)
  assert.ok(resolution.rounds.first.runId&&resolution.rounds.second.runId)
  assert.notEqual(resolution.rounds.first.independenceGroupId,resolution.rounds.second.independenceGroupId)
  descriptionOwners.set(entry.goalId,group.indexPath)
 }
 descriptionInputs.push({indexPath:group.indexPath,indexSha256:digest(bytes(group.indexPath)),goalIds:group.goalIds})
}
assert.deepEqual([...descriptionOwners.keys()].sort(),[...expectedIds].sort())
const currentPOwners=new Map(),positiveInputs=[]
for(const path of plan.positiveNewConfigPaths){
 const config=json(path);assert.equal(config.requireApproved,false)
 const records=bytes(config.reviewPath).toString().trim().split('\n').map(line=>JSON.parse(line))
 assert.deepEqual(records.map(item=>item.goalId),config.scope.goalIds)
 assert.ok(!subject.positiveEvidenceConfigPaths.includes(path),'Current P config already active')
 for(const record of records){
  assert.ok(expectedIds.has(record.goalId));assert.ok(!currentPOwners.has(record.goalId),'Duplicate current P ownership')
  assert.equal(record.status,'needs_human_review');assert.equal(record.reviewAuthority,'ai_candidate');assert.equal(record.evidenceLevel,'E1');assert.equal(record.maximumClaimScope,'G1')
  currentPOwners.set(record.goalId,path)
 }
 positiveInputs.push({configPath:path,configSha256:digest(bytes(path)),reviewPath:config.reviewPath,reviewSha256:digest(bytes(config.reviewPath)),goalIds:config.scope.goalIds})
}
assert.deepEqual([...currentPOwners.keys()].sort(),[...expectedIds].sort())
for(const replacement of plan.positiveReplacements){
 const previous=json(replacement.supersededConfigPath),position=subject.positiveEvidenceConfigPaths.indexOf(replacement.supersededConfigPath)
 assert.ok(position>=0,'Old active P ownership missing')
 if(!replacement.retainedConfigPath){assert.deepEqual([...previous.scope.goalIds].sort(),[...replacement.excludedGoalIds].sort());subject.positiveEvidenceConfigPaths.splice(position,1);continue}
 const retained=json(replacement.retainedConfigPath)
 assert.deepEqual(retained.scope.goalIds,previous.scope.goalIds.filter(id=>!replacement.excludedGoalIds.includes(id)))
 const retainedLines=bytes(previous.reviewPath).toString().match(/[^\n]*\n|[^\n]+$/gu).filter(line=>line.trim()&&!replacement.excludedGoalIds.includes(JSON.parse(line).goalId)).join('')
 assert.equal(bytes(retained.reviewPath).toString(),retainedLines)
 subject.positiveEvidenceConfigPaths.splice(position,1,replacement.retainedConfigPath)
}
subject.positiveEvidenceConfigPaths.push(...plan.positiveNewConfigPaths)
subject.resolutionIndexPaths.push(...plan.descriptionNewIndexes.map(item=>item.indexPath))
for(const edge of plan.descriptionSupersessionsAfterActualResolutions){
 assert.ok(subject.resolutionIndexPaths.includes(edge.supersededIndexPath))
 assert.equal(descriptionOwners.get(edge.goalId),edge.replacementIndexPath)
 assert.ok(!subject.resolutionSupersessions.some(item=>item.goalId===edge.goalId&&item.supersededIndexPath===edge.supersededIndexPath),'Goal-specific D successor already exists')
 subject.resolutionSupersessions.push(edge)
}
const claims=new Map()
for(const path of subject.positiveEvidenceConfigPaths)for(const id of json(path).scope.goalIds){assert.ok(!claims.has(id),`${id}: duplicate P ownership`);claims.set(id,path)}
for(const id of ids)assert.equal(claims.get(id),currentPOwners.get(id))
assert.equal(claims.size,481,'Exact current Physics ordinary P ownership must remain complete')
const unchangedPolicy=value=>Object.fromEntries(Object.entries(value).filter(([key])=>!['positiveEvidenceConfigPaths','resolutionIndexPaths','resolutionSupersessions'].includes(key)))
assert.deepEqual(unchangedPolicy(subject),unchangedPolicy(subjectBefore))
assert.equal(JSON.stringify(registry.subjects.filter(item=>item.subject!==plan.subject)),allOtherSubjectsBefore)
const after=Buffer.from(`${JSON.stringify(registry,null,2)}\n`)
const receipt={schemaVersion:1,activatedAt:new Date().toISOString(),registryPath:plan.registryPath,registryBeforeSha256:digest(before),registryAfterSha256:digest(after),goalIds:ids,strictNativeDescriptionResolutions:descriptionOwners.size,descriptionInputs,positiveInputs,positiveReplacements:plan.positiveReplacements,unaffectedHistoricalPRecordsRetained:22,currentPRecordsRetainedByteIdentical:10,newOrRepairedCurrentPCandidates:4,independentHistoricalDissentPreserved:true,note:'Actual distinct informed-own-history current A/B confirmations, native synthesis and strict10+1+3 resolutions precede this single activation. All P remains AI candidate E1/G1, with no human approval or learner performance claim. No policy or floor changed. One full current central gate, root CQR/floors/G17 and fresh integrated CI remain separate requirements. The personal amplifier-experiment source remainder remains explicit.'}
writeFileSync(resolve(root,plan.registryPath),after)
writeFileSync(resolve(directory,'activation.receipt.json'),`${JSON.stringify(receipt,null,2)}\n`)
console.log(`Activated ${descriptionOwners.size} native current D successors and ${currentPOwners.size} current P candidates; exact unique Physics P ownership ${claims.size}; registry ${digest(after)}.`)
