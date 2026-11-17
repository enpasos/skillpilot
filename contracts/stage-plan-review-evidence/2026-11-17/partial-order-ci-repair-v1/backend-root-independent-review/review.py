from pathlib import Path
import json,hashlib,subprocess,functools,re,datetime
root=Path('.');out=Path('tmp/pipeline/laender-stufen/gesamt/ci/repair-v1/backend-root-independent-review')
load=lambda p:json.loads(Path(p).read_text());sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
paths=list(Path('curricula/DE/Gymnasium/canonical').glob('*.json'));catalogs=[load(p) for p in paths];G={g['id']:g for c in catalogs for g in c['goals']}
@functools.cache
def atoms(i):return set().union(*(atoms(c) for c in G[i]['contains'])) if G[i].get('contains') else {i}
@functools.cache
def pre(i):return set(G[i].get('requires',[]))|set().union(*(pre(c) for c in G[i].get('requires',[])))
def nodeatoms(n):
 if n['kind']=='structure':return set().union(*(nodeatoms(c) for c in n.get('children',[])))
 return atoms(n['goalId']) if n['kind']=='canonicalSubtree' else {n['goalId']}
def find(ns,i):
 for n in ns:
  if n.get('id')==i:return n
  f=find(n.get('children',[]),i)
  if f:return f
def raw(view,i):return nodeatoms(find(view['rootNodes'],i))
def seed(view):
 a={}
 def put(i,role,direct,dist):
  rank=(direct,-dist);old=a.get(i)
  if old is None or rank>old[0] or rank==old[0] and role=='target':a[i]=(rank,role)
 def tree(i,role,d=0):
  put(i,role,False,d)
  for c in G[i].get('contains',[]):tree(c,role,d+1)
 def walk(ns):
  for n in ns:
   if n['kind']=='structure':walk(n['children'])
   elif n['kind']=='canonicalSubtree':tree(n['goalId'],n.get('projectionRole','target'))
   else:put(n['goalId'],n.get('projectionRole','target'),True,0)
 walk(view['rootNodes']);return {i for i,(_,r) in a.items() if r=='target' and not G[i].get('contains') and (view.get('scope',{}).get('courseProfile','LK') in G[i].get('tags',[]) or not set(G[i].get('tags',[]))&{'GK','LK'})}
def L(view):
 s=seed(view);return s|set().union(*(pre(i) for i in s))
def trails(ns,ids,trail=()):
 r=[]
 for n in ns:
  here=trail+(n.get('id',n.get('goalId')),)
  if n.get('goalId') in ids:r.append({'goalId':n['goalId'],'path':here,'projectionRole':n.get('projectionRole','target'),'acquisitionPlacement':n.get('acquisitionPlacement',False)})
  r+=trails(n.get('children',[]),ids,here)
 return r
