# SPDX-License-Identifier: Apache-2.0
"""Bounded author correction of three overbroad executable source-equality roles."""
from pathlib import Path
import json, hashlib, copy, subprocess, datetime

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
BASE = OWN.parent
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()
SOURCE = BASE / 'biologie-evolution-eighteen-seven-source-course-remediation-author-v1'
NATIVE = BASE / 'biologie-evolution-current17-and-protected-contexts-native-preparation-author-v1'
B_FIRST = BASE / 'biologie-evolution-seven-source-course-successors-independent-b-v1/source7-independent-b.science-FIRST.verdict.json'
MAP = SOURCE / 'candidate/mappings/HE144-four-source-and-course.whole-successor.review.json'
EXTRACTION = SOURCE / 'candidate/source-extractions/HE144-four-source-and-course.whole-successor.json'
PDF = ROOT / 'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-biologie.pdf'


def read(path):
    return json.loads(path.read_text())


def bind(path):
    assert path.is_file() and not path.is_symlink()
    data = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def write(relative, value):
    path = OWN / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    assert not path.exists(), path
    path.write_bytes(value if isinstance(value, bytes) else (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode())
    return bind(path)


assert bind(B_FIRST)['sha256'] == 'sha256:0e4564990f673797a99e0b529ebabb585fcdcbdf86c5feeb9ef7dfb09b88ac42'
finding = next(row for row in read(B_FIRST)['findings'] if row['findingId'] == 'EVO7B-SOURCE-001')
assert finding['exactAffectedDecisionIndices'] == [71, 75, 81]
assert bind(PDF)['sha256'] == 'sha256:52c278d6f5a7383361631d5251550c42222f13e1bbe2aa16d39ca3b12c5e1558'
source_entry = read(SOURCE / 'neutral-whole35-partner30-seven-source-author-successor.independent-review.entry.json')
native_entry = read(NATIVE / 'neutral-current17-and-protected-contexts.native-independent-review.final.entry.json')
inputs = [bind(path) for path in [B_FIRST, MAP, EXTRACTION, PDF,
    SOURCE / 'seven-source-author-successor.final.freeze.json',
    SOURCE / 'neutral-whole35-partner30-seven-source-author-successor.independent-review.entry.json',
    SOURCE / 'input/whole35-duty30-partner-original-frame.exact.json',
    NATIVE / 'neutral-current17-and-protected-contexts.native-independent-review.final.entry.json',
    NATIVE / 'native17-and-source-contexts.technical-final.freeze.json',
    NATIVE / 'source-atlas/atlas.inputs.book-local.inactive.json',
    ROOT / native_entry['candidateCanonicalPath'], ROOT / native_entry['candidateKindsPath'],
    ROOT / native_entry['portableVisualizationQAPath'], ROOT / native_entry['candidateVisualizationQAPath'],
    ROOT / native_entry['actualFullBeforeModelPath'], ROOT / native_entry['actualFullCandidateModelPath'],
    ROOT / native_entry['positiveConfigPath'], ROOT / native_entry['positiveRecordPath']]]
write('three-HE-partial-edge.input-FIRST.freeze.json', {'schemaVersion': 1, 'createdAt': NOW,
    'role': 'Actual inputs before bounded author correction; existing scientific/native freezes immutable',
    'inputs': inputs, 'findingId': finding['findingId'], 'activeWrites': 0})
primary = []
for page in [38, 40, 42]:
    argv = ['pdftotext', '-layout', '-f', str(page), '-l', str(page), str(PDF.relative_to(ROOT)), '-']
    result = subprocess.run(argv, cwd=ROOT, capture_output=True, check=True)
    text = result.stdout.decode()
    assert text.strip().endswith(str(page))
    output = write('primary/HE-current2025-PDF-page-' + str(page) + '.actual.txt', result.stdout)
    primary.append({'physicalPdfPage': page, 'printedPage': page, 'argv': argv, 'exitCode': result.returncode,
        'actualExtractedBytes': output, 'currentOfficialPdf': bind(PDF),
        'thirdPartyOfficialText': True, 'licenseRelabelled': False})
assert 'Themenfelder 1 bis 3' in (OWN / 'primary/HE-current2025-PDF-page-38.actual.txt').read_text()
assert 'Homöobox-Gene' in (OWN / 'primary/HE-current2025-PDF-page-40.actual.txt').read_text()
assert 'hypothetische Stammbäume' in (OWN / 'primary/HE-current2025-PDF-page-42.actual.txt').read_text()

mapping = read(MAP)
candidate = copy.deepcopy(mapping)
extraction = read(EXTRACTION)
canonical = read(ROOT / native_entry['candidateCanonicalPath'])
goals = {goal['id']: goal for goal in canonical['goals']}
qualifications = []
differences = []
for decision_index, source_id, target_id, edge_index, page, interpretation in [
    (71, '4367f7eb-6aae-4edb-b5a6-8cb9d1032d8d', 'e3167331-f855-5030-9673-29f55a7b4230', 86, 42,
     'Q2.1 LK requires human origins, fossil history, hypothetical trees and dispersal. Fossil/dating appraisal is an own bounded supporting operationalisation; the complete official human-evolution clause and own dating-method competence are not equal. No official numbered Q2.1.6 dating clause is asserted.'),
    (75, '9a6a1ef7-3934-483c-9ddc-da18de21aaa4', 'ac40db32-5dc7-5c43-8771-bf805d24aa3b', 29, 42,
     'Q2.1 GK/LK requires synthetic theory and separation from non-scientific ideas. The own historical Darwin/Neo-Darwinism comparison supports part of this duty; the exact historical comparative competence is not quoted as the entire official clause. Q2.2 ethics/science/religion is not substituted as a literal theory-comparison clause.'),
    (81, '27a5dc02-e359-4433-87ac-a49e020839ea', '9b40dae5-6d89-5714-ac96-373e72a7045e', 93, 40,
     'Q1.5 LK genuinely names regulation in developmental phases and homeobox genes. The own Evo-Devo evolutionary transfer is a bounded partial extension. Printed38 mandates Q1 topics1-3; Q1.5 stays elective. This is an optional book-local catalog witness and never an unselected default HE-LK learner duty.')]:
    decision = mapping['decisions'][decision_index]
    edge = mapping['mappings'][edge_index]
    source_goal = next(goal for goal in extraction['sourceGoals'] if goal['id'] == source_id)
    assert decision['sourceGoalId'] == edge['legacyGoalId'] == source_id
    assert edge['canonicalGoalId'] == target_id and decision['canonicalGoalIds'] == [target_id]
    assert decision['matchType'] == source_goal['authorSourceQualification']['sourceRole'] == 'partial'
    assert edge['matchType'] == 'exact'
    candidate['mappings'][edge_index]['matchType'] = 'partial'
    differences.append({'jsonPointer': '/mappings/' + str(edge_index) + '/matchType', 'before': 'exact', 'after': 'partial',
        'wholeBeforeEdge': edge, 'wholeCandidateEdge': candidate['mappings'][edge_index], 'decisionIndex': decision_index})
    qualifications.append({'sourceGoalId': source_id, 'canonicalGoalId': target_id, 'wholeSourceGoal': source_goal,
        'wholeCanonicalGoal': goals[target_id], 'wholeAuthoritativeDecision': decision, 'wholeBeforeExecutableEdge': edge,
        'wholeCandidateExecutableEdge': candidate['mappings'][edge_index], 'actualPrimaryPdfPage': page,
        'actualFullPrimaryPageBinding': next(row['actualExtractedBytes'] for row in primary if row['printedPage'] == page),
        'operatorAndCourseReason': interpretation, 'wholeSourceApproval': False, 'wholeCourseApproval': False,
        'nativeApproval': False, 'independentFollowup': 'PENDING', 'humanApproval': False})
masked = copy.deepcopy(candidate)
for row in differences:
    masked['mappings'][int(row['jsonPointer'].split('/')[2])]['matchType'] = row['before']
assert masked == mapping
assert candidate['decisions'] == mapping['decisions']
assert len(candidate['mappings']) == len(mapping['mappings']) and len(candidate['decisions']) == len(mapping['decisions'])
candidate_binding = write('candidate/HE144-three-partial-operator-and-course-edges.whole-successor.review.json', candidate)
write('three-HE-edge-exact-values-and-whole-masked-equality.actual.json', {'schemaVersion': 1,
    'original': bind(MAP), 'successor': candidate_binding, 'changes': differences, 'maskedWholeObjectExact': True,
    'allDecisionsExactlyRetained': True, 'allOriginalWholeMappingsRetained': True,
    'unrelatedFieldsExactlyRetained': True, 'realTypedSourceEqualityOverclaimCorrected': True,
    'hashOnlyReviewClaim': False, 'sourceExtractionExactlyRetained': bind(EXTRACTION), 'activeWrites': 0})
baseline_config = read(NATIVE / 'source-atlas/atlas.inputs.book-local.inactive.json')
config = copy.deepcopy(baseline_config)
index = config['mappingPaths'].index(str(MAP.relative_to(ROOT)))
config['mappingPaths'][index] = candidate_binding['path']
write('candidate/source-atlas.current479-394-three-HE-partial-edges.inputs.json', config)
write('neutral-inputs/whole35-duty30-partner-original-frame.exact.json', (SOURCE / 'input/whole35-duty30-partner-original-frame.exact.json').read_bytes())
write('three-HE-primary-operator-and-course.author-science-FIRST.verdict.json', {'schemaVersion': 1, 'createdAt': NOW,
    'role': 'Actual bounded author source-role judgment, not independent approval', 'findingId': finding['findingId'],
    'actualIndependentFinding': bind(B_FIRST), 'actualPrimaryReadings': primary, 'wholeScopedQualifications': qualifications,
    'authorFindingRemediation': 'Three executable edges corrected from full equality to their genuine bounded primary-supported partial roles',
    'sourceWhole35AndPartner30DutiesRetained': True, 'existingCurrent479GoalsAndKinds394Unchanged': True,
    'HE_Q1_5OptionalBookWitnessNotDefaultLearnerDuty': True, 'wholeSourceCourseApproval': False,
    'independentResolution': 'PENDING', 'reviewAuthority': 'ai_candidate', 'status': 'needs_human_review',
    'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'humanApproval': False, 'humanTrial': False,
    'newScientificM7Closures': 0, 'restoredM7Bindings': 0, 'strictGain': 0, 'activeWrites': 0})
print(json.dumps({'actualTypedCorrections': len(differences), 'wholeDecisionsExact': True,
    'wholeMappingMaskedExact': True, 'actualFullPrimaryPagesRead': [38, 40, 42], 'strictGain': 0}))
