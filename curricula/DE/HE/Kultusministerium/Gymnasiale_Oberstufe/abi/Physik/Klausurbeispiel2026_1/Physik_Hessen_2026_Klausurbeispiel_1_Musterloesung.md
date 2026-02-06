# Landesabitur Physik (Hessen) 2026 - SkillPilot Klausurbeispiel 1 (Musterlösung, Entwurf)

Bezug zur Aufgabenfassung: `Physik_Hessen_2026_Klausurbeispiel_1.md`

## Bewertungsgrundsätze

- Rundungsabweichungen im üblichen Rahmen sind zu akzeptieren.
- Fachlich korrekte alternative Lösungswege sind gleichwertig zu bewerten.
- Bei Folgefehlern: kein Doppelabzug, sofern der Folgeweg methodisch korrekt ist.
- Wo gefordert, sind physikalische Deutung und Bewertung explizit zu bepunkten.
- Sinnvolle Rundung entsprechend der signifikanten Stellen der Eingangsgrößen wird erwartet (in der Regel 2 bis 3 signifikante Stellen).

---

## A) Grundkurs (GK)

### Vorschlag A (GK) - 25 BE

1. $C = \varepsilon_0 \varepsilon_r A / d$  
   $C_0 = 8.854e-12 \cdot 2.3 \cdot 0.020 / 0.0040 \approx 1.018e-10 F = 102 pF$  
   $C_1 = 8.854e-12 \cdot 2.3 \cdot 0.020 / 0.0035 \approx 1.164e-10 F = 116 pF$  
   Prozentuale Änderung: $((C_1 - C_0)/C_0) \cdot 100 \% = 14.3 \%$ (Zunahme).  
   (Akzeptiert sind äquivalente, sinnvoll gerundete Darstellungen, z. B. $1.0e-10 F$ bzw. $1.2e-10 F$.)  
   **8 BE**

2. Lineare Näherung aus den Daten, z. B. Regressionsgerade:  
   $B(I) \approx 13.2 \cdot I + 0.5$ (mT).  
   Damit: $B(1.8 A) \approx 24.3 mT$.  
   (Alternative mit Randpunkten $B(I) \approx 13.33 I + 0.33$ ebenfalls akzeptabel.)  
   **7 BE**

3. Induktionsgesetz (Betrag, lineare Änderung von $B$ vorausgesetzt):  
   $U_ind = A_S \cdot |\Delta B / \Delta t| = 0.040 \cdot |(0.006 - 0.024)/0.12| = 0.0060 V = 6.0 mV$  
   Lenz-Regel (Richtung): Da das durch die Schleife tretende äußere Magnetfeld im Betrag abnimmt, muss der Induktionsstrom ein Magnetfeld erzeugen, das das ursprüngliche äußere Feld stützt.  
   **6 BE**

4. Zeitabweichung $\pm 10 \%$:  
   - bei $t = 0.108 s$: $U_ind \approx 6.67 mV$  
   - bei $t = 0.132 s$: $U_ind \approx 5.45 mV$  
   Beide Werte liegen über $4.0 mV$ -> Auslösung robust.  
   **4 BE**

---

### Vorschlag B (GK) - 25 BE

1. Aus Material 1:  
   Eine volle Periode läuft von $t=0$ bis $t=2.0 s$, also $T = 2.0 s$, $f = 1/T = 0.50 Hz$.  
   Mögliche Funktionsgleichung (in cm): $y(t) = 8 \cdot \sin(\pi t)$.  
   **6 BE**

2. Resonanzfrequenz aus Material 2: Maximum bei $f \approx 1.1 Hz$ (beide Dämpfungsfälle).  
   Deutung: Höhere Dämpfung senkt die Maximalamplitude und verbreitert die Resonanzkurve (geringere Schärfe).  
   **7 BE**

3. $\lambda_1 = v_1/f = 1.6/2.5 = 0.64 m$, $\lambda_2 = v_2/f = 1.1/2.5 = 0.44 m$.  
   Brechung (Wellenoptik): $\sin(\alpha_2)/\sin(\alpha_1) = v_2/v_1$.  
   $\sin(\alpha_2) = (1.1/1.6) \cdot \sin(35^\circ) = 0.394$ -> $\alpha_2 \approx 23.2^\circ$.  
   **8 BE**

