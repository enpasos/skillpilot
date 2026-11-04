# Solve first-order differential equations yourself

Find real-valued differentiable functions on suitable intervals.
Derive your solutions from the equations. Merely stating and checking
a guessed function does not replace a solution derivation.
Mathematically equivalent justified methods are accepted.
Total: **20 points**.

**1. Derive a general solution family (6 points)**

Solve
$$
y'(t)=y(t)^2
$$
for the nonzero case by separation of variables or an equivalent
elementary approach. Show your derivation, including any integration steps you use,
and rearrange for $y(t)$. State the arbitrary parameter and explain the restriction the
denominator places on a solution interval. If you divide, make clear
when that division is valid.

**2. Check a case excluded during rearrangement (2 points)**

Find the constant solutions of the same equation by direct substitution.
Explain which one is not captured by division in the nonzero case.

**3. Apply an initial condition (5 points)**

Use your solution family to determine the solution with $y(0)=1$.
Give the largest open interval containing $0$ on which that expression
has no zero denominator. Justify it directly from the denominator and
initial value. Explain why continuing the same expression on the other
side of a zero denominator does not produce a solution through that
point. No general existence or uniqueness theorem is required.

**4. Actually check the initial-value solution (3 points)**

Calculate the derivative of your particular solution. Check the
differential equation throughout the stated interval and the initial
condition. For this check, you may use
$$
\left(\frac1{u(t)}\right)'=-\frac{u'(t)}{u(t)^2}
$$
for differentiable $u$ wherever $u(t)\ne0$.

**5. Use another elementary method (4 points)**

Also solve
$$
z'(t)=2t
$$
by direct integration. Give its general solution and the particular
solution with $z(0)=-2$. State a suitable largest solution interval
and check the particular solution, including its initial condition.
