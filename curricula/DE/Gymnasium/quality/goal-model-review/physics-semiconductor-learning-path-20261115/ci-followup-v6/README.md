# Tatsächliche CI-Befunde und begrenzte Reparatur

Der erste vollständige Lauf von PR #157 am Kopf
`5bf8228635aed4eee780fdb98f4b7ee2af6d480a` endete mit sechs fehlgeschlagenen und acht erfolgreichen Jobs. Der
[terminale Zustand aller 14 Jobs](first-ci-terminal-jobs.actual.json) ist erhalten.
Die früher
[beobachteten Jobzustände](verification-summary.actual.json) sind ein
zeitgebundener Zwischenstand; sie behaupten keinen erfolgreichen Gesamtlauf.
Die [unabhängige technische Gegenprüfung](independent-technical-review/review.md)
bestätigt die zunächst fünf untersuchten Reparaturen. Der zuletzt beendete
Backendjob ergänzt drei veraltete Mengentests; die konkrete ID-Abweichung wird
separat nachvollzogen. Integration und frische Main-CI bleiben
separate Anforderungen.

| Tatsächlicher Fehler | Begrenzte Korrektur und Nachweis |
| --- | --- |
| 20 Bilddatei-/Promptbefunde | Vier Promptdateien erhalten die vom vorhandenen Vertrag verlangten Namen. Das primäre Materialklassifikationsbild erhält den UUID-Dateinamen. Drei Aufgabenabbildungen werden als Aufgabenmaterial eingeordnet. Sämtliche Bildbytes und alten URLs bleiben erhalten; alte Bildpfade sind einzeln mit ihrem SHA-256 im vorhandenen historischen Manifest gebunden. Aktuelle Primärpfade bleiben strikt, historische Varianten erlauben ausschließlich einen sicheren alphanumerischen Suffix. Die [gezielte Reproduktion](scoped-validation.actual.json) reproduziert alle 20 Fehler und drei weiterhin fehlschlagende Negativfälle. Der [vollständige aktuelle Bildcheck](logs/all-runtime-assets.actual.txt) besteht für 2.571 Links in 21 Katalogen. |
| RP-Voraussetzungstest hängt an Listenplatz 37 | Der Test verlangt innerhalb desselben Abschnitts genau ein Element mit der unveränderten Ziel-ID und Rolle. Die tatsächlichen [sechs Routentests](logs/routes.actual.log) einschließlich aller 64 Landes-/Kurssichten bestehen. Es wird keine erwartete Rollenmenge verkleinert. Der finale Filter prüft vor dem ID-Zugriff ausdrücklich `kind === 'goalEntry'` und wahrt damit auch den typisierten Knotenzugriff. |
| Veralteter Physik-Nenner im Einheitenwerkzeug | 478 wird zu 481: genau die drei neuen Inhaltsziele `9f265f49`, `dc55adac`, `77ab31a9`; keine bisherige Inhalts-ID entfällt. Der [Quellencheck](logs/unit-assessments.actual.log) besteht für die unveränderten drei Einheiten. |
| Veralteter Mathematikumfang im Paketprofil | Die erste Lieferung ergänzt genau vier Übungsaufgaben: 1.255 wird zu 1.259, weiterhin 807 gewöhnliche Inhaltsziele. Die v1.2-Ableitung wird mit demselben Umfang erzeugt und nativ geprüft. Die anschließend zusammengeführte K2-Ergänzung enthält drei weitere Aufgaben und benötigt deshalb 1.262; ihre eigene Messung und Profilaktualisierung stehen im K2-Nachweis. |
| Veraltetes Transparenzinventar | Das vorhandene Werkzeug misst sechs erlaubte Bestandsfelder neu. Für die erste Reparatur sind es 6.538 Ziele und 2.571 Primärbilder; übrige Medienhashes, Herkunfts- und Freigabeangaben bleiben erhalten. [Gemessene Änderungen](inventory-layer-a-delta.actual.json) und [normaler Inventarcheck](logs/ai-transparency-normal.actual.log) sind erhalten. Die spätere K2-Ergänzung erhöht die tatsächliche Zielzahl auf 6.541 und wird gesondert neu gemessen. |

