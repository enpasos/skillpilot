# Prüfungen im Coach ausdrücklich auswählen und Pläne weiter lesen

Ein echter J8-Fall hatte sechs noch offene, freigegebene Prüfungen. Die
ungekürzte Verfügbarkeitsliste enthielt sie, der Coach veröffentlichte jedoch
eine leere Auswahl und forderte erneut `getFrontier` an. Die automatische
Pflichtberechnung war wegen anderer ungedeckter Ziele im vollständigen
Lehrplan gesperrt. Das machte diese sechs ausdrücklich auswählbaren
Prüfungsaufgaben nicht ungültig.

Der Coach bietet solche voraussetzungsbereiten Prüfungen jetzt als ausdrückliche
Auswahl an, wenn keine normale Pflichtempfehlung und keine aktive offene Arbeit
vorliegen. Er verwendet denselben verlässlichen Mastery-Snapshot. Fokus,
Zielzugehörigkeit, Aufgabenreife, Sitzungszuständigkeit und Bestätigung der
konkreten Aufgabe bleiben erforderlich. Die angezeigten Prüfungen speisen
weder Autopilot noch Planübergabe, Kontingent oder implizite Gutschriften.
Ein verfrühter Mastery-Aufruf verändert auch den aktiven Zeiger nicht.

Zusätzlich bleiben die gespeicherten Termine veralteter Pläne lesbar, auch
wenn ein ungültiger Fokus noch ausdrücklich repariert werden muss. Daraus
werden keine Lernberechtigung und keine Fortschrittszahlen abgeleitet.
Die klassischen Navigationstests verwenden gezielt ihren klassischen Modus;
die automatischen Verträge behalten gültige positive und strenge negative Fälle.

Astra hat Quellen, Abgrenzungen und die tatsächlichen Nachweise unabhängig
geprüft. Auf dem endgültigen Kandidaten bestehen:

- **22 neue Vertragsfälle**, einschließlich echtem explizitem Aufgabenstart,
  unveränderten Daten bei verfrühter Mastery und weiterhin gültiger gewöhnlicher
  Mastery-Recovery;
- **156 bestehende automatische Kontrollen**, einschließlich explizitem
  Periodenpensum und getrenntem Gesamtfortschritt;
- **der ursprüngliche J8-Test**, mit unveränderten positiven Erwartungen an
  genau sechs auswählbare Prüfungen und ihre Coach-Projektion.

Diese 179 Fälle liefen ohne Skips oder Abbrüche. Der frühere Nachlauf mit
127 von 128 bestandenen Fällen bleibt historisch; daraus wird kein neuer
vollständiger 128er- oder 553er-Lauf behauptet. Die gesamte Java-Produktion
kompiliert zusätzlich mit Corretto 25 in einem separaten Buildverzeichnis.

[Bindungen](binding.json), [gezielte Nachweise](targeted-proof.json),
[Astra-Review](astra-review.json), [Diagnose am tatsächlichen Trace](astra-trace-diagnosis.json),
[geprüfte Dateien](reviewed-payload.manifest.json), [Import](root-import.json).
Die separat erfassten [hessischen Referenzlücken](existing-data-reference-gaps.json)
bleiben fachlich offen; Tests oder Guards wurden dafür nicht gelockert.

Kein Produktionslernstand wurde verändert. Vollständige Backend-Suite,
GitHub-CI und die fachliche Mathematikfreigabe sind weiterhin getrennt zu prüfen.
