# Musterlösung: Landesabitur Mathematik (Hessen) 2026 – SkillPilot Beispielklausur 1 (v2.3)

---

## Vorbemerkung für Lehrkräfte

Diese Musterlösung dient als Erwartungshorizont für die Klausur. Die angegebenen Bewertungseinheiten (BE) sind auf die Vorgaben (GK 80 BE, LK 100 BE) abgestimmt.

> **Hinweis zur Auswahl:** Diese Lösung deckt den **gesamten** Aufgabenpool ab. Bitte nur die Lösungen für die Aufgaben werten, die vom Prüfling zur Bearbeitung ausgewählt wurden.

---

# A) Grundkurs (GK)

## GK – Prüfungsteil 1 (hilfsmittelfrei)

### A1 (Analysis) – 5 BE

**Gegebene Funktion:** $f(x) = (x^2 - 3) \cdot e^x$

**1. Nullstellen (2 BE)**
$x^2 - 3 = 0 \Rightarrow x_{1,2} = \pm\sqrt{3}$. ($e^x$ wird nie 0).

**2. Extrema (3 BE)**
$f'(x) = 2x e^x + (x^2 - 3) e^x = e^x(x^2 + 2x - 3)$.
$x^2 + 2x - 3 = 0 \Rightarrow x_3 = 1, x_4 = -3$.
Art der Extrema (Vorzeichenwechsel von $x^2+2x-3$):
$x=-3$: VZW $+ \to -$ (Hochpunkt).
$x=1$: VZW $- \to +$ (Tiefpunkt).

### A2 (Analysis - "Der Deich") – 5 BE

**Modell:** $h(x) = 5x - x^2$. Beobachter $P(-1|0)$.

**1. Spitze:** $h'(x)=5-2x=0 \Rightarrow x=2,5$. $S(2,5|6,25)$.
**2. Sichtlinie:** Tangente von $P$ an den Graphen legen.
Steigung zwischen $P$ und $B(u|h(u))$ gleich Ableitung $h'(u)$.
$\frac{5u-u^2 - 0}{u - (-1)} = 5-2u \Rightarrow 5u-u^2 = (5-2u)(u+1) \Rightarrow u^2+2u-5=0$.
$u \approx 1,45$ (Berührpunkt).
Da der Berührpunkt $u \approx 1,45$ vor der Spitze $x=2,5$ liegt und der Deich konkav ist, liegt die Spitze im "Schatten" des Vordeiches.
**Ergebnis:** Sichtlinie unterbrochen.

### A3 (Stochastik) – 5 BE

Urne: 2 Rot, 3 Schwarz ($n=3$, m.Z.).

1. **Genau 2 Rot:** $P(X=2) = \binom{3}{2} \cdot (\frac{2}{5})^2 \cdot \frac{3}{5} = 3 \cdot \frac{12}{125} = \frac{36}{125}$. (2 BE)
2. **Erst Rot, dann nie wieder:** $P = \frac{2}{5} \cdot \frac{3}{5} \cdot \frac{3}{5} = \frac{18}{125}$. (3 BE)

### A4 (Lineare Algebra) – 5 BE

$E: 2x_1 + 2x_2 - x_3 = 10$.
Spurpunkte: $S_1(5|0|0)$, $S_2(0|5|0)$, $S_3(0|0|-10)$.
(3 BE Punkte + 2 BE Skizze).

### A5 (Stochastik) – 5 BE

$P(R)=0,5; P(B)=0,3; P(G)=0,2$.

1. **Zweimal gleiche Farbe:** $0,5^2 + 0,3^2 + 0,2^2 = 0,25+0,09+0,04 = 0,38$. (2 BE)
2. **Mind. 1x Gelb:** $1 - P(\text{kein Gelb}) = 1 - 0,8^2 = 1 - 0,64 = 0,36$. (3 BE)

### A6 (Analysis) – 5 BE

