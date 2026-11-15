# AI review input: Physik – drei aktuelle Zieltexte und ihr vollständiger Kontext

- Book ID: `physics-three-current809-context-20261115-v1`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:f10841d0c888555d7a10e139392d2d1c73561bc17eb8c5d825f2d89696e85c51`
- Selected goals: 3

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Signifikante Stellen korrekt verwenden

- Full learning-goal ID: `b615830a-e8b0-5754-81e0-99da98343a8d`
- Goal fingerprint: `sha256:b7fd41467577af57ba1137045b65bf277b264c84ee55810adae49bd0209153ba`
- Page fingerprint: `sha256:b7d814823e4a07713dcd0448abe040eef04af90f40dad40f44a190b6bbc411cc`
- Topic path: Drei aktuelle Physikziele – vollständiger Kontext

### Canonical description

Die lernende Person kann Rechenergebnisse passend zur angegebenen Genauigkeit beziehungsweise Unsicherheit der Eingangsdaten auf eine sinnvolle Zahl signifikanter Stellen runden, Zwischenwerte mit ausreichender Genauigkeit weiterführen und Scheingenauigkeit vermeiden.

### Visualization

/assets/goal-visualizations/physik/b615830a-e8b0-5754-81e0-99da98343a8d/b615830a-e8b0-5754-81e0-99da98343a8d.jpg

- original digest: `sha256:d20e4a338de4a5fe369bbb9bdd68eb819bb58b67c4127630d8d4d985db2fa022`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Messunsicherheiten angeben — `f6b1d812-ce8b-5852-b417-e6c29b533c7a` (outside this book)
- Terme mit rationalen Zahlen strukturiert auswerten — `0a6dab2e-1bbb-5587-adb0-456d3991c327` (outside this book)

### Direct reverse prerequisites outside this book

- Messmethoden und Datenanalyse in Aufgaben anwenden — `0432a422-401b-5134-bf08-05cfd8c7a366` (outside this book)
- Prüfungsaufgabe: Messreihen, Unsicherheit und Gerätewahl — `0521c3ce-999b-5b35-bb3c-7042f24a30ce` (outside this book)
- E-Phase-Klausuraufgaben Physik selbstständig lösen — `7f83e25c-38f7-5ac2-8f9c-ec54eeef1026` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:877f008bc812b8e8b02e4d89ab9455b956db803fcd43429efef3ecf42f87af71`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `precision-supported-by-input-data`
  - Essential understanding (DE): Ein Ergebnis darf keine höhere Genauigkeit vortäuschen, als die angegebenen Messwerte oder Unsicherheiten stützen. Bei Produkten und Quotienten begrenzt im einfachen Schulmodell typischerweise die kleinste Zahl signifikanter Stellen; ausdrücklich angegebene Unsicherheiten haben Vorrang vor einer bloßen Zählregel.
  - Essential understanding (EN): A result must not imply greater precision than the stated measurements or uncertainties support. For products and quotients in the simple classroom model, the smallest number of significant figures typically limits the result; explicitly stated uncertainties take precedence over a mere counting rule.
  - Observable performance (DE): Die lernende Person identifiziert die begrenzende Eingangsdatenqualität, wählt eine sinnvolle Ergebnisdarstellung einschließlich Einheit und begründet, warum zusätzliche Ziffern Scheingenauigkeit wären.
  - Observable performance (EN): The learner identifies the limiting quality of the input data, chooses a meaningful result representation including the unit, and explains why additional digits would constitute false precision.
- `retain-guard-digits-until-final-result`
  - Essential understanding (DE): Zwischenergebnisse werden mit ausreichenden zusätzlichen Stellen weitergeführt und erst das Endergebnis passend gerundet. Vorzeitiges Runden kann Fehler über mehrere Rechenschritte vergrößern; dokumentierte Einheiten und eine Größenordnungsprüfung bleiben zusätzliche Kontrollen.
  - Essential understanding (EN): Intermediate results are carried with sufficient guard digits and only the final result is rounded appropriately. Premature rounding can amplify errors across multiple steps; documented units and an order-of-magnitude check remain additional safeguards.
  - Observable performance (DE): Die lernende Person führt eine mehrstufige Rechnung mit ungerundeten oder ausreichend genauen Zwischenwerten durch, rundet erst am Ende und vergleicht mit einer vorzeitig gerundeten Lösung, um eine mögliche Abweichung zu erklären.
  - Observable performance (EN): The learner performs a multi-step calculation using unrounded or sufficiently precise intermediate values, rounds only at the end, and compares it with a prematurely rounded solution to explain any discrepancy.

