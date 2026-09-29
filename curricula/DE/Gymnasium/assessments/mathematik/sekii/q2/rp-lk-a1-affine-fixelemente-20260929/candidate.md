# RP LK A1: Fixelemente affiner Abbildungen

Quelle: `curricula/DE/Gymnasium/input/RP/Mathematik_Sekundarstufe_II_MSS.pdf`, Druck-S. 48–49 / PDF-S. 49–50, Leistungsfach-Wahlpflichtgebiet A1, insbesondere Nr. 10 und 13. A1 ist eine Alternative zu A2; die heutige RP-LK-Ansicht bildet beide technisch als Union ab, nicht als reale Pflicht beider Gebiete.

Status: KI-erstellter Aufgabenentwurf `needs_review`; keine unabhängige Aufgabenfreigabe, keine menschliche Freigabe oder Erprobung.

<a id="aufgabe"></a>

## Aufgabe (12 BE)

In der Ebene seien zwei affine Abbildungen mit derselben Matrix

$$A=\begin{pmatrix}1&0\\0&-1\end{pmatrix}$$

gegeben. Es gilt $T(\vec x)=A\vec x+\binom{0}{2}$ und $U(\vec x)=A\vec x+\binom{1}{2}$. Eine Gerade heißt hier *mengenweise invariant*, wenn jeder ihrer Bildpunkte wieder auf dieser Geraden liegt und die Bildmenge die ganze Gerade ist. *Punktweise fest* heißt, dass jeder Punkt der Geraden an seinem Ort bleibt.

1. Leite für $T$ aus $T(\vec x)=\vec x$ die Fixpunktgleichung $(A-I)\vec x=-\vec b$ her. Löse sie und deute die gesamte Fixpunktmenge geometrisch. (4 BE)
2. Untersuche ebenso, ob $U$ Fixpunkte besitzt. Erkläre das Ergebnis an der entstehenden Gleichung, statt nur einen Probe-Punkt einzusetzen. (2 BE)
3. Parametrisiere $g: y=1$ durch $(t,1)$ mit $t\in\mathbb R$. Prüfe, ob $g$ unter $U$ mengenweise invariant und ob sie punktweise fest ist. Vergleiche kurz mit $T$ auf derselben Geraden. (4 BE)
4. Eine Person behauptet: „Wenn eine Gerade unter einer affinen Abbildung auf sich abgebildet wird, ist sie automatisch eine Fixgerade aus lauter Fixpunkten.“ Beurteile die Behauptung mit deinen Ergebnissen und erkläre den Unterschied. (2 BE)

## Lösung

1. $A\vec x+\vec b=\vec x$ ist äquivalent zu $(A-I)\vec x=-\vec b$. Für $T$ lautet das Gleichungssystem $0=0$ und $-2y=-2$, also $y=1$ und $x$ beliebig. Die gesamte Fixpunktmenge ist die Gerade $g:y=1$; insbesondere ist $\vec b\ne0$, also ist dies kein bloß linearer Spezialfall. (4 BE)
2. Für $U$ entsteht in der ersten Koordinate $0=-1$. Das ist widersprüchlich; die Fixpunktmenge ist leer. (2 BE)
3. $U(t,1)=(t+1,1)$. Für jedes $t$ liegt das Bild auf $g$, und weil $t+1$ alle reellen Werte durchläuft, ist die Bildmenge genau $g$. Kein Punkt bleibt fest, da $t+1\ne t$. Dagegen gilt $T(t,1)=(t,1)$ für jedes $t$, also ist $g$ unter $T$ punktweise fest. (4 BE)
4. Die Behauptung ist falsch. $U$ lässt $g$ als Menge invariant, verschiebt ihre Punkte aber längs der Geraden. $T$ hält jeden Punkt von $g$ fest. Die Lage der ganzen Geraden und die Ortsgleichheit jedes einzelnen Punkts sind verschiedene Bedingungen. (2 BE)

## Bewertungsrahmen

Maximal 12 BE. Der aktuelle Backend-Vertrag erzwingt nur eine Gesamtpunktgrenze, keine verpflichtenden Einzelkriterien. Ein späterer maschineller Release kann deshalb mit dieser Rubrik nur bei 12/12 BE sicherstellen, dass beide Lernziele vollständig bearbeitet wurden; eine mildere Grenze bräuchte gesondert technisch geprüfte Teilbedingungen. Bis zur unabhängigen Aufgabenprüfung bleibt die Aufgabe `needs_review`.
