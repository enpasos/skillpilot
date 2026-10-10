# SPDX-License-Identifier: Apache-2.0
import copy
import hashlib
import json
import pathlib
from datetime import datetime, timezone

ROOT = pathlib.Path('/home/enpasos/projects/skillpilot')
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10'
OUT = BASE / 'chemie-b008-source24-dual-bounded-scope-technical-20261010-v1'
AUTHOR = BASE / 'chemie-b008-source24-targeted-parent-split-author-successor-20261010-v1'
A = BASE / 'chemie-b008-source24-current-primary-independent-a-20261010-v1'
B = BASE / 'chemie-b008-source24-current-primary-independent-b-20261010-v1'
HOLD = 'e5a5dcd8-053c-55fd-b5c7-bba93779da53'
bindings = {}


def digest(data):
    return 'sha256:' + hashlib.sha256(data).hexdigest()


def bind(path):
    p = pathlib.Path(path)
    if not p.is_absolute():
        p = ROOT / p
    assert p.is_file() and not p.is_symlink(), p
    data = p.read_bytes()
    row = {'path': str(p.relative_to(ROOT)), 'sha256': digest(data), 'bytes': len(data)}
    previous = bindings.setdefault(row['path'], row)
    assert previous == row
    return row


def verify(row):
    actual = bind(row['path'])
    assert actual['sha256'] == 'sha256:' + row['sha256'].removeprefix('sha256:'), row['path']
    if 'bytes' in row:
        assert actual['bytes'] == row['bytes'], row['path']


def read(path):
    bind(path)
    return json.loads(pathlib.Path(path).read_text())


