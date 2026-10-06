#!/usr/bin/env python3
"""Independent B followup of exactly six corrected MV location fields."""
import hashlib
import json
import pathlib
import subprocess
from datetime import datetime, timezone

OUT = pathlib.Path(__file__).resolve().parent
REPO = OUT.parents[6]
V7 = OUT.with_name('biologie-q1-seven-component-source-topic-corrections-author-v7')
V8 = OUT.with_name('biologie-q1-mv-heading-location-targeted-author-v8')

def read(path):
    return json.loads(pathlib.Path(path).read_text())

def sha(data):
    return hashlib.sha256(data).hexdigest()

def bind(path):
    path = pathlib.Path(path)
    data = path.read_bytes()
    return {'path': str(path.relative_to(REPO)), 'sha256': sha(data), 'bytes': len(data)}

def write(name, data):
    path = OUT / name
    assert not path.exists(), 'Append a followup; never overwrite sealed evidence'
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    return path

def diff(before, after, pointer=''):
    if type(before) is not type(after):
        return [{'JSONPointer': pointer, 'before': before, 'after': after}]
    if isinstance(before, dict):
        assert set(before) == set(after), 'Unexpected key-set delta'
        return [row for k in before for row in diff(before[k], after[k], pointer + '/' + k)]
    if isinstance(before, list):
        assert len(before) == len(after), 'Unexpected list-length delta'
        return [row for i in range(len(before)) for row in diff(before[i], after[i], pointer + '/' + str(i))]
    return [] if before == after else [{'JSONPointer': pointer, 'before': before, 'after': after}]

first = OUT / 'independent-b-v7.first-pass.final.freeze.json'
assert sha(first.read_bytes()) == '0f04faf086f5726565ed7d113db1262f631d4dc80694b3dabfd6c9950e920532'
first_manifest = read(first)
for row in first_manifest['ownOutputs']:
    assert sha((OUT / row['path']).read_bytes()) == row['sha256'], row['path']
first_input_recheck = []
for row in first_manifest['actualInputs']:
    path = pathlib.Path(row['path'])
    if not path.is_absolute():
        path = REPO / path
    actual = sha(path.read_bytes())
    first_input_recheck.append({'path': row['path'], 'expectedSHA256': row['sha256'], 'actualSHA256': actual, 'exact': actual == row['sha256']})
    assert actual == row['sha256'], row['path']
freeze = V8 / 'author-mv-heading-v8.final.freeze.json'
assert sha(freeze.read_bytes()) == 'a2a380e791569b88a1bda3e708adc781938bace716dfd737cf4760fbab927ee8'
author = read(freeze)
for row in author['ownFiles'] + author['inputBindings']:
    path = REPO / row['path']
    assert sha(path.read_bytes()) == row['sha256'] and path.stat().st_size == row['bytes']
before_path = V7 / 'MV.source-components.author-v7.inert-envelope.json'
after_path = V8 / 'MV.source-components.author-v8.inert-envelope.json'
before, after = read(before_path), read(after_path)
changes = diff(before['candidatePayload'], after['candidatePayload'])
expected = set()
for index in range(3):
    expected.add((f'/sourceGoals/{index}/sourceSectionContext/parentHeadingPhysicalPage', 4, 17))
    expected.add((f'/sourceGoals/{index}/sourceSectionContext/parentHeadingPrintedPage', None, 13))
assert {(row['JSONPointer'], row['before'], row['after']) for row in changes} == expected
pdf = REPO / 'curricula/DE/Gymnasium/input/MV/Biologie_Gymnasium_Gesamtschule_7_10.pdf'
fresh_text = subprocess.check_output(['pdftotext', '-layout', '-f', '17', '-l', '17', str(pdf), '-'])
assert fresh_text == (OUT / 'sources/MV.physical-017.independent-b-original-pdf.txt').read_bytes()
assert fresh_text == (V8 / 'MV.physical-017.actual-original-pdf.txt').read_bytes()
assert b'3.2    Unterrichtsinhalte' in fresh_text and b'13' in fresh_text
rows = []
for index, goal in enumerate(after['candidatePayload']['sourceGoals']):
    rows.append({'sourceGoalId': goal['id'], 'candidateKey': goal['componentKey'], 'verdict': 'KEEP',
        'findingId': 'B-V7-MV-PARENT-HEADING-LOCATION', 'findingResolution': 'resolved by actual exact two-field correction',
        'actualParentHeadingPhysicalPage': 17, 'actualParentHeadingPrintedPage': 13,
        'year10ScopePhysicalPage': 28, 'unnumberedClassicalGeneticsPhysicalPage': 30,
        'unchangedFullOtherPayloadFields': True, 'reason': 'Echte3.2-Überschrift befindet sich auf17/13. Der dort beginnende Klasse7-Unterabschnitt verändert nicht die separat auf28 gebundene Klasse10 der geprüften Komponenten. Die vollständige Payloadprüfung zeigt nur die zwei erwarteten Ortsfelder je Komponente.'})
review = write('mv-heading-v8-targeted-followup.independent-b.review.json', {'schemaVersion': 1,
    'createdAtUTC': datetime.now(timezone.utc).isoformat(), 'role': 'fresh independent B targeted source followup only',
    'inputV8Freeze': bind(freeze), 'sealedV7FirstPass': bind(first), 'rows': rows, 'verdict': 'KEEP',
    'findingResolved': 'B-V7-MV-PARENT-HEADING-LOCATION', 'exactChangedPayloadFields': changes,
    'allOtherCompletePayloadFieldsExact': True, 'sevenGoalScienceMemoryAnd16MaterialReviewsReopened': False,
    'effectiveBoundedSourceVerdictsWithV8Overlay': {'KEEP': 13, 'REVISE': 0, 'BLOCK': 0},
    'priorWholeOriginalSourceAndRouteHoldsRetained': True, 'nativeSourceAtlasV8FullReproductionRepeated': False,
    'nativeD_P_A_M_VApproval': False, 'activeWrites': False, 'strictGain': 0, 'humanApproval': False, 'humanTrial': False})
