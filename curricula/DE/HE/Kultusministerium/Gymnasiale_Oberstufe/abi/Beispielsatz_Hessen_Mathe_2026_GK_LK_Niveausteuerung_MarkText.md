# Landesabitur Mathematik – Beispielsatz (Hessen) 2026 – **GK & LK (Version „Niveausteuerung“)**
*(auf Basis deines KC‑Skill‑Graphs + Exam-Spec; Fokus: mehr Entscheidungspunkte, weniger Kochrezept-Scaffolding)*

> **Hinweis zur Nutzung:** Dieser Beispielsatz ist so formuliert, dass Lehrkräfte Aufgaben **gezielt hoch-/runterregeln** können.  
> Dazu gibt es am Ende eine **Niveau-Tabelle** mit Stellschrauben (Entscheidungspunkte, Begründung, Modellierung, Tool-Anteil).

---

## Allgemeine Hinweise (für beide Niveaus)

- **Teil 1 (hilfsmittelfrei):** Wörterbuch deutsche Rechtschreibung, Operatorenliste.
- **Teil 2 (mit Hilfsmitteln):** zusätzlich WTR/CAS + Formelsammlung.
- **Dokumentation:** Wenn Ergebnisse mit dem Tool bestimmt werden, sind **Eingabe/Output** und eine **kurze Begründung** (Plausibilität/Interpretation) anzugeben.  
  Reiner „Rechnerausdruck“ ohne Erläuterung wird nicht voll gewertet.

---

# A) Grundkurs (GK) – Beispielklausur

## GK – Prüfungsteil 1 (hilfsmittelfrei) – Vorschlag A
**Gesamt:** 25 BE (5 Aufgaben × 5 BE)

### Auswahlmodus (GK)
- **Pflicht:** A1–A3 (Niveau 1) bearbeiten.
- **Wahl Niveau 1:** genau **eine** aus A4–A6.
- **Wahl Niveau 2:** genau **eine** aus A7–A9.

---

### Pflichtaufgaben (Niveau 1) – alle bearbeiten

#### **A1 (Analysis, Niveau 1) – 5 BE**
Gegeben ist $f(x)=x^3-3x^2-4$.

1. Bestimmen Sie die **Tangente** an $f$ im Punkt mit $x=2$. (4 BE)  
2. Deuten Sie die **Steigung** der Tangente im Kontext „Änderungsrate“ in **einem Satz**. (1 BE)

*(Hinweis: Keine Teilaufgabe „erst ableiten“ – der Lösungsweg soll selbst strukturiert werden.)*

---

#### **A2 (Lineare Algebra/Analytische Geometrie, Niveau 1) – 5 BE**
Gegeben sind $A(1,2,0)$, $B(5,4,2)$, $C(3,0,4)$.

1. Prüfen Sie, ob das Dreieck $ABC$ bei $B$ **rechtwinklig** ist. Begründen Sie rechnerisch. (4 BE)  
2. Geben Sie die Länge $|\overrightarrow{BA}|$ an. (1 BE)

---

#### **A3 (Stochastik, Niveau 1) – 5 BE**
In einer Jahrgangsstufe wählen 40 % Französisch (F) und 60 % Spanisch (S).  
Von den Französischlernenden nehmen 30 % an einer Förderstunde teil (T), von den Spanischlernenden 10 %.

1. Bestimmen Sie $P(T)$. (3 BE)  
2. Bestimmen Sie $P(F\mid T)$. (2 BE)

---

### Wahlaufgaben (Niveau 1) – genau **eine** wählen

#### **A4 (Analysis, Niveau 1) – 5 BE**
Bestimmen Sie den **orientierten Flächeninhalt**:

$$
\int_{0}^{3} (2x-3)\,dx
$$

Deuten Sie das Ergebnis als „Bestandsänderung“ in einem kurzen Satz.  

---

#### **A5 (Lineare Algebra/Analytische Geometrie, Niveau 1) – 5 BE**
Gegeben ist die Ebene $E: x+2y-2z=4$.

1. Bestimmen Sie einen **Normalenvektor** der Ebene. (2 BE)  
2. Entscheiden Sie, ob $P(2,1,0)$ auf $E$ liegt, und begründen Sie. (3 BE)

