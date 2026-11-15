#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Replay immutable source data with the actual current backend; never copy media or QA as runtime input."""
import argparse,hashlib,json,os,subprocess
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--ref',required=True);p.add_argument('--destination',required=True);a=p.parse_args()
root=Path(subprocess.run(['git','rev-parse','--show-toplevel'],capture_output=True,text=True,check=True).stdout.strip());dest=(root/a.destination).resolve();assert dest.is_relative_to(root/'tmp'),dest
commit=subprocess.run(['git','rev-parse',a.ref+'^{commit}'],capture_output=True,text=True,check=True).stdout.strip();tree=subprocess.run(['git','ls-tree','-r','-z',commit,'--','curricula'],capture_output=True,check=True).stdout
entries=[]
for line in tree.split(b'\0'):
 if not line:continue
 metadata,path=line.split(b'\t',1);mode,kind,blob=metadata.decode().split();name=path.decode()
 if '/quality/' in name:continue
 if not (name.endswith('.json') or name.endswith('.json.snapshot')):continue
 assert kind=='blob';entries.append((mode,blob,name))
process=subprocess.Popen(['git','cat-file','--batch'],stdin=subprocess.PIPE,stdout=subprocess.PIPE);rows=[]
try:
 for mode,blob,name in entries:
  process.stdin.write((blob+'\n').encode());process.stdin.flush();header=process.stdout.readline().decode().strip().split();assert header[:2]==[blob,'blob'],header
  data=process.stdout.read(int(header[2]));assert process.stdout.read(1)==b'\n'
  path=dest/name;path.parent.mkdir(parents=True,exist_ok=True)
  if mode=='120000':
   link=data.decode();assert not Path(link).is_absolute();
   if os.path.lexists(path):assert path.is_symlink() and os.readlink(path)==link
   else:os.symlink(link,path)
  else:
   if path.exists():assert path.read_bytes()==data,name
   else:path.write_bytes(data)
  rows.append({'path':name,'gitBlob':blob,'mode':mode,'bytes':len(data),'sha256':'sha256:'+hashlib.sha256(data).hexdigest()})
finally:
 process.stdin.close();process.stdout.close();process.wait();assert process.returncode==0
manifest={'status':'immutable-git-data-only-native-projection-replay-input','commit':commit,'runtimeJsonFiles':len(rows),'rawBytes':sum(x['bytes'] for x in rows),'destination':str(dest.relative_to(root)),'qualityArtifactsExcludedFromRuntime':True,'mediaNotNeededOrCopied':True,'files':rows}
(dest/'runtime-source-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n');print(json.dumps({k:v for k,v in manifest.items() if k!='files'},indent=2))
