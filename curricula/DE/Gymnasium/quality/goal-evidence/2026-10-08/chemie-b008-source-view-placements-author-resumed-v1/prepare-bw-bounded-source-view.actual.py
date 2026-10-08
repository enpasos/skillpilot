# SPDX-License-Identifier: Apache-2.0
"""Prepare a bounded, inactive BW source/view candidate; never write active inputs."""
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import fitz

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
PREVIOUS = OWN.parent / 'chemie-b008-sl-specific-source-continuation-author-root-20261008-v21'
V12 = OWN.parent.parent / '2026-10-07/chemie-b008-current169-routing-placement-author-v12'
assert not (OWN / 'author.final.freeze.json').exists()

def read(p):
    return json.loads(p.read_text())

def bind(p):
    data = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def write(p, value):
    assert p.is_relative_to(OWN)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def snapshot(source, filename):
    target = OWN / 'inputs' / filename
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(source.read_bytes())
    return bind(target)

previous_path = PREVIOUS / 'candidate/canonical.current504-sl-source-metadata.author-candidate.json'
previous = read(previous_path)
candidate = deepcopy(previous)
by_id = {g['id']: g for g in candidate['goals']}
routine_ids = read(V12 / 'current169-protected-guard-and-field-intents.author.json')['routineGoalIds']
active_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
registry_path = ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
registry = read(registry_path)
chemistry = next(s for s in registry['subjects'] if s['subject'] == 'chemie')
active_inputs = [snapshot(active_path, 'active-chemistry.json.bin'), snapshot(ROOT / chemistry['semanticKindLedgerPath'], 'active-kinds.json.bin'), snapshot(ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json', 'active-qa.json.bin'), snapshot(registry_path, 'active-rollout-registry.json.bin')]
protected_active = [bind(ROOT / s['landscapePath']) for s in registry['subjects'] if s['subject'] in {'mathematik', 'physik', 'chemie'}]
extraction_path = ROOT / 'curricula/DE/Gymnasium/input/BW/lower-secondary/source-extraction/DE_BW_CHEMIE_SEKI_BP2016_V2.source-extraction.json'
mapping_path = ROOT / 'curricula/DE/Gymnasium/mapping/DE-BW/lower-secondary/bw_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json'
extraction = read(extraction_path)
original_mapping = read(mapping_path)
source_goals = {g['id']: g for g in extraction['sourceGoals']}
passages = {p['id']: p for p in extraction['passages']}
snapshot(extraction_path, 'BW-SekI.source-extraction.json.bin')
snapshot(mapping_path, 'BW-SekI.original-mapping.json.bin')
pdf_path = ROOT / extraction['sourceDocument']['path']
pdf = fitz.open(pdf_path)
# Complete pages actually inspected by this author. Keep receipts and concise
# paraphrases, not the complete copyrighted curriculum text.
page_notes = {
    5: 'The introductory educational remit connects chemistry, products, human life, technology and ethical consequences.',
    6: 'Career orientation introduces fields and possible interests. It does not require a personal career-choice verdict; media use and source judgement are separate.',
    7: 'Content and process competencies are combined in a spiralling curriculum; process skills are not separate semester-specific material.',
    8: 'Process competencies are developed cumulatively through the end of upper secondary. This is not evidence that all upper demands belong in SekI.',
    9: 'Questions lead to consciously planned, actually performed and evaluated experiments. Student practical work and safe handling remain real duties.',
    10: 'Information and presentation contribute to independent learning. Basisfach and Leistungsfach have different upper-secondary demands.',
    11: '2.1(1-5): observe, formulate questions and hypotheses, plan hypothesis tests and actually perform qualitative/quantitative experiments. The whole list also retains apparatus, validity and model duties.',
    12: '2.2(1-3,7-10): research, select, transform representations, document and present, discuss societal meaning and reflect team work. These are cumulative contextual witnesses, not newly invented source IDs.',
    13: '2.3(6,8-11): discuss significance, describe application areas or occupations, weigh ecological/economic arguments and use safety knowledge. No full personal career-choice competence is established.',
    15: '3.2.1.1(1) requires real investigations of the full property list; (4) requires planning and actual separation. Crossreferences explicitly connect (4) to 2.1(4-6).',
    16: '3.2.1.1(5) retains the industrial raw-material-to-product path and communication/source process references. The other content rows remain intact.',
    17: '3.2.1.1(12) retains every listed organic substance and property/use explanation; (13) distinguishes ethanol benefits and risks with discussion/evaluation references.',
    21: '3.2.2.1(2) retains all named reactants, real planning/performance, protocols and contextual interpretation. (6) separately retains every prescribed actual identification test.',
    23: '3.2.2.2(2): performance is required; only evaluation is expressly guided. It cannot be recast as a wholly guided performance requirement. Titration and calculation duties remain separate.',
    25: '3.2.2.3(7-8): actual model experiments and fire protection, plus comparison of every named fuel with CO2 and energy evidence; these specific duties survive generic routine mappings.',
    43: 'The operator table distinguishes carrying out an instruction from evaluating evidence and discussing opposed arguments. An operator alone does not prove every canonical aspect.',
    44: 'The operator table defines planning as developing a solution route and investigating as purposeful exploration; no automatic transfer of full upper independence follows.',
}
readings = []
for physical, note in page_notes.items():
    page = pdf[physical - 1]
    text = page.get_text()
    readings.append({'officialDocument': extraction['sourceDocument'], 'sourceDocumentBinding': bind(pdf_path), 'physicalPage1Based': physical, 'printedPage': physical - 2, 'wholePageTextSha256': hashlib.sha256(text.encode()).hexdigest(), 'pageTextCharacters': len(text), 'actualAuthorWholePageReading': True, 'authorObservation': note, 'independentSourceApproval': False})
write(OWN / 'primary/bw-actual-whole-pages-reading.receipt.json', {'role': 'Actual author reading of complete process/content/operator pages, no independent approval', 'readings': readings, 'sourceTextCopiedInFull': False})

# Use existing content IDs only. General process/operator context remains a
# bounded primary-document witness and never receives an invented source ID.
items = [
    ('8362bfb0', 'lower-chemical-question-hypothesis', 15, [11, 43, 44], 'A planned separation provides a concrete question/test context under 2.1(3-4). The explicit formation and counterevidence aspects are supported by cumulative process context, not literally by the content bullet alone.'),
    ('068932b8', 'lower-chemical-question-hypothesis', 21, [11, 43, 44], 'The source explicitly links actual reaction planning to hypothesis-testing process 2.1(4). The full reactant list and concrete performance remain independent whole source duties.'),
    ('092ffa8b', 'lower-guided-hypothesis-investigation', 15, [9, 11, 43], 'Actual property experiments support the performance component. A predetermined instruction is an allowed didactic route under the official carry-out operator; this source does not require exclusively guided performance or itself certify hypothesis interpretation.'),
    ('a4e7e324', 'lower-guided-hypothesis-investigation', 23, [9, 11, 43], 'Actual mass/mass-ratio experiments support performance; the phrase under instruction modifies evaluation only. Guided performance is a candidate learning route, not a relabelling of that source qualifier.'),
    ('8362bfb0', 'lower-independently-planned-hypothesis-investigation', 15, [9, 11, 43, 44], 'Planning AND real execution of a separation are retained. Development of a solution route supports a bounded independent-planning component; the generic routine never replaces separating the prescribed mixture.'),
    ('068932b8', 'lower-independently-planned-hypothesis-investigation', 21, [9, 11, 43, 44], 'The source requires planning, actual performance and a protocol for named reaction examples, linked to 2.1(4-5). Variable/comparison choice belongs to the authored operationalization, pending independent review.'),
    ('303db451', 'chemical-applications-society', 17, [5, 12, 13, 43], 'Actual uses must be explained from properties for every named organic substance. The societal discussion component is cumulative 2.2(8-9)/2.3(6), not a complete personal career-choice claim.'),
    ('cf1b3dcc', 'chemical-applications-society', 16, [5, 12, 13, 43], 'An industrial raw-material-to-use pathway is a specific chemical application, connected to societal application and evaluation operators. Preserve the entire pathway and its content partners.'),
    ('1e95d177', 'chemical-applications-society', 17, [12, 13, 43], 'Ethanol benefits and risks connect an actual application to individual/social significance, with explicit communication and evaluation references; this is not permission to omit either benefit or risk.'),
    ('c2e07d49', 'chemical-applications-society', 25, [12, 13, 43], 'Energy-carrier evaluation explicitly requires CO2 and reaction-energy comparison for all named fuels. It supplies one societal/environmental component while the complete quantitative fuel-comparison duty remains.'),
    ('cf1b3dcc', 'sek1-source-information', 16, [12, 43], 'The industrial pathway source expressly links to research/selection processes 2.2(1-2). The lower information routine is used only as an explicit prerequisite in this candidate view; no target or completion scope is inferred from requires.'),
    ('f48a126a', 'sek1-source-information', 15, [12, 43], 'Characteristic property combinations explicitly link to 2.2(1-3). Source selection is a partial component; naming the full substance set remains a distinct source content obligation.'),
]
components = []
for suffix, key, page, operator_pages, rationale in items:
    matches = [g for g in source_goals.values() if g['id'].endswith('-' + suffix)]
    assert len(matches) == 1
    g = matches[0]
    components.append({'sourceGoalId': g['id'], 'candidateKey': key, 'canonicalGoalId': routine_ids[key], 'wholeOriginalSourceGoal': g, 'wholeOriginalPassage': passages[g['passageId']], 'specificPhysicalPage': page, 'specificPrintedPage': page - 2, 'primaryContextPhysicalPages': operator_pages, 'boundedComponentRationale': rationale, 'matchType': 'partial', 'wholeSourceDutyClosure': False, 'independentSourceApproval': False})
write(OWN / 'bw-specific-source-components.author-candidate.json', {'role': 'Bounded author source components with complete existing source rows and partners retained', 'extraction': bind(extraction_path), 'mapping': bind(mapping_path), 'primaryReadings': bind(OWN / 'primary/bw-actual-whole-pages-reading.receipt.json'), 'components': components, 'generalOperatorContextHasNoInventedSourceIds': True, 'sourceCoverageApproval': False})

metadata = []
for key in sorted({c['candidateKey'] for c in components}):
    goal = by_id[routine_ids[key]]
    before = deepcopy(goal['applicability'])
    assert 'DE-BW' not in before['jurisdiction']
    goal['applicability']['jurisdiction'].append('DE-BW')
    metadata.append({'goalId': goal['id'], 'candidateKey': key, 'before': before, 'after': deepcopy(goal['applicability']), 'decisionStatus': 'author_candidate_pending_independent_source_and_placement_review'})
candidate_path = OWN / 'candidate/canonical.current504-bw-source-view.author-candidate.json'
write(candidate_path, candidate)
assert len(candidate['goals']) == 504
for old in previous['goals']:
    new = by_id[old['id']]
    assert {k: v for k, v in old.items() if k != 'applicability'} == {k: v for k, v in new.items() if k != 'applicability'}

old_native = read(PREVIOUS / 'actual-native43-source-view-findings-three-SL-models-and-current177-contexts.json')
old_row = next(v for v in old_native['actual43SourceViews'] if v['viewId'] == 'de-gym-chemie-bundesweit-source-de-bw-seki')
old_view_path = ROOT / old_row['afterViewBinding']['path']
view = read(old_view_path)
groups = {'91238ba1-5c63-50c7-a4fd-9bbe492c6b61': ['lower-chemical-question-hypothesis', 'lower-guided-hypothesis-investigation', 'lower-independently-planned-hypothesis-investigation'], '542822de-cb96-56cf-a487-0fc3b5820f57': ['chemical-applications-society']}
replacements = []
def walk(nodes):
    result = []
    for old in nodes:
        new = deepcopy(old)
        if new.get('kind') == 'goalEntry' and new.get('goalId') in groups:
            children = [{'kind': 'goalEntry', 'goalId': routine_ids[k]} for k in groups[new['goalId']]]
            result.extend(children)
            replacements.append({'originalNode': old, 'explicitTargetChildren': children, 'wholeFamilySourceClosure': False})
        else:
            if 'children' in new:
                new['children'] = walk(new['children'])
            result.append(new)
    return result
view['rootNodes'] = walk(view['rootNodes'])
view['rootNodes'].append({'kind': 'structure', 'id': 'bw-b008-explicit-source-information-prerequisite', 'label': 'Voraussetzung der Anwendungsdiskussion', 'children': [{'kind': 'goalEntry', 'goalId': routine_ids['sek1-source-information'], 'projectionRole': 'prerequisiteOnly'}]})
assert len(replacements) == 2
view_path = OWN / 'source-view-candidates/de-gym-chemie-bundesweit-source-de-bw-seki.bounded-author-candidate.json'
write(view_path, view)

mapping = deepcopy(original_mapping)
added = []
seen = {(r['legacyGoalId'], r['canonicalGoalId']) for r in mapping['mappings']}
for component in components:
    pair = (component['sourceGoalId'], component['canonicalGoalId'])
    if pair in seen:
        continue
    row = {'legacyGoalId': pair[0], 'canonicalGoalId': pair[1], 'matchType': 'partial', 'reviewDecisionId': pair[0]}
    mapping['mappings'].append(row)
    added.append(row)
    seen.add(pair)
affected = {c['sourceGoalId'] for c in components}
for decision in mapping['decisions']:
    if decision['sourceGoalId'] not in affected:
        continue
    old = deepcopy(decision)
    decision['canonicalGoalIds'] = list(dict.fromkeys(r['canonicalGoalId'] for r in mapping['mappings'] if r['legacyGoalId'] == decision['sourceGoalId']))
    decision.update({'decision': 'needs_view_placement_review', 'reviewer': None, 'reviewedAt': None, 'rationale': 'AUTHOR candidate for bounded BW content/process components and explicit SekI placement. All original whole source and content partners remain retained; the general process paragraph is not a fabricated source ID or automatic whole-child approval.', 'historicalDecisionBeforeCandidate': old})
mapping.update({'reviewId': mapping['reviewId'] + '.b008-resumed-bw-author-v1', 'status': 'author_candidate_pending_independent_source_and_placement_review', 'summary': {'allHistoricalMappingsExactAndRetained': True, 'partialChildBindingsAdded': len(added), 'pendingCurrentSourceDecisionIds': sorted(affected), 'newIndependentSourceApproval': 0, 'wholeSourceIdsDeletedOrInvented': 0, 'ordinaryAtlasDecisionProjectionRequiresSeparateActualReview': True}})
mapping_candidate_path = OWN / 'candidate-source-mappings/BW-SekI.source-mapping.author-candidate.json'
write(mapping_candidate_path, mapping)
assert mapping['mappings'][:len(original_mapping['mappings'])] == original_mapping['mappings']
assert {d['sourceGoalId'] for d in mapping['decisions']} == set(source_goals)

inventory_path = V12 / 'exact-original1646-current-source-witness-and-primary-review-routes.author-input.json'
inventory = read(inventory_path)
bw_original = [d for d in inventory['originalWholeDuties'] if 'DE-BW/lower-secondary' in d['mappingPath']]
assert len(bw_original) == 5
write(OWN / 'original-whole-duty-and-program-placement.obligations.json', {'role': 'Whole source, program scope and placement obligations retained; no national closure', 'national1646OriginalDutyInventory': bind(inventory_path), 'wholeFiveOriginalBWFamilyDuties': bw_original, 'wholeBWSourceGoalCount': len(source_goals), 'wholeOriginalMappingCount': len(original_mapping['mappings']), 'allSourceGoalIdsExactlyRetained': sorted(source_goals), 'wholePartnerMappingsExactRetained': True, 'programPlacementProposal': {'status': 'author_candidate_pending_independent_source_and_placement_review', 'jurisdiction': 'DE-BW', 'schoolForm': 'Gymnasium', 'stage': 'SekI', 'originalProgramUnit': '3.2 Klassen 8/9/10', 'originalYearRange': [8, 9, 10], 'fixedIndividualYear': None, 'durationModel': None, 'durationUncertaintyNotRelabelled': True, 'basis': 'Original source 3.2 and 3.2.0, physical p15; cumulative process context remains explicit and bounded.'}, 'fourTargetKeys': list(groups['91238ba1-5c63-50c7-a4fd-9bbe492c6b61']) + groups['542822de-cb96-56cf-a487-0fc3b5820f57'], 'prerequisiteOnlyKeys': ['sek1-source-information'], 'wholeCareerChoiceCoverage': False, 'guidedEvaluationIsNotGuidedPerformance': True, 'allActuallyRequiredPerformanceAndNamedContentRemainObligations': True, 'existing35CPV009': 35, 'expectedTechnicalCPV009AfterOneBWView': 33, 'sourceReadiness': 'HOLD pending independent decisions and normal atlas', 'strictGain': 0, 'activeWrites': 0, 'humanApproval': False})
write(OWN / 'author.candidate-ready.entry.json', {'schemaVersion': 1, 'role': 'Neutral BW bounded source/view author candidate ready for independent review', 'createdAtUtc': datetime.now(timezone.utc).isoformat(), 'previousCandidate': bind(previous_path), 'wholeCandidate': bind(candidate_path), 'sourceComponents': bind(OWN / 'bw-specific-source-components.author-candidate.json'), 'sourceMappingCandidate': bind(mapping_candidate_path), 'beforeView': bind(old_view_path), 'candidateView': bind(view_path), 'explicitParentReplacements': replacements, 'exactFiveApplicabilityProposals': metadata, 'retainedWholeObligations': bind(OWN / 'original-whole-duty-and-program-placement.obligations.json'), 'readOnlyActiveInputs': active_inputs, 'protectedActiveLandscapes': protected_active, 'sourceApproval': False, 'strictGain': 0, 'activeWrites': 0, 'humanApproval': False})
print(json.dumps({'wholeCandidateGoals': len(candidate['goals']), 'sourceComponents': len(components), 'sourceIds': len(affected), 'partialMappingsAdded': len(added), 'targetRoutines': 4, 'prerequisiteOnlyRoutines': 1, 'metadataProposals': len(metadata), 'wholeOriginalBWSourceGoals': len(source_goals), 'sourceGatePromotions': 0, 'strictGain': 0, 'activeWrites': 0}))
