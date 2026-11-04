# Worked solution: searching for a rate in a spreadsheet

**1. Cell formulas**

Row 1 contains headings; column A contains trial rates formatted as percentages.
One possible first data row is
`B2=2000*(1+A2)`, `C2=B2*(1+A2)`, `D2=C2*(1+A2)`, `E2=D2-2320`.
Copy the formulas down for further trial rates. Each year's interest is based
on the entire preceding balance, including interest already credited.
Other suitable layouts are equivalent.

**2. Search and bracket**

| rate | year 1 € | year 2 € | year 3 € | difference € |
|---:|---:|---:|---:|---:|
| 4.00% | 2080.00 | 2163.20 | 2249.73 | -70.27 |
| 5.00% | 2100.00 | 2205.00 | 2315.25 | -4.75 |
| 6.00% | 2120.00 | 2247.20 | 2382.03 | 62.03 |
| 5.06% | 2101.20 | 2207.52 | 2319.22 | -0.78 |
| 5.07% | 2101.40 | 2207.94 | 2319.88 | -0.12 |
| 5.08% | 2101.60 | 2208.36 | 2320.55 | 0.55 |

The target lies between the final balances at 5.07% and 5.08%. In this
model, a larger positive rate produces a larger balance in each year.

**3. Estimate**

For example, 5.07% per year is suitable: its internally computed difference
is about $-0.1164$ euros, less than €1 in magnitude. Under the explicitly
specified one-euro tolerance, 5.08% is also suitable. 5.06% also meets that
final-balance tolerance, although the finer search bracket from part 2 must
still be documented. This is an annual rate, not the total percentage over
three years. It plausibly lies between 5% and 6%. A small final-value tolerance
does not establish the real contract rate exactly to the stated digits.

**4. Model check**

$2000(1+3p)$ applies interest to the initial balance three times only.
The table also earns interest on earlier interest. At 5%, for example, the
simple-interest balance is €2300, while annual compounding gives €2315.25.
Annual fees, intermediate withdrawals or a changing rate would alter the
model. The difference then cannot automatically be attributed to a different
fixed rate. One suitable concrete change with an explanation suffices.
