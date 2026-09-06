# B033: Adjudikation der zwei verbleibenden Atomizitätsfragen

**Ergänzung vom 6. September 2026:** Der abschließende Migrationsvergleich unten
ersetzt die ursprüngliche Umsetzungsempfehlung für `09f47964…`. Die dort
vorgeschlagene Verengung bei unveränderter atomarer ID wird nicht zur Umsetzung
empfohlen. Der Vektorsplit und die erhobenen Originalquellen bleiben unverändert.

Stand: 5. September 2026. Autor: OpenAI Codex, AI-Adjudikation vorhandener
Reviewbefunde. Dies ist eine konkrete Umsetzungsempfehlung innerhalb der
erteilten fachlichen Verbesserungsfreigabe, keine neue Blindrunde, keine
menschliche Einzelabnahme und kein Nachweis bereits umgesetzter Änderungen.
Kanonische Ziele, Graph, Quellenzuordnungen und Ledgers wurden nicht geändert.

## Entscheidung

| B033-Ziel | Empfehlung | Neue atomare Ziele |
| --- | --- | --- |
| `09f47964-2cd0-410e-93ee-9632b582fc91` | Gezielte begriffliche Revision mit expliziter Abgabe des operativen Darstellungswechsels an vorhandene Ziele. Kein neuer Doppelbestand. | 0 |
| `1bc118c3-1f05-5f2a-b125-418017180d75` | Split in Addition/Subtraktion und Skalarmultiplikation; alte ID als fachlicher Sammelcluster. | 2 |

Die Funktionsrevision ist mehr als das Einfügen von „eindeutig“: Der bisher
zusätzlich beanspruchte operative Darstellungswechsel wird aus diesem
AB1-Begriffsziel herausgenommen und bei den bereits vorhandenen
Darstellungswechselzielen nachgewiesen. Diese Abgrenzung muss in den unten
genannten Source-Mappings mitvollzogen werden. Ein bloßer Austausch des
Beschreibungssatzes bei unveränderten Abdeckungsbehauptungen wäre unvollständig.

## Gelesene Evidenz und ihre Grenzen

Die vollständigen zwei alten Records je Ziel stehen unverändert in:

- `round-a/results/mathematik-rollout-v1-batch-033-atlas-next-unreviewed-disjoint-20-v1-20260905-first-pass-a.batch-001.records.jsonl`
- `round-b/results/mathematik-rollout-v1-batch-033-atlas-next-unreviewed-disjoint-20-v1-20260905-first-pass-b.batch-001.records.jsonl`

Funktionsziel: Runde A `.012` fordert `revise` wegen fehlender Eindeutigkeit;
Runde B `record-012` fordert `split_review` wegen Begriffsbestimmung gegenüber
operativem Darstellungswechsel. Vektorziel: Runde A `.003` bewertet die
Operationen als zusammenhängende Grundstruktur und empfiehlt `keep`; Runde B
`record-003` unterscheidet zwei Operationsfamilien und empfiehlt `split_review`.
Diese Einschätzungen sind AI-Evidenz, keine Originalquellen.

Zusätzlich gelesen: `remaining-work-plan.md`, die B033-Eingabekontexte,
Mathematik-Kriterien v2, aktuelle Ziele und **alle direkten `requires`-Nachfolger
in sämtlichen Dateien unter `curricula/DE/Gymnasium/canonical/`**. Gezählt wurden
16 direkte Nachfolger des Funktionsziels (15 Mathematik, 1 Physik) und 6 des
Vektorziels. Ein `contains`-Elternknoten ist hierbei kein Nachfolger.

Die direkt zugeordneten Original-Source-Goals und zugehörigen Mappingentscheidungen
wurden getrennt gelesen. Die amtlichen lokalen PDFs für HE E.1, BY M8.1, BW
§3.3.1(12)/§3.3.4(2) und BE/BB RLP L4 wurden zusätzlich per Textauszug geprüft.
Bei BW sind mathematische Zeichen im PDF-Textauszug beschädigt; die Formeln im
folgenden Bericht stammen aus der gespeicherten Source-Extraction, nicht aus
einer hier vorgenommenen visuellen Neufreigabe. Legacy-Mappings sind
Kompatibilitätsbeziehungen und werden nicht als zusätzliche Originalquellen
oder als vollständig nachgeprüfte aktuelle Länderprojektion ausgegeben.

## 1. Funktionsbegriff: begrifflich präzisieren, vorhandene operative Ziele nutzen

Der derzeitige Satz verlangt zwei überprüfbare Leistungen: eine Funktion als
Zuordnung beschreiben und zwischen drei Darstellungen wechseln. Das Wort
„eindeutig“ aus Runde A repariert die Definition, löst allein aber den
berechtigten Umfangseinwand aus Runde B nicht. Eine Person kann eine
mehrdeutige Zuordnung erkennen und dennoch keinen Graphen aus einem Term
erzeugen; umgekehrt kann sie eine Tabelle nach Rechenschema erzeugen, ohne das
Eindeutigkeitskriterium zu erklären.

Der aktuelle Graph enthält jedoch bereits:

| Vorhandenes Ziel | Fachlicher Umfang |
| --- | --- |
| `7dea79d2-67f2-4d92-b6cc-ad1b953dca3d` | Funktionen allgemein als eindeutige Zuordnungen charakterisieren; J7, AB1. |
| `f9d284a3-1a47-4aaa-bde2-3dac1c3bb0f0` | Zwischen Tabelle, Graph und Term einfacher Funktionen wechseln und kontrollieren; J8, AB2. |
| `b04d65dc-1214-5323-89a7-317d6b099e1a` | Zwischen Tabelle, Graph und Term wechseln und kontrollieren; E, AB2. |
| `0272c501-2931-5e52-b62f-af068db63c44` | Aus Term oder Funktionsvorschrift einen Graphen erstellen. |
| `89ca5089-7122-5a82-b21f-17d0bd46a3bd` | Digitale Mathematikwerkzeuge für Graphen und Parameter nutzen. |

