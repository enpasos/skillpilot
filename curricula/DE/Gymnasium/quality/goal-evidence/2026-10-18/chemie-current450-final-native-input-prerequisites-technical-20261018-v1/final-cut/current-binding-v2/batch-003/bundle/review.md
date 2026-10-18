# AI review input: Chemie: endgültiger aktueller D-Kontext

- Book ID: `chemie-current450-bound-context-d-003`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:c6486695a193174b59e06176eb5d065924826117ba3ca92ccb124400e56374e2`
- Selected goals: 20

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: RGT-Regel anwenden

- Full learning-goal ID: `56115f9d-1d32-5454-94b1-00dbc4a7bc6f`
- Goal fingerprint: `sha256:1e381ef9e3923bac0040ea191eacd8239bfb9cdc52e250e4c3a52f55bfe377b0`
- Page fingerprint: `sha256:4de1136e9e97d9e03b1c5c2fc92e14fce49ab26c2aae8c3e6d9bcaf3588cff6b`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann den Einfluss der Temperatur auf Reaktionsgeschwindigkeiten mithilfe der Stoßtheorie begründen.

### Visualization

/assets/goal-visualizations/chemie/56115f9d-1d32-5454-94b1-00dbc4a7bc6f/56115f9d-1d32-5454-94b1-00dbc4a7bc6f.png

- original digest: `sha256:7374adc7d083a671d8adc6a7b13b70c1ad9edf063f61dce9151918fab8c1f416`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)
- Einflussfaktoren diskutieren — `3ce81f96-4fbb-5022-88b7-337a000315ed` (outside this book)

### Direct reverse prerequisites outside this book

- HE-GK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- RGT-Faustregel abrufen — `2ab83298-e12b-5d4e-bd90-4cacdbccecf2` (outside this book)
- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)
- Boltzmann/Statistik — `d4720a9a-65e2-5661-aaaa-c393d144419a` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:212184d98d1709a3547b781455b8ccb4ba2974733fd6b681eb717c290c5c9249`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `expectation-empirical-ten-kelvin-rate`
  - Essential understanding (DE): Empirische RGT-Anwendung mit Stoßtheorie und Unsicherheit verbinden.
  - Essential understanding (EN): Connect empirical RGT application, collision theory and uncertainty.
  - Observable performance (DE): Je 10 K Faktor 2,50; über 20 K Faktor 6,25. Im Bereich ist eine 2- bis 4-fache Erhöhung pro 10 K als häufige Faustregel plausibel. Höhere T verändert die Energieverteilung; mehr geeignet orientierte Stöße können die Aktivierungsbarriere überwinden, nicht jede Kollision ist wirksam. Eine exakte universelle Verdopplung folgt weder aus Stoßtheorie noch aus diesen Messunsicherheiten. Konzentration/Oberfläche/Reaktionsmechanismus und begrenzter Temperaturbereich müssen kontrolliert werden.
  - Observable performance (EN): Each 10 K gives factor 2.50; 20 K gives 6.25. A commonly observed 2–4-fold rise per 10 K is a plausible rule of thumb here. Higher T changes energy distribution; more suitably oriented collisions can overcome the activation barrier, but not every collision is effective. Neither collision theory nor uncertain data gives a universal exact doubling. Control concentration/surface/mechanism and restrict temperature range.
- `expectation-changed-mechanism-rate-limit`
  - Essential understanding (DE): Beim geänderten Mechanismus die Grenze der RGT-Näherung selbstständig prüfen.
  - Essential understanding (EN): Independently assess RGT limits when the mechanism changes.
  - Observable performance (DE): Hypothetisch: 0,052×2,60=0,1352 mol/(L min), gemessenes Aufgabenmodell 0,012. Der Rückgang ist mit veränderter wirksamer Katalysatormenge/Reaktionsroute vereinbar; ein konstanter Faktor ist dafür nicht gültig. Gleiche Konzentrationen allein sichern keinen unveränderten Mechanismus. Test: Temperaturreihe unterhalb/oberhalb 318 K, Ausfall quantitativ dokumentieren und Referenz ohne ausfallenden Katalysator bzw. konstante aktive Menge kontrollieren. Die Beobachtung stützt eine Hypothese, beweist deren alleinige Ursache nicht; RGT ist kein Naturgesetz.
  - Observable performance (EN): Hypothetical prediction: 0.052×2.60=0.1352 mol/(L min), versus task observation 0.012. Reduced active catalyst/changed pathway can explain the decrease; a constant factor no longer applies. Equal concentrations alone do not ensure an unchanged mechanism. Test a temperature series across 318 K, quantify precipitation and compare a nonprecipitating reference or constant active catalyst amount. The observation supports a hypothesis, not a unique cause; RGT is not a universal law.
- `expectation-temperature-rate-execution`
  - Essential understanding (DE): Temperaturabhängige Reaktionsrate tatsächlich kontrolliert messen und begrenzt mit RGT erklären.
  - Essential understanding (EN): Actually measure controlled temperature-dependent rates and explain them through bounded RGT.
  - Observable performance (DE): Vollpunkte verlangen eigene Planung/Ausführung, Temperatur- und Gasvolumenrohwerte, Kontrollen sowie begründete Anfangsraten. Synthetische Steigungen sind 0,20/0,40/0,80 mL/s, Faktoren je 10 K 2,00 und über 20 K 4,00. Bei identischem Gaszustand sind Volumenraten proportional zu Stoffmengenraten. Unterschiedliche Gas-T/p, Oxidschicht, schrumpfende Oberfläche, Leckage und exotherme Eigenerwärmung verfälschen den Vergleich. Eine wiederholte Modellverdopplung beweist keine universelle Regel; höhere T erhöht den Anteil energetisch geeigneter Stöße unter gleichen übrigen Bedingungen.
  - Observable performance (EN): Full credit requires an original plan/execution, actual temperature and gas-volume readings, controls and justified initial rates. Synthetic slopes are 0.20/0.40/0.80 mL/s, factors 2.00 per 10 K and 4.00 over 20 K. At equal gas states, volume rates are proportional to amount rates. Unequal gas T/p, oxide layer, shrinking surface, leaks and reaction self-heating can distort comparisons. Repeated model doubling does not prove a universal rule; higher T increases the sufficiently energetic collision fraction under otherwise equal conditions.

**Coverage expectations**

- required expectations: `expectation-empirical-ten-kelvin-rate`, `expectation-changed-mechanism-rate-limit`, `expectation-temperature-rate-execution`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `chemically-relevant-conditions`: Die vollständig gebundenen Fälle wechseln Reaktion, Systemgrenze, Temperatur, Aggregatzustand, Stoffmengen-/Energiebasis, Messverfahren oder Zusammensetzung. Tatsächliche Durchführung bleibt dort erforderlich, wo der konkrete Quellenoperator sie verlangt. / The bound cases vary reaction, system boundary, temperature, phase, amount/energy basis, method or composition. Actual execution remains required where the specific source operator demands it.

**Application cases**

- `empirical-ten-kelvin-rate`
  - Task demand (DE): Synthetische Anfangsraten bei identischen Konzentrationen, Oberfläche und gleichem Verfahren: 293 K: 0,0100 mol/(L min); 303 K: 0,0250; 313 K: 0,0625. Unsicherheit ±5% je Rate. Temperaturänderung 10 K entspricht 10 °C Differenz, nicht 10 °C absolut. Berechne die Faktoren pro 10 K und über 20 K, wende die empirische RGT-Regel im Datenbereich an und erkläre mit Stoßtheorie/energetisch wirksamen Stößen, warum die Geschwindigkeit zunimmt. Prüfe die Aussage jede Reaktion verdoppelt sich exakt pro 10 K.
  - Task demand (EN): Synthetic initial rates with identical concentrations/surface/method: 293 K: 0.0100 mol/(L min); 303 K: 0.0250; 313 K: 0.0625. Uncertainty ±5% per rate. A 10 K increase equals a 10 °C difference, not an absolute 10 °C temperature. Calculate factors per 10 K and across 20 K, apply the empirical RGT rule within the data range and explain the increase through collision theory/energetically effective collisions. Assess the claim that every reaction exactly doubles per 10 K.
  - Expected performance (DE): Je 10 K Faktor 2,50; über 20 K Faktor 6,25. Im Bereich ist eine 2- bis 4-fache Erhöhung pro 10 K als häufige Faustregel plausibel. Höhere T verändert die Energieverteilung; mehr geeignet orientierte Stöße können die Aktivierungsbarriere überwinden, nicht jede Kollision ist wirksam. Eine exakte universelle Verdopplung folgt weder aus Stoßtheorie noch aus diesen Messunsicherheiten. Konzentration/Oberfläche/Reaktionsmechanismus und begrenzter Temperaturbereich müssen kontrolliert werden.
  - Expected performance (EN): Each 10 K gives factor 2.50; 20 K gives 6.25. A commonly observed 2–4-fold rise per 10 K is a plausible rule of thumb here. Higher T changes energy distribution; more suitably oriented collisions can overcome the activation barrier, but not every collision is effective. Neither collision theory nor uncertain data gives a universal exact doubling. Control concentration/surface/mechanism and restrict temperature range.
  - Understanding focus (DE): Empirische RGT-Anwendung mit Stoßtheorie und Unsicherheit verbinden.
  - Understanding focus (EN): Connect empirical RGT application, collision theory and uncertainty.
- `changed-mechanism-rate-limit`
  - Task demand (DE): Neuer synthetischer temperaturabhängiger Prozess: 303 K Rate 0,020; 313 K 0,052; 323 K 0,012 mol/(L min). Konzentrationen und Messmethode gleich; unabhängiger Zusatzbefund: oberhalb 318 K fällt ein Katalysator teilweise aus. Für einen rein hypothetischen unveränderten Prozess wäre der erste Faktor 2,60 fortzusetzen. Berechne die hypothetische Vorhersage und vergleiche den konkreten neuen Befund. Erkläre den Gegensatz zur RGT-Näherung ohne Energieerhaltung oder Stoßtheorie zu verwerfen; schlage einen kontrollierten Test der Ausfallursache vor.
  - Task demand (EN): New synthetic temperature-dependent process: 303 K rate 0.020; 313 K 0.052; 323 K 0.012 mol/(L min). Equal concentrations/method; an independent observation shows partial catalyst precipitation above 318 K. Hypothetically, with an unchanged process, the first factor 2.60 would continue. Calculate the hypothetical prediction and compare the new observation. Explain disagreement with RGT without rejecting energy conservation/collision theory and propose a controlled test of the precipitation explanation.
  - Expected performance (DE): Hypothetisch: 0,052×2,60=0,1352 mol/(L min), gemessenes Aufgabenmodell 0,012. Der Rückgang ist mit veränderter wirksamer Katalysatormenge/Reaktionsroute vereinbar; ein konstanter Faktor ist dafür nicht gültig. Gleiche Konzentrationen allein sichern keinen unveränderten Mechanismus. Test: Temperaturreihe unterhalb/oberhalb 318 K, Ausfall quantitativ dokumentieren und Referenz ohne ausfallenden Katalysator bzw. konstante aktive Menge kontrollieren. Die Beobachtung stützt eine Hypothese, beweist deren alleinige Ursache nicht; RGT ist kein Naturgesetz.
  - Expected performance (EN): Hypothetical prediction: 0.052×2.60=0.1352 mol/(L min), versus task observation 0.012. Reduced active catalyst/changed pathway can explain the decrease; a constant factor no longer applies. Equal concentrations alone do not ensure an unchanged mechanism. Test a temperature series across 318 K, quantify precipitation and compare a nonprecipitating reference or constant active catalyst amount. The observation supports a hypothesis, not a unique cause; RGT is not a universal law.
  - Understanding focus (DE): Beim geänderten Mechanismus die Grenze der RGT-Näherung selbstständig prüfen.
  - Understanding focus (EN): Independently assess RGT limits when the mechanism changes.
- `temperature-rate-execution`
  - Task demand (DE): Lehrkraftfreigegebene Autorenanpassung des RSC/Nuffield-Verfahrens Magnesium mit Salzsäure: identische gereinigte Mg-Bandstücke von etwa 0,0200 g, je 50,0 mL HCl 0,20 mol/L, Wasserbäder 293/303/313 K. Gasvolumen über Wasser oder freigängiger Gasspritze, Zeitmessung, Temperatursonde. Schutzbrille, keine Zündquelle (H2), keine abgeschlossene starre Druckapparatur. Säureüberschuss und gleiche Oberfläche gewährleisten; tatsächliche T laufend erfassen. Synthetische Vergleichsdaten bei gleichem Gas-Messzustand: t=[0,5,10,15] s; V_293=[0,1,2,3], V_303=[0,2,4,6], V_313=[0,4,8,12] mL. Formuliere eine Temperaturhypothese, plane Kontrollen/Wiederholungen und führe alle drei Messungen aus. Zeichne eigene V(t)-Kurven und bestimme vergleichbare Anfangssteigungen; rechne unterschiedliche Gas-Messzustände ggf. mit pV=nRT auf eine Basis um. Vergleiche 10-K-Faktoren mit RGT und Stoßtheorie. Prüfe separat die synthetische Tabelle; diese ersetzt keine Messung.
  - Task demand (EN): Teacher-authorised author adaptation of the RSC/Nuffield magnesium/hydrochloric-acid method: identical cleaned Mg strips about 0.0200 g, 50.0 mL HCl 0.20 mol/L per run, water baths 293/303/313 K. Collect gas over water or in a freely moving syringe; stopwatch and thermometer. Goggles, no ignition source (H2), no closed rigid pressure vessel. Ensure excess acid and equal surface; continuously record actual T. Synthetic comparison at equal gas measurement conditions: t=[0,5,10,15] s; V_293=[0,1,2,3], V_303=[0,2,4,6], V_313=[0,4,8,12] mL. State a temperature hypothesis, plan controls/repeats and execute all three measurements. Plot original V(t) curves and compare initial slopes; if gas measurement states differ, use pV=nRT for a common basis. Compare 10 K factors with RGT/collision theory. Separately analyse the synthetic table; it does not replace measurements.
  - Expected performance (DE): Vollpunkte verlangen eigene Planung/Ausführung, Temperatur- und Gasvolumenrohwerte, Kontrollen sowie begründete Anfangsraten. Synthetische Steigungen sind 0,20/0,40/0,80 mL/s, Faktoren je 10 K 2,00 und über 20 K 4,00. Bei identischem Gaszustand sind Volumenraten proportional zu Stoffmengenraten. Unterschiedliche Gas-T/p, Oxidschicht, schrumpfende Oberfläche, Leckage und exotherme Eigenerwärmung verfälschen den Vergleich. Eine wiederholte Modellverdopplung beweist keine universelle Regel; höhere T erhöht den Anteil energetisch geeigneter Stöße unter gleichen übrigen Bedingungen.
  - Expected performance (EN): Full credit requires an original plan/execution, actual temperature and gas-volume readings, controls and justified initial rates. Synthetic slopes are 0.20/0.40/0.80 mL/s, factors 2.00 per 10 K and 4.00 over 20 K. At equal gas states, volume rates are proportional to amount rates. Unequal gas T/p, oxide layer, shrinking surface, leaks and reaction self-heating can distort comparisons. Repeated model doubling does not prove a universal rule; higher T increases the sufficiently energetic collision fraction under otherwise equal conditions.
  - Understanding focus (DE): Temperaturabhängige Reaktionsrate tatsächlich kontrolliert messen und begrenzt mit RGT erklären.
  - Understanding focus (EN): Actually measure controlled temperature-dependent rates and explain them through bounded RGT.
## Page 2: Geschwindigkeiten bestimmen

- Full learning-goal ID: `56bc6377-1291-58bc-b433-5b9f673888e9`
- Goal fingerprint: `sha256:b3b30f05e93a05b0e2cb371994d29d632204e7d6b4b260c14ac8f8836c5bfff2`
- Page fingerprint: `sha256:86e4b6050a83577430e2e8c9cadee8d0bef30a1a7f01c0b0e19e03f0caa41d6d`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann Reaktionsgeschwindigkeit als Änderung von Stoffmenge oder Konzentration pro Zeiteinheit beschreiben und mittlere sowie momentane Reaktionsgeschwindigkeiten aus Konzentrations-, Stoffmengen- oder Zeit-Volumen-Diagrammen bestimmen.

### Visualization

/assets/goal-visualizations/chemie/56bc6377-1291-58bc-b433-5b9f673888e9/56bc6377-1291-58bc-b433-5b9f673888e9.jpg

- original digest: `sha256:5bc8edd6b0d58bef9e1b8f488d536d2243c65499125567b37746e3a45fa7d150`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Kinetische Mechanismen deuten — `13838147-c26d-54ca-b9be-5f2f0b8e9de5` (page 3)
- Reaktionsbedingungen hypothesengeleitet untersuchen — `536030f8-70dc-519d-8039-92290c68d95d` (page 4)

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)

### Direct reverse prerequisites outside this book

- HE-GK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)
- Arrhenius-Beziehung anwenden — `e62c6c58-b688-59c3-8ac5-2cfc26ac22d7` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:21d1a6d59c43eb5e5e8f75bff73986e68667401bf100515f2cf93a9105a0125a`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `whole-duty-1`
  - Essential understanding (DE): Die Sekantensteigung eines Konzentrations-, Stoffmengen- oder Volumen-Zeit-Verlaufs beschreibt die mittlere Änderung der jeweiligen Größe pro Zeitintervall.
  - Essential understanding (EN): The secant slope of a concentration-, amount- or volume-time curve describes the average change of that quantity over a time interval.
  - Observable performance (DE): Mittlere Rate aus Sekante richtig bestimmen. Weitere mögliche Aufgabenvariation: Beide Intervallsteigungen und Tangente unterscheiden.
  - Observable performance (EN): Determine average rate from secant correctly. Further possible task variation: Distinguish both interval slopes and tangent.
- `whole-duty-2`
  - Essential understanding (DE): Die Tangentensteigung beschreibt die lokale Änderungsrate zum gewählten Zeitpunkt und ist vom Intervallmittel zu unterscheiden. Achsenskalierung und Einheiten bestimmen die Bedeutung einer abgelesenen Steigung.
  - Essential understanding (EN): The tangent slope describes the local rate of change at the selected instant and differs from an interval average. Axis scaling and units determine the meaning of a slope read from a graph.
  - Observable performance (DE): Momentane Rate aus Tangente richtig bestimmen. Weitere mögliche Aufgabenvariation: mL→L und Stoffmengenraten korrekt umrechnen.
  - Observable performance (EN): Determine instantaneous rate from tangent correctly. Further possible task variation: ConvertmL→L and amount rates correctly.
- `whole-duty-3`
  - Essential understanding (DE): Eine rohe Eduktableitung ist beim Verbrauch negativ, eine als positiver Verbrauch definierte Rate erhält ein Minuszeichen. Bei konstantem Reaktionsvolumen verknüpfen stöchiometrische Koeffizienten die stoffbezogenen Raten mit der normierten Reaktionsrate.
  - Essential understanding (EN): A raw reactant derivative is negative during consumption, while a positively defined disappearance rate uses a minus sign. At constant reaction volume, stoichiometric coefficients relate species rates to the normalised reaction rate.
  - Observable performance (DE): Faktor2 und Bildungs-/Verbrauchsvorzeichen erklären. Weitere mögliche Aufgabenvariation: Bezug auf Lösungsvolumen mit Einheiten zeigen.
  - Observable performance (EN): Explain factor2 and formation/disappearance signs. Further possible task variation: Show solution-volume normalization with units.
- `whole-duty-4`
  - Essential understanding (DE): Stoffmengen- und Konzentrationsraten haben verschiedene Einheiten und sind bei konstantem Reaktionsvolumen über dieses Volumen verknüpft. Eine Gasvolumenrate wird nur mit passenden Gasbedingungen, molarem Volumen und quantitativer Sammlung zur Stoffmengenrate.
  - Essential understanding (EN): Amount and concentration rates have different units and are related through reaction volume when that volume is constant. Converting a gas-volume rate to an amount rate requires suitable gas conditions, molar volume and quantitative collection.
  - Observable performance (DE): Konzentrations- und Stoffmengenraten mit Einheiten trennen. Weitere mögliche Aufgabenvariation: Mess-/Modellvoraussetzungen statt Gleichgewichtsinterpretation nennen.
  - Observable performance (EN): Distinguish concentration and amount rates with units. Further possible task variation: State measurement/model assumptions instead of equilibrium interpretation.

**Coverage expectations**

- required expectations: `whole-duty-1`, `whole-duty-2`, `whole-duty-3`, `whole-duty-4`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `whole-case-material`: Skalierte Konzentrations-Zeit- und Zeit-Volumen-Kurven mit selbstständig abgelesener Sekanten-/Tangentensteigung; neue Stoffmengenordinate und frische Gaskurve. / Scaled concentration-time and time-volume curves with independently read secant/tangent slopes; changed amount ordinate and fresh gas curve.
- `independent-transfer`: Frisch: Die Stoffmengenordinate bei geändertem Volumen auswerten und mit der Konzentrationsrate vergleichen. In einer neuen skalierten Gasvolumen-Zeit-Kurve die Tangentensteigung aus selbst abgelesenen Punkten bestimmen und mit dem gegebenen molaren Gasvolumen und Lösungsvolumen umrechnen; keine Steigung wird vorgegeben. / Fresh: evaluate an amount ordinate at changed volume and compare it with concentration rate. In a new scaled gas-volume-time curve, determine the tangent slope from independently read points and convert using the supplied molar gas volume and solution volume; no slope is supplied.

**Application cases**

- `q3-18-a`
  - Task demand (DE): Synthetischer Verlauf für 2A→B in konstantem 1,00 L. Das vollständig skalierte Konzentrations-Zeit-Diagramm q3-18-a.png zeigt die Kurve und die Tangente bei 20 s. Stoffmenge nA=cA·V. Die Tangentensteigung ist nicht angegeben; sie muss aus dem Diagramm bestimmt werden. Bestimme mittlere und momentane A-Verbrauchsgeschwindigkeit,Reaktionsgeschwindigkeit und B-Bildungsgeschwindigkeit sowie Stoffmengenrate. Erkläre Sekante,Tangente,Vorzeichen und Einheiten. Lies die Kurvenwerte bei 0 und 20 s sowie zwei ausreichend weit getrennte Punkte der eingezeichneten Tangente ab. Zeige das Steigungsdreieck mit Δc und Δt; lies nicht nur einen Tabellenwert ab. Main graph: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-thirteen-current402-four-images-author-20261012-v3/positive/assessment-graphs/q3-18-a.png; fresh graph: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-thirteen-current402-four-images-author-20261012-v3/positive/assessment-graphs/q3-18-a-fresh.png. Fresh transfer: Frisch: q3-18-a-fresh.png zeigt statt der Konzentration die Stoffmenge nA im Volumen 2,00 L. Bestimme die momentane Stoffmengen-Verbrauchsrate bei 20 s aus der eingezeichneten Tangente und vergleiche die daraus berechnete Konzentrationsrate mit dem Hauptfall. Keine Steigung ist vorgegeben.
  - Task demand (EN): Synthetic curve for 2A→B at constant 1.00 L. The fully scaled concentration-time graph q3-18-a.png shows the curve and the tangent at 20 s. Amount nA=cA·V. No tangent slope is supplied; it must be determined from the graph. Determine average and instantaneousA disappearance rate,reaction rate andB formation rate as well as amount rate. Explain secant,tangent,signs and units. Read curve values at 0 and 20 s and two sufficiently separated points of the plotted tangent. Show the slope triangle with Δc and Δt; do not merely copy a table value. Main graph: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-thirteen-current402-four-images-author-20261012-v3/positive/assessment-graphs/q3-18-a.png; fresh graph: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-thirteen-current402-four-images-author-20261012-v3/positive/assessment-graphs/q3-18-a-fresh.png. Fresh transfer: Fresh: q3-18-a-fresh.png plots amount nA instead of concentration at volume 2.00 L. Determine instantaneous amount disappearance at 20 s from the tangent and compare the resulting concentration rate with the main case. No slope is supplied.
  - Expected performance (DE): Mittlerer A-Verbrauch−ΔcA/Δt=0,0100mol/(L·s),momentan0,0060. Stöchiometrisch normierte Reaktionsrate r=−½dcA/dt:mittel0,0050,momentan0,0030mol/(L·s),gleich B-Bildungsrate. A-Stoffmengenverbrauch mittel0,0100mol/s,momentan0,0060mol/s bei1L. Sekante erfasst Intervall,Tangente Zeitpunkt; rohe A-Ableitung negativ,positiver Verbrauch wird mit Minus definiert. Diagramm: cA(0)=0,80 und cA(20)=0,60 mol/L. Beispielsweise Tangentenpunkte (0 s;0,72 mol/L) und (30 s;0,54 mol/L) liefern dcA/dt=−0,18/30=−0,0060 mol/(L·s). Ablesetoleranz ±0,0004 mol/(L·s); daraus abgeleitete Größen dürfen entsprechend abweichen. Scoring /10: 2P: Kurvenpunkte ablesen und Intervallsekante mit Δc/Δt bestimmen; mittlere A-Verbrauchsrate 0,0100±0,0005 mol/(L·s).; 2P: Zwei Tangentenpunkte und Steigungsdreieck zeigen; negative Ableitung −0,0060±0,0004 von positiver Verbrauchsrate unterscheiden. Vorgegebene Zahlen ohne graphische Herleitung genügen nicht.; 2P: Faktor2 und Bildungs-/Verbrauchsvorzeichen erklären.; 2P: Konzentrations- und Stoffmengenraten mit Einheiten trennen.; 2P: Die Tangente liefert dnA/dt=−0,0120±0,0008 mol/s, also Verbrauch 0,0120 mol/s. Division durch 2,00 L ergibt 0,0060 mol/(L·s), unverändert gegenüber dem Hauptfall. Andere Ordinate und doppeltes Volumen verändern die Stoffmengenrate, nicht die Konzentrationsrate.
  - Expected performance (EN): AverageA disappearance−ΔcA/Δt=0.0100mol/(L·s),instantaneous0.0060. Stoichiometrically normalized reaction rate r=−½dcA/dt:average0.0050,instantaneous0.0030mol/(L·s),equal toB formation rate. A amount disappearance averages0.0100mol/s and instantaneously0.0060mol/s at1L. Secant describes interval,tangent instant;rawA derivative is negative and positive disappearance uses a minus sign. Graph: cA(0)=0.80 and cA(20)=0.60 mol/L. For example, tangent points (0 s;0.72 mol/L) and (30 s;0.54 mol/L) give dcA/dt=−0.18/30=−0.0060 mol/(L·s). Accept read-off error ±0.0004 mol/(L·s) and consistently propagated uncertainty. Scoring /10: 2P: Read curve points and determine interval secant using Δc/Δt; average A disappearance 0.0100±0.0005 mol/(L·s).; 2P: Show two tangent points and a slope triangle; distinguish derivative −0.0060±0.0004 from positive disappearance. Numbers without graphical derivation are insufficient.; 2P: Explain factor2 and formation/disappearance signs.; 2P: Distinguish concentration and amount rates with units.; 2P: The tangent gives dnA/dt=−0.0120±0.0008 mol/s, hence disappearance 0.0120 mol/s. Dividing by 2.00 L gives 0.0060 mol/(L·s), unchanged from the main case. The changed ordinate and doubled volume alter amount rate, not concentration rate.
  - Understanding focus (DE): Nachweis des ganzen aktuellen Ziels durch ausreichend gezeigte zusammenhängende Fachleistung; keine Zusatzaufgabenquote. Vorhandene Fälle sind Alternativen und gezielte Ergänzungen. Synthetische Autorenmaterialien belegen keine tatsächliche Experimentdurchführung oder Lernendenleistung. Quellenanteile bleiben einzeln begrenzt.
  - Understanding focus (EN): Evidence for the whole current goal through sufficiently demonstrated connected scientific performance; no extra-task quota. Available cases are alternatives and targeted additions. Synthetic author material proves no actual experiment execution or learner performance. Source contributions remain individually bounded.
- `q3-18-b`
  - Task demand (DE): Synthetisch gesammeltes Produktgas bei konstantem T,p. Das vollständig skalierte Zeit-Volumen-Diagramm q3-18-b.png zeigt die Kurve und die Tangente bei 60 s. Gegeben sind molares Gasvolumen 24,0 L/mol und konstantes Lösungsvolumen 0,500 L; 1 mol Gas entspricht 1 mol Reaktionsumsatz. Kurvenwerte und Tangentensteigung werden aus dem Diagramm abgelesen, nicht als Zahlen geliefert. Bestimme mittlere Raten für0–60s und60–120s sowie momentane Rate aus der Tangente,in Volumen,Stoffmenge und bezogen auf Lösungsvolumen. Erkläre Aussage und Voraussetzungen. Lies Kurvenwerte bei 0,60,120 s und zwei weit getrennte Tangentenpunkte ab; dokumentiere ΔV/Δt mit Steigungsdreieck. Main graph: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-thirteen-current402-four-images-author-20261012-v3/positive/assessment-graphs/q3-18-b.png; fresh graph: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-thirteen-current402-four-images-author-20261012-v3/positive/assessment-graphs/q3-18-b-fresh.png. Fresh transfer: Frisch: Bestimme aus q3-18-b-fresh.png die Tangentenrate bei 25 s. Molares Gasvolumen weiterhin 24,0 L/mol, Lösungsvolumen jetzt 1,00 L. Bestimme Stoffmengenrate und auf Lösungsvolumen bezogene Rate; keine Tangentensteigung wird angegeben.
  - Task demand (EN): Synthetic collected product gas at constant T,p. The fully scaled time-volume graph q3-18-b.png shows the curve and tangent at 60 s. Supplied molar gas volume is 24.0 L/mol and constant solution volume 0.500 L; 1 mol gas equals 1 mol reaction conversion. Curve values and tangent slope must be read from the graph, rather than supplied numerically. Determine average rates for0–60s and60–120s and instantaneous tangent rate,in volume,amount and per solution volume. Explain meaning and assumptions. Read curve values at 0,60,120 s and two separated tangent points; document ΔV/Δt with a slope triangle. Main graph: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-thirteen-current402-four-images-author-20261012-v3/positive/assessment-graphs/q3-18-b.png; fresh graph: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-thirteen-current402-four-images-author-20261012-v3/positive/assessment-graphs/q3-18-b-fresh.png. Fresh transfer: Fresh: determine tangent rate at 25 s from q3-18-b-fresh.png. Molar gas volume remains 24.0 L/mol; solution volume is now 1.00 L. Determine amount rate and solution-volume-normalized rate; no tangent slope is supplied.
  - Expected performance (DE): Volumenraten0,40 und0,20mL/s,momentan0,25. InL/s0,00040/0,00020/0,00025; durch24L/mol teilen:1,6667·10⁻⁵/8,3333·10⁻⁶/1,0417·10⁻⁵mol/s. Durch0,500L teilen:3,3333·10⁻⁵/1,6667·10⁻⁵/2,0833·10⁻⁵mol/(L·s). Momentanrate ist lokale Steigung,kein weiteres Intervallmittel. KonstanteT,p und quantitative Gassammlung werden vorausgesetzt. Graphisch: V(0)=0,V(60)=24,V(120)=36 mL. Tangentenpunkte (0 s;9 mL) und (120 s;39 mL) liefern 30/120=0,25 mL/s. Zulässige Ablesetoleranz der Volumenraten ±0,02 mL/s; Folgegrößen mit entsprechend fortgepflanzter Toleranz. Scoring /10: 2P: Kurvenpunkte und zwei Tangentenpunkte mit Steigungsdreieck verwenden; Intervallraten 0,40/0,20 und lokale Tangentenrate 0,25 mL/s unterscheiden, je ±0,02 mL/s.; 2P: mL→L und Stoffmengenraten korrekt umrechnen.; 2P: Bezug auf Lösungsvolumen mit Einheiten zeigen.; 2P: Mess-/Modellvoraussetzungen statt Gleichgewichtsinterpretation nennen.; 2P: Tangentenpunkte (0 s;2 mL) und (50 s;26 mL) liefern 24/50=0,48±0,025 mL/s. Daraus 0,00048/24=2,00·10⁻⁵ mol/s und 2,00·10⁻⁵ mol/(L·s), mit fortgepflanzter Ablesetoleranz.
  - Expected performance (EN): Volume rates0.40 and0.20mL/s,instantaneous0.25. InL/s0.00040/0.00020/0.00025;divide by24L/mol:1.6667·10⁻⁵/8.3333·10⁻⁶/1.0417·10⁻⁵mol/s. Divide by0.500L:3.3333·10⁻⁵/1.6667·10⁻⁵/2.0833·10⁻⁵mol/(L·s). Instantaneous rate is local slope,not another interval average. ConstantT,p and quantitative gas collection are assumed. Graphically: V(0)=0,V(60)=24,V(120)=36 mL. Tangent points (0 s;9 mL) and (120 s;39 mL) give 30/120=0.25 mL/s. Accept volume-rate read-off error ±0.02 mL/s and propagated uncertainty in converted rates. Scoring /10: 2P: Use curve points and two tangent points with slope triangle; distinguish interval rates 0.40/0.20 from local tangent rate 0.25 mL/s, each ±0.02 mL/s.; 2P: ConvertmL→L and amount rates correctly.; 2P: Show solution-volume normalization with units.; 2P: State measurement/model assumptions instead of equilibrium interpretation.; 2P: Tangent points (0 s;2 mL) and (50 s;26 mL) give 24/50=0.48±0.025 mL/s. Thus 0.00048/24=2.00·10⁻⁵ mol/s and 2.00·10⁻⁵ mol/(L·s), with propagated read-off uncertainty.
  - Understanding focus (DE): Nachweis des ganzen aktuellen Ziels durch ausreichend gezeigte zusammenhängende Fachleistung; keine Zusatzaufgabenquote. Vorhandene Fälle sind Alternativen und gezielte Ergänzungen. Synthetische Autorenmaterialien belegen keine tatsächliche Experimentdurchführung oder Lernendenleistung. Quellenanteile bleiben einzeln begrenzt.
  - Understanding focus (EN): Evidence for the whole current goal through sufficiently demonstrated connected scientific performance; no extra-task quota. Available cases are alternatives and targeted additions. Synthetic author material proves no actual experiment execution or learner performance. Source contributions remain individually bounded.
## Page 3: Kinetische Mechanismen deuten

- Full learning-goal ID: `13838147-c26d-54ca-b9be-5f2f0b8e9de5`
- Goal fingerprint: `sha256:a036f88b44fafe5ef7d691e4e61890905a04d7d3a15c7e0613abd6654c67cfe0`
- Page fingerprint: `sha256:fb0b5b90f0cad639dfff6f41e586a546c8a2bfc0ef1e4065b9cb1147c4f48606`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann mögliche mehrstufige Reaktionsmechanismen aus Geschwindigkeitsgesetzen ableiten, ihre Vereinbarkeit mit den Gesetzen begründen und die Grenzen dieser Ableitung erläutern.

### Visualization

/assets/goal-visualizations/chemie/13838147-c26d-54ca-b9be-5f2f0b8e9de5/13838147-c26d-54ca-b9be-5f2f0b8e9de5.png

- original digest: `sha256:4a5fc496436ab607c9d35a8e15a2c43e0496073e26e0ff7962f6632c0b8a8629`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Geschwindigkeiten bestimmen — `56bc6377-1291-58bc-b433-5b9f673888e9` (page 2)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- Prüfung: Kinetikmodelle und Arrhenius — `5b5ece8f-1559-547b-a1d1-3b5511446c70` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:e328a2fdaf86fc9f201caac6e781e09edf0aa4b708b8cb7c3ed651a0915e8df5`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Ein Geschwindigkeitsgesetz schränkt kompatible Mechanismen ein, legt sie allgemein aber nicht eindeutig fest.
  - Essential understanding (EN): A rate law constrains compatible mechanisms but generally does not identify a unique one.
  - Observable performance (DE): eqrk16-12-a: Ordnungen und k = 0,20 mit korrekter Produktnormierung ermitteln. eqrk16-12-b: Die Quasistationaritätsgleichung mit allen Bildungs- und Verlusttermen ableiten.
  - Observable performance (EN): eqrk16-12-a: Determine orders and k = 0.20 with correct product normalisation. eqrk16-12-b: Derive the steady-state equation with every formation and loss term.
