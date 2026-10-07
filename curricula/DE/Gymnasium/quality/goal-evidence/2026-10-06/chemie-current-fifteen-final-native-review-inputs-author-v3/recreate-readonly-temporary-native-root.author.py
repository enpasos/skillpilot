"""Recreate only a temporary native input root; never mutate frozen/active files.

Run from repository root. Prints a temporary root to use with the unmodified
copied production helpers. Their prepare output already exists: use check only.
"""
from pathlib import Path
import hashlib,json,os,shutil,tempfile
root=Path.cwd().resolve()
own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-current-fifteen-final-native-review-inputs-author-v3'
read=lambda p:json.loads((root/p).read_text())
sha=lambda p:'sha256:'+hashlib.sha256((root/p).read_bytes()).hexdigest()
for name in ['native-d-stage-author-v3.final.freeze.json','native-p-stage-author-v3.final.freeze.json']:
 for row in read(own+'/'+name)['files']:assert sha(row['path'])==row['sha256'],row['path']
receipt=read(own+'/temporary-native-isolation.actual-receipt.json')
used=read(own+'/actual-full378-national359-five-pages-native-context-source-bindings.json')['productionHelpersUsed']+read(own+'/native-fifteen-and-eight-positive-schema-material-binding-checks.actual.json')['productionHelperBindings']
for row in used:assert sha(row['path'])==row['sha256'],'Used native helper has changed; perform targeted technical rebind, do not alter the historical freeze: '+row['path']
iso=Path(tempfile.mkdtemp(prefix='skillpilot-chemie-native-v3-reproduce-'))
(iso/'app/scripts').mkdir(parents=True)
asset=iso/'app/public/assets/goal-visualizations/chemie';asset.mkdir(parents=True)
for rel in ['curricula','contracts','docs','app/src','app/node_modules','app/scripts/config']:
 p=iso/rel;p.parent.mkdir(parents=True,exist_ok=True);p.symlink_to(os.path.relpath(root/rel,p.parent),target_is_directory=True)
shutil.copyfile(root/'app/package.json',iso/'app/package.json')
for p in (root/'app/scripts').glob('*.ts'):shutil.copyfile(p,iso/'app/scripts'/p.name)
selected={r['goalId'] for r in receipt['physicalSelectedReviewRasterCopies']}
for p in (root/'app/public/assets/goal-visualizations/chemie').iterdir():
 if p.name not in selected:(asset/p.name).symlink_to(os.path.relpath(p,asset),target_is_directory=p.is_dir())
for row in receipt['physicalSelectedReviewRasterCopies']:
 assert sha(row['source']['path'])==row['source']['sha256']
 p=iso/row['isolatedRelativePath'];p.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(root/row['source']['path'],p)
 assert 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()==row['source']['sha256']
print(json.dumps({'temporaryNativeRoot':str(iso),'usedProductionHelpersByteExact':True,'activeWrites':False,'frozenWrites':False,'checks':['app/scripts/materializeGoalDescriptionRolloutBatch.ts check --config '+own+'/native-d-five.batch.config.json','app/scripts/positiveGoalEvidenceReview.ts --config '+own+'/positive-evidence.eight.targeted.native-author-candidates.config.json']},indent=2))
