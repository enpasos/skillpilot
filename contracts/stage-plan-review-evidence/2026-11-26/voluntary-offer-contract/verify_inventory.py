# SPDX-License-Identifier: Apache-2.0
"""Verify the compact file bindings and evidence size for the VR1 contract."""
import csv
import hashlib
from pathlib import Path

FOLDER = Path(__file__).resolve().parent
ROOT = FOLDER.parents[3]
INDEX = FOLDER / 'inventory.tsv'


def verify():
    with INDEX.open(encoding='utf-8') as source:
        rows = list(csv.DictReader(source, delimiter='\t'))
    paths = [row['path'] for row in rows]
    if not paths or paths != sorted(set(paths)):
        raise ValueError('VR1 inventory must contain unique, sorted paths')
    for row in rows:
        path = Path(row['path'])
        if path.is_absolute() or '..' in path.parts:
            raise ValueError(f'Expected repository-relative path: {path}')
        source = ROOT / path
        if not source.is_file() or not row['role'].strip():
            raise ValueError(f'Missing file or inventory role: {path}')
        if hashlib.sha256(source.read_bytes()).hexdigest() != row['sha256']:
            raise ValueError(f'Stale VR1 file binding: {path}')
    sizes = [path.stat().st_size for path in FOLDER.rglob('*') if path.is_file()]
    if max(sizes) > 5 * 1024**2 or sum(sizes) > 30 * 1024**2:
        raise ValueError('VR1 evidence size exceeds the repository budget')
    print(f'{len(rows)} file bindings checked; evidence {sum(sizes)} bytes, largest file {max(sizes)} bytes')


if __name__ == '__main__':
    verify()