- `e2`
  - Essential understanding (DE): Elementarschritte, Zwischenprodukte und Vor-Gleichgewichte müssen Gesamtstöchiometrie und beobachtetes Gesetz reproduzieren.
  - Essential understanding (EN): Elementary steps, intermediates and pre-equilibria must reproduce stoichiometry and the observed law.
  - Observable performance (DE): eqrk16-12-a: Zwei eigene unterschiedliche mehrstufige Mechanismushypothesen aus Gesetz und Nettoreaktion entwerfen und durch Zwischenproduktelimination, Erhaltung von Atomen/Ladung und korrekte GBS-Bedeutung prüfen. eqrk16-12-b: Beide Raten und Grenzgesetze quantitativ deuten.
  - Observable performance (EN): eqrk16-12-a: Independently propose two different multistep mechanisms from the law and net reaction and test them by eliminating intermediates, conserving atoms/charge and defining GBS correctly. eqrk16-12-b: Interpret both rates and limiting laws quantitatively.
- `e3`
  - Essential understanding (DE): Mechanismus-Hypothesen benötigen geänderte Bedingungen oder zusätzliche Beobachtungen zur Unterscheidung.
  - Essential understanding (EN): Mechanistic hypotheses need changed conditions or additional observations to distinguish them.
  - Observable performance (DE): eqrk16-12-a: Nicht-Eindeutigkeit und eine unabhängige Unterscheidungsmessung begründen. eqrk16-12-b: Die Näherung und die Identifizierbarkeitsgrenze am geänderten Verlauf prüfen.
  - Observable performance (EN): eqrk16-12-a: Explain nonuniqueness and an independent discriminating measurement. eqrk16-12-b: Test the approximation and identifiability limit against the changed course.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `eqrk16-12-a-transfer`: Ein anderer Bedingungsbereich zeigt Sättigung bezüglich O2. Prüfe für deine selbst entworfenen Hypothesen, ob sie unter den jeweils genannten Näherungen diesen Verlauf vorhersagen können und welche Annahme gegebenenfalls neu geprüft werden muss. Ein Modell, das nur im untersuchten Anfangsbereich linear in O2 ist, darf nicht ohne Prüfung global extrapoliert werden. / A different conditions range shows saturation with respect to O2. For each mechanism you proposed, check whether it can predict this behaviour under its stated approximations and which assumption, if any, needs reassessment. A model linear in O2 only over the initial range must not be extrapolated globally without checking.
- `eqrk16-12-b-transfer`: Nach einem Impuls steigt [I] zunächst deutlich. Welche Zeitphase verletzt die Näherung, und welche vollständige Differentialgleichung muss dort gelten? / After a pulse, [I] initially accumulates substantially. Which time phase violates the approximation, and which full differential equation applies there?

**Application cases**

- `eqrk16-12-a`
  - Task demand (DE): Vollständiges eigenes Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-four-material-gap-remediation-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.four-gap-successor.author.json #eqrk16-12-a; sha256:c9d14994f6f2cb2fbc3d099a6f6424be55d93e73e3837c428cf42ce8286e851e. Leite das empirische Geschwindigkeitsgesetz und k mit Einheiten her. Entwirf selbst zwei unterschiedliche mögliche mehrstufige Mechanismushypothesen aus diesem Gesetz und der Nettoreaktion, einschließlich der Zusammensetzung ihrer Zwischenprodukte und der benötigten Näherungen. Zeige für jede Hypothese durch Summierung und Zwischenproduktelimination die Vereinbarkeit mit Nettoreaktion und Gesetz. Erkläre gegebenenfalls den geschwindigkeitsbestimmenden Schritt (GBS), die fehlende Eindeutigkeit und eine zusätzliche unterscheidende Beobachtung. Andere chemisch konsistente Vorschläge als die Musterlösung sind zulässig.
  - Task demand (EN): Complete own material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-four-material-gap-remediation-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.four-gap-successor.author.json #eqrk16-12-a; sha256:c9d14994f6f2cb2fbc3d099a6f6424be55d93e73e3837c428cf42ce8286e851e. Derive the empirical rate law and k with units. Independently propose two different possible multistep mechanisms from this law and the net reaction, including intermediate compositions and the required approximations. For each hypothesis, demonstrate compatibility with the net reaction and law by adding steps and eliminating intermediates. Explain any rate-determining step (GBS), nonuniqueness and an additional discriminating observation. Chemically consistent proposals different from the sample solution are acceptable.
  - Expected performance (DE): Aus der Datenvariation folgt v = k[NO]²[O2], k = 0,20 L²/(mol² s). Ein selbst entwickeltes zulässiges Paar: A: 2 NO ⇌ N2O2 schnell, N2O2 + O2 → 2 NO2 langsam; B: NO + O2 ⇌ NO3 schnell, NO3 + NO → 2 NO2 langsam. Beide erhalten Atome/Ladung und summieren sich zur Nettoreaktion. A liefert mit [N2O2] = KA[NO]² das Gesetz v = kA KA[NO]²[O2], B mit [NO3] = KB[NO][O2] dasselbe Gesetz. Konzentrationsbezogene KA/KB und elementare Ratenkonstanten müssen passende Einheiten besitzen. Schnelle Vorgleichgewichte und langsame Produktschritte sind explizite Modellannahmen; GBS bezeichnet hier den geschwindigkeitsbestimmenden langsamen Schritt. Gleichwertige eigene Konstruktionen mit hergeleitetem Gesetz sind zuzulassen. Zwei kompatible Modelle beweisen keine eindeutige reale Schrittfolge; zeitaufgelöster Zwischenproduktnachweis mit ausreichender Empfindlichkeit und weitere Kinetikdaten könnten unterscheiden. Im neuen Sättigungsbereich müssen die einfachen linearen Musteransätze neu geprüft werden. Für A ergibt quasistationäres N2O2 als mögliche Erweiterung v = k1 k2[NO]²[O2]/(k−1 + k2[O2]); das ist bei kleinem O2 linear und bei großem O2 sättigend. Andere selbst entworfene Modelle werden nach ihrer eigenen Herleitung und ihren Gültigkeitsbedingungen beurteilt. Hypothesen bleiben unbestätigte Modelle.
  - Expected performance (EN): The data give v = k[NO]²[O2], k = 0.20 L²/(mol² s). One admissible independently constructed pair is A: fast 2 NO ⇌ N2O2, slow N2O2 + O2 → 2 NO2; B: fast NO + O2 ⇌ NO3, slow NO3 + NO → 2 NO2. Both conserve atoms/charge and sum to the net reaction. A gives [N2O2] = KA[NO]² and v = kA KA[NO]²[O2]; B gives [NO3] = KB[NO][O2] and the same law. Concentration-based KA/KB and elementary rate constants need consistent units. Fast pre-equilibria and slow product steps are explicit model assumptions; GBS here denotes the slow rate-determining step. Accept equivalent independent constructions with a derived law. Two compatible models establish no unique actual step sequence; time-resolved intermediate detection with adequate sensitivity and further kinetic data could discriminate. In the new saturation range the simple linear sample expressions need reassessment. For A, steady-state N2O2 could instead give v = k1 k2[NO]²[O2]/(k−1 + k2[O2]), linear at low O2 and saturating at high O2. Judge other independently proposed models by their own derivations and validity conditions. Hypotheses remain unconfirmed models.
  - Understanding focus (DE): Ein anderer Bedingungsbereich zeigt Sättigung bezüglich O2. Prüfe für deine selbst entworfenen Hypothesen, ob sie unter den jeweils genannten Näherungen diesen Verlauf vorhersagen können und welche Annahme gegebenenfalls neu geprüft werden muss. Ein Modell, das nur im untersuchten Anfangsbereich linear in O2 ist, darf nicht ohne Prüfung global extrapoliert werden.
  - Understanding focus (EN): A different conditions range shows saturation with respect to O2. For each mechanism you proposed, check whether it can predict this behaviour under its stated approximations and which assumption, if any, needs reassessment. A model linear in O2 only over the initial range must not be extrapolated globally without checking.
- `eqrk16-12-b`
  - Task demand (DE): Vollständiges eigenes Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json #eqrk16-12-b; sha256:86dc6b7640368abf7dbd12b51f4cdf48aba1731f7f543169a30c14261c3ccd2e. Leite das Gesetz mit der gegebenen Näherung her, berechne v bei C = 0,010 und 10 M und deute die Grenzfälle. Warum beweist eine passende Rate den Mechanismus noch nicht?
  - Task demand (EN): Complete own material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json #eqrk16-12-b; sha256:86dc6b7640368abf7dbd12b51f4cdf48aba1731f7f543169a30c14261c3ccd2e. Derive the law under the stated approximation, calculate v at C = 0.010 and 10 M, and interpret the limits. Why does a good rate fit not prove the mechanism?
  - Expected performance (DE): 0 ≈ k1[A][B] − k−1[I] − k2[I][C]. Damit [I] ≈ k1[A][B]/(k−1 + k2[C]) und v = k1k2[A][B][C]/(k−1 + k2[C]). Bei 0,010 M ergibt sich 9,95 · 10−5 M/s; bei 10 M 0,01667 M/s. Bei niedrigem C gilt näherungsweise v = (k1k2/k−1)[A][B][C]; bei hohem C nähert sich v dem Wert k1[A][B] = 0,0200 M/s. Rückzerfall und Abfangen von I erklären die geänderte Abhängigkeit. Gesamtstöchiometrie allein liefert kein Rategesetz. Kurze I-Lebensdauer, Quasistationarität und fehlende Nebenwege benötigen eigene Evidenz, etwa Zeitauflösung oder I-Nachweis. Reale Aktivitätseffekte bei 10 M können die Näherung verletzen.
  - Expected performance (EN): Steady state gives 0 ≈ k1[A][B] − k−1[I] − k2[I][C], hence [I] ≈ k1[A][B]/(k−1 + k2[C]) and v = k1k2[A][B][C]/(k−1 + k2[C]). At 0.010 M, v ≈ 9.95 × 10−5 M/s; at 10 M, v ≈ 0.01667 M/s. Low C gives v ≈ (k1k2/k−1)[A][B][C]; high C approaches k1[A][B] = 0.0200 M/s. Competing return and capture of I explain the changing dependence. Overall stoichiometry alone gives no rate law. Short I lifetime, steady state and absence of side routes need independent evidence such as time resolution or I detection. Actual activity effects at 10 M may invalidate the approximation.
  - Understanding focus (DE): Nach einem Impuls steigt [I] zunächst deutlich. Welche Zeitphase verletzt die Näherung, und welche vollständige Differentialgleichung muss dort gelten?
  - Understanding focus (EN): After a pulse, [I] initially accumulates substantially. Which time phase violates the approximation, and which full differential equation applies there?
## Page 4: Reaktionsbedingungen hypothesengeleitet untersuchen

- Full learning-goal ID: `536030f8-70dc-519d-8039-92290c68d95d`
- Goal fingerprint: `sha256:4a1bc4b8ba9535738d37f157f6a1a3ecbb20805e32692d2b223a9ac0f525a926`
- Page fingerprint: `sha256:a018cb4e3dec3106344265b03dc80a3cb495890e999c1ba1a67ba153470ce7d0`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann Experimente planen, durchführen und auswerten, um den Einfluss gewählter Reaktionsbedingungen auf die Reaktionsgeschwindigkeit hypothesengeleitet zu untersuchen.

### Visualization

/assets/goal-visualizations/chemie/536030f8-70dc-519d-8039-92290c68d95d/536030f8-70dc-519d-8039-92290c68d95d.jpg

- original digest: `sha256:5df9bd5d0d4cdf3f665043c8cce880ae54244ab542b9d09bf25148a4626cd089`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Geschwindigkeiten bestimmen — `56bc6377-1291-58bc-b433-5b9f673888e9` (page 2)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Einflussfaktoren diskutieren — `3ce81f96-4fbb-5022-88b7-337a000315ed` (outside this book)

### Direct reverse prerequisites outside this book

- HE-GK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:9d15f29c8a6eee6887fc2ab7949dbeadb070ee61ea1c81c10c756417673028a3`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Eine prüfbare kinetische Hypothese benennt Faktor, Messgröße und Kontrollbedingungen.
  - Essential understanding (EN): A testable kinetic hypothesis specifies a factor, measured response and controls.
  - Observable performance (DE): eqrk16-05-a: Hypothese und Faktor-/Kontrollvariablen einschließlich sicherer Messfolge festlegen. eqrk16-05-b: Drei konkrete Konfundierungen der Werbekarten identifizieren.
  - Observable performance (EN): eqrk16-05-a: Specify hypothesis, factor/controls, and a safe measurement sequence. eqrk16-05-b: Identify three concrete confounds in the adverts.
- `e2`
  - Essential understanding (DE): Zeit-Volumen-Daten trennen Geschwindigkeit vom Endumsatz und von physikalischer Gasfreisetzung.
  - Essential understanding (EN): Time-volume data distinguish rate, final conversion and physical gas release.
  - Observable performance (DE): eqrk16-05-a: 0,20/0,75mL/s samt Unsicherheit und Teilchenerklärung auswerten. eqrk16-05-b: Kontrollierte Daten und begrenzten Faktor 1,75 interpretieren.
  - Observable performance (EN): eqrk16-05-a: Evaluate both rates, uncertainty, and particle explanation. eqrk16-05-b: Interpret controlled data and the limited 1.75 factor.
- `e3`
  - Essential understanding (DE): Eigene Durchführung erfordert tatsächliche Bedien- und Rohdatenbelege; Modellwerte prüfen nur Auswertung/Planung.
  - Essential understanding (EN): Own experimental conduct requires real operational/raw-data evidence; model data assess planning/evaluation only.
  - Observable performance (DE): eqrk16-05-a: Zeitlicher Verlauf, Endumsatz und tatsächliche künftige Durchführung trennen. eqrk16-05-b: Gasphysik und sichere eigene Kontrollmessung einplanen.
  - Observable performance (EN): eqrk16-05-a: Separate time course, final conversion, and actual future conduct. eqrk16-05-b: Include gas physics and safe own control measurements.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `eqrk16-05-a-transfer`: Vergleiche stattdessen gleiche Körnung bei zwei Säurekonzentrationen, aber gleicher Säurestoffmenge durch verschiedene Volumina. Identifiziere die neue Volumen-/Mischkonfundierung und entwirf eine saubere Alternative. / Instead compare equal grain sizes at two acid concentrations but equal acid amounts through different volumes. Identify the new volume/mixing confound and design a cleaner comparison.
- `eqrk16-05-b-transfer`: Ein Enzym zeigt bei 60 °C weniger Produkt als bei 35 °C. Formuliere statt „RGT widerlegt“ zwei prüfbare Hypothesen und einen Rückkühl-/Aktivitätskontrollversuch. / An enzyme gives less product at 60 °C than 35 °C. Propose two testable hypotheses and a cooling-back/activity control instead of simply rejecting all temperature effects.

**Application cases**

- `eqrk16-05-a`
  - Task demand (DE): Vollständiges eigenes Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json #eqrk16-05-a; sha256:86dc6b7640368abf7dbd12b51f4cdf48aba1731f7f543169a30c14261c3ccd2e. Formuliere Hypothese und kontrollierten eigenen Messplan einschließlich Wiederholungen. Werte mittlere Anfangsgeschwindigkeiten 0–20 s und den Endumsatz aus; erkläre den Oberflächeneffekt auf Teilchenebene. Lege fest, welche zukünftigen Rohprotokolle eine eigene sichere Durchführung zeigen würden, und was die gegebenen Modellwerte nicht beweisen.
  - Task demand (EN): Complete own material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json #eqrk16-05-a; sha256:86dc6b7640368abf7dbd12b51f4cdf48aba1731f7f543169a30c14261c3ccd2e. Formulate a hypothesis and a controlled measurement plan including repeats. Evaluate average initial rates over 0–20 s and final conversion; explain surface effects at particle level. Specify future raw records demonstrating safe own conduct and what the supplied model data cannot prove.
  - Expected performance (DE): Hypothese: mehr zugängliche Oberfläche erhöht bei gleicher Stoffmenge und sonst gleichen Bedingungen die anfängliche CO2-Bildungsrate. CaCO3+2H+→Ca2++CO2+H2O. Mittelraten 0,20 bzw. 0,75 mL/s; Differenz deutlich größer als aus ±1 mL folgenden ±0,10 mL/s pro Differenzquotient. Mehr Grenzflächenplätze ermöglichen mehr wirksame Kontakte pro Zeit. Gleiche CaCO3-Menge begrenzt theoretisch denselben Endumsatz; grobe Probe ist bei 120 s noch nicht sicher beendet,22±1 gegenüber24±1 allein belegt keinen anderen endgültigen Umsatz. Mindestens kontrollierte Wiederholungen, Dichtigkeit/Leerwert, gleiche Körnerherkunft und Temperatur. Künftige originale Zeitreihen, Start-/Bediennotizen, Abweichungen und sichere Entsorgung dokumentieren; die erfundenen Daten sind kein Durchführungsnachweis.
  - Expected performance (EN): Hypothesis: greater accessible area increases initial CO2 formation at equal amount and other conditions. CaCO3+2H+→Ca2++CO2+H2O. Mean rates 0.20 and 0.75 mL/s; their difference exceeds the conservative ±0.10 mL/s contribution from ±1 mL endpoints. More interfacial sites allow more effective contacts per time. Equal CaCO3 limits the same theoretical final conversion; at 120 s the coarse sample may still react, so22±1 versus24±1 does not establish a different final yield. Use repeats, leak/blank checks, same source and temperature. Future original time series, handling/start notes, deviations and safe disposal document conduct; fictional data do not.
  - Understanding focus (DE): Vergleiche stattdessen gleiche Körnung bei zwei Säurekonzentrationen, aber gleicher Säurestoffmenge durch verschiedene Volumina. Identifiziere die neue Volumen-/Mischkonfundierung und entwirf eine saubere Alternative.
  - Understanding focus (EN): Instead compare equal grain sizes at two acid concentrations but equal acid amounts through different volumes. Identify the new volume/mixing confound and design a cleaner comparison.
- `eqrk16-05-b`
  - Task demand (DE): Vollständiges eigenes Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json #eqrk16-05-b; sha256:86dc6b7640368abf7dbd12b51f4cdf48aba1731f7f543169a30c14261c3ccd2e. Prüfe die Behauptung „Die Tablettenbilder beweisen allein den Temperatureffekt“. Werte den kontrollierten Vergleich aus und leite einen nächsten eigenen Versuch bei unverändertem Zerteilungsgrad ab. Beziehe Gaslöslichkeit, Wärmedehnung, Wiederholungen und möglichen Abbruch bei Undichtigkeit ein.
  - Task demand (EN): Complete own material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json #eqrk16-05-b; sha256:86dc6b7640368abf7dbd12b51f4cdf48aba1731f7f543169a30c14261c3ccd2e. Assess “the tablet images alone prove a temperature effect”. Evaluate the controlled comparison and plan a further own experiment with unchanged division. Consider gas solubility, thermal expansion, repeats, and stopping if leaks occur.
  - Expected performance (DE): Die Werbekarten ändern Temperatur, Volumen, Konzentration und Oberfläche zugleich. Das sichtbare Ende hängt außerdem von Lösen und Gasfreisetzung ab; ein Temperatureffekt ist nicht isoliert. Die kontrollierten Raten sind 0,40 und 0,70 mL/s, also Faktor 1,75 für dieses Intervall. Daraus folgt keine allgemeine RGT-Konstante oder Reaktionsordnung. Ein größerer Anteil genügend energiereicher Zusammenstöße ist plausibel. Kontrolliere Lösungstemperatur und gemeinsame Gasmesstemperatur sowie Druck; berücksichtige CO2-Löslichkeit, Wiederholungen und einen dichten, aber beweglichen Gasweg. Bei Leck stoppen und Rohdaten sowie Abweichung dokumentieren. Passende Ergebnisse dürfen nicht erfunden werden; ein eigener Verlauf bleibt zu erheben.
  - Expected performance (EN): The adverts change temperature, volume, concentration and area together. The visible endpoint also depends on dissolution and gas release, so temperature is not isolated. Controlled rates are 0.40 and 0.70 mL/s, a ratio of 1.75 for this interval, not a universal temperature rule or reaction order. A larger fraction of sufficiently energetic collisions is plausible. Control solution temperature and common gas temperature/pressure; consider dissolved CO2, repeats and a leak-free freely moving gas path. Stop if a leak occurs and record raw data and deviations. Do not invent fitting results; an own time series remains future work.
  - Understanding focus (DE): Ein Enzym zeigt bei 60 °C weniger Produkt als bei 35 °C. Formuliere statt „RGT widerlegt“ zwei prüfbare Hypothesen und einen Rückkühl-/Aktivitätskontrollversuch.
  - Understanding focus (EN): An enzyme gives less product at 60 °C than 35 °C. Propose two testable hypotheses and a cooling-back/activity control instead of simply rejecting all temperature effects.
## Page 5: Sauerstoff, Kohlenstoffdioxid und Wasserstoff nachweisen

- Full learning-goal ID: `580b3616-f121-5d82-ac6b-fc24f145fbdc`
- Goal fingerprint: `sha256:afc82985c112c5bbc2aadd3a2be4980f2f6f5ed085053c736f3c99540ae812d7`
- Page fingerprint: `sha256:27f42b59924aed418f0897fdc4e58d23bd24b2eb412181f13a4f2698f1b51928`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann Sauerstoff, Kohlenstoffdioxid und Wasserstoff mithilfe einfacher Nachweisreaktionen identifizieren und die Beobachtungen fachlich deuten.

### Visualization

/assets/goal-visualizations/chemie/580b3616-f121-5d82-ac6b-fc24f145fbdc/580b3616-f121-5d82-ac6b-fc24f145fbdc.jpg

- original digest: `sha256:d8de810a8fbd5dd184a0d69115d0a0999228edffffcf14b2b10e20d7e4b86f33`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Arbeitsweisen der Chemie anwenden — `266a2b2a-9ee2-52f6-ae09-59343da9a60b` (outside this book)
- Chemische Reaktionen von physikalischen Vorgängen unterscheiden — `8d4ef102-e6a6-4d2e-bb6b-e707d3f2e566` (outside this book)

### Direct reverse prerequisites outside this book

- Nachweise für Sauerstoff, Wasserstoff und Kohlenstoffdioxid abrufen — `a738ca10-c93d-5575-bec3-2dd7b94af9d3` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:c2bdeb48c826337f8ca8deabc6ddd08b7e2baad1717e99c0b571a78ec1fea61d`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `core-understanding`
  - Essential understanding (DE): Gasidentifikation verlangt einen zum Gas passenden Nachweis und die Deutung der positiven Beobachtung. Glimmspan, Kalkwasser und kleine kontrollierte Knallgasprobe unterscheiden O2, CO2 und H2; ein Einzeltest beweist nicht die Reinheit eines Gemisches.
  - Essential understanding (EN): Gas identification requires an appropriate test and interpretation of the positive observation. A glowing splint, limewater and a small controlled hydrogen ignition test distinguish O2, CO2 and H2; a single test does not prove mixture purity.
  - Observable performance (DE): A ist O2: Sauerstoff unterstützt die Verbrennung des Glimmspans. B ist CO2: CO2 + Ca(OH)2 → CaCO3↓ + H2O; die Trübung ist ausgefälltes Calciumcarbonat. C ist H2: 2 H2 + O2 → 2 H2O, die schnelle Reaktion einer kleinen Probe mit Luftsauerstoff verursacht das Geräusch. Die Luftkontrolle zeigt unter den dokumentierten Bedingungen kein Wiederaufflammen des Spans und die CO2-freie Kontrolle klares Kalkwasser; beide dienen als Vergleich für die positiven Beobachtungen bei A und B. Keine Probe wird direkt gerochen oder in einer unbekannten großen Menge gezündet.
  - Observable performance (EN): A is O2: oxygen supports combustion of the glowing splint. B is CO2: CO2 + Ca(OH)2 → CaCO3↓ + H2O; precipitated calcium carbonate causes the cloud. C is H2: 2 H2 + O2 → 2 H2O; rapid reaction of a small sample with atmospheric oxygen causes the sound. Under the documented conditions, the air control shows no splint relighting and the CO2-free control leaves limewater clear; both provide a comparison with the positive observations for A and B. No sample is smelled directly or ignited in an unknown large quantity.
