"""Write only the two private same-ID author drafts; no approval or root edits."""
from copy import deepcopy
from hashlib import sha256
from pathlib import Path
import json
import re

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
CANON = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
assert not (HERE / 'content-review-handoff.json').exists(), 'The author package is frozen.'
raw = json.loads(CANON.read_text())
by_id = {g['id']: g for g in raw['goals']}
FORMS = [
{
 'key': 'rsa', 'id': '97b03cce-6641-5ec9-a6d2-f31838e2dbb9',
 'task_de': r'''# Ein mathematisches RSA-Modell

Eine Empfängerin verwendet die verschiedenen Primzahlen $p=11$ und $q=17$
und den öffentlichen Exponenten $e=7$. Nachrichten sind hier die ganzen
Zahlen $m$ mit $0\leq m<n$, wobei $n=pq$ gilt. Zeige die Rechenschritte
und begründe deine Aussagen. Insgesamt sind **20 BE** erreichbar.

**1. Schlüssel bilden (4 BE)**

Berechne $n$ und $\varphi(n)=(p-1)(q-1)$. Prüfe die Bedingung an $e$ und
bestimme einen positiven privaten Exponenten $d<\varphi(n)$ mit
$ed\equiv1\pmod{\varphi(n)}$. Prüfe dein Ergebnis.

**2. Asymmetrisches Prinzip erläutern (3 BE)**

Gib den öffentlichen und den privaten Schlüssel in einer eindeutig erklärten
Schreibweise an. Beschreibe, welche Daten ein Absender zum Verschlüsseln
benutzt und welche Daten die Empfängerin zum Entschlüsseln verwendet.
Erläutere daran, was hier „asymmetrisch“ bedeutet.

**3. Nachrichten verschlüsseln und zurückgewinnen (6 BE)**

Verschlüssele $m=20$ und $m=11$ mit $c\equiv m^e\pmod n$; wähle jeweils
$0\leq c<n$. Zeige eine nachvollziehbare modulare Potenzrechnung.
Entschlüssele beide Ergebnisse mit $m'\equiv c^d\pmod n$ und prüfe,
welche ursprüngliche Nachricht zurückkommt. Eine geeignete
Quadrat-und-Multiplizier-Rechnung oder eine gleichwertige modulare Rechnung
genügt; bloß ausgegebene Endwerte genügen nicht.

**4. Korrektheit plausibel begründen (7 BE)**

Begründe für **jede** Nachricht $0\leq m<n$, warum Entschlüsseln nach
Verschlüsseln wieder $m$ ergibt. Betrachte dazu die Reste modulo $11$ und
modulo $17$ und führe die Ergebnisse zusammen. Berücksichtige ausdrücklich,
dass eine Nachricht durch $11$ oder durch $17$ teilbar sein kann, und ordne
das Beispiel $m=11$ ein.

Beurteile die Aussage: „Man darf für alle Nachrichten einfach
$m^{\varphi(n)}\equiv1\pmod n$ einsetzen.“ Du darfst den kleinen Satz
von Fermat und den chinesischen Restsatz verwenden; ein erneuter Beweis
dieser Sätze ist nicht verlangt. Eine andere mathematisch tragfähige
Begründung, die alle Nachrichten einschließlich der nicht teilerfremden
abdeckt, ist gleichwertig.
''',
 'task_en': r'''# A mathematical RSA model

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
''',
 'solution_de': r'''# Musterlösung: RSA

**1. Schlüsselbildung**

Es ist $n=11\cdot17=187$ und $\varphi(n)=10\cdot16=160$.
Wegen $\operatorname{ggT}(7,160)=1$ besitzt $7$ ein multiplikatives Inverses
modulo $160$. Aus $160=22\cdot7+6$ und $7=6+1$ folgt
$1=23\cdot7-160$. Also ist $d=23$, und $7\cdot23=161=1+160$ prüft die
Bedingung. Hier ist $d$ in $1,\ldots,159$ eindeutig.

**2. Rollen**

Mit der Konvention $(\text{Modul},\text{Exponent})$ ist der öffentliche
Schlüssel $(187,7)$, der private Schlüssel $(187,23)$. Der Absender
verschlüsselt mit den öffentlichen Daten zu $c=m^7\bmod187$; die Empfängerin
entschlüsselt mit dem privaten Exponenten zu $c^{23}\bmod187$.
Asymmetrisch bedeutet, dass zum Verschlüsseln und Entschlüsseln verschiedene,
zusammengehörige Schlüssel verwendet werden. Der Absender benötigt den
privaten Exponenten nicht. Die zur Schlüsselbildung benutzten Faktoren
müssen ihm nicht mitgeteilt werden. Damit wird eine mathematische
Schlüsselrollen-Erklärung gegeben, keine Aussage zur Sicherheit einer
konkreten Implementierung.

**3. Rechnungen**

Für $m=20$ liefern aufeinanderfolgende Quadrate
$$20^2\equiv26,\qquad20^4\equiv115\pmod{187}.$$
Weil $7=4+2+1$, ist
$$20^7\equiv115\cdot26\cdot20\equiv147\pmod{187}.$$
Für $m=11$ gilt
$$11^2\equiv121,\qquad11^4\equiv55,\qquad
11^7\equiv55\cdot121\cdot11\equiv88\pmod{187}.$$
Die verschlüsselten Nachrichten sind daher $147$ und $88$.

Zum Entschlüsseln ist $23=16+4+2+1$. Wiederholtes Quadrieren ergibt:

| $c$ | $c^2\bmod187$ | $c^4\bmod187$ | $c^8\bmod187$ | $c^{16}\bmod187$ |
|---:|---:|---:|---:|---:|
| 147 | 104 | 157 | 152 | 103 |
| 88 | 77 | 132 | 33 | 154 |

Damit folgen
$$147^{23}\equiv103\cdot157\cdot104\cdot147\equiv20\pmod{187},$$
$$88^{23}\equiv154\cdot132\cdot77\cdot88\equiv11\pmod{187}.$$
Beide ursprünglichen Nachrichten werden zurückgewonnen. Insbesondere ist
$\operatorname{ggT}(11,187)=11$; Teilerfremdheit zu $n$ ist für die
Rückgewinnung hier nicht erforderlich. Eine Rechnung über die beiden
Primmoduln mit anschließender CRT-Zusammenführung ist gleichwertig.

**4. Begründung für alle Nachrichten**

Aus $c\equiv m^7\pmod{187}$ folgt
$c^{23}\equiv m^{161}\pmod{187}$. Betrachte zunächst modulo $11$:
Ist $11\mid m$, so sind $m^{161}$ und $m$ beide $0$ modulo $11$.
Andernfalls gibt Fermats kleiner Satz $m^{10}\equiv1\pmod{11}$ und damit
$$m^{161}=m(m^{10})^{16}\equiv m\pmod{11}.$$
Modulo $17$ gilt entsprechend: Ist $17\mid m$, sind beide Reste $0$;
andernfalls liefert $m^{16}\equiv1\pmod{17}$
$$m^{161}=m(m^{16})^{10}\equiv m\pmod{17}.$$
Somit stimmen die Reste der entschlüsselten Zahl und von $m$ modulo beider
teilerfremder Primzahlen überein. Der chinesische Restsatz macht die
Restklasse modulo $187$ eindeutig; da $m$ und der gewählte entschlüsselte
Vertreter beide zwischen $0$ und $186$ liegen, sind sie gleich. Auch $m=0$
ist eingeschlossen. Für $m=11$ greift modulo $11$ der Nullrestfall und
modulo $17$ der Fermat-Fall.

Die behauptete Substitution für alle Nachrichten ist falsch: Die
Euler-Aussage $m^{160}\equiv1\pmod{187}$ setzt
$\operatorname{ggT}(m,187)=1$ voraus. Schon bei $m=11$ ist $m^{160}$
modulo $11$ gleich $0$ und kann daher nicht $1$ modulo $187$ sein.
Der Beweis nach Primmoduln vermeidet diese unzulässige Anwendung oder eine
unzulässige Division durch $m$.
''',
 'solution_en': r'''# Worked solution: RSA

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
$$20^2\equiv26,\qquad20^4\equiv115\pmod{187}.$$
Since $7=4+2+1$,
$$20^7\equiv115\cdot26\cdot20\equiv147\pmod{187}.$$
For $m=11$,
$$11^2\equiv121,\qquad11^4\equiv55,\qquad
11^7\equiv55\cdot121\cdot11\equiv88\pmod{187}.$$
The encrypted messages are therefore $147$ and $88$.

For decryption, $23=16+4+2+1$. Repeated squaring yields:

| $c$ | $c^2\bmod187$ | $c^4\bmod187$ | $c^8\bmod187$ | $c^{16}\bmod187$ |
|---:|---:|---:|---:|---:|
| 147 | 104 | 157 | 152 | 103 |
| 88 | 77 | 132 | 33 | 154 |

Hence
$$147^{23}\equiv103\cdot157\cdot104\cdot147\equiv20\pmod{187},$$
$$88^{23}\equiv154\cdot132\cdot77\cdot88\equiv11\pmod{187}.$$
Both original messages are recovered. In particular, $\gcd(11,187)=11$;
being coprime to $n$ is not required for recovery here. A calculation using
the two prime moduli followed by CRT reconstruction is equally acceptable.

**4. Justification for all messages**

From $c\equiv m^7\pmod{187}$ we obtain
$c^{23}\equiv m^{161}\pmod{187}$. First work modulo $11$. If $11\mid m$,
then both $m^{161}$ and $m$ are $0$ modulo $11$. Otherwise Fermat's little
theorem gives $m^{10}\equiv1\pmod{11}$, and so
$$m^{161}=m(m^{10})^{16}\equiv m\pmod{11}.$$
Similarly modulo $17$, if $17\mid m$, both residues are $0$; otherwise
$m^{16}\equiv1\pmod{17}$ gives
$$m^{161}=m(m^{16})^{10}\equiv m\pmod{17}.$$
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
''',
 'steps': [
 ('rsa-keys',4,'n=187 und phi=160 je 1; Teilerfremdheits-/Inversenbedingung modulo phi (1); d=23 mit Prüfung bzw. Herleitung (1).','n=187 and phi=160, 1 each; coprimality/inverse condition modulo phi (1); d=23 with check or derivation (1).'),
 ('rsa-roles',3,'Öffentlichen Schlüssel eindeutig angegeben (1); privaten Schlüssel eindeutig angegeben (1); unterschiedliche zusammengehörige Schlüssel und Absender-/Empfängerrollen erläutert (1).','Clearly states the public key (1); private key (1); explains the different related keys and sender/recipient roles (1).'),
 ('rsa-encrypt20',2,'Geeignete modulare Potenzrechnung für m=20 (1); c=147 (1).','Suitable modular exponentiation for m=20 (1); c=147 (1).'),
 ('rsa-encrypt11',2,'Geeignete modulare Potenzrechnung für m=11 (1); c=88 (1).','Suitable modular exponentiation for m=11 (1); c=88 (1).'),
 ('rsa-decrypt',2,'Beide Entschlüsselungen mit nachvollziehbarem Verfahren, je 1: 0,5 Rechnung und 0,5 Rückgewinnung.','Both decryptions using a traceable method, 1 each: 0.5 calculation and 0.5 recovery.'),
 ('rsa-exponent',1,'Verschlüsseln/Entschlüsseln auf m hoch ed mit ed=161=1+160 zurückgeführt.','Reduces encryption/decryption to m to the power ed, with ed=161=1+160.'),
 ('rsa-prime11',1,'Nichtnullrestfall modulo 11 durch Fermat und den Exponenten 160 schlüssig erklärt.','Sound Fermat/exponent argument for nonzero residues modulo 11.'),
 ('rsa-prime17',1,'Nichtnullrestfall modulo 17 durch Fermat und den Exponenten 160 schlüssig erklärt.','Sound Fermat/exponent argument for nonzero residues modulo 17.'),
 ('rsa-zero',2,'Nullrestfälle allgemein berücksichtigt (1); m=11 richtig eingeordnet und die pauschale Euler-Substitution mit ihrer fehlenden Voraussetzung beurteilt (1).','Includes zero-residue cases generally (1); correctly relates m=11 and evaluates the blanket Euler substitution and its missing hypothesis (1).'),
 ('rsa-crt',2,'Zusammenführung beider Primmodul-Ergebnisse per CRT (1); eindeutige Rückgewinnung für den ganzen Nachrichtenbereich einschließlich 0 erklärt (1).','Combines the two prime-modulus results using CRT (1); explains unique recovery over the complete message range including 0 (1).'),
 ],
 'cap_de': 'Die Gesamtpunktzahl wird vor dem Vergleich mit der Bestehensgrenze auf höchstens 14 BE begrenzt, wenn über die gesamte Abgabe die asymmetrischen Schlüsselrollen vollständig fehlen oder durch eine einzige gemeinsame Geheimschlüsselrolle ersetzt werden, keine nachvollziehbare RSA-Verschlüsselung einer Nachricht vorliegt oder eine tragfähige allgemeine Rückgewinnungsbegründung einschließlich nicht teilerfremder Nachrichten vollständig fehlt. Insbesondere ersetzt ein ausschließlich für teilerfremde Nachrichten zulässiger Euler-Schritt die fehlende Behandlung der durch p oder q teilbaren Nachrichten nicht; eine anderweitige gültige Behandlung zählt. Die bloße Überprüfung der zwei Zahlenbeispiele ersetzt keine allgemeine Begründung. Eine kurze korrekte Primmodul-/CRT-Begründung oder ein gleichwertiger allgemeiner Nachweis genügt. Einzelne lokale Rechenfehler, unvollständige Nebendetails oder eine fehlende Benennung eines bereits richtig verwendeten Satzes lösen diese Kappung nicht aus.',
 'cap_en': 'Before comparison with the pass threshold, cap the total score at 14 points if, across the whole submission, the asymmetric key roles are entirely absent or replaced by a single shared-secret-key role, no traceable RSA encryption of a message is present, or a sound general recovery justification including messages not coprime to n is entirely absent. In particular, an Euler step valid only for coprime messages does not replace the missing treatment of messages divisible by p or q; a valid treatment elsewhere counts. Merely checking the two numerical examples does not replace a general justification. A concise correct prime-modulus/CRT argument or an equivalent general justification is sufficient. Isolated local calculation errors, incomplete secondary details, or failure to name a theorem already correctly used do not trigger this cap.',
},
{
 'key':'factorisation', 'id':'1c1754b7-2cd3-5635-824d-ce93f7b99514',
 'task_de': r'''# Das quadratische Sieb an einem kleinen Beispiel erklären

Die natürliche Zahl $N=1649$ soll faktorisiert werden. Erläutere die
Funktionsweise des **quadratischen Siebs** an dem folgenden kleinen Lauf.
Es geht um einen mathematischen Verfahrensnachweis, nicht um ein Programm.
Zeige deine Überlegungen und Rechenschritte. Insgesamt sind **20 BE** erreichbar.

Wir verwenden $Q(x)=x^2-N$, die Faktorbasis $B=\{2,5\}$ und das Intervall
$x=41,42,43,44,45$. Alle $Q(x)$ in diesem Intervall sind positiv.

**1. Verfahrensidee erläutern (4 BE)**

Beschreibe im Zusammenhang, welche Rolle Faktorbasis, Sieben,
Exponentenparitäten und ggT-Berechnung spielen. Begründe, warum man nach
einer Kongruenz $X^2\equiv Y^2\pmod N$ sucht und wie sie zur
Faktorgewinnung führen kann. Eine bloße Liste von Fachwörtern genügt nicht.

**2. Beziehungen durch Sieben gewinnen (6 BE)**

Erläutere, warum $x$ nahe bei $\sqrt N$ zweckmäßig ist. Bestimme die
Restklassen von $x$ modulo $2$ beziehungsweise modulo $5$, für die
$Q(x)$ durch den jeweiligen Faktorbasiseintrag teilbar ist. Erkläre,
warum man dadurch regelmäßig wiederkehrende Stellen im Intervall
markieren kann. Teile dort alle auftretenden Potenzen von $2$ und $5$
aus den $Q(x)$ heraus und vervollständige die Tabelle.

| $x$ | $Q(x)$ | Rest nach Entfernen aller Faktoren 2 und 5 | Vollständig über B zerlegbar? |
|---:|---:|---:|---|
| 41 | | | |
| 42 | | | |
| 43 | | | |
| 44 | | | |
| 45 | | | |

Welche Beziehungen behältst du für den nächsten Schritt, und warum?

**3. Eine Quadratkongruenz und Faktoren gewinnen (7 BE)**

Gib die Exponenten der Faktorbasiseinträge in den behaltenen Beziehungen
an. Wähle eine Kombination, deren Exponentensummen alle gerade sind, und
begründe die Auswahl. Bestimme daraus $X$ und $Y$ mit
$X^2\equiv Y^2\pmod N$; Restvertreter modulo $N$ sind zulässig.
Berechne $\operatorname{ggT}(X-Y,N)$ und
$\operatorname{ggT}(X+Y,N)$, prüfe die erhaltene Faktorisierung und
verbinde deine Rechnung mit der Verfahrensidee aus Teil 1.

**4. Einen scheinbaren Erfolg beurteilen (3 BE)**

Jemand legt stattdessen $X=Y=32$ vor: „Die Quadratkongruenz stimmt,
also haben wir einen nichttrivialen Faktor gefunden.“ Prüfe die Aussage
mit beiden ggT-Werten. Erkläre, was ein erfolgloser ggT-Schritt für das
weitere Vorgehen bedeutet. Unterscheide außerdem das Ziel eines
Primzahltests vom Ziel eines Faktorisierungsverfahrens. Verlangt ist kein
zusätzlicher Primzahltest.
''',
 'task_en': r'''# Explain the quadratic sieve using a small example

The natural number $N=1649$ is to be factored. Explain how the
**quadratic sieve** works using the following small run. This is a
mathematical demonstration of the method, not a programming task.
Show your reasoning and calculations. A total of **20 points** is available.

Use $Q(x)=x^2-N$, the factor base $B=\{2,5\}$, and the interval
$x=41,42,43,44,45$. Every $Q(x)$ in this interval is positive.

**1. Explain the method (4 points)**

Give a connected explanation of the roles of the factor base, sieving,
exponent parities and gcd calculation. Explain why one seeks a congruence
$X^2\equiv Y^2\pmod N$ and how it can yield factors. A list of technical
terms alone is insufficient.

**2. Obtain relations by sieving (6 points)**

Explain why values of $x$ near $\sqrt N$ are useful. Find the residue
classes of $x$ modulo $2$ and modulo $5$ for which $Q(x)$ is divisible by
the respective factor-base prime. Explain how this lets you mark regularly
recurring positions in the interval. Divide out all powers of $2$ and $5$
from the corresponding $Q(x)$ and complete the table.

| $x$ | $Q(x)$ | Remainder after removing all factors 2 and 5 | Factors completely over B? |
|---:|---:|---:|---|
| 41 | | | |
| 42 | | | |
| 43 | | | |
| 44 | | | |
| 45 | | | |

Which relations do you keep for the next step, and why?

**3. Obtain a square congruence and factors (7 points)**

State the exponents of the factor-base primes in the retained relations.
Choose a combination whose exponent sums are all even and explain your
choice. Use it to obtain $X$ and $Y$ with $X^2\equiv Y^2\pmod N$;
representatives modulo $N$ are acceptable. Calculate $\gcd(X-Y,N)$ and
$\gcd(X+Y,N)$, check the resulting factorization, and connect your
calculation to the method described in part 1.

**4. Evaluate an apparent success (3 points)**

Someone instead proposes $X=Y=32$: “The square congruence holds, so we
have found a nontrivial factor.” Check this claim using both gcd values.
Explain what an unsuccessful gcd step means for the next step of the
method. Also distinguish the aim of a primality test from the aim of a
factorization method. You are not asked to carry out another primality test.
''',
 'solution_de': r'''# Musterlösung: quadratisches Sieb

**1. Idee und mathematischer Grund**

Das Verfahren sucht kleine Werte von $Q(x)=x^2-N$, deren Primfaktoren
vollständig in einer kleinen Faktorbasis liegen. Solche Werte heißen
über der Basis glatt. Sieben markiert für jede Basisprimzahl regelmäßig
wiederkehrende teilbare Werte und entfernt deren Primzahlpotenzen.
Exponentenvektoren halten die Zerlegungen fest. Wählt man Beziehungen so,
dass alle Exponentensummen gerade sind, ist ihr Produkt ein Quadrat $Y^2$.
Wegen $Q(x)\equiv x^2\pmod N$ ist es gleichzeitig zum Quadrat des
Produkts der zugehörigen $x$ kongruent, also zu $X^2$.

Aus $X^2\equiv Y^2\pmod N$ folgt
$$N\mid(X^2-Y^2)=(X-Y)(X+Y).$$
Die Faktoren von $N$ können sich auf die beiden Klammern verteilen.
$\operatorname{ggT}(X-Y,N)$ oder $\operatorname{ggT}(X+Y,N)$ kann dann
einen Teiler $d$ mit $1<d<N$ liefern. Nicht jede Quadratkongruenz liefert
einen solchen Teiler; die ggT-Werte müssen geprüft werden.

**2. Sieben**

$40^2<N<41^2$. Nahe bei $\sqrt N$ sind die Differenzen $x^2-N$ klein;
das begünstigt vollständige Zerlegungen über der kleinen Basis, ohne sie
für jeden Wert zu garantieren. Da $N\equiv1\pmod2$, ist $Q(x)$ für
ungerade $x$ durch $2$ teilbar. Wegen $N\equiv4\pmod5$ sind modulo $5$
die Klassen $x\equiv2$ und $x\equiv3$ passend. Diese Klassen wiederholen
sich im Abstand $2$ beziehungsweise $5$; so findet man die zu markierenden
Stellen ohne jedes Mal alle Teilbarkeiten neu zu suchen.

| $x$ | $Q(x)$ | Entfernte Basisfaktoren | Rest | Behalten? |
|---:|---:|---|---:|---|
| 41 | 32 | $2^5$ | 1 | ja |
| 42 | 115 | $5$ | 23 | nein |
| 43 | 200 | $2^3\cdot5^2$ | 1 | ja |
| 44 | 287 | keine | 287 | nein |
| 45 | 376 | $2^3$ | 47 | nein |

Nur die Beziehungen zu $41$ und $43$ sind vollständig über $B$ zerlegt:
Der verbleibende Rest ist jeweils $1$. Ein Rest wie $23$ ist kein
zulässiger neuer Faktorbasiseintrag in diesem festgelegten Lauf.

**3. Kombination und Faktorgewinn**

In der Reihenfolge $(2,5)$ sind die Exponentenvektoren $(5,0)$ und $(3,2)$.
Ihre Paritäten sind beide $(1,0)$; ihre Summe modulo $2$ ist $(0,0)$.
Daher kann man beide Beziehungen kombinieren:
$$Q(41)Q(43)=32\cdot200=2^8\cdot5^2=80^2.$$
Mit $X=41\cdot43=1763$ und $Y=80$ ist also $X^2\equiv Y^2\pmod{1649}$.
Der kleinere Vertreter $X=114$ ist gleichwertig. Somit
$$\operatorname{ggT}(114-80,1649)=\operatorname{ggT}(34,1649)=17,$$
$$\operatorname{ggT}(114+80,1649)=\operatorname{ggT}(194,1649)=97.$$
Die Probe $17\cdot97=1649$ bestätigt die Faktorisierung. Beide Faktoren
sind echt zwischen $1$ und $N$. Ihre Primzahleigenschaft kann bei Bedarf
an den Primteilern bis zur jeweiligen Quadratwurzel geprüft werden; sie
ist für die hier verlangte nichttriviale Faktorgewinnung nicht zusätzlich
nachzuweisen. Nicht die Zerlegung eines einzelnen $Q(x)$, sondern erst
die Kombination zum Quadrat und die anschließende ggT-Rechnung faktorisiert
hier $N$.

**4. Grenzen des einzelnen Schritts**

Bei $X=Y=32$ gilt zwar die Quadratkongruenz, aber
$$\operatorname{ggT}(0,1649)=1649,\qquad
\operatorname{ggT}(64,1649)=1.$$
Beide Teiler sind trivial. Das ist kein Nachweis, dass $N$ prim ist, und
auch kein Widerspruch zum Verfahren. Man benötigt eine andere geeignete
Kombination beziehungsweise weitere glatte Beziehungen; reichen sie nicht,
kann man das Siebintervall oder die Faktorbasis erweitern. Ein Primzahltest
untersucht, ob eine Zahl prim ist (je nach Test mit unterschiedlicher
Aussagestärke); ein Faktorisierungsverfahren sucht eine Zerlegung in
nichttriviale Faktoren. Die Behauptung, beide lieferten stets dieselbe
Art von Ergebnis, wäre falsch.
''',
 'solution_en': r'''# Worked solution: quadratic sieve

**1. Idea and mathematical basis**

The method seeks small values of $Q(x)=x^2-N$ whose prime factors all
belong to a small factor base. Such values are smooth over that base.
Sieving marks periodically recurring values divisible by each base prime
and removes their prime powers. Exponent vectors record the
factorizations. Choosing relations with all exponent sums even makes
their product a square $Y^2$. Since $Q(x)\equiv x^2\pmod N$, it is also
congruent to the square of the product of the corresponding $x$ values,
namely $X^2$.

From $X^2\equiv Y^2\pmod N$ it follows that
$$N\mid(X^2-Y^2)=(X-Y)(X+Y).$$
The factors of $N$ may be distributed between these two brackets. Then
$\gcd(X-Y,N)$ or $\gcd(X+Y,N)$ can yield a divisor $d$ with $1<d<N$.
Not every square congruence yields such a divisor; the gcd values must
be checked.

**2. Sieving**

We have $40^2<N<41^2$. Near $\sqrt N$, the differences $x^2-N$ are small,
which favours complete factorizations over the small base without
ensuring this for every value. Since $N\equiv1\pmod2$, $Q(x)$ is divisible
by $2$ when $x$ is odd. Since $N\equiv4\pmod5$, the suitable classes modulo
$5$ are $x\equiv2$ and $x\equiv3$. These classes repeat at intervals of
$2$ and $5$ respectively, identifying positions to mark without
independently searching all divisibility conditions again.

| $x$ | $Q(x)$ | Removed base factors | Remainder | Keep? |
|---:|---:|---|---:|---|
| 41 | 32 | $2^5$ | 1 | yes |
| 42 | 115 | $5$ | 23 | no |
| 43 | 200 | $2^3\cdot5^2$ | 1 | yes |
| 44 | 287 | none | 287 | no |
| 45 | 376 | $2^3$ | 47 | no |

Only the relations for $41$ and $43$ factor completely over $B$: each
leaves remainder $1$. A remainder such as $23$ is not an admissible new
factor-base prime in this specified run.

**3. Combination and factor extraction**

In the order $(2,5)$ the exponent vectors are $(5,0)$ and $(3,2)$.
Both have parity $(1,0)$; their sum modulo $2$ is $(0,0)$.
They can therefore be combined:
$$Q(41)Q(43)=32\cdot200=2^8\cdot5^2=80^2.$$
Thus $X=41\cdot43=1763$ and $Y=80$ satisfy
$X^2\equiv Y^2\pmod{1649}$. The smaller representative $X=114$ is equivalent.
Consequently,
$$\gcd(114-80,1649)=\gcd(34,1649)=17,$$
$$\gcd(114+80,1649)=\gcd(194,1649)=97.$$
The check $17\cdot97=1649$ confirms the factorization. Both factors lie
strictly between $1$ and $N$. Their primality could, if needed, be checked
using primes up to their respective square roots; no additional primality
proof is required for the nontrivial factor extraction asked for here.
Factoring an individual $Q(x)$ alone does not factor $N$: the combination
into a square followed by gcd extraction does so in this example.

**4. Limits of an individual step**

For $X=Y=32$, the square congruence does hold, but
$$\gcd(0,1649)=1649,\qquad\gcd(64,1649)=1.$$
Both divisors are trivial. This neither establishes that $N$ is prime nor
contradicts the method. One needs a different suitable combination or
additional smooth relations; if these are insufficient, the sieving
interval or factor base can be enlarged. A primality test investigates
whether a number is prime (with a strength of conclusion depending on
the test); a factorization method seeks a decomposition into nontrivial
factors. Claiming that they always return the same kind of result would
be false.
''',
 'steps': [
 ('factor-method',4,'Zusammenhang von Faktorbasis und vollständiger Glattheit (1), Sieben (1), geraden Exponentensummen (1), Quadratkongruenz/Differenzprodukt und nichttrivialen ggT-Faktoren (1) fachsprachlich erläutert.','Explains the connected roles of factor base/complete smoothness (1), sieving (1), even exponent sums (1), square congruence/difference product and nontrivial gcd factors (1).'),
 ('factor-near-root',1,'Kleine Q-Werte nahe der Quadratwurzel als Suchidee begründet, ohne Glattheit zu garantieren.','Explains the search for small Q values near the square root, without claiming guaranteed smoothness.'),
 ('factor-sieve-classes',1,'Ungerade x sowie x=2 oder 3 modulo 5 und ihr periodisches Wiederauftreten richtig.','Correct odd x, x=2 or 3 modulo 5, and periodic recurrence.'),
 ('factor-table',3,'Fünf Q-Werte je 0,5; korrekte Restbildung nach Entfernen der Basisfaktoren zusammen 0,5.','Five Q values, 0.5 each; correct residuals after removing base factors, 0.5 together.'),
 ('factor-smooth-choice',1,'Genau 41 und 43 wegen Rest 1 behalten; fremde Restfaktoren ausgeschlossen.','Keeps exactly 41 and 43 because their residual is 1; excludes remaining factors outside the base.'),
 ('factor-parity',2,'Beide Exponentenvektoren richtig (1); gerade Summen bzw. Null-Parität und Kombination begründet (1).','Both exponent vectors correct (1); explains even sums/zero parity and the combination (1).'),
 ('factor-congruence',3,'Produkt der Q-Werte und Y=80 (1); X=1763 oder 114 (1); Herkunft der Quadratkongruenz aus den ausgewählten Beziehungen erklärt (1).','Product of Q values and Y=80 (1); X=1763 or 114 (1); explains how the selected relations produce the square congruence (1).'),
 ('factor-gcd',2,'Faktoren 17 und 97 aus ggT bestimmt (je 0,5); Produktprobe und Nichttrivialität erklärt (1).','Obtains 17 and 97 by gcd calculation (0.5 each); product check and nontriviality (1).'),
 ('factor-trivial',1,'Beide ggT-Werte beim Gegenbeispiel als N und 1 mit passender Beurteilung bestimmt.','Obtains N and 1 as the two gcd values in the counterexample and evaluates them correctly.'),
 ('factor-next-step',2,'Andere Kombination/weitere Beziehungen statt Primheitsbehauptung erläutert (1); Ziele von Primzahltest und Faktorisierung sachgerecht unterschieden (1).','Explains trying another combination/further relations rather than claiming primality (1); distinguishes aims of primality testing and factorization (1).'),
 ],
 'cap_de':'Die Gesamtpunktzahl wird vor dem Vergleich mit der Bestehensgrenze auf höchstens 14 BE begrenzt, wenn über die gesamte Abgabe keine fachlich tragfähige Erklärung des Faktorisierungsverfahrens erkennbar ist. Das betrifft insbesondere eine vollständig fehlende Erklärung, wie aus vollständig über der Faktorbasis zerlegten Beziehungen durch gerade Exponentensummen eine Quadratkongruenz entsteht, oder eine vollständig fehlende Erklärung, wie daraus mittels ggT ein nichttrivialer Faktor gewonnen werden kann. Bloß die Endfaktoren zu nennen, fremde Primfaktoren in der festgelegten Basis stillschweigend zuzulassen oder jedes kongruente Quadratepaar ungeprüft als Faktorisierung auszugeben ersetzt diese Kernhandlungen nicht. Ein korrekt kommentierter Rechnungsgang oder eine knappe, gleichwertige allgemeine Begründung an beliebiger Stelle genügt; weder ein bestimmtes Fachwort noch eine zusätzliche Programmausführung oder ein weiterer Primzahltest ist verlangt. Ein lokaler Fehler bei einem Tabellenwert, einem Exponenten oder einem ggT löst bei sonst tragfähigem Verfahren allein keine Kappung aus.',
 'cap_en':'Before comparison with the pass threshold, cap the total score at 14 points if the submission as a whole contains no sound explanation of the factorization method. This applies in particular when the explanation of how fully factor-base-smooth relations and even exponent sums yield a square congruence is entirely missing, or when the explanation of how gcd calculation can then extract a nontrivial factor is entirely missing. Merely naming the final factors, silently admitting primes outside the specified factor base, or treating every congruent pair of squares as an unchecked factorization does not replace these core actions. Correctly annotated calculations or a concise equivalent general justification anywhere in the submission are sufficient; no particular technical term, program execution or additional primality test is required. A local error in a table entry, exponent or gcd alone does not trigger the cap when the method is otherwise sound.',
}
]

