# A mathematical RSA model

A recipient uses the distinct primes $p=11$ and $q=17$ and the public
exponent $e=7$. Messages here are the integers $m$ with $0\leq m<n$,
where $n=pq$. Show your calculations and justify your statements.
A total of **20 points** is available.

**1. Construct the keys (4 points)**

Calculate $n$ and $\varphi(n)=(p-1)(q-1)$. Check the condition on $e$ and
find a positive private exponent $d<\varphi(n)$ satisfying
$ed\equiv1\pmod{\varphi(n)}$. Check your result.

**2. Explain the asymmetric principle (3 points)**

State the public and private keys using a clearly explained notation.
Describe which data a sender uses to encrypt and which data the recipient
uses to decrypt. Explain what “asymmetric” means here.

**3. Encrypt and recover messages (6 points)**

Encrypt $m=20$ and $m=11$ using $c\equiv m^e\pmod n$, choosing
$0\leq c<n$. Show traceable modular exponentiation.
Decrypt both results using $m'\equiv c^d\pmod n$ and check which original
message is recovered. Suitable repeated squaring and multiplication, or an
equivalent modular calculation, is sufficient; unexplained final values
are insufficient.

**4. Make correctness plausible (7 points)**

Explain why decryption after encryption recovers $m$ for **every** message
$0\leq m<n$. Consider residues modulo $11$ and modulo $17$, then combine
your results. Explicitly include messages divisible by $11$ or $17$ and
relate this to the example $m=11$.

Evaluate the claim: “For all messages we may simply substitute
$m^{\varphi(n)}\equiv1\pmod n$.” You may use Fermat's little theorem and
the Chinese remainder theorem without proving them again. Another sound
mathematical justification covering all messages, including those not
coprime to $n$, is equally acceptable.
