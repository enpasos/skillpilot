#!/usr/bin/env python3
"""Validate one landscape JSON against the runtime schema."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import jsonschema


DEFAULT_JSON = Path("curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json")
DEFAULT_SCHEMA = Path("docs/landscape-runtime.schema.json")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("json_path", nargs="?", default=str(DEFAULT_JSON))
    parser.add_argument("--schema", default=str(DEFAULT_SCHEMA))
    args = parser.parse_args()

    json_path = Path(args.json_path)
    schema_path = Path(args.schema)

    if not json_path.exists():
        print(f"Error: Data file not found: {json_path}")
        raise SystemExit(1)
    if not schema_path.exists():
        print(f"Error: Schema file not found: {schema_path}")
        raise SystemExit(1)

    with schema_path.open("r", encoding="utf-8") as handle:
        schema = json.load(handle)
    with json_path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)

    try:
        jsonschema.validate(instance=data, schema=schema)
        print(f"SUCCESS: {json_path} is valid against {schema_path}")
    except jsonschema.exceptions.ValidationError as error:
        print("FAILURE: Validation failed!")
        print(f"Message: {error.message}")
        print(f"Path: {list(error.path)}")
        raise SystemExit(1)
    except Exception as error:  # pragma: no cover - helper script only
        print(f"An error occurred: {error}")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
