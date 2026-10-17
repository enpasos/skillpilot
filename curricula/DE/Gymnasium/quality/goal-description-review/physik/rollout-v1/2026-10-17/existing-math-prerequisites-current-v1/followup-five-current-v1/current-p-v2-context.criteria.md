# Physics goal-description understanding-evidence review criteria v1

Apply every criterion independently to every assigned physics goal. These
criteria specialize the general description review for canonical German
Gymnasium physics; they do not authorize canonical edits.

- **Exact curricular and projection scope:** Preserve only the competence
  supported by the current title, bilingual descriptions, relations, supplied
  source excerpts, and effective learner-facing projection. For nationwide
  review, the compiled composition-view/source-manifest matrix and applicable
  duration policy are authoritative for stage, jurisdiction, and course
  profile; raw canonical applicability is not. A broad source bullet mapped to
  several siblings does not donate the siblings' clauses to this goal.
- **Scientific correctness and essential relation:** State the concrete
  systems, quantities, interactions, causal or functional relationships,
  conditions, and limits that organize this exact competence. Do not replace
  them with generic wording such as “understands the topic”.
- **Epistemic distinction:** Keep observation or measurement, data processing,
  representation, model, law, explanation, prediction, and evaluation
  distinguishable whenever the goal depends on that distinction. Do not present
  an inferred quantity or model object as something directly observed.
- **Model discipline:** Name the model's relevant assumptions, idealizations,
  domain of validity, and explanatory or predictive purpose when they matter.
  Do not reify rays, field lines, wave functions, particles in a medium, or
  model-dependent quantities. In relativity, distinguish invariant rest mass
  from the historical convention of velocity-dependent “relativistic mass”.
- **Independently observable performance:** State what the learner independently
  explains, predicts, constructs, derives, chooses, investigates, analyzes, or
  judges. The performance must make the essential physical understanding
  visible and must not be satisfied by recognition, repetition of the coach,
  copying a diagram, or self-report.
- **Physics-aware mathematics:** Require the physically meaningful use of
  quantities, units, signs, vectors, coordinate choices, graphs, system
  boundaries, initial or boundary conditions, limiting cases, and plausibility
  checks as relevant. Looking up a formula and substituting values is not deep
  understanding.
- **Experiments and measurements:** Where the competence is experimental, keep
  the question, variables and controls, apparatus or measurement principle,
  data, calibration, random and systematic uncertainty, conclusion, and safety
  proportionate to the goal. Distinguish measured from calculated or inferred
  quantities.
- **Representation coordination:** When diagrams, graphs, equations, field-line
  pictures, vectors, or verbal models are involved, require the learner to
  construct, interpret, and translate between the relevant representations and
  explain what their conventions encode and omit.
- **Conservation and system boundaries:** For energy, momentum, charge, entropy,
  or other balance reasoning, make the chosen system and exchanges explicit.
  A conserved quantity must not be asserted for a subsystem when the relevant
  transfer crosses its boundary.
- **Fresh changed-case transfer:** Name a structurally related variation that
  changes a physics-relevant feature such as direction, sign, geometry, medium,
  reference frame, system boundary, damping, material, measurement quality, or
  model regime. A wording change or mere substitution of new numbers is not a
  sufficient transfer case.
- **Prediction and reconciliation:** Where suitable, require a prediction before
  calculation or observation and an explanation that reconciles the result with
  the selected law or model. A correct numerical result without that relation is
  insufficient.
- **Evidence-based evaluation:** For `PK5` or other judgment goals, separate the
  empirical claim, relevant physical quantities and uncertainty, explicit
  criteria, expected consequences, and any value judgment. Do not turn a value
  preference into a purported physical fact.
- **Quantum and relativity discipline:** Preserve the operational meaning of
  measurements, ensembles and individual events, reference frames, invariants,
  and model limits. Avoid classical hidden trajectories, observer-consciousness
  claims, and outdated terminology presented as unqualified ontology.
- **Safety:** Do not formulate independent performance that calls for hazardous
  radiation, high voltage, lasers, pressure, heat, or mechanical setups without
  appropriate supervised and safe conditions. Use supplied data or simulation
  where direct execution would be unsafe or unavailable.
- **Semantic atomicity:** The existing atomicity ledger is context, not authority
  over this description review. Use `split_review` when one leaf combines
  independently assessable competencies that need separate descriptions or
  evidence profiles; do not hide that issue inside a longer replacement.
- **Age and effective-stage fit:** Keep language and independent performance
  appropriate to every effective learner-facing stage. For a cross-stage goal,
  preserve one stage-neutral competence core; do not silently impose a Sek-II
  formalism on its Sek-I projection.
