import collections
import hashlib
import itertools
import json
import math
import re
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09'
AUTHOR = BASE / 'biologie-molecular-genetics-twenty-three-whole-author-v1'
OUT = BASE / 'biologie-molecular-genetics-twenty-three-whole-independent-a-v1'
def read(path): return json.loads(path.read_text())
def binding(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}
def pointer(obj, value):
    for part in value.strip('/').split('/'):
        part = part.replace('~1', '/').replace('~0', '~')
        obj = obj[int(part)] if isinstance(obj, list) else obj[part]
    return obj

whole_path = AUTHOR / 'input/whole-current23-source38-and-whole-partners44.exact-neutral-input.json'
material_path = AUTHOR / 'twenty-three-whole46-bilingual-cases-and-P.author-candidate.json'
candidate_path = AUTHOR / 'twenty-three-whole-positive-profile-candidate-set.author.json'
snapshot_path = AUTHOR / 'input/current-canonical479.original.snapshot.json'
whole, material, candidates, snapshot = map(read, [whole_path, material_path, candidate_path, snapshot_path])
goals = {g['id']: g for g in snapshot['goals']}
input_goals = {g['goalId']: g['wholeActiveGoal'] for g in whole['wholeCurrentGoalRows']}
specs = {g['goalId']: g['profile'] for g in candidates['goals']}
checks, errors, case_bindings, historical = [], [], [], []
def check(name, result, detail=None):
    checks.append({'check': name, 'pass': bool(result), 'detail': detail})
    if not result: errors.append(name)
check('exact selected23 identity and order', [e['goalId'] for e in material['entries']] == [g['goalId'] for g in whole['wholeCurrentGoalRows']] == [g['goalId'] for g in candidates['goals']])
check('selected23 outside retained276 strict IDs', not set(input_goals).intersection(whole['preserveExactStrict276GoalIds']))
for i, e in enumerate(material['entries']):
    goal_id = e['goalId']
    check(f'{goal_id}: whole goal equality across actual snapshot/intake/material', goals[goal_id] == input_goals[goal_id] == e['wholeCurrentGoal'])
    check(f'{goal_id}: complete profile equals normal candidate body', specs[goal_id] == e['wholeProfile'])
    cases = e.get('newAuthoredWholeCases', e.get('exactHistoricalWholeCases'))
    check(f'{goal_id}: two whole independent case identities', len(cases) == 2 and len({c['caseId'] for c in cases}) == 2)
    if 'newAuthoredWholeCases' in e:
        for n, (case, brief) in enumerate(zip(cases, e['wholeProfile']['applicationCaseBriefs'])):
            results = {'id': brief['id'] == case['caseId']}
            for lang, task, fresh in [('De', 'Auftrag: ', 'Frische Variation: '), ('En', 'Task: ', 'Fresh variation: ')]:
                results['taskDemand'+lang] = brief['taskDemand'+lang] == case['material'+lang]+'\n\n'+task+case['task'+lang]+'\n\n'+fresh+case['freshTransferTask'+lang]
                results['expectedPerformance'+lang] = brief['expectedPerformance'+lang] == case['workedResponse'+lang]+'\n\nTransfer: '+case['workedFreshTransfer'+lang]
                results['understandingFocus'+lang] = brief['understandingFocus'+lang] == ' '.join(x['essentialUnderstanding'+lang] for x in e['wholeProfile']['expectations'])
            check(f'{goal_id}/{case["caseId"]}: whole brief construction', all(results.values()), results)
            check(f'{goal_id}/{case["caseId"]}: synthetic origin and false actual performance flags', case['actualExperimentPerformed'] is False and case['actualLearnerPerformance'] is False and 'constructed' in case['dataOrigin'])
            case_bindings.append({'goalId': goal_id, 'caseId': case['caseId'], 'wholeCasePointer': f'/entries/{i}/newAuthoredWholeCases/{n}', 'profileBriefPointer': f'/entries/{i}/wholeProfile/applicationCaseBriefs/{n}', 'literalConstruction': results})
    else:
        reuse = e['wholeHistoricalReuseBinding']
        original_path = ROOT / reuse['source']['path']
        original = pointer(read(original_path), reuse['jsonPointer'])
        check(f'{goal_id}: original historical whole material exact value', original == e['exactHistoricalWholeMaterial'])
        check(f'{goal_id}: original historical two case bodies exact value', original['tasks'] == cases)
        historical.append({'goalId': goal_id, 'originalBinding': binding(original_path), 'jsonPointer': reuse['jsonPointer'], 'wholeMaterialEquals': original == e['exactHistoricalWholeMaterial'], 'wholeTwoCasesEquals': original['tasks'] == cases, 'newApprovalOfHistoricalEvidence': False})

check('whole source38/partner44 finite frame', len(whole['wholeOriginalSourceDutyRows']) == 38 and len(whole['wholeCanonicalPartnerGoals']) == 44)
for row in whole['wholeCanonicalPartnerGoals']:
    check(f'{row["goalId"]}: whole actual partner exact snapshot value', row['wholeGoal'] == goals[row['goalId']])

