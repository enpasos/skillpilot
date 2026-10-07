// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync,existsSync} from 'node:fs'
import {dirname,resolve,relative} from 'node:path'
import {fileURLToPath} from 'node:url'
import Ajv from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {buildApplicabilityCompilation} from '../../../../../../../app/scripts/applicabilityCompiler'
import {buildApplicabilityCompilation as buildCandidateApplicability} from './native-applicability-single-inactive-input-probe'
import {evaluateRouteProfile,routeProfiles} from './native-quality-private-function-probe'
import {buildGoalBookModel,loadGoalBookBuildInputs,fingerprintSemanticKindSourceGoal} from '../../../../../../../app/scripts/goalBookModel'
import {buildGoalBookOriginalSources} from '../../../../../../../app/scripts/goalBookOriginalSources'
import {buildGoalDescriptionCanonicalContext} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'

const own=dirname(fileURLToPath(import.meta.url)),root=resolve('.')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const write=(p:string,v:any)=>{const dest=resolve(own,p);if(existsSync(dest)){assert.deepEqual(read(dest),v,'Existing author evidence must remain exact');return}writeFileSync(dest,JSON.stringify(v,null,2)+'\n',{flag:'wx'})}
const sha=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const stable=(v:any)=>JSON.stringify(v)
const current=read(resolve(own,'source-canonical.current473.exact.json')),future=read(resolve(own,'candidate/canonical.current474-bylk-terminal.inactive.json'))
const target='11675f1a-5de2-5926-be78-1e8275f19f5b',terminal='e8caebd4-57bc-5c2f-881d-0b1693777c64',parent='28788f27-f079-5d78-936f-b7684760ff31',global='1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a'
const oldBy=new Map<string,any>(current.goals.map((g:any)=>[g.id,g])),newBy=new Map<string,any>(future.goals.map((g:any)=>[g.id,g]))
assert.deepEqual(read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'),current,'Frozen source must still be current')
assert.deepEqual(newBy.get(target),oldBy.get(target));assert.deepEqual(newBy.get(global),oldBy.get(global))
const rawSchema=read('docs/landscape-runtime.schema.json'),ajv=new Ajv({strict:false,allErrors:true});addFormats(ajv);const validate=ajv.compile(rawSchema)
assert.ok(validate(future),ajv.errorsText(validate.errors))
const beforeAP=buildApplicabilityCompilation(),afterAP=buildCandidateApplicability()
const oldReport=beforeAP.reports.find(r=>r.landscapeId===current.landscapeId)!,newReport=afterAP.reports.find(r=>r.landscapeId===future.landscapeId)!
const oldAP=new Map(oldReport.goals.map(g=>[g.goalId,g])),newAP=new Map(newReport.goals.map(g=>[g.goalId,g]))
const alteredAP=current.goals.filter((g:any)=>stable(oldAP.get(g.id)?.compiledApplicability)!==stable(newAP.get(g.id)?.compiledApplicability)).map((g:any)=>g.id)
assert.deepEqual(alteredAP,[],'No existing jurisdiction applicability may change')
assert.deepEqual(newAP.get(terminal)?.compiledApplicability,{jurisdiction:['DE-BY']})
assert.deepEqual(newAP.get(global)?.compiledApplicability,{jurisdiction:['DE-HE']})
const profile=routeProfiles.find(p=>p.profileId==='canonical-biology-sek2')!
const before=evaluateRouteProfile(current,profile,beforeAP),after=evaluateRouteProfile(future,profile,afterAP)
for(const rule of ['CQR-101','CQR-102'])assert.equal(after.rules.find(r=>r.id===rule)?.status,'pass')
assert.equal(after.rules.find(r=>r.id==='CQR-202')?.status,'fail','Unreviewed exam cannot be counted as released')
assert.equal(after.rules.find(r=>r.id==='CQR-203')?.status,'warn')
write('native-current-and-candidate-route-scopes.actual.json',{
    before,after,oldGlobalEndpointCompiledScope:oldAP.get(global)?.compiledApplicability,newGlobalEndpointCompiledScope:newAP.get(global)?.compiledApplicability,
    newEndpointCompiledScope:newAP.get(terminal)?.compiledApplicability,newEndpointFullApplicabilityEvidence:newAP.get(terminal),
    existingJurisdictionScopesChanged:alteredAP,existingJurisdictionScopesChecked:473,
    nativeCQR104:'not_configured: actual Biology profile has no compositionViewStage; no CQR-104 pass claimed',
    authorCandidateCQR202And203:'CQR-202 fail / CQR-203 warn until two actual independent endpoint reviews and explicit machine release integration',
    activeWrites:0,newHumanApprovalsClaimed:0})
const kinds=read('curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'),nextKinds=structuredClone(kinds)
const changedDecision=nextKinds.decisions.find((d:any)=>d.goalId===parent);changedDecision.sourceFingerprint=fingerprintSemanticKindSourceGoal(newBy.get(parent))
// Classification was actually checked from the complete task, model solution and rubric.
// It does not release the still needs_review exam or certify independent endpoint quality.
const decision={goalId:terminal,sourceFingerprint:fingerprintSemanticKindSourceGoal(newBy.get(terminal)),semanticKind:'practiceAssessment',decisionStatus:'authoritative',decisionBasis:'reviewed-current-pilot-practice-assessment'}
nextKinds.decisions.push(decision);nextKinds.decisions.sort((a:any,b:any)=>a.goalId.localeCompare(b.goalId));nextKinds.counts.practiceAssessment++;nextKinds.counts.total++
nextKinds.sourceLandscapePath=relative(root,resolve(own,'candidate/canonical.current474-bylk-terminal.inactive.json'))
assert.equal(nextKinds.counts.curricularAtomic,391)
write('candidate/semantic-kinds.current474-bylk-terminal.author-v2.json',nextKinds)
const baseline=await loadGoalBookBuildInputs(resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-cqr003-five-reviewed-integration-preparation-technical-20261007-v1/native-full391.future-active.config.json'))
assert.equal(baseline.model.pages.length,391)
const config={...baseline.config,landscapePath:relative(root,resolve(own,'candidate/canonical.current474-bylk-terminal.inactive.json')),semanticKindLedgerPath:relative(root,resolve(own,'candidate/semantic-kinds.current474-bylk-terminal.author-v2.json')),evidenceReviewPaths:[],outputPath:relative(root,resolve(own,'native-full391.after-terminal.book-model.json'))}
const manifest=read(config.compositionViewManifestPath!),qa=read(config.goalVisualizationQaPath!),digests:Record<string,string>={}
for(const row of qa.records)if(row.visualizationState==='available')digests[row.imageUrl]=sha(readFileSync(resolve(root,row.publicAssetPath)))
const model=buildGoalBookModel({landscape:future,semanticKindLedger:nextKinds,compositionViewManifest:manifest,
compositionViewSources:manifest.sourcePaths.map((p:string)=>({path:p,view:read(p)})),navigationView:read(manifest.navigationViewPath),durationModelPolicy:read(manifest.durationModelPolicyPath),goalVisualizationQa:qa,goalVisualizationAssetDigests:digests,evidenceReviewSources:[],config} as any)
assert.equal(model.pages.length,391)
const oldPages=new Map(baseline.model.pages.map(p=>[p.goalId,p]))
const changed=model.pages.filter(p=>p.pageFingerprint!==oldPages.get(p.goalId)?.pageFingerprint)
assert.deepEqual(changed.map(p=>p.goalId),[target])
const nextPage=changed[0],oldPage=oldPages.get(target)!
assert.deepEqual(nextPage.externalReverseRequires.filter(r=>r.goalId===terminal).map(r=>r.goalId),[terminal])
const oldSource=buildGoalBookOriginalSources(baseline.model,root,read('app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json').mappingPaths)
const nextSource=buildGoalBookOriginalSources(model,root,read('app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json').mappingPaths)
for(const key of Object.keys(oldSource).filter(k=>k!=='bookDigest'))assert.deepEqual((nextSource as any)[key],(oldSource as any)[key],key)
for(const page of baseline.model.pages){
 const previous=oldBy.get(page.goalId),next=newBy.get(page.goalId)
 assert.deepEqual(next,previous)
 assert.deepEqual(buildGoalDescriptionCanonicalContext(next),buildGoalDescriptionCanonicalContext(previous))
 assert.equal(fingerprintGoalForPositiveEvidence(next,'curricularAtomic'),fingerprintGoalForPositiveEvidence(previous,'curricularAtomic'))
 const resources=Object.fromEntries((next.resourceLinks??[]).filter((l:any)=>l.type==='goal-visualization').map((l:any)=>[l.url,digests[l.url]]))
 assert.equal(fingerprintPositiveGoalEvidenceReviewInput(next,'retention-comparison-identical-criteria',resources,'curricularAtomic'),fingerprintPositiveGoalEvidenceReviewInput(previous,'retention-comparison-identical-criteria',resources,'curricularAtomic'))
}
write('native-full391.before-terminal.book-model.json',baseline.model)
write('native-full391.after-terminal.book-model.json',model)
write('native-full391.after-terminal.book.config.json',config)
write('exact-one-reverse-context-and-other390-binding-guards.actual.json',{wholeGoalsBefore:473,wholeGoalsAfter:474,curricularAtomicBeforeAndAfter:391,
all391WholeGoalFieldsUnchanged:true,all391OwnNativeDContextsUnchanged:true,all391OwnPInputsUnchanged:true,
allSourceClausesScopesAndDocumentsUnchanged:true,newCurricularIds:[],unchangedPageFingerprints:390,
changedPageGoalIds:[target],beforeWholeTargetPage:oldPage,afterWholeTargetPage:nextPage,
actualDRefreshScope:'Added reverse prerequisite reference to existing-scope BY-LK ENG/EKG assessment; two independent current context reviews required',
newAssessmentRequires:[target],newAssessmentCoveredGoalIds:[target],newAssessmentCourseTags:['LK'],nativeCQR101:'pass',nativeCQR102:'pass',nativeCQR104:'not_configured',
nativeCQR202:'fail author_candidate',nativeCQR203:'warn author_candidate',newStrictClosuresClaimed:0,activeWrites:0,humanApproval:false,humanTrial:false})
console.log(JSON.stringify({nativeRouteCQR101:'PASS',nativeRouteCQR102:'PASS',nativeCQR104:'not_configured',oldScopesAll473Exact:true,newEndpointScope:['DE-BY'],oldGlobalScope:['DE-HE'],native391ModelChangedOnly:[target],all391OwnGoalAndPInputsExact:true,schema:'PASS',machineExamReview:'pending two independent reviews'}))
