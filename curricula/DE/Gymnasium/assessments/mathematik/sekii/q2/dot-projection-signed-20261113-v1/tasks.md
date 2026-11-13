# Skalarprodukt über die orthogonale Projektion begründen

Assessment of the learning unit `math-dot-product-projection`, drafted on
13 November 2026. It answers the unit coverage review of 12 November 2026,
which found that the earlier task `dot-projection`
(`../m7-route-repair-20260929-v1/tasks.md`, notation corrected in
`../dot-projection-notation-20261031-v1/tasks.md`) does not test the whole goal.
The earlier task keeps its own assessment ID; passes of it are not upgraded.

## dot-projection-signed

### Aufgabe

Gegeben sind die Vektoren
$$
\vec a=\begin{pmatrix}-3\\4\\-4\end{pmatrix}
\quad\text{und}\quad
\vec b=\begin{pmatrix}2\\-1\\2\end{pmatrix}.
$$

1. Bestimme die orthogonale Projektion $\vec p$ von $\vec a$ auf die Richtung von $\vec b$ und den Restvektor $\vec r=\vec a-\vec p$. Weise nach, dass $\vec r$ senkrecht auf $\vec b$ steht. (2 BE)
2. Die vorzeichenbehaftete Projektionslänge $s$ von $\vec a$ auf $\vec b$ ist die Zahl mit $\vec p=s\cdot\frac{\vec b}{|\vec b|}$. Bestimme $s$. Denke dir $\vec a$ und $\vec b$ vom Ursprung $O$ aus abgetragen; ihre Pfeilspitzen seien $A$ und $B$. Gib den Fußpunkt $F$ des Lotes von $A$ auf die Gerade $OB$ an, beschreibe die Lage von $F$ im Vergleich zu $O$ und $B$ und erkläre damit, was das Vorzeichen von $s$ geometrisch bedeutet. (3 BE)
3. Berechne $\vec a\cdot\vec b$ aus den Koordinaten und vergleiche das Ergebnis mit dem Produkt aus $|\vec b|$ und $s$. Formuliere den Zusammenhang als Gleichung und in einem Satz in Worten. Begründe mit der Zerlegung $\vec a=\vec p+\vec r$, dass er für jeden Vektor $\vec a$ und jeden Vektor $\vec b\neq\vec 0$ gilt. (3 BE)
4. Setzt man die Pfeile von $\vec p$ und $\vec r$ aneinander, bilden sie mit dem Pfeil von $\vec a$ ein rechtwinkliges Dreieck. Leite an diesem Dreieck her, wie $s$ von $|\vec a|$ und vom Winkel $\theta$ zwischen $\vec a$ und $\vec b$ abhängt, und gib $s$ in möglichst einfacher Form an. Benutze dabei nicht die Formel $\vec a\cdot\vec b=|\vec a|\,|\vec b|\cos\theta$. Die Herleitung muss für die hier vorliegende Lage von $\vec p$ gelten; eine Probe mit den gegebenen Zahlen ersetzt sie nicht. Gib an, ob $\theta$ hier ein spitzer, ein rechter oder ein stumpfer Winkel ist, und folgere mit Teil 3 eine Darstellung von $\vec a\cdot\vec b$, in der nur $|\vec a|$, $|\vec b|$ und $\theta$ vorkommen. (3 BE)
5. Folgere, welches Vorzeichen das Skalarprodukt zweier vom Nullvektor verschiedener Vektoren bei spitzem, bei rechtem und bei stumpfem Winkel hat. Begründe für jeden der drei Fälle geometrisch, wo der Lotfußpunkt $F$ (wie in Teil 2) liegt, und folgere daraus das Vorzeichen. (3 BE)

### Lösung

