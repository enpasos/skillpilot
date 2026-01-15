# Musterlösung: Landesabitur Mathematik (Hessen) 2026 – SkillPilot Beispielklausur 1

---

## Vorbemerkung für Lehrkräfte

Diese Musterlösung dient als Erwartungshorizont für die Klausur. Die angegebenen Bewertungseinheiten (BE) sind Vorschläge.

---

# A) Grundkurs (GK)

## GK – Prüfungsteil 1 (hilfsmittelfrei)

### A1 (Analysis) – 5 BE

**Gegebene Funktion:**

$$
f(x) = (x^2 - 3) \cdot e^x
$$

**1. Nullstellen (2 BE)**

Ansatz: $f(x) = 0$.
Da die Exponentialfunktion $e^x > 0$ für alle $x \in \mathbb{R}$ gilt, muss gelten:

$$
x^2 - 3 = 0 \Rightarrow x^2 = 3
$$

Daraus folgen die Nullstellen:

$$
x_1 = \sqrt{3}, \quad x_2 = -\sqrt{3}
$$

* **1 BE:** Ansatz (Satz vom Nullprodukt).
* **1 BE:** Beide Werte korrekt angegeben.

**2. Extrema (3 BE)**

Bilden der Ableitung mit der Produktregel ($u = x^2 - 3, \, v = e^x$):

$$
f'(x) = 2x \cdot e^x + (x^2 - 3) \cdot e^x
$$

$$
f'(x) = e^x \cdot (x^2 + 2x - 3)
$$

Notwendige Bedingung $f'(x) = 0$:
Da $e^x \neq 0$, betrachte den quadratischen Term:

$$
x^2 + 2x - 3 = 0
$$

Lösung mittels Vieta (gesucht: $x_a+x_b=-2, x_a \cdot x_b = -3$) oder p-q-Formel:

$$
x_{3} = 1, \quad x_{4} = -3
$$

Art der Extrema untersuchen:
Da $e^x > 0$, wird das Vorzeichen der Steigung nur durch die nach oben geöffnete Parabel $(x^2+2x-3)$ bestimmt.

* Bei $x = -3$: Vorzeichenwechsel von $+$ nach $-$ $\rightarrow$ **Hochpunkt**.

* Bei $x = 1$: Vorzeichenwechsel von $-$ nach $+$ $\rightarrow$ **Tiefpunkt**.

* **1 BE:** Ableitung korrekt.

* **1 BE:** Nullstellen der Ableitung bestimmt.

* **1 BE:** Art der Extrema begründet.

---

### A2 (Analysis - "Der Deich") – 5 BE

**Modell:** $h(x) = 5x - x^2$. Beobachter $P(-1|0)$.
**Frage:** Wird die Sichtlinie zur Spitze unterbrochen?

**1. Koordinate der Spitze (Hochpunkt):**

$$
h'(x) = 5 - 2x = 0 \Rightarrow x = 2,5
$$

$$
h(2,5) = 2,5 \cdot 2,5 = 6,25
$$

$\Rightarrow$ Spitze $S(2,5 \,|\, 6,25)$.

**2. Sichtprüfung (Tangenten-Ansatz):**
Wir legen eine Tangente vom Punkt $P(-1|0)$ an den Graphen. Die Steigung zwischen $P$ und einem Berührpunkt $B(u|h(u))$ muss gleich der Ableitung $h'(u)$ sein:

$$
\frac{h(u) - 0}{u - (-1)} = h'(u)
$$

$$
\frac{5u - u^2}{u+1} = 5 - 2u
$$

$$
5u - u^2 = (5 - 2u)(u + 1)
$$

$$
5u - u^2 = 5u + 5 - 2u^2 - 2u
$$

$$
u^2 + 2u - 5 = 0
$$

Lösung (positive Wurzel für $x>0$):

$$
u = -1 + \sqrt{1 - (-5)} = -1 + \sqrt{6} \approx 1,45
$$

**Schlussfolgerung:**
Der Beobachter schaut geradeaus auf den Deich und seine Blicklinie berührt diesen tangential bei $x \approx 1,45$.
Da die Spitze (der Zielpunkt) erst bei $x = 2,5$ liegt und der Deich zwischen $x=1,45$ und $x=2,5$ weiter ansteigt (sich also über die Tangente hinaus wölbt), liegt die Spitze im "toten Winkel" hinter der Wölbung.