checks = write('mv-heading-v8-targeted-followup.actual-checks.json', {'schemaVersion': 1,
    'sourceEnvelopeBefore': bind(before_path), 'sourceEnvelopeAfter': bind(after_path), 'originalPDF': bind(pdf),
    'independentOriginalHeadingPage': bind(OUT / 'sources/MV.physical-017.independent-b-original-pdf.txt'),
    'actualReadCommand': ['pdftotext', '-layout', '-f', '17', '-l', '17', str(pdf), '-'],
    'actualSourceTextExactlyAuthorAndSealedB': True, 'completePayloadChangedFields': changes,
    'changedFields': 6, 'changedComponents': 3, 'wholeOtherPayloadEqual': True,
    'firstPassOwnOutputsExact': len(first_manifest['ownOutputs']), 'firstPassInputRecheck': first_input_recheck})

commit = 'fbc4e2bc5a1f2635a6381e503d479bc0aecaa8e7'
agents_delta = subprocess.check_output(['git', 'show', '--format=', commit, '--', 'AGENTS.md'], cwd=REPO).decode()
old_agents = subprocess.check_output(['git', 'show', commit + '^:AGENTS.md'], cwd=REPO)
new_agents = (REPO / 'AGENTS.md').read_bytes()
assert b'prepared stable-origin installer' in new_agents
assert '1832' in agents_delta and 'gemini' in agents_delta
external = write('external-agents-gemini-change.scope-check.json', {'schemaVersion': 1,
    'commit': commit, 'actualAGENTSDiff': agents_delta, 'beforeSHA256': sha(old_agents), 'currentBinding': bind(REPO / 'AGENTS.md'),
    'changedScope': 'Only Gemini deployment/installer/download/image-acceptance guidance; seven additions and one deletion in AGENTS.md.',
    'chemistryBiologyCurriculumM7RulesChangedByThisAGENTSDiff': False,
    'firstPassActualInputsStillExact': True, 'historicAuthorAndReviewFreezesRewritten': False,
    'historicalAGENTSHashMustNotBeRebound': True})
note = OUT / 'MV-V8-FOLLOWUP.md'
assert not note.exists()
note.write_text('''# Gezieltes unabhängiges B-Follow-up zu MV v8

Der Befund `B-V7-MV-PARENT-HEADING-LOCATION` ist aufgelöst. Alle drei MV-Quellenkomponenten erhalten für die korrigierten v8-Bytes **KEEP**; zusammen mit den unveränderten zehn v7-Komponenten sind damit **13/13 begrenzte Quellenaspekte KEEP**.

Die vollständigen alten/neuen Payloads wurden rekursiv verglichen: exakt sechs Ortsfelder ändern sich, je Komponente `parentHeadingPhysicalPage` 4→17 und `parentHeadingPrintedPage` null→13. Alle anderen Felder bleiben exakt. Die amtliche Original-PDF-Seite17 wurde nochmals tatsächlich gelesen und ist bytegleich zum versiegelten B-Seitentext und zum v8-Autorseitentext. Die eigene frühere Ziel-, Memory- und Materialprüfung bleibt versiegelt und wird nicht neu begonnen.

Der externe Commit fbc4e2bc5 änderte AGENTS.md ausschließlich um Gemini-Betriebsanweisungen. Der tatsächliche Diff und die Eingangsprüfung sind im ergänzenden Nachweis enthalten; historische Hashes wurden nicht angepasst.

Dies ist eine Quellenkorrekturprüfung. Native D/P/A/M/V, neue GUI-Superset-Registrierung und aktive Integration bleiben separate Gates. Die begrenzte Quellenannahme ist keine ganze Originalfreigabe. Es gibt keinen neuen strengen Abschluss, keine aktive Schreiboperation und keine menschliche Freigabe oder Erprobung.
''')
supp_outputs = [pathlib.Path(__file__), review, checks, external, note]
actual_inputs = [first, freeze, before_path, after_path, pdf, V8 / 'MV.physical-017.actual-original-pdf.txt',
    V8 / 'six-field-delta-and-source-proof.actual.json', OUT / 'sources/MV.physical-017.independent-b-original-pdf.txt',
    OUT / 'thirteen-source-components-scope-first.review.json', OUT / 'retained-whole-source-and-route-boundaries.review.json', REPO / 'AGENTS.md']
write('independent-b-v8-targeted-followup.final.freeze.json', {'schemaVersion': 1,
    'createdAtUTC': datetime.now(timezone.utc).isoformat(), 'role': 'sealed independent B exact six-field MV followup',
    'actualInputs': [bind(p) for p in actual_inputs], 'ownSupplementalOutputs': [bind(p) for p in supp_outputs],
    'firstV7FreezeUnchanged': bind(first), 'authorV8FreezeSHA256': 'a2a380e791569b88a1bda3e708adc781938bace716dfd737cf4760fbab927ee8',
    'effectiveComponentReview': 'KEEP13/13 with exact v8 MV overlay and unchanged v7 remainder',
    'nativeD_P_A_M_VApproval': False, 'activeWrites': False, 'strictGain': 0, 'humanApproval': False, 'humanTrial': False})
print(json.dumps({'followup': 'KEEP3 corrected MV; effective13/13 bounded source KEEP',
    'freeze': bind(OUT / 'independent-b-v8-targeted-followup.final.freeze.json'), 'readyForNativeDReview': True}))
