# Informed AI assessment proposal: 4a58df57-f791-502f-8b8d-9ba155e46035

Status: needs_review. No canonical or active-ledger writes; not a human approval. Exact reviewer model: unknown.

## German task

## Materialpaket: Einzelereignisse und Interferenz am Doppelspalt

Das folgende idealisierte Datenset wurde für die Aufgabe konstruiert; es wird nicht als neuer Laborbefund ausgegeben. Bearbeitungsumfang: 30 BE; ein Taschenrechner ist zulässig.

### Material A – Unmarkierte Wege

Gleich präparierte einzelne Photonen treffen nacheinander auf zwei geöffnete Spalte. Die Einzelphotonenpräparation sei unabhängig abgesichert; es befindet sich jeweils höchstens ein Photon im Aufbau. Ein Schirm registriert einzelne örtlich begrenzte Nachweise. Die Geometrie und die Präparation bleiben während eines Durchlaufs gleich. Die beiden Wege sind kohärent und in A nicht durch zusätzliche Merkmale unterscheidbar.

Betrachtet werden neun gleich breite benachbarte Zählbereiche im zentralen Schirmausschnitt. Die gemeinsame Einzelspalt-Hüllkurve wird in diesem engen Ausschnitt näherungsweise als konstant behandelt. Die angegebenen Häufigkeiten beziehen sich nur auf Nachweise in diesen neun Bereichen, nicht auf den gesamten Schirm.

### Material B – Verfügbare Weginformation

Spalt 1 ist mit horizontaler und Spalt 2 mit vertikaler Polarisation verknüpft. Diese beiden Marker sind unterscheidbar und könnten den Weg zugänglich machen. Der Schirm summiert beide Polarisationen ohne Polarisationsanalyse; es wird kein Marker ausgelesen. Im Übrigen ist der Aufbau wie in A. Die Datensätze sind auf ihre jeweilige Gesamtzahl im betrachteten Ausschnitt zu normieren.

| Zählbereich von links nach rechts | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| A: Zahl der Nachweise | 100 | 25 | 100 | 25 | 100 | 25 | 100 | 25 | 100 |
| B: Zahl der Nachweise | 60 | 60 | 60 | 60 | 60 | 60 | 60 | 60 | 60 |

Als einfaches Maß für den Kontrast dieser Zählwerte dürfen Sie $V=(n_\mathrm{max}-n_\mathrm{min})/(n_\mathrm{max}+n_\mathrm{min})$ verwenden. Reale endliche Zählreihen schwanken statistisch; die Tabelle ist kein Gesetz für jeden einzelnen Durchlauf.

