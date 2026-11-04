# Find e in the Taylor expansion

For $f(x)=e^x$, every derivative is again $e^x$.
The Taylor polynomial about $0$ is

$$
P_n(x)=\sum_{k=0}^{n}\frac{f^{(k)}(0)}{k!}x^k.
$$

Use $0!=1$. Show your reasoning and calculations.
A total of **20 points** is available.

**1. Form the Taylor polynomial (4 points)**

Use the derivative values to determine $P_4(x)$, writing every term out.

**2. State the series representation (4 points)**

State the infinite series representation of $e$ both in summation notation
and with its first five terms. Explain the starting index, factorial,
and the meaning of the infinite sum as a limit of finite partial sums.

**3. Calculate partial sums (4 points)**

Calculate $S_4=\sum_{k=0}^4 1/k!$ and $S_6=\sum_{k=0}^6 1/k!$ as
fractions and to six decimal places. Which two terms are added?

**4. Explain the Taylor connection (4 points)**

Explain $S_n=P_n(1)$. Why is a finite partial sum an approximation
rather than exactly $e$ here? Also explain why $P_n(0)$ instead describes
the value $e^0=1$.

**5. Use a given error bound (4 points)**

For $n\geq1$, you may use $0<e-S_n<1/(n\,n!)$ without proving it.
Use $S_6$ to give an interval for $e$ and determine whether it guarantees
rounding $e$ to three decimal places. Finally explain why this bound
confirms convergence to $e$ as $n$ increases.
