import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const R=process.cwd();const O=join(R,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-D64-unchanged-science-current-container-binding-AUTHOR-INERT-c-v1');
const load=(p:string)=>JSON.parse(readFileSync(p,'utf8'));const sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex');
const req=createRequire(join(R,'app/package.json'));const esbuild=req('esbuild');const Module=req('node:module');
const originalPath=join(R,'app/scripts/reportDeepUnderstandingRollout.ts');
const code=readFileSync(originalPath,'utf8')+'\nexport { loadAuthoritativeScope, validateResolutionIndex };\n';
const transpiled=esbuild.transformSync(code,{format:'cjs',platform:'node',target:'node20',loader:'ts',define:{'import.meta.url':JSON.stringify(pathToFileURL(originalPath).href)}}).code;
const mod=new Module(originalPath);mod.filename=originalPath;mod.paths=Module._nodeModulePaths(dirname(originalPath));mod._compile(transpiled,originalPath);const native=mod.exports;
const before=load(join(O,'actual-whole-active-registry-before62.EXACT.json')).subjects.find((x:any)=>x.subject==='wirtschaftswissenschaften');
const after=load(join(O,'candidate-current62-owner-only-D-registry.INERT.config.json')).subjects.find((x:any)=>x.subject==='wirtschaftswissenschaften');
const old=load('/tmp/economics-current346-D-gap-c/actual-native-description-only-current346.trace.json');
const scope=native.loadAuthoritativeScope(after);
const beforeChains=native.buildResolutionSupersessionChains(before.resolutionSupersessions,before.resolutionIndexPaths,scope.atomicGoalIds);
const afterChains=native.buildResolutionSupersessionChains(after.resolutionSupersessions,after.resolutionIndexPaths,scope.atomicGoalIds);
const superseded=(chains:any[])=>{const m=new Map<string,Set<string>>();for(const c of chains)for(const p of c.indexPaths.slice(0,-1)){const s=m.get(p)||new Set<string>();s.add(c.goalId);m.set(p,s);}return m;};
const bs=superseded(beforeChains.chains);const as=superseded(afterChains.chains);
const eq=(a:any,b:any)=>JSON.stringify([...a||[]].sort())===JSON.stringify([...b||[]].sort());
const changed=after.resolutionIndexPaths.filter((p:string)=>!before.resolutionIndexPaths.includes(p)||!eq(bs.get(p),as.get(p)));
const inputs=new Map<string,string>();const guard=(p:string)=>{inputs.set(p,sha(join(R,p)));};
for(const p of [after.landscapePath,after.semanticKindLedgerPath,'app/scripts/reportDeepUnderstandingRollout.ts','curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',...after.resolutionIndexPaths])guard(p);
const results:any[]=[];const invocations:any[]=[];
for(const p of after.resolutionIndexPaths){
 if(changed.includes(p)){
  const r=await native.validateResolutionIndex(p,after,scope,as.get(p));results.push({path:p,...r});invocations.push({path:p,originalHistoricalIndex:before.resolutionIndexPaths.includes(p),readyGoalIds:[...r.ready],claimedGoalIds:[...r.claimedGoalIds],historicalClaimedGoalIds:[...r.historicalClaimedGoalIds],issues:r.issues});
 }else{
  const r=old.indices.find((x:any)=>x.path===p);if(!r)throw new Error('Missing exact historical cached native result');results.push({path:p,ready:new Set(r.ready),claimedGoalIds:new Set(r.claimedGoalIds),historicalClaimedGoalIds:new Set(r.historicalClaimedGoalIds),issues:r.issues});
 }
}
const invalid=new Set(afterChains.invalidGoalIds);const chains=afterChains.chains.map((c:any)=>{const intact=native.hasIntactResolutionSupersessionChain(c,results);if(!intact)invalid.add(c.goalId);return {...c,intact};});
const owners=new Map<string,string>();const overlap:any[]=[];
for(const r of results)for(const id of r.claimedGoalIds){if(owners.has(id))overlap.push({goalId:id,first:owners.get(id),second:r.path});owners.set(id,r.path);}
const ready=new Set<string>();for(const r of results)for(const id of r.ready)if(owners.has(id)&&!invalid.has(id))ready.add(id);
const beforeReady=new Set<string>(old.readyGoalIds);const gained=[...ready].filter(id=>!beforeReady.has(id)).sort();const lost=[...beforeReady].filter(id=>!ready.has(id)).sort();
const endGuards=[...inputs].map(([p,s])=>({path:p,beforeSha256:s,endSha256:sha(join(R,p)),exact:s===sha(join(R,p))}));
if(lost.length||overlap.length||afterChains.issues.length||endGuards.some(x=>!x.exact))throw new Error('Current216 nonloss or whole-input guard failed');
const out=join(O,'actual-targeted-native-affected-owner-indices-current216-nonloss-candidate-only.READONLY.json');if(existsSync(out))throw new Error('Existing readonly result');
writeFileSync(out,JSON.stringify({status:'READONLY-original-native-bounded-registry-candidate-check-not-integration',actualUTC:new Date().toISOString(),HEAD:execFileSync('git',['rev-parse','HEAD'],{cwd:R,encoding:'utf8'}).trim(),nativeCodePath:'app/scripts/reportDeepUnderstandingRollout.ts',nativeCodeSha256:sha(originalPath),inMemoryExportOnly:['loadAuthoritativeScope','validateResolutionIndex'],mainInvoked:false,globalGeneratorInvoked:false,activeWrites:0,oldUnaffectedIndexResultsReusedOnExactCurrentInputs:after.resolutionIndexPaths.length-changed.length,oldNativeResultPath:'/tmp/economics-current346-D-gap-c/actual-native-description-only-current346.trace.json',actualAffectedNativeIndexInvocations:invocations,currentBeforeDReady:216,inertCandidateDReady:ready.size,inertCandidateDReadyGoalIds:[...ready].sort(),inertCandidateGainedGoalIds:gained,previous216LostGoalIds:lost,overlaps:overlap,chains,remainingIndividualBindingIssues:results.flatMap(r=>r.issues),endGuards,newScientificReviews:0,integratedDescriptionClosures:0,strictClosures:0,humanApproval:false},null,2)+'\n');
console.log(JSON.stringify({nativeAffectedInvocations:changed.length,beforeD:216,inertD:ready.size,inertGained:gained.length,lost:lost.length,remainingIssues:results.reduce((n,r)=>n+r.issues.length,0),brokenChains:chains.filter((c:any)=>!c.intact).length,activeWrites:0}));
