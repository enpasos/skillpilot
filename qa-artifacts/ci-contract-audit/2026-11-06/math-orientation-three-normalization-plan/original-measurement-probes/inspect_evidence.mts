import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve, relative } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from '../../app/scripts/goalBookModel'
import { buildGoalDescriptionCanonicalContext } from '../../app/scripts/validateGoalDescriptionReviewCampaign'
import { fingerprintGoalDescriptionReviewContext } from '../../app/scripts/validateGoalDescriptionDualRoundResolution'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput, validatePositiveGoalEvidenceRecordSemantics } from '../../app/scripts/positiveGoalEvidenceProfileModel'

const root = process.cwd()
const output = resolve(root, 'tmp/math-orientation-normalization-review-2026-11-06')
const hash = (bytes: Uint8Array | string) => createHash('sha256').update(bytes).digest('hex')
const pins = new Map<string,string>()
function load(path:string) {
  const full = resolve(root,path), bytes=readFileSync(full)
  pins.set(relative(root, full),hash(bytes))
  return JSON.parse(bytes.toString())
}
const proof=load(output+'/proposal-and-global-proof.json')
const config=load('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json').subjects.find((s:any)=>s.subject==='mathematik')
const original=load(config.landscapePath)
assert.equal(hash(readFileSync(config.landscapePath)),proof.source.sha256)
const candidate=load(output+'/cumulative-three.candidate.json')
const ledger=load(config.semanticKindLedgerPath)
const ids=new Set<string>(proof.proposedCases.map((c:any)=>c.operation.guardGoalId))
const rows:any[]=[]
for(const goalId of ids) {
  const goal=original.goals.find((g:any)=>g.id===goalId)
  const changed=candidate.goals.find((g:any)=>g.id===goalId)
  const kind=ledger.decisions.find((d:any)=>d.goalId===goalId)
  assert.ok(kind)
  const row:any={goalId,title:goal.title,semanticKind:{ledgerPath:config.semanticKindLedgerPath,decisionStatus:kind.decisionStatus,semanticKind:kind.semanticKind,storedFingerprint:kind.sourceFingerprint,currentFingerprint:fingerprintSemanticKindSourceGoal(goal),candidateFingerprint:fingerprintSemanticKindSourceGoal(changed)},descriptionBindings:[],positiveBindings:[]}
  assert.equal(row.semanticKind.storedFingerprint,row.semanticKind.currentFingerprint)
  assert.notEqual(row.semanticKind.currentFingerprint,row.semanticKind.candidateFingerprint)
  for(const path of config.resolutionIndexPaths) {
    const index=load(path)
    for(const entry of index.resolutions.filter((r:any)=>r.goalId===goalId)) {
      const group=index.groups.find((g:any)=>g.groupId===entry.groupId)
      const groupRoot=resolve(dirname(path),group.artifactDirectory??group.groupId)
      const inputPath=resolve(groupRoot,'round-a/description-review-input.json')
      const input=load(inputPath)
      const bound=input.goals.find((g:any)=>g.goalId===goalId)
      assert.ok(bound)
      const canonical=buildGoalDescriptionCanonicalContext(goal)
      const after=buildGoalDescriptionCanonicalContext(changed)
      assert.deepEqual(bound.canonicalContext,canonical)
      assert.notDeepEqual(canonical,after)
      const afterContext={...bound,canonicalContext:after}
      row.descriptionBindings.push({indexPath:path,inputPath:relative(root,inputPath),resolutionPath:relative(root,resolve(dirname(path),entry.resolutionPath)),storedResolutionDigest:entry.resolutionDigest,currentContextEqualsAuthenticBoundInput:true,candidateContextEqualsAuthenticBoundInput:false,originalContextFingerprint:fingerprintGoalDescriptionReviewContext(bound),candidateContextFingerprint:fingerprintGoalDescriptionReviewContext(afterContext),changedCanonicalContextFields:Object.keys(canonical).filter(k=>JSON.stringify((canonical as any)[k])!==JSON.stringify((after as any)[k])),nativeEnforcement:'validateGoalDescriptionDualRoundResolution checks actual current canonicalContext equality; no new review approval is produced'})
    }
  }
  for(const path of config.positiveEvidenceConfigPaths) {
    const p=load(path)
    if(!p.scope.goalIds.includes(goalId))continue
    const raw=readFileSync(p.reviewPath,'utf8');pins.set(p.reviewPath,hash(raw))
    const records=raw.trim().split('\n').filter(Boolean).map(line=>JSON.parse(line))
    const record=records.find((r:any)=>r.goalId===goalId)
    assert.ok(record)
    const digests:Record<string,string>={}
    if(p.reviewedResourceTypes.includes('goal-visualization'))for(const link of goal.resourceLinks??[]) {
      if(link.type!=='goal-visualization')continue
      assert.ok(link.url.startsWith('/assets/goal-visualizations/'))
      const file='app/public'+link.url,bytes=readFileSync(file)
      pins.set(file,hash(bytes));digests[link.url]='sha256:'+hash(bytes)
    }
    const beforeErrors=validatePositiveGoalEvidenceRecordSemantics(record,goal,digests,kind.semanticKind)
    const afterErrors=validatePositiveGoalEvidenceRecordSemantics(record,changed,digests,kind.semanticKind)
    assert.deepEqual(beforeErrors,[])
    assert.equal(afterErrors.length,1)
    assert.ok(afterErrors[0].includes('stale reviewInputFingerprint'))
    const beforeFingerprint=fingerprintPositiveGoalEvidenceReviewInput(goal,record.reviewCriteriaFingerprint,digests,kind.semanticKind)
    const afterFingerprint=fingerprintPositiveGoalEvidenceReviewInput(changed,record.reviewCriteriaFingerprint,digests,kind.semanticKind)
    assert.equal(record.reviewInputFingerprint,beforeFingerprint)
    assert.equal(fingerprintGoalForPositiveEvidence(goal,kind.semanticKind),fingerprintGoalForPositiveEvidence(changed,kind.semanticKind))
    row.positiveBindings.push({configPath:path,reviewPath:p.reviewPath,status:record.status,reviewAuthority:record.reviewAuthority,storedReviewInputFingerprint:record.reviewInputFingerprint,currentReviewInputFingerprint:beforeFingerprint,candidateReviewInputFingerprint:afterFingerprint,goalFingerprintUnchanged:true,profileFingerprintUnchanged:true,currentNativeSemanticErrors:beforeErrors,candidateNativeSemanticErrors:afterErrors,resourceDigests:digests})
  }
  assert.equal(row.descriptionBindings.length,1)
  assert.equal(row.positiveBindings.length,1)
  rows.push(row)
}
const currentOutlookEntries=original.goals.flatMap((g:any)=>(g.extendedData?.orientationOutlook?.paths??[]).map((p:any)=>({orientationGoalId:g.id,pathId:p.id,entries:p.entryGoalIds??[]})))
const affectedOutlookEntries=currentOutlookEntries.flatMap((p:any)=>p.entries.filter((id:string)=>ids.has(id)).map((id:string)=>({...p,affectedEntryGoalId:id})))
const code=['app/scripts/goalBookModel.ts','app/scripts/goalEvidenceProfileModel.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/validateGoalDescriptionReviewCampaign.ts','app/scripts/validateGoalDescriptionDualRoundResolution.ts','backend/src/main/java/com/skillpilot/backend/service/LearnerService.java']
for(const p of code)pins.set(p,hash(readFileSync(p)))
for(const [p,h]of pins)assert.equal(hash(readFileSync(resolve(root,p))),h,'changed input '+p)
const report={schemaVersion:1,status:'private-native-fingerprint-and-authentic-input-impact-only',source:proof.source,candidatePath:relative(root,output+'/cumulative-three.candidate.json'),rows,orientationOutlook:{authoredPathCount:currentOutlookEntries.length,affectedAuthoredEntryCount:affectedOutlookEntries.length,affectedOutlookEntries},inputPins:[...pins].map(([path,sha256])=>({path,sha256})),noQaBindingsOrHashesUpdated:true,noCurrentApprovalClaimed:true,nativeScopeAndFrontierPending:true}
writeFileSync(output+'/evidence-impact.json',JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({goals:rows.length,kindFingerprintsDrift:rows.length,descriptionCanonicalContextsDrift:rows.length,positiveReviewInputsDrift:rows.length,affectedOutlookEntries:affectedOutlookEntries.length,inputPins:pins.size,noQaWrites:true}))
