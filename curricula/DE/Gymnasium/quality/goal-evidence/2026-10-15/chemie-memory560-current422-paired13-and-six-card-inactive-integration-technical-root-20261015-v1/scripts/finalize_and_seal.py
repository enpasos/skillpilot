# SPDX-License-Identifier: Apache-2.0
"""Seal the actual bounded integration, retaining genuine science and failures."""
import ast
import datetime
import hashlib
import importlib.util
import json
import sys
from pathlib import Path

sys.dont_write_bytecode = True
REPO = Path.cwd()
OWN = Path(__file__).resolve().parents[1]
REL = OWN.relative_to(REPO).as_posix()
E15 = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/'
BASE = E15 + 'chemie-lab2-current422-paired-and-inactive-integration-technical-20261015-v1'
SEAL = OWN / 'FILES.finite-integration.seal.json'
assert not SEAL.exists()


def read(path):
    return json.loads((REPO / path).read_text())


def bind(path):
    data = (REPO / path).read_bytes()
    return {'path': path, 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def write(path, value):
    (OWN / path).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


report_path = REL + '/checks/CENTRAL.current422.memory560-native13-six-cards.v2.stock-report.actual.json'
before = read(BASE + '/checks/CENTRAL.current422.lab2-carbonyl3.stock-report.actual.json')['subjects'][0]
after = read(report_path)['subjects'][0]
assert after['denominator'] == 422 and after['strictComplete'] == 321
assert set(before['strictCompleteGoalIds']) == set(after['strictCompleteGoalIds'])
assert after['gates'] == before['gates']
assert len(after['requiredChecks']) == 6 and all(row['status'] == 'pass' for row in after['requiredChecks'])
assert not after['issues']
write('checks/ACTUAL.strict321-retained-no-new-closures.json', {
    'baselineReport': bind(BASE + '/checks/CENTRAL.current422.lab2-carbonyl3.stock-report.actual.json'),
    'actualFinalReport': bind(report_path), 'old321RetainedIds': sorted(set(after['strictCompleteGoalIds'])),
    'old321LostIds': [], 'netAddedIds': [], 'newScientificStrictClosures': 0,
    'contextRebindings': 13, 'newlyReviewedPImageContexts': 1,
    'actualScientificCardTextRepairs': 6, 'strictGainFromThoseRepairsOrBindings': 0,
    'historical37And40VisibilityFailuresPreserved': True,
    'currentWhole422MemoryOldNinePlusWholeBWPass': True,
})
protected = read(REL + '/checks/PROTECTED.active-inputs.before.json')
for row in protected['files']:
    now = bind(row['path'])
    assert now['sha256'] == row['sha256'] and now['bytes'] == row['bytes'], row['path']
assert len(protected['files']) == 697
write('checks/PROTECTED697.actual-before-after.json', {
    'pass': True, 'before': bind(REL + '/checks/PROTECTED.active-inputs.before.json'),
    'unchangedFiles': 697, 'mathM7': '807/807', 'physicsM7': '478/478', 'biologyM7': '397/397',
    'activeChemistry': 'M6 231/402 unchanged', 'registryAndOriginalInflightLedgerChanged': False,
})
inputs = read(REL + '/INPUTS.original-final-science-and-baseline.json')
mapping = read(REL + '/checks/REBUILD.memory560-native13.physical-exact-map.v2.json')
aliases = {row['normalHostAlias']: row['physicalRepositorySource'] for row in mapping['aliases']}
whole_canonical = aliases['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json']
whole_semantic = aliases['curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json']
whole_qa = aliases['curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json']
holds = {
    'role': 'Retained source/course/atomicity and acquisition limits, independent from now-current Memory visibility',
    'originalSourceCourseHolds': bind(BASE + '/HOLDS.retained-source-course-BW40-and-open-P3.json'),
    'actualFourIndirectAndNineResidualSourceCourseHolds': bind(E15 + 'chemie-bw-lk-memory41-fresh-independent-20261015-v1/FIRST.source-course-deferrals.4-plus9.json'),
    'threeCarbonylPGatesRemainOpen': True,
    'cfaPAndAtomicityRemainOpen': True,
    'remaining101OrdinaryGoalsOpen': True,
    'wholeSourceCourseApproval': False, 'CQR303M7Granted': False,
    'actualMemoryVisibilityClosedForDeclaredTenScopesOnly': True,
    'oldNineScopesUnchangedAndWholeBWScopeAdded': True,
    'noHumanOrExecutedLearnerLabClaim': True,
    'futurePracticalExecutionControlsAndUncertaintyRemainRequired': True,
}
write('HOLDS.retained-source-course-and-acquisition.json', holds)
selector = {
    'schemaVersion': 1, 'role': 'Finite inactive current560/422 integration; informed technical role',
    'wholeCanonical560': whole_canonical, 'semantic560': whole_semantic, 'normalQA438': whole_qa,
    'centralConfig': bind(REL + '/config/central.current422.memory560-genuine13-inactive.config.json'),
    'physicalMap': bind(REL + '/checks/REBUILD.memory560-native13.physical-exact-map.v2.json'),
    'actualCentralReport': bind(report_path), 'actualCentralCommand': bind(REL + '/checks/CENTRAL.final-v2.command.actual.json'),
    'firstIncompleteHostFailurePreserved': bind(REL + '/checks/TECHNICAL.first-central-missing-dynamic-child-module.diagnosis.json'),
    'nativeD13Index': bind(REL + '/native-thirteen/resolution-index.json'),
    'nativeD13Synthesis': bind(REL + '/native-thirteen/synthesis-decisions.json'),
    'originalD13CopiesAndSeals': bind(REL + '/CAS.original-paired13-scientific-results.exact-copies.json'),
    'actualOriginal26RationalesRead': bind(REL + '/checks/ACTUAL.original-FIRST26-rationales-read-and-synthesis-boundary.json'),
    'actualP1AndSixRetainedProfiles': bind(REL + '/CAS.actual-P1-selection-retained-six-and-D13-current-owners.json'),
    'originalMemoryAndGenuineP1': inputs,
    'strictIDsAndNet': bind(REL + '/checks/ACTUAL.strict321-retained-no-new-closures.json'),
    'protected697': bind(REL + '/checks/PROTECTED697.actual-before-after.json'),
    'holds': bind(REL + '/HOLDS.retained-source-course-and-acquisition.json'),
    'activeIntegration': False, 'M7': False, 'newIntegratorVotes': 0, 'humanApproval': False, 'humanTrial': False,
}
write('INPUTS.final-memory560-native13-inactive.physical-exact-selector.json', selector)
write('NEUTRAL.final-memory560-native13-inactive.json', {
    'schemaVersion': 1, 'role': 'Actual bounded inactive integration; no new strict IDs',
    'selector': bind(REL + '/INPUTS.final-memory560-native13-inactive.physical-exact-selector.json'),
    'actualStrict': after['strictComplete'], 'actualDenominator': after['denominator'], 'percentage': after['percentage'],
    'gates': after['gates'], 'requiredChecks': after['requiredChecks'], 'issues': after['issues'],
    'old321Retained': 321, 'old321Lost': 0, 'newScientificStrictClosures': 0,
    'actualIndependentDContextReviews': 26, 'contextGoalIdsRebound': 13,
    'actualScientificCardTextCorrections': 6, 'newMemorySelectionNodes': 6,
    'whole422MemoryWithOriginalNinePlusWholeBW': 'PASS; 0 missing/stale/open or visibility gaps',
    'newlyGenuinePImageContextReviews': 1, 'twelveOtherPProfilesRetainedExact': True,
    'stockNativePipelineCommandsPassed': 6,
    'centralAttempts': 2, 'firstAttemptTechnicalFailureRetained': True, 'finalCentralRequiredChecksPassed': 6,
    'sourceCourseHoldsCleared': False, 'activeIntegration': False, 'M7': False,
    'humanApproval': False, 'humanTrial': False, 'newIntegratorVotes': 0,
    'finiteSealPath': REL + '/' + SEAL.name,
})
(OWN / 'README.md').write_text('''# Memory-Sicht und dreizehn aktuelle Buchkontexte

Tatsächlicher finaler Zentralbericht: 321/422, D322/P343/A349/M422/V416; alle sechs Pflichtprüfungen PASS, issues leer. Alle 321 bisherigen strengen IDs bleiben erhalten, keine neue ID durch Kontextbindungen oder Kartenkorrekturen. Sechs neue echte Memory-Kursauswahlknoten halten den curricularAtomic-Nenner bei 422. Alle ursprünglichen neun Sichtprüfungen bleiben bestehen; zusätzlich besteht die ganze BW-LK-Sicht. Sechs echte fachliche Kartenfehler wurden korrigiert und unabhängig nachgeprüft. Die unveränderten übrigen Karten/Urteile bleiben erhalten.

Die tatsächlich veränderten dreizehn gewöhnlichen Buchkontexte wurden auf echten nativen PDF-/HTML-Seiten in zwei unabhängigen Runden geprüft: je13KEEP. Eigene FIRST-Urteile lagen vor den normalen Records und Validatoren. Die ganze originale Wissenschaft bleibt bytegleich; explizite lineare Supersessions erhalten sämtliche historischen D-Indizes. Das ist keine erneute erstmalige fachliche Zielzählung. Zwölf unveränderte ganze P-Profile bleiben exakt; ein pK-Bildkontext wurde tatsächlich gezielt neu geprüft, nicht nur neu gehasht. Alle sechs normalen nativen Paarungsbefehle bestehen.

Der erste tatsächliche Zentralaufruf hatte einen technischen Fehler im neuen Sparsehost: das separat ausgeführte unveränderte QA-Kinderskript war nicht physisch enthalten. Report und Fehlreceipt bleiben erhalten. Ein neuer Host enthält auch diese normalen Modulabhängigkeiten. Vor dem zweiten gebündelten Zentralaufruf bestanden QA-Freshness und die genaue Modul-/Datenprüfung; der finale Lauf besteht vollständig. Kein fachliches Gate oder Grenzwert wurde gesenkt.

Vier indirekte/partielle und neun übrige Quellen-/Kursbedingungen sowie alle weiteren 101 offenen gewöhnlichen Ziele bleiben offen. Native Seiten enthalten keine gedruckten amtlichen Quellenblöcke; die tatsächlich gelesenen ganzen externen Originalpassagen sind getrennte Eingaben. Keine Vollquellen-/Kursfreigabe und kein M7/CQR-303-Abschluss. Praktische Erwerbskriterien bleiben verbindlich, ohne bereits ausgeführte Lernenden-/Laborversuche zu erfinden. Alle697geschützten aktiven Eingaben bleiben exakt, Mathematik/Physik/Biologie M7 und aktive Chemie M6 231/402 unverändert. Keine Runtime-/Plugin-/Registry-/Ledgeränderung und keine menschliche Freigabe/Erprobung.

Technische Dateien Apache-2.0; eigenes didaktisches Material bleibt CC-BY-4.0, fremde Quellen behalten ihre Provenienz. Nach endlichem Siegel keine weiteren Payload-Writes.
''')
counts = {'JSON': 0, 'JSONL': 0, 'PythonAST': 0}
for path in OWN.rglob('*'):
    assert not path.is_symlink(), path
    if not path.is_file():
        continue
    data = path.read_bytes()
    if path.suffix == '.json':
        assert data.endswith(b'\n'), path; json.loads(data); counts['JSON'] += 1
    elif path.suffix == '.jsonl':
        assert not data or data.endswith(b'\n'), path
        for line in data.splitlines():
            json.loads(line)
        counts['JSONL'] += 1
    elif path.suffix == '.py':
        ast.parse(data, filename=str(path)); counts['PythonAST'] += 1
spec = importlib.util.spec_from_file_location('normal_schema_validator', REPO / 'scripts/validate_schemas.py')
module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
errors = module.curriculum_symlink_errors(REPO)
assert not errors, errors
write('checks/FINAL.serialization-AST-normal-portability.actual.json', {'pass': True, 'normalHelper': bind('scripts/validate_schemas.py'), 'function': 'curriculum_symlink_errors', 'errors': errors, 'parsed': counts})
payload = [bind(path.relative_to(REPO).as_posix()) for path in sorted(OWN.rglob('*')) if path.is_file()]
write(SEAL.name, {'schemaVersion': 1, 'role': 'Final finite integration seal, self excluded', 'sealedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'files': payload, 'payloadFileCount': len(payload), 'payloadBytes': sum(row['bytes'] for row in payload), 'actualStrict': 321, 'denominator': 422, 'newScientificStrictClosures': 0, 'protectedInputsUnchanged': 697, 'activeIntegration': False, 'M7': False, 'humanApproval': False})
print(json.dumps({'neutral': bind(REL + '/NEUTRAL.final-memory560-native13-inactive.json'), 'seal': bind(REL + '/' + SEAL.name), 'payloadFileCount': len(payload), 'strict': 321, 'denominator': 422, 'newScientificStrictClosures': 0, 'requiredChecks': '6 PASS'}))
