#!/usr/bin/env python3
"""Apache-2.0: exact finite review checks; scientific review prose is CC-BY-4.0."""
import hashlib
import importlib.util
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path
import jsonschema

ROOT = Path('/home/enpasos/projects/skillpilot')
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-HB19-neighbor021-original-operator-source-cell-author-20261014-v1'
OWN = Path(__file__).parent
START = '2026-10-13T23:41:28Z'
SOURCE_ID = 'hb-chemistry-sekii-gyo2022-3-2-e-kunststoffe-021-1788da45'
GOAL_ID = '2652caef-b557-58b9-9b28-70db62625ce5'
def read(p):
    return json.loads(p.read_text(), parse_constant=lambda s: (_ for _ in ()).throw(ValueError(s)))
def digest(p):
    return 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
def binding(p):
    return {'path': str(p.relative_to(ROOT)), 'bytes': p.stat().st_size, 'sha256': digest(p)}
def write(name, v):
    p = OWN / name
    p.parent.mkdir(exist_ok=True, parents=True)
    p.write_text(json.dumps(v, ensure_ascii=False, indent=2, allow_nan=False) + '\n')
    return p
selector_path = AUTHOR / 'NEUTRAL.HB19-neighbor021-exact-original-operator-author-inputs.json'
seal_path = AUTHOR / 'SEAL.finite-HB19-neighbor021-source-cell-author.actual.json'
assert digest(selector_path) == 'sha256:8e82578c5b0fe1ff89f122bac15acdc75681ebcbb51259151f613f22552da267'
assert digest(seal_path) == 'sha256:dbb4c612c12b312e84348073e3e30640124ddd77dd4f22074b309139626fdc68'
selector = read(selector_path)
for b in selector['inputBindings']:
    assert binding(ROOT / b['path']) == b
candidate_path = AUTHOR / 'CANDIDATE.one-whole-source-cell-and-bounded-operator-component.author.json'
proposal = read(candidate_path)
before_path = ROOT / proposal['sourceCarrierBefore']['path']
after_path = ROOT / proposal['sourceCarrierAfter']['path']
before, after = read(before_path), read(after_path)
before_by = {g['id']: g for g in before['sourceGoals']}
after_by = {g['id']: g for g in after['sourceGoals']}
assert list(before_by) == list(after_by) and len(before_by) == 89
assert [i for i in before_by if before_by[i] != after_by[i]] == [SOURCE_ID]
assert before_by[SOURCE_ID] == proposal['sourceCellCAS']['exactBefore']
assert after_by[SOURCE_ID] == proposal['sourceCellCAS']['exactAfter']
cell = after_by[SOURCE_ID]
literal = 'erläutern die Herstellung ausgewählter Kunststoffe.'
for k in ['sourceText', 'parentBulletText', 'rawSourceText', 'rawParentBulletText']:
    assert cell[k] == literal
assert cell['description'] == 'Die lernende Person kann die Herstellung ausgewählter Kunststoffe erläutern.'
for k in ['id', 'topicCode', 'bulletIndex', 'aspectIndex', 'sourceSpan', 'sourceDocumentKey', 'sourceRef', 'courseLevel', 'granularity', 'tags', 'rawSourceSpan']:
    assert cell[k] == before_by[SOURCE_ID][k]
old_passages = {p['id']: p for p in before['passages']}
new_passages = {p['id']: p for p in after['passages']}
assert all(new_passages[i] == p for i, p in old_passages.items())
added_passages = [p for i, p in new_passages.items() if i not in old_passages]
assert len(added_passages) == 1 and added_passages[0]['id'] == cell['passageId']
assert added_passages[0]['text'] == added_passages[0]['rawText'] == literal
assert added_passages[0]['page'] == 19 and added_passages[0]['sourceGoalIds'] == [SOURCE_ID]
assert all(c['passageId'] in new_passages for c in after['sourceGoals'])
assert {k: v for k, v in before.items() if k not in ['sourceGoals', 'passages']} == {k: v for k, v in after.items() if k not in ['sourceGoals', 'passages']}