**1. Steigung bei $x=0$ (2 BE)**
Der Graph von $f'$ ist eine nach oben geöffnete Parabel mit Nullstellen bei $x=\pm 2$. Aus Symmetriegründen liegt der Scheitelpunkt bei $x=0$. Da die Parabel nach oben geöffnet ist und Nullstellen besitzt, muss der Scheitel unterhalb der x-Achse liegen.
Daraus folgt: $f'(0) < 0$. Der Graph von $f$ fällt an dieser Stelle.

**2. Extrema (3 BE)**
Nullstellen von $f'$ sind $x_1 = -2$ und $x_2 = 2$.
Untersuchung Vorzeichenwechsel (da Parabel nach oben offen):

* $x=-2$: $f'$ wechselt von positiv nach negativ ($\cap$) $\Rightarrow$ **Hochpunkt**.
* $x=2$: $f'$ wechselt von negativ nach positiv ($\cup$) $\Rightarrow$ **Tiefpunkt**.

### A7 (Lineare Algebra) – 5 BE

Punkte: $A(2|0|0)$, $B(0|2|0)$, $C_k(0|0|k)$.
Vektoren: $\vec{C_kA} = \begin{pmatrix} 2 \\ 0 \\ -k \end{pmatrix}$, $\vec{C_kB} = \begin{pmatrix} 0 \\ 2 \\ -k \end{pmatrix}$.
Rechter Winkel bei $C_k \Leftrightarrow \vec{C_kA} \cdot \vec{C_kB} = 0$.
$2\cdot 0 + 0\cdot 2 + (-k)\cdot (-k) = 0 \Rightarrow k^2 = 0 \Rightarrow k=0$.
**Ergebnis:** Nur für $k=0$ ist das Dreieck bei $C_k$ rechtwinklig (liegt in der xy-Ebene).

### A8 (Lineare Algebra) – 5 BE

**1. Geradengleichung (3 BE)**
Stützvektor $\vec{p} = \begin{pmatrix} 1\\2\\3 \end{pmatrix}$, Richtungsvektor $\vec{PQ} = \begin{pmatrix} 3-1 \\ 2-2 \\ 1-3 \end{pmatrix} = \begin{pmatrix} 2 \\ 0 \\ -2 \end{pmatrix}$.
$g: \vec{x} = \begin{pmatrix} 1 \\ 2 \\ 3 \end{pmatrix} + r \cdot \begin{pmatrix} 2 \\ 0 \\ -2 \end{pmatrix}$.

**2. Punktprobe (2 BE)**
$R(5|2|-1)$ einsetzen:
I. $1 + 2r = 5 \Rightarrow 2r = 4 \Rightarrow r=2$.
II. $2 + 0r = 2$ (wahr).
III. $3 - 2r = -1 \Rightarrow 3 - 4 = -1$ (wahr).
**Ergebnis:** Der Punkt $R$ liegt auf der Geraden $g$.

### A9 (Stochastik) – 5 BE

**Fairness:** Erwartungswert des Gewinns (aus Sicht des Spielers) muss 0 sein.
Wahrscheinlichkeiten: $P(\text{Gewinn}) = \frac{4}{10} = 0,4$; $P(\text{Niete}) = 0,6$.
Gewinn netto: Bei Gewinn: $(10 - e)$, bei Niete: $(-e)$.
$E(G) = 0,4 \cdot (10 - e) + 0,6 \cdot (-e) = 0$.
$4 - 0,4e - 0,6e = 0 \Rightarrow 4 - e = 0 \Rightarrow e = 4$.
**Ergebnis:** Der Einsatz muss 4 Euro betragen.

---

## GK – Prüfungsteil 2 (mit Hilfsmitteln)

### B1 (Analysis – "Das Algenwachstum") – 25 BE

**1. Anfangszustand (3 BE)**
$A(0) = \frac{500}{1+49} = 10\,m^2$.

**2. Sättigung (4 BE)**
$\lim_{t \to \infty} A(t) = 500\,m^2$. Interpretation: Maximale Kapazität des Sees.

