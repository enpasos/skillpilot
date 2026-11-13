# Gleichmäßig beschleunigte Bewegung modellieren

Assessment of the learning unit `physics-constant-acceleration`, drafted on
13 November 2026. The unit owns two goals of the introductory phase: the model
of motion with constant acceleration, and modelling with its idealisations.
The earlier assessment `4ab1cf6d-b808-5b86-9291-85df0b9f2496` ("Senkrechter
Wurf: Vorzeichen, Scheitelpunkt und Rückkehr") is passed with 22 of 36 points
and can be passed without the highest point and without the diagrams. It keeps
its own assessment ID and stays a practice task; passes of it are not upgraded.

Every rubric step is required, because the backend compares only the total
with the threshold.

## constant-acceleration-model

### Aufgabe

Eine kleine Stahlkugel (Durchmesser 3 cm, Masse 110 g) wird von einer Plattform senkrecht nach oben geworfen. Beim Abwurf ($t=0$) ist sie $15{,}0\,\mathrm m$ über dem Boden und bewegt sich mit $10{,}0\,\mathrm{m/s}$ nach oben. Sie fliegt an der Plattform vorbei bis zum Boden. Rechnen Sie mit dem Modellwert $g=10{,}0\,\mathrm{m/s^2}$ für die Fallbeschleunigung. Die Zahlen sind konstruierte Modelldaten. Ein Taschenrechner ist zulässig. Jede verlangte Angabe wird bewertet; bearbeiten Sie alle Teile vollständig.

In den Teilen 1 bis 5 zeigt die $y$-Achse nach oben, und $y=0$ ist der Boden.

1. Geben Sie die Anfangshöhe $y_0$, die Anfangsgeschwindigkeit $v_0$ und die Beschleunigung $a$ jeweils mit Vorzeichen an. Stellen Sie das Zeit-Ort-Gesetz $y(t)$ und das Zeit-Geschwindigkeits-Gesetz $v(t)$ auf. (3 BE)
2. Erläutern Sie, was „gleichmäßig beschleunigt“ für diese Bewegung bedeutet: Geben Sie an, wie sich die Geschwindigkeit in jeder Sekunde ändert. Erklären Sie mit den Vorzeichen von $v$ und $a$, warum die Kugel zuerst langsamer und später schneller wird, obwohl die Beschleunigung die ganze Zeit gleich ist. (3 BE)
3. Bestimmen Sie Zeitpunkt und Höhe des höchsten Punkts. Eine Mitschülerin sagt: „Am höchsten Punkt ist die Geschwindigkeit null, also ist dort auch die Beschleunigung null.“ Beurteilen Sie ihre Folgerung. Begründen Sie Ihr Urteil mit der Geschwindigkeit kurz vor und kurz nach dem höchsten Punkt. (3 BE)
4. Bestimmen Sie mit dem Zeit-Ort-Gesetz aus Teil 1 den Zeitpunkt, zu dem die Kugel den Boden erreicht, und ihre Geschwindigkeit unmittelbar davor, mit Vorzeichen. Die Gleichung, die Sie dabei lösen, hat eine zweite Lösung. Geben Sie sie an und erklären Sie, warum sie nicht zu dieser Bewegung gehört. (3 BE)
5. Beschreiben Sie das $t$-$y$-Diagramm, das $t$-$v$-Diagramm und das $t$-$a$-Diagramm der Bewegung vom Abwurf bis zum Boden so genau, dass man sie danach zeichnen könnte: jeweils die Form des Graphen und seine Punkte (Zeitpunkt und Wert) beim Abwurf, am höchsten Punkt und am Boden. Erklären Sie, woran man im $t$-$y$-Diagramm und woran man im $t$-$v$-Diagramm den höchsten Punkt erkennt. Erklären Sie außerdem, wie man den Wert im $t$-$a$-Diagramm aus dem $t$-$v$-Diagramm bestimmt. (5 BE)
6. Beschreiben Sie dieselbe Bewegung jetzt mit einer Achse, die nach unten zeigt und deren Nullpunkt der Abwurfpunkt ist. Geben Sie Anfangsort, Anfangsgeschwindigkeit und Beschleunigung mit Vorzeichen an und stellen Sie beide Gesetze auf. Zeigen Sie mit diesen Gesetzen, dass die Kugel den Boden zum selben Zeitpunkt erreicht wie in Teil 4, und geben Sie die Koordinate des höchsten Punkts an. (3 BE)
7. Das Modell behandelt die Kugel als Massepunkt und vernachlässigt den Luftwiderstand. Begründen Sie für jede der beiden Vereinfachungen, warum sie für diese Kugel bei dieser Bewegung vertretbar ist. Geben Sie an, für welchen Zeitraum die Gesetze aus Teil 1 gelten. Nennen Sie einen Körper, für den derselbe Wurf mit derselben Anfangsgeschwindigkeit wegen des Luftwiderstands deutlich anders verliefe, als das Modell vorhersagt. Geben Sie an, ob seine wirkliche größte Höhe größer oder kleiner wäre als die Modellvorhersage, und begründen Sie Ihre Antwort. (4 BE)

### Lösung

**Zu 1.** $y_0=+15{,}0\,\mathrm m$, $v_0=+10{,}0\,\mathrm{m/s}$, $a=-10{,}0\,\mathrm{m/s^2}$. Die Beschleunigung ist negativ, weil die Erdanziehung nach unten wirkt, also gegen die Achsenrichtung.

$$y(t)=15{,}0\,\mathrm m+10{,}0\,\mathrm{m/s}\cdot t-5{,}0\,\mathrm{m/s^2}\cdot t^2,\qquad v(t)=10{,}0\,\mathrm{m/s}-10{,}0\,\mathrm{m/s^2}\cdot t.$$

**Zu 2.** Die Beschleunigung ist konstant: In jeder Sekunde ändert sich die Geschwindigkeit um denselben Wert, hier um $-10{,}0\,\mathrm{m/s}$. Bei $t=0$, $1$, $2$ und $3\,\mathrm s$ beträgt sie $+10$, $0$, $-10$ und $-20\,\mathrm{m/s}$. Zuerst ist $v>0$ und $a<0$. Geschwindigkeit und Beschleunigung haben entgegengesetzte Vorzeichen, der Betrag der Geschwindigkeit nimmt ab: Die Kugel wird langsamer. Nach dem höchsten Punkt ist $v<0$ und $a<0$. Beide haben dasselbe Vorzeichen, der Betrag der Geschwindigkeit nimmt zu: Die Kugel wird schneller. Die Beschleunigung bleibt dabei gleich; geändert hat sich die Richtung der Geschwindigkeit.

**Zu 3.** Am höchsten Punkt ist $v=0$: $10{,}0-10{,}0\,t=0$ ergibt $t=1{,}00\,\mathrm s$. Die Höhe ist $y(1{,}00\,\mathrm s)=15{,}0+10{,}0-5{,}0=20{,}0\,\mathrm m$. Die Folgerung ist falsch. Kurz vor dem höchsten Punkt ist die Geschwindigkeit noch positiv, kurz danach schon negativ. Sie ändert sich am höchsten Punkt also weiter; nach dem Gesetz aus Teil 1 wie überall um $-10{,}0\,\mathrm{m/s}$ je Sekunde, zum Beispiel von $+1{,}0\,\mathrm{m/s}$ bei $0{,}90\,\mathrm s$ auf $-1{,}0\,\mathrm{m/s}$ bei $1{,}10\,\mathrm s$. Die Beschleunigung gibt diese Änderung der Geschwindigkeit an und ist dort deshalb weiterhin $-10{,}0\,\mathrm{m/s^2}$, obwohl die Geschwindigkeit selbst gerade null ist.

**Zu 4.** Am Boden ist $y=0$: $15{,}0+10{,}0\,t-5{,}0\,t^2=0$, also $t^2-2{,}00\,t-3{,}00=0$ mit den Lösungen $t=3{,}00\,\mathrm s$ und $t=-1{,}00\,\mathrm s$. Die Kugel erreicht den Boden bei $t=3{,}00\,\mathrm s$. Ihre Geschwindigkeit ist dann $v=10{,}0-30{,}0=-20{,}0\,\mathrm{m/s}$; das Minuszeichen bedeutet: nach unten. Die zweite Lösung $t=-1{,}00\,\mathrm s$ liegt vor dem Abwurf. Die Gesetze beschreiben die Bewegung erst ab $t=0$.

**Zu 5.** Das $t$-$y$-Diagramm ist ein Stück einer nach unten geöffneten Parabel: Sie beginnt bei $(0\,\mathrm s\mid 15{,}0\,\mathrm m)$, steigt bis zum Scheitel $(1{,}00\,\mathrm s\mid 20{,}0\,\mathrm m)$ und fällt bis $(3{,}00\,\mathrm s\mid 0\,\mathrm m)$. Das $t$-$v$-Diagramm ist eine fallende Gerade: von $+10{,}0\,\mathrm{m/s}$ bei $t=0$ über $0$ bei $t=1{,}00\,\mathrm s$ bis $-20{,}0\,\mathrm{m/s}$ bei $t=3{,}00\,\mathrm s$. Das $t$-$a$-Diagramm ist eine waagerechte Gerade bei $-10{,}0\,\mathrm{m/s^2}$ über die ganze Zeit, auch bei $t=1{,}00\,\mathrm s$. Den höchsten Punkt erkennt man im $t$-$y$-Diagramm am Scheitel der Parabel, wo der Graph am höchsten ist und die Tangente waagerecht liegt. Im $t$-$v$-Diagramm erkennt man ihn an der Nullstelle der Geraden. Den Wert im $t$-$a$-Diagramm liefert die Steigung des $t$-$v$-Graphen: In $3{,}00\,\mathrm s$ ändert sich $v$ um $-30{,}0\,\mathrm{m/s}$, also ist $a=-10{,}0\,\mathrm{m/s^2}$. Weil die Gerade überall dieselbe Steigung hat, ist der $t$-$a$-Graph waagerecht.

**Zu 6.** Mit der Achse nach unten und dem Nullpunkt am Abwurfpunkt: Anfangsort $s_0=0$, Anfangsgeschwindigkeit $v_0=-10{,}0\,\mathrm{m/s}$, weil die Kugel zuerst gegen die Achsenrichtung fliegt, und Beschleunigung $a=+10{,}0\,\mathrm{m/s^2}$, weil die Erdanziehung jetzt in Achsenrichtung wirkt.

$$s(t)=-10{,}0\,\mathrm{m/s}\cdot t+5{,}0\,\mathrm{m/s^2}\cdot t^2,\qquad v(t)=-10{,}0\,\mathrm{m/s}+10{,}0\,\mathrm{m/s^2}\cdot t.$$

Der Boden liegt bei $s=+15{,}0\,\mathrm m$: $-10{,}0\,t+5{,}0\,t^2=15{,}0$, also wieder $t^2-2{,}00\,t-3{,}00=0$ mit $t=3{,}00\,\mathrm s$. Am höchsten Punkt ist $v=0$, also $t=1{,}00\,\mathrm s$ und $s=-10{,}0+5{,}0=-5{,}0\,\mathrm m$. Der höchste Punkt liegt $5{,}0\,\mathrm m$ über dem Abwurfpunkt, das sind wie in Teil 3 $20{,}0\,\mathrm m$ über dem Boden.

**Zu 7.** Massepunkt: Gefragt ist nur, wie sich die Kugel als Ganzes auf der Senkrechten bewegt. Ihr Durchmesser von 3 cm ist gegenüber den Strecken von mehreren Metern unbedeutend, und ob sie sich dreht, ändert an dieser Bewegung nichts. Luftwiderstand: Die Kugel ist klein und hat dabei eine große Masse. Bei Geschwindigkeiten bis $20\,\mathrm{m/s}$ ist die Luftreibung an ihr klein gegenüber ihrer Gewichtskraft von etwa $1{,}1\,\mathrm N$ und verändert die Bewegung kaum. Die Gesetze gelten vom Abwurf bei $t=0$ bis unmittelbar vor dem Auftreffen bei $t=3{,}00\,\mathrm s$, nicht vor dem Abwurf und nicht während oder nach dem Aufprall. Deutlich anders verliefe der Wurf zum Beispiel für einen Federball, ein Blatt Papier oder einen mit Luft gefüllten Luftballon. Ihre wirkliche größte Höhe wäre kleiner als die Modellvorhersage: Beim Aufsteigen wirkt die Luftreibung wie die Erdanziehung nach unten, der Körper wird stärker abgebremst und kommt früher zum Stillstand.

**Bewertungshinweis.** Ein Teil erhält seine volle BE-Zahl, wenn die im Raster genannten Leistungen vollständig und fachlich richtig vorliegen; fehlt eine oder ist sie fachlich falsch, erhält er 0 BE. Keine BE kosten:

- eigene Worte statt der Fachwörter und andere Formelzeichen, solange eindeutig ist, was gemeint ist; positive Werte ohne ausgeschriebenes Pluszeichen; Gesetze ohne ausgeschriebene Einheiten und je Teil eine einzelne fehlende Einheit bei einem Ergebnis, wenn aus der Bearbeitung eindeutig hervorgeht, welche Einheit gemeint ist;
- sinnvoll gerundete Ergebnisse;
- je Teil ein einzelner Rechen- oder Schreibfehler, wenn Ansatz und Vorzeichen stimmen und mit ihm folgerichtig weitergearbeitet wird oder er in der weiteren Bearbeitung erkennbar nicht verwendet wird. Das gilt nicht, wenn der Fehler eine verlangte Begründung überflüssig macht, zum Beispiel wenn die Gleichung in Teil 4 keine negative Lösung mehr hat. In Teil 1 müssen beide Gesetze stimmen; dort kostet nur ein offensichtlicher Schreibfehler nichts, mit dem später erkennbar nicht gerechnet wird;
- das Rechnen mit $g=9{,}8\,\mathrm{m/s^2}$ oder $g=9{,}81\,\mathrm{m/s^2}$ statt mit dem Modellwert, wenn es durchgehend geschieht und die Ergebnisse dazu passen;
- in Teil 2 die Angabe „nimmt in jeder Sekunde um $10\,\mathrm{m/s}$ ab“ statt „ändert sich um $-10\,\mathrm{m/s}$“ und die Richtungen von Geschwindigkeit und Beschleunigung (nach oben, nach unten) statt ihrer Vorzeichen;
- in Teil 3 das Urteil „teils richtig: die Geschwindigkeit ist null, die Folgerung für die Beschleunigung ist falsch“;
- in Teil 5 eine Skizze der drei Diagramme als Foto statt ihrer Beschreibung, wenn sie die verlangten Formen und Punkte zeigt. Die beiden Erklärungen zum höchsten Punkt und die Erklärung zum $t$-$a$-Diagramm bleiben in Worten nötig;
- in Teil 7 jeder andere Körper, bei dem die Luftreibung gegenüber der Gewichtskraft offensichtlich nicht klein ist.

Eine Leistung fehlt oder ist falsch insbesondere, wenn

- in Teil 1 die Beschleunigung positiv angegeben wird oder ein Gesetz nicht stimmt, etwa mit $-10{,}0\,\mathrm{m/s^2}\cdot t^2$;
- in Teil 2 nur gesagt wird, die Beschleunigung sei konstant, ohne die Änderung der Geschwindigkeit je Sekunde zu nennen, oder das Langsamer- und Schnellerwerden nur mit „erst nach oben, dann nach unten“ erklärt wird, ohne Geschwindigkeit und Beschleunigung zu vergleichen;
- in Teil 3 die Folgerung als richtig beurteilt wird, nur $a=-10{,}0\,\mathrm{m/s^2}$ behauptet wird oder das Urteil allein mit der Erdanziehung begründet wird, ohne die Änderung der Geschwindigkeit um den höchsten Punkt herum zu nennen;
- in Teil 4 das Vorzeichen der Auftreffgeschwindigkeit fehlt oder die zweite Lösung nur als „negativ, also falsch“ verworfen wird, ohne zu sagen, dass sie vor dem Abwurf liegt;
- in Teil 5 das $t$-$a$-Diagramm am höchsten Punkt den Wert null erhält oder als veränderlich beschrieben wird, das $t$-$v$-Diagramm nicht als eine durchgehende Gerade beschrieben wird, eines der beiden Erkennungsmerkmale des höchsten Punkts fehlt oder der Wert des $t$-$a$-Diagramms nur aus Teil 1 übernommen und nicht als Steigung des $t$-$v$-Graphen erklärt wird;
- in Teil 6 die Vorzeichen nicht zur neuen Achse passen, etwa $a=-10{,}0\,\mathrm{m/s^2}$, oder der Boden bei $s=0$ oder bei $s=-15{,}0\,\mathrm m$ angesetzt wird;
- in Teil 7 eine Vereinfachung nur mit einer Eigenschaft aus dem Aufgabentext begründet wird („die Kugel ist klein“, „sie ist schwer“), ohne sie auf die Strecken, auf die Bewegung der Kugel als Ganzes oder auf die Gewichtskraft zu beziehen; der Geltungszeitraum fehlt; oder die Richtung der Abweichung nicht begründet wird.

### Bewertung

| Schritt | BE | Kriterium |
| --- | ---: | --- |
| 1 | 3 | Anfangshöhe 15,0 m, Anfangsgeschwindigkeit 10,0 m/s nach oben und Beschleunigung −10,0 m/s² angegeben; Zeit-Ort-Gesetz y(t) = 15,0 m + 10,0 m/s · t − 5,0 m/s² · t² (gleichwertig mit ½ · a · t² und a = −10,0 m/s²) und Zeit-Geschwindigkeits-Gesetz v(t) = 10,0 m/s − 10,0 m/s² · t aufgestellt |
| 2 | 3 | Angegeben, dass sich die Geschwindigkeit in jeder Sekunde um denselben Wert ändert, hier um −10 m/s; mit entgegengesetzten Vorzeichen oder Richtungen von Geschwindigkeit und Beschleunigung das Langsamerwerden und mit gleichen das Schnellerwerden erklärt |
| 3 | 3 | Zeitpunkt 1,00 s und Höhe 20,0 m des höchsten Punkts bestimmt; die Folgerung, die Beschleunigung sei dort null, als falsch beurteilt; damit begründet, dass die Geschwindigkeit kurz davor positiv und kurz danach negativ ist, sich am höchsten Punkt also weiter ändert und die Beschleunigung dort nicht null ist |
| 4 | 3 | Auftreffzeit 3,00 s mit dem Zeit-Ort-Gesetz bestimmt; Auftreffgeschwindigkeit −20,0 m/s mit Vorzeichen angegeben; zweite Lösung −1,00 s angegeben und damit verworfen, dass sie vor dem Abwurf liegt, also außerhalb des Zeitraums, für den die Gesetze gelten |
| 5 | 5 | Zeit-Ort-Diagramm als nach unten geöffnete Parabel mit den Punkten (0 s; 15,0 m), (1,00 s; 20,0 m) und (3,00 s; 0 m) beschrieben; Zeit-Geschwindigkeits-Diagramm als eine fallende Gerade von 10,0 m/s bei 0 s über 0 bei 1,00 s bis −20,0 m/s bei 3,00 s beschrieben; Zeit-Beschleunigungs-Diagramm als waagerechte Gerade bei −10,0 m/s² ohne Ausnahme am höchsten Punkt beschrieben; höchsten Punkt am Scheitel der Parabel und an der Nullstelle der Geschwindigkeitsgeraden erklärt; erklärt, dass der Wert im Zeit-Beschleunigungs-Diagramm die Steigung der Geschwindigkeitsgeraden ist, zum Beispiel (−20,0 m/s − 10,0 m/s) : 3,00 s = −10,0 m/s² |
| 6 | 3 | Für die Achse nach unten mit Nullpunkt am Abwurfpunkt Anfangsort 0, Anfangsgeschwindigkeit −10,0 m/s und Beschleunigung +10,0 m/s² angegeben und beide Gesetze dazu passend aufgestellt; mit dem Boden bei +15,0 m dieselbe Auftreffzeit 3,00 s gezeigt; Koordinate −5,0 m des höchsten Punkts angegeben |
| 7 | 4 | Massepunkt für diese Kugel bei dieser Bewegung begründet, etwa mit ihrer Größe im Vergleich zu den Strecken oder damit, dass nur die Bewegung der Kugel als Ganzes gefragt ist; Vernachlässigung des Luftwiderstands damit begründet, dass die Luftreibung an dieser Kugel bei den auftretenden Geschwindigkeiten klein gegenüber ihrer Gewichtskraft ist (gleichwertig: dass die Luft sie viel weniger abbremst als die Erdanziehung); Geltungszeitraum vom Abwurf bis unmittelbar vor dem Auftreffen angegeben; einen Körper mit deutlichem Luftwiderstand genannt und begründet, dass seine größte Höhe kleiner wäre, weil die Luftreibung beim Aufsteigen zusätzlich bremst |

Erreichbar sind 24 BE. Bestanden ist die Prüfung mit 24 BE.
