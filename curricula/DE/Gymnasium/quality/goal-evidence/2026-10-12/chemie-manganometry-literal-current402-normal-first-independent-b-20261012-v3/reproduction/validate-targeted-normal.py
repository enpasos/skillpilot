from pathlib import Path
from datetime import datetime,timezone
import hashlib,importlib.util,json,os,re,shutil,subprocess
import jsonschema
ROOT=Path(__file__).resolve().parents[8];OWN=Path(__file__).resolve().parent.parent;REL=OWN.relative_to(ROOT)
CAP=ROOT/'tmp/chemie-manganometry-literal-independent-b-v3-lean-capsule'
def read(p):return json.loads(Path(p).read_text())
def sha(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def write(p,o):
 p=OWN/p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n')
copied=set()
def cp(rel):
 rel=Path(rel);dst=CAP/rel;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(ROOT/rel,dst)
def module(rel):
 rel=Path(rel)
 if rel in copied:return
 copied.add(rel);cp(rel);src=ROOT/rel
 for ref in re.findall(r"(?:from\s*|import\s*\()\s*['\"]([^'\"]+)['\"]",src.read_text()):
  if not ref.startswith('.'):continue
  c=src.parent/ref;choices=[c] if c.suffix else [c.with_suffix(s) for s in ['.ts','.tsx','.mjs','.json']];choices.append(c/'index.ts');f=next((p.resolve() for p in choices if p.is_file()),None)
  if f:module(f.relative_to(ROOT))
module('app/scripts/positiveGoalEvidenceReview.ts')
for p in (ROOT/'contracts/goal-evidence/v2').glob('*.json'):cp(p.relative_to(ROOT))
cp('contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json')
config=read(OWN/'positive/P1.independent-b.inactive.config.json')
for k in ['landscapePath','semanticKindLedgerPath','reviewCriteriaPath','reviewPath']:cp(config[k])
for p in config['reviewRunManifestPaths']:cp(p)
cp(REL/'positive/P1.independent-b.inactive.config.json');(CAP/'app').mkdir(exist_ok=True)
if not (CAP/'app/node_modules').exists():(CAP/'app/node_modules').symlink_to(ROOT/'app/node_modules',target_is_directory=True)
g=read(OWN/'round-b/description-review-input.json')['goals'][0];v=g['reviewContext']['page']['visualization'];target=CAP/'app/public'/v['url'].lstrip('/');target.parent.mkdir(parents=True,exist_ok=True)
asset=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-manganometry-current402-P-A-author-root-20261012-v1/assets'/g['goalId']/(g['goalId']+'.png')
if not target.exists():os.link(asset,target)
assert sha(target.read_bytes())==v['originalDigest']
write('checks/lean-positive-capsule.actual.json',{'normalImportedModules':[{'path':p.as_posix(),'sha256':sha((ROOT/p).read_bytes()),'copyExact':(ROOT/p).read_bytes()==(CAP/p).read_bytes()} for p in sorted(copied)],'hardlinkedActualAsset':1,'dependencyCopies':0,'wholeCorpusCopies':0,'outsideCurriculaIgnoredScratch':True})
def check(label,args,cwd=ROOT):
 start=datetime.now(timezone.utc).isoformat();r=subprocess.run(args,cwd=cwd,capture_output=True,text=True);(OWN/'checks'/f'{label}.stdout.actual.txt').write_text(r.stdout);(OWN/'checks'/f'{label}.stderr.actual.txt').write_text(r.stderr);write('checks/'+label+'.terminal.actual.json',{'command':args,'exitCode':r.returncode,'cwdKind':'normal repository' if cwd==ROOT else 'lean isolated exact normal P capsule','startedAt':start,'completedAt':datetime.now(timezone.utc).isoformat()});print(label,r.returncode,r.stdout[:300],r.stderr[:1000]);return r.returncode
tsx=str(ROOT/'app/node_modules/.bin/tsx');codes=[]
codes.append(check('D1-normal-first-pass',[tsx,'app/scripts/validateGoalDescriptionReviewCampaignResults.ts','--bundle',str(REL/'round-b/review-bundle-manifest.json'),'--input',str(REL/'round-b/description-review-input.json'),'--campaign',str(REL/'round-b/description-review-campaign.json'),'--batches-dir',str(REL/'round-b/batches'),'--results-dir',str(REL/'round-b/results')]))
codes.append(check('P1-normal-current',[tsx,'app/scripts/positiveGoalEvidenceReview.ts','--config='+str(REL/'positive/P1.independent-b.inactive.config.json'),'--mode=check'],CAP))
codes.append(check('A1-normal-current',[tsx,'app/scripts/semanticAtomicityReview.ts','--config='+str(REL/'atomicity/one.independent-b.inactive.config.json'),'--mode=check']))
codes.append(check('M1-normal-current',[tsx,'app/scripts/memoryCardReview.ts','--config='+str(REL/'memory/one.independent-b.inactive.config.json'),'--mode=check']))
batch=read(OWN/'round-b/description-review-campaign.json')['batches'][0]['batchId'];errors=[];count=0
for p,s in [('round-b/results/'+batch+'.records.jsonl','contracts/goal-description-review/v1/goal-description-review-record.schema.json'),('round-b/results/'+batch+'.run.json','contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json'),('positive/P1.independent-b.review.jsonl','contracts/goal-evidence/v2/goal-evidence-profile.schema.json'),('positive/P1.independent-b.run.json','contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json')]:
 f=OWN/p;rows=[json.loads(x) for x in f.read_text().splitlines()] if f.suffix=='.jsonl' else [read(f)];validator=jsonschema.Draft202012Validator(read(ROOT/s),format_checker=jsonschema.FormatChecker())
 for r in rows:count+=1;errors.extend(e.message for e in validator.iter_errors(r))
for f in OWN.rglob('*'):
 if f.suffix=='.json':read(f)
 elif f.suffix=='.jsonl':
  for l in f.read_text().splitlines():
   if l.strip():json.loads(l)
spec=importlib.util.spec_from_file_location('validate_schemas',ROOT/'scripts/validate_schemas.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);sym=m.curriculum_symlink_errors(ROOT);errors.extend(sym)
author=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-manganometry-current402-literal-source-scope-author-root-20261012-v3';freeze=read(author/'FINAL.source-author-successor.freeze.json');bad=[r['path'] for r in freeze['files'] if sha((ROOT/r['path']).read_bytes())!=r['sha256']];errors.extend(bad)
copy=read(OWN/'checks/exact-prepared-copies.actual.json');changed=[x['originalPath'] for x in copy['rows'] if (ROOT/x['originalPath']).read_bytes()!=(ROOT/x['copyPath']).read_bytes()];errors.extend(changed)
write('checks/schema-format-portability-and-author97.actual.json',{'schemaValidatedRecords':count,'errors':errors,'normalExitCodes':codes,'allWrittenJsonJsonlParsed':True,'curriculum_symlink_errors':sym,'author97FilesChanged':bad,'author97FreezeSha256':sha((author/'FINAL.source-author-successor.freeze.json').read_bytes()),'preparedExactCopyFilesChanged':changed})
assert not errors and not any(codes),(errors,codes)
