# Lernzielvisualisierung: Waagerechter Wurf analysieren

## SkillPilot-Ziel

- SkillPilot-ID: `89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2`
- Titel: Waagerechter Wurf analysieren
- Beschreibung: Die lernende Person kann den waagerechten Wurf experimentell untersuchen, als Überlagerung von horizontaler und vertikaler Bewegung deuten und die Flugbahn im x-y-Diagramm darstellen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Status: pilot
- Quellbild: `89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2.jpg`
- Public Asset: `/assets/goal-visualizations/physik/89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2/89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2.jpg`

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

Titel: Waagerechter Wurf analysieren
Beschreibung: Die lernende Person kann den waagerechten Wurf experimentell untersuchen, als Überlagerung von horizontaler und vertikaler Bewegung deuten und die Flugbahn im x-y-Diagramm darstellen.

Zusatzanweisung:
Use case: precise-object-edit.
Bearbeite das beigefügte Referenzbild als deutsche Lehrbuchgrafik. Bewahre die korrekten Formeln, Tabelle, Überschriften, Erklärung, Farben und das übersichtliche Layout. Korrigiere die gesamte gezeichnete Wurfparabel und ihre Punkt-/Hilfsliniengeometrie, nicht bloß ein Zahlenetikett.

Es gilt ein idealer waagerechter Wurf ohne Luftwiderstand: vₓ = 2 m/s, vᵧ(0) = 0 und Modellwert g = 10 m/s². Der Ursprung liegt am Abwurfpunkt. Die x-Achse zeigt nach rechts, die y-Achse nach UNTEN. Beide Achsen sind linear, x von 0 bis 6 m, y von 0 bis 50 m; gleich große numerische Schritte müssen auf jeder einzelnen Achse gleich große Abstände haben. Es gilt x(t)=vₓ·t, y(t)=½g·t², y(x)=g/(2vₓ²)·x². Die glatte Parabel beginnt bei (0|0) mit waagerechter Tangente und wird in Richtung rechts zunehmend steiler nach unten.
EXAKTE Datenpunkte auf dieser Parabel: t=1 s bei (x|y)=(2 m|5 m), t=2 s bei (4 m|20 m), t=3 s bei (6 m|45 m). Der mittlere Punkt muss genau auf der SENKRECHTEN bei x=4 und der WAAGERECHTEN bei y=20 liegen, NICHT bei y=25 und NICHT rechts von x=4. Gestrichelte Hilfslinien enden jeweils genau am Punkt und den passenden Achsenwerten. Verwende bei Bedarf ein leichtes rechtwinkliges Raster, um alle Schnittpunkte eindeutig zu machen. Keine zusätzlichen anders positionierten Punkte mit denselben Zeitmarken.

Tabelle unverändert: t/s: 0,1,2,3; x/m: 0,2,4,6; y/m: 0,5,20,45. Die korrekte Erklärung zum gemeinsamen Zeitparameter und zur Überlagerung gleichförmiger horizontaler und gleichmäßig beschleunigter vertikaler Bewegung erhalten. Jeder sichtbare Zahlenwert und jede Kurvenmarkierung muss mit diesen Formeln übereinstimmen. Keine internen IDs, Pixelmaße oder Arbeitsanweisungen im Bild.
```

## Review-Notiz

Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.
