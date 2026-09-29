# Zwei Q2-Aufgabenfassungen · Kandidaten, keine Freigabe

Die Punkte sind Bewertungseinheiten (BE). Aufgabenwortlaut, Lösungsweg und zugeordnete Kompetenzen müssen vor Übernahme unabhängig begutachtet werden. Beide bestehenden Prüfungs-IDs könnten nach fachlicher Freigabe beibehalten werden; die aktuellen veröffentlichten Fassungen werden dadurch nicht rückwirkend umgedeutet.

## `1878f680…`: Pyramide und Prisma, 20 BE

Gegeben sind die Punkte $A(0|0|0)$, $B(6|0|0)$, $C(0|4|0)$ und $D(0|0|3)$. Sie bilden die Pyramide $ABCD$ mit Grunddreieck $ABC$ und Spitze $D$.

1. Zeigen Sie mit dem Skalarprodukt, dass das Dreieck $ABC$ bei $A$ rechtwinklig ist. (4 BE)
2. Berechnen Sie den Flächeninhalt des Grunddreiecks mit Einheit. (4 BE)
3. Bestimmen Sie die **senkrechte** Höhe und das Volumen der Pyramide. Berechnen Sie das Volumen eines geraden Dreiecksprismas mit genau derselben Grundfläche und senkrechten Höhe. Erläutern Sie das Verhältnis der beiden Volumina. Zur Plausibilisierung des Drittelfaktors können Sie einen Würfel betrachten, den drei Pyramiden mit gemeinsamer Ecke und je einer gegenüberliegenden Würfelfläche als Grundfläche ausfüllen. Erklären Sie, warum deren Volumina gleich sind. Eine Integralrechnung ist nicht verlangt. (6 BE)
4. Alle Punktkoordinaten werden mit $1{,}5$ multipliziert. Bestimmen Sie das neue Pyramidenvolumen und erklären Sie den Längen-, Flächen- und Volumenfaktor. (6 BE)

**Lösung und Rubrik:**

1. $\overrightarrow{AB}=(6,0,0)$ und $\overrightarrow{AC}=(0,4,0)$ (je 1 BE); ihr Skalarprodukt ist $0$ (1 BE), also stehen die Kanten senkrecht und das Dreieck ist bei $A$ rechtwinklig (1 BE).
2. $G=\tfrac12\cdot6\cdot4=12\,\mathrm{LE}^2$ (3 BE für Ansatz und Rechnung, 1 BE für Einheit und Bezug zur Grundfläche).
3. $ABC$ liegt in $z=0$ und $D$ senkrecht darüber, daher $h=3\,\mathrm{LE}$ (1 BE). $V_{\mathrm{Pyr}}=Gh/3=12\,\mathrm{LE}^3$ (1 BE), $V_{\mathrm{Prisma}}=Gh=36\,\mathrm{LE}^3$ (1 BE); gleiches $G$ und gleiches Lot-$h$ ergeben $V_{\mathrm{Pyr}}/V_{\mathrm{Prisma}}=1/3$ (1 BE). Im Würfel ordnet man jeden Innenpunkt derjenigen der drei gegenüberliegenden Seitenflächen zu, deren Koordinate am größten ist. Die drei so gebildeten quadratischen Pyramiden füllen den Würfel ohne Überlappung ihrer Innenräume; Achsenvertauschung bildet sie aufeinander ab, also sind ihre Volumina gleich (2 BE). Diese Würfelzerlegung **plausibilisiert** den Faktor; sie ist für sich noch kein allgemeiner Beweis der Formel für jede Dreieckspyramide.
4. Längenfaktor $k=1{,}5$ (1 BE), Flächenfaktor $k^2=2{,}25$ (1 BE), Höhenfaktor $k$ und damit Volumenfaktor $k^3=3{,}375$ geometrisch begründet (2 BE); $V'=12\cdot3{,}375=40{,}5\,\mathrm{LE}^3$ (2 BE).

**Vorläufige Coverage nach neuer Aufgabenfassung:** `9460c3ff…` durch 1, `5390691d…` durch 2, `5f548596…` durch die Körpergeometrie in 3 und `288633c1…` durch Vergleich, Formel und Drittel-Deutung in 3. Teil 4 ist Transfer innerhalb dieser Aufgabe, kein pauschaler Claim für ein LK-Ziel zur zentrischen Streckung. Diese vier Claims und faire Eingangs-`requires` brauchen eine unabhängige Reviewentscheidung.

## `2f8a3a90…`: Gerade, Ebene und Quader, 20 BE

