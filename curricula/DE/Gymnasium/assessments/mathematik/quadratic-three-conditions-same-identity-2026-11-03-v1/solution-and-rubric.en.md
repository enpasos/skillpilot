**1 · Point conditions**

A point $(x,y)$ lies on the graph when $f(x)=y$. Substituting the three given coordinate pairs gives the system in the initially unknown coefficients:
$$\begin{aligned}
\text{I:}\quad &c=1,\\
\text{II:}\quad &4a+2b+c=3,\\
\text{III:}\quad &16a+4b+c=1.
\end{aligned}$$
The first point condition immediately determines $c$ in this example. This is a valid first reduction of the independently formulated three-variable system. The form $0a+0b+c=1$ is equivalent.

**2 · One possible systematic solution**

Substitute $c=1$ into II and III, leaving
$$4a+2b=2,\qquad 16a+4b=0.$$
Divide by $2$ and $4$, respectively, to obtain
$$2a+b=1,\qquad 4a+b=0.$$
Subtract the first of these equations from the second to eliminate $b$:
$$2a=-1,\qquad a=-\frac12.$$
Substituting back into $2a+b=1$ gives $-1+b=1$, hence $b=2$. Together with $c=1$, this yields
$$f(x)=-\frac12x^2+2x+1.$$
Equivalent ways of solving the system are accepted, such as first obtaining $b=1-2a$ from $4a+2b=2$ and substituting it into the other equation. Directly combining the two reduced equations to obtain $8a=-4$ is also equivalent. The final form $f(x)=-\frac12(x-2)^2+3$ is equally correct when the required derivation using a system has been shown. Symmetry may check the system solution but does not replace the explicitly requested solution of the system.

**3 · Check against the original points**

$$\begin{aligned}
f(0)&=1,\\
f(2)&=-\frac12\cdot4+2\cdot2+1=-2+4+1=3,\\
f(4)&=-\frac12\cdot16+2\cdot4+1=-8+8+1=1.
\end{aligned}$$
The expression therefore satisfies all three given point conditions. Numerically checking all three original system equations after substituting the coefficients is equally acceptable.

**4 · Repeatable procedure**

For each point, I substitute its $x$-coordinate into $ax^2+bx+c$ and set the expression equal to its $y$-coordinate. This gives three simultaneous linear equations for the coefficients. By substituting quantities already determined, or by taking suitable combinations of equations, I remove unknowns step by step. Once an unknown is determined, I substitute its value into earlier equations to recover the remaining coefficients. Finally, I construct the function expression and substitute to check that it satisfies the original point conditions. Here $c$ is determined immediately; then $b$ is eliminated, $a$ is calculated, and $b$ is recovered.

This short description is one possible explanation. Equivalent mathematical comments alongside the actual transformations suffice, such as “substitute $c$ into the other two conditions”, “subtract equations to eliminate $b$”, “substitute $a$ back”, and a correspondingly explained check. Neither a particular Gaussian algorithm, program code nor a general proof of uniqueness is required.

**Ordinary total score and cap:** Partial credit adds up to one raw score out of 16. The single passing threshold is 12. Before this comparison, cap the total at 11 if any of the following core actions is absent across the entire submission or based only on a fundamentally unsuitable model:

- No independently formulated system from the point conditions with the three initially unknown coefficients is evident.
- The system is not visibly used in a systematic way to determine the coefficients; a purely one-parameter symmetry or vertex solution does not replace the required system-based work.
- There is no mathematically meaningful concrete check substituting the obtained coefficients or expression back into at least one original point condition and comparing with its given value.
- There is no understandable algorithmic explanation of a repeatable procedure; correct final values or merely naming methods without explaining steps is insufficient.

The cap does not require a flawless answer or wording matching the reference. A concise correct explanation, a different order of unknowns, or a different suitable system-solving method receive equal credit. Relevant work anywhere in the submission counts, including comments alongside calculations; missing part numbers or an explanation not repeated separately do not trigger the cap. A clearly identifiable point equation may appear within the solution steps. Immediately determining $c$ from the first independently formulated equation still belongs to solving the three-variable system.

Deduct for an isolated arithmetic, sign or copying error only once. Correctly executed follow-through and correctly identifying that a check fails earn the relevant credit; do not treat false equalities as correct. A single missing or erroneous point check loses partial credit and does not automatically trigger the cap if a genuine check is present. Individual gaps within an otherwise meaningful procedure explanation are also graded by the rubric. There is one total score and one binary result, with no part-pass fields or additional prerequisite evidence. This ordinary rubric for the new task changes no graph rule and does not requalify existing mastery. Grade only reliably legible submitted work; do not assume work not shown.

point-P · 1 points: Correctly translates P into the coefficient equation c=1; 0a+0b+c=1 is equivalent.

point-Q · 1 points: Correctly translates Q: 4a+2b+c=3.

point-R · 1 points: Correctly translates R: 16a+4b+c=1. The three conditions concern the same unknown coefficients.

substitute-c · 1 points: Actually substitutes c from the first condition into the remaining equations; accept an equivalent first elimination step.

reduced-system · 1 points: Traceably obtains two suitable remaining linear conditions, such as 4a+2b=2 and 16a+4b=0 or scaled equivalents. Apply the follow-through rule.

eliminate-and-a · 2 points: Valid traceable further substitution or elimination step 1; correct a=-1/2 1. Accept an equivalent order and method.

back-substitute-b · 1 points: Determines the further unknown by substitution back: here b=2. Accept an equivalent reversed order.

function-equation · 1 points: Constructs a complete function expression from the determined coefficients; with error-free earlier work, -x^2/2+2x+1 or an equivalent form. Do not penalise consistent follow-through again for the same error.

check-P · 1 points: Substitutes the expression or obtained coefficients into the original P condition and compares with 1. Correctly recognising a discrepancy after an earlier error counts as a check.

check-Q · 1 points: Checks the original Q condition by actual substitution and comparison with 3. Credit sound follow-through and correctly identifying an error.

check-R · 1 points: Checks the original R condition by actual substitution and comparison with 1. No repetition is needed if that check is already clearly present elsewhere.

algorithm-translate · 1 points: Explains how substituting x and equating to y turns each point into an equation for the same coefficients. Clear mathematical comments count.

algorithm-reduce · 1 points: Explains reducing unknowns step by step through suitable substitution or combinations of equations, for example why subtracting eliminates b.

algorithm-recover · 1 points: Explains substituting known values back to recover the remaining coefficients and the expression.

algorithm-verify · 1 points: Explains checking against the original data by substitution and comparison with the given function values. Comments alongside actual checks may fulfil this.
