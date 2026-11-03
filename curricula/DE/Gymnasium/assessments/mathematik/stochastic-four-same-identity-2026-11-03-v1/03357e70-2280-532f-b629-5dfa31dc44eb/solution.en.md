# Example solution and ordinary scoring rubric

This is one possible solution. Equivalent binomial sums, cumulative distribution functions, complement expressions, or justified digital calculations are accepted. The notation below is not a mandatory submission format.

## Error probabilities and test power

The upper binomial tail probability increases with $p$. For these two right-sided rules, the largest rejection probability under $H_0:p\leq0.05$ therefore occurs at the boundary $p_0=0.05$.

For rule A:

$$
\alpha_A=P_{0.05}(X\geq10)
=1-\sum_{k=0}^{9}\binom{100}{k}0.05^k0.95^{100-k}
\approx0.0281883.
$$

$$
\beta_A(0.12)=P_{0.12}(X\leq9)
=\sum_{k=0}^{9}\binom{100}{k}0.12^k0.88^{100-k}
\approx0.2256519.
$$

$$
G_A(0.12)=P_{0.12}(X\geq10)
=1-\beta_A(0.12)\approx0.7743481.
$$

For rule B:

$$
\alpha_B=P_{0.05}(X\geq8)\approx0.1279605,
$$

$$
\beta_B(0.12)=P_{0.12}(X\leq7)\approx0.0761361,
\qquad G_B(0.12)=1-\beta_B(0.12)\approx0.9238639.
$$

| Rule | Type I error at the null boundary | Type II error at $p_1=0.12$ | Test power at $p_1=0.12$ |
|---|---:|---:|---:|
| A | $2.8188\%$ | $22.5652\%$ | $77.4348\%$ |
| B | $12.7960\%$ | $7.6136\%$ | $92.3864\%$ |

A **type I error** triggers an investigation even though the true defect rate is at most $5\%$. The calculated values concern the worst-case null boundary; they do not guarantee a fixed number of false alarms in a finite series of repetitions.

A **type II error at $p_1$** occurs when the rule does not flag production despite a true defect rate of $12\%$. Test power is the probability of detecting this particular deviation. Here, $\beta$ and power are probabilities **under the named alternative**, not probabilities that the alternative is true after observing the data.

B rejects for smaller defect counts. At the same sample size, this produces more false alarms but fewer missed deviations and higher power at $p_1$. The preferred rule therefore depends on the operating objective.

## Observation and contextual decisions

At $X=9$, A does not reject the null hypothesis and B rejects it. A's non-rejection does not prove $p\leq0.05$. B's rejection is not certain proof of $p>0.05$ either; the error probabilities describe possible incorrect decisions.

**A is suitable for routine checking:** $\alpha_A\approx2.82\%\leq5\%$ and $G_A(0.12)\approx77.43\%\geq75\%$. B meets the power objective but exceeds the permitted false-alarm probability.

**B is suitable for temporary targeted fault investigation:** $\alpha_B\approx12.80\%\leq15\%$ and $G_B(0.12)\approx92.39\%\geq90\%$. A meets the false-alarm limit but does not achieve the required power. This is a choice between the two given rules for the stated objectives, not a claim of global optimality.

## One total score: 20 points, pass at 15 points

Each row below is worth one point. Evidence may appear anywhere appropriate in the complete submission; the same achievement is counted only once.

| ID | Assessable achievement | Points |
|---|---|---:|
| alpha_a_event | Correct type I event for A with $p_0$ | 1 |
| alpha_a_value | Correct calculation of its probability | 1 |
| alpha_b_event | Correct type I event for B with $p_0$ | 1 |
| alpha_b_value | Correct calculation of its probability | 1 |
| beta_a_event | Correct non-rejection event for A at $p_1$ | 1 |
| beta_a_value | Correct calculation of its probability | 1 |
| beta_b_event | Correct non-rejection event for B at $p_1$ | 1 |
| beta_b_value | Correct calculation of its probability | 1 |
| type_i_context | Explain a false alarm when $H_0$ is actually satisfied | 1 |
| type_ii_context | Explain a missed deviation when the true value is $p_1=0.12$ | 1 |
| power_a | Determine A's power at $p_1$ as a rejection probability or the correct complement | 1 |
| power_b | Determine B's power at $p_1$ in the same way | 1 |
| comparison | Explicitly compare both rules through the false-alarm/missed-deviation/power trade-off | 1 |
| observed_a | Apply A correctly to $X=9$ | 1 |
| observed_b | Apply B correctly to $X=9$ | 1 |
| inference_limit | Explain the decision's uncertainty, without presenting it as proof or a posterior hypothesis probability | 1 |
| routine_choice | Make a defensible choice for routine checking | 1 |
| routine_reason | Check both routine requirements and evaluate the other rule using the condition it meets or violates | 1 |
| targeted_choice | Make a defensible choice for targeted fault investigation | 1 |
| targeted_reason | Check both fault-investigation requirements and evaluate the other rule using the condition it meets or violates | 1 |

**One ordinary overall cap:** The total score is capped at **14 points** if a complete core achievement is missing: only one rule is substantively investigated; usable treatment of the type I side of both rules is entirely absent; usable treatment of the type II side under the named alternative is entirely absent; a statement about test power under that alternative is entirely absent (a correctly interpreted complement statement also counts); or the submission as a whole contains no defensible comparison of both rules or no reasoned contextual decision. Comparison within the contextual reasons counts equally. This is the sole overall cap; there are no separate component passes or additional result states.

**Fair follow-through:** A local arithmetic, rounding, indexing, or labelling error alone does not trigger the cap. Penalize the same originating error only once at the row where it arises. Subsequent correct calculations for the learner's stated event and consistent comparisons/decisions using the learner's values earn the corresponding method points; independent new errors remain assessable. For example, incorrect evaluation of a correctly specified $\beta_A$ expression loses its numerical point; correctly continued complements and clearly derived consequences are not penalized again for the same value. Correctly justified exact or sufficiently accurate alternative calculations are equivalent. Conversely, an incorrect value does not substitute for an entirely missing core achievement.

