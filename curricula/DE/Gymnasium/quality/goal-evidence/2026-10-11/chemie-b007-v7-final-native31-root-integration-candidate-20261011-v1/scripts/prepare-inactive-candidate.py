#!/usr/bin/env python3
"""Technical adoption only; invokes unchanged ordinary helpers, never generation."""
import copy
import datetime
import hashlib
import json
import pathlib
import shutil
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parents[8]
BASE = pathlib.Path(__file__).resolve().parents[1]
PREFIX = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/'
AUTHOR = ROOT / (PREFIX + 'chemie-b007-targeted-scoring-source-binding-author-successor-20261011-v7')
PREP = ROOT / (PREFIX + 'chemie-b007-v7-D2-P2-native31-integration-preparation-20261011-v1')
INVENTORY = PREP / 'A6-P6-M402-V6-exact-artifact-inventory.actual.json'
LANDSCAPE = BASE / 'candidate/whole523-six-child-DE15-deck.inactive.json'
SEMANTIC = BASE / 'candidate/semantic-kinds.current523.DE15-deck.inactive.json'
QA = BASE / 'candidate/visualization-qa-current-whole-plus-six-approved-ai.inactive.json'

def rel(p):
    return str(pathlib.Path(p).relative_to(ROOT))

def read(p):
    return json.loads(pathlib.Path(p).read_text())

def write(p, obj):
    p = pathlib.Path(p)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')

def digest(p):
    p = pathlib.Path(p)
    assert p.is_file() and not p.is_symlink(), p
    data = p.read_bytes()
    return {'path': rel(p), 'bytes': len(data), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest()}

def objects(value):
    if isinstance(value, dict):
        yield value
        for item in value.values():
            yield from objects(item)
    elif isinstance(value, list):
        for item in value:
            yield from objects(item)