**Ergebnis:** Die Sichtlinie wird unterbrochen. Der Beobachter kann die Spitze nicht sehen.

* **1 BE:** Bestimmung des Hochpunkts.
* **2 BE:** Ansatz für Sichtbarkeit (Tangente oder Sekante).
* **1 BE:** Rechnerische Durchführung.
* **1 BE:** Korrekte Interpretation im Sachkontext.

---

### A3 (Stochastik) – 5 BE

Urne: 2 Rot, 3 Schwarz. $n=3$, mit Zurücklegen.

**1. Genau zwei rote Kugeln (2 BE)**
Binomialverteilung mit $n=3, p=0,4$ (für Rot).

$$
P(X=2) = \binom{3}{2} \cdot \left(\frac{2}{5}\right)^2 \cdot \left(\frac{3}{5}\right)^1 = 3 \cdot \frac{4}{25} \cdot \frac{3}{5} = \frac{36}{125}
$$

* **1 BE:** Faktor 3 (Binomialkoeffizient) erkannt.
* **1 BE:** Wahrscheinlichkeiten korrekt angesetzt.

**2. Erste Rot, danach nie wieder Rot (3 BE)**
Festgelegter Pfad: **Rot – Schwarz – Schwarz**.

$$
P = \frac{2}{5} \cdot \frac{3}{5} \cdot \frac{3}{5} = \frac{18}{125}
$$

* **1 BE:** Einzelwahrscheinlichkeiten korrekt.
* **2 BE:** Produktregel ohne Kombinationsfaktor (da Reihenfolge fest).

---

### A4 (Lineare Algebra) – 5 BE

Ebene $E: 2x_1 + 2x_2 - x_3 = 10$.

**Spurpunkte bestimmen:**

* $S_1$ (setze $x_2=x_3=0$):
    $2x_1 = 10 \Rightarrow x_1 = 5 \rightarrow S_1(5|0|0)$
* $S_2$ (setze $x_1=x_3=0$):
    $2x_2 = 10 \Rightarrow x_2 = 5 \rightarrow S_2(0|5|0)$
* $S_3$ (setze $x_1=x_2=0$):
    $-x_3 = 10 \Rightarrow x_3 = -10 \rightarrow S_3(0|0|-10)$

**Zeichnung:**
Koordinatensystem zeichnen und das Dreieck $S_1 S_2 S_3$ markieren.

* **3 BE:** Berechnung der drei Punkte.
* **2 BE:** Korrekte Skizze.

---

### A5 (Stochastik) – 5 BE

**Gegeben:** Glücksrad mit $P(R)=0,5$, $P(B)=0,3$, $P(G)=0,2$. $n=2$ Drehungen.

**1. Zweimal gleiche Farbe (2 BE)**
Mögliche Pfade: $RR, BB, GG$.
Summenregel:

$$
P(E) = P(R) \cdot P(R) + P(B) \cdot P(B) + P(G) \cdot P(G)
$$

$$
P(E) = 0,5^2 + 0,3^2 + 0,2^2 = 0,25 + 0,09 + 0,04 = 0,38
$$

**Ergebnis:** $38\%$.

* **1 BE:** Ansatz (Summe der Quadrate).
* **1 BE:** Ergebnis.

**2. Mindestens einmal Gelb (3 BE)**
Arbeit mit dem Gegenereignis: "Keinmal Gelb".
Wahrscheinlichkeit für "Nicht Gelb" pro Drehung: $1 - 0,2 = 0,8$.

$$
P(\text{mind. } 1 \times G) = 1 - P(\text{kein } G) = 1 - 0,8^2
$$

$$
= 1 - 0,64 = 0,36
$$

**Ergebnis:** $36\%$.

* **1 BE:** Nutzung des Gegenereignisses (oder vollständige Summation).
* **1 BE:** Rechnung.
* **1 BE:** Ergebnis.

---

## GK – Prüfungsteil 2 (mit Hilfsmitteln)

### B1 (Analysis – "Das Algenwachstum") – 30 BE

Modell:

$$
A(t) = \frac{500}{1 + 49 \cdot e^{-0,2t}}
$$

**1. Anfangszustand (3 BE)**

$$
A(0) = \frac{500}{1 + 49 \cdot 1} = \frac{500}{50} = 10
$$

**Antwort:** Zu Beginn sind $10\,m^2$ bedeckt.

