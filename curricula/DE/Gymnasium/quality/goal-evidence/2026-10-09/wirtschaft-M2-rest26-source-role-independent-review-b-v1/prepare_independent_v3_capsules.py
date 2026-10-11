import hashlib
import json
from pathlib import Path
import shutil
import sys
import tempfile

repo = Path(sys.argv[1]).resolve()
initial = Path(sys.argv[2]).resolve()
own = repo / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M2-rest26-source-role-independent-review-b-v1'
author = repo / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M2-twenty-six-source-role-and-two-bounded-surrogate-author-v1/current-explicit-source-role-and-one-subsumption-surrogate-successor-v3'
index = json.loads((author / 'thirty-two-explicit-current-scope-views-and-25-source-only-role-corrections.current-author-index-v3.json').read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
scratch = Path(tempfile.mkdtemp(prefix='skillpilot-economics-M2-rest26-independent-B-'))
pending = scratch / 'pending'
shutil.copytree(initial, pending, symlinks=True)
before = own / 'inputs/before-views'
before.mkdir(parents=True, exist_ok=True)
for row in index['views']:
    old = repo / row['beforeView']['path']
    assert sha(old) == row['beforeView']['sha256']
    target = before / old.name
    if target.exists():
        assert target.read_bytes() == old.read_bytes()
    else:
        shutil.copyfile(old, target)
    source = repo / row['candidate']['path']
    assert sha(source) == row['candidate']['sha256']
    dest = pending / row['prospectiveActivePath']
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, dest)
native = pending / 'app/scripts/generateCurriculumQualityStatus.ts'
production = (repo / 'app/scripts/generateCurriculumQualityStatus.ts').read_bytes()
assert native.read_bytes().startswith(production)
native.write_bytes(native.read_bytes() + b'\nexport { createCoverageEvidenceChecker };\n')
registry_path = Path('curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json')
shutil.copyfile(author / 'whole-existing-362-plus-one-pending-subsumption-source-surrogate-registry.INERT-v3.json', pending / registry_path)
original_registry = json.loads((repo / registry_path).read_text())
pending_registry = json.loads((pending / registry_path).read_text())
assert pending_registry['entries'][:-1] == original_registry['entries']
assert len(original_registry['entries']) == 362
for mode in ['accepted', 'wrong-anchor', '764-retarget']:
    capsule = scratch / mode
    shutil.copytree(pending, capsule, symlinks=True)
    registry = json.loads((capsule / registry_path).read_text())
    registry['entries'][-1]['status'] = 'accepted'
    if mode == 'wrong-anchor':
        registry['entries'][-1]['requiredByGoalId'] = 'b2419b68-8e21-5cee-8afc-34e3b07d2a87'
    (capsule / registry_path).write_text(json.dumps(registry, ensure_ascii=False, indent=2) + '\n')
    if mode == '764-retarget':
        changed = 0
        def mutate(nodes):
            global changed
            for node in nodes:
                if node.get('kind') == 'goalEntry' and node.get('goalId', '').startswith('764e9eca'):
                    assert node['projectionRole'] == 'prerequisiteOnly'
                    node['projectionRole'] = 'target'
                    changed += 1
                mutate(node.get('children', []))
        for course in ['gk', 'lk']:
            path = capsule / f'curricula/DE/Gymnasium/composition-views/wirtschaft/de-be-gym-economics-{course}.view.json'
            view = json.loads(path.read_text())
            mutate(view['rootNodes'])
            path.write_text(json.dumps(view, ensure_ascii=False, indent=2) + '\n')
        assert changed == 2
Path('/tmp/skillpilot-economics-M2-rest26-independent-B-capsule-root.txt').write_text(str(scratch) + '\n')
print(json.dumps({'physical_input_snapshots': len(list(before.glob('*.json'))), 'native_whole_production_sha256': hashlib.sha256(production).hexdigest(), 'native_changes': 'appended diagnostic exports only', 'capsule_modes': ['pending', 'accepted', 'wrong-anchor', '764-retarget']}))
