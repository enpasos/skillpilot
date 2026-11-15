# AI review input: Mathematik: Elementare Tabellen- und Diagrammziele mit gesichertem aktuellen Wissenskontext

- Book ID: `de-gym-math-k2-elementary-representations-current-20261115-v1`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:4c602f7d633b549266e1ae5acf04c30dea9037a3c5c716982d961609f25ff12c`
- Selected goals: 4

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Tabellen erstellen und beschriften

- Full learning-goal ID: `f39c49c7-003b-471a-a33e-6cfea1d7b7b1`
- Goal fingerprint: `sha256:0afeeb0f58b616dcb851fea59313b6fed94505612e9902c2ea99740161090c34`
- Page fingerprint: `sha256:eae109797eb814e82bf7c6b817075805134411db0e136977b72fbbd86e3fa1c4`
- Topic path: Mathematik > Bundeslandspezifische Ergänzungen > Sekundarstufe I > Analysis und Funktionen

### Canonical description

Die lernende Person kann in einfachen Zuordnungs- und Sachkontexten Tabellen erstellen, Zeilen und Spalten passend beschriften und Einheiten korrekt angeben.

### Visualization

/assets/goal-visualizations/mathematik/f39c49c7-003b-471a-a33e-6cfea1d7b7b1/f39c49c7-003b-471a-a33e-6cfea1d7b7b1.jpg

- original digest: `sha256:d211d7ff5e51e946a197b08753026d92f800420a83f5c1272a01de414b0ed92e`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Rationale Zahlen an der Zahlengeraden darstellen und ordnen — `f6b13b8e-1ecd-5420-905d-21290aa996a6` (outside this book)

### Direct reverse prerequisites outside this book

- Tabellen aus Messnotizen und Kategorien erstellen — `54ce7136-5bdd-5d36-b0a5-f9a781bff82a` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:a64360c832898480f42bd224336ec9d56a0c943e8a3b173c5de90b2a0476d2cb`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `paired-data-structure`
  - Essential understanding (DE): Eine Tabelle ordnet zu jeder Eingabe oder Kategorie genau den dazugehörigen Sachwert; Überschrift sowie Zeilen- und Spaltenordnung machen diese Zuordnung lesbar.
  - Essential understanding (EN): A table pairs each input or category with its corresponding contextual value; its title and row-column arrangement make the pairing readable.
  - Observable performance (DE): Die lernende Person überführt neue unsortierte Sachangaben in eine geordnete Tabelle, hält jedes Wertepaar zusammen und ergänzt eine zum Inhalt passende Überschrift.
  - Observable performance (EN): The learner turns fresh unordered contextual statements into an ordered table, keeps each value pair intact, and gives the table a fitting title.
- `labels-and-units`
  - Essential understanding (DE): Spalten- oder Zeilenköpfe benennen die dargestellten Größen; eine Einheit gehört zur messbaren Größe und nicht wahllos an jede Zahl oder Kategorie.
  - Essential understanding (EN): Row or column headers name the represented quantities; a unit belongs to a measurable quantity, not indiscriminately to every number or category.
  - Observable performance (DE): Die lernende Person beschriftet beide Größen eindeutig, trägt Stunden und Kilometer beziehungsweise Personen nur an den passenden Stellen ein und erläutert, was eine Tabellenzeile aussagt.
  - Observable performance (EN): The learner labels both quantities unambiguously, attaches hours and kilometres or people only where appropriate, and explains what one table row states.

**Coverage expectations**

- required expectations: `paired-data-structure`, `labels-and-units`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `data-kind`: zeitlich geordnete Messpaare gegenüber Kategorien mit Häufigkeiten / time-ordered measurement pairs versus categories with counts
- `unit-placement`: zwei messbare Größen gegenüber Kategorie ohne Einheit und Anzahl mit Einheit Personen / two measurable quantities versus a unitless category and a count measured in people

**Application cases**

- `bike-trip-notes`
  - Task demand (DE): Für eine Radtour liegen ungeordnete Notizen vor: nach 2 h 29 km, zu Beginn 0 km, nach 1 h 14 km. Erstelle eine gut beschriftete Tabelle mit Überschrift und erkläre die Zeile zu 2 h.
  - Task demand (EN): Unordered cycling notes say: 29 km after 2 h, 0 km at the start, 14 km after 1 h. Create a clearly labelled table with a title and explain the 2 h row.
  - Expected performance (DE): Die Tabelle ordnet Zeit t in h den Strecken s in km als (0,0), (1,14), (2,29) zu; eine Überschrift benennt die Radtour. Die letzte Zeile bedeutet 29 km nach 2 h, nicht 29 km/h.
  - Expected performance (EN): The table pairs time t in h with distance s in km as (0,0), (1,14), (2,29), with a title identifying the ride. The final row means 29 km after 2 h, not 29 km/h.
  - Understanding focus (DE): Wertepaare aus Notizen erhalten, ordnen und mit zwei Einheiten beschriften.
  - Understanding focus (EN): Preserving and ordering pairs from notes with two distinct units.
