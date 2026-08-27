# Goal Visualization Review - Mathematik Batch 210

Review date: 2026-08-27

Scope: Nano-Banana-Pro-Visualisierungen für die sieben bereits dual geprüften
atomaren Ziele aus Batch006a und Batch006b; unveränderte Kontrollprüfung des
bereits bebilderten Verhältnisgleichungsziels.

Status: `completed`

## Entscheidung

| Goal ID | Lernziel | Entscheidung | SHA-256 und fachliches Prüfergebnis |
| --- | --- | --- | --- |
| `99ef0fc2-150a-51e8-bac8-7e40e46917b` | Volumina von Quadern, Würfeln und daraus zusammengesetzten Körpern bestimmen | `accepted_pilot_after_regeneration` | `b51f224ff0f4ddfe785244b8e8fa3d43f99d3dc7db4fe92e8be18a3ef42baed7`; 3·3·3 = 27 cm³, 4·3·2 = 24 cm³ sowie 3·2·2 + 1·1·2 = 14 cm³ stimmen mit den dargestellten Körpermaßen überein. |
| `cddcdabd-ad58-58ad-bfbd-d9fd8fe2d8fa` | Oberflächeninhalte von Quadern und Würfeln aus ihren Seitenflächen berechnen | `accepted_pilot_after_regeneration` | `0d2c1b70802a76bf4f006d24d5643287813b10d60f95b500df0a353257fdd014`; die drei Flächenpaare sind jeweils kongruent und korrekt als 2 × (4 cm × 2 cm), 2 × (4 cm × 3 cm) und 2 × (3 cm × 2 cm) gekennzeichnet; O = 52 cm² stimmt. |
| `2f3d24e7-2450-55d8-97c2-3e106d2854c6` | Achsenspiegelungen konstruieren | `accepted_pilot_after_regeneration` | `21b50a625a4ede1e298adbd860eab0cc3db9394830e6f2f9bb470669e1f72dcc`; die drei Punktpaare liegen jeweils auf einer Waagerechten senkrecht zu g und haben beidseits den gleichen Abstand; die Dreiecke sind achsensymmetrisch. |
| `50e4ecab-d462-5496-b493-b30d699eb100` | Punktspiegelungen konstruieren | `accepted_pilot_after_regeneration` | `e4e6579bd927e042c8bfeb60516693d10fa9bbe1fe1f654867df8dfb676f3d09`; P(−3\|2), Z(0\|0) und P′(3\|−2) sind kollinear, Z ist durch Koordinaten und gleiche Teilstrecken korrekt als Mittelpunkt dargestellt. |
| `f52e9d72-4995-5c80-91d2-7761ea0cbec0` | Netze von Quadern und Würfeln zeichnen | `accepted_pilot_after_regeneration` | `6793df66e72fdf9cebb3f0f2ea5bb48f773ab04865f55dbe5448b06235e38024`; genau sechs zusammenhängende Quadrate bilden ein gültiges Würfelnetz; die Faltung zeigt keine Überlappung und keine erfundene Flächennummer. |
| `bce2c2cb-5594-5c19-8ae7-bd8c5e1ada82` | Eine orthogonale Ansicht eines Quaders oder Würfels zeichnen | `accepted_pilot` | `25a4fa6b383bffa35fb295dff18c923a543374f105c8e01c29ce1d4e291f6118`; Blick entlang der 3-cm-Tiefe, orthogonale Vorderansicht mit Breite 5 cm und Höhe 2 cm, keine Tiefe in der ebenen Ansicht. |
| `6bb52f96-6320-5a34-afb0-db9b471dd4ac` | Schrägbilder von Quadern und Würfeln zeichnen | `accepted_pilot_after_reference_guided_regeneration` | `c70e1f7f6c0a587c60579094833fc3652290ab396d15f0ef7c580ef9c4c47e02`; Vorderfläche 4 cm × 3 cm, vier parallele 45°-Tiefenkanten mit Halbverkürzung 2 cm → 1 cm; die verdeckten Kanten treffen korrekte hintere Eckpunkte. |

