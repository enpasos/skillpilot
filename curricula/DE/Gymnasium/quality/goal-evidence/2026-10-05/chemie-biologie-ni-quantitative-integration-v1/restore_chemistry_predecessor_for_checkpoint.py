# SPDX-License-Identifier: Apache-2.0
"""Restore only the explicit Chemistry package; preserve its entire candidate."""
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import runpy

OWN = Path(__file__).resolve().parent
ROOT = OWN.parents[6]
CANDIDATE = OWN.parent / 'chemie-q1-quantitative-reviewed-integration-candidate-v1'
BACKUP = OWN / 'chemistry-before-application'
SAVED = OWN / 'chemistry-attempt.before-stable-restoration'


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


plan = json.loads((CANDIDATE / 'guarded-apply-plan.json').read_text())
prior = json.loads((OWN / 'chemistry-actual-before-backup.receipt.json').read_text())['files']
frozen = CANDIDATE / 'reviewed-integration.final.freeze.json'
assert sha(frozen.read_bytes()) == 'ff7876883da8135572b3650109bc5b11a0ba1f8a0d25b0c47db159214aca06b0'
for row in json.loads(frozen.read_text())['files']:
    path = ROOT / row['path']
    assert sha(path.read_bytes()) == row['sha256'].removeprefix('sha256:'), str(path)
after = {row['targetPath']: row['afterSHA256'] for row in plan['writes']}
qa_path = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
after[qa_path] = '9eda9bf03bfc2139e999c469fe3be7532ed3abab80673b6313483eb40d0c0e55'
registry_path = plan['registry']['path']
registry_before = (ROOT / registry_path).read_text()
old_registry = (BACKUP / registry_path).read_text()
spans = runpy.run_path(str(CANDIDATE / 'apply-reviewed-candidate.py.txt'), run_name='read_only_restore_definitions')['subject_spans']
a, b, current_chem = next(x for x in spans(registry_before) if x[2]['subject'] == 'chemie')
c, d, old_chem = next(x for x in spans(old_registry) if x[2]['subject'] == 'chemie')
assert current_chem == plan['registry']['futureWholeChemistryEntry']
registry_after = registry_before[:a] + old_registry[c:d] + registry_before[b:]
foreign_before = {x[2]['subject']: registry_before[x[0]:x[1]] for x in spans(registry_before) if x[2]['subject'] != 'chemie'}
foreign_after = {x[2]['subject']: registry_after[x[0]:x[1]] for x in spans(registry_after) if x[2]['subject'] != 'chemie'}
assert foreign_before == foreign_after
assert not SAVED.exists()
prepared = []
for row in prior:
    relative = row['path']
    if relative == registry_path:
        prepared.append((relative, registry_before.encode(), registry_after.encode()))
        continue
    path = ROOT / relative
    actual = path.read_bytes() if path.is_file() else None
    if relative in after:
        assert actual is not None and sha(actual) == after[relative], relative
    else:
        assert actual is None, relative
    restored = (BACKUP / relative).read_bytes() if row['wasPresent'] else None
    if restored is not None:
        assert sha(restored) == row['beforeSHA256'], relative
    prepared.append((relative, actual, restored))

# The exact integrated attempt remains independently auditable before any removal.
saved_rows = []
for relative, actual, restored in prepared:
    if actual is not None:
        path = SAVED / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(actual)
        assert sha(path.read_bytes()) == sha(actual)
    saved_rows.append({'path': relative, 'attemptSHA256': sha(actual) if actual is not None else None,
                       'restoredSHA256': sha(restored) if restored is not None else None})
for relative, actual, restored in prepared:
    path = ROOT / relative
    assert (path.read_bytes() if path.is_file() else None) == actual
    if restored is None:
        path.unlink()
    else:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(restored)
    assert (path.read_bytes() if path.is_file() else None) == restored

# Default report routing uses the already reviewed 376-goal predecessor.
default = ROOT / 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json'
raw = default.read_bytes()
assert sha(raw) == '4cf9bb837ef5ec856a6bf5a3ab79cc669d02c4f3b0b64c47a5df037a4ff18ab9'
active = json.loads((ROOT / old_chem['memoryReviewConfigPath']).read_text())
current = json.loads(raw)
for key in ['reviewPath', 'cardReviewPath']:
    current[key] = active[key]
assert {k:v for k,v in current.items() if k != 'reportPath'} == {k:v for k,v in active.items() if k != 'reportPath'}
for relative in ['curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json', current['reportPath']]:
    dest = SAVED / relative
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes((ROOT / relative).read_bytes())
default.write_text(json.dumps(current, ensure_ascii=False, indent=2) + '\n')
result = {'completedAtUTC': datetime.now(timezone.utc).isoformat(),
          'result': 'RESTORED reviewed Chemistry predecessor; candidate remains immutable and inactive',
          'reason': 'Preserve M6: unresolved two unsupported BY target assignments and missing paraben-LK terminal route',
          'exactDestinations': saved_rows, 'candidateFreezeSHA256': sha(frozen.read_bytes()),
          'candidateVerifiedFiles': len(json.loads(frozen.read_text())['files']),
          'allForeignRegistryRawEntriesExact': True, 'biologyIntegrationPreserved': True,
          'restoredWholeChemistryRegistry': old_chem, 'defaultMemoryReviewConfig': str(default.relative_to(ROOT)),
          'defaultMemoryReviewConfigAfterSHA256': sha(default.read_bytes()),
          'newScientificClosuresClaimed': 0, 'humanApproval': False, 'humanTrial': False,
          'currentCentralReportFloorsBuildAndLedgerStillRequired': True}
out = OWN / 'chemistry-reviewed-predecessor-restoration.actual.json'
assert not out.exists()
out.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'result': result['result'], 'restoredDestinations': len(prepared),
                  'candidateVerifiedFiles': result['candidateVerifiedFiles'],
                  'allForeignRegistryRawEntriesExact': True}))
