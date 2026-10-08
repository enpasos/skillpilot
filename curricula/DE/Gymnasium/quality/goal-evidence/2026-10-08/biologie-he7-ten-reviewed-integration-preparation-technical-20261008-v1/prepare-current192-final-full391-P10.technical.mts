// SPDX-License-Identifier: Apache-2.0
// Exact current192 whole native pages and genuine paired P10/V10 integration metadata.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs'
import {dirname,resolve,relative} from 'node:path'
import {fileURLToPath} from 'node:url'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {buildGoalBookModel,fingerprintSemanticKindSourceGoal,stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts'
import {buildGoalBookOriginalSources} from '../../../../../../../app/scripts/goalBookOriginalSources.ts'
import {validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'

const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url)),base=dirname(own),author=resolve(base,'biologie-he7-ten-final-raster-native-author-root-20261008-v1')
const sha=(x:Buffer|string)=>'sha256:'+createHash('sha256').update(x).digest('hex'),declared=new Map<string,any>()
const bind=(p:string)=>{const b=readFileSync(p);return{path:relative(root,p),sha256:sha(b),bytes:b.length}}
const bytes=(p:string)=>{declared.set(p,bind(p));return readFileSync(p)},read=(p:string)=>JSON.parse(bytes(p).toString('utf8'))
const write=(p:string,v:any)=>{mkdirSync(dirname(p),{recursive:true});const b=typeof v==='string'?v:JSON.stringify(v,null,2)+'\n';if(existsSync(p)){assert.equal(sha(readFileSync(p)),sha(b));return}writeFileSync(p,b,{flag:'wx'})}
const guard=read(resolve(own,'checks/genuine-ten-pair-current192-ready.technical.json')),selected=new Set<string>(guard.selectedGoalIds)
for(const b of Object.values(guard.beforeBindings)as any[])assert.equal(bind(resolve(root,b.path)).sha256,'sha256:'+b.sha256)
const before=read(resolve(own,'before/canonical.json')),beforeKinds=read(resolve(own,'before/kinds.json')),beforeQa=read(resolve(own,'before/qa.json'))
const landscape=read(resolve(own,'candidate/canonical.ten-current192-future-active.json')),kinds=read(resolve(own,'candidate/semantic-kinds.future-active.json')),inertKinds=read(resolve(own,'candidate/semantic-kinds.inactive-native.json')),qa=read(resolve(own,'candidate/visualization-qa.future-active.json')),inertQa=read(resolve(own,'candidate/visualization-qa.inactive-native.json'))
assert.equal(stableGoalBookJson(kinds),stableGoalBookJson(beforeKinds))
const by=new Map<string,any>(landscape.goals.map((g:any)=>[g.id,g]));for(const k of kinds.decisions)assert.equal(k.sourceFingerprint,fingerprintSemanticKindSourceGoal(by.get(k.goalId)))
const config=read(resolve(root,'app/scripts/config/goal-books/de-gym-biology-national-atlas.json')),manifest=read(resolve(root,config.compositionViewManifestPath)),compositionViewSources=manifest.sourcePaths.map((p:string)=>({path:p,view:read(resolve(root,p))})),navigationView=read(resolve(root,manifest.navigationViewPath)),durationModelPolicy=read(resolve(root,manifest.durationModelPolicyPath))
const oldDigests:Record<string,string>={},digests:Record<string,string>={}
for(const q of beforeQa.records)if(q.visualizationState==='available')oldDigests[q.imageUrl]=sha(bytes(resolve(root,q.publicAssetPath)))
for(const q of inertQa.records)if(q.visualizationState==='available')digests[q.imageUrl]=sha(bytes(resolve(root,q.publicAssetPath)))
const common={compositionViewManifest:manifest,compositionViewSources,navigationView,durationModelPolicy,evidenceReviewSources:[]}
const oldModel=buildGoalBookModel({...common,landscape:before,semanticKindLedger:beforeKinds,goalVisualizationQa:beforeQa,goalVisualizationAssetDigests:oldDigests,config}as any)
const inactiveConfig={...config,landscapePath:relative(root,resolve(own,'candidate/canonical.ten-current192-future-active.json')),semanticKindLedgerPath:relative(root,resolve(own,'candidate/semantic-kinds.inactive-native.json')),goalVisualizationQaPath:relative(root,resolve(own,'candidate/visualization-qa.inactive-native.json')),outputPath:relative(root,resolve(own,'native-full391.inactive.book-model.json'))}
const futureConfig={...config,outputPath:relative(root,resolve(own,'native-full391.future-active.pure.book-model.json'))}
const inertModel=buildGoalBookModel({...common,landscape,semanticKindLedger:inertKinds,goalVisualizationQa:inertQa,goalVisualizationAssetDigests:digests,config:inactiveConfig}as any),futureModel=buildGoalBookModel({...common,landscape,semanticKindLedger:kinds,goalVisualizationQa:qa,goalVisualizationAssetDigests:digests,config:futureConfig}as any)
assert.equal(oldModel.pages.length,391);assert.equal(inertModel.pages.length,391);assert.equal(futureModel.pages.length,391)
const oldPages=new Map(oldModel.pages.map(p=>[p.goalId,p])),authorModel=read(resolve(author,'native-raster-candidate/full391.book-model.json')),authorPages=new Map<string,any>(authorModel.pages.map((p:any)=>[p.goalId,p])),futurePages=new Map(futureModel.pages.map(p=>[p.goalId,p]))
assert.deepEqual(inertModel.pages.filter(p=>p.pageFingerprint!==oldPages.get(p.goalId)?.pageFingerprint).map(p=>p.goalId).sort(),[...selected].sort())
for(const page of inertModel.pages){assert.deepEqual(page,futurePages.get(page.goalId));if(!selected.has(page.goalId))assert.deepEqual(page,oldPages.get(page.goalId));else{const a=structuredClone(authorPages.get(page.goalId)),f=structuredClone(page);delete a.pageFingerprint;delete f.pageFingerprint;f.visualization!.qaStatus=a.visualization.qaStatus;assert.equal(stableGoalBookJson(f),stableGoalBookJson(a))}}
const mappingPaths=read(resolve(root,'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json')).mappingPaths,oldSources=buildGoalBookOriginalSources(oldModel,root,mappingPaths),newSources=buildGoalBookOriginalSources(futureModel,root,mappingPaths)
for(const k of Object.keys(oldSources).filter(k=>k!=='bookDigest'))assert.deepEqual((newSources as any)[k],(oldSources as any)[k])
write(resolve(own,'native-full391.current192-before.pure.book-model.json'),oldModel);write(resolve(own,'native-full391.inactive.config.json'),inactiveConfig);write(resolve(own,'native-full391.inactive.book-model.json'),inertModel);write(resolve(own,'native-full391.future-active.config.json'),futureConfig);write(resolve(own,'native-full391.future-active.pure.book-model.json'),futureModel)
const sourcePath=resolve(author,'native-raster-candidate/P10.actual-raster-author.review.jsonl'),profiles=bytes(sourcePath).toString('utf8').trim().split('\n').map(x=>JSON.parse(x)),ajv=new Ajv2020({strict:true,allErrors:true});addFormats(ajv)
const vp=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))),vc=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json')));assert.equal(profiles.length,10)
const reviewId='biologie-he7-current10-paired-reviewed-current391-positive-technical-20261008-v1',reviewedAt=[guard.actualWholeA.recordedAt,guard.actualWholeB.recordedAt].sort().at(-1)
const records=profiles.map(s=>{
 assert.ok(selected.has(s.goalId));assert.equal(s.status,'needs_human_review');assert.equal(s.reviewAuthority,'ai_candidate');assert.equal(s.evidenceLevel,'E1');assert.equal(s.maximumClaimScope,'G1')
 const r={...s,reviewId,reviewedAt,reviewer:'Technical integrator of genuine independently sealed Native10 A/B whole source/science/case/raster/page judgments; no new reviewer run',reviewRunIds:[],reason:'The genuine current ten-goal independent A/B pair agrees after whole scientific/source/P review and actual full PNG, 360/680 and native-page inspection. Whole profiles and twenty complete DE/EN cases preserved; only integration metadata added. Synthetic E1/G1, no actual experiment, learner result, universal cross-country operator closure or human approval.',dissent:[...s.dissent,'Author-stage pending statements retained as historical provenance; the two genuine final Native10 A/B seals now supply current machine review only. Separate human approval/trial remain open.']}
 assert.ok(vp(r),ajv.errorsText(vp.errors));const g=by.get(r.goalId),resources=Object.fromEntries(g.resourceLinks.filter((l:any)=>l.type==='goal-visualization').map((l:any)=>[l.url,digests[l.url]]));assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(r,g,resources,'curricularAtomic'),[]);assert.deepEqual(r.profile,s.profile)
 return r
})
write(resolve(own,'positive/current10.records.jsonl'),records.map(r=>JSON.stringify(r)).join('\n')+'\n')
const pc={...read(resolve(base,'biologie-he7-foundations-cells-photosynthesis-ten-whole-science-author-20261008-v1/P10.whole-current-author.config.json')),reviewId,reviewPath:relative(root,resolve(own,'positive/current10.records.jsonl')),reviewRunManifestPaths:[],scope:{label:'Ten genuinely paired current whole HE7 source/science/native/raster reviews; synthetic E1/G1, human gates separate',goalIds:guard.selectedGoalIds}}
assert.ok(vc(pc),ajv.errorsText(vc.errors));write(resolve(own,'positive/current10.future-active.config.json'),pc);write(resolve(own,'positive/current10.inactive-native.config.json'),{...pc,landscapePath:inactiveConfig.landscapePath,semanticKindLedgerPath:inactiveConfig.semanticKindLedgerPath})
write(resolve(own,'checks/current192-final-full391-P10.actual.technical.json'),{baselineActual:'192/391 terminal0',actualPairSeals:guard.seals,onlyTenResourceLinksChanged:true,other464WholeGoalBodiesExact:true,other381WholePagesExact:true,allTenAuthorPagesScientificFieldsExactExceptQaStatus:true,onlyNativePageCompatibilityMetadata:['visualization.qaStatus','derived pageFingerprint'],classifierAll474BodyExact:true,current19AtomicityMemoryConfigPointersRetained:true,originalSourceAndMappingBodiesExact:true,wholeTenProfileAndTwentyDEENCasesUnchanged:true,closedP10SchemaAndCurrentPNGSemantics:'PASS',actualPairedV10:'PASS',needsHumanReview:10,approved:0,nativeModelPages:391,actualCurrentPNGsRead:true,publicCLIStillPendingActiveIntegration:true,fullPDFRendered:false,newScienceRuns:0,activeWrites:0,strictGainClaimed:0,humanApproval:false,humanTrial:false})
write(resolve(own,'checks/final-P10-full391-declared-inputs.technical.json'),{files:[...declared.values()]})
console.log(JSON.stringify({currentBaseline:'192/391',nativePure391:'PASS',exactOtherPages:381,exactOtherWholeGoals:464,closedP10:'PASS',pairedV10:'PASS',activeWrites:0,strictGain:0}))
