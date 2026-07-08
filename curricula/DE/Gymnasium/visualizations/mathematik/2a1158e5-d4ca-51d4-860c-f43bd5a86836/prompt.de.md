# Lernzielvisualisierung: Ereignisse darstellen und Baumdiagramme nutzen

## SkillPilot-Ziel

- SkillPilot-ID: `2a1158e5-d4ca-51d4-860c-f43bd5a86836`
- Titel: Ereignisse darstellen und Baumdiagramme nutzen
- Beschreibung: Die lernende Person kann mehrstufige Zufallsexperimente in Baumdiagrammen darstellen, Pfadregeln anwenden und Wahrscheinlichkeiten an konkreten Beispielrechnungen berechnen.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `2a1158e5-d4ca-51d4-860c-f43bd5a86836.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/2a1158e5-d4ca-51d4-860c-f43bd5a86836/2a1158e5-d4ca-51d4-860c-f43bd5a86836.jpg`

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

Titel: Ereignisse darstellen und Baumdiagramme nutzen
Beschreibung: Die lernende Person kann mehrstufige Zufallsexperimente in Baumdiagrammen darstellen, Pfadregeln anwenden und Wahrscheinlichkeiten an konkreten Beispielrechnungen berechnen.

Zusatzanweisung:
Pflichtinhalt:
- Ueberarbeite das Referenzbild gezielt: Thema bleibt ein zweistufiges Baumdiagramm fuer zwei Muenzwuerfe mit Kopf K und Zahl Z.
- Der Baum muss genau vier Endergebnisse zeigen: KK, KZ, ZK, ZZ.
- Jede Verzweigung hat Wahrscheinlichkeit 1/2.
- Die Pfadregel fuer KK darf als eigenes Beispiel stehen: P(KK) = 1/2 * 1/2 = 1/4.
- Fuer das Ereignis "genau einmal K" muessen genau zwei vollstaendige Pfade blau hervorgehoben sein:
  1. Start -> K -> Z, Endergebnis KZ.
  2. Start -> Z -> K, Endergebnis ZK.
- Die blaue Hervorhebung muss jeweils den kompletten Pfad vom Start bis zum Endergebnis zeigen.
- Die blaue Ergebnisbox unten darf blau gefuellt sein, aber sie darf keine blaue Verbindungslinie, keinen blauen Pfeil und keine blaue Markierung zum Pfad ZZ haben.
- Die Rechnung unten muss dazu passen:
  P(genau einmal K) = P(KZ) + P(ZK) = 1/4 + 1/4 = 1/2.
- Alle nicht passenden Pfade fuer "genau einmal K" duerfen nicht blau markiert sein.

Vermeiden:
- Keine blaue Markierung auf dem Pfad KK.
- Keine blaue Markierung auf dem Pfad ZZ.
- Keine blaue Verbindung von der Ergebnisbox zum Pfad ZZ.
- Nicht drei oder vier blaue Pfade fuer "genau einmal K" zeigen.
- Keine widerspruechlichen Pfeilfarben: blau nur fuer die beiden Ereignispfade KZ und ZK verwenden.
- Keine erfundenen oder unleserlichen deutschen Woerter.
- Keine technischen Kennungen, keine internen Labels, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