4. Bei stehenden Wellen gilt Knotenabstand $= \lambda/2$.  
   $\lambda = 2 \cdot 0.32 m = 0.64 m$.  
   Interpretation: passt konsistent zur in Teilaufgabe 3 berechneten Wellenlänge im ersten Bereich.  
   **4 BE**

---

### Vorschlag C (GK) - 25 BE

1. Modellgleichung Fotoeffekt: $U_g = (h/e) \cdot f - W_A/e$.  
   Regressionsauswertung (alle 4 Punkte):  
   $m \approx 4.08e-15 V/Hz$, $b \approx -2.055 V$.  
   Damit $h \approx e*m = 6.54e-34 J s$, $W_A \approx -e*b = 2.06 eV$.  
   (Mit zwei geeigneten Punkten sind nahe Werte ebenfalls korrekt.)  
   **9 BE**

2. Begriff Energiestufenmodell: Elektronen können nur diskrete Energieniveaus einnehmen; Photonen bei Übergängen haben Energien $\Delta E = h f = hc/\lambda$.  
   Mit Material 3:  
   - $E_1 \rightarrow E_0$: $\Delta E = 2.1 eV$ -> $\lambda \approx 1240/2.1 = 590 nm$ (nahe 589 nm).  
   - $E_2 \rightarrow E_0$: $\Delta E = 3.2 eV$ -> $\lambda \approx 388 nm$ (kurzwelliger Bereich).  
   - $E_2 \rightarrow E_1$: $\Delta E = 1.1 eV$ -> $\lambda \approx 1127 nm$ (IR, nicht sichtbar).  
   Deutung: Das vereinfachte Modell bildet die sichtbaren Linien nur teilweise ab; weitere Niveaus/Feinstruktur fehlen.  
   **8 BE**

3. De-Broglie-Wellenlänge:  
   $\lambda = h / \sqrt{2 m_e E_kin}$ mit $E_kin = 3.2 eV$.  
   $\lambda \approx 6.86e-10 m = 0.686 nm$.  
   Vergleich mit $0.30 nm$: gleiche Größenordnung, daher Interferenz-/Beugungseffekte an atomaren Strukturen plausibel.  
   **8 BE**

---

### Vorschlag D (GK) - 25 BE

1. Aus Material 1 ergeben sich gleiche Spannungsabstände:  
   $\Delta U = 10.2-5.1 = 15.3-10.2 = 20.4-15.3 = 25.5-20.4 = 5.1 \, V$.  
   Damit ist der mittlere Abstand $\Delta U_{\text{mittel}} = 5.1 \, V$.  
   Anregungsenergie: $\Delta E = e \cdot \Delta U = 5.1 \, eV$ (entspricht $8.17 \cdot 10^{-19} \, J$).  
   **8 BE**

2. Photonenergie aus Material 2:  
   $E_\gamma = \frac{h \cdot c}{\lambda} \approx \frac{1240 \, eV \cdot nm}{254 \, nm} = 4.88 \, eV$.  
   Vergleich mit Teilaufgabe 1: $\Delta E \approx 5.1 \, eV$.  
   Abweichung: $0.22 \, eV$, relativ etwa $\frac{0.22}{4.88} \approx 4.5 \%$.  
   Das ist eine gute Übereinstimmung im Modellkontext.  
   **8 BE**

3. Qualitative Deutung des periodischen Stromverlaufs:  
   Bei kleiner Spannung erreichen Elektronen den Auffänger und der Strom steigt.  
   Sobald die Elektronen die Anregungsenergie erreichen, geben sie in unelastischen Stößen Energie an Atome ab und verlieren Geschwindigkeit -> der Anodenstrom fällt ab.  
   Bei weiter steigender Spannung wiederholt sich der Prozess periodisch, daher entstehen aufeinanderfolgende Maxima/Minima.  
   **5 BE**

