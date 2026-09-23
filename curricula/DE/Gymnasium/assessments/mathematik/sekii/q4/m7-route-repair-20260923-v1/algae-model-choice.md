# Wachstumsmodelle für eine Algenkultur vergleichen · LK · Kandidat

Geprüfte Ziele: 74f28ce7-e568-5d6e-b946-17445b344fcc, 163dd583-8308-53f0-b60d-34588787988d, 519660d0-85e5-57a6-a219-d0a253336649. Vorgeschlagene Bewertung: 20 BE, Bestehensgrenze 10 BE. Bearbeitungszeit etwa 25 Minuten. Keine Veröffentlichung ohne unabhängige Prüfung.

## Aufgabe (DE)

Die Masse einer Algenkultur wird einmal täglich gemessen. Für die Tage $t=0,1,2,3$ ergeben sich in Gramm die Werte $100,120,144,173$. Jeder Messwert hat eine Unsicherheit von höchstens $\pm5$ g. Für eine kurzfristige Schätzung der Masse an Tag 4 stehen ein lineares und ein exponentielles Modell zur Diskussion.

1. Entwickle ein lineares Modell durch die Messwerte an Tag 0 und Tag 3 und ein exponentielles Modell durch die Messwerte an Tag 0 und Tag 2. Gib jeweils die Modellannahme an, die über die gemessenen Werte hinausgeht. (6 BE)
2. Vergleiche die beiden Modelle anhand ihrer Abweichungen an den übrigen Messtagen, ihrer Einfachheit und ihrer Interpretierbarkeit. Berechne die beiden Vorhersagen für Tag 4. (7 BE)
3. Entscheide begründet, welches Modell du für eine vorsichtige Schätzung an Tag 4 verwenden würdest, oder begründe, warum die Daten noch keine eindeutige Entscheidung tragen. Erkläre qualitativ **sowohl** den Einfluss der Messunsicherheit **als auch** den einer geänderten Wachstumsannahme auf deine Entscheidung, und benenne eine zusätzliche Information, die helfen würde. (7 BE)

## Musterlösung und Bewertung (DE)

1. Das lineare Modell ist $L(t)=100+\frac{73}{3}t$: Es setzt einen konstanten absoluten Zuwachs von etwa $24{,}33$ g pro Tag voraus. Das exponentielle Modell ist $E(t)=100\cdot1{,}2^t$, denn $1{,}2^2=144/100$; es setzt einen konstanten relativen Zuwachs von 20 % pro Tag voraus. 2 BE je korrekt konstruiertem Modell und 1 BE je explizit formulierter Annahme.
2. $L(1)\approx124{,}33$ g und $L(2)\approx148{,}67$ g, also Abweichungen von etwa $4{,}33$ g und $4{,}67$ g. $E(1)=120$ g und $E(3)=172{,}8$ g, also Abweichungen von 0 g und $0{,}2$ g. Beide Modelle stimmen im betrachteten Messbereich mit der Unsicherheit von $\pm5$ g überein. Das lineare Modell hat einen konstanten Zuwachs und ist rechnerisch einfach; das exponentielle passt hier den Zentralwerten enger, setzt aber einen dauerhaft konstanten prozentualen Zuwachs voraus. Für Tag 4 ergeben sich $L(4)=197{,}33\ldots$ g und $E(4)=207{,}36$ g. 1 BE je linearem Restwert, 1 BE für die exponentiellen Restwerte, 2 BE für den begründeten Vergleich der drei Kriterien und 1 BE je Tages-4-Prognose.
3. Keine Modellwahl ist allein aus diesen vier unsicheren Messungen zwingend. Eine Wahl von $E$ wegen der kleineren Restabweichungen ist ebenso vertretbar wie eine vorsichtige Wahl von $L$ unter einer begründeten Annahme abnehmenden relativen Wachstums; auch das Zurückstellen der Entscheidung ist vertretbar. Wichtig ist, dass die Annahme zur kurzfristigen Extrapolation genannt wird. Schon kleine Änderungen der Eingangswerte ändern die geschätzten Parameter und Tag-4-Werte; der Abstand der beiden Prognosen beträgt etwa 10 g, während die Messunsicherheit die Datenunterscheidung erschwert. Aus $\pm5$ g Messunsicherheit folgt **kein** fertiges $\pm5$-g-Prognoseintervall. Weitere Messungen nach Tag 3 oder unabhängige Informationen über Nährstoffgrenzen würden helfen. 2 BE für eine kriteriensensible Entscheidung oder begründete Offenheit, 2 BE für die korrekte Rolle der Messunsicherheit, 2 BE für die Sensitivität gegenüber einer veränderten Annahme und 1 BE für hilfreiche zusätzliche Information. Eine andere fachlich stimmige Modellwahl erhält dieselben Punkte.

Gesamt: 20 BE. Gute Antworten dürfen die Modelle anders, aber mathematisch äquivalent parametrisieren. Der beobachtete bessere Fit des exponentiellen Modells beweist kein unbegrenztes exponentielles Wachstum.

## Task (EN)

The mass of an algae culture is measured once a day. On days $t=0,1,2,3$ the measured values, in grams, are $100,120,144,173$. Each measurement has an uncertainty of at most $\pm5$ g. A linear and an exponential model are being considered to estimate the mass on day 4.

1. Construct a linear model through the measurements on days 0 and 3 and an exponential model through those on days 0 and 2. State the assumption each model makes beyond the measurements. (6 points)
2. Compare both models using their residuals on the other measured days, simplicity and interpretability. Calculate both day-4 predictions. (7 points)
3. Give a reasoned choice of model for a cautious day-4 estimate, or explain why the data do not justify a unique choice yet. Explain qualitatively **both** how measurement uncertainty **and** how a changed growth assumption could affect your decision, and name one additional piece of information that would help. (7 points)

## Solution and scoring (EN)

1. $L(t)=100+\frac{73}{3}t$ assumes a constant absolute increase of about $24.33$ g per day. $E(t)=100\cdot1.2^t$, since $1.2^2=144/100$, assumes a constant relative increase of 20% per day. Award 2 points for each correctly constructed model and 1 for each explicit assumption.
2. $L(1)\approx124.33$ g and $L(2)\approx148.67$ g, residuals of about $4.33$ g and $4.67$ g. $E(1)=120$ g and $E(3)=172.8$ g, residuals of 0 g and $0.2$ g. Both are consistent with the stated $\pm5$-g measurement uncertainty over the observed interval. The linear model is simple and assumes a constant increment; the exponential model fits the central values better but assumes a constant relative growth rate. $L(4)=197.33\ldots$ g and $E(4)=207.36$ g. Award 1 point for each linear residual, 1 for both exponential residuals, 2 for a justified comparison across the three criteria, and 1 for each day-4 prediction.
3. These four uncertain observations do not compel a unique choice. Choosing $E$ because of its smaller residuals, choosing $L$ with an explained expectation of slowing relative growth, or deferring the choice can all be defensible. The short-term extrapolation assumption must be explicit. Small changes in input values change the fitted parameters and day-4 predictions; the two predictions differ by about 10 g, while measurement uncertainty makes it harder to distinguish models from these data. A $\pm5$-g measurement error does **not** imply a ready-made $\pm5$-g prediction interval. Additional measurements after day 3 or independent information about nutrient limits would help. Award 2 points for a criteria-based choice or justified openness, 2 for handling measurement uncertainty correctly, 2 for sensitivity to changed assumptions, and 1 for useful additional information. Equally sound model choices receive equal credit.

Total: 20 points. Equivalent parameterizations are acceptable. The better observed fit of the exponential model does not prove unlimited exponential growth.