* **2 BE:** Rechnung.
* **1 BE:** Antwortsatz.

**2. Sättigung (4 BE)**
Für $t \to \infty$ geht $e^{-0,2t} \to 0$.

$$
\lim_{t \to \infty} A(t) = \frac{500}{1 + 0} = 500
$$

**Interpretation:** Der Algenteppich kann nicht unbegrenzt wachsen. Die Fläche des Sees oder die Nährstoffe begrenzen das Wachstum auf maximal $500\,m^2$.

* **2 BE:** Grenzwertbestimmung.
* **2 BE:** Fachliche Interpretation.

**3. Wachstumsgeschwindigkeit (8 BE)**
Gesucht ist das Maximum der Ableitung $A'(t)$ (Wendepunkt des Bestandes).

**GTR-Einsatz:**

1. Funktion definieren.
2. Befehl `fMax(d/dx(A(t)), t)` oder graphisch Hochpunkt der Ableitung suchen.
3. Ergebnis: $t \approx 19,46$.
4. Wert der Ableitung: $A'(19,46) \approx 25$.

**Antwort:** Am ca. 20. Tag (genauer: nach 19,5 Tagen) wächst der Teppich am schnellsten mit einer Rate von $25\,m^2$ pro Tag.

* **2 BE:** Ansatz (Maximales Wachstum = Wendepunkt).
* **3 BE:** Zeitwert ermittelt.
* **3 BE:** Zunahmerate ermittelt.

**4. Rückschritt (8 BE)**
Startwert für Phase 2 bei $t=30$:

$$
A(30) = \frac{500}{1 + 49e^{-6}} \approx 446,05\,m^2
$$

Neues Modell (exponentieller Zerfall, 5% Abnahme):

$$
A_{neu}(t) = 446,05 \cdot 0,95^{(t-30)} \quad \text{für } t \ge 30
$$

Gleichsetzen mit Anfangswert ($10\,m^2$):

$$
10 = 446,05 \cdot 0,95^k \quad (k = \text{Dauer ab Tag 30})
$$

Lösung mit Solver/Logarithmus:

$$
k = \frac{\ln(10/446,05)}{\ln(0,95)} \approx 74,05
$$

Gesamtzeit: $30 + 74 = 104$ Tage.

* **2 BE:** $A(30)$ berechnet.
* **2 BE:** Modell aufgestellt.
* **3 BE:** Gleichung gelöst.
* **1 BE:** Ergebnis als Gesamtzeit interpretiert.

**5. Bewertung (7 BE)**
Vergleich für kleine $t$ (Startphase):

* **Logistisch:** Startet bei 10, Steigung nimmt zu (Linkskrümmung).
* **Exponentiell:** Startet bei 10, Steigung nimmt zu ($f(t) = 10 \cdot e^{kt}$).

Mathematisch verhält sich das logistische Wachstum für Werte weit unter der Sättigungsgrenze ($A(t) \ll 500$) fast identisch zu exponentiellem Wachstum ($1+Ce^{-kt} \approx Ce^{-kt}$ im Nenner führt zu reinem e-Wachstum).

**Urteil:** Der Experte hat recht, dass biologisches Wachstum oft exponentiell ist. Die Kritik am logistischen Modell ist jedoch für die Startphase kaum relevant, da das logistische Modell hier das exponentielle Verhalten fast perfekt imitiert. Erst später ("Bremsung") unterscheiden sie sich wesentlich.

* **3 BE:** Analyse des Verhaltens bei kleinen $t$.
* **4 BE:** Differenzierte Stellungnahme.

---

### C1 (Lineare Algebra - "Das Solardach") – 25 BE

Eckpunkte: $A(10|0|3), B(10|10|3), C(0|10|6), D(0|0|6)$.
**Anpassung:** Mastposition $M(13|5|0)$.

**1. Rechteck und Ebene (6 BE)**
Vektoren: $\vec{AB} = \begin{pmatrix} 0\\10\\0 \end{pmatrix}$, $\vec{AD} = \begin{pmatrix} -10\\0\\3 \end{pmatrix}$.

Skalarprodukt: $\vec{AB} \cdot \vec{AD} = 0 \Rightarrow 90^\circ$. Da zudem $|\vec{AB}| = |\vec{DC}|$, liegt ein Rechteck vor.

Normalenvektor:

