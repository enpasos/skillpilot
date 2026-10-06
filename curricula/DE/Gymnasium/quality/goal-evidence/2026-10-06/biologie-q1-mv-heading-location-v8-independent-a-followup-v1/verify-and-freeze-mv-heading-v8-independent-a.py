"""Independent targeted A review of exactly six corrected v8 source fields."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import subprocess

REPO = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
BASE = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06'
V7 = BASE / 'biologie-q1-seven-component-source-topic-corrections-author-v7'
V8 = BASE / 'biologie-q1-mv-heading-location-targeted-author-v8'
PREVIOUS_A = BASE / 'biologie-q1-eleven-source-topic-v7-independent-a-followup-v1'
STAMP = datetime.now(timezone.utc).isoformat()

def read(path):
    return json.loads(path.read_text())

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def bind(path):
    return {'path': str(path.relative_to(REPO)), 'sha256': sha(path), 'bytes': path.stat().st_size}

def write(name, value):
    (OWN / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

assert not (OWN / 'independent-a-v8-heading-followup.final.freeze.json').exists(), 'Frozen review'
author_freeze = V8 / 'author-mv-heading-v8.final.freeze.json'
assert sha(author_freeze) == 'a2a380e791569b88a1bda3e708adc781938bace716dfd737cf4760fbab927ee8'
inputs = {}
for row in read(author_freeze)['ownFiles'] + read(author_freeze)['inputBindings']:
    path = REPO / row['path']
    assert sha(path) == row['sha256'] and path.stat().st_size == row['bytes'], row['path']
    inputs[row['path']] = row
inputs[str(author_freeze.relative_to(REPO))] = bind(author_freeze)
previous_freeze = PREVIOUS_A / 'independent-a-followup.current-v2.final.freeze.json'
assert sha(previous_freeze) == 'f67e3944c3a25b795ded07881f2a33da2ad780cd202263f1cfd6c46283274733'
for row in read(previous_freeze)['files']:
    path = PREVIOUS_A / row['path']
    assert sha(path) == row['sha256'], str(path)
inherited_input_changes = []
for row in read(previous_freeze)['exactReviewInputBindings']:
    path = REPO / row['path']
    current = bind(path)
    if current['sha256'] != row['sha256']:
        inherited_input_changes.append({'path': row['path'], 'historicalExpected': row,
                                        'actualCurrent': current})
    inputs[row['path']] = current
assert len(inherited_input_changes) == 1 and inherited_input_changes[0]['path'] == 'AGENTS.md'
policy_parent = subprocess.run(['git', 'show', 'fbc4e2bc5^:AGENTS.md'], capture_output=True)
assert policy_parent.returncode == 0
assert hashlib.sha256(policy_parent.stdout).hexdigest() == inherited_input_changes[0]['historicalExpected']['sha256']
policy_current = subprocess.run(['git', 'show', 'fbc4e2bc5:AGENTS.md'], capture_output=True)
assert policy_current.returncode == 0 and policy_current.stdout == (REPO / 'AGENTS.md').read_bytes()
policy_diff = subprocess.run(['git', 'show', '--format=', 'fbc4e2bc5', '--', 'AGENTS.md'], capture_output=True, text=True)
assert policy_diff.returncode == 0
(OWN / 'AGENTS-gemini-only-policy-diff.actual.txt').write_text(policy_diff.stdout)
inherited_input_changes[0]['independentScopeJudgement'] = 'Actual policy diff concerns stable-origin Gemini installation/download and its unresolved image acceptance only. No curriculum source, source-review, M7 gate or image-authoring requirement changes. Historical AGENTS bindings remain truthful historical hashes; fresh review binds the actual current policy.'
inherited_input_changes[0]['actualDiffArtifact'] = bind(OWN / 'AGENTS-gemini-only-policy-diff.actual.txt')
inputs[str(previous_freeze.relative_to(REPO))] = bind(previous_freeze)
for name in ['eleven-source-topic-corrections.independent-a-followup.current-v2.review.json',
             'MV-parent-heading-location.independent-a-addendum.review.json',
             'independent-native-reproduction.actual.raw.json',
             'exact-seven-existing-science-atomicity-memory-reuse.json',
             'sources/MV.physical-017.actual-section-heading.independent-original-pdf.txt']:
    path = PREVIOUS_A / name
    inputs[str(path.relative_to(REPO))] = bind(path)

old_path = V7 / 'MV.source-components.author-v7.inert-envelope.json'
new_path = V8 / 'MV.source-components.author-v8.inert-envelope.json'
old_envelope = read(old_path)
new_envelope = read(new_path)
assert old_envelope['prospectivePath'] == new_envelope['prospectivePath']
old = old_envelope['candidatePayload']
new = new_envelope['candidatePayload']

def field_delta(before, after, pointer=''):
    if isinstance(before, dict) and isinstance(after, dict):
        assert set(before) == set(after), pointer
        return [row for key in before for row in field_delta(before[key], after[key], pointer + '/' + key)]
    if isinstance(before, list) and isinstance(after, list):
        assert len(before) == len(after), pointer
        return [row for index, (left, right) in enumerate(zip(before, after, strict=True))
                for row in field_delta(left, right, pointer + '/' + str(index))]
    return [] if before == after else [{'jsonPointer': pointer, 'before': before, 'after': after}]

deltas = field_delta(old, new, '/candidatePayload')
assert len(deltas) == 6
expected = []
for index in range(3):
    expected.extend([
        {'jsonPointer': f'/candidatePayload/sourceGoals/{index}/sourceSectionContext/parentHeadingPhysicalPage', 'before': 4, 'after': 17},
        {'jsonPointer': f'/candidatePayload/sourceGoals/{index}/sourceSectionContext/parentHeadingPrintedPage', 'before': None, 'after': 13},
    ])
assert deltas == expected
pdf = REPO / 'curricula/DE/Gymnasium/input/MV/Biologie_Gymnasium_Gesamtschule_7_10.pdf'
assert sha(pdf) == 'aa350433c07b6705d38a0673a3e9007574263aaf46617adbcdf45616aa2e37cd'
actual_page = OWN / 'MV.physical-017.fresh-independent-original-pdf.txt'
command = ['pdftotext', '-layout', '-f', '17', '-l', '17', str(pdf), str(actual_page)]
proc = subprocess.run(command, capture_output=True, text=True)
assert proc.returncode == 0, proc.stderr
assert actual_page.read_bytes() == (V8 / 'MV.physical-017.actual-original-pdf.txt').read_bytes()
text = actual_page.read_text()
assert '3.2    Unterrichtsinhalte' in text and 'Klasse 7' in text
assert '\n13' in text or text.count('13') > 0
previous_findings = read(PREVIOUS_A / 'MV-parent-heading-location.independent-a-addendum.review.json')['findings']
rows = []
for index, goal in enumerate(new['sourceGoals']):
    finding = next(row for row in previous_findings if row['sourceGoalId'] == goal['id'])
    context = goal['sourceSectionContext']
    assert context['parentHeadingPhysicalPage'] == 17 and context['parentHeadingPrintedPage'] == 13
    assert context['officialParentCode'] == '3.2' and context['yearHeading'] == 'Klasse 10'
    assert context['yearHeadingPhysicalPages'] == [28] and goal['physicalPage'] == 30 and goal['printedPage'] == 26
    assert context['unnumberedSubsectionHeading'] == 'Klassische Genetik' and context['subsectionHasOfficialNumber'] is False
    assert goal['stage'] == 'SekI' and goal['courseLevel'] == 'unspecified'
    rows.append({'findingId': finding['findingId'], 'sourceGoalId': goal['id'],
        'canonicalGoalId': finding['canonicalGoalId'], 'decision': 'KEEP', 'findingResolvedForExactV8Candidate': True,
        'actualFieldDeltas': deltas[index * 2:index * 2 + 2], 'actualOriginalBodyHeadingPage': bind(actual_page),
        'independentScientificLocationJudgement': 'The actual 3.2 Unterrichtsinhalte body heading is physical17/printed13. It begins with Klasse7, and the parent section also contains subsequent year groups. The separate Klasse10 qualifier physical28 and unnumbered Klassische Genetik physical30/printed26 remain exactly correct. The corrected fields identify the parent section rather than the former contents locator; no Klasse7 learner applicability is inferred.',
        'allOtherPayloadFieldsIncludingRawWordsUUIDsStageCourseDescriptionsAndComponentBoundariesExact': True,
        'partialMappingAndWholeOriginalSourceHold': 'KEEP inherited partial mapping; entire original source goal remains held',
        'descriptionImageOrMemoryRereviewExecuted': False, 'nativeDGranted': False})
native = read(OWN / 'affected-native-source-atlas-receipt-and-book-reuse.actual.json')
assert native['nativeSourceAtlas'] == 'PASS390' and len(native['changedBindings']) == 1
assert len(native['allOtherNativeOutputsExact']) == 24 and native['sourceViewCount'] == 22
assert native['omittedGoals'] == [] and native['bookModelReuse']['nativeNewBookModelExecuted'] is False
write('three-mv-v8-heading-fields.independent-a.review.json', {
    'schemaVersion': 1, 'createdAtUTC': STAMP, 'reviewer': 'biology_q1_v7_sources_independent_a_followup',
    'independence': 'No author role in v8, which was authored by root. No independent B verdict or peer body read. Scoped primary-page judgement and complete recursive payload comparison.',
    'authorFreeze': bind(author_freeze), 'supersededMVFindingInput': bind(PREVIOUS_A / 'MV-parent-heading-location.independent-a-addendum.review.json'),
    'beforeMVEnvelope': bind(old_path), 'afterMVEnvelope': bind(new_path),
    'actualOriginalPDF': bind(pdf), 'actualScopedReadCommand': command, 'actualReadExitCode': proc.returncode,
    'exactSixFieldDelta': deltas, 'allOtherPayloadFieldsExact': True,
    'rows': rows, 'KEEP': 3, 'REVISE': 0, 'unresolvedTargetedFindings': 0,
    'effectiveElevenSourceBindingDecision': 'v7 current A KEEP8 plus this v8 KEEP3; original11codes and actual parent-heading locators now all KEEP for the explicitly mixed exact source inputs',
    'effectiveInputReplacement': {'replaceOnlyV7MVEnvelopeWith': bind(new_path), 'allOtherV7InputsExactKeep': True},
    'nativeNewD_P_A_M_VAndNewFullGUISupersetRegistration': 'pending',
    'historicalFirstReviewAndV7AuthorBytesUnchanged': True,
    'nativeDGranted': False, 'wholeOriginalSourceClearance': False, 'activeWrites': False,
    'strictGain': 0, 'newScientificCompletions': 0, 'restoredActiveBindings': 0,
    'humanApproval': False, 'humanTrial': False,
})
write('targeted-verification.actual.json', {
    'schemaVersion': 1, 'createdAtUTC': STAMP, 'authorOwnFilesVerified': 4,
    'priorCurrentAOwnFilesVerified': len(read(previous_freeze)['files']),
    'actualPayloadChangedFieldCount': 6, 'actualSourceComponentCount': 3,
    'allOtherPayloadFieldsExact': True, 'actualOriginalHeadingPhysicalPage': 17,
    'actualOriginalHeadingPrintedPage': 13, 'independentOriginalTextExactAuthorAndPriorText': True,
    'nativeAtlasActualBindingDeltaCount': 1, 'all24ViewsManifestNavigationOutputsExact': True,
    'nativeReceiptBindingChanged': True, 'nativeBookModelNotRerunBecauseInputsExact': True,
    'historicalOwnFilesAndCurrent19InputsExact': True,
    'actualInheritedInputChanges': inherited_input_changes,
    'otherInheritedInputBindingsExact': True, 'activeWrites': False,
})
(OWN / 'README.md').write_text('''# Biologie Q1: unabhängiger A-Follow-up der drei MV-v8-Seitenbindungen

**Drei KEEP, null REVISE.** Die sechs tatsächlichen Ortsfelder wurden gegen
die frisch unabhängig aus dem originalen PDF extrahierte Seite geprüft.
Die echte Überschrift **3.2 Unterrichtsinhalte** steht **physisch 17/gedruckt 13**.
Sie beginnt mit Klasse 7; die eigenständige unveränderte Klassenqualifikation
für diese Komponenten bleibt Klasse 10 auf physisch 28 und die unnummerierte
Klassische Genetik physisch 30/gedruckt 26. Daraus wird keine Klasse-7-Sicht
für die Genetikkomponenten abgeleitet.

Die [drei Einzelentscheidungen](three-mv-v8-heading-fields.independent-a.review.json)
binden jeden alten Locatorbefund, Quellen- und kanonische UUID, Originalbeleg
und die tatsächlichen sechs Before/After-Pointer. Vollständiger rekursiver
Payloadvergleich bestätigt die Gleichheit aller anderen Felder. Code 3.2,
Rawpassagen, ursprüngliche Seiten, Kurs/Stage, IDs, Fachtexte, Memory-Entscheidungen
und Partial-Mappinggrenzen bleiben exakt. Historische Autoren- und Reviewbytes
wurden nicht verändert; die erste zu breite A-Entscheidung bleibt als Geschichte
erhalten und wird nicht als aktuelles Urteil ausgegeben.

## Tatsächlich betroffener nativer Delta-Check

Der [dünne tatsächliche v7/v8-Atlasvergleich](affected-native-source-atlas-receipt-and-book-reuse.actual.json)
weist SourceAtlas **390/390** mit 22 Quellensichten und keiner Auslassung nach.
Genau **eine** native Extraktionseingangsdigestbindung und deren Receipt ändern
sich. Alle **24** Quellensicht-, Manifest- und Navigationsoutputs bleiben
bytegenau. Der Bericht verschweigt die Receiptänderung nicht.

Die tatsächlichen reinen BookModel-Eingänge bleiben vollständig exakt: Canon,
Semantik, Code, Bild-QA, Manifest, Navigation und sämtliche Quellensichten sind
unverändert. Die betroffene SourceAtlas-Receipt ist kein BookModel-Argument.
Daher wird dessen gültiger Nachweis **383→390**, alte 383 WholeGoals/Seiten
und geschützte 67 exakt, gezielt weiterverwendet. Auch die vollständigen
bisherigen GUI-/Level-2-Mengen 168/436 bleiben unverändert. Es gab keinen
weiteren BookModel-Lauf, PDF-Render, vollständigen Build oder globalen QS-Lauf.

Die wirksame begrenzte A-Quellenentscheidung besteht aus den acht gültigen
v7-KEEP-Bindungen plus diesen drei v8-KEEP-Bindungen. Nur die MV-Hülle wird
ersetzt; alle anderen v7-Eingänge bleiben exakt. Die sieben Fachtexte und
Bilder werden für diese reine Ortskorrektur nicht erneut geprüft.

Native D/P/A/M/V, zweite unabhängige aktuelle Prüfung, neue vollständige
GUI-Superset-Registrierung und Integration bleiben erforderlich. Breite
3417-, ST-, SH- und BY-Quellenholds werden nicht geschlossen. Keine native
D- oder globale Quellenfreigabe wird hier behauptet.

Aktiver Stand: **Biologie 67/383**, **Chemie 112/378**. Nettozuwachs, neue
fachliche Abschlüsse und wiederhergestellte aktive Bindungen jeweils **0**.
390 bleibt Kandidatennenner; Mathematik-M7 und Physik-M7 sind geschützt.
Menschliche Freigabe, Erprobung, Veröffentlichung oder Deployment werden
nicht behauptet.

## Tatsächlicher aktueller Policy-Unterschied

Der externe Commit `fbc4e2bc5` ergänzt AGENTS.md ausschließlich um Hinweise
zur Gemini-Installation, zum Skill-Download und zur offenen Bildakzeptanz.
Sein [tatsächlicher Diff](AGENTS-gemini-only-policy-diff.actual.txt) wurde gelesen.
Der historische AGENTS-Hash ist daher heute nicht bytegleich; dieser Review
bindet den tatsächlich aktuellen Policytext. Alle anderen geerbten Eingänge,
historischen eigenen Dateien und die 19 aktiven M7-Eingänge bleiben exakt.
Es wird keine pauschale aktuelle Gleichheit sämtlicher historischer Eingänge
behauptet. Die Quellen- und M7-Anforderungen werden durch diesen sachfremden
Policy-Diff nicht geändert.
''')
files = [{'path': str(path.relative_to(OWN)), 'sha256': sha(path), 'bytes': path.stat().st_size}
         for path in sorted(OWN.rglob('*')) if path.is_file()]
freeze = OWN / 'independent-a-v8-heading-followup.final.freeze.json'
write(freeze.name, {'schemaVersion': 1, 'createdAtUTC': STAMP,
    'role': 'frozen targeted independent A v8 follow-up; actual3KEEP and6scientific source-location fields resolved, no nativeD clearance',
    'files': files, 'ownFileCount': len(files), 'ownBytes': sum(row['bytes'] for row in files),
    'exactReviewInputBindings': sorted(inputs.values(), key=lambda row: row['path']),
    'KEEP': 3, 'REVISE': 0, 'effectiveElevenBindings': 'KEEP8 from current v7 A + KEEP3 from this exact v8',
    'actualChangedFieldsReviewed': 6, 'nativeSource390ActualDelta': 'PASS1 binding and receipt change;24other outputs exact',
    'nativeBookModelReuse': 'exact unaffected inputs, no rerun',
    'actualInheritedInputChanges': inherited_input_changes,
    'nativeD_P_A_M_VAndFullGUISupersetIntegration': 'pending', 'activeWrites': False,
    'strictGain': 0, 'newScientificCompletions': 0, 'restoredActiveBindings': 0,
    'humanApproval': False, 'humanTrial': False, 'publicationOrDeployment': False, 'integrableNow': False})
print(json.dumps({'freeze': str(freeze.relative_to(REPO)), 'sha256': sha(freeze),
                  'ownFiles': len(files), 'exactInputs': len(inputs), 'KEEP': 3, 'REVISE': 0,
                  'nativeAtlas': 'PASS390', 'activeWrites': False, 'strictGain': 0}))
