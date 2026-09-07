# Two concrete Q4 physics assessment proposals

External AI authoring proposal only; not applied or approved. Each has 30 points and a proposed pass threshold of 18. Basic-course level, also usable as advanced-course foundation practice. No claim of an official original examination or an actual measurement series.

## Solar System: orbits and tides

ID: `335a75b0-f691-5867-8ce3-3c971d541b9f`. Proposed duration: 60 min.

A planetarium is checking two teaching models: a model of orbits closer to and farther from the Sun and a simplified tidal model. The numbers for P, K and the lunar accelerations are explicitly synthetic, physically plausible teaching data; P and K are not claimed to be newly identified real celestial bodies and the table is not a measurement series. A calculator is allowed. No external materials are needed.

### A-M1

The Sun is approximated as a stationary central star that dominates the mass. All bodies considered here are bound to it; mutual perturbations and outgassing effects are neglected. An astronomical unit (AU) is a unit of length. For the reference Earth orbit, a_E=1.00 AU and T_E=1.00 year. The semimajor axis a describes the size of an elliptical orbit, not the instantaneous distance from the Sun.

| Model body | Description | Semimajor axis a | Orbit shape |
| --- | --- | --- | --- |
| P | Planet, much less massive than the Sun | 4.00 AU | only mildly elongated ellipse |
| K | small ice-rich comet | 9.00 AU | highly elongated ellipse |

### A-M2

In the idealized tidal model the Moon lies to the right of Earth. N is the near-side surface point, C the center of Earth and F the far-side surface point, all on the Earth–Moon line. The following accelerations due to the Moon alone all point to the right. To consider motion relative to Earth’s center, compare g_M at each point with g_M(C).

| Position | Lunar acceleration g_M in m/s² |
| --- | --- |
| N | 3.43 · 10^−5 |
| C | 3.32 · 10^−5 |
| F | 3.21 · 10^−5 |

Earth is idealized as spherical with a freely moving ocean. Include the solar contribution qualitatively when comparing new/full moon with quarter moon. No actual high-water times or coastal heights are requested.

### A1 (6 points)

Using M1, describe the model’s structure and the different roles of the Sun, planet P and comet K. Sketch both orbits with the Sun and locate the Sun within the ellipses. Explain which general statement about comets does not follow from this single example orbit.

### A2 (12 points)

State Kepler’s three laws, including the validity condition when comparing different bodies. Use M1 to calculate the periods of P and K. Use the second law to explain whether K moves faster near or far from the Sun. Finally, judge whether the same numerical Earth normalization can be applied without further information to a planet around another star.

### A3 (12 points)

Compare the lunar attraction at N, C and F in M2. Determine the two acceleration differences relative to C and mark their directions. Use them to explain qualitatively why the idealized ocean is stretched on both sides of Earth; explicitly state whether the Moon attracts the far side. Explain the difference between spring and neap tides through the combined action of Moon and Sun. Give two reasons why this model alone cannot predict high-water time and height at a real coastal location.

## Expected solution and scoring

### A1 (6 points)

The Sun is the mass-dominant, self-luminous central star; P and K orbit it and are not additional stars. P is a planet, while K is a much smaller ice-rich body that may become conspicuous through released material near the Sun. In the sketch the Sun occupies a common focus; P has the less elongated orbit and K the more elongated one. Distances vary along the ellipses. K’s model orbit does not show that all comets have exactly this shape, size or period. The sketch need not show sizes and distances to scale.

### A2 (12 points)

1. Bound orbits are ellipses with the Sun at one focus. 2. The Sun–body radius vector sweeps out equal areas in equal times. 3. For the same mass-dominant central body, T²/a³ is constant; a is the semimajor axis. Thus T_P=T_E(a_P/a_E)^(3/2)=1 year·4^(3/2)=8.00 years and T_K=1 year·9^(3/2)=27.0 years. AU cancels in the ratio. Near the Sun, K must cover a longer orbital segment in the same time to sweep out the same area with a shorter radius vector, so it is faster there. The constant depends on central mass. For another star, the Earth normalization is unjustified without its mass or a suitable reference orbit.

