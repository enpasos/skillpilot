# Lernzielvisualisierung: Resonanzkurven analysieren

## SkillPilot-Ziel

- SkillPilot-ID: `c0205f47-185c-5e27-b89c-c3ff8809b1d1`
- Titel: Resonanzkurven analysieren
- Beschreibung: Die lernende Person kann Resonanzkurven für unterschiedliche Dämpfungen qualitativ und quantitativ diskutieren.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `c0205f47-185c-5e27-b89c-c3ff8809b1d1.jpg`
- Public Asset: `/assets/goal-visualizations/physik/c0205f47-185c-5e27-b89c-c3ff8809b1d1/c0205f47-185c-5e27-b89c-c3ff8809b1d1.jpg`

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

Titel: Resonanzkurven analysieren
Beschreibung: Die lernende Person kann Resonanzkurven für unterschiedliche Dämpfungen qualitativ und quantitativ diskutieren.

Zusatzanweisung:
Use case: precise-object-edit / scientific-educational
Das Referenzbild enthält FALSCHE Kurven, die ersetzt werden müssen, nicht nachzeichnen! Erhalte nur Titel, Handschriftstil, Farbschema, Rahmen und Achsentypen. Lösche im Diagramm beide alten Kurven und ihre alten Gipfelmarkierungen vollständig. Zeichne dort zwei NEUE Resonanzkurven für gleiche Kraftamplitude und zwei verschiedene Dämpfungen.
Die blaue Kurve beginnt LINKS an der y-Achse bei derselben positiven Höhe wie Rot. Für jede Frequenz rechts davon liegt BLAU OBERHALB von ROT, sie dürfen sich NICHT schneiden. Insbesondere links des Gipfels muss Blau über Rot verlaufen, nicht umgekehrt wie in der Vorlage! Ganz rechts liegen beide nahe null, Blau weiterhin leicht oberhalb Rot.
Formel als Konstruktionshilfe: normierte Amplitude A=1/sqrt((1-r²)²+(2ζr)²), r=f/f₀. Blau ζ=0,1, Rot ζ=0,3. Kontrollpunkte für (r; Blau; Rot): (0;1;1), (0,5;1,322;1,238), (0,9;4,188;1,747), (1;5;1,667), (1,5;0,778;0,649), (2;0,330;0,309). Diese Kontrollpunkte nicht als Text auflisten, sondern wirklich bei der Kurvenform verwenden. Blau Gipfel nahe r=0,99, Rot Gipfel nahe r=0,91. Dezente Markierung f₀ bei r=1. Kurvenbeschriftungen „Schwache Dämpfung“ blau und „Stärkere Dämpfung“ rot. Zusatz „Gleiche Kraftamplitude, nur Dämpfung verschieden“ beibehalten. Keine technischen IDs. Wichtig: die Änderung ist die tatsächliche Kurvengeometrie, nicht nur eine erklärende Zusatzzeile!
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