---

#### **A6 (Stochastik, Niveau 1) – 5 BE**
Ein Würfel wird 3‑mal geworfen. $X$ sei die Anzahl der „Sechsen“.

1. Geben Sie Verteilung und Parameter von $X$ an. (2 BE)  
2. Bestimmen Sie $P(X\ge 1)$. (3 BE)

---

### Wahlaufgaben (Niveau 2) – genau **eine** wählen

#### **A7 (Analysis, Niveau 2) – 5 BE**
An einer geraden Mauer soll mit insgesamt **30 m Zaun** ein rechteckiger Bereich eingezäunt werden (es werden nur **3 Seiten** eingezäunt, die Mauer bildet die vierte Seite).

Bestimmen Sie die **Maße**, für die die Fläche maximal ist, und begründen Sie kurz, warum es ein Maximum ist.

---

#### **A8 (Lineare Algebra/Analytische Geometrie, Niveau 2) – 5 BE**
Gegeben sind
$$
g:\ \vec x=\begin{pmatrix}1\\0\\2\end{pmatrix}+t\begin{pmatrix}2\\1\\0\end{pmatrix},\qquad
h:\ \vec x=\begin{pmatrix}3\\2\\1\end{pmatrix}+s\begin{pmatrix}1\\0\\1\end{pmatrix}.
$$

1. Untersuchen Sie die **Lagebeziehung** von $g$ und $h$. (3 BE)  
2. Bestimmen Sie den **Winkel** zwischen den Richtungsvektoren. (2 BE)

*(Entscheidungspunkt: Erst Lage klären; Winkel ist unabhängig davon berechenbar.)*

---

#### **A9 (Stochastik, Niveau 2) – 5 BE**
Es gilt $P(A)=0{,}4$, $P(B)=0{,}5$, $P(A\cap B)=0{,}3$.

1. Prüfen Sie, ob $A$ und $B$ **unabhängig** sind. (3 BE)  
2. Bestimmen und deuten Sie $P(A\mid B)$. (2 BE)

---

## GK – Prüfungsteil 2 (mit Hilfsmitteln) – Vorschläge B/C/D
**Gesamt:** 55 BE  
Zu bearbeiten: **genau eine** Analysis‑Aufgabe (B1 oder B2), sowie **C** und **D**.

---

### **B1 (Analysis, 25 BE) – Wahl**
Ein Zufluss (in $\mathrm{m^3/h}$) in ein Becken werde modelliert durch
$$
r(t)=a\cdot t\cdot e^{-0{,}4t}\quad (t\ge 0).
$$
Für $t=1$ wird $r(1)=4$ gemessen. Anfangsbestand: $B(0)=3\ \mathrm{m^3}$.

1. Bestimmen Sie $a$. (3 BE)  
2. Bestimmen Sie eine Bestandsfunktion $B(t)$ und vereinfachen Sie. (6 BE)  
3. Bestimmen Sie den Zeitpunkt, an dem $r(t)$ maximal ist, und interpretieren Sie. (6 BE)  
4. Bestimmen Sie $\lim_{t\to\infty} r(t)$ und deuten Sie. (3 BE)  
5. **WTR/CAS:** Bestimmen Sie näherungsweise $t$ mit $B(t)=25$.  
   Dokumentation: Gleichung + Tool‑Schritte + kurze Plausibilitätsprüfung. (7 BE)

---

### **B2 (Analysis, 25 BE) – Wahl**
Gegeben ist $f(x)= (x+1)\,e^{-0{,}5x}$ für $x\ge 0$.

1. Bestimmen Sie den Ort des Maximums von $f$. (6 BE)  
2. Berechnen Sie den maximalen Funktionswert. (3 BE)  
3. Bestimmen Sie die Fläche $\int_{0}^{6} f(x)\,dx$. (6 BE)  
4. Bestimmen Sie $\lim_{x\to\infty} f(x)$ und deuten Sie. (3 BE)  
5. **WTR/CAS:** Bestimmen Sie $x$ mit $\int_0^x f(t)\,dt = 2{,}0$.  
   Dokumentation: Eingabe/Output + Ergebnisprüfung (z. B. Rückcheck). (7 BE)

