# Lernzielvisualisierung: Kleinen Satz von Fermat beweisen (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `474fe553-d868-50d9-a19b-761e64f21c0d`
- Titel: Kleinen Satz von Fermat beweisen (LK)
- Beschreibung: Die lernende Person kann den kleinen Satz von Fermat formulieren, beweisen und seine Aussage in modular-arithmetischen Beispielen deuten.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Status: pilot
- Quellbild: `474fe553-d868-50d9-a19b-761e64f21c0d.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/474fe553-d868-50d9-a19b-761e64f21c0d/474fe553-d868-50d9-a19b-761e64f21c0d.jpg`

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

Titel: Kleinen Satz von Fermat beweisen (LK)
Beschreibung: Die lernende Person kann den kleinen Satz von Fermat formulieren, beweisen und seine Aussage in modular-arithmetischen Beispielen deuten.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Kleinen Satz von Fermat formulieren, beweisen und deuten.
- Formulierung:
  Ist p prim und p teilt a nicht, dann gilt a^(p-1) ≡ 1 mod p.
- Beispiel:
  p = 5, a = 2.
  2^4 = 16 und 16 ≡ 1 mod 5.
  Schreibe die finale Zeile exakt als Kongruenz: 2^4 ≡ 1 (mod 5).
- Beweisidee als kurze strukturierte Skizze:
  Die Restklassen 1, 2, ..., p-1 werden durch Multiplikation mit a modulo p nur permutiert.
  Daher gilt a*1, a*2, ..., a*(p-1) ≡ 1, 2, ..., p-1 modulo p in anderer Reihenfolge.
  Produkte vergleichen:
  a^(p-1)*(p-1)! ≡ (p-1)! mod p.
  Weil p die Zahl (p-1)! nicht teilt, darf man kuerzen.
  Also a^(p-1) ≡ 1 mod p.
- Visualisierung:
  Ein Kreis nur der Nichtnull-Restklassen modulo 5 mit Pfeilen fuer Multiplikation mit 2:
  1 -> 2 -> 4 -> 3 -> 1.
  Der Rest 0 darf in diesem Permutationskreis nicht vorkommen.

Vermeiden:
- Nicht fuer zusammengesetztes p formulieren.
- Die Voraussetzung p teilt a nicht nicht weglassen.
- Im Beispiel nicht Gleichheit mit Kongruenz verwechseln: nicht "16 = 1 mod 5", sondern "16 ≡ 1 mod 5".
- Nicht 2^5 ≡ 1 mod 5 als Hauptsatz schreiben; das waere hier nicht die Standardform.
- Im Restklassenkreis fuer die Multiplikation mit 2 modulo 5 keinen Knoten 0 zeigen; nur 1, 2, 3, 4.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
