## Dual Curriculum Release Contracts {#sec:qal-dual-release}

`DPK-003` defines the fail-closed semantic contract pairing a SkillPilot JSON runtime package with a Core-first FWU ontology package, without by itself publishing either production artifact.

### Binding Contract Invariants {#sec:qal-dual-invariants}

- **Total field-registry coverage:** Every release-model field must match exactly one versioned registry entry (scalars, ordered lists, sets, maps, binary references, generated non-semantic fields). Unknown fields block the ontology release.
- **Explicit zero-based ordering in RDF:** Goals, authored direct `contains` and `requires` edges, resource links, view children, cards, and scoring steps are ordered. RDF carries unique, contiguous zero-based positions because unordered Core relations cannot reconstruct authored order.
- **Strict value distinction & ban on broad JSON carriers:** Missing, `null`, empty, and default values remain distinct unless a specific registry entry states otherwise. Known curricular concepts use the FWU Core; SkillPilot vocabulary is restricted to runtime semantics and exact reverse reconstruction. Any canonical JSON literal requires a field-specific Core gap, granularity, and byte cap; package- or landscape-wide JSON carriers are forbidden.
- **Path-neutral binary identity:** Binary resources enter the shared index via stable resource identity, canonical public reference, MIME type, byte length, and SHA-256; variant-specific ZIP paths never alter `contentDigest`.
- **Equivalence report & signing projection:** A passing equivalence report binds both final ZIPs and inner manifests, trusted contracts, FWU Core IRI, toolchain, field coverage, role digests, graph/view/card/asset comparisons, isolated reverse compilation, validation of original and reconstructed JSON packages, hermetic consumer runs, and reproducibility. The external release index strips the signature block before canonical hashing (avoiding self-reference), and the `DPK-003` validator rejects every `verified` or `stable` claim until `DPK-011` performs cryptographic signature, identity, and provenance checks (`staging` may remain explicitly unsigned).

### Executable Gate and Boundary {#sec:qal-dual-gate}

Run from the repository root (part of the optional ontology lane in `./run_ci.sh owl`, `./run_ci.sh full`, and `.github/workflows/owl-ci.yml`; requires `jsonschema==4.26.0`):

```bash
python3 -B scripts/validate_curriculum_dual_release_contracts.py
```

The validator rejects duplicate JSON keys, non-finite numbers, invalid Unicode, and RDF/XML-unsafe control characters, validates all schemas and positive fixtures, recomputes logical/binary records and the aggregate `contentDigest`, and runs a mutation matrix covering lost ordering, ambiguous paths, blurred `missing`/`null` semantics, broad JSON carriers, forged digests, substituted reports, non-isolated reconstruction, and unverified `stable` promotion.

:::warning{title="Synthetic contract fixtures are never curriculum evidence"}
Positive release and equivalence files under `contracts/curriculum-package/v1/fixtures/dual-release/valid/` carry synthetic hashes and counts strictly for contract testing and must never be published as curriculum evidence.
:::
