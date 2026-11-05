#!/usr/bin/env python3
"""Bound the exact repository inputs of the static OpenAI public-edge CI job."""
from __future__ import annotations

import json
from pathlib import Path
import stat

ROOT = Path(__file__).resolve().parents[1]
SOURCE_BUDGET_BYTES = 1024 ** 2
GIT_RESERVE_BYTES = 15 * 1024 ** 3
BUILD_RESERVE_BYTES = 8 * 1024 ** 3
REQUIRED_PATHS = (
    '.github/workflows/ci.yml',
    'deploy_skillpilot.sh',
    'deploy/nginx/skillpilot-main-vhost-openai-deny-locations.conf',
    'deploy/nginx/skillpilot-mcp-coaches.conf',
    'deploy/nginx/skillpilot-openai-mtls-mode-enforce.conf',
    'deploy/nginx/skillpilot-openai-mtls-mode-observe.conf',
    'deploy/nginx/skillpilot-openai-stable-acme.conf',
    'deploy/openai-mtls/openai-connectors-mtls-ca.pem',
    'deploy/openai-mtls/openai-root-ca.pem',
    'deploy/openai-mtls/skillpilot-openai-v1-mtls-verifier.service',
    'scripts/check_ci_openai_edge_checkout.py',
    'scripts/deploy.sh',
    'scripts/install_openai_stable_origin_edge.sh',
    'scripts/install_openai_v1_mtls_edge.sh',
    'scripts/lib/openai_v1_mtls_mode.sh',
    'scripts/lib/service_environment_permissions.py',
    'scripts/openai_v1_mtls_verifier.py',
    'scripts/test_openai_v1_mtls_edge.py',
    'scripts/test_openai_v1_public_edge.py',
    'scripts/test_service_environment_permissions.py',
    'scripts/validate_openai_oauth_metadata.py',
    'scripts/verify_openai_stable_origin_certificate.sh',
    'scripts/verify_openai_v1_mtls_edge.sh',
    'scripts/verify_openai_v1_mtls_nginx_contract.py',
    'scripts/verify_openai_v1_public_edge.sh',
)
SPARSE_PATTERNS = tuple('/' + path for path in REQUIRED_PATHS)
CHECK_COMMANDS = (
    ('bash', '-n', 'scripts/verify_openai_v1_public_edge.sh'),
    ('python3', '-B', 'scripts/test_openai_v1_public_edge.py'),
    ('bash', 'scripts/verify_openai_v1_mtls_edge.sh', '--static'),
)


def inventory(root: Path = ROOT) -> dict:
    total_bytes = 0
    for relative in REQUIRED_PATHS:
        path = root / relative
        info = path.lstat()
        if not stat.S_ISREG(info.st_mode):
            raise ValueError(f'OpenAI edge input is not a regular file: {relative}')
        total_bytes += info.st_size
    if total_bytes > SOURCE_BUDGET_BYTES:
        raise ValueError(f'OpenAI edge inputs exceed reviewed source budget: {total_bytes} > {SOURCE_BUDGET_BYTES}')
    return {'semantics': 'openai-edge-ci-sparse-checkout-v1', 'retainedFiles': len(REQUIRED_PATHS),
            'retainedBytes': total_bytes, 'sourceBudgetBytes': SOURCE_BUDGET_BYTES,
            'gitReserveBytes': GIT_RESERVE_BYTES, 'buildReserveBytes': BUILD_RESERVE_BYTES,
            'requiredPreCheckoutBytes': SOURCE_BUDGET_BYTES + GIT_RESERVE_BYTES + BUILD_RESERVE_BYTES}


if __name__ == '__main__':
    print(json.dumps(inventory(), indent=2))
