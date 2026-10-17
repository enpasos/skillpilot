from pathlib import Path
import copy, datetime, hashlib, json, os, shutil, subprocess, time

E = Path('/mnt/e/skillpilot-chemie-L7-20261017')
R = Path('/home/enpasos/projects/skillpilot')
BASE = E / 'current439-f79-blind-D1-paired-technical-synthesis-v1/capsule'
AUTHOR = E / 'current439-SN-indicator-own-investigation-P-author-successor-v1'
O = E / 'current439-SN-indicator-P1-native1-root-v2'
CAP = O / 'capsule'
Q = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-SN-indicator-P1-native1-root-v2')
FQ = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-f79-explicit-concentration-ratio-author-root-v1')
GID = 'd2ccd1d5-56f7-583f-9724-e97441367f91'
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()

def own_parent(relative):
    cursor = CAP
    for part in relative.parts:
        cursor = cursor / part
        if cursor.is_symlink():
            target = cursor.resolve()
            cursor.unlink()
            cursor.mkdir()
            for child in target.iterdir():
                (cursor / child.name).symlink_to(child, target_is_directory=child.is_dir())
        elif not cursor.exists():
            cursor.mkdir()
    return cursor

def w(path, value):
    with path.open('x') as f:
        json.dump(value, f, ensure_ascii=False, indent=2)
        f.write('\n')

