"""Verify exact material/goal/image bindings and seal seven author candidates."""
import datetime
import hashlib
import json
from pathlib import Path

REPO = Path.cwd()
ROOT = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06'
BASE = ROOT / 'biologie-q1-seven-final-native-positive-author-v1'
INPUT = ROOT / 'biologie-q1-seven-final-native-review-inputs-author-v1'
FREEZE = BASE / 'native-positive-author-v1.final.freeze.json'
if FREEZE.exists():
    raise SystemExit('Frozen package; use a new continuation.')


def read(path):
    return json.loads(Path(path).read_text())


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def bind(path):
    path = Path(path)
    return dict(path=str(path.relative_to(REPO)), sha256=digest(path), bytes=path.stat().st_size)


def verify(binding):
    path = REPO / binding['path']
    assert digest(path) == binding['sha256'].removeprefix('sha256:'), str(path)
    return path


input_freeze = read(INPUT / 'final-native-review-inputs.author-v1.freeze.json')
assert digest(INPUT / 'final-native-review-inputs.author-v1.freeze.json') == '7594c80e665828238463b965f12b18df845a3c17fbfe19dc17e1ed35a5247d70'
for item in input_freeze['files']:
    path = INPUT / item['path']
    assert digest(path) == item['sha256'], str(path)
inputs = read(INPUT / 'inputs/positive-review-inputs.native-fingerprints.pending.json')
source_material_path = verify(inputs['sourceMaterial'])
source_material = read(source_material_path)
snapshot = read(verify(inputs['sevenGoalSixteenCaseSourceSnapshot']))
profiles_path = BASE / 'positive-evidence.seven.author-candidates.review.jsonl'
profiles = [json.loads(line) for line in profiles_path.read_text().splitlines()]
assert len(profiles) == 7
by_goal = {record['goalId']: record for record in profiles}
science_a_path = ROOT / 'biologie-q1-seven-native-v6-independent-a-v1/seven-science-atomicity-prerequisite-memory.review.json'
science_b_path = ROOT / 'biologie-q1-seven-native-v7-independent-b-v1/seven-science-operator-atomicity-prerequisite.review.json'
cases_b_path = ROOT / 'biologie-q1-seven-native-v7-independent-b-v1/sixteen-complete-material-and-final-uuid-bindings.review.json'
science_a = read(science_a_path)
science_b = read(science_b_path)
cases_b = read(cases_b_path)
assert science_b['keep'] == 7 and cases_b['caseCount'] == 16

