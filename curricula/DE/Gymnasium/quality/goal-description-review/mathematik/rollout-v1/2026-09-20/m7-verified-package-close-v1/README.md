# Mathematik-M7: konsolidierter Zwischenstand

Stand: 20. September 2026. Nutzerauftrag: begonnene Arbeiten commitfähig
sichern; keine neuen Fachpakete beginnen. Die übergeordnete Zielverfolgung
ist pausiert, nicht abgeschlossen. Dies ist ein lokaler Prüfstand, kein
Commit, Remote-CI-Ergebnis oder Produktionsdeployment.

**Lokale Übergabeprüfung bestanden:** 29 maßgebliche lokale Prüfbefehle grün,
vollständiger App-Build und alle vier Lernzielbücher erfolgreich.
`commit-ready.receipt.json` fasst die letzten gültigen Ergebnisse und ihre
gehashten Eingaben zusammen. Nächster Schritt ist der Commit mit nachfolgender
CI und erst danach dem regulären Rollout.

## Maßgeblicher aktueller Nachweis

`five-gate-report.commit-ready.json` ist der letzte vollständige zentrale
Bericht dieses Zwischenstands:

| Fach | Streng abgeschlossen | D | P | A | M | V |
| --- | --- | --- | --- | --- | --- | --- |
| Mathematik | 434/797 (54,5 %) | 476 | 477 | 797 | 797 | 676 |
| Physik | 478/478 (100 %) | 478 | 478 | 478 | 478 | 478 |

Sechs zentrale Prüfungen je Fach bestanden, keine zentralen Blocker.
Mathematik netto +37 gegenüber dem vorherigen stabilen Stand 397 und +103
gegenüber der Ausgangslage 331. Der generierte Curriculum-Status bestätigt
Mathematik M6 und Physik M7. `validation.receipt.json` und
`maturity-floors.log` belegen die neun erhaltenen geschützten Untergrenzen.
Menschliche Freigaben bleiben unverändert und getrennt.

## Abgrenzung und gezielte Reparaturen

- 24 neue D-Abschlüsse: sechs aus `m7-held-seven-current-v1`, 18 aus dem
  begonnenen Stochastikpaket. 13 weitere D-Bindungen wurden wiederhergestellt,
  nicht als neue fachliche Reviews gezählt. 38 P-Profile aus dem 39er-Bündel
  sind aktuell registriert. Diese Mengen nicht zum strengen Nettozuwachs addieren.
- `geometry-route-repair.receipt.json`: das Ziel
  `4af3dfb9-7e15-5da5-8b86-0aac6c80e266` erhält den bestehenden
  Sek-II-Orientierungsanker als Voraussetzung. Die unpassenden räumlichen
  Voraussetzungen bleiben entfernt. Seine frühere D/P-Freigabe zählt nach
  dieser Kontextänderung nicht mehr; deshalb 434 statt vorläufig 435.
  Die originale Siebener-Auflösung und P-Nachweise bleiben historische Belege,
  die Registry verwendet die aktuelle Sechser-Teilmenge.
- `duration-layout-binding.receipt.json`: nur die kanonische Inputbindung
  des bestehenden Split-Layouts aktualisiert. Alle 18 nativ erzeugten Sichten
  entsprechen weiterhin exakt den bestehenden Dateien; keine neuen Layoutregeln.
- Elf zuvor unabhängig geprüfte Statistik-PNGs sind integriert. Zusätzlich
  dokumentiert `final-three-image-import.receipt.json` drei tatsächlich
  betrachtete Korrekturen: Binomialhistogramme, Exponentialverteilung und
  Konfidenzdiagramm. Diese letzten drei haben eine tatsächliche Root-Sichtprüfung,
  keine behauptete zweite unabhängige Bildfreigabe und noch keinen neuen
  vollständigen D/P-Abschluss. Die Bildpakete enthalten Prompts, Herkunft
  und Prüfentscheidungen. Originale bleiben PNG, freundlich, abstrakt und klar.
- Ersetzte aktive JPG-Dateien sind bytegleich in den zugehörigen
  Reviewarchiven wiederherstellbar gesichert. `retired-active-assets/` bewahrt
  die letzten drei ersetzten Motive. Kein Verlust historischer Prüfnachweise.

## Build und lokale Übergabeprüfung

