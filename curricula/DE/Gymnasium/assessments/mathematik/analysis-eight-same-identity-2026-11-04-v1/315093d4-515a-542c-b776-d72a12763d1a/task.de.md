# Die Zahl e in der Taylorentwicklung wiederfinden

Für $f(x)=e^x$ sind alle Ableitungen wieder $e^x$.
Das Taylorpolynom um $0$ lautet allgemein

$$
P_n(x)=\sum_{k=0}^{n}\frac{f^{(k)}(0)}{k!}x^k.
$$

Es gilt $0!=1$. Zeige deine Überlegungen und Rechenschritte.
Insgesamt sind **20 BE** erreichbar.

**1. Das Taylorpolynom bilden (4 BE)**

Bestimme $P_4(x)$ aus den Ableitungswerten und schreibe alle Summanden aus.

**2. Die Reihendarstellung angeben (4 BE)**

Gib die unendliche Reihendarstellung von $e$ sowohl mit Summenzeichen als
auch mit den ersten fünf Summanden an. Erkläre Startindex, Fakultät und
die Bedeutung der unendlichen Summe als Grenzwert endlicher Partialsummen.

**3. Partialsummen berechnen (4 BE)**

Berechne $S_4=\sum_{k=0}^4 1/k!$ und $S_6=\sum_{k=0}^6 1/k!$ als
Brüche und auf sechs Dezimalstellen. Welche beiden Summanden kommen hinzu?

**4. Den Taylorzusammenhang erläutern (4 BE)**

Erkläre $S_n=P_n(1)$. Warum ist eine endliche Partialsumme hier ein
Näherungswert und nicht genau $e$? Erläutere außerdem, weshalb $P_n(0)$
stattdessen den Wert $e^0=1$ beschreibt.

**5. Eine gegebene Fehlerschranke nutzen (4 BE)**

Du darfst für $n\geq1$ die Abschätzung
$0<e-S_n<1/(n\,n!)$ verwenden; sie muss nicht bewiesen werden.
Gib damit ein Intervall für $e$ aus $S_6$ an und prüfe, ob es die Rundung
von $e$ auf drei Dezimalstellen sichert. Erkläre schließlich, weshalb
diese Abschätzung für wachsendes $n$ die Annäherung an $e$ bestätigt.
