# Reconstruct a transition path, join it smoothly and justify its inflection point

DRAFT — not integrated. Own SkillPilot task; knowledge content CC-BY-4.0.

## Task

A visitor path is to connect two existing sections. The horizontal coordinate $t$ and all heights are measured in metres. Near the first join, the left section follows
$$\ell(t)=5-\frac{t}{10}\quad(t\leq0).$$
Near the second join, the right section is horizontal:
$$r(t)=\frac72\quad(t\geq20).$$
Between them, a suitable polynomial $q$ of degree at most four is to describe the height for $0\leq t\leq20$. Neither join may have a jump in height or a kink. The transition must also have an inflection point at $t=10$. Other inflection points are not excluded.

1. Translate the two joins without jumps or kinks into four equations involving $q$ and $q'$. Explain the meaning of the values and slopes. (2 points)
2. State the initially necessary equation from the proposed inflection point. Explain why this equation alone does not prove an actual change of concavity. (2 points)
3. Use $q(t)=at^4+bt^3+ct^2+dt+e$. Set up a linear system for its coefficients from your five conditions and solve it with a clear method. Check the resulting coefficients against all five conditions. (4 points)
4. Explain why the piecewise path formed by $\ell$, $q$ and $r$ actually has neither a jump nor a kink at either join. A list of coefficients alone is insufficient. (2 points)
5. Check the change of concavity at $t=10$ in your model and explain its meaning for the height profile. Identify any further inflection point in the transition interval and decide whether it contradicts the requirements. (2 points)
6. Check whether the transition stays between the prescribed endpoint heights. State one limitation of this geometric model; the calculations alone do not establish engineering suitability. (1 point)

Tools may be used to check your work. A function returned by a tool does not replace the independently formulated linear system and the required explanations.

The maximum overall score is 13 points; 11 points are required to pass. The overall score is capped at 10 points if any of the following essential modelling actions is missing or conceptually incorrect:

- Reconstruction: formulate the full coefficient system from all five requirements, carry out a recognizably valid solution method, and actually check the resulting polynomial against the requirements.
- Join modelling: formulate and interpret the value and slope equalities at both joins and perform a mathematically valid check of both joins.
- Inflection modelling: formulate the inflection condition from context, distinguish necessity from sufficiency, apply a valid test for an actual inflection point, and interpret the change in the height profile.

Evidence is assessed across the complete solution, wherever it appears. Equivalent systematic solution and elimination methods are accepted. Evidence in parts 3, 4 and 5 may support each other; the same calculation need not be written twice. A mathematically sufficient explanation in part 2 is enough; a counterexample is one possible explanation, not a requirement.

An identifiable isolated computational slip does not by itself mean that a modelling action is absent. Mathematically valid follow-through on the learner's own polynomial earns credit; the same source error is not deducted repeatedly. A correctly performed check may explicitly establish that the learner's own polynomial fails an original requirement. An unchecked or mathematically incorrect assertion that all requirements hold is not a check. Multiple independent errors do not create an automatic entitlement to pass. An error corrected before submission loses no point. The further inflection point and the height/model-limit check earn ordinary individual points; they are not additional essential actions for the cap. The resulting overall score determines one binary result.

## Solution

At the first join, $q(0)=\ell(0)=5$ and $q'(0)=\ell'(0)=-1/10$. At the second join, $q(20)=r(20)=7/2$ and $q'(20)=r'(20)=0$. Equal values prevent a height jump; equal first derivatives prevent a kink.

The proposed inflection point initially gives $q''(10)=0$. This necessary condition is insufficient by itself: $t^4$ has a zero of its second derivative at $0$ without a change of sign there.

The polynomial gives $e=5$ and $d=-1/10$. The other conditions become
$$\begin{aligned}
160000a+8000b+400c&=\frac12,\\
32000a+1200b+40c&=\frac1{10},\\
1200a+60b+2c&=0.
\end{aligned}$$
The third equation gives $c=-600a-30b$. Substitution into the second gives $8000a=1/10$, hence $a=1/80000$. The first becomes $-80000a-4000b=1/2$, giving $b=-3/8000$ and then $c=3/800$. Thus
$$q(t)=\frac{t^4}{80000}-\frac{3t^3}{8000}+\frac{3t^2}{800}-\frac t{10}+5.$$
Checking gives $q(0)=5$, $q'(0)=-1/10$, $q(20)=7/2$, $q'(20)=0$ and $q''(10)=0$. These elimination steps determine the coefficients uniquely.

At $t=0$, the one-sided heights and slopes of $\ell$ and $q$ agree. The same holds for $q$ and $r$ at $t=20$. The piecewise path is continuous and has matching first derivatives at both joins. Matching second derivatives was not required and does not hold at these joins.

The second derivative is
$$q''(t)=\frac{3(t-5)(t-10)}{20000}.$$
It is negative immediately to the left of $10$, between $5$ and $10$, and positive immediately to the right. Thus there is an actual inflection point. Alternatively, $q^{(3)}(10)=3/4000\neq0$ establishes the change. The descending path's slope decreases immediately before $t=10$ and increases afterwards. There is another inflection point at $t=5$, where the sign changes from positive to negative. It does not contradict the requirements, which did not require a unique inflection point.

For a plausibility check,
$$q'(t)=\frac{(t-20)(2t^2-5t+200)}{40000}.$$
The quadratic factor is always positive because $2t^2-5t+200=2(t-5/4)^2+1575/8>0$. Hence $q'<0$ for $0\leq t<20$ and $q'(20)=0$. The transition descends from $5$ to $7/2$ and stays between them. The model describes geometry only. It does not establish material strength, admissible slopes or continuous curvature at the joins.

13 points in total; pass from 11 points under the ordinary grading rules above, including the overall cap of 10 points if an essential modelling action is missing or conceptually incorrect. The method shown is one example; equivalent methods are accepted. Checks in parts 3, 4 and 5 may support each other. An unexplained list of correct coefficients does not replace translating a required condition.

## Scoring

- 2 points: Independently formulate and explain the four value/slope conditions; 1 point per join.
- 2 points: Formulate q''(10)=0 from the design requirement (1); give a mathematically sufficient explanation of necessity versus sufficiency, for example with an optional counterexample (1).
- 4 points: Set up the coefficient model and full linear system (1; equivalent formulations accepted); begin a systematic valid solution (1; any equivalent elimination/solution method accepted); determine the coefficients with a clear method (1; any equivalent solution method accepted); actually check all five conditions (1; equivalent checks in 4/5 also count, without duplicate writing). Apply the follow-through rule and overall cap in the grading instructions.
- 2 points: Check value and first derivative at both joins and explain continuity and absence of a kink; 1 point per join.
- 2 points: Prove and interpret the sign change at t=10 (1); identify the further inflection at t=5 and correctly assess the absence of a uniqueness requirement (1).
- 1 point: Check that the height stays between the endpoint heights and state at least one geometric-model limitation; both are required for the point.
