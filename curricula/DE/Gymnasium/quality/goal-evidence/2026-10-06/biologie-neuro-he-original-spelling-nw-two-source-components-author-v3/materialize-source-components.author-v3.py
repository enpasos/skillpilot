import copy
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from uuid import NAMESPACE_URL, uuid5

base = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q2-neurobiology-twenty-one-source-p-author-remediation-v2')
out = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-neuro-he-original-spelling-nw-two-source-components-author-v3')
out.mkdir(exist_ok=True)
now = datetime.now(timezone.utc).isoformat()


def read(path):
    return json.loads(Path(path).read_text())


def bind(path):
    path = Path(path)
    return {'path': path.as_posix(), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'bytes': path.stat().st_size}


def put(name, value):
    path = out / name
    assert not path.exists(), path
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return path


old_he_path = base / 'source-candidates/extraction-02.author-v2.candidate.json'
old_he = read(old_he_path)
he = copy.deepcopy(old_he)
he_goal_id = 'bfd043fc-7eb7-5ff5-90ab-e2d978d21aa0'
raw = 'neurophysiogische Verfahren (Prinzip: ein bildgebendes Verfahren der Hirnforschung)'
normalized = 'neurophysiologische Verfahren (Prinzip: ein bildgebendes Verfahren der Hirnforschung)'
goal = next(g for g in he['sourceGoals'] if g['id'] == he_goal_id)
assert goal['rawSourceText'] == normalized
for field in ['sourceText', 'rawSourceText', 'parentBulletText', 'rawParentBulletText']:
    goal[field] = raw
goal['editorialNormalization'] = {
    'kind': 'declared spelling correction; not original source wording',
    'originalSpelling': 'neurophysiogische',
    'normalizedSpelling': 'neurophysiologische',
    'titleAndDescriptionAreEditorial': True,
    'sourceMeaningOrCoverageChanged': False,
}
component = next(c for c in he['originalQ23Components'] if c['localEditorialKey'] == 'LK7')
assert component['officialOriginalBulletText'] == normalized
component['officialOriginalBulletText'] = raw
component['editorialNormalizedLabel'] = normalized
he_path = put('HE.LK7.exact-original-and-declared-normalization.author-v3.candidate.json', he)