- `school-club-survey`
  - Task demand (DE): In einer AG-Umfrage wählen 8 Personen Theater, 11 Musik und 6 Robotik. Stelle diese Angaben als Tabelle dar, beschrifte Kategorien und Anzahlen passend und erkläre, weshalb die AG-Namen keine physikalische Einheit bekommen.
  - Task demand (EN): In a school-club survey, 8 people choose drama, 11 music and 6 robotics. Present the data as a table, label categories and counts appropriately, and explain why club names have no physical unit.
  - Expected performance (DE): Eine Tabelle mit Überschrift enthält AG und Anzahl in Personen, die drei korrekten Zuordnungen Theater–8, Musik–11, Robotik–6. Nur die Anzahl erhält die Einheit Personen; AG-Namen sind Kategorien.
  - Expected performance (EN): A titled table contains club and count in people, correctly pairing drama–8, music–11 and robotics–6. Only the count is measured in people; club names are categories.
  - Understanding focus (DE): Transfer von Messpaaren auf Kategorien mit einer einzigen sinnvollen Einheit.
  - Understanding focus (EN): Transfer from measurement pairs to categories with only one meaningful unit.
## Page 2: Informationen aus Tabellen entnehmen

- Full learning-goal ID: `c9df47fa-81a9-4890-91b7-2cc80da813cb`
- Goal fingerprint: `sha256:2cae5f71654528b07aef69e98a849eaac5230b4fa9538bd4376e969788d31ca9`
- Page fingerprint: `sha256:38e3547e4507b933f6b2094ac810e922e8d4d2946d3a1c4acd8ad2cba3b472bb`
- Topic path: Mathematik > Bundeslandspezifische Ergänzungen > Sekundarstufe I > Analysis und Funktionen

### Canonical description

Die lernende Person kann aus einfachen Tabellen Werte ablesen, Vergleiche anstellen und Zusammenhänge in Worten beschreiben.

### Visualization

/assets/goal-visualizations/mathematik/c9df47fa-81a9-4890-91b7-2cc80da813cb/c9df47fa-81a9-4890-91b7-2cc80da813cb.jpg

- original digest: `sha256:f88513575b99466e13cf7b40109f577bae5a14da79bd8e7a78d2e95bfa8ec469`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Rationale Zahlen an der Zahlengeraden darstellen und ordnen — `f6b13b8e-1ecd-5420-905d-21290aa996a6` (outside this book)
- Rationale Zahlen addieren und subtrahieren — `4eeab7d5-eeb3-579b-845e-1c52ffe9e89f` (outside this book)

### Direct reverse prerequisites outside this book

