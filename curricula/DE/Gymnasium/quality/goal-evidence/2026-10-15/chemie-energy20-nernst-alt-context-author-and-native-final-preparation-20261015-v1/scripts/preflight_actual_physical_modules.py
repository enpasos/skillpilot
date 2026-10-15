# SPDX-License-Identifier: Apache-2.0
"""Verify actual private module bytes, including the dynamic QA child, before prepare."""
import hashlib,json,os
from pathlib import Path
ROOT=Path.cwd();OWN=Path(__file__).resolve().parents[1]
assert not (OWN/'FILES.finite-alt-author-native-preparation.seal.json').exists()
m=json.loads((OWN/'checks/REBUILD.final-native560-alt-only.physical-map.json').read_text());host=ROOT/m['executionHost'];rows=[]
for r in m['stockPhysicalModules']:
 p=host/r['path'];b=p.read_bytes();assert p.is_file() and not p.is_symlink() and len(b)==r['bytes'] and 'sha256:'+hashlib.sha256(b).hexdigest()==r['sha256'];rows.append({'path':r['path'],'physical':True,'bytesExact':True})
assert len(rows)==31
for p in ['app/scripts/generateGoalVisualizationQaLedgers.ts','app/scripts/goalVisualizationQaModel.ts']:assert p in {r['path'] for r in rows}
out={'pass':True,'role':'Actual physical stock31 preflight, not QA generator execution','host':m['executionHost'],'physicalModules':rows,'moduleCount':31,'dynamicQAGeneratorPhysical':True,'dynamicQAModelPhysical':True,'QAExecuted':False,'newVotes':0,'freeBytesAfterHost':os.statvfs(ROOT).f_bavail*os.statvfs(ROOT).f_frsize}
(OWN/'checks/PREFLIGHT31.actual-physical-closure-including-QA-child.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({'moduleCount':31,'dynamicQAChildAndModelExact':True,'freeBytesAfterHost':out['freeBytesAfterHost']}))
