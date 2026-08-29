# Prüfungsaufgabe: Kreisbewegung, periodische Modellierung und trigonometrische Ableitungen verknüpfen

Status: released after focused simulated internal review on 2026-08-28

SkillPilot-ID: `2c30949d-0381-5d32-81cf-c6eac7711399`

Bewertungseinheiten: 24 BE

## Aufgabe

Ein Punkt bewegt sich mit konstanter Winkelgeschwindigkeit auf einem Kreis. Für die Modellierung wird der Kreis auf den Einheitskreis normiert. Außerdem wurden bei einer vollständigen Umdrehung eines Riesenrads folgende Höhen einer Gondel gemessen:

| $t$ in s | 0 | 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| $h$ in m | 2,0 | 4,9 | 12,0 | 19,1 | 22,0 | 19,1 | 12,0 | 4,9 | 2,0 |

Eine weitere, zunächst nicht für die Modellbildung verwendete Messung ergab $h(12)=15{,}1\,\mathrm m$.

1. Erläutern Sie am Einheitskreis, warum bei einem Winkel $\varphi$ die $x$-Koordinate durch $\cos(\varphi)$ und die $y$-Koordinate durch $\sin(\varphi)$ beschrieben wird. Skizzieren Sie anschließend die Graphen von Sinus und Kosinus für $0\le \varphi\le 2\pi$ und kennzeichnen Sie jeweils Amplitude und Nullstellen. (5 BE)
2. Leiten Sie im Bogenmaß mit den Additionstheoremen und den Grenzwerten
   $$
   \lim_{u\to0}\frac{\sin u}{u}=1,\qquad
   \lim_{u\to0}\frac{\cos u-1}{u}=0
   $$
   die Regeln $(\sin x)'=\cos x$ und $(\cos x)'=-\sin x$ her. Begründen Sie insbesondere das Minuszeichen und erläutern Sie, weshalb das Bogenmaß für die erste Grenzwertgleichung entscheidend ist. (6 BE)
3. Bestimmen Sie aus den Messdaten ein geeignetes Sinus- oder Kosinusmodell für $h(t)$. Deuten Sie die Modellparameter im Kontext, begründen Sie mindestens zwei Annahmen des Modells, prüfen Sie es an der zusätzlichen Messung bei $t=12$ und nennen Sie eine konkrete Grenze seiner Gültigkeit. (7 BE)
4. Bestimmen Sie für Ihr Modell $h'(t)$. Ermitteln Sie damit innerhalb einer Umdrehung die Monotonieintervalle und die Extremstellen, geben Sie die zugehörigen Höhen an und prüfen Sie die Ergebnisse am Verlauf der Messdaten. (6 BE)