**3. Wachstumsgeschwindigkeit (8 BE)**
Maximum von $A'(t)$ (GTR).
$t \approx 19,46$ Tage.
Rate $A'(19,46) \approx 25\,m^2/\text{Tag}$.

**4. Rückschritt (6 BE)**
$A(30) \approx 446,05$.
$A_{neu}(t) = 446,05 \cdot 0,95^{(t-30)}$.
$446,05 \cdot 0,95^k = 10 \Rightarrow k \approx 74$.
Gesamtzeit: $30 + 74 = 104$ Tage.

**5. Bewertung (4 BE)**
Für kleine $t$ ist $A(t)$ fast identisch mit exponentiellem Wachstum, da der Nennerterm $1$ gegenüber $49e^{-kt}$ vernachlässigbar ist bzw. die Bremse $S-A$ noch kaum wirkt. Kritik unberechtigt.

### B2 (Analysis – "Der Bremstest") – 25 BE

**1. Anfangsphase (4 BE)**
$v(0) = 20\,m/s$. $v(10) = -25 + 30 - 22,5 + 20 = 2,5\,m/s$.
$a(t) = v'(t) = -\frac{3}{40}t^2 + \frac{3}{5}t - \frac{9}{4}$.
$a(0) = -2,25\,m/s^2$ (Fahrzeug bremst).

**2. Extremwerte (6 BE)**
$v'(t) = 0 \Rightarrow -\frac{3}{40}t^2 + \frac{6}{10}t - \frac{9}{4} = 0$.
Lösungen (GTR/p-q): Diskriminante prüfen.
Rechnerische Prüfung $v'(t)=0$: $-0,075t^2 + 0,6t - 2,25 = 0 \Rightarrow t^2 - 8t + 30 = 0$.
Diskriminante $64 - 120 < 0$. Keine Nullstelle. $v(t)$ ist streng monoton fallend.
Kleinster Wert am Rand $t=10$ mit $v(10) = 2,5\,m/s$.

**3. Bremsweg (8 BE)**
Strecke $s = \int_0^{10} v(t) \, dt$.
Stammfunktion $V(t) = -\frac{1}{160}t^4 + \frac{1}{10}t^3 - \frac{9}{8}t^2 + 20t$.
$s = V(10) - V(0) = -62,5 + 100 - 112,5 + 200 = 125\,m$.
Durchschnitt: $\bar{v} = \frac{125}{10} = 12,5\,m/s$.

**4. Reaktion (7 BE)**
Gesucht ist das **lokale Maximum der Beschleunigung** $a(t)$ (da $a(t)$ negativ ist, entspricht das Maximum dem Wert, der am nächsten bei 0 liegt $\to$ geringste Verzögerung). Dies entspricht der Wendestelle von $v(t)$.

* $a(t) = -\frac{3}{40}t^2 + \frac{3}{5}t - \frac{9}{4}$.
* Notwendige Bedingung $a'(t) = 0$:
    $-\frac{3}{20}t + \frac{3}{5} = 0 \Rightarrow 0,15t = 0,6 \Rightarrow t = 4$.
* Hinreichende Bedingung: $a''(t) = -\frac{3}{20} < 0 \Rightarrow$ Maximum bei $t=4$.
* Funktionswert: $a(4) = -\frac{3}{40}\cdot 16 + \frac{3}{5}\cdot 4 - 2,25 = -1,2 + 2,4 - 2,25 = -1,05 \, m/s^2$.
  **Ergebnis:** Nach 4 Sekunden ist die Bremswirkung am schwächsten ("Fading"). Der Sensor schlägt an.

### C1 (Lineare Algebra - "Das Solardach") – 15 BE

Eckpunkte: $A(10|0|3), B(10|10|3), C(0|10|6), D(0|0|6)$.

