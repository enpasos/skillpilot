# Lernzielvisualisierung: Konstruktiven Beweis des chinesischen Restsatzes erläutern (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `701b3942-9f70-548e-9d02-a34b7e64aa17`
- Titel: Konstruktiven Beweis des chinesischen Restsatzes erläutern (LK)
- Beschreibung: Die lernende Person kann den konstruktiven Beweis des chinesischen Restsatzes mit den Hilfsprodukten M_i, modularen Inversen y_i sowie der Eindeutigkeit modulo des Produktmoduls nachvollziehen und fachsprachlich erläutern.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `701b3942-9f70-548e-9d02-a34b7e64aa17.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/701b3942-9f70-548e-9d02-a34b7e64aa17/701b3942-9f70-548e-9d02-a34b7e64aa17.jpg`

## Prompt

```text
Bitte visualisiere das folgende Lernziel im einfachen Cartoon-Stil.

Rahmen:
- Stil und Anspruch: klar, anschaulich und fachlich präzise; keine Zielgruppen-, Fach- oder Publikumshinweise als Bildtext.
- Erzeuge eine klare, gut lesbare Infografik im Querformat.
- Visualisiere genau dieses eine Lernziel; keine Zusatzthemen und keine Aufgabenlösung.
- Nutze plausible fachliche Beispiele nur, wenn sie das Lernziel unmittelbar erklären.
- Keine Drittanbieterlogos, keine Arbeitsblatt-Kopie, keine geschützten Figuren.
- Verwende wenig Text: kurze deutsche Labels statt langer Sätze.
- Beschriftungen und mathematische Schreibweisen müssen fachlich korrekt und auch in kleiner Darstellung lesbar sein.

Titel: Konstruktiven Beweis des chinesischen Restsatzes erläutern
Beschreibung: Die lernende Person kann den konstruktiven Beweis des chinesischen Restsatzes mit den Hilfsprodukten M_i, modularen Inversen y_i sowie der Eindeutigkeit modulo des Produktmoduls nachvollziehen und fachsprachlich erläutern.

Zusatzanweisung:
Erstelle eine fachlich exakte Visualisierung des konstruktiven Beweises des chinesischen Restsatzes.

Zeige links ein konkretes, korrektes Beispiel:
- x ≡ 2 (mod 3)
- x ≡ 3 (mod 5)
- x ≡ 2 (mod 7)
- M = 3 · 5 · 7 = 105

Zeige in der Mitte genau drei Bausteinkarten:
- Baustein 1: M1 = 35, y1 = 2, e1 = 35 · 2 = 70
- Restemuster von e1: mod 3: 1, mod 5: 0, mod 7: 0
- Baustein 2: M2 = 21, y2 = 1, e2 = 21 · 1 = 21
- Restemuster von e2: mod 3: 0, mod 5: 1, mod 7: 0
- Baustein 3: M3 = 15, y3 = 1, e3 = 15 · 1 = 15
- Restemuster von e3: mod 3: 0, mod 5: 0, mod 7: 1

Wichtig zu den Restemustern:
- Schreibe niemals e1 = (1,0,0), e2 = (0,1,0) oder e3 = (0,0,1), denn das wäre keine echte Gleichheit.
- Wenn du Tupel nutzt, beschrifte sie ausdrücklich als "Restemuster", zum Beispiel "Restemuster e1: (1,0,0)".
- Alternativ schreibe nur die drei modularen Restwerte untereinander.

Zeige rechts die Zusammensetzung:
- x = 2 · 70 + 3 · 21 + 2 · 15 = 233
- 233 ≡ 23 (mod 105)
- Kontrolle: 23 mod 3 = 2, 23 mod 5 = 3, 23 mod 7 = 2

Zeige unten klein die Eindeutigkeit:
- wenn x und x' alle Kongruenzen erfüllen, dann 3, 5, 7 teilen x - x'
- weil 3, 5, 7 paarweise teilerfremd sind, gilt 105 teilt x - x'
- also x ≡ x' (mod 105)

Wichtig:
- Die Zahlen und Kongruenzen müssen exakt so stimmen.
- Keine langen Sätze im Bild, lieber kurze Labels und Formeln.
- Keine zusätzlichen Moduln, keine anderen Reste und keine abweichenden Ergebnisse.
- Keine Markenlogos, keine Dateinamen, keine technischen IDs, keine Produktnamen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
