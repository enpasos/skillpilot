# Goal Visualization Review - Mathematik Batch 216

Review date: 2026-08-28

Scope: dringende fachliche Korrektur der aktiven Visualisierung zum Lernziel
„Grenzwerte des Differenzenquotienten bestimmen“.

Status: `completed`

## Entscheidung

| Goal ID | Lernziel | Entscheidung | SHA-256 und fachliches Prüfergebnis |
| --- | --- | --- | --- |
| `b42bdfcc-3db7-5697-8b3e-69e50962ca86` | Grenzwerte des Differenzenquotienten bestimmen | `accepted_documented_repo_native_fallback` | `514af0868752c41d908acc4989b683026a90ee144571ee6d5ead4fdfb93dacd0`; alle Werte, Punktkoordinaten, Sekantensteigungen, die Tangente, h ≠ 0 und der beidseitige Grenzübergang sind exakt. Sieben gefüllte Punktlabelboxen halten mindestens 6,854 px Abstand zu geplotteten Strichen; außerhalb ihrer autorisierten Bereiche änderte v3→v4 0 Pixel. Chromium und librsvg sind semantisch gleichwertig (SSIM 0,987306). |

Die kanonische, öffentliche und Backend-PNG-Kopie ist SHA-256-identisch.
Die bindende Geometriequelle ist `repo-native-geometry-v4.svg` mit SHA-256
`1b135b3a386bc1c568c6ee44ab06fc9f2f41711797473ffe521a7933ecd95713`. Die KI-Freigabe wird nur an den finalen
Rasterhash gebunden; eine menschliche Freigabe wird nicht behauptet.

## Belegter Mangel der vorherigen aktiven Fassung

Die vorherige Nano-Banana-Pro-Fassung mit SHA-256 `42430b0e850fc21be654f6b914bd4545dfd619e0d1e356ccce437c33e6bfa5b2`
zeichnete Q₃(1,01|1,0201) weit links und unterhalb von P(1|1), statt
unmittelbar rechts oberhalb von P auf f(x)=x². Die zugehörige Sekante konnte
deshalb den tabellarischen Wert D(0,01)=2,01 nicht geometrisch darstellen.
Die ansonsten korrekte Formel und Tabelle retteten die irreführende Zeichnung
nicht.

## Drei verworfene Nano-Banana-Pro-Korrekturversuche

Nano Banana Pro blieb der zuerst verwendete Standardprovider. Alle drei
Kandidaten wurden unter `--no-import` erzeugt und in Originalauflösung
fachlich geprüft:

1. `ca01e1a2066f33aa728ce9a20e0c620dc690dbd07e1b7ebcdd4c0782a36baa49`: gezielte Bild-zu-Bild-Korrektur
   auf Basis des vorherigen aktiven Bildes. Q₃ blieb weit links und unter P;
   der zentrale Geometriefehler bestand unverändert fort.
2. `3cc58ebb91a036833ca358dfa81a6b076e4fc613b43439503b17e796645c0cea`: freie Neugenerierung mit
   expliziter Drei-Panel-Geometrie. Im rechten Hauptdiagramm lag P(1|1)
   fälschlich im Achsenursprung beziehungsweise am Scheitel der blauen
   Parabel; links verlief die grüne Sekante nicht zuverlässig durch P.
3. `fba586eed1755b5c90bd14f34cf57157d441a202e24396e5d1ca4ad5fbb97133`: Style-only-Bildkorrektur mit
   der konstruierten Chromium-Referenz `a832b1cfd11d0aa8dbd261dbd92f16f264fdcc5c46603695e612c05a977ac0f9`
   und dem Append-Prompt `4b46c0e04f004713cacae01761d3c71470d3acf5c9e078e74b1d42f868f1daff`.
   Im Zoom waren beide x-Ticks als 1,000 statt 1,000 und 1,010 gesetzt; der
   obere y-Tick lautete 1,201 statt 1,0201, der untere war beschädigt, und das
   Achsenlabel wurde zu „x gloka“. Außerdem wurde die äußere Q₂-Koordinate
   abgeschnitten und der grüne m(PQ)-Balkentext über die Panelkante geschoben.

## Drei verworfene repo-native Vorstufen

1. SVG v1 `6e28d9220ff8554731533e3ff9c561d69b17ec3cdc1594979cef87774eeb63ff` wurde im Chromium-Render
   `a832b1cfd11d0aa8dbd261dbd92f16f264fdcc5c46603695e612c05a977ac0f9` wie beabsichtigt dargestellt.
   `rsvg-convert 2.52.5` erzeugte jedoch das PNG `e230ae69a4df3790f1168d8b861979bccdb980ed6247b2a8fcb570336d0a1495`
   mit großen orangefarbenen Vollflächen aus `feDropShadow`/Filtern; dieses
   Produktionsraster war technisch unbrauchbar.
2. SVG v2 `06a5893320cafba0cb38f05e991862730a8029e982a69e876a3973910641e4ac`, Chromium-PNG
   `22cb8e0d0e4c63c90b86b1aa505fef9bac145c3bfd42c4ff8b79d27d70862456` und rsvg-PNG
   `86319d6dc3eca3767a6cbf85d9a8296a987add12921d3d8e1f1e3dbefbc8cb3c` hatten korrekte Grundgeometrie,
   wurden aber fachlich/pädagogisch verworfen: In der Formel fehlte h≠0, die
   Tabelle belegte nur h→0⁺ statt des zweiseitigen Grenzübergangs, Kurven
   kreuzten Tangenten- und Q-Beschriftungen, und zwei Kopfkapseln waren zu eng.
3. SVG v3 `d6575ed1bfdfadd633313bbff51b08e4c401f22a08518a35bfaa806f7ace518f`, Chromium-PNG
   `56827196e276bc8ef8c17d37263731b173cb935336480d1ce80243709040c440` und rsvg-PNG
   `7c3346bdc783134f77e096c0e33c26f69ba712b26f16eb9e4fc4f1ac3ca28cda` korrigierten Formel, zweiseitige
   Tabelle, Schluss und Kapselabstände. Die ungekapselten Punktlabels P, Q₁
   und Q₂ im Hauptdiagramm sowie P und Q₃ im Zoom lagen aber weiterhin in
   denselben Bildschirmbereichen wie Kurven oder Geraden; besonders Q₂ und
   die kleinen Zoomlabels wurden sichtbar von Strichen durchzogen.

## Begründung der engen Ausnahme

Erst nach drei gezielten Nano-Banana-Pro-Fehlschlägen wurde die repo-native
Ausnahme aktiviert. Sie ist hier notwendig, weil das Lernziel gleichzeitig
exakte Punktlagen, Sekantengeraden, einen zweiseitigen Grenzübergang und
fehlerfreie Dezimalbeschriftungen verlangt. Andere fachlich korrekte
Nano-Banana-Pro-Visualisierungen werden durch diesen Korrekturschritt nicht
ersetzt.
