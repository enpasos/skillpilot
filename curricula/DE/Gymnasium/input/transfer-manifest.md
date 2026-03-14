# Canonical Gymnasium Input Transfer Manifest

Snapshot: `2026-03-14`

This manifest tracks the state-scoped source materials that must survive the migration from legacy Gymnasium trees into the DE-level canonical layer.

It complements:

- `docs/dev/canonical-gymnasium-migration-status.md`
- `curricula/DE/Gymnasium/input/README.md`

## Scope boundary

- Track retained source inputs and frozen source snapshots that are needed for provenance, audit, or later regeneration.
- Do not duplicate the canonical DE learner-facing graphs from `curricula/DE/Gymnasium/canonical/`.
- Do not treat legacy-to-canonical mapping files as part of this input archive; mapping migration remains its own workstream.
- For Sek I source transfer, preserve duration-specific source signals such as `G8` / `G9`, but normalize the first canonical migration target to G9-aligned year levels `5-10`.

## Lane inventory

| Lane | Source | Target | Form | Observed size | In scope | Transferred | Status | Next action |
| --- | --- | --- | --- | ---: | ---: | ---: | --- | --- |
| `DE-HE` upper-secondary input | `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/input/` | `curricula/DE/Gymnasium/input/DE-HE/upper-secondary/` | source PDFs + references | `15M` | `24` files | `24` files | mirrored | keep frozen and referenceable |
| `DE-HE` lower-secondary input | `curricula/DE/HE/Kultusministerium/Gymnasium_9_Mittelstufe/input/` | `curricula/DE/Gymnasium/input/DE-HE/lower-secondary/` | source PDFs + references | `6.7M` | `20` files | `20` files | mirrored | keep frozen and referenceable |
| `DE-BY` gymnasium source snapshot | `curricula/DE/BY/Gymnasium/*.json` | `curricula/DE/Gymnasium/input/DE-BY/gymnasium/` | frozen subject-source JSON with mixed year and track labels including `G8` / `G9` | `4.4M` | `45` files | `45` files | mirrored | map relevant Sek-I content into shared year-level buckets `5-10` before opening finer canonical lanes |
| `DE-HE` upper-secondary abi | `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/` | `curricula/DE/Gymnasium/input/DE-HE/abi/` | exam/release assets by subject | `410M` | `2130` files | `87` files | started | transfer `Physik`, then `Mathe` |
| `DE-BY` abi lane | no dedicated legacy lane yet | `curricula/DE/Gymnasium/input/DE-BY/abi/` | reserved | `0` | undecided | `0` files | blocked | only open this lane when Bavaria exam assets become part of the active migration scope |

## Hessen abi breakdown

The Hessen abi lane dominates the remaining transfer volume.

| Subject | Files |
| --- | ---: |
| `Mathe` | `1248` |
| `Physik` | `795` |
| `Biologie` | `9` |
| `Chemie` | `9` |
| `Chinesisch` | `2` |
| `Deutsch` | `6` |
| `Englisch` | `6` |
| `Franzoesisch` | `6` |
| `Geschichte` | `6` |
| `Griechisch` | `6` |
| `Informatik` | `6` |
| `Latein` | `6` |
| `Musik` | `6` |
| `PolitikWirtschaft` | `6` |
| `Spanisch` | `6` |
| `Wirtschaft` | `6` |

Interpretation:

- `Mathe` and `Physik` account for `2043 / 2130` files and should be treated as separate bulk moves.
- The small-subject Hessen abi batch with `87` files is now mirrored in the DE archive.
- The remaining open Hessen abi backlog is therefore exactly `Physik` plus `Mathe`.

## Recommended execution order

1. Keep the current mirrored lanes frozen and use this manifest as the authoritative transfer checklist.
2. Keep the mirrored small Hessen abi subject batch frozen:
   `Biologie`, `Chemie`, `Chinesisch`, `Deutsch`, `Englisch`, `Franzoesisch`, `Geschichte`, `Griechisch`, `Informatik`, `Latein`, `Musik`, `PolitikWirtschaft`, `Spanisch`, `Wirtschaft`.
3. Transfer the Hessen abi `Physik` bundle as the next bulk batch.
4. Transfer the Hessen abi `Mathe` bundle as the final large batch.
5. Re-evaluate whether a Bavaria `abi` lane is actually needed before opening it.

## Proxy score

```text
known files in scope = 24 + 20 + 45 + 2130 = 2219
transferred so far   = 24 + 20 + 45 + 87 = 176
proxy score          = 176 / 2219 = 7.93%
```

Working input-transfer score:

- `8%`
