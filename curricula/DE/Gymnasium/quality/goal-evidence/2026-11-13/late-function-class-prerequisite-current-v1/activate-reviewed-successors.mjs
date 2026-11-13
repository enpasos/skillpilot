// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const directory=dirname(fileURLToPath(import.meta.url)), root=resolve(directory,'../../../../../../..')
assert.deepEqual(process.argv.slice(2),['--write'],'Activation requires explicit --write after native finalization')
const bytes=path=>readFileSync(resolve(root,path))
const json=path=>JSON.parse(bytes(path))
const digest=value=>`sha256:${createHash('sha256').update(value).digest('hex')}`
const plan=JSON.parse(readFileSync(resolve(directory,'activation-plan.json'),'utf8'))
const registryBefore=bytes(plan.registryPath), registry=JSON.parse(registryBefore)
const subject=registry.subjects.find(item=>item.subject===plan.subject)
assert.ok(subject)
const ids=plan.descriptionSupersessionsAfterActualResolutions.map(item=>item.goalId)
const index=json(plan.descriptionNewIndexPath)
assert.deepEqual(index.batchGoalIds,ids)
assert.equal(index.resolutions.length,ids.length)
for(const entry of index.resolutions){
 assert.equal(entry.strictDescriptionComplete,true)
 assert.equal(entry.decision,'keep_current')
 const resolutionPath=resolve(root,dirname(plan.descriptionNewIndexPath),entry.resolutionPath)
 const resolutionBytes=readFileSync(resolutionPath), resolution=JSON.parse(resolutionBytes)
 assert.equal(digest(resolutionBytes),entry.resolutionDigest)
 assert.equal(resolution.resolutionFingerprint,entry.resolutionFingerprint)
 assert.equal(resolution.goal.goalId,entry.goalId)
 assert.equal(resolution.synthesis.authority,'ai_synthesis')
 assert.equal(resolution.synthesis.humanAttestation,null)
 assert.ok(resolution.rounds.first.runId&&resolution.rounds.second.runId)
 assert.notEqual(resolution.rounds.first.independenceGroupId,resolution.rounds.second.independenceGroupId)
}
assert.ok(!subject.resolutionIndexPaths.includes(plan.descriptionNewIndexPath),'successors already active')
const newP=json(plan.positiveNewConfigPath)
assert.deepEqual(newP.scope.goalIds,ids)
const pRecords=bytes(newP.reviewPath).toString().trim().split('\n').map(line=>JSON.parse(line))
assert.deepEqual(pRecords.map(item=>item.goalId),ids)
for(const record of pRecords){assert.equal(record.status,'needs_human_review');assert.equal(record.reviewAuthority,'ai_candidate');assert.equal(record.evidenceLevel,'E1');assert.equal(record.maximumClaimScope,'G1')}
for(const replacement of plan.positiveReplacements){
 const previous=json(replacement.supersededConfigPath),retained=json(replacement.retainedConfigPath)
 assert.deepEqual(retained.scope.goalIds,previous.scope.goalIds.filter(id=>!replacement.excludedGoalIds.includes(id)))
 const retainedLines=bytes(previous.reviewPath).toString().match(/[^\n]*\n|[^\n]+$/gu).filter(line=>line.trim()&&!replacement.excludedGoalIds.includes(JSON.parse(line).goalId)).join('')
 assert.equal(bytes(retained.reviewPath).toString(),retainedLines)
 const position=subject.positiveEvidenceConfigPaths.indexOf(replacement.supersededConfigPath)
 assert.ok(position>=0,'old active P ownership missing')
 subject.positiveEvidenceConfigPaths.splice(position,1,replacement.retainedConfigPath)
}
assert.ok(!subject.positiveEvidenceConfigPaths.includes(plan.positiveNewConfigPath))
subject.positiveEvidenceConfigPaths.push(plan.positiveNewConfigPath)
subject.resolutionIndexPaths.push(plan.descriptionNewIndexPath)
for(const edge of plan.descriptionSupersessionsAfterActualResolutions){
 assert.ok(subject.resolutionIndexPaths.includes(edge.supersededIndexPath))
 assert.ok(!subject.resolutionSupersessions.some(item=>item.goalId===edge.goalId&&item.supersededIndexPath===edge.supersededIndexPath),'goal-specific D successor already exists')
 subject.resolutionSupersessions.push(edge)
}
// Check exact P ownership rather than accepting a plausible replacement list.
const claims=new Map()
for(const path of subject.positiveEvidenceConfigPaths)for(const id of json(path).scope.goalIds){assert.ok(!claims.has(id),`${id}: duplicate P ownership`);claims.set(id,path)}
for(const id of ids)assert.equal(claims.get(id),plan.positiveNewConfigPath)
const registryAfter=Buffer.from(`${JSON.stringify(registry,null,2)}\n`)
const receipt={schemaVersion:1,registryPath:plan.registryPath,registryBeforeSha256:digest(registryBefore),registryAfterSha256:digest(registryAfter),newDescriptionIndexPath:plan.descriptionNewIndexPath,newDescriptionIndexSha256:digest(bytes(plan.descriptionNewIndexPath)),goalIds:ids,strictNativeDescriptionResolutions:ids.length,positiveReplacements:plan.positiveReplacements,positiveNewConfigPath:plan.positiveNewConfigPath,positiveCandidateCount:pRecords.length,retainedOriginalRecords:13,independentDissentPreserved:true,note:'Actual blind current D rounds, informed AI synthesis and native strict resolutions precede activation. P remains AI candidate E1/G1. Full current central D/P/A/M/V, CQR, protected floors and remote CI are separate checks; no human approval or learner performance claimed.'}
writeFileSync(resolve(root,plan.registryPath),registryAfter)
writeFileSync(resolve(directory,'activation.receipt.json'),`${JSON.stringify(receipt,null,2)}\n`)
console.log(`Activated ${ids.length} native D successors and ${pRecords.length} current P candidates; retained thirteen original P lines; registry ${digest(registryAfter)}.`)
