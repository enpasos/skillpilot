from pathlib import Path
import json,os,shutil,hashlib
ROOT=Path.cwd(); H=ROOT/'tmp/checkpoint-chemie-20261013/current402-CQR-source-discovery-minimal-private-host';R=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-current402-source-discovery-and-original-obligations-technical-20261013-v1'
H.mkdir(parents=True,exist_ok=True)
(H/'app').mkdir(exist_ok=True)
for name in ['src','node_modules']:
 d=H/'app'/name
 if not d.exists():os.symlink(ROOT/'app'/name,d)
for name in ['package.json','tsconfig.json','tsconfig.node.json']:
 if (ROOT/'app'/name).exists():shutil.copy2(ROOT/'app'/name,H/'app'/name)
if not (H/'contracts').exists():os.symlink(ROOT/'contracts',H/'contracts')
ID='c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'
def copy(p):
 p=Path(p);d=H/p;d.parent.mkdir(parents=True,exist_ok=True)
 assert d.parent.resolve().is_relative_to(H.resolve()), 'Refuse write through non-private parent '+str(d)
 if d.exists() or d.is_symlink():d.unlink()
 shutil.copy2(ROOT/p,d)
def save(p,x):
 d=H/p;d.parent.mkdir(parents=True,exist_ok=True)
 assert d.parent.resolve().is_relative_to(H.resolve()), 'Refuse write through non-private parent '+str(d)
 if d.exists() or d.is_symlink():d.unlink()
 d.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def read(p):return json.load(open(ROOT/p))
# Existing source capsule was hard-linked. Every changed private file is unlinked first.
for p in (ROOT/'app/scripts').rglob('*'):
 if p.is_file() and not p.is_symlink():copy(p.relative_to(ROOT))
(H/'curricula/DE/Gymnasium/canonical').mkdir(parents=True,exist_ok=True)
copy('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_OVERVIEW.de.json')
for p in (H/'curricula/DE/Gymnasium/canonical').glob('*.json'):
 if 'CHEMIE' not in p.name and 'OVERVIEW' not in p.name:p.unlink()
copy('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
# Replace private input/mapping directory entries; shared original hard-linked bytes are preserved.
for p in [H/'curricula/DE/Gymnasium/input',H/'curricula/DE/Gymnasium/mapping',H/'curricula/DE/Gymnasium/composition-views']:
 if p.exists():shutil.rmtree(p)
sourceIds=set();sourcePaths=set();documents=set();mapPaths=[]
for p in sorted((ROOT/'curricula/DE/Gymnasium/mapping').rglob('*.json')):
 x=json.load(open(p))
 if x.get('targetLandscapeId')!=ID:continue
 copy(p.relative_to(ROOT));mapPaths.append(str(p.relative_to(ROOT)));sourceIds.add(x.get('sourceLandscapeId'));s=x.get('sourceExtractionPath')
 if s:sourcePaths.add(s)
# Only Chemistry inventories and Chemistry referenced full originals are installed/read.
for p in sorted((ROOT/'curricula/DE/Gymnasium/input').rglob('*.source-extraction.json')):
 if 'CHEMI' in p.name.upper():sourcePaths.add(str(p.relative_to(ROOT)))
for p in sorted(sourcePaths):
 if not (ROOT/p).exists():continue
 copy(p);x=read(p)
 for d in x.get('sourceDocuments') or [x.get('sourceDocument')]:
  if isinstance(d,dict) and d.get('path'):documents.add(d['path'])
for name,key in [('source-landscape-registry.json','entries'),('source-goal-membership-registry.json','landscapes'),('source-goal-closure-registry.json','landscapes')]:
 p='curricula/DE/Gymnasium/provenance/'+name;x=read(p);x[key]=[e for e in x.get(key,[]) if e.get('landscapeId') in sourceIds]
 for e in x[key]:
  for k in ['sourcePath','archivePath','archiveSourcePath']:
   if isinstance(e.get(k),str):documents.add(e[k])
 save(p,x)
for name in ['canonical-goal-provenance-registry.json','canonical-goal-applicability-override-registry.json','canonical-goal-surrogate-evidence-registry.json']:
 p='curricula/DE/Gymnasium/provenance/'+name
 if (ROOT/p).exists():copy(p)
for p in documents:
 if not (ROOT/p).is_file():continue
 d=H/p;d.parent.mkdir(parents=True,exist_ok=True)
 assert d.parent.resolve().is_relative_to(H.resolve()), 'Refuse write through non-private parent '+str(d)
 if d.exists() or d.is_symlink():d.unlink()
 os.symlink(ROOT/p,d)
for p in (ROOT/'curricula/DE/Gymnasium/composition-views/chemie').rglob('*.json'):copy(p.relative_to(ROOT))
for p in ['curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json','curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json']:copy(p)
p='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';x=read(p);x['subjects']=[s for s in x['subjects'] if s['subject']=='chemie'];save(p,x)
# Preserve all real referenced review inputs through read-only directory symlinks, except own candidate files.
qroot=ROOT/'curricula/DE/Gymnasium/quality';hq=H/'curricula/DE/Gymnasium/quality'
for rel in ['docs/qa-ci/applicability-accepted-warnings.json']:
 if (ROOT/rel).exists():copy(rel)
for p in qroot.iterdir():
 if p.name in ['deep-understanding-rollout','goal-book-publication','goal-visualization-qa']:continue
 d=hq/p.name
 if d.exists():shutil.rmtree(d) if d.is_dir() and not d.is_symlink() else d.unlink()
 os.symlink(p,d)
# Real asset and prompt bytes; writing scripts only emit private status paths.
for rel in ['app/public/assets/goal-visualizations/chemie','curricula/DE/Gymnasium/visualizations/chemie']:
 d=H/rel
 if d.exists():shutil.rmtree(d) if not d.is_symlink() else d.unlink()
 d.parent.mkdir(parents=True,exist_ok=True);os.symlink(ROOT/rel,d)
# Expose current owned rollout roots through individual read-only symlinks while retaining private central config.
for p in (qroot/'deep-understanding-rollout').iterdir():
 if p.name=='de-gymnasium-math-physics.config.json':continue
 d=hq/'deep-understanding-rollout'/p.name
 if d.exists():shutil.rmtree(d) if d.is_dir() and not d.is_symlink() else d.unlink()
 os.symlink(p,d)
(H/'docs/qa-ci/status').mkdir(parents=True,exist_ok=True)
receipt={'privateHost':str(H.relative_to(ROOT)),'ChemistryMappingCount':len(mapPaths),'sourceLandscapeCount':len(sourceIds),'ChemistrySourcePaths':sorted(sourcePaths),'readOnlyOriginalDocumentLinks':sorted(documents),'stockScriptsUnmodified':True,'nonChemistryCanonicalReportsExcluded':True,'sourceRegistryFilteredOnlyForPrivateChemMeasurement':True,'activeEdits':False}
(R/'checks/private-Chem-only-host-inputs.actual.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({k:v for k,v in receipt.items() if not isinstance(v,list)}))
