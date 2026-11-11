## Dual Curriculum Packages: JSON Runtime and Curriculum Ontology {#sec:sga-dual-packages}

Every versioned curriculum release publishes **one exact subject-matter state** in two semantically equivalent representations — without dual authoring and without requiring a SkillPilot deployment to read the `curricula/` source tree (current checkpoint: [Dual Package Implementation Status](repo:docs/dev/dual-curriculum-package-implementation-status.md); operational contracts: [Package Readiness](repo:docs/qa-ci/curriculum-package-readiness.md), [Release-Model Conformance](repo:docs/qa-ci/curriculum-release-model-conformance.md), [Dual Release Contracts](repo:docs/qa-ci/dual-curriculum-release-contracts.md), and [Package Provisioning](repo:docs/production-pipelines/curriculum-package-provisioning.en.md)).

### Seven Binding Architectural Decisions and Release Artifacts {#sec:sga-dp-architecture}

```text
Authoring sources -> Release compiler -> Normalized release model
  -> JSON runtime ZIP (<id>-<ver>.json.zip)
       -> Core-first ontology exporter -> FWU/OWL ZIP (<id>-<ver>.fwu-owl.zip)
            -> Isolated reverse compiler (bubblewrap, no source JSON)
                 -> Reconstructed JSON model -> Semantic equivalence gate
```

1. **No dual authoring:** Both ZIPs derive from one source state; fixes happen only in authoring sources.
2. **JSON ZIP is the normative runtime contract (`full-standalone-v1`):** Contains `metadata/manifest.json` (explicit artifact roles, offline `schemas/catalog.json`), `data/runtime/{catalog.json,dependency-closure.json,migration-aliases.json}`, compiled `applicability`, `canonical/`, `views/`, `cards/`, `resources/`, `mappings/`, `sources/`, `metadata/quality/`, `assets/`, and `licenses/`, operable with zero `curricula/` or `app/public` fallbacks and strict ZIP32 bounds (`3.5 GB` archive, `60,000` entries, `64 MiB` JSON/image, `128` JSON depth, `100:1`/`25:1` compression ratios).
3. **Ontology ZIP derives strictly from the finished JSON ZIP:** Contains `rdf/{declarations,runtime,landscape,views,mappings,sources,cards,assets,bundle}.nt`, `skillpilot-curriculum-profile.ttl`, `catalog-v001.xml`, pinned `ontology/{lehrplan-core.owl,shapes.ttl}`, and identical binary sidecars (validated for RDF syntax, SHACL, OWL 2 DL via ROBOT, and HermiT consistency).
4. **Semantic equivalence & shared `contentDigest`:** Governed by a closed **454-rule field-semantics registry** (`323` runtime + `130` publication normal forms + `1` legacy entry; `scalar`, `ordered-list`, `set`, `map`, `binary-reference`, `generated-non-semantic`; mapped via `fwu-core`, `skillpilot-profile`, bounded `registered-canonical-json-literal`, or `excluded-generated`). Unregistered fields fail the build; placement identities use `goalId@unitId@index`.
5. **Core-first, not Core-only:** Declarative subject profiles map required `semanticKind` values (`curricularAtomic`, `curricularArea`, `programStructure`, `practiceAssessment`, `memory`, `orientation`, `runtimeSupport`) without title guessing.
6. **Zero hidden JSON carrier:** Isolated netless `bubblewrap --clearenv` reverse compilation (`DPK-008d`) proves lossless reconstruction from RDF + sidecars alone.
7. **External release index & signing projection:** `<id>-<ver>.release.json`, `.equivalence.json`, `.provenance.json`, `.SHA256SUMS`, and `.release.json.sig` (stripping `authentication.releaseIndexSignature` before canonical hash binding) plus a signed release catalog (`staging` $\to$ `stable`, never unpinned `latest`).

### Generic Runtime Decoupling, Versioning, and Phases 0–6 {#sec:sga-dp-runtime-phases}

Four generic components decouple SkillPilot from repository paths: `CurriculumPackageRepository` (read-only lock/CAS reader), `JsonCurriculumPackageLoader` (schema/hash-verified domain builder), `CurriculumResourceResolver` (versioned `(packageId, deckId, locale)` and `(packageId, resourceId)` hrefs), and `CurriculumActivationService` (quarantine extraction, dry-run validation, atomic CAS lock switch, rollback). Version axes stay orthogonal (`packageVersion`, `curriculumEdition`, `packageFormatVersion`, `runtimeContractVersion`, `supportedSkillpilotSoftware` currently `>=0.1.0 <1.0.0` for consumer `0.1.0`, `ontologyProfileVersion`, and pinned FWU Core commit/SHA), while `migration-aliases.json` distinguishes `renamed` (auto-transfers mastery) from `replacedBy`, `splitInto`, `mergedInto`, and `removed`. Licensing separates `licenseExpression`, `provenanceClass`, and `redistributionStatus` (`review-required` keeps staging candidates `not-ready-incomplete`).

| Phase | Scope & Recorded Milestone Status |
| --- | --- |
| **Phase 0** | **Technically complete (`DPK-004` / `DPK-007a`):** Frozen Mathematics `0.1.0-conformance.3` (`914` ZIP entries, `757` images, 454-rule registry; intentionally `not-ready-incomplete` pending human image/rights/source-text gates). |
| **Phase 1** | **Technically complete (`DPK-005b`–`DPK-007`):** Hermetic `bubblewrap` + Corretto + Playwright consumer verified (`1,079` goals, `33,382` source mappings, `88` views, `12` decks, `757` images, zero repository-poison reads under `strace`). |
| **Phase 2** | **Technically complete (`DPK-008a`–`DPK-008d`):** Reproducible FWU-OWL bundle (`824,452` triples, SHACL/ROBOT/HermiT green) and isolated byte-identical JSON ZIP reconstruction (`911` entries, `111` logical artifacts). |
| **Phase 3** | **Next planned (`DPK-009`, `not_started`):** Unified downstream equivalence oracle, dual hermetic consumer smoke tests, isolated `JSON -> FWU` pair reproducibility, and signed external `release.json`. |
| **Phases 4–6** | Multi-subject generalization (Math $\to$ Physics embedded closure $\to$ languages $\to$ Chemistry) $\to$ multi-package production catalog/upgrades $\to$ repository split between curriculum tooling and SkillPilot software. |
{cols="18%,82%"}
