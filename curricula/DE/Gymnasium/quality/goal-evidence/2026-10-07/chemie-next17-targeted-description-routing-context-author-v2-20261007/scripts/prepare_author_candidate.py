#!/usr/bin/env python3
"""Prepare a bounded inert AUTHOR candidate; never write active inputs."""
import copy
import hashlib
import json
import re
import shutil
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[8]
OUT = Path(__file__).resolve().parents[1]
OLD = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next-twenty-current-methods-acid-base-organic-author-v1'
REL = OUT.relative_to(ROOT).as_posix()
NOW = datetime.now(timezone.utc).isoformat()
if (OUT / 'final-own-files.freeze.json').exists():
    raise SystemExit('Sealed dossier: prepare a new version in a fresh folder.')

def read(path):
    return json.loads(path.read_text())

def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def pin(path):
    b = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def snapshot(source, name):
    target = OUT / 'inputs' / name
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, target)
    return {'source': pin(source), 'frozenCopy': pin(target)}

inputs = [
    ('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json', 'current-canonical.snapshot.json'),
    ('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json', 'current-semantic-kinds.snapshot.json'),
    ('curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json', 'current-v-qa.snapshot.json'),
    ('curricula/DE/Gymnasium/quality/goal-description-review/chemie/review-views/chemie-m7-full-canonical.view.json', 'current-composition-view.snapshot.json'),
    ('curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_CHEMIE_GYMNASIUM_LEHRPLANPLUS.source-extraction.json', 'current-BY-source-extraction.snapshot.json'),
    ('curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_chemistry_source_extraction_to_canonical_chemistry.review.json', 'current-BY-mapping.snapshot.json'),
]
frozen = [snapshot(ROOT / p, n) for p, n in inputs]
for source, name in [
    ('positive-evidence.seventeen.author-candidate-set.json', 'original-author-profiles.snapshot.json'),
    ('thirty-four-complete-bilingual-material-cases.author-review17.json', 'original-author-cases.snapshot.json'),
    ('seventeen-bounded-primary-source-components-and-two-split-source-routing.author.json', 'original-author-bounded-source-guide.snapshot.json'),
]:
    frozen.append(snapshot(OLD / source, name))

batch = read(OLD / 'native-d-seventeen.batch.config.json')
ids = batch['goalIds']
current = read(OUT / 'inputs/current-canonical.snapshot.json')
candidate = copy.deepcopy(current)
before = {g['id']: g for g in current['goals']}
after = {g['id']: g for g in candidate['goals']}
fd = 'fd309753-4d48-5570-a4ec-09dfeb20ff9c'
redox = '22133f29-ef02-4408-8f8d-2bbea3275d91'
influence = '9751b6d8-cde3-527b-b37c-babb6cee79d2'
struct = '597ac03c-d25f-5c34-a87c-52c059c87295'
after[fd]['description'] = 'Die lernende Person kann saure und basische wässrige Lösungen auf Teilchenebene durch das jeweilige Überwiegen von Oxonium- oder Hydroxid-Ionen charakterisieren.'
after[fd]['descriptionEn'] = 'The learner can characterize acidic and basic aqueous solutions at particle level by the respective predominance of hydronium or hydroxide ions.'
for link in after[fd].get('resourceLinks', []):
    if 'altText' in link:
        link['altText'] = link['altText'].replace(before[fd]['description'], after[fd]['description'])
after[redox]['descriptionEn'] = 'The learner can use oxidation numbers, formulate simple redox half-equations in aqueous solutions, and write redox equations correctly.'
after[influence]['description'] = 'Die lernende Person kann die Beeinflussung ausgewählter Säure-Base-Reaktionen mithilfe der Umkehrbarkeit von Protonenübergängen erklären.'
after[influence]['descriptionEn'] = 'The learner can explain influences on selected acid-base reactions using the reversibility of proton transfers.'
after[influence]['extendedData']['provenance']['sourceGoalId'] = '7c68f201-5b73-5b1f-8576-cc1a23fafb83'
write(OUT / 'candidate/canonical.whole-current-plus-targeted-corrections.json', candidate)

