# Goal Visualization Review - Mathematik Batch 220

Review date: 2026-08-31

Scope: kritische Prüfung und Korrektur der aktiven Visualisierung zum Lernziel
„Rationale Zahlen an der Zahlengeraden darstellen und ordnen“ nach zentral
eingegangenem, digestgebundenem Lernziel-Feedback.

Status: `completed`

Review authority: `ai_candidate`

Finding status: `candidate`

Implementation status: `uncommitted_patch_prepared`

Human approval: `no`; Commit, Release und Deployment werden nicht behauptet.

## Entscheidung

| Goal ID | Lernziel | Entscheidung | SHA-256 und fachliches Prüfergebnis |
| --- | --- | --- | --- |
| `f6b13b8e-1ecd-5420-905d-21290aa996a6` | Rationale Zahlen an der Zahlengeraden darstellen und ordnen | `accepted_documented_repo_native_fallback` | `f218d0df5d07cc26aaa35f8a5cbf5c6d99413df1a3144f88d07e9d0eaf78b436`; die affine Skala `x(v)=800+300·v` bindet −1,5, −0,5, 0,75 und 1,25 exakt an `x=350,650,1025,1175`. Der PNG-Rasterfit hat 0 px Residuum; alle vier Punktzentren weichen 0,000 px ab. Gleichungen und Ordnung `−3/2 < −1/2 < 3/4 < 5/4` stimmen. |

Die kanonische, öffentliche und Backend-PNG-Kopie ist SHA-256-identisch. Die
bindende Geometriequelle ist `repo-native-geometry-v1.svg` mit SHA-256
`a9cadf033c51eab88789aaede68d00b0866a96f89b0b7cc85ee5a560b9e6b42d`.
Ein erneuter `rsvg-convert`-Render ist byteidentisch zum aktiven PNG. Die
KI-Freigabe ist ausschließlich an den finalen Rasterhash gebunden; eine
menschliche Freigabe wird nicht behauptet.

## Feedbackbindung und unabhängiger Befund

- Export-ID: `4279f7a8-0284-4570-9453-68a824b22de7`
- Feedback-ID: `cae684cd-b47a-4ecd-8de3-634e49d86661`
- Payload-Digest: `sha256:b137fa92584e582fb91011bf720a10d6f1abb94b0515a243c61f7f27418f9000`
- Envelope-Digest: `sha256:7da417b5129f92071eb091ac1b29e2d49a4bb0c0250f41ecc80d3f6701afd0bc`
- Produktionsbindung: `exact_current`; lokaler Vergleich: `local_match`
- Gebundenes Buch: `de-gym-mathematik-bundesweit`, Edition `curricular-atomic-v1`, Seite 40
- Ziel-Fingerprint: `sha256:69e2c3571bc072e5b84b3b6c761f5f1ae968b6540815b5b50fc25bd19cbb51ac`
- Seiten-Fingerprint: `sha256:14f2cbdc5a281bb5cf1aef5dde7a1dc1fc4f49b5f80a83a0121bcfd29891a842`

Das externe Feedback blieb untrusted input und wurde nicht als Anweisung oder
Freigabe behandelt. Zwei voneinander getrennte Pixelprüfungen bestätigten den
Sachverhalt unabhängig: Im vorherigen aktiven JPEG lag das Zentrum des als
`−1,5` beschrifteten Punktes bei etwa `x=700,832`, die affine Sollposition aber
bei `x=633,623`. Die Abweichung von `+67,209 px` stellte ungefähr `−1,364`
statt `−1,5` dar. Zusätzlich lagen `0,75` ungefähr bei `0,717` und `1,25`
ungefähr bei `1,330`. Damit war auch die rückwirkende Freigabe aus Batch 209
sachlich falsch. Batch 209 bleibt als historische, durch diesen Batch
überholte Entscheidung unverändert erhalten.

Vorheriger aktiver Assethash:
`sha256:0f15837a2b8c33d3a9477375c6c36b9c85cb6c98cc2db96dfd4f88ac70837611`.

## Verworfene Korrekturversuche

Zwei vorläufige Korrekturen mit der integrierten Bildgenerierung wurden vor dem
Standardprovider-Lauf verworfen:

1. `c84f0eb19d1d0c5776c0970a68ca13374f5abc4ad1fa0fc0986499c64093cf28`: `−1,5` lag ungefähr bei `−1,606`, `0,75` bei `0,717`, `1,25` bei `1,329`.
2. `0064a8957614eb9d9df27762bfc6f4e305906d9efaa7abdd8977c1ba8597e155`: `−1,5` lag ungefähr bei `−1,576`, `1,25` nahezu bei `1,466`.

Nano Banana Pro blieb die maßgebliche Standardpipeline. Drei gezielte
Kandidaten wurden mit `--no-import` erzeugt und in Originalauflösung verworfen:

1. `e33371e90505e660b4dfc8abe54e0692fd64b8127be231f152486e157511ae7e`: `−1,5` lag ungefähr bei `−1,321`, `1,25` bei `1,318`.
2. `32eccbd16e43e234e800199f6c6cf21b88e3748baa16dbaafa01a2f1916de3bc`: negative Werte korrekt, aber `0,75` ungefähr bei `0,711` und `1,25` bei `1,332`.
3. `f7a5eb1845e940113f6e762b2111b1cb25a93a494d3ef1f875119958918b6901`: negative Werte korrekt, aber `1,25` nahezu exakt bei `1,499`.

## Begründung der engen Ausnahme

Erst nach den drei gezielten Nano-Banana-Pro-Fehlschlägen wurde die bereits in
Batch 216 etablierte repo-native Ausnahme aktiviert. Das Lernziel verlangt
rechnerisch exakte Punktlagen auf einer affinen Skala; weitere generative
Näherungen wären fachlich nicht vertretbar. SVG-Quelle, PNG-Render,
Wiederholungsrender, Geometrieprüfung und Review sind hashgebunden. Andere
fachlich korrekte Nano-Banana-Pro-Visualisierungen werden durch diesen Schritt
nicht ersetzt.
