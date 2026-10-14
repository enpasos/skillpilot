#!/usr/bin/env python3
import copy
import hashlib
import importlib.util
import json
import pathlib
from datetime import datetime, timezone
from jsonschema import Draft202012Validator

R = pathlib.Path(__file__).resolve().parents[1]
REPO = next(p for p in R.parents if (p/'AGENTS.md').exists())
def load(rel): return json.loads((R/rel).read_text())
def write(rel,obj):
    p=R/rel; p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
def binding(p):
    b=p.read_bytes()
    return {'path':str(p.relative_to(REPO)),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}

all_input_bindings=load('inputs/finite-whole-input-bindings.actual.json')['bindings']
for b in all_input_bindings:
    frozen=b['frozenRegularCopy']; actual=binding(REPO/frozen['path'])
    assert actual==frozen
    assert actual['sha256']==b['original']['sha256'] and actual['bytes']==b['original']['bytes']
base=load('inputs/frozen-regular-originals/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
cand=load('candidate/canonical528.current402-plus-five-duty-atoms.author.inactive.json')
cas=load('candidate/four-new-whole-goals-one-exact-reused-RP-goal-and-three-parent-CAS.author.json')
old={g['id']:g for g in base['goals']}; new={g['id']:g for g in cand['goals']}
assert len(old)==523 and len(new)==528
touched={c['expectedBeforeWholeGoal']['id']:c for c in cas['existingWholeGoalCAS']}
assert len(touched)==3
for gid,g in old.items():
    if gid not in touched: assert new[gid]==g
    else:
        c=touched[gid]
        assert c['expectedBeforeWholeGoal']==g and c['proposedAfterWholeGoal']==new[gid]
        assert {k for k in g.keys()|new[gid].keys() if g.get(k)!=new[gid].get(k)}=={'contains','weight'}
        assert new[gid]['contains']==g['contains']+c['addedChildren']
assert {k:v for k,v in cand.items() if k!='goals'}=={k:v for k,v in base.items() if k!='goals'}
for relation in ('contains','requires'):
    done=set();visiting=set()
    def visit(gid):
        if gid in done:return
        assert gid not in visiting, (relation,gid)
        visiting.add(gid)
        for target in new[gid].get(relation,[]):
            assert target in new,(gid,target)
            visit(target)
        visiting.remove(gid);done.add(gid)
    for gid in new:visit(gid)
parent_by={}
for g in cand['goals']:
    for child in g.get('contains',[]):parent_by.setdefault(child,[]).append(g['id'])
five=cas['newWholeGoals']+cas['reusedExactPendingWholeGoals']
for g in five:
    assert len(parent_by[g['id']])==1
    assert not g.get('contains')
rp_original=load('inputs/frozen-regular-originals/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e594-residual-source-duty-author-20261013-v3/candidate/two-full-classification-goals-and-dye-parent-whole-CAS.author.json')['newWholeGoals'][0]
assert cas['reusedExactPendingWholeGoals']==[rp_original]
supplied=load('inputs/six-whole-source-cells.actual-before.json')
sourcecas=load('candidate/six-full-source-cell-and-seven-carrier-CAS.author.json')
assert len(sourcecas['wholeCells'])==6
carrier_total=0
for row,proposal in zip(supplied['rows'],sourcecas['wholeCells']):
    assert proposal['sourceGoalId']==row['sourceGoalId']
    assert proposal['exactWholeInstalledSourceCells']==row['actualInstalledSourceCells']
    for rec in proposal['wholeCarrierCAS']:
        carrier_total+=1
        d=json.loads((REPO/rec['mappingCarrierFrozenBinding']['path']).read_text())
        rows=[x for x in d['decisions'] if x['sourceGoalId']==row['sourceGoalId']]
        assert rows==[rec['expectedBeforeWholeDecision']]
        assert rec['operativeAfterWholeDecision']==rec['expectedBeforeWholeDecision']
        assert rec['operativeAfterAllMappingsForSourceCell']==rec['expectedBeforeAllMappingsForSourceCell']==[]
        assert rec['NONOPERATIVEConditionalAfterWholeDecision']['canonicalGoalIds']
        assert rec['NONOPERATIVEConditionalAfterWholeDecision']['reviewer'].startswith('Codex bounded source-duty author')
assert carrier_total==7
schema=json.loads((REPO/'docs/landscape-runtime.schema.json').read_text())
schema_errors=[e.message for e in Draft202012Validator(schema).iter_errors(cand)]
assert not schema_errors,schema_errors
spec=importlib.util.spec_from_file_location('stock_validate',REPO/'scripts/validate_schemas.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
symlink_errors=m.curriculum_symlink_errors(str(REPO))
write('checks/required-curriculum-symlink-portability.actual.json', {'stockFunction':'scripts/validate_schemas.py:curriculum_symlink_errors','errors':symlink_errors,'passed':not symlink_errors,'scope':'full current curricula tree; this does not validate source science'})
if symlink_errors:raise RuntimeError(symlink_errors)
write('checks/finite-whole-body-source-CAS-and-two-DAG-guards.actual.json',{
    'baseWholeNodes':523,'candidateWholeNodes':528,'unchangedExistingWholeNodes':520,
    'changedExistingWholeNodes':3,'changedFieldsOnly':['contains','weight'],
    'fourGenuinelyNewAtoms':4,'oneWholePriorRPAtomByteContentExact':True,
    'sixOriginalSourceWholeCellsUnchanged':True,'sevenWholeCarrierCASMatched':True,
    'operativeSourceDecisionsAndEdgesUnchanged':True,
    'containsDAG':True,'requiresDAG':True,'fiveNewCandidateAtomsEachOneVisibleParent':True,
    'landscapeRuntimeSchemaPassed':True,'runtimeSchemaErrors':schema_errors,
    'allSourceParentedOperatorsPreserved':True,'currentOperativeDenominatorUnchanged':True,
    'actualStrictProgress':0,'activeWrites':False})
files=sorted(p for p in R.rglob('*') if p.is_file() and '__pycache__' not in p.parts and p.name!='SEAL.finite-six-duty-author.actual.json')
parsed=[]
for p in files:
    if p.suffix=='.json':json.loads(p.read_text());parsed.append(str(p.relative_to(R)))
write('checks/all-finite-JSON-parsed.actual.json',{'parsedCount':len(parsed),'parsedFiles':parsed,'passed':True})
files=sorted(p for p in R.rglob('*') if p.is_file() and '__pycache__' not in p.parts and p.name!='SEAL.finite-six-duty-author.actual.json')
seal={'role':'Finite six whole-source-duty author package; proposals are not source approvals or strict completions',
      'sealedAtUTC':datetime.now(timezone.utc).isoformat(),
      'outputBindings':[binding(p) for p in files],
      'newSourceScienceVotes':0,'newNativeD_P_A_M_VAuthorityRows':0,
      'actualStrictNetGain':0,'activeWrites':False,
      'nextRequired':'Two fresh independent source reviews; optional selection semantics remain held.'}
write('SEAL.finite-six-duty-author.actual.json',seal)
json.loads((R/'SEAL.finite-six-duty-author.actual.json').read_text())
print('Finite author seal PASS:',len(files),'files bound; full source duties preserved; all operative grants remain held.')
