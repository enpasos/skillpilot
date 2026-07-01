# Lernzielvisualisierung: Wachstums- und Zerfallsprozesse modellieren

## SkillPilot-Ziel

- SkillPilot-ID: `47b5671c-f8f5-5574-a2f7-788fd19c1eba`
- Titel: Wachstums- und Zerfallsprozesse modellieren
- Beschreibung: Die lernende Person kann exponentielle und begrenzte Wachstums- und Zerfallsprozesse unter Einbeziehung experimenteller Daten modellieren, die Modellannahmen ohne Herleitung aus Differenzialgleichungen deuten und Exponentialgleichungen durch Umkehren des Potenzierens beziehungsweise Logarithmen zu beliebiger Basis lösen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `47b5671c-f8f5-5574-a2f7-788fd19c1eba.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/47b5671c-f8f5-5574-a2f7-788fd19c1eba/47b5671c-f8f5-5574-a2f7-788fd19c1eba.jpg`

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

Titel: Wachstums- und Zerfallsprozesse modellieren
Beschreibung: Die lernende Person kann exponentielle und begrenzte Wachstums- und Zerfallsprozesse unter Einbeziehung experimenteller Daten modellieren, die Modellannahmen ohne Herleitung aus Differenzialgleichungen deuten und Exponentialgleichungen durch Umkehren des Potenzierens beziehungsweise Logarithmen zu beliebiger Basis lösen.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Wachstums- und Zerfallsprozesse mit Daten modellieren und Exponentialgleichungen loesen.
- Verwende einen Bakterienbestand mit Messdaten:
  t=0 h: 100
  t=3 h: 800
- Modell: N(t)=100*a^t.
- Bestimme a:
  800 = 100*a^3
  a^3 = 8
  a = 2.
- Modellgleichung: N(t)=100*2^t.
- Vorhersage und Gleichung:
  Wann ist N(t)=3200?
  3200=100*2^t -> 2^t=32 -> t=5.
- Deutung: Faktor 2 pro Stunde; Modellannahme ist exponentielles Wachstum mit konstantem Wachstumsfaktor.

Vermeiden:
- Nicht lineares Wachstum verwenden; von 100 auf 800 in 3 Stunden bedeutet Faktor 8, nicht plus 700 pro Stunde.
- Nicht a=8 setzen; a^3=8, also a=2.
- Nicht Logarithmus erzwingen, wenn die Potenz hier direkt umkehrbar ist; ein Hinweis auf Logarithmen ist optional.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
