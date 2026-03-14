# TESLA-Beschleuniger (Abitur BY 2004 GK A2-3)

Quelle: https://www.leifiphysik.de/quantenphysik/quantenobjekt-photon/aufgabe/tesla-beschleuniger-abitur-2004-gk-a2-3
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/quantenphysik/quantenobjekt-photon/aufgabe/tesla-beschleuniger-abitur-2004-gk-a2-3.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

Der geplante Teilchenbeschleuniger TESLA soll mit gepulsten Elektronenpaketen arbeiten. Diese werden erzeugt, indem man im Vakuum eine Photokathode aus Cäsium-Tellurid mit kurzen Laserpulsen bestrahlt. Die Grenzwellenlänge dieser Photokathode wird mit $260\,\rm{nm}$ angegeben.

a)

Berechne die Mindestenergie, die die Photonen des Laserpulses haben müssen, um Photoelektronen auslösen zu können. [zur Kontrolle: $4{,}77\,\rm{eV}$] (3 BE)

b)

Berechne die maximale Austrittsgeschwindigkeit der Photoelektronen, wenn man Strahlung der Wellenlänge $255\,\rm{nm}$ benutzen würde. (6 BE)

c)

Um Photoelektronen mit vernachlässigbarer Austrittsgeschwindigkeit zu erhalten, bestrahlt man die Kathode mit Laserpulsen der Wellenlänge $260\,\rm{nm}$. Ein solcher Laserpuls erzeugt dabei ein Elektronenpaket der Ladung $1{,}0\,\rm{nAs}$.

Berechne die Energie eines solchen Laserpulses unter der Annahme, dass nur $2{,}0\,\%$ der Laserphotonen Elektronen auslösen. (5 BE)

d)

Alternativ wird ein Laserpuls gleicher Energie wie in Teilaufgabe c), aber kürzerer Wellenlänge verwendet. Der Auslöseanteil wird wieder mit $2{,}0\,\%$ angenommen.

Erläutere, wie sich die Zahl der ausgelösten Photoelektronen ändert. (4 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Für den Photoeffekt gilt die Gleichung von EINSTEIN 

$$
 h \cdot f = W_{\rm A} + E_{\rm kin} 
$$

 Für den Fall $ E_{\rm kin}=0$ ist dann $f=f_{\rm G}$ und die Gleichung vereinfacht sich zu

$$
h \cdot f_{\rm G} = W_{\rm A}
$$

Mit

$$
\lambda_{\rm G}=\frac{c}{f_{\rm G}} \Leftrightarrow f_{\rm G}=\frac{c}{\lambda_{\rm G}}
$$

ergibt sich dann

$$
W_{\rm A} =\frac{h \cdot c}{\lambda_{\rm G}}
$$

 Die Mindestenergie $ E_{\rm min} $ ist damit die Austrittsarbeit $W_{\rm A}$ und berechnet sich durch 

$$
 E_{\rm min} = W_{\rm A} = \frac{h \cdot c}{\lambda_{\rm G}} 
$$

Einsetzen der gegebenen Werte liefert (mit drei gültigen Ziffern Genauigkeit)

$$
 E_{\rm min} = \frac{6{,}63 \cdot 10^{-34}\,\rm{Js} \cdot 3{,}00 \cdot 10^8\,\frac{\rm m}{\rm s}} {260 \cdot 10^{-9}\,\rm m} = 7{,}65 \cdot 10^{-19}\,\rm J = 4{,}77\,\rm{eV} 
$$


b)

Die Geschwindigkeit der Elektronen erhält man ebenfalls mit der Gleichung von EINSTEIN 

$$
 \frac{h \cdot c}{\lambda} = W_{\rm A} + E_{\rm kin} \Leftrightarrow E_{\rm kin} = \frac{h \cdot c}{\lambda} - W_{\rm A} 
$$

 Mit $ E_{\rm kin} = \frac{1}{2} \cdot m_{\rm e} \cdot v^2 $ ergibt sich 

$$
 \frac{1}{2} \cdot m_{\rm e} \cdot v^2 = \frac{h \cdot c}{\lambda} - W_{\rm A} \Rightarrow v = \sqrt{ \frac{2}{m_{\rm e}} \cdot \left( \frac{h \cdot c}{\lambda} - W_{\rm A} \right) } 
$$

 Einsetzen der gegebenen Werte liefert (mit drei gültigen Ziffern Genauigkeit) 

$$
 v = \sqrt{ \frac{2}{9{,}11 \cdot 10^{-31}\,\rm{kg}} \cdot \left( \frac{6{,}63 \cdot 10^{-34}\,\rm{Js} \cdot 2{,}99 \cdot 10^8\,\frac{\rm m}{\rm s}} {255 \cdot 10^{-9}\,\rm m} - 7{,}65 \cdot 10^{-19}\,\rm J \right) } = 1{,}81 \cdot 10^5\,\frac{\rm m}{\rm s} 
$$


c)

Zunächst wird die Zahl $ N_{\rm e} $ der ausgelösten Fotoelektronen berechnet: 

$$
 N_{\rm e} = \frac{Q}{e} 
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
 N_{\rm e} = \frac{1{,}0 \cdot 10^{-9}\,\rm{As}}{1{,}60 \cdot 10^{-19}\,\rm{As}} = 6{,}3 \cdot 10^9 
$$

 Da nur $ 2{,}0\,\% $ der auftreffenden Photonen Elektronen auslösen, muss die Zahl $ N_{\rm Ph} $ der ankommenden Photonen entsprechend größer sein: 

$$
 N_{\rm Ph} = \frac{N_{\rm e}}{0{,}020} 
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
 N_{\rm Ph} = \frac{6{,}25 \cdot 10^9}{0{,}020} = 3{,}1 \cdot 10^{11} 
$$

 Da jedes dieser Photonen die Energie $ 7{,}65 \cdot 10^{-19}\,\rm J $ hat, ergibt sich für die Energie $ E_{\rm P} $ des Pulses 

$$
 E_{\rm P} = N_{\rm Ph} \cdot W_{\rm A} 
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
 E_{\rm P} = 3{,}1 \cdot 10^{11} \cdot 7{,}65 \cdot 10^{-19}\,\rm J = 2{,}4 \cdot 10^{-7}\,\rm J 
$$


d)

Die Zahl der ausgelösten Fotoelektronen wird geringer, da bei kürzerer Wellenlänge weniger (aber energiereichere) Photonen im Laserpuls enthalten sind.

## Grundwissen
- [EINSTEINs Theorie des Lichts](https://www.leifiphysik.de/quantenphysik/quantenobjekt-photon/grundwissen/einsteins-theorie-des-lichts)
