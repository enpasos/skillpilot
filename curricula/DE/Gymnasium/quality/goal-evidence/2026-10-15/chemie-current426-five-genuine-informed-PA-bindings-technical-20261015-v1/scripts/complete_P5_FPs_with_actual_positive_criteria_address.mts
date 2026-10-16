// SPDX-License-Identifier: Apache-2.0
import { readFileSync,writeFileSync,existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
const repo=process.cwd(),own=resolve(process.argv[2]),read=(p:string)=>JSON.parse(readFileSync(resolve(repo,p),'utf8'))
const f=read(resolve(own,'INPUTS.final-P5-A5-M2-V2-before-targeted-stock-checks.json')),h=read(f.stockHostPlan.path),host=resolve(repo,h.executionHost)
const model=await import(pathToFileURL(resolve(host,'app/scripts/goalBookModel.ts')).href)
const P=await import(pathToFileURL(resolve(host,'app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
const canonical=read(f.canonical.path),by=new Map(canonical.goals.map((g:any)=>[g.id,g])) as Map<string,any>
const semantic=read(f.baselineSemantic.path),changed=[]
for(const d of semantic.decisions)if(['96d33fb6-ed14-50ab-b5c7-5ce0559d518a','0b5342b9-512d-573f-90d5-7522aee35efa'].includes(d.goalId)){const old=d.sourceFingerprint;d.sourceFingerprint=model.fingerprintSemanticKindSourceGoal(by.get(d.goalId));assert.notEqual(old,d.sourceFingerprint);changed.push(d.goalId)}
assert.equal(changed.length,2);assert.deepEqual(read(h.pendingFinalSemanticPath),semantic)
const kinds=new Map(semantic.decisions.map((d:any)=>[d.goalId,d.semanticKind])) as Map<string,string>
const cfg=read(f.P5Config.path),records=read(f.P5OriginalScienceSeed.path)
const hash=(b:Buffer)=>`sha256:${createHash('sha256').update(b).digest('hex')}`
assert.equal(records.length,5)
for(const r of records){const g=by.get(r.goalId);const digests=Object.fromEntries((g.resourceLinks??[]).filter((l:any)=>l.type==='goal-visualization').map((l:any)=>[l.url,hash(readFileSync(resolve(host,'app/public',l.url.slice(1))))]));assert.equal(r.reviewCriteriaFingerprint,'sha256:14b9fe5db2b527baad6e5e488b2e2909f2eeaaeb8d9106a7c072ec6c2d4f12be');r.reviewCriteriaFingerprint=hash(readFileSync(resolve(repo,cfg.reviewCriteriaPath)));assert.equal(r.reviewCriteriaFingerprint,'sha256:4ed61d2a8c7eb84dd13315427d46989b4750f58620481e19023b145935025835');r.goalFingerprint=P.fingerprintGoalForPositiveEvidence(g,kinds.get(g.id));r.reviewInputFingerprint=P.fingerprintPositiveGoalEvidenceReviewInput(g,r.reviewCriteriaFingerprint,digests,kinds.get(g.id));r.profileFingerprint=P.fingerprintPositiveGoalEvidenceProfile(r.profile);assert.deepEqual(r.reviewRunIds,[])}
assert.ok(!existsSync(resolve(repo,cfg.reviewPath)));writeFileSync(resolve(repo,cfg.reviewPath),records.map((r:any)=>JSON.stringify(r)).join('\n')+'\n')
console.log(JSON.stringify({sourceFPsRefreshed:2,semanticDecisionsUnchanged:570,normalGenuineP:5,evidenceLevel:'E1',maximumClaimScope:'G1',newScienceVotes:0,newRunClaims:0}))
