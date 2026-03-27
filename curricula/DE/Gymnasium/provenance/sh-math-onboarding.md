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
- the lower-secondary source snapshot still keeps a source-native official-cell structure, but now refines the `5/6` cell `Zahl und Operation` into the retained source atoms `Natuerliche Zahlen`, `Positive Bruchzahlen`, and `Dezimalzahlen`
- the lower-secondary source snapshot still keeps a source-native official-cell structure, but now refines the `5/6` cell `Strukturen und funktionaler Zusammenhang` into the retained source atoms `Tabellen erstellen und beschriften`, `Informationen aus Tabellen entnehmen`, `Diagramme lesen`, and `Diagramme deuten`
- the lower-secondary source snapshot now also refines the `5/6` cell `Groessen und Messen` into the retained source atoms `Grundgroessen`, `Flaechenberechnung an Rechtecken`, and `Volumenberechnung an Quadern`
- the lower-secondary source snapshot now also refines the `5/6` cell `Raum und Form` into the retained source atoms `Einfache geometrische Figuren`, `Einfache Koerper`, `Symmetrie`, and `Geometrische Konstruktionen`
- the lower-secondary source snapshot now also refines the `5/6` cell `Daten und Zufall` into the retained source atoms `Statistische Erhebungen`, `Kombinatorische Fragestellungen`, and `Einstufige Zufallsexperimente`
- the lower-secondary source snapshot now also refines the `7/8/9` cell `Zahl und Operation` into the retained source atoms `Ganze Zahlen`, `Rationale Zahlen`, `Prozentrechnung`, `Zinsrechnung`, `Quadratwurzeln als Rechenoperation`, `Reelle Zahlen`, and `Potenzen`
- the lower-secondary source snapshot now also refines the `7/8/9` cell `Groessen und Messen` into the retained source atoms `Flaechenberechnung an n-Ecken`, `Kreiszahl pi`, `Kreisumfang und Kreisflaeche`, `Berechnungen an Koerpern`, and `Zentrische Streckungen, Strahlensaetze und Sachaufgaben`
- the lower-secondary source snapshot now also refines the `7/8/9` cell `Raum und Form` into the retained source atoms `Vierecke`, `Dreiecke und Kongruenzsaetze`, `Kreisbeziehungen`, `Satz des Thales`, `Abbildungsgeometrie`, `Flaechensaetze am rechtwinkligen Dreieck`, and `Koerper`
- the lower-secondary source snapshot now also refines the `7/8/9` cell `Daten und Zufall` into the retained source atoms `Haeufigkeit`, `Wahrscheinlichkeit`, `Mehrstufige Zufallsexperimente`, `Spannweite, Quartile und Boxplots`, and `Datenverteilungen vergleichen und deuten`
- the lower-secondary source snapshot now also refines the `7/8/9` cell `Strukturen und funktionaler Zusammenhang` into the retained source atoms `Variablen`, `Terme`, `Funktionen`, `Darstellungsformen`, `Proportionale Funktionen`, `Dreisatz`, `Antiproportionale Funktionen`, `Lineare Gleichungen`, `Lineare Gleichungssysteme`, `Lineare Funktionen`, `Scheitelpunkt, Parabel, Symmetrie und Achsenschnittpunkte`, `Normalform, quadratische Ergaenzung, Scheitelpunktform und faktorisierte Form`, `Parameter und Verschiebungen quadratischer Funktionen`, and `Quadratische Gleichungen`
- the lower-secondary source snapshot now also refines the `10` cell `Groessen und Messen` into the retained source atoms `Trigonometrie im rechtwinkligen Dreieck`, `Sinus und Kosinus am Einheitskreis`, `Sinussatz und Kosinussatz`, `Kreissektoren`, `Bogenmass von Winkeln`, `Pyramiden und Kegel`, `Kugeln`, and `Zusammengesetzte Koerper`
- the lower-secondary source snapshot now also refines the `10` cell `Strukturen und funktionaler Zusammenhang` into the retained source atoms `Graphen und periodische Vorgaenge trigonometrischer Funktionen`, `Einheitskreis und Bogenmass`, `Parameter trigonometrischer Funktionen`, `Graphen und exponentielles Wachstum`, `Funktionalgleichung und Parameter von Exponentialfunktionen`, `Verdoppelungszeit, Halbwertszeit und asymptotisches Verhalten`, `Exponentialgleichungen`, and `Logarithmen`
- the lower-secondary source snapshot now also refines the `10` cell `Raum und Form` into the retained source atom `Aehnlichkeit`
- the upper-secondary source snapshot currently keeps one retained source atom per official phase-and-area cell from the phase table
- the lower-secondary mapping lane now carries `108` mappings:
  - exact source-root bridge to the current canonical math entry target
  - `Jahrgangsband 5/6 -> J5`
  - `Jahrgangsband 7/8/9 -> J7`
  - `Jahrgangsstufe 10 -> J10`
  - coarse reviewed later-Sek-I functions strip:
    `Jahrgangsband 7/8/9: Strukturen und funktionaler Zusammenhang -> Strukturen und funktionale Zusammenhaenge (Sek I)`
    `Jahrgangsstufe 10: Strukturen und funktionaler Zusammenhang -> Trigonometrische und exponentielle Funktionen in J10 (Sek I)`
  - coarse reviewed broad Sek-I surface mappings:
    `Zahl und Operation -> Zahlen, Terme und Algebra (Sek I)`
    `Groessen und Messen -> Groessen, Proportionalitaet und Trigonometrie (Sek I)`
    `Raum und Form -> Geometrie und Raum (Sek I)`
    `Daten und Zufall -> Daten und Zufall (Sek I)`
  - refined `5/6` number split with first number-representation bridges:
    `Jahrgangsband 5/6: Zahl und Operation -> Fruehe Zahlvorstellungen und Zahlendarstellungen (Sek I)`
    `Natuerliche Zahlen -> Stellenwertsystem und Zahlendarstellungen verstehen`
    `Positive Bruchzahlen -> Brueche als Zahlen, Anteile und Quotienten deuten`
    `Dezimalzahlen -> Dezimalzahlen auf der Zahlengeraden, im Stellenwertsystem und als Bruch darstellen`
  - refined `5/6` structures split with first representation bridges:
    `Jahrgangsband 5/6: Strukturen und funktionaler Zusammenhang -> Einfache Zuordnungen, Tabellen und Diagramme (Sek I)`
    `Tabellen -> Tabellen in einfachen Zusammenhaengen nutzen (Sek I)`
    `Tabellen erstellen und beschriften -> Tabellen erstellen und beschriften (Sek I)`
    `Informationen aus Tabellen entnehmen -> Informationen aus Tabellen entnehmen (Sek I)`
    `Diagramme -> Diagramme in einfachen Zusammenhaengen nutzen (Sek I)`
    `Diagramme lesen -> Diagramme lesen (Sek I)`
    `Diagramme deuten -> Diagramme deuten (Sek I)`
  - refined `5/6` measurement split with first measurement/geometry bridges:
    `Jahrgangsband 5/6: Groessen und Messen -> Fruehe Groessen-, Flaechen- und Volumenvorstellungen (Sek I)`
    `Grundgroessen -> Groessen und Einheiten vergleichen und umrechnen`
    `Flaechenberechnung an Rechtecken -> Flaecheninhalte ebener Figuren berechnen`
    `Volumenberechnung an Quadern -> Volumina und Oberflaechen einfacher Koerper berechnen`
  - refined `5/6` geometry split with first early-geometry bridges:
    `Jahrgangsband 5/6: Raum und Form -> Fruehe Geometrie und Raumvorstellungen (Sek I)`
    `Einfache geometrische Figuren und Koerper -> Fruehe Geometrie und Raumvorstellungen (Sek I)`
    `Einfache geometrische Figuren -> Vierecke erkennen, darstellen und Eigenschaften nutzen`
    `Einfache Koerper -> Volumenformel des Quaders mit Einheitswuerfeln plausibilisieren`
    `Symmetrie -> Symmetrie und Winkel begruenden`
    `Geometrische Konstruktionen -> Punkte, Strecken, Geraden und Kreise im Koordinatensystem darstellen`
  - refined `5/6` data/chance split with first statistics/probability bridges:
    `Jahrgangsband 5/6: Daten und Zufall -> Fruehe Daten-, Zufalls- und Zaehlvorstellungen (Sek I)`
    `Statistische Erhebungen -> Absolute und relative Haeufigkeiten bestimmen und darstellen`
    `Einstufige Zufallsexperimente -> Laplace-Experimente auswerten`
    `Kombinatorische Fragestellungen -> Einfache Zaehlprinzipien in Sachsituationen anwenden`
  - refined `7/8/9` number split with first later-Sek-I number bridges:
    `Jahrgangsband 7/8/9: Zahl und Operation -> Spaetere Zahlbereichserweiterungen, Prozentrechnung, Potenzen und Wurzeln (Sek I)`
    `Ganze und rationale Zahlen -> Ganze und rationale Zahlen (Sek I)`
    `Ganze Zahlen -> Positive und negative Zahlen an der Zahlengeraden veranschaulichen`
    `Rationale Zahlen -> Rationale Zahlen an der Zahlengeraden darstellen und ordnen`
    `Prozente und Zinsen -> Prozentrechnung und einfache Zinsrechnung (Sek I)`
    `Prozentrechnung -> Grundaufgaben der Prozentrechnung loesen`
    `Zinsrechnung -> Einfache Zinsrechnung im Prozentkontext anwenden`
    `Quadratwurzeln als Rechenoperation -> Quadratwurzeln definieren, schaetzen und einfache Wurzelterme vereinfachen`
    `Reelle Zahlen -> Irrationalitaet von Wurzelzahlen begruenden und reelle Zahlen einordnen`
    `Potenzen -> Potenzen mit rationalen Basen und negativen Exponenten deuten und berechnen`
  - refined `7/8/9` measurement split with first later-Sek-I measurement / geometry bridges:
    `Jahrgangsband 7/8/9: Groessen und Messen -> Spaetere Flaechen-, Kreis-, Koerper- und Aehnlichkeitsvorstellungen (Sek I)`
    `Flaechenberechnung an n-Ecken -> Flaecheninhalte ebener Figuren berechnen`
    `Einfache Berechnungen am Kreis -> Kreise und Zylinder untersuchen`
    `Kreiszahl pi -> Kreise und Zylinder untersuchen`
    `Kreisumfang und Kreisflaeche -> Kreise und Zylinder untersuchen`
    `Berechnungen an Koerpern -> Volumina und Oberflaechen einfacher Koerper berechnen`
    `Zentrische Streckungen, Strahlensaetze und Sachaufgaben -> Aehnlichkeit und Strahlensatz anwenden`
  - refined `7/8/9` geometry split with first later-Sek-I geometry bridges:
    `Jahrgangsband 7/8/9: Raum und Form -> Spaetere Geometrie-, Kreis- und Koerpervorstellungen (Sek I)`
    `Dreiecke, Vierecke und Kongruenzsaetze -> Vierecke, Dreiecke und Kongruenzsaetze (Sek I)`
    `Vierecke -> Vierecke erkennen, darstellen und Eigenschaften nutzen`
    `Dreiecke und Kongruenzsaetze -> Kongruenz begruenden und Dreieckskonstruktionen ausfuehren`
    `Geometrie am Kreis -> Kreisbeziehungen und Satz des Thales (Sek I)`
    `Kreisbeziehungen -> Kreisbeziehungen am Kreis begruenden und nutzen`
    `Satz des Thales -> Satz des Thales begruenden und anwenden`
    `Abbildungsgeometrie -> Symmetrie und Winkel begruenden`
    `Flaechensaetze am rechtwinkligen Dreieck -> Satz des Pythagoras anwenden`
    `Koerper -> Volumina und Oberflaechen einfacher Koerper berechnen`
  - refined `7/8/9` data/chance split with first later-Sek-I statistics/probability bridges:
    `Jahrgangsband 7/8/9: Daten und Zufall -> Spaetere Daten-, Wahrscheinlichkeits- und Statistikvorstellungen (Sek I)`
    `Haeufigkeit -> Absolute und relative Haeufigkeiten bestimmen und darstellen`
    `Wahrscheinlichkeit -> Laplace-Experimente auswerten`
    `Mehrstufige Zufallsexperimente -> Baumdiagramme und Pfadregeln fuer zusammengesetzte Experimente nutzen`
    `Beschreibende Statistik -> Beschreibende Statistik mit Quartilen, Boxplots und Verteilungen (Sek I)`
    `Spannweite, Quartile und Boxplots -> Spannweite und Quartile bestimmen und Boxplots erstellen`
    `Datenverteilungen vergleichen und deuten -> Datenverteilungen mithilfe von Kenngroessen und Boxplots vergleichen und deuten`
  - refined `7/8/9` structures/functions split with first later-Sek-I algebra/function bridges:
    `Variablen und Terme -> Variablen und Terme (Sek I)`
    `Variablen -> Variablen in Sachsituationen einfuehren und deuten`
    `Terme -> Terme mit Variablen deuten und aequivalent umformen`
    `Funktionen und ihre Darstellungsformen -> Funktionsbegriff und Darstellungswechsel (Sek I)`
    `Funktionen -> Funktionsbegriff und Darstellungen verstehen (Sek I)`
    `Darstellungsformen -> Zwischen Tabelle, Graph und Term wechseln (Sek I)`
    `Proportionale Funktionen und Dreisatz -> Proportionale Zuordnungen und Dreisatz (Sek I)`
    `Proportionale Funktionen -> Proportionale Funktionen als Zuordnungen und Graphen deuten`
    `Dreisatz -> Dreisatz in proportionalen Sachsituationen anwenden`
    `Antiproportionale Funktionen -> Indirekte Proportionalitaet mit Hyperbeln beschreiben`
    `Lineare Gleichungen -> Lineare Gleichungen und Ungleichungen loesen`
    `Lineare Gleichungssysteme -> Lineare Gleichungssysteme loesen und deuten`
    `Lineare Funktionen -> Lineare Funktionen beschreiben`
    `Quadratische Funktionen und Gleichungen -> Quadratische Funktionen in Darstellungen deuten und Gleichungen loesen (Sek I)`
    `Quadratische Funktionen -> Quadratische Funktionen in Graphen, Darstellungen und Parametern deuten (Sek I)`
    `Scheitelpunkt, Parabel, Symmetrie und Achsenschnittpunkte -> Eigenschaften quadratischer Funktionen aus Graphen ablesen`
    `Normalform, quadratische Ergaenzung, Scheitelpunktform und faktorisierte Form -> Darstellungsformen quadratischer Funktionen situationsgerecht nutzen`
    `Parameter und Verschiebungen quadratischer Funktionen -> Parameter quadratischer Funktionen in Scheitelpunktform deuten`
    `Quadratische Gleichungen -> Quadratische Gleichungen loesen`
  - refined `10` structures/functions split with first late-Sek-I trig/exponential/logarithm bridges:
    `Jahrgangsstufe 10: Strukturen und funktionaler Zusammenhang -> Trigonometrische und exponentielle Funktionen in J10 (Sek I)`
    `Trigonometrische Funktionen -> Trigonometrische Funktionen in Periodik, Einheitskreis und Parametern deuten (Sek I)`
    `Graphen und periodische Vorgaenge trigonometrischer Funktionen -> Trigonometrische Graphen und Periodizitaet deuten`
    `Einheitskreis und Bogenmass -> Einheitskreis und Bogenmass fuer trigonometrische Funktionen nutzen`
    `Parameter trigonometrischer Funktionen -> Parameter trigonometrischer Funktionen deuten`
    `Exponentialfunktionen -> Exponentialfunktionen in Wachstum, Parametern und Asymptotik deuten (Sek I)`
    `Graphen und exponentielles Wachstum -> Exponentielles Wachstum in Graphen, Tabellen und Kontexten deuten`
    `Funktionalgleichung und Parameter von Exponentialfunktionen -> Parameter exponentieller Funktionen aus Gleichung und Werten deuten`
    `Verdoppelungszeit, Halbwertszeit und asymptotisches Verhalten -> Verdoppelungszeit, Halbwertszeit und Asymptotik deuten`
    `Exponentialgleichungen -> Exponentialgleichungen mit Logarithmen loesen`
    `Logarithmen -> Logarithmen als Umkehrung exponentieller Zusammenhaenge nutzen`
  - refined `10` measurement split with first late-Sek-I measurement/geometry bridges:
    `Jahrgangsstufe 10: Groessen und Messen -> Trigonometrie, Kreissektoren und Koerpervertiefung (Sek I)`
    `Trigonometrie -> Trigonometrie am Dreieck anwenden`
    `Trigonometrie im rechtwinkligen Dreieck -> Trigonometrie am rechtwinkligen Dreieck anwenden`
    `Sinus und Kosinus am Einheitskreis -> Sinus- und Kosinuswerte am Einheitskreis im Gradmass deuten`
    `Sinussatz und Kosinussatz -> Sinus- und Kosinussatz begruenden und anwenden`
    `Berechnungen an Kreisen und Kreissektoren -> Kreise und Zylinder untersuchen`
    `Kreissektoren -> Kreise und Zylinder untersuchen`
    `Bogenmass von Winkeln -> Kreise und Zylinder untersuchen`
    `Vertiefung der Berechnungen an Koerpern -> Raumgeometrische Probleme mit Koerpern loesen`
    `Pyramiden und Kegel -> Volumen von Prismen, Pyramiden und Kegeln plausibilisieren und berechnen`
    `Kugeln -> Oberflaecheninhalte und Volumina von Kugeln deuten und anwenden`
    `Zusammengesetzte Koerper -> Raumgeometrische Anwendungen mit Koerpern modellieren und loesen`
  - refined `10` geometry split with first late-Sek-I similarity bridge:
    `Jahrgangsstufe 10: Raum und Form -> Aehnlichkeit und Strahlensatz anwenden`
    `Aehnlichkeit -> Aehnlichkeit und Strahlensatz anwenden`
