# Sonnenähnlicher Stern (Abitur BY 2007 GK A6-1)

Quelle: https://www.leifiphysik.de/astronomie/fixsterne/aufgabe/sonnenaehnlicher-stern-abitur-2007-gk-a6-1
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/astronomie/fixsterne/aufgabe/sonnenaehnlicher-stern-abitur-2007-gk-a6-1.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

Der Stern τ Cet im Sternbild Walfisch (Cetus) ist der uns am nächsten gelegene sonnenähnliche Stern, um den man eine Scheibe aus Staub aufgespürt hat. Er wird deshalb als besonders interessanter Anwärter für Exoplaneten (Planeten außerhalb unseres Sonnensystems) gesehen.

Angaben zu τ Cet:

- Spektralklasse: G8
- Absolute Helligkeit: $M=5{,}7$
- Jährliche trigonometrische Parallaxe: $0{,}28''$
- Innerhalb von 50 Jahren verschiebt sich seine Position an der Himmelsphäre um $\mu=96''$ gegenüber den weit entfernten Hintergrundsternen.
- Im Spektrum des Sterns ergibt sich für die Hα-Linie (Laborwellenlänge $\lambda=656{,}279\,\rm{nm}$) eine Wellenlänge von $\lambda=656{,}244\,\rm{nm}$.

a)

Zeige, dass τ Cet $12$ Lichtjahre von uns entfernt ist. (3 BE)

b)

Beurteile, ob wir τ Cet bei guten Sichtverhältnissen von der Erde aus mit bloßem Auge beobachten können. (4 BE)

c)

Berechne den Betrag der Tangentialgeschwindigkeit von τ Cet. (5 BE)

d)

Ermittle auch den Betrag der Radialgeschwindigkeit des Sterns.

Gib an, ob sich τ Cet auf uns zu oder von uns weg bewegt. (4 BE)

e)

Berechne, in welcher Entfernung ein Planet um τ Cet kreisen müsste, damit die Bestrahlungsstärke auf diesem Planeten so groß ist wie die von der Sonne verursachte Bestrahlungsstärke auf der Erde. (8 BE)

f)

Begründe, dass es sich bei τ Cet um einen Hauptreihenstern handelt. (3 BE)

g)

Auch im Kern des Sterns τ Cet wird die Wasserstoff-Fusion nach entsprechender Zeit zum Erliegen kommen.

Beschreibe die weitere Entwicklung, die der Stern dann durchlaufen wird. (6 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Entfernungsbestimmung mittels trigonometrischer Parallaxe: 

$$
 r= \frac{1\rm{''} \cdot 1\,\rm{pc}}{p}
$$

Einsetzen der gegebenen Werte liefert (mit drei gültigen Ziffern Genauigkeit)

$$
r = \frac{1\rm{''} \cdot 1\,\rm{pc}}{0{,}28\rm{''}} = 3{,}57\,\rm{pc} = 12\,\rm{Lj} 
$$


b)

Bestimmung der relativen Helligkeit mit dem Entfernungsmodul: 

$$
 m - M = 5 \cdot \log{\frac{r}{10\,\rm{pc}}} \Rightarrow m = 5 \cdot \log{\frac{3{,}57\,\rm{pc}}{10\,\rm{pc}}} + 5{,}7 = 3{,}5 
$$

 Da die relative Helligkeit kleiner als $6$ (Grenze der Sichtbarkeit mit freiem Auge) ist, könnte man ihn beobachten.

c)

Die in $\Delta t = 50\,\rm{a}$ zurückgelegte tangentiale Wegkomponente ist $\delta s_{\rm t} = r \cdot \mu$, mit der Eigenbewegung $\mu = 96''$ im Bogenmaß. 

$$
 v_t = \frac{\Delta s_t}{\Delta t}
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
v_t = \frac{12 \cdot 9{,}46 \cdot 10^{15}\,\rm m \cdot 96 \cdot 2\pi}{360 \cdot 3600 \cdot 50 \cdot 365 \cdot 24 \cdot 3600\,\rm s} = 3{,}4 \cdot 10^4\,\rm{\frac{m}{s}} 
$$


