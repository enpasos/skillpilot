# Koordinatenachsendrehung: LK-Prüfungskandidat

Status: maschinell fachlich geprüft; keine menschliche Freigabe oder Erprobung. Siehe die unabhängige Review und Integrationsquittung im zugehörigen QS-Paket.

## Aufgabe

Ein Punkt eines starren Bauteils wird in einem festen rechtshändigen kartesischen Koordinatensystem durch $P(2\mid-1\mid3)$ beschrieben. Die Einheit ist beliebig, aber für alle Achsen gleich. Das Bauteil wird jeweils um eine durch den Ursprung verlaufende Koordinatenachse gedreht; das Koordinatensystem bleibt fest. Ortsvektoren sind Spaltenvektoren, die Abbildung wird durch Multiplikation von links beschrieben.

Für positive Winkel gilt die Rechte-Hand-Regel: Der Daumen zeigt in die positive Achsenrichtung, die gekrümmten Finger geben die positive Drehrichtung an. Beim Blick von der positiven Achsenseite auf den Ursprung ist diese gegen den Uhrzeigersinn. $\vec e_1,\vec e_2,\vec e_3$ bezeichnen die Standardbasis.

1. Das Bauteil wird um $+90^\circ$ um die $z$-Achse gedreht. Bestimmen Sie die Bilder der drei Basisvektoren und leiten Sie daraus die Abbildungsmatrix $A$ her. Erläutern Sie, wie die Basisbilder in die Matrix eingehen. (6 BE)
2. Berechnen Sie den Bildpunkt $P_z$ unter $A$. Begründen Sie außerdem für einen beliebigen Punkt $X(x\mid y\mid z)$, dass die gesamte $z$-Achse punktweise fest bleibt und der Abstand zum Ursprung bei dieser Abbildung erhalten bleibt. (5 BE)
3. In einem zweiten, unabhängigen Versuch wird das Bauteil aus seiner ursprünglichen Lage um $-90^\circ$ um die $x$-Achse gedreht. Bestimmen und begründen Sie die Abbildungsmatrix $B$ und berechnen Sie den Bildpunkt $P_x$ des ursprünglichen Punktes $P$. Die beiden Drehungen werden hier nicht nacheinander ausgeführt. (5 BE)
4. Eine Person schlägt für den ersten Versuch stattdessen
   $$
   C=\begin{pmatrix}0&1&0\\-1&0&0\\0&0&1\end{pmatrix}
   $$
   vor und begründet: „Die $z$-Achse bleibt fest und Abstände zum Ursprung bleiben erhalten; deshalb ist $C$ die verlangte Drehung um $+90^\circ$.“ Beurteilen Sie diese Begründung. Prüfen Sie die behauptete Drehrichtung an einem selbst gewählten Punkt oder Vektor außerhalb der $z$-Achse, benennen Sie die tatsächliche Drehung und erläutern Sie die Grenze der beiden genannten Prüfkriterien. (4 BE)

Bearbeitungszeit: etwa 25 Minuten. Hilfsmittel: keine erforderlich. Gesamt: 20 BE.

## Musterlösung und Bewertung

1. Es gilt $A\vec e_1=\vec e_2$, $A\vec e_2=-\vec e_1$ und $A\vec e_3=\vec e_3$. Die Bilder der Standardbasis sind die Spalten der Matrix; deshalb
   $$
   A=\begin{pmatrix}0&-1&0\\1&0&0\\0&0&1\end{pmatrix}.
   $$
   Bewertung: jedes richtige Basisbild 1 BE (3 BE), korrekte Matrix 2 BE, erklärte Spaltenzuordnung 1 BE.
2. $A(2,-1,3)^{\mathsf T}=(1,2,3)^{\mathsf T}$, also $P_z(1\mid2\mid3)$. Allgemein gilt $A(x,y,z)^{\mathsf T}=(-y,x,z)^{\mathsf T}$. Für $(0,0,z)^{\mathsf T}$ ist das Bild unverändert. Außerdem ist
   $$
   \|A\vec x\|^2=(-y)^2+x^2+z^2=x^2+y^2+z^2=\|\vec x\|^2.
   $$
   Wegen der Nichtnegativität der Norm bleibt auch der Abstand zum Ursprung erhalten.
   Bewertung: Multiplikationsansatz 1 BE, Bildpunkt 1 BE, punktweise feste Achse für beliebiges $z$ 1 BE, allgemeiner Normvergleich 1 BE, Schluss auf Abstandserhaltung 1 BE.
3. Die negative Vierteldrehung um $x$ lässt $\vec e_1$ fest, bildet $\vec e_2$ auf $-\vec e_3$ und $\vec e_3$ auf $\vec e_2$ ab. Somit
   $$
   B=\begin{pmatrix}1&0&0\\0&0&1\\0&-1&0\end{pmatrix},
   \qquad B(2,-1,3)^{\mathsf T}=(2,3,1)^{\mathsf T}.
   $$
   Also ist $P_x(2\mid3\mid1)$.
   Bewertung: Matrixspalten jeweils 1 BE (3 BE), geometrische Begründung der Drehrichtung/Basisbilder 1 BE, Bildpunkt 1 BE.
4. Beispielsweise ist $C\vec e_1=-\vec e_2$, während die verlangte positive Vierteldrehung $\vec e_1$ auf $\vec e_2$ abbildet. Die Behauptung ist falsch: $C$ beschreibt die Drehung um $-90^\circ$ um die $z$-Achse (gleichwertig $+270^\circ$). Tatsächlich bleiben die $z$-Achse und die Norm erhalten, denn $C(x,y,z)^{\mathsf T}=(y,-x,z)^{\mathsf T}$. Diese Eigenschaften legen aber den vorzeichenbehafteten Winkel nicht fest; insbesondere erfüllen beide entgegengesetzten Vierteldrehungen sie.
   Bewertung: tragfähige Gegenprobe außerhalb der Achse 1 BE, begründete Ablehnung 1 BE, tatsächlicher Winkel und Achse 1 BE, Erklärung der Unzulänglichkeit der Kriterien 1 BE.

Fachlich gleichwertige Darstellungen und alternative korrekte Begründungen sind gleich zu bewerten; die ausdrücklich verlangten Basisbilder in Teil 1 bleiben erforderlich. Folgefehler werden nicht mehrfach bestraft: methodisch richtige spätere Arbeit mit einer zuvor fehlerhaften Matrix kann Methodenpunkte erhalten; richtige Endwerte setzen die korrekte Drehung voraus. Die Musterlösung ist nicht exklusiv. Gesamt: 20 BE; vorgeschlagene Bestehensgrenze: 10 BE.

