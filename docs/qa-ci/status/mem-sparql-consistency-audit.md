# MEM SPARQL Consistency Audit

Generated: 2026-06-01T14:36:46.533Z
Endpoint: https://sparql.mem.edufeed.org/sparql
Config: `curricula/DE/Gymnasium/quality/mem-sparql-consistency/canonical-math-poc.config.json`

This is a non-blocking review lane. It checks whether live MEM/SPARQL curriculum data are consistent with SkillPilot source-extraction evidence and writes review issues for later human triage. Missing or divergent MEM data do not fail CI by themselves.

Scope: Mathematik / Gymnasium
Local source extractions: 31, local source goals: 9972.
MEM curriculum availability: 2/16 jurisdictions with matching curriculum plans.
Review issues: 96.

## Jurisdiction Availability

| Jurisdiction | Local source files | Local source goals | Stages | MEM plans | MEM scope | Status |
| --- | ---: | ---: | --- | ---: | --- | --- |
| DE-BB Brandenburg | 2 | 485 | SekI, SekII | 0 | state | mem_curriculum_missing |
| DE-BE Berlin | 2 | 484 | SekI, SekII | 0 | state | mem_curriculum_missing |
| DE-BW Baden-Württemberg | 2 | 499 | SekI, SekII | 0 | state | mem_curriculum_missing |
| DE-BY Bayern | 1 | 468 | SekI+SekII | 10 | state+subject+school | mem_curriculum_available |
| DE-HB Bremen | 2 | 531 | SekI, SekII | 0 | state | mem_curriculum_missing |
| DE-HE Hessen | 2 | 917 | SekI, SekII | 0 | state | mem_curriculum_missing |
| DE-HH Hamburg | 2 | 626 | SekI, SekII | 0 | state | mem_curriculum_missing |
| DE-MV Mecklenburg-Vorpommern | 2 | 588 | SekI, SekII | 0 | state | mem_curriculum_missing |
| DE-NI Niedersachsen | 2 | 581 | SekI, SekII | 0 | state | mem_curriculum_missing |
| DE-NW Nordrhein-Westfalen | 2 | 442 | SekI, SekII | 0 | state | mem_curriculum_missing |
| DE-RP Rheinland-Pfalz | 2 | 445 | SekI, SekII | 0 | state | mem_curriculum_missing |
| DE-SH Schleswig-Holstein | 2 | 620 | SekI, SekII | 0 | state | mem_curriculum_missing |
| DE-SL Saarland | 2 | 1561 | SekI, SekII | 0 | state | mem_curriculum_missing |
| DE-SN Sachsen | 2 | 568 | SekI, SekII | 1 | state+subject+school | mem_curriculum_available |
| DE-ST Sachsen-Anhalt | 2 | 612 | SekI, SekII | 0 | state | mem_curriculum_missing |
| DE-TH Thüringen | 2 | 545 | SekI, SekII | 0 | state | mem_curriculum_missing |

## Concrete Text Comparisons

| Comparison | Local unique expectation texts | MEM expectation texts | Matched | MEM-only | Local-only | Status |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Bayern Mathematik Gymnasium LehrplanPLUS | 291 | 292 | 251 | 41 | 41 | discrepancies |

## Review Issues

### local_expectation_not_found_in_mem-02b8b7b5dbc0

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M8.7`
- Title: Local source expectation not found in MEM

machen die Struktur der Formeln für Umfang bzw. Flächeninhalt eines Kreises plausibel und bestimmen, z. B. durch Messen, einen Näherungswert für die Kreiszahl π. Sie interpretieren die Flächeninhaltsformel als nicht lineare Zuordnung und wenden die Formeln bei innermathematischen Fragestellungen (auch zu einfachen Kreisteilen) sowie in Sachsituationen an.

### local_expectation_not_found_in_mem-0def267d3b5e

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M8.2`
- Title: Local source expectation not found in MEM

verstehen, dass der Spezialfall einer linearen Funktion mit einer Funktionsgleichung der Form y = a ⋅ x als Zuordnung zweier Größen aufgefasst werden kann, die direkt proportional zueinander sind. Diesen Zusammenhang zwischen den beiden Größen erläutern sie an der zugehörigen Ursprungsgeraden und erkennen zueinander direkt proportionale Größen als solche, u. a. im Kontext naturwissenschaftlicher Fragestellungen.

### local_expectation_not_found_in_mem-1807d118b9fe

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M9.1`
- Title: Local source expectation not found in MEM

verstehen das Grundprinzip eines indirekten Beweises, vollziehen damit den Beweis für die Irrationalität von nach und erläutern diesen; dabei erfassen sie auch, dass das Beweisen eine zentrale Bedeutung für die Mathematik und deren stringenten Aufbau hat. Sie begründen die Notwendigkeit, die Menge der rationalen Zahlen zu erweitern, nennen Quadratwurzeln und andere irrationale Zahlen (u. a. π) als Beispiele reeller nicht rationaler Zahlen und sind sich der kulturhistorischen Bedeutung dieser Zahlbereichserweiterung bewusst.

### local_expectation_not_found_in_mem-1cfeb240b5ac

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M10.1`
- Title: Local source expectation not found in MEM

lösen einfache Exponentialgleichungen und wenden dabei auch die Regel logb(uz) = z ⋅ logb(u) an.

### local_expectation_not_found_in_mem-1e0061deaf1f

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M10.3`
- Title: Local source expectation not found in MEM

veranschaulichen auf der Grundlage ihrer in der Jahrgangsstufe 9 erworbenen Kenntnisse Sinus- und Kosinuswerte von Winkelgrößen zwischen 0 und 2π am Einheitskreis und ermitteln insbesondere das zugehörige Vorzeichen sicher. Sie bestimmen die Größen von Winkeln, die einen vorgegebenen Sinus- oder Kosinuswert besitzen.

### local_expectation_not_found_in_mem-1f54ff27b266

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M12-EA.3`
- Title: Local source expectation not found in MEM

interpretieren Ergebnisse einseitiger Signifikanztests im Sachzusammenhang (u. a. Umfragen vor Wahlen) und widerlegen Fehlinterpretationen. Sie erläutern insbesondere, dass ein Signifikanztest keine Aussage über die Wahrscheinlichkeit der Gültigkeit der Nullhypothese zulässt und was unter einem „signifikanten Ergebnis“ verstanden wird.

### local_expectation_not_found_in_mem-22b70b0cad81

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M12-EA.1.2`
- Title: Local source expectation not found in MEM

machen durch einen Vergleich des Wachstums von Exponential- und Potenzfunktion die Grenzwerte und plausibel.

### local_expectation_not_found_in_mem-286f109a3faf

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M11.2`
- Title: Local source expectation not found in MEM

ermitteln mithilfe des Funktionsterms das links- und rechtsseitige Grenzverhalten einer einfachen gebrochen-rationalen Funktion für x → x0, um den Verlauf des Graphen in der Umgebung einer Polstelle x0 zu beschreiben. Zur Angabe des Grenzverhaltens verwenden sie die Grenzwertschreibweise und geben die Gleichung der zugehörigen senkrechten Asymptote des Graphen an.

