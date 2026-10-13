# Apache-2.0. Finite independent seal; no Git or active writes.
import datetime
import hashlib
import json
from pathlib import Path

own = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e594-residual-source-duty-scientific-independent-a-20261013-v3')
final = own / 'FINAL.independent-residual-source-duty.freeze.json'
if final.exists():
    raise RuntimeError('Immutable sealed review root')

def bind(path):
    path = Path(path)
    assert not path.is_absolute() and '..' not in path.parts and not path.is_symlink()
    raw = path.read_bytes()
    return {'path': str(path), 'sha256': 'sha256:' + hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}

first = json.loads((own / 'FIRST.neutral-residual-source-duty-input-seal.json').read_text())
for row in [first['neutralSelector'], first['authorFinalSeal']] + [r['expected'] for r in first['directNeutralBindings']]:
    assert bind(row['path']) == row
checks = json.loads((own / 'checks/bounded-inputs-and-stock-profile-fragments.actual.json').read_text())
inputs = {r['path']: r for r in checks['inputs'] if not r['path'].startswith(str(own) + '/')}
primary = json.loads((own / 'checks/actual-primary-contexts.read.json').read_text())
for r in primary['originals']:
    inputs[r['wholeOriginal']['path']] = r['wholeOriginal']
for p in ['AGENTS.md', 'app/scripts/goalBookModel.ts', 'app/src/utils/authoring/compositionViewAuthoring.ts', 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json', 'scripts/validate_schemas.py']:
    inputs[p] = bind(p)
for p, expected in inputs.items():
    assert bind(p) == expected
outputs = []
for p in sorted(own.rglob('*')):
    if p.is_dir():
        continue
    assert not p.is_symlink()
    raw = p.read_bytes()
    if p.suffix == '.json':
        json.loads(raw)
        assert raw.endswith(b'\n')
    outputs.append(bind(p))
receipt = json.loads((own / 'checks/required-portability.actual-root-receipt.json').read_text())
assert receipt['errors'] == [] and receipt['gitMutation'] is False
seal = {
    'schemaVersion': 1,
    'sealedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'role': 'Finite independent exact V3 scientific review seal; unresolved whole-profile/case and selected-source limits remain',
    'outputs': outputs,
    'outputFiles': len(outputs),
    'outputBytes': sum(r['bytes'] for r in outputs),
    'exactExternalInputs': [inputs[p] for p in sorted(inputs)],
    'externalInputFiles': len(inputs),
    'allFirstNeutralBindingsStillExact': True,
    'ownJSONWholeParseAndRealNewline': True,
    'ownOutputsPhysicalPortableFiles': True,
    'requiredCurriculumPortabilityActualRootReceipt': bind(own / 'checks/required-portability.actual-root-receipt.json'),
    'requiredPortabilityCheckAttribution': 'Root READONLY function at 2026-10-13T17:36:43.356871+00:00; exact durable copy, not a reviewer rerun',
    'first': bind(own / 'FIRST.neutral-residual-source-duty-input-seal.json'),
    'scientificDecisions': bind(own / 'SCIENTIFIC.RESIDUAL-DUTY.DECISIONS.json'),
    'scientificReport': bind(own / 'SCIENTIFIC.RESIDUAL-DUTY.REPORT.md'),
    'finiteUnresolvedLimits': 7,
    'normalSourceCompilerOrPageTupleProof': False,
    'activeHistoricalOrImageWrites': False,
    'gitOperations': False,
    'D_P_A_M_V_orM7Grant': False,
    'humanApproval': False,
    'humanTrial': False,
}
final.write_text(json.dumps(seal, ensure_ascii=False, indent=2) + '\n')
json.loads(final.read_text())
print(json.dumps({'final': bind(final), 'outputFiles': len(outputs), 'outputBytes': seal['outputBytes'], 'externalInputs': len(inputs)}))
