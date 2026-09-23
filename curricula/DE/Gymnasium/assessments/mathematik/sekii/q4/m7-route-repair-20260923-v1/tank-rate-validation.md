# Zuflussmodell für einen Wassertank prüfen · LK · Kandidat

Geprüfte Ziele: dc12f281-f161-572b-a973-8405ae9b2498, 0b162cb0-8507-5ac2-b9d6-57f40f4d3f35, 71fe4a39-38e8-5c6a-8eef-ff4783fe70c2. Vorgeschlagene Bewertung: 20 BE, Bestehensgrenze 10 BE. Bearbeitungszeit etwa 25 Minuten. Keine Veröffentlichung ohne unabhängige Prüfung.

## Aufgabe (DE)

Ein Wassertank enthält zu Beginn 20 Liter. Für die folgenden sechs Stunden wird der Zufluss durch $r(t)=12t-2t^2$ in Litern pro Stunde modelliert; $t$ wird in Stunden seit Beginn gemessen. Das Modell gilt nur für $0\le t\le6$ und nimmt an, dass kein Wasser abfließt. Ein Sensor meldet nach sechs Stunden einen Tankinhalt von $86\pm3$ Litern.

1. Wähle eine Methode der Differentialrechnung, um den Zeitpunkt und die Größe des größten modellierten Zuflusses zu bestimmen. Erläutere die Bedeutung deines Ergebnisses mit Einheiten. (6 BE)
2. Wähle eine Methode der Integralrechnung, um die gesamte modellierte Zuflussmenge und damit den prognostizierten Tankinhalt nach sechs Stunden zu bestimmen. Begründe, warum die Zuflussrate dazu integriert und nicht nur ihr Endwert eingesetzt wird. (7 BE)
3. Prüfe die Modellprognose gegen die Sensormessung. Benenne mindestens zwei mögliche Ursachen einer Abweichung, die aus den vorliegenden Daten nicht auseinandergehalten werden können, und erkläre zwei Grenzen der Modellverwendung. (7 BE)

## Musterlösung und Bewertung (DE)

1. Ein Maximum der Zuflussrate liegt bei $r'(t)=12-4t=0$, also $t=3$ h. Wegen $r''(t)=-4<0$ und $r(0)=r(6)=0$ ist dies das globale Maximum im angegebenen Intervall. $r(3)=18$ Liter pro Stunde: Nach drei Stunden ist der momentane Zufluss am größten, nicht der Tankinhalt. 1 BE für die passende Ableitungsmethode, 1 BE für $r'$, 1 BE für $t=3$, 1 BE für die Randwert-/Maximumsprüfung, 1 BE für $r(3)$ und 1 BE für die richtige Kontextdeutung mit Einheiten.
2. Die insgesamt zugeflossene Menge ist $\int_0^6 r(t)\,dt=[6t^2-\frac23t^3]_0^6=216-144=72$ Liter. Der prognostizierte Tankinhalt ist $20+72=92$ Liter. $r(6)=0$ Liter pro Stunde beschreibt nur den momentanen Zufluss am Ende; das Integral summiert die Beiträge über die Zeit. 1 BE für die Wahl des bestimmten Integrals, 1 BE für Grenzen und Einheit, 2 BE für die Stammfunktion, 1 BE für 72 Liter, 1 BE für 92 Liter und 1 BE für die begründete Abgrenzung vom Endwert der Rate.
3. Der Messbereich ist $[83,89]$ Liter; die Modellprognose 92 Liter liegt außerhalb, nämlich 6 Liter über dem Messzentrum und mindestens 3 Liter über der oberen Grenze. Die Angabe $\pm3$ ist hier ein Messintervall, **keine** Aussage über die Sicherheit aller Modellparameter. Mögliche Ursachen sind ein unberücksichtigter Abfluss/Leck, eine abweichende tatsächliche Zuflussrate, ein fehlerhafter Anfangsinhalt oder ein systematischer Sensorfehler. Eine Endmessung allein identifiziert keine dieser Ursachen. Grenzen: Das Modell setzt keinen Abfluss voraus; es ist nur für $0\le t\le6$ angegeben, sodass eine Fortschreibung auf spätere Zeiten unbegründet ist. Andere konkret begründete Modellgrenzen zählen. 2 BE für den korrekten Intervallvergleich, 2 BE für zwei plausible und nicht unterscheidbare Ursachen, 2 BE für zwei sachlich korrekte Grenzen, 1 BE für die Einsicht, dass der Endwert die Ursache nicht identifiziert.

Gesamt: 20 BE. Gleichwertige rechnerische und fachliche Argumentationen werden anerkannt. Ein Modellfehler kann hier vermutet, aber aus dieser Einzelmessung nicht lokalisiert werden.

## Task (EN)

A water tank initially contains 20 litres. For the next six hours its inflow is modelled by $r(t)=12t-2t^2$ litres per hour, where $t$ is the time in hours since the start. The model is specified only for $0\le t\le6$ and assumes no outflow. A sensor reports a tank volume of $86\pm3$ litres after six hours.

1. Choose a differential-calculus method to determine when the modelled inflow rate is greatest and what that rate is. Interpret the result with units. (6 points)
2. Choose an integral-calculus method to determine the total modelled inflow and hence the predicted tank volume after six hours. Explain why you integrate the inflow rate rather than merely use its endpoint value. (7 points)
3. Check the prediction against the sensor reading. Name at least two possible causes of any discrepancy that cannot be distinguished from the available data, and explain two limits of using the model. (7 points)

## Solution and scoring (EN)

1. $r'(t)=12-4t=0$ gives $t=3$ h. Since $r''(t)=-4<0$ and $r(0)=r(6)=0$, this is the global maximum on the stated interval. $r(3)=18$ litres per hour: the *instantaneous inflow*, not the tank volume, is greatest after three hours. Award 1 point each for choosing differentiation, finding $r'$, finding $t=3$, checking maximum/endpoints, finding $r(3)$, and interpreting the rate with units.
2. The total inflow is $\int_0^6r(t)\,dt=[6t^2-\frac23t^3]_0^6=216-144=72$ litres. The predicted final tank volume is $20+72=92$ litres. $r(6)=0$ litres per hour is only the instantaneous inflow at the end; the integral accumulates the inflow over time. Award 1 point for choosing a definite integral, 1 for limits and units, 2 for the antiderivative, 1 for 72 litres, 1 for 92 litres, and 1 for explaining why the endpoint rate is insufficient.
3. The measurement interval is $[83,89]$ litres. The prediction of 92 litres lies outside it: 6 litres above its centre and at least 3 litres above its upper end. The $\pm3$ describes measurement uncertainty, **not** uncertainty of all model parameters. Possible causes include unmodelled outflow/leakage, a different actual inflow, a wrong initial volume, or systematic sensor error. One endpoint measurement cannot identify the cause. Model limits include its no-outflow assumption and its stated time domain $0\le t\le6$, which does not justify extrapolation beyond six hours. Other specifically justified limits count. Award 2 points for the interval check, 2 for two plausible indistinguishable causes, 2 for two sound model limits, and 1 for the lack of causal identification.

Total: 20 points. Equivalent calculations and sound explanations are accepted. A model mismatch is suggested, but its cause cannot be located from this single measurement.
