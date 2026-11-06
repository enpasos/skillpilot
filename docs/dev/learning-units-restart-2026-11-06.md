# Lerneinheiten: gesicherter Neustart vom 6. November 2026

> Historischer Neustart- und Sicherungsstand. Der anschließend beauftragte
> [Mathematik-/Physikplan](mathematics-physics-learning-units-plan.md) löst die
> unten beschriebene Wartephase ab. Das neue Goal ist aktiv; die abgebrochene
> alte Zerlegung bleibt als Archiv erhalten und wird nicht fortgesetzt.

Der bisherige Einheitenzuschnitt wurde abgebrochen. Die nächste Arbeit beginnt
auf einem frischen `origin/main` mit fachlichen Entwürfen und deren Prüfung.
Die alte Umsetzung bleibt als Bausteinbestand erhalten. Sie ist keine Vorgabe
für die neue Einteilung und wird nicht als Ganzes übernommen.

## 1. Basis und Sicherung

- Neustartbasis: `main` bei
  [`0ce5a8d791eeb9783a919195fd8590bfb79f3595`](https://github.com/enpasos/skillpilot/commit/0ce5a8d791eeb9783a919195fd8590bfb79f3595),
  am 6. November frisch abgerufen.
- Neuer Arbeitsbranch: `docs/learning-units-restart-20261106`.
- Archivbranch:
  [`archive/learning-units-pre-restart-20261106`](https://github.com/enpasos/skillpilot/tree/archive/learning-units-pre-restart-20261106).
- Vollständiger Git-Checkpoint:
  [`e66fb62c45fd15cde295b09cd9f4a12f13ef4cc9`](https://github.com/enpasos/skillpilot/commit/e66fb62c45fd15cde295b09cd9f4a12f13ef4cc9).
  Er bewahrt die historische Commitfolge, die vier zuvor nur lokalen Commits
  und die beim Neustart offenen Änderungen einschließlich 79 neuer Dateien.
- Bisherige Arbeitslinien:
  [PR #82](https://github.com/enpasos/skillpilot/pull/82) und
  [PR #79](https://github.com/enpasos/skillpilot/pull/79).
  Ihre Ergebnisse gehören zu den damaligen Revisionen und Konzeptständen.

Das [Archivverzeichnis](https://github.com/enpasos/skillpilot/blob/e66fb62c45fd15cde295b09cd9f4a12f13ef4cc9/docs/archive/learning-units/2026-11-06/README.md)
erklärt Inhalt und Grenzen. Lokal liegt eine zusätzliche Sicherung unter
`tmp/learning-units-restart-backup-20261106/`, mit Pfadverzeichnis, Git-Diffs
und Prüfsummen der kopierten Dateien. Umfangreiche ursprüngliche temporäre
Bestände bleiben am Originalort erhalten; es wurde keine Bereinigung ausgeführt.
Die Zusatzsicherung ist kein vollständiges Datenträger-Backup.

 

## 2. Erster neuer PR: fachliche Grundlage

Der erste PR übernimmt die geprüften
[Gestaltungskriterien und Beispiele](../concept/skill-graph/learning-unit-design-and-examples.md)
und gleicht die übergeordneten Konzepte sowie die illustrierte Graphdefinition
damit ab. Der bestehende Umsetzungsplan erhält einen historischen Status.
Produktcode und die angebotenen Curricula entsprechen dabei weiterhin der
genannten Main-Basis. Die Dokumentation gibt keine neue technische Sperre oder
automatische Umsetzung frei.

Die wichtigste Frage lautet: Welche zusammenhängende Fähigkeit muss solide
selbstständig anwendbar sein, bevor darauf aufgebaut wird? Vorhandene Prüfungen,
Zielzahlen und Kapitelüberschriften bestimmen diese Grenze nicht allein.

## 3. Material für unabhängige Entwürfe

Das [KI-Paket herunterladen](https://github.com/enpasos/skillpilot/raw/e66fb62c45fd15cde295b09cd9f4a12f13ef4cc9/docs/archive/learning-units/2026-11-06/external-ai-review.zip).
Es enthält:

- ein kompaktes deutsches Konzeptpapier mit Vereinbarungen und offenen Fragen;
- einen eigenständig nutzbaren Arbeitsauftrag für Mathematik, Physik oder beide;
- die vollständigen kanonischen Mathematik- und Physikdateien von der genannten
  Main-Basis, als bytegleiche JSON- und TXT-Dateien;
- Lernzielinventare, begrenzte Referenzprüfung, Quellen und Lizenzhinweise.

ZIP-SHA-256:
`ac4e35775ea4f5072fa4827158458f0e7ccb5d90d5d5592ae5c9ab1f9bddc5c7`.
Das Paket ist außerdem weiterhin unter
`tmp/skillpilot-lerneinheiten-review-2026-11-06.zip` verfügbar.

Der kanonische Bestand ist keine einzelne verbindliche Kursvariante.
Eine vorgeschlagene Gliederung muss ihren Geltungsbereich und den Umgang mit
unterschiedlichen Angeboten erklären. Ein KI-Entwurf ist eine Diskussionsgrundlage,
kein automatisch akzeptierter Zuschnitt.

## 4. Was wir gezielt nachnutzen können

| Bestand | Prüfung vor einer Übernahme |
| --- | --- |
| Konzepttexte und anschauliche Beispiele | Aktuelle Vereinbarungen und offen gebliebene Fragen vollständig wiedergeben. |
| Einzelaufgaben, Rubriken und Lernkarten | Vollständige Zielbedeutung, selbstständige Anwendung, faire normale Bewertung und Herkunft prüfen. |
| Quellen-, Angebots- und Voraussetzungenbefunde | Am aktuellen Main-Stand reproduzieren; Befund und vorgeschlagene Korrektur auseinanderhalten. |
| Technische Kernlogik, Schnittstellen und Tests | Mit dem neu bestätigten Konzept abgleichen; eine damalige bestandene Prüfung ersetzt diesen Vergleich nicht. |
| Frühere Einheitenkataloge und Generatorausgaben | Historische Kandidaten. Die verworfene Zerlegung wird nicht durch neue Überschriften reaktiviert. |

## 5. Nächster fachlicher Entscheidungspunkt

1. Unabhängige Vorschläge anhand desselben KI-Pakets einholen und vergleichen.
   Zuerst die Beispiele Zahlverständnis Klasse 5 und Kinematikeinstieg konkret
   prüfen; damit wird der Gesamtumfang von Mathematik und Physik nicht verkleinert.
2. Für alternative Grenzen jeweils Lernversprechen, Voraussetzungen, direkten
   Erwerbsort und selbstständigen Anwendungsnachweis sichtbar machen.
   Innere Lernabschnitte und Zwischenprüfungen erzwingen keine Untereinheiten.
3. Den noch offenen Zusammenhang von Zwischenprüfung, späterem transitivem
   Bedarf und globaler impliziter Beherrschung klären. Der fachliche Schnitt
   darf nicht nur eine bisherige Ableitungsregel bequem bedienbar machen.
4. Erst nach dieser fachlichen Entscheidung die Umsetzung in kleine, getrennt
   prüfbare und deploybare Schritte planen. Jeder spätere Meilenstein muss den
   weiter funktionierenden Produktbetrieb, passende Tests und einen sichtbaren
   Smoke-Test berücksichtigen.

Bis dahin wird der alte Ausbau nicht fortgesetzt. Es gibt keinen neuen
Fertigstellungsprozentsatz für einen ungeprüften Zuschnitt und keinen Auftrag,
die Curricula im Hintergrund bereits neu zu schneiden.
