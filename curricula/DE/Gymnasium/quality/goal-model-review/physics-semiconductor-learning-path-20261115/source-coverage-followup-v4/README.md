# Nachtrag zur vollständigen Quellenprüfung

Die vollständige Quellenprüfung fand nach dem v3-Zwischenstand genau ein
sichtbares unbelegtes Ziel: die funktionale Diodenkennlinie `dc55adac` in BY.
Die bereits unverändert gespeicherte erste NTG-Kompetenz nennt ausdrücklich
die Interpretation der aufgenommenen Diodenkennlinie. Diese Teilkompetenz
wird deshalb zusätzlich auf das funktionale Ziel abgebildet. Die eigene
Aufnahme bleibt beim experimentellen Ziel `3857891b`; eine vorgegebene
Kennlinie weist diese Durchführung weiterhin nicht nach.

[functional-diode-source-binding.json](functional-diode-source-binding.json)
bewahrt die vorherige Entscheidung und bindet die aktuelle partielle
Zuordnung an dieselbe konkrete Quelle. Die noch fehlende eigene
Verstärkeruntersuchung bleibt ausdrücklich offen. Es entsteht keine
Behauptung vollständiger NTG-Abdeckung und keine geänderte Kompetenz,
Voraussetzung, Prüfung, Lernleistung oder historische Reviewentscheidung.

[current-inputs.json](current-inputs.json) vergleicht tatsächlich alle
108 Pins des v3-Zwischenstands. Geändert sind genau die BY-Zuordnung, ihr
Generatoroverlay und der typisierte Regressionstest. Die anderen 105 Pins,
einschließlich kanonischer Inhalte, Aufgaben, Bilder und Quellen, bleiben
gleich. Der Typvertrag des B034-Generatoraufrufs ist zusätzlich präzisiert.
Die alten v3-Belege bleiben als Nachweis ihres damaligen Standes erhalten.

Die aktuelle vollständige Quellenprüfung und der Test aller 33 Klauseln,
vier Mappings, vier unveränderten Quellen und 70 Sichtpfade bestehen.
TypeScript und ESLint bestehen für die angepassten Prüf- und Hilfsfunktionen.
Die gespeicherten Ausgaben dokumentieren diese tatsächlichen Läufe; sie
ersetzen weder die vollständigen Inhaltsprüfungen noch integrierte Main-CI.
