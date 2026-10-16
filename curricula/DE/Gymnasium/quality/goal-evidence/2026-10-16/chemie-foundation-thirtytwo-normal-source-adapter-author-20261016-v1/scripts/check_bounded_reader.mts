// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const R=process.cwd(),O=resolve(R,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-foundation-thirtytwo-normal-source-adapter-author-20261016-v1');
const read=(p:string)=>JSON.parse(readFileSync(resolve(R,p),'utf8'));
const pin=(p:string)=>{const b=readFileSync(resolve(R,p));return{path:relative(R,resolve(R,p)),sha256:'sha256:'+createHash('sha256').update(b).digest('hex'),bytes:b.length}};
const {sourceAtlasFacet}=await import(pathToFileURL(resolve(R,'app/scripts/goalBookSourceAtlasInputs.ts')).href);
const neutral=read(resolve(O,'NEUTRAL.nine-complete-source-mapping-pairs.thirtytwo-current-cells.selector.json'));
const identities=new Map(read(neutral.portableInformedIdentityCheck.path).checks.map((x:any)=>[x.currentSourceGoalId,x]));
const aliases=new Map(neutral.futureIsolatedHostAliases.map((x:any)=>[x.normalHostAlias,x.physicalRepositorySource]));
const results=[],holds=[];let totalSelected=0;
for(const row of neutral.rows){
 const mapping=read(row.completeMapping.path);assert.deepEqual(pin(row.completeMapping.path),row.completeMapping);
 const bound:any=aliases.get(mapping.sourceExtractionPath);assert.deepEqual(bound,row.completeExtraction);assert.deepEqual(pin(bound.path),bound);
 const extraction=read(bound.path);assert.equal(mapping.sourceLandscapeId,extraction.sourceLandscapeId);assert.equal(extraction.jurisdiction,row.jurisdiction);
 const goals=new Map<string,any>(extraction.sourceGoals.map((g:any)=>[g.id,g]));const passages=new Map<string,any>(extraction.passages.map((p:any)=>[p.id,p]));
 assert.equal(goals.size,extraction.sourceGoals.length);assert.equal(passages.size,extraction.passages.length);
 const decisions=new Map<string,any>();const scopes=[];let unresolved=0;
 for(const d of mapping.decisions){
  assert.ok(!decisions.has(d.sourceGoalId));decisions.set(d.sourceGoalId,d);const goal=goals.get(d.sourceGoalId);assert.ok(goal);const passage=passages.get(goal.passageId);assert.ok(passage);
  assert.ok(d.reviewer&&d.reviewedAt&&d.rationale);
  // Bounded reproduction of the actual stock sourceDocument resolver at lines88ff.
  const docs=[...(extraction.sourceDocuments??[])];if(!docs.length&&extraction.sourceDocument)docs.push(extraction.sourceDocument);
  const sourceTags=(goal.tags??[]).filter((x:string)=>x.startsWith('sourceDocument:')).map((x:string)=>x.slice('sourceDocument:'.length));
  const keys=[...new Set([goal.sourceDocumentKey,...sourceTags,passage.sourceDocumentKey].filter(Boolean))];
  if(keys.length>1){holds.push({sourceGoalId:goal.id,reason:'Conflicting source document keys',keys});continue;}
  const matches=keys.length?docs.filter((x:any)=>x.key===keys[0]):docs;
  if(matches.length!==1){holds.push({sourceGoalId:goal.id,reason:'Source document selection is not unique',keys,matches:matches.map((x:any)=>x.key)});continue;}
  const document=matches[0];assert.equal(document.official,true);assert.ok(document.path);const url=new URL(document.url);assert.equal(url.protocol,'https:');assert.ok(!url.username&&!url.password);
  const levels=[goal,passage,document,extraction],stage=sourceAtlasFacet(levels,'stage'),course=sourceAtlasFacet(levels,'courseProfile');const scoped=course!==null&&stage?.length===1&&(stage[0]==='SekI'||course.length>0);if(!scoped)unresolved++;
  if(row.selectedCurrentSourceGoalIds.includes(goal.id)){
   const expected:any=identities.get(goal.id);assert.ok(expected);assert.deepEqual(stage,[expected.stage]);
   const expectedCourse=expected.stage==='SekI'?[]:expected.courseLevel==='GK_LK'?['GK','LK']:[expected.courseLevel];assert.deepEqual(course,expectedCourse);
   assert.equal(document.key,expected.documentKey);assert.equal(document.path,expected.documentPath);
   assert.equal(d.matchType,'partial');assert.equal(d.reviewAuthority,'ai_candidate');assert.equal(d.boundedSourceEvidence.wholeSourceUnionApproved,false);assert.equal(d.boundedSourceEvidence.HumanApproval,false);
   assert.ok(!d.boundedSourceEvidence.portableIdentityAuthorProposal.path.startsWith('tmp/'));
   const edgeTargets=mapping.mappings.filter((a:any)=>a.legacyGoalId===goal.id);assert.ok(edgeTargets.length);assert.ok(edgeTargets.every((a:any)=>a.matchType==='partial'));assert.deepEqual([...new Set(edgeTargets.map((a:any)=>a.canonicalGoalId))],d.canonicalGoalIds);
   scopes.push({sourceGoalId:goal.id,stage,courseProfile:course,sourceDocumentKey:document.key,actualLocalDocument:pin(document.path),sourceDocumentURL:document.url,partialContributionCount:d.canonicalGoalIds.length});totalSelected++;
  }
 }
 assert.equal(decisions.size,goals.size);for(const id of goals.keys())assert.ok(decisions.has(id));
 for(const id of row.retiredBroadSourceGoalIds){assert.ok(!goals.has(id)&&!decisions.has(id));assert.ok(!mapping.mappings.some((a:any)=>a.legacyGoalId===id));}
 results.push({jurisdiction:row.jurisdiction,stage:row.stage,mapping:row.completeMapping,extraction:bound,sourceGoalCount:goals.size,decisionCount:decisions.size,legacyEdgeCount:mapping.mappings.length,selectedChangedScopes:scopes,wholeFileUnresolvedScopeDecisions:unresolved,unresolvedScopeCountIsObservedNotApprovedOrForced:true});
}
assert.equal(totalSelected,32-holds.filter((x:any)=>identities.has(x.sourceGoalId)).length);
const out=resolve(O,'CHECKS.actual-bounded-reader-stock-facets-and-exact-documents.json');writeFileSync(out,JSON.stringify({schemaVersion:1,role:'Actual bounded stock-compatible reader over nine complete candidate pairs, no Atlas builder/host/Native gate',stockFacetImplementation:pin('app/scripts/goalBookSourceAtlasInputs.ts'),documentResolverImplementation:'Exact stock sourceDocument selection logic reproduced for bounded actual candidate inspection; ambiguities are HOLD, never guessed',results,selectedCurrentCellsChecked:totalSelected,holds,allPassed:holds.length===0,actualAtlasBuildCalls:0,actualNativeCalls:0,actualHostCount:0,sourceGateAcceptance:false,HumanApproval:false,HumanTrial:false},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({output:pin(out),selected:totalSelected,holds,rows:results.map(x=>({jurisdiction:x.jurisdiction,stage:x.stage,sourceGoals:x.sourceGoalCount,unresolved:x.wholeFileUnresolvedScopeDecisions}))}));
