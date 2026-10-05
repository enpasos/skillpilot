#!/usr/bin/env python3
"""Apache-2.0. Prepare NI source adoption units; never write active paths."""
from pathlib import Path
import copy
import hashlib
import json

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
BASE = 'curricula/DE/Gymnasium/'
CAND = BASE + 'quality/goal-evidence/2026-10-05/biologie-q1-ni-consolidated-integration-candidate-v1/staged/ni-three-targeted-root-preparation-v1/'
SOURCE = BASE + 'input/NI/lower-secondary/source-extraction/DE_NI_BIOLOGIE_SEKI_KC2015.source-extraction.json'
MAPBASE = BASE + 'mapping/DE-NI/lower-secondary/'
MAPS = [MAPBASE + 'ni_biology_lower_secondary_source_extraction_to_canonical_biology.review.json', MAPBASE + 'ni_biology_lower_secondary_source_extraction_to_canonical_biology.m7-e3-recombination-20261001-v2.review.json']
NEXTSOURCE = BASE + 'input/NI/lower-secondary/source-extraction/DE_NI_BIOLOGIE_SEKI_KC2015.current-three-20261005-v1.source-extraction.json'
NEXTMAP = MAPBASE + 'ni_biology_lower_secondary_source_extraction_to_canonical_biology.m7-three-current-20261005-v1.review.json'
HISTORY = BASE + 'quality/source-mapping-history/biologie-ni-three-current-20261005-v1/'
SOURCEID = '0b27a054-e81e-5423-aa71-d3d8d9d8f0db'
CANONID = '08a43a1b-d97e-522c-9dfa-c950a493364e'
NEWIDS = ['359e6313-cd86-54d1-bee5-8e680101dc32', '0263fb84-33b1-52a3-a47e-dad56be7c9bc', '36d3bf01-e68b-55be-8e20-5652ada36a51']
RETIRE = 'ni-biology-seki-kc2015-fw6-003-fd1495c5'

def read(path):
    return json.loads((ROOT / path).read_text())

def sha(path):
    return 'sha256:' + hashlib.sha256((ROOT / path).read_bytes()).hexdigest()

def write(name, data):
    path = OUT / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

def binding(path):
    return {'path': path, 'sha256': sha(path)}