---

### **C (LA/AG, 15 BE) – Pflicht**
Gegeben sind $A(1,2,0)$, $B(5,2,2)$, $C(1,6,2)$. Ebene $E$ geht durch $A,B,C$.

1. Bestimmen Sie eine Koordinatenform von $E$. (5 BE)  
2. Prüfen Sie, ob $P(3,4,1)$ in $E$ liegt. (2 BE)  
3. Bestimmen Sie den Winkel zwischen der Geraden $g$ und der Ebene $E$. (4 BE)  

$$
g:\ \vec x=\begin{pmatrix}1\\2\\5\end{pmatrix}+s\begin{pmatrix}2\\0\\-1\end{pmatrix}
$$

4. Bestimmen Sie den Abstand von $P$ zur Ebene $E$. (4 BE)

---

### **D (Stochastik, 15 BE) – Pflicht**
Ein Hersteller behauptet: „Der Ausschussanteil ist höchstens $p=0{,}03$.“  
Stichprobe: $n=200$, beobachtet $x=11$ Ausschussteile.

1. Formulieren Sie $H_0$, $H_1$ (einseitig) und das Modell $X$. (3 BE)  
2. **WTR/CAS:** Bestimmen Sie den Ablehnungsbereich zum Niveau $\alpha=5\%$.  
   Dokumentation: verwendete Funktion, Parameter, Ergebnis. (6 BE)  
3. Treffen Sie die Testentscheidung für $x=11$ und formulieren Sie das Ergebnis im Kontext. (4 BE)  
4. **Inverse Idee:** Vergleichen Sie für $p=0{,}03$ die Breite eines groben 95%-Prognoseintervalls (Sigma‑Regel/Normalapprox.) der relativen Häufigkeit für $n=200$ und $n=800$.  
   Eine kurze Tool‑gestützte Rechnung + ein Satz Interpretation. (2 BE)

---

---

# B) Leistungskurs (LK) – Beispielklausur

## LK – Prüfungsteil 1 (hilfsmittelfrei) – Vorschlag A
**Gesamt:** 30 BE (6 Aufgaben × 5 BE)

### Auswahlmodus (LK)
- **Pflicht:** A1–A4 (Niveau 1) bearbeiten.
- **Wahl Niveau 2:** genau **zwei** aus A5–A10.

---

### Pflichtaufgaben (Niveau 1) – alle bearbeiten

#### **A1 (Analysis, Niveau 1) – 5 BE**
Gegeben ist $f(x)=x^3-2x$.  
Bestimmen Sie die **Tangente** an $f$ im Punkt mit $x=1$.

---

#### **A2 (Analysis, Niveau 1) – 5 BE**
Bestimmen Sie:

$$
\int_{0}^{2} (3x^2-4x+1)\,dx
$$

---

#### **A3 (LA/AG, Niveau 1) – 5 BE**
Gegeben sind:

$$
g:\ \vec x=\begin{pmatrix}1\\0\\2\end{pmatrix}+t\begin{pmatrix}1\\2\\-1\end{pmatrix},\quad
h:\ \vec x=\begin{pmatrix}2\\1\\0\end{pmatrix}+s\begin{pmatrix}2\\4\\-2\end{pmatrix}.
$$

Bestimmen Sie den **Abstand** der Geraden $g$ und $h$.  
*(Hinweis: Vorab klären, warum „Abstand paralleler Geraden“ hier sinnvoll ist.)*

---

#### **A4 (Stochastik, Niveau 1) – 5 BE**
Ein Test hat Sensitivität $0{,}95$ und Spezifität $0{,}90$. In einer Population sind $2\%$ krank.

1. Bestimmen Sie $P(\text{positiv})$. (3 BE)  
2. Bestimmen Sie $P(\text{krank}\mid \text{positiv})$. (2 BE)

---

### Wahlaufgaben (Niveau 2) – genau **zwei** wählen

#### **A5 (Analysis, Niveau 2) – 5 BE**
Untersuchen Sie den Grenzwert:

$$
\lim_{x\to\infty} x\left(\ln(x+1)-\ln(x)\right)
$$

Deuten Sie das Ergebnis als Aussage über das Wachstumsverhalten von $\ln(x)$.

