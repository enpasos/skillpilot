# Eigentum und Lebensdauer großer Backend-Test-Fixtures

Die vollständige Backend-CI auf `1a63656071` besteht die zuvor korrigierte
Stored-Focus-Klasse, läuft später aber beim Aufbau des SRS-Testkontexts in
einen Heapüberlauf. SRS besteht isoliert mit 6/6 Tests. Astras unabhängiger
Vergleich weist zwei vorangehende Speicherhalter nach: 660.785 aufgezeichnete
Aufrufe eines gemeinsamen Spys halten rund 684 MiB; fünf statische
Katalog-Fixtures halten zusammen rund 760 MiB.

Sechs ausdrücklich angemeldete Plain-JUnit-Klassen geben nun ihre eigenen
methodenbezogenen Mocks nach jedem Test frei. Gemeinsame Mocks und fremde
Spring-Mocks gehören nicht diesem Methoden-Cleanup. Beim gemeinsamen Spy
wird zwischen Fällen ausschließlich die Aufrufhistorie gelöscht; seine Stubs
bleiben verfügbar. Erst nach der Klasse wird er freigegeben. Die gemeinsamen
veränderlichen Fälle laufen seriell; die übrigen statischen Katalogreferenzen
werden nach ihrer jeweiligen Klasse gelöst.

Die vollständige gezielte Sequenz verwendet denselben SRS-Spring-Kontext
vor und nach allen sechs Plain-Klassen: **250/250 Tests bestanden**, keine
Skips und keine Ownership-Fehler. Bei unverändert 1.536 MiB Heaplimit liegt
der belegte Heap nach Sammlung vor der Sequenz bei 362,1 MiB und am Ende bei
363,9 MiB. Eine zusätzliche Kontrolle bestätigt getrennte Besitzer auf zwei
parallelen Threads, unveränderte fremde Stubs und Cleanup nach Setup- sowie
Testfehlern. Die aktuellen Memoization-Assertions bestehen ebenfalls.

Alle verwendeten Produktionsklassen, Quelltexte und Eingaben blieben während
dieses Laufs unverändert. Der Lauf verwendet den Datenstand vor dem getrennten
Geometrie-Import. Die anschließend übernommenen sieben Testdateien stimmen
bytegenau mit dem geprüften Patch überein. Assertions, SRS, Produktionscode,
Gradle und Heaplimit wurden durch diesen Patch nicht geändert. Ein zuvor nach
240 Sekunden beendeter Vordergrundversuch ist als unterbrochen dokumentiert;
die vollständige Wiederholung lief mit eigenem Prozessabschluss erfolgreich.

[Astra-Diagnose](astra-diagnosis.json), [technischer Review](technical-review.json),
[vollständige Sequenz](execution.json), [Ownership-Kontrolle](ownership-boundary.log),
[Quellenbindungen](source-bindings.json), [übernommener Patch](memory-only.patch),
[Importbindungen](import-ready.json), [Sequenzprobe](LifecycleSequenceProbe.java),
[Ownership-Probe](OwnershipBoundaryProbe.java).

Dieser Nachweis ersetzt die vollständige Backend-CI des abschließenden Commits
nicht. Er enthält keine Änderung an Produktionsdaten.