COMMON_DE = '''# Eine Gesamtbewertung

Es gibt eine Gesamtpunktzahl aus 20 BE und genau ein binäres Gesamtergebnis:
**bestanden ab 15 BE**, sonst nicht bestanden. Teilpunkte haben keine eigenen
Bestehensgrenzen.

Bewerte mathematisch gleichwertige Verfahren und nachvollziehbare Leistungen
unabhängig vom Ort in der Abgabe. Identische Leistungen zählen nur einmal.
Teilpunkte wie angegeben, sonst 0,5 BE für eine fachlich sinnvolle, aber
unvollständige Teilleistung. Ein lokaler Rechen- oder Übertragungsfehler wird
nicht mehrfach bestraft; richtige nachvollziehbare Folgearbeit behält ihren
Kredit. Ein solcher lokaler Fehler allein löst keine Gesamtpunktkappung aus.
Knappe richtige Erklärungen und äquivalente Schreibweisen genügen; bestimmte
Schlüsselwörter oder eine feste Reihenfolge sind nicht erforderlich.

| Kriterium | BE |
|---|---:|
'''
COMMON_EN = '''# One overall result

There is one total score out of 20 points and exactly one binary overall
result: **pass at 15 points**, otherwise not passed. Partial marks have no
separate pass thresholds.

Credit equivalent mathematical methods and traceable work wherever they
appear in the submission. Count identical work only once. Award partial
marks as specified, otherwise 0.5 points for meaningful but incomplete work.
Do not repeatedly penalise one local calculation or transcription error;
correct traceable follow-through retains its credit. Such a local error alone
does not trigger an overall cap. Concise correct explanations and equivalent
notation are sufficient; no particular wording or fixed order is required.

| Criterion | Points |
|---|---:|
'''

