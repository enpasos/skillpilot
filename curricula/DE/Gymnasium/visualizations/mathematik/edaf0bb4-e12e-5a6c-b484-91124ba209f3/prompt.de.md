# Lernzielvisualisierung: Geradenscharen untersuchen (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `edaf0bb4-e12e-5a6c-b484-91124ba209f3`
- Titel: Geradenscharen untersuchen (LK)
- Beschreibung: Die lernende Person kann Geradenscharen mit einem Parameter untersuchen, besondere Parameterwerte bestimmen und die zugehörigen Lage- oder Schnittsituationen geometrisch deuten.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `edaf0bb4-e12e-5a6c-b484-91124ba209f3.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/edaf0bb4-e12e-5a6c-b484-91124ba209f3/edaf0bb4-e12e-5a6c-b484-91124ba209f3.jpg`

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

Titel: Geradenscharen untersuchen (LK)
Beschreibung: Die lernende Person kann Geradenscharen mit einem Parameter untersuchen, besondere Parameterwerte bestimmen und die zugehörigen Lage- oder Schnittsituationen geometrisch deuten.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Geradenschar mit Parameter untersuchen und besondere Lagewerte deuten.
- Verwende die Geradenschar:
  g_a: x = (0,0,a) + t*(1,1,0).
- Vergleiche mit der festen Geraden:
  h: x = (0,1,0) + s*(1,0,0).
- Untersuche die Schnittbedingung:
  Aus der z-Koordinate folgt a = 0.
  Fuer a = 0 gilt t = 1 und s = 1, also Schnittpunkt P(1|1|0).
  Fuer a != 0 gibt es keinen Schnittpunkt.
- Richtungsvektoren:
  (1,1,0) und (1,0,0) sind nicht parallel.
- Schluss:
  a = 0: g_0 schneidet h in P(1|1|0).
  a != 0: g_a und h sind windschief.
- Visualisiere h in der Ebene z=0 und zwei Beispielgeraden der Schar: g_0 in z=0 sowie g_2 in z=2.

Vermeiden:
- Fuer a != 0 nicht "parallel" schreiben; die Richtungsvektoren sind nicht parallel.
- Fuer a = 0 den Schnittpunkt nicht am Ursprung markieren; korrekt ist P(1|1|0).
- Die Parameter a und t nicht vermischen.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
