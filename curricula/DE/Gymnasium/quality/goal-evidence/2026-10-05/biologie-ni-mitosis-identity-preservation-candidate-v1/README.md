# NI-Erbgleichheit: eng begrenzter Mitose-Kandidat

Status: **inaktiver Autorenkandidat, 0 strenge Abschlüsse**. Dieser Ordner
enthält keine aktive Curriculum-, Registry-, Quellen- oder Ansichtsänderung.
Eigene Lernziel-, Aufgaben- und Bildprompt-Inhalte: CC-BY-4.0; technische
Prüfskripte: Apache-2.0. Die Rechte der amtlichen Quelle bleiben getrennt.

## Tatsächliche Anforderung und minimale Ergänzung

Der selbst gelesene Text und die tatsächliche Tabelle des erhaltenen amtlichen
NI-PDFs, gedruckte Seite 87, FW 6.1 Individualentwicklung, rechte Spalte
„zusätzlich am Ende von Jg. 10“, verlangen:

> begründen die Erbgleichheit von Körperzellen eines Vielzellers mit der Mitose.

[Amtliche Quelle](https://cuvo.nibis.de/index.php?p=download&upload=18).
Die Einleitung derselben Seite beschränkt Sek I auf cytologische/chromosomale
Betrachtungen und verlegt die molekulare Vertiefung von DNA-Aufbau,
identischer DNA-Replikation, Proteinbiosynthese und Punktmutation in Sek II.
Die konkrete Prüfung und Quellenversion stehen in
[source-inspection.receipt.json](source-inspection.receipt.json).

Der aktuelle Bestand enthält kein vollständig gleichwertiges Ziel. Das
bestehende `1d2b1038-dcd5-529a-b085-9e14f1d58c76` beschreibt Mitose,
vereinfachte Meiose und Keimzellbildung; dieser gültige Inhalt bleibt exakt
erhalten. Ein einziger neuer Atom-Kandidat ergänzt die kausale Begründung:

**36d3bf01-e68b-55be-8e20-5652ada36a51 — Erbgleichheit durch Mitose am
Chromosomenmodell begründen.**

An einem vorgegebenen Chromosomenmodell begründet die lernende Person, dass
jede Tochter eine identische, zuvor vorhandene Kopie jedes ursprünglichen
Chromosoms erhält und damit die vollständige ursprüngliche Erbinformation.
Eine gleiche Stückzahl bei fehlenden Informationstypen genügt nicht. Der
Kandidat setzt weder molekulare Replikationskenntnisse noch vollständige
Meiose voraus. Die einzige direkte Voraussetzung ist das bestehende
Zellvergleichsziel `b1dff57f-329e-5264-b2b9-2db71a0b2172`; seine tatsächliche
Voraussetzungskette wurde geprüft.

## Zusammensetzung und historische Erhaltung

Diese Ergänzung setzt auf den unveränderten operativen und P-Kandidaten von
`../biologie-ni-preservation-candidate-v2/` sowie den gezielt korrigierten
Mapping-Kandidaten von `../biologie-ni-preservation-candidate-v3/` auf.
Die sechs früheren Quellen-Deltas werden unverändert übernommen; die sechs
Mapping-Deltas stammen exakt aus v3. Der neue operative Kandidat enthält nur
den einen neuen Atom und den zugehörigen Eltern-`contains`-Anhang. Zuerst v2
operativ anwenden, dann den hier beschriebenen Anhang. Die früheren drei
P-Profile werden nicht kopiert, verändert oder neu freigegeben.

`FW6-003` ist ein synthetischer Quellenatom aus dem Einleitungstext, der die
molekulare DNA-Replikation fälschlich als Sek-I-Tabellenkompetenz behandelt.
Seine vorgeschlagene Stilllegung erfolgt ausschließlich in neuen
Extraktions-/Mapping-Nachfolgern mit ausdrücklichem
[Retirement-Manifest](source-retirement.manifest.candidate.json). Der gesamte
alte Atom, seine alten Mapping-Zeilen und die alte Entscheidung bleiben dort
als Historie erhalten. **Die tatsächliche Tabellenanforderung wird erfüllt
und erhalten; eine reine Löschung würde die Lücke nicht lösen.**

`FW6-004` erhält den tatsächlichen Quellenwortlaut **Erbgleichheit**, den
korrekten Seiten-/Spaltenbezug und den neuen Begründungsatom als `exact`-
Kandidaten. Die vorhandene Mitosebeschreibung `1d2b1038` bleibt ein
`partial`-Bestandteil. Die DNA-Replikations-, Zellzyklus- und
Mitose/Meiose-Vergleichszeilen belegen diese einzelne Begründungsanforderung
nicht und werden hier entfernt. `ec88fc1d` bleibt in Niedersachsen über die
unabhängig erhaltene Quelle `FW6-008` sichtbar; `1d2b1038` besitzt weitere
erhaltene Quellenbindungen.

Nach **allen acht** begrenzten Quellenentscheidungen enthält der Nachfolger
123 aktive Quellenatome statt 124. Das bedeutet keine neue Prüfung des
gesamten Dokuments. Bei einer späteren Übernahme müssen veraltete
124er-Metadaten im neuen Nachfolger sachlich berichtigt und die begrenzten
neuen Prüfungen kenntlich gemacht werden. Historische Dateien bleiben
unverändert; bisherige Vollständigkeitslabels werden nicht als aktuelle
Freigabe ausgegeben.

Die NI-Quellenansicht wird aus sämtlichen verbleibenden Mapping-Zeilen
berechnet: **136 → 134 Ziele**, fünf bisherige Einträge verlieren ihre letzte
NI-Quellenbindung, drei neue NI-Atome kommen hinzu. Die exakten Einträge und
JSON-Pointer stehen in
[view-source-preservation.delta.candidates.json](view-source-preservation.delta.candidates.json).
Es werden keine bestehenden kanonischen Ziele oder anderen Länderquellen
gelöscht. `e70d8a85` und `05358518` werden erst nach Prüfung aller übrigen
NI-Zeilen aus dieser NI-Quellenansicht genommen. Die Eigenanwendbarkeit und
eine Quellen-Vererbungsgrenze am neuen Atom verhindern, dass eine breite
historische Vorfahrenquelle automatisch neue Länderbelege erzeugt.

## Getrennte Review-Phasen und Artefakte

Zwei unabhängige D-Reviewer lesen zuerst die operative Beschreibung und die
benannten Quellen, ohne P-Profile. Ihre Befunde und eingefrorenen Urteile
müssen vor einer P-Lektüre feststehen. Die Prüfung der Quellen- und
Topology-Erhaltung umfasst die Vorgängerkandidaten v2/v3, nicht nur diesen
einzelnen Atom.

| Phase | Dateien dieses Ordners |
| --- | --- |
| Getrennte eingefrorene Eingaben | `review-phase-freeze.manifest.json` — zehn D-/Quellen-Dateien und zwei getrennte P-Dateien mit aktuellen Digests |
| D / operative Beschreibung | `canonical.delta.candidates.json`, `current-bindings.snapshot.json` |
| D / genaue Quellen, Mapping und Erhaltung | `source-inspection.receipt.json`, `source-extraction.delta.candidates.json`, `mapping.delta.candidates.json`, `source-retirement.manifest.candidate.json`, `view-source-preservation.delta.candidates.json`, `composition-preservation.receipt.json` |
| A / M Vorschlag | `semantic-memory.candidates.json` — ein integrierter Begründungsatom, `no_memory_needed`; keine Kartenänderung |
| P — **erst nach D-Urteilen öffnen** | `positive-evidence.candidates.json`, `assistance-and-claim-boundaries.json` |
| V / noch nicht erzeugter Bildkandidat | `image-prompt.candidate.md` — ausschließlich Prompt, kein PNG und keine Freigabe |
| Statische technische Nachweise | `candidate-check.receipt.json`, `ni-source-view.overlay.candidate.json`, `check-candidates.mts` |
| Reproduzierbare Kandidatenautorschaft | `author-candidate.py` — schreibt ausschließlich diesen Kandidatenordner |

Der neue vollständige P-v2-Innenprofil-Kandidat enthält zwei frische
zweisprachige Fälle: eigene vollständige Verteilung mit Kopienbegründung und
Transfer auf eine neue gleichzahlige Fehlverteilung. Vorgegebene
Kopienidentität, Chromosomenlegenden und angebotene Verteilungen sind
Hilfen. Eine künftig sichtbare korrekte Illustration ist ebenfalls Hilfe;
ihr bloßes Kopieren wird nicht als unbeeinflusste Leistung gezählt.

Der neue Bildprompt verlangt ein eigenes freundliches Comic-PNG im Regelfall
16:9 mit etwa 1600 × 900 Pixeln. Native, 360- und 680-Pixel-Sichtprüfungen
folgen erst nach einer tatsächlichen Erzeugung. Gute bestehende Bilder
bleiben erhalten. Dieser Ordner erzeugt und importiert kein Bild.

## Geprüfter Stand und offene Schritte

Der gezielte Checker prüft das vollständige Kandidaten-Overlay: 444
Graphknoten, gültige Referenzen und beide DAGs, exakte Erhaltung von `1d2b1038`,
keine molekulare Voraussetzungskette, 123 Quellen-/Mapping-Entscheidungen,
NI-Ansicht mit 134 Zielen, nationale Sek-I-/GK-Struktursichtbarkeit sowie
die tatsächliche Quellen-Vererbungsgrenze. Das einzelne vollständige
P-Innenprofil mit zwei bilingualen Fällen besteht das aktuelle v2-Schema.
Diese Prüfungen sind in [candidate-check.receipt.json](candidate-check.receipt.json)
dokumentiert. Die genaue unveränderte Übernahme der Vorgänger-Deltas steht
in [composition-preservation.receipt.json](composition-preservation.receipt.json).

Offen sind unabhängige fachliche D- und anschließende P-Urteile, die aktuelle
A/M-Übernahme, tatsächliche PNG-Erzeugung und unabhängige V-Prüfung,
gezielte betroffene Seiten-/Kontextbindungen und die kontrollierte
Integration der neuen Quellen-/Mapping-Nachfolger. Die statische
Struktursichtbarkeit ist **kein** Nachweis einer lernendenbezogenen
Länder-/Jahrgangs-Frontier im Runtime. Es gibt hier keine Runtime-Änderung,
keinen Build, keine zentrale Gesamt-QS, keine menschliche Freigabe und
keinen neuen strengen Abschluss.
