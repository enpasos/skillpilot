// Apache-2.0. Normal unmodified source/applicability APIs; author inputs only.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync,lstatSync,mkdirSync,readFileSync,writeFileSync } from 'node:fs'
import { dirname,resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const R=process.cwd(),E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
const N=`${E}/chemie-f947-final-source-PNG-explicit-tasks-neutral-native-author-root-20261013-v11`,F=`${E}/chemie-f947-bounded-source-route-remediation-author-20261013-v9`
const X=resolve(R,'tmp/chemie-f947-final-neutral-native-execution-20261013-v11'),G='f947cd04-952a-5a9d-9445-3ffc70e02c3c',L='c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'
const read=(p:string,root=R):any=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const sha=(b:Buffer|string)=>`sha256:${createHash('sha256').update(b).digest('hex')}`
const write=(p:string,d:any,root=R,overwrite=false)=>{const target=resolve(root,p);assert.ok(root===X || p.startsWith(`${N}/`));let parent=dirname(target);while(parent!==root){assert.ok(parent.startsWith(`${root}/`));assert.ok(!lstatSync(parent).isSymbolicLink(),parent);parent=dirname(parent)};if(!overwrite)assert.ok(!existsSync(target));else assert.ok(!lstatSync(target).isSymbolicLink());writeFileSync(target,`${JSON.stringify(d,null,2)}\n`,{flag:overwrite?'w':'wx'})}
const plan=read(`${N}/source/FINAL.source-route-author-plan.pending-scientific-judgment.json`)
const normalizedAliases=new Map(plan.authorProposedSourceChanges.map((p:any)=>[p.proposedFutureLivePath,p.originalLiveBinding.path]))
const normalize=(x:any):any=>typeof x==='string'?(normalizedAliases.get(x)??x):Array.isArray(x)?x.map(normalize):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([k,v])=>[k,normalize(v)])):x
if(process.argv[2]==='compile'){
 const [rootApi,privateApi]=await Promise.all([R,X].map(root=>import(pathToFileURL(resolve(root,'app/scripts/applicabilityCompiler.ts')).href)))
 const chem=(api:any)=>api.buildApplicabilityCompilation().reports.find((r:any)=>r.landscapeId===L)
 const old=chem(rootApi),first=chem(privateApi),target=first.goals.find((g:any)=>g.goalId===G)
 assert.deepEqual(target.compiledApplicability.jurisdiction,['DE-BW','DE-BY','DE-HB','DE-HE','DE-HH','DE-RP','DE-TH'])
 const canPath=`${N}/candidate/canonical523.current402.seven-images-source-boundary.author.json`,can=read(canPath)
 can.goals.find((g:any)=>g.id===G).applicability.jurisdiction=[...target.compiledApplicability.jurisdiction]
 write(canPath,can,R,true);write(canPath,can,X,true)
 write('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json',can,X,true)
 const final=chem(privateApi),changed=old.goals.filter((g:any)=>JSON.stringify(g.compiledApplicability)!==JSON.stringify(final.goals.find((c:any)=>c.goalId===g.goalId).compiledApplicability)).map((g:any)=>g.goalId)
 assert.deepEqual(changed,[G]);assert.ok(!final.findings.some((f:any)=>f.goalId===G&&f.code==='APV-203'))
 const derived:any[]=[]
 for(const g of old.goals.filter((g:any)=>g.goalId!==G)){
  const current=final.goals.find((c:any)=>c.goalId===g.goalId)
  const direct=(v:any)=>v.evidence.filter((e:any)=>!['requires-closure','child-union'].includes(e.kind)).map(normalize).sort((a:any,b:any)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))
  if(g.goalType==='atomic')assert.deepEqual(direct(current),direct(g),g.goalId)
  if(JSON.stringify(normalize(current.evidence))!==JSON.stringify(g.evidence))derived.push({goalId:g.goalId,title:g.title,ownCompiledScopeUnchanged:true,goalType:g.goalType,beforeDerived:g.evidence.filter((e:any)=>['requires-closure','child-union'].includes(e.kind)),afterDerived:current.evidence.filter((e:any)=>['requires-closure','child-union'].includes(e.kind))})
 }
 plan.finalCandidateScopeDerivationPendingNormalCompiler=false;plan.finalMachineDerivedJurisdictions=target.compiledApplicability.jurisdiction;plan.onlyF947CompiledCountrySetChanged=true
 write(`${N}/source/FINAL.source-route-author-plan.pending-scientific-judgment.json`,plan,R,true)
 write(`${N}/checks/final-normal-compiler-seven-scopes-and-derived-context.actual.json`,{schemaVersion:1,normalModule:'app/scripts/applicabilityCompiler.ts',moduleSha256:sha(readFileSync(resolve(R,'app/scripts/applicabilityCompiler.ts'))),candidateJurisdictions:target.compiledApplicability.jurisdiction,changedCompiledGoalIds:changed,other522CompiledCountrySetsExact:true,otherAtomicDirectSourceComponentsExactAfterDeclaredPathTranslation:true,derivedAnnotationChanges:derived,sourcePathsTranslatedExplicitly:true,genericHBPartialSourceStillHeld:true,SH005PracticalSourceUnionStillHeld:true,newIndependentVotes:0,activeWrites:false})
 console.log(JSON.stringify({normalCompilerPassed:true,candidateJurisdictions:target.compiledApplicability.jurisdiction,other522ScopeSetsExact:true,changedDerivedAnnotationGoalIds:derived.map(g=>g.goalId)}))
}else if(process.argv[2]==='atlas'){
 const api=await import(pathToFileURL(resolve(R,'app/scripts/goalBookSourceAtlasInputs.ts')).href)
 const oldConfig=read('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'),future=read(`${F}/candidate/source-atlas-author-current-config.json`)
 const old=api.buildGoalBookSourceAtlasInputs(oldConfig,R),next=api.buildGoalBookSourceAtlasInputs(future,X)
 const keys=new Set([...old.receipt.scopes,...next.receipt.scopes].map((s:any)=>s.key)),checked:any[]=[],targetScopes:any[]=[]
 for(const key of keys){
  const before=old.receipt.scopes.find((s:any)=>s.key===key),after=next.receipt.scopes.find((s:any)=>s.key===key)
  const safe=(s:any)=>s?{...s,goalIds:s.goalIds.filter((id:string)=>id!==G),witnesses:s.witnesses.filter((w:any)=>w.goalId!==G).map(normalize)}:null
  assert.deepEqual(safe(after),safe(before),key);checked.push({key,other401ScopeAndWholeWitnessComponentsExactAfterDeclaredTranslation:true})
  if(after?.goalIds.includes(G))targetScopes.push({key,witnesses:after.witnesses.filter((w:any)=>w.goalId===G)})
 }
 const retained=[...new Set(targetScopes.flatMap(s=>s.witnesses.map((w:any)=>w.sourceGoalId)))].sort()
 assert.ok(!retained.includes('de-sh-chemie-sekii-fachanforderungen-2022-3-1-chemie-der-funktionalen-stoffe-und-materialien-005-6e951b3f'))
 assert.ok(targetScopes.every(s=>s.witnesses.every((w:any)=>w.coverage==='direct')))
 write(`${N}/source/source-atlas-final.config.json`,future)
 write(`${N}/source/f947-current-final-source-atlas-neutral.actual.json`,{schemaVersion:1,normalModule:'app/scripts/goalBookSourceAtlasInputs.ts',normalModuleSha256:sha(readFileSync(resolve(R,'app/scripts/goalBookSourceAtlasInputs.ts'))),goalId:G,counts:next.receipt.counts,scopesAndWholeWitnessComponents:targetScopes,retainedSourceGoalIds:retained,allRetainedWitnessesDirect:true,genericHBPartialClassificationHeldForFreshJudgment:true,SH005WholePracticalSourceUnionStillHeld:true,sourceAcceptance:false})
 write(`${N}/checks/final-normal-source-atlas-other401-retention.actual.json`,{schemaVersion:1,normalBaselineCounts:old.receipt.counts,normalFinalCandidateCounts:next.receipt.counts,scopesChecked:checked,allOther401SourceScopesAndWitnessComponentsExactAfterDeclaredTranslation:true,mappingWholeFileHashesAndNamesChangeExplicitly:true,retainedF947Scopes:targetScopes.map(s=>s.key),retainedSourceGoalIds:retained,genericHBPartialSourceStillHeld:true,SH005PracticalSourceUnionStillHeld:true,newScientificVotes:0,activeWrites:false})
 console.log(JSON.stringify({sourceAtlasBuilt:true,baselineCounts:old.receipt.counts,finalCounts:next.receipt.counts,remainingF947ScopeCount:targetScopes.length,retainedSourceIdCount:retained.length,other401ExactAfterPathTranslation:true}))
}else throw new Error('Expected compile or atlas')