Alle sieben aktiven JPGs wurden in Originalauflösung fachlich und auf
Lesbarkeit geprüft und zusätzlich unabhängig gegengeprüft. Die kanonische,
öffentliche und Backend-Kopie ist je Ziel hashgleich. Die KI-Freigabe ist im
QA-Ledger an genau den genannten SHA-256 gebunden; eine menschliche Freigabe
wurde nicht behauptet.

## Verworfene Nano-Banana-Pro-Versuche und gezielte Korrekturen

- `99ef...`: Erstversuch `2026-08-27T09-19-33-166Z` verworfen, weil der grüne
  Teilquader sichtbar mit 3 cm × 3 cm × 2 cm bemaßt war, die Rechnung jedoch
  12 cm³ behauptete. Der gezielte zweite Versuch bindet 3 cm × 2 cm × 2 cm und
  1 cm × 1 cm × 2 cm widerspruchsfrei an 14 cm³.
- `cdd...`: Erstversuch `09-20-14-527Z` verworfen, weil die Benennungen der
  Flächenpaare den Maßen nicht entsprachen. Versuch `09-27-58-104Z` zeigte
  innerhalb der angeblichen Paare unterschiedlich große Rechtecke. Der erste
  referenzgeführte Versuch `09-33-17-306Z` hatte korrekte Paare, aber
  überlagerte Formel und Flächen. Erst `09-34-42-370Z` trennt alle Inhalte
  lesbar und hält drei kongruente Paare ein.
- `2f3...`: Der erste fachlich bereits tragfähige Versuch
  `09-21-01-889Z` enthielt doppelte Wortlabels. Die gezielte zweite Fassung
  reduziert die Beschriftung und macht die paarweise Symmetrie am Raster klarer.
- `50e...`: Erstversuch `09-21-39-367Z` verworfen, weil zusätzliche A- und
  A′-Punkte den korrekt beschrifteten Koordinatenpaaren widersprachen. Die
  Korrektur verwendet ausschließlich P, Z und P′.
- `f52e...`: Versuche `09-22-35-210Z` und `09-29-54-666Z` verworfen, weil der
  gefaltete Würfel trotz eines Netzes mit Flächen 1 bis 6 oben die unmögliche
  Nummer 7 trug. Die referenzgeführte Endfassung nutzt keine Flächennummern und
  zeigt die sechs Netzflächen farblich.
- `6bb...`: Erstversuch `09-24-02-003Z` verworfen, weil 1 cm an der
  3-cm-Vorderflächenhöhe stand und verdeckte Kanten in einer Fläche endeten.
  Der zweite Versuch nutzte eine exakte temporäre Referenzgeometrie und
  korrigierte Maßlage, Parallelität und Eckpunktanschlüsse.
- `bce...`: Der Erstversuch war fachlich korrekt und benötigte keine
  Regeneration.

Alle aktiven Fassungen stammen aus `Google Gemini / Nano Banana Pro
(gemini-3-pro-image)`. Es wurde keine eigene oder OpenAI-Grafik als aktive
Fassung eingesetzt.

## Unverändert erhaltene Bilder

| Goal ID | Lernziel | Entscheidung | SHA-256 und Prüfergebnis |
| --- | --- | --- | --- |
| `671ef00a-034e-5c2b-85ef-c6fa6eb7f1f6` | Verhältnisgleichungen lösen und prüfen | `accepted_unchanged_nano_banana_reverified` | `520caae51b4878fc6aab3a5b9000edc17fdad134cc4aa4162f5882410a98e97f`; bestehendes Bild nicht ersetzt; Definitionsbedingung x ≠ 2, Äquivalenzkette zu x = −7 und Probe mit 2/3 stimmen. |

- Die bereits vorhandenen Nano-Banana-Pro-Übersichten der Elterncluster
  `1f89d69e-ead1-424b-8221-fae37fdea2bc`,
  `1335dff9-db1e-5dd6-aa55-3938b6d3b0ec` und
  `59098969-0a35-5a58-94f2-1cfcdf191cf5` bleiben aktiv. Die spezifischen
  Kinderbilder ergänzen diese Übersichten und ersetzen sie nicht.
