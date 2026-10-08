// Apache-2.0. Exact native private fingerprint helpers copied without changes; provenance in output.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { LearningGoal } from '/home/enpasos/projects/skillpilot/app/src/landscapeTypes'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceProfile, validatePositiveGoalEvidenceRecordSemantics } from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel'
function normalizeText(value: unknown): string {
  return String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim()
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
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
    nodeKind: normalizeText(goal.nodeKind),
  })
  return `sha256:${createHash('sha256').update(payload).digest('hex')}`
}
const root='/home/enpasos/projects/skillpilot'
const here=dirname(fileURLToPath(import.meta.url))
const source=join(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-e2-twenty-bilingual-positive-author-v1')
const original=JSON.parse(readFileSync(join(source,'whole-goals.original.json'),'utf8'))
const candidate=JSON.parse(readFileSync(join(source,'whole-goals.candidate.json'),'utf8'))
const profiles=JSON.parse(readFileSync(join(source,'positive.candidates.json'),'utf8')).goals
const inertRecords=readFileSync(join(source,'positive.schema-smoke.records.inert.jsonl'),'utf8').split(/\r?\n/).filter(Boolean).map(line=>JSON.parse(line))
const aRecords=new Map(readFileSync(join(root,'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-economics-full.review.jsonl'),'utf8').split(/\r?\n/).filter(Boolean).map(line=>JSON.parse(line)).map(r=>[r.goalId,r]))
const mRecords=new Map(readFileSync(join(root,'curricula/DE/Gymnasium/quality/memory-card-review/canonical-economics-full.review.jsonl'),'utf8').split(/\r?\n/).filter(Boolean).map(line=>JSON.parse(line)).map(r=>[r.goalId,r]))
const require=createRequire(join(root,'app/package.json'));const Ajv2020=require('ajv/dist/2020').default;const addFormats=require('ajv-formats').default
const ajv=new Ajv2020({allErrors:true,strict:false});addFormats(ajv)
const schema=JSON.parse(readFileSync(join(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'),'utf8'))
const validate=ajv.compile(schema)
const errors:any[]=[]
const rows=candidate.map((g:LearningGoal,index:number)=>{
 const old=original[index];const a:any=aRecords.get(g.id);const m:any=mRecords.get(g.id);const inert=inertRecords.find(r=>r.goalId===g.id);const profile=profiles.find((r:any)=>r.goalId===g.id)
 const oldA=fingerprintGoal(old,'semantic-atomicity-v1');const newA=fingerprintGoal(g,'semantic-atomicity-v1');const oldM=fingerprintGoal(old,'memory-card-review-v1');const newM=fingerprintGoal(g,'memory-card-review-v1')
 if(a?.fingerprint!==oldA)errors.push({goalId:g.id,issue:'Existing atomicity record does not bind original exact goal'})
 if(m?.fingerprint!==oldM)errors.push({goalId:g.id,issue:'Existing memory record does not bind original exact goal'})
 if(oldA===newA||oldM===newM)errors.push({goalId:g.id,issue:'Expected EN-sensitive A/M source fingerprints to change'})
 if(inert?.status!=='needs_human_review'||inert?.reviewAuthority!=='ai_candidate'||inert?.evidenceLevel!=='E1'||inert?.maximumClaimScope!=='G1')errors.push({goalId:g.id,issue:'Untruthful author candidate authority/status'})
 if(JSON.stringify(inert.profile)!==JSON.stringify(profile.profile))errors.push({goalId:g.id,issue:'Inert wrapper profile differs from actual authored source'})
 if(!validate(inert))errors.push({goalId:g.id,schemaErrors:validate.errors})
 const semanticErrors=validatePositiveGoalEvidenceRecordSemantics(inert,g,{},'curricularAtomic');if(semanticErrors.length)errors.push({goalId:g.id,semanticErrors})
 if(inert.goalFingerprint!==fingerprintGoalForPositiveEvidence(g,'curricularAtomic'))errors.push({goalId:g.id,issue:'Native positive source goal fingerprint mismatch'})
 if(inert.profileFingerprint!==fingerprintPositiveGoalEvidenceProfile(profile.profile))errors.push({goalId:g.id,issue:'Native positive source profile fingerprint mismatch'})
 return {goalId:g.id,existingAtomicityStatus:a.status,existingMemoryStatus:m.status,oldAtomicityFingerprint:oldA,candidateAtomicityFingerprint:newA,oldMemoryFingerprint:oldM,candidateMemoryFingerprint:newM,positiveProfileNativeFingerprint:inert.profileFingerprint,authority:inert.reviewAuthority,status:inert.status,evidenceLevel:inert.evidenceLevel,maximumClaimScope:inert.maximumClaimScope,hasCurrentFinalResourceBindings:false}
})
const generatorBytes=readFileSync(join(root,'app/scripts/generateCurriculumQualityStatus.ts'));const sourceHash='sha256:'+createHash('sha256').update(generatorBytes).digest('hex')
const output={schemaVersion:1,kind:'independent-targeted-native-positive-schema-and-AM-source-binding-check',reviewer:'/root/economics_layer_a',scopeGoalCount:20,status:errors.length?'fail':'pass',schemaId:schema.$id,nativePrivateFunctionsCopiedWithoutChanges:['normalizeText','stableJson','fingerprintGoal'],nativeGeneratorSourcePath:'app/scripts/generateCurriculumQualityStatus.ts',nativeGeneratorSha256:sourceHash,actualNativePositiveImports:'app/scripts/positiveGoalEvidenceProfileModel.ts',checkedAuthorSourceProfiles:20,checkedExistingAMSourceRecords:40,expectedSuccessorAtomicityBindings:20,expectedSuccessorMemoryBindings:20,newFachlicheAtomicityOrMemoryReviewsClaimed:0,newStrictCompletions:0,rows,errors}
writeFileSync(join(here,'native-independent-candidate-check.actual.json'),JSON.stringify(output,null,2)+'\n')
console.log(JSON.stringify({status:output.status,positiveProfiles:20,existingAMSourceRecords:40,expectedAtomicitySuccessorBindings:20,expectedMemorySuccessorBindings:20,errors}))
if(errors.length)process.exitCode=1