- Tabellenwerte vergleichen und Aussagen begrenzen — `148a0b27-5895-5331-ab90-bf40c0ee5d5c` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:1b8d6610cb2db4df1c84291cc974b2d85530ed70a13c82b727e55ec726127d4a`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `read-and-compare-table-values`
  - Essential understanding (DE): Ein Tabellenwert gehört zu seiner Zeilen- und Spaltenbeschriftung; ein Vergleich bezieht sich auf die dort angegebenen Größen und Einheiten.
  - Essential understanding (EN): A table value belongs to its row and column labels; a comparison refers to the quantities and units shown there.
  - Observable performance (DE): Die lernende Person liest in einer neuen einfachen Tabelle angefragte Werte korrekt ab, vergleicht zwei Einträge mit passender Differenz oder Ordnung und nennt die Einheit.
  - Observable performance (EN): In a fresh simple table, the learner reads requested values accurately, compares two entries using a suitable difference or ordering, and states the unit.
- `describe-supported-relationship`
  - Essential understanding (DE): Ein Zusammenhang in Worten beschreibt das erkennbare Muster der vorliegenden Zeilen; einzelne Werte belegen die Aussage, ohne mehr über nicht gezeigte Werte zu behaupten.
  - Essential understanding (EN): A verbal relationship describes a pattern in the available rows; actual values support it without asserting more about unseen values.
  - Observable performance (DE): Die lernende Person formuliert zu den tabellierten Paaren eine zutreffende Entwicklung oder Zuordnung und stützt sie mit mindestens zwei konkreten Einträgen.
  - Observable performance (EN): The learner states a correct trend or mapping for the tabulated pairs and supports it using at least two concrete entries.

**Coverage expectations**

- required expectations: `read-and-compare-table-values`, `describe-supported-relationship`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `relationship-shape`: nichtmonotone Zeitreihe gegenüber gleichmäßig steigender Mengenzuordnung / non-monotonic time series versus steadily increasing quantity mapping
- `table-meaning`: Temperaturverlauf gegenüber Preis für Flaschenzahlen / temperature over time versus price by bottle count

**Application cases**

- `aquarium-temperature`
  - Task demand (DE): Eine Tabelle zeigt für 8, 12 und 16 Uhr die Aquariumtemperaturen 21 °C, 23 °C und 22 °C. Lies den höchsten Wert mit Zeitpunkt ab, vergleiche 8 und 12 Uhr und beschreibe den Verlauf in Worten.
  - Task demand (EN): A table shows aquarium temperatures of 21 °C, 23 °C and 22 °C at 8, 12 and 16 o'clock. Read the highest value and its time, compare 8 with 12 o'clock, and describe the trend in words.
  - Expected performance (DE): Um 12 Uhr sind es 23 °C, also 2 °C mehr als um 8 Uhr; danach sinkt der Tabellenwert bis 16 Uhr auf 22 °C. Die Aussage beschränkt sich auf die dargestellten Zeitpunkte.
  - Expected performance (EN): The maximum shown is 23 °C at 12 o'clock, 2 °C above the 8 o'clock value; the tabulated value then drops to 22 °C at 16 o'clock. The statement concerns the shown times.
  - Understanding focus (DE): Ablesen und begrenzte, nicht monotone Sachdeutung.
  - Understanding focus (EN): Reading values and interpreting a bounded, non-monotonic trend.
- `bottle-price-mapping`
  - Task demand (DE): Eine andere Tabelle ordnet 1, 2, 3 und 4 Flaschen die Preise 2 €, 4 €, 6 € und 8 € zu. Vergleiche 2 und 4 Flaschen und beschreibe mit Tabellenbelegen den Zusammenhang.
  - Task demand (EN): Another table pairs 1, 2, 3 and 4 bottles with prices of €2, €4, €6 and €8. Compare 2 and 4 bottles and describe the relationship using entries from the table.
  - Expected performance (DE): 2 Flaschen kosten 4 €, 4 Flaschen 8 €; der Unterschied beträgt 4 €. In den gezeigten Paaren verdoppelt sich der Preis bei Verdoppelung der Flaschenzahl, etwa 1→2 und 2→4.
  - Expected performance (EN): Two bottles cost €4 and four cost €8, a difference of €4. In the shown pairs the price doubles when the bottle count doubles, for example 1→2 and 2→4.
  - Understanding focus (DE): Transfer auf eine Zuordnung mit konstantem Preis pro Stück statt Zeitverlauf.
  - Understanding focus (EN): Transfer to a constant-price-per-item mapping rather than a time series.
## Page 3: Diagramme lesen

- Full learning-goal ID: `5e7d5ff2-b92c-4989-85bc-8d87ad7edadd`
- Goal fingerprint: `sha256:d360e7a48a24e5ab09b55121d193eba385abb641190a5564ae43902b5c5fa9eb`
- Page fingerprint: `sha256:cd880f35566e23bded5962c8c597474525299c4e598c70fce2b417075d6c3904`
- Topic path: Mathematik > Bundeslandspezifische Ergänzungen > Sekundarstufe I > Analysis und Funktionen

### Canonical description

Die lernende Person kann in einfachen Diagrammen Achsen, Beschriftungen, Einheiten und Werte sicher ablesen.

### Visualization

/assets/goal-visualizations/mathematik/5e7d5ff2-b92c-4989-85bc-8d87ad7edadd/5e7d5ff2-b92c-4989-85bc-8d87ad7edadd.jpg

- original digest: `sha256:42391e707ce27f79b4d562b43858078dd801bc58f5f571de066f89472246c3f6`
- QA status: `approved`
- approved for public publication: `true`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Diagramme deuten — `0c2ddfcd-1399-41ad-aaed-4f061812602a` (page 4)

### Prerequisites outside this book

- Rationale Zahlen an der Zahlengeraden darstellen und ordnen — `f6b13b8e-1ecd-5420-905d-21290aa996a6` (outside this book)

### Direct reverse prerequisites outside this book

- Diagramme mit Dezimalskalen und Kategorien lesen — `4f265904-c805-57c3-8b40-25a1d32c7e7f` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:81b855bd7930bf9b862cdf5cc9afe23d4ada60cd3262d4ca58b6c8cc437979de`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `axes-units`
  - Essential understanding (DE): Eine Diagrammachse benennt die dargestellte Größe; Beschriftung und Einheit bestimmen, was ein abgelesener Zahlenwert bedeutet.
  - Essential understanding (EN): A diagram axis names the represented quantity; label and unit determine the meaning of a read value.
  - Observable performance (DE): Die lernende Person benennt in einem neuen Diagramm beide Achsen, die relevante Einheit und die Bedeutung eines einzelnen Koordinaten- oder Balkenwerts.
  - Observable performance (EN): In a fresh diagram, the learner names both axes, the relevant unit and the meaning of one coordinate or bar value.
