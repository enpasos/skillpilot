# Landesabitur Physik (Hessen) 2026 - SkillPilot Klausurbeispiel 1 (Entwurf)

## Allgemeine Hinweise

- Aufgabenart: materialgebundene Aufgabe.
- Hilfsmittel: Wörterbuch der deutschen Rechtschreibung, eingeführter Taschenrechner, die den Prüfungsaufgaben beigefügte mathematisch-naturwissenschaftliche Formelsammlung (oder eine Druckausgabe derselben) und eine eingeführte Formelsammlung (ohne Herleitungen, weitergehende physikalische Erklärungen, Beispielaufgaben), Operatorenliste.
- Sprachliche Richtigkeit ist Teil der Bewertung.
- Dieses Dokument ist ein Aufgabenentwurf (ohne Musterlösung).

---

## A) Grundkurs (GK)

**Auswahlregel GK:** Es werden vier Vorschläge $A$, $B$, $C$, $D$ angeboten. Es sind drei Vorschläge zu bearbeiten.

### Vorschlag A (GK) - Felder und Induktion an einer E-Bus-Ladestation (Q1.1/Q1.2/Q1.3, 25 BE)

**Material 1 (kapazitiver Abstandssensor):**

- Plattenfläche: $A = 0,020 m^2$
- Anfangsabstand: $d_0 = 4,0 mm$
- Abstand unter Last: $d_1 = 3,5 mm$
- Dielektrikum: $\varepsilon_r = 2,3$

**Material 2 (Kalibrierung Spule):**

| Strom $I$ (A) | 0,5 | 1,0 | 1,5 | 2,0 |
|---|---:|---:|---:|---:|
| Flussdichte $B$ (mT) | 7 | 14 | 20 | 27 |

**Material 3 (Induktionsschleife in der Fahrbahn):**

- Fläche der Schleife: $A_S = 0,040 m^2$
- Magnetische Flussdichte sinkt während der Einfahrt gleichmäßig (linear) von $24 mT$ auf $6 mT$ in $0,12 s$.

**Aufgaben:**

1. Berechnen Sie $C_0$ und $C_1$ des Plattenkondensators mit $C = \varepsilon_0 \varepsilon_r A / d$. Bestimmen Sie die prozentuale Änderung. (8 BE)
2. Werten Sie Material 2 aus und bestimmen Sie eine geeignete lineare Näherung $B(I)$. Schätzen Sie $B$ für $I = 1,8 A$. (7 BE)
3. Berechnen Sie den Betrag der induzierten Spannung in der Fahrbahnschleife mit dem Induktionsgesetz und bestimmen Sie unter Nutzung der Lenz'schen Regel die Richtung des Induktionsstroms während der Einfahrt. (6 BE)
4. Der Detektor löst sicher ab $4,0 mV$ aus. Beurteilen Sie, ob die Auslösung auch bei einer Zeitabweichung von $\pm 10 \%$ robust bleibt. (4 BE)

---

### Vorschlag B (GK) - Schwingungs- und Wellenmonitoring im Hafenbecken (Q2.1/Q2.2/Q2.3, 25 BE)

**Material 1 (Boje, vertikale Auslenkung):**

| Zeit $t$ (s) | 0,0 | 0,5 | 1,0 | 1,5 | 2,0 |
|---|---:|---:|---:|---:|---:|
| Auslenkung $y$ (cm) | 0,0 | 8,0 | 0,0 | -8,0 | 0,0 |

**Material 2 (Resonanzversuch, gleiche Anregung, zwei Dämpfungen):**

| Frequenz $f$ (Hz) | 0,7 | 0,9 | 1,1 | 1,3 | 1,5 |
|---|---:|---:|---:|---:|---:|
| Amplitude schwach gedämpft (cm) | 2,0 | 4,5 | 7,8 | 5,0 | 2,6 |
| Amplitude stark gedämpft (cm) | 1,8 | 3,0 | 4,2 | 3,4 | 2,1 |

**Material 3 (Grenzfläche Flachwasser/Tiefwasser):**

- Ausbreitungsgeschwindigkeit vor der Kante: $v_1 = 1,6 m/s$
- Ausbreitungsgeschwindigkeit nach der Kante: $v_2 = 1,1 m/s$
- Frequenz: $f = 2,5 Hz$
- Einfallswinkel zur Lotgeraden: $\alpha_1 = 35^\circ$

