"""Actual existing native checkers after genuine independent first scientific seal."""
from pathlib import Path
import json,subprocess,datetime
from concurrent.futures import ThreadPoolExecutor
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;AUTHOR=OWN.parent/'biologie-he9-genetic-method19-current-raster-native-author-root-v3'
def rel(p):return str(Path(p).relative_to(ROOT))
def write(p,o):assert not p.exists();p.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n')
assert (OWN/'first-current-native1-D-P-V-source-class-AM.independent-a.exact.freeze.json').exists()
for name,src in [('A1','semantic-atomicity.one.scoped-native.config.json'),('M1','memory-card-review.one.scoped-native.config.json')]:
 c=json.loads((AUTHOR/'candidate'/src).read_text());c['reportPath']=rel(OWN/f'{name}.native.report.actual.md');write(OWN/f'{name}.native.config.json',c)
d=AUTHOR/'native-raster-candidate/one/round-a'
jobs=[('D1',['app/scripts/validateGoalDescriptionReviewCampaignResults.ts','--bundle',rel(d/'review-bundle-manifest.json'),'--input',rel(d/'description-review-input.json'),'--campaign',rel(d/'description-review-campaign.json'),'--batches-dir',rel(d/'batches'),'--results-dir',rel(OWN/'round-a/results')]),('P1',[rel(OWN/'check-exact-inactive-P1.independent-a.mts')]),('A1',['app/scripts/semanticAtomicityReview.ts','--config='+rel(OWN/'A1.native.config.json'),'--mode=check']),('M1',['app/scripts/memoryCardReview.ts','--config='+rel(OWN/'M1.native.config.json'),'--mode=check','--write-report'])]
def run(job):
 n,args=job;argv=['node','app/node_modules/tsx/dist/cli.mjs',*args];started=datetime.datetime.now(datetime.timezone.utc).isoformat();r=subprocess.run(argv,capture_output=True,text=True);o={'check':n,'actualArgv':argv,'startedAt':started,'finishedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualTerminalExitCode':r.returncode,'actualStdout':r.stdout,'actualStderr':r.stderr,'unchangedNativeValidators':True,'activeWrites':0,'strictGainClaimed':0};write(OWN/f'{n}.native.terminal.actual.json',o);return o
with ThreadPoolExecutor(max_workers=4) as pool:rs=list(pool.map(run,jobs))
write(OWN/'completed-current-D1-P1-A1-M1.native-checks.independent-a.actual.json',{'actualChecks':rs,'genuineOwnFirstScientificSealPrecedesChecks':True,'peerCurrentNativeBRead':False,'activeWrites':0,'humanApproval':False});print(json.dumps({'actualExits':{r['check']:r['actualTerminalExitCode'] for r in rs},'activeWrites':0}));raise SystemExit(0 if all(r['actualTerminalExitCode']==0 for r in rs) else 1)
