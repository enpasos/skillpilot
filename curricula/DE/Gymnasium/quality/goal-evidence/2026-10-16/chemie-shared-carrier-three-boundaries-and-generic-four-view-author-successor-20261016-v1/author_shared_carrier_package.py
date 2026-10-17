import json,hashlib,copy
from pathlib import Path
from datetime import datetime,timezone
R=Path('.'); L=R/'tmp/chemie-m7-resumed-20261016/chemie-combined639-current-native-review-capsule-v1'; E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16'; O=E/'chemie-shared-carrier-three-boundaries-and-generic-four-view-author-successor-20261016-v1'; O.mkdir(exist_ok=False); (O/'candidate').mkdir(); (O/'input').mkdir()
def load(p):return json.loads(p.read_text())
def out(n,x):p=O/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return p
sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
cp=L/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'; before=load(cp);assert sha(cp)=='sha256:0c4277b9bc9ec90740dbe5b885e35cbbde777c488518252d623ce09b044b3cf9'; after=copy.deepcopy(before); by={g['id']:g for g in after['goals']}; orig={g['id']:g for g in before['goals']}; find=lambda p:next(k for k in by if k.startswith(p)); reason={}
a=find('978a6f25'); by[a]['requires']=[find('42a84'),find('135170'),find('413040')]; reason[a]={'field':'requires','oldProblem':'The whole solutions cluster also obliges independent quantity/concentration analysis and mixture reuse. It is absent as a canonical cluster in decomposed HE views even where its relevant children are visible.','actualNeed':'Distinguish mixtures, prepare the provided solutions safely, and reason about solubility for phase/solvent choice. Actual chromatography, reference comparison, Rf calculation and fresh method transfer remain taught and assessed by this whole goal.','newAtomicPredecessors':[{'id':x,'title':by[x]['title']} for x in by[a]['requires']],'preserved':'Whole DE/EN goal, all three complete P cases, performance duty, resource image and official variant boundaries unchanged. No performed experiment claimed.'}
a=find('4d9defde');by[a]['requires']=[find('0959eef2'),find('667bc303')];reason[a]={'field':'requires','oldProblem':'Explaining the biodiesel process was made to require the stronger whole LK competence of independently planning transesterifications/equilibria. This hides an LK planning obligation inside some GK-source explanation routes.','actualNeed':'Existing vegetable-oil/triglyceride structure plus ester formation, reversible ester reactions and the distinction between acidic/alkaline hydrolysis are the appropriate concrete prior concepts. The complete biodiesel P cases themselves teach the exchanged alcohol residue, 1:3:3:1 balance, free-acid/base interference and source-bounded sustainability.','newAtomicPredecessors':[{'id':x,'title':by[x]['title']} for x in by[a]['requires']],'preserved':'Independent biodiesel explanation, all current DE/EN P cases, genuine national source/course differences and LK transesterification-planning goal remain unchanged; no actual synthesis or approval claimed.'}
viewnames=['de-de-gym-chemistry-gk','de-de-gym-chemistry-lk','de-de-gym-sekii-chemistry-gk','de-de-gym-sekii-chemistry-lk','de-he-gk','de-he-sekii-gk'];views={n:load(L/'curricula/DE/Gymnasium/composition-views/chemie'/f'{n}.view.json') for n in viewnames}; memoryids=[find('9ca180'),find('2ab832'),find('fdd721')]
# These new explicit acquisitions are the four corresponding GK scopes only.
for mid in memoryids:
 g=by[mid]; ed=g['extendedData']; scopes=ed.setdefault('authoredMemoryAcquisitionScopes',[])
 for n in [x for x in viewnames if x.endswith('gk')]:
  v=views[n]
  if not any(s['viewId']==v['viewId'] for s in scopes):scopes.append({'viewId':v['viewId'],'scope':v['scope'],'authorProposalRoot':str(O),'authorStatus':'pending-independent-scope-review'})
 a=g.setdefault('applicability',{});a['jurisdiction']=sorted(set(a.get('jurisdiction',[])+['DE-HE']))
 reason[mid]={'field':'applicability.jurisdiction and additive authoredMemoryAcquisitionScopes only','oldProblem':'Broad unchanged Q4 memory6122 selects seven actual cards, including LK Gibbs/Green-Chemistry/efficiency. Its direct Gibbs prerequisite therefore cannot simply be deleted for GK.','actualNeed':'The existing narrow energy/Hess two-card unit, RGT one-card unit, and calorific-value one-card unit support already acquired matching GK origins; author their real HE-GK and generic-DE-GK acquisitions explicitly.','actualSelectedCardIds':ed['memorySupportSelection']['selectedCardIds'],'preserved':'Whole DE/EN memory text, all cards, selection tags, selectedCardIds and exact direct prerequisites unchanged. No source obligation, independent review or human performance is created by these author scope rows.'}
out('candidate/CANONICAL639.five-whole-goal-operations.author-inactive.json',after)
ops=[]
for gid in reason:
 assert {k:v for k,v in orig[gid].items() if k not in ['requires','applicability','extendedData']}=={k:v for k,v in by[gid].items() if k not in ['requires','applicability','extendedData']}
 ops.append({'goalId':gid,'beforeWhole':orig[gid],'afterWhole':by[gid],'authorRationale':reason[gid]})
out('CAS.five-whole-goal-operations.author-inactive.json',{'role':'AUTHOR PROPOSAL; no independent votes; not integrated','sourceCanonical':{'path':str(cp),'sha256':sha(cp)},'operations':ops,'HumanApproval':False,'HumanTrial':False,'M7Claim':False})
# Whole inputs and genuine existing independently supported P bodies are copied for later narrow context review.
inputids=set(reason)
for gid in reason:inputids.update(orig[gid].get('requires',[]));inputids.update(by[gid].get('requires',[]))
for p in ['6122','dcbad','3ec31','ebfa','f6d738','567b5'] :inputids.add(find(p))
out('input/WHOLEGOALS.exact-current-inputs-and-prerequisites.json',[orig[x] for x in sorted(inputids)])
for p in [E/'chemie-native17-five-description-successors-fresh-independent-B-compatibility-20261016-v1/records/P5.current-description-bound.review.jsonl', E/'chemie-fourteen-current-positive-eight-intrinsic-supported-normal-bindings-technical-20261016-v1/P14.split6.current-stock.normal.review.jsonl']:
 for s in p.read_text().splitlines():
  r=json.loads(s)
  if r.get('goalId') in [find('978a6f25'),find('4d9defde')]:out(f"input/P.{r['goalId']}.whole-existing-independent-body.json",{'path':str(p),'sourceFileSha256':sha(p),'wholeRecord':r})
cardp=L/'app/public/data/de_gymnasium_chemistry_flashcards_energy_q4.de.json';out('input/CARDS.energy-q4.whole-unchanged.json',{'sourcePath':str(cardp),'sourceSHA256':sha(cardp),'deck':load(cardp)})
out('PLAN.finite-author-package.json',{'writtenAt':datetime.now(timezone.utc).isoformat(),'author':'/root/chemie_shared_carrier_and_direct_cluster_author_20261016','canonicalWholeGoals':list(reason),'viewNames':viewnames,'excludedExamWrites':['c31fa777','bacf2568','35b76ced','954b55d6','8872d828','e6cb2efa','4a2477e3'],'scope':'Only demonstrated direct acquisition interfaces and four national view placements, plus HE-GK bounded recall. No runtime changes. No independent approvals.','HumanApproval':False,'HumanTrial':False,'M7Claim':False})
print(str(O))
