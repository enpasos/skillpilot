# Übergangsprozesse zwischen zwei Städten – Q2-Masteraufgabe (GK)

- Version: `v2`
- Profil: Grundkurs
- Assessment-Ziel: `57aff94e-91b8-5cc6-9f85-3f317ecf36ca`
- Maximalpunktzahl: 50 BE
- Bestehensgrenze: 25 BE

Alle Zustände werden als Spaltenvektoren in der Reihenfolge $(A,B)$ notiert; es gilt

$$
\vec x_{n+1}=M\vec x_n.
$$

Gleichwertige mathematisch korrekte Verfahren sind in allen Teilaufgaben zulässig.

## Ausgangssituation

In einer Region leben zu Beginn eines Jahres $10\,000$ Personen in Stadt A und $8\,000$ Personen in Stadt B. Von Jahr zu Jahr wechseln $8\,\%$ der in A lebenden Personen nach B; $5\,\%$ der in B lebenden Personen wechseln nach A. Die Übergangsraten bleiben zunächst konstant.

## 1. Modellierung (10 BE)

a) Zeichnen Sie einen vollständigen Zustands-/Übergangsgraphen mit allen vier Übergängen und den zugehörigen Wahrscheinlichkeiten. (4 BE)

b) Geben Sie den Anfangszustand $\vec x_0$ und die Übergangsmatrix $M$ an. Machen Sie Zeilen-/Spaltenreihenfolge und Rechenkonvention kenntlich. (4 BE)

c) Deuten Sie die Matrixeinträge $m_{12}$ und $m_{21}$ im Sachzusammenhang. (2 BE)

## 2. Vorwärtsentwicklung und Matrixprodukt (10 BE)

a) Bestimmen Sie $\vec x_1$ und $\vec x_2$. (4 BE)

b) Deuten Sie $\vec x_2$ im Kontext und begründen Sie, weshalb die Gesamtzahl von $18\,000$ Personen im Modell erhalten bleibt. (2 BE)

c) Bestimmen Sie $M^2$. Begründen Sie, weshalb das Produkt in dieser Reihenfolge definiert und sachgerecht ist, und deuten Sie den Eintrag $(M^2)_{21}$. (4 BE)

## 3. Vergleich eines zweiten Modells (10 BE)

Ein alternatives Szenario wird durch

$$
N=\begin{pmatrix}
0{,}88 & 0{,}10\\
0{,}12 & 0{,}90
\end{pmatrix}
$$

beschrieben. Es gilt dieselbe Konvention wie für $M$.

a) Berechnen Sie $D=N-M$ und deuten Sie $d_{21}$. (3 BE)

b) Für eine Sensitivitätsanalyse wird

$$
P=\frac34M+\frac14N
$$

verwendet. Berechnen Sie $P$, prüfen Sie, ob $P$ eine stochastische Übergangsmatrix ist, und erläutern Sie die Bedeutung dieser gewichteten Modellmischung. (4 BE)

c) In einer Tabellenkalkulation stehen $M$ in `B2:C3`, $N$ in `E2:F3`, $D$ in `H2:I3` und $P$ in `K2:L3`; Zeilen bezeichnen Zielstädte, Spalten Ausgangsstädte. Geben Sie je eine kopierbare Formel für `H2` und `K2` an und deuten Sie den Zellinhalt `F3` im Kontext. (3 BE)

## 4. Rückwärtsrechnung (12 BE)

a) Bestimmen Sie $M^{-1}$ mit einem geeigneten Verfahren und prüfen Sie Ihr Ergebnis durch Multiplikation. (5 BE)

b) Beobachtet wurden

$$
\vec u_{n+1}=\begin{pmatrix}11\,340\\6\,660\end{pmatrix}
\qquad\text{und}\qquad
\vec w_{n+1}=\begin{pmatrix}17\,430\\570\end{pmatrix}.
$$

Bestimmen Sie jeweils den rechnerisch möglichen unmittelbaren Vorgänger. Beurteilen Sie Zulässigkeit und Eindeutigkeit beider Vorgänger und begründen Sie. (7 BE)

## 5. Stabiler Zustand (8 BE)

Bestimmen Sie einen Fixvektor $\vec v$ mit $M\vec v=\vec v$ und $v_A+v_B=18\,000$. Geben Sie das Ergebnis exakt und auf ganze Personen gerundet an und erläutern Sie, was „stabil“ hier bedeutet. (8 BE)
