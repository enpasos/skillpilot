# Neuro21 Fortsetzung — erste drei konkrete Modellkandidaten

## Ergebnis und Rolle

Dieses neue inerte **Autorenpaket** enthält drei ganze DE/EN-Zielkandidaten,
sechs vollständige DE/EN-Referenzmaterialien und drei positive Evidenzprofile.
Die unveränderten Produktionshelfer haben die drei Datensätze tatsächlich
materialisiert und geprüft: **3 Kandidaten, 0 Blocker, 3 `needs_human_review`,
`ai_candidate`, E1/G1, keine Reviewrun-IDs**. Das ist technische Vorbereitung;
die unabhängigen fachlichen D/P- und formalen Atomaritätsreviews folgen getrennt.

Die Zahlen und Trainingsbedingungen sind selbst erstellte Referenzfälle. Es
wurden keine Versuche durchgeführt, Forschungsdaten kopiert oder Lernenden-
leistungen beobachtet. Zwei unabhängige Demonstrationen im Profil bedeuten
keine feste Zahl von Aufgaben; geeignete selbstständige Operationen können
innerhalb einer zusammenhängenden Leistung liegen.

## Drei verschiedene Leistungen

| Ziel | Gegebenes Material | Eigenständige Leistung | Konkrete Grenze |
| --- | --- | --- | --- |
| `4f631f78` Hebb | Binäre Aktivitäten, Anfangsgewichte, Lernregel; frische Variante mit zusätzlicher Obergrenze | Gewichte über mehrere Runden bestimmen, gemeinsame Aktivität erklären, Varianten vergleichen | Keine Ausgangsaktivität ohne zusätzliche Regel vorhersagen; keine universelle biologische Hebb-Regel oder reale Erinnerung behaupten |
| `a46cafde` Verbindungsänderung | Anhaltende wirksame Verbindungszustände nach beschriebenem Training, gleiche Testinputs, gegebenes Schwellenmodell | Verarbeitung vor/nach Änderung vergleichen; stärkere Hemmung als Gegenfall erklären | Gewichte sind gegeben, werden nicht aus einer Hebb-Regel erzeugt; kein molekularer Entstehungsmechanismus oder neuer Kontakt aus Gewichten allein |
| `c9a06264` LTP/LTD | Gegebene Zeitreihen, unveränderte Testbedingungen, passende Kontrollwege und absichtlich geänderter Testreiz | Verstärkung/Abschwächung, anhaltenden/vorübergehenden Verlauf und nicht vergleichbaren Test begründet einordnen | Nur beobachtete Dauer, keine menschliche Erinnerung/kein Vergessen, keine bestimmte molekulare Ursache |

Der allgemeine Knoten `347110a1` und sein ganzer früherer positiver Kandidat
bleiben exakt als Vergleich erhalten. Er erklärt funktionelle/strukturelle
zelluläre Plastizität allgemein. Die drei Ergänzungen operationalisieren
Regelanwendung, kontrollierten Netzwerkvergleich und begrenzte Befunddeutung.
Begriffliche Überschneidung ist ausdrücklich dokumentiert; sie wird nicht als
drei amtliche Einzelpflichten ausgegeben. Auch `e111` zur synaptischen
Integration wird durch das plastische Vorher-nachher-Netzmodell nicht ersetzt.

## Tatsächliche Quellen und genaue Änderungen

Die tatsächlich gelesenen Originale binden den LK-Kompetenzkern: HE KC Biologie
2024, Q2.3, physisch/gedruckt **43**, zelluläre Prozesse des Lernens; BY
LehrplanPLUS Biologie 13 auf **erhöhtem Anforderungsniveau**, Lernbereich 2,
Notwendigkeit und funktionelle/strukturelle neuronale Plastizität. Der HE-Raster
und der ganze originale BY-Abschnitt liegen als exakte Lesekopien bei.
Die Bezeichnung `LK` für BY ist eine Repository-Projektion; die amtliche
Überschrift bleibt erhalten. Weder Hebb noch LTP/LTD stehen dort als je eigener
Pflichtpunkt. Der primäre Forschungsartikel von Bi/Poo 1998 dient nur der
fachlichen Gegenprüfung von Modellgrenzen und kontrollierter Befunddeutung,
nicht als Quelle unserer Zahlen oder als Lehrplanpflicht.