### local_expectation_not_found_in_mem-3303124265fe

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M9.2.1`
- Title: Local source expectation not found in MEM

beschreiben für quadratische Funktionen mit Termen der Form a ⋅ (x + d)2 + e, wie sich Änderungen der Werte der Parameter a, d und e auf die zugehörige Parabel auswirken; sie bestimmen für Beispiele derart angegebener Funktionen jeweils die Anzahl der Nullstellen und die Lösungen der zugehörigen Gleichung. Zur Untersuchung und Veranschaulichung dieser Zusammenhänge nutzen sie auch eine dynamische Mathematiksoftware.

### local_expectation_not_found_in_mem-376cac075ba6

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M9.7.1`
- Title: Local source expectation not found in MEM

begründen die Zusammenhänge (sin α)2 + (cos α)2 = 1, , cos α = sin (90° − α) und sin α = cos (90° − α).

### local_expectation_not_found_in_mem-3cd88391fe7d

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M10.3`
- Title: Local source expectation not found in MEM

zeichnen für einen gegebenen Funktionsterm der Form a ⋅ sin(b ⋅ (x + c)) + d unter Verwendung geeigneter Merkmale (insbesondere Amplitude und Periode) den zugehörigen Funktionsgraphen und ermitteln umgekehrt aus dem Graphen den zugehörigen Funktionsterm.

### local_expectation_not_found_in_mem-3e12b2a7dce0

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M10.2`
- Title: Local source expectation not found in MEM

bestimmen mithilfe der Monte-Carlo-Methode unter Einsatz eines Tabellenkalkulationsprogramms oder einer anderen geeigneten Software (z. B. unter Verwendung bedingter Anweisungen) einen Näherungswert für die Kreiszahl π. Sie vergleichen dieses Verfahren mit einem nicht zufallsbasierten Verfahren zur Bestimmung eines Näherungswerts von π, das z. B. auf der Streifenmethode beruht.

### local_expectation_not_found_in_mem-4cf0e786b3c5

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M9.5`
- Title: Local source expectation not found in MEM

verstehen die Definition der allgemeinen Wurzel und sind in der Lage, damit Gleichungen zu lösen, die sich auf die Form xn = c zurückführen lassen. Die Anzahl der Lösungen machen sie durch eine geeignete Skizze plausibel.

### local_expectation_not_found_in_mem-4ff646a6e2b7

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M12-EA.2`
- Title: Local source expectation not found in MEM

führen Sachsituationen durch Analogiebildung auf die Urnenmodelle „Ziehen mit Zurücklegen“ bzw. „Ziehen ohne Zurücklegen“ zurück, um die Anzahl möglicher Ergebnisse auch unter Zuhilfenahme von Binomialkoeffizienten zu bestimmen. In diesen Fällen berechnen sie damit verbundene Wahrscheinlichkeiten.

### local_expectation_not_found_in_mem-5066781ea1c5

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M9.5`
- Title: Local source expectation not found in MEM

beschreiben für Funktionen mit Termen der Form a ⋅ xn in Abhängigkeit von a und n den Verlauf des zugehörigen Graphen sowie seine Symmetrie; zur Untersuchung und Veranschaulichung nutzen sie auch eine dynamische Mathematiksoftware.

### local_expectation_not_found_in_mem-5755bc1039e9

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M11.1`
- Title: Local source expectation not found in MEM

erläutern anhand des Graphen sowie anhand des Funktionsterms das Grenzverhalten von Funktionen für x → +∞ und für x → −∞; sie unterscheiden Konvergenz und Divergenz und veranschaulichen die Konvergenz mithilfe der Vorstellung eines beliebig schmalen Streifens, den ein gegebener Funktionsgraph jeweils ab einem bestimmten x‑Wert nicht mehr verlässt. Zur Angabe des Grenzverhaltens verwenden sie die Grenzwertschreibweise.

### local_expectation_not_found_in_mem-590add25a497

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M11.3`
- Title: Local source expectation not found in MEM

erläutern, dass in Sachzusammenhängen (z. B. in der medizinischen Diagnostik) klar zwischen PB(A), PA(B) und P(A∩B) unterschieden werden muss. Sie sind in der Lage, mithilfe von Vierfeldertafeln oder Baumdiagrammen – auch solchen, in denen sie Wahrscheinlichkeiten mithilfe von absoluten Häufigkeiten in den Feldern bzw. Knoten illustrieren – von der einen auf die andere bedingte Wahrscheinlichkeit zu schließen.

### local_expectation_not_found_in_mem-5fc5fc980147

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M5.3.1`
- Title: Local source expectation not found in MEM

lösen Gleichungen der Form a ⋅ x = b, x : a = b und a : x = b, wie in der Grundschule angebahnt, durch systematisches Probieren oder durch Bildung der jeweiligen Umkehraufgabe.

### local_expectation_not_found_in_mem-610c733e40e3

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M8.2`
- Title: Local source expectation not found in MEM

interpretieren Funktionsgleichungen der Form y = m ⋅ x + t als Gleichungen von Geraden und erläutern die Bedeutung der Parameter m und t, auch unter Verwendung einer dynamischen Mathematiksoftware. Sie zeichnen die Graphen linearer Funktionen und ermitteln umgekehrt anhand der Graphen solcher Funktionen die zugehörigen Werte der Parameter.

### local_expectation_not_found_in_mem-7339e1ed786f

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M8.3`
- Title: Local source expectation not found in MEM

verstehen, dass der Spezialfall einer gebrochen-rationalen Funktion mit einer Funktionsgleichung der Form als Zuordnung zweier Größen aufgefasst werden kann, die indirekt proportional zueinander sind. Diesen Zusammenhang zwischen den beiden Größen erläutern sie am zugehörigen Graphen und erkennen zueinander indirekt proportionale Größen als solche, u. a. im Kontext naturwissenschaftlicher Fragestellungen.

### local_expectation_not_found_in_mem-798c8d4fe179

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M11.4.2`
- Title: Local source expectation not found in MEM

veranschaulichen die formale Definition der strengen Monotonie anhand geeigneter Skizzen und begründen damit z. B. die strenge Monotonie der Funktion x ↦ x3 (x ∈ IR). Sie erläutern, wie man aus der ersten Ableitung einer Funktion Rückschlüsse auf deren Monotonieverhalten sowie auf deren Extremstellen ziehen kann, und nutzen diese Zusammenhänge bei der Untersuchung ganzrationaler Funktionen.

### local_expectation_not_found_in_mem-96d1130a18b8

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M9.2.1`
- Title: Local source expectation not found in MEM

sind sich bewusst, dass jede der drei Darstellungsformen des Terms einer quadratischen Funktion, die allgemeine Form ax2 + bx + c, die Scheitelpunktform a ⋅ (x − xS)2 + yS und die Nullstellenform a ⋅ (x − x1) ⋅ (x − x2), Vorteile besitzt, und nutzen diese Formen situationsgerecht, u. a. auch beim Argumentieren.

### local_expectation_not_found_in_mem-a11ef6bfa3d3

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M8.3`
- Title: Local source expectation not found in MEM

zeichnen den Graphen einer gebrochen-rationalen Funktion der Form einschließlich seiner Asymptoten und ermitteln umgekehrt anhand des Graphen einer solchen Funktion die zugehörigen Werte der Parameter.

### local_expectation_not_found_in_mem-a403a9ec6581

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M10.4`
- Title: Local source expectation not found in MEM

