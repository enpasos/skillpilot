#!/usr/bin/env python3
import datetime
import hashlib
import json
from pathlib import Path
import subprocess
import sys

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[6]
REL = str(OUT.relative_to(ROOT))
BASE = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next17-targeted-description-routing-context-author-v2-20261007'
P3 = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next17-p580b-control-material-author-v3-20261007'
TSX = 'app/node_modules/.bin/tsx'

def check(label, argv):
    started = datetime.datetime.now(datetime.timezone.utc).isoformat()
    run = subprocess.run(argv, cwd=ROOT, capture_output=True)
    log = OUT/'qa-artifacts'/label
    Path(str(log)+'.stdout.txt').write_bytes(run.stdout)
    Path(str(log)+'.stderr.txt').write_bytes(run.stderr)
    receipt = {'argv':argv,'startedAt':started,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':run.returncode,'stdoutSha256':hashlib.sha256(run.stdout).hexdigest(),'stderrSha256':hashlib.sha256(run.stderr).hexdigest(),'nativeHelperChanged':False,'humanApproval':False,'strictNetGain':0}
    with Path(str(log)+'.actual.receipt.json').open('x') as f:f.write(json.dumps(receipt,indent=2)+'\n')
    print(label,run.returncode,run.stdout.decode().strip(),run.stderr.decode().strip())
    if run.returncode:sys.exit(run.returncode)

mode=sys.argv[1]
if mode=='d-campaign':
    check('native-d-a-campaign-results',[TSX,'app/scripts/validateGoalDescriptionReviewCampaignResults.ts','--bundle',REL+'/native-d-a/review-bundle-manifest.json','--input',REL+'/native-d-a/description-review-input.json','--campaign',REL+'/native-d-a/description-review-campaign.json','--batches-dir',REL+'/native-d-a/batches','--results-dir',REL+'/native-d-a/results'])
elif mode=='d-batch':
    check('native-exact-author-v2-d17-batch-check',[TSX,'app/scripts/materializeGoalDescriptionRolloutBatch.ts','check','--config',BASE+'/configs/native-d-seventeen.batch.config.json'])
elif mode=='p17':
    check('native-current-p17-materialize',[TSX,'app/scripts/materializePositiveGoalEvidenceCandidates.ts','--config',REL+'/native-p17-current-author-bodies.config.json','--candidates',P3+'/candidate/positive17.corrected-author-candidate-set.json','--write'])
    check('native-current-p17-check',[TSX,'app/scripts/positiveGoalEvidenceReview.ts','--mode=check','--config='+REL+'/native-p17-current-author-bodies.config.json'])
elif mode=='p580b':
    check('native-current-p580b-v3-check',[TSX,'app/scripts/positiveGoalEvidenceReview.ts','--mode=check','--config='+P3+'/configs/positive1.p580b.author-candidates.config.json'])
else:raise ValueError(mode)
