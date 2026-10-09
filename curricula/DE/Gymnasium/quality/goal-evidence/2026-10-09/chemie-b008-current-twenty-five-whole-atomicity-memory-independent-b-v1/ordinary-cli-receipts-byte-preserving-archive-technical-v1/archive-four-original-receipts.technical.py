"""Authorized own-receipt relocation only; no review or validator rerun."""
import datetime
import hashlib
import json
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-b008-current-twenty-five-whole-atomicity-memory-independent-b-v1'
OWN = BASE / 'ordinary-cli-receipts-byte-preserving-archive-technical-v1'
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()
NAMES = ['A25', 'M25', 'A26-reuse', 'M26-reuse']


def relative(p):
    return str(p.relative_to(ROOT))


def binding(p):
    raw = p.read_bytes()
    return {'path': relative(p), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}


def save(name, value):
    with (OWN / name).open('x') as f:
        f.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return binding(OWN / name)


def references(value):
    found = []
    if isinstance(value, dict):
        if isinstance(value.get('path'), str) and 'sha256' in value and 'bytes' in value:
            found.append(value)
        for v in value.values():
            found += references(v)
    elif isinstance(value, list):
        for v in value:
            found += references(v)
    return found


old_entry_path = BASE / 'completed-twenty-five-whole-A-M.independent-b.review.entry.json'
old_entry = json.loads(old_entry_path.read_text())
protected = {}
for p in BASE.glob('*.json'):
    if p.name.endswith('.actual.receipt.json') and p.stem.split('.')[0] in NAMES:
        continue
    protected[relative(p)] = binding(p)
for p in BASE.glob('*.jsonl'):
    protected[relative(p)] = binding(p)
for p in (BASE / 'technical-ab-pairing-v1').glob('*freeze.json'):
    protected[relative(p)] = binding(p)

inputs = []
for n in NAMES:
    old = BASE / (n + '.ordinary-existing-CLI.actual.receipt.json')
    raw_target = BASE / (n + '.ordinary-existing-CLI.actual.receipt.raw.txt')
    json_target = OWN / (n + '.ordinary-existing-CLI.actual.payload-only.receipt.json')
    if raw_target.exists() or json_target.exists():
        raise RuntimeError('Refuse overwrite: ' + str(raw_target))
    raw = old.read_bytes()
    if not raw.endswith(b'\\n'):
        raise RuntimeError('Unexpected terminator: ' + str(old))
    try:
        json.loads(raw)
    except json.JSONDecodeError as error:
        parse_error = str(error)
    else:
        raise RuntimeError('Expected documented invalid original JSON')
    payload = json.loads(raw[:-2])
    if not isinstance(payload, dict) or not {'command', 'exitCode', 'stdout', 'stderr', 'checkedAtUTC'}.issubset(payload):
        raise RuntimeError('Unexpected original payload')
    inputs.append({'name': n, 'old': old, 'rawTarget': raw_target, 'jsonTarget': json_target,
                   'oldBinding': binding(old), 'raw': raw, 'payload': payload, 'parseError': parse_error})

before_first = save('four-receipts.format-relocation.actual-input.first.freeze.json', {
    'schemaVersion': 1, 'role': 'technical_input_first_before_authorized_own_receipt_relocation', 'createdAt': NOW,
    'originalLocationsAtInputTimeOnly': [{'historicalOldPath': i['oldBinding']['path'], 'oldSha256': i['oldBinding']['sha256'],
       'originalBytes': i['oldBinding']['bytes'], 'originalParseError': i['parseError'], 'originalTerminatorHex': '5c6e'} for i in inputs],
    'protectedHistoricalArtifacts': list(protected.values()), 'ordinaryCurrentReadersFound': [],
    'readerSearchScope': ['curricula/DE/Gymnasium/quality', 'app', 'scripts', 'contracts'],
    'onlyOldPathReferrersFound': ['unchanged B actual-final.freeze', 'unchanged technical A/B input-FIRST', 'unchanged existing valid-json successors'],
    'newScientificReview': False, 'newValidatorRun': False, 'humanApproval': False, 'strictGain': 0,
})