**1. Rechteck und Ebene (5 BE)**
$\vec{AB} = \begin{pmatrix} 0 \\ 10 \\ 0 \end{pmatrix}$, $\vec{AD} = \begin{pmatrix} -10 \\ 0 \\ 3 \end{pmatrix}$.
$\vec{AB} \cdot \vec{AD} = 0$ (rechter Winkel bei A).
Zusätzlich prüfen: $\vec{DC} = \begin{pmatrix} 0-0 \\ 10-0 \\ 6-6 \end{pmatrix} = \begin{pmatrix} 0 \\ 10 \\ 0 \end{pmatrix} = \vec{AB}$.
Da $\vec{AB} = \vec{DC}$ und ein rechter Winkel vorliegt $\Rightarrow$ Rechteck.
Normalenvektor $\vec{n} = \overrightarrow{AB} \times \overrightarrow{AD} = (30, 0, 100)^T \sim (3, 0, 10)^T$.
Ebene $E: 3x_1 + 10x_3 = 60$ (Punkt A eingesetzt: $3(10)+10(3)=60$).

**2. Schattenwurf (5 BE)**
Gerade $g: \vec{x} = \begin{pmatrix} 13 \\ 5 \\ 0 \end{pmatrix} + r \cdot \begin{pmatrix} -1 \\ 0 \\ -2 \end{pmatrix}$. (Fußpunkt $M(13|5|0)$, Spitze $S(13|5|10)$. Lichtstrahl beginnt bei S).
$g_{Licht}: \vec{x} = \begin{pmatrix} 13 \\ 5 \\ 10 \end{pmatrix} + r \cdot \begin{pmatrix} -1 \\ 0 \\ -2 \end{pmatrix}$.
Schnitt mit E: $3(13-r) + 10(10-2r) = 60 \Rightarrow 139 - 23r = 60 \Rightarrow r \approx 3,435$.
Schattenpunkt $S_D \approx (9,565; 5; 3,130)$.
Punkt liegt innerhalb der Rechtecksgrenzen von $x_1$ und $x_2$.
**Ergebnis:** Der Schatten fällt auf die Dachfläche.

**3. Effizienz (5 BE)**
Winkel $\gamma$ zwischen $\vec{v}=\begin{pmatrix}-1\\0\\-2\end{pmatrix}$ und $\vec{n}=\begin{pmatrix}3\\0\\10\end{pmatrix}$.
$\cos \gamma = \frac{|\vec{v} \cdot \vec{n}|}{|\vec{v}| \cdot |\vec{n}|} = \frac{23}{\sqrt{5} \cdot \sqrt{109}} \approx 0,9852 \Rightarrow \gamma \approx 9,9^\circ$.
Einfallswinkel zur Dachfläche: $90^\circ - 9,9^\circ = 80,1^\circ$.

### D1 (Stochastik – "Viren-Screening") – 15 BE

**1. Wahrscheinlichkeit Positiv (4 BE)**
$P(T+) = 0,005 \cdot 0,99 + 0,995 \cdot 0,02 \approx 2,49\%$.

**2. Bedingte Wahrscheinlichkeit (6 BE)**
$P(C|T+) = \frac{0,00495}{0,02485} \approx 19,9\%$.
Interpretation: Wegen der geringen Prävalenz sind die meisten positiven Ergebnisse falsch-positiv. Ein einzelner Test ist kaum aussagekräftig.

**3. Massen-Screening (5 BE)**
Gesucht ist $n$ für $P(X \ge 1) > 0,99$ mit $p \approx 0,02485$.
Ansatz: $1 - P(X=0) > 0,99 \Leftrightarrow 1 - (1-p)^n > 0,99 \Leftrightarrow (0,97515)^n < 0,01$.
Logarithmieren: $n \cdot \ln(0,97515) < \ln(0,01)$.
$n > \frac{\ln(0,01)}{\ln(0,97515)} \approx 182,8$.
Es müssen mindestens 183 Personen getestet werden.

---

# B) Leistungskurs (LK)

## LK – Prüfungsteil 1 (hilfsmittelfrei)

### A1 (Analysis) – 5 BE

