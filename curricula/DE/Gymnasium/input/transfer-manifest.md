# Canonical Gymnasium Input Transfer Manifest

Snapshot: `2026-03-15`

This manifest tracks the state-scoped source materials that must survive the migration from legacy Gymnasium trees into the DE-level canonical layer.

It complements:

- `docs/dev/canonical-gymnasium-migration-status.md`
- `curricula/DE/Gymnasium/input/README.md`

## Scope boundary

- Track retained source inputs and frozen source snapshots that are needed for provenance, audit, or later regeneration.
- Do not duplicate the canonical DE learner-facing graphs from `curricula/DE/Gymnasium/canonical/`.
- Do not treat legacy-to-canonical mapping files as part of this input archive; mapping migration remains its own workstream.
- For Sek I source transfer, preserve duration-specific source signals such as `G8` / `G9`, but normalize the first canonical migration target to G9-aligned year levels `5-10`.
- Bavaria Sek-I normalization inventory and priority order are tracked in `docs/dev/canonical-gymnasium-by-sek1-normalization.md`.
- Apply the same state-scoped archive rule to all retained non-canonical materials, not just to `abi/` directories.

## Lane inventory

| Lane | Source | Target | Form | Observed size | In scope | Transferred | Status | Next action |
| --- | --- | --- | --- | ---: | ---: | ---: | --- | --- |
| `DE-HE` upper-secondary input | `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/input/` | `curricula/DE/Gymnasium/input/DE-HE/upper-secondary/` | source PDFs + references | `15M` | `24` files | `24` files | mirrored, source tree retired | keep frozen and referenceable; legacy tree removed from active repo |
| `DE-HE` upper-secondary source snapshot | `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/` | `curricula/DE/Gymnasium/input/DE-HE/upper-secondary/source-json/` | frozen source landscapes + deck/report sidecars | `4.4M` | `39` files | `39` files | mirrored, source tree retired | keep frozen and referenceable; use `archiveSourcePath` for tooling that still needs source landscapes |
| `DE-HE` lower-secondary input | `curricula/DE/HE/Kultusministerium/Gymnasium_9_Mittelstufe/input/` | `curricula/DE/Gymnasium/input/DE-HE/lower-secondary/` | source PDFs + references | `6.7M` | `20` files | `20` files | mirrored | keep frozen and referenceable |
| `DE-HE` lower-secondary source snapshot | `curricula/DE/HE/Kultusministerium/Gymnasium_9_Mittelstufe/json/` | `curricula/DE/Gymnasium/input/DE-HE/lower-secondary/source-json/` | frozen source landscapes | `720K` | `6` files | `6` files | mirrored | keep frozen and referenceable; use `archiveSourcePath` for provenance and later delete-handoff work |
| `DE-BY` gymnasium source snapshot | `curricula/DE/BY/Gymnasium/*.json` | `curricula/DE/Gymnasium/input/DE-BY/gymnasium/` | frozen subject-source JSON with mixed year and track labels including `G8` / `G9` | `4.4M` | `45` files | `45` files | mirrored | start with the `Mathematik` probe on shared year buckets `5-10`, then extend into the `8-10` science corridor |
| `DE-HE` upper-secondary abi | `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/` | `curricula/DE/Gymnasium/input/DE-HE/abi/` | exam/release assets by subject | `410M` | `2130` files | `2130` files | mirrored, source tree retired | keep frozen and referenceable |
| `DE-BY` abi lane | no dedicated legacy lane yet | `curricula/DE/Gymnasium/input/DE-BY/abi/` | reserved | `0` | undecided | `0` files | blocked | only open this lane when Bavaria exam assets become part of the active migration scope |

## Hessen abi breakdown

The Hessen abi lane was the dominant retained-asset bulk move and remains useful as the reference breakdown for later archive work.

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
- The full Hessen abi `Physik` bundle is now also mirrored in the DE archive.
- The full Hessen abi `Mathe` bundle is now also mirrored in the DE archive.
- The Hessen upper-secondary source-JSON lane is now also mirrored in the DE archive; resolvers can prefer those frozen snapshots without depending on the live legacy tree.
- The Hessen abi backlog inside the currently known mandatory scope is therefore closed.
- The Hessen upper-secondary delete handoff has now also been executed: the old active repo tree is gone, and the mirrored DE-level archive lanes are the surviving operational source.
- The Hessen `abi/` lane is the concrete reference pattern for later retained state-owned asset lanes from other Bundeslaender.

## Recommended execution order

1. Keep the current mirrored lanes frozen and use this manifest as the authoritative transfer checklist.
2. Keep the mirrored Hessen abi bundle frozen:
   `Biologie`, `Chemie`, `Chinesisch`, `Deutsch`, `Englisch`, `Franzoesisch`, `Geschichte`, `Griechisch`, `Informatik`, `Latein`, `Musik`, `PolitikWirtschaft`, `Spanisch`, `Wirtschaft`.
   plus `Physik`.
   plus `Mathe`.
3. Re-evaluate whether a Bavaria `abi` lane is actually needed before opening it.
4. Continue with Bavaria Sek-I normalization and later mapping work, starting from the `Mathematik` probe documented in `docs/dev/canonical-gymnasium-by-sek1-normalization.md`.

## Proxy score

```text
known files in scope = 24 + 39 + 20 + 6 + 45 + 2130 = 2264
transferred so far   = 24 + 39 + 20 + 6 + 45 + 2130 = 2264
proxy score          = 2264 / 2264 = 100.00%
```

Working input-transfer score:

- `100%`
