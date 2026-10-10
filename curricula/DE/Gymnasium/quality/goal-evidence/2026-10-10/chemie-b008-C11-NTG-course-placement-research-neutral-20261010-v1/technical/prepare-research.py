from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import datetime
import hashlib
import json
import requests
from bs4 import BeautifulSoup

ROOT = Path.cwd()
OUT = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-C11-NTG-course-placement-research-neutral-20261010-v1')
AUTHOR = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-source24-targeted-parent-split-author-successor-20261010-v1')
GOAL = 'e5a5dcd8-053c-55fd-b5c7-bba93779da53'
SOURCE = '7ee6a5cd-dce6-57ad-b126-c1e3a05f234c'
urls = {
    'C11-NTG': 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/11/chemie',
    'GSO-Anlage1': 'https://www.gesetze-bayern.de/Content/Document/BayGSO-ANL_1',
    'GSO-17': 'https://www.gesetze-bayern.de/Content/Document/BayGSO-17',
    'GSO-Anlage3': 'https://www.gesetze-bayern.de/Content/Document/BayGSO-ANL_3',
    'Oberstufe-Allgemeines': 'https://www.gymnasiale-oberstufe.bayern.de/allgemeines',
    'C12-gA': 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/chemie/grundlegend',
    'C12-eA': 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/chemie/erhoeht',
}


def sha(data):
    return 'sha256:' + hashlib.sha256(data).hexdigest()


def bind(path):
    path = Path(path)
    assert not path.is_absolute() and '..' not in path.parts
    data = path.read_bytes()
    return {'path': str(path), 'sha256': sha(data), 'bytes': len(data)}


def put(name, value):
    path = OUT / name
    path.parent.mkdir(parents=True, exist_ok=True)
    assert not path.exists(), str(path)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return bind(path)


def fetch(item):
    key, url = item
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    soup = BeautifulSoup(response.content, 'html.parser')
    text = ' '.join(soup.stripped_strings)
    observation = {
        'key': key, 'url': url, 'actualResponseUrl': response.url,
        'actualHttpStatus': response.status_code,
        'retrievedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'actualResponseContentSha256': sha(response.content),
        'actualResponseContentBytes': len(response.content),
        'actualTitle': ' '.join(soup.title.stripped_strings) if soup.title else None,
        'snapshotStored': key.startswith('GSO-'),
        'noSourceExtractionOrOperativeCourseMetadataChange': True,
    }
    if key.startswith('GSO-'):
        path = OUT / 'primary' / f'{key}.current-official.html.snapshot.txt'
        path.parent.mkdir(parents=True, exist_ok=True)
        assert not path.exists()
        path.write_bytes(response.content)
        observation['actualOfficialLegalTextSnapshot'] = bind(path)
        observation['thirdPartyRights'] = 'Official legal text retained as primary evidence; no grant for provider site layout or logos asserted'
    return key, observation, soup, text


with ThreadPoolExecutor(max_workers=4) as pool:
    results = list(pool.map(fetch, urls.items()))
observations = {key: receipt for key, receipt, _, _ in results}
soups = {key: soup for key, _, soup, _ in results}
texts = {key: text for key, _, _, text in results}
operator = 'beschreiben und bewerten soziale, kulturelle, technologische sowie ökologische und ökonomische Einflüsse auf die Entwicklung naturwissenschaftlichen Wissens.'
assert operator in texts['C11-NTG']
assert 'Chemie 11 (NTG)' in texts['C11-NTG']
observations['C11-NTG']['shortActualQuote'] = operator
observations['C11-NTG']['ownObservationDe'] = 'Der aktuelle Fachlehrplan ordnet den ganzen Operator der Jahrgangsstufe11 und ausdrücklich der Ausbildungsrichtung NTG zu. Die Seite weist dafür weder gA/eA noch GK/LK aus.'
tables = soups['GSO-Anlage1'].find_all('table')
assert len(tables) == 6
table_facts = []
for name, table in zip(['HG', 'SG', 'NTG', 'MuG', 'WWG', 'SWG'], tables):
    chem_rows = [row for row in table.find_all('tr') if ' '.join(row.stripped_strings).startswith('Chemie ')]
    assert len(chem_rows) == 1
    cells = [' '.join(cell.stripped_strings) for cell in chem_rows[0].find_all(['td', 'th'])]
    assert len(cells) == 8
    table_facts.append({'regularProgramme': name, 'subject': cells[0],
                        'hoursByYear5to11': dict(zip([str(n) for n in range(5, 12)], cells[1:]))})
