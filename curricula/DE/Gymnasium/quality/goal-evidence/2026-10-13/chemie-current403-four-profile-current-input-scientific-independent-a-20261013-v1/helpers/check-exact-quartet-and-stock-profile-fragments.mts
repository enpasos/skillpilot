// Apache-2.0. Independent finite quartet checks; no compiled model or review-row output.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { isDeepStrictEqual as same } from 'node:util'
const load=async(p:string)=>await import(pathToFileURL(resolve(p)).href)
const {default:Ajv}=await load('app/node_modules/ajv/dist/2020.js')
const {fingerprintSemanticKindSourceGoal:semanticFp}=await load('app/scripts/goalBookModel.ts')
const {fingerprintGoalForPositiveEvidence:goalFp,fingerprintPositiveGoalEvidenceProfile:profileFp}=await load('app/scripts/positiveGoalEvidenceProfileModel.ts')
const e='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/'
const own=e+'chemie-current403-four-profile-current-input-scientific-independent-a-20261013-v1'
const author=e+'chemie-current403-four-profile-current-input-author-successor-20261013-v1'
if(existsSync(own+'/FINAL.independent-four-profile-current-input.freeze.json'))throw Error('Sealed root')
const paths=new Set<string>(),read=(p:string)=>{paths.add(p);return JSON.parse(readFileSync(p,'utf8'))}
const bind=(path:string)=>{paths.add(path);const b=readFileSync(path);return {path,sha256:'sha256:'+createHash('sha256').update(b).digest('hex'),bytes:b.length}}
const check=(v:unknown,s:string)=>{if(!v)throw Error(s)}
const stable=(v:any):string=>v&&typeof v==='object'?(Array.isArray(v)?'['+v.map(stable).join(',')+']':'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}'):JSON.stringify(v)
const hash=(v:any)=>'sha256:'+createHash('sha256').update(stable(v)).digest('hex')
const diff=(a:any,b:any,p=''):string[]=>same(a,b)?[]:(a&&b&&typeof a==='object'&&typeof b==='object'&&Array.isArray(a)===Array.isArray(b)?[...new Set([...Object.keys(a),...Object.keys(b)])].flatMap(k=>diff(a[k],b[k],p+'/'+k)):[p])
const first=read(own+'/FIRST.neutral-four-profile-current-input-seal.json')
for(const r of [first.neutralSelector,first.authorFinalSeal,...first.directNeutralBindings.map((r:any)=>r.expected)])check(same(bind(r.path),r),'FIRST input exact')
const selector=read(first.neutralSelector.path)
const whole=read(selector.fourWholeGoals.path),land=read(whole.landscapeBinding.path)
check(same(bind(whole.landscapeBinding.path),whole.landscapeBinding),'current landscape bytes')
const ledger=read(selector.sourceInputs.find((r:any)=>r.path.includes('semantic525.')).path)
const profiles=read(selector.wholeProfiles.path).profiles,cases=read(selector.wholeCases.path).cases,cas=read(selector.profileCAS.path)
const oldP1=read(selector.sourceInputs.find((r:any)=>r.path.endsWith('/whole37.exact-profiles.author.json')).path).profiles
const oldP2=read(selector.sourceInputs.find((r:any)=>r.path.endsWith('/two-child.exact-route-profiles.author.json')).path).profiles
const oldC1=read(selector.sourceInputs.find((r:any)=>r.path.endsWith('/whole74.exact-bilingual-cases.author.json')).path).cases
const oldC2=read(selector.sourceInputs.find((r:any)=>r.path.endsWith('/four-child.complete-DEEN-cases.author.json')).path).cases
const stockPath='contracts/goal-evidence/v2/goal-evidence-profile.schema.json',stock=read(stockPath)
const validate=new Ajv({strict:false,allErrors:true}).compile({$schema:stock.$schema,$defs:stock.$defs,$ref:'#/$defs/profile'})
const qaPath=selector.sourceInputs.find((r:any)=>r.path.includes('/QA.')).path
const qa=read(qaPath)
// Extract asset identity only; do not inspect or repeat peer verdict fields.
const assetHashes=new Map(qa.records.filter((r:any)=>whole.goalIds.includes(r.goalId)).map((r:any)=>[r.goalId,r.assetSha256]))
const images=[
 {goalId:whole.goalIds[0],source:'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-polymers-three-visual-Pscope-atomicity-author-successor-20261013-v3/original-generator-pngs/e56040b5-1da8-5080-b358-086d04922339.generator-original.png',viewedExactCopy:'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-polymers-three-visual-Pscope-atomicity-author-successor-20261013-v3/visual-candidate/curricula/DE/Gymnasium/visualizations/chemie/e56040b5-1da8-5080-b358-086d04922339/e56040b5-1da8-5080-b358-086d04922339.png'},
 {goalId:whole.goalIds[1],source:e+'chemie-b208-critical-label-legibility-author-successor-20261013-v2/candidate/visualizations/chemie/b208b1a5-c609-53a1-8add-979417a93b7d/b208b1a5-c609-53a1-8add-979417a93b7d.png'},
 {goalId:whole.goalIds[2],source:e+'chemie-e594-two-child-actual-images-author-20261013-v1/candidate/visualizations/chemie/981242bb-a729-5701-b02d-c2f7f489e5af/981242bb-a729-5701-b02d-c2f7f489e5af.png'},
 {goalId:whole.goalIds[3],source:e+'chemie-e594-two-child-actual-images-author-20261013-v1/candidate/visualizations/chemie/53db04a0-ea76-5810-9526-c8639100e497/53db04a0-ea76-5810-9526-c8639100e497.png'}
].map(r=>{const actual=bind(r.source);check(assetHashes.get(r.goalId)===actual.sha256,'actual current QA asset hash');if(r.viewedExactCopy)check(bind(r.viewedExactCopy).sha256===actual.sha256,'viewed native exact bytes');return {...r,actual,actualNativeOpened:true,scope:'P-content context only; no new V verdict'}})
const results=profiles.map((row:any,i:number)=>{
 const g=whole.goals.find((g:any)=>g.id===row.goalId),current=land.goals.find((g:any)=>g.id===row.goalId)
 check(same(g,current),'entire current goal');const d=ledger.decisions.find((r:any)=>r.goalId===g.id);check(d.sourceFingerprint===semanticFp(g)&&d.semanticKind==='curricularAtomic','current semantic identity')
 const op=cas.operations.find((r:any)=>r.goalId===g.id),old=[...oldP1,...oldP2].find((r:any)=>r.goalId===g.id).profile
 check(same(op.beforeWholeProfile,old)&&same(op.afterWholeProfile,row.profile),'whole profile before/after')
 const changes=diff(old,row.profile).sort(),allowed=i===0?['/expectations/2/observablePerformanceDe','/expectations/2/observablePerformanceEn'].sort():i===1?[]:['/coverageExpectations/minimumIndependentDemonstrations']
 check(same(changes,allowed),'bounded profile deltas')
 const valid=validate(row.profile);check(valid,'actual positive stock profile fragment');const caseRows=cases.filter((c:any)=>c.goalId===g.id).map((c:any)=>{
  check(same(c,[...oldC1,...oldC2].find((r:any)=>r.caseId===c.caseId)),'entire original case unchanged')
  check(c.maximumPoints===c.rubric.reduce((n:number,r:any)=>n+r.maximumPoints,0),'point sum')
  check(same([...new Set(c.expectationIds)].sort(),row.profile.coverageExpectations.requiredExpectationIds.slice().sort()),'all linked expectation IDs')
  let spans=0;for(const lang of ['De','En'])for(const r of c.rubric){if(r['taskSpan'+lang]){check(c['task'+lang].slice(r['taskSpan'+lang].start,r['taskSpan'+lang].end)===r['taskClause'+lang],'actual exact annotated task span');spans++}}
  const brief=row.profile.applicationCaseBriefs.find((b:any)=>b.id===c.caseId);const joins=[]
  for(const lang of ['De','En']){check(brief['expectedPerformance'+lang]===c['modelAnswer'+lang],'entire model brief');const expected=i===0?c['task'+lang]:c['data'+lang]+'\n'+c['task'+lang];check(brief['taskDemand'+lang]===expected,'entire task brief');joins.push({language:lang,briefTaskForm:i===0?'task-only exact; full data remains in whole case':'data plus task exact',modelWholeExact:true})}
  return {caseId:c.caseId,wholeOriginalCaseStableJsonSha256:hash(c),wholeOriginalExact:true,rubricRows:c.rubric.length,annotatedBilingualSpansChecked:spans,unannotatedRubricRows:c.rubric.filter((r:any)=>!r.taskSpanDe&&!r.taskSpanEn).length,maximumPoints:c.maximumPoints,wholeBriefJoins:joins,actualExecutionOrLearnerMastery:false}
 })
 return {goalId:g.id,wholeCurrentGoalStableJsonSha256:hash(g),stockSemanticSourceFingerprint:semanticFp(g),stockPositiveGoalFingerprint:goalFp(g,'curricularAtomic'),stockPositiveProfileFingerprint:profileFp(row.profile),profileFragmentValid:valid,profileFragmentErrors:validate.errors,profileChangedPaths:changes,minimumIndependentDemonstrations:row.profile.coverageExpectations.minimumIndependentDemonstrations,cases:caseRows}
})
for(const p of ['AGENTS.md','app/scripts/goalBookModel.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/goalEvidenceProfileModel.ts'])bind(p)
const out={schemaVersion:1,checkedAtUTC:new Date().toISOString(),role:'Own finite exact quartet checks; scientific content votes are separate',exactInputs:[...paths].filter(p=>!p.startsWith(own+'/')).sort().map(bind),allFirstNeutralBindingsExact:true,wholeCurrentGoalBodiesExact:4,wholeOriginalCasesUnchanged:8,profileResults:results,currentImageContext:images,totalRubricRows:cases.reduce((n:number,c:any)=>n+c.rubric.length,0),totalProvidedBilingualSpansChecked:results.reduce((n:number,r:any)=>n+r.cases.reduce((n:number,c:any)=>n+c.annotatedBilingualSpansChecked,0),0),sourceMatrixOrOtherGoalsReviewed:false,fullNativeDOrReviewInputResourceDigestsBound:false,completeStockReviewRecordMaterialized:false,normalCompilerOrFullBuildExecuted:false,activeHistoricalOrImageWrites:false,gitOperations:false,D_P_A_M_V_orM7Grant:false,humanApproval:false,humanTrial:false}
writeFileSync(own+'/checks/exact-quartet-and-stock-profile-fragments.actual.json',JSON.stringify(out,null,2)+'\n')
console.log(JSON.stringify({wholeCurrentGoals:4,positiveStockProfileFragmentsValid:4,wholeOriginalCasesUnchanged:8,rubricRows:out.totalRubricRows,providedBilingualSpansChecked:out.totalProvidedBilingualSpansChecked,actualNativeImageContexts:images.length,completeDOrGatesClaimed:false}))
