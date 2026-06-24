# J10 Terminal Autonomy Assessment - Mathematik

Status: released

Canonical goal: `cb20dd6b-c4ff-4a1b-9636-3b3d6ea86aa8` (`canonical_math_sek1_practice_j10`)

## Coverage

Covered goal IDs:

- `46bdcc16-418f-417a-89cf-033d7ae6c8cc`
- `82597dfb-0ec6-4a77-abaf-e1d6bdd12041`
- `31207307-0cf9-4a56-bf14-90196dc2b3d4`
- `c74d0c7e-44e2-46ab-8f95-b8dc45fcfae7`
- `aa334054-d145-4ece-a796-f5b8159ef76f`
- `27b63e2e-6a34-483e-8e5a-fe0f49670d1d`
- `78238608-aaaa-4d12-a9de-54f325e9cf6f`
- `7f11ffe0-7c43-4507-9101-50374a60b0e8`
- `6a4716bd-8038-46bb-b647-0db4a254fee7`
- `0190e463-51a7-4860-9b35-d875530a85ba`
- `c088fd81-fe4f-4282-99af-ebc0d1a7d202`
- `aed3ca99-815b-40b8-ae91-e11bf92f51da`
- `e55edcb9-2184-4a24-890e-70cc91028990`
- `1ce8af38-082a-477b-af48-b924c92761bf`
- `b43a1e45-f05c-4d78-8453-f6fa677dc24c`
- `f9fdb733-5838-4983-888a-05624eabbe17`
- `b025df0c-994c-4807-9c5f-2d548905b73f`
- `ba343971-10e5-4b05-b005-405b9c1ce447`
- `50612a57-7b9d-45fd-bc08-e95556444760`
- `6c122f0e-8017-4ec1-91d6-0d7a1c75f8c9`
- `3d8f5e4c-8f7b-49cf-bd83-1d9876db5bf6`
- `0500f77f-8c12-5f7e-97b0-a75125eaa99b`
- `283ec44e-747c-55e3-9a61-4a4cc70ebfab`
- `06bdbecb-53e0-5ac3-992f-d6fd20555b59`
- `ad66009f-55fb-563f-ace0-dbfeae7c76c3`
- `7b860649-373e-5523-9843-ec96b3537f1f`
- `14d0e697-3fb0-5074-a08c-7e01ca9bbda8`
- `d0db87c4-36f5-5ac6-8428-da96d31b253a`
- `2bd88d66-5daf-53bb-aa02-4c010963679d`
- `367a59ce-a388-5c93-b6f9-a3b0c6c3b45e`
- `d9725eb6-6b1f-5674-9f17-3de10f5b1ed8`
- `674baaa8-911d-5231-9330-881c5288634f`
- `4cba85d3-2e25-5c4b-9c4c-37e5b201dce7`
- `f76d00dc-6b31-59cd-b01a-3610eadc9908`

Covered strands: `L1`, `L2`, `L3`, `L4`, `L5`

Demand levels: `AB1`, `AB2`, `AB3`

## Task

Eine Stadt plant eine kleine Sternwarten-Station mit rotierender Beobachtungsplattform, Akkuspeicher, Wartungsdrohne und einem kegelfoermigen Regenwassertank.

Energiespeicher:

Der Akkustand in Wh wird durch `B(t)=1200*0.82^t` modelliert. `t` ist die Zeit in Stunden nach Beginn einer Nachtmessung.

Foerderkonto:

Fuer Ersatzteile wird ein Konto mit `K(n)=2500*1.035^n` modelliert. `n` ist die Laufzeit in Jahren.

Rotierende Plattform:

Die Hoehe eines Sensors ueber dem Boden wird durch `H(t)=18+14*sin((pi/20)*(t-5))` beschrieben. `t` ist die Zeit in Sekunden.

Profil einer Fuehrungsschiene:

Fuer `0<=x<=5` wird die Schienenhoehe in Metern modellhaft durch `f(x)=0.1x^3-0.6x^2+0.9x+2` beschrieben.

Wartungsdrohne:

Die Drohne bewegt sich auf `r(t)=(1|2|0)+t*(2|1|1)`. Eine Kontrollgerade ist `s(u)=(5|4|2)+u*(1|-1|0)`.

Regenwassertank:

Der Tank ist ein gerader Kreiskegel mit Radius `2.4 m` und Hoehe `6 m`.

Sensortest:

Aus `8` Sensoren, darunter `3` fehlerhafte, werden ohne Zuruecklegen `2` Sensoren ausgewaehlt.

1. Exponentialmodelle: Beschreibe den Verlauf des Graphen von `B` anhand der Parameter. Berechne `B(0)` und `B(3)`, bestimme die Zeit, ab der der Akkustand unter `500 Wh` faellt, und berechne die Halbwertszeit. Erklaere dabei, warum Logarithmen als Umkehroperation noetig sind. Berechne ausserdem `K(5)` und erlaeutere Anfangskapital, Zinssatz, Laufzeit, Endkapital und Zinseszins im Modell. `(10 BE)`

