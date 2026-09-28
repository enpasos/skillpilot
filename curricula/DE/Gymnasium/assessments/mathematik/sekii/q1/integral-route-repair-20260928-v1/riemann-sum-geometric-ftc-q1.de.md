# Produktsummen und den geometrischen Hauptsatz erklären

Eine Fläche liegt unter $f(t)=2t$ über $[0,1]$.

1. Zerlegen Sie das Intervall in n gleich breite Streifen. Stellen Sie untere und obere Rechtecksumme auf; verwenden Sie $1+\cdots+n=n(n+1)/2$. (4 BE)
2. Zeigen Sie, wie die Summen bei wachsendem n denselben Wert einschließen. Erläutern Sie den Übergang zum bestimmten Integral und prüfen Sie den Wert an der Dreiecksfläche. (4 BE)
3. Für $A(x)=\int_0^x2t\,dt$ beschreiben Sie den schmalen Flächenzuwachs von x bis x+h. Begründen Sie geometrisch, warum $A'(x)=2x$ gilt. Nutzen Sie diesen Zusammenhang, um $\int_1^2 2t\,dt$ zu bestimmen. (4 BE)

## Lösung

1. Streifenbreite $1/n$. Wegen der Monotonie sind $L_n=\sum_{k=0}^{n-1}(2k/n)(1/n)=(n-1)/n$ und $U_n=\sum_{k=1}^{n}(2k/n)(1/n)=(n+1)/n$.

2. Der Integralwert liegt zwischen beiden Summen; ihre Differenz $2/n$ verschwindet und beide nähern sich 1. Das bestimmte Integral entsteht als gemeinsamer Grenzwert dieser Produktsummen. Die Dreiecksfläche beträgt ebenfalls $1\cdot2/2=1$.

3. Der Zuwachs ist $A(x+h)-A(x)=\int_x^{x+h}2t\,dt$. Die schmale Fläche geteilt durch h hat für h nahe 0 eine Höhe nahe $2x$; der Grenzwert des Differenzenquotienten ist $A'(x)=2x$. Die Funktion $A(x)=x^2$ passt auch zur geometrischen Dreiecksfläche, sodass $\int_1^2 2t\,dt=A(2)-A(1)=3$.