Ein neues Paar aus allgemeinem Funktionsbegriff und Darstellungswechsel würde
diesen Bestand erneut duplizieren. Empfohlen ist deshalb, die bestehende
`09f47964…`-ID als reellwertiges Begriffsziel mit Deutung seiner Darstellungen
zu präzisieren. Ihre bestehende Überschneidung mit dem allgemeinen J7-Ziel wird
nicht durch einen neuen Knoten vergrößert. Eine umfassende Zusammenführung der
beiden Begriffskorridore ist eine andere Migration und wird hier nicht eröffnet.

Vorgeschlagener Titel DE: **Reellwertige Funktionen und ihre Darstellungen deuten**

Vorgeschlagener Titel EN: **Interpret real-valued functions and their representations**

Beschreibung DE:

> Die lernende Person kann reellwertige Funktionen als Zuordnungen beschreiben,
> die jedem zulässigen Eingabewert genau einen reellen Funktionswert zuweisen,
> und Wertetabelle, Funktionsterm und Graph als Darstellungen derselben
> Zuordnung deuten.

Beschreibung EN:

> The learner can describe real-valued functions as mappings that assign
> exactly one real function value to each admissible input and interpret a
> value table, function expression and graph as representations of the same
> mapping.

Diese Fassung bleibt AB1 und auch für die gebundene BW-Sek-I-Projektion
verständlich. Sie fordert die Bedeutung eines Wertepaares und das Wiederfinden
derselben Zuordnung; die eigenständige Konstruktion fehlender Darstellungen
bleibt bei den operativen Zielen. Eine endliche Wertetabelle bestimmt ohne
weitere Annahmen keinen eindeutigen allgemeinen Funktionsterm. Diese Grenze
gehört in das Evidenzprofil und darf auch bei den operativen Zielen nicht
verloren gehen.

### Direkte Nachfolger einzeln

Für diese Revision können die bestehenden direkten Kanten auf `09f47964…`
erhalten bleiben. Keiner der folgenden Nachfolger benötigt **als allgemeine
Voraussetzung den vollständigen Dreiwegewechsel**. Wo eine eigene
Darstellungsleistung gelehrt wird, ist sie bereits Gegenstand des Nachfolgers
oder eines vorhandenen weiteren Vorgängers. Deshalb wird hier nicht pauschal
das gesamte AB2-Darstellungswechselziel zusätzlich vorgeschaltet.

| Direkter Nachfolger | Benötigter Anteil und konkrete Behandlung |
| --- | --- |
| `c65ecabf-d00b-4e2d-99ae-b64692325ffb` – Funktionswerte berechnen | Eingabe und zugehöriger eindeutiger Wert; `09f47964…` behalten. Berechnen bleibt die eigene Leistung dieses Nachfolgers. |
| `a8c42ee9-2898-4247-819f-c235032ac78a` – Graphablesen | Bedeutung von `(x,f(x))` und Eindeutigkeit in Eingaberichtung; `09f47964…` behalten. Ablesen wird hier gelernt. |
| `d8c9eb57-1614-4c1d-829a-618134def352` – Symmetrie | Term und Graph als dieselbe Funktion deuten; `09f47964…` behalten. Symmetrische Definitionsmenge bleibt Gegenstand der separat geplanten Revision. |
| `502ecaa7-cca6-5c51-a1cc-da09a7b2382c` – Definitionsmenge | Zulässige Eingaben in einer gegebenen Darstellung; `09f47964…` behalten. |
| `741a8120-71ad-5f87-b9d8-be9d778b097b` – Wertemenge | Tatsächlich angenommene Ausgaben auf einer Definitionsmenge; `09f47964…` und bestehendes Definitionsmengenziel behalten. |
| `0b47fec8-33ec-5f29-8d3e-64941a7c8ac5` – Verhalten im Unendlichen | Funktion, Argument und Funktionswert; `09f47964…` behalten. Keine allgemeine Tabellenerzeugung erforderlich. |
| `7ba19509-8ee6-50e0-a411-a371f05b1801` – Graphtransformationen | Bedeutung der gleichen Funktion in Term/Graph; `09f47964…` behalten. `0272c501…` und `99bfb566…` sind bereits direkte Voraussetzungen für die operative Verbindung. |
| `ae20183e-92b5-5521-b8e0-9a8662cf51f5` – Mittlere Änderungsrate | Zuordnung der zwei Eingabe-Ausgabe-Paare; `09f47964…` behalten. `c65ecabf…` und `a8c42ee9…` decken schon Rechnen und Ablesen ab. |
| `89ca5089-7122-5a82-b21f-17d0bd46a3bd` – Digitale Funktionen | Term/Graph-Beziehung deuten; `09f47964…` behalten. Graphenerzeugung mit Software ist seine eigene Leistung. |
| `da95ab35-bac2-54f2-b38f-8b612cde8b54` – Zufallsgrößen/Verteilungen als Modellrahmen | Idee einer eindeutigen Wertzuordnung; `09f47964…` behalten. Ergebnisse müssen keine Zahlen sein; diese Verallgemeinerung wird im stochastischen Nachfolger geleistet. |
| `5927ca6a-91d5-4541-84e9-833bbb2cd7df` – Zufallsgrößen und Verteilungen nutzen | Zuordnung und Wertbedeutung; `09f47964…` behalten. Verteilungstabellen/-diagramme werden hier genutzt, kein allgemeiner Termwechsel vorausgesetzt. |
| `d711bc18-c27c-4739-8289-edac53dc8ba3` – Zufallsgrößen als Zuordnungen | Eindeutiger Zahlenwert pro Ergebnis; `09f47964…` behalten. |
| `f14e1643-ad8d-5235-a832-97987fa18489` – Hypothesen formulieren | Bestehende begriffliche Grundlage beibehalten; kein Anlass, Darstellungswechsel zusätzlich zu verlangen. Die mögliche Redundanz dieser alten Kante ist nicht Teil dieses Edits. |
| `18293a33-a5ff-4a0f-9b6a-085f171cbffe` – Erhebungen planen | Bestehende begriffliche Grundlage beibehalten; kein Anlass für zusätzliche operative Voraussetzungen. |
| `ffbdd7a9-45c6-54f1-988c-58256ca05eeb` – Stochastik-Lernkarten | Begriffsvoraussetzung beibehalten. Memory-Status und Karteninhalte nicht aus der Beschreibungssynthese neu ableiten. |
| `ce431132-dfc4-42c2-aff6-bd72035190f8` – Physik: Bewegungsdiagramme | Messzeit und zugehörige Orts-/Geschwindigkeits-/Beschleunigungswerte deuten; `09f47964…` behalten. Datenerfassung und Diagrammerzeugung gehören zum Physikziel; `a8c42ee9…` ist bereits direkte Voraussetzung. |

