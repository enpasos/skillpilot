import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import type {LearningGoal} from '../../../../../../../../app/src/landscapeTypes';
const semanticFingerprint=(()=>{
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

return fingerprintGoal;})();
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

return fingerprintGoal;})();

const b=resolve(dirname(fileURLToPath(import.meta.url)),'..'),root=resolve(b,'../../../../../../..');
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),prior=read(resolve(b,'inputs/current-canonical.snapshot.json')),candidate=read(resolve(b,'candidate/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'));
const old=new Map(prior.goals.map((g:any)=>[g.id,g])),next=new Map(candidate.goals.map((g:any)=>[g.id,g])),ids=['05358518-f66c-5c1b-ad3f-d16211d0fc1c','9f73b963-5fac-5a90-a993-d7b7c0cc8526','e70d8a85-2dea-5165-919b-200fee9f4db4','ffef97e3-12d6-5090-9816-46ab9e57fae2'];
const outputs:any[]=[];
for(const [kind,fn,path]of [['semantic',semanticFingerprint,'app/scripts/semanticAtomicityReview.ts'],['memory',memoryFingerprint,'app/scripts/memoryCardReview.ts']]as const){
 const input=read(resolve(b,`inputs/current-${kind}-four.snapshot.json`));const rows=ids.map(id=>{const record=input.rows.find((r:any)=>r.goalId===id),before=fn(old.get(id)as any,record.ruleVersion),after=fn(next.get(id)as any,record.ruleVersion);if(record.fingerprint!==before)throw Error('Retained current fingerprint mismatch '+kind+' '+id);return{goalId:id,before,after,exactCurrentRecordMatched:true,fingerprintChanges:before!==after,currentDecisionRetained:record.status};});
 outputs.push({kind,nativeSourcePath:path,nativeSourceSha256:createHash('sha256').update(readFileSync(resolve(root,path))).digest('hex'),nativeFingerprintFunctionsByteExact:true,rows});
}
writeFileSync(resolve(b,'checks/native-A-M-fingerprint-impact.actual.json'),JSON.stringify({role:'Mechanical dependency probe only; no scientific decision or fingerprint write',outputs,scientificFreshReviewRequired:['9f73b963-5fac-5a90-a993-d7b7c0cc8526'],sourceAndPrerequisiteReviewForOtherThreeProvidedByFourNativeDContract:true,unchangedCurrentRowsMustRemainExact:true},null,2)+'\n');console.log(JSON.stringify(outputs.map(o=>({kind:o.kind,changed:o.rows.filter((r:any)=>r.fingerprintChanges).map((r:any)=>r.goalId)}))));