**Coverage expectations**

- required expectations: `precision-supported-by-input-data`, `retain-guard-digits-until-final-result`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `calculation-depth`: Direkter Quotient und mehrstufige Ableitung einer Folgegröße werden variiert. / A direct quotient and a multi-step derivation of a subsequent quantity are varied.
- `precision-information`: Unterschiedliche Zahlen signifikanter Stellen oder ausdrücklich angegebene Messunsicherheiten bestimmen die Ergebnisgenauigkeit. / Different numbers of significant figures or explicitly stated measurement uncertainties determine result precision.

**Application cases**

- `resistance-from-two-measurements`
  - Task demand (DE): An einem Bauteil werden U = 12,0 V und I = 0,83 A gemessen; weitere Unsicherheitsangaben fehlen. Berechne R = U/I, gib das Ergebnis sinnvoll an und beurteile die Darstellungen 14,4578 Ω, 14,5 Ω und 1,4·10¹ Ω.
  - Task demand (EN): Measurements on a component give U = 12.0 V and I = 0.83 A; no further uncertainty information is available. Calculate R = U/I, report it meaningfully, and assess the representations 14.4578 Ω, 14.5 Ω, and 1.4·10¹ Ω.
  - Expected performance (DE): Die lernende Person berechnet zunächst etwa 14,4578 Ω, erkennt I mit zwei signifikanten Stellen als begrenzend und gibt R = 1,4·10¹ Ω an. Sie verwirft die längeren Angaben als nicht gestützte Scheingenauigkeit und weist darauf hin, dass explizite Messunsicherheiten die bloße Zählregel ersetzen und die Rundungsentscheidung genauer begründen würden.
  - Expected performance (EN): The learner first calculates about 14.4578 Ω, identifies I with two significant figures as limiting, and reports R = 1.4·10¹ Ω. The learner rejects the longer forms as unsupported false precision and notes that explicit measurement uncertainties would supersede this simple rounding decision.
  - Understanding focus (DE): Geprüft wird die Bedeutung der Ergebnisziffern als Präzisionsaussage, nicht bloß eine Rundungsregel.
  - Understanding focus (EN): This tests the meaning of reported digits as a precision claim rather than merely a rounding rule.
- `kinetic-energy-through-unrounded-speed`
  - Task demand (DE): Ein Körper der Masse 0,842 kg legt 24,6 m in 3,7 s mit näherungsweise konstanter Geschwindigkeit zurück. Bestimme zunächst v = s/t und danach E_kin = ½mv². Führe den Geschwindigkeitswert mit ausreichender Genauigkeit weiter, runde erst E_kin sinnvoll und erläutere die begrenzende Angabe. Vergleiche außerdem mit einer Rechnung, in der v vorzeitig auf 6,6 m/s gerundet wird.
  - Task demand (EN): A body of mass 0.842 kg travels 24.6 m in 3.7 s at approximately constant speed. First determine v = s/t and then E_kin = ½mv². Carry the speed with sufficient precision, round only E_kin appropriately, and explain which datum limits the result. Also compare with a calculation in which v is prematurely rounded to 6.6 m/s.
  - Expected performance (DE): Die lernende Person verwendet v ≈ 6,6486 m/s als Zwischenwert und erhält E_kin ≈ 18,61 J, das wegen t = 3,7 s sinnvoll als 19 J angegeben wird. Mit vorzeitig auf 6,6 m/s gerundetem v ergeben sich etwa 18,3 J und nach der Endrundung 18 J, also eine vermeidbare Abweichung. Sie zeigt, dass die vielen Rechnerziffern keine zusätzliche Messinformation darstellen, und dokumentiert Einheiten sowie plausible Größenordnung.
  - Expected performance (EN): The learner carries v ≈ 6.6486 m/s as an intermediate value and obtains E_kin ≈ 18.61 J, reasonably reported as 19 J because t = 3.7 s. Prematurely rounding v to 6.6 m/s gives about 18.3 J and, after final rounding, 18 J, an avoidable discrepancy. The learner shows that the calculator digits do not add measurement information and documents units and a plausible order of magnitude.
  - Understanding focus (DE): Die mehrstufige Rechnung prüft das Weiterführen von Schutzstellen und das einmalige begründete Endrunden.
  - Understanding focus (EN): The multi-step calculation tests carrying guard digits and performing one justified final rounding.
## Page 2: Elektrische Stromstärke als Ladungsrate deuten

