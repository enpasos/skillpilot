# Canonical Gymnasium Physics Evidence Watch Status

Snapshot: `2026-04-24T12:00:00Z`

This file is generated from:

- `curricula/DE/Gymnasium/provenance/physics-evidence-watch-manifest.json`
- `scripts/render_canonical_physics_evidence_watch_status.py`

## Headline

- Watch mode: `maintenance_evidence_watch`
- Watch targets: `5`
- Watched state set: `12`
- Path references across all targets: `16`
- Unique watched files: `12`
- Existing watched files: `12/12`
- Missing watched files: `0`
- Lower-secondary watch targets: `4`
- Upper-secondary watch targets: `1`

## Watch kinds

| Kind | Count |
| --- | ---: |
| `lower_secondary_candidate_floor` | `2` |
| `lower_secondary_overlap_guard` | `1` |
| `lower_secondary_seed` | `1` |
| `upper_secondary_revision_watch` | `1` |

## Watch target register

| Target | Kind | States | Candidate rows | Path refs | Missing files |
| --- | --- | --- | --- | ---: | ---: |
| `sek1_hessen_seed_watch` | `lower_secondary_seed` | `DE-HE` | Sek I Kosmos / Erde / Mensch / Astronomie<br>Sek I Elektronik / Halbleiter / elektromagnetische Wellen<br>Sek I Licht / Materie / Atommodell / Strahlung | `1` | `0` |
| `sek1_cosmos_floor_watch` | `lower_secondary_candidate_floor` | `DE-SN`, `DE-HH` | Sek I Kosmos / Erde / Mensch / Astronomie | `2` | `0` |
| `sek1_electronics_floor_watch` | `lower_secondary_candidate_floor` | `DE-SN`, `DE-SL`, `DE-ST` | Sek I Elektronik / Halbleiter / elektromagnetische Wellen | `3` | `0` |
| `sek1_light_matter_overlap_watch` | `lower_secondary_overlap_guard` | `DE-HE`, `DE-HH`, `DE-HB`, `DE-MV`, `DE-SL`, `DE-TH` | Sek I Licht / Materie / Atommodell / Strahlung | `6` | `0` |
| `sek2_residue_watch` | `upper_secondary_revision_watch` | `DE-BE`, `DE-BB`, `DE-SH`, `DE-RP` | reviewed upper-secondary maintenance lanes | `4` | `0` |

## Unique file register

| File | Exists | SHA256-12 | Last modified (UTC) |
| --- | --- | --- | --- |
| `curricula/DE/Gymnasium/input/BB/upper-secondary/source-json/DE_BRA_S_GYM_2_PHYSIK.de.json.snapshot` | `yes` | `e4c4e8dd224c` | `2026-04-15T18:02:35Z` |
| `curricula/DE/Gymnasium/input/BE/upper-secondary/source-json/DE_BER_S_GYM_2_PHYSIK.de.json.snapshot` | `yes` | `137799e937c2` | `2026-04-15T17:26:54Z` |
| `curricula/DE/Gymnasium/input/HB/lower-secondary/source-json/DE_BRE_S_GYM_1_PHYSIK.de.json.snapshot` | `yes` | `173fd43e5eb2` | `2026-04-20T03:46:55Z` |
| `curricula/DE/Gymnasium/input/HE/lower-secondary/source-json/DE_HES_S_GYM_1_PHYSIK.de.json.snapshot` | `yes` | `65bda42da0b9` | `2026-03-15T08:08:49Z` |
| `curricula/DE/Gymnasium/input/HH/lower-secondary/source-json/DE_HAM_S_GYM_1_PHYSIK.de.json.snapshot` | `yes` | `6737ab6c70c1` | `2026-04-20T03:54:23Z` |
| `curricula/DE/Gymnasium/input/MV/lower-secondary/source-json/DE_MVP_S_GYM_1_PHYSIK.de.json.snapshot` | `yes` | `3ac00fdd9e21` | `2026-04-20T04:00:53Z` |
| `curricula/DE/Gymnasium/input/RP/upper-secondary/source-json/DE_RLP_S_GYM_2_PHYSIK.de.json.snapshot` | `yes` | `dbe8ed70bfd7` | `2026-04-19T07:52:04Z` |
| `curricula/DE/Gymnasium/input/SH/upper-secondary/source-json/DE_SHL_S_GYM_2_PHYSIK.de.json.snapshot` | `yes` | `d84cc3442eac` | `2026-04-16T07:28:01Z` |
| `curricula/DE/Gymnasium/input/SL/lower-secondary/source-json/DE_SAR_S_GYM_1_PHYSIK.de.json.snapshot` | `yes` | `fb405b0cf275` | `2026-04-20T04:34:36Z` |
| `curricula/DE/Gymnasium/input/SN/lower-secondary/source-json/DE_SAC_S_GYM_1_PHYSIK.de.json.snapshot` | `yes` | `14cea3ff540d` | `2026-04-20T04:11:21Z` |
| `curricula/DE/Gymnasium/input/ST/lower-secondary/source-json/DE_SAN_S_GYM_1_PHYSIK.de.json.snapshot` | `yes` | `ca04c9af14bb` | `2026-04-20T04:21:23Z` |
| `curricula/DE/Gymnasium/input/TH/lower-secondary/source-json/DE_THU_S_GYM_1_PHYSIK.de.json.snapshot` | `yes` | `c9ee3052d65a` | `2026-04-20T04:28:59Z` |

