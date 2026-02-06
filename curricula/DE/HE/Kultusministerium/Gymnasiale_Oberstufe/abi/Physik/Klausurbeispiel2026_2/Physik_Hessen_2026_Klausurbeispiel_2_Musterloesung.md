# Landesabitur Physik (Hessen) 2026 - SkillPilot Klausurbeispiel 2 (Musterloesung, Entwurf)

Bezug zur Aufgabenfassung: `Physik_Hessen_2026_Klausurbeispiel_2.md`

## Bewertungsgrundsaetze

- Rundungsabweichungen im ueblichen Rahmen sind zu akzeptieren.
- Fachlich korrekte alternative Loesungswege sind gleichwertig zu bewerten.
- Bei Folgefehlern: kein Doppelabzug, sofern der Folgeweg methodisch korrekt ist.
- Wo gefordert, sind physikalische Deutung und Bewertung explizit zu bepunkten.
- Sinnvolle Rundung entsprechend der signifikanten Stellen der Eingangsgrößen wird erwartet (in der Regel 2 bis 3 signifikante Stellen).

---

## A) Grundkurs (GK)

### Vorschlag A (GK) - 25 BE

1. Feldstaerke:

$$
E = \frac{U}{d} = \frac{1800 \, V}{0{,}0050 \, m} = 3{,}6 \cdot 10^5 \, V/m
$$

Potenzieller Energiezuwachs:

$$
\Delta E_{pot} = q E s = e \cdot 3{,}6 \cdot 10^5 \cdot 0{,}030 \approx 1{,}73 \cdot 10^{-15} \, J \approx 10{,}8 \, keV
$$

**7 BE**

2. Lineare Naeherung (z. B. Regression):

$$
B(I) \approx 13{,}8 \, \frac{mT}{A} \cdot I + 0{,}19 \, mT
$$

Bei $I = 1{,}6 \, A$:

$$
B(1{,}6) \approx 22{,}27 \, mT
$$

**6 BE**

3. Induktion (linearer Verlauf):

$$
U_{ind} = A_S \cdot \left|\frac{\Delta B}{\Delta t}\right| = 0{,}030 \cdot \frac{0{,}022-0{,}004}{0{,}09} = 0{,}0060 \, V = 6{,}0 \, mV
$$

Lenz-Deutung: Da der magnetische Fluss zunimmt, wirkt der Induktionsstrom so, dass das von ihm erzeugte Feld der Flusszunahme entgegenwirkt.

**7 BE**

4. Bei Zeitabweichungen:

- $t = 0{,}09 \cdot 0{,}92 = 0{,}0828 \, s \Rightarrow U_{ind} \approx 6{,}52 \, mV$
- $t = 0{,}09 \cdot 1{,}08 = 0{,}0972 \, s \Rightarrow U_{ind} \approx 5{,}56 \, mV$

Beide Werte liegen ueber $5{,}0 \, mV$ -> Ausloesung robust.

**5 BE**

---

### Vorschlag B (GK) - 25 BE

1. Aus Material 1: Eine volle Periode von $0$ bis $1{,}6 \, s$.

$$
T = 1{,}6 \, s, \qquad f = \frac{1}{T} = 0{,}625 \, Hz
$$

Moeglicher Ansatz (in cm):

$$
y(t) = 6 \sin\left(\frac{2\pi}{1{,}6} t\right)
$$

**6 BE**

2. Doppler (bewegte Quelle, ruhender Beobachter):

$$
f_{hin} = f_0 \frac{c}{c-v_S} = 680 \cdot \frac{340}{340-17} \approx 716 \, Hz
$$

$$
f_{weg} = f_0 \frac{c}{c+v_S} = 680 \cdot \frac{340}{340+17} \approx 648 \, Hz
$$

Deutung: Bei Annaeherung steigt, bei Entfernung sinkt die beobachtete Frequenz.

**6 BE**

3. Wellenlaengen:

$$
\lambda_1 = \frac{v_1}{f} = \frac{2{,}4}{3{,}0} = 0{,}80 \, m, \qquad
\lambda_2 = \frac{v_2}{f} = \frac{1{,}6}{3{,}0} = 0{,}533 \, m
$$

Brechung:

$$
\frac{\sin\alpha_2}{\sin\alpha_1} = \frac{v_2}{v_1}
\Rightarrow
\sin\alpha_2 = \frac{1{,}6}{2{,}4} \sin 40^\circ \approx 0{,}429
$$

