# Lernzielvisualisierung: Matrixpotenzen in Übergangsprozessen deuten

## SkillPilot-Ziel

- SkillPilot-ID: `33c6e64c-5955-5b07-85d4-74a97b19dd56`
- Titel: Matrixpotenzen in Übergangsprozessen deuten
- Beschreibung: Die lernende Person kann Matrixpotenzen berechnen, Matrixeinträge bei Potenzen wie $M^2$ bestimmen und interpretieren sowie erläutern, welche Aussagen daraus über mehrschrittige Übergangsprozesse folgen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `33c6e64c-5955-5b07-85d4-74a97b19dd56.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/33c6e64c-5955-5b07-85d4-74a97b19dd56/33c6e64c-5955-5b07-85d4-74a97b19dd56.jpg`

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

Titel: Matrixpotenzen in Übergangsprozessen deuten
Beschreibung: Die lernende Person kann Matrixpotenzen berechnen, Matrixeinträge bei Potenzen wie $M^2$ bestimmen und interpretieren sowie erläutern, welche Aussagen daraus über mehrschrittige Übergangsprozesse folgen.

Zusatzanweisung:
Pflichtinhalt:
- Zweite Regeneration wegen Notationsrisiko: Kein Beispiel mit z0 oder z2 zeigen. Nur die Matrixpotenz P^2 und ihre Deutung darstellen.
- Thema: Matrixpotenzen in einem Uebergangsprozess deuten.
- Verwende exakt:
  P = [ [0,7, 0,3],
        [0,2, 0,8] ].
- Zeige:
  P^2 = P*P
      = [ [0,55, 0,45],
          [0,30, 0,70] ].
- Zeige alle vier Eintragsrechnungen in einer kleinen Tabelle:
  AA: 0,7*0,7 + 0,3*0,2 = 0,55.
  AB: 0,7*0,3 + 0,3*0,8 = 0,45.
  BA: 0,2*0,7 + 0,8*0,2 = 0,30.
  BB: 0,2*0,3 + 0,8*0,8 = 0,70.
- Deutung:
  Ein Eintrag in P^2 beschreibt eine Zwei-Schritt-Uebergangswahrscheinlichkeit.
  Beispiel: Von A nach zwei Schritten: 0,55 in A und 0,45 in B.
- Visualisiere die Deutung mit einem kleinen Zwei-Schritt-Pfadbaum von Start A zu Ziel A/B.

Vermeiden:
- Kein z0, kein z2, keine Zustandsvektoren.
- Keine Spaltenvektoren.
- P^2 nicht eintragsweise quadrieren.
- Nicht P^2 = P+P schreiben.
- Nicht AB als 0,21 angeben; Zwischenwege werden addiert.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