## `sek1_hessen_seed_watch`

- Kind: `lower_secondary_seed`
- States: `DE-HE`
- Candidate rows:
  - `Sek I Kosmos / Erde / Mensch / Astronomie`
  - `Sek I Elektronik / Halbleiter / elektromagnetische Wellen`
  - `Sek I Licht / Materie / Atommodell / Strahlung`
- Reopen rule: Reopen lower-secondary nationwide row admission if Hessen gains a visible retained strip on cosmos/astronomy, electronics/semiconductors/electromagnetic waves, or a distinct light-matter/atom-model/radiation band that is also supported by at least one additional retained state lane and is not already materially absorbed by an audited row.
- Watched files:

| File | Exists | SHA256-12 | Last modified (UTC) |
| --- | --- | --- | --- |
| `curricula/DE/Gymnasium/input/HE/lower-secondary/source-json/DE_HES_S_GYM_1_PHYSIK.de.json.snapshot` | `yes` | `65bda42da0b9` | `2026-03-15T08:08:49Z` |

## `sek1_cosmos_floor_watch`

- Kind: `lower_secondary_candidate_floor`
- States: `DE-SN`, `DE-HH`
- Candidate rows:
  - `Sek I Kosmos / Erde / Mensch / Astronomie`
- Reopen rule: Reopen the cosmos row only if a non-Sachsen lane strengthens from local side packaging to a comparably broad retained lower-secondary astronomy/cosmos anchor, or Hessen gains its own lower-secondary seed strip.
- Watched files:

| File | Exists | SHA256-12 | Last modified (UTC) |
| --- | --- | --- | --- |
| `curricula/DE/Gymnasium/input/SN/lower-secondary/source-json/DE_SAC_S_GYM_1_PHYSIK.de.json.snapshot` | `yes` | `14cea3ff540d` | `2026-04-20T04:11:21Z` |
| `curricula/DE/Gymnasium/input/HH/lower-secondary/source-json/DE_HAM_S_GYM_1_PHYSIK.de.json.snapshot` | `yes` | `6737ab6c70c1` | `2026-04-20T03:54:23Z` |

## `sek1_electronics_floor_watch`

- Kind: `lower_secondary_candidate_floor`
- States: `DE-SN`, `DE-SL`, `DE-ST`
- Candidate rows:
  - `Sek I Elektronik / Halbleiter / elektromagnetische Wellen`
- Reopen rule: Reopen the electronics row only if Hessen gains a lower-secondary seed strip or a second non-Sachsen lane moves from mixed side packaging to a clearly retained standalone row.
- Watched files:

| File | Exists | SHA256-12 | Last modified (UTC) |
| --- | --- | --- | --- |
| `curricula/DE/Gymnasium/input/SN/lower-secondary/source-json/DE_SAC_S_GYM_1_PHYSIK.de.json.snapshot` | `yes` | `14cea3ff540d` | `2026-04-20T04:11:21Z` |
| `curricula/DE/Gymnasium/input/SL/lower-secondary/source-json/DE_SAR_S_GYM_1_PHYSIK.de.json.snapshot` | `yes` | `fb405b0cf275` | `2026-04-20T04:34:36Z` |
| `curricula/DE/Gymnasium/input/ST/lower-secondary/source-json/DE_SAN_S_GYM_1_PHYSIK.de.json.snapshot` | `yes` | `ca04c9af14bb` | `2026-04-20T04:21:23Z` |

