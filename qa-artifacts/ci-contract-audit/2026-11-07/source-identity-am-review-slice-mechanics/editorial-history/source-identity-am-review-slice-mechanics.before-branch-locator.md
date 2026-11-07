# Begrenzter Source-A-Lesekontext für A/M

7. November 2026. **35 echte Kontrollen bestehen; keine Produzenten- oder
Aktivierungsfreigabe.** Der [Einzelbeleg](source-identity-am-review-slice-mechanics-2026-11-07.json)
bindet Code, originale Konfigurationen, alle 63 Sichtdateien und die tatsächlichen
Ergebnisse. Ein unabhängiger Zweitblick steht aus.

Der Baustein setzt den [isolierten Ausführungsplan](source-identity-5c9-isolated-qa-doing-plan-2026-11-06.md)
für einen kleinen A/M-Leseschritt um. Seine tatsächliche Grundlage ist der
[bereits vollständig verifizierte db9c-Quellenbeweis](source-identity-db9c-source-rebase-2026-11-06.md):
Git `db9c71155997842ebb7cf48dda413ff6196f1a9f`, externer Manifest-Rohhash
`a145fe393296cd8d6fa703e9661ddc84c1a09fd364e2a6ef199df44c9ff2ea3a`.
Er überschreibt weder den früheren 5c9-Stand noch den v1-Vertrag.

## Was der Baustein prüft

Der neue Kontext übernimmt vollständige ausgewählte Original- und
Kandidatenquellbytes sowie unveränderte originale A/M-JSONL-Bytes. Der externe
Manifestpin, sechs Implementierungs-/Vertragsbindungen und das geschlossene
Source-A-Schema werden geprüft. Der unveränderte Python-Kernel führt die
deklarierte Feldprojektion aus, vergleicht den vollständigen Kandidaten und
prüft dessen Inverse. Die Ownerbindung ist exakt; Goalkeys werden ausschließlich
gemäß der gebundenen Bijektion transportiert.

Nur typisierte Lesefelder ändern sich: `goalId`, `memoryGoalIds` und
`originGoalIds`. Entscheidungen, Gründe, Zeitstempel, Deck-/Karten-IDs und alle
Originalfingerprints bleiben unverändert. Für den historischen
Goal-Fingerprintvergleich liefert der Kontext genau die zugehörige
Originaldefinition. Ein semantisch verändertes Kandidatenobjekt wird abgewiesen.
Ein frei konstruierter Kontext ist kein gültiger Kontext. Rückgabewerte und
Arrays sind eingefroren und unabhängig von später geänderten Aufruferpuffern.

Das ist eine ausgewählte Eingabebindung. Es werden weder die vollständige
593-/8.591-Datei-Inventur erneut berechnet noch Produzentenlesungen authentisiert.
Dieser Kontext kann keine Composer-, B- oder Laufzeitfähigkeit erzeugen.

## Tatsächliche native Kontrollen

Die bestehenden CQR-Funktionen werden unverändert ausgeführt. Ihre einzige
Dateiänderung sind sechs reine `export`-Schlüsselwörter; der gespeicherte Diff
und ein Bytevergleich belegen unveränderte Funktionskörper.

| Bindung | Politik und Wirtschaft | Wirtschaftswissenschaften |
| --- | ---: | ---: |
| Originale M-Goalzeilen | 413 | 346 |
| Transportierte `goalId` | 134 | 0 |
| M-Zeilen mit transportierter Memoryreferenz | 107 | 55 |
| Einzelne transportierte Memoryreferenzen | 108 | 56 |
| Tatsächliche Scopeeinträge / eindeutige Viewdateien | 15 / 15 | 48 / 48 |

Die ursprünglichen vollständigen PoWi-A- und beide aktiven M-Evaluierungen
bestehen. Alle 134 geänderten PoWi-A-Verbindungen behalten ihre nativen
Originalfingerprints. Native Form-, Deck- und Karten-Originprüfungen bestehen
für die typisierten Lesesichten. Primäre Deckbytes sind gegen die tatsächlichen
Git-Eingaben geprüft. Die native Sichtbarkeitsprüfung verwendet 63 echte,
kernelprojizierte Kandidatenviews; nur deren temporäre Testlocators werden
umgeleitet. Eine frühere Nachricht addierte 15 und 48 fälschlich zu 65; es gibt
keine zwei zusätzlichen Kontrollviews.

Fremde und anders geschriebene Owner, fehlende Referenzen, veränderte
Kandidatenbedeutungen, geänderte originale Quellen/Belege und gefälschte Kontexte
scheitern. Native ungültige Entscheidungen und leere Gründe bleiben Fehler.
Der zunächst versehentlich gewählte alte Wirtschafts-M-Vorgänger bleibt mit
300 veralteten und 46 fehlenden Zuordnungen tatsächlich rot. Der Positivfall
nutzt die bereits vorhandene aktive Registry-Konfiguration; keine Evidenz wird
nachgeführt.

Die normalen unveränderten Kandidaten-CQR-Aufrufe bleiben wegen ihrer noch
fehlenden Kontextintegration `warn`. Dieses Ergebnis wird ausdrücklich erhalten.
Es ist kein gesamter Kandidaten-QA-Lauf. Der Helper besteht die strikte
Typprüfung; der Testimport hat exakt dieselben 40 Diagnosen wie das bestehende
CQR-Modul allein, bytegleich und ohne neue Dateidiagnose.

## Offene Integrationsgrenze

Die Produktionsfabrik muss weiterhin den echten vollständigen Source-A-Verifier
und die geschlossene Leseauthentisierung für Original, Kandidat und alle
Kindprozesse verbinden. Ein fehlender Kontext darf keinen Rückfall auf einen
grünen Ergebnissatz erlauben. Struktur-, Quellen-, Scope-, Deck- und Floorchecks
müssen die tatsächlichen Kandidatendefinitionen behalten. Ein ganzer inverser
Kandidatengraph wird nicht bereitgestellt.

Es gibt hier keine normale Producerverdrahtung, keine D/P/V-/Kind-/Policy-
Übertragung und keinen Learner-, SRS-, Mastery- oder B-Pfad. Die kleinen
temporären Eingaben lagen ausschließlich in RAM und wurden am Ende entfernt.
Aktive Quellen, QA-Records, Karten und bestehende Capture-/V-/Readtrace-Dateien
blieben unverändert. Der [kleine Belegordner](https://github.com/enpasos/skillpilot/tree/main/qa-artifacts/ci-contract-audit/2026-11-07/source-identity-am-review-slice-mechanics)
erhält den ursprünglichen Fehlversuch, den 31er-Zwischenstand und den endgültigen
35er-Lauf getrennt.
