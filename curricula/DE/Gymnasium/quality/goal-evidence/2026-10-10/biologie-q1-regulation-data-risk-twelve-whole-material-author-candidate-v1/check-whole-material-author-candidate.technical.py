# SPDX-License-Identifier: Apache-2.0
"""Bounded parsing, ordinary schemas, material completeness and preservation.

This checker verifies authored data, not scientific approval or learner mastery.
"""
import hashlib
import importlib.util
import json
from pathlib import Path

import jsonschema
import fitz

ROOT = Path.cwd()
BASE = Path(__file__).resolve().parent
PREVIOUS = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-q1-regulation-data-risk-twelve-whole-author-candidate-v1'


def read(path):
    return json.loads(path.read_text())


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


spec = importlib.util.spec_from_file_location('ordinary_schema_validator', ROOT / 'scripts/validate_schemas.py')
ordinary = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ordinary)
runtime_schema = read(ROOT / 'docs/landscape-runtime.schema.json')
parsed = 0
for path in sorted(BASE.rglob('*')):
    assert not path.is_symlink(), path
    if not path.is_file():
        continue
    if path.suffix == '.json':
        assert ordinary.validate_file(str(path), runtime_schema), path
        parsed += 1
    elif path.suffix == '.jsonl':
        for line in path.read_text().splitlines():
            if line.strip():
                json.loads(line)
                parsed += 1

current = read(BASE / 'input/whole479-current-canonical.actual.json')
ledger = read(BASE / 'input/whole394-current-semantic-kinds.actual.json')
jsonschema.validate(current, runtime_schema)
assert len(current['goals']) == 479
whole_by_id = {g['id']: g for g in current['goals']}
owned = read(BASE / 'frozen-inputs/candidate/twelve-whole-unmodified-DEEN-goals.inactive.json')
ids = [g['id'] for g in owned]
assert len(ids) == len(set(ids)) == 12
assert all(g == whole_by_id[g['id']] for g in owned)
assert all(not g.get('resourceLinks') for g in owned)
authoritative = {r['goalId']: r['semanticKind'] for r in ledger['decisions'] if r['decisionStatus'] == 'authoritative'}
assert all(authoritative[i] == 'curricularAtomic' for i in ids)

materials = read(BASE / 'candidate/twelve.full-material-and-profile.author.json')['goals']
assert [g['goalId'] for g in materials] == ids
assert len(materials) == 12
case_ids = []
for row in materials:
    profile = row['profile']
    assert len(row['cases']) == 2
    assert [c['id'] for c in row['cases']] == [c['id'] for c in profile['applicationCaseBriefs']]
    expected = {e['id'] for e in profile['expectations']}
    assert expected == set(profile['coverageExpectations']['requiredExpectationIds'])
    assert profile['coverageExpectations']['minimumIndependentDemonstrations'] == 2
    assert profile['coverageExpectations']['freshVariationRequired'] is True
    assert profile['coverageExpectations']['independentTransferRequired'] is True
    for c in row['cases']:
        case_ids.append(c['id'])
        assert c['syntheticData'] is True
        for stem in ('title', 'material', 'task', 'workedSolution', 'freshTransfer', 'freshTransferSolution', 'limits'):
            for lang in ('De', 'En'):
                text = c[stem + lang]
                assert isinstance(text, str) and text.strip(), (row['goalId'], c['id'], stem, lang)
                assert '\\n' not in text, 'Literal backslash-n in authored material'
        covered = {i for r in c['rubric'] for i in r['expectationIds']}
        assert covered == expected, (row['goalId'], c['id'])
        for r in c['rubric']:
            assert r['criterionDe'].strip() and r['criterionEn'].strip()
        assert c['freshTransferDe'] != c['taskDe'] and c['freshTransferSolutionDe'] != c['workedSolutionDe']
assert len(case_ids) == len(set(case_ids)) == 24

