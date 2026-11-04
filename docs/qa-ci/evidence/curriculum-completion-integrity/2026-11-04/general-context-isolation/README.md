# Getrennte Datenbanken für weitere Backend-Testkontexte

Der vollständige Backendjob meldete denselben Tabellenverlust wie zuvor bei
Gemini: Verschiedene Spring-Kontexte teilten eine H2-Datenbank, während die
Verdrängung eines Kontexts dessen Schema mit `create-drop` löschte. Die
Claude-CORE-Konfiguration und die allgemeine Testkonfiguration erhalten deshalb
je Kontext einen eigenen Datenbanknamen. Produktionskonfiguration, Cachegröße,
Heap und Aufräumverhalten bleiben unverändert.

Die gezielte Reproduktion umfasst die tatsächliche Reihenfolge vollständiger
CI-Testklassen. Alle 162 gemeldeten Schemafehler wurden reproduziert. Nach der
Korrektur bestehen alle 163 Tests der vier betroffenen Klassen. Ein zusätzlicher
Lauf mit der konkreten Claude-Cacheverdrängung geht von 19 Fehlern auf 50 von
50 bestandene Tests über. Die JDBC-Beobachtung bestätigt innerhalb eines
Kontexts stabile und zwischen den betroffenen Kontexten getrennte URLs.

Der erste Verbund mit 245 Tests behält zwei unabhängig davon gefundene
Controllerfehler: Im privaten Testaufbau fehlten 72 versionierte Quellsnapshots;
außerdem enthielten vier Schleswig-Holstein-Erwartungswerte noch nicht die
[geprüfte Markov-Ergänzung](../sh-markov-twelve/README.md). Der korrigierte
Testaufbau besteht mit allen 38 Controller-Tests. Die Champion-Erwartung bleibt
288; ausschließlich die vier durch tatsächliche Backendprojektionen belegten
Schleswig-Holstein-Zielzahlen steigen um jeweils eins.

Es wird kein erneuter erfolgreicher 245er-Gesamtlauf behauptet. Die unveränderten
Vorlaufergebnisse, ihre begrenzten Eingaben und die gezielte Nachprüfung sind im
[Vorher-/Nachher-Nachweis](database-isolation-and-controller.actual.json)
getrennt dokumentiert. Der [Import](root-import.json) übernimmt exakt die drei
geprüften Dateien. Eine vollständige Backend- oder GitHub-Freigabe folgt daraus
nicht.
