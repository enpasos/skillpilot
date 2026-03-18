# Verhältnis verschiedener Uranisotope (Abitur BY 2007 LK A4-3)

Quelle: https://www.leifiphysik.de/kern-teilchenphysik/kernspaltung-und-kernfusion/aufgabe/verhaeltnis-verschiedener-uranisotope-abitur-2007-lk-a4-3
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/kern-teilchenphysik/kernspaltung-und-kernfusion/aufgabe/verhaeltnis-verschiedener-uranisotope-abitur-2007-lk-a4-3.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

Heutzutage gefördertes Natururan besteht lediglich zu $0{,}72\% $ aus dem leicht spaltbaren ${}_{}^{235}{\rm{U}}$, der Rest praktisch nur aus ${}_{}^{238}{\rm{U}}$. Für die Verwendung in modernen Leistungsreaktoren wird deshalb der ${}_{}^{235}{\rm{U}}$-Anteil durch Anreicherung auf $3{,}5\% $ erhöht.

a)

Berechne, vor wie vielen Jahren Natururan das gleiche Isotopenverhältnis zwischen ${}_{}^{235}{\rm{U}}$ und ${}_{}^{238}{\rm{U}}$ hatte wie das heute in Leistungsreaktoren verwendete Uran. (8 BE)

b)

Man vermutet, dass in manchen Uranerzvorkommen (z.B. Oklo, Westafrika) auf natürliche Art Kettenreaktionen stattfanden.

Begründe, warum hierfür nur solche Uranlagerstätten in Frage kommen, die eine hohe Urankonzentration aufwiesen und in die Wasser eindringen konnte.

Erläutere, warum heute keine derartigen Kettenreaktionen mehr stattfinden. (6 BE)

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Es gilt für beide Uransorten $N(t) = N(0) \cdot e^{ - \lambda \cdot t}$ mit Zeitpunkt $0$ früher und Zeitpunkt $t$ heute. Außerdem gilt für die Zerfallskonstanten $\lambda = \frac{\ln \left( 2 \right)}{T_{1/2}}$. Es gilt nun 

$$
 \frac{N_{235}\left( 0 \right)}{N_{238}\left( 0 \right)} = \frac{3{,}5}{96{,}5} \quad ; \quad \frac{N_{235}\left( t \right)}{N_{238}\left( t \right)} = \frac{0{,}72}{99{,}28} 
$$

 Daraus ergibt sich 

$$
 \frac{0{,}72}{99{,}28} = \frac{3{,}5 \cdot e^{ - \lambda_{235} \cdot t}}{96{,}5 \cdot e^{ - \lambda_{238} \cdot t}} \Leftrightarrow \frac{0{,}72 \cdot 96{,}5}{99{,}28 \cdot 3{,}5} = e^{\left( - \lambda_{235} + \lambda_{238} \right) \cdot t} 
$$

$$
 \ln \left( \frac{0{,}72 \cdot 96{,}5}{99{,}28 \cdot 3{,}5} \right) = \left( \lambda_{238} - \lambda_{235} \right) \cdot t 
$$

 Auflösen nach $t$ und Einsetzen von $\lambda$ liefert 

$$
 t = \frac{\ln \left( \frac{0{,}72 \cdot 96{,}5}{99{,}28 \cdot 3{,}5} \right)}{\lambda_{238} - \lambda_{235}} = \frac{\ln \left( \frac{0{,}72 \cdot 96{,}5}{99{,}28 \cdot 3{,}5} \right)}{\frac{\ln \left( 2 \right)}{4{,}5 \cdot 10^9 \,\rm a} - \frac{\ln \left( 2 \right)}{7{,}0 \cdot 10^8 \,\rm a}} = 1{,}9 \cdot 10^9 \,\rm a 
$$


b)

Man benötigt eine hohe Urankonzentration, damit die Neutronen nicht durch andere Stoffe absorbiert werden, bevor sie eine Kettenreaktion auslösen können. Da die primär erzeugten Neutronen schnelle Neutronen sind, für die weitere Spaltung aber langsame Neutronen notwendig sind, ist ein Moderator wie Wasser in direkter Umgebung des Urans nötig. Heute ist der vorkommende ${}_{}^{235}{\rm{U}}$-Anteil zu gering (siehe Teilaufgabe a)).

## Grundwissen
- [Kettenreaktion](https://www.leifiphysik.de/kern-teilchenphysik/kernspaltung-und-kernfusion/grundwissen/kettenreaktion)
