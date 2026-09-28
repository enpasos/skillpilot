# Q2-Prüfungsaufgaben · fachliche Kandidaten, nicht veröffentlicht

Alle Aufgaben sind eigenständige **AI-Kandidaten**. BE sind Bewertungseinheiten, nicht eine Freigabe. Die Zuordnung von `requires` und `coveredGoalIds` steht in `candidate-routes.json`. Bei Zeichen- und Softwareleistungen muss die tatsächliche Abgabe (Foto/Screenshot/Datei) beurteilt werden; eine mündliche Beschreibung ersetzt sie nicht.

## Bestehende Aufgabe `1878f680…`: enger korrigieren

Die Punkte A(0|0|0), B(6|0|0), C(0|4|0), D(0|0|3) und die Teile 1, 2 und 4 bleiben. **Teil 3** lautet neu: „Bestimmen Sie die senkrechte Höhe und das Volumen der Pyramide ABCD. Berechnen Sie auch das Volumen eines geraden Prismas mit demselben Grunddreieck ABC und derselben senkrechten Höhe. Erklären Sie anhand dieser Körpereigenschaften, warum das Pyramidenvolumen ein Drittel des Prismenvolumens beträgt.“ So wird auch das allgemeine Volumenziel `5f548596…` ausdrücklich befragt; ohne diesen Satz darf es nicht als geprüft gelten.

Lösung: Teil 1: AB=(6,0,0), AC=(0,4,0), Skalarprodukt 0, rechtwinklig bei A. Teil 2: G=6·4/2=12 LE². Teil 3: Grundebene z=0, senkrechte Höhe h=3 LE; Pyramide V=G·h/3=12 LE³; Vergleichsprisma V=G·h=36 LE³; bei **gleicher Grundfläche und gleicher senkrechter Höhe** ist 12/36=1/3. Teil 4: Längenfaktor 1,5, Flächenfaktor 1,5²=2,25, Volumenfaktor 1,5³=3,375; neues Volumen 40,5 LE³.

20 BE bleiben in vier Rubrikschritten **4/4/6/6**: (1) zwei Vektoren, Skalarprodukt und Schluss 4; (2) rechtwinklige Dreiecksfläche 4; (3) Höhe 1, Pyramidenvolumen 2, Prismenvolumen 1, fachlich richtiger Volumenvergleich 2; (4) Längen-/Flächen-/Volumenskalierung 4 und neuer Wert mit Begründung 2. In beiden Listen `requires` und `coveredGoalIds` stehen nur `9460c3ff…`, `5390691d…`, `288633c1…`, `5f548596…`. `coveredStrands` und ggf. `dimensionTags.guidingIdeas` sind auf `L3` einzugrenzen; alle vier Ziele tragen L3. Die bisherigen 43er-Listen und L1–L4-Metadaten sind durch diese konkrete Aufgabe nicht gedeckt.

## q2-volume-five-solids

Aufgabe (20 BE):

1. Das Grunddreieck eines geraden Prismas hat die Eckpunkte A=(0,0,0), B=(6,0,0), C=(0,8,0) cm; sein Deckdreieck entsteht durch Verschiebung um (0,0,5) cm. Fertigen Sie eine kleine beschriftete Skizze an, bestimmen Sie Grundfläche und senkrechte Höhe aus den Koordinaten und berechnen Sie das Volumen. (3)
2. Ein Spat besitzt den Eckpunkt O=(0,0,0) und die drei benachbarten Eckpunkte U=(2,0,0), V=(0,3,0), W=(1,0,4) cm. **Wählen Sie selbst** die drei passenden Kantenvektoren ab O, berechnen Sie per Spatprodukt das Volumen des Spats und des Tetraeders mit denselben drei Kanten und erläutern Sie den Sechstelfaktor. (6)
3. Die Grundkreis-Mitte eines geraden Zylinders ist O=(0,0,0), der Punkt R=(3,0,0) liegt auf dem Grundkreis; die Deckkreis-Mitte ist T=(0,0,10) cm. Skizzieren und beschriften Sie Grundkreis und senkrechte Höhe, bestimmen Sie Radius und Höhe aus den Koordinaten und berechnen Sie das Volumen. (3)
4. Ein gerader Kegel hat **denselben** Grundkreis wie der Zylinder aus Teil 3 und die Spitze T=(0,0,10). Bestimmen Sie aus der Skizze Radius und senkrechte Höhe, berechnen Sie das Volumen und erläutern Sie den Drittelfaktor als Vergleich bei gleichem G und h. (4)
5. Eine Kugel hat Mittelpunkt O=(0,0,0) und Oberflächenpunkt P=(3,0,0); eine zweite Kugel hat denselben Mittelpunkt und Oberflächenpunkt Q=(6,0,0). Bestimmen Sie beide Radien aus den Koordinaten, berechnen Sie beide Volumina und erklären Sie den Faktor beim Verdoppeln des Radius. (4)