Gegeben sind $g:\vec x=(1,2,3)+t(2,-1,1)$, die Ebene $E:x_1+x_2+x_3=9$ sowie der Quader $Q=[0,6]\times[0,4]\times[0,3]$. Das Streckenstück $s$ auf $g$ gehört zu $0\le t\le2$.

1. Prüfen Sie für $P=(5,0,5)$ und $R=(7,-1,6)$ jeweils, ob der Punkt auf der **Geraden** $g$ und auf dem **Streckenstück** $s$ liegt. Erklären Sie den Unterschied. (5 BE)
2. Bestimmen Sie den Schnittpunkt von $g$ und $E$ und begründen Sie, warum es genau einen gibt. Entscheiden Sie auch, ob dieser Punkt im Quader $Q$ liegt. (4 BE)
3. Bestimmen Sie die Normalenrichtung und die drei Achsenschnittpunkte von $E$. Prüfen Sie die Ebenenzugehörigkeit von $U=(6,0,3)$ und $O=(0,0,0)$. Fassen Sie daraus die räumliche Lage von $E$ zusammen und unterscheiden Sie die Achsenschnittpunkte von den Schnittpunkten mit den **begrenzten** Quaderkanten. (5 BE)
4. Bestimmen Sie **alle** Eckpunkte der Schnittfigur $E\cap Q$ durch Prüfung geeigneter Quaderkanten. Geben Sie die Randreihenfolge an, beschreiben Sie die Figur und begründen Sie, warum keine weiteren Ecken auftreten. Eine eigene beschriftete Skizze kann Ihre Erklärung unterstützen. (6 BE)

**Lösung und Rubrik:**

1. Aus der ersten Koordinate folgt für $P$ der Parameter $t=2$; die anderen Koordinaten ergeben ebenfalls $(0,5)$, also liegt $P$ auf $g$ und am Endpunkt von $s$ (2 BE). Für $R$ folgt $t=3$ und die anderen Koordinaten stimmen, also liegt $R$ auf $g$, aber **nicht** auf $s$ (2 BE). Die Gerade erlaubt alle reellen Parameter, die Strecke nur $0\le t\le2$ (1 BE).
2. Einsetzen ergibt $(1+2t)+(2-t)+(3+t)=6+2t=9$, somit $t=3/2$ und $S=(4,\tfrac12,\tfrac92)$ (2 BE). $\vec n=(1,1,1)$ erfüllt $\vec n\cdot(2,-1,1)=2\ne0$; daher ist $g$ nicht parallel zu $E$ und hat genau diesen einen Schnittpunkt (1 BE). Weil $S_3=4{,}5>3$, liegt $S$ außerhalb von $Q$ (1 BE).
3. $\vec n=(1,1,1)$ zeigt die Normalenrichtung (1 BE). Die Achsenschnittpunkte sind $(9,0,0)$, $(0,9,0)$ und $(0,0,9)$ (1 BE für alle drei). $U$ erfüllt $6+0+3=9$, $O$ erfüllt $0\ne9$ (je 1 BE). Die Ebene liegt mit positiver Normalenrichtung schräg zum positiven Achsenoktanten; ihre Achsenabschnitte liegen außerhalb des beschränkten Quaders, obwohl sie Quaderkanten schneidet (1 BE).
4. Auf Quaderkanten erhält man genau $A=(6,0,3)$, $B=(6,3,0)$, $C=(5,4,0)$ und $D=(2,4,3)$ (4 BE, je einer pro korrekt bestimmtem Punkt mit Kantenbedingung). In Randreihenfolge $A\to B\to C\to D\to A$ liegen benachbarte Punkte nacheinander auf den Flächen $x=6$, $z=0$, $y=4$ und $z=3$. Die Schnittfigur ist ein Viereck; alle übrigen der zwölf Quaderkanten haben entweder keinen zulässigen Schnittparameter oder treffen die Ebene in einem bereits erfassten Eckpunkt (2 BE). **Achsenabschnitte allein** beweisen weder die Zahl noch die Lage dieser Ecken.

**Vorläufige breite GK/LK-Coverage nach neuer Aufgabenfassung:** `7aa1abee…` durch 1 und `06de364f…` durch 3. Teil 2 prüft einen Geraden-Ebenen-Schnitt, doch das entsprechend benannte Atlas-Ziel `baf7276f…` ist aktuell nur in BW-LK Target und darf nicht ohne Scope-Prüfung bundesweit beansprucht werden. Die Polyeder-Schnittkompetenz `3aea4d33…` ist im aktuellen Atlas ebenfalls nur in BW-LK Target. Teil 4 wird deshalb hier nicht als breite direkte Coverage eines LK-only-Atoms ausgegeben. Für eine LK-spezifische Zuordnung sind eigene Quellen-/Ansichtsentscheidung und Review nötig.
