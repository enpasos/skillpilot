from pathlib import Path
import json,hashlib,datetime
M=Path('/home/enpasos/projects/skillpilot');O=Path(__file__).resolve().parent;R=O/'isolated-root-with-current-D-v2';B=Path('curricula/DE/Gymnasium/quality/cross-subject-requires/2026-10-15/approved-existing-math9-safe-portable-v1');reg=Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
def read(p):return json.loads(p.read_text())
def dump(j):return json.dumps(j,ensure_ascii=False,indent=2)+'\n'
def bind(p):
 b=p.read_bytes();return {'path':str(p.relative_to(M)),'bytes':len(b),'sha256':'sha256:'+hashlib.sha256(b).hexdigest()}
before=read(R/reg);after=json.loads(json.dumps(before));phy=next(s for s in after['subjects'] if s['subject']=='physik');newip=str(B/'current-D/native-nine/resolution-index.json');newindex=read(R/newip);rows=read(O/'native-D-context-delta-and-two-collateral-chain-cause.actual.json')['nineRequiresOnlyContextDeltas'];assert len(newindex['resolutions'])==len(rows)==9
oldcopy=R/B/'originals/five-subject-registry.after-P-before-D.original.json';oldcopy.write_bytes((R/reg).read_bytes());phy['resolutionIndexPaths'].append(newip);edges=[]
for row in rows:
 oldip=str(Path(row['oldIndex']['path']).relative_to(Path(str(R.relative_to(M)))));assert oldip in phy['resolutionIndexPaths'];e={'goalId':row['goalId'],'supersededIndexPath':oldip,'replacementIndexPath':newip};assert not any(x==e for x in phy.get('resolutionSupersessions',[]));phy.setdefault('resolutionSupersessions',[]).append(e);edges.append(e)
for old in before['subjects']:
 now=next(x for x in after['subjects'] if x['subject']==old['subject'])
 if old['subject']!='physik':assert json.dumps(old,sort_keys=True)==json.dumps(now,sort_keys=True)
 else:
  assert now['resolutionIndexPaths'][:-1]==old['resolutionIndexPaths'];assert now['resolutionSupersessions'][:-9]==old['resolutionSupersessions']
assert len(after['subjects'])==5;(R/reg).write_text(dump(after));(R/'native-input/M7.focused.config.json').write_text(dump({**after,'reportId':'approved-existing-math9-safe-current-D-private-focused-20261015-v2','subjects':[x for x in after['subjects'] if x['subject'] in ['mathematik','physik']]}))
(O/'five-subject-registry-current-D-successor.actual.json').write_text(dump({'recordedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'beforeRegistryExact':bind(oldcopy),'successorRegistry':bind(R/reg),'actualNewNativeDIndex':bind(R/newip),'actualNineNewSupersessions':edges,'oldResolutionIndicesAndAllOldClaimsByteExact':True,'oldTwoCollateralChainsUntouched':True,'allFiveSubjectsPreserved':True,'fourNonPhysicsEntriesStructurallyAndSerializedByteIdentical':True,'onlyPhysicsKeysChangedFromMain':['positiveEvidenceConfigPaths','resolutionIndexPaths','resolutionSupersessions'],'actualDReviewers':['/root/portable_eight_scope_and_guard_successor_author','/root/eight_scope_guard_successor_independent_peer'],'configuredModelsBoth':'gpt-6.1-sol','diversityPolicy':'report_only','oldSealedInitialRootUnchanged':True,'MainWrites':False}))
print('Private five-subject registry updated with real nine D successors')