pdf_path = ROOT / before['sourceDocument']['path']
assert digest(pdf_path) == 'sha256:3d803861caabe84e3db0a1b2fcd3fc09672f373fbfead6949927d463483a59c7'
primary_path = ROOT / proposal['actualPrimaryFullContext']['path']
assert binding(primary_path) == proposal['actualPrimaryFullContext']
result = subprocess.run(['pdftotext', '-f', '18', '-l', '20', '-layout', str(pdf_path), '-'], capture_output=True)
assert result.returncode == 0 and result.stdout == primary_path.read_bytes()
own_primary = OWN / 'primary/HB.physical18-20.full-layout.fresh.txt'
own_primary.parent.mkdir(exist_ok=True)
own_primary.write_bytes(result.stdout)
result15 = subprocess.run(['pdftotext', '-f', '15', '-l', '15', '-layout', str(pdf_path), '-'], capture_output=True)
assert result15.returncode == 0
(OWN / 'primary/HB.physical15.course-and-border-context.fresh.txt').write_bytes(result15.stdout)

canonical_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
assert digest(canonical_path) == 'sha256:b913c70321ba68aadd6e7dda2779085a81fe8b64991839422072f3cbdc96bd9e'
canonical = read(canonical_path)
goal_by = {g['id']: g for g in canonical['goals']}
goal_input_path = AUTHOR / 'inputs/whole-current2652-unchanged.json'
whole_goal = read(goal_input_path)
assert whole_goal == goal_by[GOAL_ID] == proposal['boundedProposedContentFit']['wholeGoal']
jsonschema.Draft202012Validator(read(ROOT / 'docs/landscape-runtime.schema.json')).validate(canonical)
partner_ids = ['3e9eb5d0-3407-5a1e-9492-ad87f98d303d', '3aef6d91-04ff-5ec7-b92e-ccf330d9816a', GOAL_ID, '5a30273a-98d5-5163-bb16-c250b7ed4e7f']
carrier_checks = []
for carrier in proposal['mappingCarriers']:
    frozen = ROOT / carrier['frozenCopy']['path']
    operative = ROOT / carrier['operativeCarrier']['path']
    assert binding(frozen) == carrier['frozenCopy'] and binding(operative) == carrier['operativeCarrier']
    mappings = read(frozen)
    edges = [e for e in mappings['mappings'] if e['legacyGoalId'] == SOURCE_ID]
    decisions = [d for d in mappings.get('decisions', []) if d['sourceGoalId'] == SOURCE_ID]
    assert edges == carrier['wholeExistingEdges'] and decisions == carrier['wholeExistingDecisions']
    assert [e['canonicalGoalId'] for e in edges] == partner_ids
    carrier_checks.append({'frozen': binding(frozen), 'operativeBytesStillExact': binding(operative), 'wholeHistoricalCellEdges': edges, 'wholeHistoricalCellDecisions': decisions, 'newSourceOrMappingApproval': False})
write('INPUTS.all-four-existing-mapping-partner-whole-current-goals.actual.json', {'schemaVersion': 1, 'currentCanonical': binding(canonical_path), 'wholeGoals': [goal_by[i] for i in partner_ids], 'scope': 'Bodies read to assess corrected manufacture operator; old review decisions remain historical data, no approval oracle.'})