def put(name, value):
    path = OUT / name
    path.parent.mkdir(parents=True, exist_ok=True)
    data = value if isinstance(value, bytes) else (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()
    if path.exists():
        assert path.read_bytes() == data, 'Never replace an existing partial-stage artifact'
    else:
        with path.open('xb') as handle:
            handle.write(data)
    return {'path': str(path.relative_to(ROOT)), 'sha256': digest(data), 'bytes': len(data)}


assert not (OUT / 'paired-source24-bounded-technical.entry.json').exists(), 'Preserve every completed technical package'
aseal = read(A / 'FINAL.independent-source24-a.freeze.json')
bseal = read(B / 'independent-b.final.freeze.json')
for row in aseal['files'] + bseal['ownCurrentRegularFileBindings'] + bseal['currentRequiredExternalRegularFileBindings']:
    verify(row)
aentry = read(A / 'completed-source24-independent-a.entry.json')
for row in aentry['actualCurrentInputBindings']:
    verify(row)
a = read(A / 'FIRST.current-source24-primary-and-partial-scope.verdict.json')
b = read(B / 'FINAL.source24.actual.json')
b_edge_path = B / 'FIRST.edges.actual.jsonl'
bind(b_edge_path)
b_edges = [json.loads(line) for line in b_edge_path.read_text().splitlines() if line.strip()]
b_by_child = {r['goalId']: r for r in b['retainedActualChildReviews']}
b_by_edge = {(r['goalId'], r['sourceGoalId']): r for r in b_edges}
assert len(b_by_child) == 24 and len(b_by_edge) == 63
assert a['neutralEntry'] == b['neutralCurrentEntry']
assert a['actualExplicitPartialEdges'] == b['summary']['partialEdgesKept'] == 63
assert a['priorKnowledgeDisclosed']['currentSource24AuthorSemanticRationalesReadBeforeFirst'] is False
assert a['priorKnowledgeDisclosed']['currentSource24PeerJudgmentsReadBeforeFirst'] is False
assert b['currentPeerJudgmentsRead'] is False
assert b['currentAuthorSemanticJudgmentsReadOnlyAfterOwnFIRST'] is True
assert b['authorComparison']['materialSemanticDifferences'] == []
assert b['authorComparison']['verdictChangesAfterAuthorReading'] == []

paired_children, paired_edges = [], []
for ar in a['allActual24GoalDecisions']:
    goal_id = ar['goalId']
    br = b_by_child[goal_id]
    held = goal_id == HOLD
    assert ar['actualWholeCurrentChildFingerprint'] == br['wholeChildBodyDigest']
    assert ar['retainedParentId'] == br['retainedParentId']
    assert ar['ownFirstPartialSemanticDecision'] == 'ACCEPT_EXPLICIT_PARTIAL_CONTRIBUTION'
    assert ar['normalAtlasContainsThisBoundedSourceChild'] is not held
    assert br['sourceScopeUnresolved'] is held
    assert ar['ownFirstScopeDecision'] == ('HOLD_SOURCE_COURSE_UNSPECIFIED' if held else 'KEEP_EXPLICIT_EXISTING_BOUNDED_SOURCE_SCOPE_CANDIDATE')
    assert br['verdict'] == ('KEEP_BOUNDED_PARTIAL_WITH_C11_SCOPE_HOLD' if held else 'KEEP_BOUNDED_PARTIAL')
    assert len(ar['actualReviewedEdges']) == br['partialEdgeCount']
    for ae in ar['actualReviewedEdges']:
        edge = ae['edge']
        be = b_by_edge[(goal_id, edge['legacyGoalId'])]
        assert edge == be['wholeCandidateEdge']
        assert edge['matchType'] == 'partial'
        assert ae['decision'] == 'ACCEPT_EXPLICIT_PARTIAL_CONTRIBUTION_ONLY'
        assert be['semanticVerdict'] == 'KEEP_PARTIAL'
        assert ae['wholeSourceBodyRef']['wholeOriginalBodySha256'] == be['wholeSourceBodyDigest']
        assert ae['sourceSpan'] == be['sourceSpan']
        assert len(ae['exactOccurrences']) == be['sourceOccurrencesCount']
        mapping = read(ROOT / ae['mappingPath'])
        assert mapping['mappings'].count(edge) == 1
        paired_edges.append({
            'goalId': goal_id,
            'mappingPath': ae['mappingPath'],
            'wholeCandidateEdge': copy.deepcopy(edge),
            'wholeSourceBodyDigest': be['wholeSourceBodyDigest'],
            'sourceSpan': ae['sourceSpan'],
            'literalWholeSourceOperator': ae['actualWholeSourceOperator'],
            'exactSourceCourseLevel': ae['exactSourceCourseLevel'],
            'sourceOccurrencesCount': len(ae['exactOccurrences']),
            'independentADecision': ae['decision'],
            'independentBDecision': be['semanticVerdict'],
            'independentBRationaleDeLiteral': be['rationaleDe'],
            'independentBScopeDecision': be['scopeVerdict'],
            'explicitScopeKeys': be['actualExplicitScopeKeys'],
            'wholeDutyApproval': False,
            'wholeCourseApproval': False,
            'humanApproval': False,
        })
    paired_children.append({
        'goalId': goal_id,
        'retainedParentId': ar['retainedParentId'],
        'wholeChildBodyDigest': ar['actualWholeCurrentChildFingerprint'],
        'independentASemanticDecision': ar['ownFirstPartialSemanticDecision'],
        'independentARationaleDeLiteral': ar['ownSubstantiveRationaleDe'],
        'independentAScopeDecision': ar['ownFirstScopeDecision'],
        'independentBSemanticAndScopeDecision': br['verdict'],
        'independentBRationaleDeLiteral': br['rationaleDe'],
        'explicitScopeKeys': br['actualExplicitScopeKeys'],
        'courseScopeHeld': held,
        'partialEdgeCount': br['partialEdgeCount'],
        'selectedTechnicalBoundedScope': not held,
        'wholeChildStrictComplete': False,
        'wholeSourceOrCourseApproval': False,
        'humanApproval': False,
    })
assert len(paired_children) == 24 and len(paired_edges) == 63
assert sum(r['selectedTechnicalBoundedScope'] for r in paired_children) == 23

child_ref = put('paired24-literal-independent-source-decisions.actual.json', {
    'schemaVersion': 1,
    'role': 'Technical literal pairing of two existing independent scientific reviews; no third independent scientific review',
    'rows': paired_children,
})
edge_ref = put('paired63-literal-independent-partial-edge-decisions.actual.jsonl', b''.join((json.dumps(row, ensure_ascii=False, separators=(',', ':')) + '\n').encode() for row in paired_edges))
mapping_refs = []
for prefix in ['BY', 'ST']:
    path = AUTHOR / f'candidate/{prefix}-whole-original-with-targeted-partial-child-contributions.inactive.review.json'
    candidate = read(path)
    successor = copy.deepcopy(candidate)
    original_delta = successor.pop('source24AuthorCandidateDelta')
    successor['source24IndependentBoundedContributionReview'] = {
        'role': 'Only the author-added explicit partial contributions have completed the current independent A/B source review',
        'historicalAuthorCandidateDelta': original_delta,
        'independentAFirst': bind(A / 'FIRST.current-source24-primary-and-partial-scope.verdict.json'),
        'independentAFinalSeal': bind(A / 'FINAL.independent-source24-a.freeze.json'),
        'independentBFirst': bind(B / 'FIRST.source24.actual.json'),
        'independentBFinalSeal': bind(B / 'independent-b.final.freeze.json'),
        'pairedChildDecisions': child_ref,
        'pairedEdgeDecisions': edge_ref,
        'newPartialEdgesReviewed': original_delta['newPartialEdges'],
        'independentReviewPending': False,
        'sourceCourseScopeHeldGoalId': HOLD,
        'wholeSourceApproval': False,
        'wholeCourseApproval': False,
        'humanApproval': False,
        'strictNetGain': 0,
    }
    assert successor['mappings'] == candidate['mappings']
    assert successor['decisions'] == candidate['decisions']
    assert successor.get('summary') == candidate.get('summary')
    assert successor['status'] == candidate['status'] == 'candidate'
    mapping_refs.append(put(f'candidate/{prefix}-whole-retained-with-current-paired-partial-source-review.inactive.review.json', successor))

put('paired-source24-bounded-technical.entry.json', {
    'schemaVersion': 1,
    'createdAt': datetime.now(timezone.utc).isoformat(),
    'role': 'Inactive technical assembly of already completed independent Source24 A/B; no new or third scientific review',
    'neutralAuthorEntry': bind(AUTHOR / 'neutral-source24-whole-primary-and-bounded-mapping.portable-successor-v2.entry.json'),
    'independentAFinalSeal': bind(A / 'FINAL.independent-source24-a.freeze.json'),
    'independentBFinalSeal': bind(B / 'independent-b.final.freeze.json'),
    'pairedChildren': child_ref,
    'pairedEdges': edge_ref,
    'wholeMappingCandidates': mapping_refs,
    'wholeCandidateAtomicCount': 398,
    'actualSourceSupportedUnion': 378,
    'whole398NormalProbeStillFailed': True,
    'selectedScopedChildren': [r['goalId'] for r in paired_children if not r['courseScopeHeld']],
    'courseScopeHeldGoalIds': [HOLD],
    'original19OmissionsAnd496UnresolvedSourceDecisionsRetained': True,
    'original5865WholeDutiesAnd21046EdgesAnd1180FamilyPartnersRetained': True,
    'wholeSourceOrCourseOrLegalApproval': False,
    'humanApproval': False,
    'D_P_A_M_V_Promotion': False,
    'strictNew': 0,
    'strictRestored': 0,
    'strictNet': 0,
    'activeWrites': [],
    'requiredCurrentRegularInputBindings': list(bindings.values()),
})
print(json.dumps({'technicalPair': 'PREPARED_INACTIVE', 'children': 24, 'scoped': 23, 'held': [HOLD], 'partialEdges': 63, 'requiredBindings': len(bindings), 'activeWrites': 0, 'strictNet': 0}))
