# Apache-2.0. Inactive split revision after known A; writes only this folder.
from pathlib import Path
import copy, datetime, hashlib, json

ROOT = Path('/home/enpasos/projects/skillpilot')
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05'
OUT = BASE / 'biologie-ni-fw6-008-two-atomic-companions-candidate-v2'
ROUTE = BASE / 'biologie-ni-current-source-integration-route-v1'
STAGE = BASE / 'biologie-q1-ni-consolidated-integration-candidate-v1/staged/ni-three-targeted-root-preparation-v1'
read = lambda p: json.loads(p.read_text())
sha = lambda p: 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
rel = lambda p: str(p.relative_to(ROOT))
now = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z')
source_id = 'ni-biology-seki-kc2015-fw6-008-d14910ea'
source_landscape = '0b27a054-e81e-5423-aa71-d3d8d9d8f0db'
canonical_landscape = '08a43a1b-d97e-522c-9dfa-c950a493364e'
parent_id = 'b4176012-f93a-5dd2-84b3-edd6a9932367'
stale_id = '0dd8380d-b542-5126-8d8e-f95d9ccded90'

def write(name, payload):
    value = {'status': 'candidate', 'reviewAuthority': 'ai_candidate', 'authorshipMode': 'revision_after_known_A; not an independent second review', 'sourceLandscapeId': source_landscape, 'canonicalLandscapeId': canonical_landscape, 'humanApproval': False, 'activeWrites': 0, **payload}
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

templates = read(OUT / 'two-companions.goal-templates.candidate.json')
keys = [g['candidateKey'] for g in templates['goals']]
assert len(keys) == len(set(keys)) == 2
assert all(g['canonicalId'] is None and 'id' not in g['goalTemplateWithoutId'] for g in templates['goals'])
source_path = ROUTE / 'versioned-replacements/ni.current-source.review-pending.json'
mapping_path = ROUTE / 'versioned-replacements/ni.current-mapping.review-pending.json'
source, mapping = read(source_path), read(mapping_path)
sg = {g['id']: g for g in source['sourceGoals']}
canonical_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
live = read(canonical_path); before_goals = {g['id']: g for g in live['goals']}
staged = read(STAGE / 'canonical.biologie.candidate.json'); staged_goals = {g['id']: g for g in staged['goals']}
v2_path = ROOT / 'curricula/DE/Gymnasium/mapping/DE-NI/lower-secondary/ni_biology_lower_secondary_source_extraction_to_canonical_biology.m7-e3-recombination-20261001-v2.review.json'
v2 = read(v2_path)
before_rows = [r for r in mapping['mappings'] if r['legacyGoalId'] == source_id]
before_decision = next(d for d in mapping['decisions'] if d['sourceGoalId'] == source_id)
assert before_rows == [r for r in v2['mappings'] if r['legacyGoalId'] == source_id]
assert before_decision == next(d for d in v2['decisions'] if d['sourceGoalId'] == source_id)
assert len(before_rows) == 2 and all(r['matchType'] == 'partial' for r in before_rows)

cache_ids = [source_id, 'ni-biology-seki-kc2015-fw7-003-b3921cb7', 'ni-biology-seki-kc2015-fw7-012-8ed51e46']
cache_deltas = []
for i in cache_ids:
    operative = next(d for d in v2['decisions'] if d['sourceGoalId'] == i)
    cleaned = [j for j in sg[i]['metadata']['canonicalTargets'] if j != stale_id]
    assert stale_id not in operative['canonicalGoalIds'] and set(cleaned) == set(operative['canonicalGoalIds'])
    cache_deltas.append({'sourceGoalId': i, 'field': '/metadata/canonicalTargets', 'before': sg[i]['metadata']['canonicalTargets'], 'afterCleanupOnly': cleaned, 'actualOperativeV2Targets': operative['canonicalGoalIds'], 'meaning': 'Explicit advisory cache alignment to already-operative v2 removal. No new global source review or historical approval relabeling.'})