**Zu 1.** Die Projektion ist das Vielfache $\vec p=t\,\vec b$, dessen Rest senkrecht auf $\vec b$ steht: Aus $(\vec a-t\,\vec b)\cdot\vec b=0$ folgt $t=\frac{\vec a\cdot\vec b}{\vec b\cdot\vec b}$. Mit $\vec a\cdot\vec b=-6-4-8=-18$ und $\vec b\cdot\vec b=4+1+4=9$ ist $t=-2$, also
$$
\vec p=-2\,\vec b=\begin{pmatrix}-4\\2\\-4\end{pmatrix},
\qquad
\vec r=\vec a-\vec p=\begin{pmatrix}1\\2\\0\end{pmatrix}.
$$
Wegen $\vec r\cdot\vec b=2-2+0=0$ steht $\vec r$ senkrecht auf $\vec b$. Gleichwertig ist die Projektionsformel $\vec p=\frac{\vec a\cdot\vec b}{\vec b\cdot\vec b}\,\vec b$.

**Zu 2.** Mit $|\vec b|=3$ ist $\frac{\vec b}{|\vec b|}=\frac13\vec b$ und $\vec p=-2\,\vec b=-6\cdot\frac13\vec b$, also $s=-6$. Der Lotfußpunkt ist die Spitze von $\vec p$, also $F(-4\,|\,2\,|\,-4)$. Auf der Geraden $\vec x=t\cdot\vec b$ gehört $F$ zu $t=-2$ und $B(2\,|\,-1\,|\,2)$ zu $t=1$: $F$ liegt von $O$ aus auf der anderen Seite als $B$. Das negative Vorzeichen bedeutet, dass $\vec p$ entgegengesetzt zu $\vec b$ zeigt. Nicht verlangt ist der Abstand $|OF|=|s|=6=2\,|\vec b|$.

**Zu 3.** Aus den Koordinaten folgt $\vec a\cdot\vec b=-18$, und es ist $|\vec b|\cdot s=3\cdot(-6)=-18$. Der Zusammenhang lautet
$$
\vec a\cdot\vec b=|\vec b|\cdot s .
$$
In Worten: Das Skalarprodukt ist die Länge von $\vec b$ mal der vorzeichenbehafteten Projektionslänge von $\vec a$ auf $\vec b$. Der Zusammenhang gilt allgemein, weil der Rest nichts zum Skalarprodukt beiträgt:
$$
\vec a\cdot\vec b=(\vec p+\vec r)\cdot\vec b=\vec p\cdot\vec b+\underbrace{\vec r\cdot\vec b}_{=0}
=s\,\frac{\vec b\cdot\vec b}{|\vec b|}=s\,|\vec b| .
$$

**Zu 4.** Das Dreieck $OFA$ hat den rechten Winkel bei $F$ zwischen $\vec p$ und $\vec r$; die Hypotenuse ist $\vec a$. Für den Innenwinkel $\varphi$ bei $O$ zwischen $\vec a$ und $\vec p$ gilt $|\vec p|=|\vec a|\cos\varphi$. Hier zeigt $\vec p$ entgegengesetzt zu $\vec b$; $\varphi$ ist also der Winkel zwischen $\vec a$ und $-\vec b$, das heißt $\varphi=180^\circ-\theta$, und es ist $s=-|\vec p|$. Damit gilt
$$
s=-|\vec a|\cos(180^\circ-\theta)=|\vec a|\cos\theta .
$$
Da $\varphi$ als einer der beiden anderen Innenwinkel des rechtwinkligen Dreiecks spitz ist, ist $\theta=180^\circ-\varphi$ ein stumpfer Winkel. Mit Teil 3 folgt $\vec a\cdot\vec b=|\vec b|\,s=|\vec a|\,|\vec b|\cos\theta$.

Gleichwertig ist jede Herleitung an diesem Dreieck, die einen seiner Winkel richtig durch $\theta$ ausdrückt, zum Beispiel den Winkel $\theta-90^\circ$ bei $A$ mit $|\vec p|=|\vec a|\sin(\theta-90^\circ)=-|\vec a|\cos\theta$. Nicht verlangt und kein Ersatz für die Herleitung in der vorliegenden Lage: Zeigt $\vec p$ in die Richtung von $\vec b$, ist $\varphi=\theta$ und $s=|\vec p|=|\vec a|\cos\theta$. Nicht verlangt sind außerdem die Probe $36+5=41$, der Zahlenwert $\theta\approx159{,}6^\circ$ und die Sonderfälle $\vec p=\vec 0$ (dann ist $\vec a\perp\vec b$, sofern $\vec a\neq\vec 0$) und $\vec r=\vec 0$.

