# Physik: pausierter Zwischenstand vom 7. September 2026

Status: lokal geprüft und commitfähig; Arbeiten abgeschlossen und angehalten.
Das Goal wurde vom Nutzer pausiert und bleibt pausiert. Kein Commit, Push,
Deployment oder neues QS-Paket wird durch diesen Zwischenabschluss gestartet.
Ausgangspunkt ist `74adc6a743d722420413ebce1c8e7e60074de3c2`.

## Umfang und ehrlicher Fortschritt

| Fach | Streng abgeschlossen | Anteil | Offen |
| --- | ---: | ---: | ---: |
| Mathematik | 424 / 797 | 53,2 % | 373 |
| Physik | 410 / 465 | 88,2 % | 55 |

Der native Fünf-Gate-Check hat keine technischen Blocker. Bei Physik sind
410 aktuelle Beschreibungsabschlüsse (D), 413 Verständnisprofile (P) sowie
jeweils 465 aktuelle Atomicity-, Memory- und Bildentscheidungen (A/M/V)
registriert. Der strenge Schnitt ist 410, nicht die Summe dieser Nachweise.
Gegenüber dem Ausgangspunkt 414/465 sind vier frühere Abschlüsse wieder offen:
Das geänderte Pauli-Ziel macht seinen versiegelten vierteiligen D036r-Batch
nicht mehr vollständig gültig. Die drei unveränderten Geschwister werden
nicht als falsch bewertet, aber auch nicht entgegen der Batchbindung einzeln
registriert. Das ist keine neue fachliche Freigabe;
unveränderte gültige Nachweise werden weiterhin verwendet. Mathematik bleibt
fachlich unverändert. M6 und alle neun geschützten Maturity-Floors bestehen.

Im aktiven Physik-Curriculum bleiben 715 Knoten und 465 curricularAtomic-Ziele.
Enthalten sind abgegrenzte bilinguale Beschreibungs-, Quellen-/Scope- und
Bildkorrekturen: unter anderem Entropie/Systemgrenzen, Carnot-Voraussetzungen,
Ein-Elektronensysteme/Pauli, Zerfallsreihen, Strömungsmodelle und vorgegebene
Nervenleitungs-Messverfahren. Es werden keine Untersuchungen an Personen
verlangt. Die 38 geänderten bestehenden Knoten enthalten auch reine Bild- oder
Metadatenkorrekturen; sie sind nicht 38 neue QS-Abschlüsse.

## Bewusst zurückgestellt

Die strukturellen Aufteilungen B035 und B040 sind nicht Teil des aktiven
Curriculums dieses Checkpoints. Ihre zwischenzeitliche Anwendung erzeugte
unvollständige Lernwege beziehungsweise Abschlussaufgaben und Scope-Konflikte.
Eine feldgenau geprüfte Rückstellung stellt die vorherigen Strukturen wieder
her, ohne unabhängig geprüfte Text-/Bild-/Quellenkorrekturen zu verwerfen.
Die M6-Untergrenze oder die Lernwegprüfer wurden nicht abgeschwächt.

- [Rückstellungsbeleg](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/deep-understanding-rollout/physics-paused-split-deferral-20260907-v1/PAUSED_DEFERRED.receipt.json): 97 geprüfte Datei-Leases, selektiv erhaltene Korrekturen und Originalpläne.
- [Neun vollständige Zielentwürfe](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/deep-understanding-rollout/physics-paused-split-deferral-20260907-v1/nine-current-goals.json.snapshot): einschließlich der zuletzt importierten Bildverweise.
- [Archivierte Bilder und QA-Bindungen](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-visualization-review/physik-20260907-deferred-split-assets/move-and-qa-receipt.json): neun Quellordner erhalten; Laufzeitkopien aus der aktiven Auslieferung entfernt und lokal wiederherstellbar verschoben. Keine Bildbytes verworfen.
- B034-Strukturplan und die Vorschläge zu neuen Abschlussaufgaben bleiben unangewendet. P040-Splitprofile und P043-Kandidaten sind nicht als Abschlüsse registriert; P025 wurde ohne neue Profile beendet.
- D043r enthält nur die erste unabhängige Runde: 20 Kandidaten, davon 16 KEEP und vier Überarbeitungsfälle. Zweite Runde und Übernahme fehlen ausdrücklich.

Die vorhandenen GK-Voraussetzungsziele in Hessen und Rheinland-Pfalz liegen
in gemischten Sek-I/Sek-II-Ansichten nun innerhalb der Sek-II-Struktur.
Ihre Mengen und Rollen `prerequisiteOnly` bleiben unverändert; sie werden
nicht als zusätzliche Sek-I-Ziele oder Lernfortschritt ausgegeben.
Die vier nachgeführten Quellenentscheidungen werden von den betroffenen
Generatoren gezielt reproduziert; auch die Pauli-Zuordnungen bleiben erhalten.
19 bereits im Ausgangscommit vorhandene sonstige
Generatorabweichungen wurden bei der Leseprüfung abgegrenzt, nicht pauschal
überschrieben oder als neue Fehler dieses Pakets behandelt.

## Abschlussprüfungen

