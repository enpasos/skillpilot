# SPDX-License-Identifier: Apache-2.0
"""Read image metadata/pins; write only this inactive review's technical receipts."""
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[8]
OUT=Path(__file__).resolve().parents[1]
AUTHOR=OUT.parent/'chemie-858-conditional-alkanol-oxidation-image-author-20261018-v1'
PINS={}
CHECKS=[]
def pin(p):
    p=Path(p)
    if not p.is_absolute():p=ROOT/p
    b=p.read_bytes();r=dict(path=str(p.relative_to(ROOT)),sha256=hashlib.sha256(b).hexdigest(),bytes=len(b))
    PINS[r['path']]=r
    return r
def check(label,ok):CHECKS.append(dict(check=label,passed=bool(ok)))
def stable(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
for p in AUTHOR.rglob('*'):
    if p.is_file():pin(p)
receipt=json.loads((AUTHOR/'generation/actual-built-in-tool-receipt.json').read_text())
finding=json.loads((AUTHOR/'AUTHOR.actual-targeted-findings-and-correction.pending.json').read_text())
for r in [receipt['referenceImage'],receipt['prompt'],receipt['savedWorkspaceOutput'],finding['boundWholeGoalAndProfile'],*finding['inspectionFrames']]:
    actual=pin(r['path']);check('exact declared pin '+r['path'].split('/')[-1],all(actual[k]==r[k] for k in ['sha256','bytes']))
oldcopy=pin(AUTHOR/'inputs/previous-current-image.EXACT.jpg')
public=pin(ROOT/'app/public/assets/goal-visualizations/chemie/858d56e0-ab8f-51a4-b07e-7d9d94cab8e2/858d56e0-ab8f-51a4-b07e-7d9d94cab8e2.jpg')
check('unchanged original and both normal copies exact',oldcopy['sha256']==receipt['referenceImage']['sha256']==public['sha256'])
images=[]
for p,expected in [(AUTHOR/'inputs/previous-current-image.EXACT.jpg',(2752,1536)),(AUTHOR/'candidate/858d56e0-ab8f-51a4-b07e-7d9d94cab8e2.png',(1672,941)),(AUTHOR/'inspection/actual-display-360px.png',(360,203)),(AUTHOR/'inspection/actual-display-680px.png',(680,383))]:
    im=Image.open(p)
    check('actual image dimensions '+p.name,im.size==expected)
    check('opaque image '+p.name,'A'not in im.getbands() or im.getchannel('A').getextrema()==(255,255))
    images.append(dict(**pin(p),width=im.width,height=im.height,format=im.format,mode=im.mode,actuallyInspectedWith='view_image, original detail'))
whole=json.loads((AUTHOR/'inputs/whole-selected-goal-and-P.EXACT.json').read_text())
goal=whole['goal'];profile=whole['positiveEvidence']['profile'];c=profile['coverageExpectations']
check('whole selected goal and P identity',goal['id']==whole['positiveEvidence']['goalId']=='858d56e0-ab8f-51a4-b07e-7d9d94cab8e2')
check('whole P still min2 fresh independent',c['minimumIndependentDemonstrations']==2 and c['freshVariationRequired'] is True and c['independentTransferRequired'] is True)
check('explicit inactive P boundary retained',whole['positiveEvidence']['technicalCandidateOnly'] is True and whole['positiveEvidence']['notNativeCurrentRecordYet'] is True)
report=dict(role='INDEPENDENT_C_TARGETED_IMAGE_BINDING_CHECK',passed=all(r['passed'] for r in CHECKS),checks=CHECKS,images=images,wholeSelectedGoalSemanticSHA256=stable(goal),wholeSelectedProfileSemanticSHA256=stable(profile),normalFilesWritten=False,imagePixelsWrittenOrEdited=False,fullChecksRun=False)
(OUT/'CHECK.actual-pins-and-dimensions.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
(OUT/'INPUTS.actual-pins.json').write_text(json.dumps(dict(role='INDEPENDENT_C_IMAGE_COMPONENT_ACTUAL_INPUTS',pins=sorted(PINS.values(),key=lambda r:r['path'])),ensure_ascii=False,indent=2)+'\n')
print(json.dumps(dict(passed=report['passed'],checks=len(CHECKS),failures=[r for r in CHECKS if not r['passed']],inputPins=len(PINS)),ensure_ascii=False,indent=2))
raise SystemExit(0 if report['passed'] else 1)
