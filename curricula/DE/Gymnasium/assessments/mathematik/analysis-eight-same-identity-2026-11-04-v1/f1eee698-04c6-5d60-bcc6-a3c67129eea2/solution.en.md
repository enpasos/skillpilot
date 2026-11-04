# Worked solution: formation rules

**1. One suitable choice for A**

The successive differences are $4,6,8,10$.
A simple suitable continuation increases each difference by $2$.
This gives

$$
a_n=n^2+n+1\quad(n\geq1).
$$

Checking $n=1,2,3,4,5$ gives exactly $3,7,13,21,31$.
For this rule, $a_6=36+6+1=43$.
Equivalently, use $a_1=3$ and $a_{n+1}=a_n+2n+2$ for $n\geq1$,
since $(n+1)^2+(n+1)+1-(n^2+n+1)=2n+2$.

**2. One suitable choice for B**

Every ratio of successive terms is $-\frac12$.
A suitable rule is therefore

$$
b_n=2\left(-\frac12\right)^{n-1}\quad(n\geq1),
$$

or recursively $b_1=2$ and $b_{n+1}=-\frac12b_n$.
Substituting the first five indices gives $2,-1,\frac12,-\frac14,\frac18$.
The sixth term for this choice is $b_6=-\frac1{16}$.

**3. Finitely many data do not ensure uniqueness**

The five values allow suitable rules but, without further conditions,
do not determine a unique infinite continuation.
For example, alongside the chosen A rule, consider

$$
q_n=n^2+n+1+(n-1)(n-2)(n-3)(n-4)(n-5).
$$

It is defined for every integer $n\geq1$. For $n=1,\ldots,5$, the
added product is zero, so the five data agree. At $n=6$ it equals
$120$, giving $q_6=163$ instead of $43$.
Other well-defined rules and their consistent sixth terms are equivalent
answers when the data and the justified choice are actually checked.
The stated sixth terms are not uniquely proved by the data alone.
