from pathlib import Path
import json,hashlib,re
import sympy as s
base=Path(__file__).parent
raw=json.loads((base/'candidate.new-goal.json').read_text())
t=s.symbols('t', real=True)
a,b,c,d,e=s.symbols('a b c d e')
q=a*t**4+b*t**3+c*t**2+d*t+e
conditions=[s.Eq(q.subs(t,0),5),s.Eq(s.diff(q,t).subs(t,0),-s.Rational(1,10)),s.Eq(q.subs(t,20),s.Rational(7,2)),s.Eq(s.diff(q,t).subs(t,20),0),s.Eq(s.diff(q,t,2).subs(t,10),0)]
sol=s.solve(conditions,[a,b,c,d,e]);matrix,rhs=s.linear_eq_to_matrix(conditions,[a,b,c,d,e])
assert sol=={a:s.Rational(1,80000),b:-s.Rational(3,8000),c:s.Rational(3,800),d:-s.Rational(1,10),e:5}
assert matrix.rank()==5
p=s.expand(q.subs(sol));first=s.diff(p,t);second=s.diff(p,t,2)
assert all(bool(k.subs(sol)) for k in conditions)
assert s.expand(first-(t-20)*(2*t*t-5*t+200)/40000)==0
assert s.expand(second-3*(t-5)*(t-10)/20000)==0
assert s.diff(p,t,3).subs(t,10)==s.Rational(3,4000)
assert s.expand(2*(t-s.Rational(5,4))**2+s.Rational(1575,8))==2*t*t-5*t+200
assert second.subs(t,7)<0 and second.subs(t,11)>0
assert second.subs(t,4)>0 and second.subs(t,6)<0
assert sum(x['points'] for x in raw['examData']['scoring']['steps'])==13
assert raw['examData']['scoring']['maxPoints']==13
assert raw['examData']['scoring']['passingPoints']==11
assert set(raw['examData']['scoring'])=={'maxPoints','passingPoints','steps'}
assert all(set(step)=={'id','points','description'} for step in raw['examData']['scoring']['steps'])
for key in ['taskContent','solutionContent','taskContentEn','solutionContentEn']:
 assert raw['examData'][key].strip()
 assert '\\t' not in raw['examData'][key] or '\\text' in raw['examData'][key]
for lang,suffix in [('de',''),('en','En')]:
 text=(base/f'candidate.{lang}.md').read_text()
 assert raw['examData']['taskContent'+suffix] in text
 assert raw['examData']['solutionContent'+suffix] in text
 assert not re.search(r'\b1 points\b',text)
 assert ('höchstens 10 BE' if lang=='de' else 'capped at 10 points') in raw['examData']['taskContent'+suffix]
 assert ('ab 11 BE' if lang=='de' else '11 points are required') in raw['examData']['taskContent'+suffix]
delta=json.loads((base/'candidate.delta.json').read_text())
assert delta['operations'][0]['after']==raw
assert 'contentLevel' not in delta['placementProposal']
proof={'status':'EXACT_SYMBOLIC_AND_ARTIFACT_CHECK_NOT_CONTENT_OR_SCOPE_ACCEPTANCE','candidateGoalSha256':hashlib.sha256((base/'candidate.new-goal.json').read_bytes()).hexdigest(),'solution':{str(k):str(v) for k,v in sol.items()},'uniqueCoefficientSystemRank':int(matrix.rank()),'polynomial':str(p),'firstDerivativeFactorization':str(s.factor(first)),'secondDerivativeFactorization':str(s.factor(second)),'actualInflectionPoints':[5,10],'thirdDerivativeAt10':str(s.diff(p,t,3).subs(t,10)),'allFiveBoundaryAndInflectionConditionsChecked':True,'bothC1JoinsChecked':True,'heightBounds':'7/2 <= q(t) <= 5 for 0 <= t <= 20; derivative negative before20','noC2JoinClaim':True,'points':13,'passPoints':11,'ordinaryRubricCapInExistingTextFields':10,'noNewScoringOrResultFields':True,'embeddedDeEnTaskAndSolutionEqualMarkdown':True,'deltaAfterEqualsGoal':True,'coveredGoalCount':3,'existingGoalsChanged':0}
(base/'symbolic-proof.json').write_text(json.dumps(proof,indent=2)+'\n')
print(json.dumps(proof,indent=2))