Die drei `sourceRef` nennen jetzt die wirklichen Lehrplanbezeichnungen und
die didaktische Modellspezialisierung. Interne Autoren-/Routingbezeichnungen
gehören nicht in dieses Lernendenfeld. Historische Herkunft bleibt im ganzen
`extendedData` erhalten. Beim Ziel `a46cafde` wird nur im inerten Kandidaten
die LK-Eingrenzung aus dem älteren Source-P-v2 wieder aufgenommen. Der
Source8-v2-Kandidat trug noch die historischen GK/LK-Tags; diese sind kein
GK-Quellenbeleg. Keine aktiven Tags oder Anwendbarkeiten werden geschrieben.

Die aktuelle Basis hat SHA
`244d2889ddeeb69cbf97d0a320f3e38cf5444674f3bb17f3e46c0112ac6fbff1`:
**472 ganze Ziele, 390 curriculare Atome**. Genau drei ganze Zielobjekte ändern
sich in der Vergleichskopie; die anderen **469** sind exakt. Alle 472 geordneten
IDs, `requires` und `contains` bleiben exakt. Die Klassifikationen, Status,
Begründungen und Zähler des ganzen Kind-Ledgers sind unverändert; ausschließlich
sein Kandidatenpfad und die drei echten Source-Fingerprints werden technisch
gebunden. Das ist keine neue semantische/Atomaritäts-Freigabe.

## Historie, eigene Fehler und nächste Reviews

Die 51 Payloads des Source8-v2-Freezes, die 10 Payloads des Source-B-v2-Freezes,
die 311 alten Source-P-v2-Payloads und dessen 16 additive RP-Dateien wurden
gegen ihre ursprünglichen Freeze-Bytes tatsächlich geprüft. Alte Ergebnisse
werden weder umetikettiert noch überschrieben. Source-B ist hier ein erlaubter
Quellen-/Rolleninput eines Autors; keine neue unabhängige P-Entscheidung.

Eigene Fehler bleiben sichtbar: die erste Leseabfrage nutzte `goalId`, obwohl
die alten Materialdaten `short` verwenden; ein vermuteter Schutzdateiname
existierte nicht und wurde durch den tatsächlichen Pfad ersetzt; die erste
native Konfiguration enthielt kein Pflichtfeld `scope.label`. Beide tatsächlich
fehlgeschlagenen CLI-Ausgaben sind erhalten. Nur die eigene Konfiguration wurde
korrigiert. Produktionsschemata und -validatoren bleiben unverändert.

Nächste fachliche Reviewer lesen die ganzen Ziele, alle sechs Aufgaben und
Referenzantworten, die drei Profile und ihre Grenzen; sie prüfen insbesondere
die Trennung von `347`, `e111` und untereinander. Native finale D-PDFs/Kampagnen,
die übrigen 18 Neuroziele, A/M und alle fehlenden 21 Bilder sind nicht Inhalt
dieser ersten Stufe. Die gültigen 13 Fortsetzungsleistungen werden anschließend
gegen ihre ganzen aktuellen Bindungen übernommen, statt historisch neu begonnen.

Alle acht ursprünglichen Ganzquellenpflichten, die **189 offenen Länder-Ziel-
Paare**, weitere Augen-/Depressions-/Erkrankungs-/Methodenpflichten und die
NW-Bakterien-plus-Viren-/IF7-Grenzen bleiben separat **HOLD**. Erreichbarkeit
eines 390er Katalogs beweist keinen vollständigen Landes-/GK/LK-Superset-Abschluss.

**Neue strenge Abschlüsse 0; Nettozuwachs 0. Keine aktiven Writes, Git,
globalen Builds, zentralen Läufe, menschliche Freigabe oder Erprobung.**

## Revieweingang

- `first-three-models.raw-author-review-input.json`: enger neutraler Rohweg.
- `three-whole-goal-current-source-v2-and-new-candidate.templates.json`: ganze
  Vorher-/Quellenkandidat-/Nachher-Objekte und Primärkomponenten.
- `six-complete-DEEN-reference-materials.author-candidates.json`: alle sechs
  vollständigen Aufgaben, Referenzantworten, Daten und Grenzen.
- `positive-evidence.three-models.author-candidates.json` sowie native Config
  und tatsächliche JSONL: exakt gebundene positive Kandidaten.
- `three-distinct-model-operations-and-347-preservation.author-rationale.json`:
  unterscheidbare Operationen und Nachbargrenzen.
- `actual-native-fingerprints-and-material-arithmetic.author-probe.json`:
  echte Produktionsfingerprints und eigene Rechenprüfung, keine Fach-QS.

Eigene Erkenntnisinhalte: CC-BY-4.0; eigene Vorbereitungsskripte: Apache-2.0.
Amtliche Originale und der Forschungsartikel behalten ihre jeweiligen Rechte.
