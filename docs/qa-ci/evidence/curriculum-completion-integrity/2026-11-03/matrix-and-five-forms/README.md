# Matrixprüfung und fünf Prüfungsformen: tatsächlicher Datenvergleich

Die JSON-Berichte sind unveränderte Kopien der tatsächlichen privaten
Vorher-/Nachhermessung. `transport.json` bindet ihre transportierten Bytes.
Die Messung verwendet den kompilierten Backendstand des PR und vergleicht
alle 161 angebotenen Mathematik-Lehrpläne einschließlich 46 Kursvereinigungen.
Die Bedarfsberechnung wurde für beide Stände anhand der direkten
Voraussetzungen unabhängig nachgerechnet, insgesamt also 322-mal.

Der Kandidat schließt **1.121 ungedeckte Ziel-Angebots-Paare**, ohne neue
hinzuzufügen. Es bleiben **362 unterschiedliche ungedeckte Ziele / 8.641
Ziel-Angebots-Paare** sowie **208 gewöhnliche Endpunkt-IDs / 4.345
Endpunktpaare**. Alle 161 Angebote besitzen weiterhin ungedeckte Routen;
die Messung ist ausdrücklich kein M7-, CI- oder Deployment-PASS.

Der Vergleich prüft die erhaltenen bisherigen Targets, Vorbereitungsrollen,
die unveränderte Matrixaufgabe und ihre 18 Vorbereitungsziele sowie die
bestehenden Prüfungsangebote. Die fünf neuen Prüfungsformen behalten ihre
Lernziel-IDs. Die einzige zusätzliche echte Voraussetzung und die sechs
fachlich korrigierten Voraussetzungen werden im Vergleich separat ausgewiesen.
Es gab keine Lernstandsänderungen.

`final-comparison.json` enthält den tatsächlichen Nachlauf nach den
inhaltlichen Reviewkorrekturen an Beschreibungen und Lernbild. Der gemessene
Kanon hat SHA-256 `3e9d6755d645bcd4e8d0e303de6e3529a88c8a8e070fc7a1ebaaaa2ac7e2fe8c`.
`final-graph-equivalence.json` bestätigt für alle 161 Angebote, dass diese
Text- und Bildkorrekturen keine der geprüften Graphmengen oder direkten
Voraussetzungen verändern. Der ursprüngliche Lauf und seine Autorendeltaprüfung
bleiben getrennt erhalten. `final-binding.json` verbindet die Nachweise.

Danach wurde ausschließlich der Bildverweis des Ziels `5743b8f9…` auf die
separat geprüfte Darstellung ohne falsche Zuordnungspfeile umgestellt.
`post-measurement-presentation-only-delta.json` weist den vollständigen
Objektvergleich nach: Alle Graph-, Zielumfangs- und Aufgabenfelder sind
unverändert. Der Kandidat hat dadurch die Kanon-Prüfsumme
`7c57d298140ac3a42eb5f4c90615a6472849ab44105ede77f1da461a6bc8eab9`.
Für diesen reinen Bildverweiswechsel wird kein weiterer Backendlauf behauptet.

Nach den anschließenden Korrekturen der regulären Länder-/Dauergeneratoren
fand ein weiterer tatsächlicher Backendlauf mit Kanon `7c57d298…` statt.
`normal-producer-binding.json` bindet seine Ausführung und die beiden
vollständigen Vergleiche: gegen den ursprünglichen Root-Stand und gegen den
vorherigen Kandidaten. Alle Graphmengen und direkten Voraussetzungen bleiben
über sämtliche 161 Angebote exakt gleich zum vorherigen Kandidaten. Dieser
Lauf dauert 106,02 Sekunden; 8.732 Eingabedateien und 1.379 kompilierte Klassen
bleiben während der Messung unverändert. Die oben genannten verbleibenden
Lücken bestehen weiterhin. Die älteren Messberichte bleiben getrennt erhalten.

Die internen temporären Pfade beschreiben die damaligen Ausführungsorte.
Sie sind keine zusätzlichen Build-Eingaben. Die vollständigen Roharchive
bleiben lokal erhalten; ihre Prüfsummen stehen in `comparison.json`.
Die anschließende tatsächliche Integration ist in `root-import.json`
dokumentiert: 363 Dateien wurden nach vollständigem Vorher-/Nachhervergleich
übernommen; alle 8.732 Runtime-Eingaben stimmen danach mit dem gemessenen
Stand überein. `standard-checks/execution.json` bindet die acht erfolgreichen
abschließenden Standardprüfungen und ihre unverändert übernommenen Logs.
Diese Import- und Prüfnachweise erweitern den historischen Messnachweis;
sie behaupten keine vollständige CI-, M7- oder Produktionsabnahme.
