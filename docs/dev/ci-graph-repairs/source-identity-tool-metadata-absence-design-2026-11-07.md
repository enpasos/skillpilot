# Entwurf: fehlende Tool-Locators aus einem gebundenen Baum beweisen

Dies ist ein statischer Entwurf, keine neue Ausnahme, Implementierung oder QA-Freigabe. Die zwei tatsächlichen TS-Blöcke im [Recorderbeleg](source-identity-recorder-namespace-boundary-2026-11-07.json) bleiben historische Messergebnisse. Für diese Planung wird kein weiterer Node-Resolvername einzeln freigegeben.

Der kleinste wiederverwendbare Anker ist die vorhandene vollständige Dependency-Capture-Grenze in `scripts/identity_qa_private_capture.py`. Ihr extern gepinnter Baum kann sowohl vorhandene Dateiinputs als auch die Abwesenheit konkreter Locator-Komponenten belegen. Der Locatorname allein, ein Fehlertext oder die Bezeichnung `node_modules` begründen keine Ausnahme.

## Vorhandene Bausteine

- `dependency_inventory` (Zeile 273) inventarisiert den vollständigen tatsächlichen Baum: Verzeichnisse, Symlinktexte und reguläre Dateien mit SHA256, Bytezahl und Executable-Bit. Sie folgt keinen externen Directorylinks; besondere Dateitypen scheitern. `open_regular_at` (301) öffnet reguläre Dateien komponentenweise mit `O_NOFOLLOW`.
- `inventory_digest` (320) liefert die bestehende kanonische Baumhash-Konvention. Keine zweite Inventar- oder Hashdefinition ist nötig.
- `capture_dependencies` (324) verlangt den externen Baumhash und den tatsächlichen Git-Lockfilebezug, kopiert auf private Inodes, überprüft Dateien und interne Linkziele und vergleicht anschließend die vollständige private Mitgliedschaft. Das ist eine Grenze über installierte Toolbytes; sie behauptet keine Gleichheit dieser Dateien mit Git-Inhalten.
- `verify_prepared_inputs` (118–189) prüft vor/nach einem Lauf die tatsächlich verwendeten privaten Inputs und Overlays einschließlich des Dependency-Baumhashes. `verify_private_hardlinks` (370) hält reguläre Input-Inodes innerhalb des privaten Paars.
- Der generierte Preparer-Launcher (in `prepare_identity_qa_candidate.py`, Zeilen 453–471) bindet genau diese private Dependencywurzel an die beiden deklarierten `app/node_modules`-Mountziele mit `--ro-bind`.

Diese Funktionen bleiben unverändert; Capture19 erhält keine neuen Tests oder höhere Sollzahl. Der neue Recorder-Launcher ist noch nicht mit diesem tatsächlichen Capture-Mountplan integriert. Der bisherige `read_inventory`-Parser bleibt ebenfalls unverändert und wird nicht als Beweis für fehlgeschlagene Aufrufe verwendet.

## Ein enger neuer Baustein

Vorgeschlagen ist ein separates Modul `identity_qa_tool_tree.py` mit einem privaten, unveränderlichen `BoundDependencyTree`-Objekt. Die kontrollierende Fabrik erzeugt es erst nach tatsächlicher Prüfung von externem Receipt-/Treepin, privater Dependencywurzel, vollständigem Inventar und dem exakten RO-Mountplan. Ein JSON-Feld wie `verified: true` kann es nicht erzeugen. Seine Befugnis betrifft ausschließlich Dateisystemfakten über diesen Baum; es ist keine Source-A-, QA- oder Aktivierungsfähigkeit.

Das Objekt bindet:

| Teil | Erforderlicher Bezug |
| --- | --- |
| Physische Wurzel | Exakter privater Capturepfad, tatsächlicher vollständiger Baumhash und Capture-/Lockfilebezug |
| Sichtbare Wurzel | Je Original/Kandidat genau das deklarierte Namespace-Mountziel und dessen tatsächliche private Quelle |
| Mitglieder | Unveränderte vorhandene `dependency_inventory`-Zeilen; eindeutige Pfade und Typen, unveränderte Datei-/Linkbytes |
| Leseschutz | Ausschließlich deklarierter RO-Mount; keine überlappenden RW-Outputs oder verdeckenden Mounts; Recorder bleibt außen |
| Lebensdauer | Tatsächliche Prüfung vor/nach dem realen Lauf; keine Wiederverwendung über anderen Baum, Mountplan oder Launch hinweg |

Eine kleine reine Funktion `prove_negative_lookup(event, bound_tree)` erhält den bereits rekonstruierten tatsächlichen PID-/cwd-/dirfd-Aufruf. Sie liefert einen begrenzten Absenzbeleg oder scheitert. Sie wählt keinen Graph-, Goal- oder Personalisierungsscope.

