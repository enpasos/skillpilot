# Bavaria Mathematics Sek I Probe

Snapshot: `2026-03-14`

This note turns the Bavaria Sek-I normalization rule into a concrete first probe for `Mathematik`.

It complements:

- `docs/dev/canonical-gymnasium-by-sek1-normalization.md`
- `curricula/DE/BY/Gymnasium/mapping/bavaria_math_to_canonical_math_pilot.json`
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

- `16` mapping entries total
- `1` exact motivation mapping
- `6` partial scope-anchor mappings
- `9` exact/partial atomic mappings inside the function corridor

Current Bavaria source areas already covered:

- `Jahrgangsstufe 7`
- `Jahrgangsstufe 8`
- `Jahrgangsstufe 9`
- `M8 1 Funktion und Term`
- `M8 2 Lineare Funktionen`
- `M9 2.1 Quadratische Funktionen und quadratische Gleichungen`
- one shared motivation anchor

This means:

- the Bavaria pilot does **not** yet cover Sek-I mathematics broadly,
- it now proves a first structural overlap at the year-anchor level for `J7-J9`,
- it only confirms that the existing canonical DE lower-secondary math slice can absorb the `M8/M9` function corridor,
- the next useful step is therefore year-anchor normalization, not a premature broad atomic mapping pass.

## Current canonical Sek-I baseline

The current canonical DE math landscape now contains:

- first realized lower-secondary year anchors `J7-J9`
- the existing lower-secondary pilot cluster `Funktionsgrundlagen (Sek I)`

Contained atomic goals:

| Canonical goal | Phase tag |
| --- | --- |
| `Zuordnungen analysieren` | `GLOBAL` |
| `Proportionale Zuordnungen nutzen` | `J7` |
| `Lineare Funktionen beschreiben` | `GLOBAL` |
| `Lineare Funktionen rechnerisch untersuchen` | `GLOBAL` |
| `Quadratische Gleichungen loesen` | `J9` |
| `Scheitelpunkte quadratischer Funktionen bestimmen` | `GLOBAL` |
| `Quadratische Funktionen beschreiben` | `GLOBAL` |

Interpretation:

- the canonical DE math baseline now has the first **realized year anchors** inside the planned `J5-J10` grid, but still only a **corridor-shaped** atomic Sek-I overlap,
- the existing function corridor is now explicitly attached under `J7-J9`,
- broad Bavaria-wide atomic mapping would still be premature until the rest of the Sek-I spine is filled.

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

1. Keep the new realized year anchors `J7-J9` stable while avoiding broad atomic duplication.
2. Keep the new partial Bavaria year-cluster mappings `J7-J9` stable as the first structural overlap proof.
3. Extend the runtime skeleton when the missing year anchors `J5`, `J6`, and `J10` receive first real children.
4. Keep the existing `M8/M9` function pilot mappings as the first atomic overlap proof.
5. Extend broad atomic mapping only after the year-anchor skeleton is stable.

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

## Practical consequence

For Bavaria mathematics, the next concrete implementation task should be:

- extend the realized canonical year-anchor skeleton beyond `J7-J9`, starting with first real child coverage for `J5`, `J6`, and `J10`

and not:

- attempt a broad runtime mapping from all Bavaria math atoms directly into the current, still corridor-shaped Sek-I baseline.

The existing pilot remains useful, but it should now be treated as:

- proof of local overlap in the `M8/M9` function corridor,
- not yet as proof that the canonical lower-secondary math spine is already complete.
