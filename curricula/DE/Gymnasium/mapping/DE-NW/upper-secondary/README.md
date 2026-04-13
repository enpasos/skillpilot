# DE-NW Upper-Secondary Mapping Lane

This lane is reserved for future Nordrhein-Westfalen upper-secondary Gymnasium mappings into the shared DE-level canonical landscapes.

Current status on `2026-04-10`:

- repository-backed mapping fixture now exists:
  `nrw_math_upper_secondary_to_canonical_math.json`
- repository-backed Physics mapping scaffold now also exists:
  `nrw_physics_upper_secondary_to_canonical_physics.json`
- reserved `sourceLandscapeId`:
  `d3a068ca-90c6-4d7f-ab6b-4d8b43085cb1`
- reserved Physics `sourceLandscapeId`:
  `8abb46ff-072b-41b7-9d70-0334cb5a1a6c`
- current mapping count: `93`
- current Physics mapping count: `27`
- the first NRW upper-secondary source snapshot now exists and is active in the shared provenance registries:
  `curricula/DE/Gymnasium/input/NW/upper-secondary/source-json/DE_NRW_S_GYM_2_MATHEMATIK.de.json.snapshot`
- the first NRW upper-secondary Physics source snapshot now also exists and is active in the shared provenance registries:
  `curricula/DE/Gymnasium/input/NW/upper-secondary/source-json/DE_NRW_S_GYM_2_PHYSIK.de.json.snapshot`
- the canonical Physics file now also carries the first committed NRW upper-secondary applicability cut on seven shared targets:
  - `Harmonische Schwingung verstehen`
  - `Gravitation und Weltbilder in GK-Aufgaben verknüpfen`
  - `Radioaktive Strahlung und Wirkungen`
  - `Zerfallsgesetze anwenden`
  - `Strahlungsrisiken mit physikalischen Größen beurteilen`
  - `Kernenergieoptionen mit physikalischen Kriterien bewerten`
  - `Kern und Hülle des Atoms qualitativ beschreiben`
- the NRW matter-structure branch now also has a narrower committed follow-on:
  - `Elementare Bestandteile der Materie mit Strukturmodellen ordnen` no longer maps to the broader cluster `Elementarteilchen und Standardmodell`
  - it now maps to the new narrow canonical atom `Elementare Bestandteile der Materie mit Strukturmodellen ordnen`
  - that new atom and the parent cluster `Elementarteilchen und Standardmodell` are now both committed for `DE-NW`
- the NRW GK field-particle branch now also has a committed follow-on:
  - the imported mixed field leaf is now source-split into `Geladene Teilchen in homogenen elektrischen Feldern untersuchen` and `Geladene Teilchen in homogenen magnetischen Feldern untersuchen`
  - both new NRW GK children now map `exact` onto new narrow canonical Q1 atoms with the same titles
  - the shared Q1 path `Bewegung geladener Teilchen im elektrischen Feld`, `Mikroskopische und makroskopische Wirkung magnetischer Felder`, `Magnetisches Feld`, and `Q1 Elektrisches und magnetisches Feld` is now committed for `DE-NW`
- the NRW GK quantum-object branch now also has a committed follow-on:
  - `Photonen und Elektronen als Quantenobjekte beschreiben` now maps `exact` to a new narrow canonical Q4 atom with the same title
  - `Die Bedeutung von Modellen an Photon und Elektron reflektieren` now maps `exact` to a new narrow canonical Q4 atom with the same title
  - the shared canonical Q4 cluster `Quantenobjekte` is now committed for `DE-NW`
