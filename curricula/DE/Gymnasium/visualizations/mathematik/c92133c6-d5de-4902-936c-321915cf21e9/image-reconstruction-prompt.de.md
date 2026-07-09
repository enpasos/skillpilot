# Bildrekonstruktionsprompt: Diskrete und stetige Zufallsgrößen unterscheiden und Verteilungsfunktion als Integralfunktion deuten (LK)

## SkillPilot-Ziel

- SkillPilot-ID: `c92133c6-d5de-4902-936c-321915cf21e9`
- Titel: Diskrete und stetige Zufallsgrößen unterscheiden und Verteilungsfunktion als Integralfunktion deuten (LK)
- Beschreibung: Die lernende Person kann diskrete und stetige Zufallsgrößen unterscheiden und die Verteilungsfunktion der Normalverteilung $\Phi_{\mu,\sigma}(x)=\int_{-\infty}^{x}\varphi_{\mu,\sigma}(t)\,dt$ als Integralfunktion deuten.

## Generator

- Provider: Google Gemini (gemini-2.5-flash)
- Quellbild: `c92133c6-d5de-4902-936c-321915cf21e9.jpg`

## Zweck

Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.

## Prompt

```text
Ein klares, lehrreiches Diagramm im Stil einer Präsentationsfolie mit weißem Hintergrund.

Oben befindet sich ein hellblauer Banner mit abgerundeten Ecken und dem schwarzen Text: "Lernziel: Diskrete und stetige Zufallsgrößen unterscheiden und Verteilungsfunktion als Integralfunktion deuten (LK)".

Darunter, zentriert, steht in großer, fetter schwarzer Schrift der Titel: "Diskrete vs. Stetige Zufallsgrößen & Die Verteilungsfunktion als Integral".

Der Bereich unter dem Titel ist vertikal durch eine gestrichelte schwarze Linie in zwei Hälften geteilt.

**Linke Hälfte (Diskret):**
Oben in dieser Hälfte befindet sich ein hellblauer Banner mit abgerundeten Ecken und dem fetten schwarzen Text: "Diskret: Zählbare Werte (z.B. Würfelwurf)".
Darunter ist ein 2D-Koordinatensystem. Die horizontale X-Achse ist mit "X = k" beschriftet und die vertikale Y-Achse mit "Wahrscheinlichkeit P(X=k)". Beide Achsen haben Pfeile.
Sechs vertikale Balken gleicher Breite und Höhe sind über den X-Achsenwerten 1, 2, 3, 4, 5, 6 zentriert. Die Balken sind von links nach rechts in den Farben Rot, Orange, Grün, Hellblau, Lila und Rot gefärbt. Über jedem Balken steht der Bruch "1/6".
Rechts oberhalb der Y-Achse ist ein weißer, sechsseitiger Würfel mit schwarzen Punkten (Seiten 1, 2, 3 sichtbar) dargestellt, der mit Bewegungslinien das Rollen andeutet.
Rechts neben dem Würfel befindet sich ein hellgraues Textfeld mit abgerundeten Ecken und dem schwarzen Text: "P(X=k) > 0 ist die Höhe des Balkens für einen konkreten Wert k.".
Darunter ist ein weiteres hellgraues Textfeld mit abgerundeten Ecken und dem schwarzen Text: "Einzelwerte haben Wahrscheinlichkeiten.".
Ein hellblauer, geschwungener Pfeil zeigt von diesem unteren Textfeld nach links oben auf die Spitzen der Balken.

**Rechte Hälfte (Stetig):**
Oben in dieser Hälfte befindet sich ein hellblauer Banner mit abgerundeten Ecken und dem fetten schwarzen Text: "Stetig: Messbare Werte (z.B. Körpergröße)".
Darunter ist ein 2D-Koordinatensystem. Die horizontale X-Achse ist mit "X (Messwert, z.B. cm)" beschriftet und die vertikale Y-Achse mit "Dichte f(x)". Beide Achsen haben Pfeile.
Eine schwarze, glockenförmige Kurve (Normalverteilung) ist über der X-Achse gezeichnet.
Eine gestrichelte vertikale Linie führt vom Scheitelpunkt der Kurve zur X-Achse und ist dort mit "μ" beschriftet.
Rechts von "μ" gibt es eine weitere gestrichelte vertikale Linie, beschriftet mit "a", und noch eine rechts davon, beschriftet mit "b".
Ein horizontaler Doppelpfeil auf der X-Achse zwischen "μ" und der gestrichelten Linie rechts davon ist mit "σ" beschriftet.
Der Bereich unter der Kurve zwischen den gestrichelten Linien "a" und "b" ist hellrot schattiert.
Links neben der Kurve steht eine Cartoon-Figur (männlich, braune Haare, grünes Hemd, blaue Hose), die ein gelbes Maßband in Richtung der Kurve hält.
Rechts neben der Figur befindet sich ein hellgraues Textfeld mit abgerundeten Ecken und dem schwarzen Text: "P(X=x) = 0 (Punkt hat keine Fläche).".
Darunter ist ein weiteres hellgraues Textfeld mit abgerundeten Ecken und dem schwarzen Text: "Wahrscheinlichkeit = Fläche unter der Dichtekurve.".
Rechts neben der Kurve steht die mathematische Formel: "P(a ≤ X ≤ b) = ∫_a^b f(x) dx".
Ein hellblauer, geschwungener Pfeil zeigt vom unteren Textfeld nach links unten auf den hellrot schattierten Bereich unter der Kurve.

**Unterer Bereich (Verteilungsfunktion als Integral):**
Dieser Bereich erstreckt sich über die gesamte Breite unter den beiden oberen Hälften.
Oben in diesem Bereich befindet sich ein hellblauer Banner mit abgerundeten Ecken und dem fetten schwarzen Text: "Die Verteilungsfunktion als Integral (bei stetigen Größen)".
Darunter ist ein 2D-Koordinatensystem. Die horizontale X-Achse erstreckt sich von "-∞" nach rechts und ist mit "x" beschriftet, mit einem Pfeil am rechten Ende, der mit "Φ_μ,σ(x)" beschriftet ist. Die vertikale Achse ist unbeschriftet.
Eine schwarze, glockenförmige Kurve (Dichtefunktion) ist über der X-Achse gezeichnet, ähnlich der oberen Kurve.
Eine gestrichelte vertikale Linie führt von einem Punkt auf der Kurve zur X-Achse und ist dort mit "x" beschriftet.
Der Bereich unter der Kurve von "-∞" bis zur gestrichelten Linie bei "x" ist hellrot schattiert.
Rechts neben der Kurve befindet sich ein hellgraues Textfeld mit abgerundeten Ecken und dem schwarzen Text: "Verteilungsfunktion F(x) = Kumulierte Fläche".
Ein hellblauer, geschwungener Pfeil zeigt von diesem Textfeld nach links unten auf den hellrot schattierten Bereich unter der Kurve.
Darunter steht der schwarze Text: "Fläche unter der Dichtekurve bis zum Wert x".
Darunter steht die mathematische Formel: "Φ_μ,σ(x) = F(x) = ∫_-∞^x φ_μ,σ(t) dt".
```
