# Bavaria Mathematics Sek I Probe

Snapshot: `2026-03-16`

This note turns the Bavaria Sek-I normalization rule into a concrete first probe for `Mathematik`.

It complements:

- `docs/dev/canonical-gymnasium-by-sek1-normalization.md`
- `docs/dev/canonical-gymnasium-migration-status.md`
- `curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_math_to_canonical_math.json`
- `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`

## Why Mathematics first

`Mathematik` is the best first Bavaria Sek-I probe because:

- it already spans the full shared year grid `5-10`,
- it already has a small runtime mapping pilot into the canonical DE math landscape,
- it is structurally central for later cross-subject convergence.

Observed Bavaria source coverage:

| Canonical year bucket | Bavaria source prefix | Observed cluster rows |
| --- | --- | ---: |
| `J5` | `M5` | `10` |
| `J6` | `M6` | `10` |
| `J7` | `M7` | `9` |
| `J8` | `M8` | `7` |
| `J9` | `M9` | `11` |
| `J10` | `M10` | `5` |

## Current runtime overlap

The current runtime mapping file already proves a thin Bavaria -> canonical bridge, but only for the lower-secondary function corridor.

Observed current pilot scope:

- `64` mapping entries total
- `1` exact motivation mapping
- `54` partial scope-anchor / reviewed row and subrow mappings
- `9` exact/partial atomic mappings inside the function corridor, plus `44` first reviewed non-function row and subrow bridges

Current Bavaria source areas already covered:

- `Jahrgangsstufe 5`
- `Jahrgangsstufe 6`
- `Jahrgangsstufe 7`
- `Jahrgangsstufe 8`
- `Jahrgangsstufe 9`
- `Jahrgangsstufe 10`
- `M5 1 Natürliche und ganze Zahlen – Addition und Subtraktion`
- `M5 2 Geometrische Figuren und Lagebeziehungen`
- `M5 3 Natürliche und ganze Zahlen – Multiplikation und Division`
- `M5 4 Größen und ihre Einheiten`
- `M6 1 Rationale Zahlen`
- `M6 2 Flächeninhalt und Volumen`
- `M6 3 Prozentrechnung, Daten und Diagramme`
- `M7 1 Terme mit Variablen`
- `M7 2 Geometrische Figuren: Symmetrie und Winkel`
- `M7 3 Lineare Gleichungen und Vertiefung der Prozentrechnung`
- `M7 4 Kenngrößen von Daten`
- `M7 5 Kongruenz, besondere Dreiecke und Dreieckskonstruktionen`
- `M8 1 Funktion und Term`
- `M8 2 Lineare Funktionen`
- `M8 3 Elementare gebrochen-rationale Funktionen`
- `M8 4 Bruchterme und Bruchgleichungen`
- `M8 5 Laplace-Experimente`
- `M8 6 Lineare Gleichungssysteme`
- `M8 7 Kreis und Zylinder`
- `M9 1 Quadratwurzeln`
- `M9 2.1 Quadratische Funktionen und quadratische Gleichungen`
- `M9 3 Wahrscheinlichkeit verknüpfter Ereignisse`
- `M9 4 Ähnlichkeit und Strahlensatz`
- `M9 5 Potenzfunktionen mit natürlichen Exponenten und Erweiterung des Potenzbegriffs`
- `M9 6 Satz des Pythagoras`
- `M9 7 Trigonometrie`
- `M10 1 Exponentielles Wachstum und Logarithmus`
- `M10 2 Zusammengesetzte Zufallsexperimente und stochastische Simulationen`
- `M10 3 Sinus- und Kosinusfunktion`
- `M10 4 Ganzrationale Funktionen`
- `M10 5 Fortführung der Raumgeometrie`
- one shared motivation anchor

This means:

- the Bavaria pilot does **not** yet cover Sek-I mathematics exhaustively,
- it now proves a first structural overlap at the year-anchor level for `J5-J10`,
- it now also confirms first non-function row overlap for `M5 1`, `M5 2`, `M5 3`, `M5 4`, `M6 1`, `M6 2`, `M6 3`, `M7 1`, `M7 2`, `M7 3`, `M7 4`, `M7 5`, `M8 3`, `M8 4`, `M8 5`, `M8 6`, `M8 7`, `M9 1`, `M9 3`, `M9 4`, `M9 5`, `M9 6`, `M9 7`, `M10 1`, `M10 2`, `M10 3`, `M10 4`, and `M10 5`,
- it now also includes first explicit subrow refinement for `M8 3`, `M8 4`, `M9 3`, `M9 7`, and `M10 2`,
- it still mainly confirms that the existing canonical DE lower-secondary math slice is corridor-shaped rather than already subject-wide complete.

