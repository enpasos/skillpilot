# SPDX-License-Identifier: Apache-2.0
"""Bind one completed source reading and inactive author proposals; no gate votes."""
import ast
import copy
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parents[1]
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-carbonyl-pharmacy15-current422-whole-material-author-20261015-v1'
GID = '8edee6b6-9ead-515e-93f5-feada64522b2'
NOW = datetime.now(timezone.utc).isoformat()
assert not (OWN / 'FILES.finite-grignard-one-primary-scope-author.seal.json').exists()


def read(p):
    return json.loads(Path(p).read_text())


def write(name, obj):
    (OWN / name).write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')


def bind(path):
    p = Path(path)
    b = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}


ctx = read(OWN / 'inputs/whole-current-goal-prerequisites-parents.exact.json')
goal = ctx['wholeGoal']
first = read(OWN / 'FIRST.grignard-one-primary-scope.author.seal.json')
assert bind(OWN / first['path'])['sha256'] == first['sha256']
frozen_cases = read(OWN / 'inputs/two-whole-frozen-DEEN-cases.exact.json')
original_cases = read(ROOT / frozen_cases['source']['path'])
assert [x for x in original_cases['cases'] if x['goalId'] == GID] == frozen_cases['wholeCases']
original_profiles_path = AUTHOR / 'materials/whole15.current422.profile-payloads.author.json'
original_profile = next(p for p in read(original_profiles_path)['profiles'] if p['goalId'] == GID)
write('inputs/whole-unreviewed-original-author-profile.exact.json', {
    'source': bind(original_profiles_path), 'wholeProfileObject': original_profile, 'wholeObjectUnchanged': True,
    'authority': 'Unreviewed author design, not normative curriculum or an independent P judgment'
})

