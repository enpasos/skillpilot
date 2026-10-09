# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,hashlib,copy,jsonschema,datetime
ROOT=Path.cwd();B=Path(__file__).resolve().parent.relative_to(ROOT); E=B.parent
ONE=E/'biologie-molecular-genetics-one-crossing-over-native-successor-preparation-author-v1';entry=json.loads((ONE/'neutral-one15-native-successor-and-whole-case-retention.independent-review.entry.json').read_text());TARGET='183f3c47-ec20-5b98-8024-77ebd1c48abf'
def read(p):return json.loads(Path(p).read_text())
def rows(p):return [json.loads(s) for s in Path(p).read_text().splitlines() if s]
def bind(p):
 p=Path(p);z=p.read_bytes();assert not p.is_symlink();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(z).hexdigest(),'bytes':len(z)}
def verify(x):
 z=bind(x['path']);assert z['sha256']=='sha256:'+x['sha256'].removeprefix('sha256:');assert z['bytes']==x['bytes'];return x['path']
def write(p,x):p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
aentry=E/'biology-molecular-genetics-six-current-native-independent-a-v1/neutral-completed-native-six-D-current-P23-and-retained-AM.independent-A.review.entry.json';ae=read(aentry)
bentry=E/'biologie-molecular-genetics-six-current-native-successor-independent-b-v1/completed-native6-and-two-current-metas-independent-b.normal-current-scope-explicit-v2.entry.json';be=read(bentry)
ar={r['goalId']:r for r in rows(verify(ae['normalP23Records']))};current={r['goalId']:r for r in rows(entry['positiveRecordPath'])}
assert len(ar)==len(current)==23; verify(ae['normalP23Config']);verify(ae['normalP23Run'])
profileSchema=jsonschema.Draft202012Validator(read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'));configSchema=jsonschema.Draft202012Validator(read('contracts/goal-evidence/v2/goal-evidence-review-config.schema.json'))
pairs=[];configs=[];claims=[]
for part in be['normalCurrentP23Partitions']:
 sourceConfig=verify(part['config']); sourceRecords=verify(part['records']); config=read(sourceConfig)
 selected=[gid for gid in part['goalIds'] if gid!=TARGET]; originalLines=Path(sourceRecords).read_text().splitlines();selectedLines=[line for line in originalLines if json.loads(line)['goalId'] in selected];br={r['goalId']:r for r in map(json.loads,selectedLines)};assert set(br)==set(selected)
 for gid in selected:
  a,b,c=ar[gid],br[gid],current[gid]
  for record in [a,b]:
   profileSchema.validate(record);assert record['status']=='needs_human_review' and record['reviewAuthority']=='ai_candidate';assert record['evidenceLevel']=='E1' and record['maximumClaimScope']=='G1';assert record['dissent']==[]
  for field in ['profile','goalFingerprint','reviewInputFingerprint','profileFingerprint','reviewCriteriaFingerprint']:assert a[field]==b[field]==c[field],(gid,field)
  assert set(a['reviewRunIds']).isdisjoint(b['reviewRunIds'])
  pairs.append({'goalId':gid,'independentARecordSource':ae['normalP23Records'],'independentBRecordSource':part['records'],'independentARun':ae['normalP23Run'],'independentBRunPaths':config['reviewRunManifestPaths'],'AReviewRunIds':a['reviewRunIds'],'BReviewRunIds':b['reviewRunIds'],'currentGoalFingerprint':c['goalFingerprint'],'currentReviewInputFingerprint':c['reviewInputFingerprint'],'profileFingerprint':c['profileFingerprint'],'wholeCurrentOne15ModelDigest':read(entry['actualFullCandidateModelPath'])['digest'],'rowPairTechnicalEquality':True,'newScientificReviewClaimed':False,'humanApproval':False})
  claims.append(gid)
 role=part['role'].replace('_','-');rp=B/'positive'/(role+'.literal-selected-independent-b.review.jsonl');rp.parent.mkdir(parents=True,exist_ok=True);assert not rp.exists();rp.write_text('\n'.join(selectedLines)+'\n');assert all(line in originalLines for line in rp.read_text().splitlines())
 future=copy.deepcopy(config);future.update(landscapePath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json',semanticKindLedgerPath='curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json',reviewPath=str(rp));future['scope']={**future['scope'],'goalIds':selected};configSchema.validate(future)
 fp=B/'positive'/(role+'.future-active.normal-routing.config.json');write(fp,future)
 for run in config['reviewRunManifestPaths']:bind(run)
 configs.append({'role':part['role'],'goalIds':selected,'futureActiveNormalConfig':bind(fp),'literalSelectedRecords':bind(rp),'originalConfig':part['config'],'originalRecords':part['records'],'originalRunManifestPaths':config['reviewRunManifestPaths'],'sourceRecordsNotRewritten':True,'newReviewerAuthorityClaimed':False})
assert len(claims)==len(set(claims))==22 and set(claims)==set(current)-{TARGET}
# Preserve the existing fully operable normal author config. It is input/frame evidence, not a machine acceptance.
write(B/'positive/whole23.current-one15.author-input.normal.inactive.config.json',read(entry['positiveConfigPath']))
write(B/'current-P23-genuine-P22-routing.one15-actual-pair-pending.json',{'schemaVersion':1,'preparedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'currentNativeOne15Entry':bind(ONE/'neutral-one15-native-successor-and-whole-case-retention.independent-review.entry.json'),'currentAuthorP23Config':bind(entry['positiveConfigPath']),'currentAuthorP23Records':bind(entry['positiveRecordPath']),'genuineA23Entry':bind(aentry),'genuineBCurrent23Entry':bind(bentry),'currentPairCount22':len(pairs),'currentWhole23GoalIds':list(current),'pairedCurrent22Rows':pairs,'futureActiveNormalConfigPartitions':configs,'currentOne15NewAandBRecordsPending':True,'one15GoalId':TARGET,'old15NativeAndPSourceContextsRemainHistoricalNotCurrent':True,'genuineOne15ReviewNotInvented':True,'all23CurrentProfilesValueExact':True,'allOther371CurrentModelPagesExact':True,'currentWhole394One15ContextBound':True,'futureActiveConfigsNotAdopted':True,'activeWrites':0,'strictGain':0,'humanApproval':False})
print(json.dumps({'currentGenuineP22Pairs':22,'futureNormalConfigCount':len(configs),'currentOne15PairPending':True,'allSelectedBRecordLinesLiteralOriginal':True,'normalProfileAndConfigSchemaErrors':[],'activeWrites':0,'strictGain':0}))
