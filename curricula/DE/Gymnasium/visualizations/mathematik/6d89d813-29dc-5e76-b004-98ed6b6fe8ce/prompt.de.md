# Lernzielvisualisierung: Partielle Integration anwenden (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `6d89d813-29dc-5e76-b004-98ed6b6fe8ce`
- Titel: Partielle Integration anwenden (LK)
- Beschreibung: Die lernende Person kann Integrale geeigneter Funktionen mithilfe der Methode der partiellen Integration berechnen und die Wahl der Zerlegung begründen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `6d89d813-29dc-5e76-b004-98ed6b6fe8ce.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/6d89d813-29dc-5e76-b004-98ed6b6fe8ce/6d89d813-29dc-5e76-b004-98ed6b6fe8ce.jpg`

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

Titel: Partielle Integration anwenden (LK)
Beschreibung: Die lernende Person kann Integrale geeigneter Funktionen mithilfe der Methode der partiellen Integration berechnen und die Wahl der Zerlegung begründen.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Partielle Integration anwenden und die Zerlegung begruenden.
- Verwende:
  I=integral_0^1 x*e^x dx.
- Zeige die Formel:
  integral u*v' dx = u*v - integral u'*v dx.
- Waehle:
  u=x -> u'=1
  v'=e^x -> v=e^x.
- Rechnung:
  I=[x*e^x]_0^1 - integral_0^1 1*e^x dx
   = e - [e^x]_0^1
   = e - (e-1)
   = 1.
- Begruendung: x wird beim Ableiten einfacher, e^x bleibt beim Integrieren einfach.

Vermeiden:
- Nicht die Randterme [x*e^x]_0^1 vergessen.
- Nicht ein falsches Vorzeichen vor dem Restintegral verwenden.
- Nicht v=e^(x+1) oder v=x*e^x setzen.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
