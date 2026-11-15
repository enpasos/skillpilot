// SPDX-License-Identifier: Apache-2.0
// Bounded activation after actual native current applicability reviews/finalization.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
const directory=dirname(fileURLToPath(import.meta.url)),root=resolve(directory,'../../../../../../../..')
assert.deepEqual(process.argv.slice(2),['--write'],'Explicit --write is required after actual strict native finalization')
const bytes=path=>readFileSync(resolve(root,path)),json=path=>JSON.parse(bytes(path)),digest=value=>'sha256:'+createHash('sha256').update(value).digest('hex')
const plan=JSON.parse(readFileSync(resolve(directory,'description-activation-plan.json'),'utf8'))
assert.equal(digest(bytes(plan.canonicalPath)),plan.canonicalSha256,'Canonical input drifted after review seal')
const before=bytes(plan.registryPath),registry=JSON.parse(before),subject=registry.subjects.find(item=>item.subject==='physik')
assert.ok(subject)
const subjectBefore=structuredClone(subject),otherSubjects=JSON.stringify(registry.subjects.filter(item=>item.subject!=='physik'))
assert.ok(!subject.resolutionIndexPaths.includes(plan.replacementIndexPath),'Successor index is already active')
const index=json(plan.replacementIndexPath)
assert.deepEqual(index.batchGoalIds,plan.goalIds)
assert.deepEqual(index.resolutions.map(item=>item.goalId),plan.goalIds)
const verified=[]
for(const entry of index.resolutions){
 assert.equal(entry.strictDescriptionComplete,true)
 assert.equal(entry.decision,'keep_current','Any substantive new issue must be resolved before activation')
 const path=resolve(root,dirname(plan.replacementIndexPath),entry.resolutionPath),raw=readFileSync(path),resolution=JSON.parse(raw)
 assert.equal(digest(raw),entry.resolutionDigest)
 assert.equal(resolution.resolutionFingerprint,entry.resolutionFingerprint)
 assert.equal(resolution.goal.goalId,entry.goalId)
 assert.equal(resolution.synthesis.authority,'ai_synthesis')
 assert.equal(resolution.synthesis.humanAttestation,null)
 assert.ok(resolution.rounds.first.runId&&resolution.rounds.second.runId)
 assert.notEqual(resolution.rounds.first.independenceGroupId,resolution.rounds.second.independenceGroupId)
 verified.push({goalId:entry.goalId,resolutionPath:entry.resolutionPath,resolutionDigest:entry.resolutionDigest,firstRunId:resolution.rounds.first.runId,secondRunId:resolution.rounds.second.runId})
}
assert.equal(verified.length,3)
for(const pin of plan.preservedEvidencePins)assert.equal(digest(bytes(pin.path)),pin.sha256,'Unchanged P/A/M/V/V9 evidence drifted: '+pin.path)
for(const edge of plan.supersessions){
 assert.ok(subject.resolutionIndexPaths.includes(edge.supersededIndexPath))
 assert.equal(edge.replacementIndexPath,plan.replacementIndexPath)
 assert.ok(json(edge.supersededIndexPath).batchGoalIds.includes(edge.goalId))
 assert.ok(!subject.resolutionSupersessions.some(item=>item.goalId===edge.goalId&&item.supersededIndexPath===edge.supersededIndexPath),'Duplicate successor edge')
 subject.resolutionSupersessions.push(edge)
}
subject.resolutionIndexPaths.push(plan.replacementIndexPath)
const unchangedPolicy=value=>Object.fromEntries(Object.entries(value).filter(([key])=>!['resolutionIndexPaths','resolutionSupersessions'].includes(key)))
assert.deepEqual(unchangedPolicy(subject),unchangedPolicy(subjectBefore),'Only D indexes and exact three successor edges may change')
assert.equal(JSON.stringify(registry.subjects.filter(item=>item.subject!=='physik')),otherSubjects)
const after=Buffer.from(JSON.stringify(registry,null,2)+'\n')
const receipt={schemaVersion:1,activatedAt:new Date().toISOString(),canonicalSha256:plan.canonicalSha256,registryPath:plan.registryPath,registryBeforeSha256:digest(before),registryAfterSha256:digest(after),replacementIndexPath:plan.replacementIndexPath,indexSha256:digest(bytes(plan.replacementIndexPath)),goalIds:plan.goalIds,actualStrictNativeResolutions:verified,supersessions:plan.supersessions,preservedEvidencePins:plan.preservedEvidencePins,note:'Only three D successors activated after actual independent current A/B reviews and native strict finalization. P/A/M/V raw evidence, all policies/floors, other subjects and immutable V9 are byte-identical. No human approval or learner execution is asserted. Integrated full quality/floor checks are root-owned.'}
writeFileSync(resolve(root,plan.registryPath),after)
writeFileSync(resolve(directory,'description-activation.receipt.json'),JSON.stringify(receipt,null,2)+'\n')
console.log('Activated exactly3 native current D successors; all P/A/M/V evidence and other subjects preserved. Registry '+digest(after))
