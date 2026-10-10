# SPDX-License-Identifier: Apache-2.0
import pathlib,shutil,subprocess,json,time,datetime,hashlib,concurrent.futures
R=pathlib.Path.cwd();O=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-dual38-P38-reviewed-inactive-integration-technical-20261010-v1');A=O.parent/'chemie-b008-current517-machine-content-native-readiness-author-20261010-v1';C=(R/'tmp/m7-resumption-20261010/chemistry-b008-P26-native-author/isolated-normal-capsule').resolve();T=R/'app/node_modules/.bin/tsx'
def exact_regular(s,d):
 d.parent.mkdir(parents=True,exist_ok=True);assert d.parent.resolve().is_relative_to(C),d
 if d.is_symlink():d.unlink()
 shutil.copyfile(s,d);assert d.read_bytes()==s.read_bytes()
# Entry modules must be regular capsule copies, otherwise Node resolves symlinks back to the active repository.
proof=[]
for root in ['app/scripts','scripts']:
 for s in (R/root).rglob('*'):
  if s.is_file() and s.suffix in ['.ts','.mts','.mjs','.json']:
   d=C/s.relative_to(R);exact_regular(s,d);proof.append({'sourcePath':str(s.relative_to(R)),'sha256':'sha256:'+hashlib.sha256(s.read_bytes()).hexdigest(),'exactRegularCapsuleCopy':True})
(O/'checks/normal-checker-complete-source-exactness.actual.json').write_text(json.dumps({'schemaVersion':1,'rows':proof,'normalRulesChanged':False,'activeWrites':[]},indent=2)+'\n')
def run(label,args,tsx=True):
 cmd=([str(T)]if tsx else ['node'])+args;t=time.monotonic();p=subprocess.run(cmd,cwd=C,capture_output=True,text=True);dest=O/'checks'/f'{label}.terminal.actual.json';assert not dest.exists();dest.write_text(json.dumps({'schemaVersion':1,'argv':cmd,'cwdDiagnosticOnly':str(C),'actualExitCode':p.returncode,'durationSeconds':time.monotonic()-t,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'stdout':p.stdout if 'central'not in label else '(full report separately captured)','stderr':p.stderr,'normalRulesChanges':0,'activeWrites':[]},ensure_ascii=False,indent=2)+'\n');
 if 'central'in label:(O/'checks'/f'{label}.actual.report.json').write_text(p.stdout)
 print(label,p.returncode,p.stdout[-500:]if'central'not in label else'full report stored',p.stderr[-1300:],flush=True);return p
jobs=[('candidate-central-final-regular-capsule',['app/scripts/reportDeepUnderstandingRollout.ts','--config='+str(O/'registry/all-subjects.chemie-only-merge.future-active.config.json'),'--mode=check','--format=json'],True),('normal-assets-final',['scripts/check_goal_visualization_assets.mjs'],False),('normal-inventory-media-complete',['scripts/check_ai_transparency_inventory.mjs'],False)]
with concurrent.futures.ThreadPoolExecutor(max_workers=6)as pool:
 futures=[pool.submit(run,*j)for j in jobs]
 for f in futures:f.result()