überprüfen rechnerisch sowie durch Analyse der Struktur des Funktionsterms, ob der Graph einer ganzrationalen Funktion Achsensymmetrie bezüglich der y‑Achse bzw. Punktsymmetrie bezüglich des Koordinatenursprungs aufweist.

### local_expectation_not_found_in_mem-a5a8af0b3dee

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M5.4.1`
- Title: Local source expectation not found in MEM

verstehen das Prinzip des Messens und rechnen Größenangaben bei Geld (€, ct), Länge (km, m, dm, cm, mm), Masse (t, kg, g, mg) und Zeit (h, min, s) jeweils in andere Einheiten um; dabei verwenden sie bei den Größen Geld, Länge und Masse – unter Rückgriff auf Einheitentafeln – auch Angaben in Kommaschreibweise.

### local_expectation_not_found_in_mem-aad831eb0049

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M12-V.1`
- Title: Local source expectation not found in MEM

berechnen Lösungen von Kreisteilungsgleichungen der Form zn = 1 und interpretieren die so erhaltenen n-ten Einheitswurzeln am Einheitskreis.

### local_expectation_not_found_in_mem-bc820d16dbd6

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M6.1.2`
- Title: Local source expectation not found in MEM

wandeln Brüche in Dezimalbrüche um und stellen umgekehrt endliche Dezimalbrüche sowie rein periodische Dezimalbrüche der Periodenlänge eins als Brüche dar; bei angemessen gewählten Zahlen führen sie den Darstellungswechsel auch im Kopf durch. Sie setzen diese Fertigkeiten insbesondere beim Größenvergleich von rationalen Zahlen ein und greifen dabei auch auf ihr automatisiertes Wissen der Dezimalbruchdarstellung häufig verwendeter Brüche zurück. Mit Ergebnisanzeigen digitaler Rechenhilfen (z. B. Taschenrechner-App) gehen sie reflektiert um, z. B. mit „0,166666667“ bei Eingabe von „1 : 6 =“.

### local_expectation_not_found_in_mem-bf76ec7390fe

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M12-EA.2`
- Title: Local source expectation not found in MEM

formulieren eine axiomatische Definition von Wahrscheinlichkeit und folgern aus den Axiomen weitere Aussagen über Wahrscheinlichkeiten. Sie vergleichen diesen Wahrscheinlichkeitsbegriff mit anderen Ansätzen zur Begriffsdefinition, z. B. Laplace'scher, frequentistischer oder subjektiver Wahrscheinlichkeitsbegriff.

### local_expectation_not_found_in_mem-c14363586ff1

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M9.2.1`
- Title: Local source expectation not found in MEM

ermitteln durch flexible Nutzung der binomischen Formeln die Koordinaten des Scheitels einer Parabel aus dem zugehörigen Funktionsterm, auch wenn dieser in der Form ax2 + bx + c vorliegt, und zeichnen den zugehörigen Graphen.

### local_expectation_not_found_in_mem-c3ee3e614056

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M9.3`
- Title: Local source expectation not found in MEM

interpretieren, ausgehend von Vierfeldertafeln mit absoluten Häufigkeiten, die zugehörigen relativen Häufigkeiten als Wahrscheinlichkeiten von Ereignissen eines entsprechenden Zufallsexperiments, begründen auf dieser Grundlage den Zusammenhang P(A∪B) = P(A) + P(B) – P(A∩B) und bestimmen Wahrscheinlichkeiten im Kontext zweier miteinander verknüpfter Ereignisse.

### local_expectation_not_found_in_mem-c49c2a70f2ff

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M5.1.2`
- Title: Local source expectation not found in MEM

lösen Gleichungen der Form a + x = b, x − a = b und a − x = b, wie in der Grundschule angebahnt, durch systematisches Probieren oder durch Bildung der jeweiligen Umkehraufgabe.

### local_expectation_not_found_in_mem-c9cfb4ebe2b8

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M13.1`
- Title: Local source expectation not found in MEM

bestimmen mithilfe der Integralrechnung das Volumen eines Körpers, der durch Rotation eines Funktionsgraphen um die x‑Achse entsteht.

### local_expectation_not_found_in_mem-caf43d8d0b17

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M10.3`
- Title: Local source expectation not found in MEM

beschreiben für Funktionen mit Termen der Form a ⋅ sin(b ⋅ (x + c)) + d, wie sich Änderungen der Parameter a, b, c und d auf den Funktionsgraphen auswirken. Zur Untersuchung, Demonstration und Erläuterung dieser Zusammenhänge nutzen sie auch eine dynamische Mathematiksoftware.

### local_expectation_not_found_in_mem-dfa616a7f9b3

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M10.1`
- Title: Local source expectation not found in MEM

beschreiben für Funktionen mit Termen der Form b ⋅ ax in Abhängigkeit von a und b den Verlauf des zugehörigen Graphen und dessen typische Merkmale (Schnittpunkt mit der y‑Achse, asymptotisches Verhalten, Monotonieverhalten) und argumentieren damit. Zur Demonstration und Erläuterung dieser Beziehungen nutzen sie auch eine dynamische Mathematiksoftware.

### local_expectation_not_found_in_mem-e0a28255cdeb

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M11.1`
- Title: Local source expectation not found in MEM

beschreiben, welche Änderungen an einem Funktionsterm dazu führen, dass der zum geänderten Funktionsterm gehörige Graph gegenüber dem ursprünglichen Graphen in x‑ oder y‑Richtung verschoben, in x‑ oder y‑Richtung gestreckt bzw. an einer Koordinatenachse gespiegelt ist. Sie sind sich bewusst, dass bei der Kombination mehrerer solcher Transformationen die Reihenfolge der Ausführung von Bedeutung sein kann. Sie demonstrieren und erläutern diese Zusammenhänge – auch unter Verwendung einer geeigneten Mathematiksoftware – und argumentieren mit ihnen, z. B. bei der Zuordnung von Funktionstermen zu Funktionsgraphen und umgekehrt.

### local_expectation_not_found_in_mem-ed770e1b8eaa

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M12-EA.4.3`
- Title: Local source expectation not found in MEM

untersuchen in einfachen Fällen Verknüpfungen der natürlichen Logarithmusfunktion mit Funktionen bisher bekannter Funktionstypen auch mit den Methoden der Differentialrechnung und nutzen dabei auch die Rechenregeln für Logarithmen sowie die Grenzwerte und .

### local_expectation_not_found_in_mem-f23dc0f868ea

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M11.4.2`
- Title: Local source expectation not found in MEM

unterscheiden bei Extremstellen und Wendestellen zwischen notwendigen und hinreichenden Bedingungen. Sie begründen u. a., dass die Bedingung f ′(x0) = 0 notwendig, aber nicht hinreichend für die Existenz einer Extremstelle einer differenzierbaren Funktion f an der Stelle x0 ist.

### local_expectation_not_found_in_mem-f52e560ea864

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M10.3`
- Title: Local source expectation not found in MEM

erläutern, wie sich die Werte von Sinus und Kosinus für Winkelgrößen größer als 2π sowie für negative Winkelgrößen mithilfe des Einheitskreises auf Werte für Winkelgrößen zwischen 0 und 2π zurückführen lassen.

