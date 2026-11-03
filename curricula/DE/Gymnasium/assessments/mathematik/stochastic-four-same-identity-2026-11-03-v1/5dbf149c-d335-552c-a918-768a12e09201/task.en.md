A filling machine should deliver about $100\,\mathrm{ml}$ per container. A random measurement series contains $m=40$ fills. Measurements are rounded to whole millilitres. The following plausible dataset was constructed for this own task; it is not a published measurement study.

| Measurement in ml | 96 | 97 | 98 | 99 | 100 | 101 | 102 | 103 | 104 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Frequency | 1 | 3 | 5 | 7 | 8 | 7 | 5 | 3 | 1 |

![Frequencies of the 40 rounded fill volumes](/assets/assessment-materials/mathematik/5dbf149c-d335-552c-a918-768a12e09201/fill-volume-observations.en.7b891e7d3d3270b7fa90b2712db677d134534ddfd60812d42b5905465bf09f09.png)

We want to model the unrounded volume of a further fill as a continuous random variable $X$. A normal model is to be assessed, not assumed exactly true. Here use divisor $m$ for the empirical variance:
$$s^2=\frac1m\sum_{i=1}^{m}(x_i-\bar x)^2.$$
Digital calculation tools are allowed. In $N(\mu,\sigma^2)$, write the second parameter as the variance.

**1 · Obtain parameters from the data (5 points)**

Calculate $\bar x$, $s^2$ and $s$. Show an understandable approach incorporating the frequencies.

**2 · Form a model (4 points)**

State a normal model fitted to the measurement series. Use the shape of the data to explain why it can be a reasonable starting point. Distinguish the estimates from this sample from the unknown true process parameters.

**3 · Calculate and interpret ranges (5 points)**

Use your model to estimate $P(97.5\le X\le102.5)$ and $P(X>104)$. State the probability expressions and briefly interpret them for further fills. Here $X$ is already the continuously modelled volume; this is not a normal approximation to a binomial distribution.

**4 · Assess the model (6 points)**

What proportion of the 40 observed values lies between $97.5$ and $102.5\,\mathrm{ml}$? Compare it with the model probability and discuss what this comparison does and does not show about the appropriateness of the model. Give at least one specific limitation in this measurement setting. A formal goodness-of-fit test is not required.

