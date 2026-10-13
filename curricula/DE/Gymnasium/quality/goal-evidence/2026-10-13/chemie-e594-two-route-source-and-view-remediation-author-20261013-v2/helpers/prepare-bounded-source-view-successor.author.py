#!/usr/bin/env python3
# Apache-2.0. Small, inactive CAS successor; no runtime or source graph writes.
import copy, hashlib, json
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path.cwd()
OWN = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e594-two-route-source-and-view-remediation-author-20261013-v2')
V1 = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e594-two-synthesis-routes-scope-preserving-author-20261013-v1')
REVIEW = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e594-two-route-split-scientific-independent-a-20261013-v1')
PARENT = 'e5941581-0aba-5354-b4b9-d0249d4538a8'
CHILDREN = ['981242bb-a729-5701-b02d-c2f7f489e5af', '53db04a0-ea76-5810-9526-c8639100e497']
NOW = datetime.now(timezone.utc).isoformat()

def read(path):
    return json.loads((ROOT / path).read_text())

def bind(path):
    b = (ROOT / path).read_bytes()
    return {'path': str(path), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def write(path, data):
    p = ROOT / OWN / path
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as stream:
        stream.write(data if isinstance(data, str) else json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    return bind(OWN / path)

seal = read(V1 / 'FINAL.finite-inactive-author.freeze.json')
for guard in seal['outputFiles'] + seal['originalInputBindings']:
    assert bind(Path(guard['path'])) == guard
review_report = bind(REVIEW / 'SCIENTIFIC.REPORT.md')
reuse_paths = ['candidate/three-existing-whole-goal-CAS-and-two-new-whole-children.inactive-author.json', 'candidate/five-semantic-decision-CAS.stock-fingerprints.inactive-author.json', 'positive/two-child.exact-route-profiles.author.json', 'positive/four-child.complete-DEEN-cases.author.json', 'positive/exact-whole74-whole37-split-transport.author.json', 'inputs/retained-e594-original-whole-profile-and-two-cases.exact-history.json', 'canonical-whole-goal-CAS-and-graph-impacts.author.json', 'whole-context-before-after-and-inherited-scope-effects.author.json']
reused = [bind(V1 / p) for p in reuse_paths]
write(Path('inputs/immutable-v1-reuse-and-genuine-finding-bindings.actual.json'), {'immutableV1Seal': bind(V1 / 'FINAL.finite-inactive-author.freeze.json'), 'exactReusedAuthorInputs': reused, 'independentScientificFinding': review_report, 'v1OutputsAllVerified': len(seal['outputFiles']), 'v1OriginalInputsAllVerified': len(seal['originalInputBindings']), 'scientificGoalOperatorsCasesProfilesParentPNGChanged': False, 'newIndependentVotes': 0, 'activeWrites': False})

source = read(V1 / 'inputs/e594.final-source-attachments.exact-whole-cells.json')
old_source_cas = read(V1 / 'source-exact-cell-partition-and-whole-mapping-CAS.author.json')
mapping_groups = {}
source_cell_cas = []
cell_limits = []
for witness in source['finalCompiledWitnessesWithExactWholeCells']:
    sid = witness['wholeSourceCell']['id']
    mapping_path = Path(witness['exactMappingBinding']['path'])
    extraction_path = Path(witness['exactExtractionBinding']['path'])
    mapping = read(mapping_path)
    extraction = read(extraction_path)
    original_cell = next(c for c in extraction['sourceGoals'] if c['id'] == sid)
    assert original_cell == witness['wholeSourceCell']
    after_cell = copy.deepcopy(original_cell)
    if sid == '4fb9f93d-b53f-5e9a-9bd1-5d600f081091':
        proposed_targets = CHILDREN
        scope = 'BY C13-EA.2.6, erhöhtes Anforderungsniveau: both complete syntheses. No GK or whole-course approval.'
        retained_context = 'The complete source duty is partitioned as a union of both complete atomic routes; the original aggregate edge is replaced, not duplicated as a third source duty.'
    elif sid == 'rp-chem-sekii-rp-ch-sekii-2022-baustein-3-3-004-3794fee6':
        proposed_targets = []
        after_cell['sourceRef'] = 'RP-CH-SEKII-2022, 3.3, physical PDF40/printed40, Vertiefungs- bzw. Verzahnungsmöglichkeiten'
        after_cell['sourceScopeCondition'] = 'Optional Vertiefungs- bzw. Verzahnungsmöglichkeiten below the 3.3 table; not the mandatory content of the P table. No complete triphenylmethane synthesis or oxidation obligation.'
        scope = 'RP3.3 optional carbonyl-product extensions only; physical PDF40/printed40. No direct complete-synthesis child mapping.'
        retained_context = 'Keep the actual Aldol/imine/oxime/hydrazone duty and all other original partners. No prerequisite proxy is added.'
    elif sid == 'rp-chem-sekii-rp-ch-sekii-2022-baustein-6-2-001-f7732a59':
        proposed_targets = []
        after_cell['sourceRef'] = 'RP-CH-SEKII-2022, 6.2, physical PDF47/printed47, Grundfach W / Leistungsfach WP'
        after_cell['sourceScopeCondition'] = '6.2 Fundamentum: W in Grundfach, WP in Leistungsfach. RP19 requires selection of WP; non-selected WP is W. The cell requires classifying selected colourant classes, not synthesis.'
        scope = 'RP6.2 classification only in the selected W/WP context; physical PDF47/printed47. No complete-synthesis child mapping.'
        retained_context = 'Retain original classification dimensions (structure, solubility, origin, dyeing method, use). A precise atomic classification target is an open data-refinement duty, not replaced by spectra or synthesis.'
    elif sid == 'rp-chem-sekii-rp-ch-sekii-2022-baustein-6-2-002-114423e7':
        proposed_targets = []
        after_cell['sourceRef'] = 'RP-CH-SEKII-2022, 6.2, physical PDF47/printed47, Leistungsfach Additum, selected WP'
        after_cell['sourceScopeCondition'] = 'Leistungsfach Additum of 6.2: azo-dye synthesis mechanism in the selected WP block. RP19: non-selected WP becomes W; W contents need not be exhaustive. Selection cannot be inferred from LK or focus alone.'
        scope = 'Azo route is chemically compatible, but only the selected RP6.2 WP/Additum context owns the complete duty. General RP-LK does not encode this selection.'
        retained_context = 'A conditional azo-target proposal is retained nonoperatively below. No direct mapped child edge until the actual selected scope is represented and reviewed.'
    elif sid == 'sn-chem-sekii-sn-ch-jahrgangsstufe-12-leistungskurs-wb1-088-01-1b8987f0':
        proposed_targets = []
        after_cell['sourceRef'] = 'SN-CH-2025, Jahrgangsstufe 12 Leistungskurs, Wahlbereich 1 Farbstoffe, physical PDF60/printed48'
        after_cell['sourceScopeCondition'] = 'Elective Wahlbereich 1: apply the chromophore model to classification by structure (polymethine, triphenylmethane, carbonyl dyes). No synthesis obligation and no compulsory full-course entitlement.'
        scope = 'SN12 LK Wahlbereich 1 structural classification only; physical PDF60/printed48. No complete-synthesis child mapping.'
        retained_context = 'Retain the chromophore-to-classification duty, including all named families. No exact existing classification atom was identified; do not substitute spectra or a complete synthesis.'
    else:
        raise AssertionError(sid)

    if mapping_path not in mapping_groups:
        mapping_groups[mapping_path] = {'mapping': mapping, 'replacementRows': [], 'decisionCAS': []}
    group = mapping_groups[mapping_path]
    mapping_indexes = [i for i, m in enumerate(mapping['mappings']) if m['legacyGoalId'] == sid and m['canonicalGoalId'] == PARENT]
    assert len(mapping_indexes) == 1
    mi = mapping_indexes[0]
    new_rows = []
    for target in proposed_targets:
        new_row = copy.deepcopy(mapping['mappings'][mi])
        new_row.update(canonicalGoalId=target, matchType='partial')
        new_rows.append(new_row)
    group['replacementRows'].append({'jsonPointer': '/mappings/' + str(mi), 'expectedBeforeWholeCell': mapping['mappings'][mi], 'replacementWholeCells': new_rows})
    di = next(i for i, d in enumerate(mapping['decisions']) if d['sourceGoalId'] == sid)
    before_decision = mapping['decisions'][di]
    after_decision = copy.deepcopy(before_decision)
    after_decision['canonicalGoalIds'] = [target for old_target in before_decision['canonicalGoalIds'] for target in (proposed_targets if old_target == PARENT else [old_target])]
    assert after_decision['canonicalGoalIds'], sid
    group['decisionCAS'].append({'jsonPointer': '/decisions/' + str(di), 'expectedBeforeWholeCell': before_decision, 'proposedAfterWholeCell': after_decision, 'originalOtherPartnersExact': [t for t in before_decision['canonicalGoalIds'] if t != PARENT] == [t for t in after_decision['canonicalGoalIds'] if t not in CHILDREN], 'doesNotCertifyOtherPartnersOrWholeSourceDuty': True})
    cell_limits.append({'sourceGoalId': sid, 'wholeOriginalSourceCellBindingOwner': witness['exactExtractionBinding'], 'scopeAndOperatorLimit': scope, 'retainedOriginalDuty': retained_context, 'operativeDirectChildTargetIds': proposed_targets, 'synthesisChildEvidenceFromPartialMechanismOrClassification': False})
    if after_cell != original_cell:
        si = next(i for i, c in enumerate(extraction['sourceGoals']) if c['id'] == sid)
        # Raw words and old raw locators remain historical source extraction.
        assert all(after_cell[k] == original_cell[k] for k in ['sourceText', 'rawSourceText', 'parentBulletText', 'rawParentBulletText', 'rawSourceSpan', 'id', 'title', 'description'])
        source_cell_cas.append({'expectedWholeExtractionBinding': witness['exactExtractionBinding'], 'jsonPointer': '/sourceGoals/' + str(si), 'expectedBeforeWholeCell': original_cell, 'proposedAfterWholeCell': after_cell, 'changedFields': sorted(k for k in set(after_cell) | set(original_cell) if after_cell.get(k) != original_cell.get(k)), 'locatorAndScopeOnlyNoInventedAssessedVerb': True})

mapping_cas = []
for path, group in mapping_groups.items():
    mapping = group['mapping']
    projected = copy.deepcopy(mapping)
    for replacement in sorted(group['replacementRows'], key=lambda r: int(r['jsonPointer'].split('/')[-1]), reverse=True):
        i = int(replacement['jsonPointer'].split('/')[-1])
        projected['mappings'][i:i+1] = replacement['replacementWholeCells']
    for row in group['decisionCAS']:
        projected['decisions'][int(row['jsonPointer'].split('/')[-1])] = row['proposedAfterWholeCell']
    def units(doc):
        return {'sourceDecisionRows': len(doc['decisions']), 'distinctSourceGoalIdsInDecisions': len({d['sourceGoalId'] for d in doc['decisions']}), 'compatibilityMappingEdgeRows': len(doc['mappings']), 'compatibilityMappingExactEdgeRows': sum(m['matchType'] == 'exact' for m in doc['mappings']), 'compatibilityMappingPartialEdgeRows': sum(m['matchType'] == 'partial' for m in doc['mappings']), 'authoritativeDecisionTargetEdges': sum(len(d['canonicalGoalIds']) for d in doc['decisions'])}
    assert len(projected['decisions']) == len(mapping['decisions'])
    original_pairs = {(m['legacyGoalId'], m['canonicalGoalId']): m for m in mapping['mappings']}
    projected_pairs = {(m['legacyGoalId'], m['canonicalGoalId']): m for m in projected['mappings']}
    changed_source_ids = {row['expectedBeforeWholeCell']['legacyGoalId'] for row in group['replacementRows']}
    assert all(projected_pairs[pair] == row for pair, row in original_pairs.items() if not (pair[0] in changed_source_ids and pair[1] == PARENT))
    assert len(projected_pairs) == len(projected['mappings'])
    # Compiler needs identical redundant mapping/decision edge sets.
    decision_pairs = {(d['sourceGoalId'], t) for d in projected['decisions'] for t in d['canonicalGoalIds']}
    assert set(projected_pairs) == decision_pairs
    mapping_cas.append({'expectedWholeMappingBinding': bind(path), 'mappingCellReplacements': group['replacementRows'], 'decisionCellCompareAndSwap': group['decisionCAS'], 'exactLegacySummaryGuard': {'expectedBefore': mapping.get('summary'), 'proposedAfter': copy.deepcopy(mapping.get('summary')), 'unchanged': True, 'unitInterpretation': 'Retained historical source-row classification summary; never recomputed as mapping-edge totals. Historical exact/partial categorization remains history and is not claimed as a fresh full-duty approval.'}, 'namedMeasuredCountUnits': {'before': units(mapping), 'afterProposed': units(projected)}, 'allOriginalSourceDecisionRowsRetained': True, 'allNonE594PartnersExact': True, 'newMappingsOnlyBYFullUnion': True, 'allSourceDecisionsStillMappedButRefinementHoldsNotCleared': True})
write(Path('source-component-five-cell-and-three-mapping-CAS.author.json'), {'role': 'Inactive source-component correction; replaces v1 source CAS instead of layering its direct partial child edges', 'replacesV1Artifact': bind(V1 / 'source-exact-cell-partition-and-whole-mapping-CAS.author.json'), 'sourceComponentLimits': cell_limits, 'wholeMappingGuardsAndCellCAS': mapping_cas, 'conditionalRPAzoNonoperativeProposal': {'sourceGoalId': 'rp-chem-sekii-rp-ch-sekii-2022-baustein-6-2-002-114423e7', 'childGoalId': CHILDREN[0], 'condition': 'Explicitly selected RP6.2 WP/Additum; no selection is inferred from generic LK, metadata, or Level3 focus', 'inMappedCanonicalGoalIds': False, 'inGeneralRPLKTargetView': False, 'needsAuthoredSelectedScope': True}, 'sourceDecisionPartnerPreservationIsNotBlanketSourceApproval': True, 'noNewPrerequisiteProxy': True, 'authorScientificPasses': 0, 'newIndependentVotes': 0, 'activeWrites': False})
write(Path('four-source-locator-and-optional-condition-whole-cell-CAS.author.json'), {'role': 'Additive exact locator/scope cell corrections, independent source review pending', 'sourceCellCompareAndSwap': source_cell_cas, 'RP19SelectionRule': 'P must be treated in full; WP blocks are selected; non-selected WP becomes W; W content need not be exhaustive. Existing generic courseProfile LK cannot express the actual selected block.', 'selectionMetadataDoesNotCreateRuntimePermission': True, 'sourceTextOperatorsAndRawHistoricalExtractionUntouched': True, 'activeWrites': False})

views_v1 = read(V1 / 'scope-view-whole-CAS.author.json')
views = []
for file in views_v1['wholeViewProposals']:
    path = Path(file['expectedWholeViewBinding']['path'])
    before = read(path)
    node_changes = []
    nationally_canonical = 'navigation/de-gym-chemistry-national-atlas.view.json' in str(path)
    by_lk = str(path).endswith('source-de-by-sekii-lk.view.json')
    for change in file['exactNodeChanges']:
        before_node = change['beforeWholeNode']
        assert before_node == {'kind': 'goalEntry', 'goalId': PARENT}
        node_changes.append({'jsonPointer': change['jsonPointer'], 'expectedBeforeWholeNode': before_node, 'operation': 'replace' if (nationally_canonical or by_lk) else 'remove', 'proposedAfterWholeNode': {'kind': 'canonicalSubtree', 'goalId': PARENT} if (nationally_canonical or by_lk) else None, 'allowBothCompleteChildren': bool(nationally_canonical or by_lk), 'otherSiblingNodesIdsOrderRolesAndLabelsExact': True})
    scope_reason = 'BY LK exact both-route source union' if by_lk else 'Explicit national canonical union, with BY full-source owner; not every-country or every-course entitlement' if nationally_canonical else 'No independent full-synthesis witness for this whole existing scope; remove only unsupported aggregate reference. Preserve actual source duties and pending selected-scope/refinement obligations separately.'
    views.append({'expectedWholeViewBinding': file['expectedWholeViewBinding'], 'wholeExistingScope': before.get('scope'), 'exactNodeCAS': node_changes, 'authoredScopeReason': scope_reason, 'noPrerequisiteOnlySubstitute': True, 'notAnOptionalSelectionPermission': True})
assert len(views) == 21
write(Path('all21-coupled-source-and-learner-view-CAS.author.json'), {'role': 'Inactive bounded scope correction; replace all v1 broad subtree view proposals', 'replacesV1Artifact': bind(V1 / 'scope-view-whole-CAS.author.json'), 'wholeExistingViewGuardsAndNodeCAS': views, 'guardedViewCount': len(views), 'bothChildrenAllowedInBYLKAndNationalUnionOnly': True, 'RPSNSHSekIAndOtherUnsupportedSynthesisTargetsRemovedOnly': True, 'RPChosenScopeRequiresSeparateAuthoredRepresentation': True, 'sourceDutiesAreNotDeletedByViewRemoval': True, 'unsupportedScopeSourceGapsRemainBlockers': True, 'noRuntimeOrUXChanges': True, 'activeWrites': False, 'rootFullCompilerScopeMeasurementPending': True})

# Keep the additional actual RP classification duty explicit, even though this
# row has no direct e594 edge in the final baseline and needs no removal CAS.
rp_extraction_path = next(Path(w['exactExtractionBinding']['path']) for w in source['finalCompiledWitnessesWithExactWholeCells'] if w['compiledWitness']['scope'] == 'DE-RP/SekII/LK')
rp_extraction = read(rp_extraction_path)
rp_additional_cell = next(c for c in rp_extraction['sourceGoals'] if c['id'] == 'rp-chem-sekii-rp-ch-sekii-2022-baustein-6-2-003-34dc2823')
canonical_cas = read(V1 / reuse_paths[0])
canonical = read(Path(canonical_cas['sourceCanonicalBinding']['path']))
local_dye_ids = next(g for g in canonical['goals'] if g['id'] == 'fa21e8e1-b430-54ad-9647-f763bc4137ba')['contains']
nearby = [{'goalId': g['id'], 'title': g['title'], 'description': g['description']} for g in canonical['goals'] if g['id'] in local_dye_ids]
write(Path('bounded-open-data-refinement-and-selected-scope-blockers.author.json'), {
    'role': 'Finite real-source duties remain open; no invented core/noncore/selection permission',
    'blockers': [
        {'id': 'RP6.2_SELECTED_SCOPE', 'sourceGoalIds': ['rp-chem-sekii-rp-ch-sekii-2022-baustein-6-2-002-114423e7'], 'actualDuty': 'Azo-dye synthesis mechanism in the chosen WP/Additum block', 'reason': 'Generic RP-LK source facets and default authored views cannot express actual selection. Scope text alone is not an operative selected-scope discriminator.', 'safeCurrentAction': 'Do not map or publish the synthesis child as generic RP-LK. Retain nonoperative conditional route proposal.', 'laterRequiredAction': 'Represent and independently review the actual selected context within an explicitly authorized program/scope design; root must not infer selection from course tags or temporary focus.'},
        {'id': 'RP_CLASSIFICATION_OPERATOR', 'sourceGoalIds': ['rp-chem-sekii-rp-ch-sekii-2022-baustein-6-2-001-f7732a59', rp_additional_cell['id']], 'actualDuty': 'Classify selected organic colourant classes by the supplied criteria and include at least two further classes without required mechanistic consideration.', 'exactAdditionalWholeSourceDuty': rp_additional_cell, 'reason': 'No exact existing assessed class-classification atom identified in the reviewed dye branch; spectra or complete synthesis do not implement that operation.', 'laterRequiredAction': 'A small faithful classification atom may be authored later with exact source and selection constraints, independent reviews, whole coupled graph/view/denominator work. No new atom is created here.'},
        {'id': 'SN_CHROMOPHORE_CLASSIFICATION_OPERATOR', 'sourceGoalIds': ['sn-chem-sekii-sn-ch-jahrgangsstufe-12-leistungskurs-wb1-088-01-1b8987f0'], 'actualDuty': 'Apply the chromophore model to classification by structure, including polymethine, triphenylmethane and carbonyl dyes in elective Wahlbereich1.', 'reason': 'Chromophore-to-classification is not full triphenylmethane synthesis and has no exact existing classification atom in the reviewed dye branch.', 'laterRequiredAction': 'Author a source-faithful assessed classification target if appropriate; preserve elective selection and review whether RP and SN operations really share one atom.'},
        {'id': 'RP3.3_OPTIONAL_PRODUCT_CONTEXT', 'sourceGoalIds': ['rp-chem-sekii-rp-ch-sekii-2022-baustein-3-3-004-3794fee6'], 'actualDuty': 'Optional Aldol/imine/oxime/hydrazone extensions', 'reason': 'Cannot entitle full triphenylmethane synthesis. Original remaining reaction partners are preserved, not independently cleared here.', 'laterRequiredAction': 'Keep the optional source duty and inspect its own true target fit separately if its coverage is claimed.'},
    ],
    'examinedExistingDyeGoalOperators': nearby,
    'allOriginalSourceRowsAndOtherPartnersPreserved': True,
    'noBlanketSourceDropToObtainPass': True,
    'noNewGoalsOrGoalBodyChanges': True,
    'noWholeSourceCoverageApproval': True,
    'rootCombinationAndNormalCompilerMeasurementStillPending': True,
})

primary_documents = [
    {'officialURL': 'https://bildung.rlp.de/lehrplaene/?tx_rlpbase_download%5Bitem%5D=67901&type=432522', 'localCachePathInformationalOnly': 'curricula/DE/Gymnasium/input/RP/Chemie_Sekundarstufe_II_MSS_2022.pdf', 'observedSha256': bind(Path('curricula/DE/Gymnasium/input/RP/Chemie_Sekundarstufe_II_MSS_2022.pdf'))['sha256'], 'actualWholePagesTextRead': [{'physicalPDFPage': 19, 'printedPage': 19}, {'physicalPDFPage': 40, 'printedPage': 40}, {'physicalPDFPage': 47, 'printedPage': 47}], 'method': 'pdftotext -layout of each entire page; author read full page output; no visual page-layout acceptance claimed'},
    {'officialURL': 'https://www.schulportal.sachsen.de/lplandb/lehrplan/file/521/lnuYavMOfLLQRd2MlehG', 'localCachePathInformationalOnly': 'curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-chemie-sachsen-2025.pdf', 'observedSha256': bind(Path('curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-chemie-sachsen-2025.pdf'))['sha256'], 'actualWholePagesTextRead': [{'physicalPDFPage': 60, 'printedPage': 48}], 'method': 'pdftotext -layout of entire page; author read full page output; no visual page-layout acceptance claimed'},
]
write(Path('checks/primary-locator-read-receipt-and-count-units.actual.json'), {'readAtUTC': NOW, 'primaryReadProvenanceNotPortableBuildDependencies': primary_documents, 'frozenExtractionAndMappingBindings': [w['exactExtractionBinding'] for w in source['finalCompiledWitnessesWithExactWholeCells']] + [f['expectedWholeMappingBinding'] for f in mapping_cas], 'primaryPDFFilesNotCopied': True, 'allFiveOriginalSourceCellsAndAllSourceDecisionRowsRetained': True, 'sourceSummaryGuardNeverChanges332DecisionUnitTo496EdgeUnit': True, 'unsupportedChildDirectEdgesRemoved': True, 'newIndependentScientificVotes': 0})
for guard in seal['outputFiles'] + seal['originalInputBindings']:
    assert bind(Path(guard['path'])) == guard
assert bind(REVIEW / 'SCIENTIFIC.REPORT.md') == review_report
write(Path('checks/finite-small-CAS-preservation.actual.json'), {'checkedAtUTC': NOW, 'v1OutputsUnchanged': len(seal['outputFiles']), 'v1InputBindingsUnchanged': len(seal['originalInputBindings']), 'sourceWitnessCells': 5, 'locatorScopeSourceCellCAS': len(source_cell_cas), 'wholeMappingHashGuards': len(mapping_cas), 'wholeViewHashGuards': len(views), 'copiedWholeCanonicalFiles': 0, 'copiedWholeSourceMatrices': 0, 'newBookModels': 0, 'newGoals': 0, 'newImages': 0, 'newDPAOrMVVotes': 0, 'activeWrites': False, 'fullCompilerScopeMeasurementByRootPending': True})
print(json.dumps({'mappingCAS': len(mapping_cas), 'viewCAS': len(views), 'locatorCellCAS': len(source_cell_cas), 'newGoals': 0, 'activeWrites': False}))