### Originalklauseln und konkrete Quellenzuordnung

Die folgenden Dateinamen liegen unter
`curricula/DE/Gymnasium/input/<Land>/.../source-extraction/`; die jeweiligen
Zuordnungsdateien unter `curricula/DE/Gymnasium/mapping/DE-<Land>/.../` tragen
das Suffix `source_extraction_to_canonical_math.review.json`.

| Originalquelle / Source-ID | Originalinhalt | Empfehlung für die Zuordnung |
| --- | --- | --- |
| HE `DE_HE_MATHEMATIK_SEKII_KC2024.source-extraction.json`, `he-math-sekii-e-1-b01-a03-c07883cf` | E.1, S.31: „Wertetabelle“ innerhalb des Erarbeitens grundlegender Begriffe/Eigenschaften. | Beim begrifflich revidierten `09f47964…` halten; Mappingrationale auf Bedeutung der Tabelle korrigieren. Die Quelle verlangt an dieser Stelle nicht wörtlich einen vollständigen Dreiwegewechsel. |
| HE `he-math-sekii-e-1-b01-a05-60bb4e8e` | E.1, S.31: „Funktionsgleichung und Funktionsterm“. | Bei `09f47964…` als begriffliche Darstellungsdeutung halten; operative Quellenabdeckung kann ergänzend `b04d65dc…` tragen, ist aber keine im Original ausdrücklich isolierte Zusatzklausel. |
| BY `DE_BY_MATHEMATIK_GYMNASIUM_LEHRPLANPLUS.source-extraction.json`, `0042dc1e-859b-5c95-95a4-48aeff1bae63` | M8.1: eindeutige Zuordnung; Funktionsterm, Graph, Definitions- und Wertemenge begrifflich abgrenzen. | `09f47964…` trägt Eindeutigkeit und Darstellungsbedeutung; `502ecaa7…`/`741a8120…` tragen die vertiefte Mengenbestimmung. Eine bisherige `exact`-Sammelbehauptung nicht als Beweis lesen, dass ein einziges Ziel jede Klausel umfasst. |
| BY `by-math-m8-1-0042dc1e-s02-d80be61d4d` | Funktionen als solche erkennen. | Begrifflich `09f47964…`; der vorhandene allgemeine Einstieg `7dea79d2…` deckt dieselbe Eindeutigkeitsidee früher ab. Keine neue ID nötig. |
| BY `by-math-m8-1-0042dc1e-s03-5531baecce` | Ein Source-Goal enthält zwei Klauseln: von nicht eindeutigen Zuordnungen unterscheiden; Termgraphen mit geeigneter Software darstellen. | Erste Klausel `09f47964…`; Softwareklausel `89ca5089…`. Gemeinsam abdecken, nicht die ganze Source-ID ausschließlich dem Begriffsziel zuschreiben. Die Softwarepflicht ist Originalinhalt, kein Anlass, alle Ziele softwarepflichtig zu machen. |
| BW `DE_BW_MATHEMATIK_SEKI_BP2016.source-extraction.json`, `bw-math-seki-bp2016-3-3-4-02-4a9f8f47` | §3.3.4(2), S.35: an Quadrat- und Wurzelfunktionsgraphen Funktionsbegriff, Definitions- und Wertemenge erläutern. | Begrifflicher Anteil `09f47964…`; vorhandene Mitzuordnungen `502ecaa7…`, `741a8120…`, `5dabf0b3…` erhalten. Das Original fordert hier keine neue allgemeine Dreiwegewechselkompetenz. |

Für BE und BB lauten die Dateinamen
`DE_BE_MATHEMATIK_SEKI_RLP_2015.source-extraction.json` bzw.
`DE_BB_MATHEMATIK_SEKI_RLP_2015.source-extraction.json`. Der volle Source-ID-Präfix
ist jeweils `be-math-seki-rlp-1-10-2-2-l4-gleichungen-funktionen-` bzw.
`bb-math-seki-rlp-1-10-2-2-l4-gleichungen-funktionen-`. Die nachstehenden Suffixe
bezeichnen damit zwölf konkrete aktuelle Source-Goals. Im Original stehen
Eigenschaften, Darstellungswechsel und Rechnen auf S.32 in getrennten Spalten.

