# SPDX-License-Identifier: Apache-2.0
"""Execute the nineteen V4 source operations on independent in-memory V2 copies."""
import copy
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[9]
OUT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18'
AUTHOR = BASE / 'chemie-current450-recycling-three-atomic-partials-author-20261018-v4'
CHECKS = []
PINS = {}

def sha(obj):
    return hashlib.sha256(json.dumps(obj,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()

def pin(path):
    p=Path(path)
    if not p.is_absolute(): p=ROOT/p
    b=p.read_bytes()
    r=dict(path=str(p.relative_to(ROOT)),sha256=hashlib.sha256(b).hexdigest(),bytes=len(b))
    PINS[r['path']]=r
    return r

def read(path):
    pin(path)
    return json.loads(Path(path if Path(path).is_absolute() else ROOT/path).read_text())

def check(name, ok, detail=None):
    CHECKS.append(dict(check=name,passed=bool(ok),**({'detail':detail} if detail is not None else {})))

def ptr(o,p):
    if not p: return o
    for k in p.strip('/').split('/'):
        k=k.replace('~1','/').replace('~0','~')
        o=o[int(k)] if isinstance(o,list) else o[k]
    return o

def put(o,p,v):
    parent,k=p.rsplit('/',1); a=ptr(o,parent)
    a[int(k) if isinstance(a,list) else k]=copy.deepcopy(v)

def scientific(o,p=''):
    result=[]
    if isinstance(o,dict):
        for k,v in o.items():
            q=p+'/'+k
            result.extend([(q,v)] if 'scientific' in k.lower() else scientific(v,q))
    elif isinstance(o,list):
        for i,v in enumerate(o):result.extend(scientific(v,p+'/'+str(i)))
    return result

for r in read(AUTHOR/'INPUTS.actual-pins.json')['inputs']:
    a=pin(r['path']);check('declared input exact: '+r['path'].split('/')[-1],all(a[k]==r[k] for k in ['sha256','bytes']))
seal=read(AUTHOR/'SEAL.author-three-atomic-partials.pending-independent-review.json')
for r in seal['outputs']:
    a=pin(r['path']);check('author seal output exact: '+r['path'].split('/')[-1],all(a[k]==r[k] for k in ['sha256','bytes']))
# The later atlas check is an additional input; the author's five-output seal does not list it.
atlaspath=AUTHOR/'CHECK.actual-production-source-atlas-narrow-atomic-boundaries.json'
pin(atlaspath)
check('later author atlas receipt separately pinned',str(atlaspath.relative_to(ROOT)) not in [r['path'] for r in seal['outputs']])
overlay=read(AUTHOR/'AUTHOR.three-existing-atomic-partials.CAS.pending.json')
check('direct V2 transaction, without extra V3 overlay',overlay['applyDirectlyToV2'] is True and overlay['doNotAlsoApplyUnactivatedV3Overlay'] is True)
original={o['targetPath']:read(ROOT/o['targetPath']) for o in overlay['operations']}
after=copy.deepcopy(original)
check('exactly19 operations over exactly2 V2 artifacts',len(overlay['operations'])==19 and len(original)==2)
for i,o in enumerate(overlay['operations']):
    check('operation base pin '+str(i),pin(o['targetPath'])['sha256']==o['targetFileSHA256'])
    target=after[o['targetPath']];current=ptr(target,o['jsonPointer'])
    if o['operation']=='replace_exact_value':
        check('strict replace before '+str(i),current==o['before'])
        put(target,o['jsonPointer'],o['after'])
    elif o['operation']=='append_exact_absent_record':
        check('strict absent append before '+str(i),sha(current)==o['beforeArraySHA256'] and len(current)==o['beforeArrayLength'] and o['insertIndex']==len(current) and o['record'] not in current)
        current.append(copy.deepcopy(o['record']))
    else:check('known CAS operation '+str(i),False)
sourcepath=next(p for p in original if p.endswith('source-whole-array-and-clause.exact-CAS.pending.json'))
memberpath=next(p for p in original if p.endswith('AUTHOR.all-direct-members-of-eleven-unions.pending.json'))
s0,s1=original[sourcepath],after[sourcepath]
m0,m1=original[memberpath],after[memberpath]
bindings=read(AUTHOR/'AUTHOR.whole-source-cluster-atomic-P-bindings.pending.json')['bindings']
expected={b['sourceGoalId']:b['atomicTargetId'] for b in bindings}
check('exactly original three inventory components', [b['inventoryIndex'] for b in bindings]==[32,87,92])
check('all94 other member decisions exact',len(m0['memberDecisions'])==97 and len(m1['memberDecisions'])==97 and all(a==b for i,(a,b) in enumerate(zip(m0['memberDecisions'],m1['memberDecisions'])) if i not in [14,45,58]))
check('exactly76 false removals and3 preserved atomic refinements',m1['removedDirectEdgeCount']==76 and sum(r['decision']=='remove_false_direct_contribution_only' for r in m1['memberDecisions'])==76 and sum(r['decision']=='refine_supported_cluster_partial_to_existing_atomic_carrier' for r in m1['memberDecisions'])==3)
check('member metadata except3 entries/count exact',{k:v for k,v in m0.items() if k not in ['memberDecisions','removedDirectEdgeCount']}=={k:v for k,v in m1.items() if k not in ['memberDecisions','removedDirectEdgeCount']})
check('other8 complete union aliases exact',all(a==b for i,(a,b) in enumerate(zip(s0['wholeChangedUnions'],s1['wholeChangedUnions'])) if i not in [3,5,6]))
for mapidx,decidx,changedrows in [(4,5,[96]),(8,9,[436,652])]:
    oldmaps,newmaps=s0['operations'][mapidx]['after'],s1['operations'][mapidx]['after']
    olddecs,newdecs=s0['operations'][decidx]['after'],s1['operations'][decidx]['after']
    check('whole prepared mapping prefix exact '+str(mapidx),newmaps[:len(oldmaps)]==oldmaps and len(newmaps)-len(oldmaps)==len(changedrows))
    check('all other prepared decisions exact '+str(decidx),len(olddecs)==len(newdecs) and all(a==b for i,(a,b) in enumerate(zip(olddecs,newdecs)) if i not in changedrows))
    for di in changedrows:
        d=newdecs[di];sid=d['sourceGoalId'];atom=expected[sid]
        check('one direct partial pair for '+sid,sum(r['legacyGoalId']==sid and r['canonicalGoalId']==atom and r['matchType']=='partial' for r in newmaps)==1)
        check('source decision adds only bounded atom '+sid,d['canonicalGoalIds']==olddecs[di]['canonicalGoalIds']+[atom] and all(d['boundedAtomicPartialContributions'][0][k] is False for k in ['wholeGoalCoverageClaim','wholeSourceCompletionClaim','inheritedSiblingCoverageClaim']))
        alias=next(u for u in s1['wholeChangedUnions'] if u['sourceGoalId']==sid)
        check('coherent whole array and decision aliases '+sid,alias['afterWholeDecision']==d and alias['afterWholeDirectUnion']==[r for r in newmaps if r['legacyGoalId']==sid] and alias['reasonDe']==d['rationale'])
        oldcluster=next(b['formerClusterId'] for b in bindings if b['sourceGoalId']==sid)
        check('broad cluster absent in proposed direct pair '+sid,all(r['canonicalGoalId']!=oldcluster for r in alias['afterWholeDirectUnion']))
check('all unrelated complete source operations exact',all(a==b for i,(a,b) in enumerate(zip(s0['operations'],s1['operations'])) if i not in [4,5,8,9]))
check('all outer source CAS fields except arrays/aliases exact',{k:v for k,v in s0.items() if k not in ['operations','wholeChangedUnions']}=={k:v for k,v in s1.items() if k not in ['operations','wholeChangedUnions']})
check('all existing ScientificRef fields exact',scientific(s0)==scientific(s1),{'fieldCount':len(scientific(s0))})
canonical=read(ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
goals={g['id']:g for g in canonical['goals']}
currentp=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-post-CI-description-resumption-20261018-v1/P450.exact-selected-current-records.review.jsonl'
pin(currentp)
ps={r['goalId']:r for r in map(json.loads,currentp.read_text().splitlines())}
for b in bindings:
    label=str(b['inventoryIndex'])
    check('actual whole current cluster '+label,goals[b['formerClusterId']]==b['wholeCurrentClusterGoal'])
    check('actual whole current atomic goal '+label,goals[b['atomicTargetId']]==b['wholeCurrentAtomicGoal'])
    check('actual selected whole current P '+label,ps[b['atomicTargetId']]==b['wholeSelectedAtomicP'])
    check('atomic partial, no manufactured whole credit '+label,b['partialOnly'] is True and goals[b['atomicTargetId']]['contains']==[] and goals[b['atomicTargetId']]['type']=='atomic')
    c=b['wholeSelectedAtomicP']['profile']['coverageExpectations']
    check('unchanged min2/fresh/independent P '+label,c['minimumIndependentDemonstrations']==2 and c['freshVariationRequired'] and c['independentTransferRequired'])
    for loc in b['wholeSourceObjects']:
        src=read(ROOT/loc['file']['path']);obj=ptr(src,loc['jsonPointer'])
        check('actual whole original source object '+label,obj==loc['object'] and sha(obj)==loc['wholeObjectSHA256'])

# Old own scientific findings and every output covered by their seals must remain literal.
ownseals=[OUT.parent/'SEAL.independent-c.json',OUT.parent/'v3-addendum/SEAL.independent-c-v3-addendum.json',BASE/'chemie-current450-SN-aluminium-existing-carriers-independent-c-20261018-v1/SEAL.independent-c.json']
for sealpath in ownseals:
    oldseal=read(sealpath)
    for r in oldseal.get('outputs',oldseal.get('outputPins',[])):
        a=pin(r['path']);check('earlier own sealed output unchanged: '+r['path'],all(a[k]==r[k] for k in ['sha256','bytes']))
for p in AUTHOR.iterdir():
    if p.is_file():pin(p)
for p in ['curricula/DE/Gymnasium/input/MV/Chemie_Gymnasium_11_12_Erprobungsfassung.pdf','curricula/DE/Gymnasium/input/SL/Chemie_GOS_Grundkurs_2023_ab_2027_red_2025.pdf','curricula/DE/Gymnasium/input/SL/Chemie_GOS_Leistungskurs_2023_ab_2027_red_2025.pdf','app/scripts/goalBookSourceAtlasInputs.ts','app/scripts/goalBookModel.ts','app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json','curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json','curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-energy-four-context-satisfied-current422-positive-and-atomic-informed-20261015-v1/materials/four-whole-cases8.targeted-informed-successor.json']:
    pin(p)
(OUT/'checks').mkdir(exist_ok=True)
(OUT/'checks/actual-in-memory-CAS.json').write_text(json.dumps(dict(role='INDEPENDENT_C_ACTUAL_V4_CAS',passed=all(r['passed'] for r in CHECKS),exactOperationsExecuted=19,checks=CHECKS,finalCASArtifactSemanticSHA256=sha(s1),finalMemberArtifactSemanticSHA256=sha(m1),normalFilesWritten=False),ensure_ascii=False,indent=2)+'\n')
(OUT/'INPUTS.actual-pins.json').write_text(json.dumps(dict(role='INDEPENDENT_C_V4_INPUT_PINS',pins=sorted(PINS.values(),key=lambda r:r['path'])),ensure_ascii=False,indent=2)+'\n')
print(json.dumps(dict(passed=all(r['passed'] for r in CHECKS),checks=len(CHECKS),failures=[r for r in CHECKS if not r['passed']],inputPins=len(PINS)),ensure_ascii=False,indent=2))
raise SystemExit(0 if all(r['passed'] for r in CHECKS) else 1)