**Zu 5.** Wegen $\vec a\cdot\vec b=|\vec b|\cdot s$ und $|\vec b|>0$ hat das Skalarprodukt das Vorzeichen von $s$. Dabei ist $s$ positiv, null oder negativ, je nachdem, ob der Lotfußpunkt $F$ auf dem Strahl von $O$ in Richtung $\vec b$ liegt, mit $O$ zusammenfällt oder auf dem Strahl in Richtung $-\vec b$ liegt. Ist $\vec a$ weder senkrecht noch parallel zu $\vec b$, bilden die Pfeile von $\vec p$, $\vec r$ und $\vec a$ ein rechtwinkliges Dreieck mit dem rechten Winkel bei $F$; sein Winkel bei $O$ ist der Winkel zwischen $\vec a$ und $\vec p$ und als einer der beiden anderen Innenwinkel spitz. Das ist bei spitzem und bei stumpfem $\theta$ stets der Fall; insbesondere ist dann $\vec p\neq\vec 0$.

- Spitzer Winkel: Zeigte $\vec p$ entgegengesetzt zu $\vec b$, wäre der Winkel bei $O$ gleich $180^\circ-\theta$, also stumpf. Also liegt $F$ auf dem Strahl in Richtung $\vec b$: $s>0$ und $\vec a\cdot\vec b>0$.
- Rechter Winkel: $\vec a$ steht selbst senkrecht auf $\vec b$. Der Lotfußpunkt ist $O$, also $\vec p=\vec 0$, $s=0$ und $\vec a\cdot\vec b=0$.
- Stumpfer Winkel: Zeigte $\vec p$ in die Richtung von $\vec b$, wäre der Winkel bei $O$ gleich $\theta$, also stumpf. Also liegt $F$ auf dem Strahl in Richtung $-\vec b$: $s<0$ und $\vec a\cdot\vec b<0$.

In Teil 5 ist eine Begründung über eine zutreffend beschriebene Skizze gleichwertig.

**Bewertungshinweis.** Ein Schritt erhält seine volle BE-Zahl, wenn die im Raster genannten Leistungen vollständig und fachlich richtig vorliegen; fehlt eine oder ist sie fachlich falsch, erhält er 0 BE. Eine verlangte Angabe (ein Ergebnis oder eine Einordnung, nicht eine Beschreibung, Erklärung oder Herleitung) gilt als vorhanden, wenn sie eindeutig aus der Bearbeitung hervorgeht, etwa die Einordnung „stumpf“ aus $\varphi=180^\circ-\theta$ mit spitzem $\varphi$. Keine BE kosten: Rechenfehler, mit denen folgerichtig weitergearbeitet wird; ein Rechenfehler in Teil 1, den die lernende Person an $\vec r\cdot\vec b\neq0$ selbst als Fehler erkennt, auch wenn sie ihn nicht findet und folgerichtig weiterarbeitet; Rundungen; gleichwertige Bezeichnungen und Schreibweisen; sprachliche Unschärfen ohne fachlichen Fehler; das Weglassen von Sonderfällen und Proben, die die Aufgabe nicht verlangt. Führt ein Rechenfehler dazu, dass $\vec p$ in die Richtung von $\vec b$ zeigt, fehlt die in Teil 2 und Teil 4 verlangte Begründung für die entgegengesetzte Lage. Eine Leistung fehlt oder ist falsch insbesondere, wenn

