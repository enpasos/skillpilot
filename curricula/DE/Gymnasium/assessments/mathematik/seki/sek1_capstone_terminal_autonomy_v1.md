# Sek-I Capstone Assessment - Mathematik

Status: released

Canonical goal: `30b62966-80d0-45f1-bdd9-b4fb815c7111` (`canonical_math_sek1_practice_capstone`)

## Coverage

Covered goal IDs:

- `81c8da58-9258-488e-9ab8-48500ab31652`
- `7a2a5706-aff4-4fd0-b092-1779d6ecbc1f`
- `811d6d09-130e-47b2-aba8-a5c401fe3251`
- `5fb3ee61-059c-47f4-8c6f-7285d7982a41`
- `f6c9c2b8-3dbd-4839-972f-c60f33c44b63`
- `cb20dd6b-c4ff-4a1b-9636-3b3d6ea86aa8`

Covered strands: `L1`, `L2`, `L3`, `L4`, `L5`

Demand levels: `AB1`, `AB2`, `AB3`

## Task

Die Schule plant ein Klima- und Forschungsfestival auf dem Campus. Alle Laengen sind in Metern angegeben, sofern nichts anderes angegeben ist.

Campusplan:

Der rechteckige Campus hat die Eckpunkte `A(0|0)`, `B(36|0)`, `C(36|24)`, `D(0|24)`. Eine Buehne wird als rechtwinkliges Dreieck mit Katheten `9 m` und `12 m` geplant.

Besuchsdaten:

| Jahrgang | erschienene Personen |
| --- | ---: |
| J5 | 48 |
| J6 | 52 |
| J7 | 55 |
| J8 | 49 |
| J9 | 47 |
| J10 | 35 |

Kasse:

| Vorgang | Betrag |
| --- | ---: |
| Startguthaben | `+1800 EUR` |
| Sponsor | `+420 EUR` |
| Material | `-645.50 EUR` |
| Verpflegung | `-378.25 EUR` |
| Eintritt | `286` Tickets zu je `3.50 EUR` |

Shuttle:

Anbieter A verlangt `120 EUR` Grundpreis und `2.40 EUR` pro Person. Anbieter B verlangt `60 EUR` Grundpreis und `3.00 EUR` pro Person.

Eingangsbogen:

Der Bogen beruehrt den Boden bei `x=0` und `x=10`. Der Scheitelpunkt liegt bei `S(5|3.125)`.

Energie- und Bewegungsmodelle:

Der Akkustand eines Messgeraets wird durch `E(t)=900*0.86^t` beschrieben. Die Plattformhoehe wird durch `P(t)=5+2*sin((pi/6)*(t-1))` beschrieben. Ein Schienenprofil wird modelliert durch `q(x)=0.05x^3-0.3x^2+0.45x+1`.

Wassertank:

Ein zylindrischer Tank hat Radius `0.75 m` und Hoehe `1.8 m`; ein kegelfoermiger Deckel hat denselben Radius und Hoehe `0.6 m`.

Drohne:

Die Drohne bewegt sich auf `r(t)=(0|2|1)+t*(3|1|0.5)`. Ein Kontrollstrahl verlaeuft auf `s(u)=(6|4|2)+u*(1|-2|1)`.

Sensorpruefung:

Von `10` Sensoren sind `4` fehlerhaft. Es werden ohne Zuruecklegen `3` Sensoren ausgewaehlt.

1. Daten und Kasse: Berechne die Gesamtzahl der erschienenen Personen. Bestimme Mittelwert, Median und Spannweite der Besuchsdaten. Berechne den Anteil von J10 an allen erschienenen Personen in Prozent. Bestimme den Kassenstand nach allen Vorgängen. `(10 BE)`

2. Lineare Modelle und Maßstab: Stelle die Kostenfunktionen fuer beide Shuttle-Anbieter auf. Bestimme rechnerisch den Schnittpunkt und entscheide fuer `286` Personen den guenstigeren Anbieter. Zeichne den Campus im Maßstab `1:250`: Bestimme die Planlaengen der Seiten `36 m` und `24 m` in Zentimetern. `(10 BE)`

3. Geometrie und quadratisches Modell: Berechne Flaecheninhalt des Campus und der Buehne sowie die Hypotenuse der Buehne. Bestimme eine Funktionsgleichung fuer den Eingangsbogen in Scheitelpunktform und faktorisierter Form. Berechne die Bogenhoehe bei `x=2` und die beiden Stellen, an denen der Bogen `2.5 m` hoch ist. `(12 BE)`

4. Exponential-, trigonometrische und ganzrationale Modelle: Berechne `E(4)`, bestimme die Zeit, ab der der Akkustand unter `300 Wh` faellt, und berechne die Halbwertszeit. Bestimme bei `P` Mittellinie, Amplitude, Periode, `P(1)`, `P(4)` und `P'(t)`. Bestimme `q'(x)`, `q''(x)`, Tangente an `q` bei `x=0`, Wendestelle und Monotonieintervalle. `(18 BE)`

5. Raumgeometrie, Vektoren und Volumen: Interpretiere `r(t)` als Bewegung und berechne die Position fuer `t=2`. Untersuche, ob `r` und `s` sich schneiden. Berechne das Volumen des zylindrischen Tanks, das Volumen des Kegeldeckels und das Gesamtvolumen. Plausibilisiere die Kegelformel kurz als Grenzfall von Pyramiden. `(12 BE)`

