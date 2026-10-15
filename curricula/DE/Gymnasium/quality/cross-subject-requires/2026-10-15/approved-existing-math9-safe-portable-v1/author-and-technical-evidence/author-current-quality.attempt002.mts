// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync,mkdirSync,existsSync,lstatSync,unlinkSync,readdirSync,symlinkSync,readlinkSync} from 'node:fs'
import {resolve,relative,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceProfile,fingerprintPositiveGoalEvidenceReviewInput} from './isolated-root/app/scripts/positiveGoalEvidenceProfileModel'
import {fingerprintSemanticKindSourceGoal} from './isolated-root/app/scripts/goalBookModel'
import {stableJson} from './isolated-root/app/scripts/lib/crossSubjectRequiresInventory'
const out=dirname(fileURLToPath(import.meta.url)),main=resolve(out,'../../..'),root=resolve(out,'isolated-root')
const bundle='curricula/DE/Gymnasium/quality/cross-subject-requires/2026-10-15/approved-existing-math9-safe-portable-v1'
const reg='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',pp='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const hash=(b:string|Buffer)=>'sha256:'+createHash('sha256').update(b).digest('hex'),dump=(j:any)=>JSON.stringify(j,null,2)+'\n'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const bind=(p:string)=>({path:relative(main,p),bytes:readFileSync(p).length,sha256:hash(readFileSync(p))})
function parents(path:string){const p=dirname(path);if(p===root)return;parents(p);if(existsSync(p)&&lstatSync(p).isSymbolicLink()){const old=resolve(dirname(p),readlinkSync(p));unlinkSync(p);mkdirSync(p);for(const c of readdirSync(old,{withFileTypes:true}))symlinkSync(resolve(old,c.name),resolve(p,c.name),c.isDirectory()?'dir':'file')}else mkdirSync(p,{recursive:true})}
function write(path:string,raw:string){const p=resolve(root,path);parents(p);if(existsSync(p)&&lstatSync(p).isSymbolicLink())unlinkSync(p);writeFileSync(p,raw,{flag:existsSync(p)?'w':'wx'})}
function outNew(name:string,j:any){writeFileSync(resolve(out,name),dump(j),{flag:'wx'})}
const intake=read(resolve(out,'selected-nine-current-authority-and-source-limits.actual.json')),ids=new Set<string>(intake.selected.map((r:any)=>r.goalId))
assert.equal(ids.size,9);assert(!ids.has('8cdef591-6ddb-5151-8c74-a80be0271079'));assert(!ids.has('f47a7fa0-b929-5264-b038-b83fd682967f'))
const physics=read(resolve(root,pp)),byid=new Map<string,any>(physics.goals.map((g:any)=>[g.id,g])),oldPhysics=read(resolve(main,pp)),oldById=new Map<string,any>(oldPhysics.goals.map((g:any)=>[g.id,g]))
const registry=read(resolve(root,reg)),originalRegistry=structuredClone(registry),phy=registry.subjects.find((s:any)=>s.subject==='physik')
const pId='approved-existing-math9-safe-current-p-author-20261015-v1',newCfgPath=bundle+'/current-P/safe-nine.config.json',newLedgerPath=bundle+'/current-P/safe-nine.review.jsonl'
const ownerRows:any[]=[],records:any[]=[],recordProofs:any[]=[],oldGoalUnion=new Set<string>(),newOldGoalUnion=new Set<string>()
let seed:any
for(const path of phy.positiveEvidenceConfigPaths){const cfg=read(resolve(root,path));cfg.scope.goalIds.forEach((id:string)=>{assert(!oldGoalUnion.has(id),'Existing P overlap '+id);oldGoalUnion.add(id)})
 const moved=cfg.scope.goalIds.filter((id:string)=>ids.has(id));if(!moved.length){cfg.scope.goalIds.forEach((id:string)=>newOldGoalUnion.add(id));continue}
 seed??=cfg;assert.equal(cfg.reviewCriteriaPath,seed.reviewCriteriaPath)
 const ledgerRaw=readFileSync(resolve(root,cfg.reviewPath),'utf8'),lines=ledgerRaw.split(/(?<=\n)/u),parsed=lines.filter(l=>l.trim()).map(l=>({raw:l,record:JSON.parse(l)}))
 const n=String(ownerRows.length+1).padStart(2,'0'),oldCfg=bundle+`/originals/current-P/owner-${n}.config.original.json`,oldLedger=bundle+`/originals/current-P/owner-${n}.review.original.jsonl`,retained=bundle+`/current-P/retained-owner-${n}.review.jsonl`
 write(oldCfg,readFileSync(resolve(root,path),'utf8'));write(oldLedger,ledgerRaw)
 const retainedLines=parsed.filter(x=>!ids.has(x.record.goalId)).map(x=>x.raw);const remaining=cfg.scope.goalIds.filter((id:string)=>!ids.has(id));assert(remaining.length)
 assert.deepEqual(retainedLines.map(l=>JSON.parse(l).goalId).sort(),[...remaining].sort());write(retained,retainedLines.join(''))
 const next={...cfg,reviewPath:retained,scope:{...cfg.scope,goalIds:remaining}};write(path,dump(next));remaining.forEach((id:string)=>newOldGoalUnion.add(id))
 ownerRows.push({configPath:path,beforeConfig:cfg,afterConfig:next,exactOriginalConfigPath:oldCfg,exactOriginalLedgerPath:oldLedger,retainedLedgerPath:retained,movedGoalIds:moved,remainingGoalIds:remaining,allRetainedRecordLinesByteExact:true,oldReviewersTimestampsReasonsStatusesAndJudgmentsUnchanged:true})
 for(const gid of moved){const original=parsed.find(x=>x.record.goalId===gid)!.record,g=byid.get(gid),old=oldById.get(gid),digests:any={};for(const l of g.resourceLinks??[])if(l.type==='goal-visualization')digests[l.url]=hash(readFileSync(resolve(root,'app/public',l.url.slice(1))))
  assert.equal(fingerprintPositiveGoalEvidenceReviewInput(old,original.reviewCriteriaFingerprint,cfg.reviewedResourceTypes.includes('goal-visualization')?digests:{},'curricularAtomic'),original.reviewInputFingerprint)
  assert.equal(fingerprintGoalForPositiveEvidence(g,'curricularAtomic'),original.goalFingerprint);assert.equal(fingerprintPositiveGoalEvidenceProfile(original.profile),original.profileFingerprint);assert.deepEqual(original.reviewRunIds,[])
  const r={...original,reviewId:pId,reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(g,original.reviewCriteriaFingerprint,digests,'curricularAtomic'),reviewedAt:new Date().toISOString(),reviewer:'/root/portable_eight_scope_and_guard_successor_author; fresh informed safe-nine current-P AI author, not independent reviewer',reason:'Fresh author record in a real new nine-goal campaign for exact current prerequisites. Whole unchanged Goal/P, all mandatory briefs, coverage and variation and actual Math foundations are bound for fresh independent review. The original record is separately retained byte-exact; its author is not claimed to have read this current input. Profile, status, authority, evidence level and claim scope remain unchanged; the two independently disputed full11 cases are excluded.'}
  records.push(r);recordProofs.push({goalId:gid,originalRecord:original,newAuthorRecord:r,semanticGoalFingerprintUnchanged:true,profileFingerprintUnchanged:true,statusAuthorityEvidenceMaximumClaimScopeUnchanged:true,actualRequires:g.requires,wholeCurrentGoal:g})
 }
}
assert.equal(records.length,9);assert.equal(ownerRows.length,8);assert(seed)
records.sort((a,b)=>a.goalId.localeCompare(b.goalId));write(newLedgerPath,records.map(r=>JSON.stringify(r)+'\n').join(''))
const newCfg={...seed,reviewId:pId,reviewPath:newLedgerPath,reviewedResourceTypes:['goal-visualization'],reviewRunManifestPaths:[],scope:{label:'Nine safe Physics Goals: fresh current-P author campaign, original eleven-goal disputed cases excluded; pending fresh independent review',goalIds:records.map(r=>r.goalId)}}
write(newCfgPath,dump(newCfg));phy.positiveEvidenceConfigPaths.push(newCfgPath)
assert.deepEqual([...oldGoalUnion].sort(),[...new Set([...newOldGoalUnion,...ids])].sort());assert.equal([...newOldGoalUnion].filter(id=>ids.has(id)).length,0)
for(const before of originalRegistry.subjects){const after=registry.subjects.find((s:any)=>s.subject===before.subject);if(before.subject!=='physik')assert.equal(stableJson(after),stableJson(before));else assert.equal(stableJson({...after,positiveEvidenceConfigPaths:before.positiveEvidenceConfigPaths}),stableJson(before))}
assert.equal(registry.subjects.length,5);write(bundle+'/originals/five-subject-registry.original.json',readFileSync(resolve(root,reg),'utf8'));write(reg,dump(registry))
write('native-input/M7.focused.config.json',dump({...registry,reportId:'approved-existing-math9-safe-private-focused-20261015-v1',subjects:registry.subjects.filter((s:any)=>['mathematik','physik'].includes(s.subject))}))

