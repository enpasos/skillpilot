# Musterlösung: Separation und direkte Integration

**1.** Auf einem Intervall mit $y(t)\ne0$ darf durch $y^2$ geteilt
werden. Die getrennte Gleichung und ihre Integration lauten
$$
\frac{1}{y^2}\,dy=dt,
\qquad\int y^{-2}\,dy=\int1\,dt,
\qquad-\frac1y=t+K.
$$
Umstellen ergibt
$$
y(t)=-\frac1{t+K}=\frac1{C-t},\qquad C=-K\in\mathbb R.
$$
Die Integrationskonstante wählt eine Funktion aus der Familie. Ihr
Nenner darf nicht null sein. Der Ausdruck ist daher auf jedem
zusammenhängenden offenen Intervall ohne $t=C$ eine Lösung;
die beiden größten solchen Intervalle sind $(-\infty,C)$ und
$(C,\infty)$. Eine kleinere zulässige Intervallbeschränkung liefert
jeweils dieselbe Lösung auf weniger Stellen. Die Wahl $K$ statt $C$
oder jede andere gleichwertige Parameterdarstellung zählt ebenso.

Ein gleichwertiger elementarer Weg setzt auf einem Intervall ohne
Nullstellen $u=1/y$. Dann folgt aus der Kehrwertableitung
$u'=-y'/y^2=-1$. Integration liefert $u=-t+C$ und damit dieselbe
Familie. Auch hier ist die Division nur für $y\ne0$ zulässig.
Ein allgemeiner Satz über Existenz, Eindeutigkeit oder Vollständigkeit
von DGL-Lösungsfamilien wird für diese Aufgabe nicht benötigt.

**2.** Für eine konstante Funktion $y(t)=k$ ist $y'=0$.
Die Gleichung fordert $0=k^2$, also $k=0$. Somit ist $y(t)=0$
eine Lösung auf $\mathbb R$. Sie wurde beim Dividieren durch $y^2$
ausgeschlossen und muss gesondert ergänzt werden. Kein endlicher
Wert des Familienparameters $C$ ergibt die Nullfunktion.

**3.** Einsetzen der Anfangsbedingung in die Familie ergibt
$$
1=y(0)=\frac1C,\qquad C=1,
\qquad y(t)=\frac1{1-t}.
$$
Der Term hat die Nennernullstelle $t=1$. Das größte offene
nullstellenfreie Intervall mit $0$ ist daher $(-\infty,1)$.
Bei $t=1$ besitzt der Term keinen reellen Funktionswert und kann dort
keine differenzierbare Lösung darstellen. Auf $(1,\infty)$ definiert
derselbe Term zwar eine weitere Lösungsbranche, dieses Intervall
enthält aber den Anfangszeitpunkt $0$ nicht. Die beiden getrennten
Bereiche sind kein einzelnes Lösungsintervall durch $t=1$.
Diese Begründung verwendet nur Definitionsbedingungen, nicht einen
allgemeinen Maximalitäts- oder Eindeutigkeitssatz.

**4.** Für jedes $t<1$ gilt
$$
y'(t)=\frac1{(1-t)^2}
\quad\text{und}\quad y(t)^2=\frac1{(1-t)^2}.
$$
Somit ist $y'=y^2$ auf dem ganzen gewählten Intervall erfüllt.
Außerdem ist $y(0)=1/(1-0)=1$.
Eine bloße Probe wäre keine Herleitung der Familie aus Teil 1;
zusammen mit der Herleitung ist sie die verlangte Kontrolle.

**5.** Direkte Integration ergibt
$$
z(t)=\int2t\,dt=t^2+L,\qquad L\in\mathbb R.
$$
Mit $z(0)=-2$ folgt $L=-2$, also $z(t)=t^2-2$.
Das Polynom ist auf ganz $\mathbb R$ differenzierbar; es gibt keine
Nenner- oder sonstige Definitionsbeschränkung. Das größte Intervall
ist somit $\mathbb R$. Es gilt $z'(t)=2t$ für alle reellen $t$ und
$z(0)=-2$. Anders als in Teil 1 ist keine Trennung eines von $z$
abhängigen Faktors erforderlich: Die Ableitung ist bereits allein
als Funktion von $t$ gegeben.