**Aufgaben:**

1. Bestimmen Sie aus Material 1 Periodendauer und Frequenz der Schwingung. Geben Sie eine mögliche Funktionsgleichung $y(t)$ an. (6 BE)
2. Ermitteln Sie aus Material 2 die Resonanzfrequenz und erklären Sie den Einfluss der Dämpfung auf die Resonanzkurve. (7 BE)
3. Berechnen Sie für Material 3 die Wellenlängen $\lambda_1$ und $\lambda_2$ sowie den Brechungswinkel $\alpha_2$. (8 BE)
4. In einem Teilbecken werden stehende Wellen beobachtet. Der Abstand benachbarter Knoten beträgt $0,32 m$. Bestimmen Sie die zugehörige Wellenlänge und interpretieren Sie das Ergebnis. (4 BE)

---

### Vorschlag C (GK) - Fotoeffekt und Energiestufenmodell in der Sensorik (Q3.1/Q3.2, 25 BE)

**Material 1 (Messung am Fotoelement):**

| Frequenz $f$ ($10^14 Hz$) | 5,5 | 6,0 | 6,5 | 7,0 |
|---|---:|---:|---:|---:|
| Gegenspannung $U_g$ (V) | 0,19 | 0,39 | 0,60 | 0,80 |

**Material 2 (Spektrallinien einer Entladungslampe):**

- $\lambda_1 = 589 nm$
- $\lambda_2 = 546 nm$
- $\lambda_3 = 436 nm$

**Material 3 (vereinfachtes Energiestufenmodell eines Atoms):**

- $E_0 = -5,1 eV$
- $E_1 = -3,0 eV$
- $E_2 = -1,9 eV$

**Aufgaben:**

1. Nutzen Sie Material 1 und bestimmen Sie mit zwei geeigneten Messpunkten eine Näherung für das Plancksche Wirkungsquantum $h$ sowie die Austrittsarbeit $W_A$. (9 BE)
2. Erklären Sie den Begriff **Energiestufenmodell** und ordnen Sie Material 2 geeigneten Übergängen aus Material 3 zu. Begründen Sie Ihre Zuordnung über Energiedifferenzen. (8 BE)
3. Elektronen besitzen eine kinetische Energie von $3,2 eV$. Berechnen Sie ihre De-Broglie-Wellenlänge und vergleichen Sie diese mit einem typischen Atomabstand von $0,30 nm$. (8 BE)

---

### Vorschlag D (GK) - Franck-Hertz-Versuch und Energiestufen (Q3.2/Q3.1, 25 BE)

**Material 1 (Lage der Strommaxima im Franck-Hertz-Versuch):**

| Beschleunigungsspannung der Strommaxima $U_{\max}$ (V) | 5,1 | 10,2 | 15,3 | 20,4 | 25,5 |
|---|---:|---:|---:|---:|---:|

**Material 2 (Spektrallinie von Quecksilber):**

- Dominante Emissionslinie: $\lambda = 254 \, nm$

**Material 3 (Prüffall):**

- Als kompatibel gelten Messung und Modell, wenn die relative Abweichung unter $15 \%$ liegt.
- Messunsicherheit des Spannungsabstands: $\Delta U = 5,1 \pm 0,3 \, V$.

**Aufgaben:**

1. Bestimmen Sie aus Material 1 den mittleren Spannungsabstand $\Delta U$ zwischen benachbarten Maxima und berechnen Sie daraus die Anregungsenergie $\Delta E = e \cdot \Delta U$ in eV. (8 BE)
2. Berechnen Sie aus Material 2 die Photonenergie $E_\gamma = \frac{h \cdot c}{\lambda}$ in eV und vergleichen Sie sie mit der Anregungsenergie aus Teilaufgabe 1. (8 BE)
3. Erklären Sie qualitativ den periodischen Verlauf des Anodenstroms im Franck-Hertz-Versuch (Anstieg/Abfall der Maxima). (5 BE)
4. Beurteilen Sie mit Material 3, ob die Messung im Rahmen der Unsicherheit mit dem Energiestufenmodell kompatibel ist. (4 BE)

---

## B) Leistungskurs (LK)

**Auswahlregel LK:** Es werden vier Vorschläge $A$, $B$, $C$, $D$ angeboten. Es sind drei Vorschläge zu bearbeiten.

