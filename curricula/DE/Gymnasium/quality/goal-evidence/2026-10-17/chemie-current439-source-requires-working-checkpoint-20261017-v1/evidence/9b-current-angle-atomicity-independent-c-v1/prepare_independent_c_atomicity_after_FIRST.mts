import {readFileSync,writeFileSync,existsSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import assert from 'node:assert/strict'
type LearningGoal=any
const O=dirname(fileURLToPath(import.meta.url)),F='/mnt/e/skillpilot-chemie-L7-20261017/current650-all-seven-current439-native-central-preparation-technical-a-v1/capsule',C=resolve(O,'capsule')
const R='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-9b-current-angle-atomicity-independent-c-v1'
const oldBase='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-current437-paired-nine-five-gate-owner-integration-technical-20261016-v1'
const read=(p:string):any=>JSON.parse(readFileSync(p,'utf8'))
const sha=(b:any)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const pin=(p:string)=>{const b=readFileSync(p);return {path:p,sha256:sha(b),bytes:b.length}}
const write=(p:string,obj:any)=>{assert(!existsSync(p));const txt=JSON.stringify(obj,null,2)+'\n';JSON.parse(txt);writeFileSync(p,txt)}
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

const firstPath=resolve(O,'FIRST.semantic-decision.independent-c.json'),firstSeal=read(resolve(O,'SEAL.FIRST.semantic-decision.sha256.json')),first=read(firstPath)
for(const item of firstSeal.files){const actual=pin(item.path);assert.equal(actual.sha256,'sha256:'+item.sha256);assert.equal(actual.bytes,item.bytes)}
assert.equal(first.decision,'atomic');assert.equal(first.status,'ai_candidate');assert.equal(first.human,false)
const canonical=resolve(F,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),land=read(canonical),goal=land.goals.find((g:any)=>g.id===first.goalId)
const oldConfigPath=resolve(F,oldBase,'config/A-retained-009.original-review-identity.config.json'),oldLedgerPath=resolve(F,oldBase,'records/A-retained-009.whole-exact-original-lines.jsonl'),oldConfig=read(oldConfigPath),oldBytes=readFileSync(oldLedgerPath)
const lines=[...oldBytes.toString('utf8').matchAll(/.*(?:\r\n|\n|$)/g)].map(m=>m[0]).filter(Boolean).map(s=>Buffer.from(s,'utf8'))
assert.equal(lines.length,25)
const rest=Buffer.concat(lines.filter(line=>JSON.parse(line.toString()).goalId!==first.goalId));assert.equal(rest.toString().trim().split(/\r?\n/).length,24)
assert.equal(sha(rest),'sha256:638f423ba2060eda5952d150f95b87fdaef2959fcee9220f3dcb82988f394521')
const oldRow=lines.map(line=>JSON.parse(line.toString())).find((r:any)=>r.goalId===first.goalId)
const row={schemaVersion:1,reviewId:first.reviewId,ruleVersion:'semantic-atomicity-v1',landscapeId:land.landscapeId,goalId:first.goalId,
 fingerprint:fingerprintGoal(goal,'semantic-atomicity-v1'),status:'atomic',semanticAtomic:true,reviewedAt:first.reviewedAt,
 reviewer:'Codex independent C; own semantic FIRST sealed before old A input; human=false',reviewAuthority:'ai_candidate',human:false,humanApprovalClaim:false,
 reason:first.reason+' Own sealed FIRST: '+R+'/FIRST.semantic-decision.independent-c.json @ '+sha(readFileSync(firstPath))+'. Fresh current semantic anchor computed only after the independent content decision. This is an AI candidate; no human approval, M7 or activation claim.',suggestedSplit:[]}
assert.notEqual(row.reviewId,oldConfig.reviewId)
const newConfig={schemaVersion:1,reviewId:row.reviewId,ruleVersion:row.ruleVersion,landscapeId:row.landscapeId,landscapePath:'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json',
 reviewPath:R+'/records/A1.9b-current-angle.independent-c.jsonl',scope:{label:'Independent current 9b angle-only semantic atomicity; given geometry/domains are input',leafGoalIds:[first.goalId]}}
const restConfig=structuredClone(oldConfig)
restConfig.reviewPath=R+'/records/A-retained-009.rest24.exact-original-lines.jsonl'
restConfig.scope.leafGoalIds=restConfig.scope.leafGoalIds.filter((id:string)=>id!==first.goalId)
assert.equal(restConfig.scope.leafGoalIds.length,24)
assert.equal(restConfig.reviewId,oldConfig.reviewId);assert.equal(restConfig.ruleVersion,oldConfig.ruleVersion)
const restored=structuredClone(restConfig);restored.reviewPath=oldConfig.reviewPath;restored.scope.leafGoalIds=oldConfig.scope.leafGoalIds;assert.deepEqual(restored,oldConfig)
write(resolve(C,R,'config/A1.9b-current-angle.independent-c.config.json'),newConfig)
write(resolve(C,R,'config/A-retained-009.rest24.original-review-identity.config.json'),restConfig)
writeFileSync(resolve(C,newConfig.reviewPath),JSON.stringify(row)+'\n')
writeFileSync(resolve(C,restConfig.reviewPath),rest)
writeFileSync(resolve(C,R,'FIRST.semantic-decision.independent-c.json'),readFileSync(firstPath))
writeFileSync(resolve(C,R,'SEAL.FIRST.semantic-decision.sha256.json'),readFileSync(resolve(O,'SEAL.FIRST.semantic-decision.sha256.json')))
for(const name of ['CLEAN-INPUT.two-whole-current-goals.json','CLEAN-INPUT.9b-whole-current-P-line.jsonl'])writeFileSync(resolve(C,R,name),readFileSync(resolve(O,name)))
const scriptPath=resolve(F,'app/scripts/semanticAtomicityReview.ts'),script=readFileSync(scriptPath,'utf8'),a=script.indexOf('function normalizeText('),b=script.indexOf('\nfunction isLeaf(',a),sourceHelpers=script.slice(a,b)
assert.equal(readFileSync(resolve(O,'STOCK.semantic-atomicity-fingerprint-functions.exact-source.ts.txt'),'utf8'),sourceHelpers+'\n')
assert(readFileSync(fileURLToPath(import.meta.url),'utf8').includes(sourceHelpers))
const ledgerRows=rest.toString().split(/\r?\n/).filter(Boolean).map(s=>JSON.parse(s))
assert.deepEqual(ledgerRows.map((r:any)=>r.goalId).sort(),[...restConfig.scope.leafGoalIds].sort())
const result={schemaVersion:1,role:'Post-FIRST technical anchoring only; exact rest24 retained and own one-goal semantic candidate',preparedAt:new Date().toISOString(),
 firstDecisionSealedBeforeFingerprint:true,fingerprintFreshlyComputedFromCurrentGoal:true,fingerprintFunctionBodyExact:true,fingerprintSourceBodySha256:sha(sourceHelpers),
 firstPin:pin(firstPath),firstSealPin:pin(resolve(O,'SEAL.FIRST.semantic-decision.sha256.json')),
 sourcePins:[pin(canonical),pin(oldConfigPath),pin(oldLedgerPath),pin(scriptPath)],current9bFingerprint:row.fingerprint,old9bFingerprintHistoricalOnly:oldRow.fingerprint,
 old9bFingerprintNotCopied:row.fingerprint!==oldRow.fingerprint,old25Rows:25,retained24Rows:ledgerRows.length,rest24Pin:pin(resolve(C,restConfig.reviewPath)),
 expectedRest24Sha256:'sha256:638f423ba2060eda5952d150f95b87fdaef2959fcee9220f3dcb82988f394521',retained24WholeOriginalLinesUnchanged:true,retained24IdentityAndFingerprintsUnchanged:true,
 configs:[{role:'retained24',relativePath:R+'/config/A-retained-009.rest24.original-review-identity.config.json',pin:pin(resolve(C,R,'config/A-retained-009.rest24.original-review-identity.config.json'))},
 {role:'new1',relativePath:R+'/config/A1.9b-current-angle.independent-c.config.json',pin:pin(resolve(C,R,'config/A1.9b-current-angle.independent-c.config.json'))}],
 recordPins:[pin(resolve(C,newConfig.reviewPath)),pin(resolve(C,restConfig.reviewPath))],physicalCheckCapsule:C,
 originalConfigBytesUnchanged:pin(oldConfigPath).sha256===sha(readFileSync(oldConfigPath)),original25LedgerUnchanged:sha(readFileSync(oldLedgerPath))===sha(oldBytes),
 human:false,reviewAuthority:'ai_candidate',applied:false,newIndependentScienceVotes:1,fullCentralCompilerPdfRun:false}
write(resolve(O,'PREPARATION.post-FIRST.fresh-A1-and-exact-rest24.json'),result)
console.log(JSON.stringify({role:'Prepared after sealed semantic FIRST',freshCurrentFingerprint:row.fingerprint,oldFingerprintNotCopied:result.old9bFingerprintNotCopied,rest24Sha256:result.rest24Pin.sha256,configs:result.configs.map((c:any)=>c.relativePath),human:false,applied:false},null,2))
