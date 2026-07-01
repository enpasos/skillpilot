# Lernzielvisualisierung: Übergangsprozesse mit Zustands- und Übergangsgraphen beschreiben

## SkillPilot-Ziel

- SkillPilot-ID: `5e893892-393e-5df0-b705-fb3b3458122f`
- Titel: Übergangsprozesse mit Zustands- und Übergangsgraphen beschreiben
- Beschreibung: Die lernende Person kann Übergangsprozesse mithilfe von Zustands- beziehungsweise Übergangsgraphen beschreiben, die Knoten und Übergänge im Kontext deuten und passende Graphdarstellungen erstellen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `5e893892-393e-5df0-b705-fb3b3458122f.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/5e893892-393e-5df0-b705-fb3b3458122f/5e893892-393e-5df0-b705-fb3b3458122f.jpg`

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

Titel: Übergangsprozesse mit Zustands- und Übergangsgraphen beschreiben
Beschreibung: Die lernende Person kann Übergangsprozesse mithilfe von Zustands- beziehungsweise Übergangsgraphen beschreiben, die Knoten und Übergänge im Kontext deuten und passende Graphdarstellungen erstellen.

Zusatzanweisung:
Pflichtinhalt:
- Korrektur einer bestehenden Visualisierung: Die bisherige Aufteilung in Graph links und Tabelle rechts ist gut und soll beibehalten werden.
- Thema: Uebergangsprozess mit Zustands- und Uebergangsgraph beschreiben.
- Verwende drei Zustandsknoten:
  A = Zuhause.
  B = Schule.
  C = Sport.
- Verwende eine klare, konsistente Farblogik:
  Knoten A ist gelb; alle Pfeile mit Quelle A sind gelb.
  Knoten B ist gruen; alle Pfeile mit Quelle B sind gruen.
  Knoten C ist blau; alle Pfeile mit Quelle C sind blau.
- Zeige im Zustands- und Uebergangsgraphen alle 9 moeglichen gerichteten Uebergaenge, auch die mit Wahrscheinlichkeit 0:
  A -> A: 0,0.
  A -> B: 0,7.
  A -> C: 0,3.
  B -> A: 0,4.
  B -> B: 0,0.
  B -> C: 0,6.
  C -> A: 1,0.
  C -> B: 0,0.
  C -> C: 0,0.
- Selbstuebergaenge A->A, B->B und C->C als kleine Schleifen am jeweiligen Knoten zeichnen und mit 0,0 beschriften.
- Uebergaenge mit Wahrscheinlichkeit 0 duerfen duenn oder gestrichelt sein, muessen aber sichtbar und beschriftet sein.
- Die Uebergangstabelle rechts muss als Matrix im "von/nach"-Schema aufgebaut sein:
  Oben steht "von" ueber den Spalten A, B, C.
  Links steht "nach" neben den Zeilen A, B, C.
  Die Zeilen sind Zielzustaende, die Spalten sind Quellzustaende.
- Tabellenwerte exakt:
  nach A: von A 0,0 | von B 0,4 | von C 1,0.
  nach B: von A 0,7 | von B 0,0 | von C 0,0.
  nach C: von A 0,3 | von B 0,6 | von C 0,0.
  Summe: unter jeder Spalte 1,0.
- Markiere in der Tabelle visuell, dass die Spaltensummen jeweils 1,0 sind.
- Kurze Deutung:
  Spalte = Startzustand.
  Zeile = Zielzustand.
  Jede Spalte summiert sich zu 1,0.

Vermeiden:
- Keine ausgelassenen Uebergaenge; alle 9 Pfeile muessen sichtbar sein.
- Keine Pfeile mit Farbe des Zielknotens; die Pfeilfarbe richtet sich immer nach dem Quellknoten.
- Nicht die Tabelle als Liste "Von A: ..." zeichnen; sie muss eine Matrix mit Spalten "von A, von B, von C" und Zeilen "nach A, nach B, nach C" sein.
- Nicht Zeilensummen als Hauptsummen markieren; hier werden Spaltensummen geprueft.
- Nicht A->B als 0,3 beschriften; korrekt ist A->B: 0,7.
- Nicht C->B auslassen; korrekt ist C->B: 0,0.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
