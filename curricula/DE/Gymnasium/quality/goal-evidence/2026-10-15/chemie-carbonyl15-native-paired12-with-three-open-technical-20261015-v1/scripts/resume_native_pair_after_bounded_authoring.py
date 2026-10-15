# SPDX-License-Identifier: Apache-2.0
"""Resume the failed native synthesis without replacing its original input/logs."""
import datetime
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parents[1]
REL = OWN.relative_to(ROOT).as_posix()
HOST = ROOT / 'tmp/chemie-m7-resumed-20261015/carbonyl15-paired12-stock-host-v1'
CFG = REL + '/config/native15.original-context-paired12.config.json'
TSX = ROOT / 'app/node_modules/.bin/tsx'
original = OWN / 'native15/synthesis-authoring.json'
successor = OWN / 'native15/synthesis-authoring.bounded-v2.json'
assert not successor.exists(), 'Preserve existing successor and actual execution evidence'
authoring = json.loads(original.read_text())
old = json.loads(original.read_text())
target = '8edee6b6-9ead-515e-93f5-feada64522b2'
reason = (
    'Explizites Deferral der unabhängigen Originalurteile A=block und B=block; '
    'keine neue wissenschaftliche Stimme und keine Auflösung des Quellen-/Scopebefunds. '
    'Beide Prüfer finden die schriftlichen Grignardfälle chemisch schlüssig: '
    'nucleophile C-C-Bindung, Mg-Alkoxid, danach gesonderte Protonierung; '
    'Wasser und Ethanol verbrauchen vorher das Reagenz. Fall1 ergibt Butan-2-ol, '
    '35−1=34 mmol nutzbares Reagenz und 30 mmol limitierendes Ethanal. '
    'Fall2 ergibt nach 25−6=19 mmol nutzbarem Reagenz höchstens 19 mmol '
    'tertiären Alkohol beziehungsweise 95 % des angegebenen Carbonyleinsatzes. '
    'Das Profil und beide Fälle beanspruchen mit „einsetzen“ auch einen getrennten '
    'praktischen Umfang; der Titel „deuten“ entscheidet diesen Umfang nicht. '
    'In der bereitgestellten Union von 479 aktuellen Quellenzellen fehlt eine direkte '
    'Bindung dieses Ziels. Die gezielt tatsächlich gelesene ganze aktuelle HE-Q1.2-Passage '
    'belegt den Grignardauftrag nicht. Der negative Suchbefund in den gebundenen HE-/BY-Texten '
    'ist auf diese Materialien begrenzt und beweist keine allgemeine Quellenabwesenheit. '
    'Vor einer Freigabe braucht es eine genaue Primärstelle oder eine begründete '
    'autoritative Entscheidung zum beanspruchten curricularen/erweiterten Umfang. '
    'Ein fehlendes tatsächliches Lernenden- oder Laborergebnis wird ausdrücklich nicht '
    'als zusätzliches maschinelles M7-Gate erfunden. Auch zwei Reaktionsschritte begründen '
    'für sich keinen Split. Die vollständigen ursprünglichen Begründungen, Quellenklauseln, '
    'Lesebegrenzungen und Fallprüfungen bleiben bytegenau in den kopierten A-/B-Records '
    'und ihren vorher versiegelten FIRST-Dateien erhalten. Die Synthese betrifft nur den '
    'eingefrorenen Beschreibungsstand; andere Gates und menschliche Prüfung bleiben getrennt.'
)
row = next(r for r in authoring['deferredGoals'] if r['goalId'] == target)
row['rationaleDe'] = reason
assert len(reason) < 4000
for key in ('decisions', 'deferredGoals'):
    for before, after in zip(old[key], authoring[key], strict=True):
        if before['goalId'] == target:
            assert {k:v for k,v in before.items() if k != 'rationaleDe'} == {k:v for k,v in after.items() if k != 'rationaleDe'}
        else:
            assert before == after
successor.write_text(json.dumps(authoring, indent=2, ensure_ascii=False) + '\n')
receipt = {'role':'Bounded technical synthesis summary; full original review reasons retained',
           'originalInput':str(original.relative_to(ROOT)), 'originalSha256':hashlib.sha256(original.read_bytes()).hexdigest(),
           'successorInput':str(successor.relative_to(ROOT)), 'successorSha256':hashlib.sha256(successor.read_bytes()).hexdigest(),
           'onlyChangedField':target + '/rationaleDe', 'oldCharacters':len(next(r for r in old['deferredGoals'] if r['goalId']==target)['rationaleDe']),
           'newCharacters':len(reason), 'newScientificVotes':0, 'changedReviewDecisions':0}
(OWN / 'checks/BOUNDED.synthesis-authoring-v2.actual.json').write_text(json.dumps(receipt, indent=2, ensure_ascii=False)+'\n')
commands = [
    ('native-synthesis-attempt2', 'materializeGoalDescriptionRolloutSynthesisManifest.ts', ['--config', CFG, '--authoring', str(successor.relative_to(ROOT)), '--write']),
    ('native-resolutions-attempt2', 'materializeGoalDescriptionRolloutResolutions.ts', ['--config', CFG, '--synthesis-manifest', REL+'/native15/synthesis-decisions.json', '--write']),
    ('native-finalize-attempt2', 'materializeGoalDescriptionRolloutBatch.ts', ['finalize', '--config', CFG, '--write']),
    ('native-final-check-attempt2', 'materializeGoalDescriptionRolloutBatch.ts', ['check', '--config', CFG]),
]
receipts = []
for name, script, args in commands:
    assert not (OWN/'checks'/f'{name}.command.actual.json').exists()
    argv = [str(TSX), str(HOST/'app/scripts'/script), *args]
    start = datetime.datetime.now(datetime.timezone.utc).isoformat()
    p = subprocess.run(argv, cwd=HOST, capture_output=True)
    end = datetime.datetime.now(datetime.timezone.utc).isoformat()
    (OWN/'checks'/f'{name}.stdout.actual.txt').write_bytes(p.stdout)
    (OWN/'checks'/f'{name}.stderr.actual.txt').write_bytes(p.stderr)
    item = {'role':'Actual unchanged stock command; informed technical integration only', 'argv':argv,
            'cwd':str(HOST.relative_to(ROOT)), 'startedAtUTC':start, 'completedAtUTC':end,
            'exitCode':p.returncode, 'newScientificVotes':0}
    (OWN/'checks'/f'{name}.command.actual.json').write_text(json.dumps(item, indent=2)+'\n')
    receipts.append(item)
    print(json.dumps({'step':name, 'exitCode':p.returncode}), flush=True)
    if p.returncode:
        raise SystemExit(p.stderr.decode()+p.stdout.decode())
manifest = json.loads((OWN/'native15/synthesis-decisions.json').read_text())
runs = [json.loads(p.read_text()) for p in (OWN/'native15').glob('round-*/results/*.run.json')]
latest = max(datetime.datetime.fromisoformat(r['completedAt'].replace('Z','+00:00')) for r in runs)
actual = datetime.datetime.fromisoformat(manifest['synthesizedAt'].replace('Z','+00:00'))
assert abs((actual-latest).total_seconds()-1) < .001
(OWN/'checks/native15.actual-clock-and-logical-synthesis-time.json').write_text(json.dumps({
    'role':'Logical reproducibility timestamp is distinct from actual execution clock',
    'originalRunCompletedAt':[r['completedAt'] for r in runs], 'stockSynthesizedAt':manifest['synthesizedAt'],
    'rule':'maximum genuine original run.completedAt +1000ms', 'actualSynthesisCommand':receipts[0],
    'newScientificVotes':0}, indent=2)+'\n')
