# Direkte Vorbereitungswege und unveränderte Kompetenzrollen prüfen

Eine Oberstufenkompetenz darf auf einer fachlich begründeten Vorbereitung aus
der Sekundarstufe I aufbauen. Die Prüfroutine behandelt diesen eingehenden
Vorbereitungsweg getrennt vom Weg zur eigenen Abschlussprüfung. In Richtung
`requires` darf der Beweis einmal in die frühere Stufe wechseln; dort muss
mindestens eine gewöhnliche curriculare Kompetenz liegen. Ein direkter Sprung
zum anderen Motivationsziel oder ein Rücksprung beweist diese Vorbereitung nicht.
Die Abschlussprüfung bleibt in der eigenen Stufe.

Die didaktische Rollenordnung verwendet den autoritativen `semanticKind`.
Eine curriculare Kompetenz bleibt als Voraussetzung nutzbar, wenn sie eine
eigene vollständige Prüfungsform erhält. Reine Prüfungsziele bleiben spätere
Routenknoten. Prüfungsstart, Schutz vor impliziter Erledigung, Aufgabenreife
und die 807 Ziele der Qualitätsprüfung bleiben unverändert.

Astra fand im ersten Implementierungskandidaten einen echten Fehler: Eine
gültige Teilroute konnte eine unzulässige gewöhnliche-Kompetenz-zu-Prüfung-Kante
im Nebenzweig verdecken. Die korrigierte Wache prüft sämtliche tatsächlichen
direkten Voraussetzungen der relevanten Teilnehmer. Die gefilterte Beweisroute
bestimmt nicht mehr, welche Kanten auf falsche Rollenordnung geprüft werden.
Die ursprüngliche Gegenprobe bleibt erhalten und schlägt jetzt korrekt an.

Die bestehende Suite, 16 Topologiefälle, zusätzliche Returning-/Future-/Ambiguous-
Gegenfälle und die Kompetenzrollenfälle bestehen. Astra prüfte den endgültigen
Vier-Dateien-Kandidaten und führte seinen Gegenfall erneut unabhängig aus.

Auf dem integrierten Analysis-Stand sinkt die Gesamtgraphprüfung von
**58 auf 49 Befunde**: sechs betreffen die legitimierte frühere Vorbereitung,
drei die unveränderte Kompetenzrolle. Alle übrigen 49 Meldungen bleiben exakt
erhalten; keine neue Meldung kommt hinzu. Der Root-Nachlauf bestätigt dieselbe
Menge und bleibt ausdrücklich mit Exitcode 1 rot. Curricula, Kanten, Lernstände
und die 2.695 zuvor gemessenen Runtime-Eingänge sind unverändert.

[Bindungen und Root-Nachlauf](binding.json), [Befundvergleich](full-graph-finding-multiset.json),
[Astra-Abschlussreview](astra-final-review.json),
[Vorbereitungsvertrag](astra-directed-preparation-contract.json),
[Rollenvertrag](astra-semantic-order-contract.json),
[ursprünglicher Blocker](astra-original-blocker.json),
[korrigierter Gegenfall](astra-corrected-branch-counterexample.json),
[geprüfte Dateien](reviewed-payload.manifest.json), [Import](root-import.json).

Es wird kein optionaler Level-Kursmodus eingeführt und keine vollständige
Mathematik-, M7- oder CI-Abnahme behauptet.
