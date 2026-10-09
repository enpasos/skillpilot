#!/usr/bin/env python3
"""Additive, inactive HE source checkpoint; no semantic approvals or active writes."""
import copy
import hashlib
import json
import re
import shutil
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
OUT = Path(__file__).resolve().parent
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09'
SOURCE7 = BASE / 'biologie-evolution-eighteen-seven-source-course-remediation-author-v1'
NATIVE = BASE / 'biologie-evolution-current17-and-protected-contexts-native-preparation-author-v1'
CORRECTION = BASE / 'biologie-evolution-three-HE-partial-edge-scope-remediation-author-v1'
PDF = ROOT / 'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-biologie.pdf'
CANON = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
KINDS = ROOT / 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
FIRST = OUT / 'HE-whole-primary-checkpoint.input-FIRST.json'

def load(path):
    return json.loads(path.read_text())

def rel(path):
    return path.relative_to(ROOT).as_posix()

def binding(path):
    raw = path.read_bytes()
    return {'path': rel(path), 'sha256': 'sha256:' + hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}

def write(name, value):
    path = OUT / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return binding(path)

def exact_copy(source, name):
    path = OUT / name
    path.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, path)
    assert source.read_bytes() == path.read_bytes()
    return binding(path)

def main():
    assert not FIRST.exists(), 'Never overwrite this checkpoint FIRST or a sealed checkpoint.'
    original_sources = {
        'canonical479': CANON,
        'kinds394': KINDS,
        'HEPrimaryCurrent': PDF,
        'HE144Extraction': SOURCE7 / 'candidate/source-extractions/HE144-four-source-and-course.whole-successor.json',
        'HE144MappingCorrectedThreePartialEdges': CORRECTION / 'candidate/HE144-three-partial-operator-and-course-edges.whole-successor.review.json',
        'original35Duty30WholePartnerFrame': SOURCE7 / 'input/whole35-duty30-partner-original-frame.exact.json',
        'native17Entry': NATIVE / 'neutral-current17-and-protected-contexts.native-independent-review.final.entry.json',
        'native17FinalSeal': NATIVE / 'native17-and-source-contexts.technical-final.freeze.json',
        'source7FinalSeal': SOURCE7 / 'seven-source-author-successor.final.freeze.json',
        'correctedSourceMethodFinalSeal': CORRECTION / 'three-HE-edges-and-ST-sampling.author-final.freeze.json',
        'compositionSchema': ROOT / 'contracts/curriculum-package/v1/composition-view.schema.json',
        'compositionService': ROOT / 'backend/src/main/java/com/skillpilot/backend/service/CompositionViewService.java',
        'learnerService': ROOT / 'backend/src/main/java/com/skillpilot/backend/service/LearnerService.java',
        'compositionAuthoring': ROOT / 'app/src/utils/authoring/compositionViewAuthoring.ts',
    }
    source_bindings = {key: binding(path) for key, path in original_sources.items()}
    assert source_bindings['HEPrimaryCurrent']['sha256'] == 'sha256:52c278d6f5a7383361631d5251550c42222f13e1bbe2aa16d39ca3b12c5e1558'
    created = datetime.now(timezone.utc).isoformat()
    write(FIRST.name, {
        'role': 'started_inactive_author_source_checkpoint_input_FIRST',
        'createdAt': created, 'inputs': source_bindings,
        'scienceApproval': False, 'independentApproval': False, 'activeWrites': [],
        'requestedCheckpoint': 'Preserve started whole-primary work without claiming a complete mandatory view.',
    })
    portable = {}
    for key, name in [
        ('canonical479', 'input/canonical.current479.exact.json'),
        ('kinds394', 'input/kinds.current394.exact.json'),
        ('HE144Extraction', 'input/HE144-source-extraction.whole.exact.json'),
        ('HE144MappingCorrectedThreePartialEdges', 'input/HE144-mapping.three-actual-partial-edges.whole.exact.json'),
        ('original35Duty30WholePartnerFrame', 'input/original35-duty30-whole-partner-frame.exact.json'),
        ('compositionSchema', 'input/composition-view.schema.exact.json'),
    ]:
        portable[key] = exact_copy(original_sources[key], name)
    canon = load(CANON)
    goals = {goal['id']: goal for goal in canon['goals']}
    assert len(goals) == 479
    extraction = load(original_sources['HE144Extraction'])
    mapping = load(original_sources['HE144MappingCorrectedThreePartialEdges'])
    frame = load(original_sources['original35Duty30WholePartnerFrame'])
    native = load(original_sources['native17Entry'])
    assert len(extraction['sourceGoals']) == 144 and len(mapping['decisions']) == 144 and len(mapping['mappings']) == 157
    assert frame['sourceDutyCount'] == 35 and frame['wholePartnerCount'] == 30
    pages = {}
    for page in range(33, 49):
        text = subprocess.run(['pdftotext', '-layout', '-f', str(page), '-l', str(page), str(PDF), '-'], check=True, capture_output=True, text=True).stdout
        assert re.search(r'\n\s*' + str(page) + r'\s*\n?\f?\s*$', text), f'Printed-page footer mismatch {page}'
        path = OUT / f'primary/HE-physical-and-printed-page-{page:03}.whole.txt'
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text)
        pages[page] = {'physicalPage': page, 'printedPage': page, 'actualWholePage': binding(path), 'wholeText': text}
    portable['wholePrimaryPages16'] = write('primary/HE-whole-pages33-48.actual-page-map.json', {
        'sourceDocument': extraction['sourceDocuments'][-1], 'sourcePDFBinding': binding(PDF),
        'pageCount': 16, 'pages': [{k: v for k, v in row.items() if k != 'wholeText'} for row in pages.values()],
        'primaryReadScope': 'Actual complete pages33–48; source clauses not inferred from old authored sourceSpan numbers.',
        'currentCohortErlassChecked': False, 'schoolTopicSelectionObserved': False,
    })
    topic_metadata = [
        ('E.1',35,36,True), ('E.2',36,36,True), ('E.3',36,36,True), ('E.4',36,36,False), ('E.5',37,37,False),
        ('Q1.1',38,39,True), ('Q1.2',39,39,True), ('Q1.3',39,39,True), ('Q1.4',39,39,False), ('Q1.5',40,40,False),
        ('Q2.1',42,42,True), ('Q2.2',42,42,False), ('Q2.3',43,43,True), ('Q2.4',43,43,False),
        ('Q3.1',44,45,True), ('Q3.2',45,46,True), ('Q3.3',46,46,False), ('Q4.1',47,47,True), ('Q4.2',48,48,False),
    ]
    joined = ''.join(pages[p]['wholeText'] for p in range(35,49))
    headers = list(re.finditer(r'^\s*((?:E|Q[1-4])\.\d)\s+([^\n]+)', joined, flags=re.M))
    assert [match.group(1) for match in headers] == [row[0] for row in topic_metadata]
    topic_rows = []
    for index, (topic, first_page, last_page, mandatory) in enumerate(topic_metadata):
        start = headers[index].start()
        end = headers[index+1].start() if index+1 < len(headers) else len(joined)
        raw_section = joined[start:end]
        phase_transition = re.search(r'^\s*Q[1-4]\s+[^\n]+', raw_section, flags=re.M)
        if phase_transition:
            raw_section = raw_section[:phase_transition.start()]
        topic_rows.append({
            'topicCode': topic, 'actualHeading': headers[index].group(0).strip(),
            'mandatoryByWholeOfficialOverview': mandatory,
            'overviewWholePages': [pages[p]['actualWholePage'] for p in (33,34)],
            'contentWholePages': [pages[p]['actualWholePage'] for p in range(first_page,last_page+1)],
            'physicalAndPrintedPageSpan': [first_page,last_page],
            'wholePrimaryTopicSectionIncludingCourseHeadings': raw_section,
            'courseRule': 'LK includes the stated basic-level clauses and separately stated raised-level clauses; not all legacy LK tags are official clauses.',
            'topicSelectionRule': 'Mandatory topics apply subject to actual current-cohort decrees.' if mandatory else 'Additional topic; no universal obligation inferred. Actual explicit selection and course level are required for a learner target claim.',
            'legacySourceGoalIds': [row['id'] for row in extraction['sourceGoals'] if row['topicCode'] == topic],
            'wholeClauseToCurrentAtomicClosure': 'OPEN_NOT_COMPLETED_AT_CHECKPOINT',
        })
    portable['topicMatrix19'] = write('candidate/HE19-whole-primary-topic-and-course-condition.matrix.json', {
        'role': 'actual_primary_topic_condition_candidate_not_complete_goal_scope',
        'topicCount': 19, 'mandatoryTopicCount': 11, 'additionalTopicCount': 8,
        'topics': topic_rows,
        'phaseMandatoryTopicCodes': {'E':['E.1','E.2','E.3'], 'Q1':['Q1.1','Q1.2','Q1.3'], 'Q2':['Q2.1','Q2.3'], 'Q3':['Q3.1','Q3.2'], 'Q4':['Q4.1']},
        'remainingConditions': ['Current-cohort decree emphases/concretisations not inspected.', 'Adjacent-semester timing shifts are not new semantic goal duties.', 'No actual optional-topic choice has been observed.', 'Topic membership does not establish whole-competence coverage of an authored legacy goal.', 'E and Q3 practical duties require actual performance; paper analysis is not executed investigation.'],
        'fullMandatoryLearnerViewComplete': False,
    })
    # Only these bounded findings were actually established from the complete topic pages.
    extras = {
        'ad244d3f-c7f6-47ef-81b0-d9b12e3c683f': 'NGS workflow is not a stated whole Q1.2 clause on page39.',
        '0799dfc3-9782-4641-8994-fca30d9c6c01': 'BLAST/bioinformatics workflow is not a stated whole Q1.2 clause on page39.',
        '549f8f6a-0459-462d-914c-f2c2b883ca28': 'SNP analysis is not a stated whole Q1.2 clause on page39.',
        '66cf434b-fd0a-4cb0-8dbf-5411732b6598': 'Hardy–Weinberg calculation is not a stated whole Q2.1 clause on page42.',
        'b7df39c8-0464-43bb-9b73-9250ade7c1be': 'Fitness-landscape interpretation is not a stated whole Q2.1 clause on page42.',
        'c7cce17d-e85a-47be-896b-538cc21c0240': 'Stochastic ecological modelling is not a stated whole Q4.1 clause on page47.',
        'b56111af-53b3-4cac-8c01-6f9cadce2a0d': 'Metapopulation model competence is not a stated whole Q4.1 clause on page47.',
        '799eac30-65fa-46ac-b819-f5c94785427b': 'Bioinformatic modelling is not a stated whole Q4.1 clause on page47.',
    }
    decisions = {row['sourceGoalId']: row for row in mapping['decisions']}
    review_rows = []
    for source_goal in extraction['sourceGoals']:
        decision = decisions[source_goal['id']]
        targets = decision.get('canonicalGoalIds', [])
        review_rows.append({
            'sourceGoalId': source_goal['id'], 'wholeLegacySourceGoalExact': copy.deepcopy(source_goal),
            'wholeCurrentDecisionExact': copy.deepcopy(decision),
            'wholeCurrentEdgesExact': [copy.deepcopy(edge) for edge in mapping['mappings'] if edge['legacyGoalId'] == source_goal['id']],
            'wholeCurrentCanonicalPartners': [copy.deepcopy(goals[goal_id]) for goal_id in targets],
            'actualWholePrimaryTopicMatrixIndex': next(i for i,r in enumerate(topic_rows) if r['topicCode'] == source_goal['topicCode']),
            'authorFinding': extras.get(source_goal['id']),
            'wholePrimaryRole': 'AUTHORED_EXTRA_NOT_A_WHOLE_STATED_HE_CLAUSE' if source_goal['id'] in extras else 'WHOLE_CURRENT_GOAL_OPERATOR_AND_COURSE_MATCH_OPEN',
            'mandatoryTargetApproval': False, 'independentApproval': False,
            'nextWork': 'Retain competence and every original partner; obtain a genuine whole applicable source role or keep uncovered. Never turn it prerequisiteOnly solely to hide coverage.' if source_goal['id'] in extras else 'Compare every whole official clause/operator/course condition with every whole partner before admitting a mandatory target.',
        })
    portable['source144WholePartnerMatrixStarted'] = write('candidate/HE144-whole-current-goals-and-partners.started-primary-role.matrix.json', {
        'rowCount': 144, 'inputMappingEdgeCount': 157, 'wholeRows': review_rows,
        'boundedAuthoredExtrasIdentified': len(extras), 'wholeClauseClosureCompletedCount': 0,
        'legacyOriginalsChanged': False, 'canonicalGoalsRemoved': [], 'wholeMandatoryViewClaim': False,
    })
    schema = load(original_sources['compositionSchema'])
    scope_keys = list(schema['$defs']['scope']['properties'])
    assert set(scope_keys) == {'schoolForm','jurisdiction','stage','courseProfile','durationModel'}
    code_contexts = []
    for key, ranges in [('compositionService',[(30,49),(489,531)]), ('learnerService',[(9717,9758),(10015,10046)])]:
        text = original_sources[key].read_text().splitlines(keepends=True)
        for first_line,last_line in ranges:
            path = OUT / f'input/code/{key}.lines-{first_line}-{last_line}.actual.txt'
            path.parent.mkdir(parents=True,exist_ok=True)
            path.write_text(''.join(text[first_line-1:last_line]))
            code_contexts.append({'original':source_bindings[key], 'firstLine':first_line,'lastLine':last_line,'actualExactContext':binding(path)})
    portable['selectionBlocker'] = write('candidate/HE-optional-topic-selection.closed-scope-and-runtime.blocker.json', {
        'blockerId': 'HE-OPTIONAL-TOPIC-SELECTION-SCOPE-ABSENT',
        'kind': 'separate_runtime_and_closed_contract_selection_blocker',
        'schemaBinding': source_bindings['compositionSchema'], 'scopePropertiesExactly': scope_keys,
        'additionalScopePropertiesAllowed': schema['$defs']['scope']['additionalProperties'],
        'actualCodeContexts': code_contexts,
        'actualFinding': 'Personal Curriculum derives only schoolForm/jurisdiction/stage/courseProfile/durationModel. No optional-topic selection enters findLearnerScopeView; equal-scope views are sorted by viewId after equal matching scores. That sort is not explicit Q1.5 selection.',
        'standardAndExplicitQ15CanShareScopeButRuntimeCannotDistinguishSelection': True,
        'prohibitedWorkarounds': ['No invented LK+Q1.5 course profile.', 'No lexicographic viewId as user choice.', 'No implicit optional topic duty from LK tags.', 'No prerequisiteOnly tagging to hide authored extras.'],
        'separateBookCatalogBoundary': 'A book-local optional catalogue witness can remain partial and explicitly additional; it is not a universal HE learner target or a Personal Curriculum default.',
        'runtimeOrSchemaChangesPerformed': False,
        'nextAuthorizedContentWork': 'Complete actual mandatory clause/partner matrix independently; keep an explicit selected-topic data variant outside automatic learner indexing until a separately authorised selection mechanism exists.',
    })
    selected_goal_rows = {row['goalId']: row for row in frame['wholeCurrentGoalRows']}
    impact_rows = []
    for role, ids in [('native17', native['goalIds']), ('protected15', native['actualProtectedSourceOrPageReviewIds'])]:
        for goal_id in ids:
            duties = [copy.deepcopy(row) for row in frame['wholeOriginalSourceDutyRows'] if any(g['goalId']==goal_id for g in row['linkedOpenGoals']) or goal_id in row['wholeCanonicalPartnerGoalIds']]
            he_rows = [copy.deepcopy(row) for row in review_rows if goal_id in row['wholeCurrentDecisionExact'].get('canonicalGoalIds', [])]
            optional_hox = goal_id == '9b40dae5-6d89-5714-ac96-373e72a7045e'
            impact_rows.append({
                'goalId': goal_id, 'reviewContextRole': role, 'wholeCurrentCanonicalGoal': copy.deepcopy(goals[goal_id]),
                'wholeOriginal35FrameApplicableDutyRows': duties, 'wholeHE144ApplicableSourcePartnerRows': he_rows,
                'existingSelectedWholeGoalFrame': copy.deepcopy(selected_goal_rows.get(goal_id)),
                'actualKnownQ15SelectionImpact': 'Q1.5 optional Hox/development witness must not become general HE-LK target.' if optional_hox else 'No Q1.5 choice blocker established for this goal; this is not approval of a complete HE or other-state source duty.',
                'choiceSpecificGoalId': optional_hox,
                'wholeAlternateLandesDutyApproval': 'OPEN_NOT_COMPLETED_AT_CHECKPOINT',
                'wholeHEMandatoryTargetApproval': False,
                'nativePageOrPBindingChangesByThisCheckpoint': False,
                'nextWork': 'Read and classify whole applicable original/replacement Landes clauses and partners, retain partial/open duties, then determine source-specific target/context consequences. Reuse valid unchanged D/P/A/M/V bindings.',
            })
    portable['native17Protected15ImpactMatrixStarted'] = write('candidate/native17-and-protected15.whole-source-partner-impact.started.matrix.json', {
        'native17Count':17,'protected15Count':15,'rows':impact_rows,
        'knownChoiceSpecificGoalIds':['9b40dae5-6d89-5714-ac96-373e72a7045e'],
        'native17And15FullSourceClosureComplete':False,
        'currentNativeSealsRebound':False,'strictScientificClosures':0,'restoredBindings':0,
    })
    # Genuine existing bounded views are reused exactly, not inflated into a full E–Q4 view.
    for source_name,name in [
        ('HE-Q1-5-LK-explicitly-selected.view.json','candidate/bounded-existing-fragments/HE-Q1-5-LK-explicitly-selected.view.json'),
        ('HE-LK-Q2-1-limited-core-source-role-preview.view.json','candidate/bounded-existing-fragments/HE-LK-Q2-1-limited-core-source-role-preview.view.json'),
    ]:
        portable[source_name] = exact_copy(SOURCE7 / 'candidate/composition-views' / source_name,name)
    preservation = {
        'inputBindingsStillExact': {key:binding(path)==source_bindings[key] for key,path in original_sources.items()},
        'all144WholeSourceGoalsRetained':len(review_rows)==144,
        'all144WholeDecisionsRetained':all(row['wholeCurrentDecisionExact']==decisions[row['sourceGoalId']] for row in review_rows),
        'all157WholeEdgesRetained':sum(len(row['wholeCurrentEdgesExact']) for row in review_rows)==157,
        'all35DutiesAnd30WholePartnersRetained':load(OUT/'input/original35-duty30-whole-partner-frame.exact.json')==frame,
        'currentCanon479Unchanged':load(OUT/'input/canonical.current479.exact.json')==canon,
        'exactChangedFieldsInSealedOrActiveOriginals':[],
        'newCandidateOnlyFields':['19 whole-primary topic/course-condition rows','144 current-source/whole-partner review rows with8 bounded uncovered extras','32 source-context impact rows still requiring complete whole-duty closure','closed-scope/runtime selection blocker'],
        'noCurrent394KindsOrHumanQAChanges':True,
        'noCurrentNativePageSourceCriteriaOrP17Changes':True,
    }
    assert all(preservation['inputBindingsStillExact'].values())
    portable['exactInputAndSealedOriginalPreservation'] = write('checks/current-and-sealed-originals.exact-preservation-and-additive-diff.json',preservation)
    write('neutral-started-HE-whole-primary-and-scope-checkpoint.entry.json', {
        'schemaVersion':'1.0','role':'started_inactive_author_primary_and_scope_checkpoint_not_complete_HE_view',
        'createdAt':created,'inputFIRST':binding(FIRST),'originalInputs':source_bindings,'portableCandidateInputs':portable,
        'actualWholePrimaryPageCount':16,'actualTopicConditionsCount':19,'mandatoryTopicsCount':11,'additionalTopicsCount':8,
        'preservedCurrentCanonicalGoals':479,'preservedCurrentKinds':394,'preservedWholeOriginalDuties':35,'preservedWholeOriginalPartners':30,
        'currentStrictBiology':{'strictCompleted':299,'currentCurricularAtomic':394},
        'completeMandatoryViewExistsInThisPackage':False,'completeMandatoryViewApproved':False,
        'boundedExistingFragmentsAreNotEtoQ4MandatoryView':True,'fragmentsRegisteredInAutomaticLearnerIndex':False,
        'sourceRoleMatrixStatus':'STARTED; all144 whole rows/partners retained;8 bounded extra-competence findings; complete clause/operator/course matching open.',
        'native17Protected15ImpactStatus':'STARTED; exact whole32 current contexts retained; known Hox optional-selection impact; whole alternative Landes coverage not completed.',
        'openFields':['Full current-cohort decree and actual school optional selection','Whole official clause/operator/course-to-current-goal closure for all144 rows','Actual supported E–Q4 mandatory data view, including practical and still-missing competencies','Explicit Q1.5 full variant, including telomere/cell-aging coverage','Complete whole-source/native17/protected15 classification and genuine other-Landes alternatives','Independent source/view reviews','Separate runtime/schema optional-topic selection feature if needed'],
        'independentApproval':False,'newScientificClosures':0,'restoredBindings':0,'netStrictGain':0,
        'humanApproval':False,'humanTrial':False,'actualLearnerPerformance':False,'activeWrites':[],
        'nextWorkAfterUserResumption':'Finish genuine primary clause/partner matching and independent review. No regional split/RP package was begun for this checkpoint.',
    })
    print(json.dumps({'folder':rel(OUT),'primaryPages':16,'topicRows':19,'sourceRows':144,'edges':157,'impactRows':32,'entry':rel(OUT/'neutral-started-HE-whole-primary-and-scope-checkpoint.entry.json')},ensure_ascii=False))

if __name__ == '__main__':
    main()