ncbi_url = 'https://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi'
ncbi_bytes = urllib.request.urlopen(ncbi_url, timeout=30).read()
ncbi_path = OUT / 'source-reading/NCBI-standard-code.actual-primary.html'
ncbi_path.write_bytes(ncbi_bytes)
ncbi = ncbi_bytes.decode('utf-8', errors='replace')
aa = re.search(r'AAs\s*=\s*([A-Z*]{64})', ncbi).group(1)
bases = [re.search(r'Base'+str(n)+r'\s*=\s*([TCAG]{64})', ncbi).group(1) for n in [1,2,3]]
names = dict(zip('FLIMSY*CWPHRQNTKVADEG', ['Phe','Leu','Ile','Met','Ser','Tyr','Stopp','Cys','Trp','Pro','His','Arg','Gln','Asn','Thr','Lys','Val','Ala','Asp','Glu','Gly']))
ncbi_map = {''.join(x).replace('T','U'): names[a] for x, a in zip(zip(*bases), aa)}
old = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-q1-four-current390-native-source-operator-candidate-author-20261007-v1/retained-material'
codon_path = old / 'standard-code-sun.codon-data.actual.json'
svg_path = old / 'standard-code-sun.author-material.svg'
codons = read(codon_path)['codonAssignments']
check('all64 retained codon assignments against actual NCBI standard table', len(codons) == 64 and codons == ncbi_map)
svg = ET.parse(svg_path)
texts = [(node.text or '', float(node.attrib.get('x', 0)), float(node.attrib.get('y', 0))) for node in svg.getroot().iter('{http://www.w3.org/2000/svg}text')]
labels = {m.group(1): m.group(2) for t,x,y in texts if (m := re.fullmatch(r'([UCAG]{3}) · (\w+)', t))}
check('all64 actual SVG outer labels against actual NCBI standard table', labels == ncbi_map)
paths = []
for codon in ['GAA', 'UGC']:
    text, x, y = next(t for t in texts if t[0].startswith(codon+' · '))
    angle = math.atan2(y-790, x-750)
    def ad(a,b): return abs(math.atan2(math.sin(a-b), math.cos(a-b)))
    rings = []
    for low, high in [(65,205),(205,345),(345,485)]:
        eligible = [t for t in texts if t[0] in 'UCAG' and len(t[0]) == 1 and low < math.hypot(t[1]-750,t[2]-790) < high]
        t = min(eligible, key=lambda t: ad(angle, math.atan2(t[2]-790,t[1]-750)))
        rings.append(t[0])
    check(f'actual SVG inside-out path {codon}', ''.join(rings) == codon, {'rings': rings, 'outerLabel': text})
    paths.append({'codon': codon, 'rings': rings, 'outerLabel': text})

def gametes(genotype):
    loci = [genotype[n:n+2] for n in range(0, len(genotype), 2)]
    counts = collections.Counter(''.join(g) for g in itertools.product(*loci))
    return {g: n/(2**len(loci)) for g,n in counts.items()}
def cross(a,b):
    counts = collections.defaultdict(float)
    for ga, pa in gametes(a).items():
        for gb, pb in gametes(b).items():
            geno = ''.join(''.join(sorted([x,y], key=lambda c:(c.lower(),c.islower()))) for x,y in zip(ga,gb))
            counts[geno] += pa*pb
    return dict(counts)
calculations = {'monoAa': cross('Aa','Aa'), 'dihybridAaBb': cross('AaBb','AaBb'), 'testcross': cross('AaBb','aabb'), 'freshCcddXccDd': cross('Ccdd','ccDd'), 'PCR3x4cycles':3*2**4,'PCR2x5cycles':2*2**5,'PCR10x1.8x1.8':10*1.8**2, 'allDominant8Probability':0.75**8,'smallSampleDominantProportions':[a/8 for a in [8,5,6,7,4]],'smallPooled':30/40,'largeSample':302/400,'selectionAlternativePooled':522/800,'conditionalAAdeathExpectedA_':2/3,'recombinantFraction':(100+100)/(410+390+100+100)}
check('independent genotype products and fresh testcross', calculations['monoAa'] == {'AA':.25,'Aa':.5,'aa':.25} and calculations['dihybridAaBb']['AaBb'] == .25 and len(calculations['dihybridAaBb']) == 9 and all(v == .25 for v in calculations['testcross'].values()) and calculations['freshCcddXccDd']['ccdd'] == .25)
check('independent PCR and ratio results', calculations['PCR3x4cycles'] == 48 and calculations['PCR2x5cycles'] == 64 and math.isclose(calculations['PCR10x1.8x1.8'],32.4) and calculations['recombinantFraction'] == .2)
comp = str.maketrans('AUCG','UAGC')
antisense = [{'target5to3': t, 'complement3to5': t.translate(comp), 'antisense5to3': t.translate(comp)[::-1]} for t in ['AUGGCU','AUGAAU']]
check('independent antiparallel antisense sequence orientation', antisense[0]['complement3to5']=='UACCGA' and antisense[1]['antisense5to3']=='AUUCAU')
report = {'schemaVersion':1,'role':'Independent actual input/content-construction and finite-calculation verification; not a semantic approval substitute','inputs':[binding(p) for p in [whole_path,material_path,candidate_path,snapshot_path,codon_path,svg_path,ncbi_path]],'checks':checks,'errors':errors,'newWholeCaseBindings':case_bindings,'historicalExactReuse':historical,'actualCodeWheelScientificPaths':paths,'finiteCalculations':calculations,'antisenseCalculations':antisense,'humanApproval':False,'humanTrial':False,'nativeDApproval':False,'nativePApproval':False,'VApproval':False,'wholeSourceApproval':False,'strictGain':0}
(OUT/'actual-input-model-data-consistency-and-calculations.independent.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'checks':len(checks),'errors':errors,'newCases':len(case_bindings),'historicalWholeGoals':len(historical),'historicalCases':sum(len(e['exactHistoricalWholeCases']) for e in material['entries'] if 'exactHistoricalWholeCases' in e)},ensure_ascii=False))
