# Mathematik M7: acht erhaltene P-v2-Nachweise nach Volumenbild-HOLD

Der bisherige Teilindex `upper-sec-retained-nine.config.json` enthält neun
P-v2-Records aus dem begonnenen Oberstufenpaket. Der gezielte
Produktionsvalidator meldet für acht unveränderte Records keine Blocker,
jedoch für `f2a12269-6bcb-564a-9fdb-45cfdbd704fc` einen veralteten
`reviewInputFingerprint`. Das Bild zu diesem Ziel ist wegen eines konkreten
Widerspruchs zwischen gezeichneten Frontflächen und der als gleich angegebenen
Grundfläche fachlich zurückgestellt; siehe
`curricula/DE/Gymnasium/quality/goal-visualization-review/mathematik-m7-quality-holds-2026-09-23.md`.

`upper-sec-retained-eight-after-volume-hold.review.jsonl` enthält exakt die
acht unveränderten Originalzeilen aus `upper-sec-retained-nine.review.jsonl`.
Der SHA-256-Digest der acht Quellzeilen nach Herausfiltern der f2a-Zeile
und der neuen Datei ist identisch:
`e622362196113dce0fac9c3e528d6993543bb1b4a9294e96caff9a9cfd735afe`.
Es gab weder ein neues fachliches Review noch eine Hash-Neufreigabe. Die
historischen Dateien bleiben unverändert.

Gezielte Validierung:

```bash
npm --prefix app run quality:positive-goal-evidence:check -- --config=curricula/DE/Gymnasium/quality/goal-evidence/m7-four-new-png-bound-p-20260923-v1/upper-sec-retained-eight-after-volume-hold.config.json
```

Ergebnis am 23.09.2026: acht gültige `needs_human_review`-AI-Kandidaten,
null Validator-Blocker. Dieser maschinelle P-v2-Status ist keine menschliche
Freigabe. Der ausgeschlossene f2a-Record bleibt offen; erst eine fachlich
korrigierte und überprüfte Bildbindung sowie eine aktuelle P-v2-Prüfung können
ihn wieder in die strenge Fünf-Gate-Schnittmenge bringen. Die zentrale Registry
muss gesondert auf den neuen Acht-Ziele-Teilindex zeigen, damit der lokale
Validatorerfolg im zentralen Bericht wirksam wird.