2. Trigonometrisches Modell: Bestimme Mittellinie, Amplitude, Periode, minimale und maximale Sensorhoehe von `H`. Berechne `H(5)` und `H(15)`. Ein zweiter Graph hat Mittellinie `6`, Amplitude `2`, Periode `12` und ein Maximum bei `t=3`; gib einen passenden Kosinus-Term an. Wandle `150 deg` ins Bogenmass um. Fuer einen spitzen Winkel gilt `sin(alpha)=0.6`; bestimme `cos(alpha)`, `tan(alpha)` und `sin(90 deg-alpha)` mit den trigonometrischen Beziehungen. Gib `H'(t)` an und deute die Ableitung bei `t=15`. `(12 BE)`

3. Ganzrationale Funktionen und Ableitungsideen: Bestimme Grad, Randverhalten, `f'(x)` und `f''(x)`. Stelle Tangente und Normale im Punkt `x=0` auf und nutze die Tangente als lineare Approximation fuer `f(0.2)`. Bestimme die Wendestelle und beschreibe das Kruemmungsverhalten. Untersuche mit dem Monotoniesatz die Monotonie von `f` und erklaere, warum die Umkehrung des Monotoniesatzes nicht allgemein gilt. Pruefe ausserdem die Symmetrie von `g(x)=x^4-3x^2+2` und `h(x)=x^3-2x`; begruende, welchen minimalen Grad ein Graph mit beiden Enden nach oben und drei Extremstellen haben muss. `(14 BE)`

4. Gleichungen: Loese `sqrt(x+5)=x-1` mit einmaligem Quadrieren und pruefe moegliche Scheinloesungen. Loese die Potenzgleichung `x^4=81`. Loese `x^4-5x^2+4=0` mit der Substitution `z=x^2` und fuehre die Ruecksubstitution durch. `(8 BE)`

5. Raumgeometrie und Vektoren: Interpretiere `r(t)` als geradlinige Bewegung und berechne die Drohnenposition fuer `t=2`. Untersuche, ob `r` und `s` sich schneiden. Vergleiche `r` mit `k(v)=(0|0|1)+v*(2|1|1)` und entscheide die Lagebeziehung. Berechne das Volumen des kegelfoermigen Tanks und plausibilisiere die Formel als Grenzfall von Pyramiden. `(10 BE)`

6. Kombinatorik und Simulation: Bestimme die Anzahl aller moeglichen Zweierauswahlen. Berechne die Wahrscheinlichkeit, dass beide ausgewaehlten Sensoren fehlerhaft sind. Eine Monte-Carlo-Simulation mit `10000` Durchlaeufen liefert `1060` Treffer; deute den Naeherungswert und erklaere, warum er vom exakten Modellwert abweichen kann. `(10 BE)`

## Solution

1. `B(t)=1200*0.82^t` hat Anfangswert `1200`, Wachstumsfaktor `0.82<1`, ist streng fallend und hat die waagerechte Asymptote `y=0`. `B(0)=1200`, `B(3)=1200*0.82^3≈661.7 Wh`, also liegt der Akkustand nach drei Stunden noch ueber `500 Wh`. Fuer `B(t)<500` gilt `1200*0.82^t<500`, also `t>log(500/1200)/log(0.82)≈4.41`. Die Halbwertszeit erfuellt `0.82^t=0.5`, also `t=log(0.5)/log(0.82)≈3.49`. Logarithmen werden benoetigt, weil die gesuchte Zeit im Exponenten steht. Beim Konto ist `K(5)=2500*1.035^5≈2969.22`. Anfangskapital `2500 EUR`, Zinssatz `3.5%`, Laufzeit `5` Jahre, Endkapital etwa `2969.22 EUR`; Zinseszins bedeutet, dass Zinsen in den Folgejahren mitverzinst werden.

2. Mittellinie `18`, Amplitude `14`, Periode `40`, Minimum `4`, Maximum `32`. `H(5)=18` und `H(15)=32`. Ein passender zweiter Term ist `q(t)=6+2*cos((pi/6)*(t-3))`, weil `2pi/(pi/6)=12` und bei `t=3` ein Maximum liegt. `150 deg=5pi/6`. Aus `sin(alpha)=0.6` folgt mit `sin^2(alpha)+cos^2(alpha)=1` fuer einen spitzen Winkel `cos(alpha)=0.8`. Damit `tan(alpha)=sin(alpha)/cos(alpha)=0.75` und `sin(90 deg-alpha)=cos(alpha)=0.8`. `H'(t)=14*(pi/20)*cos((pi/20)*(t-5))`. Bei `t=15` ist der Sensor im Maximum; `H'(15)=0`, die momentane Hoehenaenderung ist dort null.