Lösung/Rubrik: (1) Beschriftete Skizze mit Grunddreieck und senkrechter Höhe **h=5**; G=6·8/2=24 cm² (1), V=G·5=120 cm³ (1), Grundfläche-mal-senkrechte-Höhe aus Skizze/Koordinaten sachlich erläutert (1). (2) Die **selbst gewählten** Kantenvektoren a=OU=(2,0,0), b=OV=(0,3,0), c=OW=(1,0,4) sind geeignet (2); b×c=(12,0,−3), |a·(b×c)|=24 (2); Spat 24 cm³ (1), Tetraeder 24/6=4 cm³ und Faktor 1/6 erläutert (1). (3) |OR|=3, |OT|=10 und OT senkrecht zur Grundebene; G=π·3²=9π cm² (1), V=9π·10=90π cm³ (1), beschriftete Skizze/konstante kreisförmige Querschnitte erläutert (1). (4) V=π·3²·10/3=30π cm³ (2), 30π/90π=1/3 nur wegen gleichen Grundkreises und gleicher senkrechter Höhe (2). (5) |OP|=3 und |OQ|=6, V(3)=4π·27/3=36π cm³ und V(6)=4π·216/3=288π cm³ (je 1), Radiusverdopplung bewirkt kubischen Volumenfaktor 2³=8 (2).

## q2-volume-derivation-transform-lk

Aufgabe (20 BE), **nur LK**:

1. Eine Pyramide hat Grundfläche G und senkrechte Höhe h. In Höhe z über der Grundfläche ist ihr paralleler Querschnitt ähnlich zur Grundfläche. Leiten Sie aus dem Querschnittsinhalt mittels Integral die Volumenformel her und erklären Sie den Quadratexponenten. (10)
2. Die lineare Abbildung T(x,y,z)=(2x,y,3z) transformiert eine Pyramide mit Grundfläche G=12 LE² in z=0 und Höhe 3 LE. Begründen Sie mit der Abbildung von Vektoren oder dem Determinantenfaktor die Änderungen von Grundfläche, Höhe und Volumen; prüfen Sie beide Rechenwege. (10)

Lösung/Rubrik: (1) Längen im Schnitt skalieren mit (1−z/h) (2); ähnliche Flächen daher A(z)=G(1−z/h)² (3); Integral von 0 bis h ist G·[z−z²/h+z³/(3h²)]₀ʰ=Gh/3 (3); Geometrie und Drittelfaktor fachlich erläutert (2). (2) T hat Matrix diag(2,1,3), Determinante 6, also Volumenfaktor 6 (4); die Grundfläche in z=0 wächst mit Faktor 2 und die senkrechte Höhe mit Faktor 3 (3); Ausgangsvolumen 12, neues 72 LE³ sowohl via 6·12 als auch (2·12)·(3·3)/3 (3). Kein bloßes „alle Längen sechsmal“.

## q2-coordinates-vectors-metric

Aufgabe (20 BE): Gegeben sind A=(1,2,−1), B=(4,6,1), C=(−1,3,2).

1. Verorten Sie A, B, C **und die Ortsvektoren OA und OB** in einer eigenen beschrifteten 3D-Koordinatenskizze und reichen Sie diese ein. Erläutern Sie das negative z von A sowie Punktkoordinate, Ortsvektor und Verschiebungsvektor als unterschiedliche Bedeutungen derselben bzw. verschiedener Tupel. (4)
2. Bestimmen Sie die Verschiebungsvektoren u=AB und v=AC **aus den Punktkoordinaten**. Kennzeichnen Sie einen davon zusätzlich als Pfeil in Ihrer Skizze. (4)
3. Berechnen Sie u+v, 2u und 2u−v. Deuten Sie insbesondere 2u als Streckung der Verschiebung u auf die doppelte Länge bei unveränderter Richtung und 2u−v als Verkettung. (4)
4. Bestimmen Sie den Betrag von u und die Streckenlänge AB; begründen Sie die Übereinstimmung. (4)
5. Formulieren Sie das Skalarprodukt **selbst** sowohl über Vektorkomponenten als auch über Beträge und den eingeschlossenen Winkel (für von null verschiedene Vektoren). Berechnen Sie u·v über Komponenten und ermitteln Sie daraus cosθ zwischen u und v; erklären Sie die Übereinstimmung der beiden Darstellungen. (4)

Lösung/Rubrik: (1) A liegt eine Einheit unter z=0, B und C darüber; korrektes Achsensystem, drei Punkte und OA/OB als Pfeile vom Ursprung (2), negative z-Koordinate und Unterschied Punkt/Orts-/Verschiebungsvektor erklärt (2). (2) u=(3,4,2) und v=(−2,1,3) (je 1), Punktdifferenz als Verschiebung erklärt (1), passender Pfeil A→B oder A→C in eigener Skizze (1). (3) u+v=(1,5,5), 2u=(6,8,4), 2u−v=(8,7,1) (je 1); 2u ist gleiche Richtung und doppelte Länge, 2u−v eine Verkettung von Verschiebungen statt eines Punkts ohne Startpunkt (1). (4) |u|=√(3²+4²+2²)=√29 (2), AB=√29 (1), räumlicher Satz des Pythagoras und Zusammenhang begründet (1). (5) Beide Definitionen (je 1), u·v=−6+4+6=4 (1), |v|=√14 und cosθ=4/(√29·√14)=4/√406 aus der Winkeldefinition (1).

