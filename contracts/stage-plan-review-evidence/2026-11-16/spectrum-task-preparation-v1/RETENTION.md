# Prüfbarkeit der kompakten Aufbewahrung

Die lesbaren Ergebnisse stehen in `native-effect-summary.actual.json`,
`full21-quality-and-floors.actual.json` und
`native-effect/task-scope-addendum.actual.json`. Das Addendum präzisiert die
unveränderte v1-Receipt: Die beiden konkret untersuchten Ziele sind in den drei
kombinierten BY-G9-Kontexten vorhanden; ihre Abwesenheit in den nationalen und
den untersuchten Einzelfach-Kontexten ist kein erfolgreicher Test derselben
Lernaufgabe. Die Receipt und die ursprünglichen `tmp`-Artefakte bleiben erhalten.

`validation-retention.actual.json` bindet jeden ursprünglichen Pfad, Umfang und
SHA-256 sowie die tatsächlich eingecheckte Repräsentation. Die großen Daten
liegen als XZ-komprimiertes JSON vor. Bei ursprünglich bereits komprimierten
GZIP-Dateien bezeichnet `xz-gzip-content` den entpackten JSON-Inhalt; der Name
und die im Manifest gespeicherten Parameter machen diese Transformation
ausdrücklich. Die JSON-Inhalte können unabhängig von der GZIP-Rekonstruktion
mit `xz --decompress --stdout DATEI.xz` gelesen werden.

Die 29 gebundenen Validierungsartefakte benötigen zusammen **4.095.617 Byte**
und stellen **117.720.124 Byte** ursprünglicher Dateien wieder her. Zuvor
benötigten schon die ersten 26 aufbewahrten Dateien 104.130.316 Byte. Der
vollständige Wiederherstellungsaufruf endete mit Exit-Code 0: Alle 29
Originaldateien und der separat referenzierte Java-Exporter stimmen in Umfang
und SHA-256 überein. Zeit, Skript-Hash und Aufruf stehen im Feld
`restorationVerification` des Manifests.

Die bytegenaue Rekonstruktion der ursprünglichen GZIP-Dateien wurde gesondert
geprüft. Sie verwendet den ursprünglichen zehn Byte langen Header,
Deflate-Level und CRC-/Größen-Footer. Für die Java-API-Exporte ist Python-zlib
**1.2.11**, für die Node-Karten Node-zlib **1.3.1-e00f703** erforderlich
(geprüft mit Python 3.12.9 und Node v20.20.2). Diese konkrete
Rekompression ist versionsabhängig. Das Skript verweigert abweichende
Kompressor-Versionen und prüft sowohl den dekomprimierten Payload als auch die
rekonstruierte Originaldatei mit Umfang und SHA-256; ein abweichendes Ergebnis
wird niemals als Original akzeptiert. XZ-Dekompression allein benötigt diese
Kompressor-Versionen nicht.

Vom Repository-Wurzelverzeichnis aus prüft der folgende Aufruf sämtliche
Originaldateien in einem automatisch entfernten temporären Verzeichnis:

```bash
python3 contracts/stage-plan-review-evidence/2026-11-16/spectrum-task-preparation-v1/restore-validation.py
```

Für eine dauerhafte Wiederherstellung wird ein **neues** Zielverzeichnis
angelegt; bestehende Dateien und das ursprüngliche `tmp` werden nicht
überschrieben:

```bash
python3 contracts/stage-plan-review-evidence/2026-11-16/spectrum-task-preparation-v1/restore-validation.py --restore-under /tmp/spectrum-evidence-restored
```

Die ursprünglichen relativen `tmp/...`-Pfade entstehen dann unter diesem
Verzeichnis. Das Manifest enthält außerdem einen Hash-Verweis auf den schon
aufbewahrten Sechs-Kontexte-Exporter `ExportSubjectFocusInputs.java`; seine
Bytes werden nicht dupliziert. Der ursprüngliche 72-Kontexte-Exporter liegt
zusätzlich als `native-effect/ExportApiInputs.java.txt` vor. Die separaten
Review-Dateien und der frühere CI-Job-Log sind durch `retention.actual.json`
gebunden. Die Aufbewahrung belegt vorhandene lokale Messungen und Prüfungen;
sie ersetzt keinen erfolgreichen aktuellen Main-CI-Lauf.
