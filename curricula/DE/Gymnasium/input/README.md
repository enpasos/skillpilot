# Canonical Gymnasium Input Archive

This directory is the DE-level holding area for source inputs that must survive the migration from legacy state-owned Gymnasium trees into the canonical Gymnasium layer.

Rules:

- Canonical learner-facing landscapes remain under `curricula/DE/Gymnasium/canonical/`.
- Source inputs stay separated by Bundesland under `curricula/DE/Gymnasium/input/<STATE>/...`.
- `sourceRef` and provenance should continue to reference state-distinguishable paths.
- This archive is for retained source material, not for duplicating the canonical goal graphs.
- The operational transfer inventory lives in `curricula/DE/Gymnasium/input/transfer-manifest.md`.
- For Sek I normalization, the first canonical target grid is G9-aligned year levels `5-10`; source-side `G8` / `G9` distinctions remain visible here in the archived inputs.
- State-specific retention is the general rule, not only for `abi/`: if non-canonical material survives migration, it belongs in a state-scoped DE archive lane.

Current target structure:

```text
curricula/DE/Gymnasium/input/
  DE-HE/
    upper-secondary/
      source-json/
    lower-secondary/
      source-json/
    abi/
  DE-BY/
    gymnasium/
    abi/
  NW/
    lower-secondary/
      source-json/
    upper-secondary/
      source-json/
```

Migration convention:

- `DE-HE/upper-secondary/` receives transferable material from `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/input/`
- `DE-HE/upper-secondary/source-json/` holds the frozen Hessen upper-secondary source-JSON snapshots plus deck/report sidecars that are still needed by authoring/deploy tooling after legacy-tree retirement
- `DE-HE/lower-secondary/` receives transferable material from `curricula/DE/HE/Kultusministerium/Gymnasium_9_Mittelstufe/input/`
- `DE-HE/lower-secondary/source-json/` holds the frozen Hessen lower-secondary source-JSON snapshots that are needed for shared provenance and later delete-handoff work
- `DE-HE/lower-secondary/retained-asset-registry.json` defines the DE-level retained-asset and mapping lane for Hessen Sek-I delete handoff work
- `DE-HE/abi/` receives retained Hessen Abitur material from `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/`
- `DE-BY/gymnasium/` is the landing zone for Bavaria source/input material that currently still lives directly under `curricula/DE/BY/Gymnasium/`
- `DE-BY/retained-asset-registry.json` defines the stable DE-level retained-source lane for Bavaria Gymnasium delete-handoff work
- `DE-BY/abi/` is reserved for later Bavaria exam/release inputs if they become part of the canonical migration scope

Bundesland rule:

- if a retained asset is state-owned, archive it in a state-coded lane under `curricula/DE/Gymnasium/input/`
- do not mix Hessen and Bavaria retained assets in one shared non-canonical folder
- treat `DE-HE/abi/` as the reference pattern for other future state-owned retained bundles

Sek-I interpretation rule:

- if a legacy source distinguishes between G8 and G9, keep that distinction in the archived source snapshot
- but map the first canonical Sek-I migration work against shared year-level buckets `5-10`
- do not open separate canonical G8 and G9 input lanes unless a later runtime use case requires that extra split

Current snapshot:

- `DE-HE/upper-secondary/` now mirrors the transferred Hessen upper-secondary input bundle.
- `DE-HE/upper-secondary/source-json/` now mirrors the Hessen upper-secondary source-JSON snapshot lane (`39` files), and the shared source-landscape registry prefers those archive snapshots via `archiveSourcePath` for tooling that still needs frozen source landscapes.
- `DE-HE/lower-secondary/` now mirrors the transferred Hessen Sek-I input bundle.
- `DE-HE/lower-secondary/source-json/` now mirrors the Hessen Sek-I source-JSON snapshot lane (`6` files), and the shared source-landscape registry now also offers `archiveSourcePath` entries for those frozen lower-secondary landscapes.
- `DE-HE/lower-secondary/retained-asset-registry.json` now pins the retained Hessen Sek-I archive lane plus the DE-level mapping archive `curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/`.
- `python3 scripts/validate_hessen_lower_secondary_archive_paths.py` now enforces that no operational retained-asset file under `DE-HE/lower-secondary/` still embeds `Gymnasium_9_Mittelstufe` path strings.
- the original Hessen Sek-I tree is now retired from the active repo path; `bash scripts/run_hessen_lower_secondary_delete_handoff_dry_run.sh` now serves as the post-retirement verification command against the surviving archive/provenance/mapping lanes.
- `DE-BY/gymnasium/` now mirrors the frozen Bavaria subject-source JSON snapshot.
- `NW/lower-secondary/source-json/` and `NW/upper-secondary/source-json/` now hold the first NRW mathematics pilot source snapshots derived from the archived official PDFs; the shared provenance registry can resolve them via `archiveSourcePath`.
- `DE-BY/retained-asset-registry.json` now pins that Bavaria retained-source lane, and the shared source-landscape registry now also exposes `archiveSourcePath` for the currently active Bavaria Math/Physics pilot sources.
- `DE-HE/abi/` now mirrors the full retained Hessen Abitur bundle.
- `DE-HE/retained-asset-registry.json` now defines the stable DE-level tooling defaults for Hessen upper-secondary exam assets and archived mapping files, while source-landscape lookup stays centralized in the DE-level provenance registry.
- Operational Hessen `abi/` metadata now follows that same split: `task_bank.json` headers use `sourceLandscapeId` plus the shared provenance registry, and blueprint/source-catalog/release-bundle source references point at retained DE-level `DE-HE/abi/` or `DE-HE/upper-secondary/` assets instead of hardcoded live legacy source paths.
- Repo-authored Hessen `abi/` markdown follows the same rule; imported/raw source extracts may still retain original legacy path strings inside their archival provenance text.
- `python3 scripts/validate_hessen_upper_secondary_archive_paths.py` now enforces that boundary: outside the allowlisted raw-provenance files from `DE-HE/retained-asset-registry.json`, no `Gymnasiale_Oberstufe` path strings may remain under `DE-HE/abi/`.
- the original Hessen Oberstufe tree has now been retired from the active repo path; `bash scripts/run_hessen_upper_secondary_delete_handoff_dry_run.sh` therefore serves both as the historical delete-handoff dry-run and as the post-retirement verification command against the surviving DE-level archive lanes.
- `DE-BY/abi/` remains a reserved lane until Bavaria exam assets become part of the active migration scope.
- `python3 scripts/validate_bavaria_gymnasium_archive_paths.py` and `python3 scripts/validate_bavaria_gymnasium_legacy_refs.py` now fence the retained Bavaria source lane plus repo-level references so the audit/provenance handoff can advance before final tree retirement.

Deletion rule:

- Legacy state trees are not deletion-ready until the required retained source material has either been moved here or explicitly declared disposable.
- Once the delete-handoff is executed, the active legacy tree should remain absent and only the DE-level archive lanes plus provenance registries should survive as operational inputs.
