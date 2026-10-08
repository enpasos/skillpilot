#!/usr/bin/env python3
"""Apache-2.0: read-only verification of an existing inactive author seal."""
import hashlib,json,subprocess,sys
from pathlib import Path

B=Path(__file__).resolve().parent
R=B.parents[6]
name=sys.argv[1] if len(sys.argv)>1 else 'author-candidate.final.seal.json'
seal=json.loads((B/name).read_text())
errors=[]
for record in seal['files']:
 p=B/record['relativePath']
 if not p.is_file():errors.append('missing '+record['relativePath']);continue
 data=p.read_bytes()
 if hashlib.sha256(data).hexdigest()!=record['sha256']:errors.append('hash '+record['relativePath'])
 if len(data)!=record['bytes']:errors.append('bytes '+record['relativePath'])
required=[str((B/f['relativePath']).relative_to(R)) for f in seal['files']]
ignored=subprocess.run(['git','check-ignore','--stdin'],cwd=R,input='\n'.join(required)+'\n',text=True,capture_output=True)
if ignored.returncode not in [0,1]:errors.append('git check-ignore '+ignored.stderr)
if ignored.stdout.strip():errors.extend('ignored '+p for p in ignored.stdout.splitlines())
print(json.dumps({'seal':name,'checkedFiles':len(seal['files']),'exitCode':1 if errors else 0,'errors':errors,'ignoredRequiredFiles':ignored.stdout.splitlines(),'activeWrites':False},ensure_ascii=False,indent=2))
sys.exit(1 if errors else 0)
