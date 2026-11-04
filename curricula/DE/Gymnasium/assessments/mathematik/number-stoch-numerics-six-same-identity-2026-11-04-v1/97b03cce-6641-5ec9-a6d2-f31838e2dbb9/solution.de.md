# Musterlösung: RSA

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

$$
20^2\equiv26,\qquad20^4\equiv115\pmod{187}.
$$

Weil $7=4+2+1$, ist

$$
20^7\equiv115\cdot26\cdot20\equiv147\pmod{187}.
$$

Für $m=11$ gilt

$$
11^2\equiv121,\qquad11^4\equiv55,\qquad
11^7\equiv55\cdot121\cdot11\equiv88\pmod{187}.
$$

Die verschlüsselten Nachrichten sind daher $147$ und $88$.

Zum Entschlüsseln ist $23=16+4+2+1$. Wiederholtes Quadrieren ergibt:

| $c$ | $c^2\bmod187$ | $c^4\bmod187$ | $c^8\bmod187$ | $c^{16}\bmod187$ |
|---:|---:|---:|---:|---:|
| 147 | 104 | 157 | 152 | 103 |
| 88 | 77 | 132 | 33 | 154 |

Damit folgen

$$
147^{23}\equiv103\cdot157\cdot104\cdot147\equiv20\pmod{187},
$$


$$
88^{23}\equiv154\cdot132\cdot77\cdot88\equiv11\pmod{187}.
$$

Beide ursprünglichen Nachrichten werden zurückgewonnen. Insbesondere ist
$\operatorname{ggT}(11,187)=11$; Teilerfremdheit zu $n$ ist für die
Rückgewinnung hier nicht erforderlich. Eine Rechnung über die beiden
Primmoduln mit anschließender CRT-Zusammenführung ist gleichwertig.

**4. Begründung für alle Nachrichten**

Aus $c\equiv m^7\pmod{187}$ folgt
$c^{23}\equiv m^{161}\pmod{187}$. Betrachte zunächst modulo $11$:
Ist $11\mid m$, so sind $m^{161}$ und $m$ beide $0$ modulo $11$.
Andernfalls gibt Fermats kleiner Satz $m^{10}\equiv1\pmod{11}$ und damit

$$
m^{161}=m(m^{10})^{16}\equiv m\pmod{11}.
$$

Modulo $17$ gilt entsprechend: Ist $17\mid m$, sind beide Reste $0$;
andernfalls liefert $m^{16}\equiv1\pmod{17}$

$$
m^{161}=m(m^{16})^{10}\equiv m\pmod{17}.
$$

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