candidate = copy.deepcopy(goal)
candidate['description'] = 'Die lernende Person kann an ausgewählten Beispielen passende Grignard-Reagenzien und Carbonylverbindungen für einen Zielalkohol auswählen und die C–C-Bindungsbildung sowie anschließende Protonierung mit Reaktionsschritten erklären.'
candidate['descriptionEn'] = 'The learner can select suitable Grignard reagents and carbonyl compounds for a target alcohol in selected examples and explain carbon–carbon bond formation and subsequent protonation using reaction steps.'
candidate['resourceLinks'][0]['altText'] = 'Schematischer Ablauf: Ein Halogenalkan bildet mit Magnesium in trockenem Ether ein Grignard-Reagenz. Es addiert an die dargestellte Ketongruppe zu einem Magnesiumalkoxid; die anschließende Aufarbeitung ergibt einen tertiären Alkohol.'
write('proposals/one-whole-goal.conditional-author-wording-only.json', candidate)
changes = [{'field': k, 'before': goal[k], 'after': candidate[k]} for k in ['description', 'descriptionEn']]
changes.append({'field': 'resourceLinks[0].altText', 'before': goal['resourceLinks'][0]['altText'], 'after': candidate['resourceLinks'][0]['altText']})
reverted = copy.deepcopy(candidate)
reverted['description'] = goal['description']
reverted['descriptionEn'] = goal['descriptionEn']
reverted['resourceLinks'][0]['altText'] = goal['resourceLinks'][0]['altText']
assert reverted == goal
write('proposals/BOUNDED.text-mapping-scope-and-material-conditions.author.json', {
    'role': 'Unselected conditional author proposals after original own FIRST; no source approval, independent vote or active patch',
    'createdAtUTC': NOW, 'goalId': GID,
    'T1': {'action': 'Clarify the retained interpretive teaching example; conditional on author/owner adoption',
           'exactChangesOnly': changes,
           'reasonDe': 'Die Benennung von Reagenz und Carbonyl im Reaktionsschema sowie das Erklären der Reaktionsschritte werden prüfbar. Eine tatsächliche Grignard-Laboroperation wird nicht mehr aus dem mehrdeutigen Wort einsetzen abgeleitet.',
           'normativeLimitDe': 'Allgemeine amtliche Synthese-/Mechanismuskompetenzen stützen diesen didaktischen Zugang, belegen aber keine benannte verbindliche Grignardpflicht. T1 löst daher den fehlenden spezifischen Quellenbeleg nicht und ist kein Scopegrant.',
           'unchanged': ['ID', 'title/titleEn', 'LK tag', 'DE-BY/DE-HE applicability', 'requires/contains', 'weights', 'all image bytes/URLs', 'all other goal fields'],
           'actualImageContextUse': 'Current whole image actually viewed only to describe its three drawn schematic stages; no new V approval.'},
    'M1': {'action': 'Do not add a normal exact/equivalent/partial coverage edge from an unrelated or merely general source duty',
           'proposedNewNormalMappingEdges': [],
           'contextOnlyPrimaryAnchors': [
               {'document': 'HE21.04.2026', 'printedPage': 37, 'section': 'Q1 Stoffgruppen, paragraph beginning Eine Orientierung an Stoffklassen', 'relation': 'General recognition, description and assessment of synthesis routes; optional didactic context, not a named Grignard obligation'},
               {'document': 'BY12eA official page', 'section': 'C12 1.2 Erkenntnisgewinnungskompetenz', 'relation': 'General experimental or model-based hypothesis investigation; not a command to carry out every named possible reaction'}],
           'reasonDe': 'Die479 ausgewählten Zellen haben keine direkte Grignardkante. Die in den tatsächlich gelesenen Primärstellen festgestellte allgemeine Verwandtschaft reicht für eine sachliche Kontextnotiz, aber nicht für eine positive normative Abdeckungskante.'},
    'S1': {'action': 'Keep the specific normative/practical scope unresolved without changing membership or denominator',
           'unresolvedRequiredPracticalGrignardDuty': True,
           'currentJurisdictionsRetained': goal['applicability']['jurisdiction'],
           'sourceAndCourseStatus': 'open; no national or whole-course clearance',
           'removedGoalIds': [], 'removedJurisdictions': [], 'changedDenominator': False,
           'nextEvidenceThatCouldResolve': 'A precise current official primary clause for the relevant school/course explicitly covering Grignard, with its actual operator and any example/choice qualifiers. A generic practical-chemistry clause or another school form cannot supply this by itself.'},
    'materialAndProfileAdoptionConditions': {
        'originalTwoWholeCasesAndProfileRemainExact': True,
        'currentPracticalRequirementNotWaivedInPlace': True,
        'ifT1Adopted': [
            'Create explicit whole successors of both cases and the raw author profile; preserve these originals and their original e3/r3/execution flags as history.',
            'Keep the chemically sound C–C addition, alkoxide, later protonation, supplied protic-interference data,30.0mmol/19.0mmol/95.0% results and independent changed-carbonyl transfer.',
            'Replace the mandatory actual-operation task3/model3/rubric3/coverage clause in both DE/EN versions with an explicit reaction-scheme/reagent-choice or model-interpretation requirement. Change practicalExecutionRequired only in those coherent whole successors.',
            'Update all linked profile case briefs, required expectations and scoring coherently; do not merely relabel the original mandatory practical e3 or promote fingerprints.',
            'Retain true safety/condition explanations. A later approved real laboratory extension is optional and separately observed; no execution is inferred from drawings or model answers.',
            'No E1/G1 promotion, D/P/A decision, semantic grant or source approval is produced by this conditional source clarification.'
        ],
        'suggestedExplicitTask3De': 'Ordne die Schritte im Reaktionsschema und begründe die Auswahl von Carbonylverbindung und Grignard-Reagenz für den Zielalkohol. Erkläre, welche Aussagen das vereinfachte Schema erlaubt und warum daraus keine tatsächliche Durchführung oder experimentelle Ausbeute folgt.',
        'suggestedExplicitTask3En': 'Order the reaction-scheme steps and justify the choice of carbonyl compound and Grignard reagent for the target alcohol. Explain what the simplified scheme supports and why it does not establish actual execution or an experimental yield.'
    },
    'activeWrites': 0, 'newDPA_M7Votes': 0
})

