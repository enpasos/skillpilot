# B042s – Zwei gezielte Kurvenkorrekturen

Review date: 2026-09-07

Die B042r-Nachprüfung hat trotz korrekter Formeln zwei quantitativ falsche Kurven gefunden. Die versiegelten BLOCK/KEEP-Ergebnisse bleiben erhalten. Beide Ersatzbilder wurden vollständig als tatsächliche Raster von zwei Agentinstanzen geprüft; frühere Beteiligung an der Korrektur ist offengelegt. Dies ist KI-Evidenz, keine menschliche oder rechtliche Freigabe.

| Lernziel-ID | Ergebnis | Aktives Bild / SHA256 | Begründung |
| --- | --- | --- | --- |
| `f4935b24-d8a9-5eb7-a5eb-6d34a9e09b2d` | `accepted_ai` | PNG `71c5c1b7c91dd8a1cc6189fdf241541bae4c8f5888ae83401691af3c6c0d0712` | Nach zwei gezielten Nano-Fehlversuchen genehmigter enger nativer Ersatz: exakt berechnete 1/√x-Kurve, lineare Achsen, Singularität, Grenzwert und positive Fläche. |
| `e9ad45b9-c0d2-5804-b6bf-79e5ce041d2c` | `accepted_ai` | JPG `63330caeb94155284c50e874671871993391d2187f3ce47684e66755b9463066` | Nano-V1-Korrektur: linear skalierte x²e⁻ˣ-Kurve einschließlich richtigem abfallendem Ast; Produktregel, Maximum und Vorzeichen unverändert korrekt. |

Genauer Arbeitsstand: `goal-description-review/mathematik/rollout-v1/2026-09-07/batch-042r-final-local-corrections-8-v1/targeted-image-repair/` unter demselben Quality-Verzeichnis.

Dort binden `author-image-review-v1.json`, `f493-native-author-review-v2.json` und `root-image-counterreview-final2-v1.json` die tatsächlichen Bildprüfungen. `archive-before-import-v1/` erhält die alten Quellen samt QA, die zwei verworfenen Nano-Versuche, den wegen Beschriftungskollision verworfenen nativen V1-Entwurf, Prompts und Rekonstruktionsanweisungen. Der ursprüngliche vollständige f493-Nano-V1-Prompt wurde vom Generator überschrieben; diese Spurengrenze ist ausdrücklich dokumentiert, die konkrete Zusatzanweisung und das Referenzbild sind erhalten.

`adoption-check-receipt-v1.json` belegt: Nur die beiden Bildverweise und ihre QA-Zeilen geändert; alle anderen Lernziele und QA-Zeilen, sämtliche Texte, IDs, Abhängigkeiten und A/M-/Semantic-Kind-Bindungen unverändert. Die drei alten f493-JPG-Quell-/Runtime-Kopien sind nach Hashprüfung entfernt und aus dem Archiv wiederherstellbar. B042s prüft danach genau diese zwei aktuellen Seiten; die sechs bereits abgeschlossenen B042r-Ziele werden nicht erneut begutachtet.