- Full learning-goal ID: `bbee4c52-4e95-5529-990f-706aa99316a3`
- Goal fingerprint: `sha256:e318637bf0f1eb11f347167b4ca4ea7e6c67ceeb6e5a124d4efbdb7369d9c8a8`
- Page fingerprint: `sha256:ca4daa7d22b69c75f62d44808e0a8d176e24b2e17108980364c8a1467b0869fe`
- Topic path: Drei aktuelle Physikziele – vollständiger Kontext

### Canonical description

Die lernende Person kann die mittlere elektrische Stromstärke als netto durch einen festgelegten Querschnitt transportierte Ladung pro Zeitintervall mit I = ΔQ/Δt deuten, Berechnungen durchführen und den Einheitenzusammenhang 1 A = 1 C/s erklären.

### Visualization

/assets/goal-visualizations/physik/bbee4c52-4e95-5529-990f-706aa99316a3/bbee4c52-4e95-5529-990f-706aa99316a3.jpg

- original digest: `sha256:f31cfc45fb7f351f4cfa70885b4586d4b3c7483e11e52c6897e1e32daa7b6150`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Elektrostatische Aufladung durch Ladungsumverteilung erklären — `dc7dd287-6eac-574d-818d-65cfb23a2d94` (outside this book)
- Messwertänderungen pro Zeitintervall bestimmen — `13b338eb-f761-5817-9058-11043b9cb253` (outside this book)

### Direct reverse prerequisites outside this book

- Arbeit, Spannung und Potenzial im E-Feld — `1730c01d-8c85-57df-b031-c11e2a0511b1` (outside this book)
- Stromstärke: Nettoänderung, Puls und Zyklus — `28884133-b448-5eb2-a589-8907a78d7687` (outside this book)
- Coulomb'sches Gesetz — `8da5c981-8216-5fcd-a393-19f392ae2006` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:b5a4bdf6e4d4d938b7f88c12849ebb6e5161696fd8e90c0ef1d5708a79e26b77`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `interpret-average-current`
  - Essential understanding (DE): Die mittlere Stromstärke ist die netto durch einen festgelegten Querschnitt in einem festgelegten Zeitintervall transportierte Ladung, I = ΔQ/Δt. Die Bezugsrichtung bestimmt das Vorzeichen; 1 A und 1 C/s sind dieselbe Einheit.
  - Essential understanding (EN): Average current is the net charge transported through a specified cross-section in a specified interval, I = ΔQ/Δt. The reference direction determines the sign; 1 A and 1 C/s are the same unit.
  - Observable performance (DE): Die lernende Person markiert Querschnitt, Zeitintervall und Richtung, berechnet I mit Einheit und erklärt das Ergebnis als Ladungsmenge pro Zeit statt nur als Zahlenwert.
  - Observable performance (EN): The learner marks the cross-section, interval, and direction, calculates I with units, and explains the result as charge per time rather than only as a number.
- `compare-intervals-and-rearrange`
  - Essential understanding (DE): Bei zeitlich ungleichmäßigem Transport hängt der Mittelwert vom gewählten Intervall ab. Gleiche Gesamtladung kann bei anderer Dauer eine andere mittlere Stromstärke bedeuten; die Beziehung kann physikalisch nach Q oder t umgestellt werden.
  - Essential understanding (EN): For time-varying transfer, the average depends on the chosen interval. Equal total charge can imply a different average current over a different duration; the relation can be physically rearranged for Q or t.
  - Observable performance (DE): Die lernende Person bestimmt aus Ladungs-Zeit-Daten mehrere Mittelwerte, vergleicht sie, kehrt die Beziehung für eine neue Zielgröße um und begründet Vorzeichen und Intervallwahl.
  - Observable performance (EN): The learner determines several averages from charge-time data, compares them, rearranges the relation for a fresh target quantity, and justifies sign and interval choice.

**Coverage expectations**

- required expectations: `interpret-average-current`, `compare-intervals-and-rearrange`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `time-profile`: Gleichmäßiger oder gepulster Ladungstransport / Steady or pulsed charge transfer
- `reference-direction`: Gleiche oder umgekehrte Bezugsrichtung / Same or reversed reference direction
- `known-quantity`: Gesuchte Stromstärke, Ladung oder Zeit / Unknown current, charge, or time

**Application cases**

