<!-- SPDX-License-Identifier: Apache-2.0 -->
# Chemie: begrenzter Autoren-Nachtrag für drei prospektive Quellenpflicht-Träger

**Inaktiver Autorenentwurf; 0 neue und 0 wiederhergestellte strenge Abschlüsse.**
Ausgangspunkt laut gebundenem Checkpoint: aktiv231/402 M6, inaktiv312/419.
Die drei vorhandenen prospektiven IDs bleiben dieselben; ihre mögliche spätere
Integration ergibt422 Inhaltsziele, aber hier keine Integration oder Gate-Freigabe.
Mathematik807, Physik478 und Biologie397 werden nicht verändert.

## Genaue Änderungen

- **40f2db27:** Der ganze bildgebundene Zielkörper bleibt exakt. I1/I2/I3 und das
  rohe P-Profil begrenzen alle betroffenen DE/EN Stoffanteile auf die bilanzierten
  gelösten Stoffe N+Z, P+Q bzw. U+V. Lösungsmittelmassen fehlen; die Reinheit der
  gesamten Flüssigphase ist unbestimmt. I1:90% N an N+Z,90% N-Rückgewinnung;
  I3:rund90.9% U an U+V,rund83.3% U-Rückgewinnung. I2 bleibt ausschließlich
  Identitäts-/Herkunftstransfer und liefert keinen zweiten Trennmechanismus.
- **93a7ce4d:** Nur `requires[1]` wechselt vom ganzen7a05 zum ganzen8d4.
  Das ganze42a84 bleibt Voraussetzung. Die vollständige Begründung vergleicht
  bestehende Zielkörper und Gegenbeispiele, einschließlich der vier breiten
  Mechanismuspfade. W1/W2 bleiben exakte vollständige Fälle. Das rohe P-Profil
  bleibt wissenschaftlich gleich; Fallpfade und Ziel-/Fallbindungen sind neu.
- **d815960a:** Ganzer Zielkörper, Fälle BW-B1/B2 und rohes P bleiben exakt KEEP.
  Alle drei Bilder bleiben bytegleich; keine Neuerzeugung oder eigene neue
  Sichtungs-/V-Freigabe. A hatte die exakten Assets in nativer Größe und360/680
  gesehen. Die aktuelle Autorrolle übernimmt keinen unabhängigen Review.

## Dateien und begrenzte Prüfungen

`candidate/three-whole-goals.bounded-author.json` enthält die drei ganzen
Nachfolgerobjekte. `candidate/whole-object-delta.author.json` zeigt Vorher/Nachher
gegen den alten prospektiven422-Stand und die Herkunft vom aktuellen b07-419.
`materials/eleven-complete-cases.remediated.author.json` enthält11 vollständige
Fälle/44 Rubriken; genau I1/I2/I3 ändern sich, die anderen8 bleiben exakt.
`candidate/two-profiles.raw.author.json` enthält nur die zwei neu gebundenen
Autorenprofile40/93; d815 wird am exakten alten Rohdatensatz referenziert.

Python prüft Bruchrechnungen, Stoffbilanzen, Profil-Schema, Referenzen und
vollständige Objekt-Deltas. Der unveränderte Stock-Helfer prüft den554-Ziele-
Kandidaten ausschließlich im Speicher: Runtime-/View-/Profil-Schema, beide DAGs,
P-Semantik und sechs Kurssichten. HB-LK185/BW-LK166 sowie HB-GK155/BW-GK144/
ST-LK142/ST-GK120 bleiben unverändert. Dies ist keine fachliche Kursfreigabe.
Die genauen Befehle stehen im Receipt; beide Prüfungen sind erfolgreich.
Kein Gradle, Build, neuer nativer PDF-Lauf, CI-Lauf oder Git-Schreibzugriff.

## Offene Arbeit und nächste Bindung

