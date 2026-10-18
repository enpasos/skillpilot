import json,sys,subprocess,hashlib
from pathlib import Path
from review_tools import OWN,roundpath,save,digest
n=int(sys.argv[1]);rows=json.loads((OWN/f'batch-{n:03d}.rows.json').read_text());tail=OWN/f'batch-{n:03d}.tail.json'
if tail.exists():rows+=json.loads(tail.read_text())
p=roundpath(n);inp=json.loads((p/'description-review-input.json').read_text());bookp=p.parent/'bundle/book-model.json';book=json.loads(bookp.read_text());pages={v['goalId']:v for v in book['pages']}
for g in inp['goals']:
 page=pages[g['goalId']];assert page['description']==g['currentDescriptionDe'];assert page['title']==g['currentTitleDe'];assert page['pageFingerprint']==g['pageFingerprint'];assert page==g['reviewContext']['page']
for name in ['prompt.md','criteria.md','contracts/goal-description-review-record.schema.json']:
 assert (p/name).read_bytes()==(roundpath(1)/name).read_bytes()
save(n,rows)
cmd=['npx','--prefix','app','tsx','app/scripts/validateGoalDescriptionReviewCampaignResults.ts','--bundle',str(p/'review-bundle-manifest.json'),'--input',str(p/'description-review-input.json'),'--campaign',str(p/'description-review-campaign.json'),'--batches-dir',str(p/'batches'),'--results-dir',str(p/'results')]
r=subprocess.run(cmd,text=True,capture_output=True);log={'command':cmd,'exitCode':r.returncode,'stdout':r.stdout,'stderr':r.stderr,'actualBook':{'path':str(bookp),'sha256':digest(bookp.read_bytes()),'bytes':bookp.stat().st_size,'allAssignedPagesExactMatch':True},'ownPromptCriteriaSchemaIdenticalAndApplied':True};(OWN/f'batch-{n:03d}.validation.json').write_text(json.dumps(log,indent=2)+'\n');print(r.stdout,r.stderr);assert r.returncode==0
