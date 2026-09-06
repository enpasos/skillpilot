# Mechanische Einbauquittung der fünf Bildkorrekturen

Der von Root festgelegte Einbau wurde am 2026-09-06T10:17:07.733Z abgeschlossen. Die Auswahl der fünf korrigierten Bilder und der zwei eng begrenzten SVG-Eingriffe stammt von Root. Dieser Lauf erzeugt keine Bilder und trifft keine weitere Bild- oder Freigabeentscheidung.

Alle fünf Assets wurden seriell mit `scripts/import_goal_visualization.mjs` und `--review-status pilot` eingebaut. Die kanonische, öffentliche Frontend- und Backendkopie sind jeweils bytegleich mit dem ausgewählten Kandidaten. Die Importprompts und Rekonstruktionsprompts entsprechen exakt den angegebenen Eingaben. Für die beiden SVG-Korrekturen dokumentiert `import-prompt.de.md` den Originalprompt, die zwei verworfenen Provideranläufe und den genauen lokalen Eingriff. Die drei Nano-Banana-Korrekturen verwenden ihren tatsächlichen archivierten Providerprompt.

Die alten kanonischen Prompts, vorhandenen Rekonstruktionsprompts, vollständigen Zielobjekte, Ressourcenlinks und QA-Records sind vor dem Import in den jeweiligen `pre-import/`-Ordnern gesichert; die schon vorhandenen Originalbildarchive wurden gegen die damaligen kanonischen Bildbytes geprüft. Die zweiten verworfenen Kandidaten von 7c und 623 sowie die aktuellen Providerprompts sind ebenfalls archiviert. Alte alternative JPG-Dateien der beiden PNG-Ziele wurden nicht gelöscht; ersetzte JPG-Inhalte sind in den Originalbildarchiven erhalten.

Der JSON-Vergleich belegt: Außer den `resourceLinks` der ausgewählten Ziele ist die kanonische Landschaft unverändert. Das Zielobjekt 0404 blieb vollständig identisch, weil hier nur die Bildbytes unter bestehender URL und die Promptdateien wechselten. Alle QA-Records außerhalb dieser fünf Ziele sind unverändert. Der native Mathematik-QA-Lauf schrieb 809 Records und setzte bei den fünf neuen Assetdigests die bisherigen Freigaben zurück. Dieser Import vergab weder AI- noch Human-Approval. Eine etwaige nachfolgende Freigabe durch Root ist eine eigene Entscheidung außerhalb dieser historischen Einbauquittung.

Der Freeze-Check bestand vor und nach dem Einbau. Bücher, Indizes, D-/P-Reviewartefakte, Runtime-Verträge und kanonische Lernzieltexte wurden durch diesen Importlauf nicht bearbeitet. Es erfolgte kein Deployment.

Die vollständigen SHA-256-Bindungen, Quellen, Importbefehle und der mechanische QA-Zwischenstand stehen in [mechanical-import.receipt.json](mechanical-import.receipt.json). Der Vorherstand steht in [mechanical-import-before.json](mechanical-import-before.json).
