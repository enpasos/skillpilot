/** Prepared only. Root must review and explicitly execute after the independent technical seal. */
import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve, dirname, relative, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createRequire, Module } from 'node:module'
import { isDeepStrictEqual } from 'node:util'

const repo = process.cwd()
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/'
const candidateRoot = base+'chemie-current450-three-inherited-orientation-atomic-candidate-technical-20261018-v1'
const secondRoot = base+'chemie-current450-three-inherited-orientation-informed-technical-second-check-20261018-v1'
const out = base+'chemie-current450-three-reviewed-orientation-checkpoint-integration-technical-20261018-v1'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const semPath = 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
const registryPath = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
const candidatePath = candidateRoot+'/AUTHOR.three-whole-goal-CAS.requires-only.candidate.json'
const firstSealPath = candidateRoot+'/SEAL.three-inherited-orientation-atomic-candidate.json'
const templatePath = secondRoot+'/TEMPLATE.minimal-measured-production-bindings.after-root-CAS.pending.json'
// Filled with the actually received immutable C seal before root handoff.
const secondSealPath = secondRoot+'/SEAL.informed-technical-second-check.json'
const secondSealSha256 = '837f610e235844d070d05c7ced13d85f8fb98fdaf59614189a34efff0b0aa496'
const expected = {
  [canonicalPath]: '6c485a0d2828f6821e8d92a720714329f475837882c0167ef1d33edda8be89da',
  [semPath]: '120c5321564b6a6cc53f1929ffd92e2b61df4b03a552b24cd9207ed6018a0436',
  [registryPath]: 'a893e69587fcb13e6ea2f0923ff004607c5555275e6bb9787e576d3953de9008',
}
const ids = ['95dc0ee5-a0af-5682-af32-d66e36fbeb50','13d4f336-ab16-54a7-9479-c920b458f385','42a84bca-d27e-581f-a43a-eee424f0504d']
const anchor = 'a9c22adc-b543-5b0c-a2d8-3189facdff08'
const json = (p:string):any => JSON.parse(readFileSync(resolve(repo,p),'utf8'))
const sha = (v:Buffer|string) => createHash('sha256').update(v).digest('hex')
const pin = (p:string) => {const b=readFileSync(resolve(repo,p));return {path:p,sha256:sha(b),bytes:b.length}}
const assert = (v:unknown,m:string):asserts v => {if(!v)throw Error(m)}
const same = (a:unknown,b:unknown,m:string) => assert(isDeepStrictEqual(a,b),m)
const abs = (p:string) => resolve(repo,p)
const assertPin = (p:any) => same(pin(p.path),p,'Pinned input drift: '+p.path)
const writeNew = (p:string,data:Buffer|string) => {assert(p.startsWith(out+'/'),'Artifact outside output lease');mkdirSync(dirname(abs(p)),{recursive:true});writeFileSync(abs(p),data,{flag:'wx'})}
const writeJson = (p:string,data:any) => writeNew(p,JSON.stringify(data,null,2)+'\n')
const compactSha = (v:any) => sha(JSON.stringify(v))
const countText = (source:string,value:string) => source.split(value).length-1
const rawReplaceOnce = (source:string,before:string,after:string) => {assert(countText(source,before)===1,'Ambiguous raw replacement: '+before);return source.replace(before,after)}
function verifySeal(path:string,expectedSha:string) {
  assert(pin(path).sha256===expectedSha,'Seal digest mismatch: '+path)
  const seal=json(path)
  assert(Array.isArray(seal.files),'Seal must enumerate exact files: '+path)
  for(const p of seal.files)assertPin(p)
  return seal
}
function patchRawGoals(raw:string,afterById:Map<string,any>) {
  const marker='\n  "goals": [\n',markerIndex=raw.indexOf(marker),start=markerIndex+marker.length,end=raw.lastIndexOf('\n  ]')
  assert(markerIndex>=0&&end>start,'Unexpected canonical raw layout')
  const body=raw.slice(start,end),starts=[...body.matchAll(/^    \{/gm)].map(m=>m.index!)
  assert(starts.length===JSON.parse(raw).goals.length,'Unexpected raw goal count')
  let next=''
  for(let i=0;i<starts.length;i++) {
    const part=body.slice(starts[i],starts[i+1]??body.length),g=JSON.parse(part.trim().replace(/,$/,''))
    next+=ids.includes(g.id)?'    '+JSON.stringify(afterById.get(g.id),null,2).replace(/\n/g,'\n    ')+part.slice(part.lastIndexOf('}')+1):part
  }
  return raw.slice(0,start)+next+raw.slice(end)
}
async function stockRouteApi() {
  const file=abs('app/scripts/generateCurriculumQualityStatus.ts'),source=readFileSync(file,'utf8')
  const req=createRequire(abs('app/package.json')),esbuild=req('esbuild')
  const built=await esbuild.build({stdin:{contents:source+'\nexport {evaluateRouteProfile,routeProfiles,buildEffectiveRequiresEdges,buildAtomicDirectRequiresEdges};\n',sourcefile:file,resolveDir:dirname(file),loader:'ts'},bundle:true,packages:'external',platform:'node',format:'cjs',target:'node20',write:false,logLevel:'silent',define:{'import.meta.url':JSON.stringify(pathToFileURL(file).href)}})
  const probe=new Module(file);probe.filename=file;probe.paths=(Module as any)._nodeModulePaths(dirname(file));(probe as any)._compile(built.outputFiles[0].text,file)
  return (probe as any).exports
}
function fullClosure(id:string,edges:Map<string,string[]>) {
  const seen=new Set<string>(),queue=[...(edges.get(id)??[])]
  while(queue.length){const i=queue.pop()!;assert(i!==id,'Requires cycle at '+id);if(seen.has(i))continue;seen.add(i);queue.push(...(edges.get(i)??[]))}
  return [...seen].sort()
}
function resourceDigests(goal:any,config:any) {
  const result:Record<string,string>={}
  if(!config.reviewedResourceTypes.includes('goal-visualization'))return result
  for(const link of goal.resourceLinks??[])if(link.type==='goal-visualization'){
    assert(link.url.startsWith('/assets/goal-visualizations/'),'Unsupported resource route')
    result[link.url]='sha256:'+sha(readFileSync(abs('app/public/'+link.url.slice(1))))
  }
  return result
}

async function main() {
  assert(process.argv.length===3&&process.argv[2]==='--apply-reviewed-three-orientation-checkpoint','Explicit root apply flag required; this script was prepared but not executed by its author.')
  assert(!existsSync(abs(out)),'Never overwrite an existing technical integration')
  assert(secondSealSha256!=='PENDING_ACTUAL_C_SEAL','Independent technical C seal has not been pinned')
  const firstSeal=verifySeal(firstSealPath,'cf23170102072946e849d5c4fa84e9580f55efd8ded15ca03180cd4d323718ba')
  const secondSeal=verifySeal(secondSealPath,secondSealSha256)
  assert(secondSeal.status==='PASS'&&secondSeal.normalWrites===0&&secondSeal.newDPAMVOrHumanVotes===0,'C technical check is not the required read-only PASS')
  for(const key of ['canonicalInput','semanticKindsInput','registryInput'])assertPin(secondSeal[key])
  const secondCheck=json(secondRoot+'/CHECK.independent-original-stock-737-closures-three-witnesses-and-routes.json')
  const productionPins=json(secondRoot+'/SOURCE.production-functions-and-referenced-input-pins.json')
  const cInputPins:any[]=[]
  const collectPins=(value:any)=>{if(Array.isArray(value)){for(const v of value)collectPins(v)}else if(value&&typeof value==='object'){if(typeof value.path==='string'&&typeof value.sha256==='string'&&typeof value.bytes==='number'){assertPin(value);cInputPins.push(value)}else for(const v of Object.values(value))collectPins(v)}}
  collectPins(secondCheck.inputPins);collectPins(productionPins)
  const sourceBefore=Object.fromEntries(Object.keys(expected).map(p=>[p,readFileSync(abs(p))])) as Record<string,Buffer>
  for(const [p,h] of Object.entries(expected))assert(sha(sourceBefore[p])===h,'Raw preflight drift: '+p)
  const canonicalBefore=JSON.parse(sourceBefore[canonicalPath].toString()),semBefore=JSON.parse(sourceBefore[semPath].toString()),registryBefore=JSON.parse(sourceBefore[registryPath].toString())
  const author=json(candidatePath),template=json(templatePath)
  assertPin(author.canonicalInput);assertPin(template.canonicalCASCandidate)
  assert(author.records.length===3&&template.records.length===3,'Wrong three-goal scope')
  same(author.records.map((r:any)=>r.goalId),ids,'Candidate goal order mismatch')
  same(template.DContextChangedGoalIds,ids,'D drift scope mismatch')
  const canonicalAfter=structuredClone(canonicalBefore),afterById=new Map<string,any>(canonicalAfter.goals.map((g:any)=>[g.id,g])),beforeById=new Map<string,any>(canonicalBefore.goals.map((g:any)=>[g.id,g]))
  for(const r of author.records){
    same(beforeById.get(r.goalId),r.beforeWholeGoal,'Whole-goal CAS failed: '+r.goalId)
    assert(compactSha(r.beforeWholeGoal)===r.beforeWholeGoalCompactJsonSha256,'Before CAS digest mismatch')
    assert(compactSha(r.candidateWholeGoal)===r.candidateWholeGoalCompactJsonSha256,'After CAS digest mismatch')
    const reset=structuredClone(r.candidateWholeGoal);reset.requires=r.beforeWholeGoal.requires;same(reset,r.beforeWholeGoal,'Non-requires delta')
    same(r.candidateWholeGoal.requires,[...r.beforeWholeGoal.requires,anchor],'Only one append is permitted')
    afterById.set(r.goalId,structuredClone(r.candidateWholeGoal))
  }
  canonicalAfter.goals=canonicalAfter.goals.map((g:any)=>afterById.get(g.id))
  assert(canonicalAfter.goals.length===737,'Expected exact current737 graph')
  const resetWhole=structuredClone(canonicalAfter);resetWhole.goals=resetWhole.goals.map((g:any)=>ids.includes(g.id)?beforeById.get(g.id):g);same(resetWhole,canonicalBefore,'Unrelated graph mutation')
  const canonicalRawAfter=patchRawGoals(sourceBefore[canonicalPath].toString(),afterById);same(JSON.parse(canonicalRawAfter),canonicalAfter,'Raw graph patch mismatch')
  const stock=await stockRouteApi(),profile=stock.routeProfiles.find((p:any)=>p.profileId==='canonical-chemistry-sek2')
  const effectiveBefore=stock.buildEffectiveRequiresEdges(canonicalBefore),effectiveAfter=stock.buildEffectiveRequiresEdges(canonicalAfter)
  const closureVectorBefore=[],closureVectorAfter=[]
  for(const g of canonicalBefore.goals){const b=fullClosure(g.id,effectiveBefore),a=fullClosure(g.id,effectiveAfter);same(a,b,'Complete effective prerequisites changed: '+g.id);closureVectorBefore.push([g.id,b]);closureVectorAfter.push([g.id,a])}
  const beforeRoute=stock.evaluateRouteProfile(canonicalBefore,profile,{reports:[]}),candidateRoute=stock.evaluateRouteProfile(canonicalAfter,profile,{reports:[]})
  same(beforeRoute,secondCheck.beforeScope,'Current route differs from C sealed beforeScope');same(candidateRoute,secondCheck.candidateScope,'Candidate route differs from C sealed candidateScope')
  const metric=(route:any,rule:string,key:string)=>route.rules.find((r:any)=>r.id===rule).metrics[key]
  assert(metric(beforeRoute,'CQR-102','missingDirectMotivationPath')===8,'Baseline is no longer the measured eight-gap state')
  for(const [rule,keys] of [['CQR-101',['missingMotivationPath','missingTerminalPath']],['CQR-102',['missingDirectMotivationPath','missingDirectTerminalPath']]] as const)for(const key of keys)assert(metric(candidateRoute,rule,key)===0,'Candidate route not zero: '+rule+'/'+key)
  const old27=json(base+'chemie-current450-twenty-seven-orientation-entry-author-20261018-v1/AUTHOR.27-orientation-entry-requires-only.pending.json')
  for(const r of old27.records)same(afterById.get(r.goalId).requires,r.proposedWholeGoal.requires,'Reviewed27 append lost')

  const {fingerprintSemanticKindSourceGoal}=await import(pathToFileURL(abs('app/scripts/goalBookModel.ts')).href)
  const {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput,fingerprintPositiveGoalEvidenceProfile}=await import(pathToFileURL(abs('app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
  const {reviewPositiveGoalEvidenceConfig}=await import(pathToFileURL(abs('app/scripts/positiveGoalEvidenceReview.ts')).href)
  const semAfter=structuredClone(semBefore);let semRawAfter=sourceBefore[semPath].toString()
  const chemistryBefore=registryBefore.subjects.find((s:any)=>s.subject==='chemie');assert(chemistryBefore,'Chemistry subject absent')
  const oldPPaths:string[]=chemistryBefore.positiveEvidenceConfigPaths
  const outputFiles=new Map<string,Buffer|string>(),replacementByOld=new Map<string,string[]>(),pChanges:any[]=[],originalOwnerPins:any[]=[],newConfigPaths:string[]=[]
  const existingOwners=new Map<string,string>(),allOriginalPConfigs=new Map<string,any>()
  for(const p of oldPPaths){const cfg=json(p);allOriginalPConfigs.set(p,cfg);for(const id of cfg.scope.goalIds){assert(!existingOwners.has(id),'Duplicate current P owner: '+id);existingOwners.set(id,p)}}
  assert(existingOwners.size===450,'P owner universe is not450')
  for(let ordinal=0;ordinal<ids.length;ordinal++){
    const id=ids[ordinal],t=template.records.find((r:any)=>r.goalId===id),before=beforeById.get(id),after=afterById.get(id),decision=semAfter.decisions.find((r:any)=>r.goalId===id)
    same(decision,t.semanticKindDecisionBefore,'SEM before CAS mismatch: '+id)
    assert(fingerprintSemanticKindSourceGoal(before)===decision.sourceFingerprint,'Current SEM binding is stale')
    decision.sourceFingerprint=fingerprintSemanticKindSourceGoal(after);same(decision,t.semanticKindDecisionCandidate,'SEM candidate mismatch: '+id)
    semRawAfter=rawReplaceOnce(semRawAfter,JSON.stringify(t.semanticKindDecisionBefore.sourceFingerprint),JSON.stringify(decision.sourceFingerprint))
    const ownerPath=existingOwners.get(id)!;assert(ownerPath===t.positiveOwner.configPath,'Owner drift: '+id)
    const cfg=allOriginalPConfigs.get(ownerPath),reviewPath=cfg.reviewPath
    assert(reviewPath===t.positiveOwner.reviewPath,'P record path drift')
    assert((cfg.reviewRunManifestPaths??[]).length===0,'Unexpected run manifests require an explicit new transport audit')
    const oldLines=readFileSync(abs(reviewPath),'utf8').match(/[^\n]*\n|[^\n]+$/g)??[]
    const parsed=oldLines.filter((s:string)=>s.trim()).map((line:string)=>({line,record:JSON.parse(line)}))
    same(parsed.map((r:any)=>r.record.goalId),cfg.scope.goalIds,'Existing P record/scope order drift')
    const hit=parsed.filter((r:any)=>r.record.goalId===id);assert(hit.length===1,'Missing unique old record')
    const {line,record}=hit[0];assert(parsed.indexOf(hit[0])+1===t.positiveOwner.line,'P line mismatch')
    assert(compactSha(record)===t.positiveOwner.wholeRecordSHA256,'P whole record CAS mismatch')
    const kind=decision.semanticKind,resources=resourceDigests(before,cfg)
    assert(record.reviewCriteriaFingerprint==='sha256:'+sha(readFileSync(abs(cfg.reviewCriteriaPath))),'Criteria drift')
    assert(record.goalFingerprint===fingerprintGoalForPositiveEvidence(before,kind),'P goal before stale')
    assert(record.goalFingerprint===fingerprintGoalForPositiveEvidence(after,kind),'P goal FP changed')
    assert(record.goalFingerprint===t.PGoalFingerprintUnchanged,'P goal template mismatch')
    assert(record.profileFingerprint===fingerprintPositiveGoalEvidenceProfile(record.profile),'P profile FP invalid')
    assert(record.profileFingerprint===t.PProfileFingerprintUnchanged,'P profile template mismatch')
    assert(record.reviewInputFingerprint===fingerprintPositiveGoalEvidenceReviewInput(before,record.reviewCriteriaFingerprint,resources,kind),'P input before stale')
    assert(record.reviewInputFingerprint===t.PReviewInputFingerprintBefore,'P input before template mismatch')
    const next=structuredClone(record);next.reviewInputFingerprint=fingerprintPositiveGoalEvidenceReviewInput(after,record.reviewCriteriaFingerprint,resources,kind)
    assert(next.reviewInputFingerprint===t.PReviewInputFingerprintCandidate,'P input candidate template mismatch')
    const reset=structuredClone(next);reset.reviewInputFingerprint=record.reviewInputFingerprint;same(reset,record,'P fields other than input fingerprint changed')
    const label='P'+String(ordinal+1).padStart(2,'0'),transportReview=out+'/P/records/'+label+'.context-only.review.jsonl',residualReview=out+'/P/records/'+label+'.residual.exact.review.jsonl'
    const changedLine=rawReplaceOnce(line,JSON.stringify(record.reviewInputFingerprint),JSON.stringify(next.reviewInputFingerprint))
    same(JSON.parse(changedLine),next,'Raw transported P mismatch')
    const residualLines=parsed.filter((r:any)=>r.record.goalId!==id),transportConfig=structuredClone(cfg),residualConfig=structuredClone(cfg)
    transportConfig.reviewPath=transportReview;transportConfig.scope.goalIds=[id]
    residualConfig.reviewPath=residualReview;residualConfig.scope.goalIds=cfg.scope.goalIds.filter((g:string)=>g!==id)
    assert(residualConfig.scope.goalIds.length>0,'Unexpected empty residual')
    const transportConfigPath=out+'/P/config/'+label+'.context-only.config.json',residualConfigPath=out+'/P/config/'+label+'.residual.exact.config.json'
    outputFiles.set(transportReview,changedLine);outputFiles.set(residualReview,residualLines.map((r:any)=>r.line).join(''))
    outputFiles.set(transportConfigPath,JSON.stringify(transportConfig,null,2)+'\n');outputFiles.set(residualConfigPath,JSON.stringify(residualConfig,null,2)+'\n')
    assert(!replacementByOld.has(ownerPath),'Shared original owner requires a grouped split')
    replacementByOld.set(ownerPath,[transportConfigPath,residualConfigPath]);newConfigPaths.push(transportConfigPath,residualConfigPath)
    originalOwnerPins.push(pin(ownerPath),pin(reviewPath))
    pChanges.push({goalId:id,oldConfig:pin(ownerPath),oldReview:pin(reviewPath),oldRecordCompactSha256:compactSha(record),oldReviewInputFingerprint:record.reviewInputFingerprint,newReviewInputFingerprint:next.reviewInputFingerprint,goalFingerprintUnchanged:next.goalFingerprint,profileFingerprintUnchanged:next.profileFingerprint,onlyChangedRecordField:'reviewInputFingerprint',oldReviewIdPreserved:next.reviewId,oldReviewerStatusReasonDissentAuthorityScopeProvenancePreserved:true,newConfigPaths:[transportConfigPath,residualConfigPath],residualRecordCount:residualLines.length})
  }
  same(JSON.parse(semRawAfter),semAfter,'SEM raw fingerprint-only patch mismatch')
  const resetSem=structuredClone(semAfter);for(const t of template.records)resetSem.decisions.find((r:any)=>r.goalId===t.goalId).sourceFingerprint=t.semanticKindDecisionBefore.sourceFingerprint;same(resetSem,semBefore,'Non-fingerprint SEM mutation')
  const registryAfter=structuredClone(registryBefore),chemistryAfter=registryAfter.subjects.find((s:any)=>s.subject==='chemie')
  chemistryAfter.positiveEvidenceConfigPaths=oldPPaths.flatMap(p=>replacementByOld.get(p)??[p])
  const resetRegistry=structuredClone(registryAfter);resetRegistry.subjects.find((s:any)=>s.subject==='chemie').positiveEvidenceConfigPaths=oldPPaths;same(resetRegistry,registryBefore,'Registry field outside PconfigPaths changed')
  let registryRawAfter=sourceBefore[registryPath].toString()
  for(const [oldPath,newPaths] of replacementByOld){const needle=JSON.stringify(oldPath),index=registryRawAfter.indexOf(needle);const indent=registryRawAfter.slice(registryRawAfter.lastIndexOf('\n',index)+1,index);assert(/^ *$/.test(indent),'Unexpected registry list layout');registryRawAfter=rawReplaceOnce(registryRawAfter,needle,newPaths.map(p=>JSON.stringify(p)).join(',\n'+indent))}
  same(JSON.parse(registryRawAfter),registryAfter,'Registry raw P-only patch mismatch')
  const selectedAfter=new Map<string,string>()
  for(const p of chemistryAfter.positiveEvidenceConfigPaths){const cfg=outputFiles.has(p)?JSON.parse(String(outputFiles.get(p))):allOriginalPConfigs.get(p);for(const id of cfg.scope.goalIds){assert(!selectedAfter.has(id),'Duplicate projected P owner: '+id);selectedAfter.set(id,p)}}
  same([...selectedAfter.keys()].sort(),[...existingOwners.keys()].sort(),'P goal universe changed');assert(selectedAfter.size===450,'Not exactly450 P owners')

  // All computation above is read-only. New immutable artifacts and staging precede normal writes.
  const inputPins=[pin(candidatePath),pin(firstSealPath),pin(templatePath),pin(secondSealPath),...Object.keys(expected).map(pin),...originalOwnerPins,...cInputPins]
  const protectedD=[...new Set<string>(template.records.map((r:any)=>r.oldNativeOwnerIndex))].map(pin)
  const protectedOtherSubjects=registryBefore.subjects.filter((s:any)=>s.subject!=='chemie').flatMap((s:any)=>[s.landscapePath,s.semanticKindLedgerPath,s.visualizationQaPath].filter(Boolean)).map(pin)
  const protectedFunctions=['app/scripts/generateCurriculumQualityStatus.ts','app/scripts/goalBookModel.ts','app/scripts/goalEvidenceProfileModel.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/positiveGoalEvidenceReview.ts','contracts/curriculum-package/v1/profiles/semantic-normal-form-v1.profile.json'].map(pin)
  for(const p of inputPins)assertPin(p)
  writeNew(out+'/BEFORE.canonical.exact.json.snapshot',sourceBefore[canonicalPath]);writeNew(out+'/BEFORE.semantic-kinds.exact.json.snapshot',sourceBefore[semPath]);writeNew(out+'/BEFORE.registry.exact.json.snapshot',sourceBefore[registryPath])
  writeNew(out+'/integration-writer.mts',readFileSync(process.argv[1]))
  writeJson(out+'/CAS.three-whole-goals.and-measured-production-bindings.json',{author,template,inputPins,newReviewVote:false})
  for(const [p,v] of outputFiles)writeNew(p,v)
  const stageCanonical=out+'/preflight/canonical.candidate.json',stageSem=out+'/preflight/semantic-kinds.candidate.json';writeNew(stageCanonical,canonicalRawAfter);writeNew(stageSem,semRawAfter)
  const stageConfigPaths=[]
  for(const p of newConfigPaths){const cfg=JSON.parse(String(outputFiles.get(p)));cfg.landscapePath=stageCanonical;cfg.semanticKindLedgerPath=stageSem;const stage=out+'/preflight/'+p.split('/').at(-1);writeJson(stage,cfg);stageConfigPaths.push(stage)}
  const stagedChecks=stageConfigPaths.map(p=>{const result=reviewPositiveGoalEvidenceConfig(p);assert(result.errors.length===0,'Stock staged P check failed: '+p+' '+result.errors.join(';'));return {configPath:p,configuredGoals:result.config.scope.goalIds.length,errors:result.errors,counts:result.counts}})
  writeJson(out+'/CHECK.prewrite-original-P-and-routes.json',{mode:'NO_NORMAL_WRITE_YET',beforeRoute,candidateRoute,stagedChecks,all737CompleteEffectiveRequiresUnchanged:true,closureBefore:sha(JSON.stringify(closureVectorBefore)),closureAfter:sha(JSON.stringify(closureVectorAfter)),changedGoals:3,contextFingerprints:3,oldPBytesAndReviewFieldsPreserved:true,protectedD,protectedOtherSubjects,protectedFunctions,newReviewVote:false})
  for(const p of inputPins)assertPin(p)
  const normalAfter:Record<string,string>={[canonicalPath]:canonicalRawAfter,[semPath]:semRawAfter,[registryPath]:registryRawAfter}
  let normalTouched=false
  try {
    normalTouched=true
    for(const p of [canonicalPath,semPath,registryPath])writeFileSync(abs(p),normalAfter[p])
    const actual=json(canonicalPath);same(actual,canonicalAfter,'Actual canonical differs');same(json(semPath),semAfter,'Actual SEM differs');same(json(registryPath),registryAfter,'Actual registry differs')
    const actualRoute=stock.evaluateRouteProfile(actual,profile,{reports:[]});same(actualRoute,candidateRoute,'Actual CQR routes differ from checked candidate')
    const actualEffective=stock.buildEffectiveRequiresEdges(actual);for(const g of canonicalBefore.goals)same(fullClosure(g.id,actualEffective),fullClosure(g.id,effectiveBefore),'Actual full closure differs')
    const pChecks=newConfigPaths.map(p=>{const result=reviewPositiveGoalEvidenceConfig(p);assert(result.errors.length===0,'Stock actual P check failed: '+p+' '+result.errors.join(';'));return {configPath:p,configuredGoals:result.config.scope.goalIds.length,errors:result.errors,counts:result.counts}})
    for(const p of [...originalOwnerPins,...protectedD,...protectedOtherSubjects,...protectedFunctions])assertPin(p)
    const dDrift=template.records.map((t:any)=>({goalId:t.goalId,oldNativeClassification:t.oldNativeClassification,oldNativeOwnerIndex:t.oldNativeOwnerIndex,canonicalRequiresBefore:beforeById.get(t.goalId).requires,canonicalRequiresAfter:afterById.get(t.goalId).requires,currentDReadiness:'pending_current_context_review',wasPreviouslyRetained:t.oldNativeClassification!=='already-in-frozen279',oldOwnerBytesUnchanged:true,newNativeVote:false}))
    assert(dDrift.filter((d:any)=>d.wasPreviouslyRetained).length===2,'Expected precisely two retained D identities becoming pending')
    writeJson(out+'/D-CONTEXT-DRIFT.exact-three.NO-REBIND.json',{role:'PENDING_CONTEXT_DRIFT_NOT_NATIVE_REVIEW_OR_WITHDRAWAL',goals:dDrift,previouslyRetainedNowPending:2,alreadyInFrozen279:1,old279FirstPassCutRemainsHistorical:true,noDRebind:true,noDRegistryChange:true,noNewScienceVotes:true})
    writeJson(out+'/RECEIPT.actual-three-orientation-SEM-P-checkpoint-integration.json',{role:'ROOT_APPLIED_TECHNICAL_CHECKPOINT_INTEGRATION_NOT_SCIENTIFIC_APPROVAL',completedAt:new Date().toISOString(),inputs:inputPins,normalWrites:[canonicalPath,semPath,registryPath].map(pin),changedCanonicalFields:'requires only, three exact appends',changedSEMFields:'sourceFingerprint only, three production recomputations',registryChangedFieldOnly:'chemie.positiveEvidenceConfigPaths',positiveOwnerGoalCount:selectedAfter.size,oldOwnerConfigsAndRecordsImmutable:true,pChanges,pChecks,beforeRoute,actualRoute,all737CompleteEffectiveRequiresUnchanged:true,old27ReviewedAppendsPreserved:true,DContextDrift:3,previouslyRetainedDNowPending:2,newDRebinds:0,newScientificVotes:0,M7Claim:false,M6Claim:'pending root full status and protected-floor checks',humanApproval:false,actualLearnerPerformance:false,frozen279Historical:true})
    // Stage-only candidate graphs are unnecessary once the actual native P checks have passed.
    for(const p of [...stageConfigPaths,stageCanonical,stageSem])unlinkSync(abs(p))
    const artifacts=[out+'/integration-writer.mts',out+'/CAS.three-whole-goals.and-measured-production-bindings.json',out+'/CHECK.prewrite-original-P-and-routes.json',out+'/D-CONTEXT-DRIFT.exact-three.NO-REBIND.json',out+'/RECEIPT.actual-three-orientation-SEM-P-checkpoint-integration.json',...outputFiles.keys(),out+'/BEFORE.canonical.exact.json.snapshot',out+'/BEFORE.semantic-kinds.exact.json.snapshot',out+'/BEFORE.registry.exact.json.snapshot'].map(pin)
    writeJson(out+'/SEAL.actual-three-orientation-SEM-P-checkpoint-integration.json',{role:'TECHNICAL_INTEGRATION_NOT_SCIENTIFIC_REVIEW',sealedAt:new Date().toISOString(),files:artifacts,normalOutputs:[canonicalPath,semPath,registryPath].map(pin),originalOwnersAndDProtected:true,newReviewVote:false})
    console.log(JSON.stringify({out,normalFields:'3 requires +3 SEMsourceFP +PconfigPaths only',PContextsTransported:3,newNativeVotes:0,DContextsPending:3,previouslyRetainedNowPending:2,routeEffectiveMotivation:0,routeDirectMotivation:0,routeTerminal:0,M7:false}))
  } catch(error) {
    if(normalTouched)for(const p of [canonicalPath,semPath,registryPath])writeFileSync(abs(p),sourceBefore[p])
    writeJson(out+'/FAILED.rolled-back-normal-inputs.json',{failedAt:new Date().toISOString(),normalRollbackCompleted:true,error:error instanceof Error?error.message:String(error),newReviewVote:false})
    throw error
  }
}
await main()
