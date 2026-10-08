// Apache-2.0 technical check. Native private helpers embedded unchanged.
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import type {LearningGoal} from '/home/enpasos/projects/skillpilot/app/src/landscapeTypes'
import {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceProfile,validatePositiveGoalEvidenceRecordSemantics} from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel'

const atomicFingerprint=(()=>{
function normalizeText(value: unknown): string {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(',')}]`
  }
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

function getSemanticPayload(goal: LearningGoal, ruleVersion: string) {
  return {
    ruleVersion,
    goalId: goal.id,
    shortKey: goal.shortKey ?? '',
    title: normalizeText(goal.title),
    titleEn: normalizeText((goal as { titleEn?: string }).titleEn),
    description: normalizeText(goal.description),
    descriptionEn: normalizeText((goal as { descriptionEn?: string }).descriptionEn),
    phase: normalizeText(goal.dimensionTags?.phase),
    area: normalizeText(goal.dimensionTags?.area),
    topicCode: normalizeText(goal.dimensionTags?.topicCode),
    nodeKind: normalizeText((goal as { nodeKind?: string }).nodeKind),
  }
}

function fingerprintGoal(goal: LearningGoal, ruleVersion: string): string {
  const payload = stableJson(getSemanticPayload(goal, ruleVersion))
  return `sha256:${createHash('sha256').update(payload).digest('hex')}`
}


return fingerprintGoal
})()
const memoryFingerprint=(()=>{
function normalizeText(value: unknown): string {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(',')}]`
  }
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

function fingerprintGoal(goal: LearningGoal, ruleVersion: string): string {
  const payload = stableJson({
    ruleVersion,
    goalId: goal.id,
    shortKey: goal.shortKey ?? '',
    title: normalizeText(goal.title),
    titleEn: normalizeText((goal as { titleEn?: string }).titleEn),
    description: normalizeText(goal.description),
    descriptionEn: normalizeText((goal as { descriptionEn?: string }).descriptionEn),
    phase: normalizeText(goal.dimensionTags?.phase),
    area: normalizeText(goal.dimensionTags?.area),
    topicCode: normalizeText(goal.dimensionTags?.topicCode),
    nodeKind: normalizeText((goal as { nodeKind?: string }).nodeKind),
  })
  return `sha256:${createHash('sha256').update(payload).digest('hex')}`
}


return fingerprintGoal
})()