## Current canonical Sek-I baseline

The current canonical DE math landscape now contains:

- realized lower-secondary year anchors `J5-J10`
- the existing lower-secondary pilot cluster `Funktionsgrundlagen (Sek I)`
- first additional Sek-I anchor atoms for `J5`, `J6`, `J7`, `J8`, `J9`, and `J10`

Contained atomic goals:

| Canonical goal | Phase tag |
| --- | --- |
| `Natürliche und ganze Zahlen addieren und subtrahieren` | `J5` |
| `Geometrische Figuren und Lagebeziehungen beschreiben` | `J5` |
| `Größen und Einheiten vergleichen und umrechnen` | `J5` |
| `Natürliche und ganze Zahlen multiplizieren und dividieren` | `J5` |
| `Rationale Zahlen darstellen und berechnen` | `J6` |
| `Flächeninhalt und Volumen berechnen` | `J6` |
| `Prozentrechnung anwenden und Daten auswerten` | `J6` |
| `Terme mit Variablen aufstellen und umformen` | `J7` |
| `Symmetrie und Winkel begründen` | `J7` |
| `Lineare Gleichungen lösen und Prozentrechnung vertiefen` | `J7` |
| `Kenngrößen von Daten bestimmen und interpretieren` | `J7` |
| `Kongruenz begründen und Dreieckskonstruktionen ausführen` | `J7` |
| `Zuordnungen analysieren` | `GLOBAL` |
| `Proportionale Zuordnungen nutzen` | `J7` |
| `Lineare Funktionen beschreiben` | `GLOBAL` |
| `Lineare Funktionen rechnerisch untersuchen` | `GLOBAL` |
| `Gebrochen-rationale Funktionen in Grundform untersuchen` | `J8` |
| `Graphen und Asymptoten einfacher Hyperbeln deuten` | `J8` |
| `Indirekte Proportionalität mit Hyperbeln beschreiben` | `J8` |
| `Bruchterme strukturieren, erweitern und kürzen` | `J8` |
| `Bruchterme auf gemeinsamen Nenner bringen und verknüpfen` | `J8` |
| `Potenzgesetze mit ganzzahligen Exponenten anwenden` | `J8` |
| `Bruchgleichungen lösen und als Schnittprobleme deuten` | `J8` |
| `Formeln mit Brüchen nach Variablen auflösen` | `J8` |
| `Laplace-Experimente auswerten` | `J8` |
| `Lineare Gleichungssysteme lösen und deuten` | `J8` |
| `Kreise und Zylinder untersuchen` | `J8` |
| `Quadratwurzeln darstellen und nutzen` | `J9` |
| `Quadratische Gleichungen loesen` | `J9` |
| `Verknüpfte Ereignisse mit Mengen- und Vierfelderdarstellungen strukturieren` | `J9` |
| `Wahrscheinlichkeiten verknüpfter Ereignisse berechnen` | `J9` |
| `Ähnlichkeit und Strahlensatz anwenden` | `J9` |
| `Potenzfunktionen und Potenzgesetze nutzen` | `J9` |
| `Satz des Pythagoras anwenden` | `J9` |
| `Trigonometrie am rechtwinkligen Dreieck anwenden` | `J9` |
| `Sinus- und Kosinussatz nutzen` | `J9` |
| `Scheitelpunkte quadratischer Funktionen bestimmen` | `GLOBAL` |
| `Quadratische Funktionen beschreiben` | `GLOBAL` |
| `Exponentielles Wachstum modellieren und Logarithmen nutzen` | `J10` |
| `Baumdiagramme und Pfadregeln für zusammengesetzte Experimente nutzen` | `J10` |
| `Stochastische Simulationen und Monte-Carlo-Verfahren deuten` | `J10` |
| `Sinus- und Kosinusfunktionen beschreiben` | `J10` |
| `Ganzrationale Funktionen beschreiben` | `J10` |
| `Raumgeometrische Probleme mit Körpern lösen` | `J10` |

Interpretation:

- the canonical DE math baseline now has **realized year anchors across the full `J5-J10` grid** and a much broader first-pass atomic Sek-I overlap,
- the existing function corridor is now explicitly attached under `J7-J9`,
- first arithmetic, algebra, geometry, measurement, data, stochastics, power, and trigonometric bridge atoms now complement that corridor,
- several previously coarse Bavaria row-bridges are now split into reviewed subrow slices, now including `M8 3`, `M8 4`, `M9 3`, `M9 7`, and `M10 2`,
- broad Bavaria-wide runtime replacement would still be premature until finer subrow refinement and second-source overlap are added.

