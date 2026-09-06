# J10: Wartungsdrohne und Wassertank – Lösung v3

Die Aufgabenfassung und der begrenzte Reviewumfang sind separat dokumentiert; diese Quelle behauptet keine menschliche Einzelabnahme.

<a id="task-5"></a>

## Task 5 - Wartungsdrohne und Wassertank (10 BE)

Zum Referenzzeitpunkt $t=0$ befindet sich die Drohne am Anfangsort $(1|2|0)$ mit Ortskoordinaten in Metern. Ihr konstanter Geschwindigkeitsvektor ist $(2|1|1)\,\mathrm{m/s}$: Pro Sekunde ändern sich die drei Ortskoordinaten um $2 m$, $1 m$ und $1 m$. Für $t=2$, also nach zwei Sekunden, gilt $r(2)=(5|4|2)$; auch diese Ortskoordinaten sind in Metern angegeben.

Für einen Schnitt der Trägergerade $r$ mit $s$ löst man $(1+2t,2+t,t)=(5+u,4-u,2)$. Aus der dritten Koordinate folgt $t=2$, dann aus der ersten $u=0$ und aus der zweiten ebenfalls $u=0$; Schnittpunkt ist $(5|4|2)$.

$k$ hat denselben Richtungsvektor wie $r$; der Verbindungsvektor der Stützpunkte $(1|2|-1)$ ist kein Vielfaches von $(2|1|1)$, also sind die Geraden echt parallel.

$V=(1/3)\cdot \pi\cdot r^2\cdot h=(1/3)\cdot \pi\cdot 2.4^2\cdot 6=11.52\pi≈36.2 m^3$. Die Formel ist plausibel, weil ein Kegel als Grenzfall von Pyramiden mit immer mehr Ecken in der Grundfläche verstanden werden kann.

## Bewertung

10 BE, Bestehensgrenze 5. Teil 1: Anfangsort und Geschwindigkeit 1 BE, Position nach zwei Sekunden 1 BE; Teil 2: 3 BE; Teil 3: 2 BE; Teil 4: 3 BE.
