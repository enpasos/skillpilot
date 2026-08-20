# Lösung und Bewertungsraster – Q2-Masteraufgabe (GK)

- Version: `v2`
- Profil: Grundkurs
- Assessment-Ziel: `57aff94e-91b8-5cc6-9f85-3f317ecf36ca`
- Maximalpunktzahl: 50 BE
- Bestehensgrenze: 25 BE

Gleichwertige mathematisch korrekte Lösungswege und sachlich gleichwertige Deutungen sind anzuerkennen.

## 1. Modellierung (10 BE)

### a) Zustands-/Übergangsgraph (4 BE)

Der vollständige Graph besitzt die Zustände A und B sowie die vier gerichteten Übergänge

- A $\to$ A mit $0{,}92$,
- A $\to$ B mit $0{,}08$,
- B $\to$ A mit $0{,}05$,
- B $\to$ B mit $0{,}95$.

Bewertung: je ein korrekt gerichteter und beschrifteter Übergang 1 BE.

### b) Anfangszustand und Übergangsmatrix (4 BE)

Mit Spalten als Ausgangsstädten, Zeilen als Zielstädten und der Reihenfolge $(A,B)$ gilt

$$
\vec x_0=\begin{pmatrix}10\,000\\8\,000\end{pmatrix},
\qquad
M=\begin{pmatrix}
0{,}92 & 0{,}05\\
0{,}08 & 0{,}95
\end{pmatrix},
\qquad
\vec x_{n+1}=M\vec x_n.
$$

Bewertung: Anfangszustand 1 BE, Matrixeinträge 2 BE, Reihenfolge und Rechenkonvention 1 BE.

### c) Eintragsdeutung (2 BE)

- $m_{12}=0{,}05$ ist der Anteil der Personen aus B, die im Folgejahr in A leben.
- $m_{21}=0{,}08$ ist der Anteil der Personen aus A, die im Folgejahr in B leben.

Bewertung: je korrekte Deutung 1 BE.

## 2. Vorwärtsentwicklung und Matrixprodukt (10 BE)

### a) Zustände nach einem und zwei Jahren (4 BE)

$$
\vec x_1=M\vec x_0
=\begin{pmatrix}
0{,}92 & 0{,}05\\
0{,}08 & 0{,}95
\end{pmatrix}
\begin{pmatrix}10\,000\\8\,000\end{pmatrix}
=\begin{pmatrix}9\,600\\8\,400\end{pmatrix}.
$$

$$
\vec x_2=M\vec x_1
=\begin{pmatrix}
0{,}92 & 0{,}05\\
0{,}08 & 0{,}95
\end{pmatrix}
\begin{pmatrix}9\,600\\8\,400\end{pmatrix}
=\begin{pmatrix}9\,252\\8\,748\end{pmatrix}.
$$

Bewertung: $\vec x_1$ 2 BE, $\vec x_2$ 2 BE.

### b) Kontext und Erhaltung (2 BE)

Nach zwei Jahren leben dem Modell zufolge $9\,252$ Personen in A und $8\,748$ Personen in B. Beide Spaltensummen von $M$ sind 1. Daher gilt

$$
\begin{pmatrix}1&1\end{pmatrix}M=\begin{pmatrix}1&1\end{pmatrix},
$$

und die Komponentensumme bleibt bei jedem Übergang $18\,000$.

Bewertung: Kontextdeutung 1 BE, tragfähige Erhaltungsbegründung 1 BE.

### c) Zweischritt-Matrix (4 BE)

$$
M^2=M\cdot M
=\begin{pmatrix}
0{,}8504 & 0{,}0935\\
0{,}1496 & 0{,}9065
\end{pmatrix}.
$$

Das Produkt ist definiert, weil beide Faktoren $2\times2$-Matrizen sind. Der rechte Faktor wirkt zuerst; beide Faktoren bilden jeweils einen Jahresübergang ab. Deshalb beschreibt $M\cdot M$ zwei aufeinanderfolgende Jahresübergänge.

Der Eintrag $(M^2)_{21}=0{,}1496$ bedeutet: Eine zunächst in A lebende Person befindet sich nach zwei Übergängen mit Wahrscheinlichkeit $14{,}96\,\%$ in B.

Bewertung: Matrix $M^2$ 2 BE, Dimensions-/Reihenfolgebegründung 1 BE, Eintragsdeutung 1 BE.

## 3. Vergleich eines zweiten Modells (10 BE)

### a) Differenzmatrix (3 BE)

$$
D=N-M
=\begin{pmatrix}
-0{,}04 & 0{,}05\\
0{,}04 & -0{,}05
\end{pmatrix}.
$$

$d_{21}=0{,}04$ bedeutet: Im alternativen Modell ist die Übergangswahrscheinlichkeit A $\to$ B um 4 Prozentpunkte höher.

Bewertung: Differenzmatrix 2 BE, Deutung 1 BE.

### b) Gewichtete Modellmischung (4 BE)