### A3 (12 points)

At all three positions lunar acceleration points toward the Moon, but it decreases from N through C to F. Relative to C, Δg_N=+1.1·10^−6 m/s² points right and Δg_F=−1.1·10^−6 m/s² points left relative to Earth’s center; Δg_C=0. The near side accelerates toward the Moon more strongly than the center, and the far side less strongly. Relative to the falling Earth this produces stretching on both sides. The Moon still attracts the far side; its relative motion is not a repulsive lunar force. At new/full moon the tidal contributions reinforce along approximately the same axis, giving a larger tidal range (spring tide). At quarter moon their axes are approximately perpendicular and partly counteract, giving a smaller range (neap tide). Coastline shape, water depth, friction and dynamic lag, and weather can change actual heights and times; two sensibly explained influences suffice.

| ID | Points | Expected performance |
| --- | ---: | --- |
| A1-star | 2 | Sun identified as a self-luminous mass-dominant star, orbiting bodies not additional stars; 1 point each. |
| A1-bodies | 2 | Planet and small ice-rich comet classified by their different roles and corresponding orbit character; 1 point each. |
| A1-model | 2 | Coherent arrangement of both orbits around the Sun (1); no universal generalization from this comet orbit (1). |
| A2-laws | 5 | Ellipse/focus, equal areas in equal times, constant T²/a³, a as semimajor axis, and same central mass as comparison condition; 1 point each. Exact focus placement is scored here, not again in A1. |
| A2-periods | 4 | For P and K, correct ratio with T_E and result 8 years or 27 years with a time unit; 2 points each. |
| A2-speed | 2 | Identifies faster motion near the Sun (1) and explains it through equal swept area with shorter radius vector (1). |
| A2-central-mass | 1 | Rejects transferring Earth normalization to an unknown different central mass with a valid reason. |
| A3-relative | 7 | All attractions toward Moon (1), strength N>C>F (1), differences +1.1·10^−6 and −1.1·10^−6 m/s² (1 each), reference to Earth’s center rather than repulsion (1), stretching direction at N and F explained (1 each). |
| A3-solar | 3 | Solar contribution reinforcing at new/full moon (1), partly counteracting at quarter moon (1), correct spring/neap classification with larger/smaller range (1). |
| A3-limits | 2 | Explains two physically sensible influences on actual coastal timing/heights; 1 point each. |

18/30 retains the existing 60-percent threshold as an explicit authoring proposal, not as a claimed official grading boundary. Each point is tied to observable performance below. Equivalent diagrams, wording and solution methods are accepted. A propagated arithmetic error is penalized only at its origin; correct subsequent physics can receive points. Passing the total does not automatically establish mastery of every one of the three covered goal IDs or of an advanced-course scope.

Narrow identical requires/coveredGoalIds scope:

- Aufbau des Sonnensystems beschreiben — `af5dfdbc-5fd6-5c3e-a81b-093cb7c14b93`: A1, 6 points.
- Kepler-Gesetze anwenden — `497f1311-17d6-56ff-afb1-422a738e5c16`: A2, 12 points.
- Gezeiten qualitativ erklären — `37013646-f13a-5faf-954c-940f2fd7502f`: A3, 12 points.

## Cosmic structures, Big Bang evidence and size statements

ID: `4a58df57-f791-502f-8b8d-9ba155e46035`. Proposed duration: 60 min.

A planetarium is revising three related panels: What is contained in what? What do cosmic observations reveal? What do age and size mean? Check the statements using the materials. The spectral table is explicitly a synthetic teaching example, not an actual galaxy measurement. The CMB temperature and age/size values are rounded, source-based observational or model summaries. A calculator is allowed; numerical redshift, the Hubble constant and cosmological model equations are not required.

### B-M1

The labels Sun, Solar System, Milky Way, Andromeda Galaxy and universe are available for a structural diagram. The Milky Way and Andromeda are each galaxies containing very many stars; many stars have planetary systems. The Sun belongs to the Milky Way. The neighboring Andromeda Galaxy does not belong to the Milky Way. A stellar system is not itself a galaxy, and a galaxy also contains interstellar space and matter between its stellar systems.