- `fresh-transfer-and-limit`
  - Essential understanding (DE): Drei reine unbekannte Gase gegenüber einem feuchten CO2/H2-Gemisch; Testreihenfolge, negative Kontrolle und Grenzen negativer Befunde. Positiver Nachweis eines Bestandteils ist kein Reinheitsnachweis; das O2 der H2-Probe kann aus der Luft stammen.
  - Essential understanding (EN): Three unknown pure gases versus a moist CO2/H2 mixture; test order, negative control and limits of negative findings. Positive detection of one component does not prove purity; oxygen for the hydrogen test may come from air.
  - Observable performance (DE): Der erste Test belegt CO2 durch Bildung von CaCO3. Der spätere Test belegt H2 im Restgas durch die Reaktion mit O2 aus der Testumgebung. Daher war das ursprüngliche Gas kein reines CO2. Der negative Glimmspantest liefert unter diesen Bedingungen keinen positiven O2-Nachweis, schließt einen kleinen O2-Anteil aber ohne Nachweisgrenze nicht sicher aus. Anteile oder vollständige Zusammensetzung lassen sich aus qualitativen Tests nicht berechnen.
  - Observable performance (EN): The first test supports CO2 through CaCO3 formation. The later test supports H2 in the residual gas through reaction with O2 supplied by the test environment. Thus the original gas was not pure CO2. Under these conditions the negative splint test gives no positive O2 detection, but does not exclude a small O2 fraction without a detection limit. Qualitative tests do not provide component amounts or a complete composition.

**Coverage expectations**

- required expectations: `core-understanding`, `fresh-transfer-and-limit`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `specific-system-variation`: Drei reine unbekannte Gase gegenüber einem feuchten CO2/H2-Gemisch; Testreihenfolge, negative Kontrolle und Grenzen negativer Befunde. / Three unknown pure gases versus a moist CO2/H2 mixture; test order, negative control and limits of negative findings.
- `model-boundary`: Positiver Nachweis eines Bestandteils ist kein Reinheitsnachweis; das O2 der H2-Probe kann aus der Luft stammen. / Positive detection of one component does not prove purity; oxygen for the hydrogen test may come from air.

**Application cases**

- `chem-next20-580b3616-case-1`
  - Task demand (DE): Fiktives beaufsichtigtes Demonstrationsprotokoll; keine Durchführung durch Lernende verlangt. A lässt einen glimmenden Span wieder aufflammen. B erzeugt beim Einleiten in frisches Kalkwasser eine weiße Trübung. C ergibt bei einer sehr kleinen fachgerecht geprüften Probe ein kurzes charakteristisches Plopp. Luftkontrolle: kein Wiederaufflammen; CO2-freie Kontrolle: Kalkwasser klar. Ordne A, B und C zu. Erkläre die Beobachtungen, formuliere die CO2- und H2-Nachweisreaktionen und begründe den Nutzen der Kontrollen.
  - Task demand (EN): Fictional supervised demonstration record; learners are not asked to perform it. A relights a glowing splint. B produces a white cloud when passed into fresh limewater. A very small professionally checked sample of C produces a brief characteristic pop. Air control: no relighting; CO2-free control: limewater remains clear. Identify A, B and C. Explain the observations, write the CO2 and H2 test reactions and justify the controls.
  - Expected performance (DE): A ist O2: Sauerstoff unterstützt die Verbrennung des Glimmspans. B ist CO2: CO2 + Ca(OH)2 → CaCO3↓ + H2O; die Trübung ist ausgefälltes Calciumcarbonat. C ist H2: 2 H2 + O2 → 2 H2O, die schnelle Reaktion einer kleinen Probe mit Luftsauerstoff verursacht das Geräusch. Die Luftkontrolle zeigt unter den dokumentierten Bedingungen kein Wiederaufflammen des Spans und die CO2-freie Kontrolle klares Kalkwasser; beide dienen als Vergleich für die positiven Beobachtungen bei A und B. Keine Probe wird direkt gerochen oder in einer unbekannten großen Menge gezündet.
  - Expected performance (EN): A is O2: oxygen supports combustion of the glowing splint. B is CO2: CO2 + Ca(OH)2 → CaCO3↓ + H2O; precipitated calcium carbonate causes the cloud. C is H2: 2 H2 + O2 → 2 H2O; rapid reaction of a small sample with atmospheric oxygen causes the sound. Under the documented conditions, the air control shows no splint relighting and the CO2-free control leaves limewater clear; both provide a comparison with the positive observations for A and B. No sample is smelled directly or ignited in an unknown large quantity.
  - Understanding focus (DE): Ein Wiederaufflammen ist keine Stoffmengenmessung; ein negatives Ergebnis allein beweist keine Abwesenheit unter allen Versuchsbedingungen.
  - Understanding focus (EN): Relighting is not an amount measurement; a negative result alone does not prove absence under every experimental condition.
- `chem-next20-580b3616-case-2`
  - Task demand (DE): Frischer fiktiver Fall: Ein Gasgemisch trübt zuerst frisches Kalkwasser. Nach der dokumentierten CO2-Abtrennung bleibt ein Gas zurück, das in einer getrennten kleinen Lehrerprobe den H2-Nachweis zeigt. Der Glimmspan-Nachweis ist vor und nach Abtrennung negativ. Die Nachweisgrenzen und die Mengenanteile sind nicht bekannt. Deute beide positiven Tests auf Teilchenebene. Beurteile die Behauptung: „Das ursprüngliche Gas war reines CO2, und O2 ist sicher vollständig abwesend.“
  - Task demand (EN): Fresh fictional case: a mixture initially clouds fresh limewater. After documented removal of CO2, a remaining gas gives a positive H2 test in a separate small teacher demonstration. The glowing-splint test is negative before and after removal. Detection limits and component amounts are unknown. Interpret both positive tests at particle level. Evaluate: “The original gas was pure CO2 and O2 is certainly completely absent.”
  - Expected performance (DE): Der erste Test belegt CO2 durch Bildung von CaCO3. Der spätere Test belegt H2 im Restgas durch die Reaktion mit O2 aus der Testumgebung. Daher war das ursprüngliche Gas kein reines CO2. Der negative Glimmspantest liefert unter diesen Bedingungen keinen positiven O2-Nachweis, schließt einen kleinen O2-Anteil aber ohne Nachweisgrenze nicht sicher aus. Anteile oder vollständige Zusammensetzung lassen sich aus qualitativen Tests nicht berechnen.
  - Expected performance (EN): The first test supports CO2 through CaCO3 formation. The later test supports H2 in the residual gas through reaction with O2 supplied by the test environment. Thus the original gas was not pure CO2. Under these conditions the negative splint test gives no positive O2 detection, but does not exclude a small O2 fraction without a detection limit. Qualitative tests do not provide component amounts or a complete composition.
  - Understanding focus (DE): Positiver Nachweis eines Bestandteils ist kein Reinheitsnachweis; das O2 der H2-Probe kann aus der Luft stammen.
  - Understanding focus (EN): Positive detection of one component does not prove purity; oxygen for the hydrogen test may come from air.
## Page 6: Oxidationsprodukte von Alkanolen erklären

- Full learning-goal ID: `5851b53a-162b-5c17-9269-510ee54ad846`
- Goal fingerprint: `sha256:ebc73cd6625e4da997dff260d03f829199ffa5fcf355f8987af37ababb773106`
- Page fingerprint: `sha256:46c22733f9f4897f11a6cab85c99936c2185a1a0c996f477222c7e604ea5111c`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann die Bildung von Aldehyden, Ketonen und Carbonsäuren bei der Oxidation geeigneter Alkanole erklären.

### Visualization

/assets/goal-visualizations/chemie/5851b53a-162b-5c17-9269-510ee54ad846/5851b53a-162b-5c17-9269-510ee54ad846.jpg

- original digest: `sha256:17070847465ffc8507f9aaf0dad7722f397350015f73a7357c5e8d7620114ae5`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)

### Direct reverse prerequisites outside this book

- HE-GK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)
- Aldehyd- und Keton-Nachweise durchführen und deuten — `973c12d9-d863-5292-8c68-9c80cdacf9e2` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:3e9deab1ac46ecb879e7aca3999907c839720168fdf505287d316f2a3197207e`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `b002-5851b53a-core`
  - Essential understanding (DE): Die lokale Klasse des Alkanols bestimmt das erste Carbonylprodukt: primär zu Aldehyd, sekundär zu Keton; ein primäres Aldehyd kann weiter zur Carbonsäure oxidieren.
  - Essential understanding (EN): The local alkanol class determines the first carbonyl product: primary to aldehyde, secondary to ketone; a primary-derived aldehyde may oxidize further to a carboxylic acid.
  - Observable performance (DE): Die lernende Person zeichnet zu gegebenen Alkanolstrukturen passende Produkte und erklärt mit Änderungen am OH-tragenden C, weshalb die Produkte verschieden sind.
  - Observable performance (EN): The learner draws suitable products for given alkanol structures and explains via changes at the OH-bearing carbon why the products differ.

**Coverage expectations**

- required expectations: `b002-5851b53a-core`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `oxidation-depth`: Primäres Alkanol mit begrenzter und weitergehender Oxidation. / A primary alkanol under limited and further oxidation.
- `alkanol-class`: Sekundäres Alkanol als neuer Vergleich ohne Carbonsäureprodukt. / A secondary alkanol as fresh comparison without a carboxylic-acid product.

**Application cases**

- `ethanol-product-sequence`
  - Task demand (DE): Vorgegebene Strukturdaten zeigen Ethanol unter begrenzter und weitergehender Oxidation. Zeichne die zwei aufeinanderfolgenden organischen Produkte und erläutere die Strukturänderung.
  - Task demand (EN): Supplied structure data show ethanol under limited and further oxidation. Draw the two consecutive organic products and explain structural change.
  - Expected performance (DE): Die lernende Person zeichnet Ethanal und danach Ethansäure, unterscheidet Aldehyd- und Carboxylgruppe und behauptet nicht, beide entstünden stets zugleich.
  - Expected performance (EN): The learner draws ethanal then ethanoic acid, distinguishes aldehyde and carboxyl groups, and does not claim both always arise together.
  - Understanding focus (DE): Reaktionsbedingungen steuern die Tiefe, die Ausgangsstruktur begrenzt Produkte.
  - Understanding focus (EN): Conditions control oxidation extent while starting structure constrains products.
- `fresh-secondary-product`
  - Task demand (DE): Ein frischer Fall oxidiert Propan-2-ol unter geeigneten milden Bedingungen. Welches organische Produkt ist plausibel und warum entsteht daraus nicht analog eine Carbonsäure mit demselben C-Gerüst?
  - Task demand (EN): A fresh case oxidizes propan-2-ol under suitable mild conditions. Which organic product is plausible, and why does an analogous carboxylic acid not arise with the same carbon skeleton?
  - Expected performance (DE): Die lernende Person zeichnet Propanon aus dem sekundären OH-C und erklärt, dass das Keton keine weitere analoge C-H-Oxidation am Carbonyl-C besitzt.
  - Expected performance (EN): The learner draws propanone from the secondary OH-bearing carbon and explains that the ketone lacks an analogous carbonyl-carbon H for further oxidation.
  - Understanding focus (DE): Neuer Alkanoltyp prüft Struktur-Produkt-Transfer.
  - Understanding focus (EN): A new alkanol type tests structure-product transfer.
## Page 7: Chemische Informationen aus Quellen erschließen

- Full learning-goal ID: `5b1bb5d9-07b1-5ba9-b320-cc97be917c60`
- Goal fingerprint: `sha256:93fd43fc3d160be0229abf4469a3b9ba2e28f9e061c49ece39c5e5bb5883ec19`
- Page fingerprint: `sha256:6b7456719836e4da8c6ae766b4ea5f986f051e6f3440403174db087691b3e4ba`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann zur Beantwortung einer chemischen Frage relevante Informationen aus vorgegebenen oder selbst recherchierten Texten, Bildern und anderen Darstellungen auswählen, fachlich strukturieren, adressaten- und situationsgerecht auswerten und die verwendeten Quellen angeben.

### Visualization

/assets/goal-visualizations/chemie/5b1bb5d9-07b1-5ba9-b320-cc97be917c60/5b1bb5d9-07b1-5ba9-b320-cc97be917c60.png

- original digest: `sha256:e26aaa12457ea4311e25931b715b46dc47ef8eefcd180bf10c06506507be4ff6`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)

### Direct reverse prerequisites outside this book

- HE-GK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)
- Chemische Informationen in geeignete Darstellungen überführen — `31781d00-8f20-5041-bd7f-e261b27af162` (outside this book)
- Chemische Pro- und Kontra-Argumente abwägen — `431a0f03-f28a-5e56-a61f-000336d0b410` (outside this book)
- Chemische Anwendungen und ihre gesellschaftliche Bedeutung diskutieren — `7f140b34-ed26-59e7-8ad2-ccb6b56bc9d6` (outside this book)
- Wirkstoffentwicklung, Produktion und Vermarktung verknüpfen — `3eb2a06c-d283-57aa-9eb4-088940c4801a` (outside this book)
- Lebensmittelzusammensetzung recherchieren und kategorisieren — `9fa7d857-451a-5c1b-b6f4-d4ff97d7f39f` (outside this book)
- Komplexe chemische Quellen selbstständig erschließen — `ac8b6c0f-98b2-5092-806d-d9498efbfa35` (outside this book)
- Fossile und nachwachsende Rohstoffe nachhaltig bewerten — `a0e8f0f2-24e2-5945-a511-597d32e73796` (outside this book)
- Schmerzmittelwirkstoffe chemisch einordnen — `f71a2c0a-3a6a-5b23-9fb4-1b57cfb68528` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:460bca7e578e85e8f3186b2f6e4fc02ef72e50ede606dd8226419c3684f58321`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `select-relevant-sources`
  - Essential understanding (DE): Relevanz hängt an chemischer Frage, Adressat und Situation; Werbung, Eigenschaftsangaben und Vergleichsdaten erfüllen verschiedene Funktionen.
  - Essential understanding (EN): Relevance depends on the chemical question, audience and situation; advertising, property descriptions and comparison data serve different functions.
  - Observable performance (DE): Wählt für Reinigungsinformation bzw. Verpackungsvergleich passende Text-/Tabelleninformationen, identifiziert Urheber/Quelle und erklärt das Weglassen ungestützter Werbung. Nur im tatsächlich recherchepflichtigen Quellenkontext zusätzlich selbst suchen, Quelle öffnen/lesen, konkrete Fundstelle und Suchweg nachweisen; vorgegebene UND eigene Quelle verwenden.
  - Observable performance (EN): Selects suitable text/table information for cleaning advice or packaging comparison, identifies authors/sources and explains exclusion of unsupported advertising. In an actually research-requiring source context additionally locate/open/read a source and evidence the actual location/search path; use given AND own sources.
- `structure-and-interpret`
  - Essential understanding (DE): Gleiche Bezugsgrößen erlauben begrenzte Stoff-/Eigenschaftsvergleiche; aus Masse oder Rückstand allein folgt keine allgemeine Umwelt- oder Sicherheitsbilanz.
  - Essential understanding (EN): Equal reference quantities permit bounded substance/property comparisons; mass or residue alone does not yield a general environmental or safety balance.
  - Observable performance (DE): Strukturiert chemische Erklärung, Modellvergleich und Sicherheits-/Datengrenzen zielgruppengerecht und nennt Einheiten, gleiche 250 mL bzw. gleiche Fünf-Minuten-Bedingungen.
  - Observable performance (EN): Structures chemical explanation, model comparison and safety/data limits for the audience and states units, equal 250 mL or equal five-minute conditions.
- `fresh-audience-and-context`
  - Essential understanding (DE): Eine neue Zielgruppe oder Mehrwegfrage benötigt zusätzliche relevante Information, nicht erfundene Wirkung aus vorhandenen Daten.
  - Essential understanding (EN): A new audience or reuse question needs additional relevant information, not invented effects from existing data.
  - Observable performance (DE): Passt die Auswahl für das Hausmeisterteam an und benennt für Mehrwegkreisläufe Reinigung, Transport und Nutzungszahl als fehlende Angaben.
  - Observable performance (EN): Adapts selection for the caretaker team and names cleaning, transport and number of uses as missing information for reuse cycles.

**Coverage expectations**

- required expectations: `select-relevant-sources`, `structure-and-interpret`, `fresh-audience-and-context`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `audience`: Jüngere Lernende werden durch ein technisch verantwortliches Team ersetzt. / Younger learners are replaced by a technically responsible team.
- `reference-system`: Stückmasse wird von Masse je tatsächlicher Nutzung und vollständiger Kreislaufbilanz unterschieden. / Mass per item is distinguished from mass per actual use and a complete cycle balance.
- `source-context-own-research`: Das kanonische ODER bleibt unverändert. Auf BY C9 NTG LB1 ist zusätzlich zu vorgegebenen Quellen eigene Suche, tatsächliches Lesen, Auswahl, fachliche Deutung, Adressatenanpassung und genaue Quellenangabe verbindlich (vorgegebene UND selbst recherchierte Quellen). C8/C9 Nicht-NTG behalten ihre vorgegebenen Einstiegsquellen. Andere Quellenwege folgen ihren tatsächlich geprüften Pflichten; keine universelle pharmazeutische Recherche, keine Stufen-/Kursableitung aus GK/LK-Tags. Ganze Quellen- und Partnerpflichten bleiben offen. / The canonical OR is unchanged. On BY C9 NTG LB1, given sources must be supplemented by own locating, actual reading, selection, scientific interpretation, audience adaptation and precise attribution (given AND independently researched sources). C8/C9 non-NTG retain their given-source entry routes. Other source routes follow their actually reviewed duties; no universal pharmaceutical research or stage/course inference from GK/LK tags. Whole source and partner duties remain open.

**Application cases**

- `sek1-source-information-cleaning-advice`
  - Task demand (DE): Wähle für eine kurze Information an eine jüngere Klasse relevante Aussagen aus den Quellen, strukturiere Erklärung/Versuchsbefund/Sicherheit und gib Quellen an. Unterscheide Werbespruch und belegten Vergleich; führe keine Reinigung aus.
Frische Variation: Passe die Information für ein Hausmeisterteam an: Welche Bedingung und Quellenangabe muss ausführlicher sein?
Nur auf der Route mit eigener Recherchepflicht: Bestimme eine noch offene Frage für die jeweilige Zielgruppe; finde selbst eine passende zugängliche Quelle über eigene Suche/Navigation, öffne und lies sie. Reiche Suchpfad, Urheber/Titel, genaue URL, Datum/Abruf, konkrete Überschrift/Absatz oder PDF-Seite und eigene fachliche Paraphrase ein. Begründe Auswahl und Grenzen, trenne selbst gefundene Aussagen von S/T-Lehrmodellzahlen, und passe die Information an die neue Zielgruppe bzw. Mehrwegfrage an. Verwende vorgegebene UND selbst gefundene Quellen. Die leere own-source-search-read-cite.learner-blank.csv und OWN-SOURCE-RESEARCH.route.de-en.md sind das Arbeitsmaterial; die Autorenbeispiele zählen nicht als eigene Recherche.
  - Task demand (EN): Select relevant statements for a short information note to a younger class, structure explanation/experiment finding/safety and cite sources. Distinguish advertising slogan from supported comparison; do not perform cleaning.
Fresh variation: Adapt the information for a caretaker team: which condition and source citation needs more detail?
Only on a route requiring own research: identify an unresolved audience-specific question; independently locate an accessible suitable source through own search/navigation, open and read it. Submit search path, author/title, exact URL, date/access time, precise heading/paragraph or PDF page and an own scientific paraphrase. Justify relevance and limits, separate found statements from S/T model numbers, and adapt information to the fresh audience/reuse question. Use given AND independently found sources. Use own-source-search-read-cite.learner-blank.csv and OWN-SOURCE-RESEARCH.route.de-en.md; author examples are not own research.
  - Expected performance (DE): S1 erklärt die chemische Reaktion; S4 zeigt unter den gegebenen Bedingungen weniger sichtbaren Kalk bei B, beweist nicht „reinigt alles“. S3 liefert notwendige Einschränkungen und Nichtmischen. Für die jüngere Klasse etwa: „Bestimmte Säuren reagieren mit Kalk. In unserem Vergleich blieb bei B weniger Kalk sichtbar. Nicht jede Oberfläche verträgt Säure, und Reiniger werden nie gemischt.“ S1/S3/S4 ausdrücklich belegen; S2 als Werbung kennzeichnen.
Frischer Transfer: Für das Hausmeisterteam die Aufgabe zuerst auf Materialverträglichkeit, sicheren Ablauf und vergleichbare Wirkung eingrenzen. S1 erklärt fachlich die Säure-Carbonat-Reaktion; S3 liefert die im Lehrfall genannten Grenzen und das Mischverbot; S4 zeigt nur Rückstand nach fünf Minuten unter gleicher Proben-/Mengenbedingung. S2 bietet keine belastbare Alles-reinigen-Evidenz. Ein kurzes strukturiertes Blatt trennt diese Quellen und Modellzahlen. Für einen realen Einsatz fehlen konkrete Oberflächenidentität, Herstelleranweisung und Verträglichkeitsprüfung; aus 20 statt 60 Rest folgt kein allgemeiner Dosierungs-/Zeitplan. Quellen angeben und für das Team die offenen Angaben sichtbar machen, statt eine eigenständige Reinigungsanweisung zu erfinden.
Auf der eigenen Rechercheroute liegen ein tatsächlich selbst gefundener und gelesener relevanter Beleg, ein eigenes ausgefülltes Such-/Lese-/Zitierprotokoll und begründete adressatengerechte Fassungen vor. Die getroffene Auswahl wird an der chemischen Frage erklärt; Original-S/T-Daten bleiben als Lehrmodellzahlen gekennzeichnet, externe Quellen liefern keine erfundenen Messwerte dazu. Fehlende Datum-/Oberflächen-/Kreislaufangaben bleiben offen. Vorgegebene Quelle oder Musterparaphrase allein schließt diesen Quellenweg nicht.
  - Expected performance (EN): S1 explains the chemical reaction; S4 shows less visible scale with B under the given conditions, not proof of “cleans everything”. S3 supplies necessary restrictions and no-mixing advice. For the younger class: “Some acids react with limescale. In our comparison B left less visible scale. Not every surface tolerates acid, and cleaners are never mixed.” Explicitly cite S1/S3/S4; identify S2 as advertising.
Fresh transfer: For the caretaker team first narrow the task to material compatibility, safe procedure and comparable effect. S1 scientifically explains acid–carbonate reaction; S3 supplies the teaching case’s limits and no-mixing rule; S4 shows only residue after five minutes under equal sample/amount conditions. S2 provides no reliable cleans-everything evidence. A short structured sheet separates these sources and model numbers. Real use still lacks specific surface identity, manufacturer instructions and compatibility checks; 20 rather than 60 residue does not yield a general dose/time plan. Cite sources and make missing information visible to the team rather than inventing independent cleaning instructions.
On the own-research route, evidence includes an independently located and actually read relevant source, own completed search/read/citation log and justified audience versions. Explain relevance to the chemical question; retain S/T values as teaching-model data and invent no external measurements for them. Missing date/surface/cycle information stays open. A supplied source or reference paraphrase alone does not complete this route.
  - Understanding focus (DE): Zielgruppenbezogene Auswahl wahrt chemische, sicherheitsbezogene und datenabhängige Grenzen.
  - Understanding focus (EN): Audience-specific selection preserves chemical, safety and data-dependent limits.
- `sek1-source-information-packaging-table`
  - Task demand (DE): Wähle aus Text, Tabelle und Prozessdarstellung passende Informationen für die Frage „Was muss man beim Vergleich dieser Behälter beachten?“ Formuliere eine strukturierte Antwort für die Schülerzeitung und belege die genutzten Quellen.