$$
\vec{n} = \vec{AB} \times \vec{AD} = \begin{pmatrix} 0\\10\\0 \end{pmatrix} \times \begin{pmatrix} -10\\0\\3 \end{pmatrix} = \begin{pmatrix} 30\\0\\10 \end{pmatrix} \hat{=} \begin{pmatrix} 3\\0\\1 \end{pmatrix}
$$

Ebenengleichung: $3x_1 + x_3 = d$. Punkt A einsetzen: $30 + 3 = 33$.

$$
E: 3x_1 + x_3 = 33
$$

* **3 BE:** Nachweis Geometrie.
* **3 BE:** Ebenengleichung.

**2. Schattenwurf (7 BE)**
Mast $M(13|5|0)$, Spitze $S_M(13|5|10)$. Licht $\vec{v} = \begin{pmatrix} -1\\0\\-2 \end{pmatrix}$.
Schatten-Gerade:

$$
g: \vec{x} = \begin{pmatrix} 13\\5\\10 \end{pmatrix} + r \cdot \begin{pmatrix} -1\\0\\-2 \end{pmatrix}
$$

Schnitt mit $E$:

$$
3(13-r) + (10-2r) = 33
$$

$$
39 - 3r + 10 - 2r = 33 \Rightarrow 49 - 5r = 33 \Rightarrow 5r = 16 \Rightarrow r = 3,2
$$

Schnittpunkt berechnen:

$$
S(13-3,2 \,|\, 5 \,|\, 10-6,4) = S(9,8 \,|\, 5 \,|\, 3,6)
$$

**Prüfung:** Liegt $S$ auf dem Dach?
$x_1$-Grenzen des Daches: $0 \le x_1 \le 10$.
$x_2$-Grenzen des Daches: $0 \le x_2 \le 10$.
Da $x_1=9,8$ im Intervall liegt, fällt der Schatten **auf** das Dach (kurz vor der Dachkante $x=10$).

* **2 BE:** Geradengleichung.
* **3 BE:** Schnittpunkt.
* **2 BE:** Punktprobe/Entscheidung.

**3. Effizienz (7 BE)**
Optimaler Sonnenstand: Vektor parallel zum Normalenvektor $\vec{n} = \begin{pmatrix} 3\\0\\1 \end{pmatrix}$.

Winkelberechnung zwischen Licht $\vec{v}$ und $\vec{n}$:

$$
\cos(\alpha) = \frac{|\vec{v} \cdot \vec{n}|}{|\vec{v}| \cdot |\vec{n}|} = \frac{|-3 + 0 - 2|}{\sqrt{5} \cdot \sqrt{10}} = \frac{5}{\sqrt{50}} = \frac{5}{5\sqrt{2}} = \frac{1}{\sqrt{2}}
$$

$\alpha = 45^\circ$.
Der Einfallswinkel beträgt $45^\circ$ zur Normalen (und damit auch $45^\circ$ zur Dachfläche).

* **2 BE:** Optimalvektor genannt.
* **5 BE:** Winkelberechnung.

**4. Montage (5 BE)**
Standort $D(0|0|6)$, Länge 2, Richtung $\vec{n}$.
Normierter Normalenvektor $\vec{n_0} = \frac{1}{\sqrt{10}}\begin{pmatrix} 3\\0\\1 \end{pmatrix}$.
Spitze:

$$
P = \vec{OD} + 2 \cdot \vec{n_0} \approx \begin{pmatrix} 0\\0\\6 \end{pmatrix} + \begin{pmatrix} 1,90\\0\\0,63 \end{pmatrix} = \begin{pmatrix} 1,90\\0\\6,63 \end{pmatrix}
$$

* **2 BE:** Normierung.
* **3 BE:** Vektoraddition.

---

# B) Leistungskurs (LK)

## LK – Prüfungsteil 1 (hilfsmittelfrei)

### A1 (Analysis) – 5 BE

Funktion $f(x) = \frac{e^x}{x}$.

* **Grenzwerte:**
    $\lim_{x \to 0} f(x) = \infty$ (Polstelle bei $x=0$, Nenner geht gegen 0, Zähler gegen 1).
    $\lim_{x \to \infty} f(x) = \infty$ (da $e^x$ stärker wächst als $x$).