## `sek1_light_matter_overlap_watch`

- Kind: `lower_secondary_overlap_guard`
- States: `DE-HE`, `DE-HH`, `DE-HB`, `DE-MV`, `DE-SL`, `DE-TH`
- Candidate rows:
  - `Sek I Licht / Materie / Atommodell / Strahlung`
- Reopen rule: Reopen the light-matter row only if new retained evidence creates a distinct canonical gap beyond the already audited rows `Sek I Optik / Licht / Schall` and `Sek I Radioaktivitaet / Kernphysik`.
- Watched files:

| File | Exists | SHA256-12 | Last modified (UTC) |
| --- | --- | --- | --- |
| `curricula/DE/Gymnasium/input/HE/lower-secondary/source-json/DE_HES_S_GYM_1_PHYSIK.de.json.snapshot` | `yes` | `65bda42da0b9` | `2026-03-15T08:08:49Z` |
| `curricula/DE/Gymnasium/input/HH/lower-secondary/source-json/DE_HAM_S_GYM_1_PHYSIK.de.json.snapshot` | `yes` | `6737ab6c70c1` | `2026-04-20T03:54:23Z` |
| `curricula/DE/Gymnasium/input/HB/lower-secondary/source-json/DE_BRE_S_GYM_1_PHYSIK.de.json.snapshot` | `yes` | `173fd43e5eb2` | `2026-04-20T03:46:55Z` |
| `curricula/DE/Gymnasium/input/MV/lower-secondary/source-json/DE_MVP_S_GYM_1_PHYSIK.de.json.snapshot` | `yes` | `3ac00fdd9e21` | `2026-04-20T04:00:53Z` |
| `curricula/DE/Gymnasium/input/SL/lower-secondary/source-json/DE_SAR_S_GYM_1_PHYSIK.de.json.snapshot` | `yes` | `fb405b0cf275` | `2026-04-20T04:34:36Z` |
| `curricula/DE/Gymnasium/input/TH/lower-secondary/source-json/DE_THU_S_GYM_1_PHYSIK.de.json.snapshot` | `yes` | `c9ee3052d65a` | `2026-04-20T04:28:59Z` |

## `sek2_residue_watch`

- Kind: `upper_secondary_revision_watch`
- States: `DE-BE`, `DE-BB`, `DE-SH`, `DE-RP`
- Candidate rows:
  - `reviewed upper-secondary maintenance lanes`
- Reopen rule: Reopen an upper-secondary maintenance lane only if a later source revision changes visible scope or creates a genuinely shared canonical Physics gap beyond the current semantically closed reviewed cuts.
- Watched files:

| File | Exists | SHA256-12 | Last modified (UTC) |
| --- | --- | --- | --- |
| `curricula/DE/Gymnasium/input/BE/upper-secondary/source-json/DE_BER_S_GYM_2_PHYSIK.de.json.snapshot` | `yes` | `137799e937c2` | `2026-04-15T17:26:54Z` |
| `curricula/DE/Gymnasium/input/BB/upper-secondary/source-json/DE_BRA_S_GYM_2_PHYSIK.de.json.snapshot` | `yes` | `e4c4e8dd224c` | `2026-04-15T18:02:35Z` |
| `curricula/DE/Gymnasium/input/SH/upper-secondary/source-json/DE_SHL_S_GYM_2_PHYSIK.de.json.snapshot` | `yes` | `d84cc3442eac` | `2026-04-16T07:28:01Z` |
| `curricula/DE/Gymnasium/input/RP/upper-secondary/source-json/DE_RLP_S_GYM_2_PHYSIK.de.json.snapshot` | `yes` | `dbe8ed70bfd7` | `2026-04-19T07:52:04Z` |

## Regeneration

```bash
python3 scripts/render_canonical_physics_evidence_watch_status.py
./scripts/run_canonical_physics_evidence_watch.sh
```