def diffs(left, right, path=''):
    if isinstance(left, dict) and isinstance(right, dict):
        return [d for key in sorted(left.keys() | right.keys()) for d in diffs(left.get(key), right.get(key), path+'/'+key)]
    if isinstance(left, list) and isinstance(right, list) and len(left) == len(right):
        return [d for i, (l, r) in enumerate(zip(left, right)) for d in diffs(l, r, path+'/'+str(i))]
    return [] if left == right else [{'pointer': path, 'before': left, 'after': right}]

changes = [{'goalId': gid, 'changes': diffs(before[gid], after[gid])} for gid in ids if before[gid] != after[gid]]
assert len(changes) == 3
assert all(before[g['id']] == g for g in candidate['goals'] if g['id'] not in {fd, redox, influence})
write(OUT / 'candidate/exact-targeted-differences.author.json', {
    'documentType': 'AUTHOR proposed text, source-provenance and display-context corrections; inert',
    'authority': 'ai_candidate', 'status': 'needs_human_review', 'strictNetGain': 0,
    'activeWrites': False, 'independentApproval': False, 'humanApproval': False,
    'currentCanon': pin(OUT / 'inputs/current-canonical.snapshot.json'),
    'candidateCanon': pin(OUT / 'candidate/canonical.whole-current-plus-targeted-corrections.json'),
    'changedWholeGoals': changes,
    'limits': ['No added assessment aspect or prerequisite.', 'fd309753 image bytes unchanged; alt text is aligned only with the proposed goal sentence.', '9751b6d8 splitFromCanonicalGoalId and splitReviewId remain historical provenance; only actual primary sourceGoalId changes.', 'All unlisted whole canonical goals remain JSON-value identical.'],
})

view = read(OUT / 'inputs/current-composition-view.snapshot.json')
view['viewId'] = 'de-gym-chemie-targeted-current17-author-v2-context'
process = '2da7abbb-7ade-5acc-b7b1-1d98d7334352'
root = '442c31c5-c561-5c7a-90bb-2335d779175c'
children = [{'kind': 'canonicalSubtree', 'goalId': g} for g in after[root]['contains']]
for node in children:
    if node['goalId'] == process:
        node['displayLabel'] = 'Chemische Erkenntnisgewinnung und Kommunikation'
view['rootNodes'][0]['children'] = [{'kind': 'structure', 'id': 'candidate-chemistry-root', 'label': after[root]['title'], 'children': children}]
write(OUT / 'candidate/full378-context.view.json', view)
stage_ids = ['c0f1bf09-5a70-5006-b1e9-e91f786a63bf', '02dc29ae-4046-556a-b048-d64a0feb8f16', '7a05a1ce-45d3-571e-be51-afcd8dfd33ca']
write(OUT / 'candidate/context-only-correction.author.json', {
    'documentType': 'AUTHOR candidate-only composition-view display correction',
    'status': 'needs_human_review', 'strictNetGain': 0, 'activeWrites': False,
    'mixedCanonicalBranchId': process,
    'existingCanonicalBranchWholeGoal': before[process],
    'priorDisplayLabel': before[process]['title'],
    'candidateDisplayLabel': 'Chemische Erkenntnisgewinnung und Kommunikation',
    'reason': 'The branch includes both SekI and canonical SekII goals. A stage-neutral presentation removes the evidenced false SekI breadcrumb without recategorizing any goal.',
    'evidencedSekIIBreadcrumbGoals': [{ 'goalId': gid, 'tags': before[gid]['tags'], 'provenance': before[gid].get('extendedData', {}).get('provenance'), 'wholeGoalUnchanged': before[gid] == after[gid]} for gid in stage_ids],
    'incidentalPresentationEffect': 'Other goals in the same mixed branch, including selected95dc0ee5, also receive the neutral branch display label. Their semantic stages, texts, membership and applicability are unchanged.',
})

guide = read(OUT / 'inputs/original-author-bounded-source-guide.snapshot.json')
primary_names = ['BY-C8-ch-ntg', 'BY-C9-ch-ntg', 'BY-C10-ch', 'BY-C10-ch-ntg', 'BY-C12-grundlegend', 'BY-C12-erhoeht']
for name in primary_names:
    for extension in ['html', 'txt']:
        source = OLD / f'sources/{name}.{extension}'
        target = OUT / f'sources/{name}.{extension}'
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
        frozen.append({'source': pin(source), 'frozenCopy': pin(target)})
