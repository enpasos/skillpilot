# SPDX-License-Identifier: Apache-2.0
"""Own normal scoped A/M/P checks after immutable independent science FIRST."""
from pathlib import Path
import copy, datetime, hashlib, json, shutil, subprocess, sys, tempfile

ROOT = Path.cwd()
DIR = Path(__file__).resolve().parent
AUTHOR = DIR.parent / 'chemie-q3-three-BW-context-bound-practical-companions-author-v1'
PREFIX = DIR.relative_to(ROOT).as_posix()
def read(path):
    return json.loads(path.read_text())
def put(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
def bind(path):
    return {'path': path.relative_to(ROOT).as_posix(), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'bytes': path.stat().st_size}
first = read(DIR / 'three-practical-and-source002.independent-b.whole-science-FIRST.verdict.json')
freeze = read(DIR / 'three-practical-and-source002.independent-b.whole-science-FIRST.freeze.json')
assert first['status'].startswith('own_science_FIRST_completed')
judgments = {row['goalId']: row for row in first['goalJudgments']}
now = datetime.datetime.now(datetime.timezone.utc).isoformat()
reviewer = 'Codex independent B; own whole-science FIRST frozen before author check outcomes; disclosed prior SOURCE002 counterfinding'
terminals = []
def run(label, argv, cwd):
    if (DIR / f'terminal/{label}.terminal.actual.json').exists():
        label += '-successor-v2'
    started = datetime.datetime.now(datetime.timezone.utc).isoformat()
    actual = subprocess.run(argv, cwd=cwd, text=True, capture_output=True)
    out = DIR / f'terminal/{label}.stdout.actual.txt'
    err = DIR / f'terminal/{label}.stderr.actual.txt'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(actual.stdout)
    err.write_text(actual.stderr)
    record = {'label': label, 'argv': argv, 'executionCwdDiagnostic': str(cwd), 'startedAt': started,
              'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
              'actualExitCode': actual.returncode, 'stdout': bind(out), 'stderr': bind(err)}
    put(DIR / f'terminal/{label}.terminal.actual.json', record)
    terminals.append(record)
    print(json.dumps({'label': label, 'actualExitCode': actual.returncode}), flush=True)
    if actual.returncode:
        raise RuntimeError(actual.stdout + '\n' + actual.stderr)

for kind, script in [('atomicity', 'semanticAtomicityReview.ts'), ('memory', 'memoryCardReview.ts')]:
    if '--positive-only' in sys.argv:
        terminals.append(read(DIR / f'terminal/{kind}-ordinary-independent-B-check.terminal.actual.json'))
        continue
    cfg = read(AUTHOR / kind / 'three-whole-practical.author.config.json')
    cfg['reviewId'] = f'chemie-q3-BW-three-practical-independent-B-{kind}-v1'
    cfg['reviewPath'] = f'{PREFIX}/{kind}/three-whole-practical.independent-b.review.jsonl'
    cfg['scope']['label'] = 'Three actual whole BW practical competencies; independent B science FIRST and normal scoped check'
    if kind == 'memory':
        cfg['reportPath'] = f'{PREFIX}/{kind}/three-whole-practical.independent-b.normal-report.md'
        cfg['cardReviewPath'] = f'{PREFIX}/{kind}/three-whole-practical.independent-b.cards.review.jsonl'
        (DIR / kind).mkdir(exist_ok=True)
        (DIR / kind / 'three-whole-practical.independent-b.cards.review.jsonl').write_text('')
    rows = [json.loads(line) for line in (AUTHOR / kind / 'three-whole-practical.author.review.jsonl').read_text().splitlines() if line]
    for row in rows:
        row['reviewId'] = cfg['reviewId']
        row['reviewedAt'] = now
        row['reviewer'] = reviewer
        judgment = judgments[row['goalId']]
        row['reason'] = judgment['atomicity' if kind == 'atomicity' else 'memory'] + ' Whole goal, bilingual cases, rubrics and fresh fault transfers read independently before FIRST. Machine judgment only; no learner execution or human release.'
    (DIR / kind).mkdir(exist_ok=True)
    (ROOT / cfg['reviewPath']).write_text(''.join(json.dumps(row, ensure_ascii=False, separators=(',', ':')) + '\n' for row in rows))
    config_path = DIR / kind / 'three-whole-practical.independent-b.config.json'
    put(config_path, cfg)
    run(f'{kind}-ordinary-independent-B-check', ['app/node_modules/.bin/tsx', f'app/scripts/{script}', f'--config={config_path.relative_to(ROOT)}', '--mode=check', '--write-fingerprints'], ROOT)

cfg = read(AUTHOR / 'positive/three-whole-practical.author.config.json')
cfg['reviewId'] = 'chemie-q3-bw-three-practical-whole-independent-b-v1'
cfg['reviewPath'] = f'{PREFIX}/positive/three-whole-practical.independent-b.review.jsonl'
cfg['scope']['label'] = 'Whole three independent B practical machine P candidates; E1/G1, needs human review'
candidate = read(AUTHOR / 'positive/three-whole-practical-P-materializer.author-candidate.json')
candidate['reviewId'] = cfg['reviewId']
candidate['reviewer'] = reviewer
candidate['reviewedAt'] = now
for row in candidate['goals']:
    judgment = judgments[row['goalId']]
    row['reason'] = judgment['material'] + ' ' + judgment['source'] + ' Own independent full bilingual protocol/answer/rubric/fresh transfer review and recalculation, frozen before normal check outcomes. Current A/M/P bounded candidate; D/native/V and active integration remain separately open.'
    row['dissent'] = ['Synthetic machine QA E1/G1, not actual performed learner experiment or human release.', 'Actual current native D pages and new raster V reviews remain separate; whole BW126 duties/programme not closed.']
config_path = DIR / 'positive/three-whole-practical.independent-b.config.json'
candidate_path = DIR / 'positive/three-whole-practical.independent-b.candidate.json'
put(config_path, cfg)
put(candidate_path, candidate)

capsule = Path(tempfile.mkdtemp(prefix='skillpilot-chemie-BW-independent-B-P3-'))
for source in [AUTHOR, DIR]:
    shutil.copytree(source, capsule / source.relative_to(ROOT))
scripts = ['materializePositiveGoalEvidenceCandidates.ts', 'positiveGoalEvidenceReview.ts', 'positiveGoalEvidenceProfileModel.ts', 'goalEvidenceProfileModel.ts']
schemas = ['contracts/goal-evidence/v2/goal-evidence-profile.schema.json', 'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json', 'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json']
for relative in ['app/scripts/' + name for name in scripts] + schemas:
    destination = capsule / relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(ROOT / relative, destination)
(capsule / 'app/node_modules').symlink_to((ROOT / 'app/node_modules').resolve(), target_is_directory=True)
tsx = str((ROOT / 'app/node_modules/.bin/tsx').resolve())
run('P3-ordinary-independent-B-materializer-isolated', [tsx, 'app/scripts/materializePositiveGoalEvidenceCandidates.ts', '--config', config_path.relative_to(ROOT).as_posix(), '--candidates', candidate_path.relative_to(ROOT).as_posix(), '--write'], capsule)
run('P3-ordinary-independent-B-review-isolated', [tsx, 'app/scripts/positiveGoalEvidenceReview.ts', f'--config={config_path.relative_to(ROOT)}', '--mode=check'], capsule)
records = capsule / cfg['reviewPath']
shutil.copy2(records, ROOT / cfg['reviewPath'])
parsed = [json.loads(line) for line in records.read_text().splitlines() if line]
assert len(parsed) == 3
assert all(row['status'] == 'needs_human_review' and row['reviewAuthority'] == 'ai_candidate' and row['evidenceLevel'] == 'E1' and row['maximumClaimScope'] == 'G1' for row in parsed)
author_rows = [json.loads(line) for line in (AUTHOR / 'positive/three-whole-practical.author.review.jsonl').read_text().splitlines() if line]
for row, original in zip(parsed, author_rows):
    assert row['goalId'] == original['goalId']
    for field in ['profile', 'goalFingerprint', 'reviewInputFingerprint', 'profileFingerprint', 'reviewCriteriaFingerprint']:
        assert row[field] == original[field], (row['goalId'], field)
put(DIR / 'checks/own-normal-A3-M3-P3.actual.json', {
    'schemaVersion': 1, 'role': 'Completed genuine scoped independent B normal checks after own scientific FIRST',
    'scientificFirst': bind(DIR / 'three-practical-and-source002.independent-b.whole-science-FIRST.verdict.json'),
    'scientificFirstFreeze': bind(DIR / 'three-practical-and-source002.independent-b.whole-science-FIRST.freeze.json'),
    'terminals': terminals, 'wholeP3ProfilesAndNormalFingerprintsExactToActualReviewedInput': True,
    'P3Status': 'needs_human_review', 'P3Authority': 'ai_candidate', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
    'ordinaryToolBindings': [bind(ROOT / 'app/scripts' / name) for name in scripts] + [bind(ROOT / path) for path in schemas],
    'scope': first['goalScope'], 'humanApproval': False, 'actualLearnerExperiments': 0, 'activeWrites': 0, 'strictGain': 0,
    'capsulePathIsDiagnosticOnly': True, 'allOperativeOwnOutputsCopiedToPortableOwnPackage': True})
print(json.dumps({'completedNormalScopedChecks': len(terminals), 'A': 3, 'M': 3, 'P': 3, 'strictGain': 0}))
