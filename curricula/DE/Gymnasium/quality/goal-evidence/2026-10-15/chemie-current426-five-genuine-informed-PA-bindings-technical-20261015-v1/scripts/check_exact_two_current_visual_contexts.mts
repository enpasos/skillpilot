// SPDX-License-Identifier: Apache-2.0
import { readFileSync,writeFileSync,existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
const repo=process.cwd(),own=resolve(process.argv[2]),read=(p:string)=>JSON.parse(readFileSync(resolve(repo,p),'utf8'))
const f=read(resolve(own,'INPUTS.final-P5-A5-M2-V2-before-targeted-stock-checks.json')),h=read(f.stockHostPlan.path),host=resolve(repo,h.executionHost)
const {hasCompletedDeepUnderstandingVisualizationReview}=await import(pathToFileURL(resolve(host,'app/scripts/reportDeepUnderstandingRollout.ts')).href)
const qa=read(h.pendingFinalQAPath),c=read(f.canonical.path),rows=[]
const hash=(p:string)=>`sha256:${createHash('sha256').update(readFileSync(p)).digest('hex')}`
for(const id of ['96d33fb6-ed14-50ab-b5c7-5ce0559d518a','0b5342b9-512d-573f-90d5-7522aee35efa']){const g=c.goals.find((g:any)=>g.id===id),r=qa.records.find((r:any)=>r.goalId===id),link=g.resourceLinks.find((l:any)=>l.type==='goal-visualization'&&(l.role??'primary')==='primary');assert.equal(g.title,r.title);assert.equal(g.description,r.description);assert.equal(link.url,r.imageUrl);assert.equal(hash(resolve(host,r.publicAssetPath)),r.assetSha256);assert.equal(hash(resolve(host,r.canonicalAssetPath)),r.assetSha256);assert.ok(hasCompletedDeepUnderstandingVisualizationReview(r));rows.push({goalId:id,exactAsset:r.assetSha256,actualUnchangedStockVPredicate:true,exactCurrentMetadata:true})}
const out=resolve(own,'checks/V2.actual-unchanged-stock-predicate-current-text-image-bindings.json');assert.ok(!existsSync(out));writeFileSync(out,JSON.stringify({schemaVersion:1,rows,currentSourceBindings:2,newScientificVotes:0},null,2)+'\n');console.log(JSON.stringify({actualStrictCurrentV:2,expected:2,pass:true}))