| Suffix (jeweils BE und BB) | Originalklausel | Umgang mit der bisherigen Teilzuordnung auf `09f47964…` |
| --- | --- | --- |
| `e-09-fce4dd59` | Eigenschaften von Zuordnungen, auch indirekt proportionalen, beschreiben. | Begrifflicher Anteil bleibt; vorhandene speziellen Mitzuordnungen `2d055630…`/`2bb4bb91…` bleiben für ihre eigenen Anteile. |
| `e-10-63011a66` | Zwischen Darstellungen solcher Zuordnungen wechseln. | Operativen Anteil von `09f47964…` auf vorhandenes `f9d284a3…` umlegen; bestehende speziellen Mitzuordnungen erhalten. |
| `e-11-541043de` | Zu solchen Zuordnungen Berechnungen durchführen. | `09f47964…` ist nach Revision keine Rechenabdeckung. Bestehende spezifische Berechnungsabdeckung erhalten; für allgemeine Funktionswertberechnung `c65ecabf…` zuordnen, soweit dessen zulässiger Umfang reicht. |
| `f-12-6d069ebd` | Eigenschaften linearer Funktionen beschreiben. | Begrifflicher Teil bleibt; `af3d6bff…`/`e09072f9…` behalten die linearen Anteile. |
| `f-13-7a6911ea` | Zwischen Darstellungen linearer Funktionen wechseln. | Operativen Anteil auf `f9d284a3…` umlegen; vorhandene lineare Mitzuordnungen behalten. |
| `f-14-8c0e1d2e` | Zu linearen Funktionen Berechnungen durchführen. | Keine Rechenabdeckung durch das revidierte Begriffsziel behaupten; spezifische Mitzuordnungen bzw. `c65ecabf…` tragen Berechnungen. |

Die genannten Zuordnungen sind die AI-Empfehlung; nur der wiedergegebene
Klauselinhalt ist Originalevidenz. Das BE/BB-Sek-I-Wechselziel `f9d284a3…` und
seine Sichtbarkeit müssen beim Mapping-Edit mitgeprüft werden; ein Verweis auf
das spätere E-Ziel `b04d65dc…` wäre kein Ersatz für die richtige Sek-I-Projektion.
Legacy-Zuordnungen für HE, BY, NI, BB, BE, SN, HH, BW und NW auf die alte ID
bleiben in der Umsetzungsprüfung identifizierbar; ihre bisherige
`exact`/`partial`-Kennzeichnung darf die neue enger gefasste Abdeckung nicht
überstimmen. Hier wurden keine zusätzlichen Originalklauseln aus Legacy-Texten
abgeleitet.

## 2. Vektoroperationen: minimaler Split in zwei Operationsfamilien

Runde A beschreibt den gemeinsamen linearen Rahmen korrekt. Dieser gemeinsame
Rahmen beweist jedoch keine einzelne atomare Leistung: Verkettung bzw.
Differenz zweier Verschiebungen und Skalierung einer Verschiebung haben andere
Eingaben und geometrische Wirkungen. Die aktuelle Kollinearitätsprüfung kann
gezielt auf Skalierung aufbauen; die Abstandsbildung braucht Differenzen.
Zusammen mit den übrigen Nachfolgern begründet das einen echten Kompetenzschnitt.

Addition und Subtraktion bleiben zusammen: Die Differenz ist die Addition des
Gegenvektors und dieselbe reversible Verschiebungsrechnung. Daraus folgt keine
Notwendigkeit, allgemeine reelle Skalierung schon als Voraussetzung dieser
Operationsfamilie zu beherrschen.

Es werden zwei neue, erst bei Umsetzung deterministisch zu vergebende IDs
vorgesehen. `V_ADD` und `V_SCALE` sind ausschließlich Arbeitsbezeichner dieses
Dokuments, keine erzeugten oder kanonisch registrierten IDs.

**V_ADD – Vektoren komponentenweise addieren und subtrahieren**

EN-Titel: **Add and subtract vectors component-wise**

DE: Die lernende Person kann Vektoren komponentenweise addieren und
subtrahieren und die Ergebnisse als Verkettung von Verschiebungen bzw. als
Addition des Gegenvektors geometrisch deuten.

EN: The learner can add and subtract vectors component-wise and interpret
the results geometrically as composing displacements or adding the opposite
vector.

**V_SCALE – Vektoren mit Skalaren multiplizieren und geometrisch deuten**

EN-Titel: **Multiply vectors by scalars and interpret the result geometrically**

DE: Die lernende Person kann Vektoren komponentenweise mit Skalaren
multiplizieren und die Wirkung des Faktors auf Länge und Richtung geometrisch
deuten.

EN: The learner can multiply vectors by scalars component-wise and interpret
the factor's effect on length and direction geometrically.

Im V_SCALE-Evidenzprofil gehören positive, negative und gebrochene Faktoren
sowie der Faktor null zusammen. Beim Nullvektor wird keine Richtung behauptet.
Für V_ADD werden Gegenvektor, Differenz und Verkettung an frischen
Verschiebungsfällen geprüft. Für keines der Kinder wird selbstständiges Finden
einer Linearkombination als zusätzliches Ziel ergänzt.

Die alte ID `1bc118c3…` bleibt als Cluster mit genau diesen zwei Kindern und
Gewicht 2 erhalten; beide neuen atomaren Gewichte sind 1. Die bisherigen
fachlichen Voraussetzungen `94b48b93…` (Orts-/Verschiebungsvektoren),
`19f170e4…` (Tupel) und der Orientierungsanker `65365dce…` gehen auf beide
Kinder. Keine neue Kante zwischen den beiden Operationskindern; keine
clusterweite Voraussetzung als Ersatz für die gezielte Nachfolgerzuordnung.