### local_expectation_not_found_in_mem-f57b2f6d5045

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M11.1`
- Title: Local source expectation not found in MEM

überprüfen rechnerisch, ob die Graphen von Funktionen achsensymmetrisch bezüglich der y‑Achse bzw. punktsymmetrisch bezüglich des Koordinatenursprungs sind.

### local_expectation_not_found_in_mem-f6751e9b1f47

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M8.3`
- Title: Local source expectation not found in MEM

geben für gebrochen-rationale Funktionen der Form die maximale Definitionsmenge an, bestimmen die Schnittpunkte des Graphen mit den Koordinatenachsen und beschreiben den Einfluss einer Änderung der Werte der Parameter b und c auf den Verlauf des Graphen. Zur Untersuchung und Veranschaulichung nutzen sie auch eine dynamische Mathematiksoftware.

### local_expectation_not_found_in_mem-f8676a875b04

- Category: `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`
- Severity: `review`
- Jurisdiction: `DE-BY`
- Local: `LehrplanPLUS Bayern Gymnasium Mathematik, M13.1`
- Title: Local source expectation not found in MEM

ermitteln Terme von Stammfunktionen, auch unter Verwendung der Integrationsregeln für , und .

### mem_curriculum_missing_for_local_source-04568bf479ca

- Category: `MEM_CURRICULUM_MISSING_FOR_LOCAL_SOURCE`
- Severity: `watch`
- Jurisdiction: `DE-TH`
- Title: Thüringen: local mathematics source extraction exists, but MEM has no matching curriculum plans

Local SkillPilot source extraction has 2 file(s) and 545 source goals for Thüringen. The MEM endpoint currently exposes the state vocabulary, but no Thüringen SekI/SekII curriculum plan matching Mathematik/Gymnasium.

### mem_curriculum_missing_for_local_source-04eaafe7b0a9

- Category: `MEM_CURRICULUM_MISSING_FOR_LOCAL_SOURCE`
- Severity: `watch`
- Jurisdiction: `DE-HB`
- Title: Bremen: local mathematics source extraction exists, but MEM has no matching curriculum plans

Local SkillPilot source extraction has 2 file(s) and 531 source goals for Bremen. The MEM endpoint currently exposes the state vocabulary, but no Bremen SekI/SekII curriculum plan matching Mathematik/Gymnasium.

### mem_curriculum_missing_for_local_source-23f2c417c05d

- Category: `MEM_CURRICULUM_MISSING_FOR_LOCAL_SOURCE`
- Severity: `watch`
- Jurisdiction: `DE-NI`
- Title: Niedersachsen: local mathematics source extraction exists, but MEM has no matching curriculum plans

Local SkillPilot source extraction has 2 file(s) and 581 source goals for Niedersachsen. The MEM endpoint currently exposes the state vocabulary, but no Niedersachsen SekI/SekII curriculum plan matching Mathematik/Gymnasium.

### mem_curriculum_missing_for_local_source-411f6f626b43

- Category: `MEM_CURRICULUM_MISSING_FOR_LOCAL_SOURCE`
- Severity: `watch`
- Jurisdiction: `DE-SL`
- Title: Saarland: local mathematics source extraction exists, but MEM has no matching curriculum plans

Local SkillPilot source extraction has 2 file(s) and 1561 source goals for Saarland. The MEM endpoint currently exposes the state vocabulary, but no Saarland SekI/SekII curriculum plan matching Mathematik/Gymnasium.

### mem_curriculum_missing_for_local_source-433c221727d9

- Category: `MEM_CURRICULUM_MISSING_FOR_LOCAL_SOURCE`
- Severity: `watch`
- Jurisdiction: `DE-RP`
- Title: Rheinland-Pfalz: local mathematics source extraction exists, but MEM has no matching curriculum plans

Local SkillPilot source extraction has 2 file(s) and 445 source goals for Rheinland-Pfalz. The MEM endpoint currently exposes the state vocabulary, but no Rheinland-Pfalz SekI/SekII curriculum plan matching Mathematik/Gymnasium.

### mem_curriculum_missing_for_local_source-4dd84fd1d114

- Category: `MEM_CURRICULUM_MISSING_FOR_LOCAL_SOURCE`
- Severity: `watch`
- Jurisdiction: `DE-BW`
- Title: Baden-Württemberg: local mathematics source extraction exists, but MEM has no matching curriculum plans

Local SkillPilot source extraction has 2 file(s) and 499 source goals for Baden-Württemberg. The MEM endpoint currently exposes the state vocabulary, but no Baden-Württemberg SekI/SekII curriculum plan matching Mathematik/Gymnasium.

### mem_curriculum_missing_for_local_source-654e6484d2ee

- Category: `MEM_CURRICULUM_MISSING_FOR_LOCAL_SOURCE`
- Severity: `watch`
- Jurisdiction: `DE-HE`
- Title: Hessen: local mathematics source extraction exists, but MEM has no matching curriculum plans

Local SkillPilot source extraction has 2 file(s) and 917 source goals for Hessen. The MEM endpoint currently exposes the state vocabulary, but no Hessen SekI/SekII curriculum plan matching Mathematik/Gymnasium.

### mem_curriculum_missing_for_local_source-969ba3a5c24c

- Category: `MEM_CURRICULUM_MISSING_FOR_LOCAL_SOURCE`
- Severity: `watch`
- Jurisdiction: `DE-NW`
- Title: Nordrhein-Westfalen: local mathematics source extraction exists, but MEM has no matching curriculum plans

Local SkillPilot source extraction has 2 file(s) and 442 source goals for Nordrhein-Westfalen. The MEM endpoint currently exposes the state vocabulary, but no Nordrhein-Westfalen SekI/SekII curriculum plan matching Mathematik/Gymnasium.

### mem_curriculum_missing_for_local_source-97302e81cbef

- Category: `MEM_CURRICULUM_MISSING_FOR_LOCAL_SOURCE`
- Severity: `watch`
- Jurisdiction: `DE-HH`
- Title: Hamburg: local mathematics source extraction exists, but MEM has no matching curriculum plans

Local SkillPilot source extraction has 2 file(s) and 626 source goals for Hamburg. The MEM endpoint currently exposes the state vocabulary, but no Hamburg SekI/SekII curriculum plan matching Mathematik/Gymnasium.

### mem_curriculum_missing_for_local_source-a314cbac7646

- Category: `MEM_CURRICULUM_MISSING_FOR_LOCAL_SOURCE`
- Severity: `watch`
- Jurisdiction: `DE-ST`
- Title: Sachsen-Anhalt: local mathematics source extraction exists, but MEM has no matching curriculum plans

Local SkillPilot source extraction has 2 file(s) and 612 source goals for Sachsen-Anhalt. The MEM endpoint currently exposes the state vocabulary, but no Sachsen-Anhalt SekI/SekII curriculum plan matching Mathematik/Gymnasium.

### mem_curriculum_missing_for_local_source-a57f6bde5a04

- Category: `MEM_CURRICULUM_MISSING_FOR_LOCAL_SOURCE`
- Severity: `watch`
- Jurisdiction: `DE-SH`
- Title: Schleswig-Holstein: local mathematics source extraction exists, but MEM has no matching curriculum plans

