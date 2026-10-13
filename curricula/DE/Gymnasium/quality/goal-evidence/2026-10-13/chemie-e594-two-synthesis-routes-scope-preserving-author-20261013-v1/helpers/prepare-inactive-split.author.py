#!/usr/bin/env python3
# Apache-2.0. Finite mechanical transport of a bounded authored split.
import copy, gzip, hashlib, json, uuid
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
OWN = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e594-two-synthesis-routes-scope-preserving-author-20261013-v1')
NROOT = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-poly18-aro19-final-current231-source-native-author-root-20261013-v1')
CROOT = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-poly18-aro19-final-case-profile-binding-author-20261013-v1')
GID = 'e5941581-0aba-5354-b4b9-d0249d4538a8'
KEYS = ['canonical_chemistry_upper_dye_chemistry_azo_dye_synthesis', 'canonical_chemistry_upper_dye_chemistry_triphenylmethane_dye_synthesis']
IDS = [str(uuid.uuid5(uuid.UUID(GID), key)) for key in KEYS]
NOW = datetime.now(timezone.utc).isoformat()

def read(path):
    return json.loads((ROOT / path).read_text())

def bind(path):
    raw = (ROOT / path).read_bytes()
    return {'path': str(path), 'sha256': 'sha256:' + hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}

