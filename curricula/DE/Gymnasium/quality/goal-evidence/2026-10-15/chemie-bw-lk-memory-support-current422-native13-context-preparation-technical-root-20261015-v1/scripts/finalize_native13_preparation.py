# SPDX-License-Identifier: Apache-2.0
"""Seal actual blank native pages and complete scientific inputs without review votes."""
import ast
import hashlib
import importlib.util
import json
import re
import sys
from pathlib import Path

import fitz

sys.dont_write_bytecode = True
REPO = Path.cwd()
OWN = Path(__file__).resolve().parents[1]
REL = OWN.relative_to(REPO).as_posix()
BASE = 'curricula/DE/Gymnasium/quality/goal-evidence/'
E15 = BASE + '2026-10-15/'
SEAL = OWN / 'FILES.finite-native-preparation.seal.json'
assert not SEAL.exists(), 'Never modify sealed preparation'


def get(path):
    return json.loads((REPO / path).read_text())


def bind(path):
    data = (REPO / path).read_bytes()
    return {'path': path, 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def write(path, value):
    (OWN / path).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


inputs = get(REL + '/INPUTS.exact-native13-preparation.json')
ids = inputs['scopeGoalIds']
native = REL + '/native-thirteen-v2'
manifest = get(native + '/batch-manifest.json')
model = get(native + '/bundle/book-model.json')
assert manifest['goalIds'] == ids and len(ids) == 13
assert model['book']['pageCount'] == 13
for name in ['PREPARE.v2', 'CHECK.v2']:
    assert get(REL + '/checks/' + name + '.command.actual.json')['exitCode'] == 0
document = fitz.open(REPO / (native + '/bundle/book.pdf'))
pages = []
assert len(document) == 15
for index, page in enumerate(document):
    text = page.get_text()
    found = [goal_id for goal_id in ids if goal_id in text]
    headers = re.findall(r'Lernziel-ID\s+([a-f0-9-]{36})', text)
    assert headers == ([] if index < 2 else [ids[index - 2]])
    pages.append({'pdfPage': index + 1, 'actualGoalHeaderIds': headers, 'allScopedIdsIncludingCrossReferences': found, 'textCharacters': len(text)})
write('checks/PDF.actual-native-fifteen-pages.json', {'role': 'Mechanical paging; no visual or scientific verdict', 'pages': pages, 'frontPages': 2, 'wholeGoalPages': 13})
campaigns = []
for round_name in ['a', 'b']:
    directory = native + '/round-' + round_name
    campaign = get(directory + '/description-review-campaign.json')
    assert campaign['blindToOtherReviews'] is True and campaign['reviewPass'] == 'first_pass'
    assert list((REPO / directory / 'results').iterdir()) == []
    campaigns.append({'round': round_name, 'campaign': bind(directory + '/description-review-campaign.json'), 'input': bind(directory + '/description-review-input.json'), 'bundle': bind(directory + '/review-bundle-manifest.json'), 'resultRecordsWritten': 0})
sources = [
    REL + '/inputs/THIRTEEN.whole-current-goals.exact.json',
    REL + '/inputs/P12.current321.whole-original-lines.exact.jsonl',
    E15 + 'chemie-pk-one-current422-image-context-targeted-positive-independent-20261015-v1/P/P1.current422.image-bound.records.jsonl',
    BASE + '2026-10-14/chemie-acid-base-seven-positive-profile-author-shapes-technical-20261014-v1/inputs/fourteen-full-cases.bound.exact.json',
    BASE + '2026-10-12/chemie-q4-thermodynamics-eleven-current402-P-A-source-author-20261012-v2/cases/whole11.DEEN.cases-material-data-modelanswers-rubrics.json',
    BASE + '2026-10-12/chemie-q4-thermodynamics-eleven-current402-P-A-source-author-20261012-v2/sources/ALL32.raw-mapping-decisions-sourceGoals-occurrences-passages.selected11.json',
    BASE + '2026-10-12/chemie-q3-three-current402-live-context-author-20261012-v7/cases/cases6.current402.whole-context.technical.json',
    E15 + 'chemie-bw-lk-memory-support-selection-author-20261015-v1/sources/forty-whole-required-goals-card-origin-source-projection-grid.author.json',
    E15 + 'chemie-bw-lk-memory-support-selection-author-20261015-v1/candidate/de-bw-lk.whole-view.memory-support-selection.author.json',
    E15 + 'chemie-bw-lk-six-card-defects-scientific-remediation-author-root-20261015-v1/REBUILD.six-normal-data-deck-aliases.six-card-successor.json',
]
decks = get(sources[-1])
# The full map is bound rather than interpreting or recasting its scientific fields.
science = [bind(path) for path in sources]
selector = {
    'schemaVersion': 1,
    'role': 'Actual finite native13 context preparation, no new D/A/M/V vote or central progress claim',
    'scopeGoalIds': ids,
    'canonical560': inputs['canonical560'],
    'semantic560': inputs['semantic560'],
    'initialInputs': bind(REL + '/INPUTS.exact-native13-preparation.json'),
    'physicalRebuildMap': bind(REL + '/checks/REBUILD.native13.physical-exact-map.json'),
    'nativeConfig': bind(REL + '/config/native13.normal-prepare-with-genuine-P1.config.json'),
    'nativeManifest': bind(native + '/batch-manifest.json'),
    'nativePDF': bind(native + '/bundle/book.pdf'),
    'nativeHTML': bind(native + '/bundle/book.html'),
    'nativeBookModel': bind(native + '/bundle/book-model.json'),
    'nativeReviewInput': bind(native + '/bundle/review-input.json'),
    'scientificReviewInputs': science,
    'blankCampaigns': campaigns,
    'caseBoundary': 'Read all thirteen whole profile bodies and their full cases. Additionally G2-C1/C2 in the acid full-cases file, complete cases/solutions/rubrics of 801790f9,4a08f31f,dcbad4e4 in Q4, and whole q3-10-a/b including scoring/freshTransfer in the Q3 whole-context cases file. No rubric-only substitution.',
    'sourceBoundary': 'Verify the actual native source bindings and full primary passages for the thirteen context changes. Bound whole40 BW source grid retains four indirect/partial and nine residual source/course holds. This is not whole-course approval.',
    'reviewBoundary': 'Read actual PDF two front pages plus thirteen goal pages, HTML, model, review-input, whole profiles/cases/primary/memory context and assigned blank round only. Original FIRST science must precede Stock records/fingerprints and peer exposure.',
    'PBoundary': 'Twelve whole original positive profiles retained byte-exact. One pK image-context P1 was genuinely newly reviewed before Stock materialization because previous valid text-only input did not include the actual image digest; initial failed prepare preserved. No thirteen-P refresh.',
    'allThirteenWholeOrdinaryBodiesUnchanged': True,
    'newLabTwoNotInScope': True,
    'sourceCourseHoldsCleared': False,
    'PDFPages': 15, 'frontPages': 2, 'goalPages': 13,
    'newDvotes': 0, 'newStrictClosures': 0, 'lastMeasuredStrict': 321, 'currentAtomicDenominator': 422,
    'centralExecuted': False, 'activeIntegration': False, 'humanApproval': False, 'humanTrial': False,
}
write('INPUTS.final-native13.physical-exact-selector.json', selector)
write('NEUTRAL.final-native13-context-preparation.json', {'schemaVersion': 1, 'selector': bind(REL + '/INPUTS.final-native13.physical-exact-selector.json'), 'scopeGoalIds': ids, 'nativePDF': selector['nativePDF'], 'nativeHTML': selector['nativeHTML'], 'nativeBookModel': selector['nativeBookModel'], 'blankCampaigns': campaigns, 'normalPrepareCheckPassed': True, 'initialPResourceModeFailurePreserved': True, 'initialFailureExitCode': get(REL + '/checks/PREPARE.command.actual.json')['exitCode'], 'newDvotes': 0, 'newStrictClosures': 0, 'centralExecuted': False, 'activeIntegration': False, 'humanApproval': False, 'humanTrial': False})
(OWN / 'README.md').write_text('''# Dreizehn tatsächliche Memory-Kontextänderungen

Unveränderte normale Stockprepare/check bestehen. Die native PDF enthält zwei Frontseiten und dreizehn ganze Zielseiten; HTML, BookModel, ReviewInput und zwei leere unabhängige Kampagnen sind im finalen Selektor gebunden. Alle dreizehn Zielkörper bleiben unverändert. Sechs neue Memory-Auswahlziele verändern die eingehenden Abhängigkeiten; Memory ersetzt kein Verständnis. Zwölf vorhandene ganze P-Zeilen bleiben bytegleich; ein pK-Bildkontext wurde tatsächlich gezielt neu geprüft. Der erste gescheiterte Stockprepare bleibt unverändert erhalten, ebenso seine alte Konfiguration. Keine Hash-Anpassung ersetzt eine fachliche Prüfung.

Reviewer lesen alle vollständigen Eingaben einschließlich ganzer Fälle/Lösungen/Rubriken, amtlicher Originalpassagen und Memorykarten sowie die tatsächlich gerenderten Seiten. Nur die zugewiesene leere Runde öffnen; eigene FIRST-Urteile vor Stockvalidierung und fremden Ergebnissen versiegeln. Quellen-/Kursbedingungen einschließlich vier indirekter und neun verbleibender BW-Quellenbindungen bleiben offen. Keine neue D-Freigabe, keine strenge Zielzählung oder aktive Integration, keine menschliche Freigabe/Erprobung. Technische Dateien Apache-2.0; eigenes didaktisches Material behält CC-BY-4.0 und fremde Quellen ihre Provenienz.
''')
counts = {'json': 0, 'jsonl': 0, 'pythonAST': 0}
for path in OWN.rglob('*'):
    assert not path.is_symlink(), path
    if not path.is_file():
        continue
    if path.suffix == '.json':
        data = path.read_bytes(); assert data.endswith(b'\n'), path
        json.loads(data); counts['json'] += 1
    elif path.suffix == '.jsonl':
        data = path.read_bytes(); assert not data or data.endswith(b'\n'), path
        for line in data.splitlines():
            json.loads(line)
        counts['jsonl'] += 1
    elif path.suffix == '.py':
        ast.parse(path.read_text(), filename=str(path)); counts['pythonAST'] += 1
spec = importlib.util.spec_from_file_location('normal_schema_validator', REPO / 'scripts/validate_schemas.py')
module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
errors = module.curriculum_symlink_errors(REPO)
assert not errors, errors
write('checks/FINAL.normal-serialization-AST-and-portability.actual.json', {'pass': True, 'normalHelper': bind('scripts/validate_schemas.py'), 'function': 'curriculum_symlink_errors', 'errors': errors, 'counts': counts, 'newScientificVotes': 0})
payload = [bind(path.relative_to(REPO).as_posix()) for path in sorted(OWN.rglob('*')) if path.is_file()]
write(SEAL.name, {'schemaVersion': 1, 'role': 'Final finite technical payload seal; excludes only this seal itself', 'payloadFileCount': len(payload), 'payloadBytes': sum(row['bytes'] for row in payload), 'files': payload})
print(json.dumps({'selector': bind(REL + '/INPUTS.final-native13.physical-exact-selector.json'), 'seal': bind(REL + '/' + SEAL.name), 'payloadFileCount': len(payload), 'PDFPages': 15, 'blankCampaigns': 2, 'newDvotes': 0}))
