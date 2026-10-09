#!/usr/bin/env python3
"""Seal the completed bounded review and technical evidence without modifying active inputs."""
import datetime
import hashlib
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[6]
AUTHOR = HERE.parent / 'biologie-evolution-systematics-behavior-eighteen-whole-author-v1'

def load(path):
    return json.loads(Path(path).read_text())

def bind(path):
    p = Path(path)
    if not p.is_absolute():
        p = ROOT / p
    data = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def write(name, value):
    p = HERE / name
    assert not p.exists(), f'Immutable output already exists: {p}'
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return bind(p)

def verify(binding):
    actual = bind(binding['path'])
    assert actual['sha256'].removeprefix('sha256:') == binding['sha256'].removeprefix('sha256:'), binding['path']
    if 'bytes' in binding:
        assert actual['bytes'] == binding['bytes'], binding['path']
    return actual

first_path = HERE / 'whole18-science-source-P.independent-c.scientific-FIRST.freeze.json'
first = load(first_path)
initial = load(HERE / 'whole18-exact-input.independent-c.first.freeze.json')
author_seals = [load(AUTHOR / 'eighteen-whole-author.input.first.freeze.json'), load(AUTHOR / 'eighteen-whole-science-material-author.first.freeze.json')]
declarations = initial['bindings'] + first['inputBindings'] + first['ownOutputBindings'] + [b for s in author_seals for b in s['files']]
verified = {b['path']: verify(b) for b in declarations}
raw = load(AUTHOR / 'input/whole-current18-source35-and-whole-partners30.exact-neutral-input.json')
material = load(AUTHOR / 'eighteen-whole36-bilingual-cases-and-P.author-candidate.json')
routes = load(HERE / 'current35-ordinary-source-routes-and-eight-authored-views.actual.json')
for row in raw['sourceBindingsActual']:
    verified[row['expected']['path']] = verify(row['expected'])
canonical_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
canonical = load(canonical_path)
assert canonical == load(AUTHOR / 'input/current-canonical479-root23-successor.snapshot.json')
assert len(canonical['goals']) == 479
goals = {g['id']: g for g in canonical['goals']}
selected = {e['goalId'] for e in material['entries']}
assert len(selected) == 18
for e in material['entries']:
    assert e['wholeCurrentGoal'] == goals[e['goalId']]
    expected = {x['id']: x for x in e['wholeProfile']['expectations']}
    for c in e['newAuthoredWholeCases']:
        assert c['actualExperimentPerformed'] is False and c['actualLearnerPerformance'] is False
        for r in c['rubric']:
            assert r['rubricScope'] == 'pair_reference_not_single_case_quota'
            assert r['criterionDe'] == expected[r['expectationId']]['observablePerformanceDe']
            assert r['criterionEn'] == expected[r['expectationId']]['observablePerformanceEn']
for p in raw['wholeOriginalAndCurrentPartnerGoals']:
    assert goals[p['goalId']] == p['wholeCurrentGoal'] == p['wholeOriginalFrameGoal']
report_path = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-molecular-genetics-reviewed-integration-root-v1/checks/current-central-all-four-stable.stdout.actual.txt'
text = report_path.read_text()
report = json.JSONDecoder().raw_decode(text[text.index('{'):])[0]
bio = next(s for s in report['subjects'] if s['subject'] == 'biologie')
assert bio['denominator'] == 394 and bio['strictComplete'] == 299
assert selected.isdisjoint(bio['strictCompleteGoalIds'])
assert all(g in goals for g in bio['strictCompleteGoalIds'])
own_profiles = [json.loads(s) for s in (HERE / 'checks/P18-bounded-whole-text.independent-c.records.jsonl').read_text().splitlines() if s.strip()]
author_profiles = {r['goalId']: r for r in (json.loads(s) for s in (AUTHOR / 'eighteen-whole-positive.author-candidate.review.jsonl').read_text().splitlines() if s.strip())}
assert len(own_profiles) == 18
for r in own_profiles:
    assert r['profile'] == author_profiles[r['goalId']]['profile']
    assert all(r[k] == author_profiles[r['goalId']][k] for k in ['goalFingerprint', 'reviewInputFingerprint', 'profileFingerprint', 'reviewCriteriaFingerprint'])
    assert r['status'] == 'needs_human_review' and r['reviewAuthority'] == 'ai_candidate'
    assert r['evidenceLevel'] == 'E1' and r['maximumClaimScope'] == 'G1' and r['reviewRunIds'] == []

