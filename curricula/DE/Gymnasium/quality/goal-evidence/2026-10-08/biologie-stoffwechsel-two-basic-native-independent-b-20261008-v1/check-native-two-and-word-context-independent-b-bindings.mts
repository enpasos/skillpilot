// Actual scoped native B, P2, A2/M2 and existing whole P binding checks; no active writes or full QA.
import {readFileSync,writeFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {validatePositiveGoalEvidenceRecordSemantics,fingerprintPositiveGoalEvidenceProfile,fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
import {validateGoalDescriptionReviewCampaignResultDirectories} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaignResults'
const out=dirname(fileURLToPath(import.meta.url)),root=resolve(out,'../../../../../../..'),base=dirname(out)
const a=resolve(base,'biologie-stoffwechsel-two-basic-companions-complete-author-20261008-v2'),context=resolve(base,'biologie-stoffwechsel-existing-word-targeted-context-independent-b-20261008-v1')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),rows=(p:string)=>readFileSync(p,'utf8').trim().split('\n').map(JSON.parse)
const sha=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const c=read(resolve(a,'candidate/canonical.shadow478.basic2-after-three-rasters.json')),full=read(resolve(a,'native/full394.actual-primary-refined.final-model.json')),small=read(resolve(a,'native-two-primary-refined/book-model.json'))
const records=rows(resolve(out,'P2-whole-current.actual-independent-b.records.jsonl'))
const authored=rows(resolve(a,'positive/P2.actual-closed.author-candidate.review.jsonl'))
const ajv=new Ajv2020({allErrors:true,strict:false});addFormats(ajv)
const schema=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
function pcheck(record:any,sub:any){
 const goal=c.goals.find((g:any)=>g.id===record.goalId),link=goal.resourceLinks.find((l:any)=>l.type==='goal-visualization'&&l.role==='primary')
 const actual=sha(readFileSync(resolve(a,link.url.replace(/^\//,'')))),resources={[link.url]:actual}
 const page=full.pages.find((p:any)=>p.goalId===record.goalId),n=sub.pages.find((p:any)=>p.goalId===record.goalId)
 const schemaPass=schema(record),semanticErrors=validatePositiveGoalEvidenceRecordSemantics(record,goal,resources,'curricularAtomic'),fp=fingerprintGoalForPositiveEvidence(goal,'curricularAtomic')
 return {goalId:record.goalId,actualResources:resources,schemaPass,schemaErrors:schema.errors??[],semanticErrors,goalFingerprintExact:fp===record.goalFingerprint,profileFingerprintExact:fingerprintPositiveGoalEvidenceProfile(record.profile)===record.profileFingerprint,reviewInputFingerprintExact:fingerprintPositiveGoalEvidenceReviewInput(goal,record.reviewCriteriaFingerprint,resources,'curricularAtomic')===record.reviewInputFingerprint,whole394AndSubsetGoalFingerprintExact:page.goalFingerprint===fp&&n.goalFingerprint===fp,whole394AndSubsetActualPNGExact:page.visualization.originalDigest===actual&&n.visualization.originalDigest===actual,reviewRunIds:record.reviewRunIds,status:record.status,reviewAuthority:record.reviewAuthority,evidenceLevel:record.evidenceLevel,maximumClaimScope:record.maximumClaimScope}
}
const positive=records.map(r=>({...pcheck(r,small),wholeAuthoredProfileExact:JSON.stringify(r.profile)===JSON.stringify(authored.find((x:any)=>x.goalId===r.goalId).profile)}))
const checkCampaign=async(p:string)=>validateGoalDescriptionReviewCampaignResultDirectories({bundle:read(resolve(p,'review-bundle-manifest.json')),input:read(resolve(p,'description-review-input.json')),campaign:read(resolve(p,'description-review-campaign.json')),batchesDirectory:resolve(p,'batches'),resultsDirectory:resolve(p,'results')})
const campaign=await checkCampaign(resolve(a,'native-two-primary-refined/round-b'))
const normalize=(x:any)=>String(x??'').normalize('NFKC').replace(/\s+/g,' ').trim()
const stable=(x:any):any=>Array.isArray(x)?x.map(stable):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).sort(([l],[r])=>l.localeCompare(r)).map(([k,v])=>[k,stable(v)])):x
const am= ['A','M'].flatMap(type=>rows(resolve(out,`${type}2-new-two.actual-independent-b.records.jsonl`)).map(r=>{
 const g=c.goals.find((x:any)=>x.id===r.goalId),payload={ruleVersion:r.ruleVersion,goalId:g.id,shortKey:g.shortKey??'',title:normalize(g.title),titleEn:normalize(g.titleEn),description:normalize(g.description),descriptionEn:normalize(g.descriptionEn),phase:normalize(g.dimensionTags?.phase),area:normalize(g.dimensionTags?.area),topicCode:normalize(g.dimensionTags?.topicCode),nodeKind:normalize(g.nodeKind)}
 const expected=sha(JSON.stringify(stable(payload)));return {type,goalId:r.goalId,actualFingerprint:r.fingerprint,expectedFingerprint:expected,fingerprintExact:r.fingerprint===expected,decision:r.status,ownActualIndependentReviewer:r.reviewer.includes('Independent B'),memoryHasNoDeck:type!=='M'||!r.memoryUseful&&r.memoryGoalIds.length===0&&r.deckIds.length===0}
}))
const pass=(p:any)=>p.schemaPass&&p.semanticErrors.length===0&&p.goalFingerprintExact&&p.profileFingerprintExact&&p.reviewInputFingerprintExact&&p.whole394AndSubsetGoalFingerprintExact&&p.whole394AndSubsetActualPNGExact&&p.reviewRunIds.length===0&&p.status==='needs_human_review'&&p.reviewAuthority==='ai_candidate'&&p.evidenceLevel==='E1'&&p.maximumClaimScope==='G1'
const result={schemaVersion:1,ordinaryBRecordCount:campaign.records.length,ordinaryBErrors:campaign.errors,positive,atomicityMemory:am,allPassed:campaign.records.length===2&&campaign.errors.length===0&&positive.every(p=>pass(p)&&p.wholeAuthoredProfileExact)&&am.length===4&&am.every(x=>x.fingerprintExact&&x.ownActualIndependentReviewer&&x.memoryHasNoDeck),activeWrites:0,fullQARun:false}
writeFileSync(resolve(out,'native-two-b.actual-API-and-campaign-validation.json'),JSON.stringify(result,null,2)+'\n')
const word=read(resolve(context,'Word576-whole-valid-P.exact-retained.snapshot.json'))
const currentP=rows(resolve(base,'biologie-he7-ten-reviewed-integration-preparation-technical-20261008-v1/positive/current10.records.jsonl')).find((r:any)=>r.goalId===word.goalId)
const wp=pcheck(word,read(resolve(a,'existing-word-context/after/book-model.json'))),wc=await checkCampaign(resolve(a,'existing-word-context/after/round-b'))
const wresult={schemaVersion:1,ordinaryBRecordCount:wc.records.length,ordinaryBErrors:wc.errors,wholeExistingP:wp,wholeExistingRecordBodyExact:JSON.stringify(word)===JSON.stringify(currentP),actualPhysicalPdfPagesViewedBefore:3,actualPhysicalPdfPagesViewedAfter:3,scientificExistingProfileRewritten:false,allPassed:wc.records.length===1&&wc.errors.length===0&&pass(wp)&&JSON.stringify(word)===JSON.stringify(currentP),activeWrites:0,fullQARun:false}
writeFileSync(resolve(context,'context-b.actual-API-and-campaign-validation.json'),JSON.stringify(wresult,null,2)+'\n')
console.log(JSON.stringify({nativePassed:result.allPassed,D:campaign.records.length,DErrors:campaign.errors,P2:positive,A2M2:am,wordPassed:wresult.allPassed,WordErrors:wc.errors,WordP:wp}))
if(!result.allPassed||!wresult.allPassed)process.exitCode=1