relocations, receipt_bindings, checks = [], [], []
normal_references = []
for item in inputs:
    item['old'].rename(item['rawTarget'])
    raw_after = item['rawTarget'].read_bytes()
    # The new valid JSON is the exact original prefix, with only literal \\n
    # removed. No value, internal whitespace, output, timestamp or exit changes.
    with item['jsonTarget'].open('xb') as f:
        f.write(raw_after[:-2])
    derived = json.loads(item['jsonTarget'].read_bytes())
    round_trip = json.loads(json.dumps(derived, ensure_ascii=False))
    assert raw_after == item['raw']
    assert derived == item['payload'] == round_trip
    assert not item['old'].exists()
    assert item['jsonTarget'].read_bytes() + b'\\n' == raw_after
    raw_binding = binding(item['rawTarget'])
    derived_binding = binding(item['jsonTarget'])
    existing_valid = binding(BASE / (item['name'] + '.ordinary-existing-CLI.actual.valid-json.receipt.json'))
    relocations.append({'receipt': item['name'], 'historicalOldPath': item['oldBinding']['path'],
        'historicalOldSha256': item['oldBinding']['sha256'], 'historicalOldBytes': item['oldBinding']['bytes'],
        'oldPathClassification': 'historical former location; not a current file binding',
        'actualCurrentRawArchive': raw_binding, 'newRawPath': raw_binding['path'],
        'identicalSha256': raw_binding['sha256'], 'rawBytesUnmodified': True,
        'derivedPayloadOnlyJson': derived_binding, 'removedTerminatorHexOnly': '5c6e',
        'preservedExistingValidJsonSuccessor': existing_valid,
        'existingSuccessorRawReceiptBindingClassification': 'Its preserved oldPath refers to the historical original location; resolve the exact archived bytes using this relocation manifest, not a hash replacement.'})
    receipt_bindings.append({'receipt': item['name'], 'actualRawArchive': raw_binding, 'actualPayloadOnlyJSON': derived_binding,
        'actualHistoricalExitCodeUnchanged': derived['exitCode'], 'actualHistoricalUTCUnchanged': derived['checkedAtUTC'],
        'historicalCLIReplayOrNewPassClaimed': False})
    checks.append({'receipt': item['name'], 'rawSha256Identical': raw_binding['sha256'] == item['oldBinding']['sha256'],
        'wholeNewJSONParses': True, 'wholeJSONRoundTripValueExact': True, 'wholePayloadValueExact': True,
        'exactTwoTerminatorBytesRemovedOnly': True, 'oldMalformedJSONLocationAbsent': True})
    config_arg = next(a for a in derived['command'] if isinstance(a, str) and a.startswith('--config='))
    config_path = ROOT / config_arg.split('=', 1)[1]
    config = json.loads(config_path.read_text())
    record_path = ROOT / config['reviewPath']
    records = [json.loads(line) for line in record_path.read_text().splitlines() if line.strip()]
    normal_references.append({'receipt': item['name'], 'actualOriginalCommandConfig': binding(config_path),
        'actualOriginalRecords': binding(record_path), 'actualOriginalScienceInputLandscape': binding(ROOT / config['landscapePath']),
        'actualOriginalRuleVersion': config['ruleVersion'], 'actualOriginalRecordCount': len(records),
        'exactRecordedGoalFingerprintReferences': [{'goalId': r['goalId'], 'fingerprint': r['fingerprint']} for r in records],
        'fingerprintsRecomputedOrReplaced': False, 'scientificDecisionsRejudged': False})

for path, original in protected.items():
    assert binding(ROOT / path) == original, 'Protected original mutated: ' + path

