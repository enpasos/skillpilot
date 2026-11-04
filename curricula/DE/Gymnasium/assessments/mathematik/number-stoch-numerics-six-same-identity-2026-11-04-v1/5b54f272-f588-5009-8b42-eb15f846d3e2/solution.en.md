# Worked solution: relative binomial dispersion

**1. Comparison**

For $n=100$, $\mu=20$, $\sigma=\sqrt{16}=4$, and $v=4/20=0.20$.
For $n=400$, $\mu=80$, $\sigma=\sqrt{64}=8$, and $v=8/80=0.10$.
The absolute standard deviation doubles while the expected value quadruples.
Thus dispersion measured relative to the expected value halves. The number
of successes varies more in absolute terms but less in relative terms.

**2. General justification**

Since $np>0$, division by $np$ is valid and gives
$$v=\frac{\sqrt{np(1-p)}}{np}
=\sqrt{\frac{np(1-p)}{n^2p^2}}
=\sqrt{\frac{1-p}{np}}
=\sqrt{\frac{1-p}{p}}\,\frac1{\sqrt n}.$$
When $0<p<1$ is fixed, the first factor is positive and constant.
$1/\sqrt n$ strictly decreases as $n$ increases, so $v$ does too.
For the same $p$, $v(4n)=v(n)/2$.

**3. Minimum number of trials**

$$\sqrt{\frac{0.8}{0.2n}}\leq0.05
\quad\Longleftrightarrow\quad\frac4n\leq0.0025
\quad\Longleftrightarrow\quad n\geq1600.$$
The smallest integer number of trials is $1600$.
Checking gives $v(1600)=0.05$ and
$v(1599)=2/\sqrt{1599}\approx0.050016>0.05$.
Together with strict decrease, this establishes minimality.

**4. Changing p**

For $B(100;0.50)$, $v=\sqrt{0.5/(100\cdot0.5)}=0.10$.
For $B(400;0.01)$,
$v=\sqrt{0.99/(400\cdot0.01)}\approx0.4975$.
Relative dispersion is larger despite larger $n$. The unrestricted claim
is false; the proved decrease requires a fixed $p$ in the specified range
$0<p<1$. No additional boundary cases outside that range are required.
