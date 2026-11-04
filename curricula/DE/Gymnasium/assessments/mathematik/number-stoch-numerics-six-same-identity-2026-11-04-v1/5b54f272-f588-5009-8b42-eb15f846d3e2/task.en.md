# Relative dispersion of a binomial distribution

For $X\sim B(n;p)$ with $n\geq1$ and $0<p<1$, relative dispersion
(the coefficient of variation) is $v=\sigma/\mu$. You may use
$\mu=np$ and $\sigma=\sqrt{np(1-p)}$.
Show your calculations and reasoning. A total of **20 points** is available.

**1. Compare two numbers of trials (6 points)**

Independent trials each have success probability $p=0.20$.
Calculate the expected number of successes, its standard deviation and its
relative dispersion for $n=100$ and $n=400$. Interpret how the absolute
standard deviation can increase while relative dispersion decreases.

**2. Justify the relationship (6 points)**

Use the given parameters to derive
$$v=\sqrt{\frac{1-p}{np}}.$$
Use it to justify why $v$ decreases as $n$ grows when $p$ is fixed.
Describe the effect of multiplying $n$ by four.

**3. Find a number of trials (4 points)**

Keeping $p=0.20$, find the smallest integer number of trials such that
$v\leq0.05$. Check the boundary using this value and the preceding integer.

**4. Examine the condition “fixed p” (4 points)**

Someone claims: “A larger number of trials always means smaller relative
dispersion, even if the success probability changes.” Test this claim using
$B(100;0.50)$ and $B(400;0.01)$. State the correct scope of the decreasing
relationship.