*(Mehrschrittig: Umformen → Grenzwerttechnik → Interpretation.)*

---

#### **A6 (Analysis, Niveau 2) – 5 BE**
Gegeben ist $p(x)=x^2-4x+3$.

Bestimmen Sie den **Flächeninhalt**, den der Graph von $p$ mit der $x$-Achse im Intervall $[0,4]$ einschließt.

*(Entscheidungspunkt: Nullstellen/Zeichenwechsel → Integral ggf. stückeln.)*

---

#### **A7 (LA/AG, Niveau 2) – 5 BE**
Bestimmen Sie eine Ebene $E$, die die Gerade $g$ enthält und durch den Punkt $P(3,1,1)$ verläuft:

$$
g:\ \vec x=\begin{pmatrix}1\\2\\0\end{pmatrix}+t\begin{pmatrix}1\\0\\2\end{pmatrix}
$$

Berechnen Sie anschließend den **Winkel** zwischen $E$ und der Ebene $F: x-2y+z=5$.

*(Entscheidungspunkt: geeignete Ebenenform wählen; Winkel via Normalen.)*

---

#### **A8 (LA/Übergangsprozess, Niveau 2) – 5 BE**
Ein Übergangsprozess besitzt die (spaltenstochastische) Matrix:

$$
M=\begin{pmatrix}0{,}7&0{,}2\\0{,}3&0{,}8\end{pmatrix}
$$

Es gilt $v_{n+1}=Mv_n$.

1. Bestimmen Sie einen Fixvektor $v$ mit $Mv=v$ und $v_1+v_2=1$. (3 BE)  
2. Begründen Sie in einem Satz, was $v$ im Kontext bedeutet. (2 BE)

---

#### **A9 (Stochastik, Niveau 2) – 5 BE**
Eine Firma behauptet, der Anteil zufriedener Kund:innen sei mindestens $p=0{,}6$.  
In einer Stichprobe $n=25$ sind $x=12$ zufrieden.

1. Formulieren Sie $H_0$ und $H_1$ (einseitig) und begründen Sie die Richtung. (3 BE)  
2. Entscheiden Sie **ohne Rechner** plausibel, ob das Ergebnis eher gegen $H_0$ spricht, und begründen Sie kurz (z. B. Vergleich mit Erwartungswert/Streuung). (2 BE)

*(AB3‑Element: begründete Plausibilitätsentscheidung statt nur rechnen.)*

---

#### **A10 (Stochastik/Argumentieren, Niveau 2) – 5 BE**
Behauptung: „Wenn zwei Ereignisse die gleiche Wahrscheinlichkeit haben, sind sie unabhängig.“

Widerlegen Sie die Behauptung durch ein Gegenbeispiel.  
Ihre Lösung soll enthalten: Ereignisse, Wahrscheinlichkeiten, und den Nachweis „nicht unabhängig“.

---

## LK – Prüfungsteil 2 (mit Hilfsmitteln) – Vorschläge B/C/D
**Gesamt:** 70 BE  
Zu bearbeiten: **genau eine** Analysis‑Aufgabe (B1 oder B2), sowie **C** und **D**.

---

### **B1 (Analysis, 30 BE) – Wahl**
Gegeben ist $f(x)=(x^2+1)\,e^{-0{,}5x}$ für $x\ge 0$.

1. Bestimmen Sie alle Extremstellen von $f$ und klassifizieren Sie sie. (8 BE)  
2. Bestimmen Sie $\lim_{x\to\infty} f(x)$ und deuten Sie das Graphverhalten. (4 BE)  
3. Berechnen Sie
$$
A=\int_{0}^{6} f(x)\,dx.
$$
   **Hinweis:** Zeigen Sie an geeigneter Stelle, dass Sie eine LK‑Integrationsmethode gezielt wählen (z. B. Formansatz oder partielle Integration). (8 BE)  
4. Gegeben ist die Schar $f_a(x)=(x^2+1)e^{-ax}$ mit $a>0$.  
   Bestimmen Sie $a$, so dass das Maximum von $f_a$ bei $x=4$ liegt. (5 BE)  