for name in ['HE-G9-physical-017.txt', 'HE-G9-physical-017.png', 'actual-four-official-BY-pages-acquisition.author.json', 'actual-two-official-BY-upper-pages-acquisition.author.json']:
    source = OLD / 'sources' / name
    target = OUT / 'sources' / name
    shutil.copyfile(source, target)
    frozen.append({'source': pin(source), 'frozenCopy': pin(target)})

mapping = read(OUT / 'inputs/current-BY-mapping.snapshot.json')
sourcegoals = {g['id']: g for g in read(OUT / 'inputs/current-BY-source-extraction.snapshot.json')['sourceGoals']}
routes = []
for gid, sourceid, name, scope, match in [
    (struct, '7b5310e2-3b69-5a45-8966-f8523ea42fb9', 'BY-C10-ch', 'Only the first structural-suitability clause; deriving reversibility is a distinct sibling component and is not assigned to597ac03c.', 'partial'),
    (influence, '7c68f201-5b73-5b1f-8576-cc1a23fafb83', 'BY-C10-ch-ntg', 'The explicit selected-reaction influence competency using reversibility, within the acid-base chapter; no quantitative equilibrium, pKa, buffers or universal OH− product-direction claim.', 'exact'),
]:
    sourcegoal = sourcegoals[sourceid]
    literal = sourcegoal['sourceText']
    textpath = OUT / f'sources/{name}.txt'
    assert literal in textpath.read_text(), (gid, sourceid)
    prior_decision = next(d for d in mapping['decisions'] if d['sourceGoalId'] == sourceid)
    candidate_decision = copy.deepcopy(prior_decision)
    candidate_decision['canonicalGoalIds'].append(gid)
    candidate_decision['rationale'] += ' AUTHOR v2 adds a bounded direct child route: ' + scope
    candidate_decision['reviewedAt'] = NOW
    candidate_decision['reviewer'] = 'AUTHOR /root/chem17_current_independent_a; no independent approval'
    route = {
        'goalId': gid, 'authority': 'ai_candidate', 'status': 'needs_human_review',
        'beforeDirectMappingCount': sum(m['canonicalGoalId'] == gid for m in mapping['mappings']),
        'proposedMappingRowToAppend': {'legacyGoalId': sourceid, 'canonicalGoalId': gid, 'matchType': match, 'reviewDecisionId': sourceid},
        'wholeSourceGoal': sourcegoal,
        'literalWitness': literal,
        'assignedBoundedComponentLiteral': 'erkennen in Formeldarstellungen die strukturellen Voraussetzungen für die Eignung eines Teilchens als Säure bzw. Base' if gid == struct else literal,
        'literalContainedInFrozenPrimaryText': True,
        'primaryHtml': pin(OUT / f'sources/{name}.html'),
        'primaryText': pin(textpath),
        'scope': scope,
        'wholeBroadOriginalSourceClosure': False,
        'priorParentRoutesRetained': [m for m in mapping['mappings'] if m['legacyGoalId'] == sourceid],
        'priorDecision': prior_decision,
        'candidateDecisionReplacement': candidate_decision,
        'wholeCurrentGoal': before[gid], 'wholeCandidateGoal': after[gid],
    }
    routes.append(route)
write(OUT / 'candidate/two-bounded-direct-source-routes.author.json', {
    'documentType': 'AUTHOR inert native-shape additions and exact source-decision replacements for independent source review',
    'activeMappingSnapshot': pin(OUT / 'inputs/current-BY-mapping.snapshot.json'),
    'sourceExtractionSnapshot': pin(OUT / 'inputs/current-BY-source-extraction.snapshot.json'),
    'status': 'needs_human_review', 'authority': 'ai_candidate',
    'activeWrites': False, 'strictNetGain': 0,
    'routes': routes,
    'noGlobalSourceClosure': True,
    'reviewerInstruction': 'Judge these two bounded literal routes. Existing broad mapping rows and their old complete status are not scientific approval of this candidate or of any learner-source superset.',
})

