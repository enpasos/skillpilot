# Bildrekonstruktionsprompt: Inverse Fragestellungen zu Binomialverteilungen lösen

## SkillPilot-Ziel

- SkillPilot-ID: `9de07e13-6a5f-5b49-a6d4-0decefb95784`
- Titel: Inverse Fragestellungen zu Binomialverteilungen lösen
- Beschreibung: Die lernende Person kann bei vorgegebener Binomialwahrscheinlichkeit systematisch einen unbekannten Wert von $n$, $p$ oder einer Ereignisgrenze $k$ bestimmen und die gefundene Lösung im Kontext prüfen.

## Generator

- Provider: OpenAI / Codex image generation (edit of Gemini gemini-3-pro-image output)
- Quellbild: `9de07e13-6a5f-5b49-a6d4-0decefb95784.png`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Erzeuge eine freundliche, klare 16:9-Lernzielgrafik im warmen Creme- und Farbkartenstil, lesbar bei 360 Pixel Bildbreite. Oben „Welcher Grenzwert passt?“ und darunter X~Bin(10;0,5), gesucht ist das kleinste k mit P(X≥k)≤0,20. Zwei gleich große Karten nebeneinander: links rot „k=6“, „P(X≥6)≈0,377>0,20“ und ein rotes Kreuz; rechts grün „k=7“, „P(X≥7)≈0,172≤0,20“ und ein grüner Haken. Unten groß „Kleinstes passendes k: 7“. Optional wenige neutrale Dekorpunkte, aber kein Histogramm. Alle Ungleichheitszeichen und Zahlen müssen exakt stimmen. Viel Leerraum, klare große Schrift, keine weiteren Formeln, Logos oder Wasserzeichen.
```
