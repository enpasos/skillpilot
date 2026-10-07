<!-- SPDX-License-Identifier: Apache-2.0 -->
# Hamburg: unabhängige B-Prüfung der 21 begrenzten Quellenkomponenten

**B akzeptiert die 21 vorgeschlagenen direkten Komponenten ausschließlich als
partielle Teilbelege.** Alle 11 weiteren ganzen Ziel-/Sichtpaare bleiben HOLD.
Kein ganzes aktuelles Lernziel, kein ganzer ursprünglicher Sammelanspruch und
kein M7-Abschluss wird hier freigegeben. Das Urteil beruht auf dem tatsächlichen
Author-Freeze und einer eigenen Primärlektüre; kein Peer-A-Bericht und keine
A-Bewertung wurden gelesen oder verwendet.

## Tatsächliche Eingänge und Quellenlektüre

Zuerst wurden alle zehn Nutzdateien gegen den unveränderten Author-Freeze
geprüft. Ihre Bytes und Größen sind exakt erhalten. Der Freeze selbst hat den
SHA-256 `251f4e49a42fc15a19d7af29a026737b4eb8de5903b6636e0bb71da9f6524510`.
Die vollständigen aktuellen Zielobjekte und tatsächlichen Rohentscheidungen
wurden aus `HH.all-thirty-two-current-goal-primary-scope.decisions.author-v1.json`
gelesen; die tatsächlichen Originalspannen und BBoxen aus
`HH.actual-primary-selected-spans.author-v1.json`.

