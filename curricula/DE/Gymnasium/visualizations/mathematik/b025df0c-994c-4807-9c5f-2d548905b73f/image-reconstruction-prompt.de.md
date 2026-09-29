# Bildrekonstruktionsprompt: Lagebeziehungen und Schnittpunkte von Geraden im Raum untersuchen

## SkillPilot-Ziel

- SkillPilot-ID: `b025df0c-994c-4807-9c5f-2d548905b73f`
- Titel: Lagebeziehungen und Schnittpunkte von Geraden im Raum untersuchen
- Beschreibung: Die lernende Person kann in einfachen Fällen bestimmen, ob zwei Geraden im Raum identisch, echt parallel, sich schneidend oder windschief sind, und bei sich schneidenden Geraden den Schnittpunkt rechnerisch bestimmen.

## Generator

- Provider: OpenAI / ChatGPT-Codex image generation (built-in image_gen; model not exposed)
- Quellbild: `b025df0c-994c-4807-9c5f-2d548905b73f.png`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Erzeuge ein freundliches, gut lesbares, querformatiges PNG als leicht comicartige Mathematik-Infografik für Gymnasium J10. Thema: „Lagebeziehungen und Schnittpunkte von Geraden im Raum untersuchen“. Heller blau karierter Hintergrund, klare blaue und korallrote Geraden, wenig Text. Keine photorealistische oder sterile technische Gestaltung.

Im Hauptfeld kreuzen sich eine blaue Gerade g und eine rote Gerade h in einem gelben Punkt S. Die Skizze zeigt nur den Schnitt, **keine Koordinatenachsen und keinen eingezeichneten Ursprung**, da die Richtung und Lage hier allein aus den Parametergleichungen ermittelt werden. Schreibe die Gleichungen exakt: g: x=(0|0|0)+s*(1|1|0) und h: x=(1|0|0)+t*(-1|1|0). Am Punkt steht S(1/2|1/2|0). Darunter unter „Punkte gleichsetzen: g(s)=h(t)“ die drei Komponentengleichungen s=1-t, s=t, 0=0 und das Ergebnis s=t=1/2.

Rechts ein schmales Feld „Mögliche Fälle“ mit vier klar unterscheidbaren Mini-Skizzen: schneidend (ein gemeinsamer Punkt), parallel (zwei verschiedene parallele Wege), identisch (blau und rot genau auf derselben Linie, z. B. abwechselnd farbige Segmente), windschief (zwei nicht parallele Linien auf sichtbar getrennten räumlichen Ebenen ohne gemeinsamen Punkt). Insbesondere darf „identisch“ nicht wie zwei parallele getrennte Linien aussehen und „windschief“ nicht wie parallel. Alle Zahlen, Vorzeichen, Beschriftungen und Bild-/Textbeziehungen müssen korrekt und klein noch lesbar sein.
```
