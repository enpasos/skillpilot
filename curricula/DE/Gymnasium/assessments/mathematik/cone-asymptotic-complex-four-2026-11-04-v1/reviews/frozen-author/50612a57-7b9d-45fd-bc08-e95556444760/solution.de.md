# Referenzlösung: Kegel als Grenzfall

**1.** Alle Pyramiden haben dieselbe Spitze, dieselbe Grundebene und
dieselbe senkrechte Höhe $9\,\mathrm{cm}$. Die inneren regelmäßigen
Vielecke liegen innerhalb der Kreisscheibe, die äußeren enthalten sie.
Jede Verbindungsstrecke von $S$ zu einem Punkt der inneren Grundfläche
liegt daher auch im Kegel; entsprechend liegt der Kegel innerhalb der
äußeren Pyramide. Die Grundflächen und Seitenflächen werden bei größerer
Seitenzahl feiner. Die Höhe bleibt fest, und die Körper haben weiterhin
eine gemeinsame Spitze. So nähern sich die Pyramiden dem Kegel, ohne dass
eine andere Körperhöhe oder ein geschlossener Deckkreis eingeführt wird.

**2.** Wegen $h=9$ gilt für jede Grundfläche
$V_n^-=3G_n^-$ beziehungsweise $V_n^+=3G_n^+$.
Aus den ausdrücklich gerundeten Tabellenwerten erhält man:

| $n$ | $V_n^-$ in $\mathrm{cm}^3$ | $V_n^+$ in $\mathrm{cm}^3$ |
|---:|---:|---:|
| 4 | 96,000 | 192,000 |
| 8 | 135,765 | 159,057 |
| 16 | 146,949 | 152,766 |
| 32 | 149,829 | 151,284 |

Geometrisch gilt $V_n^-\leq V_K\leq V_n^+$. Die angezeigten Werte sind
gerundete Näherungen an diese Schranken, keine Behauptung exakter
Schranken bis zur letzten Dezimalstelle. Der Abstand wird deutlich
kleiner; beispielsweise sinkt er von $96$ auf ungefähr
$1{,}455\,\mathrm{cm}^3$.

**3.** Beim Verdoppeln der Seitenzahl füllen die inneren Vielecke die
Kreisscheibe immer genauer aus, während die äußeren überstehenden Ecken
immer kleiner werden. Beide Grundflächeninhalte nähern sich dem
Kreisflächeninhalt $\pi r^2$. Da Höhe und Drittelfaktor bei jeder
Pyramide gleich bleiben, nähern sich beide Volumenfolgen demselben Wert:

$$
V_n^-=\frac13G_n^-h\ \longrightarrow\ \frac13\pi r^2h,
\qquad
V_n^+=\frac13G_n^+h\ \longrightarrow\ \frac13\pi r^2h.
$$

Der dazwischen liegende Kegel hat damit plausibel genau dieses Volumen.
Hier wird die bereits verfügbare Pyramidenformel auf immer feinere
Grundflächen angewandt; der Faktor $\frac13$ muss nicht neu hergeleitet
werden. Eine knappe gleichwertige Erklärung mit einer geeigneten
Pyramidenannäherung zählt ebenfalls. Eine endliche Zahlenreihe allein
beweist keine unendliche Annäherung; entscheidend ist der geometrische
Gedanke der immer feineren Kreisannäherung.

**4.**

$$
V_K=\frac13\pi\cdot4^2\cdot9
=48\pi\,\mathrm{cm}^3\approx150{,}80\,\mathrm{cm}^3.
$$

Die Behauptung ist falsch. Die feste Spitze bleibt erhalten, also entsteht
ein Kegel, kein Zylinder mit einer zweiten parallelen Kreisfläche.
Jede Pyramide hat bei derselben Grundfläche und Höhe ein Drittel des
entsprechenden Prismenvolumens; die Verfeinerung ändert diesen Faktor
nicht. Das Vergleichszylindervolumen wäre $144\pi\,\mathrm{cm}^3$.
