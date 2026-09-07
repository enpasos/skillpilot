// B041: reviewed, bounded Layer A authoring input; never an automatic mastery migration.
export const ids = {
  double: '6270e558-d657-5363-a6b2-e49a032a453b',
  minimum: 'c64820e1-c0ee-4342-9225-f981650f0c52',
  grating: '91683676-01cf-5003-80fa-a04d043b4e61',
  single: 'f6a3a602-1e45-5018-b0ff-3d49933cf634',
}
const foundations = ['9dba2826-b179-59f0-8d91-5916079e5abe', '5b90066f-b5b3-4e82-8d31-7b95ff0a0451']
export const content = [
  {
    id: ids.double,
    description: 'Die lernende Person kann das Interferenzmuster eines idealisierten Doppelspalts aus dem Gangunterschied kohärenter Lichtwellen erklären, die Maximabedingung und ihre Kleinwinkelnäherung begründen und damit Wellenlängen aus Schirmmessungen bestimmen sowie die Lage der Farben bei polychromatischem Licht deuten.',
    descriptionEn: 'The learner can explain the interference pattern of an idealised double slit from the path difference of coherent light waves, justify the maximum condition and its small-angle approximation, and use this model to determine wavelengths from screen measurements and interpret colour positions for polychromatic light.',
    requires: foundations,
    atomicReason: 'Ein zusammenhängendes Doppelspaltmodell: Gangunterschied erklärt die Maxima; die inverse Messung und die Farbverschiebung prüfen dasselbe Modell in neuen Daten. Keine Einzelspalt- oder Gitterkompetenz wird hinzugemischt. Ein Formel-Rezept ohne Phasen- und Näherungsbegründung genügt nicht.',
    memoryReason: 'Die vorhandene schmale Quanten-/Wellenoptikkarte zum Doppelspalt bleibt nützlich für kompakte Notation und Maximabedingung. Die neue Kompetenz verlangt zusätzlich Gangunterschied, Messinversion und Modellgrenze; diese Verständnisleistung wird nicht durch Kartenlernen ersetzt.',
  },
  {
    id: ids.minimum,
    title: 'Interferenzminima am Doppelspalt begründen und lokalisieren',
    titleEn: 'Explain and locate interference minima at a double slit',
    description: 'Die lernende Person kann beim idealisierten Doppelspalt mit gleich starken kohärenten Beiträgen die dunklen Stellen aus destruktiver Interferenz begründen, ihre Winkel und Schirmpositionen bestimmen und die Minima gegenüber den Maxima sowie gegenüber einer unzulässigen Kleinwinkelnäherung abgrenzen.',
    descriptionEn: 'The learner can explain dark positions for an idealised double slit with equally strong coherent contributions using destructive interference, determine their angles and screen positions, and distinguish minima from maxima and from an unjustified small-angle approximation.',
    requires: [ids.double], tags: ['LK'],
    extendedData: { applicabilityMappingInheritance: 'boundary' },
    atomicReason: 'Eine eng begrenzte LK-Erweiterung des vorhandenen Doppelspaltmodells: halbzahlige Gangunterschiede beschreiben die destruktiven Stellen. Winkel und Schirmkoordinaten sind Darstellungen derselben Minima, nicht drei selbstständige Beugungsmodelle. Einzelspalt und Gitter sind ausdrücklich nicht enthalten.',
    memoryReason: 'Keine zusätzliche Karte: Die Halbzahlbedingung wird aus Gegenphasigkeit hergeleitet und mit den bereits verankerten Doppelspaltmaxima verglichen. Neue Merkzahlen oder eine zweite Formelsammlung sind nicht erforderlich.',
  },
  {
    id: ids.grating,
    description: 'Die lernende Person kann die Hauptmaxima eines optischen Gitters aus der kohärenten Überlagerung regelmäßig angeordneter Spalte begründen und das Modell nutzen, um polychromatische Spektren nach Wellenlänge und Beugungsordnung zu deuten sowie Wellenlängen aus gemessenen Winkeln oder Schirmpositionen zu bestimmen.',
    descriptionEn: 'The learner can explain the principal maxima of an optical grating using coherent superposition from regularly spaced slits and use this model to interpret polychromatic spectra by wavelength and diffraction order and determine wavelengths from measured angles or screen positions.',
    requires: [ids.double],
    atomicReason: 'Ein Gitter-Spektrometriemodell: Phasengleichheit benachbarter Spalte erklärt Hauptmaxima; Farb-/Ordnungsdeutung und inverse Wellenlängenbestimmung sind prüfbare Nutzungen dieser einen Beziehung. Es wird keine universelle Gitter-Minimaregel und kein bloß monochromatisches Abstandsrezept behauptet.',
    memoryReason: 'Keine eigene zusätzliche Karte: Gitterkonstante, Ordnung und Wellenlänge werden im kohärenten Überlagerungsmodell verbunden. Frische Spektraldaten und eine falsche Ordnungszuordnung prüfen das Verständnis statt den isolierten Formelabruf.',
  },
  {
    id: ids.single,
    description: 'Die lernende Person kann die Fraunhofer-Intensitätsverteilung eines gleichmäßig beleuchteten Einzelspalts aus der Überlagerung seiner Elementarwellen modellieren, die Minima und die Breite des Zentralmaximums begründen und Nebenmaxima aus dem Modell mit angemessenen Näherungen lokalisieren.',
    descriptionEn: 'The learner can model the Fraunhofer intensity distribution of a uniformly illuminated single slit from the superposition of its elementary waves, explain the minima and the width of the central maximum, and locate secondary maxima using appropriate approximations of the model.',
    requires: foundations,
    atomicReason: 'Ein kontinuierliches Einzelspaltmodell: Die resultierende Amplitude trägt Intensitätsverlauf, Nullstellen, Zentralbreite und Nebenmaxima. Der bereits bestehende Modellierungsanspruch bleibt erhalten; die halbe Ordnung ist keine exakte Nebenmaximaregel. Polarisation ist keine notwendige Voraussetzung dieses skalaren Modells.',
    memoryReason: 'Die vorhandene eng zugeordnete Einzelspaltkarte bleibt für die kompakte Minimanotation und den Ausschluss von m=0 sinnvoll. Die eigentliche Fraunhofer-Modellierung, Zentralbreite und Näherungsprüfung werden über Verständnisaufgaben und nicht als neue Zahlenkarten gesichert.',
  },
]

