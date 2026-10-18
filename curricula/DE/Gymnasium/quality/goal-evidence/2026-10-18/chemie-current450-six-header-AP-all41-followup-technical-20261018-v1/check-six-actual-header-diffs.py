# SPDX-License-Identifier: Apache-2.0
"""Read six exact header-only removals, including reconstructed original raw bytes."""
import hashlib
import itertools
import json
from pathlib import Path

out = Path(__file__).resolve().parent.relative_to(Path.cwd())
base = out.parent / 'chemie-current450-final737-AP-and-all41-closure-checkpoint-technical-20261018-v1'
peer = out.parent / 'chemie-checkpoint-runtime-mapping-contract-readonly-b-20261018-v1/followup-six-review-markers-actual-v1'
meta = 'c7QuantitativeDataPartialIntegration'


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def pin(path):
    raw = Path(path).read_bytes()
    return {'path': str(path), 'sha256': sha(raw), 'bytes': len(raw)}


def fields(text):
    decoder, offset, result = json.JSONDecoder(), text.index('{') + 1, []
    while True:
        while text[offset].isspace() or text[offset] == ',':
            offset += 1
        if text[offset] == '}':
            return result
        start = offset
        key, offset = decoder.raw_decode(text, offset)
        while text[offset].isspace():
            offset += 1
        assert text[offset] == ':'
        offset += 1
        while text[offset].isspace():
            offset += 1
        value_start = offset
        value, end = decoder.raw_decode(text, offset)
        result.append({'key': key, 'value': value, 'start': start, 'valueStart': value_start, 'end': end})
        offset = end


peer_seal = peer / 'MARKERS6.integration-before-tests.seal.json'
assert pin(peer_seal)['sha256'] == 'bfdafe2c299f057862182192cb5a107d153ff369391ed5b1cec78e95e2612a1e'
for member in json.loads(peer_seal.read_text())['files']:
    assert pin(member['path']) == member
