# Mathematik Q4.2: Quellen-Seiten und Rationale-Snapshot

Die offizielle HE-Q4.2-Passage beginnt auf Druckseite 51 des Kerncurriculums. Im PDF stehen die Spiegelstriche 1–7 dort und die Spiegelstriche 8–15 auf Druckseite 52. Der Extraktionsgenerator hatte bisher die Startseite der mehrseitigen Passage an alle Aspekte weitergegeben. Im bestehenden Source-Extraction-Artefakt sind deshalb ausschließlich die `sourceRef`-Werte der 18 Aspekte aus Spiegelstrich 8–15 von `S. 51` auf `S. 52` korrigiert; die neun Aspekte aus Spiegelstrich 1–7 bleiben auf `S. 51`. Source-IDs, Texte und sonstige Felder sind unverändert. Ein Strukturvergleich gegen den vorherigen Git-Stand bestätigt genau diese 18 Änderungen.

`app/scripts/generateHeMathSekiiSourceExtraction.ts --check-q42-pages` rekonstruiert die Q4.2-Aspekte aus dem offiziellen PDF und prüft die 9/18-Aufteilung, die IDs und Seitenverweise im vorhandenen Artefakt **ohne Schreibzugriff**. Ein vollständiger Generatorlauf ist für diese Korrektur nicht geeignet: Das bestehende Artefakt enthält zusätzliche, später überprüfte `sourceDocument`-Metadaten, die der ältere Generator nicht rekonstruiert. Es wurde daher nicht vollständig überschrieben.

Die beiden getrackten Mathematik-Quellenberichte wurden anschließend gemeinsam für den aktuellen Arbeitsstand erzeugt:

- `docs/qa-ci/status/goal-source-rationales-math-all-relevant.json`
- `app/public/data/goal-source-rationales-math-public.json`

Ein vor dem Schreiben erzeugter Vergleich zeigte in **beiden** Berichten je 39 geänderte Lernziel-Einträge: 30 ausschließlich mit den korrigierten Q4.2-Seitenverweisen, sieben als Folge der separat geprüften aktuellen HE-, SL- und TH-Mappingentscheidungen sowie zwei wegen der ebenfalls separat geänderten kanonischen Beschreibungen `0e8417d7-effb-5314-93ba-a571b01726ce` und `09f47964-2cd0-410e-93ee-9632b582fc91`. Bei zwei Geometriezielen ändert sich die aus der neuen primären SL-Quellenroute abgeleitete MEM-Jurisdiktionsnotiz. Die Summenzähler bleiben gleich; außerhalb dieser erklärten Einträge ändert sich nur `generatedAt`. Die geschriebenen Berichte wurden gegen die vorab klassifizierten Kandidaten verglichen; abgesehen von `generatedAt` sind sie gleich.

Das ist eine Quellen- und Nachweisaktualisierung, keine zusätzliche fachliche Freigabe oder M7-Erhöhung. Kanonische Lernziele, GoalBook-Publikation, zentrale D/P/V-Registrierung und Status wurden dabei nicht verändert. Die generierte GoalBook-Originalquellen-Datei wird erst beim nächsten regulären Buch-Build aktualisiert.
