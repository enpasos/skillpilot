# J10 Funktion–Ableitung: nichtkanonischer Split-Kandidat

Stand: 27. September 2026. Gegenstand ist das heutige atomare Ziel
`1a18dbb3-f350-4766-9c8b-20ca018ccef1` („Monotonie, Extremstellen und
Funktion-Ableitungs-Beziehungen untersuchen“). Dieser Entwurf verändert weder
den kanonischen Graphen noch Mapping-, Assessment-, Mastery- oder QA-Daten. Er
ist eine prüfbare fachliche Empfehlung, keine D-Synthese, Freigabe oder
M7-Resolution. Insbesondere stehen die zwei aktuellen unabhängigen D-Runden
auf `split_review` und `keep`; `dual-summary.json` verlangt eine Synthese.

## Entscheidungsvorschlag und exakter Zieltext

Das bestehende Ziel bündelt zwei Leistungen, die sich getrennt nachweisen
lassen: den wechselseitigen Schluss zwischen Funktions- und Ableitungsgraph
und die Untersuchung einer Funktion mit der ersten Ableitung. Ein minimaler
Split in zwei neue atomare Ziele erhält den gesamten ausdrücklich formulierten
Umfang. Die folgenden Arbeitsschlüssel **sind keine IDs**; bei Integration
brauchen die Kinder neue stabile IDs.

### Kind G: Graphbeziehung

- Arbeitsschlüssel: `canonical_math_sek1_j10_function_derivative_graph_relation`
- Titel DE: **Funktions- und Ableitungsgraphen in Beziehung setzen**
- Titel EN: **Relate function and derivative graphs**
- Beschreibung DE: **Die lernende Person kann bei einfachen Funktionen vom Graphen der Funktion auf den Graphen ihrer Ableitungsfunktion und umgekehrt qualitativ schließen und die Zuordnung anhand von Steigungen, Vorzeichen und Nullstellen der Ableitung begründen.**
- Beschreibung EN: **The learner can qualitatively infer the derivative graph from the graph of a simple function and vice versa, and justify the correspondence using slopes, signs, and zeros of the derivative.**
- Eigenständiger Nachweis: Zu einem neuen, maßstäblich beschrifteten Paar von
  Graphen in *beiden* Richtungen passende Abschnitte und Stellen identifizieren
  und begründen. Die bildliche Erklärung darf nicht als Beleg für einen
  vollständigen Extremwertvergleich gelten.

### Kind A: Untersuchung mit der ersten Ableitung

- Arbeitsschlüssel: `canonical_math_sek1_j10_first_derivative_monotonicity_extrema`
- Titel DE: **Monotonie und Extrema mit der ersten Ableitung untersuchen**
- Titel EN: **Investigate monotonicity and extrema using the first derivative**
- Beschreibung DE: **Die lernende Person kann bei einer einfachen differenzierbaren Funktion auf einem angegebenen Bereich mit dem Vorzeichen der ersten Ableitung Monotonieintervalle und lokale Extremstellen begründen und durch Vergleich relevanter Funktionswerte entscheiden, ob und wo globale Extremwerte vorliegen.**
- Beschreibung EN: **The learner can use the sign of the first derivative to justify intervals of monotonicity and local extrema of a simple differentiable function on a specified domain, and compare the relevant function values to decide whether and where global extrema occur.**
- Eigenständiger Nachweis: Vorzeichenintervalle und den Wechsel an inneren
  Kandidaten prüfen; `f′(x)=0` allein nicht als Extremumsbeweis akzeptieren.
  Für globale Aussagen den angegebenen Bereich, innere Kandidaten und
  vorhandene Randwerte beziehungsweise das Randverhalten berücksichtigen.
  Lokale und globale Maxima/Minima müssen unterscheidbar erläutert werden.

Die Vorschläge bleiben bei „einfachen“ Fällen und der **ersten** Ableitung.
Höhere Ableitungen, Krümmung, Wendepunkte und eine allgemeine vollständige
Kurvendiskussion gehören nicht in diese Kinder. Die zweite Beschreibung
fasst die eine zusammenhängende Ableitungsuntersuchung zusammen; falls ein
fachlicher Review auch Monotonie/lokale Extrema und globale Vergleiche als
unabhängige Leistungen bewertet, muss **vor** Integration ein drittes Kind
entworfen und erneut geprüft werden.

## Amtliche BW-Quelle und vorgeschlagene Zuordnung

