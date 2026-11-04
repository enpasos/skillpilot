# Worked solution: visit counts and bar lengths

**1. Numerical comparison**

Week A has 100 visits and week B has 120. The increase is $120-100=20$
visits, relative to A $20/100=0.20=20\,\%$.
B has $120/100=1.2$ times as many visits, not three times as many.
Tripling 100 would give 300 visits.

**2. Cause and correction**

The visible bars start at 90 rather than zero. Their lengths show only
the additions $100-90=10$ and $120-90=30$. These additions are in ratio
$1:3$, but the whole counts are not. The displayed numbers can be correct
while the bar comparison is visually misleading. One possible correction is:
“20 more visits: week B had 120 instead of 100 visits, a 20% increase.”
The explanation identifies the truncated scale and the correct reference
whole of 100. Since a person can visit repeatedly, visits do not count
distinct people; fewer than 120 people may account for 120 visits.
Equivalent clear formulations are valid.

**3. Clearer alternative**

For example, use a zero-based bar chart with a uniform scale, clear labels
and exact values:

```text
Visits (each # represents 10)
           0    50   100  150
           |----|----|----|
Week A     |########## 100
Week B     |############ 120
```

The bar ratio now represents $100:120=5:6$; B is only one fifth longer
than A. Both weeks, the unit “visits” and the zero baseline are visible.
Alternatively, a clear table suffices:

| school week | visits |
|---|---:|
| A | 100 |
| B | 120 |

Add, for example: “An increase of 20 visits or 20%, not a tripling;
these are visits, not distinct people.” The table gives exact values
without creating artificial length ratios. Credit other concrete, clearer
representations with a suitable explanation; no particular chart type is
prescribed.
