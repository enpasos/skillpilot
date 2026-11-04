# G4-Nachlauf: deklarierte Eingaben und erzeugte Bestandsberichte

Der Mathematikjob auf `ffc69cd4f5` konnte den regulären Generator im schlanken
Checkout nicht starten: Der verschachtelte Geometrievertrag und sein gebundener
ursprünglicher Erzeugungsplan fehlten. Die Eingabeermittlung verwendet jetzt
auch die bereits vorhandenen ausdrücklichen `stageDecisionBindings` der
normalen Policy. Es gibt keine neue fallbezogene Dateiliste und keine rekursive
Verfolgung historischer Reviewinhalte. Pfade und SHA-256-Bindungen werden vor
der Verwendung geprüft, bei Sparse-Checkout auch anhand des eigenen Git-Index.

32 Vertragsprüfungen bestehen. Eine tatsächliche Kopie mit den Workflowmustern
reproduziert zuerst den ursprünglichen Fehler und besteht nach der Korrektur
alle **39 kombinierten Dokumente und 46 Kursanfragen**. Alle 147 Ansichtsdateien
bleiben bytegleich. 133 ausdrücklich gebundene Pfade kommen hinzu, davon
99 Qualitätsdateien und 34 Original-PDFs. Unbeteiligte Qualitätsarchive und
historische temporäre Pfade bleiben ausgeschlossen.

Der erzeugte Mathematik-Memory-Report ist aus der aktuellen Konfiguration neu
geschrieben. Das Medieninventar aktualisiert ausschließlich fünf gemessene
Bestandsfelder der Lernzielvisualisierungen. Richtlinien, Herkunftsaussagen,
sonstige Medienbindungen und Prüfgrenzen bleiben unverändert. Für die lokale
Prüfung wurden vier bereits vorhandene App-Assets bytegleich in ihre fehlenden,
ignorierten Backend-Ausgabeorte kopiert; dabei wurden keine Bilder verändert.

[Sparse-Reproduktion und Bindungen](execution.json),
[ursprünglicher Fehler](original-failure.txt),
[erfolgreicher Generator](final-generator-pass.txt),
[32 Vertragsprüfungen](strict-contract-tests.txt), [Patch](fix.patch),
[Reproduktionsprogramm](reproduce.py), [Handoff](handoff.json),
[gemessene Inventaränderung](ai-inventory-measured-delta.json),
[lokale Asset-Vorbereitung](local-generated-assets-setup.json).

Dieser Nachlauf verändert keine Lernstände, Lernzielrollen, Aufgaben oder
Vorbereitungskanten. Die früheren Messungen und ihre Eingabekarten bleiben
unverändert; die beiden späteren CI-Skriptänderungen sind hier gesondert
gebunden. Ein vollständiger Mathematik- oder CI-PASS wird nicht behauptet.