## q2-vector-combination-dependence

Aufgabe (20 BE): u=(1,2,0), v=(0,1,1), w=(2,5,1), p=(1,1,1), q=(3,3,3), r=(3,3,4).

1. Stellen Sie w als Kombination aus u und v dar. Skizzieren Sie die beiden Richtungen und erklären Sie geometrisch, weshalb w in der von u und v aufgespannten Ebene liegt. (8)
2. Entscheiden und begründen Sie, ob u,v allein bzw. u,v,w linear unabhängig sind. Deuten Sie beide Ergebnisse geometrisch als aufgespannte Ebene bzw. zusätzlichen oder fehlenden Raumpfeil. (6)
3. Prüfen Sie die Kollinearität von p mit q und von p mit r. Deuten Sie jeweils die Richtung/Lage der entsprechenden Pfeile geometrisch. (6)

Lösung/Rubrik: (1) w=2u+v=(2,5,1) (4); zwei u-Schritte und ein v-Schritt führen in derselben Ebene zur Resultierenden, durch u und v geometrisch aufgespannt (4). (2) u,v unabhängig, denn die erste Koordinate von αu+βv=0 erzwingt α=0 und dann β=0; geometrisch nicht parallel, sie spannen eine Ebene auf (3); u,v,w abhängig, weil 2u+v−w=0 nichttrivial und w keinen neuen Raumrichtungsanteil liefert (3). (3) q=3p, also gleicher Strahl/dieselbe Richtung und kollinear (3); r kann kein Vielfaches von p sein, da die ersten Komponenten Faktor 3, die dritte aber 4 ergeben, also keine gemeinsame Richtungslinie (3).

## q2-lines-planes-intersections

Aufgabe (20 BE): P=(1,0,0), Q=(2,1,1); h: X=(0,1,0)+s(1,1,1); k: X=(2,1,1)+u(0,1,0); E: x+y+z=4. Die Gerade g ist **nicht vorgegeben**, sondern aus P und Q herzuleiten.

1. Die Gerade g geht durch P=(1,0,0) und Q=(2,1,1). Stellen Sie **aus diesen beiden Punkten** eine Parameterform auf und beschreiben Sie das zu 0≤t≤2 gehörende Streckenstück mit beiden Endpunkten; erklären Sie t. (5)
2. Bestimmen Sie Normalenvektor und Achsenabschnitte von E, prüfen Sie die Zugehörigkeit von (2,1,1) und (0,0,0) und nutzen Sie diese Angaben zur räumlichen Orientierung. (5)
3. Untersuchen Sie die Lage von g zu h und k, indem Sie **beide Gleichungssysteme aus den drei Koordinatengleichungen systematisch aufstellen und lösen**. Geben Sie Lagebeziehung, ggf. Schnittpunkt und den entscheidenden Widerspruch bzw. die Parameterwerte an. (5)
4. Bestimmen Sie den Schnitt von g und E durch Einsetzen und prüfen Sie das Ergebnis in beiden Darstellungen. **Deuten** Sie geometrisch, warum g die Ebene in genau einem Punkt schneidet und nicht parallel zu ihr verläuft. (5)

Lösung/Rubrik: (1) Q−P=(1,1,1), daher g:P+t(Q−P); Start (1,0,0), Ende für t=2 ist (3,2,2), t bewegt entlang der Geraden, das Intervall begrenzt das Segment (2+2+1). (2) n=(1,1,1), positive Achsenabschnitte (4,0,0),(0,4,0),(0,0,4) (2); (2,1,1) liegt auf E, der Ursprung nicht (2); E schneidet alle positiven Achsen und hat die angegebene Normalenrichtung (1). (3) Für einen gemeinsamen Punkt von g und h müsste gelten: 1+t=s, t=1+s, t=s; die erste und dritte Gleichung widersprechen sich, also verschieden parallel (2). Für einen gemeinsamen Punkt von g und k gilt: 1+t=2, t=1+u, t=1; konsistent mit t=1,u=0, also Schnittpunkt (2,1,1) (3). (4) Einsetzen ergibt 1+3t=4, also t=1 und S=(2,1,1) (2); Punktprobe in g und E, Koordinatensumme 4 (2); n·(1,1,1)=3≠0, daher g nicht parallel zu E und S der einzige gemeinsame Punkt (1).

## q2-projection-mirror-point-distance

Aufgabe (20 BE): a=(3,4,0), b=(4,0,0), Q=(3,4,5), x-Achse g={(t,0,0)}, Ebene E:z=0.

