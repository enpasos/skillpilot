# J10 Mathematics Exam Draft v1

Status: promoted after simulated internal review

Time: 100 minutes

Aids: ruler, pencil, calculator where locally permitted

Total: 64 BE

---

## Task 1 - Akkusensor und Förderkonto (10 BE)

Der Akkustand eines Sensors wird durch `B(t)=1200*0.82^t` modelliert. `t` ist die Zeit in Stunden nach Beginn einer Nachtmessung. Für Ersatzteile wird ein Konto mit `K(n)=2500*1.035^n` modelliert.

1. Beschreibe den Verlauf des Graphen von `B` anhand der Parameter und nenne die Asymptote. (2 BE)
2. Berechne `B(0)` und `B(3)`. (1 BE)
3. Bestimme die Zeit, ab der der Akkustand unter `500 Wh` fällt, und berechne die Halbwertszeit. Erkläre, warum Logarithmen nötig sind. (4 BE)
4. Berechne `K(5)` und erläutere Anfangskapital, Zinssatz, Laufzeit, Endkapital und Zinseszins im Modell. (3 BE)

---

## Task 2 - Riesenradmodell (12 BE)

Die Höhe eines Sensors an einem kleinen Riesenrad wird durch `H(t)=18+14*sin((pi/20)*(t-5))` beschrieben. `t` ist die Zeit in Sekunden.

1. Bestimme Mittellinie, Amplitude, Periode, minimale und maximale Sensorhöhe. (3 BE)
2. Berechne `H(5)` und `H(15)`. (1 BE)
3. Ein zweiter Graph hat Mittellinie `6`, Amplitude `2`, Periode `12` und ein Maximum bei `t=3`; gib einen passenden Kosinus-Term an. (2 BE)
4. Wandle `150 Grad` ins Bogenmaß um. (1 BE)
5. Für einen spitzen Winkel gilt `sin(alpha)=0.6`; bestimme `cos(alpha)`, `tan(alpha)` und `sin(90 Grad-alpha)` mit den trigonometrischen Beziehungen. (3 BE)
6. Gib `H'(t)` an und deute die Ableitung bei `t=15`. (2 BE)

---

## Task 3 - Profil einer Führungsschiene (14 BE)

Eine Führungsschiene wird für `0<=x<=5` modellhaft durch `f(x)=0.1x^3-0.6x^2+0.9x+2` beschrieben.

1. Bestimme Grad, Randverhalten, `f'(x)` und `f''(x)`. (3 BE)
2. Stelle Tangente und Normale im Punkt `x=0` auf und nutze die Tangente als lineare Approximation für `f(0.2)`. (3 BE)
3. Bestimme die Wendestelle und beschreibe das Krümmungsverhalten. (3 BE)
4. Untersuche mit dem Monotoniesatz die Monotonie von `f` und erkläre, warum die Umkehrung des Monotoniesatzes nicht allgemein gilt. (3 BE)
5. Prüfe die Symmetrie von `g(x)=x^4-3x^2+2` und `h(x)=x^3-2x`; begründe, welchen minimalen Grad ein Graph mit beiden Enden nach oben und drei Extremstellen haben muss. (2 BE)

---

## Task 4 - Prüfgleichungen im CAS-Protokoll (8 BE)

In einem CAS-Protokoll sollen drei Gleichungen von Hand kontrolliert werden.

1. Löse `sqrt(x+5)=x-1` durch einmaliges Quadrieren und prüfe mögliche Scheinlösungen. (3 BE)
2. Löse die Potenzgleichung `x^4=81` in den reellen Zahlen. (2 BE)
3. Löse `x^4-5x^2+4=0` mit der Substitution `z=x^2` und führe die Rücksubstitution durch. (3 BE)

---

## Task 5 - Wartungsdrohne und Wassertank (10 BE)

Eine Drohne bewegt sich auf `r(t)=(1|2|0)+t*(2|1|1)`. Eine Kontrollgerade ist `s(u)=(5|4|2)+u*(1|-1|0)`. Ein Regenwassertank ist ein gerader Kreiskegel mit Radius `2.4 m` und Höhe `6 m`.

1. Interpretiere `r(t)` als geradlinige Bewegung und berechne die Drohnenposition für `t=2`. (2 BE)
2. Untersuche, ob `r` und `s` sich schneiden. (3 BE)
3. Vergleiche `r` mit `k(v)=(0|0|1)+v*(2|1|1)` und entscheide die Lagebeziehung. (2 BE)
4. Berechne das Volumen des kegelförmigen Tanks und plausibilisiere die Formel als Grenzfall von Pyramiden. (3 BE)

---

## Task 6 - Sensortest mit Simulation (10 BE)

Aus `8` Sensoren, darunter `3` fehlerhafte, werden ohne Zurücklegen `2` Sensoren ausgewählt. Eine Monte-Carlo-Simulation mit `10000` Durchläufen liefert `1060` Treffer für "beide Sensoren fehlerhaft".

1. Bestimme die Anzahl aller möglichen Zweierauswahlen. (2 BE)
2. Berechne die Wahrscheinlichkeit, dass beide ausgewählten Sensoren fehlerhaft sind. (3 BE)
3. Deute den Näherungswert aus der Simulation und erkläre, warum er vom exakten Modellwert abweichen kann. (3 BE)
4. Beurteile, warum die Voraussetzung "ohne Zurücklegen" für das Modell wichtig ist. (2 BE)

---

