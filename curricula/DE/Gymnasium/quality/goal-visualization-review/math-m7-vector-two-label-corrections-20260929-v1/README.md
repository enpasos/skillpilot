# Zwei gezielte Vektorbild-Korrekturen (29.09.2026)

Dieses Paket dokumentiert Bitmap-Korrekturen an den bestehenden, freundlich
illustrierten Lernzielbildern. Beide alten JPGs wurden in den jeweiligen
Unterordnern bytegleich als `superseded-original.jpg` archiviert; ihre
ursprünglichen Prompts und beim Streckenbild auch der Rekonstruktionsprompt
liegen daneben. Die drei alten aktiven Source-/Public-/Backend-Kopien pro Ziel
wurden erst nach Hashvergleich entfernt. Die neuen PNGs liegen bytegleich an
allen drei aktiven Orten und behalten `reviewStatus: pilot`.

Die ersten tatsächlichen Bildgenerierungsaufrufe und Referenzen stehen in
[`first-round-prompts.md`](first-round-prompts.md). Für die letzte Korrektur
referenzierte `image_gen` jeweils `candidate.png` im Ziel-Unterordner. Der
exakte letzte Prompt liegt als `imagegen-final-selected.en.md` neben dem
ausgewählten `selected.png`. Das Werkzeug lieferte keine konkrete Modellkennung;
die Herkunft ist OpenAI/Codex-Bildgenerierung mit der vorhandenen Illustration
als Referenz. Erzeugung allein war keine Freigabe.

| Ziel | bisheriges JPG SHA-256 | blockierter PNG-Kandidat SHA-256 | aktives PNG SHA-256 |
| --- | --- | --- | --- |
| `d1352ce0` J9 Kollinearität | `e4cdef9030e7c66f871c8cd10ebaac0b058a14fb3dd4a82da12c34591c0aeb7e` | `2a4993c599d79ff2396d4473803fc8fadbf352eed961760656529ec2b4f7115c` | `3922a8d84e65101d7bff8709e8344665d38a1bce4035011f25343e0131c1eb40` |
| `235ae698` J10 Gerade/Strecke | `746f81f2827dfc60c390f95f6f5afc510ab5e5dd75bb946a774b16a64e441221` | `7084ccc4a06682abf2152e33858fb4dd9aafbbed403b6f7b4315a33f8d4981db` | `999e4b29e9132c1c007654e1130d27bf45b5dc7ac1b246f2e61b587f0b555450` |

Die **erste unabhängige Bildprüfung blockierte beide Kandidaten**:

- Bei `d1352ce0` nannte das negative Rechenbeispiel die inkompatiblen
  Teilfaktoren `k=3` und `k=0.5` gemeinsam eine „Lösung“. Im ausgewählten
  1678 × 937-PNG steht lesbar `Teilgleichungen: k = 3 bzw. k = 0,5` und
  `Kein gemeinsames k`. Der positive Fall `v=(2,4)`, `w=(1,2)` hat Faktor 2;
  im negativen Fall `a=(3,1)`, `b=(1,2)` passen die Komponenten nicht mit
  einem Skalar zusammen. Die geometrische Erklärung erlaubt gleiche **oder
  entgegengesetzte** Richtung freier kollinearer Vektoren; Startpunkte und
  parallele Lage sind korrekt getrennt. Formeln, Pfeile, Zahlen, Beschriftungen
  und Lesbarkeit wurden am tatsächlich aktiven Bild geprüft.
- Bei `235ae698` lag `A(1|2|0)` in beiden Panels auf einer einzelnen
  grauen Koordinatenachse; das ist bei zwei von null verschiedenen Koordinaten
  falsch. Im ausgewählten 1679 × 937-PNG fehlen diese dekorativen Achsen. Die
  Zeichnungen sind nun erkennbar schematisch. `B(4|3|2)−A(1|2|0)=(3|1|2)`;
  die Gerade verläuft mit `t∈ℝ` in beide Richtungen, die Strecke umfasst
  exakt `0≤t≤1` und hat keine Endpfeile. `Strecke AB`, das Label `s:`, die
  Formeln, Pfeile, Zahlen und Lesbarkeit wurden am aktiven Bild geprüft.

Beide ausgewählten Bilder sind damit **KEEP nach maschineller fachlicher und
visueller Prüfung**. Bei sehr schmaler Kartenansicht ist die reichhaltige
Beschriftung klein; in Originalgröße bleibt sie lesbar. Der aktuelle QA-Eintrag
bindet die KI-Prüfung an den jeweiligen PNG-Hash, während `humanApproved: no`
bleibt. Die GoalBook-Seiten 175 (J9) und 185 (J10) zeigen die PNGs als
`review_candidate` und `approvedForPublication: false`. Die gezielte neue
[P-v2-Bildbindung](../../goal-evidence/2026-09-29/math-m7-vector-two-png-image-bound-current-v1/README.md)
prüft eigenständige Transferfälle und erhält fünf unveränderte Profile. Die
unabhängigen D-Reviews und menschliche Freigaben sind damit nicht ersetzt.
