#!/usr/bin/env python3
"""Verify the proposed bounded runtime carrier removal; never mutate normal files."""
import collections
import datetime
import hashlib
import json
import pathlib
import re
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[7]
OUT = pathlib.Path(__file__).resolve().parent
INPUT = OUT / 'bound-conflict52.input.json'


def sha(value):
    return hashlib.sha256(value).hexdigest()


def semantic_sha(value):
    return sha(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode())


def pin(path):
    value = (ROOT / path).read_bytes()
    return {'path': path, 'sha256': sha(value), 'bytes': len(value)}


def pointer(value, path):
    for part in path.lstrip('/').split('/'):
        part = part.replace('~1', '/').replace('~0', '~')
        value = value[int(part)] if isinstance(value, list) else value[part]
    return value


def raw_mapping_entry(text, expected):
    start = re.search(r'"mappings"\s*:\s*\[', text).end()
    decoder = json.JSONDecoder()
    while start < len(text):
        while text[start].isspace() or text[start] == ',':
            start += 1
        if text[start] == ']':
            return None
        value, end = decoder.raw_decode(text, start)
        if value == expected:
            return text[start:end].encode()
        start = end
    return None


groups = json.loads(INPUT.read_text())
runtime = {}
head = {}
review_cache = {}
scientific_cache = {}
results = []
exact_results = []
for source_id, entries in groups.items():
    exact_entries = [v for v in entries if v['entry'].get('matchType') == 'exact']
    for entry in entries:
        path = entry['path']
        if path not in runtime:
            runtime[path] = json.loads((ROOT / path).read_text())
            head[path] = json.loads(subprocess.check_output(['git', 'show', 'HEAD:' + path], cwd=ROOT))
    for exact in exact_entries:
        head_text = subprocess.check_output(['git', 'show', 'HEAD:' + exact['path']], cwd=ROOT, text=True)
        head_raw = raw_mapping_entry(head_text, exact['entry'])
        current_raw = raw_mapping_entry((ROOT / exact['path']).read_text(), exact['entry'])
        exact_results.append({'sourceGoalId': source_id, 'runtimePath': exact['path'], 'entry': exact['entry'], 'headObjectIdentical': exact['entry'] in head[exact['path']]['mappings'], 'currentObjectIdentical': exact['entry'] in runtime[exact['path']]['mappings'], 'headEntryRawSha256': sha(head_raw) if head_raw else None, 'currentEntryRawSha256': sha(current_raw) if current_raw else None, 'rawEntryBytesIdentical': head_raw is not None and head_raw == current_raw})
    for item in entries:
        edge = item['entry']
        if edge.get('matchType') != 'partial':
            continue
        path = item['path']
        target_id = edge['canonicalGoalId']
        carriers = []
        for review_path in (ROOT / path).parent.glob('*.review.json'):
            relative = str(review_path.relative_to(ROOT))
            if relative not in review_cache:
                review_cache[relative] = json.loads(review_path.read_text())
            review = review_cache[relative]
            if any(review.get(k) != runtime[path].get(k) for k in ['sourceLandscapeId', 'targetLandscapeId']):
                continue
            mappings = [(i, v) for i, v in enumerate(review.get('mappings', [])) if v == edge]
            decisions = [(i, v) for i, v in enumerate(review.get('decisions', [])) if v.get('sourceGoalId') == source_id and v.get('decision') == 'mapped' and target_id in v.get('canonicalGoalIds', [])]
            if not mappings or not decisions:
                continue
            extraction_path = review.get('sourceExtractionPath')
            extraction = json.loads((ROOT / extraction_path).read_text()) if extraction_path and (ROOT / extraction_path).is_file() else {}
            source_goals = [v for v in extraction.get('sourceGoals', []) if v.get('id') == source_id]
            contributions = []
            for decision_i, decision in decisions:
                for contribution_i, contribution in enumerate(decision.get('additionalAcceptedPartialContributions', [])):
                    if contribution.get('canonicalGoalId') != target_id or contribution.get('matchType') != 'partial':
                        continue
                    ref = contribution.get('acceptedScientificRef') or contribution.get('independentAcceptedRef') or {}
                    ref_path = ref.get('path', '')
                    record = None
                    ref_valid = False
                    if ref_path and (ROOT / ref_path).is_file():
                        if ref_path not in scientific_cache:
                            value = (ROOT / ref_path).read_bytes()
                            scientific_cache[ref_path] = (value, json.loads(value))
                        value, document = scientific_cache[ref_path]
                        ref_valid = sha(value) == str(ref.get('sha256', '')).removeprefix('sha256:') and (ref.get('bytes') is None or len(value) == ref.get('bytes'))
                        try:
                            record = pointer(document, ref.get('jsonPointer', ''))
                        except (KeyError, IndexError, TypeError, ValueError):
                            record = None
                    contributions.append({'jsonPointer': f'/decisions/{decision_i}/additionalAcceptedPartialContributions/{contribution_i}', 'wholeContributionSha256': semantic_sha(contribution), 'acceptedScientificRef': ref, 'acceptedRefDigestAndBytesValid': ref_valid, 'acceptedPointerBindsSamePartialEdge': isinstance(record, dict) and (record.get('sourceGoalId') or record.get('legacyGoalId')) == source_id and (record.get('canonicalGoalId') or record.get('goalId')) == target_id and record.get('matchType') == 'partial', 'rationalePresent': bool(contribution.get('rationale')), 'rationaleMatchesScientificRecordWhenPresent': (contribution.get('rationale') == record.get('rationale')) if isinstance(record, dict) and record.get('rationale') else None, 'wholeSourceCompletionFromSingleGoalMasteryAllowed': contribution.get('wholeSourceCompletionFromSingleGoalMasteryAllowed'), 'acceptedSourceScopeSha256': semantic_sha(record.get('source')) if isinstance(record, dict) and record.get('source') else None})
            carriers.append({'reviewFile': pin(relative), 'sourceExtractionFile': pin(extraction_path) if extraction_path and (ROOT / extraction_path).is_file() else None, 'sourceGoalPresent': len(source_goals) == 1, 'sourceGoalWholeSha256': semantic_sha(source_goals[0]) if len(source_goals) == 1 else None, 'mappingPointers': [f'/mappings/{i}' for i, _ in mappings], 'decisionPointers': [f'/decisions/{i}' for i, _ in decisions], 'wholeDecisionSha256': [semantic_sha(v) for _, v in decisions], 'decisionRationalePresent': all(bool(v.get('rationale')) for _, v in decisions), 'contributions': contributions})
        valid_carriers = [v for v in carriers if v['sourceGoalPresent'] and v['decisionRationalePresent']]
        results.append({'sourceGoalId': source_id, 'targetGoalId': target_id, 'runtimePath': path, 'runtimeEntry': edge, 'runtimeEntryNewAgainstHEAD': edge not in head[path]['mappings'], 'runtimeEntryCurrentlyPresent': edge in runtime[path]['mappings'], 'reviewCarriers': carriers, 'hasCompleteCurrentReviewCarrier': bool(valid_carriers), 'hasDirectEdgeSpecificAcceptedReference': any(c['acceptedRefDigestAndBytesValid'] and c['acceptedPointerBindsSamePartialEdge'] for v in carriers for c in v['contributions'])})

