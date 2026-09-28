# Q2-Aufgabenentwurf: Kurs- und Ländersichten (nichtkanonischer Audit)

Stand 27.09.2026. Reproduzierbar mit
`app/node_modules/.bin/tsx app/scripts/auditQ2GeometryAssessmentCandidateProjection.ts`
vom Repository-Root. Der Audit verbindet **alle** `requires` und
`coveredGoalIds` jeder der zwölf Kandidatenaufgaben mit den Sek-II-Sichten
der heutigen nationalen Mathematik-Lernzielbuchseiten. Buch-Digest dieser
Messung: `sha256:2e938a76c96e5581b2339b0bd6e41998dd61230e94b87ee1f248f0329092374c`.
Ein gemeinsamer Scope ist nur eine **notwendige**, keine hinreichende
Bedingung für eine faire oder fachlich vollständige Prüfungszuordnung.

| Entwurf (`candidateId`) | Behauptete Sichten | Gemeinsame Sichten aller Ziele | Befund |
| --- | ---: | ---: | --- |
| `q2-volume-five-solids` | 32 | 31 | HE-LK fehlt; dort ist nur das Spatprodukt-Ziel, nicht aber die anderen vier Ziele sichtbar. |
| `q2-volume-derivation-transform-lk` | 16 | 1 | Nur BY-LK ist gemeinsam; die übrigen 15 LK-Sichten tragen nicht beide Ziele. |
| `q2-coordinates-vectors-metric` | 32 | 7 | Nur BW-GK/LK, BY-LK, HE-GK/LK und SH-GK/LK sind gemeinsam; das Skalarprodukt-Definitionsziel ist besonders eng sichtbar. Ein Bild-Stimulus-Claim bleibt offen. |
| `q2-vector-combination-dependence` | 32 | 32 | Kein Scope-Widerspruch dieser Art. |
| `q2-lines-planes-intersections` | 32 | 1 | Nur BW-LK gemeinsam; insbesondere das Gerade–Ebene-Schnittziel ist eng sichtbar. |
| `q2-projection-mirror-point-distance` | 32 | 1 | Nur BW-LK gemeinsam; die vier Zielgeltungen weichen stark voneinander ab. |
| `q2-skew-lines-parallel-plane-distance` | 32 | 2 | Nur BW-LK und BY-LK gemeinsam. |
| `q2-cuboid-spatial-representations` | 32 | 32 | Kein Scope-Widerspruch dieser Art; ein Bild-Stimulus-Claim bleibt offen. |
| `q2-body-length-angle-family` | 32 | 32 | Kein Scope-Widerspruch dieser Art. |
| `q2-cuboid-body-properties` | 32 | 32 | Kein Scope-Widerspruch dieser Art. |
| `q2-plane-figures-classification` | 32 | 32 | Kein Scope-Widerspruch dieser Art. |
| `q2-plane-figures-congruence-similarity` | 32 | 32 | Kein Scope-Widerspruch dieser Art. |

**Sechs der zwölf Entwürfe** widersprechen damit bereits der behaupteten
pauschalen `GK_LK`-/`LK`-Geltung im heutigen Lernzielbuch. Die andere Hälfte
ist dadurch weder aufgabenfachlich noch als `coveredGoalIds` oder als
`requires` freigegeben. Die bayerische `LK`-Sicht ist zusätzlich selbst
Gegenstand eines separaten Audits: Sie vermischt im aktuellen Vorschlag
reguläres Mathematikpflichtfach und optionalen Vertiefungskurs. Eine hier
ausgewiesene BY-LK-Geltung ist also **kein** Nachweis einer
veröffentlichbaren Prüfungsprojektion.

Auch innerhalb der sechs Konfliktaufgaben ist die Teilzielmenge nicht
einheitlich: In Tabellenreihenfolge entstehen **2 / 2 / 3 / 4 / 8 / 2**
verschiedene Sichtbarkeitsmengen. Bei `q2-lines-planes-intersections`
und `q2-projection-mirror-point-distance` ist in BY-GK **keines** der
jeweils behaupteten Ziele sichtbar; bei
`q2-skew-lines-parallel-plane-distance` trifft dies auf **30 von 32**
deklarierten Sichten zu. Das Script gibt diese leeren Sichten und die
verschiedenen Zielmengen ausdrücklich aus. Bloße Kursmarker können
eine Prüfung mit diesen Teilzielkombinationen nicht rechtfertigen.

Nicht einfach die sechs Aufgaben auf die Schnittmenge einschränken: Dann
fehlten für andere Länder/Kurse weiterhin lokale terminale Wege. Der
nächste Entwurf muss je realem Scope unterscheiden, welche benoteten
Teilaufgaben, direkten Prüfungsziele und fairen Voraussetzungen gelten;
gegebenenfalls braucht er mehrere schmalere Aufgaben mit jeweils eigener
Quellen- und Bewertungsprüfung. Vor einer kanonischen Änderung sind auch
die zwei ausstehenden visuellen Stimuli und die 39 fachlichen
Abdeckungsclaims unabhängig zu prüfen. Dieser Audit ändert weder Graph
noch Atlas, D-Index, CQR oder den strengen M7-Zähler.
