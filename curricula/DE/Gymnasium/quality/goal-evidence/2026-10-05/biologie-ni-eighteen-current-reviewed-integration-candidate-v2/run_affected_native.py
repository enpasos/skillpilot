#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Capture real bounded native checks; never turn failed streams into JSON."""
from pathlib import Path
from datetime import datetime,timezone
import json,subprocess,sys,hashlib,concurrent.futures,shutil
ROOT=Path('/home/enpasos/projects/skillpilot')
OWN=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-ni-eighteen-current-reviewed-integration-candidate-v2')
CODE=ROOT/'tmp/biologie-ni-eighteen-current-reviewed-integration-candidate-v2-native-root'
OUT=ROOT/OWN
TSX=ROOT/'app/node_modules/.bin/tsx'
def run(label,args):
 cmd=[str(TSX),*args];started=datetime.now(timezone.utc).isoformat();r=subprocess.run(cmd,cwd=CODE,capture_output=True,text=True)
 (OUT/(label+'.stdout.txt')).write_text(r.stdout);(OUT/(label+'.stderr.txt')).write_text(r.stderr)
 receipt={'label':label,'command':cmd,'cwd':str(CODE),'startedAtUTC':started,'completedAtUTC':datetime.now(timezone.utc).isoformat(),'exitCode':r.returncode,'stdoutSHA256':hashlib.sha256(r.stdout.encode()).hexdigest(),'stderrSHA256':hashlib.sha256(r.stderr.encode()).hexdigest(),'noActiveWrites':True}
 (OUT/(label+'.actual.receipt.json')).write_text(json.dumps(receipt,indent=2)+'\n');print(label,r.returncode,flush=True)
 if r.returncode:print(r.stdout[-3000:],r.stderr[-3000:],flush=True)
 return r.returncode
def positive_group(label,write):
 cfg=str(OWN/(label+'.config.json'));candidates=str(OWN/(label+'.candidates.json'));codes=[]
 if write:
  codes.append(run(label+'-materialize',['app/scripts/materializePositiveGoalEvidenceCandidates.ts','--config',cfg,'--candidates',candidates,'--write']))
  if codes[-1]:return codes
  codes.append(run(label+'-verify',['app/scripts/materializePositiveGoalEvidenceCandidates.ts','--config',cfg,'--candidates',candidates]))
 codes.append(run(label+'-check',['app/scripts/positiveGoalEvidenceReview.ts','--config='+cfg,'--mode=check']))
 return codes
def main():
 mode=sys.argv[1] if len(sys.argv)>1 else 'affected'
 if mode=='affected':
  with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
   work=[pool.submit(positive_group,'positive.one-existing-current-context',True),pool.submit(positive_group,'positive.five-kept-current-metadata',True),pool.submit(positive_group,'positive.thirteen.independent-current',False),pool.submit(positive_group,'positive.two-existing-exact',False)]
   codes=[c for task in work for c in task.result()]
  for label,script in [('atomicity','semanticAtomicityReview.ts'),('memory','memoryCardReview.ts')]:
   codes.append(run('full-'+label+'-actual-check',['app/scripts/'+script,'--config='+str(OWN/('full-'+label+'.config.json')),'--mode=check']))
 elif mode=='central':codes=[run('future-central-biologie-actual-check',['app/scripts/reportDeepUnderstandingRollout.ts','--config='+str(OWN/'central-biologie-future.config.json'),'--mode=check','--format=json'])]
 else:raise ValueError(mode)
 shutil.copy2(__file__,OUT/Path(__file__).name)
 print(json.dumps({'mode':mode,'exitCodes':codes,'allPassed':not any(codes)}));return int(any(codes))
if __name__=='__main__':raise SystemExit(main())
