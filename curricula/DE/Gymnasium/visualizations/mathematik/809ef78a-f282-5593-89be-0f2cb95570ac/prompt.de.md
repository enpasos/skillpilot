# Lernzielvisualisierung: Bestände und Mittelwerte modellieren

## SkillPilot-Ziel

- SkillPilot-ID: `809ef78a-f282-5593-89be-0f2cb95570ac`
- Titel: Bestände und Mittelwerte modellieren
- Beschreibung: Die lernende Person kann in Sachsituationen Bestände, rekonstruierte Bestände, mittlere Bestände und mittlere Änderungsraten mit bestimmten Integralen modellieren, berechnen und die Ergebnisse interpretieren.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `809ef78a-f282-5593-89be-0f2cb95570ac.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/809ef78a-f282-5593-89be-0f2cb95570ac/809ef78a-f282-5593-89be-0f2cb95570ac.jpg`

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

Titel: Bestände und Mittelwerte modellieren
Beschreibung: Die lernende Person kann in Sachsituationen Bestände, rekonstruierte Bestände, mittlere Bestände und mittlere Änderungsraten mit bestimmten Integralen modellieren, berechnen und die Ergebnisse interpretieren.

Zusatzanweisung:
Pflichtinhalt:
- Thema: Bestaende und Mittelwerte mit Integralen modellieren.
- Kontext: Wasserbestand mit Änderungsrate r(t)=2t fuer 0<=t<=3 und Anfangsbestand B(0)=10 Liter.
- Zeige drei Teilrechnungen:
  1. Bestandsaenderung:
     integral_0^3 2t dt = [t^2]_0^3 = 9 Liter.
  2. Rekonstruierter Bestand:
     B(3)=10+9=19 Liter.
  3. Mittlere Änderungsrate:
     (B(3)-B(0))/(3-0)=9/3=3 Liter pro Minute.
- Zeige optional den mittleren Bestand:
  B(t)=10+t^2.
  mittlerer Bestand auf [0,3] = (1/3)*integral_0^3 (10+t^2) dt = (1/3)*(30+9)=13 Liter.
- Ergebnisbox: Integral liefert Bestandsaenderung; Mittelwerte entstehen durch Teilen durch die Intervalllaenge.

Vermeiden:
- Die Bestandsaenderung 9 nicht mit dem Endbestand 19 verwechseln.
- Mittlere Änderungsrate nicht als 19/3 berechnen; richtig ist 9/3=3.
- Mittleren Bestand nicht mit mittlerer Änderungsrate verwechseln.
- Keine technischen IDs, keine Produktnamen, keine Wasserzeichen.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
