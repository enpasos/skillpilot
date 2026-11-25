"""Verify the two README successors using the complete original H dossier and its verifier."""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import subprocess
import sys
from tempfile import TemporaryDirectory


def require(condition, message):
    if not condition:
        raise ValueError(message)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def read_json(path):
    return json.loads(path.read_bytes())


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False) + '\n')


def validate(root, args):
    schema = Path(__file__).with_name('readme-successor.json')
    change = read_json(schema)
    parent = change['predecessorCommit']
    inventory = root / change['predecessorInventory']
    old = inventory.parent
    manifest = read_json(inventory)
    require(digest(inventory.read_bytes()) == change['predecessorInventorySha256'], 'Wrong predecessor inventory')

    def original(path):
        return subprocess.check_output(['git', 'show', f'{parent}:{path}'], cwd=root)

    for name in manifest['bootstrapPaths']:
        require((root / name).read_bytes() == original(name), f'Predecessor dossier changed: {name}')

    rows = manifest['records']
    by_path = {row['path']: row for row in rows}
    require(len(change['entryPoints']) == 2, 'Expected two entry points')
    for entry in change['entryPoints']:
        name = entry['entry']
        previous = by_path[name].copy()
        archive = entry['archive']
        require(previous['lifecycle'] == 'earlier_state' and previous['rawBindingCount'] == 0, name)
        require(previous['sha256'] == entry['earlierSha256'] and archive not in by_path, archive)
        require((root / archive).read_bytes() == original(name), f'Archive differs: {archive}')
        current = (root / name).read_bytes()
        approved = root / entry['approvedReport']
        require(digest(approved.read_bytes()) == entry['approvedReportSha256'], str(approved))
        require(digest(current) == entry['currentEntrySha256'], f'New entry differs: {name}')
        for target in (approved, root / archive):
            link = target.relative_to((root / name).parent).as_posix()
            require(f']({link})'.encode() in current, f'Missing entry point link: {link}')
        rows.append({**previous, 'path': archive, 'successorPath': entry['approvedReport']})
        current_row = by_path[name]
        for historical in ('earlierStateReason', 'preservationEpoch', 'successorPath'):
            current_row.pop(historical)
        current_row.update(lifecycle='current', sha256=digest(current), bytes=len(current))

    # One historical delivery bound the former learning-unit README at its old path.
    # Preserve the literal path and digest and resolve them through the original Git blob.
    bound = change['historicalBinding']
    origin_doc = read_json(old / 'binding-origins.actual.json')
    bindings = [json.loads(line) for line in (old / 'raw-bindings.actual.jsonl').read_text().splitlines()]
    references = [r for r in bindings if r[2] in {entry['entry'] for entry in change['entryPoints']}]
    require(len(references) == 1, 'Expected exactly one incoming binding to the two old pages')
    reference = references[0]
    require(rows[reference[0]]['path'] == bound['record'] and rows[reference[0]]['lifecycle'] == 'earlier_state',
            'Moved README cannot provide current evidence')
    require(reference[2] == bound['originalEntry'] and bound['preservationCommit'] == parent, 'Wrong historical path')
    history = original(reference[2])
    require(reference[3] == digest(history) and reference[5] == 'verified_current', 'Wrong historical digest')
    origin = next(item for item in origin_doc['origins'] if item['id'] == reference[6])
    require(origin['kind'] == 'raw_file' and origin['location'] == {'root': 'repo', 'path': reference[2]},
            'Unexpected previous binding origin')
    origin.pop('location')
    origin.update(kind='historical_git_raw_file', commit=parent, path=reference[2])
    reference[5] = 'verified_historical_git'
    manifest['snapshotParentCommit'] = parent
    manifest['counts'].update(hOwnedFiles=len(rows), lifecycle=dict(Counter(row['lifecycle'] for row in rows)),
                              bindingStatuses=dict(Counter(row[5] for row in bindings)))

    # The unchanged verifier reads a transient expansion of the two-entry successor.
    # The eleven bootstrap files are pinned by Git, independently of their own contents.
    successor_files = [schema, Path(__file__)]
    manifest['bootstrapPaths'].extend(str(path.resolve().relative_to(root)) for path in successor_files)
    with TemporaryDirectory() as temporary:
        packet = Path(temporary)
        replacements = {'record-lifecycle.actual.json', 'binding-origins.actual.json', 'raw-bindings.actual.jsonl'}
        for path in [*old.iterdir(), *successor_files]:
            if path.is_file() and path.name not in replacements:
                (packet / path.name).symlink_to(path.resolve())
        write_json(packet / inventory.name, manifest)
        write_json(packet / 'binding-origins.actual.json', origin_doc)
        (packet / 'raw-bindings.actual.jsonl').write_text(''.join(json.dumps(r) + '\n' for r in bindings))
        command = [sys.executable, str(old / 'verify_lifecycle.py'), '--repo', str(root), '--dossier', str(packet)]
        subprocess.run(command + args, check=True)
    print(f'Verified both current entry points and both historical originals across {len(rows)} H files.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', type=Path, required=True)
    parser.add_argument('--anchor')
    parser.add_argument('--external-root', action='append', default=[])
    parser.add_argument('--native', action='store_true')
    parser.add_argument('--legacy-a492', action='store_true')
    options = parser.parse_args()
    flags = []
    for alias in options.external_root:
        flags.extend(['--external-root', alias])
    if options.anchor:
        flags.extend(['--anchor', options.anchor])
    if options.native:
        flags.append('--native')
    if options.legacy_a492:
        flags.append('--legacy-a492')
    validate(options.repo.resolve(), flags)
