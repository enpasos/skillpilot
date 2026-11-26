# SPDX-License-Identifier: Apache-2.0
"""Version selection for authoritative semantic-kind ledgers; no import-time IO."""
from pathlib import Path
from typing import Any

LEDGER_V2_SCHEMA_ID = "https://skillpilot.com/schemas/curriculum-package/v2/curriculum-semantic-kind-ledger.schema.json"
LEDGER_V2_SCHEMA_PATH = "contracts/curriculum-package/v2/curriculum-semantic-kind-ledger.schema.json"


def semantic_kind_ledger_schema_path(repository_root: Path, value: Any) -> Path:
    # Unknown versions intentionally remain subject to the closed V1 schema.
    # Only the exact version/schema pair selects the V2 contract.
    if isinstance(value, dict) and value.get("ledgerFormatVersion") == 2 and value.get("$schema") == LEDGER_V2_SCHEMA_ID:
        return repository_root / LEDGER_V2_SCHEMA_PATH
    return repository_root / "contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json"