def write(path, data):
    dest = ROOT / OWN / path
    dest.parent.mkdir(parents=True, exist_ok=True)
    with dest.open('x') as stream:
        stream.write(data if isinstance(data, str) else json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    return str(OWN / path)

def snapshot(path, label):
    dest = OWN / 'inputs' / label
    out = ROOT / dest
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open('xb') as stream:
        stream.write((ROOT / path).read_bytes())
    return {**bind(path), 'snapshot': bind(dest)}

selector_path = NROOT / 'NEUTRAL.final-source-native.portable-input-selector.json'
selector = read(selector_path)
input_paths = [selector_path, Path(selector['candidateLandscape']['path']), Path(selector['normalSemanticLedger']['path']), Path(selector['whole37AuthorProfiles']['path']), Path(selector['whole74BilingualCases']['path']), Path(selector['sourceAttachments']['path']), Path('AGENTS.md'), Path('docs/concept/skill-graph/atomic-goal-visualizations.md')]
input_guards = [bind(path) for path in input_paths]
landscape = read(input_paths[1])
semantic = read(input_paths[2])
old_by = {g['id']: g for g in landscape['goals']}
old = old_by[GID]
assert len(landscape['goals']) == 523 and old['contains'] == [] and old['type'] == 'atomic'
assert all(cid not in old_by for cid in IDS)

children = []
for i, (cid, key) in enumerate(zip(IDS, KEYS)):
    child = copy.deepcopy(old)
    child.update(id=cid, shortKey=key, type='atomic', contains=[], weight=1)
    child.pop('resourceLinks', None)
    child['requires'] = list(old['requires']) + ['1c1420c2-a8e2-520f-8015-6df637a973bd']
    if i == 1:
        child['requires'].append('4961130b-1ee8-58f2-a319-dff0a864db6a')
    child['title'] = ['Azofarbstoff-Synthese mechanistisch darstellen', 'Triphenylmethanfarbstoff-Synthese mechanistisch darstellen'][i]
    child['titleEn'] = ['Represent azo-dye synthesis mechanistically', 'Represent triphenylmethane-dye synthesis mechanistically'][i]
    child['description'] = [
        'Die lernende Person kann die vollständige Syntheseroute eines Azofarbstoffs aus einem aromatischen primären Amin über Diazotierung und anschließende Azokupplung auf Teilchenebene mechanistisch darstellen und den Bindungsaufbau sowie die Atom- und Ladungsbilanz erklären.',
        'Die lernende Person kann die vollständige Syntheseroute eines Triphenylmethanfarbstoffs aus einem aromatischen Aldehyd und aktivierten aromatischen Kupplungspartnern über säurekatalysierte Kondensation zur Leukoverbindung und anschließende Oxidation zum Farbstoffkation auf Teilchenebene mechanistisch darstellen und die Reaktions- und Ladungsbilanz erklären.',
    ][i]
    child['descriptionEn'] = [
        'The learner can represent the complete synthesis route of an azo dye from an aromatic primary amine through diazotization and subsequent azo coupling mechanistically at particle level and explain bond formation and atom and charge balance.',
        'The learner can represent the complete synthesis route of a triphenylmethane dye from an aromatic aldehyde and activated aromatic coupling partners through acid-catalyzed condensation to the leuco compound and subsequent oxidation to the dye cation mechanistically at particle level and explain reaction and charge balance.',
    ][i]
    child['dimensionTags']['topicCode'] = ['CANONICAL.CHEMISTRY.UPPER.DYES.AZO_DYE_SYNTHESIS', 'CANONICAL.CHEMISTRY.UPPER.DYES.TRIPHENYLMETHANE_DYE_SYNTHESIS'][i]
    child['extendedData']['provenance']['canonicalSplitOriginGoalId'] = GID
    # Each child needs its own explicit component mappings: no parent mapping
    # or old broad dye-cluster source witness becomes full-route evidence.
    child['extendedData']['applicabilityMappingInheritance'] = 'boundary'
    children.append(child)

parent = copy.deepcopy(old)
parent.update(type='cluster', contains=IDS, requires=[], weight=2)
candidate = copy.deepcopy(landscape)
idx = next(i for i, g in enumerate(candidate['goals']) if g['id'] == GID)
candidate['goals'][idx] = parent
candidate['goals'][idx + 1:idx + 1] = children
by = {g['id']: g for g in candidate['goals']}
DYE = 'fa21e8e1-b430-54ad-9647-f763bc4137ba'
assert by[DYE]['weight'] == 11
by[DYE]['weight'] = 12
requires_consumers = []
for goal in candidate['goals']:
    if GID not in goal['requires']:
        continue
    original = copy.deepcopy(old_by[goal['id']])
    goal['requires'] = [new for oldid in goal['requires'] for new in (IDS if oldid == GID else [oldid])]
    coverage = goal.get('extendedData', {}).get('routeCoverage', {})
    if 'selectedAtomicGoals' in coverage:
        coverage['selectedAtomicGoals'] += 1
    requires_consumers.append({'beforeWholeGoal': original, 'afterWholeGoal': copy.deepcopy(goal), 'countDelta': len(goal['requires']) - len(original['requires']), 'rationale': 'Replace the former complete two-route atomic obligation by both complete children; retain every independent terminal prerequisite and its order.'})

changed_existing = [g['id'] for g in candidate['goals'] if g['id'] in old_by and g != old_by[g['id']]]
assert set(changed_existing) == {GID, DYE, '14577339-9e0c-5b44-8e47-91e1a4947367'}
write(Path('candidate/three-existing-whole-goal-CAS-and-two-new-whole-children.inactive-author.json'), {'sourceCanonicalBinding': bind(input_paths[1]), 'existingGoals': [{'expectedBeforeWholeGoal': old_by[gid], 'proposedAfterWholeGoal': by[gid]} for gid in changed_existing], 'newChildren': children})
write(Path('canonical-whole-goal-CAS-and-graph-impacts.author.json'), {
    'role': 'Inactive AUTHOR candidate; no scientific passes or independent votes',
    'sourceCanonicalBinding': bind(input_paths[1]),
    'expectedCurrentWholeNodeCount': 523,
    'idDerivation': {'method': 'UUIDv5', 'namespace': GID, 'names': KEYS, 'childIds': IDS, 'repositoryPrecedent': '2026-10-08/biologie-he9-contraception-parenthood-scope-preserving-split-author-20261008-v1'},
    'wholeExistingGoalCompareAndSwap': [{'expectedBeforeWholeGoal': old_by[gid], 'proposedAfterWholeGoal': by[gid]} for gid in changed_existing],
    'wholeNewChildren': children,
    'directContainsParentWholeBeforeAfter': {'before': old_by[DYE], 'after': by[DYE]},
    'requiresConsumerWholeBeforeAfter': requires_consumers,
    'parentOverviewLinkBytesPreserved': parent['resourceLinks'] == old['resourceLinks'],
    'parentOverviewSha256': 'sha256:a728cc442316a8028844ac7d48f15dc490e4f85882f002eab99c81f683b832f3',
    'retainedRootWeight': {'goalId': '442c31c5-c561-5c7a-90bb-2335d779175c', 'before': old_by['442c31c5-c561-5c7a-90bb-2335d779175c']['weight'], 'after': by['442c31c5-c561-5c7a-90bb-2335d779175c']['weight'], 'reason': 'Existing Chemistry root has legacy non-count weight 1.2; split preserves it. Only the existing count-based Farbstoffchemie aggregate changes 11 to 12.'},
    'sequencing': {'parentRequiresClearedAndMovedToChildren': True, 'oldAtomicPrerequisitesRetainedForBoth': old['requires'], 'addedBrønstedPrerequisiteBoth': '1c1420c2-a8e2-520f-8015-6df637a973bd', 'addedRedoxBalancePrerequisiteTriphenylmethane': '4961130b-1ee8-58f2-a319-dff0a864db6a', 'childToChildDependency': False, 'carbonylActivationTaughtWithinRoute': True, 'prerequisiteDirectionDoesNotInferMastery': True},
    'unchangedWholeExistingGoals': 520,
    'oldParentMasteryMustNotBeCopiedToBothChildren': True,
    'learnerStateReadOrWrite': False,
    'activeWrites': False,
})

# Semantic-kind proposals are classifications for an isolated author projection,
# not A judgments, D keep votes, P passes, M decisions or V approval.
semantic_candidate = copy.deepcopy(semantic)
for decision in semantic_candidate['decisions']:
    if decision['goalId'] == GID:
        decision['semanticKind'] = 'curricularArea'
        decision['decisionBasis'] = 'inactive-author-proposed-split-parent-classification; independent scientific reviews pending'
for child in children:
    semantic_candidate['decisions'].append({'goalId': child['id'], 'sourceFingerprint': 'PENDING_STOCK_FINGERPRINT', 'semanticKind': 'curricularAtomic', 'decisionStatus': 'authoritative', 'decisionBasis': 'inactive-author-proposed-child-classification for local projection only; independent scientific reviews pending'})
counts = Counter(d['semanticKind'] for d in semantic_candidate['decisions'])
semantic_candidate['counts'] = {**{kind: counts[kind] for kind in semantic['counts'] if kind != 'total'}, 'total': len(semantic_candidate['decisions'])}
assert semantic_candidate['counts']['total'] == 525 and semantic_candidate['counts']['curricularAtomic'] == 403
semantic_rows = [{'expectedBeforeWholeDecision': next((d for d in semantic['decisions'] if d['goalId'] == gid), None), 'proposedAfterWholeDecision': next(d for d in semantic_candidate['decisions'] if d['goalId'] == gid)} for gid in [GID, *IDS]]
write(Path('candidate/three-semantic-kind-decision-CAS.pending-stock-fingerprints.inactive-author.json'), {'sourceSemanticLedgerBinding': bind(input_paths[2]), 'rows': semantic_rows})
write(Path('semantic-kind-proposals-and-measured-counts.author.json'), {'beforeCounts': semantic['counts'], 'proposedCountsMeasuredFromAllDecisions': semantic_candidate['counts'], 'proposedSemanticKindChanges': [{'goalId': GID, 'before': 'curricularAtomic', 'after': 'curricularArea'}, *[{'goalId': cid, 'before': None, 'after': 'curricularAtomic'} for cid in IDS]], 'classificationWithinIsolatedProjectionDoesNotMeanScienceApproval': True, 'current523And402RemainAuthoritativeUntilIntegrated': True, 'activeWrites': False, 'newIndependentVotes': 0})

profiles = read(input_paths[3])
cases = read(input_paths[4])
old_profile = next(p for p in profiles['profiles'] if p['goalId'] == GID)
old_cases = [c for c in cases['cases'] if c['goalId'] == GID]
assert len(old_cases) == 2
write(Path('inputs/retained-e594-original-whole-profile-and-two-cases.exact-history.json'), {'profileFileBinding': bind(input_paths[3]), 'caseFileBinding': bind(input_paths[4]), 'originalWholeProfile': old_profile, 'originalWholeCases': old_cases, 'historicalOnlyNotTransferredAsApproval': True})
new_profiles = []
new_cases = []
transport = []
for i, cid in enumerate(IDS):
    expectation = copy.deepcopy(old_profile['profile']['expectations'][i])
    p = {'archetype': 'procedure', 'expectations': [expectation], 'coverageExpectations': {'requiredExpectationIds': [expectation['id']], 'alternativeExpectationGroups': [], 'minimumIndependentDemonstrations': 1, 'freshVariationRequired': True, 'independentTransferRequired': True}, 'variationAxes': [], 'applicationCaseBriefs': []}
    p['variationAxes'] = [
        {'id': 'v1', 'textDe': 'Aromatisches primäres Amin und Kupplungspartner', 'textEn': 'Aromatic primary amine and coupling partner'},
        {'id': 'v2', 'textDe': 'Elektronenpaarfluss, Ladungsbilanz und verfügbarer Donor', 'textEn': 'Electron-pair flow, charge balance and available donor'},
    ] if i == 0 else [
        {'id': 'v1', 'textDe': 'Aromatischer Aldehydrest', 'textEn': 'Aromatic aldehyde residue'},
        {'id': 'v2', 'textDe': 'Leukoverbindung, Farbstoffkation und Oxidationsbilanz', 'textEn': 'Leuco compound, dye cation and oxidation balance'},
    ]
    for case_index, oc in enumerate(old_cases, 1):
        nc = copy.deepcopy(oc)
        nc['goalId'] = cid
        nc['caseId'] = f'{cid[:8]}-case-{case_index}'
        nc['titleDe'] = [('Anilin, Diazotierung und Phenol-Kupplung' if case_index == 1 else 'Nitroanilin, Diazotierung und Aminodonor-Kupplung'), ('Benzaldehyd, Leukoverbindung und Oxidation' if case_index == 1 else 'Methylsubstituierter Aldehyd, Leukoverbindung und Oxidation')][i]
        nc['titleEn'] = [('Aniline, diazotization and phenol coupling' if case_index == 1 else 'Nitroaniline, diazotization and amino-donor coupling'), ('Benzaldehyde, leuco compound and oxidation' if case_index == 1 else 'Methyl-substituted aldehyde, leuco compound and oxidation')][i]
        chosen = [oc['rubric'][2], oc['rubric'][0]] if i == 0 else [oc['rubric'][1]]
        nc['rubric'] = []
        for j, criterion in enumerate(chosen, 1):
            rc = copy.deepcopy(criterion)
            origin_id = rc['criterionId']
            rc['criterionId'] = f"{nc['caseId']}-r{j}"
            for language in ['De', 'En']:
                rc.pop('taskSpan' + language)
            nc['rubric'].append(rc)
            transport.append({'oldCaseId': oc['caseId'], 'oldCriterionId': origin_id, 'childGoalId': cid, 'newCaseId': nc['caseId'], 'newCriterionId': rc['criterionId'], 'allScientificTaskAndRubricFieldsExact': True})
        for language in ['De', 'En']:
            nc['task' + language] = '\n'.join(f"{j}. {rc['taskClause' + language]}" for j, rc in enumerate(nc['rubric'], 1))
            nc['modelAnswer' + language] = '\n'.join(f"{j}. {rc['criterion' + language]}" for j, rc in enumerate(nc['rubric'], 1))
            for rc in nc['rubric']:
                clause = rc['taskClause' + language]
                start = nc['task' + language].index(clause)
                rc['taskSpan' + language] = {'start': start, 'end': start + len(clause)}
            data = oc['data' + language]
            if case_index == 1:
                azo_end = data.index('Triarylmethan:' if language == 'De' else 'Triarylmethane:')
                diazo_start = data.index('Vorgeschaltete Diazotierung' if language == 'De' else 'Preceding diazotization')
                nc['data' + language] = (data[:azo_end].strip() + ' ' + data[diazo_start:]) if i == 0 else ((('Nur Papiermechanismen, keine Ausführung. ' if language == 'De' else 'Paper mechanisms only, no execution. ')) + data[azo_end:diazo_start].strip())
            else:
                route_start = data.index('Eine zweite Route verwendet' if language == 'De' else 'Another route uses')
                spectator_start = data.index('Gegenionen sind Zuschauer' if language == 'De' else 'Counterions are spectators')
                diazo_start = data.index('Vorgeschaltete Diazotierung' if language == 'De' else 'Preceding diazotization')
                nc['data' + language] = (data[:route_start].strip() + ' ' + data[spectator_start:]) if i == 0 else ((('Papiermodell: ' if language == 'De' else 'Paper model: ')) + data[route_start:spectator_start].replace('Eine zweite Route verwendet', 'Die Route verwendet').replace('Another route uses', 'The route uses').strip() + ' ' + data[spectator_start:diazo_start].strip())
        nc['expectationIds'] = [expectation['id']]
        nc['maximumPoints'] = sum(rc['maximumPoints'] for rc in nc['rubric'])
        nc['sourceWholeCaseId'] = oc['caseId']
        new_cases.append(nc)
        p['applicationCaseBriefs'].append({'id': nc['caseId'], 'taskDemandDe': nc['dataDe'] + '\n' + nc['taskDe'], 'taskDemandEn': nc['dataEn'] + '\n' + nc['taskEn'], 'expectedPerformanceDe': nc['modelAnswerDe'], 'expectedPerformanceEn': nc['modelAnswerEn'], 'understandingFocusDe': expectation['essentialUnderstandingDe'], 'understandingFocusEn': expectation['essentialUnderstandingEn']})
    new_profiles.append({'goalId': cid, 'profile': p})
write(Path('positive/two-child.exact-route-profiles.author.json'), {'schemaVersion': 1, 'license': 'CC-BY-4.0', 'authorOnly': True, 'goalIds': IDS, 'profiles': new_profiles, 'newIndependentVotes': 0, 'masteryDecisionBoundary': 'Assess all aspects of this one complete route. One sufficiently rich multi-step transfer can establish them; two supplied case designs are alternatives for variation, not a mandatory task quota. Stop when sufficient evidence exists. No execution or mastery occurred.'})
write(Path('positive/four-child.complete-DEEN-cases.author.json'), {'schemaVersion': 1, 'license': 'CC-BY-4.0', 'authorOnly': True, 'goalIds': IDS, 'cases': new_cases, 'scientificCompletionClaim': False, 'newIndependentVotes': 0})
write(Path('positive/exact-whole74-whole37-split-transport.author.json'), {'originalProfilesBinding': bind(input_paths[3]), 'originalCasesBinding': bind(input_paths[4]), 'wholeOriginalFilesRemainUnchanged': True, 'profileExpectationBeforeAfter': [{'before': old_profile['profile']['expectations'][i], 'after': new_profiles[i]['profile']['expectations'][0]} for i in range(2)], 'exactRubricTransport': transport, 'allSixOriginalBilingualRubricDemandsRetainedOnce': len(transport) == 6, 'newChildCases': 4, 'twoCasesAreAlternativesNotQuota': True, 'unrelated36ProfilesAnd72CasesUnchangedAtOriginalBindings': True, 'combinedFutureCaseCatalogCountIfReplaced': 76, 'combinedFutureProfileCatalogCountIfReplaced': 38})

source = json.loads(gzip.decompress((ROOT / input_paths[5]).read_bytes()))
source_goal = next(g for g in source['goals'] if g['goalId'] == GID)
write(Path('inputs/e594.final-source-attachments.exact-whole-cells.json'), source_goal)
partitions = []
mapping_edits = {}
for witness in source_goal['finalCompiledWitnessesWithExactWholeCells']:
    sid = witness['wholeSourceCell']['id']
    if sid == '4fb9f93d-b53f-5e9a-9bd1-5d600f081091':
        child_indexes, strength, limit = [0, 1], 'complete-route obligation for both components as a union', 'BY C13-EA.2.6 explicitly requires both mechanistic syntheses at LK. No GK grant.'
    elif sid == 'rp-chem-sekii-rp-ch-sekii-2022-baustein-6-2-002-114423e7':
        child_indexes, strength, limit = [0], 'azo synthesis mechanism component', 'RP LK explicitly names azo dyes and synthesis mechanism; no triphenylmethane route entitlement.'
    elif sid == 'rp-chem-sekii-rp-ch-sekii-2022-baustein-6-2-001-f7732a59':
        child_indexes, strength, limit = [0], 'partial class/structure context only', 'RP LK classification examples name azo; classification is not full synthesis.'
    elif sid == 'rp-chem-sekii-rp-ch-sekii-2022-baustein-3-3-004-3794fee6':
        child_indexes, strength, limit = [1], 'partial carbonyl-reaction context only', 'RP LK carbonyl/condensation context names other products; no explicit triphenylmethane synthesis or oxidation obligation.'
    elif sid == 'sn-chem-sekii-sn-ch-jahrgangsstufe-12-leistungskurs-wb1-088-01-1b8987f0':
        child_indexes, strength, limit = [1], 'partial triphenylmethane class/structure context only', 'SN12 LK elective Wahlbereich only; structural classification is not full synthesis or a mandatory whole-course entitlement.'
    else:
        raise AssertionError(sid)
    proposed_cells = []
    for mi in child_indexes:
        for original_cell in witness['matchingMappingCells']:
            new_cell = copy.deepcopy(original_cell)
            new_cell['canonicalGoalId'] = IDS[mi]
            new_cell['matchType'] = 'partial'
            proposed_cells.append(new_cell)
    entry = {'exactWholeOriginalWitness': witness, 'proposedChildMappingCells': proposed_cells, 'retainedAggregateMappingCells': witness['matchingMappingCells'], 'sourceComponentStrength': strength, 'courseAndComponentLimit': limit, 'independentReviewPending': True, 'wholeSourceApproval': False, 'wholeCourseApproval': False}
    partitions.append(entry)
    mapping_path = Path(witness['exactMappingBinding']['path'])
    if mapping_path not in mapping_edits:
        mapping_edits[mapping_path] = {'before': read(mapping_path), 'after': read(mapping_path), 'witnesses': []}
    edit = mapping_edits[mapping_path]
    edit['after']['mappings'].extend(proposed_cells)
    for decision in edit['after']['decisions']:
        if decision.get('sourceGoalId') == sid:
            assert GID in decision['canonicalGoalIds']
            decision['canonicalGoalIds'].extend(IDS[mi] for mi in child_indexes if IDS[mi] not in decision['canonicalGoalIds'])
    edit['witnesses'].append(entry)

mapping_cas = []
for index, (path, edit) in enumerate(mapping_edits.items(), 1):
    after = edit['after']
    after['status'] = 'candidate'
    after['e594SplitAuthorProposal'] = {'createdAtUTC': NOW, 'newIndependentVotes': 0, 'independentReviewPending': True, 'originalParentCellsRetainedForAggregate': True, 'childCellsOnlyBoundedComponents': True, 'wholeSourceApproval': False, 'wholeCourseApproval': False}
    if 'summary' in after:
        summary = after['summary']
        if 'exactMappings' in summary:
            summary['exactMappings'] = sum(m.get('matchType') == 'exact' for m in after['mappings'])
        if 'partialMappings' in summary:
            summary['partialMappings'] = sum(m.get('matchType') == 'partial' for m in after['mappings'])
    decision_cas = []
    selected_source_ids = {w['exactWholeOriginalWitness']['wholeSourceCell']['id'] for w in edit['witnesses']}
    for decision_index, decision in enumerate(edit['before']['decisions']):
        if decision.get('sourceGoalId') in selected_source_ids:
            decision_cas.append({'jsonPointer': '/decisions/' + str(decision_index), 'expectedBeforeWholeCell': decision, 'proposedAfterWholeCell': after['decisions'][decision_index]})
    mapping_cas.append({'expectedWholeFileBinding': bind(path), 'appendAtMappingsLength': len(edit['before']['mappings']), 'appendedWholeMappingCells': after['mappings'][len(edit['before']['mappings']):], 'decisionCellCompareAndSwap': decision_cas, 'summaryCompareAndSwap': {'expectedBefore': edit['before'].get('summary'), 'proposedAfter': after.get('summary')}, 'authorMetadataAddition': after['e594SplitAuthorProposal'], 'sourceCells': sorted(selected_source_ids), 'exactExtractionBindings': [w['exactWholeOriginalWitness']['exactExtractionBinding'] for w in edit['witnesses']], 'originalAllMappingsPreserved': after['mappings'][:len(edit['before']['mappings'])] == edit['before']['mappings']})
write(Path('source-exact-cell-partition-and-whole-mapping-CAS.author.json'), {'role': 'Inactive component partition; independent source review remains required', 'exactFinalSourceAttachmentBinding': bind(input_paths[5]), 'partitions': partitions, 'wholeMappingCompareAndSwap': mapping_cas, 'parentAndChildrenKeepOriginalJurisdictionMetadata': old['applicability'], 'childLKTagsUnchanged': old['tags'], 'metadataIsNotNationalSourceApproval': True, 'childBoundaryPreventsAutomaticInheritedParentOrBroaderClusterSourceCredit': True, 'fullTriphenylmethaneSynthesisSourceWitnessOnlyExplicitBY': True, 'RPAndSNEvidenceNotPromotedToFullSynthesis': True, 'HEMetadataDoesNotCreateMissingHEWitness': True, 'activeWrites': False, 'newIndependentVotes': 0})

# Preserve existing complete authored scope wherever a former goalEntry names
# the whole combined objective. This is a structural view proposal only.
view_dirs = ['curricula/DE/Gymnasium/composition-views/chemie', 'app/scripts/config/goal-books/navigation', 'app/scripts/config/goal-books/source-views/de-gym-chemistry-national-atlas', 'curricula/DE/Gymnasium/quality/goal-description-review/chemie/review-views']
view_proposals = []
for directory in view_dirs:
    for path in sorted((ROOT / directory).glob('*.json')):
        rel = path.relative_to(ROOT)
        if GID not in path.read_text():
            continue
        before, after = read(rel), read(rel)
        changes = []
        def walk(obj, pointer=''):
            if isinstance(obj, dict):
                if obj.get('kind') == 'goalEntry' and obj.get('goalId') == GID:
                    prior = copy.deepcopy(obj)
                    obj['kind'] = 'canonicalSubtree'
                    changes.append({'jsonPointer': pointer, 'beforeWholeNode': prior, 'afterWholeNode': copy.deepcopy(obj)})
                for key, value in obj.items():
                    walk(value, pointer + '/' + str(key))
            elif isinstance(obj, list):
                for index, value in enumerate(obj):
                    walk(value, pointer + '/' + str(index))
        walk(after)
        if changes:
            view_proposals.append({'expectedWholeViewBinding': bind(rel), 'exactNodeChanges': changes})
write(Path('scope-view-whole-CAS.author.json'), {'role': 'Inactive structural proposal; canonicalSubtree exposes both previously required components', 'wholeViewProposals': view_proposals, 'viewFileCount': len(view_proposals), 'preservedScopeRolesNodeIdsOrderAndLabels': True, 'existingNationalAndOtherJurisdictionSourceProblemsNotClearedByThisSplit': True, 'fullCanonicalReviewViewAlreadyUsesCanonicalSubtree': True, 'allOldViewCountriesAreNotFreshSourceEntitlement': True, 'activeWrites': False})

def descendants(index, gid):
    out = set()
    pending = [gid]
    while pending:
        id_ = pending.pop()
        if id_ in out:
            continue
        out.add(id_)
        pending.extend(index[id_]['contains'])
    return out

context_ids = {GID, DYE, '442c31c5-c561-5c7a-90bb-2335d779175c', *IDS, *old['requires'], '1c1420c2-a8e2-520f-8015-6df637a973bd', '4961130b-1ee8-58f2-a319-dff0a864db6a'}
context_ids.update(g['id'] for g in candidate['goals'] if any(cid in g['requires'] for cid in IDS))
write(Path('whole-context-before-after-and-inherited-scope-effects.author.json'), {'wholeOriginalContextGoals': [g for g in landscape['goals'] if g['id'] in context_ids], 'wholeProposedContextGoals': [g for g in candidate['goals'] if g['id'] in context_ids], 'reversePrerequisitesNew': {cid: [g['id'] for g in candidate['goals'] if cid in g['requires']] for cid in IDS}, 'ancestorUniqueDescendants': [{'goalId': ancestor, 'before': len(descendants(old_by, ancestor)), 'after': len(descendants(by, ancestor))} for ancestor in [DYE, '442c31c5-c561-5c7a-90bb-2335d779175c']], 'terminalRequiresPreserveBothRoutes': requires_consumers, 'routeCoverageExistingOffsetPreserved': 'Terminal selectedAtomicGoals was 276 for 275 direct requires. Both fields increase by one after replacing one old route obligation with two children; existing offset is recorded, not silently interpreted as a corrected count.', 'noPublishedBookContextOrEvidenceBindingRecast': True, 'newChildrenNeedFreshDPAAndMAndActualV': True, 'changedTerminalAndNeighborPageContextNeedsRebindBeforeIntegration': True, 'masteryAndSourceCoverageDoNotFollowFromAncestorOrDependentMastery': True})

checks = {'checkedAtUTC': NOW, 'canonicalBefore': len(landscape['goals']), 'canonicalProposed': len(candidate['goals']), 'semanticCountsBefore': semantic['counts'], 'semanticCountsProposedMeasured': semantic_candidate['counts'], 'changedExistingGoalIds': changed_existing, 'unchangedExistingWholeGoalCount': sum(by[gid] == g for gid, g in old_by.items()), 'newChildIds': IDS, 'allOriginalOtherContainsAndRequiresExactExceptListedCoupling': True, 'allOriginalBilingualRubricClausesRetainedExactlyOnce': True, 'originalTwoRouteExpectationsRetainedExactly': True, 'newImagesOrVVotes': 0, 'independentScientificVotes': 0, 'activeWrites': False}
for edge in ['contains', 'requires']:
    state = {}
    def visit(gid):
        if state.get(gid) == 1:
            raise AssertionError(f'{edge} cycle at {gid}')
        if state.get(gid) == 2:
            return
        state[gid] = 1
        for ref in by[gid][edge]:
            assert ref in by, ref
            visit(ref)
        state[gid] = 2
    for gid in by:
        visit(gid)
    checks[edge + 'DAGAndAllReferencesValid'] = True
for oc in old_cases:
    for rc in oc['rubric']:
        matches = [c for c in new_cases if c['sourceWholeCaseId'] == oc['caseId'] for r in c['rubric'] if r['taskClauseDe'] == rc['taskClauseDe'] and r['taskClauseEn'] == rc['taskClauseEn'] and r['criterionDe'] == rc['criterionDe'] and r['criterionEn'] == rc['criterionEn']]
        assert len(matches) == 1
for c in new_cases:
    for r in c['rubric']:
        for lang in ['De', 'En']:
            span = r['taskSpan' + lang]
            assert c['task' + lang][span['start']:span['end']] == r['taskClause' + lang]
for guard in input_guards:
    assert bind(Path(guard['path'])) == guard, guard['path']
checks['originalSelectedInputBytesUnchanged'] = True
write(Path('checks/finite-author-structural-preservation.actual.json'), checks)
write(Path('inputs/finite-input-bindings.actual.json'), {'inputBindings': input_guards, 'capturedAtUTC': NOW, 'noIgnoredScratchOrPrivateLearnerInputs': True, 'allNewWrittenFilesInsideOwnRoot': True})
print(json.dumps({'canonicalProposed': len(candidate['goals']), 'curricularAtomicProposedMeasured': semantic_candidate['counts']['curricularAtomic'], 'unchangedExistingWholeGoals': checks['unchangedExistingWholeGoalCount'], 'sourceCellCount': len(partitions), 'mappingFiles': len(mapping_cas), 'viewFiles': len(view_proposals), 'profiles': len(new_profiles), 'completeBilingualCases': len(new_cases), 'activeWrites': False, 'newIndependentVotes': 0}))
