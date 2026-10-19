# CI: Verbindungsverlust des gehosteten Runners

Der erste Curriculum-Job für `41a37acd0016c7ac9613edb87de283e5a918f543` endete mit dem von GitHub gemeldeten Verbindungsverlust des gehosteten Runners. Der Schritt steht in dessen terminalem Jobdatensatz noch auf `in_progress`; es gibt keinen protokollierten fehlgeschlagenen Test und keinen verfügbaren Curriculum-Schrittlog im Gesamtlaufarchiv. Daraus wird keine bewiesene Ursache für den Verbindungsverlust abgeleitet.

Der unveränderte exakte strenge Selbsttest bestand lokal in 285,72 Sekunden mit maximal 384584 KiB RSS und ohne Swap. Nur der terminal abgebrochene Job wurde für denselben Commit erneut gestartet; Versuch 2 ist als neuer Job `117764082829` bestätigt. Die erfolgreiche Wiederholung ist noch nicht nachgewiesen. Keine Qualitätsgrenze und kein Test wurde geändert.

Diese technische Diagnose ist kein neuer fachlicher Abschluss. Der aktive strenge Stand bleibt 328/450; Kandidaten werden nicht hinzugezählt.