Das vorhandene Q2-Ziel `f37b0a72-9e23-51c7-aad5-438c17a56899` kombiniert
Addition/Skalierung ebenfalls. Es ist eine andere fachliche und quellengebundene
Lane und kein bereits vorhandenes passgenaues einzelnes Kind. Dieser
B033-Schritt ändert oder schließt dessen Atomizität nicht.

### Alle sechs direkten Nachfolger

| Direkter Nachfolger | Ersatz der bisherigen Operationsvoraussetzung | Begründung |
| --- | --- | --- |
| `235ae698-369f-4dbe-b46f-87e8b65bb03d` – Geraden/Strecken | `V_ADD` und `V_SCALE` | Richtungsvektor aus Punktdifferenz sowie `a + t·u`; die begrenzte Parameterwahl ist die separate aktuelle Textrevision. |
| `b025df0c-994c-4807-9c5f-2d548905b73f` – Lage/Schnittpunkte | `V_ADD` und `V_SCALE` | Gleichsetzen von `a + t·u` und `b + s·v`, Differenzen und skalierte Richtungsvektoren. Beide sind bereits sachlich benötigte Operationsfamilien. |
| `ba343971-10e5-4b05-b005-405b9c1ce447` – Bewegungsmodell | `V_ADD` und `V_SCALE` | Anfangsort plus zeitabhängige Verschiebung `r₀ + t·v`; die physikalische Zeit-/Einheitenpräzisierung bleibt in seinem eigenen Edit. |
| `d1352ce0-9502-5039-9af6-318fe385b6fd` – Kollinearität | Nur `V_SCALE` | Die Prüfung eines skalaren Vielfachen benötigt keine allgemeine Summe zweier unabhängiger Verschiebungen. Sonderfall Nullvektor nach geltender Zielkonvention behandeln. |
| `a8ff2666-8df3-4253-8021-3efe42114e40` – Betrag/Abstand/Mittelpunkt | Bis zum bereits geplanten Split insgesamt beide; danach metrisches Kind nur `V_ADD`, Mittelpunktkind `V_ADD` und `V_SCALE` | Abstand benutzt die Punktdifferenz; Betrag keine allgemeine Skalierung. Die affine Herleitung des Mittelpunkts nutzt Summe und Halbierung. Diese Voraussetzung stützt die Herleitung, schreibt aber keine bestimmte Lösungsmethode vor. Kanten nach dessen Split auf Kinder legen, nicht auf den Sammelcluster. |
| `853905c5-e82b-592f-a485-1ff84c8bb22e` – J9 Aufgabe 6 | `V_ADD` und `V_SCALE`; ebenso beide in `examData.coveredGoalIds` | Die aktuelle Aufgabe berechnet `AB`, `BC`, `AP` und ausdrücklich `2·AB−AP`; sie prüft beide Familien tatsächlich. Die Aufgabe selbst braucht wegen dieser Aufteilung keinen neuen Inhalt. |

### Vektorquelle: ein Originalbullet, mehrere Teilansprüche

Original: `curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_M.pdf`,
§3.3.1(12), S.31. Gespeicherter Source-Goal:
`bw-math-seki-bp2016-3-3-1-12-9ab98be3` in
`curricula/DE/Gymnasium/input/BW/lower-secondary/source-extraction/DE_BW_MATHEMATIK_SEKI_BP2016.source-extraction.json`.

| Originalklausel | Empfohlene Zuordnung |
| --- | --- |
| Tupel addieren | `V_ADD`; Subtraktion als inverse Operation ist die bestehende kanonische Konkretisierung, kein zusätzliches Wort im Originalbullet. |
| Mit Skalaren multiplizieren | `V_SCALE`. |
| Operationen geometrisch deuten | Jeweils dem betreffenden Kind zuordnen; nicht als drittes isoliertes Ziel. |
| Tupel in einfachen Fällen als Linearkombination anderer Tupel darstellen | Durch diese zwei Kinder allein weiterhin nicht vollständig belegt. Nicht ohne eigenen fachlichen Nachweis als erledigt markieren. |

Die aktuelle Mappingentscheidung in
`curricula/DE/Gymnasium/mapping/DE-BW/lower-secondary/bw_math_lower_secondary_source_extraction_to_canonical_math.review.json`
ist ausdrücklich `partial`, weil Linearkombinationen im bisherigen Ziel nicht
voll sichtbar sind. Nach dem Split beide Kinder den tatsächlich gedeckten
Klauseln zuordnen und diesen Vorbehalt erhalten. Das mathematische Auftreten
eines Terms wie `2·AB−AP` in einer Prüfung belegt noch keine allgemeine Kompetenz,
einen gegebenen Vektor selbstständig als Linearkombination vorgegebener Vektoren
darzustellen. Für dieses Vektorziel wurden in den aktuellen Mappingdateien
keine weiteren direkten Original-Source-Goal-Zuordnungen gefunden.

## Umsetzungsschnitt

Empfohlen ist ein gemeinsamer, begrenzter Authoring-Schritt: Funktionswortlaut
und die betroffenen direkten Source-Klauseln korrigieren; den Vektorsplit mit
den sechs einzeln genannten Nachfolgern und der J9-Coverage durchführen.
Gute Bilder, andere Ziele, Deck-IDs und bestehende fachliche Reviews nicht
pauschal ersetzen. Die aufgeteilten oder textlich veränderten Ziele erhalten
aktuelle Atomizitäts-/Memory-/Bildbindings nach ihrer tatsächlichen Semantik.

