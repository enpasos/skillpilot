"""Run normal native preparation on exact inputs in a small ignored capsule."""
import json
import re
import shutil
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
CAP = ROOT / 'tmp/chemie-q3-current217-native-capsule'
E = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12')
OUT = E / 'chemie-q3-three-current402-current217-preserving-root-preparation-20261012-v9'
V8 = E / 'chemie-q3-three-current402-real-method-source-author-20261012-v8'
assert not CAP.exists()

def read(p):
    return json.loads((ROOT / p).read_text())

def put(p, d):
    f = ROOT / p
    assert not f.exists(), f
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')

def exact_copy(p):
    src, dst = ROOT / p, CAP / p
    assert src.is_file() and not src.is_symlink(), src
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src, dst)

batch_path = OUT / 'configs/native-D3.current217.batch.config.json'
put(batch_path, {
    '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json',
    'schemaVersion': 1, 'batchId': 'chemie-q3-three-current217-preserving-root-20261012-v9',
    'subject': 'chemie', 'subjectLabel': 'Chemie',
    'bookId': 'chemie-q3-three-current217-native-v9',
    'title': 'Chemie – Gleichgewicht, Spannungsreihe und Primärzellen',
    'baseGoalBookConfigPath': str(OUT / 'configs/whole402.inactive.config.json'),
    'goalIds': ['81373fb7-2a4a-5b2c-acd0-b4e775acaa65', '8be14f15-2258-58e6-ae4e-38953f5d0570', 'c8844ac6-c414-5a0e-9fcd-7d0a82177d09'],
    'outputDirectory': str(OUT / 'native-D3'),
    'feedbackBaseUrl': 'https://skillpilot.com/lernziel-feedback',
    'promptPath': 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md',
    'criteriaPath': 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md',
    'publicRoot': 'app/public', 'printDerivativeProfile': 'standard',
})
CAP.mkdir()
seen = set()
stack = [Path('app/scripts/materializeGoalDescriptionRolloutBatch.ts')]
while stack:
    p = stack.pop()
    if p in seen:
        continue
    seen.add(p)
    exact_copy(p)
    if p.suffix not in {'.ts', '.tsx', '.js', '.mjs'}:
        continue
    text = (ROOT / p).read_text()
    for spec in re.findall(r'(?:from\s*|import\s*)[\'\"]([^\'\"]+)[\'\"]', text):
        if not spec.startswith('.'):
            continue
        base = p.parent / spec
        choices = [base, Path(str(base) + '.ts'), Path(str(base) + '.tsx'), Path(str(base) + '.js'), Path(str(base) + '.json'), base / 'index.ts']
        resolved = next((x for x in choices if (ROOT / x).is_file()), None)
        assert resolved, (p, spec)
        stack.append(resolved)
for src in (ROOT / 'contracts').rglob('*'):
    if src.is_file() and not src.is_symlink():
        exact_copy(src.relative_to(ROOT))
full = read(OUT / 'configs/whole402.inactive.config.json')
inputs = [batch_path, OUT / 'configs/whole402.inactive.config.json', Path(full['landscapePath']), Path(full['compositionViewPath']), Path(full['semanticKindLedgerPath']), Path(full['goalVisualizationQaPath']), *map(Path, full['evidenceReviewPaths']), Path('app/package.json'), Path('app/tsconfig.json')]
batch = read(batch_path)
inputs += [Path(batch['promptPath']), Path(batch['criteriaPath'])]
for p in inputs:
    exact_copy(p)
assets = read(OUT / 'checks/normal-current402-model-and-target-three.actual.json')['actualAvailableAssetDigestsVerified']
qa = {r['goalId']: r for r in read(full['goalVisualizationQaPath'])['records']}
targets = set(batch['goalIds'])
for asset in assets:
    p = Path(qa[asset['goalId']]['publicAssetPath'])
    dst = CAP / p
    dst.parent.mkdir(parents=True, exist_ok=True)
    if asset['goalId'] in targets:
        shutil.copyfile(ROOT / asset['path'], dst)
    else:
        dst.symlink_to(ROOT / asset['path'])
(CAP / 'app/node_modules').symlink_to(ROOT / 'app/node_modules', target_is_directory=True)
print(json.dumps({'capsule': str(CAP), 'exactCodeDependencyFiles': len(seen), 'currentAssetsBound': len(assets), 'copiedTargetImages': 3, 'nativePagesToRender': 3, 'activeWrites': False}))