held = load(HERE / 'whole18-source35-partners30-P18-cases36.independent-c.scientific-FIRST.verdict.json')['sourceAndOperatorHolds']
classifications = [
    ('operative_source_atlas_HE_LK_literal_and_course',
     'The unchanged historical extraction is an actual current atlas input: HE/SekII/LK directly maps the whole flow goal. This is not a flaw in the correct constructed migration calculation, nor proof that the whole competence has no legitimate source anywhere.',
     ['HE physical/printed38 Q1.1 and Q2.1 physical/printed42, whole course columns'],
     'Bind a genuinely reviewed current official clause/course that supports the intended flow competence, or honestly scoped complementary evolution roles with the retained whole-duty limits. Correct the operative extraction/decision span and course placement if unsupported. Q1.1.9 cannot be retained as a literal current official quote merely because the old canon has the same own description.'),
    ('operative_source_atlas_HE_LK_optional_topic_and_historical_span',
     'The atlas actually maps Hox to HE/SekII/LK using Q2.2.7; current Hox/homeobox is Q1.5 LK, an optional field under the stated Q1 obligatory1-3. Whole goal/P is scientifically coherent; its current official locus and compulsory status are not established by the old row.',
     ['HE physical/printed38 Q1 obligatory1-3; physical/printed40 Q1.5 LK; physical/printed42 Q2.2 course columns'],
     'Review and materialize a current primary-bound Q1.5 LK partial role with explicit option/elective limits and retained old partner/scope provenance; demonstrate that the actual learner target/course route does not turn the optional field into universal compulsory LK. Preserve valid scientific material and old historical extraction.'),
    ('operative_source_atlas_HE_LK_and_GK_LK_literal_span_fidelity',
     'The two old HE rows directly place fossil dating in HE/SekII/LK and the theories competence in HE/SekII/GK+LK. The current printed42 whole Q2.1/Q2.2 differs from the synthetic old numbered clauses. This is an operative source citation issue; the independent scientific worked material remains supported.',
     ['HE physical/printed42 Q2.1 fundamental/LK and Q2.2 fundamental/LK'],
     'Use actual current Q2.1 fossil/history/tree and synthetic-theory/non-scientific-distinction passages as only the roles they really support; retain dating-method own-transfer limits rather than inventing an explicit dating clause. Review any whole competency coverage and course/optional placement separately. Exact source-text/span successors require genuine independent review; a new hash or reviewer name is insufficient.'),
    ('whole_partner_union_practical_operator_evidence_not_material_defect',
     'Current ST/SN atlas inputs preserve broad original partner unions. These18 synthetic analyses are not claimed to perform all original natural-object observation, microscopy, model experiment or software-simulation operations. The present P18 text/material body review does not independently close those wider original source obligations.',
     ['ST physical44/45 school-year10; SN physical42/43/44 class10 LB2/LB3 and affected wider context'],
     'Keep the full original partner union and obtain actual executable, source-faithful observation/microscopy/modelling/simulation task/media/evaluation evidence for the partner competencies which own these operations. A performed-human claim requires actual human evidence; a constructed dataset alone cannot discharge a demanded operation. Do not add an extra task quota to the selected18 or silently discard the wider duties.'),
    ('operative_source_atlas_RP_single_partner_semantic_coverage_gap',
     'Current RP/SekI directly routes the entire ancestry-to-selected-human-behaviour duty solely to430b. That whole goal and its fossil/cultural-change cases do not fully require the specific ancestry-to-behaviour explanation. This is a real whole-duty/target mismatch, not merely a missing raw page number.',
     ['RP physical48/printed46 TF12 whole source competence and its stress example'],
     'Provide a reviewed appropriate existing SekI whole competence/partial partner route which actually requires explaining selected human behaviour from ancestry, or prepare a justified bounded companion if no such goal exists. Preserve430b fossil/culture contributions and the whole duty. Do not substitute an upper LK primate goal or declare the single existing edge complete without the missing assessable evidence.'),
    ('operative_reference_metadata_page_offset_and_whole_partner_scope',
     'The page references S25/S45 belong to current retained RP extraction/mapping inputs, while actual affected PDF pages28/48 are printed26/46. The numbering correction itself need not change goal semantics, but neither number repair nor these18 cases establishes whole TF2/TF12 coverage.',
     ['RP physical28/printed26 TF2; physical48/printed46 TF12'],
     'Make a new precise primary-bound reference successor, preserving every exact old competence/edge/partner and declaring only the page/ref correction. Independently verify the corrected locator. Whole TF2/TF12 operator/partner completeness is a separate retained requirement, including the ancestry/behaviour gap above.'),
    ('operative_current_SekI_source_atlas_and_authored_target_scope',
     'Current MV/SN/ST/TH SekI source unions and actual authored SekI views contain whole1e78 EA primate extension, c2f8 cultural-selection extension and9dff historical/current upper systematics comparison. Source tags and broad evolution unions do not by themselves demonstrate these whole advanced targets. Actual ordinary view compilation confirms target roles, so this cannot be dismissed as historical raw source prose.',
     ['MV physical31/32; SH physical30/printed28; SN physical42/43/44; ST physical44/45; TH physical30/31 printed24/25; BY12 exact GA/EA3.1/3.2'],
     'Review explicit current source-supported lower-stage components against the whole advanced target text and original full partner duties. Correct ordinary source-role/placement references or use justified assessable basis competencies if genuinely needed. Preserve all true regional required content and the BY EA distinction; do not infer prerequisiteOnly from phase or reduce the intended target denominator to hide a gap.'),
]
assert len(held) == len(classifications) == 7
holding_rows = []
for h, (kind, effect, pages, close) in zip(held, classifications):
    related = [r for r in routes['original35DutyRows'] if r['rowId'] in h['duties']]
    holding_rows.append({
        **h, 'classification': kind, 'actualCurrentEffect': effect,
        'actualPrimaryLociRead': pages, 'necessaryClosureEvidence': close,
        'currentOrdinaryDutyRoutes': related, 'newMaterialOrGoalRewriteRequiredByThisReview': False,
        'historicalFirstJudgmentUnchanged': True, 'sourceOrPlacementApproval': False,
    })
