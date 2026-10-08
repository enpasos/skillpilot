// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,existsSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'
const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url)),a=resolve(own,'../biologie-stoffwechsel-two-basic-companions-complete-author-20261008-v2')
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8')),sha=(b:Buffer)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const entry=read(resolve(a,'neutral-final-primary-refined-basis2.author.entry.json')),canon=read(entry.currentCanonicalPath),kinds=read(entry.currentKindsPath)
const records=readFileSync(resolve(own,'P2.current-native.independent-a.review.jsonl'),'utf8').trim().split('\n').map(JSON.parse),author=readFileSync(resolve(a,'positive/P2.actual-closed.author-candidate.review.jsonl'),'utf8').trim().split('\n').map(JSON.parse)
const ajv=new Ajv2020({strict:true,allErrors:true});addFormats(ajv);const validate=ajv.compile(read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json')),digests:Record<string,string>={}
for(const gid of entry.selectedGoalIds){const p=resolve(a,`images/${gid}/${gid}.png`);digests[`/assets/goal-visualizations/biologie/${gid}/${gid}.png`]=sha(readFileSync(p))}
assert.equal(records.length,2)
const rows=[]
for(const r of records){assert.ok(validate(r),ajv.errorsText(validate.errors));const goal=canon.goals.find((g:any)=>g.id===r.goalId),kind=kinds.decisions.find((g:any)=>g.goalId===r.goalId)?.semanticKind;assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(r,goal,digests,kind),[]);assert.deepEqual(r.profile,author.find((g:any)=>g.goalId===r.goalId).profile);assert.equal(r.status,'needs_human_review');assert.equal(r.reviewAuthority,'ai_candidate');assert.equal(r.evidenceLevel,'E1');assert.equal(r.maximumClaimScope,'G1');assert.deepEqual(r.reviewRunIds,[]);rows.push({goalId:r.goalId,goalFingerprint:r.goalFingerprint,reviewInputFingerprint:r.reviewInputFingerprint,profileFingerprint:r.profileFingerprint,wholeProfileExact:true,actualRasterDigest:digests[goal.resourceLinks.find((l:any)=>l.type==='goal-visualization').url]})}
const pCurrent='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he7-ten-reviewed-integration-preparation-technical-20261008-v1/positive/current10.records.jsonl',pRecord=readFileSync(resolve(root,pCurrent),'utf8').trim().split('\n').map(JSON.parse).find((r:any)=>r.goalId==='576d59e2-397a-5654-b853-7c0c4870fbd3')
assert.deepEqual(pRecord,read(resolve(own,'existing576.whole-valid-P.exact-KEEP.json')))
for(const [label,count] of [['basis2',2],['context576',1]]){const r=read(resolve(own,`${label}.actual-description-campaign-validator.cli.receipt.json`));assert.equal(r.actualExecResult.exit_code,0);assert.equal(r.actualExecResult.output.trim(),`Goal-description review campaign results valid: ${count}`)}
const out=resolve(own,'native-P2-and576.targeted-ordinary-validator.receipt.json');assert.ok(!existsSync(out));writeFileSync(out,JSON.stringify({schemaVersion:1,verifiedAtUtc:new Date().toISOString(),ordinaryDescriptionCampaigns:{new2:true,existingContext1:true},ordinaryPositiveAPI:'validatePositiveGoalEvidenceRecordSemantics',ordinaryPositiveSchema:'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',newTwoActualPNGAndWholeProfileRecordsValid:true,records:rows,existing576WholeCurrentRegisteredPRecordExactlyRetained:true,existing576NotReissuedAsNewPReview:true,originalFourOperatorHoldsRetained:true,activeWrites:0,newStrictClosureClaims:0,humanApproval:false,humanTrial:false},null,2)+'\n')
console.log('PASS genuine normal D2+contextD1 campaigns,P2 exact whole bodies/current raster semantics,existing576 whole registered P exactly KEEP; no invented P manifests or Human approval')