- the NRW GK atom-model branch now also has a committed follow-on:
  - `Qualifikationsphase GK: Quantenphysikalisches Atommodell` now maps `partial` to the shared canonical Q3 cluster `Atomvorstellungen`
  - `Energiewerte fuer das Wasserstoffatom mit einem quantenphysikalischen Atommodell beschreiben` now maps `exact` to `Energieniveaus des Wasserstoffatoms`
  - `Linienspektren und Fraunhofer-Linien mit Energieniveaus erklaeren` now maps `exact` to `Emission, Absorption und Linienspektren`
  - `Messergebnisse des Franck-Hertz-Versuchs interpretieren` now maps `exact` to `Franck-Hertz-Versuch`
  - `Orbitale des Wasserstoffatoms als Nachweiswahrscheinlichkeiten interpretieren` now maps `exact` to the new narrow canonical Q3 atom with the same title
  - `Charakteristisches Roentgenspektrum mit Energieniveaus der Atomhuelle erklaeren` now maps `exact` to the new narrow canonical Q3 atom with the same title
  - `Historische Entwicklung der Atommodelle und Modellgrenzen fachlich einordnen` now maps `exact` to the new narrow canonical Q3 atom with the same title
  - the shared Q3 cluster `Atomvorstellungen` and the shared atoms `De-Broglie-Wellen`, `Bohr’sche Postulate und Quantisierung`, `Energieniveaus des Wasserstoffatoms`, `Emission, Absorption und Linienspektren`, and `Franck-Hertz-Versuch` are now committed for `DE-NW`, while the narrower Roentgenspektrum- and Modellgeschichte-surfaces are exact-resolved through dedicated NRW atoms
