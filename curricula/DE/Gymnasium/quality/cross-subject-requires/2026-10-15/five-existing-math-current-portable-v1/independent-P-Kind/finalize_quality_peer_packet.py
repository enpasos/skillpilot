# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,hashlib,datetime,shutil
R=Path(__file__).resolve().parents[3];O=Path(__file__).resolve().parent

def b(p):
 raw=p.read_bytes();return {'path':str(p.relative_to(R)),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
def write(n,x):(O/n).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
lock=O/'whole-five-P-Kind-content-judgments.LOCKED.json';assert b(lock)['sha256']=='f7655d3e49d9e0e2de7489cc3a25d32a8165e063317224fcfbe70b614dda5070'
checks=[]
for row in json.loads((O/'input-bindings.before-quality-lock.json').read_text()):
 now=b(R/row['path']);checks.append({'path':row['path'],'unchanged':now['bytes']==row['bytes'] and now['sha256']==row['sha256']})
assert all(c['unchanged'] for c in checks)
additional=[]
for p in [R/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',R/'app/scripts/lib/crossSubjectRequiresInventory.ts']:
 dest=O/'inputs'/p.relative_to(R);dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,dest);additional.append(b(p))
assets=json.loads((O/'actual-image-digests-readonly-no-V-opinion.json').read_text())['assets']
for a in assets:
 row=b(R/a['path']);assert 'sha256:'+row['sha256']==a['sha256'] and row['bytes']==a['bytes'];additional.append(row)
write('final-current-input-and-asset-rehash.actual.json',{'initialInputBindingsRehashed':len(checks),'allUnchanged':True,'rows':checks,'additionalNativeSchemaAndResourceBindings':additional,'newIntegrationAuthorPKindOpinionsRead':False,'newDRoundsRead':False,'imageHashReadsOnlyNoVisualJudgment':True})
nb=json.loads((O/'five-whole-proposed-P-Kind.native-bindings.actual.json').read_text());pres=json.loads((O/'all1285-active-P-complete-record-preservation.actual.json').read_text());when=datetime.datetime.now(datetime.timezone.utc).isoformat()
write('HANDOFF.actual.json',{
 'schemaVersion':1,'recordedAtUtc':when,'task':'Separate NEW genuine independent P/Kind judgments for five exact proposed Physics Goals in frozen Requires authorV2',
 'status':'BOUNDED_NEW_P_AND_KIND_CONTENT_KEEP; five private AIcandidateP wrappers; no Main/native-approved/human authority',
 'sourceAuthorV2Sha256':'900f04de8f93f099b7fe19eb1fdec9cbf8463a764710edea0b5ce93ca9e832ae',
 'contentLock':b(lock),'newOpinions':{'KindCurricularAtomicKEEP':5,'WholePProposedContextKEEP':5,'REVISE':0,'scope':'Only the exact five proposed Goal/P bodies; all16 refers to their actual unchanged authored body, not all-state source/course/placement acceptance.'},
 'individualDecisions':[{'goalId':r['goalId'],'KindDecision':r['KindDecision'],'PDecision':r['PDecision'],'newKindSourceFingerprint':r['sourceFingerprintKindProposed'],'wholeProposedGoalStableJsonSha256':r['wholeProposedGoalStableJsonSha256'],'wholeCurrentProfileStableJsonSha256':r['wholeCurrentProfileStableJsonSha256'],'profileFingerprint':r['profileFingerprint']} for r in nb['rows']],
 'nativeBindings':b(O/'five-whole-proposed-P-Kind.native-bindings.actual.json'),'newPCandidateRecords':b(O/'five-proposed-current-P.ai-candidate.review.jsonl'),
 'nativeChecks':{'officialPRecordSchema':5,'nativePSemanticHelperErrors':0,'kindSourceFingerprintsChanged':5,'PSemanticGoalFingerprintsUnchanged':5,'PReviewInputFingerprintsChanged':5,'completePAndProfileFingerprintsUnchanged':5,'exactFrozenRequiresProposedGoalPTripleChecks':5},
 'wrapperAuthority':'All5new P records are needs_human_review/ai_candidate atE1/G1. No authoritative Kind ledger is written; Kind opinions plus native source fingerprints are supplied for separate later owner selection.',
 'actualCurrentPRecordPreservation':{'all1285VsExistingV19NativeCompleteRecordFingerprintsExact':True,'selectedFiveMainRecordsStillUnchanged':pres['selectedFiveMainRecordsStillUnchanged'],'otherPhysicsMainCompleteRecordsUnchanged':pres['otherPhysicsMainCompleteRecordsUnchanged'],'MathMainCompleteRecordsUnchanged':pres['MathMainCompleteRecordsUnchanged'],'notNew1285ProfileScience':True},
 'genuineReviewExposure':'New content lock was made before reading any new integration-author P/Kind opinions or D results. Informed by own prior wholeGoal/P Requires work, its worked cases and historical author/reviewer metadata. Not blind to the old Requires author. No new quality opinions from the integration author were read for this packet.',
 'retainedObservations':['090 experimental acquisition versus supplied-data/source requirement remains separate; measurement calibration/provision is required where used.','1b7 leading-model inference and all16 authored applicability do not establish nationwide source/course placement.','215 fixed/free ideal displacement-string boundary and nonsinusoidal pulse transfer both remain;58d is not an arbitrary-function symbolic calculus claim.','b2 uses unique sine/cosine constantsC,D; phase is modulo2π and undefined for zero amplitude. This is a boundary clarification without an existing false unique-phase claim.','d18 instantaneous-vs-average derivative, fixed orientation, nonsinusoidal/corner limits and the earlier separate author-work phase clarification remain.'],
 'completePReviewExtent':'All five bilingual full Goal/P bodies; every expectation, all10 application briefs, all15 axes and unchanged complete coverage rules. Existing synthetic worked cases are reused with own prior attribution, no real learner or laboratory evidence.',
 'noNewOtherLaneAuthority':['D','A','M','V','full807/478M7','globalCI','source/placement/role changes','learning-route closure','host acceptance','human approval','learner state or consent'],
 'AMVReuse':'No old A/M/V record was installed or relabeled. Any later reuse requires actual corresponding native fingerprint and asset-byte identity. Resource hashes were read only to reproduce the three existing image-bound P owners; no image inspection or V opinion.',
 'preparationFailurePreserved':'Initial new wrapper identifier used uppercaseP and failed official schema before any record was written. The lowercase-id successor passes. Original script and failure explanation remain; content opinions and all fullP bodies are unchanged.',
 'writeBoundary':'Only this new own TMP directory. Previous Requires peer V1/V2/lock/seals unchanged. No Main/Git/Docs/CP/learner/image/D/source-view/graph writes and no child agents.',
 'portableRequiresPeer':'Not yet available in this task; it requires its own new author hash/transport comparison. This PKind packet does not relabel the earlier native Requires peer.',
 'outputManifest':'OUTPUT-MANIFEST.actual.json','seal':'SEAL.actual.json'})
parsed=0
for p in O.rglob('*'):
 if p.is_symlink():raise RuntimeError('Unexpected symlink')
 if p.is_file() and p.suffix in ['.json','.jsonl']:
  if p.suffix=='.json':json.loads(p.read_text())
  else:
   for l in p.read_text().splitlines():
    if l.strip():json.loads(l)
  parsed+=1
manifest={'schemaVersion':1,'recordedAtUtc':when,'completeJsonAndJsonlParsed':parsed,'files':[b(p) for p in sorted(O.rglob('*')) if p.is_file() and p.name not in ['OUTPUT-MANIFEST.actual.json','SEAL.actual.json']]}
write('OUTPUT-MANIFEST.actual.json',manifest)
seal={'schemaVersion':1,'recordedAtUtc':when,'handoff':b(O/'HANDOFF.actual.json'),'manifest':b(O/'OUTPUT-MANIFEST.actual.json'),'newWholePKindContentLock':b(lock),'nativeBindings':b(O/'five-whole-proposed-P-Kind.native-bindings.actual.json'),'candidatePRecords':b(O/'five-proposed-current-P.ai-candidate.review.jsonl'),'files':len(manifest['files']),'allJsonParsed':True,'noHumanOrNativeApprovedOrMainAuthority':True}
write('SEAL.actual.json',seal)
for row in manifest['files']:assert b(R/row['path'])==row
print(json.dumps({'HANDOFF':b(O/'HANDOFF.actual.json'),'SEAL':b(O/'SEAL.actual.json'),'files':len(manifest['files']),'candidatePRecords':seal['candidatePRecords']}))
