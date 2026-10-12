"""Run exact normal validators with a lean isolated asset capsule for inactive PNG."""
from pathlib import Path
import hashlib, importlib.util, json, os, re, shutil, subprocess, sys
from datetime import datetime,timezone

ROOT=Path(__file__).resolve().parents[8]
OWN=Path(__file__).resolve().parent.parent
REL=OWN.relative_to(ROOT)
AUTHOR=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-thirteen-current402-four-images-author-20261012-v3'
CAP=ROOT/'tmp/chemie-q3-thirteen-targeted-independent-b-v3-lean-capsule'
def digest(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def save(n,o):
 p=OWN/'checks'/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n')
copied=set()
def copy_input(rel):
 rel=Path(rel);src=ROOT/rel;dest=CAP/rel;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dest)
def module(rel):
 rel=Path(rel)
 if rel in copied:return
 copied.add(rel);copy_input(rel);src=ROOT/rel
 for ref in re.findall(r"(?:from\s*|import\s*\()\s*['\"]([^'\"]+)['\"]",src.read_text()):
  if not ref.startswith('.'):continue
  candidate=src.parent/ref
  choices=[candidate] if candidate.suffix else [candidate.with_suffix(s) for s in ['.ts','.tsx','.mjs','.json']]
  choices+=[candidate/'index.ts']
  f=next((x.resolve() for x in choices if x.is_file()),None)
  if f:module(f.relative_to(ROOT))

module('app/scripts/positiveGoalEvidenceReview.ts')
for d in ['contracts/goal-evidence/v2']:
 for p in (ROOT/d).glob('*.json'):copy_input(p.relative_to(ROOT))
copy_input('contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json')
config=json.loads((OWN/'positive/P13.independent-b.inactive.config.json').read_text())
for k in ['landscapePath','semanticKindLedgerPath','reviewCriteriaPath','reviewPath']:copy_input(config[k])
for p in config['reviewRunManifestPaths']:copy_input(p)
copy_input(REL/'positive/P13.independent-b.inactive.config.json')
CAP.joinpath('app').mkdir(parents=True,exist_ok=True)
if not (CAP/'app/node_modules').exists():(CAP/'app/node_modules').symlink_to(ROOT/'app/node_modules',target_is_directory=True)
neutral=json.loads((AUTHOR/'inputs/FINAL.neutral-whole402-P13-whole28-source-bounded.join.json').read_text())
for t in neutral['selected13WholeTuples']:
 ib=t['imageKeepBinding'];target=CAP/'app/public'/ib['currentUrl'].lstrip('/');target.parent.mkdir(parents=True,exist_ok=True)
 if not target.exists():os.link(ROOT/ib['currentActualAssetPath'],target)
 assert digest(target.read_bytes())==ib['currentDigest']
save('lean-normal-P-capsule.actual.json',{'sourceCount':len(copied),'exactNormalModules':[{'path':p.as_posix(),'sha256':digest((ROOT/p).read_bytes()),'copyExact':(ROOT/p).read_bytes()==(CAP/p).read_bytes()} for p in sorted(copied)],
 'dependencyCopies':0,'exactHardlinkedReviewedAssets':13,'activeWrites':False,'executionOnlyIgnoredScratch':True})

def check(label,args,cwd=ROOT):
 started=datetime.now(timezone.utc).isoformat();r=subprocess.run(args,cwd=cwd,capture_output=True,text=True)
 (OWN/'checks'/f'{label}.stdout.actual.txt').write_text(r.stdout)
 (OWN/'checks'/f'{label}.stderr.actual.txt').write_text(r.stderr)
 save(label+'.terminal.actual.json',{'command':args,'executionCwdKind':'repository' if cwd==ROOT else 'isolated lean capsule','exitCode':r.returncode,'startedAt':started,'completedAt':datetime.now(timezone.utc).isoformat()})
 print(label,'exit',r.returncode,r.stdout[:300],r.stderr[:800]);return r.returncode