* **Extrempunkt:**
    $f'(x) = \frac{e^x \cdot x - e^x \cdot 1}{x^2} = \frac{e^x(x-1)}{x^2}$.
    Nullstelle bei $x=1$. $f(1) = e$.
    Vorzeichenwechsel von $-$ nach $+$. $\Rightarrow$ **Tiefpunkt** $(1|e)$.

* **2 BE:** Grenzwerte.

* **2 BE:** Rechnung.

* **1 BE:** Skizze.

### A2 (Analysis) – 5 BE

Integral $\int_0^{\sqrt{\pi}} x \cdot \sin(x^2) \, dx$.

Substitution:
$z = x^2 \Rightarrow dz = 2x \, dx \Rightarrow \frac{1}{2}dz = x \, dx$.
Grenzen: $0 \to 0, \quad \sqrt{\pi} \to \pi$.

$$
\int_0^{\pi} \frac{1}{2} \sin(z) \, dz = \frac{1}{2} \left[-\cos(z)\right]_0^{\pi} = \frac{1}{2} (-\cos(\pi) - (-\cos(0)))
$$

$$
= \frac{1}{2} (-(-1) - (-1)) = \frac{1}{2} (1 + 1) = 1
$$

* **2 BE:** Substitution.
* **1 BE:** Grenzen.
* **2 BE:** Stammfunktion und Wert.

### A3 (Stochastik) – 5 BE

**Hypothese:** $H_0: p \le 0,1$.
Wenn der kritische Wert $k$ vergrößert wird, wächst der Annahmebereich $A = \{0, \dots, k\}$.

Der **Fehler 1. Art** ist die Wahrscheinlichkeit, dass $X$ in den *Ablehnungsbereich* fällt, obwohl $H_0$ stimmt.
Da der Ablehnungsbereich $\bar{A}$ kleiner wird (die Grenze verschiebt sich nach rechts), wird die Wahrscheinlichkeit, dort "hineinzufallen", geringer.

**Antwort:** Die Wahrscheinlichkeit für den Fehler 1. Art wird **kleiner**.

* **5 BE:** Korrekte logische Herleitung.

### A4 (Lineare Algebra) – 5 BE

Gerade $g: \vec{x} = \begin{pmatrix} 1 \\ 2 \\ 3 \end{pmatrix} + r \cdot \begin{pmatrix} 2 \\ 0 \\ -1 \end{pmatrix}$, Ebene $E: x_1 + 2x_2 + 2x_3 = 10$.

**Untersuchung auf Schnittpunkt (Einsetzverfahren):**
Die Koordinaten der Geraden lauten:
$x_1 = 1 + 2r$
$x_2 = 2$
$x_3 = 3 - r$

Einsetzen in die Ebenengleichung:

$$
1 \cdot (1 + 2r) + 2 \cdot (2) + 2 \cdot (3 - r) = 10
$$

$$
1 + 2r + 4 + 6 - 2r = 10
$$

Zusammenfassen:

$$
11 = 10 \quad (\text{Widerspruch})
$$

**Schlussfolgerung:**
Das Gleichungssystem hat keine Lösung. Die Gerade verläuft **echt parallel** zur Ebene.

* **2 BE:** Einsetzen der Geradenkoordinaten in $E$.
* **2 BE:** Korrekte Auflösung und Feststellung des Widerspruchs.
* **1 BE:** Schlussfolgerung "echt parallel".

### A5 (Analysis) – 5 BE

Funktion: $f(x) = e^{2x - 1}$.

**1. Ableitung und Stammfunktion (3 BE)**
Ableitung mittels Kettenregel (innere Ableitung von $2x-1$ ist $2$):

$$
f'(x) = 2 \cdot e^{2x - 1}
$$

Stammfunktion mittels linearer Substitution (Umkehrung der Kettenregel, Faktor $1/2$):

$$
F(x) = \frac{1}{2} e^{2x - 1} + C
$$

**2. Wert berechnen (2 BE)**

$$
f'(0,5) = 2 \cdot e^{2 \cdot 0,5 - 1} = 2 \cdot e^{1 - 1} = 2 \cdot e^0
$$

Da $e^0 = 1$:

$$
f'(0,5) = 2
$$

* **1 BE:** Ableitung.
* **1 BE:** Stammfunktion.
* **1 BE:** Einsetzen.
* **1 BE:** Ergebnis $2$ (ohne Taschenrechner gelöst).

### A6 (Stochastik) – 5 BE