expectation_coverage = {
    'classical-carriers-a': ['nested-carrier-roles', 'multiple-sections-one-chromosome'],
    'classical-carriers-b': ['nested-carrier-roles', 'preserved-structure-in-variant-model'],
    'levels-a': ['identify-change-level', 'given-causes-and-information', 'measured-function-bounded'],
    'levels-b': ['identify-change-level', 'given-causes-and-information', 'measured-function-bounded'],
    'point-genome-a': ['single-base-pair-position', 'whole-chromosome-number', 'independent-evidence-scales'],
    'point-genome-b': ['single-base-pair-position', 'whole-chromosome-number', 'independent-evidence-scales'],
    'mutagen-protection-a': ['damage-to-persistent-change', 'material-backed-comparison', 'matching-protection-and-limits'],
    'mutagen-protection-b': ['damage-to-persistent-change', 'material-backed-comparison', 'matching-protection-and-limits'],
    'everyday-uv-risk-decision-c': ['damage-to-persistent-change', 'material-backed-comparison', 'criteria-based-risk-and-action', 'matching-protection-and-limits'],
    'environment-air-pah-risk-decision-d': ['damage-to-persistent-change', 'material-backed-comparison', 'criteria-based-risk-and-action', 'matching-protection-and-limits'],
    'lineage-a': ['trace-separated-lineages', 'conditional-offspring-transmission'],
    'lineage-b': ['trace-separated-lineages', 'time-and-distribution', 'conditional-offspring-transmission'],
    'mutation-modification-a': ['genotype-environment-controls', 'genetic-change-and-appearance'],
    'mutation-modification-b': ['genetic-change-and-appearance', 'coexisting-contributions-and-causal-limits'],
    'repair-a': ['template-based-correction', 'checking-repair-information', 'mismatch-not-yet-fixed-mutation'],
    'repair-b': ['template-based-correction', 'checking-repair-information', 'mismatch-not-yet-fixed-mutation'],
}
rows = []
count_cases = 0
for row in inputs['rows']:
    goal_id = row['goalId']
    goal = row['wholeCurrentCandidateGoal']
    record = by_goal[goal_id]
    assert record['goalFingerprint'] == row['goalFingerprint']
    assert record['reviewInputFingerprint'] == row['reviewInputFingerprint']
    assert record['reviewCriteriaFingerprint'] == row['reviewCriteriaFingerprint']
    assert record['status'] == 'needs_human_review' and record['reviewAuthority'] == 'ai_candidate'
    assert record['evidenceLevel'] == 'E1' and record['maximumClaimScope'] == 'G1' and record['reviewRunIds'] == []
    verify(row['actualSelectedAsset'])
    a = next(g for g in science_a['goals'] if g['goalId'] == goal_id)
    b = next(g for g in science_b['goals'] if g['goalId'] == goal_id)
    assert a['descriptionAndSemanticAtomicityDecision'] == 'KEEP' and b['verdict'] == 'KEEP'
    assert a['descriptionDE'] == goal['description'] and a['descriptionEN'] == goal['descriptionEn']
    assert b['title'] == goal['title'] and b['titleEn'] == goal['titleEn']
    assert b['description'] == goal['description'] and b['descriptionEn'] == goal['descriptionEn']
    cases = []
    required = set(record['profile']['coverageExpectations']['requiredExpectationIds'])
    covered = set()
    for case_input in row['currentSourceCaseBodies']:
        value = source_material
        for token in case_input['JSONPointer'].split('/')[1:]:
            value = value[int(token)] if isinstance(value, list) else value[token]
        assert value == case_input['caseBody']
        matching_snapshot = next(r for r in snapshot['rows'] if r['goalId'] == goal_id)
        assert case_input in matching_snapshot['cases']
        key = value.get('caseId', value.get('caseKey'))
        old_b = next(r for r in cases_b['rows'] if r['goalId'] == goal_id and r['caseKey'] == key)
        assert old_b['bodyExactVsOriginalV5'] is True
        assert old_b['actualCaseBodyCanonicalJSONSHA256'] == case_input['caseBodyCanonicalJSONSHA256']
        assert old_b['JSONPointer'] == case_input['JSONPointer']
        brief = next(c for c in record['profile']['applicationCaseBriefs'] if c['id'] == key)
        covered.update(expectation_coverage[key])
        assert set(expectation_coverage[key]) <= required
        cases.append(dict(caseKey=key, originalSourceJSONPointer=case_input['JSONPointer'],
            caseBodyCanonicalJSONSHA256=case_input['caseBodyCanonicalJSONSHA256'],
            completeUnchangedCaseBody=value, actualAuthoredApplicationCaseBrief=brief,
            supportsExpectationIds=expectation_coverage[key], independentExistingBMaterialReview=bind(cases_b_path),
            sourceBodyExact=True, newMaterialInvented=False))
        count_cases += 1
    assert required <= covered
    rows.append(dict(goalId=goal_id, title=goal['title'], titleEn=goal['titleEn'],
        description=goal['description'], descriptionEn=goal['descriptionEn'],
        wholeNativeCurrentCandidateGoal=goal,
        goalFingerprint=record['goalFingerprint'], reviewInputFingerprint=record['reviewInputFingerprint'],
        profileFingerprint=record['profileFingerprint'], actualSelectedAsset=row['actualSelectedAsset'],
        resourceDigests=row['resourceDigests'], cases=cases,
        requiredExpectationIdsCoveredByOriginalMaterials=True,
        unchangedScientificTextsBoundToExistingIndependentAAndB=True,
        existingScientificReviewReferences=[bind(science_a_path), bind(science_b_path)],
        theseExistingMaterialReviewsAreNotIndependentPProfileApproval=True))
