"""Exact adoption of genuine four-goal context reviews, without new P/V claims."""
import datetime
import hashlib
import json
import pathlib
import shutil

ROOT = next(p for p in pathlib.Path(__file__).resolve().parents if (p / 'AGENTS.md').is_file() and (p / '.git').exists())
E = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11'
PACKAGE = pathlib.Path(__file__).resolve().parent
PREFIX = 'chemie-b007-four-current402-materialized-applicability-targeted-root-20261011-v1-first-pass-'

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def write(path, data):
    assert not path.exists(), path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

reviews = [
    ('a', 'chemie-b007-four-applicability-D-context-targeted-independent-a-20261011-v1',
     'FINAL.immutable-common-D4-current-context-independent-a-seal.json',
     'dc0b6b044625dfddb3f1e920b1d33836c10d2aecf2c852f8887973c41ed3e677', 'shared-root-D4-round-a'),
    ('b', 'chemie-b007-four-applicability-D-context-targeted-independent-b-20261011-v1',
     'FINAL.independent-B.freeze.json',
     '357ed99f21c3dad6559cc77c489b0d386f355a04bb28a8b14c5aeceb4de444b1', 'D4-results'),
]
adopted = []
for lane, folder, sealname, sealsha, results in reviews:
    seal = E / folder / sealname
    assert digest(seal) == sealsha
    for row in json.loads(seal.read_text())['files']:
        assert digest(ROOT / row['path']) == row['sha256'].removeprefix('sha256:'), row['path']
    for extension in ['run.json', 'records.jsonl']:
        source = E / folder / results / (PREFIX + lane + '.batch-001.' + extension)
        target = PACKAGE / 'native-D4' / ('round-' + lane) / 'results' / source.name
        assert not target.exists(), target
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
        assert source.read_bytes() == target.read_bytes()
        adopted.append({'source': str(source.relative_to(ROOT)), 'target': str(target.relative_to(ROOT)), 'sha256': 'sha256:' + digest(target), 'byteExact': True})
config = json.loads((PACKAGE / 'configs/native-D4.batch.config.json').read_text())
for lane, *_ in reviews:
    records = [json.loads(line) for line in (PACKAGE / 'native-D4' / ('round-' + lane) / 'results' / (PREFIX + lane + '.batch-001.records.jsonl')).read_text().splitlines()]
    assert [row['goalId'] for row in records] == config['goalIds']
    assert all(row['decision'] == 'keep' for row in records)
write(PACKAGE / 'native-D4/synthesis-authoring.json', {
    'schemaVersion': 1,
    'manifestId': 'chemie-b007-four-current-materialized-applicability-genuine-dual-synthesis-20261011-v1',
    'synthesizedBy': 'Codex root, synthesis of separate original independent A and B context reviews',
    'decisions': [{
        'goalId': goal,
        'resolutionDecision': 'keep_current', 'evidenceRound': 'first',
        'rationaleDe': 'Beide unabhängigen Reviews haben den aktuellen vollständigen Ziel-, Quellen-, P- und Seitenkontext tatsächlich gelesen und die originalen PNG sowie die ganzen HTML/PDF-Seiten geprüft. Die einzige Zieländerung materialisiert die bereits normal kompilierte Zuständigkeits-/Sichtbarkeitsableitung; 519 andere Ziele, alle Voraussetzungen und fachlichen Texte sind exakt erhalten. Direkte partielle Quellenbeiträge bleiben von bloßer requires-Sichtbarkeit getrennt. Bestehende P-Nachweise werden weder erneut fachlich freigegeben noch abgewertet; ein im begrenzten D-Input fehlendes P-Profil bleibt eine create-Empfehlung ausschließlich für diesen Input. KEEP der aktuellen Beschreibungen mit vier erneuerten geprüften D-Bindungen, null neue fachliche Abschlüsse, null neue Source-Operator-/Human-Freigaben.',
        'rationaleEn': 'Both independent reviewers read the complete current goal, source, P and page contexts and inspected the original PNGs and whole HTML/PDF pages. The only goal change materializes the already normally compiled jurisdiction/visibility derivation; 519 other goals, all prerequisites and scientific texts are exact. Direct partial source contributions remain distinct from requires-derived visibility. Existing P evidence is neither scientifically reapproved nor downgraded; a P profile absent from this limited D input causes only a create recommendation for that input. KEEP the current descriptions with four substantively checked current D bindings, zero new scientific completions, and no whole-source-operator or human approval.',
    } for goal in config['goalIds']],
})
write(PACKAGE / 'checks/exact-independent-D4-adoption.actual.json', {
    'schemaVersion': 1, 'adoptedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'originalIndependentSeals': [row[3] for row in reviews], 'files': adopted,
    'newScientificCompletions': 0, 'contextBindingsReviewed': 4,
    'sourceOperatorHoldsPreserved': True, 'humanApproval': False,
})
print('PASS original independent A/B KEEP4 byte-exact adoption and bounded synthesis authoring')
