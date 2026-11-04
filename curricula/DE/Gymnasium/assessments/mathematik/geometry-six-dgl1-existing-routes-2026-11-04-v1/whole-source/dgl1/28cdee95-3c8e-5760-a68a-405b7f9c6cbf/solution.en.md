# Worked solution: separation and direct integration

**1.** On an interval where $y(t)\ne0$, division by $y^2$ is valid.
Separation and integration give
$$
\frac1{y^2}\,dy=dt,
\qquad\int y^{-2}\,dy=\int1\,dt,
\qquad-\frac1y=t+K.
$$
Rearranging yields
$$
y(t)=-\frac1{t+K}=\frac1{C-t},\qquad C=-K\in\mathbb R.
$$
The integration constant selects one function from the family. Its
denominator must be nonzero. Thus the expression is a solution on any
connected open interval not containing $t=C$; the two largest such
intervals are $(-\infty,C)$ and $(C,\infty)$. Restricting to a smaller
valid interval gives the same solution on fewer points. Parameterising
with $K$ or any equivalent constant is equally valid.

An equivalent elementary approach sets $u=1/y$ on an interval without
zeros. The reciprocal derivative gives $u'=-y'/y^2=-1$, so integration
yields $u=-t+C$ and the same family. Here too, division requires
$y\ne0$. No general existence, uniqueness or completeness theorem for
differential equations is needed for this task.

**2.** For a constant function $y(t)=k$, $y'=0$. The equation requires
$0=k^2$, hence $k=0$. Therefore $y(t)=0$ is a solution on $\mathbb R$.
Dividing by $y^2$ excluded it, so it must be added separately. No finite
value of $C$ in the family gives the zero function.

**3.** Applying the initial condition to the family gives
$$
1=y(0)=\frac1C,\qquad C=1,
\qquad y(t)=\frac1{1-t}.
$$
The denominator vanishes at $t=1$. The largest open interval without
that point and containing $0$ is $(-\infty,1)$. At $t=1$, the expression
has no real value and cannot be a differentiable solution there.
It also defines a solution branch on $(1,\infty)$, but that interval
does not contain the initial point $0$. The two separate pieces do
not give one solution interval through $t=1$. This uses elementary
domain restrictions, not a general maximality or uniqueness theorem.

**4.** For every $t<1$,
$$
y'(t)=\frac1{(1-t)^2}
\quad\text{and}\quad y(t)^2=\frac1{(1-t)^2}.
$$
Thus $y'=y^2$ holds throughout the chosen interval. Also,
$y(0)=1/(1-0)=1$. Checking alone would not derive the family in part 1;
together with the derivation it supplies the required verification.

**5.** Direct integration gives
$$
z(t)=\int2t\,dt=t^2+L,\qquad L\in\mathbb R.
$$
The condition $z(0)=-2$ gives $L=-2$, hence $z(t)=t^2-2$.
This polynomial is differentiable on all of $\mathbb R$, with no
zero-denominator or other domain restriction, so the largest interval
is $\mathbb R$. We have $z'(t)=2t$ for every real $t$, and $z(0)=-2$.
Unlike part 1, there is no factor depending on $z$ to separate: the
derivative is already given solely as a function of $t$.

## One overall assessment

There is one total score out of **20 points** and one binary result:
**pass at 15 points or more**, otherwise not passed. Part scores are not
separate pass thresholds. Equivalent justified methods, alternative names
for the integration constant and correct rearrangements receive equal
credit. Naming “separation” alone does not replace work, and valid work
does not require a particular keyword.

Credit correct performances wherever they occur; count each once. Award
partial credit as specified, otherwise 0.5 points for meaningful incomplete
work. Do not repeatedly penalise one local error; credit correct traceable
follow-through. No additional method variants or general differential-equation
theorems are required. The supplied rule only simplifies verification;
deriving the solution and determining constants remain independent work.

| Criterion | Points |
|---|---:|
| Sound separation, reciprocal or other elementary setup with necessary conditions (1); mathematically sound derivation of the family by integration or equivalent reasoning, including a free parameter (3); rearranges for a valid parameter family (1); states the denominator restriction for a solution interval (1). | 6 |
| Substitutes y=k in the original equation and obtains k=0 (1); connects the zero solution to the case excluded by division (1). | 2 |
| Applies the initial condition to the family and determines its constant (2); correct particular solution (1); largest open interval containing 0 without a zero denominator (1); elementary explanation of the missing pole value or separate second branch (1). | 5 |
| Calculates the particular solution’s derivative with traceable work (1); checks equality of y′ and y² on the interval (1); explicitly checks the initial condition (1). | 3 |
| General z solution derived by direct integration with an arbitrary constant (1); determines constant from z(0)=−2 and states particular solution (1); justifies all of R as the interval (1); checks derivative and initial value (1 together, 0.5 each). | 4 |

Before comparison with the passing threshold, cap the ordinary total
at **14 points** if the whole submission contains no sound independent
elementary derivation of the nonzero solution family for $y'=y^2$, or if
nowhere is a particular solution obtained from a general solution using an
initial condition. Merely stating or differentiating a guessed family does
not replace the first core action. The second core action may be supplied
by either equation; the two initial-value parts have no separate pass rules.
Equivalent elementary derivations, such as using $u=1/y$, are accepted.
Concise correct work counts. A local arithmetic, sign or copying slip with
a sound method does not trigger the cap. An isolated omitted special case
or interval step loses its allocated points without automatically creating
another pass barrier. Multiple cap reasons give the same upper limit.
There remains exactly one overall assessment.
