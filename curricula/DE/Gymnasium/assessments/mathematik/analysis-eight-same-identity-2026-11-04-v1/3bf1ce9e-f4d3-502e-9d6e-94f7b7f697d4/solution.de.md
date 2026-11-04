# Musterlösung: Logarithmus als Stammfunktion

**1. Beziehung**

Für $x>0$ gilt $(\ln x)'=1/x$. Dies ist genau die Bedingung für eine
Stammfunktion. Alle Stammfunktionen auf dem Intervall $(0,\infty)$ sind
$\ln x+C$ mit $C\in\mathbb R$: Eine additive Konstante hat Ableitung null.

**2. Anwendung**

$$
H(x)=3\ln x+x^2+C,\qquad H'(x)=\frac3x+2x=h(x).
$$

Mit $\ln(e^2)=2$ und $\ln1=0$ ergibt sich

$$
\int_1^{e^2}\left(\frac3x+2x\right)\,dx
=(6+e^4)-(0+1)=e^4+5.
$$

Die Konstante hebt sich bei der Differenz auf.

**3. Grenzen**

Beide Grenzen sind positiv. Deshalb kann die Beziehung auf dem ganzen
Integrationsintervall verwendet werden:

$$
J(a)=\ln(ea)-\ln a=\ln e+\ln a-\ln a=1.
$$

Das Verhältnis der oberen zur unteren Grenze ist stets $e$; die
Logarithmusdifferenz und damit das Integral sind unabhängig von $a$.

**4. Bereichsgrenze**

$0$ gehört nicht zum Definitionsbereich von $1/x$ oder des reellen
natürlichen Logarithmus. $\ln(0)$ ist kein reeller Funktionswert.
Die übliche Auswertung durch zwei endliche Stammfunktionswerte ist
deshalb nicht anwendbar. Daraus wird hier kein Grenzwerturteil behauptet.