write('seven-source-holds.current-operative-vs-material-scope-and-closure-evidence.actual.json', {
    'schemaVersion': 1, 'role': 'Technical localization and closure-evidence explanation of the seven already first-sealed findings; no new source approval or candidate change',
    'createdAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'originalFirstVerdict': bind(HERE / 'whole18-source35-partners30-P18-cases36.independent-c.scientific-FIRST.verdict.json'),
    'currentOrdinaryRoutesAndViews': bind(HERE / 'current35-ordinary-source-routes-and-eight-authored-views.actual.json'),
    'findings': holding_rows, 'all35OriginalDutyRowsAnd30PartnersRetained': True,
    'ownBoundedMaterialP18Supported': True, 'wholeSourceApproved': False, 'activeWrites': [],
})

own_jsons = sorted(HERE.rglob('*.json'))
own_jsonls = sorted(HERE.rglob('*.jsonl'))
for p in own_jsons:
    load(p)
for p in own_jsonls:
    for s in p.read_text().splitlines():
        if s.strip():
            json.loads(s)
sys.path.insert(0, str(ROOT / 'scripts'))
from validate_schemas import curriculum_symlink_errors
symlink_errors = curriculum_symlink_errors(ROOT)
assert not symlink_errors, symlink_errors
primaries = load(AUTHOR / 'primary/ten-original-primary-topic-contexts.author-reading.receipt.json')['rows']
primary_paths = [r['originalPDF']['path'] for r in primaries] + [str((AUTHOR / 'primary/HE-current2025.actual-official.pdf').relative_to(ROOT))]
ignored = subprocess.run(['git', 'check-ignore', '--stdin'], input=('\n'.join(primary_paths) + '\n').encode(), cwd=ROOT, capture_output=True, check=False)
assert ignored.returncode in [0, 1], ignored.stderr.decode()
ignored_paths = set(ignored.stdout.decode().splitlines())
primary_status = []
for path in primary_paths:
    p = ROOT / path
    indexed = subprocess.run(['git', 'ls-files', '--error-unmatch', '--', path], cwd=ROOT, capture_output=True, check=False).returncode == 0
    primary_status.append({'binding': bind(p), 'actuallyTrackedOrInIndex': indexed, 'gitCheckIgnoreWithoutNoIndex': path in ignored_paths, 'claim': 'Retained original local working PDF cache when untracked/ignored; actual reference and exact independently extracted topic texts are bound. No PDF tracking/publication/relicensing claim.'})
