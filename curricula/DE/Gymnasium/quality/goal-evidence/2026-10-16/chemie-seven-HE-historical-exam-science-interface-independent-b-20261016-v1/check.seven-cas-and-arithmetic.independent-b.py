# SPDX-License-Identifier: Apache-2.0
import copy, datetime, hashlib, json, math, pathlib, subprocess
import jsonschema

R=pathlib.Path.cwd()
E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16'
A=E/'chemie-seven-HE-historical-exam-atomic-interface-and-material-author-successor-20261016-v1'
O=pathlib.Path(__file__).resolve().parent
K=R/'tmp/chemie-m7-resumed-20261016/chemie-combined639-current-native-review-capsule-v1'
def read(p): return json.loads(p.read_text())
def pin(p): return {'path':str(p.relative_to(R)),'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def save(n,x):
    with (O/n).open('x') as f: f.write(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
selector=A/'OUTPUTS.finite-seven-WHOLE-exam-interface-and-source-material.AUTHOR.selector.json'
casfile=A/'CAS.seven-WHOLE-exams.current639.AUTHOR.inactive.json'
assert pin(selector)['sha256']=='sha256:ebb4753f273409c9413d0b29fbe154771874737f5e813547aab5e029e1af2d92'
assert pin(casfile)['sha256']=='sha256:d80ff21215ed5699b8b37cb8dfc6085c3ccd7ef2385f243b3fc20c06aa6a4675'
cas=read(casfile)
canonical=read(K/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
before={g['id']:g for g in canonical['goals']}; after=copy.deepcopy(before)
schemafile=R/'docs/landscape-runtime.schema.json'; schema=read(schemafile)
validator=jsonschema.Draft202012Validator({'$ref':'#/$defs/goal','$defs':schema['$defs']})
checks=[]
for op in cas['operations']:
    b,n=op['before'],op['after']; assert b==before[op['goalId']]
    assert n==read(R/op['afterFile']['path'])
    errors=[e.message for e in validator.iter_errors(n)]; assert not errors,errors
    bs,ns=b['examData']['scoring'],n['examData']['scoring']
    assert bs['maxPoints']==ns['maxPoints']==30
    assert bs['passingPoints']==ns['passingPoints']==18
    assert [x['points'] for x in bs['steps']]==[x['points'] for x in ns['steps']]
    assert sum(x['points'] for x in ns['steps'])==30
    assert n['examData']['reviewStatus']=='draft'
    assert b['tags']==n['tags'] and b['applicability']==n['applicability']
    assert b['extendedData']['provenance']==n['extendedData']['provenance']
    assert all(x in before for x in n['requires'])
    assert all(before[x].get('type')!='cluster' or x=='62149f36-87c0-5a2d-8a78-e7d4203f58c2' for x in n['requires'])
    assert all(not('LK' in before[x].get('tags',[]) and 'GK' not in before[x].get('tags',[])) for x in n['requires'])
    after[n['id']]=n
    checks.append({'goalId':n['id'],'completeBeforeWholeExact':True,'afterWholeExactSealedCAS':True,'schemaErrors':errors,'weights':[x['points'] for x in ns['steps']],'scoreBar':[30,18],'keptRawCourseAndJurisdiction':True,'keptOriginalProvenance':True,'newActualRequires':n['requires'],'sourcePages':n['extendedData']['assessmentInterfaceAuthorSuccessor']['sourcePrimaryPages'],'draftGateHonest':True})
for edge in ['requires','contains']:
    done,active=set(),set()
    def visit(i):
        assert i not in active,(edge,i)
        if i in done:return
        active.add(i)
        for r in after[i].get(edge,[]):assert r in after;visit(r)
        active.remove(i);done.add(i)
    for i in after:visit(i)
assert len([i for i in after if before[i]!=after[i]])==7
calculations={
 'detergent':{'annualElectricEnergySaved_kWh':(1.10-.55)*250,'annualDose_kg':[18*250/1000,30*250/1000],'annualDetergentCosts_EUR':[.22*250,.25*250]},
 'zinc':{'Zn_mol':.65/65.4,'electron_mol':2*.65/65.4,'oxygenEquationAtomChargeBalance':{'left':{'O':4,'H':4,'charge':-4},'right':{'O':4,'H':4,'charge':-4}}},
 'HCl':{'base_mol':.100*.0248,'HCl_mol_L':.100*.0248/.0250,'initial_pH':-math.log10(.100*.0248/.0250),'margin_mol_L':.100-.0992,'margin_percent_of_limit':(.100-.0992)/.100*100},
 'ammonia':{'equilibriumAmounts_mol':[1-.40,3-3*.40,2*.40],'esterConcentrations_mol_L':[.40/2,.40/2,.60/2,.60/2],'esterKc':(.60/2)**2/(.40/2)**2},
 'ABS':{'massRecovery_percent':96/120*100},
 'PLA':{'leftAtoms':{'C':9,'H':18,'O':9},'trimerAtoms':{'C':9,'H':14,'O':7},'twoWaterAtoms':{'H':4,'O':2},'finiteLinearChainLinksAndWaters':'n-1, one open unbranched chain; supplied trimer2'}
}
assert math.isclose(calculations['ammonia']['esterKc'],2.25)
assert math.isclose(calculations['HCl']['HCl_mol_L'],.0992)
source=R/'curricula/DE/Gymnasium/input/HE/upper-secondary/kcgo_chemie_21.04.2026.pdf'
pages={str(p):subprocess.run(['pdftotext','-f',str(p),'-l',str(p),'-layout',str(source),'-'],check=True,capture_output=True,text=True).stdout for p in [42,43,46,47,49,50,51]}
save('INPUT.actual-official-HE-source-pages.independent-b.json',{'source':pin(source),'actualPagesRead':pages,'sourceOnlyNotIndependentPeerOpinion':True})
save('CHECK.actual-seven-whole-CAS-schema-arithmetic-and-interface.independent-b.json',{'role':'Own executed mechanical check after sealed independent seven-exam science','selector':pin(selector),'cas':pin(casfile),'schema':pin(schemafile),'completeSevenGoalChecks':checks,'both639DAGsAcyclic':True,'other632WholeGoalsExact':True,'independentArithmetic':calculations,'limitation':'Scope-level source/guard reconstruction is separate from executed learner sessions. These checks do not release drafts or establish full M7.','HumanApproval':False,'HumanTrial':False,'M7Claim':False})
print(json.dumps({'wholeExams':7,'schemas':7,'DAGs':2,'wholeOther632Exact':True,'scoreBar':[30,18],'arithmetic':'PASS'}))
