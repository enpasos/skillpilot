// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const R=process.cwd(), O=resolve(R,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-alcohol-seven-normal-source-adapter-author-20261016-v1');
const read=(p:string)=>JSON.parse(readFileSync(resolve(R,p),'utf8'));
const pin=(p:string)=>{const b=readFileSync(resolve(R,p));return{path:relative(R,resolve(R,p)),sha256:'sha256:'+createHash('sha256').update(b).digest('hex'),bytes:b.length}};
const {sourceAtlasFacet}=await import(pathToFileURL(resolve(R,'app/scripts/goalBookSourceAtlasInputs.ts')).href);
const neutral=read(resolve(O,'NEUTRAL.seven-complete-normal-source-and-mapping-pairs.author.json'));
const result=[];
for(const row of neutral.rows){
 assert.deepEqual(pin(row.completeMapping.path),row.completeMapping);assert.deepEqual(pin(row.completeExtraction.path),row.completeExtraction);
 const m=read(row.completeMapping.path), e=read(row.completeExtraction.path);
 assert.equal(m.sourceExtractionPath,row.normalExtractionAlias);assert.equal(row.completeExtraction.path,row.normalExtractionAlias);
 assert.equal(m.sourceLandscapeId,e.sourceLandscapeId);
 const gs=new Map<string,any>(e.sourceGoals.map((g:any)=>[g.id,g]));
 const ps=new Map<string,any>(e.passages.map((p:any)=>[p.id,p]));
 assert.equal(gs.size,e.sourceGoals.length);assert.equal(ps.size,e.passages.length);
 const ds=new Set<string>();let unresolved=0;let selected:any;
 for(const d of m.decisions){
  assert.ok(!ds.has(d.sourceGoalId));ds.add(d.sourceGoalId);const g=gs.get(d.sourceGoalId);assert.ok(g);
  const p=ps.get(g.passageId);assert.ok(p);assert.ok(d.reviewer&&d.reviewedAt&&d.rationale);
  const docs=[...(e.sourceDocuments??[])];if(!docs.length&&e.sourceDocument)docs.push(e.sourceDocument);
  const tagkeys=(g.tags??[]).filter((t:string)=>t.startsWith('sourceDocument:')).map((t:string)=>t.slice(15));
  const keys=[...new Set([g.sourceDocumentKey,...tagkeys,p.sourceDocumentKey].filter(Boolean))];assert.ok(keys.length<=1);
  const matches=keys.length?docs.filter((v:any)=>v.key===keys[0]):docs;assert.equal(matches.length,1);
  const doc=matches[0];assert.equal(doc.official,true);assert.ok(doc.path);const url=new URL(doc.url);assert.equal(url.protocol,'https:');assert.ok(!url.username&&!url.password);
  const levels=[g,p,doc,e],stage=sourceAtlasFacet(levels,'stage'),course=sourceAtlasFacet(levels,'courseProfile');
  const scoped=course!==null&&stage?.length===1&&(stage[0]==='SekI'||course.length>0);if(!scoped)unresolved++;
  if(g.id===row.sourceGoalId)selected={sourceGoalId:g.id,stage,courseProfile:course,sourceDocumentKey:doc.key,sourceDocumentPath:doc.path,sourceDocumentURL:doc.url};
 }
 assert.equal(ds.size,gs.size);assert.ok(selected);
 result.push({jurisdiction:row.jurisdiction,sourceGoals:gs.size,decisions:ds.size,selectedActualScope:selected,wholeFileObservedUnresolvedSourceScopes:unresolved,unresolvedCountIsObservationNotApproval:true});
}
const out=resolve(O,'CHECKS.actual-bounded-stock-reader-and-source-facets.json');
writeFileSync(out,JSON.stringify({schemaVersion:1,role:'Actual bounded full source-pair reader and imported stock facet function; no source projection or acceptance',stockImplementation:pin('app/scripts/goalBookSourceAtlasInputs.ts'),results:result,allPassed:true,actualAtlasBuilds:0,Native:0,Central:0,HumanApproval:false,HumanTrial:false},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({output:pin(out),selectedActualScopes:result.map(r=>r.selectedActualScope)}));
