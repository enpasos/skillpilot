# Bildrekonstruktionsprompt: Abstandsverfahren im Raum auswählen und anwenden

## SkillPilot-Ziel

- SkillPilot-ID: `fac75b4a-4ec2-5d38-bbce-9b002c8a4904`
- Titel: Abstandsverfahren im Raum auswählen und anwenden
- Beschreibung: Die lernende Person kann für eine gegebene Punkt-, Geraden- oder Ebenenkonfiguration ein passendes analytisches Abstandsverfahren auswählen und anwenden.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `fac75b4a-4ec2-5d38-bbce-9b002c8a4904.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein didaktisches Diagramm im Stil einer Infografik mit klaren Linien und abgerundeten Ecken, auf einem sehr hellblauen Hintergrund. Die verwendete Schriftart ist eine serifenlose Schrift, fett für Titel und Überschriften, normal für den Inhalt.

Der Titel oben mittig lautet in großer, fetter, schwarzer Schrift: 'Abstandsverfahren im Raum auswählen und anwenden'.

Darunter, mittig platziert, befindet sich ein abgerundetes Rechteck mit hellblauem Hintergrund und schwarzem Rand. Darin steht in schwarzer Schrift: '1. Lagebeziehung prüfen:\nWie liegen die Objekte?'.

Von diesem zentralen Kasten gehen vier Pfeile mit hellblauem Hintergrund und schwarzem Rand aus:
- Ein horizontaler Pfeil nach links.
- Ein horizontaler Pfeil nach rechts.
- Ein diagonaler Pfeil nach unten links.
- Ein diagonaler Pfeil nach unten rechts.

Unterhalb dieses zentralen Kastens sind vier weitere Hauptkästen in einem 2x2-Raster angeordnet. Jeder dieser Kästen hat einen schwarzen Rand und ist in einen farbigen Titelbereich und einen weißen Inhaltsbereich unterteilt.

**Oberer linker Kasten (Fall 1):**
Der Titelbereich hat einen hellblauen Hintergrund und enthält den fetten, schwarzen Text 'Fall 1: Punkt – Punkt'. Der weiße Inhaltsbereich zeigt ein 3D-Koordinatensystem mit schwarzen Achsen und einem schwarzen Gitter auf der xy-Ebene. Zwei blaue Punkte sind eingezeichnet und beschriftet: 'P' und 'Q'. Darunter steht der Text 'P=(1;2;2), Q=(4;6;2)'. Ein hellblauer Pfeil mit schwarzem Rand zeigt nach unten. Darunter befindet sich ein abgerundetes Rechteck mit gelbem Hintergrund und schwarzem Rand, das den Text 'Verfahren: Differenzvektor & Länge' enthält. Darunter steht die mathematische Notation: 'Q-P=(3;4;0)' und 'd(P,Q)=√(3²+4²+0²) = √25 = 5'. Ganz unten in diesem Kasten ist ein abgerundetes Rechteck mit hellblauem Hintergrund und schwarzem Rand, das den fetten Text 'Abstand d = 5' enthält.

**Oberer rechter Kasten (Fall 2):**
Der Titelbereich hat einen hellblauen Hintergrund und enthält den fetten, schwarzen Text 'Fall 2: Punkt – Ebene (speziell z=0)'. Der weiße Inhaltsbereich zeigt eine hellgrün karierte Ebene, beschriftet mit 'E₀', und einen blauen Punkt 'A' darüber, der durch eine vertikale schwarze Linie mit der Ebene verbunden ist. Darunter steht der Text 'E₀: z=0, A=(2;3;4)'. Ein hellblauer Pfeil mit schwarzem Rand zeigt nach unten. Darunter befindet sich ein abgerundetes Rechteck mit gelbem Hintergrund und schwarzem Rand, das den Text 'Verfahren: Lot / Hesse\n(hier z-Koordinate)' enthält. Darunter steht die mathematische Notation: 'd(A,E₀) = |z_A| = |4| = 4'. Ganz unten in diesem Kasten ist ein abgerundetes Rechteck mit hellblauem Hintergrund und schwarzem Rand, das den fetten Text 'Abstand d = 4' enthält.

**Unterer linker Kasten (Fall 3):**
Der Titelbereich hat einen hellgrünen Hintergrund und enthält den fetten, schwarzen Text 'Fall 3: Gerade – Ebene (parallel)'. Der weiße Inhaltsbereich zeigt eine hellgrün karierte Ebene, beschriftet mit 'E₀', und einen blauen Pfeil, der eine Gerade 'g' darstellt, parallel über der Ebene schwebend. Darunter steht der Text 'E₀: z=0, g: X=(1;2;3)+t(1;1;0)'. Ein hellblauer Pfeil mit schwarzem Rand zeigt nach unten. Darunter befindet sich ein abgerundetes Rechteck mit gelbem Hintergrund und schwarzem Rand, das den Text 'Verfahren: Punkt der Geraden\nnehmen (z.B. Stützpunkt)' enthält. Darunter steht die mathematische Notation: 'P_g=(1;2;3)' und 'd(g,E₀) = d(P_g,E₀) = |3| = 3'. Ganz unten in diesem Kasten ist ein abgerundetes Rechteck mit hellgrünem Hintergrund und schwarzem Rand, das den fetten Text 'Abstand d = 3' enthält.

**Unterer rechter Kasten (Fall 4):**
Der Titelbereich hat einen hellorangen Hintergrund und enthält den fetten, schwarzen Text 'Fall 4: Schneidende Objekte'. Der weiße Inhaltsbereich zeigt den Text 'Gerade schneidet Ebene /\nEbenen schneiden sich'. Darunter ist ein Diagramm von zwei sich schneidenden Ebenen (eine hellgrün, eine hellblau) in 3D-Darstellung, mit einer orangefarbenen Pfeillinie, die durch ihren Schnittpunkt verläuft. Ein rotes 'X' markiert den Schnittpunkt. Gestrichelte Linien zeigen verdeckte Teile der Ebenen an. Ein hellblauer Pfeil mit schwarzem Rand zeigt nach unten. Darunter befindet sich ein abgerundetes Rechteck mit gelbem Hintergrund und schwarzem Rand, das den Text 'Verfahren: Schnittpunkt\nexistiert, kein Abstand' enthält. Ganz unten in diesem Kasten ist ein abgerundetes Rechteck mit hellorangem Hintergrund und schwarzem Rand, das den fetten Text 'Abstand d = 0' enthält.

**Unterer Deutungskasten:**
Dieser Kasten ist ein abgerundetes Rechteck mit grauem Hintergrund und schwarzem Rand, mittig unter den vier Hauptkästen platziert. Er enthält den fetten, schwarzen Text: 'Deutung: Erst Lagebeziehung prüfen,\ndann passendes Abstandsverfahren wählen!'.

**Verbindende Pfeile zwischen den Kästen:**
- Vom unteren Rand des 'Fall 1'-Kastens führt ein hellblauer Pfeil mit schwarzem Rand vertikal nach unten, biegt dann nach rechts ab und verläuft diagonal nach unten rechts, um am oberen linken Rand des 'Deutung'-Kastens anzukommen.
- Vom unteren Rand des 'Fall 2'-Kastens führt ein hellblauer Pfeil mit schwarzem Rand vertikal nach unten, biegt dann nach links ab und verläuft diagonal nach unten links, um am oberen rechten Rand des 'Deutung'-Kastens anzukommen.
- Vom unteren Rand des 'Fall 3'-Kastens führt ein hellgrüner Pfeil mit schwarzem Rand vertikal nach unten, biegt dann nach rechts ab und verläuft horizontal, um am oberen linken Rand des 'Deutung'-Kastens anzukommen.
- Vom unteren Rand des 'Fall 4'-Kastens führt ein helloranger Pfeil mit schwarzem Rand vertikal nach unten, biegt dann nach links ab und verläuft horizontal, um am oberen rechten Rand des 'Deutung'-Kastens anzukommen.
- Vom 'Deutung'-Kasten gehen zwei horizontale, hellorangefarbene Pfeile mit schwarzem Rand aus: Der linke Pfeil biegt nach oben ab und endet am unteren rechten Rand des 'Fall 3'-Kastens. Der rechte Pfeil biegt nach oben ab und endet am unteren linken Rand des 'Fall 4'-Kastens.
```
