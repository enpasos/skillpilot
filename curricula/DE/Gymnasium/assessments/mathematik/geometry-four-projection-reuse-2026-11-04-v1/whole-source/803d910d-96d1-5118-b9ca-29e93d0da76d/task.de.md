# Eine schräge Parallelprojektion untersuchen

In einem räumlichen Modell wird entlang der Richtung
$$
\vec{d}=\begin{pmatrix}1\\1\\1\end{pmatrix}
$$
auf die Ursprungsebene $E:x_1+2x_2-x_3=0$ projiziert.
Jedem Punkt $X$ wird der Schnittpunkt seiner Projektionsgeraden mit $E$
zugeordnet. Es geht um Geraden, nicht um auf eine Richtung beschränkte
Lichtstrahlen. Zeige deine Ansätze und begründe deine Ergebnisse.
Insgesamt sind **20 BE** erreichbar.

**1. Die Matrix aus der Geometrie bestimmen (6 BE)**

Stelle für einen beliebigen Ortsvektor
$\vec{x}=\begin{pmatrix}x_1\\x_2\\x_3\end{pmatrix}$ die
Projektionsgerade auf. Bestimme ihren Schnittparameter mit $E$ und daraus
den Bildvektor. Gib die Abbildungsmatrix $P$ bezüglich der Standardbasis
an. Begründe, warum der Schnittpunkt für jeden Ausgangspunkt eindeutig ist.

**2. Einen Bildpunkt prüfen (3 BE)**

Berechne das Bild von $X(4|1|2)$. Prüfe sowohl die Zugehörigkeit des
Bildpunkts zu $E$ als auch die vorgegebene Projektionsrichtung.

**3. Die Matrix als Projektion untersuchen (6 BE)**

Zeige: Jeder Punkt aus $E$ bleibt an seinem Ort, und $P^2=P$.
Bestimme außerdem alle Vektoren, die auf $\vec{0}$ abgebildet werden,
und den gesamten Bildraum. Deute beide Mengen geometrisch.

**4. Auf eine beliebige Ursprungsebene übertragen (5 BE)**

Sei nun $F:\vec{n}\cdot\vec{x}=0$ mit $\vec{n}\ne\vec{0}$ eine
beliebige Ursprungsebene. Es soll entlang einer Richtung
$\vec{v}\ne\vec{0}$ projiziert werden. Leite aus dem Geradenschnitt eine
Matrixformel für den Fall $\vec{n}\cdot\vec{v}\ne0$ her; dabei ist $I$
die Einheitsmatrix und $\vec{n}^{\mathsf T}$ der zu $\vec n$ gehörige
Zeilenvektor. Eine auswendig angegebene Formel allein genügt nicht.

Untersuche auch, warum bei $\vec{n}\cdot\vec{v}=0$ auf diese Weise
keine auf dem ganzen Raum eindeutig definierte Projektion entsteht.
Unterscheide Ausgangspunkte in $F$ und außerhalb von $F$.
