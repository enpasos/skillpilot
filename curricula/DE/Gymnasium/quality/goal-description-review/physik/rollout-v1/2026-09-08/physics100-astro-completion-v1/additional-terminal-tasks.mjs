import {task} from './assessment-drafts.mjs'

// Three genuine endpoints for four old atoms whose only former terminal was
// the overclaimed 335a. No new content goal, source entitlement or threshold.
export const additionalTerminalTasks=[
task('GW','Zwei Wellenarten und zwei Messprinzipien vergleichen','Compare two wave types and two measurement principles',[],'Q4',
`## Material: Zwei hypothetische Signale aus dem All

Für den Vergleich gelten das klassische elektromagnetische Wellenmodell im Vakuum und die schwache Gravitationswelle der allgemeinen Relativitätstheorie. Elektromagnetische Wellen besitzen veränderliche elektrische und magnetische Felder. Gravitationswellen sind sich ausbreitende Änderungen der Raumzeitgeometrie. Beide übertragen Energie, benötigen kein stoffliches Medium und breiten sich in diesen Modellen im Vakuum mit c aus. Bei beiden ist die Wirkung transversal zur Ausbreitungsrichtung; damit wird nicht behauptet, dass dieselbe physikalische Größe schwingt.

Messbericht A: Eine Antenne liefert eine periodische Spannung durch die Kraft des ankommenden elektrischen Feldes auf Ladungen.
Messbericht B: Laserlicht tastet zwei senkrechte Arme eines Interferometers ab. Eine ankommende Gravitationswelle kann deren relative Längen quer zur Ausbreitung unterschiedlich ändern; dies verändert das Interferenzsignal. Das Laserlicht wird vor Ort als Messwerkzeug erzeugt.
Die Berichte sind konstruierte Messprinzipien, keine neuen Ereignisdaten. Fachlicher Quellenkern: BW V2, 3.5.4(8), gedruckt S. 36; LIGO, What are Gravitational Waves?, https://www.ligo.caltech.edu/MIT/page/what-are-gw (knappe eigene Einordnung).

1. Ordnen Sie A und B den beiden Wellenarten zu und vergleichen Sie jeweils physikalisch veränderliche Größe und Messwirkung. (6 BE)
2. Ein Kommentar behauptet: „Beide laufen mit c und sind transversal, also sind Gravitationswellen besonders schwaches Licht.“ Widerlegen Sie den Schluss anhand von zwei Gemeinsamkeiten und einem entscheidenden Unterschied. (4 BE)
3. Begründen Sie, weshalb das Laserlicht in B den Nachweis nicht zu einer Messung ankommenden elektromagnetischen Lichts macht. Würde das Fehlen eines stofflichen Mediums die Ausbreitung einer der beiden Wellen ausschließen? (4 BE)`,
`## Material: Two hypothetical signals from space

Use the classical electromagnetic-wave model in vacuum and weak gravitational waves in general relativity. Electromagnetic waves have varying electric and magnetic fields. Gravitational waves are propagating changes in spacetime geometry. Both carry energy, require no material medium and travel at c in vacuum in these models. Both have transverse effects; this does not mean the same physical quantity varies.

Report A: An antenna produces a periodic voltage because the incoming electric field exerts forces on charges.
Report B: Locally generated laser light probes two perpendicular interferometer arms. An incoming gravitational wave can change their relative lengths differently, transverse to propagation, changing the interference signal. The laser light is a local measuring tool.
These are constructed measurement principles, not new event data. Curriculum basis: BW V2, 3.5.4(8), printed p. 36; LIGO, What are Gravitational Waves?, https://www.ligo.caltech.edu/MIT/page/what-are-gw (brief contextual paraphrase).

1. Match A and B to the wave types and compare the physically varying quantity and measured effect in each. (6 marks)
2. A comment claims: “Both travel at c and are transverse, so gravitational waves are especially weak light.” Refute the conclusion using two similarities and one decisive difference. (4 marks)
3. Explain why the laser in B does not make this a measurement of incoming electromagnetic light. Would the absence of a material medium prevent either type of wave from propagating? (4 marks)`,
`1. A ist elektromagnetisch: zeitlich veränderliche E-/B-Felder, hier elektrische Kraft auf Ladungen und dadurch Antennenspannung. B ist gravitativ: Raumzeitgeometrie beziehungsweise relative Abstände freier Testmassen ändern sich; das Interferometer übersetzt den differentiellen Arm-Längeneffekt in ein optisches Signal. Je richtige Zuordnung 1 BE, jeweilige veränderliche Größe und Messwirkung zusammen je 2 BE.
2. Gemeinsame Vakuumgeschwindigkeit c und transversale Wirkung begründen keine Identität. EM-Felder sind nicht die Raumzeitgeometrie; eine kleinere Amplitude eines EM-Felds macht keine Gravitationswelle. Zwei Gemeinsamkeiten je 1 BE, begründeter Unterschied 2 BE.
3. Das lokal ausgesandte Laserlicht liest die durch eine andere Wellenart verursachte relative Längenänderung aus: Messsonde und ankommendes Signal unterscheiden (2 BE). Beide Modelle erlauben Vakuumausbreitung ohne Luft oder anderen Trägerstoff (2 BE).`,
`1. A is electromagnetic: time-varying E/B fields, here electric forces on charges producing antenna voltage. B is gravitational: spacetime geometry or relative separations of free test masses change; the interferometer converts the differential arm-length effect into an optical signal. One mark per match and two per varying-quantity/measurement explanation.
2. Shared vacuum speed c and transverse effects do not establish identity. EM fields are not spacetime geometry; reducing an EM-field amplitude does not turn it into a gravitational wave. One mark per similarity, two for the reasoned distinction.
3. Locally emitted laser light reads a relative length change caused by another wave type: distinguish probe from incoming signal (2). Both models allow vacuum propagation without air or another material carrier (2).`,
[[6,'Beide Zuordnungen und jeweilige Größe/Messwirkung fachlich begründet.','Both matches and their varying quantities/measurement effects explained.'],[4,'Zwei Gemeinsamkeiten und begründete Nichtidentität.','Two similarities and a justified distinction.'],[4,'Lokale Messsonde vom Signal getrennt; Vakuumausbreitung richtig.','Local probe distinguished from signal; vacuum propagation correct.']]),
task('ST','Druckstützung und Stabilität eines Sternmodells beurteilen','Assess pressure support and stability in a stellar model',[],'Q4',
`## Material: Kräfte auf eine kleine kugelförmige Sternschale

Alle Werte sind konstruierte, gleich normierte Kraftbeiträge für dieselbe Schale, keine gemessenen Sternwerte. Nach außen gilt positiv. „Druckkraft“ meint die resultierende Kraft aus einem räumlichen Druckgradienten, nicht den skalaren Druckwert.
Im Anfangszustand: Gravitation −100, Gasdruckkraft +60, Strahlungsdruckkraft +40; Summe 0. Nach einer angenommenen raschen Änderung betragen die Druckkraftbeiträge zunächst +40 und +30, während die Gravitation im betrachteten Anfangsmoment noch −100 beträgt.
Allgemeine Einordnung: Gas- und Strahlungsdruck können zur Stützung beitragen. In dicht gepackter Materie kann auch Entartungsdruck beitragen; er beruht nicht auf laufender Kernfusion und wird hier nicht berechnet.

Für eine getrennte Stabilitätsprüfung eines Gleichgewichts sind nach kleinen radialen Störungen folgende resultierende Kräfte vorgegeben:

| Modell | Schale wenig nach außen versetzt | Schale wenig nach innen versetzt |
| --- | --- | --- |
| A | −5 | +10 |
| B | +8 | −6 |

Die Angaben beschreiben nur die unmittelbare Rückwirkung; die beiden kleinen Auslenkungen müssen nicht gleich groß sein. Rotation, Magnetfelder, Energiefluss und große Störungen sind nicht modelliert. Fachlicher Quellenkern: BW V2 3.5.7(4), gedruckt S. 38.

1. Erklären Sie das anfängliche Kräftegleichgewicht und bestimmen Sie die unmittelbare Bewegungsänderung nach der angenommenen Druckänderung. (4 BE)
2. Beurteilen Sie A und B gegenüber kleinen radialen Störungen. Warum beweist die Kraftsumme 0 im ungestörten Zustand allein noch keine Stabilität? (6 BE)
3. Beurteilen Sie: „Ohne laufende Kernfusion gibt es grundsätzlich keinen stützenden Druck; jede beginnende Kontraktion endet deshalb sofort als Schwarzes Loch.“ Nennen Sie zwei fachliche Grenzen dieses Schlusses und eine Grenze der vorliegenden Tabelle. (6 BE)`,
`## Material: Forces on a small spherical stellar shell

All values are constructed force contributions using the same normalization for the same shell, not measured stellar data. Outward is positive. “Pressure force” means the net force from a spatial pressure gradient, not the scalar pressure value.
Initially: gravity −100, gas-pressure force +60, radiation-pressure force +40; total 0. After an assumed rapid change, the pressure-force contributions are initially +40 and +30 while gravity is still −100 at the instant considered.
Context: gas and radiation pressure can support an object. Degeneracy pressure can also contribute in densely packed matter; it does not depend on ongoing nuclear fusion and is not calculated here.

For a separate stability test of an equilibrium, small radial displacements produce these net forces:

| Model | Shell displaced slightly outward | Shell displaced slightly inward |
| --- | --- | --- |
| A | −5 | +10 |
| B | +8 | −6 |

The data describe only the immediate response; the two small displacements need not have equal magnitudes. Rotation, magnetic fields, energy flow and large perturbations are not modelled. Curriculum basis: BW V2 3.5.7(4), printed p. 38.

1. Explain the initial force balance and determine the immediate change in motion after the assumed pressure change. (4 marks)
2. Assess A and B for small radial perturbations. Why does zero net force in the unperturbed state alone not establish stability? (6 marks)
3. Assess: “Without ongoing nuclear fusion there can be no supporting pressure, so any initial contraction immediately ends in a black hole.” Give two physical limits of this conclusion and one limitation of the table. (6 marks)`,
`1. +60+40−100=0: Druckgradientkräfte gleichen die Gravitation aus (2 BE). Danach +40+30−100=−30: zunächst Beschleunigung nach innen, nicht bereits ein bestimmter Endzustand (2 BE).
2. A wirkt für beide Störungen rückstellend: nach Auslenkung nach außen Kraft nach innen und umgekehrt; lokal stabil im betrachteten Modell (2 BE). B verstärkt beide Auslenkungen und ist lokal instabil (2 BE). Gleichgewicht bezeichnet die Kraftbilanz am Ausgangspunkt, Stabilität die Reaktion auf eine Störung (2 BE).
3. Entartungsdruck kann ohne laufende Fusion stützen; auch thermische Stützung ist nicht gleichbedeutend mit momentan laufender Fusion (2 BE). Bei Kontraktion ändern sich Dichte, Temperatur und Kräfte; aus der Anfangsbeschleunigung folgt weder sofortiger Kollaps noch ein eindeutig bestimmtes Endobjekt (2 BE). Die Tabelle prüft nur kleine radiale Störungen, nicht globale Entwicklung oder die ausdrücklich ausgelassenen Effekte (2 BE).`,
`1. +60+40−100=0: pressure-gradient forces balance gravity (2). Afterwards +40+30−100=−30: initial inward acceleration, not an already determined final state (2).
2. A restores both perturbations: inward force after an outward displacement and vice versa, so locally stable within the model (2). B reinforces both displacements and is locally unstable (2). Equilibrium is the initial force balance; stability concerns the response to a perturbation (2).
3. Degeneracy pressure can support matter without ongoing fusion; thermal support is not identical to fusion occurring at that instant either (2). Contraction changes density, temperature and forces; initial acceleration implies neither immediate collapse nor a unique final object (2). The table tests only small radial perturbations, not global evolution or the explicitly omitted effects (2).`,
[[4,'Gleichgewicht und −30 nach innen korrekt als Momentanaussagen.','Correct equilibrium and −30 inward as instantaneous conclusions.'],[6,'A rückstellend, B destabilisierend; Gleichgewicht von Stabilität getrennt.','A restoring, B destabilizing; equilibrium distinguished from stability.'],[6,'Druck nicht mit Fusion gleichgesetzt; Endzustand und Modellgrenzen korrekt.','Pressure not equated with fusion; final-state and model limits respected.']]),
task('EX','Einen Exoplanetenkandidaten und sein Transmissionsspektrum beurteilen','Assess an exoplanet candidate and its transmission spectrum',[],'Q4',
`## Material: Ein konstruierter Stern-Planet-Kandidat

A: Die folgenden idealisierten Werte werden über mehrere Umläufe wiederholt. Der normierte Sternfluss außerhalb des kurzen Transits ist 1. Positive Radialgeschwindigkeit bedeutet Bewegung des Sterns von uns weg; die gemeinsame konstante Systemgeschwindigkeit wurde abgezogen.

| Zeit / Tage | 0 | 1,5 | 3 | 4,5 | 6 |
| --- | --- | --- | --- | --- | --- |
| Sternfluss | 0,990 | 1,000 | 1,000 | 1,000 | 0,990 |
| Radialgeschwindigkeit des Sterns / (m/s) | 0 | +20 | 0 | −20 | 0 |

B: Während eines Transits wird ein Spektrum mit dem Spektrum desselben Sterns außerhalb des Transits verglichen. Nach Abzug des grauen Transitanteils und modellierter Stern-/Instrumenteffekte verbleibt zusätzliche Absorption in den Kanälen 620 nm und 760 nm. Bei 810 nm liegt sie unter der angegebenen sicheren Nachweisgrenze. Eine vereinfachte Vergleichsbibliothek enthält nur zwei hypothetische Stoffe: X absorbiert bei 620 und 760 nm; Y absorbiert bei 620 und 810 nm. Nach den vorgegebenen Modellbedingungen wäre die 810 nm-Linie von Y sicher messbar, bei einer zur Erklärung der 620 nm-Linie nötigen Menge von Y. Die Stoffnamen und Wellenlängen sind didaktisch konstruiert, keine realen Laboridentifikationen.

Methodische Einordnung: NASA, How We Find and Characterize, https://science.nasa.gov/exoplanets/how-we-find-and-characterize/; Lehrplankern BW V2 3.5.7(8)/(9), gedruckt S. 38/39. Die Aufgabe verlangt keine Planetenmassen- oder Radiusberechnung.

1. Erklären Sie Transit- und Radialgeschwindigkeitsdeutung von A. Benennen Sie, wessen Licht und wessen Bewegung jeweils untersucht werden, sowie die Umlaufperiode des einfachen Modells. Warum reicht das Fehlen eines Transits bei einem anderen Stern allein nicht aus, einen Planeten auszuschließen? (8 BE)
2. Erklären Sie, wie B Informationen über eine Atmosphäre liefert, und entscheiden Sie begründet zwischen X und Y innerhalb der vorgegebenen Bibliothek. Warum genügt die einzelne 620 nm-Linie nicht? (8 BE)
3. Unterscheiden Sie die periodische Verschiebung von Sternlinien in A von der zusätzlichen Absorption in B. Beurteilen Sie die Aussage „Damit sind der Planet, die vollständige Zusammensetzung seiner Atmosphäre und Leben zweifelsfrei nachgewiesen“ und nennen Sie eine geeignete zusätzliche Prüfung. (8 BE)`,
`## Material: A constructed star–planet candidate

A: These idealized values repeat over several orbits. Stellar flux outside the brief transit is normalized to 1. Positive radial velocity means the star moves away from us; the constant systemic velocity has been subtracted.

| Time / days | 0 | 1.5 | 3 | 4.5 | 6 |
| --- | --- | --- | --- | --- | --- |
| Stellar flux | 0.990 | 1.000 | 1.000 | 1.000 | 0.990 |
| Stellar radial velocity / (m/s) | 0 | +20 | 0 | −20 | 0 |

B: A spectrum during transit is compared with the same star's spectrum outside transit. After subtracting the grey transit contribution and modelled stellar/instrument effects, additional absorption remains in the 620 nm and 760 nm channels. At 810 nm it is below the stated reliable detection limit. A simplified library contains only two hypothetical substances: X absorbs at 620 and 760 nm; Y absorbs at 620 and 810 nm. Under the supplied model conditions, Y's 810 nm line would be reliably measurable at the amount of Y needed to explain the 620 nm feature. These names and wavelengths are constructed for teaching, not actual laboratory identifications.

Method context: NASA, How We Find and Characterize, https://science.nasa.gov/exoplanets/how-we-find-and-characterize/; curriculum basis BW V2 3.5.7(8)/(9), printed pp. 38/39. No planetary mass or radius calculation is requested.

1. Explain the transit and radial-velocity interpretations of A. Identify whose light and whose motion are examined, and the orbital period of the simple model. Why does the absence of a transit around another star not by itself exclude a planet? (8 marks)
2. Explain how B supplies atmospheric information and choose between X and Y within the given library, with reasons. Why is the 620 nm feature alone insufficient? (8 marks)
3. Distinguish periodic shifts of stellar lines in A from additional absorption in B. Assess: “This proves the planet, its complete atmospheric composition and life beyond any doubt,” and propose one suitable additional check. (8 marks)`,
`1. Der vor dem Stern vorbeiziehende Kandidat verdeckt einen Teil des Sternlichts, wiederkehrende kurze Flussabnahme mit Modellperiode 6 d (3 BE). Die Gravitation eines umlaufenden Begleiters lässt auch den Stern um den gemeinsamen Schwerpunkt laufen; seine Radialbewegung wird aus wechselnder Rot-/Blauverschiebung seiner Linien erschlossen (3 BE). Eine anders orientierte Bahn kann ohne Transit bleiben (2 BE).
2. Ein kleiner Anteil des Sternlichts durchläuft die Atmosphäre; stoffabhängige zusätzliche Absorption verändert den Transit spektral (3 BE). X passt zu beiden Merkmalen 620/760 nm; Y erklärt 760 nm nicht und würde unter den gesetzten Bedingungen eine nicht gefundene 810 nm-Linie liefern (3 BE). 620 nm allein ist in der Bibliothek nicht eindeutig, weil beide Stoffe dort absorbieren (2 BE).
3. A betrifft die Lage der Sternlinien durch Sternbewegung; B zusätzliche wellenlängenabhängige Abschwächung im Transit, nicht eine neue Radialgeschwindigkeit (3 BE). Die gemeinsam periodischen Befunde stützen einen Planetenkandidaten; die vereinfachten Daten schließen reale Alternativen nicht vollständig aus. Eine begrenzte Bibliothek bestimmt weder sämtliche Bestandteile noch beweist sie Leben (3 BE). Geeignet ist z.B. unabhängige Wiederholung der Spektren mit Kontrolle der Sternaktivität oder Suche nach weiteren charakteristischen Absorptionsbanden (2 BE).`,
`1. The candidate crossing the stellar disc blocks some starlight; repeated brief flux dips give a 6-day model period (3). An orbiting companion's gravity also makes the star move around the common centre of mass; alternating shifts of its stellar lines reveal its radial motion (3). A differently oriented orbit may not transit (2).
2. A small fraction of starlight passes through the atmosphere; substance-dependent additional absorption makes the transit wavelength-dependent (3). X fits 620/760 nm; Y does not explain 760 nm and would, under the stated conditions, produce an absent 810 nm line (3). 620 nm alone is ambiguous because both library substances absorb there (2).
3. A concerns stellar-line positions changing with stellar motion; B concerns additional wavelength-dependent attenuation during transit, not another radial velocity (3). The jointly periodic signals support a planet candidate but the simplified data do not exclude all real alternatives. A restricted library identifies neither every atmospheric constituent nor life (3). A suitable check is independent repeated spectroscopy controlling stellar activity or a search for additional characteristic absorption bands (2).`,
[[8,'Transit, Sternbewegung, 6 d und Sichtgeometrie korrekt.','Transit, stellar motion, 6 d and viewing geometry correct.'],[8,'Transmissionsprinzip und Mehrlinienvergleich X/Y einschließlich Nachweisgrenze.','Transmission principle and multi-line X/Y comparison including detection limit.'],[8,'Linienverschiebung von Absorption getrennt; Schlussgrenzen und Zusatzprüfung.','Line shifts distinguished from absorption; conclusion limits and extra check.']]),
]
