# Lernzielvisualisierung: Substitutionsmethode anwenden (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `12f4b957-da3d-53d5-a924-45a634ab8d44`
- Titel: Substitutionsmethode anwenden (LK)
- Beschreibung: Die lernende Person kann Integrale mithilfe geeigneter Substitutionen vereinfachen und dabei die Veränderung der Integrationsgrenzen korrekt berücksichtigen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `12f4b957-da3d-53d5-a924-45a634ab8d44.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/12f4b957-da3d-53d5-a924-45a634ab8d44/12f4b957-da3d-53d5-a924-45a634ab8d44.jpg`

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

Titel: Substitutionsmethode anwenden (LK)
Beschreibung: Die lernende Person kann Integrale mithilfe geeigneter Substitutionen vereinfachen und dabei die Veränderung der Integrationsgrenzen korrekt berücksichtigen.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Substitutionsmethode anwenden und Integrationsgrenzen korrekt veraendern.
- Verwende:
  I=integral_0^1 2x*cos(x^2) dx.
- Substitution:
  u=x^2
  du=2x dx.
- Grenzen umrechnen:
  x=0 -> u=0
  x=1 -> u=1.
- Neues Integral:
  I=integral_0^1 cos(u) du.
- Stammfunktion und Ergebnis:
  I=[sin(u)]_0^1 = sin(1)-sin(0)=sin(1).
- Visualisiere die Idee: innere Funktion x^2 wird zu neuer Variable u, der Faktor 2x dx wird zu du.

Vermeiden:
- Nicht die Grenzen 0 und 1 blind uebernehmen, ohne die Umrechnung zu zeigen.
- Nicht du=2x oder du=2 dx unvollstaendig schreiben; korrekt ist du=2x dx.
- Nicht sin(x^2) als direkte Stammfunktion ohne Kettenfaktor behaupten.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