nw_original = Path('curricula/DE/Gymnasium/input/NW/lower-secondary/source-extraction/DE_NW_BIOLOGIE_SEKI_KLP2019.source-extraction.json')
nw = read(nw_original)
canonical_path = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
canonical = read(canonical_path)
by_id = {g['id']: g for g in canonical['goals']}
protected_ids = ['5b2571d9-f079-52b2-b21b-8f389c7409f4', '49dbe8fa-7c4a-5ef5-9cd7-a40b60bf88dd']
original_row_id = 'nw-biology-seki-klp-2019-if7-10-hormonelle-regulation-immunbiologie-und-neurobiologie-erklaren'
original_whole = next(g for g in nw['sourceGoals'] if g['id'] == original_row_id)
official_bullet = 'den Bau und die Vermehrung von Bakterien und Viren beschreiben (UF1),'
full_text = Path('tmp/neuro-v3-NW-primary-layout-20261006.txt').read_text()
assert official_bullet in full_text
source_document = copy.deepcopy(nw['sourceDocument'])
passage_id = 'nw-bio-seki:IF7:UF1:bacteria-viruses-original-bullet'
source_goals = []
specs = [
    ('bacterial-structure', 'Bau von Bakterien beschreiben', 'Die lernende Person kann den Bau von Bakterien beschreiben.',
     'bacterial structure only', '5b2571d9-f079-52b2-b21b-8f389c7409f4',
     'The existing canonical bacterial-structure goal contributes the prokaryotic scheme and genetic-information location to the bacterial-structure aspect. Its additional plasmid/model wording is canonical operationalisation, not claimed literal compulsory NRW wording.'),
    ('bacterial-reproduction', 'Vermehrung von Bakterien beschreiben', 'Die lernende Person kann die Vermehrung von Bakterien beschreiben.',
     'bacterial reproduction only', '49dbe8fa-7c4a-5ef5-9cd7-a40b60bf88dd',
     'The existing canonical binary-fission model contributes to the bacterial-reproduction aspect. Its DNA-tracing detail is canonical operationalisation, not claimed literal compulsory NRW wording.'),
]
relations = []
for local_key, title, description, component_scope, target, rationale in specs:
    source_id = str(uuid5(NAMESPACE_URL, 'https://skillpilot.com/source/nw/biologie/klp2019/IF7/UF1/bacteria-viruses/' + local_key))
    source_goals.append({
        'id': source_id, 'passageId': passage_id, 'topicCode': 'IF7', 'title': title,
        'description': description, 'sourceText': official_bullet, 'rawSourceText': official_bullet,
        'parentBulletText': official_bullet, 'rawParentBulletText': official_bullet,
        'sourceSpan': 'IF7.UF1.bacteria-viruses.' + local_key,
        'rawSourceSpan': 'printed p35: IF7 Umgang mit Fachwissen, original bacterial/viral structure-reproduction bullet',
        'sourceRef': 'NRW KLP Biologie Gymnasium Sek I 2019, printed/physical p35; explicitly authored component of the original UF1 bullet',
        'sourceDocumentKey': source_document['key'], 'printedPage': 35, 'physicalPage': 35,
        'stage': 'SekI', 'courseLevel': 'unspecified',
        'granularity': 'officialCompetencyAspect', 'isOfficialBullet': False,
        'officialNumberingClaim': False, 'componentScope': component_scope,
        'authorOperationalisation': True, 'wholeOriginalBulletCoverage': False,
        'originalSourceSummaryGoalId': original_row_id,
        'tags': ['jurisdiction:DE-NW', 'stage:SekI', 'topic:IF7', 'component-only'],
    })
    relations.append({
        'sourceGoalId': source_id, 'topicCode': 'IF7', 'sourceSpan': 'IF7.UF1.bacteria-viruses.' + local_key,
        'decision': 'mapped', 'canonicalGoalIds': [target], 'matchType': 'partial',
        'rationale': 'AUTHOR CANDIDATE ONLY: ' + rationale + ' Neither viral structure/reproduction nor the broad original IF7 summary is declared complete.',
        'reviewer': 'codex-neuro-source-component-author-v3-not-independent-reviewer',
        'reviewedAt': now, 'wholeOriginalSourceCoverage': False, 'independentReviewStatus': 'pending',
    })