def pin(path):
    b = path.read_bytes()
    return {'path': str(path), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def stock(label, script, args):
    argv = ['node', '--import', str(R / 'app/node_modules/tsx/dist/loader.mjs'), str(CAP / 'app/scripts' / script)] + args
    t = time.monotonic()
    result = subprocess.run(argv, cwd=CAP, env=env, text=True, capture_output=True)
    for suffix, data in [('stdout', result.stdout), ('stderr', result.stderr)]:
        with (O / f'STOCK.{label}.{suffix}.txt').open('x') as f:
            f.write(data)
    record = {'argv': argv, 'cwd': str(CAP), 'exitCode': result.returncode, 'elapsedSeconds': time.monotonic() - t, 'stdout': result.stdout, 'stderr': result.stderr}
    w(O / f'STOCK.{label}.execution.json', record)
    steps.append(record)
    print(json.dumps({'step': label, 'exitCode': result.returncode, 'stdout': result.stdout[-2000:], 'stderr': result.stderr[-2000:]}), flush=True)
    assert result.returncode == 0, label

assert O.is_dir()
OUT = CAP / Q
cfg = json.loads((OUT / 'P1.author.config.json').read_text())
canonical = CAP / cfg['landscapePath']
semantic = CAP / cfg['semanticKindLedgerPath']
manifest_path=AUTHOR/'AUTHOR-PACKAGE.sealed.manifest.json'
manifest=json.loads(manifest_path.read_text())
guards=[pin(manifest_path),pin(canonical),pin(semantic)]
for f in manifest['files']:
 actual=pin(AUTHOR/f['relativePath'])
 assert actual['sha256']==f['sha256'] and actual['bytes']==f['bytes']
 guards.append(actual)
selected=sorted(str(p.relative_to(OUT/'science')) for p in (OUT/'science').rglob('*') if p.is_file())
goal=next(g for g in json.loads(canonical.read_text())['goals'] if g['id']==GID)
images=[pin(CAP/Path('app/public')/link['url'].lstrip('/')) for link in goal['resourceLinks'] if link['type']=='goal-visualization']
env=dict(os.environ,NODE_OPTIONS='--preserve-symlinks --preserve-symlinks-main',TSX_DISABLE_CACHE='1',TMPDIR='/dev/shm',NO_COLOR='1')
steps=[]
stock('P1-native-review-check-correct-argv','positiveGoalEvidenceReview.ts',['--config='+str(Q/'P1.author.config.json'),'--mode=check'])

# Start from the already corrected f79 aggregate, never the author's older K copy.
old_aggregate = CAP / FQ / 'P439.only-f79-explicit-concentration-ratio.author-candidate.aggregate.jsonl'
guards.append(pin(old_aggregate))
assert guards[-1]['sha256'] == 'c83f1a90c525f2f71d967af969b47a92f837dbf0e1ca1d2a590ad50e759423b1'
lines = old_aggregate.read_bytes().splitlines(keepends=True)
assert len(lines) == 439
row = (OUT / 'P1.current-SN-indicator.author-candidate.jsonl').read_bytes()
candidate_row = json.loads(row)
assert candidate_row['status'] == 'needs_human_review' and candidate_row['reviewAuthority'] == 'ai_candidate'
index = [i for i, l in enumerate(lines) if json.loads(l)['goalId'] == GID]
assert len(index) == 1
new_lines = lines[:]
new_lines[index[0]] = row
aggregate = OUT / 'P439.f79-corrected-and-SN-own-indicator.author-candidate.aggregate.jsonl'
with aggregate.open('xb') as f:
    f.write(b''.join(new_lines))
assert sum(a != b for a, b in zip(lines, new_lines)) == 1
assert next(l for l in lines if json.loads(l)['goalId'].startswith('f79f15c0-')) == next(l for l in new_lines if json.loads(l)['goalId'].startswith('f79f15c0-'))

base = json.loads((CAP / FQ / 'base.full439.author-input.config.json').read_text())
base.update({'bookId': 'chemie-current439-sn-indicator-full439-author-input-20261017-v2', 'title': 'Chemie – aktueller Inhalt mit eigener Indikatoruntersuchung', 'evidenceReviewPaths': [str(Q / aggregate.name)], 'outputPath': str(Q / 'book-model.full439.author-input.json')})
w(OUT / 'base.full439.author-input.config.json', base)
batch = json.loads((CAP / FQ / 'native1-v2.batch.config.json').read_text())
batch.update({'batchId': 'chemie-current439-sn-own-indicator-native1-20261017-v2', 'bookId': 'chemie-current439-sn-own-indicator-native1-20261017-v2', 'title': 'Chemie – eine aktuelle experimentelle Indikatorbeschreibung', 'baseGoalBookConfigPath': str(Q / 'base.full439.author-input.config.json'), 'goalIds': [GID], 'outputDirectory': str(Q / 'native1')})
w(OUT / 'native1.batch.config.json', batch)
stock('native1-prepare', 'materializeGoalDescriptionRolloutBatch.ts', ['prepare', '--config', str(Q / 'native1.batch.config.json')])
stock('native1-check', 'materializeGoalDescriptionRolloutBatch.ts', ['check', '--config', str(Q / 'native1.batch.config.json')])
for guard in guards:
    assert pin(Path(guard['path'])) == guard, guard['path']

selector = {'role': 'Clean current native D1 and whole experimental profile/material inputs for fresh independent scientific review; no author or other reviewer verdicts supplied', 'atUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'goalId': GID, 'capsule': str(CAP), 'relativeRoot': str(Q), 'nativeRoot': str(OUT / 'native1'), 'currentCanonical': pin(canonical), 'currentSemanticKinds': pin(semantic), 'currentP1': pin(OUT / 'P1.current-SN-indicator.author-candidate.jsonl'), 'actualOriginalVisualization': images, 'scientificInputs': [pin(OUT / 'science' / rel) for rel in selected], 'currentNativePdf': pin(OUT / 'native1/bundle/book.pdf'), 'currentNativeHtml': pin(OUT / 'native1/bundle/book.html'), 'currentNativeModel': pin(OUT / 'native1/bundle/book-model.json'), 'currentNativeBundleManifest': pin(OUT / 'native1/bundle/manifest.json'), 'preparedRoundInputs': {round_: {name: pin(OUT / 'native1' / round_ / name) for name in ['description-review-input.json', 'description-review-campaign.json', 'review-bundle-manifest.json', 'prompt.md']} for round_ in ['round-a', 'round-b']}, 'profileStatus': 'needs_human_review / ai_candidate', 'actualLearnerPerformance': False, 'humanApproval': False, 'sourceUnionAccepted': False, 'independentReviewsPending': True}
w(OUT / 'SELECTOR.clean-current-SN-own-indicator-whole-material-and-nativeD1.sealed.json', selector)
w(O / 'RECEIPT.actual-P1-and-nativeD1-preparation.with-f79-preserved.json', {'atUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'selector': pin(OUT / 'SELECTOR.clean-current-SN-own-indicator-whole-material-and-nativeD1.sealed.json'), 'newAggregate': pin(aggregate), 'previousAggregate': pin(old_aggregate), 'other438WholeLinesExact': True, 'f79CorrectedLineExact': True, 'authorInputsUnchanged': True, 'canonicalAndSemanticUnchanged': True, 'MainUnchanged': True, 'globalStrictGainClaimed': 0, 'stockSteps': steps, 'guards': guards})
print(json.dumps({'selector': pin(OUT / 'SELECTOR.clean-current-SN-own-indicator-whole-material-and-nativeD1.sealed.json'), 'aggregate': pin(aggregate)}), flush=True)