- `charge-time-data-intervals`
  - Task demand (DE): Ein Q(t)-Datensatz zeigt ungleichmäßigen Ladungstransport durch einen markierten Leiterquerschnitt. Bestimme die mittlere Stromstärke für zwei Intervalle, erkläre ihre Unterschiede und gib die Bedeutung eines negativen Werts bei der gewählten Richtung an.
  - Task demand (EN): A Q(t) data set shows non-uniform charge transfer through a marked conductor cross-section. Determine average current for two intervals, explain their difference, and state the meaning of a negative value for the chosen direction.
  - Expected performance (DE): Die lernende Person bildet passende ΔQ/Δt-Werte mit C/s beziehungsweise A, verwendet Nettoänderungen und deutet Vorzeichen und Intervallabhängigkeit physikalisch.
  - Expected performance (EN): The learner forms appropriate ΔQ/Δt values in C/s or A, uses net changes, and physically interprets sign and interval dependence.
  - Understanding focus (DE): Der Fall prüft Mittelwertbedeutung an Daten statt isolierter Formelwerte.
  - Understanding focus (EN): The case assesses the meaning of an average using data rather than isolated formula values.
- `equal-charge-different-pulses`
  - Task demand (DE): Zwei Geräte übertragen pro Zyklus dieselbe Ladung, aber mit unterschiedlich langen Pulsen und Pausen. Berechne Puls- und Zyklusmittelwerte, vergleiche sie und bestimme die Zeit für eine vorgegebene Gesamtladung.
  - Task demand (EN): Two devices transfer the same charge per cycle but use pulses and pauses of different durations. Calculate pulse and cycle averages, compare them, and determine the time required for a specified total charge.
  - Expected performance (DE): Die lernende Person legt für jeden Mittelwert das Intervall offen, erhält unterschiedliche Pulsströme trotz gleicher Ladung, berechnet den Zyklusmittelwert inklusive Pause und stellt I = Q/t sinnvoll um.
  - Expected performance (EN): The learner states the interval for each average, obtains different pulse currents despite equal charge, calculates the cycle average including the pause, and meaningfully rearranges I = Q/t.
  - Understanding focus (DE): Der unabhängige Transfer trennt Ladung, Pulsdauer und Mittelungsintervall.
  - Understanding focus (EN): The independent transfer distinguishes charge, pulse duration, and averaging interval.
## Page 3: Dotierung mit einem einfachen Ladungsträgermodell erklären

- Full learning-goal ID: `9f265f49-1342-5ba7-9c5d-54e97fdb2f19`
- Goal fingerprint: `sha256:410b31ca80e7b62e6c838bd844e0b066002e25a54d261d0f090d8067aefc8ddd`
- Page fingerprint: `sha256:6297ccc7d8a89937760ace8dd1714f70180487c3b149aa44b49db8505952eb3a`
- Topic path: Drei aktuelle Physikziele – vollständiger Kontext

### Canonical description

Die lernende Person kann an einem vorgegebenen einfachen Bindungsmodell für Silizium erklären, wie n- und p-Dotierung die Zahl beweglicher Elektronen beziehungsweise Löcher erhöhen, und bewegliche Ladungsträger von ortsfesten Ionen im insgesamt neutralen Material unterscheiden.

### Visualization

/assets/goal-visualizations/physik/9f265f49-1342-5ba7-9c5d-54e97fdb2f19/9f265f49-1342-5ba7-9c5d-54e97fdb2f19.jpeg

- original digest: `sha256:0766f6653c699e63fa9816ed4bf9a48fb5041c4d1c216dc4faf85f97c78dc07b`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Leiter, Nichtleiter und Halbleiter — `7badac4d-2874-5b3a-87e8-bf8f4440b2a6` (outside this book)
- Elektrostatische Aufladung durch Ladungsumverteilung erklären — `dc7dd287-6eac-574d-818d-65cfb23a2d94` (outside this book)

### Direct reverse prerequisites outside this book

