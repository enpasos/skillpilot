// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const R=process.cwd(),O=resolve(R,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-edta-five-normal-source-adapter-author-20261016-v1');
const read=(p:string)=>JSON.parse(readFileSync(resolve(R,p),'utf8'));
const pin=(p:string)=>{const b=readFileSync(resolve(R,p));return{path:relative(R,resolve(R,p)),sha256:'sha256:'+createHash('sha256').update(b).digest('hex'),bytes:b.length}};
const {sourceAtlasFacet}=await import(pathToFileURL(resolve(R,'app/scripts/goalBookSourceAtlasInputs.ts')).href);
const neutral=read(resolve(O,'NEUTRAL.five-complete-normal-shaped-source-and-mapping-inputs.selector.json'));
const aliases=new Map(neutral.futureIsolatedHostAliases.map((x:any)=>[x.normalHostAlias,x.physicalRepositorySource]));
const results=[];
for(const row of neutral.rows){
 const mapping=read(row.completeMapping.path);assert.deepEqual(pin(row.completeMapping.path),row.completeMapping);
 const bound:any=aliases.get(mapping.sourceExtractionPath);assert.ok(bound,'Mapping extractionPath must resolve through actual explicit candidate alias');assert.deepEqual(bound,row.completeExtraction);assert.deepEqual(pin(bound.path),bound);
 const extraction=read(bound.path);assert.equal(mapping.sourceLandscapeId,extraction.sourceLandscapeId);assert.equal(extraction.jurisdiction,row.jurisdiction);
 const goals=new Map<string,any>(extraction.sourceGoals.map((g:any)=>[g.id,g]));const passages=new Map<string,any>(extraction.passages.map((p:any)=>[p.id,p]));
 assert.equal(goals.size,extraction.sourceGoals.length);assert.equal(passages.size,extraction.passages.length);
 const decisions=new Map<string,any>();const scopes=[];let unresolved=0;
 for(const d of mapping.decisions){
  assert.ok(!decisions.has(d.sourceGoalId));decisions.set(d.sourceGoalId,d);const goal=goals.get(d.sourceGoalId);assert.ok(goal);const passage=passages.get(goal.passageId);assert.ok(passage);
  assert.ok(d.reviewer&&d.reviewedAt&&d.rationale);
  // Same bounded document resolver as stock goalBookSourceAtlasInputs.ts:88.
  const docs=[...(extraction.sourceDocuments??[])];if(!docs.length&&extraction.sourceDocument)docs.push(extraction.sourceDocument);
  const sourceTags=(goal.tags??[]).filter((x:string)=>x.startsWith('sourceDocument:')).map((x:string)=>x.slice('sourceDocument:'.length));
  const keys=[...new Set([goal.sourceDocumentKey,...sourceTags,passage.sourceDocumentKey].filter(Boolean))];assert.ok(keys.length<=1);
  const matches=keys.length?docs.filter((x:any)=>x.key===keys[0]):docs;assert.equal(matches.length,1);
  const document=matches[0];assert.equal(document.official,true);assert.ok(document.path);const url=new URL(document.url);assert.equal(url.protocol,'https:');assert.ok(!url.username&&!url.password);
  const levels=[goal,passage,document,extraction],stage=sourceAtlasFacet(levels,'stage'),course=sourceAtlasFacet(levels,'courseProfile');const scoped=course!==null&&stage?.length===1&&(stage[0]==='SekI'||course.length>0);if(!scoped)unresolved++;
  if([...row.newSourceGoalIds,...row.updatedExistingSourceGoalIds].includes(goal.id)||goal.id==='78ca79fd-ce73-5023-8b38-c6c4fed232f1')scopes.push({sourceGoalId:goal.id,stage,courseProfile:course,sourceDocumentKey:document.key,sourceDocumentPath:document.path,sourceDocumentURL:document.url});
 }
 assert.equal(decisions.size,goals.size);for(const id of goals.keys())assert.ok(decisions.has(id));
 results.push({jurisdiction:row.jurisdiction,mapping:row.completeMapping,extraction:bound,sourceGoalCount:goals.size,decisionCount:decisions.size,legacyEdgeCount:mapping.mappings.length,allNormalSourceDocumentReferencesUniqueOfficialAndHttps:true,exactOneDecisionPerSourceGoal:true,selectedChangedAndEDTAScopes:scopes,wholeFileUnresolvedScopeDecisions:unresolved,unresolvedScopeCountIsObservedNotApprovedOrForced:true});
}
const out=resolve(O,'CHECKS.actual-bounded-normal-reader-and-stock-source-facets.json');writeFileSync(out,JSON.stringify({schemaVersion:1,role:'Actual bounded reader over five complete actual candidate extract/mapping pairs via explicit aliases; imported sourceAtlasFacet only, no Atlas build/check, compilation, host or Native call',stockFacetImplementation:pin('app/scripts/goalBookSourceAtlasInputs.ts'),documentResolverImplementation:'Exact stock sourceDocument selection logic at sourceAtlasInputs88 reproduced locally; no source-coverage or whole-course decision inferred',results,allPassed:true,actualAtlasBuildCalls:0,actualNativeCalls:0,actualHostCount:0,sourceGateAcceptance:false,HumanApproval:false,HumanTrial:false},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({output:pin(out),rows:results.map(x=>({jurisdiction:x.jurisdiction,sourceGoals:x.sourceGoalCount,unresolved:x.wholeFileUnresolvedScopeDecisions}))}));
