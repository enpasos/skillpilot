# Use an exponential distribution as a waiting-time model

At an automated collection point, the waiting time $T$ until the next release,
in minutes, is modelled by an exponential distribution with $\lambda=0.25$
per minute. The model satisfies
$$P(T>t)=e^{-0.25t}\quad(t\geq0).$$
You may use this formula; it need not be recalled from memory.
Show your setups and interpret results in context. Round probabilities to four
decimal places. A total of **20 points** is available.

**1. Interpret the continuous model (4 points)**

Explain the possible values of $T$ and what $P(T>3)$ describes.
Compare $P(T=3)$ with $P(2<T\leq3)$ and explain the distinction between
one value and a time interval in a continuous model.

**2. Calculate with the model (6 points)**

Find the probability of waiting at most two minutes and the probability of
waiting more than two but at most six minutes. Also find the time $t_{90}$
by which a release has occurred with probability $0.90$.

**3. Investigate a model property (6 points)**

Someone has already waited five minutes. Under this condition, find the
probability of waiting more than three additional minutes. Compare it with
the probability, at the start, of waiting more than three minutes. Explain
the model property in words.
Also assess the claim: “The release must have occurred after four minutes
at the latest.” Justify your answer with a probability.

**4. Evaluate the model choice (4 points)**

State an assumption appropriate to the collection point under which this
waiting-time model is plausible. After a technical change, releases are
forced at least once every four minutes. Assess whether the same exponential
model can describe the new situation exactly. Justify your answer using a
model property and state a limitation of the modelling.