Gegeben:
$W$: Person ist weiblich. $P(W) = 0,6$.
$R$: Person raucht.
$W \cap R$: Person ist weiblich UND raucht. $P(W \cap R) = 0,2$ (20% der Gesamtgruppe).

**Gesucht:** Bedingte Wahrscheinlichkeit $P_W(R)$ (Raucher unter der Bedingung Weiblich).

**Rechnung:**

$$
P_W(R) = P(R | W) = \frac{P(W \cap R)}{P(W)}
$$

$$
P_W(R) = \frac{0,2}{0,6} = \frac{2}{6} = \frac{1}{3}
$$

**Interpretation:**
Die Wahrscheinlichkeit beträgt ca. $33,3\%$. Das bedeutet, dass innerhalb der Gruppe der Frauen jede dritte Person raucht.

* **2 BE:** Formel für bedingte Wahrscheinlichkeit / Satz von Bayes.
* **2 BE:** Rechnung und Ergebnis ($1/3$ oder $33,\bar{3}\%$).
* **1 BE:** Sachbezogene Interpretation.

---

## LK – Prüfungsteil 2 (mit Hilfsmitteln)

### B1 (Analysis – "Die Hängebrücke") – 35 BE

**Funktionen (angepasst):**
Seil: $k(x) = 20 \cdot (e^{0,02x} + e^{-0,02x})$.
Fahrbahn: $f(x) = -0,005x^2 + 5$.
Bereich: $-100 \le x \le 100$.

**1. Geometrie (5 BE)**

* **Pylone ($x=\pm 100$):**
    $k(100) = 20(e^2 + e^{-2}) \approx 20(7,389 + 0,135) \approx 150,5\,m$.

* **Tiefster Punkt ($x=0$):**
    $k(0) = 20(1+1) = 40\,m$.

* **3 BE:** Höhe berechnet.

* **2 BE:** Minimum berechnet.

**2. Vertikal-Seile (8 BE)**
Länge $L(x) = k(x) - f(x)$.

* **Minimum (in der Mitte bei $x=0$):**
    $L(0) = 40 - 5 = 35\,m$.

* **Maximum (am Rand bei $x=100$):**
    Fahrbahnhöhe: $f(100) = -0,005(10000) + 5 = -45\,m$.
    $L(100) = 150,5 - (-45) = 195,5\,m$.

* **3 BE:** Differenzfunktion.

* **5 BE:** Min/Max berechnet.

**3. Winkel (4 BE)**
Ableitung: $k'(x) = 20 \cdot 0,02 \cdot (e^{0,02x} - e^{-0,02x})$.
Anstieg am Pylon:

$$
k'(100) = 0,4(e^2 - e^{-2}) \approx 2,90
$$

Winkel:

$$
\tan \alpha = 2,90 \Rightarrow \alpha \approx 71,0^\circ
$$

* **2 BE:** Ableitung.
* **2 BE:** Winkel.

**4. Material / Bogenlänge (6 BE)**
Formel für Bogenlänge:

