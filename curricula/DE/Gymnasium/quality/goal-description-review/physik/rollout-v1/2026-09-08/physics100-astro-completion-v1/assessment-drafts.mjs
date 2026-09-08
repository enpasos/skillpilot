// Resumed bounded authoring on 2026-09-08. Publication requires a separate bound content decision.
import { createHash } from 'node:crypto'

export const ids = {
  S: 'af5dfdbc-5fd6-5c3e-a81b-093cb7c14b93', T: '37013646-f13a-5faf-954c-940f2fd7502f',
  B: 'c52d55c3-b687-586c-b0f9-8ffcd1069424', DM: '3d466956-04fb-58d7-9008-ad8090f8706d',
  DE: 'b4772b06-b10c-52dd-841b-a96ffb7c7e28', G: '1b060e79-dc2d-5e4e-abb5-42eca39f9cc7',
  U: 'db0394ca-297c-5892-b414-525ec186f928', motivation: '5c44b9ba-9b05-4774-95d5-073230d3fc4f',
}
export const packagePath = 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-08/physics100-astro-completion-v1'
const uuid = name => {
  const namespace = Buffer.from('6ba7b8109dad11d180b400c04fd430c8', 'hex')
  const b = createHash('sha1').update(namespace).update('skillpilot:physics:astro-completion:20260908:' + name).digest().subarray(0, 16)
  b[6] = (b[6] & 15) | 80; b[8] = (b[8] & 63) | 128
  const h = b.toString('hex'); return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`
}
export const extraAssessmentCoverage = {
  GW: ['ba16948b-5e07-54af-b77b-776e677c6906'],
  ST: ['da3169ae-c72a-5782-ad95-408167a5c6da'],
  EX: ['49bb609a-bfb7-5391-9120-f5fc737efb9a','6dca3b0a-c872-543b-808f-97e855f5fafd','e28381b4-50ef-5cac-bfa4-b7c8e03aef82'],
}
export const assessmentIds = Object.fromEntries(['S','G','T','DM','DE','U','B','GW','ST','EX'].map(key => [key, uuid(key)]))
export const task = (key, title, titleEn, jurisdictions, phase, de, en, solution, solutionEn, rubric) => ({
  id: assessmentIds[key], shortKey: 'canonical_physics_astro_assessment_' + key.toLowerCase(),
  title, titleEn,
  description: `Die lernende Person kann die bereitgestellte Aufgabe „${title}“ selbstständig bearbeiten und ihre Einordnung anhand des Materials fachlich begründen.`,
  descriptionEn: `The learner can independently complete the supplied task “${titleEn}” and justify the interpretation using the material.`,
  type: 'atomic', weight: 1, tags: ['GK', 'LK', 'Practice', 'Assessment', 'canonical'],
  contains: [], requires: extraAssessmentCoverage[key] ?? [ids[key]],
  dimensionTags: { framework: 'canonical-gymnasium-physics', phase, demandLevel: 'AB2', guidingIdeas: ['LI_KOSMOS'], processCompetencies: ['PK2_MODELLIEREN','PK4_KOMMUNIZIEREN'] },
  ...(jurisdictions.length ? { applicability: { jurisdiction: jurisdictions } } : {}),
  extendedData: { applicabilityMappingInheritance: 'boundary', applicabilityFromRequires: true },
  examData: {
    reviewStatus: 'needs_review', coveredGoalIds: extraAssessmentCoverage[key] ?? [ids[key]], coveredStrands: ['LI_KOSMOS'], demandLevels: ['AB1','AB2','AB3'],
    sourceArtifactPath: packagePath + '/assessments/' + key + '.md',
    taskContent: de, taskContentEn: en, solutionContent: solution, solutionContentEn: solutionEn,
    scoring: { maxPoints: rubric.reduce((n,r)=>n+r[0],0), passingPoints: Math.ceil(rubric.reduce((n,r)=>n+r[0],0)*0.6),
      steps: rubric.map(([points,description,descriptionEn],i)=>({id:'s'+(i+1),points,description:description+'\nEN: '+descriptionEn})) },
  },
})

export const newAssessments = [
  task('B', 'Rotverschiebung und Hintergrundstrahlung gemeinsam deuten', 'Interpret redshift and background radiation together', ['DE-BY'], 'Q4',
`## Material: Zwei kosmologische Beobachtungen

A: Bei vielen fernen Galaxien werden identifizierte Spektrallinien gegenüber denselben Linien im Labor systematisch zu größeren Wellenlängen beobachtet. Ein Expansionsmodell beschreibt, dass sich mit dem Raum auch die Wellenlänge frei laufenden Lichts vergrößert. Einzelne Galaxien können zusätzlich lokale Eigenbewegungen besitzen.

B: Aus nahezu allen Himmelsrichtungen wird Mikrowellenstrahlung mit einem sehr genau thermischen Spektrum und einer heutigen Temperatur von ungefähr 2,7 K beobachtet. Im heißen Urknallmodell ist sie das durch die Expansion abgekühlte Strahlungsrelikt einer früheren heißen, dichten Phase; die Strahlung konnte nach dem Durchsichtigwerden des Universums frei weiterlaufen.

Die knappe Darstellung fasst Beobachtungsarten zusammen, keine neue Messreihe. Quelle für B: ESA, Planck and the cosmic microwave background, https://www.esa.int/Science_Exploration/Space_Science/Planck/Planck_and_the_cosmic_microwave_background (eigene Zusammenfassung).

1. Erklären Sie anhand von A den Zusammenhang zwischen Expansion und kosmologischer Rotverschiebung. Warum wäre die Aussage „Jede einzelne Rotverschiebung beweist allein die kosmische Expansion“ zu stark? (4 BE)
2. Eine Erklärung behauptet, ein Universum könne expandieren, ohne jemals heiß und dicht gewesen zu sein. Welchen zusätzlichen Gesichtspunkt liefert B für die Beurteilung? Verknüpfen Sie Temperatur und Expansion mit der heutigen Beobachtung. (4 BE)
3. Prüfen Sie: „Der Urknall war eine Explosion von einem ausgezeichneten räumlichen Zentrum in vorhandenen leeren Außenraum; A und B legen auch eine bestimmte Ursache dunkler Energie fest.“ Begründen Sie beide Korrekturen. (4 BE)`,
`## Material: Two cosmological observations

A: Identified spectral lines in many distant galaxies are systematically observed at longer wavelengths than the same laboratory lines. An expansion model describes how the wavelength of freely travelling light grows as space expands. Individual galaxies can also have local peculiar motions.

B: Microwave radiation is observed from almost every sky direction, with a closely thermal spectrum and a present temperature of about 2.7 K. In the hot Big Bang model it is the expansion-cooled radiation relic of an earlier hot, dense phase; it travelled freely after the universe became transparent.

This brief account summarizes types of observation, not a new measurement series. Source for B: ESA, Planck and the cosmic microwave background, https://www.esa.int/Science_Exploration/Space_Science/Planck/Planck_and_the_cosmic_microwave_background (brief paraphrase).

1. Use A to explain how expansion relates to cosmological redshift. Why is “Every individual redshift alone proves cosmic expansion” too strong? (4 marks)
2. One account proposes that a universe could expand without ever having been hot and dense. What additional consideration does B provide? Relate temperature and expansion to the present observation. (4 marks)
3. Assess: “The Big Bang was an explosion from a distinguished spatial centre into pre-existing empty surroundings; A and B also establish a specific cause of dark energy.” Justify both corrections. (4 marks)`,
`1. Wachsende physikalische Abstände zwischen mitbewegten, nicht lokal gebundenen Galaxien gehen im Modell mit einer Dehnung frei laufender Lichtwellenlängen einher; ihre mitbewegten Koordinaten bleiben dabei unverändert. Der systematische Befund vieler Galaxien passt zur kosmischen Expansion. Eine einzelne Verschiebung kann zusätzlich oder allein lokale Bewegungsbeiträge enthalten; ihre Messung ist noch keine vollständige Modellprüfung.
2. Expansion allein legt keine frühere Temperatur fest. Das nahezu allseitige thermische Relikt liefert eine zusätzliche, eigenständige Beobachtung für die frühere heiße Phase. Expansion vergrößert seine Wellenlängen und senkt die heutige Strahlungstemperatur; die gemeinsame Deutung von A und B stützt das heiße expandierende Modell, ohne es allein abschließend zu beweisen.
3. Das Modell beschreibt die Expansion des Raums aus einer früheren heißen, dichten Phase, keinen ausgezeichneten Explosionsort mit leerem Außenraum. Diese beiden Beobachtungsarten identifizieren keine Ursache dunkler Energie; dazu wären andere bzw. zusätzliche Beobachtungen und Modelle nötig. Keine eigenständige DE-Analyse wird verlangt.`,
`1. In the model, increasing physical separations between comoving galaxies that are not locally bound accompany stretching of freely travelling light wavelengths; their comoving coordinates remain unchanged. The systematic pattern across many galaxies is consistent with cosmic expansion. One shift can include or arise from local motion; measuring it is not a complete model test.
2. Expansion alone does not establish an earlier temperature. The nearly all-sky thermal relic is an additional independent observation supporting an earlier hot phase. Expansion stretches its wavelengths and lowers its present radiation temperature. The joint interpretation supports the hot expanding model without conclusively proving it by these observations alone.
3. The model describes expansion of space from an earlier hot, dense phase, not a distinguished explosion site with empty exterior. These observations do not identify a cause of dark energy; other or additional observations and models would be needed. No independent dark-energy analysis is required.`,
[[4,'Wellenlängendehnung im Expansionsmodell (2), systematisches Muster von Einzelbefund/Eigenbewegung unterscheiden (2).','Wavelength stretching in the expansion model (2), systematic pattern versus individual/peculiar motion distinguished (2).'],[4,'Expansion allein belegt keine heiße Phase (1), thermisches Relikt als zusätzliche Evidenz (2), Abkühlung/Wellenlängendehnung verknüpft (1).','Expansion alone does not establish a hot phase (1), thermal relic as additional evidence (2), cooling linked to wavelength stretching (1).'],[4,'Keine zentrale Explosion in Außenraum (2), kein Schluss auf eine bestimmte Ursache dunkler Energie (2).','No central explosion into an exterior (2), no inference to a specific cause of dark energy (2).']]),
  task('S', 'Sonne, Planet und Komet im Bahnmodell zuordnen', 'Classify Sun, planet and comet in an orbital model', ['DE-SL','DE-SN'], 'GLOBAL',
`## Material: Drei Körper in einem vereinfachten Sonnensystemmodell

Die Daten sind eigens für die Aufgabe zusammengestellte qualitative Merkmale, keine neue Messreihe. A ist der mit Abstand massereichste Körper und strahlt durch Energieumwandlung in seinem Inneren selbst Licht ab. B ist ein annähernd kugelförmiger Körper, der A auf einer nahezu kreisförmigen Bahn umläuft und dessen Licht überwiegend reflektiert. C ist ein kleiner eis- und staubhaltiger Körper mit einer stark langgestreckten Bahn um A; in Sonnennähe kann eine Gashülle mit Schweif entstehen. Die Bahnen sind stark vereinfacht; nicht alle Planeten- oder Kometenbahnen haben dieselbe Form.

1. Ordnen Sie A, B und C Sonne, Planet und Komet zu. Begründen Sie jede Zuordnung mit einem geeigneten Merkmal. (6 BE)
2. Beschreiben Sie den Aufbau des Sonnensystems mithilfe dieser Körper und ihrer Bahnen. Korrigieren Sie die Aussage: „Weil B von der Erde aus hell erscheint, muss B ein weiterer Stern sein; C umläuft B.“ Begründen Sie beide Korrekturen anhand des Materials. (4 BE)
3. Nennen Sie zwei Grenzen dieser vereinfachten Darstellung gegenüber dem tatsächlichen Sonnensystem. (2 BE)`,
`## Material: Three bodies in a simplified Solar System model

These qualitative features were compiled for this task; they are not a new measurement series. A is by far the most massive body and emits its own light through energy conversion inside it. B is approximately spherical, orbits A on a nearly circular path and mainly reflects A's light. C is a small icy, dusty body on a very elongated orbit around A; near the Sun it may develop a gaseous coma and tail. The orbits are simplified; planetary or cometary orbits do not all have identical shapes.

1. Identify A, B and C as Sun, planet or comet. Justify each choice using an appropriate feature. (6 marks)
2. Describe the Solar System's structure using these bodies and their orbits. Correct the statement: “Because B looks bright from Earth, B must be another star; C orbits B.” Justify both corrections using the material. (4 marks)
3. State two limitations of this simplified representation of the real Solar System. (2 marks)`,
`1. A ist die Sonne: selbstleuchtender, massedominanter Stern. B ist ein Planet: annähernd kugelförmiger Begleiter auf einer Bahn um die Sonne, sichtbar vor allem durch reflektiertes Licht. C ist ein Komet: kleiner eis-/staubhaltiger Körper, hier mit langgestreckter Sonnenumlaufbahn und möglicher Aktivität in Sonnennähe.
2. Die Sonne ist der zentrale massedominante Körper; Planeten und Kometen gehören als umlaufende Körper zum Sonnensystem. Helligkeit allein macht B nicht zum Stern, weil reflektiertes Sonnenlicht genügt. C umläuft laut Material A, nicht B. Die Sonne ist nicht mathematisch unbeweglich: genauere Modelle beziehen den gemeinsamen Schwerpunkt ein; das wird hier nicht verlangt.
3. Beispielsweise fehlen weitere Planeten, Monde, Asteroiden und Zwergplaneten; Größen/Entfernungen und räumliche Bahnneigungen sind nicht dargestellt. Gültige alternative Grenzen zählen. Nicht behaupten, jeder Komet habe einen Schweif oder alle Planetenbahnen seien perfekte Kreise.`,
`1. A is the Sun: a self-luminous, mass-dominant star. B is a planet: an approximately spherical companion orbiting the Sun, mainly seen in reflected light. C is a comet: a small icy/dusty body, here on an elongated solar orbit with possible activity near the Sun.
2. The Sun is the central mass-dominant body; planets and comets are orbiting Solar System members. Brightness alone does not make B a star because reflected sunlight suffices. The material says that C orbits A, not B. The Sun is not mathematically immobile: more detailed models use the common centre of mass; this refinement is not required.
3. Examples include omitted planets, moons, asteroids or dwarf planets, missing sizes/distances and orbital inclinations. Accept other valid limits. Do not claim every comet has a tail or all planetary orbits are perfect circles.`,
[[6,'Drei richtige Klassen mit je passendem Merkmal (je 2).','Three correct classes with an appropriate feature each (2 each).'],[4,'Massedominante Sonne und Umlaufstruktur (2); Helligkeit/Reflexion und C-Bahn korrekt berichtigt (je 1).','Mass-dominant Sun and orbital structure (2); correct reflection and C-orbit corrections (1 each).'],[2,'Zwei konkrete Modellgrenzen (je 1).','Two concrete model limitations (1 each).']]),
  task('G', 'Unser Sonnensystem in der Milchstraße verorten', 'Locate the Solar System within the Milky Way', ['DE-SL'], 'GLOBAL',
`## Material: Ein Planetariumsplakat

Das Plakat zeigt drei beschriftete Ausschnitte: I „Sonne mit Planeten und kleineren Begleitern“; II „Milchstraße: sehr viele Sterne, Sternsysteme, Gas und Staub“; III „Mehrere voneinander verschiedene Galaxien“. Die Größenverhältnisse sind nicht maßstäblich. Für die Aufgabe gilt als gesicherte Zusatzinformation: Die Sonne liegt in der Scheibe der Milchstraße, deutlich außerhalb des galaktischen Zentrums.

1. Ordnen Sie die Ausschnitte als räumliche Einschachtelung vom Sonnensystem über die Galaxie zur Gruppe mehrerer Galaxien. Beschreiben Sie jeweils, was zum größeren System gehört. (4 BE)
2. Ein Besucher sagt: „Unsere Sonne ist der Mittelpunkt der Milchstraße; die Milchstraße ist nur die Umlaufbahn der Erde.“ Korrigieren Sie beide Aussagen und beschreiben Sie den Unterschied zwischen Sternsystem und Galaxie. (6 BE)
3. Warum kann man aus dem Plakat weder das Alter noch die Gesamtausdehnung des Universums bestimmen? (2 BE)`,
`## Material: A planetarium poster

The poster has three labelled panels: I “Sun with planets and smaller companions”; II “Milky Way: very many stars, stellar systems, gas and dust”; III “Several distinct galaxies”. Sizes are not to scale. Use this established additional information: the Sun lies in the Milky Way's disc, well outside the galactic centre.

1. Order the panels as spatial nesting from Solar System through galaxy to a group of galaxies. Describe what belongs to each larger system. (4 marks)
2. A visitor says: “Our Sun is the centre of the Milky Way; the Milky Way is just Earth's orbit.” Correct both statements and distinguish a stellar system from a galaxy. (6 marks)
3. Why can neither the universe's age nor its total spatial extent be determined from this poster? (2 marks)`,
`1. I gehört zu II; II ist eine der Galaxien in III. Ein Sonnensystem besteht hier aus einem Stern und seinen Begleitern; eine Galaxie umfasst sehr viele Sterne/Sternsysteme und interstellare Materie. III enthält mehrere Galaxien, nicht bloß mehrere Planeten.
2. Die Sonne ist ein Stern in der Scheibe der Milchstraße außerhalb ihres Zentrums. Die Erdbahn gehört zum Sonnensystem; sie ist keine Galaxie. Die Milchstraße ist ein sehr viel größeres zusammengesetztes System mit vielen Sternen und Sternsystemen sowie Gas/Staub. Nicht verlangen, jedes Sternsystem müsse genau einen Stern besitzen.
3. Eine räumliche, unmaßstäbliche Hierarchie enthält keine Zeitmessung und keine Information über das gesamte Universum. Die Aufgabe prüft G, nicht eigenständig U.`,
`1. I belongs within II; II is one galaxy in III. Here a solar system consists of a star and its companions; a galaxy contains very many stars/stellar systems and interstellar matter. III contains several galaxies, not merely planets.
2. The Sun is a star in the Milky Way's disc outside its centre. Earth's orbit belongs to the Solar System; it is not a galaxy. The Milky Way is a much larger composite system containing many stars and stellar systems plus gas/dust. Do not require every stellar system to contain exactly one star.
3. A non-scale spatial hierarchy supplies neither a time measurement nor information about the whole universe. This task assesses G, not U independently.`,
[[4,'Richtige Einschachtelung I in II in III (2), Mitgliederbeziehungen erklärt (2).','Correct nesting I in II in III (2), membership relations explained (2).'],[6,'Sonnenposition richtig (2), Erdbahn von Galaxie unterschieden (2), Systemvergleich (2).','Correct solar location (2), orbit/galaxy distinction (2), system comparison (2).'],[2,'Keine Zeitmessung (1), keine Gesamtausdehnung aus unmaßstäblichem Ausschnitt (1).','No time measurement (1), no total extent from a non-scale excerpt (1).']]),
  task('T', 'Zwei Gezeitenbereiche im Erdmodell erklären', 'Explain two tidal regions in an Earth model', ['DE-HE','DE-TH'], 'Q4',
`## Material: Gravitationswirkung relativ zum Erdmittelpunkt

Der Mond befindet sich rechts von der Erde. In einem vereinfachten Momentanmodell haben drei frei gedachte Testmassen gleiche Masse. Alle drei Mondanziehungen zeigen nach rechts; ihre relativen Beträge sind: mondferne Seite 0,96; Erdmittelpunkt 1,00; mondnahe Seite 1,04. Die Zahlen sind konstruierte dimensionslose Vergleichswerte, keine berechneten realen Gezeitenbeschleunigungen. Für die Verformung relativ zum mitfallenden Erdmittelpunkt ist die Differenz zur mittleren Anziehung entscheidend, nicht die volle Kraft allein.

1. Bestimmen Sie die drei relativen Differenzen zur Anziehung im Erdmittelpunkt und ihre Richtungen. Erklären Sie damit qualitativ, warum das Modell auf beiden Seiten eine Streckung entlang der Erde-Mond-Verbindung beschreibt. (6 BE)
2. Auch die Sonne wirkt gezeitenerzeugend. Erklären Sie qualitativ, warum annähernd geradlinige Sonne-Erde-Mond-Stellungen stärkere und ungefähr rechtwinklige Stellungen schwächere Tidenunterschiede begünstigen. Muss die Sonnenanziehung insgesamt schwächer als die Mondanziehung sein, damit der Mond den größeren Gezeitenbeitrag liefert? Begründen Sie. (6 BE)
3. Prüfen Sie: „Das Modell sagt für jeden Hafen genau zwei gleich hohe Fluten zu festen Uhrzeiten voraus.“ Nennen Sie zwei konkrete Grenzen dieser Schlussfolgerung. (4 BE)`,
`## Material: Gravity relative to Earth's centre

The Moon is to Earth's right. In a simplified instantaneous model, three freely imagined test masses have equal mass. All three lunar attractions point right; relative magnitudes are 0.96 on the far side, 1.00 at Earth's centre and 1.04 on the near side. These are constructed dimensionless comparison values, not calculated real tidal accelerations. Deformation relative to the freely falling centre depends on the difference from the central attraction, not on the full force alone.

1. Determine the three differences relative to the attraction at Earth's centre and their directions. Explain qualitatively why this model stretches both sides along the Earth–Moon line. (6 marks)
2. The Sun also produces tides. Explain qualitatively why approximately aligned Sun–Earth–Moon configurations favour larger and approximately right-angled configurations smaller tidal ranges. Must the Sun's total gravitational attraction be weaker than the Moon's for the Moon to contribute more strongly to tides? Explain. (6 marks)
3. Assess: “The model predicts exactly two equally high tides at fixed times for every harbour.” State two concrete limitations of this inference. (4 marks)`,
`1. Fern: 0,96−1,00=−0,04, also relativ zum Zentrum nach links; Zentrum 0; nah: +0,04 nach rechts. Beide Differenzwirkungen zeigen entlang der Verbindung vom Zentrum weg. Auf der fernen Seite wirkt keine absolute Mondabstoßung: die Mondanziehung ist dort nur schwächer als am Zentrum.
2. Sonnen- und Mondgezeiten überlagern sich. Bei annähernder Geradlinigkeit verstärken sich die Streckungen; bei etwa rechtem Winkel schwächen ihre unterschiedlichen Vorzugsrichtungen den resultierenden Tidenunterschied ab. Es geht um räumliche Unterschiede der Gravitationswirkung. Die größere gesamte Sonnenanziehung widerspricht deshalb nicht einem größeren Gezeitenbeitrag des nahen Mondes; die Gradienten sind entscheidend.
3. Das Momentan-/Gleichgewichtsmodell enthält keine reale Küsten-/Meeresbodengeometrie, Strömung, Resonanz, Reibung oder zeitlich wechselnde Stellungen. Schon zwei solcher konkreten Grenzen widerlegen eine universell genaue Hafenprognose. Es liefert keine festen Uhrzeiten oder garantiert gleich hohe Fluten.`,
`1. Far side: 0.96−1.00=−0.04, left relative to the centre; centre: 0; near side: +0.04, right. Both differential effects point away from the centre along the connecting line. The Moon does not absolutely repel the far side: its attraction there is merely weaker than at the centre.
2. Solar and lunar tidal effects superpose. Approximate alignment reinforces the stretching; near a right angle, their differing preferred directions reduce the resulting range. Tides depend on spatial differences in gravitational action. Stronger total solar attraction therefore does not contradict a larger lunar tidal contribution; gradients matter.
3. The instantaneous/equilibrium model omits real coastlines, seabed geometry, currents, resonances, friction and changing configurations. Any two concrete limitations rule out a universally exact harbour forecast. It supplies no fixed tide times or guaranteed equal heights.`,
[[6,'Differenzen −0,04/0/+0,04 (2), Richtungen (2), beidseitige relative Streckung ohne absolute Abstoßung (2).','Differences −0.04/0/+0.04 (2), directions (2), two-sided relative stretching without absolute repulsion (2).'],[6,'Überlagerung in Linie (2) und bei rechtem Winkel (2), Gradient statt Gesamtanziehung (2).','Aligned superposition (2), right-angle case (2), gradient rather than total attraction (2).'],[4,'Zwei konkrete Modellgrenzen mit Bezug zur Hafenprognose (je 2).','Two concrete limitations linked to harbour prediction (2 each).']]),
  task('DM', 'Galaxienbewegung und bekannte Materie vergleichen', 'Compare galactic motion with known matter', ['DE-HE','DE-BW','DE-BY'], 'Q4',
`## Material: Modellvergleich für eine Galaxie

Die folgende Tabelle ist ein konstruierter Lehrdatensatz. Ein Newton-Modell verwendet die unabhängig abgeschätzte bekannte gewöhnliche Materie: Sterne sowie auch nicht selbstleuchtendes Gas und Staub. Bei drei Radien erwartet es Kreisbahngeschwindigkeiten von 180, 145 und 120 km/s; beobachtungsähnliche Vergleichswerte betragen 185, 190 und 188 km/s. Die für den Vergleich verwendete kombinierte Unsicherheitsgrenze beträgt jeweils ±5 km/s. Die Kreisbahnannahme und die Materieabschätzung müssen in einer wirklichen Untersuchung gesondert geprüft werden.

1. Vergleichen Sie die Reihen. An welchen Stellen reicht das Modell im Rahmen der angegebenen Unsicherheit nicht aus? (4 BE)
2. Erläutern Sie, wie zusätzliche gravitativ wirksame dunkle Materie diesen Befund im verwendeten Gravitationsmodell erklären kann. Warum genügt die Aussage „Gas und Staub leuchten nicht selbst“ noch nicht als Argument für dunkle Materie? (6 BE)
3. Beurteilen Sie die Folgerung: „Diese Tabelle beweist eine bestimmte neue Teilchenart.“ Unterscheiden Sie Beobachtung, Modellschluss und noch offene Erklärung; nennen Sie eine zu prüfende Annahme. (6 BE)`,
`## Material: Comparing models for a galaxy

The table below is a constructed teaching dataset. A Newtonian model uses independently estimated known ordinary matter: stars and also non-self-luminous gas and dust. At three radii it predicts circular orbital speeds of 180, 145 and 120 km/s; observation-like comparison values are 185, 190 and 188 km/s. Use a combined uncertainty bound of ±5 km/s for each comparison. Circular-orbit assumptions and matter estimates require separate checking in a real investigation.

1. Compare the series. Where does the model fail within the stated uncertainty? (4 marks)
2. Explain how additional gravitationally effective dark matter can account for this result within the adopted gravity model. Why is “gas and dust do not emit their own light” insufficient evidence for dark matter? (6 marks)
3. Assess: “This table proves a specific new particle species.” Distinguish observation, model inference and an unresolved explanation; name one assumption that needs checking. (6 marks)`,
`1. Abweichungen: 5, 45, 68 km/s. Der erste Wert ist an der Unsicherheitsgrenze vereinbar; die beiden äußeren sind es nicht. Beobachtungsähnlich bleibt v annähernd gleich, während das gewöhnliche-Materie-Modell deutlich abfällt.
2. Unter der gewählten Gravitation kann zusätzlich verteilte Masse stärkere Bindung und größere Bahngeschwindigkeiten erklären. Dunkle Materie bezeichnet hier den zusätzlichen Modellanteil über die bereits berücksichtigte bekannte gewöhnliche Materie hinaus. Gas/Staub sind gewöhnliche Materie und wurden ausdrücklich mitgerechnet; bloßes Nichtleuchten ist kein hinreichendes Unterscheidungsmerkmal.
3. Die konstruierte Reihe demonstriert nur die Argumentstruktur. Ein wirklicher Geschwindigkeitsüberschuss wäre ein Befund; zusätzliche dunkle Masse wäre ein modellabhängiger Schluss. Teilchenart/Mikrophysik folgen daraus nicht. Zu prüfen sind etwa Materiemenge/-verteilung, Entfernungen, Kreisbahnannahme oder Gravitationsmodell. Gleichwertige fachlich richtige Alternativen anerkennen.`,
`1. Differences are 5, 45 and 68 km/s. The first is compatible at the uncertainty limit; the outer two are not. The observation-like speeds stay nearly flat whereas the ordinary-matter model declines strongly.
2. Within the adopted gravity theory, additional distributed mass can account for stronger binding and higher orbital speeds. Here dark matter denotes an extra model component beyond the included known ordinary matter. Gas/dust are ordinary matter and were explicitly included; non-luminosity alone is not a sufficient criterion.
3. The constructed series only illustrates the argument. A real speed excess would be an observation; additional dark mass would be a model-dependent inference. It does not identify a particle species or microphysics. Check matter amount/distribution, distances, circular motion or the gravity model. Accept equivalent valid alternatives.`,
[[4,'Abweichungen und Unsicherheitsvergleich (2), unterschiedlicher Verlauf (2).','Differences/uncertainty comparison (2), differing trends (2).'],[6,'Zusätzliche Masse als modellgebundene Erklärung (3); Gas/Staub schon gewöhnlich und berücksichtigt, Unsichtbarkeit unzureichend (3).','Additional mass as a model-bound account (3); ordinary gas/dust included and non-luminosity insufficient (3).'],[6,'Künstliche Daten nicht als Naturbeweis (1), Befund/Schluss unterschieden (2), keine Teilchenidentifikation (2), konkrete Annahme (1).','Constructed data not natural proof (1), observation/inference distinguished (2), no particle identification (2), concrete assumption (1).']]),
  task('DE', 'Expansion von beschleunigter Expansion unterscheiden', 'Distinguish expansion from accelerated expansion', ['DE-HE'], 'Q4',
`## Material: Zwei Modellverläufe und eine Beobachtungseinordnung

Für dieselben vier gleich weit auseinanderliegenden kosmischen Zeitpunkte t=0,1,2,3 (Einheit frei gewählt) seien die dimensionslosen Skalenfaktoren gegeben:

| Modell | a(0) | a(1) | a(2) | a(3) |
|---|---:|---:|---:|---:|
| A | 0,50 | 0,60 | 0,70 | 0,80 |
| B | 0,50 | 0,60 | 0,75 | 0,95 |

Dies sind konstruierte Modellwerte, keine gemessene Zeitreihe des Universums. Der Abstand zweier ideal mitbewegter, nicht lokal gebundener Bezugspunkte ist proportional zu a. Beobachtungsbezug: Entfernungs-Rotverschiebungs-Vergleiche unter anderem mit Typ-Ia-Supernovae liefern Hinweise auf eine spätzeitlich beschleunigte Expansion. „Dunkle Energie“ bezeichnet einen Modellbegriff für deren Beschreibung; die physikalische Natur ist damit nicht geklärt. Quelle: NASA Science, Dark Energy, https://science.nasa.gov/dark-energy/ (eigene knappe Zusammenfassung).

1. Bestimmen und vergleichen Sie die drei Zuwächse von a in A und B. Welches Modell expandiert, welches zeigt darüber hinaus beschleunigte Expansion? (4 BE)
2. Ordnen Sie dunkle Energie dem Beobachtungsproblem zu. Begründen Sie, weshalb eine einzige Galaxien-Rotverschiebung weder beschleunigte Expansion noch die Natur dunkler Energie nachweist. (6 BE)
3. Korrigieren Sie: „Dunkle Energie ist einfach zusätzliche unsichtbare Materie, die in der Tabelle die Sterne einer Galaxie auf ihren Bahnen hält; also müssen auch Sonnensystem und Lineal mit a wachsen.“ (6 BE)`,
`## Material: Two model histories and observational context

At four equally spaced cosmic times t=0,1,2,3 (arbitrary unit), dimensionless scale factors are:

| Model | a(0) | a(1) | a(2) | a(3) |
|---|---:|---:|---:|---:|
| A | 0.50 | 0.60 | 0.70 | 0.80 |
| B | 0.50 | 0.60 | 0.75 | 0.95 |

These are constructed model values, not a measured cosmic time series. Distance between ideal comoving reference points that are not locally bound is proportional to a. Observational context: distance–redshift comparisons, including Type Ia supernovae, provide evidence for late-time accelerated expansion. “Dark energy” is a model term describing this; its physical nature is not thereby established. Source: NASA Science, Dark Energy, https://science.nasa.gov/dark-energy/ (brief paraphrase).

1. Calculate and compare the three increases in a for A and B. Which model expands, and which additionally accelerates? (4 marks)
2. Relate dark energy to the observational problem. Explain why a single galaxy redshift establishes neither accelerated expansion nor the nature of dark energy. (6 marks)
3. Correct: “Dark energy is simply extra invisible matter holding a galaxy's stars in orbit in this table; therefore the Solar System and a ruler must also grow with a.” (6 marks)`,
`1. A: 0,10/0,10/0,10; B: 0,10/0,15/0,20. Beide expandieren. Nur B zeigt für gleiche Zeitintervalle zunehmende Zuwächse und damit die dargestellte beschleunigte Expansion. Nicht H= a'/a mit a' verwechseln.
2. Dunkle Energie dient im kosmologischen Modell zur Beschreibung der beobachteten beschleunigten Expansion. Eine einzelne Rotverschiebung enthält keine eindeutige Expansionsgeschichte, kann lokale Bewegungen enthalten und bestimmt keine Beschleunigung. Auch die kombinierte Evidenz identifiziert nicht automatisch einen mikrophysikalischen Mechanismus.
3. Galaktische zusätzliche Gravitationsbindung betrifft die dunkle-Materie-Frage, nicht die hier dargestellte kosmische Beschleunigung. Tabelle und Modell beschreiben großräumige, ideal mitbewegte und nicht lokal gebundene Abstände; lokal gebundene Sonnensysteme oder Festkörper folgen nicht einfach a. Keine Aussage, dunkle Energie sei bereits als Teilchenstoff identifiziert.`,
`1. A: 0.10/0.10/0.10; B: 0.10/0.15/0.20. Both expand. Only B shows increasing changes over equal intervals, hence the illustrated accelerated expansion. Do not confuse H=a'/a with a'.
2. Dark energy describes observed accelerated expansion within a cosmological model. One redshift gives no unique expansion history, may contain peculiar motion and does not establish acceleration. Even combined evidence does not automatically identify a microscopic mechanism.
3. Extra galactic gravitational binding is the dark-matter problem, not the cosmic acceleration illustrated here. These values describe large-scale ideal comoving, non-locally-bound distances. Bound Solar Systems and solid rulers do not simply follow a. Do not claim dark energy has been identified as a particle substance.`,
[[4,'Zuwächse beider Reihen (2), beide Expansion/nur B Beschleunigung (2).','Changes in both series (2), both expand/only B accelerates (2).'],[6,'Modellbegriff richtig zugeordnet (2), Einzelrotverschiebung unzureichend begründet (2), Natur offen (2).','Correct model-term interpretation (2), reason one redshift is insufficient (2), physical nature unresolved (2).'],[6,'DM-Frage von DE-Frage abgegrenzt (3), lokal gebundene Systeme nicht pauschal mitskalieren (3).','Dark-matter and dark-energy questions distinguished (3), locally bound systems not universally rescaled (3).']]),
  task('U', 'Weltalter, Lichtlaufzeit und Ausdehnung auseinanderhalten', 'Distinguish cosmic age, light-travel time and spatial extent', ['DE-HE','DE-BW','DE-RP'], 'Q4',
`## Material: Aussagen eines Kosmos-Faltblatts

Für diese qualitative Modellaufgabe werden folgende gerundete Informationen bereitgestellt: Das kosmologische Standardmodell ergibt seit der frühen heißen Phase etwa 13,8 Milliarden Jahre. Der heutige modellierte Abstand zu einem mitbewegten Emissionsort sehr früh ausgesandten Lichts kann wegen der Expansion größer sein als Lichtlaufzeit mal Lichtgeschwindigkeit. Das beobachtbare Universum ist der prinzipiell durch empfangbare Signale zugängliche Bereich; außerhalb können weitere Bereiche liegen. Aus der Beobachtungsgrenze allein folgt keine endliche Gesamtgröße. Ein Lichtjahr ist eine Längeneinheit, nämlich die Strecke, die Licht im Vakuum in einem Jahr zurücklegt. Es wird keine Messung der Gesamtgröße des Universums behauptet. Quellen: NASA Science, What is the Universe? (https://science.nasa.gov/exoplanets/what-is-the-universe/), und NASA, How Big is Space? (https://www.nasa.gov/science-research/astrophysics/how-big-is-space-we-asked-a-nasa-expert-episode-61/), eigene kurze Zusammenfassung.

1. Prüfen und berichtigen Sie jeweils: (a) „13,8 Milliarden Lichtjahre ist das Alter des Universums.“ (b) „Weil das Universum endlich alt ist, muss seine gesamte räumliche Ausdehnung endlich sein.“ (c) „Der heutige Radius des beobachtbaren Universums muss genau c mal Weltalter betragen.“ (9 BE)
2. Eine neue Aufnahme zeigt weiter entfernte Objekte als eine ältere Aufnahme. Bedeutet das zwangsläufig, dass das Universum zwischen beiden Aufnahmen älter geworden ist, als es das Modell vorhersagt, oder dass zuvor außerhalb des gesamten Universums fotografiert wurde? Begründen Sie und unterscheiden Sie instrumentelle Reichweite, beobachtbaren Bereich und Gesamtuniversum. (5 BE)
3. Nennen Sie je eine Aussage aus dem Material über Zeit und über Raum. (2 BE)`,
`## Material: Statements in a cosmos leaflet

This qualitative model task supplies rounded information: the standard cosmological model gives about 13.8 billion years since the early hot phase. Because of expansion, the modelled present distance to a comoving emission site of very early emitted light can exceed light-travel time times the speed of light. The observable universe is the region accessible in principle through receivable signals; further regions may lie beyond it. An observational boundary alone implies no finite total size. A light-year is a length unit: the distance light travels in vacuum in one year. No measurement of the universe's total size is claimed. Sources: NASA Science, What is the Universe? (https://science.nasa.gov/exoplanets/what-is-the-universe/), and NASA, How Big is Space? (https://www.nasa.gov/science-research/astrophysics/how-big-is-space-we-asked-a-nasa-expert-episode-61/), brief paraphrase.

1. Assess and correct: (a) “13.8 billion light-years is the universe's age.” (b) “Because the universe has a finite age, its entire spatial extent must be finite.” (c) “The present radius of the observable universe must equal c times its age exactly.” (9 marks)
2. A new image reveals more distant objects than an older image. Must this mean that the universe has aged more than the model predicts between the images, or that earlier observations photographed outside the entire universe? Justify and distinguish instrumental reach, observable region and the whole universe. (5 marks)
3. Give one statement from the material about time and one about space. (2 marks)`,
`1. (a) Jahre messen Zeit; Lichtjahre messen Länge. Das angegebene Alter ist etwa 13,8 Milliarden Jahre. (b) Ein endliches Alter bestimmt nicht die gesamte räumliche Größe. Die Ausdehnung kann nicht aus der zeitlichen Zahl allein abgeleitet werden. (c) c mal Alter ist eine Lichtlaufzeitstrecke in einem vereinfachten statischen Bild; der Raum expandiert während des Lichtwegs. Heutiger räumlicher Abstand und zurückliegende Lichtlaufzeit sind deshalb nicht durch diese naive Gleichsetzung identisch.
2. Ein empfindlicheres Instrument kann bisher nicht registrierte schwache/ferne Objekte im zugänglichen Bereich nachweisen. Die instrumentelle Reichweite ist keine Grenze des gesamten Universums und kann enger als die prinzipielle Beobachtungsgrenze sein. Ein verbessertes Bild allein erzwingt weder ein abweichendes Weltalter noch Aussagen über einen Außenraum jenseits des gesamten Universums.
3. Zeit: etwa 13,8 Milliarden Jahre seit der frühen heißen Phase. Raum: der prinzipiell beobachtbare Bereich ist nicht automatisch das Gesamtuniversum; ein Lichtjahr bezeichnet eine Strecke.`,
`1. (a) Years measure time; light-years measure length. The stated age is about 13.8 billion years. (b) Finite age does not determine total spatial size; spatial extent cannot be inferred from that time alone. (c) c times age is a light-travel distance in a simplified static picture. Space expands during light propagation, so present distance and elapsed light-travel time are not related by that naive equality.
2. A more sensitive instrument can detect previously unregistered faint/distant objects within the accessible region. Instrumental reach is not a boundary of the whole universe and may be smaller than the principled observational limit. An improved image alone implies neither a revised cosmic age nor an exterior beyond the whole universe.
3. Time: about 13.8 billion years since the early hot phase. Space: the observable region is not automatically the whole universe; a light-year is a distance.`,
[[9,'Drei Korrekturen jeweils mit tragender Begründung (je 3).','Three corrections with supporting reasons (3 each).'],[5,'Instrumentelle von prinzipieller Grenze unterscheiden (2), keine automatische Gesamtgrenze (1), keine erzwungene Altersrevision (2).','Instrumental/principled limits distinguished (2), no automatic total boundary (1), no forced age revision (2).'],[2,'Eine Zeit- und eine Raumaussage korrekt (je 1).','One correct temporal and one spatial statement (1 each).']]),
]

export const coverageJudgments = newAssessments.map(g => ({ assessmentGoalId: g.id, coveredGoalIds: g.requires,
  rationale: 'All questions, material, solution and scoring above were individually authored for this named goal. Related background and model-limit statements are not extra coverage claims.',
  status: 'ai_candidate_needs_content_counterreview', humanApproval: false }))

export function renderAssessmentMaterial(goal) {
  const e = goal.examData
  return `# ${goal.title}\n\nStatus: ${e.reviewStatus}. AI-authored curriculum task; no human approval claimed.\nGoal ID: ${goal.id}\nActual covered goal IDs: ${e.coveredGoalIds.join(', ')}\n\n${e.taskContent}\n\n## Lösung / Deutsch\n\n${e.solutionContent}\n\n${e.taskContentEn}\n\n## Solution / English\n\n${e.solutionContentEn}\n\n## Bewertungsraster / Scoring\n\nMaximum: ${e.scoring.maxPoints}; passing threshold: ${e.scoring.passingPoints}.\n\n${e.scoring.steps.map(s => `- ${s.id}: ${s.points} BE / marks — ${s.description}`).join('\n')}\n`
}