Die vorliegende Notiz macht keine neue M6-, Projektions-, Vollquellen- oder
Reviewabschlussbehauptung. Diese bereits im `remaining-work-plan.md` benannten
Gates laufen nach dem gebündelten Edit. Die alten `revise`/`split_review`-Records
werden weder umetikettiert noch auf neue Texte oder Seiten gebunden; die
endgültigen veränderten Ziele benötigen aktuelle unabhängige Reviews.

## Ergänzung 6. September: Funktionsumfang und tatsächliche Migration

Diese Ergänzung korrigiert die anfängliche Empfehlung nach gezielter Prüfung
der Zielidentität, aktueller `requires`-Pfade, des Produktionscompilers für
Composition-Views und der vorhandenen Mastery-/Planbehandlung. Untersucht wurden
nur die alte Funktions-ID und ihre drei konkreten Wiederverwendungskandidaten.
Die Graphvarianten wurden ausschließlich im Speicher erzeugt; kein kanonisches
JSON, keine View und kein Lernstand wurde verändert.

### Vergleich der zwei Wege

| Gesichtspunkt | A: `09f47964…` bleibt Atom, wird auf Begriff/Deutung verengt | B: `09f47964…` bleibt als Aggregat des bisherigen Gesamtumfangs |
| --- | --- | --- |
| Fachlicher Schnitt | Trennt die Leistungen im Text, entfernt aber den bisher unter dieser ID geschuldeten operativen Wechsel. | Macht die bereits erkannten zwei Leistungen getrennt prüfbar; der alte Gesamtanspruch bleibt benennbar. |
| Zielidentität | Die gleiche ID bezeichnet nachher nur noch einen Teil der früheren Kompetenz. Ein Mapping-Edit repariert diese Identitätsänderung nicht. | Die alte ID bezeichnet weiterhin den gemeinsamen Begriff-/Darstellungsumfang; ihre technische Rolle wechselt von Atom zu Cluster und muss ausdrücklich migriert werden. |
| Personal-Curriculum-/Fokusscope | Ein auf `09f47964…` begrenzter Plan kann den Darstellungswechsel verlieren, selbst wenn ein anderes operatives Ziel irgendwo im Gesamtkatalog existiert. | Ein alter breiter Scope kann auf beide tatsächlich zugeordneten Kinder abgebildet werden. Ein bestehender Eintrag in `atomicGoalIds` wird jedoch nicht automatisch umgeschrieben. |
| Mastery | Ein unveränderter numerischer Wert wird still auf einen engeren Gegenstand umgedeutet. | Bestehende Kinder behalten ihre eigenen stabilen Werte. Der frühere Atomwert auf der alten ID wird durch die Clusterberechnung nicht automatisch auf Kinder übertragen. |
| Aufwand | Kleiner Textdiff, aber eine versteckte fachliche und individuelle Migration. | Sichtbare, notwendige Migration von Views, Scope-/Planreferenzen und Abschlussbedeutung. |
| Urteil | Als bloße lokale Beschreibungskorrektur zurückgenommen. | Fachlich vorzuziehen; ein isoliertes `contains`-Edit ist ebenfalls nicht ausreichend. |

Der Einwand aus Runde B wird damit inhaltlich aufrechterhalten. Diese
Entscheidung folgt aus getrennt nachweisbaren Leistungen und bestehenden
Verwendungen; sie wird weder aus dem Wort „und“ noch aus dem Aufwand einer
Migration abgeleitet. Runde A hat die fehlende Eindeutigkeit richtig erkannt;
diese Präzisierung gehört in den begrifflichen Teil, beseitigt allein aber die
zweite Leistung nicht.

### Welche bestehenden Atome passen tatsächlich?

| Kandidat | Passung zum alten Anspruch | Konkrete Grenze |
| --- | --- | --- |
| `7dea79d2-67f2-4d92-b6cc-ad1b953dca3d` | Passender vorhandener Kern für genau einen Ausgabewert pro zulässiger Eingabe. Reellwertige Zahlenzuordnungen sind konkrete Fälle dieses allgemeinen Begriffs. | Der Wortlaut ist allgemeiner als die alte Zahlenmengenfassung. Die alte reellwertige Einbettung muss im Aggregat und in dessen belegten Zahlenbeispielen erhalten bleiben; kein neuer abstrakter Beweisauftrag. |
| `f9d284a3-1a47-4aaa-bde2-3dac1c3bb0f0` | Vorhandener Darstellungswechsel einfacher Funktionen. | Die Beschränkung auf einfache Funktionen ist enger als der unbeschränkte bisherige Text; BY fehlt außerdem in seiner kanonischen Anwendbarkeit. Kein pauschaler Ersatz für alle alten `09f47964…`-Scopes. |
| `b04d65dc-1214-5323-89a7-317d6b099e1a` | Der unmittelbare operative Gegenstand Tabelle/Graph/Term entspricht dem alten Wechselauftrag; keine bloße Erkennung von Darstellungen. | Das Ziel nennt konsistente Übertragung/Kontrolle, ist AB2 und hat eine eigene Voraussetzungskette. Es ist daher kein nachgewiesener gleichwertiger AB1-Mastery-Alias, obwohl der operative Gegenstand passt. Dies darf bei Lernstandsübertragung nicht übersprungen werden. |
| Neues enges Begriffsatom nur für reellwertige Funktionen | Könnte den alten begrifflichen Halbsatz wörtlich abbilden. | Hier wurde kein zusätzlicher eigenständig assessierbarer Begriffsinhalt nachgewiesen, den `7dea79d2…` nicht trägt. Eine neue ID wäre gegenwärtig vor allem ein Weg, die Wiederverwendungs-/Platzierungsmigration zu umgehen; deshalb nicht empfohlen. |