assert count_cases == 16
source_review_references = [
    ROOT / 'biologie-q1-seven-native-v6-independent-a-v1/independent-a.final.freeze.json',
    ROOT / 'biologie-q1-eleven-source-topic-v7-independent-a-followup-v1/independent-a-followup.current-v2.final.freeze.json',
    ROOT / 'biologie-q1-mv-heading-location-v8-independent-a-followup-v1/independent-a-v8-heading-followup.final.freeze.json',
    ROOT / 'biologie-q1-seven-native-v7-independent-b-v1/independent-b-v7.first-pass.final.freeze.json',
    ROOT / 'biologie-q1-seven-native-v7-independent-b-v1/independent-b-v8-targeted-followup.final.freeze.json',
    REPO / 'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-q1-seven-new-visuals-independent-v-qa-v1/independent-visual-review.final.freeze.json',
]
current_guards = read(INPUT / 'qa-artifacts/native-input-and-preservation-verification.actual.json')['original19InputsBefore']
for item in current_guards:
    verify(item)
checks = read(BASE / 'native-targeted-profile-schema-semantics-and-binding-checks.actual.json')
assert checks['authoredProfiles'] == 7 and checks['actualMaterialCasesUsed'] == 16
assert checks['closedNativeSchemaErrors'] == 0 and checks['exactNativeSemanticErrorsWithActualIsolatedPNGDigests'] == 0
allowed_error_fragments = ['goal-visualization asset is missing at', 'stale reviewInputFingerprint; expected']
assert len(checks['unchangedNativeFullCheckerErrors']) == 14
assert all(any(fragment in error for fragment in allowed_error_fragments) for error in checks['unchangedNativeFullCheckerErrors'])
input_bindings = [bind(INPUT / 'final-native-review-inputs.author-v1.freeze.json'),
                  bind(INPUT / 'inputs/positive-review-inputs.native-fingerprints.pending.json'),
                  bind(INPUT / 'inputs/positive-evidence.pending.config.json'),
                  bind(science_a_path), bind(science_b_path), bind(cases_b_path),
                  bind(source_material_path), *[bind(path) for path in source_review_references],
                  *[bind(verify(item)) for item in current_guards]]
for key in ['subjectCriteria', 'authoringPrompt', 'outputSchema', 'sevenGoalSixteenCaseSourceSnapshot', 'nativeFingerprintHelpers']:
    input_bindings.append(bind(verify(inputs[key])))
for row in inputs['rows']:
    input_bindings.append(bind(verify(row['actualSelectedAsset'])))
for item in checks['unchangedProductionHelpers']:
    input_bindings.append(bind(verify(item)))
material_artifact = dict(schemaVersion=1, createdAtUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(),
    role='author exact current material-to-profile coverage proof; independent P reviews pending',
    originalSourceMaterial=bind(source_material_path), sourceCasesUsed=16, sourceCasesInvented=0,
    sourceCasesEdited=0, rows=rows, existingSourceReviewFreezes=[bind(path) for path in source_review_references],
    sourceReviewScope='Reuse unchanged seven scientific texts and sixteen whole materials. Source metadata uses v7 with the separate v8 MV locator correction and its exact followups; the superseded v7 MV locator decision is not asserted as current approval.',
    original19ActiveInputsExact=True, sourceInputFreezeOwnFilesExact=True,
    independentPReviewComplete=False, activeWrites=False, humanApproval=False, humanTrial=False, learnerEvidence=False)