// Bind the nine actual fresh independent Kind decisions. This is a current
// recheck backed by new reviewer/time/rationale, not an old judgment relabeled.
const kindPeerPath=resolve(main,'tmp/cross-subject-requires/approved-existing-math-edges-independent-current-P-Kind-technical-peer-20261014-v1/eleven-current-Kind.actual-independent-classifications.json')
assert.equal(hash(readFileSync(kindPeerPath)),'sha256:506dc527af7b5b2c15317162c6f9fa12d2da2693df00e44532255f0374f24dcf')
const peer=read(kindPeerPath),peerById=new Map<string,any>(peer.decisions.map((r:any)=>[r.goalId,r])),kindPath=phy.semanticKindLedgerPath,kind=read(resolve(root,kindPath)),kindBefore=structuredClone(kind),kindProofs:any[]=[]
for(const r of kind.decisions)if(ids.has(r.goalId)){const judgment=peerById.get(r.goalId),fp=fingerprintSemanticKindSourceGoal(byid.get(r.goalId));assert.equal(judgment.sourceFingerprint,fp);assert.equal(judgment.originalSourceFingerprint,r.sourceFingerprint);assert.equal(judgment.decision,'accept_curricularAtomic_for_exact_current_Goal');assert.equal(judgment.semanticKind,r.semanticKind);assert.equal(r.semanticKind,'curricularAtomic');const old={...r};r.sourceFingerprint=fp;r.decisionBasis='reviewed-current-semantic-recheck-curricular-atomic';kindProofs.push({goalId:r.goalId,originalDecision:old,currentDecision:{...r},exactFreshIndependentJudgment:judgment})}
assert.equal(kindProofs.length,9);assert.deepEqual(kind.decisions.filter((r:any)=>!ids.has(r.goalId)),kindBefore.decisions.filter((r:any)=>!ids.has(r.goalId)))
write(bundle+'/originals/physics-Kind-ledger.original.json',readFileSync(resolve(root,kindPath),'utf8'));write(bundle+'/independent-Kind/eleven-original-current-classifications.json',readFileSync(kindPeerPath,'utf8'));write(kindPath,dump(kind))
outNew('fresh-nine-current-P-campaign-and-owner-partition.actual.json',{actualAuthor:'/root/portable_eight_scope_and_guard_successor_author',recordedAtUTC:new Date().toISOString(),freshCampaignId:pId,newConfigPath:newCfgPath,newLedgerPath,records:recordProofs,owners:ownerRows,oldAndNewScopeUnionExact:true,POverlapAfter:0,oldLedgerRecordsByteExact:true,newIndependentPApprovalCreated:false,bodyStatusAuthorityEvidenceClaimScopeChanges:0})
outNew('five-subject-registry-successor-and-Kind-provenance.actual.json',{originalRegistry:bind(resolve(root,bundle+'/originals/five-subject-registry.original.json')),successorRegistry:bind(resolve(root,reg)),subjects:registry.subjects.map((s:any)=>s.subject),allFiveSubjectsPreserved:true,fourNonPhysicsEntriesStructurallyAndSerializedByteIdentical:true,onlyPhysicsEntryChange:'Append the one necessary fresh9P configuration; old owner scope partitions are separate real config changes.',KindLedger:bind(resolve(root,kindPath)),KindOriginal:bind(resolve(root,bundle+'/originals/physics-Kind-ledger.original.json')),freshIndependentKindPeer:bind(kindPeerPath),freshKindBindings:kindProofs,noHumanOrGovernmentSourceAuthority:true})
const oldNominees=read(resolve(main,'tmp/cross-subject-requires/remaining18-whole-science-author-20261014-v1/nominee-whole-reader.current.inert.json')),nomineeIds=[...new Set(intake.selected.flatMap((r:any)=>r.exactOriginalAuthorDecision.prerequisiteGoalIds))] as string[]
outNew('safe-nine-whole-Goal-P-and-Math-review-input.actual.json',{schemaVersion:1,role:'Fresh informed safe-nine whole-Goal/P review entry; excludes two disputed cases without changing their old records or P bodies',candidatePhysics:bind(resolve(root,pp)),newPConfig:bind(resolve(root,newCfgPath)),newPLedger:bind(resolve(root,newLedgerPath)),fiveSubjectRegistry:bind(resolve(root,reg)),records:recordProofs.map(r=>({...r,RequiresScientificApproval:intake.selected.find((x:any)=>x.goalId===r.goalId).exactOriginalIndependentReviewRecord,sourceAndPlacementLimits:intake.selected.find((x:any)=>x.goalId===r.goalId).sourceScopeLimits,actualKindJudgment:peerById.get(r.goalId)})),MathNominees:oldNominees.records.filter((r:any)=>nomineeIds.includes(r.goalId)),MathNomineeIds:nomineeIds,notSourcePlacementLearnerOrHumanAcceptance:true,requiredFreshIndependentReview:true})
outNew('safe-nine-quality-author-summary.actual.json',{PhysicsGoals:9,addedMathEdges:10,newPRecords:9,oldOwnerConfigsPartitioned:8,newPConfigs:1,actualFreshKindJudgmentsBound:9,fiveSubjects:5,nonPhysicsEntriesChanged:0,oldPRecordsRewritten:0,PBodyChanges:0,excludedGoals:['8cdef591-6ddb-5151-8c74-a80be0271079','f47a7fa0-b929-5264-b038-b83fd682967f'],MainWrites:false})
console.log(JSON.stringify({newPRecords:9,oldOwnerConfigsPartitioned:8,newPConfigs:1,freshKindBindings:9,fiveSubjects:5,MainWrites:false}))
