# SPDX-License-Identifier: Apache-2.0
"""Bind two actual independent native-page reviews; never invent review votes."""
from pathlib import Path
import datetime
import hashlib
import json
import os
import shutil
import subprocess
import time

R = Path('/home/enpasos/projects/skillpilot')
T = R / 'tmp/chemie-m7-resumed-20261016'
L = T / 'chemie-shared640-recycling-native-author-capsule-L6-v1'
NREL = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-current439-new459-and-F03-native-two-private-L6-technical-20261016-v1')
N = L / NREL
CFG = N / 'native-two.stock.config.json'
OUT = N / 'native-two'
LOG = T / 'actual-finalize-native-new-two-current439-root-v1'
IDS = ['459724db-9f9a-5967-8d9a-2b6277415275', '8b2d351e-e44f-5385-9b89-13ef54b5918f']
C = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')


def digest(p):
    return 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()


def pin(p):
    return {'path': str(p.relative_to(R)), 'sha256': digest(p), 'bytes': p.stat().st_size}


def private_parents(p):
    p.relative_to(L)
    q = p.parent
    while q != L.parent:
        assert not q.is_symlink(), f'Cannot write through capsule symlink: {q}'
        q = q.parent


def new_json(p, value):
    assert not p.exists(), p
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    json.loads(p.read_text())


assert digest(R / C) == 'sha256:9a68501347031f266572dea551e71c3507b66fb5ed94142a1a99f6a282708960'
assert digest(L / C) == 'sha256:37e092408007e0c8c675beda79b667e8dced936c7ec33742082340fcc77fdc80'
assert json.loads(CFG.read_text())['goalIds'] == IDS
assert not LOG.exists(), 'Execution folder already exists; inspect it rather than restarting'
private_parents(OUT / 'synthesis-authoring.actual-root.json')
LOG.mkdir()
sources = [
    ('round-a', T / 'new459-F03-native2-fresh-description-a-v1/stock-results',
     'sha256:ada00c89f242cdd4a3f250ea521bcf506465a17913a9967019119af883aef6c8',
     'sha256:1a1734a482dcc6c9923935ad5dd0f68609df20b1ba9c3a6b06b66e38036a858a'),
    ('round-b', T / 'new459-F03-native2-fresh-description-b2-v1/results',
     'sha256:e2b0977eb3d737cf484ac809cf528859127cbf836377bfa55815ee2aaca7ef95',
     'sha256:a344424398dbb460205e95bbd5c8a90cecbfa04b2d0bc6263a7d2f0cb342bcbb'),
]
verified = []
groups = []
for round_name, folder, record_digest, run_digest in sources:
    records_path, = folder.glob('*.records.jsonl')
    run_path, = folder.glob('*.run.json')
    assert digest(records_path) == record_digest
    assert digest(run_path) == run_digest
    records = [json.loads(line) for line in records_path.read_text().splitlines()]
    run = json.loads(run_path.read_text())
    assert [row['goalId'] for row in records] == IDS
    assert run['blindToOtherRuns'] is True and run['status'] == 'completed'
    assert run['outputDigest'] == digest(records_path)
    assert all(row['decision'] == 'keep' and row['evidenceProfileRecommendation'] == 'none' for row in records)
    assert all(row['reviewAuthority'] == 'ai_candidate' and row['recordStatus'] == 'candidate' for row in records)
    groups.append(run['independenceGroupId'])
    for p in [records_path, run_path]:
        dest = OUT / round_name / 'results' / p.name
        private_parents(dest)
        assert not dest.exists(), dest
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(p, dest)
        assert p.read_bytes() == dest.read_bytes()
        verified.append({'source': pin(p), 'destination': pin(dest)})
