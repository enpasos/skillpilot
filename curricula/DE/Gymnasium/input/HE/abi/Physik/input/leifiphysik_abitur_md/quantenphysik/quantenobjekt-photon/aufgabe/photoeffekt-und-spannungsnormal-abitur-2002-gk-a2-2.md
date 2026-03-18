# Photoeffekt und Spannungsnormal (Abitur BY 2002 GK A2-2)

Quelle: https://www.leifiphysik.de/quantenphysik/quantenobjekt-photon/aufgabe/photoeffekt-und-spannungsnormal-abitur-2002-gk-a2-2
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/quantenphysik/quantenobjekt-photon/aufgabe/photoeffekt-und-spannungsnormal-abitur-2002-gk-a2-2.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

a)

Erkläre, auf welche Weise sich zwischen Kathode und Anode einer Vakuum-Fotozelle, deren Kathode mit monochromatischem Licht der Wellenlänge $\lambda \le \lambda_{\rm{G}}$ bestrahlt wird, eine bestimmte Spannung $U$ aufbaut.

Gehe dabei auch auf die Bedeutung der Grenzwellenlänge $\lambda_{\rm{G}}$ ein. (7 BE)

Im Folgenden wird mit einer Vakuum-Fotozelle mit $\lambda_{\rm{G}} = 551\,\rm{nm}$ gearbeitet.

b)

Berechne die Austrittsarbeit $W_{\rm{A}}$ des Kathodenmaterials.

Gib an, aus welchem Material die Kathode besteht. [zur Kontrolle: $W_{\rm{A}}=2{,}25\,\rm{eV}$] (5 BE)

Die Fotozelle befinde sich an Bord eines Satelliten außerhalb der Erdatmosphäre und werde mit Sonnenlicht bestrahlt, das vorher ein Quarzprisma durchlaufen hat. Quarz ist im UV-Bereich nur für $\lambda>250\,\rm{nm}$ durchlässig.

c)

Erkläre, weshalb unter diesen Bedingungen die Spannung an der Fotozelle einen gewissen Höchstwert $U_{\max }$ nicht überschreitet. (6 BE)

Die Fotozelle soll dazu dienen, bei Bedarf ein Spannungsnormal reproduzieren zu können. Zu diesem Zweck wird die Anordnung so eingestellt, dass die Zelle nur mit Licht der Wellenlänge $\lambda_{\rm{L}} = 382\,\rm{nm}$ bestrahlt wird.

d)

Berechne die zu $\lambda_{\rm{L}}$ gehörende Fotospannung $U_{\rm{L}}$. (5 BE)

e)

Gib an, wie es sich auf $U_{\rm{L}}$ auswirkt, wenn die Intensität des auf die Fotokathode treffenden Lichts der Wellenlänge $\lambda_{\rm{L}}$ Schwankungen unterliegt.

Begründe deine Antwort. (5 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Bestrahlt man die Kathode einer Vakuum-Fotozelle mit monochromatischem Licht der Wellenlänge $\lambda\le\lambda_{\rm{G}}$, so tritt eine Wechselwirkung der Photonen mit den Elektronen des Katheodenmaterials auf, bei der die Photonen sich unter Abgabe ihrer gesamten Energie an das Elektron vernichten. Das Elektron kann mit dieser Energie das Kathodenmaterial verlassen, wobei es einen Teil der Energie als Austrittsarbeit abgibt. Den Rest der Energie behält es als kinetische Energie. Auf diese Weise gelangen die Elektronen zur Anode und lagern sich dort an. Dadurch bauen sie eine Gegenspannung auf, die solange steigt, bis keines der aus der Kathode austretenden Elektronen mehr gegen diese Spannung anlaufen kann.

Ist die Photonenenergie kleiner als die Austrittsarbeit, so kann kein Elektron die Kathode verlassen, dies ist der Fall, wenn die Wellenlänge $\lambda$ größer als die Grenzwellenlänge $\lambda_{\rm{G}}$ ist.

b)


$$
 W_{\rm A} = \frac{h \cdot c}{\lambda_{\rm G}}
$$

Einsetzen der gegebenen Werte liefert (mit drei gültigen Ziffern Genauigkeit)

$$
W_{\rm A} = \frac{6{,}63 \cdot 10^{-34}\,\rm{Js} \cdot 3{,}00 \cdot 10^8\,\rm{\frac{m}{s}}}{551 \cdot 10^{-9}\,\rm m} = 3{,}61 \cdot 10^{-19}\,\rm J = 2{,}25\,\rm{eV} 
$$

 Nach der Tabelle in der Formelsammlung handelt es sich um Kalium.

c)

Hat das die Fotozelle bestrahlende Licht keine Wellenlänge, die kleiner ist als $ 250\,\rm{nm} $, so ist die Energie der Photonen nach oben beschränkt und damit können auch die austretenden Fotoelektronen keine Energie besitzen, die größer ist als 

$$
 E_{\rm{kin,max}} = E_{\rm Ph} - W_{\rm A} = \frac{h \cdot c}{\lambda} - W_{\rm A} 
$$

 Sie können also wegen 

$$
 E_{\rm{kin,max}} = U_{\rm max} \cdot e \Leftrightarrow U_{\rm max} = \frac{E_{\rm{kin,max}}}{e} = \frac{\frac{h \cdot c}{\lambda} - W_{\rm A}}{e} 
$$

 maximal die Spannung 

$$
 U_{\rm max} = \frac{ \frac{6{,}63 \cdot 10^{-34}\,\rm{Js} \cdot 3{,}00 \cdot 10^8\,\rm{\frac{m}{s}}}{250 \cdot 10^{-9}\,\rm m} - 2{,}25 \cdot 1{,}602 \cdot 10^{-19}\,\rm A\,s\,\rm{V} }{1{,}602 \cdot 10^{-19}\,\rm A\,s} = 2{,}72\,\rm V 
$$

 aufbauen.

d)

Analog zur Rechnung aus Aufgabenteil c) erhält man 

$$
 U_{\rm L} = \frac{ \frac{6{,}63 \cdot 10^{-34}\,\rm{Js} \cdot 3{,}00 \cdot 10^8\,\rm{\frac{m}{s}}}{382 \cdot 10^{-9}\,\rm m} - 2{,}25 \cdot 1{,}602 \cdot 10^{-19}\,\rm A\,s\,\rm{V} }{1{,}602 \cdot 10^{-19}\,\rm A\,s} = 1{,}00\,\rm V 
$$


e)

Die Intensität des Lichtes hat keine Auswirkung auf die Spannung $U_{\rm{L}}$, da die Spannung unabhängig von der Anzahl der auftretenden Photonen nur von der Wellenlänge abhängt.

## Grundwissen
- [EINSTEINs Theorie des Lichts](https://www.leifiphysik.de/quantenphysik/quantenobjekt-photon/grundwissen/einsteins-theorie-des-lichts)
