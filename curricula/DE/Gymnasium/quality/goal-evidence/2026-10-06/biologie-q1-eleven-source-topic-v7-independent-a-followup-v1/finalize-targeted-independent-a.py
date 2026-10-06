"""Record actual independent decisions after inspecting the original page content."""
from pathlib import Path
import hashlib
import json
import shutil
from datetime import datetime, timezone

REPO = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
BASE = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06'
V7 = BASE / 'biologie-q1-seven-component-source-topic-corrections-author-v7'
V6 = BASE / 'biologie-q1-seven-component-native-source-preparation-author-v6'
OLD_A = BASE / 'biologie-q1-seven-native-v6-independent-a-v1'
RUN = REPO / 'tmp/biologie-q1-eleven-source-topic-v7-independent-a-followup-native-v1'
STAMP = datetime.now(timezone.utc).isoformat()

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def read(path):
    return json.loads(path.read_text())

def bind(path):
    return {'path': str(path.relative_to(REPO)), 'sha256': sha(path), 'bytes': path.stat().st_size}

def write(name, value):
    (OWN / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

assert not (OWN / 'independent-a-followup.final.freeze.json').exists(), 'Frozen review package'
actual = read(RUN / 'native-source390-book383-to390-gui-superset-and-delta.actual.json')
author_result = read(V7 / 'native-source390-book383-to390-gui-superset-and-delta.actual.json')
for key in ['sourceAtlas', 'pureBookModel', 'old383PageAndWholeGoalRows', 'protected67Rows',
            'dag', 'sourceViewChecks', 'existingFullGUIViewChecks', 'newSevenActualNativePages',
            'newSourceWitnesses', 'effectiveNativeInputs', 'nativeCode', 'oldWholeDeltas']:
    assert actual[key] == author_result[key], key
assert actual['sourceAtlas']['candidate'] == 390
assert actual['sourceAtlas']['omittedGoals'] == []
assert actual['sourceAtlas']['countOverrideUsed'] is False
assert len(actual['old383PageAndWholeGoalRows']) == 383 and len(actual['protected67Rows']) == 67
assert all(row['wholeGoalExact'] and row['pageFingerprintExact'] and row['goalFingerprintExact']
           and not row['sourceMembershipLosses'] for row in actual['old383PageAndWholeGoalRows'])
assert actual['pureBookModel']['candidateDigestExactlyV6'] is True
assert actual['oldWholeDeltas'][0]['fields'] == ['contains'] and len(actual['oldWholeDeltas']) == 1
assert [(row['currentTargets'], row['candidateTargets']) for row in actual['existingFullGUIViewChecks']] == [(168, 168), (436, 436)]
assert all(row['fullExistingTargetsExact'] and row['removedTargets'] == [] for row in actual['existingFullGUIViewChecks'])
assert all(row['missingOldTargets'] == [] and row['sourceTargetsExact'] for row in actual['sourceViewChecks'])
own_native = OWN / 'independent-native-reproduction.actual.raw.json'
shutil.copyfile(RUN / 'native-source390-book383-to390-gui-superset-and-delta.actual.json', own_native)
checks = read(OWN / 'eleven-actual-field-page-component-and-mapping-checks.json')['checks']
witnesses = [(scope['key'], row) for scope in actual['newSourceWitnesses'] for row in scope['witnesses']]
native_binding_checks = []
for row in checks:
    matched = [(scope, witness) for scope, witness in witnesses if witness['sourceGoalId'] == row['sourceGoalId']
               and witness['mappedTargetGoalId'] == row['canonicalGoalId'] and witness['goalId'] == row['canonicalGoalId']]
    assert matched, row['sourceGoalId']
    assert all(scope.startswith('DE-' + row['region'] + '/') for scope, _ in matched)
    native_binding_checks.append({'sourceGoalId': row['sourceGoalId'], 'canonicalGoalId': row['canonicalGoalId'],
                                  'actualScopeWitnesses': [{'scope': scope, 'witness': witness} for scope, witness in matched],
                                  'exactCorrectedExtractionPathAndCanonicalBindingVerified': True})
write('independent-native-delta-and-full-view-checks.actual.json', {
    'schemaVersion': 1, 'createdAtUTC': STAMP,
    'execution': {'command': ['app/node_modules/.bin/tsx', str((V7 / 'probe-native-source-topic-author-v7.ts').relative_to(REPO))],
                  'environment': {'BIO_Q1_V7_NATIVE_OUTPUT': str(RUN.relative_to(REPO))}, 'actualExitCode': 0,
                  'method': 'independent fresh execution of inspected frozen probe using native SourceAtlas and BookModel functions; not an independently reimplemented algorithm',
                  'probe': bind(V7 / 'probe-native-source-topic-author-v7.ts'), 'actualUnmodifiedOutput': bind(own_native)},
    'native390SourceAtlas': 'PASS', 'normalCountContract': 390, 'countOverrideUsed': False,
    'pureBookModel': actual['pureBookModel'], 'scopeCount': actual['sourceAtlas']['scopeCount'],
    'all383OldWholeGoalsPagesFingerprintsAndSourceMembershipsExact': True,
    'all67ProtectedStrictGoalPagesExact': True, 'all464OldCanonicalIDsRetained': True,
    'candidateCanonicalNodeCount': 472, 'dag': actual['dag'],
    'elevenActualPropagatedNativeWitnessChecks': native_binding_checks,
    'sevenFullSourceViewSupersetChecks': actual['sourceViewChecks'],
    'existingFullGUILevel2ViewChecks': actual['existingFullGUIViewChecks'],
    'newGUILevel2SupersetRegistration': 'pending; existing views preserve old targets but do not expose the seven new source components',
    'pdfRenderOrFullBuildExecuted': False, 'nativeNewD_P_A_M_VApprovalGranted': False,
    'activeWrites': False, 'strictGain': 0,
})

region_proof = {
    'SN': {
        'officialParentDecision': 'KEEP Lernbereich 1: Genetik, qualified Klassenstufe 10; the number 1 is the parent learning-area code, not an invented mutation bullet number.',
        'actualHeaderPage': 42, 'printedHeaderPage': 30,
        'sourceContentJudgement': 'The actual Klasse10 heading and Lernbereich1 header precede the mutation/modification row on physical42; the mutation-level row on physical43 remains inside this learning area before Lernbereich2 begins. Thus repeated learning-area numbers in other years cannot be mistaken for this source.',
        'additionalParentPage': None,
    },
    'TH': {
        'officialParentDecision': 'KEEP 2.2.1.3 Genetik, qualified Klassenstufen 9/10; header physical28/printed22 and class grouping physical26/printed20.',
        'actualHeaderPage': 28, 'printedHeaderPage': 22,
        'sourceContentJudgement': 'The original table has 2.2.1.3 Genetik, followed by Weitergabe genetischer Information and error-control/repair. Its continuation physical29 contains Variabilität von Merkmalen with mutation levels and modification. The class grouping explicitly covers 9/10 and no new upper-secondary course claim is introduced.',
        'additionalParentPage': None,
    },
    'MV': {
        'officialParentDecision': 'KEEP 3.2 Unterrichtsinhalte, qualified Klasse10 and unnumbered Klassische Genetik; physical4 is a real TOC locator, not the body heading itself.',
        'actualHeaderPage': 17, 'printedHeaderPage': 13,
        'sourceContentJudgement': 'The original TOC physical4 identifies 3.2 Unterrichtsinhalte and Klasse10/printed24. The actual 3.2 body heading is independently read at physical17/printed13; Klasse10 begins physical28/printed24, and Klassische Genetik physical30/printed26 has no numbered subsection. The actual columns show mutations, mutagens, body-cell/germline effects and mutation-versus-modification; no artificial 3.3 or sub-bullet code is assigned.',
        'additionalParentPage': bind(OWN / 'sources/MV.physical-017.actual-section-heading.independent-original-pdf.txt'),
    },
    'ST': {
        'officialParentDecision': 'KEEP 3.5 Schuljahrgang10 (Einführungsphase), actual SekII common entry phase; raw course unspecified and already reviewed derived GK/LK technical applicability remain separate.',
        'actualHeaderPage': 42, 'printedHeaderPage': 42,
        'sourceContentJudgement': 'The original physical42/printed42 heading is explicitly 3.5 Schuljahrgang10 (Einführungsphase). The comparative mutation/modification row belongs there, and physical43 continues its Grundlegende Wissensbestände with genome/point mutation and mutagens. This confirms the bounded component location without clearing the historically wrong entire SekI summary.',
        'additionalParentPage': None,
    },
}
rows = []
for row in checks:
    proof = region_proof[row['region']]
    rows.append({**row, 'decision': 'KEEP', 'oldFindingResolvedOnlyForExactV7Candidate': True,
                 'independentActualParentAndYearJudgement': proof['officialParentDecision'],
                 'independentPageAndContextJudgement': proof['sourceContentJudgement'],
                 'actualParentHeadingProofPhysicalPage': proof['actualHeaderPage'],
                 'actualParentHeadingProofPrintedPage': proof['printedHeaderPage'],
                 'additionalOriginalParentProof': proof['additionalParentPage'],
                 'componentBoundaryJudgement': 'KEEP authored operationalisation and matchType partial; unchanged original broad parent wording and source-summary ID do not imply coverage or clearance of the entire original source goal.',
                 'substantiveCheck': 'Actual independent original-page reading and field/propagated witness check, not hash-only approval',
                 'nativeDescriptionGateApproval': False})
write('eleven-source-topic-corrections.independent-a-followup.review.json', {
    'schemaVersion': 1, 'createdAtUTC': STAMP, 'reviewer': 'biology_q1_v7_sources_independent_a_followup',
    'independence': 'No author role. Targeted follow-up on prior independent A findings; no fresh B decision bodies read. Reused valid unchanged A science/material/atomicity/memory judgements after exact whole-object checks.',
    'exactAuthorV7Freeze': bind(V7 / 'source-topic-corrections.author-v7.final.freeze.json'),
    'oldElevenFindingInput': bind(OLD_A / 'eleven-source-topic-binding-findings.review.json'),
    'rows': rows, 'KEEPCount': 11, 'REVISECount': 0, 'unresolvedReviewedSourceCodeFindings': 0,
    'BE_BBCode3_7': 'exact inherited KEEP; no historical restart',
    'nativeDApprovalGranted': False, 'wholeSourceApprovalGranted': False,
    'newScientificCompletions': 0, 'restoredActiveBindings': 0, 'strictNetGain': 0,
    'activeWrites': False, 'humanApproval': False, 'humanTrial': False,
})
readme = '''# Biologie Q1: gezielter unabhängiger A-Follow-up der elf v7-Quellenbindungen

**Elf KEEP, null REVISE.** Die elf früheren A-Abschnittscodebefunde sind für
genau den eingefrorenen Autor-v7-Eingang aufgelöst. Dies ist ein begrenzter
maschinenbasierter Quellenreview; native D-Freigabe und operative Integration
werden hier nicht erteilt.

## Tatsächliche Quellen- und Kontextprüfung

Die [elf Einzelentscheidungen](eleven-source-topic-corrections.independent-a-followup.review.json)
binden jeden früheren Befund, seine Quellen- und kanonische UUID, den tatsächlichen
JSON-Pointer und die gelesene Originalseite. Die Original-PDFs wurden unabhängig
in elf eng begrenzten Seiten erneut extrahiert. Drei unveränderte, eingefrorene
Originalseitenbilder wurden zusätzlich tatsächlich angesehen: TH physisch 28,
MV physisch 30 und ST physisch 42. Keine vollständigen Quellenbestände wurden kopiert.

| Quelle | Korrekturen | Unabhängig bestätigter tatsächlicher Kontext |
| --- | ---: | --- |
| SN | 2 | Lernbereich 1: Genetik, Klassenstufe 10; physisch 42–43, gedruckt 30–31 |
| TH | 3 | 2.2.1.3 Genetik; Klassenstufen 9/10 physisch 26, Genetik physisch 28–29, gedruckt 22–23 |
| MV | 3 | 3.2 Unterrichtsinhalte; Klasse 10 physisch 28, unnummerierte Klassische Genetik physisch 30/gedruckt 26 |
| ST | 3 | 3.5 Schuljahrgang 10 (Einführungsphase), physisch/gedruckt 42–43 |

Der MV-v7-Locator physisch 4 bezeichnet das tatsächliche Inhaltsverzeichnis.
Der echte Körperabschnitt 3.2 wurde zusätzlich physisch 17/gedruckt 13 gelesen;
diese zusätzliche Bindung verhindert die Verwechslung von Inhaltsverzeichnis
und Körperüberschrift. Es wird keine Nummer für „Klassische Genetik“ erfunden.

Die tatsächlichen Deltas beschränken sich auf `topicCode`, die explizite
Eltern-/Jahrgangsqualifikation in `sourceRef` und `sourceSectionContext`.
Originalrawtexte, Elternbullet, Quellen-ID, Ziel-UUID, DE/EN-Fachtext, Seiten,
Stage und Kursfelder sind exakt. Sämtliche Rawpassagen sind auf den unabhängig
extrahierten Originalseiten tatsächlich vorhanden. Alle elf Mappingbindungen
bleiben ausdrücklich `partial`, und die operationalisierten Aspekte bleiben
`isOfficialBullet:false` sowie `officialNumberingClaim:false`. BE/BB `3.7` bleibt
bytegenau erhalten und wurde nicht erneut fachlich geprüft.

## Gezielte tatsächliche native Reproduktion

Die [eigene native Ergebnisauswertung](independent-native-delta-and-full-view-checks.actual.json)
bindet den tatsächlichen neuen Lauf mit dem eingefrorenen, zuvor gelesenen
Probe-Werkzeug und den echten nativen SourceAtlas-/BookModel-Funktionen.
Es wird keine unabhängige Neuimplementierung des Algorithmus behauptet.

- SourceAtlas **390/390**, 22 Quellensichten, normaler Vertrag ohne Nennerüberschreibung; keine Auslassung.
- Reines BookModel **383→390**; Kandidaten-Digest exakt v6.
- Alle 383 alten WholeGoals, Ziel-/Seitenfingerprints und Quellenmitgliedschaften
  sowie die 67 geschützten strengen Seiten bleiben exakt.
- Alle 464 alten kanonischen IDs bleiben enthalten; als alter Feld-Delta bleibt
  ausschließlich der bereits geprüfte strukturelle Root-`contains`-Anhang.
- Beide DAGs: 472 Knoten, 966 `requires`- und 471 `contains`-Kanten, vollständig aufgelöst und azyklisch.
- Alle elf tatsächlichen korrigierten Quellen-UUIDs besitzen die erwarteten
  aktuellen nativen Zeugen für ihre exakt zugeordneten kanonischen UUIDs.
- Sieben vollständige Quellensichtvorschläge erhalten ihre bestehenden Zielmengen.
  Die beiden bestehenden GUI-/Level-2-Kompositionssichten bleiben **168→168**
  und **436→436** vollständige `target`-Mengen ohne Verlust. Diese Zahlen sind
  keine curricularAtomic-Nenner.

Ein PDF-Render, vollständiger Build oder globaler QS-Neulauf wurde nicht ausgeführt.
Die [exakten Eingangskontrollen](actual-input-closure-and-active19-preservation.json)
bestätigen die unveränderten 19 aktiven Checkpointbindungen und die historische
Byte-Erhaltung. Hashkontrolle ist nur Bindungsverifikation; die elf fachlichen
Quellenentscheidungen beruhen auf den tatsächlichen Originalseiten.

## Gültige Befunde weiterverwendet und offene Gates

Die sieben unveränderten Fachtext-, Atomaritäts-, minimalen Voraussetzung-,
Material-/UUID- und einzeln begründeten Memory-Befunde werden aus dem gültigen
v6-A-Review [exakt weiterverwendet](exact-seven-existing-science-atomicity-memory-reuse.json).
Die historischen Dateien bleiben unverändert. Keine Karte, kein Deck, kein
aktives Lernzielbild und kein nativer Gate-Record wurde hier geschrieben.

Vor Integration bleiben die aktuellen nativen D/P/A/M/V für sieben neue UUIDs,
die separate Bild-QS, die zweite unabhängige Beschreibungsprüfung und die
vollständige passende GUI-Superset-Registrierung erforderlich. Die bestehenden
GUI-Mengen sind erhalten; die sieben neuen Quellenaspekte sind dort damit noch
nicht operativ hinzugefügt. Eine sieben-Ziele-Sicht ersetzt keine vollständige
Lernendensicht. Status `ai_candidate`, `needs_human_review` und fehlende
Lernendenevidenz werden nicht aufgewertet.

Die gesamte ursprüngliche 3417-Mutation/Rekombination, die historische ST-Sek-I-
Fehlzuordnung, SH-Kohorten, BY-Onkologie/PCR und sonstige breite ursprüngliche
Quellenpflichten bleiben gesondert offen. ST bleibt echte gemeinsame Sek-II-
Einführungsphase; `rawCourseLevel:unspecified` ist unverändert. Keine globale
Quellenfreigabe oder Freigabe des alten kombinierten Vier-Ziele-Bild-Holds erfolgt.

Aktiv weiter **Biologie 67/383**, **Chemie 112/378**. Strenger Nettozuwachs **0**,
neue fachliche Abschlüsse **0**, wiederhergestellte aktive Bindungen **0**.
390 ist Kandidatennenner. Mathematik **807/807 M7** und Physik **478/478 M7**
bleiben geschützt. Menschliche Prüfung, Freigabe, Erprobung sowie Veröffentlichung
oder Deployment werden nicht behauptet.
'''
(OWN / 'README.md').write_text(readme)

# Bind the inherited image views without duplicating their retained PNGs.
views = [OLD_A / 'sources' / name for name in ['TH.physical-028.actual.png', 'MV.physical-030.actual.png', 'ST.physical-042.actual.png']]
write('actual-original-layout-views-and-remaining-gates.json', {'schemaVersion': 1,
    'actualOriginalPagePNGsViewed': [bind(path) for path in views],
    'sourceSectionCodesOnly': 'KEEP11', 'nativeD_P_A_M_VForSevenNewGoalIDs': 'pending',
    'fullGUISupersetRegistrationAndVisibility': 'pending', 'independentRasterV': 'separate review',
    'wholeOriginalSources': 'historical holds preserved', 'activeWrites': False,
    'humanApproval': False, 'humanTrial': False})

inputs = {}
for binding in read(OWN / 'actual-input-closure-and-active19-preservation.json')['historicalExactClosureBindings']:
    inputs[binding['path']] = binding
for binding in read(OWN / 'actual-input-closure-and-active19-preservation.json')['activeInputs']:
    inputs[binding['path']] = binding
for path in [V7 / 'source-topic-corrections.author-v7.final.freeze.json', OLD_A / 'independent-a.final.freeze.json',
             V6 / 'native-seven-source-preparation.author-v6.final.freeze.json',
             BASE / 'chemie-q1-current378-active-integration-verification-v1/final-current-machine-checks-and-inputs.actual.json',
             REPO / 'AGENTS.md', REPO / 'docs/qa-ci/chemie-biologie-m7-commit-checkpoint-2026-10-06.md',
             *views]:
    inputs[str(path.relative_to(REPO))] = bind(path)
for row in read(OWN / 'fresh-independent-original-page-extractions.actual.json')['rows']:
    inputs[row['originalPDF']['path']] = row['originalPDF']
for row in actual['nativeCode']:
    inputs[row['path']] = bind(REPO / row['path'])
for row in actual['originalInputSymlinks']:
    inputs[row['path']] = bind(REPO / row['path'])
for row in actual['existingFullGUIViewChecks']:
    inputs[row['path']] = bind(REPO / row['path'])
files = [{'path': str(path.relative_to(OWN)), 'sha256': sha(path), 'bytes': path.stat().st_size}
         for path in sorted(OWN.rglob('*')) if path.is_file()]
freeze = OWN / 'independent-a-followup.final.freeze.json'
write(freeze.name, {'schemaVersion': 1, 'createdAtUTC': STAMP,
    'role': 'frozen independent targeted A source-topic review; not native D or whole-source clearance',
    'files': files, 'ownFileCount': len(files), 'ownBytes': sum(row['bytes'] for row in files),
    'exactReviewInputBindings': sorted(inputs.values(), key=lambda row: row['path']),
    'elevenReviewedBindingsKEEP': 11, 'REVISE': 0, 'unresolvedReviewedFindings': 0,
    'sevenExistingScienceMemoryDecisionsExactReused': True, 'nativeSourceAtlas': 'PASS390',
    'pureBookModelPages': [383, 390], 'all383OldPagesAnd67ProtectedStrictExact': True,
    'fullCurrentGUIViewsTargetsExact': [168, 436], 'newNativeD_P_A_M_VAndGUIRegistration': 'pending',
    'activeWrites': False, 'strictNetGain': 0, 'newScientificCompletions': 0,
    'restoredActiveBindings': 0, 'humanApproval': False, 'humanTrial': False,
    'publicationOrDeployment': False, 'integrableNow': False})
print(json.dumps({'freeze': str(freeze.relative_to(REPO)), 'sha256': sha(freeze),
                  'ownFiles': len(files), 'boundInputs': len(inputs), 'KEEP': 11, 'REVISE': 0,
                  'strictGain': 0, 'activeWrites': False}))
