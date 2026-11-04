"""Independent calculations and exact frozen-input checks; writes reviewer output only."""
from pathlib import Path
from fractions import Fraction as Q
from math import comb
import hashlib,json,subprocess,unicodedata
import sympy as s

OUT=Path(__file__).resolve().parent
ROOT=OUT.parents[2]
PACK=OUT.parent/'statistics-polynomial-transform-four-whole-forms-20261104-v1'
HEAD='047ec7fcb9c5c11c3d90c7524ad8fa4e2ab1eec5'
def sha(b):return hashlib.sha256(b).hexdigest()
def read(p):return json.loads(p.read_text())
def dump(name,value):(OUT/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
checks=[]
def ck(name,condition,details=None):
    checks.append(dict(name=name,passed=bool(condition),details=details))
    assert condition,name

manifest=read(PACK/'review-input-manifest.json')
ck('frozen_handoff',sha((PACK/'content-review-handoff.json').read_bytes())=='1269e4d4b366fc0bcdad3ca19e0f084406869fe3a2ac9cb4d2e7026e35623efb')
ck('frozen_manifest',sha((PACK/'review-input-manifest.json').read_bytes())=='19f39d2b8372947c03cdbae437a11a52d7d49a8ff1c05f8f549a8ae19f5fcaa5')
ck('all_73_frozen_files',len(manifest['files'])==73 and all(sha((PACK/r['path']).read_bytes())==r['sha256'] and (PACK/r['path']).stat().st_size==r['bytes'] for r in manifest['files']))
handoff=read(PACK/'content-review-handoff.json')
canonicalBytes=subprocess.check_output(['git','show',HEAD+':'+handoff['canonicalOriginal']['path']],cwd=ROOT)
ck('actual_canonical_at_author_head',sha(canonicalBytes)==handoff['canonicalOriginal']['sha256'])
canonical=read(PACK/'frozen-input.json')
original=json.loads(canonicalBytes);byid={g['id']:g for g in original['goals']}
forms=handoff['forms']
for form in forms:
    gid=form['goalId'];before=read(PACK/gid/'current-whole-goal.json');after=read(PACK/gid/'proposed-whole-goal.draft.json');neutral=read(PACK/gid/'role-neutral-whole-form-content.draft.json')
    ck(gid+'_whole_current_equals_actual_pinned_canonical',before==byid[gid])
    ck(gid+'_only_nodekind_examdata_added',all(k in after and after[k]==v for k,v in before.items()) and set(after)-set(before)=={'nodeKind','examData'})
    ck(gid+'_role_neutral_equals_exam_content',neutral['examDataContent']==after['examData'])
    ex=after['examData']
    ck(gid+'_one_score_and_self_coverage',ex['scoring']['maxPoints']==sum(r['points'] for r in ex['scoring']['steps'])==20 and ex['scoring']['passingPoints']==15 and ex['coveredGoalIds']==[gid])
    for locale,taskfield,solfield in [('de','taskContent','solutionContent'),('en','taskContentEn','solutionContentEn')]:
        task=(PACK/gid/f'task.{locale}.md').read_text().strip();sol=(PACK/gid/f'solution.{locale}.md').read_text().strip();rub=(PACK/gid/f'rubric.{locale}.md').read_text().strip()
        ck(gid+'_'+locale+'_full_markdown_bound',task==ex[taskfield].strip() and sol in ex[solfield] and rub in ex[solfield])
reuse=read(PACK/'reuse-search.json')['matches']
ck('all_four_actual_existing_exams',len(reuse)==4 and all(r['wholeExistingGoal']==byid[r['wholeExistingGoal']['id']] for r in reuse))
prep=read(PACK/'whole-current-contracts-and-preparation.json')['goals']
for p in prep:
    actual={}
    def visit(gid):
        for req in byid[gid].get('requires',[]):
            if req not in actual:actual[req]=byid[req];visit(req)
    visit(p['goalId'])
    ck(p['goalId']+'_whole_preparation_closure',p['wholeCurrentGoal']==byid[p['goalId']] and p['directRequires']==byid[p['goalId']]['requires'] and actual=={g['id']:g for g in p['wholeTransitiveRequiresGoals']},len(actual))

# Exact independent enumeration of the executed decision procedure, not author formulas.
def mass(n,p,j):return Q(comb(n,j))*p**j*(1-p)**(n-j)
def tail(n,p,k):return sum((mass(n,p,j) for j in range(k,n+1)),Q(0))
stat=[]
for n,k,power in [(20,5,0.762492),(40,8,0.944717)]:
    candidates=[i for i in range(n+2) if tail(n,Q(1,10),i)<=Q(1,20)]
    ck(f'fixed_{n}_minimal_threshold',min(candidates)==k)
    vals=[tail(n,Q(1,10),k-1),tail(n,Q(1,10),k),tail(n,Q(3,10),k)]
    ck(f'fixed_{n}_power_rounding',abs(float(vals[-1])-power)<0.0000005)
    ck(f'fixed_{n}_nested_regions',all(tail(n,Q(3,10),i+1)<=tail(n,Q(3,10),i) for i in range(n+1)))
    stat.append(dict(n=n,k=k,tail_previous=float(vals[0]),alpha=float(vals[1]),power=float(vals[2])))
stages=[]
for r in [5,6]:
    for p,expected in [(Q(1,10),{5:0.063319,6:0.041711}[r]),(Q(3,10),{5:0.933544,6:0.927197}[r])]:
        flag=Q(0);effort=Q(0);fixedMismatch=Q(0)
        for x in range(21):
            for y in range(21):
                pr=mass(20,p,x)*mass(20,p,y)
                continues=3<=x<r
                rejects=x>=r or (continues and x+y>=8)
                flag+=pr*rejects;effort+=pr*(40 if continues else 20)
                fixedMismatch+=pr*(rejects!=(x+y>=8))
        ck(f'two_stage_{r}_{p}_441_pair_value',abs(float(flag)-expected)<0.0000005)
        ck(f'two_stage_{r}_{p}_not_fixed40',fixedMismatch>0)
        stages.append(dict(r=r,p=str(p),probability=float(flag),exactProbability=str(flag),expectedN=float(effort),exactExpectedN=str(effort)))
        if r==6 and p==Q(1,10):ck('chosen_effort_less_than_40',abs(float(effort)-26.2364)<0.00005 and effort<40)
ck('only_r6_meets_both_bounds',stages[0]['probability']>0.05 and stages[2]['probability']<=0.05 and stages[3]['probability']>=0.90)

x,u,t=s.symbols('x u t',real=True);a,b=s.symbols('a b',positive=True)
polys=[2*x**6-3*x**4+5,-x**5+4*x**3-2*x,x**4+x**3-2,(x+1)**2+(x-1)**2,s.Integer(7),s.Integer(0)]
expected=[(True,False),(False,True),(False,False),(True,False),(True,False),(True,True)]
for i,(p,pair) in enumerate(zip(polys,expected)):
    observed=(s.expand(p.subs(x,-x)-p)==0,s.expand(p.subs(x,-x)+p)==0)
    ck(f'symmetry_identity_{i}',observed==pair,observed)
ck('hidden_linear_cancellation',s.expand(polys[3])==2*x*x+2)
ck('even_degree_counterexample',s.degree(x*x+x)==2 and (x*x+x).subs(x,1)!=(x*x+x).subs(x,-1))
q=x**3-x
ck('single_value_pair_counterexample',q.subs(x,1)==q.subs(x,-1) and q.subs(x,2)!=q.subs(x,-2))
F=(x+2)*(x-1)**2/2;H=F*(1+x*x)
ck('cubic_expansion',s.expand(F)==x**3/2-3*x/2+1)
ck('graph_marked_points_and_turns',[F.subs(x,v) for v in [-2,-1,0,1,2]]==[0,2,1,0,2] and s.solve(s.diff(F,x),x)==[-1,1])
ck('graph_multiplicities',s.roots(F)=={-2:1,1:2})
ck('graph_sign_intervals',[s.sign(F.subs(x,v)) for v in [-3,-1,s.Rational(1,2),2]]==[-1,1,1,1])
ck('higher_degree_same_real_roots_and_point',s.degree(H)==5 and H.subs(x,0)==1 and {k:v for k,v in s.roots(H).items() if k.is_real}=={-2:1,1:2})
ck('end_behaviour_exact',all(s.limit(p,x,s.oo)==s.oo and s.limit(p,x,-s.oo)==-s.oo for p in [F,H]))
ck('shift_point_mapping',s.simplify(((x-t)**2+1).subs(x,u+t)-(u*u+1))==0)
ck('shift_vertex_and_examples',((x-t)**2+1).subs(x,t)==1 and [(-2,1),(3,1)]==[(v,1) for v in [-2,3]])
ck('exponential_point_mapping',s.simplify((a*s.exp(x)).subs(x,u)-a*s.exp(u))==0)
ck('exponential_no_intersection',(2*s.exp(x)-s.exp(x)/2).is_positive is True)
ck('sine_point_mapping',s.simplify(s.sin(b*x).subs(x,u/b)-s.sin(u))==0)
ck('sine_period',s.trigsimp(s.sin(b*(x+2*s.pi/b))-s.sin(b*x))==0)
for val,period,maximum in [(2,s.pi,s.pi/4),(s.Rational(1,2),4*s.pi,s.pi)]:
    ck(f'sine_parameter_{val}',2*s.pi/val==period and s.sin(val*maximum)==1 and s.diff(s.sin(val*x),x).subs(x,maximum)==0)
ck('existing_parabola_genuine_reconstruction',s.expand((x+1)**2/2-2)==x*x/2+x-s.Rational(3,2) and ((x+1)**2/2-2).subs(x,1)==0 and ((x+1)**2/2-2).subs(x,-3)==0)

# Re-derive semantic fingerprints independently after reading actual fingerprint implementations.
def fp(goal,rule):
    def norm(v):return ' '.join(unicodedata.normalize('NFKC',str(v or '')).split())
    tags=goal.get('dimensionTags',{})
    v=dict(ruleVersion=rule,goalId=goal['id'],shortKey=goal.get('shortKey',''))
    for k in ['title','titleEn','description','descriptionEn','nodeKind']:v[k]=norm(goal.get(k))
    for k in ['phase','area','topicCode']:v[k]=norm(tags.get(k))
    return 'sha256:'+sha(json.dumps(v,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode())
am=read(PACK/'current-eight-registered-am-rows.json')['rows'];amrecords=[]
for row in am:
    for inputkey in ['registeredConfig','registeredReview']:
        ref=row[inputkey];actual=subprocess.check_output(['git','show',HEAD+':'+ref['path']],cwd=ROOT)
        ck(row['lane']+'_'+row['wholeCurrentRow']['goalId']+'_'+inputkey+'_actual_pinned_file',sha(actual)==ref['sha256'])
    lines=actual.decode().splitlines();whole=row['wholeCurrentRow'];gid=whole['goalId']
    ck(row['lane']+'_'+gid+'_actual_line',json.loads(lines[row['line']-1])==whole)
    bef=read(PACK/gid/'current-whole-goal.json');aft=read(PACK/gid/'proposed-whole-goal.draft.json')
    current=fp(bef,whole['ruleVersion']);candidate=fp(aft,whole['ruleVersion'])
    ck(row['lane']+'_'+gid+'_fingerprint_independent',current==whole['fingerprint'] and candidate!=current)
    amrecords.append(dict(lane=row['lane'],goalId=gid,originalFingerprint=current,hypotheticalCandidateFingerprint=candidate,originalStatus=whole['status']))

sourceinfo=[]
for entry in read(PACK/'existing-source-and-scope-context.json')['records']:
    for k in ['mapping','source']:
        q=ROOT/entry[k]['path'];ck(entry[k]['path']+'_hash',sha(q.read_bytes())==entry[k]['sha256'])
    source=read(ROOT/entry['source']['path'])
    for collection,actualkey in [('wholeMappedSourceGoals','sourceGoals'),('wholeRelatedPassages','passages')]:
        actual={z['id']:z for z in source.get(actualkey,source.get('goals',[]))}
        ck(entry['source']['path']+'_'+collection,all(actual.get(g['id'])==g for g in entry[collection]))
    requiredkeys={p.get('sourceDocumentKey') for p in entry['wholeRelatedPassages']}
    docs=[d for d in source.get('sourceDocuments',[]) if d.get('key') in requiredkeys]
    for doc in docs:
        file=ROOT/doc['path'];doc['reviewerActualSha256']=sha(file.read_bytes())
    sourceinfo.append(dict(source=entry['source'],actualRelevantDocuments=docs,authorTopLevelDocument=entry.get('sourceDocument')))

ledgerpath='curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
lb=subprocess.check_output(['git','show',HEAD+':'+ledgerpath],cwd=ROOT);ledger=json.loads(lb)
ck('actual_pinned_807_curricular_atomic',ledger['counts']['curricularAtomic']==807 and sum(r['semanticKind']=='curricularAtomic' for r in ledger['decisions'])==807)
ck('all_four_stay_curricular_atomic',all(next(r for r in ledger['decisions'] if r['goalId']==f['goalId'])['semanticKind']=='curricularAtomic' for f in forms))
dump('independent-probes.json',dict(status='PASS',method='Reviewer-authored exact Fraction enumeration and SymPy algebra; pinned Git originals and real source bytes; no author verifier invoked.',checks=checks,checkCount=len(checks),fixedRules=stat,twoStageRules=stages,amOriginalAndConditionalFingerprints=amrecords,sourceDocumentResolution=sourceinfo,semanticKindsInput=dict(path=ledgerpath,sha256=sha(lb),counts=ledger['counts'])))
print(json.dumps(dict(status='PASS',checks=len(checks),amRows=len(amrecords))))
