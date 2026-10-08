import hashlib
import json
import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path

ROOT=Path.cwd()
OWN=Path(__file__).resolve().parent
AUTHOR=OWN.parent/'biologie-he9-split-four-final-raster-native-author-technical-20261008-v1'
entry=json.loads((AUTHOR/'neutral-current-four-raster-native-author-review.entry.json').read_text())
round_b=ROOT/entry['operativeArtifacts']['firstPassB']
tsx=str(ROOT/'app/node_modules/.bin/tsx')
commands=[('actual-four-native-D-P-api',[tsx,str(OWN/'check-four-exact-inactive-native-D-P.independent-b.mts')]),
    ('actual-four-standard-D-campaign-cli',[tsx,str(ROOT/'app/scripts/validateGoalDescriptionReviewCampaignResults.ts'),
    '--bundle',str(round_b/'review-bundle-manifest.json'),'--input',str(round_b/'description-review-input.json'),
    '--campaign',str(round_b/'description-review-campaign.json'),'--batches-dir',str(round_b/'batches'),
    '--results-dir',str(OWN/'round-b/results')])]
for label,argv in commands:
    started=datetime.now(timezone.utc).isoformat();t=time.monotonic()
    result=subprocess.run(argv,cwd=ROOT,text=True,capture_output=True)
    elapsed=time.monotonic()-t
    (OWN/(label+'.stdout.txt')).write_text(result.stdout)
    (OWN/(label+'.stderr.txt')).write_text(result.stderr)
    data={'schemaVersion':1,'actualArgv':argv,'cwd':str(ROOT),'startedAt':started,
        'completedAt':datetime.now(timezone.utc).isoformat(),'actualExitCode':result.returncode,'wallTimeSeconds':elapsed,
        'stdout':result.stdout,'stderr':result.stderr,'actualNestedTerminalChecked':True,
        'activeWrites':0,'peerAFinalOutputsRead':False,'humanApproval':False,'humanTrial':False}
    with (OWN/(label+'.terminal.json')).open('x') as f:f.write(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'label':label,'actualExitCode':result.returncode,'wallTimeSeconds':elapsed,'stdout':result.stdout,'stderr':result.stderr}))
    if result.returncode:raise SystemExit(result.returncode)
