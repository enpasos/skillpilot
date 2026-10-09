#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Persist the actual second theory-comparison edit without overwriting its first attempt."""
import hashlib,json,re,shutil
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[7]
OUT=Path(__file__).resolve().parent
D=OUT/'ac40db32-5dc7-5c43-8771-bf805d24aa3b'
def bind(p):
 b=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,x):
 assert not p.exists(),p
 p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');assert json.loads(p.read_text())==x
r=json.loads((D/'actual-v2-provider-result-no-image-data.json').read_text())
raw=Path(re.findall(r'/home/[^\s]+\.png',r['toolOutputHint'])[-1])
png=D/'candidate-v2.png';assert not png.exists();shutil.copyfile(raw,png)
assert raw.read_bytes()==png.read_bytes()
prompt=D/'actual-v2-targeted-population-correction.prompt.de.txt';assert not prompt.exists();prompt.write_text(r['prompt']+'\n')
w,h=Image.open(png).size
write(D/'v1-actual-original-and-browser-author-HOLD.json',{'schemaVersion':1,'role':'actual author visual defect before targeted edit','author':'/root','image':bind(D/'candidate-v1.png'),'observedOriginalAndWidths':[360,680],'decision':'HOLD','actualDefect':'Right-hand next-generation animals are all smaller juveniles; change in heritable variant frequencies is not visually demonstrated and age differences confound the comparison. Extra bottom paragraph is crowded at 360px.','independentDecision':False,'historicalFirstAttemptRetained':True})
write(D/'generation-v2.actual-tool-provenance.json',{'schemaVersion':1,'role':'actual targeted imagegen edit, original v1 preserved',**bind(png),'width':w,'height':h,'actualRawOutputPath':str(raw),'provider':r['provider'],'model':None,'prompt':str(prompt.relative_to(ROOT)),'reference':bind(D/'candidate-v1.png'),'originalBytesUnchanged':True,'independentVReviewPending':True,'activeWrites':False,'strictGain':0})
print(json.dumps({'actualPNG':bind(png),'width':w,'height':h,'byteExact':True}))
