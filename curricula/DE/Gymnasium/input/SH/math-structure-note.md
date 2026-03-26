# Schleswig-Holstein Mathematics Structure Note

State: `2026-03-26`

This note records the first active source-snapshot step for the mathematics-first DE expansion track in Schleswig-Holstein.

Source files:

- general part:
  `curricula/DE/Gymnasium/input/SH/Fachanforderungen_Allgemeiner_Teil_2024_barrierearm.pdf`
- combined mathematics source for Sek I and Sek II:
  `curricula/DE/Gymnasium/input/SH/Fachanforderungen_Mathematik_Sekundarstufe_2024_barrierearm.pdf`

Current source boundary:

- the archived Schleswig-Holstein mathematics bundle now also has active `source-json` snapshots for both stages
- the 2024 math PDF is one combined Sek-I/Sek-II source and therefore the initial `lower-secondary` and `upper-secondary` lanes both point back to the same archived math PDF
- the 2024 Allgemeiner Teil is archived alongside the math PDF because the subject page states that this document now replaces the older embedded general part for all stages and subjects
- the lower-secondary snapshot currently preserves the source-native SH year bands `5/6`, `7/8/9`, and `10`
- inside the lower-secondary snapshot, the official `5/6` cell `Strukturen und funktionaler Zusammenhang` is now refined into the two retained source atoms `Tabellen` and `Diagramme`
- inside the lower-secondary snapshot, the official `5/6` cell `Groessen und Messen` is now refined into the three retained source atoms `Grundgroessen`, `Flaechenberechnung an Rechtecken`, and `Volumenberechnung an Quadern`
- the upper-secondary snapshot currently preserves the source-native SH phase table `Einfuehrungsjahr`, `1. Jahr der Qualifikationsphase`, and `2. Jahr der Qualifikationsphase`

Operational interpretation:

- Schleswig-Holstein now qualifies for `first corridor reviewed` / `P4` on the math rollout tracker
- both SH `sourceLandscapeId` values are now active in the shared provenance registries together with their source-goal membership and closure metadata
- the current SH lane still keeps source-native coarse granularity, but it now carries:
  - structural entry-anchor bridges on top of the official year bands and upper-secondary phases
  - two explicit source refinements inside Sek I on `5/6: Strukturen und funktionaler Zusammenhang` and `5/6: Groessen und Messen`
  - a coarse reviewed later-Sek-I functions strip on `Strukturen und funktionaler Zusammenhang`
  - coarse reviewed broad Sek-I surface mappings on most remaining official lower-secondary cells
  - a coarse reviewed upper-secondary analysis strip on the official `Analysis` phase cells
  - coarse reviewed broad geometry and stochastics surface mappings on the remaining official upper-secondary cells

Next step:

- decide which remaining coarse SH lower-secondary cells should be source-refined next beyond the now split `5/6: Strukturen und funktionaler Zusammenhang` and `5/6: Groessen und Messen`
- if narrower canonical corridor coverage becomes necessary, continue refining the SH source lane beyond the current mostly one-cell-per-official-table-cell granularity
- only after that should SH move from coarse cell-level reviewed surface toward materially broader fine-grained reviewed coverage
