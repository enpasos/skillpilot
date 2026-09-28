# Integralfunktionen zeichnen und Integranden erschließen

Graph A zeigt den Integranden $q$ als Gerade durch $(0|2)$, $(2|0)$ und $(4|-2)$.

![Graph A: Integrand q](/assets/assessment-materials/mathematik/2a371566-b59c-5e32-98b4-c2e41e2b7280/integrand-line.svg)

1. Definieren Sie die zugehörige Integralfunktion $A$ mit Startstelle 0. Beschreiben Sie den variablen oberen Integralrand und die Bedeutung positiver und negativer Flächenbeiträge. (4 BE)
2. Zeichnen Sie aus dem q-Graphen den Graphen von $A$ auf $[0,4]$. Bestimmen Sie $A(0)$, $A(2)$ und $A(4)$ aus Flächen und begründen Sie Steigen, Fallen und Krümmung. (6 BE)
3. Graph B zeigt eine andere Integralfunktion $F$ mit Startstelle $-2$. Ihr Graph besteht aus zwei glatten Parabelbögen: links durch $(-2|0),(-1|1),(0|4)$, rechts durch $(0|4),(1|7),(2|8),(3|7),(4|4)$. Bei 0 treffen die Bögen mit gemeinsamer Tangente zusammen.

![Graph B: Integralfunktion F](/assets/assessment-materials/mathematik/22842d80-de9d-5dad-9819-6ae6e9ca61be/graph-a-antiderivative.svg)

Zeichnen Sie den zugehörigen Integranden $f$ aus den Tangentensteigungen von $F$. Markieren Sie Nullstellen, Vorzeichen und den Knick bei 0 und begründen Sie Ihre Zeichnung. (6 BE)

Reichen Sie beide eigenen Zeichnungen ein. Reine Termangaben ersetzen die graphische Leistung nicht.

## Lösung

1. $A(x)=\int_0^xq(t)\,dt$; der obere Rand x ist veränderlich, der untere bleibt 0. Oberhalb der x-Achse werden positive, unterhalb negative Beiträge akkumuliert.

2. Die Flächen liefern $A(0)=0$, $A(2)=2$ und $A(4)=0$. A steigt bis 2 und fällt danach, weil $A'=q$; q nimmt ab, daher ist A durchgehend nach unten gekrümmt. Zu zeichnen ist der Parabelbogen durch diese Punkte mit Maximum $(2|2)$. Nur zur Kontrolle: $A(x)=2x-x^2/2$.

3. Links steigen die F-Tangentensteigungen linear von 0 auf 4; rechts fallen sie linear von 4 auf -4. Der gezeichnete f-Graph besteht aus Geradenstücken durch $(-2|0),(0|4),(2|0),(4|-4)$. Er ist bei 0 stetig mit Knick; auf $(-2,2)$ positiv, danach negativ. Zur Kontrolle: links $f=2x+4$, rechts $f=4-2x$. Die Vorzeichen folgen aus Steigen/Fallen von F und die Werte aus seinen Tangentensteigungen.
