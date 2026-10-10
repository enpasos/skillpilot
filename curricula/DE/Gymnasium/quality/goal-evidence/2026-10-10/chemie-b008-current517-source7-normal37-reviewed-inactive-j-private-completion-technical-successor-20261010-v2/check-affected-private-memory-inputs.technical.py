from pathlib import Path
import subprocess,json,time,datetime,concurrent.futures
ROOT=Path('/home/enpasos/projects/skillpilot')
S=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-source7-normal37-reviewed-inactive-j-private-completion-technical-successor-20261010-v2')
CAP=ROOT/'tmp/m7-resumption-20261010/chemistry-source7-normal37-j-integration-isolated-v3'
config=json.loads((ROOT/S/'registry/all-subjects-latestBio353-chem-only-reviewed.inactive.config.json').read_text())
def run(subject):
 stem='memory-'+subject['subject']+'-exact-private-deck-inputs';out=ROOT/S/'checks'/(stem+'.stdout.txt');err=ROOT/S/'checks'/(stem+'.stderr.txt');cmd=[str(ROOT/'app/node_modules/.bin/tsx'),'app/scripts/memoryCardReview.ts','--config='+subject['memoryReviewConfigPath'],'--mode=check'];start=time.monotonic();began=datetime.datetime.now(datetime.timezone.utc).isoformat()
 with out.open('wb') as a,err.open('wb') as b:r=subprocess.run(cmd,cwd=CAP,stdout=a,stderr=b)
 q={'subject':subject['subject'],'argv':cmd,'actualExitCode':r.returncode,'startedAt':began,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'durationSeconds':time.monotonic()-start,'stdoutPath':str(out.relative_to(ROOT)),'stderrPath':str(err.relative_to(ROOT)),'newMemoryDecisions':0,'activeWrites':[]};(ROOT/S/'checks'/(stem+'.terminal.actual.json')).write_text(json.dumps(q,indent=2)+'\n');return q
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:rows=list(pool.map(run,config['subjects']))
(ROOT/S/'checks/all5-subject-private-memory-input-checks.actual.json').write_text(json.dumps({'schemaVersion':1,'rows':rows,'allActualNormalChecksPass':all(r['actualExitCode']==0 for r in rows),'newReviews':0,'activeWrites':[]},indent=2)+'\n');print(json.dumps([{'subject':r['subject'],'exit':r['actualExitCode'],'seconds':r['durationSeconds']} for r in rows]));assert all(r['actualExitCode']==0 for r in rows)
