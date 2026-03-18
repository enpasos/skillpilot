# Beschleunigte Elektronen (Abitur BY 1978 LK A6-2)

Quelle: https://www.leifiphysik.de/relativitaetstheorie/spezielle-relativitaetstheorie/aufgabe/beschleunigte-elektronen-abitur-1978-lk-a6-2
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/relativitaetstheorie/spezielle-relativitaetstheorie/aufgabe/beschleunigte-elektronen-abitur-1978-lk-a6-2.html`
Schwierigkeitsgrad: schwere Aufgabe

## Aufgabe

Elektronen werden in ein begrenztes homogenes elektrisches Feld parallel zur Feldrichtung mit der Anfangsgeschwindigkeit $v_1=3{,}0 \cdot 10^6\,\frac{\rm m}{\rm s}$ eingeschossen und erreichen nach einer gewissen Flugstrecke die Geschwindigkeit $v_2=1{,}5 \cdot 10^8\,\frac{\rm m}{\rm s}$.

a)

Berechne die Potentialdifferenz, die die Elektronen durchlaufen haben.

b)

Berechne die Beschleunigung, die die die Elektronen beim Erreichen der Geschwindigkeit $v_2$, erfahren, wenn die Feldstärke $E=1{,}0 \cdot 10^5\,\frac{\rm V}{\rm m}$ beträgt. Beachte, dass $F = \frac{d}{dt}\left( m_{\rm rel} \cdot v \right)$ gilt.

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Die Kinetische Energie ist gleich der Differenz von Gesamtenergie und Ruheenergie:

$$
 \begin{aligned} e \cdot U &= m_0 \cdot c^2 \left( \frac{1}{\sqrt{1 - \left( \frac{v_2}{c} \right)^2}} - \frac{1}{\sqrt{1 - \left( \frac{v_1}{c} \right)^2}} \right) \\ U &= \frac{m_0 \cdot c^2}{e} \left( \frac{1}{\sqrt{1 - \left( \frac{v_2}{c} \right)^2}} - \frac{1}{\sqrt{1 - \left( \frac{v_1}{c} \right)^2}} \right)\end{aligned}
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
U = 0{,}511\,\rm{MeV} \cdot \left( \frac{1}{\sqrt{1 - 0{,}50^2}} - \frac{1}{\sqrt{1 - 0{,}01^2}} \right) = 0{,}511\,\rm{MV} \cdot 0{,}155 = 79\,\rm{kV}
$$


b)

Anwendung der Produkt-Regel für das Differenzieren und Benutzung von $ \frac{d}{dt} = \frac{d}{dv} \cdot \frac{dv}{dt} $ ergibt: 

$$
 \begin{aligned} e \cdot E &= a \cdot m_0 \cdot \left( -\frac{1}{2} \cdot \frac{1}{\left( 1 - \left( \frac{v}{c} \right)^2 \right)^{3/2}} \cdot \left( -\frac{2v}{c^2} \right) \cdot v + \frac{1 - \left( \frac{v}{c} \right)^2}{\left( 1 - \left( \frac{v}{c} \right)^2 \right)^{3/2}} \right) \\ &= a \cdot m_0 \cdot \frac{1}{\left( 1 - \left( \frac{v}{c} \right)^2 \right)^{3/2}}\\ a &= \frac{e \cdot E}{m_0} \cdot \left( 1 - \left( \frac{v}{c} \right)^2 \right)^{3/2} \end{aligned} 
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
 a = 1{,}76 \cdot 10^{11} \cdot 1{,}0 \cdot 10^5 \cdot \left( 1 - 0{,}5^2 \right)^{3/2}\,\frac{\rm A \cdot s \cdot V}{\rm kg \cdot m} = 1{,}14 \cdot 10^{16}\,\frac{\rm m}{\rm s^2} 
$$


## Grundwissen
- [Energie-Impuls-Beziehung](https://www.leifiphysik.de/relativitaetstheorie/spezielle-relativitaetstheorie/grundwissen/energie-impuls-beziehung)
