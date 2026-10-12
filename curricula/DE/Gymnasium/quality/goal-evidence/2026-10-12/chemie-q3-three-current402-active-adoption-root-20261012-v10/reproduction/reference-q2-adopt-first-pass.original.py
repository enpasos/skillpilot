"""Adopt actual sealed first-pass records; normal tools generate every resolution."""
import datetime
import hashlib
import json
import pathlib
import shutil
import subprocess
import sys

ROOT = pathlib.Path('/home/enpasos/projects/skillpilot')
OUT = pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-four-current402-normal-integration-root-20261012-v3')
CONFIG = OUT / 'configs/native-D4.batch.config.json'
NATIVE = OUT / 'native-D4'

def read(p):
    return json.loads((ROOT / p).read_text())

def sha(p):
    return 'sha256:' + hashlib.sha256((ROOT / p).read_bytes()).hexdigest()

def put(p, value):
    dst = ROOT / p
    assert not dst.exists(), dst
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

assert len(sys.argv) == 5, 'Pass A manifest/seal then B manifest/seal as exact repository paths.'
sources = []
ids = read(CONFIG)['goalIds']
for tag, manifest_path, seal_path in [('a', sys.argv[1], sys.argv[2]), ('b', sys.argv[3], sys.argv[4])]:
    manifest = read(manifest_path)
    freeze = read(seal_path)
    rows = freeze.get('rows', freeze.get('files', []))
    assert rows, seal_path
    for row in rows:
        assert sha(row['path']) == row['sha256'], row['path']
        assert (ROOT / row['path']).stat().st_size == row['bytes'], row['path']
    record_path = pathlib.Path(manifest['recordsPath'])
    run_path = pathlib.Path(manifest['runPath'])
    round_path = record_path.parent.parent
    assert (ROOT / round_path / 'description-review-campaign.json').read_bytes() == (ROOT / NATIVE / f'round-{tag}/description-review-campaign.json').read_bytes()
    records = [json.loads(line) for line in (ROOT / record_path).read_text().splitlines()]
    assert [r['goalId'] for r in records] == ids
    assert all(r['decision'] == 'keep' for r in records)
    assert read(round_path / 'description-review-campaign.json')['reviewPass'] == 'first_pass'
    for src in [record_path, run_path]:
        dst = ROOT / NATIVE / f'round-{tag}/results' / src.name
        assert not dst.exists(), dst
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(ROOT / src, dst)
    sources.append({'round': tag, 'manifestPath': manifest_path, 'manifestSHA256': sha(manifest_path),
                    'sealPath': seal_path, 'sealSHA256': sha(seal_path),
                    'recordsPath': str(record_path), 'recordsSHA256': sha(record_path),
                    'runPath': str(run_path), 'runSHA256': sha(run_path)})
put(OUT / 'checks/actual-sealed-first-pass-adoption.actual.json', {
    'schemaVersion': 1, 'atUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'actualIndependentSources': sources, 'allSealedInputBytesVerified': True,
    'firstPassCampaignsPreservedByteExact': True, 'fourKeepRecordsPerActualRound': True,
    'reviewResultsRewrittenOrInvented': False, 'humanApproval': False,
})
authoring_path = NATIVE / 'synthesis-authoring.json'
put(authoring_path, {
    'schemaVersion': 1, 'manifestId': 'chemie-q2-four-final-current402-genuine-first-pass-synthesis-20261012-v3',
    'synthesizedBy': 'Codex root, synthesis of separate genuine current first-pass A and B reviews',
    'decisions': [{
        'goalId': gid, 'resolutionDecision': 'keep_current', 'evidenceRound': 'first',
        'rationaleDe': 'Die zwei unabhängigen Erstprüfungen dieses endgültigen Vier-Ziele-Kontexts haben die vollständigen aktuellen DE/EN-Zieltexte, die acht ganzen zweisprachigen Fälle mit Musterantworten und Rubriken, die tatsächlich dargestellten Bilder und vollständigen normalen HTML/PDF-Seiten sowie die wörtlichen Roh-Quellen und begrenzten Zielbeiträge selbst geprüft. Beide entscheiden KEEP ohne offene Befunde am aktuellen Ziel. Die bestehenden originalen Fach- und Bildprüfungen bleiben erhalten; bloße Metadatenneubindung wird nicht als neue Fachprüfung ausgegeben. Die im vorgeschriebenen P-Input sichtbare technische Zusammenfassung vorheriger Bestätigungen ist in beiden Protokollen offengelegt und wurde nicht als fachliche Begründung verwendet; aktuelle Peer-Urteile wurden nicht gelesen. Die auf größere Quellenverbünde bezogenen übrigen Pflichten werden damit nicht vollständig freigegeben. Gewählt wird der konkrete Nachweiswortlaut der ersten Runde; Unterschiede der beiden Formulierungen werden im normalen Syntheseverfahren gebunden. E1/G1 sind maschinelle Kandidaten, keine Lernendenleistung, menschliche Freigabe oder Erprobung.',
        'rationaleEn': 'Both independent first reviews of this final four-goal context personally checked the complete current German/English goals, the eight whole bilingual cases with answers and rubrics, actual images and whole normal HTML/PDF pages, literal raw sources and bounded goal contributions. Both return KEEP without a current goal finding. Original scientific and image reviews remain intact; metadata rebinding is not claimed as a new scientific review. Both protocols disclose the technical summary of prior confirmations embedded in the required P input and exclude it from scientific reasoning; neither read current peer judgments. Remaining duties of broader source unions are not fully approved here. The first round supplies the selected concrete evidence wording, with wording differences bound by normal synthesis. E1/G1 remains machine-candidate evidence, without actual learner performance, human approval or trial.',
    } for gid in ids],
})
commands = [
    ['app/node_modules/.bin/tsx', 'app/scripts/materializeGoalDescriptionRolloutBatch.ts', 'summarize', '--config', str(CONFIG), '--write'],
    ['app/node_modules/.bin/tsx', 'app/scripts/materializeGoalDescriptionRolloutSynthesisManifest.ts', '--config', str(CONFIG), '--authoring', str(authoring_path), '--write'],
    ['app/node_modules/.bin/tsx', 'app/scripts/materializeGoalDescriptionRolloutResolutions.ts', '--config', str(CONFIG), '--synthesis-manifest', str(NATIVE / 'synthesis-decisions.json'), '--write'],
    ['app/node_modules/.bin/tsx', 'app/scripts/materializeGoalDescriptionRolloutBatch.ts', 'finalize', '--config', str(CONFIG), '--write'],
]
for number, argv in enumerate(commands, 1):
    result = subprocess.run(argv, cwd=ROOT, capture_output=True, text=True)
    put(OUT / 'checks' / f'normal-first-pass-adoption-{number}.actual.json', {
        'argv': argv, 'exitCode': result.returncode, 'stdout': result.stdout, 'stderr': result.stderr,
        'unmodifiedNormalCode': True, 'activeWrites': False,
    })
    print(json.dumps({'normalStep': number, 'exitCode': result.returncode}))
    if result.returncode:
        print(result.stderr or result.stdout)
        raise SystemExit(result.returncode)
print(json.dumps({'normalD4Resolved': True, 'activeIntegrationPending': True}))