const root='/home/enpasos/projects/skillpilot'
const here=root+'/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-e2-bias-concept-independent-impact-review-v1'
const prep=root+'/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-e2-bias-concept-clarification-native-preparation-20261008-v1'
const oldPath=root+'/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-e2-twenty-native-preparation-technical-20261008-v2/positive-final-images.records.candidate.jsonl'
const newPath=prep+'/positive-current20-one-source-successor.records.candidate.jsonl'
const candidatePath=root+'/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-e2-bias-concept-clarification-author-v1/whole-goal.candidate.json'
const gid='eef95305-c811-50a4-9157-bfd4e5780c24'
const load=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const lines=(p:string)=>readFileSync(p,'utf8').split(/\r?\n/).filter(Boolean)
const rows=(p:string)=>lines(p).map(l=>JSON.parse(l))
const hash=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const landscape=load(root+'/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
const goals=new Map<string,LearningGoal>(landscape.goals.map((g:LearningGoal)=>[g.id,g]))
const before=goals.get(gid)!,candidate=load(candidatePath)
const changedKeys=[...new Set([...Object.keys(before),...Object.keys(candidate)])].filter(k=>JSON.stringify((before as any)[k])!==JSON.stringify(candidate[k])).sort()
const errors:any[]=[]
if(JSON.stringify(changedKeys)!==JSON.stringify(['description','descriptionEn','titleEn']))errors.push({issue:'Unexpected whole-goal field delta',changedKeys})
goals.set(gid,candidate)
const registry=load(root+'/curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
const subject=registry.subjects.find((s:any)=>s.subject==='wirtschaftswissenschaften')
const aconfig=load(root+'/'+subject.semanticAtomicityConfigPath),mconfig=load(root+'/'+subject.memoryReviewConfigPath)
const ar=rows(root+'/'+aconfig.reviewPath).find(r=>r.goalId===gid),mr=rows(root+'/'+mconfig.reviewPath).find(r=>r.goalId===gid)
const oldA=atomicFingerprint(before,ar.ruleVersion),oldM=memoryFingerprint(before,mr.ruleVersion)
const nextA=atomicFingerprint(candidate,ar.ruleVersion),nextM=memoryFingerprint(candidate,mr.ruleVersion)
if(ar.fingerprint!==oldA)errors.push({issue:'Registered atomicity record stale on current before goal',expected:oldA,actual:ar.fingerprint})
if(mr.fingerprint!==oldM)errors.push({issue:'Registered memory record stale on current before goal',expected:oldM,actual:mr.fingerprint})
if(ar.status!=='atomic'||mr.status!=='no_memory_needed')errors.push({issue:'Unexpected current substantive A/M decisions'})
if(oldA===nextA||oldM===nextM)errors.push({issue:'Expected targeted A/M text binding delta absent'})
const oldLines=lines(oldPath),newLines=lines(newPath),old=oldLines.map(l=>JSON.parse(l)),next=newLines.map(l=>JSON.parse(l))
if(old.length!==20||next.length!==20)errors.push({issue:'Expected exactly20 P records'})
const require=createRequire(root+'/app/package.json');const Ajv=require('ajv/dist/2020').default;const addFormats=require('ajv-formats').default
const ajv=new Ajv({allErrors:true,strict:false});addFormats(ajv)
const validate=ajv.compile(load(root+'/contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
const pchecks=next.map((r:any,i:number)=>{
 const b=old[i],g=goals.get(r.goalId)!;const resources:Record<string,string>={}
 for(const link of (g as any).resourceLinks??[])if(link.type==='goal-visualization'){const url=link.url;resources[url]=hash(root+'/app/public'+url)}
 const sameProfile=JSON.stringify(b.profile)===JSON.stringify(r.profile)
 if(b.goalId!==r.goalId||!sameProfile)errors.push({goalId:r.goalId,issue:'Positive scope/order or actual profile content changed'})
 const byteEqual=oldLines[i]===newLines[i]
 if(r.goalId!==gid&&!byteEqual)errors.push({goalId:r.goalId,issue:'Unchanged P record not byte-exact'})
 const delta=Object.keys(r).filter(k=>JSON.stringify(r[k])!==JSON.stringify(b[k])).sort()
 if(r.goalId===gid&&JSON.stringify(delta)!==JSON.stringify(['goalFingerprint','reviewInputFingerprint']))errors.push({goalId:r.goalId,issue:'Unexpected P wrapper delta',delta})
 if(!validate(r))errors.push({goalId:r.goalId,schema:validate.errors})
 const sem=validatePositiveGoalEvidenceRecordSemantics(r,g,resources,'curricularAtomic');if(sem.length)errors.push({goalId:r.goalId,nativeSemanticErrors:sem})
 if(r.goalFingerprint!==fingerprintGoalForPositiveEvidence(g,'curricularAtomic')||r.profileFingerprint!==fingerprintPositiveGoalEvidenceProfile(r.profile))errors.push({goalId:r.goalId,issue:'Native P fingerprint mismatch'})
 if(r.reviewAuthority!=='ai_candidate'||r.status!=='needs_human_review'||r.evidenceLevel!=='E1'||r.maximumClaimScope!=='G1')errors.push({goalId:r.goalId,issue:'Unexpected stronger P claim'})
 return {goalId:r.goalId,actualProfileIdentical:sameProfile,wholeRecordByteExact:byteEqual,changedWrapperFields:delta,profileFingerprint:r.profileFingerprint,resourceDigests:resources,nativeSchemaAndSemanticsPass:!sem.length&&validate(r)}
})
const cards=rows(root+'/'+mconfig.cardReviewPath).filter(r=>(r.originGoalIds??[]).includes(gid))
if(cards.length)errors.push({issue:'No-memory goal unexpectedly has card origin bindings',cards})
const now=new Date().toISOString()
const parityReason='The full DE/EN competence and whole unchanged P were actually independently reread on 2026-10-08. Applying the concepts clarifies the already claimed contextual bias analysis; no competence, prerequisite, scope, required demonstration or memory strategy is added. Preserve the original substantive A/M judgement; targeted successor source binding only. Actual receipt: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-e2-bias-concept-independent-impact-review-v1/independent-whole-profile-and-AM-impact.receipt.json'
const successors={atomicity:{...ar,fingerprint:nextA,reviewedAt:'2026-10-08',reviewer:'retained prior content reviewer; /root/economics_layer_a targeted concept-clarification semantic parity',reason:ar.reason+' '+parityReason},memory:{...mr,fingerprint:nextM,reviewedAt:'2026-10-08',reviewer:'retained prior content reviewer; /root/economics_layer_a targeted concept-clarification semantic parity',reason:mr.reason+' '+parityReason}}
const out={schemaVersion:1,kind:'independent-targeted-concept-clarification-native-impact-check',checkedAt:now,agentIdentity:'/root/economics_layer_a',status:errors.length?'FAIL':'PASS',targetGoalId:gid,actualChangedGoalFields:changedKeys,candidateWholeGoalDigest:hash(candidatePath),oldPositiveLedgerDigest:hash(oldPath),candidatePositiveLedgerDigest:hash(newPath),positiveProfileCount:20,unchangedActualProfiles:pchecks.filter(r=>r.actualProfileIdentical).length,byteExactUnchangedPRecords:pchecks.filter(r=>r.wholeRecordByteExact).length,atomicitySourceRecord:ar,memorySourceRecord:mr,oldAtomicityFingerprint:oldA,newAtomicityFingerprint:nextA,oldMemoryFingerprint:oldM,newMemoryFingerprint:nextM,cardOriginBindingsForNoMemoryGoal:cards.length,nativePrivateHelpersCopiedWithoutChanges:{atomicity:hash(root+'/app/scripts/semanticAtomicityReview.ts'),memory:hash(root+'/app/scripts/memoryCardReview.ts')},newFullFachlicheAMReviewsClaimed:0,newStrictClosures:0,pchecks,errors}
writeFileSync(here+'/native-positive20-and-two-AM-successor-bindings.actual.json',JSON.stringify(out,null,2)+'\n')
if(!errors.length){writeFileSync(here+'/atomicity.single-successor.inert.jsonl',JSON.stringify(successors.atomicity)+'\n');writeFileSync(here+'/memory.single-successor.inert.jsonl',JSON.stringify(successors.memory)+'\n')}
console.log(JSON.stringify({status:out.status,P:20,actualProfilesUnchanged:out.unchangedActualProfiles,byteExactP:out.byteExactUnchangedPRecords,A:1,M:1,errors}))
if(errors.length)process.exitCode=1
