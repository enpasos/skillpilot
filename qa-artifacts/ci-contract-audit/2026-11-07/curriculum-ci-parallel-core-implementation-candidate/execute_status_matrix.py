from pathlib import Path
import yaml,json,os,subprocess,hashlib
W=Path('/dev/shm/curriculum-ci-parallel-core-candidate-20261107');workflow=(W/'candidate-root/.github/workflows/ci.yml').read_text();step=yaml.safe_load(workflow)['jobs']['curriculum-ci']['steps'][0];body=step['run'];assert step['name']=='Require successful curriculum core and verified book build';assert step['shell']=='bash';assert step['working-directory']=='${{ runner.temp }}';assert step['if']=='${{ always() }}';(W/'status-guard.extracted.sh').write_text(body)
rows=[]
for core in ['success','failure','cancelled','skipped','',None,'neutral']:
 for book in ['success','failure','cancelled','skipped','',None,'neutral']:
  env={'PATH':os.environ['PATH']}
  if core is not None:env['CURRICULUM_CORE_RESULT']=core
  if book is not None:env['CURRICULUM_BOOK_RESULT']=book
  result=subprocess.run(['bash','--noprofile','--norc','-c',body],env=env,cwd=W,text=True,capture_output=True,timeout=2)
  expected=0 if core==book=='success' else 1;assert result.returncode==expected,(core,book,result)
  rows.append({'core':core,'book':book,'coreMissing':core is None,'bookMissing':book is None,'expectedExitCode':expected,'actualExitCode':result.returncode,'stdout':result.stdout,'stderr':result.stderr})
report={'method':'PyYAML actual candidate first-step run extraction followed by actual bash --noprofile --norc -c; no rewritten guard','guardSha256':hashlib.sha256(body.encode()).hexdigest(),'cases':rows,'caseCount':len(rows),'successCases':sum(r['actualExitCode']==0 for r in rows),'rejectedCases':sum(r['actualExitCode']==1 for r in rows),'workflowSourceCommandsExecuted':False,'githubRunnerLifecycleTested':False};assert report['caseCount']==49 and report['successCases']==1 and report['rejectedCases']==48;(W/'status-matrix.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k!='cases'},indent=2))