3. `f` ist eine kubische Funktion mit positivem Leitkoeffizienten; fuer `x->infty` gilt `f(x)->infty`, fuer `x->-infty` gilt `f(x)->-infty`. `f'(x)=0.3x^2-1.2x+0.9=0.3(x-1)(x-3)`, `f''(x)=0.6x-1.2`. Bei `x=0` ist `f(0)=2` und `f'(0)=0.9`; Tangente `y=0.9x+2`, Normale `y=-(10/9)x+2`. Linear ergibt sich `f(0.2)≈2.18` (exakt waere `2.1568`). Wendestelle: `f''(x)=0` bei `x=2`, `f(2)=2.2`; links davon ist `f''<0`, rechts davon `f''>0`, also wechselt die Kruemmung. Wegen der Vorzeichen von `f'` ist `f` auf `(-infty,1)` steigend, auf `(1,3)` fallend und auf `(3,infty)` steigend. Aus `f'>0` auf einem Intervall folgt Monotonie; die Umkehrung ist nicht allgemein gueltig, z.B. ist `x^3` streng steigend, obwohl die Ableitung bei `0` gleich `0` ist. `g` ist achsensymmetrisch zur y-Achse, weil nur gerade Potenzen vorkommen. `h` ist punktsymmetrisch zum Ursprung, weil `h(-x)=-h(x)`. Ein Graph mit beiden Enden nach oben und drei Extremstellen braucht mindestens Grad `4` mit positivem Leitkoeffizienten.

4. Bei `sqrt(x+5)=x-1` muss `x>=1` gelten. Quadrieren liefert `x+5=x^2-2x+1`, also `x^2-3x-4=0` und `x=4` oder `x=-1`; durch Definitionsbedingung und Einsetzen bleibt nur `x=4`. Aus `x^4=81` folgen die reellen Loesungen `x=3` und `x=-3`. Bei `x^4-5x^2+4=0` setze `z=x^2`; dann `z^2-5z+4=0`, also `z=1` oder `z=4`. Ruecksubstitution ergibt `x=+-1` oder `x=+-2`.

5. `r(t)` beschreibt eine geradlinige Bewegung vom Startpunkt `(1|2|0)` mit Richtungsvektor `(2|1|1)`. Fuer `t=2` liegt die Drohne bei `(5|4|2)`. Fuer einen Schnitt mit `s` loest man `(1+2t,2+t,t)=(5+u,4-u,2)`. Aus der dritten Koordinate folgt `t=2`, dann aus der ersten `u=0` und aus der zweiten ebenfalls `u=0`; Schnittpunkt ist `(5|4|2)`. `k` hat denselben Richtungsvektor wie `r`; der Verbindungsvektor der Stuetzpunkte `(1|2|-1)` ist kein Vielfaches von `(2|1|1)`, also sind die Geraden echt parallel. Das Kegelvolumen ist `V=(1/3)*pi*r^2*h=(1/3)*pi*2.4^2*6=11.52pi≈36.2 m^3`. Die Formel ist plausibel, weil ein Kegel als Grenzfall von Pyramiden mit immer mehr Ecken in der Grundflaeche verstanden werden kann.

6. Es gibt `C(8,2)=28` moegliche Zweierauswahlen. Guenstig sind `C(3,2)=3` Auswahlen mit zwei fehlerhaften Sensoren, also `P=3/28≈0.107`. Die Simulation liefert `1060/10000=0.106`; das liegt nahe am exakten Wert. Abweichungen entstehen durch Zufallsschwankungen, werden aber bei vielen Durchlaeufen typischerweise kleiner.

## Scoring

Max points: 64

Passing points: 32

Steps:

- `j10_released_1` - 10 BE - Exponentielle Modelle, Logarithmen, Halbwertszeit, Asymptotik und Zinseszins im Kontext korrekt genutzt.
- `j10_released_2` - 12 BE - Trigonometrische Graphen, Bogenmass, Einheitskreisbeziehungen, Termbestimmung und Sinus-/Kosinusableitung fachgerecht bearbeitet.
- `j10_released_3` - 14 BE - Ganzrationale Funktionen ueber Term, Graph, Symmetrie, Randverhalten, Tangente, Normale, Approximation, Kruemmung und Monotonie analysiert.
- `j10_released_4` - 8 BE - Wurzel-, Potenz- und Substitutionsgleichungen geloest und Loesungen geprueft.
- `j10_released_5` - 10 BE - Geraden im Raum, vektorielle Bewegung, Lagebeziehungen und Kegelvolumen begruendet bearbeitet.
- `j10_released_6` - 10 BE - Kombinatorische Anzahl, Wahrscheinlichkeit und Monte-Carlo-Approximation korrekt bestimmt und gedeutet.
