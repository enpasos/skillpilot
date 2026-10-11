"""Verify exact current checkpoint evidence against Git-index blob bytes.

Read-only: no scientific review, Git index mutation or release approval.
"""
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, subprocess, sys
ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
N = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/biologie-bio8-current369-v6-dual-reviewed-active-integration-technical-20261011-v1'
a = json.loads((N / 'CHECKPOINT.exact-active-and-original-evidence-allowlist.json').read_text())
f = json.loads((N / 'FINAL.technical-active-Bio379-checkpoint.freeze.json').read_text())
index = {}
for row in subprocess.check_output(['git','ls-files','--stage','-z'], cwd=ROOT).split(b'\0'):
    if row:
        meta,path = row.decode().split('\t',1)
        mode,oid,stage = meta.split()
        assert stage == '0', (path,stage)
        index[path] = (mode,oid)
records = a['mandatoryOwnEvidenceFiles'] + a['historicalExactCasDependencyFiles']
records += [r for r in a['activePaths'] if not r['ignoredByGit']]
records += f['records']
records += [{'path': (N / 'FINAL.technical-active-Bio379-checkpoint.freeze.json').relative_to(ROOT).as_posix(), 'sha256': 'sha256:f904f7014e5749d6d4b2f355d0d7a95124f719da7b770275fe996e134a5ac344'}]
capture_manifest = json.loads((OUT / 'before-additive-routing-delta.exact-index-bindings.json').read_text())
historical_captures = {
    (r['originalActivePath'], r['originalExpectedSHA256'].removeprefix('sha256:')): r['exactIndexBlobCapture']
    for r in capture_manifest['records']
}
extra_frozen_inputs = []
declared_ignored_runtime_bindings = []
def collect_frozen_records(value, historical_capture_allowed=True):
    if isinstance(value, dict):
        if isinstance(value.get('path'), str) and isinstance(value.get('sha256'), str):
            digest = value['sha256'].removeprefix('sha256:')
            if len(digest) == 64 and all(c in '0123456789abcdef' for c in digest):
                records.append({**value, '_historicalCaptureAllowed': historical_capture_allowed})
        for key, child in value.items():
            if key == 'ignoredRuntimeAssetBindings':
                assert isinstance(child, list), ('Invalid declared runtime bindings', child)
                declared_ignored_runtime_bindings.extend(child)
                continue
            collect_frozen_records(child, historical_capture_allowed)
    elif isinstance(value, list):
        for child in value:
            collect_frozen_records(child, historical_capture_allowed)
current_frozen_inputs = []
additional_historical_capture_manifests = []
report_path = OUT / 'staged-evidence-portability.actual.json'
for argument in sys.argv[1:]:
    if argument.startswith('--output='):
        report_path = ROOT / argument.split('=', 1)[1]
        assert report_path.resolve().is_relative_to(ROOT), report_path
        continue
    if argument.startswith('--historical-captures='):
        manifest_relative = argument.split('=', 1)[1]
        manifest_bytes = (ROOT / manifest_relative).read_bytes()
        manifest = json.loads(manifest_bytes)
        records.append({'path': manifest_relative, 'sha256': hashlib.sha256(manifest_bytes).hexdigest()})
        for capture in manifest['records']:
            original_digest = capture['originalExpectedSHA256'].removeprefix('sha256:')
            capture_path = capture.get('exactFrozenBlobCapture', capture.get('exactIndexBlobCapture'))
            assert isinstance(capture_path, str), ('Missing exact capture path', capture)
            historical_captures[(capture['originalActivePath'], original_digest)] = capture_path
            records.append({'path': capture_path, 'sha256': original_digest})
        additional_historical_capture_manifests.append(manifest_relative)
        continue
    current_bindings = argument.startswith('--current-active-bindings=')
    frozen_relative = argument.split('=', 1)[1] if current_bindings else argument
    frozen_path = ROOT / frozen_relative
    frozen_bytes = frozen_path.read_bytes()
    records.append({'path': frozen_relative, 'sha256': hashlib.sha256(frozen_bytes).hexdigest()})
    frozen = json.loads(frozen_bytes)
    collect_frozen_records(frozen)
    if current_bindings:
        assert isinstance(frozen.get('currentActiveBindings'), list), ('currentActiveBindings missing', frozen_relative)
        collect_frozen_records(frozen['currentActiveBindings'], historical_capture_allowed=False)
        current_frozen_inputs.append(frozen_relative)
    extra_frozen_inputs.append(frozen_relative)