records = [json.loads(line) for line in (BASE / 'candidate/positive.twelve.author.review.jsonl').read_text().splitlines() if line.strip()]
assert [r['goalId'] for r in records] == ids
profile_schema = read(ROOT / 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
for r, material in zip(records, materials):
    jsonschema.Draft202012Validator(profile_schema, format_checker=jsonschema.FormatChecker()).validate(r)
    assert r['status'] == 'needs_human_review' and r['reviewAuthority'] == 'ai_candidate'
    assert r['evidenceLevel'] == 'E1' and r['maximumClaimScope'] == 'G1' and r['reviewRunIds'] == []
    assert r['profile'] == material['profile']

frame_path = 'source/all-original-whole-duties-and-all-current-whole-partners.neutral.json'
frame = read(BASE / 'frozen-inputs' / frame_path)
assert (BASE / 'frozen-inputs' / frame_path).read_bytes() == (PREVIOUS / frame_path).read_bytes()
assert len(frame) == 16
assert sum(len(r['allOriginalPartnerRows']) for r in frame) == 113
assert sum(len(r['ownedGoalEdges']) for r in frame) == 16
partners = {g['id']: g for r in frame for g in r['wholeCurrentCanonicalPartners']}
assert len(partners) == 41 and all(g == whole_by_id[i] for i, g in partners.items())
for row in frame:
    for role in ('mappingInput', 'sourceExtractionInput'):
        binding = row[role]
        original = ROOT / binding['path']
        assert digest(original) == binding['sha256'] and original.stat().st_size == binding['bytes']
primary_aliases = read(BASE / 'input/frozen-primary-input-aliases.json')['aliases']
assert len(primary_aliases) == 6
for binding in primary_aliases:
    frozen = ROOT / binding['frozenPath']
    original = ROOT / binding['originalPath']
    assert frozen.read_bytes() == original.read_bytes()
    assert digest(frozen) == binding['sha256'] and frozen.stat().st_size == binding['bytes']
    if binding['fileType'] == 'pdf':
        with fitz.open(stream=frozen.read_bytes(), filetype='pdf') as pdf:
            assert len(pdf) >= binding['physicalPage1Based']
        page_text = ROOT / binding['actualPageTextPath']
        assert digest(page_text) == binding['actualPageTextSha256']
he_pdf = BASE / 'frozen-inputs/primary/HE-current-official.whole.pdf.bytes'
assert he_pdf.read_bytes() == (PREVIOUS / 'primary/HE-current-official.whole.pdf').read_bytes()
with fitz.open(stream=he_pdf.read_bytes(), filetype='pdf') as pdf:
    for n in (38, 39, 40):
        actual_text = BASE / f'frozen-inputs/source/HE-current-physical-{n:03d}.actual.txt'
        assert actual_text.read_text() == pdf[n - 1].get_text()
for path in (BASE / 'frozen-inputs').rglob('*'):
    if path.is_file():
        relative = path.relative_to(BASE / 'frozen-inputs')
        original = PREVIOUS / relative
        if original.exists():
            assert path.read_bytes() == original.read_bytes(), relative

old_entry = read(PREVIOUS / 'neutral-begun-twelve-whole-source-and-material-author.commit-checkpoint.entry.json')
for group in ('neutralFirstInputs', 'authorDiagnosisReadOnlyAfterOwnScientificFIRST', 'authorReadinessAndTechnicalChecks'):
    for binding in old_entry[group]:
        original = ROOT / binding['path']
        assert digest(original) == binding['sha256'] and original.stat().st_size == binding['bytes'], binding['path']
for kind, short in [('semanticAtomicityConfigPath', 'A12'), ('memoryReviewConfigPath', 'M12')]:
    reuse = read(BASE / 'frozen-inputs/input/whole-current-A12-M12.exact-retained-records.json')[kind]
    original = ROOT / reuse['reviewPath']
    selected = b''.join(line for line in original.read_bytes().splitlines(keepends=True) if json.loads(line)['goalId'] in ids)
    assert selected == (BASE / 'candidate' / f'{short}.exact-retained-original-lines.jsonl').read_bytes()

print(json.dumps(dict(status='PASS', parsedJsonAndJsonlRows=parsed, wholeRuntimeSnapshotOrdinarySchema='PASS',
    wholeGoals=479, wholeCurricularAtomicGoals=394, wholeOwnedGoalBodiesUnchanged=12,
    wholeSourceDuties=16, originalPartnerEdges=113, wholeUniquePartnerBodiesUnchanged=41,
    positiveProfiles=12, fullBilingualCases=24, exactRetainedA=12, exactRetainedM=12,
    visualizationClaims=0, actualLearnerPerformances=0, independentReviews=0,
    strictNetGain=0, newScientificCompletions=0, humanApproval=False, humanTrial=False)))
