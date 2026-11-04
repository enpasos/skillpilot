# Backend: Prüfungsstart, Katalogtests und begrenzter Testkontext-Cache

Der Backendlauf zu `4aba8e0c33` meldete vor seinem späteren Speicherfehler
bereits veraltete Mock- und Katalogerwartungen. Der reale Claude-Prüfungstest
hatte außerdem nur einen aktiven Zeiger gespeichert, ohne die konkrete
Prüfungsaufgabe ausdrücklich zu bestätigen.

Die Korrektur erhält die Startwache. Ein solcher Bewertungsabruf liefert jetzt
`CONFLICT`, ohne Lösung, Bewertungs-Capability oder Mastery freizugeben. Der
positive Test bestätigt die Aufgabe über den normalen Service. Die Katalogtests
prüfen weiterhin exakte Zielmengen und Zahlen; für Paketansichten sind es
108 eindeutige Views und 151 Angebote einschließlich 43 Kursvereinigungen.

Der Spring-Testcache hält höchstens zwei Kontexte statt vier. Heapgrenze,
Testauswahl, Fork-Verhalten und Produktionsloader bleiben unverändert.
Im repräsentativen Nachlauf wurden fünf verschiedene Kontexte geladen;
zuletzt bestanden auch die zuvor betroffenen SRS-Abfragetests.

- Initialer gezielter Lauf: **48 Tests bestanden**, keine Skips oder Abbrüche.
- Nach der neutraleren Fehlermeldung: **32 Tests in fünf vollständigen
  Spring-Testklassen bestanden**, keine Skips oder Abbrüche, 133,40 Sekunden.
  Dieser Lauf verwendet den endgültigen Adapter und den Cache mit zwei
  Einträgen. Die beiden Testzahlen enthalten Überschneidungen.
- Astra hat die fünf Code-/Teständerungen und anschließend den Nachweis für
  den endgültigen Adapter unabhängig geprüft. Sol hat die Begrenzung des
  Testcaches und den Mehrkontext-Nachlauf geprüft.

[Quell- und Nachweisbindungen](binding.json),
[initialer Lauf](initial-48-tests.execution.json),
[Astra-Review](astra-source-review.json),
[aktueller Adapter-Nachweis](astra-final-adapter-addendum.json),
[Sol-Review und Speicherdiagnose](sol-current-source-and-cache-review.json),
[Mehrkontext-Nachlauf](current-cache-two-tests.execution.json),
[gemessene Cachebelegung](cache-samples.json).

Diese gezielten Läufe sind keine vollständige Backend- oder GitHub-CI-Abnahme.
Insbesondere bleiben die getrennten Plan-/Fokuskorrekturen und die fachlichen
Mathematiklücken offen.
