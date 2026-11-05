# Q2: direkte lokale Prüfungswege für 16 Mathematikziele

Maschinell geprüfte Aufgabenquellen für den lokalen Q2-Prüfungszweig. Jede Aufgabe prüft nur die in `applyMathQ2RouteRepairAssessments.mjs` einzeln angegebenen Ziele. Die Aufgaben sind keine menschliche Freigabe oder Erprobung. Rechenwege und Zuordnungen müssen unabhängig gegengeprüft werden; `released` in den Assessment-Daten bezeichnet nur den operativen maschinellen Aufgabenstatus.

## spat-volume

### Aufgabe

Ein Spat und ein Tetraeder haben den gemeinsamen Eckpunkt $O=(0|0|0)$ sowie die von $O$ ausgehenden Kantenendpunkte $A=(2|0|0)$, $B=(0|3|0)$ und $C=(1|0|4)$; alle Koordinaten sind in cm angegeben.

1. Wähle selbst drei Kantenvektoren ab $O$. Gib das Spatprodukt als Skalarprodukt mit einem Kreuzprodukt an und berechne seinen Wert. (4 BE)
2. Vertausche zwei der drei Vektoren. Erkläre das geänderte Vorzeichen und warum das Volumen des Spats trotzdem gleich bleibt. (4 BE)
3. Bestimme aus denselben Koordinaten die Volumina des Spats und des Tetraeders. Begründe den Sechstelfaktor für das Tetraeder. (4 BE)

### Lösung

Die Kanten sind $a=(2,0,0)$, $b=(0,3,0)$ und $c=(1,0,4)$. Es gilt $b\times c=(12,0,-3)$ und damit $[a,b,c]=a\cdot(b\times c)=24\,\mathrm{cm}^3$. Bei Vertauschung von $b$ und $c$ ergibt sich $[a,c,b]=-24\,\mathrm{cm}^3$: Das Vorzeichen kennzeichnet die Orientierung der geordneten Vektoren, der Betrag das geometrische Volumen. Die Spat-Grundfläche aus $a$ und $b$ misst $6\,\mathrm{cm}^2$, ihre senkrechte Höhe ist $4\,\mathrm{cm}$, also $V_{\mathrm{Spat}}=24\,\mathrm{cm}^3$. Beim konkreten Tetraeder $OABC$ ist das Dreieck $OAB$ die halbe Spat-Grundfläche mit $3\,\mathrm{cm}^2$; bei derselben senkrechten Höhe $4\,\mathrm{cm}$ gilt wegen des Pyramidenfaktors $1/3$ daher $V_{\mathrm{Tet}}=3\cdot4/3=4\,\mathrm{cm}^3=V_{\mathrm{Spat}}/6$.

## round-solids

### Aufgabe

Die Grundfläche eines geraden Zylinders liegt in $z=0$. Ihr Mittelpunkt ist $O=(0|0|0)$, der Punkt $R=(3|0|0)$ liegt auf dem Grundkreis und der Mittelpunkt des Deckkreises ist $T=(0|0|8)$. Ein gerader Kegel hat denselben Grundkreis und $T$ als Spitze. Eine Kugel hat Mittelpunkt $O$ und Oberflächenpunkt $R$. Alle Koordinaten sind in cm angegeben.

1. Ermittle Radius und senkrechte Höhe aus den Koordinaten. Berechne das Zylindervolumen und erkläre die Kreisfläche als konstante Grundfläche. (4 BE)
2. Berechne das Kegelvolumen. Deute den Faktor $1/3$ anhand des Zylinders mit derselben Grundfläche und derselben senkrechten Höhe. (4 BE)
3. Berechne das Kugelvolumen. Eine zweite Kugel hat den doppelten Radius: Bestimme auch ihr Volumen und begründe den Änderungsfaktor. (4 BE)

### Lösung

$r=|OR|=3\,\mathrm{cm}$ und $h=|OT|=8\,\mathrm{cm}$. Die kreisförmige Grundfläche hat $G=\pi r^2=9\pi\,\mathrm{cm}^2$; beim Zylinder sind parallele Querschnitte gleich groß, also $V_Z=Gh=72\pi\,\mathrm{cm}^3$. Für den Kegel gilt bei gleicher Grundfläche und Höhe $V_K=Gh/3=24\pi\,\mathrm{cm}^3=V_Z/3$. Die Kugel hat $V(3)=4\pi\cdot3^3/3=36\pi\,\mathrm{cm}^3$. Bei $r=6$ gilt $V(6)=4\pi\cdot6^3/3=288\pi\,\mathrm{cm}^3$ und $V(6)/V(3)=2^3=8$.

