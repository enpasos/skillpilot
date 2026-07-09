# Bildrekonstruktionsprompt: Graphen von Flächeninhaltsfunktionen skizzieren

## SkillPilot-Ziel

- SkillPilot-ID: `9441bb35-2a2f-4edc-9d8a-bc58c257054d`
- Titel: Graphen von Flächeninhaltsfunktionen skizzieren
- Beschreibung: Die lernende Person kann zu dem Graphen einer gegebenen Randfunktion den Graphen der zugehörigen Flächeninhaltsfunktion qualitativ skizzieren.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `9441bb35-2a2f-4edc-9d8a-bc58c257054d.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein klares, didaktisches Diagramm auf weißem Hintergrund. Oben mittig steht der Titel in großer, fetter, schwarzer Schrift: 'Graphen von Flächeninhaltsfunktionen skizzieren'. Darunter, linksbündig, der Untertitel in kleinerer, schwarzer Schrift: 'Lernziel: Graphen der zugehörigen Flächeninhaltsfunktion qualitativ skizzieren', wobei 'Lernziel:' unterstrichen ist.

Links oben befindet sich ein Koordinatensystem mit einer dicken schwarzen X-Achse, beschriftet mit 't' und einem Pfeil nach rechts, und einer dicken schwarzen Y-Achse, beschriftet mit 'f(t)' und einem Pfeil nach oben. Der Ursprung ist bei (0,0). Die X-Achse hat Teilstriche und Beschriftungen bei 0, 1, 2, 3, 4, 5. Die Y-Achse hat Teilstriche und Beschriftungen bei -1, 0, 1, 2. Über diesem Graphen steht linksbündig 'f(t) Randfunktion f(t)' in schwarzer Schrift. Die Funktion f(t) wird durch drei Rechtecke dargestellt:
1.  Ein hellblaues Rechteck mit dicker schwarzer Umrandung von t=0 bis t=2 und einer Höhe von 2. Im Inneren steht 'Fläche = +4 (2x2)'.
2.  Ein hellrotes Rechteck mit dicker schwarzer Umrandung von t=2 bis t=4 und einer Höhe von -1 (unterhalb der X-Achse). Im Inneren steht 'Fläche = -2 (2x-1)'.
3.  Ein hellblaues Rechteck mit dicker schwarzer Umrandung von t=4 bis t=5 und einer Höhe von 1. Im Inneren steht 'Fläche = +1 (1x1)'.
Von den X-Achsen-Werten 2, 4 und 5 verlaufen gestrichelte vertikale schwarze Linien nach unten.

Links unten befindet sich ein zweites Koordinatensystem, direkt unter dem ersten. Es hat eine dicke schwarze X-Achse, beschriftet mit 'x' und einem Pfeil nach rechts, und eine dicke schwarze Y-Achse, beschriftet mit 'A(x)' und einem Pfeil nach oben. Der Ursprung ist bei (0,0). Die X-Achse hat Teilstriche und Beschriftungen bei 0, 2, 4, 5. Die Y-Achse hat Teilstriche und Beschriftungen bei 0, 2, 4. Über diesem Graphen steht linksbündig 'A(x) Flächeninhaltsfunktion A(x) = ∫₀ˣ f(t) dt' in schwarzer Schrift. Die Funktion A(x) wird durch eine dicke schwarze, abschnittsweise lineare Linie dargestellt:
1.  Beginnt bei (0,0), markiert mit einem schwarzen Punkt und beschriftet mit 'A(0)=0'.
2.  Steigt linear zu (2,4), markiert mit einem schwarzen Punkt und beschriftet mit 'A(2)=4'.
3.  Fällt linear zu (4,2), markiert mit einem schwarzen Punkt und beschriftet mit 'A(4)=2'.
4.  Steigt linear zu (5,3), markiert mit einem schwarzen Punkt und beschriftet mit 'A(5)=3'.
Die gestrichelten vertikalen schwarzen Linien von den X-Achsen-Werten 2, 4 und 5 aus dem oberen Graphen setzen sich fort und verbinden die X-Achse des unteren Graphen mit den entsprechenden Punkten auf der A(x)-Kurve.

Rechts neben den Graphen befindet sich ein weißes Rechteck mit abgerundeten Ecken und einer dicken schwarzen Umrandung. Im oberen Bereich des Rechtecks steht der Titel 'Zusammenhang & Skizzieren' in schwarzer Schrift, unterstrichen. Darunter sind drei Zeilen Text:
1.  Ein hellblauer, nach oben zeigender Pfeil mit schwarzer Umrandung, gefolgt von 'f(t) > 0 (positiv) → A(x) steigt (Gerade)'.
2.  Ein hellroter, nach unten zeigender Pfeil mit schwarzer Umrandung, gefolgt von 'f(t) < 0 (negativ) → A(x) fällt (Gerade)'.
3.  'f(t) = 0 → A(x) waagerecht'.
```