- Sperrschicht und Polung am p-n-Übergang erklären — `2084b7d4-300d-5fa0-8b8d-c480c40f853e` (outside this book)
- Prüfungsaufgabe: Bewegliche Ladungsträger beim Dotieren erklären — `a8d99168-62cc-5771-bb5d-9ba833d84193` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:f25df61b65be48e6d99015c7310acc61dfeee4ea58327bb8578e11f7cf6cbd25`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `doping-carriers`
  - Essential understanding (DE): Im bereitgestellten Silizium-Bindungsmodell liefert ein Donator ein bewegliches Elektron; ein Akzeptor nimmt ein Bindungselektron auf und hinterlässt ein bewegliches Loch.
  - Essential understanding (EN): In the supplied silicon bond model, a donor supplies a mobile electron; an acceptor takes up a bond electron and leaves a mobile hole.
  - Observable performance (DE): Leitet n- und p-Träger aus dem jeweils vorgegebenen Vier-/Fünf-/Drei-Außenelektronenmodell ab und erklärt Lochbewegung durch nachrückende Bindungselektronen.
  - Observable performance (EN): Derives n-type and p-type carriers from the supplied four-/five-/three-outer-electron model and explains hole motion through neighbouring bond electrons filling vacancies.
- `charge-neutrality`
  - Essential understanding (DE): Die Dotierionen bleiben ortsfest; mobiles Elektron und positives Donatorion beziehungsweise Loch und negatives Akzeptorion gleichen die Gesamtladung aus. n/p bezeichnet keine Nettoladung.
  - Essential understanding (EN): Dopant ions remain fixed; a mobile electron and positive donor ion, or a hole and negative acceptor ion, balance overall charge. n/p does not mean net charge.
  - Observable performance (DE): Kennzeichnet mobile und ortsfeste Anteile mit richtigem Vorzeichen und widerlegt eine Nettoaufladung oder wandernde Dotierionen.
  - Observable performance (EN): Marks mobile and fixed contributions with correct signs and refutes net charging or mobile dopant ions.

**Coverage expectations**

- required expectations: `doping-carriers`, `charge-neutrality`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `donor-acceptor`: Donator- und Akzeptorfall bei vollständig vorgegebenem Bindungsmodell wechseln. / Switch between donor and acceptor cases with a fully supplied bond model.
- `changed-diagram`: Neue Anordnung und wechselnde Lage der Fehlstelle; Trägerbewegung und feste Ionen getrennt verfolgen. / Fresh arrangement and vacancy location; trace carrier motion separately from fixed ions.

**Application cases**

- `donor-first`
  - Task demand (DE): Ein neues bereitgestelltes Modell zeigt vier Bindungen pro Si und ein neutrales Fremdatom mit fünf Außenelektronen. Vier sind in Bindungen beteiligt, das fünfte wird bei der genannten Temperatur beweglich. Erkläre den Träger, das verbleibende Ion und die Gesamtladung. Vergleiche anschließend mit einem vorgegebenen Drei-Elektronen-Akzeptor.
  - Task demand (EN): A fresh supplied model shows four bonds per Si and a neutral impurity with five outer electrons. Four participate in bonds; the fifth becomes mobile at the stated temperature. Explain the carrier, remaining ion and overall charge. Then compare with a supplied three-electron acceptor.
  - Expected performance (DE): Donator: bewegliches negatives Elektron und ortsfestes positives Ion; Akzeptor: aufgenommenes Bindungselektron, ortsfestes negatives Ion und positiv wirksame Fehlstelle. Beide Bilanzpaare bleiben insgesamt neutral. n/p kennzeichnet den Mehrheitsladungsträger; keine räumlichen Energiebänder oder chemischen Periodensystemkenntnisse werden zusätzlich verlangt.
  - Expected performance (EN): Donor: mobile negative electron and fixed positive ion; acceptor: an acquired bond electron, fixed negative ion and positively acting vacancy. Both charge accounts remain neutral overall. n/p identifies the majority mobile carrier; no additional energy-band or periodic-table knowledge is required.
  - Understanding focus (DE): Trägerentstehung kausal aus gegebenen Bindungen ableiten und Ladung bilanzieren.
  - Understanding focus (EN): Derive carrier formation causally from supplied bonds and balance charge.
- `hole-transfer`
  - Task demand (DE): In einem neu angeordneten p-Modell rückt ein benachbartes Bindungselektron in einen fehlenden Elektronenplatz nach. Zeichne danach den neuen fehlenden Platz ein. Prüfe: Ein Loch ist ein Proton; Borionen wandern als positiver Strom; p-Silizium ist insgesamt positiv geladen.
  - Task demand (EN): In a rearranged p-type model, a neighbouring bond electron fills a missing-electron site. Mark the new vacancy. Assess: a hole is a proton; boron ions travel as positive current; p-type silicon has a positive net charge.
  - Expected performance (DE): Die Fehlstelle verlagert sich entgegen der Elektronenbewegung und ist ein positiv wirksamer fehlender Elektronenplatz. Das Akzeptorion bleibt ortsfest und negativ; der Kristall bleibt insgesamt neutral. Keine Behauptung eines materiellen Hohlraums oder wandernder Protonen.
  - Expected performance (EN): The vacancy moves opposite to the electron and is a positively acting missing-electron site. The acceptor ion remains fixed and negative; the crystal is neutral overall. No material cavity or moving proton is inferred.
  - Understanding focus (DE): Echter Darstellungswechsel prüft Lochkonzept, Mobilität und Neutralität ohne Bildkopie.
  - Understanding focus (EN): A changed representation tests holes, mobility and neutrality without copying an illustration.
