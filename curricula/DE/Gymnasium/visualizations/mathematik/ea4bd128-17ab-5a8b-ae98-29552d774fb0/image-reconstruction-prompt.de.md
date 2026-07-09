# Bildrekonstruktionsprompt: Ebenengleichung aus geometrischen Bedingungen bestimmen

## SkillPilot-Ziel

- SkillPilot-ID: `ea4bd128-17ab-5a8b-ae98-29552d774fb0`
- Titel: Ebenengleichung aus geometrischen Bedingungen bestimmen
- Beschreibung: Die lernende Person kann eine Ebenengleichung aus Bedingungen wie drei Punkten, Punkt+Normalenvektor oder Punkt+zwei Richtungsvektoren bestimmen.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `ea4bd128-17ab-5a8b-ae98-29552d774fb0.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein Bild im handgezeichneten, lehrbuchartigen Stil mit schwarzen Umrissen auf hellblauem Hintergrund. Der Text ist in einer runden, serifenlosen, handschriftähnlichen Schriftart gehalten.

Oben mittig steht der große, schwarze, fette Titel: "Ebenengleichung aus geometrischen Bedingungen bestimmen". Darunter, linksbündig, steht der etwas kleinere, schwarze, fette Untertitel: "Beispiel: Ebene E durch drei Punkte".

Das Bild ist in drei vertikale, abgerundete Rechtecke unterteilt, die horizontal nebeneinander angeordnet sind. Die Kästen haben einen hellblauen Rand und eine weiße Innenfläche. Der linke Kasten ist breiter als die beiden rechten. Geschwungene hellblaue Pfeile verbinden die Kästen von links nach rechts, um einen Arbeitsablauf darzustellen.

**Linker Kasten (breit):**
Dieser Kasten zeigt ein 3D-kartesisches Koordinatensystem. Die x-Achse zeigt diagonal nach unten links, die y-Achse horizontal nach rechts und die z-Achse vertikal nach oben. Alle Achsen haben Pfeile an ihren positiven Enden; der Pfeil der z-Achse ist rot, die anderen sind schwarz. Eine hellgrüne, karierte Ebene ist im ersten Quadranten eingezeichnet, die alle drei Achsen schneidet. Auf der Ebene befinden sich drei grüne Punkte mit schwarzen Beschriftungen: A = (1; 0; 1), B = (3; 1; 1) und C = (1; 2; 2). Zwei blaue Vektoren gehen von Punkt A aus: ein Vektor zu B, beschriftet als "$\vec{u} = \vec{AB} = (2; 1; 0)$", und ein Vektor zu C, beschriftet als "$\vec{v} = \vec{AC} = (0; 2; 1)$". Ein roter Vektor, der senkrecht zur Ebene steht, geht ebenfalls von Punkt A aus und ist beschriftet als "$\vec{n} = \vec{u} \times \vec{v} = (1; -2; 4)$". Unter diesem roten Vektor steht der schwarze Text "Normalenvektor".

**Mittlerer Kasten:**
Oben in diesem Kasten steht der schwarze Titel: "1. Vektoren berechnen & Normalenvektor". Darunter befindet sich ein kleines Symbol aus zwei gekreuzten blauen Pfeilen mit grünen Punkten an den Enden. Daneben steht der schwarze Text "Spannvektoren:". Es folgen die mathematischen Gleichungen in Schwarz:
"$\vec{u} = \vec{B} - \vec{A} = (2; 1; 0)$"
"$\vec{v} = \vec{C} - \vec{A} = (0; 2; 1)$"
Darunter ist ein weiteres kleines Symbol zu sehen: ein blauer Pfeil mit einem grünen Punkt an der Spitze, der senkrecht zu einer gestrichelten Linie steht. Daneben steht der schwarze Text "Normalenvektor:". Es folgt die mathematische Gleichung in Schwarz:
"$\vec{n} = \vec{u} \times \vec{v} = (1; -2; 4)$"

**Rechter Kasten:**
Oben in diesem Kasten steht der schwarze Titel: "2. Ebenengleichung & Kontrolle". Darunter steht der schwarze Text "Punkt-Normalen-Form (mit A):". Es folgt die mathematische Gleichung in Schwarz:
"$((x; y; z) - (1; 0; 1)) \cdot (1; -2; 4) = 0$"
Ein blauer Pfeil zeigt nach unten. Darunter steht der schwarze Text "Koordinatenform:". Es folgen die mathematischen Gleichungen in Schwarz:
"$(x - 1) - 2y + 4(z - 1) = 0$"
"$\Rightarrow x - 2y + 4z = 5$"
Darunter befindet sich ein hellblau umrandetes, abgerundetes Rechteck mit weißer Füllung, das den schwarzen Text "Kontrolle:" enthält. Innerhalb dieses Kontrollkastens stehen die schwarzen Texte:
"B: $3 - 2(1) + 4(1) = 3 - 2 + 4 = 5 \checkmark$"
"C: $1 - 2(2) + 4(2) = 1 - 4 + 8 = 5 \checkmark$"
Die Häkchen sind grün. Unter dem Kontrollkasten steht der schwarze Text "Ergebnis:". Daneben befindet sich ein weiteres hellblau umrandetes, abgerundetes Rechteck mit weißer Füllung, das das Endergebnis in schwarzem Text enthält: "$x - 2y + 4z = 5$".
```
