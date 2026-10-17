"""One stock applicability measurement of the current accepted private content."""
from pathlib import Path
import datetime
import hashlib
import json
import os
import shutil
import subprocess
import time

R = Path('/home/enpasos/projects/skillpilot')
T = R / 'tmp/chemie-m7-resumed-20261016'
E = Path('/mnt/e/skillpilot-chemie-L7-20261017')
SOURCE = E / 'actual650-current-concentration-and-foundations-stock-applicability-root-v1/capsule'
B = E / 'paired-twenty-foundations-and-coordinate-priors-actual-whole650-assembly-root-v1'
O = E / 'actual650-paired-twenty-foundations-and-coordinate-stock-applicability-root-v1'
F = O / 'capsule'
C = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')

def read(p): return json.loads(p.read_text())
def pin(p): return {'path': str(p), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size}
def write_owned(p, data):
    for parent in p.parents:
        if parent == F: break
        assert not parent.is_symlink(), str(parent)
    p.parent.mkdir(parents=True, exist_ok=True)
    temporary = p.with_name(p.name + '.owned-current-content')
    with temporary.open('x') as f: f.write(data)
    temporary.replace(p)

assert not O.exists()
receipt_path = B / 'RECEIPT.actual-paired-two-BW-teachers-and-coordinate-priors.json'
assert pin(receipt_path)['sha256'] == 'ab9e53fb688c001bd7756b6f369231946f9230fc5ebc60583b716c4485b2de82'
receipt = read(receipt_path)
cp = Path(receipt['outputs']['canonical']['path'])
vp = Path(receipt['outputs']['views']['path'])
assert pin(cp) == receipt['outputs']['canonical'] and pin(vp) == receipt['outputs']['views']
assert len(read(cp)['goals']) == 650 and len(read(vp)) == 39
view_dir = Path('curricula/DE/Gymnasium/composition-views/chemie')
view_paths = {read(p)['viewId']: p.relative_to(SOURCE) for p in (SOURCE / view_dir).glob('*.json')}
assert len(view_paths) == 39
source_guard = {str(p): pin(p) for p in (SOURCE / C, R / C)}
O.mkdir(parents=True)
started = time.monotonic()
# Data are immutable hardlink copies; all edited files are replaced atomically.
# Copy only actual stock runtime modules, not earlier generated probe scripts.
shutil.copytree(SOURCE / 'curricula', F / 'curricula', symlinks=True, copy_function=os.link)
module_pins = []
for rel in ('app/scripts/applicabilityCompiler.ts', 'app/scripts/memoryCardReviewConfigDiscovery.ts',
            'app/src/utils/jurisdictionMetadata.ts', 'app/src/landscapeTypes.ts', 'app/package.json'):
    src, dst = SOURCE / rel, F / rel
    assert src.is_file(), str(src)
    dst.parent.mkdir(parents=True, exist_ok=True)
    os.link(src, dst)
    module_pins.append(pin(dst))
(F / 'tmp').mkdir()
write_owned(F / C, cp.read_text())
for view in read(vp): write_owned(F / view_paths[view['viewId']], json.dumps(view, ensure_ascii=False, indent=2) + '\n')
registry_pins = []
for name in ('source-landscape-registry.json', 'canonical-goal-provenance-registry.json', 'canonical-goal-applicability-override-registry.json'):
    rel = Path('curricula/DE/Gymnasium/provenance') / name
    assert pin(F / rel)['sha256'] == pin(SOURCE / rel)['sha256']
    registry_pins.append(pin(F / rel))
report_path = O / 'STOCK.actual650-paired-twenty-foundations-and-coordinate-applicability.json'
adapter = F / 'app/scripts/privatePairedTwentyFoundationsAndCoordinateProbe.mts'
assert not adapter.exists()
adapter.write_text("import fs from 'node:fs';\nimport {buildApplicabilityCompilation} from './applicabilityCompiler.ts';\nconst result=buildApplicabilityCompilation();\nfs.writeFileSync(" + json.dumps(str(report_path)) + ",JSON.stringify(result,null,2)+'\\n',{flag:'wx'});\nconsole.log(JSON.stringify({chemistry:result.reports.find(r=>r.landscapeId==='c436b994-8f44-5134-b9f8-0c9f5d6a5ba0')?.summary}));\n")
prepared = time.monotonic()
cmd = ['node', '--preserve-symlinks', '--preserve-symlinks-main', '--import', str(R / 'app/node_modules/tsx/dist/loader.mjs'), str(adapter)]
result = subprocess.run(cmd, cwd=F, capture_output=True, text=True, timeout=180)
for name, value in [('stock.stdout.actual.txt', result.stdout), ('stock.stderr.actual.txt', result.stderr)]:
    with (O / name).open('x') as f: f.write(value)
assert source_guard == {str(p): pin(p) for p in (SOURCE / C, R / C)}
execution = {'atUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'argv': cmd, 'cwd': str(F),
             'preparationSeconds': prepared-started, 'stockCompilerSeconds': time.monotonic()-prepared,
             'exitCode': result.returncode, 'wholeContentReceipt': pin(receipt_path), 'canonical': pin(F / C),
             'views': 39, 'stockModulePins': module_pins, 'explicitRegistryPins': registry_pins,
             'sourceAndNormalCanonicalUnchanged': True,
             'boundary': 'Diagnostic actual stock compilation after paired c95, twenty foundational target placements and paired coordinate-prior correction. No source-wide, fullM/native/central/M7 acceptance; intentional support roles retained.',
             'M7': False, 'HumanApproval': False}
with (O / 'EXECUTION.actual-stock-current-content.json').open('x') as f: f.write(json.dumps(execution, indent=2) + '\n')
assert result.returncode == 0, result.stderr[-3000:]
chem = next(x for x in read(report_path)['reports'] if x['landscapeId'] == 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0')
print(json.dumps({'execution': pin(O / 'EXECUTION.actual-stock-current-content.json'), 'chemistrySummary': chem['summary'], 'report': pin(report_path)}))