manifest = save('four-original-CLI-receipts.byte-preserving-relocation.manifest.json', {
    'schemaVersion': 1, 'role': 'actual_old_path_to_identical_raw_archive_relocation_manifest', 'createdAt': NOW,
    'inputFirst': before_first, 'relocations': relocations,
    'allProtectedHistoricalArtifactsByteExact': True,
    'historicalSealOldPathsRemainUnchanged': True, 'oldPathNamesAreNotCurrentBindings': True,
    'newScientificReview': False, 'newCurrentApproval': False, 'validatorCodeChanges': False,
    'activeCanonicalQARegistryWrites': False, 'humanApproval': False, 'strictGain': 0,
})
validation = save('four-new-payload-JSON-and-raw-SHA.round-trip.actual.receipt.json', {
    'schemaVersion': 1, 'role': 'actual_json_round_trip_and_raw_archive_byte_verification', 'createdAt': NOW,
    'actualChecks': checks, 'errors': [], 'actualReceiptBindings': receipt_bindings,
    'protectedArtifactsVerifiedUnchanged': list(protected.values()),
    'sameHistoricalExitCodes': [r['actualHistoricalExitCodeUnchanged'] for r in receipt_bindings],
    'ordinaryReviewCLIReexecuted': False, 'wholeRepositorySchemaRunClaimed': False,
    'humanApproval': False, 'strictGain': 0,
})
handoff = save('completed-four-CLI-receipts-byte-preserving-archive.technical.entry.json', {
    'schemaVersion': 1, 'role': 'neutral_current_operational_technical_receipt_handoff', 'createdAt': NOW,
    'actualInputFirst': before_first, 'actualRelocationManifest': manifest, 'actualRoundTripReceipt': validation,
    'actualCurrentRawAndPayloadReceiptBindings': receipt_bindings,
    'exactHistoricalWholeScienceInputsRecordsAndFingerprints': normal_references,
    'exactHistoricalScientificEntryAndFirstBindings': {
        k: v for k, v in old_entry.items() if k in ['actualFirstVerdict', 'actualFirstSeal', 'actualInputFirstSeal', 'actualFinalNormalBindingsSeal']},
    'unchangedEarlierWholeOperationalHandoff': binding(old_entry_path),
    'unchangedSubsequentMemory80SuccessReceipt': binding(BASE / 'M80-whole-existing-card-trace.ordinary-existing-CLI.actual.receipt.json'),
    'ordinaryOldReceiptReadersFound': [],
    'actualReaderSearchLimits': 'Literal path search in quality/, app/, scripts/, contracts/ found only historical seals and old-location fields of preserved valid-json successors; this is not a claim about every conceivable external consumer.',
    'historicalOldPaths': [{'historicalOldPath': r['historicalOldPath'], 'classification': r['oldPathClassification']} for r in relocations],
    'historicalAMFailuresRemainFailures': 'M25 and M26 original exitCode1 remains1; serialization/relocation does not change an old review result or create a new pass. Existing later M80 receipt is referenced unchanged.',
    'wholeGoalScientificReviewRepeated': False, 'wholeReviewRecordOrFingerprintBytesReplaced': False,
    'humanApproval': False, 'humanTrial': False, 'strictGain': 0, 'newScientificClosures': 0, 'restoredBindings': 0,
    'activeCanonicalQARegistryWrites': False,
})
final = save('four-CLI-receipts-byte-preserving-archive.technical.final.freeze.json', {
    'schemaVersion': 1, 'role': 'immutable_actual_technical_archive_successor_seal', 'createdAt': NOW,
    'actualOwnOutputs': [binding(Path(__file__)), before_first, manifest, validation, handoff] +
        [r['actualRawArchive'] for r in receipt_bindings] + [r['actualPayloadOnlyJSON'] for r in receipt_bindings],
    'protectedOriginalArtifacts': list(protected.values()),
    'newScientificReview': False, 'humanApproval': False, 'strictGain': 0,
})
print(json.dumps({'entry': handoff, 'manifest': manifest, 'finalSeal': final, 'roundTripErrors': 0}, ensure_ascii=False))