5. **WTR/CAS:** Bestimmen Sie näherungsweise $x$ mit
$$
\int_0^x f(t)\,dt=3{,}0.
$$
   Dokumentation: Eingaben, Output, Plausibilitätscheck. (5 BE)

---

### **B2 (Analysis – logistisches Wachstum, 30 BE) – Wahl**
Eine Population wird durch die folgende Funktion modelliert:

$$
N(t)=\frac{K}{1+c\,e^{-rt}}\qquad (K>0,\ r>0,\ c>0)
$$

Gegeben seien $K=1000$, $N(0)=100$ und $N(5)=300$.

1. Bestimmen Sie $c$. (3 BE)  
2. Bestimmen Sie $r$ (ggf. mithilfe von Logarithmen; Tool ist erlaubt, aber dokumentieren). (6 BE)  
3. Zeigen Sie: Die Wachstumsrate $N'(t)$ ist genau dann maximal, wenn $N(t)=\frac{K}{2}$ gilt. (8 BE)  
4. Bestimmen Sie den Zeitpunkt $t$, zu dem $N(t)=900$ erreicht ist. **WTR/CAS** mit Dokumentation. (6 BE)  
5. Vergleichen Sie qualitativ das Langzeitverhalten des logistischen Modells mit einem exponentiellen Modell $E(t)=E_0\cdot a^t$. (4 BE)  
6. Nennen Sie zwei Modellgrenzen/Annahmen des logistischen Modells im Kontext. (3 BE)

---

### **C (LA/AG + Übergangsprozess, 20 BE) – Pflicht**

**Teil I: Raumgeometrie**

Gegeben sind $A(1,2,0)$, $B(5,2,2)$, $C(1,6,2)$. Ebene $E$ geht durch $A,B,C$.

1. Bestimmen Sie eine Koordinatenform von $E$. (4 BE)  
2. Gegeben ist
$$
g:\ \vec x=\begin{pmatrix}1\\2\\5\end{pmatrix}+s\begin{pmatrix}2\\0\\-1\end{pmatrix}.
$$
   Untersuchen Sie die Lage von $g$ zu $E$ und bestimmen Sie ggf. den Schnittpunkt. (6 BE)  
3. Bestimmen Sie den Winkel zwischen $g$ und $E$. (4 BE)

**Teil II: Langfristige Entwicklung (Markov, LK)**

Ein Prozess besitzt (spaltenstochastisch) die Matrix:

$$
M=\begin{pmatrix}
0{,}85&0{,}30\\
0{,}15&0{,}70
\end{pmatrix}
$$

Es gilt $v_{n+1}=Mv_n$.

4. Bestimmen Sie einen Fixvektor $v$ und interpretieren Sie ihn. (4 BE)  
5. **WTR/CAS:** Bestimmen Sie $v_{10}$ für $v_0=\binom{1}{0}$ und vergleichen Sie $v_{10}$ mit $v$ (ein Satz Interpretation). (2 BE)

---

### **D (Stochastik, 20 BE) – Pflicht**
Ein Hersteller behauptet: „Der Ausschussanteil liegt bei höchstens $p=0{,}03$.“  
Stichprobe: $n=200$, beobachtet $x=11$.

1. Formulieren Sie $H_0$, $H_1$ (einseitig) und das Modell $X$. (3 BE)  
2. **WTR/CAS:** Bestimmen Sie den Ablehnungsbereich für $\alpha=5\%$. Dokumentation Pflicht. (6 BE)  
3. Triff die Testentscheidung und formuliere das Ergebnis im Kontext. (4 BE)  
4. Erklären Sie Fehler 1. und 2. Art in diesem Kontext (je ein Satz). (4 BE)  
5. **Normalverteilung inkl. inverse Fragestellung (WTR/CAS):**  
   $Y\sim\mathcal N(\mu=50,\sigma=4)$. Bestimmen Sie $P(46\le Y\le 58)$ und $c$ mit $P(Y\le c)=0{,}95$.  
   Dokumentation + kurzer Plausibilitätscheck (z. B. Lage zu $\mu$). (3 BE)

---

# C) Niveau-/Komplexitäts-Tabelle (für Lehrkräfte)

