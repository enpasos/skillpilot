"""Apache-2.0: guarded Q1 field/group deltas in a physically isolated current tree."""
from pathlib import Path
from datetime import datetime, timezone
import argparse
import copy
import hashlib
import json
import os
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
REL = OWN.relative_to(ROOT)
OLD = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-acids-soaps-preservatives-twenty-current-candidate-v1'
P14 = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-fourteen-current-independent-p-v3'
PAUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-fourteen-positive-current-author-v2'
V8 = ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-q1-eight-current-independent-v-qa-20261005-v3'
ISO = ROOT / 'tmp/chemie-q1-fourteen-current-native-physically-isolated-20261005-v3'
CAN = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
SEM = 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
QA = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
ATLAS = 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'
REGISTRY = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
BD36 = 'bd36dc58-c93e-5247-9e82-da2f9e4e2bed'

def read(path):
    return json.loads(Path(path).read_text())

def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def write(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    assert not path.is_symlink(), path
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def verify_freeze(path, expected=None):
    if expected:
        assert sha(path) == expected, path
    payload = read(path)
    for row in payload['files']:
        source = ROOT / row.get('path', row.get('frozenCopyPath'))
        assert sha(source) == row['sha256'].removeprefix('sha256:'), source
        if 'bytes' in row:
            assert source.stat().st_size == row['bytes'], source
    return payload

def inspect_inputs():
    verify_freeze(PAUTHOR / 'author-package.final.freeze.json', '4318141ef4a36189001c47be322988befac67f9eac3324fcdcfa8d4e9c7a3a66')
    verify_freeze(P14 / 'independent-review.final.freeze.json', '396b0fbe7db7a78da07e3643b5196ea6c1b17d09a00526f1fbee43bfb31644b7')
    verify_freeze(V8 / 'review.freeze.manifest.json', 'e24670bf0a12673f6d7ad062cda8e952ed79111ce8bec7a5c077f213d24fadc8')
    delta = read(OLD / 'fourteen-current-source-provenance-and-complete-group-deltas.candidate.json')
    future = read(OLD / 'prospective-input-tree' / CAN)
    future_goals = {g['id']: g for g in future['goals']}
    active = read(ROOT / CAN)
    current_goals = {g['id']: g for g in active['goals']}
    comparisons = []
    for row in delta['rows']:
        gid = row['goalId']
        desired = future_goals[gid]
        fields = sorted(k for k in set(row['before']) | set(desired) if row['before'].get(k) != desired.get(k))
        conflicts = [k for k in fields if current_goals[gid].get(k) != row['before'].get(k)]
        comparisons.append({'goalId': gid, 'fields': fields, 'currentFieldsEqualOriginalBefore': not conflicts, 'conflictingFields': conflicts})
    assert len(comparisons) == 14
    assert not any(x['conflictingFields'] for x in comparisons), comparisons
    source_delta = read(OLD / 'seven-bounded-he-source-group-before-after.candidate.json')
    assert len(source_delta['rows']) == 7
    am = read(OWN / 'independent-seven-a-m-scientific-decisions.json')
    assert len(am['rows']) == 7 and all(x['semanticAtomic'] and not x['memoryUseful'] for x in am['rows'])
    write(OWN / 'guarded-input-comparison.before-baseline.actual.json', {
        'recordedAt': datetime.now(timezone.utc).isoformat(), 'status': 'PASS_author_P14_V8_freezes_and_exact_Q1_before_fields',
        'currentCanonicalSHA256': sha(ROOT / CAN), 'bindingNotYetAuthoritativeBaseline': True,
        'goalComparisons': comparisons, 'sourceGroupCount': 7, 'AMScientificDecisionCount': 7,
        'fullSnapshotOverlayUsed': False, 'activeWrites': 0,
    })
    return delta, future_goals, source_delta, am

COPIED = {}

def copy_file(source, rel):
    source = Path(source)
    target = ISO / rel
    target.parent.mkdir(parents=True, exist_ok=True)
    assert not target.is_symlink(), target
    # A reflink is a separate inode with copy-on-write data; no hard links.
    subprocess.run(['cp', '--reflink=auto', '--', str(source), str(target)], check=True)
    assert not target.is_symlink() and os.stat(source).st_ino != os.stat(target).st_ino
    digest = sha(source)
    assert digest == sha(target), rel
    active = ROOT / rel
    active_sha = sha(active) if active.is_file() else None
    COPIED[str(rel)] = {'path': str(rel), 'sourcePath': str(source.relative_to(ROOT)), 'sha256': digest, 'activeBeforeSHA256': active_sha, 'bytes': source.stat().st_size}

def recursive_paths(value):
    if isinstance(value, dict):
        for child in value.values():
            yield from recursive_paths(child)
    elif isinstance(value, list):
        for child in value:
            yield from recursive_paths(child)
    elif isinstance(value, str):
        if value.startswith(('curricula/', 'app/scripts/config/', 'contracts/', 'docs/')):
            yield value
        elif value.startswith('/assets/goal-visualizations/chemie/'):
            yield 'app/public' + value
        elif value.startswith('/data/'):
            yield 'app/public' + value

def copy_dependency_closure(seeds):
    pending = list(seeds)
    seen = set()
    while pending:
        rel = str(pending.pop())
        if rel in seen:
            continue
        seen.add(rel)
        source = ROOT / rel
        if not source.is_file():
            continue
        if rel not in COPIED:
            copy_file(source, rel)
        if source.suffix == '.json':
            pending.extend(recursive_paths(read(source)))

def prepare(report_path, delta, future_goals, source_delta, am):
    report = read(ROOT / report_path)
    chemistry = next(x for x in report['subjects'] if x['subject'] == 'chemie')
    assert len(chemistry['strictCompleteGoalIds']) == 90 and len(chemistry['currentGoalIds']) == 376
    for subject, floor in [('mathematik', 807), ('physik', 478)]:
        entry = next(x for x in report['subjects'] if x['subject'] == subject)
        assert len(entry['strictCompleteGoalIds']) >= floor, (subject, entry.get('strictCompleteGoalIds'))
    assert not ISO.exists(), 'Do not overwrite a prepared isolated tree.'
    ISO.mkdir(parents=True)
    baseline = read(ROOT / CAN)
    before_sha = sha(ROOT / CAN)
    registry = read(ROOT / REGISTRY)
    chem_config = next(x for x in registry['subjects'] if x['subject'] == 'chemie')
    # Native executable modules, source types, schemas and text docs are copies.
    for top in ['app/scripts', 'scripts', 'app/src', 'contracts']:
        for source in sorted((ROOT / top).rglob('*')):
            if source.is_file():
                copy_file(source, source.relative_to(ROOT))
    for source in sorted((ROOT / 'docs').rglob('*')):
        if source.is_file() and source.suffix in ['.json', '.md', '.yaml', '.yml', '.ts']:
            copy_file(source, source.relative_to(ROOT))
    for rel in ['app/package.json', 'app/tsconfig.json', 'app/tsconfig.node.json', 'package.json', 'AGENTS.md', 'LICENSING.md', 'LICENSE']:
        if (ROOT / rel).exists():
            copy_file(ROOT / rel, rel)
    (ISO / 'app/node_modules').symlink_to(ROOT / 'app/node_modules', target_is_directory=True)
    closure_seeds = [CAN, SEM, QA, ATLAS, str(REL / 'independent-seven-a-m-scientific-decisions.json'), 'curricula/DE/Gymnasium/quality/goal-description-review/chemie/review-views/chemie-m7-full-canonical.view.json', chem_config['memoryReviewConfigPath']]
    closure_seeds.extend(chem_config['semanticAtomicityConfigPaths'])
    closure_seeds.extend(chem_config['positiveEvidenceConfigPaths'])
    copy_dependency_closure(closure_seeds)
    assert sha(ROOT / CAN) == before_sha, 'Current canonical changed during baseline copy.'

    current = read(ISO / CAN)
    current_goals = {g['id']: g for g in current['goals']}
    baseline_goals = {g['id']: g for g in baseline['goals']}
    applied = []
    for row in delta['rows']:
        gid = row['goalId']
        desired = future_goals[gid]
        fields = sorted(k for k in set(row['before']) | set(desired) if row['before'].get(k) != desired.get(k))
        for key in fields:
            assert current_goals[gid].get(key) == row['before'].get(key), (gid, key)
            if key in desired:
                current_goals[gid][key] = copy.deepcopy(desired[key])
            else:
                current_goals[gid].pop(key, None)
        applied.append({'goalId': gid, 'fields': fields})

    # Exact independent actual V decisions; human fields remain untouched.
    qa = read(ISO / QA)
    qa_by_id = {r['goalId']: r for r in qa['records']}
    vfields = read(V8 / 'native-v-fields.candidate.json')['records']
    vdecisions = {x['goalId']: x for x in read(V8 / 'independent-actual-v-decisions.json')['imageDecisions']}
    vreceipt = []
    for patch in vfields:
        gid = patch['goalId']
        decision = vdecisions[gid]
        goal = current_goals[gid]
        assert goal['description'] == patch['description'] and goal['descriptionEn'] == decision['descriptionEn']
        link = next(l for l in goal['resourceLinks'] if l.get('type') == 'goal-visualization' and l.get('role') == 'primary')
        link['altText'] = decision['approvedAltTextDe']
        public = 'app/public' + link['url']
        source = ROOT / decision['originalPath']
        assert sha(source) == decision['originalSHA256']
        copy_file(source, public)
        if decision['format'] == 'PNG':
            for prefix in ['curricula/DE/Gymnasium/visualizations/chemie', 'backend/src/main/resources/static/assets/goal-visualizations/chemie']:
                rel = str(Path(prefix) / gid / Path(link['url']).name)
                retained = OLD / 'visual-review-input-tree-v2' / rel
                assert retained.is_file() and sha(retained) == sha(source)
                copy_file(retained, rel)
            for entry in read(OLD / 'prepared-prospective-input-tree.receipt.json')['files']:
                rel = entry['futureActivePath']
                if rel.startswith(f'curricula/DE/Gymnasium/visualizations/chemie/{gid}/') and not rel.endswith(('.png', '.jpg')):
                    copy_file(ROOT / entry['prospectiveCopyPath'], rel)
        original_human = {k: v for k, v in qa_by_id[gid].items() if k.startswith('human')}
        for key, value in patch.items():
            qa_by_id[gid][key] = copy.deepcopy(value)
        qa_by_id[gid]['assetSha256'] = patch['assetSha256']
        qa_by_id[gid]['visualizationState'] = 'available'
        qa_by_id[gid]['missingReason'] = ''
        qa_by_id[gid]['imageUrl'] = link['url']
        qa_by_id[gid]['publicAssetPath'] = public
        qa_by_id[gid]['canonicalAssetPath'] = f'curricula/DE/Gymnasium/visualizations/chemie/{gid}/{Path(link["url"]).name}'
        assert {k: v for k, v in qa_by_id[gid].items() if k.startswith('human')} == original_human
        vreceipt.append({'goalId': gid, 'assetSHA256': sha(source), 'approvedAltTextDe': link['altText'], 'existingHumanFieldsPreserved': True})
    assert len(vreceipt) == 8
    # Every unrelated object/QA row remains exactly the current operative base.
    selected = {r['goalId'] for r in delta['rows']}
    assert all(g == baseline_goals[g['id']] for g in current['goals'] if g['id'] not in selected)
    held = read(OLD / 'six-holds-exact-remediation-and-companion-reuse.candidate.json')['rows']
    assert all(current_goals[x['goalId']] == baseline_goals[x['goalId']] for x in held)
    oldqa = {r['goalId']: r for r in read(ROOT / QA)['records']}
    assert all(r == oldqa[r['goalId']] for r in qa['records'] if r['goalId'] not in vdecisions)
    write(ISO / CAN, current)
    write(ISO / QA, qa)

    # Guard and replace only seven exact HE mappings/decisions on current base.
    atlas = read(ISO / ATLAS)
    mapping_current = source_delta['beforeMappingPath']
    assert mapping_current in atlas['mappingPaths']
    mapping = read(ISO / mapping_current)
    for group in source_delta['rows']:
        sid = group['sourceGoalId']
        before_m = [r for r in mapping['mappings'] if r['legacyGoalId'] == sid]
        before_d = next(r for r in mapping['decisions'] if r['sourceGoalId'] == sid)
        assert before_m == group['beforeMappings'] and before_d == group['beforeDecision'], sid
        first = next(i for i, r in enumerate(mapping['mappings']) if r['legacyGoalId'] == sid)
        mapping['mappings'] = [r for r in mapping['mappings'] if r['legacyGoalId'] != sid]
        mapping['mappings'][first:first] = copy.deepcopy(group['afterMappings'])
        index = next(i for i, r in enumerate(mapping['decisions']) if r['sourceGoalId'] == sid)
        mapping['decisions'][index] = copy.deepcopy(group['afterDecision'])
    original_mapping = read(ISO / mapping_current)
    targeted_source_ids = {r['sourceGoalId'] for r in source_delta['rows']}
    assert [r for r in mapping['mappings'] if r['legacyGoalId'] not in targeted_source_ids] == [r for r in original_mapping['mappings'] if r['legacyGoalId'] not in targeted_source_ids]
    assert [r for r in mapping['decisions'] if r['sourceGoalId'] not in targeted_source_ids] == [r for r in original_mapping['decisions'] if r['sourceGoalId'] not in targeted_source_ids]
    mapping['reviewId'] = 'hessen-chemistry-upper-secondary-m7-q1-fourteen-current-20261005-v3'
    mapping['summary'] = copy.deepcopy(read(OLD / 'prospective-input-tree' / source_delta['futureActiveMappingPath'])['summary'])
    future_mapping = source_delta['futureActiveMappingPath'].replace('20261005-v1', '20261005-v3')
    write(ISO / future_mapping, mapping)
    atlas['mappingPaths'] = [future_mapping if p == mapping_current else p for p in atlas['mappingPaths']]
    write(ISO / ATLAS, atlas)

    # Current A/M records are inherited; seven actual changes use independently
    # reviewed author judgments, then native tooling binds their real new text.
    am_by_id = {r['goalId']: r for r in am['rows']}
    for name in ['acids-derivatives', 'soaps', 'preservatives']:
        existing_config_path = next(p for p in chem_config['semanticAtomicityConfigPaths'] if p.endswith(f'canonical-chemistry-q1-{name}.config.json'))
        config = read(ISO / existing_config_path)
        rows = [json.loads(line) for line in (ISO / config['reviewPath']).read_text().splitlines() if line.strip()]
        for row in rows:
            if row['goalId'] in am_by_id:
                decision = am_by_id[row['goalId']]
                row.update(status='atomic', semanticAtomic=True, reviewedAt='2026-10-05', reviewer='Codex independent seven current A/M scientific review', reason=decision['atomicityReason'], suggestedSplit=[])
        review_rel = str(REL / f'a-{name}.review.jsonl')
        config['reviewPath'] = review_rel
        config['reportPath'] = str(REL / f'a-{name}.report.md')
        write(ISO / REL / f'a-{name}.config.json', config)
        (ISO / review_rel).write_text('\n'.join(json.dumps(r, ensure_ascii=False) for r in rows) + '\n')
    mconfig = read(ISO / chem_config['memoryReviewConfigPath'])
    mrows = [json.loads(line) for line in (ISO / mconfig['reviewPath']).read_text().splitlines() if line.strip()]
    for row in mrows:
        if row['goalId'] in am_by_id:
            decision = am_by_id[row['goalId']]
            row.update(status='no_memory_needed', memoryUseful=False, reviewedAt='2026-10-05', reviewer='Codex independent seven current A/M scientific review', reason=decision['memoryReason'])
            row.pop('memoryGoalIds', None)
            row.pop('deckIds', None)
    mconfig['reviewPath'] = str(REL / 'm-current-full.review.jsonl')
    mconfig['reportPath'] = str(REL / 'm-current-full.report.md')
    # Copy card ledger into the candidate's own output before the native writer.
    card_source = mconfig['cardReviewPath'] if 'cardReviewPath' in mconfig else mconfig['reviewPath'].replace('.review.jsonl', '.cards.review.jsonl')
    card_dest = str(REL / 'm-current-full.cards.review.jsonl')
    copy_file(ISO / card_source, card_dest)
    mconfig['cardReviewPath'] = card_dest
    write(ISO / REL / 'm-current-full.config.json', mconfig)
    (ISO / mconfig['reviewPath']).write_text('\n'.join(json.dumps(r, ensure_ascii=False) for r in mrows) + '\n')

    pconfig = read(P14 / 'positive-evidence.native-isolated.config.json')
    pconfig['reviewPath'] = str(REL / 'positive-evidence.review.jsonl')
    pconfig['scope']['label'] = 'Fourteen independently scientifically reviewed current Q1 AI candidates after B010; E1/G1 needs human review'
    write(ISO / REL / 'positive-evidence.config.json', pconfig)
    copy_file(PAUTHOR / 'positive-evidence.candidates.json', REL / 'positive-evidence.candidates.json')
    book = read(OLD / 'book.config.json')
    book['outputPath'] = str(REL / 'prospective-full-base.book-model.json')
    book['evidenceReviewPaths'] = []
    write(ISO / REL / 'book.config.json', book)
    batch = read(OLD / 'batch.config.json')
    batch.update(batchId='chemie-q1-fourteen-current-20261005-v3', bookId='de-gym-chemie-q1-fourteen-current-20261005-v3', baseGoalBookConfigPath=str(REL / 'book.config.json'), outputDirectory=str(REL / 'native-finalbook'))
    assert batch['goalIds'] == delta['goalIds'] + [BD36]
    write(ISO / REL / 'batch.config.json', batch)
    for rel in ['curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md', 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md', 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md']:
        copy_file(ROOT / rel, rel)
    symlinks = [str(p.relative_to(ISO)) for p in ISO.rglob('*') if p.is_symlink()]
    assert symlinks == ['app/node_modules'], symlinks
    write(OWN / 'current-base-and-scoped-rebase.actual.receipt.json', {
        'recordedAt': datetime.now(timezone.utc).isoformat(), 'status': 'PASS_physically_isolated_current90_Q1_explicit_deltas_only',
        'isolationRoot': str(ISO), 'baselineReportPath': report_path, 'baselineReportSHA256': sha(ROOT / report_path), 'baselineCurrentChemistryStrict': 90, 'baselineChemistryCurrentAtomic': 376,
        'baselineCanonicalSHA256': before_sha, 'futureCanonicalSHA256': sha(ISO / CAN), 'nativeCodeAllCopiedUnmodified': True,
        'allRuntimeInputsPhysicalSeparateInodes': True, 'onlySharedSymlink': 'app/node_modules',
        'appliedGoalFieldDeltas': applied, 'appliedSourceGoalIds': sorted(targeted_source_ids), 'visualizationDeltas': vreceipt,
        'AMScientificDecisions': 7, 'allOtherCanonicalGoalObjectsPreserved': True, 'allOther368QARecordsPreserved': True, 'sourceHoldGoalIdsUnchanged': [r['goalId'] for r in held],
        'unrelatedCurrentMRecordsInherited': len(mrows) - 7, 'fullHistoricalCanonicalSnapshotOverlay': False,
        'copiedPhysicalInputs': list(COPIED.values()), 'humanApproval': False, 'strictClosure': 0, 'activeWrites': 0,
    })
    print(json.dumps({'isolation': str(ISO), 'physicalInputs': len(COPIED), 'Q1GoalDeltas': 14, 'sourceGroupDeltas': 7, 'actualVApprovedBindings': 8, 'AMReviewedDeltas': 7, 'operativeBaselineStrict': 90, 'activeWrites': 0}), flush=True)

parser = argparse.ArgumentParser()
parser.add_argument('--baseline-report')
args = parser.parse_args()
inputs = inspect_inputs()
if args.baseline_report:
    prepare(args.baseline_report, *inputs)
else:
    print('PASS preflight: guarded Q1 inputs; awaiting explicit current90 baseline authorization/message before native preparation.')
