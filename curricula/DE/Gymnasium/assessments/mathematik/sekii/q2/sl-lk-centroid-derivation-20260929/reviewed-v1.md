# Q2 LK: Dreiecksschwerpunkt aus Seitenhalbierenden herleiten

Quelle: `curricula/DE/Gymnasium/input/SL/LP_Ma_LK_HP_2019.pdf`, gedruckte
S. 33, Abschnitt „Vektorielle Untersuchung geometrischer Strukturen“:
Herleitung der Formeln für Streckenmittelpunkt und Dreiecksschwerpunkt.
Geltung: Saarland, gymnasiale Oberstufe, Hauptphase Leistungskurs. Die
Q2-Einordnung ist die SkillPilot-Übungsstruktur, keine amtliche SL-Halbjahrszuordnung.

Status: nach unabhängiger KI-Aufgabenprüfung maschinell `released`; keine
menschliche Freigabe und keine Erprobung mit Lernenden.

<a id="aufgabe"></a>

## Aufgabe (12 BE)

Ein dreieckiger Messrahmen wird durch drei nicht kollineare Raumpunkte
beschrieben. Die drei Seitenhalbierenden sollen sich in einem gemeinsamen
Schwerpunkt schneiden.

1. Bezeichne die Ortsvektoren der Eckpunkte mit $a,b,c$. Bilde die
   Seitenmittelpunkte $M_a$ von $BC$ und $M_b$ von $AC$. Setze einen
   Schnittpunkt ihrer Seitenhalbierenden als
   $S=A+\lambda(M_a-A)=B+\mu(M_b-B)$ an. Leite durch Vergleich der
   Koeffizienten zu den unabhängigen Vektoren $b-a$ und $c-a$ die Werte
   $\lambda=\mu=2/3$ und daraus die Ortsvektorformel für $S$ her. (6 BE)
2. Für $A=(0|0|0)$, $B=(6|0|0)$ und $C=(0|6|3)$: Berechne $S$ und $M_a$.
   Zeige mit gerichteten Vektoren das Teilungsverhältnis $AS:SM_a=2:1$.
   (4 BE)
3. Bestimme $M_c$ von $AB$ und prüfe unabhängig, dass der in 2.
   gefundene Punkt $S$ auch auf der Seitenhalbierenden von $C$ liegt. (2 BE)

## Lösung und fachlicher Bewertungsmaßstab

1. $m_a=(b+c)/2$, $m_b=(a+c)/2$. Mit $u=b-a$ und $v=c-a$ lautet die erste
   Seitenhalbierende $s-a=(\lambda/2)u+(\lambda/2)v$ und die zweite
   $s-a=(1-\mu)u+(\mu/2)v$. Weil $A,B,C$ nicht kollinear sind, sind $u,v$
   unabhängig. Somit $\lambda/2=1-\mu$ und $\lambda/2=\mu/2$,
   also $\lambda=\mu=2/3$ und
   $s=a+(2/3)((b+c)/2-a)=(a+b+c)/3$.
   Durch zyklisches Vertauschen liegt derselbe Punkt auch auf der dritten
   Seitenhalbierenden. Eine bloß zitierte Formel ohne Herleitung erhält für
   diesen Teil keine Herleitungspunkte. (6 BE)
2. $S=(2|2|1)$ und $M_a=(3|3|1{,}5)$. Die gerichteten Vektoren
   $\overrightarrow{AS}=(2,2,1)$ und
   $\overrightarrow{SM_a}=(1,1,0{,}5)$ erfüllen
   $\overrightarrow{AS}=2\overrightarrow{SM_a}$; das Verhältnis ist $2:1$.
   (4 BE)
3. $M_c=(3|0|0)$. Es gilt
   $\overrightarrow{CS}=(2,-4,-2)$ und
   $\overrightarrow{CM_c}=(3,-6,-3)$, also
   $\overrightarrow{CS}=(2/3)\overrightarrow{CM_c}$. Damit liegt $S$
   auch auf der dritten Seitenhalbierenden. (2 BE)

Bestehensgrenze: 12/12 BE. Der Server prüft derzeit nur die Gesamtpunktzahl. Die vorläufig strenge Grenze stellt sicher, dass die allgemeine Herleitung und die unabhängige Prüfung der dritten Seitenhalbierenden nicht durch Punkte aus anderen Teilaufgaben ersetzt werden. Eine mildere Grenze setzt technisch geprüfte Teilbedingungen voraus.

## English task/solution equivalence

A triangular measurement frame has three non-collinear spatial vertices.
Its three medians are to meet at one centroid.

1. Write the position vectors as $a,b,c$, form the side midpoints $M_a$
   of $BC$ and $M_b$ of $AC$, and set
   $S=A+\lambda(M_a-A)=B+\mu(M_b-B)$. Compare coefficients of independent
   vectors $b-a$ and $c-a$ to derive $\lambda=\mu=2/3$ and the centroid
   position-vector formula. (6 points)
2. For $A=(0,0,0)$, $B=(6,0,0)$, $C=(0,6,3)$, calculate $S$ and $M_a$.
   Use directed vectors to show $AS:SM_a=2:1$. (4 points)
3. Find midpoint $M_c$ of $AB$ and independently check that $S$ lies on
   the median from $C$. (2 points)

Solution: $m_a=(b+c)/2$, $m_b=(a+c)/2$. Set $u=b-a$, $v=c-a$. The first
median gives $s-a=(\lambda/2)u+(\lambda/2)v$; the second gives
$s-a=(1-\mu)u+(\mu/2)v$. Independence yields
$\lambda/2=1-\mu=\mu/2$, hence $\lambda=\mu=2/3$ and
$s=(a+b+c)/3$. Cyclic substitution confirms the third median. Numerically,
$S=(2,2,1)$, $M_a=(3,3,1.5)$,
$\overrightarrow{AS}=(2,2,1)=2(1,1,0.5)=2\overrightarrow{SM_a}$.
$M_c=(3,0,0)$ and
$\overrightarrow{CS}=(2,-4,-2)=(2/3)(3,-6,-3)
=(2/3)\overrightarrow{CM_c}$.
