# Document a numerical method and evaluate the decision afterwards

Find an approximation to the solution of $x+e^x=4$ in $[1,2]$.
For $f(x)=x+e^x-4$, you may assume that $f$ is continuous and strictly
increasing. Initially, the approximation must differ from the actual
solution by at most $0.0005$.

Choose between bisection and a numerical equation solver.
In **bisection**, evaluate the midpoint of an interval whose endpoint values
have different signs and keep the half with a sign change. For any bracket
$[a,b]$ with a sign change, its midpoint has error at most $(b-a)/2$.
You may use this information. No particular solution algorithm needs to be
recalled from memory. The following checked values are available as a
calculation aid (rounding error less than $10^{-7}$ in each case):

| $x$ | approximate $f(x)$ |
|---:|---:|
| 1 | -0.2817182 |
| 2 | 5.3890561 |
| 1.5 | 1.9816891 |
| 1.25 | 0.7403430 |
| 1.073 | -0.0028612 |
| 1.074 | 0.0010644 |
| 1.0737 | -0.0001136 |
| 1.0738 | 0.0002790 |

A total of **20 points** is available. Write a brief verification record
that another person can follow. You may use the table, a calculator or a
digital tool.

**1. Document the chosen method (6 points)**

Choose one method and record the equation, search interval, accuracy target,
method, and a concrete reason for your choice. Document its execution:
for bisection, show the first two bisection steps from $[1,2]$; for a solver,
record reproducible input with a search interval or initial value and the
returned approximation. Without a tool, you can start bisection entirely
using the table.

**2. Support the result and accuracy (6 points)**

Use suitable table values for an independent bracket. Give an approximation
with a justified absolute error bound meeting the accuracy target. Explain
why there is exactly one solution in the interval considered. An arbitrarily
long decimal output alone is not an error certificate.

**3. State limitations (4 points)**

Someone copies the solver output $1.073728937556$ without further checking
and claims that all displayed digits are thereby justified. Evaluate this
evidence. State two concrete limitations of your chosen method or its
documentation, explaining how each affects reliability or effort.

**4. Evaluate the decision afterwards (4 points)**

Use your actual record to evaluate whether your choice was appropriate for
the original accuracy target. The required absolute error bound is then
tightened to $0.00005$. Use the table to show a suitable new bracket and
approximation. Explain what addition or change to your original procedure
is needed.