cases_path = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-poly18-aro19-final-case-profile-binding-author-20261013-v1/positive/whole74.exact-bilingual-cases.author.json'
assert digest(cases_path) == 'sha256:0f4a2a01684ab687859d3b3e3558528fa9765a62472efdcf767b0dc9013be93c'
cases = [c for c in read(cases_path)['cases'] if c['goalId'] == GOAL_ID]
assert len(cases) == 2
write('INPUTS.exact2652-two-whole-DEEN-case-and-rubric-extraction.actual.json', {'schemaVersion': 1, 'sourceCarrier': binding(cases_path), 'goalId': GOAL_ID, 'cases': cases, 'other72CasesScientificallyReviewed': False, 'caseDataAreDesignOnly': True})
course = read(OWN / 'checks/HB021-course-conditions.unmodified-stock.actual.json')
assert course['pass'] and course['exact021StockPass'] and course['noNewIssuesFrom021Correction']
assert course['exact021After']['metrics']['checkedMappingEdges'] == 0
partial_course_checks = [{'goalId': i, 'sourceCourseLevel': cell['courseLevel'], 'currentGoalTags': goal_by[i]['tags'], 'bothGKAndLKTagsPresent': all(level in goal_by[i]['tags'] for level in ['GK', 'LK'])} for i in partner_ids]
assert all(row['bothGKAndLKTagsPresent'] for row in partial_course_checks)
write('checks/partial-four-partner-course-metadata-and-stock-skip-limit.actual.json', {'schemaVersion': 1, 'actualPrimaryCourseContext': 'Mandatory E-phase Gymnasiale Oberstufe; no LK-only restriction or optional-content border for source021', 'existingPartialPartnerCourseTags': partial_course_checks, 'unmodifiedStockCQR004SkipsPartialMappingEdges': True, 'stockExact021CheckedMappingEdges': 0, 'stockPassNotTreatedAsFourEdgeCourseCompatibilityProof': True, 'actualDirectMetadataCompatibilityPass': True, 'wholeSourceOrWholeGoalFitNotInferred': True})
write('checks/89-whole-source-cells-one-literal-CAS-and-primary-binding.actual.json', {'schemaVersion': 1, 'before': binding(before_path), 'after': binding(after_path), 'exactChangedCellId': SOURCE_ID, 'sourceCellCountBeforeAfter': [89, 89], 'other88WholeSourceCellsExact': True, 'all25OriginalWholePassagesExact': True, 'singleAddedPrimaryPassage': added_passages[0], 'allSourceGoalPassageReferencesResolve': True, 'allRemainingDocumentSchoolStageAndCourseMetadataExact': True, 'actualPhysicalPrimaryPagesViewed': [15, 18, 19, 20], 'actualPrimaryPDF': binding(pdf_path), 'officialPrimaryDocument': before['sourceDocument'], 'freshPrimary18_20RawBytesExact': True, 'freshCommittedPrimaryCapture': binding(own_primary), 'whole2652MatchesCurrentCanonicalExactly': True, 'wholeCanonicalRuntimeSchemaPass': True, 'historicalMappingCarriersUnmodified': carrier_checks, 'stockExact021CourseCheckPass': True, 'wholeHBStockBaselineStatus': course['baseline']['status'], 'wholeHBStockCandidateStatus': course['candidate']['status'], 'wholeHBStockExistingFailuresUnchanged': course['baseline']['details'], 'passForBoundedLiteralCorrectionAndNoNewCourseIssue': True})

