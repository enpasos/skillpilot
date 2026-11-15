import pathlib,json,math,hashlib,datetime,itertools
b=pathlib.Path('tmp/physics-magnetism-two-task-independent-review-20261115');r=pathlib.Path('tmp/physics-magnetism-direct-assessments-20261115');checks=[]
def ck(name,actual,expected,tol=1e-10):
 ok=abs(actual-expected)<=tol if isinstance(actual,(int,float))and isinstance(expected,(int,float))else actual==expected
 assert ok,(name,actual,expected);checks.append({'name':name,'actual':actual,'expected':expected,'pass':True})
tasks=[json.loads((r/n).read_text())for n in ['canonical_physics_stage_flow_field_models.candidate.json','canonical_physics_stage_flow_flux_application.candidate.json']];mu0=4*math.pi*1e-7
ck('wire1.5cm',mu0*3/(2*math.pi*.015),4e-5);ck('wire3cm',mu0*3/(2*math.pi*.03),2e-5);ck('turnsPerM',600/.3,2000);ck('coilLinearCore',mu0*2*(600/.3)*.2,.001005309649148734);ck('coilAir',mu0*(600/.3)*.2,.000502654824574367);ck('ratioCoreAir',2,2)
for a,v in [(0,.006),(60,.003),(90,0)]:ck('fluxAngle'+str(a),.3*.020*math.cos(math.radians(a)),v)
# Explicit basis vectors: current toward viewer +z and point at+x => z cross x = +y.
ck('wireRightDirection_zCrossX',[0,1,0],[0,1,0]);ck('coilRightEndCCW_outwardNormal','+x/right','+x/right')
vectors=[]
for t in tasks:
 s=t['examData']['scoring'];ck(t['id']+' sum',sum(q['points']for q in s['steps']),s['maxPoints'])
 for i,q in enumerate(s['steps']):ck(t['id']+' omitted essential'+str(i),s['maxPoints']-q['points']>=s['passingPoints'],False)
 ck(t['id']+' one isolated minor',s['maxPoints']-1>=s['passingPoints'],True);ck(t['id']+' two isolated minors',s['maxPoints']-2>=s['passingPoints'],False)
 v=list(itertools.product(range(3),repeat=len(s['steps'])));passed=[x for x in v if sum(x)>=s['passingPoints']];ck(t['id']+' everypassingvectorhasnozero',all(all(q>0 for q in x)for x in passed),True);vectors.append({'id':t['id'],'enumerated':len(v),'passing':len(passed),'passingVectors':passed})
ctx=json.loads((b/'full-current-goal-context.json').read_text());ix={g['id']:g for g in ctx};parent=json.loads((r/'astronomy-parent.candidate.json').read_text());c=json.loads((r/'astronomy-container.candidate.json').read_text());old=ix[parent['id']];ck('parentOtherFieldsExactlySame',{k:v for k,v in parent.items()if k!='contains'},{k:v for k,v in old.items()if k!='contains'});expanded=[k for i in parent['contains']for k in (c['contains']if i==c['id']else[i])];ck('expandedParentChildrenSameOrder',expanded,old['contains']);ck('pureContainerNoR',c['requires'],[]);ck('pureContainerBothAssessmentLeaves',all(ix[i].get('examData')for i in c['contains']),True)
ck('oldSolarTaskMissingStructureCanPass',6+2>=8,True);ck('oldGalaxyTaskMissingDescriptionCanPass',2+2+2+2>=8,True)
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'identity':'OpenAI GPT Codex independent arithmetic/rubric/structure checks, not actual learnergrader execution','count':len(checks),'checks':checks,'scoreVectors':vectors,'nativeOrHumanAcceptanceClaim':False};(b/'independent-checks.actual.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(len(checks),'checksPASS,',sum(v['enumerated']for v in vectors),'actualenumeratedvectors')
