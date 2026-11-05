# Monotonie und Extrema

Unveröffentlichter Reviewkandidat; kein PASS.

Eine Führungsschiene wird für $0 \le x \le 5$ modellhaft durch $f(x)=0.1x^3-0.6x^2+0.9x+2$ beschrieben.

1. Bestimme die erste Ableitung. Untersuche mit ihrem Vorzeichen die Monotonie auf dem gesamten Modellbereich und begründe deine Intervalle. (2 BE)
2. Bestimme die lokalen Extremstellen im Inneren des Modellbereichs und ihre Funktionswerte. Begründe die Einordnung durch Vorzeichenwechsel der ersten Ableitung. (2 BE)
3. Vergleiche alle für globale Extremwerte nötigen Funktionswerte einschließlich der Randwerte. Gib alle globalen Maximum- und Minimumstellen auf $[0;5]$ mit ihren Funktionswerten an und erläutere den Unterschied zwischen einer lokalen und einer globalen Extremwertaussage. (2 BE)

## Lösung

$f'(x)=0.3x^2-1.2x+0.9=0.3(x-1)(x-3)$. Die Ableitung ist vor $x=1$ und nach $x=3$ positiv, dazwischen negativ. Somit steigt $f$ auf $[0;1]$, fällt auf $[1;3]$ und steigt auf $[3;5]$.

Bei $x=1$ wechselt $f'$ von positiv zu negativ: lokales Maximum $f(1)=2{,}4$. Bei $x=3$ wechselt es von negativ zu positiv: lokales Minimum $f(3)=2$.

Für die globale Aussage werden auch die Ränder geprüft: $f(0)=2$, $f(5)=4$. Das globale Maximum ist $4$ bei $x=5$. Das globale Minimum $2$ wird bei $x=0$ und $x=3$ erreicht. Lokal wird eine Umgebung, global der gesamte angegebene Bereich verglichen. Die Randwerte werden für die globale Aussage berücksichtigt; sie werden nicht als innere stationäre Stellen ausgegeben.

{
  "maxPoints": 6,
  "passingPoints": 6,
  "steps": [
    {
      "id": "mono-sign-and-intervals",
      "points": 2,
      "description": "Beide Punkte nur mit korrekter erster Ableitung, allen drei Monotonieintervallen und passender Vorzeichenbegründung; ohne Ableitungsvorzeichenbegründung 0."
    },
    {
      "id": "mono-local-extrema",
      "points": 2,
      "description": "Beide Punkte nur mit beiden inneren Extremstellen x=1 und x=3, den passenden Funktionswerten und beiden korrekt gedeuteten Vorzeichenwechseln; bloße Ableitungsnullstellen ohne Einordnung 0."
    },
    {
      "id": "mono-global-extrema",
      "points": 2,
      "description": "Beide Punkte nur nach Randvergleich und Vergleich aller relevanten Kandidaten: globales Maximum bei x=5, globale Minima bei x=0 und x=3 samt Werten; lokale und globale Aussage fachlich unterscheiden. Ohne Randvergleich oder bei fehlendem zweiten globalen Minimum 0."
    }
  ]
}
