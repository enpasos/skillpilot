// SPDX-License-Identifier: Apache-2.0
// Author preparation only. No active input writes. Normal API uses its supported
// repository-root parameter with a real isolated input snapshot.
import {readFile,writeFile,mkdir,copyFile,stat} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {buildGoalBookSourceAtlasInputs,compactGoalBookSourceAtlasReceipt,readGoalBookSourceAtlasInputConfig} from '../../../../../../../../app/scripts/goalBookSourceAtlasInputs';
import {buildGoalBookModel} from '../../../../../../../../app/scripts/goalBookModel';
import {normalizeCanonicalLandscape} from '../../../../../../../../app/src/utils/authoring/canonicalAuthoring';
import {compileCompositionView,normalizeCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../../app/src/utils/authoring/compositionViewAuthoring';
const out=dirname(fileURLToPath(import.meta.url)),repo=resolve(out,'../../../../../../../..'),snapshot=resolve(out,'repository-input-snapshot');
const rootBase='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-e81-793-current407-two-real-remedies-root-preparation-20261012-v4';
const sourceConfigPath=rootBase+'/configs/source32-one-HE-context-removal.measured387.book-local.inputs.json';
const config=readGoalBookSourceAtlasInputConfig(sourceConfigPath,repo),before=buildGoalBookSourceAtlasInputs(config,repo);
const sha=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex');
const write=async(path:string,data:any)=>{await mkdir(dirname(path),{recursive:true});await writeFile(path,typeof data==='string'?data:JSON.stringify(data,null,2)+'\n');};
const read=async(path:string,root=repo)=>JSON.parse(await readFile(resolve(root,path),'utf8'));
const old='62149f36-87c0-5a2d-8a78-e7d4203f58c2',e9='e9d34f34-2a43-5cc7-bcca-1d08e057531d',d8='d8eeed29-d1b7-5a48-94b5-343629f8e867',peptide='197bc2c5-835e-59e7-9263-5684e89799cc';
const land=await read(config.landscapePath),canonical=normalizeCanonicalLandscape(land),gm=new Map<string,any>(land.goals.map((g:any)=>[g.id,g]));
assert.deepEqual(gm.get(old).contains,[e9,d8]);
const sourceDocumentPaths=new Set(config.sourceDocumentSnapshots?.map(s=>s.path)??[]);
const frozenCopies:any[]=[];
for(const binding of before.receipt.inputBindings){
 if(sourceDocumentPaths.has(binding.path))continue; // exact configured offline source-document pins remain effective
 const bytes=await readFile(resolve(repo,binding.path));assert.equal(sha(bytes),binding.sha256);
 await write(resolve(snapshot,binding.path),bytes.toString('utf8'));
 frozenCopies.push({path:binding.path,snapshotPath:resolve(snapshot,binding.path).slice(repo.length+1),sha256:binding.sha256,bytes:bytes.length});
}
const sourceConfigBytes=await readFile(resolve(repo,sourceConfigPath));await write(resolve(snapshot,sourceConfigPath),sourceConfigBytes.toString('utf8'));
const preparedViews:any[]=[];
for(const path of config.fallbackViewPaths??[]){
 const originalBytes=await readFile(resolve(repo,path)),original=JSON.parse(originalBytes.toString()),view=structuredClone(original),changes:any[]=[];
 const visit=(nodes:any[],locator:string)=>{nodes.forEach((n:any,i:number)=>{
  const nodePath=locator+'['+i+']';
  if(n.kind==='goalEntry'&&n.goalId===old){const prev=structuredClone(n);n.kind='canonicalSubtree';changes.push({nodePath,before:prev,after:structuredClone(n)});}
  if(n.children)visit(n.children,nodePath+'.children');
 });};
 visit(view.rootNodes,'rootNodes');assert.equal(changes.length,1,path);
 const reversed=structuredClone(view);const revert=(nodes:any[])=>nodes.forEach((n:any)=>{if(n.kind==='canonicalSubtree'&&n.goalId===old)n.kind='goalEntry';if(n.children)revert(n.children);});revert(reversed.rootNodes);assert.deepEqual(reversed,original);
 const result=compileCompositionView(normalizeCompositionView(view),canonical);assert.deepEqual(result.findings.filter(f=>f.severity==='error'),[]);
 const roles=collectCompositionProjectionRoleGoalIds(normalizeCompositionView(view).rootNodes,gm);
 assert.ok(roles.targetGoalIds.has(e9)&&roles.targetGoalIds.has(d8));
 const bytes=JSON.stringify(view,null,2)+'\n',preparedPath=resolve(out,'prepared-views',path.split('/').pop()!);
 await write(preparedPath,bytes);await write(resolve(snapshot,path),bytes);
 preparedViews.push({activeSourcePath:path,activeBeforeSha256:sha(originalBytes),preparedPath:preparedPath.slice(repo.length+1),preparedSha256:sha(bytes),changes,normalCompilerErrors:0,
  sourceHeaderUnchanged:true,otherReferencesUnchanged:true,profileBasis:'authored-view; official source profile remains unspecified',newIndependentVotes:0});
}
assert.equal(preparedViews.length,4);
const after=buildGoalBookSourceAtlasInputs(readGoalBookSourceAtlasInputConfig(sourceConfigPath,snapshot),snapshot);
const beforeBindings=new Map(before.receipt.inputBindings.map(b=>[b.path,b.sha256]));
const changedInputs=after.receipt.inputBindings.filter(b=>beforeBindings.get(b.path)!==b.sha256);
assert.deepEqual(changedInputs.map(b=>b.path).sort(),preparedViews.map(v=>v.activeSourcePath).sort());
assert.deepEqual(after.receipt.counts,before.receipt.counts); // measured unchanged union, no altered count expectation
const beforeScopes=new Map(before.receipt.scopes.map(s=>[s.key,s]));
const scopeDeltas=after.receipt.scopes.map(s=>{const prev=beforeScopes.get(s.key)!;return {scopeKey:s.key,beforeTargets:prev.goalIds.length,afterTargets:s.goalIds.length,added:s.goalIds.filter(id=>!prev.goalIds.includes(id)),removed:prev.goalIds.filter(id=>!s.goalIds.includes(id))};}).filter(s=>s.added.length||s.removed.length);
assert.equal(scopeDeltas.length,4);assert.ok(scopeDeltas.every(s=>s.removed.length===0&&s.added.length===2&&s.added.includes(e9)&&s.added.includes(d8)));
const scopeSupport=after.receipt.scopes.filter(s=>scopeDeltas.some(d=>d.scopeKey===s.key)).map(s=>({scopeKey:s.key,
 peptideWitnesses:s.witnesses.filter(w=>w.goalId===peptide),e9RawSourceWitnesses:s.witnesses.filter(w=>w.goalId===e9),d8RawSourceWitnesses:s.witnesses.filter(w=>w.goalId===d8),
 sourceProfileIsOfficial:false,profileBasis:'authored-view',newReadinessApproval:false}));
// Materialize the normal generated bytes only inside the supported isolated root.
for(const [path,bytes] of Object.entries(after.outputs))await write(resolve(snapshot,path),bytes);
await write(resolve(out,'source-before.normal-receipt.compact.json'),compactGoalBookSourceAtlasReceipt(before.receipt));
await write(resolve(out,'source-after.normal-receipt.compact.json'),compactGoalBookSourceAtlasReceipt(after.receipt));
const modelConfig=await read(rootBase+'/configs/current-source-union.normal-model.config.json');
const modelInputs:any[]=[];
for(const path of [modelConfig.goalVisualizationQaPath,...modelConfig.evidenceReviewPaths]){
 const bytes=await readFile(resolve(repo,path));await write(resolve(snapshot,path),bytes.toString('utf8'));modelInputs.push({path,sha256:sha(bytes),bytes:bytes.length});
}
const qa=await read(modelConfig.goalVisualizationQaPath),semantic=await read(config.semanticKindLedgerPath),duration=await read(config.durationModelPolicyPath),assets:any={};
for(const r of qa.records)if(r.imageUrl&&r.assetSha256)assets[r.imageUrl]=r.assetSha256;
const evidence=await Promise.all(modelConfig.evidenceReviewPaths.map(async(path:string)=>({path,text:await readFile(resolve(repo,path),'utf8')})));
const buildModel=(bundle:any)=>{
 const generated=(path:string)=>JSON.parse(bundle.outputs[path]);
 const manifest=generated(config.manifestPath);
 return buildGoalBookModel({landscape:land,compositionViewManifest:manifest,
  compositionViewSources:manifest.sourcePaths.map((path:string)=>({path,view:generated(path)})),
  navigationView:generated(config.navigationViewPath),durationModelPolicy:duration,semanticKindLedger:semantic,
  goalVisualizationQa:qa,goalVisualizationAssetDigests:assets,evidenceReviewSources:evidence,
  config:{...modelConfig,compositionViewManifestPath:config.manifestPath}});
};
const modelBefore=buildModel(before),modelAfter=buildModel(after);
assert.equal(modelBefore.pages.length,387);assert.equal(modelAfter.pages.length,387);
const pagesBefore=new Map(modelBefore.pages.map(p=>[p.goalId,p]));
const pageChanges=modelAfter.pages.filter(p=>pagesBefore.get(p.goalId)!.pageFingerprint!==p.pageFingerprint).map(p=>({goalId:p.goalId,
 beforePageFingerprint:pagesBefore.get(p.goalId)!.pageFingerprint,afterPageFingerprint:p.pageFingerprint,
 goalFingerprintUnchanged:pagesBefore.get(p.goalId)!.goalFingerprint===p.goalFingerprint,
 pageNumberUnchanged:pagesBefore.get(p.goalId)!.pageNumber===p.pageNumber,
 beforeApplicability:pagesBefore.get(p.goalId)!.applicability,afterApplicability:p.applicability}));
assert.deepEqual(pageChanges.map(p=>p.goalId).sort(),[e9,d8].sort());
assert.ok(pageChanges.every(p=>p.goalFingerprintUnchanged&&p.pageNumberUnchanged));
await write(resolve(out,'source387.after-four-inactive-views.normal-model.json'),modelAfter);
const parents=new Map<string,string[]>();for(const g of gm.values())for(const id of g.contains??[])parents.set(id,[...(parents.get(id)??[]),g.id]);
const effective=(id:string,seen=new Set<string>()):Set<string>=>{assert.ok(!seen.has(id));seen.add(id);const out=new Set<string>(gm.get(id).requires??[]);for(const p of parents.get(id)??[])for(const q of effective(p,new Set(seen)))if(q!==id)out.add(q);return out;};
const selected=(await read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-naturstoffe-current407-targeted-remediation-root-preparation-20261012-v3/later-stage-source6/sources/all-current-raw-source-bindings.no-display-dedup.json')).selectedWholePAndNativeGoals;
const sourceHolds=(bundle:any)=>bundle.receipt.scopes.flatMap((s:any)=>selected.filter((id:string)=>s.goalIds.includes(id)).map((goalId:string)=>({scopeKey:s.key,goalId,missing:[...effective(goalId)].filter(id=>!s.goalIds.includes(id))})).filter((h:any)=>h.missing.length));
const holdsBefore=sourceHolds(before),holdsAfter=sourceHolds(after),key=(h:any)=>h.scopeKey+'#'+h.goalId;
const keysBefore=new Set(holdsBefore.map(key)),keysAfter=new Set(holdsAfter.map(key));
const removedHolds=holdsBefore.filter((h:any)=>!keysAfter.has(key(h))),addedHolds=holdsAfter.filter((h:any)=>!keysBefore.has(key(h)));
assert.equal(removedHolds.length,12);
assert.ok(removedHolds.every((h:any)=>[peptide,'b47d542d-c2d7-5554-95dc-10b47ab622ab','ffec1761-c954-5b5d-a0cf-4c8367f91705'].includes(h.goalId)&&h.missing.length===1&&h.missing[0]===e9&&scopeDeltas.some(s=>s.scopeKey===h.scopeKey)));
assert.equal(addedHolds.length,8);assert.ok(addedHolds.every((h:any)=>[e9,d8].includes(h.goalId)));
const original147=(await read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-current407-remediation24-fresh-independent-b-20261012-v3/bounded-source-ownership-and-readiness.json')).sourceReadinessHolds;
const originalKeys=new Set(original147.map(key));
const removedOriginalHolds=removedHolds.filter((h:any)=>originalKeys.has(key(h)));
assert.equal(removedOriginalHolds.length,4);assert.ok(removedOriginalHolds.every((h:any)=>h.goalId===peptide));
for(const binding of before.receipt.inputBindings){
 if(sourceDocumentPaths.has(binding.path))continue;
 assert.equal(sha(await readFile(resolve(repo,binding.path))),binding.sha256,'original input drift '+binding.path);
}
for(const v of preparedViews)assert.equal(sha(await readFile(resolve(repo,v.activeSourcePath))),v.activeBeforeSha256,'active view modified');
const result={artifactRole:'inactive informed author source-scope preparation; no independent votes',
 normalApiRepositoryInputRoot:snapshot.slice(repo.length+1),sourceConfigPath,sourceConfigSha256:sha(sourceConfigBytes),
 originalRootInputsConserved:true,canonicalAndSemanticLedgerAndAllSourceMappingsUnchanged:true,
 preparedViews,changedNormalInputs:changedInputs,normalCountsBefore:before.receipt.counts,normalCountsAfter:after.receipt.counts,
 scopeDeltas,scopeSupportBeforeDisplayDedup:scopeSupport,
 pageChanges,targetedNativeContextImpact:{canonicalGoalFingerprintsChanged:0,full407CanonicalBookInputsChanged:0,
  source387PagesWithChangedApplicability:pageChanges.length,affectedGoalIds:[e9,d8],pageNumbersUnchanged:true,
  sourceAtlasContextMustBeReboundForAnyNewSourceScopeAssertion:true,newIndependentDOrPVotesRequiredByThisAuthor:false},
 readinessComparison:{wholeSelectedGoalCount:selected.length,before:holdsBefore.length,after:holdsAfter.length,
  fourOldPeptideScopeOmissionsHaveExplicitRouteAfterAuthorCorrection:removedOriginalHolds,
  eightOtherSelected40OldOmissionsAlsoGainTheSameExplicitPredecessor:removedHolds.filter((h:any)=>!originalKeys.has(key(h))),
  eightNewSplitScopeTargetsStillHaveOpenPreconditions:addedHolds,
  allOtherSourceSpecificReadinessUnapproved:true,notAnM7Gain:true},
 preservedInputSnapshot:frozenCopies,modelInputBindings:modelInputs,
 newScientificVotes:0,newSourceReadinessVotes:0,grantsM7Closure:false,activeOrGitWrites:false};
await write(resolve(out,'FINAL.four-view-scope-reference-and-normal-source.actual.json'),result);
console.log(JSON.stringify({preparedViews:4,compilerErrors:0,changedInputs:changedInputs.length,counts:after.receipt.counts,
 scopeDeltas:scopeDeltas.length,original147HoldsRemovedFromTechnicalComparison:removedOriginalHolds.length,selected40HoldsRemovedFromTechnicalComparison:removedHolds.length,newSplitTargetHolds:addedHolds.length,
 selected40HoldsBefore:holdsBefore.length,selected40HoldsAfter:holdsAfter.length,sourcePagesChanged:pageChanges.length,goalFingerprintsChanged:0,activeOrGitWrites:false}));
