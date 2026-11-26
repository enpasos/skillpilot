#!/usr/bin/env python3
"""Derive runtime 1.4 without writing any predecessor contract or archive."""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
from pathlib import Path

import curriculum_package_v14_contracts as contracts
import generate_curriculum_package_v13_contracts as previous

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "contracts/curriculum-package/v1.3"
OUTPUT = BASE.parent / "v1.4"


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def raw(value: dict) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode("utf-8")


def generated() -> dict[Path, bytes]:
    catalog = copy.deepcopy(load(BASE / "runtime-catalog.schema.json"))
    catalog["$id"] = contracts.CATALOG_SCHEMA_ID
    catalog["title"] = "Common runtime catalog 1.4 with voluntary composition offers"
    for field, value in (("$schema", contracts.CATALOG_SCHEMA_ID), ("catalogVersion", "1.4"),
                         ("runtimeContractVersion", "1.4")):
        catalog["properties"][field] = {"const": value}
    view = copy.deepcopy(load(BASE / "runtime-composition-view.schema.json"))
    view["$id"] = contracts.VIEW_SCHEMA_ID
    view["title"] = "Common 1.4 runtime composition view with three disjoint projection roles"
    view["properties"]["$schema"] = {"const": contracts.VIEW_SCHEMA_ID}
    view["properties"]["viewFormatVersion"] = {"const": "1.3"}
    view["$defs"]["projectionRole"]["enum"].append("voluntary")
    # A voluntary offer always identifies one atomic goal at one visible place.
    view["$defs"]["canonicalSubtreeNode"]["properties"]["projectionRole"] = {
        "enum": ["target", "prerequisiteOnly"]}
    build_schema = copy.deepcopy(load(BASE / "release-model-build-profile.schema.json"))
    build_schema["$id"] = contracts.BUILD_PROFILE_SCHEMA_ID
    build_schema["title"] = "Common 1.4 release model with voluntary composition offers"
    build_schema["properties"]["$schema"] = {"const": contracts.BUILD_PROFILE_SCHEMA_ID}
    build_schema["properties"]["profileId"] = {"const": contracts.BUILD_PROFILE_ID}
    profile = copy.deepcopy(load(BASE / "profiles/full-standalone-v1.3.profile.json"))
    profile["profileId"] = contracts.PROFILE_ID
    profile["description"] = "Unpublished common 1.4 successor: explicit voluntary composition offers, with unchanged learning-unit, assessment-material and prior-view contracts."
    profile["compatibility"]["runtimeContractVersion"] = "1.4"
    for schema in (catalog, view):
        profile["trustedContractSchemas"].append({"id": schema["$id"], "sha256": hashlib.sha256(raw(schema)).hexdigest()})
    for role in profile["roles"]:
        if role["role"] == "runtime-catalog":
            role["validationSchemaIds"] = [contracts.CATALOG_SCHEMA_ID]
        if role["role"] == "composition-view":
            role["validationSchemaIds"].append(contracts.VIEW_SCHEMA_ID)
    review = json.loads(json.dumps(load(BASE / "package-redistribution-review.schema.json"))
        .replace("/v1.3/", "/v1.4/").replace("full-standalone-v1.3", contracts.PROFILE_ID)
        .replace("de-gymnasium-mathematik-release-model-v1.3", contracts.BUILD_PROFILE_ID)
        .replace("de-gymnasium-mathematik-v1.3", "de-gymnasium-mathematik-v1.4"))
    build = previous.build_profile()
    build["$schema"] = contracts.BUILD_PROFILE_SCHEMA_ID
    build["profileId"] = contracts.BUILD_PROFILE_ID
    build["package"]["packageVersion"] = "0.1.0-runtime.2"
    build["package"]["releaseId"] = build["package"]["packageId"] + "@" + build["package"]["packageVersion"]
    values = {
        "runtime-catalog.schema.json": catalog, "runtime-composition-view.schema.json": view,
        "release-model-build-profile.schema.json": build_schema,
        "package-redistribution-review.schema.json": review,
        "profiles/full-standalone-v1.4.profile.json": profile,
        "profiles/de-gymnasium-mathematik-release-model-v1.4.profile.json": build,
    }
    return {OUTPUT / name: raw(value) for name, value in values.items()}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    stale = []
    for path, payload in generated().items():
        if args.check:
            if not path.is_file() or path.read_bytes() != payload:
                stale.append(str(path.relative_to(ROOT)))
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(payload)
    if stale:
        raise SystemExit("Stale 1.4 contracts: " + ", ".join(stale))
    print("Common 1.4 contract derivation verified." if args.check else "Generated unpublished common 1.4 successor.")


if __name__ == "__main__":
    main()