6. Kombinatorik, Wahrscheinlichkeit und Reflexion: Bestimme die Anzahl aller moeglichen Dreierauswahlen. Berechne die Wahrscheinlichkeit, dass genau zwei der drei ausgewaehlten Sensoren fehlerhaft sind. Eine Simulation mit `10000` Durchlaeufen liefert `2940` Treffer; deute den Wert. Nenne zwei Stellen der Aufgabe, an denen ein Ergebnis im Sachzusammenhang geprueft werden muss. `(10 BE)`

## Solution

1. Insgesamt erschienen `48+52+55+49+47+35=286` Personen. Der Mittelwert ist `286/6≈47.7`. Sortiert: `35,47,48,49,52,55`; der Median ist `(48+49)/2=48.5`. Die Spannweite ist `55-35=20`. Der J10-Anteil ist `35/286≈0.122`, also etwa `12.2%`. Der Eintritt bringt `286*3.50=1001 EUR`. Kassenstand: `1800+420-645.50-378.25+1001=2197.25 EUR`.

2. `A(x)=120+2.40x`, `B(x)=60+3.00x`. Schnittpunkt: `120+2.40x=60+3.00x`, also `60=0.60x` und `x=100`; Kosten dann `360 EUR`. Fuer `286` Personen gilt `A(286)=806.40 EUR`, `B(286)=918 EUR`, also ist Anbieter A guenstiger. Beim Maßstab `1:250` entsprechen `36 m=3600 cm` der Planlaenge `14.4 cm`, und `24 m=2400 cm` der Planlaenge `9.6 cm`.

3. Campusflaeche: `36*24=864 m^2`. Buehnenflaeche: `9*12/2=54 m^2`. Hypotenuse: `sqrt(9^2+12^2)=15 m`. Fuer den Bogen gilt in faktorisierter Form `h(x)=-0.125x(x-10)`, weil die Nullstellen `0` und `10` sind und `h(5)=3.125`. In Scheitelpunktform: `h(x)=-0.125(x-5)^2+3.125`. `h(2)=2.0`. Fuer `h(x)=2.5` gilt `(x-5)^2=5`, also `x=5+-sqrt(5)≈2.76` und `7.24`.

4. `E(4)=900*0.86^4≈492.3 Wh`. Fuer `E(t)<300` gilt `0.86^t<1/3`, also `t>log(1/3)/log(0.86)≈7.29`. Die Halbwertszeit ist `log(0.5)/log(0.86)≈4.60`. Bei `P` sind Mittellinie `5`, Amplitude `2`, Periode `12`; `P(1)=5`, `P(4)=7`. `P'(t)=(pi/3)*cos((pi/6)*(t-1))`. Fuer `q` gilt `q'(x)=0.15x^2-0.6x+0.45=0.15(x-1)(x-3)` und `q''(x)=0.3x-0.6`. Bei `x=0` ist `q(0)=1` und `q'(0)=0.45`, also Tangente `y=0.45x+1`. Die Wendestelle liegt bei `x=2`, `q(2)=1.1`. Wegen der Vorzeichen von `q'` ist `q` auf `(-infty,1)` steigend, auf `(1,3)` fallend und auf `(3,infty)` steigend.

5. `r(t)` beschreibt eine geradlinige Bewegung mit Startpunkt `(0|2|1)` und Richtungsvektor `(3|1|0.5)`. Fuer `t=2` liegt die Drohne bei `(6|4|2)`. Fuer einen Schnitt mit `s` loest man `(3t,2+t,1+0.5t)=(6+u,4-2u,2+u)`. Mit `t=2` ergibt sich in allen Koordinaten `u=0`, also schneiden sich die Geraden in `(6|4|2)`. Zylindervolumen: `V_Z=pi*0.75^2*1.8=1.0125pi≈3.18 m^3`. Kegelvolumen: `V_K=(1/3)*pi*0.75^2*0.6=0.1125pi≈0.35 m^3`. Gesamtvolumen etwa `3.53 m^3`. Die Kegelformel ist plausibel, weil ein Kegel als Grenzfall von Pyramiden mit immer feinerer Grundflaeche verstanden werden kann.

6. Es gibt `C(10,3)=120` moegliche Dreierauswahlen. Genau zwei fehlerhafte Sensoren: `C(4,2)*C(6,1)=6*6=36`, also `36/120=0.30`. Die Simulation liefert `2940/10000=0.294`; das ist eine plausible Naeherung an `0.30`, aber wegen Zufallsschwankungen nicht exakt. Geprueft werden muss zum Beispiel, ob der Kassenstand positiv und realistisch ist, ob der Shuttle-Anbieter fuer die tatsaechliche Personenzahl verglichen wurde, ob Modellzeiten im Sachkontext sinnvoll sind oder ob Tankvolumina mit passenden Einheiten angegeben sind.

## Scoring

Max points: 72

Passing points: 36

Steps:

- `sek1_capstone_released_1` - 10 BE - Besuchsdaten, Prozentanteil und Kassenrechnung korrekt ausgewertet.
- `sek1_capstone_released_2` - 10 BE - Lineare Kostenmodelle, Schnittpunkt, Anbieterentscheidung und Maßstabsrechnung fachgerecht bearbeitet.
- `sek1_capstone_released_3` - 12 BE - Flaechen, Pythagoras und quadratischen Eingangsbogen in mehreren Darstellungen korrekt genutzt.
- `sek1_capstone_released_4` - 18 BE - Exponential-, trigonometrische und ganzrationale Modelle inklusive Ableitungen, Logarithmen und Monotonie analysiert.
- `sek1_capstone_released_5` - 12 BE - Raumvektoren, Schnittpunkt, Zylinder- und Kegelvolumen berechnet und begruendet.
- `sek1_capstone_released_6` - 10 BE - Kombinatorische Wahrscheinlichkeit, Simulation und Kontextpruefung reflektiert.
