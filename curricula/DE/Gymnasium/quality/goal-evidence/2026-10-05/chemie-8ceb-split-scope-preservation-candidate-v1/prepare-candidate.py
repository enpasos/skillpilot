#!/usr/bin/env python3
"""Prepare a local inactive author candidate; never touch active inputs."""
import copy
import datetime
import hashlib
import json
import pathlib
import uuid

ROOT = pathlib.Path(__file__).resolve().parents[7]
OUT = pathlib.Path(__file__).resolve().parent
PARENT = '8ceb1749-fce0-584f-a2b8-0a309282329a'
DIST = '5db9ba57-6a80-56db-8b9d-e8ca4ac41855'
CRACK = '7c22f436-e550-5b0b-85ae-a073b0c50418'
PREREQ = '2be9e61a-88ea-56fe-8294-ee46e3c9a8ef'
CP = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
CONFIG = 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'
OLD = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-energy-four-revision-candidate-v1/'
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()
read = lambda p: json.loads((ROOT / p).read_text())
sha = lambda p: 'sha256:' + hashlib.sha256((ROOT / p).read_bytes()).hexdigest()

def write(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def walk(value, pointer=''):
    if isinstance(value, dict):
        yield pointer, value
        for key, child in value.items():
            yield from walk(child, pointer + '/' + str(key).replace('~', '~0').replace('/', '~1'))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from walk(child, pointer + '/' + str(index))

canonical = read(CP)
by = {g['id']: g for g in canonical['goals']}
old = read(OLD + 'split-8ceb.graph-delta.candidates.json')
config = read(CONFIG)
ancestors = {PARENT}
while True:
    added = {g['id'] for g in canonical['goals'] if set(g.get('contains', [])) & ancestors}
    if added <= ancestors:
        break
    ancestors |= added

state_notes = {
    'DE-BB': 'Both authored mechanisms retained. Actual section 3.1.5 is an optional italic deepening in EP choice topics; section 3.1 school-form limits do not establish compulsory Gymnasium GK/LK coverage. No compulsory full child claim.',
    'DE-BE': 'Both authored mechanisms retained. Same shared official RLP and optional/school-form restrictions as BB; do not turn technical GK/LK fallback into normative course evidence.',
    'DE-HB': 'Both authored mechanisms retained. Lower source asks petroleum processing via diagrams, but its general wording does not yet prove both mechanisms. Actual page/diagram and school-form scope remain unresolved.',
    'DE-HE': 'Both procedures explicitly required in Gymnasium G9 10.4 and current upper-secondary E.4. Each child is a partial match; their union covers the E.4 procedure clause. Lower broad source retains other uncovered components.',
    'DE-HH': 'Both authored mechanisms retained. Current relevant ancestor rows concern general organic substances/reaction types; no clause-specific proof for both industrial procedures established.',
    'DE-MV': 'Both authored mechanisms retained. Current relevant ancestor rows concern petroleum/alkanes/properties; no clause-specific proof for both procedures established.',
    'DE-NI': 'Both procedures explicitly required in upper-secondary EP page 16, with separate representation/particle cells. Economic judgment is preserved separately and is not covered by the two mechanism children.',
    'DE-NW': 'Both authored mechanisms retained. Current broad organic/alkane ancestor associations are not proof of either industrial mechanism.',
    'DE-RP': 'Both authored mechanisms retained. Current broad source associations are not clause-specific procedure proof.',
    'DE-SH': 'Both authored mechanisms retained. Current organic/alkane source associations are not clause-specific procedure proof.',
    'DE-SL': 'Both authored mechanisms retained. Actual EP naturwissenschaftlicher Zweig page 31 requires distillation; cracking is only a possible experiment there. Neither this branch nor optional experiment proves all authored GK/LK scopes.',
    'DE-SN': 'Both authored mechanisms retained. Class 9 WB2 explicitly teaches cracking as an optional choice area; experimental execution, elimination interpretation and Olefin-Verbund are not all in the narrow cracking child. Class 9 petroleum fractions alone do not prove fractional distillation.',
    'DE-ST': 'Both authored mechanisms retained. Current broad organic reaction/property source associations are not clause-specific procedure proof.',
    'DE-TH': 'Both authored mechanisms retained. General alkane/organic reaction rows do not prove both procedures. Fraktionierte Fällung is unrelated and is not a distillation witness.',
    'DE-BY': 'No current direct 8ceb extraction mapping or authored 8ceb goalEntry found. Actual reviewed grade 9 NTG/grade 10 clauses did not establish both procedures. The b95 petroleum-use source does not prove processing mechanisms. Preserve compatibility declaration only, without normative approval.',
    'DE-BW': 'No current direct 8ceb extraction mapping or authored 8ceb goalEntry found. Preserve compatibility declaration only; no source-specific approval inferred.',
}

all_maps = []
direct_maps = []
source_by_path = {}
for path in config['mappingPaths']:
    mapping = read(path)
    source_path = mapping['sourceExtractionPath']
    source = source_by_path.setdefault(source_path, read(source_path))
    sg = {g['id']: g for g in source['sourceGoals']}
    edges = [e for e in mapping['mappings'] if e['canonicalGoalId'] in ancestors]
    decisions = {d['sourceGoalId']: d for d in mapping['decisions']}
    entries = [{
        'mappingIndex': mapping['mappings'].index(edge),
        'edgeBefore': edge,
        'sourceGoalBefore': sg[edge['legacyGoalId']],
        'decisionBefore': decisions.get(edge['legacyGoalId']),
        'bindingKind': 'direct-parent' if edge['canonicalGoalId'] == PARENT else 'inherited-ancestor',
        'approval': 'existing routing evidence only; author audit is not independent approval',
    } for edge in edges]
    item = {
        'path': path, 'sha256': sha(path), 'sourceExtractionPath': source_path,
        'sourceExtractionSha256': sha(source_path), 'jurisdiction': source.get('jurisdiction'),
        'stage': source.get('stage'), 'bindings': entries,
    }
    all_maps.append(item)
    if any(edge['canonicalGoalId'] == PARENT for edge in edges):
        direct_maps.append(item)

authored = []
all_view_refs = []
for base in ['curricula/DE/Gymnasium/composition-views/chemie', 'app/scripts/config/goal-books/source-views/de-gym-chemistry-national-atlas']:
    for path in sorted((ROOT / base).glob('*.json')):
        value = read(str(path.relative_to(ROOT)))
        for pointer, node in walk(value):
            if node.get('goalId') != PARENT or node.get('kind') not in ['goalEntry', 'canonicalSubtree']:
                continue
            rel = str(path.relative_to(ROOT))
            entry = {'path': rel, 'sha256': sha(rel), 'pointer': pointer, 'nodeBefore': node,
                     'viewId': value.get('viewId'), 'scopeBefore': value.get('scope'),
                     'inputKind': 'authored-composition' if base.startswith('curricula') else 'generated-book-routing'}
            all_view_refs.append(entry)
            if base.startswith('curricula') and node['kind'] == 'goalEntry':
                after = copy.deepcopy(node)
                after['kind'] = 'canonicalSubtree'
                # The old reference names the whole two-mechanism competence; expand
                # exactly that competence, not an unrelated broad ancestor.
                entry['nodeAfterCandidate'] = after
                entry['childTargetIds'] = [DIST, CRACK]
                state = value.get('scope', {}).get('jurisdiction')
                entry['sourceAssessment'] = state_notes[state]
                entry['jurisdictionSourceBindingPaths'] = [m['path'] for m in all_maps if m['jurisdiction'] == state]
                entry['rationale'] = 'Preserve precisely the existing whole authored competence and omitted-role target semantics; source approval remains separate and unresolved where stated.'
                entry['independentReviewStatus'] = 'required'
                authored.append(entry)
assert len(authored) == 26, len(authored)

parent_after = copy.deepcopy(by[PARENT])
parent_after['contains'] = [DIST, CRACK]
parent_after['requires'] = []
parent_after['type'] = 'cluster'
children = copy.deepcopy(old['childCandidates'])
for child in children:
    assert uuid.uuid5(uuid.UUID(old['uuidReceipts'][0]['namespace']), next(r['seed'] for r in old['uuidReceipts'] if r['goalId'] == child['id'])) == uuid.UUID(child['id'])
    child['applicability'] = copy.deepcopy(by[PARENT]['applicability'])
    child['extendedData']['applicabilityMappingInheritance'] = 'boundary'
    child['extendedData']['sourceScopeReview'] = {
        'status': 'author-candidate-unapproved',
        'meaning': 'Jurisdiction list preserves the old authored compatibility scope; it is not a new 16-state source approval. Direct clause mappings and optional/branch restrictions must pass independent review before integration.',
    }
incoming = []
for index, goal in enumerate(canonical['goals']):
    if PARENT not in goal.get('requires', []):
        continue
    after = copy.deepcopy(goal)
    after['requires'] = [new for oldid in goal['requires'] for new in ([DIST, CRACK] if oldid == PARENT else [oldid])]
    exam_before = goal.get('examData', {}).get('coveredGoalIds')
    if exam_before is not None and PARENT in exam_before:
        after['examData']['coveredGoalIds'] = [new for oldid in exam_before for new in ([DIST, CRACK] if oldid == PARENT else [oldid])]
    incoming.append({'pointer': f'/goals/{index}', 'goalBefore': goal, 'goalAfterCandidate': after,
                     'reason': 'Preserve the previous two-mechanism prerequisite demand without requiring a curricular-area cluster. Narrowing needs a separate didactic review.',
                     'examCoverageStatus': 'Compatibility coverage list preserved; no new claim that generic exam prose assesses either new child.'})

canonical_delta = {
    'schemaVersion': 1, 'status': 'inactive-author-candidate-not-independent-approval', 'createdAt': NOW,
    'inputPath': CP, 'inputSha256': sha(CP), 'inputLandscapeId': canonical['landscapeId'],
    'parentBefore': by[PARENT], 'parentAfterCandidate': parent_after, 'childCandidates': children,
    'uuidReceipts': old['uuidReceipts'], 'incomingRequiresDeltas': incoming,
    'directContainsParentsUnchanged': [g for g in canonical['goals'] if PARENT in g.get('contains', [])],
    'weighting': {'beforeParentWeight': by[PARENT]['weight'], 'afterParentWeight': parent_after['weight'],
                  'afterChildWeights': [c['weight'] for c in children], 'reason': 'Two child weights sum to the old atomic weight; do not double the existing competence weight.'},
    'semanticKindCandidate': {'parent': {'goalId': PARENT, 'before': 'curricularAtomic', 'after': 'curricularArea'},
                              'children': [{'goalId': id, 'after': 'curricularAtomic'} for id in [DIST, CRACK]]},
    'reverseContextRisk': {'goalId': PREREQ, 'goalBefore': by[PREREQ],
                          'dependentsBefore': [g['id'] for g in canonical['goals'] if PREREQ in g.get('requires', [])],
                          'dependentsAfterCandidate': [g['id'] for g in canonical['goals'] if PREREQ in g.get('requires', []) and g['id'] != PARENT] + [DIST, CRACK],
                          'action': 'Actual strict reverse-context D binding changes. Check targeted current D context for 2be; unchanged goal content is not a new substantive review. Do not merely rehash D.'},
    'strictProgress': {'newApprovedGoals': 0, 'restoredBindings': 0, 'netStrictIncrease': 0,
                       'denominatorDeltaIfIntegrated': 1, 'humanApproval': False, 'humanTrial': False},
    'protectedM6': 'Not certified by this author package. The source-inheritance boundary exposes existing unresolved jurisdiction evidence. Keep integration held until actual protected projection/source gates pass without lowering thresholds.',
}
write('canonical-and-dependencies.delta.candidate.json', canonical_delta)
write('placements-and-views.delta.candidate.json', {'schemaVersion': 1, 'status': 'inactive-author-candidate', 'authoredGoalEntryCount': 26,
      'authoredGoalEntryDeltas': authored, 'allDirectParentViewBindings': all_view_refs,
      'otherReachability': 'The checker also enumerates every chemistry authored view in which the parent is reached by a canonicalSubtree; no direct 26-goalEntry-only assumption.',
      'generatedBookAction': 'Regenerate affected source/navigation outputs only at a stable reviewed integration; these snapshots are witnesses, not proposed active edits.'})
write('current-source-bindings.inventory.json', {'schemaVersion': 1, 'currentAtlasInput': CONFIG, 'currentAtlasInputSha256': sha(CONFIG),
      'ancestors': sorted(ancestors), 'mappingInputCount': len(all_maps), 'directParentMappingInputCount': len(direct_maps),
      'directParentRowCount': sum(e['bindingKind'] == 'direct-parent' for m in all_maps for e in m['bindings']),
      'mappingInputs': all_maps, 'warning': 'Broad ancestor membership is current technical routing and does not prove either new atom.'})

source_deltas = []
metadata_deltas = []
for item in direct_maps:
    path = item['path']; mapping = read(path); source = source_by_path[item['sourceExtractionPath']]
    for entry in item['bindings']:
        if entry['bindingKind'] != 'direct-parent':
            continue
        sid = entry['edgeBefore']['legacyGoalId']
        if sid.startswith('he-') or sid.startswith(('bb-', 'be-')):
            target_ids = [DIST, CRACK]
            coverage = 'Each child partial; the two procedure components form a union. No each-child exact whole-source claim.'
        elif '-002-' in sid or '-003-' in sid:
            target_ids = [DIST]; coverage = 'Only the distillation child; representation cell stays separate from cracking.'
        elif '-014-' in sid:
            target_ids = []; coverage = 'Mechanism children do not assess economic judgment; retain the existing evaluation targets and report the assessment residual.'
        else:
            target_ids = [CRACK]; coverage = 'Only the cracking child; molecular conversion/representation cells form a union, not distillation evidence.'
        d_before = entry['decisionBefore']
        d_after = copy.deepcopy(d_before)
        d_after['canonicalGoalIds'] = [new for oid in d_before['canonicalGoalIds'] for new in (target_ids if oid == PARENT else [oid])]
        d_after['rationale'] = coverage + ' Inactive author proposal; independent source review remains required.'
        d_after['reviewedAt'] = NOW[:10]
        d_after['reviewer'] = 'codex-author-candidate-not-independent-review'
        if sid.startswith(('bb-', 'be-')):
            restriction = {'sourceStatus': 'optional-deepening-with-school-form-restriction', 'section': '3.1 Einführungsphase / 3.1.5',
                           'courseProfile': 'unspecified; technical GK/LK fallback is not normative evidence',
                           'schoolForm': 'Section 3.1 explicitly addresses the listed non-Gymnasium EP forms; Gymnasium prerequisite/earlier placement remains unresolved',
                           'printedPage': 23, 'restrictionPrintedPage': 17,
                           'finding': 'Actual procedure cell is italic. Intro says italic points are possible content deepening within EP choice topics, not compulsory LK-only content.'}
            source_before = entry['sourceGoalBefore']; source_after = copy.deepcopy(source_before)
            source_after.setdefault('metadata', {})['normativeScopeReviewCandidate'] = restriction
            metadata_deltas.append({'sourceExtractionPathBefore': item['sourceExtractionPath'], 'sourceExtractionSha256Before': item['sourceExtractionSha256'],
                                    'goalPointer': '/sourceGoals/' + str(source['sourceGoals'].index(source_before)),
                                    'sourceGoalBefore': source_before, 'sourceGoalAfterCandidate': source_after,
                                    'sourceTextUnchanged': True, 'restriction': restriction})
            coverage += ' Optional/school-form restriction blocks blanket Gymnasium mandatory GK/LK promotion.'
        elif sid.startswith('he-chem-seki-'):
            coverage += ' Residuals in this broad source: formation, use, gasoline boiling analysis and comparison/economic/environmental assessment are not all proved by these two children.'
        source_deltas.append({'mappingPathBefore': path, 'mappingSha256Before': item['sha256'], 'sourceGoalId': sid,
                              'edgeBefore': entry['edgeBefore'], 'decisionBefore': d_before, 'decisionAfterCandidate': d_after,
                              'replacementEdgesCandidate': [dict(entry['edgeBefore'], canonicalGoalId=id, matchType='partial', confidence=0.8,
                                rationale=coverage, reviewedAt=NOW[:10], reviewer='codex-author-candidate-not-independent-review') for id in target_ids],
                              'coverageAssessment': coverage, 'unmodifiedOtherTargets': [id for id in d_before['canonicalGoalIds'] if id != PARENT],
                              'independentReviewRequired': True})

# These two discoveries are separate narrow source proposals, not a blanket
# relocation of SL/SN upper/lower scopes.
for state, needle, child, restriction, residual in [
    ('DE-SL', 'sl-chem-sekii-sl-ch-sekii-ep-nw-2024-p031-004-785a3262', DIST,
     'Mandatory EP naturwissenschaftlicher Zweig only; not the sprachlicher Zweig or a generic Hauptphase GK/LK requirement.',
     'Cracking on the same page is only a possible experiment and is not the compulsory distillation competence.'),
    ('DE-SN', 'sn-chem-seki-sn-ch-klassenstufe-9-wb2-066-02-63630b5a', CRACK,
     'Class 9 Wahlbereich 2 optional selection; not a blanket SekI GK/LK or upper-stage requirement.',
     'Qualitative conversion supports part of the cell; applying elimination knowledge needs source-specific case review. Experimental execution and Olefin-Verbund from sibling cells remain separate requirements.'),
]:
    item = next(m for m in all_maps if m['jurisdiction'] == state and ('upper-secondary' in m['path'] if state == 'DE-SL' else 'lower-secondary' in m['path']))
    source = source_by_path[item['sourceExtractionPath']]
    goal = next(g for g in source['sourceGoals'] if g['id'] == needle)
    mapping = read(item['path']); before = next(d for d in mapping['decisions'] if d['sourceGoalId'] == needle)
    after = copy.deepcopy(before)
    after['canonicalGoalIds'] = list(dict.fromkeys(before['canonicalGoalIds'] + [child]))
    after['rationale'] = 'Inactive partial procedure proposal. ' + restriction + ' ' + residual
    source_deltas.append({'mappingPathBefore': item['path'], 'mappingSha256Before': item['sha256'], 'sourceGoalId': needle,
                          'existingEdgesBefore': [e for e in mapping['mappings'] if e['legacyGoalId'] == needle],
                          'decisionBefore': before, 'decisionAfterCandidate': after,
                          'replacementEdgesCandidate': [], 'additionalEdgesCandidate': [{'legacyGoalId': needle, 'canonicalGoalId': child,
                           'matchType': 'partial', 'rationale': after['rationale'], 'reviewedAt': NOW[:10], 'reviewer': 'codex-author-candidate-not-independent-review'}],
                          'scopeRestriction': restriction, 'residual': residual, 'status': 'held-scope-model-and-independent-source-review', 'independentReviewRequired': True})
    source_after = copy.deepcopy(goal)
    source_after.setdefault('metadata', {})['normativeScopeReviewCandidate'] = {'restriction': restriction, 'residual': residual}
    metadata_deltas.append({'sourceExtractionPathBefore': item['sourceExtractionPath'], 'sourceExtractionSha256Before': item['sourceExtractionSha256'],
                            'goalPointer': '/sourceGoals/' + str(source['sourceGoals'].index(goal)),
                            'sourceGoalBefore': goal, 'sourceGoalAfterCandidate': source_after, 'sourceTextUnchanged': True})

write('source-mappings-and-restrictions.delta.candidate.json', {'schemaVersion': 1, 'status': 'inactive-author-candidate-held-for-source-scope-review',
      'mappingDeltas': source_deltas, 'sourceExtractionGoalDeltas': metadata_deltas,
      'versioning': 'Create versioned successor extraction/mapping files during reviewed integration. Never overwrite historical originals; update active atlas references only after scope preservation and protected-floor checks pass.',
      'operationalScopeGap': 'Current atlas helpers understand stage/course facets but do not enforce these newly documented optional/school-form/branch restrictions. Metadata alone cannot certify the correct curricular target scope; this package makes no machine M6/M7 claim.'})

state_matrix = []
for state in by[PARENT]['applicability']['jurisdiction']:
    entries = [e for e in authored if e['scopeBefore'].get('jurisdiction') == state]
    mapitems = [m for m in all_maps if m['jurisdiction'] == state]
    state_matrix.append({'jurisdiction': state, 'authoredDirectGoalEntryCount': len(entries),
                         'authoredScopesBefore': [e['scopeBefore'] for e in entries],
                         'compatibilityDeclarationBefore': True, 'compatibilityDeclarationCandidate': True,
                         'compatibilityMeaning': 'Preserves the already authored whole competence; not a new normative source approval.',
                         'directParentRowsBefore': [e['edgeBefore'] for m in mapitems for e in m['bindings'] if e['bindingKind'] == 'direct-parent'],
                         'ancestorBindingCountBefore': sum(e['bindingKind'] == 'inherited-ancestor' for m in mapitems for e in m['bindings']),
                         'sourceAssessment': state_notes[state], 'finalApproval': False})
write('jurisdiction-scope-preservation.matrix.json', {'schemaVersion': 1, 'states': state_matrix,
      'wholeCompetencePreservation': 'All 26 authored references retain both mechanisms. Raw 16-state compatibility declarations are retained explicitly as unapproved authorship continuity, never as 16-state normative coverage.',
      'sourceInheritanceDecision': 'Boundary on each new atomic child prevents broad old ancestor mappings from being promoted into positive child source evidence. Direct narrow clauses must provide actual source evidence.',
      'integrationHold': 'Do not integrate by deleting unresolved state coverage or relabelling current source totals. Resolve actual source/placement gaps and pass the protected M6 gates first.'})

profiles = read(OLD + 'split-8ceb.positive-evidence.candidates.json')
profiles['reviewId'] = 'chemie-8ceb-split-scope-preservation-author-candidate-v1'
profiles['reviewedAt'] = NOW
profiles['reviewer'] = 'codex-author-candidate-not-independent-review'
profiles['origin'] = {'path': OLD + 'split-8ceb.positive-evidence.candidates.json', 'sha256': sha(OLD + 'split-8ceb.positive-evidence.candidates.json'),
                      'decision': 'Preserve the already authored full narrow bilingual cases; this is an author reuse, not an independent positive-evidence review or learner demonstration.'}
write('positive-evidence.full.candidates.json', profiles)

docs = {}
for source in source_by_path.values():
    for doc in source.get('sourceDocuments', []) + ([source['sourceDocument']] if source.get('sourceDocument') else []):
        if doc.get('path') and (ROOT / doc['path']).is_file():
            docs[doc['path']] = dict(doc, sha256Actual=sha(doc['path']))
selected = [d for path, d in docs.items() if path.endswith(('kerncurriculum_gymnasiale_oberstufe-chemie.pdf', 'g9-chemie.pdf', 'Teil_C_RLP_GOST_2022_Chemie.pdf', 'KC-CH_SII_Druck.pdf', 'Chemie_GOS_Einfuehrungsphase_naturwissenschaftlicher_Zweig_2024.pdf', 'lehrplan-gymnasium-chemie-sachsen-2025.pdf'))]
write('official-source-inspection.receipt.json', {'schemaVersion': 1, 'status': 'author-inspected-retained-official-source-not-independent-review',
      'documents': selected,
      'pageReceipts': [
          {'jurisdiction': 'DE-HE', 'fileSuffix': 'kerncurriculum_gymnasiale_oberstufe-chemie.pdf', 'printedPage': 36, 'pdfPageOneBased': 36, 'edition': 'Actual imprint Ausgabe 2024 / Stand 01.08.2025', 'finding': 'E.4 explicitly names both petroleum processing procedures.'},
          {'jurisdiction': 'DE-HE', 'fileSuffix': 'g9-chemie.pdf', 'printedPage': 26, 'pdfPageOneBased': 27, 'finding': 'Grade 10.4 mandatory contents explicitly include both; broad bullet contains other components.'},
          {'jurisdiction': ['DE-BB', 'DE-BE'], 'fileSuffix': 'Teil_C_RLP_GOST_2022_Chemie.pdf', 'printedPage': 23, 'pdfPageOneBased': 23, 'restrictionPage': 17, 'visualInspection': 'Actual page 23 italic styling inspected', 'finding': 'Italic possible deepening in EP choice topics; section 3.1 limits school forms. Do not infer mandatory all-Gymnasium GK/LK.'},
          {'jurisdiction': 'DE-NI', 'fileSuffix': 'KC-CH_SII_Druck.pdf', 'printedPage': 16, 'pdfPageOneBased': 16, 'finding': 'EP technical procedures table separates distillation and thermal cracking content, models and economic judgment.'},
          {'jurisdiction': 'DE-SL', 'fileSuffix': 'Chemie_GOS_Einfuehrungsphase_naturwissenschaftlicher_Zweig_2024.pdf', 'printedPage': 31, 'pdfPageOneBased': 31, 'finding': 'NW EP distillation compulsory; cracking of paraffin oil only in possible experiments.'},
          {'jurisdiction': 'DE-SN', 'fileSuffix': 'lehrplan-gymnasium-chemie-sachsen-2025.pdf', 'printedPage': [17, 18], 'pdfPageOneBased': [29, 30], 'finding': 'Class 9 LB3 petroleum fractions does not alone require distillation; WB2 cracking is an optional choice area with separate experimental/elimination/Olefin-Verbund facets.'},
      ],
      'thirdPartyRights': 'Retained source provenance only; no full official PDF text, relicensing or redistribution clearance claimed. Original source rights remain separate.',
      'humanApproval': False, 'humanTrial': False})

registry_path = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
subject = next(s for s in read(registry_path)['subjects'] if s['subject'] == 'chemie')
historic_a = []
for path in subject['semanticAtomicityConfigPaths']:
    conf = read(path)
    for key, value in conf.items():
        if isinstance(value, str) and value.endswith('.jsonl') and (ROOT / value).is_file():
            for line in (ROOT / value).read_text().splitlines():
                row = json.loads(line)
                if row.get('goalId') == PARENT:
                    historic_a.append({'configPath': path, 'recordPath': value, 'recordBefore': row})
memory_conf = read(subject['memoryReviewConfigPath'])
historic_m = []
for value in memory_conf.values():
    if isinstance(value, str) and value.endswith('.jsonl') and (ROOT / value).is_file():
        for line in (ROOT / value).read_text().splitlines():
            row = json.loads(line)
            if row.get('goalId') == PARENT:
                historic_m.append({'recordPath': value, 'recordBefore': row})
cards = []
deck_inputs = []
for path in sorted((ROOT / 'curricula/DE/Gymnasium/memory-decks').glob('*chemistry*.json')):
    rel = str(path.relative_to(ROOT)); deck = read(rel)
    deck_inputs.append({'path': rel, 'sha256': sha(rel), 'deckId': deck.get('deckId')})
    for card in deck.get('cards', []):
        if any(id in json.dumps(card, ensure_ascii=False) for id in [PARENT, DIST, CRACK]):
            cards.append({'deckPath': rel, 'card': card})
write('semantic-memory-and-review-impact.candidates.json', {
    'schemaVersion': 1, 'status': 'inactive-author-decisions-not-independent-gate-approval',
    'registryBefore': {'path': registry_path, 'sha256': sha(registry_path)},
    'historicalParentA': historic_a, 'historicalParentM': historic_m,
    'counterevidence': 'Current independent D split finding distinguishes physical separation and chemical conversion. The historical atomic=true record is retained as history; it cannot overrule the current resolved-split requirement or be copied onto children.',
    'atomicityCandidates': [
        {'goalId': DIST, 'semanticAtomicCandidate': True, 'rationale': 'One explanatory competence: physical enrichment by differing volatility with unchanged molecular identity. Fraction assignments are observable consequences of the same separation model.'},
        {'goalId': CRACK, 'semanticAtomicCandidate': True, 'rationale': 'One explanatory competence: thermal chemical conversion of long-chain hydrocarbons to shorter saturated/unsaturated products using a qualitative particle model. Economic judgments and real experimental execution remain outside this child.'},
    ],
    'memoryCandidates': [
        {'goalId': DIST, 'statusCandidate': 'no_memory_needed', 'memoryUsefulCandidate': False,
         'reason': 'The competence uses a supplied column/boiling-range model to explain enrichment and physical preservation. A standalone fraction-name recall card would test nomenclature rather than this causal explanation. No uncued list requirement is added.'},
        {'goalId': CRACK, 'statusCandidate': 'no_memory_needed', 'memoryUsefulCandidate': False,
         'reason': 'The competence reasons from supplied molecule models to new shorter molecules and checks conservation. Memorizing a fixed cracking equation would not establish transfer; no such equation or product-list recall requirement is in the goal.'},
    ],
    'actualCardOriginScan': {'deckInputs': deck_inputs, 'matchingCards': cards,
                            'action': 'No new cards/decks justified by the present narrow goals. Independent M decides; if memory_required is found, author actual cards and run their content and per-view visibility checks before counting M.'},
    'requiredFreshD': {'newChildren': [DIST, CRACK], 'roundsPerChild': 2,
                      'resolvedFindingsRequired': True, 'incomingDependencyContexts': [e['goalBefore']['id'] for e in incoming],
                      'strictReverseContext': PREREQ,
                      'reason': 'Use actual revised page/context/source/image bindings. Do not update historical D hashes as a substitute for substantive review.'},
    'P': {'path': 'positive-evidence.full.candidates.json', 'status': 'author candidate, full cases retained, current binding and independent review pending'},
    'V': {'children': 'Fresh genuine PNG generation and actual native/360/680 inspection still required. Prompts are not assets or approval.',
          'parent': 'Existing JPEG bytes retained as cluster overview; no new atomic V approval claimed.'},
    'machineApproval': False, 'humanApproval': False, 'humanTrial': False,
})
print(json.dumps({'status': 'inactive author candidate prepared', 'authoredEntries': len(authored), 'allDirectParentViewBindings': len(all_view_refs),
                  'mappingInputs': len(all_maps), 'directParentRows': sum(e['bindingKind'] == 'direct-parent' for m in all_maps for e in m['bindings']),
                  'sourceDeltaRows': len(source_deltas), 'sourceMetadataDeltas': len(metadata_deltas)}, ensure_ascii=False))
