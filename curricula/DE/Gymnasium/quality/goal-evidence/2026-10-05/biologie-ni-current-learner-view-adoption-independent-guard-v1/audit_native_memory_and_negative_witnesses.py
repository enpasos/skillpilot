#!/usr/bin/env python3
"""Independent physical native checker; mutations confined to own tiny input root."""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
CAND = OUT.parent / 'biologie-ni-current-learner-view-adoption-candidate-v1'
TMP = ROOT / 'tmp/biologie-ni-view-independent-native-memory-root'
CLUSTER = '9cd0dbbc-9507-5879-8c4f-df54529969ec'
VIEWS = [Path('curricula/DE/Gymnasium/composition-views/biologie/de-de-gym-seki-biology.view.json'),
         Path('curricula/DE/Gymnasium/composition-views/biologie/de-de-gym-biology-gk.view.json')]

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def alias(rel):
    dest = TMP / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.is_symlink():
        assert dest.resolve() == (ROOT / rel).resolve()
    else:
        assert not dest.exists()
        dest.symlink_to(ROOT / rel, target_is_directory=True)

assert (ROOT / 'app/scripts/memoryCardReview.ts').exists(), ROOT
TMP.mkdir(parents=True, exist_ok=True)
for rel in ['curricula/DE/Gymnasium/canonical', 'curricula/DE/Gymnasium/quality/goal-evidence',
            'app/public/data']:
    alias(rel)
physical = TMP / 'app/scripts/memoryCardReview.ts'
physical.parent.mkdir(parents=True, exist_ok=True)
shutil.copyfile(ROOT / 'app/scripts/memoryCardReview.ts', physical)
assert sha(physical) == sha(ROOT / 'app/scripts/memoryCardReview.ts')
assert sha(physical) == '9e06425851e85d22b284530e81a459c120c200fd0a019446ff87953c538c2672'
config = CAND / 'full-memory.current-learner-views.config.json'
cfg = json.loads(config.read_text())
assert cfg['visibilityScopeCoverageRequired'] is True
assert {x['viewPath'] for x in cfg['visibilityScopes']} == {str(x) for x in VIEWS}
canonical = ROOT / cfg['landscapePath']
goals = {g['id']: g for g in json.loads(canonical.read_text())['goals']}
children = goals[CLUSTER]['contains']
assert len(children) == 20
originals = {rel: (CAND / 'prospective-input-tree' / rel).read_bytes() for rel in VIEWS}
before_active = {str(p): sha(ROOT / p) for p in VIEWS}
inputs = [config, canonical, ROOT / cfg['reviewPath'], ROOT / cfg['cardReviewPath']]
for g in goals.values():
    if any(t.startswith('srs-deck:') for t in g.get('tags', [])):
        for key in ['vocabularySource', 'vocabularySourceEn']:
            source = g['extendedData'][key]
            inputs.append(ROOT / ('app/public' + source if source.startswith('/data/') else source))
input_hashes = {str(p.relative_to(ROOT)): sha(p) for p in inputs}

def restore():
    for rel, data in originals.items():
        dest = TMP / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        assert not dest.is_symlink()
        dest.write_bytes(data)

restore()
cmd = [str(ROOT / 'app/node_modules/.bin/tsx'), str(physical),
       '--config=' + str(config.relative_to(ROOT)), '--mode=check']

def invoke(label, expected_exit):
    started = datetime.now(timezone.utc).isoformat()
    result = subprocess.run(cmd, cwd=TMP / 'app', text=True, capture_output=True)
    (OUT / f'{label}.stdout.txt').write_text(result.stdout)
    (OUT / f'{label}.stderr.txt').write_text(result.stderr)
    assert result.returncode == expected_exit, (label, result.returncode, result.stdout, result.stderr)
    assert result.stderr == '', (label, result.stderr)
    receipt = {'startedAtUTC': started, 'finishedAtUTC': datetime.now(timezone.utc).isoformat(),
               'command': cmd, 'cwd': str(TMP / 'app'), 'exitCode': result.returncode,
               'physicalNativeCodeSHA256': sha(physical), 'configSHA256': sha(config),
               'physicalViewSHA256': {str(p): sha(TMP / p) for p in VIEWS},
               'stdoutSHA256': sha(OUT / f'{label}.stdout.txt'),
               'stderrSHA256': sha(OUT / f'{label}.stderr.txt'),
               'reportRequested': False, 'activeWrites': False}
    (OUT / f'{label}.actual.receipt.json').write_text(json.dumps(receipt, indent=2) + '\n')
    return result.stdout