Frische Variation: Für einen mehrfach verwendeten Behälter: Welche zusätzliche Information ist wichtiger als Masse je Stück?
Nur auf der Route mit eigener Recherchepflicht: Bestimme eine noch offene Frage für die jeweilige Zielgruppe; finde selbst eine passende zugängliche Quelle über eigene Suche/Navigation, öffne und lies sie. Reiche Suchpfad, Urheber/Titel, genaue URL, Datum/Abruf, konkrete Überschrift/Absatz oder PDF-Seite und eigene fachliche Paraphrase ein. Begründe Auswahl und Grenzen, trenne selbst gefundene Aussagen von S/T-Lehrmodellzahlen, und passe die Information an die neue Zielgruppe bzw. Mehrwegfrage an. Verwende vorgegebene UND selbst gefundene Quellen. Die leere own-source-search-read-cite.learner-blank.csv und OWN-SOURCE-RESEARCH.route.de-en.md sind das Arbeitsmaterial; die Autorenbeispiele zählen nicht als eigene Recherche.
  - Task demand (EN): Select suitable information from text, table and process representation for “What must be considered when comparing these containers?” Write a structured answer for the school newspaper and cite the sources used.
Fresh variation: For a reusable container: what additional information matters more than mass per item?
Only on a route requiring own research: identify an unresolved audience-specific question; independently locate an accessible suitable source through own search/navigation, open and read it. Submit search path, author/title, exact URL, date/access time, precise heading/paragraph or PDF page and an own scientific paraphrase. Justify relevance and limits, separate found statements from S/T model numbers, and adapt information to the fresh audience/reuse question. Use given AND independently found sources. Use own-source-search-read-cite.learner-blank.csv and OWN-SOURCE-RESEARCH.route.de-en.md; author examples are not own research.
  - Expected performance (DE): Gleiches Nutzvolumen ermöglicht einen Massenvergleich: Glas ist im Modell fünfmal so schwer wie Metall und zehnmal so schwer wie Polymer. Materialeigenschaften begrenzen Anwendungen, die Prozesskette zeigt weitere benötigte Lebenszyklusdaten. Aus Masse allein folgt keine Umweltbilanz. Quellen T1/T2 für Eigenschaften, T3 für Mengen und T4 für Prozessbezug nennen; fachliche Begriffe verständlich erklären.
Frischer Transfer: Ein Mehrwegvergleich benötigt tatsächlich erreichte Nutzungen, Ausschuss/Ersatz, Rücktransport sowie Reinigungsenergie, Wasser und Mittel. Unter der rein rechnerischen Modellannahme eines unbeschädigten 200-g-Glasgefäßes mit N tatsächlichen Nutzungen verteilt sich dessen ursprüngliche Materialmasse auf 200/N g je Nutzung; bei zehn Nutzungen 20 g. Das stellt noch keine gleiche Gesamtumweltwirkung zu einem 20-g-Kunststoffgefäß fest, weil Produktion, Reinigung, Transport und Entsorgung fehlen. Nur gleiche 250-mL-Nutzungsleistung vergleichen und Stückmasse, Nutzungszahl und Kreislaufinformationen getrennt strukturieren. Materialeigenschaften aus T1/T2 bleiben relevante Funktionsinformationen, ersetzen aber keine Lebenszyklusdaten.
Auf der eigenen Rechercheroute liegen ein tatsächlich selbst gefundener und gelesener relevanter Beleg, ein eigenes ausgefülltes Such-/Lese-/Zitierprotokoll und begründete adressatengerechte Fassungen vor. Die getroffene Auswahl wird an der chemischen Frage erklärt; Original-S/T-Daten bleiben als Lehrmodellzahlen gekennzeichnet, externe Quellen liefern keine erfundenen Messwerte dazu. Fehlende Datum-/Oberflächen-/Kreislaufangaben bleiben offen. Vorgegebene Quelle oder Musterparaphrase allein schließt diesen Quellenweg nicht.
  - Expected performance (EN): Equal useful volume permits mass comparison: in the model glass is five times as heavy as metal and ten times as heavy as polymer. Material properties limit uses; the process chain shows additional lifecycle data needed. Mass alone does not yield an environmental balance. Cite T1/T2 for properties, T3 for quantities and T4 for process context; explain technical terms accessibly.
Fresh transfer: A reuse comparison needs actual completed uses, rejects/replacement, return transport and washing energy, water and agents. Under the purely computational model assumption of an undamaged 200-g glass vessel with N actual uses, its initial material mass distributes to 200/N g per use; ten uses give 20 g. This does not establish equal overall environmental effect to a 20-g polymer vessel because production, washing, transport and disposal are missing. Compare only equal 250-mL service and separately structure item mass, use count and cycle information. T1/T2 material properties remain relevant functional information but do not replace life-cycle data.
On the own-research route, evidence includes an independently located and actually read relevant source, own completed search/read/citation log and justified audience versions. Explain relevance to the chemical question; retain S/T values as teaching-model data and invent no external measurements for them. Missing date/surface/cycle information stays open. A supplied source or reference paraphrase alone does not complete this route.
  - Understanding focus (DE): Strukturierte Quelleninformation trennt Stofffunktion, Bezugsleistung und noch fehlende Kreislaufdaten.
  - Understanding focus (EN): Structured source information separates material function, reference service and still missing cycle data.
## Page 8: Gasverhalten mit dem kinetischen Teilchenmodell deuten

- Full learning-goal ID: `5c4788a7-6760-53dc-894e-e04bca6f8cd9`
- Goal fingerprint: `sha256:618cc37abe7c18275b88f403c5f6b4d617c9ff68260581df8161421137148e1b`
- Page fingerprint: `sha256:54976c9b50dd2454f200f0e2e56742c05fb5a1befb1273f0b4f7a60379321d58`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann Druck, Temperatur und Volumen von Gasen mit einem kinetischen Teilchenmodell qualitativ deuten.

### Visualization

/assets/goal-visualizations/chemie/5c4788a7-6760-53dc-894e-e04bca6f8cd9/5c4788a7-6760-53dc-894e-e04bca6f8cd9.jpg

- original digest: `sha256:0be30232f2e9da86a08a02a2745c48316486b267007a2a6892bd0e590221a4eb`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Dalton-Modell und Modellcharakter erläutern — `9b5d6326-d27c-4ece-8c72-debda705464a` (outside this book)

### Direct reverse prerequisites outside this book

- Zweiatomigkeit gasfoermiger Elementmolekuele begruenden — `d629220a-8c1e-58ee-a6e1-b5f4f10e2e7a` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:16b7a1d4cbe25d0f244970e2bc57ef8d7b025cf063877b8eb2419cbd6ba1a5ea`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `b005-5c4788a7-core`
  - Essential understanding (DE): Gasdruck entsteht modellhaft durch Stöße der bewegten Teilchen gegen Wände. Bei festem N und V führt höhere Temperatur zu höherer mittlerer Bewegungsenergie; bei festem N und T führt kleineres V zu häufigeren Wandstößen.
  - Essential understanding (EN): Gas pressure is modeled by moving particles striking container walls. At fixed N and V, higher temperature raises mean kinetic energy; at fixed N and T, a smaller V yields more frequent wall collisions.
  - Observable performance (DE): Die lernende Person deutet zwei neue Zustandsänderungen mit Teilchengeschwindigkeit und Stoßhäufigkeit und benennt, welche Größen konstant gehalten werden.
  - Observable performance (EN): The learner interprets two fresh state changes using particle speed and collision frequency and names the quantities held constant.

**Coverage expectations**

- required expectations: `b005-5c4788a7-core`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `variable`: Temperaturänderung und Volumenänderung werden getrennt variiert. / Temperature and volume changes are varied separately.
- `boundary`: Starrer Behälter und isothermer Kolben setzen andere Randbedingungen. / A rigid container and an isothermal piston impose different constraints.

**Application cases**

- `heated-rigid-flask-data`
  - Task demand (DE): Ein geschlossener starrer Behälter mit gleicher Gasmenge wird moderat erwärmt; Messdaten zeigen höheren Druck. Erkläre qualitativ mit dem kinetischen Teilchenmodell und nenne die festgehaltenen Größen.
  - Task demand (EN): A closed rigid container with the same amount of gas is moderately heated; measured pressure rises. Explain qualitatively with the kinetic particle model and name held quantities.
  - Expected performance (DE): Die lernende Person hält N und V fest, erwartet im Mittel schnellere Teilchen und veränderte Wandstöße; sie behauptet nicht, Erwärmen erzeuge neue Gasteilchen.
  - Expected performance (EN): The learner holds N and V fixed, expects faster particles on average and changed wall impacts; heating does not create new gas particles.
  - Understanding focus (DE): Temperaturfall prüft Bewegungsenergie.
  - Understanding focus (EN): The temperature case tests kinetic energy.
- `fresh-isothermal-piston`
  - Task demand (DE): Ein neues Datenset beschreibt langsame Kompression eines Gases im Kolben bei kontrolliert gleicher Temperatur und gleicher Teilchenzahl: V wird halbiert, p steigt. Erkläre die Modellursache und warum die mittlere Geschwindigkeit hier nicht wegen Kompression zwingend steigen muss.
  - Task demand (EN): A fresh data set describes slow compression in a piston at controlled constant temperature and particle count: V halves and p rises. Explain the model cause and why average speed need not rise due to compression here.
  - Expected performance (DE): Die lernende Person nennt mehr Wandstöße pro Flächeneinheit und Zeit bei kleinerem Raum, hält T und N fest und behauptet keinen notwendigen Geschwindigkeitsanstieg.
  - Expected performance (EN): The learner cites more wall collisions per area and time in less space, holds T and N fixed and does not claim speed must increase.
  - Understanding focus (DE): Neuer Volumenfall prüft Randbedingungen und Stoßhäufigkeit.
  - Understanding focus (EN): A fresh volume case tests constraints and collision frequency.
## Page 9: Gaschromatografische Trennung erklären und Chromatogramme deuten

- Full learning-goal ID: `5cd8b2a2-2c90-5e29-8061-dd5e3a682f9d`
- Goal fingerprint: `sha256:f5e2effcb70c72befbeb0b8d93d432a9511847a093e1110f19201f5ceff78658`
- Page fingerprint: `sha256:18bc186ed61ae1127309cb54f7af150855cf3e36202647c6bcf2e4e17e1f1042`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann das Prinzip der Gaschromatografie über Trägergas, stationäre Phase und unterschiedliche zwischenmolekulare Wechselwirkungen erklären und Gaschromatogramme durch Retentionszeitvergleiche mit Referenzen unter gleichen Bedingungen zur begrenzten Identifizierung von Gemischbestandteilen auswerten.

### Visualization

/assets/goal-visualizations/chemie/5cd8b2a2-2c90-5e29-8061-dd5e3a682f9d/5cd8b2a2-2c90-5e29-8061-dd5e3a682f9d.png

- original digest: `sha256:83e7fd4dc75b05a65c265a619f6afe70916b6568b2b907e7946c853fcc1ce4d9`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Elemente, Verbindungen und Gemische unterscheiden — `42a84bca-d27e-581f-a43a-eee424f0504d` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfung: Gaschromatografische Trennung erklären und Chromatogramme deuten — `0a8e4de3-40ec-5537-b427-4904719fcb92` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:a159f725e5f375a033239b86184f2a32f84e65a6e53bb46d20d3fcc4acdb864c`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `data`

**Positive understanding expectations**

- `5cd8b2a2-whole-1`
  - Essential understanding (DE): GC trennt durch mobile Gasphase und unterschiedliche Wechselwirkungen/Verteilung an der stationären Phase.
  - Essential understanding (EN): GC separates using a mobile gas phase and different interactions/partition at the stationary phase.
  - Observable performance (DE): Erkläre Trägergas, stationäre Phase und methodenabhängige Retention fachsprachlich am vollständigen GC-Material. Keine tatsächliche Geräteausführung wird verlangt oder behauptet.
  - Observable performance (EN): Explain carrier gas, stationary phase and method-dependent retention scientifically using the complete GC material. Actual instrument execution is neither required nor asserted.
- `5cd8b2a2-whole-2`
  - Essential understanding (DE): Passende Referenzzeiten erlauben begrenzte Identifizierung, keine eindeutige Struktur oder unkalibrierte Menge.
  - Essential understanding (EN): Matched reference times permit bounded identification, not unique structure or uncalibrated amounts.
  - Observable performance (DE): Ordne die gegebenen gleichen Methodenbedingungen zu. Löse einen frischen Trägergas- oder Ko-Elutionswechsel mit geeigneten neuen Belegen; tR ist keinRf. Beide Aspekte können in einer vollständigen Aufgabe unabhängig sichtbar sein, keine Aufgabenquote.
  - Observable performance (EN): Assign under the supplied matched method conditions. Solve a fresh carrier-gas or co-elution change using suitable new evidence;tR is notRf. Both aspects may be independently shown within one complete task, no task quota.

**Coverage expectations**

- required expectations: `5cd8b2a2-whole-1`, `5cd8b2a2-whole-2`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `changed-condition`: Frische Methodenbedingung oder Beleglage selbstständig beurteilen. / Independently assess a fresh method condition or evidence situation.

**Application cases**

- `chromatography-gc-bounded-source-contribution`
  - Task demand (DE): Erkläre das GC-Trennprinzip über Wechselwirkungen und ordne das Referenzchromatogramm begrenzt zu. Unterscheide Retentionszeit von Rf. Grenze die theoretische GC-Deutung ausdrücklich von einer tatsächlichen GC-Geräteausführung und von einer planaren Rf-Trennung ab. Keine der beiden praktischen Ausführungen wird durch diese Karte belegt oder für das neue GC-Ziel verlangt. Material: Begrenzte Ergänzung für die beibehaltenen GC-Quellenanteile, keine selbst ausgeführte GC: Trägergas transportiert ein geeignetes flüchtiges Gemisch durch eine Säule. Unterschiedliche Wechselwirkungen mit der stationären Phase erzeugen unterschiedliche Retentionszeiten. Synthetische Referenz unter gleichen Bedingungen: A 3,0 min, B 5,5 min, U 3,0/5,5 min. Es gibt keine DC-Laufmittelfront und keine Peakflächenkalibrierung zur Mengenbestimmung. Geräteausführung ist nicht beobachtet.
  - Task demand (EN): Explain GC separation through interactions and bound the reference chromatogram assignment. Distinguish retention time from Rf. Explicitly distinguish theoretical GC interpretation from actual GC instrument execution and from a planar Rf separation. Neither practical execution is demonstrated by this card or required by the new GC goal. Material: Bounded addition for retained GC source contributions, not personally performed GC: Carrier gas transports a suitable volatile mixture through a column. Different stationary-phase interactions produce different retention times. Synthetic matched reference: A 3.0 min, B 5.5 min, U 3.0/5.5 min. There is no TLC solvent front and no peak-area calibration for amounts. Instrument execution is unobserved.
  - Expected performance (DE): U ist unter diesen Bedingungen mit A/B vereinbar; Ko-Retention allein beweist keine eindeutige Identität. Retentionszeit ist kein dimensionsloser Rf-Wegquotient. Das Datenblatt belegt weder Probenaufgabe noch Säulenwahl, Gerätebedienung oder eine tatsächlich ausgeführte planare Trennung. So bleiben GC-Erklärungs- und Identifikationsanteile erhalten, ohne Ausführung einer anderen Methode vorzutäuschen. Frischer Transfer: Nein. Retentionszeiten hängen auch von Methodenbedingungen ab. Referenzen im neuen System und zusätzliche Identitätsbelege werden benötigt; alte Zeiten allein beweisen weder Identität noch Ausschluss.
  - Expected performance (EN): U is compatible with A/B under these conditions; co-retention alone proves no unique identity. Retention time is not a dimensionless Rf distance ratio. The sheet demonstrates neither sample injection, column selection, instrument operation nor an actually performed planar separation. GC explanation and identification contributions remain explicit without pretending to execute another method. Fresh transfer: No. Retention times depend on method conditions. New-system references and further identity evidence are needed; old times alone prove neither identity nor exclusion.
  - Understanding focus (DE): Ganzer benannter E0/G0-Entwurf, vollständige Aufgabe/Lösung/Transfer/Rubrik im Materialobjekt chromatography-gc-bounded-source-contribution. Kein beobachteter Lernerfolg.
  - Understanding focus (EN): Whole named E0/G0 design, full task/answer/transfer/rubric in material object chromatography-gc-bounded-source-contribution. No observed learner performance.
- `gc-product-identification-and-coelution`
  - Task demand (DE): Erkläre das Trennprinzip fachsprachlich und deute U als Reaktionsprobe begrenzt. Was ist über Produktbildung, Reinheit und Mengen erlaubt? Material: Eigene fiktive GC-Karte, keine realen Messungen: gleiches Programm, Säule, Temperatur und Trägergas. Referenzen Ethanol1,5min, Ethylacetat3,0min, Ethansäure5,5min. U zeigt1,5 und3,0min. Ein Detektor meldet Signale; keine Flächenkalibrierung ist vorhanden. Die Zeiten sind erfundene Lehrwerte, keine Stoffkonstanten. Eine stationäre Phase wechselwirkt unterschiedlich mit Komponenten eines geeigneten flüchtigen Gemischs; das Trägergas bewegt sie durch die Säule.
  - Task demand (EN): Explain separation using scientific language and bound the interpretation of U as a reaction sample. What can be inferred about product formation, purity and amounts? Material: Own fictional GC card, not real measurements: matched programme, column, temperature and carrier gas. References ethanol1.5min, ethyl acetate3.0min, ethanoic acid5.5min. U has1.5 and3.0min peaks. A detector supplies signals; no area calibration is available. Times are invented teaching values, not substance constants. A stationary phase interacts differently with components of a suitable volatile mixture; carrier gas transports them through the column.
  - Expected performance (DE): Unterschiedliche Verteilung/Wechselwirkungen und Flüchtigkeit unter den Methodenbedingungen bewirken verschiedene Aufenthaltszeiten. U ist mit Ethanol und Ethylacetat vereinbar. Das kann Produktbildung stützen, beweist aber keine eindeutige Identität, vollständige Umsetzung oder Reinheit. Das fehlende Ethansäuresignal beweist ohne Nachweisgrenze keine Abwesenheit. Ohne Kalibrierung sind keine Stoffmengenanteile ableitbar. Frischer Transfer: Nein, Ko-Elution kann mehrere Stoffe verbergen. Eine geeignet veränderte Selektivität mit passenden neuen Standards oder unabhängige strukturelle Analytik kann unterscheiden; nur die alte Peakzeit oder eine größere Peakfläche reicht nicht.
  - Expected performance (EN): Differing partition/interactions and volatility under the method conditions produce different residence times. U is compatible with ethanol and ethyl acetate. This can support product formation but proves neither unique identity, complete conversion nor purity. Absence of an ethanoic-acid signal does not prove absence without a detection limit. Amount fractions cannot be inferred without calibration. Fresh transfer: No, co-elution can hide multiple substances. Appropriately changed selectivity with matched new standards, or independent structural analysis, can distinguish them; the old peak time or larger peak area cannot.
  - Understanding focus (DE): Ganzer benannter E0/G0-Entwurf, vollständige Aufgabe/Lösung/Transfer/Rubrik im Materialobjekt gc-product-identification-and-coelution. Kein beobachteter Lernerfolg.
  - Understanding focus (EN): Whole named E0/G0 design, full task/answer/transfer/rubric in material object gc-product-identification-and-coelution. No observed learner performance.
## Page 10: Autokatalysen untersuchen (LK)

- Full learning-goal ID: `5cdf490f-bfb2-54c2-bbd7-7062cc69a2ef`
- Goal fingerprint: `sha256:918203593c3ef631351ccc773d9a9aafd701375585a69fdf21b51016dc1d07c3`
- Page fingerprint: `sha256:885f1bbaff524c1084ca0dbed4cd40fca3635ce98269b21b4eb24a91e9a1acf9`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann den Verlauf einer autokatalytischen Reaktion wie Oxalsäure mit Permanganat analysieren.

### Visualization

/assets/goal-visualizations/chemie/5cdf490f-bfb2-54c2-bbd7-7062cc69a2ef/5cdf490f-bfb2-54c2-bbd7-7062cc69a2ef.jpg

- original digest: `sha256:17f7360f9759ddb9308cc87daaddacbba45f424c94ac54a4c5de591c27bd0d9e`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Einflussfaktoren diskutieren — `3ce81f96-4fbb-5022-88b7-337a000315ed` (outside this book)

### Direct reverse prerequisites outside this book

- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:a355865c14f3a87307e764f05a45153008e1a5b0f866fc699a68bc0b586bba00`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Ein Reaktionsprodukt kann einen zusätzlichen katalytischen Weg fördern; S-Kurven allein beweisen das nicht.
  - Essential understanding (EN): A product can promote an additional catalytic pathway; an S-curve alone does not prove this.
  - Observable performance (DE): eqrk16-06-a: Verbrauch und Produktbildung unterscheiden und Intervallraten berechnen. eqrk16-06-b: Die Abhängigkeit von Produktzugabe mit Einheiten herleiten.
  - Observable performance (EN): eqrk16-06-a: Distinguish consumption and product formation and calculate interval rates. eqrk16-06-b: Derive the seeding dependence with units.
- `e2`
  - Essential understanding (DE): Permanganatverbrauch und Mn2+-Produktbildung gehören zu einer ladungs-/atomrichtigen Redoxbilanz.
  - Essential understanding (EN): Permanganate consumption and Mn2+ formation obey atom/charge-balanced redox stoichiometry.
  - Observable performance (DE): eqrk16-06-a: Atome und Ladung der Oxalat-Permanganat-Gleichung erhalten. eqrk16-06-b: Produkt und fremden Katalysator sowie unverändertes K unterscheiden.
  - Observable performance (EN): eqrk16-06-a: Balance atoms and charge in the oxalate-permanganate equation. eqrk16-06-b: Distinguish product and external catalyst and explain unchanged K.
- `e3`
  - Essential understanding (DE): Produktzugabe, Temperaturkontrolle und passende Blindproben unterscheiden Autokatalyse von Alternativen.
  - Essential understanding (EN): Product seeding, temperature control and appropriate blanks distinguish autocatalysis from alternatives.
  - Observable performance (DE): eqrk16-06-a: Produktzugabe und Blindprobe als Evidenz statt Kurvenbeweis beurteilen. eqrk16-06-b: Eine neue Bedingung zur Prüfung der unbekannten A-Ordnung entwerfen.
  - Observable performance (EN): eqrk16-06-a: Evaluate seeding and blanks as evidence rather than treating shape as proof. eqrk16-06-b: Design a changed condition testing the unknown order in A.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `eqrk16-06-a-transfer`: Eine weitere S-Kurve entsteht bei gleichzeitigem Temperaturanstieg um 15 K. Eine kontrollierte Mn2+-Zugabe hat keinen Effekt. Erkläre die schwächere Evidenz und die entscheidende neue Kontrolle. / Another S-shaped curve occurs while temperature rises by 15 K, and controlled Mn2+ seeding has no effect. Explain the weaker evidence and the decisive additional control.
- `eqrk16-06-b-transfer`: Ein Produkt hemmt die Reaktion. Skizziere den geänderten qualitativen Verlauf und begründe Produktinhibition statt Autokatalyse. / A product inhibits the reaction. Sketch the changed qualitative course and explain product inhibition rather than autocatalysis.

**Application cases**

- `eqrk16-06-a`
  - Task demand (DE): Vollständiges eigenes Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json #eqrk16-06-a; sha256:86dc6b7640368abf7dbd12b51f4cdf48aba1731f7f543169a30c14261c3ccd2e. Ordne langsame, beschleunigte und abklingende Abschnitte zu und berechne zwei Verbrauchsraten. Formuliere die saure Redoxgleichung mit Oxalat und Permanganat. Begründe die Evidenz durch Produktzugabe und ihre Grenzen.
  - Task demand (EN): Complete own material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json #eqrk16-06-a; sha256:86dc6b7640368abf7dbd12b51f4cdf48aba1731f7f543169a30c14261c3ccd2e. Identify induction, acceleration and depletion sections and calculate two consumption rates. Construct the acidic oxalate/permanganate equation. Explain the evidence from product seeding and its limits.
  - Expected performance (DE): Ohne Zugabe beträgt −ΔA/Δt zunächst 0,002 s−1 (0–20 s), dann 0,019 s−1 (60–80 s) und zuletzt 0,002 s−1 (100–120 s). Produktbildung beschleunigt sich zunächst und verlangsamt sich bei Verarmung der Ausgangsstoffe; die Absorbanz selbst fällt. Die Bilanz lautet: 2 MnO4− + 5 C2O4²− + 16 H+ → 2 Mn2+ + 10 CO2 + 8 H2O. Entstehendes Mn2+ kann einen katalytischen Weg fördern; vorgelegtes Mn2+ verkürzt die Induktionsphase. Thermostatisierung und Matrixblindprobe schwächen Wärme- und Salzeffekte als Alternativen. Die Daten stützen diese Erklärung, beweisen aber keinen eindeutigen elementaren Manganmechanismus. Endwerte im Rauschen nicht überinterpretieren.
  - Expected performance (EN): Unseeded −ΔA/Δt is initially 0.002 s−1 (0–20 s), then 0.019 s−1 (60–80 s), and finally 0.002 s−1 (100–120 s). Product formation first accelerates and then slows as reactants are depleted; absorbance itself falls. The balance is 2 MnO4− + 5 C2O4²− + 16 H+ → 2 Mn2+ + 10 CO2 + 8 H2O. Product Mn2+ can promote a catalytic route, and seeding shortens induction. Thermostat and matrix controls weaken heating and salt effects as alternatives. This supports the explanation without proving a unique elementary manganese mechanism. Do not overinterpret endpoints near noise.
  - Understanding focus (DE): Eine weitere S-Kurve entsteht bei gleichzeitigem Temperaturanstieg um 15 K. Eine kontrollierte Mn2+-Zugabe hat keinen Effekt. Erkläre die schwächere Evidenz und die entscheidende neue Kontrolle.
  - Understanding focus (EN): Another S-shaped curve occurs while temperature rises by 15 K, and controlled Mn2+ seeding has no effect. Explain the weaker evidence and the decisive additional control.
- `eqrk16-06-b`
  - Task demand (DE): Vollständiges eigenes Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json #eqrk16-06-b; sha256:86dc6b7640368abf7dbd12b51f4cdf48aba1731f7f543169a30c14261c3ccd2e. Leite einen zu X passenden Anfangsratenansatz her und deute Grund- und Produktanteil. Erkläre den Unterschied zu Y und das unveränderte K. Entwirf einen Test außerhalb der gegebenen Startreihe.
  - Task demand (EN): Complete own material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json #eqrk16-06-b; sha256:86dc6b7640368abf7dbd12b51f4cdf48aba1731f7f543169a30c14261c3ccd2e. Derive an initial-rate expression compatible with X and interpret basal and product-dependent terms. Contrast Y and explain unchanged K. Propose a test beyond the supplied initial series.
  - Expected performance (DE): Bei festem [A]0 passt v0 = 0,001 + 0,20 [B]0, jeweils mit passenden Einheiten für mol/(L s). Ein möglicher umfassender Ansatz ist v = (0,010 s−1 + 2,0 L mol−1 s−1 [B]) [A]. Die feste A-Konzentration beweist die Ordnung in A nicht; eine A-Variation prüft sie. In X fördert Produkt B den Weg, was zur Autokatalysehypothese passt. C ist in Y kein Produkt; gewöhnliche Katalyse reicht als Erklärung. Alternative Wege ändern Raten, nicht ΔrG° oder das thermodynamische K. Spätes Abklingen kann aus A-Verarmung folgen. Elementarschritte und allgemeine Gültigkeit bleiben unbestimmt.
  - Expected performance (EN): At fixed [A]0, v0 = 0.001 + 0.20 [B]0 fits, with units consistent with mol/(L s). A possible broader expression is v = (0.010 s−1 + 2.0 L mol−1 s−1 [B]) [A]. Fixed-A data do not establish the order in A; vary A to test it. Product B promotes the route in X, supporting autocatalysis. C in Y is not a product, so ordinary catalysis suffices. Alternative pathways change rates, not ΔrG° or thermodynamic K. Late slowing may reflect A depletion. Elementary steps and general validity remain undetermined.
  - Understanding focus (DE): Ein Produkt hemmt die Reaktion. Skizziere den geänderten qualitativen Verlauf und begründe Produktinhibition statt Autokatalyse.
  - Understanding focus (EN): A product inhibits the reaction. Sketch the changed qualitative course and explain product inhibition rather than autocatalysis.
## Page 11: Farbstoffe im Alltag und Gesundheit bewerten

- Full learning-goal ID: `61da9d34-cb35-5c2c-ac8e-83f48b6a4fd3`
- Goal fingerprint: `sha256:54ff9f8c55e0963dfa009f97f310bd88b175587a641bd5ecc2a78f1a493bfb0d`
- Page fingerprint: `sha256:e8ccf1f22c5f1ad8e82b545dc3a64db9b89629eb0a34749f3fe8b60763826b1a`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann den Einsatz ausgewählter Farbstoffe im Alltag recherchieren und bewerten sowie Auswirkungen ihrer Verwendung auf die menschliche Gesundheit vergleichen und beurteilen.

### Visualization

/assets/goal-visualizations/chemie/61da9d34-cb35-5c2c-ac8e-83f48b6a4fd3/61da9d34-cb35-5c2c-ac8e-83f48b6a4fd3.jpg

- original digest: `sha256:2b90160915e71345bee0855f2dad040608be480301e0113f862e104f834e94fd`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Emission und Absorption zur Farbigkeit unterscheiden — `54bc6ca0-b770-5f10-ac54-bcc1d04298f5` (outside this book)

### Direct reverse prerequisites outside this book

- Übung: Farbstoffe im Alltag und Gesundheit bewerten — `522fa82a-1703-581c-a704-617a00cf6ea6` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:8dfcfbd6bbcd14b8c0e072741311b8027e31e7945f46c8b855daba4d118f67cc`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Recherche muss Quelle, Stoffidentität, Nutzung und Gesundheitsbehauptung nachvollziehbar verbinden.
  - Essential understanding (EN): Research must traceably connect source, chemical identity, use and health claim.
  - Observable performance (DE): Entnimmt Primärinformationen und belegt Fundstelle statt Werbeaussagen zu übernehmen.
  - Observable performance (EN): Extracts primary information with a locator rather than adopting advertising.
