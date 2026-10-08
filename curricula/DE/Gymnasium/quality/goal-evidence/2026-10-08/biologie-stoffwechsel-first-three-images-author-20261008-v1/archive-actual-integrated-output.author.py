# SPDX-License-Identifier: Apache-2.0
"""Archive actual original PNG and derived size-check previews; never author art."""
from pathlib import Path
from datetime import datetime,timezone
from PIL import Image
import json,hashlib,shutil,sys
R=Path.cwd();D=Path(__file__).resolve().parent
ordinal,goalId,version,original,prompt=sys.argv[1:];original=Path(original).resolve(strict=True);prompt=Path(prompt).resolve(strict=True)
assert original.is_file()and original.suffix=='.png'and prompt.is_file()
q=D/'images'/goalId/version;q.mkdir(parents=True,exist_ok=True);asset=q/f'{goalId}.png'
assert not(q/'actual-output.provenance.json').exists(),q
if asset.exists():assert asset.read_bytes()==original.read_bytes()
else:shutil.copyfile(original,asset)
assert asset.read_bytes()==original.read_bytes()
def bind(p):return{'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
image=Image.open(asset);assert image.format=='PNG';w,h=image.size;previews=[]
for width in[360,680]:
 out=q/f'{goalId}.width-{width}.preview.png';height=round(h*width/w)
 resized=image.resize((width,height),Image.Resampling.LANCZOS)
 if out.exists():assert Image.open(out).size==(width,height)and Image.open(out).tobytes()==resized.tobytes()
 else:resized.save(out)
 previews.append({**bind(out),'width':width,'height':height,'purpose':'actual-size author inspection preview only; generated original PNG unchanged'})
if(q/'prompt.de.md').exists():assert(q/'prompt.de.md').read_bytes()==prompt.read_bytes()
else:shutil.copyfile(prompt,q/'prompt.de.md')
metadata={'schemaVersion':1,'archivedAt':datetime.now(timezone.utc).isoformat(),'ordinal':int(ordinal),'goalId':goalId,'version':version,'actualProvider':'OpenAI / ChatGPT-Codex integrated image_gen tool','model':'not exposed by integrated tool; no inferred model claim','originalOutputLocation':str(original),'actualOriginalPrompt':bind(prompt),'portableExactPNG':bind(asset),'dimensions':{'width':w,'height':h},'actualImageFormat':image.format,'aspectRatio':w/h,'selectedDefaultFormatReason':'wide near16:9 for two/three large process groups on desktop and narrow mobile; actual independent inspection remains required','transparentBackgroundRequested':False,'actualPNGBytesCopiedUnchanged':True,'previews':previews,'role':'author candidate only','sourceOrVisualApprovalClaimed':False,'independentVisualReviewStatus':'pending','humanApproval':False,'humanTrial':False,'activeWrites':0,'strictGainClaimed':0}
(q/'actual-output.provenance.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'asset':bind(asset),'provenance':bind(q/'actual-output.provenance.json'),'dimensions':[w,h],'previews':previews}))