**Leseschlüssel (0–2):**
- **Entscheidungspunkte (E):** 0 = Methode offensichtlich / geführt; 1 = ein echter Wahl-/Planungspunkt; 2 = mehrere.  
- **Mehrschrittigkeit (M):** 0 = 1–2 Schritte; 1 = 3–5 Schritte; 2 = >5 Schritte bzw. verzweigt.  
- **Begründung/Reflexion (B):** 0 = keine; 1 = kurzer Begründungssatz; 2 = explizite Argumentation/Absicherung.  
- **Modellierung/Interpretation (Mo):** 0 = rein formal; 1 = leichte Kontextdeutung; 2 = Modellannahmen/Validierung/vergleich.  
- **Tool-Anteil (T):** 0 = ohne; 1 = optional/sinnvoll; 2 = erforderlich + Dokumentation.

> **Stellschrauben („Tuning“):** typische Maßnahmen, um eine Aufgabe **hoch** (↑) oder **runter** (↓) zu regeln.

| Kurs | Teil | Aufgabe | Domäne | Niveau | Ziel-AB | E | M | B | Mo | T | Prozess-Fokus (K) | Tuning-Hinweise |
|---|---|---|---|---:|---|---:|---:|---:|---:|---:|---|---|
| GK | 1 | A1 | Analysis | 1 | AB1–2 | 1 | 1 | 1 | 1 | 0 | K2.1, K5.2 | ↑: Punkt nicht vorgeben; zusätzlich Plausibilität via Einsetzen. ↓: „erst ableiten“ als Teilaufgabe geben. |
| GK | 1 | A2 | LA/AG | 1 | AB1–2 | 1 | 1 | 1 | 0 | 0 | K3.3, K5.2 | ↑: zusätzlich Winkel/Fläche; ↓: nur Skalarprodukt ohne Begründung. |
| GK | 1 | A3 | Stoch | 1 | AB2 | 1 | 1 | 0 | 1 | 0 | K3.2, K6.2 | ↑: Vierfeldertafel selbst erstellen lassen. ↓: Baumdiagramm vorgeben. |
| GK | 1 | A4 | Analysis | 1 | AB1–2 | 0 | 0 | 1 | 1 | 0 | K5.2, K6.2 | ↑: Vorzeichenwechsel/„Fläche“ statt „orientiert“. |
| GK | 1 | A5 | LA/AG | 1 | AB1–2 | 0 | 0 | 1 | 0 | 0 | K5.2 | ↑: zusätzlich Abstand Punkt–Ebene. |
| GK | 1 | A6 | Stoch | 1 | AB1–2 | 0 | 0 | 0 | 0 | 0 | K5.2 | ↑: zusätzlich Erwartungswert deuten; ↓: nur P(X=1). |
| GK | 1 | A7 | Analysis | 2 | AB2 | 1 | 1 | 1 | 2 | 0 | K2.1–2.4, K3.2 | ↑: Nebenbedingung variieren/zweite Zaunseite; ↓: Zielfunktion vorgeben. |
| GK | 1 | A8 | LA/AG | 2 | AB2 | 1 | 1 | 0 | 0 | 0 | K2.1, K5.2 | ↑: Schnittpunkt bei „schneidend“ verlangen; ↓: nur Winkel. |
| GK | 1 | A9 | Stoch | 2 | AB2 | 1 | 1 | 1 | 1 | 0 | K1.2, K6.2 | ↑: „Beurteile Aussage“ (K1) ergänzen. |
| GK | 2 | B1 | Analysis | — | AB2 | 1 | 2 | 1 | 2 | 2 | K3.2–3.4, K5.3 | ↑: zusätzliche Modellvalidierung; ↓: a vorgeben. |
| GK | 2 | B2 | Analysis | — | AB2 | 1 | 2 | 1 | 1 | 2 | K2.3, K5.3 | ↑: Parameter aus Bedingung; ↓: nur Maximum + Integral. |
| GK | 2 | C | LA/AG | — | AB2 | 1 | 2 | 0 | 0 | 1 | K5.2, K4.2 | ↑: zusätzliche Lageentscheidung mit Begründung. |
| GK | 2 | D | Stoch | — | AB2 | 1 | 2 | 1 | 2 | 2 | K2.4, K6.2 | ↑: Fehler 1/2 ergänzen; ↓: inverse Teilaufgabe streichen. |
| LK | 1 | A1 | Analysis | 1 | AB1–2 | 1 | 1 | 0 | 0 | 0 | K5.2 | ↑: Tangente durch externen Punkt (Reverse Engineering). |
| LK | 1 | A2 | Analysis | 1 | AB1–2 | 0 | 0 | 0 | 0 | 0 | K5.2 | ↑: als Flächeninhalt mit Vorzeichenwechsel (→ Niveau 2). |
| LK | 1 | A3 | LA/AG | 1 | AB1–2 | 1 | 1 | 1 | 0 | 0 | K2.1, K5.2 | ↑: Abstand über Hilfsebene begründen; ↓: Parallelität vorgeben. |
| LK | 1 | A4 | Stoch | 1 | AB2 | 1 | 1 | 0 | 1 | 0 | K3.2, K6.2 | ↑: Sensitivität/Spezifität vertauschen lassen (Fehleranalyse). |
| LK | 1 | A5 | Analysis | 2 | AB2–3 | 1 | 1 | 1 | 1 | 0 | K2.2, K1.2 | ↑: zusätzlich asymptotische Näherung; ↓: Standard-Grenzwert ohne Faktor x. |
| LK | 1 | A6 | Analysis | 2 | AB2–3 | 1 | 1 | 1 | 0 | 0 | K2.1, K5.2 | ↑: Fläche zwischen zwei Graphen; ↓: orientiertes Integral geben. |
| LK | 1 | A7 | LA/AG | 2 | AB2–3 | 2 | 2 | 1 | 0 | 0 | K2.1–2.3 | ↑: zusätzlich Abstand Punkt–Ebene; ↓: Ebene in Parameterform vorgeben. |
| LK | 1 | A8 | LA/Markov | 2 | AB2 | 1 | 1 | 1 | 1 | 0 | K6.2, K3.3 | ↑: Stabilität/Einzigkeit diskutieren. |
| LK | 1 | A9 | Stoch | 2 | AB3 | 2 | 1 | 2 | 1 | 0 | K2.4, K1.2 | ↑: Teststärke qualitativ; ↓: Rechnerentscheidung statt plausibel. |
| LK | 1 | A10 | Stoch/K1 | 2 | AB2–3 | 1 | 1 | 2 | 0 | 0 | K1.2–1.4 | ↑: „Geltungsbereich“ ergänzen (Quantoren). |
| LK | 2 | B1 | Analysis | — | AB3 | 2 | 2 | 2 | 1 | 2 | K5.2, K2.4 | ↑: Methodenauswahl begründen; ↓: CAS‑Integral ohne Handteil zulassen. |
| LK | 2 | B2 | Analysis | — | AB3 | 2 | 2 | 2 | 2 | 2 | K3.4, K2.4 | ↑: Modellvergleich quantitativ (Fit an zwei Punkten). |
| LK | 2 | C | LA/AG+Markov | — | AB3 | 2 | 2 | 1 | 1 | 2 | K2.4, K6.2 | ↑: Grenzmatrix/Begründung; ↓: nur Fixvektor ohne Vergleich. |
| LK | 2 | D | Stoch | — | AB3 | 2 | 2 | 2 | 2 | 2 | K2.4, K6.2 | ↑: n‑Planung (CI‑Breite) ergänzen; ↓: Teil 5 streichen. |

---

## Hinweise für „Niveau fein einstellen“ (Kurzliste)

- **Scaffolding reduzieren (↑):** Teilaufgaben „Ableitung/Einsetzen“ entfernen → nur Zielprodukt fragen.
- **Reverse Engineering (↑):** „Bestimme Parameter so, dass …“ statt „berechne Extremstelle“.
- **Eindeutigkeit/Existenz (↑):** „Zeige: genau eine Lösung“ oder „begründe Maximum“.
- **Validierung (↑):** Plausibilitätscheck (Einheiten, Grenzfall, Einsetzen), Modellgrenzen.
- **Runterregeln (↓):** Zwischenziele vorgeben, Zahlen vereinfachen, Entscheidungspunkte streichen.