- the upper-secondary mapping lane now carries `13` mappings:
  - exact source-root bridge to the current canonical math entry target
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
- there are now no remaining unmapped source atoms or source clusters in the SH Sek-I lane, the sole-child `Jahrgangsstufe 10: Raum und Form` cell now also bridges directly to the narrow similarity target, the late-Sek-I `Jahrgangsstufe 10: Groessen und Messen` cell now also stays on its own dedicated canonical J10 trigonometry/circle-sector/body corridor, the late-Sek-I `Jahrgangsstufe 10: Strukturen und funktionaler Zusammenhang` cell now also stays on its own dedicated canonical J10 trig/exponential-functions corridor, the `Jahrgangsband 7/8/9: Groessen und Messen` cell now also stays on its own dedicated canonical later-Sek-I measurement/circle/body/similarity corridor, and the mixed early-geometry/body `Einfache geometrische Figuren und Koerper` cell no longer points only to the narrower figure-only branch, but the reviewed corridors still remain intentionally coarse because the current SH source lane, while refined across all official Sek-I cells, still projects many reviewed bridges only at corridor or broad-cluster level

Operational rule from here:

- keep these reserved `sourceLandscapeId` values stable
- keep the archived SH snapshots source-native first, i.e. preserve official year bands and official upper-secondary phase buckets instead of normalizing them inside the source lane
- keep the shared lower-secondary entry-anchor bridge stable on top of the SH year-band snapshot
- keep the shared upper-secondary entry-anchor bridge stable on top of the SH phase snapshot
- keep the widened reviewed SH surface stable and use the now fully refined SH Sek-I lane to widen reviewed canonical coverage beyond the current corridor-level bridges next
- if reviewed work needs narrower source-to-canonical evidence, continue refining the SH source lane beyond the current mostly one-cell-per-table-cell granularity before forcing finer canonical claims