- `e2`
  - Essential understanding (DE): Gesundheitsbewertung unterscheidet Gefährdung von Exposition und vergleicht gleichartige Anwendungen.
  - Essential understanding (EN): Health judgment distinguishes hazard from exposure and compares like applications.
  - Observable performance (DE): Gewichtet Nutzen, Exposition und Evidenzgrenzen.
  - Observable performance (EN): Weighs benefit, exposure and evidence limits.

**Coverage expectations**

- required expectations: `e1`, `e2`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Lebensmittelfarbe versus Textilfarbstoff / Food color versus textile dye
- `v2`: Primärquelle versus allgemeine Werbeaussage / Primary source versus a general advertisement

**Application cases**

- `61da9d34-case-1`
  - Task demand (DE): Für eine Recherche liegt die Primärseite EFSA „Food colours“ (https://www.efsa.europa.eu/en/topics/topic/food-colours; geprüft 13.10.2026) bereit: Funktionen sind Farberhalt/-verstärkung, Sicherheitsbewertung ist stoffbezogen. Erfundenes Angebot: Lebensmittel-Farbe F mit exakter Identität und dokumentierter Bewertung; technischer Textilfarbstoff T ohne Lebensmitteldossier. Keine konkreten Zulassungs- oder Dosierungswerte werden geliefert.
1. Recherchiere auf der angegebenen Primärseite je einen Nutzen und eine Aussage zur Sicherheitsprüfung; dokumentiere URL, Abschnitt und Abrufdatum und unterscheide Befund von der Werbeaussage „jede natürliche Farbe ist gesund“.
2. Vergleiche F und T für die gleiche Getränkenutzung nach Stoffidentität, Expositionsweg und verfügbarer Gesundheitsprüfung; formuliere ein bedingtes Urteil und eine fehlende Information.
  - Task demand (EN): For research the primary EFSA “Food colours” page is available (https://www.efsa.europa.eu/en/topics/topic/food-colours; checked 13 October 2026): functions include maintaining/enhancing color and safety assessment is substance-specific. Invented offer: food color F with exact identity and documented assessment; technical textile dye T without a food dossier. No specific authorization or dosage values are supplied.
1. Research one benefit and one safety-assessment statement on the specified primary page; record URL, section and access date and distinguish evidence from the advertisement “every natural color is healthy”.
2. Compare F and T for the same beverage use by identity, exposure route and available health assessment; give a conditional judgment and one missing fact.
  - Expected performance (DE): 1. Nachprüfbarer Recherchebeleg: EFSA-URL, Abschnitt Einleitung/Sicherheitsbewertung und tatsächliches Abrufdatum; Farberhalt oder Farbverstärkung als Nutzen, stoffbezogene Bewertung als Sicherheitsbefund. Die Seite trägt keine pauschale Gesundheitsgarantie allein aufgrund natürlicher Herkunft. Bei nicht erfolgtem Abruf bleiben Recherchepunkte offen.
2. Bei Getränken ist orale Aufnahme der gemeinsame Vergleichsweg. F hat ein zur Verwendung passendes Dossier; T besitzt hier keines und ist daher keine belegte Lebensmittelalternative. Eine endgültige Entscheidung benötigt genaue Identität, Verwendungsbedingungen und Exposition/Dosierung; weder F noch T wird aus dem Modell als pauschal sicher oder toxisch erklärt.
  - Expected performance (EN): 1. Verifiable research evidence names the EFSA URL, introduction/safety-assessment section and actual access date; color maintenance or enhancement is a benefit and substance-specific assessment is the safety finding. The page does not support a blanket health guarantee based on natural origin. Without an actual lookup, research credit remains unavailable.
2. In beverages oral intake is the common comparison route. F has a dossier matching its use; T has none here and is not an evidenced food alternative. A final decision needs exact identity, use conditions and exposure/dose; the model labels neither substance universally safe or toxic.
  - Understanding focus (DE): Nachprüfbarer Recherchebeleg: EFSA-URL, Abschnitt Einleitung/Sicherheitsbewertung und tatsächliches Abrufdatum; Farberhalt oder Farbverstärkung als Nutzen, stoffbezogene Bewertung als Sicherheitsbefund. Die Seite trägt keine pauschale Gesundheitsgarantie allein aufgrund natürlicher Herkunft. Bei nicht erfolgtem Abruf bleiben Recherchepunkte offen. / Bei Getränken ist orale Aufnahme der gemeinsame Vergleichsweg. F hat ein zur Verwendung passendes Dossier; T besitzt hier keines und ist daher keine belegte Lebensmittelalternative. Eine endgültige Entscheidung benötigt genaue Identität, Verwendungsbedingungen und Exposition/Dosierung; weder F noch T wird aus dem Modell als pauschal sicher oder toxisch erklärt.
  - Understanding focus (EN): Verifiable research evidence names the EFSA URL, introduction/safety-assessment section and actual access date; color maintenance or enhancement is a benefit and substance-specific assessment is the safety finding. The page does not support a blanket health guarantee based on natural origin. Without an actual lookup, research credit remains unavailable. / In beverages oral intake is the common comparison route. F has a dossier matching its use; T has none here and is not an evidenced food alternative. A final decision needs exact identity, use conditions and exposure/dose; the model labels neither substance universally safe or toxic.
- `61da9d34-case-2`
  - Task demand (DE): Recherchequellen: EFSA „Food additives“ (https://www.efsa.europa.eu/en/topics/topic/food-additives) erläutert unterschiedliche Herkunft; die Primärseite „Food colours“ beschreibt stoffbezogene Prüfung. Erfundenes Textilangebot N nennt nur „pflanzlich“ ohne genaue Stoffidentität; S nennt eine genaue synthetische Identität, aber das Dossier betrifft orale Aufnahme, nicht Hautkontakt. Beide haben gleiche angenommene Farbechtheit.
1. Recherchiere je einen Primärbefund zu Herkunft und stoffbezogener Prüfung und dokumentiere URL, Abschnitt, Abrufdatum; erkläre die Grenze der Übertragung von Lebensmitteldaten auf Textilien.
2. Vergleiche die Gesundheitsbelege von N und S für Hautkontakt und entscheide begründet, ob das Material eine Rangfolge „natürlich ist gesünder“ trägt; fordere eine konkret fehlende Information je Angebot.
  - Task demand (EN): Research sources: EFSA “Food additives” (https://www.efsa.europa.eu/en/topics/topic/food-additives) discusses different origins; “Food colours” describes substance-specific assessment. Invented textile offer N says only “plant-based” without exact identity; S names an exact synthetic identity but its dossier addresses oral intake rather than skin contact. Both have equal assumed color fastness.
1. Research one primary finding each on origin and substance-specific assessment and record URL, section and access date; explain the limit of transferring food evidence to textiles.
2. Compare N and S health evidence for skin contact and assess whether the material supports “natural is healthier”; request one specific missing fact for each offer.
  - Expected performance (DE): 1. Ein tatsächlicher Recherchebeleg benennt beide EFSA-URLs, passende Abschnitte und Abrufdatum. Herkunft kann verschieden sein; Prüfung betrifft konkrete Stoffe und Expositionsbedingungen. Lebensmitteldaten beantworten nicht automatisch Hautkontakt oder Freisetzung aus einer Faser. Ohne Abruf kein Nachweis des Rechercheoperators.
2. Die Daten tragen keine Gesundheitsrangfolge nach Herkunft. N benötigt Stoffidentität/Verunreinigungsprofil, S benötigt hautkontaktbezogene Bewertung oder Freisetzungsdaten. Gleiche angenommene Farbechtheit ersetzt keine toxikologische Evidenz; beide Angebote bleiben bis zu passenden Daten offen.
  - Expected performance (EN): 1. Actual research evidence names both EFSA URLs, relevant sections and access date. Origins vary; assessment concerns particular substances and exposures. Food data do not automatically answer skin contact or release from a fiber. Without a lookup the research operator is not demonstrated.
2. The data do not support a health ranking by origin. N needs identity/impurity information; S needs a skin-contact assessment or release data. Equal assumed fastness does not replace toxicological evidence; both remain unresolved pending matching data.
  - Understanding focus (DE): Ein tatsächlicher Recherchebeleg benennt beide EFSA-URLs, passende Abschnitte und Abrufdatum. Herkunft kann verschieden sein; Prüfung betrifft konkrete Stoffe und Expositionsbedingungen. Lebensmitteldaten beantworten nicht automatisch Hautkontakt oder Freisetzung aus einer Faser. Ohne Abruf kein Nachweis des Rechercheoperators. / Die Daten tragen keine Gesundheitsrangfolge nach Herkunft. N benötigt Stoffidentität/Verunreinigungsprofil, S benötigt hautkontaktbezogene Bewertung oder Freisetzungsdaten. Gleiche angenommene Farbechtheit ersetzt keine toxikologische Evidenz; beide Angebote bleiben bis zu passenden Daten offen.
  - Understanding focus (EN): Actual research evidence names both EFSA URLs, relevant sections and access date. Origins vary; assessment concerns particular substances and exposures. Food data do not automatically answer skin contact or release from a fiber. Without a lookup the research operator is not demonstrated. / The data do not support a health ranking by origin. N needs identity/impurity information; S needs a skin-contact assessment or release data. Equal assumed fastness does not replace toxicological evidence; both remain unresolved pending matching data.
## Page 12: Küpenfärbung erklären und durchführen

- Full learning-goal ID: `63e0d92b-d86a-53c2-aa0a-bc985fc85174`
- Goal fingerprint: `sha256:7b6861fe873b14332ded154963efd347e39e11569b4dfd128d4ab3b430ca6a04`
- Page fingerprint: `sha256:caee24ef3f52e3587a45e0ed17fd42072daf36d0cc88845f092062f63a5ec801`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann das Prinzip der Küpenfärbung erklären, eine Küpenfärbung durchführen und diese gegebenenfalls mit einer weiteren Färbemethode vergleichen.

### Visualization

/assets/goal-visualizations/chemie/63e0d92b-d86a-53c2-aa0a-bc985fc85174/63e0d92b-d86a-53c2-aa0a-bc985fc85174.jpg

- original digest: `sha256:0ee0eb227353069cf857dcb5a7388f95471bf7114410da58c4fc55988e8818ff`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)
- Oxidationszahlen bestimmen und bilanzieren — `4961130b-1ee8-58f2-a319-dff0a864db6a` (outside this book)

### Direct reverse prerequisites outside this book

- Übung: Küpenfärbung und Direktfarbstoff — `60d99973-5e2e-506d-8dd9-ef710daad2ab` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:f398411b328e60374de0daad04f753c5aa6cb7731622f49910f7a25eebbeeb9c`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Küpenfärbung macht einen schwer löslichen oxidierten Farbstoff durch Reduktion löslich und oxidiert ihn nach Faseraufnahme wieder.
  - Essential understanding (EN): Vat dyeing reduces an insoluble oxidized dye to a soluble form and reoxidizes it after fiber uptake.
  - Observable performance (DE): Erklärt Reihenfolge, Redoxwechsel und Löslichkeit ohne Stoffumwandlung zu verwechseln.
  - Observable performance (EN): Explains sequence, redox change and solubility without conflating them.
- `e2`
  - Essential understanding (DE): Kontrollen und Sauerstoffkontakt prüfen das Funktionsmodell.
  - Essential understanding (EN): Controls and oxygen exposure test the operating model.
  - Observable performance (DE): Begründet einen Vergleich und trennt Beobachtung von Interpretation.
  - Observable performance (EN): Justifies a comparison and separates observation from interpretation.
- `e3`
  - Essential understanding (DE): Durchführung erfordert tatsächlich beobachtete sichere Handlungen und ein eigenes Rohprotokoll.
  - Essential understanding (EN): Execution requires actually observed safe actions and an original raw log.
  - Observable performance (DE): Führt den freigegebenen Mikroversuch unter Aufsicht aus und dokumentiert reale Beobachtungen.
  - Observable performance (EN): Carries out the approved microscale experiment under supervision and records real observations.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Reduktion fehlt versus vollständige Küpe / No reduction versus a complete vat
- `v2`: Luftkontakt und Färbemethodenvergleich / Air exposure and dyeing-method comparison

**Application cases**

- `63e0d92b-case-1`
  - Task demand (DE): Entwurf für einen späteren beaufsichtigten Mikroversuch, noch nicht ausgeführt. Lehrkraft stellt nach freigegebener Schul-SOP eine frisch reduzierte alkalische Indigoküpe, ein gleich konzentriertes nichtreduziertes Indigobad und zwei gleiche Baumwollstücke bereit. Keine Herstellung durch Lernende; Schutzbrille, Handschuhe, Pinzette und Abfallsammlung nach SOP. Sollfolge: 30 s eintauchen, entnehmen, 2 min Luftkontakt, nach SOP spülen. Protokollfelder bleiben leer: Badfarbe, Faserfarbe direkt/nach Luft, Spülwasserfarbe, Abweichung.
1. Erkläre die Reduktion zur löslichen Leukoform, Faseraufnahme und Luftoxidation zurück zum schwer löslichen Indigo; schreibe die basische Halbreaktion I+2e⁻⇌L²⁻ mit den Rollen der Formen.
2. Begründe die nichtreduzierte Kontrolle und benenne zwei konstant zu haltende Bedingungen sowie eine Auswertungsgrenze.
3. Führe beide Färbungen unter Aufsicht mit der vorgegebenen SOP aus; lasse Eintauchen, Entnehmen, Luftkontakt und Spülen direkt beobachten und dokumentiere alle fünf Rohprotokollfelder für beide Stücke.
  - Task demand (EN): Design for a future supervised microscale experiment, not yet performed. The teacher supplies a freshly reduced alkaline indigo vat, an equally concentrated unreduced indigo bath and two identical cotton swatches under an approved school SOP. Learners do not prepare reagents; goggles, gloves, forceps and waste collection follow the SOP. Planned sequence: dip for 30 s, remove, expose to air for 2 min, rinse under SOP. Log fields are blank: bath color, fiber color immediately/after air, rinse-water color and deviations.
1. Explain reduction to soluble leuco form, fiber uptake and air oxidation back to poorly soluble indigo; write the basic half-reaction I+2e⁻⇌L²⁻ and identify the forms.
2. Justify the unreduced control and name two conditions to keep constant and one inference limit.
3. Carry out both dyeings under supervision using the supplied SOP; have dipping, removal, air exposure and rinsing directly observed and record all five raw-log fields for both swatches.
  - Expected performance (DE): 1. I ist neutrales oxidiertes Indigo; in stark alkalischer Küpe wird es zu L²⁻ reduziert, der besser wasserlöslichen dianionischen Leukoform. I+2e⁻⇌L²⁻ ist ladungsbilanziert. Nach Aufnahme in die Faser gibt L²⁻ bei Oxidation Elektronen ab; schwer lösliches I bleibt in der Faser. Die gelbliche/grünliche Küpenfarbe und spätere Blaufärbung sind Erwartungen, keine hier beobachteten Ergebnisse.
2. Die Kontrolle prüft den Beitrag der Reduktion zur Aufnahme. Beispielsweise Stückgröße und Tauchzeit müssen gleich sein. Unterschiede in Benetzung oder Küpenalter können die Interpretation begrenzen; dies ist kein quantitativer Vergleich der aufgenommenen Stoffmenge.
3. 2 Punkte nur bei tatsächlich beobachteter vollständiger SOP-Handlung beider Stücke und eigenem vollständigem Rohlog; 1 für eine beobachtete Teilfolge mit zugehörigen Rohdaten; 0 ohne reale Beobachtung. Erwartungsfarben oder abgeschriebene Musterlogs sind kein Ausführungsnachweis. Der Autorversuch ist nicht durchgeführt.
  - Expected performance (EN): 1. I is neutral oxidized indigo; a strongly alkaline vat reduces it to L²⁻, the more water-soluble dianionic leuco form. I+2e⁻⇌L²⁻ balances charge. After fiber uptake L²⁻ loses electrons upon oxidation; poorly soluble I remains in the fiber. Yellowish/greenish vat color and later blue are predictions, not observed results here.
2. The control tests the role of reduction in uptake. For example, swatch size and dipping time must be equal. Wetting differences or vat age can limit interpretation; this is not a quantitative measurement of dye uptake.
3. 2 points require actually observed complete SOP actions for both swatches and a complete original raw log; 1 for an observed partial sequence with its raw data; 0 without real observation. Predicted colors or copied model logs are not execution evidence. The author experiment has not occurred.
  - Understanding focus (DE): I ist neutrales oxidiertes Indigo; in stark alkalischer Küpe wird es zu L²⁻ reduziert, der besser wasserlöslichen dianionischen Leukoform. I+2e⁻⇌L²⁻ ist ladungsbilanziert. Nach Aufnahme in die Faser gibt L²⁻ bei Oxidation Elektronen ab; schwer lösliches I bleibt in der Faser.  / Die Kontrolle prüft den Beitrag der Reduktion zur Aufnahme. Beispielsweise Stückgröße und Tauchzeit müssen gleich sein. Unterschiede in Benetzung oder Küpenalter können die Interpretation begrenzen; dies ist kein quantitativer Vergleich der aufgenommenen Stoffmenge. / 2 Punkte nur bei tatsächlich beobachteter vollständiger SOP-Handlung beider Stücke und eigenem vollständigem Rohlog; 1 für eine beobachtete Teilfolge mit zugehörigen Rohdaten; 0 ohne reale Beobachtung. Erwartungsfarben oder abgeschriebene Musterlogs sind kein Ausführungsnachweis. Der Autorversuch ist nicht durchgeführt.
  - Understanding focus (EN): I is neutral oxidized indigo; a strongly alkaline vat reduces it to L²⁻, the more water-soluble dianionic leuco form. I+2e⁻⇌L²⁻ balances charge. After fiber uptake L²⁻ loses electrons upon oxidation; poorly soluble I remains in the fiber.  / The control tests the role of reduction in uptake. For example, swatch size and dipping time must be equal. Wetting differences or vat age can limit interpretation; this is not a quantitative measurement of dye uptake. / 2 points require actually observed complete SOP actions for both swatches and a complete original raw log; 1 for an observed partial sequence with its raw data; 0 without real observation. Predicted colors or copied model logs are not execution evidence. The author experiment has not occurred.
- `63e0d92b-case-2`
  - Task demand (DE): Späterer Schulversuch unter freigegebener Mikro-SOP: Lehrkraft liefert reduzierte Indigoküpe und einen für Baumwolle geeigneten wässrigen Direktfarbstoff. Drei gleiche Stücke: A Indigo mit sofort 2 min Luftkontakt; B Indigo mit erster Beobachtung in der Küpe, dann 2 min Luftkontakt; C Direktfarbstoff gemäß Lehrer-SOP. Gleiche Endspülung. Lernende ändern weder Reagenzien noch Schutz-/Abfallregeln. Leere Felder für Aufnahmezustand, Farbverlauf, Spülwasser und Abweichung; keine synthetischen Messwerte.
1. Erkläre den erwarteten Farbverlauf bei A und B über Elektronenabgabe an Luftsauerstoff und den Wechsel der Löslichkeit; unterscheide erwartete von tatsächlich gemessenen Farben.
2. Vergleiche Küpen- und Direktfärbung hinsichtlich löslicher Aufnahmeform und Fixierungsprinzip; begründe eine passende Kontrolle und eine Grenze der subjektiven Farbstärke.
3. Führe die drei freigegebenen Abläufe unter direkter Lehrerbeobachtung aus und protokolliere Aufnahmezustand, Farbverlauf, Spülwasser und Abweichung für jedes Stück; kennzeichne nicht ausgeführte Schritte ausdrücklich.
  - Task demand (EN): Future school experiment under an approved microscale SOP: teacher supplies reduced indigo vat and an aqueous direct dye suitable for cotton. Three equal swatches: A indigo with immediate 2 min air exposure; B indigo first observed in the vat, then 2 min air exposure; C direct dye under teacher SOP. Same final rinse. Learners do not change reagents or protection/waste rules. Blank fields record uptake state, color sequence, rinse water and deviations; no synthetic measurements.
1. Explain the predicted color sequence in A and B through electron transfer to air oxygen and the solubility change; distinguish predictions from actually observed colors.
2. Compare vat and direct dyeing in soluble uptake form and fixation principle; justify a suitable control and one limit of subjective color intensity.
3. Perform the three approved sequences under direct teacher observation and log uptake state, color sequence, rinse water and deviations for each swatch; explicitly mark any unperformed steps.
  - Expected performance (DE): 1. In der Küpe liegt die reduzierte lösliche Leukoform vor; nach Luftkontakt wird sie oxidiert und bildet schwer lösliches blaues Indigo. B macht den zeitlichen Wechsel nach der Erstbeobachtung zugänglich; A erhält sofort Luft. Das sind Modellvorhersagen, bis echte Rohbeobachtungen vorliegen.
2. Beide Methoden nehmen Farbstoff aus dem Bad auf. Die Küpe wechselt die Redox-/Löslichkeitsform und lagert schwer lösliches Indigo ein; der Direktfarbstoff bindet ohne diesen Redoxwechsel über geeignete intermolekulare Affinität. Ein ungefärbtes gleich behandeltes Stück kontrolliert Fasergrundfarbe. Subjektive Dunkelheit allein ist keine Konzentrationsmessung.
3. Ausführungskriterium: direkte Beobachtung der tatsächlich freigegebenen Handlungen und vollständiger eigener Vier-Felder-Rohlog für A/B/C; Teilfolge erlaubt 1 Punkt, vollständig 2. Keine Punkte für nie ausgeführte Handlungen, erwartete Farben oder Musterprotokolle.
  - Expected performance (EN): 1. The vat contains reduced soluble leuco form; air exposure oxidizes it to poorly soluble blue indigo. B makes the temporal change accessible after the initial observation; A receives air immediately. These remain model predictions until actual raw observations exist.
2. Both take up dye from a bath. The vat changes redox/solubility form and deposits poorly soluble indigo; the direct dye binds through suitable intermolecular affinity without that redox change. An undyed equally treated swatch controls background color. Subjective darkness alone does not measure concentration.
3. Execution criterion: direct observation of the approved actions actually performed and a complete original four-field log for A/B/C; a partial sequence earns 1 point, completion 2. Unperformed actions, predicted colors or model logs earn no execution credit.
  - Understanding focus (DE): In der Küpe liegt die reduzierte lösliche Leukoform vor; nach Luftkontakt wird sie oxidiert und bildet schwer lösliches blaues Indigo. B macht den zeitlichen Wechsel nach der Erstbeobachtung zugänglich; A erhält sofort Luft. Das sind Modellvorhersagen, bis echte Rohbeobachtungen vorliegen. / Beide Methoden nehmen Farbstoff aus dem Bad auf. Die Küpe wechselt die Redox-/Löslichkeitsform und lagert schwer lösliches Indigo ein; der Direktfarbstoff bindet ohne diesen Redoxwechsel über geeignete intermolekulare Affinität. Ein ungefärbtes gleich behandeltes Stück kontrolliert Fasergrundfarbe. Subjektive Dunkelheit allein ist keine Konzentrationsmessung. / Ausführungskriterium: direkte Beobachtung der tatsächlich freigegebenen Handlungen und vollständiger eigener Vier-Felder-Rohlog für A/B/C; Teilfolge erlaubt 1 Punkt, vollständig 2. Keine Punkte für nie ausgeführte Handlungen, erwartete Farben oder Musterprotokolle.
  - Understanding focus (EN): The vat contains reduced soluble leuco form; air exposure oxidizes it to poorly soluble blue indigo. B makes the temporal change accessible after the initial observation; A receives air immediately. These remain model predictions until actual raw observations exist. / Both take up dye from a bath. The vat changes redox/solubility form and deposits poorly soluble indigo; the direct dye binds through suitable intermolecular affinity without that redox change. An undyed equally treated swatch controls background color. Subjective darkness alone does not measure concentration. / Execution criterion: direct observation of the approved actions actually performed and a complete original four-field log for A/B/C; a partial sequence earns 1 point, completion 2. Unperformed actions, predicted colors or model logs earn no execution credit.
## Page 13: Nanoskalige Silikonoberflächen materialgestützt beurteilen

- Full learning-goal ID: `6413429b-53d8-5ad1-9af6-d0e562cbf0f5`
- Goal fingerprint: `sha256:48fc2d416ba8556f96420896abc0720d7642a85305f1bd6cc613e12e75efe8cc`
- Page fingerprint: `sha256:3d65e62169affdb3c5fcf7248eb2d7008c1b208d2860d5d80b23b22d57e8c816`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann die Bedeutung von Silikonen für nanoskalige Oberflächenanwendungen anhand von Materialdaten erläutern und Benetzungsbehauptungen beurteilen, indem sie Schichtdicke von Partikelgröße unterscheidet sowie Silikonchemie und Oberflächenstruktur berücksichtigt.

### Visualization

/assets/goal-visualizations/chemie/6413429b-53d8-5ad1-9af6-d0e562cbf0f5/6413429b-53d8-5ad1-9af6-d0e562cbf0f5.png

- original digest: `sha256:241fd5bbbf3a80a1dea330e59fe4e3bf313018af91e4322b478cd0c623b31643`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)

### Direct reverse prerequisites outside this book

- Silikonoberflächen anhand von Benetzungsdaten beurteilen — `990b6704-879b-522c-a82c-99ce55944cf1` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:87defac088268c47ee7a71e4befc950460b6a897da4f510db899c478f53c678b`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `modeling`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Silikone können in nanoskaligen Oberflächenanwendungen relevant sein; Schichtdicke und Partikelgröße sind unterschiedliche Größen.
  - Essential understanding (EN): Silicones can be relevant in nanoscale surface applications; film thickness and particle size are different dimensions.
  - Observable performance (DE): Erläutert eine materialgestützte Nano-Anwendung und trennt Dicke von separat belegter oder unbelegter Partikelgröße.
  - Observable performance (EN): Explains a material-based nano application and separates thickness from independently evidenced or unsupported particle size.
- `e2`
  - Essential understanding (DE): Benetzung hängt von Silikonchemie und Oberflächenstruktur ab; eine gleiche Dicke allein erklärt keine gleiche Benetzung.
  - Essential understanding (EN): Wetting depends on silicone chemistry and surface structure; equal thickness alone does not account for equal wetting.
  - Observable performance (DE): Nutzt die Gleichchemie-Strukturvariation und Gleichdicken-Chemiekontrolle; trennt Kontaktwinkel von Abrollwinkel.
  - Observable performance (EN): Uses same-chemistry structural variation and equal-thickness chemistry control; distinguishes contact angle from roll-off angle.
- `e3`
  - Essential understanding (DE): Daten zu Tropfenbewegung stützen begrenzte Funktionsaussagen, beweisen aber keine Schmutzentfernung oder dauerhafte Selbstreinigung.
  - Essential understanding (EN): Droplet-motion data support bounded functional claims but establish neither dirt removal nor durable self-cleaning.
  - Observable performance (DE): Beurteilt bei geänderter Struktur eine Anwendungsbehauptung und nennt den fehlenden passenden Funktions-/Belastungsnachweis.
  - Observable performance (EN): Assesses an application claim after changed structure and identifies missing relevant functional/loading evidence.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Schichtdicke gegenüber unabhängiger Partikelmessung / Film thickness versus independent particle measurement
- `v2`: Gleiche Chemie, andere Oberflächenstruktur / Same chemistry, different surface structure
- `v3`: Kontaktwinkel, Abrollen und tatsächlicher Funktionsnachweis / Contact angle, roll-off and actual function evidence

**Application cases**

- `e560-nanosurface-case-1`
  - Task demand (DE): 1. Erläutere an diesem Beispiel die Bedeutung von Silikonen für eine nanoskalige Oberflächenanwendung: Welche chemischen und strukturellen Hinweise können Wasserabweisung und bewegliche Tropfen erklären? 2. Vergleiche glatt/nanostrukturiert und die hydrophile Kontrolle. Trägt die Schichtdicke allein das Benetzungsurteil? 3. Prüfe „40 nm Dicke beweist 40 nm Silikonpartikel und eine dauerhaft selbstreinigende Oberfläche“. Begründe, welche Aussagen gestützt sind und welche weitere Beobachtung nötig wäre.
  - Task demand (EN): 1. Explain silicone relevance for a nanoscale surface application in this example: which chemistry/structure evidence can account for water repellency and mobile drops? 2. Compare smooth/nanostructured surfaces and the hydrophilic control. Does film thickness alone establish wetting behaviour? 3. Evaluate “40 nm thickness proves 40 nm silicone particles and a permanently self-cleaning surface.” Explain supported claims and a needed further observation.
  - Expected performance (DE): Eine nanoskalige Siloxanschicht kann als funktionale Oberfläche genutzt werden. Organische Methylgruppen sind mit Wasserabweisung vereinbar; bei gleicher Silikonchemie zeigen geänderte Oberflächenstruktur und 105°/35° gegenüber 155°/5°, dass Chemie allein nicht das gesamte Verhalten festlegt. Der kleinere Abrollwinkel unterstützt beweglichere Tropfen unter den gegebenen Bedingungen. Die hydrophile 40-nm-Kontrolle zeigt, dass gleiche Dicke nicht gleiche Benetzung bedeutet. 40 nm ist eine Schichtdimension, kein gemessener Partikeldurchmesser. Bewegliche Tropfen machen die Anwendung für wasserabweisende/gegebenenfalls reinigende Oberflächen interessant, beweisen aber weder tatsächlichen Schmutzabtrag noch Dauerhaftigkeit. Dafür sind passende Beobachtungen zum Schmutzabtrag und zum Verhalten nach Abrieb nötig; Nano bedeutet nicht automatisch mehr Funktion oder Sicherheit.
  - Expected performance (EN): A nanoscale siloxane film can provide a functional surface. Organic methyl groups are compatible with water repellency; at the same silicone chemistry, changed structure and 105°/35° versus 155°/5° show that chemistry alone does not determine all behaviour. Smaller roll-off angle supports more mobile drops under the stated conditions. The hydrophilic 40-nm control shows that equal thickness does not mean equal wetting. The 40 nm value is a film dimension, not a measured particle diameter. Mobile drops make such surfaces relevant for water-repellent/potentially cleaning applications but establish neither actual dirt removal nor durability. Appropriate dirt-removal observations and behaviour after abrasion are needed; nano does not automatically mean greater function or safety.
  - Understanding focus (DE): Erklärt Nano-Oberflächenanwendung über Silikonchemie und Struktur; trennt Schichtdicke von fehlendem Partikeldurchmesser. / Interpretiert die kontrollierte Strukturvariation und die hydrophile Gleichdickenkontrolle; Chemie und Struktur tragen getrennte Bezüge. / Leitet beweglichere Tropfen aus dem kleineren Abrollwinkel ab und begrenzt Selbstreinigung/Dauerhaftigkeit wegen fehlendem Schmutz-/Abriebnachweis.
  - Understanding focus (EN): Explains nanoscale surface application using silicone chemistry and structure; separates film thickness from missing particle diameter. / Interprets controlled structural variation and hydrophilic equal-thickness control; chemistry and structure contribute distinct links. / Uses smaller roll-off angle to infer more mobile drops and limits cleaning/durability claims because dirt/abrasion evidence is missing.
- `e560-nanosurface-case-2`
  - Task demand (DE): 1. Beschreibe die mögliche Bedeutung der Silikonoberfläche für die Anwendung und unterscheide die beiden Größenangaben 80 nm und 45 nm. 2. Erläutere, was aus A/B bei gleicher Chemie über die Wirkung der Struktur folgt. Beurteile „B hat immer noch einen großen Kontaktwinkel, also rollen Tropfen so leicht ab wie bei A“. 3. Prüfe, ob A oder B damit dauerhaft selbstreinigend ist, und gib ein begrenztes Anwendungsurteil mit einer konkret nötigen weiteren Beobachtung.
  - Task demand (EN): 1. Describe possible silicone-surface relevance for the application and distinguish the 80 nm and 45 nm dimensions. 2. Explain what A/B at the same chemistry show about structural effects. Evaluate “B still has a large contact angle, so drops roll off as easily as in A.” 3. Assess whether A or B is thereby permanently self-cleaning and give a bounded application conclusion with a specific further observation needed.
  - Expected performance (DE): Die 80 nm betreffen die Schicht; 45 nm ist eine separat ausgewiesene Partikelgröße ausschließlich für C. Ohne die Zusatzangabe dürfte man keine Partikelgröße aus 80 nm ableiten. Silikonchemie und passende Oberflächenstruktur können zur nanoskaligen Funktionalisierung beitragen. A/B haben gleiche Chemie, aber andere Struktur und stark unterschiedliche Abrollwinkel. Ein hoher Kontaktwinkel in B bedeutet nach den Angaben nicht gleich leichte Tropfenbewegung: 40° verlangt deutlich mehr Neigung als 5°. Die hydrophile Gleichdickenkontrolle verhindert eine Erklärung allein aus der Dicke. A erscheint für bewegliche Tropfen unter den gegebenen Bedingungen günstiger; echter Schmutztransport, Abrieb- oder Langzeitbeständigkeit bleiben unbelegt. Eine Beobachtung des Schmutzabtrags vor/nach Belastung würde die funktionale Anwendung prüfen. Das Urteil ist daten- und zustandsgebunden, keine Behauptung über alle Silikonprodukte.
  - Expected performance (EN): The 80 nm refers to the film; 45 nm is separately stated particle size only for C. Without that extra information, particle size could not be inferred from 80 nm. Silicone chemistry and suitable surface structure can contribute to nanoscale functionalization. A/B have the same chemistry but different structure and very different roll-off angles. High contact angle in B does not mean equally easy droplet movement: 40° requires much greater tilt than 5°. The hydrophilic equal-thickness control prevents a thickness-only explanation. A appears better for mobile drops under the supplied conditions; actual dirt transport, abrasion resistance or long-term stability remain unsupported. Observing dirt removal before/after loading would test the functional application. The conclusion is data/state-bound, not a statement about every silicone product.
  - Understanding focus (DE): Verbindet Silikon-Oberflächenfunktion mit Materialdaten und unterscheidet 80-nm-Schicht von separat gemessenen 45-nm-Partikeln in C. / Erklärt bei gleicher Chemie die Strukturänderung und trennt hohen Kontaktwinkel von leichtem Abrollen anhand 150°/40° gegenüber 155°/5°. / Begründet ein zustandsgebundenes Anwendungsurteil und benennt fehlenden Schmutzabtrag/Belastungsnachweis statt Nano-Selbstreinigung vorauszusetzen.
  - Understanding focus (EN): Connects silicone surface function to material data and separates 80-nm film from independently measured 45-nm particles in C. / Explains structural change at constant chemistry and distinguishes high contact angle from easy rolling using 150°/40° versus 155°/5°. / Justifies a state-bound application conclusion and identifies missing dirt-removal/loading evidence rather than assuming nano self-cleaning.
## Page 14: Substituenteneffekte in Farbstoff-Molekülen erklären

- Full learning-goal ID: `64b03eff-a967-54a1-ace3-89cb7650a65c`
- Goal fingerprint: `sha256:23107fd252d6de260d1442743fd7c0634a63900dfaa6b8c4cc390cd552c383aa`
- Page fingerprint: `sha256:a0764ecef7bd997eed4b09529879ba06dc0f9b85c380224c16e30a8b32a698f2`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann das Donator-Akzeptor-Konzept auf Farbstoff-Moleküle anwenden und den Einfluss funktioneller Gruppen auf die Farbigkeit der zugehörigen Stoffe erklären.

### Visualization

/assets/goal-visualizations/chemie/64b03eff-a967-54a1-ace3-89cb7650a65c/64b03eff-a967-54a1-ace3-89cb7650a65c.png

- original digest: `sha256:e19b74bece5c2f2eed2ce21fffda0213a36ccc3ebd20a97f66182f00dde976d1`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)

### Direct reverse prerequisites outside this book

- Übung: Substituenteneffekte in Farbstoff-Molekülen erklären — `d28b9b5f-848e-516a-84df-0ca76a3daf27` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:ebaa1177481b6340d23a8ad9c5082c9a212dd814ca209fcf8edccaf32d307410`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Donor und Akzeptor beeinflussen ein gekoppeltes π-System; der Effekt hängt von Stellung und Kopplung ab.
  - Essential understanding (EN): Donor and acceptor groups affect a coupled pi system; the effect depends on position and coupling.
  - Observable performance (DE): Identifiziert Gruppen und verknüpft elektronischen Effekt mit Spektren.
  - Observable performance (EN): Identifies groups and connects electronic effects to spectra.
- `e2`
  - Essential understanding (DE): Protonierung oder unterbrochene Konjugation kann einen Donoreffekt verändern; eine Rotverschiebung ist keine universelle Gruppenregel.
  - Essential understanding (EN): Protonation or interrupted conjugation can alter donation; a red shift is not a universal group rule.
  - Observable performance (DE): Begründet einen veränderten Übergang anhand konkreter Bedingungen.
  - Observable performance (EN): Explains a changed transition under specific conditions.
- `hb-auxochrome-antiauxochrome-explicit-use`
  - Essential understanding (DE): Auxochrom/Antiauxochrom sind im historischen Schulmodell gekoppelte Donor-/Akzeptorrollen, keine universellen modernen Stoffklassen.
  - Essential understanding (EN): Auxochrome/antiauxochrome are coupled donor/acceptor roles in the historical school model,not universal modern classes.
  - Observable performance (DE): Die lernende Person gebraucht beide Namen am Molekül,begründet Protonierung und überträgt bei unterbrochener Konjugation begrenzt.
  - Observable performance (EN): The learner uses both names for the molecule,explains protonation and transfers with limits after interrupted conjugation.

**Coverage expectations**

- required expectations: `e1`, `e2`, `hb-auxochrome-antiauxochrome-explicit-use`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Donorprotonierung und Spektraländerung / Donor protonation and spectrum change
- `v2`: Konjugation versus sp³-Unterbrechung / Conjugation versus sp³ interruption
- `hb-auxochrome-antiauxochrome-explicit-use-transfer`: Bedingungswechsel im vollständigen Transfer selbstständig berücksichtigen. / Independently account for changed conditions in the complete transfer.

**Application cases**

- `64b03eff-case-1`
  - Task demand (DE): Papiermodell eines planaren Donor–π–Akzeptor-Farbstoffs: para-(CH₃)₂N–C₆H₄–CH=CH–C₆H₄–NO₂. Gleicher Lösungsmittelzustand; λmax neutral 510 nm, nach Protonierung des Aminostickstoffs 430 nm. Die Nitrogruppe bleibt unverändert.
1. Kennzeichne Donor und Akzeptor im neutralen Molekül und begründe die Kopplung über das π-System.
2. Erkläre die Änderung des Aminodonors bei Protonierung und ordne die angegebene Verschiebungsrichtung sowie die Änderung der Übergangsenergie zu.
  - Task demand (EN): Paper model of a planar donor–pi–acceptor dye: para-(CH₃)₂N–C₆H₄–CH=CH–C₆H₄–NO₂. Same solvent conditions; neutral λmax 510 nm and 430 nm after protonation at the amino nitrogen. The nitro group remains unchanged.
1. Identify donor and acceptor in the neutral molecule and explain coupling through the pi system.
2. Explain the amino donor change on protonation and identify the stated shift direction and transition-energy change.
  - Expected performance (DE): 1. –N(CH₃)₂ kann sein freies Elektronenpaar in das gekoppelte π-System einspeisen (+M); –NO₂ zieht über Mesomerie Elektronendichte ab (−M). Die sp²-Brücke ermöglicht Kopplung der beiden Enden.
2. Nach H⁺-Bindung ist das Paar in einer N–H-Bindung gebunden; der neutrale +M-Donor steht nicht mehr so zur Verfügung. 510→430 nm ist hypsochrom; nach ΔE=hc/λ steigt die Übergangsenergie. Das erklärt diesen angegebenen Fall, keine universelle Regel für alle protonierten Farbstoffe.
  - Expected performance (EN): 1. –N(CH₃)₂ can donate its lone pair into the coupled pi system (+M); –NO₂ withdraws electron density through resonance (−M). The sp² bridge couples the two ends.
2. After H⁺ bonding the pair forms the N–H bond, so the neutral +M donor is no longer available in the same way. 510→430 nm is hypsochromic; ΔE=hc/λ increases. This explains the supplied case rather than a universal rule for all protonated dyes.
  - Understanding focus (DE): –N(CH₃)₂ kann sein freies Elektronenpaar in das gekoppelte π-System einspeisen (+M); –NO₂ zieht über Mesomerie Elektronendichte ab (−M). Die sp²-Brücke ermöglicht Kopplung der beiden Enden. / Nach H⁺-Bindung ist das Paar in einer N–H-Bindung gebunden; der neutrale +M-Donor steht nicht mehr so zur Verfügung. 510→430 nm ist hypsochrom; nach ΔE=hc/λ steigt die Übergangsenergie.
  - Understanding focus (EN): –N(CH₃)₂ can donate its lone pair into the coupled pi system (+M); –NO₂ withdraws electron density through resonance (−M). The sp² bridge couples the two ends. / After H⁺ bonding the pair forms the N–H bond, so the neutral +M donor is no longer available in the same way. 510→430 nm is hypsochromic; ΔE=hc/λ increases.
- `64b03eff-case-2`
  - Task demand (DE): Zwei idealisierte Moleküle besitzen dieselben Amino-Donor- und Nitro-Akzeptor-Endgruppen. A hat eine planare –CH=CH–Brücke und λmax 500 nm. B hat –CH₂–CH₂– als Brücke und λmax 330 nm; Konzentration und Lösungsmittel sind gleich.
1. Erkläre, welche Brücke Donor und Akzeptor mesomer koppelt, und begründe die Unterbrechung bei der anderen.
2. Verknüpfe die zwei Absorptionsmaxima mit Übergangsenergie und sichtbarer Farbigkeit; beurteile die Aussage „Eine Nitrogruppe macht jedes Molekül farbig“.
  - Task demand (EN): Two idealized molecules have the same amino donor and nitro acceptor end groups. A has a planar –CH=CH– bridge and λmax 500 nm. B has a –CH₂–CH₂– bridge and λmax 330 nm; concentration and solvent are equal.
1. Explain which bridge couples donor and acceptor by resonance and why the other interrupts it.
2. Connect both absorption maxima to transition energy and visible color; assess the claim “A nitro group makes every molecule colored”.
  - Expected performance (DE): 1. A besitzt benachbarte p-Orbitale über die sp²-Brücke. Bei B unterbrechen sp³-C die durchgehende Konjugation; die Endgruppen allein bilden kein langes gekoppeltes π-System.
2. 500 nm liegt im sichtbaren Bereich und entspricht einer kleineren ΔE als 330 nm im UV. A kann durch sichtbare Absorption farbig sein; B wäre im gegebenen Modell ohne weitere sichtbare Banden farblos. Die Nitrogruppe allein garantiert keine sichtbare Absorption.
  - Expected performance (EN): 1. A has adjacent p orbitals through its sp² bridge. In B sp³ carbons interrupt continuous conjugation; end groups alone do not make a long coupled pi system.
2. 500 nm is visible and corresponds to a smaller ΔE than ultraviolet 330 nm. A can be colored by visible absorption; B would be colorless in the given model without other visible bands. A nitro group alone does not guarantee visible absorption.
  - Understanding focus (DE): A besitzt benachbarte p-Orbitale über die sp²-Brücke. Bei B unterbrechen sp³-C die durchgehende Konjugation; die Endgruppen allein bilden kein langes gekoppeltes π-System. / 500 nm liegt im sichtbaren Bereich und entspricht einer kleineren ΔE als 330 nm im UV. A kann durch sichtbare Absorption farbig sein; B wäre im gegebenen Modell ohne weitere sichtbare Banden farblos. Die Nitrogruppe allein garantiert keine sichtbare Absorption.
  - Understanding focus (EN): A has adjacent p orbitals through its sp² bridge. In B sp³ carbons interrupt continuous conjugation; end groups alone do not make a long coupled pi system. / 500 nm is visible and corresponds to a smaller ΔE than ultraviolet 330 nm. A can be colored by visible absorption; B would be colorless in the given model without other visible bands. A nitro group alone does not guarantee visible absorption.
- `hb-colour-three-terms-64b0`
  - Task demand (DE): Konjugiertes Modell (CH3)2N–C6H4–CH=CH–C6H4–NO2, beide Substituenten para zur Vinylbrücke. Aminisches freies Elektronenpaar kann als Donor koppeln, Nitro ist hier Akzeptor. Fiktive Spektren im gleichen Lösungsmittel:gekoppeltes Stammgerüst ohne beide Substituenten350 nm;gekoppeltes Donor/Akzeptor-System500 nm;protonierter Amindonor410 nm. Chromophor=Molekülteil, auf den der betrachtete Absorptionsübergang näherungsweise lokalisiert ist. Historischer HB-Schulgebrauch hier:gekoppelter Amindonor Auxochrom, elektronenziehender Nitro-Substituent Antiauxochrom. Keine universellen disjunkten modernen Stoffklassen:IUPAC kennzeichnet Auxochrom als überholt; Nitro kann andernorts selbst Chromophorbestandteil sein. hc=1240 eV·nm. Einzelbande bestimmt keine eindeutige vollständige Wahrnehmungsfarbe.
Nenne alle drei HB-Begriffe ausdrücklich, erkläre und markiere Rollen im Molekül, ohne Nichtüberlappung zu erfinden. Zeichne Energieniveaus, berechne Lücken350/500 nm und erkläre Protonierung unter Vorgaben. Trenne Bandverschiebung und sichere Farbbestimmung.
Frisch erst nach eigener Antwort: Vinylbrücke wird–CH2–CH2–;neues Modell λmax330 nm. Bleiben Fernwirkung und sichtbare gemeinsame Bande zwingend?
Ganzes Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current447-final-four-scope-corrections-author-20261018-v2/MATERIALS.complete-owned-and-energy-only-and-supplied-four-cards.pending.json#/materials/5
  - Task demand (EN): Conjugated model (CH3)2N–C6H4–CH=CH–C6H4–NO2,both substituents para to vinyl bridge. Amine lone pair can couple as donor,nitro is acceptor here. Fictional spectra in same solvent:coupled parent without both substituents350 nm;coupled donor/acceptor500 nm;protonated amine410 nm. Chromophore=molecular part on which the particular absorption transition is approximately localized. Historical HB school usage here:coupled amine donor auxochrome,electron-withdrawing nitro substituent antiauxochrome. Not universal disjoint modern classes:IUPAC labels auxochrome obsolete;nitro can itself belong to a chromophore elsewhere. hc=1240 eV·nm. A single band determines no unique full perceived colour.
Explicitly name all three HB terms,explain/mark roles without inventing non-overlap. Draw levels,calculate gaps350/500 nm and explain protonation under the givens. Distinguish band shift from definitive colour.
Fresh only after own response: Vinyl bridge becomes–CH2–CH2–;new model λmax330 nm. Must long-range effects and joint visible band remain?
Complete material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current447-final-four-scope-corrections-author-20261018-v2/MATERIALS.complete-owned-and-energy-only-and-supplied-four-cards.pending.json#/materials/5
  - Expected performance (DE): Gekoppeltes π-System trägt den betrachteten Chromophor; Amin=Auxochrom/Donor und Nitro=Antiauxochrom/Akzeptor in dieser historischen Konvention.1240/350=3,54 eV;1240/500=2,48 eV. Kopplung vermindert im Vergleich die relevante Lücke; Protonierung bindet das freie Paar und vermindert Donorfunktion, hier kürzere Wellenlänge. Gruppenname allein beweist keinen universellen Effekt.
Nein:sp3 unterbricht π-Kopplung. Lokale Chromophore können bleiben;gemeinsame D–π–A-Bande/Gruppenwirkungen nicht übertragen.330 nm ist UV;keine genaue sichtbare Farbe daraus.
  - Expected performance (EN): Coupled π system carries the relevant chromophore;amine=auxochrome/donor,nitro=antiauxochrome/acceptor in this historical convention.1240/350=3.54 eV;1240/500=2.48 eV. Coupling lowers the relevant gap in this comparison;protonation binds the pair and reduces donation,giving shorter wavelength here. Group naming alone proves no universal effect.
No:sp3 interrupts π coupling. Local chromophores may remain;joint D–π–A band/group effects do not transfer.330 nm is UV;no exact visible colour follows.
  - Understanding focus (DE): Auxochrom/Antiauxochrom sind im historischen Schulmodell gekoppelte Donor-/Akzeptorrollen, keine universellen modernen Stoffklassen.
  - Understanding focus (EN): Auxochrome/antiauxochrome are coupled donor/acceptor roles in the historical school model,not universal modern classes.
## Page 15: Chemische Modelle nutzen und kritisch vergleichen

- Full learning-goal ID: `6c7ce93c-7675-51da-bc0c-7d0257f7ff7d`
- Goal fingerprint: `sha256:512f64ab6581d0afea08dee825b7dfcbb2d9375ac6ff1595195d1ba830a96796`
- Page fingerprint: `sha256:c31c7d9cc881b96613c581bbe6ce2731f9939ece0b2067dab17b16e6985555f7`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann für eine chemische Fragestellung hypothesengeleitet geeignete analoge oder digitale Modelle und Simulationen zu Materie, chemischen Reaktionen, Bindungen und Wechselwirkungen auswählen und nutzen, ihre Aussagen mit Beobachtungen und miteinander vergleichen, Grenzen benennen und begründen, weshalb ein Modell hinterfragt oder weiterentwickelt werden muss.

### Visualization

/assets/goal-visualizations/chemie/6c7ce93c-7675-51da-bc0c-7d0257f7ff7d/6c7ce93c-7675-51da-bc0c-7d0257f7ff7d.jpg

- original digest: `sha256:add6f10b3fccddca4cce0c1f467e036aa25e7090f0c7717f4a07a94a5467030c`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Dalton-Modell und Modellcharakter erläutern — `9b5d6326-d27c-4ece-8c72-debda705464a` (outside this book)

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:6770ddc9fb0c49e6820795421d039b1bec3dfbeee9491ae27c283333718b6982`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `hypothesis-guided-use`
  - Essential understanding (DE): Ein Modell wird zur gegebenen chemischen Frage und Hypothese passend gewählt und tatsächlich benutzt; Materie, Reaktion, Bindung und Wechselwirkung erfordern unterschiedliche Aussagen.
  - Essential understanding (EN): A model is selected for the given chemical question and hypothesis and actually used; matter, reaction, bonding and interaction need distinct statements.
  - Observable performance (DE): Eigene Karten-/Skizzenanordnung von Na⁺/Cl⁻ und 2 H₂ + O₂ → 2 H₂O vorlegen; Ladung, Beweglichkeit und Atomzählung mit der gegebenen Hypothese verbinden.
  - Observable performance (EN): Submit own card/sketch arrangements of Na⁺/Cl⁻ and 2 H₂ + O₂ → 2 H₂O; link charge, mobility and atom count to the supplied hypothesis.
- `selected-model-rule-and-comparison`
  - Essential understanding (DE): Die gewählte analoge ODER digitale Modellregel unterscheidet Anziehung, Abstoßung und neutral-unbestimmt; ihre Aussagen werden mit einem anderen Modell und Beobachtungen verglichen. Partialladungen sind keine ganzen Ionenladungen.
  - Essential understanding (EN): The selected analogue OR digital model rule distinguishes attraction, repulsion and neutral-undetermined; its statements are compared with another model and observations. Partial charges are not full ionic charges.
  - Observable performance (DE): Tatsächlich die gewählte analoge Kartenregel mit eigener Anordnung/Prüfprotokoll ODER die gewählte digitale Regel als eigene Implementation/Datei anwenden und begründet vergleichen. Im digitalen Originalfall alle sechs Prüffälle, eigene Formel und Ergebnisse belegen; in der analogen Alternative eigene manuelle Regelprüfungen zeigen, ohne digitale Leistung zu behaupten.
  - Observable performance (EN): Actually apply the selected analogue card rule with an own arrangement/check record OR the selected digital rule with own implementation/file, and justify the comparison. In the original digital case evidence all six tests, own formula and results; in the analogue alternative show own manual rule checks without claiming digital performance.
- `justified-model-limits`
  - Essential understanding (DE): Ein Ladungs-/Beweglichkeitsmodell liefert noch keine Energiebilanz, Löslichkeitsprognose oder exakte Geometrie; unbestimmt bedeutet nicht wechselwirkungsfrei.
  - Essential understanding (EN): A charge/mobility model supplies no energy balance, solubility prediction or exact geometry; undetermined does not mean no interactions.
  - Observable performance (DE): Abkühlung und schlecht lösliches Salz als neue Fälle begründet behandeln, fehlende Gitter-/Hydratations-/weitere Energiebeiträge benennen und Erweiterungsbedarf zur jeweiligen Frage erklären.
  - Observable performance (EN): Reason about cooling and a poorly soluble salt as fresh cases, identify missing lattice/hydration/other energy contributions and justify development needed for the respective question.

**Coverage expectations**

- required expectations: `hypothesis-guided-use`, `selected-model-rule-and-comparison`, `justified-model-limits`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `changed-condition`: Neue fallgebundene Bedingung/Hypothesenprüfung und eigene begründete Revision statt bloßem Zahlentausch. / Fresh case-specific condition/hypothesis check and own reasoned revision rather than mere number substitution.
- `source-and-limit`: Für den gemeinsamen kanonischen Kern wird ein geeignetes analoges ODER digitales Modell tatsächlich hypothesengeleitet gewählt, genutzt, mit Beobachtungen und einem anderen Modell verglichen und begrenzt. Keine universelle Pflicht zur selbst implementierten Tabellenkalkulation folgt aus diesem ODER. Im ausdrücklich gewählten digitalen Originalfall bleiben eigene Implementierung der Ladungsregel, alle sechs Prüffälle und das tatsächliche digitale Arbeitsprodukt verbindlich. Die analoge Alternative verwendet eigene Kartenanordnung und manuell protokollierte Regelprüfungen; sie ist keine digitale Leistung. Spezielle source-spezifische Software-/Simulation-/Messwerterfassungs- und praktische Partnerpflichten bleiben unverändert; die analoge Route darf diese nicht schließen. Alle Materie-/Reaktions-/Bindungs-/Wechselwirkungsbeiträge und begründete Modellgrenzen bleiben erhalten; spezielle Inhaltsmodelle behalten ihre eigenen Ziele und source-/Stufen-/target-Grenzen. BY C8/C9/C10 einfache Materie-/Reaktions-/Bindungsmodelle und Weiterentwicklung; digitale Mittel bereits Sek I. Spezielle Fachmodelle bleiben gesonderte Ziele; Stoffwissen, Geometrie/Polarität werden je Fall bereitgestellt oder begründet vorausgesetzt. Die hypothesengeleitete Nutzung ist ausdrücklich erhalten, auch für BY C10.1. Daltonkenntnisse sind keine universelle Voraussetzung jeder Modellnutzung/-kritik; notwendige konkrete Modellkenntnisse werden im jeweiligen Fall bereitgestellt oder an ein tatsächlich passendes Inhaltsziel gebunden. Hypothesengeleitete Nutzung ist im abschließenden Erfolgsprodukt verbindlich; ein bloßer Fragestellungsfall ohne Hypothese belegt nur eine Teilkompetenz. Einfachere BY-C8/C9-Beiträge bleiben ausdrücklich quellenspezifische Teilbeiträge und erhalten erst nach geprüfter Stufen-/target-Entscheidung ihre tatsächliche Route. Der Titel verlangt die begründete Modellkritik und keine bereits ausgeführte Modellweiterentwicklung. / For the common canonical core, a suitable analogue OR digital model is actually selected and used with a hypothesis, compared with observations and another model, and its limits justified. This OR creates no universal requirement to implement a spreadsheet. In the explicitly selected original digital case, own implementation of the charge rule, all six checks and the actual digital artifact remain mandatory. The analogue alternative uses an own card arrangement and manually documented rule checks; it is not digital performance. Specific source-level software/simulation/measurement-acquisition and practical partner obligations remain unchanged and cannot be completed through the analogue route. All matter/reaction/bonding/interaction contributions and justified model limits remain; specific subject models retain their own goals and source/stage/target boundaries. Concrete model knowledge is supplied or linked to a suitable content goal; Dalton knowledge is not a universal prerequisite. Successful work must remain hypothesis-guided, earlier-stage contributions remain partial pending stage/target decisions, and the goal asks for justified model criticism rather than claiming already completed model development.

**Application cases**

- `sek1-model-use-criticism-particles-and-reaction`
  - Task demand (DE): Wähle hypothesengeleitet ein Modell, ordne die Karten tatsächlich zu Feststoff/Lösung und prüfe die Vorhersage an Beobachtungen. Ordne auch Reaktionskarten unter Atomerhaltung um. Vergleiche M1/M2, Grenzen und begründe erforderliche Hinterfragung/Weiterentwicklung; erfinde keine bereits erfolgte Modellentwicklung. Neue Variation: Neue bereitgestellte qualitative Lehrbeobachtung im gleichen Stoffkontext: Beim Lösen von NaCl in zunächst etwa 25 °C warmem Wasser zeigt sich eine kleine Abkühlung, passend zu Wärmeaufnahme im betrachteten verdünnten Bereich. Welche energetische Aussage kann dein Ladungs-/Beweglichkeitsmodell bisher nicht leisten? Begründe zusätzlichen Energie-/Wechselwirkungsbedarf, ohne aus dieser Beobachtung jede Salzlösung oder Temperatur zu verallgemeinern. Dies ist ein neuer Modellstimulus, kein eigener Messnachweis.
  - Task demand (EN): Choose a model guided by the hypothesis, actually arrange cards for solid/solution and test the prediction against observations. Also rearrange reaction cards conserving atoms. Compare M1/M2, limits and justify needed questioning/development; do not invent already completed model development. Fresh variation: A newly supplied qualitative teaching observation in the same substance context: Dissolving NaCl in water initially near 25 °C shows slight cooling, consistent with heat uptake in the considered dilute range. Which energetic statement can your charge/mobility model not yet support? Justify additional energy/interaction information without generalising this observation to every salt solution or temperature. This is a new model stimulus, not an own measurement receipt.
  - Expected performance (DE): M2 macht Ladung und Beweglichkeit sichtbar und passt zum Leitfähigkeitsvergleich, M1 kann diesen Unterschied nicht erklären. Vier H- und zwei O-Atome ergeben zwei H2O-Kartenverbände ohne Atomverlust. Beide Modelle vereinfachen Größen/Bewegung, M2 zeigt noch keine Wasser-Ionen-Wechselwirkung; begründete Ergänzung wäre gerichtete Wasserdipole, nicht die Behauptung realer Kugeln. Eigene Kartenanordnung/Skizze muss als Arbeitsprodukt vorliegen. Transfer: M2 mit Ladung und Beweglichkeit kann das Entstehen leitfähiger Lösung gegenüber unbeweglichem Ionengitter erklären. Es enthält aber keine Energiebilanz und entscheidet daher nicht, ob beim Lösen Wärme aufgenommen oder abgegeben wird. Die neue vorgegebene Abkühlung verlangt Energiebeiträge für Trennung der Gitterionen und Wechselwirkungen/Hydratation mit Wasser sowie ihren Vergleich. Im genannten verdünnten Bereich ist die resultierende Bilanz mit Wärmeaufnahme vereinbar. Keine quantitative Temperaturprognose, kein allgemeines Urteil über jedes Salz oder jede Temperatur und keine eigene Messung sind damit belegt.
  - Expected performance (EN): M2 shows charge/mobility and fits the conductivity comparison; M1 cannot explain it. Four H and two O atoms form two H2O card groups without atom loss. Both simplify sizes/motion; M2 does not yet show water-ion interaction; a justified extension would add oriented water dipoles, not claim real balls. Own card arrangement/sketch must exist as work product. Transfer: M2 with charge and mobility can explain a conducting solution compared with an immobile ion lattice. It contains no energy balance, however, and cannot determine whether dissolution absorbs or releases heat. The supplied cooling calls for energy contributions for separating lattice ions and for interactions/hydration with water, and their comparison. In the specified dilute range the resulting balance is consistent with heat uptake. This establishes no quantitative temperature prediction, universal claim about all salts/temperatures or own measurement.
  - Understanding focus (DE): Die lernende Person kann für eine chemische Fragestellung hypothesengeleitet geeignete analoge oder digitale Modelle und Simulationen zu Materie, chemischen Reaktionen, Bindungen und Wechselwirkungen auswählen und nutzen, ihre Aussagen mit Beobachtungen und miteinander vergleichen, Grenzen benennen und begründen, weshalb ein Modell hinterfragt oder weiterentwickelt werden muss. Eigene unabhängige Begründung und tatsächliches gefordertes Leistungsprodukt, keine Wiedergabe der Musterlösung.
  - Understanding focus (EN): The learner can select and use suitable analogue or digital models and simulations of matter, chemical reactions, bonding and interactions in a hypothesis-guided investigation of a chemical question, compare their predictions with observations and with each other, identify limitations and justify why a model should be questioned or developed further. Own independent reasoning and the actually required performance artifact, not recitation of the worked answer.
- `sek1-model-use-criticism-bond-and-interaction`
  - Task demand (DE): Wähle für die vorgegebene Hypothese die analoge ODER die digitale Route. Analog: ordne selbst die unveränderten gedruckten Wasser-/Na⁺-/Cl⁻-/U-Karten an, prüfe die sechs vorgegebenen Ladungspaarungen manuell und vergleiche mit dem einfacheren M1/M2-Modell und der Lösungsbeobachtung. Digital: führe den ursprünglichen digitalen Fall vollständig aus; implementiere die Regel selbst in einer Tabelle und prüfe alle sechs Fälle mit eigener Formel und Datei. Begründe jeweils Aussagen und Grenzen. Neue Variation: Warum widerlegt ein schlecht lösliches Salz nicht automatisch die Ladungsregel? Benenne fehlende Modellanteile.
  - Task demand (EN): Select the analogue OR digital route for the supplied hypothesis. Analogue: arrange the unchanged printed water/Na⁺/Cl⁻/U cards yourself, manually test the six supplied charge pairs and compare with the simpler M1/M2 model and dissolution observation. Digital: perform the whole original digital case, implement the rule yourself in a table and test all six cases with own formula and file. Justify statements and limits in either route. Fresh variation: Why does a poorly soluble salt not automatically refute the charge rule? Identify missing model components.
  - Expected performance (DE): O-Ende zu Na⁺, H-Enden zu Cl⁻; Prüffälle 1/4 Anziehung, 2/3 Abstoßung, 5/6 unbestimmt. Analog liegen eigene Kartenanordnung und manuelles Prüf-/Vergleichsprotokoll vor; digital liegen zusätzlich eigene Implementation, Formel und digitale Ergebnisse aller sechs Fälle vor. Keine Route wird durch eine gelesene Musterlösung belegt. Partialladungs-/Beweglichkeitsmodelle erklären qualitative Wechselwirkungen, aber keine ganze Löslichkeits-/Energiebilanz oder exakte Geometrie. Transfer: Die Regel bestimmt nur die qualitative elektrostatische Anziehung/Abstoßung für gegenüberstehende Teilladungen. Schlechte Löslichkeit kann trotz günstiger Ion-Wasser-Anziehung auftreten: Gittertrennung, gesamte Solvatation und weitere thermodynamische Beiträge einschließlich Entropie fehlen. Der Vergleich von Gesamtbeiträgen entscheidet das Gleichgewicht, nicht eine Einzelanziehung. Darum muss das Modell für eine Löslichkeitsfrage erweitert werden; bei U neutral bedeutet der Tabellenausgang unbestimmt, nicht keinerlei Wechselwirkung.
  - Expected performance (EN): O end towards Na⁺, H ends towards Cl⁻; checks1/4 attraction,2/3 repulsion,5/6 undetermined. Analogue evidence is an own card arrangement and manual check/comparison record; digital evidence additionally includes own implementation, formula and digital results for all six cases. Reading the worked answer demonstrates neither route. Partial-charge/mobility models explain qualitative interactions, not a complete solubility/energy balance or exact geometry. Transfer: The rule only determines qualitative electrostatic attraction/repulsion between facing charges. Poor solubility can occur despite favourable ion–water attraction: lattice separation, total solvation and other thermodynamic contributions, including entropy, are absent. The balance of total contributions determines equilibrium, not one attraction. Extend the model for a solubility question; for neutral U, the table output means undetermined, not absence of all interaction.
  - Understanding focus (DE): Die lernende Person kann für eine chemische Fragestellung hypothesengeleitet geeignete analoge oder digitale Modelle und Simulationen zu Materie, chemischen Reaktionen, Bindungen und Wechselwirkungen auswählen und nutzen, ihre Aussagen mit Beobachtungen und miteinander vergleichen, Grenzen benennen und begründen, weshalb ein Modell hinterfragt oder weiterentwickelt werden muss. Eigene unabhängige Begründung und tatsächliches gefordertes Leistungsprodukt, keine Wiedergabe der Musterlösung.
  - Understanding focus (EN): The learner can select and use suitable analogue or digital models and simulations of matter, chemical reactions, bonding and interactions in a hypothesis-guided investigation of a chemical question, compare their predictions with observations and with each other, identify limitations and justify why a model should be questioned or developed further. Own independent reasoning and the actually required performance artifact, not recitation of the worked answer.
## Page 16: Radikalische Polymerisation beschreiben

- Full learning-goal ID: `6eb14e47-187c-5ba1-8b08-a0ee95ad88a9`
- Goal fingerprint: `sha256:92955c59aead984de718461fc828cb9d97f8ca468c672db354cbb70c5f643db4`
- Page fingerprint: `sha256:9fe759c46ab46cb9d71ad1e0029cdc8ea9bd16e28f920252913b0f6f357304c0`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann den Mechanismus der radikalischen Polymerisation formulieren und auf die Synthese verschiedener Polymere anwenden.

### Visualization

/assets/goal-visualizations/chemie/6eb14e47-187c-5ba1-8b08-a0ee95ad88a9/6eb14e47-187c-5ba1-8b08-a0ee95ad88a9.jpg

- original digest: `sha256:e3899f8cb9ef17c6a8426ae198dd16fc6331b8390651e0f98f818d2b04e224f6`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Thermisches Verhalten von Kunststoffen erklären — `3aef6d91-04ff-5ec7-b92e-ccf330d9816a` (page 18)
- Reaktionsbedingungen der Kunststoffsynthesen vergleichen — `0559cec7-330b-57f1-a409-31cf1b4ac9fb` (page 17)

### Prerequisites outside this book

- Kunststoffe einteilen — `3e9eb5d0-3407-5a1e-9492-ad87f98d303d` (outside this book)

### Direct reverse prerequisites outside this book

- HE-GK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)
- ABS-Gehäuse im Recyclinglabor — `954b55d6-8a2b-533d-8aff-dadaf6306916` (outside this book)
- Polykondensation verstehen — `9b942490-ad8f-52ba-8c5a-f8a9792b7db5` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:bb6b19753c754a8b565b733ac1123484af582b4e61a4fbd1c7739dcb14d761d5`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Radikale starten eine Kettenreaktion; Wachstum erhält ein aktives Kettenende, Abbruch entfernt es.
  - Essential understanding (EN): Radicals initiate a chain reaction; growth retains an active chain end while termination removes it.
  - Observable performance (DE): Formuliert Initiatorzerfall, Start, Wachstum und Kombination mit korrekt gesetzten Radikalpunkten.
  - Observable performance (EN): Writes initiator cleavage, initiation, propagation and combination with correctly located radical dots.
- `e2`
  - Essential understanding (DE): Die Vinylgruppe wird zum gesättigten Kettenrückgrat; Substituenten und Atomzahl bleiben erhalten.
  - Essential understanding (EN): The vinyl group becomes a saturated backbone; substituents and atom counts are retained.
  - Observable performance (DE): Leitet verschiedene Repetiereinheiten aus vollständigen Monomerformeln ab.
  - Observable performance (EN): Derives different repeat units from complete monomer formulae.
- `e3`
  - Essential understanding (DE): Reaktionssteuerung wirkt auf aktive Zentren und Nebenreaktionen; der Mechanismus ist keine Durchführungsvorschrift.
  - Essential understanding (EN): Reaction control affects active centres and side reactions; a mechanism is not an experimental procedure.
  - Observable performance (DE): Überträgt den Mechanismus auf ein anderes Vinylmonomer und begründet ein gegebenes Inhibitorverhalten.
  - Observable performance (EN): Transfers the mechanism to another vinyl monomer and explains supplied inhibitor behaviour.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Vinylsubstituent / Vinyl substituent
- `v2`: Start oder Abbruchschritt / Initiation or termination step
- `v3`: Inhibitorbedingungen / Inhibitor conditions

**Application cases**

- `6eb14e47-case-1`
  - Task demand (DE): Formuliere Start und einen Wachstumsschritt für Ethen sowie Kombination zweier Kettenradikale. Leite beide Repetiereinheiten ab und übertrage den Start auf Styrol. Unterscheide Radikalpunkt und Ladung. Formuliere zusätzlich den gegebenen homolytischen Initiatorzerfall.
  - Task demand (EN): Write initiation and one propagation step for ethene, plus combination of two chain radicals. Derive both repeat units and transfer initiation to styrene. Distinguish a radical dot from charge. Also write the supplied homolytic initiator cleavage.
  - Expected performance (DE): RO•+CH₂=CH₂→RO–CH₂–CH₂•; RO–(CH₂–CH₂)ₙ•+CH₂=CH₂→RO–(CH₂–CH₂)ₙ₊₁• ist Kurznotation mit Punkt am End-C. P•+•Q→P–Q entfernt beide Radikale. Repetiereinheiten –CH₂–CH₂– und –CH₂–CH(C₆H₅)–. Styrolstart RO–CH₂–C•H(C₆H₅); Radikal besitzt ungepaartes Elektron, nicht automatisch eine Ladung. Atome/Substituenten bleiben erhalten. Initiatorzerfall: RO–OR → 2 RO•.
  - Expected performance (EN): RO•+CH₂=CH₂→RO–CH₂–CH₂•; RO–(CH₂–CH₂)ₙ•+CH₂=CH₂→RO–(CH₂–CH₂)ₙ₊₁• is shorthand with the dot on the terminal carbon. P•+•Q→P–Q removes both radicals. Repeat units –CH₂–CH₂– and –CH₂–CH(C₆H₅)–. Styrene initiation gives RO–CH₂–C•H(C₆H₅); a radical has an unpaired electron, not necessarily a charge. Atoms and substituents are retained. Initiator cleavage: RO–OR → 2 RO•.
  - Understanding focus (DE): Fallbezogene Aspekte: RO–OR→2 RO•; Start/Wachstum mit End-C-Radikal; Kombination P•+•Q→P–Q entfernt beide Punkte. / Ethen –CH₂–CH₂– und Styrol –CH₂–CH(C₆H₅)–; Substituenten und Atome bleiben erhalten. / Styrolstart RO–CH₂–C•H(C₆H₅); ungepaartes Elektron ist nicht automatisch eine Ladung. Die Verknüpfung zu Erwartungs-IDs behauptet keine vollständige Erfüllung jeder Gesamtprofilerwartung in diesem Einzelfall.
  - Understanding focus (EN): Case-specific aspects: RO–OR→2 RO•; initiation/propagation retain terminal-C radical; combination P•+•Q→P–Q removes both dots. / Ethene –CH₂–CH₂– and styrene –CH₂–CH(C₆H₅)–; substituents and atoms retained. / Styrene initiation RO–CH₂–C•H(C₆H₅); an unpaired electron is not automatically a charge. Links to expectation IDs do not assert complete fulfilment of every whole-profile expectation in this one case.
- `6eb14e47-case-2`
  - Task demand (DE): Formuliere Start und Wachstum mit Cl-Erhaltung. Erkläre die Umsatzänderung und formuliere einen möglichen Kombinationsabbruch. Warum beweisen Umsatzdaten allein weder mittlere Kettenlänge noch chemische Sicherheit? Schreibe auch den Initiatorzerfall und die Repetiereinheit aus.
  - Task demand (EN): Write initiation and growth retaining Cl. Explain the conversion change and formulate possible combination termination. Why does conversion alone establish neither average chain length nor chemical safety? Also write the initiator cleavage and the repeat unit explicitly.
  - Expected performance (DE): Start RO•+CH₂=CHCl→RO–CH₂–C•HCl; Wachstum ergänzt –CH₂–CHCl– und lässt am End-C ein Radikal. Zwei Endradikale kombinieren durch neue C–C-Bindung. Q entfernt aktive Zentren, daher geringerer Umsatz. Die Repetiereinheit enthält ein Cl je zwei Backbone-C. Umsatz ist verbrauchter Monomeranteil; Kettenzahl/Verteilung und Restmonomerexposition brauchen zusätzliche Daten. RO–OR → 2 RO•; Repetiereinheit –CH₂–CHCl–.
  - Expected performance (EN): Initiation RO•+CH₂=CHCl→RO–CH₂–C•HCl; growth adds –CH₂–CHCl– while retaining a terminal carbon radical. Two chain-end radicals combine through a new C–C bond. Q removes active centres, lowering conversion. The repeat unit contains one Cl per two backbone carbons. Conversion measures consumed monomer fraction; chain-number distribution and residual-monomer exposure need further evidence. RO–OR → 2 RO•; repeat unit –CH₂–CHCl–.
  - Understanding focus (DE): Fallbezogene Aspekte: Gegebenen RO–OR-Zerfall, RO–CH₂–C•HCl-Start, chlorerhaltendes Wachstum und Kombinationsabbruch korrekt formulieren. / –CH₂–CHCl– enthält ein Cl je zwei Rückgrat-C; Radikal sitzt am aktiven Kettenende. / Q entfernt P• und erklärt 60%→5%; Umsatzdaten bestimmen weder Kettenlängenverteilung noch Restmonomerexposition. Die Verknüpfung zu Erwartungs-IDs behauptet keine vollständige Erfüllung jeder Gesamtprofilerwartung in diesem Einzelfall.
  - Understanding focus (EN): Case-specific aspects: Correctly write supplied RO–OR cleavage, RO–CH₂–C•HCl initiation, chlorine-retaining propagation and combination. / –CH₂–CHCl– retains one Cl per two backbone C; radical remains at active chain end. / Q removes P• and explains 60%→5%; conversion does not determine chain-length distribution or residual-monomer exposure. Links to expectation IDs do not assert complete fulfilment of every whole-profile expectation in this one case.
## Page 17: Reaktionsbedingungen der Kunststoffsynthesen vergleichen

- Full learning-goal ID: `0559cec7-330b-57f1-a409-31cf1b4ac9fb`
- Goal fingerprint: `sha256:f21035935682299b5272229b45b33b9bb3dfca1b36e3f5bcfd36ccdfcb5076f1`
- Page fingerprint: `sha256:f140d8f0bc23d28be2af1518dc52b7b67c36e044cf1b1e6011c58868ba0467be`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann an ausgewählten Beispielen die Reaktionsbedingungen von radikalischer Kettenpolymerisation, Polykondensation und Polyaddition vergleichen und die Unterschiede anhand der jeweiligen Gruppenreaktion sowie geeigneter Angaben zu Initiierung oder Katalyse, Temperatur und erforderlicher Reaktionsführung begründen.

### Visualization

/assets/goal-visualizations/chemie/0559cec7-330b-57f1-a409-31cf1b4ac9fb/0559cec7-330b-57f1-a409-31cf1b4ac9fb.png

- original digest: `sha256:a365dd5136215e907e233acb738efc8d6be3dbb69983c6c44bb31703fe865a75`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Radikalische Polymerisation beschreiben — `6eb14e47-187c-5ba1-8b08-a0ee95ad88a9` (page 16)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Polykondensation verstehen — `9b942490-ad8f-52ba-8c5a-f8a9792b7db5` (outside this book)
- Polyadditionen analysieren (LK) — `f947cd04-952a-5a9d-9445-3ffc70e02c3c` (outside this book)

### Direct reverse prerequisites outside this book

- Drei Kunststoffsynthesen anhand ihrer Bedingungen vergleichen — `036701ad-a62f-5c91-bb68-9abc00802efb` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:fa1e3cba19e4167aa85b90a61b07f5d58cd9a38c8f6c70a4b131e45b0a46419a`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Jede der drei Synthesen wird mit passender Monomer-/Gruppenreaktion identifiziert.
  - Essential understanding (EN): Each of the three syntheses is identified with an appropriate monomer/group reaction.
  - Observable performance (DE): 1: R/K/A einschließlich aller drei Verknüpfungsreaktionen korrekt gegenübergestellt. 2: Alle drei Routen über C=C-, Amid- bzw. Urethanbildung korrekt gegenübergestellt, Nebenproduktunterschiede beachtet.
  - Observable performance (EN): 1: R/K/A correctly compared, including all three linkage reactions. 2: All three routes correctly compared through C=C, amide and urethane formation, respecting byproduct differences.
- `e2`
  - Essential understanding (DE): Initiierung oder Katalyse und Temperatur werden routenbezogen verglichen.
  - Essential understanding (EN): Initiation or catalysis and temperature are compared across routes.
  - Observable performance (DE): 1: Drei gegebene Temperaturfenster und Starter/Katalysatorrollen erklärt; Katalyse nicht als Gleichgewichtsverschiebung dargestellt. 2: Lichtstarter, gegebene A2-Katalyse und K2-HCl-Abfänger unterschieden; alle Temperaturangaben eingeordnet.
  - Observable performance (EN): 1: Three supplied temperature windows and initiator/catalyst roles explained; catalysis not presented as shifting equilibrium. 2: Light initiator, supplied A2 catalysis and K2 HCl scavenger distinguished; all temperatures interpreted.
- `e3`
  - Essential understanding (DE): Reaktionsführung wird aus Nebenprodukt, Feuchte und Wärme chemisch begründet.
  - Essential understanding (EN): Reaction control is chemically justified through byproduct, moisture and heat.
  - Observable performance (DE): 1: Sauerstoff-/Wärmekontrolle, Wasserabfuhr und trockene NCO/OH-Führung chemisch und vergleichend begründet. 2: Dunkelheit/HCl/Feuchte als drei unterschiedliche chemische Störungen begründet, einschließlich Wärme-/Phasenkontrolle.
  - Observable performance (EN): 1: Oxygen/heat control, water removal and dry NCO/OH control justified chemically and comparatively. 2: Darkness/HCl/moisture explained as distinct chemical perturbations, including heat/phase control.
- `e4`
  - Essential understanding (DE): Geänderte Beispiele widerlegen universelle Temperatur-/Katalysatorregeln.
  - Essential understanding (EN): Changed examples disprove universal temperature/catalyst rules.
  - Observable performance (DE): 1: Feuchte in A versus Produktwasser in K unterscheidet Nebenreaktion von Kondensationsgleichgewicht; keine universellen Klassenbedingungen. 2: Vergleich mit Fall1 widerlegt universelle Temperatur-/Katalysatorregeln; Mechanismus/Gruppenreaktion statt Temperatur als Typkriterium.
  - Observable performance (EN): 1: Moisture in A versus product water in K distinguishes side reaction from condensation equilibrium; no universal class conditions. 2: Comparison with case1 refutes universal temperature/catalyst rules; mechanism/group reaction rather than temperature used to classify type.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`, `e4`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `changed-condition`: Neuer Initiierungsweg und neuer Kondensationspartner erzwingen einen echten ganzen Drei-Routen-Vergleich. / New initiation route and condensation partner require a genuine complete three-route comparison.
- `independent-evidence-pieces`: Zwei vollständig bereitgestellte Angebotsfälle. Bewertet werden nachvollziehbare fachliche Leistungen einschließlich verändertem Fall. Zwei unabhängige Belegstücke können innerhalb eines reichen Falls liegen; keine zusätzliche Aufgabenquote. Modellantworten sind Autorenmaterial, keine Lernendenleistung. / Two complete offered cases. Assessment requires explained scientific performance including a changed case. Two independent evidence pieces may occur within one rich case; no extra task quota. Model answers are author material, not learner work.

**Application cases**

- `case-1`
  - Task demand (DE): Erstelle einen ausdrücklichen Vergleich aller drei Routen: Reaktionstyp, Gruppenreaktion/Verknüpfung, Initiierung bzw. Katalyse, Temperatur und Reaktionsführung. Begründe die Bedingungen chemisch. Unterscheide Starter von Katalysator und begründe, weshalb ein Katalysator allein die Gleichgewichtslage nicht verschiebt. Transfer: Für A wird das System feucht; für K wird die Wasserabfuhr unterbrochen. Sind die Folgen identisch? Begründe Unterschiede ohne eine vollständige Kinetik zu behaupten.
  - Task demand (EN): Explicitly compare all three routes by reaction type, group reaction/linkage, initiation or catalysis, temperature and reaction control. Justify the conditions chemically. Distinguish initiator from catalyst and explain why a catalyst alone does not shift equilibrium. Transfer: A becomes wet while K loses its water-removal step. Are the consequences identical? Explain differences without claiming complete kinetics.
  - Expected performance (DE): R ist radikalische Kettenpolymerisation: Starterzerfall erzeugt Radikale, Kettenwachstum verbraucht C=C;70°C dient dem gewählten Starter, Sauerstoff kann hemmen. K ist Polyester-Polykondensation: COOH/OH bilden Ester und H2O; gewählte Wärme/Katalyse fördern Umsetzung, Wasserabfuhr begünstigt Kondensation und hohe Umsetzung. A ist Polyaddition: NCO/OH bilden Urethan ohne kleines Hauptprodukt; trockenes System begrenzt Wassernebenreaktion, Wärmeabfuhr die Exothermie, Gruppenbilanz ermöglicht Kettenaufbau. Der Starter liefert reagierende Radikale; der Katalysator bietet einen günstigeren Reaktionsweg und beschleunigt die Gleichgewichtseinstellung, ändert bei gleicher Temperatur die Gleichgewichtskonstante nicht. Feuchte in A verbraucht NCO und kann CO2/Blasen erzeugen; fehlende Wasserabfuhr bei K verändert die Kondensationsbedingungen. Beide betreffen Wasser, aber verschiedene chemische Rollen. Die Beispiele belegen keine universelle Temperatur- oder Feuchteregel für die Klassen.
  - Expected performance (EN): R is radical chain polymerization: initiator decomposition generates radicals and chain growth consumes C=C;70°C serves the selected initiator and oxygen may inhibit. K is polyester polycondensation: COOH/OH form ester and H2O; chosen heat/catalysis promote conversion, while water removal favours condensation and high conversion. A is polyaddition: NCO/OH form urethane without a small main product; dryness limits water side reaction, heat removal controls exothermicity, and group balance permits chain formation. The initiator supplies reacting radicals; a catalyst offers a more favourable pathway and accelerates equilibrium approach without changing the equilibrium constant at fixed temperature. Moisture in A consumes NCO and can create CO2/bubbles; absent water removal in K changes condensation conditions. Water has different chemical roles. These examples establish no universal temperature or moisture rule for entire classes.
  - Understanding focus (DE): Die gleiche Störgröße Wasser besitzt in zwei Routen unterschiedliche chemische Rollen.
  - Understanding focus (EN): The same perturbation, water, has different chemical roles in two routes.
- `case-2`
  - Task demand (DE): Vergleiche erneut alle drei Routen vollständig hinsichtlich Gruppenreaktion, Initiierung/Katalyse, Temperatur und Reaktionsführung. Erläutere, warum20°C allein weder R2 noch K2 klassifiziert. Prüfe Änderungen: R2 bleibt dunkel; bei K2 wird die HCl-Abfangbase weggelassen; A2 enthält Wasser. Begründe jeweils die Folge aus der Chemie. Vergleiche die neuen Beispiele mit den heißen Beispielen aus Fall1 und korrigiere die Behauptung, Polykondensation brauche immer hohe Temperatur und Polyaddition immer denselben Katalysator.
  - Task demand (EN): Again compare all three routes fully by group reaction, initiation/catalysis, temperature and reaction control. Explain why20°C alone classifies neither R2 nor K2. Evaluate changes: R2 stays dark; K2 loses its HCl-scavenging base; A2 contains water. Explain each consequence chemically. Compare these examples with the hot examples in case1 and correct the claim that polycondensation always needs high temperature and polyaddition always uses the same catalyst.
  - Expected performance (DE): R2 ist lichtinitiierte radikalische Kettenpolymerisation über C=C, ohne kleines Abspaltungsprodukt. K2 ist Polykondensation über Amin-/Säurechloridgruppen zu Amid+HCl; Kontakt und HCl-Abfangung unterscheiden sich von heißer Polyesterbildung mit Wasserabfuhr. A2 ist NCO/OH-Polyaddition ohne kleines Haupt-Abspaltungsprodukt; Katalyse, Trockenheit und Wärmeführung betreffen dieses System. Im Dunkeln fehlt der vorgegebene Radikalstart; Temperatur allein ersetzt kein Licht. Ohne HCl-Abfangung kann Amin protoniert und als Nukleophil weniger verfügbar werden, die Führung verschlechtert sich. Wasser in A2 verbraucht NCO und erzeugt CO2 statt ausschließlich gewünschter Urethanverknüpfung. Gleiche20°C bedeuten nicht gleiche Reaktion; reaktive Gruppen und Bindungsänderungen klassifizieren die Route. Verschiedene Kondensations-/Additionsbeispiele benötigen verschiedene Bedingungen; keine universelle Temperatur oder einheitliche Katalysatoridentität folgt. Die Base in K2 ist als HCl-Abfänger, nicht pauschal als regenerierter Katalysator zu benennen.
  - Expected performance (EN): R2 is light-initiated radical chain polymerization through C=C, without a small eliminated product. K2 is polycondensation of amine/acid-chloride groups into amide+HCl; contact and HCl capture differ from hot polyester formation with water removal. A2 is NCO/OH polyaddition without a small main eliminated product; catalysis, dryness and heat control apply to this system. Darkness removes the supplied radical initiation; temperature alone cannot replace light. Without HCl capture, amine can become protonated and less available as a nucleophile, impairing control. Water in A2 consumes NCO and forms CO2 instead of exclusively desired urethane linking. Equal20°C does not imply equal reaction: reactive groups and bond changes classify the route. Different condensation/addition examples need different conditions; no universal temperature or common catalyst identity follows. The K2 base is an HCl scavenger, not automatically a regenerated catalyst.
  - Understanding focus (DE): Neuer Initiierungsweg und neuer Kondensationspartner erzwingen einen echten ganzen Drei-Routen-Vergleich.
  - Understanding focus (EN): New initiation route and condensation partner require a genuine complete three-route comparison.
## Page 18: Thermisches Verhalten von Kunststoffen erklären

- Full learning-goal ID: `3aef6d91-04ff-5ec7-b92e-ccf330d9816a`
- Goal fingerprint: `sha256:e45d3ac2112e94fc231f90bc73815c84ae2d6a116878fb4cf2a193f02fc22045`
- Page fingerprint: `sha256:858d11e8af258ebe85a1667239d21f2c2052c73596e0e9d12029d5afbb4d4bd3`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann das thermische Verhalten von Kunststoffen, Glasübergang und Schmelzpunkt aus räumlichem Bau der Makromoleküle und zwischenmolekularen Wechselwirkungen deuten.

### Visualization

/assets/goal-visualizations/chemie/3aef6d91-04ff-5ec7-b92e-ccf330d9816a/3aef6d91-04ff-5ec7-b92e-ccf330d9816a.png

- original digest: `sha256:d208d77814964a81861e232dcdae8afae2e093ec7d2c28230b60108f3b13d796`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Radikalische Polymerisation beschreiben — `6eb14e47-187c-5ba1-8b08-a0ee95ad88a9` (page 16)

### Direct reverse prerequisites

- Kunststoff-Verarbeitungsverfahren beschreiben — `6eba90b5-d4a6-5625-be61-e7f30f7eb964` (page 19)

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- HE-GK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)
- Werkstoffliches Recycling und Monomerrückgewinnung beurteilen — `459724db-9f9a-5967-8d9a-2b6277415275` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:2bd868aa90916e7dc3e3f2cb68921587c7299defb23087a855c4c06df8e2ded5`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Tg betrifft kooperative Segmentbeweglichkeit amorpher Anteile; Tm das Schmelzen kristalliner Bereiche.
  - Essential understanding (EN): Tg concerns cooperative segment mobility in amorphous fractions; Tm concerns melting crystalline regions.
  - Observable performance (DE): Ordnet Übergänge aus Daten und erklärt den Unterschied ohne Gleichsetzung von Tg und Tm.
  - Observable performance (EN): Identifies transitions from data and explains the difference without equating Tg and Tm.
- `e2`
  - Essential understanding (DE): Packung, intermolekulare Kräfte und kovalente Vernetzung beeinflussen thermische und mechanische Reaktionen.
  - Essential understanding (EN): Packing, intermolecular forces and covalent crosslinks affect thermal and mechanical responses.
  - Observable performance (DE): Erklärt Unterschiede eines amorphen, teilkristallinen und vernetzten Materials.
  - Observable performance (EN): Explains differences between amorphous, semicrystalline and crosslinked materials.
- `e3`
  - Essential understanding (DE): Nutzungstemperaturen müssen zu Materialzustand, Belastung und Zersetzungsgrenzen passen.
  - Essential understanding (EN): Service temperatures must match material state, loading and decomposition limits.
  - Observable performance (DE): Überträgt die Zustandsanalyse auf einen neuen Temperaturzyklus mit begründeter Einsatzgrenze.
  - Observable performance (EN): Transfers state analysis to a new temperature cycle with a justified service limit.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Amorph oder teilkristallin / Amorphous or semicrystalline
- `v2`: Übergang oder Zersetzung / Transition or decomposition
- `v3`: Temperaturzyklus / Temperature cycle

**Application cases**

- `3aef6d91-case-1`
  - Task demand (DE): Erkläre Beobachtungen und unterscheide Tg/Tm/Zersetzung. Wähle für wiederholtes thermisches Umformen und beurteile C bei 100°C. Ist B oberhalb Tg automatisch flüssig?
  - Task demand (EN): Explain observations and distinguish Tg, Tm and decomposition. Select for repeated thermal reshaping and assess C at 100°C. Is B automatically liquid above Tg?
  - Expected performance (DE): A über Tg segmentbeweglicher, kein Tm weil amorph; Umformen möglich, aber tatsächliche Viskosität/Belastung prüfen. B bleibt durch Kristallite bis Tm formfest, oberhalb Tg daher nicht automatisch flüssig. C über Tg kann gummiartig weicher sein, Netz verhindert Schmelzfluss; oberhalb 250°C Zersetzung. A/B thermoplastisch wiederverarbeitbar unter passendem Prozessfenster, C nicht einschmelzbar.
  - Expected performance (EN): A has greater segment mobility above Tg, with no Tm because it is amorphous; reshaping may be possible but requires viscosity/load data. B retains crystalline reinforcement until Tm and is not automatically liquid above Tg. C may soften rubber-like above Tg but its network prevents melt flow; above 250°C it decomposes. A/B may be reprocessed within appropriate windows; C cannot be remelted.
  - Understanding focus (DE): Fallbezogene Aspekte: Tg Segmentbeweglichkeit, Tm Kristallschmelzen, Zersetzung chemischer Abbau klar unterscheiden. / A amorph ohne Tm; B-Kristallite halten oberhalb Tg bis 130°C; C-Netz verhindert Fluss trotz Tg 40°C. / A/B nur im passenden Prozessfenster umformbar; C bei 100°C eventuell weicher, nicht einschmelzbar, Belastung prüfen. Die Verknüpfung zu Erwartungs-IDs behauptet keine vollständige Erfüllung jeder Gesamtprofilerwartung in diesem Einzelfall.
  - Understanding focus (EN): Case-specific aspects: Clearly distinguish Tg segment mobility, Tm crystal melting and chemical decomposition. / A amorphous without Tm; B crystals support above Tg to 130°C; C network prevents flow despite Tg 40°C. / A/B formable only in suitable process window; C at 100°C may soften, cannot remelt, test loading. Links to expectation IDs do not assert complete fulfilment of every whole-profile expectation in this one case.
- `3aef6d91-case-2`
  - Task demand (DE): Erkläre den Einfluss der Abkühlung. Wähle für den Zyklus und prognostiziere Verhalten bei 180°C im idealen Modell. Warum reicht gleicher Tg weder für gleiche Formstabilität noch für einen sicheren Prozess bei 210°C?
  - Task demand (EN): Explain cooling effects. Select for the cycle and predict behaviour at 180°C in the ideal model. Why does equal Tg prove neither equal shape stability nor a safe process at 210°C?
  - Expected performance (DE): Langsames Abkühlen erlaubt Kristallbildung; Q-Kristallite tragen bei 90°C, P ist oberhalb Tg stärker weich. Q vorläufig günstiger unter Last; Kriechen/Zyklen prüfen. Bei 180°C sind Q-Kristallite geschmolzen; beide brauchen Viskositätsdaten. Gleicher Tg beschreibt amorphe Segmente, nicht Kristallanteil; Zersetzung bei 210°C und Prozessdauer sind unbekannt.
  - Expected performance (EN): Slow cooling permits crystallisation; Q crystallites support load at 90°C while P softens more above Tg. Q is provisionally preferable, subject to creep/cycle tests. At 180°C Q crystallites have melted; both require viscosity data. Equal Tg describes amorphous segments, not crystal fraction; decomposition at 210°C and process duration are unknown.
  - Understanding focus (DE): Fallbezogene Aspekte: Gleiche Tg 60°C beweist nicht gleiche Kristallinität; Q-Kristalle schmelzen bei 170°C. / Langsame Abkühlung erlaubt Q-Kristallbildung; Stützung 90°C trotz beweglicher amorpher Segmente. / Q für 20→90→20 vorläufig; bei 180°C Kristalle weg, Kriechen/Viskosität und 210°C-Zersetzung ungetestet. Die Verknüpfung zu Erwartungs-IDs behauptet keine vollständige Erfüllung jeder Gesamtprofilerwartung in diesem Einzelfall.
  - Understanding focus (EN): Case-specific aspects: Same Tg 60°C does not establish equal crystallinity; Q crystals melt at 170°C. / Slow cooling permits Q crystallisation; support at 90°C despite mobile amorphous segments. / Q provisionally for 20→90→20; at 180°C crystals gone, creep/viscosity and 210°C decomposition untested. Links to expectation IDs do not assert complete fulfilment of every whole-profile expectation in this one case.
## Page 19: Kunststoff-Verarbeitungsverfahren beschreiben

- Full learning-goal ID: `6eba90b5-d4a6-5625-be61-e7f30f7eb964`
- Goal fingerprint: `sha256:98afcd0978d52897f8327602016470e3f4fb9eb7957ade37ab13f161349bf26a`
- Page fingerprint: `sha256:a844215fc5084499543352cd0c331e4e35c515aa6de4557413cabfc8e70a9a09`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann Verarbeitungsverfahren für Kunststoffe wie Spritzgießen, Tiefziehen, Kalandrieren und Extrudieren beschreiben und mit Materialeigenschaften verknüpfen.

### Visualization

/assets/goal-visualizations/chemie/6eba90b5-d4a6-5625-be61-e7f30f7eb964/6eba90b5-d4a6-5625-be61-e7f30f7eb964.jpg

- original digest: `sha256:8ddb5d3212c131ed2f8b39f9c2ba85bbb7c3c034a8ef2e829a9028e904948391`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Thermisches Verhalten von Kunststoffen erklären — `3aef6d91-04ff-5ec7-b92e-ccf330d9816a` (page 18)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Eigenschaftsprofile von Polymeren — `2652caef-b557-58b9-9b28-70db62625ce5` (outside this book)

### Direct reverse prerequisites outside this book

- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)
- Kunststoffprodukte mit passenden Verfahren formen — `fbd8d2c6-343d-55f4-839d-427ec712b389` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:fc4e3ffc1cd5e884e464c7a0a1f96d42be45f42261d6c0b7bbab5f1cb7870213`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Spritzgießen, Tiefziehen, Kalandrieren und Extrudieren unterscheiden Werkzeug, Ausgangsform und kontinuierliche/zyklische Formgebung.
  - Essential understanding (EN): Injection moulding, thermoforming, calendering and extrusion differ in tooling, starting form and continuous/cyclic shaping.
  - Observable performance (DE): Beschreibt alle vier Wege und ordnet geeignete Produktgeometrien begründet zu.
  - Observable performance (EN): Describes all four routes and assigns suitable product geometries with reasons.
- `e2`
  - Essential understanding (DE): Fließfähigkeit, Dehnbarkeit und thermisches Fenster müssen zur Methode passen.
  - Essential understanding (EN): Flowability, extensibility and thermal window must suit the method.
  - Observable performance (DE): Begründet Verfahrenswahl anhand gegebener Materialdaten und trennt Umformen von Zersetzung.
  - Observable performance (EN): Justifies process choice using supplied material data and distinguishes shaping from decomposition.
- `e3`
  - Essential understanding (DE): Geänderte Vernetzung oder Produktgeometrie kann eine Verfahrenswahl unbrauchbar machen.
  - Essential understanding (EN): Changed crosslinking or product geometry can invalidate a process choice.
  - Observable performance (DE): Überträgt die Auswahl auf neues Material oder neue Form und benennt notwendige Prozessprüfung.
  - Observable performance (EN): Transfers selection to a new material or shape and identifies a required process test.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Geometrie und Kontinuität / Geometry and continuity
- `v2`: Schmelze oder warme Folie / Melt or warm sheet
- `v3`: Vernetzung und Prozessfenster / Crosslinking and process window

**Application cases**

- `6eba90b5-case-1`
  - Task demand (DE): Ordne jedem Produkt ein Verfahren zu und beschreibe dessen Hauptschritte. Begründe Materialzustand/Temperatur und eine Kontrolle gegen Qualitätsfehler.
  - Task demand (EN): Assign a process to each product and describe its main steps. Justify material state/temperature and one control against quality defects.
  - Expected performance (DE): Verschluss: Schmelze in geschlossene Form spritzgießen, abkühlen/entformen. Becher: Folie warm tiefziehen mit Druck/Vakuum, abkühlen. Bahn: plastifiziertes Material zwischen Walzen kalandrieren. Schlauch: Schmelze kontinuierlich durch Ringdüse extrudieren, kühlen. Schmelzwege 180–210°C, Tiefziehen 100–130°C; 250°C meiden. Dicke, Abkühlung, Fließ-/Dehnverhalten prüfen, nicht Temperaturen blind übernehmen.
  - Expected performance (EN): Cap: inject melt into closed mould, cool/eject. Cup: pressure/vacuum thermoform warm sheet, then cool. Sheet: calender plasticised material through rollers. Tube: continuously extrude melt through an annular die, then cool. Melt routes 180–210°C; thermoforming 100–130°C; avoid 250°C. Check thickness, cooling and flow/stretch behaviour rather than blindly reusing temperatures.
  - Understanding focus (DE): Fallbezogene Aspekte: Verschluss Spritzguss, Folienbecher Tiefziehen, Bahn Kalandrieren, Schlauch Extrusion; Hauptschritte passend. / Schmelzwege 180–210°C, Folie 100–130°C, 250°C-Zersetzung vermeiden; Zustände unterscheiden. / Produktdicke/Abkühlung/Fließ- oder Dehnverhalten als konkrete Qualitätskontrolle, keine blind übernommene Temperatur. Die Verknüpfung zu Erwartungs-IDs behauptet keine vollständige Erfüllung jeder Gesamtprofilerwartung in diesem Einzelfall.
  - Understanding focus (EN): Case-specific aspects: Cap injection moulding, film cup thermoforming, sheet calendering, tube extrusion; appropriate main steps. / Melt routes 180–210°C, film 100–130°C, avoid 250°C decomposition; distinguish states. / Specific quality control through thickness/cooling/flow or stretching, not blindly adopted temperature. Links to expectation IDs do not assert complete fulfilment of every whole-profile expectation in this one case.
- `6eba90b5-case-2`
  - Task demand (DE): Beurteile Umformen des fertigen Netzes mit allen vier Verfahren. Schlage für den Vorläufer eine plausibel passende Formgebung mit anschließender Vernetzung vor und unterscheide dies von Tiefziehen.
  - Task demand (EN): Assess shaping the finished network using all four processes. Propose a plausible route for the precursor with subsequent crosslinking and distinguish it from thermoforming.
  - Expected performance (DE): Fertiges Netz kann nicht wie Thermoplast geschmolzen/injiziert/extrudiert oder warmfolienmäßig umgeformt werden; höheres Heizen führt zur Zersetzung. Vorläufer kontinuierlich durch Profildüse extrudieren, danach kontrolliert vernetzen, falls Reaktionszeit/Formstabilität passen. Tiefziehen formt eine vorhandene warme Folie in diskrete Form; Kalandrieren erzeugt Bahnen, Spritzgießen diskrete Formteile. Prozessfenster und Vernetzungskinetik noch prüfen.
  - Expected performance (EN): The finished network cannot be remelted/injected/extruded or thermoformed like a thermoplastic; more heat leads to decomposition. Continuously extrude precursor through a profile die, then crosslink under controlled conditions if reaction time and shape stability permit. Thermoforming reshapes existing warm sheet into a discrete form; calendering makes sheets and injection moulding discrete components. Verify processing window and crosslinking kinetics.
  - Understanding focus (DE): Fallbezogene Aspekte: Fertiges dichtes Netz fließt nicht; 240°C-Zersetzung liefert kein nutzbares Schmelzfenster. / Alle vier Wege im gegebenen Netzfall abgrenzen; Tiefziehen vorhandene Folie, Kalandrieren Bahn, Spritzguss für diskrete Formteile. / 190°C-Vorläufer durch Profildüse, danach Vernetzung bedingt auf Kinetik/Formhalt; keine Folien-Tiefziehroute. Die Verknüpfung zu Erwartungs-IDs behauptet keine vollständige Erfüllung jeder Gesamtprofilerwartung in diesem Einzelfall.
  - Understanding focus (EN): Case-specific aspects: Finished dense network does not flow; 240°C decomposition creates no usable melt window. / Differentiate all four routes for supplied network; thermoforming existing film, calendering sheet, injection discrete. / 190°C precursor through profile die, then crosslink conditional on kinetics/shape retention; no film-thermoforming route. Links to expectation IDs do not assert complete fulfilment of every whole-profile expectation in this one case.
## Page 20: Biobasierte PLA-Proben kontrolliert untersuchen

- Full learning-goal ID: `6fa55d29-9d79-5b80-92f2-01f9bb64ef35`
- Goal fingerprint: `sha256:9a1ea47ec62e33c32037d96d7cb0909e1310fdef9e74def0c401caa1e2330a6a`
- Page fingerprint: `sha256:e59b290abfaa97a97659f4f3e28a8dd3e4586354dce08ad5a432964833522737`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann eine unter fachlicher Aufsicht freigegebene Eigenschaftsuntersuchung an identifizierten biobasierten PLA-Proben planen und selbst durchführen, tatsächliche Rohdaten mit Einheiten und Unsicherheiten dokumentieren und aus dem kontrollierten Vergleich begrenzte Eigenschaftsaussagen ableiten, wobei Geometrie, Konditionierung und Zusammensetzung als mögliche Einflussgrößen sowie Rohstoffherkunft und biologischer Abbau unterschieden werden.

### Visualization

/assets/goal-visualizations/chemie/6fa55d29-9d79-5b80-92f2-01f9bb64ef35/6fa55d29-9d79-5b80-92f2-01f9bb64ef35.png

- original digest: `sha256:1b4835f863fb18ee94a9a61a2d7830315b74e581d782b0a6f1a186615541f8dd`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Allgemeine Sicherheitsregeln im Chemielabor anwenden — `13d4f336-ab16-54a7-9479-c920b458f385` (outside this book)

### Direct reverse prerequisites outside this book

- Einen kontrollierten PLA-Biegeversuch selbst durchführen — `8a281a5b-fa13-5873-a15a-a4a0c8d6cfa1` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:35cfdc42ce786a145e8191774bc45063bae98ab6d9fbaba659a4a40cd0e7fdde`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `experiment`