## Implemented Sek-I to Q-phase bridge package

The next leverage point is no longer more Sek-I breadth alone, but explicit bridge edges from late Sek-I atoms into the first upper-secondary anchor clusters.

Implemented bridge package:

- `Q1 Analysis – Integralrechnung und Differenzialgleichungen`
  receives explicit lower-secondary bridge requirements from `Ganzrationale Funktionen beschreiben`, `Quadratische Funktionen beschreiben`, `Scheitelpunkte quadratischer Funktionen bestimmen`, `Quadratische Gleichungen loesen`, `Exponentielles Wachstum modellieren und Logarithmen nutzen`, `Sinus- und Kosinusfunktionen beschreiben`, and `Potenz- und Wurzelfunktionen graphisch untersuchen`.
- `Q2 Analytische Geometrie, Lineare Algebra und Vertiefung der Analysis`
  receives explicit bridge requirements from `Lineare Gleichungssysteme lösen und deuten`, `Geradengleichungen, Nullstellen und Schnittpunkte bestimmen`, `Satz des Pythagoras anwenden`, `Trigonometrie am rechtwinkligen Dreieck anwenden`, `Sinus- und Kosinussatz nutzen`, `Ähnlichkeit und Strahlensatz anwenden`, and `Raumgeometrische Probleme mit Körpern lösen`.
- `Q3 Stochastik`
  receives explicit bridge requirements from `Laplace-Experimente auswerten`, `Baumdiagramme und Pfadregeln für zusammengesetzte Experimente nutzen`, `Verknüpfte Ereignisse mit Mengen- und Vierfelderdarstellungen strukturieren`, `Wahrscheinlichkeiten verknüpfter Ereignisse berechnen`, `Kenngrößen von Daten bestimmen und interpretieren`, and `Stochastische Simulationen und Monte-Carlo-Verfahren deuten`.
- `Q4 Vertiefung und Ergänzung`
  receives explicit function-family bridge requirements from `Ganzrationale Funktionen beschreiben`, `Exponentielles Wachstum modellieren und Logarithmen nutzen`, and `Sinus- und Kosinusfunktionen beschreiben`.

This is intentionally a first anchor-level package, not yet a full E-phase atomization. It makes the Sek-I to upper-secondary bridge explicitly three-track:

- Analysis
- Analytic geometry / linear algebra
- Stochastics

To make these bridge edges technically valid for the Hessen upper-secondary anchors, the selected late Sek-I source atoms are treated as canonical cross-jurisdiction bridge nodes and explicitly widened to cover `DE-HE` in addition to the existing Bavaria pilot coverage where needed.

## Proposed year-anchor probe

The first Bavaria mathematics probe should introduce the following canonical planning anchors:

| Canonical year anchor | Bavaria source scope to attach first | Purpose |
| --- | --- | --- |
| `J5` | `M5` | arithmetic, whole numbers, basic geometry, units |
| `J6` | `M6` | rational numbers, area/volume, percent/data basics |
| `J7` | `M7` | variables, term manipulation, equations, percent deepening, geometry |
| `J8` | `M8` | function concept, linear functions, rational basics, probability, systems |
| `J9` | `M9` | roots, quadratics, probability, similarity, powers, Pythagoras, trigonometry |
| `J10` | `M10` | exponential growth, composed experiments, trig functions, polynomial basics, space geometry |

Important:

- these anchors are planning and authoring targets first,
- they do not yet imply that all Bavaria source goals should be runtime-mapped immediately,
- they define the canonical buckets against which later Hessen/Bavaria/Sek-I convergence can happen.

## Recommended implementation order inside mathematics

1. Keep the realized year anchors `J5-J10` stable while avoiding broad atomic duplication.
2. Keep the partial Bavaria year-cluster mappings `J5-J10` stable as the first structural overlap proof.
3. Treat `M5 1`, `M5 2`, `M5 3`, `M5 4`, `M6 1`, `M6 2`, `M6 3`, `M7 1`, `M7 2`, `M7 3`, `M7 4`, `M7 5`, `M8 3`, `M8 4`, `M8 5`, `M8 6`, `M8 7`, `M9 1`, `M9 3`, `M9 4`, `M9 5`, `M9 6`, `M9 7`, `M10 1`, `M10 2`, `M10 3`, `M10 4`, and `M10 5` as the first non-function anchor rows, not yet as proof of a broad Sek-I replacement.
4. Keep the existing `M8/M9` function pilot mappings as the strongest atomic overlap proof.
5. Extend broad atomic mapping only after the `J5-J10` skeleton gains more than one or two atoms per year bucket.

