"""Additive adoption preparation; sealed science and active files stay intact."""
import copy
import datetime
import hashlib
import json
import pathlib
import shutil

ROOT = pathlib.Path('/home/enpasos/projects/skillpilot')
E = pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12')
OLD = E / 'chemie-q2-four-final-resource-metadata-current402-root-preparation-20261012-v2'
FIRST = E / 'chemie-q2-four-joint-current402-root-integration-preparation-20261012-v1'
OUT = E / 'chemie-q2-four-current402-normal-integration-root-20261012-v3'
LIVE = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
SEM = 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
REG = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'

def read(p):
    return json.loads((ROOT / p).read_text())

def put(p, data):
    dst = ROOT / p
    assert not dst.exists(), dst
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

def sha(p):
    return 'sha256:' + hashlib.sha256((ROOT / p).read_bytes()).hexdigest()

assert not (ROOT / OUT).exists()
shutil.copytree(ROOT / OLD / 'native-D4', ROOT / OUT / 'native-D4')
batch = read(OLD / 'configs/native-D4.batch.config.json')
batch['outputDirectory'] = str(OUT / 'native-D4')
batch_path = OUT / 'configs/native-D4.batch.config.json'
put(batch_path, batch)
manifest = read(OUT / 'native-D4/batch-manifest.json')
manifest['configPath'] = str(batch_path)
manifest['configDigest'] = sha(batch_path)
(ROOT / OUT / 'native-D4/batch-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')

p = read(OLD / 'positive/P4.inactive.config.json')
p.update(landscapePath=LIVE, semanticKindLedgerPath=SEM)
put(OUT / 'active-configs/P4.config.json', p)
a = read(FIRST / 'atomicity/A4.inactive.config.json')
a.update(landscapePath=LIVE, reportPath=str(OUT / 'checks/A4.active.normal.report.md'))
put(OUT / 'active-configs/A4.config.json', a)
m = read(FIRST / 'memory/M402.inactive.config.json')
m.update(landscapePath=LIVE, reportPath=str(OUT / 'checks/M402.active.normal.report.md'))
put(OUT / 'active-configs/M402.config.json', m)

registry = read(REG)
protected = {s['subject']: s for s in registry['subjects'] if s['subject'] != 'chemie'}
put(OUT / 'FIRST.additive-normal-adoption.actual.json', {
    'schemaVersion': 1, 'atUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'role': 'technical-additive-preparation-not-a-new-scientific-verdict',
    'selectedGoalIds': batch['goalIds'], 'strictBaseline': 212, 'currentDenominator': 402,
    'originalPreparedPackagePath': str(OLD),
    'preparedBundleExact': sha(OUT / 'native-D4/bundle/manifest.json') == sha(OLD / 'native-D4/bundle/manifest.json'),
    'preparedModelExact': sha(OUT / 'native-D4/bundle/book-model.json') == sha(OLD / 'native-D4/bundle/book-model.json'),
    'preparedCampaignsFirstPassExact': True,
    'genuineFollowUpReviewsRetainedAsHistory': True,
    'regularDualFirstPassResultsPending': True,
    'activeFilesWritten': False, 'humanApproval': False,
    'activeCanonicalSHA256Before': sha(LIVE), 'activeSemanticLedgerSHA256Before': sha(SEM),
    'activeRegistrySHA256Before': sha(REG),
    'protectedSubjectRegistryFingerprint': 'sha256:' + hashlib.sha256(json.dumps(protected, ensure_ascii=False, sort_keys=True).encode()).hexdigest(),
})
(ROOT / OUT / '.gitignore').write_text('!native-D4/bundle/book.html\n!native-D4/bundle/book.pdf\n')
print(json.dumps({'prepared': str(OUT), 'goalCount': len(batch['goalIds']), 'activeWrites': False}))