normal_checks = []
commands = [
    ('P18-author-candidate', 'positiveGoalEvidenceReview.ts', AUTHOR / 'eighteen-whole-positive.author-candidate.config.json', 'P18'),
    ('A18-original-exact-reuse', 'semanticAtomicityReview.ts', AUTHOR / 'A18-existing-records.exact-reuse.config.json', 'A18'),
    ('M18-original-exact-reuse', 'memoryCardReview.ts', AUTHOR / 'M18-existing-records.exact-reuse.config.json', 'M18'),
    ('M18-eight-current-visibility-scopes', 'memoryCardReview.ts', HERE / 'checks/M18-eight-existing-visibility-scopes.current-config.json', 'M18-eight-visibility-scopes'),
]
for label, script, config, prefix in commands:
    normal_checks.append({'label': label, 'argv': ['app/node_modules/.bin/tsx', f'app/scripts/{script}', '--mode=check', '--config=' + str(config.relative_to(ROOT))], 'actualExitCodeObservedInThisReview': 0, 'stdout': bind(HERE / f'checks/{prefix}.ordinary-check.actual.stdout.txt'), 'stderr': bind(HERE / f'checks/{prefix}.ordinary-check.actual.stderr.txt'), 'config': bind(config), 'receiptCapture': 'Observed actual prior execution in this reviewer turn; compact receipt written after own scientific FIRST, not a rerun or backdated event.'})
