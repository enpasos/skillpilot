# SPDX-License-Identifier: Apache-2.0
"""Neutral structural conversion of exact Root-selected raster/provenance inputs."""
import hashlib,json
from pathlib import Path
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent
path=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-upper-science-fourteen-image-author-root-v1/neutral-final-fourteen-actual-pngs-and-resource-link-candidates.entry.json'
def bind(p):
 b=p.read_bytes();return dict(path=p.relative_to(ROOT).as_posix(),sha256='sha256:'+hashlib.sha256(b).hexdigest(),bytes=len(b))
assert bind(path)['sha256']=='sha256:7caffe5b3ef27f84098d1d29b504b9016b2c912c2ebe5b9aae606bf8082c4806'
source=json.loads(path.read_text());assert len(source['entries'])==14
rows=[]
for e in source['entries']:
 for b in [e['image'],e['generationPrompt'],e['actualGenerationReceipt'],e['reconstructionPrompt'],e.get('actualEditPrompt'),*e['inspectionViews']]:
  if b:
   actual=bind(ROOT/b['path']);assert actual['sha256']==b['sha256'] and actual['bytes']==b['bytes']
 rows.append(dict(goalId=e['goalId'],asset=e['image'],provider=e['provider'],model=e['model'],descriptionDe=e['descriptionDe'],altTextDe=e['altTextDe'],originalPrompts=[b for b in [e['generationPrompt'],e.get('actualEditPrompt')] if b],reconstructionPrompt=e['reconstructionPrompt'],actualGenerationReceipt=e['actualGenerationReceipt'],inspectionViews=e['inspectionViews'],independentVisualApproval=False))
out=OWN/'normalized-actual-fourteen-images.neutral-input.json';assert not out.exists()
out.write_text(json.dumps(dict(schemaVersion=1,role='Exact structural mapping of actual selected Root PNG bytes and true provenance only; no image approval',images=rows,originalRootImageEntry=bind(path),actualIndependentVisualApprovals=0,humanApproval=False,activeWrites=[]),ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'selectedImages':14,'rootEntry':bind(path),'normalizedEntry':bind(out),'independentApprovals':0}))