Die aktuellen Quellen-, Kurs- und Erwerbs-HOLDs bleiben **OPEN**. Rohes
`requires`-Traversieren verkürzt93 von42 auf6 Ziele; HB enthält weiterhin nicht
alle benötigten atomaren Stoff-/Zustandsziele. Der sichtbare266a-Cluster ist kein
atomarer Zielnachweis seiner praktischen Laborarbeitsweisen-/Sicherheitskinder.
Auch diese tatsächlichen Leistungsanforderungen bleiben offen; kein rein
theoretischer Fall, keine Standortkennung und kein vorhandener Eintrag beweist
deren Erwerb. BW behält seine bisherigen Erwerbslücken. HB-Pflichten gelten hier
nur im LK, BW nur für die gewählte Farbstoffroute im Leistungsfach; andere
amtliche Stoffgruppen bleiben Alternativen. Kein ganzer Kurs gilt als geschlossen.

Konkrete HB-Erwerbs-HOLDs im unveränderten Stock-Zielraum:

- `fcc73fb5-7413-557f-aea3-b9692a66ee75`: Stoffe/Eigenschaften, für40 und93.
- `326d45bf-9f77-57d5-a054-93e76b034dd5`: Aggregatzustände/Übergänge, für93.
- `416dfd33-8b43-5c49-903c-9847b95e4208`: tatsächliche Laborarbeitsweisen,
  als Kind von266a weiterhin für40/93 ungesichert.
- `13d4f336-ab16-54a7-9479-c920b458f385`: situationsbezogene Laborsicherheit,
  als Kind von266a weiterhin für40/93 ungesichert.

Der Alt/Neu-Union-Kontextaudit enthält beide Bezugsstände: Von b07 zu diesem
Kandidaten ändern sich sechs Kontexte der historisch gebundenen305 Abschlüsse
(42a84,5a302,5a709,8d4,c307,e5d6); ihre eigenen Körper bleiben alle exakt.
Vom vorherigen422-Kandidaten ändern sich die Kontexte42a84,7a05,8d4; zusätzlich
93 selbst und der unmittelbare Elternkontextd11fc im vollständigen Audit.
Alle bestehenden551 Kontexte sind zusätzlich unabhängig vom305-Filter erfasst.
Das305-Receipt ist eine historische Teilmenge und wird nicht als aktuelle312
ausgegeben. Vor Integration muss Root aktuelle tatsächliche D-Bindungen prüfen.

Die sechs betroffenen bisherigen atomaren Kontexte sind vollständig benannt:

- `42a84bca-d27e-581f-a43a-eee424f0504d`
- `5a30273a-98d5-5163-bb16-c250b7ed4e7f`
- `5a709938-e0f5-42b7-94f0-cfded08963a2`
- `8d4ef102-e6a6-4d2e-bb6b-e707d3f2e566`
- `c3077d95-f3fe-5579-8493-cb92992809c4`
- `e5d6de7e-28c5-5dd8-a700-ecc1a3a7b8cd`

Der vollständige551-Audit umfasst zusätzlich die Strukturkontexte442c31c5
undd11fc507. Damit hängt die Aufzählung der sechs atomaren Kontexte nicht vom
historischen305-Filter ab; ein aktueller312-Abschlussstand wird hier nicht neu
berechnet oder umetikettiert. Beim Vergleich zum alten422-Stand ist zudem die
entfernte Rückkante bei7a05 gezielt zu berücksichtigen.

Nächster Schritt: neue unabhängige, exakt gebundene Prüfung der Korrektur und
der ganzen93-Voraussetzung/Erwerbsgrenzen; bestehende Quellen-/Kurs-HOLDs lösen.
Erst mit tatsächlichen aktuellen nativen D-Seiten/Kontexten und geeigneten
unabhängigen D/P/A/M/V-Belegen kann separat integriert werden. E0/G0 der
Aufgabenentwürfe bleibt bestehen; keine Lernerausführung, keine Human Approval
oder Human Trial. Historischer B-Dissens wird offengelegt und bleibt erhalten.

`INPUTS.actual-read-inventory.json` unterscheidet tatsächliches Fachlesen,
mechanische Prüfung und unveränderte Übernahme. `FILES.finite-own-artifacts.seal.json`
versiegelt zuletzt die endliche eigene Dateimenge; Originalpakete bleiben unverändert.
