# Wasserstoffspektrum (Abitur BY 2008 GK A3-1)

Quelle: https://www.leifiphysik.de/atomphysik/quantenmech-atommodell/aufgabe/wasserstoffspektrum-abitur-2008-gk-a3-1
Originaldatei: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/Physik/input/leifiphysik_abitur/pages/atomphysik/quantenmech-atommodell/aufgabe/wasserstoffspektrum-abitur-2008-gk-a3-1.html`
Schwierigkeitsgrad: mittelschwere Aufgabe

## Aufgabe

Vor 100 Jahren haben Johannes RYDBERG und Walter RITZ die Serienformel des Wasserstoffatoms aufgestellt:

$$
\frac{1}{\lambda } = {R_\infty } \cdot \left( {\frac{1}{{{n_1}^2}} - \frac{1}{{{n_2}^2}}} \right)
$$

mit ${n_2} > {n_1}$, wobei ${R_\infty}$ die RYDBERG-Konstante ist.

a)

Zeigen Sie, dass man bei geeigneter Wahl des Energienullpunkts aus der Serienformel die $n$-te Energiestufe

$$
{E_n} = {R_\infty} \cdot h \cdot c \cdot \left( {1 - \frac{1}{{{n^2}}}} \right)
$$

des Wasserstoffatoms erhält.

b)

Berechnen Sie die Energiewerte der drei niedrigsten Energieniveaus und die Ionisierungsenergie des Wasserstoffatoms.

Im sichtbaren Bereich des Lichts ($380\rm{nm}$ bis $750\rm{nm}$) sind nur Linien der BALMER-Serie (${n_1} = 2$) zu beobachten.

c)

Bestimmen Sie rechnerisch, zwischen welchen Werten die Wellenlängen der Linien der BALMER-Serie liegen.

d)

Zeigen Sie, dass alle Linien der Lyman-Serie (${n_1} = 1$) im ultravioletten Bereich des Lichts liegen.

e)

Nehmen Sie sowohl für das BOHRsche als auch für das quantenmechanische Atommodell jeweils kurz Stellung, ob sie mit der HEISENBERGschen Unschärferelation verträglich sind.

## Lösung

**Hinweis:** Bei dieser Lösung von LEIFIphysik handelt es sich nicht um den amtlichen Lösungsvorschlag des bayr. Kultusministeriums.

a)

Wählt man als Energienullpunkt den Zustand mit $n_1 = 1$, so folgt mit

$$
{\Delta {E_{{n_2} \to {n_1}}} = {R_\infty} \cdot h \cdot c\left( {\frac{1}{{{n_1}^2}} - \frac{1}{{{n_2}^2}}} \right)}
$$

und ${{n_1} = 1}$ und ${{n_2} = n}$

$$
{{E_n} - {E_1} = {R_\infty} \cdot h \cdot c\left( {\frac{1}{1} - \frac{1}{{{n^2}}}} \right)}
$$

und mit ${{E_1} = 0}$

$$
{{E_n} = {R_\infty} \cdot h \cdot c\left( {1 - \frac{1}{{{n^2}}}} \right)}
$$


b)

Für $n = 1$: ${E_1} = 0{\rm{eV}}$

Für $n = 2$: ${E_2} = 13,6{\rm{eV}} \cdot \left( {1 - \frac{1}{{{2^2}}}} \right) = 10,2{\rm{eV}}$

Für $n = 3$: ${E_3} = 13,6{\rm{eV}} \cdot \left( {1 - \frac{1}{{{3^2}}}} \right) = 12,1{\rm{eV}}$

Für $n = \infty $: ${E_\infty } = {E_{{\rm{Ion}}}} = 13,6{\rm{eV}}$

c)

Bei der BALMER-Serie gilt $n_1 = 2$. Die größte Wellenlänge ergibt sich für $n_2 = 3$

$$
{\frac{1}{{{\lambda _{\max }}}} = 1,0968 \cdot {{10}^7} \cdot \left( {\frac{1}{{{2^2}}} - \frac{1}{{{3^2}}}} \right)\frac{{\rm{1}}}{{\rm{m}}} = 1,0968 \cdot {{10}^7} \cdot 0,1389\frac{{\rm{1}}}{{\rm{m}}} \Rightarrow {\lambda _{\max }} = 656 {\rm{nm}}}
$$

die kleinste Wellenlänge für ${n_2} = \infty $

$$
{\frac{1}{{{\lambda _{\min }}}} = 1,0968 \cdot {{10}^7} \cdot \left( {\frac{1}{{{2^2}}} - 0} \right)\frac{{\rm{1}}}{{\rm{m}}} = 1,0968 \cdot {{10}^7} \cdot 0,25\frac{1}{m} \Rightarrow {\lambda _{\min }} = 365 {\rm{nm}}}
$$

Die Wellenlängen der Balmer-Serie liegen zwischen ${365{\rm{nm}}}$ und ${656{\rm{nm}}}$.

d)

Die größte Wellenlänge der LYMAN-Serie ($n_1 = 1$) ergibt sich für $n_2 = 2$:

$$
\frac{1}{{{\lambda _{\max }}}} = {R_\infty} \cdot \left( {1 - \frac{1}{{{2^2}}}} \right) = \frac{3}{4} \cdot {R_\infty} \Rightarrow {\lambda _{\max }} = 122{\rm{nm}}
$$

Die Wellenlänge $122{\rm{nm}}$ liegt im UV-Bereich, die Wellenlängen der anderen Linien der LYMAN-Serie sind kürzer liegen also erst recht im UV-Bereich.

e)

Die HEISENBERGsche Unschärferelation $\Delta x \cdot \Delta {p_x} \ge \frac{h}{{2 \cdot \pi }}$ besagt, dass Ort und Impuls eines Teilchens gleichzeitig nicht beliebig genau bestimmt werden können.

Beim BOHRschen Atommodell geht man von definierten Kreisbahnen der Elektronen um den Kern aus. Dies ist nach der HEISENBERGschen Unschärferelation nicht zulässig.

Beim quantenmechanische Atommodell befinden sich die Elektronen in den Orbitalen. Hier geht man nicht von definierten Bahnen, sondern von Räumen aus, in denen sich die Elektronen mit einer gewissen Wahrscheinlichkeit aufhalten.

## Grundwissen
- [Energiezustände von Wasserstoff und verwandten Atomen](https://www.leifiphysik.de/atomphysik/atomarer-energieaustausch/grundwissen/energiezustaende-von-wasserstoff-und-verwandten-atomen)
