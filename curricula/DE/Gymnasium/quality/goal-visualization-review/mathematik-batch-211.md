# Goal Visualization Review - Mathematik Batch 211

Review date: 2026-08-27

Scope: dringende fachliche Korrektur der aktiven Visualisierung zum Lernziel
„Sekanten-, Tangenten- und Normalensteigungen mit Steigungswinkeln bestimmen“.

Status: `completed`

## Entscheidung

| Goal ID | Lernziel | Entscheidung | SHA-256 und fachliches Prüfergebnis |
| --- | --- | --- | --- |
| `6aed5be9-f62f-482a-9b98-4253c3275e6e` | Sekanten-, Tangenten- und Normalensteigungen mit Steigungswinkeln bestimmen | `accepted_documented_repo_native_fallback` | `0ae37c04fbdf86dd6786dc609ffe50930daa0decfc478ca9708c2ac2afad77e1`; die Sekante verläuft exakt durch A und B und hat mit Δx = 2 und Δy = 1 die Steigung 1/2 sowie αₛ ≈ 26,6°. Tangente und Normale schneiden sich exakt in P, besitzen die Richtungsverhältnisse (1\|2) und (−2\|1), stehen senkrecht und tragen die konsistenten Werte mₜ = 2, mₙ = −1/2, αₜ ≈ 63,4° und αₙ ≈ 153,4°. Der Sonderfall zeigt eine exakt waagerechte Tangente und eine exakt senkrechte Normale mit nicht definierter Steigung. |

Das aktive 1600×900-PNG wurde in Originalauflösung geprüft. Die kanonische,
öffentliche und Backend-Kopie ist SHA-256-identisch. Eine unabhängige zweite
Prüfung bestätigte zusätzlich die konstruktiven SVG-Koordinaten, die
Steigungsdreiecke, die Winkelendpunkte und die Lesbarkeit. Die KI-Freigabe ist
an den oben genannten Hash gebunden; eine menschliche Freigabe wird nicht
behauptet.

## Belegter Mangel der vorherigen aktiven Fassung

Die vorherige Fassung mit SHA-256
`62985297634450c59e62687670fdbb6812c3d69fbfcfefcee76f2ce6405d7a1e`
zeigte trotz Titel und Zielbeschreibung überhaupt keine Sekante, keine zwei
Sekantenpunkte, keine Sekantensteigung und keinen Sekantenwinkel. Zusätzlich
blieb eine Beschriftung als „Steigung mₙ =“ unvollständig. Die korrekten
Tangenten- und Normalenwerte reichten deshalb nicht für eine Freigabe.

## Vier verworfene Nano-Banana-Pro-Korrekturversuche

Nano Banana Pro blieb der zuerst verwendete Standardprovider. Alle vier
Kandidaten wurden mit `gemini-3-pro-image` unter `--no-import` erzeugt und erst
in Originalauflösung geprüft:

1. `eacb17b7d698138d4e7ff22bb0d9524f74577417c64095babea3c75ed8c27560`:
   Die Sekante war ergänzt, aber die Normale schnitt die Tangente sichtbar
   neben P; auch der Sonderfall war nicht exakt waagerecht.
2. `46410fb103bd116b11f413d993ad649fa3c5e11a13b969db95d4cc298303ad17`:
   Der gezielte Bild-zu-Bild-Korrekturlauf ließ den falschen Schnittpunkt und
   die nicht exakt waagerechte Sonderfalltangente bestehen.
3. `4ea59b614a28d7e5e8afca7cc9787e7fa169c89040ce595f717aec6c3c2848f8`:
   In der freien Neugenerierung lagen die als (0\|0) bezeichneten
   Parabelscheitel oberhalb der x-Achse; die Tangente an x² bei (1\|1) lief
   außerdem fälschlich durch den Ursprung, und der Normalenwinkel war nicht
   eindeutig konstruiert.
4. `87dfe3ea6037d602f4e7a60084b0409d453ccec5225990824328b062db06f119`:
   Die lokale Darstellung vermied die Achsenfehler, zeichnete mₜ = 2 und
   mₙ = −1/2 jedoch sichtbar wie Geraden mit den Steigungen 1 und −1; auch der
   Normalenwinkelbogen belegte 153,4° nicht.

Erst nach diesen vier gezielten Fehlschlägen wurde die eng begrenzte
repo-native Ausnahme aktiviert. Der bindende Aufbau liegt in
`repo-native-geometry-v1.svg`; der dazugehörige Prompt ist
`prompt.repo-native-fallback-001.de.md`. Andere bestehende Visualisierungen
wurden in diesem Korrekturschritt nicht ersetzt.
