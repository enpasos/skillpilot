// SPDX-License-Identifier: Apache-2.0
import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { buildApplicabilityCompilation } from '/home/enpasos/projects/skillpilot/tmp/chemie-q1-final378-independent-a-native-d-20261006-v1/app/scripts/applicabilityCompiler.ts'
import { buildGoalBookModel, stableGoalBookJson } from '/home/enpasos/projects/skillpilot/tmp/chemie-q1-final378-independent-a-native-d-20261006-v1/app/scripts/goalBookModel.ts'
import { buildGoalDescriptionRolloutSubsetModel } from '/home/enpasos/projects/skillpilot/tmp/chemie-q1-final378-independent-a-native-d-20261006-v1/app/scripts/materializeGoalDescriptionRolloutBatch.ts'
import { buildGoalDescriptionCanonicalContext } from '/home/enpasos/projects/skillpilot/tmp/chemie-q1-final378-independent-a-native-d-20261006-v1/app/scripts/validateGoalDescriptionReviewCampaign.ts'
import { validatePositiveGoalEvidenceRecordSemantics } from '/home/enpasos/projects/skillpilot/tmp/chemie-q1-final378-independent-a-native-d-20261006-v1/app/scripts/positiveGoalEvidenceProfileModel.ts'

const root='/home/enpasos/projects/skillpilot'
const iso=join(root,'tmp/chemie-q1-final378-independent-a-native-d-20261006-v1')
const evidence=join(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06')
const prep=join(evidence,'chemie-q1-current378-routes-native-d-preparation-v1')
const own=join(evidence,'chemie-q1-final378-independent-a-native-d-v1')
const load=async(path:string)=>JSON.parse(await readFile(path,'utf8'))
const sha=(bytes:Buffer|string)=>'sha256:'+createHash('sha256').update(bytes).digest('hex')
const equal=(a:unknown,b:unknown)=>stableGoalBookJson(a)===stableGoalBookJson(b)
const canonicalPath=join(iso,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
const canonical=await load(canonicalPath)
const originalFull=await load(join(prep,'native-models/full-current378-final-v4.book-model.json'))
const config=await load(join(prep,'full-current378-routes-v2.config.json'))
const view=await load(join(root,'tmp/chemie-q1-current378-routes-native-d-preparation-20261006-v1',config.compositionViewPath))
const semantic=await load(join(prep,'semantic-kinds.final-v4.inactive.json'))
const qa=await load(join(iso,config.goalVisualizationQaPath))
const resourceDigests:Record<string,string>={}
for(const record of qa.records) if(record.visualizationState==='available') {
 resourceDigests[record.imageUrl]=sha(await readFile(join(root,'tmp/chemie-q1-current378-routes-native-d-preparation-20261006-v1',record.publicAssetPath)))
 if(resourceDigests[record.imageUrl]!==record.assetSha256)throw new Error('Actual image bytes differ from QA binding: '+record.goalId)
}
const freshFull=buildGoalBookModel({landscape:canonical,compositionView:view,semanticKindLedger:semantic,goalVisualizationQa:qa,goalVisualizationAssetDigests:resourceDigests,evidenceReviewSources:[],config})
const errors:string[]=[]
if(!equal(freshFull,originalFull)) errors.push('Fresh full378 native model differs from frozen final-v4 model')
const compilation=buildApplicabilityCompilation()
const chem=compilation.reports.find(r=>r.landscapeId===canonical.landscapeId)!
const reportById=new Map(chem.goals.map(g=>[g.goalId,g]))
const goalById=new Map(canonical.goals.map((g:any)=>[g.id,g]))
const selectedScopeIds=['d3cd250f-5221-589d-aa1c-44a4692d1acb','0d59b62e-d3f9-5969-b961-0c5e26316c04','3d6699ae-ebbd-5a55-8798-b809a9d74f0a','18819a59-2442-530f-a7c3-26755398ec66','4cb74d76-99f1-5264-b1e3-448cda47b005','171b47e2-2c53-50f2-a145-a26b896fd73f']
const scopes=selectedScopeIds.map(id=>({goalId:id,...reportById.get(id)}))
for(const scope of scopes) if(!equal(scope.compiledApplicability,{jurisdiction:['DE-HE']}))errors.push(`Non-HE applicability for ${scope.goalId}`)
const supplementPath=join(evidence,'chemie-q1-current378-routes-integration-preparation-v2/positive-binding-before-followup.native.actual.json')
const supplementBytes=await readFile(supplementPath)
if(sha(supplementBytes)!=='sha256:cdd1510aba71032417448135a2159a95da9ecf822fda86253e1ec166de136356')errors.push('P supplement digest differs')
const supplement=JSON.parse(supplementBytes.toString())
const profiles=new Map(supplement.configs.flatMap((c:any)=>c.records.map((r:any)=>[r.goalId,r])))
const currentPages=[]
const batchChecks=[]
for(const n of ['001','002','003']){
 const batchRoot=join(prep,'native-current-d-batches','batch-'+n)
 const original=await load(join(batchRoot,'bundle/book-model.json'))
 const input=await load(join(batchRoot,'round-a/description-review-input.json'))
 const fresh=buildGoalDescriptionRolloutSubsetModel({baseModel:freshFull,goalIds:input.goals.map((g:any)=>g.goalId),bookId:original.book.id,title:original.book.title})
 const matches=equal(original,fresh)
 if(!matches)errors.push('Fresh native subset differs for '+n)
 for(const binding of input.goals){
  const goal:any=goalById.get(binding.goalId)
  const page=fresh.pages.find(p=>p.goalId===binding.goalId)!
  const contextExact=equal(buildGoalDescriptionCanonicalContext(goal),binding.canonicalContext)
  const pageExact=equal(page,binding.reviewContext.page)
  const profile:any=profiles.get(binding.goalId)
  const pErrors=profile?validatePositiveGoalEvidenceRecordSemantics(profile,goal,resourceDigests,'curricularAtomic'):['missing supplied current P profile']
  const pComplete=!!profile && !!profile.profile?.expectations?.length && !!profile.profile?.applicationCaseBriefs?.length && profile.profile.coverageExpectations.minimumIndependentDemonstrations>=2 && pErrors.length===0
  if(!contextExact) errors.push(binding.goalId+': canonicalContext mismatch')
  if(!pageExact) errors.push(binding.goalId+': current page mismatch')
  errors.push(...pErrors)
  if(!pComplete)errors.push(binding.goalId+': P profile incomplete')
  currentPages.push({batch:n,goalId:binding.goalId,goalFingerprint:binding.goalFingerprint,pageFingerprint:binding.pageFingerprint,canonicalContextExact:contextExact,nativeFreshPageExact:pageExact,compiledApplicability:reportById.get(binding.goalId)?.compiledApplicability,applicabilityEvidence:reportById.get(binding.goalId)?.evidence,pProfileFingerprint:profile?.profileFingerprint,pReviewInputFingerprint:profile?.reviewInputFingerprint,pNativeErrors:pErrors,pComplete,pRecommendation:pComplete?'none':'revise',requires:page.requires,externalPrerequisites:page.externalPrerequisites,reverseRequires:page.reverseRequires,externalReverseRequires:page.externalReverseRequires,visualization:page.visualization})
 }
 batchChecks.push({batch:n,nativeFreshModelExact:matches,goalCount:fresh.pages.length,bookDigest:fresh.digest})
}
const result={schemaVersion:1,canonicalDigest:sha(await readFile(canonicalPath)),nativeCodeModified:false,freshFull378NativeModelExact:equal(freshFull,originalFull),batchChecks,selectedScope:scopes,technicalCompilerChemistryFindings:chem.findings,positiveProfileSupplementDigest:sha(supplementBytes),currentPages,errors,activeWrites:false,newScientificApprovals:false,humanApproval:false}
await writeFile(join(own,'independent-current53-native-bindings.actual.json'),JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({freshFull378NativeModelExact:result.freshFull378NativeModelExact,batches:batchChecks,reviewedCurrentPages:currentPages.length,errors}))
if(errors.length)process.exitCode=1
