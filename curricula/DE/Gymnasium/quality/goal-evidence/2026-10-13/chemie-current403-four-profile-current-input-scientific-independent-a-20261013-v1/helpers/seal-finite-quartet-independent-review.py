# Apache-2.0. Finite exact quartet review seal; no Git, build, source matrix or active writes.
import datetime
import hashlib
import json
from pathlib import Path

own = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-current403-four-profile-current-input-scientific-independent-a-20261013-v1')
final = own / 'FINAL.independent-four-profile-current-input.freeze.json'
if final.exists():
    raise RuntimeError('Immutable sealed review root')

def bind(path):
    path = Path(path)
    assert not path.is_absolute() and '..' not in path.parts and not path.is_symlink()
    raw = path.read_bytes()
    return {'path': str(path), 'sha256': 'sha256:' + hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}

first = json.loads((own / 'FIRST.neutral-four-profile-current-input-seal.json').read_text())
for row in [first['neutralSelector'], first['authorFinalSeal']] + [r['expected'] for r in first['directNeutralBindings']]:
    assert bind(row['path']) == row
facts = json.loads((own / 'checks/exact-quartet-and-stock-profile-fragments.actual.json').read_text())
inputs = {r['path']: r for r in facts['exactInputs']}
prior = []
base = own.parent
for folder, filename, sha in [
    ('chemie-e594-residual-source-duty-scientific-independent-a-20261013-v3', 'FINAL.independent-residual-source-duty.freeze.json', '839391bfc449fdf9fe96eedf2b138b3b246fd97bd3d87a9f2084175573fd54ed'),
    ('chemie-e594-classification-profile-case-targeted-scientific-independent-a-20261013-v4', 'FINAL.independent-targeted-profile-case.freeze.json', 'cfa52401e9b92ef605581b67c76db7cf703fdbb6ce2aec8652ed6f51c720d480'),
]:
    path = base / folder / filename
    binding = bind(path)
    assert binding['sha256'] == 'sha256:' + sha
    old = json.loads(path.read_text())
    for row in old['outputs']:
        assert bind(row['path']) == row
    inputs[str(path)] = binding
    prior.append({'final': binding, 'allOwnOutputsStillExact': len(old['outputs']), 'scientificJudgmentsUnchanged': True})
for p in ['AGENTS.md', 'app/scripts/goalBookModel.ts', 'app/scripts/positiveGoalEvidenceProfileModel.ts', 'app/scripts/goalEvidenceProfileModel.ts', 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json', 'scripts/validate_schemas.py']:
    inputs[p] = bind(p)
for p, expected in inputs.items():
    assert bind(p) == expected
assert len(facts['profileResults']) == 4 and all(r['profileFragmentValid'] and r['minimumIndependentDemonstrations'] == 2 for r in facts['profileResults'])
assert facts['wholeOriginalCasesUnchanged'] == 8 and facts['totalRubricRows'] == 16 and facts['totalProvidedBilingualSpansChecked'] == 20
decisions = json.loads((own / 'SCIENTIFIC.QUARTET-P-CONTENT.DECISIONS.json').read_text())
assert len(decisions['wholeProfileDecisions']) == 4 and len(decisions['wholeCaseDecisions']) == 8 and decisions['newScientificChemistryBlockers'] == []
receipt = json.loads((own / 'checks/required-portability.actual-root-receipt.json').read_text())
assert receipt['errors'] == [] and receipt['gitMutation'] is False
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
seal = {
    'schemaVersion': 1,
    'sealedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'role': 'Finite genuine independent scientific P-content review of exactly four current403 profiles and eight full original cases',
    'outputs': outputs,
    'outputFiles': len(outputs),
    'outputBytes': sum(r['bytes'] for r in outputs),
    'exactExternalInputs': [inputs[p] for p in sorted(inputs)],
    'externalInputFiles': len(inputs),
    'allFirstNeutralBindingsStillExact': True,
    'previousOwnV3V4ImmutableGuards': prior,
    'wholeCurrentGoalsReviewed': 4,
    'wholeProfileScientificDecisions': 4,
    'wholeOriginalCaseScientificDecisions': 8,
    'newChemistryBlockers': 0,
    'finiteRemainingLimits': 5,
    'actualNativeCurrentImageContexts': 4,
    'stockPositiveProfileFragmentsValid': 4,
    'wholeOriginalCasesUnchanged': 8,
    'ownJSONWholeParseAndRealNewline': True,
    'ownOutputsPhysicalPortableFiles': True,
    'requiredCurriculumPortabilityActualRootReceipt': bind(own / 'checks/required-portability.actual-root-receipt.json'),
    'requiredPortabilityCheckAttribution': 'Root READONLY function at 2026-10-13T17:36:43.356871+00:00, reconfirmed for quartet; exact durable copy, later own outputs physical',
    'first': bind(own / 'FIRST.neutral-four-profile-current-input-seal.json'),
    'scientificDecisions': bind(own / 'SCIENTIFIC.QUARTET-P-CONTENT.DECISIONS.json'),
    'scientificReport': bind(own / 'SCIENTIFIC.QUARTET-P-CONTENT.REPORT.md'),
    'fullNativeDAndCompleteFPSBinding': False,
    'sourceMatrixOrOtherGoalsReviewed': False,
    'actualLearnerPerformance': False,
    'fullBuildOrCompilerExecuted': False,
    'activeHistoricalOrImageWrites': False,
    'gitOperations': False,
    'D_P_A_M_V_orM7Grant': False,
    'humanApproval': False,
    'humanTrial': False,
    'publication': False,
}
final.write_text(json.dumps(seal, ensure_ascii=False, indent=2) + '\n')
json.loads(final.read_text())
print(json.dumps({'final': bind(final), 'outputFiles': len(outputs), 'outputBytes': seal['outputBytes'], 'externalInputs': len(inputs)}))
