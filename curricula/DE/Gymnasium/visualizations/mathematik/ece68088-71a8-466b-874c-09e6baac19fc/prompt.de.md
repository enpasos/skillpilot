# Lernzielvisualisierung: Bestände aus Änderungsraten und Anfangsbestand rekonstruieren und deuten

## SkillPilot-Ziel

- SkillPilot-ID: `ece68088-71a8-466b-874c-09e6baac19fc`
- Titel: Bestände aus Änderungsraten und Anfangsbestand rekonstruieren und deuten
- Beschreibung: Die lernende Person kann Bestände aus Änderungsraten und einem Anfangsbestand berechnen sowie die Rekonstruktion in inner- und außermathematischen Kontexten deuten.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `ece68088-71a8-466b-874c-09e6baac19fc.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/ece68088-71a8-466b-874c-09e6baac19fc/ece68088-71a8-466b-874c-09e6baac19fc.jpg`

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

Titel: Bestände aus Änderungsraten und Anfangsbestand rekonstruieren und deuten
Beschreibung: Die lernende Person kann Bestände aus Änderungsraten und einem Anfangsbestand berechnen sowie die Rekonstruktion in inner- und außermathematischen Kontexten deuten.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Bestaende aus Aenderungsraten und Anfangsbestand rekonstruieren und deuten.
- Verwende einen Wassertank-Kontext mit Änderungsrate r(t)=3t^2 Liter pro Minute und Anfangsbestand B(0)=5 Liter.
- Zeige die Rekonstruktionsformel:
  B(t) = B(0) + integral_0^t r(s) ds
       = 5 + integral_0^t 3s^2 ds
       = 5 + t^3.
- Zeige fuer t=2:
  Aenderung = integral_0^2 3s^2 ds = [s^3]_0^2 = 8 Liter.
  B(2)=5+8=13 Liter.
- Deutung: Das Integral liefert die Bestandsaenderung; Anfangsbestand plus Aenderung ergibt den Bestand.
- Visualisiere deutlich getrennt: Rate r(t), Anfangsbestand, Integralflaeche als Zuwachs, Endbestand.

Vermeiden:
- Rate und Bestand nicht verwechseln: r(2)=12 Liter pro Minute ist nicht der Bestand.
- Nicht B(2)=8 schreiben; der Anfangsbestand 5 muss addiert werden.
- Keine negative Aenderung; r(t)=3t^2 ist auf [0,2] nicht negativ.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
