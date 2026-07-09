# Bildrekonstruktionsprompt: Integrale ganzrationaler Funktionenscharen berechnen

## SkillPilot-Ziel

- SkillPilot-ID: `d144a855-9139-55c7-a801-e8b85dab5f01`
- Titel: Integrale ganzrationaler Funktionenscharen berechnen
- Beschreibung: Die lernende Person kann Stammfunktionen und bestimmte Integrale ganzrationaler Funktionenscharen parameterabhängig berechnen und die Ergebnisse im Zusammenhang der Schar deuten.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `d144a855-9139-55c7-a801-e8b85dab5f01.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein Bild im Stil einer Bildungspräsentation oder eines Lehrbuchs. Der Hintergrund ist weiß. Oben befindet sich ein breiter, horizontaler blauer Kasten mit abgerundeten Ecken und einem leichten Farbverlauf von oben nach unten (dunkleres Blau oben, helleres Blau unten) sowie einem dünnen dunkelblauen Rand. In diesem Kasten steht in großer, fetter, weißer serifenloser Schrift der Titel: "Integrale ganzrationaler Funktionenscharen berechnen".

Unterhalb des Titels sind zwei Hauptbereiche angeordnet. Der linke Bereich hat einen hellgrauen Hintergrund mit abgerundeten Ecken und einem dünnen dunkelgrauen Rand. Der rechte Bereich hat einen hellblauen Hintergrund mit abgerundeten Ecken und einem dünnen dunkelblauen Rand.

Der linke Bereich ist überschrieben mit einem kleineren, fetten, schwarzen serifenlosen Text in einem hellgrauen Kasten mit abgerundeten Ecken und dünnem dunkelgrauen Rand: "Parameterabhängige Berechnung (kurz)". Darunter folgen mehrere Zeilen mit schwarzem serifenlosem Text und mathematischen Formeln:
"Gegebene Funktionenschar:"
`f_a(x) = a \cdot x + 1`
Rechts neben dem `a` in der Formel zeigt ein schwarzer Pfeil nach links auf das `a`, daneben steht "Parameter a".
"Stammfunktion:"
`F_a(x) = \frac{a}{2} \cdot x^2 + x`
Rechts neben der Formel zeigt ein schwarzer Pfeil nach links auf die Formel, daneben steht "Stammfunktion".
"Bestimmtes Integral von 0 bis 2:"
`\int_0^2 (a \cdot x + 1) dx = [F_a(x)]_0^2`
`= F_a(2) - F_a(0)`
Rechts neben dieser Zeile zeigt ein schwarzer Pfeil nach links auf die Zeile, daneben steht in zwei Zeilen "Hauptsatz der Differential- und Integralrechnung".
`= (\frac{a}{2} \cdot 2^2 + 2) - (\frac{a}{2} \cdot 0^2 + 0)`
`= (2a + 2) - 0`
`= 2a + 2`
Rechts neben dieser letzten Zeile zeigt ein schwarzer Pfeil nach links auf die Zeile, daneben steht "Ergebnis hängt von a ab".

Der rechte Bereich ist überschrieben mit einem kleineren, fetten, schwarzen serifenlosem Text in einem hellblauen Kasten mit abgerundeten Ecken und dünnem dunkelblauen Rand: "Visualisierung & Deutung für verschiedene Parameterwerte a". Darunter sind drei separate, nebeneinander angeordnete Koordinatensysteme zu sehen. Jedes Koordinatensystem hat einen leicht helleren blauen Hintergrund als der Hauptbereich.

Das erste (linke) Koordinatensystem zeigt:
Oben steht in schwarzem serifenlosem Text: `a = 2, f_2(x) = 2x + 1`.
Es hat eine schwarze X-Achse, beschriftet mit "x" am Ende, und eine schwarze Y-Achse, beschriftet mit "y" am oberen Ende. Die Achsen sind mit kleinen schwarzen Strichen markiert. Die X-Achse ist bei 0, 1, 2 beschriftet. Die Y-Achse ist bei 0, 1, 2, 3, 4, 5 beschriftet, wobei die 1 explizit markiert ist. Der Ursprung ist mit "0" beschriftet.
Ein violetter Linienabschnitt verbindet die Punkte (0|1) und (2|5). Der Punkt (0|1) ist explizit beschriftet, und der Punkt (2|5) ist explizit beschriftet.
Die Fläche unter diesem Linienabschnitt von x=0 bis x=2 ist hellviolett schattiert und bildet ein Trapez. In dieser schattierten Fläche steht in großer, fetter, schwarzer serifenloser Schrift: `A_2 = 6`.

Das zweite (mittlere) Koordinatensystem zeigt:
Oben steht in schwarzem serifenlosem Text: `a = 1, f_1(x) = x + 1`.
Es hat eine schwarze X-Achse, beschriftet mit "x" am Ende, und eine schwarze Y-Achse, beschriftet mit "y" am oberen Ende. Die Achsen sind mit kleinen schwarzen Strichen markiert. Die X-Achse ist bei 0, 1, 2 beschriftet. Die Y-Achse ist bei 0, 1, 2, 3 beschriftet, wobei die 1 explizit markiert ist. Der Ursprung ist mit "0" beschriftet.
Ein grüner Linienabschnitt verbindet die Punkte (0|1) und (2|3). Der Punkt (0|1) ist explizit beschriftet, und der Punkt (2|3) ist explizit beschriftet.
Die Fläche unter diesem Linienabschnitt von x=0 bis x=2 ist hellgrün schattiert und bildet ein Trapez. In dieser schattierten Fläche steht in großer, fetter, schwarzer serifenloser Schrift: `A_1 = 4`.

Das dritte (rechte) Koordinatensystem zeigt:
Oben steht in schwarzem serifenlosem Text: `a = 0, f_0(x) = 1`.
Es hat eine schwarze X-Achse, beschriftet mit "x" am Ende, und eine schwarze Y-Achse, beschriftet mit "y" am oberen Ende. Die Achsen sind mit kleinen schwarzen Strichen markiert. Die X-Achse ist bei 0, 1, 2 beschriftet. Die Y-Achse ist bei 0, 1 beschriftet, wobei die 1 explizit markiert ist. Der Ursprung ist mit "0" beschriftet.
Ein oranger horizontaler Linienabschnitt verbindet die Punkte (0|1) und (2|1). Der Punkt (0|1) ist explizit beschriftet, und der Punkt (2|1) ist explizit beschriftet.
Die Fläche unter diesem Linienabschnitt von x=0 bis x=2 ist hellorange schattiert und bildet ein Rechteck. In dieser schattierten Fläche steht in großer, fetter, schwarzer serifenloser Schrift: `A_0 = 2`.

Alle Texte sind klar lesbar und die mathematischen Notationen sind präzise dargestellt. Der Gesamtstil ist sauber und didaktisch.
```