**Positive understanding expectations**

- `plan-and-real-execution`
  - Essential understanding (DE): Kontrollierter Versuchsplan, reale Freigabe und eigene beobachtbare Durchführung; keine Musterdaten ersetzen Rohdaten.
  - Essential understanding (EN): Controlled plan, actual release and observable own execution; model data never replace raw readings.
  - Observable performance (DE): Plane und begründe Messgröße, unabhängige Variable und Konstanten. Führe den freigegebenen Vergleich selbst durch. Dokumentiere reale Rohwerte samt Einheit, Wiederholbarkeit, Unsicherheit und Abweichungen; zeichne Aufbau und eigene Ergebnisdarstellung. Erkläre Geometrie/Werkstoffeigenschaft und prüfe, welche Herkunftsaussage der reale Nachweis trägt.
  - Observable performance (EN): Plan and justify measurement, independent variable and constants. Actually perform the approved comparison yourself. Record real raw values with units, repeatability, uncertainty and deviations; draw setup and own results. Explain geometry/material property and assess which provenance claim actual documentation supports.
- `data-and-bounded-property`
  - Essential understanding (DE): Größere Dicke kann unter sonst gleichen Bedingungen die Biegesteifigkeit erhöhen; tatsächliche Richtung/Größe folgt nur aus eigenen Daten. Durchbiegung allein beweist weder chemisch anderes Material noch biologischen Abbau. Biobasiert beschreibt Herkunft, nicht schnellen Gewässerabbau. Modellzahlen dürfen nicht als eigene Beobachtung dienen.
  - Essential understanding (EN): Greater thickness can increase bending stiffness under otherwise equal conditions; actual direction/magnitude must come from own data. Deflection proves neither different chemistry nor biodegradation. Biobased describes provenance, not rapid degradation in water. Model numbers cannot stand in for own observations.
  - Observable performance (DE): Größere Dicke kann unter sonst gleichen Bedingungen die Biegesteifigkeit erhöhen; tatsächliche Richtung/Größe folgt nur aus eigenen Daten. Durchbiegung allein beweist weder chemisch anderes Material noch biologischen Abbau. Biobasiert beschreibt Herkunft, nicht schnellen Gewässerabbau. Modellzahlen dürfen nicht als eigene Beobachtung dienen.
  - Observable performance (EN): Greater thickness can increase bending stiffness under otherwise equal conditions; actual direction/magnitude must come from own data. Deflection proves neither different chemistry nor biodegradation. Biobased describes provenance, not rapid degradation in water. Model numbers cannot stand in for own observations.
