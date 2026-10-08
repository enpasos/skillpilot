#!/usr/bin/env python3
import pathlib,subprocess,json,datetime
ROOT=pathlib.Path('/home/enpasos/projects/skillpilot')
OWN=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-flora-fauna20-final-raster-native-independent-b-20261008-v1'
AUTHOR=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-flora-fauna20-final-raster-native-author-root-20261007-v1/native-raster-candidate/twenty/round-b'
campaign=json.loads((AUTHOR/'description-review-campaign.json').read_text());batch=campaign['batches'][0]['batchId']
commands={
 'D20-native-campaign': ['npm','--prefix','app','run','validate:goal-description-review-campaign','--','--bundle',str(AUTHOR/'review-bundle-manifest.json'),'--input',str(AUTHOR/'description-review-input.json'),'--campaign',str(AUTHOR/'description-review-campaign.json'),'--batches-dir',str(AUTHOR/'batches'),'--results-dir',str(OWN/'round-b/results')],
 'A20-retained-native': ['npm','--prefix','app','run','quality:semantic-atomicity:check','--','--config='+str(OWN/'A20.inactive-independent-b.native.config.json')],
 'M20-retained-flower-shared-deck-closure-native':['npm','--prefix','app','run','quality:memory-card-review:check','--','--config='+str(OWN/'M20.inactive-independent-b-flower-deck-closure.native.config.json')],
 'P20-native-inactive-api':['app/node_modules/.bin/tsx',str(OWN/'validate-own-P20.exact-inactive-native-api.mts')]
}
import concurrent.futures
def run(item):
 label,cmd=item
 began=datetime.datetime.now(datetime.timezone.utc).isoformat()
 p=subprocess.run(cmd,cwd=ROOT,capture_output=True,text=True)
 d=OWN/'checks';d.mkdir(exist_ok=True)
 (d/(label+'.stdout.actual.txt')).write_text(p.stdout);(d/(label+'.stderr.actual.txt')).write_text(p.stderr)
 r={'label':label,'argv':cmd,'startedAt':began,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':p.returncode,'stdout':str((d/(label+'.stdout.actual.txt')).relative_to(ROOT)),'stderr':str((d/(label+'.stderr.actual.txt')).relative_to(ROOT))}
 (d/(label+'.terminal.actual.json')).write_text(json.dumps(r,indent=2)+'\n')
 return {'label':label,'exitCode':p.returncode,'stdoutTail':p.stdout[-2600:],'stderrTail':p.stderr[-1200:]}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as e:
 for r in e.map(run,commands.items()):print(json.dumps(r,ensure_ascii=False))

