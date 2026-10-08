# Chemie Q3: 20 ganze Autorenkandidaten, inaktiv

Stand: 8. Oktober 2026. Dieses Paket bereitet die vorhandenen 20 IDs vor. Es
ändert keine aktive Registry, Quelle, Beschreibung, Karte oder Abbildung.
Die fachlichen Fälle sind synthetisches E1/G1-Autorenmaterial. Sie sind keine
Lernerleistung, kein Human Trial und keine menschliche Freigabe.

## Einstieg

- [Neutraler Auftrag für zwei unabhängige Reviews](independent-review-entry.json)
- [20 aktuelle ganze Ziele, echte Requires und Eltern](whole20.current-native-goals.requires.parents.snapshot.json)
- [40 vollständige DE/EN-Fälle](whole40.material-task-model-scoring-fresh-transfer.de-en.author-candidate.json)
- [Aktueller nativer Ganzziel-Kontext](native/whole20.current-native-pure-book-contexts.actual.json)
- [Originalquellen: tatsächlich gelesene Grenzen](source/actual-original-primary-locators-and-read-boundaries.json)
- [Ganzziel-Quellenbeurteilung](source/whole20-original-source-scope-operator-assessment.author-candidate.json)
- [Alle aktuellen Quellduties mit vollständigen 1:n-Partnern](source/whole-all-current-source-goals-and-1n-partners.lossless.json)
- [Kandidaten und offene Whole-HOLDs](whole20-author-clear-candidates-and-HOLD-list.json)

Jeder Fall enthält Material, Aufgabe, vollständige Modellantwort, getrennte
Kriterien und einen frischen Transfer samt Modellantwort. Pro Fall gibt es
vier fachliche Kriterien zu je zwei Punkten und zwei Punkte für den getrennt
zu bearbeitenden Transfer. Die Modellantworten sind keine unabhängigen
Lernerantworten. Planung, Durchführung und praktische Messkompetenz aus
Originalquellen werden durch die schriftlichen Fälle nicht als durchgeführt
gewertet. Sachangaben für Produkt- und Nachhaltigkeitsurteile sind explizite
Fallannahmen; sie sind keine aktuellen Produktdaten oder Handlungshinweise.

## Native tatsächliche Prüfungen

Der bestehende Goal-Book-Builder erzeugt eine vollständige aktuelle 378-Seiten-
Prüfsicht. Die 20 Seiten werden mit dem bestehenden nativen Subset-Builder in
dessen Reihenfolge ausgewählt. Es gibt keinen als Publikation ausgegebenen
359-Seiten-Ersatz und keinen fingierten Batch-20-Review. Die gespeicherten
native Pages und canonical Contexts enthalten die ganzen aktuellen Ziele.

- P: Standardmaterializer, geschlossene v2-Datensätze, 20 Kandidaten, 40 Fälle;
  API und CLI liefern dieselben Objekte. Standard-P-Prüfung: exit 0,
  20 `needs_human_review`, null neu genehmigt.
- A: Standard-A-Prüfung: exit 0, 18 inaktive `atomic`-Autorenkandidaten,
  zwei `needs_developer_review`. Der Maschinenbericht nennt Kandidaten nach
  seinem vorhandenen Format; daraus folgt keine unabhängige Freigabe.
- M: vorhandene vollständige 378-Entscheidungen, sieben Sichtbarkeitssichten
  und vorhandene Karten; Standardprüfung exit 0, keine fehlende sichtbare
  Memory-Komponente. Die 20 relevanten Entscheidungen und fünf vorhandenen
  Kartenreviews sind separat kopiert. Es wurden keine Karten erstellt.
- V: 20 aktuelle vorhandene Bilddateien stimmen mit beiden vorhandenen
  QA-Hashes überein. Das ist exakte Wiederverwendung, kein neuer Bildreview.
- Neun unabhängige Zahlenprüfungen: exit 0. Die Zweipunkt-Arrheniusrechnung
  ergibt 55,32 kJ/mol; native P-Datensätze verwenden den korrigierten Wert.

Tatsächliche Terminals und Ausgaben liegen unter `native/`; die aktuelle
378-Sicht liegt unter `native/full378.current-native.book-model.json`.
`native/path-only-adaptation.receipt.json` erklärt die Pfadanpassungen für
eingefrorene Inputs. Vorhandene semantische Entscheidungen bleiben erhalten.

