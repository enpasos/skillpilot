# Archiv-MP: explizit leerer Geltungsbereich

Additiver Nachfolger zum STOP-Checkpoint. Nur `2b9e565f.applicability` wechselt von der alten Länderangabe zu `{}`. Der ausgeschlossene Knoten hatte bereits vorher keinen kompilierten Landesumfang. Die bestehende APV-203-Prüfung bleibt aktiv und besteht nun.

Der tatsächliche native Vergleich bestätigt APV-203 nur für diesen Knoten: 1→0. Alle kompilierten Zielumfänge und Evidenzen in 21 Landschaften sowie alle anderen Findings sind identisch. Der SK-Fingerprint bleibt `9e04c1c5…`; der V9-gestützte Vollcheck besteht für 863 Ziele. Aufgabe, Lösungen, Rubrik30/18, Identität und Resultate erhalten keine neue Bedeutung.

`review.actual.json` bindet das erlaubte Delta und die aktuellen Rohbytes. `native-probe.actual.json` ist das tatsächliche Ausführungsergebnis, `probe.executed.mts` die unverändert aufbewahrte Ausführungsquelle. Alte Belege bleiben unverändert.

`python verify-bindings.py` prüft die immutable Nachweiskette. Für eine neue aktuelle Gegenprobe vom Repositoryroot dient `node app/node_modules/tsx/dist/cli.mjs <dieserOrdner>/verify-current.readonly.mts`; der Helper schreibt keine Belege um. Ein später veränderter Katalog benötigt einen eigenen aktuellen Check. Keine neue Prüfungsfreigabe und keine main-CI-Aussage.