assert len(set(groups)) == 2
authoring = OUT / 'synthesis-authoring.actual-root.json'
new_json(authoring, {
    'schemaVersion': 1,
    'manifestId': 'chemie-current439-new459-F03-actual-native-two-paired-root-synthesis-20261016-v1',
    'synthesizedBy': 'Codex root informed synthesis of actual independent current native A and B2 reviews; machine only, no human attestation',
    'decisions': [
        {
            'goalId': IDS[0], 'resolutionDecision': 'keep_current', 'evidenceRound': 'first',
            'rationaleDe': 'Beide eigenständigen aktuellen Beschreibungsprüfungen bestätigen den kohärenten PMMA-Routenvergleich anhand ganzer bilingualer Fälle, echter Quellenseite und vollständiger nativer Lernzielseite. Die gemeinsame geeignete Produktmenge, Kettenerhaltung gegenüber Monomerrückgewinnung und die geänderte Qualitätsanforderung mit Neumaterial erzeugen begründeten Transfer: 69 kWh/87 EUR gegenüber 60 kWh/90 EUR statt bloßer Wiederholung der ersten Rangfolge. Umweltgrenzen und der gemeinsame GK/LK-Quellenumfang bleiben ausdrücklich begrenzt. Bestehendes Profil und tatsächliche Abbildung bleiben passend. Die offengelegte beiläufige Metadatenexposition von A bleibt erhalten; A las keine anderen Review-Runs oder Peer-Begründungen. Der nicht blind deklarierte frühere B-Kandidat wird nicht gezählt; ausgewählt ist der eigenständig versiegelte B2-Lauf.',
            'rationaleEn': 'Both independent current description reviews confirm the coherent PMMA route comparison using complete bilingual cases, the actual primary source and the complete native goal page. A common suitable output, retained chains versus monomer recovery and a changed quality requirement involving virgin material provide reasoned transfer: 69 kWh/87 EUR versus 60 kWh/90 EUR rather than repeating the first ranking. Environmental inference and the common GK/LK source scope remain bounded. The existing profile and actual image remain suitable. A\'s disclosed incidental metadata exposure is retained; A read no other review runs or peer reasoning. The earlier B candidate declared non-blind is not counted; the selected B2 run has its own sealed scientific first pass.'
        },
        {
            'goalId': IDS[1], 'resolutionDecision': 'keep_current', 'evidenceRound': 'first',
            'rationaleDe': 'Beide aktuellen eigenständigen Prüfungen bestätigen den einen Untersuchungszusammenhang aus eigener betreuter Löslichkeitsmessung, Diagramm und kausaler Kristallisationsbilanz. Ganze bilinguale Materialien und Rechnungen decken steigende, nahezu flache und gegeben fallende Verläufe, Messunsicherheit und Wasserverlust statt einer universellen Abkühlregel ab. Originalquelle und vollständige native Seite sind tatsächlich geprüft; der fakultative Sek-I-Status bleibt erhalten. Synthetische Vergleichsdaten belegen keine spätere eigene Durchführung. Vorhandenes Profil und Beispielbild bleiben passend; Untersuchung und substanzieller Transfer können zusammen genügen, ohne Zwei-Praktika-Quote oder Human-Approval-Behauptung. A-Metadatenexposition ist dokumentiert, fremde Run-Ergebnisse wurden nicht gelesen; gezählt wird nur das aktuelle unabhängige B2, nicht der frühere eingeschränkte B-Kandidat.',
            'rationaleEn': 'Both current independent reviews confirm one coherent investigation connecting supervised own solubility measurement, graphing and causal crystallisation balances. Complete bilingual materials and calculations cover increasing, nearly flat and supplied decreasing curves, measurement uncertainty and solvent loss rather than a universal cooling rule. The original source and complete native page were actually inspected; facultative lower-secondary status is preserved. Synthetic comparison data do not prove later own practical performance. The existing profile and example image remain suitable; an investigation and substantive transfer can suffice together without a two-practical quota or human approval claim. A\'s metadata exposure is documented with no other run results read; only current independent B2 is counted, not the earlier restricted B candidate.'
        },
    ]
})
config_rel = str(CFG.relative_to(L))
commands = [
    ['app/scripts/materializeGoalDescriptionRolloutBatch.ts', 'summarize', '--config', config_rel, '--write'],
    ['app/scripts/materializeGoalDescriptionRolloutSynthesisManifest.ts', '--config', config_rel, '--authoring', str(authoring.relative_to(L)), '--write'],
    ['app/scripts/materializeGoalDescriptionRolloutResolutions.ts', '--config', config_rel, '--synthesis-manifest', str((OUT / 'synthesis-decisions.json').relative_to(L)), '--write'],
    ['app/scripts/materializeGoalDescriptionRolloutBatch.ts', 'finalize', '--config', config_rel, '--write'],
]
receipts = []
for index, args in enumerate(commands, 1):
    started = datetime.datetime.now(datetime.timezone.utc).isoformat()
    before = time.monotonic()
    argv = ['node', '--preserve-symlinks', '--preserve-symlinks-main', '--import', str(R / 'app/node_modules/tsx/dist/loader.mjs'), *args]
    run = subprocess.run(argv, cwd=L, capture_output=True, text=True)
    (LOG / f'{index}.stdout.actual.txt').write_text(run.stdout)
    (LOG / f'{index}.stderr.actual.txt').write_text(run.stderr)
    receipt = {'argv': argv, 'startedAt': started, 'elapsedSeconds': time.monotonic() - before, 'exitCode': run.returncode}
    new_json(LOG / f'{index}.execution.actual.json', receipt)
    receipts.append(receipt)
    print(json.dumps({'step': index, 'exitCode': run.returncode, 'stdout': run.stdout[-2200:], 'stderr': run.stderr[-1800:]}), flush=True)
    if run.returncode:
        raise SystemExit(run.returncode)
assert digest(R / C) == 'sha256:9a68501347031f266572dea551e71c3507b66fb5ed94142a1a99f6a282708960'
assert digest(L / C) == 'sha256:37e092408007e0c8c675beda79b667e8dced936c7ec33742082340fcc77fdc80'
index = json.loads((OUT / 'resolution-index.json').read_text())
assert len(index['resolutions']) == 2 and all(row['strictDescriptionComplete'] for row in index['resolutions'])
new_json(LOG / 'OUTPUTS.actual-new-native-two-D-complete.selector.json', {
    'role': 'Two actual newly completed strict description bindings, not full-current439 M7',
    'inputs': verified, 'config': pin(CFG), 'synthesisAuthoring': pin(authoring),
    'resolutionIndex': pin(OUT / 'resolution-index.json'), 'actualCommands': receipts,
    'newDescriptionCompletions': 2, 'restoredOldBindings': 0,
    'wholeCurrent439CentralReportRun': False, 'M7': False, 'HumanApproval': False, 'HumanTrial': False,
})
