from pathlib import Path
import collections
import datetime
import hashlib
import json

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
PREFIX = 'curricula/DE/Gymnasium/quality/goal-evidence'
N = ROOT / PREFIX / '2026-10-09/wirtschaft-current125-native-mapping-and-explicit-BE-course-author-20261009-v1'
REGISTRY = ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
BOOK_CONFIG = ROOT / PREFIX / '2026-10-09/wirtschaft-nine-reviewed-Q2-materials-root-bounded-assembly-v1/book-config.current311-reviewed-Q2-nine.frozen-P311624.inert.json'
SOURCE_UNION = N / '125-whole-current-source-to-whole-Goal-P-case-union.actual25-native-P-E8-independent-successor.author-v2.json'
LEDGER = ROOT / PREFIX / '2026-10-09/wirtschaft-current125-independent-source-judgment-reconciliation-root-v1/actual-current125-qualified-all-performance-KEEP-Montan-cycle-EU-three-source-unions-successor-v5.json'
bound_inputs = {}


def bind(path):
    p = Path(path)
    raw = p.read_bytes()
    value = {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(raw).hexdigest(), 'wholeBytes': len(raw)}
    bound_inputs[value['path']] = value
    return value


def read(path):
    bind(path)
    return json.loads(Path(path).read_bytes())


def jsonl(path):
    bind(path)
    return [(number, json.loads(line), line.decode()) for number, line in enumerate(Path(path).read_bytes().splitlines(), 1) if line.strip()]


def write(name, data):
    p = OUT / name
    assert not p.exists(), p
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    raw = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(raw).hexdigest(), 'wholeBytes': len(raw)}