## Prüfablauf je negativem Aufruf

1. Der bestehende Tracekern rekonstruiert zuerst PID, cwd, dirfd und den tatsächlichen Pfad. Fehlende Lineage oder unbekannte FDs bleiben Fehler. Die Klassifikation nutzt ausschließlich die explizite, tatsächlich gebundene Dependency-Mountzuordnung. Andere Toolroots, Hostpfade und Curriculum-/QA-/Outputinputs fallen nicht in diese Befugnis.
2. Der Baustein geht den Locator komponentenweise im vollständigen Inventar durch. Vorhandene Komponenten müssen den richtigen Typ haben. Interne Symlinks werden mit ihren exakten gebundenen Linktexten aufgelöst; Zyklen, externe Ziele, unbekannte Aliaswechsel und ein Verlassen der Wurzel scheitern. Bei `..` darf keine bloße lexikalische Normalisierung über eine Symlinkgrenze hinweg die tatsächliche Dateisystembedeutung ersetzen.
3. Für `ENOENT` benennt der Beleg die erste tatsächlich fehlende Komponente und den letzten belegten Verzeichnisprefix. So lässt sich beispielsweise auch ein fehlender Zwischenordner `dist/node_modules` aus der vollständigen Mitgliedschaft beweisen; dafür wird keine neue Liste einzelner Resolvernamen benötigt. Ein vorhandenes reguläres File anstelle eines Verzeichnisses beweist kein `ENOENT`.
4. Operation, vollständig verstandene Flags und tatsächliches errno müssen dazu passen. Die erste Implementationsgrenze bleibt bei unterstützten lesenden Open-/Metadatenaufrufen und `ENOENT`. Schreibfähige Opens, unbekannte Aufrufformen, `AT_EMPTY_PATH` ohne eindeutigen FD-Bezug sowie `EACCES`, `EBADF`, `ELOOP`, `EINVAL` oder ein anderer Fehler werden dadurch nicht legitimiert. `ENOTDIR` wäre gegebenenfalls ein gesondert zu prüfender Typbeweis, kein stiller zusätzlicher Erfolg.
5. Der Lookup muss im tatsächlichen Recordertrace vorkommen. Ein erfundener erwarteter Fehler, ein fehlender vorhandener Input oder ein bloßes Stringvorkommen genügt nicht. Erfolgreiche Reads brauchen weiterhin ihre tatsächliche Datei-/Alias-/Bytebindung. Directorydiscovery braucht weiterhin die vollständige tatsächliche Mitgliedschaft bis EOF.

Der Rückgabebeleg enthält Launch-/Rollenbezug, Mountquelle/-ziel, Baumhash, PID/cwd/dirfd, Locator, Operation/Flags, errno, Aliasweg und die erste fehlende Komponente. Er gehört zur Tool-/Dependencyprovenienz. Er ist kein gelesenes Curriculumdatum und kein QA-Ready-Satz.

## Kleine spätere Gegenprüfungen

Die spätere Umsetzung kann mit einem winzigen echten privaten Dependency-Capture und einem normalen Lookup-Produzenten geprüft werden; ein großes Original/Kandidatenpaar ist dafür unnötig. Erforderlich sind fehlendes Blatt und fehlender Zwischenordner sowie ein gültiger interner Alias. Negative Kontrollen müssen zusätzliche/entfernte oder umtypisierte Mitglieder, geänderte Datei-/Aliasbytes, unbekannte oder überlappende Mounts und fehlenden RO-Bezug abweisen. Ein vorhandenes File mit gemeldetem `ENOENT`, falsche Operation/Flags/errno und fehlende PID-/FD-Provenienz bleiben ebenfalls geschlossen.

Ein gleichnamiger fehlender Curriculuminput und ein fremder Hostbaum mit dem Namen `node_modules` müssen ausdrücklich weiterhin scheitern. Diese Kontrollen sind hier nur geplant, nicht ausgeführt. Es werden keine weiteren aktiven Escape- oder Trace-Manipulationsprogramme vorgeschlagen.

## Integrationsgrenze

Vor einem echten TS-/Deep-/CQR-Lesebeleg muss eine einzige Fabrik den tatsächlich geprüften Source-A-Original-/Kandidatenbezug, die authentischen QA-Inputs, den vollständigen privaten Dependency-Capture und den geschützten Recorder zusammenführen. Der heutige direkte Fixture-Launcher beweist diese Montage noch nicht. Die bestehende Byte-/Scopeprüfung wird dadurch weder ersetzt noch durch einen inversen QA-Graphen verdeckt.

Erst nach Review dieses Entwurfs wäre die getrennte kleine Implementierung sinnvoll. Weder große Capture-Läufe, neue Treepins, Änderungen an Capture19/Preparer oder eine Source-A-/AQA02/03-Gesamtfreigabe sind Teil dieses Entwurfs.
