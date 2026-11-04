# Eine sparsame und verlässliche Prüfregel entwickeln

Ein Betrieb untersucht eine große Lieferung durch unabhängige, zufällig
ausgewählte Teile. Jedes Teil ist mit derselben Wahrscheinlichkeit $p$
fehlerhaft. In diesem vereinfachten Entscheidungsmodell kommen **nur**
$H_0:p=0{,}10$ und $H_1:p=0{,}30$ infrage. „Beanstanden“ bedeutet,
$H_0$ zu verwerfen; „nicht beanstanden“ bedeutet keine Gewissheit über $H_0$.

Gesucht ist eine Regel mit
$P_{0{,}10}(\text{beanstanden})\leq0{,}05$ und
$P_{0{,}30}(\text{beanstanden})\geq0{,}90$.
Unter den zulässigen Regeln soll die **erwartete Anzahl geprüfter Teile bei
$p=0{,}10$** möglichst klein sein. Verglichen werden ausschließlich die
folgenden Entwürfe. Ein Rechner für Binomialwahrscheinlichkeiten ist erlaubt;
gib die Ereignisse beziehungsweise Summen an, die du berechnest.
Insgesamt sind **20 BE** erreichbar.

**1. Feste Stichproben (5 BE)**

Für $n=20$ und $n=40$ wird beanstandet, wenn die Fehlerzahl $X_n\geq k_n$
ist. Bestimme jeweils die kleinste ganzzahlige Schwelle $k_n$, die die
erste Fehlergrenze einhält. Belege die Grenze auch durch die unmittelbar
kleinere Schwelle. Prüfe dann die geforderte Entdeckungswahrscheinlichkeit.
Erläutere, weshalb unter diesen Schwellen eine größere Schwelle keine
bessere Entdeckungswahrscheinlichkeit bringt.

**2. Zweistufige Regeln entwickeln und prüfen (8 BE)**

Zunächst werden $20$ Teile geprüft; ihre Fehlerzahl ist $X$. Wähle
$r\in\{5,6\}$ und vervollständige damit folgende Regel:

- Falls $X\geq r$: sofort beanstanden.
- Falls $X\leq2$: sofort nicht beanstanden.
- Falls $3\leq X\leq r-1$: weitere $20$ unabhängige Teile prüfen.
  Ihre Fehlerzahl sei $Y$. Beanstanden genau dann, wenn $X+Y\geq8$.

Leite für beliebiges $p$ eine Formel für die Beanstandungswahrscheinlichkeit
dieser **gesamten** Regel her. Berechne sie für beide Werte von $r$ jeweils
bei $p=0{,}10$ und $p=0{,}30$. Entscheide, welche Entwürfe beide Grenzen
einhalten. Erkläre, warum die Fehlerwahrscheinlichkeit der zweistufigen
Regel nicht einfach $P_p(X+Y\geq8)$ ist.

**3. Aufwand und endgültige Entscheidung (5 BE)**

Bestimme für die zulässige zweistufige Regel die erwartete Anzahl $N$
geprüfter Teile bei $p=0{,}10$. Vergleiche sie mit den zulässigen festen
Regeln. Formuliere eine eindeutige vollständige Handlungsvorschrift für
den Betrieb und begründe deine Wahl durch beide Fehlergrenzen und das
Aufwandsziel. Ordne auch $X=2$, $X=5$ und $X=6$ ausdrücklich ein.

**4. Aussagegrenze (2 BE)**

Beurteile: „Unsere Rechnung beweist die verlangten Fehlergrenzen für jeden
denkbaren Fehleranteil einer realen Lieferung.“ Nenne zwei Annahmen oder
Einschränkungen, die für deine Entscheidung wichtig sind.
