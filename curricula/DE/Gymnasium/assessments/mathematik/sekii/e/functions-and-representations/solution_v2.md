# E-Phase: Funktionen und Darstellungen – Lösung v2

Die Aufgabenfassung und der begrenzte Reviewumfang sind separat dokumentiert; diese Quelle behauptet keine menschliche Einzelabnahme.

<a id="task"></a>

## Lösung

1. Für die vollständige Parabel ist die Definitionsmenge $\mathbb{R}$ unter $x\mapsto -x$ invariant. Es gilt
$$
f(-x)=-\frac12x^2-4x+2.
$$
Dies ist weder mit $f(x)=-\frac12x^2+4x+2$ noch mit $-f(x)=\frac12x^2-4x-2$ identisch. Daher ist die vollständige Parabel weder achsensymmetrisch zur y-Achse noch punktsymmetrisch zum Ursprung. Beim Modellgraphen scheitern beide Symmetrien bereits an der Definitionsmenge: Zu $x=9$ gehört beispielsweise $-9$ nicht zu $[0,9]$.

Für die quadratische Funktion gilt
$$
x_S = -\frac{b}{2a} = -\frac{4}{2\cdot(-\tfrac12)} = 4.
$$
Dann ist
$$
f(4) = -\frac12\cdot 16 + 16 + 2 = 10.
$$
Die vollständige Parabel hat also die Symmetrieachse $x=4$ und den Scheitelpunkt $S(4\mid 10)$. Dies zeigt auch die Scheitelpunktform $f(x)=-\frac12(x-4)^2+10$.

Die Einschränkung auf $[0,9]$ erhält diese Achsensymmetrie nicht: Die Spiegelung an $x=4$ bildet $x$ auf $8-x$ ab; insbesondere wird $x=9$ auf $-1$ außerhalb der Definitionsmenge abgebildet. Der Modellgraph ist deshalb nicht als Ganzes achsensymmetrisch zu $x=4$. Sein Scheitelpunkt bleibt $S(4\mid 10)$.

2. Nullstellen aus
$$
-\frac12x^2 + 4x + 2 = 0
$$
folgen mit Multiplikation durch $-2$ zu
$$
x^2 - 8x - 4 = 0.
$$
Damit
$$
x_{1,2} = 4 \pm 2\sqrt{5}.
$$
Relevant im Modell ist die positive Nullstelle $x_2 = 4 + 2\sqrt5 \approx 8{,}47$ m; dort trifft der Wasserstrahl im betrachteten Bereich wieder den Boden. Die negative Nullstelle liegt außerhalb des betrachteten Kontextes. Als Flugbahn bis einschließlich zum Bodentreffer ist das Modell daher nur für $0\le x\le 4+2\sqrt5$ sinnvoll. Für größere $x$ bis 9 entstehen negative Höhen, etwa $f(9)=-2{,}5$; dieser Teil des vorläufigen Modellgraphen beschreibt keinen über dem Boden fliegenden Wasserstrahl.

3. Gesucht ist
$$
-\frac12x^2 + 4x + 2 > 8.
$$
Dies ist äquivalent zu
$$
x^2 - 8x + 12 < 0.
$$
Faktorisieren liefert
$$
(x-2)(x-6) < 0.
$$
Also ist die Fontäne für $2 < x < 6$ höher als $8$ m.

4. Aus $g(4)=6$ folgt
$$
4m + 2 = 6 \Rightarrow m=1.
$$
Die lineare Funktion hat konstante Änderungsrate $1$. Am Scheitelpunkt von $f$ ist die momentane Änderungsrate $0$; in Scheitelnähe flacht der parabolische Verlauf also ab, während $g$ überall mit derselben Steigung wächst.

## Bewertung

20 Punkte, Bestehensgrenze 10. Je 5 Punkte für Teile 1–4. Teil 1: y-/Ursprungssymmetrie der vollständigen Parabel 2; Symmetrieachse und Scheitelpunkt 2; Definitionsmengen und Einschränkung 1. Teil 2 verbindet Nullstellen mit der sinnvollen Modellgrenze am Bodentreffer.
