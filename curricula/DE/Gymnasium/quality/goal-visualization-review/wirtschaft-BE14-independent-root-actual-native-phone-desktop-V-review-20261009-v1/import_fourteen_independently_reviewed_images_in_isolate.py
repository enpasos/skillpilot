"""Native technical import after actual independent V; never mutates live sources."""
import datetime
import hashlib
import json
import shutil
import subprocess
import tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parents[6]
OUT = Path(__file__).resolve().parent
BASE = REPO / 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-BE-fourteen-specific-illustrations-author-20261009-v1'
LANDSCAPE = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
QA = REPO / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/wirtschaftswissenschaften.qa.json'


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read(path):
    return json.loads(path.read_text())


def bind(path):
    return {'path': str(path), 'sha256': digest(path)}


review = OUT / 'actual-final-fourteen-independent-native-phone-desktop-V-review.receipt.json'
assert digest(review) == '42fff8abbc9a4fa0b2218b04674253bc335f6e4e5306f12c599b4c1628bc30d7'
manifest_path = BASE / 'fourteen-selected-specific-PNG-candidates.pending-independent-V.manifest.json'
manifest = read(manifest_path)
assert read(review)['newIndependentMachineImageKEEP'] == 14
source_frame = Path('/tmp/skillpilot-wirtschaft-BE14-images-author-hf5w7gqh')
assert digest(source_frame / LANDSCAPE) == 'e0e084a90c1d30125ddb007e255d13257439cc2469c2318f24f3d5cd28ebdc8b'
original_frame = bind(source_frame / LANDSCAPE)
live_guards = [bind(REPO / LANDSCAPE), bind(QA), bind(manifest_path)]
isolate = Path(tempfile.mkdtemp(prefix='skillpilot-wirtschaft-BE17-reviewed-native-import-'))
shutil.copytree(source_frame, isolate, dirs_exist_ok=True, symlinks=True)
before_landscape = read(isolate / LANDSCAPE)
before_goals = {g['id']: g for g in before_landscape['goals']}
assert len(before_goals) == 407

alts = [
    'Zwei beispielhafte Einkommensströme fließen zum Inländerhaushalt und in den Primäreinkommenskorb. Transfers und Kredite sind getrennt dargestellt.',
    'Eine Person ordnet wirtschaftliche Beziehungen den Themen Preisen und Konjunktur zu; Konsumgüter, Einkommen, Produktion und Beschäftigte veranschaulichen die Fragen.',
    'Ein konkreter Becherfall führt zu einer Modellannahme und deren Prüfung an verschiedenen Bechervarianten. Das Bild zeigt keine fertige Kostenprognose.',
    'Eine Person recherchiert am richtig ausgerichteten Laptop. Frage, öffentliche Statistik, Nachschlagewerk und dokumentierte Fundstelle zeigen einen nachvollziehbaren Rechercheweg.',
    'Gegenstand, Vergleich und begrenzter Zeitraum führen zu einer eigenen wirtschaftlichen Untersuchungsfrage am Beispiel zweier Becheralternativen.',
    'Ein fiktiver Busfahrpreis sinkt von2,50 auf2,00Euro. Die denkende Person betrachtet mehr und nicht mehr Fahrten als alternative mögliche Prüfbefunde einer Vermutung.',
    'Ein eigenes Becherkosten-Ergebnis wird offengelegt. Eine Gesprächspartnerin fragt nach der Mengenannahme; ein Rückpfeil zeigt die sachliche Überprüfung.',
    'Der linke Gesprächspartner macht einen Liefer-Vorschlag und antwortet auf die Budget-Rückfrage der rechten Gesprächspartnerin. Die Sprechblasen sind den richtigen Personen zugeordnet.',
    'Eine Person prüft mit dem bereitgestellten HGB die Art und den Umfang unterschiedlich organisierter Gewerbefälle. Das Bild gibt keinen automatischen Kaufmannsstatus vor.',
    'Person, Betrieb und fiktiver Handelsname Lichtblick e.K. sind getrennt. Derselbe Name steht am Geschäft und im neutralen Rechnungsbeispiel.',
    'Ein öffentliches Register verbindet Eintrag, Bekanntmachung und Zeit mit einer offenen Frage nach der konkreten Rechtsfolge.',
    'Ein Inhaber erteilt Vollmacht an eine Vertreterin. Ein beispielhafter gewöhnlicher Ersatzteileinkauf und die Frage nach gesonderter Darlehensbefugnis zeigen unterschiedliche Umfangsprüfungen.',
    'Zwei ausdrücklich vereinfachte Gesellschaftsmodelle vergleichen private und gesellschaftliche Verfügung sowie dezentrale Preis-Vertragskoordination und zentrale Planung ohne Erfolgswertung.',
    'Fällige Zahlungen von12.000Euro stehen8.000Euro verfügbaren Mitteln gegenüber; der Fehlbetrag beträgt4.000Euro. Betrieb, Beschäftigte und Lieferant sind besorgt, ohne rechtliche Insolvenzfeststellung.',
]
commands = []
asset_bindings = []
for record, alt in zip(manifest['records'], alts):
    gid = record['goalId']
    assert before_goals[gid] == record['wholeGoal']
    common = ['--landscape', str(LANDSCAPE), '--subject', 'wirtschaftswissenschaften',
              '--lang', 'de', '--provider', 'OpenAI Codex image_gen']
    operations = [
        ['node', 'scripts/prepare_goal_visualization.mjs', gid, *common, '--review-status', 'draft'],
        ['node', 'scripts/import_goal_visualization.mjs', gid,
         str(REPO / record['selectedCandidatePath']), *common,
         '--review-status', 'approved_ai', '--license', 'CC-BY-4.0',
         '--alt-text', alt, '--prompt', str(REPO / record['exactProviderPromptPath'])],
    ]
    for ordinal, cmd in enumerate(operations):
        started = datetime.datetime.now(datetime.timezone.utc).isoformat()
        run = subprocess.run(cmd, cwd=isolate, capture_output=True, text=True)
        stem = OUT / f'actual-native-{gid}-{ordinal}'
        stdout = stem.with_suffix('.stdout.txt')
        stderr = stem.with_suffix('.stderr.txt')
        stdout.write_text(run.stdout)
        stderr.write_text(run.stderr)
        result = {'command': cmd, 'cwd': str(isolate), 'startedAt': started,
                  'exitCode': run.returncode, 'stdout': bind(stdout), 'stderr': bind(stderr)}
        commands.append(result)
        (OUT / 'actual-native-fourteen-imports.in-progress.json').write_text(json.dumps(commands, indent=2) + '\n')
        assert run.returncode == 0, result
    png_paths = [
        isolate / f'curricula/DE/Gymnasium/visualizations/wirtschaftswissenschaften/{gid}/{gid}.png',
        isolate / f'app/public/assets/goal-visualizations/wirtschaftswissenschaften/{gid}/{gid}.png',
        isolate / f'backend/src/main/resources/static/assets/goal-visualizations/wirtschaftswissenschaften/{gid}/{gid}.png',
    ]
    for path in png_paths:
        assert digest(path) == record['selectedCandidateSha256'], str(path)
    prompt_path = isolate / f'curricula/DE/Gymnasium/visualizations/wirtschaftswissenschaften/{gid}/prompt.md'
    candidates = list(prompt_path.parent.glob('*prompt*'))
    matching = [p for p in candidates if (REPO / record['exactProviderPromptPath']).read_text().strip() in p.read_text()]
    assert matching, gid
    asset_bindings.append({'goalId': gid, 'pngCopies': [bind(p) for p in png_paths],
                           'actualPromptEmbedded': [bind(p) for p in matching], 'altText': alt})

