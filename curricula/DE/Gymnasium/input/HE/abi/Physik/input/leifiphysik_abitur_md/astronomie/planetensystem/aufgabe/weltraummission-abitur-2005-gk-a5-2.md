# Weltraummission (Abitur BY 2005 GK A5-2)

Quelle: https://www.leifiphysik.de/astronomie/planetensystem/aufgabe/weltraummission-abitur-2005-gk-a5-2
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/astronomie/planetensystem/aufgabe/weltraummission-abitur-2005-gk-a5-2.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

![](https://www.leifiphysik.de/sites/default/files/images/5f946d0b49655c1bf7e836c3d5e5ba4d/1024weltraummission_aufgabe_astro.jpg)

Abb. 1 Mond vor der Erde aufgenommen von einer Raumsonde

NASA [Public domain], [via Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Globe_epc_2015198_lrg.jpg)

Bei den Apollo-Missionen zum Mond wurde die Raumkapsel zunächst in eine kreisförmige Erdumlaufbahn (Parkbahn) gebracht und anschließend durch kurzzeitiges Zünden des Haupttriebwerkes auf den Weg zum Mond beschleunigt.

a)

Zwischen Erde und Mond gibt es einen Punkt, in dem sich die Gravitationskräfte von Erde und Mond aufheben.

Berechne den Abstand $r_0$ dieses Punktes vom Erdmittelpunkt. Verwende für den Abstand der Erde zum Mond den Wert $3{,}84\cdot 10^5\,\rm{km}$. [Zur Kontrolle: r0 = 3,46·105 km] (8 BE)

b)

Berechne die Mindestgeschwindigkeit $v^\ast$, auf die ein Satellit von der Parkbahn (190 km über der Erdoberfläche) beschleunigt werden müsste, um anschließend antriebslos den Abstand $r_0$ zu erreichen. Der Einfluss des Mondes soll dabei nicht berücksichtigt werden. (6 BE)

c)

Tatsächlich könnte bei einem Mondflug eine Geschwindigkeit $v < v^\ast$ genügen, um von der Parkbahn aus Teilaufgabe **b)** antriebslos den Abstand $r_0$ zu erreichen.

Nenne hierfür eine mögliche Ursache. (2 BE)

## Lösung

a)

Kräftegleichgewicht der Gravitationskräfte:

$$
 \begin{array}{I} G \cdot \frac{ m_E \cdot m }{ r_0^2 } = G \cdot \frac{ m_M \cdot m }{ ( r_{EM} - r_0)^2 } \Rightarrow \frac{m_E}{r_0^2} = \frac{m_M}{(r_{EM} - r_0)^2} \\\\\Rightarrow (r_{EM} - r_0)^2 \cdot m_E = r_0^2 \cdot m_M \Rightarrow (r_{EM} - r_0) \cdot \sqrt{m_E} = r_0 \cdot \sqrt{m_M} \\\\\Rightarrow r_{EM} \cdot \sqrt{m_E} - r_0 \cdot \sqrt{m_E} = r_0 \cdot \sqrt{m_M} \Rightarrow r_{EM} \cdot \sqrt{m_E} = r_0 \cdot ( \sqrt{m_M} + \sqrt{m_E} ) \\\\\Rightarrow r_0 = \frac{ \sqrt{m_E} }{ \sqrt{m_M} + \sqrt{m_E} } \cdot r_{EM} \end{array} 
$$

$$
 r_0 = \frac{ \sqrt{m_E} }{ \sqrt{ 1,23 \cdot 10^{-2} \cdot m_E + \sqrt{m_E} } } \cdot 3{,}84 \cdot 10^5\,\rm{km} = \frac{ 1 }{ \sqrt{1,23 \cdot 10^{-2} + 1} } \cdot 3{,}84 \cdot 10^5\,\rm{km} = 3{,}46 \cdot 10^5\,\rm{km} 
$$


b)

$ r_{Min} = R_{Erde} + 190\,\rm{km} = 6368\,\rm{km} + 190\,\rm{km} = 6558\,\rm{km} $
$ r_{Max} = r_0 = 3{,}46 \cdot 10^5\,\rm{km} $

Große Halbachse der Hohmannbahn $ a = \frac{ (r_{Min} + r_{Max}) }{2} = 1{,}76 \cdot 10^5\,\rm{km} $

Allgemein gilt 

$$
 v^\ast = \sqrt{ G \cdot m_E \cdot \left( \frac{2}{r_{min}} - \frac{1}{a} \right) }
$$

$$
\Rightarrow v^\ast = \sqrt{ 6,67 \cdot 10^{-11} \frac{m^3}{\,\rm{kg} \cdot \rm{s}^2} \cdot 6,0 \cdot 10^{24}\,\rm{kg} \left( \frac{2}{6,56 \cdot 10^6\,\rm{m}} - \frac{1}{1,76 \cdot 10^8\,\rm{m}} \right) } \Rightarrow v^\ast = 10{,}9\,\rm{\frac{km}{s}} 
$$


c)

Die Anziehungskraft des Mondes wurde bei Teilaufgabe **b)** nicht berücksichtigt, sie hilft, den Körper in die höhere Bahn zu bringen, wenn man den Zeitpunkt richtig wählt, so dass die benötigte Geschwindigkeit nicht so groß wie $v^\ast$ sein muss.

## Grundwissen
- [Bahnen im Gravitationsfeld](https://www.leifiphysik.de/astronomie/planetensystem/grundwissen/bahnen-im-gravitationsfeld)
