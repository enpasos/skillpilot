#!/usr/bin/env python3
from pathlib import Path
import json,subprocess,sys
OUT=Path(__file__).resolve().parent;ROOT=OUT.parents[3]
NEW='234b9cee0f87d937edfa8410c36483ebdc55b5032d84947c5188c3f3b74f8785'
OLD57='46416dd5939db442dd82c9905008cb89c79dbe9db08e9b19b03f10cde7fd3fd0'
OLD54='3421fa1a64b0c9ccac607bd283fabc3aeeb2391aec6cad0118f317d81c87742e'
LIMITS={'working':201326592,'object':268435456,'embedded':16777216}
def selector(form,value=NEW):
 if form=='normal':return ['--accepted-census-sha256',value]
 if form=='double':return ['--accepted-census-sha256',OLD57 if value==NEW else NEW,'--accepted-census-sha256',value]
 if form=='equals':return ['--accepted-census-sha256='+value]
 if form=='abbrev':return ['--accepted-census-s',value]
 if form=='abbrev-equals':return ['--accepted-census-s='+value]
 raise AssertionError(form)
def limit(form,kind,value):
 flag='--maximum-'+kind+'-bytes'
 if form=='normal':return [flag,str(value)]
 if form=='double':return [flag,str(LIMITS[kind]),flag,str(value)]
 if form=='reverse-double':return [flag,str(LIMITS[kind]+1),flag,str(value)]
 if form=='equals':return [flag+'='+str(value)]
 if form=='abbrev':return ['--maximum-'+kind[0],str(value)]
 if form=='abbrev-equals':return ['--maximum-'+kind[0]+'='+str(value)]
 raise AssertionError(form)
def base(action):return [action,'--repository-root',str(ROOT),'--accepted-commit','25a6f2164a81a7e6ae50db3557d20521fecf5124','--output','/dev/shm/not-created-effective-namespace-probe']
def resource_args(except_kind=None):
 args=[]
 for kind,value in LIMITS.items():
  if kind!=except_kind:args+=limit('normal',kind,value)
 return args
cases=[]
for action in ['build','materialize']:
 for kind,bound in LIMITS.items():
  for select_form in ['normal','double','equals','abbrev','abbrev-equals']:
   for limit_form in ['normal','double','equals','abbrev','abbrev-equals']:
    cases.append({'id':f'{action}-{kind}-over-{select_form}-selector-{limit_form}-limit','argv':base(action)+selector(select_form)+resource_args(kind)+limit(limit_form,kind,bound+1),'expectReject':True})
   cases.append({'id':f'{action}-{kind}-reverse-double-valid-{select_form}-selector','argv':base(action)+selector(select_form)+resource_args(kind)+limit('reverse-double',kind,bound),'expectReject':False})
 for select_form in ['normal','double','equals','abbrev','abbrev-equals']:
  cases.append({'id':f'{action}-all-exact-bound-{select_form}-selector','argv':base(action)+selector(select_form)+resource_args(),'expectReject':False})
  for legacy in [OLD54,OLD57]:
   resources=[]
   for kind,bound in LIMITS.items():resources+=limit('abbrev-equals',kind,bound+1)
   cases.append({'id':f'{action}-legacy{54 if legacy==OLD54 else 57}-unchanged-{select_form}-selector','argv':base(action)+selector(select_form,legacy)+resources,'expectReject':False})
# Re-run each exact Root counterexample against the corrected post-parse guard.
root_cases=json.loads((ROOT/'qa-artifacts/ci-contract-audit/2026-11-07/economics-fixed74-independent-integration-review/case-inputs.json').read_bytes())
cases += [{'id':'exact-root-counterexample-'+row['id'],'argv':row['argv'],'expectReject':True}for row in root_cases]
results=[]
for case in cases:
 run=subprocess.run([sys.executable,'-B',str(OUT/'actual-parser-probe.py'),json.dumps(case)],capture_output=True,text=True)
 assert run.returncode==0,(case['id'],run.stderr)
 row=json.loads(run.stdout);assert row['actualParseCount']==1,(case['id'],row)
 assert row['originalActionReached'] is not case['expectReject'],(case['id'],row)
 if case['expectReject']:assert row['error']and'Fixed74 'in row['error']['message'],(case['id'],row)
 else:assert row['actionReceivedExactSameNamespace']and row['error']is None,(case['id'],row)
 results.append(dict(row,expectedReject=case['expectReject']))
(OUT/'effective-namespace-cases.json').write_text(json.dumps(cases,indent=2)+'\n')
(OUT/'effective-namespace-results.json').write_text(json.dumps({'method':'One actual unchanged ArgumentParser.parse_args returns its real Namespace; original-action spy stops only after the new guard. No replacement parser or original materialization in these cases.',
 'cases':len(results),'rejectedBeforeOriginalAction':sum(case['expectedReject']for case in results),'allowedExactNamespaceCases':sum(not case['expectedReject']for case in results),
 'allActualParserCountsExactlyOne':True,'bothActionsCovered':True,'allExpectationsMet':True,'results':results},indent=2)+'\n')
print(json.dumps({'cases':len(results),'rejected':sum(row['expectedReject']for row in results),'allowed':sum(not row['expectedReject']for row in results),'allExpectationsMet':True}))
