# Linearbeschleuniger (Abitur BY 1981 LK A2-1)

Quelle: https://www.leifiphysik.de/elektrizitaetslehre/bewegte-ladungen-feldern/aufgabe/linearbeschleuniger-abitur-1981-lk-a2-1
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/elektrizitaetslehre/bewegte-ladungen-feldern/aufgabe/linearbeschleuniger-abitur-1981-lk-a2-1.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

In einem Linearbeschleuniger werden Protonen mit der Geschwindigkeit $v_0 = 1{,}0 \cdot 10^7\,\frac{\rm{m}}{\rm{s}}$ in das erste Rohr eingeschossen.

a)

Berechne, welche Spannung die Protonen bis dahin durchlaufen haben, wenn man ihre Anfangsgeschwindigkeit vernachlässigen kann.

Der Scheitelwert der zwischen je zwei benachbarten Rohrelektroden liegenden Wechselspannung beträgt $U_0 = 4{,}0 \cdot 10^5\,\rm{V}$, die Frequenz ist $50\,\rm{MHz}$. Der Abstand benachbarter Rohre sei wesentlich kleiner als die Rohrlänge.

b)

Berechne, welche Länge das zweite Rohr haben muss, wenn die Umstände als optimal für die Beschleunigung angenommen werden.

c)

Leite eine Gleichung für die Geschwindigkeit im $n$-ten Rohr (nicht-relativistische Rechnung) her.

Erläutere, warum diese Gleichung nicht für beliebig große $n$ anwendbar ist.

Die Protonen treten in Wirklichkeit jedes Mal dann in das elektrische Feld zwischen zwei Rohren ein, wenn die Wechselspannung ihren maximalen Wert noch nicht ganz erreicht hat.

d)

Begründe, warum dadurch eine Geschwindigkeitsfokussierung für langsamere und schnellere Protonen eintritt.

**Hinweis:** Die folgende Teilaufgabe ist nur mit kernphysikalischen Kenntnissen zu lösen.

Beschleunigte Protonen werden nun mit einer kinetischen Energie von $50\,\rm{MeV}$ auf ${}_3^7\rm{Li}$-Kerne geschossen, die als ruhend angenommen werden dürfen.

e)

Berechne unter der Annahme, dass die Kernkräfte unberücksichtigt bleiben, den kleinstmöglichen Abstand $a$ zwischen den Kernmittelpunkten, wenn sich die Protonen radial nähern.

Berechne den Radius der ${}_3^7\rm{Li}$-Kerne.

Schätze ab, ob wenigstens prinzipiell eine Kernreaktion möglich ist.

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Da die Geschwindigkeit kleiner als $10\%$ der Lichtgeschwindigkeit ist, ist die Berechnung der Spannung $ U $ durch eine nicht-relativistische Rechnung möglich: 

$$
 E_{\rm kin} = e \cdot U \Leftrightarrow \frac{1}{2} \cdot m \cdot v_0^2 = e \cdot U \Leftrightarrow U = \frac{v_0^2}{2 \cdot \frac{e}{m}}
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
U = \frac{\left(1{,}0 \cdot 10^7\,\frac{\rm m}{\rm s}\right)^2}{2 \cdot 9{,}58 \cdot 10^7\,\frac{\rm kg}{\rm A\,s}} = 5{,}2 \cdot 10^5\,\rm V 
$$


b)

Mit 

$$
 U_{\rm ges,2} = 5{,}2 \cdot 10^5\,\rm V + 4{,}0 \cdot 10^5\,\rm V = 9{,}2 \cdot 10^5\,\rm V 
$$

und 

$$
v_2 = \sqrt{\frac{2 \cdot e \cdot U_{\rm ges,2}}{m}}
$$

 ergibt sich beim Einsetzen der gegebenen Werte (mit zwei gültigen Ziffern Genauigkeit)

$$
v_2 = \sqrt{2 \cdot 9{,}58 \cdot 10^7\,\frac{\rm A \cdot s}{\rm kg} \cdot 9{,}2 \cdot 10^5\,\rm V} = 1{,}33 \cdot 10^7\,\frac{\rm m}{\rm s} 
$$

 Damit erhält man 

$$
 l_2 = v_2 \cdot \frac{1}{2 \cdot f}
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
 l_2 = 1{,}33 \cdot 10^7\,\frac{\rm m{\rm s} \cdot 1}{2 \cdot 50 \cdot 10^6\,\rm{Hz}} = 0{,}13\,\rm m = 13\,\rm{cm} 
$$


c)


$$
 U_{\rm ges,n} = U + (n - 1) \cdot U_0 \Rightarrow v_{\rm n} = \sqrt{\frac{2 \cdot e \cdot \left( U + (n - 1) \cdot U_0 \right)}{m}} 
$$

 Die obige Gleichung fußt auf einem nichtrelativistischen Ansatz. Für große $ n $ werden die Teilchen jedoch relativistisch und dann hängt auch die Masse in obiger Formel von der Geschwindigkeit ab.

d)

Schnellere Protonen treten zu früh ein, auf sie wirkt nur geringe Beschleunigungskraft, langsamere Protonen treten später, ein auf sie wirkt eine erhöhte Beschleunigungskraft. Dadurch kommt es zur Geschwindigkeitsanpassung (Geschwindigkeitsfokussierung).

e)

Aufgrund des Energieerhaltungssatzes ist die potenzielle Energie von Proton und Lithium-Kern bei kleinstem Abstand $ r $ gleich der kinetischen Energie der Protonen. Es gilt somit 

$$
 E_{\rm kin} = \frac{Q_1 \cdot Q_2}{4 \pi \varepsilon_0 \cdot r} 
$$

 und mit $ r = a $, $ Q_1 = e $ und $ Q_2 = 3 \cdot e $ 

$$
 E_{\rm kin} = \frac{3 \cdot e^2}{4 \pi \varepsilon_0 \cdot a} \Leftrightarrow a = \frac{3 \cdot e^2}{4 \pi \varepsilon_0 \cdot E_{\rm kin}} 
$$

 Einsetzen der gegebenen Werte liefert 

$$
 a = \frac{3 \cdot (1{,}60 \cdot 10^{-19}\,\rm As)^2}{4 \pi \cdot 8{,}85 \cdot 10^{-12}\,\frac{\rm As}{\rm Vm} \cdot 5{,}0 \cdot 10^6 \cdot 1{,}60 \cdot 10^{-19}\,\rm As \cdot V} = 8{,}6 \cdot 10^{-17}\,\rm m 
$$

 Für den Kernradius von Lithium ergibt sich durch 

$$
 r_{\rm Li} = 1{,}4 \cdot 10^{15} \cdot \sqrt[3]{A}\,\rm m 
$$

 mit $ A = 6{,}94 $ 

$$
 r_{\rm Li} = 1{,}4 \cdot 10^{15} \cdot \sqrt[3]{6{,}94}\,\rm m = 2{,}7 \cdot 10^{-15}\,\rm m 
$$

 Wegen $ a < r_{\rm Li} $ ist also eine Kernreaktion prinzipiell möglich.

## Grundwissen
- [Geladene Teilchen im elektrischen Längsfeld](https://www.leifiphysik.de/elektrizitaetslehre/bewegte-ladungen-feldern/grundwissen/geladene-teilchen-im-elektrischen-laengsfeld)
- [Teilchenphysikaspekte in der klassischen Physik](https://www.leifiphysik.de/kern-teilchenphysik/teilchenphysik/grundwissen/teilchenphysikaspekte-der-klassischen-physik)