4. Unsicherheitsprüfung mit Material 3:  
   $\Delta U = 5.1 \pm 0.3 \, V \Rightarrow \Delta E \in [4.8, 5.4] \, eV$.  
   Relativer Abstand zur Spektrallinie $E_\gamma = 4.88 \, eV$:  
   - unten: $\frac{|4.8-4.88|}{4.88} \approx 1.6 \%$  
   - oben: $\frac{|5.4-4.88|}{4.88} \approx 10.7 \%$  
   Beide Werte liegen unter der in Material 3 vorgegebenen Toleranz von $15 \%$ -> Messung und Energiestufenmodell sind im Unsicherheitsbereich kompatibel.  
   **4 BE**

---

## B) Leistungskurs (LK)

### Vorschlag A (LK) - 30 BE

1. Feldstärke: $E = U/d = 2400/0.006 = 4.0e5 V/m$.  
   Potenzielle Energieänderung auf Strecke $s=0.040 m$:  
   $\Delta E_pot = q E s = e \cdot 4.0e5 \cdot 0.040 = 2.56e-15 J = 16.0 keV$.  
   **7 BE**

2. Regressionsfunktion aus Material 2:  
   $B(I) \approx 13.0 I - 0.6$ (mT).  
   Diskussion letzter Punkt: Messwert $31 mT$ bei $2.4 A$ liegt leicht über Modellwert $30.6 mT$; mögliche Ursachen sind Messunsicherheit oder beginnende Nichtlinearität.  
   **7 BE**

3. Induktion mit $U = N \cdot |\Delta \Phi / \Delta t|$, $N=250$:  
   - Abschnitt 1 ($0 \rightarrow 1.8 mWb$ in $40 ms$): $U_1 = 11.25 V$.  
   - Abschnitt 2 ($1.8 \rightarrow 0.3 mWb$ in $60 ms$): $U_2 = 6.25 V$ (Betrag).  
   **7 BE**

4. Herleitung gekreuzte Felder:  
   Für geradlinigen Durchgang gilt Kräftegleichgewicht $qE = qvB$ -> $v = E/B$.  
   Mit $I=2.0 A$: $B \approx 25.4 mT = 2.54e-2 T$.  
   $v = 4.0e5 / 2.54e-2 \approx 1.57e7 m/s$.  
   **6 BE**

5. Modellgrenzen (mindestens zwei):  
   Inhomogenität von $E$/$B$ an Rändern, Temperaturdrift, Wirbelströme, endliche Sensorantwort, mechanische Toleranzen.  
   **3 BE**

---

### Vorschlag B (LK) - 30 BE

1. Logarithmisches Dekrement (z. B. über vier Peaks):  
   $\delta = (1/3) \cdot \ln(A_1/A_4) = (1/3) \cdot \ln(12.0/6.6) \approx 0.199$.  
   Interpretation: moderate Dämpfung pro Periode.  
   **7 BE**

2. Resonanzfrequenz aus Material 2: $f_res \approx 1.6 Hz$.  
   Besonders wirksamer Tilgerbereich: etwa um $1.4$ bis $1.8 Hz$ mit Schwerpunkt nahe $1.6 Hz$.  
   **6 BE**

3. Qualitatives Modell: $m y'' + b y' + D y = F_0 \sin(\omega t)$.  
   - $m$: trägt Trägheit/eigene Zeitkonstante,  
   - $D$: bestimmt Rückstellkraft und Eigenfrequenz,  
   - $b$: bestimmt Dissipation, Peakhöhe und Resonanzbreite.  
   **6 BE**

4. Brechung: $\sin(\alpha_2)/\sin(\alpha_1) = v_2/v_1 = 48/72$.  
   $\alpha_2 \approx 19.5^\circ$.  
   Bei größerer Dämpfung nimmt Kohärenz wirksam ab; Interferenzmaxima werden flacher und schlechter auflösbar.  
   **7 BE**

5. Vergleich:  
   - Masseerhöhung: senkt Eigenfrequenz, kann Lasten/Komfort negativ beeinflussen.  
   - Dämpfungserhöhung: reduziert Peakamplituden direkt, wirkt oft robuster bei variabler Anregung; kann aber Energieverluste erhöhen.  
   **4 BE**

---

### Vorschlag C (LK) - 30 BE