Der sechste Fehler betrifft drei Backendtests mit zusammen 64 veralteten
Größenannahmen. Der [vollständige ID-Abgleich](../../backend-reviewed-seed-fixture-repair-20261115/README.md)
reproduziert alle 128 Baseline-Konfigurationen und alle 64 Zahlenpaare aus
dem ersten CI-Lauf. Biologie und Chemie bleiben in sämtlichen 64 Konfigurationen
unverändert. Die Tests prüfen jetzt auch exakte ID-Mengen. Der abschließende gezielte
Lauf besteht mit 3/3 Tests, null Fehlern und unveränderten tatsächlichen
Seed-, geschlossenen Lernziel- und Vorbereitungsnachweisen für alle 128
Konfigurationen; der dortige Abschlussbeleg bindet das terminale XML und
die tatsächlichen Konsolenlogs. Der vollständige Backend-Lauf bleibt Teil
der frischen Remote-CI.

Die [gemeinsame lokale Validierung](integrated-validation/consolidated-local-validation.actual.json)
belegt den vollständigen Anwendungsbuild einschließlich fünf Lernzielbüchern,
die sequentielle aktuelle Qualitätsberechnung und die unveränderten
Mindeststandards für 21 Kataloge und zwölf Routen. Alle fünf konfigurierten
tiefen Fachprüfungen sind vollständig: Mathematik 807, Physik 481, Chemie 455,
Biologie 397 und Wirtschaftswissenschaften 346, jeweils alle sechs Komponenten
und null Blocker. Die Schema- und UUID-Logs sind im selben Verzeichnis erhalten.

Der erste gemeinsame Statuslauf überschnitt sich mit dem erneuten Kopieren
der Bilddateien durch den Build und meldete nur 585/807 aktuelle
Mathematik-Bildnachweise. Sein nachfolgender Floor-Check scheiterte; dieser
Stand wurde nicht angenommen. Im unmittelbaren Dateinachvergleich waren alle
aktuellen Pixelhashes, Freigaben und Bildverweise richtig. Ein sequentieller
Versuch wurde außerdem mit Exit 143 unterbrochen; die Ursache ist nicht
nachgewiesen. Der danach vollständig beendete sequentielle Lauf erreicht
807/807, ohne Änderung der Mathematik-V-Datei oder einer Qualitätsregel.
Alle Fehlversuche und der erfolgreiche Abschluss sind getrennt erhalten.
Die Überschneidung ist eine plausible Erklärung, keine aufgezeichnete
Einzeldatei-Ursachenkette.

Die vier kanonischen Physikänderungen betreffen ausschließlich Bild-URLs;
[der vollständige Feldvergleich](canonical-field-changes.json) und die
[semantischen Bindungen](native-semantic-binding-delta.json) sind erhalten.
Die drei Aufgaben behalten Text, Lösung, Rubrik, Abdeckung und Identität;
ihre Bilder sind bytegleich. Bei `7badac4d` bleiben Zieltext, Voraussetzungen
und vollständiges Evidenzprofil unverändert. Weil der aktive Bildpfad Teil
des Revieweingangs ist, wurden trotzdem zwei neue unabhängige aktuelle
D-Runden durchgeführt, tatsächlich beide `keep`/Profil `none`. Die native
Auflösung ist vollständig validiert und aktiviert. P und V beruhen auf erneut
vollständig gelesenem Inhalt und tatsächlich betrachteten unveränderten
Bildpixeln. Es erfolgt keine rückwirkende Umschreibung historischer Reviews.

Die [aktuelle Physikprüfung](logs/full-physics-deep.actual.log) besteht für
481/481 Inhaltsziele, alle sechs Qualitätskomponenten, ohne Blocker.
Die [Buchregression](logs/physics-goal-book-inputs.actual.log) besteht ebenfalls.
Das ist ein lokaler Nachweis des aktuellen Physikstands und keine menschliche
Abnahme, Lernendenbeobachtung oder bestandene Remote-CI.

Reproduzierbare aktive Befehle aus `app/`:

```sh
npm run check:goal-visualization-assets
npm run test:physics-goal-book-inputs
npm run quality:positive-goal-evidence:check -- --config=curricula/DE/Gymnasium/quality/goal-evidence/2026-11-15/semiconductor-ci-asset-path-current-v6/positive-evidence.config.json
npm run quality:goal-description-rollout-batch -- finalize --config curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-11-15/semiconductor-ci-asset-path-current1-v6.config.json
```

`source-locator-map.json` belegt die bytegleiche Übernahme der tatsächlichen
lokalen Ausgaben. Die Quelleninputs, V9, frühere Reviewdateien und
Lernendenstände wurden nicht geändert. Generierte Backend-Bildkopien werden
vom normalen Runtime-Asset-Schritt reproduziert und nicht als neue gepflegte
Quelldateien eingecheckt.
