# Mathematik M7: gezielte Neubindung nach Text- und Quellenprüfung

Diese maschinelle Curriculum-QS betrifft genau `7d37513b`, `d1352ce0`,
`c1c80b80`, `f257b71b` und `baea3966`. Die fachlichen Einzelbefunde,
aktuellen Fingerprints, tatsächlich betrachteten PNGs und Quellstellen stehen
in `targeted-five-gate-review.json`. Kein Eintrag behauptet eine menschliche
Prüfung, Freigabe oder Lernendenleistung.

Für die drei geänderten Zielbeschreibungen wurden semantische Atomarität,
Memory-Entscheidung und authoritative `curricularAtomic`-Bindung nach
inhaltlicher Prüfung erneuert; die neun gezielten Änderungen stehen in
`targeted-a-m-bindings.json`. Die vorhandene Mittelwert-Karte
`math_analysis_c16` bleibt ein enger Formelabrufbaustein. Bei `f257b71b`
stand die Schwerpunkt-Herleitung im amtlichen Saarland-LK-Lehrplan auf
PDF-/Druckseite **34**, nicht 33. Das Ziel und Bild bleiben unverändert, der
neue P-v2-Kandidat nennt die richtige Stelle. Der fachlich gültige alte
Cavalieri-P-Nachweis für `baea3966` bleibt aktiv.

`positive-evidence.config.json` bindet vier fachlich geprüfte Profile neu.
Der Fall `k=1` und ein explizit konventionierter Nullvektorfall ergänzen die
alten Transfers. Die Nachweise bleiben wahrheitsgemäß `ai_candidate` und
`needs_human_review`. Die beiden separaten Retained-Konfigurationen bewahren
die unveränderten gültigen Begleitprofile für `235ae698` und `ba343971`,
ohne alte Mehrziel-Dateien umzuschreiben.

Für die zentrale Registry sind deshalb die bisherigen P-Konfigurationen von
`7d37513b`, `d1352ce0`+`235ae698`, `c1c80b80`+`ba343971` und `f257b71b`
durch `positive-evidence.config.json`, `retained-235ae698.config.json` und
`retained-ba343971.config.json` zu ersetzen. Die bisherige
`baea3966`-P-Konfiguration bleibt erhalten. Die D-Reviewbindungen werden
getrennt am aktuellen Seiten-/Quellenkontext erneuert.

Gezielte Validatoren bestanden: A 807/807, M 807/807 mit 0 fehlenden
Karten-/Sichtbarkeitsbindungen im konfigurierten Prüfumfang, P für vier neue
und zwei unverändert übernommene Kandidaten ohne Blocker, V-QA/Status aktuell
und Bildhashes für alle fünf Ziele korrekt. `git diff --check` war grün.
