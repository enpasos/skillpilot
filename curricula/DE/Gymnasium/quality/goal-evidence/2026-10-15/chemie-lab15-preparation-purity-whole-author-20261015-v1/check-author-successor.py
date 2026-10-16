from pathlib import Path
import json,hashlib,datetime,subprocess,os,importlib.util,sys,copy
import jsonschema
R=Path(__file__).parent
A=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-laboratory-communication-fifteen-current419-whole-author-20261015-v1')
def h(x):return 'sha256:'+hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def ref(p):b=p.read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
g=json.loads((R/'candidate/one-whole-current-goal.exact.json').read_text());before=next(x for x in json.loads((A/'candidate/fifteen-whole-current-goals.exact.json').read_text())['goals'] if x['id']==g['id']);assert before==g
src=json.loads((A/'materials/thirty-complete-DE-EN-cases.author.json').read_text())['cases'];new=json.loads((R/'materials/two-complete-DE-EN-cases.one-goal.author.json').read_text());aa=next(c for c in src if c['caseId']=='lab15-06-a');bb=next(c for c in src if c['caseId']=='lab15-06-b');assert new['cases'][0]==aa
for x in new['untouchedOther28']['caseRefs']:assert x['wholeCaseObjectDigest']==h(next(c for c in src if c['caseId']==x['caseId']))
assert len(new['untouchedOther28']['caseRefs'])==28
schema=json.loads(Path('contracts/goal-evidence/v2/goal-evidence-profile.schema.json').read_text());raw=[json.loads(x) for x in (R/'candidate/one-profile.raw-E0G0.production-helper.jsonl').read_text().splitlines()];assert len(raw)==1
errors=[e.message for e in jsonschema.Draft202012Validator(schema,format_checker=jsonschema.FormatChecker()).iter_errors(raw[0])];assert not errors,errors
for p in R.rglob('*.json'):json.loads(p.read_text())
for p in R.rglob('*.jsonl'):
 for line in p.read_text().splitlines():json.loads(line)
cas={'schemaVersion':1,'kind':'bounded-whole-object-CAS-proposal-no-active-write','checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'goalId':g['id'],'baseWholeGoals':ref(A/'candidate/fifteen-whole-current-goals.exact.json'),'beforeWholeGoalObjectDigest':h(before),'afterWholeGoalObjectDigest':h(g),'wholeObjectEqual':before==g,'permittedGoalFieldsChanged':[],'allWholeGoalFieldsUnchanged':True,'materialPatch':{'beforeFullCaseContainer':ref(A/'materials/thirty-complete-DE-EN-cases.author.json'),'retainedCaseA':{'caseId':'lab15-06-a','beforeObjectDigest':h(aa),'afterObjectDigest':h(new['cases'][0]),'equal':True},'replaceExactlyOneCase':{'beforeCaseId':'lab15-06-b','beforeWholeObjectDigest':h(bb),'afterCaseId':new['cases'][1]['caseId'],'afterWholeObjectDigest':h(new['cases'][1])},'other28ExactReferencesVerified':28},'profilePatch':{'oldRawSource':ref(A/'candidate/fifteen-profiles.raw-E0G0.author.jsonl'),'goalId':g['id'],'newRaw':ref(R/'candidate/one-profile.raw-E0G0.production-helper.jsonl'),'newEvidenceLevel':'E0','newMaximumClaimScope':'G0'},'applyStatus':'not-applied','newGateVotes':0,'humanApproval':False,'humanTrial':False}
(R/'candidate/BOUNDED.whole-object-CAS.author.json').write_text(json.dumps(cas,ensure_ascii=False,indent=2)+'\n')
calcs=[]
def check(name,computed,expected,tol=1e-9):assert abs(computed-expected)<=tol;(calcs.append({'name':name,'computed':computed,'expected':expected,'tolerance':tol,'passed':True}))
theo=.2300/138.12*180.16
check('SA mmol',.2300/138.12*1000,1.665218650448885,tol=1e-6)
check('anhydride mmol',.9000/102.09*1000,8.81575080811049)
check('theoretical ASA g',theo,.3000057920648711)
check('analytical withdrawal g',.050+.002,.052)
check('recrystallisation charge g',.247-.052,.195)
check('crude gross mass yield percent',.247/theo*100,82.33174376499722,tol=1e-5)
check('purified actual gross mass yield percent',.160/theo*100,53.33230365279172)
check('purification recovery percent',.160/.195*100,82.05128205128204)
check('crude SA lower mass percent',.6/50*100,1.2);check('crude SA upper mass percent',.8/50*100,1.6)
check('purified SA lower mass percent',.2/50*100,.4);check('purified SA upper mass percent',.4/50*100,.8)
check('conditional binary-model corrected lower yield',.160*.992/theo*100,52.905645223569385)
check('conditional binary-model corrected upper yield',.160*.996/theo*100,53.11897443818055)
for volume in [0,2,4,6,8,12]:check(f'SA standard{volume}mL mg',volume*.100,{0:0,2:.2,4:.4,6:.6,8:.8,12:1.2}[volume])
check('retained06-a salt purity percent',2.565/2.7*100,95);check('retained06-a salt recovery percent',2.565/3*100,85.5)
left={'C':7+4,'H':6+6,'O':3+3};right={'C':9+2,'H':8+4,'O':4+2};assert left==right
(R/'checks/ARITHMETIC.author.actual.json').write_text(json.dumps({'calculatedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'dataStatus':'fictional teaching data, no real experiment','checks':calcs,'reaction':'C7H6O3+C4H6O3 -> C9H8O4+C2H4O2','leftAtoms':left,'rightAtoms':right,'atomBalancePassed':True,'purityBoundary':'Free-SA impurity bracket is measured in the future design; total ASA purity and any corrected yield remain conditional/unknown without exhaustive further analysis.'},ensure_ascii=False,indent=2)+'\n')
spec=importlib.util.spec_from_file_location('validate_schemas',Path('scripts/validate_schemas.py').resolve());mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
symlink=mod.curriculum_symlink_errors(Path('.'))
(R/'checks/curriculum_symlink_errors.actual.txt').write_text('Normal scripts.validate_schemas.curriculum_symlink_errors(real repository):\n'+('\n'.join(symlink) if symlink else '[]')+'\n')
(R/'checks/SCHEMA.JSON.CAS.actual.json').write_text(json.dumps({'checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'profileSchemaErrors':errors,'wholeGoalUnchanged':True,'retainedCaseAExact':True,'other28ReferencesExact':True,'normalCurriculumSymlinkErrors':symlink,'ownRootSymlinkErrors':[x for x in symlink if str(R) in x],'newIndependentGateVotes':0},ensure_ascii=False,indent=2)+'\n')
print('Schema/JSON/CAS valid. Actual arithmetic:',len(calcs),'plus atom balance. Normal curriculum_symlink_errors:',len(symlink))
