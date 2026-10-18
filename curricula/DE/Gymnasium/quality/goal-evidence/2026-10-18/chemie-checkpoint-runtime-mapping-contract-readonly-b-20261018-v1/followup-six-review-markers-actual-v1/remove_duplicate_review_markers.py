#!/usr/bin/env python3
"""Remove only six authorized misplaced review markers and duplicate C7 blocks."""
import datetime
import hashlib
import json
import pathlib
import re
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[8]
OUT = pathlib.Path(__file__).resolve().parent
META = 'c7QuantitativeDataPartialIntegration'


def sha(value):
    return hashlib.sha256(value).hexdigest()


def fields(text):
    decoder = json.JSONDecoder()
    offset = text.index('{') + 1
    result = []
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


plans = []
for path in sorted((ROOT / 'curricula/DE/Gymnasium/mapping').rglob('*_to_canonical_chemistry.json')):
    before = path.read_bytes()
    text = before.decode()
    document = json.loads(text)
    if 'decisions' not in document:
        continue
    relative = str(path.relative_to(ROOT))
    old = json.loads(subprocess.check_output(['git', 'show', 'HEAD:' + relative], cwd=ROOT))
    assert 'decisions' not in old and META not in old
    assert len(document['decisions']) == 1 and META in document
    review_path = path.with_name(path.name.replace('_to_canonical_chemistry.json', '_source_extraction_to_canonical_chemistry.review.json'))
    review_before = review_path.read_bytes()
    review = json.loads(review_before)
    assert document[META] == review[META]
    source_id = document['decisions'][0]['sourceGoalId']
    assert any(v.get('sourceGoalId') == source_id for v in review['decisions'])
    spans = fields(text)
    separator = text[spans[0]['end']:spans[1]['start']]
    assert all(text[a['end']:b['start']] == separator for a, b in zip(spans, spans[1:]))
    kept = [v for v in spans if v['key'] not in ['decisions', META]]
    after_text = text[:spans[0]['start']] + separator.join(text[v['start']:v['end']] for v in kept) + text[spans[-1]['end']:]
    after = after_text.encode()
    assert json.loads(after_text) == {k: v for k, v in document.items() if k not in ['decisions', META]}
    after_spans = fields(after_text)
    for v in kept:
        match = next(x for x in after_spans if x['key'] == v['key'])
        assert text[v['start']:v['end']] == after_text[match['start']:match['end']]
    mapping_span = next(v for v in spans if v['key'] == 'mappings')
    raw_mappings = text[mapping_span['valueStart']:mapping_span['end']].encode()
    plans.append({'path': path, 'before': before, 'after': after, 'reviewPath': review_path, 'reviewBefore': review_before, 'mappingRows': len(document['mappings']), 'rawMappingsSha256': sha(raw_mappings), 'removedFullBeforeBlocks': {k: document[k] for k in ['decisions', META]}, 'removedRawFieldBlocks': [{'key': v['key'], 'raw': text[v['start']:v['end']]} for v in spans if v['key'] in ['decisions', META]], 'retainedOtherMetadataKeys': [v['key'] for v in kept if v['key'] not in ['version', 'sourceLandscapeId', 'targetLandscapeId', 'mappings']]})
assert len(plans) == 6
expected = {('DE-SN', 'lower-secondary'), ('DE-RP', 'lower-secondary'), ('DE-MV', 'lower-secondary'), ('DE-TH', 'lower-secondary'), ('DE-SH', 'lower-secondary'), ('DE-ST', 'upper-secondary')}
assert {(p['path'].parts[-3], p['path'].parts[-2]) for p in plans} == expected
started = datetime.datetime.now(datetime.timezone.utc).isoformat()
for item in plans:
    assert item['path'].read_bytes() == item['before']
    assert item['reviewPath'].read_bytes() == item['reviewBefore']
for item in plans:
    item['path'].write_bytes(item['after'])
checks = []
for item in plans:
    assert item['path'].read_bytes() == item['after']
    assert item['reviewPath'].read_bytes() == item['reviewBefore']
    checks.append({'runtimePath': str(item['path'].relative_to(ROOT)), 'beforeSha256': sha(item['before']), 'afterSha256': sha(item['after']), 'beforeBytes': len(item['before']), 'afterBytes': len(item['after']), 'mappingRows': item['mappingRows'], 'entireMappingsArrayRawSha256': item['rawMappingsSha256'], 'entireMappingsArrayAndAllEntryBytesUnchanged': True, 'retainedOtherMetadataKeys': item['retainedOtherMetadataKeys'], 'otherRetainedFieldRawBytesUnchanged': True, 'reviewLedger': {'path': str(item['reviewPath'].relative_to(ROOT)), 'sha256': sha(item['reviewBefore']), 'bytes': len(item['reviewBefore']), 'unchanged': True}, 'removedFullBeforeBlocks': item['removedFullBeforeBlocks'], 'removedRawFieldBlocks': item['removedRawFieldBlocks']})
record = {'role': 'authorized six identical C7 runtime-carrier marker fixes; no mapping-edge or review-ledger changes', 'reviewerId': '/root/chemie_final_native_round_b_20261018', 'startedAt': started, 'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'normalRuntimeFilesWritten': len(checks), 'mappingRowsPreserved': sum(v['mappingRows'] for v in checks), 'runtimeCodeChanged': False, 'testAssertionsChanged': False, 'newScienceVote': False, 'checks': checks}
(OUT / 'MARKERS6.full-before-blocks-and-byte-checks.receipt.json').write_text(json.dumps(record, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({k: record[k] for k in ['normalRuntimeFilesWritten', 'mappingRowsPreserved', 'runtimeCodeChanged', 'testAssertionsChanged']}, indent=2))
