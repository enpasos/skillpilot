# SPDX-License-Identifier: Apache-2.0
"""Bind only the finished original A/B2 D records; create no science votes."""
import datetime, hashlib, json, os, shutil
from pathlib import Path

REPO = Path.cwd()
OWN = Path(__file__).resolve().parents[1]
E15 = OWN.parent
NATIVE = E15/'chemie-six-inputs-three-scope-native9-final-rezeptfrei-preparation-technical-20261015-v2'
BASE = E15/'chemie-carbonyl15-equilibrium16-current422-bounded-inactive-integration-technical-20261015-v1'
A = E15/'chemie-next-nine-fresh-independent-a-20261015-v1'
B = E15/'chemie-next-nine-fresh-blind-b2-20261015-v1'

def load(p): return json.loads(p.read_text())
def ref(p):
    b=p.read_bytes()
    return {'path':p.relative_to(REPO).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def dump(p,v):
    assert not p.exists(),p
    p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def verify(r):
    p=REPO/r['path']; a=ref(p)
    assert a['sha256']==r['sha256'] and ('bytes' not in r or a['bytes']==r['bytes']),p
    return p

assert not (OWN/'native9').exists()
asel=A/'OUTPUTS.finite-independent-a.final-selector.json'
bsel=B/'SELECTION.final-normal-D9-B2.json'
assert ref(asel)['sha256']=='sha256:cdf5fe54012739aaed1dc9cffeaf33468c376d47f3aa2f472d84edafbca53921'
assert ref(bsel)['sha256']=='sha256:90eec5c8c7aabb5fe042b68563a701528caf72b0a0dff9e8d8e2ce10f38987ba'
aseal=A/'FILES.finite-independent-a.final.seal.json'
bseal=B/'FILES.finite-D9-B2.seal.json'
if not bseal.exists():
    found=[p for p in B.glob('*seal.json') if ref(p)['sha256']=='sha256:ba681c65f873a77f14b97c00c552b5514b2e5847db4fdecb020f5a50d0271355']
    assert len(found)==1; bseal=found[0]
assert ref(aseal)['sha256']=='sha256:b684aa4f944fa6ee8c851f35a428c6bcb3ce81be0736f0023b16f05fcdbb99ad'
assert ref(bseal)['sha256']=='sha256:ba681c65f873a77f14b97c00c552b5514b2e5847db4fdecb020f5a50d0271355'
ba=load(bsel)
brecords=verify(ba['normalRecords']); brun=verify(ba['normalRun'])
inventory=load(OWN/'checks/D9-reference-inventory-only.awaiting-blind-B2.json')
arecords=verify(inventory['genuineA9References']['records']); arun=verify(inventory['genuineA9References']['run'])
cfg=load(NATIVE/'config/native9.normal-prepare-only.config.json')
cfg['outputDirectory']=(OWN/'native9').relative_to(REPO).as_posix()
cfgpath=OWN/'config/native9.original-A-blind-B2.pair-only.config.json'
dump(cfgpath,cfg)
oldmanifest=load(NATIVE/'native-nine/batch-manifest.json')
manifest=dict(oldmanifest);manifest['configPath']=ref(cfgpath)['path'];manifest['configDigest']=ref(cfgpath)['sha256']
assert [k for k in oldmanifest if oldmanifest[k]!=manifest[k]]==['configPath','configDigest']
dump(OWN/'native9/batch-manifest.json',manifest)
bundle=OWN/'native9/bundle'
bundle.symlink_to(os.path.relpath(NATIVE/'native-nine/bundle',bundle.parent),target_is_directory=True)
copies=[]; rounddata={}; rundata={}
for side,records,run in [('a',arecords,arun),('b',brecords,brun)]:
    src=NATIVE/f'native-nine/round-{side}'; dst=OWN/f'native9/round-{side}'
    shutil.copytree(src,dst)
    for p in sorted(src.rglob('*')):
        if p.is_file():
            q=dst/p.relative_to(src); assert p.read_bytes()==q.read_bytes()
            copies.append({'original':ref(p),'copy':ref(q)})
    resultdir=dst/'results';resultdir.mkdir(exist_ok=True)
    assert not list(resultdir.iterdir())
    for p in [records,run]:
        q=resultdir/p.name;shutil.copyfile(p,q)
        assert p.read_bytes()==q.read_bytes()
        copies.append({'original':ref(p),'copy':ref(q)})
    rounddata[side]=[json.loads(x) for x in records.read_text().splitlines()]
    rundata[side]=load(run)
assert all(r['blindToOtherRuns'] for r in rundata.values())
assert len({r['independenceGroupId'] for r in rundata.values()})==2
assert [r['goalId'] for r in rounddata['a']]==cfg['goalIds']==[r['goalId'] for r in rounddata['b']]
assert all(r['decision']=='keep' for rows in rounddata.values() for r in rows)
scope3=cfg['goalIds'][6:]
decisions=[]
for a,b in zip(rounddata['a'],rounddata['b']):
    for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn','bookDigest','bundleFingerprint']:
        assert a[k]==b[k],(a['goalId'],k)
    limited=a['goalId'] in scope3
    de=('Technische Paarung der unveränderten echten Originale A und blind B2: beide KEEP. '
        f"Originalrecord A={a['recordId']}; B2={b['recordId']}. "
        'Die aktuelle ganze DE/EN-Beschreibung bleibt erhalten; sämtliche Originalbegründungen und Verständnis-/Leistungs-/Transferketten verbleiben unverändert in den gebundenen Originalrecords. ')
    en=('Technical pairing of unchanged genuine original A and blind B2: both KEEP. '
        f"Original record A={a['recordId']}; B2={b['recordId']}. "
        'Retain the current complete DE/EN description; all original rationales and understanding/performance/transfer chains remain unchanged in the bound original records. ')
    if limited:
        de+='Nur aktuelle engere Geltung/Seiten-/P-Supplementbindung; gültige alte Wissenschaft wiederverwendet, keine neue wissenschaftliche Inhaltsprüfung. '
        en+='Limited to current narrower applicability/page/P-supplement binding; reuse valid old science, with no new scientific content review. '
    de+='Keine neue P/A/M/V-, Quellen-/Kurs-, Human- oder ganzheitliche M7-Freigabe.'
    en+='No new P/A/M/V, source/course, human or holistic M7 approval.'
    decisions.append({'goalId':a['goalId'],'resolutionDecision':'keep_current','evidenceRound':'second','rationaleDe':de,'rationaleEn':en})
authoring={'schemaVersion':1,'manifestId':'chemie-native9-six-content-three-scope-original-A-blind-B2-20261015-v1','synthesizedBy':'Codex informed technical binder of genuine original A/B2; no independent scientific vote','decisions':decisions}
# The unchanged stock authoring contract allows this optional field only when nonempty.
deferred=[]
if deferred:authoring['deferredGoals']=deferred
dump(OWN/'native9/synthesis-authoring.json',authoring)
dump(OWN/'checks/TRANSPORT.D9-original-A-blind-B2.exact.json',{
    'role':'Exact original pairing only; exposed B1 never read or selected',
    'sourceSelectors':[ref(asel),ref(bsel)],'sourceSeals':[ref(aseal),ref(bseal)],
    'sourceNativeManifest':ref(NATIVE/'native-nine/batch-manifest.json'),'relocatedManifest':ref(OWN/'native9/batch-manifest.json'),
    'onlyNativeManifestChanges':['configPath','configDigest'],'relativeBundleSymlink':os.readlink(bundle),
    'exactCopies':copies,'allWholeBytesExact':True,'contentGoalIds':cfg['goalIds'][:6],'limitedScopeGoalIds':scope3,
    'newScientificVotes':0,'newRenders':0,'centralRuns':0,'ROOTREADY':False})

subject=load(BASE/'config/central.current422.carbonyl15-equilibrium16.inactive.final.config.json')['subjects'][0]
affected8=cfg['goalIds'][:6]+['e0d4f08a-3e67-5e2b-9c4a-06468ec5c3dd','1a51362e-fd84-5964-89b5-b435772c2149']
targets=set(cfg['goalIds']+affected8[-2:]);oldrows=[];supersessions=[]
for ordinal,path in enumerate(subject['resolutionIndexPaths']):
    p=REPO/path;j=load(p)
    resolutions=[r for r in j['resolutions'] if r['goalId'] in targets]
    deferred=[g for g in j.get('deferredGoalIds',[]) if g in targets]
    if resolutions or deferred:
        oldrows.append({'selectedIndexOrdinal':ordinal,'index':ref(p),'positiveClaims':resolutions,'historicalDeferrals':deferred,
            'deferralsAreNotCurrentPositiveClaims':True,'originalIndexAndRoundsUnmodified':True})
    for r in resolutions:
        supersessions.append({'goalId':r['goalId'],'supersededIndexPath':path,'replacementIndexPath':(OWN/'native9/resolution-index.json').relative_to(REPO).as_posix()})
assert {r['goalId'][:8] for r in supersessions}=={'b7521ac7','13838147'}
dump(OWN/'checks/OVERLAP.D9-plus-e0-1a-original-negative-scopes.json',{
    'role':'Read-only actual old index/claim/deferral intersection, no science reinterpretation',
    'nineCurrentDGoalIds':cfg['goalIds'],'twoExplicitStillOpenSourceScopeGoalIds':affected8[-2:],
    'oldSelectedIndexRows':oldrows,'preparedTwoPositiveClaimSupersessions':supersessions,
    'negativeRowPolicy':'All original negative records and deferredGoalIds remain byte-exact within their original batch/dual/synthesis. No current D claim, re-fingerprint, positive conversion or deletion for e0/1a.',
    'stockBehaviorEvidence':{'path':'app/scripts/reportDeepUnderstandingRollout.ts','claimedGoalIds':'derived only from index.resolutions (around1074)','deferralValidation':'within unchanged original dualSummary/synthesis (around1245)','currentPositiveValidation':'only each selected resolution against current canonical scope (around1255)'},
    'additionalResidualIndexNeeded':False,'reason':'Original negative scope remains historical and open; new9 current positive entries are separately bound. Only2 old positive owners require explicit supersession.',
    'newScienceVotes':0,'centralRuns':0,'ROOTREADY':False})
dump(OWN/'candidate/PREPARED.D9-original-pair.index-selection-awaiting-final-gates.json',{
    'role':'Selection fragment only; not a runnable central configuration',
    'originalResolutionIndexPaths':subject['resolutionIndexPaths'],
    'appendCurrentD9Index':(OWN/'native9/resolution-index.json').relative_to(REPO).as_posix(),
    'originalResolutionSupersessions':subject['resolutionSupersessions'],'appendSupersessions':supersessions,
    'originalResolutionWithdrawals':subject['resolutionWithdrawals'],'originalNegativeRowsRemainExact':True,
    'sourceScopeBlockedGoalsUnselected':affected8[-2:],'genuineB2Selector':ref(bsel),'ROOTREADY':False,'centralAllowed':False})
print(json.dumps({'exactDRecords':18,'genuineAandBlindB2':True,'contentGoals':6,'scopeOnlyGoals':3,'oldPositiveSupersessions':2,'originalNegativeRowsRetained':True,'centralAllowed':False}))
