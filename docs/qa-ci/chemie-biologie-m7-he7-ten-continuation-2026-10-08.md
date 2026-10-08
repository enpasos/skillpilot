# Chemie und Biologie M7: HE7-Zehnerpaket

## Aktueller strenger Stand

Der tatsächliche zentrale Check nach Integration und gezielter technischer
Korrektur ist mit **Exit 0, ohne Blocker** abgeschlossen. Er zählt die aktuellen
Ziel-IDs und die gültige Schnittmenge D/P/A/M/V.

| Fach | Streng abgeschlossen | Anteil | Noch offen |
| --- | ---: | ---: | ---: |
| Biologie | 202/391 | 51,7 % | 189 |
| Chemie | 173/378 | 45,8 % | 205 |
| Mathematik | 807/807 | 100 % | 0 |
| Physik | 478/478 | 100 % | 0 |

Biologie gewinnt **zehn neue fachliche Abschlüsse**, **null reine
Bindungswiederherstellungen**, netto **+10**. Alle bisherigen 192 strengen
Biologie-Abschlüsse bleiben erhalten. Die aktuellen Ziel- und Abschlussmengen
der anderen drei Fächer sind unverändert.

Maßgebliche tatsächliche Artefakte liegen unter
`curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he7-ten-reviewed-active-integration-root-v1/`:

- `active-after-ten-config-and-qa-v3-central.actual.json`
- `active-after-ten-config-and-qa-v3-central.exit.actual.json`
- `exact-current-strict-plus-ten-delta.actual.json`
- `guarded-active-ten-integration.actual.json`

Der vorherige gültige Stand ist im
[HE9-Einzelpaket](chemie-biologie-m7-he9-gentechnik-one-continuation-2026-10-08.md)
dokumentiert. Der aktuelle ganze Biologie-Canon hat SHA256
`d524850cf83cdb70b3b1105c1bac5b93b08e42272893320392f160f52a4e35d5`.

## Tatsächliche fachliche und visuelle Prüfung

Das Paket umfasst Grundlagen, Zellen und Fotosynthese. Zwei unabhängige
Quellen-/Beschreibungsreviews haben die zehn ganzen bilingualen Ziele und
20 vollständigen Anwendungsfälle geprüft. Danach haben zwei unabhängige
finale Reviews die aktuellen nativen D10-/P10-Bindungen und die tatsächlichen
Original-PNGs, 20 Ansichten bei 360/680 Pixeln und zehn ganze Buchseiten
geprüft. Die finalen Ersturteile sind eigenständig versiegelt; es gibt keine
offenen Befunde dieses Pakets.

Die neuen Bilder sind notwendig, weil die aktuellen Ziele keine primäre
Visualisierung hatten. Sie sind freundliche comicartige PNGs im nativen
Querformat 1672 × 941 Pixel. Zwei belegte Schwächen wurden gezielt vor den
finalen unabhängigen Reviews korrigiert: die Reaktionsdarstellung bei den
Kennzeichen von Lebewesen und die Trennung von Wasser und gesammeltem Gas
beim Sauerstoffnachweis. Die ursprünglichen Kandidaten bleiben erhalten.
Generation und Autor-Sichtprüfung sind keine unabhängige Freigabe.

Die Integration kopiert 30 PNG-Dateien bytegleich an die drei vorhandenen
Asset-Orte sowie zehn Prompts und zehn Herkunftsnachweise. Nur die zehn
`resourceLinks` werden ergänzt: 464 andere ganze Ziele und 381 andere ganze
Seiten bleiben exakt erhalten. Sämtliche 474 Klassifikationszeilen, die
aktuellen A/M-Konfigurationspfade, Reviewversionen, Karten und geprüften
Sichtbarkeitsgrenzen bleiben unverändert. Die zentrale Registry erhält den
echten D10-Index und die aktuelle P10-Konfiguration; bestehende historische
Reviews, Auflösungen und die sieben Chemie-Ledger-Einträge werden erhalten.

## Gezielte technische Korrekturen nach der Integration

Die tatsächlichen Fehlversuche bleiben als Geschichte erhalten. Zwei Fehler
der Integrationskonfiguration wurden ohne Änderung der fachlichen Urteile
behoben:

1. Die ursprünglich versiegelte P-Konfiguration verwies noch auf den
   bildlosen Quellen-Snapshot und hatte keine geprüften Ressourcentypen.
   Die neue operative Konfiguration verweist auf den aktuellen Canon und die
   aktuellen Klassifikationen, identische Kriterienbytes und
   `reviewedResourceTypes: ["goal-visualization"]`. Alle zehn P-Datensätze,
   Materialien, Profil-, Ziel- und Review-Input-Fingerprints bleiben exakt
   unverändert. Der normale aktive P10-Check besteht mit Exit 0.
2. Bei den zehn neuen visuellen Freigabezeilen fehlten die normalen
   `aiReviewedAt`-/`aiReviewer`-Metadaten. Diese wurden an die tatsächlichen
   unabhängigen V10-Abschlussnachweise gebunden. Der vorhandene
   Biologie-QA-Generator wurde ausgeführt und sein normaler `--check`
   besteht. Alle anderen 381 QA-Zeilen und sämtliche menschlichen
   Prüfungsfelder bleiben exakt unverändert. Kein Bildhash wurde angepasst.

Das sind technische Zuordnungs- und Normalisierungskorrekturen zu bereits
vorliegenden echten Reviews. Sie werden nicht als neue Fachprüfung gezählt.
Der aktive D10-Check, der aktive korrigierte P10-Check, die Asset-Prüfung,
die gewöhnliche QA-Frischeprüfung und der abschließende zentrale Bericht
sind tatsächlich bestanden.

## Getrennte menschliche Gates und nächste Schritte

Die P10-Nachweise bleiben `needs_human_review`, `ai_candidate`, E1/G1.
Die schriftlichen Modellfälle beweisen keine praktische Lernendenleistung.
Menschliche Freigabe, Erprobung und Release-Gates bleiben offen und getrennt.
Chemie und Biologie haben weiterhin **kein M7** erreicht. Der ältere volle
Build und die generierten Layer-A-Berichte des 174er-Stands sind keine
Abschlussprüfung dieses 202er-Stands; ihre reguläre Aktualisierung wird am
nächsten stabilen Integrationsstand gebündelt.

Als Nächstes folgt die bereits fachlich unabhängig geprüfte HE12-Aufteilung
in zwei Ziele. Sie benötigt die aktuellen nativen Nachweise der beiden neuen
Ziele und die gezielte Prüfung zweier tatsächlich veränderter Seitenkontexte.
Gute vorhandene Bilder und gültige unveränderte fachliche Nachweise bleiben
erhalten. Parallel werden 18 ganze Evolutionsziele als Kandidaten vorbereitet
und acht begrenzte Chemie-Quellenrollen technisch geprüft. Ungeprüfte
Kandidaten und weiterhin offene ganze Chemieziele zählen nicht abgeschlossen.

Dieser Stand enthält keinen Commit, Push, Merge oder Deployment und keine
Runtime-, Sicherheits-, Datenschutz- oder Pluginänderung.