- the accepted-warning registry now records the corresponding eight NRW-specific Physics `APV-202` findings as reviewed partial-bridge debt
- the accepted-warning registry now also records the corresponding NRW-specific prerequisite `APV-201` on `De-Broglie-Wellen` and `Bohr’sche Postulate und Quantisierung`
- the accepted-warning registry now also records the corresponding new NRW-specific `APV-202` on the narrow matter-structure atom and on the shared Q3 cluster `Atomvorstellungen`
- the NRW Physics lane now also carries the following reviewed narrow corridors:
  - shared source root -> canonical Physics root (`partial`)
  - shared orientation anchor -> shared canonical motivation leaf (`exact`)
  - E-phase entry cluster -> shared E-phase mechanics surface (`partial`)
  - `Periodische Vorgaenge ...` -> `Harmonische Schwingung verstehen` (`partial`)
  - `Kreisbewegung, Gravitation und physikalische Weltbilder ...` -> integrated GK gravitation/worldview task surface (`partial`)
  - NRW GK `Quantenobjekte` cluster -> canonical Q3 `Welle-Teilchen-Dualismus` (`partial`)
  - `Photonen und Elektronen als Quantenobjekte beschreiben` -> new narrow canonical Q4 atom `Photonen und Elektronen als Quantenobjekte beschreiben` (`exact`)
  - `Die Bedeutung von Modellen an Photon und Elektron reflektieren` -> new narrow canonical Q4 atom `Die Bedeutung von Modellen an Photon und Elektron reflektieren` (`exact`)
  - NRW GK `Qualifikationsphase GK: Quantenphysikalisches Atommodell` -> canonical Q3 `Atomvorstellungen` (`partial`)
  - `Energiewerte fuer das Wasserstoffatom mit einem quantenphysikalischen Atommodell beschreiben` -> canonical Q3 `Energieniveaus des Wasserstoffatoms` (`exact`)
  - prerequisite bridges on the shared canonical Q3 atoms `De-Broglie-Wellen` and `Bohr’sche Postulate und Quantisierung` keep the NRW atom-model strip didactically closed even though the source does not isolate separate one-to-one leaves for that narrower prerequisite chain
  - `Linienspektren und Fraunhofer-Linien mit Energieniveaus erklaeren` -> canonical Q3 `Emission, Absorption und Linienspektren` (`exact`)
  - `Messergebnisse des Franck-Hertz-Versuchs interpretieren` -> canonical Q3 `Franck-Hertz-Versuch` (`exact`)
  - `Orbitale des Wasserstoffatoms als Nachweiswahrscheinlichkeiten interpretieren` -> new narrow canonical Q3 atom `Orbitale des Wasserstoffatoms als Nachweiswahrscheinlichkeiten interpretieren` (`exact`)
  - `Charakteristisches Roentgenspektrum mit Energieniveaus der Atomhuelle erklaeren` -> new narrow canonical Q3 atom with the same title (`exact`)
  - `Historische Entwicklung der Atommodelle und Modellgrenzen fachlich einordnen` -> new narrow canonical Q3 atom with the same title (`exact`)
  - the remaining narrower NRW atom-model residue around Spektralanalyse/Modellentwicklung intentionally remains outside the current reviewed strip
  - `Klassische Wellenphaenomene an Licht beschreiben` -> canonical Q3 `Elektromagnetische Wellen` (`partial`)
  - retained NRW GK field parent `Geladene Teilchen in homogenen E- und B-Feldern untersuchen` is now source-split and no longer mapped directly
  - `Geladene Teilchen in homogenen elektrischen Feldern untersuchen` -> new narrow canonical Q1 atom `Geladene Teilchen in homogenen elektrischen Feldern untersuchen` (`exact`)
  - `Geladene Teilchen in homogenen magnetischen Feldern untersuchen` -> new narrow canonical Q1 atom `Geladene Teilchen in homogenen magnetischen Feldern untersuchen` (`exact`)
  - the mixed NRW parent `Klassische Wellen und Teilchen in Feldern` intentionally remains without its own canonical target because the shared DE-level Physics graph splits that source package across reviewed Q3 and Q1 surfaces
  - NRW LK `Quantenphysik sowie Atom- und Kernphysik` -> canonical Q4 `Struktur von Materie, Raum und Zeit` (`partial`)
  - `Quantenphysik als Weiterentwicklung des physikalischen Weltbilds deuten` -> canonical Q4 `Quantenobjekte` (`partial`)
  - retained NRW LK residue cluster `Aufbau der Materie sowie ionisierende Strahlung und Kernprozesse modellieren` -> canonical Q4 `Kernphysik` (`partial`)
  - retained NRW LK radiation cluster `Ionisierende Strahlung und radioaktive Zerfaelle modellieren` is now source-split and no longer mapped directly
  - `Ionisierende Strahlung nachweisen und Wirkungen beschreiben` -> canonical Q4 `Radioaktive Strahlung und Wirkungen` (`partial`)
  - `Radioaktive Zerfaelle und Kernumwandlungen qualitativ beschreiben` -> canonical Q4 `Zerfallsgesetze anwenden` (`partial`)
  - `Elementare Bestandteile der Materie mit Strukturmodellen ordnen` -> new narrow canonical Q4 atom `Elementare Bestandteile der Materie mit Strukturmodellen ordnen` (`partial`)
  - `Kernaufbau in einfachen Modellen beschreiben` -> canonical Sek-I atom `Kern und Hülle des Atoms qualitativ beschreiben` (`partial`)
  - retained NRW LK judgement cluster `Strahlungsrisiken und Kernprozesse fachlich beurteilen` is now source-split and no longer mapped directly
  - `Strahlungsrisiken mit physikalischen Groessen beurteilen` -> canonical Q4 `Strahlungsrisiken mit physikalischen Größen beurteilen` (`partial`)
  - `Kernenergieoptionen mit physikalischen Kriterien bewerten` -> canonical Q4 `Kernenergieoptionen mit physikalischen Kriterien bewerten` (`partial`)
  - retained NRW LK matter cluster `Aufbau der Materie im Kleinen modellieren` is now source-split into `Elementare Bestandteile der Materie mit Strukturmodellen ordnen` and a narrower retained subcluster `Kernaufbau und Bindungen in einfachen Modellen beschreiben`; the first child now reaches the new narrow canonical atom with the same title conservatively, while the broader parent cluster follows only through child-union
  - the retained NRW LK subcluster `Kernaufbau und Bindungen in einfachen Modellen beschreiben` is now widened once more into `Kernaufbau in einfachen Modellen beschreiben` and a narrower retained child cluster `Einfache Bindungen in Materiemodellen beschreiben und Modellgrenzen einordnen`; the first narrower child now reaches the existing canonical structural atom on `Kern und Hülle des Atoms`
  - the retained NRW LK child cluster `Einfache Bindungen in Materiemodellen beschreiben und Modellgrenzen einordnen` is now widened once more into `Einfache Bindungen in Materiemodellen beschreiben` and `Modellgrenzen einfacher Materiemodelle fachlich einordnen`; both narrower children intentionally remain unmapped for now
  - after explicit review, `Einfache Bindungen in Materiemodellen beschreiben` also remains unmapped: the current canonical candidates `Bindungsenergie und Massendefekt`, `Potenzialtopfmodell für Kerne`, and `Fundamentale Wechselwirkungen` all overclaim relative to the narrower NRW source wording

