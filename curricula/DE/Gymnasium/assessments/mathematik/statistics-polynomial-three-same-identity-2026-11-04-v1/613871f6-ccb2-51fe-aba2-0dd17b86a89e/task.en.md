# Develop an economical and reliable inspection rule

A company inspects a large shipment using independent, randomly selected
items. Every item has the same probability $p$ of being defective.
This simplified decision model allows **only** $H_0:p=0.10$ and
$H_1:p=0.30$. “Flag” means reject $H_0$; “do not flag” does not establish
that $H_0$ is certainly true.

The rule must satisfy $P_{0.10}(\text{flag})\leq0.05$ and
$P_{0.30}(\text{flag})\geq0.90$. Among admissible rules, minimise the
**expected number of inspected items when $p=0.10$**. Compare only the
designs below. A calculator for binomial probabilities is allowed; state
the events or sums evaluated. A total of **20 points** is available.

**1. Fixed samples (5 points)**

For $n=20$ and $n=40$, flag when the number of defective items
$X_n\geq k_n$. For each sample size find the smallest integer threshold
meeting the first error bound. Also test the immediately smaller
threshold to establish the boundary. Then check the required detection
probability. Explain why a larger threshold cannot improve detection.

**2. Develop and check two-stage rules (8 points)**

First inspect $20$ items, with defective count $X$. Choose $r\in\{5,6\}$
to complete this rule:

- If $X\geq r$: flag immediately.
- If $X\leq2$: do not flag; stop immediately.
- If $3\leq X\leq r-1$: inspect another $20$ independent items, with
  defective count $Y$. Flag exactly when $X+Y\geq8$.

For arbitrary $p$, derive the probability of flagging under this **whole**
rule. Calculate it for both values of $r$, at both $p=0.10$ and $p=0.30$.
Decide which designs meet both bounds. Explain why the two-stage error
probability is not simply $P_p(X+Y\geq8)$.

**3. Effort and final decision (5 points)**

For the admissible two-stage rule, calculate the expected number $N$ of
inspected items when $p=0.10$. Compare it with the admissible fixed-sample
rules. State a complete, unambiguous procedure for the company, justifying
your choice by both error bounds and the effort objective. Explicitly
include the cases $X=2$, $X=5$ and $X=6$.

**4. Limits of the conclusion (2 points)**

Evaluate: “Our calculation proves the required error bounds for every
possible defect rate in a real shipment.” State two assumptions or
restrictions important to your decision.