$x\to 0$: $\infty$, $x\to \infty$: $\infty$.
$f'(x)=\\frac{e^x(x-1)}{x^2}$, Tiefpunkt bei $(1|e)$.

### A2 (Analysis) – 5 BE

Subst. $z=x^2$, $dz=2x dx$.
$\int_0^\pi \frac{1}{2} \sin z \, dz = \frac{1}{2} [-\cos z]_0^\pi = 1$.

### A3 (Stochastik) – 5 BE

Fehler 1. Art = $P(X \in \text{Ablehnungsbereich} | H_0)$.
Größeres $k$ $\Rightarrow$ Annahmebereich größer $\Rightarrow$ Ablehnungsbereich kleiner.
Wahrscheinlichkeit Fehler 1. Art sinkt.

### A4 (Lineare Algebra) – 5 BE

Einsetzen von $g$ in $E$ führt zu $11=10$ (Widerspruch).
Gerade ist echt parallel zur Ebene.

### A5 (Analysis) – 5 BE

$f'(x) = 2e^{2x-1}$. $F(x) = 0,5e^{2x-1}$.
$f'(0,5) = 2e^0 = 2$.

### A6 (Stochastik) – 5 BE

$P_W(R) = \frac{P(W \cap R)}{P(W)} = \frac{0,2}{0,6} = \frac{1}{3} \approx 33,3\%$.

### A7 (Analysis) – 5 BE

Punktsymmetrie zum Ursprung bedeutet: Flächeninhalte im Intervall $[-a, a]$ heben sich orientiert auf.
$\int_{-3}^3 f(x) dx = 0$.
Anwendung der Linearität des Integrals:
$\int_{-3}^3 (f(x) + 2) dx = \int_{-3}^3 f(x) dx + \int_{-3}^3 2 dx$.
$= 0 + [2x]_{-3}^3 = 2(3) - 2(-3) = 6 + 6 = 12$.

### A8 (Lineare Algebra) – 5 BE

Ziel: $\vec{m} = \vec{OM}$ durch $\vec{a}, \vec{c}$ ausdrücken.
Da $M$ der Schnittpunkt der Diagonalen im Parallelogramm ist, ist $M$ der Mittelpunkt von $AC$.
$\vec{m} = \vec{a} + \frac{1}{2}\vec{AC} = \vec{a} + \frac{1}{2}(\vec{c} - \vec{a}) = \vec{a} - \frac{1}{2}\vec{a} + \frac{1}{2}\vec{c} = \frac{1}{2}\vec{a} + \frac{1}{2}\vec{c}$.
Dies entspricht der Formel für den Ortsvektor des Mittelpunktes der Strecke $\overline{AC}$.

### A9 (Lineare Algebra) – 5 BE

Untersuchung auf Parallelität der Richtungsvektoren:
$\begin{pmatrix} 1 \\ 1 \\ 0 \end{pmatrix} = k \cdot \begin{pmatrix} 1 \\ a \\ 0 \end{pmatrix}$.
Zeile 1: $1 = k$.
Zeile 2: $1 = k \cdot a \xrightarrow{k=1} a = 1$.
Für $a=1$ sind die Richtungsvektoren kollinear.
Prüfung auf Identität (liegt Stützpunkt von $h_1$ auf $g$?):
$\begin{pmatrix} 0 \\ 1 \\ 2 \end{pmatrix} = \begin{pmatrix} 1 \\ 0 \\ 1 \end{pmatrix} + r \begin{pmatrix} 1 \\ 1 \\ 0 \end{pmatrix}$.
Zeile 1: $0 = 1 + r \Rightarrow r = -1$.
Zeile 3: $2 = 1 + 0 \Rightarrow 2 = 1$ (Widerspruch).
Der Punkt liegt nicht auf $g$, somit sind die Geraden **echt parallel** für $a=1$.

### A10 (Stochastik) – 5 BE

