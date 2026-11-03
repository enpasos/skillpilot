# Musterlösung und normale Bewertungsrubrik

Dies ist ein möglicher Lösungsweg. Gleichwertige Binomialsummen, Verteilungsfunktionen, Komplementdarstellungen oder begründete digitale Berechnungen sind zulässig. Die folgenden Bezeichnungen sind keine vorgeschriebene Abgabeform.

## Fehlerwahrscheinlichkeiten und Teststärke

Die obere Binomial-Randwahrscheinlichkeit steigt mit $p$. Für die beiden rechtsseitigen Regeln wird die größte Verwerfungswahrscheinlichkeit unter $H_0:p\leq0{,}05$ daher am Rand $p_0=0{,}05$ erreicht.

Für Regel A gilt:

$$
\alpha_A=P_{0{,}05}(X\geq10)
=1-\sum_{k=0}^{9}\binom{100}{k}0{,}05^k0{,}95^{100-k}
\approx0{,}0281883.
$$

$$
\beta_A(0{,}12)=P_{0{,}12}(X\leq9)
=\sum_{k=0}^{9}\binom{100}{k}0{,}12^k0{,}88^{100-k}
\approx0{,}2256519.
$$

$$
G_A(0{,}12)=P_{0{,}12}(X\geq10)
=1-\beta_A(0{,}12)\approx0{,}7743481.
$$

Für Regel B entsprechend:

$$
\alpha_B=P_{0{,}05}(X\geq8)\approx0{,}1279605,
$$

$$
\beta_B(0{,}12)=P_{0{,}12}(X\leq7)\approx0{,}0761361,
\qquad G_B(0{,}12)=1-\beta_B(0{,}12)\approx0{,}9238639.
$$

| Regel | Fehler 1. Art am Nullrand | Fehler 2. Art bei $p_1=0{,}12$ | Teststärke bei $p_1=0{,}12$ |
|---|---:|---:|---:|
| A | $2{,}8188\,\%$ | $22{,}5652\,\%$ | $77{,}4348\,\%$ |
| B | $12{,}7960\,\%$ | $7{,}6136\,\%$ | $92{,}3864\,\%$ |

Ein **Fehler 1. Art** löst eine Untersuchung aus, obwohl die wahre Fehlerquote höchstens $5\,\%$ beträgt. Die berechneten Zahlen beziehen sich auf den ungünstigsten Nullrand; sie garantieren keine feste Anzahl von Fehlalarmen in einer endlichen Wiederholungsserie.

Ein **Fehler 2. Art bei $p_1$** liegt vor, wenn die Produktion trotz einer tatsächlichen Fehlerquote von $12\,\%$ durch die Regel nicht beanstandet wird. Die Teststärke ist die Wahrscheinlichkeit, diese konkrete Abweichung zu erkennen. $\beta$ und Teststärke sind hier Aussagen **unter der benannten Alternative**, keine Wahrscheinlichkeiten dafür, dass die Alternative nach der Beobachtung wahr ist.

B verwirft bereits bei kleineren Fehlerzahlen. Bei gleicher Stichprobengröße führt das zu mehr Fehlalarmen, aber bei $p_1$ zu weniger übersehenen Abweichungen und höherer Teststärke. Welche Regel vorzuziehen ist, hängt deshalb vom Einsatzziel ab.

## Beobachtung und Kontextentscheidungen

Bei $X=9$ verwirft A die Nullhypothese nicht, B verwirft sie. Das Nichtverwerfen durch A beweist $p\leq0{,}05$ nicht. Auch das Verwerfen durch B ist kein sicherer Beweis für $p>0{,}05$; die Fehlerwahrscheinlichkeiten beschreiben gerade die möglichen Fehlentscheidungen.

Für die **Routinekontrolle ist A geeignet**: $\alpha_A\approx2{,}82\,\%\leq5\,\%$ und $G_A(0{,}12)\approx77{,}43\,\%\geq75\,\%$. B erfüllt zwar das Stärkeziel, überschreitet aber die erlaubte Fehlalarmwahrscheinlichkeit.

Für die **zeitweise gezielte Fehlersuche ist B geeignet**: $\alpha_B\approx12{,}80\,\%\leq15\,\%$ und $G_B(0{,}12)\approx92{,}39\,\%\geq90\,\%$. A hält die Fehlalarmgrenze ein, erreicht aber die geforderte Teststärke nicht. Das ist eine Entscheidung für diese beiden vorgegebenen Regeln und Ziele, keine Aussage über ein weltweit optimales Verfahren.

## Ein Gesamtscore: 20 BE, bestanden ab 15 BE

