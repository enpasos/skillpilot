#!/usr/bin/env python3
"""Authorized bounded install; byte-preserve all retained JSON mapping entries."""
import collections
import datetime
import hashlib
import json
import pathlib
import re
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[8]
OUT = pathlib.Path(__file__).resolve().parent
BOUND = OUT.parent


def sha(value):
    return hashlib.sha256(value).hexdigest()


def mapping_spans(text):
    start = re.search(r'"mappings"\s*:\s*\[', text).end()
    decoder = json.JSONDecoder()
    spans = []
    while start < len(text):
        while text[start].isspace() or text[start] == ',':
            start += 1
        if text[start] == ']':
            return spans
        value, end = decoder.raw_decode(text, start)
        spans.append((start, end, value))
        start = end
    raise ValueError('Unterminated mappings array')


proposal = json.loads((BOUND / 'proposal-check.actual.json').read_text())
edges = json.loads((BOUND / 'edge-by-edge-pinned-review-carriers.actual.json').read_text())
exact = json.loads((BOUND / 'exact52-preservation.actual.json').read_text())
pins = json.loads((BOUND / 'bound-contract-and-carrier-files.actual.json').read_text())['files']
assert len(edges) == 61 and len(exact) == 52
removals = collections.defaultdict(list)
for edge in edges:
    assert edge['runtimeEntry']['matchType'] == 'partial'
    removals[edge['runtimePath']].append(edge['runtimeEntry'])
assert len(removals) == 18

# Validate every precondition before the first normal write.
for item in pins:
    value = (ROOT / item['path']).read_bytes()
    assert sha(value) == item['sha256'] and len(value) == item['bytes'], item['path']
plans = []
for item in proposal['proposedRuntimeMappingCounts']:
    path = item['path']
    before = (ROOT / path).read_bytes()
    assert sha(before) == item['beforeFile']['sha256'], path
    text = before.decode()
    spans = mapping_spans(text)
    removed = [span for span in spans if span[2] in removals[path]]
    kept = [span for span in spans if span[2] not in removals[path]]
    assert len(removed) == len(removals[path]) and kept, path
    assert len({json.dumps(v[2], sort_keys=True) for v in removed}) == len(removed)
    # Reuse entry bodies and the existing separator, including all indentation.
    separator = text[spans[0][1]:spans[1][0]] if len(spans) > 1 else ',\n    '
    assert all(text[a[1]:b[0]] == separator for a, b in zip(spans, spans[1:])), path
    after_text = text[:spans[0][0]] + separator.join(text[a:b] for a, b, _ in kept) + text[spans[-1][1]:]
    after = after_text.encode()
    before_document = json.loads(text)
    after_document = json.loads(after_text)
    assert after_document == {**before_document, 'mappings': [v for v in before_document['mappings'] if v not in removals[path]]}
    assert [text[a:b] for a, b, _ in kept] == [after_text[a:b] for a, b, _ in mapping_spans(after_text)]
    semantic = sha(json.dumps(after_document, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode())
    assert semantic == item['proposedSemanticSha256'], path
    plans.append((path, before, after, len(removed), len(kept)))

started = datetime.datetime.now(datetime.timezone.utc).isoformat()
for path, before, after, _, _ in plans:
    assert (ROOT / path).read_bytes() == before, path
    (ROOT / path).write_bytes(after)

file_checks = []
for path, before, after, removed_count, kept_count in plans:
    current = (ROOT / path).read_bytes()
    assert current == after, path
    file_checks.append({'path': path, 'beforeSha256': sha(before), 'beforeBytes': len(before), 'afterSha256': sha(after), 'afterBytes': len(after), 'removedBoundPartialRows': removed_count, 'retainedMappingRows': kept_count, 'everyRetainedEntryRawBytesUnchanged': True})
exact_checks = []
for item in exact:
    text = (ROOT / item['runtimePath']).read_text()
    matches = [text[a:b].encode() for a, b, value in mapping_spans(text) if value == item['entry']]
    assert len(matches) == 1 and sha(matches[0]) == item['headEntryRawSha256'], item['sourceGoalId']
    exact_checks.append({'sourceGoalId': item['sourceGoalId'], 'runtimePath': item['runtimePath'], 'rawEntrySha256': sha(matches[0]), 'identicalToHEADAndOwnBeforeSeal': True})
preserved = []
for item in pins:
    value = (ROOT / item['path']).read_bytes()
    assert sha(value) == item['sha256'] and len(value) == item['bytes'], item['path']
    preserved.append({**item, 'unchangedAfterIntegration': True})

report = {'role': 'authorized bounded integration of independent technical mapping proposal; no new science vote', 'reviewerId': '/root/chemie_final_native_round_b_20261018', 'startedAt': started, 'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'head': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip(), 'normalRuntimeFilesWritten': len(plans), 'removedOnlyBoundPartialRows': sum(v[3] for v in plans), 'all52ExactEntryRawBytesPreserved': len(exact_checks) == 52, 'reviewCarrierFilesPreserved': sum(item['path'].endswith('.review.json') for item in preserved), 'allBoundReviewSourceAndContractFilesPreserved': True, 'runtimeCodeChangedByThisIntegration': False, 'newScienceVote': False, 'commitCreated': False, 'runtimeFileChecks': file_checks, 'exact52RawByteChecks': exact_checks, 'preservedReviewSourceAndContractFiles': preserved}
(OUT / 'INTEGRATION61.actual-byte-checks.receipt.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({k: report[k] for k in ['normalRuntimeFilesWritten', 'removedOnlyBoundPartialRows', 'all52ExactEntryRawBytesPreserved', 'reviewCarrierFilesPreserved', 'allBoundReviewSourceAndContractFilesPreserved']}, indent=2))