after_source = copy.deepcopy(sg[source_id])
after_source.update({'title': templates['sourceBinding']['sourceText'], 'description': 'Die lernende Person kann auf der Grundlage der Meiose die Prinzipien der Rekombination erläutern.', 'sourceText': templates['sourceBinding']['sourceText'], 'sourceRef': 'Niedersachsen Kerncurriculum Naturwissenschaften Gymnasium Sekundarbereich I 2015, Biologie, FW 6.2 Fortpflanzung und Vererbung, zusätzlich am Ende von Jahrgangsstufe 10, S. 87.', 'sourceSpanText': 'FW 6.2 Fortpflanzung und Vererbung, Tabellenspalte zusätzlich Ende Jg. 10, S. 87, Source-Ziel ' + source_id})
after_source['sourceSpan']['label'] = 'FW 6.2 Fortpflanzung und Vererbung: ' + templates['sourceBinding']['sourceText']
after_source['tags'] = [t for t in after_source['tags'] if not t.startswith('grades:')] + ['grades:9/10']
after_source['metadata'].update({'grades': '9/10', 'sourcePage': 87, 'sourceTableColumn': 'zusätzlich Ende Jg.10', 'sourceScopeRestriction': 'Two distinct chromosomal recombination principles, jointly covered by two separate ordinary-content goals using correct supplied models. No independent construction or molecular repair mechanism.', 'canonicalTargets': cache_deltas[0]['afterCleanupOnly']})
write('source-cell-and-three-cache.delta.candidates.json', {'sourceBaseBinding': {'path': rel(source_path), 'digest': sha(source_path)}, 'selectedPrimaryCell': {'sourceGoalId': source_id, 'before': sg[source_id], 'afterWithoutUnadoptedTargetIds': after_source, 'appendCanonicalTargetsFromCandidateKeys': keys}, 'advisoryCacheDeltas': cache_deltas, 'additionalChangedSourceRecordsBeyondNI3': 3, 'additionalPrimaryCellCorrectionBeyondNI3': 1, 'additionalAdvisoryOnlyRecords': 2, 'fullRecordUnchangedCountAfterNI3AndThisRevision': 115, 'historical118Claim': 'Keep the old frozen118 observation as dated history. New revision states115 complete source records unchanged and explicitly binds the three further records changed; historical approval claims are not rewritten.'})

append_rows = [{'legacyGoalId': source_id, 'canonicalGoalIdFromCandidateKey': k, 'matchType': 'partial', 'reviewDecisionId': source_id} for k in keys]
after_decision = copy.deepcopy(before_decision)
after_decision.update({'sourceSpan': after_source['sourceSpanText'], 'rationale': 'INACTIVE SPLIT REVISION AFTER KNOWN A: Independent assortment of whole chromosomes and exchange of corresponding non-sister chromatid segments are separately assessable causal mechanisms. The two root-ID-adopted, independently current-reviewed leaves can jointly supply the FW6-008 recombination-principles witness. Each companion row remains partial; neither leaf alone covers the whole clause. Existing 1d2/ec88 rows remain unchanged partial context/procedural components. Trisomy21 remains removed. No molecular mechanism, independent model construction, whole meiosis phase routine or formula quota is required.', 'reviewer': 'OpenAI Codex author revision after known independent A; model unexposed', 'reviewedAt': now, 'notes': 'No active coverage completion. Append both actual adopted UUIDs only after final independent source/D and actual given-model bindings; keep existing target IDs and all other decisions unchanged.'})
future_rows = len(mapping['mappings']) + len(append_rows)
assert future_rows == 336
write('mapping-fw6-008.delta.candidate.json', {'operativeBeforeBinding': {'path': rel(v2_path), 'digest': sha(v2_path)}, 'ni3PreparedBaseBinding': {'path': rel(mapping_path), 'digest': sha(mapping_path)}, 'sourceGoalId': source_id, 'beforeRows': before_rows, 'preserveBeforeRowsExactly': True, 'appendRowTemplates': append_rows, 'beforeDecision': before_decision, 'afterDecisionWithoutUnadoptedTargetIds': after_decision, 'appendCanonicalGoalIdsFromCandidateKeys': keys, 'jointCoverageRule': 'Both new partial rows jointly operationalize the source principles clause; never mark either one as full/exact clause coverage.', 'coverageStatusUntilFinalIdentityAndIndependentReview': 'HOLD', 'ni3PreparedRows': len(mapping['mappings']), 'appendRows': len(append_rows), 'futureRowsAfterNI3AndSplit': future_rows, 'futureDecidedSourceGroups': len(mapping['decisions']), 'all334NI3PreparedRowsPreserved': True, 'allOther122NI3PreparedDecisionsPreserved': True, 'historicalV2DecisionsUnchangedAfterNI3AndTargetedReplacement': 117})

