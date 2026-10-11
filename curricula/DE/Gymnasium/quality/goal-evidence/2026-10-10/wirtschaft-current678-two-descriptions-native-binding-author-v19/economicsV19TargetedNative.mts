import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel.ts'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput, validatePositiveGoalEvidenceRecordSemantics } from './positiveGoalEvidenceProfileModel.ts'
import { reviewPositiveGoalEvidenceConfig } from './positiveGoalEvidenceReview.ts'
import { fingerprintGoal as atomicFP } from './atomicityV19NativeExports.ts'
import { fingerprintGoal as memoryFP } from './memoryV19NativeExports.ts'
const privateRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const inputPath = process.argv[2]
const input = JSON.parse(readFileSync(inputPath,'utf8'))
const out = input.outputRoot
const rj=(p:string)=>JSON.parse(readFileSync(join(privateRoot,p),'utf8'))
const sha=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const canonical=(v:any):string=>Array.isArray(v)?'['+v.map(canonical).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}':JSON.stringify(v)
const ids=new Set<string>(input.goalIds)
const before = JSON.parse(readFileSync(join(out,'before',input.activeCANPath),'utf8'))
const after = rj(input.activeCANPath)
const bg=new Map<string,any>(before.goals.map((x:any)=>[x.id,x])), ag=new Map<string,any>(after.goals.map((x:any)=>[x.id,x]))
const semOld=rj(input.oldSEMPath), sem=structuredClone(semOld)
const semDeltas:any[]=[]
for(const d of sem.decisions){assert.equal(d.sourceFingerprint,fingerprintSemanticKindSourceGoal(bg.get(d.goalId)));if(ids.has(d.goalId)){const fp=fingerprintSemanticKindSourceGoal(ag.get(d.goalId)); assert.notEqual(fp,d.sourceFingerprint);semDeltas.push({goalId:d.goalId,field:'sourceFingerprint',before:d.sourceFingerprint,after:fp});d.sourceFingerprint=fp}else assert.equal(d.sourceFingerprint,fingerprintSemanticKindSourceGoal(ag.get(d.goalId)))}
assert.equal(semDeltas.length,2)
const resources=(g:any)=>Object.fromEntries((g.resourceLinks??[]).filter((l:any)=>l.type==='goal-visualization').map((l:any)=>[l.url,sha(readFileSync(join(privateRoot,'app/public',l.url.slice(1))))]))
const oldAggregateText=readFileSync(join(privateRoot,input.oldAggregatePath),'utf8')
const originalRows=oldAggregateText.trim().split(/\r?\n/).map(x=>JSON.parse(x))
const originals=new Map<string,any>(originalRows.map((r:any)=>[r.goalId,r]))
const pDeltas:any[]=[], changedP=new Map<string,any>()
for(const gid of ids){const old=originals.get(gid); assert(old);const oldErrors=validatePositiveGoalEvidenceRecordSemantics(old,bg.get(gid),resources(bg.get(gid)),'curricularAtomic');assert.deepEqual(oldErrors,[]);const nr=structuredClone(old);nr.goalFingerprint=fingerprintGoalForPositiveEvidence(ag.get(gid),'curricularAtomic');nr.reviewInputFingerprint=fingerprintPositiveGoalEvidenceReviewInput(ag.get(gid),old.reviewCriteriaFingerprint,resources(ag.get(gid)),'curricularAtomic');assert.notEqual(nr.goalFingerprint,old.goalFingerprint);assert.notEqual(nr.reviewInputFingerprint,old.reviewInputFingerprint);assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(nr,ag.get(gid),resources(ag.get(gid)),'curricularAtomic'),[]);const without=structuredClone(nr);without.goalFingerprint=old.goalFingerprint;without.reviewInputFingerprint=old.reviewInputFingerprint;assert.deepEqual(without,old); assert.equal(nr.status,'needs_human_review');assert.equal(nr.reviewAuthority,'ai_candidate');changedP.set(gid,nr);pDeltas.push({goalId:gid,wholeOld:old,wholeAfter:nr,profileExact:true,casesExact:true,statusAuthorityMetaExact:true,changedFields:['goalFingerprint','reviewInputFingerprint'],oldRecordWithNewGoalNativeErrors:validatePositiveGoalEvidenceRecordSemantics(old,ag.get(gid),resources(ag.get(gid)),'curricularAtomic')})}
const patchJSONL=(old:string,kind:string)=>old.split(/(?<=\n)/).map(line=>{if(!line.trim())return line;const r=JSON.parse(line);if(!ids.has(r.goalId))return line; if(kind==='P'){let n=line;for(const k of ['goalFingerprint','reviewInputFingerprint']) {assert(n.includes(JSON.stringify(r[k])));n=n.replace(JSON.stringify(r[k]),JSON.stringify(changedP.get(r.goalId)[k]))}assert.deepEqual(JSON.parse(n),changedP.get(r.goalId));return n}const fp=kind==='A'?atomicFP(ag.get(r.goalId),r.ruleVersion):memoryFP(ag.get(r.goalId),r.ruleVersion);assert.equal(r.fingerprint,kind==='A'?atomicFP(bg.get(r.goalId),r.ruleVersion):memoryFP(bg.get(r.goalId),r.ruleVersion));assert.notEqual(fp,r.fingerprint);return line.replace(JSON.stringify(r.fingerprint),JSON.stringify(fp))}).join('')
const newAggregateText=patchJSONL(oldAggregateText,'P')
const aggregate=newAggregateText.trim().split(/\r?\n/).map(x=>JSON.parse(x))
assert.equal(aggregate.length,336); assert.equal(aggregate.reduce((n,r)=>n+r.profile.applicationCaseBriefs.length,0),685)
for(const r of aggregate){const old=originals.get(r.goalId);const cmp={...r,goalFingerprint:old.goalFingerprint,reviewInputFingerprint:old.reviewInputFingerprint};assert.deepEqual(cmp,old);if(!ids.has(r.goalId))assert.deepEqual(r,old)}
const am:any[]=[]
const atomicOld=readFileSync(join(privateRoot,input.oldAtomicityReview),'utf8'),memoryOld=readFileSync(join(privateRoot,input.oldMemoryReview),'utf8')
const atomicAfter=patchJSONL(atomicOld,'A'),memoryAfter=patchJSONL(memoryOld,'M')
for(const [lane,oldtxt,newtxt] of [['A',atomicOld,atomicAfter],['M',memoryOld,memoryAfter]]){const o=oldtxt.trim().split(/\r?\n/).map(x=>JSON.parse(x)),n=newtxt.trim().split(/\r?\n/).map(x=>JSON.parse(x));assert.equal(o.length,336);assert.equal(n.length,336);for(let i=0;i<n.length;i++){assert.deepEqual({...n[i],fingerprint:o[i].fingerprint},o[i]);if(ids.has(n[i].goalId))am.push({lane,goalId:n[i].goalId,field:'fingerprint',before:o[i].fingerprint,after:n[i].fingerprint,statusExact:true,reasonReviewerDateExact:true,wholeBefore:o[i],wholeAfter:n[i]});else assert.deepEqual(n[i],o[i])}}
assert.equal(am.length,4)
const qaOld=rj(input.oldQAPath),qa=structuredClone(qaOld),qd:any[]=[]
for(const r of qa.records){if(ids.has(r.goalId)){const old=structuredClone(r);assert.equal(r.description,bg.get(r.goalId).description);r.description=ag.get(r.goalId).description;assert.deepEqual({...r,description:old.description},old);assert.equal(r.assetSha256,sha(readFileSync(join(privateRoot,r.publicAssetPath))));assert.equal(r.assetSha256,sha(readFileSync(join(privateRoot,r.canonicalAssetPath))));qd.push({goalId:r.goalId,field:'description',before:old.description,after:r.description,oldWholeRecord:old,tentativeAfterWholeRecord:r,actualGoalFingerprintFieldPresent:false,allImageAndApprovalFieldsExact:true,newVisualizationSemanticApproval:false})}}
assert.equal(qd.length,2);assert.equal(qa.records.length,336)
const schemas=new Ajv2020({strict:true,allErrors:true});addFormats(schemas);schemas.addKeyword({keyword:'x-skillpilot-listSemantics',schemaType:['string','object'],valid:true});const vs=schemas.compile(rj('contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json'));assert(vs(sem),JSON.stringify(vs.errors))
const write=(p:string,data:any,raw=false)=>{for(const root of [privateRoot,input.repoRoot]){const q=join(root,p); assert(q.startsWith(join(root,input.outputRelative)+'/'),'Own output boundary');mkdirSync(dirname(q),{recursive:true});writeFileSync(q,raw?data:JSON.stringify(data,null,2)+'\n')}}
write(input.newSEMPath,sem)
write(input.newAggregatePath,newAggregateText,true)
write(input.newAtomicityReview,atomicAfter,true);write(input.newMemoryReview,memoryAfter,true)
write(input.newTentativeQAPath,qa)
for(const item of input.configs.filter((x:any)=>x.affected)){const original=readFileSync(join(privateRoot,item.config.reviewPath),'utf8');write(item.newReviewPath,patchJSONL(original,'P'),true)}
const results=[]
for(const item of input.configs.filter((x:any)=>x.affected)){const r=reviewPositiveGoalEvidenceConfig(item.newConfigPath);assert.deepEqual(r.errors,[]);results.push({path:item.newConfigPath,wholeRecords:r.records.length,cases:r.records.reduce((n,x)=>n+x.profile.applicationCaseBriefs.length,0),counts:r.counts,nativeErrors:r.errors})}
const negatives=pDeltas.map(d=>({goalId:d.goalId,kind:'Retain original P fingerprints on changed descriptions',nativeErrors:d.oldRecordWithNewGoalNativeErrors,detected:d.oldRecordWithNewGoalNativeErrors.length===2}));assert(negatives.every(x=>x.detected))
const sourceMap=rj(input.BEMapPath),union=rj(input.BEUnionPath),sourceTuples:any[]=[]
for(const row of union.rows){for(const member of row.wholeCurrentGoalPCaseUnion){if(!ids.has(member.goalId))continue;assert.equal(member.goalId,'5b5ed3cb-7c2c-5b0f-a515-c967d8d23644');assert.deepEqual(member.wholeCurrentCanonicalGoal,bg.get(member.goalId));assert.deepEqual(member.wholeCurrentPositiveRecord,originals.get(member.goalId));assert.equal(member.wholeCurrentCanonicalGoalSHA256,sha(canonical(member.wholeCurrentCanonicalGoal)).slice(7));const next=structuredClone(member);next.wholeCurrentCanonicalGoal=ag.get(member.goalId);next.wholeCurrentCanonicalGoalSHA256=sha(canonical(next.wholeCurrentCanonicalGoal)).slice(7);next.wholeCurrentPositiveRecord=changedP.get(member.goalId);assert.deepEqual(next.actualCaseIds,member.actualCaseIds);assert.equal(next.wholeProfileSHA256,member.wholeProfileSHA256);sourceTuples.push({sourceAspectId:row.sourceAspectId,goalId:member.goalId,sourceRowExact:row.wholeCurrentSourceRow,wholeMappingEdges:sourceMap.mappings.filter((x:any)=>x.legacyGoalId===row.sourceAspectId),wholeDecision:sourceMap.decisions.find((x:any)=>x.sourceGoalId===row.sourceAspectId),wholeBeforeMember:member,tentativeTechnicalAfterMember:next,requiredCurrentTupleFields:['wholeCurrentCanonicalGoal.description','wholeCurrentCanonicalGoal.descriptionEn','wholeCurrentCanonicalGoalSHA256','wholeCurrentPositiveRecord.goalFingerprint','wholeCurrentPositiveRecord.reviewInputFingerprint'],wholeSourceRowAndSourceReviewAndMappingStrengthUnchanged:true,sourceScienceOrExactUpgrade:false,activeMapWrite:false})}}
assert.equal(sourceTuples.length,1)
const sourceOther=input.sourceBindings.sourceRowsAndDecisions.filter((r:any)=>r.goalId===input.goalIds[0]).map((r:any)=>({goalId:r.goalId,mappingPath:r.mappingPath,sourceExtractionPath:r.sourceExtractionPath,wholeMappingEdges:r.wholeSelectedMappings,wholeDecisions:r.wholeSelectedDecisions,wholeSourceRows:r.wholeSelectedSourceRows,embeddedCanonicalPayloadOrFingerprintInMapping:false,nativeTargetTupleChanged:false,existingStrengthsExactlyRetained:r.wholeSelectedMappings.map((x:any)=>x.matchType),wholeCourseOrSourceScienceClaimed:false}))
const report={role:'INERT_NATIVE_BINDING_ONLY_AUTHOR_NOT_NEW_SCIENCE',actualPrivateRoot:privateRoot,descriptionBefore:'6bfa382a2b174a1645d883f746ef42c0693813ec2d447561fca3290ca98a0b09',descriptionCandidate:input.candidateCAN,actualSEM678ClosedSchemaErrors:0,actualSEMChangedRows:semDeltas,actualPChangedRecords:pDeltas,actualTargetedConfigResults:results,actualPOriginal336Profiles685CasesExact:true,actualOther334RawJSONLLinesByteExact:true,actualAtomAndMemoryOnlyFourFingerprints:am,actualOther334ALinesAnd334MLinesByteExact:true,actual336QAOnlyTwoDescriptionsTENTATIVE:qd,visualizationFreshSemanticKEEP:'PENDING_ROOT_ACTUAL_SIGHT_AFTER_M6',allExistingVApprovalFieldsExact:true,newAIApproval:0,actualBECurrent125TupleObligations:sourceTuples,actualHE_NI_NW048MappingBindings:sourceOther,sourceMappingsChanged:0,sourceStrengthsUpgraded:0,actualNativeNegatives:negatives,newDOrOwnerOrBookOrImageChanges:0,independentScientificApprovalClaimed:false,strictGain:0,activeWrites:0}
write(input.outputRelative+'/actual-native-targeted-two-P-groups-SEM678-AM336-and-tentativeV-bindings.AUTHOR.json',report)
write(input.outputRelative+'/actual-one-BE5b-source125-tuple-and-HE-NI-NW048-no-embedded-FP-obligations.READONLY.json',{role:'READONLY_TECHNICAL_OBLIGATIONS_NOT_SOURCE_REVIEW',BE:sourceTuples,HE_NI_NW:sourceOther,newSourceScience:false,partial208Retained:true,noActiveSourceMapWrites:true})
console.log(JSON.stringify({targetedPGroups:results.map(r=>r.path.split('/').pop()),actualP:336,cases:685,SEM:678,sourceFPDeltas:2,PgoalAndInputFPDeltas:4,AFP:2,MFP:2,tentativeVdescriptionFields:2,BEsourceTupleObligations:1,nativeTargetedErrors:0,negativeCases:2,activeWrites:0,newScience:0}))