def main():
    before = read(SOURCE)
    extraction = read(CAND + 'ni.source-extraction.candidate.json')
    mapping = read(CAND + 'ni.mapping.candidate.json')
    current = read(BASE + 'canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
    canonical = read(CAND + 'canonical.biologie.candidate.json')
    current_by_id = {g['id']: g for g in current['goals']}
    candidate_by_id = {g['id']: g for g in canonical['goals']}
    assert set(candidate_by_id) - set(current_by_id) == set(NEWIDS)
    changed_canonical = [g['id'] for g in canonical['goals'] if g['id'] in current_by_id and g != current_by_id[g['id']]]
    assert set(changed_canonical) == {'b530a382-2786-5794-8821-3e01a62d88fd', 'b4176012-f93a-5dd2-84b3-edd6a9932367'}
    assert all(set(candidate_by_id[i]) == set(current_by_id[i]) and all(candidate_by_id[i][k] == current_by_id[i][k] for k in current_by_id[i] if k != 'contains') for i in changed_canonical)
    before_by_id = {g['id']: g for g in before['sourceGoals']}
    after_by_id = {g['id']: g for g in extraction['sourceGoals']}
    assert set(before_by_id) - set(after_by_id) == {RETIRE}
    assert not (set(after_by_id) - set(before_by_id))
    changed_source = [i for i in after_by_id if after_by_id[i] != before_by_id[i]]
    assert len(changed_source) == 5
    assert len(after_by_id) == 123
    source_scan = []
    for path in (ROOT / (BASE + 'input')).rglob('*.source-extraction.json'):
        if json.loads(path.read_text()).get('sourceLandscapeId') == SOURCEID:
            source_scan.append(str(path.relative_to(ROOT)))
    assert source_scan == [SOURCE]
    all_scanned_mappings = []
    for path in (ROOT / 'curricula/DE').rglob('*.json'):
        if '/mapping/' not in str(path):
            continue
        record = json.loads(path.read_text())
        if record.get('sourceLandscapeId') == SOURCEID:
            all_scanned_mappings.append(str(path.relative_to(ROOT)))
    assert set(all_scanned_mappings) == set(MAPS)
    registrypath = BASE + 'provenance/source-landscape-registry.json'
    registry = read(registrypath)
    registry_before = next(e for e in registry['entries'] if e['landscapeId'] == SOURCEID)
    registry_after = copy.deepcopy(registry_before)
    registry_after['sourcePath'] = NEXTSOURCE
    registry_after['archiveSourcePath'] = HISTORY + 'before-source/DE_NI_BIOLOGIE_SEKI_KC2015.source-extraction.json.snapshot'
    registry_after['archivePath'] = HISTORY + 'before-source/'
    # Keep official source URL. Original PDF is pinned in sourceDocument(s), not replaced.
    archive_units = []
    for path in [SOURCE] + MAPS:
        kind = 'before-source' if path == SOURCE else 'before-reviews'
        archive_units.append({'currentPath': path, 'currentSha256': sha(path), 'historicalPath': HISTORY + kind + '/' + Path(path).name + '.snapshot', 'operationAfterReview': 'copy exact bytes, verify hash, remove old active path in same integration transaction'})
    membershippath = BASE + 'provenance/source-goal-membership-registry.json'
    closurepath = BASE + 'provenance/source-goal-closure-registry.json'
    membership = read(membershippath)
    closure = read(closurepath)
    assert not any(e.get('landscapeId') == SOURCEID for e in membership['landscapes'])
    assert not any(e.get('landscapeId') == SOURCEID for e in closure['landscapes'])
    sourceids = sorted(after_by_id)
    # Optional derivative inventory only; these closures are source atoms, never M7.
    write('source-inventory.membership-and-atomic-closure.optional.delta.json', {
        'status': 'inactive_derivative_inventory_optional',
        'requiredForCurrentExtractionRoute': False,
        'basis': 'Current status reader uses the scanned extraction source IDs first; NI has no existing landscapes[] registry entry. Do not insert canonical IDs in the source inventory.',
        'membership': {'path': membershippath, 'pointer': '/landscapes/-', 'before': None, 'after': {'landscapeId': SOURCEID, 'goalIds': sourceids}},
        'sourceAtomicClosure': {'path': closurepath, 'pointer': '/landscapes/-', 'before': None, 'after': {'landscapeId': SOURCEID, 'goalAtomicClosures': {i: [i] for i in sourceids}}},
        'retiredSourceIdExcluded': RETIRE,
        'machineDeepUnderstandingClosures': 0,
    })
    write('source-five-cells-and-one-retirement.delta.json', {
        'status': 'inactive_selected_cells_prepared_for_root_adoption_review',
        'beforeBinding': binding(SOURCE),
        'afterCurrentPath': NEXTSOURCE,
        'sourceGoals': [{'sourceGoalId': i, 'before': before_by_id[i], 'after': after_by_id.get(i)} for i in changed_source + [RETIRE]],
        'unchangedSourceRecordCount': len(after_by_id) - len(changed_source),
        'onlySelectedScopeReviewed': True,
        'humanApproval': False,
    })
    mapping['sourceExtractionPath'] = NEXTSOURCE
    mapping['reviewId'] = 'DE-NI-BIOLOGIE-SEKI-KC2015-MAPPING-3-THREE-CURRENT-20261005-V1'
    mapping['status'] = 'inactive_targeted_adoption_review_required'
    oldmap = read(MAPS[1])
    groups = changed_source + [RETIRE]
    write('mapping-six-groups.delta.json', {
        'status': 'inactive_targeted_adoption_review_required',
        'predecessorBindings': [binding(p) for p in MAPS],
        'currentSuccessorPath': NEXTMAP,
        'currentSourceExtractionPath': NEXTSOURCE,
        'groups': [{'sourceGoalId': i, 'beforeRows': [m for m in oldmap['mappings'] if m['legacyGoalId'] == i], 'afterRows': [m for m in mapping['mappings'] if m['legacyGoalId'] == i], 'beforeDecision': next(d for d in oldmap['decisions'] if d['sourceGoalId'] == i), 'afterDecision': next((d for d in mapping['decisions'] if d['sourceGoalId'] == i), None)} for i in groups],
        'unaffectedMappingRowsAndDecisionsPreserved': True,
        'historicalPredecessorsMustExitActiveMappingScan': True,
    })
    # Never let unsupported 'pending' statuses vanish from the actual normalizer.
    extraction['qualityReview']['status'] = 'targeted_current_source_adoption_review_required'
    extraction['qualityReview']['reviewedBy'] = 'historical-review-preserved; current-selected-cells-author-inspection-only'
    extraction['qualityReview']['reviewedAt'] = '2026-10-05'
    extraction['qualityReview']['notes'] = [
        '118 unchanged structured source records retain their historical decisions. Five exact selected cells and one unsupported synthetic source atom retirement are prepared for current targeted review.',
        'No whole-PDF extraction approval or human/legal clearance is claimed. Complete MAPPING-2/3 only after actual root adoption review and coupled target/source checks.',
    ]
    extraction['pipelineStatus']['currentStep'] = 'MAPPING-2'
    for step in extraction['pipelineStatus']['steps']:
        if step['id'] == 'MAPPING-1':
            continue
        step['status'] = 'blocked'
        for check in step['checks']:
            check['passed'] = False
            check['details'] = 'Targeted adoption review remains open. Technical structural counts are supplied in this package; they are not a fachliche approval.'
        step['checks'].append({'id': 'current-selected-source-adoption-review', 'label': 'Gezielte aktuelle Quellen- und Zieladoption fachlich geprüft', 'passed': False, 'details': 'Five actual table cells, FW6-003 retirement, exactly three canonical atoms and their current mappings must be adopted together.'})
    write('versioned-replacements/ni.current-source.review-pending.json', extraction)
    write('versioned-replacements/ni.current-mapping.review-pending.json', mapping)
    write('source-registry-entry.exact.delta.json', {'path': registrypath, 'entryKey': 'landscapeId', 'entryValue': SOURCEID, 'before': registry_before, 'after': registry_after, 'requiredForScannerUniqueness': False, 'purpose': 'Explicit current structured source vs immutable predecessor; PDF URL/path stay under sourceDocument(s).'})
    ledgerpath = BASE + 'quality/goal-book-publication/biologie.semantic-kinds.json'
    ledger = read(ledgerpath)
    decisions = {d['goalId']: d for d in ledger['decisions']}
    write('canonical-current-membership.and-kind-review.units.json', {
        'status': 'inactive_semantic_kind_review_units_no_authoritative_write',
        'sourceLandscapeId': CANONID,
        'ledgerPath': ledgerpath,
        'sourceIdMembershipIsSeparate': True,
        'newGoalUnits': [{'goalId': i, 'before': None, 'goal': candidate_by_id[i], 'suggestedSemanticKind': 'curricularAtomic', 'requiredDecision': 'Review exact bounded ordinary content competence, then append authoritative entry using repository fingerprint helper; no hash-only approval.'} for i in NEWIDS],
        'changedParentUnits': [{'goalId': i, 'beforeGoal': current_by_id[i], 'afterGoal': candidate_by_id[i], 'beforeDecision': decisions[i], 'suggestedSemanticKind': decisions[i]['semanticKind'], 'requiredDecision': 'Review only additive contains membership and preserve all pre-existing children; then update current fingerprint.'} for i in changed_canonical],
        'expectedAfterCounts': {**ledger['counts'], 'curricularAtomic': ledger['counts']['curricularAtomic'] + 3, 'total': ledger['counts']['total'] + 3},
        'fingerprintHelper': 'app/scripts/goalBookModel.ts::fingerprintSemanticKindSourceGoal',
        'newAtomicAndMemoryDecisionsRequired': True,
        'existingMemoryDeckAndCardDecisionsPreserved': True,
    })
    inputs_path = 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
    inputs = read(inputs_path)
    assert MAPS[1] in inputs['mappingPaths']
    new_inputs = copy.deepcopy(inputs)
    new_inputs['mappingPaths'] = [NEXTMAP if p == MAPS[1] else p for p in inputs['mappingPaths']]
    new_inputs['expectedCurricularAtomicGoalCount'] += 3
    write('source-atlas.inputs.exact-fields.delta.json', {'path': inputs_path, 'fields': [{'field': 'mappingPaths', 'before': inputs['mappingPaths'], 'after': new_inputs['mappingPaths']}, {'field': 'expectedCurricularAtomicGoalCount', 'before': inputs['expectedCurricularAtomicGoalCount'], 'after': new_inputs['expectedCurricularAtomicGoalCount']}], 'generationAfterCurrentLedgerAdoptionRequired': True})
    pdfpath = BASE + 'input/NI/lower-secondary/kc_naturwissenschaften_gymnasium_sek_i_2015.pdf'
    write('current-state.inventory.json', {
        'status': 'read_only_actual_current_state',
        'sourceLandscapeId': SOURCEID,
        'canonicalLandscapeId': CANONID,
        'sourceExtractionScanner': {'root': BASE + 'input', 'suffix': '.source-extraction.json', 'matchedLandscapePaths': source_scan, 'implementation': 'app/scripts/generateCurriculumQualityStatus.ts:4224,4681; Map.set(sourceLandscapeId,...) overwrites duplicates'},
        'mappingScanner': {'root': 'curricula/DE', 'pathMustContain': '/mapping/', 'matchedLandscapePaths': all_scanned_mappings, 'implementation': 'app/scripts/generateCurriculumQualityStatus.ts:4343'},
        'bindings': [binding(p) for p in [SOURCE, *MAPS, registrypath, membershippath, closurepath, ledgerpath, inputs_path]],
        'retainedPrimaryPdf': binding(pdfpath),
        'currentSourceAtoms': len(before_by_id),
        'preparedSuccessorSourceAtoms': len(after_by_id),
        'sourceCurrentMembershipEntry': None,
        'sourceCurrentAtomicClosureEntry': None,
        'registryReadersOnlyUseLandscapesArray': True,
        'newCanonicalIdsPresentInLiveLedger': [i for i in NEWIDS if i in decisions],
        'changedCanonicalParentsRequiringKindFingerprintReview': changed_canonical,
        'archivePlan': archive_units,
        'writeScope': str(OUT.relative_to(ROOT)),
        'activeWrites': 0,
        'machineClosures': 0,
        'humanApproval': False,
    })
    # Verify structure and unchanged rows rather than merely refreshing hashes.
    assert set(m['legacyGoalId'] for m in mapping['mappings']) == set(after_by_id)
    assert set(d['sourceGoalId'] for d in mapping['decisions']) == set(after_by_id)
    assert all(m['canonicalGoalId'] in candidate_by_id for m in mapping['mappings'])
    assert RETIRE not in {m['legacyGoalId'] for m in mapping['mappings']}
    old_other_rows = [m for m in oldmap['mappings'] if m['legacyGoalId'] not in groups]
    new_other_rows = [m for m in mapping['mappings'] if m['legacyGoalId'] not in groups]
    assert old_other_rows == new_other_rows
    assert [d for d in oldmap['decisions'] if d['sourceGoalId'] not in groups] == [d for d in mapping['decisions'] if d['sourceGoalId'] not in groups]
    assert all(extraction['pipelineStatus']['steps'][i]['status'] in ['complete', 'incomplete', 'blocked'] for i in range(3))
    write('targeted-preparation.check.receipt.json', {
        'status': 'PASS_PREPARATION_ONLY',
        'checks': {'oneCurrentScannedExtraction': True, 'exactlyTwoHistoricalActiveMappingsEnumerated': True, 'fiveChangedSourceCellsAndOnlyFw6003Retired': True, '118OtherSourceRecordsUnchanged': True, '118OtherSourceMappingDecisionGroupsUnchanged': True, '123SourceIdsExactlyMatchMappingAndDecisionIds': True, 'allMappingTargetsInSuppliedThreeAtomCanonicalCandidate': True, 'threeNewCanonicalAtomsAndOnlyTwoAdditiveParents': True, 'pipelineStatusValuesAcceptedByActualNormalizer': True, 'noActiveWrites': True},
        'adoptionHolds': ['current targeted source/M3 adoption remains review-pending', 'new semantic kind and A/M decisions remain inactive', 'actual generated current source atlas/book/context review remains required', 'representative year-specific runtime/frontier acceptance remains distinct from SekI source-atlas membership'],
        'closures': 0,
        'humanApproval': False,
    })
    print('PASS NI source route preparation: 123 current source IDs, five corrected cells, one retirement, three canonical atoms; active writes 0')

if __name__ == '__main__':
    main()
