# DE-SH Lower-Secondary Mapping Lane

This lane now carries the first Schleswig-Holstein lower-secondary source snapshot into the shared DE-level canonical mathematics landscape.

Current status on `2026-03-26`:

- repository-backed mapping fixture now exists:
  `sh_math_lower_secondary_to_canonical_math.json`
- active `sourceLandscapeId`:
  `271b385b-04c7-4205-8202-b2dc918f5782`
- current mapping count: `21`
- the first Schleswig-Holstein mathematics source PDF is now archived locally:
  `curricula/DE/Gymnasium/input/SH/Fachanforderungen_Mathematik_Sekundarstufe_2024_barrierearm.pdf`
- the 2024 Allgemeiner Teil is now archived locally:
  `curricula/DE/Gymnasium/input/SH/Fachanforderungen_Allgemeiner_Teil_2024_barrierearm.pdf`
- the first Schleswig-Holstein lower-secondary source snapshot is now active:
  `curricula/DE/Gymnasium/input/SH/lower-secondary/source-json/DE_SHL_S_GYM_1_MATHEMATIK.de.json.snapshot`

Current use:

- canonical Gymnasium `Mathematik`
- lower-secondary source snapshot preserves the official SH year bands `5/6`, `7/8/9`, and `10`
- the source root now bridges exactly to the shared canonical math root
- shared lower-secondary entry anchors are now mapped as a structural bridge:
  `5/6 -> J5`, `7/8/9 -> J7`, `10 -> J10`
- the lane now carries a coarse reviewed later-Sek-I functions strip on the SH `Strukturen und funktionaler Zusammenhang` cells:
  `7/8/9 -> Funktionsgrundlagen (Sek I)`, `10 -> Lineare Funktionen beschreiben`
- the lane now also carries coarse reviewed broad Sek-I surface mappings on most remaining official cells:
  `Zahl und Operation -> Zahlen, Terme und Algebra (Sek I)`
  `Groessen und Messen -> Groessen, Proportionalitaet und Trigonometrie (Sek I)`
  `Raum und Form -> Geometrie und Raum (Sek I)`
  `Daten und Zufall -> Daten und Zufall (Sek I)`
- the previously open `Jahrgangsband 5/6: Strukturen und funktionaler Zusammenhang` cell is now source-refined into:
  `Tabellen -> Geeignete Darstellungen auswaehlen`
  `Diagramme -> Diagramme und Visualisierungen interpretieren`
- the `Jahrgangsband 5/6: Groessen und Messen` cell is now also source-refined into:
  `Grundgroessen -> Groessen und Einheiten vergleichen und umrechnen`
  `Flaechenberechnung an Rechtecken -> Flaecheninhalte ebener Figuren berechnen`
  `Volumenberechnung an Quadern -> Volumina und Oberflaechen einfacher Koerper berechnen`
- this reviewed pass is intentionally coarse because the current SH source snapshot keeps one retained source goal per official year-band table cell
- except for the refined `5/6` structures and measurement cells, the remaining SH lower-secondary reviewed surface is still mostly one official table cell per coarse canonical bridge
- next step: refine the remaining coarse SH `5/6` cells, most likely `Zahl und Operation` or `Daten und Zufall`, before any broader reviewed-coverage or `P5` claim
