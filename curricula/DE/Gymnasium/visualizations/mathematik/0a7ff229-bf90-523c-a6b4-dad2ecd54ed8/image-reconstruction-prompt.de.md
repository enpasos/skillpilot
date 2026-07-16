# Bildrekonstruktionsprompt: Testergebnisse im Kontext interpretieren

## SkillPilot-Ziel

- SkillPilot-ID: `0a7ff229-bf90-523c-a6b4-dad2ecd54ed8`
- Titel: Testergebnisse im Kontext interpretieren
- Beschreibung: Die lernende Person kann entscheiden, ob die Nullhypothese verworfen oder beibehalten wird, das Ergebnis verständlich formulieren und die Aussagekraft des Tests kommentieren.

## Generator

- Provider: Google Gemini / Nano Banana Pro
- Quellbild: `0a7ff229-bf90-523c-a6b4-dad2ecd54ed8.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein klares, modernes und lehrreiches Diagramm auf einem hellblauen Hintergrund mit einem subtilen, hellblauen Gittermuster. Der Haupttitel oben in der Mitte lautet in fetter schwarzer Schrift: "Testergebnisse im Kontext interpretieren".

Das Diagramm ist in drei vertikale Abschnitte unterteilt, die durch gestrichelte hellgraue Linien getrennt sind.

**Linker Abschnitt:**
Oben befindet sich ein abgerundetes Rechteck mit dunkelblauem Rand und hellblauer Füllung, das den Text "Szenario & Nullhypothese (H0)" in schwarzer Schrift enthält. Darunter ist eine Illustration einer industriellen Förderbandanlage zu sehen. Ein graues Förderband bewegt sich von links nach rechts, mit kleinen grauen Zahnrädern darauf. Zwei graue Roboterarme sind über dem Band positioniert, einer links mit einem Greifer, einer rechts mit einem Werkzeug. Eine große Lupe schwebt in der Mitte über dem Förderband und zeigt ein rotes Zahnrad mit roten, strahlenförmigen Linien, das einen Fehler oder Fokus symbolisiert. Ein schwarzer Pfeil zeigt von der Lupe nach unten zu dem Text "X = Anzahl fehlerhafter Teile unter 20 geprüften Teilen" in schwarzer Schrift. Darunter befindet sich ein weiteres abgerundetes Rechteck mit dunkelblauem Rand und hellblauer Füllung, das ein graues Zahnrad-Symbol und den Text "H0: Fehlerquote ist nicht erhöht (p ≤ 0,10)" in schwarzer Schrift enthält. Ganz unten in diesem Abschnitt steht in fetter schwarzer Schrift: "Unter H0 gilt: X ~ B(20; 0,10)".

**Mittlerer Abschnitt:**
Oben befindet sich ein abgerundetes Rechteck mit dunkelblauem Rand und hellblauer Füllung, das den Text "Binomialtest (rechtsseitig) & Entscheidung" in schwarzer Schrift enthält. Darunter ist ein Säulendiagramm (Histogramm) einer Binomialverteilung dargestellt. Die X-Achse ist mit "Anzahl fehlerhafter Teile (k)" in schwarzer Schrift beschriftet und zeigt die Zahlen 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, gefolgt von "..." und 20. Die Y-Achse ist vertikal mit "Wahrscheinlichkeit P(X=k)" in schwarzer Schrift beschriftet. Die Säulen für k=0, 1, 2, 3, 4 sind blau und höher. Die Säulen für k=5, 6, 7, 8, 9, 10 und darüber hinaus sind rot und kürzer. Ein hellroter, schattierter rechteckiger Bereich erstreckt sich von k=5 nach rechts und umfasst die roten Säulen. In diesem Bereich steht der Text "Ablehnungsbereich (k ≥ 5)" in schwarzer Schrift. Eine gestrichelte rote vertikale Linie, die "Kritische Grenze" in roter vertikaler Schrift trägt, befindet sich zwischen k=4 und k=5. Ein gelber, abgerundeter Kasten mit dem Text "Beobachteter Wert (x_beob = 5)" in schwarzer Schrift ist über der Säule für k=5 positioniert, und ein gelber Pfeil zeigt von diesem Kasten auf die rote Säule bei k=5.

**Rechter Abschnitt:**
Oben befindet sich ein abgerundetes Rechteck mit dunkelblauem Rand und hellblauer Füllung, das den Text "Ergebnis & Interpretation" in schwarzer Schrift enthält. Darunter ist ein Flussdiagramm dargestellt. Das erste Element ist ein abgerundetes Rechteck mit dunkelblauem Rand und hellblauer Füllung, das den Text "x_beob = 5 liegt im Ablehnungsbereich" in schwarzer Schrift enthält. Ein schwarzer Pfeil zeigt von diesem Kasten nach unten zu einem weiteren abgerundeten Rechteck. Dieses zweite Rechteck hat einen dunkelgrünen Rand und eine hellgrüne Füllung und enthält ein grünes Häkchen-Symbol sowie den fetten schwarzen Text "Entscheidung: H0 verwerfen.". Ein weiterer schwarzer Pfeil zeigt von diesem Kasten nach unten zu einer blauen, wolkenförmigen Umrandung mit hellblauer Füllung. Innerhalb der Wolke steht der schwarze Text "Kontextdeutung: Die Daten sprechen für eine erhöhte Fehlerquote; sie sind kein Beweis.". Rechts oben an der Wolke ist ein gelbes, nachdenkliches Emoji (Gesicht mit Hand am Kinn) platziert.
```