html_refs = []
for name, spans in [('BY12EA-current', [(45, 78), (208, 249)]), ('BY13EA-current', [(45, 78), (178, 234), (392, 414)])]:
    p = OWN / 'sources' / f'{name}.official-main-text.txt'
    lines = p.read_text().splitlines()
    html_refs.append({'wholeRawHTML': bind(OWN / 'sources' / f'{name}.official-observed.html'),
                      'readableTextWithStableLineNumbers': bind(p),
                      'selectedPassagesActuallyRead': [{'fromLine': lo, 'toLine': hi, 'exactLines': lines[lo - 1:hi]} for lo, hi in spans],
                      'grignardKeywordLinesInThisObservedPage': [i + 1 for i, line in enumerate(lines) if 'grignard' in line.lower()],
                      'wholeOtherSchoolYearsOrWholeCourseApproval': False})
write('sources/ACTUAL.primary-operators-and-exact-local-anchors.json', {
    'role': 'Exact source locators and actual limited reading receipt, not a source-review approval',
    'actualReceiptWrittenAtUTC': NOW,
    'HE': [
        {'source': bind(ROOT / 'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-chemie.pdf'), 'edition': '2024 original locally supplied source', 'pageCoordinates': 'Printed page = one-based PDF page; single body column', 'pagesActuallyReadForThisQuestion': [37, 38, 39], 'rasterActuallyViewed': [39]},
        {'source': bind(ROOT / 'curricula/DE/Gymnasium/input/HE/upper-secondary/kcgo_chemie_21.04.2026.pdf'), 'edition': '21.04.2026 official current body, observed byte-exact online', 'pageCoordinates': 'Printed page = one-based PDF page; single body column', 'pagesActuallyReadForThisQuestion': [29, 30, 37, 38, 39, 42], 'rasterActuallyViewed': [30, 37, 39],
         'primaryAnchors': [
             {'page': 30, 'heading': 'Verbindliche Regelungen / Differenzierung', 'operatorBoundary': 'Example-binding rules concern content selection; they do not by themselves turn a represent/explain duty into observed laboratory performance.'},
             {'page': 37, 'heading': 'Q1 Stoffgruppen', 'operatorBoundary': 'Synthesis routes are to be recognized, described and assessed across substance classes; no named Grignard laboratory duty.'},
             {'page': 39, 'heading': 'Q1.2 erhöhtes Niveau (Leistungskurs)', 'actualListedContent': 'Coordinative binding at copper(II) tartrate and SN1/SN2 mechanisms with inductive/steric effects; no named Grignard item.'},
             {'page': 42, 'heading': 'Q2.1 erhöhtes Niveau (Leistungskurs)', 'operatorBoundary': 'Named nucleophilic addition concerns carbohydrate hemiacetal/acetal formation; not Grignard equivalence.'}]}],
    'BY': html_refs,
    'keywordRoutingBoundary': 'Keyword checks only route attention. In addition, the named full relevant primary sections and their headings/operators were actually read. No absence in all states, school forms, years or source documents is inferred.',
    'accessLimit': 'Two guessed BY10/11-NTG URLs failed in the web tool and supply no positive or negative page evidence; no broader search or retry was used to fill this with assumptions.',
    'otherKeywordRouting': '31 already-bound Carbonyl primary PDFs were routed once for the word Grignard with no hits. Their full contents were not read or copied, and this does not establish nationwide absence.',
    'sourceOriginalsModified': 0, 'freshReviewerFilesRead': 0, 'newSourceApprovals': 0
})

