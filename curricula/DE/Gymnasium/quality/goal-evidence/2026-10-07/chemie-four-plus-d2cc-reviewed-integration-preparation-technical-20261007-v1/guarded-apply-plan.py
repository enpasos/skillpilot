#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Root-only execution: default prepares and checks; --apply installs the sealed named files."""
import argparse, copy, hashlib, json, os, pathlib, tempfile
ROOT = pathlib.Path(__file__).resolve().parents[7]
OWN = pathlib.Path(__file__).resolve().parent
CANON = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
KINDS = 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
QA = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
REG = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
def sha(b): return 'sha256:'+hashlib.sha256(b).hexdigest()
def read(p): return json.loads(p.read_text())
def serialized(v): return (json.dumps(v, ensure_ascii=False, indent=2)+'\n').encode()
def verify_seal(p, expected):
    assert sha(p.read_bytes()) == expected, f'Seal changed: {p}'
    s = read(p)
    for row in s.get('payloads', s.get('files', s.get('ownFiles', []))):
        q = pathlib.Path(row['path'])
        q = ROOT/q if str(q).startswith(('curricula/', 'app/', 'backend/')) else p.parent/q
        b = q.read_bytes()
        assert sha(b).removeprefix('sha256:') == row.get('sha256', row.get('digest')).removeprefix('sha256:'), f'Payload changed: {q}'
        assert len(b) == row['bytes']
def prepare(expected):
    verify_seal(OWN/'technical.final.sealed.json', expected)
    for value in read(OWN/'checks/source-seals.actual.json').values():
        seal = value['seal']; verify_seal(ROOT/seal['path'], seal['sha256'])
    before = read(OWN/'checks/bounded-canonical-kinds-atomicity-plan.actual.json')['beforeBindings']
    for key in ['canonical', 'kinds', 'qa']:
        row = before[key]; assert sha((ROOT/row['path']).read_bytes()) == row['sha256'], f'Active {key} changed; re-prepare before applying.'
    staged = {CANON: (OWN/'candidate/canonical.json').read_bytes(), KINDS: (OWN/'candidate/semantic-kinds.future-active.json').read_bytes(), QA: (OWN/'candidate/visualization-qa.future-active.json').read_bytes()}
    reg = read(ROOT/REG); snapshot = read(OWN/'before'/REG)
    old = next(s for s in snapshot['subjects'] if s['subject']=='chemie')
    i = next(i for i,s in enumerate(reg['subjects']) if s['subject']=='chemie')
    assert reg['subjects'][i] == old, 'Current Chemie registry object changed; no whole-registry replacement is allowed.'
    other = copy.deepcopy([s for s in reg['subjects'] if s['subject']!='chemie'])
    reg['subjects'][i] = read(OWN/'candidate/chemie.registry-subject.final.json')
    assert [s for s in reg['subjects'] if s['subject']!='chemie'] == other
    staged[REG] = serialized(reg)
    for proof in read(OWN/'checks/seven-exact-current-visibility-bindings.actual.json')['views']:
        row = proof['actualCurrentView']; assert sha((ROOT/row['path']).read_bytes()) == row['sha256'], 'A real visibility view changed.'
    prior_qa = read(OWN/'before'/QA)
    for plan in read(OWN/'checks/future-product-image-install-plan.actual.json'):
        source = plan['source']; b = (ROOT/source['path']).read_bytes(); assert sha(b) == source['sha256'] == plan['assetSha256']
        oldrow = next(r for r in prior_qa['records'] if r['goalId']==plan['goalId'])
        original_paths = [oldrow['canonicalAssetPath'], oldrow['publicAssetPath'], 'backend/src/main/resources/static'+oldrow['imageUrl']]
        for p in original_paths: assert sha((ROOT/p).read_bytes()) == oldrow['assetSha256'], f'Original image changed: {p}'
        for p in plan['destinations']:
            target = ROOT/p
            assert not target.exists() or sha(target.read_bytes()) == plan['assetSha256'], f'Different PNG already exists: {p}'
            staged[p] = b
    assert len(staged) == 10
    return staged
def main():
    parser = argparse.ArgumentParser(); parser.add_argument('--apply', action='store_true'); parser.add_argument('--expected-seal-sha256', required=True); args = parser.parse_args()
    expected = args.expected_seal_sha256 if args.expected_seal_sha256.startswith('sha256:') else 'sha256:'+args.expected_seal_sha256
    staged = prepare(expected)
    print(json.dumps({'stagedOnly': not args.apply, 'activeFiles': list(staged), 'applyOwner': 'Root', 'historyWrites': False, 'otherSubjectWrites': False, 'newStrictCompletionsClaimed': 0}, ensure_ascii=False, indent=2))
    if not args.apply: return
    # All guards execute before the first write. This is not a multi-file transaction.
    for p,b in staged.items():
        target = ROOT/p; target.parent.mkdir(parents=True, exist_ok=True)
        fd,tmp = tempfile.mkstemp(prefix='.'+target.name+'.chem-reviewed-', dir=target.parent)
        try:
            with os.fdopen(fd, 'wb') as f: f.write(b); f.flush(); os.fsync(f.fileno())
            os.replace(tmp,target)
        finally:
            if os.path.exists(tmp): os.unlink(tmp)
    print('Installed sealed Chemistry fields and six exact PNG delivery copies. Run the actual active P/D/M/visualization and dependent projection checks before counting the four closures.')
if __name__ == '__main__': main()