unique = {}
for record in records:
    path = record['path']
    unique[(path, record['sha256'].removeprefix('sha256:'), record.get('_historicalCaptureAllowed', True))] = record
failures=[]
historical_capture_checks=[]
blob_hashes = {}
def index_blob_sha256(oid):
    if oid not in blob_hashes:
        blob_hashes[oid] = hashlib.sha256(subprocess.check_output(['git','cat-file','blob',oid], cwd=ROOT)).hexdigest()
    return blob_hashes[oid]
for (path, expected, historical_capture_allowed), record in sorted(unique.items()):
    index_path = historical_captures.get((path, expected), path) if historical_capture_allowed else path
    if index_path != path:
        historical_capture_checks.append({'originalActivePath':path,'sha256':expected,'historicalExactGitBlobCapture':index_path})
    if index_path not in index:
        failures.append({'path':path,'indexPath':index_path,'reason':'missing Git index blob'});continue
    mode,oid=index[index_path]
    if mode=='120000':
        failures.append({'path':path,'reason':'symlink is not a regular frozen artifact'});continue
    actual=index_blob_sha256(oid)
    if actual != expected:
        failures.append({'path':path,'reason':'Git blob differs from actual sealed bytes','expected':expected,'actual':actual})
runtime_checks = []
for record in declared_ignored_runtime_bindings:
    path = record['path']
    expected = record['sha256'].removeprefix('sha256:')
    prefix = 'backend/src/main/resources/static/assets/goal-visualizations/'
    assert path.startswith(prefix), ('Unsupported declared generated runtime partner', path)
    suffix = path.removeprefix(prefix)
    partners = ['curricula/DE/Gymnasium/visualizations/' + suffix, 'app/public/assets/goal-visualizations/' + suffix]
    runtime_path = ROOT / path
    ignored = subprocess.run(['git', 'check-ignore', '-q', '--no-index', path], cwd=ROOT).returncode == 0
    runtime_regular = runtime_path.is_file() and not runtime_path.is_symlink()
    actual_runtime_sha256 = hashlib.sha256(runtime_path.read_bytes()).hexdigest() if runtime_regular else None
    check = {'path': path, 'sha256': expected, 'actuallyIgnoredByGit': ignored, 'absentFromGitIndex': path not in index, 'workingRegularFile': runtime_regular, 'workingSHA256': actual_runtime_sha256, 'mandatorySourcePublicPartners': partners}
    if not ignored or path in index or not runtime_regular or actual_runtime_sha256 != expected:
        failures.append({'path': path, 'reason': 'Declared generated runtime copy is not actually ignored, regular, byte-exact and excluded from index', 'actual': check})
    for partner in partners:
        if partner not in index or index[partner][0] == '120000' or index_blob_sha256(index[partner][1]) != expected:
            failures.append({'path': partner, 'reason': 'Declared generated runtime copy lacks an exact regular current source/public Git partner', 'expected': expected})
    runtime_checks.append(check)
report = {'schemaVersion':1,'kind':'actual-staged-CAS-portability-check','createdAtUTC':datetime.now(timezone.utc).isoformat(),'baselineGitHead':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT).decode().strip(),'exactRegularIndexBlobsChecked':len(unique),'additionalFrozenInputs':extra_frozen_inputs,'currentActiveBindingManifests':current_frozen_inputs,'currentActiveBindingsChecked':sum(not key[2] for key in unique),'additionalHistoricalCaptureManifests':additional_historical_capture_manifests,'historicalExactCaptures':historical_capture_checks,'declaredGeneratedRuntimeCopiesChecked':runtime_checks,'mismatches':failures,'scienceApproval':False,'humanApproval':False,'GitHubCIPass':False,'ignoredBackendCopiesBoundary':'Explicitly declared generated Backend copies are separately required to be regular, actually Git-ignored, absent from index, and byte-exact against both mandatory current regular source/public Git partners. All other operative frozen inputs remain Git obligations.','additiveRepairBoundary':'Historical bindings remain byte-exact in explicitly measured original-index or separately frozen pre-adoption working captures. Additional current successor freezes are checked separately against the actual current index without historical substitution; a capture is not a current approval.'}
report_path.parent.mkdir(parents=True, exist_ok=True)
report_path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'checked':len(unique),'mismatches':len(failures)}))
for failure in failures[:12]: print(json.dumps(failure))
raise SystemExit(1 if failures else 0)