1. Regressionsansatz $U_g = (h/e) f - W_A/e$:  
   $m \approx 4.167e-15 V/Hz$, $b \approx -2.127 V$.  
   $h \approx e m = 6.68e-34 J s$, $W_A \approx 2.13 eV$.  
   **8 BE**

2. Energiestufenmodell (Material 2), Übergänge in den Grundzustand:  
   - $E_1 \rightarrow E_0$: $\Delta E = 2.2 eV$ -> $\lambda \approx 1240/2.2 = 564 nm$  
   - $E_2 \rightarrow E_0$: $\Delta E = 3.3 eV$ -> $\lambda \approx 376 nm$  
   - $E_3 \rightarrow E_0$: $\Delta E = 3.9 eV$ -> $\lambda \approx 318 nm$  
   Zwei davon genügen, sauber begründet.  
   **7 BE**

3. De-Broglie für $E_kin = 4.0 eV$:  
   $\lambda \approx 6.13e-10 m = 0.613 nm$.  
   Damit liegt die Wellenlänge im Bereich atomarer Gitterabstände -> Interferenz an Kristallen ist zu erwarten.  
   **5 BE**

4. Moseley-Linearisation mit $Y = \sqrt{f_{K\alpha}}$:  
   Für die Linearisierung ist ein Plot $\sqrt{f_{K\alpha}}$ gegen $Z$ (oder äquivalent $Z$ gegen $\sqrt{f_{K\alpha}}$) erforderlich.  
   Ein Plot $f_{K\alpha}$ gegen $Z$ ist nicht linear und gilt nicht als Linearisierung.  
   Lineare Anpassung $Y = a Z + c$ liefert näherungsweise  
   $a \approx 5.31e7 (Hz^0.5)$ und $c \approx -1.44e8 (Hz^0.5)$.  
   Mit $Y = a (Z - \sigma)$ folgt $\sigma = -c/a \approx 2.70$.  
   **7 BE**

5. Modellgrenzen: sehr kleine Datenbasis, effektive Abschirmung nicht exakt konstant, Mehr-Elektronen- und relativistische Effekte im einfachen Modell vernachlässigt.  
   **3 BE**

---

### Vorschlag D (LK) - 30 BE

1. Maximale Photonenergie aus Beschleunigungsspannung:  
   $E_max = eU = 120 keV = 1.92e-14 J$.  
   Aus Grenzwellenlänge $\lambda_min = 0.0105 nm$:  
   $E = hc/\lambda_min \approx 118 keV$.  
   Abweichung ~$1.6 \%$, damit konsistent im Rahmen eines realen Mess-/Rundungsfehlers.  
   **7 BE**

2. $I/I_0 = \exp(-\mu d)$ (Regression auf Logarithmus):  
   - Aluminium: $\mu_{Al} \approx 0.223 mm^-1$  
   - Stahl: $\mu_{St} \approx 0.472 mm^-1$  
   Vergleich: Stahl schwächt etwa $2.1$-mal stärker als Aluminium.  
   **7 BE**

3. Bragg-Gesetz (1. Ordnung): $\lambda = 2 d_G \sin(\theta)$  
   $\lambda = 2 \cdot 201 pm \cdot \sin(16.8^\circ) \approx 116 pm = 0.116 nm$.  
   Qualitativ: charakteristische Linie im kurzwelligen Röntgenbereich.  
   **6 BE**

4. Nachweisbarkeit bei $11 \%$ Signalzuwachs und $\pm 3 \%$ relativer Unsicherheit:  
   Signal liegt deutlich über der Unsicherheit ($SNR \approx 11/3 \approx 3.7$), daher prinzipiell nachweisbar; für belastbare Freigabe sind Wiederholmessung/Kalibration sinnvoll.  
   **6 BE**

5. Bewertung höherer Spannung:  
   Vorteile: bessere Durchdringung, kürzere Grenzwellenlänge.  
   Nachteile: geringerer Materialkontrast bei feinen Defekten, höhere Dosis/Strahlenschutzaufwand, mehr Streustrahlung.  
   **4 BE**

---

## Summencheck

- GK: jeder Vorschlag $25 BE$ (A/B/C/D).
- LK: jeder Vorschlag $30 BE$ (A/B/C/D).
