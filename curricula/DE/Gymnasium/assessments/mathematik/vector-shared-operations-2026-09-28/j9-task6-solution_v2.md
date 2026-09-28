# Lösung und Bewertung

Die Punkte beschreiben Orte im dreidimensionalen Koordinatensystem.

$AB=(4,2,3)$, $BC=(4,2,3)$, $AP=(1,-1,1)$.

$AB$ und $BC$ sind kollinear, sogar gleich.

$AB+AP=(5,1,4)$ und $AB-AP=(3,3,2)$. Bei der Summe setzt die $AP$-Verschiebung an der Spitze des $AB$-Pfeils an; die resultierende Verschiebung verbindet den ursprünglichen Startpunkt mit dem Endpunkt der Kette. Für die Differenz hängt man den Gegenvektor $-AP=(-1,1,-1)$ an die Spitze von $AB$. Die Skizze muss diese Pfeilverknüpfungen tatsächlich zeigen; eine bloße Rechnung oder eine unbeschriftete Skizze genügt nicht.

$2AB=(8,4,6)$ hat die doppelte Länge und dieselbe Richtung. $-\tfrac12 AB=(-2,-1,-\tfrac32)$ hat die halbe Länge und die Gegenrichtung. $0AB=(0,0,0)$ ist der Nullvektor mit Länge null; er beschreibt keine Verschiebung und hat keine von null verschiedene Richtung.

Bewertung der unverzichtbaren Operationskerne: Teil 4 höchstens 2 von 4 BE, falls die Summe oder Differenz falsch ist oder die Pfeildeutung der Gegenverschiebung fehlt. Teil 5 höchstens 2 von 4 BE, falls negative Halbierung, Richtungsumkehr oder Nullfall falsch gedeutet werden. Ab 12 von 13 BE müssen beide Operationskerne tragfähig sein. Diese Punktdeckel sind fachliche Bewertungsanweisungen; der Server erzwingt nur die Gesamtpunktgrenze.

{
  "maxPoints": 13,
  "passingPoints": 12,
  "steps": [
    {
      "id": "j9-v2-spatial-points",
      "points": 1,
      "description": "Ortsangaben im Raum deuten."
    },
    {
      "id": "j9-v2-displacement-components",
      "points": 2,
      "description": "AB, BC und AP korrekt bestimmen."
    },
    {
      "id": "j9-v2-collinearity",
      "points": 2,
      "description": "Kollinearität durch passende Vektorbeziehung begründen."
    },
    {
      "id": "j9-v2-vector-addition-subtraction",
      "points": 4,
      "description": "Summe und Differenz korrekt bestimmen und als Pfeilverkettung bzw. Gegenverschiebung erklären; bei fehlendem Kern höchstens 2 BE."
    },
    {
      "id": "j9-v2-scalar-multiplication",
      "points": 4,
      "description": "Positive Skalierung, negative Halbierung und Nullfall berechnen sowie Länge und Richtung erklären; bei fehlendem Kern höchstens 2 BE."
    }
  ]
}