Die 41 Curriculum-Gates sind einschließlich zweier regulär neu erzeugter
Quellenberichte bestanden: Graph mit 593 Landschaften, 297 Composition Views,
Quellenabdeckung, Memory-, Bild- und Reifegradprüfungen. Der native
Fünf-Gate-/In-flight-Check hat keine technischen Blocker. Zusätzlich bestehen
Frontend-Lint, TypeScript und fünf Python-Vertrags-/Datenprüfungen, darunter
15.387 Schema-Dateien und 10.605 UUID-Ziele. Der OpenAI-Review-Freeze sowie
die unveränderten OpenAI-/Claude-Publikationsbindungen sind geprüft.

Ein bereits im Ausgangscommit veralteter Mathe-BookModel-Prüfhash wurde rein
mechanisch nachgeführt. Alle 829 tatsächlichen Mathe-Eingabedateien sind
byteidentisch zu `74adc6a74`; der Modellcode und sämtliche inhaltlichen sowie
Publikations-Bytegleichheitsprüfungen bleiben unverändert. Die konkrete
Altstand-zu-HEAD-Herkunft ist in `math-book-fixture-head-proof.json` in der
oben verlinkten Rückstellungsakte dokumentiert. Keine Mathe-Inhalte geändert.
Die Physik-Testzahlen bilden die bereits vorhandenen 715 Knoten und
137 Assessment-Knoten ab; nur die zwei einzeln überarbeiteten bestehenden
Ein-Elektronen-/Pauli-Ziele erhalten ihre passende Klassifikations-Erwartung.

Der vollständige Backend-Check (`./gradlew check --console=plain`, Corretto
25.0.2.10.1) ist nach 16 Minuten 5 Sekunden erfolgreich abgeschlossen:
178 frische Testsuiten mit 1.566 Fällen, davon 1.565 bestanden und einer
regulär übersprungen, keine Fehler. Beide zuvor durch die unvollständige
B040-Aufteilung ausgelösten Regressionen bestehen wieder mit den unveränderten
Erwartungen: 192 Hessen-Ziele und 114 Rheinland-Pfalz-Mappingeinträge.
`backend-final-check.json` in der Rückstellungsakte dokumentiert die frischen
Ergebnisse und die unveränderten kanonischen/Testdatei-Hashes.

Die vollständige `test:goal-book-pipeline` besteht mit Node 20.20.2,
einschließlich Modell-, Renderer-, Review-Bundle-, Publikations-, Runtime- und
Workbench-Prüfungen. Anschließend bestehen `prepare:runtime-assets`,
`build:application` (TypeScript, Vite/PWA), die Prüfung beider öffentlichen
Quellenindizes und die Quellenindex-Prüfung im fertigen Build. Alle vier
Buchpublikationen sind aus ihren aktuellen Ein-/Ausgabe-Hashes verifiziert;
im finalen Build war keine erneute PDF-Erzeugung nötig. Kein Lernzielbuch-PDF
wird in Git aufgenommen. Die lokale Asset-Aufbereitung hat 48 veraltete abgeleitete
öffentliche Story-Kopien entfernt; die Quelldateien bleiben erhalten und die
Kopien sind daraus wieder erzeugbar. Keine zusätzlichen getrackten Dateien
wurden durch diese Bereinigung gelöscht.

Der abschließende `git diff --check` sowie der OpenAI-Review-Freeze- und
OpenAI-Snapshot-Check auf dem gebauten Stand bestehen. Nichtblockierende
Vite-Chunkgrößen- und Browserslist-Altershinweise sind keine neuen fachlichen
oder Sicherheitsfreigaben. Es wurde kein Commit/Push/Deployment und kein neuer
GitHub-CI-Lauf ausgeführt. Das Goal ist weiterhin `paused`; keine QS-Jobs laufen.

Lokale Abschlusslogs: `tmp/physics-paused-final-gates-20260907.nZsME7/`
(41 Curriculum-Gates, zwei Quellenbericht-Nachprüfungen separat bestanden),
`tmp/b040-goal-book-pipeline-final.G0EeUp/` (vollständige finale Pipeline,
Build und Quellenindizes) und
`/tmp/skillpilot-backend-check-20260907-kGvb3n.log` (Backend).
Die wesentlichen Ergebnisse und Wiederaufnahmebelege bleiben in diesem
Dokument beziehungsweise in der verlinkten Rückstellungsakte erhalten;
temporäre Logs sind keine zusätzlich zu committenden Quellen.

## Spätere Wiederaufnahme

Erst nach neuer Nutzerfreigabe weiterarbeiten. Maßgeblich bleiben die
[zentrale Registry](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json),
das [In-flight-Ledger](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json)
und die ursprünglichen hashgebundenen Prüfunterlagen. Reservierte Pakete sind
keine laufenden Jobs und keine zusätzlichen Abschlüsse.

Zuerst die geänderten offenen Inhalte mit aktuellen unabhängigen D-/P-Nachweisen
abschließen. Eine strukturelle Aufteilung erst als vollständiges Paket aus
Zielen, tatsächlichen Abschlussaufgaben, didaktischen Lernwegen, Quellen und
lernerseitigen Ansichten übernehmen. Archivierte Apply-Skripte nicht blind
erneut ausführen: Vorbedingungen und Hash-Leases beziehen sich auf frühere
Arbeitsstände. Bilder möglichst aus den erhaltenen geprüften Entwürfen nutzen.
Kein Neustart bereits gültiger Reviews, keine Umdeklaration von Kandidaten zu
menschlich freigegebenen Belegen. Klasseninformationen und eingefrorene
Plugin-/Runtime-/Sicherheitsverträge bleiben unverändert.