Die ersten Diagnoseläufe fanden die fehlende Orientierungsroute, die veraltete
Split-Layout-Inputbindung und drei aktive, negativ bewertete Bilder. Ihre
Protokolle bleiben erhalten. Sie werden nicht nachträglich grün umgeschrieben;
die späteren erfolgreichen Nachweise belegen die gezielten Reparaturen.

Der erste vollständige App-Build fand außerdem ein PDF von 119645617 Bytes
bei unverändertem Limit 94371840 Bytes. Chromium expandierte kleine WebP-
Druckableitungen zu großen verlustfreien PDF-Bildströmen. Das begrenzte
PDF-Atlasprofil erzeugt deshalb JPEG-Druckableitungen vor weißem
Seitenhintergrund. Webdarstellung, Original-PNGs, Auflösung, Qualitätsparameter,
Quellhashbindungen und Größenlimits bleiben erhalten. Ein tatsächlicher
Chromium-Test prüft DCT-Einbettung und unveränderte PNG-Quelldateien.
Das neue Mathematik-PDF liegt bei 83412373 Bytes (79,5 MiB).
`pdf-image-smoke.receipt.json` bindet die tatsächliche Sichtprüfung zweier
fertiger PDF-Seiten an das Ausgabe-PDF: Diagramme, Formeln und Beschriftungen
sind lesbar und vollständig.

Maßgebliche Abschlussprotokolle:

- `build-commit-ready.receipt.json` und `build-commit-ready-01.log`:
  vollständiger App-Build einschließlich vier Lernzielbüchern, deren
  Publikationsprüfung, TypeScript und Vite.
- `tests-commit-ready.receipt.json` und zugehörige Logs:
  Renderer mit Chromium, Build-/Publikationsregressionen, aktueller zentraler
  QS-Test, Kompositionsregressionen, G8/G9-Angebote, Bildfreigaben und
  KI-Transparenzinventar. Die dortige Publikationsprüfung lief noch gegen
  die vorherige Buchausgabe und meldete deren veraltete Modellbindung.
- `post-build-commit-ready.receipt.json`: erneute Publikationsprüfung gegen
  die fertig neu gebauten Dateien sowie Shell-/Transparenz-Artefaktprüfung,
  Graphvalidierung, Lint und Dokumentationsprüfungen. Diese spätere Prüfung
  ist für den Publikationsstatus maßgeblich.
- `commit-ready.receipt.json`: zusammengefasste lokale Übergabeprüfung.

Ein erfolgreicher lokaler Build ersetzt nicht die CI des späteren Commits.
Der unveränderte normale Deploymentweg muss das Frontend samt Lernzielbüchern
und die kanonischen Runtime-Assets gemeinsam ausliefern.

## Geordnet offen / Fortsetzung

Die vollständige Liste mit Ziel-IDs und Zuständigkeiten steht weiterhin im
zentralen `in-flight-work-ledger.json`. Die unabhängigen Reviewer wurden durch
das Nutzungslimit unterbrochen; unvollständige Reviews bleiben offen:

- Statistik 20: acht Bild-KEEPs und zwölf PNG-Korrekturen sind aktiv, aber die
  vollständigen unabhängigen Beschreibungsreviews fehlen.
- Beweise/Problemlösen 20: Review-Bundle vorbereitet, keine abgeschlossenen
  unabhängigen Reviews oder registrierten P-Abschlüsse.
- Zwei Stochastik-Kontextfälle: korrigierte Bilder aktiv; vollständige D/P-
  Nachprüfung ausstehend. Drei weitere bekannte Bild-Holds mit Prompts offen.
- Die geometrische Routenreparatur und der Voraussetzungskonflikt
  `efc3506a-5f35-4d77-9498-d70a091a470b` bleiben getrennte Kontextfälle.
- Vorhandene historische Quellen-, Atomizitäts- und Migrationsfälle bleiben
  unter ihren bestehenden Zuständigkeiten reserviert.

Bei Wiederaufnahme auf diesem Stand und den zentralen Registries aufsetzen;
keine gültigen historischen Reviews pauschal neu beginnen. Zuerst offene
begonnene Fälle gezielt schließen, dann erneut gebündelt prüfen. M7 ist
ausdrücklich noch nicht erreicht.
