# Dual Curriculum Release Contracts

DPK-003 defines the fail-closed semantic contract for a paired SkillPilot JSON runtime package and a Core-first FWU ontology package. It does not yet publish either production package.

## What is fixed now

- Every release-model field must match exactly one versioned registry entry. Unknown fields block the ontology release.
- The registry distinguishes scalars, ordered lists, sets, maps, binary references, and generated non-semantic fields.
- Goals, authored direct `contains` and `requires` edges, resource links, view children, cards, and scoring steps are ordered. RDF carries explicit, unique, contiguous zero-based positions; inferred or unordered Core relations cannot reconstruct authored order.
- Missing, `null`, empty, and default values stay distinct unless one concrete registry entry says otherwise.
- Known curricular concepts use the FWU Core. SkillPilot vocabulary is used only for application/runtime semantics and exact reverse reconstruction. A canonical JSON literal needs a field-specific Core gap, granularity, and byte cap; package- or landscape-wide JSON carriers are forbidden.
- Binary resources enter the shared semantic index through stable resource identity, canonical public reference, MIME type, length, and byte SHA-256. Variant-specific ZIP paths do not affect `contentDigest`.
- A passed equivalence report binds both final ZIPs and inner manifests, trusted contracts, the registry-selected FWU Core IRI, toolchain, exact field coverage, logical role digests, graph/view/card/asset comparisons, package-bound ontology evidence, isolated reverse compilation, validation of the original and reconstructed JSON packages, package-only consumer tests, and reproducibility. The synthetic DPK-003 report carries a Core commit/hash and `coreBindingVerified`; DPK-008 must obtain that evidence from the actual ontology package manifest and bundled Core bytes.
- The external release index binds the report and provenance and defines a signing projection that removes the signature block before canonical hashing, avoiding a signature self-reference. The schema describes `stable` evidence, but the DPK-003 validator deliberately rejects every `verified` or `stable` claim until DPK-011 performs the cryptographic signature, identity, and provenance checks. Staging may remain explicitly unsigned.

## Executable gate

Run from the repository root:

```bash
python3 -B scripts/validate_curriculum_dual_release_contracts.py
```

The validator requires `jsonschema==4.26.0`, rejects duplicate JSON keys, non-finite numbers, invalid Unicode and RDF/XML-unsafe controls, validates all schemas and positive fixtures, recomputes logical/binary records and the aggregate semantic content digest, verifies trusted file hashes and cross-document bindings, and executes a mutation matrix. Mutations cover lost order, ambiguous registry paths, inconsistent missing/null semantics, unsafe or broad JSON carriers, stale contracts, forged content records/digests, incomplete field and role coverage, mismatched graph or image evidence, substituted ontology/package reports, non-isolated reconstruction, non-hermetic consumers, non-reproducible builds, report substitution, and unverified stable promotion.

The gate belongs to the optional ontology lane. Run it through `./run_ci.sh owl`
or `./run_ci.sh full`; GitHub runs it only in the manually dispatched
`.github/workflows/owl-ci.yml` workflow. The required application/curriculum
CI and the automatic subject-export workflow intentionally omit it.

## Deliberate boundary

The initial field registry contained only the critical mapping families and ordering decisions needed to freeze the contract. DPK-004 subsequently compiled the real Mathematik state and closed all observed Runtime and publication fields. DPK-005a now binds every package file to that semantic identity and pins the complete offline schema set; DPK-005b builds the first standalone JSON package. The ontology package, isolated reverse compiler, and real equivalence evidence follow in DPK-008 and DPK-009.

The positive release and equivalence JSON files under `contracts/curriculum-package/v1/fixtures/dual-release/valid/` contain synthetic hashes and counts. They test the contract and must never be published as curriculum evidence.