def object_hash(obj):
    return hashlib.sha256(json.dumps(obj, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()).hexdigest()


at = datetime.datetime.now(datetime.timezone.utc).isoformat()
registry = read(REGISTRY)
subject = next(s for s in registry['subjects'] if s['subject'] == 'wirtschaftswissenschaften')
active_rows = []
active_configs = []
for configured in subject['positiveEvidenceConfigPaths']:
    config = read(ROOT / configured)
    rows = jsonl(ROOT / config['reviewPath'])
    active_configs.append({'config': bind(ROOT / configured), 'recordFile': bind(ROOT / config['reviewPath']), 'recordCount': len(rows), 'caseCount': sum(len(r['profile']['applicationCaseBriefs']) for _, r, _ in rows), 'criteria': bind(ROOT / config['reviewCriteriaPath'])})
    active_rows.extend(r for _, r, _ in rows)
assert len(active_rows) == 300 and len({r['goalId'] for r in active_rows}) == 300

book = read(BOOK_CONFIG)
base = {}
for configured in book['evidenceReviewPaths']:
    for line_number, record, raw_line in jsonl(ROOT / configured):
        assert record['goalId'] not in base
        base[record['goalId']] = {'wholeRecord': record, 'source': bind(ROOT / configured), 'line': line_number, 'wholeOriginalRawLine': raw_line}
assert len(base) == 311
assert sum(len(i['wholeRecord']['profile']['applicationCaseBriefs']) for i in base.values()) == 624

union = read(SOURCE_UNION)
ledger = read(LEDGER)
qualified = {r['sourceAspectId']: r for r in ledger['rows']}
assert len(qualified) == 125 and all(r['currentBoundedPerformanceUnionDecision'] == 'KEEP' for r in qualified.values())
source_profiles = {}
source_lineage = collections.defaultdict(list)
for row in union['rows']:
    independent = row['reusedCurrentIndependentWholeUnionKEEP']
    independent_path = ROOT / independent['file']['path']
    bind(independent_path)
    for goal in row['wholeCurrentGoalPCaseUnion']:
        gid = goal['goalId']
        record = goal['wholeCurrentPositiveRecord']
        if gid in source_profiles:
            assert source_profiles[gid]['wholeCurrentPositiveRecord']['profile'] == record['profile']
        source_profiles[gid] = goal
        source_lineage[gid].append({'sourceAspectId': row['sourceAspectId'], 'qualifiedSourcePerformanceRow': qualified[row['sourceAspectId']], 'independentWholeUnionKEEP': independent, 'boundary': 'Retained current individual source-performance lineage; no new whole native mapping/course/scientific or human approval.'})
assert len(source_profiles) == 110

selected = {}
profile_deltas = []
for gid, original in base.items():
    proposed = source_profiles.get(gid)
    changed = proposed is not None and proposed['wholeCurrentPositiveRecord']['profile'] != original['wholeRecord']['profile']
    if changed:
        origin = proposed['positiveRecordOrigin']
        candidates = jsonl(ROOT / origin['path'])
        match = [(number, record, raw) for number, record, raw in candidates if record['goalId'] == gid]
        assert len(match) == 1 and match[0][1] == proposed['wholeCurrentPositiveRecord']
        number, record, raw = match[0]
        selected[gid] = {'wholeRecord': record, 'source': bind(ROOT / origin['path']), 'line': number, 'wholeOriginalRawLine': raw}
        profile_deltas.append({'goalId': gid, 'old': original['source'], 'new': selected[gid]['source'], 'oldProfileSHA256': object_hash(original['wholeRecord']['profile']), 'newProfileSHA256': object_hash(record['profile']), 'oldCaseIds': [c['id'] for c in original['wholeRecord']['profile']['applicationCaseBriefs']], 'newCaseIds': [c['id'] for c in record['profile']['applicationCaseBriefs']], 'wholeChangedFields': sorted(k for k in set(record) | set(original['wholeRecord']) if record.get(k) != original['wholeRecord'].get(k)), 'currentQualifiedSourceLineage': source_lineage[gid]})
    else:
        selected[gid] = original

source25 = sorted(set(source_profiles) - set(base))
assert len(source25) == 25
for gid in source25:
    proposed = source_profiles[gid]
    origin = proposed['positiveRecordOrigin']
    match = [(number, record, raw) for number, record, raw in jsonl(ROOT / origin['path']) if record['goalId'] == gid]
    assert len(match) == 1 and match[0][1] == proposed['wholeCurrentPositiveRecord']
    number, record, raw = match[0]
    selected[gid] = {'wholeRecord': record, 'source': bind(ROOT / origin['path']), 'line': number, 'wholeOriginalRawLine': raw}
assert len(selected) == 336 and len(profile_deltas) == 16
assert sum(len(selected[g]['wholeRecord']['profile']['applicationCaseBriefs']) for g in source25) == 52
assert sum(len(i['wholeRecord']['profile']['applicationCaseBriefs']) for i in selected.values()) == 685
assert all((i['wholeRecord']['status'], i['wholeRecord']['reviewAuthority'], i['wholeRecord']['evidenceLevel'], i['wholeRecord']['maximumClaimScope']) == ('needs_human_review', 'ai_candidate', 'E1', 'G1') for i in selected.values())

qa_live_path = ROOT / subject['visualizationQaPath']
qa_live = read(qa_live_path)
qa_311_path = ROOT / book['goalVisualizationQaPath']
qa_311 = read(qa_311_path)
qa25_path = N / 'twenty-five-current-Source25-machine-V-exact-asset-QA-rows-only.inert-author-successor-v2.json'
qa25 = read(qa25_path)
assert len(qa_311['records']) == 311 and len(qa25['records']) == 25
old_qa_by_id = {r['goalId']: r for r in qa_live['records']}
qa_deltas = []
for row in qa_311['records']:
    old = old_qa_by_id[row['goalId']]
    fields = sorted(k for k in set(old) | set(row) if old.get(k) != row.get(k))
    if fields:
        qa_deltas.append({'goalId': row['goalId'], 'actualFields': fields, 'wholeNewQualifiedQARecord': row})
assert len(qa_deltas) == 11

generic_review = ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-by-ten-specific-illustrations-independent-B-20261009-v1/actual-ten-selection-seven-originalKEEP-three-targeted-correctionKEEP.receipt.json'
generic = read(generic_review)
generic_assets = {r['goalId']: r for r in generic['records']}
contract_review = ROOT / PREFIX / '2026-10-09/wirtschaft-contract-types-one-independent-B-20261009-v1/actual-independent-479-native-360-680-image.review.receipt.json'
contract = read(contract_review)
asset_rows = []
combined_qa = qa_311['records'] + qa25['records']
assert {r['goalId'] for r in combined_qa} == set(selected)
for row in combined_qa:
    gid = row['goalId']
    if gid in source25:
        source_path = N / 'asset-inputs' / gid / 'actual-independently-reviewed.png'
        proof = bind(qa25_path)
    elif gid in generic_assets:
        source_path = ROOT / generic_assets[gid]['asset']['path']
        proof = bind(ROOT / generic_assets[gid]['independentReceipt']['path'])
    elif gid == contract['goalId']:
        source_path = ROOT / contract['asset']['path']
        proof = bind(contract_review)
    else:
        source_path = ROOT / row['canonicalAssetPath']
        proof = bind(qa_live_path)
    asset = bind(source_path)
    digest = 'sha256:' + asset['sha256']
    assert row['aiApproved'] == 'yes'
    assert digest == row['aiApprovedAssetSha256'] == row['assetSha256']
    asset_rows.append({'goalId': gid, 'wholeQualifiedQARecord': row, 'wholeQualifiedQARecordSHA256': object_hash(row), 'actualRetainedCanonicalBytes': asset, 'independentVisualLineageReference': proof, 'publicTargetPath': row['publicAssetPath'], 'canonicalTargetPath': row['canonicalAssetPath'], 'currentPublicInstalled': (ROOT / row['publicAssetPath']).is_file(), 'currentCanonicalInstalled': (ROOT / row['canonicalAssetPath']).is_file(), 'currentRuntimeInstallationIsNotCandidateProvenance': True})

for path in [ROOT / 'app/scripts/positiveGoalEvidenceProfileModel.ts', ROOT / 'app/scripts/goalEvidenceProfileModel.ts', ROOT / 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json', ROOT / 'AGENTS.md']:
    bind(path)
rows = [{'goalId': gid, **selected[gid], 'profileSHA256': object_hash(selected[gid]['wholeRecord']['profile']), 'actualCaseIds': [c['id'] for c in selected[gid]['wholeRecord']['profile']['applicationCaseBriefs']], 'old311': gid in base, 'source25': gid in source25, 'qualifiedSourceLineage': source_lineage.get(gid, [])} for gid in sorted(selected)]
intake = write('whole-current-qualified-P336-P685-and-V336.portable-input-index.pre-final-freeze.json', {
    'createdAt': at, 'role': 'Exact technical intake only; final canonical/resource binding waits for Root-accepted author freeze',
    'activeRegistryOriginal': {'registry': bind(REGISTRY), 'configs': active_configs, 'actualProfiles': 300, 'actualCases': 601, 'boundary': 'The active17 configurations do not contain311 profiles.'},
    'acceptedCandidateBase311': {'bookConfigReferenceOnlyNoBookRun': bind(BOOK_CONFIG), 'actualProfiles': 311, 'actualCases': 624, 'currentQualifiedQA311': bind(qa_311_path), 'oldLiveQA311': bind(qa_live_path)},
    'currentSource125PerformanceIndex': {'sourceUnion': bind(SOURCE_UNION), 'reportedHeaderUniqueGoals': union['uniqueCurrentCanonicalUnionGoals'], 'actualUniqueGoalProfiles': 110, 'qualified125Ledger': bind(LEDGER), 'nativeSourceMappingAndCourseApproval': False},
    'wholeSelectedPositiveRows': rows, 'wholePositiveContentDiffsAgainstCandidate311': profile_deltas,
    'wholeRetainedQAAndActualBytes': asset_rows, 'elevenAlreadyQualifiedQA311SuccessorDeltasAgainstLive': qa_deltas,
    'counts': {'positiveProfiles': 336, 'actualCases': 685, 'existing311Profiles': 311, 'existing311Cases': 633, 'source25Profiles': 25, 'source25Cases': 52, 'newSubstantiveScienceAuthored': 0, 'wholeBaseRecordsExactRetained': 295, 'exactPreviouslyQualifiedSourceProfileSuccessors': 16, 'wholeQA311LiveRecordsExactRetained': 300, 'exactAlreadyQualifiedGeneric11QASuccessors': 11, 'exactSource25QARecords': 25, 'allNeedsHumanReview': 336, 'allAICandidateE1G1': 336},
    'finalCanonicalFrameBound': False, 'newHumanOrM7Approval': False, 'strictNetGain': 0,
})
guard = write('actual-qualified-P-V-intake-whole-inputs.after-read-before-final-binding.guard.json', {'capturedAt': at, 'captureTiming': 'After actual whole retained P/QA/index/asset reading; before any final canonical fingerprint binding. No pre-read guard claimed.', 'files': sorted(bound_inputs.values(), key=lambda r: r['path'])})
plan = write('actual-selective-current-P336-V336-final-binding-plan.author.json', {
    'intake': intake, 'inputGuard': guard,
    'requiredFinalFreeze': 'Root-accepted Sourceauthor current CAN485 kernel, existing6tags/12orientationRequires and exact current resources; final wholeSHA required by binder.',
    'allowedPositiveFieldDeltaOnly': ['goalFingerprint', 'reviewInputFingerprint'],
    'retainedPositiveWholeFields': 'Every other field including whole profile/cases/status/authority/E1/G1/reviewCriteriaFingerprint/reviewer/reason/timestamps/runIds/dissent remains exact selected currently qualified original.',
    'semanticGoalFingerprintScope': 'Current production goalEvidenceSemanticPayload: localized title/description, semanticKind/atomic/type/nodeKind/tags/dimensionTags. Applicability/sourceRef alone is not a goalFingerprint delta.',
    'reviewInputScope': 'Exact current goalFingerprint plus direct requires/contains/examples and each actual goal-visualization URL/role/altText/reviewStatus/wholeassetdigest. No empty or invented digest.',
    'visualRecords': 'QA300 live rows exact plus11 already qualified Generic successors plus25 existing Source visual KEEP rows exact. Candidate top-level source path may reference final inert frame; row science/status/hash unchanged.',
    'staleNegativeChecks': ['Original selected stale records must be rejected against final current metadata; changed tags/requires/resource digest each invalidates expected current fingerprint', 'Applicability-only hypothetical changes must leave P goal/input fingerprints unchanged', 'Changed profile without matching profileFingerprint must be rejected', 'AI status upgrade to approved must be rejected'],
    'scienceReviewRequiredForNewContent': 'No new P/visual content authored or self-reviewed; unexpected substantive goal or asset bytes cause HOLD rather than arbitrary binding.',
    'noAdditionalBookCentralBuild': True, 'noSharedWrites': True, 'humanStatusPreserved': True,
})
print(json.dumps({'intake': intake, 'guard': guard, 'plan': plan, 'counts': {'P336': len(rows), 'cases685': 685, 'V336': len(asset_rows)}, 'finalFrameBound': False}, ensure_ascii=False, indent=2))