## Eine Gesamtbewertung

Es gibt eine Gesamtpunktzahl aus **20 BE** und genau ein binäres Ergebnis:
**bestanden ab 15 BE**, sonst nicht bestanden. Die Teilpunkte sind keine
eigenen Bestehensgrenzen. Mathematisch gleichwertige begründete Lösungswege,
andere Bezeichnungen der Integrationskonstante und korrekte Umformungen
zählen gleichwertig. Das Wort „Separation“ allein ersetzt keine Rechnung;
eine richtige Rechnung braucht umgekehrt kein bestimmtes Schlagwort.

Bewerte richtige Leistungen dort, wo sie tatsächlich vorkommen; dieselbe
Leistung zählt einmal. Teilpunkte wie angegeben, sonst 0,5 BE für eine
sinnvolle unvollständige Teilleistung. Lokale Fehler werden nicht mehrfach
bestraft; nachvollziehbare richtige Folgearbeit behält ihren Kredit.
Weder zusätzliche Methodenvarianten noch allgemeine DGL-Theoreme sind
verlangt. Die Hilfsregel vereinfacht ausschließlich die Kontrollrechnung;
die Lösungsherleitung und die Konstantenbestimmung bleiben eigene Leistungen.

| Kriterium | BE |
|---|---:|
| Tragfähiger Separations-, Kehrwert- oder anderer elementarer Lösungsansatz mit nötigen Bedingungen (1); mathematisch tragfähige Herleitung der Familie über Integration oder gleichwertige Schlussfolgerungen samt freiem Parameter (3); nach y mit gültiger Parameterfamilie umgestellt (1); Nennerbedingung für das Lösungsintervall genannt (1). | 6 |
| Konstanten Ansatz y=k in die ursprüngliche DGL eingesetzt und k=0 gewonnen (1); Nulllösung mit dem beim Dividieren ausgeschlossenen Fall verknüpft (1). | 2 |
| Anfangsbedingung an der Familie angesetzt und die passende Konstante bestimmt (2); spezielle Lösung korrekt angegeben (1); größtes offenes Intervall mit 0 ohne Nennernullstelle (1); fehlenden Funktionswert am Pol bzw. getrennte zweite Branche elementar erklärt (1). | 5 |
| Ableitung der speziellen Lösung nachvollziehbar berechnet (1); Gleichheit von y′ und y² auf dem Intervall geprüft (1); Anfangsbedingung ausdrücklich geprüft (1). | 3 |
| Allgemeine z-Lösung durch direkte Integration mit freier Konstante (1); Konstante aus z(0)=−2 bestimmt und spezielle Lösung angegeben (1); ganz R als Lösungsintervall begründet (1); Ableitung und Anfangswert geprüft (1 zusammen, je 0,5). | 4 |

Begrenze vor dem Vergleich mit der Bestehensgrenze die normale
Gesamtpunktzahl auf **14 BE**, wenn über die ganze Abgabe keine tragfähige
eigene elementare Herleitung der nichtverschwindenden Lösungsfamilie von
$y'=y^2$ vorkommt oder wenn nirgends aus einer allgemeinen Lösung mithilfe
einer Anfangsbedingung eine spezielle Lösung gewonnen wird. Die bloße
Angabe oder Ableitungsprobe einer erratenen Familie ersetzt die erste
Kernleistung nicht. Der zweite Kern kann in einem der beiden Fälle erbracht
werden; es ist kein gesondertes Bestehen beider Anfangswertaufgaben nötig.
Eine gleichwertige elementare Herleitung, etwa über $u=1/y$, ist zugelassen.
Eine knappe korrekte Rechnung zählt; ein lokaler Rechen-, Vorzeichen- oder
Übertragungsfehler bei tragfähigem Lösungsansatz löst keine Kappung aus.
Ein einzelner ausgelassener Sonderfall oder Intervallschritt führt zu den
entsprechenden Punktabzügen, nicht automatisch zu einem weiteren
Bestehenshindernis. Mehrere Kappungsgründe ergeben dieselbe Obergrenze.
Es bleibt bei genau einer Gesamtbewertung.
