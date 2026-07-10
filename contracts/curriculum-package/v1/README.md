# Curriculum Package Contract v1

This directory is the trusted repository authority for the SkillPilot curriculum-package v1 contract.

DPK-001 establishes only the contract kernel:

- `package-manifest.schema.json` defines the strict internal manifest shape.
- `profiles/full-standalone-v1.profile.json` defines the closed JSON release profile, artifact-role cardinalities, media types, redistribution policy, and package-format limits.
- `fixtures/valid/` contains conforming manifest examples.
- `fixtures/invalid/manifest-contract-cases.json` derives deliberately invalid manifests from the valid base fixture and declares the exact diagnostic-code multiset expected for every case; `fixtures/invalid/raw/` covers malformed JSON that cannot be represented after parsing.

The existing subject exporter still produces the legacy subject-export format. It is not yet conformant with `full-standalone-v1` and must not advertise that profile until runtime catalog, standalone dependency closure, and the remaining package artifacts are implemented. DPK-001 contracts only the JSON runtime variant; the FWU-OWL manifest/profile is a later, separate contract step.

Run the contract conformance gate from the repository root:

```bash
python3 scripts/validate_curriculum_package_contracts.py
```

Use `--verbose` to print every fixture result. The validator uses the pinned `jsonschema==4.26.0` runtime and fails closed when the trusted schema/profile are inconsistent, their hash binding is stale, a valid fixture fails, or an invalid fixture produces anything other than its exact expected diagnostic-code multiset. Security-critical fixtures additionally pin diagnostic locations.

## Trust and inventory rules

The manifest binds the manifest schema and release profile by ID, archive-root-relative package path, and SHA-256. The validator requires each declaration to match both the trusted file in this directory and the corresponding `files[]` record. A package-local contract copy is therefore useful for offline processing but cannot redefine the trusted contract.

All normal files are inventoried through explicit artifact roles. `metadata/manifest.json` is excluded because a manifest cannot hash itself; `metadata/SHA256SUMS` is generated after the manifest and binds the manifest together with the payload. Paths in `files[]` never contain the archive-root prefix.

All contract JSON is parsed with duplicate-object-key rejection before schema validation, avoiding parser-dependent interpretations across Python, Java, and TypeScript. The profile caps a manifest at 64 MiB, 59,998 inventoried file records, and 1,024 license documents; array limits fail fast before full schema traversal, and path lookups are indexed rather than quadratic.

Every identifier used in a file's SPDX-style `licenseExpression` is resolved through `licenseDocuments` to an inventoried `license` artifact. `NONE`, `NOASSERTION`, malformed expressions, unresolved identifiers, and orphaned license texts fail the public standalone profile. Provenance remains a separate field and never substitutes for a redistribution license.

The role table in the profile is authoritative. Runtime catalog, dependency closure, migration aliases, canonical landscape, view index/views, card index, resource index, schema catalog, schema, release profile, and license are required. Optional roles remain closed and explicitly enumerated; unknown roles fail validation.

The profile also records the approved manifest/ZIP32 limits, portable full-path cap, and maximum per-entry/overall compression ratios. This manifest-level gate checks declared entry counts and sizes, image-lane limits, and nested-archive prohibition. A later finished-ZIP validator must additionally enforce the raw manifest-byte limit before parsing and verify the outer ZIP size, compressed sizes, ratios, and actual decompressed metadata rather than trusting manifest declarations.