Die lokale Extraktion bezieht sich auf den amtlichen [Bildungsplan 2016
Gymnasium Mathematik, Abschnitt 3.3.4](https://www.bildungsplaene-bw.de/BP2016BW_ALLG_GYM_M_IK_9-10_04),
Druckseite 35 der PDF. Die [amtliche Fassung von 2024
(V2)](https://www.bildungsplaene-bw.de/BP2016BW_ALLG_GYM_M.V2_IK_9-10_04)
führt die hier maßgeblichen Inhalte weiterhin, aber unter anderen Nummern.
Die im Repository gespeicherte PDF liegt unter
`curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_M.pdf`; die zugehörigen
Source-Goal-IDs und Passagen liegen in
`input/BW/lower-secondary/source-extraction/DE_BW_MATHEMATIK_SEKI_BP2016.source-extraction.json`.
Die PDF wurde für die hier genannten Kompetenzen direkt geprüft. Die heutige
reviewte Zuordnung in
`mapping/DE-BW/lower-secondary/bw_math_lower_secondary_source_extraction_to_canonical_math.review.json`
bindet alle vier nur `partial` an das alte Ziel.

| BW 3.3.4, Extraktion → V2 | Inhalt der amtlichen Anforderung | Split-Zuordnung zur Prüfung |
| --- | --- | --- |
| 11 → 13, `…-11-e04bdab0` | Definition der Monotonie angeben | Kind A verwendet Monotonie, fordert die Definition aber nicht ausdrücklich als eigene Leistung; `partial` beziehungsweise gesonderte Grundlagenlücke belassen. |
| 12 → 14, `…-12-33674496` | Unterschied lokaler/globaler Maxima bzw. Minima erklären | Kind A verlangt diese Unterscheidung in der Evidenz; wegen des eigenständigen Definitions-/Erkläranspruchs zunächst `partial`, bis die konkrete Aufgabe ihn wirklich prüft. |
| 22 → 24, `…-22-d585aedc` | Funktionseigenschaften mithilfe von Ableitungsfunktionen untersuchen | Kind A deckt den Teil mit erster Ableitung, Monotonie und Extrempunkten ab. `partial`: die Quelle enthält auch höhere Ableitungen, Krümmung und Wendepunkte, die bereits andere kanonische Ziele betreffen. |
| 23 → 25, `…-23-fb7c5a3e` | Zwischen Funktions- und Ableitungsgraph in beide Richtungen schließen | Kind G ist die direkte fachliche Route. Wegen der Begrenzung auf qualitative, einfache Fälle zunächst `partial`; `exact` erst nach Prüfung von Aufgabenbreite und Quellengeltung. |

Die V2-Nummern sind ein Gegencheck der offiziellen Website, keine bereits
erstellten V2-Source-Goals oder neuen Mapping-Kanten. Die alten Kanten
bleiben historische Evidenz, aber die zugehörige
Source-Mapping-Collection und die ältere BW-Snapshot-Zuordnung `exact` zu
`3eb6b0db-af4b-4072-991f-81c9e7644257` müssen bei einer Integration
fachlich neu entschieden werden. Eine Elternkante oder die rohe
16-Länder-`applicability` des alten Ziels darf nicht automatisch als
Quellennachweis oder Geltungsfreigabe beider Kinder gezählt werden. Die
Source-Verification- und A-Gate-Bindungen sind für jedes neue Kind aktuell zu
prüfen.

## Struktur, Voraussetzungen und Assessment

Bei Annahme bietet sich die alte ID als **Navigationscluster** an, mit
`contains` nur für die zwei neuen Kinder. Das erhält einen verständlichen
Einstieg und eine Stelle für das vorhandene Gesamtbild. Das alte Ziel wäre
dann keine atomare Mastery-Einheit mehr; `semanticAtomic: true` müsste
entfallen und das Clustergewicht bei genau zwei eindeutigen atomaren Kindern
von `1` auf `2` steigen. Den `curricularAtomic`-Nenner neu berechnen. Das
bestehende J10-Cluster `0fd96c54-c629-45aa-a640-e2718890ddf9` enthält
heute die alte ID. Kein Kind soll zusätzlich auf derselben sichtbaren Ebene
eingehängt werden. Die DAG-, Composition-View- und Projektionstests müssen
die einzige sichtbare Elternroute belegen.

Das alte Ziel benötigt heute `7156558c…` (Ableitungsbegriff), `9f2fc0d1…`
(Ableitungsregeln) und `65365dce…` (Orientierung). Als Arbeitsannahme behält
Kind G den Ableitungsbegriff und die weiterhin geltende
Orientierungsvoraussetzung. Kind A behält Ableitungsbegriff,
Ableitungsregeln und Orientierung. Eine neue Kind-G→Kind-A-Kante ist nicht
schon durch die fachliche Nähe begründet: Kind A kann auch mit einem gegebenen
Ableitungsterm untersucht werden. Die genaue `requires`-Wahl muss am
didaktischen Lernpfad und Frontier geprüft werden; Anforderungen des alten
Clusters dürfen nicht unbesehen auf beide Kinder vererbt werden.

Drei Ziele haben die alte ID unmittelbar in `requires`:

| Abhängiges Ziel | Revisionsfrage nach dem Split |
| --- | --- |
| `b43a1e45…` Tangenten/Normalen | Braucht es den Graphschluss, die Ableitungsuntersuchung oder nur Ableitungsbegriff und -regeln? Keine automatische Doppelpflicht. |
| `06bdbecb…` lineare Approximation | Sein vorhandener Tangenten-Vorgänger bleibt zu berücksichtigen; die direkte alte ID muss gesondert begründet oder entfernt werden. |
| `ad66009f…` Krümmung/Wendestellen | Der Übergang zum Vorzeichen der zweiten Ableitung kann Kind A didaktisch nahelegen; globale Extrema sind dafür keine pauschale Voraussetzung. |

Die heutige J10-Prüfungsaufgabe 3 `2f626446…` (14 BE, `reviewStatus:
released` nach simuliertem internem Review) verlangt
in Teil 4 Monotonie, aber weder einen wechselseitigen Graphschluss noch
ausdrücklich lokale **und** globale Extremwerte. Ihr `coveredGoalIds` enthält
die alte ID nicht; ihre `requires` erreicht sie nur über die genannten
Nachfolger. Kein Kind erhält daher allein durch diese Aufgabe eine vollständige
Assessment-Deckung. Für Kind A wäre eine **neue reviewte Version** der
Teilaufgabe zum bereits angegebenen Bereich `[0,5]` möglich: innere lokale
Extrema aus dem Vorzeichenwechsel bestimmen und anschließend `f(0)=2`,
`f(1)=2,4`, `f(3)=2`, `f(5)=4` vergleichen. Daraus folgen auf `[0,5]` das
globale Maximum `4` bei `x=5` und das globale Minimum `2` bei `x=0` und
`x=3`. Randstellen sollten nicht stillschweigend als innere lokale Extrema
bewertet werden. Kind G braucht eine eigene Aufgabe mit frischen
Funktions-/Ableitungsgraphen und Schlüssen in beiden Richtungen. Aufgaben,
Lösungen, Punkte, `coveredGoalIds`, `requires` und Assessment-Review müssten
gemeinsam aktualisiert werden; die bisherige Fassung bleibt als
historischer Prüfungsstand erhalten.

## Bestehende Mastery und D/P/A/M/V-Evidenz

Ein gespeicherter Mastery-Wert für `1a18dbb3…` darf nicht pauschal auf beide
Kinder kopiert werden: Das alte Sammelziel hat keine getrennten
Leistungsnachweise. Den alten Wert als historischen Zustand erhalten; neue
Kind-Werte nur aus tatsächlich zuordenbarer individueller Leistung oder
erneuter Prüfung setzen. Insbesondere müssen ein laufendes aktives Atom,
Fokuswurzeln, bestätigte Pläne und Voraussetzungen gegen die neue
`target`-Projektion revalidiert werden. Beim Clusterumbau außerdem prüfen,
dass ein gespeicherter alter Wert weder Kind-Mastery noch die Frontiers der
Nachfolger implizit erfüllt. Der sichtbare Clusterfortschritt soll aus den
Kindern aggregiert werden, ohne das alte `weight: 1` als zusätzliches Atom zu
zählen.

- **D:** Die aktuellen zwei Runden prüfen ausschließlich den alten
  Ziel-/Seitenfingerprint `sha256:9299fdfa…` und widersprechen sich. Nach
  fachlicher Split-Entscheidung brauchen beide neuen Texte neue unabhängige
  Runden, gebundene Seiten und eine ausdrückliche Synthese. Die alte
  `atomic`-Ledgerentscheidung vom 5. Mai gilt nicht als Review der Kinder.
- **P:** Das vorhandene P-v2-Profil für die alte ID ist `ai_candidate` /
  `needs_human_review`. Es kombiniert Ableitungsvorzeichen, lokale Extrema
  und Definitionsbereich in zwei Fällen. Kind G benötigt eigene unabhängige
  Graph-Transfers in beiden Richtungen; Kind A eigene Vorzeichen-/Extrema-
  und Randwertfälle einschließlich einer stationären Stelle ohne
  Vorzeichenwechsel. Bestehende Profilfingerprints nicht umetikettieren.
- **A/M:** Quellrouten, Bundeslandgeltung, semantische Atomarität und
  Memory-Card-Eignung für beide neuen IDs prüfen; keine automatische
  Übernahme des alten Status oder einer früheren Teilfreigabe.
- **V:** Das vorhandene JPG `e8681107…` zu `f(x)=−x²+4`, `f′(x)=−2x` ist im
  Kern mathematisch konsistent und kann als Gesamtüberblick am alten
  Navigationscluster bleiben. Es zeigt nur einen Parabelfall mit
  zusammenfallendem lokalem/globalem Maximum, keinen beschränkten Bereich
  oder Randwertvergleich. Kleine Formeln und Tabellen sind bei 360 px
  Kartenbreite schwer lesbar. Sein alter Ziel-Link, Alttext und
  `assetSha256`-gebundenes AI-QA (`humanApproved: no`) sind keine V-Freigabe
  für neue Kinder. Kindbilder sind nur bedingt geplant: S11/S12 in
  `tmp/math-m7-image-prompts-2026-09-27/PLANNED_SPLIT_PROMPTS.md`.
  Ein Bild am Cluster wäre im bestehenden Coachvertrag kein Bild des aktiven
  atomaren Kindziels. Gegebenenfalls tatsächliche Bilder erzeugen, fachlich
  bei Kartenbreite prüfen, neue ID-Pfade/Alttexte/Hashes binden und eigene V-Entscheidungen
  dokumentieren. Der Clusterüberblick ersetzt auch keine kindbezogene
  Visualisierung oder Lernleistung.

Eine Integration hätte neue Ziel-/Seiten-/Review-Input-Fingerprints und
aktualisierte kanonische Graph-, Mapping-, Assessment-, P-, A-, M-, V-,
Composition-View- sowie Statusmaterialisierungen zur Folge. Erst der
vollständige aktuelle `curricularAtomic`-Nenner und die strenge
D/P/A/M/V-Schnittmenge erlauben eine M7-Aussage.

## Warum ein engeres KEEP nicht genügt

Eine bloße Textverkürzung auf die Graphbeziehung ließe die heute ausdrücklich
versprochenen Monotonie- und lokalen/globalen Extremwertleistungen fallen;
eine Verkürzung auf die Ableitungsuntersuchung entfernte den graphischen
Rückschluss der BW-Kompetenz 23. Ein KEEP mit unverändert breitem Satz und
nur engeren P-Beispielen ließe denselben Mastery-Wert weiterhin für zwei
unabhängig prüfbare Leistungen stehen. Das aktuelle Parabelbild und die
heutige Monotonie-Aufgabe belegen den Bereichs- und Randwertvergleich nicht.
Die fachliche Synthese kann dennoch nach Prüfung des vollständigen
Evidenzvertrags begründet KEEP wählen; sie müsste dann explizit nachweisen,
warum ein einzelner Leistungsnachweis den ganzen aktuellen DE-/EN-Text
einschließlich beider Graph-Richtungen und globaler Extrema trägt.

## Vor einer Annahme zu entscheiden

1. Fachlich bestätigen, dass die zwei vorgeschlagenen Kinder je eine
   eigenständig prüfbare Kompetenz bilden und zusammen nichts vom heutigen
   Anspruch verlieren; andernfalls die genaue dritte Trennlinie benennen.
2. Für jedes Kind einen neuen stabilen ID, konkrete Geltung und
   Source-Mapping-Entscheidungen sowie `requires` festlegen; den alten Wert
   und alte Fokusse ohne unbelegte Mastery-Übertragung migrieren.
3. Die D-Runden, je ein unabhängiges P-Profil, passende Assessment-Aufgaben
   und die Bild-/QA-Bindungen auf dem aktuellen Build prüfen. Erst danach
   Gate- und M7-Status neu berechnen.
