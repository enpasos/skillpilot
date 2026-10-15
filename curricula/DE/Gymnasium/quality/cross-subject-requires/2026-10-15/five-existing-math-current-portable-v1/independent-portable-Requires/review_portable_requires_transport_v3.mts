// SPDX-License-Identifier: Apache-2.0
import {readFileSync,writeFileSync,existsSync,mkdirSync,lstatSync,copyFileSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import {fingerprint,bytesFingerprint,stableJson} from '../../../app/scripts/lib/crossSubjectRequiresInventory.ts'
import {validateRequiresDecisions} from '../../../app/scripts/lib/crossSubjectRequiresReview.ts'
import {fingerprintPositiveGoalEvidenceProfile} from '../../../app/scripts/positiveGoalEvidenceProfileModel.ts'
const O=dirname(fileURLToPath(import.meta.url)),R=resolve(O,'../../..'),N=resolve(R,'tmp/cross-subject-requires/five-current-existing-math-quality-integration-author-20261015-v1/native-root')
const P='curricula/DE/Gymnasium/quality/cross-subject-requires/2026-10-15/five-existing-math-current-portable-v1'
const authorPath=P+'/Requires/five-portable-author.native-bound.json'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const oldRoot=resolve(R,'tmp/cross-subject-requires/five-current-existing-math-requires-successor-independent-peer-20261015-v1')
const oldAuthor=read(resolve(R,'tmp/cross-subject-requires/five-current-existing-math-requires-successor-author-20261015-v1/five-current-main-v2-explicit-P-condition.native-author-bound.inert.json'))
const oldPeer=read(resolve(oldRoot,'five-current-main-v2.native-independent-peer.inert.json'))
const qualityRoot=resolve(R,'tmp/cross-subject-requires/five-proposed-current-whole-P-Kind-independent-peer-20261015-v1')
const quality=read(resolve(qualityRoot,'five-whole-proposed-P-Kind.native-bindings.actual.json'))
const qb=new Map(quality.rows.map((r:any)=>[r.goalId,r]))
const authorBytes=readFileSync(resolve(N,authorPath)),author=JSON.parse(authorBytes.toString())
if(bytesFingerprint(authorBytes)!=='sha256:2236b88543a11f9254bf3c0dba767a0b3f8657d6156f5a9ab168e7e40184cf69')throw Error('Portable author drift')
const inventoryBytes=readFileSync(resolve(oldRoot,'current-Main-native.inventory.json'))
if(bytesFingerprint(inventoryBytes)!==author.baselineInventorySha256 || bytesFingerprint(readFileSync(resolve(R,'curricula/quality/cross-subject-requires/math-physics.inventory.json')))!==author.baselineInventorySha256)throw Error('Baseline mismatch')
const inventory=JSON.parse(inventoryBytes.toString()),watched=new Set(author.decisions.map((r:any)=>r.dependentGoalId)),rows:any[]=[],pathChecks:any[]=[],inputs:any[]=[]
const binding=(p:string)=>({path:p.startsWith(R+'/')?p.slice(R.length+1):p,bytes:readFileSync(p).length,sha256:bytesFingerprint(readFileSync(p))})
const portableFile=(p:string)=>{
 if(p.startsWith('/')||p.startsWith('tmp/')||p.includes('/tmp/')||p.includes('..'))throw Error('Nonportable active path '+p)
 const f=resolve(N,p)
 if(!existsSync(f)||lstatSync(f).isSymbolicLink())throw Error('Missing/symlink active transport target '+p)
 pathChecks.push({path:p,existsUnderPrivateNativeRoot:true,symlink:false});inputs.push(binding(f));return f
}
for(const d of author.decisions){
 const old=oldAuthor.decisions.find((x:any)=>x.dependentGoalId===d.dependentGoalId),prev=oldPeer.decisions.find((x:any)=>x.decisionId===old.decisionId),q:any=qb.get(d.dependentGoalId)
 if(!old||!prev||!q)throw Error('Unknown selection')
 for(const field of ['familyId','dependentGoalId','decision','prerequisiteGoalIds','evidenceKind','applicability','reviewInput','proposalBinding'])if(stableJson(d[field])!==stableJson(old[field]))throw Error('Substantive/native transport drift '+d.dependentGoalId+' '+field)
 if(d.decisionId!==old.decisionId.replace('-20261015-v2','-portable-20261015-v1'))throw Error('Unexpected transport decision identifier')
 const suffix=' Portable path transport successor: sourceRefs and active full-body condition paths now address exact transported repository-relative content. Substantive Goal/P/nominee/scope/edge decisions are unchanged; no new independent scientific approval is inferred from transport.'
 if(d.rationale!==old.rationale+suffix)throw Error('Unexpected transport rationale change')
 const c=d.positiveEvidenceCondition,oc=old.positiveEvidenceCondition
 const pathFields=new Set(['wholeGoalPath','wholePRecordPath','currentPOwnerConfig','currentPOwnerRecord','baselineWholeGoalPath'])
 for(const k of new Set([...Object.keys(c),...Object.keys(oc)]))if(!pathFields.has(k)&&stableJson(c[k])!==stableJson(oc[k]))throw Error('Unexpected P condition transport change '+k)
 const goal=read(portableFile(c.wholeGoalPath)),before=read(portableFile(c.baselineWholeGoalPath)),oldGoal=read(resolve(R,oc.wholeGoalPath)),oldBefore=read(resolve(R,oc.baselineWholeGoalPath)),pRecord=read(portableFile(c.wholePRecordPath)),oldPRecord=read(resolve(R,oc.wholePRecordPath))
 if(stableJson(goal)!==stableJson(oldGoal)||stableJson(before)!==stableJson(oldBefore)||stableJson(pRecord)!==stableJson(oldPRecord))throw Error('Portable exact input drift')
 if(fingerprint(goal)!==c.wholeGoalStableJsonSha256||fingerprint(before)!==c.baselineWholeGoalStableJsonSha256||fingerprint(pRecord.profile)!==c.wholeProfileStableJsonSha256||fingerprintPositiveGoalEvidenceProfile(pRecord.profile)!==c.profileFingerprint)throw Error('Exact proposed/P/native triple mismatch')
 const config=read(portableFile(c.currentPOwnerConfig))
 if(config.reviewPath!==c.currentPOwnerRecord||!config.scope.goalIds.includes(d.dependentGoalId))throw Error('New owner config mismatch')
 const ownerRows=readFileSync(portableFile(c.currentPOwnerRecord),'utf8').trim().split(/\r?\n/).map(l=>JSON.parse(l)),owner=ownerRows[c.currentPOwnerLine-1]
 if(owner.goalId!==d.dependentGoalId||stableJson(owner.profile)!==stableJson(pRecord.profile)||owner.profileFingerprint!==c.profileFingerprint||owner.reviewInputFingerprint!==q.reviewInputFingerprintProposed||owner.goalFingerprint!==q.goalFingerprintProposed||owner.reviewAuthority!=='ai_candidate'||owner.status!=='needs_human_review')throw Error('New candidate P owner context mismatch')
 for(const ref of d.sourceRefs)portableFile(ref.path)
 rows.push({goalId:d.dependentGoalId,decisionAndNomineesApplicabilityNativeProposalExact:true,rationaleExactPlusDisclosedTransportSuffix:true,decisionIdExactPortableSuffix:true,wholeBeforeGoalExact:true,wholeProposedGoalExact:true,wholeOriginalPRecordExact:true,unchangedFullPBodyAtNewCandidateOwner:true,allExplicitNewPConditionFieldsChecked:true,nativePGoalReviewInputAndProfileFingerprintsMatchOwnSeparateQualityReview:true,newCandidatePOwnerAuthority:'ai_candidate/needs_human_review',oldProposalBindingSha256:fingerprint(old.proposalBinding),newProposalBindingSha256:fingerprint(d.proposalBinding),noNewWholeFiveScientificClaim:true})
}
const peer={schemaVersion:1,role:'Same-reviewer disclosed portable transport-context Requires successor; no new independent whole-five content claim',authorLedgerSha256:bytesFingerprint(authorBytes),inventorySha256:author.baselineInventorySha256,priorScientificPeer:'curricula/DE/Gymnasium/quality/cross-subject-requires/2026-10-15/five-existing-math-current-portable-v1/inputs/original-peer/five-current-main-v2.native-independent-peer.inert.json',priorScientificPeerSha256:bytesFingerprint(readFileSync(resolve(oldRoot,'five-current-main-v2.native-independent-peer.inert.json'))),separateNewQualityEvidenceSha256:bytesFingerprint(readFileSync(resolve(qualityRoot,'HANDOFF.actual.json'))),decisions:author.decisions.map((d:any)=>{
 const old=oldAuthor.decisions.find((x:any)=>x.dependentGoalId===d.dependentGoalId)
 const prior=oldPeer.decisions.find((x:any)=>x.decisionId===old.decisionId)
 return {decisionId:d.decisionId,decision:'approved',reviewer:'/root/five_current_existing_math_requires_successor_independent_peer; same-reviewer explicit transport-context successor',rationale:'Portable transport-context confirmation after actual comparison of all exact before/proposed Goal/P inputs, unchanged substantive decision/nativeproposal fields, all explicit condition bindings and the new P candidate-owner context. This is not another independent whole-five scientific review. Prior own content judgment and the separate new P/Kind quality opinion remain attributed and unchanged. '+prior.rationale,reviewInput:d.reviewInput,proposalBindingSha256:fingerprint(d.proposalBinding),positiveEvidenceCondition:{...d.positiveEvidenceCondition,ownPortableWholeBodyAndNewOwnerContextChecked:true},scientificApprovalScope:prior.scientificApprovalScope}
})}
writeFileSync(resolve(O,'five-portable-requires.native-independent-peer.json'),JSON.stringify(peer,null,2)+'\n',{flag:'wx'})
const focus=structuredClone(inventory);for(const f of focus.families)for(const g of f.goals)g.reviewRequired=watched.has(g.goalId)
const options={independentReview:peer,authorLedgerSha256:bytesFingerprint(authorBytes),inventorySha256:author.baselineInventorySha256,reviewedInventorySha256:author.baselineInventorySha256,sourcePathExists:(p:string)=>existsSync(resolve(N,p))}
const full=validateRequiresDecisions(inventory,author,options),focused=validateRequiresDecisions(focus,author,{...options,requireComplete:true})
if(full.errors.length||focused.errors.length||focused.reviewed!==5||focused.required!==5)throw Error('Native portable binding validation failed')
const sourcePaths=[resolve(N,authorPath),resolve(oldRoot,'five-current-main-v2.native-independent-peer.inert.json'),resolve(qualityRoot,'HANDOFF.actual.json')]
for(const p of sourcePaths)inputs.push(binding(p))
for(const row of inputs){const p=resolve(R,row.path);const dest=resolve(O,'exact-inputs',row.path);mkdirSync(dirname(dest),{recursive:true});if(!existsSync(dest))copyFileSync(p,dest)}
writeFileSync(resolve(O,'portable-transport-comparison-and-native-check.actual.json'),JSON.stringify({authorArtifact:binding(resolve(N,authorPath)),actualInventoryBaseline:author.baselineInventorySha256,checks:rows,activePaths:pathChecks,normalNativeCoverage:full,focusedNativeCoverage:focused,noNewProposedInventoryOrGraphReplay:true,priorExactProposedContextProofReused:'Old native V2 proposed5/5 binding was identical and is preserved; this task does not relabel it as a fresh proposed-state or global run.',allInputs:inputs},null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({rowsCompared:rows.length,nativeNormal:full,nativeFocused:focused,authorHash:peer.authorLedgerSha256,explicitPortablePathsChecked:pathChecks.length,newScientificWholeFiveReviews:0}))