### B-M2

Two lines belonging to the same spectral pattern are identified at 500 nm and 600 nm in the rest spectrum. For three distant example galaxies an idealized teaching model gives:

| Spectrum | Line 1 in nm | Line 2 in nm |
| --- | --- | --- |
| Rest | 500 | 600 |
| A | 505 | 606 |
| B | 515 | 618 |
| C | 530 | 636 |

Additional local-motion and interfering effects are omitted in this example. Microwave background radiation is also observed from almost all directions. Its spectrum closely matches thermal radiation at about 2.725 K, with small directional differences remaining. This CMB summary comes from NASA/COBE, not from the invented spectral table.

### B-M3

Supplied rounded model estimates: about 13.8 billion years have elapsed since the early hot stage of cosmic evolution. In the usual expansion model the present radius of the observable universe is approximately 46 billion light-years. A light-year is the distance light travels in vacuum in one year. The second estimate describes present spatial distances in the model, not directly a light-travel time. These estimates do not determine the universe’s total spatial extent beyond our observable region.

Two unfinished panel statements read: (I) “The radius is 46 billion light-years, so the universe is 46 billion years old.” (II) “The age implies radius = c·age, and this also locates the boundary of the entire universe.”

### B1 (8 points)

Create a labeled containment diagram for M1. Place the Sun and Solar System within the Milky Way and show Andromeda alongside it without false nesting. Explain two differences between a stellar/planetary system and a galaxy. Explain why “The Milky Way is a collection of planets around the Sun” is not an adequate description.

### B2 (12 points)

Describe qualitatively how the line pattern in M2 changes and identify the most shifted example. Explain how the cosmological interpretation of this shift and the CMB observation jointly fit the hot Big Bang model. Describe the evolution from an earlier hot, denser state through later expansion and cooling. Assess the statement: “These two observations prove every detail of the beginning and identify an explosion site in pre-existing empty space.” No z-value needs to be calculated.

### B3 (10 points)

Assign the estimates 13.8 and 46 billion in M3 to their physical quantities and units; also give the diameter corresponding to a radius of 46 billion light-years. For comparison, determine c·13.8 billion years in light-years and the ratio 46/13.8. Correct panel statements I and II with a coherent physical explanation. Distinguish present distance, elapsed time and the boundary of the observable region. No calculation of expansion history is required.

## Expected solution and scoring

### B1 (8 points)

The Sun lies within the Solar System, which lies within the Milky Way; the Milky Way and Andromeda are separate galaxies within the universe. The example planetary system is organized around a central star and its bound companions. A galaxy contains very many stars or stellar systems as well as interstellar matter and has a much larger spatial extent. The Milky Way’s stars are not planets or companions orbiting the Sun. Correctly labeled nested regions or an equivalent tree are equally acceptable; additional galaxy-group levels are not required.

### B2 (12 points)

Both identified lines occur at longer wavelengths than in the rest spectrum; the pattern is stretched together, most strongly for C. In the cosmological interpretation, expansion stretches light to longer wavelengths during propagation. The model describes an earlier hotter, denser state followed by expansion and cooling. Today’s cold, nearly all-sky thermal CMB can be interpreted as cooled relic radiation from the early hot phase, not simply as sunlight. Both types of observation thus support the same model relationship. They do not establish every detail or a mathematical initial state. The model is not an explosion from a privileged location into pre-existing empty space; these data identify no such center.

### B3 (10 points)

13.8 billion years denotes elapsed time, while 46 billion light-years denotes a present model distance; a light-year is not a time unit. The corresponding diameter is approximately 92 billion light-years. By definition, c·13.8 billion years is 13.8 billion light-years; 46/13.8≈3.33 is dimensionless. The product c·age alone is not the present radius here, because spatial distances changed through expansion during light propagation. Therefore 46 billion light-years cannot be read directly as an age of 46 billion years. The observable region is limited by accessible signals, not by an established material outer edge of the whole universe. The supplied numbers do not settle its total extent or finiteness.

