# Lernzielvisualisierung: Parallelogramme und Dreiecke in Parameterform darstellen

## SkillPilot-Ziel

- SkillPilot-ID: `f613634b-39fb-5021-9970-790ef34c9932`
- Titel: Parallelogramme und Dreiecke in Parameterform darstellen
- Beschreibung: Die lernende Person kann Parallelogramme und Dreiecke im Raum in Parameterform angeben, geeignete Spannvektoren aus Eckpunkten bestimmen und die Darstellung geometrisch deuten.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `f613634b-39fb-5021-9970-790ef34c9932.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/f613634b-39fb-5021-9970-790ef34c9932/f613634b-39fb-5021-9970-790ef34c9932.jpg`

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

Titel: Parallelogramme und Dreiecke in Parameterform darstellen
Beschreibung: Die lernende Person kann Parallelogramme und Dreiecke im Raum in Parameterform angeben, geeignete Spannvektoren aus Eckpunkten bestimmen und die Darstellung geometrisch deuten.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Parallelogramm und Dreieck in Parameterform darstellen.
- Verwende die Eckpunkte:
  A=(1; 1; 0),
  B=(5; 1; 0),
  D=(1; 4; 2).
- Spannvektoren:
  u=AB=(4; 0; 0),
  v=AD=(0; 3; 2).
- Vierter Parallelogrammpunkt:
  C=A+u+v=(5; 4; 2).
- Parallelogramm:
  X=A+s*u+t*v, 0<=s<=1, 0<=t<=1.
- Dreieck ABD:
  X=A+s*u+t*v, s>=0, t>=0, s+t<=1.
- Zeige links das Parallelogramm ABCD und rechts das Dreieck ABD, jeweils aufgespannt durch u und v.
- Zeige die Parameterbereiche als kleines Parameterdiagramm:
  Quadrat fuer Parallelogramm,
  Dreieck unter der Linie s+t=1 fuer Dreieck.

Vermeiden:
- Nicht fuer das Dreieck nur 0<=s<=1 und 0<=t<=1 angeben.
- Nicht C falsch berechnen.
- Nicht u und v vertauschen, wenn B und D beschriftet sind.
- Keine unbeschraenkte Ebene als Hauptbild zeigen.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
