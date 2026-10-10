from pathlib import Path
import subprocess,json,time,datetime,hashlib
ROOT=Path('/home/enpasos/projects/skillpilot')
S=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-source7-normal37-reviewed-inactive-j-private-completion-technical-successor-20261010-v2')
CAP=ROOT/'tmp/m7-resumption-20261010/chemistry-source7-normal37-j-integration-isolated-v3'
config=S/'registry/all-subjects-latestBio353-chem-only-reviewed.inactive.config.json';out=ROOT/S/'checks/candidate-current398-central.attempt5.actual.report.json';err=ROOT/S/'checks/candidate-current398-central.attempt5.actual.stderr.txt'
cmd=[str(ROOT/'app/node_modules/.bin/tsx'),'app/scripts/reportDeepUnderstandingRollout.ts','--config='+str(config),'--mode=check','--format=json'];start=time.monotonic();began=datetime.datetime.now(datetime.timezone.utc).isoformat()
with out.open('wb') as a,err.open('wb') as b:r=subprocess.run(cmd,cwd=CAP,stdout=a,stderr=b)
def bind(p):return {'path':str(p.relative_to(ROOT)),'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
receipt={'schemaVersion':1,'argv':cmd,'cwdIsPrivateRuntime':str(CAP.relative_to(ROOT)),'actualExitCode':r.returncode,'startedAt':began,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'durationSeconds':time.monotonic()-start,'config':bind(ROOT/config),'stdout':bind(out),'stderr':bind(err),'normalRulesUnchanged':True,'latestBio353Basis':True,'activeWrites':[],'newScientificReviews':0,'humanApproval':False}
(ROOT/S/'checks/candidate-current398-central.attempt5.terminal.actual.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt));raise SystemExit(r.returncode)
