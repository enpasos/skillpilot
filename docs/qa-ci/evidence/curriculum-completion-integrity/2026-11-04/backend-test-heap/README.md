# Testeigene Mockito-Fixtures nach jedem Test freigeben

Der vollständige GitHub-Backendjob 126358099653 auf Commit `427723ecdf`
brach nach 2.963 erfolgreichen Testereignissen mit `Java heap space` ab.
Die kontrollierte Untersuchung weist diese Retentionskette nach:

`Mockito-Handler → aufgezeichnetes Event → LearnerService → CompositionViewService → RepositoryViewIndex`

Schon die gezielte Freigabe des testinternen Event-Publisher-Mocks machte
37,2 MiB einer einzelnen Fixture sammelbar, während sieben andere Mocks
weiter stark referenziert blieben. Der kontrollierte gesamte Klassendurchlauf
behielt unverändert 624,8 MiB nach GC und mit gezielter Bereinigung 126,1 MiB.
Beide Varianten bestanden alle 34 Tests mit gleichen Aufrufzahlen.

Der konkrete Patch erfasst die im Test erzeugten Mocks mit einem
klasseneigenen Listener, entfernt den Listener und gibt ausschließlich diese
Mocks nach dem Test frei. Nach der Klasse werden die testinternen statischen
Katalogreferenzen freigegeben. Bereits vorher erzeugte fremde Mocks bleiben
funktionsfähig; ein Kontroll-Mock prüft das nach jedem Test.

Der bytegleiche Root-Patch besteht zweimal dieselbe vollständige Klasse in
einem JVM-Prozess mit 768 MiB maximalem Heap: **68/68 Tests, keine Fehler oder
Skips**. Zwischen den Testmethoden wird kein GC erzwungen. Der Live-Heap nach
Klassenende und GC beträgt 17,0 und anschließend 16,8 MiB. Assertions und
historische Fixtures bleiben erhalten. Der reguläre Heap und die Zahl der
Testprozesse werden nicht erhöht.

[Diagnose](diagnosis.json), [kontrollierter Vergleich](controlled-ab-results.json),
[Wiederholung des konkreten Patches](candidate-repeat-results.json),
[geprüfter Patch](candidate.patch).

Dieser gezielte Nachweis ersetzt den vollständigen GitHub-Backendlauf auf dem
abschließenden Commit nicht.