Local SkillPilot source extraction has 2 file(s) and 620 source goals for Schleswig-Holstein. The MEM endpoint currently exposes the state vocabulary, but no Schleswig-Holstein SekI/SekII curriculum plan matching Mathematik/Gymnasium.

### mem_curriculum_missing_for_local_source-a77dc312361a

- Category: `MEM_CURRICULUM_MISSING_FOR_LOCAL_SOURCE`
- Severity: `watch`
- Jurisdiction: `DE-MV`
- Title: Mecklenburg-Vorpommern: local mathematics source extraction exists, but MEM has no matching curriculum plans

Local SkillPilot source extraction has 2 file(s) and 588 source goals for Mecklenburg-Vorpommern. The MEM endpoint currently exposes the state vocabulary, but no Mecklenburg-Vorpommern SekI/SekII curriculum plan matching Mathematik/Gymnasium.

### mem_curriculum_missing_for_local_source-cb7d88d22353

- Category: `MEM_CURRICULUM_MISSING_FOR_LOCAL_SOURCE`
- Severity: `watch`
- Jurisdiction: `DE-BB`
- Title: Brandenburg: local mathematics source extraction exists, but MEM has no matching curriculum plans

Local SkillPilot source extraction has 2 file(s) and 485 source goals for Brandenburg. The MEM endpoint currently exposes the state vocabulary, but no Brandenburg SekI/SekII curriculum plan matching Mathematik/Gymnasium.

### mem_curriculum_missing_for_local_source-f36e1325f6cb

- Category: `MEM_CURRICULUM_MISSING_FOR_LOCAL_SOURCE`
- Severity: `watch`
- Jurisdiction: `DE-BE`
- Title: Berlin: local mathematics source extraction exists, but MEM has no matching curriculum plans

Local SkillPilot source extraction has 2 file(s) and 484 source goals for Berlin. The MEM endpoint currently exposes the state vocabulary, but no Berlin SekI/SekII curriculum plan matching Mathematik/Gymnasium.

### mem_expectation_not_found_in_local_source-00456f9a1b5e

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/fe3ba528-ac7b-467f-aa60-ad15f4d9ea93
- Title: MEM expectation not found in local source extraction: Mathematik 8

geben für gebrochen-rationale Funktionen der Form [[image:GYM_M_8-1;class:center]] die maximale Definitionsmenge an, bestimmen die Schnittpunkte des Graphen mit den Koordinatenachsen und beschreiben den Einfluss einer Änderung der Werte der Parameter b und c auf den Verlauf des Graphen. Zur Untersuchung und Veranschaulichung nutzen sie auch eine dynamische Mathematiksoftware.

### mem_expectation_not_found_in_local_source-03d8d7b92bf1

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/610bc549-9349-42e9-84a1-03e7843673b3
- Title: MEM expectation not found in local source extraction: Mathematik 11

erläutern anhand des Graphen sowie anhand des Funktionsterms das Grenzverhalten von Funktionen für x&nbsp;→&nbsp;+∞ und für x&nbsp;→&nbsp;−∞; sie unterscheiden Konvergenz und Divergenz und veranschaulichen die Konvergenz mithilfe der Vorstellung eines beliebig schmalen Streifens, den ein gegebener Funktionsgraph jeweils ab einem bestimmten x&#x2011;Wert nicht mehr verlässt. Zur Angabe des Grenzverhaltens verwenden sie die Grenzwertschreibweise.

### mem_expectation_not_found_in_local_source-05186e864caa

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/a64ac9e0-3313-4ae8-be3b-247a8343a0b2
- Title: MEM expectation not found in local source extraction: Mathematik 5

lösen Gleichungen der Form a&nbsp;&sdot;&nbsp;x&nbsp;=&nbsp;b, x&nbsp;:&nbsp;a&nbsp;=&nbsp;b und a&nbsp;:&nbsp;x&nbsp;=&nbsp;b, wie in der Grundschule angebahnt, durch systematisches Probieren oder durch Bildung der jeweiligen Umkehraufgabe.

### mem_expectation_not_found_in_local_source-0d497216266c

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/67bcfaaf-7322-4db0-9f67-730f31075d30
- Title: MEM expectation not found in local source extraction: Mathematik 12 (Vertiefungskurs)

berechnen Lösungen von Kreisteilungsgleichungen der Form z<sup>n</sup>&nbsp;=&nbsp;1 und interpretieren die so erhaltenen n-ten Einheitswurzeln am Einheitskreis.

### mem_expectation_not_found_in_local_source-139baa922f6c

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/791f9c05-dfe0-4572-bf1e-6998f7d0e41a
- Title: MEM expectation not found in local source extraction: Mathematik 8

machen die Struktur der Formeln für Umfang bzw. Flächeninhalt eines Kreises plausibel und bestimmen, z.&nbsp;B. durch Messen, einen Näherungswert für die Kreiszahl&nbsp;&pi;. Sie interpretieren die Flächeninhaltsformel als nicht lineare Zuordnung und wenden die Formeln bei innermathematischen Fragestellungen (auch zu einfachen Kreisteilen) sowie in Sachsituationen an.

### mem_expectation_not_found_in_local_source-1773675e1cad

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/6364654e-1238-4860-8a96-869d9fd1a71f
- Title: MEM expectation not found in local source extraction: Mathematik 11

unterscheiden bei Extremstellen und Wendestellen zwischen notwendigen und hinreichenden Bedingungen. Sie begründen u.&nbsp;a., dass die Bedingung f&#x202f;&prime;(x<sub>0</sub>)&nbsp;=&nbsp;0 notwendig, aber nicht hinreichend für die Existenz einer Extremstelle einer differenzierbaren Funktion f an der Stelle x<sub>0</sub> ist.

### mem_expectation_not_found_in_local_source-1a8fa570a9fb

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/126cf346-2a74-47aa-bf4a-48c0b1e39006
- Title: MEM expectation not found in local source extraction: Mathematik 8

zeichnen den Graphen einer gebrochen-rationalen Funktion der Form [[image:GYM_M_8-1;class:center]] einschließlich seiner Asymptoten und ermitteln umgekehrt anhand des Graphen einer solchen Funktion die zugehörigen Werte der Parameter.

### mem_expectation_not_found_in_local_source-2444f18adcab

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/a6c2f017-a9f3-4881-84ca-797bc3f5dcbf
- Title: MEM expectation not found in local source extraction: Mathematik 11

beschreiben, welche Änderungen an einem Funktionsterm dazu führen, dass der zum geänderten Funktionsterm gehörige Graph gegenüber dem ursprünglichen Graphen in x&#x2011; oder y&#x2011;Richtung verschoben, in x&#x2011; oder y&#x2011;Richtung gestreckt bzw. an einer Koordinatenachse gespiegelt ist. Sie sind sich bewusst, dass bei der Kombination mehrerer solcher Transformationen die Reihenfolge der Ausführung von Bedeutung sein kann. Sie demonstrieren und erläutern diese Zusammenhänge – auch unter Verwendung einer geeigneten Mathematiksoftware – und argumentieren mit ihnen, z.&nbsp;B. bei der Zuordnung von Funktionstermen zu Funktionsgraphen und umgekehrt.

