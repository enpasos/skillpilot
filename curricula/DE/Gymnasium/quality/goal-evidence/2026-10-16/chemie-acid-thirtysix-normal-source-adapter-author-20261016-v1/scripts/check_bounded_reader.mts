// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const R=process.cwd(),O=resolve(R,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-acid-thirtysix-normal-source-adapter-author-20261016-v1');
const read=(p:string)=>JSON.parse(readFileSync(resolve(R,p),'utf8'));
const pin=(p:string)=>{const b=readFileSync(resolve(R,p));return{path:relative(R,resolve(R,p)),sha256:'sha256:'+createHash('sha256').update(b).digest('hex'),bytes:b.length}};
const {sourceAtlasFacet}=await import(pathToFileURL(resolve(R,'app/scripts/goalBookSourceAtlasInputs.ts')).href);
const neutral=read(resolve(O,'NEUTRAL.seven-complete-normal-source-pairs.thirtysix-selected-cells.author-selector.json'));
const aliases=new Map(neutral.futureIsolatedHostAliases.map((x:any)=>[x.normalHostAlias,x.physicalRepositorySource]));
const results=[],documentHolds=[];let selected=0;
for(const row of neutral.rows){
 const mapping=read(row.completeMapping.path);assert.deepEqual(pin(row.completeMapping.path),row.completeMapping);
 const bound:any=aliases.get(mapping.sourceExtractionPath);assert.deepEqual(bound,row.completeExtraction);assert.deepEqual(pin(bound.path),bound);
 const extraction=read(bound.path);assert.equal(mapping.sourceLandscapeId,extraction.sourceLandscapeId);assert.equal(extraction.jurisdiction,row.jurisdiction);
 const goals=new Map<string,any>(extraction.sourceGoals.map((g:any)=>[g.id,g]));const passages=new Map<string,any>(extraction.passages.map((p:any)=>[p.id,p]));
 assert.equal(goals.size,extraction.sourceGoals.length);assert.equal(passages.size,extraction.passages.length);
 const decisions=new Set<string>(),scopes=[];let unresolved=0;
 for(const d of mapping.decisions){
  assert.ok(!decisions.has(d.sourceGoalId));decisions.add(d.sourceGoalId);const g=goals.get(d.sourceGoalId);assert.ok(g);const p=passages.get(g.passageId);assert.ok(p);assert.ok(d.reviewer&&d.reviewedAt&&d.rationale);
  const docs=[...(extraction.sourceDocuments??[])];if(!docs.length&&extraction.sourceDocument)docs.push(extraction.sourceDocument);
  const tags=(g.tags??[]).filter((x:string)=>x.startsWith('sourceDocument:')).map((x:string)=>x.slice('sourceDocument:'.length));
  const keys=[...new Set([g.sourceDocumentKey,...tags,p.sourceDocumentKey].filter(Boolean))];
  const matches=keys.length===1?docs.filter((x:any)=>x.key===keys[0]):keys.length===0?docs:[];
  if(matches.length!==1){documentHolds.push({sourceGoalId:g.id,keys,matchingDocumentCount:matches.length});continue;}
  const doc=matches[0];assert.equal(doc.official,true);assert.ok(doc.path);const u=new URL(doc.url);assert.equal(u.protocol,'https:');assert.ok(!u.username&&!u.password);
  const stage=sourceAtlasFacet([g,p,doc,extraction],'stage'),course=sourceAtlasFacet([g,p,doc,extraction],'courseProfile');if(course===null||stage?.length!==1||(stage[0]!=='SekI'&&!course.length))unresolved++;
  if(row.selectedSourceGoalIds.includes(g.id)){
   assert.deepEqual(stage,['SekII']);const expected=g.courseLevel==='GK_LK'?['GK','LK']:['GK','LK'].includes(g.courseLevel)?[g.courseLevel]:null;if(expected)assert.deepEqual(course,expected);
   assert.equal(d.matchType,'partial');assert.equal(d.reviewAuthority,'ai_candidate');assert.equal(d.boundedSourceEvidence.wholeSourceUnionApproved,false);assert.equal(d.boundedSourceEvidence.HumanApproval,false);
   for(const t of d.boundedSourceEvidence.boundedProposedCanonicalGoalIds){const edges=mapping.mappings.filter((a:any)=>a.legacyGoalId===g.id&&a.canonicalGoalId===t);assert.equal(edges.length,1);assert.equal(edges[0].matchType,'partial');}
   scopes.push({sourceGoalId:g.id,actualStage:stage,actualCourseProfile:course,sourceCourseLevel:g.courseLevel,sourceDocumentKey:doc.key,sourceDocumentURL:doc.url,actualLocalDocument:pin(doc.path),boundedPartialTargetGoalIds:d.boundedSourceEvidence.boundedProposedCanonicalGoalIds,historicalContextOnlyTargetGoalIds:d.boundedSourceEvidence.historicalContextOnlyTargetGoalIds});selected++;
  }
 }
 assert.equal(decisions.size,goals.size);
 results.push({jurisdiction:row.jurisdiction,sourceGoals:goals.size,decisions:decisions.size,legacyEdges:mapping.mappings.length,selectedActualSourceScopes:scopes,wholeFileUnresolvedCourseDecisions:unresolved,unresolvedCountIsObservedNotApprovedOrForced:true});
}
assert.equal(selected,36-documentHolds.filter((x:any)=>neutral.rows.some((r:any)=>r.selectedSourceGoalIds.includes(x.sourceGoalId))).length);
const output=resolve(O,'CHECKS.actual-bounded-reader-source-documents-and-stock-facets.json');writeFileSync(output,JSON.stringify({schemaVersion:1,role:'Bounded actual read of seven whole candidate pairs via explicit aliases; no Atlas build or source-coverage approval',stockSourceFacetImplementation:pin('app/scripts/goalBookSourceAtlasInputs.ts'),documentResolver:'Stock unique goal/passage/tag key resolver reproduced locally; ambiguities remain HOLD',results,selectedSourceCellsChecked:selected,documentHolds,allMechanicalReaderChecksPassed:documentHolds.length===0,sourceProjectionReady:false,historicalEdgeDispositionsStillRequired:true,actualAtlasBuildCalls:0,actualHostCount:0,NormalPAMV:0,Native:0,Central:0,HumanApproval:false,HumanTrial:false},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({output:pin(output),selected,documentHolds,rows:results.map((r:any)=>({jurisdiction:r.jurisdiction,sourceGoals:r.sourceGoals,unresolved:r.wholeFileUnresolvedCourseDecisions}))}));
