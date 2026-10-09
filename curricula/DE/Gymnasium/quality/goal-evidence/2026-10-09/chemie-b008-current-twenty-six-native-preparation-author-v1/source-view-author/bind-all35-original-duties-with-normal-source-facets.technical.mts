// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sourceAtlasFacet } from '../../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
const root=resolve('.'), own=dirname(dirname(fileURLToPath(import.meta.url))),read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const input=read(resolve(own,'input/current-whole-source-partner-atomicity-memory-frame.neutral.json')),plan=read(resolve(own,'whole-current378-and-inactive395.concrete-gaps-and-compiler-plan.json'))
const gs=new Map(read(resolve(own,'candidate/canonical504-current26-resource-links.inactive.json')).goals.map((g:any)=>[g.id,g])),bind=(p:string)=>{const b=readFileSync(p);return {path:relative(root,p),sha256:'sha256:'+createHash('sha256').update(b).digest('hex'),bytes:b.length}}
const mappings=input.wholeCurrent32SourceMappingExtractionBindings.map((p:any)=>({binding:p,mapping:read(resolve(root,p.mapping.path)),extraction:read(resolve(root,p.extraction.path))}))
const rows=[]
for(const v of plan.ordinaryProjectionHolds16Views35Findings)for(const finding of v.findings){
 const sources=[]
 for(const {binding,mapping:m,extraction:e} of mappings){if(e.jurisdiction!==v.scope.jurisdiction)continue
 const eg=new Map(e.sourceGoals.map((g:any)=>[g.id,g])),ep=new Map(e.passages.map((p:any)=>[p.id,p]))
 for(const d of m.decisions){const targets=(d.canonicalGoalIds??[]).map((i:string)=>i.replace(m.targetLandscapeId+':',''));if(!targets.includes(finding.goalId))continue
 const sg:any=eg.get(d.sourceGoalId),pass:any=ep.get(sg.passageId);assert.ok(sg&&pass)
 const docs=e.sourceDocuments?.length?e.sourceDocuments:[e.sourceDocument]
 const keys=[sg.sourceDocumentKey,...(sg.tags??[]).filter((t:string)=>t.startsWith('sourceDocument:')).map((t:string)=>t.slice(15)),pass.sourceDocumentKey].filter(Boolean)
 const selected=keys.length?docs.filter((d:any)=>keys.includes(d.key)):docs
 assert.ok(selected.length>0)
 const facets=selected.map((doc:any)=>({doc,stage:sourceAtlasFacet([sg,pass,doc,e],'stage'),course:sourceAtlasFacet([sg,pass,doc,e],'courseProfile')}))
 const bounded=facets.filter((f:any)=>f.stage?.includes(v.scope.stage)&&(!v.scope.courseProfile||f.course?.includes(v.scope.courseProfile)||f.course?.length===0))
 if(!bounded.length)continue
 sources.push({mappingBinding:binding.mapping,extractionBinding:binding.extraction,wholeDecision:d,wholeSourceGoal:sg,wholePassage:pass,wholeSourceDocuments:docs,actualNormalSourceFacetResults:facets,courseBoundExplicitly:bounded.every((f:any)=>!v.scope.courseProfile||f.course?.includes(v.scope.courseProfile)),wholePartnerGoals:targets.filter((i:string)=>i!==finding.goalId).map((i:string)=>gs.get(i))})
 }
 }
 rows.push({viewId:v.viewId,wholeScope:v.scope,beforeViewBinding:v.view,finding,wholeCanonicalFamily:gs.get(finding.goalId),wholeFamilyChildren:(gs.get(finding.goalId) as any).contains.map((i:string)=>gs.get(i)),wholeOriginalSourceDutiesAndPartnerContexts:sources})
}
assert.equal(rows.length,35)
const p=resolve(own,'source-view-author/original35-opaque-entries-whole-source-operator-partner-v2-normal-facets.neutral-input.json');assert.ok(!existsSync(p));writeFileSync(p,JSON.stringify({schemaVersion:1,role:'Actual complete original source/operator/partner input using ordinary sourceAtlasFacet for mixed-stage and course records; no new source/view approval',normalFacetApi:'app/scripts/goalBookSourceAtlasInputs.ts sourceAtlasFacet unchanged',entries:rows,scopeCount:16,opaqueEntryCount:35,actualDutyOccurrenceCount:rows.reduce((n:any,r:any)=>n+r.wholeOriginalSourceDutiesAndPartnerContexts.length,0),firstIncompleteExtractionBeforeNormalFacetKept:'source-view-author/original35-opaque-entries-whole-source-operator-partner.neutral-input.json',activeWrites:[],strictGain:0},null,2)+'\n')
console.log(JSON.stringify({entries:35,scopes:16,dutyOccurrences:rows.reduce((n:any,r:any)=>n+r.wholeOriginalSourceDutiesAndPartnerContexts.length,0),BY:rows.filter((r:any)=>r.wholeScope.jurisdiction==='DE-BY').map((r:any)=>({viewId:r.viewId,duties:r.wholeOriginalSourceDutiesAndPartnerContexts.length})),actualExitCode:0}))
