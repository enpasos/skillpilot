# SPDX-License-Identifier: Apache-2.0
import sys,json,pathlib,shutil,hashlib,datetime
r=json.loads(sys.argv[1]);d=pathlib.Path(r['directory']);raw=pathlib.Path(r['rawOutputPath']);dest=d/r.get('candidateName','candidate-v1.png')
if dest.exists():raise RuntimeError('Refuse overwrite '+str(dest))
shutil.copyfile(raw,dest)
def bind(p):b=p.read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
receipt={'schemaVersion':1,'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'provider':'Built-in ChatGPT/Codex image_gen','model':None,'actualTool':'image_gen__imagegen','actualOriginalPrompt':bind(d/r.get('promptName','generation-v1.original.prompt.en.md')),'historicalRawOutputPath':str(raw),'actualToolOutputHint':r['outputHint'],'portableOutput':bind(dest),'rawCopyByteExact':raw.read_bytes()==dest.read_bytes(),'transparentBackground':False,'authorQCNotIndependentVApproval':True,'humanApproval':False,'activeWrites':[]}
(d/r.get('receiptName','generation-v1.actual-raw-output.receipt.json')).write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n');print(json.dumps(bind(dest)))
