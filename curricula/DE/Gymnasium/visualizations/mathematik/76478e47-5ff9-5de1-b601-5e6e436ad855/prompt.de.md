# Lernzielvisualisierung: Bruchterme multiplizieren und dividieren

## SkillPilot-Ziel

- SkillPilot-ID: `76478e47-5ff9-5de1-b601-5e6e436ad855`
- Titel: Bruchterme multiplizieren und dividieren
- Beschreibung: Die lernende Person kann Bruchterme multiplizieren und dividieren, Definitionsbedingungen beachten und die entstehenden Terme sinnvoll kürzen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `76478e47-5ff9-5de1-b601-5e6e436ad855.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/76478e47-5ff9-5de1-b601-5e6e436ad855/76478e47-5ff9-5de1-b601-5e6e436ad855.jpg`

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

Titel: Bruchterme multiplizieren und dividieren
Beschreibung: Die lernende Person kann Bruchterme multiplizieren und dividieren, Definitionsbedingungen beachten und die entstehenden Terme sinnvoll kürzen.

Zusatzanweisung:
Pflichtinhalt:

Korrigiere die bestehende freundliche Infografik, ohne das Layout grundlegend zu veraendern. Der linke Kasten "Multiplizieren" ist fachlich in Ordnung und soll moeglichst unveraendert bleiben.

Die Korrektur betrifft nur den rechten Kasten "Dividieren".

Im Dividieren-Kasten muss der letzte Kuerzungsschritt fachlich korrekt sein:

- Start im Dividieren-Kasten:
  (x^2 - 1) / x : (x + 1)
- Umwandlung in Multiplikation mit dem Kehrwert:
  (x^2 - 1) / x * 1 / (x + 1)
- Faktorisierung:
  ((x - 1)(x + 1)) / x * 1 / (x + 1)
- Im letzten Kuerzungsschritt darf ausschliesslich der gemeinsame Faktor (x + 1) gekuerzt werden.
- Der Faktor (x - 1) im Zaehler darf nicht gekuerzt werden.
- Der Faktor x im Nenner darf nicht gekuerzt werden.
- Entferne deshalb alle roten Kuerzungsstriche ueber (x - 1) und ueber x.
- Wenn du die Kuerzungsstriche nicht eindeutig nur auf (x + 1) setzen kannst, entferne im rechten Dividieren-Kasten lieber alle roten Kuerzungsstriche. Keine Kuerzungsstriche sind akzeptabel; falsche Kuerzungsstriche sind nicht akzeptabel.
- Die Referenz enthaelt genau hier einen Fehler: rote Striche ueber (x - 1) und ueber x im rechten unteren Ausdruck duerfen nicht kopiert werden.
- Erhalte als Ergebnis rechts:
  (x - 1) / x
- Die Bedingungen bleiben:
  x != 0
  x != -1

Wichtige fachliche Regel:
Nur gleiche Faktoren in Zaehler und Nenner duerfen gekuerzt werden. In diesem Beispiel ist nur (x + 1) ein gemeinsamer Faktor. (x - 1) und x sind nicht gleich und duerfen nicht gekuerzt werden.

Sichtbarer deutscher Text soll echte Umlaute verwenden, wenn Umlaute vorkommen.

Vermeiden:

- Keine roten Kuerzungsstriche auf (x - 1).
- Keine roten Kuerzungsstriche auf x.
- Keine roten Kuerzungsstriche, die das komplette Produkt (x - 1)(x + 1) durchstreichen.
- Keine roten Kuerzungsstriche, die den Nenner x beruehren.
- Keine Darstellung, die suggeriert, dass (x - 1) und x gegeneinander gekuerzt werden.
- Keine Aenderung des Ergebnisses: Es muss (x - 1) / x bleiben.
- Keine falschen Bedingungen.
- Keine technischen IDs, Dateinamen, Plattformnamen, Produktnamen, internen Pfade oder internen Zielgruppenlabels im Bild.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
