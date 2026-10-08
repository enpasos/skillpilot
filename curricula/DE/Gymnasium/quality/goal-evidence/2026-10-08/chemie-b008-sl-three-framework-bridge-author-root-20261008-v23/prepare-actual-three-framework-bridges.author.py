# SPDX-License-Identifier: Apache-2.0
"""Record actually read framework evidence; no source or M7 approval."""
from datetime import datetime, timezone
import hashlib
import importlib.util
import json
from pathlib import Path

import fitz

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
BASE = OWN.parent
CACHE = ROOT / 'tmp/chemie-b008-sl-basis-primary-root-20261008-v1'
OLD = BASE / 'chemie-b008-sl-specific-source-continuation-author-root-20261008-v21'
assert not (OWN / 'author.first.freeze.json').exists()


def read(p):
    return json.loads(p.read_text())


def bind(p):
    data = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def write(name, value):
    p = OWN / name
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return bind(p)


def pages(p, numbers):
    doc = fitz.open(p)
    return [{'physicalPage': n, 'wholeActualPageTextSha256': hashlib.sha256(doc[n - 1].get_text().encode()).hexdigest(),
             'wholePageActuallyReadByAuthor': True} for n in numbers]


for b in read(OLD / 'author.final.freeze.json')['payloads']:
    assert bind(ROOT / b['path']) == b
active_paths = [ROOT / p for p in [
    'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json',
    'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json']]
before = [bind(p) for p in active_paths]

documents = []
specs = [
    ('KMK2020-Chemie-AHR', 'KMK2020-Chemie-AHR.actual-official.pdf', 'KMK2020-Chemie-AHR.actual-official-http-receipt.json', [10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 'Allgemeine Hochschulreife; common standards for both course levels; qualification-phase completion, not completion by the end of EP'),
    ('KMK2024-Chemie-MSA', 'KMK2024-Chemie-MSA.actual-official.pdf', 'KMK2024-Chemie-MSA.actual-official-http-receipt.json', [2, 5, 11], 'Mittlerer Schulabschluss; no automatic claim that every end-of-stage competency is already required at the end of grade 8'),
    ('KMK2004-Chemie-MSA', 'KMK2004-Chemie-MSA.actual-official.pdf', 'KMK2004-Chemie-MSA.actual-official-http-receipt.json', [7, 10, 13, 14], 'Historical comparison only. Do not infer that current SL 2024/2025 exclusively adopts this old edition'),
    ('SL-MEDIA-2019-ACADEMIC-MIRROR', 'Basiscurriculum.actual-academic-mirror.pdf', 'actual-academic-mirror-http-receipt.json', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 16, 17, 22, 23], 'Classes 1 to 10; 2019 ministry publication read through university mirror; current official response was 403 and current official byte identity is unverified'),
]
for key, filename, receipt_name, numbers, scope in specs:
    receipt = read(CACHE / receipt_name)
    p = CACHE / filename
    assert hashlib.sha256(p.read_bytes()).hexdigest() == receipt['sha256']
    assert receipt['httpStatus'] == 200
    documents.append({'key': key, 'actualHttpReceipt': receipt, 'scopeAndVersionBoundary': scope,
                      'actuallyReadWholePages': pages(p, numbers),
                      'localWholePrimaryCachePath': str(p.relative_to(ROOT)),
                      'cacheIsNotRequiredCommittedEvidence': True,
                      'portableSourceRoute': receipt['effectiveUrl'],
                      'rawThirdPartyDocumentNotRepublished': True})
primary = write('actual-framework-documents-and-whole-page-readings.author.json', {
    'schemaVersion': 1, 'role': 'Actual primary reading receipts, not curriculum scope clearance', 'documents': documents,
    'officialMediaRequest': read(CACHE / 'actual-http-receipt.json'),
    'officialMediaCurrentBytesNotVerified': True,
    'mediaPhysical9Interpretation': 'This is a framework for future subject curricula and internal coordination. Grade progression is expressly not strictly binding; do not manufacture a cumulative per-grade obligation from table position.',
    'humanApproval': False,
})

