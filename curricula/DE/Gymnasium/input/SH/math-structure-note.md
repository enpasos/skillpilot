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
- inside the lower-secondary snapshot, the official `5/6` cell `Zahl und Operation` is now refined into the three retained source atoms `Natuerliche Zahlen`, `Positive Bruchzahlen`, and `Dezimalzahlen`
- inside the lower-secondary snapshot, the official `5/6` cell `Strukturen und funktionaler Zusammenhang` is now refined into the four retained source atoms `Tabellen erstellen und beschriften`, `Informationen aus Tabellen entnehmen`, `Diagramme lesen`, and `Diagramme deuten`
- inside the lower-secondary snapshot, the official `5/6` cell `Groessen und Messen` is now refined into the three retained source atoms `Grundgroessen`, `Flaechenberechnung an Rechtecken`, and `Volumenberechnung an Quadern`
- inside the lower-secondary snapshot, the official `5/6` cell `Raum und Form` is now refined into the four retained source atoms `Einfache geometrische Figuren`, `Einfache Koerper`, `Symmetrie`, and `Geometrische Konstruktionen`
- inside the lower-secondary snapshot, the official `5/6` cell `Daten und Zufall` is now refined into the three retained source atoms `Statistische Erhebungen`, `Kombinatorische Fragestellungen`, and `Einstufige Zufallsexperimente`
- inside the lower-secondary snapshot, the official `7/8/9` cell `Zahl und Operation` is now refined into the seven retained source atoms `Ganze Zahlen`, `Rationale Zahlen`, `Prozentrechnung`, `Zinsrechnung`, `Quadratwurzeln als Rechenoperation`, `Reelle Zahlen`, and `Potenzen`
- inside the lower-secondary snapshot, the official `7/8/9` cell `Groessen und Messen` is now refined into the five retained source atoms `Flaechenberechnung an n-Ecken`, `Kreiszahl pi`, `Kreisumfang und Kreisflaeche`, `Berechnungen an Koerpern`, and `Zentrische Streckungen, Strahlensaetze und Sachaufgaben`
- inside the lower-secondary snapshot, the official `7/8/9` cell `Raum und Form` is now refined into the seven retained source atoms `Vierecke`, `Dreiecke und Kongruenzsaetze`, `Kreisbeziehungen`, `Satz des Thales`, `Abbildungsgeometrie`, `Flaechensaetze am rechtwinkligen Dreieck`, and `Koerper`
- inside the lower-secondary snapshot, the official `7/8/9` cell `Daten und Zufall` is now refined into the five retained source atoms `Haeufigkeit`, `Wahrscheinlichkeit`, `Mehrstufige Zufallsexperimente`, `Spannweite, Quartile und Boxplots`, and `Datenverteilungen vergleichen und deuten`
- inside the lower-secondary snapshot, the official `7/8/9` cell `Strukturen und funktionaler Zusammenhang` is now refined into the fourteen retained source atoms `Variablen`, `Terme`, `Funktionen`, `Darstellungsformen`, `Proportionale Funktionen`, `Dreisatz`, `Antiproportionale Funktionen`, `Lineare Gleichungen`, `Lineare Gleichungssysteme`, `Lineare Funktionen`, `Scheitelpunkt, Parabel, Symmetrie und Achsenschnittpunkte`, `Normalform, quadratische Ergaenzung, Scheitelpunktform und faktorisierte Form`, `Parameter und Verschiebungen quadratischer Funktionen`, and `Quadratische Gleichungen`
- inside the lower-secondary snapshot, the official `10` cell `Groessen und Messen` is now refined into the eight retained source atoms `Trigonometrie im rechtwinkligen Dreieck`, `Sinus und Kosinus am Einheitskreis`, `Sinussatz und Kosinussatz`, `Kreissektoren`, `Bogenmass von Winkeln`, `Pyramiden und Kegel`, `Kugeln`, and `Zusammengesetzte Koerper`
- inside the lower-secondary snapshot, the official `10` cell `Strukturen und funktionaler Zusammenhang` is now refined into the eight retained source atoms `Graphen und periodische Vorgaenge trigonometrischer Funktionen`, `Einheitskreis und Bogenmass`, `Parameter trigonometrischer Funktionen`, `Graphen und exponentielles Wachstum`, `Funktionalgleichung und Parameter von Exponentialfunktionen`, `Verdoppelungszeit, Halbwertszeit und asymptotisches Verhalten`, `Exponentialgleichungen`, and `Logarithmen`
- inside the lower-secondary snapshot, the official `10` cell `Raum und Form` is now refined into the retained source atom `Aehnlichkeit`
- the upper-secondary snapshot currently preserves the source-native SH phase table `Einfuehrungsjahr`, `1. Jahr der Qualifikationsphase`, and `2. Jahr der Qualifikationsphase`

Operational interpretation:

- Schleswig-Holstein now qualifies for `first corridor reviewed` / `P4` on the math rollout tracker
- both SH `sourceLandscapeId` values are now active in the shared provenance registries together with their source-goal membership and closure metadata
- the current SH lane still keeps source-native coarse granularity, but it now carries:
  - structural entry-anchor bridges on top of the official year bands and upper-secondary phases
  - thirteen explicit source refinements inside Sek I: all official `5/6` cells, all official `7/8/9` cells, and all official `10` cells
  - a coarse reviewed later-Sek-I functions strip on `Strukturen und funktionaler Zusammenhang`
  - coarse reviewed broad Sek-I surface mappings on most remaining official lower-secondary cells
  - an exact-resolved explicit upper-secondary E-analysis strip on `Ableitungen elementarer Funktionen`, `Extrempunkte mit Ableitungen untersuchen`, and `Wendepunkte und Kruemmung untersuchen`, plus an exact-resolved adjacent Q1 `e-Funktion` leaf and a source-split Q1 `Integralrechnung` cell whose `Hauptsatz` and `einfache Integrale` leaves now also exact-resolve on shared canonical atoms
  - coarse reviewed broad geometry and stochastics surface mappings on the remaining official upper-secondary cells

Next step:

- use the now fully refined SH Sek-I lane to widen reviewed canonical coverage beyond the current corridor-level bridges and keep the opened SH upper-secondary analysis lane stable at its now exact-resolved explicit source-residue level
- if narrower canonical corridor coverage becomes necessary elsewhere in SH Sek II, continue refining the SH source lane only where a clearer source split exists beyond the current mostly one-cell-per-official-table-cell granularity
- only after that should SH move from coarse cell-level reviewed surface toward materially broader fine-grained reviewed coverage
