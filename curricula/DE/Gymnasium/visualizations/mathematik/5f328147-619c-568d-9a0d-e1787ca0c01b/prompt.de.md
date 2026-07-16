# Lernzielvisualisierung: Konfidenzintervalle für Wahrscheinlichkeiten berechnen

## SkillPilot-Ziel

- SkillPilot-ID: `5f328147-619c-568d-9a0d-e1787ca0c01b`
- Titel: Konfidenzintervalle für Wahrscheinlichkeiten berechnen
- Beschreibung: Die lernende Person kann von einer Stichprobe auf die unbekannte Trefferwahrscheinlichkeit der Grundgesamtheit schließen, Konfidenzintervalle in Sachzusammenhängen durch Lösen der Gleichung $h_n-p=c\sqrt{\frac{p(1-p)}{n}}$ durch Quadrieren bestimmen und die Vereinfachung $h_n-p=c\sqrt{\frac{h_n(1-h_n)}{n}}$ als symmetrisches Intervall bezüglich $h_n$ verwenden.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `5f328147-619c-568d-9a0d-e1787ca0c01b.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/5f328147-619c-568d-9a0d-e1787ca0c01b/5f328147-619c-568d-9a0d-e1787ca0c01b.jpg`

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

Titel: Konfidenzintervalle für Wahrscheinlichkeiten berechnen
Beschreibung: Die lernende Person kann von einer Stichprobe auf die unbekannte Trefferwahrscheinlichkeit der Grundgesamtheit schließen, Konfidenzintervalle in Sachzusammenhängen durch Lösen der Gleichung $h_n-p=c\sqrt{\frac{p(1-p)}{n}}$ durch Quadrieren bestimmen und die Vereinfachung $h_n-p=c\sqrt{\frac{h_n(1-h_n)}{n}}$ als symmetrisches Intervall bezüglich $h_n$ verwenden.

Zusatzanweisung:
Pflichtinhalt:
- Erzeuge eine neue, klar gegliederte Infografik mit Stichprobe, unbekanntem festem p und zwei Berechnungswegen.
- Zeige korrekt `|hₙ − p| = c·√(p(1−p)/n)` als Gleichung, die durch Quadrieren gelöst wird.
- Zeige für die symmetrische Näherung `E = c·√(hₙ(1−hₙ)/n)` und das Intervall `[hₙ−E; hₙ+E]`.
- Nutze als Beispiel `hₙ = 0,52`, `n = 400`, `c = 1,96`, `E ≈ 0,049`, also ungefähr `[0,47; 0,57]`.
- Formuliere präzise: Bei vielen gleichartigen Stichproben enthalten ungefähr 95 % der so konstruierten Intervalle das feste wahre p; ein konkretes Intervall enthält p oder nicht.

Vermeiden:
- Keine Gleichung der Form `hₙ−p ≈ ±E`.
- Keine Aussage, nach der p selbst zufällig sei oder ein konkretes Intervall p mit 95 % Wahrscheinlichkeit enthalte.
- Keine Dezimalpunkte, keine zusätzlichen Formeln, keine dichten Kleinsttexte. Insbesondere darf nirgends ein isolierter oder doppelter Wurzelausdruck wie `√√x` stehen. Zeige im Rechenweg nur die tatsächlich verwendeten Formeln.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
