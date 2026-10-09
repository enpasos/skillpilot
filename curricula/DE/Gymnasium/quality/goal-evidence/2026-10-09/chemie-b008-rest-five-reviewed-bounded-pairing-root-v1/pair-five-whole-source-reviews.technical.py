#!/usr/bin/env python3
"""Bind existing independent scientific FIRSTs without promoting partial duties."""
# SPDX-License-Identifier: Apache-2.0
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09')
A = BASE / 'chemie-b008-rest-five-content-source-author-a-v1'
B = BASE / 'chemie-b008-rest-five-content-source-independent-b-v1'
C = BASE / 'chemie-b008-rest-five-whole-source-independent-c-v1'


def binding(path):
    path = Path(path)
    data = (ROOT / path).read_bytes()
    return {'path': str(path), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def read(path):
    return json.loads((ROOT / path).read_text())


def write(name, data):
    path = OUT / name
    assert not path.exists(), f'Preserve existing receipt: {path}'
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    assert json.loads(path.read_text()) == data
    return binding(path.relative_to(ROOT))


def bindings(value):
    if isinstance(value, dict):
        if all(k in value for k in ('path', 'sha256', 'bytes')):
            yield value
        for item in value.values():
            yield from bindings(item)
    elif isinstance(value, list):
        for item in value:
            yield from bindings(item)


def main():
    author_path = A / 'neutral-five-remaining-whole-content-source-and-honest-transfer.author-review.entry.json'
    b_path = B / 'five-remaining-whole-content-source.independent-b.scientific-first.verdict.json'
    c_path = C / 'five-whole-source-and-mechanism.independent-c.scientific-FIRST.verdict.json'
    input_paths = [author_path, b_path, c_path,
                   B / 'completed-five-remaining-whole-content-source-independent-b.entry.json',
                   B / 'five-remaining-whole-content-source.independent-b.scientific-first.freeze.json',
                   C / 'completed-five-whole-source-independent-c.neutral-integration.entry.json',
                   C / 'five-whole-source-and-mechanism.independent-c.scientific-FIRST.freeze.json',
                   C / 'completed-five-whole-source-independent-c.final.freeze.json']
    input_first = write('five-existing-author-and-independent-FIRSTs.technical-input.freeze.json', {
        'schemaVersion': 1, 'role': 'technical input seal, not another scientific FIRST',
        'inputs': [binding(p) for p in input_paths], 'newScientificReviewClaimed': False,
    })
    author, rb, rc = map(read, (author_path, b_path, c_path))
    verified = {}
    for p in input_paths:
        for expected in bindings(read(p)):
            actual = binding(expected['path'])
            assert actual['sha256'] == expected['sha256'].removeprefix('sha256:'), expected['path']
            assert actual['bytes'] == expected['bytes'], expected['path']
            verified[actual['path']] = actual
    assert rb['reviewer']['id'] != rc['reviewer']
    assert rb['independence']['freshPeerScienceReadBeforeFirst'] is False
    assert rc['disclosure']['freshIndependentBChem5OutcomesRead'] is False
    assert rb['independence']['previousCurrentFourReuseClaimed'] is False
    assert rb['inputEntry'] == rc['inputEntry'] == binding(author_path)
    b_goals = {g['goalId']: g for g in rb['goalResults']}
    c_goals = {g['goalId']: g for g in rc['entries']}
    ids = sorted(author['scopeGoalIds'])
    assert len(ids) == 5 and set(ids) == set(b_goals) == set(c_goals)
    assert len(rb['sourceDutyResults']) == len(rc['wholeTenOriginalDutyAssessments']) == 10
    assert rb['actuallyRead']['wholeOriginalEdges'] == 21
    assert rb['actuallyRead']['wholeUniquePartners'] == len(rc['allTwentyNineWholePartnerObjects']) == 29
    for br, cr in zip(rb['sourceDutyResults'], rc['wholeTenOriginalDutyAssessments']):
        assert br['sourceGoalId'] == cr['sourceGoalId']
        assert br['currentNormalSourceApproval'] is False
        assert cr['historicalWholeCoverageRecertified'] is False
        assert cr['sourceClauseOrPartnerDropped'] is False
        assert set(br['partnerGoalIds']) == set(cr['completePartnerIdsRead'])
    proposals = read(A / 'five-proposed-additive-partial-source-edges.author-candidate.json')['edges']
    # The author's edge wrappers retain source locations and exact original partners.
    def edge_value(row):
        return row.get('edgeCandidate', row)
    b_edges = [row['actualProposedEdge'] for row in rb['proposedEdgeResults']]
    assert len(proposals) == len(b_edges) == 5
    for row, actual in zip(proposals, b_edges):
        assert edge_value(row) == actual
        assert actual['matchType'] == 'partial'
    grignard = '8edee6b6-9ead-515e-93f5-feada64522b2'
    assert not any(e['canonicalGoalId'] == grignard for e in b_edges)
    matrix = []
    for goal_id in ids:
        br, cr = b_goals[goal_id], c_goals[goal_id]
        edge_count = sum(e['canonicalGoalId'] == goal_id for e in b_edges)
        assert edge_count == cr['acceptedProposedEdgeCount']
        matrix.append({'goalId': goal_id, 'independentB': br, 'independentC': cr,
                       'acceptedPartialEdgeCount': edge_count,
                       'wholeSourceApproval': False, 'currentPApproval': False,
                       'nativeApproval': False, 'strictClosure': False})
    ignored = subprocess.run(['git', 'check-ignore', '--stdin'], cwd=ROOT,
                             input='\n'.join(verified) + '\n', text=True, capture_output=True, check=False)
    assert ignored.returncode in (0, 1)
    ignored_paths = sorted(ignored.stdout.splitlines())
    # Exactly the independently disclosed primary PDFs are local working caches.
    declared_caches = sorted(p['path'] for p in read(input_paths[5])['localOriginalPrimaryWorkingCacheStatus'])
    assert ignored_paths == declared_caches
    spec = importlib.util.spec_from_file_location('validate_schemas', ROOT / 'scripts/validate_schemas.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    symlink_errors = module.curriculum_symlink_errors(ROOT)
    assert not symlink_errors, symlink_errors
    result = write('five-existing-independent-source-reviews.genuine-bounded-pair.actual.json', {
        'schemaVersion': 1, 'role': 'technical pairing of two whole independent scientific FIRSTs',
        'inputFirst': input_first, 'reviewers': [rb['reviewer']['id'], rc['reviewer']],
        'sameWholeFiveInput': binding(author_path), 'wholeDutyCount': 10,
        'wholeOriginalEdgeCount': 21, 'wholeUniquePartnerCount': 29,
        'actualVerifiedBindingCount': len(verified), 'verifiedBindings': list(verified.values()),
        'localIgnoredPrimaryWorkingCachesOnly': ignored_paths,
        'scientificFirstsRemainUnchanged': True, 'goalResults': matrix,
        'wholeDutyObservations': [{
            'sourceGoalId': br['sourceGoalId'], 'independentB': br['independentWholeDutyPartnerReason'],
            'independentC': cr['independentWholeOperatorObservationEn'],
            'historicalWholeCoverageRecertified': False,
        } for br, cr in zip(rb['sourceDutyResults'], rc['wholeTenOriginalDutyAssessments'])],
        'acceptedAdditivePartialEdgeCandidates': b_edges,
        'unresolvedWholeClaims': rb['concreteFindingsAndRemainingHolds'],
        'requiredNextEvidence': rc['requiredNextEvidence'],
        'normalCurrentSourceOrPApproval': False, 'wholeSource395Approved': False,
        'program9Approved': False, 'currentNativeApproved': False, 'imageApproval': False,
        'humanApproval': False, 'humanTrial': False, 'realLearnerPerformance': False,
        'newScientificReviewClaimed': False, 'newStrictClosures': 0, 'restoredBindings': 0,
        'activeWrites': False, 'globalPortableSymlinkErrors': symlink_errors,
    })
    entry = write('neutral-five-bounded-source-pair.remaining-whole-remediation.entry.json', {
        'schemaVersion': 1, 'role': 'inactive paired five bounded-source candidates; whole remedies required',
        'actualPair': result, 'inputFirst': input_first,
        'scopeGoalIds': ids, 'acceptedBoundedScienceCandidates': 5,
        'acceptedPartialEdgeCandidates': 5, 'grignardSourceCoverageEdges': 0,
        'wholeSourceApproved': False, 'currentPApproved': False, 'nativeApproved': False,
        'newStrictClosures': 0, 'restoredBindings': 0, 'activeWrites': False,
        'humanApproval': False, 'humanTrial': False,
    })
    seal = write('five-bounded-source-pair.technical.final.freeze.json', {
        'schemaVersion': 1, 'inputs': [binding(p) for p in input_paths],
        'outputs': [input_first, result, entry, binding(Path(__file__).relative_to(ROOT))],
        'noHistoricalArtifactRewritten': True,
    })
    print(json.dumps({'entry': entry, 'seal': seal, 'wholeGoals': 5,
                      'boundedPartialEdges': 5, 'newStrictClosures': 0,
                      'globalSymlinkErrors': 0}, ensure_ascii=False))


if __name__ == '__main__':
    main()