1. Bestimmen Sie die orthogonale Projektion von a auf die Richtung b, den senkrechten Rest und a·b. Erklären Sie den Zusammenhang zwischen Projektionslänge und Skalarprodukt. (5)
2. Untersuchen Sie P(x,y,z)=(x,0,0): Zerlegen Sie a in P(a) und senkrechten Rest; zeigen Sie an allgemeinen Vektoren die Additivität und Homogenität von P als einfache lineare Abbildung. (5)
3. Bestimmen Sie den Abstand von Q zur Geraden g, einschließlich Fußpunkt und Minimalitätsbegründung. (5)
4. Spiegeln Sie Q an E und prüfen Sie das Resultat über Mittelpunkt und senkrechten Verbindungsvektor. (5)

Lösung/Rubrik: (1) proj_b(a)=(a·b)/(b·b)b=(3,0,0), Rest (0,4,0), a·b=12=|b|·3=|a|·|b|cosθ, denn die vorzeichenbehaftete Projektionslänge von a auf b ist |a|cosθ=3; der Rest ist orthogonal zu b. (2) P(a)=(3,0,0), Rest (0,4,0); P(u+v)=(u₁+v₁,0,0)=P(u)+P(v), P(λu)=λP(u), Rest steht auf der x-Achse senkrecht. (3) F=(3,0,0), QF=(0,4,5), Abstand √41; für beliebiges (t,0,0) ist das Abstandsquadrat (t−3)²+41≥41. (4) Q'=(3,4,−5), Mittelpunkt (3,4,0)∈E, QQ'=(0,0,−10) normal zu E.

## q2-skew-lines-parallel-plane-distance

Aufgabe (20 BE): g={(t,0,0)}, h={(0,s,2)}, E:z=0, F:z=5, k={(t,1,4)}.

1. Zeigen Sie, dass g und h windschief sind, und bestimmen Sie ihren kürzesten Abstand **mit Minimalitätsbegründung**. (10)
2. Bestimmen Sie d(k,E) und d(E,F) und erklären Sie jeweils, warum eine senkrechte Verbindung minimal ist. (10)

Lösung/Rubrik: (1) Richtungen (1,0,0) und (0,1,0) nicht parallel; wegen z=0 bzw. z=2 kein Schnitt (3); für P=(t,0,0), Q=(0,s,2) ist |PQ|²=t²+s²+4≥4, Minimum bei t=s=0, also d=2 (7). (2) k parallel zu E, weil jeder Punkt z=4 hat und sein Richtungsvektor z-Komponente 0; d(k,E)=4 (5). E und F sind parallel mit gleichem Normalenvektor (0,0,1) und konstantem z-Unterschied 5; d(E,F)=5 (5).

## q2-cuboid-spatial-representations

Aufgabe (35 BE): Ein Quader hat O=(0,0,0), A=(4,0,0), B=(4,3,0), C=(0,3,0); die oberen Punkte O′, A′, B′, C′ liegen jeweils 2 Einheiten senkrecht darüber.

1. Geben Sie die Koordinaten aller oberen Punkte an und verorten Sie B′ relativ zu O sowie zu den drei Achsen. (4)
2. Zeichnen und beschriften Sie **selbst** ein Schrägbild: x-z-Vorderfläche 4×2 in wahrer Länge, y-Tiefenkanten bei 45° mit halber Länge 1,5; verdeckte Kanten gestrichelt. Reichen Sie die Zeichnung als Foto/Datei ein. (6)
3. Konstruieren Sie den Quader in einer 3D-Geometriesoftware. Drehen Sie die Ansicht einmal in Blickrichtung x und einmal y, prüfen Sie B′ und benennen Sie je die sichtbaren zwei Ausdehnungen. Reichen Sie zwei Ansichten/Screenshots ein. (6)
4. Beschreiben Sie Körperart, Anzahl von Ecken, Kanten und Flächen sowie die drei Kantenlängen des Ausgangskörpers. **Erkennen Sie anschließend fünf weitere Körper aus folgenden Koordinatenmodellen**; fertigen Sie dazu kleine Kantenskizzen an und erläutern Sie die unterscheidende Lage von Seitenkanten bzw. Spitze: (a) alle acht Punkte mit x,y,z∈{0,2}; (b) Grunddreieck (0,0,0),(4,0,0),(0,3,0) und Deckdreieck durch Verschiebung jedes Eckpunkts um (0,0,2); (c) dasselbe Grunddreieck, aber Verschiebung um (1,0,2); (d) Quadratgrundfläche (0,0,0),(4,0,0),(4,4,0),(0,4,0), Spitze (2,2,3); (e) dieselbe Grundfläche, Spitze (3,2,3). Benennen Sie Würfel, gerades/schiefes Prisma und gerade/schiefe Pyramide und unterscheiden Sie bei (d) ausdrücklich Lot-Höhe von Seitenkante. (14)
5. Für eine **zweite Darstellung desselben Quaders** soll nun seine 3×2-Stirnfläche als Vorderfläche (Koordinatenebene y=0) dienen; die bisherige 4er-Kante liegt in Blickrichtung. Wählen Sie selbst einen passenden Ursprung und die positiven x-, y-, z-Richtungen am Körper. Geben Sie in Ihrem System die Koordinaten der vier Vorderflächenecken und der **Ihrem Ursprung räumlich gegenüberliegenden Ecke** an. Begründen Sie, warum die Tiefenausdehnung 4 in der Vorderansicht verschwindet. Mehrere geometrisch richtige Achsenwahlen sind möglich. (5)