positive = invoke('independent-native-memory383-final-views', 0)
expected_counts = {'Ordinary atomic goals in scope':383, 'Current no-memory decisions':373,
                   'Current memory-required decisions':10, 'Current needs developer review':0,
                   'Memory goals in scope':3, 'Traced memory goals':3, 'Known deck IDs':3,
                   'Deck files':6, 'Card rows':54, 'Primary cards in scope':27,
                   'Kept primary cards':27, 'Cards marked remove':0,
                   'Cards needing developer review':0, 'Missing review records':0,
                   'Stale review records':0, 'Obsolete review records':0,
                   'Missing card review records':0, 'Stale card review records':0,
                   'Obsolete card review records':0, 'Composition visibility scopes':2,
                   'Memory-required goals checked in views':17,
                   'Memory-required goals without visible memory node':0}
for key, value in expected_counts.items():
    assert f'{key}: {value}\n' in positive, (key, value)

negative_results = []
for label, missing, origin in [('tree','1a7d8063-5b3b-55fd-b8ea-8701d876888e','87ce1746-9904-56ad-9705-ffabbd918c5b'),
                               ('vertebrate','b00dd3d9-8589-584c-a8cf-12efb4856dfe','9425347d-25bd-5095-9198-7574f255c938')]:
    def substitute(node):
        if isinstance(node, dict):
            if node.get('kind') == 'canonicalSubtree' and node.get('goalId') == CLUSTER:
                # Exactly the same canonical nodes, except this single memory node.
                return {'kind':'structure', 'id':'independent-negative-only-NI',
                        'title':'Temporary negative witness',
                        'children':[{'kind':'goalEntry','goalId':gid}
                                    for gid in [CLUSTER] + children if gid != missing]}
            return {key: substitute(value) for key,value in node.items()}
        if isinstance(node, list):
            return [substitute(value) for value in node]
        return node
    for rel, data in originals.items():
        (TMP / rel).write_text(json.dumps(substitute(json.loads(data)), indent=2) + '\n')
    try:
        output = invoke(f'independent-native-negative-missing-{label}', 1)
        assert 'Memory-required goals checked in views: 17\n' in output
        assert 'Memory-required goals without visible memory node: 2\n' in output
        issues = output.split('Memory visibility issues\n',1)[1].split('\nBlocking issues',1)[0]
        per_view = [line for line in issues.splitlines() if 'is visible, but none' in line]
        assert len(per_view) == 2 and all(origin in line for line in per_view), issues
        assert f'[{missing}] is not visible in any configured scope' in issues
        assert all(str(p) in issues for p in VIEWS)
        negative_results.append({'omittedMemoryGoal':missing, 'ordinaryMemoryRequiredOrigin':origin,
                                 'expectedActualExitCode':1, 'perViewIssues':2,
                                 'coverageRequiredFailure':True,
                                 'onlyOwnPhysicalViewInputsChanged':True})
    finally:
        restore()
    assert all(sha(TMP / p) == hashlib.sha256(originals[p]).hexdigest() for p in VIEWS)

assert input_hashes == {str(p.relative_to(ROOT)): sha(p) for p in inputs}
assert before_active == {str(p): sha(ROOT / p) for p in VIEWS}
result = {'schemaVersion':1, 'checkedAtUTC':datetime.now(timezone.utc).isoformat(),
          'reviewer':'/root/chem_qa_native_guard', 'result':'PASS',
          'candidateFinalFreezeSHA256':sha(CAND / 'learner-view-adoption-candidate.final.freeze.json'),
          'candidateFinalViews':{str(p):sha(TMP / p) for p in VIEWS},
          'physicalNativeCodeSHA256':sha(physical), 'actualPositiveNativeExitCode':0,
          'actualPositiveCounts':expected_counts, 'twoIndependentActualNegativeWitnesses':negative_results,
          'allFrozenCurrentMemoryCardAndDeckInputSHA256Exact':input_hashes,
          'ownFinalViewsRestoredExactly':True, 'activeViewsUnchangedThroughout':before_active,
          'fullCopiesOrAssetCopies':False, 'activeWrites':False,
          'newScientificCompletions':0, 'humanApproval':False, 'humanTrial':False}
(OUT / 'independent-native-memory383-cards-and-two-negative-witnesses.actual.json').write_text(json.dumps(result, indent=2) + '\n')
print('PASS: unmodified native M383, 27 kept primary cards, 2 scopes, 17 visible occurrences; both independent removal negatives exit 1; exact restoration; no active writes.')
