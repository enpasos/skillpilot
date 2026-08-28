# Bildrekonstruktionsprompt: Flächeninhalte mithilfe uneigentlicher Integrale ermitteln (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `bfc2bf06-9b37-4912-a8eb-25fb5d489d72`
- Titel: Flächeninhalte mithilfe uneigentlicher Integrale ermitteln (LK)
- Beschreibung: Die lernende Person kann den Inhalt einer unendlich ausgedehnten Fläche durch passende uneigentliche Integrale als Grenzwerte bestimmen, die Fläche vorzeichengerecht in nichtnegative Teilflächen zerlegen und das Ergebnis nur dann als endlich deuten, wenn alle dafür erforderlichen Grenzwerte existieren und endlich sind.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `bfc2bf06-9b37-4912-a8eb-25fb5d489d72.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein Bild im Stil einer handgezeichneten, pädagogischen Skizze auf einem hellbeigen Hintergrund, umrandet von einer dicken, unregelmäßigen schwarzen Linie, die den Eindruck eines Notizblatts erweckt. Oben mittig steht der Titel in schwarzer, serifenloser Schrift: 'Flächeninhalte mithilfe uneigentlicher Integrale ermitteln (LK)'.

Die linke Hälfte des Bildes zeigt ein Koordinatensystem mit einer schwarzen x-Achse, beschriftet mit 'x' und einem Pfeil nach rechts, und einer schwarzen y-Achse, beschriftet mit 'y' und einem Pfeil nach oben. Auf der y-Achse ist eine Markierung mit '1-' versehen, auf der x-Achse eine Markierung mit '1'. Eine schwarze Kurve, die die Funktion f(x) = 1/x² für x ≥ 1 darstellt, beginnt bei einem schwarzen Punkt bei (1,1) und fällt asymptotisch zur x-Achse hin ab. Die Funktionsgleichung 'f(x) = 1/x² für x ≥ 1' ist rechts neben der y-Achse und oberhalb der Kurve platziert. Der Bereich unterhalb dieser Kurve, von x=1 bis ins Unendliche, ist hellblau schattiert und mit dem schwarzen Text 'Fläche A' beschriftet. Eine gestrichelte vertikale Linie verbindet x=1 auf der x-Achse mit dem Punkt (1,1) auf der Kurve. Eine gestrichelte horizontale Linie erstreckt sich vom rechten Ende der schattierten Fläche nach rechts, über der x-Achse, und endet mit einem Unendlichkeitszeichen (∞), was das unendliche Intervall des Integrals anzeigt.

Die rechte Hälfte des Bildes präsentiert eine Schritt-für-Schritt-Berechnung des uneigentlichen Integrals. Jeder Schritt beginnt mit einem schwarzen Doppelpfeil (⇒).
1.  'A = ∫₁^∞ (1/x²) dx' mit einem schwarzen Pfeil nach rechts, der auf den Text 'Uneigentliches Integral' zeigt.
2.  '⇒ lim_{b→∞} ∫₁^b (1/x²) dx' mit einem schwarzen Pfeil nach rechts, der auf den Text 'Mit Grenzwert schreiben (b als obere Grenze)' zeigt.
3.  '⇒ lim_{b→∞} [-1/x]₁^b' mit einem schwarzen Pfeil nach rechts, der auf den Text 'Stammfunktion bestimmen' zeigt.
4.  '⇒ lim_{b→∞} ((-1/b) - (-1/1))' mit einem schwarzen Pfeil nach rechts, der auf den Text 'Grenzen einsetzen (obere – untere)' zeigt.
5.  '⇒ lim_{b→∞} (-1/b + 1)' mit einem schwarzen Pfeil nach rechts, der auf den Text 'Grenzwert für b → ∞ berechnen' zeigt.
6.  '⇒ 0 + 1 = 1'.

Unten rechts im Bild befindet sich ein schwarzer, rechteckiger Kasten. Darin steht oben in fetter, schwarzer Schrift 'Ergebnis: A = 1'. Darunter ist eine lächelnde, männliche Cartoonfigur mit braunen Haaren und einem hellblauen Langarmshirt abgebildet, die mit dem rechten Zeigefinger auf eine weiße, schwarz umrandete Sprechblase zeigt. Die Sprechblase enthält den Text: 'Trotz unendlichem Intervall ist die Fläche endlich, weil der Grenzwert existiert.'
```
