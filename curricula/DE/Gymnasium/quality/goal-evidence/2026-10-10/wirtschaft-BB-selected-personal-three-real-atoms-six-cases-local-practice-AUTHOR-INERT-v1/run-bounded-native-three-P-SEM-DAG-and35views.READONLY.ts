import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import ts from '../../../../../../../app/node_modules/typescript/lib/typescript.js';
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js';
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js';
import {fingerprintSemanticKindSourceGoal} from '../../../../../../../app/scripts/goalBookModel.ts';
import {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput,fingerprintPositiveGoalEvidenceProfile,validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts';
import {normalizeCanonicalLandscape,buildCanonicalGraphIndex,validateCanonicalLandscape} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts';
import {normalizeCompositionView,compileCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts';

const out=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(out,'../../../../../../..');
const base=path.resolve(out,'../wirtschaft-common343-M6-fieldwise-composition-AUTHOR-INERT-v1');
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(name:string,obj:any)=>fs.writeFileSync(path.join(out,name),JSON.stringify(obj,null,2)+'\n');
const hash=(x:Buffer|string)=>'sha256:'+createHash('sha256').update(x).digest('hex');
const relative=(p:string)=>path.relative(root,p).replaceAll('\\','/');
const codeContracts:any[]=[];
function exactNative(file:string,names:string[],context:any={}){
 const full=fs.readFileSync(path.join(root,file),'utf8');const tree=ts.createSourceFile(file,full,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
 const chunks=tree.statements.filter((s:any)=>ts.isFunctionDeclaration(s)&&s.name&&names.includes(s.name.text)).map((s:any)=>({name:s.name.text,text:full.slice(s.getStart(tree),s.end)}));
 if(chunks.length!==names.length)throw Error('Missing exact native functions');
 const ctx={createHash,Map,Set,...context,exports:{}} as any;
 vm.runInNewContext(ts.transpileModule(chunks.map(s=>s.text).join('\n'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText+'\n'+names.map(n=>`exports.${n}=${n};`).join('\n'),ctx);
 codeContracts.push({sourcePath:file,wholeOriginalSourceSha256:hash(full),functions:chunks.map(s=>({name:s.name,exactSourceSha256:hash(s.text)})),method:'Exact TypeScript AST FunctionDeclaration source slices; only type erasure, no checker edits',wholeSourceAfterExact:hash(fs.readFileSync(path.join(root,file)))===hash(full)});
 return ctx.exports;
}
const A=exactNative('app/scripts/semanticAtomicityReview.ts',['normalizeText','stableJson','getSemanticPayload','fingerprintGoal']);
const M=exactNative('app/scripts/memoryCardReview.ts',['normalizeText','stableJson','fingerprintGoal']);
const route=exactNative('app/scripts/generateCurriculumQualityStatus.ts',['isAtomicGoal','parseReference','buildAtomicDirectRequiresEdges','buildReverseEdges','createPathChecker']);
const cpath=path.join(out,'candidate-core/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'),c=read(cpath),old=read(path.join(base,'candidate-core/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'));
const proposed=read(path.join(out,'three-whole-ordinary-personal-goals.AUTHOR-INERT.json')).goals;
const ids=read(path.join(out,'actual-three-atomic-contracts-and-memory-recommendations.AUTHOR-INERT.json')).ids;
const canonical=normalizeCanonicalLandscape(c),idx=buildCanonicalGraphIndex(canonical),diagnostics=validateCanonicalLandscape(canonical,idx);
const missing:any[]=[],cycles:any[]=[],seen=new Set<string>(),active=new Set<string>(),by=new Map<string,any>(c.goals.map((g:any)=>[g.id,g]));
function visit(id:string,chain:string[]){if(active.has(id)){cycles.push([...chain,id]);return}if(seen.has(id))return;const g=by.get(id);if(!g){missing.push(id);return}active.add(id);for(const r of g.requires??[])if(!r.includes(':'))visit(r,[...chain,id]);active.delete(id);seen.add(id)}
for(const g of c.goals)visit(g.id,[]);
const fps=proposed.map((g:any)=>({goalId:g.id,SEM:fingerprintSemanticKindSourceGoal(g),A:A.fingerprintGoal(g,'semantic-atomicity-v1'),M:M.fingerprintGoal(g,'memory-card-review-v1')}));
write('actual-native-three-only-SEM-A-M-fingerprints.READONLY.json',{role:'native_fingerprints_only_not_independent_science',wholeCoreHash:hash(fs.readFileSync(cpath)),rows:fps,codeContracts});
const sem=read(path.join(base,'semantic689.candidate-bound.INERT.json'));
sem.sourceLandscapePath=relative(cpath);sem.ledgerId='wirtschaft-selected-personal-real-three-atoms693-346-candidate-20261010-v1';
for(const d of sem.decisions){d.sourceFingerprint=fingerprintSemanticKindSourceGoal(by.get(d.goalId));}
for(const g of c.goals.filter((g:any)=>!sem.decisions.some((d:any)=>d.goalId===g.id)))sem.decisions.push({goalId:g.id,semanticKind:g.examData?'practiceAssessment':'curricularAtomic',decisionStatus:'authoritative',decisionBasis:g.examData?'reviewed-current-post-split-practice-assessment':'reviewed-current-post-split-curricular-atomic',sourceFingerprint:fingerprintSemanticKindSourceGoal(g)});
sem.counts={total:sem.decisions.length};for(const d of sem.decisions)sem.counts[d.semanticKind]=(sem.counts[d.semanticKind]??0)+1;
write('semantic693.candidate-bound.INERT.json',sem);
const criteriaPath=path.join(base,'../wirtschaft-BB-LK-three-market-facets-eight-cases-local-practice-AUTHOR-INERT-v1/candidate-criteria.md');
fs.copyFileSync(criteriaPath,path.join(out,'candidate-positive-understanding-criteria.EXACT.md'));
const criteria=hash(fs.readFileSync(criteriaPath));const spec=read(path.join(out,'positive-v2-three-goal-six-whole-cases.AUTHOR-INERT.json'));
const ajv=new Ajv2020({allErrors:true,strict:false});addFormats(ajv);
const vp=ajv.compile(read(path.join(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')));
const records:any[]=[],pChecks:any[]=[];
for(const p of spec.goals){const g=by.get(p.goalId);const rec={$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json',schemaVersion:2,reviewId:spec.reviewId,goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',reviewCriteriaFingerprint:criteria,landscapeId:c.landscapeId,goalId:g.id,goalFingerprint:fingerprintGoalForPositiveEvidence(g,'curricularAtomic'),reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(g,criteria,{},'curricularAtomic'),profileFingerprint:fingerprintPositiveGoalEvidenceProfile(p.profile),status:'needs_human_review',reviewAuthority:'ai_candidate',reviewedAt:spec.reviewedAt,reviewer:spec.reviewer,reason:p.reason,evidenceLevel:'E1',maximumClaimScope:'G1',reviewRunIds:[],dissent:[],profile:p.profile};
 const valid=vp(rec);const errors=validatePositiveGoalEvidenceRecordSemantics(rec,g,{},'curricularAtomic');records.push(rec);pChecks.push({goalId:g.id,schemaValid:valid,schemaErrors:valid?[]:structuredClone(vp.errors),semanticErrors:errors});}
fs.writeFileSync(path.join(out,'three-native-fingerprinted-P-v2-E1G1-candidates.INERT.jsonl'),records.map(x=>JSON.stringify(x)).join('\n')+'\n');
const ordinary=(g:any)=>!(g.contains?.length)&&!g.examData&&!['Practice','Assessment','Motivation','Orientation','memorization'].some(t=>g.tags?.includes(t))&&g.nodeKind!=='memory'&&!g.tags?.some((t:string)=>t.startsWith('srs-deck:'));
const newordinary=new Set(c.goals.filter(ordinary).map((g:any)=>g.id));
const views:any[]=[];
function flatten(ns:any[]):string[]{return ns.flatMap(n=>[...(n.sourceGoalId?[n.sourceGoalId]:[]),...flatten(n.children??[])])}
for(const name of fs.readdirSync(path.join(base,'candidate-views')).filter(x=>x.endsWith('.view.json')).sort()){
 const local=path.join(out,'candidate-views',name),vp=fs.existsSync(local)?local:path.join(base,'candidate-views',name);const v=normalizeCompositionView(read(vp));const compiled=compileCompositionView(v,canonical);const roles=collectCompositionProjectionRoleGoalIds(v.rootNodes,idx.goalById);const visible=flatten(compiled.compiledRootNodes);
 const missingClosure=[];for(const id of roles.targetGoalIds){const g=by.get(id);for(const r of g?.requires??[])if(by.has(r)&&!roles.targetGoalIds.has(r)&&!roles.prerequisiteOnlyGoalIds.has(r))missingClosure.push({goalId:id,requires:r});}
 views.push({name,path:relative(vp),scope:v.scope,compileFindings:compiled.findings,duplicateVisibleIDs:visible.filter((x,i)=>visible.indexOf(x)!==i),wholeTargetIDs:[...roles.targetGoalIds].sort(),ordinaryTargetIDs:[...roles.targetGoalIds].filter(x=>newordinary.has(x)).sort(),missingLocalDirectRequires:missingClosure,new3Roles:proposed.map((g:any)=>({goalId:g.id,role:roles.targetGoalIds.has(g.id)?'target':roles.prerequisiteOnlyGoalIds.has(g.id)?'prerequisiteOnly':'absent'})),wholeLocalPracticeTarget:roles.targetGoalIds.has(ids['local-practice']),no912Target:!roles.targetGoalIds.has('912ab267-ee00-581b-a31c-dfc0b3587184')});
}
write('actual-native35-view-compilation-and-local-whole-practice-closure.READONLY.json',views);
// Native CQR-102 direct-path kernel, exactly extracted. Bounded new3 necessity
// check with/without the new endpoint, not a whole central M6/M7 gate run.
const routeSource=fs.readFileSync(path.join(root,'app/scripts/generateCurriculumQualityStatus.ts'),'utf8');const rt=ts.createSourceFile('route',routeSource,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
const declaration=rt.statements.filter((s:any)=>ts.isVariableStatement(s)).flatMap((s:any)=>s.declarationList.declarations).find((d:any)=>d.name.getText(rt)==='CANONICAL_GYM_ECONOMICS_PRACTICE_CLUSTER_IDS');
const clusterIds=vm.runInNewContext(declaration.initializer.getText(rt));
function routes(can:any){const bg=new Map(can.goals.map((g:any)=>[g.id,g]));const terminals=clusterIds.flatMap((id:string)=>(bg.get(id) as any)?.contains??[]).filter((id:string)=>route.isAtomicGoal(bg.get(id)));const direct=route.buildAtomicDirectRequiresEdges(can);const forward=route.createPathChecker(direct);const reverse=route.createPathChecker(route.buildReverseEdges(direct));return {newThree:proposed.map((g:any)=>({goalId:g.id,hasDirectOrientationPath:forward(g.id,'6bf2d1cc-e745-50dd-a617-71c06a6c6945'),reachedTerminalIDs:terminals.filter((t:string)=>reverse(g.id,t))})),terminalIDs:terminals};}
const without=structuredClone(c);without.goals=without.goals.filter((g:any)=>g.id!==ids['local-practice']);for(const g of without.goals)if(g.contains)g.contains=g.contains.filter((id:string)=>id!==ids['local-practice']);
const beforeRoutes=routes(without),afterRoutes=routes(c);
write('actual-native-CQR102-direct-kernel-new-three-endpoint-necessity.READONLY.json',{sourcePath:'app/scripts/generateCurriculumQualityStatus.ts',sourceSha256:hash(routeSource),nativeFunctions:codeContracts.find(c=>c.sourcePath.includes('generateCurriculum')),terminalClusterIdsExact:clusterIds,beforeAddingLocalEndpoint:beforeRoutes.newThree,withLocalEndpoint:afterRoutes.newThree,allNewThreeMissingExistingEndpoint:beforeRoutes.newThree.every(x=>x.reachedTerminalIDs.length===0),allNewThreeReachNewEndpoint:afterRoutes.newThree.every(x=>x.reachedTerminalIDs.includes(ids['local-practice'])),wholeCentralRuleExecuted:false,centralRouteCompositionAndReleaseGatePending:true});
const oldOrdinaryParity=old.goals.filter(ordinary).map((g:any)=>{const n=by.get(g.id);return {goalId:g.id,wholeObjectExact:JSON.stringify(g)===JSON.stringify(n),SEM:fingerprintSemanticKindSourceGoal(g)===fingerprintSemanticKindSourceGoal(n),A:A.fingerprintGoal(g,'semantic-atomicity-v1')===A.fingerprintGoal(n,'semantic-atomicity-v1'),M:M.fingerprintGoal(g,'memory-card-review-v1')===M.fingerprintGoal(n,'memory-card-review-v1'),P:fingerprintGoalForPositiveEvidence(g,'curricularAtomic')===fingerprintGoalForPositiveEvidence(n,'curricularAtomic'),PReviewInput:fingerprintPositiveGoalEvidenceReviewInput(g,criteria,{},'curricularAtomic')===fingerprintPositiveGoalEvidenceReviewInput(n,criteria,{},'curricularAtomic'),wholeResourceLinksExact:JSON.stringify(g.resourceLinks??[])===JSON.stringify(n.resourceLinks??[]),allFieldsExceptAppExact:JSON.stringify({...g,applicability:null})===JSON.stringify({...n,applicability:null})};});
write('actual-native343-old-SEM-A-M-P-payload-parity-and-real-App-deltas.READONLY.json',{wholeOldOrdinaryCount:oldOrdinaryParity.length,rows:oldOrdinaryParity,all343NativeSEMAMPPayloadsExact:oldOrdinaryParity.every(x=>x.SEM&&x.A&&x.M&&x.P&&x.PReviewInput&&x.wholeResourceLinksExact&&x.allFieldsExceptAppExact),whole343ObjectExactClaim:false,PReviewInputAssetDigestContext:'Same empty digest map for before/after native semantic binding parity; resource links and physical asset files are retained unchanged by this author package.',changedWholeOldOrdinaryIDs:oldOrdinaryParity.filter(x=>!x.wholeObjectExact).map(x=>x.goalId)});
write('actual-bounded-native-schema-DAG-P3-SEM693-35-summary.READONLY.json',{core:relative(cpath),wholeNodes:c.goals.length,ordinary:newordinary.size,all343OldOrdinaryWholeObjectsExact:oldOrdinaryParity.every(x=>x.wholeObjectExact),whole343ObjectsExactClaim:false,all343NativeSEMAMPPayloadsExact:oldOrdinaryParity.every(x=>x.SEM&&x.A&&x.M&&x.P&&x.PReviewInput&&x.wholeResourceLinksExact&&x.allFieldsExceptAppExact),uniqueGoalIDs:by.size===c.goals.length,containsErrors:diagnostics.filter(x=>x.severity==='error'),requiresCycles:cycles,missingRequires:missing,P3:pChecks,views:views.length,viewCompileErrors:views.filter(v=>v.compileFindings.some((x:any)=>x.severity==='error')),duplicateViewIDs:views.filter(v=>v.duplicateVisibleIDs.length),newThreeNeedActualEndpoint:beforeRoutes.newThree.every(x=>x.reachedTerminalIDs.length===0),newThreeWithEndpointPassKernel:afterRoutes.newThree.every(x=>x.reachedTerminalIDs.length>0),practiceReleaseStatus:by.get(ids['local-practice']).examData.reviewStatus,wholeCentralM6M7PassClaimed:false,originalNativeSourcesExact:codeContracts.every(x=>x.wholeSourceAfterExact)});
const failure=oldOrdinaryParity.some(x=>!x.SEM||!x.A||!x.M||!x.P||!x.PReviewInput||!x.wholeResourceLinksExact||!x.allFieldsExceptAppExact)||diagnostics.some(x=>x.severity==='error')||cycles.length||missing.length||pChecks.some(x=>!x.schemaValid||x.semanticErrors.length)||views.some(v=>v.compileFindings.some((x:any)=>x.severity==='error')||v.duplicateVisibleIDs.length);
console.log(JSON.stringify({wholeNodes:c.goals.length,ordinary:newordinary.size,P3Valid:pChecks.every(x=>x.schemaValid&&!x.semanticErrors.length),views:views.length,new3EndpointNecessary:beforeRoutes.newThree.every(x=>x.reachedTerminalIDs.length===0),new3EndpointKernelPass:afterRoutes.newThree.every(x=>x.reachedTerminalIDs.length>0),boundedTechnicalPass:!failure}));
if(failure)process.exitCode=1;
