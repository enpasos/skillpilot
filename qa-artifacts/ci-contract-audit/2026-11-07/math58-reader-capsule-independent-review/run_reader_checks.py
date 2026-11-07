"""Readonly bind mounts for this specific visualization reader review; own RAM outputs only."""
from pathlib import Path
import json,os,subprocess,sys
R=Path('/home/enpasos/projects/skillpilot')
W=Path(sys.argv[1]); W.mkdir(exist_ok=True)
A=Path('/dev/shm/math58-reader-capsule-integration-20261107')
B='qa-artifacts/ci-contract-audit/2026-11-07/math58-reader-capsule-proof-inputs-v1'
target='qa-artifacts/ci-contract-audit/2026-11-07/math58-reader-capsule-independent-review/private-inputs'
assert (R/target).is_dir()
base=['bwrap','--ro-bind','/','/','--dev-bind','/dev','/dev','--bind',str(W),str(W),
 '--ro-bind',str(A/'candidate/app/scripts'),str(R/'app/scripts'),
 '--ro-bind',str(A/'candidate/contracts'),str(R/'contracts'),
 '--ro-bind',str(A/'working'/B),str(R/B),'--bind',str(W),str(R/target)]
pins=json.loads((A/'candidate/contracts/goal-visualization-context/v1/math58-current-supplement-pins-2026-11-07.candidate.json').read_text())
box=next(b for b in pins['goalBindings'] if b['boxplotV2'])
for mode in ['active','v2']:
    args=list(base)
    if mode=='v2':
        for key in ['publicAssetPath','canonicalAssetPath']:
            args+=['--ro-bind',str(A/'working'/box[key]),str(R/box[key])]
    args+=['--chdir',str(R),str(R/'app/node_modules/.bin/tsx'),str(R/'qa-artifacts/ci-contract-audit/2026-11-07/math58-reader-capsule-independent-review/reader-check.mts')]
    run=subprocess.run(args,env={**os.environ,'INDEPENDENT_WORK':str(W),'BOX_FRAME':mode,'TMPDIR':str(W)},capture_output=True,text=True)
    (W/(mode+'.log')).write_text(run.stdout+run.stderr)
    print(json.dumps({'mode':mode,'exit':run.returncode,'stdout':run.stdout,'stderr':run.stderr}))
    if run.returncode: sys.exit(run.returncode)
