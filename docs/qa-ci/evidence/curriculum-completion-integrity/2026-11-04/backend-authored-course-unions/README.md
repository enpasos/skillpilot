# Backendtests für geprüfte kombinierte Kursansichten

Die vollständige Backend-CI auf `1a63656071` meldete veraltete Annahmen über
automatisch kombinierte Mathematikansichten. Die freigegebenen 39 expliziten
Kursvereinigungen ersetzen diese historischen virtuellen Ansichten. Der
produktive Releasecompiler berücksichtigt das bereits; die Paket-Testfixture
bildet nun dieselbe Entscheidung ab, ohne doppelte Angebote zu erzeugen.

Die Tests erwarten die aktuellen Ansichts-IDs und exakt die vier geprüften
GK-Prüfungen, die in der Kursvereinigung wegen vorhandener LK-Abschlusswege
entfallen. Alle anderen Ziele, unterstützenden Kompetenzen und
Vorbereitungsbeziehungen bleiben im Mengenvergleich erhalten. Die bayerische
Planprüfung kontrolliert zusätzlich, dass die gemeinsame Euler-Kompetenz
weiterhin in GK und LK enthalten ist. Cache-Identität, eindeutige
Baumpositionen, Angebots-Eindeutigkeit und Mitgliedschaftsprüfungen bleiben
verbindlich.

Die gezielte Wiederholung umfasst fünf vollständige Klassen und den betroffenen
Jahrgang-8-Regressionstest: **104/104 bestanden, keine Skips**. Aktuelle
Testkonfiguration und Quelldateien sind an ihre tatsächlichen Bytes gebunden;
der aktuelle Kanon blieb während des Laufs unverändert. Der Nachweis verwendet
den vorhandenen frisch kompilierten, bytegleichen Produktionsklassenstand.

[Ausführung und Quellenbindungen](execution.json),
[vollständige Testzusammenfassung](summary.txt),
[Kompilierung](compile.log).

Dieser Nachweis ersetzt keine vollständige Backend-CI. Speicherbereinigung
anderer Test-Fixtures und die verbleibenden Mathematik-Datenlücken werden
getrennt behandelt.
