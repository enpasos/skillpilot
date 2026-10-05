"""Materialize one new, explicitly unadopted B010 source-remediation candidate."""
from pathlib import Path
import copy
import datetime
import hashlib
import json
import uuid

ROOT = Path.cwd()
OWN = Path(__file__).parent
if (OWN / 'author-remediation.freeze.manifest.json').exists():
    raise SystemExit('Frozen candidate: create a new version before materialization.')
REL = OWN.relative_to(ROOT).as_posix()
OLD = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b010-seven-current-source-description-candidate-v1'
PEER = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b010-seven-independent-source-description-review-a-v1'
CANON = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
HE = 'curricula/DE/Gymnasium/input/HE/lower-secondary/source-extraction/DE_HE_CHEMIE_SEKI_G9.source-extraction.json'
BY = 'curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_CHEMIE_GYMNASIUM_LEHRPLANPLUS.source-extraction.json'
HE_MAP = 'curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json'
IDS = ['72236f2c-771e-4ab6-933a-e549ee49d15b', '950c73c6-4ed1-488a-9267-1142e95e0055', 'e0e201bd-a1fd-5985-ab08-fd24c8655f3d', '16a80de2-b5e0-5467-a9b3-5860730d7d8b', '58486300-3f84-5aa1-9ed4-66186af62669', '414489cb-453e-5de4-ab0f-0fc01175e522', '1f5ee84f-245a-5a1e-a260-f960f26523e9']
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()

def read(path):
    return json.loads((ROOT / path).read_text())

def digest(path):
    return hashlib.sha256((ROOT / path).read_bytes()).hexdigest()

