# SH Math Onboarding Note

This note records the first Schleswig-Holstein source-landscape identifiers for the mathematics-first DE expansion track and their activation state.

Reserved and activated source landscapes on `2026-03-26`:

- lower-secondary Gymnasium mathematics:
  - `sourceLandscapeId`: `271b385b-04c7-4205-8202-b2dc918f5782`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-SH/lower-secondary/sh_math_lower_secondary_to_canonical_math.json`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/SH/lower-secondary/source-json/DE_SHL_S_GYM_1_MATHEMATIK.de.json.snapshot`
- upper-secondary Gymnasium mathematics:
  - `sourceLandscapeId`: `01ffba7d-7588-4221-bd2b-1a692839809a`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-SH/upper-secondary/sh_math_upper_secondary_to_canonical_math.json`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/SH/upper-secondary/source-json/DE_SHL_S_GYM_2_MATHEMATIK.de.json.snapshot`

Activation result:

- the first Schleswig-Holstein mathematics source bundle is archived locally at:
  - `curricula/DE/Gymnasium/input/SH/Fachanforderungen_Mathematik_Sekundarstufe_2024_barrierearm.pdf`
  - `curricula/DE/Gymnasium/input/SH/Fachanforderungen_Allgemeiner_Teil_2024_barrierearm.pdf`
- both Schleswig-Holstein `sourceLandscapeId` values are now active in `source-landscape-registry.json`
- both Schleswig-Holstein lanes now contribute source goal memberships to `source-goal-membership-registry.json`
- both Schleswig-Holstein lanes now contribute atomic closures to `source-goal-closure-registry.json`
- the lower-secondary source snapshot now preserves the official SH year-band table:
  - `5/6`
  - `7/8/9`
  - `10`
- the upper-secondary source snapshot now preserves the official SH phase table:
  - `Einfuehrungsjahr`
  - `1. Jahr der Qualifikationsphase`
  - `2. Jahr der Qualifikationsphase`
- the lower-secondary source snapshot still keeps a source-native official-cell structure, but now refines the `5/6` cell `Strukturen und funktionaler Zusammenhang` into the retained source atoms `Tabellen` and `Diagramme`
- the lower-secondary source snapshot now also refines the `5/6` cell `Groessen und Messen` into the retained source atoms `Grundgroessen`, `Flaechenberechnung an Rechtecken`, and `Volumenberechnung an Quadern`
- the lower-secondary source snapshot now also refines the `5/6` cell `Daten und Zufall` into the retained source atoms `Statistische Erhebungen`, `Kombinatorische Fragestellungen`, and `Einstufige Zufallsexperimente`
- the upper-secondary source snapshot currently keeps one retained source atom per official phase-and-area cell from the phase table
- the lower-secondary mapping lane now carries `23` mappings:
  - exact source-root bridge to the canonical math root
  - `Jahrgangsband 5/6 -> J5`
  - `Jahrgangsband 7/8/9 -> J7`
  - `Jahrgangsstufe 10 -> J10`
  - coarse reviewed later-Sek-I functions strip:
    `Jahrgangsband 7/8/9: Strukturen und funktionaler Zusammenhang -> Funktionsgrundlagen (Sek I)`
    `Jahrgangsstufe 10: Strukturen und funktionaler Zusammenhang -> Lineare Funktionen beschreiben`
  - coarse reviewed broad Sek-I surface mappings:
    `Zahl und Operation -> Zahlen, Terme und Algebra (Sek I)`
    `Groessen und Messen -> Groessen, Proportionalitaet und Trigonometrie (Sek I)`
    `Raum und Form -> Geometrie und Raum (Sek I)`
    `Daten und Zufall -> Daten und Zufall (Sek I)`
  - refined `5/6` structures split with first representation bridges:
    `Tabellen -> Geeignete Darstellungen auswaehlen`
    `Diagramme -> Diagramme und Visualisierungen interpretieren`
  - refined `5/6` measurement split with first measurement/geometry bridges:
    `Grundgroessen -> Groessen und Einheiten vergleichen und umrechnen`
    `Flaechenberechnung an Rechtecken -> Flaecheninhalte ebener Figuren berechnen`
    `Volumenberechnung an Quadern -> Volumina und Oberflaechen einfacher Koerper berechnen`
  - refined `5/6` data/chance split with first statistics/probability bridges:
    `Statistische Erhebungen -> Absolute und relative Haeufigkeiten bestimmen und darstellen`
    `Einstufige Zufallsexperimente -> Laplace-Experimente auswerten`
    `Kombinatorische Fragestellungen` currently remain a retained source atom without a narrower reviewed canonical bridge
- the upper-secondary mapping lane now carries `13` mappings:
  - exact source-root bridge to the canonical math root
  - `Einfuehrungsjahr -> E`
  - `1. Jahr der Qualifikationsphase -> Q1`
  - `2. Jahr der Qualifikationsphase -> Q3`
  - coarse reviewed upper-secondary analysis strip:
    `Einfuehrungsjahr: Analysis -> Einfuehrung in den Ableitungsbegriff`
    `1. Jahr der Qualifikationsphase: Analysis -> Anwendungen des Ableitungsbegriffs`
    `2. Jahr der Qualifikationsphase: Analysis -> Integralrechnung und Differenzialgleichungen (Sek II)`
  - coarse reviewed broad upper-secondary area mappings:
    `Geometrie -> Raum, Matrizen und lineare Modelle (Sek II)`
    `Stochastik -> Stochastik, Tests und Statistik (Sek II)`
- Schleswig-Holstein structural entry-anchor mappings are now active on the shared spine
- Schleswig-Holstein now also carries a widened coarse reviewed canonical surface on top of the source-native year-band / phase cells
- these reviewed corridors remain intentionally coarse because the current SH source lane is still mostly one retained source goal per official table cell except for the refined `5/6` structures, measurement, and data/chance splits

Operational rule from here:

- keep these reserved `sourceLandscapeId` values stable
- keep the archived SH snapshots source-native first, i.e. preserve official year bands and official upper-secondary phase buckets instead of normalizing them inside the source lane
- keep the shared lower-secondary entry-anchor bridge stable on top of the SH year-band snapshot
- keep the shared upper-secondary entry-anchor bridge stable on top of the SH phase snapshot
- keep the widened coarse reviewed SH surface stable while deciding which remaining coarse SH cells need source refinement next, most likely `5/6: Zahl und Operation` or `5/6: Raum und Form`
- if reviewed work needs narrower source-to-canonical evidence, continue refining the SH source lane beyond the current mostly one-cell-per-table-cell granularity before forcing finer canonical claims
