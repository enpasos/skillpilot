# Lernzielvisualisierung: Punktprobe bei Geraden und Strecken in Parameterform durchführen

## SkillPilot-Ziel

- SkillPilot-ID: `7aa1abee-d6ec-528a-b110-f2260b0cda51`
- Titel: Punktprobe bei Geraden und Strecken in Parameterform durchführen
- Beschreibung: Die lernende Person kann durch Einsetzen und Lösen der Parameterbedingungen prüfen, ob ein Punkt auf einer Geraden oder auf einer begrenzten Strecke im Raum liegt.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `7aa1abee-d6ec-528a-b110-f2260b0cda51.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/7aa1abee-d6ec-528a-b110-f2260b0cda51/7aa1abee-d6ec-528a-b110-f2260b0cda51.jpg`

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

Titel: Punktprobe bei Geraden und Strecken in Parameterform durchführen
Beschreibung: Die lernende Person kann durch Einsetzen und Lösen der Parameterbedingungen prüfen, ob ein Punkt auf einer Geraden oder auf einer begrenzten Strecke im Raum liegt.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Punktprobe bei Geraden und Strecken in Parameterform.
- Zeige links eine Gerade:
  g: x = (1,2,0) + t*(2,1,3), t in R.
  Punkt P(5|4|6).
  Einsetzen:
  (1+2t, 2+t, 3t) = (5,4,6).
  Daraus t=2 in allen drei Komponenten.
  Schluss: P liegt auf der Geraden g.
- Zeige rechts eine Strecke von A nach B:
  A(1|2|0), B(5|4|6).
  Strecke: x = A + lambda*(B-A), 0 <= lambda <= 1.
  B-A = (4,2,6).
  Punkt Q(3|3|3): lambda = 0,5, also Q liegt auf der Strecke.
  Punkt R(7|5|9): lambda = 1,5, also R liegt auf der Geraden AB, aber nicht auf der Strecke.
- Stelle die Bedingung 0 <= lambda <= 1 fuer Strecken deutlich heraus.

Vermeiden:
- t fuer die Gerade nicht mit lambda fuer die Strecke vermischen.
- R nicht als Streckenpunkt markieren; lambda=1,5 liegt ausserhalb der Strecke.
- Q nicht als ausserhalb markieren; lambda=0,5 liegt innerhalb der Strecke.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