### mem_expectation_not_found_in_local_source-2c02ef698cbb

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/458302a1-63bf-4541-9d8e-2a214f4181b6
- Title: MEM expectation not found in local source extraction: Mathematik 10

überprüfen rechnerisch sowie durch Analyse der Struktur des Funktionsterms, ob der Graph einer ganzrationalen Funktion Achsensymmetrie bezüglich der y&#x2011;Achse bzw. Punktsymmetrie bezüglich des Koordinatenursprungs aufweist.

### mem_expectation_not_found_in_local_source-325c4600525c

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/734b3df7-b400-400b-8933-344210fe8519
- Title: MEM expectation not found in local source extraction: Mathematik 5

lösen Gleichungen der Form a&nbsp;+&nbsp;x&nbsp;=&nbsp;b, x&nbsp;&minus;&nbsp;a&nbsp;=&nbsp;b und a&nbsp;&minus;&nbsp;x&nbsp;=&nbsp;b, wie in der Grundschule angebahnt, durch systematisches Probieren oder durch Bildung der jeweiligen Umkehraufgabe.

### mem_expectation_not_found_in_local_source-32ca92a68360

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/bb00159c-c8ac-4d8c-a53d-c89f6b2e67d8
- Title: MEM expectation not found in local source extraction: Mathematik 8

interpretieren Funktionsgleichungen der Form y&nbsp;=&nbsp;m&nbsp;&sdot;&nbsp;x&nbsp;+&nbsp;t als Gleichungen von Geraden und erläutern die Bedeutung der Parameter m und t, auch unter Verwendung einer dynamischen Mathematiksoftware. Sie zeichnen die Graphen linearer Funktionen und ermitteln umgekehrt anhand der Graphen solcher Funktionen die zugehörigen Werte der Parameter.

### mem_expectation_not_found_in_local_source-3a0c4ce84fa3

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/7a7d6bd3-4a51-4fae-9cc6-149770f5fc15
- Title: MEM expectation not found in local source extraction: Mathematik 8

verstehen, dass der Spezialfall einer linearen Funktion mit einer Funktionsgleichung der Form y&nbsp;=&nbsp;a&nbsp;&sdot;&nbsp;x als Zuordnung zweier Größen aufgefasst werden kann, die direkt proportional zueinander sind. Diesen Zusammenhang zwischen den beiden Größen erläutern sie an der zugehörigen Ursprungsgeraden und erkennen zueinander direkt proportionale Größen als solche, u.&nbsp;a. im Kontext naturwissenschaftlicher Fragestellungen.

### mem_expectation_not_found_in_local_source-3d010bd1bb90

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/9d7b0644-0d84-4fc3-a19b-ee50a0ff2ce7
- Title: MEM expectation not found in local source extraction: Mathematik 12 (erhöhtes Anforderungsniveau)

führen Sachsituationen durch Analogiebildung auf die Urnenmodelle &bdquo;Ziehen mit Zurücklegen&ldquo; bzw. &bdquo;Ziehen ohne Zurücklegen&ldquo; zurück, um die Anzahl möglicher Ergebnisse auch unter Zuhilfenahme von Binomialkoeffizienten zu bestimmen. In diesen Fällen berechnen sie damit verbundene Wahrscheinlichkeiten. 

### mem_expectation_not_found_in_local_source-4383f87c8e34

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/a8968317-28fc-48cd-a234-344a76206070
- Title: MEM expectation not found in local source extraction: Mathematik 10

beschreiben für Funktionen mit Termen der Form a&nbsp;&sdot;&nbsp;sin(b&nbsp;&sdot;&nbsp;(x&nbsp;+&nbsp;c))&nbsp;+&nbsp;d, wie sich Änderungen der Parameter a, b, c und d auf den Funktionsgraphen auswirken. Zur Untersuchung, Demonstration und Erläuterung dieser Zusammenhänge nutzen sie auch eine dynamische Mathematiksoftware.

### mem_expectation_not_found_in_local_source-443daa461afe

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/0c4850c6-60b2-4b4f-ac08-e02a354468b5
- Title: MEM expectation not found in local source extraction: Mathematik 10

zeichnen für einen gegebenen Funktionsterm der Form a&nbsp;&sdot;&nbsp;sin(b&nbsp;&sdot;&nbsp;(x&nbsp;+&nbsp;c))&nbsp;+&nbsp;d unter Verwendung geeigneter Merkmale (insbesondere Amplitude und Periode) den zugehörigen Funktionsgraphen und ermitteln umgekehrt aus dem Graphen den zugehörigen Funktionsterm.

### mem_expectation_not_found_in_local_source-45da46f0eb9b

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/f722ae84-39eb-4b1a-b205-7d16dba6dc41
- Title: MEM expectation not found in local source extraction: Mathematik 12 (erhöhtes Anforderungsniveau)

interpretieren Ergebnisse einseitiger Signifikanztests im Sachzusammenhang (u.&nbsp;a. Umfragen vor Wahlen) und widerlegen Fehlinterpretationen. Sie erläutern insbesondere, dass ein Signifikanztest keine Aussage über die Wahrscheinlichkeit der Gültigkeit der Nullhypothese zulässt und was unter einem &bdquo;signifikanten Ergebnis&ldquo; verstanden wird.

### mem_expectation_not_found_in_local_source-4f96d4a79b87

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/1838acd6-9140-4032-9876-d78f4a22c504
- Title: MEM expectation not found in local source extraction: Mathematik 11

