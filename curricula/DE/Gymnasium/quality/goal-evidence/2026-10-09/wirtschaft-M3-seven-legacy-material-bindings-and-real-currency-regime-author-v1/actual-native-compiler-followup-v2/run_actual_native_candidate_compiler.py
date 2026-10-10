#!/usr/bin/env python3
from __future__ import annotations
import datetime
import hashlib
import json
import pathlib
import shutil
import subprocess
import tempfile

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[7]
PACKAGE = HERE.parent
CANDIDATE = PACKAGE / 'whole-CAN494.seven-material-assessment-bindings-and-real-regime.inert-author-candidate.json'
SEED = pathlib.Path(pathlib.Path('/tmp/skillpilot-economics-M3-M4-material-scope-independent-B-capsule-root.txt').read_text().strip())
CAPSULE = pathlib.Path(tempfile.mkdtemp(prefix='skillpilot-economics-seven-material-author-native-')) / 'capsule'
shutil.copytree(SEED, CAPSULE, symlinks=True)
def digest(path): return hashlib.sha256(path.read_bytes()).hexdigest()
physical = []
for path in sorted((CAPSULE / 'curricula').rglob('*.json')):
    if path.is_symlink() or not path.is_file(): continue
    rel = path.relative_to(CAPSULE)
    current = ROOT / rel
    assert current.is_file(), f'Missing current physical native seed input: {rel}'
    path.write_bytes(current.read_bytes())
    physical.append({'path': str(rel), 'sha256': digest(path), 'wholeCurrentPublicInputCopied': True})
canonical_rel = pathlib.Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
(CAPSULE / canonical_rel).write_bytes(CANDIDATE.read_bytes())
for item in physical:
    if item['path'] == str(canonical_rel):
        item.update(sha256=digest(CANDIDATE), wholeCurrentPublicInputCopied=False, inertWholeCandidateInput=True)
module_rels = [
    'app/scripts/applicabilityCompiler.ts',
    'app/scripts/memoryCardReviewConfigDiscovery.ts',
    'app/src/utils/jurisdictionMetadata.ts',
]
modules = []
for rel in module_rels:
    source, dest = ROOT / rel, CAPSULE / rel
    if dest.is_symlink(): dest.unlink()
    dest.write_bytes(source.read_bytes())
    modules.append({'path': rel, 'sha256': digest(dest), 'wholeCurrentProductionModuleBytesExact': digest(dest) == digest(source)})
assert modules[0]['sha256'] == '50f4a09007cece8119c53f665b6442e028e4ffb3910fda7b377e60f8cb6c81dd'
node = pathlib.Path('/tmp/skillpilot-checkpoint-native-node-path.txt').read_text().strip()
assert digest(pathlib.Path(node)) == '6295488653f0d93b0a157841746fef7e72cc4328cfb60c4bbe0ca2668a836ffd'
script = HERE / 'capture_actual_native_candidate_applicability.mts'
output = HERE / 'whole-actual-seven-material-CAN494.native-applicability-report.json'
argv = [node, str(ROOT/'app/node_modules/tsx/dist/cli.mjs'), str(script), str(CAPSULE), str(ROOT), str(output)]
start = datetime.datetime.now(datetime.timezone.utc).isoformat()
result = subprocess.run(argv, cwd=ROOT, capture_output=True, text=True)
end = datetime.datetime.now(datetime.timezone.utc).isoformat()
raw = HERE / 'actual-seven-material-native-applicability.raw.txt'
raw.write_text(result.stdout + result.stderr)
receipt = {'role': 'AUTHOR_ACTUAL_NATIVE_COMPILER_CHECK_NO_SELF_SCIENCE_APPROVAL', 'argv': argv, 'startedAt': start, 'finishedAt': end, 'exitCode': result.returncode, 'nodeSha256': digest(pathlib.Path(node)), 'nativeProductionModules': modules, 'physicalPublicInputs': physical, 'temporaryReadOnlyDirectoryAliases': [{'path':str(p.relative_to(CAPSULE)), 'resolvedDirectory':str(p.resolve()), 'actualReadFilesIndividuallyBoundInResult':True} for p in sorted((CAPSULE/'curricula').rglob('*')) if p.is_symlink() and p.is_dir()], 'candidateSha256':digest(CANDIDATE), 'rawSha256':digest(raw), 'actualReportSha256':digest(output) if output.exists() else None, 'nativeAlgorithmModified':False, 'qualityThresholdsOrFiltersModified':False, 'activeProductionEdits':0, 'independentScientificAndCurrentRootIntegrationApprovalPending':True}
(HERE/'actual-seven-material-native-applicability.command-exit.json').write_text(json.dumps(receipt, ensure_ascii=False, indent=2)+'\n')
print(result.stdout)
print(result.stderr)
print(json.dumps({'exitCode':result.returncode, 'reportSha256':receipt['actualReportSha256'], 'commandReceiptSha256':digest(HERE/'actual-seven-material-native-applicability.command-exit.json')}))
raise SystemExit(result.returncode)
