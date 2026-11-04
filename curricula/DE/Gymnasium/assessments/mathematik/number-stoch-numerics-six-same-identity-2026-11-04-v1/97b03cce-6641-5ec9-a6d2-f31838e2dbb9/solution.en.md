# Worked solution: RSA

**1. Key construction**

We have $n=11\cdot17=187$ and $\varphi(n)=10\cdot16=160$.
Since $\gcd(7,160)=1$, the number $7$ has a multiplicative inverse modulo
$160$. From $160=22\cdot7+6$ and $7=6+1$ we obtain
$1=23\cdot7-160$. Thus $d=23$, checked by $7\cdot23=161=1+160$.
This value is unique in $1,\ldots,159$.

**2. Roles**

Using the convention $(\text{modulus},\text{exponent})$, the public key is
$(187,7)$ and the private key is $(187,23)$. The sender encrypts with the
public data to obtain $c=m^7\bmod187$; the recipient uses the private
exponent to decrypt with $c^{23}\bmod187$. Asymmetric means that encryption
and decryption use different, related keys. The sender does not need the
private exponent and need not be given the factors used to construct the
key. This explains the mathematical key roles; it does not assert the
security of any particular implementation.

**3. Calculations**

For $m=20$, repeated squaring gives

$$
20^2\equiv26,\qquad20^4\equiv115\pmod{187}.
$$

Since $7=4+2+1$,

$$
20^7\equiv115\cdot26\cdot20\equiv147\pmod{187}.
$$

For $m=11$,

$$
11^2\equiv121,\qquad11^4\equiv55,\qquad
11^7\equiv55\cdot121\cdot11\equiv88\pmod{187}.
$$

The encrypted messages are therefore $147$ and $88$.

For decryption, $23=16+4+2+1$. Repeated squaring yields:

| $c$ | $c^2\bmod187$ | $c^4\bmod187$ | $c^8\bmod187$ | $c^{16}\bmod187$ |
|---:|---:|---:|---:|---:|
| 147 | 104 | 157 | 152 | 103 |
| 88 | 77 | 132 | 33 | 154 |

Hence

$$
147^{23}\equiv103\cdot157\cdot104\cdot147\equiv20\pmod{187},
$$


$$
88^{23}\equiv154\cdot132\cdot77\cdot88\equiv11\pmod{187}.
$$

Both original messages are recovered. In particular, $\gcd(11,187)=11$;
being coprime to $n$ is not required for recovery here. A calculation using
the two prime moduli followed by CRT reconstruction is equally acceptable.

**4. Justification for all messages**

From $c\equiv m^7\pmod{187}$ we obtain
$c^{23}\equiv m^{161}\pmod{187}$. First work modulo $11$. If $11\mid m$,
then both $m^{161}$ and $m$ are $0$ modulo $11$. Otherwise Fermat's little
theorem gives $m^{10}\equiv1\pmod{11}$, and so

$$
m^{161}=m(m^{10})^{16}\equiv m\pmod{11}.
$$

Similarly modulo $17$, if $17\mid m$, both residues are $0$; otherwise
$m^{16}\equiv1\pmod{17}$ gives

$$
m^{161}=m(m^{16})^{10}\equiv m\pmod{17}.
$$

The decrypted number and $m$ thus have the same residues modulo both
coprime primes. The Chinese remainder theorem makes the residue class
modulo $187$ unique. Since $m$ and the chosen decrypted representative are
both between $0$ and $186$, they are equal. This includes $m=0$.
For $m=11$, use the zero-residue case modulo $11$ and Fermat's theorem
modulo $17$.

The proposed substitution for all messages is false. Euler's assertion
$m^{160}\equiv1\pmod{187}$ requires $\gcd(m,187)=1$. Already for $m=11$,
$m^{160}$ is $0$ modulo $11$ and hence cannot be $1$ modulo $187$.
Working separately with the prime moduli avoids this invalid use or an
invalid division by $m$.