## volume-derivation-lk

### Aufgabe

Eine Pyramide hat Grundflächeninhalt $G>0$ und senkrechte Höhe $h>0$. Ein Schnitt parallel zur Grundfläche in Höhe $z$ über ihr ist ähnlich zur Grundfläche. Leite die Volumenformel $V=Gh/3$ aus den Querschnittsflächen mit einem geeigneten Integral her. Begründe dabei den quadratischen Faktor für die Schnittfläche und die Grenzen des Integrals. (12 BE)

### Lösung

Bei $z=0$ ist der Schnitt die Grundfläche, bei $z=h$ schrumpft er zur Spitze. Entsprechende Längen skalieren daher mit $1-z/h$, die Flächen mit dessen Quadrat: $A(z)=G(1-z/h)^2$ für $0\le z\le h$. Das Volumen ist
$$V=\int_0^h A(z)\,dz=G\int_0^h(1-2z/h+z^2/h^2)\,dz=G[z-z^2/h+z^3/(3h^2)]_0^h=Gh/3.$$
Die Grenzen sind Grundfläche und Spitze; das Ergebnis ist ein Drittel des Prismas gleicher Grundfläche und Höhe. Die Herleitung gilt auch ohne numerische Maße für eine beliebige Pyramide mit zueinander ähnlichen Parallelquerschnitten.

## dot-projection

### Aufgabe

Gegeben sind $a=(3,4,0)$ und $b=(4,0,0)$ mit $b\ne0$.

1. Bestimme die orthogonale Projektion von $a$ auf die Richtung von $b$ und den dazu senkrechten Rest. Prüfe die Orthogonalität. (4 BE)
2. Berechne $a\cdot b$ und veranschauliche die Definition $a\cdot b=|b|\,s$ mit der vorzeichenbehafteten Projektionslänge $s$ von $a$ auf $b$. Erkläre auch $s=|a|\cos\theta$. (6 BE)

### Lösung

$\operatorname{proj}_b(a)=((a\cdot b)/(b\cdot b))b=(12/16)b=(3,0,0)$, der Rest ist $(0,4,0)$ und hat Skalarprodukt $0$ mit $b$. Die gerichtete Projektionslänge ist $s=3$ und $|b|=4$, also $a\cdot b=4\cdot3=12$. Weil $|a|=5$, folgt $\cos\theta=3/5$ und $s=|a|\cos\theta$. Die Projektion liefert damit die geometrische Bedeutung der algebraischen Definition des Skalarprodukts.

## linear-projection

### Aufgabe

Die orthogonale Projektion $P$ auf die Ebene $z=0$ ist durch $P(x,y,z)=(x,y,0)$ gegeben.

1. Zerlege $v=(2,-1,3)$ in seinen Anteil in der Ebene und seinen dazu senkrechten Rest. (4 BE)
2. Zeige für beliebige Vektoren $u,w$ und jeden Skalar $\lambda$, dass $P(u+w)=P(u)+P(w)$ und $P(\lambda u)=\lambda P(u)$. Deute die Ebene als Bildraum und die $z$-Achse als Kern. (6 BE)

### Lösung

$P(v)=(2,-1,0)$ und $v-P(v)=(0,0,3)$; der Rest ist zu allen Vektoren der Ebene senkrecht. Für $u=(u_1,u_2,u_3)$ und $w=(w_1,w_2,w_3)$ gilt $P(u+w)=(u_1+w_1,u_2+w_2,0)=P(u)+P(w)$ und $P(\lambda u)=(\lambda u_1,\lambda u_2,0)=\lambda P(u)$. Jedem Vektor werden linear ein Ebenenanteil und ein senkrechter Rest zugeordnet. Alle Ebenenvektoren sind Bildwerte, und genau die Vektoren $(0,0,z)$ werden auf null abgebildet.

## vector-relations

### Aufgabe

Gegeben sind $u=(1,2,0)$, $v=(0,1,1)$, $w=(2,5,1)$, $p=(1,1,1)$, $q=(-2,-2,-2)$, $r=(3,3,4)$ und der Nullvektor $0$.

1. Prüfe rechnerisch und deute geometrisch, ob $u,v$ linear unabhängig sind und ob $u,v,w$ linear abhängig sind. (6 BE)
2. Prüfe, ob $p$ und $q$ sowie $p$ und $r$ kollinear sind. Deute die Richtung der Nichtnullvektoren. (4 BE)
3. Ordne den Nullvektor fachlich richtig ein: Ist er zu $p$ kollinear, und hat er selbst eine Richtung? Begründe die Antwort über skalare Vielfache. (4 BE)

### Lösung