## Suggested first source rows per anchor

These are the first practical Bavaria source rows to use when building the anchor skeleton.

### `J5`

- `M5 1 Natürliche und ganze Zahlen – Addition und Subtraktion`
- `M5 2 Geometrische Figuren und Lagebeziehungen`
- `M5 3 Natürliche und ganze Zahlen – Multiplikation und Division`
- `M5 4 Größen und ihre Einheiten`

### `J6`

- `M6 1 Rationale Zahlen`
- `M6 2 Flächeninhalt und Volumen`
- `M6 3 Prozentrechnung, Daten und Diagramme`

### `J7`

- `M7 1 Terme mit Variablen`
- `M7 2 Geometrische Figuren: Symmetrie und Winkel`
- `M7 3 Lineare Gleichungen und Vertiefung der Prozentrechnung`
- `M7 4 Kenngrößen von Daten`
- `M7 5 Kongruenz, besondere Dreiecke und Dreieckskonstruktionen`

### `J8`

- `M8 1 Funktion und Term`
- `M8 2 Lineare Funktionen`
- `M8 3 Elementare gebrochen-rationale Funktionen`
- `M8 4 Bruchterme und Bruchgleichungen`
- `M8 5 Laplace-Experimente`
- `M8 6 Lineare Gleichungssysteme`
- `M8 7 Kreis und Zylinder`

### `J9`

- `M9 1 Quadratwurzeln`
- `M9 2 Quadratische Funktionen`
- `M9 3 Wahrscheinlichkeit verknüpfter Ereignisse`
- `M9 4 Ähnlichkeit und Strahlensatz`
- `M9 5 Potenzfunktionen mit natürlichen Exponenten und Erweiterung des Potenzbegriffs`
- `M9 6 Satz des Pythagoras`
- `M9 7 Trigonometrie`

### `J10`

- `M10 1 Exponentielles Wachstum und Logarithmus`
- `M10 2 Zusammengesetzte Zufallsexperimente und stochastische Simulationen`
- `M10 3 Sinus- und Kosinusfunktion`
- `M10 4 Ganzrationale Funktionen`
- `M10 5 Fortführung der Raumgeometrie`

## Migration-status implication

As of `2026-03-16`, this probe is strong enough to justify the Bavaria pilot staying on the close-out path, but not strong enough to move the Bavaria tree beyond `partial` canonical-replacement breadth in `docs/dev/canonical-gymnasium-migration-status.md`.

Reason:

- the Bavaria math landscape now has `64` mappings on a real `J5-J10` spine
- the Bavaria physics pilot adds only `23` further mappings under the same legacy tree
- the live legacy Bavaria Gymnasium tree still contains `45` subject JSON files
- `19` Bavaria Gymnasium mapping files currently exist under `curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/`

Operational reading:

- this probe helps sustain the remaining close-out program while the overall headline now sits at `96.7%`
- it does not yet justify a higher Bavaria tree delete-gate score than `90.0%`
- the next honest percentage increase now requires broader Bavaria canonical replacement breadth beyond the current Math/Physics/Chemistry/Biology/Informatik/Geschichte/Deutsch/Englisch/Französisch/Spanisch/Italienisch/Russisch/Polnisch/Tschechisch/Griechisch/Wirtschaft_und_Recht/Politik_und_Gesellschaft/Latein/Musik/Chinesisch corridor

## Practical consequence

For Bavaria mathematics, the next concrete implementation task should be:

- start first Hessen-Sek-I row mappings onto the widened canonical `J5-J10` spine,
- while keeping remaining coarse Bavaria bridge rows under review for later subrow refinement where a second source or runtime need justifies it.

and not:

- treat the current `J5-J10` anchor completion as proof that the canonical lower-secondary math layer is already broad enough for full runtime migration.

The existing pilot should now be treated as:

- proof of year-level reach across `J5-J10`,
- proof of strong local overlap in the `M8/M9` function corridor,
- and proof of first reviewed non-function entry points at `M5 1`, `M5 2`, `M5 3`, `M5 4`, `M6 1`, `M6 2`, `M6 3`, `M7 1`, `M7 2`, `M7 3`, `M7 4`, `M7 5`, `M8 3`, `M8 4`, `M8 5`, `M8 6`, `M8 7`, `M9 1`, `M9 3`, `M9 4`, `M9 5`, `M9 6`, `M9 7`, `M10 1`, `M10 2`, `M10 3`, `M10 4`, and `M10 5`.
