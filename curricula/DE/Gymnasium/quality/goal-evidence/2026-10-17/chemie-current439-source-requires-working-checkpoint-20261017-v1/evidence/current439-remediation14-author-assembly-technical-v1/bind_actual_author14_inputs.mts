import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeCanonicalLandscape, buildCanonicalGraphIndex } from './capsule/app/src/utils/authoring/canonicalAuthoring.ts'
import { fingerprintSemanticKindSourceGoal } from './capsule/app/scripts/goalBookModel.ts'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput, fingerprintPositiveGoalEvidenceProfile, validatePositiveGoalEvidenceRecordSemantics } from './capsule/app/scripts/positiveGoalEvidenceProfileModel.ts'
import { parseGoalBookEvidenceReviewRecord } from './capsule/app/scripts/goalBookEvidenceReviewLoader.ts'
import { aiApprovalStatus } from './capsule/app/src/utils/goalVisualizationQaStatus.ts'
const O=dirname(fileURLToPath(import.meta.url)), C=resolve(O,'capsule')
const read=async(p:string)=>JSON.parse(await readFile(p,'utf8'))
const bytesPin=async(p:string)=>{const b=await readFile(p);return {path:p,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length}}
const put=async(p:string,x:unknown)=>{await writeFile(p,JSON.stringify(x,null,2)+'\n',{flag:'wx'});return bytesPin(p)}
const plan=await read(resolve(O,'PLAN.author14.exact-prospective-change-map.json'))
const material=await read(resolve(O,'INPUTS.final-actual-P4-V4-material-pins.json'))
const R=resolve(C,plan.privateReviewRootRelativePath), N=plan.sourceRoot
const originalBase=await read(resolve(O,'original-input-history/baseConfig/base.full439.current-all-seven-HB7f.private.config.json'))
const current=await read(resolve(C,originalBase.landscapePath)), original=await read(resolve(N,originalBase.landscapePath))
const sourceGoalById=buildCanonicalGraphIndex(normalizeCanonicalLandscape(original)).goalById
const goalById=buildCanonicalGraphIndex(normalizeCanonicalLandscape(current)).goalById
const rawGoalById=new Map(current.goals.map((g:any)=>[g.id,g]))
const rawSem=await read(resolve(N,originalBase.semanticKindLedgerPath))
const sem=structuredClone(rawSem), kinds=new Map(sem.decisions.map((d:any)=>[d.goalId,d.semanticKind]))
const originalQa=await read(resolve(N,originalBase.goalVisualizationQaPath)), qa=structuredClone(originalQa)
const qaById=new Map(qa.records.map((r:any)=>[r.goalId,r]))
const originalQaById=new Map(originalQa.records.map((r:any)=>[r.goalId,r]))
const actualV=await read(material.V4ActualDelta)
const images=plan.exactImageCandidateResourceDeltas
for(const image of images){
 const q:any=qaById.get(image.goalId), old:any=originalQaById.get(image.goalId)
 const delta=actualV.records.find((r:any)=>r.goalId===image.goalId)
 if(!delta||delta.assetSha256!=='sha256:'+image.sourceImage.sha256)throw new Error('V binding mismatch '+image.goalId)
 if(old.humanApproved!=='no')throw new Error('Cannot transfer prior human approval to replacement image')
 Object.assign(q,{imageUrl:image.candidateImageUrl,publicAssetPath:image.candidatePublicAssetPath,canonicalAssetPath:image.candidateCanonicalAssetPath},delta)
 for(const key of ['humanApproved','humanIssueIdentified','humanIssueDescription','humanReviewedAt','humanReviewer'])if(JSON.stringify(q[key])!==JSON.stringify(old[key]))throw new Error('Human metadata changed')
 if(aiApprovalStatus(q)!=='approved')throw new Error('Actual stock V delta not current for image')
}
const semChanges=[]
for(const d of sem.decisions){if(plan.descriptionGoalIds.includes(d.goalId)){
 const before=d.sourceFingerprint;d.sourceFingerprint=fingerprintSemanticKindSourceGoal(rawGoalById.get(d.goalId) as any)
 semChanges.push({goalId:d.goalId,before,authorSourceFingerprint:d.sourceFingerprint,semanticKind:d.semanticKind,decisionStatus:d.decisionStatus})
}}
if(semChanges.length!==4)throw new Error('Expected four SEM source bindings')
const pText=await readFile(resolve(N,originalBase.evidenceReviewPaths[0]),'utf8')
const rawLines=pText.split(/(?<=\n)/u).filter(line=>line.trim()), beforeP=rawLines.map(line=>JSON.parse(line))
const profileSources=new Map<string,any>([
 [plan.profileGoalIds[0],await read(resolve(O,'input-copies/profile91cd/P91cd.whole-profile.targeted-permanent-dipole.author-candidate.json'))],
 [plan.profileGoalIds[1],await read(resolve(O,'input-copies/profileCf270/candidate.profile.json'))],
])
const p4=await read(material.P4ProfileFile)
for(let i=0;i<4;i++){const row=p4.profiles[i];if(row.goalId!==plan.profileGoalIds[i+2])throw new Error('P4 goal/pointer mismatch');profileSources.set(row.goalId,row.profile)}
const at=new Date().toISOString(), bindings:any[]=[], changedProfiles:string[]=[], outputLines:string[]=[]
for(let i=0;i<beforeP.length;i++){
 const old=beforeP[i]
 if(!plan.goalIds.includes(old.goalId)){outputLines.push(rawLines[i]);continue}
 const kind=kinds.get(old.goalId) as string, sourceGoal=sourceGoalById.get(old.goalId) as any, goal=goalById.get(old.goalId) as any
 const oldQ:any=originalQaById.get(old.goalId), newQ:any=qaById.get(old.goalId)
 const oldDigest=(await bytesPin(resolve(N,oldQ.publicAssetPath))).sha256
 if(oldQ.assetSha256!=='sha256:'+oldDigest)throw new Error('Stale source image digest '+old.goalId)
 const oldResources={[oldQ.imageUrl]:oldQ.assetSha256}
 const oldErrors=validatePositiveGoalEvidenceRecordSemantics(old,sourceGoal,oldResources,kind)
 if(oldErrors.length)throw new Error('Source binding invalid '+oldErrors.join('|'))
 const record=structuredClone(old)
 if(profileSources.has(old.goalId))record.profile=profileSources.get(old.goalId)
 if(JSON.stringify(record.profile)!==JSON.stringify(old.profile))changedProfiles.push(old.goalId)
 if(record.status!=='needs_human_review'||record.reviewAuthority!=='ai_candidate'||record.evidenceLevel!==old.evidenceLevel||record.maximumClaimScope!==old.maximumClaimScope)throw new Error('Candidate level/status changed')
 Object.assign(record,{
  reviewId:'chemie-remediation14-technical-author-input-20261017-v1-'+old.goalId,
  reviewedAt:at,reviewer:'Codex technical author assembly; independent scientific review pending',
  reason:'Technical author candidate assembly from exact pinned author/current profile bodies and current goal/resources. No independent D/P or A/M judgment is made here; no prior reviewer is attributed to the changed content. Original complete record is retained in the source history.',
  reviewRunIds:[],dissent:[],
  goalFingerprint:fingerprintGoalForPositiveEvidence(goal,kind),
  reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(goal,record.reviewCriteriaFingerprint,{[newQ.imageUrl]:newQ.assetSha256},kind),
  profileFingerprint:fingerprintPositiveGoalEvidenceProfile(record.profile),
 })
 parseGoalBookEvidenceReviewRecord(record,'author14 '+old.goalId)
 const errors=validatePositiveGoalEvidenceRecordSemantics(record,goal,{[newQ.imageUrl]:newQ.assetSha256},kind)
 if(errors.length)throw new Error(errors.join('|'))
 bindings.push({goalId:old.goalId,before:{goalFingerprint:old.goalFingerprint,reviewInputFingerprint:old.reviewInputFingerprint,profileFingerprint:old.profileFingerprint},
  authorCandidate:{goalFingerprint:record.goalFingerprint,reviewInputFingerprint:record.reviewInputFingerprint,profileFingerprint:record.profileFingerprint},
  changedEnvelopeFields:Object.keys(record).filter(key=>JSON.stringify(record[key])!==JSON.stringify(old[key])),profileBodyChanged:profileSources.has(old.goalId),
  status:record.status,reviewAuthority:record.reviewAuthority,evidenceLevel:record.evidenceLevel,maximumClaimScope:record.maximumClaimScope})
 outputLines.push(JSON.stringify(record)+'\n')
}
if(bindings.length!==14||changedProfiles.length!==6||changedProfiles.some(g=>!plan.profileGoalIds.includes(g)))throw new Error('Unexpected profile change set')
const profilePath=resolve(R,'P439.author14-bindings.draft.jsonl')
await writeFile(profilePath,outputLines.join(''),{flag:'wx'})
const written=(await readFile(profilePath,'utf8')).split(/(?<=\n)/u).filter(line=>line.trim())
for(let i=0;i<beforeP.length;i++)if(!plan.goalIds.includes(beforeP[i].goalId)&&written[i]!==rawLines[i])throw new Error('Other P line changed')
const semPath=resolve(R,'SEM650.same-kinds-four-description-source-bindings.author-draft.json')
const qaPath=resolve(R,'QA.four-unapproved-image-author-bindings.draft.json')
await put(semPath,sem);await put(qaPath,qa)
const result={role:'Exact author14 technical bindings and actual independent V metadata; no D/P/A/M acceptance',atUTC:at,
 goalCount:14,profileBodiesChangedExactly:changedProfiles,unchangedProfileBodyCount:433,unchangedWholeOtherPLineCount:425,
 bindings,semanticSourceBindings:semChanges,semanticKindDecisionsChanged:false,
 actualVSelector:resolve(O,'input-copies/V4/SELECTOR.four-images.independent-v.sealed.json'),
 actualVDelta:await bytesPin(material.V4ActualDelta),humanFieldsUnchanged:true,humanApproval:false,
 actualSourceWrappersArchived:true,oldReviewerMetadataNotAttributedToAuthor14:true,
 P439:await bytesPin(profilePath),SEM650:await bytesPin(semPath),QA:await bytesPin(qaPath),nativeInputsFrozen:false}
await put(resolve(O,'CHECK.actual-author14-stock-fingerprints-and-exact-profile-retention.json'),result)
console.log(JSON.stringify({goalCount:14,changedProfiles,unchangedWholeOtherPLineCount:425,bindings:bindings.map(({goalId,authorCandidate})=>({goalId,...authorCandidate})),P439:result.P439,SEM650:result.SEM650,QA:result.QA}))