Bernoulli-Kette der Länge $n$. Trefferwahrscheinlichkeit $p = \frac{1}{4} = 0,25$ (Raten bei 4 Optionen).
Gesucht: $n$ so, dass $P(X \ge 1) > 0,99$.
Über Gegenereignis ("Kein Treffer"): $1 - P(X=0) > 0,99$.
$1 - 0,75^n > 0,99 \Leftrightarrow 0,75^n < 0,01$.
(Ansatz genügt laut Aufgabenstellung. Lösung wäre $n > \frac{\ln(0,01)}{\ln(0,75)} \approx 16,008$, also $n=17$).

---

## LK – Prüfungsteil 2 (mit Hilfsmitteln)

### B1 (Analysis – "Die Hängebrücke") – 30 BE

**1. Geometrie (5 BE)**
y-Koordinate der Aufhängepunkte: $k(100) \approx 150,5\,m$.
Tiefster Punkt: $k(0) = 40\,m$.
Fahrbahn bei $x=100$: $f(100) = 5\,m$.
Pylone über Fahrbahn: $k(100) - f(100) \approx 145,5\,m$.

**2. Vertikal-Seile (8 BE)**
Differenz $d(x) = k(x) - f(x)$.
Min bei $x=0$: $30\,m$.
Max bei $x=100$: $145,5\,m$.

**3. Winkel (4 BE)**
$k'(100) \approx 2,90 \Rightarrow \alpha \approx 71^\circ$.

**4. Fläche (7 BE)**
Integralfunktion: $A = \int_{-100}^{100} (k(x) - f(x)) \, dx$.
Stammfunktion $K(x)$ zu $k(x) = 20(e^{0,02x} + e^{-0,02x})$ ist $1000(e^{0,02x} - e^{-0,02x})$.
Wert $\int_{-100}^{100} k(x) dx = K(100) - K(-100) \approx 14.507,4$.
Wert $\int_{-100}^{100} f(x) dx \approx 1.666,7$.
Fläche $A = \int_{-100}^{100} (k(x) - f(x)) \, dx \approx 12.840,8 \, m^2$.
Ergebnis: $A \approx 12.841 \, m^2$.

**5. Variation (6 BE)**
$k_a'(100) = e^{100a} - e^{-100a}$.
Für wachsendes $a$ wächst der erste Term (Minuend) und fällt der zweite (Subtrahend), somit wächst die Differenz (Steigung) streng monoton.

### B2 (Analysis – "Wirkstoffkonzentration") – 30 BE

**1. Verlauf (4 BE)**
L'Hospital oder Dominanz der e-Funktion: Für $t \to \infty$ geht $t$ linear gegen $\infty$, aber $e^{-kt}$ exponentiell gegen 0. Grenzwert ist 0.
Positivität: $10, t, e^{\dots}$ sind für $t>0$ alle positiv, Produkt ist positiv.

**2. Wirkungsmaximum (9 BE)**
Produktregel: $c_k'(t) = 10 \cdot e^{1-kt} + 10t \cdot (-k)e^{1-kt} = 10 e^{1-kt} (1 - kt)$.
Bedingung $c_k'(t) = 0 \Rightarrow 1 - kt = 0 \Rightarrow t_{max} = \frac{1}{k}$.
Funktionswert: $c_k(\frac{1}{k}) = 10 \cdot \frac{1}{k} \cdot e^{1-1} = \frac{10}{k}$.
Maximum bei $t=2$: $\frac{1}{k} = 2 \Rightarrow k = 0,5$.

**3. Abbaugeschwindigkeit (6 BE)**
Zweite Ableitung: $c_k''(t) = 10 e^{1-kt} (-k)(1-kt) + 10 e^{1-kt}(-k) = 10k e^{1-kt} (kt - 1 - 1) = 10k e^{1-kt} (kt - 2)$.
$c_k''(t) = 0 \Rightarrow kt = 2 \Rightarrow t_W = \frac{2}{k}$.
Interpretation: Bis $t_W$ nimmt die Abbaugeschwindigkeit zu (Kurve fällt steiler), ab $t_W$ flacht die Kurve ab (Abbau verlangsamt sich).

