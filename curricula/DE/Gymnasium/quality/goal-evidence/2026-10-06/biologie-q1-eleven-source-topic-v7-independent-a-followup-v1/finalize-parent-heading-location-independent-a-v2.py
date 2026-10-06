"""Correct the independent decision about actual MV parent-heading locators.

The first sealed review is retained as history; this fresh addendum supersedes
its three overly broad KEEP decisions. No author or operative source is edited.
"""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json

REPO = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
V7 = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-component-source-topic-corrections-author-v7'
OLD_FREEZE = OWN / 'independent-a-followup.final.freeze.json'
STAMP = datetime.now(timezone.utc).isoformat()

def read(path):
    return json.loads(path.read_text())

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def binding(path):
    return {'path': str(path.relative_to(REPO)), 'sha256': sha(path), 'bytes': path.stat().st_size}

def write(name, value):
    (OWN / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

assert not (OWN / 'independent-a-followup.current-v2.final.freeze.json').exists()
assert sha(OLD_FREEZE) == '88d251fa4726a3f0cda299af6e6f7a36ada4985020e0864155dc0a52e8cdb98d'
previous = read(OLD_FREEZE)
for row in previous['files']:
    assert sha(OWN / row['path']) == row['sha256'], row['path']
actual_head = OWN / 'sources/MV.physical-017.actual-section-heading.independent-original-pdf.txt'
assert '3.2    Unterrichtsinhalte' in actual_head.read_text()
source = V7 / 'MV.source-components.author-v7.inert-envelope.json'
payload = read(source)['candidatePayload']
review = read(OWN / 'eleven-source-topic-corrections.independent-a-followup.review.json')
findings = []
for index, row in enumerate(payload['sourceGoals']):
    context = row['sourceSectionContext']
    assert context['parentHeadingPhysicalPage'] == 4 and context['parentHeadingPrintedPage'] is None
    finding = {
        'findingId': 'A-V7-MV-PARENT-HEADING-' + row['id'], 'decision': 'REVISE',
        'sourceGoalId': row['id'], 'sourceInput': binding(source),
        'canonicalGoalId': next(item['canonicalGoalId'] for item in review['rows'] if item['sourceGoalId'] == row['id']),
        'jsonPointer': f'/candidatePayload/sourceGoals/{index}/sourceSectionContext',
        'actualCurrentFields': {'parentHeadingPhysicalPage': 4, 'parentHeadingPrintedPage': None},
        'requiredActualHeadingFields': {'parentHeadingPhysicalPage': 17, 'parentHeadingPrintedPage': 13},
        'actualOriginalBodyHeadingProof': binding(actual_head),
        'independentReason': 'The named parentHeading fields assert the location of the real section heading. Physical4 is the contents locator, whereas the actual 3.2 Unterrichtsinhalte body heading is physical17/printed13. Supplying an additional correct page in the review does not correct the two actual author-input fields.',
        'unchangedCorrectFieldsKEEP': ['topicCode:3.2', 'officialParentHeading:3.2 Unterrichtsinhalte',
            'yearHeading:Klasse 10', 'yearHeadingPhysicalPages:[28]',
            'unnumberedSubsectionHeading:Klassische Genetik', 'subsectionHasOfficialNumber:false'],
        'rawPagesWordsDescriptionsIDsStageCourseAndPartialMappings': 'KEEP exact inherited decisions',
        'requiredFollowup': 'correct exactly these two sourceSectionContext fields in a new author version; independently check all three affected source-goal bindings and propagated inputs',
        'wholeOriginalSourceHoldReleased': False,
    }
    findings.append(finding)
    target = next(item for item in review['rows'] if item['sourceGoalId'] == row['id'])
    target['decision'] = 'REVISE'
    target['oldTopicCodeFindingResolvedOnlyForExactV7Candidate'] = True
    target['oldFindingResolvedOnlyForExactV7Candidate'] = False
    target['actualParentHeadingLocationFinding'] = finding
    target['independentActualParentAndYearJudgement'] = 'KEEP code3.2, Klasse10 and unnumbered Klassische Genetik; REVISE physical/printed actual parent-heading locator fields.'
assert len(findings) == 3
write('MV-parent-heading-location.independent-a-addendum.review.json', {
    'schemaVersion': 1, 'createdAtUTC': STAMP, 'reviewer': 'independent targeted A',
    'supersedes': binding(OWN / 'eleven-source-topic-corrections.independent-a-followup.review.json'),
    'reasonForReviewCorrection': 'First sealed review interpreted the field as a contents locator and supplemented body proof. On explicit consideration of the field semantics, that interpretation is too broad: actual author fields still claim an incorrect real parent-heading location.',
    'findings': findings, 'originalElevenTopicCodesKEEP': 11, 'newActualHeadingLocatorREVISE': 3,
    'historicalFirstReviewBytesUnchanged': True, 'activeWrites': False, 'nativeDGranted': False,
})
review['createdAtUTC'] = STAMP
review['effectiveStatus'] = 'current independent A decision; supersedes the first sealed review for three MV heading-locator decisions only'
review['supersedesFirstReviewFreeze'] = binding(OLD_FREEZE)
review['KEEPCount'] = 8
review['REVISECount'] = 3
review['unresolvedReviewedSourceCodeFindings'] = 0
review['unresolvedActualParentHeadingLocatorFindings'] = 3
review['nativeDApprovalGranted'] = False
write('eleven-source-topic-corrections.independent-a-followup.current-v2.review.json', review)
(OWN / 'README.current-v2.md').write_text('''# Biologie Q1: aktuelle unabhängige A-Entscheidung zu Autor v7

**Acht KEEP, drei REVISE.** Alle elf ursprünglichen Abschnittscodes sind
fachlich korrekt; die drei MV-Komponenten enthalten aber noch falsche echte
Elternüberschrifts-Lokatoren. Diese aktuelle Entscheidung ersetzt die drei zu
breiten KEEP-Urteile des zuerst eingefrorenen Reviews. Alle historischen Bytes
bleiben unverändert.

## Konkreter Befund

Die Felder `sourceSectionContext.parentHeadingPhysicalPage:4` und
`parentHeadingPrintedPage:null` lokalisieren das Inhaltsverzeichnis. Die
tatsächliche Abschnittsüberschrift **3.2 Unterrichtsinhalte** steht auf der
unabhängig gelesenen Originalseite **physisch 17/gedruckt 13**. Die Feldnamen
behaupten den echten Überschriftsstandort. Eine richtige Zusatzseite im Review
korrigiert diese tatsächlichen Autorenfelder nicht. Daher bleiben alle drei
betroffenen MV-Bindungen vor Integration REVISE.

Die [drei Einzelbefunde](MV-parent-heading-location.independent-a-addendum.review.json)
nennen Quellen- und Ziel-UUID, exakten Pointer, tatsächliche vorherige Werte,
geforderte Werte und Primärbeleg. Codes `3.2`, Klasse 10 und die unnummerierte
Klassische Genetik sind KEEP. Unveränderte Rawpassagen, originale Seiten,
Stage/Kurs, UUIDs, Fachtexte, Memory-Urteile und Partial-Mappings bleiben gültig.
SN, TH und ST bleiben für diese gezielte Korrektur KEEP. BE/BB wird nicht neu geprüft.

Die gültige native Reproduktion **SourceAtlas 390/390**, **BookModel 383→390**,
alte 383 und geschützte 67 exakt sowie vollständige bestehende GUI-Mengen
168/436 bleibt technischer Nachweis; sie behebt den tatsächlichen Quellenfeld-
fehler nicht. Native D/P/A/M/V und vollständige neue GUI-Superset-Registrierung
sind weiter erforderlich. Breite historische Quellenholds bleiben offen.

Nächster Schritt: neuer Autorkandidat mit genau den zwei korrigierten MV-Feldern
in jeder der drei Komponenten, danach gezielter unabhängiger Follow-up der
betroffenen Quellen- und Folgebindungen. Aktiver Fortschritt bleibt Biologie
67/383 und Chemie 112/378; strenger Nettozuwachs, neue fachliche Abschlüsse und
wiederhergestellte aktive Bindungen jeweils 0. Mathematik und Physik M7 bleiben
geschützt. Menschliche Prüfung, Freigabe oder Erprobung wird nicht behauptet.
''')
files = [{'path': str(path.relative_to(OWN)), 'sha256': sha(path), 'bytes': path.stat().st_size}
         for path in sorted(OWN.rglob('*')) if path.is_file()]
for row in previous['exactReviewInputBindings']:
    assert sha(REPO / row['path']) == row['sha256'], row['path']
freeze = OWN / 'independent-a-followup.current-v2.final.freeze.json'
write(freeze.name, {
    'schemaVersion': 1, 'createdAtUTC': STAMP,
    'role': 'CURRENT targeted independent A review; first sealed11KEEP decision superseded for3MV actual heading locators',
    'files': files, 'ownFileCount': len(files), 'ownBytes': sum(row['bytes'] for row in files),
    'exactReviewInputBindings': previous['exactReviewInputBindings'],
    'supersededHistoricalOwnFreeze': binding(OLD_FREEZE), 'KEEP': 8, 'REVISE': 3,
    'allElevenCodesCorrect': True, 'MVActualParentHeadingLocatorFieldsStillWrong': True,
    'newNativeD_P_A_M_VAndGUIRegistration': 'pending', 'nativeSource390Book383To390TechnicalEvidence': 'PASS exact reuse',
    'historicalFirstReviewUnmodified': True, 'activeWrites': False, 'integrableNow': False,
    'strictGain': 0, 'newScientificCompletions': 0, 'restoredActiveBindings': 0,
    'humanApproval': False, 'humanTrial': False,
})
print(json.dumps({'freeze': str(freeze.relative_to(REPO)), 'sha256': sha(freeze),
                  'files': len(files), 'KEEP': 8, 'REVISE': 3, 'activeWrites': False}))
