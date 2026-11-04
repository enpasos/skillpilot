# Reference solution: decision rule

For $Z\sim\operatorname{Bin}(n,p)$ write

$$
T_{n,p}(k)=P_p(Z\geq k)=\sum_{j=k}^{n}\binom njp^j(1-p)^{n-j}.
$$

Increasing the threshold shrinks the rejection event, reducing its
probability under either hypothesis. Thus the smallest admissible
threshold has the greatest detection probability among the allowed
fixed-threshold rules.

| $n$ | $k_n$ | $T_{n,0.10}(k_n-1)$ | $T_{n,0.10}(k_n)$ | $T_{n,0.30}(k_n)$ |
|---:|---:|---:|---:|---:|
| 20 | 5 | 0.132953 | 0.043174 | 0.762492 |
| 40 | 8 | 0.099516 | 0.041902 | 0.944717 |

The fixed sample of 20 is inadmissible: even its most powerful threshold
meeting the first bound detects only about $76.25\%$. The fixed sample
of 40, with threshold 8, meets both bounds.

**Two stages.** $X,Y$ are independent and both distributed as
$\operatorname{Bin}(20,p)$. The flagging events $\{X\geq r\}$ and
$\{X=j,Y\geq8-j\}$, for $j=3,\ldots,r-1$, are pairwise disjoint. Hence

$$
B_r(p)=T_{20,p}(r)+\sum_{j=3}^{r-1}\binom{20}{j}p^j(1-p)^{20-j}
T_{20,p}(8-j).
$$

An equivalent complete case table or direct sum over pairs $(X,Y)$ is
equally valid.

| $r$ | $B_r(0.10)$ | $B_r(0.30)$ | both bounds? |
|---:|---:|---:|---|
| 5 | 0.063319 | 0.933544 | no: first bound exceeded |
| 6 | 0.041711 | 0.927197 | yes |

Even though the initial test with threshold 5 alone has error below
$5\%$, continuation adds further flagging probability. The entire rule
must be evaluated. The event $X+Y\geq8$ alone is different: for example,
with $r=6$, $X=6,Y=0$ flags immediately despite the hypothetical total
being below 8; $X=2,Y=10$ stops without flagging. An independent potential
$Y$ may be used for probability calculations but is not actually observed
after an early stop.

**Effort.** For $r=6$, $N$ is either 20 or 40, with

$$
E_p(N)=20+20P_p(3\leq X\leq5).
$$

At $p=0.10$ the continuation probability is $0.311820$, giving
$E_{0.10}(N)\approx26.2364$, below the constant 40 inspections of the
admissible fixed rule. Among the specified designs choose the two-stage
rule with $r=6$:

1. Inspect 20 items and count $X$.
2. Stop without flagging if $X\leq2$; flag immediately if $X\geq6$.
3. If $X=3,4,5$, inspect 20 further items and count $Y$; flag exactly when
   $X+Y\geq8$, otherwise do not flag.

Thus $X=2$ stops without flagging, $X=5$ continues (then flag if $Y\geq3$),
and $X=6$ flags immediately. The rule has about $4.17\%$ false flagging
and $92.72\%$ detection, with less expected effort in the specified case.
A larger fixed-40 threshold cannot reduce its sample count of 40.
No global optimality over every conceivable sampling plan is asserted.

**Limits.** The claim is false. The numerical bounds were checked at the
two specified values of $p$, not every real defect rate. The binomial
model assumes independent trials with constant $p$; dependence, a small
finite population sampled without replacement, or nonrandom selection
may invalidate it. The effort objective is explicitly evaluated at
$p=0.10$, rather than automatically under every other criterion.
