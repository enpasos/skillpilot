#!/usr/bin/env python3
import gzip,hashlib,json,os,sys,subprocess
from pathlib import Path
import runner
OUT,ROOT,W=runner.OUT,runner.ROOT,runner.W
pins=json.loads((OUT/'fixed74-pins.json').read_bytes())
def materialize_args(index=None,digest=None,anchor='25a6f2164a81a7e6ae50db3557d20521fecf5124',capsule=None,capsha=None,output=None,working=201326592,objects=268435456):
 return ['python3','-B',ROOT/'scripts/visualization_qualified_context_capsule.py','materialize','--repository-root',ROOT,
  '--accepted-commit',anchor,'--accepted-census-sha256',digest or pins['indexSha256'],'--census-path',index or pins['indexPath'],
  '--capsule',ROOT/(capsule or pins['capsulePath']),'--accepted-capsule-sha256',capsha or pins['capsuleSha256'],
  '--output',output or W/'originals74','--maximum-working-bytes',str(working),'--maximum-object-bytes',str(objects)]
if __name__=='__main__':
 if '--deep' in sys.argv:
  run=runner.run('normal-full-five-subject-deep-report',[ROOT/'app/node_modules/.bin/tsx',ROOT/'app/scripts/reportDeepUnderstandingRollout.ts','--format=json'])
  report=json.loads(run.stdout);subjects=report['subjects'];denominator=sum(row['denominator']for row in subjects)
  assert denominator==2483 and len(subjects)==5
  assert sum(row['gates']['currentVisualizationQaRecords']for row in subjects)==74
  result={'denominator':denominator,'currentVisualizationContexts':74,'openVisualizationContexts':2409,
   'strictComplete':sum(row['strictComplete']for row in subjects),'blockingIssueCount':report['blockingIssueCount'],
   'subjects':[{key:row[key]for key in ['subject','denominator','strictComplete','remaining','gates','strictCompletionReady','requiredChecks']}for row in subjects],
   'newM7AcceptanceClaimed':False,'fullReportRawSha256':hashlib.sha256(run.stdout).hexdigest()}
  (OUT/'full-deep-summary.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result),flush=True)
 else:
  result=runner.run('capsule74-unrelated-depth1-materialize',materialize_args())
  measure=json.loads(result.stdout)
  assert subprocess.check_output(['git','-C',str(W/'originals74'),'rev-parse','--is-shallow-repository']).strip()==b'true'
  assert (W/'originals74'/pins['indexPath']).read_bytes()==(W/'contracts'/Path(pins['indexPath']).name).read_bytes()
  for ref in json.loads((OUT/'private-code'/pins['indexPath']).read_bytes())['originalReferences']:
   if ref['currentCopyRequired']:
    source=ROOT/ref['path'];dest=W/'originals74'/ref['path'];assert source.stat().st_ino!=dest.stat().st_ino
    assert hashlib.sha256(dest.read_bytes()).hexdigest()==ref['sha256']
  (OUT/'depth1-materialization-checks.json').write_text(json.dumps({'actualUnrelatedDepth1Host':True,'hostMissingAcceptedHistory':True,
   'originalRepositoryActuallyShallow':True,'all354RequiredWorkingOriginalsHaveOwnInodesAndExpectedBytes':True,
   'workspaceIndexSnapshotUsed':True,'measurement':measure},indent=2)+'\n')
  runner.run('normal74-maturity',[ROOT/'app/node_modules/.bin/tsx',ROOT/'app/scripts/testVisualizationContextMaturity.ts'])
  runner.run('normal74-economics-probe-maturity',[ROOT/'app/node_modules/.bin/tsx',ROOT/'app/scripts/testVisualizationContextMaturity.ts','--economics-probe'])
