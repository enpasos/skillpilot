# Apache-2.0. Candidate-only targeted FW6-008 continuation; no active writes.
from pathlib import Path
import copy, datetime, hashlib, json

ROOT = Path('/home/enpasos/projects/skillpilot')
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05'
OUT = BASE / 'biologie-ni-fw6-008-recombination-current-preservation-candidate-v1'
ROUTE = BASE / 'biologie-ni-current-source-integration-route-v1'
STAGE = BASE / 'biologie-q1-ni-consolidated-integration-candidate-v1/staged/ni-three-targeted-root-preparation-v1'
read = lambda p: json.loads(p.read_text())
sha = lambda p: 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
rel = lambda p: str(p.relative_to(ROOT))
write = lambda name, x: (OUT / name).write_text(json.dumps(x, ensure_ascii=False, indent=2) + '\n')
now = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z')
source_id = 'ni-biology-seki-kc2015-fw6-008-d14910ea'
stale_id = '0dd8380d-b542-5126-8d8e-f95d9ccded90'
key = 'ni-fw6-008-meiotic-recombination-companion-v1'
parent_id = 'b4176012-f93a-5dd2-84b3-edd6a9932367'
canonical_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
source_path = ROOT / 'curricula/DE/Gymnasium/input/NI/lower-secondary/source-extraction/DE_NI_BIOLOGIE_SEKI_KC2015.source-extraction.json'
mapping_path = ROOT / 'curricula/DE/Gymnasium/mapping/DE-NI/lower-secondary/ni_biology_lower_secondary_source_extraction_to_canonical_biology.m7-e3-recombination-20261001-v2.review.json'
live = read(canonical_path); goals = {g['id']: g for g in live['goals']}
active_source = read(source_path); source = read(ROUTE / 'versioned-replacements/ni.current-source.review-pending.json')
mapping = read(ROUTE / 'versioned-replacements/ni.current-mapping.review-pending.json')
current_mapping = read(mapping_path)
stage = read(STAGE / 'canonical.biologie.candidate.json'); stage_goals = {g['id']: g for g in stage['goals']}
source_by_id = {g['id']: g for g in source['sourceGoals']}
decision = next(d for d in mapping['decisions'] if d['sourceGoalId'] == source_id)
current_decision = next(d for d in current_mapping['decisions'] if d['sourceGoalId'] == source_id)
before_rows = [r for r in mapping['mappings'] if r['legacyGoalId'] == source_id]
assert before_rows == [r for r in current_mapping['mappings'] if r['legacyGoalId'] == source_id]
assert decision == current_decision
assert [r['canonicalGoalId'] for r in before_rows] == decision['canonicalGoalIds']
assert stale_id not in decision['canonicalGoalIds'] and 'noch offen' in decision['rationale']
template = read(OUT / 'companion.goal-template.candidate.json')
assert template['canonicalId'] is None and 'id' not in template['goalTemplateWithoutId']

cache_ids = [source_id, 'ni-biology-seki-kc2015-fw7-003-b3921cb7', 'ni-biology-seki-kc2015-fw7-012-8ed51e46']
cache_deltas = []
for i in cache_ids:
    g = source_by_id[i]
    operative = next(d for d in current_mapping['decisions'] if d['sourceGoalId'] == i)
    assert stale_id not in operative['canonicalGoalIds']
    cleaned = [j for j in g['metadata']['canonicalTargets'] if j != stale_id]
    assert set(cleaned) == set(operative['canonicalGoalIds'])
    cache_deltas.append({'sourceGoalId': i, 'field': '/metadata/canonicalTargets', 'before': g['metadata']['canonicalTargets'], 'afterCleanupOnly': cleaned, 'operativeV2Decision': operative, 'reason': 'Versioned advisory-cache alignment to the actual current-v2 removal; no new substantive verdict on this whole historical source group. Trisomy21 explains chromosome-number change, not the meiotic recombination witness sought by FW6-008.', 'historicalBytesUnchanged': True})