extraction = {
    'schemaVersion': 1, 'sourceLandscapeId': nw['sourceLandscapeId'],
    'extractionId': 'nw-biology-seki-2019-two-bacterial-source-components-author-v3',
    'title': 'NRW Biology IF7: two explicit bacterial component author candidates',
    'jurisdiction': 'DE-NW', 'subject': 'Biologie', 'schoolType': 'Gymnasium', 'stage': 'SekI',
    'sourceDocument': source_document, 'sourceDocuments': [source_document],
    'passages': [{'id': passage_id, 'topicCode': 'IF7', 'stage': 'SekI', 'sourceDocumentKey': source_document['key'],
                  'sourceText': official_bullet, 'rawSourceText': official_bullet,
                  'printedPage': 35, 'physicalPage': 35}],
    'sourceGoals': source_goals,
    'method': 'Author-scoped decomposition of one actual original UF1 bullet; full original wording preserved. The two separately reviewed canonical products support only the bacterial components. No invented official bullet or numbering.',
    'retainedOriginalSourceObligations': {
        'wholeOriginalBullet': official_bullet, 'originalWholeIF7Summary': original_whole,
        'viralStructureAndReproduction': 'pending component review outside these two bacterial contributions',
        'wholeIF7HoldRetained': True, 'wholeOriginalBulletCoverage': False,
    },
    'qualityReview': {'status': 'author_candidate_awaiting_two_independent_reviews', 'wholeNationalClearance': False,
                      'humanApproval': False, 'humanTrial': False},
}
nw_path = put('NW.two-bacterial-source-components.author-v3.candidate.json', extraction)
prospective_extraction = 'curricula/DE/Gymnasium/input/NW/lower-secondary/source-extraction/DE_NW_BIOLOGIE_SEKI_KLP2019.two-bacterial-components.author-v3.source-extraction.json'
prospective_mapping = 'curricula/DE/Gymnasium/mapping/DE-NW/lower-secondary/nrw_biology_lower_secondary_two_bacterial_components.author-v3.review.json'
mapping = {
    'schemaVersion': 1, 'sourceLandscapeId': nw['sourceLandscapeId'], 'targetLandscapeId': canonical['landscapeId'],
    'jurisdiction': 'DE-NW', 'subject': 'Biologie', 'sourceExtractionPath': prospective_extraction,
    'reviewStatus': 'author_candidate_awaiting_two_independent_reviews', 'reviewedAt': now,
    'mappings': [{'legacyGoalId': r['sourceGoalId'], 'canonicalGoalId': r['canonicalGoalIds'][0],
                  'matchType': 'partial', 'reviewDecisionId': r['sourceGoalId']} for r in relations],
    'decisions': relations, 'wholeOriginalSourceCoverage': False, 'originalWholeIF7HoldRetained': True,
    'humanApproval': False, 'humanTrial': False,
}
mapping_path = put('NW.two-bacterial-component-mappings.author-v3.candidate.json', mapping)
inputs = [old_he_path, nw_original, canonical_path,
          Path('curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-biologie.pdf'),
          Path(source_document['path']), base / 'source-candidates/mapping-07.author-v2.candidate.json',
          base / 'author-neurobiology21-source-p-v2.with-exact-rp-raw-source.final.freeze.json']
put('actual-author-delta-and-inputs.json', {
    'schemaVersion': 1, 'createdAtUTC': now, 'kind': 'targeted author source corrections; not independent approval',
    'inputBindings': [bind(p) for p in inputs],
    'HEGoalIdUnchanged': he_goal_id,
    'HEOtherWholeSourceGoalsExact': all(a == b for a, b in zip(old_he['sourceGoals'], he['sourceGoals']) if a['id'] != he_goal_id),
    'HEChangedFields': ['sourceGoal/sourceText', 'sourceGoal/rawSourceText', 'sourceGoal/parentBulletText',
                        'sourceGoal/rawParentBulletText', 'sourceGoal/editorialNormalization',
                        'originalQ23Components/LK7/officialOriginalBulletText', 'originalQ23Components/LK7/editorialNormalizedLabel'],
    'HEOriginalSpelling': 'neurophysiogische', 'HEEditorialNormalizedSpelling': 'neurophysiologische',
    'HERawPrimaryPersonallyRead': True, 'HEPrimaryPrintedPhysicalPage': 43,
    'NWPrimaryPrintedPhysicalPage': 35, 'NWActualPDFTextAndRenderedPagePersonallyRead': True,
    'NWProposedNewSourceRecordCount': 2, 'NWProposedMappingTargets': protected_ids,
    'NWOriginalExtractionAndWholeHoldMappingUnchanged': True,
    'NWProspectiveExtractionPath': prospective_extraction, 'NWProspectiveMappingPath': prospective_mapping,
    'NWProtectedCanonicalWholeGoals': [by_id[g] for g in protected_ids],
    'sourceCanonicalCoverageDistinction': 'Only bacterial components; literal viral duties and original IF7 whole-source hold remain open.',
    'nativeViewRegeneration': 'pending targeted experiment',
    'activeWrites': False, 'strictCompletionsAdded': 0, 'restoredCurrentBindings': 0,
    'humanApproval': False, 'humanTrial': False,
})
print(json.dumps({'out': out.as_posix(), 'authoredFiles': 4, 'sourceIds': [g['id'] for g in source_goals],
                  'activeWrites': False, 'strictGain': 0}))