for f in FORMS:
    for text_key in ('task_de', 'task_en', 'solution_de', 'solution_en'):
        f[text_key] = re.sub(r'\$\$(.*?)\$\$', lambda match: '\n$$\n'+match.group(1).strip()+'\n$$\n', f[text_key], flags=re.S)
    folder = HERE / f['id']; folder.mkdir(exist_ok=True)
    current = by_id[f['id']]
    assert not current.get('examData') and current.get('nodeKind') not in ('exam','memory')
    rubric_de = COMMON_DE + ''.join(f"| {de} | {points} |\n" for _,points,de,en in f['steps']) + '\n' + f['cap_de'] + '\n\nMehrere zutreffende Kappungsgründe führen weiterhin nur zur selben Obergrenze von 14 BE. Danach wird die einzige Gesamtpunktzahl mit 15 BE verglichen. Es gibt keine zusätzlichen Teilbestehensentscheidungen.\n'
    rubric_en = COMMON_EN + ''.join(f"| {en} | {points} |\n" for _,points,de,en in f['steps']) + '\n' + f['cap_en'] + '\n\nMultiple applicable reasons still impose only the same cap of 14 points. Compare the one resulting total with 15 points. There are no additional part-pass decisions.\n'
    texts = {'task.de.md':f['task_de'],'task.en.md':f['task_en'],'solution.de.md':f['solution_de'],'solution.en.md':f['solution_en'],'rubric.de.md':rubric_de,'rubric.en.md':rubric_en}
    for name,text in texts.items(): (folder/name).write_text(text)
    proposed = deepcopy(current); proposed['nodeKind']='exam'
    proposed['examData'] = {'reviewStatus':'draft','taskContent':f['task_de'],'taskContentEn':f['task_en'],
       'solutionContent':f['solution_de']+'\n'+rubric_de,'solutionContentEn':f['solution_en']+'\n'+rubric_en,
       'coveredGoalIds':[f['id']], 'coveredStrands':current['dimensionTags']['guidingIdeas'],
       'demandLevels':[current['dimensionTags']['demandLevel']],
       'scoring':{'maxPoints':20,'passingPoints':15,'steps':[{'id':id,'points':points,'description':de,'descriptionEn':en} for id,points,de,en in f['steps']]}}
    assert sum(s['points'] for s in proposed['examData']['scoring']['steps'])==20
    assert {k:v for k,v in proposed.items() if k not in ('nodeKind','examData')}==current
    (folder/'current-whole-goal.json').write_text(json.dumps(current,ensure_ascii=False,indent=2)+'\n')
    (folder/'proposed-whole-goal.draft.json').write_text(json.dumps(proposed,ensure_ascii=False,indent=2)+'\n')
    (folder/'whole-contract.before-after.json').write_text(json.dumps({'goalId':f['id'],'before':current,'after':proposed,'onlyAddedFields':['nodeKind','examData'],'allPriorFieldsPreserved':True,'coverageOnlyOwnExistingId':True,'independentContentReview':'PENDING','independentAMReview':'PENDING'},ensure_ascii=False,indent=2)+'\n')