Der kleinste fachlich begründete **Zielzustand** für B ist somit das bestehende
Aggregat `09f47964…` mit genau `7dea79d2…` und `b04d65dc…`, nicht mit beiden
operativen Zielen zugleich. Es entstehen dafür keine neuen Kompetenz-IDs.
Die genannten Unterschiede in Anspruch und bestehenden Lernständen bleiben
Teil der Migration; die beiden Kinder werden nicht als austauschbare Kopien
des alten Atomwerts ausgegeben.

Die frühere pauschale Aussage, das E-Ziel `b04d65dc…` könne die richtige
Sek-I-Projektion nicht tragen, ist zu korrigieren: Der aktuelle Compiler zeigt
es in `de-bw-seki.view.json` bereits unter Klassen 7/8, Funktionaler
Zusammenhang, Darstellungen und Darstellungswechsel. Die wirksame Projektion,
nicht allein `phase: E`, ist maßgeblich. Umgekehrt genügt die J8-Markierung von
`f9d284a3…` nicht zum Nachweis vollständiger Scopegleichheit.

### Zyklen und echte Nachfolger

Eine erneute Traversierung der aktuellen `requires`- und `contains`-Pfade zeigt
von **keinem** der drei Wiederverwendungskandidaten einen Rückweg auf
`09f47964…`. Insbesondere lautet die operative Kette:

`b04d65dc… → 99bfb566… → 0272c501… → 8dd9f210… → 71cec9fb…`.

Der zusätzliche direkte Orientierungsbezug von `0272c501…` ändert daran nichts.
Die Sek-I-Alternative lautet:

`f9d284a3… → e02c58a2… → 2bb4bb91…` plus deren bestehende Grundlagen.

Für `09f47964…`, seine Kandidaten und die direkten Mathematiknachfolger wurde
zusätzlich die geänderte Voraussetzungsauswertung mit vererbten
Clusteranforderungen und zu Atomen expandierten Clusterreferenzen im Speicher
durchlaufen. Weder der Iststand noch das Aggregat mit `requires: []` erzeugt
hier einen Zyklus. Die Wiederverwendung scheitert also **nicht** an einem
belegten `requires`-Zyklus.

Die alten `requires` ungeprüft am Aggregat zu behalten hätte jedoch eine
andere konkrete Wirkung: `7dea79d2…` erbte zusätzlich den Oberstufenanker
`71cec9fb…`; `b04d65dc…` erbte zusätzlich `2bb4bb91…` und den bisherigen
Elternanker. Das folgt aus `LearnerService.computeEffectiveRequires()` und
ist ebenfalls in der Speichervariante sichtbar. Deshalb keine neuen
pauschalen Clusteranforderungen; fachliche Voraussetzungen gehören auf die
jeweiligen Atome.

Die oben vollständig aufgelisteten 16 direkten Nachfolger bleiben die
maßgebliche Menge. Bei Umsetzung von B ersetzt dort `7dea79d2…` die bisherige
breite Begriffsvoraussetzung, soweit in der Tabelle nur Zuordnung und
Darstellungsbedeutung benötigt werden. Die dort ausdrücklich genannten eigenen
Rechen-/Ablese-/Graphvoraussetzungen bleiben erhalten. Keine pauschale Kante
aller 16 Nachfolger auf das neue Aggregat oder auf `b04d65dc…`: Sie würde die
gesamte operative Kette zur Eintrittsbedingung machen. Das ist unabhängig davon,
dass der Darstellungswechsel im ursprünglichen **Zielscope** weiterhin als
geschuldete Kompetenz erhalten bleiben muss.

### Tatsächliche Doppelplatzierungen

Gezielte Aufrufe von `compileCompositionView()` mit unveränderten Viewdateien
und ausschließlich im Speicher geändertem `09f47964…` ergaben:

| Aktuelle View | Iststand der interessierenden IDs | Aggregat mit `7dea79d2…` + `b04d65dc…` |
| --- | --- | --- |
| `mathematik/de-de-gk.view.json` | Jede der drei IDs einmal. | Beide Kinder je zweimal; `CPV-005` und `CPV-006`. |
| `mathematik/de-de-sekii-gk.view.json` | Alte ID und `b04d65dc…` je einmal. | `b04d65dc…` zweimal; `CPV-005` und `CPV-006`. |
| `mathematik/de-he-gk-g9.view.json` | `7dea79d2…` unter J7; alte ID und `b04d65dc…` unter E.1. | Beide Kinder je zweimal, einmal unter ihrem bisherigen Pfad und einmal unter der alten ID. |
| `mathematik/de-he-sekii-gk.view.json` | Alte ID unter E.1; `b04d65dc…` unter „Zwischen Darstellungen wechseln“. | Doppeltes `b04d65dc…`; `CPV-005` und `CPV-006`. |
| `mathematik/de-bw-seki.view.json` | Alte ID, `7dea79d2…`, `f9d284a3…` und `b04d65dc…` jeweils einmal. | `7dea79d2…` und `b04d65dc…` doppelt; zusätzlich `CPV-004` für überlappende Teilbäume. |
| `mathematik/de-by-gk.view.json` | Alte ID und `b04d65dc…` als einzelne `goalEntry`-Einträge unter J11. | Weiterhin keine sichtbaren Kinder unter der alten ID: `goalEntry` bleibt opak. Das Ausbleiben einer Duplikatmeldung ist hier kein Beleg für die vollständige Übernahme des Aggregats. |