M=load('curricula/DE/Gymnasium/composition-views/mathematik/de-de-lk.view.json');Mb=json.loads(subprocess.check_output(['git','show','b92150ecc4:curricula/DE/Gymnasium/composition-views/mathematik/de-de-lk.view.json'],text=True));H=load('curricula/DE/Gymnasium/composition-views/mathematik/de-he-gk-g9.view.json');He=load('curricula/DE/Gymnasium/composition-views/mathematik/de-he-sekii-lk.view.json');P=load('curricula/DE/Gymnasium/composition-views/physik/de-de-gym-physics-lk.view.json')
oldj8=raw(Mb,'j8');newj8=raw(M,'j8');removed=oldj8-newj8;added=newj8-oldj8
j8={'oldCount':len(oldj8),'currentCount':len(newj8),'removed':[{'id':i,'title':G[i]['title']} for i in sorted(removed)],'added':sorted(added),'removedPlaces':trails(M['rootNodes'],removed),'allRemovedStillInL':removed<=L(M)}
assert len(oldj8)==56 and len(newj8)==50 and len(removed)==6 and not added and removed<=L(M)
for r in j8['removedPlaces']:assert 'j8' not in r['path']
# Existing Hessian duration view has the current year eight under j8-g9.
hj8=find(H['rootNodes'],'j8-g9') or find(H['rootNodes'],'j8');ha=nodeatoms(hj8)
fixture=load('contracts/stage-plan-review-evidence/2026-11-17/pr160-backend-ci-repair-v1/sek1-seed-fixtures.actual.json')['scopes']['68a8ac50-f5f5-4e24-8aa9-5e408ca01ced|DE-HE|SekI|G9|GK'];HL=L(H);excluded=ha-HL
assert len(ha)==67 and len(excluded)==5 and len(ha&HL)==62
hessian={'authoredJ8Count':len(ha),'actualFocusCount':len(ha&HL),'exactExcluded':[{'id':i,'title':G[i]['title']} for i in sorted(excluded)],'excludedReferences':trails(H['rootNodes'],excluded)}
for r in hessian['excludedReferences']:assert r['projectionRole']=='prerequisiteOnly'
# Root equality is intersected with actual L, not inferred from labels.
nav={'nationalMathRootFocusEqualsAllL':raw(M,'math-root')&L(M)==L(M),'hessianOuterRootFocusEqualsAllL':raw(He,'math-root')&L(He)==L(He),'hessianSekIIStageStrictlySmaller':raw(He,'sek2-lk')&L(He)<L(He),'e1Exists':bool(find(He['rootNodes'],'he-upper-0-e-1')),'e1WithinEPhase':raw(He,'he-upper-0-e-1')<=raw(He,'e-phase'),'ePhaseWithinStage':raw(He,'e-phase')<=raw(He,'sek2-lk')}
assert all(nav.values())
oldfocus=raw(M,'math-v7-retained-source-c9d92f32-167a-4006-a940-b8063a6ed434');pall=raw(P,'physics-root');optics=raw(P,'physics-canonical-lower-optics')
multi={'mathFocusCount':len(oldfocus),'completePhysicsContainsWholeMathFocus':oldfocus<=pall,'opticsIndependentMissingMathFocus':sorted(oldfocus-optics),'opticsNonempty':bool(optics)}
assert multi['completePhysicsContainsWholeMathFocus'] and oldfocus-optics and optics
ledger='curricula/DE/Gymnasium/quality/package-redistribution/de-gymnasium-mathematik-v1.3-partial-order-20261116.review.json';pin='scripts/run_curriculum_release_model_conformance.sh';oldledger=json.loads(subprocess.check_output(['git','show','HEAD:'+ledger],text=True));currentledger=load(ledger)
changed=[k for k in set(oldledger)|set(currentledger) if oldledger.get(k)!=currentledger.get(k)];assert changed==['contentDigest'];digest=currentledger['contentDigest'];assert digest=='sha256:c2df283bfd359ba5ecf8bfe2ae1abf311e193871e923035074b493cbac754a8f';oldpin=subprocess.check_output(['git','show','HEAD:'+pin],text=True);newpin=Path(pin).read_text();assert oldpin.replace(oldledger['contentDigest'],digest)==newpin
led={'onlyLedgerFieldChanged':changed,'onlyScriptChangeDigestReplacement':True,'newContentDigest':digest,'humanApprovalFieldsUnchanged':True,'approvalGrantedByThisChange':False}
files=['backend/src/test/java/com/skillpilot/backend/service/LearnerServiceTest.java','backend/src/test/java/com/skillpilot/backend/openai/mcp/de/OpenAiDeCoachEndToEndIntegrationTest.java',ledger,pin]
diff=subprocess.check_output(['git','diff','--',*files]);(out/'reviewed.diff').write_bytes(diff)
(out/'baseline-de-de-lk.b92150ecc4.json').write_text(json.dumps(Mb,ensure_ascii=False,indent=2)+'\n')
result={'decision':'PASS_TECHNICAL_CONTENT_PENDING_CENTRAL_TEST_TERMINATION','reviewedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'reviewerAuthoredReviewedChanges':False,'diffSha256':hashlib.sha256(diff).hexdigest(),'inputs':[{'path':p,'sha256':sha(p)} for p in [*files,*map(str,paths),'curricula/DE/Gymnasium/composition-views/mathematik/de-he-gk-g9.view.json',str(out/'baseline-de-de-lk.b92150ecc4.json'),'curricula/DE/Gymnasium/composition-views/mathematik/de-de-lk.view.json','curricula/DE/Gymnasium/composition-views/mathematik/de-he-sekii-lk.view.json','curricula/DE/Gymnasium/composition-views/physik/de-de-gym-physics-lk.view.json']], 'nationalJ8':j8,'hessianJ8':hessian,'navigation':nav,'multiRoot':multi,'ledgerAndPin':led,'verifiedRecallHelperReview':'Uses backend-issued nonempty card list, configuredBatchSize and issuedAt; submits that exact order through verified recall; bounded100batches and asserts masterySaved. Mocked correct recall is test fixture, not real learner evidence. No direct setMastery for memory, runtime unchanged.'}
(out/'review.actual.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'nationalJ8':j8,'hessianJ8':hessian,'navigation':nav,'multiRoot':multi,'diffSha256':result['diffSha256']},ensure_ascii=False,indent=2))
