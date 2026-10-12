from pathlib import Path
import json,subprocess,concurrent.futures,datetime
R=Path('/home/enpasos/projects/skillpilot');B=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-three-current402-current217-preserving-root-preparation-20261012-v9';O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-current217-three-fresh-independent-b-20261012-v9';prefix=['npm','--prefix','app','run'];rel=lambda p:str(p.relative_to(R))
checks={
'D-native-first-pass':['validate:goal-description-review-campaign','--','--bundle',str(B/'native-D3/round-b/review-bundle-manifest.json'),'--input',str(B/'native-D3/round-b/description-review-input.json'),'--campaign',str(B/'native-D3/round-b/description-review-campaign.json'),'--batches-dir',str(B/'native-D3/round-b/batches'),'--results-dir',str(O/'D/results')],
'P-positive-v2':['quality:positive-goal-evidence:check','--','--config='+rel(O/'P/review.config.json')],
'A-semantic-atomicity':['quality:semantic-atomicity:check','--','--config='+rel(O/'A/review.config.json')],
'M-current-memory-and-views':['quality:memory-card-review:check','--','--config='+rel(O/'M/review.config.json')]
}
def check(pair):
 name,args=pair;start=datetime.datetime.now(datetime.timezone.utc).isoformat();p=subprocess.run(prefix+args,cwd=R,text=True,capture_output=True);receipt={'check':name,'argv':prefix+args,'cwd':str(R),'startedAt':start,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':p.returncode,'stdout':p.stdout,'stderr':p.stderr};(O/'receipts'/f'{name}.actual.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n');return receipt
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 for r in pool.map(check,checks.items()):print(r['check'],r['exitCode'],r['stdout'][-3500:],r['stderr'][-2500:])
