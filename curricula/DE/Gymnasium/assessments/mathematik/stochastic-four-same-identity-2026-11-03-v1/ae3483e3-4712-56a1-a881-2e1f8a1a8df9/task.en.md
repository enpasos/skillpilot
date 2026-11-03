A quality-control test should detect an increased proportion of defective components. For each independent random sample, let $X$ be the number of defective items, with $X\sim B(n,p)$. Test $H_0:p\le0.10$ against $H_1:p>0.10$. Each candidate rejects $H_0$ when $X\ge k$:

| Candidate | Sample size $n$ | Rejection threshold $k$ |
|---|---:|---:|
| A | 80 | 14 |
| B | 160 | 24 |
| C | 160 | 22 |

The figure shows each candidate's **power function** $G(p)=P_p(X\ge k)$. The right-hand plot enlarges the same small region; it does not show additional tests.

![Power functions A, B and C with an enlarged detail](/assets/assessment-materials/mathematik/ae3483e3-4712-56a1-a881-2e1f8a1a8df9/power-function-choices.en.c5d8f8660df55e098e9515948d89e892f3b786731e814ec8cf311cd81f33dbb0.png)

The control must satisfy both requirements:

- At $p=0.10$, the probability of rejecting $H_0$ must be at most $0.05$.
- At $p=0.20$, the probability of not rejecting $H_0$ must be at most $0.10$.

**1 · Meaning of the curves (2 points)**

Explain the event described by a height $G(p)$ and the meaning of the height at $p=0.10$ in this control procedure.

**2 · Evaluate the graphs (6 points)**

For A, B and C, read approximate values of $G(0.10)$ and $G(0.20)$. Two decimal places or sufficiently precise graph-supported bounds suffice. Numerical checking is allowed; associate your values or bounds with the actual curves.

**3 · Translate the requirements and decide (6 points)**

Express both requirements in terms of $G$. Select a suitable candidate and use the graphs or their associated values to justify why it satisfies both requirements and why the others fail. State the selected decision rule using $n$ and $k$. Select from the given candidates; do not design a new test rule.

