// SPDX-License-Identifier: Apache-2.0
import { readFileSync,writeFileSync,existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'
const repo=process.cwd(),own=resolve(process.argv[2]),read=(p:string)=>JSON.parse(readFileSync(resolve(repo,p),'utf8'))
const f=read(resolve(own,'INPUTS.final-six-stable-bodies-images-and-successor-material.json'))
const p=read(resolve(own,'INPUTS.two-exact-Q2-causal-neighbor-contexts.json')),host=resolve(repo,f.executionHost)
const {loadGoalDescriptionRolloutBatchConfig}=await import(pathToFileURL(resolve(host,'app/scripts/materializeGoalDescriptionRolloutBatch.ts')).href)
const {parseGoalBookEvidenceReviewRecord,validateGoalBookEvidenceReviewRecordSemantics}=await import(pathToFileURL(resolve(host,'app/scripts/goalBookEvidenceReviewLoader.ts')).href)
const loaded=await loadGoalDescriptionRolloutBatchConfig(p.nativeConfig.path)
assert.deepEqual(loaded.config.goalIds,p.goalIds)
const canonical=read(f.canonical.path),qa=read(f.visualizationQA.path)
const rows=readFileSync(resolve(repo,p.exactOwnProfiles.path),'utf8').trim().split('\n').map((x:string)=>JSON.parse(x))
for(const raw of rows){const r=parseGoalBookEvidenceReviewRecord(raw,'existing exact current neighbor raw P');const goal=canonical.goals.find((g:any)=>g.id===r.goalId);const asset=qa.records.find((g:any)=>g.goalId===r.goalId);assert.deepEqual(validateGoalBookEvidenceReviewRecordSemantics(r,goal,{[asset.imageUrl]:asset.assetSha256},'curricularAtomic'),[])}
const out=resolve(own,'checks/PREFLIGHT.native-neighbor-two.closed-config-and-exact-current-profiles.json');assert.ok(!existsSync(out));writeFileSync(out,JSON.stringify({schemaVersion:1,closedConfig:'PASS',exactCurrentOwnProfileSemantics:'PASS',goalIds:p.goalIds,rawExistingOwnProfilesRetainedExactly:true,newModelCalls:0,newRenders:0},null,2)+'\n');console.log(JSON.stringify({closedConfig:'PASS',currentOwnProfileSemantics:'PASS',scope:2,modelCalls:0,renders:0}))