$$
\alpha_2 \approx 25{,}4^\circ
$$

**8 BE**

4. Knotenabstand $d_K = 0{,}26 \, m$ bei stehender Welle:

$$
\lambda = 2 d_K = 0{,}52 \, m
$$

Vergleich mit Teilaufgabe 3: $0{,}52 \, m$ liegt nahe bei $\lambda_2 \approx 0{,}533 \, m$ -> konsistent im Messrahmen.

**5 BE**

---

### Vorschlag C (GK) - 25 BE

1. Photonenergie bei $\lambda_0 = 71{,}0 \, pm = 0{,}0710 \, nm$:

$$
E_\gamma = \frac{1240 \, eV \cdot nm}{0{,}0710 \, nm} \approx 1{,}75 \cdot 10^4 \, eV = 17{,}5 \, keV
$$

Photonenimpuls:

$$
p = \frac{h}{\lambda_0} = \frac{6{,}626 \cdot 10^{-34}}{71{,}0 \cdot 10^{-12}} \approx 9{,}33 \cdot 10^{-24} \, kg \, m/s
$$

**8 BE**

2. Bei $\theta=90^\circ$:

$$
\Delta \lambda = \lambda' - \lambda_0 = 73{,}4 - 71{,}0 = 2{,}4 \, pm
$$

Energieverlust des Photons:

$$
E_{ein} \approx 17{,}46 \, keV, \qquad
E_{streu} = \frac{1240}{0{,}0734} \approx 16{,}89 \, keV
$$

$$
\Delta E \approx 0{,}57 \, keV
$$

(Diese Energie geht naeherungsweise in kinetische Energie des Rueckstoss-Elektrons.)

**8 BE**

3. Energiestufenmodell: Elektronen koennen nur diskrete Energieniveaus einnehmen; Uebergaenge erzeugen/absorbieren Photonen mit $\Delta E = h f = hc/\lambda$.

Mit Material 2:

- $E_1 \rightarrow E_0$: $\Delta E = 5{,}1 \, eV \Rightarrow \lambda \approx 243 \, nm$ (passt zu $\lambda_a$)
- $E_2 \rightarrow E_0$: $\Delta E = 6{,}8 \, eV \Rightarrow \lambda \approx 182 \, nm$ (passt zu $\lambda_b$)
- $E_2 \rightarrow E_1$: $\Delta E = 1{,}7 \, eV \Rightarrow \lambda \approx 729 \, nm$ (passt zu $\lambda_c$)

**9 BE**

---

### Vorschlag D (GK) - 25 BE

1. Photonenergien:

$$
E = \frac{1240}{\lambda (nm)}
$$

- $656 \, nm \Rightarrow E \approx 1{,}89 \, eV$
- $486 \, nm \Rightarrow E \approx 2{,}55 \, eV$
- $434 \, nm \Rightarrow E \approx 2{,}86 \, eV$

**8 BE**

2. Mit

$$
\frac{1}{\lambda} = R_H\left(\frac{1}{4}-\frac{1}{n^2}\right)
$$

ergibt sich:

- $656 \, nm \Rightarrow n \approx 3$
- $486 \, nm \Rightarrow n \approx 4$
- $434 \, nm \Rightarrow n \approx 5$

Also Uebergaenge $3 \to 2$, $4 \to 2$, $5 \to 2$.

**7 BE**

3. Energiestufenmodell-Deutung: Die diskreten Linien folgen aus diskreten Energiedifferenzen zwischen zulaessigen Zustaenden; kontinuierliche Emission waere nur bei kontinuierlichem Energiespektrum zu erwarten, was hier nicht vorliegt.

**6 BE**

4. De-Broglie:

$$
\lambda = \frac{h}{\sqrt{2m_eE_{kin}}}, \quad E_{kin}=2{,}5 \, eV
$$

$$
\lambda \approx 7{,}76 \cdot 10^{-10} \, m = 0{,}776 \, nm
$$

Vergleich mit $0{,}30 \, nm$: gleiche Groessenordnung -> Welleneffekte an atomaren Strukturen sind plausibel.

**4 BE**

---

## B) Leistungskurs (LK)

### Vorschlag A (LK) - 30 BE

1. Feldstaerke:

$$
E = \frac{U}{d} = \frac{2700}{0{,}0045} = 6{,}0 \cdot 10^5 \, V/m
$$

