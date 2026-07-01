# Lernzielvisualisierung: Uneigentliche Integrale berechnen (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `f4935b24-d8a9-5eb7-a5eb-6d34a9e09b2d`
- Titel: Uneigentliche Integrale berechnen (LK)
- Beschreibung: Die lernende Person kann uneigentliche Integrale mit unendlichen Integrationsgrenzen oder Unstetigkeitsstellen als Grenzwerte formulieren, berechnen und entscheiden, ob der Flächeninhalt endlich ist.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `f4935b24-d8a9-5eb7-a5eb-6d34a9e09b2d.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/f4935b24-d8a9-5eb7-a5eb-6d34a9e09b2d/f4935b24-d8a9-5eb7-a5eb-6d34a9e09b2d.jpg`

## Prompt

```text
Bitte visualisiere das folgende Lernziel im einfachen Cartoon-Stil.

Rahmen:
- Zielgruppe: Gymnasium Mathematik.
- Erzeuge eine klare, gut lesbare Infografik im Querformat.
- Visualisiere genau dieses eine Lernziel; keine Zusatzthemen und keine Aufgabenlösung.
- Nutze plausible mathematische Beispiele nur, wenn sie das Lernziel unmittelbar erklären.
- Keine Drittanbieterlogos, keine Arbeitsblatt-Kopie, keine geschützten Figuren.
- Verwende wenig Text: kurze deutsche Labels statt langer Sätze.
- Beschriftungen und mathematische Schreibweisen müssen fachlich korrekt und auch in kleiner Darstellung lesbar sein.

Titel: Uneigentliche Integrale berechnen (LK)
Beschreibung: Die lernende Person kann uneigentliche Integrale mit unendlichen Integrationsgrenzen oder Unstetigkeitsstellen als Grenzwerte formulieren, berechnen und entscheiden, ob der Flächeninhalt endlich ist.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Uneigentliche Integrale mit Unstetigkeitsstelle als Grenzwert berechnen.
- Verwende f(x)=1/sqrt(x) auf dem Intervall (0,1].
- Zeige die Flaeche unter der Kurve nahe x=0 mit senkrechter Asymptote am linken Rand.
- Formuliere:
  integral_0^1 1/sqrt(x) dx
  = lim_{a -> 0+} integral_a^1 x^(-1/2) dx
  = lim_{a -> 0+} [2*sqrt(x)]_a^1
  = lim_{a -> 0+} (2 - 2*sqrt(a))
  = 2.
- Entscheidung: Der Flaecheninhalt ist endlich, weil der Grenzwert existiert.

Vermeiden:
- Nicht direkt x=0 in 1/sqrt(x) einsetzen.
- Nicht mit integral_0^1 1/x dx verwechseln; dieses Beispiel hier konvergiert.
- Nicht behaupten, die Flaeche sei unendlich.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