Aus $\alpha u+\beta v=0$ folgt schon über die erste Koordinate $\alpha=0$, dann $\beta=0$: $u,v$ sind unabhängig und spannen eine Ebene auf. Es gilt $w=2u+v$, also $2u+v-w=0$ mit nichttrivialen Koeffizienten; die drei Vektoren sind abhängig und $w$ bringt keine neue Raumrichtung. Weiter ist $q=-2p$, sodass $p,q$ kollinear, aber entgegengesetzt gerichtet sind. $r$ ist kein skalares Vielfaches von $p$, weil der Faktor aus den ersten beiden Koordinaten $3$, aus der dritten jedoch $4$ wäre. Schließlich gilt $0=0\cdot p$: Der Nullvektor ist kollinear zu jedem Vektor, besitzt selbst aber keine bestimmte Richtung.

## plane-coordinates

### Aufgabe

Gegeben ist die Ebene $E:x+2y+z=6$ sowie $A=(2,1,2)$ und $B=(1,1,1)$.

1. Bestimme die drei Achsenschnittpunkte und einen Normalenvektor. Erkläre, welche Richtung dieser Vektor angibt. (5 BE)
2. Prüfe, welcher der Punkte $A$ und $B$ auf $E$ liegt. Führe Achsenschnittpunkte, Normalenrichtung und Punktprobe zu einer begründeten räumlichen Lagebeschreibung der Ebene zusammen. (7 BE)

### Lösung

Die Achsenschnittpunkte sind $(6,0,0)$, $(0,3,0)$ und $(0,0,6)$. $n=(1,2,1)$ ist normal zu $E$, also senkrecht zu jeder Richtung innerhalb der Ebene. Für $A$ ergibt sich $2+2\cdot1+2=6$, daher $A\in E$; für $B$ ergibt sich $1+2\cdot1+1=4$, daher $B\notin E$. Die Ebene schneidet alle drei positiven Koordinatenachsen, und der Normalenvektor zeigt die Richtung des stärksten Anstiegs der linken Seite $x+2y+z$; der Ursprung liegt auf der Seite mit kleinerem Wert als $6$.

## line-plane-intersection

### Aufgabe

Eine Flugbahn wird durch $g:X=(1,0,2)+t(1,2,-1)$ beschrieben. Eine Messfläche liegt in $E:x+y+z=6$.

1. Bestimme den Schnittpunkt von $g$ und $E$ durch Einsetzen. Prüfe ihn in beiden Gleichungen. (6 BE)
2. Begründe geometrisch mit Richtungsvektor und Ebenennormale, warum es genau einen Schnittpunkt gibt. Deute den Parameterwert auf der Flugbahn. (4 BE)

### Lösung

Einsetzen ergibt $(1+t)+2t+(2-t)=3+2t=6$, also $t=3/2$ und $S=(5/2,3,1/2)$. In der Ebene gilt $5/2+3+1/2=6$; in der Geraden entsteht genau dieser Punkt bei $t=3/2$. Der Richtungsvektor $v=(1,2,-1)$ hat mit $n=(1,1,1)$ das Skalarprodukt $n\cdot v=2\ne0$, daher verläuft die Bahn nicht parallel zur Messfläche und durchstößt sie genau einmal. $t=3/2$ bezeichnet die Lage dieses Punkts auf der parametrierten Flugbahn; ohne Zeiteinheit ist es keine physikalische Flugzeit.

## skew-lines-distance

### Aufgabe

Zwei Stabachsen im Raum liegen auf $g:(t,0,0)$ und $h:(0,s,2)$, mit $t,s\in\mathbb R$; die Koordinaten sind in cm angegeben.

1. Untersuche ihre Lagebeziehung und begründe, warum sie windschief sind. (4 BE)
2. Bestimme den kürzesten Abstand der Geraden durch ein analytisches Minimum. Gib die beiden nächsten Punkte an und deute das Ergebnis geometrisch. (6 BE)

### Lösung

Die Richtungsvektoren $(1,0,0)$ und $(0,1,0)$ sind nicht parallel. Wegen der konstant verschiedenen $z$-Koordinaten $0$ und $2$ gibt es keinen Schnittpunkt; die Geraden sind windschief. Für $P=(t,0,0)$ und $Q=(0,s,2)$ gilt $|P-Q|^2=t^2+s^2+4\ge4$. Das Minimum liegt bei $t=s=0$, also bei $P=(0,0,0)$ und $Q=(0,0,2)$. Die Verbindung ist senkrecht zu beiden Geraden und hat Länge $2\,\mathrm{cm}$.

## parallel-planes-distance

### Aufgabe

