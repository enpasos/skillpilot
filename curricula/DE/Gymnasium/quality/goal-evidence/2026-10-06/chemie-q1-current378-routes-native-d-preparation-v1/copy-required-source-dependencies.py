from pathlib import Path
import json, shutil, hashlib
ROOT=Path('/home/enpasos/projects/skillpilot')
ISO=ROOT/'tmp/chemie-q1-current378-routes-native-d-preparation-20261006-v1'
OWN=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-current378-routes-native-d-preparation-v1'
OLD=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-quantitative-reviewed-integration-candidate-v1/prospective-input-tree'
cfg=json.loads((ISO/'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json').read_text())
rows=[]
def cp(path):
    dst=ISO/path
    if not dst.is_file():
        candidates=[OLD/path,ROOT/path]
        src=next((p for p in candidates if p.is_file()),None)
        if src is None: return
        dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dst)
        rows.append({'path':path,'sourcePath':str(src.relative_to(ROOT)),'sha256':hashlib.sha256(dst.read_bytes()).hexdigest(),'bytes':dst.stat().st_size})
def paths(obj):
    if isinstance(obj,dict):
        for value in obj.values(): paths(value)
    elif isinstance(obj,list):
        for value in obj: paths(value)
    elif isinstance(obj,str) and obj.startswith('curricula/DE/Gymnasium/input/') and (ROOT/obj).is_file(): cp(obj)
for mapping in cfg['mappingPaths']:
    path=json.loads((ISO/mapping).read_text())['sourceExtractionPath'];cp(path)
    assert (ISO/path).is_file(),path
    paths(json.loads((ISO/path).read_text()))
(OWN/'source-extraction-dependencies.actual.receipt.json').write_text(json.dumps({'missingCacheDependenciesResolved':True,'nativeToolChanged':False,'onlyAbsentDependenciesCopied':True,'inputsCopiedUnchanged':rows},ensure_ascii=False,indent=2)+'\n')
print('Copied required exact source dependencies',len(rows))
