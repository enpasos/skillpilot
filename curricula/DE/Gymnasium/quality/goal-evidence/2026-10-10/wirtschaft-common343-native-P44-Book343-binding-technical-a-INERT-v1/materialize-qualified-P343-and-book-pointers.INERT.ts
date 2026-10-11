import {readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs'
import {resolve,dirname,relative,isAbsolute} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import {
 fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput,
 fingerprintPositiveGoalEvidenceProfile,validatePositiveGoalEvidenceRecordSemantics,
 POSITIVE_GOAL_EVIDENCE_SCHEMA_URL,POSITIVE_GOAL_EVIDENCE_SCHEMA_VERSION,
 POSITIVE_GOAL_EVIDENCE_GOAL_FINGERPRINT_RULE_VERSION,POSITIVE_GOAL_EVIDENCE_PROFILE_RULE_VERSION,
} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
import {reviewPositiveGoalEvidenceConfig} from '../../../../../../../app/scripts/positiveGoalEvidenceReview'
import {loadGoalBookBuildInputs,parseAndValidateGoalBookModel} from '../../../../../../../app/scripts/goalBookModel'

// Technical composition only. Qualified supplied profile bodies are immutable.
// No canonical, semantic-kind, A/M, source, registry, live config, or image writes.
const out=dirname(fileURLToPath(import.meta.url)),root=resolve(out,'../../../../../../..')
const q='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/'
const common=q+'wirtschaft-common343-M6-fieldwise-composition-AUTHOR-INERT-v1/'
const relativeOut=relative(root,out),startedAt=new Date().toISOString()
async function main(){
const semanticArg=process.argv.find(x=>x.startsWith('--semantic='))?.slice('--semantic='.length)
if(!semanticArg)throw new Error('Provide the actual stable --semantic=<repository-relative SEM689 path>')
const corePath=common+'candidate-core/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
const digest=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const inputs=new Map<string,{path:string,sha256:string,bytes:number}>()
function bytes(p:string){const abs=isAbsolute(p)?p:resolve(root,p),b=readFileSync(abs);if(!inputs.has(p))inputs.set(p,{path:p,sha256:digest(b),bytes:b.length});return b}
function json(p:string){return JSON.parse(bytes(p).toString('utf8'))}
function text(p:string){return bytes(p).toString('utf8')}
function write(name:string,value:any){const p=resolve(out,name);if(relative(out,p).startsWith('..'))throw new Error('Write outside own INERT directory');mkdirSync(dirname(p),{recursive:true});writeFileSync(p,typeof value==='string'?value:JSON.stringify(value,null,2)+'\n');if(p.endsWith('.json'))JSON.parse(readFileSync(p,'utf8'))}
const nativeCodePaths=['app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/goalEvidenceProfileModel.ts','app/scripts/positiveGoalEvidenceReview.ts','app/scripts/goalBookModel.ts','app/scripts/goalBookEvidenceReviewLoader.ts','app/src/utils/authoring/canonicalAuthoring.ts','app/src/utils/authoring/compositionViewAuthoring.ts','app/src/utils/goalBookChapterProjection.ts','app/src/utils/goalVisualizationQaStatus.ts','contracts/goal-evidence/v2/goal-evidence-profile.schema.json','contracts/goal-evidence/v2/goal-evidence-review-config.schema.json','contracts/goal-book/v1/goal-book-model-1.1.schema.json','contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json','contracts/curriculum-package/v1/profiles/semantic-normal-form-v1.profile.json']
nativeCodePaths.forEach(p=>bytes(p))
const stable=(v:any)=>JSON.stringify(v)
const rows=(p:string)=>text(p).split(/\r?\n/).filter(l=>l.trim()).map(raw=>({raw,record:JSON.parse(raw)}))
const currentRegPath='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
const reg=json(currentRegPath),subject=reg.subjects.find((s:any)=>s.subject==='wirtschaftswissenschaften')
bytes(subject.landscapePath);bytes('app/scripts/config/curriculum-maturity-floor-policy.json')
const core=json(corePath),sem=json(semanticArg),goals=new Map(core.goals.map((g:any)=>[g.id,g]))
if(core.goals.length!==689||sem.sourceLandscapeId!==core.landscapeId)throw new Error('Expected common whole689 and matching native SEM identity')
const kinds=new Map(sem.decisions.filter((d:any)=>d.decisionStatus==='authoritative').map((d:any)=>[d.goalId,d.semanticKind]))
const ordinary=sem.decisions.filter((d:any)=>d.decisionStatus==='authoritative'&&d.semanticKind==='curricularAtomic').map((d:any)=>d.goalId)
if(ordinary.length!==343)throw new Error('Expected exactly343 authoritative curricularAtomic decisions')
const sourceKinds:any[]=[]
type Source={profile:any,metadata:any,path:string,kind:string}
const overrides=new Map<string,Source>()
function recordSource(p:string,filter?:(id:string)=>boolean){for(const {record} of rows(p)){if(!filter||filter(record.goalId)){overrides.set(record.goalId,{profile:record.profile,metadata:record,path:p,kind:'qualified existing whole native record body'});sourceKinds.push({goalId:record.goalId,path:p})}}}
function specSource(p:string){const set=json(p);for(const g of set.goals){overrides.set(g.goalId,{profile:g.profile,metadata:{...g,reviewer:set.reviewer,reviewedAt:set.reviewedAt},path:p,kind:'qualified whole unbound author-spec body'});sourceKinds.push({goalId:g.goalId,path:p})}}
recordSource(common+'positive-inputs/A3.pre-common-bindings.INERT.jsonl')
specSource(common+'positive-inputs/market3.unbound-spec.INERT.json')
recordSource(common+'positive-inputs/DD2.pre-common-bindings.INERT.jsonl')
recordSource(common+'positive-inputs/EU3.pre-common-bindings.INERT.jsonl')
recordSource(common+'positive-inputs/budget1.grammar-addendum.pre-common-bindings.INERT.jsonl')
specSource(common+'positive-inputs/BB4.unbound-spec.INERT.json')
const editorial=q+'wirtschaft-final56-five-whole-P-qualified-native-binding-INERT-root-v22/'
const editorIds=new Set(['eee7217a','099086bb','6d4a38df','0d8cb18d','fab48742'])
for(const n of ['20','24','30','33'])recordSource(editorial+'positive/'+n+'.five-qualified-whole-profiles.current-native-INERT.jsonl',id=>editorIds.has(id.slice(0,8)))
// Qualification evidence is carried, not newly scientifically reviewed here.
const qualifications=[
 q+'wirtschaft-625-three-environment-types-card-independent-a-closure-INERT-v1/actual-independent625-targeted-card-closure.SEALED.receipt.json',
 q+'wirtschaft-BB-four-whole-goals-eight-cases-local-practice-independent-a-M6-review-INERT-v1/actual-independent-BB4-goals-eight-cases-48BE-source-choice-A4M4.SEALED.receipt.json',
 q+'wirtschaft-BB8820-price-interval-direction-only-independent-a-closure-INERT-v1/actual-independent-two-language-price-interval-closure.SEALED.receipt.json',
 editorial+'actual-five-qualified-P-four-native-current-bindings-INERT.receipt.json',
]
qualifications.forEach(p=>bytes(p))
const oldConfigs=subject.positiveEvidenceConfigPaths.map((p:string,i:number)=>({path:p,number:i+1,config:json(p)}))
if(oldConfigs.length!==43)throw new Error('Expected current43 P configs')
const oldById=new Map<string,{config:any,row:any,configNumber:number}>()
for(const item of oldConfigs){for(const row of rows(item.config.reviewPath)){if(oldById.has(row.record.goalId))throw new Error('Duplicate current P goal');oldById.set(row.record.goalId,{config:item.config,row,configNumber:item.number})}}
if(oldById.size!==336)throw new Error('Expected exact current P336')
const novel=ordinary.filter((id:string)=>!oldById.has(id))
if(novel.length!==7||novel.some((id:string)=>!overrides.has(id)))throw new Error('Expected seven supplied new P bodies')
const marketParent=oldById.get('1826fe19-4d06-5183-9b41-9121ae1cc219')!.configNumber
const euParent=oldById.get('648224f4-cc8f-5f41-9cae-6d783cd1ae77')!.configNumber
const newMarket=['a2fa1186-df35-5954-a9a9-e311a55e218f','df17fd21-e9b7-598f-970e-8f541d059694']
const newEU=['5aaf5abf-5e70-57c6-b030-1d08a35d17b8']
const bb=['ec1e8644-bd6d-53ef-a154-9a6efb69e1c7','8820a8d9-605a-565b-bc13-1961a4df60ed','646c5663-bf14-5b4a-893e-be01df701d54','2dea7d3c-cbac-5246-b0b1-6463c8e6dad6']
const cfg44={...oldConfigs[0].config,reviewId:'wirtschaft-common343-four-qualified-bb-positive-native-binding-20261010-v1',reviewCriteriaPath:q+'wirtschaft-BB-LK-three-market-facets-eight-cases-local-practice-AUTHOR-INERT-v1/candidate-criteria.md',reviewedResourceTypes:[],requireApproved:false,scope:{label:'Four independently content-reviewed BB LK atoms; steering deliberately selected, E1/G1 AI candidates pending human review',goalIds:bb}}
const groups=[...oldConfigs,{path:null,number:44,config:cfg44}]
const allRecords:any[]=[],audits:any[]=[],configs:string[]=[],checks:any[]=[]
for(const group of groups){
 const c=structuredClone(group.config),n=String(group.number).padStart(2,'0')
 if(group.number===marketParent)c.scope.goalIds.push(...newMarket)
 if(group.number===euParent)c.scope.goalIds.push(...newEU)
 c.landscapePath=corePath;c.semanticKindLedgerPath=semanticArg;c.reviewPath=relativeOut+'/positive/'+n+'.whole-qualified-common689-native-bindings.INERT.jsonl'
 c.scope.label='Whole qualified profile bodies, exact common689 native bindings; AI E1/G1 candidates, human review pending'
 const configPath=relativeOut+'/configs/'+n+'.positive-common689-sem689-P343.INERT.config.json'
 const criteriaFingerprint=digest(bytes(c.reviewCriteriaPath)),resourceTypes=new Set(c.reviewedResourceTypes)
 const written:string[]=[]
 for(const id of c.scope.goalIds){
  const goal:any=goals.get(id),kind=kinds.get(id),old=oldById.get(id),source=overrides.get(id)
  if(!goal||kind!=='curricularAtomic')throw new Error(id+': ordinary native SEM binding missing')
  const resourceDigests:Record<string,string>={}
  if(resourceTypes.has('goal-visualization'))for(const link of goal.resourceLinks??[]){if(link.type==='goal-visualization'){if(!link.url.startsWith('/assets/goal-visualizations/'))throw new Error('Unsupported resource');resourceDigests[link.url]=digest(bytes('app/public'+link.url))}}
  const changedBody=!!source&&(!old||stable(source.profile)!==stable(old.row.record.profile))
  const metadata=changedBody?source!.metadata:old?.row.record
  if(!metadata)throw new Error(id+': qualified source metadata missing')
  const profile=changedBody?source!.profile:old!.row.record.profile
  const base:any=old?structuredClone(old.row.record):{
   $schema:POSITIVE_GOAL_EVIDENCE_SCHEMA_URL,schemaVersion:POSITIVE_GOAL_EVIDENCE_SCHEMA_VERSION,
   landscapeId:core.landscapeId,goalId:id,status:'needs_human_review',reviewAuthority:'ai_candidate',
   evidenceLevel:'E1',maximumClaimScope:'G1',reviewRunIds:[],dissent:[],
  }
  if(changedBody){for(const k of ['reason','reviewer','reviewedAt','evidenceLevel','maximumClaimScope','dissent'])if(metadata[k]!==undefined)base[k]=metadata[k];base.reviewRunIds=[]}
  base.reviewId=c.reviewId;base.goalFingerprintRuleVersion=POSITIVE_GOAL_EVIDENCE_GOAL_FINGERPRINT_RULE_VERSION
  base.profileRuleVersion=POSITIVE_GOAL_EVIDENCE_PROFILE_RULE_VERSION;base.reviewCriteriaFingerprint=criteriaFingerprint
  base.goalFingerprint=fingerprintGoalForPositiveEvidence(goal,kind as string)
  base.reviewInputFingerprint=fingerprintPositiveGoalEvidenceReviewInput(goal,criteriaFingerprint,resourceDigests,kind as string)
  base.profileFingerprint=fingerprintPositiveGoalEvidenceProfile(profile);base.profile=profile
  const errors=validatePositiveGoalEvidenceRecordSemantics(base,goal,resourceDigests,kind as string)
  if(errors.length)throw new Error(errors.join('\n'))
  if(base.status!=='needs_human_review'||base.reviewAuthority!=='ai_candidate'||base.evidenceLevel!=='E1'||base.maximumClaimScope!=='G1')throw new Error(id+': unacceptable evidence status upgrade or unexpected historical status')
  const rawExact=!!old&&stable(base)===stable(old.row.record),raw=rawExact?old!.row.raw:JSON.stringify(base)
  JSON.parse(raw);written.push(raw);allRecords.push(base)
  const expectedProfile=changedBody?source!.profile:old!.row.record.profile
  if(stable(base.profile)!==stable(expectedProfile))throw new Error(id+': whole source profile body changed')
  audits.push({goalId:id,configNumber:group.number,previousConfigNumber:old?.configNumber??null,profileBodySourcePath:changedBody?source!.path:old!.config.reviewPath,qualifiedOverrideConsidered:source?.path??null,profileBodyChangedFromCurrent:changedBody,wholeProfileBodyExactToDeclaredSource:true,applicationCaseBodiesExactToDeclaredSource:true,currentRawRecordPreservedExact:rawExact,nativeGoalFingerprintChanged:old?old.row.record.goalFingerprint!==base.goalFingerprint:true,nativeReviewInputFingerprintChanged:old?old.row.record.reviewInputFingerprint!==base.reviewInputFingerprint:true,newRecord:!old,criteriaFingerprint,resourceAssetDigests:resourceDigests})
 }
 write('positive/'+n+'.whole-qualified-common689-native-bindings.INERT.jsonl',written.join('\n')+'\n')
 write('configs/'+n+'.positive-common689-sem689-P343.INERT.config.json',c);configs.push(configPath)
 const checked=reviewPositiveGoalEvidenceConfig(configPath);checks.push({configPath,goalCount:checked.records.length,errors:checked.errors,counts:checked.counts})
 if(checked.errors.length)throw new Error(checked.errors.join('\n'))
}
if(allRecords.length!==343||new Set(allRecords.map(r=>r.goalId)).size!==343||ordinary.some((id:string)=>!allRecords.some(r=>r.goalId===id)))throw new Error('P343 exact semantic universe mismatch')
write('whole343.qualified-profile-bodies-common689-native-bindings.INERT.jsonl',allRecords.map(r=>JSON.stringify(r)).join('\n')+'\n')
write('actual-P44-native-only-checks-before-book.READONLY.json',{checkedAt:new Date().toISOString(),configCount:44,ordinaryProfiles:343,checks,allNativePConfigChecksPassed:true,bodyReuseAudit:audits,bookBuildClaim:false,semanticWholeSchemaApproval:false,activeWrites:0})
const bookSource='app/scripts/config/goal-books/de-gym-economics-current-canonical.json'
const book=json(bookSource);bytes(book.compositionViewPath);bytes(book.goalVisualizationQaPath)
book.landscapePath=corePath;book.semanticKindLedgerPath=semanticArg;book.evidenceReviewPaths=[relativeOut+'/whole343.qualified-profile-bodies-common689-native-bindings.INERT.jsonl']
book.outputPath=relativeOut+'/whole343.review-only-native-book-model.INERT.json'
write('whole-book.common689-sem689-P343.review-only.INERT.config.json',book)
const modelBuild=await loadGoalBookBuildInputs(relativeOut+'/whole-book.common689-sem689-P343.review-only.INERT.config.json')
const model:any=modelBuild.model;parseAndValidateGoalBookModel(model)
const pages=model.goals??model.pages
if(!Array.isArray(pages))throw new Error('Book page shape unavailable')
const pageIds=pages.map((p:any)=>p.goalId??p.id)
if(pageIds.length!==343||new Set(pageIds).size!==343||ordinary.some((id:string)=>!pageIds.includes(id)))throw new Error('Native whole book must contain every current343 ordinary goal exactly once')
write('whole343.review-only-native-book-model.INERT.json',model)
for(const name of readdirSync(resolve(root,common+'candidate-views')).filter(n=>n.endsWith('.view.json')))bytes(common+'candidate-views/'+name)
nativeCodePaths.forEach(p=>bytes(p))
const inputEndGuards=[...inputs.values()].map(before=>{const b=readFileSync(isAbsolute(before.path)?before.path:resolve(root,before.path));return {before,after:{path:before.path,sha256:digest(b),bytes:b.length},exact:before.sha256===digest(b)&&before.bytes===b.length}})
if(inputEndGuards.some(g=>!g.exact))throw new Error('Input changed during native binding')
write('actual-input-bindings-and-endguards.READONLY.json',{startedAt,completedAt:new Date().toISOString(),allExact:true,artifacts:inputEndGuards})
write('actual-P343-native-binding-body-reuse-and-book343.READONLY.receipt.json',{
 role:'NATIVE_TECHNICAL_MATERIALIZATION_OF_EXISTING_QUALIFIED_AI_PROFILE_BODIES',startedAt,completedAt:new Date().toISOString(),corePath,semanticKindLedgerPath:semanticArg,
 oldConfigCount:43,newConfigCount:44,previousOrdinaryP:336,currentOrdinaryP:343,newRecordCount:7,
 original43ScopeIDsPreserved:true,newMarketProfilesAppendedToConfig:marketParent,newEUProfileAppendedToConfig:euParent,BBNewConfig:44,
 configPaths:configs,combinedReviewPath:relativeOut+'/whole343.qualified-profile-bodies-common689-native-bindings.INERT.jsonl',
 nativeChecks:checks,allNativePConfigChecksPassed:true,rawCurrentRecordsPreservedExact:audits.filter(a=>a.currentRawRecordPreservedExact).length,
 qualifiedProfileBodiesChanged:audits.filter(a=>a.profileBodyChangedFromCurrent&&!a.newRecord).map(a=>a.goalId),
 newQualifiedBodies:audits.filter(a=>a.newRecord).map(a=>a.goalId),wholeBodyAndCaseReuseAudit:audits,
 book:{configPath:relativeOut+'/whole-book.common689-sem689-P343.review-only.INERT.config.json',pages:pageIds.length,goalIds:pageIds,BBAllFourIncluded:bb.every(id=>pageIds.includes(id)),publicationMode:'review',originalNavigationWholeCanonicalRootRetained:true,qaPathHistoricalExact:book.goalVisualizationQaPath,newVisualizationContentReview:false,qaOldStaleWhereGoalContractChanged:'Retained as historical AI QA, no fresh image/text fit claim, no V/D/M7 qualification.'},
 inputArtifactsExact:true,activeWrites:0,coreSemanticAMSourceWrites:0,noNewScientificReview:true,noDClaim:true,noImagesCreatedOrScientificallyReviewed:true,
 reviewAuthority:'ai_candidate',profileEvidenceLevel:'E1',profileMaximumClaimScope:'G1',allProfileStatuses:'needs_human_review',humanOrLearnerApproval:false,
 rootQualifiedContentProvenanceSources:sourceKinds,provider:'OpenAI',modelFamily:'GPT-6',runtime:'Codex',exactModelRevision:'not_exposed',samplingParameters:'not_exposed',
})
console.log(JSON.stringify({configs:44,P:343,BookPages:343,newProfiles:7,rawRecordReuse:audits.filter(a=>a.currentRawRecordPreservedExact).length,allNativePChecksPassed:true,activeWrites:0},null,2))
}
void main().catch(error=>{console.error(error);process.exitCode=1})