(BASE / 'sixteen-complete-materials-and-existing-independent-review-bindings.actual.json').write_text(json.dumps(material_artifact, ensure_ascii=False, indent=2)+'\n')
request = dict(schemaVersion=1, role='independent A/B scientific P review request, not a result',
    candidateReview=bind(profiles_path), candidateConfig=bind(BASE/'positive-evidence.seven.author-candidates.config.json'),
    exactMaterialsAndCaseCoverage=bind(BASE/'sixteen-complete-materials-and-existing-independent-review-bindings.actual.json'),
    subjectCriteria=inputs['subjectCriteria'], authoringPrompt=inputs['authoringPrompt'],
    exactNativeSourceInputFreeze=bind(INPUT/'final-native-review-inputs.author-v1.freeze.json'),
    goalIds=[r['goalId'] for r in profiles], requiredTrueStatus='ai_candidate / needs_human_review',
    requiredChecks=['exact seven current DE/EN goal scope and prerequisite/source boundaries',
        'individual essential understanding, observable performance and meaningful transfer axes',
        'all sixteen unchanged complete material/data/task/solution bodies versus each authored case brief',
        'DE/EN equivalence and concrete expected findings, controls and material-specific limits',
        'no misconception catalogue, sibling competence donation, learner evidence or human approval',
        'actual isolated PNG/hash and native criteria/goal/review-input/profile fingerprints',
        'separate substantive P issues from only active-public-image-resolution holds'],
    blindToOtherIndependentPReview=True, twoIndependentReviewsStillRequired=True,
    activeIntegrationForbiddenForThisAuthorPackage=True,
    noAutomaticScientificApprovalFromSchemaPass=True, learnerDataAllowed=False)
(BASE/'independent-p-review-request.actual-inputs.json').write_text(json.dumps(request,indent=2)+'\n')
own_files = [dict(path=str(p.relative_to(BASE)),sha256=digest(p),bytes=p.stat().st_size)
             for p in sorted(BASE.rglob('*')) if p.is_file()]
freeze = dict(schemaVersion=1,createdAtUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(),
    role='seven actual frozen author P-v2 candidates; independent A/B P review pending',
    files=own_files,ownFileCount=len(own_files),ownBytes=sum(f['bytes'] for f in own_files),
    inputBindings=list({r['path']:r for r in input_bindings}.values()),
    actualNativeProfileCount=7, unchangedCompleteMaterialCaseCount=16,
    goalIds=[r['goalId'] for r in profiles], profileBindings=[dict(goalId=r['goalId'],goalFingerprint=r['goalFingerprint'],reviewInputFingerprint=r['reviewInputFingerprint'],profileFingerprint=r['profileFingerprint']) for r in profiles],
    allStatuses='needs_human_review',allAuthorities='ai_candidate',evidenceLevel='E1',maximumClaimScope='G1',
    exactClosedNativeSchemaAndSemanticsWithActualIsolatedPNGs='PASS7',
    fullNativeChecker='HOLD_ACTIVE_IMAGE_BINDINGS',independentPReviewComplete=False,
    original19ActiveInputsUnchanged=True,historicalReviewArtifactsUnchanged=True,
    newPNGGenerated=0,newMaterialCasesInvented=0,activeWrites=False,
    newScientificCompletions=0,restoredActiveBindings=0,strictNetGain=0,
    humanApproval=False,humanTrial=False,learnerEvidence=False,publicationOrDeployment=False,integrableNow=False)
FREEZE.write_text(json.dumps(freeze,indent=2)+'\n')
print(json.dumps(dict(freeze=str(FREEZE.relative_to(REPO)),sha256=digest(FREEZE),
    actualProfiles=7,unchangedMaterialCases=16,ownFileCount=len(own_files),ownBytes=freeze['ownBytes'],
    exactNativeSchemaAndSemantics='PASS7',independentPReviewComplete=False,strictGain=0)))
