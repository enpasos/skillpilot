#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Record actual normal check results at the commit checkpoint; no test bypass."""
import argparse,hashlib,json,subprocess,time
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path(__file__).resolve().parents[7]
OUT=Path(__file__).resolve().parent
TSX=['node','app/node_modules/tsx/dist/cli.mjs']
CHECKS={
 'central':TSX+['app/scripts/reportDeepUnderstandingRollout.ts','--mode=check','--format=json'],
 'images':['node','scripts/check_goal_visualization_assets.mjs'],
 'layer-a':['node','scripts/check_ai_transparency_inventory.mjs'],
 'floors':TSX+['app/scripts/checkCurriculumMaturityFloors.ts'],
 'schemas':['python3','scripts/validate_schemas.py'],
 'publication-build':TSX+['app/scripts/buildGoalBookPublications.ts','--chromium-executable-path','/home/enpasos/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome'],
 'diff-check':['git','diff','--check'],
 'index-diff-check':['git','diff','--cached','--check']
}
def bind(p):
 b=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def main():
 key=argparse.ArgumentParser();key.add_argument('name',choices=CHECKS);name=key.parse_args().name
 argv=CHECKS[name]
 stdout=OUT/(name+'.stdout.actual.txt');stderr=OUT/(name+'.stderr.actual.txt');receipt=OUT/(name+'.terminal.actual.json')
 assert not any(p.exists() for p in [stdout,stderr,receipt])
 before={}
 for p in ['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json','curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json','docs/legal/ai-transparency-inventory.json','docs/qa-ci/status/curriculum-quality-status.json']:
  before[p]=bind(ROOT/p)
 started=time.monotonic()
 with stdout.open('wb') as out,stderr.open('wb') as err:
  result=subprocess.run(argv,cwd=ROOT,stdout=out,stderr=err,check=False)
 unchanged={p:bind(ROOT/p)==binding for p,binding in before.items()}
 record={'schemaVersion':1,'argv':argv,'actualExitCode':result.returncode,'elapsedSeconds':time.monotonic()-started,'endedAt':datetime.now(timezone.utc).isoformat(),'stdout':bind(stdout),'stderr':bind(stderr),'activeInputsBefore':before,'activeInputsUnchanged':unchanged,'scientificReviewReperformed':False}
 receipt.write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n');assert json.loads(receipt.read_text())==record
 print(json.dumps({'name':name,'actualExitCode':result.returncode,'activeInputsUnchanged':all(unchanged.values()),'receipt':bind(receipt)}),flush=True)
 raise SystemExit(result.returncode)
if __name__=='__main__':main()
