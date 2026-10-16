// SPDX-License-Identifier: Apache-2.0
import {readFileSync,writeFileSync,existsSync} from 'node:fs'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
const repo=process.cwd(),own=resolve(process.argv[2]),read=(p:string)=>JSON.parse(readFileSync(resolve(repo,p),'utf8'))
const f=read(resolve(own,'INPUTS.final-eight-stable-current-profiles-and-neutral-material.json')),host=resolve(repo,f.executionHost),cfg=read(f.P2Config.path)
const P=await import(pathToFileURL(resolve(host,'app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
const c=read(f.canonical.path),s=read(f.semantic.path),by=new Map(c.goals.map((g:any)=>[g.id,g])) as Map<string,any>,kinds=new Map(s.decisions.map((d:any)=>[d.goalId,d.semanticKind])) as Map<string,string>
const hash=(p:string)=>`sha256:${createHash('sha256').update(readFileSync(p)).digest('hex')}`,criteria=hash(resolve(repo,cfg.reviewCriteriaPath));assert.equal(criteria,'sha256:4ed61d2a8c7eb84dd13315427d46989b4750f58620481e19023b145935025835')
const rows=read(f.P2OriginalScienceSeed.path);assert.equal(rows.length,2)
for(const r of rows){const g=by.get(r.goalId);assert.ok(g);assert.equal(r.reviewCriteriaFingerprint,criteria);const digests=Object.fromEntries((g.resourceLinks??[]).filter((l:any)=>cfg.reviewedResourceTypes.includes(l.type)).map((l:any)=>[l.url,hash(resolve(host,'app/public',l.url.slice(1)))]));const gf=P.fingerprintGoalForPositiveEvidence(g,kinds.get(g.id)),input=P.fingerprintPositiveGoalEvidenceReviewInput(g,criteria,digests,kinds.get(g.id)),pf=P.fingerprintPositiveGoalEvidenceProfile(r.profile);assert.equal(gf,r.goalFingerprint);assert.equal(input,r.reviewInputFingerprint);assert.notEqual(pf,r.profileFingerprint);r.profileFingerprint=pf;assert.deepEqual(r.reviewRunIds,[]);assert.deepEqual(P.validatePositiveGoalEvidenceRecordSemantics(r,g,digests,kinds.get(g.id)),[])}
const out=resolve(repo,cfg.reviewPath);assert.ok(!existsSync(out));writeFileSync(out,rows.map((r:any)=>JSON.stringify(r)).join('\n')+'\n');console.log(JSON.stringify({currentGenuineP2:2,actualStockFingerprints:true,originalWholeProfilesUnchanged:true,newScienceVotes:0,newRunClaims:0}))
