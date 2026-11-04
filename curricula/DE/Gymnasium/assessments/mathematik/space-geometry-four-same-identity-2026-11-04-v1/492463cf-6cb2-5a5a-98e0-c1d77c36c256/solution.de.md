# Musterlösung: Kameradrohne

**1. Modell**

Zwischen den Messungen vergehen $5-2=3$ Sekunden. Die Verschiebung ist

$$
\overrightarrow{PQ}=\begin{pmatrix}11-5\\0-3\\5-8\end{pmatrix}
=\begin{pmatrix}6\\-3\\-3\end{pmatrix}\,\mathrm m.
$$

Damit ist

$$
\vec v=\frac{1}{3}\overrightarrow{PQ}
=\begin{pmatrix}2\\-1\\-1\end{pmatrix}\,\frac{\mathrm m}{\mathrm s}.
$$

Da die erste Messung erst bei $t=2$ erfolgt, ist $\overrightarrow{OP}$
nicht der gesuchte Startvektor. Es gilt

$$
\vec x_0=\begin{pmatrix}5\\3\\8\end{pmatrix}
-2\begin{pmatrix}2\\-1\\-1\end{pmatrix}
=\begin{pmatrix}1\\5\\10\end{pmatrix}\,\mathrm m.
$$

Für die Zahlenwerte in den angegebenen Einheiten lautet das Modell

$$
\vec x(t)=\begin{pmatrix}1\\5\\10\end{pmatrix}
+t\begin{pmatrix}2\\-1\\-1\end{pmatrix},\qquad0\leq t\leq8.
$$

Einsetzen liefert $\vec x(2)=(5,3,8)^{\mathsf T}$ und
$\vec x(5)=(11,0,5)^{\mathsf T}$, also genau die Messpunkte.

**2. Ort und Verschiebung**

$$
\vec x(6)=\begin{pmatrix}13\\-1\\4\end{pmatrix}.
$$

Die Drohne befindet sich in $(13\mid-1\mid4)$.
Außerdem sind $\vec x(1)=(3,4,9)^{\mathsf T}$ und
$\vec x(4)=(9,1,6)^{\mathsf T}$. Daher ist die Verschiebung

$$
\vec x(4)-\vec x(1)=\begin{pmatrix}6\\-3\\-3\end{pmatrix}\,\mathrm m.
$$

Gleichwertig ist direkt $(4-1)\vec v=3\vec v$.

**3. Bedeutung**

Pro Sekunde nimmt die erste Koordinate um $2\,\mathrm m$ zu, die zweite
und die dritte nehmen jeweils um $1\,\mathrm m$ ab. Die Vorzeichen geben
die Bewegungsrichtung entlang der jeweiligen Koordinatenachsen an.
Alle drei Änderungen finden gleichzeitig statt; $\vec v$ ist die
Verschiebung pro Zeiteinheit und bleibt in diesem Modell konstant.
$\vec x_0$ zeigt vom Ursprung zum Ort der Drohne bei $t=0$ und hat die
Einheit Meter. $\vec v$ beschreibt die zeitliche Ortsänderung und hat
die Einheit Meter pro Sekunde; es ist kein Ortsvektor eines festen Punkts.

**4. Erreichbarkeit**

Für $R$ ergibt die erste Koordinate $1+2t=15$, also $t=7$.
Dieser Zeitpunkt liegt im Modellbereich. Auch $5-7=-2$ und $10-7=3$
stimmen; folglich wird $R$ bei $t=7\,\mathrm s$ erreicht.
Für $S$ erzwingen die erste und die dritte Koordinate ebenfalls $t=7$.
Dann ist die zweite Koordinate aber $-2$ statt $-1$. Es gibt keinen
gemeinsamen Zeitpunkt für alle drei Koordinaten; $S$ wird nicht erreicht.