selected_rows = [r for r in guide['rows'] if r['goalId'] in ids]
for row in selected_rows:
    row['status'] = 'AUTHOR bounded witness candidate; subsequent independent review required'
    for witness in row['boundedLiteralBYWitnesses']:
        oldpath = Path(witness['primaryText']['path'])
        witness['primaryText'] = pin(OUT / 'sources' / oldpath.name)
        sourceid = witness['sourceGoalId']
        assert sourceid in sourcegoals
        assert sourcegoals[sourceid] == witness['wholeSourceGoal']
        witness['wholeSourceGoal'] = sourcegoals[sourceid]
        primary_text = (OUT / 'sources' / oldpath.name).read_text()
        literal = sourcegoals[sourceid]['sourceText']
        witness['literalExistingSourceDescriptionContainedInActualOfficialText'] = literal in primary_text
        witness['sameWordsAfterWhitespaceNormalization'] = re.sub(r'\s+', ' ', literal) in re.sub(r'\s+', ' ', primary_text)
        witness['containmentMethod'] = 'Exact string first; independently visible HTML text whitespace is collapsed only for the separately named sameWords field.'
        assert witness['sameWordsAfterWhitespaceNormalization']
write(OUT / 'candidate/bounded-primary-witnesses17.author.json', {
    'documentType': 'AUTHOR17 literal source components; no independent approval',
    'authority': 'ai_candidate', 'status': 'needs_human_review', 'strictNetGain': 0,
    'wholeOriginalSourceClosure': False, 'rows': selected_rows, 'directRouteProposals': routes,
})

profiles = read(OUT / 'inputs/original-author-profiles.snapshot.json')
profiles['reviewId'] = 'chemie-next17-targeted-description-routing-context-author-v2-20261007'
profiles['reviewedAt'] = NOW
profiles['reviewer'] = 'AUTHOR /root/chem17_current_independent_a; GPT-6/Codex; prior independent role ended; this authored revision requires separate independent review'
for g in profiles['goals']:
    g['reason'] = 'AUTHOR v2: complete material/tasks/reference answers retained from neutral AUTHOR17; rebound to the explicitly corrected inert candidate. No learner run, human approval or independent approval. ' + g['reason']
    g['evidenceLevel'] = 'E1'
    g['maximumClaimScope'] = 'G1'
write(OUT / 'candidate/positive-evidence17.author-candidate-set.json', profiles)
cases = read(OUT / 'inputs/original-author-cases.snapshot.json')
cases['documentType'] = 'Complete content-specific AUTHOR v2 material, tasks, reference responses and negative cases; not learner or independent evidence'
cases['role'] = 'AUTHOR'
write(OUT / 'candidate/complete34-bilingual-material-cases.author.json', cases)

v_ids = ['0bf26276-2780-506c-ac34-35dd44a29409', 'a44af1fa-5988-5b7d-b206-691c6bbf7dd4', influence]
excluded = ['466bd2e9-39a5-5221-b620-945934adce00', '6d3a2bad-8c67-5964-a720-375f138adaba', '8edee6b6-9ead-515e-93f5-feada64522b2']
assert all(not after[g].get('resourceLinks') for g in v_ids)
write(OUT / 'candidate/preserved-holds.author.json', {
    'documentType': 'Candidate boundary: three in-scope V HOLDs and three excluded source HOLDs remain open',
    'strictNetGain': 0, 'humanApproval': False, 'activeWrites': False,
    'inScopeVisualizationHolds': [
        {'goalId': v_ids[0], 'currentCandidateResourceLinks': [], 'reason': 'Withdrawn pH image: lemon labelpH2 arrow points at3. New native page has no image binding.'},
        {'goalId': v_ids[1], 'currentCandidateResourceLinks': [], 'reason': 'Withdrawn ion image: aqueous Na/K test tubes depict flame colors; unresolved overclaim of salt pairing in a mixture. New native page has no image binding.'},
        {'goalId': v_ids[2], 'currentCandidateResourceLinks': [], 'reason': 'Withdrawn acid-base influence image: OH− addition is said to increase both A− and BH+; OH− can consume BH+. New native page has no image binding.'},
    ],
    'excludedSourceHolds': [
        {'goalId': excluded[0], 'reason': 'IR/NMR: unresolved actual source locator and old image valence defect; excluded from17.'},
        {'goalId': excluded[1], 'reason': 'General carbonyl reactivity: limited HE acetal witness does not establish entire goal; excluded from17.'},
        {'goalId': excluded[2], 'reason': 'Grignard: no full official routine witness established; excluded from17.'},
    ],
    'retainedVisualizationLinks': sum(any(r.get('type') == 'goal-visualization' for r in after[g].get('resourceLinks', [])) for g in ids),
    'imageGeneration': False,
})

