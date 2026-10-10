# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,hashlib,shutil,os
R=Path.cwd();O=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-dual38-P38-reviewed-inactive-integration-technical-20261010-v1');C=(R/'tmp/m7-resumption-20261010/chemistry-b008-P26-native-author/isolated-normal-capsule').resolve()
def exact(s,d):
 d.parent.mkdir(parents=True,exist_ok=True);assert d.parent.resolve().is_relative_to(C)
 if d.exists()or d.is_symlink():d.unlink()
 shutil.copyfile(s,d);assert d.read_bytes()==s.read_bytes()
rows=[]
for r in json.load(open(O/'checks/current38-resource-aliases.exact.json'))['resourceAliases']:
 s=R/r['portableExistingExactResource']['path'];rel=r['logicalPublicURL'].removeprefix('/assets/goal-visualizations/');prompt=R/'curricula/DE/Gymnasium/visualizations'/rel;prompt=prompt.parent/'prompt.de.md'
 if not prompt.exists():
  names=['actual-edit-prompt.txt','prompt.de.md','retained-source-prompt.de.md','correction-v2.prompt.en.md','image-reconstruction-prompt.de.md']
  matches=[s.parent/n for n in names if(s.parent/n).exists()];
  if not matches:
   note=R/O/'candidate/provider-prompt-unknown-retrospective-KEEP'/r['goalId']/'prompt.de.md';assert note.exists(),(s,r);matches=[note]
  prompt=matches[0]
 d=C/'curricula/DE/Gymnasium/visualizations'/rel;d=d.parent/'prompt.de.md';exact(prompt,d);rows.append({'goalId':r['goalId'],'sourcePath':str(prompt.relative_to(R)),'targetPath':str(d.relative_to(C)),'sha256':'sha256:'+hashlib.sha256(prompt.read_bytes()).hexdigest(),'bytes':prompt.stat().st_size,'existingActualPromptNotRewritten':True})
(O/'checks/current38-actual-provider-prompt-exact-aliases.json').write_text(json.dumps({'schemaVersion':1,'rows':rows,'sourcePromptsGeneratedOrTranslated':False,'activeWrites':[]},indent=2)+'\n')
# Pin replaced 1f original JPG as additional history; every previous exception remains literally unchanged.
old=json.load(open('scripts/config/historical-goal-visualization-assets.json'));new=json.loads(json.dumps(old));rel='chemie/1f354a60-be44-512b-8f8b-f67c8c456035/1f354a60-be44-512b-8f8b-f67c8c456035.jpg';source=R/'curricula/DE/Gymnasium/visualizations'/rel;h=hashlib.sha256(source.read_bytes()).hexdigest();assert all(hashlib.sha256((R/root/rel).read_bytes()).hexdigest()==h for root in ['curricula/DE/Gymnasium/visualizations','app/public/assets/goal-visualizations','backend/src/main/resources/static/assets/goal-visualizations']);new['assets'].append({'path':rel,'sha256':h});assert new['assets'][:-1]==old['assets'];p=O/'candidate/historical-goal-visualization-assets.plus-retained-1f-original.future-active.json';p.parent.mkdir(exist_ok=True);p.write_text(json.dumps(new,indent=2)+'\n');exact(p,C/'scripts/config/historical-goal-visualization-assets.json')
# Complete unaffected inventory media; copy only missing bytes as regular readonly hardlinks.
inv=json.load(open('docs/legal/ai-transparency-inventory.json'));dirs={v['sourceDir']for v in inv['artifactClasses']['narrativeIllustrations']['collections']};dirs|={inv['artifactClasses']['whitepaperRasterFigures']['sourceDir'],inv['artifactClasses']['whitepaperRasterFigures']['runtimeDir']}
for root in dirs:
 for s in (R/root).rglob('*'):
  if not s.is_file():continue
  d=C/s.relative_to(R);d.parent.mkdir(parents=True,exist_ok=True);assert d.parent.resolve().is_relative_to(C)
  if d.is_symlink():d.unlink()
  if not d.exists():os.link(s.resolve(),d)
print('Exact38 actual provider prompts, original1f JPG retained by additive history candidate, unaffected inventory media completed')