assert [row['hoursByYear5to11']['11'] for row in table_facts] == ['–', '–', '2', '–', '–', '–']
observations['GSO-Anlage1']['actualRegularProgrammeTableFacts'] = table_facts
observations['GSO-Anlage1']['ownObservationDe'] = 'In den sechs regulären Stundentafeln ist Chemie in Jahrgang11 im NTG zweistündiges Pflichtfach; die anderen fünf regulären Ausbildungsrichtungen weisen dort keine Chemie-Pflichtstunden aus. Sonderwege wie Einführungsklassen oder freiwilliger Unterricht werden damit nicht ausgeschlossen.'
assert 'Für die Jahrgangsstufen 12 und 13' in texts['GSO-17']
observations['GSO-17']['shortActualQuote'] = 'Für die Jahrgangsstufen 12 und 13 wird das Kursprogramm'
observations['GSO-17']['ownObservationDe'] = 'Das Kursprogramm für12/13 wird nach §17 in Jahrgang11 gewählt. Der Wahlzeitpunkt legt das Anforderungsniveau des laufenden C11-Unterrichts nicht rückwirkend fest.'
assert 'Chemie' in texts['GSO-Anlage3'] and '12 und 13' in texts['GSO-Anlage3']
observations['GSO-Anlage3']['ownObservationDe'] = 'Die Stundentafel12/13 führt Chemie als dreistündigen Kurs. Diese eigenständige Qualifikationsphasenregel ersetzt nicht den NTG11-Operator.'
assert 'Einführungsphase' in texts['Oberstufe-Allgemeines'] and 'Qualifikationsphase' in texts['Oberstufe-Allgemeines']
observations['Oberstufe-Allgemeines']['shortActualQuote'] = 'Als Einführungsphase der Oberstufe bereitet Sie die Jahrgangsstufe 11'
observations['Oberstufe-Allgemeines']['ownObservationDe'] = 'Die amtliche Oberstufeninformation trennt ausdrücklich die Einführungsphase11 von der späteren Profil- und Leistungsstufe12/13.'
for key, level in [('C12-gA', 'grundlegendes Anforderungsniveau'), ('C12-eA', 'erhöhtes Anforderungsniveau')]:
    assert level in texts[key]
    observations[key]['ownObservationDe'] = f'Der separate Fachlehrplan12 trägt ausdrücklich die Niveauangabe {level}. Hier nur Abgrenzung der Kursdimension; keine Übernahme eines C12-Operators als Ersatz für C11.1.11.'
for receipt in observations.values():
    assert len(receipt.get('shortActualQuote', '').split()) <= 25
live = put('sources/actual-official-live-programme-and-course-observations.json', {
    'schemaVersion': 1, 'goalId': GOAL,
    'researcherPreviouslySource24IndependentA': True,
    'blindThirdIndependentReview': False,
    'observations': list(observations.values()),
    'livePrimarySourcesFetchedAndActuallyRead': 7,
    'coursePlacementApproval': False, 'humanApproval': False,
})
hold = json.loads((AUTHOR / 'source-atlas/C11-e5a5-whole-current-primary-programme-duration-and-course-HOLD.actual.json').read_text())
extraction_path = Path('curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_CHEMIE_GYMNASIUM_LEHRPLANPLUS.source-extraction.json')
extraction = json.loads(extraction_path.read_text())
source = next(value for value in extraction['sourceGoals'] if value['id'] == SOURCE)
passage = next(value for value in extraction['passages'] if value['id'] == source['passageId'])
assert source['sourceSpan'] == 'C11.1.11' and source['courseLevel'] == 'unspecified'
assert source['sourceText'] == operator
input_bindings = [bind(extraction_path), bind('curricula/DE/Gymnasium/input/BY/gymnasium/Chemie.json'),
                  hold['actualCurrentOfficialWholeLearningArea1'],
                  bind(AUTHOR / 'neutral-source24-whole-primary-and-bounded-mapping.portable-successor-v2.entry.json'),
                  bind(AUTHOR / 'source-atlas/C11-e5a5-whole-current-primary-programme-duration-and-course-HOLD.actual.json'),
                  bind('app/scripts/goalBookSourceAtlasInputs.ts'),
                  bind('app/src/landscapeTypes.ts'),
                  bind('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json')]