Lösung/Rubrik: (1) O′=(0,0,2), A′=(4,0,2), B′=(4,3,2), C′=(0,3,2); B′ liegt bei x=4,y=3,z=2 (4). (2) Vorderfläche 4×2, konsistente 45°-Tiefe mit Zeichnungslänge 1,5, richtige Verbindung/gestrichelte verdeckte Kanten, lesbare Beschriftung; 2+2+1+1 BE. (3) korrektes 3D-Modell und B′ (2), in x-Blickrichtung bleiben 3×2 (y-z), in y-Blickrichtung 4×2 (x-z), je 2 samt eigener Screenshot-Evidenz; die dritte Kantenlänge verschwindet jeweils in Blickrichtung. (4) Ausgangskörper Quader mit 8 Ecken, 12 Kanten, 6 Rechteckflächen und Längen 4,3,2 (3); (a) Würfel, (b) gerades und (c) schiefes Dreiecksprisma, (d) gerade und (e) schiefe quadratische Pyramide, **je 1 BE** für korrekte Identifikation und **je 1 BE** für geometrisch passende Skizze samt unterscheidender Seitenkanten-/Spitzenlage (10); bei (d) ist **die Höhe** vom Mittelpunkt zur Spitze senkrecht zur Grundfläche, nicht die Pyramiden-Seitenkante (1). (5) Beispielsweise liegt ein neu gewählter Ursprung an einer unteren Ecke der 3×2-Stirnfläche, x läuft entlang deren 3er-Kante, z nach oben und y entlang der 4er-Tiefe. Dann sind die Vorderflächenecken (0,0,0), (3,0,0), (3,0,2), (0,0,2) und eine gegenüberliegende obere Ecke (3,4,2) (2 für begründete eigene Achsen-/Ursprungswahl, 2 für dazu konsistente Koordinaten, 1 für verschwindende Blickrichtungs-Kante). Jede andere konsistente Wahl zählt gleichwertig. Eine reine Textbehauptung ohne eigene Skizze und Softwareansichten belegt Teile 2–4 nicht vollständig.

## q2-body-length-angle-family

Aufgabe (20 BE): Vergleichen Sie sechs Körper in einem Koordinatensystem. Verwenden Sie Verbindungsvektoren und Winkel **zur Grundebene** z=0; unterscheiden Sie stets die Länge einer schiefen Kante von der senkrechten Höhe. Eine kleine Skizze der Grundfläche und der betrachteten Verbindung ist Teil Ihrer Begründung.

1. Ein Würfel reicht von (0,0,0) bis (2,2,2); ein Quader von (0,0,0) bis (4,3,2). Berechnen Sie jeweils Länge und Winkel der Raumdiagonale vom Ursprung zur Grundebene. (6)
2. Zwei Dreiecksprismen besitzen dieselbe Grundfläche (0,0,0),(4,0,0),(0,3,0). Bei R₁ entsteht die Deckfläche durch Verschiebung um (0,0,2), bei R₂ um (1,0,2). Berechnen und deuten Sie für beide die vom Ursprung ausgehende Verbindungskante, ihren Winkel zur Grundebene und die senkrechte Körperhöhe. (7)
3. Zwei Pyramiden besitzen die quadratische Grundfläche (0,0,0),(4,0,0),(4,4,0),(0,4,0). Ihre Spitzen sind S₁=(2,2,3) und S₂=(3,2,3). Berechnen und deuten Sie vom Ursprung aus Seitenkantenlänge, Seitenkantenwinkel zur Grundebene und senkrechte Höhe. Erklären Sie, weshalb keine der beiden Seitenkanten selbst die Höhe ist. (7)

Lösung/Rubrik: (1) Würfel: d=(2,2,2), |d|=2√3, α=arcsin(2/(2√3))≈35,3° (3). Quader: d=(4,3,2), |d|=√29, α=arcsin(2/√29)≈21,8° (3). (2) R₁: Verbindungskante (0,0,2), Länge 2, Winkel 90° und Höhe 2 (3). R₂: Verbindungskante (1,0,2), Länge √5, Winkel arctan(2/1)≈63,4°, aber Lot-Höhe weiterhin 2 (3); der x-Anteil erklärt den Unterschied zwischen schiefer Kante und Höhe (1). (3) Gerade Pyramide: Seitenkante OS₁=(2,2,3), Länge √17, Winkel arctan(3/√8)≈46,7° (3). Schiefe Pyramide: OS₂=(3,2,3), Länge √22, Winkel arctan(3/√13)≈39,8° (3). Beide haben Lot-Höhe 3; die Höhenvektoren von (2,2,0) bzw. (3,2,0) zur jeweiligen Spitze sind (0,0,3), nicht die schiefen Seitenkanten (1). Bewertet werden jeweils Rechnung und Erklärung der Körpergeometrie, nicht bloß Zahlen.