- **DE/EN parity:** German and English descriptions express the same systems,
  relations, conditions, independence, and transfer demand. Neither language
  may add or omit a physical claim.
- **Description/profile boundary:** Keep a replacement description concise and
  learner-facing. Concrete demonstrations, variation sequences, assessment-case
  briefs, and coverage requirements belong in the
  `positive-understanding-evidence-v2` profile.
- **Profile contract and recommendation:** Set `evidenceProfileContract` to
  `positive-understanding-evidence-v2`. Use `none` only when a supplied current
  profile already covers the exact understanding, observable performance, and
  transfer; use `create` when no adequate profile exists; use `revise` when the
  supplied current profile must change. The recommendation is non-authoritative.
- **Conservative decision:** Use `keep` when the descriptions already satisfy the
  criteria; `revise` for a precise local correction; `split_review` for semantic
  non-atomicity; and `block` for unresolved source, projection, safety, or
  scientific-correctness conflicts that prevent a defensible replacement.
- **No automatic authority:** Every AI record remains
  `candidate`/`ai_candidate`. Agreement between model runs is not human
  adjudication, publication approval, permission to mutate the curriculum, or
  proof of learner mastery.

A visualization is teaching support, not evidence. Evidence must come from
learner-generated physics in an independently presented fresh task, with a
meaningful changed case that stays inside the goal's effective scope.

## Complete actual current V2 profile context for the five-goal followup

The complete profiles below are current content context, with no author or prior reviewer judgments. The native evidenceProfile field is null, but P is supplied here in full. Assess the whole bilingual goal, canonical context, and whole P; none requires actual adequacy, otherwise recommend revise. No independent source, projection, image, or runtime acceptance is claimed. No former D opinion or dissent is provided.