frame = put('inputs/current-C11-whole-operator-occurrences-and-programme.research-frame.json', {
    'schemaVersion': 1, 'goalId': GOAL,
    'sourceGoalId': SOURCE, 'wholeCurrentChild': hold['wholeCurrentChild'],
    'wholeSourceOperatorAndAllOccurrences': source,
    'wholeC11LearningArea': passage,
    'wholeC11YearUnit': hold['wholeActualC11ProgrammeUnit'],
    'inputBindings': input_bindings,
    'sourceMetadataUnspecifiedPreserved': True, 'noC12Proxy': True,
    'coursePlacementApproval': False,
})
finding = put('RESEARCH.current-C11-NTG-course-placement.findings.json', {
    'schemaVersion': 1, 'goalId': GOAL, 'sourceGoalId': SOURCE,
    'role': 'Targeted read-only researcher with disclosed prior Source24-A knowledge; not blind third scientific or course review',
    'livePrimaryEvidence': live, 'actualWholeCurrentFrame': frame,
    'confirmedPrimaryPlacement': {'jurisdiction': 'DE-BY', 'schoolForm': 'Gymnasium',
                                 'programmeYear': 11, 'regularTrainingDirection': 'NTG',
                                 'programmePhase': 'Einführungsphase',
                                 'officialCourseLevel': 'unspecified',
                                 'regularProgrammeWeeklyChemistryHours': 2},
    'substantiveInterpretationDe': 'Der ganze C11-Operator ist als Pflichtkompetenz im regulären NTG11-Unterricht amtlich belegt und innerhalb dieses Programms kursneutral. Die Quellen belegen weder einen speziellen GK noch einen speziellen LK in C11. Dass NTG-Lernende danach entweder gA/eA wählen können, macht den C11-Operator nicht zur nachgewiesenen Pflicht sämtlicher späteren BY-Chemie-GK/LK-Lernenden anderer Ausbildungsrichtungen.',
    'commonTechnicalGKAndLKCandidateConditionDe': 'Nur als offen authored gemeinsame NTG-Einführungsphasen-Projektion denkbar, sofern NTG/Jahrgang11 als tatsächliche Einschränkung erhalten bleiben und ihre normale Auswahl/Projektion belegt ist. Das wäre eine neue fachlich zu prüfende Platzierungsentscheidung, keine Korrektur der amtlichen sourceGoal.courseLevel-Metadaten.',
    'separateTechnicalGKOrLKPlacementSupported': False,
    'blanketBYGKAndLKPlacementSupported': False,
    'officialGKAndLKMetadataRelabellingSupported': False,
    'normalApiBoundary': {
        'sourceAtlasFacet': 'Actual C11 courseLevel unspecified is ignored as unknown and yields no known course profile; SekII needs a known profile before a source-metadata witness is scoped.',
        'authoredFallback': 'The unmodified normal source Atlas API explicitly accepts only four BB/BE Chemistry fallback views. BY is rejected by the path/jurisdiction assertions at lines211-221.',
        'fallbackGeneratedScope': 'Current generated scope keys are jurisdiction,stage,courseProfile; a free track field alone is not passed into the generated Atlas scope.',
        'goalPlacementContext': 'Generic authoring context allows string keys, but that type is not proof of corresponding runtime/course filtering or normal Atlas support.',
        'checkerOrRuleChangeMade': False,
    },
    'concreteRemainingNeedDe': 'Ein neutraler, ausdrücklich NTG11-begrenzter Author-Kandidat mit real wirksamer Programm-/Platzierungsbindung und zwei echten unabhängigen Kurs-/Kontextreviews wäre nötig. Bei einer breiten GK/LK-Übernahme müsste zusätzlich eine amtliche Pflicht dieses Operators für nicht-NTG-Lernende belegt sein. Die vorhandenen Quellen liefern das nicht. Kein neuer amtlicher Kursname wird erfunden; normale BY-Fallback-Unterstützung fehlt und wird in diesem QS-Paket nicht freigeschaltet.',
    'currentDecision': 'HOLD_SOURCE_COURSE_UNSPECIFIED_WITH_CONFIRMED_NTG11_PRIMARY_PLACEMENT',
    'protectedBoundaries': {'sourceSupportedCandidateUnion': 378, 'wholeCurricularAtomicDenominator': 398,
                            'oldOmittedGoals': 19, 'additionalHeldChild': GOAL,
                            'unresolvedOriginalSourceDecisions': 496,
                            'PSelection': 'intentionally_unselected', 'DScientificKEEP': 'retained_unmodified',
                            'noRouteEdgeCanResolveCourseHold': True},
    'sourceExtractionWrites': False, 'canonicalWrites': False, 'registryWrites': False,
    'operativeWrites': False, 'newStrictClosures': 0, 'strictNetGain': 0,
    'humanApproval': False, 'releaseOrDeployment': False,
})
print('PASS actual official C11/NTG primary programme research; course HOLD preserved')
print('FINDING', finding)