extraction = ROOT / 'curricula/DE/Gymnasium/input/SL/upper-secondary/source-extraction/DE_SL_CHEMIE_SEKII_GOS_2023_2025.source-extraction.json'
references = read(extraction)['sourceDocuments']
upper = []
for ref in references:
    if ref['courseLevel'] not in ['GK', 'LK']:
        continue
    p = ROOT / ref['path']
    upper.append({'wholeExistingSourceDocumentReference': ref, 'actualLocalDocumentBinding': bind(p),
                  'actuallyReadWholePages': pages(p, [3, 4, 6]),
                  'interpretationDe': 'Seite 3 nennt Prozesskompetenzen verbindlich. Seite 4 konkretisiert Inhalte auf Basis der AHR-Bildungsstandards und berücksichtigt alle Kompetenzbereiche in Lernerfolgskontrollen. Seite 6 entwickelt digitale und Medien-Basiskompetenzen in chemischen Settings weiter. Der AHR-Brückenschluss ist ein zu prüfender curricularer Schluss, keine neue wörtliche Fachbullet-Quelle.'})
lower = []
for filename in ['Chemie_Gymnasium_G9_Klasse_8_2024_red_2025.pdf', 'Chemie_Gymnasium_G9_Klasse_9_2025.pdf']:
    p = ROOT / 'curricula/DE/Gymnasium/input/SL' / filename
    lower.append({'actualLocalDocumentBinding': bind(p), 'actuallyReadWholePages': pages(p, [3, 7]),
                  'interpretationDe': 'Der aktuelle Rahmen bezieht sich auf Kompetenzen beim Erwerb des Mittleren Schulabschlusses. Die konkreten Grade-8-/Grade-9-Rollen und die Fassung der herangezogenen Standards müssen fachlich entschieden werden; keine pauschale Ableitung aus einem späteren Abschluss.'})
bridge = write('current-SL-subject-to-framework-binding.author.json', {
    'schemaVersion': 1, 'role': 'Actual current subject passages plus explicit interpretive limits',
    'currentUpperExtractionBinding': bind(extraction), 'upperCourseReferences': upper,
    'lowerCurrentFrameworkReferences': lower, 'noNewExtractionGoalIdsFabricated': True,
    'lower2004ExclusiveAdoptionNotProven': True, 'ordinaryAtlasAdoptionStillPending': True,
})

candidate_path = OLD / 'candidate/canonical.current504-sl-source-metadata.author-candidate.json'
goals = {g['id']: g for g in read(candidate_path)['goals']}
rows = [
    {'goalId': 'ac8b6c0f-98b2-5092-806d-d9498efbfa35',
     'authorProposedBridge': 'Upper whole information competence: KMK AHR K1/K2/K8/K12, read at physical17–18, connected to current SL GK/LK physical3–4. Complex forms, selection, interpretation, conclusions, sources and quotation marking are explicit standard components; common levels are defined at physical14.',
     'mediaAdditionalBoundedSupport': 'Actual 2019 physical12 sections2.1/2.2 support independent multi-source research and differentiated preparation; physical16 section4.3 and physical17 section4.4 support attribution and quotation rules. Mirror/current-version and non-binding grade progression limits remain.',
     'wholeObligationLimit': 'Candidate whole-role sufficiency is an interpretation requiring both independent source reviewers. It does not establish completion by the end of EP, actual independent learner performance, every original source duty, or normal Atlas adoption.'},
    {'goalId': '36666b4a-97af-51fc-9983-56cdcc7a8229',
     'authorProposedBridge': 'Upper whole source criticism: KMK AHR K3/K4/K12 and B1–B4, actual physical18–19, address comparison, trust/origin/quality, authorship, scientific correctness, suitability/limits and author intention. Current SL GK/LK physical3–4 gives the subject-framework connection. This uses actual original statements beyond a plastics significance discussion.',
     'mediaAdditionalBoundedSupport': 'Actual 2019 physical13 section2.3 treats comparing reports and stakeholder intention. Physical16 source attribution supports origin. No general trust/validity clearance is inferred from the media table alone.',
     'wholeObligationLimit': 'Matching all canonical validity and relevance wording is an explicit author interpretation, not a literal single standards bullet. The two source reviewers must decide it independently; all earlier whole-duty/operator limits remain.'},
    {'goalId': '75e2eff1-f871-5461-9e3f-26d0b333ce2f',
     'authorProposedBridge': 'Lower question/hypothesis component: KMK2024 MSA physical11 E1.1 explicitly includes developing both questions and hypotheses; E1.2 requires checking them. Historical2004 physical13 E1/E2 and physical10 background are comparison evidence only.',
     'mediaAdditionalBoundedSupport': None,
     'wholeObligationLimit': 'Self-justification and expected supporting/counter findings are not asserted as literal E1.1 statements. The exact SL grade/scope/version bridge is unresolved. Preserve the whole lower-target HOLD until genuinely reviewed; do not apply upper AHR to SekI.'},
]
for row in rows:
    row['wholeCurrentInactiveGoal'] = goals[row['goalId']]
    row['independentSourceStatus'] = 'PENDING_TWO_GENUINE_TARGETED_REVIEWS'