profile_by_id = {g['goalId']: g for g in profiles['goals']}
write(OUT / 'candidate/whole17-reviewer-material.author.json', {
    'documentType': 'Whole17 current and proposed goals with full bilingual profiles/material/reference answers/boundaries',
    'authority': 'ai_candidate', 'status': 'needs_human_review', 'strictNetGain': 0,
    'humanApproval': False, 'independentApproval': False, 'goalIds': ids,
    'goals': [{'goalId': gid, 'wholeCurrentGoal': before[gid], 'wholeCandidateGoal': after[gid], 'exactChanges': diffs(before[gid], after[gid]), 'wholeCandidateProfile': profile_by_id[gid], 'completeMaterialCases': [c for c in cases['cases'] if c['goalId'] == gid], 'vHold': gid in v_ids, 'contextCorrection': gid in stage_ids, 'directSourceRouteProposed': gid in {struct, influence}} for gid in ids],
})

base = read(OLD / 'full-current378.book.config.json')
base.update({'bookId': profiles['reviewId']+'-full', 'title': 'Chemie – vollständiger Kandidatenkontext für gezielte17-Revision', 'landscapePath': REL+'/candidate/canonical.whole-current-plus-targeted-corrections.json', 'compositionViewPath': REL+'/candidate/full378-context.view.json', 'semanticKindLedgerPath': REL+'/candidate/semantic-kinds.candidate.json', 'goalVisualizationQaPath': REL+'/inputs/current-v-qa.snapshot.json', 'outputPath': REL+'/qa-artifacts/full378-base.book-model.json'})
write(OUT / 'configs/full378.book.config.json', base)
batch.update({'batchId': profiles['reviewId'], 'bookId': profiles['reviewId'], 'title': 'Chemie – 17 gezielt überarbeitete Kandidaten; Quellenrouten und Kapitelkontext', 'baseGoalBookConfigPath': REL+'/configs/full378.book.config.json', 'outputDirectory': REL+'/native-d-seventeen'})
write(OUT / 'configs/native-d-seventeen.batch.config.json', batch)
pconf = read(OLD / 'positive-evidence.seventeen.author-candidates.config.json')
pconf.update({'reviewId': profiles['reviewId'], 'landscapePath': base['landscapePath'], 'semanticKindLedgerPath': base['semanticKindLedgerPath'], 'reviewPath': REL+'/candidate/positive-evidence17.author-candidates.review.jsonl'})
pconf['scope']['label'] = 'AUTHOR v2 corrected inert17 candidate; three V HOLDs remain and three source HOLD goals excluded; no independent/human approval or strict gain'
write(OUT / 'configs/positive-evidence17.author-candidates.config.json', pconf)

assets = []
for gid in ids:
    for link in after[gid].get('resourceLinks', []):
        if link.get('type') == 'goal-visualization':
            source = ROOT / 'app/public' / link['url'].lstrip('/')
            target = OUT / 'inputs/current-retained-images' / f'{gid}{source.suffix}'
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(source, target)
            assets.append({'goalId': gid, 'url': link['url'], 'source': pin(source), 'frozenCopy': pin(target)})
tool_paths = [
    'app/scripts/materializeGoalDescriptionRolloutBatch.ts',
    'app/scripts/goalBookModel.ts', 'app/scripts/goalBookRenderer.ts',
    'app/scripts/materializePositiveGoalEvidenceCandidates.ts',
    'app/scripts/positiveGoalEvidenceReview.ts', 'app/scripts/positiveGoalEvidenceProfileModel.ts',
    'app/src/utils/authoring/compositionViewAuthoring.ts',
    'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md',
    'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md',
    'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md',
]
write(OUT / 'inputs/input-freeze.manifest.json', {
    'documentType': 'AUTHOR v2 exact frozen current and inherited neutral inputs',
    'createdAtUTC': NOW, 'gitHead': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip(),
    'role': 'AUTHOR', 'strictNetGain': 0, 'activeWrites': False,
    'inputs': frozen, 'retainedCurrentVisualizationAssets': assets,
    'productionToolSourcePins': [pin(ROOT / path) for path in tool_paths],
    'history': 'The sealed independent A dossier and all old dossiers are untouched. Original author inputs are copied as neutral author material, never relabeled independent.',
})
print(json.dumps({'output': REL, 'changedWholeGoals': len(changes), 'goalCount': len(ids), 'caseCount': len(cases['cases']), 'retainedVisualizations': len(assets), 'strictNetGain': 0}))