Eine Leitung verläuft auf $k:(t,1,4)$; zwei parallele Wände sind die Ebenen $E:z=0$ und $F:z=5$ (Koordinaten in m).

1. Bestimme den kürzesten Abstand von $k$ zu $E$. Begründe, warum die Gerade parallel zur Ebene verläuft und die gefundene Verbindung minimal ist. (5 BE)
2. Bestimme den Abstand von $E$ zu $F$. Begründe ebenfalls die Minimalität und deute die Normalenrichtung. (5 BE)

### Lösung

Alle Punkte von $k$ haben $z=4$, und ihr Richtungsvektor $(1,0,0)$ ist orthogonal zur Ebenennormalen $(0,0,1)$; die Gerade ist zu $E$ parallel. Die senkrechte Verbindung etwa von $(0,1,4)$ nach $(0,1,0)$ hat Länge $4\,\mathrm m$. Jede andere Verbindung besitzt zusätzlich horizontale Komponenten und ist daher nicht kürzer. $E$ und $F$ haben dieselbe Normale und unterscheiden sich konstant um $5$ in $z$-Richtung; daher ist ihr Abstand $5\,\mathrm m$, etwa zwischen $(0,0,0)$ und $(0,0,5)$, senkrecht zu beiden Ebenen.

## geometry-software

### Aufgabe

Konstruiere in einer 3D-Geometriesoftware einen Quader mit den Eckpunkten $O=(0,0,0)$, $A=(4,0,0)$, $B=(4,3,0)$, $C=(0,3,0)$ und den jeweils um $(0,0,2)$ verschobenen oberen Ecken $O',A',B',C'$. Reiche zwei selbst erzeugte Ansichten als Screenshot oder Datei ein: eine in Blickrichtung der $x$-Achse und eine in Blickrichtung der $y$-Achse.

1. Markiere $B'$ im Modell und prüfe seine Koordinaten mit dem Softwarewerkzeug. (4 BE)
2. Vergleiche die beiden Ansichten: Welche zwei Ausdehnungen bleiben jeweils sichtbar, welche liegt in Blickrichtung und verschwindet in der Projektion? Begründe dies mit den Koordinaten. (6 BE)

### Lösung

Die obere Ecke ist $B'=(4,3,2)$. Eine gültige Abgabe zeigt einen selbst konstruierten Quader und zwei unterscheidbare Softwareansichten mit markierter Ecke und Koordinatenprüfung; bloße Textbeschreibung ersetzt diese Artefakte nicht. In Blickrichtung $x$ sieht man die $y$-$z$-Ausdehnungen $3\times2$, während die $x$-Länge $4$ in Blickrichtung liegt. In Blickrichtung $y$ sieht man die $x$-$z$-Ausdehnungen $4\times2$, während die $y$-Länge $3$ in Blickrichtung liegt. Die Koordinaten der Eckpunkte bleiben dieselben, nur die Projektion der Ansicht ändert sich.

## figure-properties

### Aufgabe

Gegeben sind die Vierecke $V$ mit Ecken $(0,0),(4,0),(4,3),(0,3)$ und $W$ mit Ecken $(0,0),(8,0),(8,6),(0,6)$, jeweils in Umlaufrichtung.

1. Begründe aus Seitenrichtungen und Winkeln, dass $V$ ein Rechteck, aber kein Quadrat ist. (4 BE)
2. Begründe mit einer konkreten Abbildung, dass $V$ und $W$ ähnlich sind. Entscheide, ob sie kongruent sind, und belege die Entscheidung durch Seitenlängen. (5 BE)
3. Eine Person behauptet: „Bei Vierecken genügen vier gleich lange entsprechende Seiten immer für Kongruenz.“ Widerlege dies mit einem fachlichen Gegenbeispiel und benenne die fehlende Information. (3 BE)

### Lösung

Benachbarte Seitenvektoren von $V$ sind $(4,0)$ und $(0,3)$; ihr Skalarprodukt ist $0$, die gegenüberliegenden Seiten sind paarweise parallel. Damit ist $V$ ein Rechteck. Die benachbarten Seitenlängen $4$ und $3$ sind verschieden, also ist es kein Quadrat. Die zentrische Streckung um den Ursprung mit Faktor $2$ bildet jeden Eckpunkt von $V$ auf den entsprechenden Eckpunkt von $W$ ab: Die Figuren sind ähnlich, aber wegen der Seitenlängen $4,3$ gegenüber $8,6$ nicht kongruent. Ein Quadrat und eine nichtquadratische Raute können je vier Seiten der Länge $1$ haben, aber unterschiedliche Innenwinkel; vier Seitenlängen allein legen ein allgemeines Viereck nicht bis auf Kongruenz fest.
