# Assessment-CI: unnötigen Rastermirror aus dem Authoring-Checkout entfernen

Der [Assessment-Run 42278464876](https://github.com/enpasos/skillpilot/actions/runs/42278464876)
am PR-Mergekopf `8af8c99733358d7960c04cf19c9824ac9b866f0a` endet im Authoring-Job
bereits beim Checkout: `git checkout` beginnt um 19:18:37 UTC, die Abbruchmeldung
kommt um 19:38:34 UTC. Alle eigentlichen Authoring-Prüfungen wurden übersprungen.
Der Backend-/PostgreSQL-Job desselben Runs besteht. Der
[maschinenlesbare Abschlussbeleg](assessment-authoring-checkout-repair-2026-11-06.json)
bindet die direkt gelesenen GitHub-Schritte und ausgewählte Logzeilen.

Der bestehende Nicht-Cone-Checkout nimmt `/app/` auf und importiert damit auch
`app/public/assets/goal-visualizations/`. Das sind im geprüften Git-Snapshot
2.684 Dateien mit **5.157.865.274 Bytes**: 2.658 PNG/JPG, 18 SVG und acht
Markdown-Dateien. Die bisherigen Ausschlüsse
unter `curricula/` erfassen diese zweite Kopie nicht. Die Reparatur ergänzt
genau den bereits im Backendjob verwendeten expliziten Ausschluss:

```text
/app/
!/app/public/assets/goal-visualizations/
```

Alle vorhandenen Kommandos, 20 Minuten Jobtimeout und Fehlerwirkungen bleiben
gleich. Kanonische Daten, Verträge, Schemas, Beurteilungsregeln, Scopes und der
eingefrorene GK24-Draft sind unverändert.

## Tatsächliche Auswahl und benötigte Eingaben

Ein eigener Git-Clone mit eigenem Index und gemeinsamem lesendem Objektstore
materialisiert die wirklichen Sparse-Regeln auf Commit
`5c9ff83586c407fd9189207c38238400c74bce51`. Nur die zwei geänderten Workflow-/
Regressionsdateien werden darin privat ergänzt. Der primäre Index wird dabei
nicht geschrieben. Die Blobgrößen beziehen sich auf den festen Git-Snapshot.

| Auswahl | Dateien | Blobbytes |
| --- | ---: | ---: |
| Bisher, mit dem einzigen zusätzlich enthaltenen Mirrorpräfix | 8.090 | 6.580.511.299 |
| Tatsächlich materialisierte neue Sparse-Auswahl | 5.406 | 1.422.646.025 |
| Ausschließlich entfernter Mirror | 2.684 | 5.157.865.274 |

Der lokale Checkout aus bereits vorhandenen Objekten dauerte 7,8 Sekunden.
Das ist kein Messwert für den kalten GitHub-Netztransfer. Der alte große Baum
wurde nicht ein zweites Mal materialisiert; seine Auswahl folgt aus der
tatsächlich gemessenen neuen Auswahl und dem einzigen entfernten Präfix.

Die Profilprüfung liest die kanonischen Ziele, Abschlussprofile/-scopes und
deren Verträge. Paket- und FWU-Prüfungen verwenden vorhandene Verträge,
Python-Rekonstruktion und ihre eigenen synthetischen Daten-/RDF-Fixtures.
Die dortige `fixture-image.png`-URL ist semantische Fixturemetadaten; ein
vorhandenes Raster wird nicht vorausgesetzt oder ersatzweise als gültig erklärt.
Die Browserprüfung verwendet echte UI-Quellen mit dem bestehenden kontrollierten
HTTP-Fixture; dieses besitzt keinen Lernzielbildlink. Alle anderen Public-Daten
bleiben enthalten. Die Regression schützt unter anderem das tatsächlich
geöffnete Faviconmanifest und das Informatikdeck vor einem breiteren Ausschluss.

Der [komprimierte Eingabezensus](assessment-authoring-checkout-repair-2026-11-06/read-census.json.gz)
bindet 487 beobachtete Quelldateien mit zusammen 32.480.880 Bytes Dateiumfang.
Kein aufgezeichneter `openat`-Aufruf versucht den entfernten Rastermirror zu
öffnen. Das ist ein begrenzter Zensus erfolgreicher absoluter Dateiöffnungen,
keine vollständige Systemaufruf- oder I/O-Messung; relative und fortgesetzte
Aufrufe werden nicht als vollständig zugeordnet ausgegeben.

## Ausgeführte Prüfungen im sparsamen, schreibgeschützten Baum

Bubblewrap bindet Quellen und bestehende `node_modules` schreibgeschützt ein
und verdeckt das primäre Repository vollständig. Nur private temporäre
Ausgaben, Browserbelege und leere eigene TS-Buildinfo erhalten Schreibflächen.
Die tatsächliche Gegenprobe auf `app/package.json` scheitert mit `EROFS`,
während ein eigener Scratch-Write gelingt. Ein Rückgriff auf den aktiven
Repositorymirror ist dadurch ausgeschlossen.

Alle neun unveränderten Jobkommandos bestehen:

- Profilprüfung: ein echtes Profil; 27 gemeinsame semantische Fixtures.
- Python-Paketvertrag: neun Tests; FWU-Builder: sieben Suites einschließlich
  26 JSON↔RDF-Rekonstruktions-/Mutationsprüfungen.
- Vollständiges bestehendes `tsc -b --pretty false`, Completion-API/Tree/UI,
  SRS-Import-Vertrauensgrenzen und SkillPilot-ID-Einstieg.
- Vollständige reale Cockpit-/Providerwahl-Browsersuite: Exit 0 nach 219 Sekunden,
  elf synthetische Screenshots dauerhaft unter `tmp` gesichert.
- Bestehende harte Source-Isolation-/APT-Regressionssuite: vier Tests,
  null Fehler und null Skips, ebenfalls im sparsamen RO-Kontext.

Die neue Regression führt Git selbst auf einer kleinen inerten Pfadfixture aus.
Sie belegt zwei echte Gegenfälle: Ohne den App-Mirror-Ausschluss kehrt das Raster
zurück; ohne die nachgelagerte Einbeziehung von `quality/assessment-completion/`
verschwindet der erforderliche Abschlussreview. Benötigte Code-/Schema-/
Profil-/Scope-/Review- und nicht-Raster-Publicpfade bleiben bytegleich erhalten.

Node 20.20.2 entspricht `.nvmrc`. Die beiden Python-haltigen Paketkommandos
wurden zusätzlich mit Python 3.11.12 und den vier exakten Workflowpins erneut
erfolgreich ausgeführt. Die vorhandenen Node-Abhängigkeiten wurden lesend
gebunden; ein neues lokales `npm ci` oder eine neue entfernte CI-Ausführung
wird nicht behauptet.

Die [ausgewählten dauerhaften Belege](assessment-authoring-checkout-repair-2026-11-06/isolated-execution.json)
und [Python-3.11-Läufe](assessment-authoring-checkout-repair-2026-11-06/python311-execution.json)
enthalten Kommandos, Exitcodes, Zeiten und Rohhashes. Alle elf ursprünglichen
Dateizugriffsspuren wurden verlustfrei nach `tmp` komprimiert und durch
Entpacken bytegleich geprüft; ihr
[Storage-Inventar](assessment-authoring-checkout-repair-2026-11-06/raw-trace-storage.json)
bindet Roh- und Gzipgrößen/-hashes. Die Abschlussquittung bindet zusätzlich
die beiden Codepins und sämtliche versionierten ausgewählten Belege.

Die kleine Checkoutreparatur ist lokal vollständig geprüft. Ein neuer
entfernter Assessment-Run nach Commit/Push bleibt der Nachweis, ob auch der
kalte Checkout auf dem GitHub-Runner innerhalb seines unveränderten Budgets
abschließt. Es wurde kein Commit erstellt.
