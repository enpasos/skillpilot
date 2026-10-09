# SPDX-License-Identifier: Apache-2.0
"""Separate documented pagination changes from substantive current page context changes."""
import hashlib
import json
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
EXCLUDED = {'pageNumber', 'navigationOrder', 'treeOrder', 'pageFingerprint', 'ordinal'}


def read(path):
    return json.loads(path.read_text())


def bind(path):
    data = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(),
            'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def strip(value):
    if isinstance(value, list):
        return [strip(item) for item in value]
    if isinstance(value, dict):
        return {key: strip(item) for key, item in value.items() if key not in EXCLUDED}
    return value


source_path = OWN / 'native/whole378-to-inactive395.same-review-root.actual-page-context-diff.json'
source = read(source_path)
before_pages = read(OWN / 'native/whole378.same-canonical-root.before.book-model.json')['pages']
after_pages = read(OWN / 'native/whole395.inactive-review-only.book-model.json')['pages']
assert len(before_pages) == 378 and len(after_pages) == 395
after_by = {row['goalId']: row for row in after_pages}
protected_ids = {row['goalId'] for row in source['currentProtected177Rows']}
assert len(protected_ids) == 177
rows = []
for before in before_pages:
    after = after_by.get(before['goalId'])
    if after is None:
        rows.append({'goalId': before['goalId'], 'convertedFormerAtomicFamily': True,
                     'oldAtomicSourceAndScopeObligationsRetainedSeparately': True})
        continue
    old, new = strip(before), strip(after)
    changed = sorted(key for key in old.keys() | new.keys() if old.get(key) != new.get(key))
    row = {'goalId': before['goalId'], 'protectedStrictCurrentId': before['goalId'] in protected_ids,
           'substantiveChangedFields': changed, 'wholePageExceptDocumentedPaginationExact': not changed,
           'fullPageRawExact': before == after, 'targetedCurrentContextReviewRequired': bool(changed),
           'wholeSubstantiveBeforePage': old, 'wholeSubstantiveInactiveCandidatePage': new}
    rows.append(row)
protected = [row for row in rows if row.get('protectedStrictCurrentId')]
changed_protected = [row for row in protected if row['substantiveChangedFields']]
assert len(protected) == 177
expected_eight = {
    '13d4f336-ab16-54a7-9479-c920b458f385', '3c9bfa10-9a13-50cc-96c8-6213e28d6c54',
    '8b98d8ba-65c6-58d7-92f0-45f4b2456573', '95dc0ee5-a0af-5682-af32-d66e36fbeb50',
    '9b5d6326-d27c-4ece-8c72-debda705464a', 'a0e8f0f2-24e2-5945-a511-597d32e73796',
    'c0f1bf09-5a70-5006-b1e9-e91f786a63bf', 'e313c1ee-a617-54ed-adea-c183da1e03d8',
}
assert {row['goalId'] for row in changed_protected} == expected_eight
value = {'schemaVersion': 1, 'role': 'Actual whole-page comparison excluding only documented pagination/order/derived page fingerprint metadata; no scientific re-review',
         'exactInputBindings': [bind(source_path), bind(OWN / 'native/whole378.same-canonical-root.before.book-model.json'),
                               bind(OWN / 'native/whole395.inactive-review-only.book-model.json')],
         'excludedKeysAtAllNestingLevels': sorted(EXCLUDED),
         'rawProtectedPageChangesIncludingPagination': source['actualProtectedContextDeltaCount'],
         'actualSubstantiveProtectedContextChanges': len(changed_protected),
         'protectedPageSubstantiveExactCount': len(protected) - len(changed_protected),
         'actualEightUnresolvedProtectedContextRows': changed_protected,
         'wholeCurrent378Rows': rows, 'inactiveCandidate395': True,
         'currentActiveScopeRemains378': True, 'sourceCoursePlacementApproval': False,
         'newScientificClosures': 0, 'restoredBindings': 0, 'netStrictGain': 0,
         'humanApproval': False, 'activeWrites': []}
path = OWN / 'native/whole378-to-inactive395.substantive-page-context-deltas.actual.json'
assert not path.exists()
path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'wholeBefore378': True, 'inactiveAfter395': True,
                  'rawProtectedDeltasIncludingPagination': source['actualProtectedContextDeltaCount'],
                  'actualSubstantiveContextHolds': len(changed_protected),
                  'substantiveProtectedExact': len(protected) - len(changed_protected),
                  'scientificReviewOrClosure': False, 'activeWrites': 0}))