```json
{
  "schemaVersion": 1,
  "documentType": "current-positive-understanding-profile-input-context",
  "goals": [
    {
      "goalId": "f524f05c-4456-4fc3-a1f7-f40741fc1f16",
      "profile": {
        "archetype": "proof",
        "expectations": [
          {
            "id": "selected-round-a-core",
            "essentialUnderstandingDe": "Für ein materiell abgeschlossenes System im Inertialsystem ergibt das Summieren von Newtons zweitem Axiom über alle Körper die Änderung des vektoriellen Gesamtimpulses. Nach Newtons drittem Axiom heben sich die inneren Wechselwirkungskräfte paarweise auf, sodass nur der resultierende äußere Kraftstoß die Gesamtimpulsänderung bestimmt: $\\Delta\\vec P=\\vec J_\\mathrm{ext}$. Ein verschwindender äußerer Kraftstoß liefert gleichen Gesamtimpuls an den Intervallgrenzen; konstante Impulserhaltung zu jedem Zeitpunkt verlangt eine verschwindende resultierende äußere Kraft während des gesamten betrachteten Ablaufs.",
            "essentialUnderstandingEn": "For a materially closed system in an inertial frame, summing Newton's second law over all bodies gives the change in vector total momentum. By Newton's third law, the internal interaction forces cancel pairwise, so only the net external impulse determines the change in total momentum: $\\Delta\\vec P=\\vec J_\\mathrm{ext}$. Zero external impulse gives equal total momentum at the endpoints of the interval; constant momentum at every instant requires zero net external force throughout the process considered.",
            "observablePerformanceDe": "Die lernende Person legt für ein Mehrkörpersystem Systemgrenze und Zeitintervall fest, klassifiziert Kräfte als innerlich oder äußerlich, summiert die Impulsgleichungen und zeigt nachvollziehbar die paarweise Aufhebung der inneren Kräfte. Sie leitet daraus $\\Delta\\vec P=\\vec J_\\mathrm{ext}$ her, prüft Vektorrichtungen und Einheiten und formuliert präzise, unter welchen Voraussetzungen der Gesamtimpuls zwischen zwei Zuständen beziehungsweise fortlaufend erhalten ist.",
            "observablePerformanceEn": "For a multi-body system, the learner defines the system boundary and time interval, classifies forces as internal or external, sums the momentum equations, and explicitly shows the pairwise cancellation of internal forces. The learner derives $\\Delta\\vec P=\\vec J_\\mathrm{ext}$, checks vector directions and units, and states precisely the conditions under which total momentum is conserved between two states or continuously."
          },
          {
            "id": "zero-net-impulse-is-an-endpoint-condition",
            "essentialUnderstandingDe": "Ein verschwindender resultierender äußerer Kraftstoß über ein Intervall garantiert gleichen Gesamtimpuls an dessen Anfang und Ende, aber nicht notwendig einen zu jedem Zwischenzeitpunkt konstanten Gesamtimpuls. Fortlaufende Impulserhaltung folgt erst, wenn die resultierende äußere Kraft zu jedem Zeitpunkt verschwindet.",
            "essentialUnderstandingEn": "Zero net external impulse over an interval guarantees equal total momentum at its beginning and end, but not necessarily constant total momentum at every intermediate instant. Continuous momentum conservation follows only when the net external force vanishes at every instant.",
            "observablePerformanceDe": "Die lernende Person konstruiert oder analysiert einen äußeren Kraftverlauf mit positiver und negativer Teilphase, integriert ihn vektoriell und unterscheidet eine Endpunktgleichheit des Gesamtimpulses von seiner zeitlich durchgehenden Konstanz.",
            "observablePerformanceEn": "The learner constructs or analyzes an external force history with positive and negative phases, integrates it vectorially, and distinguishes equality of endpoint total momentum from continuous constancy in time."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "selected-round-a-core",
            "zero-net-impulse-is-an-endpoint-condition"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "system-boundary-choice",
            "textDe": "Gesamtes wechselwirkendes System oder nur ein ausgewählter Teilkörper",
            "textEn": "Complete interacting system or only one selected body"
          },
          {
            "id": "external-impulse-history",
            "textDe": "Zu jeder Zeit null, nur über das Gesamtintervall null oder eindeutig von null verschieden",
            "textEn": "Zero at every instant, zero only over the full interval, or clearly nonzero"
          },
          {
            "id": "interaction-topology-and-frame",
            "textDe": "Zwei oder mehrere Körper in verschiedenen Inertialsystemen und mit unterschiedlichen inneren Wechselwirkungen",
            "textEn": "Two or more bodies in different inertial frames and with different internal interactions"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "two-cart-collision-and-narrower-system",
            "taskDemandDe": "Leite für den Stoß zweier Wagen auf einer horizontalen Bahn die Impulsbilanz aus Newtons zweitem und drittem Axiom her. Wiederhole die Bilanz danach nur für einen Wagen und erkläre die veränderte Rolle der Stoßkraft.",
            "taskDemandEn": "For a collision of two carts on a horizontal track, derive the momentum balance from Newton's second and third laws. Then repeat the balance for only one cart and explain the changed role of the collision force.",
            "expectedPerformanceDe": "Im Zweier-System heben sich die gleichzeitigen inneren Stoßkräfte paarweise auf, sodass bei vernachlässigbarem äußerem Kraftstoß der Gesamtimpuls erhalten ist. Für einen Wagen ist die Stoßkraft äußerlich und sein Einzelimpuls im Allgemeinen nicht erhalten.",
            "expectedPerformanceEn": "In the two-cart system, simultaneous internal collision forces cancel pairwise, so total momentum is conserved when external impulse is negligible. For one cart, the collision force is external and its individual momentum is generally not conserved.",
            "understandingFocusDe": "Die Herleitung und ihre Gültigkeit hängen ausdrücklich von der Systemgrenze ab.",
            "understandingFocusEn": "The derivation and its validity depend explicitly on the system boundary."
          },
          {
            "id": "opposite-external-pulses-at-different-times",
            "taskDemandDe": "Auf ein abgeschlossen betrachtetes Wagensystem wirken nacheinander zwei gleich große entgegengesetzte äußere Kraftstöße. Leite die Gesamtimpulsänderung über das ganze Intervall und über beide Teilintervalle her und beurteile die Aussage Impuls bleibt erhalten.",
            "taskDemandEn": "A system of carts receives two equal and opposite external impulses at different times. Derive the total momentum change over the full interval and over each subinterval, then assess the statement momentum remains conserved.",
            "expectedPerformanceDe": "Über das Gesamtintervall ist der äußere Kraftstoß null und Anfangs- sowie Endimpuls sind gleich; zwischen den Pulsen ist der Gesamtimpuls verändert. Vektoren und Einheiten N s = kg m/s werden konsistent geführt.",
            "expectedPerformanceEn": "Over the full interval the external impulse is zero and initial and final momentum are equal; between the pulses total momentum is different. Vectors and units N s = kg m/s are handled consistently.",
            "understandingFocusDe": "Endpunktgleichheit ist schwächer als fortlaufende Erhaltung.",
            "understandingFocusEn": "Endpoint equality is weaker than continuous conservation."
          }
        ]
      }
    },
    {
      "goalId": "497f1311-17d6-56ff-afb1-422a738e5c16",
      "profile": {
        "archetype": "concept",
        "expectations": [
          {
            "id": "shape-area",
            "essentialUnderstandingDe": "Keplerbahnen sind Ellipsen mit der Zentralmasse in einem Brennpunkt; gleiche überstrichene Flächen entsprechen gleichen Zeiten.",
            "essentialUnderstandingEn": "Keplerian orbits are ellipses with the central mass at a focus; equal swept areas correspond to equal times.",
            "observablePerformanceDe": "Die lernende Person erläutert die korrekte Sonnenlage und schließt aus Flächen auf Zeitintervalle und aus Sonnennähe auf unterschiedliche Bahngeschwindigkeiten.",
            "observablePerformanceEn": "The learner explains the correct solar position, infers time intervals from areas and relates proximity to the Sun to different orbital speeds."
          },
          {
            "id": "period-axis",
            "essentialUnderstandingDe": "Für vernachlässigbar kleine Begleitmassen um dieselbe Zentralmasse ist T²/a³ konstant; a ist die große Halbachse, nicht ein beliebiger momentaner Abstand.",
            "essentialUnderstandingEn": "For negligible companion masses around the same central mass, T²/a³ is constant; a is the semimajor axis, not an arbitrary instantaneous distance.",
            "observablePerformanceDe": "Die lernende Person bestimmt einfache Periodenverhältnisse und prüft, welche Bahnänderung die Anwendung des Gesetzes erlaubt.",
            "observablePerformanceEn": "The learner determines simple period ratios and checks which orbital change permits the law to be applied."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "shape-area",
            "period-axis"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "eccentricity",
            "textDe": "Vergleich verschiedener Halbachsen gegenüber gleicher Halbachse bei verschiedener Exzentrizität.",
            "textEn": "Compare different semimajor axes with equal semimajor axes but different eccentricities."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "two-orbits",
            "taskDemandDe": "Zwei kleine Planeten um dieselbe Sonne haben a=4 AE bzw. 9 AE. Für den ersten gilt T=8 Jahre. Bestimme T des zweiten, beschreibe die Sonnenlage und vergleiche zwei gleich große überstrichene Flächen auf dessen Bahn.",
            "taskDemandEn": "Two small planets around the same Sun have a=4 AU and 9 AU. The first has T=8 years. Determine the second period, describe the solar position and compare two equal swept areas on its orbit.",
            "expectedPerformanceDe": "T₂/T₁=(9/4)^(3/2)=27/8, also T₂=27 Jahre. Die Sonne liegt in einem Brennpunkt; gleiche Flächen bedeuten gleiche Zeiten trotz unterschiedlicher Bogenlängen.",
            "expectedPerformanceEn": "T₂/T₁=(9/4)^(3/2)=27/8, so T₂=27 years. The Sun is at a focus; equal areas mean equal times despite different arc lengths.",
            "understandingFocusDe": "Alle drei Gesetze tragen unterschiedliche, miteinander vereinbare Aussagen zur Bahn bei.",
            "understandingFocusEn": "The three laws make different, mutually compatible statements about an orbit."
          },
          {
            "id": "same-axis",
            "taskDemandDe": "Eine Kreisbahn und eine stark elliptische Bahn kleiner Körper um dieselbe Sonne haben dieselbe große Halbachse. Vergleiche Umlaufzeiten und die Geschwindigkeit entlang jeder Bahn; erläutere, warum ein momentaner Abstand nicht a ersetzen darf.",
            "taskDemandEn": "A circular and a strongly elliptical orbit of small bodies around the same Sun have the same semimajor axis. Compare periods and speed along each orbit; explain why instantaneous distance cannot replace a.",
            "expectedPerformanceDe": "Die Umlaufzeiten sind gleich. Auf der Kreisbahn ist das Tempo konstant, auf der Ellipse in Sonnennähe größer; gleiche Flächen pro Zeit bleiben maßgeblich. Der veränderliche Abstand ist nicht die konstante Halbachse.",
            "expectedPerformanceEn": "The periods are equal. Speed is constant on the circle and greater near the Sun on the ellipse; equal area per time still governs the motion. Variable distance is not the constant semimajor axis.",
            "understandingFocusDe": "Grenze einer rein radialen Deutung des dritten Gesetzes und Anwendung des Flächensatzes.",
            "understandingFocusEn": "Limit of interpreting the third law through instantaneous radius, and application of the area law."
          }
        ]
      }
    },
    {
      "goalId": "7badac4d-2874-5b3a-87e8-bf8f4440b2a6",
      "profile": {
        "archetype": "concept",
        "expectations": [
          {
            "id": "classify-by-conductivity-under-comparable-conditions",
            "essentialUnderstandingDe": "Die elektrische Leitfähigkeit beschreibt, wie gut ein Material unter festgelegten Bedingungen elektrischen Strom leitet. Leiter, Nichtleiter und Halbleiter zeigen typischerweise unterschiedliche Leitfähigkeitsbereiche; eine begründete Zuordnung setzt deshalb vergleichbare Bedingungen voraus. Ein einzelner Leitfähigkeitswert legt die Materialklasse jedoch nicht eindeutig fest.",
            "essentialUnderstandingEn": "Electrical conductivity describes how readily a material conducts electric current under specified conditions. Conductors, insulators, and semiconductors typically occupy different conductivity ranges; a justified classification therefore requires comparable conditions. A single conductivity value does not, however, uniquely determine the material class.",
            "observablePerformanceDe": "Die lernende Person prüft selbstständig, ob vorgegebene Leitfähigkeitsdaten unter vergleichbaren Bedingungen erhoben wurden, vergleicht typische Leitfähigkeiten und unterscheidet Datenangabe und daraus mögliche Einordnung. Sie begründet die Zuordnung dokumentierter Materialbeispiele und ihrer Verwendung mit der Leitfähigkeit und erkennt, wenn die Materialklasse eines unbekannten Stoffes aus dem Einzelwert nicht eindeutig bestimmbar ist.",
            "observablePerformanceEn": "The learner independently checks whether supplied conductivity data were obtained under comparable conditions, compares typical conductivities, and distinguishes the reported data from an interpretation they support. The learner justifies the classification of documented material examples and their uses by reference to conductivity and recognizes when an unknown substance cannot be classified uniquely from one value."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "classify-by-conductivity-under-comparable-conditions"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "material-set",
            "textDe": "Ein neuer Satz unbekannter Materialien deckt sehr hohe, mittlere und sehr geringe typische Leitfähigkeiten ab.",
            "textEn": "A new set of unknown materials spans very high, intermediate, and very low typical conductivities."
          },
          {
            "id": "comparison-temperature",
            "textDe": "Die Leitfähigkeitsangaben stammen entweder von derselben Temperatur oder enthalten zusätzlich nicht direkt vergleichbare Werte bei einer anderen Temperatur.",
            "textEn": "The conductivity data are either taken at the same temperature or also include values at a different temperature that are not directly comparable."
          },
          {
            "id": "application-context",
            "textDe": "Die begründete Zuordnung wird auf ein neues Beispiel aus Technik oder Alltag übertragen.",
            "textEn": "The justified classification is transferred to a new example from technology or everyday life."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "same-temperature-unknown-materials",
            "taskDemandDe": "Für drei gleichartig dokumentierte unbekannte Materialien A, B und C sind bei 20 °C typische Leitfähigkeiten von 5,8 × 10^7 S/m, 4,0 × 10^-4 S/m und weniger als 1,0 × 10^-10 S/m angegeben. Zusätzlich werden dokumentierte, namentlich bezeichnete Materialbeispiele mit Leitfähigkeitsangaben unter vergleichbaren Bedingungen bereitgestellt. Ordne diese benannten Beispiele begründet als Leiter, Halbleiter oder Nichtleiter ein und erläutere passende Verwendungen. Vergleiche damit die unbekannten Materialien A, B und C und prüfe, welche Einordnungen die Einzelwerte allein stützen, ohne eine unbekannte Materialklasse aus einem mittleren Wert eindeutig festzulegen.",
            "taskDemandEn": "For three consistently documented unknown materials A, B, and C, typical conductivities of 5.8 × 10^7 S/m, 4.0 × 10^-4 S/m, and less than 1.0 × 10^-10 S/m are given at 20 °C. Documented, named material examples with conductivity data under comparable conditions are also supplied. Justify classifying these named examples as conductors, semiconductors, or insulators and explain suitable uses. Compare the unknown materials A, B, and C with them and assess which interpretations their single values support, without uniquely assigning an unknown material class from one intermediate value.",
            "expectedPerformanceDe": "Die lernende Person ordnet die bereitgestellten benannten Materialbeispiele anhand ihrer dokumentierten Eigenschaften begründet als Leiter, Halbleiter oder Nichtleiter ein und erklärt passende Verwendungen über Leitung oder Isolation. Sie erkennt die gemeinsame Temperatur als Vergleichsbedingung und beschreibt A als sehr gut leitend, B als im Vergleich mittel und C als sehr schwach leitend. Sie identifiziert B nicht allein aus dem Einzelwert sicher als Halbleiter und kennzeichnet die Grenzen der Klassifikation unbekannter Stoffe ohne weitere Materialinformation.",
            "expectedPerformanceEn": "The learner justifiably classifies the supplied named material examples as conductors, semiconductors, or insulators using their documented properties and explains suitable uses through conduction or insulation. The learner identifies the common temperature as a comparison condition and describes A as highly conductive, B as intermediate in this comparison, and C as very weakly conductive. B is not identified as a semiconductor from the single value alone, and the limits of classifying unknown substances without further material information are stated.",
            "understandingFocusDe": "Typische Leitfähigkeitsvergleiche unter denselben Bedingungen begründen Leitung oder Isolation in Anwendungen, ohne eine unbekannte Materialklasse aus einem Einzelwert eindeutig abzuleiten.",
            "understandingFocusEn": "Typical conductivity comparisons under the same conditions justify conduction or insulation in applications without uniquely inferring an unknown material class from one value."
          },
          {
            "id": "mixed-temperature-fresh-transfer",
            "taskDemandDe": "Ein neuer Materialsatz D, E und F enthält für 20 °C die Leitfähigkeiten 4,6 × 10^7 S/m, weniger als 1,0 × 10^-11 S/m und 6,0 × 10^-4 S/m. Für F ist zusätzlich ein Wert von 2,5 × 10^-3 S/m bei 80 °C angegeben. Wähle die für den Vergleich geeigneten Angaben aus, vergleiche die typischen Leitfähigkeiten und prüfe die Grenzen einer eindeutigen Materialklassifikation und erläutere, warum der zusätzliche Wert nicht ohne Kennzeichnung mit den 20-°C-Werten verglichen werden darf.",
            "taskDemandEn": "A fresh set of materials D, E, and F lists conductivities of 4.6 × 10^7 S/m, less than 1.0 × 10^-11 S/m, and 6.0 × 10^-4 S/m at 20 °C. An additional value of 2.5 × 10^-3 S/m at 80 °C is given for F. Select the data suitable for comparison, compare the typical conductivities and assess the limits of uniquely classifying the materials, and explain why the additional value must not be compared with the 20 °C values without identifying the changed condition.",
            "expectedPerformanceDe": "Die lernende Person vergleicht für gleiche Bedingungen die drei 20-°C-Werte, beschreibt D als sehr gut und E als sehr schwach leitend und F als im Vergleich mittel. Sie trennt diese Datenbeschreibung von einer eindeutigen Materialklasse, die für F aus dem Einzelwert nicht folgt. Den 80-°C-Wert kennzeichnet sie als andere Bedingung und vergleicht ihn nicht unmarkiert mit den 20-°C-Werten.",
            "expectedPerformanceEn": "For equal conditions, the learner compares the three 20°C values, describes D as highly conductive, E as very weakly conductive, and F as intermediate in this comparison. The learner separates this description from a unique material class, which does not follow for F from the single value. The 80°C value is identified as a different condition and is not compared with the 20°C values without noting that change.",
            "understandingFocusDe": "Die Bedingungsgleichheit wird in einem frischen Fall aktiv geprüft; typische Leitfähigkeitsvergleiche werden von einer eindeutigen Stoffklassenbestimmung unterschieden.",
            "understandingFocusEn": "Comparable conditions are actively checked in a fresh case; typical conductivity comparisons are distinguished from unique determination of a material class."
          }
        ]
      }
    },
    {
      "goalId": "18c1f954-487e-5121-bb18-6c64a82f573d",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "envelope-and-oscillation",
            "essentialUnderstandingDe": "Bei einem exponentiell gedämpften Schwingungsmodell beschreibt A₀e^(−δt) die Hüllkurve, nicht die vorzeichenwechselnde Auslenkung; δ hat die Einheit einer inversen Zeit.",
            "essentialUnderstandingEn": "In an exponentially damped oscillation model, A₀e^(−δt) describes the envelope, not the sign-changing displacement; δ has units of inverse time.",
            "observablePerformanceDe": "Bestimmt und deutet Hüllkurvenparameter und trennt Amplitudenabnahme von Periodendauer und Phase.",
            "observablePerformanceEn": "Determines and interprets envelope parameters and separates amplitude decay from period and phase."
          },
          {
            "id": "model-compatibility",
            "essentialUnderstandingDe": "Exponentielle Abnahme bedeutet einen gleichen Amplitudenfaktor in gleichen Zeitabständen und ist eine zu prüfende Idealisierung.",
            "essentialUnderstandingEn": "Exponential decay means the same amplitude factor over equal time intervals and is an idealisation to test.",
            "observablePerformanceDe": "Prüft frische Amplitudendaten auf diese Struktur und begrenzt unpassende Exponentialansätze.",
            "observablePerformanceEn": "Tests fresh amplitude data for this structure and limits inappropriate exponential models."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "envelope-and-oscillation",
            "model-compatibility"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "compatible-and-incompatible-envelope",
            "textDe": "Eine exponentielle Hüllkurve parametrisieren und eine gleichmäßig linear abnehmende Folge als abweichenden Fall prüfen.",
            "textEn": "Parameterise an exponential envelope and test a uniformly linearly decreasing sequence as a contrasting case."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "exponential-envelope",
            "taskDemandDe": "Eine simulierte gedämpfte Schwingung hat die Hüllkurvenwerte A(0)=8 mm, A(2 s)=4 mm, A(4 s)=2 mm; ihre Periodendauer beträgt 0,5 s. Formuliere einen passenden Ansatz, deute die Parameter und prognostiziere A(6 s). Die Phase ist nicht angegeben.",
            "taskDemandEn": "A simulated damped oscillation has envelope values A(0)=8 mm, A(2 s)=4 mm, A(4 s)=2 mm and period 0.5 s. Formulate a suitable model, interpret its parameters, and predict A(6 s). The phase is not supplied.",
            "expectedPerformanceDe": "A(t)=8e^(−(ln 2/2)t) mm mit δ≈0,3466 s⁻¹; A(6 s)=1 mm. Ein Auslenkungsmodell ist x(t)=A(t)cos(4πt+φ), t in s. Frequenz 2 Hz und unbekannte Phase φ werden nicht mit δ verwechselt. Die Hüllkurvendaten stützen den Ansatz, beweisen aber kein universelles Reibungsgesetz.",
            "expectedPerformanceEn": "A(t)=8e^(−(ln 2/2)t) mm with δ≈0.3466 s⁻¹; A(6 s)=1 mm. A displacement model is x(t)=A(t)cos(4πt+φ), t in s. Frequency 2 Hz and unknown phase φ are not confused with δ. The envelope data support the model but do not prove a universal friction law.",
            "understandingFocusDe": "Hüllkurvenabnahme quantitativ deuten, ohne die Schwingung durch eine reine Exponentialfunktion zu ersetzen.",
            "understandingFocusEn": "Interpret envelope decay quantitatively without replacing the oscillation by a pure exponential."
          },
          {
            "id": "non-exponential-sequence",
            "taskDemandDe": "Aufeinanderfolgende gleichseitige Auslenkungsmaxima liegen jeweils 0,5 s auseinander und betragen 8,6,4,2 mm. Prüfe, ob ein einziger exponentieller Dämpfungsparameter alle vier idealisiert exakten Angaben beschreibt. Welche Schlussfolgerung ist zulässig?",
            "taskDemandEn": "Successive same-side displacement maxima are spaced 0.5 s apart and have amplitudes 8,6,4,2 mm. Assess whether one exponential damping parameter describes all four idealised exact values. What conclusion is warranted?",
            "expectedPerformanceDe": "Die Faktoren 6/8=0,75, 4/6≈0,667 und 2/4=0,5 sind verschieden, die Differenz ist jeweils −2 mm. Ein konstanter δ passt nicht zu allen Angaben. Ein linearer Abnahmeansatz beschreibt diese endliche Folge; daraus allein folgt weder eine sichere Reibungsursache noch die Fortsetzung zu negativen Amplituden.",
            "expectedPerformanceEn": "Factors 6/8=0.75, 4/6≈0.667, and 2/4=0.5 differ, while each difference is −2 mm. One constant δ does not fit all entries. Linear decrease describes this finite sequence; it establishes neither a definite friction mechanism nor continuation to negative amplitudes.",
            "understandingFocusDe": "Modellpassung anhand von Verhältnissen prüfen und Schlussfolgerungen begrenzen.",
            "understandingFocusEn": "Test model compatibility using ratios and bound the resulting inference."
          }
        ]
      }
    },
    {
      "goalId": "89124b92-5769-5e13-8a5d-78497936260f",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "selected-blind-review-core",
            "essentialUnderstandingDe": "Unter der Näherung thermischer Strahlung verknüpft das Wiensche Verschiebungsgesetz die Lage des Spektralmaximums mit der effektiven Oberflächentemperatur, während das Stefan-Boltzmann-Gesetz Strahlungsleistung, Radius und Temperatur über die abstrahlende Oberfläche verbindet.",
            "essentialUnderstandingEn": "Under the thermal-radiation approximation, Wien's displacement law links the position of the spectral maximum to effective surface temperature, while the Stefan–Boltzmann law relates radiated power, radius, and temperature through the emitting surface area.",
            "observablePerformanceDe": "Die lernende Person wählt anhand der verfügbaren Strahlungsdaten das passende Gesetz, führt die Abschätzung mit korrekten Einheiten und der Kugeloberfläche durch, benennt die Modellannahme und prüft Größenordnung sowie Konsistenz mit der jeweils anderen Methode, sofern genügend Daten vorliegen.",
            "observablePerformanceEn": "Based on the available radiation data, the learner selects the appropriate law, performs the estimate with correct units and spherical surface area, states the model assumption, and checks the order of magnitude and consistency with the other method when enough data are available."
          },
          {
            "id": "law-selection-model-and-uncertainty",
            "essentialUnderstandingDe": "Wien und Stefan-Boltzmann erschließen unter dem thermischen Strahlungsmodell dieselbe effektive Oberflächentemperatur aus verschiedenen Messgrößen; Radiusunsicherheit, Spektralabweichung und Modellannahmen beeinflussen die Belastbarkeit unterschiedlich.",
            "essentialUnderstandingEn": "Under the thermal-radiation model, Wien and Stefan-Boltzmann infer the same effective surface temperature from different measurements; radius uncertainty, spectral departure, and model assumptions affect reliability differently.",
            "observablePerformanceDe": "Die lernende Person wählt anhand der Daten das passende Gesetz, verwendet beim Leistungsweg die abstrahlende Kugeloberfläche, führt Einheiten und Unsicherheit und vergleicht beide Wege, wenn genügend Daten vorliegen.",
            "observablePerformanceEn": "The learner selects the appropriate law from the data, uses the emitting spherical area in the luminosity route, handles units and uncertainty, and compares both routes when enough data are available."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "selected-blind-review-core",
            "law-selection-model-and-uncertainty"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "available-data",
            "textDe": "Spektralmaximum oder Strahlungsleistung plus Radius",
            "textEn": "Spectral peak or luminosity plus radius"
          },
          {
            "id": "model-regime",
            "textDe": "Annähernd thermisches oder deutlich abweichendes Spektrum",
            "textEn": "Approximately thermal or substantially non-thermal spectrum"
          },
          {
            "id": "uncertainty-source",
            "textDe": "Unsicherheit des Maximums, der Leistung oder des Radius",
            "textEn": "Uncertainty in the peak, luminosity, or radius"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "wien-peak-estimate",
            "taskDemandDe": "Schätze aus einem Spektralmaximum mit Messunsicherheit die effektive Oberflächentemperatur. Begründe das thermische Modell und prüfe Größenordnung und Unsicherheit.",
            "taskDemandEn": "Estimate effective surface temperature from a spectral peak with measurement uncertainty. Justify the thermal model and check order of magnitude and uncertainty.",
            "expectedPerformanceDe": "Die lernende Person wählt Wien, führt Wellenlängen- und Temperatureinheiten konsistent und begrenzt die Aussage bei einem breiten oder verzerrten Maximum.",
            "expectedPerformanceEn": "The learner selects Wien, handles wavelength and temperature units consistently, and limits the claim for a broad or distorted peak.",
            "understandingFocusDe": "Der Fall prüft Modellwahl und unsicherheitsbewusste Inferenz aus Spektraldaten.",
            "understandingFocusEn": "The case tests model choice and uncertainty-aware inference from spectral data."
          },
          {
            "id": "luminosity-radius-crosscheck",
            "taskDemandDe": "Bestimme aus Strahlungsleistung und Radius die Temperatur eines anderen Sterns und vergleiche sie mit einer unabhängigen Wien-Schätzung. Entscheide bei unsicherem Radius oder Spektralabweichung, welcher Weg belastbarer ist.",
            "taskDemandEn": "Determine the temperature of another star from luminosity and radius and compare it with an independent Wien estimate. Under uncertain radius or spectral departure, decide which route is more reliable.",
            "expectedPerformanceDe": "Die lernende Person verwendet 4πR², dokumentiert Annahmen, vergleicht Ergebnisse und erklärt Richtung und Ursache einer möglichen Verzerrung.",
            "expectedPerformanceEn": "The learner uses 4πR², documents assumptions, compares results, and explains the direction and cause of possible bias.",
            "understandingFocusDe": "Der Transfer trennt alternative Datenwege und ihre unterschiedlichen Modellgrenzen.",
            "understandingFocusEn": "The transfer distinguishes alternative data routes and their different model limits."
          }
        ]
      }
    }
  ]
}
```
