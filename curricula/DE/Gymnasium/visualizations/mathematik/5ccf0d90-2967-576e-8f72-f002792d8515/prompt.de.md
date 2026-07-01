# Lernzielvisualisierung: Integrationstechniken gezielt kombinieren

## SkillPilot-Ziel

- SkillPilot-ID: `5ccf0d90-2967-576e-8f72-f002792d8515`
- Titel: Integrationstechniken gezielt kombinieren
- Beschreibung: Die lernende Person kann bei gegebenen Integralen geeignete Techniken auswählen, ggf. mehrere Methoden kombinieren und den Lösungsweg begründen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `5ccf0d90-2967-576e-8f72-f002792d8515.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/5ccf0d90-2967-576e-8f72-f002792d8515/5ccf0d90-2967-576e-8f72-f002792d8515.jpg`

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

Titel: Integrationstechniken gezielt kombinieren
Beschreibung: Die lernende Person kann bei gegebenen Integralen geeignete Techniken auswählen, ggf. mehrere Methoden kombinieren und den Lösungsweg begründen.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Integrationstechniken gezielt kombinieren und die Wahl begruenden.
- Verwende das bestimmte Integral:
  I=integral_0^1 2x*(1+x^2)*e^(x^2) dx.
- Technik-Auswahl sichtbar machen:
  1. Substitution wegen innerer Funktion x^2 und Faktor 2x.
  2. Danach Formansatz/Kontrolle fuer (1+u)*e^u.
- Substitution:
  u=x^2, du=2x dx.
  Grenzen: x=0 -> u=0, x=1 -> u=1.
  I=integral_0^1 (1+u)*e^u du.
- Stammfunktion nach Formansatz oder Kontrolle:
  G(u)=u*e^u, denn G'(u)=(1+u)*e^u.
- Auswertung:
  I=[u*e^u]_0^1 = e-0=e.
- Ergebnisbox: Erst Struktur erkennen, dann passende Technik kombinieren.

Vermeiden:
- Nicht die Integrationsgrenzen nach der Substitution unveraendert lassen, ohne sie umzurechnen.
- Nicht du=2 dx schreiben; korrekt ist du=2x dx.
- Nicht behaupten, eine einzige Potenzregel loese das Integral.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
