# Archiv: abgebrochener Lerneinheiten-Zwischenstand

Stand: 6. November 2026. Dieser Archivbranch bewahrt die gesamte bisherige
Arbeitslinie einschließlich lokal ergänzter Dateien. Er ist keine freigegebene
Curriculumeinteilung und kein Merge- oder Deploymentkandidat.

## Herkunft und Wiederaufnahme

- Bisheriger Arbeitsbranch: `feat/mathematics-learning-units`.
- Letzter Commit vor der Sicherung: `614057658d`.
- Bisheriger Draft: [PR #82](https://github.com/enpasos/skillpilot/pull/82).
- Ältere Bausteinquelle: [PR #79](https://github.com/enpasos/skillpilot/pull/79).
- Frisch abgerufene Neustartbasis: `0ce5a8d791eeb9783a919195fd8590bfb79f3595`.

Die gesamte historische Commitfolge bleibt über diesen Branch erreichbar.
Der zusätzliche WIP-Commit sichert alle beim Neustart vorhandenen Änderungen
und nicht ignorierten neuen Dateien. Ungeprüfte Kandidaten bleiben Kandidaten.
Insbesondere wurde der frühere Zuschnitt aus überwiegend kleinen Prüfungshüllen
vom Product Owner verworfen; seine vorhandenen Prüfberichte bestätigen keinen
fachlich akzeptierten Zuschnitt.

## Paket für unabhängige KI-Entwürfe

[external-ai-review.zip](external-ai-review.zip) enthält den eigenständigen
Konzepttext, den Arbeitsauftrag sowie vollständige kanonische Mathematik und
Physik vom oben genannten Main-Commit, jeweils als JSON und identische TXT.
Manifest, Inventare und Lizenzhinweise sind enthalten. Der Datensatz ist eine
Grundlage für neue Entwürfe und enthält keine behauptete Gesamteinteilung.

ZIP-SHA-256: `ac4e35775ea4f5072fa4827158458f0e7ccb5d90d5d5592ae5c9ab1f9bddc5c7`.

## Lokale Begleitunterlagen

Die zusätzliche lokale Sicherung liegt unter
`tmp/learning-units-restart-backup-20261106/`. Sie enthält den Arbeitsstand,
Prüfsummen, das KI-Paket und ausgewählte Konzept-/Reviewunterlagen. Das ursprünglich vom
Owner bereitgestellte Metzler-PDF war beim Sichern nicht mehr am angegebenen
Originalpfad vorhanden. Erhaltene Auswertungen werden lokal gesichert; das
Fremd-PDF ist kein Bestandteil des öffentlichen Archivs.

Die umfangreichen ursprünglichen temporären Bestände, darunter
`tmp/math-learning-units/` und `tmp/approach-review-20261101/`, bleiben am
Originalort unverändert erhalten. Build- und Cachebestände sind kein Bestandteil
des öffentlichen Git-Archivs; Umfang und Grenzen der Zusatzsicherung stehen
in deren eigenem Manifest. Es wurde kein `git clean` ausgeführt.

## Gezielte Nachnutzung

Konzepte, Einzelaufgaben, Quellenbefunde und technische Bausteine können einzeln
geprüft wiederverwendet werden. Die bestehende Einteilung, zeitgebundene
Fortschrittsschätzungen und damalige Testergebnisse werden nicht pauschal als
aktueller Sollzustand oder Abnahme übernommen. Ein Neustart erfolgt auf Main.
