#!/usr/bin/env python3
"""Bound the Ubuntu 24 curriculum checkout without reading historical binaries."""
from __future__ import annotations

import json
import hashlib
from functools import lru_cache
from pathlib import Path
import re
import subprocess
import shutil
import sys

ROOT = Path(__file__).resolve().parents[1]
SOURCE_BUDGET_BYTES = 30_400_000_000
GIT_RESERVE_BYTES = 15 * 1024 ** 3
BUILD_RESERVE_BYTES = 8 * 1024 ** 3
BINARY_SUFFIXES = ('png', 'jpg', 'jpeg', 'pdf', 'zip')
SPARSE_PATTERNS = ('/*', *(f'!/curricula/**/quality/**/*.{suffix}' for suffix in BINARY_SUFFIXES))
HISTORICAL_QUALITY_BINARY = re.compile(r'^curricula/(?:.*/)?quality/.*\.(?:png|jpg|jpeg|pdf|zip)$')


@lru_cache(maxsize=1)
def required_source_documents() -> dict[str, str]:
    """Reuse current registered source-atlas receipts, not a handwritten PDF list."""
    registry = (ROOT / 'app/src/utils/goalBookPublicationRegistry.ts').read_text()
    configs = re.findall(r"configPath:\s*'([^']+\.json)'", registry)
    if not configs:
        raise ValueError('Registered book configuration paths are missing')
    required: dict[str, str] = {}
    for config in configs:
        companion = ROOT / ('app/' + config.removesuffix('.json') + '.inputs.json')
        if not companion.is_file():
            continue
        value = json.loads(companion.read_bytes())
        directory = value['outputDirectory']
        if not directory.startswith('app/scripts/config/goal-books/source-views/') or '..' in directory.split('/'):
            raise ValueError('Unsafe registered source-atlas output directory')
        receipt = json.loads((ROOT / directory / 'source-projection.receipt.json').read_bytes())
        if receipt.get('schemaVersion') != 1 or receipt.get('bookId') != value['bookId'] or receipt.get('derivation') != 'reviewed-source-mapping-book-local-atlas-v1':
            raise ValueError('Registered source-atlas receipt identity differs')
        for binding in receipt['inputBindings']:
            path, digest = binding['path'], binding['sha256']
            if not HISTORICAL_QUALITY_BINARY.fullmatch(path):
                continue
            if (any(part in ('', '.', '..') for part in path.split('/')) or '\\' in path
                    or any(ord(char) < 32 for char in path) or not re.fullmatch('sha256:[a-f0-9]{64}', digest)):
                raise ValueError('Unsafe registered source-document input binding')
            if path in required and required[path] != digest:
                raise ValueError('Conflicting registered source-document hash')
            required[path] = digest
    return required


def selected(path: str) -> bool:
    return path in required_source_documents() or not HISTORICAL_QUALITY_BINARY.fullmatch(path)


def inventory(*, verify_files: bool = True) -> dict:
    raw = subprocess.check_output(['git', '-c', 'core.trustctime=false', 'ls-tree', '-rlz', 'HEAD'], cwd=ROOT)
    counts = {'trackedFiles': 0, 'trackedBytes': 0, 'retainedFiles': 0, 'retainedBytes': 0, 'omittedFiles': 0, 'omittedBytes': 0}
    for row in raw.split(b'\0'):
        if not row:
            continue
        metadata, raw_path = row.split(b'\t', 1)
        size = metadata.split()[3]
        if size == b'-':
            continue
        path, size_bytes = raw_path.decode('utf-8'), int(size)
        counts['trackedFiles'] += 1
        counts['trackedBytes'] += size_bytes
        category = 'retained' if selected(path) else 'omitted'
        counts[category + 'Files'] += 1
        counts[category + 'Bytes'] += size_bytes
        if verify_files and category == 'retained' and not (ROOT / path).exists() and not (ROOT / path).is_symlink():
            raise ValueError(f'Sparse checkout omitted selected tracked input: {path}')
    if counts['retainedBytes'] > SOURCE_BUDGET_BYTES:
        raise ValueError(f'Selected tracked inputs exceed reviewed source budget: {counts["retainedBytes"]} > {SOURCE_BUDGET_BYTES}; remeasure the closure and runner reserve')
    return {'semantics': 'curriculum-ci-sparse-checkout-v1', **counts,
            'sourceBudgetBytes': SOURCE_BUDGET_BYTES, 'gitReserveBytes': GIT_RESERVE_BYTES,
            'buildReserveBytes': BUILD_RESERVE_BYTES,
            'requiredPreCheckoutBytes': SOURCE_BUDGET_BYTES + GIT_RESERVE_BYTES + BUILD_RESERVE_BYTES}


def materialize_required_documents() -> dict:
    import os
    if os.environ.get('RUNNER_ENVIRONMENT') != 'github-hosted' or os.environ.get('RUNNER_OS') != 'Linux':
        raise ValueError('Sparse input materialization is restricted to the disposable GitHub Linux job')
    inventory(verify_files=False)  # Reject a changed source budget before downloading.
    paths = sorted(required_source_documents())
    if paths:
        patterns = ['/' + re.sub(r'([\\*?\[\]!# ])', r'\\\1', path) for path in paths]
        subprocess.run(['git', '-c', 'core.trustctime=false', 'sparse-checkout', 'add', '--stdin'],
                       input='\n'.join(patterns) + '\n', text=True, cwd=ROOT, check=True)
    for path, digest in required_source_documents().items():
        target = ROOT / path
        if target.is_symlink() or not target.resolve().is_relative_to(ROOT.resolve()):
            raise ValueError(f'Registered source document is not a contained regular file: {path}')
        with target.open('rb') as stream:
            actual = hashlib.file_digest(stream, 'sha256').hexdigest()
        if 'sha256:' + actual != digest:
            raise ValueError(f'Registered source document bytes differ: {path}')
    result = inventory()
    remaining = shutil.disk_usage(ROOT).free
    if remaining < BUILD_RESERVE_BYTES:
        raise ValueError(f'Build reserve after loading required source documents is below 8 GiB: {remaining}')
    return {**result, 'remainingFreeBytes': remaining, 'requiredSourceDocuments': len(paths)}


if __name__ == '__main__':
    if sys.argv[1:] == ['--policy']:
        print(json.dumps({'semantics': 'curriculum-ci-sparse-checkout-v1', 'sparsePatterns': SPARSE_PATTERNS,
                          'retainedExactPaths': sorted(required_source_documents()),
                          'omittedQualityBinaryPattern': HISTORICAL_QUALITY_BINARY.pattern}))
    elif sys.argv[1:] == ['--materialize-required-source-documents']:
        print(json.dumps(materialize_required_documents(), indent=2))
    elif sys.argv[1:]:
        raise SystemExit('Only --policy or the complete post-checkout budget verification is supported')
    else:
        print(json.dumps(inventory(), indent=2))
