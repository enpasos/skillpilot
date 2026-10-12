# SPDX-License-Identifier: Apache-2.0
"""Inactive technical transfer of declared source rows; no review or normal build."""
from pathlib import Path
import collections
import copy
import datetime
import hashlib
import json

ROOT = Path.cwd()
E12 = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12')
OUT = E12 / 'chemie-q2-current220-preserving-final-structure-source-technical-20261012-v6'
OWN = OUT / 'sources'
BASE = Path('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json')
BW = Path('curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/bw_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json')
HE = Path('curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.q1-atomic-split-author-proposal-20261005-v1.review.json')
AUTH_BW = E12 / 'chemie-q2-naturstoffe-current407-targeted-remediation-root-preparation-20261012-v3/later-stage-source6/sources/BW126.whole-original-clauses-plus-bounded-two-components.inactive.review.json'
AUTH_HE = E12 / 'chemie-q2-MM-HE-context-normative-edge-removal-author-20261012-v4/sources/HE.whole-clauses-retained-partners-MM-context-excluded.inactive.review.json'
SEAL_BW = AUTH_BW.parent.parent / 'FINAL.technical-preparation.freeze.json'
SEAL_HE = AUTH_HE.parent.parent / 'FINAL.author-provenance-successor.freeze.json'
OUTPUT_BW = OWN / 'BW.upper.current220-plus-declared-Q2-rows.inactive.review.json'
OUTPUT_HE = OWN / 'HE.upper.current220-plus-declared-Q2-MM-rows.inactive.review.json'
RECEIPT = OWN / 'ACTUAL.rowwise-current-source-input-merge.json'
MANIFEST = OWN / 'DECLARATIVE.future-source-inputs.current220-structure-merge.json'
SOURCE_IDS = {
    'BW': {'bw-chem-sekii-3-3-3-b02-a01-f64f99fe', 'bw-chem-sekii-3-4-4-b12-a01-ef062cfb'},
    'HE': {'he-chem-sekii-q2-1-b11-a01-3098b519', 'he-chem-sekii-q3-5-b05-a01-66f2d502'},
}
DECODER = json.JSONDecoder()


def sha(path):
    return 'sha256:' + hashlib.sha256((ROOT / path).read_bytes()).hexdigest()


def digest(raw):
    return 'sha256:' + hashlib.sha256(raw.encode()).hexdigest()


def binding(path):
    p = ROOT / path
    return {'path': str(path), 'bytes': p.stat().st_size, 'sha256': sha(path)}


def read(path):
    return json.loads((ROOT / path).read_text())


def write_new(path, content):
    p = ROOT / path
    assert not p.exists(), f'Refuse to replace existing output: {path}'
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content)


def json_output(value):
    return json.dumps(value, ensure_ascii=False, indent=2) + '\n'


def ws(text, at):
    while at < len(text) and text[at].isspace():
        at += 1
    return at


def raw_rows(text, wanted):
    """Keep each literal JSON row from its opening brace through closing brace."""
    at = ws(text, 0)
    assert text[at] == '{'
    at += 1
    while True:
        at = ws(text, at)
        if text[at] == '}':
            break
        key, at = DECODER.raw_decode(text, at)
        at = ws(text, at)
        assert text[at] == ':'
        start = ws(text, at + 1)
        _, end = DECODER.raw_decode(text, start)
        if key == wanted:
            assert text[start] == '['
            rows = []
            pos = ws(text, start + 1)
            while text[pos] != ']':
                value, stop = DECODER.raw_decode(text, pos)
                rows.append((value, text[pos:stop]))
                pos = ws(text, stop)
                if text[pos] == ',':
                    pos = ws(text, pos + 1)
                else:
                    assert text[pos] == ']'
            return rows
        at = ws(text, end)
        if text[at] == ',':
            at += 1
        else:
            assert text[at] == '}'
    raise AssertionError(f'Missing top-level row array: {wanted}')


def signature(row):
    return json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(',', ':'))


def check_selected_seal(seal, source):
    d = read(seal)
    rows = d.get('ownedFiles', d.get('ownFiles', d.get('files', [])))
    match = [r for r in rows if r['path'] == str(source)]
    assert len(match) == 1 and match[0]['sha256'] == sha(source), str(source)
    return {'seal': binding(seal), 'selectedOwnedFile': binding(source), 'wholeSealVerificationClaim': False}


