"""Materialize only the eleven proven source-section corrections; never edit history."""
from copy import deepcopy
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path
import re
import subprocess

REPO = Path.cwd()
BASE = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06'
V6 = BASE / 'biologie-q1-seven-component-native-source-preparation-author-v6'
A6 = BASE / 'biologie-q1-seven-native-v6-independent-a-v1'
OUT = BASE / 'biologie-q1-seven-component-source-topic-corrections-author-v7'
assert not (OUT / 'source-topic-corrections.author-v7.final.freeze.json').exists()
OUT.mkdir(parents=True, exist_ok=True)
NOW = datetime.now(timezone.utc).isoformat()


def read(path):
    return json.loads(Path(path).read_text())


def put(name, value):
    path = OUT / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def binding(path, purpose=None):
    path = Path(path)
    row = {'path': str(path.relative_to(REPO)), 'sha256': sha256(path.read_bytes()).hexdigest(), 'bytes': path.stat().st_size}
    if purpose:
        row['actualUse'] = purpose
    return row


def verify_freeze(path):
    manifest = read(path)
    for row in manifest['files']:
        file = Path(path).parent / row['path']
        assert sha256(file.read_bytes()).hexdigest() == row['sha256'], file
        assert file.stat().st_size == row['bytes'], file
    return {'freeze': binding(path), 'ownFilesVerified': len(manifest['files']), 'allExact': True}


closure = [verify_freeze(V6 / 'native-seven-source-preparation.author-v6.final.freeze.json'),
           verify_freeze(A6 / 'independent-a.final.freeze.json')]
findings = read(A6 / 'eleven-source-topic-binding-findings.review.json')['findings']
assert len(findings) == 11

# Fresh local pdftotext outputs come directly from the original official PDFs.
# We retain small scoped text excerpts, not another complete PDF/tree copy.
scope = {
    'SN': {'code': '1', 'parent': 'Lernbereich 1: Genetik', 'year': 'Klassenstufe 10', 'headingPage': 42,
           'printedHeadingPage': 30, 'pages': [42, 43], 'yearPages': [42], 'unnumbered': None},
    'TH': {'code': '2.2.1.3', 'parent': '2.2.1.3 Genetik', 'year': 'Klassenstufen 9/10', 'headingPage': 28,
           'printedHeadingPage': 22, 'pages': [26, 28, 29], 'yearPages': [26], 'unnumbered': None},
    'MV': {'code': '3.2', 'parent': '3.2 Unterrichtsinhalte', 'year': 'Klasse 10', 'headingPage': 4,
           'printedHeadingPage': None, 'pages': [4, 28, 30], 'yearPages': [28], 'unnumbered': 'Klassische Genetik'},
    'ST': {'code': '3.5', 'parent': '3.5 Schuljahrgang 10 (Einführungsphase)', 'year': 'Schuljahrgang 10 (Einführungsphase)', 'headingPage': 42,
           'printedHeadingPage': 42, 'pages': [42, 43], 'yearPages': [42], 'unnumbered': None},
}
fresh_sources = []
texts = {}
for region, row in scope.items():
    old = read(V6 / f'{region}.source-components.author-candidate.inert-envelope.json')
    document = old['candidatePayload']['sourceDocument']
    pdf = REPO / document['path']
    texts[region] = {}
    for page in row['pages']:
        dest = OUT / 'sources' / f'{region}.physical-{page:03}.fresh-original-pdf.txt'
        dest.parent.mkdir(parents=True, exist_ok=True)
        command = ['pdftotext', '-layout', '-f', str(page), '-l', str(page), str(pdf), str(dest)]
        result = subprocess.run(command, capture_output=True, text=True)
        assert result.returncode == 0, result.stderr
        texts[region][page] = dest.read_text()
        fresh_sources.append({'region': region, 'physicalPage': page, 'officialPDF': binding(pdf),
                              'officialURL': document['url'], 'scopedText': binding(dest),
                              'command': command, 'exitCode': result.returncode})

