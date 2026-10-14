# SPDX-License-Identifier: Apache-2.0
"""Finite, inactive transport of existing whole-goal science; no new review."""
import copy
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

REPO = Path.cwd()
E14 = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14')
OUT = E14 / 'chemie-rest6-two-whole-atoms-on-final-source6-current412-minimal-inactive-technical-20261014-v1'
T = E14 / 'chemie-source6-current412-final-resources-P5-shared-native5-technical-20261014-v1'
A = E14 / 'chemie-source-six-original-residual-duty-author-20261014-v1'
OA = E14 / 'chemie-source-six-original-residual-duty-source-P-A-M-independent-a-20261014-v1'
RB = E14 / 'chemie-residual-six-original-duties-whole-P2-AM-kind-independent-root-20261014-v1'
DA = E14 / 'chemie-residual-e5d-case2-complete-material-targeted-independent-a-20261014-v1'
DB = E14 / 'chemie-residual-e5d-case2-actual-complete-material-independent-root-20261014-v1'
C = E14 / 'chemie-rest6-raw-root-weight-CAS-factual-correction-independent-a-20261014-v1'
BASE = T / 'candidate/canonical539.current412.final-five-paired-V-resources.inactive.json'
OLD_SEM = T / 'candidate/semantic539.current412.same-science-normal-enum-own-address.json'
NODE_SOURCE = A / 'candidate/two-whole-unapproved-atoms-and-source-boundary-cluster.json'
CASE = E14 / 'chemie-residual-e5d-case2-complete-material-targeted-author-successor-20261014-v1/candidate/four-whole-DEEN-cases.only-e5d-case2-material-D-completed.author.json'
CANONICAL = OUT / 'candidate/canonical542.prospective414.on-final-source6-539.minimal-inactive.json'
SEM = OUT / 'candidate/semantic542.prospective414.paired-existing-science.closed-enum.json'
P2 = OUT / 'P/P2.original-c307-and-corrected-e5d.existing-genuine-a.technical-selection.review.jsonl'
CRITERIA = OUT / 'P/criteria.current-two-whole-designs-corrected-four-case-material.technical-transport.md'
ROOT = '442c31c5-c561-5c7a-90bb-2335d779175c'
IDS = ['c3077d95-f3fe-5579-8493-cb92992809c4', 'e5d6de7e-28c5-5dd8-a700-ecc1a3a7b8cd']
CONTAINER = 'd11fc507-4fae-5f2f-bd84-c3dbc9c43daf'
LANDSCAPE = 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'

def read(path):
    return json.loads((REPO / path).read_text())

def sha(path):
    return hashlib.sha256((REPO / path).read_bytes()).hexdigest()

def dump(path, value):
    target = REPO / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def binding(path):
    path = Path(path)
    return {'path': str(path), 'sha256': sha(path), 'bytes': (REPO / path).stat().st_size}

