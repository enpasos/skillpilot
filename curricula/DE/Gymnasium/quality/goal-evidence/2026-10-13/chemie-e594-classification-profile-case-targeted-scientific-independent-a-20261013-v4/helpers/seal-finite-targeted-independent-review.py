# Apache-2.0. Finite targeted independent seal; no Git or active writes.
import datetime
import hashlib
import json
from pathlib import Path

own = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e594-classification-profile-case-targeted-scientific-independent-a-20261013-v4')
final = own / 'FINAL.independent-targeted-profile-case.freeze.json'
if final.exists():
    raise RuntimeError('Immutable sealed review root')

def bind(path):
    path = Path(path)
    assert not path.is_absolute() and '..' not in path.parts and not path.is_symlink()
    raw = path.read_bytes()
    return {'path': str(path), 'sha256': 'sha256:' + hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}

first = json.loads((own / 'FIRST.neutral-targeted-profile-case-input-seal.json').read_text())
for row in [first['neutralSelector'], first['authorFinalSeal'], first['ownImmutableV3Review']] + [r['expected'] for r in first['directNeutralBindings']]:
    assert bind(row['path']) == row
old = json.loads(Path(first['ownImmutableV3Review']['path']).read_text())
for row in old['outputs'] + old['exactExternalInputs']:
    assert bind(row['path']) == row
checks = json.loads((own / 'checks/targeted-whole-CAS-and-stock-profile-fragments.actual.json').read_text())
inputs = {r['path']: r for r in checks['exactInputs']}
inputs[first['ownImmutableV3Review']['path']] = first['ownImmutableV3Review']
old_decisions = old['scientificDecisions']
inputs[old_decisions['path']] = old_decisions
for p in ['AGENTS.md', 'app/scripts/goalBookModel.ts', 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json', 'scripts/validate_schemas.py']:
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
assert all(r['actualStockProfileFragmentValid'] and r['minimumIndependentDemonstrations'] == 2 for r in checks['profileResults'])
seal = {
    'schemaVersion': 1,
    'sealedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'role': 'Finite genuine independent targeted V4 profile/case correction seal; V3 immutable and residual holds retained',
    'outputs': outputs,
    'outputFiles': len(outputs),
    'outputBytes': sum(r['bytes'] for r in outputs),
    'exactExternalInputs': [inputs[p] for p in sorted(inputs)],
    'externalInputFiles': len(inputs),
    'allFirstNeutralBindingsStillExact': True,
    'allOwnV3OutputsAnd34ExternalInputsStillExact': True,
    'ownJSONWholeParseAndRealNewline': True,
    'ownOutputsPhysicalPortableFiles': True,
    'requiredCurriculumPortabilityActualRootReceipt': bind(own / 'checks/required-portability.actual-root-receipt.json'),
    'requiredPortabilityCheckAttribution': 'Root READONLY function at 2026-10-13T17:36:43.356871+00:00; exact durable copy, new own outputs physical',
    'first': bind(own / 'FIRST.neutral-targeted-profile-case-input-seal.json'),
    'scientificDecisions': bind(own / 'SCIENTIFIC.TARGETED-CORRECTIONS.DECISIONS.json'),
    'scientificReport': bind(own / 'SCIENTIFIC.TARGETED-CORRECTIONS.REPORT.md'),
    'resolvedOwnV3FindingsForThisV4Only': 2,
    'retainedSourceSelectionOptionalPrerequisiteCompilerAndGateLimits': 5,
    'stockPositiveProfileFragmentsValid': 2,
    'wholeCasesReviewedForTargetedChanges': 4,
    'normalSourceCompilerOrPageTupleProof': False,
    'actualLearnerPerformance': False,
    'activeHistoricalOrImageWrites': False,
    'gitOperations': False,
    'D_P_A_M_V_orM7Grant': False,
    'humanApproval': False,
    'humanTrial': False,
}
final.write_text(json.dumps(seal, ensure_ascii=False, indent=2) + '\n')
json.loads(final.read_text())
print(json.dumps({'final': bind(final), 'outputFiles': len(outputs), 'outputBytes': seal['outputBytes'], 'externalInputs': len(inputs)}))
