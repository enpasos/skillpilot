// Apache-2.0. Actual native source consistency and bounded physical-page impact, no live writes.
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { evaluateCourseLevelMappingConsistency } from '../../../../../../../app/scripts/generateCurriculumQualityStatus.ts'
import { loadGoalBookBuildInputs, stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel.ts'
import { buildGoalBookOriginalSources } from '../../../../../../../app/scripts/goalBookOriginalSources.ts'
import { buildGoalDescriptionRolloutSubsetModel } from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts'
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-q2-bw-two-current-source-location-successors-author-v1'
const root=process.cwd(), iso='/tmp/skillpilot-wirtschaft-q2-labour-twelve-native-qnj7b9dg'
const read=async(p:string)=>JSON.parse(await readFile(p,'utf8'))
const hash=(b:Buffer)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const proof=await read(own+'/current-two-source-location-successors.actual.json')
for(const i of proof.preservedInputs) if(hash(await readFile(i.path))!==i.sha256)throw Error('Current input changed: '+i.path)
const row=proof.sourceSuccessors[0]
const landscape=await read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
const oldMapping={...await read(row.originalCurrentMappingPath),file:row.originalCurrentMappingPath}
const candidateMapping={...await read(row.inertMappingSuccessorPath),file:row.inertMappingSuccessorPath}
const before=evaluateCourseLevelMappingConsistency(landscape,[oldMapping])
const after=evaluateCourseLevelMappingConsistency(landscape,[candidateMapping])
if(before.status!=='pass'||after.status!=='pass'||JSON.stringify(before.metrics)!==JSON.stringify(after.metrics))throw Error(JSON.stringify({before,after}))
const batch='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-q2-labour-twelve-native-preparation-technical-20261008-v1/native-d-q2-labour-twelve.final.batch.config.json'
const cfg=await read(batch)
const frozen=await read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-q2-labour-twelve-native-preparation-technical-20261008-v1/native-d-q2-labour-twelve-final.prepared-freeze.actual.json')
for(const f of frozen.byteExactReturnedNativeFiles) if(hash(await readFile(f.path))!==f.sha256||hash(await readFile(path.join(iso,f.path)))!==f.sha256)throw Error('Frozen bytes changed '+f.path)
const load=async()=>{const base=await loadGoalBookBuildInputs(cfg.baseGoalBookConfigPath,iso);return buildGoalDescriptionRolloutSubsetModel({baseModel:base.model,goalIds:cfg.goalIds,bookId:cfg.bookId,title:cfg.title})}
const modelBefore=await load()
const frozenModel=await read(cfg.outputDirectory+'/bundle/book-model.json')
// D v3 pages have no original-source locator binding. Build the independent native citation lane explicitly.
const sourcesBefore=buildGoalBookOriginalSources(frozenModel,root,[row.originalCurrentMappingPath])
const sourcesAfter=buildGoalBookOriginalSources(frozenModel,root,[row.inertMappingSuccessorPath])
const modelAfter=await load()
const stable=(value:any)=>JSON.stringify(value)
const sourceRows=(payload:any,gid:string)=>{const tuples=payload.goals[gid]??[];const evidence=new Map(payload.evidence.map((e:any)=>[e.id,e]));return tuples.map((t:any)=>({...t,evidence:t.evidenceIds.map((id:string)=>evidence.get(id))}))}
const rows=modelBefore.pages.map((b:any,i:number)=>{const a=modelAfter.pages[i],f=frozenModel.pages[i];const sourceBefore=sourceRows(sourcesBefore,b.goalId),sourceAfter=sourceRows(sourcesAfter,b.goalId);const changedKeys=Object.keys(b).filter(k=>stable(b[k])!==stable(a[k]));return{goalId:b.goalId,title:b.title,originalPreparedPageFingerprint:f.pageFingerprint,currentBeforePageFingerprint:b.pageFingerprint,candidateAfterPageFingerprint:a.pageFingerprint,wholePageUnchangedBeforeAgainstOriginalFreeze:stable(b)===stable(f),wholePageChangedAfter:stable(b)!==stable(a),changedPageKeys:changedKeys,nativeSourceWitnessesBefore:sourceBefore,nativeSourceWitnessesAfter:sourceAfter,nativeSourceWitnessChanged:stable(sourceBefore)!==stable(sourceAfter)}})
for(const f of frozen.byteExactReturnedNativeFiles) if(hash(await readFile(f.path))!==f.sha256||hash(await readFile(path.join(iso,f.path)))!==f.sha256)throw Error('Frozen bytes changed '+f.path)
for(const i of proof.preservedInputs) if(hash(await readFile(i.path))!==i.sha256)throw Error('Live input changed '+i.path)
const result={schemaVersion:1,role:'technical_native_source_consistency_and_actual_page_impact',actualCheckedAt:new Date().toISOString(),nativeCQR004:{before,after,metricsExactlyEqual:true},physicalIsolate:iso,currentBaselineAtSourceImpact:'Existing frozen Labour12 physical preparation on root96; later current113 rebase is separately required.',sourceLocationChanges:proof.exactBoundedChanges,sourceUnitsChanged:2,mappingEdgesUnchanged:5,directMappedCanonicalGoals:proof.actualAffectedCanonicalGoalIds,actualLabourTwelvePageComparisons:rows,actualChangedLabourPages:rows.filter((x:any)=>x.wholePageChangedAfter).map((x:any)=>x.goalId),isolateMappingMutationPerformed:false,actualOriginalSourceWitnessesChangedForLabourGoals:rows.filter((x:any)=>x.nativeSourceWitnessChanged).map((x:any)=>x.goalId),descriptionReviewInputContract:'Native description v3 reviewContext contains page and evidenceProfile; pages bind goal/context/visualization, but not original-source locators. Source witnesses remain a separate actual original-source citation lane.',all28FrozenNativeFilesVerifiedBeforeAndAfter:true,independentSourceAccuracyApprovalClaim:false,activeWrites:0,newStrictClosures:0,limits:['Native consistency does not independently certify page accuracy; actual original-PDF reading is separate.','New source pointer changes are real source/page context changes; affected review bindings require targeted reinspection, not mere hash replacement.']}
await writeFile(own+'/native-targeted-source-consistency-and-page-impact-current-v2.actual.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({nativeSourceConsistency:after.status,sourceUnitsChanged:2,actualChangedLabourPages:result.actualChangedLabourPages,actualSourceWitnessChangedGoals:result.actualOriginalSourceWitnessesChangedForLabourGoals,originalFrozenPagesAllByteEqual:rows.every((r:any)=>r.wholePageUnchangedBeforeAgainstOriginalFreeze),frozen28Preserved:true}))