## q2-cuboid-body-properties

Aufgabe (38 BE): Ein achsenparalleler Quader Q misst 4×3×2 LE; seine Koordinaten laufen von O=(0,0,0) bis B′=(4,3,2). Die gerade quadratische Pyramide P besitzt die Grundfläche (0,0,0),(4,0,0),(4,4,0),(0,4,0) und die Spitze S=(2,2,3). Das schiefe Dreiecksprisma R hat das Grunddreieck (0,0,0),(4,0,0),(0,3,0) und das Deckdreieck durch Verschiebung um (1,0,2).

1. Berechnen Sie die Raumdiagonale des Quaders und den Winkel dieser Diagonale zur Grundfläche z=0. Berechnen Sie außerdem die Länge einer Seitenkante der Pyramide und deren Winkel zur Grundfläche. (6)
2. Beschreiben und begründen Sie an Q je ein Paar paralleler und orthogonaler Kanten sowie paralleler und orthogonaler Flächen. Ermitteln Sie an R, welche Verbindungskanten **untereinander** parallel sind, obwohl sie **nicht senkrecht auf der Grundfläche** stehen. (6)
3. Bestimmen Sie alle Spiegelebenen und Halbdrehachsen von Q; begründen Sie, warum x und y nicht vertauscht werden können. Bestimmen Sie außerdem **alle** Spiegelebenen und die Drehachse von P und erläutern Sie die 90°-Drehsymmetrie. (7)
4. Begründen Sie an Q, warum gegenüberliegende Flächen kongruent sind und drei doppelte Rechtecksflächen zum Oberflächenansatz gehören. Begründen Sie an R, warum Grund- und Deckdreieck kongruent und parallel sind, obwohl die Verbindungskanten schief stehen; vergleichen Sie deren Lot-Höhe mit der Kantenlänge. **Begründen Sie an P zusätzlich, warum alle vier Seitenkanten gleich lang sind, aber keine von ihnen die Körperhöhe ist.** (7)
5. Berechnen Sie Mantel- **und** gesamten Oberflächeninhalt des Quaders, bezogen auf die 4×3-Grundfläche. (4)
6. Untersuchen Sie zusätzlich einen geraden Kreiszylinder und einen geraden Kreiskegel mit Radius 2 und Höhe 3. Die Grundkreise liegen jeweils horizontal. Bestimmen und beschreiben Sie bei beiden Körpern die Spiegelebenen und die möglichen Drehachsen samt Drehwinkeln. Vergleichen Sie insbesondere, ob eine horizontale Spiegelebene und horizontale Halbdrehachsen vorliegen, und begründen Sie den Unterschied aus der Körperform. (8)

Lösung/Rubrik: (1) |OB′|=√(4²+3²+2²)=√29; Winkel zur Grundfläche α=arcsin(2/√29)≈21,8° (2+1). Eine Pyramiden-Seitenkante von (0,0,0) nach S hat Länge √(2²+2²+3²)=√17 und Winkel β=arctan(3/√8)≈46,7° zur Grundfläche (2+1). **Nur der Höhenvektor** (0,0,3) ist senkrecht zur Grundfläche; die Seitenkante (2,2,3) ist es nicht. (2) Q: x-Richtungskanten parallel; x- und y-Kante am selben Eckpunkt orthogonal; z=0 und z=2 parallel; x=0 und y=0 orthogonal (je 1). R: alle drei Verbindungskanten haben Vektor (1,0,2), also parallel; dieser hat mit der x-Grundkante (4,0,0) das Skalarprodukt 4≠0 und ist nicht zur Grundfläche senkrecht (2). (3) Q: Spiegelebenen x=2, y=1,5, z=1 (2) und drei 180°-Drehachsen durch den Mittelpunkt parallel x,y,z (1); unterschiedliche Kantenlängen 4 und 3 verbieten Achsentausch (1). P: vertikale Spiegelebenen x=2, y=2, x=y und x+y=4 (2), Drehachse x=2,y=2 durch Spitze und Grundflächenzentrum mit 90°-, 180°- und 270°-Drehungen (1). (4) Q: gegenüberliegende Rechtecke haben dieselben Kantenlängen; daher Flächenpaare 4·3, 4·2, 3·2 jeweils zweimal (2). R: Deckdreieck ist Translation des Grunddreiecks um (1,0,2), somit kongruent und parallel (2); Verbindungskante hat Länge √5, Lot-Höhe zwischen den Ebenen z=0 und z=2 ist aber 2 (1). P: Der Lotfuß der Spitze ist das Quadrat-Zentrum (2,2,0), das von jeder Grundecke den horizontalen Abstand √8 hat; mit Höhe 3 hat daher jede Seitenkante Länge √(8+9)=√17, aber wegen horizontalem Anteil √8 keine ist eine Lot-Höhe (2). (5) Mantel M=2(4+3)·2=28 LE², Oberfläche O=M+2·(4·3)=52 LE², mit Einheiten (2+2). (6) Zylinder: Zu jeder Geraden durch den Mittelpunkt des Grundkreises gibt es eine vertikale Spiegelebene durch die Längsachse; zusätzlich ist die horizontale Mittelebene auf halber Höhe eine Spiegelebene (2). Um die vertikale Längsachse sind Drehungen um beliebige Winkel möglich, um jede horizontale Durchmesserachse durch den Körpermittelpunkt eine Halbdrehung um 180° (2). Kegel: Jede vertikale Ebene durch Spitze und Grundkreismittelpunkt ist eine Spiegelebene; um diese vertikale Achse sind Drehungen um beliebige Winkel möglich (2). Eine horizontale Spiegelung oder Halbdrehung vertauschte Spitze und Grundkreis, die nicht gleichartig sind; daher gibt es beim Kegel keine horizontale Spiegelebene und keine horizontale Halbdrehachse (2).