Auch `7dea79d2… + f9d284a3…` löst das Problem nicht: HE CrossStage dupliziert
das Begriffsatom, BW SekI beide Kinder. Diese Befunde stammen aus den genannten
Produktionscompiler-Aufrufen; es wurde kein vollständiger Länder-QS-Lauf
ausgeführt.

Damit ist eine reine Änderung des kanonischen Elternknotens ausgeschlossen.
Für jeden betroffenen gelösten Scope muss genau eine sichtbare Platzierung
jedes Kindes verbleiben. Wo die Kinder bereits an fachlich passenden Stellen
liegen, dürfen sie dort bleiben; die alte breite ID kann als kanonisches
Kompatibilitätsaggregat erhalten werden, ohne sie zusätzlich als zweiten
vollständigen Teilbaum zu rendern. Historische Scope-/Fokusreferenzen auf dieses
Aggregat sind dann ausdrücklich auf seine vollständige Kindmenge zu migrieren.
Ein opakes `goalEntry` auf dem Aggregat ist keine Atomizitätslösung und kein
Ersatz für diese Referenzmigration.

### Konkrete Plan-/Masteryfolgen und der Physikbezug

- `app/src/hooks/useMasteryCalculation.ts` liest bei einem Blatt dessen
  UUID-Wert; bei einem Cluster aggregiert es Kindwerte. Beispiel: Alter Wert
  `M[09f47964…]=1`, beide Kindwerte fehlen. Ein bloßes Aggregat-Edit erhält dann
  nicht automatisch die bisher angezeigte Fertigstellung.
- `LearnerService.computeEffectiveMastery()` und
  `computeEffectivePrereqMastery()` leiten Clusterwerte aus Kindwerten ab
  (Minimum; bei Voraussetzungen mit Core-Auswahl). Der alte Atomwert ist kein
  implementierter Transfer auf die Kinder. Ein pauschales Kopieren ist ebenfalls
  nicht gerechtfertigt: alte Mastery `0.5` verrät nicht, welcher Teil beherrscht
  wird; selbst `1` ist kein geprüfter Nachweis der zusätzlichen AB2-Kontrolle
  des bestehenden `b04d65dc…`.
- `LearnerLearningPlanService` speichert ausdrücklich `atomicGoalIds`,
  prüft diese gegen den aktuellen Scope und sucht atomare Frontierziele. Ein
  bisher dort eingetragenes `09f47964…` wird durch eine kanonische
  Typänderung nicht automatisch durch seine Kinder ersetzt. Der alte
  Planinhalt muss beide noch geschuldeten Anteile nachvollziehbar behalten;
  vorhandene Termine und Reihenfolgen dürfen nicht beiläufig verschwinden.
- In 64 aktuellen Physik-Views wird `09f47964…` als externes
  `goalEntry` mit `projectionRole: prerequisiteOnly` referenziert. Der aktuelle
  Backendpfad zur Hydrierung solcher Referenzen verwirft ein externes
  `goalEntry` auf einem Cluster ausdrücklich mit
  `external goalEntry must reference an atomic goal`. Bei B muss dieser
  Datenverweis daher mit dem direkten Physiknachfolger `ce431132…` auf das
  tatsächlich benötigte Begriffsatom umgestellt werden. Die Rolle bleibt
  `prerequisiteOnly`; keine Mathematikkompetenz wird dadurch zum Physik-Target.

Dies sind nachgelesene Verhaltensregeln, keine Prüfung privater Lernstände oder
realer Nutzerpläne. Eine allgemeine fachliche Verbesserungsfreigabe ist kein
Beleg, dass solche individuellen Referenzen bereits migriert oder beliebige
Masterywerte umgeschrieben werden dürfen. Runtime- oder V1-Workflowänderungen
sind für die fachliche Empfehlung weder erforderlich noch hier freigegeben.

### Abschließende Empfehlung und kleinster sicherer Umsetzungsschritt

**A nicht durchführen. B als ausdrücklich dokumentierte Migration vorbereiten,
mit Wiederverwendung von `7dea79d2…` und `b04d65dc…`; keine neue Begriffs-ID und
kein drittes Operations-/Sammelziel.** Die alte ID behält den bisherigen
Gesamtumfang als Aggregat. Die heutigen Kindtexte, ihre unterschiedlichen
Anforderungen und ihre eigenen Lernstände bleiben identifizierbar.

Der kleinste sichere Schritt ist ein zusammenhängendes Migrationspaket für
genau diese Referenzen: kanonische Aggregation und individuelle
Nachfolgerzuordnung; Source-Klauseln zu den tatsächlichen Kindern;
Scope-spezifische Einmalplatzierung einschließlich opaker BY-Einträge;
die 64 externen Physik-Prerequisitereferenzen; eine explizite Regel für alte
Scope-/Planreferenzen und alte Mastery auf `09f47964…`. Dabei muss die
AB1/AB2-Differenz bei `b04d65dc…` fachlich kenntlich bleiben und darf keinen
automatischen Äquivalenztransfer erzeugen. Ohne bestätigte Regel für diesen
individuellen Altbestand ist weder ein engeres Atom noch ein bloßes
Aggregat-Edit als abgeschlossene, deploymentsichere Lösung belegt.

Die allgemeine Verbesserungsfreigabe trägt die Vorbereitung und fachliche
Ausarbeitung dieses begrenzten Pakets. Sie erfordert keine neue Kompetenz nur
zur Vermeidung der Migration. Das Funktionsziel bleibt bis zum tatsächlichen
Abschluss des Pakets offen; eine erneute `keep`-Synthese aus den alten
`revise`/`split_review`-Records wäre weiterhin unzulässig. Der unabhängig
begründete Vektorsplit oben kann in seinem eigenen begrenzten Umfang fortgesetzt
werden.
