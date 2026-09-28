# Q2-Prüfungsaufgaben v2 · Entwurf, keine Freigabe

Alle Aufgaben sind nichtkanonische AI-Kandidaten. Bewertungseinheiten (BE) und Lösungsvorschläge wurden rechnerisch kontrolliert; die fachliche Zielabdeckung, die fairen `requires` und die Kurs-/Länderprojektion brauchen eine unabhängige Begutachtung. Prüfungsaufgaben werden erst nach einer Freigabe mit echten IDs und passender Quellen-/Ansichtsbindung in den Graphen übernommen.

## Bestehende Q2-Aufgabe `1878f680…`: vorgeschlagener Teil 3

Die alten Punkte $A(0|0|0)$, $B(6|0|0)$, $C(0|4|0)$ und $D(0|0|3)$ sowie Teile 1, 2 und 4 bleiben als historische v1-Vorlage erhalten. Für eine spätere v2 lautet **Teil 3**:

> Bestimmen Sie die senkrechte Höhe und das Volumen der Pyramide $ABCD$. Berechnen Sie zusätzlich das Volumen eines geraden Prismas mit derselben Grundfläche $ABC$ und derselben senkrechten Höhe. Erläutern Sie an den Eigenschaften beider Körper, warum das Pyramidenvolumen ein Drittel des Prismenvolumens beträgt.

Lösung: Das rechtwinklige Grunddreieck hat $G=6\cdot4/2=12\,\mathrm{LE}^2$ und liegt in $z=0$; $D$ liegt senkrecht darüber, also $h=3\,\mathrm{LE}$. Das Vergleichsprisma hat $V_{\mathrm{Pr}}=G h=36\,\mathrm{LE}^3$. Die Pyramide hat $V_{\mathrm{Pyr}}=G h/3=12\,\mathrm{LE}^3$. Bei gleicher Grundfläche und **senkrechter** Höhe ist $V_{\mathrm{Pyr}}/V_{\mathrm{Pr}}=1/3$.

Die bisherige Vier-Teile-Summe bleibt als **Vorschlag** bei 20 BE mit `[4,4,6,6]`. Teil 3: Lot-Höhe und Grundflächenbezug (1 BE), Pyramidenvolumen mit Einheit (2 BE), Vergleichsprisma mit Einheit (1 BE), geometrisch zutreffender Vergleich und Drittelfaktor (2 BE). Die sechs BE von Teil 4 bleiben bei der bisherigen Skalierungsleistung. Nur nach Review könnten `9460c3ff…`, `5390691d…`, `5f548596…` und `288633c1…` als `coveredGoalIds` stehen; `5f548596…` ist dabei gesondert auf vollständige Deckung zu beurteilen. Faire Eingangs-`requires` sind eine eigene Entscheidung. `coveredStrands` und die Aufgabenmetadaten wären auf den tatsächlich geprüften L3-Anteil zu begrenzen.

## `q2-vector-combination-dependence-v2` · 20 BE

Gegeben seien $u=(1,2,0)$, $v=(0,1,1)$, $w=(2,5,1)$ sowie $p=(1,1,1)$, $q=(3,3,3)$ und $r=(3,3,4)$.

1. Stellen Sie $w$ als Linearkombination von $u$ und $v$ dar. Skizzieren Sie die beiden Richtungen und erklären Sie geometrisch, warum $w$ in ihrer aufgespannten Ebene liegt. (8 BE)
2. Entscheiden und begründen Sie rechnerisch, ob $u,v$ beziehungsweise $u,v,w$ linear unabhängig sind. Deuten Sie beide Ergebnisse geometrisch. (6 BE)
3. Prüfen Sie, ob $p$ und $q$ beziehungsweise $p$ und $r$ kollinear sind. Nutzen Sie skalare Vielfache oder Komponentenvergleiche und erklären Sie beide Befunde geometrisch. (6 BE)

Lösung/Rubrik: (1) $w=2u+v=(2,5,1)$ (4 BE); die Summe aus zwei $u$-Schritten und einem $v$-Schritt liegt in derselben Ebene, Skizze und Deutung (4 BE). (2) Aus $\alpha u+\beta v=0$ folgt über die erste Koordinate $\alpha=0$, danach $\beta=0$; $u,v$ sind unabhängig und spannen eine Ebene auf (3 BE). Für $u,v,w$ gilt $2u+v-w=0$ als nichttriviale Relation; $w$ liefert keine dritte unabhängige Richtung (3 BE). (3) $q=3p$, also gleiche Richtung und Kollinearität (3 BE). Aus den ersten Komponenten von $r$ ergäbe sich Faktor 3, aus der dritten aber Faktor 4; $r$ ist deshalb kein Vielfaches von $p$ und nicht kollinear (3 BE). Summe: $8+6+6=20$ BE.