Jede der folgenden Zeilen zählt einen Punkt. Die Nachweise dürfen an jeder passenden Stelle der gesamten Abgabe stehen; dieselbe Leistung wird nur einmal gezählt.

| ID | Bewertbare Leistung | BE |
|---|---|---:|
| alpha_a_event | Fehler-I-Ereignis für A mit $p_0$ korrekt angesetzt | 1 |
| alpha_a_value | Zugehörige Wahrscheinlichkeit korrekt berechnet | 1 |
| alpha_b_event | Fehler-I-Ereignis für B mit $p_0$ korrekt angesetzt | 1 |
| alpha_b_value | Zugehörige Wahrscheinlichkeit korrekt berechnet | 1 |
| beta_a_event | Nichtverwerfungsereignis für A bei $p_1$ korrekt angesetzt | 1 |
| beta_a_value | Zugehörige Wahrscheinlichkeit korrekt berechnet | 1 |
| beta_b_event | Nichtverwerfungsereignis für B bei $p_1$ korrekt angesetzt | 1 |
| beta_b_value | Zugehörige Wahrscheinlichkeit korrekt berechnet | 1 |
| type_i_context | Fehlalarm bei tatsächlich erfülltem $H_0$ im Kontext erklärt | 1 |
| type_ii_context | Nichtentdeckung bei tatsächlich $p_1=0{,}12$ im Kontext erklärt | 1 |
| power_a | Teststärke von A bei $p_1$ als Verwerfungswahrscheinlichkeit oder korrektes Komplement bestimmt | 1 |
| power_b | Teststärke von B bei $p_1$ entsprechend bestimmt | 1 |
| comparison | Beide Regeln anhand des Fehlalarm-/Nichtentdeckungs-/Stärke-Zielkonflikts ausdrücklich verglichen | 1 |
| observed_a | A bei $X=9$ richtig angewendet | 1 |
| observed_b | B bei $X=9$ richtig angewendet | 1 |
| inference_limit | Testentscheidung als unsichere Entscheidung erläutert, nicht als Beweis oder nachträgliche Hypothesenwahrscheinlichkeit | 1 |
| routine_choice | Für die Routinekontrolle eine tragfähige Auswahl getroffen | 1 |
| routine_reason | Beide Routineanforderungen geprüft und die andere Regel anhand der verletzten/erfüllten Bedingung bewertet | 1 |
| targeted_choice | Für die gezielte Fehlersuche eine tragfähige Auswahl getroffen | 1 |
| targeted_reason | Beide Anforderungen der Fehlersuche geprüft und die andere Regel anhand der verletzten/erfüllten Bedingung bewertet | 1 |

**Eine normale Gesamtkappung:** Der Gesamtscore beträgt höchstens **14 BE**, wenn eine ganze Kernleistung fehlt: Es wird nur eine der beiden Regeln inhaltlich untersucht; eine verwendbare Behandlung der Fehler-I-Seite beider Regeln fehlt vollständig; eine verwendbare Behandlung der Fehler-II-Seite unter der benannten Alternative fehlt vollständig; eine Aussage zur Teststärke unter dieser Alternative fehlt vollständig (auch eine korrekt interpretierte Komplementaussage ist zulässig); oder die Abgabe enthält insgesamt keinen tragfähigen Vergleich beider Regeln beziehungsweise keine begründete Kontextentscheidung. Ein Vergleich in den Kontextbegründungen zählt ebenso. Es gibt nur diese eine Gesamtkappung, keine Teilbestehen oder zusätzlichen Ergebniszustände.

**Faire Folgearbeit:** Ein lokaler Rechen-, Rundungs-, Index- oder Bezeichnungsfehler ist für sich kein Kappungsgrund. Einen identischen Ausgangsfehler nur einmal an der verursachenden Zeile werten. Danach korrekte Berechnungen zum angegebenen eigenen Ereignis und folgerichtige Vergleiche/Entscheidungen zu den eigenen Zahlen erhalten die entsprechenden Verfahrenspunkte; voneinander unabhängige neue Fehler bleiben bewertbar. Beispielsweise kostet ein falsch ausgewerteter, aber richtig angesetzter $\beta_A$-Term den Zahlenpunkt; korrekt fortgeführte Komplemente und daraus nachvollziehbar abgeleitete Konsequenzen werden nicht noch einmal wegen derselben Zahl abgewertet. Richtig begründete exakte oder hinreichend genaue alternative Berechnungen sind gleichwertig. Eine falsche Zahl ersetzt umgekehrt keinen vollständig fehlenden Kernnachweis.