- in Teil 1 trotz $\vec r\cdot\vec b\neq0$ Orthogonalität behauptet wird;
- in Teil 2 der Lotfußpunkt fehlt oder seine Lage zu $O$ und $B$ nicht beschrieben wird;
- in Teil 3 nur Zahlen verglichen werden; $s=\frac{\vec a\cdot\vec b}{|\vec b|}$ aus einer nicht begründeten Projektionsformel abgelesen wird, ohne zu zeigen, dass $\vec r$ nichts zum Skalarprodukt beiträgt; oder die Allgemeingültigkeit statt mit der Zerlegung über $\vec a\cdot\vec b=|\vec a|\,|\vec b|\cos\theta$ begründet wird. Die Formulierung in Worten wird zusammen mit der Gleichung beurteilt: Fehlt in ihr nur der Hinweis auf das Vorzeichen (etwa „Länge von $\vec b$ mal Länge der Projektion“), während Gleichung und übrige Bearbeitung mit der vorzeichenbehafteten Projektionslänge $s$ arbeiten, ist das eine sprachliche Unschärfe; fachlich falsch ist sie, wenn die Bearbeitung die Projektionslänge tatsächlich als nichtnegativ behandelt, etwa $|\vec p|$ statt $s$ in die Gleichung einsetzt;
- in Teil 4 der Zusammenhang aus $\vec a\cdot\vec b=|\vec a|\,|\vec b|\cos\theta$ gewonnen, nur mit den gegebenen Zahlen geprüft oder im vorliegenden Fall $\theta$ als Innenwinkel des Dreiecks verwendet wird; das gilt auch, wenn das Vorzeichen nur nachträglich angepasst wird (etwa „$\cos\theta=-|\vec p|/|\vec a|$, weil $\theta$ stumpf ist“), ohne einen Winkel des Dreiecks auf $\theta$ zurückzuführen und $s=-|\vec p|$ aus der Richtung von $\vec p$ zu begründen;
- in Teil 5 das Vorzeichen eines Falls allein aus dem Vorzeichen von $\cos\theta$ gewonnen und die Lage der Projektion nur als Folgerung genannt wird. Verlangt ist für jeden Fall die Lage des Lotfußpunkts (Strahl in Richtung $\vec b$, $O$, Strahl in Richtung $-\vec b$), geometrisch aus dem Winkel begründet, über das rechtwinklige Dreieck, dessen Winkel bei $O$ spitz ist, oder über eine zutreffend beschriebene Skizze, daraus das Vorzeichen von $s$ und mit Teil 3 das von $\vec a\cdot\vec b$. Dafür genügt je Fall ein Satz, der die Lage des Lotfußpunkts geometrisch mit dem Winkel zwischen $\vec a$ und $\vec b$ verknüpft, etwa über den spitzen Dreieckswinkel bei $O$.

## Bewertung

| Schritt | BE | Kriterium |
| --- | ---: | --- |
| 1 | 2 | Projektionsvektor mit Ansatz oder Projektionsformel und Restvektor bestimmt, Orthogonalität des Rests nachgewiesen |
| 2 | 3 | Vorzeichenbehaftete Projektionslänge s = −6 bestimmt, Lotfußpunkt angegeben und seine Lage auf der von der Pfeilspitze des zweiten Vektors abgewandten Seite des Ursprungs beschrieben, negatives Vorzeichen damit erklärt |
| 3 | 3 | Zusammenhang Skalarprodukt gleich Länge des zweiten Vektors mal vorzeichenbehaftete Projektionslänge als Gleichung und in Worten formuliert, ohne die Projektionslänge als vorzeichenlose Größe zu behandeln, und mit der Zerlegung allgemein begründet, nicht über die Kosinusformel und nicht nur durch Zahlenvergleich |
| 4 | 3 | Projektionslänge gleich Länge des ersten Vektors mal Kosinus des Winkels zwischen den Vektoren am rechtwinkligen Dreieck für die vorliegende Lage hergeleitet: ein Dreieckswinkel richtig durch diesen Winkel ausgedrückt, etwa Innenwinkel beim Ursprung gleich 180° minus diesem Winkel, und Projektionslänge gleich minus Länge des Projektionsvektors; nicht über die Kosinusformel, nicht durch Zahlenprobe und nicht durch bloße Vorzeichenkorrektur. Winkel als stumpf eingeordnet und die Kosinusdarstellung des Skalarprodukts gefolgert |
| 5 | 3 | Vorzeichen des Skalarprodukts für spitzen, rechten und stumpfen Winkel jeweils aus der geometrisch begründeten Lage des Lotfußpunkts über das Vorzeichen der Projektionslänge gefolgert, nicht allein über das Vorzeichen des Kosinus |

Erreichbar sind 14 BE. Bestanden ist die Prüfung mit 14 BE.