targets = write('three-whole-current-targets-and-evidence-bridges.author-candidate.json', {
    'schemaVersion': 1, 'role': 'New actual framework evidence; targeted source decisions pending',
    'wholeCandidateBinding': bind(candidate_path), 'rows': rows,
    'previous26ProfilesAnd52DEENCasesNotRewritten': True,
    'previous65SLAnd1646NationalWholeDutiesNotReplaced': True,
    'previousReviewFindingsNotOverwritten': True,
    'previousFirstSealed38PartialRolesRemainTheirOwnEvidence': True,
    'sourceApproval': False, 'nativeDPApproval': False, 'activeWrites': 0, 'strictGain': 0, 'humanApproval': False,
})
entry = write('neutral-three-current-SL-framework-bridges.author.entry.json', {
    'schemaVersion': 1, 'role': 'Neutral actual source-framework supplement; peer reviews not included',
    'createdAt': datetime.now(timezone.utc).isoformat(),
    'previousAuthorSeal': bind(OLD / 'author.final.freeze.json'),
    'wholePreviousAuthorEntry': bind(OLD / 'bounded-neutral-sl-source-placement-review-entry.json'),
    'actualPrimaryReadings': primary, 'currentSubjectBridge': bridge, 'wholeCurrentTargetCandidates': targets,
    'primaryVersionAndScopeLimitsMustBeReviewed': True,
    'allOriginalWholeDutiesAndCurrentPartnersRetained': True,
    'twoIndependentSourceJudgmentsRequired': True, 'noHistoricalReviewRestart': True,
    'sourceApproval': False, 'nativeDPApproval': False, 'activeWrites': 0, 'strictGain': 0, 'humanApproval': False,
})
spec = importlib.util.spec_from_file_location('normal_schemas', ROOT / 'scripts/validate_schemas.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
schema = read(ROOT / 'docs/landscape-runtime.schema.json')
checks = []
for p in sorted(OWN.glob('*.json')):
    checks.append({'path': str(p.relative_to(ROOT)), 'normalValidateFilePASS': bool(mod.validate_file(str(p.relative_to(ROOT)), schema))})
assert all(c['normalValidateFilePASS'] for c in checks)
assert [bind(p) for p in active_paths] == before
guard = write('targeted-normal-schemas-and-active-exact-guard.actual.json', {
    'schemaVersion': 1, 'ordinaryValidatorUnchanged': True, 'checks': checks,
    'activeWholeBindingsExactBeforeAfter': before,
    'originalAuthorPayloadsVerifiedExact': True, 'activeWrites': 0, 'strictGain': 0,
})
seal = write('author.first.freeze.json', {
    'schemaVersion': 1, 'role': 'First immutable author evidence, no approval',
    'createdAt': datetime.now(timezone.utc).isoformat(),
    'payloads': [primary, bridge, targets, entry, guard, bind(Path(__file__).resolve())],
    'sourceDecisionsPending': True, 'strictGain': 0, 'activeWrites': 0,
})
print(json.dumps({'entry': entry, 'seal': seal, 'normalTargetedFilesPASS': len(checks), 'activeWrites': 0, 'strictGain': 0}))
