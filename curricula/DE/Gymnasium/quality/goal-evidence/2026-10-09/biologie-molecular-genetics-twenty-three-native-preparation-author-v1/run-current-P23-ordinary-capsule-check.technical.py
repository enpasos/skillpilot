# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,hashlib,shutil,subprocess,datetime
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;CAP=ROOT/'tmp/biologie-molecular-genetics-native23-current394-capsule'
def bind(p):
 b=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def copy(p):
 s=ROOT/p;t=CAP/p;assert s.is_file() and not s.is_symlink();t.parent.mkdir(parents=True,exist_ok=True)
 if t.exists():assert t.read_bytes()==s.read_bytes(),p
 else:shutil.copyfile(s,t)
 assert t.read_bytes()==s.read_bytes();return bind(s)
inputs=[]
for p in ['app/package.json','app/scripts/positiveGoalEvidenceReview.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/goalEvidenceProfileModel.ts','app/src/landscapeTypes.ts','contracts/goal-evidence/v2/goal-evidence-profile.schema.json','contracts/goal-evidence/v2/goal-evidence-review-config.schema.json','contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json']:inputs.append(copy(p))
# Exact ordinary package bytes only, not a node_modules symlink or installation.
for package in ['ajv','ajv-formats','fast-deep-equal','fast-uri','json-schema-traverse','require-from-string']:
 src=ROOT/'app/node_modules'/package;assert src.is_dir() and not src.is_symlink()
 for p in sorted(src.rglob('*')):
  if p.is_file():inputs.append(copy(str(p.relative_to(ROOT))))
config=str((OWN/'positive/P23.current-raster.inactive.config.json').relative_to(ROOT))
argv=[str(ROOT/'app/node_modules/.bin/tsx'),'app/scripts/positiveGoalEvidenceReview.ts','--config='+config,'--mode=check']
r=subprocess.run(argv,cwd=CAP,capture_output=True,text=True)
checks=OWN/'checks';checks.mkdir(exist_ok=True)
name='ordinary-P23-current-raster-capsule'
for suffix,text in [('stdout.actual.txt',r.stdout),('stderr.actual.txt',r.stderr)]:
 p=checks/(name+'.'+suffix);assert not p.exists();p.write_text(text)
p=checks/(name+'.terminal.actual.json');assert not p.exists();p.write_text(json.dumps({'schemaVersion':1,'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'argv':argv,'workingDirectory':str(CAP.relative_to(ROOT)),'actualExitCode':r.returncode,'ordinaryCodeAndSchemaBindings':inputs,'ordinaryUnmodifiedCode':True,'copyPolicy':'Only exact required ordinary code, schemas and six actual dependency packages copied as independent regular files','symlinksCreated':0,'activeWrites':0,'scientificApproval':False,'humanApproval':False},ensure_ascii=False,indent=2)+'\n')
print(r.stdout);print(r.stderr);print('Actual exit:',r.returncode);raise SystemExit(r.returncode)