- `scale-read`
  - Essential understanding (DE): Ein Wert wird an der skalierten Achse und der passenden Kategorie oder Position abgelesen, nicht aus der bloßen Bildhöhe geschätzt.
  - Essential understanding (EN): A value is read using the scaled axis and corresponding category or position, not guessed from visual height alone.
  - Observable performance (DE): Die lernende Person liest mehrere markierte Werte an einer ausdrücklich angegebenen Skala ab und gibt sie mit Einheit an.
  - Observable performance (EN): The learner reads several marked values from an explicit scale and gives them with units.

**Coverage expectations**

- required expectations: `axes-units`, `scale-read`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `diagram-type-scale`: kategoriales Balkendiagramm mit Zweierschritten gegenüber zeitlichem Liniendiagramm mit Grad-Celsius-Achse / categorical bar chart in steps of two versus time-series line chart with a degrees-Celsius axis

**Application cases**

- `library-bars`
  - Task demand (DE): Lege ein einfaches Balkendiagramm zu ausgeliehenen Büchern vor: x-Achse Mo/Di/Mi, y-Achse Bücher in Zweierschritten, Balken bei 4/8/6. Frage nach Achsen, Einheit und den Werten für Di und Mi.
  - Task demand (EN): Present a simple bar chart of borrowed books: x-axis Mon/Tue/Wed, y-axis books in steps of two, bars at 4/8/6. Ask for axes, unit and the values for Tue and Wed.
  - Expected performance (DE): Die x-Achse nennt die Wochentage, die y-Achse die Anzahl ausgeliehener Bücher; Di=8 Bücher und Mi=6 Bücher werden an der Zweierskala abgelesen.
  - Expected performance (EN): The x-axis gives weekdays, the y-axis the number of borrowed books; Tue=8 books and Wed=6 books are read from the two-unit scale.
  - Understanding focus (DE): Achsenbedeutung und diskrete Skala verknüpfen.
  - Understanding focus (EN): Linking axis meaning and discrete scale.
- `temperature-line`
  - Task demand (DE): Lege ein Liniendiagramm mit x-Achse Zeit in Minuten (0, 5, 10), y-Achse Temperatur in °C (Zweierschritte) und Punkten (0,20), (5,18), (10,16) vor. Frage nach Einheiten und den Messwerten bei 5 und 10 Minuten.
  - Task demand (EN): Present a line chart with time in minutes (0, 5, 10) on x, temperature in °C in steps of two on y, and points (0,20), (5,18), (10,16). Ask for units and readings at 5 and 10 minutes.
  - Expected performance (DE): x bezeichnet Minuten, y Grad Celsius; bei 5 Minuten werden 18 °C und bei 10 Minuten 16 °C abgelesen. Es wird nicht nur eine Höhe ohne Einheit genannt.
  - Expected performance (EN): x denotes minutes, y degrees Celsius; the readings are 18 °C at 5 minutes and 16 °C at 10 minutes, not unlabeled visual heights.
  - Understanding focus (DE): Positions- und Wertachse einer anderen Diagrammart sicher lesen.
  - Understanding focus (EN): Reading position and value axes in a different diagram type.
## Page 4: Diagramme deuten

- Full learning-goal ID: `0c2ddfcd-1399-41ad-aaed-4f061812602a`
- Goal fingerprint: `sha256:1f35bdd0fdeb1e323839fe9b3bd004dd894bd0a14a228ba9fededc72c35fa2e9`
- Page fingerprint: `sha256:c8f8c0097101eb01d62ccb8dcd0ecc6e3e102a47868da6a44f12fa74ae84ba35`
- Topic path: Mathematik > Bundeslandspezifische Ergänzungen > Sekundarstufe I > Analysis und Funktionen

### Canonical description

Die lernende Person kann aus einfachen Diagrammen Auffälligkeiten, Vergleiche und erste Trends beschreiben und in Worte fassen.

### Visualization

