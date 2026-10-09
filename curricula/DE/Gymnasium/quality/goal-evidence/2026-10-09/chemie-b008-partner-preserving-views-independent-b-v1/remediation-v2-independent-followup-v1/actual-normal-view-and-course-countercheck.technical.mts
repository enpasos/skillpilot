// SPDX-License-Identifier: Apache-2.0
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {compileCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts';
import {sourceAtlasFacet} from '../../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts';
const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-b008-current-twenty-six-native-preparation-author-v1/';
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-b008-partner-preserving-views-independent-b-v1/remediation-v2-independent-followup-v1/';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const bind=(p:string)=>{const b=readFileSync(p);return {path:p,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length}};
const entry=read(base+'source-view-remediation-author-v2/neutral-five-bounded-current-source-course-view-remedies.author.entry.json');
const proof=read(entry.normalCompilerAndSourceFacetProof.path);
const canonical=read(entry.candidateCanonical.path),kinds=read(base+'candidate/semantic-kinds.current504.technical-review-input.json');
const byKind=new Map(kinds.decisions.map((r:any)=>[r.goalId,r.semanticKind]));
const classified={...canonical,goals:canonical.goals.map((g:any)=>({...g,semanticKind:byKind.get(g.id)}))};
const goalMap=new Map(canonical.goals.map((g:any)=>[g.id,g]));
const atoms=new Set(kinds.decisions.filter((r:any)=>r.semanticKind==='curricularAtomic').map((r:any)=>r.goalId));
const sortAtoms=(s:Set<string>)=>[...s].filter(id=>atoms.has(id)).sort();
const rows=proof.views.map((v:any)=>{
 const before=read(v.originalView.path),after=read(v.candidateView.path);
 const paths=new Set(v.preciseRemovedReferences.map((r:any)=>r.originalNodePath));
 const filter=(ns:any[],prefix=''):any[]=>ns.flatMap((n:any,i:number)=>{const p=(prefix?prefix+'.':'')+i;if(paths.has(p))return [];return [{...n,...(n.children?{children:filter(n.children,p)}:{})}]});
 const expected={...before,rootNodes:filter(before.rootNodes)};
 assert.equal(expected.rootNodes.length,1);
 for(const id of v.newExistingWholeContentTargets)expected.rootNodes[0].children.push({kind:'goalEntry',goalId:id,projectionRole:'target'});
 // A new target may omit the default target role. Preserve the authored candidate spelling.
 for(const n of expected.rootNodes[0].children){if(n.projectionRole==='target'&&v.newExistingWholeContentTargets.includes(n.goalId)){
  const actual=after.rootNodes[0].children.find((x:any)=>x.goalId===n.goalId);if(actual?.projectionRole===undefined)delete n.projectionRole;
 }}
 assert.deepEqual(after,expected);
 const br=collectCompositionProjectionRoleGoalIds(before.rootNodes,goalMap as any),ar=collectCompositionProjectionRoleGoalIds(after.rootNodes,goalMap as any);
 assert.deepEqual(sortAtoms(br.targetGoalIds),v.wholeBeforeAtomicTargets);
 assert.deepEqual(sortAtoms(ar.targetGoalIds),v.wholeAfterAtomicTargets);
 const lost=sortAtoms(br.targetGoalIds).filter(id=>!ar.targetGoalIds.has(id));assert.deepEqual(lost,[]);
 const gained=sortAtoms(ar.targetGoalIds).filter(id=>!br.targetGoalIds.has(id));assert.deepEqual(gained,[...v.newExistingWholeContentTargets].sort());
 assert.deepEqual(sortAtoms(br.prerequisiteOnlyGoalIds),sortAtoms(ar.prerequisiteOnlyGoalIds));
 assert.deepEqual(after.scope,before.scope);
 const errors=compileCompositionView(after,classified).findings.filter((r:any)=>r.severity==='error');
 assert.equal(errors.length,v.actualRemainingOpaqueFindings.length+v.allOtherCompilerErrorFindings.length);
 return {viewId:v.viewId,wholeScope:after.scope,originalView:bind(v.originalView.path),candidateView:bind(v.candidateView.path),exactDeclaredRemovals:v.preciseRemovedReferences,newTargetIds:gained,prerequisiteOnlyAtoms:sortAtoms(ar.prerequisiteOnlyGoalIds),noAtomsLost:true,allOtherNodeFieldsExact:true,normalCompilerErrors:errors};
});
const extraction=read(entry.THWholeSourceExtraction.path);
const facets=[...entry.twoTHSourceCourseCorrections.map((x:any)=>x.goalId),'th-chem-sekii-th-ch-sekii-4-1-7-proteine-153-01-5d0c7397'].map((id:string)=>{
 const goal=extraction.sourceGoals.find((g:any)=>g.id===id);assert.ok(goal);
 const passage=extraction.passages.find((p:any)=>p.id===goal.passageId)??{};
 const docs=extraction.sourceDocuments??[extraction.sourceDocument];assert.equal(docs.length,1);
 const levels=[goal,passage,docs[0],extraction];
 const stage=sourceAtlasFacet(levels,'stage'),course=sourceAtlasFacet(levels,'courseProfile');
 assert.deepEqual(stage,['SekII']);assert.deepEqual(course,id.endsWith('5d0c7397')?['GK','LK']:['LK']);
 return {sourceGoalId:id,stage,courseProfiles:course};
});
const receipt={schemaVersion:1,role:'Own B actual unchanged ordinary compiler and source-facet execution; technical equality is not scientific source approval',inputs:[bind(entry.normalCompilerAndSourceFacetProof.path),bind(entry.candidateCanonical.path),bind(base+'candidate/semantic-kinds.current504.technical-review-input.json'),bind(entry.THWholeSourceExtraction.path),bind('app/src/utils/authoring/compositionViewAuthoring.ts'),bind('app/scripts/goalBookSourceAtlasInputs.ts')],views:rows,actualViewCount:rows.length,actualRemainingOrdinaryErrors:rows.reduce((n,r)=>n+r.normalCompilerErrors.length,0),actualErrorFreeViews:rows.filter(r=>r.normalCompilerErrors.length===0).length,newTargetIds:rows.flatMap(r=>r.newTargetIds),actualTHCourseFacets:facets,sourceOperatorApproval:false,currentNativeApproval:false,qualityGateRelaxed:false,activeWrites:[],strictGain:0,humanApproval:false};
writeFileSync(own+'actual-normal-view-and-course-countercheck.receipt.json',JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({views:receipt.actualViewCount,ordinaryErrors:receipt.actualRemainingOrdinaryErrors,errorFreeViews:receipt.actualErrorFreeViews,newTargets:receipt.newTargetIds,THfacets:facets,sourceApproval:false}));
