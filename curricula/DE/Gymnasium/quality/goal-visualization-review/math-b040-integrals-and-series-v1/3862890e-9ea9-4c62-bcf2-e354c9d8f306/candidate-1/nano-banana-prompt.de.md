# Lernzielvisualisierung: Bestimmtes Integral als Grenzwert von Ober- und Untersummen sowie als Bestandsänderung deuten

## SkillPilot-Ziel

- SkillPilot-ID: `3862890e-9ea9-4c62-bcf2-e354c9d8f306`
- Titel: Bestimmtes Integral als Grenzwert von Ober- und Untersummen sowie als Bestandsänderung deuten
- Beschreibung: Die lernende Person kann das bestimmte Integral als gemeinsamen Grenzwert von Ober- und Untersummen deuten und bei einer Änderungsrate als Bestandsänderung beschreiben, aus der zusammen mit dem Anfangsbestand der Endbestand entsteht.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `3862890e-9ea9-4c62-bcf2-e354c9d8f306.jpg`
- Public Asset: `/assets/goal-visualizations/mathematik/3862890e-9ea9-4c62-bcf2-e354c9d8f306/3862890e-9ea9-4c62-bcf2-e354c9d8f306.jpg`

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

Titel: Bestimmtes Integral als Grenzwert von Ober- und Untersummen sowie als Bestandsänderung deuten
Beschreibung: Die lernende Person kann das bestimmte Integral als gemeinsamen Grenzwert von Ober- und Untersummen deuten und bei einer Änderungsrate als Bestandsänderung beschreiben, aus der zusammen mit dem Anfangsbestand der Endbestand entsteht.

Zusatzanweisung:
Use case: diagram correction. Edit the supplied reference image while preserving its friendly hand-drawn cartoon style, warm paper background and readable German typography. Correct the left-hand mathematical visualization; retain the sound right-hand tank example, B(0)=7, integral increment +12, and B(4)=19.

Use the concise heading „Bestimmtes Integral und Bestandsänderung“. On the left show ONE large coordinate diagram only, labelled „f(t)=t+1, 0≤t≤4“. Draw a single origin (0,0), horizontal t ticks 0,1,2,3,4 evenly spaced and vertical f(t) ticks 0,1,2,3,4,5 evenly spaced. Draw the straight line through (0,1),(1,2),(2,3),(3,4),(4,5). It must reach height 5 at t=4.

Show exactly four intervals [0,1],[1,2],[2,3],[3,4], with no gap between the y-axis and the first rectangle. In each interval put a blue lower-sum rectangle of height 1,2,3,4 respectively. Above each blue rectangle add the red difference strip up to upper-sum height 2,3,4,5 respectively. Thus the blue lower sum is 10 and blue plus red upper sum is 14. Label „n=4: Untersumme 10, Obersumme 14“. Do not draw a second coordinate diagram.

Below this ONE diagram, put a compact table (not additional rectangles):
n | Untersumme | Obersumme
4 | 10 | 14
8 | 11 | 13
16 | 11,5 | 12,5
Then one clear arrow to „Gemeinsamer Grenzwert: ∫₀⁴(t+1) dt = 12“.

Retain the right-hand initial-stock + increment = final-stock explanation. The final sentence should read „Integralwert = Bestandsänderung. Anfangsbestand + Änderung = Endbestand.“ All axes must have a single zero at their intersection, every tick must be unique and correctly positioned. The number of drawn rectangles must be exactly four; n=8 and n=16 appear only in the numeric table. No extra graph, duplicated origin, decorative numbers or unsupported equality.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
