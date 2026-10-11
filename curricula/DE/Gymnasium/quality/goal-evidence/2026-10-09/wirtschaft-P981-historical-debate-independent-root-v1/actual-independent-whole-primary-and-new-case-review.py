import base64
import hashlib
import importlib.util
import io
import json
import pathlib
import re
import subprocess
from datetime import datetime, timezone

from pypdf import PdfReader

ROOT = pathlib.Path.cwd()
AUTHOR = pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-BE-market02-real-German-GWB-discussion-P981-third-case-author-v1')
OUTPUT = pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-P981-historical-debate-independent-root-v1')
RECEIPT = OUTPUT / 'actual-final-independent-whole-P981-third-case-KEEP-two-current-source-facets-REVISE.receipt.json'
if RECEIPT.exists():
    raise RuntimeError('Immutable review output exists')

def sha(p):
    return 'sha256:' + hashlib.sha256((ROOT / p).read_bytes()).hexdigest()

def bind(p):
    return {'path': str(p), 'sha256': sha(p)}

def read(p):
    return json.loads((ROOT / p).read_text())

input_path = AUTHOR / 'actual-whole-old-P2-current-P3-Source2-with-portable-primary-inputs.successor-v3.json'
dossier_path = AUTHOR / 'actual-portable-whole-primary-dossier-and-unchanged-own-bilingual-reading-aids.successor-v3.json'
original_dossier_path = AUTHOR / 'actual-dated-German-competition-policy-debate-whole-primary-dossier-and-own-bilingual-reading-aid.json'
technical_receipt = OUTPUT / 'actual-independent-P981-three-cases-current-QA-binding-only-and-exact-valid-history-reuse.receipt.json'
inputs = read(input_path)
dossier = read(dossier_path)
old_dossier = read(original_dossier_path)
guards = [bind(input_path), bind(dossier_path), bind(original_dossier_path), bind(technical_receipt)]
assert dossier['contextDe'] == old_dossier['contextDe']
assert dossier['contextEn'] == old_dossier['contextEn']
sources = []
required_paths = []
for source, old in zip(dossier['sources'], old_dossier['sources']):
    for key in ['author', 'actualDate', 'documentId', 'officialURL', 'selectedLocator', 'ownReadingAidDe', 'ownReadingAidEn']:
        assert source[key] == old[key], key
    text_binding = source['committableWholeOriginalText']
    archive_binding = source['committableWholePDFExactByteArchive']
    text_path = pathlib.Path(text_binding['path'])
    archive_path = pathlib.Path(archive_binding['path'])
    assert sha(text_path) == text_binding['sha256']
    assert sha(archive_path) == archive_binding['sha256']
    archive = read(archive_path)
    raw = base64.b64decode(archive['rawBodyBase64'], validate=True)
    assert 'sha256:' + hashlib.sha256(raw).hexdigest() == archive['decodedRawSHA256']
    assert 'sha256:' + hashlib.sha256(raw).hexdigest() == old['wholeOriginalPDF']['sha256']
    pdf = PdfReader(io.BytesIO(raw))
    assert len(pdf.pages) == 8
    extracted = ''.join(f'PDF PAGE {i + 1}\n{page.extract_text()}\n' for i, page in enumerate(pdf.pages))
    whole_text = (ROOT / text_path).read_text()
    normalize = lambda text: re.sub(r'\s+', '', text.replace('\uf0b7', '•'))
    assert normalize(extracted) == normalize(whole_text), 'Whole substantive primary extraction differs'
    assert source['actualDate'] == '2023-06-12'
    assert '14. Juni 2023' in pdf.pages[0].extract_text()
    assert '12. Juni 2023' in pdf.pages[0].extract_text()
    sources.append({
        'author': source['author'], 'officialURL': source['officialURL'], 'documentId': source['documentId'],
        'actualStatementDate': source['actualDate'], 'actualHearingDate': '2023-06-14',
        'wholeText': bind(text_path), 'wholePortablePDFArchive': bind(archive_path),
        'decodedOriginalPDFSHA256': archive['decodedRawSHA256'],
        'actualWholePagesIndependentlyRead': 8, 'actualWholePageTextMatchesExactOriginalPDF': True,
        'wholeExtractedTextComparisonNormalization': 'Whitespace removed and PDF bullet glyph U+F0B7 normalized to the same visible bullet. No words, numerical values or punctuation omitted; the archived original bytes and source text are unchanged.',
        'ownReadingAidComparedAgainstAllEightPages': True,
    })
    required_paths += [text_path, archive_path]
    guards += [bind(text_path), bind(archive_path)]

for suffix in ['actual-Peitz-20230612-A20-9-263.actual-original-PDF3.png', 'actual-Boettcher-20230612-A20-9-267.actual-original-PDF3.png']:
    image_path = AUTHOR / 'primary' / suffix
    guards.append(bind(image_path))
    required_paths.append(image_path)