**4. Gesamtmenge (11 BE)**
Partielle Integration oder Substitution:
$\int 10 t e^{1-kt} dt$. Mit $u=t, v'=e^{1-kt} \Rightarrow u'=1, v=-\frac{1}{k}e^{1-kt}$.
$F_k(t) = 10 [ -\frac{t}{k}e^{1-kt} - \int -\frac{1}{k}e^{1-kt} dt ] = 10 [ -\frac{t}{k}e^{1-kt} - \frac{1}{k^2}e^{1-kt} ]$.
Grenzwert $t \to \infty$ ist 0 (siehe Teil 1).
Untergrenze $t=0$: $10 [ 0 - \frac{1}{k^2}e^1 ] = -\frac{10e}{k^2}$.
Integralwert: $0 - (-\frac{10e}{k^2}) = \frac{10e}{k^2}$.
Verdopplung: Zielwert $\frac{20e}{k^2}$.
Mit neuem $k_{neu}$: $\frac{10e}{k_{neu}^2} = 2 \cdot \frac{10e}{k_{alt}^2} \Rightarrow k_{neu}^2 = \frac{1}{2} k_{alt}^2 \Rightarrow k_{neu} = \frac{k_{alt}}{\sqrt{2}}$.
Der Parameter $k$ muss durch $\sqrt{2}$ geteilt (verkleinert) werden.

### C1 (Lineare Algebra – "Populationsdynamik") – 20 BE

**1. Systemverständnis (4 BE)**
Spaltensummen = 1 $\Rightarrow$ geschlossenes System.
**Übergangsdiagramm:** 3 Knoten A, B, C. Pfeile von jedem Knoten zu den anderen entsprechend den Matrix-Spalten. (z.B. A geht zu 60% auf sich selbst, 30% zu B, 10% zu C).

**2. Prognose (8 BE)**
$\vec{v}_{10} \approx (1127,77; 4254,42; 4617,81)^T$.
Stationäres Gleichgewicht: $\approx (1052,63; 4210,53; 4736,84)^T$.

**3. Rekonstruktion (8 BE)**
LGS $M \cdot \vec{x}_t = \begin{pmatrix} 500 \\ 800 \\ 1000 \end{pmatrix}$ lösen.
$\vec{x}_t = M^{-1} \vec{x}_{t+1} \approx (744,83; 531,03; 1024,14)^T$.
Interpretation: Mathematisch existiert eine eindeutige Lösung mit ausschließlich positiven Komponenten.

### D1 (Stochastik – "Viren-Screening & Testgüte") – 20 BE

**1. Testanalyse (4 BE)**
$P(T+) \approx 2,49\%$.

**2. Bedingte Wahrscheinlichkeit (5 BE)**
$P(C|T+) \approx 19,9\%$. (3 BE Rechnung, 2 BE Interpretation "Vorsicht bei Massentest").

**3. Testoptimierung (6 BE)**
Bayes für $n$ Tests. Ziel $P(C | n \times \text{Positiv}) > 0,9$.
Für $n=2$: $P \approx 92\%$.
Also 1 Wiederholung (insgesamt 2 Tests) reicht rechnerisch aus.
Kritik (1 BE): Tests an derselben Person sind biochemisch oft abhängig (systematischer Fehler), daher ist die Rechnung $P^n$ in der Realität fragwürdig.

**4. Kapazitätsplanung (5 BE)**
$X$ ist $B_{2000; 0,02}$-verteilt (Anzahl Falsch-Positive).
Gesucht ist $k$ für $P(X \le k) \ge 0,95$.
Erwartungswert $\mu = 40$. $\sigma \approx 6,26$.
GTR kumulierte Binomialverteilung:
$P(X \le 50) \approx 0,9506$.
$P(X \le 49) \approx 0,935$.
**Ergebnis:** Es muss mit bis zu $k=50$ falsch-positiven Ergebnissen gerechnet werden.