after_source = copy.deepcopy(source_by_id[source_id])
after_source.update({'title': template['sourceBinding']['sourceText'], 'description': 'Die lernende Person kann auf der Grundlage der Meiose die Prinzipien der Rekombination erläutern.', 'sourceText': template['sourceBinding']['sourceText'], 'sourceRef': 'Niedersachsen Kerncurriculum Naturwissenschaften Gymnasium Sekundarbereich I 2015, Biologie, FW 6.2 Fortpflanzung und Vererbung, zusätzlich am Ende von Jahrgangsstufe 10, S. 87.', 'sourceSpanText': 'FW 6.2 Fortpflanzung und Vererbung, Tabellenspalte zusätzlich Ende Jg. 10, S. 87, Source-Ziel ' + source_id})
after_source['sourceSpan']['label'] = 'FW 6.2 Fortpflanzung und Vererbung: ' + template['sourceBinding']['sourceText']
after_source['tags'] = [t for t in after_source['tags'] if not t.startswith('grades:')] + ['grades:9/10']
after_source['metadata'].update({'grades': '9/10', 'sourcePage': 87, 'sourceTableColumn': 'zusätzlich Ende Jg.10', 'sourceScopeRestriction': 'Cytological/chromosomal meiotic recombination principles; correct supplied models, no independent construction or molecular repair mechanism.', 'canonicalTargets': cache_deltas[0]['afterCleanupOnly']})
write('source-cell-and-three-cache.delta.candidates.json', {'status': 'candidate', 'reviewAuthority': 'ai_candidate', 'sourceBaseBinding': {'path': rel(ROUTE / 'versioned-replacements/ni.current-source.review-pending.json'), 'digest': sha(ROUTE / 'versioned-replacements/ni.current-source.review-pending.json')}, 'selectedPrimaryCell': {'sourceGoalId': source_id, 'before': source_by_id[source_id], 'afterWithoutUnadoptedTargetId': after_source, 'afterIdAdoptionAppendMetadataCanonicalTarget': {'candidateKey': key}, 'sourcePageActuallyViewed': 87}, 'advisoryCacheDeltas': cache_deltas, 'sourceRecordsChangedBeyondNI3': 3, 'fullRecordUnchangedCountAfterThisAndNI3': 115, 'semanticPrimaryCellCorrectionsBeyondNI3': 1, 'advisoryOnlyOtherSourceRecords': 2, 'historic118ClaimTreatment': 'Retain the immutable NI3 evidence as a dated historical observation. The next version must say115 fully unchanged source records, with an explicit three-record delta; do not silently reuse118 as a current unchanged count. 118 historical decisions remain intact until the exact FW6-008 decision is separately replaced, after which117 remain unchanged.', 'humanApproval': False, 'activeWrites': 0})

new_row = {'legacyGoalId': source_id, 'canonicalGoalIdFromCandidateKey': key, 'matchType': 'exact', 'reviewDecisionId': source_id}
after_decision = copy.deepcopy(decision)
after_decision.update({'sourceSpan': 'FW 6.2 Fortpflanzung und Vererbung, Tabellenspalte zusätzlich Ende Jg. 10, S. 87, Source-Ziel ' + source_id, 'canonicalGoalIds': decision['canonicalGoalIds'], 'rationale': 'INACTIVE CANDIDATE: once an independently reviewed current-ID companion explains independent chromosome assortment and corresponding non-sister chromatid-segment exchange using correctly supplied chromosome models, that companion supplies the explicit chromosomal meiotic recombination witness. Existing 1d2/ec88 rows remain partial procedural/context witnesses; no full recombination coverage is inferred from them. Trisomy 21 remains removed. Molecular mechanisms, independent model construction and full meiosis-phase recall are not required.', 'reviewer': 'OpenAI Codex targeted FW6-008 preservation candidate; exact model unexposed', 'reviewedAt': now, 'notes': 'Candidate rationale only. Append the root-adopted companion ID and bind final current review evidence before replacing the operative v2 decision. No human approval or active M3 completion.'})
write('mapping-fw6-008.delta.candidate.json', {'status': 'candidate', 'reviewAuthority': 'ai_candidate', 'operativeBeforeBinding': {'path': rel(mapping_path), 'digest': sha(mapping_path)}, 'ni3PreparedMappingBaseBinding': {'path': rel(ROUTE / 'versioned-replacements/ni.current-mapping.review-pending.json'), 'digest': sha(ROUTE / 'versioned-replacements/ni.current-mapping.review-pending.json')}, 'sourceGoalId': source_id, 'beforeRows': before_rows, 'preserveBeforeRowsExactly': True, 'appendRowTemplate': new_row, 'afterCanonicalGoalIdResolution': 'Set canonicalGoalId to the final root-adopted companion UUID and matchType exact only after independent source/current-description binding review. The template is not an operative mapping row.', 'beforeDecision': decision, 'afterDecisionWithoutUnadoptedTargetId': after_decision, 'appendCanonicalGoalIdFromCandidateKey': key, 'recordedFullCoverageStatusUntilFinalReview': 'HOLD', 'expectedRowsAfterNI3AndAppend': 335, 'sourceGroupsAfterNI3AndAppend': 123, 'unchangedHistoricalDecisionsAfterNI3AndThisReplacement': 117, 'all334NI3PreparedRowsPreserved': True, 'allOther122NI3PreparedDecisionsPreserved': True, 'humanApproval': False, 'activeWrites': 0})

