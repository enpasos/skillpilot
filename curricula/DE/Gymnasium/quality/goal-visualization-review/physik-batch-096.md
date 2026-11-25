# Physik · Bildreview 096 · Newtons zweites Axiom und Impuls

25. November 2026. Vier KI-Sichtprüfungen am ausgelieferten JPEG in 1600 × 900 und an seiner 360 Pixel breiten Darstellung. Die Kopien für Fachkatalog, Web und Backend sind bytegleich.

## Einzelimpulse und Gesamtimpuls auf einer Geraden bestimmen

**ACCEPT**. Rechts ist positiv. Der linke Wagen trägt +3 kg·m/s bei, der rechte −1 kg·m/s. Beide haben die Masse 1 kg und die Impulssumme beträgt +2 kg·m/s. Vorzeichen, Werte, Pfeilrichtungen und Ergebnis sind bei 360 px lesbar.

JPEG SHA-256 `fce0ee0e0774e6a3441820cda52392fe0b385353a32024997428a5eee0fc48b0`. Generatorausgabe vor Größenanpassung `ba32c0cd5a7a5ef0fe3061064f9a04973f4922d58de80a0773233972b1369e5f`. [Bild und tatsächlicher Auftrag](../../visualizations/physik/53afbda1-5776-502b-8867-471975d7b766/prompt.de.md)

## Mittlere resultierende Kraft aus der Impulsänderung bestimmen

**ACCEPT**. Zwei Zustände desselben Wagens: p₁ = +3 kg·m/s bei 1 s, p₂ = −1 kg·m/s bei 3 s. Für positive Richtung rechts ergibt sich (−1 − 3)/(3 − 1) N = −2 N, also eine mittlere Kraft nach links. Beide Impulspfeile sowie Zeitpunkte und Ergebnis sind bei 360 px lesbar.

JPEG SHA-256 `724f0d28904e8b8054b8042a7385a62c211ce9ae67be4c13312500bb1cc03c9b`. Generatorausgabe vor Größenanpassung `c4d10832886cee4ace7fd647f1750dcf8c7830ffacdbb168fb356de5c957ee1e`. [Bild und tatsächlicher Auftrag](../../visualizations/physik/ecbaa101-cb10-5da3-9368-ae40ff587d74/prompt.de.md)

## Momentane resultierende Kraft aus der Steigung im Impuls-Zeit-Diagramm bestimmen

**ACCEPT**. Durchgezogene Impulskurve p = 4 − t²/2 und gestrichelte Tangente p = 6 − 2t berühren sich im markierten Punkt (2 s, 2 kg·m/s). Die Tangentenpunkte (1 s, 4 kg·m/s) und (3 s, 0 kg·m/s) ergeben die Steigung −2 N. Bei 360 px sind Achsen, Zahlen, Markierung und Ergebnis lesbar.

JPEG SHA-256 `851b2f3779e77c7ad879d20578530a0abac10318e83642bfc13057429aaf0eab`. [Bild und tatsächlicher Auftrag](../../visualizations/physik/059c1adc-e4d2-5222-a923-15abc417d59f/prompt.de.md)

## Newtons 2. Axiom (Grundgleichung der Mechanik)

**REPLACE**. Bei konstanter Masse 2 kg gilt 6 N / 2 kg = 3 m/s². Der obere Pfeil für die resultierende Kraft und der untere Pfeil für die Beschleunigung zeigen nach rechts. Die Pfeile stehen für verschiedene Größen. Die Textzeilen, Einheiten und beide Pfeilspitzen sind bei 360 px lesbar.

JPEG SHA-256 `94f1d4f56e115e7d8339029a611ea9dc7975aaaa23c95150942897897647630a`. Generatorausgabe vor Größenanpassung `f377c9bc2239e677500264a0c87acd4751de8a4e3e8207123e0845b06f4c5c36`. [Bild und tatsächlicher Auftrag](../../visualizations/physik/a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20/prompt.de.md)

Die drei Wagenbilder stammen aus der ChatGPT/Codex-Bilderzeugung nach AGENTS.md §7.3. Für Newton 2 enthielt der Auftrag zwei gleich gerichtete Pfeile und ein Zahlenbeispiel bei konstanter Masse. Für den Gesamtimpuls verlangte er zwei gleichzeitige Wagen mit entgegengesetzten Geschwindigkeiten. Für die mittlere Kraft verlangte er denselben Wagen zu zwei Zeitpunkten und einen Impulswechsel über null. Alle drei Erstausgaben bestanden die Sichtprüfung. Beim Export wurde die Leinwand von 1672 × 941 auf 1600 × 900 angepasst.

Das frühere Newton-Bild (`57b21a77d205429a3b9a6905e19da7085020d160e252ddcfa2738161253a6817`) zeigte den Impuls, die Differentialform und den Spezialfall konstanter Masse. Es überschritt den engeren Newton-Auftrag. Für die Momentankraft fehlt darin die Tangente, deren Steigung die Lernenden ablesen sollen. Hier greift die Präzisionsausnahme aus §7.3. Das [Zeichenprogramm](physik-batch-096-evidence/momentum_tangent.py) verwendet dieselbe Koordinatenabbildung für Kurve, Tangente und Steigungsdreieck. In der ersten Zeichnung berührte die Beschriftung der Zeitachse den fallenden Graphen in der Mobilansicht. Die endgültige Zeichnung rückt die Beschriftung frei und setzt die Null links neben die Achse.