Zielvorschlag: `72dfc164…`, `6fc9246a…`, `54cfe5ce…`. Der aktuelle Atlas zeigt die drei Ziele gemeinsam in 32/32 Sek-II-GK/LK-Sichten; das beweist noch keine fachliche Abdeckung oder faire Dreifachvoraussetzung.

## `q2-volume-five-solids-v2` · 25 BE

Die fünf Teile gehören zu einer integrierten Klausuraufgabe. Die benötigten Maße stehen jeweils in der Aufgabe; ein Fehler in einem Teil darf bei fachlich folgerichtiger Weiterrechnung in einem anderen Teil nicht doppelt bestraft werden. Reichen Sie die geforderten kleinen Skizzen zusammen mit dem Rechenweg ein.

1. Ein gerades Dreiecksprisma besitzt das Grunddreieck $A=(0,0,0)$, $B=(6,0,0)$, $C=(0,8,0)$ cm. Die Deckfläche entsteht durch Verschiebung um $(0,0,5)$ cm. Skizzieren und beschriften Sie Grundfläche und senkrechte Höhe, berechnen Sie $G$ und $V$, und erklären Sie geometrisch $V=G h$. (5 BE)
2. Ein Spat hat den Eckpunkt $O=(0,0,0)$ und die benachbarten Ecken $U=(2,0,0)$, $V=(0,3,0)$, $W=(1,0,4)$ cm. Wählen und benennen Sie selbst die drei passenden Kantenvektoren ab $O$. Bestimmen Sie mittels Spatprodukt das Volumen des Spats und des Tetraeders $OUVW$. Erläutern Sie den Sechstelfaktor und warum der Betrag des Produkts benutzt wird. (7 BE)
3. Ein gerader Zylinder hat Grundkreismittelpunkt $O=(0,0,0)$, Grundkreispunkt $R=(3,0,0)$ und Deckkreismittelpunkt $T=(0,0,10)$ cm. Skizzieren und beschriften Sie Radius und senkrechte Höhe. Berechnen Sie $G$ und $V$, und erklären Sie die konstanten kreisförmigen Querschnitte. (4 BE)
4. Ein gerader Kegel hat denselben Grundkreis $r=3$ cm und dieselbe senkrechte Höhe $h=10$ cm wie der Zylinder. Bestimmen Sie sein Volumen aus der Skizze. Berechnen Sie auch das Vergleichsvolumen des Zylinders aus diesen Angaben und erläutern Sie, warum das Verhältnis genau $1:3$ beträgt. (5 BE)
5. Zwei Kugeln um $O=(0,0,0)$ haben die Oberflächenpunkte $P=(3,0,0)$ beziehungsweise $Q=(6,0,0)$ cm. Bestimmen Sie beide Radien und Volumina. Erklären Sie am Ergebnis die kubische Abhängigkeit vom Radius. (4 BE)

Lösung/Rubrik:

