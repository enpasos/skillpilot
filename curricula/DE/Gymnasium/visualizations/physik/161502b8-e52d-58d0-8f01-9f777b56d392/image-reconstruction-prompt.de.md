# Bildrekonstruktionsprompt: Entropieaussagen mit Systemgrenzen und Mikrozuständen prüfen

## SkillPilot-Ziel

- SkillPilot-ID: `161502b8-e52d-58d0-8f01-9f777b56d392`
- Titel: Entropieaussagen mit Systemgrenzen und Mikrozuständen prüfen
- Beschreibung: Die lernende Person kann Aussagen über eine lokale Entropieabnahme anhand klarer Systemgrenzen und zugehöriger Mikrozustände beurteilen und begründen, warum sie dem zweiten Hauptsatz für das isolierte Gesamtsystem nicht widersprechen muss; eine bloß optisch geordnete Anordnung genügt nicht als Entropiemaß.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Quellbild: `161502b8-e52d-58d0-8f01-9f777b56d392.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
# Rekonstruktion: Lokale Entropieabnahme und Gesamtsystem

## Prompt

Thermodynamisches Lehrdiagramm mit einem ausdrücklich isolierten Gesamtsystem, das beide idealen konstant temperierten Reservoire, die zyklische Maschine UND ihre ideale Arbeitsquelle einschließt. Titel „Lokale Entropieabnahme widerspricht nicht dem zweiten Hauptsatz“ bezieht sich auf das gezeigte konsistente Beispiel.

Kaltes Reservoir T_c=250 K gibt Q_c=100 J an die Maschine ab. Ideale Arbeitsquelle gibt W=25 J an die Maschine ab, ohne Entropieübertrag durch Arbeit. Die Maschine gibt Q_h=125 J an das warme Reservoir T_h=300 K ab. Alle Energiepfeile zeigen genau diese Richtungen. ΔS_Maschine=0 nach einem Zyklus; ideale Arbeitsquelle ohne Entropieänderung.

ΔS_c=−100 J/250 K=−0,400 J/K; ΔS_h=125 J/300 K≈+0,417 J/K. ΔS_gesamt≈−0,400+0,417+0=+0,017 J/K>0. Keine Energie überquert die äußere gestrichelte Grenze. Die lokale Abnahme ist somit mit der Zunahme im isolierten Gesamtsystem vereinbar.

Darunter die wichtige Abgrenzung „Entropie ist nicht bloß sichtbare Unordnung“. Ein ungeordnet wirkender Behälter mit rotem Kreuz kennzeichnet das unzureichende optische Kriterium, kein physikalisches Verbot solcher Zustände. Daneben S=k_B ln Ω und „Zahl der kompatiblen Mikrozustände“ im dargestellten Gleichgewichtsmodell. Gitter-/Lupensymbole sind qualitative Erläuterungen, keine abgezählte konkrete Zustandsmenge. Informierte Kuration nach vollständiger Bildsichtung.
```
