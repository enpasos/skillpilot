# Worked solution: complete payment periods

**1. Cell formulas**

For balance $G_k$ after year-end $k$,
$G_0=1000$ and $G_k=1.02G_{k-1}+200$.
If row 2 has year 0 in A and 1000 in E, the next row can be
`A3=A2+1`, `B3=E2`, `C3=B3*2%`, `D3=200`,
`E3=B3+C3+D3`. Copy the formulas down.
Interest is credited on the existing balance first, then the deposit is made.
The €200 earns no interest for the year just completed.

**2. Table at 2%**

| year | opening € | interest € | deposit € | closing € |
|---:|---:|---:|---:|---:|
| 0 | – | – | – | 1000.00 |
| 1 | 1000.00 | 20.00 | 200.00 | 1220.00 |
| 2 | 1220.00 | 24.40 | 200.00 | 1444.40 |
| 3 | 1444.40 | 28.89 | 200.00 | 1673.29 |
| 4 | 1673.29 | 33.47 | 200.00 | 1906.75 |
| 5 | 1906.75 | 38.14 | 200.00 | 2144.89 |
| 6 | 2144.89 | 42.90 | 200.00 | 2387.79 |
| 7 | 2387.79 | 47.76 | 200.00 | 2635.54 |

Displayed values are rounded to cents; subsequent cells use the unrounded
internal values. Consequently, adding displayed rounded columns can sometimes
differ by one cent.

**3. Context check**

The target is first reached after seven years, by which time seven deposits
have been made. After six years the balance is about €112.21 short;
after seven years it exceeds the target by about €135.54. The balance
increases every period, so all earlier year-ends also fail. In the agreed
model, the balance changes only at year-ends. An interpolated fraction
between six and seven years is therefore not an actual target-reaching
time in this model.

**4. Without interest**

The second table uses the same formulas with 0% interest.
Its closing balances for years 0 through 8 are
$1000,1200,1400,1600,1800,2000,2200,2400,2600$ euros.
After seven years there is only €2400; after eight years there is €2600.
The new duration is eight years with eight deposits, one year longer.
Without interest there is no additional balance growth; deposits alone
exceed €2500 only in the next complete period.
