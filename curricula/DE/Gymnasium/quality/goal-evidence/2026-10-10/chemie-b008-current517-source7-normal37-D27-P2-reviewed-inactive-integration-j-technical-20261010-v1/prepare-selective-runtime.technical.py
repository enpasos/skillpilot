from pathlib import Path
import os,json,hashlib,shutil,time
ROOT=Path('/home/enpasos/projects/skillpilot')
J=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-source7-normal37-D27-P2-reviewed-inactive-integration-j-technical-20261010-v1')
CAP=ROOT/'tmp/m7-resumption-20261010/chemistry-source7-normal37-j-integration-isolated-v3'
REG=J/'registry/all-subjects-latestBio353-chem-only-reviewed.inactive.config.json'
assert not CAP.exists();CAP.mkdir(parents=True)
selected={}; skipped=[]; staged=[]
def digest(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def put(rel,source=None,replace=False):
 rel=Path(rel);src=ROOT/(Path(source) if source else rel);dst=CAP/rel
 assert not rel.is_absolute() and '..' not in rel.parts
 if not src.is_file():return False
 # No directory symlink traversal. File aliases are explicitly materialized as readonly regular hardlinks.
 for parent in src.parents:
  if parent==ROOT:break
  if parent.is_symlink():raise RuntimeError('Directory symlink refused: '+str(parent))
 src=src.resolve(strict=True)
 dst.parent.mkdir(parents=True,exist_ok=True)
 if dst.exists() or dst.is_symlink():
  if not replace:return True
  dst.unlink()
 os.link(src,dst);selected[str(rel)]={'source':str(src.relative_to(ROOT)),'sha256':digest(src),'bytes':src.stat().st_size}
 return True
def tree(rel,extensions=None,skipQuality=False):
 base=ROOT/rel
 for d,dirs,files in os.walk(base,followlinks=False):
  for name in list(dirs):
   p=Path(d)/name
   if p.is_symlink() or (skipQuality and name=='quality'):
    dirs.remove(name);skipped.append(str(p.relative_to(ROOT)))
  for name in files:
   p=Path(d)/name
   if extensions and p.suffix not in extensions:continue
   put(p.relative_to(ROOT))
for rel in ['app/scripts','app/src','scripts','contracts']:tree(Path(rel))
for rel in ['app/package.json','app/tsconfig.json','app/tsconfig.app.json','AGENTS.md']:put(rel)
(CAP/'app/node_modules').symlink_to(ROOT/'app/node_modules',target_is_directory=True)
tree(Path('curricula'),{'.json'},skipQuality=True)
config=json.loads((ROOT/REG).read_text());put(REG)
seen=set()
def addConfig(rel):
 rel=Path(rel)
 if str(rel) in seen:return
 seen.add(str(rel))
 if not put(rel):return
 if rel.suffix!='.json':return
 try:q=json.loads((ROOT/rel).read_text())
 except (ValueError,OSError):return
 def visit(v):
  if isinstance(v,dict):
   for k,x in v.items():
    if k in ['reportPath','source','sourceEvidence','provenance']:continue
    visit(x)
  elif isinstance(v,list):
   for x in v:visit(x)
  elif isinstance(v,str) and v.startswith(('curricula/','contracts/')) and Path(v).suffix in {'.json','.jsonl','.md','.txt'}:
   addConfig(v)
 visit(q)
put('curricula/DE/Gymnasium/quality/deep-understanding-rollout/deep-understanding-rollout.schema.json')
for subject in config['subjects']:
 for key in ['landscapePath','semanticKindLedgerPath','semanticAtomicityConfigPath','memoryReviewConfigPath','visualizationQaPath']:
  if key in subject:addConfig(subject[key])
 for key in ['semanticAtomicityConfigPaths','positiveEvidenceConfigPaths','currentCanonicalBindingAuditPaths']:
  for rel in subject.get(key,[]):addConfig(rel)
 for rel in subject['resolutionIndexPaths']:
  addConfig(rel);tree(Path(rel).parent,{'.json','.jsonl','.md','.txt'})
 # Freshness generator uses each subject's active QA. Only exact listed assets are materialized.
 activeQa=f"curricula/DE/Gymnasium/quality/goal-visualization-qa/{subject['subject']}.qa.json"
 addConfig(activeQa)
 for qaRel in set([activeQa,subject['visualizationQaPath']]):
  qa=json.loads((ROOT/qaRel).read_text())
  for record in qa.get('records',[]):
   for key in ['publicAssetPath','canonicalAssetPath']:
    if record.get(key):put(record[key])
 # Profile fingerprints use current goal links; explicit current paths only.
 land=json.loads((ROOT/subject['landscapePath']).read_text())
 for goal in land.get('goals',[]):
  for link in goal.get('resourceLinks',[]):
   url=link.get('url','')
   if url.startswith('/assets/'):
    put('app/public'+url)
   elif url.startswith('curricula/') and Path(url).suffix=='.json':addConfig(url)
# Exact reviewed candidate installed ONLY into this private filesystem for normal active-path checks.
author=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-normal32-annotation-materialized-native-context-author-20261010-v1')
chem=next(x for x in config['subjects'] if x['subject']=='chemie')
put('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json',chem['landscapePath'],True)
put('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json',author/'candidate/current517.semantic-kinds.author-future-active.json',True)
put('curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json',chem['visualizationQaPath'],True)
source7=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-seven-BY-source-two-direct-routes-author-20261010-v1/candidate/BY-whole-original-partners-plus-seven-current-leaf-source-obligation.author-candidate.review.json')
put('curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_chemistry_source_extraction_to_canonical_chemistry.review.json',source7,True)
qa=json.loads((ROOT/chem['visualizationQaPath']).read_text());byid={x['goalId']:x for x in qa['records']}
for row in json.loads((ROOT/J/'checks/V38-own-portable-exact-aliases.actual.json').read_text())['resourceAliases']:
 source=row['ownPortableExactResource']['path'];assert digest(ROOT/source)==row['ownPortableExactResource']['sha256']
 targets=['app/public'+row['logicalPublicURL'],byid[row['goalId']]['canonicalAssetPath']]
 for target in targets:put(target,source,True)
 staged.append({'goalId':row['goalId'],'source':source,'targets':targets,'sha256':digest(ROOT/source)})
# Frozen baseline and review seals must remain byte-exact after disposable snapshot cleanup.
before=json.loads((ROOT/J/'checks/declared-protected-inputs.before.actual.json').read_text());bound=[]
def check(v):
 if isinstance(v,dict):
  if 'path' in v and 'sha256' in v:
   p=ROOT/v['path'];actual=digest(p);assert actual==v['sha256'],(str(p),actual,v['sha256']);bound.append(v)
  else:
   for x in v.values():check(x)
 elif isinstance(v,list):
  for x in v:check(x)
check(before)
receipt={'schemaVersion':1,'privateRuntimePath':str(CAP.relative_to(ROOT)),'selectedRegularInputs':len(selected),'selectedInputs':selected,'explicitV38Aliases':staged,'noDirectorySymlinksFollowed':True,'skippedDirectories':skipped,'onlyRuntimeDependencySymlink':'app/node_modules','hardlinkInputsReadOnly':True,'privateReplacementBeforeMutation':'unlink then link/copy; no writes through original hardlinks','protectedInputsReverified':bound,'activeWrites':[],'sourceScienceRepeated':False,'freeBytesAfter':shutil.disk_usage(ROOT).free}
(ROOT/J/'checks/selective-private-runtime-and-original-inputs.actual.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({k:receipt[k] for k in ['privateRuntimePath','selectedRegularInputs','noDirectorySymlinksFollowed','freeBytesAfter']}),flush=True)