d)

Da die Wellenlänge der verschobenen Linie kleiner ist als die Laborwellenlänge bewegt sich τ Cet auf uns zu.

Die Radialgeschwindigkeit berechnet man mittels DOPPLER-Effekt: 

$$
 v_r = \frac{\Delta \lambda}{\lambda} \cdot c
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
 v_r = \frac{0{,}035\,\rm{nm}}{656{,}279\,\rm{nm}} \cdot 3{,}0 \cdot 10^8\,\rm{\frac{m}{s}} = 1{,}6 \cdot 10^4\,\rm{\frac{m}{s}} 
$$


e)

Die Leuchtkraft $L$ von τ Cet ergibt sich durch Vergleich der Leuchtkräfte und absoluten Helligkeiten mit der Sonne: 

$$
 L_{\tau\rm{-Cet}} = q^{M_{\rm Sonne} - M_{\tau\rm{-Cet}}} \cdot L_{\rm Sonne} 
$$

Einsetzen der gegebenen Werte liefert (mit drei gültigen Ziffern Genauigkeit)

$$
 L_{\tau\rm{-Cet}} = 2{,}512^{4{,}8-5{,}7} \cdot 3{,}82 \cdot 10^{26}\,\rm W = 1{,}67 \cdot 10^{26}\,\rm W 
$$

 Die Bestrahlungsstärke ist gleich der Solarkonstante auf der Erde. 

$$
 S = \frac{L}{4 \pi r^2} \Rightarrow r = \sqrt{\frac{L}{4 \pi \cdot S}} 
$$

Einsetzen der gegebenen Werte liefert (mit zwei gültigen Ziffern Genauigkeit)

$$
 r = \sqrt{\frac{1{,}67 \cdot 10^{26}\,\rm W}{4 \pi \cdot 1360\,\frac{\rm W}{\rm m^2}}} = 9{,}9 \cdot 10^{10}\,\rm m = 0{,}66\,\rm{AE} 
$$


f)

Da sowohl die Leuchtkraft als auch die Spektralklasse sich nur unwesentlich von denen der Sonne unterscheiden, handelt es sich wie bei der Sonne um einen Hauptreihenstern.

g)

- Wenn der Wasserstoffvorrat des Kerns (ca. $10\,\%$ der Sternmasse) in Helium ungewandelt ist, schiebt sich die Zone des "Wasserstoffbrennens" weiter nach außen.
- Die Außenschichten des Sterns werden aufgeheizt und blähen sich auf, wodurch die Oberfläche größer und kühler wird, obwohl die Gesamtstrahlung nicht geringer wird.
- Der Stern wird zum Roten Riesen, dessen Radius etwa $100$ mal so groß ist wie der derzeitige Sternradius.
- Gleichzeitig verdichtet sich der Kern immer mehr, weil die geringere zentrale Fusionsrate einen geringeren Gasdruck zur Folge hat, der Gravitationsdruck aber nicht nachläßt.
- Durch diese Kontraktion heizt sich der Kern auf ca. $100$ Millionen Kelvin auf. Bei diesen Temperaturen kann das Helium, was bisher nicht verwertbares Endprodukt der H-Fusion war, zu höheren Elementen, vorallem Kohlenstoff weiter verschmelzen. Das Ende dieser Fusionskette ist beim Eisen erreicht.
- Diese höheren Prozesse sind energetisch nicht so ergiebig wie die primäre H-Fusion. Deshalb ist das Riesenstadium auch wesentlich kürzer als das Hauptreihenstadium.
- Zuletzt stößt der Stern seine Hülle weg und verbleibt als weißer Zwerg, der langsam erkaltet.

## Grundwissen
- [Hauptreihenstadium](https://www.leifiphysik.de/astronomie/fixsterne/grundwissen/hauptreihenstadium)
