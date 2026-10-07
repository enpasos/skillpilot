#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Capture an actual generated raster revision, preserving original candidates."""
from pathlib import Path
import hashlib,json,shutil,struct,sys
own=Path(__file__).resolve().parent
sequence=int(sys.argv[1]); source=Path(sys.argv[2]).resolve(strict=True)
assert source.is_relative_to(Path('/home/enpasos/.codex/generated_images'))
plan_path=own/(sys.argv[3] if len(sys.argv)>3 else 'three-evidenced-revisions.author-plan.json')
assert plan_path.resolve().parent==own
plan=json.loads(plan_path.read_text())
row=next(x for x in plan['images'] if x['sequence']==sequence)
previous=own/'candidates'/row['goalId']/'candidate-v1.png'
target=previous.with_name('candidate-v2.png'); assert not target.exists()
b=source.read_bytes(); assert b[:8]==b'\x89PNG\r\n\x1a\n'
width,height=struct.unpack('>II',b[16:24]); shutil.copyfile(source,target)
assert target.read_bytes()==b
receipt={'sequence':sequence,'goalId':row['goalId'],'originalGeneratedPath':str(source),'candidatePath':str(target.relative_to(own)),'sha256':hashlib.sha256(b).hexdigest(),'width':width,'height':height,'provider':'OpenAI ChatGPT/Codex built-in image_gen','exactServingImageModel':'not exposed by tool','previousCandidateSha256':hashlib.sha256(previous.read_bytes()).hexdigest(),'actualAuthorFinding':row['actualAuthorFinding'],'exactPrompt':row['prompt'],'sourceOriginalRetained':True,'authorCandidateOnly':True,'independentApproval':'pending','humanApproval':False,'strictGain':0}
with target.with_name('generation-v2.actual.provenance.json').open('x') as f: f.write(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(receipt,ensure_ascii=False))
