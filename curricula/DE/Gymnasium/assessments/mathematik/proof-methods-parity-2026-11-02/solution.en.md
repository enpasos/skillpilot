# One complete worked solution

This is one possible approach. The alternatives listed are not exhaustive; one complete valid justification for each required part is sufficient.

## A. Contraposition

For an arbitrary integer $n$, let $A$ mean “$n^2$ is even” and $B$ mean “$n$ is even”. The contrapositive is $\neg B\Rightarrow\neg A$, which here means:

> If $n$ is odd, then $n^2$ is odd.

For integers, “not even” is equivalent to “odd”. Therefore let $n=2k+1$ for some $k\in\mathbb Z$. Then

$$n^2=(2k+1)^2=4k^2+4k+1=2(2k^2+2k)+1.$$

Since $2k^2+2k$ is an integer, $n^2$ is odd. This proves the contrapositive for every integer $n$. Equivalently, one may use $n\equiv1\pmod2$ and hence $n^2\equiv1\pmod2$ for odd $n$, or another representation of odd integers.

### Why does this establish the original statement?

An implication $A\Rightarrow B$ is false precisely when $A$ is true and $B$ is false. Its contrapositive $\neg B\Rightarrow\neg A$ is false precisely when $\neg B$ is true and $\neg A$ is false, again precisely when $A$ is true and $B$ is false. Thus both implications have the same truth value under every truth assignment and are logically equivalent. Since the contrapositive has been proved, the original statement follows.

For example, an equivalent justification is the complete truth table:

| $A$ | $B$ | $A\Rightarrow B$ | $\neg B\Rightarrow\neg A$ |
|---|---|---|---|
| true | true | true | true |
| true | false | false | false |
| false | true | true | true |
| false | false | true | true |

The final two columns agree in all four cases. An explained chain of logical equivalences also suffices:

$$(A\Rightarrow B)\ \equiv\ (\neg A\lor B)\ \equiv\ (B\lor\neg A)\ \equiv\ (\neg B\Rightarrow\neg A).$$

These three justifications do not all have to be supplied. The converse $B\Rightarrow A$ is not the contrapositive. Although the converse happens to be true in this integer example, proving only the converse does not carry out the requested contrapositive proof.

## B. Exhaustive proof by cases

Every integer is even or odd. These two cases therefore cover all of $\mathbb Z$.

**Case 1: $n$ is even.** Then $n=2k$ for some $k\in\mathbb Z$. Therefore

$$n(n+1)=2k(2k+1)=2\bigl(k(2k+1)\bigr).$$

The expression in brackets is an integer, so the product is even.

**Case 2: $n$ is odd.** Then $n=2k+1$ for some $k\in\mathbb Z$. Therefore

$$n(n+1)=(2k+1)(2k+2)=2\bigl((2k+1)(k+1)\bigr).$$

The expression in brackets is again an integer, so the product is even.

The product is even in every case of an exhaustive distinction. Hence the statement holds for all integers, including zero and negative integers. The general proof makes separate numerical checks of those integers unnecessary.

An equivalent concise argument is: if $n$ is even, it is itself the even factor; if $n$ is odd, $n+1$ is even. An even integer factor makes the product even. Together with the exhaustiveness of these cases, this suffices without expanding the products. Other exhaustive coverings, such as four residue classes modulo 4, are also accepted if each case is treated generally. The cases must cover every possibility; pairwise disjointness is not an additional requirement of this learning goal.

## Scoring and fair treatment of errors

Each of the ten accompanying rubric criteria earns 0, 1 or 2 points. The maximum is 20 points; the pass threshold is 12. First add the points actually earned. Only if at least one of the following essential actions is **entirely absent or conceptually mistaken** is that same total then capped at 11 points:

- a recognisable general proof of the correct contrapositive in A;
- a substantive justification of logical equivalence in A; merely citing the method's name is insufficient;
- an exhaustive case covering with general arguments for the cases in B.

The correct method label is not decisive: assess the reasoning itself. A differently labelled solution earns the same credit if it actually proves the correct contrapositive and its equivalence, or supplies the exhaustive case proof. A contradiction argument within a recognisable proof of the contrapositive is also accepted. A different proof alone earns its mathematically justified criterion points but does not replace the requested methodological action.

Concise natural language, omission of a closing formula when the general conclusion is already clear, or departure from the sample solution's format does not justify deducting points. A substantively correct complete method does not require full points in every criterion. An isolated calculation, transcription or writing error is assessed at the affected criterion and does not automatically trigger the cap. For example, mistakenly expanding $(2k+1)^2$ as $4k^2+2k+1$ gives a wrong coefficient while leaving the correctly established general parity approach recognisable. Traceable follow-through consistent with the error continues to earn credit; do not deduct repeatedly for the same error. An unresolved systematic fallacy, numerical examples alone, an omitted case or a deliberately restricted domain is not treated as an isolated arithmetic slip.

The cap is part of the ordinary rubric assessment of this one total score. It creates no second part-pass, additional qualification or new learning state. After grading, the Coach returns criterion points, any cap with its specific reason, and focused mathematical feedback.
