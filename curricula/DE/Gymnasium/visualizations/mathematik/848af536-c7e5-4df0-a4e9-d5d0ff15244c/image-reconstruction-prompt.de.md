# Bildrekonstruktionsprompt: Exponentielle, begrenzte und logistische Wachstumsmodelle vergleichen

## SkillPilot-Ziel

- SkillPilot-ID: `848af536-c7e5-4df0-a4e9-d5d0ff15244c`
- Titel: Exponentielle, begrenzte und logistische Wachstumsmodelle vergleichen
- Beschreibung: Die lernende Person kann exponentielle, begrenzte und logistische Wachstumsmodelle vergleichen, Unterschiede im Verlauf fachlich herausarbeiten und die zugrunde liegenden Modellannahmen begründet einordnen.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `848af536-c7e5-4df0-a4e9-d5d0ff15244c.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein klares, lehrreiches Diagramm auf weißem Hintergrund, das drei Wachstumsmodelle vergleicht. Der Titel oben mittig in großer, fetter, schwarzer Schrift lautet: 'Exponentielle, begrenzte und logistische Wachstumsmodelle vergleichen'.

Das Diagramm zeigt ein Koordinatensystem mit einer schwarzen, nach rechts zeigenden x-Achse, beschriftet mit 'Zeit t' am rechten Ende, und einer schwarzen, nach oben zeigenden y-Achse, beschriftet mit 'Menge y' am oberen Ende. Der Ursprung ist bei (0,0). Auf der y-Achse sind die Werte '2', '10' und '20' markiert. Ein roter Punkt bei (0,2) ist mit 'Startwert (0, 2)' links davon beschriftet.

Eine schwarze, gestrichelte horizontale Linie verläuft bei y=20. Darüber, leicht rechts der Mitte, steht die Beschriftung 'Tragfähigkeit / Asymptotische Grenze y=20'.

Drei Kurven beginnen alle am Startwert (0,2):

1.  **Exponentielle Kurve:** Eine rote Kurve, die steil ansteigt, die gestrichelte Linie bei y=20 kreuzt und weiter nach oben verläuft. Oberhalb der Kurve, links, steht in fetter roter Schrift 'Exponentiell:'. Darunter in schwarzer Schrift die Gleichung 'E(t)=2*1.35^t'. Unterhalb dieser Kurve befindet sich eine wolkenförmige Sprechblase mit schwarzem Rand, die den Text 'Modellannahmen: konstante relative Wachstumsrate' enthält. Oberhalb der Kurve, wo sie die y=20 Linie überschreitet, zeigt ein roter Pfeil nach oben, begleitet von drei kleinen schwarzen Kreisen nahe der Kurve. Über dem Pfeil steht in schwarzer Schrift 'Keine obere Grenze'.

2.  **Begrenzte Kurve:** Eine blaue Kurve, die ansteigt und sich der gestrichelten Linie bei y=20 von unten asymptotisch nähert. Oberhalb der Kurve, rechts von der exponentiellen Kurve, steht in fetter blauer Schrift 'Begrenzt:'. Darunter in schwarzer Schrift die Gleichung 'B(t)=20-18*e^(-0.35t)'. Ein blauer Pfeil folgt der Kurve nach rechts, nahe der y=20 Linie.

3.  **Logistische Kurve:** Eine grüne Kurve, die ansteigt, zunächst langsam, dann schneller, dann wieder langsamer, und sich der gestrichelten Linie bei y=20 von unten asymptotisch nähert. Oberhalb der Kurve, ganz rechts, steht in fetter grüner Schrift 'Logistisch:'. Darunter in schwarzer Schrift die Gleichung 'L(t)=20/(1+9*e^(-0.6t))'. Auf dieser Kurve ist ein schwarzer Punkt bei ungefähr y=10 markiert, beschriftet mit 'Wendepunkt (y=10)' rechts und leicht oberhalb des Punktes. Drei kleine schwarze Kreise sind unterhalb des Wendepunkts nahe der Kurve platziert. Unterhalb der Kurve, nahe dem Wendepunkt, befindet sich eine wolkenförmige Sprechblase mit schwarzem Rand, die den Text 'Modellannahmen: Zuwachs hängt vom verbleibenden Abstand zur Grenze ab' enthält. Weiter rechts, unterhalb der 'Logistisch:' Beschriftung, ist eine weitere wolkenförmige Sprechblase mit schwarzem Rand, die den Text 'Modellannahmen: Selbstbegrenzung mit anfangs wachsendem, später fallendem Zuwachs' enthält. Ein grüner Pfeil folgt der Kurve nach rechts, nahe der y=20 Linie.
```
