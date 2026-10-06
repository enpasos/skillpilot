"""Exact scoped verification for the independent A follow-up; no active writes."""
from pathlib import Path
import hashlib
import json
import subprocess
from datetime import datetime, timezone

REPO = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
BASE = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06'
V7 = BASE / 'biologie-q1-seven-component-source-topic-corrections-author-v7'
V6 = BASE / 'biologie-q1-seven-component-native-source-preparation-author-v6'
OLD_A = BASE / 'biologie-q1-seven-native-v6-independent-a-v1'
EXPECTED_V7_FREEZE = '074398d806ac450ae1964eecdba05198fd370861fbd340064b751db486638cf4'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def read(path):
    return json.loads(path.read_text())

def bind(path):
    return {'path': str(path.relative_to(REPO)), 'sha256': sha(path), 'bytes': path.stat().st_size}

def write(name, value):
    (OWN / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

assert not (OWN / 'independent-a-followup.final.freeze.json').exists(), 'Frozen review package'
freeze_path = V7 / 'source-topic-corrections.author-v7.final.freeze.json'
assert sha(freeze_path) == EXPECTED_V7_FREEZE
closure = []
for freeze in [freeze_path, OLD_A / 'independent-a.final.freeze.json', V6 / 'native-seven-source-preparation.author-v6.final.freeze.json']:
    body = read(freeze)
    for item in body['files']:
        path = freeze.parent / item['path']
        assert sha(path) == item['sha256'] and path.stat().st_size == item['bytes'], str(path)
        closure.append(bind(path))
    for item in body.get('exactReviewInputBindings', []):
        path = REPO / item['path']
        assert sha(path) == item['sha256'], str(path)
        closure.append(bind(path))

active_manifest = BASE / 'chemie-q1-current378-active-integration-verification-v1/final-current-machine-checks-and-inputs.actual.json'
active = read(active_manifest)['currentInputs']
for item in active:
    assert sha(REPO / item['path']) == item['sha256'], item['path']
write('actual-input-closure-and-active19-preservation.json', {
    'schemaVersion': 1, 'createdAtUTC': datetime.now(timezone.utc).isoformat(),
    'authorV7Freeze': bind(freeze_path), 'historicalExactClosureBindings': closure,
    'active19Manifest': bind(active_manifest), 'activeInputs': active,
    'activeInputCount': len(active), 'allExact': True, 'activeWrites': False,
    'historicalReviewRestarted': False, 'hashValidationIsNotScientificApproval': True,
})

source_manifest = read(V7 / 'fresh-scoped-original-pdf-source-bindings.actual.json')
source_dir = OWN / 'sources'
source_dir.mkdir(exist_ok=True)
source_rows = []
for item in source_manifest['sources']:
    pdf = REPO / item['officialPDF']['path']
    assert sha(pdf) == item['officialPDF']['sha256']
    dest = source_dir / f"{item['region']}.physical-{item['physicalPage']:03d}.independent-original-pdf.txt"
    command = ['pdftotext', '-layout', '-f', str(item['physicalPage']), '-l', str(item['physicalPage']), str(pdf), str(dest)]
    proc = subprocess.run(command, capture_output=True, text=True)
    assert proc.returncode == 0, proc.stderr
    author_text = REPO / item['scopedText']['path']
    assert dest.read_bytes() == author_text.read_bytes()
    source_rows.append({'region': item['region'], 'physicalPage': item['physicalPage'], 'originalPDF': bind(pdf),
                        'officialURL': item['officialURL'], 'actualText': bind(dest),
                        'authorScopedTextExact': True, 'command': command, 'exitCode': proc.returncode})

# The v7 MV locator is the real table of contents. Also bind the actual section
# heading itself so that TOC evidence is never represented as a body heading.
mv_pdf = REPO / 'curricula/DE/Gymnasium/input/MV/Biologie_Gymnasium_Gesamtschule_7_10.pdf'
mv_section = source_dir / 'MV.physical-017.actual-section-heading.independent-original-pdf.txt'
command = ['pdftotext', '-layout', '-f', '17', '-l', '17', str(mv_pdf), str(mv_section)]
proc = subprocess.run(command, capture_output=True, text=True)
assert proc.returncode == 0
source_rows.append({'region': 'MV', 'physicalPage': 17, 'originalPDF': bind(mv_pdf), 'actualText': bind(mv_section),
                    'purpose': 'additional actual body parent-heading verification, v7 physical4 is correctly a TOC locator',
                    'command': command, 'exitCode': proc.returncode})
write('fresh-independent-original-page-extractions.actual.json', {'schemaVersion': 1, 'rows': source_rows,
      'wholeOfficialPDFCopies': 0, 'activeWrites': False})

deltas = read(V7 / 'eleven-topic-code-and-qualified-parent-deltas.author-v7.json')['rows']
findings = {row['sourceGoalId']: row for row in read(OLD_A / 'eleven-source-topic-binding-findings.review.json')['findings']}
effective = read(V7 / 'effective-native-inputs.author-v7.json')
checks = []
for region in ['SN', 'TH', 'MV', 'ST']:
    old = read(V6 / f'{region}.source-components.author-candidate.inert-envelope.json')['candidatePayload']
    new = read(V7 / f'{region}.source-components.author-v7.inert-envelope.json')['candidatePayload']
    assert old['passages'] == new['passages']
    assert set(old) == set(new)
    for key in old:
        if key != 'sourceGoals':
            assert old[key] == new[key], (region, key)
    mappings = read(V6 / f'{region}.source-component-mappings.author-candidate.inert-envelope.json')['candidatePayload']
    for index, (before, after) in enumerate(zip(old['sourceGoals'], new['sourceGoals'], strict=True)):
        changed = sorted(key for key in set(before) | set(after) if before.get(key) != after.get(key))
        assert changed == ['sourceRef', 'sourceSectionContext', 'topicCode'], (region, changed)
        delta = next(row for row in deltas if row['sourceGoalId'] == after['id'])
        previous_finding = findings[after['id']]
        assert after['topicCode'] == previous_finding['proposedCorrectOfficialParentCode'] == delta['afterTopicCode']
        assert after['sourceSectionContext']['officialParentCode'] == after['topicCode']
        assert after['sourceSectionContext']['authorComponentIsAnOfficialNumberedBullet'] is False
        assert after['isOfficialBullet'] is False and after['officialNumberingClaim'] is False
        assert after['wholeOriginalBulletCoverage'] is False and after['wholeOriginalSummaryPreserved'] is True
        own_text = source_dir / f"{region}.physical-{after['physicalPage']:03d}.independent-original-pdf.txt"
        assert after['rawSourceText'] in own_text.read_text(), (region, after['id'], 'raw words not contiguous')
        assert after['rawParentBulletText'] in own_text.read_text()
        mapping = next(row for row in mappings['mappings'] if row['legacyGoalId'] == after['id'])
        assert mapping['canonicalGoalId'] == delta['canonicalGoalId'] and mapping['matchType'] == 'partial'
        checks.append({'findingId': delta['findingId'], 'region': region, 'sourceGoalId': after['id'],
            'canonicalGoalId': mapping['canonicalGoalId'], 'candidatePointer': f'/candidatePayload/sourceGoals/{index}',
            'changedFields': changed, 'beforeTopicCode': before['topicCode'], 'afterTopicCode': after['topicCode'],
            'sectionContext': after['sourceSectionContext'], 'actualRawPage': bind(own_text),
            'rawParentAndComponentWordsExactAndPresent': True, 'mappingMatchType': 'partial',
            'unchangedDescriptionsIDsPagesStageCourseAndRawWords': True,
            'sourceRefActuallyQualifiesYearAndParent': after['sourceSectionContext']['yearHeading'] in after['sourceRef'],
            'wholeOriginalSourceHoldReleased': False})
assert len(checks) == 11
for region in ['BE', 'BB']:
    entry = next(row for row in effective['sourceInputs'] if row['region'] == region and row['kind'] == 'source-extraction')
    assert entry['unchangedV6Input'] is True
    assert sha(REPO / entry['envelope']['path']) == entry['envelope']['sha256']
    assert all(row['topicCode'] == '3.7' for row in read(REPO / entry['envelope']['path'])['candidatePayload']['sourceGoals'])
write('eleven-actual-field-page-component-and-mapping-checks.json', {'schemaVersion': 1, 'checks': checks,
    'BE_BBExactUnchangedAndNotRereviewed': True, 'originalHoldsPreserved': True,
    'activeWrites': False, 'strictGain': 0})

# Verify the already reviewed whole-goal objects, rather than re-reviewing or
# silently rewriting their individual scientific or memory decisions.
canonical = json.loads(read(REPO / effective['canonicalEnvelope']['path'])['candidateCanonicalUTF8'])
goals = {goal['id']: goal for goal in canonical['goals']}
science = read(OLD_A / 'seven-science-atomicity-prerequisite-memory.review.json')
reuse = []
for row in science['goals']:
    goal = goals[row['goalId']]
    actual = hashlib.sha256(json.dumps(goal, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
    assert actual == row['wholeCurrentGoalSHA256']
    assert goal['description'] == row['descriptionDE'] and goal['descriptionEn'] == row['descriptionEN']
    assert goal['requires'] == row['requires']
    reuse.append({'goalId': row['goalId'], 'wholeGoalSHA256': actual, 'unchangedWholeGoalExact': True,
                 'existingScientificSemanticAtomicityMaterialAndMemoryDecision': 'KEEP/reused exact individual A judgement',
                 'memoryDecision': row['memoryDecision'], 'newMemoryDecisionOrCardsCreated': False})
assert len(reuse) == 7
write('exact-seven-existing-science-atomicity-memory-reuse.json', {'schemaVersion': 1,
      'existingIndependentA': bind(OLD_A / 'seven-science-atomicity-prerequisite-memory.review.json'),
      'rows': reuse, 'historicalScienceReviewsRestarted': False, 'newNativeD_P_A_M_VRecords': 0})
print(json.dumps({'closureExact': len(closure), 'active19Exact': len(active), 'actualOriginalScopedPages': len(source_rows),
                  'elevenActualFieldAndRawChecks': len(checks), 'sevenExactScienceMemoryReused': len(reuse), 'activeWrites': False}))
