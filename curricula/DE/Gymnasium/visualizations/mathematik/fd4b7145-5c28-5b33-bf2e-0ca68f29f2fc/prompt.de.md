# Lernzielvisualisierung: Ebenenscharen in Koordinatengleichung untersuchen (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `fd4b7145-5c28-5b33-bf2e-0ca68f29f2fc`
- Titel: Ebenenscharen in Koordinatengleichung untersuchen (LK)
- Beschreibung: Die lernende Person kann Ebenenscharen, insbesondere in der Darstellung durch eine Koordinatengleichung, parameterabhängig untersuchen und besondere Lage- oder Schnittsituationen geometrisch deuten.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `fd4b7145-5c28-5b33-bf2e-0ca68f29f2fc.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/fd4b7145-5c28-5b33-bf2e-0ca68f29f2fc/fd4b7145-5c28-5b33-bf2e-0ca68f29f2fc.jpg`

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

Titel: Ebenenscharen in Koordinatengleichung untersuchen (LK)
Beschreibung: Die lernende Person kann Ebenenscharen, insbesondere in der Darstellung durch eine Koordinatengleichung, parameterabhängig untersuchen und besondere Lage- oder Schnittsituationen geometrisch deuten.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Ebenenschar in Koordinatengleichung parameterabhaengig untersuchen.
- Verwende die Ebenenschar:
  E_k: x + y + k*z = 2.
- Vergleiche mit der festen Ebene:
  F: 2x + 2y + 2z = 5.
- Normalenvektoren:
  n_k = (1,1,k).
  n_F = (2,2,2).
- Spezialfall:
  Fuer k = 1 gilt n_F = 2*n_1.
  E_1: x+y+z=2.
  F: x+y+z=2,5.
  Also parallel und verschieden, kein Schnitt.
- Fuer k != 1 sind die Normalenvektoren nicht parallel; die Ebenen schneiden sich in einer Geraden.
- Beispiel fuer k = 0:
  E_0: x+y=2.
  Zusammen mit F ergibt sich z=0,5.
  Eine Schnittgerade ist g: x = (0|2|0,5) + s*(1|-1|0).
- Zeige eine kleine Falltabelle: k=1 -> parallel verschieden; k=0 -> Schnittgerade; k != 1 -> Schnittgerade allgemein.

Vermeiden:
- Bei k = 1 nicht "identisch" schreiben; die Konstanten 2 und 2,5 sind verschieden.
- Bei k != 1 nicht "parallel" schreiben.
- Dezimalzahlen mit deutschem Komma sind okay, aber die Koordinate z=0,5 muss als eine Zahl erkennbar bleiben.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