$$
P=\frac34M+\frac14N
=\begin{pmatrix}
0{,}91 & 0{,}0625\\
0{,}09 & 0{,}9375
\end{pmatrix}.
$$

Alle Einträge sind nichtnegativ und beide Spaltensummen sind 1. Somit ist $P$ eine stochastische Übergangsmatrix. $P$ ist die eintragsweise gewichtete Kombination des Basismodells $M$ mit Gewicht $75\,\%$ und des Alternativmodells $N$ mit Gewicht $25\,\%$. Eine sachlich gleichwertige Beschreibung der Sensitivitätsmischung ist ebenfalls korrekt.

Bewertung: Matrix $P$ 2 BE, Stochastikprüfung 1 BE, Mischungsdeutung 1 BE.

### c) Tabellenkalkulation (3 BE)

- In `H2`: `=E2-B2`; die Formel ist nach `H2:I3` kopierbar.
- In `K2`: `=0,75*B2+0,25*E2`; die Formel ist nach `K2:L3` kopierbar. Eine für die verwendete Tabellenkalkulation gültige Dezimalpunktschreibweise ist ebenfalls korrekt.
- `F3` enthält $0{,}90$: Im alternativen Modell bleiben $90\,\%$ der aus B kommenden Personen im Folgejahr in B.

Bewertung: Formeln 2 BE, Deutung 1 BE.

## 4. Rückwärtsrechnung (12 BE)

### a) Inverse Matrix (5 BE)

$$
\det(M)=0{,}92\cdot0{,}95-0{,}05\cdot0{,}08=0{,}87\ne0.
$$

Damit ist $M$ invertierbar und

$$
M^{-1}
=\frac1{0{,}87}
\begin{pmatrix}
0{,}95 & -0{,}05\\
-0{,}08 & 0{,}92
\end{pmatrix}
=\begin{pmatrix}
\frac{95}{87} & -\frac5{87}\\
-\frac8{87} & \frac{92}{87}
\end{pmatrix}.
$$

Direkte Multiplikation ergibt

$$
MM^{-1}=M^{-1}M=I_2.
$$

Bewertung: Determinante und Existenz 1 BE, Inverse 2 BE, Produktprüfung 2 BE.

### b) Vorgänger, Zulässigkeit und Eindeutigkeit (7 BE)

Für den ersten Zustand gilt

$$
\vec u_n=M^{-1}\vec u_{n+1}
=\begin{pmatrix}12\,000\\6\,000\end{pmatrix}.
$$

Beide Komponenten sind nichtnegativ und ihre Summe ist $18\,000$; der Vorgänger ist daher zulässig.

Für den zweiten Zustand gilt

$$
\vec w_n=M^{-1}\vec w_{n+1}
=\begin{pmatrix}19\,000\\-1\,000\end{pmatrix}.
$$

Die Summe ist zwar $18\,000$, wegen der negativen B-Komponente ist dieser Vorgänger aber unzulässig. Weil $\det(M)\ne0$, ist die algebraische Lösung in beiden Fällen eindeutig. Zu $\vec w_{n+1}$ existiert deshalb kein anderer zulässiger unmittelbarer Vorgänger.

Bewertung: $\vec u_n$ 2 BE, Zulässigkeit von $\vec u_n$ 1 BE, $\vec w_n$ 2 BE, Unzulässigkeit von $\vec w_n$ 1 BE, gemeinsame Eindeutigkeitsfolgerung 1 BE.

## 5. Stabiler Zustand (8 BE)

Aus $M\vec v=\vec v$ folgt beispielsweise

$$
-0{,}08v_A+0{,}05v_B=0,
$$

also

$$
v_B=1{,}6v_A=\frac85v_A.
$$

Zusammen mit $v_A+v_B=18\,000$ erhält man

$$
\vec v
=\begin{pmatrix}\frac{90\,000}{13}\\[2pt]\frac{144\,000}{13}\end{pmatrix}
\approx\begin{pmatrix}6\,923\\11\,077\end{pmatrix}.
$$

„Stabil“ bedeutet: Startet das Modell in genau dieser Verteilung, bleibt die Verteilung nach jedem weiteren Jahresübergang unverändert. Eine darüber hinausgehende Langzeitkonvergenz ist für diese Deutung nicht vorausgesetzt.

Bewertung: Gleichungssystem und Normierung 1 BE, Verhältnis 2 BE, Lösung 2 BE, exakte und gerundete Angabe 1 BE, Stabilitätsdeutung 2 BE.

## Gesamtbewertung

| Aufgabe | BE |
|---|---:|
| 1. Modellierung | 10 |
| 2. Vorwärtsentwicklung und Matrixprodukt | 10 |
| 3. Vergleich eines zweiten Modells | 10 |
| 4. Rückwärtsrechnung | 12 |
| 5. Stabiler Zustand | 8 |
| **Gesamt** | **50** |

Bestanden ab 25 BE.