## q2-plane-figures-classification

Aufgabe (32 BE): Verwenden Sie für die folgenden Namen die üblichen Eigenschaften. Für **dieses** Aufgabenpaket bedeutet „Trapez“ genau ein Paar paralleler Gegenseiten. Die jeweils speziellste Figur ist zu nennen; mögliche Oberbegriffe dürfen zusätzlich angegeben werden.

1. Klassifizieren Sie drei Dreiecke anhand ihrer Seitenlängen: T₁=(5,5,6), T₂=(3,4,5), T₃=(4,4,4). Nennen Sie bei T₂ den maßgebenden Winkelzusammenhang. (5)
2. Klassifizieren Sie sechs Vierecke anhand ihrer Eigenschaften: V₁ vier gleich lange Seiten und vier rechte Winkel; V₂ gegenüberliegende Seiten gleich lang und vier rechte Winkel, aber nicht alle Seiten gleich lang; V₃ vier gleich lange Seiten, ein Innenwinkel 60°; V₄ gegenüberliegende Seiten jeweils parallel, benachbarte Seiten verschieden lang, ein Innenwinkel 60°; V₅ genau ein Paar paralleler Gegenseiten; V₆ zwei Paare gleich langer **benachbarter** Seiten, weder gegenüberliegende Seiten parallel noch alle vier Seiten gleich lang. Benennen Sie pro Figur die entscheidenden Eigenschaften. (9)
3. Fertigen Sie je eine kleine beschriftete Skizze für Raute, Trapez und Drachenviereck an und markieren Sie Seiten bzw. Winkel, an denen die Unterschiede erkennbar sind. Erklären Sie, warum ein Quadrat zugleich Rechteck und Raute ist, während V₅ nach obiger Aufgabenfestlegung kein Parallelogramm ist. (6)
4. Drei weitere Figuren sind **nur durch ihre Eckpunkte**, nicht durch Eigenschaften oder Namen vorgegeben. Zeichnen Sie jede Figur, ermitteln Sie die für eine Unterscheidung nötigen Seiten-, Winkel- oder Parallelitätsmerkmale **selbst** und beschreiben Sie sie mit einem vollständigen fachsprachlichen Satz: F₁ mit A=(0,0), B=(4,0), C=(2,3); F₂ mit A=(0,0), B=(5,0), C=(3,2), D=(1,2); F₃ mit A=(0,2), B=(2,0), C=(0,−1), D=(−2,0). Geben Sie jeweils den speziellsten passenden Figurennamen an und begründen Sie ihn aus Ihren ermittelten Merkmalen. (12)

Lösung/Rubrik: (1) T₁ gleichschenklig, T₂ rechtwinklig wegen 3²+4²=5², T₃ gleichseitig (je 1), Zusammenhang und präzise fachsprachliche Benennung (2). (2) V₁ Quadrat, V₂ Rechteck, V₃ Raute, V₄ Parallelogramm, V₅ Trapez und V₆ Drachenviereck; je 1 für den Namen, weitere 3 für zutreffende Unterscheidungsmerkmale. (3) drei mathematisch passende Skizzen samt markierter Merkmale (je 1); Quadrat besitzt sowohl vier rechte Winkel als auch vier gleiche Seiten (2); V₅ hat genau ein paralleles Gegenseitenpaar und erfüllt daher nicht die Bedingung für ein Parallelogramm (1). (4) F₁ ist ein gleichschenkliges, weder gleichseitiges noch rechtwinkliges Dreieck: |AC|=|BC|=√13, |AB|=4; die skizzierte Symmetrieachse verläuft durch C und die Mitte von AB. F₂ ist nach der Paketdefinition ein Trapez: AB und CD sind beide horizontal, AD=(1,2) und BC=(−2,2) nicht parallel; nur dieses eine Gegenseitenpaar ist parallel. F₃ ist ein Drachenviereck: |AB|=|DA|=√8 und |BC|=|CD|=√5; gegenüberliegende Seiten sind nicht parallel und wegen √8≠√5 ist es keine Raute. Pro Figur 1 BE für passende Skizze, 1 BE für selbst ermittelte Merkmale, 1 BE für zutreffenden speziellen Namen und 1 BE für einen fachsprachlichen Begründungssatz (3×4=12).

