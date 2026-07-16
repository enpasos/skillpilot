# Bildrekonstruktionsprompt: Intervalladditivität und Linearität von Integralen nutzen

## SkillPilot-Ziel

- SkillPilot-ID: `649b673c-1a74-5dc5-af01-b4c9e090b90d`
- Titel: Intervalladditivität und Linearität von Integralen nutzen
- Beschreibung: Die lernende Person kann bestimmte Integrale mithilfe von Intervalladditivität und Linearität umformen, zerlegen, zusammenfassen und die Rechenschritte fachlich begründen.

## Generator

- Provider: Google Gemini / Nano Banana Pro (gemini-3-pro-image)
- Quellbild: `649b673c-1a74-5dc5-af01-b4c9e090b90d.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein klares, modernes mathematisches Erklärungsdiagramm auf einem hellgrauen Hintergrund mit subtilen, zufälligen hellgrauen Flecken. Der Gesamtstil ist sauber und didaktisch.

Oben mittig steht der Haupttitel in schwarzer, fetter, serifenloser Schrift: "Intervalladditivität und Linearität von Integralen nutzen".

Das Bild ist in zwei Hauptbereiche unterteilt: links "Intervalladditivität" und rechts "Linearität".

**Linker Bereich: Intervalladditivität**
Unter dem Haupttitel, linksbündig, steht der Untertitel in schwarzer, fetter, serifenloser Schrift: "Intervalladditivität".

Darunter die mathematische Formel in schwarzer Schrift:
`∫_a^c f(x) dx = ∫_a^b f(x) dx + ∫_b^c f(x) dx`

Darunter befindet sich ein 2D-Koordinatensystem mit einer horizontalen x-Achse und einer vertikalen y-Achse, beide mit Pfeilen in positiver Richtung. Die x-Achse ist von links nach rechts mit den Beschriftungen 'a', 'b', 'c' versehen. Eine schwarze, geschwungene Linie, die die Funktion `f(x)` darstellt, verläuft oberhalb der x-Achse von 'a' bis 'c'. Die Linie ist oberhalb der Kurve mit "f(x)" beschriftet.
Der Bereich unter der Kurve von 'a' bis 'b' ist hellblau schattiert und mit `∫_a^b f(x) dx` beschriftet.
Der Bereich unter der Kurve von 'b' bis 'c' ist orange schattiert und mit `∫_b^c f(x) dx` beschriftet.
Ein schwarzer Pfeil zeigt von der gesamten Fläche unter der Kurve von 'a' bis 'c' nach rechts, und neben dem Pfeil steht die Beschriftung `∫_a^c f(x) dx`.

Weiter unten, linksbündig, sind folgende mathematische Ausdrücke in schwarzer Schrift aufgelistet:
`f(x) = x + 1`
`∫_0^2 f(x) dx = 4`
`∫_2^4 f(x) dx = 8`
`∫_0^4 f(x) dx = 12`

Rechts neben diesen Ausdrücken befindet sich ein weiteres 2D-Koordinatensystem mit x- und y-Achsen, beide mit Pfeilen. Die x-Achse ist mit '0', '2', '4' beschriftet. Eine schwarze gerade Linie, die `f(x) = x + 1` darstellt, verläuft von Punkt (0,1) bis (4,5). Die Punkte (0,1), (2,3) und (4,5) sind an der Linie beschriftet.
Der Bereich unter der Linie von x=0 bis x=2 ist hellblau schattiert und enthält die große, fette Zahl '4'. Eine gestrichelte vertikale Linie markiert x=2.
Der Bereich unter der Linie von x=2 bis x=4 ist orange schattiert und enthält die große, fette Zahl '8'.
Rechts neben dem orange schattierten Bereich steht die große, fette Zahl '12', die die Summe der beiden Flächen darstellt.

**Rechter Bereich: Linearität**
Rechts neben dem linken Bereich, auf gleicher Höhe wie der linke Untertitel, steht der Untertitel in schwarzer, fetter, serifenloser Schrift: "Linearität".

Darunter die mathematische Formel in schwarzer Schrift:
`∫_a^b (λf(x) + μg(x)) dx = λ∫_a^b f(x) dx + μ∫_a^b g(x) dx`
Unter dieser Formel sind drei hellgraue, geschwungene Pfeile.
Ein Pfeil zeigt von `λf(x)` im linken Integral zu `λ∫_a^b f(x) dx` im rechten Ausdruck. Darunter steht in schwarzer Schrift "Konstantenausklammerung".
Ein weiterer Pfeil zeigt von `μg(x)` im linken Integral zu `μ∫_a^b g(x) dx` im rechten Ausdruck. Darunter steht ebenfalls in schwarzer Schrift "Konstantenausklammerung".
Ein dritter Pfeil zeigt vom Pluszeichen `+` innerhalb der Klammer `(λf(x) + μg(x))` zum Pluszeichen `+` zwischen den beiden Integralen im rechten Ausdruck. Darunter steht in schwarzer Schrift "Summieren von Funktionen".

Eine dünne, hellgraue horizontale Linie trennt die Formel von den Beispielen.

Darunter sind folgende mathematische Ausdrücke in schwarzer Schrift:
`f(x) = x + 1`
`∫_0^2 (2f(x) + 1) dx = 2∫_0^2 f(x) dx + ∫_0^2 1 dx = 10`

Darunter sind drei Elemente nebeneinander angeordnet:
1. Ein 2D-Koordinatensystem mit x- und y-Achsen, beide mit Pfeilen. Die x-Achse ist mit '0', '2' beschriftet. Die y-Achse ist mit '1' beschriftet. Eine schwarze gerade Linie, die `f(x) = x + 1` darstellt, verläuft von (0,1) bis (2,3). Die Linie ist diagonal mit "f(x) = x + 1" beschriftet. Der Bereich unter der Linie von x=0 bis x=2 ist hellblau schattiert und enthält die große, fette Zahl '4'. Eine gestrichelte vertikale Linie markiert x=2.
2. Rechts davon steht ein großes, fettes "+ 1" in schwarzer Schrift.
3. Rechts davon ein weiteres 2D-Koordinatensystem mit x- und y-Achsen, beide mit Pfeilen. Die x-Achse ist mit '0', '2' beschriftet. Die y-Achse ist mit '1' beschriftet. Eine schwarze horizontale Linie, die `g(x) = 1` darstellt, verläuft von (0,1) bis (2,1). Die Linie ist oberhalb mit "g(x) = 1" beschriftet. Der Bereich unter der Linie von x=0 bis x=2 ist orange schattiert und enthält die große, fette Zahl '2'. Eine gestrichelte vertikale Linie markiert x=2.

Ganz unten, mittig unter den drei Elementen, steht die Berechnung in schwarzer, fetter Schrift: `2 ⋅ 4 + 2 = 8 + 2 = 10`.
```
