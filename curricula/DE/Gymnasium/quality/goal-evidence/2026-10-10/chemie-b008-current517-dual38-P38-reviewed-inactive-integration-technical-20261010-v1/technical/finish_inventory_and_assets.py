# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,hashlib,shutil,subprocess,time,datetime
R=Path.cwd();O=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-dual38-P38-reviewed-inactive-integration-technical-20261010-v1');C=(R/'tmp/m7-resumption-20261010/chemistry-b008-P26-native-author/isolated-normal-capsule').resolve()
def exact(s,d):
 d.parent.mkdir(parents=True,exist_ok=True);assert d.parent.resolve().is_relative_to(C)
 if d.exists() or d.is_symlink():d.unlink()
 shutil.copyfile(s,d);assert d.read_bytes()==s.read_bytes()
def run(label,args):
 p=subprocess.run(['node']+args,cwd=C,capture_output=True,text=True);f=O/'checks'/f'{label}.terminal.actual.json';assert not f.exists();f.write_text(json.dumps({'argv':['node']+args,'cwdDiagnosticOnly':str(C),'actualExitCode':p.returncode,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'stdout':p.stdout,'stderr':p.stderr,'activeWrites':[],'normalRulesChanges':0},ensure_ascii=False,indent=2)+'\n');print(label,p.returncode,p.stderr[-2000:],flush=True);return p
inv=json.load(open('docs/legal/ai-transparency-inventory.json'))
for col in inv['artifactClasses']['narrativeIllustrations']['collections']:
 for f in col['runtimeFiles']:exact(R/f,C/f)
exact(O/'candidate/historical-goal-visualization-assets.plus-retained-1f-original.future-active.json',C/'scripts/config/historical-goal-visualization-assets.json')
p=run('normal-assets-final-history-restored',['scripts/check_goal_visualization_assets.mjs']);assert p.returncode==0
p=run('normal-inventory-measured-LayerA-patch',['scripts/check_ai_transparency_inventory.mjs','--emit-layer-a-patch']);assert p.returncode==0
patch=json.loads(p.stdout);(O/'candidate/ai-transparency-inventory.measured-layer-a.patch.json').write_text(json.dumps(patch,ensure_ascii=False,indent=2)+'\n')
print('PATCHKEYS',list(patch),flush=True)
