#!/usr/bin/env python3
# Apache-2.0. Small additive author data; no operative files, Git or full QS.
import copy, hashlib, json, subprocess, uuid
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path.cwd()
OWN = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e594-residual-source-duty-author-20261013-v3')
V1 = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e594-two-synthesis-routes-scope-preserving-author-20261013-v1')
V2 = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e594-two-route-source-and-view-remediation-author-20261013-v2')
PEER = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e594-source-view-remediation-scientific-independent-a-20261013-v2')
IMAGE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e594-two-child-actual-images-author-20261013-v1')
DYE = 'fa21e8e1-b430-54ad-9647-f763bc4137ba'
CARBONYL = '8519f683-7c31-50da-be59-649997a6fc47'
AZO = '981242bb-a729-5701-b02d-c2f7f489e5af'
NOW = datetime.now(timezone.utc).isoformat()
assert not (ROOT / OWN / 'FINAL.finite-residual-source-duty-author.freeze.json').exists(), 'Immutable sealed author root; use a new root for a successor.'

def read(path):
    return json.loads((ROOT / path).read_text())

def bind(path):
    b = (ROOT / path).read_bytes()
    return {'path': str(path), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def write(path, obj):
    p = ROOT / OWN / path
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as stream:
        stream.write(obj if isinstance(obj, str) else json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
    return bind(OWN / path)

for folder, seal_name in [(V1, 'FINAL.finite-inactive-author.freeze.json'), (V2, 'FINAL.finite-inactive-source-view-author.freeze.json'), (IMAGE, 'FINAL.finite-two-actual-child-images-author.freeze.json')]:
    seal = read(folder / seal_name)
    for guard in seal['outputFiles']:
        assert bind(Path(guard['path'])) == guard
v1cas = read(V1 / 'candidate/three-existing-whole-goal-CAS-and-two-new-whole-children.inactive-author.json')
base = read(Path(v1cas['sourceCanonicalBinding']['path']))
after_v1 = copy.deepcopy(base)
for row in v1cas['existingGoals']:
    i = next(i for i, g in enumerate(after_v1['goals']) if g['id'] == row['expectedBeforeWholeGoal']['id'])
    assert after_v1['goals'][i] == row['expectedBeforeWholeGoal']
    after_v1['goals'][i] = row['proposedAfterWholeGoal']
after_v1['goals'].extend(v1cas['newChildren'])
by = {g['id']: g for g in after_v1['goals']}
assert len(by) == 525 and by[DYE]['weight'] == 12
source2 = read(V2 / 'source-component-five-cell-and-three-mapping-CAS.author.json')
locator2 = read(V2 / 'four-source-locator-and-optional-condition-whole-cell-CAS.author.json')
rp_map = next(f for f in source2['wholeMappingGuardsAndCellCAS'] if f['namedMeasuredCountUnits']['before']['sourceDecisionRows'] == 325)
sn_map = next(f for f in source2['wholeMappingGuardsAndCellCAS'] if f['namedMeasuredCountUnits']['before']['sourceDecisionRows'] == 302)
rp_extraction_guard = next(c['expectedWholeExtractionBinding'] for c in locator2['sourceCellCompareAndSwap'] if c['proposedAfterWholeCell']['id'].startswith('rp-'))
sn_extraction_guard = next(c['expectedWholeExtractionBinding'] for c in locator2['sourceCellCompareAndSwap'] if c['proposedAfterWholeCell']['id'].startswith('sn-'))
rp_extraction = read(Path(rp_extraction_guard['path']))
sn_extraction = read(Path(sn_extraction_guard['path']))
rp_after = copy.deepcopy(rp_extraction)
sn_after = copy.deepcopy(sn_extraction)
for row in locator2['sourceCellCompareAndSwap']:
    extraction = rp_after if row['proposedAfterWholeCell']['id'].startswith('rp-') else sn_after
    i = int(row['jsonPointer'].split('/')[-1])
    assert extraction['sourceGoals'][i] == row['expectedBeforeWholeCell']
    extraction['sourceGoals'][i] = row['proposedAfterWholeCell']
rp_cells = [g for g in rp_after['sourceGoals'] if g['topicCode'] == 'BAUSTEIN-6-2']
rp_carbonyl_cell = next(g for g in rp_after['sourceGoals'] if g['id'].endswith('3794fee6'))
sn_cells = [g for g in sn_after['sourceGoals'] if 'jahrgangsstufe-12-leistungskurs-WB1' in g['topicCode']]
sn_class_cell = next(g for g in sn_cells if g['id'].endswith('1b8987f0'))
assert len(rp_cells) == 3 and len(sn_cells) == 7

keys = ['canonical_chemistry_upper_dye_chemistry_criteria_classification', 'canonical_chemistry_upper_dye_chemistry_chromophore_structural_classification']
ids = [str(uuid.uuid5(uuid.UUID(DYE), k)) for k in keys]
assert all(id_ not in by for id_ in ids)
new_goals = []
for i, (id_, key) in enumerate(zip(ids, keys)):
    g = {
        'id': id_, 'shortKey': key,
        'title': ['Organische Farbmittel nach Kriterien einteilen', 'Farbstoffe mit dem Chromophor-Modell strukturell einteilen'][i],
        'titleEn': ['Classify organic colourants using explicit criteria', 'Classify dye structures using the chromophore model'][i],
        'description': [
            'Die lernende Person kann ausgewählte organische Farbmittelklassen anhand ausdrücklich benannter Kriterien vorstellen und gegebene Vertreter nachvollziehbar einteilen. Sie berücksichtigt dabei Azofarbstoffe und mindestens zwei weitere ausgewählte Farbstoffklassen und erläutert, wie Einteilungen nach Molekülstruktur, Löslichkeit, Herkunft, Färbemethode oder Verwendung unterschiedliche Zuordnungskriterien nutzen.',
            'Die lernende Person kann das Chromophor-Modell auf die Einteilung vorgegebener Farbstoffstrukturen nach ihrem Bau anwenden und ihre Zuordnungen anhand charakteristischer chromophorer Strukturelemente begründen, beispielhaft bei Polymethin-, Triphenylmethan- und Carbonylfarbstoffen.',
        ][i],
        'descriptionEn': [
            'The learner can introduce selected classes of organic colourants using explicitly named criteria and classify supplied representatives transparently. They include azo dyes and at least two further selected dye classes and explain how classification by molecular structure, solubility, origin, dyeing method or use applies different criteria.',
            'The learner can apply the chromophore model to classify supplied dye structures by their constitution and justify assignments using characteristic chromophoric structural features, illustrated by polymethine, triphenylmethane and carbonyl dyes.',
        ][i],
        'weight': 1, 'type': 'atomic', 'tags': ['LK', 'canonical', 'SekII'], 'contains': [],
        'requires': [['7990387d-f254-5d3b-a589-a3e7ed9502a3'], ['87d8cc68-fe82-5273-9e43-c18b566ecb6c', '64b03eff-a967-54a1-ace3-89cb7650a65c']][i],
        'examples': [],
        'dimensionTags': {'framework': 'canonical-gymnasium-chemistry', 'demandLevel': 'AB2', 'processCompetencies': ['PK2_MODELLIEREN', 'PK4_KOMMUNIZIEREN'], 'guidingIdeas': ['BC_AUFBAU'], 'phase': 'Q4', 'area': 'Farbstoffchemie', 'topicCode': ['CANONICAL.CHEMISTRY.UPPER.DYES.CRITERIA_CLASSIFICATION', 'CANONICAL.CHEMISTRY.UPPER.DYES.CHROMOPHORE_STRUCTURAL_CLASSIFICATION'][i]},
        'applicability': {'jurisdiction': [['DE-RP'], ['DE-SN']][i]},
        'extendedData': {'applicabilityMappingInheritance': 'boundary', 'provenance': {'sourceLandscapeId': [rp_extraction['sourceLandscapeId'], sn_extraction['sourceLandscapeId']][i], 'sourceLandscapeTitle': ['Chemie Oberstufe Rheinland-Pfalz 2022', 'Chemie Gymnasium Sachsen 2025'][i], 'sourceGoalId': [rp_cells[0]['id'], sn_class_cell['id']][i], 'sourceGoalIds': [[rp_cells[0]['id'], rp_cells[2]['id']], [sn_class_cell['id']]][i]}}
    }
    new_goals.append(g)
parent_after = copy.deepcopy(by[DYE])
parent_after['contains'].extend(ids)
parent_after['weight'] = 14
write(Path('candidate/two-full-classification-goals-and-dye-parent-whole-CAS.author.json'), {
    'role': 'Bounded whole-goal author candidate, held for independent scientific and selected-program review',
    'expectedBaseBindings': [v1cas['sourceCanonicalBinding'], bind(V1 / 'candidate/three-existing-whole-goal-CAS-and-two-new-whole-children.inactive-author.json')],
    'idDerivation': {'method': 'UUIDv5', 'namespaceExistingDyeCluster': DYE, 'names': keys, 'newIds': ids},
    'newWholeGoals': new_goals,
    'existingWholeGoalCAS': [{'expectedBeforeWholeGoalAfterV1': by[DYE], 'proposedAfterWholeGoal': parent_after}],
    'oldSynthesisChildrenAndParentOverviewExact': True,
    'applicabilityCountryAssociationIsNotChosenModulePermission': True,
    'doNotApplyBeforeSelectedScopeAndSourceRegistrationResolved': True,
    'terminalRequiresNotAutomaticallyExpanded': True,
    'terminalDecisionHold': 'Do not append optional classification targets to the generic global capstone. Root must author and check the genuinely selected target closure before any terminal edge changes.',
    'noIndependentAtomicityVotes': True,
    'activeWrites': False,
})
write(Path('exact-whole-source-cells-and-distinct-operators.author.json'), {
    'wholeRP62SourceCellsAfterExactV2LocatorCAS': rp_cells,
    'wholeOptionalRP33SourceCellAfterV2LocatorCAS': rp_carbonyl_cell,
    'wholeSN12LKWB1SourceCellsAfterExactV2LocatorCAS': sn_cells,
    'exactRPExtractionBaseBinding': rp_extraction_guard, 'exactSNExtractionBaseBinding': sn_extraction_guard,
    'reusedV2FourLocatorCAS': bind(V2 / 'four-source-locator-and-optional-condition-whole-cell-CAS.author.json'),
    'operatorSeparation': {
        'RP': 'Official wording is Vorstellung ausgewählter Klassen und Einteilungsmöglichkeiten; the assessable classification is an explicit author operationalization, not a claimed identical official operator. The LK Additum also preserves at least two further classes and does not require their synthesis mechanisms.',
        'SN': 'Official wording explicitly applies the chromophore model to structural classification; this is a separate model-based operation. Families named in the remarks are retained as examples; remarks are recommendations under the primary preface, not converted to universally mandatory examples.',
        'sourceCountryScope': 'Both are optional/chosen-context targets. GK Fundamentum in RP has no minimum-two-additional LK Additum requirement; this LK target does not claim full GK-W source coverage.',
    },
    'remainingSNWB1RowsNotClaimedCoveredBySingleClassificationGoal': True,
    'allSourceWordsAndOperatorsRetained': True,
})

# Valid closed-format review views. Exact view IDs name the intended chosen
# content, but they do not manufacture committed selection in the runtime.
views = []
for i, jurisdiction in enumerate(['DE-RP', 'DE-SN']):
    view_id = ['de-rp-sekii-lk-rp62-selected-wp-classification-synthesis-author-v3', 'de-sn-sekii-lk-wb1-selected-classification-duty-author-v3'][i]
    goals = [ids[0], AZO] if i == 0 else [ids[1]]
    view = {'$schema': 'https://skillpilot.com/schemas/curriculum-package/v1/composition-view.schema.json', 'viewFormatVersion': '1.0', 'viewId': view_id, 'landscapeId': base['landscapeId'], 'language': 'de-DE', 'title': ['RP LK — ausgewählter Baustein 6.2: Klassifikation und Azosynthese (Autorprüfung)', 'SN12 LK — ausgewählter Wahlbereich 1: Klassifikationspflicht (Teilprüfung)'][i], 'scope': {'schoolForm': 'Gymnasium', 'jurisdiction': jurisdiction, 'stage': 'SekII', 'courseProfile': 'LK'}, 'rootNodes': [{'kind': 'structure', 'id': view_id + '-root', 'label': ['6.2 organische Farbmittelklassen — vollständig beabsichtigte LK-Pflichten', 'Wahlbereich 1 Farbstoffe — isolierte Klassifikationspflicht'][i], 'children': [{'kind': 'goalEntry', 'goalId': goal_id, 'projectionRole': 'target'} for goal_id in goals]}]}
    view_binding = write(Path('candidate/review-views') / f'{view_id}.json', view)
    views.append({'wholeView': view_binding, 'intendedModuleOnlyTargetGoalIds': goals, 'actualCommittedSelectionKnown': False, 'registeredDefaultOrSourceAtlasView': False, 'operativeRegistrationAllowed': False, 'reason': 'A valid review view can illustrate a chosen goal union. Its ordinary jurisdiction/stage/course scope cannot prove actual WP/W or WB selection.', 'isCompleteSource62DutyUnion': i == 0, 'isFullSNWB1Acceptance': False})
write(Path('selected-module-review-view-bodies-and-registration-HOLD.author.json'), {'wholeValidReviewViewBindings': views, 'currentV2All21OrdinaryViewsUnchanged': bind(V2 / 'all21-coupled-source-and-learner-view-CAS.author.json'), 'noNewScopeFieldsCoreFlagsOrCourseProfileNames': True, 'actualScopeSelectionRemainsHeld': True, 'noDefaultViewSynthesisOrClassificationWidening': True})

conditional = []
for i, (file_guard, extraction, selected_source_ids, target) in enumerate([
    (rp_map, rp_after, [rp_cells[0]['id'], rp_cells[2]['id']], ids[0]),
    (sn_map, sn_after, [sn_class_cell['id']], ids[1]),
]):
    mapping = read(Path(file_guard['expectedWholeMappingBinding']['path']))
    for row in file_guard['decisionCellCompareAndSwap']:
        di = int(row['jsonPointer'].split('/')[-1])
        assert mapping['decisions'][di] == row['expectedBeforeWholeCell']
        mapping['decisions'][di] = row['proposedAfterWholeCell']
    for sid in selected_source_ids:
        di = next(di for di, d in enumerate(mapping['decisions']) if d['sourceGoalId'] == sid)
        before = mapping['decisions'][di]
        after = copy.deepcopy(before)
        after['canonicalGoalIds'].append(target)
        after['decision'] = 'mapped'
        after['rationale'] = 'Inaktiver V3-Autorvorschlag: bestehende Partner erhalten; eigenständige Klassifikationsoperation ergänzt. Diese bedingte whole-cell-Zuordnung gilt erst nach unabhängiger Fachprüfung und tatsächlicher gewählter Programm-/Quellenregistrierung. Keine allgemeine Landes-/Kursfreigabe und kein Vollständigkeitspass.'
        source_cell = next(g for g in extraction['sourceGoals'] if g['id'] == sid)
        match = 'partial' if i == 0 else 'exact'
        conditional.append({'expectedWholeMappingBaseBinding': file_guard['expectedWholeMappingBinding'], 'mustApplyReviewedV2CASFirst': bind(V2 / 'source-component-five-cell-and-three-mapping-CAS.author.json'), 'expectedAfterV2WholeDecisionCell': before, 'jsonPointer': '/decisions/' + str(di), 'conditionalProposedWholeDecisionCell': after, 'conditionalCompatibilityMappingAddition': {'legacyGoalId': sid, 'canonicalGoalId': target, 'matchType': match, 'reviewDecisionId': sid}, 'wholeSourceCell': source_cell, 'intendedChosenView': views[i]['wholeView'], 'appliesToSelectedProgramOnly': True, 'currentlyInOperativeMappedDecision': False, 'applyHOLD': 'Normal direct mapped source facets do not express actual selection. Do not feed this proposed child edge to ordinary source compiler/index until the selected-source registration contract is resolved.', 'fullOtherOriginalDecisionPartnersRetained': True, 'scientificReviewPending': True})
write(Path('candidate/three-conditional-full-source-decision-and-mapping-CAS.author.json'), {'role': 'Three whole conditional source components, not operative source coverage', 'conditionalSourceDecisionCAS': conditional, 'fullRPGoalSourceUnion': [rp_cells[0]['id'], rp_cells[2]['id']], 'fullSNGoalSourceCell': sn_class_cell['id'], 'noNewDirectSynthesisSourceEdges': True, 'noClassificationMeaningInferredFromExistingSpectraOrReactionComparisons': True, 'acceptedV2ThreeMappingCorrectionsRetained': True, 'allLegacySummariesRetainedWithoutNewCountUnits': True, 'doNotClaimMergedSourceUnionOrCourseCompleteness': True, 'activeWrites': False})

# Two complete optional formation duties remain whole drafts within the HOLD.
# They are not added to canonical goals, views, ledgers or mapping decisions.
held_keys = ['canonical_chemistry_upper_optional_aldol_formation', 'canonical_chemistry_upper_optional_carbonyl_n_nucleophile_condensation']
held_ids = [str(uuid.uuid5(uuid.UUID(CARBONYL), key)) for key in held_keys]
held = []
for i, (id_, key) in enumerate(zip(held_ids, held_keys)):
    held.append({'id': id_, 'shortKey': key, 'title': ['Aldolbildung durch nukleophile Addition erklären', 'Bildung von Iminen, Oximen und Hydrazonen erklären'][i], 'titleEn': ['Explain aldol formation through nucleophilic addition', 'Explain formation of imines, oximes and hydrazones'][i], 'description': ['Die lernende Person kann die Bildung eines Aldols aus geeigneten Carbonylverbindungen über Enolatbildung und nukleophile Addition erklären und dabei die neue C–C-Bindung sowie die entstandene Hydroxygruppe und die erhaltene Carbonylgruppe verfolgen.', 'Die lernende Person kann die Bildung von Iminen, Oximen und Hydrazonen aus vorgegebenen Carbonylverbindungen und geeigneten Stickstoff-Nukleophilen über Addition und Wasserabspaltung erklären und Produktstruktur sowie Stoffbilanz darstellen.'][i], 'descriptionEn': ['The learner can explain aldol formation from suitable carbonyl compounds through enolate formation and nucleophilic addition, tracing the new C–C bond, the formed hydroxy group and the retained carbonyl group.', 'The learner can explain formation of imines, oximes and hydrazones from supplied carbonyl compounds and suitable nitrogen nucleophiles through addition and loss of water, representing product structure and material balance.'][i], 'weight': 1, 'type': 'atomic', 'tags': ['LK', 'canonical', 'SekII'], 'contains': [], 'requires': ['6d3a2bad-8c67-5964-a720-375f138adaba', '1c1420c2-a8e2-520f-8015-6df637a973bd'], 'examples': [], 'dimensionTags': {'framework': 'canonical-gymnasium-chemistry', 'demandLevel': 'AB2', 'processCompetencies': ['PK2_MODELLIEREN', 'PK4_KOMMUNIZIEREN'], 'guidingIdeas': ['BC_AUFBAU', 'BC_REAKTION'], 'phase': 'Q1', 'area': 'Carbonylverbindungen', 'topicCode': ['CANONICAL.CHEMISTRY.UPPER.OPTIONAL.ALDOL_FORMATION', 'CANONICAL.CHEMISTRY.UPPER.OPTIONAL.CARBONYL_N_NUCLEOPHILE_CONDENSATION'][i]}, 'applicability': {'jurisdiction': ['DE-RP']}, 'extendedData': {'applicabilityMappingInheritance': 'boundary', 'provenance': {'sourceLandscapeId': rp_extraction['sourceLandscapeId'], 'sourceGoalId': rp_carbonyl_cell['id']}}})
write(Path('whole-RP33-source-and-two-entire-optional-duty-HOLD.author.json'), {'wholeOriginalSourceCell': rp_carbonyl_cell, 'heldWholeGoalDrafts': held, 'idDerivationOnlyReservedForHeldDrafts': {'namespace': CARBONYL, 'names': held_keys}, 'oldThreeWholeMappingPartners': [by[t] for t in next(row['proposedAfterWholeCell'] for row in rp_map['decisionCellCompareAndSwap'] if row['proposedAfterWholeCell']['sourceGoalId'] == rp_carbonyl_cell['id'])['canonicalGoalIds']], 'genuineRemainingDuty': 'The actual optional source demands formation of aldols and formation of imines/oximes/hydrazones. Existing alkene/halogen mechanisms, SN1/SN2 comparison and halogenoalkane substitution do not prove these product formations.', 'chemistryOperatorBoundary': 'Aldol formation uses C–C bond-forming nucleophilic addition. The N-nucleophile families share the carbonyl addition/elimination condensation pattern; source wording calls it nucleophilic substitution. It is not inferred to be SN1/SN2 or halogenoalkane chemistry.', 'status': 'HOLD — complete optional formation target drafts; scientific/atomicity/operator and actual chosen extension reviews required', 'heldDraftsInCanonicalCAS': False, 'heldDraftsInViewsOrMappedSourceDecisions': False, 'existingRP33RowsAndOtherPartnersNotDeletedForScore': True, 'noFullRP33CoverageClaim': True})

closed_scope_schema = read(Path('contracts/curriculum-package/v1/composition-view.schema.json'))['$defs']['scope']
write(Path('full-selected-program-scope-conditions-and-four-HOLD-disposition.author.json'), {'existingReleaseViewScopeContract': bind(Path('contracts/curriculum-package/v1/composition-view.schema.json')), 'acceptedScopeKeys': sorted(closed_scope_schema['properties']), 'additionalScopePropertiesAllowed': closed_scope_schema['additionalProperties'], 'runtimeIndexSelectionBoundary': [bind(Path('app/scripts/goalBookOriginalSources.ts')), bind(Path('app/scripts/goalBookSourceAtlasInputs.ts'))], 'RPSelectionRule': {'P': 'Full source content required', 'WP': 'Explicit selection; LK at least two WP framework blocks with at least30hours, GK at least one with at least9hours', 'W': 'Unselected WP becomes W; selected W need not cover every item but must have sufficient breadth/depth and convey essentials. It is not permission to discard chosen duties.', 'selectedRP62LK': 'Fundamentum classification plus Additum azo synthesis mechanism and at least two further classes; other classes do not require mechanisms.', 'selectedGKFundamentum': 'Separate source duty; the proposed LK goal with minimum-two-additional-class Additum does not certify it.'}, 'SNSelectionRule': {'wholePrimaryPreface': 'An additional elective learning area of two weeks may be addressed; actual selection is not established by LK/year alone.', 'selectedWB1': 'Goals/content of the chosen learning area retain their operator demands; remarks are recommendations. The classification view is only one bounded duty, not the whole WB1 including experiments.'}, 'HOLDDisposition': [{'id': 'RP6.2_SELECTED_SCOPE', 'authorProgress': 'Whole3-cell source union represented by two distinct intended targets and an exact valid review view.', 'remainingHOLD': 'Actual committed selection and source registration still unresolved; no general RP-LK mapped edge or view widening.'}, {'id': 'RP_CLASSIFICATION_OPERATOR', 'authorProgress': 'Whole new RP criteria-classification goal preserves presentation/criteria and at least two further LK classes. Official Vorstellung and author assessed classification are explicitly distinguished.', 'remainingHOLD': 'Independent goal/operator review plus actual selected-program registration; GK-W source is not certified by LK Additum target.'}, {'id': 'SN_CHROMOPHORE_CLASSIFICATION_OPERATOR', 'authorProgress': 'Separate whole model-based structural classification goal and bounded WB1 review view; all seven current source cells and whole primary context retained.', 'remainingHOLD': 'Independent goal/model review, real WB choice and other WB1 target/experiment obligations.'}, {'id': 'RP3.3_OPTIONAL_PRODUCT_CONTEXT', 'authorProgress': 'Two complete separate optional formation duty drafts exposed; old unrelated mechanisms not represented as full coverage.', 'remainingHOLD': 'The two drafts remain outside canonical/mapping/views until scientific granularity, optional extension and full source integration are resolved.'}], 'noScopeKeysCoreFlagsOrCourseNamesInvented': True, 'noTeacherOrLearnerSelectionAssumed': True, 'noWholeSourceCoveragePass': True, 'activeWrites': False})

# Exact hashes of full primary page text are small and portable provenance;
# cached PDF files are informational, not new build dependencies.
doc_specs = [('RP', 'curricula/DE/Gymnasium/input/RP/Chemie_Sekundarstufe_II_MSS_2022.pdf', [19,20,39,40,47,48]), ('SN', 'curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-chemie-sachsen-2025.pdf', [4,16,60])]
primary = []
for jurisdiction, path, pages in doc_specs:
    entries = []
    for page in pages:
        text = subprocess.check_output(['pdftotext', '-f', str(page), '-l', str(page), '-layout', path, '-'], cwd=ROOT)
        entries.append({'physicalPage': page, 'wholeExtractedPageTextSha256': 'sha256:' + hashlib.sha256(text).hexdigest(), 'wholeTextBytes': len(text)})
    primary.append({'jurisdiction': jurisdiction, 'cachedPrimaryPDFInformationalOnly': path, 'actualPDFSha256': bind(Path(path))['sha256'], 'actualWholeTextPagesRead': entries, 'notVisualAcceptance': True})
write(Path('checks/full-primary-context-read-and-immutable-inputs.actual.json'), {'readAtUTC': NOW, 'primaryContext': primary, 'exactV1Seal': bind(V1 / 'FINAL.finite-inactive-author.freeze.json'), 'exactV2AuthorSeal': bind(V2 / 'FINAL.finite-inactive-source-view-author.freeze.json'), 'exactIndependentV2FinalSeal': bind(PEER / 'FINAL.independent-source-view-remediation.freeze.json'), 'exactIndependentV2WholeReport': bind(PEER / 'SCIENTIFIC.REMEDIATION.REPORT.md'), 'exactSynthesisChildImageAuthorSeal': bind(IMAGE / 'FINAL.finite-two-actual-child-images-author.freeze.json'), 'activeCanonicalObservationNotCandidateInput': bind(Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')), 'copiedWholeCanonicals': 0, 'activeWrites': False})
write(Path('rationale.distinct-whole-goals-and-holds.author.md'), '# V3: vollständige Quellenpflichten als begrenzte Autorenentwürfe\n\nRP-Vorstellung von Klassen und Einteilungsmöglichkeiten und SN-Anwendung des Chromophor-Modells sind verschiedene assessable Kompetenzen. Die beiden ganzen neuen Zielvorschläge erhalten ihre eigenen Operatoren; RP-Klassifizieren ist eine offengelegte Operationalisierung des amtlichen Vorstellungsinhalts. Die ausgewählten LK-Inhalte enthalten Azofarbstoffe und mindestens zwei weitere Klassen; letztere werden nicht zu mechanistisch geforderten Synthesen umgedeutet. SN behält die strukturelle Modellanwendung, mit den primär genannten Familien als Beispielen. Ein Absorptionsspektrum, ein mechanistischer Vergleich oder die beiden Syntheserouten ersetzt diese Zieloperationen nicht.\n\nDie zwei neuen Klassifikationsziele und der kleine ganze Farbstoffcluster-CAS sind Vorschläge nach dem unveränderten V1-Split. Ihre wissenschaftlichen A-/D-/P-/M-/V-Nachweise sind offen. Die drei Quellen-CAS sind bedingt und nicht operativ: keine neue Kindkante wird in normale mapped-Entscheidungen geschrieben. Bestehende3Mapping-,4Locator- und21View-Korrekturen von V2 bleiben exakt erhalten. Die zwei gültigen Modul-Prüfviews stellen beabsichtigte Inhalte dar, sind aber weder registrierte Defaultansichten noch Belege einer tatsächlichen Auswahl. RP6.2 ist eine vollständige beabsichtigte LK-Union aus Klassifikation und Azosynthese; die SN-Ansicht ist ausschließlich die einzelne WB1-Klassifikationspflicht, keine Erledigung des ganzen Wahlbereichs.\n\nDie normalen Scope-Schlüssel erfassen Schulform, Land, Stufe, Kursprofil und Dauer. Sie drücken weder gewählten WP/W-Baustein noch WB-Auswahl aus. V3 erfindet dafür keinen Schlüssel, Kursnamen, Core-Schalter oder allgemeine Berechtigung. Gewähltes RP-W muss weiterhin hinreichende Breite und Tiefe wahren. Die neue LK-Variante erledigt das GK-Fundamentum nicht. Nationale Prüfung oder ganze kanonische Nachfahren sind keine Landes-/Kursfreigabe.\n\nBei RP3.3 sind die vollständigen Aldol- und N-Nukleophil-Kondensationsanforderungen als getrennte ganze optionale Pflichtentwürfe sichtbar. Alte Halogenalkan-/SN1/SN2-Ziele sind kein Vollnachweis. Die Entwürfe werden weder dem Kanon noch Ansichten oder Quellenkanten hinzugefügt; damit bleibt ein konkreter ganzer HOLD bestehen. Ebenso werden generische Abschlussaufgaben nicht automatisch um ungewählte optionale Atome erweitert.\n\nDie Wiederverwendung von V1/V2 und beiden Kinder-PNGs wird auf exakte Bytes geprüft. Root allein kombiniert und misst die normale Quellenprojektion und ihre Scopes. Dieser Autorstand erhebt keine Quellen-Vollständigkeitsfreigabe, keinen integrierten Nenner, keine unabhängige Stimme, keine aktive Änderung, keinen Git-Schritt oder M7-Abschluss.\n')
print(json.dumps({'classificationGoalIds': ids, 'newCanonicalGoalProposals': 2, 'heldWholeFormationDraftsNotInCanonical': 2, 'conditionalSourceCells': len(conditional), 'nonoperativeReviewViews': len(views), 'activeWrites': False}))
