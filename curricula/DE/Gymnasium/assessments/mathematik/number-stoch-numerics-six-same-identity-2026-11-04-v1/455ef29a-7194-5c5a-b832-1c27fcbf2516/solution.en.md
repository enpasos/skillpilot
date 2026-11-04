# Worked solution: exponential waiting times

**1. Continuous waiting time**

We have $T\geq0$: the model allows every nonnegative real waiting time and
has no finite upper bound. $P(T>3)$ is the probability that no release
has occurred after three minutes.
One value has probability $P(T=3)=0$, whereas
$$P(2<T\leq3)=e^{-0.5}-e^{-0.75}\approx0.1342>0.$$
A continuous model assigns probability to intervals, rather than individual
times. Measurements of finite precision represent small intervals in
practice; zero probability here does not forbid reporting an observed
waiting time as “3 minutes”.

**2. Probabilities and quantile**

$$P(T\leq2)=1-e^{-0.5}\approx0.3935,$$
$$P(2<T\leq6)=e^{-0.5}-e^{-1.5}\approx0.3834.$$
Solving $1-e^{-0.25t_{90}}=0.90$ gives
$$t_{90}=\frac{\ln(10)}{0.25}\approx9.21\text{ minutes}.$$
This is a 90-percent bound, not a certain maximum waiting time.

**3. Time already elapsed**

$$P(T>8\mid T>5)=\frac{P(T>8)}{P(T>5)}
=\frac{e^{-2}}{e^{-1.25}}=e^{-0.75}\approx0.4724.$$
This equals $P(T>3)$. In this model, the time already spent waiting does
not affect the distribution of the remaining waiting time (memorylessness).
This is a property of the model, not a guarantee for every real collection
point. The four-minute claim is false: $P(T>4)=e^{-1}\approx0.3679$.
Thus the model assigns positive probability to longer waits.

**4. Assumption and limitation**

One plausible assumption is a time-homogeneous random release mechanism,
where the absence of earlier releases does not alter the chance during the
next short time interval. A forced release within four minutes contradicts
$P(T>4)>0$ and the unbounded waiting time. The same model therefore cannot
describe the new situation exactly and needs adjustment. Even before the
change, the constant release chance was an assumption requiring scrutiny.
Credit equivalent concrete assumptions and suitable model limitations.
