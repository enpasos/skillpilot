# Lernzielvisualisierung: Volumina von Rotationskörpern um die Abszisse ermitteln (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `19481f5d-94de-4a74-b765-cbebd1525994`
- Titel: Volumina von Rotationskörpern um die Abszisse ermitteln (LK)
- Beschreibung: Die lernende Person kann Volumina von Körpern berechnen, die durch Rotation von Flächen um die Abszissenachse entstehen, auch wenn Wurzelfunktionen als Randfunktionen auftreten.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `19481f5d-94de-4a74-b765-cbebd1525994.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/19481f5d-94de-4a74-b765-cbebd1525994/19481f5d-94de-4a74-b765-cbebd1525994.jpg`

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

Titel: Volumina von Rotationskörpern um die Abszisse ermitteln (LK)
Beschreibung: Die lernende Person kann Volumina von Körpern berechnen, die durch Rotation von Flächen um die Abszissenachse entstehen, auch wenn Wurzelfunktionen als Randfunktionen auftreten.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Volumina von Rotationskoerpern um die Abszisse ermitteln.
- Verwende die Randfunktion f(x)=sqrt(x) auf [0,4], Rotation um die x-Achse.
- Zeige Scheibenmethode:
  Radius r(x)=f(x)=sqrt(x)
  Querschnittsflaeche A(x)=pi*r(x)^2=pi*(sqrt(x))^2=pi*x.
- Zeige:
  V = pi * integral_0^4 (sqrt(x))^2 dx
    = pi * integral_0^4 x dx
    = pi * [1/2*x^2]_0^4
    = 8*pi.
- Visualisiere die rotierende Flaeche als Koerper und kleine kreisfoermige Scheiben senkrecht zur x-Achse.

Vermeiden:
- Nicht 2*pi*integral f(x) dx verwenden; das waere hier nicht die Scheibenmethode.
- Nicht das Quadrat des Radius vergessen.
- Nicht sqrt(x)^2 falsch als x^2 schreiben.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
