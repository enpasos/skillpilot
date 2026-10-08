# SPDX-License-Identifier: Apache-2.0
"""Bind the completed author batch and record actual checks without review claims."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
assert not (OWN / 'author.final.freeze.json').exists()

def read(p):
    return json.loads(p.read_text())

def bind(p):
    b = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def write(p, v):
    assert p.is_relative_to(OWN)
    p.write_text(json.dumps(v, ensure_ascii=False, indent=2) + '\n')

entry = read(OWN / 'author.candidate-ready.entry.json')
checks = read(OWN / 'checks/ordinary-capsule-checks.actual.json')
snapshot_path = OWN.parent / 'chemie-b008-twenty-six-images-author-20261008-v1/all26-whole-goals-and-unchanged26P52cases.readonly-inputs.snapshot.json'
snapshot = read(snapshot_path)
candidate = read(ROOT / entry['wholeCandidate']['path'])
by_id = {g['id']: g for g in candidate['goals']}
materials = []
for key in ['profilesSource', 'casesSource', 'nativeBindings']:
    expected = snapshot[key]
    actual = bind(ROOT / expected['path'])
    assert actual == expected
    materials.append({'role': key, 'exactCurrentBinding': actual, 'wholeBytesExactReadonlySnapshot': True, 'newIndependentScientificApproval': False})
whole_routines = []
for row in snapshot['routineBodies']:
    old = row['wholeGoal']
    new = by_id[old['id']]
    assert {k: v for k, v in old.items() if k != 'applicability'} == {k: v for k, v in new.items() if k != 'applicability'}
    whole_routines.append({'candidateKey': row['candidateKey'], 'goalId': old['id'], 'wholeTextImagePrerequisiteAndOtherNonApplicabilityFieldsExact': True, 'onlyBWApplicabilityProposalMayDiffer': old['applicability'] != new['applicability']})
assert len(whole_routines) == 26
write(OWN / 'actual-whole26P52cases-material-continuity.json', {'role': 'Actual material binder continuity, not a new content review', 'readonlySnapshot': bind(snapshot_path), 'wholeMaterialBindings': materials, 'all26WholeRoutines': whole_routines, 'priorScientificReviewsRemainSeparateAndRetained': True, 'sourceReviewOrHumanApprovalAdded': False})
for protected in entry['protectedActiveLandscapes']:
    assert bind(ROOT / protected['path']) == protected
for file in OWN.rglob('*'):
    assert not file.is_symlink()
    assert file.name != '.git'
    if file.is_file() and file.suffix == '.json':
        read(file)
components = read(OWN / 'bw-specific-source-components.author-candidate.json')['components']
mapping = read(ROOT / entry['sourceMappingCandidate']['path'])
pending = [d for d in mapping['decisions'] if d.get('decision') == 'needs_view_placement_review']
assert len(pending) == 9 and all(d.get('reviewer') is None and d.get('reviewedAt') is None for d in pending)
open_obligations = {
    'independentBWReviewsRequired': 2,
    'exactPendingBWDecisionIds': sorted(d['sourceGoalId'] for d in pending),
    'remaining33CPV009ByJurisdiction': {'DE-BY': 2, 'DE-HH': 4, 'DE-MV': 6, 'DE-RP': 6, 'DE-SN': 7, 'DE-TH': 8},
    'retainedSLMappingReviewRequired': True,
    'normalAtlasStatus': 'HOLD',
    'wholeNational1646SourceDutyAndRegionalUnionCoverage': 'HOLD',
    'wholeCareerChoiceAndUpperComplexModelDomains': 'HOLD',
    'previousEightProtectedPageRequiresReverseRequiresContexts': 'HOLD',
    'actualNativeD_P_A_M_VReviewsAndCurrentStrictIntersection': 'pending separate genuine campaigns',
}
write(OWN / 'precise-open-source-and-context-obligations.json', open_obligations)
questions = [
    {'id': 'whole_source_content_and_partners', 'question': 'Do all 65 original BW source goals, original partner mappings and five family duties remain complete, including each named substance/property/reactant/fuel and actual experimental performance? Judge each added partial component without treating it as closure of its whole source duty.'},
    {'id': 'hypothesis_cumulative_context', 'question': 'Do physical p11 2.1(2-5), the concrete experiment crossreferences and the operator definitions justify the complete lower question/hypothesis operationalization and this SekI target placement? Identify unsupported counterevidence or autonomy claims precisely.'},
    {'id': 'guided_vs_independent_performance', 'question': 'The guided qualifier in 3.2.2.2(2) modifies evaluation only. Does the explicitly stated didactic route under the official given-or-own instruction operator justify the guided target? Keep real performance and the independent plan/perform duty; never convert guided evaluation into guided execution.'},
    {'id': 'application_discussion_and_career_boundary', 'question': 'Assess application/society target placement from whole concrete uses/benefits/risks/fuel sources plus 2.2(8-9)/2.3(6,8-10). The broad applications-or-occupations statement does not by itself require complete personal career choice. Determine any remaining original occupational obligation without deleting or truncating an existing whole goal.'},
    {'id': 'program_and_projection_roles', 'question': 'Assess BW Gymnasium SekI classes8/9/10 as a cumulative program range; no fixed individual year or duration is assigned. Verify four explicit targets and one explicit source-information prerequisiteOnly role, with all other original view entries retained.'},
    {'id': 'mapping_decision_semantics', 'question': 'Review all nine pending exact source IDs and twelve partial child bindings. Original family mappings remain historical retained rows, not automatic whole-child coverage. Supply substantive independent decisions; author placeholders and compiler success are not source approval.'},
]
write(OWN / 'neutral-independent-source-placement.entry.json', {
    'schemaVersion': 1,
    'role': 'Neutral completed BW author packet for two independent source/component/program/view judgments',
    'authorCandidateEntry': bind(OWN / 'author.candidate-ready.entry.json'),
    'whole504Candidate': entry['wholeCandidate'],
    'completeSourceComponents': bind(OWN / 'bw-specific-source-components.author-candidate.json'),
    'completeSourceMappingCandidate': entry['sourceMappingCandidate'],
    'sourceViewCandidate': entry['candidateView'],
    'wholeSourceAndProgramObligations': bind(OWN / 'original-whole-duty-and-program-placement.obligations.json'),
    'actualWholePrimaryPageReadings': bind(OWN / 'primary/bw-actual-whole-pages-reading.receipt.json'),
    'ordinaryAffectedChecks': bind(OWN / 'checks/ordinary-capsule-checks.actual.json'),
    'wholeMaterialContinuity': bind(OWN / 'actual-whole26P52cases-material-continuity.json'),
    'preciseOpenObligations': bind(OWN / 'precise-open-source-and-context-obligations.json'),
    'specificIndependentReviewQuestions': questions,
    'reviewInputBindingPolicy': 'Bind these unchanged author inputs in separate reviewer-owned portable folders. Record real independent first findings and decisions; retain prior valid unchanged evidence. Do not edit author files or invent historical reviewers.',
    'components': len(components), 'sourceIds': len(pending), 'explicitTargetRoutines': 4, 'explicitPrerequisiteOnlyRoutines': 1,
    'wholeCandidateNodes': 504, 'wholeCandidateCurricularAtomic': 395,
    'technicalCPV009Before': 35, 'technicalCPV009After': 33, 'all395NativePagesExactPriorV21': True,
    'sourceGreen': False, 'strictGain': 0, 'activeWrites': 0, 'humanApproval': False,
})
payloads = [bind(p) for p in sorted(OWN.rglob('*')) if p.is_file()]
write(OWN / 'author.final.freeze.json', {'schemaVersion': 1, 'role': 'Completed inactive author first seal, not independent scientific approval', 'createdAtUtc': datetime.now(timezone.utc).isoformat(), 'payloads': payloads, 'currentStrictBaseline': 177, 'currentAtomicBaseline': 378, 'inactiveNodes': 504, 'inactiveAtoms': 395, 'technicalCPV009Before': 35, 'technicalCPV009After': 33, 'wholeSourceClosure': False, 'sourceGreen': False, 'strictGain': 0, 'activeWrites': 0, 'humanApproval': False})
print(json.dumps({'sealedPortableFiles': len(payloads), 'strictGain': 0, 'activeWrites': 0, 'sourceGreen': False, 'neutralEntry': str((OWN / 'neutral-independent-source-placement.entry.json').relative_to(ROOT))}))