Fachlicher Hintergrund der Anordnung: [Harvard Natural Sciences Lecture Demonstrations: Single Photon Interference](https://sciencedemonstrations.fas.harvard.edu/presentations/single-photon-interference). Die konkrete Tabelle ist eigenständig konstruiert und wurde nicht aus dieser Quelle übernommen.

### Aufgaben

1. Vergleichen Sie die Vorhersagen eines einfachen klassischen Modells unabhängiger Teilchen, eines klassischen kontinuierlichen Wellenmodells und der Quantenbeschreibung für A. Unterscheiden Sie räumliches Muster und einzelne Nachweise. Erläutern Sie auch, warum einzelne helle Punkte allein noch keine unabhängige Prüfung der Einzelphotonenpräparation ersetzen. (8 BE)
2. Bestimmen Sie die Gesamtzahlen für A und B, die relativen Häufigkeiten in Bereich 5 und 6 sowie den Kontrast $V$ beider Datensätze. Deuten Sie die relativen Häufigkeiten als Schätzungen für bedingte Nachweiswahrscheinlichkeiten im betrachteten Ausschnitt. Können Sie daraus den Bereich des nächsten einzelnen Nachweises sicher vorhersagen? (8 BE)
3. Erklären Sie den Kontrastunterschied zwischen A und B mithilfe der verfügbaren Weginformation. Beurteilen Sie die Aussage: „Weil niemand die Polarisation tatsächlich ausliest, müsste B dasselbe Interferenzmuster wie A zeigen.“ Beschreiben Sie dabei die Rolle der unterscheidbaren Polarisationen, ohne eine mechanische Ablenkung der Photonen als notwendige Ursache zu behaupten. (8 BE)
4. A wird mit halbierter Photonenrate bei gleicher Messdauer, aber unveränderter Präparation und Geometrie wiederholt. Prognostizieren Sie Gesamtzahl und Zahl in Bereich 5 als Erwartungswerte sowie die normierte Verteilung. Könnte allein eine geringere Photonenrate das Muster A in das normierte Muster B verwandeln? Begründen Sie unter Beachtung statistischer Schwankungen. (6 BE)

## German worked solution

1. Im einfachen klassischen Teilchenmodell addieren sich die Verteilungen unabhängiger Wege; es entsteht keine kohärente Hell-Dunkel-Modulation durch die beiden Wege. Einzelne punktartige Nachweise passen zur Teilchenvorstellung. Das klassische kontinuierliche Wellenmodell erklärt Interferenz der Amplituden und eine räumlich modulierte Intensität; ohne zusätzliches quantisiertes Nachweismodell erklärt es die einzelne Energieaufnahme als Photonereignis nicht. Die Quantenbeschreibung verbindet einzelne lokalisierte Nachweise mit einer durch kohärente Wahrscheinlichkeitsamplituden bestimmten Ensembleverteilung. Das Muster wächst aus vielen Einzelereignissen, nicht aus einer deterministischen Vorhersage jedes Trefferorts. Punkte allein sichern die Einzelphotonenpräparation nicht ab: Auch die Wechselwirkung eines Detektors mit einem schwachen klassischen Lichtfeld kann diskrete Zählungen liefern. Die Einzelphotonenpräparation wird hier ausdrücklich vorausgesetzt, nicht aus der Tabelle bewiesen.

2. $N_A=5\cdot100+4\cdot25=600$, $N_B=9\cdot60=540$. In A: $\hat P(5)=100/600=1/6\approx0{,}167$, $\hat P(6)=25/600=1/24\approx0{,}0417$. In B: beide $60/540=1/9\approx0{,}111$. Diese Werte sind dimensionslos und bedingt auf einen Nachweis im ausgewählten Ausschnitt. $V_A=(100-25)/(100+25)=0{,}60$; $V_B=0$. Sie beschreiben Häufigkeiten bzw. geschätzte Wahrscheinlichkeiten eines Ensembles. Der nächste einzelne Trefferbereich ist nicht sicher vorhersagbar; auch der bisher seltenere Bereich bleibt möglich.

3. A erhält die Kohärenz der nicht unterscheidbar markierten Wege; die zugehörigen Wahrscheinlichkeitsamplituden können interferieren. In B sind die Wege mit orthogonalen Polarisationen korreliert. Bei der Summation ohne Polarisationsanalyse bleibt die Weginformation prinzipiell verfügbar; die Interferenz zwischen diesen beiden markierten Alternativen tritt in dieser unbedingten Ortsverteilung nicht auf. Ob ein Mensch den Marker tatsächlich ausliest, ändert seine physikalische Unterscheidbarkeit nicht. Die Behauptung ist daher falsch. Das ist kein Beleg für einen notwendigen mechanischen Stoß und keine Wirkung bewusster Beobachtung. Eine andere Messanordnung mit gezielter Polarisationsprojektion und Auswahl wäre ein anderes Experiment, nicht der hier beschriebene Durchlauf.

4. Bei gleicher Dauer sind ungefähr $N'_A=300$ und $n'_5=50$ als Erwartungswerte zu erwarten; die einzelnen Messzahlen müssen nicht genau so ausfallen. Die relativen Wahrscheinlichkeiten, insbesondere $P(5)\approx1/6$ und $P(6)\approx1/24$, bleiben unter unveränderten Bedingungen gleich. Geringere Rate skaliert die mittlere Zahl, nicht die kohärente räumliche Verteilung. Sie kann deshalb allein nicht systematisch das normierte gleichmäßige Muster B erzeugen. Weniger Ereignisse vergrößern nur die relativen statistischen Schwankungen.

## English task

## Material package: Single events and double-slit interference

The following idealized dataset was constructed for this task; it is not presented as a new laboratory observation. Total: 30 marks; a calculator may be used.

### Material A – Unmarked paths

Identically prepared individual photons encounter two open slits one after another. Assume that single-photon preparation has been independently verified and at most one photon is inside the apparatus at a time. A screen registers individual localized detections. Geometry and preparation are unchanged during a run. The two paths are coherent and, in A, are not distinguished by additional markers.

Nine equal-width adjacent counting regions in a central screen section are considered. Across this narrow section, the common single-slit envelope is approximated as constant. Counts refer only to detections in these nine regions, not to the entire screen.

### Material B – Available which-path information

Slit 1 is correlated with horizontal and slit 2 with vertical polarization. These two markers are distinguishable and could make the path accessible. The screen sums both polarizations without polarization analysis; no marker is read out. Otherwise the setup is as in A. Normalize each dataset by its own total count in the selected section.

| Counting region, left to right | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| A: detections | 100 | 25 | 100 | 25 | 100 | 25 | 100 | 25 | 100 |
| B: detections | 60 | 60 | 60 | 60 | 60 | 60 | 60 | 60 | 60 |

For a simple contrast measure of these counts, use $V=(n_\mathrm{max}-n_\mathrm{min})/(n_\mathrm{max}+n_\mathrm{min})$. Real finite count sequences fluctuate statistically; this table is not a law for every individual run.

Physical background: [Harvard Natural Sciences Lecture Demonstrations: Single Photon Interference](https://sciencedemonstrations.fas.harvard.edu/presentations/single-photon-interference). The numerical table was independently constructed, not taken from this source.

### Tasks

1. Compare the predictions of a simple classical model of independent particles, a classical continuous-wave model and the quantum description for A. Distinguish the spatial pattern from individual detections. Also explain why isolated bright spots alone cannot replace independent verification of single-photon preparation. (8 marks)
2. Determine total counts in A and B, relative frequencies in regions 5 and 6, and contrast $V$ for both datasets. Interpret the relative frequencies as estimates of conditional detection probabilities within the selected section. Can you predict with certainty the region of the next individual detection? (8 marks)
3. Explain the contrast difference between A and B in terms of available which-path information. Assess the claim: “Because nobody actually reads the polarization, B should show the same interference pattern as A.” Describe the role of distinguishable polarizations without claiming that mechanical deflection of the photons is a necessary cause. (8 marks)
4. Repeat A with half the photon rate for the same duration, leaving preparation and geometry unchanged. Predict expected total counts, expected counts in region 5 and the normalized distribution. Could a lower photon rate alone turn A into the normalized pattern B? Justify your answer while allowing for statistical fluctuations. (6 marks)

## English worked solution

1. In the simple classical particle model, distributions of independent paths add; the two paths do not create a coherent bright-dark modulation. Individual localized detections fit a particle picture. The classical continuous-wave model explains amplitude interference and a spatially modulated intensity; without an additional quantized detection model, it does not explain individual energy absorption as photon events. The quantum description combines localized detections with an ensemble distribution determined by coherent probability amplitudes. The pattern builds from many events, not a deterministic prediction of every impact position. Spots alone do not verify single-photon preparation: interaction of a detector with a weak classical light field can also produce discrete counts. Single-photon preparation is explicitly assumed here, not proved by the table.

2. $N_A=5\cdot100+4\cdot25=600$, $N_B=9\cdot60=540$. In A: $\hat P(5)=100/600=1/6\approx0.167$, $\hat P(6)=25/600=1/24\approx0.0417$. In B: both are $60/540=1/9\approx0.111$. These dimensionless values are conditional on detection in the selected section. $V_A=(100-25)/(100+25)=0.60$; $V_B=0$. They describe ensemble frequencies or estimated probabilities. The next individual detection region cannot be predicted with certainty; even the less frequent region remains possible.

3. A preserves coherence between paths without distinguishable markers, allowing the corresponding probability amplitudes to interfere. In B, paths are correlated with orthogonal polarizations. Summing without polarization analysis leaves which-path information available in principle; interference between the marked alternatives is absent in this unconditional position distribution. Whether a person actually reads a marker does not change its physical distinguishability. The claim is therefore false. This does not establish a necessary mechanical kick or an effect of conscious observation. A different setup involving selected polarization projection would be a different experiment, not the run described here.

4. At equal duration, expect approximately $N'_A=300$ and $n'_5=50$; actual counts need not equal these expectations exactly. Relative probabilities, notably $P(5)\approx1/6$ and $P(6)\approx1/24$, remain unchanged under the stated conditions. Lower rate scales average counts rather than the coherent spatial distribution. On its own, it therefore cannot systematically produce B's normalized uniform pattern. Fewer events increase relative statistical fluctuations.

## Point rubric

- q1 (8 BE): Klassische unabhängige Teilchenwege ohne Interferenz (2); kontinuierliche Wellenintensität mit Interferenz (2); Quanten-Einzelereignisse plus Ensembleverteilung (2); Einzelphotonenpräparation nicht allein aus Punkten behaupten (2).
- q2 (8 BE): N_A=600 und N_B=540 (1); P_A(5)=1/6 und P_A(6)=1/24 (2); beide B-Werte1/9 (1); V_A=.60 und V_B=0 (2); bedingte Ensemblewahrscheinlichkeit und keine sichere Einzelvorhersage (2).
- q3 (8 BE): Kontrastunterschied fachlich beschreiben (2); orthogonale Marker als verfügbare Weginformation erklären (2); kein tatsächliches Auslesen für physikalische Unterscheidbarkeit nötig (2); fehlende unbedingte Interferenz ohne notwendige mechanische Ablenkung oder Bewusstseinsbehauptung begründen (2).
- q4 (6 BE): Erwartungswerte300 und50 (2); unveränderte normierte Verteilung (2); Erwartungswerte von schwankenden Zählungen unterscheiden (1); reine Ratenänderung nicht als systematische Entstehung von B deuten (1).

Total 30 BE; proposed passing threshold 18 BE. Credit equivalent valid reasoning; arithmetic follow-through errors should not be penalized repeatedly.

