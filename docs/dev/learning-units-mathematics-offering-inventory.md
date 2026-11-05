# Mathematik: festgehaltenes Angebotsinventar für die Lerneinheiten

Stand: 5. November 2026. Dieses Inventar legt den anfänglichen Angebotsumfang der
**Gymnasium-Mathematik-Korrektur** fest. Es ist keine Abnahme neuer Lerneinheiten.
Die maschinenlesbare [Momentaufnahme](learning-units-mathematics-offering-inventory.json)
enthält konkrete Scope- und Zielidentitäten, verlustfreie Target-/Supportzuordnung,
Quellendigest und die bereits vorhandenen offenen Hierarchiebefunde.

## Tatsächliche Einstiegspfade

Die native Messung verwendet `CurriculumPersonalizationPlanner`, dessen echte
Auswahlaktionen und `LearnerService.getGoalProjection`; Komposition, Kursunion,
Target-/Supportrollen und atomare Voraussetzungen stammen aus dem Backend.
Die deklarativen WebGUI-Angebote werden zusätzlich durch denselben Backendpfad
aufgelöst. Eine zweite Projektionsimplementierung wird nicht eingeführt.

| Zähler | Frisch gemessener Umfang |
| --- | ---: |
| Native vollständige Planner-Konfigurationen | 140 |
| Deklarierte WebGUI-Konfigurationen | 154 |
| Gemeinsame Konfigurationen | 112 |
| Vereinigungsmenge der angebotenen Einstiegskonfigurationen | **182** |
| Bundesländer | 16 |
| Atomare Mathematikziele in der Vereinigungsmenge | 978 |
| Davon `curricularAtomic` im gebundenen Ledger | 807 |
| Fehlgeschlagene Projektionen / Voraussetzungskompilationen | 0 / 0 |
| Scopes mit mehrfachen sichtbaren Zielpfaden | 12 |

Brandenburg, Berlin und Baden-Württemberg besitzen im geführten Planner je
sieben dauerneutrale Konfigurationen; die WebGUI deklariert dort zusätzlich
G8-/G9-Varianten. Sie bleiben als unterschiedliche angebotene Konfigurationen
erhalten. Dazu kommen sieben bundesweite `ALL`-Konfigurationen. Sek I hat im
nativen Planner kein zusätzliches Kursprofil. Die 182 sind keine Zielanzahl und
keine Anzahl bestandener Lerneinheiten. Frühere Zahlen wie 161 oder 154 werden
nicht als neue Erfolgsquote übernommen.

Die zwölf offenen Hierarchiefälle betreffen GK+LK in BW (sechs Varianten), BY
(zwei) und HE (vier). Erfolgreiche Projektion bedeutet daher noch keine fachliche
oder strukturelle Gesamtfreigabe. Die Momentaufnahme hält jeden betroffenen
Zielbezeichner fest; sie bereinigt oder verschweigt den Befund nicht.

## Bewusste Fachgrenze im öffentlichen Katalog

`LandscapeService.getBaseCurricula(false)` liefert die tatsächlich angebotenen
Basiskurrikula. Eine zusätzliche Suche nach Mathematik in deren nativer Closure
findet **48 Modulvorkommen unter sechs Basiskurrikula**, keine 48 selbständig
wählbaren Mathematikangebote:

| Wählbares Basiskurrikulum | Gefundene Modulvorkommen | Behandlung |
| --- | ---: | --- |
| Gymnasium (DE) | 1 | Dieses Inventar: kanonische Mathematik mit allen 182 Einstiegskonfigurationen. |
| Bachelor Mathematik (TUM) | 39 | Eigener Hochschulstudiengang mit inneren Modulen, außerhalb dieser Gymnasium-Korrektur. |
| Bachelor Informatik (TU Darmstadt) | 2 | Mathematikmodule innerhalb eines anderen Studiengangs, außerhalb dieser Korrektur. |
| Berufsoberschule Bayern | 1 | Eigenes Schulangebot, außerhalb dieser Korrektur. |
| MIT OpenCourseWare Foundations | 4 | Mathematikmodule des eigenen MIT-Angebots, außerhalb dieser Korrektur. |
| Master Theoretische und Mathematische Physik (TUM) | 1 | Namens-/Fachtreffer in Physik; kein weiteres eigenständiges Mathematikfach. |

Die JSON-Datei nennt die exakten Basis- und Modul-IDs. Die historischen
Hessen-Sek-I-/Sek-II- und Bayern-Gymnasium-Einstiege sind im normalen nativen
Katalog ausgeblendete bzw. Kompatibilitätseinträge. Ihre Geschichte bleibt
erhalten; sie werden nicht als zusätzlich neu umgesetzte Angebote ausgewiesen.

Nur die kanonische Gymnasium-Mathematik besitzt in der gebundenen vorhandenen
Qualitätsstatusdatei den Eintrag M7. Für die anderen gefundenen Module enthält
diese Statusdatei keine entsprechende Abnahme. Das ist eine Aussage über diese
Quelle, keine neue Qualitätsbewertung jener Angebote. Der vorhandene Status
vom 26. Oktober wird als datierte Maschinen-QA-Momentaufnahme gelesen; neue
Verträge müssen ihre eigenen erforderlichen Prüfungen bestehen.

## Nachnutzung und Reproduktion

PR #79 enthält 39 neue Prüfungsidentitäten und 35 Änderungen gewöhnlicher Ziele
zu Prüfungen. Die 35 ursprünglichen Kompetenz-IDs und ihre Ergebnisbedeutung
bleiben erhalten; stärkere Prüfungsaufgaben brauchen eigene stabile Identitäten.
Bestehende Aufgaben, Lösungen, Rubriken, unabhängige Inhaltsreviews,
Quellenauszüge und begrenzte Generator-/Scope-Fixtures werden paketweise geprüft.
Bedarfsableitung mit Stopp an gemeisterten Zwischenzielen, Full-PC-Ownership und
historische Erfolgsquoten sind keine übernommenen Abnahmekriterien.

```bash
cd app
npx tsx scripts/learningUnitsNativeMathInventory.test.ts
npx tsx scripts/learningUnitsNativeMathInventory.ts --publish-snapshot
```

Der Adapter kompiliert nur die benötigten Java-Klassen und nutzt die vorhandenen
Backenddienste mit einem ungespeicherten Lerner und gemockten Repositories.
Er schreibt ausschließlich Inventurartefakte unter `tmp/math-learning-units/`;
`--publish-snapshot` aktualisiert zusätzlich die öffentliche JSON-Momentaufnahme.
Die private vollständige Messung bindet 8.266 tatsächlich geöffnete Runtime-
JSON-Eingaben; öffentlich stehen der Manifestdigest und die maßgeblichen
Einzeldigests. `--report-only` prüft bestehende Bindungen auf Drift und erzeugt
Berichte erneut. Kein Mastery-/Recallwrite, Deployment oder Hosttest findet statt.
