import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput, fingerprintPositiveGoalEvidenceProfile, validatePositiveGoalEvidenceRecordSemantics } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
import { reviewPositiveGoalEvidenceConfig } from '../../../../../../../app/scripts/positiveGoalEvidenceReview'
import { stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel'
const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/'
const own=base+'biologie-q1-carrier-image-and-projection-independent-b-v1/'
const previous=base+'biologie-q1-seven-final-native-p-independent-b-v1/'
const inputs=new Map<string,any>()
const bytes=(path:string)=>{const b=readFileSync(resolve(path));inputs.set(path,{path,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length});return b}
const read=(path:string)=>JSON.parse(bytes(path).toString())
const sha=(b:Buffer)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const same=(a:any,b:any)=>stableGoalBookJson(a)===stableGoalBookJson(b)
const assert=(c:any,s:string)=>{if(!c)throw new Error(s)}
const raw=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
const id='ac9e824f-003c-50ac-8751-2b8456004c63'
const goal=raw.goals.find((g:any)=>g.id===id)
const old=bytes(previous+'positive-evidence.seven.independent-b.review.jsonl').toString().trim().split('\n').map(s=>JSON.parse(s)).find(r=>r.goalId===id)
const snapshot=read(base+'biologie-q1-seven-component-source-topic-corrections-author-v7/seven-goals-sixteen-complete-cases.fresh-review-input.snapshot.json')
const cases=snapshot.rows.find((r:any)=>r.goalId===id)
const originalMaterials=read(snapshot.sourceMaterial.path)
const actualCaseRows=cases.cases.map((r:any)=>{
  const body=r.JSONPointer.split('/').slice(1).reduce((v:any,key:string)=>v[key],originalMaterials)
  assert(same(body,r.caseBody),'Actual full case payload changed '+r.caseBody.caseId)
  assert(old.profile.applicationCaseBriefs.some((b:any)=>b.id===r.caseBody.caseId),'Full case/profile binding lost')
  return{goalId:id,caseId:r.caseBody.caseId,JSONPointer:r.JSONPointer,fullActualDEENMaterialPromptSolutionConditionsReRead:true,originalWholeCasePayloadExact:true,positiveProfileBriefReviewedAgainstWholePayload:true,verdict:'KEEP'}
})
const resource=goal.resourceLinks.find((r:any)=>r.type==='goal-visualization'&&r.role==='primary')
const publicPath='app/public'+resource.url
const selected='curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-q1-carrier-user-geometry-correction-20261006-v2/carrier-corrected.candidate.png'
const candidate=bytes(selected),active=bytes(publicPath)
assert(candidate.equals(active),'Active image not actual independently viewed corrected candidate')
const resources={[resource.url]:sha(active)}
const profile={...old,reviewId:'biologie-q1-carrier-image-and-projection-independent-b-v1',reviewedAt:new Date().toISOString(),reviewer:'Codex independent targeted Biology P reviewer B /root/biology_q1_v7_source_science_independent_b; not image/country-view author; no new peer A verdict read',reason:'KEEP. Beide vollständigen bilingualen Originalmaterialien classical-carriers-a und classical-carriers-b und sämtliche bestehenden Erwartungen/Variationen/Briefs wurden erneut gelesen. Das korrigierte tatsächliche PNG und die reale finale PDF-Seite zeigen die unveränderte Material-/Abschnitts-/Trägerbeziehung mit kontinuierlicher DNA; die äußere Genmarkierung ersetzt keine eigenständige Erklärung. Fall a begründet mehrere Abschnitte und die offene Genzahl; Fall b überträgt die Relation auf vorgegebene Varianten am gleichen Genort ohne zusätzliche Allel-, Erbgangs-, Genprodukt- oder Krankheitspflicht. Beide DE/EN-Profile sind semantisch unverändert und am wirklichen Material gebunden. Die sechs tatsächlichen vollständigen Landes-Views bewahren alte Ziele und globalen Memory/Orientation-Support; Carrier bleibt in MV/SN/TH/ST ausschließlich prerequisiteOnly, direkt nur BE/BB. Keine ganze Quellenfreigabe, kein HumanApproval/Trial oder Lernerbeleg. Der neue native Inputfingerprint wird aus dem tatsächlich betrachteten und aktiven PNG berechnet, nicht als fachlicher Nachweis benutzt.',goalFingerprint:fingerprintGoalForPositiveEvidence(goal,'curricularAtomic'),reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(goal,old.reviewCriteriaFingerprint,resources,'curricularAtomic'),profileFingerprint:fingerprintPositiveGoalEvidenceProfile(old.profile),reviewRunIds:[],dissent:[]}
assert(same(profile.profile,old.profile)&&profile.profileFingerprint===old.profileFingerprint&&profile.goalFingerprint===old.goalFingerprint,'Unclaimed content/goal change')
assert(profile.status==='needs_human_review'&&profile.reviewAuthority==='ai_candidate'&&profile.evidenceLevel==='E1'&&profile.maximumClaimScope==='G1','Inflated profile authority')
const require=createRequire(resolve('app/package.json'))
const Ajv2020=require('ajv/dist/2020').default
const addFormats=require('ajv-formats').default
const ajv=new Ajv2020({allErrors:true,strict:true});addFormats(ajv)
const schema=read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
const validate=ajv.compile(schema)
assert(validate(profile),'Closed current P schema '+ajv.errorsText(validate.errors))
assert(validatePositiveGoalEvidenceRecordSemantics(profile,goal,resources,'curricularAtomic').length===0,'Native current P semantics rejected')
const oldConfig=read(previous+'positive-evidence.seven.independent-b.config.json')
const config={...oldConfig,reviewId:profile.reviewId,landscapePath:'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json',semanticKindLedgerPath:'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json',reviewPath:own+'positive.carrier.independent-b.review.jsonl',reviewRunManifestPaths:[],scope:{label:'Actual independent B targeted corrected carrier image profile; complete original cases retained; human review pending',goalIds:[id]}}
const criteria=bytes(config.reviewCriteriaPath);assert(sha(criteria)===old.reviewCriteriaFingerprint,'Review criteria changed')
writeFileSync(own+'positive.carrier.independent-b.review.jsonl',JSON.stringify(profile)+'\n')
writeFileSync(own+'positive.carrier.independent-b.config.json',JSON.stringify(config,null,2)+'\n')
const native=reviewPositiveGoalEvidenceConfig(resolve(own+'positive.carrier.independent-b.config.json'))
assert(native.errors.length===0&&native.counts.needsHumanReview===1&&native.counts.approved===0,'Current full native P checker failed')
writeFileSync(own+'carrier-current-profile-and-two-full-cases.independent-b.actual.json',JSON.stringify({schemaVersion:1,createdAtUTC:new Date().toISOString(),verdict:'KEEP',goalId:id,wholeExistingProfileContentExact:true,fullCaseChecks:actualCaseRows,actualResourceDigests:resources,nativeReviewInputFingerprint:profile.reviewInputFingerprint,nativeGoalFingerprint:profile.goalFingerprint,nativeProfileFingerprint:profile.profileFingerprint,closedSchemaValid:true,nativeSemanticErrors:[],nativeFullCheckerErrors:native.errors,nativeFullCheckerCounts:native.counts,peerANewProfileOrVerdictRead:false,oldSixRecordsNotRetaggedOrRereviewed:true,allActualInputs:[...inputs.values()],activeWrites:false,humanApproval:false,humanTrial:false,learnerEvidence:false},null,2)+'\n')
console.log(JSON.stringify({verdict:'KEEP',goalId:id,actualNewPNGSHA256:resources[resource.url],independentlyComputedNativePInput:profile.reviewInputFingerprint,nativeErrors:native.errors,humanReviewPending:true}))