# Whole authored preparation chains: retain every complete referenced goal.
contexts=[]
for f in FORMS:
    seen=set();stack=list(by_id[f['id']].get('requires',[]))
    while stack:
        id=stack.pop()
        assert id in by_id,id
        if id in seen:continue
        seen.add(id);stack.extend(by_id[id].get('requires',[]))
    contexts.append({'goalId':f['id'],'wholeCurrentGoal':by_id[f['id']], 'directRequires':by_id[f['id']]['requires'],
       'transitiveRequiresGoalCount':len(seen),'wholeTransitiveRequiresGoals':[by_id[id] for id in sorted(seen)],
       'meaning':'Authored preparation only, not assessed coverage or new mastery. No R edge is changed.'})
(HERE/'whole-current-contracts-and-preparation.json').write_text(json.dumps({'canonicalPath':str(CANON.relative_to(ROOT)),'canonicalSha256':sha256(CANON.read_bytes()).hexdigest(),'goals':contexts},ensure_ascii=False,indent=2)+'\n')
am=[]
for lane in ['semantic-atomicity','memory-card-review']:
    config_path=ROOT/f'curricula/DE/Gymnasium/quality/{lane}/canonical-math-full.config.json'
    config=json.loads(config_path.read_text());review_path=ROOT/config['reviewPath']
    for n,line in enumerate(review_path.read_text().splitlines(),1):
        row=json.loads(line)
        if row.get('goalId') in {f['id'] for f in FORMS}:
            am.append({'lane':lane,'registeredConfigPath':str(config_path.relative_to(ROOT)), 'registeredConfigSha256':sha256(config_path.read_bytes()).hexdigest(),
               'registeredReviewPath':config['reviewPath'],'registeredReviewSha256':sha256(review_path.read_bytes()).hexdigest(),'line':n,'wholeCurrentRow':row,
               'proposedSameIdExecutionFormRevalidation':'PENDING_INDEPENDENT_REVIEW_NOT_A_HASH_REFRESH_APPROVAL'})