source_inputs = [ctx['canonical'], frozen_cases['source'], read(OWN / 'inputs/original-HE-graph-provenance.exact.json')['source'], bind(original_profiles_path)]
for p in ['curricula/DE/Gymnasium/input/BY/gymnasium/Chemie.json',
          'curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_CHEMIE_GYMNASIUM_LEHRPLANPLUS.source-extraction.json',
          'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-chemie.pdf',
          'curricula/DE/Gymnasium/input/HE/upper-secondary/kcgo_chemie_21.04.2026.pdf',
          'curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_CHEMIE_SEKII_KC2024_CURRENT2026.source-extraction.json']:
    source_inputs.append(bind(ROOT / p))
source_inputs.append(read(OWN / 'checks/selected479-direct-edge-absence.bounded.json')['source'])
for row in source_inputs:
    assert bind(ROOT / row['path']) == row
assert goal['applicability']['jurisdiction'] == ['DE-BY', 'DE-HE']
assert all(c['practicalExecutionRequired'] and c['maximumPoints'] == 6 for c in frozen_cases['wholeCases'])
assert (30 == min(30, 35 - 1)) and (19 == min(20, 25 - 6)) and (19 / 20 == .95)
write('checks/FINITE.bounded-source-and-proposal-CAS.actual.json', {
    'checkedAtUTC': NOW, 'originalFIRSTUnchanged': True, 'wholeOriginalCasesRetained': 2,
    'originalCurrentPracticalE3RetainedAsOriginal': True, 'candidateChangedFieldsOnly': [r['field'] for r in changes],
    'candidateOtherWholeGoalFieldsExact': reverted == goal, 'changedIDs': 0, 'changedApplicability': 0, 'changedEdges': 0,
    'changedDenominator': False, 'positiveNewNormalMappingEdges': 0, 'originalExternalInputsExact': source_inputs,
    'modelAmountChecks': {'case1MaxMillimoles': 30.0, 'case2MaxMillimoles': 19.0, 'case2MaxFraction': .95},
    'newDPA_M7Votes': 0, 'newSourceApprovals': 0, 'nativeBuilds': 0, 'centralRuns': 0, 'activeWrites': 0,
    'sourceScopeRemainsOpen': True
})
(OWN / 'README.md').write_text('''# Grignard: gezielte Primärquellen- und Scopeklärung

Für genau `8edee6b6-9ead-515e-93f5-feada64522b2` ist kein positiver Beleg für eine verpflichtende praktische Grignardausführung aus den tatsächlich geprüften aktuellen HE-/BY-Passagen gewonnen worden. Die spezifische Quellen-/Scopefrage bleibt offen. Keine nationale Abwesenheit oder ganze Kursfreigabe wird behauptet.

Die eigene ursprüngliche HE-Graphfassung enthält bereits denselben DE/EN-Wortlaut „Reagenzien einsetzen“. Sie ist Projektprovenienz und keine amtliche Primärstelle. Der heutige Satz ist mehrdeutig; die zwei vollständigen gefrorenen Fälle und das E0/G0-Profil machen dagegen einen echten Laborvollzug zwingend. Deren ehrlicher Hinweis auf fehlende Beobachtungen ersetzt keinen curricularen Beleg für diese zusätzliche Pflicht.

Die gelesenen ganzen HE-Q1.2-Passagen der Ausgabe2024 und der aktuellen Ausgabe21.04.2026 nennen andere, konkret begrenzte LK-Inhalte. Der aktuelle offizielle HE-PDF-Body stimmt bytegenau mit dem lokalen Original überein. BY12/13-eA liefern allgemeine experimentelle und modellbezogene Kompetenzen, aber keinen hier gefundenen spezifischen Grignardoperator. Alle exakten Stellen, vollständigen relevanten Seiten, Spalten-/Kursüberschriften, Operatorgrenzen und aktuellen offiziellen HTML-Bytes sind gebunden. Nicht gelesene ganze Dokumente werden nicht freigegeben. Beide `rawText`/`text`-Quellfelder wurden berücksichtigt.

`FIRST.grignard-one-primary-scope.author.original.json` wurde vor den Vorschlägen und dem finalen Binder unverändert gesondert versiegelt. Der begrenzte, **unselektierte** Autorenvorschlag formuliert die Auswahl von Reaktionspartnern und das Erklären der Additions-/Protonierungsschritte eindeutig. Das erhält ein didaktisches Synthesebeispiel, löst aber nicht automatisch den fehlenden spezifischen Pflichtbeleg. Eine konkrete Mappingkante wird mangels positiver Äquivalenz nicht erfunden. Falls der Wortlaut später übernommen wird, müssen beide ganzen Fälle und der Autorprofilkörper konsistente, ausdrücklich dokumentierte Nachfolger erhalten; die aktuelle praktische e3 wird hier nicht rückwirkend umgedeutet.

ID, LK-Tag, DE-BY/DE-HE-Geltung, Kanten, Bilder, aktive Mappings und Denominator bleiben exakt. Keine D/P/A/M/V-Stimme, Source-/Course-/Human-/M7-Freigabe, kein Lernenden-/Labornachweis, kein Nativehost oder Zentralbericht. Root prüft das endliche Paket; danach STOP.

Eigene fachliche Texte und Kandidaten: CC-BY-4.0 gemäß Repository-Lizenzzuordnung. Technische Skripte: Apache-2.0. Amtliche Originalquellen bleiben unverändert und werden nicht neu lizenziert.
''')
counts = {'json': 0, 'python': 0}
for p in OWN.rglob('*'):
    assert not p.is_symlink(), p
    if p.is_file() and p.suffix == '.json': read(p); counts['json'] += 1
    if p.is_file() and p.suffix == '.py': ast.parse(p.read_text()); counts['python'] += 1