/assets/goal-visualizations/mathematik/0c2ddfcd-1399-41ad-aaed-4f061812602a/0c2ddfcd-1399-41ad-aaed-4f061812602a.jpg

- original digest: `sha256:8090330079dfc1c4ec5752b0991a13bde32b0a95b2e820c8cea7722930284f2f`
- QA status: `approved`
- approved for public publication: `true`

### Direct prerequisites

- Diagramme lesen — `5e7d5ff2-b92c-4989-85bc-8d87ad7edadd` (page 3)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Rationale Zahlen addieren und subtrahieren — `4eeab7d5-eeb3-579b-845e-1c52ffe9e89f` (outside this book)

### Direct reverse prerequisites outside this book

- Aufgabe 6 (Jahrgangsstufe 6, 6 BE) — `47c515c9-2174-58c7-a844-6865fc67c243` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:c0f7073ef25fe7f2623d3e8d129106de09376a3ee82707ffea13127e9da62b59`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `grounded-comparison`
  - Essential understanding (DE): Eine Auffälligkeit oder ein Vergleich im Diagramm muss durch konkrete Kategorien und abgelesene Werte gestützt sein.
  - Essential understanding (EN): A notable feature or comparison in a diagram must be supported by concrete categories and read values.
  - Observable performance (DE): Die lernende Person nennt einen höchsten oder niedrigen Wert sowie einen bezifferten Vergleich und verweist jeweils auf die dargestellten Daten.
  - Observable performance (EN): The learner identifies a highest or lowest value and a quantified comparison, referring to the plotted data in each case.
- `bounded-trend`
  - Essential understanding (DE): Ein erster Trend beschreibt den Verlauf im dargestellten Bereich und lässt Zwischenrückgänge zu; er behauptet keine Ursache oder sichere Fortsetzung.
  - Essential understanding (EN): An initial trend describes the displayed interval and may include local dips; it asserts neither a cause nor guaranteed continuation.
  - Observable performance (DE): Die lernende Person beschreibt die Richtung eines mehrteiligen Verlaufs in Worten und benennt eine Abweichung vom Gesamttrend.
  - Observable performance (EN): The learner describes the direction of a multi-part series in words and identifies a departure from the overall trend.

**Coverage expectations**

- required expectations: `grounded-comparison`, `bounded-trend`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `representation-pattern`: Vergleich von Kategorien im Balkendiagramm gegenüber zeitlichem Verlauf mit lokalem Rückgang / comparison of categories in a bar chart versus a time series with a local decline

**Application cases**

- `club-bars`
  - Task demand (DE): Ein Balkendiagramm zeigt Anmeldungen A=6, B=9, C=4, D=7. Beschreibe eine Auffälligkeit und vergleiche B und C mit Zahl und Einheit.
  - Task demand (EN): A bar chart shows registrations A=6, B=9, C=4, D=7. Describe a notable feature and compare B and C with number and unit.
  - Expected performance (DE): B ist mit 9 Anmeldungen am höchsten, C mit 4 am niedrigsten; B hat 5 Anmeldungen mehr als C. Die Aussagen sind unmittelbar aus den Balken gestützt.
  - Expected performance (EN): B is highest with 9 registrations and C lowest with 4; B has 5 more registrations than C. The statements are supported directly by the bars.
  - Understanding focus (DE): Vergleich an ausgewiesenen Daten statt bloßem Eindruck.
  - Understanding focus (EN): Comparison grounded in shown data rather than visual impression.
- `weekly-visits`
  - Task demand (DE): Ein Liniendiagramm zeigt 40, 50, 45, 60, 55 Besuche von Montag bis Freitag. Beschreibe Gesamtverlauf, ein Maximum und einen Gegenlauf, ohne Aussagen über Ursachen oder nächste Woche.
  - Task demand (EN): A line chart shows 40, 50, 45, 60, 55 visits from Monday to Friday. Describe overall course, a maximum and a local reversal without claims about causes or next week.
  - Expected performance (DE): Von Montag 40 bis Freitag 55 ist der Verlauf insgesamt höher, aber von Dienstag 50 auf Mittwoch 45 und Donnerstag 60 auf Freitag 55 gibt es Rückgänge; Donnerstag ist mit 60 das Maximum.
  - Expected performance (EN): From Monday's 40 to Friday's 55 the overall level rises, but Tuesday 50 to Wednesday 45 and Thursday 60 to Friday 55 are declines; Thursday is highest at 60.
  - Understanding focus (DE): Vorsichtigen Trend und lokale Ausnahmen zugleich ausdrücken.
  - Understanding focus (EN): Expressing a cautious overall trend and local exceptions together.
