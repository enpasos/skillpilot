# Musterlösung: Bildungsgesetze

**1. Eine passende Wahl für A**

Die aufeinanderfolgenden Differenzen sind $4,6,8,10$.
Eine einfache passende Fortsetzung lässt die Differenzen jeweils um $2$
wachsen. Dazu passt

$$
a_n=n^2+n+1\quad(n\geq1).
$$

Die Proben ergeben für $n=1,2,3,4,5$ genau $3,7,13,21,31$.
Nach diesem Gesetz ist $a_6=36+6+1=43$.
Gleichwertig ist die Rekursion $a_1=3$ und
$a_{n+1}=a_n+2n+2$ für $n\geq1$, denn
$(n+1)^2+(n+1)+1-(n^2+n+1)=2n+2$.

**2. Eine passende Wahl für B**

Jeder Quotient zweier aufeinanderfolgender Glieder ist $-\frac12$.
Eine passende Regel ist daher

$$
b_n=2\left(-\frac12\right)^{n-1}\quad(n\geq1),
$$

oder rekursiv $b_1=2$ und $b_{n+1}=-\frac12b_n$.
Einsetzen der ersten fünf Indizes liefert $2,-1,\frac12,-\frac14,\frac18$.
Das sechste Glied dieser Wahl ist $b_6=-\frac1{16}$.

**3. Keine Eindeutigkeit aus endlich vielen Daten**

Die fünf Werte erlauben passende Regeln, legen aber ohne weitere
Bedingungen keine eindeutige unendliche Fortsetzung fest.
Zum Beispiel ist neben der oben gewählten Folge A auch

$$
q_n=n^2+n+1+(n-1)(n-2)(n-3)(n-4)(n-5)
$$

für alle ganzzahligen $n\geq1$ definiert. Für $n=1,\ldots,5$ ist
der Zusatz null, also stimmen die fünf Daten. Bei $n=6$ ist er $120$,
somit $q_6=163$ statt $43$.
Andere wohldefinierte Regeln und dazu konsistente sechste Glieder sind
gleichwertig, wenn die Daten und die begründete Wahl tatsächlich geprüft
werden. Die genannten sechsten Glieder sind keine aus den Daten allein
bewiesenen eindeutigen Werte.