def norm(text):
    return re.sub(r'\s+', ' ', text).strip()

# Actual table/page headings are read and checked, not inferred from another state.
assert 'Klassenstufe 10' in texts['SN'][42]
assert 'Lernbereich 1: Genetik' in norm(texts['SN'][42])
assert '2.2.1.3 Genetik' in norm(texts['TH'][28])
assert 'Klassenstufen 9/10' in norm(texts['TH'][26])
assert '3.2 Unterrichtsinhalte' in norm(texts['MV'][4])
assert 'Klasse 10' in texts['MV'][28]
assert 'Klassische Genetik' in texts['MV'][30]
assert not re.search(r'3\.\d+\s+Klassische Genetik', texts['MV'][30])
assert '3.5 Schuljahrgang 10 (Einführungsphase)' in norm(texts['ST'][42])

corrected = []
effective = []
for region in ['BE', 'BB', 'SN', 'TH', 'MV', 'ST']:
    old_path = V6 / f'{region}.source-components.author-candidate.inert-envelope.json'
    old = read(old_path)
    path = old_path
    if region in scope:
        value = deepcopy(old)
        row = scope[region]
        for index, goal in enumerate(value['candidatePayload']['sourceGoals']):
            finding = next(f for f in findings if f['sourceGoalId'] == goal['id'])
            assert finding['region'] == region and goal['topicCode'] == '3.7'
            assert finding['proposedCorrectOfficialParentCode'] == row['code']
            # The original words, source IDs, pages, stage and course data stay exact.
            actual_text = texts[region][goal['physicalPage']]
            assert norm(goal['rawSourceText']) in norm(actual_text)
            assert norm(goal['rawParentBulletText']) in norm(actual_text)
            goal['topicCode'] = row['code']
            suffix = row['parent'] + ' / ' + row['year']
            if row['unnumbered']:
                suffix += ' / unnumbered subsection: ' + row['unnumbered']
            goal['sourceRef'] += '; verified actual parent section: ' + suffix
            goal['sourceSectionContext'] = {
                'officialParentCode': row['code'], 'officialParentHeading': row['parent'],
                'yearHeading': row['year'], 'parentHeadingPhysicalPage': row['headingPage'],
                'parentHeadingPrintedPage': row['printedHeadingPage'],
                'yearHeadingPhysicalPages': row['yearPages'],
                'unnumberedSubsectionHeading': row['unnumbered'],
                'subsectionHasOfficialNumber': False,
                'authorComponentIsAnOfficialNumberedBullet': False,
                'proofMethod': 'read original official PDF scoped pages and actual table/year/section headings',
            }
            before = old['candidatePayload']['sourceGoals'][index]
            fields = [key for key in set(before) | set(goal) if before.get(key) != goal.get(key)]
            assert set(fields) == {'topicCode', 'sourceRef', 'sourceSectionContext'}
            assert {k: v for k, v in goal.items() if k not in fields} == {k: v for k, v in before.items() if k not in fields}
            corrected.append({
                'findingId': finding['findingId'], 'sourceGoalId': goal['id'],
                'canonicalGoalId': finding['canonicalGoalId'], 'region': region,
                'sourceGoalJSONPointer': f'/candidatePayload/sourceGoals/{index}',
                'beforeTopicCode': before['topicCode'], 'afterTopicCode': goal['topicCode'],
                'beforeSourceRef': before['sourceRef'], 'afterSourceRef': goal['sourceRef'],
                'newSourceSectionContext': goal['sourceSectionContext'],
                'actualChangedFields': sorted(fields),
                'actualScienceCorrection': 'Replace the BE/BB-only copied section number with the actual official parent; qualify repeated learning-area/year and unnumbered local section.',
                'rawWordsIDsDescriptionsPagesStageAndCourseFieldsExact': True,
                'wholeOriginalSourceHoldReleased': False,
                'authorResolution': 'candidate_correction_pending_independent_followup',
            })
        value['role'] = 'targeted author v7 actual section correction, not independent clearance or active source input'
        value['baseUnchangedExtraction'] = binding(old_path)
        value['historicalProspectivePathRetained'] = True
        value['prospectivePathNote'] = 'The stable v6 extraction ID/path is retained inside this isolated overlay; the new envelope records its v7 provenance. No historical v6 bytes are overwritten.'
        name = f'{region}.source-components.author-v7.inert-envelope.json'
        put(name, value)
        path = OUT / name
    effective.append({'region': region, 'kind': 'source-extraction',
                      'envelope': binding(path), 'prospectivePath': old['prospectivePath'],
                      'unchangedV6Input': region in ['BE', 'BB']})
    mapping_path = V6 / f'{region}.source-component-mappings.author-candidate.inert-envelope.json'
    mapping = read(mapping_path)
    effective.append({'region': region, 'kind': 'source-mapping', 'envelope': binding(mapping_path),
                      'prospectivePath': mapping['prospectivePath'], 'unchangedV6Input': True})
