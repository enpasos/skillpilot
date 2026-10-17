# Tatsächliche current439-Centraldiagnose

Genau ein Stock-Reportlauf: Exit0, Dauer99.856s. Originalstdout bleibt unverändert. **Strict0/439, strictCompletionReady=false,283 offene Issues.**

| Gate | Aktueller Zähler | Required-Check |
|---|---:|---|
| D |243|fail|
| P |439|pass|
| A |0|fail|
| M |439|pass|
| V |0|fail|

Scope439: pass.

| Ursache im Stockbericht | Meldungen | Verschiedene erwähnte Ziel-IDs |
|---|---:|---:|
|Mehrere aktuelle D-Eigentümer|36|36|
|Supersession ohne intakten alten Claim oder aktuelle Ersatzbindung|127|127|
|Aktueller V3-Kontext ungleich kanonischem Ziel|114|110|
|Aktueller V3-GoalFingerprint ungleich kanonischem Ziel/Klasse|2|2|
|Aktueller V3-DE/EN-Text ungleich kanonischem Ziel|1|1|
|Finaler Resolution-DE/EN-Text ungleich aktuellem Ziel|1|1|
|A-Produktionscheck: ein veralteter9b56-Record|1|1|
|V-Freshness des Ledgers fehlgeschlagen|1|0|

Die D-Gruppen zählen Meldungen über bestehende Claims und historische/aktuelle Bindungen; daraus folgen weder ebenso viele neue Fachfehler noch eine automatische Änderung der Eigentümer.105 Indizes,214 Supersessions und7 Withdrawals bleiben unverändert.

A nennt **einen** stale9b56-Record (missing0/non-atomic0/obsolete0). Der Stock-Loader liefert bei einem fehlerhaften Produktionscheck global die leere A-Menge. V liefert bei fehlender Ledger-Freshness ebenfalls die leere Menge. Diese Nullzähler stellen daher keine439 negativen Einzelurteile dar. Der eigene versiegelte Vorcheck benennt bei9b56 alte QA-Titel/Beschreibung; URL und alle Assetbytepins bleiben gleich. Root prüft den Bildkontext getrennt.

P und M bestehen tatsächlich für439. Das beantwortet die funktionale M-Unsicherheit des vorangegangenen Input-HOLDs für diesen genauen Maschinencheck; die dokumentierten ursprünglichen M-/Kartenunterschiede und Provenienzgrenzen bleiben erhalten. Kein neuer M-Vote.

Report-Exit0 ist keine bestandene Gesamtprüfung: D/A/V fail und strict0 bleiben offen. Keine neuen Science-/Native-/M-Votes, keine zusätzlichen Compiler-/PDF-Läufe und keine M7-/Human-/Hostfreigabe. Alle534 diagnostischen Eingabeguards bleiben unverändert.

Vollständige unveränderte Issue-Texte, Regeln und Quellenpins: `ISSUES.grouped.actual-current439-central-diagnostic.json`.