tsx=str(ROOT/'app/node_modules/.bin/tsx')
rc=[]
rc.append(check('D13-normal-results',[tsx,'app/scripts/validateGoalDescriptionReviewCampaignResults.ts','--bundle',str(REL/'description/review-bundle-manifest.json'),'--input',str(REL/'description/description-review-input.json'),'--campaign',str(REL/'description/description-review-campaign.json'),'--batches-dir',str(REL/'description/batches'),'--results-dir',str(REL/'description/results')]))
rc.append(check('A3-normal-current',[tsx,'app/scripts/semanticAtomicityReview.ts','--config='+str(REL/'atomicity/three.independent-b.inactive.config.json'),'--mode=check']))
rc.append(check('M3-normal-current',[tsx,'app/scripts/memoryCardReview.ts','--config='+str(REL/'memory/three.independent-b.inactive.config.json'),'--mode=check']))
rc.append(check('P13-normal-current',[tsx,'app/scripts/positiveGoalEvidenceReview.ts','--config='+str(REL/'positive/P13.independent-b.inactive.config.json'),'--mode=check'],CAP))

import jsonschema
schema_paths={
 'description/results/original-successor-b.batch-001.records.jsonl':'contracts/goal-description-review/v1/goal-description-review-record.schema.json',
 'positive/P13.independent-b.review.jsonl':'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',
 'description/results/original-successor-b.batch-001.run.json':'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
 'positive/P13.independent-b.run.json':'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json'}
errors=[];count=0
for rel,sp in schema_paths.items():
 p=OWN/rel;schema=json.loads((ROOT/sp).read_text());validator=jsonschema.Draft202012Validator(schema,format_checker=jsonschema.FormatChecker())
 rows=[json.loads(x) for x in p.read_text().splitlines() if x.strip()] if p.suffix=='.jsonl' else [json.loads(p.read_text())]
 for row in rows:count+=1;errors.extend(f'{rel}: {e.message}' for e in validator.iter_errors(row))
for p in OWN.rglob('*'):
 if p.suffix=='.json':json.loads(p.read_text())
 elif p.suffix=='.jsonl':
  for line in p.read_text().splitlines():
   if line.strip():json.loads(line)
spec=importlib.util.spec_from_file_location('validate_schemas',ROOT/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
symlinks=mod.curriculum_symlink_errors(ROOT)
own_symlinks=[str(p.relative_to(ROOT)) for p in OWN.rglob('*') if p.is_symlink()]
errors.extend(symlinks);errors.extend(own_symlinks)
freeze=json.loads((AUTHOR/'author-package.freeze.json').read_text());bad=[x['path'] for x in freeze['rows'] if digest((ROOT/x['path']).read_bytes())!=x['sha256']]
errors.extend('Changed author input: '+x for x in bad)
save('schema-format-portability-freeze.actual.json',{'schemaValidatedRecords':count,'allWrittenJsonJsonlParsed':True,'curriculum_symlink_errors':symlinks,'ownedSymlinks':own_symlinks,'authorFrozenFiles':len(freeze['rows']),'authorChangedFiles':bad,'authorFreezeSha256':digest((AUTHOR/'author-package.freeze.json').read_bytes()),'errors':errors})
prior=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-thirteen-current402-independent-b-20261012-v2/ORIGINAL.judgment-seal.json'
prior_rows=json.loads(prior.read_text())['rows']
prior_bad=[x['path'] for x in prior_rows if digest((ROOT/x['path']).read_bytes())!=x['sha256']]
complete=json.loads((AUTHOR/'committable-package.freeze.json').read_text())
complete_bad=[x['path'] for x in complete['rows'] if digest((ROOT/x['path']).read_bytes())!=x['sha256']]
errors.extend(prior_bad+complete_bad)
save('original-and-complete-seals.actual.json',{'ownOriginalV2Files':len(prior_rows),'ownOriginalV2Changed':prior_bad,'completeAuthorV3Files':len(complete['rows']),'completeAuthorV3Changed':complete_bad,'originalOwnV2SealDigest':digest(prior.read_bytes()),'completeAuthorV3SealDigest':digest((AUTHOR/'committable-package.freeze.json').read_bytes()),'errors':errors})
print('Own schema/format/portability/author freeze errors',errors)
sys.exit(1 if any(rc) or errors else 0)
