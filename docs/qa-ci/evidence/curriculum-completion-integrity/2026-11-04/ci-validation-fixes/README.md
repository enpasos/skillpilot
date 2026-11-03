# Zwei begrenzte Korrekturen an CI-Prüfungen

Die ergänzende Auswahl von Prüfungszielen betrachtete auch Prüfungsordner als
atomare Abschlussziele. Der Selektor verlangt jetzt ein tatsächliches atomisches
Ziel. Explizit konfigurierte Prüfungsordner werden weiterhin zu ihren Blättern
aufgelöst und vollständig geprüft. Die Regression erfasst die gültige Ordnerstruktur,
eine fehlende Vorbereitungsroute und ein unzulässiges gewöhnliches Prüfungsblatt.

Auf dem eingefrorenen Vektorstand sinkt die Zahl der Graphbefunde von 114 auf 75:
Genau 39 falsche Meldungen zu 13 nichtatomaren Ordnern entfallen. Alle übrigen
Befunde bleiben als Multimenge unverändert. Die Gesamtprüfung bleibt rot.

Der Physics-Eingabetest verwendete einen festen alten Hash einer inzwischen
legitim geänderten Mathematikaufgabe als Algorithmustest. Eine kleine feste
Testeingabe mit festem erwarteten Hash prüft jetzt den Algorithmus. Die lebende
Mathematikaufgabe bleibt zusätzlich gegen ihre aktuelle autoritative
Ledgerentscheidung geprüft. Physiks 162 fachübergreifende Voraussetzungen zu
54 Mathematikzielen und die übrigen Qualitätsprüfungen bleiben unverändert.

Astra hat beide Korrekturen unabhängig bestätigt, die vollständigen
Routenregressionen ausgeführt und zwölf ungültige Fingerprint-/Ledgerfälle
geprüft. Nach dem Import bestehen die vollständigen Routen- und Physics-
Eingabetests auch auf dem tatsächlichen aktuellen Rootstand. Dieser enthält
zusätzlich die vier freigegebenen Raumgeometrieformen; seine Gesamtgraphprüfung
meldet noch **72 echte Datenbefunde** und bleibt entsprechend fehlgeschlagen.
Die 2.655 Eingaben des vorherigen Native-Nachlaufs bleiben unverändert.

`binding.json` bindet die tatsächlichen Ausführungs-, Review- und Importbelege.
Die Änderungen betreffen drei Code-/Testdateien; sie erteilen keine vollständige
Mathematik-, M7-, GitHub-CI- oder Deployment-Abnahme.
