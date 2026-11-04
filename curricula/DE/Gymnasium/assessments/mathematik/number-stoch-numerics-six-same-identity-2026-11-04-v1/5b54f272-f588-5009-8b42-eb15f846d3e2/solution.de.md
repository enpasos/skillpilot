# Musterlösung: Relative Binomialstreuung

**1. Vergleich**

Bei $n=100$ gilt $\mu=20$, $\sigma=\sqrt{16}=4$ und $v=4/20=0{,}20$.
Bei $n=400$ gilt $\mu=80$, $\sigma=\sqrt{64}=8$ und $v=8/80=0{,}10$.
Die absolute Standardabweichung verdoppelt sich, der Erwartungswert
vervierfacht sich. Gemessen am Erwartungswert ist die Streuung daher nur
noch halb so groß. Die Trefferzahl streut absolut stärker, relativ schwächer.

**2. Allgemeine Begründung**

Da $np>0$, darf man durch $np$ teilen und schreiben:
$$v=\frac{\sqrt{np(1-p)}}{np}
=\sqrt{\frac{np(1-p)}{n^2p^2}}
=\sqrt{\frac{1-p}{np}}
=\sqrt{\frac{1-p}{p}}\,\frac1{\sqrt n}.$$
Bei festem $0<p<1$ ist der erste Faktor positiv und konstant.
$1/\sqrt n$ nimmt mit wachsendem $n$ streng ab, also auch $v$.
Für denselben Wert von $p$ gilt $v(4n)=v(n)/2$.

**3. Mindestumfang**

$$\sqrt{\frac{0{,}8}{0{,}2n}}\leq0{,}05
\quad\Longleftrightarrow\quad\frac4n\leq0{,}0025
\quad\Longleftrightarrow\quad n\geq1600.$$
Der kleinste ganzzahlige Umfang ist $1600$.
Die Probe liefert $v(1600)=0{,}05$ und
$v(1599)=2/\sqrt{1599}\approx0{,}050016>0{,}05$.
Zusammen mit der strengen Abnahme ist die Minimalität gezeigt.

**4. Veränderliches p**

Für $B(100;0{,}50)$ ist $v=\sqrt{0{,}5/(100\cdot0{,}5)}=0{,}10$.
Für $B(400;0{,}01)$ ist
$v=\sqrt{0{,}99/(400\cdot0{,}01)}\approx0{,}4975$.
Trotz größerem $n$ ist die relative Streuung hier größer. Die pauschale
Behauptung ist falsch; die bewiesene Abnahme gilt für festgehaltenes $p$
im angegebenen Bereich $0<p<1$. Es werden keine zusätzlichen Randfälle
außerhalb dieses Bereichs verlangt.