Aus Material 2 (lineares Modell, Teilaufgabe 2): bei $I=1{,}9 \, A$ etwa $B \approx 26{,}17 \, mT$.

$$
v = \frac{E}{B} = \frac{6{,}0 \cdot 10^5}{2{,}617 \cdot 10^{-2}} \approx 2{,}29 \cdot 10^7 \, m/s
$$

**7 BE**

2. Regression z. B.:

$$
B(I) \approx 13{,}88 \, \frac{mT}{A} I - 0{,}20 \, mT
$$

Der letzte Messpunkt liegt nur leicht ueber dem Modellwert; das ist mit Messunsicherheit bzw. beginnender Nichtlinearitaet vereinbar.

**7 BE**

3. Idealer Transformator:

$$
U_{2,ideal} = U_1 \frac{N_2}{N_1} = 230 \cdot \frac{120}{800} = 34{,}5 \, V
$$

Vergleich:

$$
\text{Abweichung} = \frac{34{,}5 - 31{,}5}{34{,}5} \approx 8{,}7\%
$$

**7 BE**

4. Leistung und Wirkungsgrad:

$$
P_2 = U_2 I_2 = 31{,}5 \cdot 1{,}6 = 50{,}4 \, W
$$

$$
P_1 = U_1 I_1 = 230 \cdot 0{,}30 = 69{,}0 \, W
$$

$$
\eta = \frac{P_2}{P_1} \approx 0{,}730 \Rightarrow 73\%
$$

Deutung: Reale Verluste sind deutlich vorhanden, aber das System arbeitet noch effizient im typischen technischen Rahmen.

**6 BE**

5. Modellgrenzen: Streufluss, Kupferverluste, Kernverluste (Hysterese/Wirbelstroeme), Last- und Temperaturabhaengigkeit.

**3 BE**

---

### Vorschlag B (LK) - 30 BE

1. Logarithmisches Dekrement (z. B. ueber 4 Peaks):

$$
\delta = \frac{1}{3}\ln\left(\frac{A_1}{A_4}\right) = \frac{1}{3}\ln\left(\frac{14{,}0}{7{,}6}\right) \approx 0{,}204
$$

Interpretation: mittlere Daempfung pro Schwingungsperiode.

**7 BE**

2. Resonanz bei Maximum der Amplitude: $f_{res} \approx 1{,}8 \, Hz$.

Halbwertsbreite (hier naeherungsweise aus dem Bereich um halbe Maximalamplitude):

$$
\Delta f \approx 2{,}0 - 1{,}6 = 0{,}4 \, Hz
$$

$$
Q \approx \frac{f_{res}}{\Delta f} \approx \frac{1{,}8}{0{,}4} = 4{,}5
$$

**6 BE**

3. Modellgleichung:

$$
m y'' + b y' + D y = F_0 \sin(\omega t)
$$

- $m$: Traegheit, verschiebt Eigenfrequenz
- $D$: Rueckstellstaerke, bestimmt Eigenfrequenz
- $b$: Dissipation, beeinflusst Peakhoehe und Resonanzbreite

**6 BE**

4. Brechung:

$$
\frac{\sin\alpha_2}{\sin\alpha_1} = \frac{v_2}{v_1} = \frac{44}{68}
$$

$$
\sin\alpha_2 = \frac{44}{68}\sin 32^\circ \approx 0{,}343 \Rightarrow \alpha_2 \approx 20{,}1^\circ
$$

Erhoehte Daempfung reduziert Interferenzkontrast und damit die Auswertbarkeit feiner Muster.

**7 BE**

5. Schwebung:

$$
f_{Schwebung} = |f_2-f_1| = |50-47| = 3 \, Hz
$$

$$
T_{Schwebung} = \frac{1}{f_{Schwebung}} = 0{,}333 \, s
$$

Diagnostischer Nutzen: Schwebungen machen kleine Frequenzabweichungen sichtbar und eignen sich zur Zustandsueberwachung.

**4 BE**

---

### Vorschlag C (LK) - 30 BE

1. Gemessene Verschiebungen:

- bei $60^\circ$: $\Delta\lambda_{mess} = 72{,}2-71{,}0 = 1{,}2 \, pm$
- bei $90^\circ$: $\Delta\lambda_{mess} = 73{,}4-71{,}0 = 2{,}4 \, pm$

