# SPDX-License-Identifier: Apache-2.0
import hashlib,importlib.util,json,subprocess,sys
from datetime import datetime,timezone
from pathlib import Path
B=Path(__file__).resolve().parents[1]
ROOT=Path.cwd()
assert (ROOT/'scripts/validate_schemas.py').is_file()
spec=importlib.util.spec_from_file_location('normal_schema_validator',ROOT/'scripts/validate_schemas.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
schema=json.loads((ROOT/module.SCHEMA_PATH).read_text())
files=sorted(B.rglob('*.json'))
assert all(module.validate_file(str(p),schema) for p in files)
source=json.loads((B/'sources/187-witnesses-98-source-goals.actual-primary-and-additive-deltas.author.json').read_text())
externals=[Path(d['actualPrimaryPath']) for d in source['actualPrimaryDocuments']]
for d in source['actualPrimaryDocuments']:
 p=Path(d['actualPrimaryPath']);assert p.is_file() and not p.is_symlink()
 assert 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()==d['sha256']
 assert p.stat().st_size==d['bytes']
paths=sorted(set([p.relative_to(ROOT) for p in B.rglob('*') if p.is_file()]+externals))
for p in paths:
 assert not p.is_symlink(),str(p)
 assert str(p).startswith('curricula/'),str(p)
 assert '/native-isolated-repo/' not in str(p) and '/node_modules/' not in str(p)
ignored=subprocess.run(['git','check-ignore','--stdin'],input=''.join(str(p)+'\n' for p in paths),text=True,capture_output=True)
assert ignored.returncode in [0,1] and not ignored.stdout,ignored.stdout+ignored.stderr
commands=[
 ['npx','--prefix','app','tsx',str(B/'checks/verify-selected-current-semantic-kinds.ts')],
 ['npx','--prefix','app','tsx','app/scripts/positiveGoalEvidenceReview.ts','--config='+str(B/'science/twelve-positive.config.author-pending.json'),'--mode=check'],
]
runs=[]
for command in commands:
 start=datetime.now(timezone.utc).isoformat()
 result=subprocess.run(command,text=True,capture_output=True)
 runs.append({'command':command,'startedAt':start,'finishedAt':datetime.now(timezone.utc).isoformat(),'exitCode':result.returncode,'stdout':result.stdout,'stderr':result.stderr})
 assert result.returncode==0,result.stdout+result.stderr
material=json.loads((B/'science/twelve-whole-profiles-and-twenty-four-cases.author.json').read_text())
assert len(material['wholeGoalsAndProfilesAndCases'])==12
assert sum(len(r['wholeMaterialCases']) for r in material['wholeGoalsAndProfilesAndCases'])==24
assert all(r['memoryAuthorDecision']['currentGoalHasMemorizationOrDeckTag'] is False for r in material['wholeGoalsAndProfilesAndCases'])
assert all(r['status']=='needs_human_review' and r['reviewAuthority']=='ai_candidate' and r['evidenceLevel']=='E1' and r['maximumClaimScope']=='G1' for r in material['wholeGoalsAndProfilesAndCases'])
proof={'schemaVersion':1,'role':'Actual targeted technical AUTHOR checks; no D/P/A/M/V approval','checkedAt':datetime.now(timezone.utc).isoformat(),'ordinarySchemaValidator':'scripts/validate_schemas.py:validate_file','ordinarySchemaValidatedOwnJsonCount':len(files),'ownAndActualPrimaryPathsCheckedRegularCommittableCount':len(paths),'actualPrimaryDocumentCount':len(externals),'normalCommands':runs,'selectedCurrentGoals':12,'wholeApplicationCases':24,'approved':0,'humanApproval':False,'humanTrial':False,'strictGain':0}
(B/'checks/actual-targeted-author-validation.json').write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'ownJsonValidated':len(files),'regularCommittablePaths':len(paths),'normalKindsExit':runs[0]['exitCode'],'normalPExit':runs[1]['exitCode'],'approved':0,'strictGain':0}))