### Vorschlag A (LK) - Adaptive Ladespur für E-Busse (Q1.1/Q1.2/Q1.3, 30 BE)

**Material 1 (Feldbereich eines Plattenkondensators):**

- Plattenabstand $d = 6,0 mm$
- Spannung $U = 2,4 kV$
- Sensor-Ion mit Ladung $q = e$
- wirksame Feldstrecke $s = 4,0 cm$

**Material 2 (Messung Magnetfeld einer Leiterschleife):**

| Strom $I$ (A) | 0,8 | 1,2 | 1,6 | 2,0 | 2,4 |
|---|---:|---:|---:|---:|---:|
| $B$ (mT) | 10 | 15 | 20 | 25 | 31 |

**Material 3 (zeitlicher Flussverlauf in einer Induktionsspule):**

- $\Phi(0) = 0$
- linearer Anstieg auf $\Phi = 1,8 mWb$ bis $t = 40 ms$
- linearer Abfall auf $\Phi = 0,3 mWb$ bis $t = 100 ms$

**Aufgaben:**

1. Bestimmen Sie die Feldstärke $E$ im Kondensator und die Änderung der elektrischen potenziellen Energie des Ions auf der Strecke $s$. (7 BE)
2. Ermitteln Sie aus Material 2 eine lineare Modellfunktion $B(I)$ und diskutieren Sie die Abweichung des letzten Messpunkts im Hinblick auf Messunsicherheit oder Modellgrenze. (7 BE)
3. Berechnen Sie für beide Zeitabschnitte aus Material 3 die induzierte Spannung einer $N = 250$ Windungen umfassenden Spule. (7 BE)
4. Herleitung: Zeigen Sie für gekreuzte Felder die Bedingung $v = E/B$ für geradlinigen Durchgang eines Ions. Wenden Sie die Beziehung mit den Daten aus Material 1 und 2 an ($I = 2,0 A$). (6 BE)
5. Beurteilen Sie die Eignung des Modells für den Realeinsatz (mindestens zwei fachliche Grenzen benennen). (3 BE)

---

### Vorschlag B (LK) - Aktives Schwingungsmanagement auf einer Fußgängerbrücke (Q2.1/Q2.2/Q2.3, 30 BE)

**Material 1 (freie Schwingung, Spitzenwerte):**

| Peaknummer $n$ | 1 | 2 | 3 | 4 |
|---|---:|---:|---:|---:|
| Amplitude $A_n$ (mm) | 12,0 | 9,8 | 8,0 | 6,6 |

**Material 2 (erzwungene Schwingung):**

| Anregungsfrequenz $f$ (Hz) | 1,2 | 1,4 | 1,6 | 1,8 | 2,0 |
|---|---:|---:|---:|---:|---:|
| stationäre Amplitude $A$ (mm) | 3,1 | 6,4 | 9,0 | 6,8 | 3,9 |

**Material 3 (Wellen an Grenzfläche, Seil-Wellenleiter):**

- Abschnitt 1: Ausbreitungsgeschwindigkeit $v_1 = 72 m/s$
- Abschnitt 2: Ausbreitungsgeschwindigkeit $v_2 = 48 m/s$
- Einfallswinkel zur Lotgeraden $\alpha_1 = 30^\circ$
- Hinweis: Ein Schwingungstilger ist ein zusätzliches schwingfähiges System, das bei Resonanz Energie aus der Hauptschwingung aufnimmt.

**Aufgaben:**

1. Bestimmen Sie aus Material 1 ein geeignetes Dämpfungsmaß (z. B. logarithmisches Dekrement) und interpretieren Sie das Ergebnis physikalisch. (7 BE)
2. Ermitteln Sie aus Material 2 die Resonanzfrequenz und bewerten Sie, in welchem Frequenzbereich ein Schwingungstilger bzw. eine Dämpfungsmaßnahme besonders wirksam sein muss. (6 BE)
3. Modellieren Sie die Schwingungsantwort qualitativ mit einem Feder-Masse-Dämpfer-Modell und begründen Sie die Rolle der Parameter $m$, $D$, $b$. (6 BE)
4. Berechnen Sie für Material 3 den Brechungswinkel $\alpha_2$ und diskutieren Sie, wie sich eine erhöhte Dämpfung auf Interferenzerscheinungen im zweiten Abschnitt auswirkt. (7 BE)
5. Vergleichen Sie zwei Maßnahmen (Masseerhöhung vs. Dämpfungserhöhung) hinsichtlich Resonanzreduktion und Komfort. (4 BE)