normal_checks.append(load(HERE / 'checks/P18-bounded-whole-text.independent-c.ordinary-check.actual.terminal.json'))
summary = write('actual-bounded-cli-portability-schema-first-and-current-countercheck.independent-c.json', {
    'schemaVersion': 1, 'role': 'Completed scoped checks; preservation/portability evidence is technical, not scientific approval',
    'createdAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'ordinaryChecks': normal_checks,
    'ownJsonFilesParsedBeforeReceipt': len(own_jsons), 'ownJsonlFilesParsedBeforeReceipt': len(own_jsonls),
    'current479CanonicalWholeValueExact': True, 'current18GoalsAnd30PartnersWholeValueExact': True,
    'originalFirstAndAuthorSealUniqueArtifactsByteVerified': len(verified), 'originalFirstsUnchanged': True,
    'current394BaselineStrictComplete': 299, 'protected299DisjointSelected18': True,
    'baselineReport': bind(report_path), 'canonicalBinding': bind(canonical_path),
    'all35CurrentMappingDecisionsAndEdgesValueExact': True, 'sourceInputBindings': list(verified.values()),
    'own18PBodyAndFourFingerprintsExact': True, 'all36CasesRemainSyntheticNoPerformanceClaims': True,
    'all36RubricsPairLevelExact': True,
    'profileBriefCorrespondenceClarification': 'All36 actual correspondence rows report exact equality. The earlier bound receipt explanatory text incorrectly singles out ordinal1; its original bytes are preserved and no new case/profile correction is made.',
    'originalAM18Reuse': bind(HERE / 'current479-and-original-AM18-exact-preservation.actual.json'),
    'memory': {'existingScopesActuallyChecked': 8, 'cardRowsParsedByRegularCLI': 54, 'deckFiles': 6, 'requiredMemoryGoalsInSelected18': 0, 'cardsRequiredInSelected18': 0, 'visibilityFailures': 0, 'full394OrAll27CardsNewlyReviewed': False},
    'curriculumSymlinkErrors': symlink_errors,
    'actualPrimaryPDFPortabilityStatus': primary_status,
    'tenOriginalPrimaryPDFTopicPagesIndependentlyExtracted': sum(len(r['actualPhysicalPages']) for r in primaries),
    'additionalActualHHOriginPage': bind(HERE / 'primary/HH-physical-027.independent-layout.actual.txt'),
    'activeWrites': [], 'stagingOrCommitOrPush': False, 'strictGain': 0,
})
entry_name = 'completed-whole18-source35-partners30-P18-cases36-independent-c.neutral-integration.entry.json'
entry = write(entry_name, {
    'schemaVersion': 1, 'role': 'Completed genuine independent C whole18 scientific/source/material review; exact bounded P/AM checks with operative source HOLDs',
    'reviewer': '/root/biology_resume_candidate; independent of authorA and fresh peer Evo18 judgments',
    'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'selectedGoalIds': sorted(selected),
    'originalNeutralAuthorEntry': bind(AUTHOR / 'neutral-whole18-source35-partners30-P18-cases36.author-independent-review.entry.json'),
    'ownInitialInputFirst': bind(HERE / 'whole18-exact-input.independent-c.first.freeze.json'),
    'ownScientificFirstVerdict': bind(HERE / 'whole18-source35-partners30-P18-cases36.independent-c.scientific-FIRST.verdict.json'),
    'ownScientificFirstFreeze': bind(first_path),
    'originalWhole18GoalSource35Partner30Input': bind(AUTHOR / 'input/whole-current18-source35-and-whole-partners30.exact-neutral-input.json'),
    'whole18Profiles36CasesActuallyReviewed': bind(AUTHOR / 'eighteen-whole36-bilingual-cases-and-P.author-candidate.json'),
    'normalIndependentBoundedP18Config': bind(HERE / 'checks/P18-bounded-whole-text.independent-c.config.json'),
    'normalIndependentBoundedP18Records': bind(HERE / 'checks/P18-bounded-whole-text.independent-c.records.jsonl'),
    'normalIndependentBoundedP18Terminal': bind(HERE / 'checks/P18-bounded-whole-text.independent-c.ordinary-check.actual.terminal.json'),
    'normalP18Status': {'approved': 0, 'needs_human_review': 18, 'authority': 'ai_candidate', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'nativeOrRasterApproval': False, 'reviewRunManifestsInvented': False},
    'existingAM18ExactlyPreserved': bind(HERE / 'current479-and-original-AM18-exact-preservation.actual.json'),
    'normalM18EightExistingVisibilityScopes': bind(HERE / 'checks/M18-eight-existing-visibility-scopes.current-config.json'),
    'ordinaryCurrentSourceRoutesAndAuthoredTargetViews': bind(HERE / 'current35-ordinary-source-routes-and-eight-authored-views.actual.json'),
    'sevenFirstSealedSourceHoldsWithOperativeLocalizationAndNecessaryClosureEvidence': bind(HERE / 'seven-source-holds.current-operative-vs-material-scope-and-closure-evidence.actual.json'),
    'actualPrimaryWholeTopicReextractions': bind(HERE / 'primary/ten-original-PDF-whole-topic.reextraction.independent-c.actual.json'),
    'actualHEOriginalCourseColumnsSeen': bind(HERE / 'primary/HE-three-actual-course-columns.independent-c.view-inputs.json'),
    'additionalHHOriginAndHEWholePages': bind(HERE / 'primary/four-current-course-origin-pages.independent-c.actual-reextraction.receipt.json'),
    'actualScopedCLIAndOriginalByteAndCurrentWholeBaselineCheck': summary,
    'counts': {'wholeGoals': 18, 'wholeBilingualCases': 36, 'wholeOriginalSourceDuties': 35, 'wholePartners': 30, 'supportedBoundedMaterialCandidates': 18, 'newBlockingMaterialFindings': 0, 'remainingSourceCourseOperatorFindings': 7, 'newAMDecisions': 0, 'strictGain': 0},
    'remaining': ['18 actual raster independent V', 'native18 actual current pages and two D reviews', 'current raster/native P review', 'operative source span/course/placement and wider original practical/content duty completeness', 'root guarded integration only after required proofs', 'human approval/trial'],
    'freshPeerEvo18OutcomesRead': False, 'authorOpinionsUsedAsAuthority': False,
    'currentProtectedBaseline': {'canonicalNodes': 479, 'curricularAtoms': 394, 'bioStrictComplete': 299},
    'wholeSourceApproved': False, 'wholeCourseApproved': False, 'currentNativeApproved': False,
    'currentVApproved': False, 'humanApproval': False, 'humanTrial': False, 'actualExperimentPerformed': False,
    'actualLearnerPerformance': False, 'activeWrites': [], 'stagedOrCommittedOrPushed': False,
})
outputs = [bind(p) for p in sorted(HERE.rglob('*')) if p.is_file()]
freeze = write('completed-whole18-independent-c.final.freeze.json', {
    'schemaVersion': 1, 'role': 'Final immutable technical handoff; actual scientific/input FIRSTs unchanged',
    'createdAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'reviewer': '/root/biology_resume_candidate',
    'originalScientificFirstFreeze': bind(first_path), 'outputs': outputs,
    'verifiedOriginalInputBindings': list(verified.values()),
    'currentRuntimeReadOnlyBindings': [bind(canonical_path), bind(ROOT / 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'), bind(ROOT / 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'), bind(ROOT / 'app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas/source-projection.receipt.json')],
    'localOriginalPDFWorkingCachesNotClaimedTracked': primary_status,
    'freshPeerEvo18OutcomesRead': False, 'activeWrites': [], 'strictGain': 0,
})
print(json.dumps({'entry': entry, 'finalFreeze': freeze, 'outputs': len(outputs), 'originalVerifiedInputArtifacts': len(verified), 'wholeBoundedMaterialCandidates': 18, 'remainingSourceHolds': 7, 'strictGain': 0}, indent=2))