assert len(am)==4
(HERE/'current-four-registered-am-rows.json').write_text(json.dumps({'status':'CURRENT_REGISTERED_ROWS_ONLY_NO_NEW_REVIEW_DECISION','rows':am,'bothCurrentMemoryDecisions':'no_memory_needed; no memory goals/decks/cards added or removed'},ensure_ascii=False,indent=2)+'\n')

# Narrow, explicit reuse search: current assessed IDs plus actual RSA/QS task content.
reusable=[]
for g in raw['goals']:
    ex=g.get('examData')
    if not ex:continue
    text=' '.join(ex.get(k,'') for k in ['taskContent','taskContentEn'])
    if set(ex.get('coveredGoalIds',[])) & {f['id'] for f in FORMS} or 'RSA' in text or 'quadratisches Sieb' in text or 'quadratic sieve' in text:
        reusable.append({'goalId':g['id'],'title':g['title'],'examData':ex})
(HERE/'reuse-search.json').write_text(json.dumps({'canonicalSha256':sha256(CANON.read_bytes()).hexdigest(),'currentCanonicalSuitableWholeFormsFound':len(reusable),'matches':reusable,'supplementarySearch':'No task*.md matches for word-boundary RSA or quadratic-sieve terms in curricula/DE/Gymnasium/assessments/mathematik. Historical snapshots do not establish active whole-form acceptance.','decision':'Two original bilingual same-ID forms authored because no suitable current whole form was found.'},ensure_ascii=False,indent=2)+'\n')
pack={'status':'TWO_PRIVATE_WHOLE_FORMS_AWAITING_GENUINE_INDEPENDENT_CONTENT_AND_AM_REVIEW','authorAgent':'/root/sol_directed_prior_stage_qa',
      'canonical':{'path':str(CANON.relative_to(ROOT)),'sha256':sha256(CANON.read_bytes()).hexdigest()},
      'forms':[{'key':f['key'],'goalId':f['id']} for f in FORMS],
      'allowedDelta':'Only nodeKind=exam and draft examData under the two existing IDs. Existing entire texts, R, source, scope, LK/AB3 and all metadata unchanged.',
      'notClaimed':['Astra approval','post-form A/M approval','root integration','source or scope enlargement','prerequisite coverage or mastery','native producer or M7 acceptance','host or human acceptance']}
(HERE/'author-package.json').write_text(json.dumps(pack,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'forms':len(FORMS),'canonicalSha256':pack['canonical']['sha256'],'preparationCounts':[c['transitiveRequiresGoalCount'] for c in contexts],'currentAMRows':len(am)}))
