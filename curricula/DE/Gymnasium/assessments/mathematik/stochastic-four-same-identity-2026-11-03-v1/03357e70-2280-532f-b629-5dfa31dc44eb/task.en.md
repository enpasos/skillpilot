# Two test rules for the same quality check

A manufacturer checks connectors. Let $p$ be the unknown defect rate during a stable production phase. The model treats a sample as $100$ independent checks with the same defect probability $p$. Let $X$ count the defective connectors, so $X\sim B(100;p)$.

The hypotheses are $H_0:p\leq0.05$ versus $H_1:p>0.05$. Rejecting $H_0$ triggers an additional investigation of the production phase. Compare these two given rules:

| Rule | Reject $H_0$ | Do not reject $H_0$ |
|---|---|---|
| A | $X\geq10$ | $X\leq9$ |
| B | $X\geq8$ | $X\leq7$ |

Calculate type I errors at the null boundary $p_0=0.05$. In this task, type II errors and test power refer to the fixed alternative $p_1=0.12$.

1. For **both** rules, calculate the type I error probability, the type II error probability at $p_1$, and the test power at $p_1$. State each event and the parameter used. Explain both error types in context and compare the rules regarding false alarms, missed deviations, and test power.
2. A sample contains $9$ defective connectors. What decision does each rule produce? Also explain which certain conclusion about the true defect rate does **not** follow.
3. The manufacturer has two different operating objectives. Choose A or B for each objective, or explain why neither rule is suitable. Check the stated requirements for your recommendation and use your calculated values to explain why the other rule is suitable or unsuitable.

   - **Routine checking:** a false-alarm probability at the null boundary of at most $5\%$ and test power at $p_1$ of at least $75\%$.
   - **Temporary targeted fault investigation:** a false-alarm probability at the null boundary of at most $15\%$ and test power at $p_1$ of at least $90\%$.

You may use a calculator, a binomial table, or suitable calculation software. Use the stated binomial model and report probabilities to at least four decimal places or percentages to at least two decimal places. Mathematically equivalent methods are accepted; you are not asked to design a new test rule.

