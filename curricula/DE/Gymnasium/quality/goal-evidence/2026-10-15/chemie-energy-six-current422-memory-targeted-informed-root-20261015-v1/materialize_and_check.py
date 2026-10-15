# SPDX-License-Identifier: Apache-2.0
"""Bind six actual prior scientific judgments, retaining all other M/card rows."""
import datetime
import hashlib
import importlib.util
import json
import shutil
import subprocess
import sys
from pathlib import Path

sys.dont_write_bytecode = True
REPO = Path.cwd()
OWN = Path(__file__).resolve().parent
REL = OWN.relative_to(REPO).as_posix()
E15 = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/'
OLD = E15 + 'chemie-bw-lk-six-card-corrections-targeted-independent-20261015-v1/'
BASE = E15 + 'chemie-memory560-current422-paired13-and-six-card-inactive-integration-technical-root-20261015-v1/'
NATIVE = E15 + 'chemie-energy20-nernst-alt-context-author-and-native-final-preparation-20261015-v1/'
HOST = REPO / 'tmp/chemie-m7-resumed-20261015/energy-six-memory-minimal-host-v1'


def read(path):
    return json.loads((REPO / path).read_text())


def bind(path):
    data = (REPO / path).read_bytes()
    return {'path': path, 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def write(path, value):
    target = OWN / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


assert not (OWN / 'FILES.finite-targeted-M6.seal.json').exists()
assert not HOST.exists()
science = read(REL + '/FIRST.actual-six-current-memory-judgments.json')
first_seal = read(REL + '/FILES.FIRST-six-memory-science.seal.json')
for row in first_seal['files']:
    assert bind(row['path']) == row
goals = read(science['wholeCanonicalPath'])['goals']
by_id = {g['id']: g for g in goals}
for judgment in science['judgments']:
    assert judgment['wholeGoal'] == by_id[judgment['goalId']]

source_rows_path = OLD + 'records/M422.original416-plus-six-new.review.jsonl'
card_rows_path = OLD + 'records/cards75.original69-plus-six-new.review.jsonl'
source_lines = (REPO / source_rows_path).read_text().splitlines(keepends=True)
judgments = {row['goalId']: row for row in science['judgments']}
records = []
cas = []
for line in source_lines:
    old = json.loads(line)
    judgment = judgments.get(old['goalId'])
    if judgment is None:
        records.append(line)
        continue
    new = {**old, 'fingerprint': 'pending-normal-binding-after-actual-science',
           'status': judgment['status'], 'memoryUseful': judgment['memoryUseful'],
           'reviewedAt': science['completedAtUTC'], 'reviewer': 'Codex root informed targeted Memory science / Energy six 20261015',
           'reason': judgment['reason'], 'firstScienceSeal': bind(REL + '/FILES.FIRST-six-memory-science.seal.json')}
    cas.append({'goalId': old['goalId'], 'wholeBefore': old, 'wholeAfterBeforeTechnicalFingerprint': new})
    records.append(json.dumps(new, ensure_ascii=False, separators=(',', ':')) + '\n')
assert len(cas) == 6 and len(records) == 422
(OWN / 'records').mkdir()
record_rel = REL + '/records/M422.original416-plus-six-current.review.jsonl'
(REPO / record_rel).write_text(''.join(records))
write('CAS.six-actual-M-decisions-before-technical-binding.json', cas)

mapping = read(NATIVE + 'checks/REBUILD.final-native560-alt-only.physical-map.json')
aliases = []
for row in mapping['aliases']:
    alias = row['normalHostAlias']
    if alias.startswith('curricula/DE/Gymnasium/quality/goal-description-review/'):
        continue
    physical = row['physicalRepositorySource']
    assert bind(physical['path']) == physical
    target = HOST / alias
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(REPO / physical['path'], target)
    aliases.append({'normalHostAlias': alias, 'physicalRepositorySource': physical})
script = 'app/scripts/memoryCardReview.ts'
(HOST / script).parent.mkdir(parents=True, exist_ok=True)
shutil.copyfile(REPO / script, HOST / script)
(HOST / 'app/node_modules').symlink_to(REPO / 'app/node_modules', target_is_directory=True)
(HOST / 'package.json').write_text('{"type":"module"}\n')

config = read(BASE + 'config/M422.actual-six-corrections-whole-BW-plus-original-nine.normal.config.json')
config['landscapePath'] = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
config['reviewPath'] = record_rel
config['cardReviewPath'] = card_rows_path
for path in [card_rows_path] + [x['viewPath'] for x in config['visibilityScopes']]:
    if not (HOST / path).exists():
        (HOST / path).parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(REPO / path, HOST / path)
        aliases.append({'normalHostAlias': path, 'physicalRepositorySource': bind(path)})

config_rel = REL + '/config/whole422-old-nine-plus-whole-BW.current-v3.config.json'
write('config/whole422-old-nine-plus-whole-BW.current-v3.config.json', config)
for path in [record_rel, config_rel]:
    (HOST / path).parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(REPO / path, HOST / path)

# Run the unchanged normal binder only on six freshly judged temporary rows.
# The whole normal check below proves that all other 416 rows remain current.
js = r'''
import fs from 'node:fs'; import crypto from 'node:crypto';
const [canPath,rowPath] = process.argv.slice(2);
const can = JSON.parse(fs.readFileSync(canPath,'utf8'));
const goals = new Map(can.goals.map(g=>[g.id,g]));
const n = x=>String(x??'').normalize('NFKC').replace(/\s+/g,' ').trim();
const stable = x=>Array.isArray(x)?`[${x.map(stable).join(',')}]`:x&&typeof x==='object'?`{${Object.entries(x).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${JSON.stringify(k)}:${stable(v)}`).join(',')}}`:JSON.stringify(x);
const lines=fs.readFileSync(rowPath,'utf8').split('\n').filter(Boolean);
const next=lines.map(line=>{const x=JSON.parse(line);if(x.fingerprint!=='pending-normal-binding-after-actual-science')return line;
 const g=goals.get(x.goalId), d=g.dimensionTags;
 const p=stable({ruleVersion:x.ruleVersion,goalId:g.id,shortKey:g.shortKey??'',title:n(g.title),titleEn:n(g.titleEn),description:n(g.description),descriptionEn:n(g.descriptionEn),phase:n(d?.phase),area:n(d?.area),topicCode:n(d?.topicCode),nodeKind:n(g.nodeKind)});
 x.fingerprint='sha256:'+crypto.createHash('sha256').update(p).digest('hex'); return JSON.stringify(x);});
fs.writeFileSync(rowPath,next.join('\n')+'\n');
'''
normal_can = HOST / config['landscapePath']
result = subprocess.run(['node', '--input-type=module', '-', str(normal_can), str(HOST / record_rel)], input=js, text=True, capture_output=True, check=True)
shutil.copyfile(HOST / record_rel, REPO / record_rel)
write('checks/TECHNICAL.six-fingerprint-binder.after-FIRST.actual.json', {
    'role': 'Technical exact reproduction of existing memoryCardReview.ts fingerprint only, after actual original science',
    'unchangedNormalScript': bind(script), 'returncode': result.returncode, 'affectedGoalIds': list(judgments), 'newScientificJudgmentsFromBinder': 0})

command = ['node', str(REPO / 'app/node_modules/tsx/dist/cli.mjs'), script, '--config=' + config_rel, '--mode=check']
start = datetime.datetime.now(datetime.timezone.utc).isoformat()
run = subprocess.run(command, cwd=HOST, text=True, capture_output=True)
(OWN / 'checks/whole422.normal-memory.stdout.txt').write_text(run.stdout)
(OWN / 'checks/whole422.normal-memory.stderr.txt').write_text(run.stderr)
write('checks/whole422.normal-memory.command.actual.json', {'startedAtUTC': start, 'command': command, 'cwd': str(HOST.relative_to(REPO)), 'returncode': run.returncode})
assert run.returncode == 0, run.stderr + run.stdout[-5000:]
after_lines = (REPO / record_rel).read_text().splitlines(keepends=True)
unchanged = [i for i, line in enumerate(source_lines) if json.loads(line)['goalId'] not in judgments]
assert len(unchanged) == 416 and all(after_lines[i] == source_lines[i] for i in unchanged)
assert bind(card_rows_path)['sha256'] == 'sha256:96f5d189f15a2bf72d2cb3f3302967b3e5a66ee90ccd70346f9caf4a8ef52ed3'
write('checks/REBUILD.memory-six-minimal-host.physical-map.json', {'executionHost': str(HOST.relative_to(REPO)), 'aliases': aliases, 'normalScript': bind(script), 'newRecords': bind(record_rel), 'normalConfig': bind(config_rel), 'privateDependenciesOnly': ['app/node_modules'], 'physicalBytes': sum(p.stat().st_size for p in HOST.rglob('*') if p.is_file() and not p.is_symlink())})
write('NEUTRAL.six-current-M-whole422-pass.json', {'schemaVersion': 1, 'role': 'Informed genuine Memory6 only; no new strict count', 'actualCanonical': bind(science['wholeCanonicalPath']), 'actualFirst': bind(REL + '/FIRST.actual-six-current-memory-judgments.json'), 'normalConfig': bind(config_rel), 'actualWhole422NormalCheck': bind(REL + '/checks/whole422.normal-memory.command.actual.json'), 'sixCurrentJudgments': 6, 'original416RowsExact': True, 'original75CardRowsExact': True, 'originalNinePlusWholeBWVisibilityScopes': 10, 'all422MemoryCurrent': True, 'newStrict': 0, 'sourceCourseAtomicityOrVApproval': False, 'humanApproval': False, 'humanTrial': False})

for path in OWN.rglob('*'):
    assert not path.is_symlink(), path
    if path.is_file() and path.suffix == '.json': json.loads(path.read_text())
    if path.is_file() and path.suffix == '.jsonl':
        for line in path.read_text().splitlines(): json.loads(line)
spec = importlib.util.spec_from_file_location('normal_schema', REPO / 'scripts/validate_schemas.py')
module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
assert not module.curriculum_symlink_errors(REPO)
files = [bind(p.relative_to(REPO).as_posix()) for p in sorted(OWN.rglob('*')) if p.is_file()]
write('FILES.finite-targeted-M6.seal.json', {'schemaVersion': 1, 'sealedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'files': files, 'payloadFileCount': len(files), 'newStrict': 0, 'humanApproval': False})
print(json.dumps({'pass': True, 'wholeMemory': '422/422 old nine plus wholeBW', 'genuineMDecisions': 6, 'unalteredMRecords': 416, 'seal': bind(REL + '/FILES.finite-targeted-M6.seal.json')}))