completed = datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z')
science = {
    'schemaVersion': 1, 'license': 'CC-BY-4.0', 'reviewKind': 'fresh bounded independent Source-A, original HB19 operator and possible partial partner', 'startedAt': START, 'completedAt': completed, 'sourceGoalId': SOURCE_ID, 'wholeGoalId': GOAL_ID, 'exactNeutralInput': binding(selector_path), 'authorSeal': binding(seal_path),
    'scientificVerdicts': {'literalSourceCellCorrection': 'ACCEPT_ORIGINAL_OPERATOR_FAITHFUL_CORRECTION', 'sourceCourseAndSelectionContext': 'ACCEPT_GYMNASIALE_OBERSTUFE_E_PHASE_GK_LK_COMPULSORY_SELECTED_POLYMER_DUTY', '2652ExistingTaughtAndAssessedFormationComponent': 'ACCEPT_RELEVANT_PARTIAL_COMPONENT_ONLY', 'wholeManufactureSourceOperatorCompletion': 'HOLD_NOT_DEMONSTRATED_BY_THESE_PARTIAL_CLAUSES_OR_HISTORICAL_UNION_ALONE', 'full2652AuthorityFrom021Alone': 'NOT_GRANTED', 'historicalFourPartnerWholeSourceUnion': 'HOLD_FRESH_OPERATOR_SPECIFIC_MAPPING_NEEDED'},
    'primaryScience': {'actualPDF': binding(pdf_path), 'actualPhysicalPage': 19, 'fullPrimaryContext': binding(own_primary), 'operatorLiteral': literal, 'originalOperatorAndSelectedMaterialScopePreserved': True, 'operatorMeaningDe': 'Erläutern verlangt einen nachvollziehbaren fachlichen Zusammenhang zur Herstellung der tatsächlich ausgewählten Kunststoffe. Es ist stärker als bloß Benennen von Monomer und Produkt oder ein reiner Klassen-/Eigenschaftsvergleich. Die Quelle legt weder alle Polymerklassen, alle genannten Verfahren noch einen universellen industriellen Bedingungenkatalog fest.', 'currentCellWasScientificallyWrong': 'The old claim about comparing thermoplastics, thermosets and elastomers by structure/property is absent from this primary bullet and cannot be retained as literal HB19-021 authority.', 'borderAndCourseEvidence': 'Actual pages15/19: thick frames mark compulsory content; this bullet lies in the compulsory E-phase block, with no LK restriction. Selected polymers are open teaching examples; optional applications/experiments below have thin borders and do not convert this operator into an optional duty or require a particular laboratory execution.', 'originalFullPageContextPreserved': 'The preceding macro-from-monomers describe operator, following traditional-versus-renewable distinction, compulsory process comparisons/sustainability, and optional examples remain distinct.'},
    'whole2652AndDirectCaseScience': {'wholeCurrentGoal': whole_goal, 'actualFullCasesRead': ['2652caef-case-1', '2652caef-case-2'], 'sourceCaseCarrier': binding(cases_path), 'fullDEENDataTasksAnswersAndRubricsRead': True, 'actualAssessedClauseCase1De': 'Leite aus diesen vollständigen Monomerformeln die PE- und PA-6,6-Repetiereinheiten ab. Erkläre, warum diese Funktionalitäten allein kein kovalentes Netzwerk verlangen.', 'actualAssessedClauseCase2De': 'Leite das Styrol-Repetiermotiv ab und erkläre an beiden Vinylgruppen des Divinylbenzols eine mögliche kovalente Verbindung zwischen Ketten.', 'case1Assessment': 'e1 specifically scores PE/PA-6,6 repeat motifs from ethene/diamine/diacid and the functionality/no-forced-network explanation.', 'case2Assessment': 'e1 specifically scores styrene repeat motif and possible covalent bridge through two vinyl groups reacting with different chains; recipe alone does not prove actual crosslinking.', 'acceptedOperatorComponent': 'Monomer-functionality and productive-linkage explanation at selected PE/PA-6,6/styrene/divinylbenzene examples is explicitly taught and demanded, not merely an ungraded optional remark. It is a legitimate limited component of explaining selected-polymer manufacture.', 'wholeSourceOperatorLimit': 'The scored clauses focus on motif derivation and possible connectivity. They do not explicitly require a coherent explanation of the selected production routes and chemical transformations, distinguish their reaction types or account for condensate loss where relevant. PE/PA/PS use-condition and mechanical questions do not supply this missing manufacture explanation. No industrial-recipe or full elementary-mechanism quota is added to the E-phase source.', 'wholeTargetLimit': 'HB021 does not demand the complete polymer property-profile and technical-use competence of 2652, nor all packing/H-bond/network/humidity/Tg transfers. A legitimate partial edge cannot certify that entire current goal.', 'actualLearningOrLaboratoryExecutionClaim': False, 'newPApprovalOrLearnerMasteryClaim': False},
    'stockPartialMappingCheckInterpretation': {'exact021CourseCheckerStatus': 'pass', 'checkedMappingEdges': 0, 'reason': 'Unmodified CQR-004 explicitly returns before checking partial edges. This status shows source presence and no reported issue, not actual four-edge compatibility or scientific fit.', 'independentDirectMetadataCourseCheck': partial_course_checks, 'actualPrimaryScopeRead': 'Thick-frame E-phase duty, GK/LK, Gymnasiale Oberstufe; actual source15/19 read and viewed.'},
    'remainingHolds': [
        {'id': 'HB021-A-WHOLE-PRODUCTION-DUTY-HOLD', 'scope': SOURCE_ID, 'needed': 'Bind the entire selected-polymer manufacture explanation to an actual explicit taught/scored production account, or a truthful union with other specifically reviewed production partners. For the already chosen cases, a bounded task could ask how monomer bonds/groups change to generate the selected chain and the relevant reaction type/byproduct; it need not require all industrial conditions or advanced radical mechanisms.', 'doNotWeaken': 'Keep original erläutern, Herstellung and ausgewählter Kunststoffe.'},
        {'id': 'HB021-A-OLD-CLASSIFICATION-UNION-HOLD', 'existingCanonicalPartnerIds': partner_ids, 'issue': 'Old 3e9 classification, 3aef thermal/Tg and 5a intermolecular-property bodies do not themselves explain manufacture. They can be supporting background, but the historical four-partner mapped/full-coverage rationale cannot be carried forward as scientific completion of the corrected production operator.', 'needed': 'A future finite mapping successor should explicitly bind the corrected complete source cell, label the limited 2652 formation contribution partial, and state which actual partner supplies remaining manufacture explanation. Do not overwrite the historical review record or treat its old rationale as a vote.'},
        {'id': 'HB021-A-NEIGHBOURS019022-REMAIN-SEPARATE', 'cellIds': ['hb-chemistry-sekii-gyo2022-3-2-e-kunststoffe-019-cdd6f9da', 'hb-chemistry-sekii-gyo2022-3-2-e-kunststoffe-022-ec630f12'], 'issue': 'Those unchanged cells claim official monomer-principle description and sustainability/lifecycle evaluation. Actual first and fourth source bullets instead name/explain selected sustainability concepts and explain the traditional-versus-renewable-feedstock distinction. Their operator-faithful source-fidelity audit remains separate; this one-cell correction does not approve them.', 'changedByThisReview': False},
        {'id': 'HB021-A-WHOLE-HB-STOCK-BASELINE-HOLD', 'issue': 'Whole frozen HB mapping course checker fails both before and after because source020 and source079 have no course-level checked mappings in these two historical carriers. Exact021 course status passes with zero checked edges because partial edges are skipped; the correction adds no new issue. Actual four-partner tags and compulsory E-phase scope were checked separately.', 'stockDetails': course['baseline']['details'], 'broaderSourceMappingGateClaim': False}
    ],
    'independenceAndProvenance': {'provider': 'OpenAI', 'knownModelFamily': 'GPT-6', 'exactRuntimeModelIdentifier': None, 'modelRevision': None, 'samplingParameters': None, 'newPeerHB021ReviewsReadBeforeOwnSeal': False, 'authorClaimsAndOldMappedRationaleUsedAsApprovalOracle': False, 'priorOwnSource6AndNative2652WorkKnown': True, 'currentJudgmentDerivedFromActualPrimaryAndFullCurrentCases': True},
    'authorityBoundary': {'activeSourceCanonicalMappingOrRegistryWrites': False, 'engineOrGitWrites': False, 'source34VerdictChanged': False, 'D_P_A_M_V_HumanAuthority': False, 'strictGain': 0, 'wholeHBSourceGateClosed': False}
}
science_path = write('SCIENTIFIC.HB19-neighbour021-original-operator-and-partial2652.independent-a.actual.json', science)
records = [
    {'schemaVersion': 1, 'recordId': 'HB19-021-independent-a-literal-source-fidelity', 'sourceGoalId': SOURCE_ID, 'decision': science['scientificVerdicts']['literalSourceCellCorrection'], 'sourceCellBefore': before_by[SOURCE_ID], 'sourceCellAfter': cell, 'wholeScientificVerdict': binding(science_path), 'humanOrOperativeApproval': False},
    {'schemaVersion': 1, 'recordId': 'HB19-021-independent-a-whole-operator-partial2652', 'sourceGoalId': SOURCE_ID, 'canonicalGoalId': GOAL_ID, 'decision': 'PARTIAL_COMPONENT_ACCEPTED_WHOLE_SOURCE_AND_WHOLE_TARGET_HOLD', 'actualAssessedCaseIds': ['2652caef-case-1', '2652caef-case-2'], 'wholeScientificVerdict': binding(science_path), 'humanOrOperativeApproval': False}
]
records_path = OWN / 'RECORDS.HB021-source-cell-and-bounded2652.independent-a.actual.jsonl'
records_path.write_text(''.join(json.dumps(r, ensure_ascii=False, separators=(',', ':'), allow_nan=False) + '\n' for r in records))
write('INPUTS.exact-HB021-whole-primary-goal-case-and-mapping-bindings.actual.json', {'schemaVersion': 1, 'neutralSelector': binding(selector_path), 'authorSeal': binding(seal_path), 'neutralBindingsAllActualBytesVerified': selector['inputBindings'], 'completeAuthorCAS': binding(candidate_path), 'primaryPDFLocalCache': binding(pdf_path), 'primaryOfficialURL': before['sourceDocument']['url'], 'currentCanonicalRawBytes': binding(canonical_path), 'runtimeSchema': binding(ROOT / 'docs/landscape-runtime.schema.json'), 'supplementalCaseCarrier': binding(cases_path), 'wholeCurrentExistingPartnerBodies': binding(OWN / 'INPUTS.all-four-existing-mapping-partner-whole-current-goals.actual.json'), 'fullCaseDataOnlyExtract': binding(OWN / 'INPUTS.exact2652-two-whole-DEEN-case-and-rubric-extraction.actual.json'), 'publicIgnoredTemporaryLinks': False})
write('RUN.actual-HB021-source-review-known-provenance.json', {'schemaVersion': 1, 'runId': 'chemie-HB19-neighbour021-source-independent-a-20261014-v1', 'startedAt': START, 'completedAt': completed, 'provider': 'OpenAI', 'knownModelFamily': 'GPT-6', 'exactModelRevisionAndSamplingUnknown': True, 'newPeerHB021ReviewsRead': False, 'scientificVerdict': binding(science_path), 'records': binding(records_path), 'noD_P_A_M_V_HumanOrStrictAuthority': True})