assert len(corrected) == 11
put('eleven-topic-code-and-qualified-parent-deltas.author-v7.json', {
    'schemaVersion': 1, 'createdAtUTC': NOW, 'role': 'author candidate resolutions, fresh independent decisions pending',
    'findingInput': binding(A6 / 'eleven-source-topic-binding-findings.review.json'), 'rows': corrected,
    'unchangedBE_BBActualCode': '3.7', 'changedRawOrCanonicalGoalFields': 0,
    'hashOnlyClaim': False, 'historicalArtefactsUnmodified': True,
    'activeWrites': False, 'strictGain': 0, 'humanApproval': False, 'humanTrial': False,
})
put('fresh-scoped-original-pdf-source-bindings.actual.json', {
    'schemaVersion': 1, 'createdAtUTC': NOW, 'sources': fresh_sources,
    'scopedTextsRead': True, 'completeOfficialDocumentsCopied': 0,
    'elevenActualOriginalRawPassagesStillExact': True,
    'nativeMappedComponentsArePartialNotWholeOriginalClearance': True,
})
put('effective-native-inputs.author-v7.json', {
    'schemaVersion': 1, 'createdAtUTC': NOW, 'role': 'thin exact overlay; unchanged reviewed candidate semantics referenced once',
    'canonicalEnvelope': binding(V6 / 'canonical-390.component-first.author-candidate.inert-envelope.json'),
    'semanticEnvelope': binding(V6 / 'semantic-kind-native-input.component-first.author-candidate.inert-envelope.json'),
    'sourceInputs': effective,
    'sourceViews': binding(V6 / 'source-view-route-and-prerequisite-only.author-candidate.json'),
    'sevenGoalsAndPrerequisites': binding(V6 / 'seven-resolved-goals-and-prerequisite-contract.author-candidate.json'),
    'caseBindings': binding(V6 / 'twentyfour-case-to-final-id.native-binding-plan.author-v6.json'),
    'sourceResidualContract': binding(V6 / 'source-route-and-residual-contract.author-v6.json'),
    'STCommonEntryScopeProof': binding(V6 / 'ST.common-entry-phase-derived-projection.primary-proof.author-v6.json'),
    'activeWrites': False, 'candidateCount': 390, 'currentBiologyCount': 383,
    'independentAExistingSevenScienceMemoryAndMaterialsDecision': binding(A6 / 'seven-science-atomicity-prerequisite-memory.review.json'),
    'independentAOriginalScopeReview': binding(A6 / 'ST-common-entry-scope.independent-a.review.json'),
    'previousNativeSourceBookReceipt': binding(A6 / 'independent-native-source-book-dag.actual.json'),
    'sourceHistoryClosureVerified': closure,
})
print(json.dumps({'correctedTopicBindings': len(corrected), 'newScopedTextFiles': len(fresh_sources), 'activeWrites': False, 'strictGain': 0}))