| ID | Points | Expected performance |
| --- | ---: | --- |
| B1-containment | 4 | Sun in Solar System, Solar System in Milky Way, Andromeda as separate galaxy, both galaxies in universe; 1 point each. |
| B1-distinction | 4 | Central star/companions contrasted with many stellar systems (2), very different spatial scale or interstellar matter (1), justified correction of the false identification of galactic stars as solar planets (1). |
| B2-lines | 4 | Longer wavelengths (1), pattern shifted together (1), C most shifted (1), wavelength stretching through cosmic expansion explained (1). |
| B2-hot-origin | 5 | Earlier hot/denser state (1), later expansion/cooling (1), nearly all-sky thermal CMB explained as cooled relic (2), not simply sunlight (1). |
| B2-model-limit | 3 | Two observations classified as coherent model support rather than proof of every detail (2), no established central explosion site in a pre-existing exterior (1). |
| B3-quantities | 4 | Age 13.8 billion years (1), present radius 46 billion light-years (1), light-year as length unit (1), diameter 92 billion light-years (1). |
| B3-comparison | 2 | c·age=13.8 billion light-years (1), ratio approximately 3.33 with no unit (1). |
| B3-interpretation | 4 | Present distance distinguished from light-travel time because of expansion and both panel statements corrected (2), observational boundary distinguished from unknown total extent/finiteness (2). |

18/30 retains the existing 60-percent threshold as an explicit authoring proposal, not as a claimed official grading boundary. Each point is tied to observable performance below. Equivalent diagrams, wording and solution methods are accepted. A propagated arithmetic error is penalized only at its origin; correct subsequent physics can receive points. Passing the total does not automatically establish mastery of every one of the three covered goal IDs or of an advanced-course scope.

Narrow identical requires/coveredGoalIds scope:

- Kosmische Strukturen einordnen — `1b060e79-dc2d-5e4e-abb5-42eca39f9cc7`: B1, 8 points.
- Urknallmodell anhand kosmologischer Beobachtungen erläutern — `c52d55c3-b687-586c-b0f9-8ffcd1069424`: B2, 12 points.
- Größe und Alter des Universums qualitativ einordnen — `db0394ca-297c-5892-b414-525ec186f928`: B3, 10 points.

## Sources and adoption hold

- curricula/DE/Gymnasium/input/HE/upper-secondary/kernkurriculum_gymnasiale_oberstufe-physik.pdf — printed page 47, Q4.6 basic level (GK and LK): The original local PDF text of pages 47–48 was read; the seven planned goals and current Kepler goal were read in full. The new questions are not official examination questions.
- [noaa-tides](https://oceanservice.noaa.gov/facts/springtide.html): Alignment versus quadrature and spring/neap tidal range; no local tidal prediction or measured heights copied.
- [noaa-differential](https://oceanservice.noaa.gov/education/tutorial_tides/lessons/ups_downs.html): Near/far gravitational difference and influence of Sun and Moon; earth-center acceleration comparison in this task is independently formulated.
- [nasa-cobe](https://science.nasa.gov/mission/cobe/science/): Nearly uniform cosmic microwave background with a near-blackbody spectrum at about 2.725 K. No raw COBE data or original plot is reproduced.
- [nasa-size](https://www.nasa.gov/science-research/astrophysics/how-big-is-space-we-asked-a-nasa-expert-episode-61/): About 92 billion light-years across for the observable universe; the task uses half this diameter as an approximate present radius of 46 billion light-years.
- [nasa-age](https://science.nasa.gov/exoplanets/what-is-the-universe/): Approximate age 13.8 billion years and Solar System/Milky Way relation. These are supplied interpretive estimates, not quantities learners must recall to extra precision.

G and U do not establish the separate astronomy-units competence across masses/luminosities. B does not require advanced-course redshift calculations. DM/DE, stellar evolution, distance methods and all other old examination claims are not assessed here. The separate route report identifies concrete follow-up work. Both proposals initially target only the checked HE scope; no unchecked nationwide publication or M6 reduction.
