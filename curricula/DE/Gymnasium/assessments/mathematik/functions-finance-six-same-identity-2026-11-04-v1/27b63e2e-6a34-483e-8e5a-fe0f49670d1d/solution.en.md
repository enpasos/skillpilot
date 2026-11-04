# Worked solution: exponential models in context

**1. Expressions and assumptions**

The cell count doubles every two hours:
$$N(t)=100\cdot2^{t/2}.$$
The amount of substance halves every three hours:
$$M(t)=80\cdot\left(\frac12\right)^{t/3}.$$
Equivalent expressions using hourly factors $\sqrt2$ and $2^{-1/3}$
are valid. Each dataset shows equal factors over equal time intervals.
Extrapolation assumes these relative changes continue under unchanged
conditions; three observations alone do not prove validity for unlimited time.

**2. Graphs and predictions**

The growth graph starts at 100, increases and becomes progressively steeper.
The decay graph starts at 80 mg, decreases and approaches the time axis.
The quantities differ, so the diagrams have separate vertical axes.

Suitable plotting points for N are (0,100),(2,200),(4,400),(6,800),(8,1600); for M they are (0,80),(3,40),(6,20),(9,10). Draw smooth curves through these points, with both time axes labelled in hours.

$$N(6)=100\cdot2^3=800\text{ cells},\qquad
M(9)=80\cdot(1/2)^3=10\text{ mg}.$$

**3. Changed growth**

After four hours there are 400 cells. One model from that point is
$$N_v(t)=400\cdot1.1^{t-4}\quad(t\geq4).$$
It joins correctly at $N_v(4)=400$. At eight hours, the predictions are
$N(8)=1600$ and $N_v(8)=400\cdot1.1^4=585.64$, or about 586 cells.
The reduced relative growth yields a much smaller count. The fractional
model output is an approximate prediction, not a claim about a fraction
of an actually counted cell.

**4. Model limitations**

Indefinite real growth is implausible because nutrients or space are limited,
for example. The initial model would nevertheless keep increasing
exponentially; it must be adjusted outside suitable conditions.
Three halvings leave $10$ mg rather than zero. The model has $M(t)>0$
for every finite time: the amount only approaches zero. An actual measurement
or detection threshold must be distinguished from an amount of zero.
Equivalent concrete limitations are valid.
