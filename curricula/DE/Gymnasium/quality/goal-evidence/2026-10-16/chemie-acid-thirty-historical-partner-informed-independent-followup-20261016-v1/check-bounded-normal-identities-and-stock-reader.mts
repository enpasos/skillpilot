import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-acid-thirty-historical-partner-informed-independent-followup-20261016-v1';
const read=(p:string)=>JSON.parse(readFileSync(resolve(p),'utf8'));
const hash=(b:Buffer)=>'sha256:'+createHash('sha256').update(b).digest('hex');
const pin=(p:string)=>({path:p,sha256:hash(readFileSync(resolve(p))),bytes:readFileSync(resolve(p)).length});
const mod=await import(pathToFileURL(resolve('app/scripts/goalBookSourceAtlasInputs.ts')).href);
const report=read(root+'/REVIEW.exact-thirty-source-seventyfour-historical-edge-dispositions.json');
const selector=read(report.inputPins.actualSevenPairSelector.path);
const canonical=read(report.inputPins.currentWhole576Canonical.path);
const goals=new Map(canonical.goals.map((g:any)=>[g.id,g]));
const atoms=new Set(canonical.goals.filter((g:any)=>g.type==='atomic'&&!(g.contains??[]).length).map((g:any)=>g.id));
const checked=[];const pairPins=[];
for(const pair of selector.rows){
 for(const p of [pair.completeExtraction,pair.completeMapping]) assert.equal(pin(p.path).sha256,p.sha256);
 const ext=read(pair.completeExtraction.path),mapping=read(pair.completeMapping.path);
 pairPins.push({extraction:pin(pair.completeExtraction.path),mapping:pin(pair.completeMapping.path)});
 assert.equal(ext.subject,'Chemie');assert.equal(ext.stage,'SekII');assert.equal(ext.jurisdiction,pair.jurisdiction);
 assert.equal(mapping.sourceLandscapeId,ext.sourceLandscapeId);
 for(const r of report.rows.filter((r:any)=>pair.selectedSourceGoalIds.includes(r.sourceGoalId))){
  const sg=ext.sourceGoals.filter((x:any)=>x.id===r.sourceGoalId);assert.equal(sg.length,1);
  const full=read(r.wholeSourceBody.container.path).sourceRows.find((x:any)=>x.sourceGoalId===r.sourceGoalId).wholeBody;assert.deepEqual(sg[0],full);
  const passage=ext.passages.find((x:any)=>x.id===sg[0].passageId)??{};
  const docs=ext.sourceDocuments??[ext.sourceDocument];
  const ds=sg[0].sourceDocumentKey?docs.filter((x:any)=>x.key===sg[0].sourceDocumentKey):docs;
  assert.equal(ds.length,1);const doc=ds[0];assert.equal(doc.official,true);assert.ok(doc.url.startsWith('https://'));
  const levels=[sg[0],passage,doc,ext];const stage=mod.sourceAtlasFacet(levels,'stage'),course=mod.sourceAtlasFacet(levels,'courseProfile');
  assert.deepEqual(stage,['SekII']);assert.ok(course&&course.length);
  const expect=sg[0].courseLevel==='LK'?['LK']:sg[0].courseLevel==='GK'?['GK']:['GK','LK'];assert.deepEqual([...course].sort(),expect);
  const old=mapping.decisions.filter((x:any)=>x.sourceGoalId===r.sourceGoalId);assert.equal(old.length,1);
  const descendants=[];
  for(const e of r.historicalEdgeDispositions){
   const actual=mod.sourceAtlasDescendants(e.targetGoalId,goals,atoms,canonical.landscapeId??canonical.id);
   assert.deepEqual(actual,e.actualCurrentDescendantIdsUnderStockBoundaryRules);descendants.push({targetGoalId:e.targetGoalId,actualStockDescendantIds:actual,action:e.action});
  }
  checked.push({sourceGoalId:r.sourceGoalId,normalWholeSourceEqualsFinal:true,stage,courseProfile:course,sourceDocument:pin(doc.path),officialURL:doc.url,actualStockHistoricalTargetClosures:descendants});
 }
}
assert.equal(checked.length,30);
const output={schemaVersion:1,role:'Actual bounded normal-source selected-row identity/document/scope and stock-descendant read; no Native/Atlas run',reader:pin('app/scripts/goalBookSourceAtlasInputs.ts'),pairs:pairPins,checkedSourceRows:checked,all30Passed:true,all74StockClosuresMatchWrittenScience:true,fullCourseProjectionReviewed:false,AtlasBuildCalls:0,Native:false,NormalPAMV:false,Host:false,Central:false,HumanApproval:false,HumanTrial:false};
writeFileSync(resolve(root+'/CHECKS.actual-bounded-normal-identities-scopes-and-stock-descendants.json'),JSON.stringify(output,null,2)+'\n');
process.stdout.write(JSON.stringify({checkedRows:checked.length,checkedHistoricalClosures:checked.reduce((n:any,r:any)=>n+r.actualStockHistoricalTargetClosures.length,0),passed:true}));