## Offene Whole-HOLDs und Quellenbindungen

Die ganzen Ziele `882630ba` (gesellschaftliche Einordnung mit Quellenkritik)
und `96fd8608` (räumliche Redoxtrennung und elektrische Arbeit aus U/I)
bleiben als A-Whole-HOLD offen. Es werden weder Textbestandteile entfernt
noch historische IDs weggeworfen. Bei elektrischer Arbeit bleibt die
fachliche Grenze erhalten: maximale elektrische Nichtvolumenarbeit bei
konstantem T,p ist −ΔG; sie ist nicht allgemein −ΔH.

Zusätzlich bleiben sieben Quellenbindungen offen: vereinfachtes MWG,
Haber-Bosch-Gesamtpflicht/Partner, quantitative Faraday-Anwendung,
Wasserstoff-Gesamtpflicht/Photokatalyse, Raten-/Faktoren-Quellenrollen sowie
Arrhenius. In Hessen steht Faraday ohne Berechnungen; quantitative Fälle
werden nicht als hessische Berechnungspflicht ausgegeben. Die aktuell
zugeordnete Bremer normalisierte Arrhenius-Zeile ist im tatsächlich gelesenen
Original S. 24 nicht als solche Pflicht belegt. Ein vorhandenes natives
Mapping-Review-Envelope wird deshalb als inaktiver HOLD-Kandidat kopiert;
alle vier Partner und alle Kanten bleiben erhalten.

Der Quellenpool bewahrt 1.602 betroffene Mapping-Kanten und 929 vollständige
Quellduties samt allen Partnern. Er ist keine pauschale Prüfung sämtlicher
Bundesländer. Nur die im Originalquellenbericht genannten Seiten und
LehrplanPLUS-Abschnitte wurden in dieser Autorensitzung tatsächlich gelesen.
Normalisierte Extraktionstexte und amtliche Originaltexte werden nicht
gleichgesetzt. Der direkte Bremer Abruf antwortete 404; der amtliche
alternative Locator war über das Webtool lesbar. Ein aktueller Bytevergleich
mit dem Download wird ausdrücklich nicht behauptet.

## Versiegelung und Reproduktion

`author-candidate.first.seal.json` bindet den abgeschlossenen Erstkandidaten.
`author-candidate.final.seal.json` bindet die finale Übergabe samt erstem Seal.
Die jeweiligen `*.verify.actual.json` dokumentieren tatsächliche Hash- und
Ignore-Prüfungen. Die Selbsteinträge der Seals und ihre Prüfreceipts sind
bewusst ausgeschlossen. Spätere unabhängige Reviews gehören in getrennte,
von Root benannte Dossiers und ändern dieses Autorenpaket nicht.

Reproduktion aus dem Repository mit vorhandenen App-Abhängigkeiten:

```sh
app/node_modules/.bin/tsx app/scripts/buildGoalBookModel.ts curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie-q3-twenty-whole-science-source-author-20261008-v1/native/full378.book.config.json
app/node_modules/.bin/tsx curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie-q3-twenty-whole-science-source-author-20261008-v1/whole20_native_context_and_api_check.mts
python curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie-q3-twenty-whole-science-source-author-20261008-v1/verify_author_seal.py
```

Diese Befehle schreiben nur zu diesem Paket gehörende Ausgaben. Ein erneuter
Build/API-Lauf aktualisiert Laufzeitreceipts und muss deshalb vor einem
neuen Seal erfolgen. Kein unversioniertes rohes HTML/PDF und kein isolierter
Klon ist für die operativen Kandidaten und ihre Prüfung erforderlich.
Vorhandene Repository-Karten und Bilddateien werden anhand ihrer Originalpfade
und gespeicherten Hashes wiederverwendet.

Eigenes Wissensmaterial einschließlich Aufgaben und Ziele: CC-BY-4.0,
SkillPilot. Technische Skripte, Konfigurationen und Entwicklerdokumentation:
Apache-2.0. Fremde amtliche Quellen behalten ihre eigenen Rechte; die
Quellenprovenienz ist keine eigene Lizenz- oder Qualitätsfreigabe.
