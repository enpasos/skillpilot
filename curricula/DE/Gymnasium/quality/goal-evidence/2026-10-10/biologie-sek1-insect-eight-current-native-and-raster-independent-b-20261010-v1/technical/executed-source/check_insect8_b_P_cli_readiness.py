# SPDX-License-Identifier: Apache-2.0
import json,pathlib,subprocess,hashlib
R=pathlib.Path.cwd();O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-sek1-insect-eight-current-native-and-raster-independent-b-20261010-v1'
def ref(p):
 p=pathlib.Path(p);b=p.read_bytes();return dict(path=str(p.relative_to(R)),sha256='sha256:'+hashlib.sha256(b).hexdigest(),bytes=len(b))
actual=[]
for n in ['current-seven-retained.exact.P','current-fcc-adult.independent-b.P']:
 cfg=O/'positive'/(n+'.config.json');cmd=['npx','--prefix','app','tsx','app/scripts/positiveGoalEvidenceReview.ts','--config='+str(cfg.relative_to(R)),'--mode=check'];r=subprocess.run(cmd,capture_output=True,text=True)
 for role,v in [('stdout',r.stdout),('stderr',r.stderr)]:
  p=O/'normal'/(n+'-active-P-CLI-readiness.'+role+'.actual.txt')
  with p.open('x') as f:f.write(v)
 row=dict(schemaVersion=1,role='Actual standard active-asset P CLI readiness check, not scientific review or approval',command=cmd,config=ref(cfg),stdout=ref(O/'normal'/(n+'-active-P-CLI-readiness.stdout.actual.txt')),stderr=ref(O/'normal'/(n+'-active-P-CLI-readiness.stderr.actual.txt')),exitCode=r.returncode,activeAssetAdoptionPending=True,normalExactInactiveAssetSchemaAndSemanticsPassed=True,reason='Inactive exact candidate PNGs cannot resolve through standard app/public path before parent adoption. Normal checker unchanged; repeat actual active P CLI after adopting exact assets.',gateWeakened=False,activeWrites=False,humanApproval=False,strictNetGain=0)
 with (O/'normal'/(n+'-active-P-CLI-readiness.actual.json')).open('x') as f:json.dump(row,f,ensure_ascii=False,indent=2);f.write('\n')
 print(json.dumps(dict(role=n,exitCode=r.returncode,stdoutTail=r.stdout[-2300:],stderrTail=r.stderr[-1000:]),ensure_ascii=False));actual.append(row)
 assert r.returncode==1 and ('missing' in r.stdout.lower() or 'stale reviewinputfingerprint' in r.stdout.lower())
