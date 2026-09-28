# Lösung und Bewertung

$f$ ist kubisch mit positivem Leitkoeffizienten; für $x\to\infty$ gilt $f(x)\to\infty$, für $x\to-\infty$ gilt $f(x)\to-\infty$. $f'(x)=0.3x^2-1.2x+0.9=0.3(x-1)(x-3)$, $f''(x)=0.6x-1.2$.

$f(0)=2$, $f'(0)=0.9$; Tangente $y=0.9x+2$, Normale $y=-(10/9)x+2$. Linear ergibt sich $f(0.2)≈2.18$.

$f''(x)=0$ bei $x=2$, $f(2)=2.2$. Links davon ist $f''<0$, rechts davon $f''>0$; die Krümmung wechselt.

Auf dem Modellbereich ist $f$ auf $[0;1]$ steigend, auf $[1;3]$ fallend und auf $[3;5]$ steigend. Bei $x=1$ wechselt $f'$ von positiv zu negativ: lokales Maximum $f(1)=2{,}4$. Bei $x=3$ wechselt es von negativ zu positiv: lokales Minimum $f(3)=2$. Für globale Aussagen sind zusätzlich die Randwerte $f(0)=2$ und $f(5)=4$ zu vergleichen. Das globale Maximum auf $[0;5]$ ist $4$ bei $x=5$, das globale Minimum $2$ wird bei $x=0$ und $x=3$ erreicht. Lokal vergleicht man in einer Umgebung, global auf dem gesamten angegebenen Bereich. Randwerte sind in diesem Vergleich keine ungeprüften inneren stationären Extremstellen. $x^3$ ist streng steigend, obwohl seine Ableitung bei $0$ gleich $0$ ist; die Nullstelle der Ableitung ohne Vorzeichenwechsel ist kein lokales Extremum.

$g$ ist achsensymmetrisch zur y-Achse, weil nur gerade Potenzen vorkommen. $h$ ist punktsymmetrisch zum Ursprung, weil $h(-x)=-h(x)$. Drei Extremstellen bei beiden Enden nach oben erfordern mindestens Grad $4$ mit positivem Leitkoeffizienten.

Bestehen ab 17/18 BE. Eine vollständig fehlende Teilkompetenz mit mindestens 2 BE kann nicht durch andere Teilaufgaben ersetzt werden; die Teilfallgrenzen der Rubrik sind fachliche Bewertungsanweisungen, keine serverseitigen Teilminima.

{
  "maxPoints": 18,
  "passingPoints": 17,
  "steps": [
    {
      "id": "j10-v2-polynomial-derivatives",
      "points": 3,
      "description": "Grad, mathematisches Randverhalten und beide Ableitungen korrekt."
    },
    {
      "id": "j10-v2-tangent-normal-approximation",
      "points": 3,
      "description": "Tangente, Normale und lineare Approximation korrekt."
    },
    {
      "id": "j10-v2-curvature",
      "points": 3,
      "description": "Wendestelle mit Vorzeichenwechsel und Krümmung."
    },
    {
      "id": "j10-v2-monotonicity",
      "points": 3,
      "description": "Monotonie auf [0;5], Vorzeichenbegründung und Gegenbeispiel x³ zur behaupteten Umkehrung."
    },
    {
      "id": "j10-v2-local-extrema",
      "points": 2,
      "description": "Beide inneren lokalen Extremstellen mit Vorzeichenwechsel; reine Ableitungsnullstellen ohne Begründung höchstens 0."
    },
    {
      "id": "j10-v2-global-extrema",
      "points": 2,
      "description": "Alle globalen Extremstellen durch Vergleich einschließlich beider Ränder und lokal/global unterscheiden; ohne Randvergleich 0."
    },
    {
      "id": "j10-v2-symmetry-degree",
      "points": 2,
      "description": "Symmetrie und minimalen Grad der beiden Enden und der Extrema begründen."
    }
  ]
}