1. $G=\tfrac12\cdot6\cdot8=24\,\mathrm{cm}^2$ (1 BE), senkrechte Höhe $h=5$ cm aus der Verschiebung und richtig beschriftete Skizze (1 BE), $V=24\cdot5=120\,\mathrm{cm}^3$ (2 BE), Grundfläche-mal-senkrechte-Höhe geometrisch erklärt (1 BE).
2. $a=\overrightarrow{OU}=(2,0,0)$, $b=\overrightarrow{OV}=(0,3,0)$, $c=\overrightarrow{OW}=(1,0,4)$ als drei Kanten ab demselben Eckpunkt (2 BE); $b\times c=(12,0,-3)$ (2 BE), $|a\cdot(b\times c)|=24\,\mathrm{cm}^3$ für den Spat (1 BE), $V_{\mathrm{Tet}}=24/6=4\,\mathrm{cm}^3$ mit Volumenverhältnis (1 BE), Betrag als von Orientierung unabhängige Volumengröße begründet (1 BE).
3. $r=3$ cm und $h=10$ cm in passender Skizze (1 BE), $G=\pi r^2=9\pi\,\mathrm{cm}^2$ (1 BE), $V=90\pi\,\mathrm{cm}^3$ (1 BE), konstante Grundkreisfläche über der Höhe erläutert (1 BE).
4. $G=9\pi\,\mathrm{cm}^2$ und Lot-Höhe 10 cm aus der Skizze (1 BE), $V_{\mathrm{Kegel}}=G h/3=30\pi\,\mathrm{cm}^3$ (2 BE), $V_{\mathrm{Zyl}}=G h=90\pi\,\mathrm{cm}^3$ aus den hier angegebenen Größen (1 BE), Drittelverhältnis bei gleicher Grundfläche und gleicher senkrechter Höhe begründet (1 BE).
5. Radien 3 und 6 cm (1 BE), $V(3)=\tfrac43\pi\cdot3^3=36\pi\,\mathrm{cm}^3$ und $V(6)=\tfrac43\pi\cdot6^3=288\pi\,\mathrm{cm}^3$ (je 1 BE), $V(6)/V(3)=2^3=8$ als kubische Radienabhängigkeit gedeutet (1 BE).

Summe: $5+7+4+5+4=25$ BE. Zielvorschlag: `1e77bb2f…`, `a594dec0…`, `c71ae268…`, `e8237315…`, `2f2c9f1a…`. Im derzeitigen Atlas sind alle fünf gemeinsam in 31/32 GK/LK-Sichten sichtbar; **HE-LK ist ausgeschlossen**. Die Aufgabe ist kein freigegebener pauschaler GK/LK-Endpunkt. Ob fünf gleichzeitige `requires` eine faire Hürde bilden, muss die Aufgabenprüfung ausdrücklich entscheiden.

## `q2-spatproduct-he-lk-v2` · 12 BE

Ein Spat besitzt $O=(0,0,0)$ und die drei benachbarten Ecken $U=(3,1,0)$, $V=(0,2,0)$, $W=(1,0,5)$ cm. Das Tetraeder $OUVW$ nutzt dieselben drei Kanten ab $O$.

1. Wählen und benennen Sie selbst drei geeignete Kantenvektoren für das Spatprodukt. (3 BE)
2. Berechnen Sie ein passendes Kreuzprodukt dieser Vektoren. (2 BE)
3. Berechnen Sie das zugehörige Skalarprodukt und erklären Sie die Betragsbildung. (2 BE)
4. Geben Sie das Spatvolumen mit Einheit an. (1 BE)
5. Bestimmen Sie das Tetraedervolumen und begründen Sie seinen Faktor zum Spatvolumen. (2 BE)
6. Vertauschen Sie die Reihenfolge der beiden Vektoren im Kreuzprodukt: Was geschieht mit dem Vorzeichen und weshalb bleibt das geometrische Volumen gleich? (2 BE)

Lösung/Rubrik: (1) $a=\overrightarrow{OU}=(3,1,0)$, $b=\overrightarrow{OV}=(0,2,0)$ und $c=\overrightarrow{OW}=(1,0,5)$, alle mit Anfang $O$, je 1 BE. (2) $b\times c=(10,0,-2)$, Komponenten und Richtung insgesamt 2 BE. (3) $a\cdot(b\times c)=30$ (1 BE), $|30|$ ist als geometrisches Volumen unabhängig von der Vektorreihenfolge nicht negativ (1 BE). (4) $V_{\mathrm{Spat}}=30\,\mathrm{cm}^3$ (1 BE). (5) $V_{\mathrm{Tet}}=30/6=5\,\mathrm{cm}^3$ (1 BE), Tetraeder mit drei Kanten ab einem Eckpunkt belegt ein Sechstel des Spats (1 BE). (6) $c\times b=(-10,0,2)$ und $a\cdot(c\times b)=-30$ (1 BE); $|-30|=30$ und beide Orientierungen beschreiben denselben geometrischen Körper (1 BE). Summe: $3+2+2+1+2+2=12$ BE.

Zielvorschlag nur `a594dec0-3977-5c43-9432-d4254a7f6130`, vorläufig nur für `DE-HE|SekII||LK`. Die hessische Sonderaufgabe wiederholt nicht einfach die 25-BE-Aufgabe; ihre sachliche Abdeckung und der lokale Q2-Endpunkt sind dennoch gesondert zu prüfen.
