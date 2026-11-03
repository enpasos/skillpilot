from pathlib import Path
import json,shutil,hashlib,re
root=Path.cwd();cap=root/'tmp/math-rp-final-year-exam-candidates-20261101';dst=cap/'independent-probes/frozen-generator-host';src=cap/'duration-generator-host';archive=root/'docs/qa-ci/evidence/curriculum-completion-integrity/2026-11-01/sh-sine-derivative-stage-correction/before';manifest=[]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def copy(rel,origin=None,expected=None):
 target=dst/rel
 if target.exists():return
 original=origin or root/rel
 if expected and sha(original)!=expected:
  fallback=archive/rel
  if fallback.is_file() and sha(fallback)==expected:original=fallback
  else:raise ValueError(('unbound input drift',rel,expected,sha(original)))
 target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(original,target)
 manifest.append({'snapshotPath':str(target.relative_to(cap)),'sourcePath':str(original.relative_to(root)),'sha256':sha(target),'expectedSha256':expected})
for rel in ['app/scripts/generateMathDurationCompositionViews.ts','app/scripts/mathAssessmentScopeVariants.ts','app/package.json','candidate-rp-year-exams.json','curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json']:
 copy(rel,src/rel)
copy('app/package-lock.json')
for p in (root/'app/src').rglob('*'):
 if p.is_file():copy(str(p.relative_to(root)))
for p in (src/'curricula/DE/Gymnasium/composition-views/mathematik').glob('*.json'):copy(str(p.relative_to(src)),p)
config='app/scripts/config/math-duration-split-spanning-tree-policy.json';copy(config,archive/config,'b3b336dc244b1f4a55a901896420c69e2b8605aac4035a90ebfe47bc476928de')
d=json.loads((dst/config).read_text())
for group in ['additiveAdjudications','sourceScopeDecisions']:
 for item in d['inputs'].get(group,[]):copy(item['path'],expected=item.get('fileSha256',item.get('sha256')))
for rel in re.findall(r"'((?:curricula|app/scripts/config)/[^']+)'",(src/'app/scripts/generateMathDurationCompositionViews.ts').read_text()):
 if (root/rel).is_file():copy(rel)
registry='app/scripts/config/math-completion-assessment-variants.json';copy(registry)
for item in json.loads((dst/registry).read_text())['selections']:
 for key in ['selectionPath','contentReviewPath']:copy(item[key])
(dst/'app/node_modules').symlink_to(root/'app/node_modules',target_is_directory=True)
(cap/'independent-probes/frozen-generator-inputs.json').write_text(json.dumps({'purpose':'Independent byte-preserving historical reproduction; config recovered from checkpoint-bound archive, no input hashes refreshed.','files':manifest},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'copied':len(manifest),'host':str(dst.relative_to(root)),'configSha256':sha(dst/config)}))