- `independent-confounder-transfer`
  - Essential understanding (DE): Nein, Zusammensetzung/Konditionierung sind Störgrößen. Gleiche Charge/Konditionierung oder kontrollierter Faktorvergleich nötig; ohne Daten bleibt die Kausalzuordnung offen.
  - Essential understanding (EN): No, composition/conditioning are confounders. Matched batch/conditioning or controlled factor comparison is needed; causal attribution remains unresolved without data.
  - Observable performance (DE): Neue Probe ist dicker, anders konditioniert und enthält unbekannten Weichmacher. Darf die Durchbiegung allein der Dicke zugeschrieben werden? Entwirf kontrollierte Verbesserung; kein zusätzlicher realer Durchlauf allein wegen dieser Variation verlangt.
  - Observable performance (EN): New sample is thicker, conditioned differently and contains unknown plasticizer. May deflection be attributed only to thickness? Design a controlled improvement; this variation alone imposes no extra physical trial.

**Coverage expectations**

- required expectations: `plan-and-real-execution`, `data-and-bounded-property`, `independent-confounder-transfer`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `conditioning-geometry-composition`: Neue Probe ist dicker, anders konditioniert und enthält unbekannten Weichmacher. Darf die Durchbiegung allein der Dicke zugeschrieben werden? Entwirf kontrollierte Verbesserung; kein zusätzlicher realer Durchlauf allein wegen dieser Variation verlangt. / New sample is thicker, conditioned differently and contains unknown plasticizer. May deflection be attributed only to thickness? Design a controlled improvement; this variation alone imposes no extra physical trial.