source_binding = inputs['actualSource125Binding']
assert sha(pathlib.Path(source_binding['path'])) == source_binding['sha256']
current_rows = {row['id']: row for row in read(pathlib.Path(source_binding['path']))['sourceGoals']}
source_decisions = []
for row in inputs['actualWholeCurrentSource125Rows']:
    assert row == current_rows[row['id']], 'Whole source row changed'
    assert 'aktueller Probleme und Diskussionen' in row['description']
    source_decisions.append({
        'sourceAspectId': row['id'], 'wholeCurrentSourceRow': row, 'decision': 'REVISE',
        'scope': 'Whole source-performance union; qualified historical-debate part accepted, current relevance remains unperformed.',
        'reasonDe': 'Der neue Fall prüft reale deutsche Gegenpositionen, Instrumentenmechanismen und Grenzen aus der tatsächlichen Anhörung von Juni 2023. Er erklärt den damaligen Entwurf ausdrücklich nicht zu heutigem Recht. Die Quellenleistung verlangt daneben aktuelle Probleme und Diskussionen; der neue Fall enthält noch keine tatsächliche Verbindung zur heutigen Ausgestaltung, einer gegenwärtigen Anwendung oder einem aktuellen Problembeleg. Der historische Diskussionsrest ist fachlich verbessert, die ganze aktuelle Quellenleistung bleibt offen.',
        'boundedAcceptedNewPerformance': 'Actual dated German institutional debate, opposed primary arguments, conditional instrument judgement and stated temporal boundaries.',
        'genuineRemainingPerformance': 'Dated present problem or actual current instrument design, with a task that relates it to the substantive historical arguments instead of asserting their present applicability.',
        'priorSupplementaryUnionRetained': inputs['explicitRemainingUnionGoalsPreserved'][row['id']],
        'supplementaryReviewReuseAuthority': inputs['actualIndependentSource17ReviewBinding'],
        'wholeCanonicalCourseRoleApproved': False, 'nativeMappedDecisionApproved': False,
        'wholeSource125Approved': False, 'humanApproval': False, 'strictGain': 0,
    })
guards.append(bind(pathlib.Path(source_binding['path'])))
guards.append(bind(pathlib.Path(inputs['actualIndependentSource17ReviewBinding']['path'])))
spec = importlib.util.spec_from_file_location('skillpilot_validate_schemas', ROOT / 'scripts/validate_schemas.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
symlink_errors = module.curriculum_symlink_errors(str(ROOT))
assert not symlink_errors
ignored_inputs = []
for p in required_paths + [input_path, dossier_path]:
    check = subprocess.run(['git', 'check-ignore', '-q', str(p)], cwd=ROOT)
    if check.returncode == 0:
        ignored_inputs.append(str(p))
    assert check.returncode in (0, 1)
assert not ignored_inputs
after = [bind(pathlib.Path(item['path'])) for item in guards]
assert after == guards, 'Independent review inputs changed'
result = {
    'at': datetime.now(timezone.utc).isoformat(), 'reviewer': '/root', 'author': '/root/economics_merge_audit',
    'wholeCurrentP3Input': bind(input_path), 'actualPrimaryDossier': bind(dossier_path),
    'decision': 'KEEP whole P981 new third case; REVISE both whole current Source125 facets for missing present connection.',
    'actualReviewMethod': 'Whole unchanged goal and whole DE/EN three-case profile read; two valid independently reviewed old cases reused exactly. The actual new bilingual case and own reading aids were compared with both complete eight-page originals in four untruncated page chunks and two original page raster views. Official primary URLs were independently opened. Numeric work is absent in the new case; no fictitious numeric check count is claimed.',
    'substantivePositiveJudgment': {
        'goalId': '98136a27-120d-5278-b9b9-d833c0ea5fc0', 'decision': 'KEEP',
        'reasonDe': 'Der Fall verlangt eine bedingte begründete Instrumentenwahl, Wirkungsweg, Alternative und Gegenbefund. Peitz begründet strukturbezogene Abhilfen auch ohne nachweisbaren Missbrauch und die Auswahl zwischen ähnlich wirksamen Maßnahmen nach Aufwand und Belastung. Böttcher bestreitet die Lücke, warnt vor Unberechenbarkeit und bevorzugt gezielte Sektorgesetzgebung beziehungsweise konsequente bisherige Instrumente. Der Arbeitgebersichtpunkt ist offengelegt. Die Lernleistung trennt Meinung, Beleg, damaligen Entwurf, heutige Rechtsgeltung und wirkliche Behördenentscheidung. Die tatsächlichen widersprechenden Quellen erweitern den Transfer ohne den ursprünglichen Zielvertrag auszudehnen.',
        'wholeGoalUnchanged': True, 'wholeTwoPriorCasesUnchanged': True,
        'wholePriorExpectationsAndCoverageUnchanged': True,
        'newWholeDEENCaseActuallyReviewed': True, 'actualWholeOriginalPagesRead': 16,
        'actualOriginalRasterViews': 2, 'statusPreserved': 'needs_human_review',
        'reviewAuthorityPreserved': 'ai_candidate', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
    },
    'primarySources': sources, 'individualWholeCurrentSourceFacetDecisions': source_decisions,
    'separateActualTechnicalBindingOnlyReceipt': bind(technical_receipt),
    'originalIgnoredPDFsAreProvenanceOnlyNotRequiredReviewTargets': True,
    'actualRequiredCommittableInputsIgnored': ignored_inputs, 'actualCurriculumSymlinkErrors': symlink_errors,
    'before': guards, 'after': after, 'originalHistoryBytesPreserved': True,
    'nativeDOrNewVisualOrCourseOrWholeSource125OrHumanApproval': False,
    'liveWrites': False, 'strictCurrent': 300, 'currentDenominator': 311,
    'newStrictAcademicClosures': 0, 'restoredStrictBindings': 0, 'strictNetGain': 0,
    'next': 'Retain qualified P3 and actual image binding; perform a genuine present source-performance addition before changing either source-facet verdict or final owner-page freeze.',
}
(ROOT / RECEIPT).write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
assert read(RECEIPT) == result
print(json.dumps({'receipt': bind(RECEIPT), 'positiveKEEP': 1, 'wholeSourceREVISE': 2, 'actualWholePrimaryPages': 16, 'actualOriginalPageViews': 2, 'inputGuards': len(guards), 'strictNetGain': 0}))