Ein eigener Download des [amtlichen Bildungsplans Hamburg Gymnasium Sek I
Biologie, Ausgabe 2011](https://www.hamburg.de/resource/blob/123418/3f001f63072b1ee4259a0f2630229083/biologie-gym-seki-data.pdf)
ist bytegleich zum gebundenen Original: 497568 Bytes, SHA-256
`8ed7ac127a75126ed30af2261564acd2236d0c7916b307b67b7e762d989dffa3`.
Die tatsächlichen PDF-Raster der physischen Seiten **18–20 und 22–28** wurden
per `view_image` gesehen und gelesen. Die sichtbaren gedruckten Seitenzahlen
stimmen jeweils überein. Erzeugung der PNGs wurde nicht als Sichtprüfung
gezählt. Der eigene Receipt bindet die wirklich gelesenen Raster durch Hashes;
vollständige PDF-, PNG- und Seitentextkopien bleiben nicht im B-Paket.

Alle **26** Rohspannen mit ihren ursprünglichen PDF-Zeilen und BBoxen wurden
unabhängig per `pdftotext -bbox-layout` reproduziert. Die Zeilen gehören jeweils
zur richtigen sichtbaren Tabellenzelle. Die ausgewählten End8-Zeilen liegen in
der tatsächlichen End8-Spalte, die End10-Zeilen in der anderen Spalte; keine
benachbarte Jahrgangsspalte wurde hineingemischt. Die 21 Komponenten verwenden
24 unterschiedliche Originalspannen; mehrfach verwendete Originalstellen
werden nicht zu zusätzlichen amtlichen Bullets erklärt.

Seite 20 beschreibt ausdrücklich einen kumulativen Lernprozess bis Ende 8
und Ende 10/Übergang in die Studienstufe. Daraus folgt kein fester erster
Unterrichtsjahrgang. Die verbindlichen Inhalte auf Seiten 26/27 und ihre
Zusammenfassung auf Seite 28 besitzen keine feste Zeit- oder Reihenfolgezuordnung.
Alle B-Urteile bleiben **Sek I, ohne amtlichen GK-/LK-Anspruch**. Die GK-/LK-Tags
der erhaltenen kanonischen Zielobjekte werden nicht als Hamburger Quellenaussage
übernommen. Der neue Download bestätigt die gebundenen Quellenbytes, keine
zusätzliche Aussage zur heutigen rechtlichen Geltung anderer Lehrplanfassungen.

## Fachliche Komponentenurteile

Die folgenden Nummern sind Positionen der erhaltenen historischen Hamburger
Worklist, keine amtliche Nummerierung. Die vollständigen UUIDs, Seiten,
Spannenschlüssel und B-Entscheidungen stehen in
`HH.twenty-one-bounded-components-and-eleven-holds.independent-b.review.json`.

| Paar | Von B akzeptierter begrenzter Teil | Zusätzlich offen gehaltene Grenze |
| --- | --- | --- |
| 3 | Bau eines ausgewählten Sinnesorgans | Auge/Ohr ist erklärte Auswahl; keine amtlich festgelegte Organwahl. |
| 5 | Prinzipien einer Immunreaktion | Unspezifisch/spezifisch, Parasiten und Allergien nicht vollständig belegt. |
| 6 | Körperwirkungen von Geschlechtshormonen | Zyklus, vollständige Reifungsmechanik und Rückkopplung offen. |
| 8 | Erregungsleitung und Zusammenwirken von Sinnesorganen/Nervensystem | Detaillierte Verarbeitungsmechanismen offen. |
| 9 | Körperwirkungen am erklärten Reifungsbeispiel | Psychische und mediale Pubertätsansprüche offen. |
| 10 | Aufgaben von Blutbestandteilen und Gerinnung | Vollständige Plasma-/Transport-/Immunitätsliste offen. |
| 11 | Beurteilung des verbindlichen Verhütungsinhalts | Prozess-Inhalt-Verbindung erklärt; Methodenliste und Elternschaft offen. |
| 12 | Blutbestandteile und Zusammensetzung | Konkrete Eigenschaftsliste offen. |
| 13 | Menschlicher Kreislauf und Gefäßtypen | Umwelt-Zell-Transport samt Aufnahme/Abgabe offen. |
| 14 | Ausgewählte menschliche Verdauungsbestandteile und Modelle | Nahrungsaufnahme, ganzer Weg und weitere Säugetierfälle offen. |
| 15 | HIV-Übertragung mit erklärtem Infektionsschutzfall | Andere sexuell übertragbare Erkrankungen und ganze Präventionsliste offen. |
| 19 | Grundlegender Schwangerschaftsinhalt | Detaillierter Verlauf, Geburt und Risikofaktoren offen. |
| 21 | Geschlechtshormonwirkung am Reifungsbeispiel | Vollständige Pubertäts-/Merkmalsliste offen. |
| 22 | Sinnesgesunderhaltung; gesondert Drogeneinfluss auf das Nervensystem | Keine daraus erfundene direkte Drogenwirkung auf ein konkretes Sinnesorgan. |
| 23 | Funktion eines ausgewählten Sinnesorgans | Netzhautabbildung/Schallempfang bleibt erklärte Operationalisierung. |
| 24 | Organfunktion, Empfängnis und Schwangerschaft grundlegend | Vollständige Befruchtungs-/Embryomechanismen offen. |
| 26 | HIV-Verlauf, AIDS und erklärter Infektionsschutzfall | Klinische Stadien, Behandlung und umfassende Prävention offen. |
| 27 | Verdauungsbestandteile und Modelle | Ausgewogene Ernährung und Ernährungskriterien offen. |
| 28 | Impfprinzipien und Nutzen-Risiko-Beurteilung | Vollständiger Aktiv-/Passivvergleich offen. |
| 29 | Kreislaufbeschreibung mit allgemeinem Gesundheitsbezug | Atmung und spezifische Lungen-/Kreislaufvorsorge offen. |
| 30 | Immunprinzipien im erklärten Infektionskontext | Transplantationen und Transplantationsimmunologie offen. |

Zwei Grenzen werden präziser als eine pauschale Restnotiz gefasst: In Paar 22
belegt der Einfluss von Drogen auf das **Nervensystem** keine konkrete direkte
Wirkung auf ein **Sinnesorgan**. In Paar 29 belegt die allgemeine Regel zu
Gesunderhaltung und Reizüberflutung keine spezifische Herz-Kreislauf-Vorsorge.
Die direkten Quellenkomponenten dürfen nur innerhalb dieser Grenzen verwendet
werden. Die Author-Restanforderungen bleiben zusätzlich vollständig erhalten.

Die 11 Whole-HOLDs betreffen weiterhin Lebenskompetenzen zur Suchtprävention,
Schwangerschaftsverhalten, Blutzuckerregulation, den Menschen als offenes
Stoffwechselsystem, umfassende Lungen-/Kreislaufvorsorge samt Behandlung,
Suchtentstehung, Missbrauchsschutz, Diffusions-Gasaustausch, Genuss-Sucht-Grenze,
artvergleichende Wahrnehmung und hormonelle Regelmodelle. Allgemeine Inhalte,
Basiskonzepte oder benachbarte Routinen schließen diese konkreten Anforderungen
nicht. Der ursprüngliche ganze Sammelanspruch bleibt `needs_canonical_goal`.

## Eigener aktueller technischer Nachlauf

Historische Eingangsbindungswerte wurden unverändert erhalten. Im aktuellen
Workspace weichen inzwischen drei gebundene Dateien ab:

- `app/scripts/goalBookModel.ts`
- `curricula/DE/Gymnasium/provenance/gymnasium-duration-model-policy.json`
- `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json`

Diese Unterschiede machen keinen eingefrorenen Author-Receipt rückwirkend
aktuell. Der eigene aktuelle Nachlauf bindet die tatsächlich vorgefundenen
Bytes und führt das unveränderte Produktionsverfahren
`buildGoalBookSourceAtlasInputs` zweimal rein im Speicher aus. Der neue Receipt
in `native-hh-current390-additive-atlas.independent-b.current.actual.receipt.json`
belegt tatsächlich:

- **472** aktuelle kanonische Knoten und **390** `curricularAtomic`-Ziele.
- Alle **22 vollständigen geordneten Landeszielmengen** sind exakt gleich
  zwischen aktueller Baseline und additivem Kandidaten. Ihre geordneten Hashes
  sind auch exakt gleich dem eingefrorenen Author-Nachweis; die ganzen Listen
  stehen im eigenen Receipt.
- Genau **21 zusätzliche direkte Komponentenzeugen in `DE-HH/SekI/`**, ohne
  Clustervererbung, neue Ziel-UUID oder veränderte Navigation.
- Alle 11 individuellen HOLD-Paare erhalten; Original-Sammel-HOLD erhalten.
- Alle **24** TH-Author-Dateien samt getrenntem Freeze exakt erhalten.
- Die **112** geschützten Chemie-Zielobjekte sind unabhängig vom inzwischen
  geänderten Chemie-Globalhash weiterhin vollständig exakt; Mathematik und
  Physik entsprechen ihren erhaltenen Author-Eingangsbindungen.
- Eingangsbytes wurden nach dem Lauf erneut geprüft. Keine erzeugten
  Atlas-/Navigationsdateien wurden in aktive Pfade geschrieben.

Der Compiler prüft technische Quellenscope-Zuordnung und Zeugenbildung; er
entscheidet nicht über die fachliche Vollständigkeit eines Teilbelegs oder die
ausstehenden unabhängigen Statusfelder. B verändert keine Author-Statuswerte.
Der **vollständige Neuro21-HOLD-Overlay und seine Zielbuchplatzierung wurden
nicht ausgeführt** und bleiben ein eigener offener Integrationsschritt.

**Neue strenge Abschlüsse 0; aktive Bindungen wiederhergestellt 0; strenger
Nettozuwachs 0.** Kein D/P/A/M/V- oder M7-Abschluss, keine menschliche Freigabe,
kein Human Trial. Eigene Dateien liegen ausschließlich im neuen B-Verzeichnis;
historische Quellen, Author-Pakete, andere Review-Lanes, aktive Daten,
Runtime-/Plugin-Dateien und Git wurden durch B nicht verändert.