receipt_path = peer / 'MARKERS6.full-before-blocks-and-byte-checks.receipt.json'
receipt = json.loads(receipt_path.read_text())
original_pins = json.loads((base / 'INPUTS.actual-normal-production-and-read-pins.json').read_text())
before_pins = {p['path']: p for p in original_pins['actualCompilerReadPins']}
checks = []
for item in receipt['checks']:
    path = item['runtimePath']
    after_pin = pin(path)
    before_pin = {'path': path, 'sha256': item['beforeSha256'], 'bytes': item['beforeBytes']}
    assert before_pin == before_pins[path]
    assert after_pin == {'path': path, 'sha256': item['afterSha256'], 'bytes': item['afterBytes']}
    after = Path(path).read_text()
    after_fields = fields(after)
    assert not any(f['key'] in ['decisions', meta] for f in after_fields)
    separator = after[after_fields[0]['end']:after_fields[1]['start']]
    assert all(after[a['end']:b['start']] == separator for a, b in zip(after_fields, after_fields[1:]))
    kept = [after[f['start']:f['end']] for f in after_fields]
    removed = item['removedRawFieldBlocks']
    assert [f['key'] for f in removed] == ['decisions', meta]
    # Search only placement of the two removed raw fields among exact retained
    # field bytes. A unique full before-SHA match reconstructs the actual old file.
    matching = []
    for positions in itertools.combinations(range(len(kept) + 2), 2):
        added, retained, merged = iter(removed), iter(kept), []
        for i in range(len(kept) + 2):
            merged.append(next(added)['raw'] if i in positions else next(retained))
        text = after[:after_fields[0]['start']] + separator.join(merged) + after[after_fields[-1]['end']:]
        if sha(text.encode()) == before_pin['sha256']:
            matching.append(text)
    assert len(matching) == 1, path
    before = matching[0]
    assert len(before.encode()) == before_pin['bytes']
    old = json.loads(before)
    new = json.loads(after)
    assert new == {k: v for k, v in old.items() if k not in ['decisions', meta]}
    old_fields = fields(before)
    for f in after_fields:
        old_field = next(x for x in old_fields if x['key'] == f['key'])
        assert before[old_field['start']:old_field['end']] == after[f['start']:f['end']]
    mapping = next(f for f in after_fields if f['key'] == 'mappings')
    mappings_raw = after[mapping['valueStart']:mapping['end']].encode()
    assert sha(mappings_raw) == item['entireMappingsArrayRawSha256']
    assert len(new['mappings']) == item['mappingRows']
    ledger_pin = {k: item['reviewLedger'][k] for k in ['path', 'sha256', 'bytes']}
    assert pin(ledger_pin['path']) == ledger_pin
    ledger = json.loads(Path(ledger_pin['path']).read_text())
    assert old[meta] == ledger[meta] == item['removedFullBeforeBlocks'][meta]
    comparisons = []
    for decision in old['decisions']:
        matches = [row for row in ledger['decisions'] if row.get('sourceGoalId') == decision['sourceGoalId']]
        assert len(matches) == 1
        row = matches[0]
        exact_runtime_fields = all(row.get(k) == v for k, v in decision.items())
        if '/DE-SH/' in path:
            assert not exact_runtime_fields
            for key in ['sourceGoalId', 'topicCode', 'decision']:
                assert row[key] == decision[key]
            assert set(decision['canonicalGoalIds']) <= set(row['canonicalGoalIds'])
            assert decision['rationale'] in row['rationale']
            assert decision['sourceSpan'] == 'Schleswig-Holstein Fachanforderungen Chemie Sekundarstufe I/II 2022, 2.1.1 Erkenntnisgewinnung, S. 18.'
            assert row['sourceSpan'] == '2.1.1 Erkenntnisgewinnung, S. 18: mathematische Verfahren zur Aufbereitung der Daten und zum Erkennen von Trends nutzen.'
        else:
            assert exact_runtime_fields, path
        comparisons.append({'sourceGoalId': decision['sourceGoalId'], 'allSixRuntimeDecisionFieldsExactlyEqualLedgerFields': exact_runtime_fields, 'ledgerWholeObjectEqualsRuntimeHeader': row == decision, 'ledgerExtraFieldNames': sorted(set(row) - set(decision)), 'runtimeRationaleExactSubstringOfLedgerRationale': decision['rationale'] in row['rationale'], 'runtimeCanonicalGoalIds': decision['canonicalGoalIds'], 'ledgerCanonicalGoalIds': row['canonicalGoalIds'], 'runtimeSourceSpan': decision['sourceSpan'], 'ledgerSourceSpan': row['sourceSpan'], 'preservationShape': 'six-exact-runtime-fields-plus-review-metadata' if exact_runtime_fields else 'existing-cumulative-SH-decision-with-C7-contribution', 'noWholeSourceCreditOrNewDecisionInferred': True})
    assert old['decisions'] == item['removedFullBeforeBlocks']['decisions']
    checks.append({'path': path, 'beforeNormalPin': before_pin, 'afterNormalPin': after_pin, 'oldRawBytesReconstructedExactlyFromRetainedBytesAndRemovedBlocks': True, 'originalHeaderFieldOrderUniquelyRecoveredByBeforeRawSHA256': True, 'onlyRemovedFields': ['decisions', meta], 'allOtherFieldRawBytesExact': True, 'entireMappingsArrayRawSHA256': sha(mappings_raw), 'mappingEntryCount': len(new['mappings']), 'allMappingEntryBytesExact': True, 'actualDecisionLedgerComparisons': comparisons, 'wholeRemovedC7MetadataObjectExactlyPresentInUnchangedReviewLedger': True, 'unchangedReviewLedger': ledger_pin})
assert len(checks) == 6
assert sum(c['mappingEntryCount'] for c in checks) == 4549
result = {'role': 'ACTUAL_BOUNDED_READ_ONLY_SIX_HEADER_DIFF_CHECK_NOT_SCIENCE_REVIEW', 'peerSeal': pin(peer_seal), 'peerFullBeforeBlockReceipt': pin(receipt_path), 'baseInputPins': pin(base / 'INPUTS.actual-normal-production-and-read-pins.json'), 'records': checks, 'mappingEntriesBytePreserved': 4549, 'normalWrites': 0, 'rawCopies': 0, 'newScientificOrNativeVotes': 0}
target = out / 'INPUT.actual-six-bounded-header-diffs.json'
assert not target.exists()
target.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'status': 'PASS', 'sixWholeBeforeRawHashesReconstructedExactly': 6, 'allOtherRawFieldsAnd4549MappingEntriesExact': True, 'sixC7MetadataObjectsExactInActualReviewLedgers': True, 'fiveRuntimeDecisionFieldSetsExactPlusReviewMetadata': 5, 'SHExistingCumulativeDecisionContainsC7Contribution': True, 'wholeDecisionObjectIdentityNotClaimed': True, 'normalWrites': 0}, indent=2))