removals = collections.defaultdict(list)
for item in results:
    removals[item['runtimePath']].append(item['runtimeEntry'])
proposed = {}
for path, document in runtime.items():
    proposed[path] = {**document, 'mappings': [v for v in document['mappings'] if v not in removals[path]]}

simulation = collections.defaultdict(list)
for path in sorted((ROOT / 'curricula/DE/Gymnasium/mapping').rglob('*.json')):
    if path.name.endswith('.review.json'):
        continue
    relative = str(path.relative_to(ROOT))
    document = proposed.get(relative) or json.loads(path.read_text())
    if any(k in document for k in ['reviewId', 'sourceExtractionPath', 'decisions']):
        continue
    if not all(k in document for k in ['version', 'sourceLandscapeId', 'targetLandscapeId', 'mappings']):
        continue
    for item in document['mappings']:
        resolved = (document['sourceLandscapeId'], document['targetLandscapeId'], item['canonicalGoalId'], item['matchType'], relative)
        if resolved not in simulation[item['legacyGoalId']]:
            simulation[item['legacyGoalId']].append(resolved)
remaining = {key: value for key, value in simulation.items() if len(value) > 1 and any(v[3] == 'exact' for v in value)}

summary = {
    'observedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'reviewerId': '/root/chemie_final_native_round_b_20261018',
    'role': 'independent technical read-only check of bounded CI fix proposal; no new science vote',
    'input': pin(str(INPUT.relative_to(ROOT))),
    'head': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip(),
    'conflictGroups': len(groups), 'runtimeFiles': len(runtime), 'newPartialRowsToRemove': len(results),
    'eachGroupExactlyOneExact': all(sum(v['entry'].get('matchType') == 'exact' for v in entries) == 1 for entries in groups.values()),
    'all52ExactEntriesUnchangedAgainstHEAD': all(v['headObjectIdentical'] and v['currentObjectIdentical'] for v in exact_results),
    'all52ExactEntryRawBytesIdenticalAgainstHEAD': all(v['rawEntryBytesIdentical'] for v in exact_results),
    'all61PartialRowsNewAgainstHEAD': all(v['runtimeEntryNewAgainstHEAD'] for v in results),
    'all61PartialRowsHaveCompleteCurrentReviewCarrier': all(v['hasCompleteCurrentReviewCarrier'] for v in results),
    'directEdgeSpecificAcceptedReferenceCount': sum(v['hasDirectEdgeSpecificAcceptedReference'] for v in results),
    'exceptions': [v for v in results if not v['hasCompleteCurrentReviewCarrier']],
    'proposedRuntimeMappingCounts': [{'path': path, 'before': len(runtime[path]['mappings']), 'after': len(proposed[path]['mappings']), 'removedOnlyBoundPartialRows': len(removals[path]), 'beforeFile': pin(path), 'proposedSemanticSha256': semantic_sha(proposed[path])} for path in sorted(runtime)],
    'remainingExactConflictGroupsInGymnasiumRuntimeDryRun': len(remaining),
    'remainingExactConflicts': remaining,
    'normalWrites': False, 'newScienceVote': False, 'testsRun': [],
    'limits': ['This is a structural/pin check of the bound proposal, not a new science review.', 'The required current-carrier check verifies full identical review mapping row, mapped decision, rationale and source-extraction binding for all 61 edges. Optional direct accepted refs are recorded when present; whole-decision/top-level historical science acceptance is not re-adjudicated.', 'No Java runtime or full build was executed by this reviewer.', 'Repository compatibility runtime partial edges also serve navigation/state fallback. Their removal is not a universal no-behavior-change claim.', 'Preserve every review ledger byte and source scope. Keep all established exact rows; do not relabel exact to partial.']
}
for name, value in [('edge-by-edge-pinned-review-carriers.actual.json', results), ('exact52-preservation.actual.json', exact_results), ('proposal-check.actual.json', summary)]:
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({k: summary[k] for k in ['conflictGroups', 'runtimeFiles', 'newPartialRowsToRemove', 'eachGroupExactlyOneExact', 'all52ExactEntriesUnchangedAgainstHEAD', 'all52ExactEntryRawBytesIdenticalAgainstHEAD', 'all61PartialRowsNewAgainstHEAD', 'all61PartialRowsHaveCompleteCurrentReviewCarrier', 'directEdgeSpecificAcceptedReferenceCount', 'remainingExactConflictGroupsInGymnasiumRuntimeDryRun']}, indent=2))
