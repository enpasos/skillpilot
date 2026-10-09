# SPDX-License-Identifier: Apache-2.0
"""Materialize whole original clauses as scoped partial author routes, no approvals."""
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import re
import uuid

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
OUT = OWN / 'twenty-two-bounded-source-routes-author-v1'
DAY = OWN.parent
BY = ROOT / 'curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_CHEMIE_GYMNASIUM_LEHRPLANPLUS.source-extraction.json'
BYMAP = ROOT / 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_chemistry_source_extraction_to_canonical_chemistry.review.json'

def read(p): return json.loads(p.read_text())
def bind(p):
    assert not p.is_symlink(), p
    raw = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}
def write(name, value):
    p = OUT / name
    assert not p.exists(), p
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return bind(p)
def valsha(x): return hashlib.sha256(json.dumps(x, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

assert not OUT.exists()
extraction, mapping = read(BY), read(BYMAP)
source_goals = {x['id']: x for x in extraction['sourceGoals']}
passages = {x['id']: x for x in extraction['passages']}
original_decisions = {x['sourceGoalId']: x for x in mapping['decisions']}
whole_input_path = OWN / 'input/whole26-raw-profiles-and52-whole-cases.exact-neutral-input.json'
whole26 = read(whole_input_path)
whole_goals = {x['wholeGoal']['id']: x['wholeGoal'] for x in whole26['routineBodies']}
diagnosis_path = OWN / 'source-union-diagnosis-after-reviewedSL/actual-forty-one-missing-current-source-routes.neutral-diagnosis.json'
diagnosis = read(diagnosis_path)
missing = {x['goalId'] for x in diagnosis['missing']}
selected = set(whole_goals) & missing
assert len(selected) == 22 and 'a0080b5f-13ff-56bc-b8ff-2ff6273e2ec1' in selected
assert len(missing - selected) == 19
author12_path = DAY / 'chemie-b008-by12-ga-twelve-boundary-source-author-v1/twelve-bounded-BY12-GA-source-roles.author-candidate.json'
pair12_path = DAY / 'chemie-b008-by12-ga-twelve-boundary-source-pairing-root-v1/twelve-boundary-source.technical-pairing.json'
author7_path = DAY / 'chemie-b008-source19-remaining-seven-whole-author-v1/seven-bounded-BY8-11-source-roles.author-candidate.json'
a7_path = DAY / 'chemie-b008-source19-remaining-seven-whole-independent-a-root-v1/seven-whole-source-science-P.first.independent-A.verdict.json'
b7_path = DAY / 'chemie-b008-source19-remaining-seven-whole-independent-b-v1/whole-seven.independent-b.first-verdict.immutable.json'
author12, pair12, author7, a7, b7 = [read(p) for p in [author12_path, pair12_path, author7_path, a7_path, b7_path]]
assert pair12['boundedComponentDefectsRequiringRevision'] == [] and pair12['pairingDisagreements'] == []
assert all(x['decision'] == 'SUPPORTED_PARTIAL_CANDIDATE_ONLY' for x in a7['sourceComponentJudgments'])
assert all(x['proposedRelationScientificDecision'] == 'ACCEPT_BOUNDED_PARTIAL_CANDIDATE' for x in b7['sourceResults'])
known = {x['prospectiveGoalId'] for x in author12['rows'] + author7['rows']} & selected
new_five = selected - known
assert len(known) == 17 and new_five == {'75e2eff1-f871-5461-9e3f-26d0b333ce2f', 'e81a4aed-9695-533e-8eb7-7a0c714346ea',
                                      '42391b16-bbae-5c77-84e1-d488e714167b', '5b1bb5d9-07b1-5ba9-b320-cc97be917c60',
                                      '7f140b34-ed26-59e7-8ad2-ccb6b56bc9d6'}
rows, clause_groups = [], {}

def add(target, original_id, occurrence, course, rationale, role_status, prior=None):
    original = source_goals[original_id]
    assert occurrence in original['sourceOccurrences']
    passage = passages[occurrence['passageId']]
    assert original['sourceText'] in passage['text'], occurrence
    topic = occurrence['topicCode']
    stage = 'SekII' if topic.startswith(('C11', 'C12', 'C13')) else 'SekI'
    assert course in ('unspecified', 'GK')
    if course == 'GK': assert topic == 'C12-GA.1'
    key = (original_id, occurrence['sourceGoalId'], topic, course)
    scoped_id = 'by-chem-b008-scope-' + str(uuid.uuid5(uuid.NAMESPACE_URL, '|'.join(key)))
    original_decision = original_decisions[original_id]
    original_edges = [x for x in mapping['mappings'] if x['legacyGoalId'] == original_id]
    if key not in clause_groups:
        clone = deepcopy(original)
        clone.update({'id': scoped_id, 'passageId': occurrence['passageId'], 'topicCode': topic,
                      'sourceSpan': occurrence['sourceSpan'], 'sourceRef': occurrence['sourceRef'],
                      'stage': stage, 'courseLevel': course, 'sourceDocumentKey': extraction['sourceDocument']['key'],
                      'sourceOccurrences': [deepcopy(occurrence)], 'duplicateSourceGoalCount': 0,
                      'mergedTopicCodes': [topic], 'mergedSourceSpans': [occurrence['sourceSpan']],
                      'mergedSourceRefs': [occurrence['sourceRef']],
                      'tags': ['jurisdiction:DE-BY', 'stage:' + stage, 'courseLevel:' + course,
                               'topic:' + topic, 'sourceDocument:' + extraction['sourceDocument']['key']]})
        clone['extendedData'] = {**clone.get('extendedData', {}),
            'scopedWholeOriginalClauseRole': {'originalSourceGoalId': original_id, 'wholeOriginalSourceGoalValueSHA256': valsha(original),
                 'wholeOriginalSourceDecisionValueSHA256': valsha(original_decision), 'actualOriginalOccurrence': deepcopy(occurrence),
                 'actualGrade': re.match(r'C(\d+)', topic).group(1),
                 'actualTrack': 'NTG' if topic.startswith('C8') or '-NTG' in topic else 'HG_SG_MUG_WWG_SWG' if '-HG_' in topic else None,
                 'actualNativeCourse': 'grundlegendes Anforderungsniveau' if topic == 'C12-GA.1' else 'no course differentiation in original clause',
                 'technicalProjectionProfile': course if course == 'GK' else None,
                 'originalWholeDecisionAndAllPartnersRemainInOriginalMapping': True,
                 'wholeOriginalPartnerGoalIds': deepcopy(original_decision.get('canonicalGoalIds', [])),
                 'wholeOriginalEdges': deepcopy(original_edges),
                 'C11UnspecifiedCourseIsNotConvertedToGKOrLK': topic == 'C11.1',
                 'allOriginalSourceTextFieldsUnchanged': True,
                 'selectedComponentsOnly': True, 'wholeSourceClearance': False}}
        clause_groups[key] = {'sourceGoal': clone, 'wholeOriginalSourceGoal': deepcopy(original),
                              'wholeOriginalPassage': deepcopy(passage), 'wholeOriginalDecision': deepcopy(original_decision),
                              'wholeOriginalEdges': deepcopy(original_edges), 'targetIds': [], 'reasons': []}
    group = clause_groups[key]
    if target not in group['targetIds']: group['targetIds'].append(target)
    if rationale not in group['reasons']: group['reasons'].append(rationale)
    rows.append({'goalId': target, 'wholeCurrentProspectiveGoal': deepcopy(whole_goals[target]), 'scopedSourceGoalId': scoped_id,
                 'originalSourceGoalId': original_id, 'actualWholeOriginalOccurrence': deepcopy(occurrence),
                 'actualStage': stage, 'actualCourseLevel': course, 'matchType': 'partial',
                 'wholeSourceText': original['sourceText'], 'authorOperatorAndScopeJustificationDe': rationale,
                 'existingBoundedRoleEvidence': prior, 'roleStatus': role_status,
                 'newOrdinaryOperativeMappingAndScopeReview': 'PENDING', 'actualPhysicalLearnerPerformance': False,
                 'noWholeSourceOrNationalClearance': True})

for row in author12['rows']:
    target = row['prospectiveGoalId']
    if target not in selected: continue
    for component in row['sourceComponents']:
        add(target, component['originalSourceGoalId'], component['exactReadOccurrence'], 'GK', row['authorSourceJustificationDe'],
            'REUSE_GENUINE_PAIRED_BY12_GA_BOUNDED_PARTIAL_ROLE_NEW_ORDINARY_MAPPING_PENDING', bind(pair12_path))
for row in author7['rows']:
    target = row['prospectiveGoalId']
    if target not in selected: continue
    for component in row['sourceComponents']:
        for scope in component['actualOccurrenceScopes']:
            add(target, component['originalSourceGoalId'], scope['wholeOccurrence'], scope['courseLevel'],
                component['sourceOperatorScopeJustificationDe'],
                'REUSE_GENUINE_A_B_BOUNDED_SOURCE_COMPONENT_NEW_ORDINARY_MAPPING_PENDING',
                {'independentA': bind(a7_path), 'independentB': bind(b7_path)})

new_specs = [
 ('75e2eff1-f871-5461-9e3f-26d0b333ce2f', ['C8.1.3', 'C9-HG_SG_MUG_WWG_SWG.1.3', 'C9-NTG.1.3', 'C10-HG_SG_MUG_WWG_SWG.1.3', 'C10-NTG.1.3'],
  'Teilrolle eigene chemische Frage und prüfbare Hypothese aus Alltag/Technik: die Originale verlangen formulieren/ableiten und hypothesengeleitet planen. Ein erwartbarer Gegenbefund ist eine gezielte Operationalisierung der Prüflichkeit, keine zusätzliche wörtliche Klausel. Einfach strukturierte versus komplexere Phänomene sowie quantitative/qualitative Planung bleiben im ganzen Original und bei bisherigen Untersuchungspartnern erhalten. Frage-/Hypothesenleistung allein erfüllt keine praktische Untersuchung.'),
 ('e81a4aed-9695-533e-8eb7-7a0c714346ea', ['C8.1.2', 'C9-HG_SG_MUG_WWG_SWG.1.2', 'C9-NTG.1.2'],
  'Nur angeleitete Durchführung mit grundlegenden Arbeitstechniken und angeleiteter Dokumentation: C8/C9nonNTG einfache angeleitete Experimente; C9NTG nur die ausdrücklich komplexe angeleitete Alternative. Selbst geplante Experimente und selbständige bekannte Datenauswertung sind nicht durch diese Teilrolle erfüllt. Tatsächliches sicheres Durchführen bleibt praktisch verpflichtend und wird durch Modellfälle nicht als real erfolgt behauptet; Ausgangshypothesenbezug ist ein didaktischer Prüfrahmen.'),
 ('42391b16-bbae-5c77-84e1-d488e714167b', ['C10-HG_SG_MUG_WWG_SWG.1.2', 'C10-NTG.1.2', 'C10-HG_SG_MUG_WWG_SWG.1.3', 'C10-NTG.1.3'],
  'Eigenständige Planung und tatsächlich ausgeführte qualitative/quantitative Hypothesenuntersuchung: C10.1.2 verlangt selbst geplante Durchführung und selbständige Dokumentation; C10.1.3 verlangt qualitative oder quantitative/mehr quantitative hypothesengeleitete Planung. Jede Teilrelation deckt ihre konkreten Operatoren, erst die Partnerunion trägt Planung und tatsächliche Durchführung. C9NTG bekannte/einfache Selbständigkeit wird nicht pauschal zu dieser ganzen Kompetenz hochgestuft; keine C8/C9nonNTG-Selbstplanung behauptet.'),
 ('5b1bb5d9-07b1-5ba9-b320-cc97be917c60', ['C8.1.10', 'C9-HG_SG_MUG_WWG_SWG.1.10', 'C9-NTG.1.9', 'C10-HG_SG_MUG_WWG_SWG.1.9', 'C10-NTG.1.9', 'C10-HG_SG_MUG_WWG_SWG.1.12', 'C10-NTG.1.12'],
  'C8/C9nonNTG ausschließlich vorgegebene einfache Quellen und wenige Darstellungsformen; C9NTG vorgegebene und selbst recherchierte Quellen zielgruppen-/adressatenbewusst; C10 fach-/alltagssprachliche Texte und Bilder adressaten-/situationsgerecht plus bereitgestellte fachwissenschaftliche oder eigene Internetrecherche. Die WholeGoal-Alternative vorgegeben ODER selbst recherchiert wird jeweils quellengetreu gewählt; Quellenangabe ist transparente didaktische Dokumentation, kein behaupteter zusätzlich wörtlicher Originaloperator. Eigene Recherche bleibt bei gewählter NTG-/C10-Rechercheroute tatsächlich erforderlich.'),
 ('7f140b34-ed26-59e7-8ad2-ccb6b56bc9d6', ['C9-HG_SG_MUG_WWG_SWG.1.13', 'C9-NTG.1.11'],
  'Beschreiben konkreter Aufgaben/Anwendungen der Chemie und Diskussion ihrer gesellschaftlichen Bedeutung ist der ausdrücklich verlangte erste Teil der Berufswahlklausel. Die zweite eigenständige Berufswahlpflicht bleibt beim existierenden Partner 6c9adc36 und den vollständigen bisherigen Partnern erhalten. Fachliche Umwelt-/Menschenfolgen konkretisieren Bedeutung, keine automatische Whole-Berufswahlfreigabe.')]
occurrence_lookup = {}
for g in extraction['sourceGoals']:
    for o in g.get('sourceOccurrences', []): occurrence_lookup[o['sourceSpan']] = (g['id'], o)
primary_read_rows = []
captures = {'C8': 'by8.actual-main.txt', 'C9-HG_SG_MUG_WWG_SWG': 'by9-ch.actual-main.txt', 'C9-NTG': 'by9-ntg.actual-main.txt',
            'C10-HG_SG_MUG_WWG_SWG': 'by10-ch.actual-main.txt', 'C10-NTG': 'by10-ntg.actual-main.txt'}
capture_dir = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b008-nine-source-operator-structural-current-author-candidate-v3/primary-inputs'
for target, spans, reason in new_specs:
    for span in spans:
        original_id, occurrence = occurrence_lookup[span]
        primary = capture_dir / captures[occurrence['topicCode'].rsplit('.', 1)[0]]
        primary_text = re.sub(r'\s+', ' ', primary.read_text()).strip()
        clause = re.sub(r'\s+', ' ', source_goals[original_id]['sourceText']).strip()
        assert clause in primary_text, (span, 'whole original clause not in actual retained official primary')
        primary_read_rows.append({'goalId': target, 'sourceSpan': span, 'actualRetainedOfficialPrimary': bind(primary),
                                  'wholeOriginalClauseExactWhitespaceNormalizedSubstring': True,
                                  'wholeLB1OriginalPassage': deepcopy(passages[occurrence['passageId']]),
                                  'notAnIndependentReview': True})
        add(target, original_id, occurrence, 'unspecified', reason, 'NEW_BOUNDED_LOWER_FIVE_AUTHOR_SOURCE_ROLE_REQUIRES_TWO_INDEPENDENT_REVIEWS')

assert {r['goalId'] for r in rows} == selected
passage_ids = {g['sourceGoal']['passageId'] for g in clause_groups.values()}
new_passages = []
for passage_id in sorted(passage_ids):
    clone = deepcopy(passages[passage_id])
    clone['sourceGoalIds'] = [g['sourceGoal']['id'] for g in clause_groups.values() if g['sourceGoal']['passageId'] == passage_id]
    new_passages.append(clone)
new_extraction = {'schemaVersion': 1, 'extractionId': 'by-chemistry-b008-twenty-two-whole-clause-bounded-source-routes-author-v1',
  'title': 'Bayern Chemie: originale ganze Klauseln mit expliziten begrenzten Quellenrouten für 22 Routinen',
  'sourceLandscapeId': 'DE_BY_CHEMIE_B008_BOUNDED_WHOLE_CLAUSE_ROUTES_AUTHOR_SOURCE', 'jurisdiction': 'DE-BY',
  'subject': 'Chemie', 'stage': 'SekI+SekII', 'sourceDocument': deepcopy(extraction['sourceDocument']),
  'sourceDocuments': deepcopy(extraction['sourceDocuments']),
  'method': 'Exact original whole clauses and full LB passages, one explicitly selected actual occurrence per scoped source record; original 332 source rows and every original decision/edge retained unchanged in existing source inputs.',
  'qualityReview': {'status': 'ai_candidate', 'reviewer': None, 'reviewedAt': None}, 'pipelineStatus': 'author_candidate_current_ordinary_source_mapping_pending',
  'passages': new_passages, 'sourceGoals': [g['sourceGoal'] for g in clause_groups.values()],
  'extendedData': {'originalExtraction': bind(BY), 'originalWholeMapping': bind(BYMAP),
    'selectedPartialComponentsOnly': True, 'BY12GAOnlyNeverEA13Union': True, 'allOriginal332RowsAnd418EdgesPreserved': True,
    'C11CourseUncertaintyPreserved': True, 'wholeSourceUnionApproval': False, 'realExperimentApproval': False}}
extraction_binding = write('BY-twenty-two-whole-clause-bounded-routes.source-extraction.author-candidate.json', new_extraction)
new_mapping = {'version': '1.0', 'reviewId': 'by-chemistry-b008-twenty-two-bounded-routes-ordinary-author-v1',
 'sourceLandscapeId': new_extraction['sourceLandscapeId'], 'targetLandscapeId': mapping['targetLandscapeId'],
 'sourceExtractionPath': extraction_binding['path'], 'status': 'ai_candidate_inactive_requires_current_operative_source_reviews',
 'mappings': [], 'decisions': []}
for group in clause_groups.values():
    source = group['sourceGoal']
    targets = sorted(group['targetIds'])
    new_mapping['mappings'] += [{'legacyGoalId': source['id'], 'canonicalGoalId': t, 'matchType': 'partial', 'reviewDecisionId': source['id']} for t in targets]
    new_mapping['decisions'].append({'sourceGoalId': source['id'], 'topicCode': source['topicCode'], 'sourceSpan': source['sourceSpan'],
      'decision': 'mapped', 'canonicalGoalIds': targets, 'rationale': '\n'.join(group['reasons']), 'reviewer': None, 'reviewedAt': None,
      'reviewStatus': 'ai_candidate_needs_two_independent_ordinary_operative_source_reviews',
      'wholeOriginalPartnerGoalIds': deepcopy(group['wholeOriginalDecision'].get('canonicalGoalIds', [])),
      'wholeOriginalDecisionPreservedInOriginalMapping': True, 'wholeSourceClearance': False})
mapping_binding = write('BY-twenty-two-partial-source-routes.ordinary-mapping.author-candidate.json', new_mapping)
sl_config_path = DAY / 'chemie-b008-sl-nine-operative-source-review-root-v1/whole395-with-existing32-and-reviewedSL.normal-probe.config.json'
config = read(sl_config_path)
old_map_bindings = [bind(ROOT / p) for p in config['mappingPaths']]
new_config = deepcopy(config)
new_config['mappingPaths'].append(mapping_binding['path'])
# Keep all quality expectations exactly; metadata and the extra C11 uncertainty are real holds.
book_output = 'app/scripts/config/goal-books/inactive/chemie-b008-twenty-two-bounded-source-routes-author-20261009-v1'
new_config['outputDirectory'] = book_output
new_config['manifestPath'] = book_output + '/source-scopes.manifest.json'
new_config['navigationViewPath'] = book_output + '/national-navigation.view.json'
new_config_binding = write('whole395-with-reviewedSL-and-twenty-two-pending-routes.ordinary-inputs.author-candidate.json', new_config)
write('whole-twenty-two-source-route-operator-scope-and-partner.neutral-input.json', {
 'schemaVersion': 1, 'currentCanonicalAtoms': 378, 'inactiveProspectiveAtoms': 395,
 'exact22GoalIds': sorted(selected), 'existingPairedBoundedRoleGoalIds': sorted(known), 'newFiveAuthorRoleGoalIds': sorted(new_five),
 'wholeSelectedGoals': [whole_goals[t] for t in sorted(selected)], 'selectedRoleRows': rows,
 'wholeOriginalClausesPassagesDecisionsAndAllPartnerEdges': [
     {k: deepcopy(v) for k, v in group.items() if k not in ('targetIds', 'reasons', 'sourceGoal')}
     for group in clause_groups.values()],
 'originalAllMappingInputsUnchanged': old_map_bindings, 'actualFiveLowerWholePrimaryReads': primary_read_rows,
 'actualSource395Diagnostic': bind(diagnosis_path), 'elevenMissingAdditionalOutside26GoalIds': sorted(missing - set(whole_goals) - {r['goalId'] for r in diagnosis['missing'] if r['currentMappedSourceRoutes']}),
 'eightCurrentMappedBcPCourseHoldGoalIds': sorted(r['goalId'] for r in diagnosis['missing'] if r['currentMappedSourceRoutes']),
 'C11OnlyWholeKnowledgeInfluencesGoalCourseHold': 'e5a5dcd8-053c-55fd-b5c7-bba93779da53',
 'originalWholePartnersAndAll332BYRowsKept': True, 'actualNewClauseCount': len(clause_groups),
 'ordinaryMappingNewPartialEdgeCount': len(new_mapping['mappings']), 'wholeSourceApproval': False,
 'nativeD_P_A_M_VApproval': False, 'humanApproval': False, 'humanTrial': False, 'activeWrites': [], 'netStrictGain': 0})
write('actual-twenty-two-source-route-author-preservation-and-status.json', {
 'schemaVersion': 1, 'authoredAt': datetime.now(timezone.utc).isoformat(), 'selectedMissingWhole26Intersection': sorted(selected),
 'missingRoutineCount': 22, 'outside26AdditionalContentCount': 11, 'mappedBcPCourseHolds': 8,
 'existingPairedBoundedComponentsForGoals': 17, 'newFiveLowerRoleGoalsNotIndependentlyReviewed': 5,
 'oneKnownC11ComponentRemainsUnresolvedCourse': True, 'originalExpected395Unchanged': new_config['expectedCurricularAtomicGoalCount'],
 'originalExpectedUnresolvedScopeCountUnchanged': new_config['expectedUnresolvedScopeDecisionCount'],
 'original32PlusReviewedSLMappingFilesExact': [dict(row, actualAfterBytesExact=bind(ROOT / row['path']) == row) for row in old_map_bindings],
 'all504CanonicalGoalObjectsUnchanged': True, 'all22NewMappingReviewerAndDateNull': True,
 'noActualOrdinaryAtlasApprovalOrClaimed395': True, 'noPhysicalExperimentClaim': True, 'humanApproval': False,
 'activeWrites': [], 'netStrictGain': 0})
print(json.dumps({'out': str(OUT.relative_to(ROOT)), 'sourceExtraction': extraction_binding, 'mapping': mapping_binding,
 'ordinaryConfig': new_config_binding, 'goals': 22, 'pairedBoundedGoals': 17, 'newLowerRoleGoals': 5,
 'wholeClauseRecords': len(clause_groups), 'partialEdges': len(new_mapping['mappings']), 'C11CourseHold': True, 'netStrictGain': 0}))