def main():
    assert sha(BASE) == '0eec676ef1c12d52af04fcee501341747ebad70b360d55498006cc872fe5c2bb'
    assert sha(NODE_SOURCE) == '6dd87348dcad0c5363703094dab205e0e20ad8709fde4033aa95adb70f5e73e8'
    assert sha(CASE) == 'abe9995ad8c88f415e48ffc4bdef05aa5e8fbcf99c6189afe053364e5bfcd811'
    base = read(BASE)
    candidate = copy.deepcopy(base)
    nodes = read(NODE_SOURCE)
    additions = [nodes['reusedExistingPendingWholeAtom'], nodes['oneNewNarrowSN8WholeAtom'], nodes['boundaryCluster']]
    assert [goal['id'] for goal in additions] == IDS + [CONTAINER]
    before = {goal['id']: goal for goal in base['goals']}
    assert len(before) == 539 and all(goal['id'] not in before for goal in additions)
    root_before = before[ROOT]
    assert root_before['weight'] == 1.2 and CONTAINER not in root_before['contains']
    root_after = next(goal for goal in candidate['goals'] if goal['id'] == ROOT)
    root_after['contains'].append(CONTAINER)
    candidate['goals'].extend(copy.deepcopy(additions))
    assert len(candidate['goals']) == 542
    after = {goal['id']: goal for goal in candidate['goals']}
    for goal_id, old in before.items():
        expected = copy.deepcopy(old)
        if goal_id == ROOT:
            expected['contains'].append(CONTAINER)
        assert after[goal_id] == expected, goal_id
    assert candidate.keys() == base.keys()
    assert {k: v for k, v in candidate.items() if k != 'goals'} == {k: v for k, v in base.items() if k != 'goals'}
    assert after[ROOT]['weight'] == 1.2
    assert all(after[goal['id']] == goal for goal in additions)
    assert all(not after[goal_id].get('resourceLinks') for goal_id in IDS)
    # Separate edge DAGs and their union; all references must remain resolvable.
    dag_results = {}
    for edge_set in [('contains',), ('requires',), ('contains', 'requires')]:
        done, visiting = set(), set()
        def visit(goal_id):
            assert goal_id not in visiting, ('cycle', edge_set, goal_id)
            if goal_id in done:
                return
            visiting.add(goal_id)
            for edge in edge_set:
                for target in after[goal_id].get(edge, []):
                    assert target in after, ('dangling', goal_id, edge, target)
                    visit(target)
            visiting.remove(goal_id)
            done.add(goal_id)
        for goal_id in after:
            visit(goal_id)
        dag_results['+'.join(edge_set)] = {'acyclic': True, 'resolvedNodeCount': len(done)}
    dump(CANONICAL, candidate)
    ledger = read(OLD_SEM)
    ledger['ledgerId'] = 'chemie-rest6-two-atoms-on-final-source6-prospective414-20261014-v1'
    ledger['sourceLandscapePath'] = str(CANONICAL)
    ledger['counts']['curricularAtomic'] += 2
    ledger['counts']['programStructure'] += 1
    ledger['counts']['total'] += 3
    # Stock TypeScript helper computes the exact raw source fingerprints next.
    for goal in additions:
        kind = 'programStructure' if goal['id'] == CONTAINER else 'curricularAtomic'
        basis = 'reviewed-current-pilot-program-structure' if kind == 'programStructure' else 'reviewed-current-pilot-curricular-atomic'
        ledger['decisions'].append({'goalId': goal['id'], 'sourceFingerprint': 'PENDING_STOCK_FINGERPRINT', 'semanticKind': kind, 'decisionStatus': 'authoritative', 'decisionBasis': basis})
    dump(SEM, ledger)
    cas = {
        'schemaVersion': 1, 'documentType': 'finite-inactive-whole-goal-CAS',
        'scienceRole': 'technical transport of existing sealed science only',
        'before': binding(BASE), 'after': binding(CANONICAL),
        'fullBeforeRoot': root_before, 'fullAfterRoot': root_after,
        'addedWholeGoals': additions,
        'assertions': {'all539ExistingGoalsComparedWhole': True, '538WholeExistingGoalsExactlyUnchanged': True,
                       'existingRootOnlyContainsAppend': CONTAINER, 'allExistingLandscapeMetadataUnchanged': True,
                       'rawRootWeightBefore': 1.2, 'rawRootWeightAfter': 1.2,
                       'rawWeightIsNotAtomicCount': True, 'newWholeGoalBodiesExactlyAuthorSource': True,
                       'oldGoodResourceLinksPreserved': True, 'newTwoResourceLinksRemainEmpty': True,
                       'newSemanticCurricularAtomicCount': 414, 'newTotalNodeCount': 542,
                       'sourceCarriersAppliedOrReplaced': 0, 'activeOrHostWrites': 0,
                       'newDOrVOrHumanApprovals': 0, 'newStrictCompletionClaim': 0},
        'dagChecks': dag_results,
    }
    dump(OUT / 'CAS.exact-539-to-542-whole-objects.only-two-atoms-container-and-root-link.actual.json', cas)
    kind_root = read(RB / 'SCIENCE.first-original-six-P2-whole-AM-kind-root.actual.json')
    own_kind = read(OA / 'science/KIND.two-actual-independent-a-classifications-authority-transport-pending.json')
    root_by_id = {row['goalId']: row for row in kind_root['wholeGoalJudgments']}
    own_by_id = {row['goalId']: row for row in own_kind['decisions']}
    for goal_id in IDS:
        assert root_by_id[goal_id]['wholeGoal'] == after[goal_id]
        assert root_by_id[goal_id]['semanticKind'] == own_by_id[goal_id]['decision'] == 'curricularAtomic'
    assert kind_root['containerKind']['goalId'] == CONTAINER
    assert kind_root['containerKind']['semanticKind'] == 'programStructure'
    dump(OUT / 'kind/PROVENANCE.three-normal-closed-kind-decisions.actual-existing-science.json', {
        'schemaVersion': 1, 'scienceRole': 'machine semantic classification transport; no human approval',
        'wholeGoalKinds': [{'goalId': goal_id, 'semanticKind': 'curricularAtomic',
                            'pairedActualDecisions': [own_by_id[goal_id], {k: root_by_id[goal_id][k] for k in ['goalId', 'semanticKind', 'kindReason']}]} for goal_id in IDS],
        'programStructureContainer': kind_root['containerKind'],
        'originalMetadataAuthorPendingRetainedAsHistory': True,
        'closedDecisionBasis': {'curricularAtomic': 'reviewed-current-pilot-curricular-atomic', 'programStructure': 'reviewed-current-pilot-program-structure'},
        'independentScientificVotesCreatedByThisTransport': 0,
    })
    for tag, source in [('independent-a', OA), ('independent-root', RB)]:
        for lane in ['A', 'M']:
            config = read(source / f'config/{lane}2.genuine-{tag}.config.json')
            config['landscapePath'] = str(CANONICAL)
            dump(OUT / f'config/{lane}2.existing-genuine-{tag}.new-candidate-address-only.config.json', config)
    criterion_text = '''# Two current whole designs: existing genuine independent A selection

CC-BY-4.0. This is a technical shared criteria binding for two already sealed scientific judgments. No new reviewer vote, task, rubric, whole-goal or profile-body revision is made here.

Read the unchanged complete DE/EN goals, original primary/course/operator conditions, prerequisites and both complete cases per goal with their actual inline materials, model answers and every rubric. Require all goal aspects, full expectation coverage, genuine changed-condition evidence and separately graded inference. Two independent demonstrations may occur within one rich task; there is no extra-task quota. These are theoretical task designs, not actual learner execution.

c307: retain the original whole two-case review of local electron-pair attack and leaving-group arrows, structures, valence/charge/atom balance, intermediate, diol monomer functionality and changed-functionality/stopped-structure inference. An overall equation alone does not show the mechanism. The stipulated elementary model does not establish real synthesis performance, yield or a unique real pathway.

e5d: retain the original complete first case and genuine targeted corrected second-case material judgment. Require the actual D1/D2/D3 substance/handling card when matching rules. F supports only the justified negative inference that equal broad pH cannot establish identical use or handling. Invented F-specific hazards, protection or practical investigation are not supported. Preserve the original missing-card E0/HOLD record as history.

Actual corrected complete four-case carrier: {case}
SHA256 {case_sha}

Actual original c307 science seal: {c307_seal}
Actual corrected e5d science seal: {e5d_seal}

Preserve SN mandatory parent versus recommended contexts, all source-specific partial boundaries, BB/BE exact52 acquisition holds and TH naming-only limitation. This P selection grants no whole-course/source/acquisition/A/M/kind/D/V/Human approval. Current records stay E1/G1, needs_human_review, ai_candidate with original reviewer, scientific reason and reviewedAt; no fabricated run manifests or learner results.
'''.format(case=CASE, case_sha=sha(CASE),
           c307_seal=OA / 'FIRST-SCIENCE-SEAL.original-residual6-source-two-whole-goal-P-A-M-kind-independent-a.actual.json',
           e5d_seal=DA / 'FIRST-SCIENCE-SEAL.e5d-case2-complete-D-card-material-only-independent-a.actual.json')
    CRITERIA.parent.mkdir(parents=True, exist_ok=True)
    CRITERIA.write_text(criterion_text)
    own_original_p = OA / 'P/original-two-whole-profiles.genuine-independent-a.c307-E1G1-e5d-HOLD-E0G0.review.jsonl'
    corrected_p = DA / 'P/e5d-current-full-profile-corrected-material.genuine-independent-a.E1G1.review.jsonl'
    original_rows = [json.loads(line) for line in own_original_p.read_text().splitlines() if line.strip()]
    rows = [next(row for row in original_rows if row['goalId'] == IDS[0]), json.loads(corrected_p.read_text())]
    assert [row['goalId'] for row in rows] == IDS
    assert all(row['evidenceLevel'] == 'E1' and row['maximumClaimScope'] == 'G1' and row['status'] == 'needs_human_review' and row['reviewAuthority'] == 'ai_candidate' for row in rows)
    technical_id = 'chemie-rest6-two-whole-p-original-science-current-material-technical-selection-20261014-v1'
    for row in rows:
        row['reviewId'] = technical_id
    P2.parent.mkdir(parents=True, exist_ok=True)
    P2.write_text(''.join(json.dumps(row, ensure_ascii=False, separators=(',', ':')) + '\n' for row in rows))
    dump(OUT / 'config/P2.original-genuine-a-science.current-corrected-material.config.json', {
        '$schema': 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',
        'schemaVersion': 2, 'reviewId': technical_id,
        'goalFingerprintRuleVersion': 'goal-evidence-v1', 'profileRuleVersion': 'positive-understanding-evidence-v2',
        'reviewCriteriaPath': str(CRITERIA), 'reviewedResourceTypes': ['goal-visualization'], 'requireApproved': False,
        'landscapeId': LANDSCAPE, 'landscapePath': str(CANONICAL), 'semanticKindLedgerPath': str(SEM),
        'reviewPath': str(P2), 'scope': {'label': 'Exact two whole unchanged goals; existing genuine A c307 and corrected-material e5d science only', 'goalIds': IDS},
    })
    inputs = [BASE, OLD_SEM, NODE_SOURCE, CASE,
        T / 'candidate/QA.current412.preserve419-plus-five-genuine-paired-V.normal-stock.json',
        T / 'SEAL.finite-current412-five-final-resource-P5-native-common-FIRST_PASS.stock-PASS.actual.json',
        A / 'CAS.six-whole-source-cells-five-carriers-and-one-parent-literal-restoration.author-only.json',
        A / 'HOLD.BB-BE-c307-exact52-current-ordinary-acquisition-goals.no-blanket-scope-grant.json',
        OA / 'FIRST-SCIENCE-SEAL.original-residual6-source-two-whole-goal-P-A-M-kind-independent-a.actual.json',
        OA / 'SEAL.finite-original-residual6-source-two-whole-P-AM-kind-independent-a.actual.json',
        OA / 'science/FIRST.six-original-source-cells-seven-new-partial-components.independent-a.actual.jsonl',
        OA / 'science/KIND.two-actual-independent-a-classifications-authority-transport-pending.json',
        RB / 'FIRST-SCIENCE-SEAL.original-six-P2-whole-AM-kind-root.actual.json',
        RB / 'SEAL.finite-actual-original-six-P2-AM-kind-independent-root.actual.json',
        RB / 'SCIENCE.first-original-six-P2-whole-AM-kind-root.actual.json',
        DA / 'FIRST-SCIENCE-SEAL.e5d-case2-complete-D-card-material-only-independent-a.actual.json',
        DA / 'SEAL.finite-e5d-case2-complete-material-targeted-independent-a.actual.json',
        DB / 'SEAL.finite-actual-targeted-e5d-material-delta-independent-root.json',
        C / 'SEAL.additive-exact-raw-root-weight-factual-correction.actual.json',
        own_original_p, corrected_p,
        A / 'P/criteria.complete-residual-two-E0-G0.md',
        DA / 'P/criteria.actual-e5d-material-only-corrected-full-two-case-annex.md',
        'app/scripts/goalBookModel.ts', 'app/scripts/positiveGoalEvidenceReview.ts',
        'app/scripts/positiveGoalEvidenceProfileModel.ts', 'app/scripts/semanticAtomicityReview.ts',
        'app/scripts/memoryCardReview.ts', 'scripts/validate_curriculum_release_model.py',
        'scripts/validate_schemas.py', 'contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json',
        'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',
        'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json']
    for source, tag in [(OA, 'independent-a'), (RB, 'independent-root')]:
        for lane in ['A', 'M']:
            cfg = source / f'config/{lane}2.genuine-{tag}.config.json'
            inputs += [cfg, read(cfg)['reviewPath']]
            if lane == 'M':
                inputs += [read(cfg)['cardReviewPath']]
    dump(OUT / 'INPUTS.exact-final539-existing-science-and-stock-contracts.actual.json', {
        'schemaVersion': 1, 'startedAtUTC': datetime.now(timezone.utc).isoformat(),
        'operator': '/root/chemie_native8_fresh_independent_a',
        'role': 'technical integration preparation, zero new scientific votes',
        'files': [binding(path) for path in dict.fromkeys(map(str, inputs))],
        'scope': IDS, 'futureImagesNativeAndSourceCarriersNotApplied': True,
    })
    print(json.dumps({'candidate': str(CANONICAL), 'nodes': len(candidate['goals']), 'rawRootWeight': after[ROOT]['weight'], 'rootContainsBefore': len(root_before['contains']), 'rootContainsAfter': len(root_after['contains']), 'dag': dag_results}))

if __name__ == '__main__':
    main()
