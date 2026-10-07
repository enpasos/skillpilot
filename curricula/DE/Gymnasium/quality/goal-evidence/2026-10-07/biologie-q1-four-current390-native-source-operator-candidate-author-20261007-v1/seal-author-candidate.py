# SPDX-License-Identifier: Apache-2.0
import pathlib,json,hashlib,datetime,os
ROOT=pathlib.Path('/home/enpasos/projects/skillpilot');OWN=pathlib.Path(__file__).resolve().parent;SEAL=OWN/'author.final.freeze.json';assert not SEAL.exists()
def sha(b):return hashlib.sha256(b).hexdigest()
def bind(p):b=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':sha(b),'bytes':len(b)}
inputs={}
for name in ['author-assembly-inputs-and-boundary.actual.json','native/current390-four-and-protected74.actual.validation.json','final-packet-used-inputs.author.json']:
 for row in json.loads((OWN/name).read_text())['inputs']:
  p=ROOT/row['path']
  if not p.is_file() or p.is_relative_to(OWN):continue
  actual=bind(p);assert actual['sha256']==row['sha256'],row['path'];inputs[row['path']]=actual
for name in ['AGENTS.md','docs/concept/skill-graph/atomic-goal-visualizations.md','LICENSING.md','app/scripts/goalBookSourceAtlasInputs.ts','app/scripts/goalBookModel.ts','app/scripts/exportGoalBookReviewBundle.ts','app/scripts/createGoalDescriptionReviewCampaign.ts','app/scripts/validateGoalDescriptionReviewCampaign.ts','app/scripts/materializeGoalDescriptionRolloutBatch.ts','app/scripts/renderGoalBook.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/semanticAtomicityReview.ts','app/scripts/memoryCardReview.ts','contracts/goal-evidence/v2/goal-evidence-profile.schema.json']:
 p=ROOT/name;inputs[name]=bind(p)
# Exact source input snapshots avoid treating later active integrations as changes to frozen historical author evidence.
snapshotRows=[]
for n,(path,row) in enumerate(sorted(inputs.items()),1):
 p=ROOT/path;b=p.read_bytes();assert sha(b)==row['sha256'];snap=OWN/'declared-input-snapshots'/f'{n:03}-{p.name}.bin';snap.parent.mkdir(parents=True,exist_ok=True);snap.write_bytes(b);snapshotRows.append({**bind(snap),'originalPathAtUse':path,'originalSHA256AtSeal':row['sha256'],'exactByteSnapshot':True})
index={'role':'Exact actual input byte snapshots; original paths record provenance, future active edits do not rewrite this author history','inputs':snapshotRows,'originalInputsAllMatchedAtSeal':True,'humanApproval':False}
(OWN/'declared-input-snapshot-index.actual.json').write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
payloads=[bind(p) for p in sorted(OWN.rglob('*')) if p.is_file() and p!=SEAL]
seal={'schemaVersion':1,'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Sealed current390/current95 Q1 author candidate; author is not an independent approver','payloads':payloads,'declaredInputs':snapshotRows,'originalInputChecksAtSeal':list(inputs.values()),'originalInputsAllMatchedAtSeal':True,'candidateCanonicalGoals':472,'candidateCurricularAtomicGoals':390,'existingCurrentStrictBaseline':95,'onlyFourExistingCanonicalGoalDeltas':['0daa79f6-8f61-5506-98f9-65db83062ba8','475eebb4-4eb0-524f-b1ec-4a672bf856d2','ffef97e3-12d6-5090-9816-46ab9e57fae2','e70d8a85-2dea-5165-919b-200fee9f4db4'],'newCanonicalGoalIds':[],'protected95WholeAndReviewPagesExact':True,'exactV5CompleteCases':24,'exactRetainedPCaseBriefs':8,'nativeDCampaignErrors':0,'authorNativeDRecords':0,'nativePSchemaAndActualResourceSemanticErrors':0,'nativeSourceAtlasExpected390Contract':'PASS','independentCurrentFourApprovals':False,'sourceCountryWholeHoldsRemain':True,'newRasterGeneration':0,'activeWrites':0,'historicalWrites':0,'globalBuildOrCheckRun':False,'strictGain':0,'humanApproval':False,'humanTrial':False,'licensing':'Own content CC-BY-4.0; technical author scripts/routing Apache-2.0; original third-party source rights and attribution unchanged'}
SEAL.write_text(json.dumps(seal,ensure_ascii=False,indent=2)+'\n')
for row in payloads+snapshotRows:assert bind(ROOT/row['path'])['sha256']==row['sha256'],row['path']
freezeSHA=sha(SEAL.read_bytes())
for p in OWN.rglob('*'):
 if p.is_file():os.chmod(p,0o444)
print(json.dumps({'sealPath':str(SEAL.relative_to(ROOT)),'sealSHA256':freezeSHA,'payloads':len(payloads),'declaredExactInputSnapshots':len(snapshotRows),'allPayloadsAndSnapshotInputsVerified':True,'readonlyPayloads':True,'strictGain':0,'humanApproval':False}))
