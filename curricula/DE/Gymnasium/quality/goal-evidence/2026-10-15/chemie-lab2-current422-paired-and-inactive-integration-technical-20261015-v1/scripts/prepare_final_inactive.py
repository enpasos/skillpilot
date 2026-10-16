# SPDX-License-Identifier: Apache-2.0
"""Bounded data/config merge against measured319; no scientific fields refreshed."""
import copy,hashlib,json,shutil
from pathlib import Path
ROOT=Path.cwd();OWN=Path(__file__).resolve().parents[1];REL=OWN.relative_to(ROOT).as_posix()
assert not (OWN/'FILES.finite-integration.seal.json').exists()
E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/'
BASE=E+'chemie-current422-source3-lab1-bounded-inactive-integration-technical-20261015-v1'
V=E+'chemie-carbonyl-three-existing-approved-images-current422-keep-technical-20261015-v1'
PREP=E+'chemie-lab2-corrected-material-current422-native-preparation-technical-20261015-v1'
A=E+'chemie-lab2-current422-corrected-native-independent-a-20261015-v1'
CAN='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
SEM='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
QA='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
def read(p):return json.loads((ROOT/p).read_text())
def bind(p):
 b=(ROOT/p).read_bytes();return {'path':p,'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,d):(OWN/p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def cp(src,dst):shutil.copy2(ROOT/src,OWN/dst);assert (ROOT/src).read_bytes()==(OWN/dst).read_bytes()
v=read(V+'/NEUTRAL.final-current422-carbonyl3-existing-approved-KEEP.json')
assert bind(V+'/NEUTRAL.final-current422-carbonyl3-existing-approved-KEEP.json')['sha256']=='sha256:25e08445094af88fbc73122141ee5264d75570d4989ed7217a4cc038a1e5273b'
assert (ROOT/V/'FILES.finite-carbonyl3-KEEP.seal.json').is_file()
oldCan=v['sourceCurrent554']['path'];newCan=v['current554ResourceOnlyCandidate']['path']
assert bind(oldCan)==v['sourceCurrent554'] and bind(newCan)==v['current554ResourceOnlyCandidate']
before=read(oldCan);after=read(newCan);old={g['id']:g for g in before['goals']};new={g['id']:g for g in after['goals']}
vids=set(v['goalIds']);lab={'62bdb5b1-4f67-59d4-bf5c-da80ee03eeb2','e7c3d20e-4b13-560b-b8ee-c5abca8cc624'}
assert set(old)==set(new) and len(new)==554 and not vids&lab
changed=[i for i in old if old[i]!=new[i]];assert set(changed)==vids
for i in changed:assert {k:x for k,x in old[i].items() if k!='resourceLinks'}=={k:x for k,x in new[i].items() if k!='resourceLinks'}
cp(newCan,'candidate/canonical554.current422.lab2-plus-existing-carbonyl3.exact.json')
cp(BASE+'/candidate/semantic554.same-classifications.normal-address.json','candidate/semantic554.same-classifications.exact.json')
qpath=BASE+'/candidate/QA438.stock-generated-exact-normal-current422.repair-v2.json';qbefore=read(qpath);qafter=copy.deepcopy(qbefore)
vq=read(v['futureNormalAliasV3Transport']['path']);vrows={r['goalId']:r for r in vq['records']};assert set(vrows)==vids
qafter['records']=[copy.deepcopy(vrows.get(r['goalId'],r)) for r in qbefore['records']]
assert len(qafter['records'])==438
write('candidate/QA438.original-history-plus-three-exact-existing-V.json',qafter)
write('CAS.QA3.exact-existing-V-replacement-history-retained.json',{'role':'Only three original existing hash-bound V rows selected; no new votes; all historical rows retained by immutable input','wholeOriginalQa':bind(qpath),'V3OriginalSelector':bind(V+'/NEUTRAL.final-current422-carbonyl3-existing-approved-KEEP.json'),'wholeV3PathOnlyCAS':v['pathMetadataOnlyCAS'],'wholeBeforeRows':[r for r in qbefore['records'] if r['goalId'] in vids],'wholeAfterRows':[r for r in qafter['records'] if r['goalId'] in vids],'other435WholeRowsExact':all(r==s for r,s in zip(qbefore['records'],qafter['records']) if r['goalId'] not in vids),'newVotes':0})
baseCfg=BASE+'/config/central.current422.source3-lab1.final-P12.inactive.config.json';cfg=read(baseCfg);cfg['reportId']='chemie-lab2-current422-paired-plus-original-carbonyl3-inactive-20261015-v1';s=cfg['subjects'][0]
baseMap=BASE+'/checks/REBUILD.current422-final-P12.alias50-selected431.physical-map.json';mp=read(baseMap);aliases={r['normalHostAlias']:r['physicalRepositorySource']['path'] for r in mp['aliases']}
def actual(p):return aliases.get(p,p)
# Inspect the actual selected P rows, not merely config names or old packet membership.
inventory=[];overlap=[];labOverlap=[]
for p in s['positiveEvidenceConfigPaths']:
 c=read(actual(p));rp=actual(c['reviewPath']);rows=[json.loads(l) for l in (ROOT/rp).read_text().splitlines() if l]
 scope=set(c['scope']['goalIds']);hits=[r['goalId'] for r in rows if r['goalId'] in vids];lhits=[r['goalId'] for r in rows if r['goalId'] in lab]
 inventory.append({'config':bind(actual(p)),'configuredAddress':p,'actualReviewRows':bind(rp),'scopeGoalIds':c['scope']['goalIds'],'rowGoalIds':[r['goalId'] for r in rows],'carbonyl3OverlapRows':hits,'carbonyl3OverlapScope':sorted(scope&vids),'lab2OverlapRows':lhits})
 overlap+=hits;labOverlap+=lhits
assert not overlap and not labOverlap
assert all(not r['carbonyl3OverlapScope'] for r in inventory)
write('checks/P3.actual-full-current-selection-no-overlap-explicit-open.json',{'role':'Actual targeted residual/hold selection; no invented withdrawals or P refresh','baselineConfig':bind(baseCfg),'physicalAliasMap':bind(baseMap),'targetedCarbonylIds':sorted(vids),'stockFingerprintDiagnostic':v['stockVAndPInputDiagnostic'],'inspectedConfigs':inventory,'selectedCarbonylRows':overlap,'selectedCarbonylScopeEntries':[],'selectedLab2RowsBefore':labOverlap,'technicalResidualAction':'No-op: none of the three image-bound P rows or scope entries is selected by the actual319 configuration. All three P gates remain open; historical original P evidence is not refreshed or approved.','newPVotes':0})
s['positiveEvidenceConfigPaths'].append(REL+'/config/P2.original-independent-a.normal-address.config.json')
newIndex=REL+'/native-two/resolution-index.json';ni=read(newIndex);assert {r['goalId'] for r in ni['resolutions']}==lab and not ni.get('deferredGoalIds')
oldClaims=[]
for p in s['resolutionIndexPaths']:
 d=read(actual(p))
 for r in d['resolutions']:
  if r['goalId'] in lab:oldClaims.append({'index':p,'resolution':r})
assert not oldClaims
oldLab=E+'chemie-lab15-current419-paired-one-basic-laboratory-context-root-20261015-v1/native-fifteen/resolution-index.json'
li=read(oldLab);assert lab<=set(li['deferredGoalIds']) and not lab&{r['goalId'] for r in li['resolutions']}
s['resolutionIndexPaths'].append(newIndex)
write('checks/D2.exact-new-claims-old-LAB15-kept-no-false-withdrawal.json',{'role':'Actual claim ownership audit; original LAB15 whole index and old findings remain unchanged','oldLAB15Index':bind(oldLab),'wholeOldLAB15Index':li,'newD2Index':bind(newIndex),'actualOldCurrentClaimsForLab2':oldClaims,'existingLAB15Current416RecordRetainedExactly':True,'residualNeeded':False,'newSupersessionOrWithdrawalForLab2':False,'reason':'Original LAB15 index resolves only416 and defers both62b/e7. Batch membership and deferral are not current D claims; the new genuine D2 owns only those two new current claims.','newVotes':0})
write('config/central.current422.lab2-plus-existing-carbonyl3.inactive.config.json',cfg)
overrides={CAN:REL+'/candidate/canonical554.current422.lab2-plus-existing-carbonyl3.exact.json',SEM:REL+'/candidate/semantic554.same-classifications.exact.json',QA:REL+'/candidate/QA438.original-history-plus-three-exact-existing-V.json'}
for r in mp['aliases']:
 if r['normalHostAlias'] in overrides:r['physicalRepositorySource']=bind(overrides[r['normalHostAlias']])
 mpalias=r['normalHostAlias'];r['materialization']='Physical JSON/JSONL copy in new ignored sparse host only'
vmap=read(v['normalAliasesPhysicalMap']['path']);va={r['normalAlias']:r['physical'] for r in vmap['aliases']}
assets={r['goalId']:r for r in mp['selectedCurrentAssetRows']}
for i in v['goalIds']:
 r=vrows[i];assets[i]={'goalId':i,'physicalRepositorySource':va[r['canonicalAssetPath']],'normalCanonicalDestination':r['canonicalAssetPath'],'normalPublicDestination':r['publicAssetPath'],'publicMustBePhysicalWithinHostPublicRoot':True,'publicMaterialization':'physical immutable selected original PNG copy; no rewrite or generation'}
mp['selectedCurrentAssetRows']=list(assets.values());assert len(assets)==433 and len(mp['aliases'])==50
mp.update({'role':'New exact current422 LAB2 plus original approved carbonyl3 inactive central host; no prior-host writes','executionHost':'tmp/chemie-m7-resumed-20261015/lab2-and-carbonyl3-final-current422-host-v1','source319Map':bind(baseMap),'carbonyl3OriginalMap':v['normalAliasesPhysicalMap'],'buildReceiptPath':'checks/REBUILD.actual-final-central-host.json','physicalPublicSelectedCount':sum(r['publicMustBePhysicalWithinHostPublicRoot'] for r in assets.values()),'newScientificVotes':0})
write('checks/REBUILD.final-current422.alias50-selected433.physical-map.json',mp)
# Exact existing A/M/V eligibility. Central keeps their original configurations/rows.
am=[]
for p in s['semanticAtomicityConfigPaths']:
 c=read(actual(p));rows=(ROOT/actual(c['reviewPath'])).read_bytes().splitlines(keepends=True)
 for line in rows:
  r=json.loads(line)
  if r['goalId'] in lab:am.append({'goalId':r['goalId'],'config':bind(actual(p)),'sourceRows':bind(actual(c['reviewPath'])),'rowSha256':'sha256:'+hashlib.sha256(line).hexdigest(),'wholeRow':r})
mc=read(actual(s['memoryReviewConfigPath']));mrows=(ROOT/actual(mc['reviewPath'])).read_bytes().splitlines(keepends=True);mr=[]
for line in mrows:
 r=json.loads(line)
 if r['goalId'] in lab:mr.append({'goalId':r['goalId'],'sourceRows':bind(actual(mc['reviewPath'])),'rowSha256':'sha256:'+hashlib.sha256(line).hexdigest(),'wholeRow':r})
assert {r['goalId'] for r in am}==lab and len(am)==2 and len(mr)==2
assert all(r['wholeRow']['status']=='no_memory_needed' for r in mr)
labV=[r for r in qafter['records'] if r['goalId'] in lab];assert len(labV)==2
write('checks/LAB2.exact-original-A-M-V-reuse-no-new-votes.json',{'role':'Current exact reuse eligibility proof; no new gate judgement','preparedNormalChecksAndWholeBytes':bind(A+'/REUSE.existing-A-M-V-bindings-only.json'),'A2':am,'M2':mr,'V2WholeRows':labV,'twoWholeGoalsAndResourceLinksUnchanged':all(old[i]==new[i] for i in lab),'wholeNativeBundleUnchanged':bind(REL+'/CAS.native2.config-address-only-and-exact-original-copies.json'),'noNewA_M_VVotes':True,'humanApprovalCopiedToNewBytes':False,'newVotes':0})
baseline=read(BASE+'/checks/CENTRAL.current422.final-P12.stock-report.actual.json')['subjects'][0];assert len(set(baseline['strictCompleteGoalIds'])&vids)==0
write('INPUTS.carbonyl3-finite-transport-and-current319.json',{'role':'Exact finite existing V3 transport plus unchanged baseline science','neutral':bind(V+'/NEUTRAL.final-current422-carbonyl3-existing-approved-KEEP.json'),'seal':bind(V+'/FILES.finite-carbonyl3-KEEP.seal.json'),'canonicalWholeCAS':v['resourceLinksOnlyCAS'],'VPathOnlyCAS':v['pathMetadataOnlyCAS'],'originalV3InputRows':v['originalSelectedVRows'],'physicalAssetsAndPrompts':v['originalAssetAndReviewPhysicalRefs'],'normalPhysicalAssetMap':v['normalAliasesPhysicalMap'],'other551WholeGoalObjectsExact':True,'all319StrictOutsideChanged3':True,'threePGatesOpenNoNewPVotes':True,'newVotes':0})
print(json.dumps({'wholeGoals':554,'denominator':422,'P2Rows':2,'D2NewClaims':2,'oldLAB15Retained':True,'P3ActualSelectedRows':len(overlap),'V3OldVotes':3,'selectedAssets':len(assets),'physicalPublicImages':mp['physicalPublicSelectedCount'],'normalAliases':50,'all319OutsideV3':True,'centralNotRun':True}))
