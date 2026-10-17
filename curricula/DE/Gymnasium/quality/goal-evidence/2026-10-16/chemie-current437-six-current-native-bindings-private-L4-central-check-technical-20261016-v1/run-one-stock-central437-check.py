# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import datetime,hashlib,json,os,subprocess,time
R=Path('/home/enpasos/projects/skillpilot');O=Path(__file__).resolve().parent;L=R/'tmp/chemie-m7-resumed-20261016/chemie-combined639-two-GK-priors-final-review-capsule-v1';C='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
def sha(p):return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
def pin(p):return {'path':str(Path(p).relative_to(R)),'sha256':sha(p),'bytes':Path(p).stat().st_size}
def read(p):return json.loads(Path(p).read_text())
assert not(O/'EXECUTION.actual-single-stock-central437-L4-check.json').exists();assert read(O/'CHECK.preflight-actual-six-current-kind-P-stock-and-D-owner-chains.json')['protectedInputDrift']==[];before=sha(L/C);assert before=='sha256:36975262a3d66998c75cca5c9bbe899d57f98b2614edcbded2baec4833e77903'
cfg=O/'central.current437.six-current-native-bindings.private-L4.inactive.config.json';assert sha(L/cfg.relative_to(R))==sha(cfg)
cmd=['node','--preserve-symlinks','--preserve-symlinks-main','app/node_modules/tsx/dist/cli.mjs','app/scripts/reportDeepUnderstandingRollout.ts','--config='+str(cfg.relative_to(R)),'--mode=check','--format=json'];env=dict(os.environ);env['NODE_OPTIONS']='--preserve-symlinks --preserve-symlinks-main';env['NO_COLOR']='1';started=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic()
with(O/'CENTRAL.actual-current437-L4.raw.stdout.json').open('xb')as stdout,(O/'CENTRAL.actual-current437-L4.raw.stderr.txt').open('xb')as stderr:
 p=subprocess.run(cmd,cwd=L,env=env,stdout=stdout,stderr=stderr)
receipt={'role':'Exactly one actual unmodified stock central437CLI technical checkpoint; not fullLayerA/M7/human acceptance','startedAt':started,'finishedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'elapsedSeconds':time.monotonic()-t,'command':cmd,'cwd':str(L.relative_to(R)),'explicitEnvironment':{'NODE_OPTIONS':env['NODE_OPTIONS'],'NO_COLOR':'1'},'exitCode':p.returncode,'currentConfig':pin(cfg),'canonicalBeforeSHA256':before,'canonicalAfterSHA256':sha(L/C),'canonicalUnchanged':sha(L/C)==before,'stdout':pin(O/'CENTRAL.actual-current437-L4.raw.stdout.json'),'stderr':pin(O/'CENTRAL.actual-current437-L4.raw.stderr.txt'),'knownOpenExternalGates':['APV203152 metadata differences remain uncorrected/unaccepted','HE145/327 current whole-admission originalA/B-informed evidence pending'],'normalR_H_K_L_L2_L3Writes':0,'newScienceVotes':0,'HumanApproval':False,'HumanTrial':False,'M7Claim':False}
(O/'EXECUTION.actual-single-stock-central437-L4-check.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt,indent=2));
try:
 report=read(O/'CENTRAL.actual-current437-L4.raw.stdout.json');print(json.dumps({'blockingIssueCount':report['blockingIssueCount'],'subjects':[{'subject':s['subject'],'denominator':s['denominator'],'strictComplete':s['strictComplete'],'gates':s['gates'],'requiredChecks':s['requiredChecks'],'issues':s['issues']}for s in report['subjects']]},indent=2))
except Exception as e:print('Raw output is not a complete report:',str(e))
