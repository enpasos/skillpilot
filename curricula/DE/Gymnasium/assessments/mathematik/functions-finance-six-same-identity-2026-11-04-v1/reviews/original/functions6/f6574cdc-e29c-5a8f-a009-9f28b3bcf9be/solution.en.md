# Worked solution: annual savings contribution

**1. Spreadsheet model**

For fixed annual contribution $r$, let $G_k$ be the balance after deposit
$k$. Then $G_0=0$ and $G_k=1.03G_{k-1}+r$.
One possible trial table has contributions in A and end-of-year balances
for years 1 to 4 in B through E. Its first data row is
`B2=A2`, `C2=B2*1.03+A2`, `D2=C2*1.03+A2`, `E2=D2*1.03+A2`.
Copy the formulas down for further trial contributions. A year-end deposit
earns no interest that year, so the first year's balance is just $r$ euros.

**2. Trial contributions**

| annual contribution € | year 1 € | year 2 € | year 3 € | year 4 € |
|---:|---:|---:|---:|---:|
| 450 | 450.00 | 913.50 | 1390.91 | 1882.63 |
| 475 | 475.00 | 964.25 | 1468.18 | 1987.22 |
| 500 | 500.00 | 1015.00 | 1545.45 | 2091.81 |
| 478 | 478.00 | 970.34 | 1477.45 | 1999.77 |
| 479 | 479.00 | 972.37 | 1480.54 | 2003.96 |

**3. Check the choice**

The smallest suitable whole-euro contribution is €479 per year. Its four
balances are in the final row. €478 misses the target by about €0.23,
whereas €479 exceeds it by about €3.96. A larger fixed contribution gives
a larger balance in every period; hence all still smaller whole-euro
contributions also fail. Four deposits of €479 total €1916; the difference
between that and the final balance is interest.

**4. Deposit timing**

The first contribution reaches the account only at the end of year 1.
Using $1.03r$ for the first year's balance incorrectly credits it with a full
year's interest. Beginning-of-year deposits would give every contribution
an extra year of interest. The same contribution would produce a larger
final balance, so a smaller required contribution is plausible. That is a
different payment schedule and needs a changed table. An exact new
contribution for that schedule is not required.