spec = importlib.util.spec_from_file_location('stock_validate_schemas', ROOT / 'scripts/validate_schemas.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
errors = module.curriculum_symlink_errors(str(ROOT))
assert errors == []
write('checks/global-curriculum-symlink-errors.unmodified-stock.actual.json', {'schemaVersion': 1, 'stockFunction': 'scripts/validate_schemas.py:curriculum_symlink_errors', 'stockModule': binding(ROOT / 'scripts/validate_schemas.py'), 'checkedAt': datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z'), 'errors': errors, 'errorCount': len(errors), 'pass': True})
parsed = []
for p in sorted(OWN.rglob('*')):
    assert not p.is_symlink()
    if p.suffix == '.json':
        read(p); parsed.append({'path': str(p.relative_to(OWN)), 'kind': 'json'})
    elif p.suffix == '.jsonl':
        rows = [json.loads(s, parse_constant=lambda s: (_ for _ in ()).throw(ValueError(s))) for s in p.read_text().splitlines()]
        parsed.append({'path': str(p.relative_to(OWN)), 'kind': 'jsonl', 'count': len(rows)})
write('checks/finite-full-own-json-jsonl-parse.actual.json', {'schemaVersion': 1, 'allJSONJSONLFullyParsed': True, 'parsed': parsed, 'ownSymlinks': 0, 'ignoredTemporaryLinks': 0, 'pass': True})
print(json.dumps({'literalCorrection': science['scientificVerdicts']['literalSourceCellCorrection'], 'partialComponent': science['scientificVerdicts']['2652ExistingTaughtAndAssessedFormationComponent'], 'wholeOperatorCompletion': 'HOLD', 'allOther88SourceCellsPreserved': True, 'wholeHBCourseStockStatus': course['candidate']['status'], 'exact021CourseStockPass': True, 'globalGuardErrors': 0, 'completedAt': completed}))
