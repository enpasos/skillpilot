# Den Hauptsatz mit Stetigkeit begründen (LK)

Sei f auf [a,b] stetig und $F(x)=\int_a^x f(t)\,dt$.

1. Drücken Sie für einen inneren Punkt x den Quotienten $[F(x+h)-F(x)]/h$ durch ein Integral aus. Erläutern Sie mit dem anschaulichen Stetigkeitsbegriff, warum dieser mittlere Funktionswert für $h\to0$ gegen $f(x)$ geht. Berücksichtigen Sie positive und negative h und begründen Sie daraus $F'=f$. (6 BE)
2. Begründen Sie daraus $\int_a^b f(t)\,dt=G(b)-G(a)$ für jede Stammfunktion G von f. Verwenden Sie, dass eine Funktion mit Ableitung 0 konstant ist. Wenden Sie die Aussage auf $\int_0^1(3t^2+1)\,dt$ an. (4 BE)

## Lösung

1. Der Quotient ist $\frac1h\int_x^{x+h}f(t)\,dt$. Er liegt zwischen dem kleinsten und größten f-Wert auf dem kurzen Intervall zwischen x und x+h. Das gilt auch für h<0, da Integralorientierung und Divisor beide ihr Vorzeichen wechseln. Wegen der Stetigkeit liegen dort alle f-Werte bei kleinem |h| beliebig nahe bei f(x); daher auch der Mittelwert. Also $F'(x)=f(x)$.

2. Aus $(G-F)'=0$ folgt $G-F=c$. Wegen $F(a)=0$ ist c=G(a), somit $\int_a^b f=F(b)=G(b)-G(a)$. Für $G(t)=t^3+t$ ergibt sich $\int_0^1(3t^2+1)\,dt=2$.