Expected first use:

- canonical Gymnasium `Mathematik`
- NRW upper-secondary anchor alignment onto the canonical `E` / `Q` spine
- first reviewed NRW mathematics corridor mappings on top of the active source snapshot
- the imported NRW upper-secondary lane now also fully splits the adjacent broad GK expectation/distribution atom into three exact child bridges on new canonical random-variable and simple-characteristic-value atoms plus the shared canonical histogram atom, so the earlier NRW partial on `Zufallsgroessen und Verteilungen verstehen` is no longer needed; alongside that, the lane now also fully splits the previously broad GK total-stock/effect residue by adding an exact GK child on a new canonical stock/effect atom and by pulling the matching LK reconstructed-stock atom from a partial bridge onto that same exact canonical surface, it exact-resolves the retained intro power/polynomial parent through a dedicated canonical intro cluster, exact-resolves the retained three-way exponential split through new narrow canonical atoms for `a^x` properties, the special role of `e^x`, and growth/decay usage, it now also exact-resolves the explicit GK leaf `Uebergang von der Produktsumme zum Integral erlaeutern und vollziehen` through a dedicated canonical transition atom, it now also exact-resolves the explicit LK leaf `Hauptsatz mit anschaulichem Stetigkeitsbegriff begruenden und anwenden` through a dedicated canonical LK Hauptsatz atom, it now also exact-resolves the explicit LK leaf `Flaecheninhalte mithilfe uneigentlicher Integrale ermitteln` through a dedicated canonical improper-integral-area atom, it now also exact-resolves the explicit LK leaf `Volumina von Rotationskoerpern um die Abszisse ermitteln` through a dedicated canonical rotation-volume atom, it now also exact-resolves the explicit LK leaf `Annaehernd normalverteilte Zufallsgroessen in Situationen erkennen` through a dedicated canonical approximation-in-situations atom, it now also exact-resolves the explicit LK leaf `Einfluss von mu und sigma auf Normalverteilung und Dichtegraph beschreiben` through a dedicated canonical mu/sigma-normal-distribution atom, and it now also exact-resolves the explicit E-phase line/segment leaf, the adjacent E-phase line-relation leaf, the adjacent explicit LK line-/plane-relation leaf, the adjacent GK scalar-product leaf, the adjacent GK coordinate-form-orientation leaf, the adjacent GK line-plane-intersection leaf, and the adjacent GK intersection-angle leaf through dedicated canonical upper-secondary geometry atoms. It still carries the refined GK Hauptsatz/Stammfunktions split, the exact Baumdiagramm-/Vierfeldertafel children, the explicit `2.4.1 Stochastik` combinatorics prelude on Urnenmodellen mit/ohne Zuruecklegen, Ereignisoperationen, verknuepften Ereignissen, and Binomialkoeffizienten, the adjacent explicit `2.4.2 Funktionen und Analysis` Leistungskurs strip on Hauptsatz, Stammfunktionen, `ln(x)` als Stammfunktion von `1/x`, the first explicit `2.4.2` LK integral-applications strip on reconstructed stocks / total effects, definite-integral area work, the now exact improper-integral-area leaf, and the now exact rotation-volume leaf, the explicit inverse-function / logarithm / inverse-graph clauses, the `2.3` geometry entry corridor, the explicit `2.4.1` geometry Grundkurs strip, the five explicit `2.4.2` geometry Leistungskurs strips, the three explicit `2.4.1 Stochastik` Grundkurs strips, and the two explicit `2.4.2 Stochastik` Leistungskurs strips; the next clean NRW upper-secondary follow-on should therefore move to another equally explicit imported leaf outside the exhausted LK integral strip, such as the retained LK normal-distribution-computation residue around `Diskrete und stetige Zufallsgroessen unterscheiden und Verteilungsfunktion deuten`, rather than reopening broader parent cleanup inside the current pilot subset
- the current NRW LK normal-distribution strip is now exhausted at explicit source-residue level: the imported leaves for normal-distribution concept, approximation-in-situations, and mu/sigma are exact-resolved, so further NRW widening should only come from another equally explicit imported corridor, or else the rollout should move on to the next active broad comparison lane
