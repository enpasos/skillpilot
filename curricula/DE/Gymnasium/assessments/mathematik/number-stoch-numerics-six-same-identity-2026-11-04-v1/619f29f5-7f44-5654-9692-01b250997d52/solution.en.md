# Worked solution: a traceable numerical decision

Different documented methods are equivalent. One possible bisection record
is given below.

**1. Record the execution**

The target is the zero of $f(x)=x+e^x-4$ on $[1,2]$ with absolute error
at most $0.0005$. I choose bisection because a sign bracket for continuous
$f$ provides a traceable error bound, reproducibly and without special solver
functions. Initially $f(1)<0<f(2)$.
The first midpoint is $1.5$. Since $f(1.5)>0$, keep $[1,1.5]$.
The second midpoint is $1.25$. Since $f(1.25)>0$, keep $[1,1.25]$.
This documents the start but does not yet meet the accuracy target.
Here the checked table values can provide the further bracket; we do not
claim ten undocumented bisection steps.

Alternatively, a concrete instruction such as “solve $x+e^x-4=0$ with
search interval $[1,2]$”, together with the tool function and output
$x\approx1.07372894$, is a traceable start. Equivalent actual reproducible
input for the tool used is valid. The subsequent interval check is still
needed for either route.

**2. Check the result**

The table gives $f(1.073)<0<f(1.074)$, so the solution lies in
$[1.073,1.074]$. Continuity ensures existence; strict increase ensures
uniqueness. Its midpoint is
$$m=1.0735,\qquad |m-x_*|\leq\frac{1.074-1.073}{2}=0.0005.$$
Thus the original requirement is met. The table's rounding errors are far
smaller than the magnitudes and do not affect the signs. A finer appropriately
supported approximation is also valid; printed digits alone do not establish
their accuracy.

**3. Limitations**

The long solver output alone does not establish all displayed digits.
A suitable check or error estimate is needed. Concrete bisection limitations
include:

- This existence argument requires continuity and a sign bracket. With an
  incorrect bracket, the bisection record does not ensure that the desired
  zero is enclosed.
- Each bisection only halves the width; much tighter tolerances may require
  many function evaluations.
- Rounded values very close to zero can suggest the wrong sign if precision
  is insufficient. The supplied error bounds exclude that particular sign
  problem here.

Two appropriately explained limitations suffice. For a solver, dependence
on the initial value or search interval, and lack of an error guarantee from
decimal output alone, are examples if their effects are explained.

**4. Retrospective evaluation and changed requirement**

The choice was suitable for the original target: the record and additional
table values give a reproducible bracket and the required error bound.
A solver could supply an approximation faster, but still needs checking to
support the claimed accuracy. The table gives $f(1.0737)<0<f(1.0738)$,
so the new midpoint satisfies
$$m_2=1.07375,\qquad |m_2-x_*|\leq0.00005.$$
The earlier bracket does not meet the tighter requirement. A smaller bracket
must be established, using further bisections, more precise evaluations, or
the supplied table. Keeping the method with additional checking is as
legitimate as a justified switch of method. The evaluation must refer to
the actual record and requirement.