Theorie:

$$
\Delta\lambda = \lambda_C(1-\cos\theta)
$$

- $60^\circ$: $\Delta\lambda_{theo}=2{,}43(1-0{,}5)=1{,}215 \, pm$
- $90^\circ$: $\Delta\lambda_{theo}=2{,}43(1-0)=2{,}43 \, pm$

Messung und Theorie stimmen gut ueberein.

**8 BE**

2. Energiestufenmodell mit Uebergaengen in den Grundzustand:

- $E_1 \to E_0$: $\Delta E = 10{,}2 \, eV \Rightarrow \lambda \approx 121{,}6 \, nm$
- $E_2 \to E_0$: $\Delta E = 12{,}09 \, eV \Rightarrow \lambda \approx 102{,}6 \, nm$
- $E_3 \to E_0$: $\Delta E = 12{,}75 \, eV \Rightarrow \lambda \approx 97{,}3 \, nm$

Zwei sauber begruendete Uebergaenge genuegen.

**7 BE**

3. De-Broglie fuer $E_{kin}=6{,}0 \, eV$:

$$
\lambda = \frac{h}{\sqrt{2m_eE_{kin}}} \approx 5{,}01 \cdot 10^{-10} \, m = 0{,}501 \, nm
$$

Interpretation: atomare Gitterabstaende sind aehnlich gross -> Beugung/Interferenz ist zu erwarten.

**5 BE**

4. Linearisation mit $Y = \sqrt{f_{K\alpha}}$ (in Einheiten $10^9 \, Hz^{0{,}5}$):

- $Z=29 \Rightarrow Y \approx 1{,}432$
- $Z=31 \Rightarrow Y \approx 1{,}539$
- $Z=34 \Rightarrow Y \approx 1{,}700$

Lineares Modell:

$$
Y = aZ + c, \quad a \approx 0{,}0536, \quad c \approx -0{,}123
$$

Mit $Y \propto (Z-\sigma)$ folgt:

$$
\sigma = -\frac{c}{a} \approx 2{,}30
$$

**7 BE**

5. Modellgrenzen: kleine Datenbasis, effektive Abschirmung nicht streng konstant, Mehr-Elektronen- und relativistische Effekte vernachlaessigt.

**3 BE**

---

### Vorschlag D (LK) - 30 BE

1. Aus Beschleunigungsspannung:

$$
E_{max} = eU = 100 \, keV
$$

Aus Grenzwellenlaenge:

$$
E = \frac{1240 \, eV\,nm}{0{,}0128 \, nm} \approx 96{,}9 \, keV
$$

Abweichung:

$$
\frac{|100-96{,}9|}{100} \approx 3{,}1\%
$$

-> im Modellrahmen konsistent.

**6 BE**

2. Mit $I/I_0 = e^{-\mu d}$ (Regression auf $\ln(I/I_0)$):

- $\mu_{CFRP} \approx 0{,}060 \, mm^{-1}$
- $\mu_{Al} \approx 0{,}150 \, mm^{-1}$

Al schwaecht ca. $2{,}5$-mal staerker.

**7 BE**

3. Halbwertsdicken:

$$
d_{1/2} = \frac{\ln 2}{\mu}
$$

- $d_{1/2,CFRP} \approx 11{,}5 \, mm$
- $d_{1/2,Al} \approx 4{,}62 \, mm$

Deutung: Aluminium reduziert die Intensitaet pro Dicke deutlich staerker.

**6 BE**

4. Bragg (1. Ordnung):

$$
\lambda = 2d_G\sin\theta = 2\cdot 201\,pm \cdot \sin(18{,}4^\circ) \approx 127\,pm = 0{,}127\,nm
$$

Einordnung: kurzwelliger Roentgenbereich.

**5 BE**

5. Nachweisbarkeit: Signalanstieg $9\%$ bei Unsicherheit $2{,}5\%$ ergibt

$$
\text{SNR} \approx \frac{9}{2{,}5} = 3{,}6
$$

-> prinzipiell gut nachweisbar. Fachliche Bewertung: Hoehere Spannung verbessert Durchdringung, kann aber Kontrast senken und Strahlenschutzanforderungen erhoehen.

**6 BE**

---

## Summencheck

- GK: jeder Vorschlag $25 \, BE$ (A/B/C/D).
- LK: jeder Vorschlag $30 \, BE$ (A/B/C/D).
