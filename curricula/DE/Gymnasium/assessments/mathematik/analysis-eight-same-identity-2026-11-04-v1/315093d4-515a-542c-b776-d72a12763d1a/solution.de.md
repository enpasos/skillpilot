# Musterlösung: e-Reihe und Taylorpolynome

**1. Taylorpolynom**

Alle Ableitungswerte bei $0$ sind $1$. Deshalb

$$
P_4(x)=1+x+\frac{x^2}{2!}+\frac{x^3}{3!}+\frac{x^4}{4!}
=1+x+\frac{x^2}{2}+\frac{x^3}{6}+\frac{x^4}{24}.
$$

**2. Reihe**

$$
e=\sum_{k=0}^{\infty}\frac1{k!}
=1+1+\frac12+\frac16+\frac1{24}+\cdots.
$$

Der Index beginnt bei $0$; daher sind die ersten beiden Summanden
$1/0!=1$ und $1/1!=1$. Für $k\geq1$ ist $k!=1\cdot2\cdots k$.
Die unendliche Summe bedeutet $e=\lim_{n\to\infty}S_n$, nicht eine
endliche Addition mit letztem Summanden.

**3. Partialsummen**

$$
S_4=\frac{65}{24}\approx2{,}708333,\qquad
S_6=\frac{65}{24}+\frac1{120}+\frac1{720}
=\frac{1957}{720}\approx2{,}718056.
$$

Hinzu kommen die Summanden zu $k=5$ und $k=6$, also $1/5!$ und $1/6!$.

**4. Zusammenhang**

Setzt man $x=1$ in $P_n(x)=\sum_{k=0}^n x^k/k!$ ein, erhält man
genau $S_n$. Damit stammt die e-Reihe aus der Taylorentwicklung von
$e^x$ um $0$, ausgewertet an der Stelle $1$.
Jede endliche Partialsumme lässt weitere positive Summanden weg und ist
daher kleiner als $e$. Bei $x=0$ bleiben dagegen in jedem $P_n$ nur
der konstante Summand $1$ und damit der Wert von $e^x$ bei $0$ übrig.

**5. Fehler und Rundung**

Für $n=6$ gilt

$$
\frac{1957}{720}<e<\frac{1957}{720}+\frac1{6\cdot720}
=\frac{11743}{4320}.
$$

Die Schranken sind etwa $2{,}718055556$ und $2{,}718287037$.
Beide liegen zwischen $2{,}7175$ und $2{,}7185$; das ganze Intervall
rundet auf drei Dezimalstellen zu $2{,}718$.
Da $n!\geq1$ ist, gilt $1/(n\,n!)\leq1/n\to0$.
Der positive Fehler wird daher beliebig klein, also $S_n\to e$.