**Application cases**

- `actual-controlled-pla-investigation`
  - Task demand (DE): curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current442-five-P-scope-operator-remediation-author-20261018-v1/AUTHOR.complete-DE-EN-material-routes.pending.json#/materials/2. Plane und begründe Messgröße, unabhängige Variable und Konstanten. Führe den freigegebenen Vergleich selbst durch. Dokumentiere reale Rohwerte samt Einheit, Wiederholbarkeit, Unsicherheit und Abweichungen; zeichne Aufbau und eigene Ergebnisdarstellung. Erkläre Geometrie/Werkstoffeigenschaft und prüfe, welche Herkunftsaussage der reale Nachweis trägt.
  - Task demand (EN): curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current442-five-P-scope-operator-remediation-author-20261018-v1/AUTHOR.complete-DE-EN-material-routes.pending.json#/materials/2. Plan and justify measurement, independent variable and constants. Actually perform the approved comparison yourself. Record real raw values with units, repeatability, uncertainty and deviations; draw setup and own results. Explain geometry/material property and assess which provenance claim actual documentation supports.
  - Expected performance (DE): Größere Dicke kann unter sonst gleichen Bedingungen die Biegesteifigkeit erhöhen; tatsächliche Richtung/Größe folgt nur aus eigenen Daten. Durchbiegung allein beweist weder chemisch anderes Material noch biologischen Abbau. Biobasiert beschreibt Herkunft, nicht schnellen Gewässerabbau. Modellzahlen dürfen nicht als eigene Beobachtung dienen.
  - Expected performance (EN): Greater thickness can increase bending stiffness under otherwise equal conditions; actual direction/magnitude must come from own data. Deflection proves neither different chemistry nor biodegradation. Biobased describes provenance, not rapid degradation in water. Model numbers cannot stand in for own observations.
  - Understanding focus (DE): Eigene tatsächliche Untersuchung und begrenzte Datenaussage.
  - Understanding focus (EN): Actual personal investigation and bounded interpretation.
- `pla-confounder-fresh-transfer`
  - Task demand (DE): Neue Probe ist dicker, anders konditioniert und enthält unbekannten Weichmacher. Darf die Durchbiegung allein der Dicke zugeschrieben werden? Entwirf kontrollierte Verbesserung; kein zusätzlicher realer Durchlauf allein wegen dieser Variation verlangt.
  - Task demand (EN): New sample is thicker, conditioned differently and contains unknown plasticizer. May deflection be attributed only to thickness? Design a controlled improvement; this variation alone imposes no extra physical trial.
  - Expected performance (DE): Nein, Zusammensetzung/Konditionierung sind Störgrößen. Gleiche Charge/Konditionierung oder kontrollierter Faktorvergleich nötig; ohne Daten bleibt die Kausalzuordnung offen.
  - Expected performance (EN): No, composition/conditioning are confounders. Matched batch/conditioning or controlled factor comparison is needed; causal attribution remains unresolved without data.
  - Understanding focus (DE): Störgrößen sind eigenständig zu begründen; kein zusätzlicher realer Versuch allein wegen der Variation.
  - Understanding focus (EN): Explain confounders independently; the variation alone requires no extra physical trial.
