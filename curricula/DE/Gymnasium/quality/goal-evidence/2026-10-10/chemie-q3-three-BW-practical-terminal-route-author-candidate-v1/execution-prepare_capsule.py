from pathlib import Path
import shutil,json
R=Path('/home/enpasos/projects/skillpilot');T=R/'tmp/m7-resumption-20261010/chemistry-three-practical-terminal-author';C=T/'isolated-normal-capsule';C.mkdir(exist_ok=True)
P=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-q3-three-BW-practical-terminal-route-author-candidate-v1')
def copy_path(p):
 src=R/p;dst=C/p
 if not src.exists() or src.is_symlink():return
 if src.is_file():
  dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dst)
 else:shutil.copytree(src,dst,dirs_exist_ok=True,ignore=shutil.ignore_patterns('node_modules','dist','.git','*.pdf','*.png','*.zip','*.html','*.webp','*.jpeg','*.jpg'))
for p in ['app/scripts','app/src','contracts','curricula/DE/Gymnasium/canonical','curricula/DE/Gymnasium/input','curricula/DE/Gymnasium/mapping','curricula/DE/Gymnasium/provenance','curricula/DE/Gymnasium/composition-views','curricula/DE/Gymnasium/quality/memory-card-review','curricula/DE/Gymnasium/quality/deep-understanding-rollout','curricula/DE/Gymnasium/quality/goal-book-publication','curricula/DE/Gymnasium/quality/goal-visualization-qa','curricula/DE/Gymnasium/quality/goal-evidence/prompts','docs/qa-ci/applicability-accepted-warnings.json','AGENTS.md']:copy_path(Path(p))
# Only ordinary configuration dependencies are copied. Frozen review inventories
# are not recursively traversed as execution dependencies.
seen=set();queue=list((C/'curricula/DE/Gymnasium/quality/memory-card-review').glob('*.config.json'))+[C/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json']
def strings(o):
 if isinstance(o,str):yield o
 elif isinstance(o,list):
  for x in o:yield from strings(x)
 elif isinstance(o,dict):
  for x in o.values():yield from strings(x)
while queue:
 p=queue.pop()
 if p in seen:continue
 seen.add(p)
 try:d=json.loads(p.read_text())
 except Exception:continue
 for s in strings(d):
  s=s.split('#',1)[0]
  if s.startswith(('curricula/','docs/','app/scripts/')) and len(s)<512 and '\n' not in s and (R/s).is_file() and not (C/s).exists():
   copy_path(Path(s))
   if s.endswith('.config.json'):queue.append(C/s)
shutil.copytree(R/P,C/P,dirs_exist_ok=True)
(C/'app/node_modules').symlink_to(R/'app/node_modules',target_is_directory=True)
(C/'app/public').mkdir(exist_ok=True)
(C/'app/public/assets').symlink_to(R/'app/public/assets',target_is_directory=True)
(T/'capsule.actual.path.txt').write_text(str(C)+'\n')
# Technical execution export only, complete original evaluator/selector bodies untouched.
src=(R/'app/scripts/generateCurriculumQualityStatus.ts').read_text()
instrument=src+'\n// Temporary technical exports only; no rule/selector changes.\nexport {evaluateRouteProfile, routeProfiles, evaluateGraphIntegrity, evaluateTypeConsistency};\n'
(C/'app/scripts/generateCurriculumQualityStatus.technical-instrumented.ts').write_text(instrument)
(R/P/'checks/status-export.instrumentation.actual.json').write_text(json.dumps({'schemaVersion':1,'originalSourcePath':str(P/'inputs/generateCurriculumQualityStatus.actual.exact.ts'),'appendedExportOnly':'export {evaluateRouteProfile, routeProfiles, evaluateGraphIntegrity, evaluateTypeConsistency};','originalWholeCodePreserved':True,'selectorOrRuleChanges':0,'executionInstrumentationUnderIgnoredTmpOnly':True},indent=2)+'\n')
print('Fresh isolated capsule with actual normal code and inputs prepared:',C)
