1. $\int_0^8z(t)\,dt=[-t^3/12+t^2+3t]_0^8=136/3\,\text{m}^3\approx45{,}33\,\text{m}^3$. Dies ist das gesamte im Zeitraum zugeflossene Wasservolumen, nicht der absolute Beckeninhalt.

2. $\bar z=\frac18\int_0^8z(t)\,dt=17/3\,\text{m}^3/\text{h}\approx5{,}67\,\text{m}^3/\text{h}$.

3. $B(t)=12+\int_0^t z(x)\,dx=12-t^3/12+t^2+3t$ in $\text{m}^3$. Die Kontrollen liefern $B(0)=12$ und $B'(t)=z(t)$.

4. $z(t)$ ist die momentane Änderung des Beckeninhalts pro Zeit, mit Einheit $\text{m}^3/\text{h}$. $B(t)$ ist das zum Zeitpunkt $t$ vorhandene Wasservolumen in $\text{m}^3$. Es ist die aufsummierte Änderungsrate plus Anfangsbestand.

5. Für den Zeitraum $[0,4]$ gilt
$$
\int_0^4 B(t)\,dt=[12t-t^4/48+t^3/3+3t^2/2]_0^4=88\,\text{m}^3\text{h},\qquad \bar B=\frac{88\,\text{m}^3\text{h}}{4\,\text{h}}=22\,\text{m}^3.
$$
Der konstante Ersatzbestand $22\,\text{m}^3$ hat während der vier Stunden denselben Integralwert $88\,\text{m}^3\text{h}$. Die Division durch die Zeitlänge gleicht den veränderlichen Verlauf zu diesem konstanten Wert aus. $B(0)=12$ und $B(4)=104/3$; ihr arithmetisches Mittel ist $70/3\,\text{m}^3$, also nicht $22\,\text{m}^3$. Zwei Randwerte erfassen den gekrümmten Verlauf im Inneren nicht.

6. Gesamtzufluss und mittlere Zuflussrate bleiben bestimmbar. Der unbekannte Anfangsbestand verschiebt $B(t)$ und damit den mittleren Beckeninhalt um denselben Betrag; ohne Anfangsbestand gibt es keinen eindeutigen mittleren Inhalt. Auf $[0,4]$ wäre dieser $B(0)+10\,\text{m}^3$.
