# Bildrekonstruktionsprompt: Herleitung der Poisson-Verteilung als Grenzfall (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `1cefd1ad-a250-5a03-8de7-04bdaf465ad8`
- Titel: Herleitung der Poisson-Verteilung als Grenzfall (LK)
- Beschreibung: Die lernende Person kann die Poisson-Verteilung als Näherung der Binomialverteilung bei konstantem Erwartungswert begründen und den Grenzübergang $n\to\infty$ beweisen beziehungsweise nachvollziehen.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `1cefd1ad-a250-5a03-8de7-04bdaf465ad8.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein klares, didaktisches Diagramm auf weißem Hintergrund, das die Herleitung der Poisson-Verteilung als Grenzfall darstellt.

Oben mittig befindet sich ein großer, schwarzer Titel in einem hellgrauen Rechteck mit abgerundeten Ecken und schwarzem Rand: "Herleitung der Poisson-Verteilung als Grenzfall (LK)".

Darunter, horizontal zentriert, sind zwei große, gleich hohe Rechtecke nebeneinander angeordnet, mit einem Pfeil dazwischen.

Das linke Rechteck hat einen hellblauen Hintergrund, abgerundete Ecken und einen schwarzen Rand. Sein Titel lautet "Binomialverteilung (Diskret)" in schwarzer, fetter Schrift, zentriert. Innerhalb dieses Rechtecks befindet sich ein Histogramm:
Eine horizontale Achse ist mit "k" beschriftet und zeigt die Werte "0", "1", "2", gefolgt von "..." und einem Pfeil nach rechts. Eine vertikale Achse ist mit "P" beschriftet und zeigt einen Pfeil nach oben.
Blaue vertikale Balken sind über den Werten auf der k-Achse zentriert: ein kurzer Balken bei 0, ein mittelhoher Balken bei 1, der höchste Balken bei 2, ein mittelhoher Balken bei 3, ein etwas kürzerer Balken bei 4, ein kurzer Balken bei 5 und sehr kurze, abnehmende Balken danach.
Innerhalb dieses Histogrammbereichs sind drei weitere kleine Rechtecke mit hellblauem Hintergrund, abgerundeten Ecken und schwarzem Rand platziert:
1.  Oben links: "Viele Versuche: n → ∞"
2.  Oben rechts: "X_n ~ B(n, p_n)"
3.  Unten rechts: "Sehr kleine Wahrscheinlichkeit: p_n → 0"

Zwischen dem linken und rechten Rechteck befindet sich ein großer, weißer Pfeil, der von links nach rechts zeigt. Über dem Pfeil steht der schwarze Text "Grenzüberggang:". Unter dem Pfeil ist ein kleines Rechteck mit weißem Hintergrund, abgerundeten Ecken und schwarzem Rand, das den schwarzen Text "λ = n * p_n (konstant)" enthält.

Das rechte Rechteck hat einen hellorangen Hintergrund, abgerundete Ecken und einen schwarzen Rand. Sein Titel lautet "Poisson-Verteilung (Diskret, selten)" in schwarzer, fetter Schrift, zentriert. Innerhalb dieses Rechtecks befindet sich ein Histogramm:
Eine horizontale Achse ist mit "k" beschriftet und zeigt die Werte "0", "1", "2", gefolgt von "..." und einem Pfeil nach rechts. Eine vertikale Achse ist mit "P" beschriftet und zeigt einen Pfeil nach oben.
Orangefarbene vertikale Balken sind über den Werten auf der k-Achse zentriert: ein mittelhoher Balken bei 0, der höchste Balken bei 1, ein mittelhoher Balken bei 2, ein etwas kürzerer Balken bei 3, ein kurzer Balken bei 4 und sehr kurze, abnehmende Balken danach.
Innerhalb dieses Histogrammbereichs sind zwei weitere kleine Rechtecke mit hellorangem Hintergrund, abgerundeten Ecken und schwarzem Rand platziert:
1.  Oben rechts: "P(X = k) = (λ^k / k!) * e^(-λ)"
2.  Unten rechts: "Näherung für seltene Ereignisse"

Ganz unten, horizontal zentriert unter den beiden großen Rechtecken, befindet sich ein weiteres hellgraues Rechteck mit abgerundeten Ecken und schwarzem Rand. Es enthält den schwarzen Text: "Für n → ∞ und p_n → 0 bei konstantem λ = n * p_n nähert sich die Binomialverteilung der Poisson-Verteilung an."

Alle Texte sind schwarz. Alle Ränder sind dünne schwarze Linien. Der Gesamtstil ist sauber, präzise und für einen didaktischen Kontext geeignet.
```