## q2-plane-figures-congruence-similarity

Aufgabe (32 BE): A=(0,0), B=(4,0), C=(0,3); A′=(5,1), B′=(9,1), C′=(5,4); A″=(0,0), B″=(8,0), C″=(0,6).

1. Beschreiben Sie das Dreieck ABC fachsprachlich mit Seitenlängen, Winkelart und Flächeninhalt. (5)
2. Prüfen Sie, ob ABC und A′B′C′ kongruent sind. Geben Sie eine konkrete Bewegung an **und überprüfen Sie das SSS-Kriterium** an den drei Seitenlängen. (5)
3. Prüfen Sie, ob ABC und A″B″C″ ähnlich und/oder kongruent sind. Geben Sie die Abbildung, den Längenmaßstab und den daraus folgenden Flächenfaktor an. (5)
4. Prüfen Sie, ob auch A′B′C′ und A″B″C″ durch **eine einzige zentrische Streckung** ineinander übergehen. Bestimmen Sie gegebenenfalls Faktor und Streckzentrum, prüfen Sie alle drei Punktbilder und begründen Sie daraus Ähnlichkeit oder Kongruenz dieser beiden Dreiecke. (5)
5. Untersuchen Sie nun **unabhängig von den Dreiecken** das Viereck V mit Ecken (0,0),(4,0),(4,3),(0,3) und V′ mit Ecken (5,1),(5,5),(2,5),(2,1) in jeweils angegebener Umlaufrichtung. Begründen Sie aus Koordinatendifferenzen und einem Winkelargument, dass V ein nicht quadratisches Rechteck ist. Prüfen Sie V und V′ auf Kongruenz mittels einer konkret angegebenen Bewegung. Erläutern Sie anhand eines Gegenbeispiels, warum vier paarweise gleiche Seitenlängen allein bei allgemeinen Vierecken noch keinen Kongruenzbeweis liefern. (6)
6. Das Viereck V″ hat Ecken (0,0),(8,0),(8,6),(0,6). Prüfen Sie V und V″ auf Ähnlichkeit und Kongruenz, geben Sie die Abbildung und den Längenmaßstab an und leiten Sie das Verhältnis ihrer Flächeninhalte rechnerisch ab. (6)

Lösung/Rubrik: (1) rechtwinklig bei A, Katheten 4 und 3, Hypotenuse √(4²+3²)=5, Fläche 6 LE² (5). (2) Translation um (5,1) bildet A,B,C exakt auf A′,B′,C′ ab (2); beide Seitenlängentripel sind (3,4,5), also SSS-Kongruenz, mit Begründung der Längen-/Winkelerhaltung (3). (3) zentrische Streckung um A mit Faktor 2 bildet B auf B″ und C auf C″ (2); Seiten 8,6,10 sind proportional zu 4,3,5 (1), Flächenfaktor 2²=4, also 24 statt 6 LE² (1), nicht kongruent wegen veränderter Seitenlängen (1). (4) Aus B′−A′=(4,0) und B″−A″=(8,0) folgt der Faktor 2 (1); für A″=Z+2(A′−Z) folgt Z=2A′−A″=(10,2) (2). Dieselbe Formel ergibt für B′ das Bild (8,0)=B″ und für C′ das Bild (0,6)=C″ (1); folglich sind die Dreiecke ähnlich, wegen verschiedener Seitenlängen aber nicht kongruent (1). (5) Bei V sind benachbarte Differenzvektoren (4,0) und (0,3) orthogonal und gegenüberliegende Kanten parallel und gleich lang; 4≠3, also Rechteck, kein Quadrat (2). Die Drehung um 90° gegen den Uhrzeigersinn mit anschließender Translation um (5,1), also (x,y)↦(5−y,1+x), bildet die vier V-Ecken in ihrer Reihenfolge auf V′ ab und ist eine Bewegung, daher sind V und V′ kongruent (2). Ein Quadrat und eine nicht quadratische Raute können je vier Seiten der Länge 1 haben, aber verschiedene Winkel; gleiche vier Seitenlängen allein reichen für allgemeine Vierecke nicht (2). (6) Die zentrische Streckung um (0,0) mit Faktor 2 bildet V auf V″ ab (2); zugehörige Seiten 4:8 und 3:6 liefern einheitlich den Längenfaktor 2 (1); Flächen 4·3=12 und 8·6=48 LE², also Verhältnis 1:4 (2); wegen unterschiedlicher entsprechender Seitenlängen nicht kongruent (1).
