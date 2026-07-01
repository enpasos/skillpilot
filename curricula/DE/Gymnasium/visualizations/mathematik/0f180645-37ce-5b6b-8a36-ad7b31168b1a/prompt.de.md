# Lernzielvisualisierung: Rotationskörper mit Integralen untersuchen (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `0f180645-37ce-5b6b-8a36-ad7b31168b1a`
- Titel: Rotationskörper mit Integralen untersuchen (LK)
- Beschreibung: Die lernende Person kann Volumina von Rotationskörpern begründen und berechnen, indem sie passende Integrale aufstellt und die Volumenformel aus der Grundvorstellung des Integralbegriffs ableitet.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `0f180645-37ce-5b6b-8a36-ad7b31168b1a.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/0f180645-37ce-5b6b-8a36-ad7b31168b1a/0f180645-37ce-5b6b-8a36-ad7b31168b1a.jpg`

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

Titel: Rotationskörper mit Integralen untersuchen (LK)
Beschreibung: Die lernende Person kann Volumina von Rotationskörpern begründen und berechnen, indem sie passende Integrale aufstellt und die Volumenformel aus der Grundvorstellung des Integralbegriffs ableitet.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Rotationskoerper mit Integralen untersuchen und die Volumenformel aus Scheiben begruenden.
- Verwende die Randfunktion f(x)=x auf dem Intervall [0,3], Rotation um die x-Achse.
- Zeige die Grundidee mit duennen Scheiben:
  Scheibenradius r_i = f(x_i)
  Scheibenvolumen ungefaehr pi * (f(x_i))^2 * Delta x.
- Zeige den Grenzuebergang:
  V = lim Summe pi*(f(x_i))^2*Delta x = pi * integral_0^3 (f(x))^2 dx.
- Rechne konkret:
  V = pi * integral_0^3 x^2 dx
    = pi * [x^3/3]_0^3
    = 9*pi.
- Visualisiere mehrere Scheiben entlang der x-Achse und eine Ergebnisbox "Radius wird quadriert".

Vermeiden:
- Nicht Umfang oder Mantelflaeche verwenden; keine Formel 2*pi*integral f(x) dx.
- Nicht pi vergessen.
- Nicht integral_0^3 x dx rechnen; der Radius muss quadriert werden.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