def run(label, argv, cwd=ROOT):
    out = BASE / 'checks'
    out.mkdir(parents=True, exist_ok=True)
    started = datetime.datetime.now(datetime.timezone.utc).isoformat()
    p = subprocess.run(argv, cwd=cwd, text=True, capture_output=True)
    (out / (label + '.stdout.actual.txt')).write_text(p.stdout)
    (out / (label + '.stderr.actual.txt')).write_text(p.stderr)
    write(out / (label + '.terminal.actual.json'), {'commandArgv': argv, 'cwd': str(cwd), 'startedAtUTC': started, 'finishedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'exitCode': p.returncode, 'technicalOnly': True})
    print(label, 'exit', p.returncode, p.stdout.strip().splitlines()[-2:])
    assert p.returncode == 0, p.stderr

def targets(gid):
    return [ROOT / f'curricula/DE/Gymnasium/visualizations/chemie/{gid}/{gid}.png', ROOT / f'app/public/assets/goal-visualizations/chemie/{gid}/{gid}.png', ROOT / f'backend/src/main/resources/static/assets/goal-visualizations/chemie/{gid}/{gid}.png', ROOT / f'curricula/DE/Gymnasium/visualizations/chemie/{gid}/prompt.de.md']

def initialize():
    inv = read(INVENTORY)
    paths = {INVENTORY, PREP / 'README.md', PREP / 'FINAL.immutable-preparation-seal.json', AUTHOR / 'FINAL.author-package.freeze.json', AUTHOR / 'candidate/whole523-six-child-DE15-deck.inactive.json', AUTHOR / 'candidate/semantic-kinds.current523.DE15-deck.inactive.json'}
    verified = {}
    # Verify actual declared file bytes/hashes in the technical inventory and v7 seal.
    for obj in objects([inv, read(AUTHOR / 'FINAL.author-package.freeze.json')]):
        if isinstance(obj.get('path'), str) and isinstance(obj.get('sha256'), str) and (ROOT / obj['path']).is_file():
            p = ROOT / obj['path']
            actual = digest(p)
            assert actual['sha256'] == obj['sha256'], (p, obj['sha256'], actual['sha256'])
            if 'bytes' in obj:
                assert actual['bytes'] == obj['bytes'], p
            verified[rel(p)] = actual
    for filename in ['native-current-source-atlas382.closed-carriers.inactive.config.json', 'native-current-whole402.inactive.config.json']:
        p = AUTHOR / 'candidate' / filename
        paths.add(p)
        for key, value in read(p).items():
            if key != 'outputPath' and key.endswith('Path') and isinstance(value, str):
                paths.add(ROOT / value)
            if key.endswith('Paths') and isinstance(value, list):
                paths.update(ROOT / v for v in value)
    for name in ['prepare_goal_visualization.mjs', 'import_goal_visualization.mjs', 'goal_visualization_common.mjs', 'check_goal_visualization_assets.mjs']:
        paths.add(ROOT / 'scripts' / name)
    for name in ['buildGoalBookModel.ts', 'goalBookModel.ts', 'goalVisualizationQaModel.ts', 'checkGoalVisualizationQaApprovalCoverage.ts']:
        paths.add(ROOT / 'app/scripts' / name)
    a = read(ROOT / inv['V6']['priorActualIndependentA']['path'])
    b = read(ROOT / inv['V6']['priorActualIndependentB']['path'])
    land = read(AUTHOR / 'candidate/whole523-six-child-DE15-deck.inactive.json')
    six = []
    for row in inv['V6']['rows']:
        gid = row['goalId']; goal = next(g for g in land['goals'] if g['id'] == gid)
        ar = next(r for r in a['verdicts'] if r['goalId'] == gid)
        br = next(r for r in b['records'] if r['goalId'] == gid)
        assert goal == row['wholeCandidateGoal'] == row['currentExactWholeVisualTuple']['wholeGoal'] == ar['wholeCurrentGoal'], gid
        actual = digest(ROOT / row['actualAsset']['path'])
        assert actual['sha256'] == ar['aiApprovedAssetSha256'] == br['aiApprovedAssetSha256'] == br['assetSha256'], gid
        assert ar['aiApproved'] == br['aiApproved'] == 'yes' and ar['decision'] in ['accepted_pilot', 'accepted_pilot_after_regeneration'], gid
        assert br['humanApproved'] == row['ordinaryCandidateQA']['humanApproved'] == 'no' and br['humanIssueIdentified'] == 'no', gid
        assert row['genuineBScientificDecision'] == 'keep', gid
        assert all(not p.exists() for p in targets(gid)), (gid, 'authorized new target already exists')
        paths.add(ROOT / ar['actualProviderPrompt']['path'])
        six.append({'goalId': gid, 'wholeGoal': goal, 'actualVisualTuple': row['currentExactWholeVisualTuple'], 'independentARecord': ar, 'independentBRecord': br, 'exactWholeGoalEquality': True, 'actualImageApprovalHashEquality': True, 'targetPrestate': [{'path': rel(p), 'exists': False} for p in targets(gid)]})
    registry = ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
    guards = {registry}
    for subject in read(registry)['subjects']:
        if subject.get('subject') in ['chemie', 'biologie']:
            for obj in objects(subject):
                for value in obj.values():
                    if isinstance(value, str) and value.startswith(('curricula/', 'app/', 'backend/')) and (ROOT / value).is_file():
                        guards.add(ROOT / value)
                    elif isinstance(value, list):
                        guards.update(ROOT / v for v in value if isinstance(v, str) and v.startswith(('curricula/', 'app/', 'backend/')) and (ROOT / v).is_file())
    for folder in ['curricula/DE/Gymnasium/memory-decks', 'app/public/data', 'backend/src/main/resources/static/data']:
        guards.update((ROOT / folder).glob('*chemistry*.json'))
    guards.update(ROOT / f'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_{s}.de.json' for s in ['CHEMIE', 'BIOLOGIE'])
    for s in ['chemie', 'biologie']:
        guards.add(ROOT / f'curricula/DE/Gymnasium/quality/goal-visualization-qa/{s}.qa.json')
        guards.add(ROOT / f'curricula/DE/Gymnasium/quality/goal-book-publication/{s}.semantic-kinds.json')
    write(BASE / 'FIRST.technical-adoption-inputs.actual.json', {'schemaVersion': 1, 'createdAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'role': 'Technical adoption of existing genuine independent A/B V decisions; no new scientific or human review', 'explicitInputFiles': [digest(p) for p in sorted(paths)], 'verifiedInventoryAndAuthorSealFiles': list(verified.values()), 'activeAndHelperGuards': [digest(p) for p in sorted(guards | {p for p in paths if '/scripts/' in str(p)})], 'sixFullVerifiedTuples': six, 'strictGain': 0, 'humanApproval': False, 'generation': False})
    assert not LANDSCAPE.exists() and not QA.exists() and not SEMANTIC.exists()
    LANDSCAPE.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(AUTHOR / 'candidate/whole523-six-child-DE15-deck.inactive.json', LANDSCAPE)
    sem = read(AUTHOR / 'candidate/semantic-kinds.current523.DE15-deck.inactive.json')
    sem['sourceLandscapePath'] = rel(LANDSCAPE)
    write(SEMANTIC, sem)
    print('FIRST', len(verified), 'verified inventory/seal files;', len(guards), 'active guards; six exact tuples')

def import_images():
    first = read(BASE / 'FIRST.technical-adoption-inputs.actual.json')
    # Prepare's standard scratch directory already belongs to prior runs. Byte-identical
    # helper copies isolate its ROOT_DIR without changing any helper implementation.
    with tempfile.TemporaryDirectory(prefix='skillpilot-b007-v7-ordinary-prepare-') as tmp:
        scratch = pathlib.Path(tmp)
        (scratch / 'scripts').mkdir()
        for name in ['prepare_goal_visualization.mjs', 'goal_visualization_common.mjs']:
            shutil.copyfile(ROOT / 'scripts' / name, scratch / 'scripts' / name)
            assert hashlib.sha256((scratch / 'scripts' / name).read_bytes()).digest() == hashlib.sha256((ROOT / 'scripts' / name).read_bytes()).digest()
        for row in first['sixFullVerifiedTuples']:
            gid = row['goalId']; link = row['wholeGoal']['resourceLinks'][0]
            assert link['provider'] == 'OpenAI / Codex built-in image_gen' and link['license'] == 'CC-BY-4.0'
            run('prepare-' + gid, ['node', str(scratch / 'scripts/prepare_goal_visualization.mjs'), '--goal', gid, '--landscape', str(LANDSCAPE), '--subject', 'chemie', '--lang', link['lang'], '--provider', link['provider'], '--review-status', link['reviewStatus']])
            shutil.copytree(scratch / 'tmp/goal-visualizations' / gid, BASE / 'prepared' / gid)
            run('import-' + gid, ['node', 'scripts/import_goal_visualization.mjs', '--goal', gid, '--image', row['actualVisualTuple']['originalPNG']['path'], '--landscape', rel(LANDSCAPE), '--subject', 'chemie', '--lang', link['lang'], '--provider', link['provider'], '--review-status', link['reviewStatus'], '--license', link['license'], '--description', link['description'], '--alt-text', link['altText'], '--prompt', row['actualVisualTuple']['generationPrompt']['path']])
    assert read(LANDSCAPE) == read(AUTHOR / 'candidate/whole523-six-child-DE15-deck.inactive.json'), 'whole523 altered beyond serialization'
    inv = read(INVENTORY)
    original_qa = read(ROOT / inv['V6']['currentAuthorUnapprovedLedger']['path'])
    qa = copy.deepcopy(original_qa)
    changes = []
    for row in first['sixFullVerifiedTuples']:
        gid = row['goalId']; prior = next(r for r in qa['records'] if r['goalId'] == gid)
        replacement = copy.deepcopy(row['independentBRecord'])
        replacement.update({'landscapePath': rel(LANDSCAPE), 'publicAssetPath': rel(targets(gid)[1]), 'canonicalAssetPath': rel(targets(gid)[0])})
        assert {k:v for k,v in prior.items() if k.startswith('human')} == {k:v for k,v in replacement.items() if k.startswith('human')}
        qa['records'][qa['records'].index(prior)] = replacement
        changes.append({'goalId': gid, 'authorStagingRecord': prior, 'exactIndependentBSourceRecord': row['independentBRecord'], 'finalCandidateRecord': replacement, 'pathRebindingsAgainstB': {k: {'before': row['independentBRecord'][k], 'after': replacement[k]} for k in ['landscapePath', 'publicAssetPath', 'canonicalAssetPath']}, 'preservedAllOtherBFields': True, 'preservedAllHumanFieldsAgainstAuthorAndB': True})
    assert len(qa['records']) == len(original_qa['records']) == 412
    assert len({r['goalId'] for r in qa['records']}) == 412
    write(QA, qa)
    write(BASE / 'adoption/six-approved-ai.path-rebinding-and-author-staging-history.actual.json', {'technicalAdoptionOnly': True, 'originalQaRows': 412, 'originalSixWereAlreadyPresent': True, 'unchangedOtherRows': 406, 'finalUniqueRows': 412, 'records': changes})
    for name in ['native-current-source-atlas382.closed-carriers.inactive.config.json', 'native-current-whole402.inactive.config.json']:
        config = read(AUTHOR / 'candidate' / name)
        config.update({'landscapePath': rel(LANDSCAPE), 'semanticKindLedgerPath': rel(SEMANTIC), 'goalVisualizationQaPath': rel(QA), 'outputPath': rel(BASE / 'native' / ('source382.normal.book-model.json' if 'source-atlas382' in name else 'whole402.normal.book-model.json'))})
        write(BASE / 'configs' / name, config)
    print('IMPORTS KEEP; whole523 exact; QA 406 unchanged plus six B approvals; Human fields exact')

if __name__ == '__main__':
    {'initialize': initialize, 'import': import_images}[sys.argv[1]]()
