# Exakte Wiederherstellung der sechs Prüf-Renderdateien

Die drei nativen Kampagnen behalten ihre ursprünglichen Modelle, Manifeste, Digests, Antworten und Auflösungen unverändert. Ihre drei HTML- und drei PDF-Ausgaben bleiben als unveränderte rohe Audit-Ausgaben im externen Handover unter `tmp/e1-handover/task-h/quality/original-renders/`. Im Repository werden genau diese sechs rekonstruktiblen Renderdateien ignoriert. Sie werden weder redigiert noch durch weniger streng geprüfte Ableitungen ersetzt.

Aus dem Repository-Hauptverzeichnis prüft dieser Befehl die exakte Wiederherstellung, ohne Dateien im Repository zu schreiben:

```bash
app/node_modules/.bin/tsx curricula/DE/Gymnasium/quality/learning-units/e2-impuls-newton2-bindings-20261125-v1/quality/reproduce-review-artifacts-v2.mts
```

Für einen frischen Checkout vor den nativen Kampagnenprüfungen:

```bash
app/node_modules/.bin/tsx curricula/DE/Gymnasium/quality/learning-units/e2-impuls-newton2-bindings-20261125-v1/quality/reproduce-review-artifacts-v2.mts --materialize --check-native
```

Die PDF-Erzeugung benötigt die regulären Renderer-Voraussetzungen: die exakt installierten App-Abhängigkeiten, deren Playwright-Chromium sowie PDF-/Fontwerkzeuge. HTML wird aus dem gebundenen Modell und den bereits gebundenen Render-Metadaten erzeugt. Beim PDF wird zunächst die vollständige native Prüfsumme der neu erzeugten Skia-Quellrevision geprüft. Nur die beiden aufgezeichneten Zeitstempel `CreationDate` und `ModDate` werden auf ihren ursprünglichen Wert zurückgestellt. Der vorhandene native `injectGoalBookPdfOutline` erzeugt daraus erneut die gebundene Outline-Revision samt Quellprüfsumme. Anschließend müssen vollständige Bytezahl und SHA-256 beider Artefaktarten unverändert mit dem ursprünglichen Bundle- und Render-Manifest übereinstimmen.

Der Helfer bereitet alle sechs Artefakte vollständig vor und prüft sie, bevor er eine fehlende Ausgabe schreibt. Eine bereits vorhandene abweichende Datei wird abgelehnt. `--check-native` ruft weiterhin die unveränderte native Artefaktprüfung und im gewöhnlichen Checkout die vollständige Prüfung der vorbereiteten Kampagnen auf. Kein globaler Checker erhält eine Ausnahme.

Für eine reine Hydrierung aus den extern erhaltenen Originalausgaben steht alternativ `--originals-directory /path/to/original-renders` zur Verfügung. Auch dieser Weg akzeptiert ausschließlich dieselben vollständigen Bytezahlen und SHA-256-Werte. Er ist kein Ersatz für einen fehlgeschlagenen Hashvergleich und ändert keine historische Eingabe. Die Originalausgaben werden nicht komprimiert im Repository versteckt.

`--target-root /path/to/private-tree` erlaubt einen isolierten Wiederherstellungstest mit absichtlich fehlenden Ausgaben. Die Prüfung verwendet dort dieselben unveränderten nativen Bundle-Byteprüfungen; sie behauptet keine Änderung des aktuellen Repositorys oder eine erfolgreiche externe CI. Die ursprüngliche Vier-Artefakt-Prüfung steht unverändert in `render-recovery-checks.actual.json`; der Nachfolger für alle drei Kampagnen wird unter `conservation-clarification-20261125-v1/` gebunden.

Die regulären CI-Jobs lesen den aktuellen D/P-/Statusnachweis aus den gebundenen JSON-Eingaben und Auflösungen; sie rufen keine vollständige historische E.2-Kampagnen-Artefaktprüfung auf. Deshalb wird kein zusätzlicher Renderer-Schritt in die normale CI eingefügt. Der ausdrückliche native Kampagnenaufruf benötigt hingegen die sechs Originalausgaben und verweigert fehlende Ausgaben. Das wurde getrennt vom erfolgreichen aktuellen Statuscheck bei absichtlich fehlenden historischen Renderdateien geprüft. Ein Sparse-Checkout muss für die Wiederherstellung zusätzlich alle drei gebundenen Bundle-Ordner, die Renderer-Skripte, App-Abhängigkeiten und referenzierten öffentlichen Bilddateien enthalten; fehlende Eingaben werden nicht übersprungen. Andere Plattform-/Renderer-/Fontausgaben werden ausschließlich bei identischen vollständigen Originalhashes akzeptiert. Andernfalls ist nur die ebenso streng geprüfte Hydrierung der externen Originalbytes zulässig.

Die aktive v2-Rezeptur bindet außerdem exakt die damals geprüften H-Bildversionen. Der Helfer baut daraus einen privaten öffentlichen Asset-Baum, prüft jedes Modell-Digest gegen die erhaltenen Bildbytes und verweigert unbenutzte oder doppelte Overrides. Neuere aktive Lernbilder beeinflussen dadurch keine historische Ausgabe. `reviewed-media-versions.actual.json` im Klarstellungsnachweis nennt alle sechs historischen JPEG-Digests. Der ursprüngliche v1-Helfer und sein v1-Rezept bleiben unverändert als Vorgeschichte erhalten.
