# Bildrekonstruktionsprompt: Hypothesentests bei verändertem Stichprobenumfang variieren

## SkillPilot-Ziel

- SkillPilot-ID: `ae483d98-54e0-5985-96d2-fc1351d22e4f`
- Titel: Hypothesentests bei verändertem Stichprobenumfang variieren
- Beschreibung: Die lernende Person kann bei einem binomialen Hypothesentest einfache Variationen der Aufgabenstellung, insbesondere geänderte Stichprobenumfänge, rechnerisch nachvollziehen und Auswirkungen auf Entscheidungsregel, Fehlerwahrscheinlichkeiten oder Testentscheidung beschreiben.

## Generator

- Provider: Gemini Nano Banana Pro; ChatGPT/Codex imagegen edit
- Quellbild: `ae483d98-54e0-5985-96d2-fc1351d22e4f.png`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Erzeuge eine breite, freundlich handgezeichnete deutsche Mathematik-Lernkarte über einen einseitigen Binomialtest mit H₀:p=0,5 gegen H₁:p>0,5 und α≤5%. Zeige exakt zwei Zeilen gleicher Logik. Oben n=50: Unter der Alternative p₁=0,60 werden im Mittel 30 Treffer erwartet; die Verwerfungsregel lautet X≥32, also Grenze 32/50=0,64. Die Alternative liegt mehrheitlich links der Grenze; Fehler zweiter Art β≈0,664 – eher groß. Unten n=200: Bei p₁=0,60 werden im Mittel 120 Treffer erwartet; Verwerfungsregel X≥113, also Grenze 113/200=0,565. Die Alternative liegt mehrheitlich rechts der Grenze; β≈0,140 – kleiner. Setze die β-Angaben als separate Beschriftungen unter die jeweilige schematische Vergleichsleiste, nicht auf die Leiste oder direkt neben die Treffermarken 30, 32, 113, 120. β ist die Nichtverwerfungswahrscheinlichkeit bei p₁, kein geometrischer Abstand. Die Zahlenleiste jeder Zeile ist keine Wahrscheinlichkeitsdichte. Orange für die Erwartung bei p₁, Blau für die Testgrenze, große eindeutige Pfeile und deutsche Beschriftungen. Keine zusätzliche Behauptung, kein falsches Gleichheitszeichen, keine Marke. Auch bei 360 px Kartenbreite lesbar.
```
