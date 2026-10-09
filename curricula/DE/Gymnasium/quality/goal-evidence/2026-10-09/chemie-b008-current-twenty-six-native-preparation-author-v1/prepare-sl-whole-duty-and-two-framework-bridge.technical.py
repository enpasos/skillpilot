# SPDX-License-Identifier: Apache-2.0
"""Inactive operative SL source bridge. New mapping review metadata stays pending."""
from pathlib import Path
from datetime import datetime, timezone
from copy import deepcopy
import hashlib
import json
import re
import subprocess

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
OUT = OWN / 'source-sl-bridge-author'
CAP = ROOT / 'tmp/chemie-b008-current26-native-preparation-20261009-v1-capsule'
PRIOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08'
assert not (OUT / 'sl-whole-duty-and-two-framework-bridge.first.freeze.json').exists()

def read(path):
    return json.loads(path.read_text())

def bind(path):
    assert not path.is_symlink(), path
    raw = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}

def value_hash(value):
    # This is the actual original v12 codec, including default separators.
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True).encode()).hexdigest()

def write(path, value):
    assert path.is_relative_to(OUT)
    raw = (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        assert path.read_bytes() == raw, path
    else:
        path.write_bytes(raw)
    cap_path = CAP / path.relative_to(ROOT)
    cap_path.parent.mkdir(parents=True, exist_ok=True)
    cap_path.write_bytes(raw)
    return bind(path)

v21 = PRIOR / 'chemie-b008-sl-specific-source-continuation-author-root-20261008-v21'
framework = PRIOR / 'chemie-b008-sl-three-framework-bridge-author-root-20261008-v23'
paired_path = PRIOR / 'chemie-b008-paired-source-refinement-technical-root-20261008-v24/paired-genuine-source-verdicts.actual.json'
paired = read(paired_path)
accepted_ids = sorted(paired['SL2WholeUpperTargetSourceRolesAccepted'])
assert accepted_ids == ['36666b4a-97af-51fc-9983-56cdcc7a8229', 'ac8b6c0f-98b2-5092-806d-d9498efbfa35']
assert paired['SLWholeLowerTargetStillHOLD'] == '75e2eff1-f871-5461-9e3f-26d0b333ce2f'
verified_seals = []
for item in paired['verifiedOriginalFirstSeals']:
    if 'sl-three-framework' not in item['firstSeal']['path']:
        continue
    first = item['firstSeal']
    assert bind(ROOT / first['path']) == first
    seal = read(ROOT / first['path'])
    exact_outputs = []
    for key in ['outputs', 'payloads']:
        for output in seal.get(key, []):
            if not isinstance(output, dict) or not {'path', 'sha256'} <= output.keys():
                continue
            actual = bind(ROOT / output['path'])
            assert actual['sha256'] == output['sha256'].removeprefix('sha256:'), output['path']
            if 'bytes' in output:
                assert actual['bytes'] == output['bytes']
            exact_outputs.append(actual)
    verified_seals.append({'originalFirstSeal': first, 'actualImmutableOutputBindings': exact_outputs})
assert len(verified_seals) == 2

source_candidate = read(v21 / 'exact-sl-primary-course-components-and-three-view-proposals.author.json')
national = ROOT / source_candidate['immutableAll1646OriginalDuties']['path']
assert bind(national) == source_candidate['immutableAll1646OriginalDuties']
canon_path = OWN / 'candidate/canonical504-current26-resource-links.inactive.json'
canon = read(canon_path)
goal_by_id = {goal['id']: goal for goal in canon['goals']}
cache = {}
whole65 = []
for original in source_candidate['immutableOriginal65SLDuties']:
    ep = ROOT / original['sourceExtractionPath']
    mp = ROOT / original['mappingPath']
    cache.setdefault(str(ep), read(ep))
    cache.setdefault(str(mp), read(mp))
    extraction, mapping = cache[str(ep)], cache[str(mp)]
    goal = next(g for g in extraction['sourceGoals'] if g['id'] == original['sourceGoalId'])
    passage = next(p for p in extraction['passages'] if p['id'] == goal['passageId'])
    edge = next(e for e in mapping['mappings'] if e['legacyGoalId'] == goal['id'] and e['canonicalGoalId'] == original['familyGoalId'])
    decision = next(d for d in mapping['decisions'] if d['sourceGoalId'] == goal['id'])
    assert value_hash(goal) == original['wholeOriginalSourceGoalValueSha256']
    assert value_hash(passage) == original['wholeOriginalPassageValueSha256']
    assert value_hash(edge) == original['wholeOriginalMappingValueSha256']
    whole65.append({'originalDutyReference': original, 'wholeUnchangedSourceGoal': goal,
                    'wholeUnchangedPassage': passage, 'wholeUnchangedOriginalMapping': edge,
                    'wholeCurrentReviewedDecision': decision,
                    'wholeCurrentCanonicalPartners': [goal_by_id[i] for i in decision['canonicalGoalIds']],
                    'wholeOriginalDutyClosure': False})
assert len(whole65) == 65
original_maps = sorted({r['originalDutyReference']['mappingPath'] for r in whole65})
source_paths = sorted({r['originalDutyReference']['sourceExtractionPath'] for r in whole65})
write(OUT / 'sixty-five-whole-original-SL-duties-and-current-partners.exact-neutral-input.json', {
    'schemaVersion': 1, 'originalValueCodec': 'Python json.dumps(ensure_ascii=False, sort_keys=True), default separators; UTF-8',
    'originalWholeSLDutyOccurrences': 65, 'originalNational1646DutyInventory': bind(national),
    'all65SourceGoalPassageAndMappingValueHashesExact': True, 'wholeDutyOccurrences': whole65,
    'wholeCurrentMappingFiles': [bind(ROOT / p) for p in original_maps],
    'wholeCurrentExtractionFiles': [bind(ROOT / p) for p in source_paths],
    'allOriginalDecisionsAndMappingsPreserved': True, 'strictGain': 0, 'humanApproval': False})

pdf = ROOT / 'tmp/chemie-b008-sl-basis-primary-root-20261008-v1/KMK2020-Chemie-AHR.actual-official.pdf'
pdf_binding = bind(pdf)
assert pdf_binding['sha256'] == '303e6e3783a5d7a786b0327ff39177fcfb3bb4727b29ffdbb3c0371e653db9d6'
text = subprocess.run(['pdftotext', '-layout', str(pdf), '-'], check=True, text=True, capture_output=True).stdout
pages = text.split('\f')
def normalize(text):
    return ' '.join(re.sub(r'(?<=\w)-\s*\n\s*(?=\w)', '', text).split())
standards = {
    'K1': (17, 'recherchieren zu chemischen Sachverhalten zielgerichtet in analogen und digitalen Medien und wählen für ihre Zwecke passende Quellen aus;', 'ac8b6c0f-98b2-5092-806d-d9498efbfa35'),
    'K2': (18, 'wählen relevante und aussagekräftige Informationen und Daten zu chemischen Sachverhalten und anwendungsbezogenen Fragestellungen aus und erschließen Informationen aus Quellen mit verschiedenen, auch komplexen Darstellungsformen;', 'ac8b6c0f-98b2-5092-806d-d9498efbfa35'),
    'K3': (18, 'prüfen die Übereinstimmung verschiedener Quellen oder Darstellungsformen im Hinblick auf deren Aussagen;', '36666b4a-97af-51fc-9983-56cdcc7a8229'),
    'K4': (18, 'überprüfen die Vertrauenswürdigkeit verwendeter Quellen und Medien (z. B. anhand ihrer Herkunft und Qualität);', '36666b4a-97af-51fc-9983-56cdcc7a8229'),
    'K8': (18, 'strukturieren und interpretieren ausgewählte Informationen und leiten Schlussfolgerungen ab.', 'ac8b6c0f-98b2-5092-806d-d9498efbfa35'),
    'K12': (18, 'prüfen die Urheberschaft, belegen verwendete Quellen und kennzeichnen Zitate;', 'ac8b6c0f-98b2-5092-806d-d9498efbfa35'),
    'B2': (19, 'beurteilen die Inhalte verwendeter Quellen und Medien (z. B. anhand der fachlichen Richtigkeit und Vertrauenswürdigkeit);', '36666b4a-97af-51fc-9983-56cdcc7a8229'),
    'B3': (19, 'beurteilen Informationen und Daten hinsichtlich ihrer Angemessenheit, Grenzen und Tragweite;', '36666b4a-97af-51fc-9983-56cdcc7a8229'),
    'B4': (19, 'analysieren und beurteilen die Auswahl von Quellen und Darstellungsformen im Zusammenhang mit der Intention der Autorin/des Autors.', '36666b4a-97af-51fc-9983-56cdcc7a8229'),
}
local_pdf_path = 'curricula/DE/Gymnasium/input/KMK/2020_06_18-BildungsstandardsAHR_Chemie.pdf'
url = 'https://www.kmk.org/fileadmin/Dateien/veroeffentlichungen_beschluesse/2020/2020_06_18-BildungsstandardsAHR_Chemie.pdf'
document = {'key': 'KMK2020-Chemie-AHR', 'title': 'Bildungsstandards im Fach Chemie für die Allgemeine Hochschulreife, Beschluss vom 18.06.2020',
            'path': local_pdf_path, 'url': url, 'official': True, 'stage': 'SekII', 'courseLevel': 'GK_LK'}
goals, passages, decisions, mappings = [], [], [], []
for number, (locator, (physical_page, literal, target)) in enumerate(standards.items(), 1):
    assert literal in normalize(pages[physical_page - 1]), locator
    pid = 'sl-chemistry-ahr-framework:kmk2020:p%03d' % physical_page
    goal_id = 'sl-chem-ahr-framework-2020-' + locator.lower()
    source_goal = {'id': goal_id, 'passageId': pid, 'topicCode': locator, 'bulletIndex': number, 'aspectIndex': 1,
                   'title': locator + ': ' + literal[:80], 'description': 'Die Lernenden ' + literal,
                   'sourceText': literal, 'rawSourceText': literal, 'sourceSpan': 'KMK Chemie AHR 2020, %s, physische Seite %s, gedruckte Seite %s' % (locator, physical_page, physical_page - 1),
                   'parentBulletText': literal, 'sourceDocumentKey': document['key'], 'stage': 'SekII', 'courseLevel': 'GK_LK',
                   'tags': ['jurisdiction:DE-SL', 'stage:SekII', 'courseLevel:GK_LK', 'sourceDocument:' + document['key']],
                   'granularity': 'numbered-official-standard', 'extendedData': {
                       'sourceRole': 'actual KMK numbered standard; SL applicability is an explicit reviewed subject-framework bridge, not an invented SL content-table bullet',
                       'learningEndpoint': 'end of qualification/Hauptphase; not end of EP',
                       'subjectFrameworkBindingPath': str((framework / 'current-SL-subject-to-framework-binding.author.json').relative_to(ROOT))}}
    goals.append(source_goal)
    decisions.append({'sourceGoalId': goal_id, 'topicCode': locator, 'sourceSpan': source_goal['sourceSpan'],
                      'decision': 'mapped', 'canonicalGoalIds': [target],
                      'rationale': 'Operative author proposal from the exact numbered original standard and the already independently reviewed whole SL upper source role. The new source extraction/decision payload and current stage/course projection still require genuine operative review; no whole original source-duty union or practical learner performance is certified.',
                      'reviewer': None, 'reviewedAt': None, 'existingWholeRoleReviewEvidence': bind(paired_path),
                      'reviewStatus': 'pending_current_operative_source_projection_review'})
    mappings.append({'legacyGoalId': goal_id, 'canonicalGoalId': target, 'matchType': 'partial', 'reviewDecisionId': goal_id})
for physical_page in [17, 18, 19]:
    passages.append({'id': 'sl-chemistry-ahr-framework:kmk2020:p%03d' % physical_page,
                     'topicCode': 'KMK-AHR-CHEMIE-2020-P%03d' % physical_page,
                     'title': 'KMK Chemie AHR: ganze Prozesskompetenzpassage, physische Seite %s' % physical_page,
                     'text': pages[physical_page - 1], 'page': physical_page, 'sourcePath': local_pdf_path,
                     'sourceDocumentKey': document['key'], 'stage': 'SekII', 'courseLevel': 'GK_LK',
                     'sourceGoalIds': [g['id'] for g in goals if g['passageId'].endswith('p%03d' % physical_page)]})
extraction = {'schemaVersion': 1, 'extractionId': 'sl-chemistry-actual-ahr-framework-2020-current-operative-candidate',
              'title': 'SL Chemie Hauptphase: tatsächliche nummerierte AHR-Prozessstandards mit getrennt belegter Fachrahmenbindung',
              'sourceLandscapeId': 'DE_SL_CHEMISTRY_AHR_FRAMEWORK_2020_SOURCE', 'jurisdiction': 'DE-SL', 'subject': 'Chemie',
              'stage': 'SekII', 'sourceDocument': document, 'sourceDocuments': [document],
              'method': 'Actual retained official PDF bytes; exact numbered standard clauses verified against pdftotext -layout full pages; no canonical goal body used as a literal source clause.',
              'qualityReview': {'status': 'ai_candidate', 'humanApproval': False, 'operativeProjectionIndependentReview': 'pending'},
              'pipelineStatus': 'author_candidate', 'passages': passages, 'sourceGoals': goals}
extraction_path = OUT / 'SL-upper-actual-numbered-KMK-standards.source-extraction.author-candidate.json'
write(extraction_path, extraction)
mapping = {'version': '1.0', 'reviewId': 'sl-two-upper-source-framework-operative-author-candidate-20261009-v1',
           'sourceLandscapeId': extraction['sourceLandscapeId'], 'targetLandscapeId': canon['landscapeId'],
           'sourceExtractionPath': str(extraction_path.relative_to(ROOT)), 'status': 'needs_current_operative_review',
           'mappings': mappings, 'decisions': decisions}
mapping_path = OUT / 'SL-upper-numbered-framework-to-two-routines.mapping.author-candidate.json'
write(mapping_path, mapping)
cap_pdf = CAP / local_pdf_path
cap_pdf.parent.mkdir(parents=True, exist_ok=True)
cap_pdf.write_bytes(pdf.read_bytes())
write(OUT / 'actual-original-primary-pages-and-paired-whole-source-role.input.json', {
    'schemaVersion': 1, 'actualKMKOfficialPDF': pdf_binding, 'portableSourceSnapshot': {'path': local_pdf_path, 'url': url, 'sha256': 'sha256:' + pdf_binding['sha256']},
    'wholeActualOriginalPageTexts': [{'physicalPage1Based': p, 'printedPage': p - 1, 'wholePageText': pages[p - 1],
                                    'wholePageTextSha256': hashlib.sha256(pages[p - 1].encode()).hexdigest()} for p in [12, 14, 17, 18, 19]],
    'actualSLGK_LKSubjectFrameworkBinding': bind(framework / 'current-SL-subject-to-framework-binding.author.json'),
    'genuinePairedWholeTwoSourceRoles': [r for r in paired['pairedSL3WholeCurrentTargets'] if r['goalId'] in accepted_ids],
    'actualOriginalIndependentFirstSeals': verified_seals, 'noNewScientificReviewInvented': True,
    'wholeLowerGoalStillHold': paired['SLWholeLowerTargetStillHOLD'], 'wholeNational1646AndSL65Closure': False,
    'newSourcePayloadAndNormalPlacementReview': 'pending', 'nativeContextReview': 'pending', 'humanApproval': False})
config = read(OWN / 'source-atlas/current504-genuine-paired-source.normal-probe.inputs.json')
config['mappingPaths'] = [p for p in config['mappingPaths'] if p not in [str((v21 / ('candidate-source-mappings/' + stage + '.source-mapping.author-candidate.json')).relative_to(ROOT)) for stage in ['SekI', 'SekII']]]
config['mappingPaths'].extend(original_maps)
config['mappingPaths'].append(str(mapping_path.relative_to(ROOT)))
config['sourceDocumentSnapshots'].append({'path': local_pdf_path, 'url': url, 'sha256': 'sha256:' + pdf_binding['sha256']})
config['outputDirectory'] = 'app/scripts/config/goal-books/inactive/chemie-b008-source-sl-bridge-author-20261009-v1'
config['manifestPath'] = config['outputDirectory'] + '/source-scopes.manifest.json'
config['navigationViewPath'] = config['outputDirectory'] + '/national-navigation.view.json'
write(OUT / 'whole395-with-existing32-mappings-and-newSLbridge.normal-probe.author-candidate.json', config)
write(OUT / 'exact-current-whole-role-and-original-union.guards.json', {
    'schemaVersion': 1, 'candidateCanonical': bind(canon_path), 'newSourceGoalCount': 9, 'newRoleTargetCount': 2,
    'newMappedRelations': 9, 'allOriginalSLDecisionRowsAndMappingEdgesUnchanged': True,
    'originalFullMappingInputs': [bind(ROOT / p) for p in original_maps], 'old65SourceAndPassageAndMappingValueHashesExact': True,
    'existingWholeRolePairReusedAsEvidenceNotNewPayloadApproval': True, 'newReviewer': None, 'newReviewedAt': None,
    'actualUnresolvedPendingSourcePayloads': 9, 'lower75WholeRole': 'HOLD',
    'remainingOpaqueNodes': 7, 'remainingOpaqueViews': 6, 'protectedCurrent177SubstantiveContextsHeld': 8,
    'sourceNoPracticalLearnerPerformanceCertified': True, 'currentAtomics': 378, 'prospectiveInactiveAtomics': 395,
    'strictGain': 0, 'activeWrites': [], 'humanApproval': False})
print(json.dumps({'whole65ValueHashesExact': True, 'originalSLDecisionMutations': 0,
                  'newNumberedOriginalStandards': 9, 'newUpperWholeRoleTargets': accepted_ids,
                  'operativeIndependentReviewPending': True, 'native2DeferredUntilActualContextAdoption': True,
                  'activeWrites': 0, 'strictGain': 0}))