assert before_goals[parent_id]['contains'] == staged_goals[parent_id]['contains'][:10]
ledger = read(ROOT / 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json')
current_atoms = [d['goalId'] for d in ledger['decisions'] if d['semanticKind'] == 'curricularAtomic']
assert len(current_atoms) == 363 and all(before_goals[i] == staged_goals[i] for i in current_atoms)
ni3_new = set(staged_goals) - set(before_goals)
assert len(ni3_new) == 3
future_atoms = len(current_atoms) + len(ni3_new) + len(keys)
future_records = len(staged_goals) + len(keys)
assert future_atoms == 368 and future_records == 446
write('parent-placement.before-after.candidate.json', {'parentGoalId': parent_id, 'beforeActiveGoal': before_goals[parent_id], 'afterNI3PreparedGoal': staged_goals[parent_id], 'afterSplitRule': {'appendContainsFromCandidateKeys': keys, 'expectedChildren': 14, 'all12NI3PreparedChildrenAndAllOtherFieldsPreserved': True}, 'newClusterIntroduced': False, 'niPlacement': {'jurisdiction': 'DE-NI', 'stage': 'SekI', 'grades': '9/10', 'tableColumn': 'zusätzlich am Ende von Jg.10', 'sourcePage': 87, 'sourceViewPath': 'app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas/de-gym-biologie-bundesweit-source-de-ni-seki.view.json', 'appendDirectGoalEntriesFromCandidateKeys': keys, 'inheritanceBoundaryRequiredOnBoth': True}, 'counts': {'activeAtoms': len(current_atoms), 'activeRecords': len(before_goals), 'ni3Atoms': 366, 'ni3Records': len(staged_goals), 'ni3PlusTwoAtoms': future_atoms, 'ni3PlusTwoRecords': future_records}, 'denominatorPreservation': 'All363 active atomic goal bodies and IDs retained. Both revised leaves count as ordinary atoms once adopted; neither is reclassified or excluded to shrink the denominator.'})

protected = [('biologie-ni-three-current-adoption-checks-a-v1/frozen-receipt.json', 'af8e23d7d5e4316ebbc49e774e17afd8646c2a5cc01f6ee9776cc8b79915a425'), ('biologie-ni-fw6-008-recombination-current-preservation-candidate-v1/frozen-receipt.json', 'd502f063db4d2ab32282f5d7843fcbc6890d717ca698dd8ad2ed801057d50b09'), ('biologie-ni-fw6-008-recombination-current-preservation-candidate-v1/source-description-verdict.frozen.json', '07aad72c7b1c022541a86a0313fc60dba7a7305c0661d144725bd73b6b351713')]
for p, expected in protected:
    assert sha(BASE / p) == 'sha256:' + expected
inputs = [canonical_path, v2_path, ROOT / 'curricula/DE/Gymnasium/mapping/DE-NI/lower-secondary/ni_biology_lower_secondary_source_extraction_to_canonical_biology.review.json', ROOT / 'curricula/DE/Gymnasium/input/NI/lower-secondary/source-extraction/DE_NI_BIOLOGIE_SEKI_KC2015.source-extraction.json', ROOT / templates['sourceBinding']['sourceDocumentPath'], ROOT / 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json', source_path, mapping_path, STAGE / 'canonical.biologie.candidate.json']
write('input-bindings-and-preservation.receipt.json', {'checkedAt': now, 'bindings': [{'path': rel(p), 'digest': sha(p), 'bytes': p.stat().st_size} for p in inputs], 'protectedPreviousFreezes': [{'path': p, 'digest': 'sha256:' + d, 'unchanged': True} for p, d in protected], 'all363CurrentAtomBodiesPreservedInNI3Stage': True, 'rootCanonicalIdsAdopted': False, 'pContentsRead': False})
print(f'Prepared split-only inactive preservation: {future_atoms} future atoms, {future_records} records, {future_rows} rows,123 source groups; all original partial rows retained.')
