import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const R='/home/enpasos/projects/skillpilot';
const F=join(R,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-four-current-D56-native-owner-context-scoping-AUTHOR-INERT-c-v1/current-root-P15-QA346-qualified-native-followers-v2');
const W=join(R,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-D64-unchanged-science-current-container-binding-AUTHOR-INERT-c-v1');
const load=(p:string)=>JSON.parse(readFileSync(p,'utf8'));const sha=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex');
const req=createRequire(join(R,'app/package.json'));const esbuild=req('esbuild');const Module=req('node:module');
const originalPath=join(R,'app/scripts/reportDeepUnderstandingRollout.ts');
const code=readFileSync(originalPath,'utf8')+'\nexport { loadAuthoritativeScope, validateResolutionIndex };\n';
const transpiled=esbuild.transformSync(code,{format:'cjs',platform:'node',target:'node20',loader:'ts',define:{'import.meta.url':JSON.stringify(pathToFileURL(originalPath).href)}}).code;
const mod=new Module(originalPath);mod.filename=originalPath;mod.paths=Module._nodeModulePaths(dirname(originalPath));mod._compile(transpiled,originalPath);const native=mod.exports;
const before=load(join(F,'actual-whole-qualified-active-registry45-prefix101.EXACT.json')).subjects.find((x:any)=>x.subject==='wirtschaftswissenschaften');
const after=load(join(F,'candidate-current-four-owner-only-registry49-prefix105.INERT.config.json')).subjects.find((x:any)=>x.subject==='wirtschaftswissenschaften');
const scope=native.loadAuthoritativeScope(after);
const campaign=await import(pathToFileURL(join(R,'app/scripts/validateGoalDescriptionReviewCampaign.ts')).href);
const evidence=await import(pathToFileURL(join(R,'app/scripts/goalEvidenceProfileModel.ts')).href);
const priorLandscape=JSON.parse(execFileSync('git',['show','43461b906438572f4f3b64d056112f4189dca4f4:'+after.landscapePath],{cwd:R,encoding:'utf8',maxBuffer:32*1024*1024}));
const oldGoals=new Map(priorLandscape.goals.map((g:any)=>[g.id,g]));
const nativeParity:any[]=[];
for(const id of scope.atomicGoalIds){const old:any=oldGoals.get(id);const current=scope.rawLandscape.goals.find((g:any)=>g.id===id);if(!old||!current)throw new Error('Missing actual ordinary contract '+id);const exact=JSON.stringify(campaign.buildGoalDescriptionCanonicalContext(old))===JSON.stringify(campaign.buildGoalDescriptionCanonicalContext(current))&&JSON.stringify(evidence.goalEvidenceSemanticPayload(old,'goal-evidence-v1','curricularAtomic'))===JSON.stringify(evidence.goalEvidenceSemanticPayload(current,'goal-evidence-v1','curricularAtomic'));if(!exact)throw new Error('Ordinary native description-input scientific drift '+id);nativeParity.push({goalId:id,oldAndCurrentNativeCanonicalContextAndGoalFingerprintPayloadExact:true});}
const base=load('/tmp/economics-current346-D-gap-c/actual-native-description-only-current346.trace.json');
const safe=load(join(W,'safe-nine-direct-only-native-owner-follower/actual-targeted-native-current216-nonloss-only-nine-direct-no-indirect.READONLY.json'));
if(sha(readFileSync(originalPath))!==safe.nativeCodeSha256)throw new Error('Native checker code drift');
const cached=new Map<string,any>(base.indices.map((x:any)=>[x.path,{...x,ready:new Set(x.ready),claimedGoalIds:new Set(x.claimedGoalIds),historicalClaimedGoalIds:new Set(x.historicalClaimedGoalIds)}]));
for(const x of safe.actualAffectedNativeIndexInvocations)cached.set(x.path,{...x,ready:new Set(x.readyGoalIds),claimedGoalIds:new Set(x.claimedGoalIds),historicalClaimedGoalIds:new Set(x.historicalClaimedGoalIds)});
const beforeChains=native.buildResolutionSupersessionChains(before.resolutionSupersessions,before.resolutionIndexPaths,scope.atomicGoalIds);
const afterChains=native.buildResolutionSupersessionChains(after.resolutionSupersessions,after.resolutionIndexPaths,scope.atomicGoalIds);
const superseded=(chains:any[])=>{const m=new Map<string,Set<string>>();for(const c of chains)for(const p of c.indexPaths.slice(0,-1)){const s=m.get(p)||new Set<string>();s.add(c.goalId);m.set(p,s);}return m;};
const bs=superseded(beforeChains.chains),as=superseded(afterChains.chains);
const eq=(a:any,b:any)=>JSON.stringify([...a||[]].sort())===JSON.stringify([...b||[]].sort());
const changed=after.resolutionIndexPaths.filter((p:string)=>!before.resolutionIndexPaths.includes(p)||!eq(bs.get(p),as.get(p)));
const inputs=new Map<string,string>();const guard=(p:string)=>inputs.set(p,sha(readFileSync(join(R,p))));
for(const p of [after.landscapePath,after.semanticKindLedgerPath,'app/scripts/reportDeepUnderstandingRollout.ts','curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',...after.resolutionIndexPaths])guard(p);
const results:any[]=[],invocations:any[]=[];
for(const p of after.resolutionIndexPaths){
 if(changed.includes(p)){const r=await native.validateResolutionIndex(p,after,scope,as.get(p));results.push({path:p,...r});invocations.push({path:p,originalHistoricalIndex:before.resolutionIndexPaths.includes(p),readyGoalIds:[...r.ready],claimedGoalIds:[...r.claimedGoalIds],historicalClaimedGoalIds:[...r.historicalClaimedGoalIds],issues:r.issues});}
 else{const x=cached.get(p);if(!x)throw new Error('Missing exact cached old native index '+p);results.push({path:p,...x});}
}
const invalid=new Set(afterChains.invalidGoalIds);const chains=afterChains.chains.map((c:any)=>{const intact=native.hasIntactResolutionSupersessionChain(c,results);if(!intact)invalid.add(c.goalId);return {...c,intact};});
const owners=new Map<string,string>(),overlap:any[]=[];for(const r of results)for(const id of r.claimedGoalIds){if(owners.has(id))overlap.push({goalId:id,first:owners.get(id),second:r.path});owners.set(id,r.path);}
const ready=new Set<string>();for(const r of results)for(const id of r.ready)if(owners.has(id)&&!invalid.has(id))ready.add(id);
const beforeReady=new Set<string>(safe.inertCandidateDReadyGoalIds);if(beforeReady.size!==225)throw new Error('Unexpected actual current Safe9 baseline');
const gained=[...ready].filter(id=>!beforeReady.has(id)).sort(),lost=[...beforeReady].filter(id=>!ready.has(id)).sort();
const plan=load(join(F,'actual-current4-final-native-group-configs-original-criteria-parity.INERT.json'));const own=new Set(plan.groups.flatMap((g:any)=>g.goalIds));
const endGuards=[...inputs].map(([p,s])=>({path:p,beforeSha256:s,endSha256:sha(readFileSync(join(R,p))),exact:s===sha(readFileSync(join(R,p)))}));
const boundaryFailed=lost.length||overlap.length||afterChains.issues.length||endGuards.some(x=>!x.exact);
const out=join(F,'actual-targeted-native-four-owner-225-nonloss-and-indirect-ID-release.READONLY.json');if(existsSync(out))throw new Error('Immutable output already exists');
writeFileSync(out,JSON.stringify({status:boundaryFailed?'FAIL-boundary':'READONLY-native-candidate-measurement-qualification-not-activation',actualUTC:new Date().toISOString(),HEAD:execFileSync('git',['rev-parse','HEAD'],{cwd:R,encoding:'utf8'}).trim(),nativeCodePath:'app/scripts/reportDeepUnderstandingRollout.ts',nativeCodeSha256:sha(readFileSync(originalPath)),inMemoryExportOnly:['loadAuthoritativeScope','validateResolutionIndex'],mainInvoked:false,globalGeneratorInvoked:false,activeWrites:0,whole346NativeScientificDescriptionInputPayloadParityAgainstCIHEAD:nativeParity,unaffected45IndexResultsReusedFromOriginalExactCurrentContextAndSafe9:after.resolutionIndexPaths.length-changed.length,actualAffectedNativeIndexInvocations:invocations,currentBeforeDReady:225,inertCandidateDReady:ready.size,inertCandidateDReadyGoalIds:[...ready].sort(),inertCandidateGainedGoalIds:gained,selectedFourOwnerReady:[...own].filter(id=>ready.has(id)),selectedFourOwnerStillChainBlocked:[...own].filter(id=>!ready.has(id)),indirectGainedGoalIds:gained.filter(id=>!own.has(id)),previous225LostGoalIds:lost,overlaps:overlap,chains,remainingIndividualBindingIssues:results.flatMap(r=>r.issues),endGuards,newScientificReviews:0,integratedDescriptionClosures:0,strictClosures:0,humanApproval:false},null,2)+'\n');
console.log(JSON.stringify({nativeAffectedInvocations:changed.length,beforeD:225,inertD:ready.size,gained,gainedOwners:gained.filter(id=>own.has(id)),indirect:gained.filter(id=>!own.has(id)),selectedStillBlocked:[...own].filter(id=>!ready.has(id)),lost,remainingIssues:results.reduce((n,r)=>n+r.issues.length,0),brokenChains:chains.filter((c:any)=>!c.intact).length,activeWrites:0}));
