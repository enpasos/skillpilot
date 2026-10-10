# SPDX-License-Identifier: Apache-2.0
import json,hashlib,tempfile,os,shutil,subprocess,time,datetime
from pathlib import Path
R=Path('/home/enpasos/projects/skillpilot');T=R/'tmp/m7-resumption-20261010/chemistry-source24-author';C=R/'tmp/m7-resumption-20261010/chemistry-b008-P26-native-author/isolated-normal-capsule';P=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-source24-targeted-parent-split-author-successor-20261010-v1');B=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current-whole-P26-native-continuation-author-20261010-v1')
def ref(p):b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,b):
 p=R/p;p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists(),str(p)
 if isinstance(b,(dict,list)):b=(json.dumps(b,ensure_ascii=False,indent=2)+'\n').encode()
 with tempfile.NamedTemporaryFile(dir=T,delete=False) as f:f.write(b);s=f.name
 os.replace(s,p)
inputs=[B/'source/current-active381-362-source-projection.receipt.exact.json',B/'native/after-whole-normal-book-model.actual.json']
for f in inputs:(C/f).parent.mkdir(parents=True,exist_ok=True);shutil.copy2(R/f,C/f)
put(P/'checks/targeted-normal-initial-missing-input-restoration.actual.json',{'schemaVersion':1,'initialActualFailure':ref(P/'checks/normal-targeted-duration-native.actual.terminal.json'),'actualMissingInput':ref(inputs[0]),'restoredOnlyExactFrozenInputs':[ref(f) for f in inputs],'noOrdinaryCheckerChange':True,'activeWrites':[]})
driver=C/'app/scripts/source24-targeted-duration-native.mts';cmd=['node',str(C/'app/node_modules/tsx/dist/cli.mjs'),str(driver)];start=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic();rr=subprocess.run(cmd,cwd=C,capture_output=True);stem='normal-targeted-duration-native.after-missing-copy-restoration.actual'
put(P/'checks'/f'{stem}.stdout.txt',rr.stdout);put(P/'checks'/f'{stem}.stderr.txt',rr.stderr);put(P/'checks'/f'{stem}.terminal.json',{'schemaVersion':1,'command':cmd,'cwdRole':'Ignored selective isolated normal capsule','startedAt':start,'elapsedSeconds':time.monotonic()-t,'exitCode':rr.returncode,'driver':ref(P/'technical/normal-targeted-duration-and-native-dependency.mts'),'stdout':ref(P/'checks'/f'{stem}.stdout.txt'),'stderr':ref(P/'checks'/f'{stem}.stderr.txt'),'initialMissingInputFailurePreserved':True,'normalSourceAtlasStillFailed':True,'strictGain':0,'activeWrites':[]});print(rr.returncode,rr.stdout.decode(),rr.stderr.decode()[:2300]);assert rr.returncode==0
for f in ['checks/normal-duration-policy-targeted-actual.json','source-atlas/original-active381-362-projection.normal-expanded.exact.json','native/whole398-fresh-normal-review-model.actual.json','checks/normal-current-source24-native-page-dependency-comparison.actual.json']:put(P/f,(C/P/f).read_bytes())
