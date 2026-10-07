#!/usr/bin/env python3
"""Store an exact image_gen output copy, never transform image pixels."""
from pathlib import Path
from PIL import Image
import argparse,hashlib,json,shutil
p=argparse.ArgumentParser();p.add_argument('--source',required=True);p.add_argument('--goal',required=True);p.add_argument('--attempt',default='01');args=p.parse_args()
out=Path(__file__).resolve().parent/'generated-originals'/args.goal;out.mkdir(parents=True,exist_ok=True)
src=Path(args.source);dst=out/('original-generated-attempt-'+args.attempt+'.png')
if dst.exists():assert dst.read_bytes()==src.read_bytes()
else:shutil.copyfile(src,dst)
w,h=Image.open(dst).size
rec={'role':'image author exact builtin output retention, no visual approval','generatorOriginalPath':str(src),'ownExactOriginalCopy':str(dst),
    'sha256':hashlib.sha256(dst.read_bytes()).hexdigest(),'bytes':dst.stat().st_size,'width':w,'height':h,
    'mimeType':'image/png','exactOriginalBytesPreserved':True,'licenseForOwnCandidate':'CC-BY-4.0','independentVisualApproval':False,'humanApproval':False,'newStrictCompletion':0}
(out/('actual-original-attempt-'+args.attempt+'.byte-copy.receipt.json')).write_text(json.dumps(rec,indent=2)+'\n')
print(json.dumps({'goalId':args.goal,'attempt':args.attempt,'sha256':rec['sha256'],'width':w,'height':h}))
