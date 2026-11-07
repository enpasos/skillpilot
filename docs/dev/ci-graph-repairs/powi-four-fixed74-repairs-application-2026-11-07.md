# Vier PoWi-Korrekturen und 74 belegte Bildkontexte

Der reguläre Gesamtbericht vom `2026-11-07T05:46:48.445Z` bestätigt die vier
angewandten PoWi-Korrekturen und die erweiterte strenge Bildprüfung. Deutsch,
Geschichte und Latein bleiben M6. Die übrigen sieben geschützten Fächer sind
M0; der tatsächliche direkte Floorcheck scheitert weiterhin an allen sieben.
Die zehn Untergrenzen und die leere Ausnahmenliste sind unverändert.

## Fachliche PoWi-Korrekturen

Genau vier direkte Voraussetzungen auf das Einführungsziel wurden nach
unabhängigem fachlichem Review entfernt. Die Voraussetzungen bleiben über
die vollständig ausgewerteten transitiven Pfade erhalten. Andere Goal-Felder,
Zielmengen und Karten wurden nicht verändert. Eine fünfte vorgeschlagene
Korrektur bleibt ausdrücklich zurückgestellt.

Der tatsächliche native Vergleich reduziert PoWi von 603 auf 599 Befunde:
122 G17 und unverändert 477 G01a. Die fachübergreifende Gymnasium-Übersicht
sinkt um dieselben vier Ursprungsbefunde von 3.844 auf 3.840. Die übrigen
19 Graphberichte bleiben gleich. Mathematik bleibt bei 916 Befunden,
darunter 914 G17 und zwei G01a. Die PoWi-Korrekturen lösen die verbleibenden
Identitätskonflikte nicht.

Belege: [aktueller Kandidat und native Vergleiche](https://github.com/enpasos/skillpilot/tree/feat/skill-graph-ci-contracts/qa-artifacts/ci-contract-audit/2026-11-07/powi-four-current-context-application-candidate),
[unabhängiger Anwendungsreview](https://github.com/enpasos/skillpilot/tree/feat/skill-graph-ci-contracts/qa-artifacts/ci-contract-audit/2026-11-07/powi-four-independent-application-review)
und [tatsächliche Anwendung](https://github.com/enpasos/skillpilot/tree/feat/skill-graph-ci-contracts/qa-artifacts/ci-contract-audit/2026-11-07/powi-four-current-context-application).
Historische Backendvergleiche behalten ihre damaligen Quellpins. Die aktuelle
PoWi-Anwendung setzt die vollständige transitive Auswertung dieses Branchs
voraus; sie ist kein isoliert freigegebener Backport auf die Main-Basis.

## Strenge Bildprüfung

Die bereits unabhängig überprüften 57 Kontexte bleiben bytegleich erhalten.
17 weitere vorhandene Wirtschaftskontexte werden aus ihren originalen
Quell-, Bild- und Reviewbelegen gelesen. Der deutsche Einzelkontext
`676684da-5ba2-5c2a-ba7e-a8413915c29c` bescheinigt weiterhin nur seinen
tatsächlich geprüften deutschen Inhalt. Daraus folgt keine englische,
Anforderungsniveau- oder Curriculumfreigabe.

Die reguläre CQR-303-Ableitung bestätigt 74 von 2.483 Kontexten: fünf in
Mathematik und 69 in Wirtschaft. 2.409 V-Nachweise bleiben offen.
Beschreibungen, Aufgabenprofile, Atomicity und Kartenreview sind bei allen
2.483 Zielen belegt. Keine der fünf vollständigen M7-Prüfungen besteht.
Die Übernahme vorhandener Bildreviews ist keine neue menschliche Freigabe.

Der erste Transportentwurf hatte eine tatsächlich reproduzierte Lücke:
doppelte Optionen, Gleichheitsnotation und Parserabkürzungen konnten die
Ressourcengrenzen umgehen. Der angewandte Nachfolger prüft das wirksame
Argumentobjekt aus dem unveränderten nativen Parser vor beiden Operationen.
Die Grenzen bleiben für diesen festen Transport 192 MiB Arbeitsdaten,
256 MiB Gitobjekte und 16 MiB eingebettete Daten. Alte Transporte behalten
ihren bisherigen Vertrag.

Der wiederkehrende Befehl `test:deep-understanding-rollout` führt zusätzlich
24 echte CLI-Negativaufrufe gegen beide Operationen aus. Derselbe Test
scheitert beim aufbewahrten ersten Entwurf in allen 24 Fällen. Die gültige
authentisierte Übernahme bleibt Bestandteil der regulären V-/CQR-/M7-Tests.
Der Gesamt-Selbsttest bindet seine erwarteten 74 eindeutigen Kontexte an
den exakten Hash des unabhängig geprüften Index. Sein tatsächlicher Nachlauf
und die vier vorangehenden Komponenten bestehen. Die zuvor gescheiterte
54er-Erwartung und der erste lokale Harnessfehler bleiben in den Belegen
erhalten; eine neue vollständige Remote-CI wird daraus nicht abgeleitet.
Belege: [ursprünglicher Integrationsentwurf](https://github.com/enpasos/skillpilot/tree/feat/skill-graph-ci-contracts/qa-artifacts/ci-contract-audit/2026-11-07/economics-fixed74-authority-integration-candidate),
[korrigierter Nachfolger](https://github.com/enpasos/skillpilot/tree/feat/skill-graph-ci-contracts/qa-artifacts/ci-contract-audit/2026-11-07/economics-fixed74-argument-limit-successor),
[Root-Gegenprüfung](https://github.com/enpasos/skillpilot/tree/feat/skill-graph-ci-contracts/qa-artifacts/ci-contract-audit/2026-11-07/economics-fixed74-independent-integration-review),
[Anwendung](https://github.com/enpasos/skillpilot/tree/feat/skill-graph-ci-contracts/qa-artifacts/ci-contract-audit/2026-11-07/economics-fixed74-active-integration)
und [wiederkehrender CLI-Test samt rotem Ausgangsfall](https://github.com/enpasos/skillpilot/tree/feat/skill-graph-ci-contracts/qa-artifacts/ci-contract-audit/2026-11-07/fixed74-cli-limit-regression).

## Tatsächlicher Gesamt- und Remote-Stand

Die [Quittung des regulären Gesamtberichts und direkten Floorchecks](powi-four-fixed74-normal-cqr-producer-2026-11-07.json)
belegt einen normalen Generatorlauf mit allen zehn Karten-Vorprüfungen,
unveränderten 1.009 geschützten Eingaben und anschließendem Floor-Exit 1.
Nur die beiden tatsächlich veränderten generierten CQR-Dateien wurden
übernommen. Alle 21 Zielmengen und Meilensteine bleiben gleich.

Der Remote-Lauf auf `6451880` ist getrennt: sechs Hauptjobs und alle vier
Nebenworkflows bestehen. Frontend scheitert an der erwarteten
Fortschrittsanzeige; Curriculum scheitert am veralteten Quellenindex vor
der Meilensteinprüfung. Er enthält diese anschließenden PoWi- und
74-Kontext-Änderungen noch nicht. Der neue lokale Gesamtbericht und seine
Komponentenprüfungen sind keine bestandene Remote-CI.

Die vollständige Informatik-Scope- und Materialüberarbeitung bleibt privater
Entwurf. Der unabhängige Review fand konkrete Rechte-, Darstellungs- und
Bewertungsfehler. Die alten Ergebnisbedeutungen, eingefrorene PR-83-Arbeit
und aktiven Informatikdaten bleiben erhalten.