// Each actual case assesses exactly its one existing content goal. No generic Q3 basket.
export const assessments = [
  {
    key: 'double-maxima-wavelength', goalId: ids.double,
    title: 'Doppelspalt als Wellenlängenmessgerät', titleEn: 'Double slit as a wavelength measuring device',
    taskContent: `**Kontext und Material:** Ein Labor vermisst einen idealisierten, gleichmäßig beleuchteten Doppelspalt. Senkrechter kohärenter Einfall, Fernfeld, Spaltmittenabstand d = 0,30 mm, Schirmabstand L = 2,0 m. Das zweite helle Maximum liegt 8,0 mm oberhalb des Zentrums; die einzelnen Spalte seien so schmal, dass ihre Einhüllende hier vernachlässigt wird.

1. Begründe aus dem Gangunterschied benachbarter Beiträge die Bedingung für helle Maxima. Erläutere, welche zusätzliche Annahme aus y = L tan θ die Kleinwinkelform yₘ ≈ m λ L / d macht. (4 BE)
2. Bestimme die Wellenlänge und den Abstand benachbarter heller Streifen. Prüfe anhand des Messwinkels, ob die Näherung angemessen ist. (4 BE)
3. Das Labor ersetzt die Quelle durch eine Quelle mit dieser Wellenlänge und zusätzlich 450 nm. Welche Farbe liegt in erster Ordnung näher am Zentrum? Begründe die Positionen und erkläre die Überlagerung im Zentrum. (2 BE)`,
    taskContentEn: `**Context and material:** A laboratory measures an idealised, uniformly illuminated double slit. Normal coherent incidence, far field, centre-to-centre spacing d = 0.30 mm and screen distance L = 2.0 m. The second bright maximum is 8.0 mm above the centre; the individual slits are narrow enough to neglect their envelope here.

1. Justify the bright-maximum condition from the path difference between the contributions. Explain the additional assumption needed to turn y = L tan θ into yₘ ≈ m λ L / d. (4 points)
2. Determine the wavelength and spacing of neighbouring bright fringes. Use the measured angle to check the approximation. (4 points)
3. The source now contains this wavelength and also 450 nm. Which colour is closer to the centre in first order? Justify the positions and explain superposition at the centre. (2 points)`,
    solutionContent: `1. Gleichphasige Beiträge verstärken sich für Δs = m λ. Im Fernfeld ist Δs ≈ d sin θ, also d sin θₘ = m λ. Nur für kleine Winkel gilt zusätzlich tan θ ≈ sin θ ≈ θ; Fernfeld allein genügt nicht. (4 BE)
2. λ ≈ d y₂ / (2 L) = 600 nm; Δy ≈ λ L / d = 4,0 mm. tan θ₂ = 0,008 / 2 = 0,004, also θ₂ ≈ 0,229°. Die relative Abweichung zwischen sin θ und tan θ beträgt hier ungefähr 0,0008 %, deutlich unter der Genauigkeit der gegebenen Messwerte. (4 BE)
3. 450 nm liegt mit y₁ ≈ 3,0 mm näher am Zentrum als 600 nm mit etwa 4,0 mm. Bei m = 0 haben beide Wellenlängen ein Maximum; ihre Beiträge überlagern sich. Zwei Linien ergeben nicht automatisch weißes Licht. (2 BE)`,
    solutionContentEn: `1. Equal-phase contributions reinforce for Δs = m λ. In the far field Δs ≈ d sin θ, hence d sin θₘ = m λ. Only at small angles does tan θ ≈ sin θ ≈ θ; the far field alone is insufficient. (4 points)
2. λ ≈ d y₂ / (2 L) = 600 nm; Δy ≈ λ L / d = 4.0 mm. tan θ₂ = 0.008 / 2 = 0.004, giving θ₂ ≈ 0.229°. The relative sin/tan discrepancy is about 0.0008 %, well below the accuracy of the measurements. (4 points)
3. 450 nm is closer with y₁ ≈ 3.0 mm, compared with about 4.0 mm for 600 nm. Both have a maximum at m = 0 and their contributions superpose; two spectral lines do not automatically produce white light. (2 points)`,
    points: [4,4,2],
  },
  {
    key: 'double-destructive-minima', goalId: ids.minimum,
    title: 'Dunkle Streifen am Doppelspalt überprüfen', titleEn: 'Check dark fringes at a double slit',
    taskContent: `**Material:** Zwei schmale Spalte liefern gleich starke, kohärente Beiträge bei senkrechtem Einfall. Im Fernfeld: λ = 500 nm, Spaltmittenabstand d = 0,20 mm, Schirmabstand L = 2,0 m; die Einhüllende wird vernachlässigt.

1. Begründe die Bedingung Δs = (m + 1/2) λ mit ganzzahligem m aus der Phasendifferenz. Welche m-Werte bezeichnen die beiden dunklen Stellen unmittelbar neben dem Zentrum? (4 BE)
2. Bestimme deren Winkel und Schirmorte, ohne die Schirmgeometrie vorzeitig zu linearisieren. Prüfe die Aussage „Die nächsten dunklen Stellen liegen bei ±5,0 mm“. (4 BE)
3. Beurteile getrennt: Beide Beiträge werden gleichmäßig intensiver; oder nur ein Spalt wird abgeschwächt. Bleiben die vorherigen Minima wirklich dunkel und bleiben ihre Orte im idealisierten Modell gleich? (2 BE)`,
    taskContentEn: `**Material:** Two narrow slits provide equally strong coherent contributions at normal incidence. In the far field λ = 500 nm, centre spacing d = 0.20 mm and screen distance L = 2.0 m; neglect the envelope.

1. Explain Δs = (m + 1/2) λ for integer m from the phase difference. Which m values label the two dark positions next to the centre? (4 points)
2. Determine their angles and screen positions without prematurely linearising the geometry. Check the claim that the nearest dark positions are at ±5.0 mm. (4 points)
3. Assess separately an equal increase in both contributions and attenuation of only one slit. Do the minima remain truly dark, and do their idealised positions change? (2 points)`,
    solutionContent: `1. Eine ungerade Anzahl halber Wellenlängen bedeutet Gegenphasigkeit; bei gleichen Amplituden löschen sich die Beiträge aus. Die nächsten Minima gehören zu m = 0 und m = −1, nicht zu m = ±1. (4 BE)
2. sin θ = ±λ/(2d) = ±0,00125. θ ≈ ±0,07162° und y = L tan θ ≈ ±2,500002 mm. ±5,0 mm sind hier die ersten hellen Maxima; weitere Minima liegen näherungsweise bei ±7,5 mm. Fernfeld und kleine Winkel sind unterschiedliche Annahmen. (4 BE)
3. Gleiche Skalierung beider Amplituden ändert weder die Phasenbedingung noch die vollständige Auslöschung. Bei ungleichen Amplituden bleibt in Gegenphase eine Restamplitude; die Minima liegen im angegebenen idealen Modell an denselben Orten, sind aber nicht mehr vollständig dunkel. (2 BE)`,
    solutionContentEn: `1. An odd number of half wavelengths means opposite phase; equal amplitudes cancel. The nearest minima are m = 0 and m = −1, not m = ±1. (4 points)
2. sin θ = ±λ/(2d) = ±0.00125, θ ≈ ±0.07162° and y = L tan θ ≈ ±2.500002 mm. The positions ±5.0 mm are the first bright maxima; further minima are approximately ±7.5 mm. The far-field and small-angle assumptions are distinct. (4 points)
3. Equal scaling changes neither the phase condition nor full cancellation. Unequal amplitudes leave a residual amplitude in opposite phase: within this ideal model the minima stay at the same positions but are no longer completely dark. (2 points)`,
    points: [4,4,2],
  },
  {
    key: 'grating-polychromatic-spectrum', goalId: ids.grating,
    title: 'Ein Zweilinienspektrum am Gitter auswerten', titleEn: 'Analyse a two-line grating spectrum',
    taskContent: `**Material:** Ein optisches Gitter mit 500 Linien pro Millimeter wird senkrecht beleuchtet. Die Quelle hat zwei schmale Spektrallinien. Eine Linie ist als 450 nm bekannt; für die andere wird das Hauptmaximum erster Ordnung bei θ = 17,46° gemessen. Die Einhüllende unterdrückt keine der hier untersuchten Ordnungen.

1. Bestimme den Spaltmittenabstand g und begründe die Hauptmaximabedingung durch die Phasenlage der Beiträge benachbarter Spalte. (3 BE)
2. Ermittle die unbekannte Wellenlänge und den Winkel erster Ordnung für 450 nm. Deute die Reihenfolge der Farben auf beiden Seiten des Zentrums und den gemeinsamen Zentralfleck. (4 BE)
3. Verwende für diesen Modellvergleich die auf ganze Nanometer gerundete ermittelte Wellenlänge. Können sich unterschiedliche Ordnungen der beiden Linien überlagern? Begründe anhand der kleinsten passenden positiven Ordnungen und prüfe, ob dieser Winkel geometrisch möglich ist. Erkläre, warum man eine gemessene Linie ohne Ordnungsangabe nicht eindeutig einer Wellenlänge zuordnen kann. (3 BE)`,
    taskContentEn: `**Material:** An optical grating with 500 lines per millimetre is illuminated normally. The source has two narrow spectral lines. One is known to be 450 nm; the other has its first-order principal maximum measured at θ = 17.46°. The envelope does not suppress any of the orders considered here.

1. Determine the centre spacing g and explain the principal-maximum condition using the phases from neighbouring slits. (3 points)
2. Determine the unknown wavelength and the first-order angle for 450 nm. Interpret the colour order on both sides and the shared central spot. (4 points)
3. For this model comparison use the inferred wavelength rounded to whole nanometres. Can different orders overlap? Justify the smallest suitable positive orders and check that the angle is geometrically possible. Explain why an angle without an order does not determine a unique wavelength. (3 points)`,
    solutionContent: `1. g = 1/(500 mm⁻¹) = 0,002 mm = 2,0 µm. Gleiche Phasen benachbarter Beiträge erfordern g sin θ = m λ; dadurch stimmen beim regelmäßigen Gitter alle Beiträge im Hauptmaximum überein. (3 BE)
2. λ = g sin 17,46° ≈ 600 nm. Für 450 nm: θ₁ = arcsin(0,225) ≈ 13,00°. Das kürzerwellige Blau liegt beidseitig näher am Zentrum als die längere orange Wellenlänge; links und rechts sind spiegelbildlich. Bei m = 0 überlagern sich beide Linien, aber zwei Linien ergeben nicht zwingend Weiß. (4 BE)
3. Für die gegebenen gerundeten Wellenlängen gilt 3·600 nm = 4·450 nm = 1800 nm: dritte lange und vierte kurze Ordnung überlagern sich bei sin θ = 0,9, also θ ≈ 64,16°. Der Winkel ist kleiner als 90° und damit auf einem ausreichend großen Schirm erreichbar. Ohne m ist λ = g sin θ/m mehrdeutig; jede ganze Ordnung hat eine andere mögliche Wellenlänge. (3 BE)`,
    solutionContentEn: `1. g = 1/(500 mm⁻¹) = 0.002 mm = 2.0 µm. Equal phases between neighbouring contributions require g sin θ = m λ, making all regularly spaced contributions agree at a principal maximum. (3 points)
2. λ = g sin 17.46° ≈ 600 nm. For 450 nm, θ₁ = arcsin(0.225) ≈ 13.00°. Shorter-wave blue is closer to the centre than the longer orange wavelength; the two sides are mirrored. Both lines overlap at m = 0, but two lines need not appear white. (4 points)
3. For the stated rounded wavelengths, 3·600 nm = 4·450 nm = 1800 nm: third long-wave and fourth short-wave orders overlap at sin θ = 0.9, hence θ ≈ 64.16°. This is below 90° and reaches a sufficiently large screen. Without m, λ = g sin θ/m is ambiguous. (3 points)`,
    points: [3,4,3],
  },
  {
    key: 'single-fraunhofer-model', goalId: ids.single,
    title: 'Das Einzelspaltbild aus Elementarwellen modellieren', titleEn: 'Model a single-slit pattern from elementary waves',
    taskContent: `**Material:** Ein Einzelspalt der Breite b = 0,20 mm wird gleichmäßig und senkrecht mit kohärentem Licht der Wellenlänge λ = 500 nm beleuchtet. Der Schirm liegt im Fernfeld bei L = 2,0 m. Verwende u = b sin θ/λ und die normierte Spaltkoordinate ξ zwischen −1/2 und +1/2. Im skalaren Modell ist die normierte resultierende Amplitude A/A₀ = ∫ cos(2πuξ) dξ über diese Spaltkoordinate; die ungeraden Sinusbeiträge heben sich auf.

1. Erläutere die physikalische Bedeutung dieser Überlagerung. Werte das Integral aus und stelle das normierte Intensitätsmodell einschließlich des Zentrums u = 0 auf. (4 BE)
2. Begründe die Minima, bestimme die beiden ersten Minima auf dem Schirm und die Breite des Zentralmaximums. Warum ist m = 0 kein Minimum? (3 BE)
3. Für Nebenmaxima liefert das Modell tan(πu) = πu. Die erste positive nichttriviale Lösung ist u ≈ 1,4303. Berechne ihre relative Intensität und Schirmlage und bewerte die Aussage „Nebenmaxima liegen exakt bei halben Ordnungen“. (3 BE)`,
    taskContentEn: `**Material:** A single slit of width b = 0.20 mm is uniformly illuminated normally by coherent light with λ = 500 nm. A screen is in the far field at L = 2.0 m. Use u = b sin θ/λ and normalised aperture coordinate ξ from −1/2 to +1/2. In the scalar model the normalised resultant amplitude A/A₀ is the integral of cos(2πuξ) over that coordinate; odd sine contributions cancel.

1. Explain the physical meaning of the superposition, evaluate the integral and construct the normalised intensity model including u = 0. (4 points)
2. Explain the minima, find the first two screen minima and the central-maximum width. Why is m = 0 not a minimum? (3 points)
3. Secondary maxima satisfy tan(πu) = πu. The first positive nontrivial solution is u ≈ 1.4303. Calculate its relative intensity and screen position and assess the claim that secondary maxima are exactly at half orders. (3 points)`,
    solutionContent: `1. Die gleichmäßig verteilten Elementarwellen tragen mit ortsabhängigen Phasen zur resultierenden Amplitude bei, nicht als einzeln addierte Intensitäten. Das Integral ergibt A/A₀ = sin(πu)/(πu), daher I/I₀ = [sin(πu)/(πu)]². Für u → 0 ist der Grenzwert 1; das Zentrum ist hell. (4 BE)
2. Nichtverschwindende ganzzahlige u = m liefern Nullstellen: b sin θₘ = m λ mit m = ±1, ±2, … . Für das erste Minimum löschen sich entsprechende Beiträge der beiden Spalthälften paarweise aus. y₁ = L tan(arcsin(λ/b)) ≈ 5,000016 mm, also erste Minima bei ±5,0 mm und Zentralbreite etwa 10,0 mm. u = 0 ist der oben bestimmte Grenzwert, kein Nullpunkt. (3 BE)
3. Bei u = 1,4303 ist I/I₀ ≈ 0,04719 und y ≈ 7,15 mm; symmetrisch auch −7,15 mm. 1,4303 ist nicht 1,5; halbe Ordnungen sind keine exakte Regel. Die Intensitäten müssen auf derselben linearen Skala wie das Zentralmaximum verglichen werden; die Seitenmaxima sind nicht 47 %, sondern etwa 4,72 % des Zentralwerts. (3 BE)`,
    solutionContentEn: `1. Uniformly distributed elementary waves contribute phase-dependent amplitudes, not independently summed intensities. The integral gives A/A₀ = sin(πu)/(πu), hence I/I₀ = [sin(πu)/(πu)]². The limit as u → 0 is 1, so the centre is bright. (4 points)
2. Nonzero integer u = m gives zeros: b sin θₘ = m λ for m = ±1, ±2, … . At the first minimum corresponding contributions from the two aperture halves cancel pairwise. y₁ = L tan(arcsin(λ/b)) ≈ 5.000016 mm: first minima at ±5.0 mm and central width about 10.0 mm. u = 0 has the limit above, not a zero. (3 points)
3. At u = 1.4303, I/I₀ ≈ 0.04719 and y ≈ 7.15 mm, with a symmetric negative position. 1.4303 is not 1.5: half orders are not an exact rule. Compare intensities on the same linear scale; the side peaks are about 4.72 %, not 47 %, of the centre. (3 points)`,
    points: [4,3,3],
  },
]