assert goals[parent_id]['contains'] == stage_goals[parent_id]['contains'][:10]
write('parent-placement.before-after.candidate.json', {'status': 'candidate', 'reviewAuthority': 'ai_candidate', 'parentGoalId': parent_id, 'beforeActiveGoal': goals[parent_id], 'afterNI3PreparedGoal': stage_goals[parent_id], 'afterThisCompanionRule': {'appendContainsFromCandidateKey': key, 'preserveAll12NI3PreparedChildrenAndAllOtherFields': True, 'expectedAfterChildCount': 13, 'doNotRemoveCurrentAtomsOrReclassifyThemToShrinkDenominator': True}, 'niSourcePlacement': {'jurisdiction': 'DE-NI', 'stage': 'SekI', 'grades': '9/10', 'sourcePage': 87, 'tableColumn': 'zusätzlich am Ende von Jg.10', 'sourceViewPath': 'app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas/de-gym-biologie-bundesweit-source-de-ni-seki.view.json', 'appendDirectGoalEntryFromCandidateKey': key, 'newGoalBoundary': True, 'doNotInferCoverageFromBroadParent': True}, 'counts': {'currentCanonicalRecords': 441, 'currentCurricularAtomic': 363, 'afterNI3CanonicalRecords': 444, 'afterNI3CurricularAtomic': 366, 'afterNI3AndCompanionCanonicalRecords': 445, 'afterNI3AndCompanionCurricularAtomic': 367}, 'canonicalIdAdopted': False, 'humanApproval': False, 'activeWrites': 0})

old_freeze = BASE / 'biologie-ni-three-current-adoption-checks-a-v1/frozen-receipt.json'
assert sha(old_freeze) == 'sha256:af8e23d7d5e4316ebbc49e774e17afd8646c2a5cc01f6ee9776cc8b79915a425'
input_paths = [canonical_path, source_path, mapping_path, ROOT / 'curricula/DE/Gymnasium/mapping/DE-NI/lower-secondary/ni_biology_lower_secondary_source_extraction_to_canonical_biology.review.json', ROOT / 'curricula/DE/Gymnasium/input/NI/lower-secondary/kc_naturwissenschaften_gymnasium_sek_i_2015.pdf', ROOT / 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json', ROOT / 'app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas/de-gym-biologie-bundesweit-source-de-ni-seki.view.json', ROUTE / 'versioned-replacements/ni.current-source.review-pending.json', ROUTE / 'versioned-replacements/ni.current-mapping.review-pending.json', STAGE / 'canonical.biologie.candidate.json', old_freeze]
write('input-bindings-and-preservation.receipt.json', {'checkedAt': now, 'bindings': [{'path': rel(p), 'digest': sha(p), 'bytes': p.stat().st_size} for p in input_paths], 'activeCanonicalGoalBodiesUnchanged': True, 'previousNi3FrozenReceiptUnchanged': True, 'canonicalIdAdopted': False, 'activeWrites': 0, 'pContentsRead': False, 'humanApproval': False})
print('Prepared bounded FW6-008 candidate: ID unadopted; three explicit source deltas; 335 future rows and367 future atoms only after NI3 plus companion adoption.')
