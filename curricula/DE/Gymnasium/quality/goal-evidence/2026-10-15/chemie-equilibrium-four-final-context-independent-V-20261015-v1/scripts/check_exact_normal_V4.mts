// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
const [repo,host,own]=process.argv.slice(2)
const read=(p:string)=>JSON.parse(readFileSync(resolve(own,p),'utf8'))
const digest=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const qa=await import(pathToFileURL(resolve(host,'app/scripts/goalVisualizationQaModel.ts')).href)
const central=await import(pathToFileURL(resolve(host,'app/scripts/reportDeepUnderstandingRollout.ts')).href)
const book=await import(pathToFileURL(resolve(host,'app/scripts/goalBookModel.ts')).href)
const status=await import(pathToFileURL(resolve(host,'app/src/utils/goalVisualizationQaStatus.ts')).href)
const firstSeal=read('FIRST.actual-four-context-V-decisions.seal.json')
for(const r of firstSeal.files)assert.equal(digest(resolve(repo,r.path)),r.sha256)
assert.equal(firstSeal.normalVBindingsAtSeal,0)
const first=JSON.parse(readFileSync(resolve(repo,firstSeal.files[0].path),'utf8'))
const binding=read('BINDING.exact-four-final-DEEN-ALT-JPG.normal-V.actual.json')
assert.ok(Date.parse(firstSeal.sealedAtUTC)<Date.parse(binding.boundAtUTC))
const canonical=JSON.parse(readFileSync(resolve(repo,binding.finalCanonical.path),'utf8'))
const semantic=JSON.parse(readFileSync(resolve(repo,binding.finalSemanticSourceOnly.path),'utf8'))
assert.equal(digest(resolve(repo,binding.finalCanonical.path)),binding.finalCanonical.sha256)
assert.equal(digest(resolve(repo,binding.finalSemanticSourceOnly.path)),binding.finalSemanticSourceOnly.sha256)
const normal=read('qa/V4.final-context.normal-alias.qa.json'),physical=read('qa/V4.final-context.physical-transport.qa.json')
const transport=read('TRANSPORT.normal-aliases-to-exact-physical-files.json')
const aliases=new Map(transport.normalAliases.map((r:any)=>[r.normalAlias,r.physical]))
assert.equal(normal.records.length,4);assert.equal(physical.records.length,4)
for(const r of normal.records){
 const f=first.decisions.find((d:any)=>d.goalId===r.goalId),g=canonical.goals.find((g:any)=>g.id===r.goalId)
 assert.deepEqual(g,f.wholeFinalGoal);assert.equal(r.title,g.title);assert.equal(r.description,g.description)
 const image=g.resourceLinks.find((l:any)=>l.type==='goal-visualization');assert.equal(r.imageUrl,image.url)
 const other=physical.records.find((p:any)=>p.goalId===r.goalId)
 for(const key of ['landscapePath','canonicalAssetPath','publicAssetPath']){
  const source:any=aliases.get(r[key]);assert.ok(source);assert.equal(other[key],source.path)
  assert.equal(digest(resolve(repo,source.path)),source.sha256);assert.equal(digest(resolve(host,r[key])),source.sha256)
  if(key!=='landscapePath')assert.equal(source.sha256,r.assetSha256)
 }
 for(const key of Object.keys(r).filter(k=>!['landscapePath','canonicalAssetPath','publicAssetPath'].includes(k)))assert.deepEqual(other[key],r[key])
 for(const row of [r,other]){
  const accepted=f.decision==='accepted';assert.equal(qa.isGoalVisualizationAiApproved(row),accepted)
  assert.equal(qa.normalizeGoalVisualizationAiReview(row,row.assetSha256).aiApproved,accepted?'yes':'no')
  assert.equal(status.aiApprovalStatus(row),accepted?'approved':'rejected')
  assert.equal(central.hasCompletedDeepUnderstandingVisualizationReview(row),accepted)
  assert.equal(row.humanApproved,'no');assert.equal(row.humanReviewedAt,null)
 }
 const sem=semantic.decisions.find((s:any)=>s.goalId===r.goalId)
 assert.equal(sem.sourceFingerprint,book.fingerprintSemanticKindSourceGoal(g))
}
const whole=read('qa/QA438.original434-plus-four-genuine-current-context-reviews.candidate.json')
const source=JSON.parse(readFileSync(resolve(repo,binding.oldQA438.path),'utf8'))
assert.equal(digest(resolve(repo,binding.oldQA438.path)),binding.oldQA438.sha256)
assert.equal(whole.records.length,438);assert.equal(source.records.length,438)
const target=new Set(normal.records.map((r:any)=>r.goalId))
let exact=0
for(const old of source.records){const next=whole.records.find((r:any)=>r.goalId===old.goalId);if(!target.has(old.goalId)){assert.deepEqual(old,next);exact++}}
assert.equal(exact,434)
console.log(JSON.stringify({schemaVersion:1,checkedAtUTC:new Date().toISOString(),role:'Targeted unchanged stock V helpers only; no whole-subject generator or central execution',
 uniqueScientificVotes:4,physicalTransportAddsVotes:0,accepted:2,rejectedNeedsRevision:2,normalizationAndCompletionPredicatesExact:true,
 whole438Rows:438,other434WholeRowsExact:true,finalWholeDEENALTContextExact:true,semanticSourceFPsMatchStock:true,
 nativeJPGBytesExact:true,physicalImageCopies:0,FIRSTBeforeNormalBinding:true,humanApproval:false,sourceCourseApproval:false,
 DPAOrMemoryVotes:0,centralExecuted:false,errors:[]},null,2))