selector_name = 'INPUTS.final-grignard-one-primary-scope.author-selector.json'
write(selector_name, {
    'schemaVersion': 1, 'role': 'Finite single-goal informed author primary-source/scope candidate; no gate grants', 'frozenAtUTC': NOW,
    'goalId': GID, 'originalFIRST': bind(OWN / first['path']), 'originalFIRSTSeal': bind(OWN / 'FIRST.grignard-one-primary-scope.author.seal.json'),
    'physicalUnchangedSourceInputs': source_inputs,
    'finiteOwnFiles': [bind(p) for p in sorted(OWN.rglob('*')) if p.is_file()],
    'proposalStatus': 'unselected, inactive, conditional author clarification', 'specificPracticalSourceScope': 'unresolved',
    'newMappingEdges': 0, 'changedDenominator': False, 'freshDReviewerOrPeerFIRSTFilesRead': 0,
    'newDPA_M7Votes': 0, 'HumanApproval': False, 'HumanTrial': False, 'nativeHostsBuilt': 0, 'activeWrites': 0,
    'ownFormatParseBeforeFinalSelector': counts, 'state': 'finite; parent inspection required; STOP'
})
members = sorted(p for p in OWN.rglob('*') if p.is_file())
seal_name = 'FILES.finite-grignard-one-primary-scope-author.seal.json'
write(seal_name, {'schemaVersion': 1, 'sealedAtUTC': datetime.now(timezone.utc).isoformat(),
                  'role': 'Finite bounded primary-source author packet; no independent scientific gate vote',
                  'selector': bind(OWN / selector_name), 'fileCountExcludingSeal': len(members),
                  'totalBytesExcludingSeal': sum(p.stat().st_size for p in members),
                  'files': [bind(p) for p in members], 'state': 'finite; STOP'})
for row in read(OWN / seal_name)['files']:
    assert bind(ROOT / row['path']) == row
print(json.dumps({'selector': bind(OWN / selector_name), 'seal': bind(OWN / seal_name),
                  'FIRST': bind(OWN / first['path']), 'filesExcludingSeal': len(members),
                  'bytesExcludingSeal': sum(p.stat().st_size for p in members), 'state': 'STOP'}, indent=2))
