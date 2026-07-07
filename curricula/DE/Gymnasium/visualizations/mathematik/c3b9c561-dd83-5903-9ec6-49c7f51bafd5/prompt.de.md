# Lernzielvisualisierung: Bedingte Wahrscheinlichkeiten berechnen

## SkillPilot-Ziel

- SkillPilot-ID: `c3b9c561-dd83-5903-9ec6-49c7f51bafd5`
- Titel: Bedingte Wahrscheinlichkeiten berechnen
- Beschreibung: Die lernende Person kann bedingte Wahrscheinlichkeiten in Sachzusammenhängen identifizieren und sie mit Baumdiagrammen sowie Vier- oder Mehrfeldertafeln aus absoluten oder relativen Häufigkeiten berechnen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `c3b9c561-dd83-5903-9ec6-49c7f51bafd5.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/c3b9c561-dd83-5903-9ec6-49c7f51bafd5/c3b9c561-dd83-5903-9ec6-49c7f51bafd5.jpg`

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

Titel: Bedingte Wahrscheinlichkeiten berechnen
Beschreibung: Die lernende Person kann bedingte Wahrscheinlichkeiten in Sachzusammenhängen identifizieren und sie mit Baumdiagrammen sowie Vier- oder Mehrfeldertafeln aus absoluten oder relativen Häufigkeiten berechnen.

Zusatzanweisung:
Pflichtinhalt:
- Ueberarbeite die bestehende Infografik nur gezielt und erhalte die Aufteilung in Vierfeldertafel und Baumdiagramm.
- Wenn das alte Layout zu viele falsche Markierungen enthaelt, darfst du stattdessen das vereinfachte Layout der Referenzvorlage uebernehmen: links eine relative Vierfeldertafel, rechts ein Baumdiagramm zu P(B|A), unten jeweils die passende Rechnung.
- Die Referenzvorlage ist fuer Notation, markierte Zahlen, Pfeile und Rechnung fachlich massgeblich.
- Ersetze im gesamten Bild die Beschriftungen "nicht A" und "nicht B" durch die mathematische Gegenereignis-Schreibweise mit Ueberstrich:
  - Ā fuer das Gegenereignis zu A
  - B̄ fuer das Gegenereignis zu B
- Auch in Formeln, Baum-Aesten und Schnittmengen soll die Ueberstrich-Schreibweise verwendet werden, zum Beispiel Ā∩B und A∩B̄.
- Wichtig: A∩B bleibt ohne Ueberstrich. Die Schnittmenge A∩B ist die gemeinsame Zelle 0.30 beziehungsweise 30 und darf nicht zu Ā∩B oder A∩B̄ veraendert werden.
- Die Werte der relativen Vierfeldertafel muessen unveraendert bleiben:
  - Zeile B: 0.30, 0.20, 0.50
  - Zeile B̄: 0.10, 0.40, 0.50
  - Zeile Summe: 0.40, 0.60, 1.00
- In der relativen Vierfeldertafel sollen nur die zwei Zahlen markiert oder eingekreist sein, die fuer P(B|A) gebraucht werden:
  - 0.30 in Zeile B und Spalte A als P(A∩B)
  - 0.40 in der Zeile Summe und Spalte A als P(A)
- Die andere 0.40 in Zeile B̄ und Spalte Ā darf nicht markiert werden.
- Entferne Kreise, Pfeile oder Hervorhebungen bei 0.50 und 0.60 in der relativen Vierfeldertafel.
- Die Pfeile bei den relativen Haeufigkeiten muessen genau zu diesen zwei relevanten Zahlen fuehren:
  - ein Pfeil von 0.30 zur Zaehlerstelle P(A∩B)
  - ein Pfeil von 0.40 zur Nennerstelle P(A)
- Die zugehoerige Rechnung soll fachlich so bleiben:
  P(B|A)=P(A∩B)/P(A)=0.30/0.40=0.75
- Falls die alte absolute Rechnung P(A|B) weiterhin gezeigt wird, muss sie fachlich so bleiben:
  P(A|B)=P(A∩B)/P(B)=30/50=0.60
- Falls die alte Berechnung P(A|B) im Baumdiagramm weiterhin gezeigt wird, muss sie fachlich so bleiben:
  P(A|B)=P(A∩B)/P(B)=0.30/0.50=0.60
- Die Berechnung P(B|A) im Baumdiagramm muss fachlich so bleiben:
  P(B|A)=P(A∩B)/P(A)=0.30/0.40=0.75
- Aendere keine Konditionierungsrichtung: P(A|B) darf nicht zu P(A|A) werden, und P(B|A) darf nicht zu P(A|B) werden.
- Die absolute Tabelle links darf weiterhin 30 und 50 fuer P(A|B)=30/50=0.60 markieren, falls sie im Layout bleibt.
- Wenn du die vereinfachte Referenzvorlage uebernimmst, zeige nur P(B|A) und lasse die alte absolute Tabelle und die alte P(A|B)-Rechnung weg.
- Sichtbarer deutscher Text soll echte Umlaute verwenden, wenn Umlaute vorkommen.

Vermeiden:
- Keine sichtbaren Texte "nicht A" oder "nicht B".
- Keine Markierung von 0.50 oder 0.60 in der relativen Vierfeldertafel.
- Keine Markierung der 0.40 in Zeile B̄ und Spalte Ā.
- Keine Pfeile von den relativen Haeufigkeiten zu falschen Zellen oder falschen Formelteilen.
- Keine falschen Ueberstriche in A∩B, P(A∩B), P(A|B) oder P(B|A).
- Keine Aenderung der Tabellenwerte, Summen oder Ergebniswerte.
- Keine technischen IDs, Dateinamen, Plattformnamen, internen Pfade oder internen Zielgruppenlabels im Bild.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
