# Apache-2.0. Targeted source candidates; operative inputs remain unchanged.
import copy
import hashlib
import json
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
PREV = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-six-current-source-hold-remediation-candidate-v1'
GEL = '8eb86a82-122d-5cae-8f80-bb2850b29c2f'
PCR = 'a3f483ce-126e-595c-999c-aa4d95106221'
HE_SOURCE = 'b5e1cdfd-34ff-4c05-976c-ee69ec041fdb'
BY_SOURCE = '43240b1a-10e4-5c51-ad89-92dbed53d3f1'
NOW = datetime.now(timezone.utc).isoformat()

def read(path):
    return json.loads((ROOT / path).read_text())

def write(path, value):
    target = ROOT / path
    assert not target.exists(), target
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def digest(path):
    return 'sha256:' + hashlib.sha256((ROOT / path).read_bytes()).hexdigest()

source_delta = next(x for x in json.loads((PREV / 'he-six-source-extraction-deltas.candidates.json').read_text())['deltas'] if x['sourceGoalId'] == HE_SOURCE)
old_extraction = 'curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_BIOLOGIE_SEKII_KC2024.source-extraction.json'
new_extraction = 'curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_BIOLOGIE_SEKII_KC2024.m7-q1-gel-current-20261005-v1.source-extraction.json'
extraction = read(old_extraction)
rows = extraction['sourceGoals']
index = next(i for i,x in enumerate(rows) if x['id'] == HE_SOURCE)
assert rows[index] == source_delta['before']
rows[index] = copy.deepcopy(source_delta['after'])
assert len(rows) == 150
write(new_extraction, extraction)

old_he = 'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_biology_upper_secondary_source_extraction_to_canonical_biology.m7-q1-tests-therapy-current-20261004-v1.review.json'
new_he = 'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_biology_upper_secondary_source_extraction_to_canonical_biology.m7-q1-gel-current-20261005-v1.review.json'
he = read(old_he)
he['reviewId'] = Path(new_he).name.removesuffix('.json')
he['sourceExtractionPath'] = new_extraction
mapping = next(x for x in he['mappings'] if x['legacyGoalId'] == HE_SOURCE)
assert mapping['canonicalGoalId'] == GEL and mapping['matchType'] == 'exact'
mapping['matchType'] = 'partial'
he['mappings'].append(dict(legacyGoalId=HE_SOURCE, canonicalGoalId=PCR, matchType='partial', reviewDecisionId=HE_SOURCE))
decision = next(x for x in he['decisions'] if x['sourceGoalId'] == HE_SOURCE)
decision.update(canonicalGoalIds=[GEL, PCR], matchType='partial', reviewer='Codex source candidate author', reviewedAt=NOW,
    rationale='Gezielt gelesener amtlicher HE-Q1.2-Punkt, gedruckte S.39: PCR und Gelelektrophorese. Zwei partielle Komponenten: bestehendes PCR-Ziel a3f bleibt mit eigener unveränderter Zuordnung erhalten; Gel8eb erklärt Trennung und gegebenes Marker-Bandenmuster. Das Entfernen von PCR als universeller Gel-Voraussetzung löscht keine PCR-Kompetenz und behauptet keine praktische Durchführung oder neue PCR-Freigabe. Andere Entscheidungen werden unverändert übernommen. Diese neue Zuordnung ist bis zur unabhängigen Prüfung und operativen Integration inaktiv.')
he['summary']['exactMappings'] -= 1
he['summary']['partialMappings'] += 2
write(new_he, he)

old_by = 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_biology_source_extraction_to_canonical_biology.review.json'
new_by = 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_biology_source_extraction_to_canonical_biology.m7-q1-gel-current-20261005-v1.review.json'
by = read(old_by)
by['reviewId'] = Path(new_by).name.removesuffix('.json')
by_candidate = next(x for x in json.loads((PREV / 'by-three-new-partial-source-bindings.candidates.json').read_text())['deltas'] if x['sourceGoalId'] == BY_SOURCE)
by['mappings'].append(copy.deepcopy(by_candidate['candidateMapping']))
decision = next(x for x in by['decisions'] if x['sourceGoalId'] == BY_SOURCE)
assert decision['canonicalGoalIds'] == ['2ef8b0c2-8ba3-54b7-99ff-8c743a4efa63']
old_rationale = decision['rationale']
decision['canonicalGoalIds'].append(GEL)
decision.update(reviewer='Codex source candidate author', reviewedAt=NOW,
    rationale=old_rationale + ' Gezielte ergänzende partielle Methodenbindung8eb: Die amtlichen GA/EA-Inhalte B12 2.6 nennen Gelelektrophorese ausdrücklich. Vorliegendes Gel-/Marker-Auswerten ist nur eine Methodenkomponente; medizinisch-gesellschaftliche Bedeutung, Ethik, genetischer Fingerabdruck und Sequenzierung werden damit nicht abgeschlossen. Die bestehende ganze Zielzuordnung2ef bleibt als übernommener Bestandsentscheid unverändert; keine erneute Freigabe ihrer fachlichen Qualität. Die neue Teilbindung ist bis zur unabhängigen Prüfung und operativen Integration inaktiv.')
by['summary']['partialMappings'] += 1
write(new_by, by)

atlas_path = 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
atlas = read(atlas_path)
assert old_he in atlas['mappingPaths'] and old_by in atlas['mappingPaths']
atlas['mappingPaths'] = [new_he if x == old_he else new_by if x == old_by else x for x in atlas['mappingPaths']]
write(str(OWN.relative_to(ROOT) / 'source-atlas-inputs.prospective.json'), atlas)

for old,new,sid in [(old_extraction,new_extraction,HE_SOURCE),(old_he,new_he,HE_SOURCE),(old_by,new_by,BY_SOURCE)]:
    before,after = read(old),read(new)
    key = 'sourceGoals' if old == old_extraction else 'decisions'
    id_key = 'id' if key == 'sourceGoals' else 'sourceGoalId'
    assert [x for x in before[key] if x[id_key] != sid] == [x for x in after[key] if x[id_key] != sid]
    if key == 'decisions':
        assert [x for x in before['mappings'] if x['legacyGoalId'] != sid] == [x for x in after['mappings'] if x['legacyGoalId'] != sid]

write(str(OWN.relative_to(ROOT) / 'source-candidate.actual.receipt.json'), {
    'status':'inactive_author_candidate', 'humanApprovalClaimed':False, 'strictNetGain':0,
    'officialHePrintedPage':39, 'officialHeClause':'PCR und Gelelektrophorese',
    'byOfficialSection':'B12 2.6', 'byMethodIsPartial':True,
    'currentTargetId':GEL, 'preservedPCRId':PCR, 'preservedBYAnalyticsId':'2ef8b0c2-8ba3-54b7-99ff-8c743a4efa63',
    'oldUnaffectedRowsUnchanged':True,
    'inputs':[{'path':p,'sha256':digest(p)} for p in [old_extraction,old_he,old_by,atlas_path]],
    'candidateOutputs':[{'path':p,'sha256':digest(p)} for p in [new_extraction,new_he,new_by]],
    'operativePathsUnchanged':True, 'independentSourceAndFinalBookReviewsPending':True,
})
print('Prepared one HE source-row delta, two HE component mappings, one BY partial mapping; all unrelated rows preserved. Operative inputs unchanged.')