veranschaulichen die formale Definition der strengen Monotonie  anhand geeigneter Skizzen und begründen damit z.&nbsp;B. die strenge Monotonie der Funktion x&nbsp;↦&nbsp;x<sup>3</sup>&nbsp;(x&#x202f;&isin;&#x202f;<span style="letter-spacing: -0.06em">I</span>R). Sie erläutern, wie man aus der ersten Ableitung einer Funktion Rückschlüsse auf deren Monotonieverhalten sowie auf deren Extremstellen ziehen kann, und nutzen diese Zusammenhänge bei der Untersuchung ganzrationaler Funktionen.

### mem_expectation_not_found_in_local_source-52f417334451

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/414ebe7f-0ebf-440f-a6f3-6cf93a727600
- Title: MEM expectation not found in local source extraction: Mathematik 10

veranschaulichen auf der Grundlage ihrer in der Jahrgangsstufe&nbsp;9 erworbenen Kenntnisse Sinus- und Kosinuswerte von Winkelgrößen zwischen 0 und 2&pi; am Einheitskreis und ermitteln insbesondere das zugehörige Vorzeichen sicher. Sie bestimmen die Größen von Winkeln, die einen vorgegebenen Sinus- oder Kosinuswert besitzen.

### mem_expectation_not_found_in_local_source-57b4946b149a

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/71a7c927-efd2-4b95-a657-2e06774f8999
- Title: MEM expectation not found in local source extraction: Mathematik 10

erläutern, wie sich die Werte von Sinus und Kosinus für Winkelgrößen größer als 2&pi; sowie für negative Winkelgrößen mithilfe des Einheitskreises auf Werte für Winkelgrößen zwischen 0 und 2&pi; zurückführen lassen.

### mem_expectation_not_found_in_local_source-5d8ad6f284fd

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/cf158fd6-3bf0-4b47-8a12-5d81255079a4
- Title: MEM expectation not found in local source extraction: Mathematik 13 (erhöhtes Anforderungsniveau)

bestimmen mithilfe der Integralrechnung das Volumen eines Körpers, der durch Rotation eines Funktionsgraphen um die x&#x2011;Achse entsteht. 

### mem_expectation_not_found_in_local_source-673477842c7c

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/1fc5fb77-dc3b-4f34-80d7-13bbd22b6f32
- Title: MEM expectation not found in local source extraction: Mathematik 12 (erhöhtes Anforderungsniveau)

formulieren eine axiomatische Definition von Wahrscheinlichkeit und folgern aus den Axiomen weitere Aussagen über Wahrscheinlichkeiten. Sie vergleichen diesen Wahrscheinlichkeitsbegriff mit anderen Ansätzen zur Begriffsdefinition, z.&nbsp;B. Laplace&apos;scher, frequentistischer oder subjektiver Wahrscheinlichkeitsbegriff.

### mem_expectation_not_found_in_local_source-6b3ac43d4733

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/f5b08c86-1fed-4cd9-8e70-234277651634
- Title: MEM expectation not found in local source extraction: Mathematik 8

verstehen, dass der Spezialfall einer gebrochen-rationalen Funktion mit einer Funktionsgleichung der Form [[image:GYM_M_8-2;class:center]] als Zuordnung zweier Größen aufgefasst werden kann, die indirekt proportional zueinander sind. Diesen Zusammenhang zwischen den beiden Größen erläutern sie am zugehörigen Graphen und erkennen zueinander indirekt proportionale Größen als solche, u.&nbsp;a. im Kontext naturwissenschaftlicher Fragestellungen.

### mem_expectation_not_found_in_local_source-6ba1d66d0990

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/71cca0a4-d35a-4a07-bb8e-eb4661b0566a
- Title: MEM expectation not found in local source extraction: Mathematik 11

überprüfen rechnerisch, ob die Graphen von Funktionen achsensymmetrisch bezüglich der y&#x2011;Achse bzw. punktsymmetrisch bezüglich des Koordinatenursprungs sind.

### mem_expectation_not_found_in_local_source-6e18c8ddb0ca

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/cb639d9d-d1dd-4e5e-8e93-e88486a12fee
- Title: MEM expectation not found in local source extraction: Mathematik 9

sind sich bewusst, dass jede der drei Darstellungsformen des Terms einer quadratischen Funktion, die allgemeine Form ax<sup>2</sup>&nbsp;+&nbsp;bx&nbsp;+&nbsp;c, die Scheitelpunktform a&nbsp;&sdot;&nbsp;(x&nbsp;&minus;&nbsp;x<sub>S</sub>)<sup>2</sup>&nbsp;+&nbsp;y<sub>S</sub> und die Nullstellenform a&nbsp;&sdot;&nbsp;(x&nbsp;&minus;&nbsp;x<sub>1</sub>)&nbsp;&sdot;&nbsp;(x&nbsp;&minus;&nbsp;x<sub>2</sub>), Vorteile besitzt, und nutzen diese Formen situationsgerecht, u.&nbsp;a. auch beim Argumentieren.

### mem_expectation_not_found_in_local_source-725815b64e5c

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/9b974972-5835-4fbc-88f3-7b3246aeb394
- Title: MEM expectation not found in local source extraction: Mathematik 10

beschreiben für Funktionen mit Termen der Form b&nbsp;&sdot;&nbsp;a<sup>x</sup> in Abhängigkeit von a und b den Verlauf des zugehörigen Graphen und dessen typische Merkmale (Schnittpunkt mit der y&#x2011;Achse, asymptotisches Verhalten, Monotonieverhalten) und argumentieren damit. Zur Demonstration und Erläuterung dieser Beziehungen nutzen sie auch eine dynamische Mathematiksoftware.

### mem_expectation_not_found_in_local_source-788d69c01f9e

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/f87b4c33-14d5-4018-b3ed-30eca20265b8
- Title: MEM expectation not found in local source extraction: Mathematik 9

ermitteln durch flexible Nutzung der binomischen Formeln die Koordinaten des Scheitels einer Parabel aus dem zugehörigen Funktionsterm, auch wenn dieser in der Form ax<sup>2</sup>&nbsp;+&nbsp;bx&nbsp+&nbsp;c vorliegt, und zeichnen den zugehörigen Graphen.

### mem_expectation_not_found_in_local_source-7c7137802fa6

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/6c4eb7c5-a4dc-4e07-87f9-e89006dda4d7
- Title: MEM expectation not found in local source extraction: Mathematik 11

erläutern, dass in Sachzusammenhängen (z.&nbsp;B. in der medizinischen Diagnostik) klar zwischen P<sub>B</sub>(A), P<sub>A</sub>(B) und P(A&cap;B) unterschieden werden muss. Sie sind in der Lage, mithilfe von Vierfeldertafeln oder Baumdiagrammen – auch solchen, in denen sie Wahrscheinlichkeiten mithilfe von absoluten Häufigkeiten in den Feldern bzw. Knoten illustrieren – von der einen auf die andere bedingte Wahrscheinlichkeit zu schließen.

### mem_expectation_not_found_in_local_source-88835dda5dab

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/2be15419-d3c7-46de-8f13-1fcd64bbccc5
- Title: MEM expectation not found in local source extraction: Mathematik 5

verstehen das Prinzip des Messens und rechnen Größenangaben bei Geld (&euro;, ct), Länge (km, m, dm, cm, mm), Masse (t, kg, g, mg) und Zeit (h, min, s) jeweils in andere Einheiten um; dabei verwenden sie bei den Größen Geld, Länge und Masse &ndash; unter Rückgriff auf Einheitentafeln &ndash; auch Angaben in Kommaschreibweise.

### mem_expectation_not_found_in_local_source-8b6ed4cbe25d

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/125a8237-c294-42cf-a60c-56f58fc8b4f5
- Title: MEM expectation not found in local source extraction: Mathematik 11

ermitteln mithilfe des Funktionsterms das links- und rechtsseitige Grenzverhalten einer einfachen gebrochen-rationalen Funktion für x&nbsp;→&nbsp;x<sub>0</sub>, um den Verlauf des Graphen in der Umgebung einer Polstelle x<sub>0</sub> zu beschreiben. Zur Angabe des Grenzverhaltens verwenden sie die Grenzwertschreibweise und geben die Gleichung der zugehörigen senkrechten Asymptote des Graphen an.

### mem_expectation_not_found_in_local_source-8cd1f293584d

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/6e47efbc-724e-4f00-8b13-14803de0a452
- Title: MEM expectation not found in local source extraction: Mathematik 10

bestimmen mithilfe der Monte-Carlo-Methode unter Einsatz eines Tabellenkalkulationsprogramms oder einer anderen geeigneten Software (z.&nbsp;B. unter Verwendung bedingter Anweisungen) einen Näherungswert für die Kreiszahl &pi;. Sie vergleichen dieses Verfahren mit einem nicht zufallsbasierten Verfahren zur Bestimmung eines Näherungswerts von &pi;, das z.&nbsp;B. auf der Streifenmethode beruht.

### mem_expectation_not_found_in_local_source-8ff5e43639d6

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/d93fb389-aac0-4f29-955a-471ef72376fd
- Title: MEM expectation not found in local source extraction: Mathematik 9

begründen die Zusammenhänge (sin&nbsp;&alpha;)<sup>2</sup>&nbsp;+&nbsp;(cos&nbsp;&alpha;)<sup>2</sup>&nbsp;=&nbsp;1, [[image:GYM_M_9-2;class:center]], cos&nbsp;&alpha;&nbsp;=&nbsp;sin&nbsp;(90&deg;&nbsp;&minus;&nbsp;&alpha;) und sin&nbsp;&alpha;&nbsp;=&nbsp;cos&nbsp;(90&deg;&nbsp;&minus;&nbsp;&alpha;).

### mem_expectation_not_found_in_local_source-9d07a9a49ad5

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/a7e32a68-fd1d-4c00-909a-ee525a89c799
- Title: MEM expectation not found in local source extraction: Mathematik 13 (erhöhtes Anforderungsniveau)

ermitteln Terme von Stammfunktionen, auch unter Verwendung der Integrationsregeln für [[image:GYM_M_13-1;class:center]], [[image:GYM_M_13-2;class:center]] und [[image:GYM_M_13-3;class:center]].

### mem_expectation_not_found_in_local_source-ae33a4d62f26

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/486ba5f9-253c-46dc-b70e-6c616b4fd25e
- Title: MEM expectation not found in local source extraction: Mathematik 9

beschreiben für quadratische Funktionen mit Termen der Form a&nbsp;&sdot;&nbsp;(x&nbsp;+&nbsp;d)<sup>2</sup>&nbsp;+&nbsp;e, wie sich Änderungen der Werte der Parameter a, d und e auf die zugehörige Parabel auswirken; sie bestimmen für Beispiele derart angegebener Funktionen jeweils die Anzahl der Nullstellen und die Lösungen der zugehörigen Gleichung. Zur Untersuchung und Veranschaulichung dieser Zusammenhänge nutzen sie auch eine dynamische Mathematiksoftware.

### mem_expectation_not_found_in_local_source-af17152bccbf

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/f75788cd-4cea-4fdf-a5a1-f3917f15cc2b
- Title: MEM expectation not found in local source extraction: Mathematik 9

beschreiben für Funktionen mit Termen der Form a&nbsp;&sdot;&nbsp;x<sup>n</sup> in Abhängigkeit von a und n den Verlauf des zugehörigen Graphen sowie seine Symmetrie; zur Untersuchung und Veranschaulichung nutzen sie auch eine dynamische Mathematiksoftware.

### mem_expectation_not_found_in_local_source-b420515481de

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/6836ffb7-0524-49f1-af73-ffa5e4dc5f64
- Title: MEM expectation not found in local source extraction: Mathematik 12 (erhöhtes Anforderungsniveau)

untersuchen in einfachen Fällen Verknüpfungen der natürlichen Logarithmusfunktion mit Funktionen bisher bekannter Funktionstypen auch mit den Methoden der Differentialrechnung und nutzen  dabei auch die Rechenregeln für Logarithmen sowie die Grenzwerte [[image:GYM_M_12-3;class:center]] und [[image:GYM_M_12-4;class:center]].

### mem_expectation_not_found_in_local_source-b8ef07369342

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/c4ab1fb0-ced3-4094-8ea3-88612f7f5a7b
- Title: MEM expectation not found in local source extraction: Mathematik 10

lösen einfache Exponentialgleichungen und wenden dabei auch die Regel log<sub>b</sub>(u<sup>z</sup>)&nbsp;=&nbsp;z&nbsp;&sdot;&nbsp;log<sub>b</sub>(u) an.

### mem_expectation_not_found_in_local_source-b9fdc82e9b87

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/f38c2d03-adf0-470b-a940-c01229353ef1
- Title: MEM expectation not found in local source extraction: Mathematik 9

interpretieren, ausgehend von Vierfeldertafeln mit absoluten Häufigkeiten, die zugehörigen relativen Häufigkeiten als Wahrscheinlichkeiten von Ereignissen eines entsprechenden Zufallsexperiments, begründen auf dieser Grundlage den Zusammenhang P(A&cup;B) =&nbsp;P(A) +&nbsp;P(B) –&nbsp;P(A&cap;B) und bestimmen Wahrscheinlichkeiten im Kontext zweier miteinander verknüpfter Ereignisse.

### mem_expectation_not_found_in_local_source-d936b812ada8

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/63aa0c9b-937f-499f-b93e-e5c5d7f8757f
- Title: MEM expectation not found in local source extraction: Mathematik 9

verstehen die Definition der allgemeinen Wurzel und sind in der Lage, damit Gleichungen zu lösen, die sich auf die Form x<sup>n</sup>&nbsp;=&nbsp;c zurückführen lassen. Die Anzahl der Lösungen machen sie durch eine geeignete Skizze plausibel.

### mem_expectation_not_found_in_local_source-f8edb2575697

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/f3e246ca-b34d-41ba-bc01-c00925e399e0
- Title: MEM expectation not found in local source extraction: Mathematik 9

verstehen das Grundprinzip eines indirekten Beweises, vollziehen damit den Beweis für die Irrationalität von [[image:GYM_M_9-1;class:top]] nach und erläutern diesen; dabei erfassen sie auch, dass das Beweisen eine zentrale Bedeutung für die Mathematik und deren stringenten Aufbau hat. Sie begründen die Notwendigkeit, die Menge der rationalen Zahlen zu erweitern, nennen Quadratwurzeln und andere irrationale Zahlen (u.&nbsp;a. &pi;) als Beispiele reeller nicht rationaler Zahlen und sind sich der kulturhistorischen Bedeutung dieser Zahlbereichserweiterung bewusst.

### mem_expectation_not_found_in_local_source-f9c2efaa082d

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/6818de54-7438-4a21-ad08-a767d3910627
- Title: MEM expectation not found in local source extraction: Mathematik 6

wandeln Brüche in Dezimalbrüche um und stellen umgekehrt endliche Dezimalbrüche sowie rein periodische Dezimalbrüche der Periodenlänge eins als Brüche dar; bei angemessen gewählten Zahlen führen sie den Darstellungswechsel auch im Kopf durch. Sie setzen diese Fertigkeiten insbesondere beim Größenvergleich von rationalen Zahlen ein und greifen dabei auch auf ihr automatisiertes Wissen der Dezimalbruchdarstellung häufig verwendeter Brüche zurück. Mit Ergebnisanzeigen digitaler Rechenhilfen (z.&nbsp;B. Taschenrechner-App) gehen sie reflektiert um, z.&nbsp;B. mit „0,166666667“ bei Eingabe von „1&#x202f;:&#x202f;6&#x202f;=“.

### mem_expectation_not_found_in_local_source-fae28d223ac6

- Category: `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`
- Severity: `review`
- Jurisdiction: `DE-BY`
- MEM: https://lp-bavaria.org/3cb0661c-4857-4121-be13-4256aebd9947
- Title: MEM expectation not found in local source extraction: Mathematik 12 (erhöhtes Anforderungsniveau)

machen durch einen Vergleich des Wachstums von Exponential- und Potenzfunktion die Grenzwerte [[image:GYM_M_12-1;class:center]] und [[image:GYM_M_12-2;class:center]] plausibel.