def merge(name, live_path, author_path, output_path):
    live_text = (ROOT / live_path).read_text()
    author_text = (ROOT / author_path).read_text()
    live = json.loads(live_text)
    author = json.loads(author_text)
    assert live['sourceLandscapeId'] == author['sourceLandscapeId']
    assert live['targetLandscapeId'] == author['targetLandscapeId']
    assert live['sourceExtractionPath'] == author['sourceExtractionPath']
    result = copy.deepcopy(live)
    rendered_rows = {}
    proof = {'subjectSource': name, 'currentActiveInput': binding(live_path), 'declaredAuthorSuccessor': binding(author_path), 'rows': {}}
    for field in ['mappings', 'decisions']:
        before = raw_rows(live_text, field)
        proposed = raw_rows(author_text, field)
        bc = collections.Counter(signature(r) for r, _ in before)
        ac = collections.Counter(signature(r) for r, _ in proposed)
        removed = bc - ac
        added = ac - bc
        changed_ids = {r.get('sourceGoalId', r.get('legacyGoalId')) for r, _ in before + proposed if signature(r) in removed or signature(r) in added}
        assert changed_ids <= SOURCE_IDS[name], (name, field, changed_ids)
        retained = []
        removed_records = []
        remaining = removed.copy()
        for ordinal, (row, raw) in enumerate(before):
            key = signature(row)
            if remaining[key]:
                remaining[key] -= 1
                removed_records.append({'ordinalZeroBased': ordinal, 'row': row, 'rawRowSha256': digest(raw)})
            else:
                retained.append((row, raw))
        addition_records = []
        remaining = added.copy()
        additions = []
        for ordinal, (row, raw) in enumerate(proposed):
            key = signature(row)
            if remaining[key]:
                remaining[key] -= 1
                additions.append((row, raw))
                addition_records.append({'authorOrdinalZeroBased': ordinal, 'row': row, 'rawRowSha256': digest(raw)})
        if field == 'decisions':
            by_id = {row['sourceGoalId']: (row, raw) for row, raw in additions}
            merged = [by_id.get(row['sourceGoalId'], (row, raw)) for row, raw in before]
            assert len(merged) == len(before)
        else:
            merged = retained + additions
        assert collections.Counter(signature(row) for row, _ in merged) == ac
        result[field] = [row for row, _ in merged]
        rendered_rows[field] = '[\n    ' + ',\n    '.join(raw for _, raw in merged) + '\n  ]'
        proof['rows'][field] = {
            'beforeCount': len(before), 'afterCount': len(merged),
            'retainedRowCount': len(retained), 'retainedRawRowsExact': True,
            'removedOrReplaced': removed_records, 'addedOrReplacement': addition_records,
            'declaredSuccessorWholeRowMultisetExact': True,
        }
    changes = []
    old_decisions = {r['sourceGoalId']: r for r in live['decisions']}
    for row in result['decisions']:
        old = old_decisions[row['sourceGoalId']]
        if old != row:
            changes.append({'sourceGoalId': row['sourceGoalId'], 'changedFields': [k for k in sorted(set(old) | set(row)) if old.get(k) != row.get(k)], 'beforeCanonicalGoalIds': old['canonicalGoalIds'], 'afterCanonicalGoalIds': row['canonicalGoalIds'], 'sourceLiteralFieldsUnchanged': all(old.get(k) == row.get(k) for k in ['sourceGoalId', 'sourceSpan', 'topicCode'])})
    result['reviewId'] = f'chemie-current220-{name.lower()}-rowwise-technical-merge-20261012-v6'
    result['status'] = 'inactive_technical_rowwise_merge_pending_exact_independent_source_acceptance'
    result['note'] = (live.get('note', '') + '\nTechnical inactive transfer of only declared Q2/MM successor rows onto the actual current220 source carrier. Existing retained row provenance and author-pending replacement rows stay exact. No new science vote, whole-source approval, learner execution, human approval or active adoption.').strip()
    serialized = copy.deepcopy(result)
    serialized['mappings'] = '__RAW_MAPPINGS_ARRAY_v6__'
    serialized['decisions'] = '__RAW_DECISIONS_ARRAY_v6__'
    content = json_output(serialized)
    for field in ['mappings', 'decisions']:
        content = content.replace(json.dumps('__RAW_' + field.upper() + '_ARRAY_v6__'), rendered_rows[field])
    assert json.loads(content) == result
    for field in ['mappings', 'decisions']:
        actual = raw_rows(content, field)
        allowed_raw = collections.Counter(raw for _, raw in raw_rows(live_text, field) + raw_rows(author_text, field))
        assert not (collections.Counter(raw for _, raw in actual) - allowed_raw)
    write_new(output_path, content)
    proof['decisionFieldChanges'] = changes
    proof['documentHeaderOnlyChangedFields'] = ['reviewId', 'status', 'note']
    proof['sourceExtractionUnchanged'] = binding(Path(live['sourceExtractionPath']))
    proof['preparedMapping'] = binding(output_path)
    return proof