after_landscape = read(isolate / LANDSCAPE)
after_goals = {g['id']: g for g in after_landscape['goals']}
assert before_goals.keys() == after_goals.keys()
imported = {r['goalId'] for r in manifest['records']}
assert sum(before_goals[gid] == after_goals[gid] for gid in before_goals) == 393
for gid in before_goals:
    if gid in imported:
        expected = dict(after_goals[gid])
        expected.pop('resourceLinks')
        assert expected == before_goals[gid], gid
    else:
        assert after_goals[gid] == before_goals[gid], gid
for item in [original_frame, *live_guards]:
    assert digest(Path(item['path'])) == item['sha256'], item['path']

saved_landscape = OUT / 'whole-current389-plus18-with-seventeen-reviewed-PNG-links.inert.candidate.json'
saved_landscape.write_bytes((isolate / LANDSCAPE).read_bytes())
receipt = {'schemaVersion': 1, 'createdAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'role': 'technical native import after independent image review, not an additional review',
    'independentVAuthority': bind(review), 'authorManifest': bind(manifest_path),
    'isolate': str(isolate), 'commands': commands, 'allTwentyEightNativeCommandsExitZero': True,
    'candidate': bind(saved_landscape), 'actualWholeGoalCount': 407,
    'sameWholeGoalsExceptExactlyFourteenResourceLinks': True, 'whole393OtherGoalsExact': True,
    'previousThreeForeignReviewedRootImagesRetainedWholeExact': True,
    'assetBindings': asset_bindings, 'originalAuthorFrameAndLiveGuardsUnchanged': [original_frame, *live_guards],
    'totalNewInertBEImages': 17, 'liveWrites': [], 'strictNet': 0,
    'sourceCourseApproval': False, 'DApproval': False, 'humanApprovalOrTrial': False,
    'nextStep': 'Use exact asset and prompt bytes in final reviewed source/goal candidate, then final native page and goal bindings and independent D reviews.'}
path = OUT / 'actual-fourteen-independent-KEEP-native-imports-and-393-other-goals-retention.receipt.json'
path.write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'receipt': bind(path), 'candidate': bind(saved_landscape), 'commands': len(commands), 'strictNet': 0}))
