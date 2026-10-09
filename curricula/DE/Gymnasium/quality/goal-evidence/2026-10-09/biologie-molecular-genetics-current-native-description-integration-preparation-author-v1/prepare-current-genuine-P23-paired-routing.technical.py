# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,copy,hashlib,jsonschema,datetime,shutil
ROOT=Path.cwd();B=Path(__file__).resolve().parent.relative_to(ROOT);E=B.parent;ONE=E/'biologie-molecular-genetics-one-crossing-over-native-successor-preparation-author-v1'
def read(p):return json.loads(Path(p).read_text())
def rows(p):return [json.loads(s) for s in Path(p).read_text().splitlines() if s]
def bind(p):p=Path(p);assert not p.is_symlink();z=p.read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(z).hexdigest(),'bytes':len(z)}
def verify(x):
 z=bind(x['path']);assert z['sha256']=='sha256:'+x['sha256'].removeprefix('sha256:');assert z['bytes']==x['bytes'];return x['path']
def put(p,z):p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists();p.write_text(json.dumps(z,ensure_ascii=False,indent=2)+'\n')
ap=E/'biology-molecular-genetics-one-crossing-over-native-independent-a-v1/neutral-completed-native-one15-D-current-P23-and-retained-AM.independent-A.review.entry.json';bp=E/'biologie-molecular-genetics-one-crossing-over-native-successor-independent-b-v1/completed-one15-current-native-independent-b.normal-D1-P1-and-literal22.entry.json'
assert bind(ap)['sha256']=='sha256:d74028f893f6a677bc9b3c553a130b075cc896ca45111fe99912ea595753a80e';assert bind(bp)['sha256']=='sha256:5ad63798a13c29f602120d474aa13d791b29683768adcd9707031dbef853d4c4'
ae,be=read(ap),read(bp);currentEntry=read(ONE/'neutral-one15-native-successor-and-whole-case-retention.independent-review.entry.json');current={r['goalId']:r for r in rows(currentEntry['positiveRecordPath'])};assert len(current)==23
ar={r['goalId']:r for r in rows(verify(ae['normalP23Records']))};cfg=read(verify(ae['normalP23Config']));verify(ae['normalP23Run']);assert set(ar)==set(current)
br={};bsrc={};runBindings=[]
for part in be['normalCurrentP1AndLiteralP22Partitions']:
 config=read(verify(part['config']));recordPath=verify(part['records']);records=rows(recordPath);assert set(r['goalId'] for r in records)==set(part['goalIds']);
 for r in records:assert r['goalId'] not in br;br[r['goalId']]=r;bsrc[r['goalId']]={'config':part['config'],'records':part['records'],'runManifestPaths':config['reviewRunManifestPaths'],'role':part['role']}
 runBindings += [bind(p) for p in config['reviewRunManifestPaths']]
assert set(ar)==set(br)==set(current)
ps=jsonschema.Draft202012Validator(read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'));cs=jsonschema.Draft202012Validator(read('contracts/goal-evidence/v2/goal-evidence-review-config.schema.json'))
pairs=[]
for gid in current:
 a,b,c=ar[gid],br[gid],current[gid]
 for r in [a,b]:ps.validate(r);assert r['status']=='needs_human_review' and r['reviewAuthority']=='ai_candidate' and r['evidenceLevel']=='E1' and r['maximumClaimScope']=='G1';assert r['dissent']==[]
 for field in ['goalFingerprint','reviewInputFingerprint','profileFingerprint','reviewCriteriaFingerprint','profile']:assert a[field]==b[field]==c[field],(gid,field)
 assert set(a['reviewRunIds']).isdisjoint(b['reviewRunIds'])
 pairs.append({'goalId':gid,'actualIndependentA':ae['normalP23Records'],'actualIndependentB':bsrc[gid],'AReviewRunIds':a['reviewRunIds'],'BReviewRunIds':b['reviewRunIds'],'actualCriteriaFingerprint':c['reviewCriteriaFingerprint'],'actualWholeGoalFingerprint':c['goalFingerprint'],'actualCurrentReviewInputFingerprint':c['reviewInputFingerprint'],'actualWholeProfileFingerprint':c['profileFingerprint'],'wholeProfileAndAllFourBindingsEqualBothPeersAndCurrentOne15AuthorInput':True,'newOwnScienceReview':False,'humanApproval':False})
recordPath=B/'positive/P23.literal-current-independent-a.review.jsonl';assert not recordPath.exists();shutil.copyfile(verify(ae['normalP23Records']),recordPath);assert recordPath.read_bytes()==Path(ae['normalP23Records']['path']).read_bytes()
future=copy.deepcopy(cfg);future.update(landscapePath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json',semanticKindLedgerPath='curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json',reviewPath=str(recordPath));cs.validate(future);fp=B/'positive/P23.paired-current.future-active.normal.config.json';put(fp,future)
check=copy.deepcopy(future);check.update(landscapePath=currentEntry['candidateCanonicalPath'],semanticKindLedgerPath=currentEntry['candidateKindsPath']);cs.validate(check);ip=B/'positive/P23.paired-current.inactive.one15.config.json';put(ip,check)
put(B/'checks/current-genuine-P23-independent-pair-and-normal-routing.actual.json',{'schemaVersion':1,'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualCurrentNativeEntry':bind(ONE/'neutral-one15-native-successor-and-whole-case-retention.independent-review.entry.json'),'actualCurrentFull394Model':bind(currentEntry['actualFullCandidateModelPath']),'actualCurrentAuthorP23':bind(currentEntry['positiveRecordPath']),'genuineCurrentA23Entry':bind(ap),'genuineCurrentB1AndLiteral22Entry':bind(bp),'genuineCurrentA23Config':ae['normalP23Config'],'genuineCurrentA23Records':ae['normalP23Records'],'genuineCurrentA23Run':ae['normalP23Run'],'actualBRunBindings':runBindings,'actualPairedCount':23,'rows':pairs,'futureActiveNormalP23Config':bind(fp),'inactiveActualOne15FrameConfig':bind(ip),'literalExactWholeIndependentA23Records':bind(recordPath),'futureActiveConfigOnlyTargetPathsChanged':True,'actualScientificReviewBodiesUnchanged':True,'futureActiveWrites':0,'noNewScienceRunOrReviewerAliases':True,'rootMustAdoptSeparately':True,'normalSchemaErrors':[],'humanApproval':False,'strictGain':0})
print(json.dumps({'genuineCurrentPair23':len(pairs),'oneOrdinaryP23Config':str(fp),'independentARecordBytesExact':True,'normalSchemaErrors':[],'newOwnScienceReviews':0,'activeWrites':0,'strictGain':0}))