base = read(BASE)
assert len(base['mappingPaths']) == 32
assert str(BW) in base['mappingPaths'] and str(HE) in base['mappingPaths']
ni = [p for p in base['mappingPaths'] if 'DE-NI/upper-secondary/' in p]
sh = [p for p in base['mappingPaths'] if 'DE-SH/upper-secondary/' in p]
assert len(ni) == len(sh) == 1
assert 'm7-manganometry-three-route-corrections' in ni[0]
assert 'm7-micelle-correction' in sh[0]
protected = [BASE, Path(ni[0]), Path(sh[0]), BW, HE, AUTH_BW, AUTH_HE, SEAL_BW, SEAL_HE]
protected_before = {str(p): sha(p) for p in protected}
selected_seals = [check_selected_seal(SEAL_BW, AUTH_BW), check_selected_seal(SEAL_HE, AUTH_HE)]
proofs = [merge('BW', BW, AUTH_BW, OUTPUT_BW), merge('HE', HE, AUTH_HE, OUTPUT_HE)]
future_mapping_paths = [str(OUTPUT_BW) if p == str(BW) else str(OUTPUT_HE) if p == str(HE) else p for p in base['mappingPaths']]
fallback_bindings = []
for active in base['fallbackViewPaths']:
    prepared = OUT / 'views' / Path(active).name
    fallback_bindings.append({'activeSourcePath': active, 'activeSourceSha256': sha(Path(active)), 'preparedPath': str(prepared), 'preparedBy': 'owning integrator', 'mandatoryFutureBinding': True, 'preparedBytesNotAssertedByThisTask': True})
manifest = {
    'artifactRole': 'Declarative inactive future source-input bindings; not an executable normal source config',
    'normalExecutableConfig': False,
    'baseCurrentSourceInputConfig': binding(BASE),
    'futureCanonicalPath': str(OUT / 'candidate/canonical533.current407.current220-preserving.inactive.json'),
    'futureSemanticKindLedgerPath': str(OUT / 'candidate/semantic533.current407.current220-preserving.inactive.json'),
    'mappingPathsInCurrent32Order': future_mapping_paths,
    'mappingReplacementBindings': [{'activeSourcePath': str(BW), 'preparedPath': str(OUTPUT_BW), 'preparedSha256': sha(OUTPUT_BW)}, {'activeSourcePath': str(HE), 'preparedPath': str(OUTPUT_HE), 'preparedSha256': sha(OUTPUT_HE)}],
    'mandatoryFutureFallbackBindings': fallback_bindings,
    'retainedCurrentConfigurationValues': {k: base[k] for k in ['bookId', 'subject', 'allowedSourceSubjects', 'durationModelPolicyPath', 'sourceDocumentSnapshots', 'expectedJurisdictions']},
    'protectedCurrentNIManganometry': binding(Path(ni[0])),
    'protectedCurrentSHMicelleCorrection': binding(Path(sh[0])),
    'measurementRequiredBeforeExecutableConfiguration': {'finalCanonicalAndSemanticFilesMustExistAndBeBound': True, 'allFourPreparedFallbackViewsMustReplaceActiveOldViewPaths': True, 'sourceCountsAndUnresolvedCountsMustBeMeasuredOnFinalMergedInputs': True, 'noHistorical386Or387CountIsAnExpectedResult': True, 'normalSourceAndNativeBuildsPerformedHere': False},
    'canonicalMMBoundaryOwner': {'preparedBy': 'owning integrator', 'newClusterId': '42a43029-078e-5322-b0c4-bb8f9b9c5bda', 'goalId': 'c245d5fd-ce46-5b45-ab2e-e610547b5f7c', 'requiredStructuralFlag': {'applicabilityMappingInheritance': 'boundary'}, 'NIMappingRowsMustRemainExact': True},
    'newScienceVotes': 0, 'humanApproval': False, 'activeWrites': False,
}
write_new(MANIFEST, json_output(manifest))
protected_after = {str(p): sha(p) for p in protected}
assert protected_before == protected_after
receipt = {
    'artifactRole': 'Actual bounded technical rowwise source consolidation; no new author or independent vote',
    'createdAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'baseCurrentInputConfig': binding(BASE),
    'selectedAuthorSealBindings': selected_seals,
    'rowEqualityRule': 'Unchanged and copied changed JSON rows retain exact literal bytes from opening brace through closing brace; only array delimiters/order and three document-header values are technical serialization.',
    'sourceMerges': proofs,
    'sourceInputReplacementCount': 2,
    'remainingCurrentMappingPathEntriesExactInOriginalOrder': 30,
    'protectedNIAndSHRowsAndFileBytesExact': True,
    'protectedInputsBefore': protected_before, 'protectedInputsAfter': protected_after,
    'declarativeFutureInputManifest': binding(MANIFEST),
    'sourceExtractionChanges': 0,
    'normalExecutableConfigCreated': False, 'normalSourceOrNativeModelsBuilt': False,
    'scientificMismatchesDetectedByBoundedRowTransfer': [],
    'finalCanonicalScienceAndSourceAcceptanceNotClaimed': True,
    'newScientificVotes': 0, 'humanApproval': False, 'activeOrGitWrites': False,
}
write_new(RECEIPT, json_output(receipt))
print(json.dumps({'preparedSourceMappings': [str(OUTPUT_BW), str(OUTPUT_HE)], 'futureManifest': str(MANIFEST), 'receipt': str(RECEIPT), 'mappingRowsBeforeAfter': [[p['subjectSource'], p['rows']['mappings']['beforeCount'], p['rows']['mappings']['afterCount']] for p in proofs], 'decisionReplacementCounts': [len(p['decisionFieldChanges']) for p in proofs], 'protectedNIAndSHExact': True, 'normalBuilds': False, 'activeWrites': False}))
