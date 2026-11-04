# Das quadratische Sieb an einem kleinen Beispiel erklären

Die natürliche Zahl $N=1649$ soll faktorisiert werden. Erläutere die
Funktionsweise des **quadratischen Siebs** an dem folgenden kleinen Lauf.
Es geht um einen mathematischen Verfahrensnachweis, nicht um ein Programm.
Zeige deine Überlegungen und Rechenschritte. Insgesamt sind **20 BE** erreichbar.

Wir verwenden $Q(x)=x^2-N$, die Faktorbasis $B=\{2,5\}$ und das Intervall
$x=41,42,43,44,45$. Alle $Q(x)$ in diesem Intervall sind positiv.

**1. Verfahrensidee erläutern (4 BE)**

Beschreibe im Zusammenhang, welche Rolle Faktorbasis, Sieben,
Exponentenparitäten und ggT-Berechnung spielen. Begründe, warum man nach
einer Kongruenz $X^2\equiv Y^2\pmod N$ sucht und wie sie zur
Faktorgewinnung führen kann. Eine bloße Liste von Fachwörtern genügt nicht.

**2. Beziehungen durch Sieben gewinnen (6 BE)**

Erläutere, warum $x$ nahe bei $\sqrt N$ zweckmäßig ist. Bestimme die
Restklassen von $x$ modulo $2$ beziehungsweise modulo $5$, für die
$Q(x)$ durch den jeweiligen Faktorbasiseintrag teilbar ist. Erkläre,
warum man dadurch regelmäßig wiederkehrende Stellen im Intervall
markieren kann. Teile dort alle auftretenden Potenzen von $2$ und $5$
aus den $Q(x)$ heraus und vervollständige die Tabelle.

| $x$ | $Q(x)$ | Rest nach Entfernen aller Faktoren 2 und 5 | Vollständig über B zerlegbar? |
|---:|---:|---:|---|
| 41 | | | |
| 42 | | | |
| 43 | | | |
| 44 | | | |
| 45 | | | |

Welche Beziehungen behältst du für den nächsten Schritt, und warum?

**3. Eine Quadratkongruenz und Faktoren gewinnen (7 BE)**

Gib die Exponenten der Faktorbasiseinträge in den behaltenen Beziehungen
an. Wähle eine Kombination, deren Exponentensummen alle gerade sind, und
begründe die Auswahl. Bestimme daraus $X$ und $Y$ mit
$X^2\equiv Y^2\pmod N$; Restvertreter modulo $N$ sind zulässig.
Berechne $\operatorname{ggT}(X-Y,N)$ und
$\operatorname{ggT}(X+Y,N)$, prüfe die erhaltene Faktorisierung und
verbinde deine Rechnung mit der Verfahrensidee aus Teil 1.

**4. Einen scheinbaren Erfolg beurteilen (3 BE)**

Jemand legt stattdessen $X=Y=32$ vor: „Die Quadratkongruenz stimmt,
also haben wir einen nichttrivialen Faktor gefunden.“ Prüfe die Aussage
mit beiden ggT-Werten. Erkläre, was ein erfolgloser ggT-Schritt für das
weitere Vorgehen bedeutet. Unterscheide außerdem das Ziel eines
Primzahltests vom Ziel eines Faktorisierungsverfahrens. Verlangt ist kein
zusätzlicher Primzahltest.