---

### Vorschlag C (LK) - Quantenanalyse einer Spektrallampe (Q3.1/Q3.2, 30 BE)

**Material 1 (Fotoeffekt-Messreihe):**

| $f$ ($10^14 Hz$) | 5,2 | 5,8 | 6,4 | 7,0 |
|---|---:|---:|---:|---:|
| $U_g$ (V) | 0,04 | 0,29 | 0,54 | 0,79 |

**Material 2 (Energieniveaus, vereinfachtes Atommodell):**

- $E_0 = -5,4 eV$
- $E_1 = -3,2 eV$
- $E_2 = -2,1 eV$
- $E_3 = -1,5 eV$

**Material 3 (Moseley-Datensatz, K-alpha-Linie):**

| Ordnungszahl $Z$ | 29 | 30 | 32 |
|---|---:|---:|---:|
| Frequenz $f_{K\alpha}$ ($10^18 Hz$) | 1,95 | 2,10 | 2,42 |

**Aufgaben:**

1. Bestimmen Sie aus Material 1 eine lineare Beziehung zwischen $U_g$ und $f$ und daraus $h$ und $W_A$. (8 BE)
2. Stellen Sie mit Material 2 ein **Energiestufenmodell** dar und berechnen Sie zwei mögliche Emissionswellenlängen für Übergänge in den Grundzustand. (7 BE)
3. Für Elektronen mit $E_{kin} = 4,0 eV$: Berechnen Sie die De-Broglie-Wellenlänge und diskutieren Sie den Bezug zur Interferenzfähigkeit an Kristallen. (5 BE)
4. Nutzen Sie Material 3 zur LK-Erweiterung: linearisieren Sie den Zusammenhang zwischen $\sqrt{f_{K\alpha}}$ und $Z$ und bestimmen Sie daraus den Abschirmparameter in einem Modell $f_{K\alpha} \approx (Z - \sigma)^2$. (7 BE)
5. Begründen Sie die Grenzen dieses vereinfachten Moseley-Modells. (3 BE)

---

### Vorschlag D (LK) - Röntgen-CT in der Werkstoffprüfung (Q3.3/Q3.2, 30 BE)

**Material 1 (Röntgenröhre):**

- Beschleunigungsspannung: $U = 120 kV$
- gemessene Grenzwellenlänge: $\lambda_{min} = 0,0105 nm$

**Material 2 (Abschwächung in zwei Materialien):**

| Dicke $d$ (mm) | 1 | 2 | 3 | 4 |
|---|---:|---:|---:|---:|
| $I/I_0$ in Al | 0,80 | 0,64 | 0,51 | 0,41 |
| $I/I_0$ in Stahl | 0,62 | 0,38 | 0,24 | 0,15 |

**Material 3 (Kristallanalyse einer charakteristischen Linie):**

- Gitterabstand $d_G = 201 pm$
- Maximum 1. Ordnung bei $\theta = 16,8^\circ$

**Aufgaben:**

1. Berechnen Sie aus Material 1 die maximale Photonenergie und prüfen Sie die Konsistenz mit der Grenzwellenlänge über $E = h c / \lambda$. (7 BE)
2. Bestimmen Sie für Al und Stahl jeweils einen linearen Schwächungskoeffizienten $\mu$ aus Material 2 und vergleichen Sie die Materialien quantitativ. (7 BE)
3. Berechnen Sie mit Material 3 die Wellenlänge der charakteristischen Linie über das Bragg-Gesetz. Ordnen Sie die Linie qualitativ in das Spektrum ein. (6 BE)
4. Eine Einschlussstelle im Stahlbauteil erhöht lokal die Transmission um $11 \%$. Das CT-System hat eine relative Messunsicherheit von $\pm 3 \%$. Beurteilen Sie die Nachweisbarkeit belastbar. (6 BE)
5. Bewerten Sie den Einsatz höherer Beschleunigungsspannungen im Spannungsfeld aus Durchdringung, Kontrast und Strahlenschutz. (4 BE)

---

## Hinweis zur weiteren Bearbeitung

Der nächste Schritt ist die Erstellung der Musterlösung mit konsistentem BE-Raster je Vorschlag.
