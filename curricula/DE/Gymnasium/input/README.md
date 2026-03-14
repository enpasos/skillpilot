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
    lower-secondary/
    abi/
  DE-BY/
    gymnasium/
    abi/
```

Migration convention:

- `DE-HE/upper-secondary/` receives transferable material from `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/input/`
- `DE-HE/lower-secondary/` receives transferable material from `curricula/DE/HE/Kultusministerium/Gymnasium_9_Mittelstufe/input/`
- `DE-HE/abi/` receives retained Hessen Abitur material from `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/`
- `DE-BY/gymnasium/` is the landing zone for Bavaria source/input material that currently still lives directly under `curricula/DE/BY/Gymnasium/`
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
- `DE-HE/lower-secondary/` now mirrors the transferred Hessen Sek-I input bundle.
- `DE-BY/gymnasium/` now mirrors the frozen Bavaria subject-source JSON snapshot.
- `DE-HE/abi/` now mirrors the full retained Hessen Abitur bundle.
- `DE-BY/abi/` remains a reserved lane until Bavaria exam assets become part of the active migration scope.

Deletion rule:

- Legacy state trees are not deletion-ready until the required retained source material has either been moved here or explicitly declared disposable.
