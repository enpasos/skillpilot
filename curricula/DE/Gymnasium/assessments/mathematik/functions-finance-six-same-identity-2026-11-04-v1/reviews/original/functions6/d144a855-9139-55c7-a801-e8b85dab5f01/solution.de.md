# Musterlösung: Integrale der Schar

**1. Stammfunktion**

Beim Integrieren nach $x$ wird $a$ als Konstante behandelt. Beispielsweise
$$F_a(x)=\frac{x^3}{3}-ax^2+2ax.$$
Die Ableitung ist $F_a'(x)=x^2-2ax+2a=f_a(x)$.
Eine zusätzliche, bezüglich $x$ konstante Größe $C_a$ ist ebenfalls zulässig;
sie muss bei der Wahl einer Stammfunktion nicht angegeben werden.

**2. Parameterabhängiges Integral**

$$I(a)=F_a(1)-F_a(0)=\frac13-a+2a=a+\frac13.$$
$I(a)=0$ gilt genau für $a=-1/3$. Für $a>-1/3$ ist $I(a)>0$,
für $a<-1/3$ ist $I(a)<0$.

**3. Flächenbilanz**

Das Integral ist der vorzeichenbehaftete Beitrag oberhalb der $x$-Achse
abzüglich des Betrags der Beiträge unterhalb der Achse. Beim Nullparameter
$a=-1/3$ gleichen sich die Beiträge aus. Es gilt aber
$f_{-1/3}(0)=-2/3$ und $f_{-1/3}(1)=1$. Die stetige Funktion besitzt
also negative und positive Abschnitte; sie ist nicht die Nullfunktion.
Der geometrische Gesamtflächeninhalt ist positiv und erhält sich durch
Addition der nichtnegativen Teilflächen, nicht durch deren Ausgleich.
Eine passende Skizze oder gleichwertige Wertebegründung genügt.

**4. Anderes Intervall**

$$J(a)=F_a(2)-F_a(0)=\frac83-4a+4a=\frac83.$$
$I$ hängt linear von $a$ ab, $J$ ist unabhängig von $a$.
Auf $[0,2]$ ist der Integralbeitrag des parameterabhängigen Terms
$2a(1-x)$ null: Die Beiträge auf beiden Seiten von $x=1$ heben sich auf.
Die einzelnen Graphen ändern sich trotzdem, zum Beispiel ist $f_a(0)=2a$.
