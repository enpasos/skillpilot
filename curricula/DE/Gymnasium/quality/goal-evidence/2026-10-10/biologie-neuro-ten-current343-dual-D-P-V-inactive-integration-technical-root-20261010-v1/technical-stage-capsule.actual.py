# SPDX-License-Identifier: Apache-2.0
import json,pathlib,shutil,hashlib
R=pathlib.Path('/home/enpasos/projects/skillpilot');C=pathlib.Path((R/'tmp/m7-resumption-20261010/biologie-four-native-technical/capsule.actual.path.txt').read_text().strip());BASE=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10');P=BASE/'biologie-neuro-ten-current343-dual-D-P-V-inactive-integration-technical-root-20261010-v1';V=BASE/'biologie-neuro-verhalten-hormone-ten-sehbahn-v3-current343-native-technical-successor-20261010-v2';S=BASE/'biologie-neuro-ten-BY-eight-primary-current343-source-native-technical-successor-root-20261010-v3'
def read(p):return json.loads((R/p).read_text())
def ref(p):b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,j):f=R/P/p;f.parent.mkdir(parents=True,exist_ok=True);data=json.dumps(j,ensure_ascii=False,indent=2)+'\n';assert not f.exists() or f.read_text()==data;f.write_text(data)
def stage(p):
 src=R/p;dst=C/p;assert src.is_file() and not src.is_symlink(),src;dst.parent.mkdir(parents=True,exist_ok=True)
 if dst.exists() or dst.is_symlink():dst.unlink()
 shutil.copyfile(src,dst)
plan=read(P/'ROOT.current343-ten-reviewed-copy-plan.inactive.json')
cfg=read(V/'native/current394-after.normal.config.json');cfg.update(landscapePath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json',goalVisualizationQaPath='curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json',semanticKindLedgerPath='curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json',outputPath=str(P/'native/current394-final.normal-model.actual.json'));cfg['evidenceReviewPaths']=[str(P/'positive/ten-current-raster.P.exact.jsonl') if p==str(V/'positive/ten-current-raster.P.pending.review.jsonl') else p for p in cfg['evidenceReviewPaths']];put('native/current394-final.normal-model.config.json',cfg)
paths=set()
for freeze in [V/'FINAL.current343-normal-P10-native10-Sehbahn-v3.technical.freeze.json',S/'FINAL.current343-eight-BY-primary-source-only-normal.technical.freeze.json']:
 j=read(freeze);paths.add(str(freeze))
 for values in j.values():
  if isinstance(values,list):
   for x in values:
    if isinstance(x,dict) and 'path' in x:paths.add(x['path'])
for f in (R/P).rglob('*'):
 if f.is_file():paths.add(str(f.relative_to(R)))
for x in plan['completedSourceReviewInputs']:paths.add(x['path'])
for p in paths:stage(p)
for op in plan['operations']:
 if op['target'].endswith('de-gymnasium-math-physics.config.json'):
  j=read(pathlib.Path(op['target']));bio=read(pathlib.Path(op['source']['path']));j['subjects']=[bio if s['subject']=='biologie' else s for s in j['subjects']];dst=C/op['target'];dst.parent.mkdir(parents=True,exist_ok=True);dst.unlink(missing_ok=True);dst.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n')
 else:
  dst=C/op['target'];dst.parent.mkdir(parents=True,exist_ok=True)
  if dst.exists() or dst.is_symlink():dst.unlink()
  shutil.copyfile(R/op['source']['path'],dst)
put('checks/actual-capsule-current343-ten-candidate-staging.json',{'schemaVersion':1,'regularExactOwnAndExternalCopies':len(paths),'bytesOfCopies':sum((R/p).stat().st_size for p in paths),'rootWrites':[],'candidateOperationCount':len(plan['operations']),'normalCentralAndM6StillRequired':True,'activeGain':0})
shutil.copyfile(pathlib.Path(__file__),R/P/'technical-stage-capsule.actual.py')
print(json.dumps({'capsule':str(C),'regularInputs':len(paths),'candidateOperations':len(plan['operations']),'rootActiveWrites':0}))
