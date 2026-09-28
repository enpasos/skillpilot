# Mathematik M7: drei zuvor zurückgestellte Bildziele mit neuen PNGs

Review date: 2026-09-27

Die exakten Originalbilder und 360-px-Kartenvorschauen wurden unabhängig
gegen aktuelle DE/EN-Ziele und P-v2-Profile geprüft. Ausführliche fachliche
Einzelbefunde stehen in
`m7-six-provider-deferred-candidate-triage-20260927-v1/review.md`; die
tatsächlichen textbasierten Gemini-Requests, nachfolgenden OpenAI-Edits und
Rechteabgrenzung in dessen `provenance-rights-dc12-9de-c406.md`. Die
verworfenen Nutzerbilder waren keine Inputs der ausgewählten Bildketten.
Provider und finale Prompts sind im kanonischen Import je Ziel angegeben.
Eigene didaktische Beiträge tragen CC BY 4.0, soweit entsprechende Rechte
bestehen; das ist keine Garantie der Schutzfähigkeit aller KI-Pixel und
keine menschliche Bildfreigabe.

| Goal ID | Decision | Exact active PNG SHA-256 | Fachlicher Befund und Grenze |
| --- | --- | --- | --- |
| `dc12f281-f161-572b-a973-8405ae9b2498` | `accepted_pilot_after_original_resolution_ai_review` | `sha256:107ce45905fc8013470e02559d55d8ee9185f620c4401cb337d80e280fdee458` | Für `h(t)=1+4t−t²` auf `[0,4]` stimmen die Punkte `(0|1)`, `(2|5)`, `(4|1)`, `h′(t)=4−2t` und die waagerechte Tangente bei `t=2`. Tankstand und Graph passen zusammen, bei 360 px lesbar. Ein Optimierungsbeispiel, kein vollständiger Nachweis der breiteren LK-Kompetenz. |
| `9de07e13-6a5f-5b49-a6d4-0decefb95784` | `accepted_pilot_after_original_resolution_ai_review` | `sha256:14fd9e3a28fa9a6b38b6b636e1a1e18a04eacba0104025b81a4e684f8e91e640` | Bei `X~Bin(10;0,5)` ist `P(X≥6)=386/1024≈0,377>0,20`, `P(X≥7)=176/1024≈0,172≤0,20`; `7` ist die kleinste passende Grenze. Zahlen und Zeichen sind auf der 360-px-Karte lesbar. Nur der `k`-Fall, nicht die im P ebenfalls geprüften unbekannten `n` oder `p`. |
| `c406d5a0-e81d-5ce9-b535-6512a38798de` | `accepted_pilot_after_original_resolution_ai_review` | `sha256:059f180b2159ffb4ba444775a85af37b9d7c1d030483944b8fedefe80b950f4b` | Für `X~N(100;15²)` ergibt `P(X≤b)=0,975` mit `z≈1,96` die Grenze `b≈129,4`, knapp links von 130; rechts verbleiben 2,5 %. Kerninhalt bei 360 px lesbar. Das Bild zeigt nicht den separaten P-Fall eines unbekannten Verteilungsparameters. |

Die früheren `deferred_provider_limitation`-Einträge betrafen verworfene
Pixelstände. Die vier Bildkopien pro Ziel – temporärer Kandidat, kanonisch,
öffentlich und Backend – haben jeweils denselben oben angegebenen SHA-256.
Alttexte beschreiben nur das tatsächlich Gezeigte. Die maschinelle V-QA ist
auf diese Hashes gebunden; `humanApproved=no`. Neue bildgebundene D- und
gezielte P-Prüfungen bleiben eigenständige Schritte. Technischer Import und
Bildfreigabe sind kein M7-Abschluss.
