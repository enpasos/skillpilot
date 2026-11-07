import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {captureCurriculumSource,createRetainedCoverageContext,RETAINED_INFO_OWNER as owner} from '../../../../app/scripts/lib/retainedAssessmentCoverage.ts'
import {evaluateCurriculumExamReadiness,evaluateExamTaskReadiness,evaluateGraphIntegrity} from '../../../../app/scripts/generateCurriculumQualityStatus.ts'
import {hasCompletePassingCurriculumExamReadiness} from '../../../../app/scripts/lib/curriculumAssessmentValidation.ts'
const root='/home/enpasos/projects/skillpilot',path='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json'
const original=JSON.parse(readFileSync(resolve(root,path),'utf8'))
const definitionIds=original.goals.filter((g:any)=>g.examData).map((g:any)=>g.id).sort()
function bind(raw:any){const source=captureCurriculumSource<any>(path,JSON.stringify(raw));const defs=source.goals.filter((g:any)=>g.examData||g.nodeKind==='exam'||(!(g.contains?.length)&&(g.tags??[]).some((t:any)=>['Exam','Assessment'].includes(t)))).map((g:any)=>g.id).sort();const retained=createRetainedCoverageContext(root,source,defs,definitionIds,[])!;const scope=Object.freeze({landscapeId:owner,definitionGoalIds:defs,requiredGoalIds:definitionIds,discoveryIssues:[],retainedCoverage:retained});return {source,scope,rules:evaluateCurriculumExamReadiness(source,[],[source],scope),manifest:retained.manifest}}
const db=['b86e8ab3-2c12-5b6b-b515-1e7d457c99c2','d13e297f-505d-576a-9a86-11ab4d7896c9','d9892508-97b5-529e-9b9e-c4889fba2166','4e0668e3-edca-57f4-b258-df87f23d2b4e'];const results=[]
const metadata=structuredClone(original)
for(const id of db){const e=metadata.goals.find((g:any)=>g.id===id).examData;delete e.reviewStatus;delete e.reviewNote;const reversed:any={};for(const k of Object.keys(e.scoring).reverse())reversed[k]=e.scoring[k];e.scoring=reversed}
const noMeta=bind(metadata);assert.equal(noMeta.manifest.status,'pass');for(const id of db){for(const r of noMeta.rules)assert(r.assessmentValidation!.failingGoalIds.includes(id));assert.equal(evaluateExamTaskReadiness([noMeta.source.goals.find((g:any)=>g.id===id)]).status,'fail')}
results.push({case:'review metadata absent plus scoring key reorder',status:'PASS',allFourIndividuallyRejectedIn202And204:true})
const upper=structuredClone(original);const u=upper.goals.find((g:any)=>g.id===db[0]);u.id=u.id.toUpperCase();u.examData.reviewStatus='released';const ub=bind(upper);assert.equal(ub.manifest.status,'fail');assert(!hasCompletePassingCurriculumExamReadiness([evaluateGraphIntegrity(ub.source,[{landscapeId:owner,goals:ub.source.goals}]),...ub.rules],owner,ub.scope));results.push({case:'uppercase DB UUID and released',status:'PASS',manifestStatus:ub.manifest.status,consumerAccepts:false})
const harmless=structuredClone(original);for(const id of db)harmless.goals.find((g:any)=>g.id===id).examData.taskContent+='\n';const hb=bind(harmless);assert.equal(hb.manifest.status,'fail');assert(db.every(id=>hb.manifest.rows.find(r=>r.goalId===id)?.issues.includes('meaning-change-unproved')));results.push({case:'body newline cannot turn readiness fingerprint escape into accepted contract',status:'PASS',allFourMeaningContractsReject:true})
const good=bind(original),forged:any=structuredClone([evaluateGraphIntegrity(good.source,[{landscapeId:owner,goals:good.source.goals}]),...good.rules]);for(const r of forged){if(!r.assessmentValidation)continue;r.status='pass';r.metrics.weakExamData=0;r.metrics.discoveryIssues=0;r.assessmentValidation.failingGoalIds=[];r.assessmentValidation.discoveryIssues=[]}
// Characterize the existing consumer trust boundary honestly; do not assert a new safeguard.
const bodyOnlyForgeryAccepted=hasCompletePassingCurriculumExamReadiness(forged,owner,good.scope)
results.push({case:'report-only forgery with valid technical contract and unchanged red material source',status:'OBSERVATION',consumerAccepts:bodyOnlyForgeryAccepted,scope:'Existing consumer independently binds coverage contract, not material readiness outcomes.'})
for(const field of ['retirementChecks','revision']){const changed=structuredClone(forged);delete changed.find((r:any)=>r.id==='CQR-204').assessmentValidation.retainedCoverageManifest[field];assert(!hasCompletePassingCurriculumExamReadiness(changed,owner,good.scope));results.push({case:'remove serialized '+field+' from otherwise passing-shaped report',status:'PASS',consumerAccepts:false})}
console.log(JSON.stringify({results,activeWrites:false,fullCqr:false,sourceAProbes:false},null,2))