def write(name, value):
    (OWN / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

base = read(CANON)
by_id = {g['id']: g for g in base['goals']}
assert all(i in by_id for i in IDS)
proposed = copy.deepcopy(base)
out_id = {g['id']: g for g in proposed['goals']}
texts = read(str(PEER.relative_to(ROOT) / 'candidate-templates-a.review.json'))
five = texts['fiveRevisionVerdicts']
titles = {
    IDS[1]: ('Einfache Ionengitter modellieren und Stoffeigenschaften erklären', 'Model simple ionic lattices and explain material properties'),
    IDS[3]: (by_id[IDS[3]]['title'], by_id[IDS[3]]['titleEn']),
    IDS[4]: (by_id[IDS[4]]['title'], by_id[IDS[4]]['titleEn']),
    IDS[5]: ('Gipsbildung bei Rauchgaswäsche deuten', by_id[IDS[5]]['titleEn']),
    IDS[6]: ('Düngemittel chemisch einordnen', by_id[IDS[6]]['titleEn']),
}
delta = []
for row in five:
    goal = out_id[row['goalId']]
    before = {f: goal.get(f) for f in ['title', 'titleEn', 'description', 'descriptionEn']}
    goal['title'], goal['titleEn'] = titles[goal['id']]
    goal['description'] = row['proposedDescriptionDe']
    goal['descriptionEn'] = row['proposedDescriptionEn']
    after = {f: goal.get(f) for f in before}
    delta.append({'goalId': goal['id'], 'before': before, 'after': after,
                  'authority': 'ai_candidate', 'knowledge': 'informed author remediation after the frozen source review A',
                  'requiredBeforeClosure': ['independent final-book description reviews', 'current positive-understanding evidence', 'current machine visual QA']})
old_provenance = copy.deepcopy(out_id[IDS[1]]['extendedData']['provenance'])
out_id[IDS[1]]['extendedData']['provenance']['sourceGoalId'] = 'he-chem-seki-10-1-b05-a01-1f4ea265'
write('five-description-and-provenance-deltas.json', {
    'schemaVersion': 1, 'status': 'candidate', 'authority': 'ai_candidate', 'observedAt': NOW,
    'descriptionDeltas': delta,
    'provenanceDeltas': [{'goalId': IDS[1], 'before': old_provenance,
                          'after': out_id[IDS[1]]['extendedData']['provenance'],
                          'reason': 'The old UUID is absent from the current HE extraction. Actual HE10.1-B05A01 exists and contains the ionic-lattice content. B05A02/B05A03 remain additional bound clauses, not hidden by this primary key.'}],
    'splitHeldGoalIds': [IDS[0], IDS[2]], 'strictClosureAdded': 0,
    'operativeMutations': False})

# Three ordinary earlier element-group goals are proposed in a separate sibling
# cluster, rather than silently removing prerequisites from the seven-child
# shared cluster and changing already closed salt/lime goals.
old_parent = out_id['254f7a85-17fa-57c7-8447-28ec05f3c2cf']
root = out_id['442c31c5-c561-5c7a-90bb-2335d779175c']
early_ids = [IDS[2], IDS[3], IDS[4]]
cluster_id = str(uuid.uuid5(uuid.NAMESPACE_URL, 'skillpilot:candidate:chemistry:element-groups-observable-properties:20261005-v1'))
new_cluster = {
    'id': cluster_id,
    'shortKey': 'candidate_chemistry_element_groups_observable_properties',
    'title': 'Elementgruppen: Stoffeigenschaften und Wasserreaktionen',
    'titleEn': 'Element groups: material properties and reactions with water',
    'description': 'Cluster für Stoffeigenschaften, Verwendungen und Wasserreaktionen ausgewählter Elementgruppen, die zunächst ohne vollständige Elektronen- und Bindungsmodelle erschlossen werden.',
    'descriptionEn': 'Cluster for material properties, uses and water reactions of selected element groups, initially explored without the complete electron and bonding models.',
    'weight': 3, 'tags': ['GK', 'LK', 'canonical', 'SekI'],
    'contains': early_ids, 'requires': [], 'type': 'cluster', 'examples': [],
    'dimensionTags': copy.deepcopy(old_parent['dimensionTags']),
    'applicability': copy.deepcopy(old_parent['applicability']),
}
new_cluster['dimensionTags']['topicCode'] = 'CANDIDATE.CHEMISTRY.SEK1.ELEMENT_GROUPS_PROPERTIES'
old_parent['contains'] = [i for i in old_parent['contains'] if i not in early_ids]
old_parent['weight'] = 4
old_parent['title'] = 'Salzklassen und Alltagsanwendungen (Sek I)'
old_parent['titleEn'] = 'Salt classes and everyday applications (Lower Secondary)'
old_parent['description'] = 'Cluster für Salzklassen, Kalkkreislauf, Rauchgaswäsche und Düngemittel aus der gymnasialen Sekundarstufe I.'
old_parent['descriptionEn'] = 'Cluster for salt classes, the lime cycle, flue-gas scrubbing and fertilizers from lower secondary Gymnasium chemistry.'
old_parent['extendedData']['provenance']['sourceGoalId'] = 'he-chem-seki-10-3-b07-a02-041532de'
root['contains'].insert(root['contains'].index(old_parent['id']), cluster_id)
proposed['goals'].append(new_cluster)
out_id[cluster_id] = new_cluster
for i in [IDS[2], IDS[4]]:
    out_id[i]['requires'] = ['fcc73fb5-7413-557f-aea3-b9692a66ee75', '42a84bca-d27e-581f-a43a-eee424f0504d']
out_id[IDS[3]]['requires'] = [IDS[2], 'd2ccd1d5-56f7-583f-9724-e97441367f91']
write('proposed-five-and-stage.validation-snapshot.json', proposed)
view_deltas = []
def insert_sibling(nodes):
    hits = 0
    for node in list(nodes):
        if node.get('kind') == 'canonicalSubtree' and node.get('goalId') == old_parent['id']:
            nodes.insert(nodes.index(node), {'kind': 'canonicalSubtree', 'goalId': cluster_id})
            hits += 1
        if isinstance(node.get('children'), list):
            hits += insert_sibling(node['children'])
    return hits
for view_path in sorted((ROOT / 'curricula/DE/Gymnasium/composition-views/chemie').glob('*.view.json')):
    view = json.loads(view_path.read_text())
    if old_parent['id'] not in json.dumps(view):
        continue
    prior = copy.deepcopy(view)
    hits = insert_sibling(view['rootNodes'])
    assert hits > 0, 'Explicit old subtree binding must have a concrete sibling placement'
    candidate_name = f'candidate-{view_path.name}'
    write(candidate_name, view)
    view_deltas.append({'operativePath': view_path.relative_to(ROOT).as_posix(),
                        'operativeSha256': hashlib.sha256(view_path.read_bytes()).hexdigest(),
                        'candidatePath': f'{REL}/{candidate_name}',
                        'beforeRootNodes': prior['rootNodes'], 'afterRootNodes': view['rootNodes'],
                        'insertedSubtreeCount': hits})
write('five-runtime-composition-view-deltas.json', {
    'schemaVersion': 1, 'status': 'candidate', 'authority': 'ai_candidate',
    'viewDeltas': view_deltas, 'operativeMutations': False,
    'scopeBoundary': 'Every currently explicit runtime binding of the affected old subtree receives the new structural sibling. Actual target atoms must remain exactly unchanged in each view; source-atlas views use direct goalEntry bindings and need no change.'})
write('bounded-stage-route-deltas.json', {
    'schemaVersion': 1, 'status': 'candidate', 'authority': 'ai_candidate', 'observedAt': NOW,
    'provisionalStructuralClusterId': cluster_id,
    'structuralIdAdopted': False, 'newAtomicGoalIds': [], 'atomicDenominatorChange': 0,
    'newCluster': new_cluster,
    'retainedLateClusterMetadataDelta': {
        'goalId': old_parent['id'],
        'before': {f: by_id[old_parent['id']][f] for f in ['title', 'titleEn', 'description', 'descriptionEn', 'weight', 'extendedData']},
        'after': {f: old_parent[f] for f in ['title', 'titleEn', 'description', 'descriptionEn', 'weight', 'extendedData']},
        'reason': 'The retained cluster now has exactly the four later salt/application children. Its actual descriptor and primary HE10.3 source key are aligned with those children. The two already closed child goal records remain unchanged; their changed parent chapter label requires targeted final-book context rebinding.'},
    'containsDeltas': [{'goalId': old_parent['id'], 'before': by_id[old_parent['id']]['contains'], 'after': old_parent['contains']},
                       {'goalId': root['id'], 'before': by_id[root['id']]['contains'], 'after': root['contains']}],
    'requiresDeltas': [{'goalId': i, 'before': by_id[i]['requires'], 'after': out_id[i]['requires']} for i in early_ids],
    'preservedClosedGoalIds': ['b5086548-169e-5d63-a14a-dabf631fa013', 'd726e00e-1f87-5ba5-8c79-76ad4022365e'],
    'scientificBoundary': {
        'earlyPropertiesAndUses': 'Actual substance identity, observable properties and supplied use data are sufficient. Electron configurations, Lewis structures and electronegativity are not prerequisite to these material-property arguments.',
        'waterComparison': 'Both selected simple-oxide and elemental-metal systems remain present. Reaction observations and product identities are supplied or established within this comparison, rather than requiring independent reaction discovery/planning. Identify hydroxide products and alkaline indicator evidence; H2 distinguishes the metal route and does not cause alkalinity. A supplied hydroxide/alkaline-solution explanation may be introduced locally. No Brønsted, electron-shell, ion-formation-by-noble-gas-rule or complete ion-lattice theory is claimed as prior mastery. The original two direct prerequisites remain unchanged.',
        'ionLevelExtension': 'A later independent explanation on the ion/electron level remains in the regular ion/atom goals. This stage option does not change or grant their mastery.',
        'noUnobservedTeacherCoordination': 'No early introduction of complete HE10.1 and no physics conference decision is presumed.',
        'remainingStageReview': 'Independent source and final-book/context QA must confirm this explicit scope and the exact resulting runtime placements. No active view was changed.'},
    'splitBoundary': 'e0 remains the current unsplit non-atomic goal in the validation snapshot. It is a prerequisite/context scaffold only, not an M7 closure. Exact element/compound split and companion IDs remain HOLD.',
    'operativeMutations': False})

he = read(HE); by = read(BY); hmap = read(HE_MAP)
he_goals = {g['id']: g for g in he['sourceGoals']}
by_goals = {g['id']: g for g in by['sourceGoals']}
clauses = {
    IDS[0]: [('he-chem-seki-10-1-b01-a01-20d6b173', 'Rutherford inference, proposed separate companion'), ('he-chem-seki-10-1-b01-a02-a20c7e8a', 'Particle properties, proposed retained atom')],
    IDS[1]: [('he-chem-seki-10-1-b05-a01-1f4ea265', 'Model simple ionic lattices'), ('he-chem-seki-10-1-b05-a02-b97181a5', 'Describe/determine coordination'), ('he-chem-seki-10-1-b05-a03-32fb322e', 'Explain typical ionic material properties')],
    IDS[2]: [('he-chem-seki-9-2-b01-a01-28c1edb7', 'Metal and compound properties/uses, two distinct proposed atoms')],
    IDS[3]: [('he-chem-seki-9-2-b01-a03-200f7eb0', 'Both metal/water and simple-oxide/water systems')],
    IDS[4]: [('he-chem-seki-9-2-b02-a01-39a59744', 'Properties and uses of elemental halogens'), ('he-chem-seki-9-2-b02-a02-ee8b69e1', 'ONLY halogens and their compounds in everyday life; metal reactions are not claimed')],
    IDS[5]: [('he-chem-seki-10-3-b07-a03-67c95b12', 'ONLY gypsum from flue-gas scrubbing')],
    IDS[6]: [('he-chem-seki-10-3-b07-a03-67c95b12', 'ONLY fertilizers; benefit/risk framing is operationalization of the actual HE environmental/alltag context')],
    old_parent['id']: [('he-chem-seki-10-3-b07-a02-041532de', 'Primary source of the retained late salt/application cluster; the distinct application clause is bound separately to its ordinary goals')],
}
source_rows = []
for goal_id, refs in clauses.items():
    for source_id, coverage in refs:
        cell = he_goals[source_id]
        source_rows.append({'goalId': goal_id, 'sourceGoalId': source_id,
                            'sourceSpan': cell['sourceSpan'], 'sourceText': cell['sourceText'],
                            'parentBulletText': cell['parentBulletText'],
                            'sourceExtractionPath': HE, 'sourceExtractionSha256': digest(HE),
                            'sourceLandscapeId': he['sourceLandscapeId'], 'coverageBoundary': coverage,
                            'mappingTuplesBefore': [r for r in hmap['mappings'] if r['legacyGoalId'] == source_id and r['canonicalGoalId'] == goal_id],
                            'sourceAuthority': 'official normative content, author operationalization; not a claimed verbatim competence operator'})
for source_id in ['8d8b20c7-7deb-53b9-afe7-bcb7f3a1b4e3', 'fe0fba92-5f7c-5af1-ab2e-7acd057f8721']:
    if source_id not in by_goals:
        continue
    cell = by_goals[source_id]
    source_rows.append({'goalId': IDS[1], 'sourceGoalId': source_id,
                        'sourceSpan': cell['sourceSpan'], 'sourceText': cell['sourceText'],
                        'parentBulletText': cell['parentBulletText'], 'sourceExtractionPath': BY,
                        'sourceExtractionSha256': digest(BY), 'sourceLandscapeId': by['sourceLandscapeId'],
                        'coverageBoundary': 'Ionic lattice modeling/properties only. Molecular modeling, formula discrimination and other experiment routines need their separate canonical witnesses.',
                        'sourceAuthority': 'actual official competence operator'})
write('current-source-clause-bindings-and-bounded-coverage.json', {
    'schemaVersion': 1, 'status': 'candidate', 'authority': 'ai_candidate', 'observedAt': NOW,
    'bindings': source_rows,
    'BYMissingWitnessInterpretation': 'Five specialized goals have actual HE clauses. A missing BY atlas witness is not substituted by global applicability and is not a missing HE witness. No new BY coverage/approval is claimed. Existing BY applicability is preserved pending separate source-specific reconciliation.',
    'HE9AndHE10Boundary': 'Actual HE9.2 content is distinct from regular HE10.1 complete atomic/bonding models. Source permission to move the latter earlier requires concrete physics coordination; no such decision is assumed here.'})

# Full current successor file retains every original source cell and every
# existing tuple. This author proposes ONE additional, explicitly partial
# clause binding; scientific disagreements with older broad associations are
# recorded separately and are not silently turned into approvals.
mapping_candidate = copy.deepcopy(hmap)
mapping_candidate['reviewId'] = 'hessen-chemistry-lower-secondary-b010-clause-remediation-candidate-20261005-v1'
mapping_candidate['status'] = 'candidate'
mapping_candidate['summary'] = 'Informed AI candidate; additive halogen everyday-compound clause binding. Existing unreviewed tuples are preserved, not newly approved.'
extra = {'legacyGoalId': 'he-chem-seki-9-2-b02-a02-ee8b69e1', 'canonicalGoalId': IDS[4], 'matchType': 'partial', 'reviewDecisionId': 'he-chem-seki-9-2-b02-a02-ee8b69e1'}
assert extra not in mapping_candidate['mappings']
mapping_candidate['mappings'].append(extra)
for row in mapping_candidate['decisions']:
    if row['sourceGoalId'] == extra['legacyGoalId']:
        row['canonicalGoalIds'].append(IDS[4])
        row['rationale'] = 'Kandidat: Der Alltags-/Verbindungsanteil wird zusätzlich konkret durch 584 gebunden. Der metallische Reaktionsanteil gehört zum getrennten Redox-Ziel bcf8. Die alte 950-Verbindung ist nur eine ungeklärte spätere Strukturkontext-Zuordnung; sie wird hier nicht als fachlich passende HE9-Erklärung oder vollständige Klauselabdeckung neu freigegeben.'
        row['reviewedAt'] = NOW
        row['reviewer'] = 'codex-informed-author-ai-candidate'
write('hessen-source-mapping-additive.candidate.review.json', mapping_candidate)
write('source-mapping-before-after-cases.json', {
    'schemaVersion': 1, 'status': 'candidate', 'authority': 'ai_candidate', 'observedAt': NOW,
    'additions': [extra], 'removals': [], 'sourceGoalCountBefore': len(he['sourceGoals']),
    'sourceGoalCountAfter': len(he['sourceGoals']),
    'existingSourceIdsAndMappingsPreserved': True,
    'existingInvalidOrOverbroadLinksRemainHeld': [
        {'goalId': IDS[1], 'sourceIds': ['he-chem-seki-9-2-b02-a02-ee8b69e1', 'he-chem-seki-9-2-b02-a03-4636d596'],
         'decision': 'HOLD: no new scientific approval. The ionic-lattice competence is not a halogen/metal or hydrogen-halogen reaction competence; later structural context cannot prove these whole HE9 clauses. Removal or replacement requires its own exact remaining-clause coverage review, which may need additional ordinary goals.'},
        {'goalId': IDS[0], 'sourceIds': ['he-chem-seki-10-1-b01-a03-f46c532c', 'he-chem-seki-10-1-b01-a04-1c62c15a', 'he-chem-seki-10-1-b01-a05-a1d0737d', 'he-chem-seki-10-1-b01-a06-670258fc', 'he-chem-seki-10-1-b01-a07-505be78a'],
         'decision': 'HOLD: the particle/Rutherford split does not automatically cover atomic masses, isotopes, pure/mixed elements, model limits and ion theory. Historical exact labels cannot be kept as a new scientific approval.'}],
    'strictClosureAdded': 0, 'operativeMutations': False})

for name, scope_ids, kind in [('a-five', [r['goalId'] for r in five], 'a'), ('m-five', [r['goalId'] for r in five], 'm')]:
    config = {'schemaVersion': 1, 'reviewId': f'chemie-b010-{name}-remediation-author-20261005-v1',
              'ruleVersion': 'v1', 'landscapeId': base['landscapeId'],
              'landscapePath': f'{REL}/proposed-five-and-stage.validation-snapshot.json',
              'reviewPath': f'{REL}/{name}.review.jsonl',
              'scope': {'label': 'Exact five revised author candidates; split goals excluded explicitly', 'leafGoalIds': scope_ids}}
    if kind == 'm':
        config['cardReviewPath'] = f'{REL}/{name}.cards.review.jsonl'
        (OWN / f'{name}.cards.review.jsonl').write_text('')
    write(f'{name}.config.json', config)
    reasons = {
        IDS[1]: 'One spatial structure-property explanation. Explicit modeling and coordination number preserve HE content; electrostatic forces include both unlike-charge attraction and like-charge repulsion when a layer moves. Mobile ions explain conduction in melt/solution without claiming conduction in the intact solid. No extra memorized coordination catalogue is needed.',
        IDS[3]: 'One product-based comparison of two specified simple reaction systems. Both hydroxide products lead to alkaline solution; hydrogen belongs to the metal route and is not the cause of alkalinity. Selected simple oxides are the boundary, not all alkali oxygen compounds. Supplied product/observation information can support reasoning without rote reaction memorization.',
        IDS[4]: 'One substance-specific property/use argument. Uses of halogen compounds must refer to those compounds, not assign fluoride or disinfectant-compound properties to elemental F2/Cl2. Actual HE9.2 everyday-compound clause is added explicitly; separate halogen reaction competence is not claimed.',
        IDS[5]: 'One interpretation of the simplified SO2 capture/oxidation/gypsum pathway in a supplied diagram. No memorized industrial overall equation, complete plant design or mastery of every limestone/lime variant is required. Sulfur moves into sulfate; the process is not mere physical gas removal.',
        IDS[6]: 'One contextual explanation of nutrient-ion supply versus loss/excess under supplied plant demand, amount and transport information. Selected mineral fertilizers are the substance boundary. Groundwater nitrate and phosphate transport are conditional routes, not a claim that all nutrients leach equally or that all fertilizers are salts.'}
    records = []
    for goal_id in scope_ids:
        row = {'schemaVersion': 1, 'ruleVersion': 'v1', 'landscapeId': base['landscapeId'],
               'reviewedAt': NOW, 'reviewer': 'codex-informed-author-source-remediation-ai-candidate',
               'reviewId': config['reviewId'], 'goalId': goal_id,
               'fingerprint': 'pending-native-binding', 'reason': reasons[goal_id]}
        if kind == 'a':
            row.update(status='atomic', semanticAtomic=True)
        else:
            row.update(status='no_memory_needed', memoryUseful=False, memoryGoalIds=[], deckIds=[])
        records.append(row)
    (OWN / f'{name}.review.jsonl').write_text(''.join(json.dumps(r, ensure_ascii=False) + '\n' for r in records))

write('split-options-preserved-and-rebased.json', {
    'schemaVersion': 1, 'status': 'candidate', 'authority': 'ai_candidate',
    'options': texts['twoNullCompanionVerdicts'],
    'currentGoalIdsRetained': [IDS[0], IDS[2]], 'newGoalIds': [], 'companionIdsRemainNull': True,
    'additionalSourceClauseHolds': 'The five extra HE10.1 B01 clauses must be assigned to exact ordinary competence(s), not hidden by the Rutherford/particle split.',
    'prerequisiteClarification': 'The e0 element/compound options can use material-property and element/compound distinction before electron models. The proposed structural route fixes the generic earlier stage only; actual split adoption and new child images/Memory rebinding remain separate.'})

input_paths = [CANON, HE, BY, HE_MAP,
               'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',
               'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json',
               'curricula/DE/Gymnasium/memory-decks/de_gymnasium_chemistry_flashcards_basics_seki.de.json',
               str(OLD.relative_to(ROOT) / 'frozen-source-d.receipt.json'),
               str(PEER.relative_to(ROOT) / 'source-description-a.freeze.json'),
               str(PEER.relative_to(ROOT) / 'candidate-templates-a.review.json')]
write('input-bindings-and-boundaries.json', {
    'schemaVersion': 1, 'status': 'candidate', 'authority': 'ai_candidate', 'observedAt': NOW,
    'files': [{'path': p, 'sha256': digest(p)} for p in input_paths],
    'goalIds': IDS, 'authorKnowledge': 'Both prior source author and review A outputs were deliberately read. This is an informed remediation author, not an independent or blind final-book D run.',
    'positiveEvidenceReadOrCreated': False, 'humanApproval': False, 'humanTrial': False,
    'operativeMutations': False, 'strictClosureAdded': 0})
print(json.dumps({'ownDirectory': REL, 'fiveTextRevisions': len(five), 'addedPartialSourceMapping': 1,
                  'provisionalStructuralClusters': 1, 'newAtomicIdsAdopted': 0, 'sourceDenominatorRetained': len(he['sourceGoals'])}))
