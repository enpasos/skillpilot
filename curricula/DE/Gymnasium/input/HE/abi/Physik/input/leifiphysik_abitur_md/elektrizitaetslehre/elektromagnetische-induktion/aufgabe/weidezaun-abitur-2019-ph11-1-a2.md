# Weidezaun (Abitur BY 2019 Ph11-1 A2)

Quelle: https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-induktion/aufgabe/weidezaun-abitur-2019-ph11-1-a2
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/elektrizitaetslehre/elektromagnetische-induktion/aufgabe/weidezaun-abitur-2019-ph11-1-a2.html`
Schwierigkeitsgrad: schwere Aufgabe

## Aufgabe

![](https://www.leifiphysik.de/sites/default/files/2026/01/image/weidezaun-abitur-by-2019-ph11-1-a2_skizze.svg)

Abb. 1 Skizze zur Aufgabe

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Im Unterricht wird mithilfe der in Abb. 1 gezeigten Schaltung ein elektrischer Weidezaun simuliert, indem der Lehrer den Schalter in regelmäßigen Abständen öffnet und schließt.

$R_{\rm{T}} = 1{,}0\,\rm{k\Omega}$ stellt den OHMschen Widerstand eines Tieres dar. Die Spule der Länge $10\,\rm{cm}$ besitzt $1000$ Windungen, hat einen kreisförmigen Querschnitt mit $2{,}3\,\rm{cm}$ Radius und kann als langgestreckte Spule aufgefasst werden; ihr OHMscher Widerstand beträgt $R_{\rm{S}} = 9{,}5\,\rm{\Omega}$. In die Spule ist ein Eisenkern eingebracht, der die Induktivität um den Faktor $μ_{\rm{r}} = 300$ erhöht. Die Batteriespannung beträgt wie in der Realität $12\,\rm{V}$.

a)

Beschreibe die Vorgänge in der Spule beim Öffnen des Schalters.

Begründe, dass der Schalter bei einem realen Weidezaun wiederholt geöffnet und geschlossen werden muss. (7 BE)

b)

Berechne die Induktivität $L$ der Spule mit Eisenkern. [zur Kontrolle: $L = 6{,}3\,\rm{H}$] (3 BE)

c)

Die Stromstärke in der Spule nimmt beim Öffnen des Schalters innerhalb der ersten Millisekunde um $212\,\rm{mA}$ ab.

Schätze die Induktionsspannung $U_{\rm{ind}}$, die beim Öffnen des Schalters entsteht, rechnerisch ab.

Begründe, dass nahezu die gesamte Induktionsspannung am Widerstand $R_{\rm{T}}$ abfällt. [zur Kontrolle: $U_{\rm{ind}}=1{,}3\,\rm{kV}$] (6 BE)

d)

![](https://www.leifiphysik.de/sites/default/files/2026/01/image/weidezaun-abitur-by-2019-ph11-1-a2_diagramm1.svg)

Abb. 2 Diagramm zu Aufgabenteil d)

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;

Ein wagemutiger Schüler möchte die Wirkung des simulierten Weidezauns selbst spüren.

Beurteile unter Berücksichtigung nebenstehender Abbildung, ob der Schüler nach Entfernen des Widerstandes $R_{\rm{T}}$ gefahrlos an die Leitungsenden fassen könnte. Der OHMsche Widerstand des Schülers sei vergleichbar mit $R_{\rm{T}}$.    (6 BE)

e)

Erläutere zwei Aspekte, in denen sich ein praxistauglicher Weidezaun von der Simulation unterscheiden muss. (4 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Berührt ein Tier beim Öffnen des Schalters den Weidezaun so beobachtet man, dass im geschlossenen Kreis, der aus der Spule und den Widerständen $R_{\rm{S}}$ und $R_{\rm{T}}$ gebildet wird, ein Strom fließt. Dieser ist auf die in der Spule entstehenden Induktionsspannung zurückzuführen. Die Richtung der Induktionsspannung beim Abschalten ist der ursprünglich anliegenden Batteriespannung gleichgerichtet. Die Ursache für die Induktionsspannung ist der sich ändernde magnetische Fluss durch die Spule.

Die Induktionsspule dient dazu, Tiere, die den Zaun berühren, durch kleine „Stromschläge“ abzuschrecken. Diese „Stromschläge“ treten aber nur auf, wenn der Schalter kontinuierlich geöffnet und geschlossen wird.

b)

Für die Induktivität $L$ einer Zylinderspule gilt 

$$
 L = \mu_0 \cdot \mu_{\rm r} \cdot \frac{{\rm A} \cdot N^2}{l} \underbrace{=}_{A = r^2 \cdot \pi} \mu_0 \cdot \mu_{\rm r} \cdot \frac{r^2 \cdot \pi \cdot N^2}{l} 
$$

 Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit) 

$$
 L = 4 \cdot \pi \cdot 10^{-7}\,\frac{{\rm V} \cdot {\rm s}}{{\rm A} \cdot {\rm m}} \cdot 300 \cdot \frac{(2{,}3 \cdot 10^{-2}\,{\rm m})^2 \cdot \pi \cdot 1000^2}{0{,}10\,{\rm m}} = 6{,}3\,{\rm H} 
$$


c)

![](https://www.leifiphysik.de/sites/default/files/2026/01/image/weidezaun-abitur-by-2019-ph11-1-a2_diagramm2.svg)

Abb. 3 $t$-$I_{\rm s}$-Diagramm zur Lösung von Aufgabenteil c)

[CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.de) / FWU Institut für Film und Bild;


$$
 U_{\rm{ind}} \approx - L \cdot \frac{\Delta I}{\Delta t} \Rightarrow U_{\rm{ind}} \approx -6{,}3\,\frac{{\rm V \cdot s}}{\rm A} \cdot \frac{-212 \cdot 10^{-3}\,{\rm A}}{1{,}0 \cdot 10^{-3}\,{\rm s}} = 1{,}3\,{\rm kV} 
$$

 Da der Widerstand $R_{\rm S}$ wesentlich kleiner als der Widerstand $R_{\rm T}$ ist, fällt nahezu die gesamte Spannung $U_{\rm{ind}}$ an $R_{\rm T}$ ab. Es gilt also $U_{\rm T} \approx U_{\rm{ind}}$.

d)

Bei geschlossenem Schalter fließt durch den Widerstand $R_{\rm S}$ der Strom $I_{\rm S}$ mit 

$$
 I_{\rm S} = \frac{U_{\rm Bat}}{R_{\rm S}} \Rightarrow I_{\rm S} = \frac{12\,{\rm V}}{9{,}5\,{\rm \Omega}} = 1{,}3\,{\rm A} 
$$

 Beim Öffnen des Schalters fließt ein abnehmender Strom durch die Spule, aber auch durch den Schüler, der aber zu Beginn des „Entlade-Prozesses" auch den Wert von $1{,}3\,{\rm A}$ hat. Der Inhalt an magnetischer Energie der Spule beträgt 

$$
 E_{\rm mag} = \frac{1}{2} \cdot L \cdot I^2 \Rightarrow E_{\rm mag} = \frac{1}{2} \cdot 6{,}3\,{\rm H} \cdot (1{,}26\,{\rm A})^2 = 5{,}0\,{\rm J} 
$$

 Dieser Wert ist deutlich höher als der Grenzwert von $350\,{\rm mJ}$.

Auch die beim Ausschaltprozess anfängliche Spannung (vgl. Teilaufgabe c)) ist höher als $60\,\rm{V}$ und somit liegt der Schüler nach obiger Abbildung im berührungsgefährlichen Bereich.

e)

Das Öffnen und Schließen des Schalters muss automatisiert werden.

Um berührungsgefährliche Spannungen zu vermeiden, muss eine Spule mit deutlich kleinerer Induktivität gewählt werden.

## Grundwissen
- [Ein- und Ausschalten von RL-Kreisen](https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-induktion/grundwissen/ein-und-ausschalten-von-rl-kreisen)
