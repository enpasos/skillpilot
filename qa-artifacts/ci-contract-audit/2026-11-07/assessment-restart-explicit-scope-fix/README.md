# Neustarttest mit tatsächlich aufgelöstem Scope

Der frische Assessment-Lauf für `6e8bb160` führte 349 Tests aus; genau der
Neustarttest scheiterte. Seine bisherige Fixture wählte den kanonischen
Mathematik-Fachgraph ohne Stufe und ohne Composition-View. Der neue reguläre
Readinessguard verweigert diesem unvollständigen Personal Curriculum zu Recht
den Prüfungsstart.

Der Test kopiert jetzt zusätzlich die unveränderte vorhandene Hessen-LK-View
und setzt den expliziten Hessen-/CrossStage-/LK-Scope. Vor dem Start prüft er
die gültige abgeschlossene Personalisierung. Er verwendet weiterhin die
echten Repositoryziele, zwei vollständige Spring-Anwendungsstarts, reale
PostgreSQL-Transaktionen und die vorhandenen MCP-/Session-/Replayprüfungen.
Produktionscode und sämtliche 484 Main-Java-Sourcen bleiben unverändert.

Der gezielte lokale Lauf besteht: ein Test gefunden, gestartet und erfolgreich,
keine Skips und keine fehlgeschlagenen Container. Der neue isolierte lokale
Testcluster nutzte PostgreSQL 18.1 und wurde danach gestoppt. Der tatsächlich
ausgeführte nächste Remote-Lauf mit dem in CI gepinnten PostgreSQL 15 ist
separat nachzuweisen. Hieraus folgt kein frischer Remote-Pass und kein M6/M7.

`receipt.json` bindet Quellen und Ausführung. Die komprimierten Originalausgaben
enthalten den tatsächlichen Remotefehler sowie den lokalen Zweistartnachweis.
Der erste lokale Compileversuch ohne die vorhandene Testhilfsklasse ist
ebenfalls erhalten; nach deren Aufnahme in die Compileeingaben bestand der
Lauf. Der Reproducer verwendet die ausdrücklich gebundenen lokalen JDK-/
Classpath-Pfade und ist kein portabler Releasecontainer.
