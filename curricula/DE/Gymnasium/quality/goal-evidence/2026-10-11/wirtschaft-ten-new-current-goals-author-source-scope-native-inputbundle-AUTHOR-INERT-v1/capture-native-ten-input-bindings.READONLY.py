"""Capture concrete native inputs before prepare; never mutate active inputs."""
from pathlib import Path
import datetime, hashlib, json

ROOT = Path.cwd()
OUT = Path(__file__).resolve().parent
def read(path):
    return json.loads(Path(path).read_text())
def binding(path):
    path = Path(path)
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT) if path.is_absolute() else path),
            'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

assert not (OUT / 'native').exists(), 'Capture before native preparation only'
config_path = OUT / 'ten-current-new-goals.native-batch.config.json'
config = read(config_path)
ids = set(config['goalIds'])
book = read(ROOT / config['baseGoalBookConfigPath'])
registry_path = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
registry = read(ROOT / registry_path)
economics = next(x for x in registry['subjects'] if x['subject'] == 'wirtschaftswissenschaften')
paths = {registry_path, config['baseGoalBookConfigPath'], config['promptPath'], config['criteriaPath'],
         book['landscapePath'], book['compositionViewPath'], book['semanticKindLedgerPath'],
         book['goalVisualizationQaPath'], *book['evidenceReviewPaths']}
for path in OUT.iterdir():
    if path.is_file():
        paths.add(str(path.relative_to(ROOT)))
for path in (ROOT / 'app/scripts').rglob('*.ts'):
    if path.is_file():
        paths.add(str(path.relative_to(ROOT)))
for directory in ['contracts/goal-description-review', 'contracts/goal-book', 'contracts/goal-evidence']:
    for path in (ROOT / directory).rglob('*.json'):
        paths.add(str(path.relative_to(ROOT)))
selected_configs = []
for path in economics['positiveEvidenceConfigPaths']:
    profile_config = read(ROOT / path)
    if not ids.intersection(profile_config.get('scope', {}).get('goalIds', [])):
        continue
    selected_configs.append(path)
    paths.add(path)
    for key in ['reviewPath', 'reviewCriteriaPath', 'semanticKindLedgerPath', 'landscapePath']:
        if isinstance(profile_config.get(key), str):
            paths.add(profile_config[key])
canonical = read(ROOT / book['landscapePath'])
for goal in canonical['goals']:
    if goal['id'] not in ids:
        continue
    for resource in goal.get('resourceLinks', []):
        url = resource.get('url', '')
        if url.startswith('/') and not url.startswith('//'):
            path = 'app/public' + url
            if (ROOT / path).is_file():
                paths.add(path)
scope = read(OUT / 'actual-ten-current-whole-goals-P20-and-concrete-content-authorship.SCOPING.READONLY.json')
source = read(OUT / 'actual-ten-current-source-edges-whole-atoms-parents-and-partial-bounds.INPUT.json')
for item in scope['authorArtifactBindings'] + source['actualSourceFileBindings']:
    assert binding(ROOT / item['path']) == item, f'Original scoped input changed: {item["path"]}'
    paths.add(item['path'])
for row in scope['goals']:
    fields = ['title', 'titleEn', 'description', 'descriptionEn', 'requires', 'contains', 'tags', 'dimensionTags']
    current = next(g for g in canonical['goals'] if g['id'] == row['goalId'])
    assert all(current.get(f) == row['currentWholeGoal'].get(f) for f in fields)
snapshot = {'artifactKind': 'READONLY_NATIVE_PREPARE_INPUT_BINDINGS_NO_D_VERDICT',
            'observedAtUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
            'bindings': [binding(ROOT / p) for p in sorted(paths)],
            'selectedCurrentPositiveConfigPaths': selected_configs,
            'activeWrites': 0, 'descriptionVerdicts': 0}
with (OUT / 'inputs-before-native-preparation.bindings.json').open('x') as target:
    target.write(json.dumps(snapshot, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'guardPaths': len(paths), 'selectedPConfigs': len(selected_configs), 'goalCount': len(ids)}))