$$
S = \int_{-100}^{100} \sqrt{1+(k'(x))^2} \, dx
$$

Berechnung via GTR:

$$
S \approx 225,5\,m
$$

* **3 BE:** Korrekter Integralansatz.
* **3 BE:** Berechnung mit Werkzeug.

**5. Fläche (6 BE)**

$$
A = \int_{-100}^{100} (k(x) - f(x)) \, dx
$$

GTR-Ergebnis:

$$
A \approx 19.550\,m^2
$$

* **3 BE:** Ansatz.
* **3 BE:** Ergebnis.

**6. Variation (6 BE)**
Funktionenschar $k_a(x) = \frac{1}{a}(e^{ax} + e^{-ax})$.
Zu zeigen: Die Steigung am Rand wächst mit $a$.

Randsteigung $m(a) = k_a'(100) = e^{100a} - e^{-100a}$.
Betrachte das Verhalten für wachsendes $a$:

* Der Term $e^{100a}$ wächst streng monoton.

* Der Term $e^{-100a}$ fällt streng monoton gegen 0 (wird also weniger abgezogen).

* Somit wächst die Differenz streng monoton. Je größer $a$, desto steiler das Seil am Pylon.

* **3 BE:** Allgemeine Ableitung.

* **3 BE:** Monotonie-Argumentation.

---

### C1 (Matrizen – "Populationsdynamik") – 20 BE

Matrix $M$ (Übergang A, B, C):

$$
M = \begin{pmatrix} 0,6 & 0,1 & 0 \\ 0,3 & 0,7 & 0,2 \\ 0,1 & 0,2 & 0,8 \end{pmatrix}
$$

**Teil A: Prozess (Lineare Algebra)**

**1. Population (3 BE)**
Spaltensummen prüfen: $0,6+0,3+0,1=1$, usw. Alle ergeben $1$.
**Interpretation:** Es ist eine geschlossene Population. Keine Individuen/Viren verschwinden aus dem System oder kommen von außen hinzu.

* **3 BE:** Rechnung und Begründung.

**2. Gleichgewicht (8 BE)**
Entwicklung nach 10 Wochen (Start 10.000 bei A):

$$
\vec{v}_{10} = M^{10} \cdot \begin{pmatrix} 10000 \\ 0 \\ 0 \end{pmatrix} \approx \begin{pmatrix} 1440 \\ 3940 \\ 4620 \end{pmatrix}
$$

Stabiles Gleichgewicht (Fixvektor):
LGS $(M-E)\vec{x} = \vec{0}$ mit Nebenbedingung $x+y+z=10000$.
Lösung via GTR/LGS:

$$
x \approx 1053, \quad y \approx 4210, \quad z \approx 4737
$$

* **3 BE:** Prognose berechnet.
* **5 BE:** Fixvektor bestimmt.

**3. Inverses Problem (5 BE)**

$$
\vec{x}_{t} = M^{-1} \cdot \vec{x}_{t+1}
$$

$$
\vec{x}_t = M^{-1} \cdot \begin{pmatrix} 500 \\ 800 \\ 1000 \end{pmatrix} \approx \begin{pmatrix} 1389 \\ -444 \\ 1355 \end{pmatrix}
$$

**Interpretation:** Das Ergebnis enthält negative Werte. Die gemessene Verteilung kann nicht aus einem regulären Prozessschritt entstanden sein (Messfehler oder Systemstörung).

* **2 BE:** Ansatz mit Inverser.
* **3 BE:** Rechnung und Erkennen des Widerspruchs (negative Viren).

---

### D1 (Stochastik – "Viren-Screening") – 20 BE

Gegeben: $P(C) = 0,5\%$. Sensitivität 99%. Falsch-Positiv 2%.

**1. Wahrscheinlichkeit positives Testergebnis (5 BE)**
Satz der totalen Wahrscheinlichkeit:

$$
P(T+) = P(C) \cdot P(T+|C) + P(\bar{C}) \cdot P(T+|\bar{C})
$$

$$
P(T+) = 0,005 \cdot 0,99 + 0,995 \cdot 0,02 = 0,00495 + 0,0199 \approx 0,02485
$$

Ergebnis: ca. $2,5\%$.

* **5 BE:** Satz der totalen Wahrscheinlichkeit korrekt angewandt.

**2. Bedingte Wahrscheinlichkeit (6 BE)**

$$
P(C | T+) = \frac{P(C \cap T+)}{P(T+)} = \frac{0,00495}{0,02485} \approx 0,199
$$

**Interpretation:** Trotz positivem Test ist die Person nur zu ca. 20% tatsächlich infiziert. Grund ist die sehr geringe Basiswahrscheinlichkeit (Prävalenz) der Krankheit im Vergleich zur Falsch-Positiv-Rate.

* **3 BE:** Bayes Formel.
* **3 BE:** Interpretation (Prävalenzfehler).

**3. Testoptimierung (8 BE)**
Gesucht Anzahl $n$ der Tests, damit $P > 90\%$.
Ansatz für Bayes mit $n$ unabhängigen Tests:

$$
P(C | n \times T+) = \frac{0,005 \cdot 0,99^n}{0,005 \cdot 0,99^n + 0,995 \cdot 0,02^n}
$$

Durch Probieren oder GTR-Tabelle:

* $n=1: \approx 0,199$

* $n=2:$

$$
\frac{0,005 \cdot 0,99^2}{0,005 \cdot 0,99^2 + 0,995 \cdot 0,02^2} \approx \frac{0,0049}{0,0049+0,0004} \approx 0,92
$$

**Antwort:** Bei **zwei** positiven Testergebnissen in Folge steigt die Wahrscheinlichkeit auf über 92%.

* **4 BE:** Ansatz für wiederholten Test.
* **4 BE:** Berechnung und Antwort.