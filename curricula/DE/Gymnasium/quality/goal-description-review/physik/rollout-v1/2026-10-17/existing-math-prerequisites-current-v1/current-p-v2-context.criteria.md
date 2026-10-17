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

## Existing complete current V2 positive-understanding profiles

The following whole V2 profiles are the existing P context for these exact goals. The separate native evidenceProfile field is null; this does not mean P is absent. Recommend none only after checking that the provided whole profile remains adequate for the complete current bilingual goal and canonical context. Otherwise recommend revise with a concrete content reason, never create merely because the separate field is null.
Die ganzen vorhandenen V2-Profile sind aktueller fachlicher Kontext, keine frühere Reviewerentscheidung. none setzt tatsächliche Fortgeltung der Understanding-, Performance-, Transfer- und Variationserwartungen voraus; sonst revise fachlich begründen.
No former D review, authorReason, canonical diff, reviewer verdict or acceptance is supplied. No independent image/source/projection verification is claimed by this appendix; assess such material only if actually supplied and bound.

```json
{
  "schemaVersion": 1,
  "documentType": "current-positive-understanding-profile-input-context",
  "goals": [
    {
      "goalId": "2eecd0e2-a7ca-4568-9b12-3d47706c65fb",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "bilanzsystem",
            "essentialUnderstandingDe": "Bei einfachen Stößen ist Gesamtimpuls nur bei vernachlässigbarem äußeren Kraftstoß erhalten; Energieerhaltung bezieht sich auf alle relevanten Energieformen, nicht automatisch auf kinetische Energie.",
            "essentialUnderstandingEn": "In simple collisions, total momentum is conserved only when external impulse is negligible; energy conservation concerns all relevant energy forms, not automatically kinetic energy.",
            "observablePerformanceDe": "Legt das System beider Körper und eine positive Richtung fest, bilanziert Impuls und Energie vor/nach dem Stoß und benennt die angenommene Isolation.",
            "observablePerformanceEn": "Defines the two-body system and positive direction, balances momentum and energy before/after collision, and identifies the assumed isolation."
          },
          {
            "id": "stossauswertung",
            "essentialUnderstandingDe": "Stoßart und Richtungen bestimmen, wie die Erhaltungssätze mit den gegebenen Beobachtungen verknüpft werden können.",
            "essentialUnderstandingEn": "Collision type and directions determine how conservation laws can be combined with the supplied observations.",
            "observablePerformanceDe": "Bestimmt einfache Endgeschwindigkeiten oder prüft einen Vorschlag und erklärt, in welche Energieformen fehlende kinetische Energie übergehen kann.",
            "observablePerformanceEn": "Determines simple final velocities or checks a proposal and explains which forms can receive missing kinetic energy."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "bilanzsystem",
            "stossauswertung"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "stossart-und-richtung",
            "textDe": "Elastische Übergabe an einen ruhenden gleich schweren Körper gegenüber einem haftenden Frontalstoß mit Gegenbewegung.",
            "textEn": "Elastic transfer to a stationary equal-mass object versus a sticking head-on collision with opposing motion."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "elastische-uebergabe",
            "taskDemandDe": "Zwei kleine Wagen von je 0,50 kg stoßen auf einer idealisierten horizontalen Bahn ohne äußeren Kraftstoß elastisch zusammen. Wagen A kommt mit +2,0 m/s auf den ruhenden B zu; danach ruht A. Bestimme die Bewegung von B und erläutere anhand beider Bilanzen die Aussagekraft der Erhaltungssätze.",
            "taskDemandEn": "Two small carts of 0.50 kg each collide elastically on an idealized horizontal track with no external impulse. Cart A approaches stationary B at +2.0 m/s; afterwards A is at rest. Determine B's motion and explain the role of conservation laws using both balances.",
            "expectedPerformanceDe": "Setzt das System A+B, erhält pvor=1,0 kg·m/s und damit vB=+2,0 m/s. Ekin ist vorher/nachher 1,0 J; die Körper tauschen im gegebenen Fall die Bewegungszustände. Erklärt, dass gleiche Einzelimpulse nicht erhalten sein müssen, sondern deren Summe; die Beobachtung A ruht ergänzt die Bilanz.",
            "expectedPerformanceEn": "Defines system A+B, obtains initial p=1.0 kg·m/s and hence vB=+2.0 m/s. Kinetic energy is 1.0 J before/after; in this case the objects exchange motion states. Explains that individual momenta need not be conserved, only their sum; the observation that A stops supplements the balance.",
            "understandingFocusDe": "Erhaltungsgrößen beschränken einen konkreten einfachen Stoß.",
            "understandingFocusEn": "Conserved quantities constrain a specific simple collision."
          },
          {
            "id": "haftender-gegenstoss",
            "taskDemandDe": "Zwei Körper von je 1,0 kg bewegen sich mit +2,0 und -2,0 m/s aufeinander zu und bleiben nach einem idealisierten Stoß verbunden. Äußerer Kraftstoß und Energieabgabe über die Systemgrenze sind vernachlässigbar. Bestimme die gemeinsame Endbewegung und erkläre, ob Energieerhaltung verletzt ist.",
            "taskDemandEn": "Two objects of 1.0 kg each approach at +2.0 and -2.0 m/s and remain attached after an idealized collision. External impulse and energy transfer across the system boundary are negligible. Determine their shared final motion and explain whether energy conservation is violated.",
            "expectedPerformanceDe": "Summiert gerichtete Impulse zu null und erhält vnach=0 für 2,0 kg Gesamtmasse. Ekin fällt von 4,0 J auf null; 4,0 J müssen im gewählten abgeschlossenen System in innere Energie/Verformung übergehen. Erklärt, weshalb man hier nicht zusätzlich kinetische Energieerhaltung erzwingen darf; Gesamtenergie bleibt erhalten.",
            "expectedPerformanceEn": "Adds signed momenta to zero and obtains final v=0 for total mass 2.0 kg. Kinetic energy falls from 4.0 J to zero; 4.0 J must become internal/deformation energy within the selected closed system. Explains why kinetic-energy conservation must not additionally be imposed here; total energy remains conserved.",
            "understandingFocusDe": "Impulserhaltung und Gesamtenergieerhaltung gelten auch bei nicht erhaltener kinetischer Energie.",
            "understandingFocusEn": "Momentum and total-energy conservation also apply when kinetic energy is not conserved."
          }
        ]
      }
    },
    {
      "goalId": "51de4fd9-6827-5b3d-b2ca-5e27ba961a7f",
      "profile": {
        "archetype": "experiment",
        "expectations": [
          {
            "id": "range-resolution-selection",
            "essentialUnderstandingDe": "Ein geeignetes Thermometer umfasst den erwarteten Temperaturbereich sicher und besitzt eine für die Fragestellung hinreichend feine Auflösung; ein engerer Bereich ist nur dann hilfreich, wenn der Messwert darin liegt.",
            "essentialUnderstandingEn": "A suitable thermometer safely includes the expected temperature range and has sufficiently fine resolution for the question; a narrower range is helpful only if the value lies within it.",
            "observablePerformanceDe": "Die lernende Person wählt für eine neue Messaufgabe aus mehreren Thermometern eines aus und begründet die Entscheidung getrennt mit Messbereich und benötigter Auflösung.",
            "observablePerformanceEn": "For a new measurement task, the learner chooses among several thermometers and justifies the decision separately using measurement range and required resolution."
          },
          {
            "id": "contact-stability-and-reading",
            "essentialUnderstandingDe": "Der Sensor muss guten thermischen Kontakt zum Messobjekt haben und ausreichend lange einen stabilen Wert erreichen; erst dann wird die Skala beziehungsweise Anzeige mit Einheit und einer zur Auflösung passenden Genauigkeit abgelesen.",
            "essentialUnderstandingEn": "The sensor must have good thermal contact with the measured object and be allowed to reach a stable value; only then is the scale or display read with a unit and precision suited to the resolution.",
            "observablePerformanceDe": "Die lernende Person führt eine Messung fachgerecht durch oder korrigiert einen Ablauf mit schlechtem Kontakt oder zu frühem Ablesen und berichtet einen stabilen Wert mit passender Einheit.",
            "observablePerformanceEn": "The learner performs a measurement correctly or corrects a procedure with poor contact or premature reading and reports a stable value with an appropriate unit."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "range-resolution-selection",
            "contact-stability-and-reading"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "measurement-demand",
            "textDe": "Großer Messbereich mit grober Auflösung oder enger Bereich mit feiner benötigter Auflösung",
            "textEn": "Wide range with coarse resolution or narrow range with fine required resolution"
          },
          {
            "id": "contact-condition",
            "textDe": "Guter Sensor-Messobjekt-Kontakt und stabiler Wert oder ein Ablauf mit Kontakt- beziehungsweise Wartefehler",
            "textEn": "Good sensor–object contact and a stable value or a procedure with contact or waiting error"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "hot-water-instrument-choice",
            "taskDemandDe": "Für Wasser mit erwarteten 75 °C stehen ein Thermometer 35–42 °C mit 0,1-°C-Auflösung und eines von −10 bis 110 °C mit 1-°C-Auflösung bereit. Gerät und Ablauf sind zu wählen.",
            "taskDemandEn": "For water expected to be at 75 °C, one thermometer ranges from 35 to 42 °C with 0.1 °C resolution and another from −10 to 110 °C with 1 °C resolution. Choose the instrument and procedure.",
            "expectedPerformanceDe": "Die lernende Person wählt wegen des Bereichs das zweite Gerät, bringt den Sensor in guten Kontakt mit dem Wasser, wartet auf einen stabilen Wert und gibt ihn in °C ohne unbegründete Zehntelstelle an.",
            "expectedPerformanceEn": "Because of its range, the learner selects the second instrument, places the sensor in good contact with the water, waits for a stable value, and reports it in °C without an unjustified decimal place.",
            "understandingFocusDe": "Bereich, Auflösung, Kontakt und Stabilität werden als zusammenhängende Messentscheidung geprüft.",
            "understandingFocusEn": "Range, resolution, contact, and stability are tested as one coherent measurement decision."
          },
          {
            "id": "poor-contact-audit",
            "taskDemandDe": "Ein Oberflächensensor berührt ein Messobjekt nur an einer Kante; der angezeigte Wert steigt noch, wird aber sofort als 28,47 °C notiert, obwohl die Auflösung 0,5 °C beträgt. Der Ablauf ist zu korrigieren.",
            "taskDemandEn": "A surface sensor touches an object only at one edge; the displayed value is still rising but is immediately recorded as 28.47 °C even though resolution is 0.5 °C. Correct the procedure.",
            "expectedPerformanceDe": "Die lernende Person verbessert den flächigen Kontakt, wartet auf Stabilität und berichtet anschließend einen Wert in 0,5-°C-gerechter Genauigkeit mit Einheit.",
            "expectedPerformanceEn": "The learner improves surface contact, waits for stability, and then reports a value at precision appropriate to 0.5 °C with a unit.",
            "understandingFocusDe": "Der Fehlerfall zeigt, ob ein Messwert als Ergebnis von Kontakt, Angleichung und Geräteauflösung verstanden wird.",
            "understandingFocusEn": "The error case reveals whether a measurement is understood as the result of contact, equilibration, and instrument resolution."
          }
        ]
      }
    },
    {
      "goalId": "a24c41ce-68c5-56a7-8235-ef9a7dba7042",
      "profile": {
        "archetype": "data",
        "expectations": [
          {
            "id": "data-grounded-speed-comparison",
            "essentialUnderstandingDe": "Schallgeschwindigkeit ist eine medien- und bedingungsabhängige Messgröße; belastbare Vergleiche beziehen sich auf konkrete Daten mit Einheiten und vergleichbaren Bedingungen statt auf den Aggregatzustand als Etikett.",
            "essentialUnderstandingEn": "Sound speed is a medium- and condition-dependent measured quantity; defensible comparisons use specific data with units under comparable conditions rather than the state of matter as a label.",
            "observablePerformanceDe": "Die lernende Person ordnet unbekannte Medien anhand einer Datentabelle, quantifiziert relevante Unterschiede oder Verhältnisse und kennzeichnet fehlende beziehungsweise nicht vergleichbare Bedingungen als Aussagegrenze.",
            "observablePerformanceEn": "The learner ranks unfamiliar media from a data table, quantifies relevant differences or ratios, and identifies missing or non-comparable conditions as a limitation of the conclusion."
          },
          {
            "id": "coupling-inertia-explanation",
            "essentialUnderstandingDe": "Im Teilchenmodell hängt die Geschwindigkeit der Störungsweitergabe sowohl davon ab, wie stark benachbarte Bereiche elastisch gekoppelt sind, als auch von ihrer Trägheit; keines der beiden Merkmale allein bestimmt die Rangfolge.",
            "essentialUnderstandingEn": "In the particle model, the speed at which a disturbance is passed on depends both on how strongly neighboring regions are elastically coupled and on their inertia; neither feature alone determines the ranking.",
            "observablePerformanceDe": "Die lernende Person erklärt mindestens einen gemessenen Geschwindigkeitsunterschied durch das Zusammenspiel von Kopplung und Trägheit und sagt bei einem veränderten Modellfall begründet voraus, wie stärkere Kopplung oder größere Trägheit wirken würde.",
            "observablePerformanceEn": "The learner explains at least one measured speed difference through the interplay of coupling and inertia and gives a justified prediction for how stronger coupling or greater inertia would affect a changed model case."
          },
          {
            "id": "state-of-matter-counterexample",
            "essentialUnderstandingDe": "Eine Regel wie „in Festkörpern immer schneller als in Flüssigkeiten und dort immer schneller als in Gasen“ ist keine universelle Begründung; konkrete Materialeigenschaften können innerhalb eines Aggregatzustands stark variieren und eine pauschale Rangfolge widerlegen.",
            "essentialUnderstandingEn": "A rule such as “always faster in solids than in liquids and always faster there than in gases” is not a universal explanation; specific material properties can vary greatly within a state of matter and overturn a blanket ranking.",
            "observablePerformanceDe": "Die lernende Person prüft eine pauschale Aggregatzustandsregel an frischen Daten, nennt einen konkreten Gegenvergleich und ersetzt sie durch eine auf Kopplung, Trägheit und Messbedingungen begrenzte Aussage.",
            "observablePerformanceEn": "The learner tests a blanket state-of-matter rule against fresh data, identifies a specific counter-comparison, and replaces it with a claim limited by coupling, inertia, and measurement conditions."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "data-grounded-speed-comparison",
            "coupling-inertia-explanation",
            "state-of-matter-counterexample"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "material-set",
            "textDe": "Mehrere konkrete Gase, Flüssigkeiten und Festkörper statt je eines typischen Vertreters",
            "textEn": "Several specific gases, liquids, and solids rather than one typical representative of each"
          },
          {
            "id": "property-balance",
            "textDe": "Stärkere elastische Kopplung bei ähnlicher Trägheit oder größere Trägheit bei ähnlicher Kopplung",
            "textEn": "Stronger elastic coupling at similar inertia or greater inertia at similar coupling"
          },
          {
            "id": "measurement-condition",
            "textDe": "Vergleichbare beziehungsweise unterschiedliche Temperatur- oder Zustandsbedingungen in den bereitgestellten Daten",
            "textEn": "Comparable or differing temperature or state conditions in the supplied data"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "mixed-media-table",
            "taskDemandDe": "Eine neue Tabelle enthält Schallgeschwindigkeiten mehrerer namentlich genannter Gase, Flüssigkeiten und Festkörper mit Einheiten und Temperaturen. Eine Rangfolge, zwei quantitative Vergleiche und die Prüfung der Aussage „der Aggregatzustand genügt zur Vorhersage“ sind gefordert.",
            "taskDemandEn": "A new table gives sound speeds for several named gases, liquids, and solids with units and temperatures. A ranking, two quantitative comparisons, and a test of the statement “state of matter is sufficient for prediction” are required.",
            "expectedPerformanceDe": "Die lernende Person verwendet die Daten statt Etiketten, berechnet passende Unterschiede oder Verhältnisse, findet einen Vergleich, der eine pauschale Regel nicht trägt, und grenzt temperaturbedingt unsichere Vergleiche ab.",
            "expectedPerformanceEn": "The learner uses the data rather than labels, calculates suitable differences or ratios, finds a comparison that does not support a blanket rule, and limits comparisons made uncertain by temperature differences.",
            "understandingFocusDe": "Die Rangfolge muss datenbasiert sein und die verführerische Dreistufenregel aktiv prüfen.",
            "understandingFocusEn": "The ranking must be data based and actively test the tempting three-level rule."
          },
          {
            "id": "coupled-particle-models",
            "taskDemandDe": "Zwei unbekannte Modellmedien sind durch gleichartige Teilchenbilder beschrieben: In B ist die Kopplung stärker, die Trägheit aber ebenfalls größer als in A. Es ist zu erklären, warum ohne quantitative Angaben keine eindeutige Rangfolge folgt, und welche getrennten Vergleichsfälle eine Vorhersage erlauben.",
            "taskDemandEn": "Two unfamiliar model media are described by similar particle diagrams: in B the coupling is stronger but the inertia is also greater than in A. The learner must explain why no unique ranking follows without quantitative information and identify separate comparison cases that would allow a prediction.",
            "expectedPerformanceDe": "Die lernende Person erkennt die gegenläufigen Einflüsse, sagt bei gleicher Trägheit für stärkere Kopplung eine schnellere Weitergabe und bei gleicher Kopplung für größere Trägheit eine langsamere Weitergabe voraus und behauptet keine Rangfolge allein aus dem Aggregatzustand.",
            "expectedPerformanceEn": "The learner recognizes the opposing influences, predicts faster transfer for stronger coupling at equal inertia and slower transfer for greater inertia at equal coupling, and does not assert a ranking from state of matter alone.",
            "understandingFocusDe": "Der Transfer diagnostiziert eindimensionale Begründungen und fordert das Zusammenspiel beider Modellgrößen.",
            "understandingFocusEn": "The transfer diagnoses one-dimensional explanations and requires the interplay of both model quantities."
          }
        ]
      }
    },
    {
      "goalId": "10aad90e-a1db-42b6-8d1e-1d856e14b47d",
      "profile": {
        "archetype": "representation",
        "expectations": [
          {
            "id": "time-representation-meaning",
            "essentialUnderstandingDe": "Eine einfache Zeitdarstellung zeigt, wie sich eine Schallgröße an einem betrachteten Ort mit der Zeit ändert: Die waagerechte Richtung steht für Zeit, die senkrechte Auslenkung für die relative Stärke der Schwankung. Die Kurve ist keine räumliche Flugbahn des Schalls.",
            "essentialUnderstandingEn": "A simple time representation shows how a sound-related quantity at a chosen location changes over time: the horizontal direction represents time, and the vertical displacement represents the relative magnitude of the variation. The curve is not a spatial flight path of sound.",
            "observablePerformanceDe": "Die lernende Person liest oder erstellt für einen neuen Schallfall eine einfache Zeitdarstellung, erläutert die Bedeutung beider Richtungen und grenzt die dargestellte zeitliche Schwankung von einer räumlichen Bahn ab.",
            "observablePerformanceEn": "For a fresh sound case, the learner interprets or constructs a simple time representation, explains the meaning of both directions, and distinguishes the represented temporal variation from a spatial path."
          },
          {
            "id": "pitch-and-loudness-vary-independently",
            "essentialUnderstandingDe": "Bei einfachen vergleichbaren Schallsignalen hängt die Tonhöhe von der Wiederholungsrate beziehungsweise Frequenz ab: mehr Wiederholungen in gleicher Zeit bedeuten eine höhere Tonhöhe. Eine größere Amplitude kennzeichnet eine stärkere Schallschwankung und wird unter sonst vergleichbaren Bedingungen als lauter wahrgenommen; sie legt nicht die Tonhöhe fest.",
            "essentialUnderstandingEn": "For simple comparable sound signals, pitch depends on repetition rate or frequency: more repetitions in the same time mean a higher pitch. A larger amplitude indicates a stronger sound variation and is perceived as louder under otherwise comparable conditions; it does not determine pitch.",
            "observablePerformanceDe": "Die lernende Person vergleicht neue Darstellungen, in denen Frequenz und Amplitude unabhängig verändert werden, ordnet höhere oder tiefere Tonhöhe sowie lautere oder leisere Wahrnehmung begründet zu und erklärt, welche Größe jeweils unverändert bleibt.",
            "observablePerformanceEn": "The learner compares fresh representations in which frequency and amplitude are varied independently, justifies assignments of higher or lower pitch and louder or softer perception, and explains which quantity remains unchanged in each comparison."
          },
          {
            "id": "tone-noise-pattern-distinction",
            "essentialUnderstandingDe": "Ein idealisierter reiner Ton erscheint in einer einfachen Zeitdarstellung als regelmäßig wiederkehrende sinusförmige Schwingung. Ein Geräusch zeigt einen unregelmäßigen Verlauf ohne feste Wiederholungsperiode; die fachliche Unterscheidung beruht auf der Signalstruktur und nicht darauf, ob ein Schall angenehm oder störend empfunden wird.",
            "essentialUnderstandingEn": "In a simple time representation, an idealized pure tone appears as a regularly repeating sinusoidal oscillation. Noise shows an irregular pattern without a fixed repetition period; the scientific distinction is based on signal structure, not on whether a sound is perceived as pleasant or annoying.",
            "observablePerformanceDe": "Die lernende Person ordnet unbekannte einfache Zeitverläufe als Ton oder Geräusch ein, markiert die entscheidende Regelmäßigkeit beziehungsweise Unregelmäßigkeit und begründet, warum eine bloße Geschmacksbewertung für die Zuordnung nicht ausreicht.",
            "observablePerformanceEn": "The learner classifies unfamiliar simple time patterns as tone or noise, identifies the decisive regularity or irregularity, and explains why a mere preference judgment is insufficient for the classification."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "time-representation-meaning",
            "pitch-and-loudness-vary-independently",
            "tone-noise-pattern-distinction"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 3,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "frequency-amplitude-change",
            "textDe": "Nur Frequenz, nur Amplitude oder beide Größen werden zwischen zwei Zeitdarstellungen verändert",
            "textEn": "Only frequency, only amplitude, or both quantities are changed between two time representations"
          },
          {
            "id": "signal-regularity",
            "textDe": "Regelmäßig sinusförmiger Verlauf oder unregelmäßiger Verlauf ohne feste Periode",
            "textEn": "Regular sinusoidal pattern or irregular pattern without a fixed period"
          },
          {
            "id": "representation-direction",
            "textDe": "Von einer gehörten oder sprachlich beschriebenen Eigenschaft zur Skizze oder von der Skizze zur fachlichen Beschreibung",
            "textEn": "From a heard or verbally described property to a sketch, or from the sketch to a scientific description"
          },
          {
            "id": "sound-context",
            "textDe": "Technisch erzeugter Signalton, Alltagsgeräusch oder unbekannte abstrakte Zeitkurve",
            "textEn": "Technically generated signal tone, everyday noise, or an unfamiliar abstract time curve"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "same-period-different-amplitude",
            "taskDemandDe": "Zwei regelmäßige Zeitkurven haben in demselben Zeitfenster gleich viele Schwingungen, aber Kurve B besitzt eine deutlich größere Amplitude. Tonhöhe und Lautstärke sind vergleichend zu beschreiben und die Kurvenachsen sind zu erläutern.",
            "taskDemandEn": "Two regular time curves have the same number of oscillations in the same time window, but curve B has a substantially larger amplitude. Compare their pitch and loudness and explain the curve axes.",
            "expectedPerformanceDe": "Die lernende Person erkennt die gleiche Frequenz und damit gleiche Tonhöhe, beschreibt B unter vergleichbaren Bedingungen als lauter, ordnet die größere Amplitude der stärkeren Schwankung zu und erklärt, dass die Kurven einen Zeitverlauf an einem Ort statt eine Schallbahn zeigen.",
            "expectedPerformanceEn": "The learner identifies the same frequency and therefore the same pitch, describes B as louder under comparable conditions, connects the larger amplitude to the stronger variation, and explains that the curves show a time pattern at one location rather than a path of sound.",
            "understandingFocusDe": "Die isolierte Amplitudenänderung prüft die Unabhängigkeit von Lautstärke und Tonhöhe sowie das Verständnis der Darstellung.",
            "understandingFocusEn": "The isolated amplitude change tests the independence of loudness and pitch as well as understanding of the representation."
          },
          {
            "id": "same-amplitude-different-frequency",
            "taskDemandDe": "Ein tiefer Signalton und ein höherer Signalton sollen als zwei einfache Zeitkurven mit vergleichbarer Amplitude, aber unterschiedlicher Zahl von Schwingungen im gleichen Zeitfenster skizziert und erklärt werden.",
            "taskDemandEn": "A low signal tone and a higher signal tone are to be sketched and explained as two simple time curves with comparable amplitude but different numbers of oscillations in the same time window.",
            "expectedPerformanceDe": "Die lernende Person zeichnet für den höheren Ton mehr Wiederholungen in derselben Zeit, hält die Amplituden vergleichbar, bezeichnet die höhere Frequenz als Ursache der höheren Tonhöhe und behauptet nicht, dass die dichtere Kurve deshalb automatisch lauter sei.",
            "expectedPerformanceEn": "The learner draws more repetitions in the same time for the higher tone, keeps the amplitudes comparable, identifies the higher frequency as the reason for the higher pitch, and does not claim that the denser curve is automatically louder.",
            "understandingFocusDe": "Die selbst erstellte Darstellung zeigt, ob Frequenz als Tonhöhenmerkmal gezielt verändert werden kann, ohne Amplitude und Lautstärke mitzuziehen.",
            "understandingFocusEn": "The learner-generated representation reveals whether frequency can be varied deliberately as the pitch feature without dragging amplitude and loudness along with it."
          },
          {
            "id": "regular-tone-and-irregular-noise",
            "taskDemandDe": "Drei unbekannte Zeitkurven werden vorgelegt: zwei regelmäßig sinusförmige Kurven mit unterschiedlichen Frequenzen und eine unregelmäßige Kurve. Die Kurven sind als Töne beziehungsweise Geräusch einzuordnen und nach Tonhöhe zu vergleichen, soweit dies fachlich sinnvoll ist.",
            "taskDemandEn": "Three unfamiliar time curves are provided: two regular sinusoidal curves with different frequencies and one irregular curve. Classify the curves as tones or noise and compare pitch where scientifically meaningful.",
            "expectedPerformanceDe": "Die lernende Person ordnet die regelmäßigen Kurven als Töne und die unregelmäßige als Geräusch ein, vergleicht die Tonhöhen der beiden Töne über ihre Frequenzen und weist darauf hin, dass dem unregelmäßigen Geräusch in dieser einfachen Darstellung keine einzelne feste Tonhöhe wie bei den Tönen zugeordnet wird.",
            "expectedPerformanceEn": "The learner classifies the regular curves as tones and the irregular one as noise, compares the pitches of the two tones through their frequencies, and notes that the irregular noise is not assigned one fixed pitch in this simple representation as the tones are.",
            "understandingFocusDe": "Der gemischte Fall prüft die strukturbezogene Ton-Geräusch-Unterscheidung und verhindert eine Einordnung nach angenehm oder unangenehm.",
            "understandingFocusEn": "The mixed case tests the structure-based tone-noise distinction and prevents classification by pleasantness or unpleasantness."
          }
        ]
      }
    },
    {
      "goalId": "2a6703e0-2a6f-4ebf-a5c6-7aa05a4b86eb",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "nucleus-and-shell-are-distinct-model-regions",
            "essentialUnderstandingDe": "Im gebundenen Atommodell bildet der Kern den räumlich sehr kleinen zentralen Bereich, während die Elektronenhülle den überwiegenden räumlichen Bereich des Atoms beschreibt. Kern und Hülle sind Modellbestandteile mit unterschiedlichen Größenordnungen; ihre Darstellung ist nicht mit einer photographischen Ansicht gleichzusetzen.",
            "essentialUnderstandingEn": "In the bound atomic model, the nucleus is the very small central region, whereas the electron shell accounts for most of the atom's spatial extent. Nucleus and shell are model components on different size scales; their representation is not a photographic view.",
            "observablePerformanceDe": "Die lernende Person beschriftet in einer neuen schematischen Atomdarstellung Kern und Elektronenhülle, beschreibt ihre räumliche Beziehung und kennzeichnet ausdrücklich, welche Aussagen Modellannahmen beziehungsweise qualitative Struktur und keine direkt beobachtete Form sind.",
            "observablePerformanceEn": "In a fresh schematic representation of an atom, the learner labels the nucleus and electron shell, describes their spatial relationship, and explicitly marks which statements express model assumptions or qualitative structure rather than a directly observed shape."
          },
          {
            "id": "diameters-differ-by-orders-of-magnitude",
            "essentialUnderstandingDe": "Typische Atomdurchmesser liegen in der Größenordnung 10^-10 m und typische Kerndurchmesser in der Größenordnung 10^-15 m. Mit bereitgestellten Werten ergibt sich damit ungefähr ein Faktor 10^5 im Durchmesser; ein linear maßstabsgerechtes Kern-Hülle-Bild ist auf einer normalen Seite deshalb nicht zugleich gut sichtbar.",
            "essentialUnderstandingEn": "Typical atomic diameters are of order 10^-10 m and typical nuclear diameters of order 10^-15 m. With supplied values this gives a diameter factor of about 10^5; a linearly scaled nucleus-shell diagram therefore cannot make both regions readily visible on an ordinary page.",
            "observablePerformanceDe": "Aus unabhängig gegebenen Atom- und Kerndurchmessern bestimmt die lernende Person die zugehörigen Zehnerpotenzen und deren Verhältnis, formuliert den Größenunterschied korrekt als Durchmesservergleich und prüft Einheit, Exponentendifferenz und Größenordnung.",
            "observablePerformanceEn": "From independently supplied atomic and nuclear diameters, the learner determines the powers of ten and their ratio, states the size difference correctly as a comparison of diameters, and checks units, exponent difference, and order of magnitude."
          },
          {
            "id": "schematic-size-does-not-provide-scale-evidence",
            "essentialUnderstandingDe": "Die gezeichnete Größe eines Kerns in einem Schema darf nicht als Messwert für das Größenverhältnis verwendet werden. Ein vergrößerter Kern kann zur Sichtbarkeit didaktisch sinnvoll sein, muss aber als nicht maßstabsgerecht kenntlich gemacht und durch Zahlen- oder Maßstabsdaten ergänzt werden.",
            "essentialUnderstandingEn": "The drawn size of a nucleus in a diagram must not be used as a measurement of the size ratio. Enlarging the nucleus can be pedagogically useful for visibility, but the diagram must be identified as not to scale and supplemented by numerical or scale data.",
            "observablePerformanceDe": "Die lernende Person vergleicht zwei neue Atomskizzen, weist einen unzulässigen Größenrückschluss aus der Zeichenfläche zurück und entscheidet anhand der Beschriftung und bereitgestellter Maßstabsdaten, welche fachlichen Aussagen die jeweilige Darstellung tatsächlich trägt.",
            "observablePerformanceEn": "The learner compares two fresh atomic diagrams, rejects an invalid size inference from the drawn areas, and uses labels and supplied scale data to decide which scientific claims each representation actually supports."
          },
          {
            "id": "bounded-analogy-preserves-ratio-and-limit",
            "essentialUnderstandingDe": "Eine räumliche Analogie kann das Durchmesserverhältnis nur dann tragen, wenn dieselbe lineare Skalierung für Kern und Atom verwendet wird. Sie erklärt den Größenunterschied, ersetzt aber weder ein vollständiges Atommodell noch Aussagen über genaue Elektronenbahnen oder die innere Kernstruktur.",
            "essentialUnderstandingEn": "A spatial analogy can represent the diameter ratio only when the same linear scale is used for nucleus and atom. It explains the size contrast but does not replace a complete atomic model or establish exact electron paths or internal nuclear structure.",
            "observablePerformanceDe": "Die lernende Person konstruiert aus einem vorgegebenen Verhältnis eine konsistente lineare Analogie, berechnet die zweite Länge, kennzeichnet die Systembestandteile und nennt mindestens eine fachliche Grenze der Analogie, statt zusätzliche Struktur aus dem Größenvergleich zu erfinden.",
            "observablePerformanceEn": "From a supplied ratio, the learner constructs a consistent linear analogy, calculates the second length, identifies the model components, and states at least one scientific limitation of the analogy instead of inventing additional structure from the size comparison."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "nucleus-and-shell-are-distinct-model-regions",
            "diameters-differ-by-orders-of-magnitude",
            "schematic-size-does-not-provide-scale-evidence",
            "bounded-analogy-preserves-ratio-and-limit"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 3,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "representation-form",
            "textDe": "Beschriftete Skizze, Zahlenpaar in Metern oder Nanometern und Femtometern, logarithmische Größenskala oder räumliche Analogie",
            "textEn": "Labelled diagram, numerical pair in metres or nanometres and femtometres, logarithmic size scale, or spatial analogy"
          },
          {
            "id": "supplied-size-values",
            "textDe": "Verschiedene plausible Atom- und Kerndurchmesser derselben Größenordnungen statt eines fest auswendig gelernten Zahlenpaars",
            "textEn": "Different plausible atomic and nuclear diameters in the same orders of magnitude rather than one memorized pair of values"
          },
          {
            "id": "model-quality",
            "textDe": "Ausdrücklich nicht maßstabsgerechtes Schema, unklar beschriftete Zeichnung, korrekt skalierte Analogie oder logarithmische Darstellung",
            "textEn": "Explicitly non-scale diagram, ambiguously labelled drawing, consistently scaled analogy, or logarithmic representation"
          },
          {
            "id": "required-judgment",
            "textDe": "Bestandteile beschreiben, Größenordnung berechnen, Bildaussage kritisieren oder eine begrenzte Analogie konstruieren",
            "textEn": "Describe components, calculate an order of magnitude, critique a diagram's claim, or construct a bounded analogy"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "supplied-diameter-order-comparison",
            "taskDemandDe": "Für ein Modellatom sind ein Atomdurchmesser von 1,2·10^-10 m und ein Kerndurchmesser von 1,0·10^-15 m gegeben. Bestimme die Größenordnungen und den ungefähren Durchmesserfaktor, ordne Kern und Hülle zu und erkläre, warum eine übliche Zeichnung beide nicht linear maßstabsgerecht zeigen kann.",
            "taskDemandEn": "For a model atom, an atomic diameter of 1.2·10^-10 m and a nuclear diameter of 1.0·10^-15 m are supplied. Determine the orders of magnitude and approximate diameter factor, identify nucleus and shell, and explain why an ordinary diagram cannot show both on one linear scale.",
            "expectedPerformanceDe": "Die lernende Person erhält die Größenordnungen 10^-10 m und 10^-15 m, einen Faktor in der Größenordnung 10^5, bezieht ihn ausdrücklich auf den Durchmesser und begründet die notwendige schematische Vergrößerung des Kerns ohne Flächen- oder Volumenfaktor zu verwechseln.",
            "expectedPerformanceEn": "The learner obtains orders of 10^-10 m and 10^-15 m, a factor of order 10^5, explicitly relates it to diameter, and explains the necessary schematic enlargement of the nucleus without confusing it with an area or volume factor.",
            "understandingFocusDe": "Der Fall prüft den fachlichen Kern aus Modellbestandteilen, Zehnerpotenzen und der Darstellungsgrenze gemeinsam.",
            "understandingFocusEn": "The case jointly tests model components, powers of ten, and the limitation of the representation."
          },
          {
            "id": "critique-two-atom-diagrams",
            "taskDemandDe": "Zwei neue Atomskizzen zeigen denselben Kern unterschiedlich groß; nur eine trägt den Hinweis „nicht maßstabsgerecht“ und separate Maßstabsdaten. Beurteile, welche Aussagen über Kern, Hülle und Größenverhältnis aus jeder Skizze zulässig sind, und korrigiere eine falsche Größenablesung.",
            "taskDemandEn": "Two fresh atomic diagrams show the same nucleus at different drawn sizes; only one states 'not to scale' and supplies separate scale data. Judge which claims about nucleus, shell, and size ratio each diagram permits, and correct an invalid reading of size.",
            "expectedPerformanceDe": "Die lernende Person akzeptiert beide als mögliche qualitative Kern-Hülle-Schemata, gewinnt das Größenverhältnis nur aus den Daten, weist die Zeichenfläche als Messgrundlage zurück und nennt die fehlende Skalierungsinformation der unklaren Darstellung.",
            "expectedPerformanceEn": "The learner accepts both as possible qualitative nucleus-shell diagrams, obtains the size ratio only from the data, rejects drawn area as a measurement basis, and identifies the missing scale information in the ambiguous representation.",
            "understandingFocusDe": "Die Bildkritik verhindert, dass eine anschauliche Nano- oder Lehrbuchgrafik selbst zum falschen Maßstabsbeweis wird.",
            "understandingFocusEn": "The critique prevents an illustrative AI or textbook graphic from becoming false evidence of scale."
          },
          {
            "id": "construct-consistent-scale-analogy",
            "taskDemandDe": "In einer Analogie soll der Kerndurchmesser 1 mm betragen; für das Atom-Kern-Durchmesserverhältnis ist 100000 angegeben. Bestimme den entsprechenden Atomdurchmesser, beschreibe, wo Kern und Hülle im Modell liegen, und nenne zwei Grenzen dieser Analogie.",
            "taskDemandEn": "In an analogy the nuclear diameter is to be 1 mm; the supplied atomic-to-nuclear diameter ratio is 100000. Determine the corresponding atomic diameter, describe where nucleus and shell lie in the model, and state two limitations of the analogy.",
            "expectedPerformanceDe": "Die lernende Person erhält 100 m, verwendet für beide Bestandteile dieselbe lineare Skalierung, beschreibt den kleinen zentralen Kern und die ausgedehnte Hülle und grenzt die Analogie mindestens gegen genaue Elektronenbahnen und innere Strukturdetails ab.",
            "expectedPerformanceEn": "The learner obtains 100 m, uses the same linear scale for both components, describes the small central nucleus and extended shell, and limits the analogy at least with respect to exact electron paths and internal structural detail.",
            "understandingFocusDe": "Die Konstruktion verlangt Transfer des Verhältnisses und eine explizite Modellgrenze statt bloßer Wiedergabe einer Zahl.",
            "understandingFocusEn": "The construction requires transfer of the ratio and an explicit model boundary rather than repetition of a number."
          }
        ]
      }
    },
    {
      "goalId": "79cb1695-f985-443a-b93e-27b57ab474b7",
      "profile": {
        "archetype": "representation",
        "expectations": [
          {
            "id": "directed-ray-model-correspondence",
            "essentialUnderstandingDe": "Eine Lichtstrahllinie ist eine gerichtete Modelllinie für die lokale Ausbreitungsrichtung von Licht; sie ist weder eine materielle Spur noch ohne geeignete Streuung direkt als Linie beobachtbar.",
            "essentialUnderstandingEn": "A light ray is a directed model line for the local propagation direction of light; it is neither a material track nor directly observable as a line without suitable scattering.",
            "observablePerformanceDe": "Die lernende Person konstruiert zu Quelle, Öffnung und Ziel passende gerichtete Strahlen, ordnet jedem Abschnitt eine physikalische Ausbreitungsrichtung zu und erklärt ausdrücklich den Modellstatus der Linien.",
            "observablePerformanceEn": "The learner constructs directed rays appropriate to a source, opening, and target, assigns a physical propagation direction to each segment, and explicitly explains the model status of the lines."
          },
          {
            "id": "applicable-rule-extension",
            "essentialUnderstandingDe": "Weitere Wegabschnitte folgen nicht der Form einer Vorlage, sondern den für den jeweiligen Abschnitt geltenden Regeln, etwa geradliniger Ausbreitung im homogenen Bereich oder einer vorgegebenen Reflexionsregel an einer Grenzfläche.",
            "essentialUnderstandingEn": "Subsequent path segments do not follow the shape of a template but the rules applicable to each section, such as straight-line propagation in a homogeneous region or a specified reflection rule at a boundary.",
            "observablePerformanceDe": "Die lernende Person benennt für eine neue Anordnung die jeweils anwendbare Regel, setzt einen begonnenen Lichtweg geometrisch konsistent fort und prüft, ob der vorhergesagte Abschnitt tatsächlich Quelle, optisches Element und Ziel verbindet.",
            "observablePerformanceEn": "For a new arrangement, the learner names the applicable rule, continues a started light path consistently in geometric terms, and checks whether the predicted segment actually connects source, optical element, and target."
          },
          {
            "id": "representation-limit-check",
            "essentialUnderstandingDe": "Ein einzelner gezeichneter Strahl repräsentiert eine ausgewählte Ausbreitungsrichtung und nicht automatisch die gesamte räumliche Lichtverteilung; fehlende Richtungspfeile oder geometrisch unmögliche Anschlüsse machen die Darstellung unzureichend.",
            "essentialUnderstandingEn": "A single drawn ray represents a selected propagation direction and not automatically the entire spatial distribution of light; missing direction arrows or geometrically impossible connections make the representation inadequate.",
            "observablePerformanceDe": "Die lernende Person kritisiert eine fehlerhafte Strahlenskizze anhand konkreter Modellkonventionen, korrigiert Richtung oder Verlauf und nennt, welche Aussage aus der begrenzten Strahlenauswahl nicht folgt.",
            "observablePerformanceEn": "The learner critiques an incorrect ray sketch using specific model conventions, corrects its direction or path, and states which conclusion does not follow from the limited selection of rays."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "directed-ray-model-correspondence",
            "applicable-rule-extension",
            "representation-limit-check"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "optical-boundary",
            "textDe": "Freie geradlinige Ausbreitung, Öffnung oder reflektierende Grenzfläche mit angegebener Regel",
            "textEn": "Free straight-line propagation, an opening, or a reflecting boundary with a specified rule"
          },
          {
            "id": "given-representation",
            "textDe": "Leere Anordnung, begonnener Strahl oder absichtlich fehlerhafte Strahlenskizze",
            "textEn": "Blank arrangement, a partially drawn ray, or an intentionally flawed ray sketch"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "aperture-screen-paths",
            "taskDemandDe": "Für eine punktförmige Lichtquelle, eine Blende mit kleiner Öffnung und einen Schirm sind die möglichen gerichteten Lichtwege zum Schirm zu zeichnen und die Grenzen der Darstellung zu erläutern.",
            "taskDemandEn": "For a point light source, a screen with a small aperture, and a target screen, the possible directed light paths to the target must be drawn and the limitations of the representation explained.",
            "expectedPerformanceDe": "Die lernende Person zeichnet nur geradlinige Abschnitte, die durch die Öffnung führen, versieht sie mit Pfeilen und erklärt, dass die Linien ausgewählte modellierte Richtungen und keine sichtbaren Fäden darstellen.",
            "expectedPerformanceEn": "The learner draws only straight segments that pass through the aperture, adds arrows, and explains that the lines represent selected modeled directions rather than visible threads.",
            "understandingFocusDe": "Geometrische Konstruktion und Modellstatus werden gemeinsam sichtbar.",
            "understandingFocusEn": "Geometric construction and model status are made visible together."
          },
          {
            "id": "changed-mirror-orientation",
            "taskDemandDe": "Ein begonnener Strahl trifft auf einen neu orientierten ebenen Spiegel; die Reflexionsregel ist angegeben. Der weitere Weg ist ohne Übernahme einer Musterzeichnung vorherzusagen, und eine alternative Skizze ohne Richtungspfeile ist zu beurteilen.",
            "taskDemandEn": "A partially drawn ray meets a plane mirror in a new orientation; the reflection rule is given. The subsequent path must be predicted without copying a template, and an alternative sketch without direction arrows evaluated.",
            "expectedPerformanceDe": "Die lernende Person konstruiert den reflektierten Abschnitt nach der geltenden Winkelbeziehung, prüft den Anschluss am Auftreffpunkt und verwirft die alternative Skizze als richtungsuneindeutig, ohne zu behaupten, der Spiegel erzeuge materielle Strahlen.",
            "expectedPerformanceEn": "The learner constructs the reflected segment using the applicable angle relation, checks continuity at the point of incidence, and rejects the alternative sketch as directionally ambiguous without claiming that the mirror creates material rays.",
            "understandingFocusDe": "Die geänderte Geometrie deckt bloßes Nachzeichnen statt regelgeleiteter Vorhersage auf.",
            "understandingFocusEn": "The changed geometry exposes mere tracing instead of rule-governed prediction."
          }
        ]
      }
    },
    {
      "goalId": "3c8e5510-a12d-5770-8a01-e5fe741b259c",
      "profile": {
        "archetype": "experiment",
        "expectations": [
          {
            "id": "setup-normal-and-angle-measurement",
            "essentialUnderstandingDe": "Einfalls- und Reflexionswinkel werden an einer ebenen glatten Fläche am Auftreffpunkt jeweils zwischen Strahl und Lot gemessen, nicht zwischen Strahl und Spiegeloberfläche; ein geeigneter Aufbau macht beide Strahlrichtungen und den Auftreffpunkt eindeutig.",
            "essentialUnderstandingEn": "At a flat smooth surface, incidence and reflection angles are each measured at the point of incidence between the ray and the normal, not between the ray and the mirror surface; a suitable setup makes both ray directions and the point of incidence unambiguous.",
            "observablePerformanceDe": "Die lernende Person plant oder führt unter geeigneten beaufsichtigten Bedingungen mehrere Messungen aus, zeichnet das Lot korrekt und liest beide Winkel zur selben Bezugsgeraden mit nachvollziehbarer Genauigkeit ab.",
            "observablePerformanceEn": "Under suitable supervised conditions, the learner plans or performs several measurements, draws the normal correctly, and reads both angles from the same reference line with traceable precision."
          },
          {
            "id": "data-law-and-uncertainty",
            "essentialUnderstandingDe": "Das Reflexionsgesetz beschreibt die Gleichheit von Einfalls- und Reflexionswinkel innerhalb der Messunsicherheit; kleine wechselnde Differenzen in Messdaten widerlegen es nicht automatisch, sondern müssen zur Auflösung und Ausrichtung des Aufbaus ins Verhältnis gesetzt werden.",
            "essentialUnderstandingEn": "The law of reflection states equality of incidence and reflection angles within measurement uncertainty; small varying differences in data do not automatically refute it but must be judged relative to the setup’s resolution and alignment.",
            "observablePerformanceDe": "Die lernende Person vergleicht eine frische Messreihe, formuliert aus dem Muster das Reflexionsgesetz und beurteilt Abweichungen anhand konkreter Unsicherheitsquellen statt Werte passend zu machen.",
            "observablePerformanceEn": "The learner compares a fresh data series, formulates the law of reflection from the pattern, and assesses deviations using concrete uncertainty sources rather than forcing values to match."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "setup-normal-and-angle-measurement",
            "data-law-and-uncertainty"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "incidence-angle",
            "textDe": "Mehrere kleine bis große Einfallswinkel bei gleicher Fläche",
            "textEn": "Several small to large incidence angles at the same surface"
          },
          {
            "id": "measurement-quality",
            "textDe": "Sauber ausgerichtete Messreihe oder Daten mit begrenzter Winkelauflösung beziehungsweise leicht verschobenem Lot",
            "textEn": "Well-aligned data series or data with limited angular resolution or a slightly displaced normal"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "supervised-measurement-plan",
            "taskDemandDe": "Für einen beaufsichtigten Versuch mit Strahlenkasten und Planspiegel ist ein Aufbau für 20°, 35° und 50° Einfallswinkel zu planen; Messgröße, Bezugsgerade und Datentabelle sind festzulegen.",
            "taskDemandEn": "Plan a supervised experiment using a ray box and plane mirror for incidence angles of 20°, 35°, and 50°; specify measured quantities, reference line, and data table.",
            "expectedPerformanceDe": "Die lernende Person markiert Auftreffpunkt und Lot, misst beide Winkel zum Lot, hält die Spiegellage fest und sieht getrennte Spalten für Einfallswinkel, Reflexionswinkel und Differenz vor.",
            "expectedPerformanceEn": "The learner marks the point of incidence and normal, measures both angles from the normal, keeps mirror position fixed, and provides separate columns for incidence angle, reflection angle, and difference.",
            "understandingFocusDe": "Der Plan zeigt, ob die Gleichheitsaussage experimentell prüfbar gemacht wurde.",
            "understandingFocusEn": "The plan reveals whether the equality claim has been made experimentally testable."
          },
          {
            "id": "uncertain-data-inference",
            "taskDemandDe": "Eine Messreihe liefert (20°,21°), (35°,34°) und (50°,52°) bei einer Ableseunsicherheit von etwa ±2°. Das Gesetz und die Abweichungen sind zu beurteilen.",
            "taskDemandEn": "A data series gives (20°,21°), (35°,34°), and (50°,52°) with reading uncertainty of about ±2°. Assess the law and the deviations.",
            "expectedPerformanceDe": "Die lernende Person erkennt die Winkelpaare als innerhalb der Messunsicherheit vereinbar, formuliert Einfallswinkel gleich Reflexionswinkel und nennt Lot- beziehungsweise Ableseausrichtung als mögliche Abweichungsquelle.",
            "expectedPerformanceEn": "The learner recognizes the angle pairs as consistent within measurement uncertainty, states angle of incidence equals angle of reflection, and names normal alignment or reading alignment as possible deviation sources.",
            "understandingFocusDe": "Frische Daten prüfen die Trennung von Gesetzesaussage und idealisierungsbedingter Messstreuung.",
            "understandingFocusEn": "Fresh data test the distinction between the law and measurement scatter due to idealization and measurement."
          }
        ]
      }
    },
    {
      "goalId": "dc7dd287-6eac-574d-818d-65cfb23a2d94",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "charging-is-redistribution",
            "essentialUnderstandingDe": "Elektrostatische Aufladung und Entladung werden im Ladungsmodell als Trennung, Übertragung oder Ausgleich bereits vorhandener positiver und negativer Ladungen beschrieben. Ein geladener Körper besitzt eine unausgeglichene algebraische Ladung; neutral bedeutet ausgeglichene Gesamtladung, nicht das Fehlen von Ladungen.",
            "essentialUnderstandingEn": "Electrostatic charging and discharging are described in the charge model as separation, transfer, or equalization of existing positive and negative charges. A charged body has an unbalanced algebraic charge; neutral means balanced net charge, not absence of charges.",
            "observablePerformanceDe": "Die lernende Person stellt für eine neue einfache Situation die Ladungsverteilungen vor und nach dem Vorgang mit Vorzeichen dar und erklärt, ob Ladung getrennt, übertragen oder ausgeglichen wurde.",
            "observablePerformanceEn": "For a fresh simple situation, the learner represents charge distributions before and after the process with signs and explains whether charge was separated, transferred, or equalized."
          },
          {
            "id": "net-charge-is-conserved-for-chosen-system",
            "essentialUnderstandingDe": "Für ein passend gewähltes Gesamtsystem bleibt die algebraische Summe der elektrischen Ladungen bei der Umverteilung erhalten. Wird nur ein Teilkörper betrachtet, kann sich dessen Ladung durch Übertragung ändern; die Systemgrenze entscheidet daher über die korrekte Bilanz.",
            "essentialUnderstandingEn": "For an appropriately chosen overall system, the algebraic sum of electric charges remains conserved during redistribution. If only one body is considered, its charge can change through transfer; the system boundary therefore determines the correct balance.",
            "observablePerformanceDe": "Die lernende Person markiert die Systemgrenze, bilanziert qualitative oder vorgegebene signierte Ladungsmengen vor und nach dem Vorgang und erklärt scheinbare Änderungen eines Teilkörpers durch den Transfer über seine Grenze.",
            "observablePerformanceEn": "The learner marks the system boundary, balances qualitative or supplied signed charge amounts before and after the process, and explains apparent changes of one body through transfer across its boundary."
          },
          {
            "id": "changed-initial-state-requires-new-prediction",
            "essentialUnderstandingDe": "Die qualitative Endverteilung hängt von den anfänglichen Ladungsvorzeichen, ihrem Ausgleich und der Art des Kontakts oder der Trennung ab. Ein vertauschtes Vorzeichen oder eine andere Systemgrenze erfordert eine neue Bilanz statt die Übernahme eines Bildmusters.",
            "essentialUnderstandingEn": "The qualitative final distribution depends on the initial charge signs, their balance, and the type of contact or separation. A reversed sign or different system boundary requires a new balance rather than copying a visual pattern.",
            "observablePerformanceDe": "Die lernende Person sagt in einem veränderten Fall voraus, welche Körper anschließend positiv, negativ oder neutral sind, verfolgt den Ladungstransfer und prüft die Vorhersage an der erhaltenen Gesamtbilanz.",
            "observablePerformanceEn": "In a changed case, the learner predicts which bodies are subsequently positive, negative, or neutral, traces charge transfer, and checks the prediction against the conserved net balance."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "charging-is-redistribution",
            "net-charge-is-conserved-for-chosen-system",
            "changed-initial-state-requires-new-prediction"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 3,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "system-boundary",
            "textDe": "Ein einzelner Körper, zwei wechselwirkende Körper oder beide Körper mit ihrer Umgebung als betrachtetes System",
            "textEn": "One body, two interacting bodies, or both bodies with their surroundings as the system considered"
          },
          {
            "id": "initial-charge-state",
            "textDe": "Neutral und geladen, gleichnamig geladen oder entgegengesetzt geladen mit wechselnden Beträgen",
            "textEn": "Neutral and charged, like-charged, or oppositely charged with changing magnitudes"
          },
          {
            "id": "redistribution-process",
            "textDe": "Trennung durch Reibung, Übertragung bei Kontakt oder Ausgleich über eine leitende Verbindung",
            "textEn": "Separation by rubbing, transfer on contact, or equalization through a conducting connection"
          },
          {
            "id": "representation",
            "textDe": "Vorzeichenbild, Ladungsmarker, qualitative Bilanz oder sprachlich beschriebener Vorgang",
            "textEn": "Sign diagram, charge markers, qualitative balance, or verbally described process"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "rod-and-cloth-charge-balance",
            "taskDemandDe": "Ein anfangs neutrales Stab-Tuch-System wird gerieben. Danach ist der Stab negativ und das Tuch entsprechend positiv geladen. Stelle die Verteilung vor und nach dem Vorgang dar und bilanziere die Gesamtladung für drei Systemgrenzen: nur Stab, nur Tuch und beide zusammen.",
            "taskDemandEn": "An initially neutral rod-cloth system is rubbed. Afterwards the rod is negatively charged and the cloth correspondingly positively charged. Represent the distribution before and after and balance net charge for three boundaries: rod only, cloth only, and both together.",
            "expectedPerformanceDe": "Die lernende Person beschreibt eine Übertragung beziehungsweise Trennung vorhandener Ladungen, erkennt die Ladungsänderung jedes Teilkörpers und zeigt, dass die entgegengesetzten Änderungen im Gesamtsystem die anfängliche Gesamtladung erhalten.",
            "expectedPerformanceEn": "The learner describes transfer or separation of existing charges, recognizes the charge change of each body, and shows that the opposite changes preserve the initial net charge of the overall system.",
            "understandingFocusDe": "Die wechselnde Systemgrenze prüft Erhaltung ohne die reale Teilkörperänderung zu leugnen.",
            "understandingFocusEn": "Changing the system boundary tests conservation without denying the real change of each body."
          },
          {
            "id": "charged-and-neutral-spheres-contact",
            "taskDemandDe": "Eine positiv geladene leitende Kugel berührt eine gleich große neutrale Kugel und wird wieder getrennt. Sage die qualitative Endladung beider Kugeln voraus, stelle die Umverteilung dar und prüfe die Gesamtbilanz.",
            "taskDemandEn": "A positively charged conducting sphere touches an equal-sized neutral sphere and is separated again. Predict the qualitative final charge of both spheres, represent the redistribution, and check the total balance.",
            "expectedPerformanceDe": "Die lernende Person sagt für beide Kugeln eine positive Endladung voraus, verteilt die anfängliche positive Gesamtladung auf das Zwei-Kugel-System und erklärt, dass keine zusätzliche Ladung entstanden ist.",
            "expectedPerformanceEn": "The learner predicts a positive final charge on both spheres, distributes the initial positive net charge across the two-sphere system, and explains that no additional charge was created.",
            "understandingFocusDe": "Der Kontaktfall prüft Ladungsübertragung und Erhaltung bei einem zuvor neutralen Partner.",
            "understandingFocusEn": "The contact case tests charge transfer and conservation with an initially neutral partner."
          },
          {
            "id": "opposite-charge-equalization-transfer",
            "taskDemandDe": "Zwei gleich große leitende Körper tragen entgegengesetzte, aber unterschiedlich große vorgegebene Ladungen und werden kurz leitend verbunden. Bestimme aus den signierten Ausgangswerten das Vorzeichen der verbleibenden Gesamtladung und sage die qualitative Endverteilung voraus.",
            "taskDemandEn": "Two equal conducting bodies carry opposite but unequal supplied charges and are briefly connected conductively. Use the signed initial values to determine the sign of the remaining net charge and predict the qualitative final distribution.",
            "expectedPerformanceDe": "Die lernende Person addiert die Ladungen mit Vorzeichen, erkennt den teilweisen Ausgleich, verteilt die verbleibende Gesamtladung bei den gleichartigen Körpern konsistent und prüft, dass Anfangs- und Endsumme übereinstimmen.",
            "expectedPerformanceEn": "The learner adds the charges with signs, recognizes partial equalization, consistently distributes the remaining net charge between the identical bodies, and checks that initial and final sums agree.",
            "understandingFocusDe": "Der unvollständige Ausgleich verhindert die flache Regel, entgegengesetzte Ladungen führten immer zu Neutralität.",
            "understandingFocusEn": "The incomplete equalization prevents the shallow rule that opposite charges always produce neutrality."
          }
        ]
      }
    },
    {
      "goalId": "28237994-9c24-5a06-82fe-be1f494768ba",
      "profile": {
        "archetype": "experiment",
        "expectations": [
          {
            "id": "voltage-belongs-to-ordered-point-pair",
            "essentialUnderstandingDe": "Spannung ist eine Messgröße zwischen genau zwei ausgewählten Punkten. Messwert und Vorzeichen beziehen sich auf dieses geordnete Punktepaar; eine Aussage wie 'die Spannung an einer Stelle' ist ohne zweiten Bezugspunkt unvollständig.",
            "essentialUnderstandingEn": "Voltage is a quantity measured between exactly two selected points. The reading and sign refer to this ordered pair; a statement such as 'the voltage at a point' is incomplete without a second reference point.",
            "observablePerformanceDe": "Die lernende Person kennzeichnet in einem unbekannten einfachen Stromkreis beide gefragten Bezugspunkte, benennt die Anschlussreihenfolge und gibt einen Messwert zusammen mit Einheit und Punktepaar an.",
            "observablePerformanceEn": "In an unfamiliar simple circuit, the learner identifies both requested reference points, states the terminal order, and reports a reading together with its unit and point pair."
          },
          {
            "id": "voltmeter-connects-in-parallel-to-pair",
            "essentialUnderstandingDe": "Damit das Voltmeter die Spannung zwischen zwei Punkten misst, werden seine Leitungen parallel an genau diese Punkte angeschlossen, ohne den Verbraucherpfad an dieser Stelle zu ersetzen. Die Anschlussart folgt aus der Messfrage und nicht aus der räumlichen Lage des Messgeräts.",
            "essentialUnderstandingEn": "To measure the voltage between two points, the voltmeter leads are connected in parallel to precisely those points without replacing the device path there. The connection follows from the measurement question, not from the instrument's spatial position.",
            "observablePerformanceDe": "Die lernende Person baut oder ergänzt in einem neuen sicheren Kleinspannungsstromkreis den parallelen Anschluss für ein vorgegebenes Punktepaar und erklärt, warum beide Messleitungen genau dort enden müssen.",
            "observablePerformanceEn": "In a fresh safe low-voltage circuit, the learner builds or completes the parallel connection for a specified pair of points and explains why both meter leads must terminate there."
          },
          {
            "id": "range-polarity-and-changed-reference",
            "essentialUnderstandingDe": "Messbereich, Skala beziehungsweise Anzeige, Einheit und Polung bestimmen gemeinsam den Spannungswert. Werden die Messleitungen vertauscht, kehrt sich bei derselben Spannung die Vorzeichenrichtung um; wird ein Bezugspunkt geändert, wird grundsätzlich ein anderes Punktepaar untersucht.",
            "essentialUnderstandingEn": "Measurement range, scale or display, unit, and polarity jointly determine the voltage reading. If the leads are reversed, the sign direction reverses for the same voltage; if a reference point changes, a different pair is being investigated in principle.",
            "observablePerformanceDe": "Die lernende Person wählt einen sicheren geeigneten Messbereich, liest einen analogen oder digitalen Wert korrekt und sagt bei vertauschten Leitungen oder versetztem Bezugspunkt begründet voraus, was sich an Bedeutung und Vorzeichen ändert.",
            "observablePerformanceEn": "The learner selects a safe suitable range, correctly reads an analog or digital value, and predicts with justification how meaning and sign change when the leads are reversed or one reference point is moved."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "voltage-belongs-to-ordered-point-pair",
            "voltmeter-connects-in-parallel-to-pair",
            "range-polarity-and-changed-reference"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 3,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "reference-point-pair",
            "textDe": "Anschlüsse eines Verbrauchers, Pole der Quelle oder zwei andere klar markierte Punkte",
            "textEn": "Terminals of a device, terminals of the source, or two other clearly marked points"
          },
          {
            "id": "lead-order-and-polarity",
            "textDe": "Normale oder vertauschte Messleitungen bei gleichbleibendem Punktepaar",
            "textEn": "Normal or reversed meter leads for the same point pair"
          },
          {
            "id": "instrument-and-range",
            "textDe": "Analoge Skala oder Digitalanzeige mit unbekanntem beziehungsweise angepasstem Messbereich",
            "textEn": "Analog scale or digital display with an unknown or adjusted measurement range"
          },
          {
            "id": "circuit-layout",
            "textDe": "Räumlich neu angeordneter einfacher Kleinspannungsstromkreis mit unveränderten oder geänderten Bezugspunkten",
            "textEn": "Spatially rearranged simple low-voltage circuit with unchanged or changed reference points"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "measure-voltage-across-lamp",
            "taskDemandDe": "In einem einfachen Kleinspannungsstromkreis soll die Spannung zwischen den beiden Lampenanschlüssen gemessen werden. Markiere das Punktepaar, plane Anschluss und sicheren Startmessbereich, führe die Messung durch und dokumentiere das Ergebnis vollständig.",
            "taskDemandEn": "In a simple low-voltage circuit, the voltage between the two lamp terminals is to be measured. Mark the point pair, plan the connection and safe initial range, perform the measurement, and document the result completely.",
            "expectedPerformanceDe": "Die lernende Person verbindet das Voltmeter parallel mit beiden Lampenanschlüssen, lässt den Lampenpfad bestehen, beginnt in einem sicheren Bereich und gibt Zahlenwert, Einheit sowie die beiden Bezugspunkte an.",
            "expectedPerformanceEn": "The learner connects the voltmeter in parallel to both lamp terminals, leaves the lamp path intact, starts with a safe range, and reports the numerical value, unit, and both reference points.",
            "understandingFocusDe": "Die explizite Punktpaarangabe macht die Bedeutung des Messwerts zusätzlich zur Anschlussroutine sichtbar.",
            "understandingFocusEn": "Explicitly naming the point pair makes the meaning of the reading visible in addition to the connection routine."
          },
          {
            "id": "reverse-source-measurement-leads",
            "taskDemandDe": "Ein Voltmeter misst die Spannung einer sicheren Kleinspannungsquelle mit festgelegter roter Leitung am Pluspol und schwarzer Leitung am Minuspol. Sage vor dem Vertauschen beider Leitungen die Änderung der Anzeige voraus und erkläre sie über das geordnete Punktepaar.",
            "taskDemandEn": "A voltmeter measures a safe low-voltage source with the red lead at the positive terminal and the black lead at the negative terminal. Before reversing both leads, predict the change in the display and explain it using the ordered point pair.",
            "expectedPerformanceDe": "Die lernende Person hält den Betrag für dieselbe Quellenspannung qualitativ fest, sagt ein umgekehrtes Vorzeichen beziehungsweise eine entgegengesetzte Zeigerrichtung voraus und führt dies auf die vertauschte Bezugsrichtung zurück.",
            "expectedPerformanceEn": "The learner keeps the magnitude qualitatively unchanged for the same source voltage, predicts a reversed sign or opposite pointer direction, and attributes this to the reversed reference order.",
            "understandingFocusDe": "Der Leitungswechsel prüft Polung als Teil der Messbedeutung statt als Farberinnerung.",
            "understandingFocusEn": "Reversing the leads tests polarity as part of measurement meaning rather than a color memory."
          },
          {
            "id": "move-one-reference-point",
            "taskDemandDe": "In einem neu angeordneten Stromkreis ist ein Voltmeter zunächst an den beiden Anschlüssen eines Verbrauchers angeschlossen. Eine Messleitung wird anschließend zu einem markierten Quellenpol versetzt. Erkläre vor einer Messung, warum nun ein anderes Punktepaar untersucht wird, und plane den korrekten parallelen Anschluss.",
            "taskDemandEn": "In a rearranged circuit, a voltmeter is initially connected to the two terminals of a device. One lead is then moved to a marked source terminal. Before measuring, explain why a different point pair is now investigated and plan the correct parallel connection.",
            "expectedPerformanceDe": "Die lernende Person benennt für beide Situationen die jeweiligen zwei Punkte, vermeidet die Behauptung einer ortsunabhängigen Einzelpunktspannung und verbindet das Messgerät in der zweiten Situation genau mit dem neu gefragten Paar.",
            "expectedPerformanceEn": "The learner names the two points for both situations, avoids claiming a location-independent single-point voltage, and connects the instrument in the second situation precisely to the newly requested pair.",
            "understandingFocusDe": "Der geänderte Bezugspunkt prüft die relationale Bedeutung der Spannung in einem frischen Layout.",
            "understandingFocusEn": "The changed reference point tests the relational meaning of voltage in a fresh layout."
          }
        ]
      }
    },
    {
      "goalId": "8a84de16-2fde-58ec-827a-f803e2ce8564",
      "profile": {
        "archetype": "procedure",
        "expectations": [
          {
            "id": "charge-rate-balance",
            "essentialUnderstandingDe": "Elektrische Stromstärke beschreibt transportierte Ladung pro Zeit. An einem Knoten bestimmt die Differenz zwischen zu- und abfließenden Strömen die Änderung der dort gespeicherten Ladung; im stationären Zustand ohne Ladungsansammlung ist deshalb die vorzeichenbehaftete Stromsumme null.",
            "essentialUnderstandingEn": "Electric current describes charge transported per unit time. At a junction, the difference between incoming and outgoing currents determines the change in charge stored there; in steady state with no charge accumulation, the signed sum of currents is therefore zero.",
            "observablePerformanceDe": "Die lernende Person stellt für einen unbekannten Knoten eine vollständige vorzeichenbehaftete Strombilanz auf und begründet deren Nullsumme ausdrücklich mit der Ladungserhaltung und der Bedingung fehlender Ladungsansammlung.",
            "observablePerformanceEn": "For an unfamiliar junction, the learner writes a complete signed current balance and explicitly justifies its zero sum using charge conservation and the condition that no charge accumulates."
          },
          {
            "id": "direction-and-unknown-current",
            "essentialUnderstandingDe": "Strompfeile dürfen zunächst als Bezugsrichtungen gewählt werden; das Vorzeichen des berechneten Stroms entscheidet, ob die tatsächliche Richtung mit dieser Wahl übereinstimmt.",
            "essentialUnderstandingEn": "Current arrows may initially be chosen as reference directions; the sign of the calculated current determines whether the actual direction agrees with that choice.",
            "observablePerformanceDe": "Die lernende Person legt Strompfeile und eine konsistente Vorzeichenkonvention fest, bestimmt oder prüft eine unbekannte Stromstärke mit Einheit und deutet ein negatives Ergebnis als Strom in der entgegengesetzten tatsächlichen Richtung.",
            "observablePerformanceEn": "The learner assigns current arrows and a consistent sign convention, determines or checks an unknown current with units, and interprets a negative result as current in the opposite actual direction."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "charge-rate-balance",
            "direction-and-unknown-current"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "branch-pattern",
            "textDe": "Anzahl und Anordnung der zu- und abfließenden Zweigströme",
            "textEn": "Number and arrangement of incoming and outgoing branch currents"
          },
          {
            "id": "assumed-direction",
            "textDe": "Gewählte Bezugsrichtung des unbekannten Zweigstroms",
            "textEn": "Chosen reference direction of the unknown branch current"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "three-branch-junction",
            "taskDemandDe": "An einem stationären Dreifachknoten fließen 0,50 A und 0,20 A entsprechend eingezeichneter Pfeile zu; der dritte Strom ist mit einem vom Lernenden gewählten Pfeil zu bestimmen und die Knotenregel physikalisch zu begründen.",
            "taskDemandEn": "At a steady-state three-branch junction, currents of 0.50 A and 0.20 A flow in according to the shown arrows; the third current must be determined using an arrow chosen by the learner, and the junction rule must be justified physically.",
            "expectedPerformanceDe": "Die lernende Person wählt eine Bezugsrichtung, bilanziert die drei Ströme mit konsistenten Vorzeichen, erhält 0,70 A als abfließenden Strom und erklärt, dass sonst Ladung am Knoten anwachsen würde.",
            "expectedPerformanceEn": "The learner chooses a reference direction, balances all three currents with consistent signs, obtains 0.70 A as the outgoing current, and explains that charge would otherwise build up at the junction.",
            "understandingFocusDe": "Die Rechnung wird als stationäre Ladungsbilanz gedeutet und nicht als bloßes Additionsschema.",
            "understandingFocusEn": "The calculation is interpreted as a steady-state charge balance rather than merely an addition recipe."
          },
          {
            "id": "added-branch-negative-result",
            "taskDemandDe": "Ein neuer Vierfachknoten enthält zwei zufließende und einen bekannten abfließenden Strom; für den vierten Zweig ist absichtlich ein Pfeil zum Knoten vorgegeben. Die unbekannte Stromstärke und ihre tatsächliche Richtung sind zu bestimmen und zu prüfen.",
            "taskDemandEn": "A new four-branch junction has two incoming currents and one known outgoing current; an arrow toward the junction is deliberately specified for the fourth branch. The unknown current and its actual direction must be determined and checked.",
            "expectedPerformanceDe": "Die lernende Person formuliert die vollständige Bilanz, interpretiert ein gegebenenfalls negatives Ergebnis relativ zum vorgegebenen Pfeil, kehrt die tatsächliche Richtung korrekt um und prüft, dass Zu- und Abfluss gleich groß sind.",
            "expectedPerformanceEn": "The learner formulates the complete balance, interprets any negative result relative to the specified arrow, reverses the actual direction correctly, and checks that total inflow equals total outflow.",
            "understandingFocusDe": "Der geänderte Zweig und die ungünstige Bezugsrichtung zeigen, ob Vorzeichen und physikalische Stromrichtung wirklich unterschieden werden.",
            "understandingFocusEn": "The changed branch pattern and inconvenient reference direction reveal whether sign and physical current direction are genuinely distinguished."
          }
        ]
      }
    },
    {
      "goalId": "267170bd-f880-56a7-9719-ffb9751872c5",
      "profile": {
        "archetype": "procedure",
        "expectations": [
          {
            "id": "energy-per-charge-loop-balance",
            "essentialUnderstandingDe": "Spannung beschreibt übertragene Energie pro Ladung. In einer stationären geschlossenen Masche erhält eine Ladung an Quellen Energie und überträgt sie an Bauteile; nach der Rückkehr zum selben Bezugspunkt ist die vorzeichenbehaftete Summe aller Spannungsänderungen null.",
            "essentialUnderstandingEn": "Voltage describes energy transferred per unit charge. In a steady-state closed loop, a charge gains energy at sources and transfers it to components; after returning to the same reference point, the signed sum of all voltage changes is zero.",
            "observablePerformanceDe": "Die lernende Person stellt für eine unbekannte einfache Masche eine vollständige Spannungsbilanz auf und erklärt jeden Quellanstieg beziehungsweise Bauteilabfall als Energieaufnahme oder Energieübertragung pro Ladung.",
            "observablePerformanceEn": "For an unfamiliar simple loop, the learner writes a complete voltage balance and explains each source rise or component drop as energy gained or transferred per unit charge."
          },
          {
            "id": "consistent-traversal-and-polarity",
            "essentialUnderstandingDe": "Die Vorzeichen einzelner Spannungsänderungen hängen von Umlaufrichtung und Bauteilpolarität ab; werden beide konsistent verwendet, liefert auch die umgekehrte Umlaufrichtung dieselbe physikalische Aussage.",
            "essentialUnderstandingEn": "The signs of individual voltage changes depend on traversal direction and component polarity; when both are used consistently, reversing the traversal gives the same physical conclusion.",
            "observablePerformanceDe": "Die lernende Person wählt eine Umlaufrichtung, kennzeichnet Polaritäten, ordnet jedem Durchgang das richtige Vorzeichen zu, bestimmt oder prüft eine unbekannte Spannung mit Einheit und zeigt die Konsistenz durch eine zweite Umlaufrichtung oder eine Rückprüfung.",
            "observablePerformanceEn": "The learner chooses a traversal direction, marks polarities, assigns the correct sign to each traversal, determines or checks an unknown voltage with units, and demonstrates consistency using the opposite traversal or a reverse check."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "energy-per-charge-loop-balance",
            "consistent-traversal-and-polarity"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "traversal-direction",
            "textDe": "Umlauf im oder gegen den Uhrzeigersinn bei unveränderter Schaltung",
            "textEn": "Clockwise or counterclockwise traversal of the unchanged circuit"
          },
          {
            "id": "source-and-component-orientation",
            "textDe": "Orientierung einer Quelle oder Polarität und Anzahl passiver Bauteile",
            "textEn": "Orientation of a source or polarity and the number of passive components"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "unknown-component-voltage",
            "taskDemandDe": "Eine geschlossene Masche enthält eine 12-V-Quelle und zwei passive Bauteile mit Spannungsabfällen von 5 V und einer unbekannten Spannung. Polaritäten und eine Umlaufrichtung sind festzulegen, die unbekannte Spannung ist zu bestimmen und die Gleichung energetisch zu deuten.",
            "taskDemandEn": "A closed loop contains a 12 V source and two passive components with voltage drops of 5 V and an unknown voltage. Polarities and a traversal direction must be established, the unknown voltage determined, and the equation interpreted energetically.",
            "expectedPerformanceDe": "Die lernende Person markiert konsistente Polaritäten, bilanziert plus 12 V minus 5 V minus U gleich null, erhält U gleich 7 V und erklärt, dass die Quelle 12 Joule pro Coulomb bereitstellt, die vollständig auf die Bauteile übertragen werden.",
            "expectedPerformanceEn": "The learner marks consistent polarities, balances plus 12 V minus 5 V minus U equals zero, obtains U equals 7 V, and explains that the source supplies 12 joules per coulomb that are fully transferred to the components.",
            "understandingFocusDe": "Vorzeichenrechnung und Energie-pro-Ladung-Bedeutung müssen gemeinsam sichtbar werden.",
            "understandingFocusEn": "Sign calculation and the energy-per-charge meaning must be made visible together."
          },
          {
            "id": "reversed-source-and-traversal",
            "taskDemandDe": "In einer neuen Masche mit drei passiven Bauteilen ist die Quelle gegenüber der ersten Aufgabe umgekehrt eingezeichnet. Die Bilanz ist zunächst in einer gewählten und anschließend in der entgegengesetzten Umlaufrichtung aufzustellen; eine unbekannte Spannung ist zu prüfen.",
            "taskDemandEn": "In a new loop with three passive components, the source is drawn in the opposite orientation from the first task. The balance must be written first in a chosen traversal direction and then in the opposite direction, and an unknown voltage must be checked.",
            "expectedPerformanceDe": "Die lernende Person passt die Vorzeichen an Quelle, Polaritäten und Umlaufrichtung an, erhält aus beiden vollständigen Bilanzen dieselbe unbekannte Spannung und erklärt, warum sich die Energieaussage trotz umgekehrter Vorzeichen nicht ändert.",
            "expectedPerformanceEn": "The learner adjusts the signs to the source, polarities, and traversal direction, obtains the same unknown voltage from both complete balances, and explains why the energy statement is unchanged despite reversed signs.",
            "understandingFocusDe": "Der Transfer prüft konsistente Konventionen statt das Wiederholen einer auswendig gelernten Vorzeichenfolge.",
            "understandingFocusEn": "The transfer tests consistent conventions rather than repetition of a memorized sign sequence."
          }
        ]
      }
    },
    {
      "goalId": "f1a078ae-6262-4444-a4bc-a5ab275621cf",
      "profile": {
        "archetype": "experiment",
        "expectations": [
          {
            "id": "ammeter-measures-current-through-selected-path",
            "essentialUnderstandingDe": "Stromstärke bezieht sich auf den Strom durch eine ausgewählte Stelle oder einen ausgewählten Zweig. Das Amperemeter muss deshalb an dieser Stelle in den leitenden Weg eingeschleift werden, sodass derselbe Zweigstrom durch das Messgerät fließt.",
            "essentialUnderstandingEn": "Current refers to the current through a selected location or branch. The ammeter must therefore be inserted into the conducting path at that location so that the same branch current flows through the instrument.",
            "observablePerformanceDe": "Die lernende Person markiert in einem neuen einfachen Stromkreis die gefragte Messstelle, unterbricht dort gezielt den Weg und fügt das Amperemeter in Reihe ein; sie erklärt, welchen Zweigstrom der Messwert bezeichnet.",
            "observablePerformanceEn": "In a fresh simple circuit, the learner marks the requested measurement location, deliberately opens the path there, and inserts the ammeter in series; the learner explains which branch current the reading represents."
          },
          {
            "id": "range-polarity-unit-support-valid-reading",
            "essentialUnderstandingDe": "Eine fachgerechte Strommessung verbindet sichere Kleinspannung, passende Anschlüsse und Polung, einen zunächst sicheren und anschließend ausreichend auflösenden Messbereich sowie Zahlenwert und Einheit. Skalenwert und Messbereich dürfen nicht unabhängig gelesen werden.",
            "essentialUnderstandingEn": "A valid current measurement combines safe low voltage, suitable terminals and polarity, an initially safe and subsequently sufficiently resolving range, and a numerical value with unit. Scale reading and range must not be interpreted independently.",
            "observablePerformanceDe": "Die lernende Person wählt begründet Anschlüsse und Startmessbereich, verbessert die Auflösung nur ohne Überlastungsrisiko, liest die Skala beziehungsweise Anzeige passend und dokumentiert den Messwert mit Vorzeichen und Einheit.",
            "observablePerformanceEn": "The learner justifiably selects terminals and an initial range, improves resolution only without overload risk, interprets the scale or display appropriately, and records the reading with sign and unit."
          },
          {
            "id": "measurement-plan-and-plausibility-check",
            "essentialUnderstandingDe": "Die Einfügestelle muss zur gestellten Messfrage passen; ein parallel angeschlossenes Amperemeter beantwortet sie nicht und kann den Aufbau gefährden. Vor dem Einschalten werden Verbindungsweg, Messbereich und erwartete Größenordnung geprüft, danach wird ein auffälliger Messwert nicht ungeprüft übernommen.",
            "essentialUnderstandingEn": "The insertion point must match the measurement question; an ammeter connected in parallel does not answer it and can make the setup unsafe. Before energizing, the path, range, and expected order of magnitude are checked, and an anomalous reading is not accepted without examination.",
            "observablePerformanceDe": "Die lernende Person diagnostiziert in einer unbekannten Messschaltung eine falsche Einfügestelle oder Bereichswahl vor dem Einschalten, korrigiert sie sicher und prüft den erhaltenen Wert auf Einheit, Vorzeichen und plausible Größenordnung.",
            "observablePerformanceEn": "In an unfamiliar measurement circuit, the learner diagnoses an incorrect insertion point or range before energizing it, corrects it safely, and checks the resulting value for unit, sign, and plausible order of magnitude."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "ammeter-measures-current-through-selected-path",
            "range-polarity-unit-support-valid-reading",
            "measurement-plan-and-plausibility-check"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 3,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "measurement-location",
            "textDe": "Gesamtweg oder ausgewählter Zweig an wechselnder Stelle des einfachen Stromkreises",
            "textEn": "Complete path or selected branch at a changing location in the simple circuit"
          },
          {
            "id": "expected-magnitude-and-range",
            "textDe": "Unbekannte Größenordnung mit sicherem Startbereich oder bekannte kleine Größenordnung mit höherer Auflösung",
            "textEn": "Unknown magnitude with a safe initial range or known small magnitude with higher resolution"
          },
          {
            "id": "instrument-display",
            "textDe": "Analoge Skala oder digitale Anzeige mit wechselnder Einheit und Polungsanzeige",
            "textEn": "Analog scale or digital display with changing unit and polarity indication"
          },
          {
            "id": "circuit-layout",
            "textDe": "Einfacher unverzweigter oder übersichtlicher verzweigter Kleinspannungsstromkreis",
            "textEn": "Simple unbranched or clear branched low-voltage circuit"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "measure-lamp-current-safely",
            "taskDemandDe": "In einem einfachen Kleinspannungsstromkreis mit Lampe soll die Stromstärke unmittelbar vor der Lampe gemessen werden; die Größenordnung ist unbekannt. Plane Anschluss und Bereichswahl, führe die Messung sicher durch und gib das Ergebnis vollständig an.",
            "taskDemandEn": "In a simple low-voltage circuit containing a lamp, current is to be measured immediately before the lamp; its order of magnitude is unknown. Plan the connection and range selection, perform the measurement safely, and report the result completely.",
            "expectedPerformanceDe": "Die lernende Person öffnet den Weg an der verlangten Stelle, fügt das Amperemeter in Reihe mit korrekten Anschlüssen ein, beginnt im sicheren großen Bereich, passt die Auflösung an und dokumentiert Zahlenwert und Einheit.",
            "expectedPerformanceEn": "The learner opens the path at the requested location, inserts the ammeter in series using the correct terminals, starts with a safe high range, adjusts resolution, and records the numerical value and unit.",
            "understandingFocusDe": "Planung und Bereichswechsel prüfen Messprinzip und Sicherheit gemeinsam.",
            "understandingFocusEn": "Planning and changing the range test the measurement principle and safety together."
          },
          {
            "id": "select-one-branch-current",
            "taskDemandDe": "Ein übersichtlicher Kleinspannungsstromkreis besitzt zwei Zweige mit je einem Verbraucher. Gemessen werden soll nur die Stromstärke im zweiten Zweig. Kennzeichne die Einfügestelle, baue die Messung auf und erkläre, warum eine Stelle vor der Verzweigung eine andere Messfrage beträfe.",
            "taskDemandEn": "A clear low-voltage circuit has two branches, each with one device. Only the current in the second branch is to be measured. Mark the insertion point, set up the measurement, and explain why a location before the split would address a different measurement question.",
            "expectedPerformanceDe": "Die lernende Person fügt das Amperemeter ausschließlich in den zweiten Zweig ein, verfolgt dessen Strompfad, wählt einen sicheren Bereich und bezieht den dokumentierten Messwert ausdrücklich auf diesen Zweig.",
            "expectedPerformanceEn": "The learner inserts the ammeter only into the second branch, traces that branch's current path, chooses a safe range, and explicitly relates the recorded reading to that branch.",
            "understandingFocusDe": "Die Zweigwahl prüft die Bedeutung der Messstelle statt der bloßen Regel 'in Reihe'.",
            "understandingFocusEn": "Selecting the branch tests the meaning of measurement location rather than the bare rule 'in series'."
          },
          {
            "id": "diagnose-parallel-ammeter-error",
            "taskDemandDe": "In einem noch nicht eingeschalteten Kleinspannungsaufbau ist ein Amperemeter direkt parallel zur Quelle angeschlossen und auf einen kleinen Messbereich gestellt. Prüfe den Vorschlag, erkläre die fachlichen und sicherheitsbezogenen Fehler und entwirf eine korrekte Messung des Lampenstroms.",
            "taskDemandEn": "In a low-voltage setup that has not yet been energized, an ammeter is connected directly in parallel with the source and set to a low range. Check the proposal, explain the scientific and safety errors, and design a correct measurement of the lamp current.",
            "expectedPerformanceDe": "Die lernende Person verwirft den parallelen Anschluss vor dem Einschalten, begründet die notwendige Einfügung in den Lampenpfad, wählt zunächst einen sicheren Bereich und zeichnet oder baut die korrigierte Reihenschaltung.",
            "expectedPerformanceEn": "The learner rejects the parallel connection before energizing, justifies the required insertion into the lamp path, selects a safe initial range, and draws or builds the corrected series connection.",
            "understandingFocusDe": "Die Fehlerdiagnose zeigt, ob Reihenschaltung kausal und sicherheitsbewusst verstanden wird.",
            "understandingFocusEn": "The fault diagnosis reveals whether series connection is understood causally and with safety awareness."
          }
        ]
      }
    },
    {
      "goalId": "53196a71-9dbd-4835-b2f9-ff21b8a8962c",
      "profile": {
        "archetype": "data",
        "expectations": [
          {
            "id": "paired-measurements-describe-same-operating-state",
            "essentialUnderstandingDe": "Jeder Datenpunkt besteht aus der Spannung an und der Stromstärke durch dasselbe Bauteil im selben Betriebszustand. Nur korrekt gepaarte Messwerte unter kontrollierten weiteren Bedingungen können einen Zusammenhang zwischen beiden Größen zeigen.",
            "essentialUnderstandingEn": "Each data point consists of the voltage across and current through the same component in the same operating state. Only correctly paired readings under otherwise controlled conditions can reveal a relationship between the two quantities.",
            "observablePerformanceDe": "Die lernende Person plant oder prüft eine Messreihe, ordnet jedem Spannungswert den gleichzeitig gehörenden Stromwert zu, benennt das untersuchte Bauteil und dokumentiert die kontrollierten Bedingungen.",
            "observablePerformanceEn": "The learner plans or checks a measurement series, pairs each voltage value with the corresponding simultaneous current value, identifies the component investigated, and records the controlled conditions."
          },
          {
            "id": "data-trend-supports-qualitative-relationship",
            "essentialUnderstandingDe": "Eine Tabelle oder ein U-I-Diagramm macht sichtbar, wie sich die Stromstärke mit der Spannung im untersuchten Bereich qualitativ verändert. Einzelne Werte oder Messstreuung reichen nicht für eine starre Regel; Trend, Einheiten, Messbereich und Datenqualität bestimmen die vertretbare Aussage.",
            "essentialUnderstandingEn": "A table or voltage-current graph shows how current changes qualitatively with voltage over the investigated range. Individual values or measurement scatter do not establish a rigid rule; the trend, units, range, and data quality determine the defensible claim.",
            "observablePerformanceDe": "Die lernende Person ordnet frische Messwertpaare mit Einheiten, stellt sie geeignet dar, beschreibt Anstieg und gegebenenfalls Krümmung oder Streuung und begrenzt die Aussage auf den tatsächlich untersuchten Bereich.",
            "observablePerformanceEn": "The learner organizes fresh paired measurements with units, represents them appropriately, describes increase and any curvature or scatter, and limits the claim to the range actually investigated."
          },
          {
            "id": "relationship-depends-on-component-and-conditions",
            "essentialUnderstandingDe": "Der qualitative Zusammenhang kann vom Bauteil und von relevanten Bedingungen abhängen; steigende Stromstärke bei steigender Spannung bedeutet nicht automatisch Proportionalität. Für ein anderes Bauteil oder einen veränderten Betriebsbereich muss der Trend erneut aus Daten geprüft werden.",
            "essentialUnderstandingEn": "The qualitative relationship can depend on the component and relevant conditions; increasing current with increasing voltage does not automatically mean proportionality. For another component or a changed operating range, the trend must be reassessed from data.",
            "observablePerformanceDe": "Die lernende Person vergleicht zwei unabhängige Messreihen, prüft eine mögliche Proportionalitätsbehauptung an der Form und den Wertepaaren und erklärt fachlich, welche Bauteil- oder Bedingungsänderung eine neue Aussage erfordert.",
            "observablePerformanceEn": "The learner compares two independent measurement series, checks a possible proportionality claim against the shape and paired values, and explains which component or condition change requires a new conclusion."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "paired-measurements-describe-same-operating-state",
            "data-trend-supports-qualitative-relationship",
            "relationship-depends-on-component-and-conditions"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 3,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "component-type",
            "textDe": "Ein einfaches näherungsweise lineares Bauteil oder ein Bauteil mit deutlich gekrümmtem qualitativen Verlauf",
            "textEn": "A simple approximately linear component or a component with a clearly curved qualitative trend"
          },
          {
            "id": "operating-range",
            "textDe": "Enger Bereich nahe kleiner Spannungen oder erweiterter sicherer Kleinspannungsbereich",
            "textEn": "Narrow range near low voltages or an extended safe low-voltage range"
          },
          {
            "id": "controlled-condition",
            "textDe": "Unverändertes Bauteil und stabile Bedingungen oder eine ausdrücklich geänderte relevante Bedingung",
            "textEn": "Unchanged component and stable conditions or one explicitly changed relevant condition"
          },
          {
            "id": "data-representation",
            "textDe": "Rohdatentabelle, U-I-Diagramm oder Messreihe mit realistischer Streuung",
            "textEn": "Raw data table, voltage-current graph, or measurement series with realistic scatter"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "paired-series-and-graph",
            "taskDemandDe": "Für ein einfaches Bauteil wird unter sicherer Kleinspannung eine neue Messreihe geplant. Lege fest, wie Spannung am und Stromstärke durch dasselbe Bauteil für jeden Betriebszustand gemeinsam erfasst werden, ordne die Daten und beschreibe den qualitativen Verlauf im U-I-Diagramm.",
            "taskDemandEn": "A fresh measurement series is planned for a simple component under safe low voltage. Specify how voltage across and current through the same component are recorded together for each operating state, organize the data, and describe the qualitative trend in a voltage-current graph.",
            "expectedPerformanceDe": "Die lernende Person erzeugt eindeutig gepaarte Werte mit Einheiten, hält relevante weitere Bedingungen fest, trägt zusammengehörige Punkte korrekt auf und formuliert eine bereichsgebundene Trendaussage statt aus einem Einzelwert zu schließen.",
            "expectedPerformanceEn": "The learner produces unambiguously paired values with units, keeps relevant other conditions fixed, plots corresponding points correctly, and states a range-bounded trend rather than inferring from one value.",
            "understandingFocusDe": "Messplanung und Darstellung prüfen die Bedeutung eines Datenpunkts als zusammengehöriges U-I-Paar.",
            "understandingFocusEn": "Measurement planning and representation test the meaning of a data point as a paired voltage-current value."
          },
          {
            "id": "linear-looking-versus-curved-data",
            "taskDemandDe": "Zwei unabhängige U-I-Datensätze werden ohne Bauteilnamen vorgelegt. Der erste verläuft im untersuchten Bereich näherungsweise geradlinig durch den Ursprung, der zweite steigt gekrümmt. Prüfe für jeden die Behauptung 'Stromstärke ist proportional zur Spannung' und begründe die unterschiedliche Beurteilung aus den Daten.",
            "taskDemandEn": "Two independent voltage-current data sets are supplied without component names. The first is approximately a straight line through the origin over the investigated range, while the second rises with curvature. For each, assess the claim 'current is proportional to voltage' and justify the different judgments from the data.",
            "expectedPerformanceDe": "Die lernende Person erkennt im ersten Datensatz eine innerhalb der Datenqualität gestützte Proportionalitätsnähe, verwirft sie beim gekrümmten Verlauf, nennt Einheiten und Bereich und behauptet nicht, jeder steigende Zusammenhang sei proportional.",
            "expectedPerformanceEn": "The learner recognizes approximate proportionality supported within the data quality of the first set, rejects it for the curved trend, states units and range, and does not claim that every increasing relationship is proportional.",
            "understandingFocusDe": "Der Formvergleich trennt qualitativen Anstieg von Proportionalität.",
            "understandingFocusEn": "Comparing shapes separates qualitative increase from proportionality."
          },
          {
            "id": "changed-component-transfer-with-scatter",
            "taskDemandDe": "Nach einer ersten Messreihe wird ein anderes einfaches Bauteil eingesetzt. Für dieses liegen neue U-I-Paare mit kleiner realistischer Messstreuung in einem sicheren Bereich vor. Sage vor der Auswertung voraus, dass der alte Verlauf nicht ungeprüft übertragbar ist, analysiere den neuen Trend und vergleiche beide Fälle.",
            "taskDemandEn": "After an initial measurement series, a different simple component is used. Fresh voltage-current pairs with small realistic measurement scatter are supplied for it over a safe range. Predict before analysis that the old trend cannot be transferred without checking, analyze the new trend, and compare the two cases.",
            "expectedPerformanceDe": "Die lernende Person ordnet die neuen Paare, berücksichtigt die Streuung ohne jeden Punkt als eigene Gesetzmäßigkeit zu deuten, beschreibt den tragfähigen Trend und führt Unterschiede auf das geänderte Bauteil beziehungsweise die veränderten Bedingungen zurück.",
            "expectedPerformanceEn": "The learner organizes the new pairs, accounts for scatter without treating each point as a separate law, describes the defensible trend, and attributes differences to the changed component or conditions.",
            "understandingFocusDe": "Der unabhängige Bauteilfall prüft Transfer durch erneute Datenprüfung statt Übernahme einer bekannten Kennlinie.",
            "understandingFocusEn": "The independent component case tests transfer through renewed data analysis rather than carrying over a familiar characteristic."
          }
        ]
      }
    },
    {
      "goalId": "af0e2efb-f634-5f2d-abea-b2e1a67a2894",
      "profile": {
        "archetype": "experiment",
        "expectations": [
          {
            "id": "select-zero-measure-report",
            "essentialUnderstandingDe": "Eine geeignete Waage muss die erwartete Masse innerhalb ihres Messbereichs erfassen und für die Fragestellung fein genug auflösen; Nullpunkt beziehungsweise Tara wird vor der Messung kontrolliert, und die Angabe darf keine feinere Genauigkeit vortäuschen als das Gerät liefert.",
            "essentialUnderstandingEn": "A suitable balance must include the expected mass within its range and resolve it finely enough for the question; zero or tare is checked before measurement, and the report must not imply finer precision than the instrument provides.",
            "observablePerformanceDe": "Die lernende Person wählt für eine neue Messaufgabe eine Waage nach Bereich und Auflösung, kontrolliert den Nullpunkt, misst oder plant fachgerecht und gibt den Wert mit Einheit und angemessener Stellenzahl an.",
            "observablePerformanceEn": "For a new measurement task, the learner selects a balance by range and resolution, checks zero, measures or plans correctly, and reports the value with a unit and an appropriate number of digits."
          },
          {
            "id": "compare-mass-not-appearance",
            "essentialUnderstandingDe": "Masse wird durch die Messung bestimmt und bleibt bei bloßer Umformung desselben vollständig erhaltenen Körpers gleich; Form und Volumen allein erlauben keinen verlässlichen Massenvergleich.",
            "essentialUnderstandingEn": "Mass is determined by measurement and remains unchanged when the same fully retained object is merely reshaped; shape and volume alone do not allow a reliable mass comparison.",
            "observablePerformanceDe": "Die lernende Person vergleicht Massen aus Messwerten, sagt bei reiner Umformung unveränderte Masse voraus und begründet anhand eines Gegenvergleichs, warum weder Form noch Volumen allein die Massenrangfolge festlegen.",
            "observablePerformanceEn": "The learner compares masses from measurements, predicts unchanged mass under mere reshaping, and uses a countercomparison to explain why neither shape nor volume alone determines the ordering by mass."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "select-zero-measure-report",
            "compare-mass-not-appearance"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "instrument-demand",
            "textDe": "Kleine Masse mit hoher Auflösung oder große Masse mit größerem Messbereich",
            "textEn": "Small mass requiring fine resolution or large mass requiring a wider range"
          },
          {
            "id": "object-appearance",
            "textDe": "Derselbe Körper vor und nach einer Formänderung oder Körper verschiedener Volumina mit gegenläufiger Massenrangfolge",
            "textEn": "The same object before and after reshaping or objects of different volumes with the opposite ordering by mass"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "balance-choice-and-zero",
            "taskDemandDe": "Eine Büroklammer von etwa 1 g und ein Paket von etwa 4 kg sollen mit einer Feinwaage bis 200 g in 0,01-g-Schritten oder einer Paketwaage bis 20 kg in 10-g-Schritten gemessen werden.",
            "taskDemandEn": "A paper clip of about 1 g and a parcel of about 4 kg are to be measured using either a fine balance up to 200 g in 0.01-g increments or a parcel scale up to 20 kg in 10-g increments.",
            "expectedPerformanceDe": "Die lernende Person ordnet jedem Objekt das passende Gerät zu, begründet Bereich und Auflösung, verlangt Nullkontrolle und berichtet g beziehungsweise kg nur in instrumentengerechter Genauigkeit.",
            "expectedPerformanceEn": "The learner assigns the appropriate instrument to each object, justifies range and resolution, requires a zero check, and reports g or kg only to instrument-appropriate precision.",
            "understandingFocusDe": "Die Gerätewahl und die Grenzen der Messwertangabe werden an zwei Bereichen unabhängig sichtbar.",
            "understandingFocusEn": "Instrument selection and limits on reporting become independently visible across two ranges."
          },
          {
            "id": "clay-reshaping-comparison",
            "taskDemandDe": "Dieselbe Knetkugel wird vollständig zu einer breiten flachen Scheibe umgeformt. Vorher- und Nachhermasse sowie die Aussage „größer bedeutet schwerer“ sind zu prüfen.",
            "taskDemandEn": "The same lump of clay is completely reshaped into a wide flat disk. Check its mass before and after and the claim “larger means heavier.”",
            "expectedPerformanceDe": "Die lernende Person sagt gleiche Masse voraus, kontrolliert sie durch Wägung mit Nullpunktprüfung und trennt den veränderten Form- beziehungsweise Volumeneindruck vom Messwert.",
            "expectedPerformanceEn": "The learner predicts equal mass, checks it by weighing with a zero check, and distinguishes the changed impression of shape or volume from the measurement.",
            "understandingFocusDe": "Der Transferfall prüft Massenvergleich unabhängig von sichtbarer Gestalt.",
            "understandingFocusEn": "The transfer case tests mass comparison independently of visible shape."
          },
          {
            "id": "large-foam-small-metal",
            "taskDemandDe": "Ein Schaumstoffquader mit 800 cm³ Volumen hat eine gemessene Masse von 120 g, ein deutlich kleineres Metallstück mit 40 cm³ Volumen eine Masse von 300 g. Die Massen und die Aussage „Größeres Volumen bedeutet größere Masse“ sind zu beurteilen.",
            "taskDemandEn": "A foam block with a volume of 800 cm³ has a measured mass of 120 g, while a much smaller metal object with a volume of 40 cm³ has a mass of 300 g. Evaluate the masses and the statement “Greater volume means greater mass.”",
            "expectedPerformanceDe": "Die lernende Person vergleicht die Messwerte, erkennt das kleinere Metallstück als massereicher und verwirft Volumen allein als Grundlage des Massenvergleichs.",
            "expectedPerformanceEn": "The learner compares the measurements, identifies the smaller metal object as having greater mass, and rejects volume alone as a basis for comparing mass.",
            "understandingFocusDe": "Das Volumengegenbeispiel ergänzt die Formänderung und deckt die Volumenklausel des Lernziels ausdrücklich ab.",
            "understandingFocusEn": "The volume counterexample complements the reshaping case and explicitly covers the goal's volume clause."
          }
        ]
      }
    },
    {
      "goalId": "f827b00f-af7f-52de-84aa-2a2bbaa035bd",
      "profile": {
        "archetype": "procedure",
        "expectations": [
          {
            "id": "measure-required-dimensions",
            "essentialUnderstandingDe": "Bei einem regelmäßigen Körper werden genau die Abmessungen benötigt, die seine geometrische Form eindeutig für die Volumenbeziehung festlegen; alle Längen müssen in kompatiblen Einheiten und ohne verdeckte Skalenfehler vorliegen.",
            "essentialUnderstandingEn": "For a regular object, exactly those dimensions are needed that determine its geometric shape for the volume relation; all lengths must use compatible units without hidden scale errors.",
            "observablePerformanceDe": "Die lernende Person erkennt die regelmäßige Körperform, wählt und misst die benötigten Längen und begründet, warum diese Angaben für die Volumenbestimmung ausreichen.",
            "observablePerformanceEn": "The learner recognizes the regular solid shape, selects and measures the required lengths, and explains why these data are sufficient to determine volume."
          },
          {
            "id": "geometric-volume-unit-check",
            "essentialUnderstandingDe": "Die passende Volumenbeziehung bildet die dreidimensionale Ausdehnung des Körpers ab; daher entsteht eine Kubikeinheit, und Ergebnis, Einheit und Größenordnung müssen zu den gemessenen Abmessungen passen.",
            "essentialUnderstandingEn": "The appropriate volume relation represents the object’s three-dimensional extent; therefore a cubic unit results, and value, unit, and magnitude must fit the measured dimensions.",
            "observablePerformanceDe": "Die lernende Person setzt die Messwerte in eine passende geometrische Beziehung ein, führt die Kubikeinheit korrekt und prüft ein Ergebnis durch Abschätzung oder Vergleich mit einem umschließenden Körper.",
            "observablePerformanceEn": "The learner uses the measured values in an appropriate geometric relation, carries the cubic unit correctly, and checks a result by estimation or comparison with an enclosing solid."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "measure-required-dimensions",
            "geometric-volume-unit-check"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "regular-shape",
            "textDe": "Quader beziehungsweise Würfel oder ein anderer einfacher regelmäßiger Körper mit vorgegebener Volumenbeziehung",
            "textEn": "Cuboid or cube, or another simple regular solid with a supplied volume relation"
          },
          {
            "id": "measurement-state",
            "textDe": "Abmessungen direkt in gleicher Einheit oder mit notwendiger Längenumrechnung",
            "textEn": "Dimensions directly in the same unit or requiring a length-unit conversion"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "cuboid-measurement",
            "taskDemandDe": "Ein quaderförmiger Holzklotz wird mit 8,0 cm, 3,0 cm und 2,5 cm gemessen. Volumen, Einheit und Plausibilität sind zu bestimmen.",
            "taskDemandEn": "A cuboid wooden block is measured as 8.0 cm, 3.0 cm, and 2.5 cm. Determine volume, unit, and plausibility.",
            "expectedPerformanceDe": "Die lernende Person ordnet Länge, Breite und Höhe zu, berechnet 60 cm³ und prüft, dass das Ergebnis unter dem Volumen eines 8 cm × 3 cm × 3 cm großen Vergleichsquaders liegt.",
            "expectedPerformanceEn": "The learner assigns length, width, and height, calculates 60 cm³, and checks that the result is below the volume of a comparison cuboid measuring 8 cm × 3 cm × 3 cm.",
            "understandingFocusDe": "Messauswahl, geometrische Beziehung und unabhängige Größenprüfung werden verbunden.",
            "understandingFocusEn": "Measurement selection, geometric relation, and an independent magnitude check are connected."
          },
          {
            "id": "mixed-unit-cube-transfer",
            "taskDemandDe": "Ein würfelförmiger Körper hat eine Kantenlänge von 25 mm. Eine Rechnung verwendet 25³ cm³. Die Volumenangabe ist fachlich zu korrigieren und zu prüfen.",
            "taskDemandEn": "A cube has edge length 25 mm. A calculation uses 25³ cm³. Correct and check the volume statement scientifically.",
            "expectedPerformanceDe": "Die lernende Person berechnet 15 625 mm³ oder wandelt 25 mm=2,5 cm um und erhält 15,625 cm³; sie verwirft die gemischte Zahlenwert-Einheit-Kombination.",
            "expectedPerformanceEn": "The learner calculates 15,625 mm³ or converts 25 mm=2.5 cm and obtains 15.625 cm³; the learner rejects the mixed numerical-value and unit combination.",
            "understandingFocusDe": "Der Einheitenwechsel prüft, ob Volumeneinheit und gemessene Länge strukturell zusammenpassen.",
            "understandingFocusEn": "The unit change tests whether volume unit and measured length fit structurally."
          }
        ]
      }
    },
    {
      "goalId": "f92b5b8a-327f-50d2-8313-6a142399ebf0",
      "profile": {
        "archetype": "experiment",
        "expectations": [
          {
            "id": "displacement-principle-and-difference",
            "essentialUnderstandingDe": "Ein vollständig eingetauchter, nicht löslicher fester Körper verdrängt ein Flüssigkeitsvolumen in Höhe seines eigenen Volumens; deshalb ist die Differenz aus End- und Anfangsstand und nicht einer der beiden Einzelstände das gesuchte Volumen.",
            "essentialUnderstandingEn": "A fully immersed, non-dissolving solid displaces a liquid volume equal to its own volume; therefore the difference between final and initial levels, not either reading alone, is the required volume.",
            "observablePerformanceDe": "Die lernende Person plant oder wertet eine neue Verdrängungsmessung aus, stellt vollständiges Eintauchen sicher, bildet Endstand minus Anfangsstand und gibt die Differenz in einer passenden Volumeneinheit an.",
            "observablePerformanceEn": "The learner plans or evaluates a new displacement measurement, ensures complete immersion, subtracts initial from final level, and reports the difference in an appropriate volume unit."
          },
          {
            "id": "reading-and-bubble-error",
            "essentialUnderstandingDe": "Der Flüssigkeitsstand muss an derselben Skala und Blickhöhe nach einer festgelegten Meniskusregel abgelesen werden; anhaftende Luftblasen verdrängen zusätzlich Flüssigkeit und führen typischerweise zu einem zu großen ermittelten Körpervolumen.",
            "essentialUnderstandingEn": "Liquid levels must be read on the same scale at eye level using a specified meniscus convention; attached air bubbles displace additional liquid and typically make the determined object volume too large.",
            "observablePerformanceDe": "Die lernende Person erkennt in einer fremden Messbeschreibung Parallaxen-, Meniskus- oder Luftblasenprobleme, erklärt die Wirkung auf die Differenz und schlägt eine gezielte Verbesserung vor.",
            "observablePerformanceEn": "In an unfamiliar measurement description, the learner identifies parallax, meniscus, or air-bubble problems, explains their effect on the difference, and proposes a targeted improvement."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "displacement-principle-and-difference",
            "reading-and-bubble-error"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "data-source",
            "textDe": "Eigene Anfangs- und Endablesung oder vorgelegte Messwerttabelle beziehungsweise Skizze",
            "textEn": "Own initial and final reading or a supplied measurement table or diagram"
          },
          {
            "id": "error-condition",
            "textDe": "Saubere vollständige Eintauchung oder Parallaxe beziehungsweise anhaftende Luftblasen",
            "textEn": "Clean complete immersion or parallax or attached air bubbles"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "stone-displacement",
            "taskDemandDe": "Der Wasserstand eines Messzylinders steigt beim vollständigen Eintauchen eines Steins von 46 ml auf 73 ml. Volumen, Einheit und Messprinzip sind anzugeben.",
            "taskDemandEn": "The water level in a graduated cylinder rises from 46 ml to 73 ml when a stone is fully immersed. State the volume, unit, and measurement principle.",
            "expectedPerformanceDe": "Die lernende Person berechnet 27 ml=27 cm³ und erklärt, dass der vollständig eingetauchte Stein genau dieses zusätzliche Flüssigkeitsvolumen verdrängt.",
            "expectedPerformanceEn": "The learner calculates 27 ml=27 cm³ and explains that the fully immersed stone displaces exactly this additional liquid volume.",
            "understandingFocusDe": "Differenzbildung und physikalische Bedeutung werden gemeinsam sichtbar.",
            "understandingFocusEn": "Difference calculation and physical meaning become visible together."
          },
          {
            "id": "bubble-error-transfer",
            "taskDemandDe": "Bei einer zweiten Messung haften sichtbar Luftblasen am Körper; Anfangsstand und Ablesung sind sonst gleichartig. Zu beurteilen ist, wie dies das ermittelte Volumen beeinflusst und wie der Fehler vermieden wird.",
            "taskDemandEn": "In a second measurement, visible air bubbles adhere to the object; initial level and reading method are otherwise comparable. Assess how this affects the determined volume and how to avoid the error.",
            "expectedPerformanceDe": "Die lernende Person erklärt, dass Körper und eingeschlossene Luft gemeinsam verdrängen und das Ergebnis zu groß wird, und fordert Entfernen der Blasen vor der Endablesung.",
            "expectedPerformanceEn": "The learner explains that the object and trapped air displace liquid together, making the result too large, and requires removal of bubbles before the final reading.",
            "understandingFocusDe": "Der Fehlerfall prüft, ob die gemessene Differenz kausal und nicht nur rechnerisch verstanden ist.",
            "understandingFocusEn": "The error case tests whether the measured difference is understood causally rather than only calculated."
          }
        ]
      }
    },
    {
      "goalId": "c2d6bdf1-8077-50fb-a8b5-2f0b7e3493f0",
      "profile": {
        "archetype": "concept",
        "expectations": [
          {
            "id": "density-ratio-and-unit",
            "essentialUnderstandingDe": "Dichte ρ=m/V beschreibt Masse pro Volumeneinheit; Masse und Volumen müssen sich auf denselben Körper beziehen und in kompatiblen Einheiten eingesetzt werden.",
            "essentialUnderstandingEn": "Density ρ=m/V describes mass per unit volume; mass and volume must refer to the same object and be used in compatible units.",
            "observablePerformanceDe": "Die lernende Person berechnet aus neuen Messdaten die Dichte mit Einheit, deutet den Quotienten und weist den Kehrwert V/m oder eine fehlende Volumeneinheit zurück.",
            "observablePerformanceEn": "The learner calculates density from new measurements with units, interprets the quotient, and rejects reciprocal V/m or a missing volume unit."
          },
          {
            "id": "comparison-and-model-limit",
            "essentialUnderstandingDe": "Bei gleichem Volumen hat der dichtere Stoff mehr Masse, bei gleicher Masse weniger Volumen. Ein gemessener Dichtewert kann Stoffe eingrenzen, identifiziert aber Hohlkörper, Gemische oder Messdaten außerhalb der Unsicherheit nicht automatisch eindeutig.",
            "essentialUnderstandingEn": "At equal volume, the denser material has more mass; at equal mass, it has less volume. A measured density can narrow material candidates but does not automatically identify hollow objects, mixtures, or data beyond uncertainty uniquely.",
            "observablePerformanceDe": "Die lernende Person vergleicht Körper unter kontrollierter Masse oder kontrolliertem Volumen und begrenzt eine Stoffzuordnung, wenn Bauart oder Messunsicherheit eine eindeutige Deutung verhindert.",
            "observablePerformanceEn": "The learner compares objects at controlled mass or volume and limits a material identification when construction or measurement uncertainty prevents a unique interpretation."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "density-ratio-and-unit",
            "comparison-and-model-limit"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "comparison-control",
            "textDe": "Gleiches Volumen, gleiche Masse oder beides verschieden",
            "textEn": "Equal volume, equal mass, or both different"
          },
          {
            "id": "object-model",
            "textDe": "Homogener Vollkörper oder Hohlkörper beziehungsweise Gemisch",
            "textEn": "Homogeneous solid object or hollow object/mixture"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "opposing-mass-density-order",
            "taskDemandDe": "Block A hat 200 g bei 100 cm³, Block B 300 g bei 200 cm³. Masse und Dichte sind getrennt zu vergleichen.",
            "taskDemandEn": "Block A has 200 g at 100 cm³ and block B 300 g at 200 cm³. Compare mass and density separately.",
            "expectedPerformanceDe": "Die lernende Person erkennt B als schwerer, berechnet aber 2,0 gegenüber 1,5 g/cm³ und ordnet A als dichter ein.",
            "expectedPerformanceEn": "The learner recognizes B as heavier but calculates 2.0 versus 1.5 g/cm³ and identifies A as denser.",
            "understandingFocusDe": "Der gegenläufige Fall trennt Dichte von Masse allein.",
            "understandingFocusEn": "The opposing case separates density from mass alone."
          },
          {
            "id": "hollow-object-limit",
            "taskDemandDe": "Ein großer Metallgegenstand hat eine mittlere Dichte deutlich unter dem Tabellenwert des vermuteten Metalls. Zu entscheiden ist, ob das Material sicher falsch ist.",
            "taskDemandEn": "A large metal object has an average density well below the table value of the suspected metal. Decide whether the material is certainly wrong.",
            "expectedPerformanceDe": "Die lernende Person prüft Einheiten und Messung, nennt einen Hohlraum oder ein Verbundmaterial als alternative Erklärung und begrenzt die Identifikation ohne weitere Daten.",
            "expectedPerformanceEn": "The learner checks units and measurement, gives a cavity or composite material as an alternative explanation, and limits identification without further data.",
            "understandingFocusDe": "Der Modellgrenzfall verhindert die Gleichsetzung mittlerer Körperdichte mit eindeutiger Stoffidentität.",
            "understandingFocusEn": "The model-limit case prevents equating average object density with unique material identity."
          }
        ]
      }
    },
    {
      "goalId": "ae67bcf1-f3ee-50d6-9a12-25a159dff659",
      "profile": {
        "archetype": "representation",
        "expectations": [
          {
            "id": "slope-motion-correspondence",
            "essentialUnderstandingDe": "Im Weg-Zeit-Diagramm beschreibt die Änderung des Wegwerts pro Zeitintervall die Geschwindigkeit: ein waagrechter Verlauf bedeutet Ruhe, eine Gerade mit konstanter Steigung gleichförmige Bewegung und eine veränderliche Steigung eine qualitative Geschwindigkeitsänderung.",
            "essentialUnderstandingEn": "In a distance-time graph, change in distance per time interval represents speed: a horizontal segment means rest, a straight line with constant slope means uniform motion, and changing slope means a qualitative change in speed.",
            "observablePerformanceDe": "Die lernende Person beschreibt unbekannte Diagrammabschnitte anhand ihrer Wegzunahme und Steigung als Ruhe, gleichförmige oder schneller beziehungsweise langsamer werdende Bewegung.",
            "observablePerformanceEn": "The learner describes unfamiliar graph segments from their distance increase and slope as rest, uniform motion, or motion becoming faster or slower."
          },
          {
            "id": "shape-is-not-path",
            "essentialUnderstandingDe": "Die Graphform stellt keine räumliche Bahn oder einen Hügel dar; steilere Abschnitte bedeuten größere Wegänderung je Zeit, während die Höhe des Graphen den bis dahin dargestellten Wegwert angibt.",
            "essentialUnderstandingEn": "The graph shape is not a spatial path or hill; steeper sections mean a greater distance change per unit time, while graph height gives the represented distance value up to that time.",
            "observablePerformanceDe": "Die lernende Person ordnet einer neuen Bewegungsbeschreibung einen qualitativen Graphen zu, begründet Übergänge mit Steigungsänderungen und widerlegt eine bildhafte Bahninterpretation.",
            "observablePerformanceEn": "The learner matches a qualitative graph to a new motion description, justifies transitions using slope changes, and refutes a pictorial path interpretation."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "slope-motion-correspondence",
            "shape-is-not-path"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "motion-regime",
            "textDe": "Ruhe, konstante Geschwindigkeit oder qualitativ zunehmende beziehungsweise abnehmende Geschwindigkeit",
            "textEn": "Rest, constant speed, or qualitatively increasing or decreasing speed"
          },
          {
            "id": "reasoning-direction",
            "textDe": "Graph deuten oder aus einer Bewegungsbeschreibung einen Graphen konstruieren",
            "textEn": "Interpret a graph or construct a graph from a motion description"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "three-segment-reading",
            "taskDemandDe": "Ein Weg-Zeit-Graph verläuft zuerst waagrecht, dann geradlinig steigend und anschließend gekrümmt mit zunehmender Steigung. Die Bewegung ist abschnittsweise zu beschreiben.",
            "taskDemandEn": "A distance-time graph is first horizontal, then rises linearly, and finally curves with increasing slope. Describe the motion by segments.",
            "expectedPerformanceDe": "Die lernende Person beschreibt Ruhe, gleichförmige Bewegung und qualitatives Schnellerwerden und bezieht jede Aussage auf die jeweilige Steigung.",
            "expectedPerformanceEn": "The learner describes rest, uniform motion, and qualitative speeding up and relates each statement to the relevant slope.",
            "understandingFocusDe": "Alle drei im Lernziel genannten Bewegungszustände werden aus demselben Repräsentationsprinzip erklärt.",
            "understandingFocusEn": "All three motion states named in the goal are explained from the same representational principle."
          },
          {
            "id": "delivery-motion-construction",
            "taskDemandDe": "Ein Fahrzeug fährt zunächst gleichförmig, hält an und fährt danach gleichförmig schneller als zuvor weiter. Ein qualitativer Weg-Zeit-Graph ist zu zeichnen und zu erläutern.",
            "taskDemandEn": "A vehicle first moves uniformly, stops, and then continues uniformly at a greater speed than before. Draw and explain a qualitative distance-time graph.",
            "expectedPerformanceDe": "Die lernende Person zeichnet eine steigende Gerade, einen waagrechten Abschnitt und eine steilere steigende Gerade und erklärt die Steigungen als Wegzuwachs je Zeit.",
            "expectedPerformanceEn": "The learner draws a rising straight line, a horizontal segment, and a steeper rising straight line and explains the slopes as distance gained per unit time.",
            "understandingFocusDe": "Die aktive Konstruktion prüft Transfer ohne eine räumliche Bahnkurve zu reproduzieren.",
            "understandingFocusEn": "Active construction tests transfer without reproducing a spatial path curve."
          }
        ]
      }
    },
    {
      "goalId": "41d35667-0296-5f84-bc12-202ffc440be0",
      "profile": {
        "archetype": "representation",
        "expectations": [
          {
            "id": "force-vector-encoding",
            "essentialUnderstandingDe": "Ein Kraftpfeil codiert Betrag durch seine maßstäbliche Länge und Richtung durch seine Orientierung; Kräfte dürfen nur dann wie Skalare addiert werden, wenn ihre Richtungen dies rechtfertigen.",
            "essentialUnderstandingEn": "A force arrow encodes magnitude by its scale length and direction by its orientation; forces may be added as scalars only when their directions justify it.",
            "observablePerformanceDe": "Die lernende Person wählt einen Kraftmaßstab, zeichnet mehrere Kräfte an einem unbekannten Körper mit korrekten Längen und Richtungen und liest Beträge mit Einheit zurück.",
            "observablePerformanceEn": "The learner chooses a force scale, draws several forces on an unfamiliar object with correct lengths and directions, and reads magnitudes back with units."
          },
          {
            "id": "resultant-construction-and-meaning",
            "essentialUnderstandingDe": "Die Resultierende ist die Vektorsumme aller Kräfte und bestimmt die translatorische Bewegungsänderung des Körpers; mögliche Drehwirkungen lassen sich ohne zusätzliche Angaben zu Angriffspunkten und Wirkungslinien nicht aus ihr allein bestimmen. Bei entgegengesetzten gleich großen Kräften ist die Resultierende null, obwohl einzelne Kräfte wirken.",
            "essentialUnderstandingEn": "The resultant is the vector sum of all forces and determines the object's translational change of motion; possible rotational effects cannot be determined from it alone without additional information about points and lines of action. For equal opposing forces, the resultant is zero even though individual forces still act.",
            "observablePerformanceDe": "Die lernende Person konstruiert die Resultierende grafisch, deutet Betrag und Richtung für die translatorische Bewegungsänderung und widerlegt sowohl die Gleichsetzung von Resultierende null mit Kraftfreiheit als auch eine unbegründete Aussage zur Drehung.",
            "observablePerformanceEn": "The learner constructs the resultant graphically, interprets its magnitude and direction for translational change of motion, and refutes both equating zero resultant with absence of forces and making an unsupported claim about rotation."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "force-vector-encoding",
            "resultant-construction-and-meaning"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "force-angle",
            "textDe": "Gleichgerichtete, entgegengesetzte oder winklige Kräfte",
            "textEn": "Codirectional, opposite, or angled forces"
          },
          {
            "id": "resultant-state",
            "textDe": "Resultierende ungleich null oder null mit ausdrücklich benannter Grenze für Drehwirkungen",
            "textEn": "Nonzero or zero resultant with an explicitly stated limit concerning rotational effects"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "scaled-two-rope-resultant",
            "taskDemandDe": "Zwei Seile ziehen einen Ring mit 30 N nach Osten und 40 N nach Norden. Die Kräfte und Resultierende sind im Maßstab 1 cm : 10 N zu konstruieren.",
            "taskDemandEn": "Two ropes pull a ring with 30 N east and 40 N north. Construct the forces and resultant at a scale of 1 cm : 10 N.",
            "expectedPerformanceDe": "Die lernende Person zeichnet 3-cm- und 4-cm-Pfeil, schließt das Vektordreieck zu 5 cm nach Nordost und deutet 50 N mit Richtung statt 70 N.",
            "expectedPerformanceEn": "The learner draws 3 cm and 4 cm arrows, closes the vector triangle to 5 cm northeast, and interprets 50 N with direction rather than 70 N.",
            "understandingFocusDe": "Maßstab und nichtkollineare Vektoraddition verhindern bloße Betragsaddition.",
            "understandingFocusEn": "Scale and non-collinear vector addition prevent mere addition of magnitudes."
          },
          {
            "id": "balanced-forces-countercase",
            "taskDemandDe": "An einem Ring greifen am selben Punkt zwei kollineare Kräfte von jeweils 25 N nach links beziehungsweise rechts an. Resultierende und Aussage „Es wirkt keine Kraft“ sind zu beurteilen.",
            "taskDemandEn": "Two collinear forces of 25 N act at the same point on a ring, one to the left and one to the right. Evaluate the resultant and the statement “No force acts.”",
            "expectedPerformanceDe": "Die lernende Person erhält die Resultierende 0 N, zeigt beide weiterhin vorhandenen Kraftpfeile und erklärt, dass daraus keine translatorische Bewegungsänderung folgt, der Ring aber nicht kraftfrei ist.",
            "expectedPerformanceEn": "The learner obtains a resultant of 0 N, shows both forces still acting, and explains that no translational change of motion follows while the ring is not force-free.",
            "understandingFocusDe": "Der Grenzfall trennt Nullresultierende von Kraftfreiheit, ohne aus der Vektorsumme allein eine Aussage über Drehwirkungen abzuleiten.",
            "understandingFocusEn": "The limiting case separates zero resultant from absence of forces without inferring rotational effects from the vector sum alone."
          }
        ]
      }
    },
    {
      "goalId": "327302e3-5b36-46f8-9c16-73f24583b0eb",
      "profile": {
        "archetype": "concept",
        "expectations": [
          {
            "id": "force-transformer",
            "essentialUnderstandingDe": "Einfache Maschinen ändern benötigte Kraft, Richtung oder Weg; ein Kraftvorteil geht im idealen Fall mit einem längeren Zug- oder Bewegungsweg einher und erzeugt keine Arbeit aus dem Nichts.",
            "essentialUnderstandingEn": "Simple machines change required force, direction, or distance; ideally, a force advantage comes with a longer pulling or movement distance and does not create work from nothing.",
            "observablePerformanceDe": "Die lernende Person verfolgt bei einer neuen Hebel-, Rollen- oder Rad-Anordnung Kraft und Weg und erklärt den Tausch statt nur „leichter“ zu sagen.",
            "observablePerformanceEn": "For a new lever, pulley, or wheel-and-axle arrangement, the learner traces force and distance and explains the tradeoff rather than merely saying “easier.”"
          },
          {
            "id": "ideal-work-tradeoff",
            "essentialUnderstandingDe": "Bei einer idealen einfachen Maschine bleibt für dieselbe Nutzwirkung die mechanische Arbeit erhalten: Eine kleinere notwendige Kraft ist mit einem entsprechend längeren Kraftweg verbunden; die Maschine erzeugt oder spart keine mechanische Arbeit.",
            "essentialUnderstandingEn": "For an ideal simple machine, mechanical work remains the same for the same useful effect: a smaller required force is associated with a correspondingly longer force distance; the machine neither creates nor saves mechanical work.",
            "observablePerformanceDe": "Die lernende Person vergleicht bei einer neuen idealisierten Hebel-, Rollen- oder Rad-Anordnung Kraft und Weg, sagt den fehlenden Änderungsfaktor voraus und widerlegt mit dem Kraft-Weg-Produkt die Behauptung einer Arbeitsersparnis.",
            "observablePerformanceEn": "For a new idealized lever, pulley, or wheel-and-axle arrangement, the learner compares force and distance, predicts the missing change factor, and uses the force-distance product to refute a claimed saving of work."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "force-transformer",
            "ideal-work-tradeoff"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "machine",
            "textDe": "Hebel, feste oder bewegliche Rolle oder Rad mit Achse",
            "textEn": "Lever, fixed or movable pulley, or wheel and axle"
          },
          {
            "id": "ideal-tradeoff",
            "textDe": "Kraftvorteil durch längeren Weg oder Richtungsänderung ohne Kraftvorteil",
            "textEn": "Force advantage through a longer distance or direction change without force advantage"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "movable-pulley",
            "taskDemandDe": "Eine bewegliche Rolle halbiert idealisiert die Zugkraft; der notwendige Seilweg und die Arbeitsbilanz sind qualitativ zu deuten.",
            "taskDemandEn": "An ideal movable pulley halves the pulling force; the required rope distance and work balance must be interpreted qualitatively.",
            "expectedPerformanceDe": "Die lernende Person sagt den doppelten Seilweg voraus und erklärt, dass Kraft mal Weg ideal gleich bleibt.",
            "expectedPerformanceEn": "The learner predicts twice the rope distance and explains that force times distance ideally remains equal.",
            "understandingFocusDe": "Kraftgewinn wird nicht mit Arbeitsgewinn verwechselt.",
            "understandingFocusEn": "Force advantage is not confused with work gain."
          },
          {
            "id": "wheel-and-axle-transfer",
            "taskDemandDe": "Bei einem idealisierten Rad mit Achse beträgt der Kurbelradius 40 cm und der Radius der Seiltrommel 10 cm. Kraft- und Wegverhältnis beim Anheben einer Last sowie die Aussage „Die Maschine spart Arbeit“ sind zu beurteilen.",
            "taskDemandEn": "For an idealized wheel and axle, the crank radius is 40 cm and the rope-drum radius is 10 cm. Evaluate the force and distance ratios when lifting a load and the statement “The machine saves work.”",
            "expectedPerformanceDe": "Die lernende Person sagt ein Viertel der Lastkraft bei vierfachem Kraftweg voraus, vergleicht beide Kraft-Weg-Produkte und verwirft eine ideale Arbeitsersparnis.",
            "expectedPerformanceEn": "The learner predicts one quarter of the load force over four times the distance, compares the two force-distance products, and rejects any ideal saving of work.",
            "understandingFocusDe": "Der Transfer prüft den idealen Kraft-Weg-Tausch an einem anderen Maschinentyp, ohne Wirkungsgradkompetenz zu importieren.",
            "understandingFocusEn": "The transfer tests the ideal force-distance tradeoff with another machine type without importing efficiency competence."
          }
        ]
      }
    },
    {
      "goalId": "f6b1d812-ce8b-5852-b417-e6c29b533c7a",
      "profile": {
        "archetype": "procedure",
        "expectations": [
          {
            "id": "justify-and-record-uncertainty",
            "essentialUnderstandingDe": "Ein Messergebnis ist kein exakter wahrer Wert, sondern ein Schätzwert mit einer begründeten Unsicherheit; Wert und Unsicherheit müssen dieselbe Einheit und zueinander passende Dezimalstellen besitzen, wobei die Unsicherheit die sinnvolle Rundung bestimmt.",
            "essentialUnderstandingEn": "A measurement result is not an exact true value but an estimate with a justified uncertainty; value and uncertainty must have the same unit and compatible decimal places, with the uncertainty determining meaningful rounding.",
            "observablePerformanceDe": "Die lernende Person leitet aus Geräteauflösung oder der Streuung einer Messreihe eine angemessene Unsicherheitsangabe ab, notiert das Ergebnis mit Einheit und konsistenter Rundung und erklärt, welche Werte durch diese Angabe nicht voneinander unterscheidbar sind.",
            "observablePerformanceEn": "The learner derives an appropriate uncertainty statement from instrument resolution or the spread of repeated measurements, records the result with a unit and consistent rounding, and explains which values cannot be distinguished by that statement."
          },
          {
            "id": "uncertainty-bounds-conclusion",
            "essentialUnderstandingDe": "Die Unsicherheitsangabe beschreibt die begrenzte Auflösung des Ergebnisses unter den benannten Messbedingungen; sie ist weder eine Garantie, dass der wahre Wert im Intervall liegt, noch eine automatische Korrektur unbekannter systematischer Fehler.",
            "essentialUnderstandingEn": "The uncertainty statement describes the limited resolution of the result under the stated measurement conditions; it is neither a guarantee that the true value lies in the interval nor an automatic correction of unknown systematic errors.",
            "observablePerformanceDe": "Die lernende Person vergleicht zwei Messangaben einschließlich Unsicherheiten, entscheidet begründet, ob ein behaupteter Unterschied durch die Angaben aufgelöst wird, und nennt eine nicht erfasste systematische Einflussgröße als Grenze der Schlussfolgerung.",
            "observablePerformanceEn": "The learner compares two measurement statements including uncertainties, justifiably decides whether a claimed difference is resolved by the statements, and identifies an unaccounted systematic influence as a limit of the conclusion."
          },
          {
            "id": "fresh-uncertainty-transfer",
            "essentialUnderstandingDe": "Unsicherheit und Rundung müssen aus den Messbedingungen des neuen Falls neu bestimmt werden; eine frühere Angabe bleibt bei anderer Auflösung oder Streuung nicht automatisch gültig.",
            "essentialUnderstandingEn": "Uncertainty and rounding must be redetermined from the measurement conditions of the fresh case; an earlier statement does not automatically remain valid with different resolution or spread.",
            "observablePerformanceDe": "Für dieselbe Messgröße mit einem Instrument anderer Auflösung oder mit stärker streuenden Wiederholungen passt die lernende Person Unsicherheit und Rundung neu an und begründet, warum die frühere Ergebnisangabe nicht unverändert übernommen werden kann.",
            "observablePerformanceEn": "For the same quantity measured with an instrument of different resolution or with more strongly scattered repetitions, the learner adjusts the uncertainty and rounding and explains why the previous result statement cannot be retained unchanged."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "justify-and-record-uncertainty",
            "uncertainty-bounds-conclusion",
            "fresh-uncertainty-transfer"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "uncertainty-source",
            "textDe": "Geräteauflösung einer Einzelmessung oder Streuung unabhängiger Wiederholungen",
            "textEn": "Instrument resolution of a single measurement or spread of independent repeats"
          },
          {
            "id": "measurement-scale",
            "textDe": "Länge, Zeit oder Temperatur mit jeweils passender Einheit und Größenordnung",
            "textEn": "Length, time, or temperature with the appropriate unit and scale"
          },
          {
            "id": "comparison-demand",
            "textDe": "Ergebnis notieren, zwei Angaben vergleichen oder eine behauptete Unterscheidbarkeit prüfen",
            "textEn": "Record a result, compare two statements, or test a claimed distinguishability"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "ruler-resolution-single-length",
            "taskDemandDe": "Die Länge eines Bauteils wird mit einem Millimeterlineal zu 84 mm abgelesen. Leite aus der bereitgestellten Ableseregel eine geeignete Unsicherheit ab, notiere das Ergebnis fachgerecht und beurteile, ob damit 84,1 mm und 84,4 mm unterschieden werden können.",
            "taskDemandEn": "The length of a component is read as 84 mm with a millimetre ruler. Use the supplied reading rule to derive a suitable uncertainty, record the result correctly, and assess whether 84.1 mm and 84.4 mm can be distinguished with it.",
            "expectedPerformanceDe": "Die lernende Person bindet die Unsicherheit an die Skalenauflösung, notiert Wert und Unsicherheit mit derselben Einheit und passenden Stellen und verneint eine feinere Unterscheidung, die unterhalb der Messauflösung liegt. Sie behauptet keine Beseitigung möglicher Null- oder Kalibrierfehler.",
            "expectedPerformanceEn": "The learner ties the uncertainty to the scale resolution, records value and uncertainty with the same unit and compatible digits, and rejects a finer distinction below the measurement resolution. The learner does not claim that possible zero or calibration errors have been removed.",
            "understandingFocusDe": "Der Fall prüft die Verbindung von Geräteauflösung, sinnvoller Rundung und begrenzter Unterscheidbarkeit.",
            "understandingFocusEn": "The case tests the connection between instrument resolution, meaningful rounding, and limited distinguishability."
          },
          {
            "id": "period-series-spread-and-comparison",
            "taskDemandDe": "Für eine Pendelperiode liegen zehn frische Zeitwerte und eine zweite Messung mit einem höher auflösenden Zeitgeber, aber stärkerer Streuung vor. Bestimme für jede Reihe einen repräsentativen Wert, leite nach der vorgegebenen Regel eine Unsicherheit aus der Streuung ab, notiere beide Ergebnisse und bewerte eine behauptete Periodendifferenz.",
            "taskDemandEn": "Ten fresh timing values for a pendulum period and a second measurement from a higher-resolution timer with greater scatter are supplied. Determine a representative value for each series, derive an uncertainty from the spread using the supplied rule, record both results, and assess a claimed difference in period.",
            "expectedPerformanceDe": "Die lernende Person wertet beide Reihen mit Einheiten aus, lässt die Unsicherheit die Rundung bestimmen und beurteilt die Differenz nur im Verhältnis zu beiden Unsicherheitsangaben. Sie erklärt, warum höhere Anzeigeauflösung bei größerer Streuung nicht automatisch eine engere Ergebnisangabe rechtfertigt.",
            "expectedPerformanceEn": "The learner evaluates both series with units, lets the uncertainty determine rounding, and assesses the difference only in relation to both uncertainty statements. The learner explains why higher display resolution with greater scatter does not automatically justify a narrower result statement.",
            "understandingFocusDe": "Der Transferfall trennt Anzeigeauflösung von empirischer Streuung und bindet die Schlussfolgerung an die resultierende Unsicherheit.",
            "understandingFocusEn": "The transfer case separates display resolution from empirical spread and binds the conclusion to the resulting uncertainty."
          }
        ]
      }
    },
    {
      "goalId": "b615830a-e8b0-5754-81e0-99da98343a8d",
      "profile": {
        "archetype": "procedure",
        "expectations": [
          {
            "id": "precision-supported-by-input-data",
            "essentialUnderstandingDe": "Ein Ergebnis darf keine höhere Genauigkeit vortäuschen, als die angegebenen Messwerte oder Unsicherheiten stützen. Bei Produkten und Quotienten begrenzt im einfachen Schulmodell typischerweise die kleinste Zahl signifikanter Stellen; ausdrücklich angegebene Unsicherheiten haben Vorrang vor einer bloßen Zählregel.",
            "essentialUnderstandingEn": "A result must not imply greater precision than the stated measurements or uncertainties support. For products and quotients in the simple classroom model, the smallest number of significant figures typically limits the result; explicitly stated uncertainties take precedence over a mere counting rule.",
            "observablePerformanceDe": "Die lernende Person identifiziert die begrenzende Eingangsdatenqualität, wählt eine sinnvolle Ergebnisdarstellung einschließlich Einheit und begründet, warum zusätzliche Ziffern Scheingenauigkeit wären.",
            "observablePerformanceEn": "The learner identifies the limiting quality of the input data, chooses a meaningful result representation including the unit, and explains why additional digits would constitute false precision."
          },
          {
            "id": "retain-guard-digits-until-final-result",
            "essentialUnderstandingDe": "Zwischenergebnisse werden mit ausreichenden zusätzlichen Stellen weitergeführt und erst das Endergebnis passend gerundet. Vorzeitiges Runden kann Fehler über mehrere Rechenschritte vergrößern; dokumentierte Einheiten und eine Größenordnungsprüfung bleiben zusätzliche Kontrollen.",
            "essentialUnderstandingEn": "Intermediate results are carried with sufficient guard digits and only the final result is rounded appropriately. Premature rounding can amplify errors across multiple steps; documented units and an order-of-magnitude check remain additional safeguards.",
            "observablePerformanceDe": "Die lernende Person führt eine mehrstufige Rechnung mit ungerundeten oder ausreichend genauen Zwischenwerten durch, rundet erst am Ende und vergleicht mit einer vorzeitig gerundeten Lösung, um eine mögliche Abweichung zu erklären.",
            "observablePerformanceEn": "The learner performs a multi-step calculation using unrounded or sufficiently precise intermediate values, rounds only at the end, and compares it with a prematurely rounded solution to explain any discrepancy."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "precision-supported-by-input-data",
            "retain-guard-digits-until-final-result"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "calculation-depth",
            "textDe": "Direkter Quotient und mehrstufige Ableitung einer Folgegröße werden variiert.",
            "textEn": "A direct quotient and a multi-step derivation of a subsequent quantity are varied."
          },
          {
            "id": "precision-information",
            "textDe": "Unterschiedliche Zahlen signifikanter Stellen oder ausdrücklich angegebene Messunsicherheiten bestimmen die Ergebnisgenauigkeit.",
            "textEn": "Different numbers of significant figures or explicitly stated measurement uncertainties determine result precision."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "resistance-from-two-measurements",
            "taskDemandDe": "An einem Bauteil werden U = 12,0 V und I = 0,83 A gemessen; weitere Unsicherheitsangaben fehlen. Berechne R = U/I, gib das Ergebnis sinnvoll an und beurteile die Darstellungen 14,4578 Ω, 14,5 Ω und 1,4·10¹ Ω.",
            "taskDemandEn": "Measurements on a component give U = 12.0 V and I = 0.83 A; no further uncertainty information is available. Calculate R = U/I, report it meaningfully, and assess the representations 14.4578 Ω, 14.5 Ω, and 1.4·10¹ Ω.",
            "expectedPerformanceDe": "Die lernende Person berechnet zunächst etwa 14,4578 Ω, erkennt I mit zwei signifikanten Stellen als begrenzend und gibt R = 1,4·10¹ Ω an. Sie verwirft die längeren Angaben als nicht gestützte Scheingenauigkeit und weist darauf hin, dass explizite Messunsicherheiten die bloße Zählregel ersetzen und die Rundungsentscheidung genauer begründen würden.",
            "expectedPerformanceEn": "The learner first calculates about 14.4578 Ω, identifies I with two significant figures as limiting, and reports R = 1.4·10¹ Ω. The learner rejects the longer forms as unsupported false precision and notes that explicit measurement uncertainties would supersede this simple rounding decision.",
            "understandingFocusDe": "Geprüft wird die Bedeutung der Ergebnisziffern als Präzisionsaussage, nicht bloß eine Rundungsregel.",
            "understandingFocusEn": "This tests the meaning of reported digits as a precision claim rather than merely a rounding rule."
          },
          {
            "id": "kinetic-energy-through-unrounded-speed",
            "taskDemandDe": "Ein Körper der Masse 0,842 kg legt 24,6 m in 3,7 s mit näherungsweise konstanter Geschwindigkeit zurück. Bestimme zunächst v = s/t und danach E_kin = ½mv². Führe den Geschwindigkeitswert mit ausreichender Genauigkeit weiter, runde erst E_kin sinnvoll und erläutere die begrenzende Angabe. Vergleiche außerdem mit einer Rechnung, in der v vorzeitig auf 6,6 m/s gerundet wird.",
            "taskDemandEn": "A body of mass 0.842 kg travels 24.6 m in 3.7 s at approximately constant speed. First determine v = s/t and then E_kin = ½mv². Carry the speed with sufficient precision, round only E_kin appropriately, and explain which datum limits the result. Also compare with a calculation in which v is prematurely rounded to 6.6 m/s.",
            "expectedPerformanceDe": "Die lernende Person verwendet v ≈ 6,6486 m/s als Zwischenwert und erhält E_kin ≈ 18,61 J, das wegen t = 3,7 s sinnvoll als 19 J angegeben wird. Mit vorzeitig auf 6,6 m/s gerundetem v ergeben sich etwa 18,3 J und nach der Endrundung 18 J, also eine vermeidbare Abweichung. Sie zeigt, dass die vielen Rechnerziffern keine zusätzliche Messinformation darstellen, und dokumentiert Einheiten sowie plausible Größenordnung.",
            "expectedPerformanceEn": "The learner carries v ≈ 6.6486 m/s as an intermediate value and obtains E_kin ≈ 18.61 J, reasonably reported as 19 J because t = 3.7 s. Prematurely rounding v to 6.6 m/s gives about 18.3 J and, after final rounding, 18 J, an avoidable discrepancy. The learner shows that the calculator digits do not add measurement information and documents units and a plausible order of magnitude.",
            "understandingFocusDe": "Die mehrstufige Rechnung prüft das Weiterführen von Schutzstellen und das einmalige begründete Endrunden.",
            "understandingFocusEn": "The multi-step calculation tests carrying guard digits and performing one justified final rounding."
          }
        ]
      }
    },
    {
      "goalId": "f23fdfa9-38b6-5157-8301-ed302476c456",
      "profile": {
        "archetype": "data",
        "expectations": [
          {
            "id": "mean-spread-and-repeatability",
            "essentialUnderstandingDe": "Der Mittelwert bündelt wiederholte Messwerte zu einem Schätzwert, während ihre Streuung die zufällige Variabilität und damit die Wiederholbarkeit beschreibt; eine geringe Streuung allein schließt eine systematische Abweichung nicht aus.",
            "essentialUnderstandingEn": "The mean combines repeated measurements into an estimate, whereas their spread describes random variability and thus repeatability; a small spread alone does not rule out a systematic deviation.",
            "observablePerformanceDe": "Die lernende Person berechnet für eine Messreihe den Mittelwert, beschreibt die Streuung anhand der Daten, vergleicht die Wiederholbarkeit zweier Reihen und begründet eine qualitative Unsicherheitsbewertung einschließlich des Umgangs mit auffälligen Werten.",
            "observablePerformanceEn": "The learner calculates the mean of a data series, describes its spread from the data, compares the repeatability of two series, and justifies a qualitative uncertainty assessment including how conspicuous values are handled."
          },
          {
            "id": "outlier-and-accuracy-claims-are-bounded",
            "essentialUnderstandingDe": "Ein auffälliger Wert darf nicht allein wegen seines Abstands entfernt werden; seine Behandlung braucht eine fachliche oder vorab festgelegte Regel. Mittelwert und Streuung erlauben Aussagen über den Datensatz und seine Wiederholbarkeit, aber erst unabhängige Referenzinformation stützt eine Aussage über mögliche Richtigkeit.",
            "essentialUnderstandingEn": "A conspicuous value must not be removed merely because it is distant; its treatment requires a scientific or pre-specified rule. Mean and spread support statements about the data set and its repeatability, but only independent reference information supports a claim about possible accuracy.",
            "observablePerformanceDe": "Die lernende Person zeigt die Auswirkung eines auffälligen Werts auf Mittelwert und Streuung, entscheidet anhand gegebener Messprotokoll-Informationen über Einbezug oder Ausschluss und trennt in der Schlussfolgerung Wiederholbarkeit ausdrücklich von Richtigkeit.",
            "observablePerformanceEn": "The learner shows the effect of a conspicuous value on mean and spread, decides whether to retain or exclude it from supplied measurement-record information, and explicitly separates repeatability from accuracy in the conclusion."
          },
          {
            "id": "fresh-series-transfer",
            "essentialUnderstandingDe": "Geänderte Streuung, ein Ausreißer und ein gemeinsamer Offset verändern unterschiedliche Qualitätsaussagen; Mittelwert, Wiederholbarkeit und mögliche Richtigkeit müssen deshalb bei jedem neuen Datensatz getrennt geprüft werden.",
            "essentialUnderstandingEn": "Changed spread, an outlier, and a common offset affect different quality claims; mean, repeatability, and possible accuracy must therefore be assessed separately for each fresh data set.",
            "observablePerformanceDe": "Bei einer neuen Messreihe mit gleichem Mittelwert, aber anderer Streuung, einem Ausreißer oder einem bekannten gemeinsamen Offset trennt die lernende Person erneut Aussagen über Wiederholbarkeit und mögliche Richtigkeit.",
            "observablePerformanceEn": "For a new data series with the same mean but different spread, an outlier, or a known common offset, the learner again separates claims about repeatability from claims about possible accuracy."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "mean-spread-and-repeatability",
            "outlier-and-accuracy-claims-are-bounded",
            "fresh-series-transfer"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "distribution-pattern",
            "textDe": "Ähnliche Mittelwerte bei anderer Streuung, einzelner auffälliger Wert oder gemeinsamer Offset",
            "textEn": "Similar means with different spread, one conspicuous value, or a common offset"
          },
          {
            "id": "reference-status",
            "textDe": "Ohne Referenz, mit zertifiziertem Vergleichswert oder mit dokumentiertem Geräteproblem",
            "textEn": "No reference, a certified comparison value, or a documented instrument problem"
          },
          {
            "id": "data-context",
            "textDe": "Zeit-, Längen- oder Temperaturmessreihe mit passender Einheit und Auflösung",
            "textEn": "Series of time, length, or temperature measurements with the appropriate unit and resolution"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "two-timing-series-same-mean-different-spread",
            "taskDemandDe": "Zwei Gruppen messen dieselbe Schwingungsdauer je achtmal. Die bereitgestellten Reihen besitzen nahezu denselben Mittelwert, aber deutlich verschiedene Streuungen. Berechne die Mittelwerte, beschreibe die Streuung mit einer geeigneten vorgegebenen Kennzahl, vergleiche die Wiederholbarkeit und begrenze die Aussage über Richtigkeit.",
            "taskDemandEn": "Two groups each measure the same oscillation period eight times. The supplied series have nearly the same mean but clearly different spreads. Calculate the means, describe the spread with an appropriate supplied measure, compare repeatability, and limit the claim about accuracy.",
            "expectedPerformanceDe": "Die lernende Person verarbeitet alle Werte mit Einheit, erkennt die Reihe mit geringerer Streuung als besser wiederholbar und erklärt, dass der ähnliche Mittelwert ohne unabhängige Referenz weder die Richtigkeit beider Reihen noch das Fehlen eines gemeinsamen systematischen Fehlers beweist.",
            "expectedPerformanceEn": "The learner processes all values with a unit, identifies the lower-spread series as more repeatable, and explains that the similar mean, without an independent reference, proves neither the accuracy of both series nor the absence of a shared systematic error.",
            "understandingFocusDe": "Der Fall prüft die unterschiedliche Aussage von Mittelwert, Streuung, Wiederholbarkeit und Richtigkeit.",
            "understandingFocusEn": "The case tests the distinct meanings of mean, spread, repeatability, and accuracy."
          },
          {
            "id": "temperature-series-conspicuous-value",
            "taskDemandDe": "Eine Temperaturmessreihe enthält einen deutlich auffälligen Wert. Das Messprotokoll vermerkt für genau diesen Zeitpunkt einen kurzzeitig gelösten Sensorkontakt; zusätzlich ist ein Referenzthermometer angegeben. Werte die Reihe mit und ohne den markierten Wert aus, entscheide über seine Behandlung und formuliere eine Unsicherheits- und Genauigkeitsaussage.",
            "taskDemandEn": "A temperature series contains one clearly conspicuous value. The measurement record notes a briefly disconnected sensor at that exact time; a reference thermometer is also provided. Evaluate the series with and without the marked value, decide how to treat it, and state an uncertainty and accuracy conclusion.",
            "expectedPerformanceDe": "Die lernende Person zeigt den Einfluss auf Mittelwert und Streuung, begründet den Ausschluss mit der unabhängigen Protokollinformation statt nur mit dem Zahlenabstand, vergleicht den bereinigten Mittelwert mit der Referenz und kennzeichnet verbleibende Messgrenzen.",
            "expectedPerformanceEn": "The learner shows the effect on mean and spread, justifies exclusion using the independent record rather than merely the numerical distance, compares the cleaned mean with the reference, and identifies remaining measurement limits.",
            "understandingFocusDe": "Der Fall prüft einen evidenzgebundenen Umgang mit Ausreißern und die getrennte Beurteilung von Streuung und systematischer Verschiebung.",
            "understandingFocusEn": "The case tests evidence-based handling of an outlier and separate assessment of spread and systematic shift."
          }
        ]
      }
    },
    {
      "goalId": "264dc31c-ec92-5e39-a8b8-16f1d74366d4",
      "profile": {
        "archetype": "data",
        "expectations": [
          {
            "id": "linearization-tests-model-and-parameters",
            "essentialUnderstandingDe": "Eine Linearisierung prüft eine angenommene funktionale Beziehung durch passend transformierte Achsen; Steigung und Achsenabschnitt der Ausgleichsgeraden besitzen Einheiten und müssen aus den transformierten Größen auf die physikalischen Modellparameter zurückübersetzt werden.",
            "essentialUnderstandingEn": "Linearization tests an assumed functional relationship using suitably transformed axes; the slope and intercept of the fitted line have units and must be translated from the transformed quantities back to the physical model parameters.",
            "observablePerformanceDe": "Die lernende Person wählt aus einer Modellgleichung eine begründete Transformation, beschriftet die neuen Achsen mit Größen und Einheiten, passt eine Gerade an, deutet Steigung und Achsenabschnitt physikalisch und beurteilt anhand der Abweichungen, wie gut das Modell zu den Daten passt.",
            "observablePerformanceEn": "From a model equation, the learner selects a justified transformation, labels the new axes with quantities and units, fits a straight line, interprets slope and intercept physically, and uses the deviations to judge how well the model matches the data."
          },
          {
            "id": "fit-quality-and-domain-remain-visible",
            "essentialUnderstandingDe": "Eine gerade erscheinende Darstellung ist nur innerhalb der Messunsicherheit und des untersuchten Wertebereichs Evidenz für das angenommene Modell. Strukturierte Residuen, ein physikalisch unplausibler Achsenabschnitt oder ein Parameter mit falscher Einheit weisen auf Messfehler, Zusatzterme oder eine ungeeignete Transformation hin.",
            "essentialUnderstandingEn": "A plot that appears straight is evidence for the assumed model only within measurement uncertainty and the investigated range. Structured residuals, a physically implausible intercept, or a parameter with the wrong unit indicate measurement error, additional terms, or an unsuitable transformation.",
            "observablePerformanceDe": "Die lernende Person prüft für frische Daten Streuung und Residuen gegen die Messgrenzen, kontrolliert Parameterdimension und Grenzfall und formuliert eine auf den untersuchten Bereich begrenzte Schlussfolgerung statt allein die Geradheit zu behaupten.",
            "observablePerformanceEn": "For fresh data, the learner checks scatter and residuals against the measurement limits, verifies parameter dimensions and a limiting case, and states a conclusion bounded to the investigated range rather than merely claiming straightness."
          },
          {
            "id": "fresh-linearization-transfer",
            "essentialUnderstandingDe": "Die passende Linearisierung und die Bedeutung ihrer Geradenparameter folgen aus der jeweiligen Modellgleichung und dürfen nicht unverändert von einer anders strukturierten Beziehung übernommen werden.",
            "essentialUnderstandingEn": "The appropriate linearization and the meaning of its line parameters follow from the specific model equation and must not be carried over unchanged from a differently structured relation.",
            "observablePerformanceDe": "Für Daten zu einer anders strukturierten nichtlinearen Beziehung, etwa $T^2\\sim l$ statt $s\\sim t^2$, entwickelt die lernende Person die passende neue Achsentransformation und leitet die Bedeutung der Geradenparameter erneut aus dem jeweiligen Modell her.",
            "observablePerformanceEn": "For data following a differently structured nonlinear relationship, such as $T^2\\sim l$ instead of $s\\sim t^2$, the learner develops the appropriate new axis transformation and derives the meaning of the line parameters again from the relevant model."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "linearization-tests-model-and-parameters",
            "fit-quality-and-domain-remain-visible",
            "fresh-linearization-transfer"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "functional-relation",
            "textDe": "Quadratische, inverse oder exponentielle Modellbeziehung mit jeweils abgeleiteter Transformation",
            "textEn": "Quadratic, inverse, or exponential model relation with a separately derived transformation"
          },
          {
            "id": "fit-deviation",
            "textDe": "Zufällige Streuung um die Gerade, systematisch gekrümmte Residuen oder nicht verschwindender Achsenabschnitt",
            "textEn": "Random scatter around the line, systematically curved residuals, or a nonzero intercept"
          },
          {
            "id": "parameter-meaning",
            "textDe": "Steigung oder Achsenabschnitt mit unterschiedlicher physikalischer Einheit und Modellbedeutung",
            "textEn": "Slope or intercept with a different physical unit and model meaning"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "accelerated-motion-s-versus-t-squared",
            "taskDemandDe": "Für eine aus Ruhe gleichmäßig beschleunigte Bewegung werden frische s-t-Daten mit Messunsicherheiten und das Modell s = a·t²/2 bereitgestellt. Entwickle die linearisierte Darstellung, passe eine Gerade an, bestimme a samt Einheit und beurteile aus Achsenabschnitt und Residuen die Modellgüte.",
            "taskDemandEn": "Fresh s-t data with measurement uncertainties and the model s = a·t²/2 are supplied for uniformly accelerated motion from rest. Develop the linearized representation, fit a straight line, determine a with its unit, and assess model quality from the intercept and residuals.",
            "expectedPerformanceDe": "Die lernende Person trägt s gegen t² mit Einheiten auf, deutet die Steigung als a/2, berechnet a dimensionsrichtig und prüft, ob Streuung und Achsenabschnitt mit den Messgrenzen und der Annahme Start aus Ruhe vereinbar sind.",
            "expectedPerformanceEn": "The learner plots s against t² with units, interprets the slope as a/2, calculates a with the correct dimensions, and checks whether scatter and intercept are compatible with the measurement limits and the assumption of starting from rest.",
            "understandingFocusDe": "Der Fall verbindet Transformation, Fitparameter, Einheiten, Modellannahme und datenbasierte Schlussfolgerung.",
            "understandingFocusEn": "The case connects transformation, fit parameter, units, model assumption, and a data-based conclusion."
          },
          {
            "id": "pendulum-t-squared-versus-length",
            "taskDemandDe": "Für ein Fadenpendel sind neue T-l-Daten und das Kleinwinkelnäherungsmodell T = 2π√(l/g) gegeben. Leite selbst eine lineare Achsenwahl ab, bestimme g aus der Geraden, prüfe die Einheit und untersuche, ob die Punkte bei den größten Auslenkungen systematisch abweichen.",
            "taskDemandEn": "New T-l data and the small-angle model T = 2π√(l/g) are given for a simple pendulum. Derive a linear axis choice independently, determine g from the line, check the unit, and investigate whether points at the largest amplitudes deviate systematically.",
            "expectedPerformanceDe": "Die lernende Person stellt T² gegen l dar, leitet g = 4π²/Steigung her, deutet einen möglichen Achsenabschnitt und erkennt strukturierte Abweichungen der Großauslenkungsdaten als Grenze der Kleinwinkelnäherung statt als bloße Streuung.",
            "expectedPerformanceEn": "The learner plots T² against l, derives g = 4π²/slope, interprets a possible intercept, and recognizes structured deviations in the large-amplitude data as a limit of the small-angle approximation rather than mere scatter.",
            "understandingFocusDe": "Die anders strukturierte Beziehung erzwingt unabhängigen Transfer der Linearisierung und eine explizite Modellgrenze.",
            "understandingFocusEn": "The differently structured relation requires independent transfer of linearization and an explicit model boundary."
          }
        ]
      }
    },
    {
      "goalId": "75b9ca4c-178e-5df2-adc4-f7f78e9d28e5",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "method-suitability-is-context-dependent",
            "essentialUnderstandingDe": "Digital bedeutet nicht automatisch genauer: Die Eignung eines analogen oder digitalen Verfahrens hängt unter anderem von Messbereich, Auflösung, zeitlicher Abtastung und typischen Ablese-, Quantisierungs- oder Kalibrierabweichungen in der konkreten Messsituation ab.",
            "essentialUnderstandingEn": "Digital does not automatically mean more accurate: the suitability of an analog or digital method depends, among other things, on range, resolution, temporal sampling, and typical reading, quantization, or calibration deviations in the particular measurement situation.",
            "observablePerformanceDe": "Die lernende Person vergleicht für dieselbe Messgröße zwei bereitgestellte Verfahren anhand expliziter Anforderungen, liest technische Angaben korrekt, identifiziert verfahrensspezifische Fehlerquellen und begründet, welches Verfahren für die konkrete Frage die aussagekräftigeren Daten liefert.",
            "observablePerformanceEn": "For the same measurand, the learner compares two provided methods against explicit requirements, reads technical specifications correctly, identifies method-specific error sources, and justifies which method provides more informative data for the particular question."
          },
          {
            "id": "comparison-links-data-quality-to-conclusion",
            "essentialUnderstandingDe": "Die bessere Messmethode ist diejenige, deren Messbereich, zeitliche und wertmäßige Auflösung sowie dokumentierte Fehlerquellen die verlangte Schlussfolgerung tragen. Ein Verfahren kann einzelne schnelle Änderungen sichtbar machen, aber kleine Werte schlecht auflösen, oder gut ablesbare Einzelwerte liefern, aber einen schnellen Verlauf verfehlen.",
            "essentialUnderstandingEn": "The better measurement method is the one whose range, temporal and value resolution, and documented error sources support the required conclusion. A method may reveal rapid changes but resolve small values poorly, or provide easily read individual values while missing a fast time course.",
            "observablePerformanceDe": "Die lernende Person wertet Beispielmessungen beider Verfahren mit Einheiten aus, erkennt Sättigung, Quantisierung, Ableseparallaxe oder zeitliches Unterabtasten und beschränkt die Empfehlung auf die konkrete Fragestellung und Messgrenzen.",
            "observablePerformanceEn": "The learner evaluates sample measurements from both methods with units, identifies saturation, quantization, reading parallax, or temporal undersampling, and limits the recommendation to the particular question and measurement constraints."
          },
          {
            "id": "fresh-method-choice-transfer",
            "essentialUnderstandingDe": "Ändert sich die Zeitskala oder die Größe des aufzulösenden Effekts, müssen Auflösung, Abtastrate und Ablesbarkeit neu gewichtet werden; dadurch kann sich die begründete Verfahrenswahl umkehren.",
            "essentialUnderstandingEn": "When the timescale or magnitude of the effect to be resolved changes, resolution, sampling rate, and readability must be reweighted; this can reverse the justified method choice.",
            "observablePerformanceDe": "Wenn statt eines langsam veränderlichen Signals ein schneller Vorgang oder statt eines mittleren Werts eine kleine Änderung erfasst werden soll, bewertet die lernende Person Auflösung, Abtastrate und Ablesbarkeit neu und kann dadurch zu einer anderen Verfahrenswahl gelangen.",
            "observablePerformanceEn": "When a rapidly changing process is to be captured instead of a slowly varying signal, or a small change instead of an average value, the learner reassesses resolution, sampling rate, and readability and may therefore arrive at a different choice of method."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "method-suitability-is-context-dependent",
            "comparison-links-data-quality-to-conclusion",
            "fresh-method-choice-transfer"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "signal-timescale",
            "textDe": "Langsam veränderlicher Zustand, schneller Impuls oder periodisches Signal",
            "textEn": "Slowly changing state, rapid pulse, or periodic signal"
          },
          {
            "id": "resolution-demand",
            "textDe": "Kleine Wertänderung, großer Messbereich oder hohe zeitliche Auflösung",
            "textEn": "Small change in value, wide measurement range, or high temporal resolution"
          },
          {
            "id": "method-specific-error",
            "textDe": "Ableseparallaxe, begrenzte Skala, Quantisierung, Unterabtastung oder Kalibrierabweichung",
            "textEn": "Reading parallax, limited scale, quantization, undersampling, or calibration deviation"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "slow-temperature-change-two-thermometers",
            "taskDemandDe": "Ein langsam abkühlendes Wasserbad soll auf eine Änderung von 0,2 °C untersucht werden. Ein analoges Thermometer besitzt 1-°C-Teilung und gut sichtbare Zwischenlagen; ein digitales zeigt 0,1 °C, hat aber eine dokumentierte Kalibrierabweichung von 0,5 °C. Vergleiche Einsatzbereich, Auflösung und Fehlerquellen, werte Probemessungen aus und wähle das Verfahren für die Änderungsfrage.",
            "taskDemandEn": "A slowly cooling water bath is to be examined for a 0.2 °C change. An analogue thermometer has 1 °C divisions with visible intermediate positions; a digital one displays 0.1 °C but has a documented calibration offset of 0.5 °C. Compare range, resolution, and error sources, evaluate sample measurements, and choose the method for the change question.",
            "expectedPerformanceDe": "Die lernende Person trennt Anzeigeauflösung von Kalibrierabweichung, beurteilt die relative Änderungsmessung unter stabiler Abweichung, nennt beim analogen Verfahren Ablesegrenze und Parallaxe und begründet eine bedingte Wahl samt notwendigem Null- oder Referenzcheck.",
            "expectedPerformanceEn": "The learner separates display resolution from calibration offset, assesses the relative change measurement under a stable offset, identifies reading limits and parallax for the analogue method, and justifies a conditional choice including a necessary zero or reference check.",
            "understandingFocusDe": "Der langsame Kleinsignal-Fall prüft, ob Auflösung, Kalibrierung und Messzweck statt des Etiketts digital oder analog entscheiden.",
            "understandingFocusEn": "The slow small-signal case tests whether resolution, calibration, and purpose rather than the digital or analogue label determine the choice."
          },
          {
            "id": "fast-pulse-sampling-versus-analogue-trace",
            "taskDemandDe": "Ein kurzer Kraftstoß von etwa 8 ms soll hinsichtlich Spitzenwert und Dauer erfasst werden. Ein digitales System tastet mit 50 Hz ab und quantisiert in 0,2-N-Schritten; ein analoges Speicherverfahren hat eine spezifizierte Zeitauflösung von 1 ms, aber eine gröbere Kraftskala. Vergleiche bereitgestellte Kurven, benenne Messgrenzen und entscheide, welche Aussage jedes Verfahren tragen kann.",
            "taskDemandEn": "A short force pulse of about 8 ms is to be captured in terms of peak value and duration. A digital system samples at 50 Hz and quantizes in 0.2 N steps; an analogue storage method has a specified time resolution of 1 ms but a coarser force scale. Compare the supplied traces, state the measurement limits, and decide which conclusion each method can support.",
            "expectedPerformanceDe": "Die lernende Person erkennt, dass 50 Hz den 8-ms-Verlauf zeitlich unterabtastet, während das analoge Verfahren den Verlauf besser erfasst, aber den Spitzenwert gröber abliest. Sie gibt eine auf Dauer beziehungsweise Amplitude begrenzte Empfehlung und behauptet keine allgemeine Überlegenheit.",
            "expectedPerformanceEn": "The learner recognizes that 50 Hz undersamples the 8 ms event in time, whereas the analogue method captures the course better but reads the peak more coarsely. The learner gives a recommendation bounded to duration or amplitude and claims no general superiority.",
            "understandingFocusDe": "Der schnelle Vorgang erzwingt Transfer auf zeitliche Abtastung und gegenläufige Messqualitätskriterien.",
            "understandingFocusEn": "The rapid process requires transfer to temporal sampling and competing data-quality criteria."
          }
        ]
      }
    },
    {
      "goalId": "d67502e3-5e0a-595b-a24b-65b1c40de36e",
      "profile": {
        "archetype": "data",
        "expectations": [
          {
            "id": "calibrate-and-derive-motion-data",
            "essentialUnderstandingDe": "Pixelkoordinaten und Frame-Nummern werden erst durch räumlichen Maßstab, Zeitbasis, Achsenwahl und Perspektivkontrolle zu physikalischen Orts-Zeit-Daten. Numerisch abgeleitete Geschwindigkeiten verstärken Positionsrauschen.",
            "essentialUnderstandingEn": "Pixel coordinates and frame numbers become physical position-time data only through spatial scale, time base, axis choice, and perspective control. Numerically derived velocities amplify positional noise.",
            "observablePerformanceDe": "Die lernende Person kalibriert ein neues Video, verfolgt einen definierten Punkt, dokumentiert Einheiten und Unsicherheiten und erzeugt s(t)- sowie v(t)-Darstellungen mit nachvollziehbarer Ableitung.",
            "observablePerformanceEn": "The learner calibrates a fresh video, tracks a defined point, documents units and uncertainties, and creates s(t) and v(t) representations with a transparent derivative method."
          },
          {
            "id": "test-motion-model-against-data",
            "essentialUnderstandingDe": "Ein Bewegungsmodell wird durch Verlauf, Parameter, Residuen und Unsicherheiten geprüft. Perspektive, Tracking, Bildrate und reale Kräfte können unterschiedliche Abweichungsmuster erzeugen.",
            "essentialUnderstandingEn": "A motion model is tested through trend, parameters, residuals, and uncertainties. Perspective, tracking, frame rate, and real forces can produce different patterns of deviation.",
            "observablePerformanceDe": "Die lernende Person wählt zwischen gleichförmigem und Wurfmodell, passt oder vergleicht das Modell mit Daten und trennt begründet physikalische von messtechnischen Abweichungen.",
            "observablePerformanceEn": "The learner chooses between uniform-motion and projectile models, fits or compares the model with data, and justifiably separates physical from measurement-related deviations."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "calibrate-and-derive-motion-data",
            "test-motion-model-against-data"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "motion-type",
            "textDe": "Geradlinig gleichförmige Bewegung oder zweidimensionaler Wurf",
            "textEn": "Uniform rectilinear motion or two-dimensional projectile motion"
          },
          {
            "id": "camera-condition",
            "textDe": "Nahezu orthogonale oder perspektivisch verzerrte Aufnahme",
            "textEn": "Nearly orthogonal or perspective-distorted recording"
          },
          {
            "id": "sampling-quality",
            "textDe": "Hohe oder geringe Bildrate und unterschiedlich starkes Trackingrauschen",
            "textEn": "High or low frame rate and different levels of tracking noise"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "cart-video-model-test",
            "taskDemandDe": "Ein Wagenvideo enthält Maßstab, Bildrate und leicht schräg stehende Kamera. Kalibriere die Bewegung, gewinne s(t) und v(t), prüfe ein gleichförmiges Modell und entscheide anhand der Residuen, ob Perspektive oder reale Beschleunigung plausibler ist.",
            "taskDemandEn": "A cart video includes a scale, frame rate, and a slightly oblique camera. Calibrate the motion, obtain s(t) and v(t), test a uniform-motion model, and use residuals to decide whether perspective or real acceleration is more plausible.",
            "expectedPerformanceDe": "Die lernende Person legt eine geeignete Achse fest, korrigiert oder begrenzt die Perspektive, erhält physikalische Einheiten, passt eine Gerade an s(t) und deutet systematische gegenüber zufälligen Residuen.",
            "expectedPerformanceEn": "The learner defines a suitable axis, corrects or bounds perspective, obtains physical units, fits a line to s(t), and interprets systematic versus random residuals.",
            "understandingFocusDe": "Der Fall prüft Kalibrierung und Diagnose eines Modells aus frischen Daten.",
            "understandingFocusEn": "The case assesses calibration and diagnosis of a model from fresh data."
          },
          {
            "id": "projectile-video-components",
            "taskDemandDe": "Ein zweidimensionales Wurfvideo mit unbekanntem Startzeitpunkt und bekannter Bildrate wird vorgelegt. Kalibriere beide Achsen, bestimme x(t), y(t), v_x(t) und v_y(t) und prüfe horizontale Gleichförmigkeit sowie vertikale konstante Beschleunigung.",
            "taskDemandEn": "A two-dimensional projectile video with unknown start time and known frame rate is supplied. Calibrate both axes, determine x(t), y(t), v_x(t), and v_y(t), and test horizontal uniform motion and vertical constant acceleration.",
            "expectedPerformanceDe": "Die lernende Person rekonstruiert den Zeitnullpunkt begründet, führt getrennte Fits mit Einheiten und Unsicherheiten aus und ordnet Abweichungen etwa Luftwiderstand, Perspektive oder numerischer Differentiation zu.",
            "expectedPerformanceEn": "The learner reconstructs the time origin with justification, performs separate fits with units and uncertainties, and attributes deviations to factors such as drag, perspective, or numerical differentiation.",
            "understandingFocusDe": "Der unabhängige Transfer prüft dieselbe Datenkette in einem anderen Bewegungsmodell.",
            "understandingFocusEn": "The independent transfer assesses the same data chain in a different motion model."
          }
        ]
      }
    },
    {
      "goalId": "ce431132-dfc4-42c2-aff6-bd72035190f8",
      "profile": {
        "archetype": "representation",
        "expectations": [
          {
            "id": "selected-blind-review-core",
            "essentialUnderstandingDe": "Die lernende Person versteht, dass t-s-, t-v- und t-a-Diagramme dieselbe eindimensionale Bewegung durch Ort, Geschwindigkeit und Beschleunigung als Funktionen der Zeit darstellen und dass Vorzeichen, Steigungen und Verläufe zwischen diesen Darstellungen physikalisch konsistent zusammenhängen.",
            "essentialUnderstandingEn": "The learner understands that time-position, time-velocity, and time-acceleration graphs represent the same one-dimensional motion through position, velocity, and acceleration as functions of time, and that signs, slopes, and graph shapes are physically consistent across these representations.",
            "observablePerformanceDe": "Die lernende Person erfasst für eine sichere einfache Bewegung Zeit-Ort-Messwerte, kennzeichnet gemessene und daraus bestimmte Größen, erstellt die drei Diagramme mit Größen und Einheiten und erklärt daraus Ruhe, Bewegungsrichtung sowie gleichförmige und beschleunigte Abschnitte.",
            "observablePerformanceEn": "For a safe simple motion, the learner records time-position data, distinguishes measured quantities from quantities determined from them, constructs all three graphs with quantities and units, and uses them to explain rest, direction of motion, and uniform and accelerated intervals."
          },
          {
            "id": "measurement-resolution-bounds-graph-consistency",
            "essentialUnderstandingDe": "Aus diskreten Messpunkten abgeleitete Geschwindigkeits- und Beschleunigungsverläufe hängen von Abtastintervall und Messauflösung ab; Differenzbildung kann Rauschen verstärken. Konsistenz bedeutet daher Übereinstimmung innerhalb der Auflösung, nicht künstlich glatte Kurven.",
            "essentialUnderstandingEn": "Velocity and acceleration inferred from discrete measurements depend on sampling interval and resolution; differencing can amplify noise. Consistency therefore means agreement within resolution, not artificially smooth curves.",
            "observablePerformanceDe": "Die lernende Person wählt begründete Auswerteintervalle, kennzeichnet Unsicherheit und unterscheidet einen physikalischen Phasenwechsel von bloßen Schwankungen abgeleiteter Werte.",
            "observablePerformanceEn": "The learner justifies analysis intervals, marks uncertainty, and distinguishes a physical phase change from fluctuations caused by deriving quantities."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "selected-blind-review-core",
            "measurement-resolution-bounds-graph-consistency"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "motion-sequence",
            "textDe": "Ruhe, gleichförmige und beschleunigte Abschnitte sowie Richtungswechsel",
            "textEn": "Rest, uniform and accelerated intervals, and reversals"
          },
          {
            "id": "acquisition-quality",
            "textDe": "Abtastintervall, Ortsauflösung und Messrauschen",
            "textEn": "Sampling interval, position resolution, and measurement noise"
          },
          {
            "id": "given-representation-and-axis",
            "textDe": "Ausgangspunkt in t-s, t-v oder t-a sowie veränderte Achsenrichtung",
            "textEn": "Starting from a time-position, time-velocity, or time-acceleration graph with a changed axis direction"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "warehouse-cart-stop-and-reverse",
            "taskDemandDe": "Werte eine verrauschte Zeit-Ort-Messreihe eines Wagens aus, der anfährt, gleichförmig fährt, bremst und zurückrollt. Prognostiziere vor der Ableitung t-v und t-a, erstelle beide mit Einheiten und begründe echte Phasenübergänge.",
            "taskDemandEn": "Analyze noisy time-position data for a cart that starts, travels uniformly, brakes, and rolls back. Predict the time-velocity and time-acceleration graphs before deriving them, construct both with units, and justify genuine phase transitions.",
            "expectedPerformanceDe": "Mess- und Ableitungsgrößen werden getrennt, Richtungswechsel und Ruhepunkt vorzeichenrichtig erkannt und kleine Beschleunigungsschwankungen anhand der Auflösung begrenzt.",
            "expectedPerformanceEn": "Measured and derived quantities are separated, reversal and rest are identified with correct signs, and small acceleration fluctuations are bounded using measurement resolution.",
            "understandingFocusDe": "Konsistente Mehrfachdarstellung trotz Messrauschen.",
            "understandingFocusEn": "Consistent multiple representation despite measurement noise."
          },
          {
            "id": "elevator-acceleration-log",
            "taskDemandDe": "Aus einem t-a-Protokoll eines Aufzugs sowie gegebenen Anfangswerten sollen qualitative t-v- und t-s-Verläufe vorhergesagt und mit Wegmarken verglichen werden.",
            "taskDemandEn": "Given a lift time-acceleration log and initial values, predict qualitative time-velocity and time-position graphs and compare them with position markers.",
            "expectedPerformanceDe": "Die lernende Person nutzt Vorzeichen und Flächen konsistent, unterscheidet Beschleunigung von Bewegungsrichtung und erklärt begrenzte Datenabweichungen.",
            "expectedPerformanceEn": "The learner uses signs and areas consistently, distinguishes acceleration from direction of motion, and explains bounded discrepancies in the data.",
            "understandingFocusDe": "Transfer von einer abgeleiteten Ausgangsdarstellung.",
            "understandingFocusEn": "Transfer from a derived starting representation."
          }
        ]
      }
    },
    {
      "goalId": "e4b38061-1f28-43ad-8371-a3e7c0e81856",
      "profile": {
        "archetype": "representation",
        "expectations": [
          {
            "id": "selected-blind-review-core",
            "essentialUnderstandingDe": "Konstante Beschleunigung bedeutet gleiche Geschwindigkeitsänderungen in gleichen Zeitintervallen; deshalb sind t-a-, t-v- und t-s-Darstellung über konstante Beschleunigung, lineare Geschwindigkeitsänderung und quadratische Ortsänderung miteinander verknüpft, wobei Anfangswerte und Vorzeichen den konkreten Verlauf bestimmen.",
            "essentialUnderstandingEn": "Constant acceleration means equal changes in velocity in equal time intervals; therefore the time-acceleration, time-velocity, and time-position representations are linked through constant acceleration, linear velocity change, and quadratic position change, while initial values and signs determine the specific course.",
            "observablePerformanceDe": "Die lernende Person konstruiert für gegebene Anfangsposition, Anfangsgeschwindigkeit und vorzeichenbehaftete konstante Beschleunigung selbstständig konsistente t-a-, t-v- und t-s-Darstellungen, übersetzt zwischen ihnen und prüft Steigungen, Flächen, Einheiten und Bewegungsrichtung auf Plausibilität.",
            "observablePerformanceEn": "For a given initial position, initial velocity, and signed constant acceleration, the learner independently constructs consistent time-acceleration, time-velocity, and time-position representations, translates among them, and checks slopes, areas, units, and direction of motion for plausibility."
          },
          {
            "id": "signed-displacement-differs-from-distance",
            "essentialUnderstandingDe": "Die vorzeichenbehaftete Fläche unter einem t-v-Diagramm ist die Ortsänderung. Nach einem Richtungswechsel ist die zurückgelegte Strecke die Summe der Beträge der Teilflächen und kann größer als der Betrag der Ortsänderung sein.",
            "essentialUnderstandingEn": "The signed area under a time-velocity graph is displacement. After a reversal, distance traveled is the sum of the magnitudes of the partial areas and may exceed the magnitude of displacement.",
            "observablePerformanceDe": "Die lernende Person zerlegt einen Verlauf am Nulldurchgang von v, bestimmt Ortsänderung und Strecke mit Einheiten und verbindet beide mit dem t-s-Verlauf.",
            "observablePerformanceEn": "The learner splits a graph at the zero crossing of v, determines displacement and distance with units, and relates both to the time-position graph."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "selected-blind-review-core",
            "signed-displacement-differs-from-distance"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "signed-initial-conditions",
            "textDe": "Verschiedene Anfangsorte, Anfangsgeschwindigkeiten und Vorzeichen der Beschleunigung",
            "textEn": "Different initial positions, initial velocities, and signs of acceleration"
          },
          {
            "id": "starting-representation",
            "textDe": "Gegebenes t-a-, t-v-, t-s-Diagramm oder Wertetabelle",
            "textEn": "Given time-acceleration, time-velocity, time-position graph, or table"
          },
          {
            "id": "model-interval",
            "textDe": "Vollständig konstante Beschleunigung oder begrenztes Gültigkeitsintervall",
            "textEn": "Fully constant acceleration or a bounded validity interval"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "ramp-cart-turnaround",
            "taskDemandDe": "Ein Wagen fährt mit positiver Anfangsgeschwindigkeit eine Rampe hinauf und erfährt konstante negative Beschleunigung. Konstruiere alle Diagramme, bestimme den Umkehrzeitpunkt sowie Ortsänderung und Strecke.",
            "taskDemandEn": "A cart travels up a ramp with positive initial velocity and constant negative acceleration. Construct all graphs and determine reversal time, displacement, and distance.",
            "expectedPerformanceDe": "Am Umkehrpunkt ist v = 0, aber a ist ungleich null; Vorzeichen, Flächen und Einheiten bleiben in allen Darstellungen konsistent.",
            "expectedPerformanceEn": "At the turning point v = 0 but a is nonzero; signs, areas, and units remain consistent across all representations.",
            "understandingFocusDe": "Geschwindigkeit null ist nicht Beschleunigung null.",
            "understandingFocusEn": "Zero velocity is not zero acceleration."
          },
          {
            "id": "braking-model-beyond-stop",
            "taskDemandDe": "Bremsdaten eines Fahrzeugs passen bis zum Stillstand zu konstanter negativer Beschleunigung. Setze das mathematische Modell zunächst fort und entscheide dann, ab wann es den realen Vorgang nicht mehr beschreibt.",
            "taskDemandEn": "Vehicle braking data fit constant negative acceleration up to rest. First extend the mathematical model and then decide when it ceases to describe the real process.",
            "expectedPerformanceDe": "Die rechnerische Rückwärtsbewegung nach dem Nulldurchgang wird als Folge einer unzulässigen Modellfortsetzung erkannt und das Gültigkeitsintervall datenbezogen begrenzt.",
            "expectedPerformanceEn": "The calculated backward motion after the zero crossing is recognized as a consequence of invalid model extension, and the validity interval is bounded using the data.",
            "understandingFocusDe": "Modellgleichung und reale Gültigkeit werden getrennt.",
            "understandingFocusEn": "Model equation and physical validity are separated."
          }
        ]
      }
    },
    {
      "goalId": "4a2bf015-052b-4af0-aed7-324259fa1a8a",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "selected-blind-review-core",
            "essentialUnderstandingDe": "Der Anhalteweg setzt sich aus Reaktions- und Bremsweg zusammen; bei einfachen Modellen wächst der Reaktionsweg proportional zu Geschwindigkeit und Reaktionszeit, der Bremsweg bei konstanter Verzögerung quadratisch mit der Geschwindigkeit. Reale Sicherheitsabstände müssen außerdem Bedingungen, Unsicherheiten und eine explizite Sicherheitsreserve berücksichtigen.",
            "essentialUnderstandingEn": "Stopping distance is the sum of reaction and braking distance; in simple models, reaction distance is proportional to speed and reaction time, while braking distance under constant deceleration grows with the square of speed. Real safe distances must also account for conditions, uncertainty, and an explicit safety margin.",
            "observablePerformanceDe": "Die lernende Person trennt für eine gegebene Verkehrssituation Reaktions- und Bremsphase, begründet ein einfaches Modell mit Größen, Einheiten und Annahmen, berechnet oder schätzt den Anhalteweg und bewertet einen vorgeschlagenen Abstand anhand offengelegter Sicherheitskriterien.",
            "observablePerformanceEn": "For a given traffic situation, the learner separates the reaction and braking phases, justifies a simple model with quantities, units, and assumptions, calculates or estimates stopping distance, and evaluates a proposed gap using stated safety criteria."
          },
          {
            "id": "relative-gap-requires-a-shared-motion-timeline",
            "essentialUnderstandingDe": "Beim Abstand zu einem ebenfalls bewegten und bremsenden Fahrzeug ist nicht automatisch der volle Anhalteweg des Folgefahrzeugs die relevante Vergleichsgröße, sondern der größte Abbau des Abstands im gemeinsamen Zeitverlauf. Nur in passend begründeten einfachen Fällen lässt er sich als Differenz der Fahrwege bis zum Stillstand bestimmen; eine gesonderte Sicherheitsreserve bleibt erforderlich.",
            "essentialUnderstandingEn": "When following another vehicle that is also moving and braking, the relevant quantity is not automatically the follower's full stopping distance but the greatest loss of separation over the shared time history. Only in suitably justified simple cases can this be obtained from the difference between the distances traveled before stopping; a separate safety margin is still required.",
            "observablePerformanceDe": "Die lernende Person stellt für ein festes Hindernis und für ein bremsendes vorausfahrendes Fahrzeug jeweils einen konsistenten Zeit- oder Wegvergleich auf, bestimmt den maximalen Abstandsverlust, prüft einen Anfangsabstand einschließlich Reserve und verwirft die pauschale Gleichsetzung von Folgeabstand und vollständigem Anhalteweg.",
            "observablePerformanceEn": "For both a fixed obstacle and a braking lead vehicle, the learner constructs a consistent time- or distance-based comparison, determines the maximum loss of separation, tests an initial gap including a margin, and rejects the blanket identification of following distance with the follower's full stopping distance."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "selected-blind-review-core",
            "relative-gap-requires-a-shared-motion-timeline"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "speed-and-reaction-latency",
            "textDe": "Anfangsgeschwindigkeit und Reaktionszeit werden unabhängig verändert, einschließlich korrekter Umrechnung zwischen km/h und m/s.",
            "textEn": "Initial speed and reaction time are varied independently, including correct conversion between km/h and m/s."
          },
          {
            "id": "effective-braking-conditions",
            "textDe": "Trockene oder nasse Fahrbahn, Gefälle und fahrzeugspezifische effektive Bremsverzögerung verändern den Bremsweg.",
            "textEn": "Dry or wet pavement, downhill grade, and vehicle-specific effective braking deceleration alter braking distance."
          },
          {
            "id": "hazard-geometry-and-uncertainty",
            "textDe": "Festes Hindernis oder mitbremsendes vorausfahrendes Fahrzeug sowie Punktwerte oder Unsicherheitsintervalle erfordern unterschiedliche Vergleichs- und Reserveentscheidungen.",
            "textEn": "A fixed obstacle or a braking lead vehicle, together with point estimates or uncertainty intervals, requires different comparison and margin decisions."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "fixed-obstacle-two-speed-safety-test",
            "taskDemandDe": "Ein Pkw fährt auf ebener trockener Straße entweder 50 km/h oder 100 km/h auf ein plötzlich sichtbares festes Hindernis zu. Verwende t_R = 0,80 s und eine konstante Bremsverzögerung vom Betrag 8,0 m/s². Bestimme für beide Geschwindigkeiten Reaktions-, Brems- und Anhalteweg und bewerte vorgeschlagene Abstände von 30 m beziehungsweise 75 m, wenn zusätzlich mindestens 10 % des modellierten Anhaltewegs als Reserve gefordert werden.",
            "taskDemandEn": "A car travels on a level dry road toward a suddenly visible fixed obstacle at either 50 km/h or 100 km/h. Use t_R = 0.80 s and a constant braking-deceleration magnitude of 8.0 m/s². Determine reaction, braking, and stopping distance at both speeds and evaluate proposed distances of 30 m and 75 m respectively when a margin of at least 10% of the modeled stopping distance is also required.",
            "expectedPerformanceDe": "Die lernende Person rechnet die Geschwindigkeiten in m/s um, verwendet s_R = v t_R und s_B = v²/(2|a_B|), erhält ungefähr 23 m beziehungsweise 70 m ohne Reserve und urteilt daher modellbedingt: 30 m genügen einschließlich 10-%-Reserve, 75 m bei 100 km/h nicht. Sie erklärt, dass die Verdopplung der Geschwindigkeit den Reaktionsweg verdoppelt, den Bremsweg vervierfacht und deshalb den gesamten Anhalteweg nicht bloß verdoppelt.",
            "expectedPerformanceEn": "The learner converts the speeds to m/s, uses s_R = v t_R and s_B = v²/(2|a_B|), obtains approximately 23 m and 70 m without a margin, and therefore concludes within the model that 30 m is sufficient with the 10% margin whereas 75 m at 100 km/h is not. The learner explains that doubling speed doubles reaction distance, quadruples braking distance, and therefore does not merely double total stopping distance.",
            "understandingFocusDe": "Geprüft werden getrennte Skalierung der beiden Phasen, konsistente Einheiten und die Unterscheidung zwischen berechnetem Modellminimum und begründetem Sicherheitsabstand.",
            "understandingFocusEn": "This tests the distinct scaling of the two phases, consistent units, and the distinction between a calculated model minimum and a justified safe distance."
          },
          {
            "id": "wet-road-following-gap-with-lead-vehicle",
            "taskDemandDe": "Zwei Fahrzeuge fahren zunächst mit 80 km/h und 40 m Abstand. Das vorausfahrende Fahrzeug beginnt bei t = 0 mit 8,0 m/s² zu bremsen. Das Folgefahrzeug fährt wegen einer Reaktionszeit von 1,0 s zunächst unverändert weiter und erreicht auf nasser Fahrbahn anschließend nur 5,0 m/s². Fahrzeuglängen dürfen im Punktmodell vernachlässigt werden. Prüfe, ob der Abstand mit einer zusätzlichen Reserve von 5 m ausreicht, und begründe die richtige Vergleichsgröße.",
            "taskDemandEn": "Two vehicles initially travel at 80 km/h with a 40 m gap. At t = 0 the lead vehicle begins braking at 8.0 m/s². Because of a 1.0 s reaction time, the following vehicle initially continues unchanged and then achieves only 5.0 m/s² on the wet road. Vehicle lengths may be neglected in the point-particle model. Determine whether the gap is sufficient with an additional 5 m margin and justify the correct comparison quantity.",
            "expectedPerformanceDe": "Die lernende Person bestimmt für das vorausfahrende Fahrzeug ungefähr 31 m und für das Folgefahrzeug einschließlich Reaktionsweg ungefähr 72 m Fahrweg. Der Abstand nimmt damit im einfachen monotonen Fall um rund 41 m ab; mit 5 m Reserve wären etwa 46 m erforderlich. Sie verwirft die 40 m und erklärt, warum weder der volle Folgefahrzeug-Anhalteweg noch eine starre Faustregel allein die gesuchte Abstandsbilanz darstellt.",
            "expectedPerformanceEn": "The learner finds approximately 31 m of travel for the lead vehicle and approximately 72 m for the following vehicle including reaction distance. In this simple monotonic case the separation therefore decreases by about 41 m; roughly 46 m would be required with the 5 m margin. The learner rejects the 40 m gap and explains why neither the follower's full stopping distance nor a fixed rule of thumb alone represents the required separation balance.",
            "understandingFocusDe": "Geprüft werden relativer Weg, veränderte Bremsbedingungen und die Fehlvorstellung, jeder Folgeabstand müsse schlicht dem vollständigen Anhalteweg des hinteren Fahrzeugs entsprechen.",
            "understandingFocusEn": "This tests relative travel, changed braking conditions, and the misconception that every following gap is simply the rear vehicle's full stopping distance."
          }
        ]
      }
    },
    {
      "goalId": "09029573-864f-40ca-bf8a-cee7bf6dcb73",
      "profile": {
        "archetype": "experiment",
        "expectations": [
          {
            "id": "selected-blind-review-core",
            "essentialUnderstandingDe": "Die lernende Person versteht den freien Fall nahe der Erdoberfläche als näherungsweise gleichmäßig beschleunigte Bewegung unter Gravitation, unterscheidet gemessene Orts- und Zeitdaten von der daraus erschlossenen Gravitationsbeschleunigung und berücksichtigt, dass das Modell Luftwiderstand vernachlässigt sowie Koordinatenwahl und Anfangsbedingungen benötigt.",
            "essentialUnderstandingEn": "The learner understands free fall near Earth's surface as approximately uniformly accelerated motion under gravity, distinguishes measured position and time data from the gravitational acceleration inferred from them, and recognizes that the model neglects air resistance and requires a coordinate choice and initial conditions.",
            "observablePerformanceDe": "Die lernende Person plant oder nutzt eine sichere beaufsichtigte Video- oder Sensormessung beziehungsweise einen bereitgestellten Datensatz, stellt die Daten geeignet grafisch dar, bestimmt g mit Einheit und begründeter Unsicherheit, prüft die Modellpassung und formuliert ein dazu konsistentes Zeit-Ort-Gesetz mit Anfangsbedingungen.",
            "observablePerformanceEn": "The learner plans or uses a safe supervised video or sensor measurement, or a supplied data set, represents the data in a suitable graph, determines g with a unit and justified uncertainty, checks the model fit, and formulates a consistent time-position law with initial conditions."
          },
          {
            "id": "g-is-acceleration-not-weight-or-speed",
            "essentialUnderstandingDe": "g ist im luftwiderstandsfreien Modell die lokale Beschleunigung und weder eine Geschwindigkeit noch eine Kraft. Verschiedene Massen haben dieselbe Fallbeschleunigung, obwohl ihre Gewichtskräfte m g verschieden sind.",
            "essentialUnderstandingEn": "In the no-drag model, g is local acceleration, not a velocity or force. Different masses have the same falling acceleration even though their weights m g differ.",
            "observablePerformanceDe": "Die lernende Person vergleicht Daten zweier Körper, trennt Beschleunigung, Geschwindigkeit und Gewichtskraft mit Einheiten und entscheidet, ob Abweichungen auf Messunsicherheit oder Luftwiderstand hinweisen.",
            "observablePerformanceEn": "The learner compares data for two objects, distinguishes acceleration, velocity, and weight with units, and decides whether differences indicate uncertainty or drag."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "selected-blind-review-core",
            "g-is-acceleration-not-weight-or-speed"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "object-and-drag",
            "textDe": "Kompakter Körper, flächiger Körper oder unterschiedliche Massen",
            "textEn": "Compact object, broad object, or different masses"
          },
          {
            "id": "coordinate-and-initial-state",
            "textDe": "Fall aus Ruhe, Anfangsgeschwindigkeit, Bezugshöhe und Achsenrichtung",
            "textEn": "Drop from rest, initial velocity, reference height, and axis direction"
          },
          {
            "id": "measurement-method",
            "textDe": "Video, Lichtschranke, Sensor oder bereitgestellter Datensatz",
            "textEn": "Video, light gate, sensor, or supplied data"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "steel-ball-video-fit",
            "taskDemandDe": "Werte eine beaufsichtigt aufgezeichnete Fallbewegung einer Stahlkugel bei nach oben positiver Achse aus. Bestimme g grafisch, gib Unsicherheit und Einheit an und formuliere das Zeit-Ort-Gesetz.",
            "taskDemandEn": "Analyze a supervised video recording of a falling steel ball with upward chosen as positive. Determine g graphically, state uncertainty and unit, and formulate the time-position law.",
            "expectedPerformanceDe": "Gemessene Orte und Zeiten werden von g als erschlossener Größe getrennt; a = -g, Anfangshöhe und Anfangsgeschwindigkeit werden konsistent eingesetzt.",
            "expectedPerformanceEn": "Measured positions and times are distinguished from inferred g; a = -g, initial height, and initial velocity are used consistently.",
            "understandingFocusDe": "Vorzeichen und Anfangsbedingungen sind Teil des Modells.",
            "understandingFocusEn": "Signs and initial conditions are part of the model."
          },
          {
            "id": "ball-and-filter-model-comparison",
            "taskDemandDe": "Vergleiche bereitgestellte Fallmessungen einer kompakten Kugel und eines Papierfilters aus gleicher Höhe. Prüfe für beide das Modell ohne Luftwiderstand.",
            "taskDemandEn": "Compare supplied falling-motion data for a compact ball and a paper filter released from the same height. Test the no-drag model for each.",
            "expectedPerformanceDe": "Die Kugeldaten liefern innerhalb der Unsicherheit konstantes g; die Filterabweichung wird nicht als anderes Gravitationsfeld oder bloßer Masseneffekt, sondern als Modellgrenze eingeordnet.",
            "expectedPerformanceEn": "The ball data yield constant g within uncertainty; the filter discrepancy is treated as a model limitation rather than a different gravitational field or merely a mass effect.",
            "understandingFocusDe": "Abweichung vom Modell verändert nicht die Bedeutung von g.",
            "understandingFocusEn": "Deviation from the model does not change the meaning of g."
          }
        ]
      }
    },
    {
      "goalId": "d6dc0e02-831d-4894-a61a-852bcc74f147",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "system-and-law-selection",
            "essentialUnderstandingDe": "Ein Bewegungsgesetz beschreibt die Position beziehungsweise Geschwindigkeit eines festgelegten Körpers relativ zu einem gewählten Bezugssystem und Zeitnullpunkt; seine Form muss zum angenommenen Bewegungstyp passen.",
            "essentialUnderstandingEn": "A law of motion describes the position or velocity of a specified body relative to a chosen reference frame and time origin; its form must match the assumed type of motion.",
            "observablePerformanceDe": "Die lernende Person legt Körper, Koordinatenrichtung, Orts- und Zeitnullpunkt fest, wählt oder entwickelt passende Zeit-Ort- und Zeit-Geschwindigkeits-Gesetze und erklärt die physikalische Bedeutung ihrer Parameter und Vorzeichen.",
            "observablePerformanceEn": "The learner specifies the body, coordinate direction, spatial and temporal origins, selects or develops suitable time-position and time-velocity laws, and explains the physical meaning of their parameters and signs."
          },
          {
            "id": "idealization-and-consistency",
            "essentialUnderstandingDe": "Massepunkt und Reibungsfreiheit sind begründungsbedürftige Idealisierungen: Sie sind nützlich, wenn Größe, Rotation oder Widerstand für die Fragestellung vernachlässigbar sind. Zeit-Ort- und Zeit-Geschwindigkeits-Gesetz müssen dieselbe Bewegung widerspruchsfrei beschreiben.",
            "essentialUnderstandingEn": "The point-particle approximation and neglect of friction are idealizations that require justification: they are useful when size, rotation, or resistance is negligible for the question. The time-position and time-velocity laws must describe the same motion consistently.",
            "observablePerformanceDe": "Die lernende Person begründet jede Idealisierung bezogen auf Fall und Zielgröße, prüft die gegenseitige Konsistenz der beiden Gesetze über Steigung beziehungsweise zeitliche Änderung und korrigiert ein Modell mit widersprüchlichen Vorhersagen.",
            "observablePerformanceEn": "The learner justifies each idealization in relation to the case and target quantity, checks mutual consistency of the two laws through slope or time variation, and corrects a model with contradictory predictions."
          },
          {
            "id": "validation-and-model-limit",
            "essentialUnderstandingDe": "Übereinstimmung in einem untersuchten Zeitbereich stützt ein Modell nur dort; systematische Abweichungen, lange Extrapolation oder ein Regimewechsel wie zunehmender Luftwiderstand markieren Grenzen seiner Vorhersagen.",
            "essentialUnderstandingEn": "Agreement over an investigated time interval supports a model only there; systematic deviations, long extrapolation, or a regime change such as increasing drag mark limits of its predictions.",
            "observablePerformanceDe": "Die lernende Person vergleicht Modellwerte oder Graphen mit frischen Bewegungsdaten, identifiziert den Gültigkeitsbereich, erklärt ein Abweichungsmuster physikalisch und formuliert eine begrenzte statt universelle Vorhersage.",
            "observablePerformanceEn": "The learner compares model values or graphs with fresh motion data, identifies the validity range, explains a deviation pattern physically, and states a limited rather than universal prediction."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "system-and-law-selection",
            "idealization-and-consistency",
            "validation-and-model-limit"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "motion-regime",
            "textDe": "Näherungsweise gleichförmige, gleichmäßig beschleunigte oder durch Widerstand abweichende Bewegung",
            "textEn": "Approximately uniform, uniformly accelerated, or drag-affected motion"
          },
          {
            "id": "reference-choice",
            "textDe": "Geänderte positive Koordinatenrichtung, Ortsnullpunkt oder Zeitnullpunkt",
            "textEn": "Changed positive coordinate direction, spatial origin, or time origin"
          },
          {
            "id": "evidence-form",
            "textDe": "Tabellarische Messdaten, Zeit-Ort-Graph oder Zeit-Geschwindigkeits-Graph",
            "textEn": "Tabulated measurements, time-position graph, or time-velocity graph"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "cart-constant-acceleration",
            "taskDemandDe": "Für einen Wagen auf einer geraden Bahn liegen Zeit-Ort-Daten vor, die in einem begrenzten Intervall zu gleichmäßiger Beschleunigung passen. Ein Bezugssystem, konsistente Gesetze für Ort und Geschwindigkeit, Idealisierungen und der geprüfte Gültigkeitsbereich sind anzugeben.",
            "taskDemandEn": "Time-position data for a cart on a straight track are consistent with uniform acceleration over a limited interval. A reference frame, consistent position and velocity laws, idealizations, and the tested range of validity must be specified.",
            "expectedPerformanceDe": "Die lernende Person definiert Achse und Nullpunkte, entwickelt zueinander passende Gesetze, deutet Anfangswerte und Beschleunigung mit Vorzeichen, begründet das Massepunktmodell und beschränkt die Aussage auf das Datenintervall.",
            "expectedPerformanceEn": "The learner defines the axis and origins, develops mutually consistent laws, interprets initial values and acceleration with signs, justifies the point-particle model, and restricts the claim to the data interval.",
            "understandingFocusDe": "Mathematische Form und physikalische Bezugswahl müssen gemeinsam kohärent sein.",
            "understandingFocusEn": "Mathematical form and physical reference choice must be coherent together."
          },
          {
            "id": "fall-with-drag-deviation",
            "taskDemandDe": "Ein reibungsfreies Modell für einen fallenden Körper stimmt anfangs mit Messdaten überein, überschätzt später aber die Geschwindigkeit systematisch. Die Idealisierung und eine weitreichende Extrapolation sind zu beurteilen.",
            "taskDemandEn": "A drag-free model for a falling object initially agrees with measurements but later systematically overestimates the speed. The idealization and a long-range extrapolation must be evaluated.",
            "expectedPerformanceDe": "Die lernende Person erkennt das geordnete Abweichungsmuster als Grenze der Reibungsfreiheitsannahme, erklärt die zunehmende Bedeutung des Widerstands und lehnt die unveränderte Fortsetzung des Modells ab, ohne das gesamte Anfangsmodell als wertlos zu verwerfen.",
            "expectedPerformanceEn": "The learner recognizes the systematic deviation pattern as a limit of the no-drag assumption, explains the growing importance of resistance, and rejects unchanged extrapolation without dismissing the entire initial model as useless.",
            "understandingFocusDe": "Der Transfer deckt die Fehlvorstellung auf, eine lokal passende Gleichung sei eine unbegrenzt gültige Realität.",
            "understandingFocusEn": "The transfer exposes the misconception that a locally fitting equation is an indefinitely valid reality."
          }
        ]
      }
    },
    {
      "goalId": "5f289cdc-fda1-4058-b44f-041ba1398e79",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "selected-blind-review-core",
            "essentialUnderstandingDe": "Die lernende Person versteht, dass bei einem Körper konstanter Masse im Inertialsystem die vorzeichenbehaftete Summe der äußeren Kräfte die Beschleunigung festlegt, dass die Koordinatenrichtung die Vorzeichen, nicht aber die Physik bestimmt und dass Kräftegleichgewicht Beschleunigung null, aber nicht notwendig Geschwindigkeit null bedeutet.",
            "essentialUnderstandingEn": "The learner understands that for a constant-mass body in an inertial frame the signed sum of external forces determines the acceleration, that the coordinate direction determines the signs but not the physics, and that force equilibrium means zero acceleration but not necessarily zero velocity.",
            "observablePerformanceDe": "Die lernende Person grenzt in einer neuen eindimensionalen Situation den Körper ab, stellt die äußeren Kräfte mit Richtungen dar, wählt eine positive Achse, bildet die vorzeichenrichtige Kräftebilanz, bestimmt oder prognostiziert die Beschleunigung mit Einheiten und prüft die Plausibilität der Richtung.",
            "observablePerformanceEn": "In a new one-dimensional situation, the learner defines the body, represents the external forces with directions, chooses a positive axis, forms the correctly signed force balance, determines or predicts the acceleration with units, and checks the plausibility of its direction."
          },
          {
            "id": "same-net-force-mass-controls-acceleration",
            "essentialUnderstandingDe": "Bei gleicher resultierender Kraft ist der Betrag der Beschleunigung umgekehrt proportional zur Masse. Die Masse beschreibt dabei Trägheit; eine vorhandene Anfangsgeschwindigkeit ändert die momentane Beziehung zwischen Resultierender und Beschleunigung nicht.",
            "essentialUnderstandingEn": "For the same net force, acceleration magnitude is inversely proportional to mass. Mass represents inertia; an existing initial velocity does not change the instantaneous relation between net force and acceleration.",
            "observablePerformanceDe": "Die lernende Person prognostiziert für zwei Massen unter derselben Resultierenden das Beschleunigungsverhältnis, prüft es mit N = kg m/s² und trennt es von ihren möglichen Anfangsgeschwindigkeiten.",
            "observablePerformanceEn": "The learner predicts the acceleration ratio for two masses under the same resultant, checks it using N = kg m/s², and distinguishes it from their possible initial velocities."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "selected-blind-review-core",
            "same-net-force-mass-controls-acceleration"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "force-configuration",
            "textDe": "Zugkraft, Gewicht, Reibung oder mehrere entgegenwirkende Kräfte",
            "textEn": "Tension, weight, friction, or multiple opposing forces"
          },
          {
            "id": "mass-and-initial-motion",
            "textDe": "Verschiedene Massen sowie Ruhe, Beschleunigen oder Abbremsen",
            "textEn": "Different masses and states of rest, speeding up, or slowing down"
          },
          {
            "id": "axis-and-data",
            "textDe": "Umgekehrte Achse, Kraftwerte, Beschleunigungsdaten oder unbekannte Teilgröße",
            "textEn": "Reversed axis, force values, acceleration data, or an unknown quantity"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "elevator-moving-up-slowing",
            "taskDemandDe": "Ein Aufzug bewegt sich aufwärts, wird aber langsamer. Wähle die positive Richtung, bilanziere Gewicht und Seilkraft und bestimme Richtung sowie Betrag der Beschleunigung.",
            "taskDemandEn": "A lift moves upward but slows down. Choose a positive direction, balance weight and cable force, and determine acceleration direction and magnitude.",
            "expectedPerformanceDe": "Die abwärts gerichtete Resultierende und Beschleunigung werden trotz aufwärts gerichteter Geschwindigkeit korrekt erkannt; Kräfte und Einheiten sind konsistent.",
            "expectedPerformanceEn": "The downward net force and acceleration are identified despite upward velocity; forces and units are consistent.",
            "understandingFocusDe": "Beschleunigungsrichtung ist nicht notwendig Bewegungsrichtung.",
            "understandingFocusEn": "Acceleration direction need not equal motion direction."
          },
          {
            "id": "two-carts-same-net-pull",
            "taskDemandDe": "Zwei Wagen verschiedener Masse erfahren nach Abzug gemessener Reibung dieselbe resultierende Zugkraft. Prognostiziere und prüfe ihre Beschleunigungen; werte einen Datensatz zusätzlich mit umgekehrter Achse aus.",
            "taskDemandEn": "Two carts of different masses experience the same net pulling force after measured friction is accounted for. Predict and test their accelerations, then evaluate one data set with the axis reversed.",
            "expectedPerformanceDe": "Das inverse Massenverhältnis wird erkannt; eine Achsenumkehr ändert Vorzeichen, aber weder Betrag noch physikalische Aussage.",
            "expectedPerformanceEn": "The inverse mass relation is recognized; reversing the axis changes signs but not magnitudes or physical conclusions.",
            "understandingFocusDe": "Masse, Resultierende und Koordinatenkonvention.",
            "understandingFocusEn": "Mass, net force, and coordinate convention."
          }
        ]
      }
    },
    {
      "goalId": "c1c71daa-042b-4f4c-8c31-0ac366f5149e",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "selected-blind-review-core",
            "essentialUnderstandingDe": "Die lernende Person versteht mechanische Arbeit als Energieübertragung durch eine äußere Kraft längs eines Weges über eine gewählte Systemgrenze, wobei nur der Kraftanteil in Wegrichtung beiträgt und das Vorzeichen angibt, ob dem System Energie zugeführt oder entzogen wird.",
            "essentialUnderstandingEn": "The learner understands mechanical work as energy transfer across a chosen system boundary by an external force along a displacement, with only the force component along the displacement contributing and the sign indicating whether energy is supplied to or removed from the system.",
            "observablePerformanceDe": "Für einen einfachen Vorgang legt die lernende Person System und Wegrichtung fest, bestimmt aus Kraft und Weg das Vorzeichen und gegebenenfalls den Betrag der Arbeit mit Einheit und erstellt eine Energieänderungsbilanz, die verwendete Vorzeichenkonvention und weitere Übertragungen sichtbar macht.",
            "observablePerformanceEn": "For a simple process, the learner defines the system and displacement direction, determines the sign and, where applicable, the magnitude of work from force and displacement with a unit, and constructs an energy-change balance that makes the sign convention and any other transfers explicit."
          },
          {
            "id": "variable-force-work-is-signed-area",
            "essentialUnderstandingDe": "Bei veränderlicher Kraft ist die mechanische Arbeit die vorzeichenbehaftete Fläche unter der Kraft-Weg-Kurve der Komponente in Wegrichtung. Ein einzelner Kraftwert mal Gesamtweg ist nur für eine konstante Kraft oder einen begründeten Mittelwert zulässig.",
            "essentialUnderstandingEn": "For a variable force, mechanical work is the signed area under the force-displacement graph of the component along the displacement. Multiplying one force value by the total displacement is valid only for constant force or a justified mean value.",
            "observablePerformanceDe": "Die lernende Person wertet eine stückweise oder grafisch gegebene Kraft aus, summiert positive und negative Flächen mit Einheit Joule und verbindet das Ergebnis mit der Energieänderung des festgelegten Systems.",
            "observablePerformanceEn": "The learner evaluates a piecewise or graphically supplied force, sums positive and negative areas in joules, and relates the result to the energy change of the defined system."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "selected-blind-review-core",
            "variable-force-work-is-signed-area"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "force-displacement-geometry",
            "textDe": "Parallele, schräge oder entgegengesetzte Kraft sowie Richtungswechsel des Weges",
            "textEn": "Parallel, oblique, or opposing force and reversal of displacement"
          },
          {
            "id": "system-boundary",
            "textDe": "Körper allein, Körper plus Feder oder Körper plus Unterlage",
            "textEn": "Object alone, object plus spring, or object plus surface"
          },
          {
            "id": "force-profile",
            "textDe": "Konstante, stückweise konstante oder kontinuierlich veränderliche Kraft",
            "textEn": "Constant, piecewise constant, or continuously varying force"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "sled-oblique-pull-and-friction",
            "taskDemandDe": "Ein Schlitten wird mit schrägem Seil über eine raue horizontale Strecke gezogen. Lege das System fest, bestimme die Arbeiten von Seilkraft und Reibung samt Vorzeichen und bilanziere die Änderung der kinetischen Energie.",
            "taskDemandEn": "A sled is pulled by an oblique rope across a rough horizontal surface. Define the system, determine the work done by tension and friction with signs, and balance the change in kinetic energy.",
            "expectedPerformanceDe": "Nur die Wegkomponente der Seilkraft trägt bei; Reibungsarbeit ist für das Schlitten-System negativ, alle Terme werden in Joule geführt und die resultierende Energieänderung wird vorzeichenrichtig gedeutet.",
            "expectedPerformanceEn": "Only the component of tension along the displacement contributes; frictional work is negative for the sled system, all terms are expressed in joules, and the resulting energy change is interpreted with the correct sign.",
            "understandingFocusDe": "Kraftkomponente, Vorzeichen und Systemgrenze bestimmen die Arbeitsbilanz.",
            "understandingFocusEn": "Force component, sign, and system boundary determine the work balance."
          },
          {
            "id": "spring-block-boundary-switch",
            "taskDemandDe": "Ein Klotz wird von einer gespannten Feder beschleunigt. Werte eine gegebene Federkraft-Weg-Kurve aus und stelle die Energieänderung einmal für den Klotz und einmal für das System Klotz-Feder dar.",
            "taskDemandEn": "A block is accelerated by a compressed spring. Evaluate a supplied spring-force versus displacement graph and represent the energy change once for the block and once for the block-spring system.",
            "expectedPerformanceDe": "Die Fläche wird als Arbeit am Klotz bestimmt; bei erweiterter Systemgrenze wird derselbe Vorgang als Abnahme elastischer Energie statt als Energieübertragung über die Grenze bilanziert.",
            "expectedPerformanceEn": "The area is determined as work on the block; with the expanded system boundary, the same process is balanced as a decrease in elastic energy rather than an energy transfer across the boundary.",
            "understandingFocusDe": "Dieselbe Physik erhält je nach Systemgrenze verschiedene, aber konsistente Bilanzterme.",
            "understandingFocusEn": "The same physics yields different but consistent balance terms for different system boundaries."
          }
        ]
      }
    },
    {
      "goalId": "7eeff2de-6015-49a6-a96e-a488d886dc9f",
      "profile": {
        "archetype": "concept",
        "expectations": [
          {
            "id": "selected-blind-review-core",
            "essentialUnderstandingDe": "Die kinetische Energie ist im gewählten Bezugssystem die skalare Größe E_k = 1/2 m v²; sie ist nicht negativ, wächst linear mit der Masse und quadratisch mit dem Geschwindigkeitsbetrag und hängt daher im Gegensatz zur Masse vom Bezugssystem ab.",
            "essentialUnderstandingEn": "In the chosen reference frame, kinetic energy is the scalar quantity E_k = 1/2 m v²; it is non-negative, grows linearly with mass and quadratically with speed, and therefore, unlike mass, depends on the reference frame.",
            "observablePerformanceDe": "Die lernende Person berechnet kinetische Energien mit konsistenten Einheiten, vergleicht Fälle mit veränderter Masse oder Geschwindigkeit und erklärt ohne bloßes Einsetzen, weshalb eine Verdopplung der Geschwindigkeit die Energie vervierfacht.",
            "observablePerformanceEn": "The learner calculates kinetic energies with consistent units, compares cases with changed mass or speed, and explains rather than merely substitutes why doubling speed quadruples the energy."
          },
          {
            "id": "equal-energy-does-not-fix-mass-or-speed",
            "essentialUnderstandingDe": "Gleiche kinetische Energie legt weder Masse noch Geschwindigkeit einzeln fest, sondern nur das Produkt m v². Daher können Körper mit verschiedenen Massen und Geschwindigkeiten dieselbe kinetische Energie besitzen; aus einem Energievergleich allein darf ohne weitere Angabe nicht auf gleiche Geschwindigkeit geschlossen werden.",
            "essentialUnderstandingEn": "Equal kinetic energy determines neither mass nor speed separately but only the product m v². Bodies with different masses and speeds can therefore have the same kinetic energy, and equal speed cannot be inferred from an energy comparison alone without additional information.",
            "observablePerformanceDe": "Die lernende Person erzeugt oder vervollständigt unterschiedliche Masse-Geschwindigkeit-Paare mit gleicher kinetischer Energie, begründet die nötige Änderung über Verhältnisse oder eine E_k-v-Darstellung und widerlegt die Behauptung, gleiche kinetische Energie bedeute gleiche Geschwindigkeit.",
            "observablePerformanceEn": "The learner generates or completes different mass-speed pairs with equal kinetic energy, justifies the required change using ratios or an E_k-versus-v representation, and refutes the claim that equal kinetic energy means equal speed."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "selected-blind-review-core",
            "equal-energy-does-not-fix-mass-or-speed"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "mass-speed-combination",
            "textDe": "Masse und Geschwindigkeitsbetrag werden einzeln oder gekoppelt verändert, einschließlich Fällen gleicher Energie bei ungleichen Größen.",
            "textEn": "Mass and speed are varied separately or jointly, including equal-energy cases with unequal quantities."
          },
          {
            "id": "direction-and-reference-frame",
            "textDe": "Die Bewegungsrichtung wird bei gleichem Betrag umgekehrt oder dieselbe Bewegung wird aus unterschiedlich bewegten Bezugssystemen beschrieben.",
            "textEn": "Direction is reversed at unchanged speed, or the same motion is described from differently moving reference frames."
          },
          {
            "id": "evidence-form",
            "textDe": "Der Zusammenhang ist symbolisch über Verhältnisse, numerisch in SI-Einheiten oder grafisch als E_k-v-Beziehung nachzuweisen.",
            "textEn": "The relationship must be demonstrated symbolically using ratios, numerically in SI units, or graphically as an E_k-versus-v relation."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "different-mass-speed-pairs-with-equal-energy",
            "taskDemandDe": "Vergleiche einen Wagen der Masse 1000 kg bei 10 m/s mit einem Fahrzeug der Masse 250 kg bei 20 m/s. Berechne beide kinetischen Energien, erkläre das Ergebnis über Masse- und Geschwindigkeitsverhältnisse und untersuche anschließend getrennt, was eine Verdopplung nur der Masse beziehungsweise nur der Geschwindigkeit bewirken würde.",
            "taskDemandEn": "Compare a 1000 kg car traveling at 10 m/s with a 250 kg vehicle traveling at 20 m/s. Calculate both kinetic energies, explain the result using mass and speed ratios, and then examine separately what would happen if only mass or only speed were doubled.",
            "expectedPerformanceDe": "Die lernende Person erhält für beide Fahrzeuge 50 kJ und erklärt, dass die vierfach größere Masse des ersten Fahrzeugs durch das Quadrat der doppelt so großen Geschwindigkeit des zweiten ausgeglichen wird. Sie folgert korrekt: doppelte Masse verdoppelt E_k, doppelte Geschwindigkeit vervierfacht E_k; gleiche Energie beweist weder gleiche Masse noch gleiche Geschwindigkeit.",
            "expectedPerformanceEn": "The learner obtains 50 kJ for both vehicles and explains that the first vehicle's fourfold larger mass is offset by the square of the second vehicle's twofold larger speed. The learner correctly concludes that doubling mass doubles E_k while doubling speed quadruples E_k, and that equal energy proves neither equal mass nor equal speed.",
            "understandingFocusDe": "Geprüft werden inverse Verhältnisargumente und die Fehlvorstellungen, kinetische Energie sei linear in v oder gleiche Energie bedeute gleiche Geschwindigkeit.",
            "understandingFocusEn": "This tests inverse ratio reasoning and the misconceptions that kinetic energy is linear in v or that equal energy implies equal speed."
          },
          {
            "id": "forward-and-backward-throw-in-a-moving-train",
            "taskDemandDe": "Ein Zug fährt im Bodensystem mit 15 m/s. Ein Ball der Masse 0,20 kg wird im Zug einmal mit 5,0 m/s in Fahrtrichtung und einmal mit 5,0 m/s entgegen der Fahrtrichtung geworfen. Bestimme für beide Würfe die kinetische Energie im Zugsystem und im Bodensystem und erkläre, welche Rolle Richtung und Bezugssystem spielen.",
            "taskDemandEn": "A train moves at 15 m/s in the ground frame. A 0.20 kg ball is thrown inside the train once at 5.0 m/s in the direction of travel and once at 5.0 m/s opposite the direction of travel. Determine the kinetic energy for both throws in the train frame and in the ground frame, and explain the roles of direction and reference frame.",
            "expectedPerformanceDe": "Die lernende Person erhält im Zugsystem für die Geschwindigkeiten +5,0 m/s und −5,0 m/s jeweils 2,5 J: Eine Richtungsumkehr bei gleichem Betrag erzeugt keine negative oder andere kinetische Energie. Im Bodensystem verwendet sie 20 m/s beziehungsweise 10 m/s und erhält 40 J beziehungsweise 10 J. Sie erklärt, dass E_k zwar skalar und nicht negativ ist, der benötigte Geschwindigkeitsbetrag aber vom gewählten Bezugssystem abhängt.",
            "expectedPerformanceEn": "In the train frame, the learner obtains 2.5 J for both +5.0 m/s and −5.0 m/s: reversing direction at unchanged speed produces neither negative nor different kinetic energy. In the ground frame the learner uses 20 m/s and 10 m/s and obtains 40 J and 10 J respectively. The learner explains that although E_k is scalar and non-negative, the required speed depends on the chosen reference frame.",
            "understandingFocusDe": "Geprüft werden Skalarität, Nichtnegativität und Bezugssystemabhängigkeit sowie die Fehlvorstellungen, eine negative Geschwindigkeitskomponente erzeuge negative kinetische Energie oder Energie sei bezugssysteminvariant.",
            "understandingFocusEn": "This tests scalar character, non-negativity, and reference-frame dependence, including the misconceptions that a negative velocity component produces negative kinetic energy or that kinetic energy is frame-invariant."
          }
        ]
      }
    },
    {
      "goalId": "e359f8bb-6106-44aa-9edf-694528d2d2a9",
      "profile": {
        "archetype": "proof",
        "expectations": [
          {
            "id": "newton-law-yields-kinetic-power-balance",
            "essentialUnderstandingDe": "Für ein festgelegtes System konstanter Masse in einem Inertialsystem wird durch das Skalarprodukt von m·dv/dt = F mit v die Beziehung dE_kin/dt = F·v sichtbar. Der Schritt verbindet die vektorielle Bewegungsgleichung mit der skalaren Änderungsrate kinetischer Energie und setzt die konstante Masse ausdrücklich voraus.",
            "essentialUnderstandingEn": "For a defined constant-mass system in an inertial frame, taking the scalar product of m·dv/dt = F with v yields dE_kin/dt = F·v. This step connects the vector equation of motion with the scalar rate of change of kinetic energy and explicitly requires constant mass.",
            "observablePerformanceDe": "Die lernende Person legt in einer unabhängig vorgelegten Bewegung System, Bezugssystem und Geschwindigkeit fest, bildet das Skalarprodukt des zweiten Newtonschen Axioms mit v, führt m·v·dv/dt als Zeitableitung von E_kin aus und begründet Vektoroperation, Einheit und Voraussetzung konstanter Masse.",
            "observablePerformanceEn": "For an independently presented motion, the learner defines the system, reference frame, and velocity, takes the scalar product of Newton's second law with v, rewrites m·v·dv/dt as the time derivative of E_kin, and justifies the vector operation, unit, and constant-mass condition."
          },
          {
            "id": "conservative-potential-cancels-kinetic-change",
            "essentialUnderstandingDe": "Für eine konservative Kraft F = −∇U mit nicht explizit zeitabhängigem Potenzial gilt entlang der Bewegung dU/dt = ∇U·v. Deshalb ist die Kraftleistung F·v = −dU/dt und die Summe E_kin + U besitzt die Änderungsrate null.",
            "essentialUnderstandingEn": "For a conservative force F = −∇U with no explicit time dependence in the potential, dU/dt = ∇U·v along the motion. Therefore the force power F·v equals −dU/dt and the sum E_kin + U has zero rate of change.",
            "observablePerformanceDe": "Die lernende Person führt für ein unbekanntes zeitunabhängiges Potenzial die Kettenregel entlang einer Bahn aus, verbindet sie mit F = −∇U, setzt beide Leistungsbeziehungen zu d(E_kin + U)/dt = 0 zusammen und interpretiert die Konstante als mechanische Energie des gewählten Systems.",
            "observablePerformanceEn": "For an unfamiliar time-independent potential, the learner applies the chain rule along a path, connects it with F = −∇U, combines the two power relations into d(E_kin + U)/dt = 0, and interprets the constant as the mechanical energy of the chosen system."
          },
          {
            "id": "conservation-claim-depends-on-explicit-conditions",
            "essentialUnderstandingDe": "Die Schlussfolgerung gilt nur innerhalb der benannten Modellbedingungen: konstante Masse, Inertialsystem, ausschließlich konservative Kräfte im betrachteten mechanischen System und kein explizit zeitabhängiges Potenzial. Nichtkonservative Kräfte oder ein zeitabhängiges Potenzial führen zu einem Energieaustausch beziehungsweise Zusatzterm und nicht zu unveränderter mechanischer Energie.",
            "essentialUnderstandingEn": "The conclusion holds only under the stated model conditions: constant mass, an inertial frame, exclusively conservative forces in the mechanical system under consideration, and no explicit time dependence of the potential. Non-conservative forces or a time-dependent potential introduce energy transfer or an additional term rather than unchanged mechanical energy.",
            "observablePerformanceDe": "Die lernende Person prüft bei einem neuen Kraftmodell jede Herleitungsvoraussetzung, lokalisiert bei Reibung oder U(x,t) den nicht mehr gültigen Schritt und formuliert aus der gegebenen Kraft oder Zeitabhängigkeit die Richtung beziehungsweise den Term der mechanischen Energieänderung.",
            "observablePerformanceEn": "For a fresh force model, the learner checks every premise of the derivation, locates the step that fails when friction or U(x,t) is present, and uses the supplied force or time dependence to state the direction or term of the mechanical-energy change."
          },
          {
            "id": "derived-conservation-supports-bounded-prediction",
            "essentialUnderstandingDe": "Die hergeleitete Konstante erlaubt innerhalb ihres Gültigkeitsbereichs physikalische Vorhersagen über zugängliche Orte, Geschwindigkeiten und Umkehrpunkte. Eine solche Vorhersage muss zur Potenzialreferenz, zu E_kin ≥ 0, zu Einheiten und zu Grenzfällen passen; sie ist keine allgemeine Aussage für beliebige äußere Einwirkung.",
            "essentialUnderstandingEn": "Within its domain of validity, the derived constant supports physical predictions about accessible positions, speeds, and turning points. Such a prediction must be consistent with the potential reference, E_kin ≥ 0, units, and limiting cases; it is not a general statement for arbitrary external action.",
            "observablePerformanceDe": "Aus einem frischen Potenzialverlauf und einer Anfangsbedingung bestimmt die lernende Person qualitativ oder quantitativ zugängliche Bereiche und einen Umkehrpunkt, prüft die Energiebilanz auf Einheiten und Plausibilität und benennt, welche Änderung der Modellbedingungen diese Vorhersage ungültig machen würde.",
            "observablePerformanceEn": "From a fresh potential curve and initial condition, the learner determines qualitatively or quantitatively the accessible region and a turning point, checks the energy balance for units and plausibility, and states which change in model conditions would invalidate the prediction."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "newton-law-yields-kinetic-power-balance",
            "conservative-potential-cancels-kinetic-change",
            "conservation-claim-depends-on-explicit-conditions",
            "derived-conservation-supports-bounded-prediction"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 3,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "potential-and-force-geometry",
            "textDe": "Eindimensionales U(x), zweidimensionales U(x,y), lineare Gewichtskraft oder nichtlineare konservative Kraft",
            "textEn": "One-dimensional U(x), two-dimensional U(x,y), uniform gravitational force, or nonlinear conservative force"
          },
          {
            "id": "validity-condition",
            "textDe": "Nur konservative Kräfte, zusätzliche Reibung, explizit zeitabhängiges Potenzial oder veränderliche Systemmasse als zu prüfende Modellgrenze",
            "textEn": "Conservative forces only, added friction, explicitly time-dependent potential, or changing system mass as a model boundary to be checked"
          },
          {
            "id": "representation-chain",
            "textDe": "Vektorielles Kraftfeld, Bewegungsgleichung, Potenzialkurve, Bahn oder Energie-Zeit-Darstellung",
            "textEn": "Vector force field, equation of motion, potential curve, trajectory, or energy-time representation"
          },
          {
            "id": "independent-demand",
            "textDe": "Herleitung, Voraussetzungenprüfung, Fehlerdiagnose oder begrenzte Vorhersage aus der hergeleiteten Erhaltung",
            "textEn": "Derivation, audit of assumptions, diagnosis of a failed step, or bounded prediction from the derived conservation law"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "particle-in-supplied-one-dimensional-potential",
            "taskDemandDe": "Ein Teilchen konstanter Masse bewegt sich in einem bereitgestellten glatten, zeitunabhängigen Potenzial U(x). Leite aus m·dv/dt = −dU/dx die Erhaltung von E_kin + U her, markiere für eine gegebene Anfangsenergie die zugänglichen Bereiche und bestimme einen Umkehrpunkt aus dem Potenzial statt aus einer auswendig gelernten Spezialformel.",
            "taskDemandEn": "A constant-mass particle moves in a supplied smooth, time-independent potential U(x). Derive conservation of E_kin + U from m·dv/dt = −dU/dx, mark the accessible regions for a given initial energy, and determine a turning point from the potential rather than from a memorized special-case formula.",
            "expectedPerformanceDe": "Die lernende Person führt Skalarprodukt beziehungsweise eindimensionale Multiplikation und Kettenregel vollständig aus, erhält d(E_kin + U)/dt = 0, nennt konstante Masse, konservative Kraft und Zeitunabhängigkeit und nutzt E_kin ≥ 0 für die markierten Bereiche und den Umkehrpunkt.",
            "expectedPerformanceEn": "The learner carries out the scalar-product or one-dimensional multiplication and chain rule completely, obtains d(E_kin + U)/dt = 0, states constant mass, conservative force, and time independence, and uses E_kin ≥ 0 to identify the regions and turning point.",
            "understandingFocusDe": "Der Fall verbindet die allgemeine Herleitung mit der physikalischen Bedeutung der Energiefläche, ohne auf ein bekanntes Standardproblem beschränkt zu bleiben.",
            "understandingFocusEn": "The case connects the general derivation with the physical meaning of the energy landscape without restricting it to a familiar standard problem."
          },
          {
            "id": "two-dimensional-conservative-field-path",
            "taskDemandDe": "Für ein vorgegebenes zweidimensionales Potenzial U(x,y) und eine Bahn v(t) ist F = −∇U angegeben. Stelle die Leistungsbilanz vektoriell auf, zeige die Wegunabhängigkeit der mechanischen Energieänderung zwischen zwei markierten Punkten und prüfe die Aussage an einem Grenzfall mit v = 0.",
            "taskDemandEn": "For a supplied two-dimensional potential U(x,y) and a path v(t), F = −∇U is given. Set up the power balance in vector form, show the path independence of the mechanical-energy change between two marked points, and check the statement in a limiting case with v = 0.",
            "expectedPerformanceDe": "Die lernende Person nutzt ∇U·v als totale Zeitableitung entlang der Bahn, kombiniert sie mit F·v, erhält eine konstante Summe und erklärt, dass v = 0 momentane Nullleistung bedeutet, ohne daraus allgemein verschwindende Kraft oder konstantes Potenzial zu folgern.",
            "expectedPerformanceEn": "The learner uses ∇U·v as the total time derivative along the path, combines it with F·v, obtains a constant sum, and explains that v = 0 means zero instantaneous power without inferring zero force or a constant potential in general.",
            "understandingFocusDe": "Die neue Geometrie prüft, ob Gradient, Skalarprodukt und Energiebeziehung verstanden und nicht nur in einer Raumrichtung reproduziert werden.",
            "understandingFocusEn": "The changed geometry tests whether gradient, scalar product, and the energy relation are understood rather than reproduced only in one dimension."
          },
          {
            "id": "damped-motion-breaks-mechanical-conservation",
            "taskDemandDe": "Ein unabhängiger Modellfall ergänzt zur konservativen Kraft −∇U eine lineare Reibungskraft −b·v. Untersuche die ursprüngliche Herleitung, bestimme d(E_kin + U)/dt und erkläre für b > 0 die Richtung des Energieaustauschs und die Systemgrenze.",
            "taskDemandEn": "An independent model case adds a linear drag force −b·v to the conservative force −∇U. Examine the original derivation, determine d(E_kin + U)/dt, and explain for b > 0 the direction of energy transfer and the system boundary.",
            "expectedPerformanceDe": "Die lernende Person behält für den konservativen Anteil die Aufhebung bei, ergänzt die Leistung −b·v², erhält d(E_kin + U)/dt = −b·v² und deutet die Abnahme als Übertragung aus der betrachteten mechanischen Energie, statt den Erhaltungssatz trotz verletzter Voraussetzung weiter anzuwenden.",
            "expectedPerformanceEn": "The learner retains the cancellation for the conservative part, adds the power −b·v², obtains d(E_kin + U)/dt = −b·v², and interprets the decrease as transfer out of the mechanical energy under consideration instead of continuing to apply conservation after its condition has failed.",
            "understandingFocusDe": "Der Reibungsfall erzwingt Transfer auf eine geänderte Kraftart und lokalisiert genau die Gültigkeitsgrenze der Herleitung.",
            "understandingFocusEn": "The drag case requires transfer to a changed force type and locates the exact validity boundary of the derivation."
          }
        ]
      }
    },
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
      "goalId": "68c90ba6-c438-463c-9a53-cf61062d416a",
      "profile": {
        "archetype": "representation",
        "expectations": [
          {
            "id": "frame-choice-and-relative-quantity",
            "essentialUnderstandingDe": "Eine Geschwindigkeit beschreibt die Bewegung eines Körpers relativ zu einem gewählten Bezugssystem. Welche Geschwindigkeit erklärt werden soll, bestimmt daher, welche Körper, Beobachter und Bezugssysteme unterschieden und welcher Bezug begründet gewählt werden müssen.",
            "essentialUnderstandingEn": "A velocity describes the motion of a body relative to a chosen reference frame. The velocity to be explained therefore determines which bodies, observers, and frames must be distinguished and which reference must be chosen with justification.",
            "observablePerformanceDe": "Die lernende Person kennzeichnet in einer neuen Bewegungssituation die beteiligten Körper und Bezugssysteme, formuliert die gesuchte relative Geschwindigkeit und wählt ein Bezugssystem, dessen Eignung sie für diese Frage begründet.",
            "observablePerformanceEn": "In a new motion situation, the learner identifies the bodies and reference frames involved, states the relative velocity being sought, and chooses a frame whose suitability is justified for that question."
          },
          {
            "id": "directed-vector-combination",
            "essentialUnderstandingDe": "Relativgeschwindigkeiten sind gerichtete Größen. Die Geschwindigkeit eines Körpers in einem gewählten Bezugssystem ergibt sich aus einer konsistent gerichteten Vektor- oder Komponentenüberlagerung, sodass Vorzeichen, Richtung und Betrag zur beschriebenen Bewegung passen müssen.",
            "essentialUnderstandingEn": "Relative velocities are directed quantities. The velocity of a body in a chosen frame results from a consistently directed vector or component combination, so sign, direction, and magnitude must fit the motion being described.",
            "observablePerformanceDe": "Die lernende Person konstruiert oder erläutert passende Geschwindigkeitsvektoren beziehungsweise Komponenten, überlagert sie nachvollziehbar und prüft das Ergebnis durch eine qualitative Richtungsprognose und eine Erklärung aus dem gewählten Bezugssystem.",
            "observablePerformanceEn": "The learner constructs or explains suitable velocity vectors or components, combines them transparently, and checks the result through a qualitative direction prediction and an explanation from the chosen reference frame."
          },
          {
            "id": "changed-observer-transfer",
            "essentialUnderstandingDe": "Bei einem Wechsel des Beobachterbezugs oder bei nicht parallelen Bewegungen muss die Bewegungsbeschreibung neu aus den relativen Vektoren aufgebaut werden. Unterschiedliche Geschwindigkeitsangaben sind dann verschiedene, jeweils konsistente Beschreibungen derselben Bewegung und kein Widerspruch.",
            "essentialUnderstandingEn": "When the observer frame changes or the motions are not parallel, the motion description must be rebuilt from the relative vectors. Different velocity statements are then different, internally consistent descriptions of the same motion rather than a contradiction.",
            "observablePerformanceDe": "Für einen veränderten Beobachter oder eine zweidimensionale Bewegungsanordnung sagt die lernende Person zunächst die erwartete Bewegungsrichtung voraus, bestimmt anschließend die resultierende Geschwindigkeit und erklärt, warum sich ihre Beschreibung gegenüber einem anderen Bezugssystem ändert.",
            "observablePerformanceEn": "For a changed observer or a two-dimensional motion arrangement, the learner first predicts the expected direction of motion, then determines the resulting velocity and explains why its description changes relative to another reference frame."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "frame-choice-and-relative-quantity",
            "directed-vector-combination",
            "changed-observer-transfer"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "observer-frame",
            "textDe": "Ufer-, Fahrzeug- oder mitbewegtes Bezugssystem mit jeweils anderer gesuchter Relativgeschwindigkeit",
            "textEn": "Shore, vehicle, or co-moving reference frame with a different relative velocity sought in each case"
          },
          {
            "id": "motion-geometry",
            "textDe": "Parallele Bewegungen auf einer Linie oder nicht parallele Bewegungen mit zwei Komponenten",
            "textEn": "Parallel motions on one line or non-parallel motions with two components"
          },
          {
            "id": "available-representation",
            "textDe": "Verbale Situationsbeschreibung, Vektorskizze oder tabellarisch gegebene Komponenten, die erst einer Bewegungsbeschreibung zugeordnet werden müssen",
            "textEn": "Verbal situation description, vector sketch, or tabulated components that must first be assigned to a motion description"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "walker-on-moving-train",
            "taskDemandDe": "Ein Zug fährt gleichförmig mit 18 m/s nach Osten. Eine Person geht im Zug mit 1,5 m/s nach Osten. Beschreibe die Geschwindigkeit der Person aus Sicht des Zuges und aus Sicht des Bodens, kennzeichne die Bezugssysteme und begründe die jeweilige Vektorüberlagerung.",
            "taskDemandEn": "A train travels uniformly eastward at 18 m/s. A person walks eastward in the train at 1.5 m/s. Describe the person's velocity from the train and ground frames, identify the reference frames, and justify the vector combination in each case.",
            "expectedPerformanceDe": "Die lernende Person trennt Gehgeschwindigkeit relativ zum Zug und Zuggeschwindigkeit relativ zum Boden, ordnet beide gerichteten Größen derselben Ost-Richtung zu, bestimmt 1,5 m/s beziehungsweise 19,5 m/s in den passenden Bezugssystemen und erklärt, warum beide Angaben gleichzeitig zutreffen.",
            "expectedPerformanceEn": "The learner separates walking velocity relative to the train from train velocity relative to the ground, assigns both directed quantities to the same eastward direction, determines 1.5 m/s and 19.5 m/s in the appropriate frames, and explains why both statements are simultaneously valid.",
            "understandingFocusDe": "Der lineare Fall prüft die explizite Referenzwahl und die Bedeutung der relativen Größen, nicht bloß eine Addition ohne Bezug.",
            "understandingFocusEn": "The one-dimensional case tests explicit frame selection and the meaning of relative quantities, not merely addition without a reference."
          },
          {
            "id": "boat-crossing-current",
            "taskDemandDe": "Ein Boot bewegt sich relativ zum Wasser mit 3,0 m/s senkrecht zum Ufer nach Norden; die Strömung bewegt das Wasser mit 2,0 m/s nach Osten relativ zum Ufer. Zeichne oder beschreibe die Geschwindigkeitsvektoren, sage die Fahrtrichtung relativ zum Ufer voraus und bestimme die resultierende Geschwindigkeit des Boots relativ zum Ufer.",
            "taskDemandEn": "A boat moves northward, perpendicular to the shore, at 3.0 m/s relative to the water; the current moves the water eastward at 2.0 m/s relative to the shore. Draw or describe the velocity vectors, predict the direction of travel relative to the shore, and determine the boat's resulting velocity relative to the shore.",
            "expectedPerformanceDe": "Die lernende Person benennt Wasser und Ufer als verschiedene Bezugssysteme, überlagert einen Nord- und einen Ost-Vektor zu den Komponenten (2,0; 3,0) m/s, bestimmt den Betrag √13 m/s ≈ 3,61 m/s und die Richtung 33,7° östlich von Nord und gibt beide nur zusammen mit dem Bezugssystem an.",
            "expectedPerformanceEn": "The learner identifies water and shore as different reference frames, combines a northward and an eastward vector into components (2.0; 3.0) m/s, determines the magnitude √13 m/s ≈ 3.61 m/s and the direction 33.7° east of north, and states both only together with the reference frame.",
            "understandingFocusDe": "Der neue zweidimensionale Fall prüft unabhängigen Transfer der gerichteten Überlagerung statt Wiedererkennen einer vorgegebenen Darstellung.",
            "understandingFocusEn": "The fresh two-dimensional case tests independent transfer of directed combination rather than recognition of a supplied representation."
          }
        ]
      }
    },
    {
      "goalId": "ec7a0a68-730b-5c94-ac72-a937508f8303",
      "profile": {
        "archetype": "concept",
        "expectations": [
          {
            "id": "distinguish-angular-and-tangential-meaning",
            "essentialUnderstandingDe": "Die Winkelgeschwindigkeit beschreibt die Winkeländerung pro Zeit, während die Bahngeschwindigkeit die pro Zeit entlang der Kreisbahn zurückgelegte Strecke beschreibt und tangential zur Bahn gerichtet ist. Die Größen haben deshalb unterschiedliche Bedeutungen und Einheiten.",
            "essentialUnderstandingEn": "Angular speed describes angular change per unit time, whereas tangential speed describes distance travelled along the circular path per unit time and is directed tangentially to the path. The quantities therefore have different meanings and units.",
            "observablePerformanceDe": "Die lernende Person bestimmt aus einer neuen Kreisbewegung passende Winkeländerungen, Bogenlängen und Zeiten, definiert daraus ω und v mit Einheiten und erklärt an der Bewegungsgeometrie die tangentiale Richtung von v.",
            "observablePerformanceEn": "From a new circular motion, the learner identifies appropriate angular changes, arc lengths, and times, defines ω and v with units, and explains from the motion geometry why v is tangential."
          },
          {
            "id": "derive-and-interpret-radius-relation",
            "essentialUnderstandingDe": "Für denselben durchlaufenen Winkel gilt s = rφ. Aus den zeitbezogenen Größen folgt daher v = ωr: Bei gleicher Winkelgeschwindigkeit ist die Bahngeschwindigkeit an einem größeren Radius größer, weil pro Zeit eine längere Bogenstrecke zurückgelegt wird.",
            "essentialUnderstandingEn": "For the same angle swept out, s = rφ. The time-based quantities therefore give v = ωr: at the same angular speed, tangential speed is greater at a larger radius because a longer arc distance is travelled per unit time.",
            "observablePerformanceDe": "Die lernende Person leitet v = ωr aus Bogenlänge und Zeit her, nutzt dabei konsistente Winkel- und Längeneinheiten und erklärt vor einer Rechnung, welche Größe sich bei geändertem Radius oder geänderter Winkelgeschwindigkeit wie verändert.",
            "observablePerformanceEn": "The learner derives v = ωr from arc length and time, uses consistent angular and length units, and explains before calculating how a quantity changes when radius or angular speed changes."
          },
          {
            "id": "same-rotation-fresh-transfer",
            "essentialUnderstandingDe": "Punkte eines starren rotierenden Körpers haben dieselbe Winkelgeschwindigkeit, aber bei unterschiedlichen Radien unterschiedliche Bahngeschwindigkeiten. Wird statt der Winkelgeschwindigkeit die Umlaufzeit festgehalten, beschreibt sie dieselbe Drehung pro Zeit und muss mit dem Radius zusammen gedacht werden.",
            "essentialUnderstandingEn": "Points on a rigid rotating body have the same angular speed but different tangential speeds at different radii. When the period rather than angular speed is held fixed, it describes the same rotation per unit time and must be considered together with radius.",
            "observablePerformanceDe": "Die lernende Person vergleicht in einem neuen Rotationsfall Punkte mit verschiedenen Radien oder Bewegungen mit gleicher Umlaufzeit, sagt Gleichheiten und Unterschiede begründet voraus und überprüft diese anschließend mit v = ωr oder einer äquivalent hergeleiteten Beziehung.",
            "observablePerformanceEn": "In a new rotation case, the learner compares points at different radii or motions with the same period, predicts equalities and differences with justification, and then checks them using v = ωr or an equivalently derived relationship."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "distinguish-angular-and-tangential-meaning",
            "derive-and-interpret-radius-relation",
            "same-rotation-fresh-transfer"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "radius-position",
            "textDe": "Punkte nahe der Achse oder am Rand desselben starren rotierenden Körpers",
            "textEn": "Points near the axis or at the rim of the same rigid rotating body"
          },
          {
            "id": "fixed-quantity",
            "textDe": "Gleiche Winkelgeschwindigkeit, gleiche Umlaufzeit oder gleiche Bahngeschwindigkeit bei verändertem Radius",
            "textEn": "Same angular speed, same period, or same tangential speed with a changed radius"
          },
          {
            "id": "motion-information",
            "textDe": "Gegebene Winkeländerung und Zeit, Anzahl von Umdrehungen pro Zeit oder gegebene Bogenlänge mit Zeit",
            "textEn": "Given angular change and time, number of revolutions per time, or given arc length with time"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "two-points-on-turntable",
            "taskDemandDe": "Eine starre Drehscheibe vollführt 0,80 Umdrehungen pro Sekunde. Punkt A liegt 0,10 m, Punkt B 0,30 m von der Achse entfernt. Bestimme für beide Punkte die Winkelgeschwindigkeit und die Bahngeschwindigkeit, erkläre die Einheiten und begründe ohne bloße Zahleneinsetzung, warum nur eine der beiden Größen für A und B gleich ist.",
            "taskDemandEn": "A rigid turntable completes 0.80 revolutions per second. Point A is 0.10 m and point B is 0.30 m from the axis. Determine angular speed and tangential speed for both points, explain the units, and justify without mere numerical substitution why only one of the two quantities is the same for A and B.",
            "expectedPerformanceDe": "Die lernende Person wandelt die gemeinsame Drehung pro Zeit in ω = 1,6π rad/s für beide Punkte um, bestimmt mit v = ωr vA = 0,16π m/s ≈ 0,503 m/s und vB = 0,48π m/s ≈ 1,51 m/s, nennt rad/s und m/s passend und erklärt die Differenz über die verschieden langen Bogenstrecken pro Zeit.",
            "expectedPerformanceEn": "The learner converts the common rotation per time into ω = 1.6π rad/s for both points, determines vA = 0.16π m/s ≈ 0.503 m/s and vB = 0.48π m/s ≈ 1.51 m/s using v = ωr, uses rad/s and m/s appropriately, and explains the difference through the different arc distances travelled per unit time.",
            "understandingFocusDe": "Der Fall prüft die begriffliche Unterscheidung und die Radiusstruktur an einem gemeinsamen Rotationssystem.",
            "understandingFocusEn": "The case tests the conceptual distinction and radius structure within one common rotation system."
          },
          {
            "id": "rotating-drum-period-change",
            "taskDemandDe": "Eine Trommel mit Radius 0,25 m benötigt für eine Umdrehung 0,50 s. Danach wird bei unverändertem Radius die Umlaufzeit auf 1,0 s verändert. Leite aus einer Umdrehung die Beziehung zwischen Umlaufzeit, Winkel- und Bahngeschwindigkeit her, sage die Änderungen voraus und bestimme die neuen Größen.",
            "taskDemandEn": "A drum of radius 0.25 m takes 0.50 s for one revolution. The period is then changed to 1.0 s while the radius remains unchanged. Derive the relationship between period, angular speed, and tangential speed from one revolution, predict the changes, and determine the new quantities.",
            "expectedPerformanceDe": "Die lernende Person ordnet einer Umdrehung 2π rad und eine Bogenlänge 2πr zu, bestimmt zunächst ω = 4π rad/s und v = π m/s, erklärt, dass bei verdoppelter Umlaufzeit sowohl ω als auch v halbiert werden, und bestimmt danach ω = 2π rad/s und v = π/2 m/s mit konsistenten Einheiten und tangentialer Bewegungsrichtung.",
            "expectedPerformanceEn": "The learner assigns 2π rad and an arc length of 2πr to one revolution, first determines ω = 4π rad/s and v = π m/s, explains that doubling the period halves both ω and v, and then determines ω = 2π rad/s and v = π/2 m/s with consistent units and tangential direction of motion.",
            "understandingFocusDe": "Der veränderte Zeitbezug erzwingt Transfer von der Radiusvariation auf dieselbe zugrunde liegende Beziehung zwischen Winkel, Weg und Zeit.",
            "understandingFocusEn": "The changed time basis requires transfer from radius variation to the same underlying relationship among angle, distance, and time."
          }
        ]
      }
    },
    {
      "goalId": "30ddb2d7-b991-55fe-9e74-37ffe1048f9f",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "explicit-one-dimensional-model",
            "essentialUnderstandingDe": "Ein einfaches Modell geradliniger Bewegung legt System, Bewegungsachse, positive Richtung und vereinfachende Annahmen fest. Bewegungsgleichungen mit konstanter Beschleunigung gelten nur in einem Zeitabschnitt, in dem Masse und resultierende Kraft beziehungsweise Beschleunigung als konstant behandelt werden dürfen.",
            "essentialUnderstandingEn": "A simple model of rectilinear motion specifies the system, motion axis, positive direction, and simplifying assumptions. Constant-acceleration equations apply only over an interval in which mass and the net force or acceleration may be treated as constant.",
            "observablePerformanceDe": "Die lernende Person benennt für eine neue Reibungssituation den betrachteten Körper, wählt eine Achse und positive Richtung, nennt die für das einfache Modell vernachlässigten oder konstant gesetzten Größen und begrenzt die verwendete Bewegungsgleichung auf den passenden Zeitabschnitt.",
            "observablePerformanceEn": "For a new friction situation, the learner identifies the body considered, chooses an axis and positive direction, states which quantities are neglected or held constant in the simple model, and limits the equation of motion to the appropriate time interval."
          },
          {
            "id": "directed-force-balance-to-acceleration",
            "essentialUnderstandingDe": "Betrag und Richtung jeder Kraft werden relativ zur gewählten Achse durch Vorzeichen erfasst. Ihre gerichtete Summe ist die resultierende Kraft und bestimmt über F_res = ma Betrag und Richtung der Beschleunigung; die Reibungsrichtung folgt dem jeweiligen relativen Gleiten.",
            "essentialUnderstandingEn": "The magnitude and direction of each force are represented by signs relative to the chosen axis. Their directed sum is the net force and, through F_net = ma, determines the magnitude and direction of acceleration; the friction direction follows the current relative sliding.",
            "observablePerformanceDe": "Die lernende Person erstellt eine richtungskonsistente Kräftebilanz, bestimmt resultierende Kraft und Beschleunigung mit Vorzeichen und Einheiten und prüft ihre Richtung an einem Kraftbild oder einer verbalen Prognose.",
            "observablePerformanceEn": "The learner constructs a direction-consistent force balance, determines net force and acceleration with signs and units, and checks their direction against a force diagram or verbal prediction."
          },
          {
            "id": "connect-acceleration-and-motion-course",
            "essentialUnderstandingDe": "Die Beschleunigungsrichtung allein gibt nicht die momentane Bewegungsrichtung an. Beschleunigung gleichgerichtet zur Geschwindigkeit vergrößert deren Betrag, entgegengerichtete Beschleunigung verringert ihn; beim Stillstand oder Richtungswechsel muss die Reibungsrichtung und damit gegebenenfalls das Gleichungsstück neu bestimmt werden.",
            "essentialUnderstandingEn": "The acceleration direction alone does not give the current direction of motion. Acceleration in the same direction as velocity increases its magnitude, whereas opposite acceleration decreases it; at rest or reversal, the friction direction and hence, where necessary, the equation segment must be determined anew.",
            "observablePerformanceDe": "Die lernende Person nutzt passende einfache Bewegungsgleichungen, um Geschwindigkeit und Ort qualitativ oder quantitativ vorherzusagen, vergleicht dabei die Vorzeichen von Geschwindigkeit und Beschleunigung und erkennt einen Zeitpunkt, an dem das bisherige Modellstück wegen Stillstand oder Richtungswechsel neu angesetzt werden muss.",
            "observablePerformanceEn": "The learner uses appropriate simple equations of motion to predict velocity and position qualitatively or quantitatively, compares the signs of velocity and acceleration, and identifies a time at which the current model segment must be reformulated because of stopping or reversal."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "explicit-one-dimensional-model",
            "directed-force-balance-to-acceleration",
            "connect-acceleration-and-motion-course"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "initial-motion",
            "textDe": "Start aus der Ruhe oder Anfangsgeschwindigkeit gleich- beziehungsweise entgegengerichtet zur Beschleunigung",
            "textEn": "Start from rest or initial velocity in the same or opposite direction as acceleration"
          },
          {
            "id": "directed-force-balance",
            "textDe": "Zugkraft größer, gleich oder kleiner als die entgegengerichtete Reibungskraft",
            "textEn": "Pulling force greater than, equal to, or smaller than the opposing frictional force"
          },
          {
            "id": "model-interval",
            "textDe": "Ein Zeitabschnitt mit konstanter Kraftrichtung oder ein Richtungswechsel, an dem Reibung und Gleichung neu angesetzt werden müssen",
            "textEn": "One interval with constant force direction or a reversal at which friction and the equation must be reformulated"
          },
          {
            "id": "representation-check",
            "textDe": "Kräftebild, Geschwindigkeits-Zeit-Verlauf oder verbale Bewegungsprognose als unabhängige Kontrolle",
            "textEn": "Force diagram, velocity-time course, or verbal motion prediction as an independent check"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "sled-pulled-from-rest",
            "taskDemandDe": "Ein Schlitten der Masse 3,0 kg startet auf einer horizontalen Strecke aus der Ruhe. Eine konstante Zugkraft von 12 N wirkt nach rechts, die Gleitreibung von 3 N nach links. Wähle eine Achse, formuliere die Modellannahmen, bilanziere die Kräfte und sage mit passenden einfachen Bewegungsgleichungen Geschwindigkeit und Ort nach 2,0 s voraus. Prüfe Richtung, Vorzeichen und Einheiten.",
            "taskDemandEn": "A 3.0 kg sled starts from rest on a horizontal track. A constant pulling force of 12 N acts to the right and sliding friction of 3 N to the left. Choose an axis, state the model assumptions, balance the forces, and use appropriate simple equations of motion to predict velocity and position after 2.0 s. Check direction, signs, and units.",
            "expectedPerformanceDe": "Die lernende Person wählt rechts positiv, behandelt Schlitten, Masse und horizontale Kräfte im betrachteten Zeitintervall als konstant und erhält F_res = 9 N sowie a = 3,0 m/s² nach rechts. Mit v_0 = 0 bestimmt sie v(2 s) = 6,0 m/s und x(2 s) - x_0 = 6,0 m. Kraftbild, positive Ergebnisse und Einheiten stimmen mit der qualitativen Prognose einer beschleunigten Bewegung nach rechts überein.",
            "expectedPerformanceEn": "The learner chooses right as positive, treats the sled, mass, and horizontal forces as constant over the interval considered, and obtains F_net = 9 N and a = 3.0 m/s² to the right. With v_0 = 0, the learner determines v(2 s) = 6.0 m/s and x(2 s) - x_0 = 6.0 m. The force diagram, positive results, and units agree with the qualitative prediction of accelerated motion to the right.",
            "understandingFocusDe": "Der direkte Fall prüft die vollständige Kette von Modellannahmen über gerichtete Kräftebilanz bis zur konsistenten Bewegungsprognose, nicht bloß das Einsetzen in eine Formel.",
            "understandingFocusEn": "The direct case tests the complete chain from modelling assumptions through directed force balance to a consistent motion prediction, not merely substitution into a formula."
          },
          {
            "id": "cart-stops-and-reverses",
            "taskDemandDe": "Ein Wagen der Masse 4,0 kg gleitet anfangs mit v_0 = -4,0 m/s nach links. Eine konstante äußere Kraft von 6 N wirkt nach rechts; die Gleitreibung hat den Betrag 2 N und wirkt jeweils entgegen der Bewegung relativ zum Boden. Rechts sei positiv. Sage den Bewegungsverlauf voraus, bestimme den Stillstandszeitpunkt und erkläre, wie Kräftebilanz und Bewegungsgleichung bei einer anschließenden Bewegung nach rechts neu angesetzt werden müssen.",
            "taskDemandEn": "A 4.0 kg cart initially slides to the left with v_0 = -4.0 m/s. A constant external force of 6 N acts to the right; sliding friction has magnitude 2 N and always acts opposite the motion relative to the ground. Take right as positive. Predict the course of motion, determine the stopping time, and explain how the force balance and equation of motion must be reformulated if motion subsequently proceeds to the right.",
            "expectedPerformanceDe": "Solange der Wagen nach links gleitet, wirken äußere Kraft und Reibung beide nach rechts: F_res = 8 N, a = 2,0 m/s² und v(t) = -4,0 m/s + 2,0 m/s² · t. Die Geschwindigkeit ist zunächst negativ und nimmt im Betrag ab; bei t = 2,0 s steht der Wagen. Für anschließendes Gleiten nach rechts kehrt die Reibung ihre Richtung um, sodass F_res = 6 N - 2 N = 4 N und a = 1,0 m/s² gelten; die zweite Gleichung beginnt am Übergangszeitpunkt mit den dortigen Anfangswerten.",
            "expectedPerformanceEn": "While the cart slides left, the external force and friction both act to the right: F_net = 8 N, a = 2.0 m/s², and v(t) = -4.0 m/s + 2.0 m/s² · t. The velocity is initially negative and decreases in magnitude; the cart stops at t = 2.0 s. For subsequent sliding to the right, friction reverses direction, so F_net = 6 N - 2 N = 4 N and a = 1.0 m/s²; the second equation begins at the transition time with the values then applicable.",
            "understandingFocusDe": "Der unabhängige Transfer trennt Bewegungs- und Beschleunigungsrichtung und erzwingt beim Richtungswechsel eine neue Reibungsrichtung sowie ein neues gültiges Modellstück.",
            "understandingFocusEn": "The independent transfer separates velocity and acceleration directions and requires a new friction direction and a new valid model segment at reversal."
          }
        ]
      }
    },
    {
      "goalId": "ac25ffe3-fd42-592d-a937-79cc13460313",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "construct-finite-difference-motion-model",
            "essentialUnderstandingDe": "Ein Differenzenmodell ersetzt die kontinuierliche Bewegung durch endliche Schritte. Anfangswerte und ein ausdrücklich gewähltes Aktualisierungsschema, etwa v_{i+1} = v_i + a_iΔt und x_{i+1} = x_i + v_iΔt, legen fest, wie Kräfte beziehungsweise Beschleunigungen in neue Zustände überführt werden; Zellbezüge müssen beim Kopieren die beabsichtigten Größen festhalten.",
            "essentialUnderstandingEn": "A finite-difference model replaces continuous motion with finite steps. Initial values and an explicitly chosen update scheme, such as v_{i+1} = v_i + a_iΔt and x_{i+1} = x_i + v_iΔt, specify how forces or accelerations produce new states; cell references must preserve the intended quantities when copied.",
            "observablePerformanceDe": "Die lernende Person richtet selbstständig Spalten für t, x, v, a beziehungsweise Kräfte ein, trägt Anfangsbedingungen ein, formuliert konsistente rekursive Zellformeln mit Einheiten und erklärt die zeitliche Bedeutung einer Tabellenzeile.",
            "observablePerformanceEn": "The learner independently sets up columns for t, x, v, a or forces, enters initial conditions, writes consistent recursive cell formulas with units, and explains the temporal meaning of one spreadsheet row."
          },
          {
            "id": "validate-vary-and-limit-model",
            "essentialUnderstandingDe": "Ein Simulationsergebnis ist vom physikalischen Modell und vom numerischen Zeitschritt abhängig. Systematisches Variieren jeweils eines Parameters, Vergleich mit einem bekannten Grenz- oder Referenzfall und Verkleinern von Δt zeigen Robustheit oder numerische Abweichung; Übereinstimmung ersetzt keine Prüfung der Modellannahmen.",
            "essentialUnderstandingEn": "A simulation result depends on both the physical model and the numerical time step. Systematically varying one parameter at a time, comparison with a known limiting or reference case, and reducing Δt reveal robustness or numerical error; agreement does not replace checking the model assumptions.",
            "observablePerformanceDe": "Die lernende Person führt einen kontrollierten Parametervergleich und mindestens eine Zeitschrittverfeinerung durch, interpretiert Bewegungsverlauf und Konvergenztendenz und benennt eine konkrete physikalische Annahme, bei deren Verletzung das Modell unzuverlässig wird.",
            "observablePerformanceEn": "The learner performs a controlled parameter comparison and at least one time-step refinement, interprets the motion and convergence trend, and identifies a specific physical assumption whose violation would make the model unreliable."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "construct-finite-difference-motion-model",
            "validate-vary-and-limit-model"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "acceleration-model",
            "textDe": "Konstante Beschleunigung mit analytischer Referenz und geschwindigkeitsabhängige Beschleunigung ohne einfache Schrittformel werden variiert.",
            "textEn": "Constant acceleration with an analytical reference and velocity-dependent acceleration without a simple closed-step formula are varied."
          },
          {
            "id": "time-step",
            "textDe": "Mindestens zwei, besser drei halbierte Zeitschritte werden bei unveränderten physikalischen Parametern verglichen.",
            "textEn": "At least two, preferably three halved time steps are compared with unchanged physical parameters."
          },
          {
            "id": "physical-parameter",
            "textDe": "Masse, Beschleunigung oder Widerstandsparameter wird einzeln variiert, während die übrigen Größen kontrolliert bleiben.",
            "textEn": "Mass, acceleration, or drag parameter is varied individually while the remaining quantities stay controlled."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "constant-acceleration-benchmark",
            "taskDemandDe": "Erstelle in einer Tabellenkalkulation für x₀ = 0, v₀ = 0 und a = 2,0 m/s² ein explizites Euler-Modell mit v_{i+1} = v_i + aΔt und x_{i+1} = x_i + v_iΔt bis t = 2,0 s. Vergleiche Δt = 0,50 s und 0,25 s mit der analytischen Lösung, erkläre die Abweichung von x und sage die Wirkung einer weiteren Halbierung voraus.",
            "taskDemandEn": "In a spreadsheet, build an explicit Euler model for x₀ = 0, v₀ = 0, and a = 2.0 m/s² using v_{i+1} = v_i + aΔt and x_{i+1} = x_i + v_iΔt up to t = 2.0 s. Compare Δt = 0.50 s and 0.25 s with the analytical solution, explain the discrepancy in x, and predict the effect of another halving.",
            "expectedPerformanceDe": "Die lernende Person dokumentiert Anfangszeile und rekursive Formeln, erhält für beide Schritte v(2 s) = 4,0 m/s, aber x = 3,0 m beziehungsweise 3,5 m statt analytisch 4,0 m. Sie erklärt, dass die linke Intervallsgeschwindigkeit die Wegzunahme unterschätzt und dass kleinere Δt das Ergebnis gegen 4,0 m konvergieren lässt, ohne das konkrete Euler-Schema zu verschweigen.",
            "expectedPerformanceEn": "The learner documents the initial row and recursive formulas and obtains v(2 s) = 4.0 m/s for both steps but x = 3.0 m and 3.5 m respectively instead of the analytical 4.0 m. The learner explains that the left-endpoint velocity underestimates the displacement increment and that smaller Δt makes the result converge toward 4.0 m, while explicitly naming the Euler scheme used.",
            "understandingFocusDe": "Der Referenzfall trennt korrekte Tabellenlogik, numerischen Fehler und physikalisches Modell.",
            "understandingFocusEn": "The reference case separates correct spreadsheet logic, numerical error, and the physical model."
          },
          {
            "id": "fall-with-linear-drag-transfer",
            "taskDemandDe": "Modelliere einen Fall nach unten positiv mit x₀ = 0, m = 1,0 kg, v₀ = 0, g = 9,81 m/s² und linearer Widerstandskraft F_W = −kv, also a_i = g − kv_i/m. Simuliere zunächst mit k = 1,0 kg/s bis t = 5,0 s für Δt = 0,20 s und 0,10 s. Variiere danach nur k auf 2,0 kg/s, vergleiche die Geschwindigkeits-Zeit-Verläufe zu gleichen Zeiten und prüfe sie am erwarteten Grenzwert v_grenz = mg/k. Benenne eine Grenze des linearen Widerstandsmodells.",
            "taskDemandEn": "Model a fall with downward positive using x₀ = 0, m = 1.0 kg, v₀ = 0, g = 9.81 m/s², and linear drag F_D = −kv, so a_i = g − kv_i/m. First simulate with k = 1.0 kg/s up to t = 5.0 s for Δt = 0.20 s and 0.10 s. Then vary only k to 2.0 kg/s, compare the velocity-time curves at equal times, and check them against the expected limit v_terminal = mg/k. State one limitation of the linear-drag model.",
            "expectedPerformanceDe": "Die lernende Person berechnet in jeder Zeile zunächst a aus dem aktuellen v und aktualisiert danach v und x nach dem angegebenen Schema. Für k = 1,0 kg/s nähern sich beide Schrittweiten dem Grenzwert 9,81 m/s; bei gleicher Auswertezeit liegt Δt = 0,10 s näher am Referenz- beziehungsweise Konvergenzverlauf. Für k = 2,0 kg/s sinkt die Grenzgeschwindigkeit auf 4,905 m/s und die Zeitkonstante verändert sich. Sie nennt etwa die Annahme linearer statt quadratischer Widerstandskraft oder konstante Luft- und Körperparameter als Modellgrenze.",
            "expectedPerformanceEn": "In each row, the learner first calculates a from the current v and then updates v and x according to the stated scheme. For k = 1.0 kg/s, both step sizes approach the terminal speed 9.81 m/s; at equal evaluation times, Δt = 0.10 s is closer to the reference or convergence course. For k = 2.0 kg/s, terminal speed falls to 4.905 m/s and the time constant changes. The learner identifies, for example, the assumption of linear rather than quadratic drag or constant air and body parameters as a model limitation.",
            "understandingFocusDe": "Der Transfer prüft variable Kräfte, kontrollierte Parametervariation, Grenzfall und Modellkritik jenseits des analytischen Schulfalls.",
            "understandingFocusEn": "The transfer tests variable forces, controlled parameter variation, a limiting case, and model critique beyond the analytical classroom case."
          }
        ]
      }
    },
    {
      "goalId": "156edddc-ce8d-580d-8d17-d9376d59e60e",
      "profile": {
        "archetype": "representation",
        "expectations": [
          {
            "id": "selected-blind-review-core",
            "essentialUnderstandingDe": "Das Gravitationsfeld ordnet jedem Ort einen Vektor g zu. Im idealisierten Probekörpermodell gilt g = F_G/m_P, sodass das Feld am Ort von der erzeugenden Massenverteilung und nicht von der Masse des Probekörpers abhängt. Bei einer zentralen Masse zeigt g radial nach innen; Feldlinien stellen diese Richtung dar und sind keine materiellen Bahnen.",
            "essentialUnderstandingEn": "The gravitational field assigns a vector g to every position. In the idealized test-body model, g = F_G/m_P, so the field at a position depends on the source mass distribution rather than on the test body's mass. Around a central mass, g points radially inward; field lines represent this direction and are not material paths.",
            "observablePerformanceDe": "Die lernende Person zeichnet selbstständig für vorgegebene Orte um eine zentrale Masse passende Feldvektoren und ein radialsymmetrisches, nach innen gerichtetes Feldlinienbild, erläutert die Richtungsinformation der Darstellung und verbindet unterschiedliche Kräfte auf Probekörper über F_G = m_P g mit demselben örtlichen Feldvektor.",
            "observablePerformanceEn": "The learner independently draws appropriate field vectors and a radially symmetric, inward-pointing field-line diagram for given positions around a central mass, explains the directional information encoded by the representation, and relates different forces on test bodies through F_G = m_P g to the same local field vector."
          },
          {
            "id": "local-field-is-independent-of-test-body-mass",
            "essentialUnderstandingDe": "Zwei ideale Probekörper verschiedener Masse bestimmen am selben Ort denselben Feldvektor g, obwohl auf sie verschieden große Gravitationskräfte wirken. Die Division durch die jeweilige Probekörpermasse trennt die Eigenschaft des Feldortes von der Eigenschaft des eingesetzten Probekörpers.",
            "essentialUnderstandingEn": "Two ideal test bodies of different mass determine the same field vector g at the same position even though the gravitational forces on them have different magnitudes. Dividing by each test-body mass separates the property of the field position from the property of the chosen test body.",
            "observablePerformanceDe": "Die lernende Person vergleicht an einem unveränderten Feldort mindestens zwei Probekörpermassen, ordnet den unterschiedlichen Kraftvektoren denselben Quotientenvektor g zu und korrigiert eine Darstellung, die die Feldpfeillänge fälschlich von der Probekörpermasse abhängig macht.",
            "observablePerformanceEn": "At one unchanged field position, the learner compares at least two test-body masses, assigns the same quotient vector g to the different force vectors, and corrects a representation that incorrectly makes the field-arrow length depend on test-body mass."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "selected-blind-review-core",
            "local-field-is-independent-of-test-body-mass"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "central-mass-position",
            "textDe": "Die zentrale Masse liegt im Ursprung, außerhalb des Ursprungs oder in einer gedrehten Darstellung.",
            "textEn": "The central mass is at the origin, away from the origin, or in a rotated diagram."
          },
          {
            "id": "test-body-mass-and-force",
            "textDe": "Am selben Ort werden verschiedene Probekörpermassen und entsprechend verschiedene Kraftbeträge verglichen.",
            "textEn": "Different test-body masses and corresponding force magnitudes are compared at the same position."
          },
          {
            "id": "representation-and-error-type",
            "textDe": "Die Evidenz wechselt zwischen Einzelvektoren, Feldlinienbild, verbaler Erklärung und Fehleranalyse.",
            "textEn": "Evidence varies among individual vectors, a field-line diagram, verbal explanation, and error analysis."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "shifted-central-mass-with-two-test-bodies",
            "taskDemandDe": "Eine zentrale Masse liegt an einem neuen Punkt eines Koordinatensystems. Markiere an vier unsymmetrisch gewählten Orten die Richtung von g und zeichne daraus ein radialsymmetrisches Feldlinienbild. Am selben fünften Ort werden nacheinander Probekörper der Massen m und 3m eingesetzt; erläutere mit F_G = m_P g, wie sich Kraft- und Feldvektor unterscheiden.",
            "taskDemandEn": "A central mass is located at a new point in a coordinate system. Mark the direction of g at four asymmetrically chosen positions and use them to draw a radially symmetric field-line diagram. Test bodies of masses m and 3m are then placed successively at the same fifth position; use F_G = m_P g to explain how the force and field vectors differ.",
            "expectedPerformanceDe": "Die lernende Person richtet jeden g-Pfeil auf die zentrale Masse, führt die Feldlinien radial nach innen und verwechselt sie nicht mit Umlaufbahnen. Für die beiden Probekörper zeichnet oder beschreibt sie bei identischem g einen dreifachen Kraftbetrag für 3m und zeigt, dass die Division durch die jeweilige Masse wieder denselben örtlichen Feldvektor ergibt.",
            "expectedPerformanceEn": "The learner directs every g arrow toward the central mass, draws the field lines radially inward, and does not confuse them with orbits. For the two test bodies, the learner draws or describes a threefold force magnitude for 3m at identical g and shows that division by the respective mass yields the same local field vector.",
            "understandingFocusDe": "Geprüft werden neue räumliche Konstruktion, Richtungsinformation und die Trennung zwischen Feldgröße und Probekörperkraft.",
            "understandingFocusEn": "This tests construction in a new spatial arrangement, directional information, and the distinction between field quantity and test-body force."
          },
          {
            "id": "audit-three-flawed-field-representations",
            "taskDemandDe": "Drei fremde Skizzen zeigen ein Zentralfeld: In einer weisen die Linien nach außen, in einer erhalten schwere Probekörper am selben Ort längere g-Pfeile, und in einer werden geschlossene Feldlinien als mögliche Umlaufbahnen gezeichnet. Benenne und korrigiere jeden Fehler und begründe die Korrektur mit Feldrichtung beziehungsweise g = F_G/m_P.",
            "taskDemandEn": "Three unfamiliar sketches show a central field: in one the lines point outward, in one heavier test bodies at the same position receive longer g arrows, and in one closed field lines are drawn as possible orbits. Identify and correct each error and justify the correction using the field direction or g = F_G/m_P.",
            "expectedPerformanceDe": "Die lernende Person ersetzt auswärts gerichtete durch radial einwärts gerichtete Linien, zeichnet am selben Ort unabhängig von der Probekörpermasse denselben g-Pfeil und trennt Feldlinien ausdrücklich von Bewegungsbahnen. Sie erklärt zugleich, dass die Kraft auf den schwereren Probekörper größer sein kann, ohne dass sich dadurch das vorgegebene Feld ändert.",
            "expectedPerformanceEn": "The learner replaces outward-pointing lines with radially inward-pointing ones, draws the same g arrow at the same position independently of test-body mass, and explicitly separates field lines from trajectories. The learner also explains that the force on the heavier test body can be larger without changing the given field.",
            "understandingFocusDe": "Geprüft werden drei typische Fehlvorstellungen in einer neuen Darstellung statt bloßer Reproduktion eines bekannten Bildes.",
            "understandingFocusEn": "This tests three common misconceptions in a new representation rather than reproduction of a familiar image."
          }
        ]
      }
    },
    {
      "goalId": "eb0ffdea-c12d-56df-b7e8-c0297d2f8aff",
      "profile": {
        "archetype": "procedure",
        "expectations": [
          {
            "id": "field-force",
            "essentialUnderstandingDe": "Außerhalb einer kugelsymmetrischen Masse gilt F=GMm/r² und g=F/m=GM/r²; Gewichtskraft mg hängt von Ort und Probemasse ab.",
            "essentialUnderstandingEn": "Outside a spherically symmetric mass, F=GMm/r² and g=F/m=GM/r²; weight mg depends on position and test mass.",
            "observablePerformanceDe": "Die lernende Person leitet F=mg aus dem Gravitationsgesetz her, benennt r als Mittelpunktabstand und bestimmt Kräfte mit Einheiten und Richtung.",
            "observablePerformanceEn": "The learner derives F=mg from the gravitational law, identifies r as centre-to-centre distance and determines forces with units and direction."
          },
          {
            "id": "changed-position",
            "essentialUnderstandingDe": "Eine veränderte Höhe verändert die Feldstärke, nicht die Masse des betrachteten Körpers.",
            "essentialUnderstandingEn": "A change in altitude changes field strength, not the mass of the object.",
            "observablePerformanceDe": "Die lernende Person übersetzt Höhe in Mittelpunktabstand und begründet eine Kraftänderung anhand der inversen quadratischen Abhängigkeit.",
            "observablePerformanceEn": "The learner converts altitude into centre-to-centre distance and justifies a force change using the inverse-square relationship."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "field-force",
            "changed-position"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "given-quantity",
            "textDe": "Wechsel von gegebener lokaler Feldstärke zu einer Höhenänderung über einer kugelförmigen Welt.",
            "textEn": "Change from a supplied local field strength to an altitude change above a spherical world."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "local-field",
            "taskDemandDe": "Auf einem gedachten kugelförmigen Planeten beträgt g am Messort 6 N/kg. Erläutere aus dem Gravitationsgesetz die Kraft auf eine Masse von 3 kg und auf eine zweite von 6 kg.",
            "taskDemandEn": "At a measurement location on an idealized spherical planet, g is 6 N/kg. Use the gravitational law to explain the force on a 3 kg mass and on a second 6 kg mass.",
            "expectedPerformanceDe": "Aus GMm/r²=m(GM/r²)=mg folgen 18 N und 36 N zum Planetenmittelpunkt; g ist an demselben Ort gleich und hat die Einheit N/kg.",
            "expectedPerformanceEn": "GMm/r²=m(GM/r²)=mg gives 18 N and 36 N towards the planet centre; g is the same at that location and has units N/kg.",
            "understandingFocusDe": "Zusammenhang von Gravitationsgesetz, Feldstärke und Gewichtskraft, nicht nur Einsetzen.",
            "understandingFocusEn": "Relationship between the gravitational law, field strength and weight, not substitution alone."
          },
          {
            "id": "altitude-radius",
            "taskDemandDe": "Ein Körper mit 4 kg erfährt an der Oberfläche eines Planeten mit Radius R und g=8 N/kg Gravitation. Vergleiche den Fall mit einer Höhe R über der Oberfläche; vernachlässige Rotation.",
            "taskDemandEn": "A 4 kg object experiences gravity at the surface of a planet of radius R with g=8 N/kg. Compare this with an altitude R above the surface; neglect rotation.",
            "expectedPerformanceDe": "Die Abstände sind R und 2R, daher g oben 2 N/kg und F 8 N statt 32 N. Die Masse bleibt 4 kg. Die Höhe allein ist kein zulässiges r.",
            "expectedPerformanceEn": "The distances are R and 2R, so g at altitude is 2 N/kg and F is 8 N instead of 32 N. Mass remains 4 kg. Altitude alone is not a valid r.",
            "understandingFocusDe": "Mittelpunktabstand und Feldänderung als physikalische Grenze einer mechanischen Formelverwendung.",
            "understandingFocusEn": "Centre-to-centre distance and field change as the physical limit of mechanical formula use."
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
      "goalId": "16caf92e-2800-57d1-946c-5b92ce848a96",
      "profile": {
        "archetype": "proof",
        "expectations": [
          {
            "id": "torque-area",
            "essentialUnderstandingDe": "Für eine konstante Masse und ein festes Kraftzentrum in einem Inertialsystem gilt r×F=0, daher L konstant und dA/dt=|L|/(2m).",
            "essentialUnderstandingEn": "For constant mass and a fixed force centre in an inertial frame, r×F=0, hence L is constant and dA/dt=|L|/(2m).",
            "observablePerformanceDe": "Die lernende Person entwickelt die Herleitung aus m r̈=F(r,t), begründet den Flächenfaktor 1/2 und erklärt gleiche Flächen in gleichen Zeiten.",
            "observablePerformanceEn": "The learner develops the derivation from m r̈=F(r,t), justifies the area factor 1/2 and explains equal areas in equal times."
          },
          {
            "id": "central-condition",
            "essentialUnderstandingDe": "Für den Flächensatz ist die Zentralrichtung der Kraft entscheidend, nicht speziell das inverse Quadratgesetz.",
            "essentialUnderstandingEn": "The central direction of force is essential to the area law, not specifically the inverse-square law.",
            "observablePerformanceDe": "Die lernende Person prüft die Herleitung bei veränderter radialer Kraft und zeigt, an welcher Stelle ein tangentialer Zusatzantrieb sie unterbricht.",
            "observablePerformanceEn": "The learner checks the derivation for changed radial force and identifies where an additional tangential thrust breaks it."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "torque-area",
            "central-condition"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "force-direction",
            "textDe": "Änderung des radialen Kraftbetrags gegenüber Hinzufügen einer tangentialen Kraftkomponente.",
            "textEn": "Change radial force magnitude versus adding a tangential force component."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "derive-and-check",
            "taskDemandDe": "Leite für einen kleinen Körper im Zentralfeld den Flächensatz aus der Bewegungsgleichung her. An zwei Bahnscheiteln seien r₁=2 m, r₂=5 m und v₁=5 m/s. Bestimme v₂ und die Flächengeschwindigkeit.",
            "taskDemandEn": "Derive the area law from the equation of motion for a small body in a central field. At two apsides let r₁=2 m, r₂=5 m and v₁=5 m/s. Determine v₂ and areal velocity.",
            "expectedPerformanceDe": "Aus r×F=0 folgt L konstant; dA/dt=rv_quer/2. An den Scheiteln sind r und v senkrecht, daher v₂=2 m/s und dA/dt=5 m²/s an beiden Orten.",
            "expectedPerformanceEn": "r×F=0 implies constant L; dA/dt=rv_transverse/2. At apsides r and v are perpendicular, giving v₂=2 m/s and dA/dt=5 m²/s at both positions.",
            "understandingFocusDe": "Die Zahlen folgen aus der hergeleiteten Erhaltung und der geometrischen Flächenbeziehung.",
            "understandingFocusEn": "The numbers follow from the derived conservation law and geometric area relation."
          },
          {
            "id": "central-versus-thrust",
            "taskDemandDe": "Prüfe denselben Beweis erst für eine zeitlich wechselnde, stets radiale Kraft und dann für einen kurzen tangentialen Schub. Ist in beiden Fällen konstante Flächengeschwindigkeit begründet?",
            "taskDemandEn": "Check the same proof first for a time-varying but always radial force and then for a brief tangential thrust. Is constant areal velocity justified in both cases?",
            "expectedPerformanceDe": "Die radiale Kraft hat weiterhin kein Drehmoment um das feste Zentrum, also bleibt L erhalten. Der tangentiale Schub liefert r×F≠0 und verändert L; über diesen Eingriff hinweg folgt keine konstante Flächengeschwindigkeit.",
            "expectedPerformanceEn": "The radial force still has zero torque about the fixed centre, so L remains conserved. Tangential thrust gives r×F≠0 and changes L; constant areal velocity does not follow across that intervention.",
            "understandingFocusDe": "Beweisvoraussetzung statt bloßes Wiederholen eines Kepler-Merksatzes.",
            "understandingFocusEn": "Proof premise rather than repetition of a memorized Kepler statement."
          }
        ]
      }
    },
    {
      "goalId": "e713dc34-beeb-5807-8a90-f872e049aa4e",
      "profile": {
        "archetype": "concept",
        "expectations": [
          {
            "id": "physical-understanding",
            "essentialUnderstandingDe": "Entropie ist eine Zustandsgröße; ihre Änderung zwischen denselben Gleichgewichtszuständen ist wegunabhängig. In dS = δQ_rev/T ist die Wärme des reversiblen Berechnungsweges und die jeweilige absolute Temperatur gemeint, nicht beliebige tatsächlich übertragene Wärme.",
            "essentialUnderstandingEn": "Entropy is a state variable; its change between the same equilibrium states is path-independent. In dS = δQ_rev/T, the heat of the reversible calculation path and its local absolute temperature are meant, not arbitrary heat actually transferred.",
            "observablePerformanceDe": "Die lernende Person wählt zu beschriebenen Anfangs- und Endzuständen eigenständig einen passenden reversiblen Ersatzweg, erläutert die Bedeutung von δQ_rev und T und begründet, weshalb der berechnete Entropieunterschied auch für einen irreversiblen realen Weg gilt.",
            "observablePerformanceEn": "Given initial and final states, the learner independently selects a suitable reversible substitute path, explains the meaning of δQ_rev and T, and justifies why the calculated entropy difference also applies to an irreversible actual path."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "physical-understanding"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "changed-physical-condition",
            "textDe": "Gleiche Gleichgewichts-Endpunkte bei verschiedenen tatsächlichen Prozesswegen.",
            "textEn": "Identical equilibrium endpoints with different actual process paths."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "fresh-independent-case",
            "taskDemandDe": "Eine feste Menge klassischen idealen Gases expandiert frei in einem isolierten geschlossenen Gefäß von V nach 2V; Anfangs- und Endzustand sind Gleichgewichtszustände bei derselben Temperatur T. Entwirf selbst einen reversiblen Ersatzweg zwischen genau diesen Zuständen, benutze dS=δQ_rev/T zur Bestimmung von ΔS und vergleiche die Wärme auf beiden Wegen.",
            "taskDemandEn": "A fixed amount of classical ideal gas freely expands inside an isolated closed vessel from V to 2V; the initial and final states are equilibrium states at the same temperature T. Independently construct a reversible substitute path between exactly these states, use dS=δQ_rev/T to determine ΔS, and compare the heat along both paths.",
            "expectedPerformanceDe": "Die lernende Person wählt eine reversible isotherme Expansion, begründet Q_real=0 und Q_rev>0 und gewinnt ΔS=nR ln 2>0 durch Integration oder eine gleichwertig begründete Clausius-Anwendung. Sie erklärt, dass gleiche Endpunkte gleiche ΔS, aber nicht gleiche Q verlangen.",
            "expectedPerformanceEn": "The learner selects a reversible isothermal expansion, justifies Q_actual=0 and Q_rev>0, and obtains ΔS=nR ln 2>0 by integration or an equivalently justified application of Clausius's relation. They explain that identical endpoints require equal ΔS but not equal Q.",
            "understandingFocusDe": "Entropie ist eine Zustandsgröße; ihre Änderung zwischen denselben Gleichgewichtszuständen ist wegunabhängig. In dS = δQ_rev/T ist die Wärme des reversiblen Berechnungsweges und die jeweilige absolute Temperatur gemeint, nicht beliebige tatsächlich übertragene Wärme.",
            "understandingFocusEn": "Entropy is a state variable; its change between the same equilibrium states is path-independent. In dS = δQ_rev/T, the heat of the reversible calculation path and its local absolute temperature are meant, not arbitrary heat actually transferred."
          },
          {
            "id": "independent-changed-case",
            "taskDemandDe": "Ein fester Körper mit konstanter Wärmekapazität C wird von T_1 auf T_2>T_1 erwärmt, real durch Kontakt mit einem deutlich heißeren Reservoir. Konstruiere einen reversiblen Vergleichsweg, erläutere die Rolle der veränderlichen Temperatur im Quotienten δQ_rev/T und bestimme ΔS. Begründe, warum Q_real/T_2 im Allgemeinen nicht das Ergebnis liefert.",
            "taskDemandEn": "A solid body with constant heat capacity C is heated from T_1 to T_2>T_1 by actual contact with a substantially hotter reservoir. Construct a reversible comparison path, explain the role of the changing temperature in δQ_rev/T, and determine ΔS. Justify why Q_actual/T_2 generally does not give the result.",
            "expectedPerformanceDe": "Die lernende Person beschreibt infinitesimale Wärmeübertragung bei jeweils nahezu gleicher Temperatur, setzt δQ_rev=C dT an und erhält ΔS=C ln(T_2/T_1). Sie begründet die Integration über T und die Zustandsabhängigkeit von ΔS trotz irreversibler tatsächlicher Erwärmung.",
            "expectedPerformanceEn": "The learner describes infinitesimal heat transfer at successively nearly equal temperatures, uses δQ_rev=C dT and obtains ΔS=C ln(T_2/T_1). They justify integrating over T and the state dependence of ΔS despite actual irreversible heating.",
            "understandingFocusDe": "Entropie als Zustandsgröße erlaubt einen reversiblen Ersatzweg; eine wechselnde Temperatur darf nicht unbesehen durch einen Endwert ersetzt werden.",
            "understandingFocusEn": "Entropy as a state variable permits a reversible substitute path; a varying temperature must not be replaced indiscriminately by an endpoint value."
          }
        ]
      }
    },
    {
      "goalId": "eaef821b-4dbe-52a4-a0e2-574e5ce2040d",
      "profile": {
        "archetype": "procedure",
        "expectations": [
          {
            "id": "physical-understanding",
            "essentialUnderstandingDe": "Für dieselbe Menge idealen Gases bei gleicher Anfangs- und Endtemperatur hängt ΔS logarithmisch vom Volumenverhältnis ab. Expansion ergibt eine positive, Kompression eine negative Gasentropieänderung; der dimensionslose Logarithmus und nR ergeben insgesamt J/K.",
            "essentialUnderstandingEn": "For the same amount of ideal gas at equal initial and final temperatures, ΔS depends logarithmically on the volume ratio. Expansion gives a positive and compression a negative gas entropy change; the dimensionless logarithm and nR give J/K overall.",
            "observablePerformanceDe": "Die lernende Person erkennt eigenständig die isothermen Randbedingungen eines gegebenen Gasprozesses, sagt das Vorzeichen von ΔS vor der Rechnung voraus, berechnet die Änderung und erklärt die Rolle des konstanten T trotz seines Fehlens in der speziellen Formel.",
            "observablePerformanceEn": "The learner independently identifies the isothermal conditions of a supplied gas process, predicts the sign of ΔS before calculating it, computes the change, and explains the role of constant T despite its absence from the special formula."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "physical-understanding"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "changed-physical-condition",
            "textDe": "Expansion versus Kompression; gleiche versus veränderte Endtemperatur bei festem n.",
            "textEn": "Expansion versus compression; unchanged versus changed final temperature at fixed n."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "fresh-independent-case",
            "taskDemandDe": "Eine feste Menge idealen Gases wird isotherm auf das doppelte Volumen gebracht und anschließend isotherm zurückkomprimiert. Wähle die passende Entropiebeziehung, bestimme die beiden Änderungen symbolisch und erläutere deren Vorzeichen und Summe. Benenne n, R, V und T, prüfe die Einheit und erkläre, warum konstante Temperatur trotz fehlendem T in der Spezialformel vorausgesetzt wird.",
            "taskDemandEn": "A fixed amount of ideal gas is taken isothermally to twice its volume and then compressed isothermally back. Select the appropriate entropy relation, determine both changes symbolically, and explain their signs and sum. Identify n, R, V and T, check the unit, and explain why constant temperature is assumed even though T does not appear in the special formula.",
            "expectedPerformanceDe": "Die lernende Person wählt ΔS=nR ln(V_2/V_1), prognostiziert die Vorzeichen und erhält nR ln 2 sowie −nR ln 2 mit Summe null. Sie erklärt n als Stoffmenge, R als molare Gaskonstante, V als Volumen und T als absolute Temperatur; der Logarithmus ist dimensionslos, ΔS hat die Einheit J/K und die feste Gasmenge kehrt bei gleichem T zum Anfangszustand zurück.",
            "expectedPerformanceEn": "The learner selects ΔS=nR ln(V_2/V_1), predicts the signs and obtains nR ln 2 and −nR ln 2, summing to zero. They identify n as amount of substance, R as the molar gas constant, V as volume and T as absolute temperature; the logarithm is dimensionless, ΔS is in J/K and the fixed gas amount returns to its initial state at equal T.",
            "understandingFocusDe": "Für dieselbe Menge idealen Gases bei gleicher Anfangs- und Endtemperatur hängt ΔS logarithmisch vom Volumenverhältnis ab. Expansion ergibt eine positive, Kompression eine negative Gasentropieänderung; der dimensionslose Logarithmus und nR ergeben insgesamt J/K.",
            "understandingFocusEn": "For the same amount of ideal gas at equal initial and final temperatures, ΔS depends logarithmically on the volume ratio. Expansion gives a positive and compression a negative gas entropy change; the dimensionless logarithm and nR give J/K overall."
          },
          {
            "id": "independent-changed-case",
            "taskDemandDe": "In einer neuen Aufgabe vergleicht die lernende Person eine Expansion mit einer Kompression und einen isothermen mit einem zusätzlich erwärmten Endzustand. Sie begründet, für welchen Fall allein der Volumenterm genügt und wo die Temperaturänderung berücksichtigt werden muss.",
            "taskDemandEn": "In a fresh task, the learner compares expansion with compression and an isothermal endpoint with an additionally heated endpoint. They justify when the volume term alone suffices and when the temperature change must be included.",
            "expectedPerformanceDe": "In einer neuen Aufgabe vergleicht die lernende Person eine Expansion mit einer Kompression und einen isothermen mit einem zusätzlich erwärmten Endzustand. Sie begründet, für welchen Fall allein der Volumenterm genügt und wo die Temperaturänderung berücksichtigt werden muss.",
            "expectedPerformanceEn": "In a fresh task, the learner compares expansion with compression and an isothermal endpoint with an additionally heated endpoint. They justify when the volume term alone suffices and when the temperature change must be included.",
            "understandingFocusDe": "Isotherme Expansion versus Kompression; gleiche versus veränderte Endtemperatur bei fester Gasmenge.",
            "understandingFocusEn": "Isothermal expansion versus compression; unchanged versus changed final temperature at a fixed amount of gas."
          }
        ]
      }
    },
    {
      "goalId": "b6dfd3e6-2dd3-5983-9a27-7e7db70e8db8",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "physical-understanding",
            "essentialUnderstandingDe": "Ω zählt die zum festgelegten Makrozustand gehörenden Mikrozustände, nicht die Makrozustände. Bei gleich wahrscheinlichen unabhängigen Links-rechts-Zuordnungen steigt die Multiplikität zum ausgeglichenen Bereich; für große N sind annähernd ausgeglichene Makrozustände zusammen sehr viel wahrscheinlicher als stark einseitige.",
            "essentialUnderstandingEn": "Ω counts the microstates belonging to a specified macrostate, not the macrostates. For equally likely independent left-right assignments, multiplicity grows toward the balanced region; for large N, approximately balanced macrostates taken together are much more likely than strongly one-sided ones.",
            "observablePerformanceDe": "Die lernende Person begründet im abgegrenzten Zählmodell feste Teilchenzahl, unabhängige Zuordnungen und Gleichwahrscheinlichkeit, konstruiert eigene Zählungen und Entropievergleiche und prüft die Vorhersage annähernder Gleichverteilung gegen die gewonnenen Multiplikitäten sowie die Grenze bei ungleichen Teilvolumina.",
            "observablePerformanceEn": "The learner justifies fixed particle number, independent assignments and equal likelihood in the defined counting model, constructs their own counts and entropy comparisons, and checks the approximate-balance prediction against the resulting multiplicities and the limitation for unequal subvolumes."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "physical-understanding"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "changed-physical-condition",
            "textDe": "Kleine versus große Teilchenzahl; exakte Mitte versus annähernd ausgeglichener Bereich.",
            "textEn": "Small versus large particle number; exact midpoint versus an approximately balanced range."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "fresh-independent-case",
            "taskDemandDe": "Vier markierte Teilchen befinden sich in einem geschlossenen Modell mit zwei gleich großen Raumhälften; die unabhängigen Links-rechts-Zuordnungen seien gleich wahrscheinlich. Begründe dieses Zählmodell, zähle ohne Vorlage die Fälle für n_links=0,1,2 und alle möglichen Zuordnungen und vergleiche die Entropien. Beurteile aus Deiner Zählung, ob exakte Gleichverteilung überwältigend wahrscheinlich ist.",
            "taskDemandEn": "Four labeled particles occupy a closed model with two equal-volume halves; independent left-right assignments are equally likely. Justify this counting model, count without a template the cases for n_left=0,1,2 and all possible assignments, and compare the entropies. Use your own count to assess whether exact balance is overwhelmingly probable.",
            "expectedPerformanceDe": "Die lernende Person begründet die zwei gleich wahrscheinlichen unabhängigen Raummöglichkeiten pro Teilchen, gewinnt Ω=1,4,6 bei insgesamt 16 Zuordnungen und vergleicht S=0,k_B ln 4,k_B ln 6 relativ zum selben Bezug. Sie deutet 6/16 als größte einzelne, aber nicht überwältigende Wahrscheinlichkeit und nennt die Modellbedingungen.",
            "expectedPerformanceEn": "The learner justifies two equally likely independent spatial possibilities per particle, obtains Ω=1,4,6 out of 16 total assignments and compares S=0,k_B ln 4,k_B ln 6 with the same reference. They interpret 6/16 as the largest individual but not overwhelming probability and state the model conditions.",
            "understandingFocusDe": "Ω zählt die zum festgelegten Makrozustand gehörenden Mikrozustände, nicht die Makrozustände. Bei gleich wahrscheinlichen unabhängigen Links-rechts-Zuordnungen steigt die Multiplikität zum ausgeglichenen Bereich; für große N sind annähernd ausgeglichene Makrozustände zusammen sehr viel wahrscheinlicher als stark einseitige.",
            "understandingFocusEn": "Ω counts the microstates belonging to a specified macrostate, not the macrostates. For equally likely independent left-right assignments, multiplicity grows toward the balanced region; for large N, approximately balanced macrostates taken together are much more likely than strongly one-sided ones."
          },
          {
            "id": "independent-changed-case",
            "taskDemandDe": "Ein frisches Modell hat fünf markierte Teilchen in zwei gleich großen Hälften mit unabhängigen gleich wahrscheinlichen Links-rechts-Zuordnungen. Als annähernd ausgeglichen gelten n_links=2 oder 3. Vergleiche diesen Bereich mit den beiden einseitigen Zuständen und erkläre, warum exakte Halbierung hier unmöglich ist. Beurteile außerdem, welche Wahrscheinlichkeitsaussagen bei ungleichen Raumhälften neu geprüft werden müssten. Übertrage die Zählidee anschließend auf deutlich größere Teilchenzahlen: Begründe mithilfe von Ω=binom(N,n), warum ein Bereich annähernd gleicher Besetzungen gegenüber stark einseitigen Besetzungen überwiegt und warum daraus keine Wahrscheinlichkeit nahe 1 für genau n=N/2 folgt. Eine vollständige Aufzählung oder asymptotische Rechnung ist nicht verlangt.",
            "taskDemandEn": "A fresh model has five labeled particles in two equal-volume halves with independent equally likely left-right assignments. Approximate balance means n_left=2 or 3. Compare this range with the two one-sided states and explain why exact halving is impossible here. Also assess which probability claims would need reconsideration for unequal-volume halves. Then extend the counting idea to substantially larger particle numbers: use Ω=binom(N,n) to explain why a range of approximately equal occupancies predominates over strongly one-sided occupancies and why this does not imply a probability near 1 for exactly n=N/2. A complete enumeration or asymptotic calculation is not required.",
            "expectedPerformanceDe": "Die lernende Person erhält 10+10=20 von 32 Zuordnungen im ausgeglichenen Bereich gegenüber 1+1=2 einseitigen. Sie trennt den Bereich von einem einzelnen Makrozustand, vergleicht dessen jeweilige Entropie über k_B ln Ω und erklärt, dass ungleiche Teilvolumina die gleiche Wahrscheinlichkeit jeder Links-rechts-Zuordnung aufheben. Für größere N begründet sie mit der kombinatorisch größeren Zahl von Zuordnungen im zentralen Besetzungsbereich dessen Überwiegen gegenüber stark einseitigen Besetzungen. Sie unterscheidet die zusammengefasste Wahrscheinlichkeit eines Bereichs von der Wahrscheinlichkeit eines einzelnen exakten Makrozustands und behauptet für Letztere keine Annäherung an 1.",
            "expectedPerformanceEn": "The learner obtains 10+10=20 out of 32 assignments in the balanced range versus 1+1=2 one-sided assignments. They distinguish the range from one macrostate, compare each macrostate's entropy through k_B ln Ω, and explain that unequal subvolumes remove equal probability of every left-right assignment. For larger N, they explain the predominance of the central occupancy range over strongly one-sided occupancies through its combinatorially larger number of assignments. They distinguish the combined probability of a range from the probability of one exact macrostate and do not claim that the latter approaches 1.",
            "understandingFocusDe": "Kleine versus große Teilchenzahl; exakte Mitte versus annähernd ausgeglichener Bereich.",
            "understandingFocusEn": "Small versus large particle number; exact midpoint versus an approximately balanced range."
          }
        ]
      }
    },
    {
      "goalId": "bbee4c52-4e95-5529-990f-706aa99316a3",
      "profile": {
        "archetype": "concept",
        "expectations": [
          {
            "id": "interpret-average-current",
            "essentialUnderstandingDe": "Die mittlere Stromstärke ist die netto durch einen festgelegten Querschnitt in einem festgelegten Zeitintervall transportierte Ladung, I = ΔQ/Δt. Die Bezugsrichtung bestimmt das Vorzeichen; 1 A und 1 C/s sind dieselbe Einheit.",
            "essentialUnderstandingEn": "Average current is the net charge transported through a specified cross-section in a specified interval, I = ΔQ/Δt. The reference direction determines the sign; 1 A and 1 C/s are the same unit.",
            "observablePerformanceDe": "Die lernende Person markiert Querschnitt, Zeitintervall und Richtung, berechnet I mit Einheit und erklärt das Ergebnis als Ladungsmenge pro Zeit statt nur als Zahlenwert.",
            "observablePerformanceEn": "The learner marks the cross-section, interval, and direction, calculates I with units, and explains the result as charge per time rather than only as a number."
          },
          {
            "id": "compare-intervals-and-rearrange",
            "essentialUnderstandingDe": "Bei zeitlich ungleichmäßigem Transport hängt der Mittelwert vom gewählten Intervall ab. Gleiche Gesamtladung kann bei anderer Dauer eine andere mittlere Stromstärke bedeuten; die Beziehung kann physikalisch nach Q oder t umgestellt werden.",
            "essentialUnderstandingEn": "For time-varying transfer, the average depends on the chosen interval. Equal total charge can imply a different average current over a different duration; the relation can be physically rearranged for Q or t.",
            "observablePerformanceDe": "Die lernende Person bestimmt aus Ladungs-Zeit-Daten mehrere Mittelwerte, vergleicht sie, kehrt die Beziehung für eine neue Zielgröße um und begründet Vorzeichen und Intervallwahl.",
            "observablePerformanceEn": "The learner determines several averages from charge-time data, compares them, rearranges the relation for a fresh target quantity, and justifies sign and interval choice."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "interpret-average-current",
            "compare-intervals-and-rearrange"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "time-profile",
            "textDe": "Gleichmäßiger oder gepulster Ladungstransport",
            "textEn": "Steady or pulsed charge transfer"
          },
          {
            "id": "reference-direction",
            "textDe": "Gleiche oder umgekehrte Bezugsrichtung",
            "textEn": "Same or reversed reference direction"
          },
          {
            "id": "known-quantity",
            "textDe": "Gesuchte Stromstärke, Ladung oder Zeit",
            "textEn": "Unknown current, charge, or time"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "charge-time-data-intervals",
            "taskDemandDe": "Ein Q(t)-Datensatz zeigt ungleichmäßigen Ladungstransport durch einen markierten Leiterquerschnitt. Bestimme die mittlere Stromstärke für zwei Intervalle, erkläre ihre Unterschiede und gib die Bedeutung eines negativen Werts bei der gewählten Richtung an.",
            "taskDemandEn": "A Q(t) data set shows non-uniform charge transfer through a marked conductor cross-section. Determine average current for two intervals, explain their difference, and state the meaning of a negative value for the chosen direction.",
            "expectedPerformanceDe": "Die lernende Person bildet passende ΔQ/Δt-Werte mit C/s beziehungsweise A, verwendet Nettoänderungen und deutet Vorzeichen und Intervallabhängigkeit physikalisch.",
            "expectedPerformanceEn": "The learner forms appropriate ΔQ/Δt values in C/s or A, uses net changes, and physically interprets sign and interval dependence.",
            "understandingFocusDe": "Der Fall prüft Mittelwertbedeutung an Daten statt isolierter Formelwerte.",
            "understandingFocusEn": "The case assesses the meaning of an average using data rather than isolated formula values."
          },
          {
            "id": "equal-charge-different-pulses",
            "taskDemandDe": "Zwei Geräte übertragen pro Zyklus dieselbe Ladung, aber mit unterschiedlich langen Pulsen und Pausen. Berechne Puls- und Zyklusmittelwerte, vergleiche sie und bestimme die Zeit für eine vorgegebene Gesamtladung.",
            "taskDemandEn": "Two devices transfer the same charge per cycle but use pulses and pauses of different durations. Calculate pulse and cycle averages, compare them, and determine the time required for a specified total charge.",
            "expectedPerformanceDe": "Die lernende Person legt für jeden Mittelwert das Intervall offen, erhält unterschiedliche Pulsströme trotz gleicher Ladung, berechnet den Zyklusmittelwert inklusive Pause und stellt I = Q/t sinnvoll um.",
            "expectedPerformanceEn": "The learner states the interval for each average, obtains different pulse currents despite equal charge, calculates the cycle average including the pause, and meaningfully rearranges I = Q/t.",
            "understandingFocusDe": "Der unabhängige Transfer trennt Ladung, Pulsdauer und Mittelungsintervall.",
            "understandingFocusEn": "The independent transfer distinguishes charge, pulse duration, and averaging interval."
          }
        ]
      }
    },
    {
      "goalId": "4ca83b3f-3605-5c0d-abc4-9f24b9e29bbe",
      "profile": {
        "archetype": "representation",
        "expectations": [
          {
            "id": "construct-vector-superposition",
            "essentialUnderstandingDe": "Die Gesamtfeldstärke an einem Ort ist die Vektorsumme der dortigen Einzelbeiträge. Jeder Beitrag wird zunächst unabhängig aus Quellenzeichen, Geometrie und relativer Stärke bestimmt; Beträge allein dürfen nicht addiert werden.",
            "essentialUnderstandingEn": "The total field at a location is the vector sum of the individual contributions there. Each contribution is first determined independently from source sign, geometry, and relative magnitude; magnitudes alone must not be added.",
            "observablePerformanceDe": "Die lernende Person zeichnet alle Beitragsvektoren an einem gemeinsamen Angriffspunkt und Maßstab, führt Polygon- oder Parallelogrammaddition aus und begründet Richtung sowie relative Größe des Resultats.",
            "observablePerformanceEn": "The learner draws all component vectors at a common point and scale, performs polygon or parallelogram addition, and justifies the direction and relative magnitude of the resultant."
          },
          {
            "id": "use-symmetry-and-predict-changes",
            "essentialUnderstandingDe": "Symmetrie kann Komponenten aufheben oder verstärken, doch dies gilt nur für die betreffenden Richtungen und Beträge. Eine verschobene Quelle oder ein umgekehrtes Vorzeichen verändert die Beitragsvektoren und damit mögliche Nullstellen.",
            "essentialUnderstandingEn": "Symmetry can cancel or reinforce components, but only for the relevant directions and magnitudes. Moving a source or reversing a sign changes the component vectors and hence possible zero points.",
            "observablePerformanceDe": "Die lernende Person sagt vor der Konstruktion qualitative Änderungen voraus, nutzt Symmetrie begründet und überprüft die Vorhersage mit einer neuen Vektoraddition.",
            "observablePerformanceEn": "The learner predicts qualitative changes before construction, uses symmetry with justification, and checks the prediction with a fresh vector addition."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "construct-vector-superposition",
            "use-symmetry-and-predict-changes"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "source-signs",
            "textDe": "Gleiche oder ungleiche Ladungsvorzeichen",
            "textEn": "Like or unlike charge signs"
          },
          {
            "id": "geometry",
            "textDe": "Symmetrische, verschobene oder nichtkollineare Anordnung",
            "textEn": "Symmetric, displaced, or non-collinear arrangement"
          },
          {
            "id": "field-point",
            "textDe": "Mittelpunkt, Achsenpunkt oder allgemeiner Punkt",
            "textEn": "Midpoint, axial point, or general point"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "two-like-charges-midpoint-and-offset",
            "taskDemandDe": "Zwei gleiche positive Ladungen liegen symmetrisch. Konstruiere das Gesamtfeld zuerst im Mittelpunkt und dann an einem seitlich versetzten Punkt; erkläre, welche Komponenten sich jeweils aufheben oder addieren.",
            "taskDemandEn": "Two equal positive charges are arranged symmetrically. Construct the total field first at the midpoint and then at a laterally displaced point; explain which components cancel or add in each case.",
            "expectedPerformanceDe": "Die lernende Person zeichnet im Mittelpunkt gleich große entgegengesetzte Beiträge und erhält null; am versetzten Punkt nutzt sie gleichen Maßstab, zerlegt gegebenenfalls Komponenten und begründet ein nichtverschwindendes Resultat.",
            "expectedPerformanceEn": "The learner draws equal opposed contributions at the midpoint and obtains zero; at the displaced point, they use a common scale, resolve components if needed, and justify a nonzero resultant.",
            "understandingFocusDe": "Der Fall prüft Symmetrie als Ergebnis der Vektoraddition, nicht als Merksatz.",
            "understandingFocusEn": "The case assesses symmetry as a result of vector addition rather than a memorized rule."
          },
          {
            "id": "dipole-sign-reversal",
            "taskDemandDe": "An einem vorgegebenen Punkt neben zwei Ladungen wird zunächst ein Dipolfeld grafisch addiert. Danach wird das negative Ladungsvorzeichen umgekehrt. Sage die Änderung voraus und konstruiere beide Resultierenden im selben Maßstab.",
            "taskDemandEn": "At a specified point beside two charges, a dipole field is first added graphically. The negative charge is then reversed. Predict the change and construct both resultants to the same scale.",
            "expectedPerformanceDe": "Die lernende Person bestimmt für jede Quelle die korrekte Feldrichtung, erkennt die grundlegende Änderung von Dipol- zu Gleichzeichenanordnung und erklärt Verstärkung beziehungsweise Abschwächung aus den Vektoren.",
            "expectedPerformanceEn": "The learner determines the correct field direction for each source, recognizes the fundamental change from a dipole to a like-charge arrangement, and explains reinforcement or reduction from the vectors.",
            "understandingFocusDe": "Der unabhängige Transfer prüft Vorzeichen- und Geometrieverständnis.",
            "understandingFocusEn": "The independent transfer assesses understanding of sign and geometry."
          }
        ]
      }
    },
    {
      "goalId": "1730c01d-8c85-57df-b031-c11e2a0511b1",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "potential-voltage-work-energy-signs",
            "essentialUnderstandingDe": "Elektrisches Potenzial ist potenzielle Energie pro Ladung relativ zu einem Referenzniveau; Spannung ist die Potenzialdifferenz geordneter Punkte. Für eine festgelegte Bewegung gilt ΔE_pot = q·Δφ und die Feldarbeit ist W_Feld = -ΔE_pot.",
            "essentialUnderstandingEn": "Electric potential is potential energy per unit charge relative to a reference level; voltage is the potential difference between ordered points. For a specified displacement, ΔE_pot = q·Δφ and work done by the field is W_field = -ΔE_pot.",
            "observablePerformanceDe": "Die lernende Person legt Referenz, Punktreihenfolge und Vorzeichenkonvention offen, bestimmt Potenzialdifferenz, Energieänderung und Feldarbeit mit Einheiten und erklärt deren Vorzeichen für positive und negative Ladungen.",
            "observablePerformanceEn": "The learner states the reference, point order, and sign convention, determines potential difference, energy change, and field work with units, and explains their signs for positive and negative charges."
          },
          {
            "id": "uniform-field-parallel-separation-limit",
            "essentialUnderstandingDe": "Der Betragszusammenhang |U| = E·d verwendet in einem homogenen Feld den Abstand parallel zu den Feldlinien; bei einem schrägen Abstand zählt nur dessen feldparallele Komponente.",
            "essentialUnderstandingEn": "The magnitude relation |U| = E·d uses the separation parallel to the field lines in a uniform field; for an oblique separation only its field-parallel component contributes.",
            "observablePerformanceDe": "Die lernende Person prüft Homogenität und Geometrie, wählt die feldparallele Strecke beziehungsweise Projektion und begründet, wann die volle Abstandslänge nicht eingesetzt werden darf.",
            "observablePerformanceEn": "The learner checks uniformity and geometry, selects the field-parallel distance or projection, and explains when the full separation length must not be used."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "potential-voltage-work-energy-signs",
            "uniform-field-parallel-separation-limit"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "point-order",
            "textDe": "Punktreihenfolge und Bewegungsrichtung werden vertauscht.",
            "textEn": "Point order and direction of motion are reversed."
          },
          {
            "id": "charge-sign",
            "textDe": "Die Probeladung ist positiv oder negativ.",
            "textEn": "The test charge is positive or negative."
          },
          {
            "id": "separation-direction",
            "textDe": "Der Abstand ist parallel, antiparallel oder schräg zum Feld.",
            "textEn": "The separation is parallel, antiparallel, or oblique to the field."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "ordered-points-and-charge-sign",
            "taskDemandDe": "Ein homogenes Feld E = 2,5 kV/m zeigt nach rechts. Punkt B liegt 4,0 cm rechts von A. Bestimme Δφ = φ_B-φ_A sowie für q = +2,0 nC und q = -2,0 nC jeweils ΔE_pot und W_Feld für A nach B; erkläre alle Vorzeichen.",
            "taskDemandEn": "A uniform field E = 2.5 kV/m points right. Point B is 4.0 cm to the right of A. Determine Δφ = φ_B-φ_A and, for q = +2.0 nC and q = -2.0 nC, ΔE_pot and W_field for motion from A to B; explain every sign.",
            "expectedPerformanceDe": "Δφ = -100 V. Für +2,0 nC gilt ΔE_pot = -200 nJ und W_Feld = +200 nJ; für -2,0 nC kehren sich beide Energievorzeichen um. Der Betrag 100 V stimmt mit E·d überein.",
            "expectedPerformanceEn": "Δφ = -100 V. For +2.0 nC, ΔE_pot = -200 nJ and W_field = +200 nJ; for -2.0 nC both energy signs reverse. The 100 V magnitude agrees with E·d.",
            "understandingFocusDe": "Punktreihenfolge, Ladungsvorzeichen und Feldarbeit werden konsistent verbunden.",
            "understandingFocusEn": "Point order, charge sign, and field work are connected consistently."
          },
          {
            "id": "oblique-separation-transfer",
            "taskDemandDe": "In einem homogenen Feld E = 2,0 kV/m sind zwei Punkte 6,0 cm voneinander entfernt; ihre Verbindung schließt 60° mit der Feldrichtung ein. Bestimme den Spannungsbetrag und widerlege die Rechnung, die unmittelbar 6,0 cm in E·d einsetzt.",
            "taskDemandEn": "In a uniform field E = 2.0 kV/m, two points are separated by 6.0 cm; their connecting line makes a 60° angle with the field direction. Determine the voltage magnitude and refute a calculation that inserts 6.0 cm directly into E·d.",
            "expectedPerformanceDe": "Die feldparallele Projektion ist 6,0 cm·cos 60° = 3,0 cm, daher |U| = 60 V. Die Rechnung mit der vollen Länge ergäbe fälschlich 120 V, weil der senkrechte Anteil keine Potenzialänderung erzeugt.",
            "expectedPerformanceEn": "The field-parallel projection is 6.0 cm·cos 60° = 3.0 cm, so |U| = 60 V. Using the full length would incorrectly give 120 V because the perpendicular component produces no potential change.",
            "understandingFocusDe": "Die geometrische Geltungsbedingung wird auf eine neue Orientierung übertragen.",
            "understandingFocusEn": "The geometric validity condition is transferred to a new orientation."
          }
        ]
      }
    },
    {
      "goalId": "58db62d4-458f-5e2d-9ca0-968e09f4944b",
      "profile": {
        "archetype": "experiment",
        "expectations": [
          {
            "id": "combined-measurements",
            "essentialUnderstandingDe": "Eine Ablenkungsmessung bestimmt das Verhältnis m/B_H, eine Kleinwinkelschwingung desselben Magneten mit bekanntem Trägheitsmoment J das Produkt mB_H. Erst ihre Kombination trennt Magnetmoment und horizontales Erdfeld.",
            "essentialUnderstandingEn": "A deflection measurement determines m/B_H, while small-angle oscillation of the same magnet with known moment of inertia J determines mB_H. Only their combination separates magnetic moment and horizontal terrestrial field.",
            "observablePerformanceDe": "Die Person unterscheidet direkt gemessene Winkel, Abstände und Zeiten von erschlossenen Größen, kombiniert Quotient und Produkt und gibt B_H in Tesla an.",
            "observablePerformanceEn": "The learner distinguishes directly measured angles, distances, and times from inferred quantities, combines ratio and product, and reports B_H in tesla."
          },
          {
            "id": "geometry-and-validity",
            "essentialUnderstandingDe": "Das Magnetfeld muss am Kompass senkrecht zu B_H stehen. Im Dipolfernfeld ist sein Betrag axial doppelt so groß wie äquatorial; kleine Schwingungswinkel und vernachlässigbare Fadentorsion tragen die Periodenformel.",
            "essentialUnderstandingEn": "The magnet's field at the compass must be perpendicular to B_H. In the dipole far field its axial magnitude is twice the equatorial magnitude; small oscillation angles and negligible suspension torsion justify the period formula.",
            "observablePerformanceDe": "Die Person beschreibt die Hauptlage geometrisch statt nur über eine Nummer, verwendet den passenden Faktor und begründet Kontrollen für Abstände, Fremdfelder und Periodenmessung.",
            "observablePerformanceEn": "The learner describes principal position geometrically rather than merely by number, uses the appropriate factor, and explains checks on distances, stray fields, and period measurement."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "combined-measurements",
            "geometry-and-validity"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "principal-position",
            "textDe": "Axiale und äquatoriale Lage des Kompasses relativ zum Magneten bei senkrechten Feldern vergleichen.",
            "textEn": "Compare axial and equatorial compass positions relative to the magnet with mutually perpendicular fields."
          },
          {
            "id": "measurement-quality",
            "textDe": "Einzelzeitmessung mit mehreren kleinen Schwingungen und störungsarmem Aufbau vergleichen.",
            "textEn": "Compare single timing with timing several small oscillations in a low-disturbance setup."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "axial-gauss",
            "taskDemandDe": "Ein bereitgestellter Datensatz verwendet die axiale Hauptlage: Der Kompass liegt auf der verlängerten Magnetachse, deren Feld senkrecht zu B_H steht. r = 0,200 m (Mitte–Mitte), tan θ = 1. Derselbe kurze Magnet schwingt separat mit J = 1,60·10⁻⁵ kg m² und T = 2π s. In SI-Einheiten gegeben: B_m = 2·10⁻⁷ m/r³, tan θ = B_m/B_H, T = 2π√(J/(mB_H)). Bestimme B_H und m.",
            "taskDemandEn": "A supplied dataset uses the axial principal position: the compass lies on the extended magnet axis, whose field is perpendicular to B_H. r = 0.200 m center-to-center, tan θ = 1. The same short magnet oscillates separately with J = 1.60·10⁻⁵ kg m² and T = 2π s. Given in SI units B_m = 2·10⁻⁷ m/r³, tan θ = B_m/B_H, and T = 2π√(J/(mB_H)), determine B_H and m.",
            "expectedPerformanceDe": "Die Person erhält R = m/B_H = 4,00·10⁴ A m²/T und P = mB_H = 1,60·10⁻⁵ A m² T. Daraus folgen B_H = √(P/R) = 20,0 μT und m = √(PR) = 0,800 A m². Sie erläutert, weshalb eine der Messungen allein nicht genügt.",
            "expectedPerformanceEn": "The learner obtains R = m/B_H = 4.00·10⁴ A m²/T and P = mB_H = 1.60·10⁻⁵ A m² T, hence B_H = √(P/R) = 20.0 μT and m = √(PR) = 0.800 A m². The learner explains why either measurement alone is insufficient.",
            "understandingFocusDe": "Zwei verschiedenartige Messungen beseitigen die unbekannte Magnetstärke.",
            "understandingFocusEn": "Two different measurements eliminate the unknown magnet strength."
          },
          {
            "id": "equatorial-gauss-check",
            "taskDemandDe": "Ein unabhängiger Datensatz eines anderen Orts und Magneten nutzt die äquatoriale Hauptlage: Die Verbindungslinie zum Kompass steht senkrecht zur Magnetachse, B_m steht senkrecht zu B_H. In SI-Einheiten gegeben sind B_m = 10⁻⁷ m/r³, r = 0,200 m, tan θ = 0,250, J = 1,80·10⁻⁵ kg m² und T = 2π s. Bestimme B_H und m und begründe zwei Qualitätskontrollen.",
            "taskDemandEn": "An independent dataset for another location and magnet uses the equatorial principal position: the line to the compass is perpendicular to the magnet axis, and B_m is perpendicular to B_H. Given in SI units B_m = 10⁻⁷ m/r³, r = 0.200 m, tan θ = 0.250, J = 1.80·10⁻⁵ kg m², and T = 2π s, determine B_H and m and justify two quality checks.",
            "expectedPerformanceDe": "Die Person erhält R = 2,00·10⁴ A m²/T, P = 1,80·10⁻⁵ A m² T, B_H = 30,0 μT und m = 0,600 A m². Sie verwendet den halbierten Feldfaktor und begründet etwa Mitte–Mitte-Abstände im Fernfeld sowie mehrfaches Timing kleiner Schwingungen ohne störende Magnete oder relevante Fadentorsion.",
            "expectedPerformanceEn": "The learner obtains R = 2.00·10⁴ A m²/T, P = 1.80·10⁻⁵ A m² T, B_H = 30.0 μT, and m = 0.600 A m², uses the halved field factor, and justifies checks such as center-to-center far-field distances and repeated timing of small oscillations without stray magnets or appreciable suspension torsion.",
            "understandingFocusDe": "Die Hauptlagenkonvention verändert den Feldfaktor; Messkontrollen sichern die Modellanwendung.",
            "understandingFocusEn": "Principal-position convention changes the field factor; measurement checks support model use."
          }
        ]
      }
    },
    {
      "goalId": "106417ed-80db-5490-a1ee-bb4160d3f2b4",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "geometry-selects-field-model",
            "essentialUnderstandingDe": "Das Feld eines idealisierten langen geraden Leiters verläuft kreisförmig und fällt in Luft mit 1/r ab; im Inneren einer idealisierten langen Spule ist das Feld fern der Enden näherungsweise homogen und skaliert bei linearem homogenem Kern mit Strom, Windungsdichte und μr. Die Formeln sind deshalb an unterschiedliche Geometrien und Annahmen gebunden.",
            "essentialUnderstandingEn": "The field of an idealized long straight conductor is circular and decreases as 1/r in air; inside an idealized long solenoid, far from its ends, the field is approximately uniform and scales with current, turn density, and μr for a linear homogeneous core. The formulas are therefore tied to different geometries and assumptions.",
            "observablePerformanceDe": "Die lernende Person identifiziert in einer neuen Anordnung Leiter- oder Spulenmodell, nennt die relevanten geometrischen Größen und begründet die Auswahl, bevor sie eine Formel verwendet.",
            "observablePerformanceEn": "For a fresh arrangement, the learner identifies the conductor or solenoid model, names the relevant geometric quantities, and justifies the choice before using a formula."
          },
          {
            "id": "magnitude-direction-and-dependence",
            "essentialUnderstandingDe": "Betrag und Richtung gehören gemeinsam zum Magnetfeldmodell: B = μ0 I/(2πr) beziehungsweise B ≈ μ0 μr (N/ℓ) I liefern den Betrag, während die Rechte-Hand-Regel die Orientierung aus der Stromrichtung bestimmt.",
            "essentialUnderstandingEn": "Magnitude and direction jointly define the magnetic-field model: B = μ0 I/(2πr) or B ≈ μ0 μr (N/ℓ) I gives the magnitude, while the right-hand rule determines orientation from current direction.",
            "observablePerformanceDe": "Die lernende Person sagt Skalierung und Richtungsänderung zunächst qualitativ voraus, berechnet B mit konsistenten Einheiten und zeichnet die Feldorientierung für eine festgelegte Ansicht widerspruchsfrei ein.",
            "observablePerformanceEn": "The learner first predicts scaling and directional change qualitatively, calculates B with consistent units, and draws the field orientation consistently for a specified view."
          },
          {
            "id": "idealization-limits-transfer",
            "essentialUnderstandingDe": "Endbereiche, kurze Leiter oder Spulen sowie inhomogene oder nichtlineare Kerne verletzen Annahmen der einfachen Modelle; eine richtige Rechnung innerhalb eines unpassenden Modells ist keine belastbare Feldbestimmung.",
            "essentialUnderstandingEn": "End regions, short conductors or solenoids, and inhomogeneous or nonlinear cores violate assumptions of the simple models; a correct calculation within an unsuitable model is not a defensible field determination.",
            "observablePerformanceDe": "Bei veränderter Geometrie oder geändertem Kern grenzt die lernende Person den Bereich ab, in dem die Näherung trägt, benennt die verletzte Annahme und formuliert nur eine entsprechend begrenzte Vorhersage.",
            "observablePerformanceEn": "When geometry or core material changes, the learner identifies the region where the approximation applies, names the violated assumption, and states only a correspondingly bounded prediction."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "geometry-selects-field-model",
            "magnitude-direction-and-dependence",
            "idealization-limits-transfer"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "field-geometry",
            "textDe": "Gerader Leiter, Spuleninneres, Leiterende oder Spulenrand",
            "textEn": "Straight conductor, solenoid interior, conductor end, or solenoid edge"
          },
          {
            "id": "current-and-orientation",
            "textDe": "Stromstärke, Stromumkehr, Abstand und Beobachtungsrichtung",
            "textEn": "Current magnitude, current reversal, distance, and viewing direction"
          },
          {
            "id": "core-regime",
            "textDe": "Luft, homogener linearer Kern oder ausdrücklich inhomogener beziehungsweise sättigender Kern",
            "textEn": "Air, homogeneous linear core, or explicitly inhomogeneous or saturating core"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "conductor-distance-and-reversal",
            "taskDemandDe": "Für einen langen geraden Leiter sind Strom, zwei Abstände und eine feste Blickrichtung gegeben. Sage vor der Rechnung Verhältnis und Richtung der Felder voraus, berechne beide Beträge und konstruiere die Änderung nach Stromumkehr.",
            "taskDemandEn": "For a long straight conductor, the current, two distances, and a fixed viewing direction are given. Before calculating, predict the ratio and direction of the fields, calculate both magnitudes, and construct the change after current reversal.",
            "expectedPerformanceDe": "Die lernende Person nutzt die 1/r-Abhängigkeit, erhält konsistente Tesla-Werte, wendet die Rechte-Hand-Regel bezogen auf die Blickrichtung an und trennt Betragsänderung von Richtungsumkehr.",
            "expectedPerformanceEn": "The learner uses the 1/r dependence, obtains consistent values in tesla, applies the right-hand rule relative to the viewing direction, and separates magnitude change from direction reversal.",
            "understandingFocusDe": "Der Fall verbindet quantitative Abhängigkeit und vektorielle Orientierung im Leitermodell.",
            "understandingFocusEn": "The case connects quantitative dependence and vector orientation in the conductor model."
          },
          {
            "id": "solenoid-core-and-edge-claim",
            "taskDemandDe": "Eine lange Spule mit linearem Kern wird mit einer halb so großen Windungsdichte neu gewickelt und mit doppeltem Strom betrieben; zusätzlich wird ein Messpunkt nahe dem Spulenende betrachtet. Prognostiziere B im Inneren und beurteile die Aussage, dieselbe Formel liefere am Rand einen exakten Wert.",
            "taskDemandEn": "A long solenoid with a linear core is rewound with half the turn density and operated at twice the current; a measurement point near the end is also considered. Predict B in the interior and judge the claim that the same formula gives an exact value at the edge.",
            "expectedPerformanceDe": "Die lernende Person erkennt die kompensierenden Skalierungen im Inneren, bestimmt die Richtung und weist den Exaktheitsanspruch am Endbereich wegen des inhomogenen Randfelds zurück.",
            "expectedPerformanceEn": "The learner recognizes the compensating interior scalings, determines the direction, and rejects the exactness claim near the end because of the nonuniform fringe field.",
            "understandingFocusDe": "Der Transfer prüft Modellwahl, Skalierung und explizite Gültigkeitsgrenze an einer anderen Geometrie.",
            "understandingFocusEn": "The transfer tests model choice, scaling, and an explicit validity limit in a different geometry."
          }
        ]
      }
    },
    {
      "goalId": "c6355a22-24cf-5d8b-88af-ea11711460fb",
      "profile": {
        "archetype": "procedure",
        "expectations": [
          {
            "id": "force-is-transverse-and-angle-dependent",
            "essentialUnderstandingDe": "Die Kraft auf das Leiterstück ist die makroskopische Wirkung magnetischer Kräfte auf bewegte Ladungsträger. Ihr Betrag ist B I ℓ sin(α), und ihre Richtung steht senkrecht zu Strom- und Feldrichtung; bei paralleler Anordnung verschwindet sie.",
            "essentialUnderstandingEn": "The force on the conductor segment is the macroscopic effect of magnetic forces on moving charge carriers. Its magnitude is B I ℓ sin(α), and its direction is perpendicular to current and field; it vanishes in the parallel arrangement.",
            "observablePerformanceDe": "Die lernende Person erklärt für eine neue Orientierung den Winkelbezug, sagt Null- oder Maximalfall voraus und konstruiert die Kraftrichtung für eine festgelegte Stromkonvention.",
            "observablePerformanceEn": "For a fresh orientation, the learner explains the angle convention, predicts a zero or maximum case, and constructs the force direction for a specified current convention."
          },
          {
            "id": "calculation-retains-vector-meaning",
            "essentialUnderstandingDe": "Die skalare Betragsformel ersetzt nicht die Richtungsinformation; Strom- oder Feldumkehr ändert das Vorzeichen der vektoriellen Kraft, während eine gleichzeitige Umkehr beider Größen die Richtung erhält.",
            "essentialUnderstandingEn": "The scalar magnitude formula does not replace directional information; reversing current or field reverses the vector force, while reversing both preserves its direction.",
            "observablePerformanceDe": "Die lernende Person berechnet F mit wirksamer Leiterlänge, Winkel und Einheit, kennzeichnet separat die Richtung und prüft Grenzfälle sowie die Wirkung einzelner und doppelter Umkehr.",
            "observablePerformanceEn": "The learner calculates F with effective conductor length, angle, and unit, identifies direction separately, and checks limiting cases and the effects of single and double reversal."
          },
          {
            "id": "force-measurement-determines-field",
            "essentialUnderstandingDe": "Bei α = 90° kann eine kontrollierte Kraftmessung B = F/(Iℓ) operational bestimmen, sofern der betrachtete Leiterabschnitt im hinreichend homogenen Feld liegt und störende Kräfte berücksichtigt sind.",
            "essentialUnderstandingEn": "At α = 90°, a controlled force measurement can operationally determine B = F/(Iℓ), provided the considered conductor segment lies in a sufficiently uniform field and disturbing forces are accounted for.",
            "observablePerformanceDe": "Aus frischen Messdaten bestimmt die lernende Person B, dokumentiert Einheiten und Messgeometrie, vergleicht Wiederholungen und begrenzt die Aussage bei erkennbarem Offset oder inhomogenem Feld.",
            "observablePerformanceEn": "From fresh measurement data, the learner determines B, documents units and measurement geometry, compares repeats, and limits the claim when an offset or field nonuniformity is apparent."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "force-is-transverse-and-angle-dependent",
            "calculation-retains-vector-meaning",
            "force-measurement-determines-field"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "relative-angle",
            "textDe": "Parallele, schräge und senkrechte Orientierung von Strom und Feld",
            "textEn": "Parallel, oblique, and perpendicular orientations of current and field"
          },
          {
            "id": "vector-reversal",
            "textDe": "Umkehr von Strom, Feld oder beiden Größen",
            "textEn": "Reversal of current, field, or both quantities"
          },
          {
            "id": "measurement-quality",
            "textDe": "Ideale Daten, konstanter Kraftoffset oder erkennbares Randfeld",
            "textEn": "Ideal data, constant force offset, or detectable fringe field"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "oblique-conductor-force",
            "taskDemandDe": "Ein gerades Leiterstück liegt unter 30° zur Feldrichtung. Bestimme Betrag und Richtung der Kraft, erkläre den Grenzfall α = 0° und sage die Änderung nach Stromumkehr voraus.",
            "taskDemandEn": "A straight conductor segment lies at 30° to the field direction. Determine the force magnitude and direction, explain the limiting case α = 0°, and predict the change after current reversal.",
            "expectedPerformanceDe": "Die lernende Person verwendet sin(30°), gibt Newton an, konstruiert die senkrechte Kraftrichtung und erklärt den Nullfall sowie die Richtungsumkehr ohne eine Änderung des Betrags bei sonst gleichen Größen.",
            "expectedPerformanceEn": "The learner uses sin(30°), reports newtons, constructs the perpendicular force direction, and explains the zero case and directional reversal without changing the magnitude when other quantities remain fixed.",
            "understandingFocusDe": "Der Fall prüft Winkel, Betrag, Richtung und Grenzfall als zusammenhängendes Kraftmodell.",
            "understandingFocusEn": "The case tests angle, magnitude, direction, and limiting case as one coherent force model."
          },
          {
            "id": "field-from-force-series",
            "taskDemandDe": "Für α = 90° sind Kraftwerte bei drei Stromstärken und bekannter Leiterlänge gegeben; eine Messreihe enthält einen kleinen Nullpunkt-Offset. Bestimme B aus der Steigung und beurteile eine Einzelwertbestimmung ohne Offsetkorrektur.",
            "taskDemandEn": "For α = 90°, force values at three currents and a known conductor length are supplied; the series contains a small zero offset. Determine B from the slope and judge a single-value estimate without offset correction.",
            "expectedPerformanceDe": "Die lernende Person nutzt die lineare F-I-Beziehung, bestimmt B aus Steigung geteilt durch ℓ, führt Einheiten und Offset getrennt und begrenzt die Genauigkeit der Einzelwertmethode.",
            "expectedPerformanceEn": "The learner uses the linear F-I relationship, determines B from slope divided by ℓ, keeps units and offset separate, and limits the accuracy of the single-value method.",
            "understandingFocusDe": "Der Transfer macht die Feldbestimmung zu einer begründeten Messauswertung statt zu bloßer Umstellung.",
            "understandingFocusEn": "The transfer makes field determination a reasoned measurement analysis rather than mere rearrangement."
          }
        ]
      }
    },
    {
      "goalId": "8c9394cb-f54a-508d-9750-4c49e31b3fa9",
      "profile": {
        "archetype": "procedure",
        "expectations": [
          {
            "id": "magnitude-and-angle-meaning",
            "essentialUnderstandingDe": "Der Betrag F_L = |q|vB sin(α) hängt nur von der zur Feldrichtung senkrechten Geschwindigkeitskomponente ab: Bei paralleler Bewegung verschwindet die magnetische Kraft, bei senkrechter Bewegung ist sie für gegebene q, v und B maximal.",
            "essentialUnderstandingEn": "The magnitude F_L = |q|vB sin(α) depends only on the component of velocity perpendicular to the field: for parallel motion the magnetic force vanishes, while for perpendicular motion it is maximal for given q, v, and B.",
            "observablePerformanceDe": "Die lernende Person bestimmt in einem neuen Geometriefall den relevanten Winkel, berechnet den Kraftbetrag mit Einheit und prüft das Ergebnis an den Grenzfällen α = 0° und α = 90°, statt den Sinusfaktor automatisch gleich eins zu setzen.",
            "observablePerformanceEn": "In a new geometric case, the learner identifies the relevant angle, calculates the force magnitude with units, and checks it against the limits α = 0° and α = 90° instead of automatically setting the sine factor to one."
          },
          {
            "id": "vector-direction-and-charge-sign",
            "essentialUnderstandingDe": "Für eine positive Ladung zeigt die Lorentzkraft in Richtung von v × B; bei negativer Ladung ist die Richtung umgekehrt. Sie steht stets senkrecht auf der momentanen Geschwindigkeit und auf dem wirksamen Feldanteil.",
            "essentialUnderstandingEn": "For a positive charge, the Lorentz force points in the direction of v × B; for a negative charge the direction is reversed. It is always perpendicular to the instantaneous velocity and the effective field component.",
            "observablePerformanceDe": "Die lernende Person legt ein Koordinatensystem fest, konstruiert v × B für eine positive Probeladung, kehrt bei negativem q die Richtung um und weist eine angebotene Richtung zurück, die nicht senkrecht zu v und B ist.",
            "observablePerformanceEn": "The learner defines a coordinate system, constructs v × B for a positive test charge, reverses the direction for negative q, and rejects a proposed direction that is not perpendicular to v and B."
          },
          {
            "id": "trajectory-limiting-cases",
            "essentialUnderstandingDe": "Unter Vernachlässigung anderer Kräfte bleibt eine parallel in ein homogenes Magnetfeld eintretende Ladung wegen F_L = 0 geradlinig; bei senkrechtem Eintritt wirkt die Lorentzkraft als Zentripetalkraft und erzeugt eine Kreisbahn, ohne den Geschwindigkeitsbetrag zu ändern.",
            "essentialUnderstandingEn": "Neglecting other forces, a charge entering a uniform magnetic field parallel to the field remains on a straight path because F_L = 0; for perpendicular entry the Lorentz force acts as the centripetal force and produces a circular path without changing the speed magnitude.",
            "observablePerformanceDe": "Die lernende Person leitet für neue parallele und senkrechte Eintrittsfälle die geradlinige beziehungsweise kreisförmige Bahn aus Kraftbetrag und -richtung her, nennt die Voraussetzung eines homogenen Feldes ohne weitere Kräfte und prüft die Krümmungsrichtung bei umgekehrtem Feld oder Ladungsvorzeichen.",
            "observablePerformanceEn": "For new parallel and perpendicular entry cases, the learner derives the straight or circular path from force magnitude and direction, states the assumption of a uniform field with no other forces, and checks curvature direction when field or charge sign is reversed."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "magnitude-and-angle-meaning",
            "vector-direction-and-charge-sign",
            "trajectory-limiting-cases"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "velocity-field-angle",
            "textDe": "Parallele oder senkrechte Eintrittsrichtung für die Bahn; zusätzliche schräge Geometrien nur zur Prüfung von Kraftbetrag und -richtung",
            "textEn": "Parallel or perpendicular entry for trajectory reasoning; additional oblique geometries only for checking force magnitude and direction"
          },
          {
            "id": "charge-sign",
            "textDe": "Positive oder negative frei bewegte Ladung",
            "textEn": "Positive or negative freely moving charge"
          },
          {
            "id": "reversed-vector",
            "textDe": "Umgekehrte Feldrichtung oder umgekehrte Anfangsgeschwindigkeit",
            "textEn": "Reversed field direction or reversed initial velocity"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "opposite-charge-deflection",
            "taskDemandDe": "Eine positive und eine negative Ladung treten mit gleicher, senkrecht zu einem homogenen Magnetfeld gerichteter Geschwindigkeit ein; andere Kräfte werden vernachlässigt. Betrag, Richtung und Bahnkrümmung sind für beide vorherzusagen und zu prüfen.",
            "taskDemandEn": "A positive and a negative charge enter a uniform magnetic field with the same velocity perpendicular to the field; other forces are neglected. Magnitude, direction, and trajectory curvature must be predicted and checked for both.",
            "expectedPerformanceDe": "Die lernende Person erhält gleiche Kraftbeträge bei gleichem |q|, konstruiert für die positive Ladung v × B, kehrt die Richtung für die negative um und zeichnet entgegengesetzt gekrümmte Kreisbahnen bei gleichbleibendem Geschwindigkeitsbetrag; die Kreisfolgerung bindet sie ausdrücklich an die ausgeschlossenen weiteren Kräfte.",
            "expectedPerformanceEn": "The learner obtains equal force magnitudes for equal |q|, constructs v × B for the positive charge, reverses the direction for the negative charge, and draws oppositely curved circular paths with constant speed magnitude, explicitly tying the circular-path conclusion to the exclusion of other forces.",
            "understandingFocusDe": "Der Ladungsvorzeichenvergleich verhindert, dass die Richtung mechanisch aus einer Handhaltung ohne Vektorbezug übernommen wird.",
            "understandingFocusEn": "The charge-sign comparison prevents direction from being copied mechanically from a hand rule without vector reasoning."
          },
          {
            "id": "parallel-perpendicular-boundary-transfer",
            "taskDemandDe": "Dieselbe positive Ladung tritt einmal parallel und einmal senkrecht mit gleichem Geschwindigkeitsbetrag in dasselbe homogene Magnetfeld ein; weitere Kräfte werden vernachlässigt. Kraft und Bahn sind zunächst vorherzusagen, dann wird die Feldrichtung umgekehrt.",
            "taskDemandEn": "The same positive charge enters the same uniform magnetic field once parallel and once perpendicular with the same speed; other forces are neglected. Force and trajectory must first be predicted, after which the field direction is reversed.",
            "expectedPerformanceDe": "Die lernende Person erhält im parallelen Fall F_L = 0 und eine geradlinige Bahn, im senkrechten Fall den maximalen Kraftbetrag und eine Kreisbahn; nach Feldumkehr bleibt der parallele Fall unverändert, während sich der Umlaufsinn des senkrechten Falls umkehrt.",
            "expectedPerformanceEn": "The learner obtains F_L = 0 and a straight path for parallel entry, and maximum force magnitude and a circular path for perpendicular entry; after field reversal the parallel case is unchanged while the sense of rotation in the perpendicular case reverses.",
            "understandingFocusDe": "Der Grenzfallvergleich diagnostiziert sowohl das automatische Setzen von sin(α) = 1 als auch eine Bahnbehauptung ohne Prüfung der Kraft und ihrer Modellbedingungen.",
            "understandingFocusEn": "Comparing the limiting cases diagnoses both automatic use of sin(α) = 1 and a trajectory claim made without checking the force and its modeling assumptions."
          }
        ]
      }
    },
    {
      "goalId": "d03f1cb6-c224-53db-ad91-76cc7827978d",
      "profile": {
        "archetype": "experiment",
        "expectations": [
          {
            "id": "sinusoidal-periodic-model-and-parameters",
            "essentialUnderstandingDe": "Im idealen Modell folgt die Auslenkung einer harmonischen Schwingung einer Sinus- oder Kosinusfunktion mit konstanter Ruhelage, Amplitude und Periodendauer. Ein Federpendel erfüllt dieses Modell nur bei näherungsweise linearer Rückstellkraft, ein Fadenpendel nur bei kleinen Winkelauslenkungen; Dämpfung oder systematische Formabweichungen gehören zur realen Bewegung und nicht zur Definition des Modells.",
            "essentialUnderstandingEn": "In the ideal model, the displacement of a harmonic oscillation follows a sine or cosine function with constant equilibrium position, amplitude, and period. A spring oscillator satisfies this model only for an approximately linear restoring force, and a simple pendulum only at small angular displacements; damping or systematic shape deviations belong to the real motion, not to the definition of the model.",
            "observablePerformanceDe": "Die lernende Person kennzeichnet in einem neuen t-s-Diagramm Ruhelage, Amplitude und Periodendauer mit Einheiten, formuliert ein passendes Sinusmodell und unterscheidet Modellkurve, Messpunkte und Messunsicherheit.",
            "observablePerformanceEn": "In a fresh displacement-time graph, the learner identifies equilibrium position, amplitude, and period with units, formulates a suitable sinusoidal model, and distinguishes the model curve, measured points, and measurement uncertainty."
          },
          {
            "id": "experimental-model-test-and-validity-range",
            "essentialUnderstandingDe": "Die Güte des harmonischen Modells wird an Daten geprüft: zufällige Streuung ist von systematischen Abweichungen zu unterscheiden, und eine Veränderung der Auslenkung kann die lineare beziehungsweise Kleinwinkelnäherung verlassen. Eine passende Kurvenform bei nur einem kurzen Ausschnitt belegt das Modell daher nicht allein.",
            "essentialUnderstandingEn": "The adequacy of the harmonic model is tested against data: random scatter must be distinguished from systematic deviations, and changing the displacement can leave the linear or small-angle regime. A suitable curve shape in only one short interval therefore does not establish the model by itself.",
            "observablePerformanceDe": "Die lernende Person plant oder wertet eine sichere Messreihe über mehrere Perioden aus, vergleicht Vorhersage und Daten anhand geeigneter Merkmale und begründet, für welchen Auslenkungsbereich das harmonische Modell trägt und wo es begrenzt werden muss.",
            "observablePerformanceEn": "The learner plans or analyzes a safe measurement series over several periods, compares prediction and data using suitable features, and justifies the displacement range over which the harmonic model is adequate and where its claim must be limited."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "sinusoidal-periodic-model-and-parameters",
            "experimental-model-test-and-validity-range"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "oscillator-system",
            "textDe": "Federpendel im linearen Bereich oder Fadenpendel im Kleinwinkelbereich",
            "textEn": "Spring oscillator in its linear range or simple pendulum in its small-angle range"
          },
          {
            "id": "model-regime",
            "textDe": "Kleine oder größere Auslenkung sowie geringe oder erkennbare Dämpfung",
            "textEn": "Small or larger displacement and weak or noticeable damping"
          },
          {
            "id": "evidence-quality",
            "textDe": "Rohmesspunkte, verrauschte Zeitreihe oder bereitgestellter Modellvergleich über mehrere Perioden",
            "textEn": "Raw measurements, a noisy time series, or a supplied model comparison over several periods"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "spring-oscillator-model-test",
            "taskDemandDe": "Für ein Federpendel werden Masse, ein als linear geprüfter Federbereich und eine Zeit-Auslenkungs-Messreihe über sechs Perioden bereitgestellt. Bestimme die Modellparameter, konstruiere ein Sinusmodell und beurteile anhand der Residuen und Messauflösung, ob die Bewegung im untersuchten Bereich harmonisch modelliert werden kann.",
            "taskDemandEn": "For a spring oscillator, the mass, a verified linear spring range, and a displacement-time data series over six periods are supplied. Determine the model parameters, construct a sinusoidal model, and use the residuals and measurement resolution to judge whether the motion can be modeled as harmonic over the investigated range.",
            "expectedPerformanceDe": "Die lernende Person bestimmt Ruhelage, Amplitude und Periodendauer mit Einheiten, legt Messpunkte und Modell nicht gleich, sucht nach zufälligen und systematischen Abweichungen und formuliert ein auf den geprüften linearen Bereich begrenztes Urteil.",
            "expectedPerformanceEn": "The learner determines equilibrium position, amplitude, and period with units, does not equate measurements with the model, looks for random and systematic deviations, and states a judgment limited to the tested linear range.",
            "understandingFocusDe": "Der Fall prüft die experimentelle Modellierung eines Federpendels aus Daten statt die Reproduktion einer gezeichneten Sinuskurve.",
            "understandingFocusEn": "This case tests experimental modeling of a spring oscillator from data rather than reproduction of a drawn sine curve."
          },
          {
            "id": "pendulum-small-and-large-angle-transfer",
            "taskDemandDe": "Zwei unabhängig erhobene t-s-Datensätze desselben Fadenpendels stammen von einer kleinen und einer deutlich größeren Anfangsauslenkung. Sage vor der Auswertung voraus, welcher Datensatz das harmonische Kleinwinkelmodell besser erfüllt, prüfe die Vorhersage über Kurvenform und Periodenverhalten und benenne die verletzte Modellbedingung.",
            "taskDemandEn": "Two independently collected displacement-time data sets for the same simple pendulum start from a small and a substantially larger initial displacement. Before analyzing them, predict which data set better satisfies the harmonic small-angle model, test the prediction using curve shape and period behavior, and name the violated model condition.",
            "expectedPerformanceDe": "Die lernende Person erwartet und belegt die bessere Modellpassung bei kleiner Auslenkung, unterscheidet Messstreuung von einer systematischen Abweichung des größeren Winkelfalls und begrenzt die Aussage, ohne jede periodische Bewegung als harmonisch zu bezeichnen.",
            "expectedPerformanceEn": "The learner predicts and supports the better model fit at small displacement, distinguishes measurement scatter from systematic deviation in the larger-angle case, and limits the claim without labeling every periodic motion as harmonic.",
            "understandingFocusDe": "Der Transfer prüft die Gültigkeitsgrenze desselben Modells an einem anderen Oszillatortyp und einem geänderten Regime.",
            "understandingFocusEn": "The transfer tests the validity limit of the same model with another oscillator type and a changed regime."
          }
        ]
      }
    },
    {
      "goalId": "fcf8580c-ecfd-58ea-bbf5-a1b29c9ecf8e",
      "profile": {
        "archetype": "representation",
        "expectations": [
          {
            "id": "distinguish-characteristic-quantities",
            "essentialUnderstandingDe": "Die Auslenkung $x(t)$ ist die vorzeichenbehaftete momentane Abweichung von der Ruhelage. Die Amplitude $A$ ist der größte Betrag dieser Auslenkung und deshalb nicht selbst die jeweilige momentane Auslenkung. Die Periodendauer $T$ gibt die Zeit einer vollständigen Wiederholung an, die Frequenz $f$ die Zahl der Wiederholungen pro Zeit; daher gilt $f = 1/T$ mit den zueinander passenden Einheiten Sekunde und Hertz.",
            "essentialUnderstandingEn": "Displacement $x(t)$ is the signed instantaneous deviation from equilibrium. Amplitude $A$ is the greatest magnitude of that displacement and is therefore not itself the displacement at every instant. Period $T$ is the time for one complete repetition, whereas frequency $f$ is the number of repetitions per unit time; therefore $f = 1/T$, with seconds and hertz as corresponding units.",
            "observablePerformanceDe": "Die lernende Person ordnet in einer neuen harmonischen Auslenkung-Zeit-Gleichung $x(t)$, $A$, $T$ und $f$ ihren physikalischen Bedeutungen und Einheiten zu, grenzt Amplitude und momentane Auslenkung ausdrücklich voneinander ab und begründet $f = 1/T$ über Wiederholungszeit und Wiederholungszahl statt nur den Kehrwert zu bilden.",
            "observablePerformanceEn": "For a new harmonic displacement-time equation, the learner assigns $x(t)$, $A$, $T$, and $f$ their physical meanings and units, explicitly distinguishes amplitude from instantaneous displacement, and justifies $f = 1/T$ through repetition time and repetition count rather than merely taking a reciprocal."
          },
          {
            "id": "translate-time-equation-to-motion",
            "essentialUnderstandingDe": "Eine harmonische Auslenkung-Zeit-Gleichung beschreibt für jeden Zeitpunkt Lage und Bewegungsphase relativ zur gewählten Ruhelage und positiven Richtung. Die Amplitude legt die Extremwerte $+A$ und $-A$ fest; $T$ beziehungsweise $f$ legt die zeitliche Wiederholung fest. Funktionsform und Wahl des Zeitnullpunkts bestimmen, bei welcher Auslenkung und in welcher Bewegungsrichtung die Darstellung beginnt, ohne dadurch $A$, $T$ oder $f$ zu verändern.",
            "essentialUnderstandingEn": "A harmonic displacement-time equation describes position and stage of motion relative to the chosen equilibrium and positive direction at every instant. Amplitude sets the extrema $+A$ and $-A$, while $T$ or $f$ sets the temporal repetition. The function form and choice of time origin determine the starting displacement and direction of motion without changing $A$, $T$, or $f$.",
            "observablePerformanceDe": "Die lernende Person übersetzt eine unabhängig vorgelegte Auslenkung-Zeit-Gleichung in eine beschriftete Skizze oder eine zeitlich geordnete Beschreibung mit Ruhelagendurchgängen, Extremwerten und Wiederholung nach einer Periode. Sie erklärt dabei, welche Gleichungsbestandteile die genannten Merkmale festlegen, und prüft die Deutung an ausgewählten Zeitpunkten.",
            "observablePerformanceEn": "The learner translates an independently supplied displacement-time equation into a labelled sketch or a time-ordered description containing equilibrium crossings, extrema, and repetition after one period. They explain which parts of the equation determine those features and check the interpretation at selected times."
          },
          {
            "id": "identify-invariants-under-representation-change",
            "essentialUnderstandingDe": "Dieselbe harmonische Bewegung kann mit der Frequenz statt der Periodendauer, mit verschobenem Zeitnullpunkt oder mit umgekehrter positiver Koordinatenrichtung dargestellt werden. Eine Zeitverschiebung verändert die Anfangsphase und eine Richtungsumkehr das Vorzeichen der Auslenkung; Amplitude, Periodendauer und Frequenz bleiben dabei charakteristische Größen derselben Bewegung.",
            "essentialUnderstandingEn": "The same harmonic motion can be represented using frequency instead of period, with a shifted time origin, or with the positive coordinate direction reversed. A time shift changes the initial stage of motion and a direction reversal changes the sign of displacement, while amplitude, period, and frequency remain characteristic quantities of the same motion.",
            "observablePerformanceDe": "Bei einer geänderten Gleichungsdarstellung identifiziert die lernende Person, welche Merkmale des Auslenkung-Zeit-Verlaufs sich ändern und welche charakteristischen Größen invariant bleiben, und begründet dies aus Zeitnullpunkt und Koordinatenwahl statt aus dem bloßen Aussehen der Formel.",
            "observablePerformanceEn": "When the equation representation changes, the learner identifies which features of the displacement-time course change and which characteristic quantities remain invariant, and justifies this from the time origin and coordinate choice rather than merely from the formula's appearance."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "distinguish-characteristic-quantities",
            "translate-time-equation-to-motion",
            "identify-invariants-under-representation-change"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "temporal-parameterization",
            "textDe": "Die Gleichung ist über die Periodendauer $T$ oder über die Frequenz $f$ parametrisiert",
            "textEn": "The equation is parameterised using period $T$ or frequency $f$"
          },
          {
            "id": "function-and-time-origin",
            "textDe": "Kosinus- oder Sinusform mit unverändertem oder verschobenem Zeitnullpunkt",
            "textEn": "Cosine or sine form with an unchanged or shifted time origin"
          },
          {
            "id": "coordinate-direction",
            "textDe": "Gleiche Bewegung bei beibehaltener oder umgekehrter positiver Auslenkungsrichtung",
            "textEn": "The same motion with the positive displacement direction retained or reversed"
          },
          {
            "id": "requested-representation",
            "textDe": "Qualitative Skizze, zeitlich geordnete Bewegungsbeschreibung oder Vergleich zweier Gleichungsdarstellungen",
            "textEn": "Qualitative sketch, time-ordered description of motion, or comparison of two equation representations"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "cosine-equation-with-period",
            "taskDemandDe": "Für einen harmonischen Oszillator gilt unabhängig von der Lernvisualisierung $x(t)=0{,}060\\,\\mathrm{m}\\cdot\\cos(2\\pi t/(0{,}80\\,\\mathrm{s}))$. Erkläre die Bedeutung und Einheit von $x(t)$, $A$, $T$ und $f$, begründe $f=1/T$ und skizziere oder beschreibe den Verlauf für eine vollständige Periode einschließlich Ruhelagendurchgängen und Extremwerten.",
            "taskDemandEn": "Independently of the learning visualization, a harmonic oscillator is described by $x(t)=0.060\\,\\mathrm{m}\\cdot\\cos(2\\pi t/(0.80\\,\\mathrm{s}))$. Explain the meaning and unit of $x(t)$, $A$, $T$, and $f$, justify $f=1/T$, and sketch or describe the course over one complete period, including equilibrium crossings and extrema.",
            "expectedPerformanceDe": "Die lernende Person deutet $x(t)$ als vorzeichenbehaftete momentane Auslenkung, $A=0{,}060\\,\\mathrm{m}$ als größten Betrag, $T=0{,}80\\,\\mathrm{s}$ als Wiederholungszeit und $f=1{,}25\\,\\mathrm{Hz}$ als Wiederholungen pro Sekunde. Sie begründet die Kehrwertbeziehung und ordnet für eine Periode $x(0)=+A$, den ersten Ruhelagendurchgang bei $0{,}20\\,\\mathrm{s}$, $x(0{,}40\\,\\mathrm{s})=-A$, den zweiten Durchgang bei $0{,}60\\,\\mathrm{s}$ und die Wiederholung $x(0{,}80\\,\\mathrm{s})=+A$ konsistent zu.",
            "expectedPerformanceEn": "The learner interprets $x(t)$ as signed instantaneous displacement, $A=0.060\\,\\mathrm{m}$ as the greatest magnitude, $T=0.80\\,\\mathrm{s}$ as the repetition time, and $f=1.25\\,\\mathrm{Hz}$ as repetitions per second. They justify the reciprocal relationship and consistently assign, over one period, $x(0)=+A$, the first equilibrium crossing at $0.20\\,\\mathrm{s}$, $x(0.40\\,\\mathrm{s})=-A$, the second crossing at $0.60\\,\\mathrm{s}$, and the repetition $x(0.80\\,\\mathrm{s})=+A$.",
            "understandingFocusDe": "Der direkte Fall prüft die zusammenhängende Deutung von Größen, Einheiten und Zeitverlauf; die charakteristischen Werte müssen aus der Gleichung mit physikalischer Bedeutung erschlossen und am Bewegungsverlauf überprüft werden.",
            "understandingFocusEn": "The direct case tests the connected interpretation of quantities, units, and time course; the characteristic values must be inferred from the equation with physical meaning and checked against the motion."
          },
          {
            "id": "frequency-form-shifted-origin-and-reversed-axis",
            "taskDemandDe": "Ein zweiter Oszillator wird durch $y(t)=0{,}030\\,\\mathrm{m}\\cdot\\sin(2\\pi\\cdot2{,}5\\,\\mathrm{Hz}\\cdot(t-0{,}10\\,\\mathrm{s}))$ beschrieben. Bestimme und deute $A$, $f$ und $T$, beschreibe Auslenkung und Bewegungsrichtung bei $t=0{,}10\\,\\mathrm{s}$ sowie die folgenden charakteristischen Zeitpunkte. Ein zweiter Sensor verwendet die entgegengesetzte positive Richtung und meldet $z(t)=-y(t)$. Erkläre, was sich in der Darstellung ändert und warum $A$, $T$ und $f$ gleich bleiben.",
            "taskDemandEn": "A second oscillator is described by $y(t)=0.030\\,\\mathrm{m}\\cdot\\sin(2\\pi\\cdot2.5\\,\\mathrm{Hz}\\cdot(t-0.10\\,\\mathrm{s}))$. Determine and interpret $A$, $f$, and $T$, and describe the displacement and direction of motion at $t=0.10\\,\\mathrm{s}$ and the following characteristic times. A second sensor uses the opposite positive direction and reports $z(t)=-y(t)$. Explain what changes in the representation and why $A$, $T$, and $f$ remain the same.",
            "expectedPerformanceDe": "Die lernende Person bestimmt $A=0{,}030\\,\\mathrm{m}$, $f=2{,}5\\,\\mathrm{Hz}$ und aus $f=1/T$ die Periodendauer $T=0{,}40\\,\\mathrm{s}$. Bei $t=0{,}10\\,\\mathrm{s}$ liegt ein Ruhelagendurchgang in positiver Richtung vor; nach $T/4=0{,}10\\,\\mathrm{s}$ wird $+A$, nach $T/2$ erneut die Ruhelage in negativer Richtung und nach $T$ derselbe Zustand erreicht. Für $z(t)$ kehren Auslenkungszeichen und bezeichnete Bewegungsrichtung um, während größter Auslenkungsbetrag und zeitliche Wiederholung unverändert bleiben.",
            "expectedPerformanceEn": "The learner determines $A=0.030\\,\\mathrm{m}$ and $f=2.5\\,\\mathrm{Hz}$ and uses $f=1/T$ to obtain $T=0.40\\,\\mathrm{s}$. At $t=0.10\\,\\mathrm{s}$ the oscillator crosses equilibrium in the positive direction; after $T/4=0.10\\,\\mathrm{s}$ it reaches $+A$, after $T/2$ it crosses equilibrium in the negative direction, and after $T$ it returns to the same state. For $z(t)$, the displacement signs and named directions of motion reverse, while the greatest displacement magnitude and temporal repetition remain unchanged.",
            "understandingFocusDe": "Der unabhängige Transfer prüft, ob die lernende Person dieselben charakteristischen Größen trotz Frequenzparametrisierung, Sinusform, verschobenem Zeitnullpunkt und umgekehrter Koordinatenwahl erkennt und die veränderten Vorzeichen von den physikalisch unveränderten Größen trennt.",
            "understandingFocusEn": "The independent transfer tests whether the learner identifies the same characteristic quantities despite frequency parameterisation, sine form, a shifted time origin, and a reversed coordinate choice, and separates changed signs from physically unchanged quantities."
          }
        ]
      }
    },
    {
      "goalId": "78cf6eff-b3bc-5444-9ef8-5d39dae8d17d",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "energieaustausch",
            "essentialUnderstandingDe": "In einer reibungsfrei idealisierten Schwingung bleibt die mechanische Gesamtenergie bei geeigneter Systemgrenze konstant, während potenzielle und kinetische Energie ortsabhängig ineinander übergehen.",
            "essentialUnderstandingEn": "In a frictionless idealized oscillation, mechanical total energy remains constant for a suitable system boundary while potential and kinetic energy interchange with position.",
            "observablePerformanceDe": "Legt System und potenziellen Nullpunkt fest, ordnet Umkehr- und Gleichgewichtslage energetisch zu und beschreibt den Austausch über eine vollständige Bewegung.",
            "observablePerformanceEn": "Defines the system and potential-energy zero, assigns energies to turning and equilibrium positions, and describes the exchange over a complete motion."
          },
          {
            "id": "einfache-bilanz",
            "essentialUnderstandingDe": "Eine Energiegleichung liefert in einfachen Fällen Beträge der Geschwindigkeit, aber ohne Bewegungsrichtung oder Phase kein eindeutiges Vorzeichen.",
            "essentialUnderstandingEn": "In simple cases, an energy equation gives speed magnitudes, but not a unique sign without direction or phase information.",
            "observablePerformanceDe": "Berechnet einfache Teilenergien und Geschwindigkeitsbeträge, prüft ihre Summe und benennt die Richtungsmehrdeutigkeit sowie die Reibungsfreiheitsannahme.",
            "observablePerformanceEn": "Calculates simple component energies and speed magnitudes, checks their sum, and identifies direction ambiguity and the frictionless assumption."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "energieaustausch",
            "einfache-bilanz"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "potentialform",
            "textDe": "Elastische Federenergie eines horizontalen Systems gegenüber gravitativer Lageenergie eines Pendels; gleicher Energiebetrag bei zwei Bewegungsrichtungen.",
            "textEn": "Elastic spring energy in a horizontal system versus gravitational potential energy of a pendulum; the same energy for two directions of motion."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "federbilanz",
            "taskDemandDe": "Ein horizontaler idealer Federoszillator hat D=20 N/m, m=0,50 kg und Amplitude A=0,10 m. Mit Epot=Dx²/2 und Nullpunkt x=0: Beschreibe den Energieaustausch, bestimme Energien und Geschwindigkeitsbeträge bei x=0 sowie x=±0,06 m und erkläre die Umkehrlagen.",
            "taskDemandEn": "An ideal horizontal spring oscillator has D=20 N/m, m=0.50 kg, and amplitude A=0.10 m. With potential energy Dx²/2 and zero at x=0, describe the energy exchange, find energies and speed magnitudes at x=0 and x=±0.06 m, and explain the turning points.",
            "expectedPerformanceDe": "System Masse+Feder, Eges=0,10 J. Bei x=0: Epot=0, Ekin=0,10 J, |v|=√0,4≈0,632 m/s. Bei ±0,06 m: Epot=0,036 J, Ekin=0,064 J, |v|=√0,256≈0,506 m/s. Bei ±A ruht die Masse momentan und Epot=0,10 J. Die Energie legt bei einer Zwischenposition die Bewegungsrichtung nicht fest.",
            "expectedPerformanceEn": "System mass+spring, total energy 0.10 J. At x=0: potential 0, kinetic 0.10 J, |v|=√0.4≈0.632 m/s. At ±0.06 m: potential 0.036 J, kinetic 0.064 J, |v|=√0.256≈0.506 m/s. At ±A the mass is momentarily at rest with potential 0.10 J. Energy does not determine the direction of motion at an intermediate position.",
            "understandingFocusDe": "Konstante Summe bei ortsabhängigem Austausch; Geschwindigkeit ist mehr als ihr Betrag.",
            "understandingFocusEn": "Constant sum with position-dependent exchange; velocity is more than speed."
          },
          {
            "id": "pendelhoehe",
            "taskDemandDe": "Ein idealisiertes Pendel mit Masse 0,20 kg wird aus Ruhe 0,050 m über seinem tiefsten Punkt freigegeben; g=10 m/s², Luftreibung und Lagerverluste werden vernachlässigt. Beschreibe qualitativ einen Hin- und Rückweg und berechne Energien und Geschwindigkeitsbeträge unten sowie 0,020 m oberhalb. Eine Kleinwinkelnäherung für die Periodendauer wird nicht benötigt.",
            "taskDemandEn": "An idealized pendulum of mass 0.20 kg is released from rest 0.050 m above its lowest point; g=10 m/s², with air resistance and bearing losses neglected. Describe an outward and return motion and calculate energies and speeds at the bottom and 0.020 m above it. No small-angle approximation for the period is needed.",
            "expectedPerformanceDe": "System Pendelkörper+Erde, potenzieller Nullpunkt unten; Eges=0,10 J. Unten Ekin=0,10 J und |v|=1,0 m/s; bei 0,020 m Epot=0,040 J, Ekin=0,060 J und |v|=√0,6≈0,775 m/s. Erreicht auf der Gegenseite wieder 0,050 m Höhe und kehrt um. Beim Hin-/Rückweg sind bei gleicher Höhe die Beträge gleich, die Bewegungsrichtungen verschieden.",
            "expectedPerformanceEn": "System pendulum object+Earth, potential zero at the bottom; total energy 0.10 J. At the bottom kinetic energy is 0.10 J and speed 1.0 m/s; at 0.020 m potential is 0.040 J, kinetic 0.060 J, and speed √0.6≈0.775 m/s. Reaches height 0.050 m again on the opposite side and turns. At equal height on outward/return motion, speeds match but directions differ.",
            "understandingFocusDe": "Lageenergie des Erde-Körper-Systems und richtungsunabhängige Energiebilanz.",
            "understandingFocusEn": "Potential energy of the Earth-object system and a direction-independent energy balance."
          }
        ]
      }
    },
    {
      "goalId": "1a037489-3c95-540b-8cae-0acd360358ee",
      "profile": {
        "archetype": "representation",
        "expectations": [
          {
            "id": "flux-uses-oriented-area-normal",
            "essentialUnderstandingDe": "Für ein homogenes Feld beschreibt Φ = B A cos(α) den magnetischen Fluss durch die aufgespannte Fläche, wobei α zwischen B und Flächennormale gemessen wird. Die Orientierungskonvention bestimmt das Vorzeichen.",
            "essentialUnderstandingEn": "For a uniform field, Φ = B A cos(α) describes magnetic flux through the spanned surface, with α measured between B and the surface normal. The orientation convention determines the sign.",
            "observablePerformanceDe": "Die lernende Person konstruiert für eine neue Schleifenlage eine Flächennormale, bestimmt Winkel und Fluss mit Einheit und erklärt, wie eine umgekehrte Normalenwahl das Vorzeichen, nicht die physische Anordnung, ändert.",
            "observablePerformanceEn": "For a fresh loop orientation, the learner constructs a surface normal, determines angle and flux with units, and explains how reversing the normal changes the sign convention rather than the physical arrangement."
          },
          {
            "id": "induction-requires-time-varying-flux",
            "essentialUnderstandingDe": "Eine Induktionsspannung entsteht durch zeitliche Änderung des Flusses, nicht durch einen bloß vorhandenen konstanten Fluss. B, wirksame Fläche oder Orientierung können die Änderung verursachen.",
            "essentialUnderstandingEn": "An induced voltage arises from a time change of flux, not from merely having a constant flux. B, effective area, or orientation can cause the change.",
            "observablePerformanceDe": "Aus einer Bewegungs- oder Zeitbeschreibung identifiziert die lernende Person die flussändernde Größe und sagt begründet Zeitabschnitte mit beziehungsweise ohne Induktionsspannung voraus.",
            "observablePerformanceEn": "From a motion or time description, the learner identifies the flux-changing quantity and justifiably predicts intervals with or without induced voltage."
          },
          {
            "id": "translation-and-boundary-cases-are-distinguished",
            "essentialUnderstandingDe": "Eine starre Schleife, die sich vollständig innerhalb eines überall gleichen homogenen Felds ohne Orientierungsänderung verschiebt, behält ihren Fluss; beim Ein- oder Austritt aus einem begrenzten Feldbereich ändert sich dagegen die vom Feld durchsetzte wirksame Fläche.",
            "essentialUnderstandingEn": "A rigid loop translating entirely within an everywhere uniform field without changing orientation retains its flux; when entering or leaving a bounded field region, the effective area threaded by the field changes.",
            "observablePerformanceDe": "Bei einer neuen Bahn mit mehreren Abschnitten markiert die lernende Person die Intervalle konstanter und veränderlicher Flussverkettung und korrigiert die pauschale Aussage, jede Bewegung im Magnetfeld induziere eine Spannung.",
            "observablePerformanceEn": "For a fresh path with several segments, the learner marks intervals of constant and changing flux linkage and corrects the blanket claim that any motion in a magnetic field induces voltage."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "flux-uses-oriented-area-normal",
            "induction-requires-time-varying-flux",
            "translation-and-boundary-cases-are-distinguished"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "flux-changing-mechanism",
            "textDe": "Änderung von B, Fläche, Orientierung oder Feldüberdeckung",
            "textEn": "Change of B, area, orientation, or field overlap"
          },
          {
            "id": "loop-motion",
            "textDe": "Rotation, Verformung, reine Translation oder Eintritt in einen begrenzten Feldbereich",
            "textEn": "Rotation, deformation, pure translation, or entry into a bounded field region"
          },
          {
            "id": "representation",
            "textDe": "Räumliche Skizze, Φ-Zeit-Diagramm oder abschnittsweise Bewegungsbeschreibung",
            "textEn": "Spatial sketch, flux-time graph, or piecewise motion description"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "rotating-loop-flux-sequence",
            "taskDemandDe": "Eine Leiterschleife wird im homogenen Feld von paralleler Flächennormale über 90° bis zur entgegengesetzten Normalenlage gedreht. Bestimme Φ an drei Lagen und sage voraus, in welchen Abschnitten eine Spannung auftreten kann.",
            "taskDemandEn": "A conducting loop is rotated in a uniform field from a parallel surface normal through 90° to the opposite normal orientation. Determine Φ at three orientations and predict in which intervals voltage can occur.",
            "expectedPerformanceDe": "Die lernende Person erhält positive maximale, null und negative maximale Flusswerte unter fester Konvention und verbindet die fortlaufende Flussänderung mit Induktion, nicht einzelne Lagewerte allein.",
            "expectedPerformanceEn": "The learner obtains positive maximum, zero, and negative maximum flux values under a fixed convention and relates continuous flux change to induction rather than isolated orientation values alone.",
            "understandingFocusDe": "Der Fall verbindet Flussdarstellung, Vorzeichen und zeitliche Änderung.",
            "understandingFocusEn": "The case connects flux representation, sign, and time variation."
          },
          {
            "id": "loop-crosses-field-boundary",
            "taskDemandDe": "Eine rechteckige Schleife bewegt sich mit konstanter Orientierung erst vollständig außerhalb, dann teilweise, vollständig und schließlich wieder teilweise innerhalb eines begrenzten homogenen Feldbereichs. Skizziere Φ(t) qualitativ und markiere Induktionsintervalle.",
            "taskDemandEn": "A rectangular loop moves with constant orientation first fully outside, then partly, fully, and finally partly inside a bounded uniform field region. Sketch Φ(t) qualitatively and mark induction intervals.",
            "expectedPerformanceDe": "Die lernende Person verwendet die überdeckte Fläche, erkennt Flussänderung nur beim Ein- und Austritt und erklärt den konstanten Fluss während vollständiger Translation im Feld.",
            "expectedPerformanceEn": "The learner uses the overlapped area, identifies flux change only during entry and exit, and explains constant flux during full translation within the field.",
            "understandingFocusDe": "Der Transfer trennt Ortsbewegung von der physikalisch entscheidenden Flussänderung.",
            "understandingFocusEn": "The transfer separates spatial motion from the physically decisive flux change."
          }
        ]
      }
    },
    {
      "goalId": "eb1ea150-ec6c-5000-bce3-f46c820dccf8",
      "profile": {
        "archetype": "procedure",
        "expectations": [
          {
            "id": "mean-voltage-tracks-flux-change-rate",
            "essentialUnderstandingDe": "Für N gleichartige Windungen ist die mittlere Induktionsspannung proportional zu N und ΔΦ/Δt. Eine größere Flussänderung in kürzerer Zeit erzeugt einen größeren Betrag; die Einheit Weber pro Sekunde ist Volt.",
            "essentialUnderstandingEn": "For N equivalent turns, mean induced voltage is proportional to N and ΔΦ/Δt. A larger flux change in a shorter time gives a larger magnitude; weber per second is a volt.",
            "observablePerformanceDe": "Die lernende Person bestimmt aus Anfangs- und Endfluss sowie Zeitintervall den mittleren Spannungsbetrag, führt Einheiten und Windungszahl korrekt und prüft die Skalierung vor der Rechnung.",
            "observablePerformanceEn": "From initial and final flux and a time interval, the learner determines mean voltage magnitude, correctly handles units and turn count, and checks the scaling before calculation."
          },
          {
            "id": "minus-sign-encodes-consistent-orientation",
            "essentialUnderstandingDe": "Das Minuszeichen in U_ind = −N ΔΦ/Δt kodiert bei festgelegter Flächen- und Umlauforientierung die Lenz-Beziehung. Ein Vorzeichen ist ohne dokumentierte Konvention nicht als absolute Polung interpretierbar.",
            "essentialUnderstandingEn": "The minus sign in U_ind = −N ΔΦ/Δt encodes the Lenz relation under specified surface and loop orientations. A sign cannot be interpreted as absolute polarity without a documented convention.",
            "observablePerformanceDe": "Die lernende Person legt Orientierung und Anschlusspolung fest, berechnet ein konsistentes Vorzeichen und erklärt, wie eine Umkehr der Konvention die Schreibweise, nicht die beobachtbare Wirkung, verändert.",
            "observablePerformanceEn": "The learner specifies orientation and terminal polarity, calculates a consistent sign, and explains how reversing the convention changes the notation rather than the observable effect."
          },
          {
            "id": "induced-current-opposes-flux-change",
            "essentialUnderstandingDe": "Im geschlossenen Kreis erzeugt der Induktionsstrom ein Magnetfeld, das der verursachenden Flussänderung entgegenwirkt, nicht dem vorhandenen Fluss schlechthin. Im offenen Kreis kann Spannung bestehen, ohne dass ein anhaltender Induktionsstrom fließt.",
            "essentialUnderstandingEn": "In a closed circuit, induced current creates a magnetic field opposing the causal change in flux, not the existing flux as such. In an open circuit, voltage can exist without a sustained induced current.",
            "observablePerformanceDe": "Die lernende Person konstruiert aus zunehmendem oder abnehmendem Fluss zuerst die entgegenwirkende induzierte Feldrichtung und daraus die Stromrichtung; für einen offenen Kreis begrenzt sie die Aussage auf Spannungspolung.",
            "observablePerformanceEn": "From increasing or decreasing flux, the learner first constructs the opposing induced-field direction and then the current direction; for an open circuit, the learner limits the claim to voltage polarity."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "mean-voltage-tracks-flux-change-rate",
            "minus-sign-encodes-consistent-orientation",
            "induced-current-opposes-flux-change"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "flux-history",
            "textDe": "Zunehmender, abnehmender oder unveränderter Fluss mit verschiedenen Zeitintervallen",
            "textEn": "Increasing, decreasing, or constant flux over different time intervals"
          },
          {
            "id": "orientation-choice",
            "textDe": "Flächennormale, Wicklungssinn und markierte Anschlusspolung",
            "textEn": "Surface normal, winding sense, and marked terminal polarity"
          },
          {
            "id": "circuit-state",
            "textDe": "Offener Stromkreis oder geschlossener Kreis mit bestimmbarer Stromrichtung",
            "textEn": "Open circuit or closed loop with a determinable current direction"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "magnet-approach-and-retreat",
            "taskDemandDe": "Ein Stabmagnet nähert sich einer Spule in 0,20 s und wird danach langsamer entfernt; Flusswerte und Wicklungssinn sind gegeben. Bestimme mittlere Spannungen und begründe die Stromrichtungen im geschlossenen Kreis.",
            "taskDemandEn": "A bar magnet approaches a coil in 0.20 s and is then withdrawn more slowly; flux values and winding sense are supplied. Determine mean voltages and justify current directions in the closed loop.",
            "expectedPerformanceDe": "Die lernende Person berechnet Betrag und Vorzeichen unter eigener dokumentierter Konvention, erkennt den kleineren Betrag beim langsameren Rückzug und konstruiert entgegengesetzte induzierte Feldrichtungen für Zu- und Abnahme.",
            "expectedPerformanceEn": "The learner calculates magnitude and sign under a documented convention, recognizes the smaller magnitude during slower withdrawal, and constructs opposite induced-field directions for increase and decrease.",
            "understandingFocusDe": "Der Fall prüft Rate, Vorzeichenkonvention und Lenz-Wirkung gemeinsam.",
            "understandingFocusEn": "The case jointly tests rate, sign convention, and the Lenz effect."
          },
          {
            "id": "open-loop-reversal-transfer",
            "taskDemandDe": "Dieselbe Spule wird offen betrieben; Bewegung und Wicklungsorientierung werden nacheinander umgekehrt. Sage die Anschluss-Polung voraus und beurteile die Aussage, die Lenz-Regel verlange in jedem Fall einen Strom.",
            "taskDemandEn": "The same coil is operated open-circuit; motion and winding orientation are reversed in turn. Predict terminal polarity and judge the claim that Lenz's law requires a current in every case.",
            "expectedPerformanceDe": "Die lernende Person verfolgt die Vorzeichenänderungen konsistent, unterscheidet induzierte Spannung von geschlossenem Strompfad und weist die pauschale Strombehauptung zurück.",
            "expectedPerformanceEn": "The learner consistently tracks sign changes, distinguishes induced voltage from a closed current path, and rejects the blanket current claim.",
            "understandingFocusDe": "Der Transfer deckt eine mechanische Anwendung der Lenz-Regel ohne Stromkreisprüfung auf.",
            "understandingFocusEn": "The transfer reveals mechanical use of Lenz's law without checking the circuit."
          }
        ]
      }
    },
    {
      "goalId": "6270e558-d657-5363-a6b2-e49a032a453b",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "phase-to-screen",
            "essentialUnderstandingDe": "Bei senkrechtem kohärentem Einfall erklären ganzzahlige Gangunterschiede die hellen Doppelspaltmaxima. Fernfeld erlaubt Δs≈d sinθ; y=L tanθ folgt aus der Schirmgeometrie. Erst die zusätzliche Kleinwinkelannahme macht die Streifenabstände näherungsweise konstant.",
            "essentialUnderstandingEn": "For normal coherent incidence, integer-wavelength path differences explain bright double-slit maxima. The far field permits Δs≈d sinθ; y=L tanθ follows from screen geometry. Only the additional small-angle assumption makes fringe spacings approximately constant.",
            "observablePerformanceDe": "Leitet die Maximabedingung aus Phasen/Gangunterschied her, übersetzt Winkel in Schirmorte und begründet anhand der Messgeometrie, ob eine Linearisierung ausreicht.",
            "observablePerformanceEn": "Derives the maximum condition from phase/path difference, converts angles to screen positions and justifies linearisation using the measurement geometry."
          },
          {
            "id": "inverse-and-colour-model",
            "essentialUnderstandingDe": "Aus bekannten Spalt- und Schirmabständen und zugeordneter Ordnung lässt sich eine unbekannte Wellenlänge erschließen. Verschiedene Wellenlängen haben bei derselben Ordnung verschiedene Winkel, im Zentrum aber ein gemeinsames Maximum.",
            "essentialUnderstandingEn": "Known slit and screen distances and an assigned order allow an unknown wavelength to be inferred. Different wavelengths have different angles for the same order but share a central maximum.",
            "observablePerformanceDe": "Wertet neue Schirmdaten mit Einheiten und Ordnungsbegründung aus und erklärt die Veränderung eines Musters bei einer zweiten Wellenlänge; unterscheidet Modellvorhersage von einer tatsächlich gemessenen Größe.",
            "observablePerformanceEn": "Analyses fresh screen data with units and justified orders and explains how a second wavelength changes the pattern; distinguishes model predictions from measured quantities."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "phase-to-screen",
            "inverse-and-colour-model"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "measurement-versus-prediction",
            "textDe": "Unbekannte Wellenlänge aus mehreren Maxima erschließen statt nur einen vorgegebenen Zahlenwert einsetzen; danach eine neue Farbe vorhersagen.",
            "textEn": "Infer an unknown wavelength from several maxima rather than substituting a supplied wavelength; then predict a new colour."
          },
          {
            "id": "geometry-and-source-regime",
            "textDe": "Schirmabstand, zugeordnete Ordnung oder Spektralzusammensetzung ändern; Kleinwinkel- und Fernfeldannahme jeweils getrennt prüfen.",
            "textEn": "Change screen distance, assigned order or spectral composition; assess far-field and small-angle assumptions separately."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "fresh-fringe-measurement",
            "taskDemandDe": "Gelieferte Laboraufnahme: d=0,20mm, L=0,80m. Die hellen Streifen m=±1 und±2 liegen bei±2,60mm und±5,20mm. Erläutere ein geeignetes Auswertungsmodell, bestimme λ und sage voraus, was bei Verdopplung von L bei unveränderter Quelle geschieht.",
            "taskDemandEn": "Supplied laboratory image: d=0.20mm, L=0.80m. Bright fringes m=±1 and±2 lie at±2.60mm and±5.20mm. Explain a suitable model, determine λ and predict the effect of doubling L at unchanged source.",
            "expectedPerformanceDe": "Begründet konstruktive Phasenlage und erhält etwa650nm aus beiden Ordnungen; θ₂≈0,372° stützt die Kleinwinkelnäherung. Bei verdoppeltem L verdoppeln sich die Schirmorte bei gleichbleibenden Winkeln. Die Aufnahme wird nicht als unmittelbar gemessene Wellenlänge ausgegeben.",
            "expectedPerformanceEn": "Justifies constructive phase and obtains about650nm from both orders; θ₂≈0.372° supports the approximation. Doubling L doubles screen positions while angles stay unchanged. The photograph is not described as directly measuring wavelength.",
            "understandingFocusDe": "Messinversion, Phasengrundlage und geometrischer Transfer tragen gemeinsam die Erklärung.",
            "understandingFocusEn": "Measurement inversion, phase reasoning and geometric transfer jointly support the explanation."
          },
          {
            "id": "two-colours-without-template",
            "taskDemandDe": "Ohne Abbildung: ein idealisierter Doppelspalt mit d=0,20mm und L=0,80m erhält Licht mit650nm und zusätzlich475nm. Konstruiere eine qualitative symmetrische Skizze der ersten Maxima, berechne ihre Orte und beurteile, ob jedes helle Maximum beider Farben zusammenfällt.",
            "taskDemandEn": "Without a figure, an idealised double slit with d=0.20mm and L=0.80m receives650nm light plus475nm light. Construct a qualitative symmetric sketch of first maxima, calculate their positions and assess whether every bright maximum coincides for both colours.",
            "expectedPerformanceDe": "Ordnet±1,90mm der475nm-Komponente und±2,60mm der650nm-Komponente zu, erklärt kürzere Wellen näher am Zentrum und gemeinsames m0. Weitere Überlappungen benötigen passende ganzzahlige Ordnungen; bloße Helligkeit bedeutet keine gemeinsame Wellenlänge. Selbst gezeichnete Zuordnung, nicht Kopie des Buchbilds.",
            "expectedPerformanceEn": "Assigns±1.90mm to475nm and±2.60mm to650nm, explains the shorter wavelength being nearer the centre and shared m0. Other overlaps require suitable integer orders; brightness does not imply one wavelength. Independently constructed mapping, not a copied book figure.",
            "understandingFocusDe": "Frischer polychromatischer Transfer desselben Doppelspaltmodells.",
            "understandingFocusEn": "Fresh polychromatic transfer of the same double-slit model."
          }
        ]
      }
    },
    {
      "goalId": "4c919da9-157a-5a14-a725-f7343975c9ab",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "construct-standing-field-pattern",
            "essentialUnderstandingDe": "Zwei kohärente gleichfrequente Wellen gleicher Amplitude, die entgegengesetzt laufen, erzeugen für eine betrachtete Feldkomponente ein ortsfestes Amplitudenmuster. Knoten bleiben für diese Komponente stets null, während Bäuche zeitlich schwingen; elektrische und magnetische Muster können räumlich versetzt sein.",
            "essentialUnderstandingEn": "Two coherent equal-frequency waves of equal amplitude travelling in opposite directions produce a stationary amplitude pattern for a selected field component. Nodes remain zero for that component while antinodes oscillate in time; electric and magnetic patterns may be spatially offset.",
            "observablePerformanceDe": "Die lernende Person überlagert zwei gegenläufige Wellen in Skizze oder Gleichung, markiert Knoten und Bäuche der ausdrücklich benannten Komponente und beschreibt deren zeitliches Verhalten ohne ein statisches Feld anzunehmen.",
            "observablePerformanceEn": "The learner superposes two counter-propagating waves in a diagram or equation, marks nodes and antinodes of the explicitly named component, and describes their time dependence without assuming a static field."
          },
          {
            "id": "apply-explicit-boundary-conditions",
            "essentialUnderstandingDe": "Zulässige Moden folgen aus den konkreten Randbedingungen und der Resonatorlänge. Für eine elektrische Feldkomponente, die an zwei ideal leitenden Endflächen verschwindet, gilt L = nλ/2; andere Randbedingungen können eine andere Modenfolge erzeugen.",
            "essentialUnderstandingEn": "Allowed modes follow from the specific boundary conditions and resonator length. For an electric-field component that vanishes at two ideal conducting end surfaces, L = nλ/2; different boundary conditions can produce a different mode sequence.",
            "observablePerformanceDe": "Die lernende Person leitet für angegebene Randbedingungen die zulässigen Wellenlängen und Frequenzen her, sagt Änderungen bei veränderter Länge voraus und verweigert eine Modenformel, wenn die Randbedingungen nicht spezifiziert sind.",
            "observablePerformanceEn": "The learner derives allowed wavelengths and frequencies from stated boundary conditions, predicts changes under altered length, and declines to apply a mode formula when boundary conditions are unspecified."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "construct-standing-field-pattern",
            "apply-explicit-boundary-conditions"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "representation",
            "textDe": "Momentane Feldkurven, Amplitudenhülle oder Gleichungsdarstellung",
            "textEn": "Instantaneous field curves, amplitude envelope, or equation representation"
          },
          {
            "id": "field-component",
            "textDe": "Elektrische oder magnetische Feldkomponente mit expliziter Benennung",
            "textEn": "Explicitly named electric or magnetic field component"
          },
          {
            "id": "resonator-change",
            "textDe": "Geänderte Länge, Modenzahl oder ausdrücklich geänderte Randbedingung",
            "textEn": "Changed length, mode number, or explicitly changed boundary condition"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "conducting-end-cavity-modes",
            "taskDemandDe": "In einem eindimensional idealisierten Resonator der Länge L verschwindet die betrachtete tangentiale elektrische Feldkomponente an beiden leitenden Enden. Konstruiere die ersten drei Moden, bestimme ihre Wellenlängen und Frequenzen und sage die Änderung der Grundfrequenz bei Verdopplung von L voraus.",
            "taskDemandEn": "In an idealized one-dimensional resonator of length L, the selected tangential electric-field component vanishes at both conducting ends. Construct the first three modes, determine their wavelengths and frequencies, and predict the change in fundamental frequency when L is doubled.",
            "expectedPerformanceDe": "Die lernende Person setzt elektrische Knoten an beide Enden, erhält λ_n = 2L/n und f_n = nc/(2L), zeichnet n Halbwellen und begründet die Halbierung der Grundfrequenz bei doppelter Länge.",
            "expectedPerformanceEn": "The learner places electric nodes at both ends, obtains λ_n = 2L/n and f_n = nc/(2L), draws n half-waves, and justifies halving the fundamental frequency when length doubles.",
            "understandingFocusDe": "Der Fall verbindet explizite Randbedingungen mit Muster, Modenzahl und Skalierung.",
            "understandingFocusEn": "The case connects explicit boundary conditions with pattern, mode number, and scaling."
          },
          {
            "id": "counterpropagating-wave-snapshots",
            "taskDemandDe": "Zwei angegebene gegenläufige elektrische Feldwellen werden zu drei verschiedenen Zeitpunkten überlagert. Bestimme die resultierende Feldfunktion, markiere ortsfeste Knoten und Bäuche und erkläre, weshalb das Muster trotz zeitlich wechselnder Feldwerte nicht fortschreitet.",
            "taskDemandEn": "Two specified counter-propagating electric-field waves are superposed at three different times. Determine the resulting field function, mark stationary nodes and antinodes, and explain why the pattern does not travel even though field values change with time.",
            "expectedPerformanceDe": "Die lernende Person formt die Summe in ein Produkt aus Orts- und Zeitfaktor um, identifiziert zeitunabhängige Knotenlagen und zeitlich schwingende Bauchwerte und trennt stationäres Amplitudenmuster von statischem Feld.",
            "expectedPerformanceEn": "The learner rewrites the sum as a product of spatial and temporal factors, identifies time-independent node positions and time-varying antinode values, and distinguishes a stationary amplitude pattern from a static field.",
            "understandingFocusDe": "Der unabhängige Fall prüft die Entstehung des Musters direkt aus Superposition statt aus einer auswendig gelernten Resonatorzeichnung.",
            "understandingFocusEn": "The independent case tests formation of the pattern directly from superposition rather than a memorised resonator diagram."
          }
        ]
      }
    },
    {
      "goalId": "51bc5513-6879-548f-b19a-9746b667f1a3",
      "profile": {
        "archetype": "concept",
        "expectations": [
          {
            "id": "betragsquadrat-dichte",
            "essentialUnderstandingDe": "|ψ|² ist eine nichtnegative Nachweiswahrscheinlichkeitsdichte; die Wahrscheinlichkeit eines endlichen Raumbereichs ergibt sich aus seiner gesamten Dichte und seinem Umfang.",
            "essentialUnderstandingEn": "|ψ|² is a nonnegative detection-probability density; the probability of a finite region depends on the density throughout it and its extent.",
            "observablePerformanceDe": "Erläutert den Unterschied zwischen Amplitude, Dichte und Bereichswahrscheinlichkeit und vergleicht geeignete Bereiche anhand dieser Beziehung.",
            "observablePerformanceEn": "Explains the difference between amplitude, density and regional probability and compares suitable regions using this relationship."
          },
          {
            "id": "ensemble-statt-bahn",
            "essentialUnderstandingDe": "Die Wellenfunktion erlaubt statistische Aussagen über gleich präparierte Systeme, nicht die Vorhersage eines einzelnen Orts oder eine klassische Bahn.",
            "essentialUnderstandingEn": "The wave function permits statistical statements about identically prepared systems, not prediction of an individual position or a classical trajectory.",
            "observablePerformanceDe": "Sagt relative Nachweishäufigkeiten in einem geänderten Fall voraus und erklärt die Rolle von Vorzeichen, Bereichsgröße und Normierung qualitativ.",
            "observablePerformanceEn": "Predicts relative detection frequencies in a changed case and qualitatively explains the roles of sign, region size and normalization."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "betragsquadrat-dichte",
            "ensemble-statt-bahn"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "amplitude-und-bereich",
            "textDe": "Vorzeichenwechsel bei gleicher Größe gegenüber unterschiedlichen Dichten und Bereichsgrößen.",
            "textEn": "A sign change at equal magnitude versus different densities and region sizes."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "vorzeichen-der-amplitude",
            "taskDemandDe": "Für einen reellen eindimensionalen Zustand ist ψ in zwei gleich langen kleinen Intervallen näherungsweise +a beziehungsweise −a. Erläutere die Nachweiswahrscheinlichkeiten beider Intervalle und die Bedeutung der negativen Amplitude, ohne den Zustand neu zu berechnen.",
            "taskDemandEn": "For a real one-dimensional state, ψ is approximately +a and −a in two equally long small intervals. Explain the detection probabilities of the intervals and the meaning of the negative amplitude without recalculating the state.",
            "expectedPerformanceDe": "Beide Intervalle besitzen näherungsweise dieselbe Dichte a² und wegen gleicher Länge dieselbe Nachweiswahrscheinlichkeit. Ein negatives ψ bedeutet keine negative Wahrscheinlichkeit; allgemein wird |ψ|² verwendet. Viele Messungen ergeben entsprechende relative Häufigkeiten, nicht festgelegte Einzelorte.",
            "expectedPerformanceEn": "Both intervals have approximately the same density a² and, because their lengths are equal, the same detection probability. Negative ψ does not imply negative probability; in general |ψ|² is used. Many measurements give corresponding relative frequencies, not predetermined individual positions.",
            "understandingFocusDe": "Das Vorzeichen der Amplitude ist nicht das Vorzeichen einer Wahrscheinlichkeit.",
            "understandingFocusEn": "The sign of an amplitude is not the sign of a probability."
          },
          {
            "id": "bereichsgroesse",
            "taskDemandDe": "In einem eindimensionalen Modell sei die Dichte in einem Intervall A der Länge l ungefähr 2ρ und in einem getrennten Intervall B der Länge 3l ungefähr ρ, mit ρ>0. Vergleiche die Nachweiswahrscheinlichkeiten und erläutere, warum die größere lokale Dichte nicht entscheidet.",
            "taskDemandEn": "In a one-dimensional model, density is approximately 2ρ in interval A of length l and approximately ρ in a separate interval B of length 3l, with ρ>0. Compare detection probabilities and explain why larger local density does not settle the comparison.",
            "expectedPerformanceDe": "Die Beiträge sind P_A≈2ρl und P_B≈3ρl, also Verhältnis 2:3. B ist trotz kleinerer Dichte insgesamt wahrscheinlicher. Dichte hat hier die Einheit 1/Länge, Wahrscheinlichkeit ist dimensionslos; die gesamte Dichte des normierten Zustands ergibt Wahrscheinlichkeit 1. Die Rechnung bestimmt keine sichere Einzelposition.",
            "expectedPerformanceEn": "The contributions are P_A≈2ρl and P_B≈3ρl, hence ratio 2:3. B is more probable overall despite its smaller density. Density has unit inverse length here, while probability is dimensionless; the full density of a normalized state gives probability 1. The calculation determines no certain individual position.",
            "understandingFocusDe": "Bereichswahrscheinlichkeit gewichtet lokale Dichte mit räumlicher Ausdehnung.",
            "understandingFocusEn": "Regional probability weights local density by spatial extent."
          }
        ]
      }
    },
    {
      "goalId": "ef6d5067-96b0-5388-87dd-5ac4e6a3e313",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "potential-idealisierung",
            "essentialUnderstandingDe": "Der unendliche Kasten besitzt einen flachen Innenbereich und harte Wände; das atomare Coulombpotential ist radial, anziehend und geht für große Entfernung gegen null.",
            "essentialUnderstandingEn": "The infinite box has a flat interior and hard walls; the atomic Coulomb potential is radial, attractive and approaches zero at large distance.",
            "observablePerformanceDe": "Vergleicht Potentialformen und räumliche Randannahmen und erklärt, welche Aspekte der Quantisierung das Kastenmodell vereinfacht veranschaulicht.",
            "observablePerformanceEn": "Compares potential shapes and spatial boundary assumptions and explains which aspects of quantization the box model illustrates in simplified form."
          },
          {
            "id": "aussagegrenzen-pruefen",
            "essentialUnderstandingDe": "Unterschiedliche Potentiale erzeugen unterschiedliche Energiefolgen und räumliche Zustände; qualitative Quantisierung ist keine quantitative Übereinstimmung der Atommodelle.",
            "essentialUnderstandingEn": "Different potentials produce different energy sequences and spatial states; qualitative quantization does not mean quantitative agreement between atomic models.",
            "observablePerformanceDe": "Prüft eine konkrete Vorhersage des Kastenmodells an vorgegebenen Atomdaten oder räumlichen Eigenschaften und benennt eine begründete Nutzungsgrenze.",
            "observablePerformanceEn": "Tests a concrete box-model prediction against supplied atomic data or spatial properties and states a justified limit to its use."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "potential-idealisierung",
            "aussagegrenzen-pruefen"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "spektral-raeumlich",
            "textDe": "Abstände der Energieniveaus gegenüber räumlichen Begrenzungen und Ionisation.",
            "textEn": "Energy-level spacings versus spatial boundaries and ionization."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "niveauabstaende-vergleichen",
            "taskDemandDe": "Ein unendlicher Kasten liefert E_n=Cn² mit C>0; Wasserstoff liefert E_n=−13,6 eV/n². Vergleiche die Abstände 1→2 und 2→3 und beurteile, ob eine einzige Anpassung von C das Kastenmodell zum quantitativen Wasserstoffmodell macht.",
            "taskDemandEn": "An infinite box gives E_n=Cn² with C>0; hydrogen gives E_n=−13.6 eV/n². Compare spacings 1→2 and 2→3 and judge whether adjusting C once makes the box a quantitative hydrogen model.",
            "expectedPerformanceDe": "Beim Kasten wachsen die Abstände von 3C auf 5C; beim Wasserstoff sinken sie von 10,2 eV auf etwa 1,889 eV. Eine Skalierung von C kehrt diesen Trend nicht um. Das Kastenmodell zeigt diskrete Zustände aufgrund von Einengung, bildet aber die Coulomb-Energiefolge nicht quantitativ ab.",
            "expectedPerformanceEn": "Box spacings increase from 3C to 5C, while hydrogen spacings decrease from 10.2 eV to about 1.889 eV. Scaling C cannot reverse this trend. The box illustrates discrete states due to confinement but does not quantitatively reproduce the Coulomb energy sequence.",
            "understandingFocusDe": "Ein modellbedingter Trend wird geprüft, nicht nur eine einzelne Zahl passend gemacht.",
            "understandingFocusEn": "A model-dependent trend is tested rather than merely fitting one number."
          },
          {
            "id": "harte-wand-atom",
            "taskDemandDe": "Eine Simulation zeigt einen unendlichen Kasten mit ψ=0 außerhalb einer festen Breite. Eine zweite zeigt für ein gebundenes Coulomb-System eine nach außen abklingende Dichte ohne feste Außenwand sowie einen freien Bereich oberhalb der Ionisationsgrenze. Erkläre Unterschiede und sinnvollen Gebrauch des Kastenmodells.",
            "taskDemandEn": "One simulation shows an infinite box with ψ=0 outside a fixed width. Another shows a bound Coulomb system with outward-decaying density but no fixed outer wall, and a free regime above the ionization threshold. Explain the differences and a sensible use of the box model.",
            "expectedPerformanceDe": "Die unendlich hohen Wände schließen äußere Nachweise im Kasten strikt aus und erlauben keine Überwindung durch endliche Energie. Im Coulombmodell ist ein gebundener Zustand räumlich nicht durch eine harte Außenwand begrenzt; zugeführte Ionisationsenergie kann einen freien Zustand ermöglichen. Der Kasten veranschaulicht stehende Zustände und Quantisierung, nicht eine wirkliche Atomwand oder den richtigen Ionisationsmechanismus.",
            "expectedPerformanceEn": "Infinite walls strictly exclude outside detections in the box and cannot be overcome with finite energy. A bound Coulomb state is not spatially confined by a hard outer wall; supplied ionization energy can permit a free state. The box illustrates stationary states and quantization, not a real atomic wall or the correct ionization mechanism.",
            "understandingFocusDe": "Räumliche und energetische Gültigkeitsgrenzen werden am tatsächlich verwendeten Potential festgemacht.",
            "understandingFocusEn": "Spatial and energetic validity limits are tied to the potential actually used."
          }
        ]
      }
    },
    {
      "goalId": "48e3d6c2-00bf-5afd-8846-ba3dbd01e96d",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "positron-is-electron-antiparticle",
            "essentialUnderstandingDe": "Das Positron ist das Antiteilchen des Elektrons: Es besitzt dieselbe Ruhemasse und den gleichen Betrag, aber das entgegengesetzte Vorzeichen der elektrischen Ladung. Diese Zuordnung ist eine Teilcheneigenschaft und keine Aussage darüber, dass ein einzelnes Positron bereits vernichtet sein muss.",
            "essentialUnderstandingEn": "The positron is the electron's antiparticle: it has the same rest mass and the same magnitude but opposite sign of electric charge. This assignment is a particle property and does not state that an individual positron must already have annihilated.",
            "observablePerformanceDe": "Die lernende Person liest aus einer neuen Teilchentabelle Masse und Ladung ab, identifiziert das Positron begründet als Elektron-Antiteilchen, hält Betragsgleichheit und Vorzeichenwechsel auseinander und verwirft eine Zuordnung nur aufgrund ähnlicher Namen oder Energiewerte.",
            "observablePerformanceEn": "From a fresh particle table, the learner reads mass and charge, justifiably identifies the positron as the electron's antiparticle, keeps equal magnitude distinct from reversed sign, and rejects an assignment based only on similar names or energy values."
          },
          {
            "id": "rest-energy-balance-gives-near-511-kev-photons",
            "essentialUnderstandingDe": "Bei der Vernichtung eines im Schwerpunktsystem annähernd ruhenden Elektron-Positron-Paares geht die Ruheenergie von ungefähr 2m_e c² in Photonenenergie über. Im dominierenden Zwei-Photonen-Fall besitzen die Photonen bei vernachlässigbarer Anfangsbewegung jeweils ungefähr 511 keV; kleine Anfangs- oder Bindungsbeiträge begrenzen die Exaktheit dieser Angabe.",
            "essentialUnderstandingEn": "When an electron–positron pair approximately at rest in its center-of-momentum frame annihilates, rest energy of about 2m_e c² becomes photon energy. In the dominant two-photon case, negligible initial motion gives each photon about 511 keV; small initial-motion or binding contributions limit the exactness of this value.",
            "observablePerformanceDe": "Die lernende Person stellt für ein unabhängig gegebenes annähernd ruhendes Paar die Energiegleichung mit Einheiten auf, bestimmt die ungefähre Energie pro Photon und nennt die Ruhe- und Zwei-Photonen-Annahmen, statt den Zahlenwert ohne System- und Zustandsbezug einzusetzen.",
            "observablePerformanceEn": "For an independently given pair that is approximately at rest, the learner sets up the energy equation with units, determines the approximate energy per photon, and states the rest and two-photon assumptions rather than substituting the number without reference to the system and state."
          },
          {
            "id": "vector-momentum-controls-photon-directions",
            "essentialUnderstandingDe": "Energieerhaltung allein bestimmt die Richtungen nicht. Bei nahezu verschwindendem Anfangsimpuls muss der Vektorimpuls der beiden Photonen nahezu null ergeben, weshalb sie nahezu entgegengesetzt ausgesandt werden; bei kleinem Gesamtimpuls können Richtungen und Energien im Laborsystem abweichen, während die Gesamtbilanz erhalten bleibt.",
            "essentialUnderstandingEn": "Energy conservation alone does not determine the directions. When initial momentum is nearly zero, the vector sum of the two photon momenta must be nearly zero, so they are emitted in nearly opposite directions; with small total momentum, their directions and energies can differ in the laboratory frame while the total balance remains conserved.",
            "observablePerformanceDe": "Die lernende Person konstruiert aus frischen Energie- und Impulsangaben ein beschriftetes Vektordiagramm, prüft zwei vorgeschlagene Photonenkonfigurationen gegen beide Erhaltungssätze und erklärt für einen Fall mit von null verschiedenem Gesamtimpuls qualitativ die Abweichung von exakt gegenläufigen gleichenergetischen Photonen.",
            "observablePerformanceEn": "From fresh energy and momentum data, the learner constructs a labelled vector diagram, checks two proposed photon configurations against both conservation laws, and qualitatively explains the departure from exactly opposite equal-energy photons when total momentum is nonzero."
          },
          {
            "id": "pet-uses-annihilation-photons-only-as-measurement-signals",
            "essentialUnderstandingDe": "Die bei der Paarvernichtung entstehenden Photonen können in der PET als detektierbare Messsignale dienen. Sie liefern das hier beanspruchte physikalische Signal, sind aber weder die Energieversorgung des Scanners noch selbst ein unmittelbar sichtbares PET-Bild; weitere Orts- und Rekonstruktionsverfahren gehören nicht zu diesem Ziel.",
            "essentialUnderstandingEn": "The photons produced in pair annihilation can serve as detectable measurement signals in PET. They provide the physical signal claimed here but are neither the scanner's energy supply nor themselves a directly visible PET image; further localization and reconstruction procedures are outside this goal.",
            "observablePerformanceDe": "Die lernende Person ordnet in einem neuen PET-Ereignisprotokoll zwei energiemäßig passende Detektionssignale der Paarvernichtung zu, erklärt ihre physikalische Herkunft und begrenzt die Aussage auf die Rolle als Messsignal, ohne Energieversorgung, Ortsbestimmung oder Bildinhalt zu erfinden.",
            "observablePerformanceEn": "In a fresh PET event record, the learner associates two energy-compatible detection signals with pair annihilation, explains their physical origin, and limits the conclusion to their role as measurement signals without inventing energy supply, localization, or image content."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "positron-is-electron-antiparticle",
            "rest-energy-balance-gives-near-511-kev-photons",
            "vector-momentum-controls-photon-directions",
            "pet-uses-annihilation-photons-only-as-measurement-signals"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 3,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "initial-pair-momentum",
            "textDe": "Annähernd ruhendes Paar im Schwerpunktsystem oder Paar mit kleinem, aber von null verschiedenem Gesamtimpuls im Laborsystem",
            "textEn": "Pair approximately at rest in its center-of-momentum frame or pair with small but nonzero total momentum in the laboratory frame"
          },
          {
            "id": "conservation-representation",
            "textDe": "Ruheenergie- und Photonenenergiebilanz, Vektorimpulsdiagramm, Teilchentabelle oder geprüftes Ereignisprotokoll",
            "textEn": "Rest-energy and photon-energy balance, vector-momentum diagram, particle table, or supplied event record"
          },
          {
            "id": "photon-outcome",
            "textDe": "Nahezu gleiche oder unterschiedliche Photonenergien sowie exakt angenäherte oder leicht abweichende Gegenrichtung",
            "textEn": "Nearly equal or unequal photon energies and approximately exact or slightly deviating opposite directions"
          },
          {
            "id": "claim-boundary",
            "textDe": "Antiteilcheneigenschaft, Paarvernichtungsbilanz und PET-Messsignal gegenüber Energiequelle oder unmittelbar sichtbarem Bildinhalt",
            "textEn": "Antiparticle property, pair-annihilation balance, and PET measurement signal contrasted with an energy source or directly visible image content"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "stationary-pair-energy-and-momentum-balance",
            "taskDemandDe": "Ein bereitgestelltes Modell setzt Elektron und Positron im Schwerpunktsystem näherungsweise in Ruhe und gibt m_e c² = 511 keV an. Stelle Energie- und Vektorimpulsbilanz für den dominierenden Zwei-Photonen-Fall auf, bestimme die Photonenergien und zeichne zulässige Richtungen.",
            "taskDemandEn": "A supplied model treats an electron and positron as approximately at rest in their center-of-momentum frame and gives m_e c² = 511 keV. Set up the energy and vector-momentum balance for the dominant two-photon case, determine the photon energies, and draw allowed directions.",
            "expectedPerformanceDe": "Die lernende Person erhält ungefähr 1022 keV Gesamtenergie und 511 keV pro Photon, zeichnet nahezu gleich große entgegengesetzte Impulsvektoren und begründet Anzahl, Energien und Richtungen gemeinsam aus beiden Erhaltungssätzen und den genannten Näherungen.",
            "expectedPerformanceEn": "The learner obtains about 1022 keV total energy and 511 keV per photon, draws nearly equal opposite momentum vectors, and jointly justifies the number, energies, and directions from both conservation laws and the stated approximations.",
            "understandingFocusDe": "Der Ruhefall prüft, ob Ruheenergie und Vektorimpuls eine zusammenhängende physikalische Erklärung statt zweier Merksätze bilden.",
            "understandingFocusEn": "The rest case tests whether rest energy and vector momentum form one coherent physical explanation rather than two memorized statements."
          },
          {
            "id": "moving-pair-candidate-outcomes",
            "taskDemandDe": "Für ein Elektron-Positron-Paar mit kleinem vorgegebenem Gesamtimpuls werden drei mögliche Zwei-Photonen-Ausgänge als Energie- und Vektordaten angeboten. Wähle die mit Energie- und Impulserhaltung vereinbare Konfiguration und erkläre, warum exakt gegenläufige gleichenergetische Photonen hier nicht zwingend sind.",
            "taskDemandEn": "For an electron–positron pair with a small supplied total momentum, three possible two-photon outcomes are offered as energy and vector data. Choose the configuration consistent with energy and momentum conservation and explain why exactly opposite equal-energy photons are not required here.",
            "expectedPerformanceDe": "Die lernende Person summiert Energien und Impulsvektoren getrennt, verwirft Konfigurationen mit falscher Gesamtbilanz und ordnet die verbleibende Richtungs- und Energieasymmetrie dem nicht verschwindenden Anfangsimpuls zu, ohne klassische verborgene Photonbahnen zu erfinden.",
            "expectedPerformanceEn": "The learner separately sums energies and momentum vectors, rejects configurations with an incorrect total balance, and attributes the remaining directional and energy asymmetry to the nonzero initial momentum without inventing classical hidden photon paths.",
            "understandingFocusDe": "Der geänderte Bezugsfall erzwingt Transfer der beiden Erhaltungssätze jenseits der symmetrischen 511-keV-Situation.",
            "understandingFocusEn": "The changed reference case requires transfer of both conservation laws beyond the symmetric 511 keV situation."
          },
          {
            "id": "bounded-pet-detection-record",
            "taskDemandDe": "Ein simuliertes PET-Protokoll enthält zwei einem bereitgestellten Vernichtungsereignis zugeordnete Detektionssignale mit Energien nahe 511 keV. Eine Aussage bezeichnet die Photonen als Energiequelle des Scanners, eine zweite bereits als das fertige sichtbare Bild. Erkläre die physikalische Herkunft und die begrenzte Rolle der Signale.",
            "taskDemandEn": "A simulated PET record contains two detection signals assigned to a supplied annihilation event, with energies near 511 keV. One statement calls the photons the scanner's energy source and another calls them the finished visible image. Explain the physical origin and bounded role of the signals.",
            "expectedPerformanceDe": "Die lernende Person deutet die Signale als detektierte Vernichtungsphotonen, verbindet ihre Größenordnung mit der Paar-Ruheenergie und weist Energiequellen- und Fertigbildbehauptung zurück. Sie bleibt beim Messsignal und führt keine Orts- oder Rekonstruktionsmethode ein.",
            "expectedPerformanceEn": "The learner interprets the signals as detected annihilation photons, connects their energy scale with the pair rest energy, and rejects both the energy-source and finished-image claims. The learner stops at the measurement signal and introduces no localization or reconstruction method.",
            "understandingFocusDe": "Der PET-Fall prüft ausschließlich die enge Anwendung der Vernichtungsphotonen als Messsignal.",
            "understandingFocusEn": "The PET case tests only the narrow application of annihilation photons as measurement signals."
          }
        ]
      }
    },
    {
      "goalId": "6ebb6182-f221-5f4c-b112-4ac72b104321",
      "profile": {
        "archetype": "representation",
        "expectations": [
          {
            "id": "worldlines-and-frame-time",
            "essentialUnderstandingDe": "Im Diagramm mit horizontalem x und vertikalem ct bezeichnet ein Punkt ein Ereignis und eine Weltlinie die Ereignisse eines Objekts. Bei gleicher Achsenskalierung gilt für Licht x=±ct; eine ruhende Weltlinie ist vertikal. Gleichzeitigkeitslinien sind im jeweiligen Inertialsystem definiert und können im selben Diagramm verschieden geneigt sein.",
            "essentialUnderstandingEn": "In a diagram with horizontal x and vertical ct, a point denotes an event and a worldline the events of an object. With equal axis scaling, light obeys x=±ct; a stationary worldline is vertical. Simultaneity lines are defined for each inertial frame and can have different inclinations in the same diagram.",
            "observablePerformanceDe": "Die lernende Person erstellt aus neuen Ereignis- und Bewegungsangaben ein beschriftetes Diagramm, ergänzt aus vorgegebenen Konventionen passende Gleichzeitigkeitslinien und begründet daraus eine Aussage über Gleichzeitigkeit. Sie übersetzt ihre Konstruktion in eine verbale Bewegungsbeschreibung und erklärt Weltlinien als Raumzeitfolgen statt räumliche Bahnkurven.",
            "observablePerformanceEn": "The learner constructs a labelled diagram from fresh event and motion data, adds appropriate simultaneity lines using supplied conventions, and uses them to justify a simultaneity statement. They translate their construction into a verbal account of motion and explain worldlines as sequences in spacetime rather than spatial paths."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "worldlines-and-frame-time"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "direction-and-slices",
            "textDe": "Die Bewegungsrichtung des zweiten Systems und damit die Neigung seiner Weltlinien und Gleichzeitigkeitslinien wird umgekehrt.",
            "textEn": "The second frame's direction of motion and thus the inclination of its worldlines and simultaneity lines is reversed."
          },
          {
            "id": "given-representation",
            "textDe": "Einmal sind Ereigniskoordinaten gegeben, einmal müssen passende Ereignisse zu einer Gleichzeitigkeit im bewegten System konstruiert werden.",
            "textEn": "One case supplies event coordinates; the other requires constructing events satisfying simultaneity in the moving frame."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "draw-from-events",
            "taskDemandDe": "Zeichne x horizontal und ct vertikal in gleich skalierten Längeneinheiten. In S haben A und B die Koordinaten (x,ct)=(-1,0) und (1,0). Ergänze einen bei x=0 ruhenden Körper, einen durch den Ursprung mit v=+0,5c bewegten Körper und Licht vom Ursprung. Für das mitbewegte System S′ gilt als Diagrammkonvention: Seine Gleichzeitigkeitslinien sind parallel zu ct=0,5x. Begründe, ob A und B in S und S′ gleichzeitig sind.",
            "taskDemandEn": "Draw x horizontally and ct vertically using equally scaled length units. In S, A and B have coordinates (x,ct)=(-1,0) and (1,0). Add a body at rest at x=0, a body moving through the origin at v=+0.5c, and light from the origin. For the co-moving frame S′, the supplied diagram convention is that its simultaneity lines are parallel to ct=0.5x. Justify whether A and B are simultaneous in S and S′.",
            "expectedPerformanceDe": "Die lernende Person zeichnet x=0, x=0,5ct und x=±ct mit passenden Labels. A und B liegen auf derselben horizontalen S-Zeitlinie, aber auf verschiedenen S′-Zeitlinien. Sie konstruiert diese Linien und erklärt: B wird in S′ früher als A zugeordnet. Alle Linien verwenden dieselben Ereignisse; die geneigte Körperweltlinie zeigt gleichförmige Bewegung und keine räumliche Schrägfahrt.",
            "expectedPerformanceEn": "The learner draws x=0, x=0.5ct, and x=±ct with appropriate labels. A and B lie on one horizontal S-time line but on different S′-time lines. They construct these lines and explain that S′ assigns B an earlier time than A. All lines use the same events; the inclined body worldline represents uniform motion, not a diagonally directed spatial path.",
            "understandingFocusDe": "Koordinaten, Weltlinien und systemabhängige Gleichzeitigkeitslinien werden eigenständig aufeinander bezogen.",
            "understandingFocusEn": "Coordinates, worldlines, and frame-dependent simultaneity lines are independently coordinated."
          },
          {
            "id": "construct-simultaneous-pair-reversed-motion",
            "taskDemandDe": "Ein frisches Diagramm beschreibt S″ mit v=−0,5c relativ zu S. Seine Gleichzeitigkeitslinien sind parallel zu ct=−0,5x. Erzeuge selbst auf der durch den Ursprung gehenden S″-Gleichzeitigkeitslinie zwei Ereignisse bei x=−2 und x=+2 Längeneinheiten. Ergänze die Weltlinie des Ursprungs von S″ und erkläre die zeitliche Zuordnung der Ereignisse in S.",
            "taskDemandEn": "A fresh diagram describes S″ moving at v=−0.5c relative to S. Its simultaneity lines are parallel to ct=−0.5x. Independently construct two events at x=−2 and x=+2 length units on the S″ simultaneity line through the origin. Add the worldline of the S″ origin and explain how S assigns times to the events.",
            "expectedPerformanceDe": "Die lernende Person konstruiert A=(-2,+1), B=(+2,-1) und die Ursprungsweltlinie x=−0,5ct. A und B sind in S″ gleichzeitig. In S gilt ct_B−ct_A=−2 Längeneinheiten; der Zeitunterschied ist daher t_B−t_A=(−2 Längeneinheiten)/c, also liegt B früher als A. Sie erklärt den Richtungswechsel über die konsistent umgekehrten Neigungen und hält Ereignisidentität, räumlichen Ort und Zeitzuordnung auseinander.",
            "expectedPerformanceEn": "The learner constructs A=(-2,+1), B=(+2,-1), and the origin worldline x=−0.5ct. A and B are simultaneous in S″. In S, ct_B−ct_A=−2 length units, so the time difference is t_B−t_A=(−2 length units)/c and B is earlier than A. They explain the direction reversal through the consistently reversed inclinations and distinguish event identity, spatial position, and assigned time.",
            "understandingFocusDe": "Ein selbst konstruiertes Ereignispaar überträgt die Diagrammkompetenz auf eine umgekehrte Bewegungs- und Aufgabenrichtung.",
            "understandingFocusEn": "A learner-constructed event pair transfers diagram competence to reversed motion and reversed task direction."
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
            "essentialUnderstandingDe": "Die elektrische Leitfähigkeit beschreibt, wie gut ein Material unter festgelegten Bedingungen elektrischen Strom leitet. Leiter, Nichtleiter und Halbleiter zeigen typischerweise unterschiedliche Leitfähigkeitsbereiche; eine begründete Zuordnung setzt deshalb vergleichbare Bedingungen voraus.",
            "essentialUnderstandingEn": "Electrical conductivity describes how readily a material conducts electric current under specified conditions. Conductors, insulators, and semiconductors typically occupy different conductivity ranges; a justified classification therefore requires comparable conditions.",
            "observablePerformanceDe": "Die lernende Person prüft selbstständig, ob vorgegebene Leitfähigkeitsdaten unter vergleichbaren Bedingungen erhoben wurden, vergleicht die Materialien, unterscheidet Datenangabe und daraus abgeleitete Kategorie und begründet die Zuordnung als Leiter, Nichtleiter oder Halbleiter sowie die Einordnung eines Technik- oder Alltagsbeispiels mit Bezug auf die Leitfähigkeit.",
            "observablePerformanceEn": "The learner independently checks whether supplied conductivity data were obtained under comparable conditions, compares the materials, distinguishes the reported data from the category inferred from them, and justifies classification as a conductor, insulator, or semiconductor as well as the classification of a technological or everyday example by reference to conductivity."
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
            "taskDemandDe": "Für drei gleichartig dokumentierte unbekannte Materialien A, B und C sind bei 20 °C typische Leitfähigkeiten von 5,8 × 10^7 S/m, 4,0 × 10^-4 S/m und weniger als 1,0 × 10^-10 S/m angegeben. Ordne die Materialien anhand dieser Daten begründet als Leiter, Halbleiter oder Nichtleiter ein und wähle für jedes eine passende technische oder alltägliche Verwendung, bei der das jeweilige Leitvermögen entscheidend ist.",
            "taskDemandEn": "For three consistently documented unknown materials A, B, and C, typical conductivities of 5.8 × 10^7 S/m, 4.0 × 10^-4 S/m, and less than 1.0 × 10^-10 S/m are given at 20 °C. Use these data to justify classification as a conductor, semiconductor, or insulator and choose for each a suitable technological or everyday use in which its conduction behavior is decisive.",
            "expectedPerformanceDe": "Die lernende Person erkennt die gemeinsame Temperatur als Vergleichsbedingung, ordnet A wegen der sehr hohen, B wegen der mittleren und C wegen der sehr geringen Leitfähigkeit den drei Klassen zu und begründet jede Verwendung über die benötigte elektrische Leitfähigkeit oder Isolation. Sie kennzeichnet die Klassen als Schlussfolgerung aus den Daten, nicht als Messwert selbst.",
            "expectedPerformanceEn": "The learner identifies the common temperature as a comparison condition, assigns A to the conductor class because of its very high conductivity, B to the semiconductor class because of its intermediate conductivity, and C to the insulator class because of its very low conductivity, and justifies each use through the required electrical conduction or insulation. The learner identifies each class as an inference from the data, not as a measured value itself.",
            "understandingFocusDe": "Typische Leitfähigkeit unter denselben Bedingungen trägt die begründete Materialklassifikation und Anwendungseinordnung.",
            "understandingFocusEn": "Typical conductivity under the same conditions supports the justified material classification and application choice."
          },
          {
            "id": "mixed-temperature-fresh-transfer",
            "taskDemandDe": "Ein neuer Materialsatz D, E und F enthält für 20 °C die Leitfähigkeiten 4,6 × 10^7 S/m, weniger als 1,0 × 10^-11 S/m und 6,0 × 10^-4 S/m. Für F ist zusätzlich ein Wert von 2,5 × 10^-3 S/m bei 80 °C angegeben. Wähle die für den Vergleich geeigneten Angaben aus, begründe die drei Kategorien und erläutere, warum der zusätzliche Wert nicht ohne Kennzeichnung mit den 20-°C-Werten verglichen werden darf.",
            "taskDemandEn": "A fresh set of materials D, E, and F lists conductivities of 4.6 × 10^7 S/m, less than 1.0 × 10^-11 S/m, and 6.0 × 10^-4 S/m at 20 °C. An additional value of 2.5 × 10^-3 S/m at 80 °C is given for F. Select the data suitable for comparison, justify the three categories, and explain why the additional value must not be compared with the 20 °C values without identifying the changed condition.",
            "expectedPerformanceDe": "Die lernende Person vergleicht ausschließlich die drei 20-°C-Werte, leitet daraus D als Leiter, E als Nichtleiter und F als Halbleiter ab und trennt die dokumentierte Leitfähigkeit von der daraus begründeten Kategorie. Sie erklärt, dass der 80-°C-Wert eine veränderte Bedingung enthält und deshalb kein gleichartiger Vergleichswert ist.",
            "expectedPerformanceEn": "The learner compares only the three values at 20 °C, infers D as a conductor, E as an insulator, and F as a semiconductor, and distinguishes the documented conductivity from the category justified from it. The learner explains that the 80 °C value contains a changed condition and therefore is not a like-for-like comparison value.",
            "understandingFocusDe": "Die Bedingungsgleichheit wird in einem frischen Fall aktiv geprüft, bevor aus Messangaben eine Stoffklasse abgeleitet wird.",
            "understandingFocusEn": "Comparable conditions are actively checked in a fresh case before a material class is inferred from measured data."
          }
        ]
      }
    },
    {
      "goalId": "3857891b-d328-585b-9936-85c7aff122ee",
      "profile": {
        "archetype": "experiment",
        "expectations": [
          {
            "id": "own-measurement",
            "essentialUnderstandingDe": "Die gesuchte Kennlinie verknüpft den Strom durch die Diode mit der Spannung direkt an ihr; Versorgungsspannung und Vorwiderstandsspannung sind andere Größen.",
            "essentialUnderstandingEn": "The characteristic relates current through the diode to voltage directly across it; supply and series-resistor voltages are different quantities.",
            "observablePerformanceDe": "Die lernende Person formuliert die Polungsfrage, baut unter Aufsicht mit Strombegrenzung sicher auf und zeichnet nachvollziehbare eigene signierte Messpaare in beiden Polungen einschließlich Messbereichen und Unsicherheiten auf.",
            "observablePerformanceEn": "The learner formulates the polarity question, safely assembles a supervised current-limited setup and records traceable original signed measurements in both bias directions, including ranges and uncertainties."
          },
          {
            "id": "bounded-inference",
            "essentialUnderstandingDe": "Eine nicht aufgelöste Sperrstromanzeige ist eine Unsicherheitsgrenze, kein Nachweis einer exakten Null; die Kennlinie ist nicht ohmsch.",
            "essentialUnderstandingEn": "An unresolved reverse-current reading is an uncertainty bound, not proof of an exact zero; the characteristic is non-ohmic.",
            "observablePerformanceDe": "Aus der eigenen Kennlinie begründet die lernende Person Richtungsabhängigkeit und Nichtlinearität, sagt die Wirkung höherer Auflösung voraus und vergleicht eine tatsächlich durchgeführte freigegebene Wiederholungsmessung.",
            "observablePerformanceEn": "From their own graph the learner justifies direction dependence and nonlinearity, predicts the effect of improved resolution and compares an actually performed approved repeat measurement."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "own-measurement",
            "bounded-inference"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "measurement-quality",
            "textDe": "Polung und Messauflösung ändern, Bauteil und thermische Randbedingungen für Vergleiche kontrollieren.",
            "textEn": "Change bias and instrument resolution while controlling device and thermal conditions for comparisons."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "actual-iv",
            "taskDemandDe": "Bestimme im freigegebenen Kleinspannungsaufbau selbst die Kennlinie beider Polungen; dokumentiere Sicherheit, Messpunktwahl und Unsicherheit.",
            "taskDemandEn": "Independently determine both bias branches in an approved low-voltage setup; document safety, measurement-point selection and uncertainty.",
            "expectedPerformanceDe": "Liefere den real beobachteten eigenen Aufbau, Originalpaare, beschriftetes Diagramm und die datengetragene Leitungsdeutung.",
            "expectedPerformanceEn": "Provide the actually observed personal setup, original pairs, labelled graph and data-supported conduction interpretation.",
            "understandingFocusDe": "Messung von I_D und U_D, kein Rückschluss auf Durchführung aus einer fertigen Tabelle.",
            "understandingFocusEn": "Measurement of I_D and U_D, not inference of execution from a completed table."
          },
          {
            "id": "unresolved-current",
            "taskDemandDe": "Prüfe im sicheren Sperrbetrieb eine Nullanzeige mit einem zugelassenen empfindlicheren Gerät.",
            "taskDemandEn": "Test a zero reading at a safe reverse bias with an approved more sensitive instrument.",
            "expectedPerformanceDe": "Sage einen kleinen möglicherweise auflösbaren Strom voraus, führe wirklich nach Freigabe nachmessend aus und begrenze die Aussage mit Auflösung und Unsicherheit.",
            "expectedPerformanceEn": "Predict a small possibly resolvable current, actually repeat the measurement after approval and bound the conclusion using resolution and uncertainty.",
            "understandingFocusDe": "Nicht beobachtet heißt nicht physikalisch ausgeschlossen.",
            "understandingFocusEn": "Not observed does not mean physically excluded."
          }
        ]
      }
    },
    {
      "goalId": "3b586f2a-60e2-5019-aa08-6a47616a1f1f",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "path-voltage",
            "essentialUnderstandingDe": "Diodenpolung und geschlossener Kreis entscheiden über den Strom; ohne Energiespeicher bleibt eine gleichgerichtete Spannung zeitabhängig.",
            "essentialUnderstandingEn": "Diode bias and a closed circuit determine current; without energy storage a rectified voltage remains time dependent.",
            "observablePerformanceDe": "Die lernende Person verfolgt in einer vorgegebenen neuen einfachen Schaltung beide Halbwellen, konstruiert die Ausgangswellenform und kennzeichnet ideale Diode, Last und Spannungsbezugsrichtung.",
            "observablePerformanceEn": "In a supplied fresh simple circuit, the learner traces both half-cycles, constructs the output waveform and identifies the ideal diode, load and voltage-reference direction."
          },
          {
            "id": "reversed-reference",
            "essentialUnderstandingDe": "Das Ausgangsvorzeichen hängt vom leitenden Pfad und der festgelegten Spannungsdefinition ab, nicht vom Wort Gleichrichter.",
            "essentialUnderstandingEn": "Output sign depends on the conducting path and the specified voltage definition, not on the word rectifier.",
            "observablePerformanceDe": "Beim Umdrehen nur einer Diode sagt die lernende Person die nun übertragenen Halbwellen voraus, erklärt das Vorzeichen und benennt die Grenze des idealisierten spannungsabfallfreien Modells.",
            "observablePerformanceEn": "When only a diode is reversed, the learner predicts the half-cycles now transmitted, explains the sign and states the limitation of the ideal zero-forward-drop model."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "path-voltage",
            "reversed-reference"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "orientation-waveform",
            "textDe": "Diodenorientierung oder Spannungsmessrichtung bei unverändertem Lastkreis ändern.",
            "textEn": "Change diode orientation or voltage-reference direction while retaining the load circuit."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "half-wave",
            "taskDemandDe": "Leite für eine materialgestützt vorgegebene Einwegschaltung die Ausgangsspannung aus einer neuen Eingangsfolge ab.",
            "taskDemandEn": "Derive output voltage for a supplied half-wave circuit from a fresh input sequence.",
            "expectedPerformanceDe": "Verknüpfe Leit-/Sperrzustände mit vollständigen Stromwegen und einer begründeten pulsierenden Wellenform.",
            "expectedPerformanceEn": "Connect conducting/blocking states to complete current paths and a justified pulsating waveform.",
            "understandingFocusDe": "Gleichrichtung ist nicht automatische Glättung.",
            "understandingFocusEn": "Rectification is not automatic smoothing."
          },
          {
            "id": "diode-reversed",
            "taskDemandDe": "Nur die Diode wird umgedreht; dieselbe Ausgangsmessrichtung bleibt. Prüfe die Behauptung, der Ausgang müsse weiterhin positiv sein.",
            "taskDemandEn": "Only the diode is reversed; the output-reference direction is retained. Test the claim that output must remain positive.",
            "expectedPerformanceDe": "Konstruiere die negativen Halbwellen und begründe sie aus dem umgekehrten Laststromweg; reale Vorwärtsspannung begrenzt nur die Idealisierung.",
            "expectedPerformanceEn": "Construct the negative half-cycles and justify them through the reversed load-current path; real forward drop limits the idealisation.",
            "understandingFocusDe": "Vorzeichen und Wellenform aus Schaltung statt Etikett herleiten.",
            "understandingFocusEn": "Derive sign and waveform from the circuit rather than its label."
          }
        ]
      }
    },
    {
      "goalId": "206fe51d-cc78-5422-b139-32cc97eb1c37",
      "profile": {
        "archetype": "representation",
        "expectations": [
          {
            "id": "hrd-coordinates",
            "essentialUnderstandingDe": "Das HRD ordnet Leuchtkraft und Oberflächentemperatur auf logarithmischen Achsen, nicht räumliche Positionen; in der üblichen Darstellung nimmt die Temperatur nach rechts ab.",
            "essentialUnderstandingEn": "The HR diagram maps luminosity and surface temperature on logarithmic axes, not spatial positions; in the conventional representation temperature decreases to the right.",
            "observablePerformanceDe": "Die lernende Person kennzeichnet in einem neuen Diagramm Achsen, Richtungen und Skalen, trägt neue Werte konsistent ein und ordnet sie begründet Hauptreihe, Roten Riesen oder Weißen Zwergen zu.",
            "observablePerformanceEn": "In a new diagram, the learner identifies axes, directions, and scales, plots fresh values consistently, and justifiably assigns them to the main sequence, red giants, or white dwarfs."
          },
          {
            "id": "regions-and-model-boundary",
            "essentialUnderstandingDe": "Die beiden Größen bestimmen gemeinsam den HRD-Bereich; eine einzelne Position kennzeichnet einen physikalischen und evolutionären Zustand, legt aber ohne weitere Angaben keinen vollständigen Entwicklungsweg fest.",
            "essentialUnderstandingEn": "The two quantities jointly determine the HR-diagram region; a single position indicates a physical and evolutionary state but does not determine a complete evolutionary path without further information.",
            "observablePerformanceDe": "Die lernende Person deutet Lagevergleiche fachlich, begründet unterschiedliche Zuordnungen trotz ähnlicher Einzelwerte und benennt die Grenze der aus einem Diagrammpunkt möglichen Aussage.",
            "observablePerformanceEn": "The learner interprets positional comparisons physically, justifies different classifications despite similar individual values, and states the limit of what can be inferred from one plotted point."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "hrd-coordinates",
            "regions-and-model-boundary"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "paired-observables",
            "textDe": "Neue Wertepaarungen und ein Vergleich ähnlicher Temperatur bei stark unterschiedlicher Leuchtkraft.",
            "textEn": "Fresh pairs of values and a comparison at similar temperature but strongly different luminosity."
          },
          {
            "id": "display-convention",
            "textDe": "Unbeschriftete oder in ihrer Darstellungsrichtung veränderte Achsen.",
            "textEn": "Unlabeled axes or axes with an altered display direction."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "place-three-stars",
            "taskDemandDe": "Beschrifte ein zunächst unbeschriftetes schematisches HRD korrekt. Trage A(6000 K, 1 L☉), B(3500 K, 1000 L☉) und C(12000 K, 0,01 L☉) ein und deute ihre Bereiche.",
            "taskDemandEn": "Correctly label an initially unlabeled schematic HR diagram. Plot A(6000 K, 1 L☉), B(3500 K, 1000 L☉), and C(12000 K, 0.01 L☉), and interpret their regions.",
            "expectedPerformanceDe": "A liegt ungefähr auf der Hauptreihe, B im Bereich Roter Riesen und C bei Weißen Zwergen. Die Einordnung nutzt beide logarithmischen Achsen und verwechselt die Positionen nicht mit Orten im Weltraum.",
            "expectedPerformanceEn": "A lies approximately on the main sequence, B in the red-giant region, and C among white dwarfs. The classification uses both logarithmic axes and does not confuse positions with locations in space.",
            "understandingFocusDe": "Eigenständige Koordinatenübersetzung und physikalische Bedeutung der drei Bereiche.",
            "understandingFocusEn": "Independent coordinate translation and physical meaning of the three regions."
          },
          {
            "id": "altered-axis-transfer",
            "taskDemandDe": "Ordne in einem frischen HRD mit ausdrücklich nach rechts zunehmender Temperatur die Sterne D(3500 K, 0,01 L☉) und E(3500 K, 1000 L☉) ein. Prüfe die Behauptung, beide müssten dieselbe Entwicklungsphase und dasselbe Alter haben.",
            "taskDemandEn": "In a fresh HR diagram with temperature explicitly increasing to the right, place stars D(3500 K, 0.01 L☉) and E(3500 K, 1000 L☉). Assess the claim that they must have the same evolutionary phase and age.",
            "expectedPerformanceDe": "Beide Sterne erhalten dieselbe Temperaturkoordinate. D liegt ungefähr im kühlen Hauptreihenbereich, E im Bereich Roter Riesen. Die geänderte Achsenrichtung spiegelt die horizontale Anordnung gegenüber der üblichen Darstellung. Gleiche Temperatur belegt weder dieselbe Phase noch ein eindeutiges Alter; dafür fehlen weitere physikalische Angaben.",
            "expectedPerformanceEn": "Both stars share a temperature coordinate. D lies approximately on the cool main sequence and E in the red-giant region. The changed axis direction mirrors the horizontal arrangement compared with the conventional representation. Equal temperature establishes neither the same phase nor a unique age; additional physical information is required.",
            "understandingFocusDe": "Transfer der Achsenkonvention und Grenze einer isolierten Temperaturinformation.",
            "understandingFocusEn": "Transfer of the axis convention and the limit of temperature information alone."
          }
        ]
      }
    },
    {
      "goalId": "455c65ca-814a-56ad-918a-013155883c52",
      "profile": {
        "archetype": "procedure",
        "expectations": [
          {
            "id": "vector-law",
            "essentialUnderstandingDe": "Elektrische Feldstärken am selben Ort addieren sich vektoriell; Richtung und Vorzeichen gehören zum Feld, nicht nur der Betrag.",
            "essentialUnderstandingEn": "Electric field strengths at the same location add vectorially; direction and sign belong to the field, not just magnitude.",
            "observablePerformanceDe": "Wählt ein Koordinatensystem, begründet E_ges=E₁+E₂ und führt eine konsistente Komponenten- oder Pfeilrechnung durch.",
            "observablePerformanceEn": "Chooses coordinates, justifies E_total=E₁+E₂ and performs a consistent component or arrow calculation."
          },
          {
            "id": "result-meaning",
            "essentialUnderstandingDe": "Resultierender Betrag und Richtung müssen zur Geometrie passen; bei Gegenrichtung kann der Betrag kleiner werden, bei orthogonalen Feldern folgt er aus den Komponenten.",
            "essentialUnderstandingEn": "Resultant magnitude and direction must fit the geometry; opposite directions can reduce magnitude, while orthogonal fields determine it through their components.",
            "observablePerformanceDe": "Gibt Betrag mit N/C und Richtung an und prüft das Ergebnis durch Vektorskizze, Grenzfall oder Komponentenrückprüfung.",
            "observablePerformanceEn": "Reports magnitude in N/C and direction and checks using a vector sketch, limiting case or component reconstruction."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "vector-law",
            "result-meaning"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "field-geometry",
            "textDe": "Gegenläufige kollineare Felder gegenüber orthogonalen Feldern; Vorzeichen statt Addition bloßer Beträge.",
            "textEn": "Opposing collinear fields versus orthogonal fields; signs rather than addition of magnitudes alone."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "opposing-fields",
            "taskDemandDe": "Am selben Punkt zeigen 300 N/C nach Osten und 500 N/C nach Westen. Bestimme und begründe das Gesamtfeld.",
            "taskDemandEn": "At the same point, 300 N/C points east and 500 N/C west. Determine and justify the total field.",
            "expectedPerformanceDe": "Wählt z. B. Osten positiv: 300−500=−200 N/C, also 200 N/C nach Westen. Erklärt Teilkompensation und nicht 800 N/C.",
            "expectedPerformanceEn": "Chooses, for example, east positive: 300−500=−200 N/C, hence 200 N/C west. Explains partial cancellation rather than 800 N/C.",
            "understandingFocusDe": "Richtungsgerechte Superposition und physikalisches Vorzeichen.",
            "understandingFocusEn": "Direction-sensitive superposition and physical sign."
          },
          {
            "id": "orthogonal-fields",
            "taskDemandDe": "Am selben Punkt wirken 300 N/C nach Osten und 400 N/C nach Norden. Konstruiere das Gesamtfeld mit Betrag und Richtung.",
            "taskDemandEn": "At the same point there are 300 N/C east and 400 N/C north. Construct the total field with magnitude and direction.",
            "expectedPerformanceDe": "Erhält Komponenten (300,400) N/C und Betrag 500 N/C. Beschreibt die Richtung nordöstlich mit Komponentenverhältnis 4:3 oder Winkel etwa 53,1° nördlich von Osten; prüft durch Skizze.",
            "expectedPerformanceEn": "Obtains components (300,400) N/C and magnitude 500 N/C. Describes the northeast direction with component ratio 4:3 or angle about 53.1° north of east; checks by sketch.",
            "understandingFocusDe": "Geometrie der Vektorsumme statt skalarer Betragsaddition.",
            "understandingFocusEn": "Geometry of vector addition rather than scalar addition of magnitudes."
          }
        ]
      }
    },
    {
      "goalId": "09f2cdbd-64e0-55d2-ada7-1190f4fd50df",
      "profile": {
        "archetype": "procedure",
        "expectations": [
          {
            "id": "independent-review-a-understanding",
            "essentialUnderstandingDe": "Die lernende Person versteht, dass eine Beziehung der Form y'(t)=k y(t) zu einer Exponentialfunktion führt, dass das Vorzeichen und die Einheit von k Wachstum beziehungsweise Abnahme und die Zeitskala bestimmen und dass die Anfangsbedingung den Vorfaktor festlegt.",
            "essentialUnderstandingEn": "The learner understands that a relation of the form y'(t)=k y(t) leads to an exponential function, that the sign and unit of k determine growth or decay and the time scale, and that the initial condition fixes the prefactor.",
            "observablePerformanceDe": "Zu einer gegebenen einfachen physikalischen Differenzialgleichung wählt die lernende Person einen Exponentialansatz, leitet ihn ab, setzt ihn in Gleichung und Anfangsbedingung ein und prüft zusätzlich Vorzeichen, Einheiten und das erwartete Langzeitverhalten.",
            "observablePerformanceEn": "For a given simple physics differential equation, the learner chooses an exponential ansatz, differentiates it, substitutes it into the equation and initial condition, and also checks the sign, units, and expected long-term behavior."
          },
          {
            "id": "independent-review-b-understanding",
            "essentialUnderstandingDe": "Die lernende Person versteht, dass eine Proportionalität zwischen Änderungsrate und Zustandsgröße zu einer Exponentialfunktion führt, dass das Vorzeichen der Proportionalitätskonstante Wachstum oder Abklingen bestimmt und dass die Anfangsbedingung den Vorfaktor festlegt; die Ableitung liefert den entscheidenden Funktionsnachweis.",
            "essentialUnderstandingEn": "The learner understands that proportionality between a rate of change and the state variable leads to an exponential function, that the sign of the proportionality constant determines growth or decay, and that the initial condition fixes the prefactor; differentiation provides the decisive check of the function.",
            "observablePerformanceDe": "Zu einer gegebenen Gleichung der Form x'(t)=kx(t) kann die lernende Person einen Exponentialansatz mit der richtigen Konstanten aufstellen, ihn ableiten, in Gleichung und Anfangsbedingung einsetzen sowie Vorzeichen, Einheit und charakteristische Zeitskala physikalisch deuten.",
            "observablePerformanceEn": "For a given equation of the form x'(t)=kx(t), the learner can set up an exponential ansatz with the correct constant, differentiate and substitute it into the equation and initial condition, and physically interpret the sign, unit, and characteristic time scale."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "independent-review-a-understanding",
            "independent-review-b-understanding"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "changed-physical-condition",
            "textDe": "Mindestens eine relevante Größe, Geometrie, Rand- oder Anfangsbedingung wird gegenüber dem Ausgangsfall verändert.",
            "textEn": "At least one relevant quantity, geometry, boundary condition, or initial condition is changed from the original case."
          },
          {
            "id": "changed-evidence-representation",
            "textDe": "Die fachliche Information liegt in einer anderen geeigneten Darstellung vor, etwa als Diagramm, Datensatz, Skizze, Formel, Simulation oder belegte Quelle.",
            "textEn": "The scientific information is supplied in another suitable representation, such as a diagram, data set, sketch, formula, simulation, or evidenced source."
          },
          {
            "id": "model-validity-boundary",
            "textDe": "Ein Fall erfüllt die idealisierenden Annahmen, der andere enthält eine benannte Nichtidealität oder Informationsgrenze.",
            "textEn": "One case satisfies the idealizing assumptions, while the other contains a stated non-ideality or information limit."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "fresh-independent-case-a",
            "taskDemandDe": "Bei einem unabhängig vorgelegten anderen Prozess mit zur Zustandsgröße proportionaler Änderungsrate, etwa radioaktivem Zerfall statt RC-Entladung, bestimmt die lernende Person aus Proportionalitätskonstante und Anfangswert den passenden Ansatz und begründet Wachstum oder Abnahme.",
            "taskDemandEn": "For an independently presented different process whose rate of change is proportional to the state variable, such as radioactive decay rather than RC discharge, the learner determines the appropriate ansatz from the proportionality constant and initial value and justifies growth or decay.",
            "expectedPerformanceDe": "Zu einer gegebenen einfachen physikalischen Differenzialgleichung wählt die lernende Person einen Exponentialansatz, leitet ihn ab, setzt ihn in Gleichung und Anfangsbedingung ein und prüft zusätzlich Vorzeichen, Einheiten und das erwartete Langzeitverhalten.",
            "expectedPerformanceEn": "For a given simple physics differential equation, the learner chooses an exponential ansatz, differentiates it, substitutes it into the equation and initial condition, and also checks the sign, units, and expected long-term behavior.",
            "understandingFocusDe": "Die lernende Person versteht, dass eine Beziehung der Form y'(t)=k y(t) zu einer Exponentialfunktion führt, dass das Vorzeichen und die Einheit von k Wachstum beziehungsweise Abnahme und die Zeitskala bestimmen und dass die Anfangsbedingung den Vorfaktor festlegt.",
            "understandingFocusEn": "The learner understands that a relation of the form y'(t)=k y(t) leads to an exponential function, that the sign and unit of k determine growth or decay and the time scale, and that the initial condition fixes the prefactor."
          },
          {
            "id": "fresh-independent-case-b",
            "taskDemandDe": "In einem unabhängig vorgelegten physikalischen Wachstum- oder Abklingfall mit einer anderen Zustandsgröße erkennt die lernende Person dieselbe Proportionalstruktur, wählt den passenden Exponentialansatz und erklärt, wie Vorzeichen und Anfangswert den Verlauf verändern.",
            "taskDemandEn": "In an independently presented physical growth or decay case involving a different state variable, the learner recognizes the same proportional structure, chooses the appropriate exponential ansatz, and explains how the sign and initial value change the evolution.",
            "expectedPerformanceDe": "Zu einer gegebenen Gleichung der Form x'(t)=kx(t) kann die lernende Person einen Exponentialansatz mit der richtigen Konstanten aufstellen, ihn ableiten, in Gleichung und Anfangsbedingung einsetzen sowie Vorzeichen, Einheit und charakteristische Zeitskala physikalisch deuten.",
            "expectedPerformanceEn": "For a given equation of the form x'(t)=kx(t), the learner can set up an exponential ansatz with the correct constant, differentiate and substitute it into the equation and initial condition, and physically interpret the sign, unit, and characteristic time scale.",
            "understandingFocusDe": "Die lernende Person versteht, dass eine Proportionalität zwischen Änderungsrate und Zustandsgröße zu einer Exponentialfunktion führt, dass das Vorzeichen der Proportionalitätskonstante Wachstum oder Abklingen bestimmt und dass die Anfangsbedingung den Vorfaktor festlegt; die Ableitung liefert den entscheidenden Funktionsnachweis.",
            "understandingFocusEn": "The learner understands that proportionality between a rate of change and the state variable leads to an exponential function, that the sign of the proportionality constant determines growth or decay, and that the initial condition fixes the prefactor; differentiation provides the decisive check of the function."
          }
        ]
      }
    },
    {
      "goalId": "74a74132-fa39-541c-8d3c-696cf228452d",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "independent-review-a-understanding",
            "essentialUnderstandingDe": "Die lernende Person versteht, dass eine passend phasierte Beschleunigerstufe einer Ladung über die durchlaufene Potenzialdifferenz Energie überträgt, dass sich diese Energiebeiträge über Stufen bilanzieren lassen und dass klassische Energie- und Impulsbeziehungen nur im Grenzfall v deutlich kleiner als c tragfähig sind.",
            "essentialUnderstandingEn": "The learner understands that a suitably phased accelerator stage transfers energy to a charge through the traversed potential difference, that these energy contributions can be balanced across stages, and that classical energy and momentum relations are valid only in the limit where v is much smaller than c.",
            "observablePerformanceDe": "Für ein gegebenes Stufenmodell legt die lernende Person Systemgrenze und Vorzeichen fest, bilanziert die Energiezunahme mit Ladung und Potenzialdifferenz, prüft Einheiten und Größenordnung und zeigt an einer klassischen Geschwindigkeitsvorhersage, wann und warum auf relativistische Energie- und Impulsbeziehungen gewechselt werden muss.",
            "observablePerformanceEn": "For a given staged model, the learner defines the system boundary and signs, balances the energy gain using charge and potential difference, checks units and order of magnitude, and uses a classical speed prediction to show when and why relativistic energy and momentum relations are required."
          },
          {
            "id": "independent-review-b-understanding",
            "essentialUnderstandingDe": "Die lernende Person versteht, dass eine passend durchlaufene Potenzialdifferenz die kinetische Energie einer Ladung pro Stufe um qΔV ändert, wobei Vorzeichen und Feldrichtung berücksichtigt werden, und dass die klassischen Beziehungen E_kin=mv²/2 und p=mv nur für v≪c Näherungen sind, während relativistische Energie und Impuls die Grenzgeschwindigkeit c respektieren.",
            "essentialUnderstandingEn": "The learner understands that traversing an appropriately oriented potential difference changes a charge's kinetic energy by qΔV per stage, with sign and field direction accounted for, and that the classical relations K=mv²/2 and p=mv are approximations only for v≪c, whereas relativistic energy and momentum respect the limiting speed c.",
            "observablePerformanceDe": "Für eine gegebene Folge von Beschleunigerstufen kann die lernende Person aus Ladung, Spannung und Polung die Energieänderungen und Bewegungsrichtung bestimmen, eine klassische Geschwindigkeit berechnen, deren Plausibilität gegenüber c prüfen und begründen, ab wann statt der klassischen die relativistische Energie-Impuls-Beziehung nötig ist.",
            "observablePerformanceEn": "For a specified sequence of accelerator stages, the learner can determine energy changes and direction of motion from charge, voltage, and polarity, calculate a classical speed, test its plausibility relative to c, and justify when the relativistic rather than classical energy-momentum relation is required."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "independent-review-a-understanding",
            "independent-review-b-understanding"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "changed-physical-condition",
            "textDe": "Mindestens eine relevante Größe, Geometrie, Rand- oder Anfangsbedingung wird gegenüber dem Ausgangsfall verändert.",
            "textEn": "At least one relevant quantity, geometry, boundary condition, or initial condition is changed from the original case."
          },
          {
            "id": "changed-evidence-representation",
            "textDe": "Die fachliche Information liegt in einer anderen geeigneten Darstellung vor, etwa als Diagramm, Datensatz, Skizze, Formel, Simulation oder belegte Quelle.",
            "textEn": "The scientific information is supplied in another suitable representation, such as a diagram, data set, sketch, formula, simulation, or evidenced source."
          },
          {
            "id": "model-validity-boundary",
            "textDe": "Ein Fall erfüllt die idealisierenden Annahmen, der andere enthält eine benannte Nichtidealität oder Informationsgrenze.",
            "textEn": "One case satisfies the idealizing assumptions, while the other contains a stated non-ideality or information limit."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "fresh-independent-case-a",
            "taskDemandDe": "Bei einem unabhängig vorgelegten Linearbeschleuniger mit anderer Teilchenladung, anderer Stufenspannung oder höherer Endenergie passt die lernende Person die Energiebilanz an und beurteilt erneut anhand des Geschwindigkeitsbereichs die Gültigkeit des klassischen Modells.",
            "taskDemandEn": "For an independently presented linear accelerator with a different particle charge, stage voltage, or higher final energy, the learner adapts the energy balance and reassesses the validity of the classical model from the resulting speed regime.",
            "expectedPerformanceDe": "Für ein gegebenes Stufenmodell legt die lernende Person Systemgrenze und Vorzeichen fest, bilanziert die Energiezunahme mit Ladung und Potenzialdifferenz, prüft Einheiten und Größenordnung und zeigt an einer klassischen Geschwindigkeitsvorhersage, wann und warum auf relativistische Energie- und Impulsbeziehungen gewechselt werden muss.",
            "expectedPerformanceEn": "For a given staged model, the learner defines the system boundary and signs, balances the energy gain using charge and potential difference, checks units and order of magnitude, and uses a classical speed prediction to show when and why relativistic energy and momentum relations are required.",
            "understandingFocusDe": "Die lernende Person versteht, dass eine passend phasierte Beschleunigerstufe einer Ladung über die durchlaufene Potenzialdifferenz Energie überträgt, dass sich diese Energiebeiträge über Stufen bilanzieren lassen und dass klassische Energie- und Impulsbeziehungen nur im Grenzfall v deutlich kleiner als c tragfähig sind.",
            "understandingFocusEn": "The learner understands that a suitably phased accelerator stage transfers energy to a charge through the traversed potential difference, that these energy contributions can be balanced across stages, and that classical energy and momentum relations are valid only in the limit where v is much smaller than c."
          },
          {
            "id": "fresh-independent-case-b",
            "taskDemandDe": "Bei einer neuen Stufenanordnung mit umgekehrtem Ladungsvorzeichen, veränderter Polung oder so großer Gesamtspannung, dass die klassische Rechnung in den relativistischen Bereich führt, wählt die lernende Person das passende Modell und erklärt die qualitative Änderung von Energie, Impuls und Geschwindigkeitszuwachs.",
            "taskDemandEn": "For a new stage arrangement with the opposite charge sign, changed polarity, or a total voltage large enough to enter the relativistic regime under a classical calculation, the learner selects the appropriate model and explains the qualitative change in energy, momentum, and speed gain.",
            "expectedPerformanceDe": "Für eine gegebene Folge von Beschleunigerstufen kann die lernende Person aus Ladung, Spannung und Polung die Energieänderungen und Bewegungsrichtung bestimmen, eine klassische Geschwindigkeit berechnen, deren Plausibilität gegenüber c prüfen und begründen, ab wann statt der klassischen die relativistische Energie-Impuls-Beziehung nötig ist.",
            "expectedPerformanceEn": "For a specified sequence of accelerator stages, the learner can determine energy changes and direction of motion from charge, voltage, and polarity, calculate a classical speed, test its plausibility relative to c, and justify when the relativistic rather than classical energy-momentum relation is required.",
            "understandingFocusDe": "Die lernende Person versteht, dass eine passend durchlaufene Potenzialdifferenz die kinetische Energie einer Ladung pro Stufe um qΔV ändert, wobei Vorzeichen und Feldrichtung berücksichtigt werden, und dass die klassischen Beziehungen E_kin=mv²/2 und p=mv nur für v≪c Näherungen sind, während relativistische Energie und Impuls die Grenzgeschwindigkeit c respektieren.",
            "understandingFocusEn": "The learner understands that traversing an appropriately oriented potential difference changes a charge's kinetic energy by qΔV per stage, with sign and field direction accounted for, and that the classical relations K=mv²/2 and p=mv are approximations only for v≪c, whereas relativistic energy and momentum respect the limiting speed c."
          }
        ]
      }
    },
    {
      "goalId": "b39ae8fb-4358-5866-8adf-3d5365368eeb",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "hall-field-balances-magnetic-deflection",
            "essentialUnderstandingDe": "Bewegte Ladungsträger werden quer zu Strom und Magnetfeld abgelenkt, bis das aufgebaute elektrische Hall-Feld die magnetische Kraft ausgleicht. Die Spannung ist Ergebnis eines Kräftegleichgewichts, nicht einer unbegrenzten Ladungsanhäufung.",
            "essentialUnderstandingEn": "Moving charge carriers are deflected transverse to current and magnetic field until the electric Hall field that builds up balances the magnetic force. The voltage results from force balance, not unlimited charge accumulation.",
            "observablePerformanceDe": "Die lernende Person konstruiert für eine frische Probenorientierung Trägerablenkung, Ladungsseiten, Hall-Feld und Spannungspolung und erklärt das Erreichen des stationären Zustands.",
            "observablePerformanceEn": "For a fresh sample orientation, the learner constructs carrier deflection, charged sides, Hall field, and voltage polarity and explains how the steady state is reached."
          },
          {
            "id": "hall-voltage-carries-material-and-geometry-dependence",
            "essentialUnderstandingDe": "Betrag und Vorzeichen der Hall-Spannung hängen von B, Strom, Probendicke, Ladungsträgerdichte und Ladungsträgertyp ab; die verwendete Beziehung gilt innerhalb des vorgegebenen einfachen Einträgermodells.",
            "essentialUnderstandingEn": "The magnitude and sign of Hall voltage depend on B, current, sample thickness, carrier density, and carrier type; the relation used applies within the specified simple single-carrier model.",
            "observablePerformanceDe": "Die lernende Person wählt die passende Hall-Beziehung, berechnet die Spannung mit Einheiten und Vorzeichenkonvention und prüft die Skalierung bei geänderter Dicke oder Trägerdichte.",
            "observablePerformanceEn": "The learner selects the appropriate Hall relation, calculates the voltage with units and sign convention, and checks scaling when thickness or carrier density changes."
          },
          {
            "id": "measurement-inference-matches-calibration",
            "essentialUnderstandingDe": "Bei bekanntem Ladungsträgertyp kann die Hall-Spannung als kalibriertes Signal für B dienen; bei bekanntem B kann ihr Vorzeichen den dominanten Ladungsträgertyp anzeigen. Beide Schlüsse benötigen die jeweils übrigen Modell- und Kalibrierungsangaben.",
            "essentialUnderstandingEn": "With known carrier type, Hall voltage can serve as a calibrated signal for B; with known B, its sign can indicate the dominant carrier type. Each inference requires the remaining model and calibration information.",
            "observablePerformanceDe": "Aus neuen Sondendaten entscheidet die lernende Person, welcher Schluss zulässig ist, bestimmt B oder den Trägertyp und kennzeichnet eine Vertauschung von Anschlüssen oder unbekannte Kalibrierung als Begrenzung.",
            "observablePerformanceEn": "From fresh probe data, the learner decides which inference is justified, determines B or carrier type, and identifies swapped leads or unknown calibration as a limitation."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "hall-field-balances-magnetic-deflection",
            "hall-voltage-carries-material-and-geometry-dependence",
            "measurement-inference-matches-calibration"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "polarity-change",
            "textDe": "Umkehr von Strom, Magnetfeld oder Ladungsträgertyp",
            "textEn": "Reversal of current, magnetic field, or carrier type"
          },
          {
            "id": "sample-property",
            "textDe": "Probendicke, Ladungsträgerdichte und bekannte Materialkalibrierung",
            "textEn": "Sample thickness, carrier density, and known material calibration"
          },
          {
            "id": "measurement-purpose",
            "textDe": "Bestimmung von B, Bestimmung des Trägertyps oder Diagnose vertauschter Anschlüsse",
            "textEn": "Determination of B, determination of carrier type, or diagnosis of swapped leads"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "hall-probe-field-calibration",
            "taskDemandDe": "Für eine Hall-Sonde mit bekanntem Trägertyp, Strom, Dicke und Kalibrierfaktor sind Spannungen bei zwei Feldorientierungen gegeben. Bestimme Betrag und Richtung von B und prüfe die Vorzeichenkonsistenz.",
            "taskDemandEn": "For a Hall probe with known carrier type, current, thickness, and calibration factor, voltages for two field orientations are supplied. Determine the magnitude and direction of B and check sign consistency.",
            "expectedPerformanceDe": "Die lernende Person nutzt die Kalibrierung mit korrekter Einheit, ordnet die Vorzeichen der Feldumkehr zu und trennt ein mögliches konstantes Offset vom magnetfeldabhängigen Signal.",
            "expectedPerformanceEn": "The learner uses the calibration with the correct unit, associates signs with field reversal, and separates a possible constant offset from the field-dependent signal.",
            "understandingFocusDe": "Der Fall prüft den Hall-Effekt als begrenzte quantitative Feldmessung.",
            "understandingFocusEn": "The case tests the Hall effect as a bounded quantitative field measurement."
          },
          {
            "id": "carrier-type-and-thickness-transfer",
            "taskDemandDe": "Zwei Proben werden bei gleichem bekannten B und Strom gemessen; Probe B ist doppelt so dick und zeigt entgegengesetzte Hall-Polung. Beurteile Betragsskalierung und dominanten Trägertyp unter dem Einträgermodell.",
            "taskDemandEn": "Two samples are measured at the same known B and current; sample B is twice as thick and shows opposite Hall polarity. Judge magnitude scaling and dominant carrier type under the single-carrier model.",
            "expectedPerformanceDe": "Die lernende Person erwartet bei sonst gleichen Materialparametern den halben Betrag durch die Dicke, deutet die umgekehrte Polung als anderen dominanten Trägertyp und nennt die Einträgermodell-Annahme.",
            "expectedPerformanceEn": "The learner expects half the magnitude from the doubled thickness, interprets the reversed polarity as a different dominant carrier type, and states the single-carrier-model assumption.",
            "understandingFocusDe": "Der Transfer trennt geometrische Betragsänderung von der Vorzeichenaussage über den Trägertyp.",
            "understandingFocusEn": "The transfer separates a geometric magnitude change from the sign inference about carrier type."
          }
        ]
      }
    },
    {
      "goalId": "b2fb9a25-4d26-5cf2-a917-823909dcb6bd",
      "profile": {
        "archetype": "procedure",
        "expectations": [
          {
            "id": "independent-review-a-understanding",
            "essentialUnderstandingDe": "Die lernende Person versteht, dass die lineare Gleichung x''(t) + ω²x(t) = 0 im idealisierten ungedämpften Modell eine sinusförmige Bewegung um die Gleichgewichtslage beschreibt: Die Kreisfrequenz bestimmt die Zeitskala, während Anfangsauslenkung und Anfangsgeschwindigkeit Amplitude und Phase der konkreten Lösung festlegen.",
            "essentialUnderstandingEn": "The learner understands that the linear equation x''(t) + ω²x(t) = 0 describes sinusoidal motion about equilibrium in the idealized undamped model: angular frequency sets the time scale, while initial displacement and initial velocity determine the amplitude and phase of the particular solution.",
            "observablePerformanceDe": "Zu vorgegebenen Anfangswerten löst die lernende Person die Differenzialgleichung selbstständig, bestimmt Amplitude und Phase mit konsistenter Vorzeichenkonvention, prüft Lösung und Anfangswerte durch Einsetzen und erläutert an Gleichung und Zeitdiagramm die physikalische Bedeutung von Amplitude, Kreisfrequenz und Phase.",
            "observablePerformanceEn": "For specified initial values, the learner independently solves the differential equation, determines amplitude and phase using a consistent sign convention, verifies the solution and initial values by substitution, and explains from the equation and a time graph the physical meaning of amplitude, angular frequency, and phase."
          },
          {
            "id": "independent-review-b-understanding",
            "essentialUnderstandingDe": "Die allgemeine Lösung der ungedämpften Schwingungsgleichung x''+ω₀²x=0 kann gleichwertig als Linearkombination von Sinus und Kosinus oder als x(t)=A cos(ω₀t+φ) dargestellt werden; zwei Anfangsbedingungen bestimmen die beiden Integrationskonstanten eindeutig, während A die maximale Auslenkung, ω₀ die Zeitskala der Schwingung und φ den Anfangszustand im Zyklus beschreibt.",
            "essentialUnderstandingEn": "The general solution of the undamped oscillator equation x''+ω₀²x=0 can equivalently be represented as a linear combination of sine and cosine or as x(t)=A cos(ω₀t+φ); two initial conditions uniquely determine the two integration constants, while A describes the maximum displacement, ω₀ the oscillator's time scale, and φ the initial state within the cycle.",
            "observablePerformanceDe": "Die lernende Person löst die gegebene Differenzialgleichung, setzt Auslenkung und Geschwindigkeit zum Anfangszeitpunkt ein, bestimmt die Konstanten einschließlich eines zum Vorzeichen von x(0) und v(0) passenden Phasenwinkels und prüft durch Ableiten sowohl die Gleichung als auch beide Anfangsbedingungen; anschließend deutet sie A, ω₀ und φ mit Größen, Einheiten und Bezug auf die gewählte Zeit- und Koordinatenkonvention.",
            "observablePerformanceEn": "The learner solves the given differential equation, applies the initial displacement and velocity, determines the constants including a phase angle consistent with the signs of x(0) and v(0), and checks both the equation and the two initial conditions by differentiation; the learner then interprets A, ω₀, and φ using physical quantities, units, and the chosen time and coordinate conventions."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "independent-review-a-understanding",
            "independent-review-b-understanding"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "changed-initial-state-and-reference-convention",
            "textDe": "Anfangsauslenkung, Anfangsgeschwindigkeit, Zeitnullpunkt oder Koordinatenrichtung werden so verändert, dass Amplitude und Phase neu und mit konsistenter Vorzeichenkonvention bestimmt werden müssen.",
            "textEn": "Initial displacement, initial velocity, time origin, or coordinate direction is changed so that amplitude and phase must be determined anew using a consistent sign convention."
          },
          {
            "id": "equivalent-solution-representation",
            "textDe": "Die Lösung wird zwischen Sinus-Kosinus-Linearkombination, Amplituden-Phasen-Form und Zeitdiagramm übersetzt; die Gleichwertigkeit wird über Gleichung und Anfangsbedingungen geprüft.",
            "textEn": "The solution is translated among a sine-cosine linear combination, amplitude-phase form, and time graph; equivalence is checked against the equation and initial conditions."
          },
          {
            "id": "undamped-model-validity-boundary",
            "textDe": "Ein Fall erfüllt das ungedämpfte lineare Modell, während ein zweiter Datensatz oder Verlauf eine erkennbare Dämpfung oder andere Modellabweichung enthält, die als Grenze der verwendeten Lösung benannt werden muss.",
            "textEn": "One case satisfies the linear undamped model, while a second data set or trajectory contains detectable damping or another model deviation that must be identified as a limit of the solution used."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "fresh-independent-case-a",
            "taskDemandDe": "Bei verschobenem Zeitnullpunkt oder umgekehrter Koordinatenrichtung bestimmt die lernende Person die neue Phasendarstellung, erkennt, welche Größen unverändert bleiben, und sagt den zugehörigen Verlauf von Auslenkung und Geschwindigkeit voraus, ohne nur Zahlen in eine bekannte Lösung einzusetzen.",
            "taskDemandEn": "With a shifted time origin or reversed coordinate direction, the learner determines the new phase representation, identifies which quantities remain unchanged, and predicts the corresponding displacement and velocity histories without merely substituting new numbers into a familiar solution.",
            "expectedPerformanceDe": "Zu vorgegebenen Anfangswerten löst die lernende Person die Differenzialgleichung selbstständig, bestimmt Amplitude und Phase mit konsistenter Vorzeichenkonvention, prüft Lösung und Anfangswerte durch Einsetzen und erläutert an Gleichung und Zeitdiagramm die physikalische Bedeutung von Amplitude, Kreisfrequenz und Phase.",
            "expectedPerformanceEn": "For specified initial values, the learner independently solves the differential equation, determines amplitude and phase using a consistent sign convention, verifies the solution and initial values by substitution, and explains from the equation and a time graph the physical meaning of amplitude, angular frequency, and phase.",
            "understandingFocusDe": "Die lernende Person versteht, dass die lineare Gleichung x''(t) + ω²x(t) = 0 im idealisierten ungedämpften Modell eine sinusförmige Bewegung um die Gleichgewichtslage beschreibt: Die Kreisfrequenz bestimmt die Zeitskala, während Anfangsauslenkung und Anfangsgeschwindigkeit Amplitude und Phase der konkreten Lösung festlegen.",
            "understandingFocusEn": "The learner understands that the linear equation x''(t) + ω²x(t) = 0 describes sinusoidal motion about equilibrium in the idealized undamped model: angular frequency sets the time scale, while initial displacement and initial velocity determine the amplitude and phase of the particular solution."
          },
          {
            "id": "fresh-independent-case-b",
            "taskDemandDe": "Für einen unabhängig vorgelegten Oszillator, der statt aus einer Ruhelage bei maximaler Auslenkung nun beim Nulldurchgang mit vorgegebener Bewegungsrichtung startet, sagt die lernende Person zunächst die qualitative Änderung von Amplitude und Phase voraus, bestimmt danach die Lösung in einer anderen äquivalenten Sinus-Kosinus-Darstellung und weist die Übereinstimmung beider Darstellungen nach.",
            "taskDemandEn": "For an independently presented oscillator that starts at equilibrium with a specified direction of motion rather than from rest at maximum displacement, the learner first predicts the qualitative change in amplitude and phase, then determines the solution in a different but equivalent sine-cosine representation and demonstrates that the two representations agree.",
            "expectedPerformanceDe": "Die lernende Person löst die gegebene Differenzialgleichung, setzt Auslenkung und Geschwindigkeit zum Anfangszeitpunkt ein, bestimmt die Konstanten einschließlich eines zum Vorzeichen von x(0) und v(0) passenden Phasenwinkels und prüft durch Ableiten sowohl die Gleichung als auch beide Anfangsbedingungen; anschließend deutet sie A, ω₀ und φ mit Größen, Einheiten und Bezug auf die gewählte Zeit- und Koordinatenkonvention.",
            "expectedPerformanceEn": "The learner solves the given differential equation, applies the initial displacement and velocity, determines the constants including a phase angle consistent with the signs of x(0) and v(0), and checks both the equation and the two initial conditions by differentiation; the learner then interprets A, ω₀, and φ using physical quantities, units, and the chosen time and coordinate conventions.",
            "understandingFocusDe": "Die allgemeine Lösung der ungedämpften Schwingungsgleichung x''+ω₀²x=0 kann gleichwertig als Linearkombination von Sinus und Kosinus oder als x(t)=A cos(ω₀t+φ) dargestellt werden; zwei Anfangsbedingungen bestimmen die beiden Integrationskonstanten eindeutig, während A die maximale Auslenkung, ω₀ die Zeitskala der Schwingung und φ den Anfangszustand im Zyklus beschreibt.",
            "understandingFocusEn": "The general solution of the undamped oscillator equation x''+ω₀²x=0 can equivalently be represented as a linear combination of sine and cosine or as x(t)=A cos(ω₀t+φ); two initial conditions uniquely determine the two integration constants, while A describes the maximum displacement, ω₀ the oscillator's time scale, and φ the initial state within the cycle."
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
      "goalId": "d18d4190-ddc1-5181-b1b6-e79947b737c2",
      "profile": {
        "archetype": "procedure",
        "expectations": [
          {
            "id": "instantaneous-voltage-is-negative-flux-derivative",
            "essentialUnderstandingDe": "Für differenzierbaren Fluss gilt U_ind(t) = −N dΦ/dt. Der Spannungsbetrag misst die momentane Flussänderungsrate, nicht den Flusswert selbst; konstanter Fluss liefert null Spannung.",
            "essentialUnderstandingEn": "For differentiable flux, U_ind(t) = −N dΦ/dt. Voltage magnitude measures the instantaneous rate of flux change, not the flux value itself; constant flux gives zero voltage.",
            "observablePerformanceDe": "Die lernende Person wählt für eine neue Funktion oder einen glatten Graphen die Ableitungsform, bestimmt U_ind(t) mit Einheit und erklärt Nullstellen aus waagerechter Flussteigung.",
            "observablePerformanceEn": "For a fresh function or smooth graph, the learner selects the derivative form, determines U_ind(t) with units, and explains zeros from horizontal flux slope."
          },
          {
            "id": "voltage-graph-translates-slope-and-sign",
            "essentialUnderstandingDe": "Maxima, Nulldurchgänge und Vorzeichenwechsel von U_ind entsprechen Steilheit und Vorzeichen der Φ-Steigung unter einer festen Orientierung. Eine große Flussamplitude erzeugt nicht automatisch große Spannung, wenn sie sich langsam ändert.",
            "essentialUnderstandingEn": "Maxima, zero crossings, and sign changes of U_ind correspond to the magnitude and sign of the slope of Φ under a fixed orientation. Large flux amplitude does not automatically mean large voltage if it changes slowly.",
            "observablePerformanceDe": "Die lernende Person skizziert aus einem unbekannten Φ(t)-Graphen den Spannungsverlauf, begründet charakteristische Punkte über Tangentensteigungen und prüft Vorzeichen und N-Skalierung.",
            "observablePerformanceEn": "From an unfamiliar Φ(t) graph, the learner sketches the voltage curve, justifies characteristic points through tangent slopes, and checks sign and N scaling."
          },
          {
            "id": "frequency-shape-and-differentiability-bound-transfer",
            "essentialUnderstandingDe": "Frequenz und Kurvenform bestimmen die Änderungsrate; bei höherer Frequenz wächst bei gleicher Flussamplitude typischerweise der Spannungsmaßstab. An nicht differenzierbaren Stellen ist die gebundene momentane Ableitungsform nicht unmittelbar definiert.",
            "essentialUnderstandingEn": "Frequency and curve shape determine rate of change; at higher frequency, with the same flux amplitude, the voltage scale typically increases. At nondifferentiable points, the bound instantaneous derivative form is not directly defined.",
            "observablePerformanceDe": "Für veränderte Frequenz, Phase oder glatte Kurvenform prognostiziert und berechnet die lernende Person U_ind; bei einem Knick benennt sie die verletzte Voraussetzung statt einen beliebigen Momentanwert zu erfinden.",
            "observablePerformanceEn": "For changed frequency, phase, or smooth curve shape, the learner predicts and calculates U_ind; at a corner, the learner identifies the violated assumption instead of inventing an instantaneous value."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "instantaneous-voltage-is-negative-flux-derivative",
            "voltage-graph-translates-slope-and-sign",
            "frequency-shape-and-differentiability-bound-transfer"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "flux-form",
            "textDe": "Sinusförmiger, polynomialer oder glatter abschnittsweise dargestellter Fluss",
            "textEn": "Sinusoidal, polynomial, or smoothly piecewise-represented flux"
          },
          {
            "id": "time-parameter",
            "textDe": "Frequenz, Phase und zeitliche Streckung bei gleicher Flussamplitude",
            "textEn": "Frequency, phase, and time stretching at equal flux amplitude"
          },
          {
            "id": "regularity",
            "textDe": "Differenzierbarer Verlauf gegenüber ausdrücklich nicht differenzierbarem Knick",
            "textEn": "Differentiable curve versus an explicitly nondifferentiable corner"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "sinusoidal-flux-phase",
            "taskDemandDe": "Für Φ(t) = Φ0 cos(ωt) und N Windungen bestimme U_ind(t), skizziere beide Verläufe und erkläre Amplitude, Phasenlage und Nulldurchgänge physikalisch.",
            "taskDemandEn": "For Φ(t) = Φ0 cos(ωt) and N turns, determine U_ind(t), sketch both curves, and physically explain amplitude, phase relation, and zero crossings.",
            "expectedPerformanceDe": "Die lernende Person erhält U_ind = NωΦ0 sin(ωt) unter der festgelegten Konvention, verbindet den ω-Faktor mit Änderungsrate und ordnet Spannungsnullen den Flussextrema zu.",
            "expectedPerformanceEn": "The learner obtains U_ind = NωΦ0 sin(ωt) under the specified convention, links the ω factor to rate of change, and associates voltage zeros with flux extrema.",
            "understandingFocusDe": "Der Fall prüft Ableitung und physikalische Graphdeutung gemeinsam.",
            "understandingFocusEn": "The case jointly tests differentiation and physical graph interpretation."
          },
          {
            "id": "smooth-pulse-and-corner-audit",
            "taskDemandDe": "Ein glatter magnetischer Flusspuls und ein zweiter Verlauf mit idealisiertem Knick werden vorgegeben. Skizziere für den glatten Puls U_ind(t), identifiziere Maxima und Vorzeichenwechsel und beurteile den Momentanwert genau am Knick des zweiten Verlaufs.",
            "taskDemandEn": "A smooth magnetic-flux pulse and a second curve with an idealized corner are supplied. Sketch U_ind(t) for the smooth pulse, identify maxima and sign changes, and judge the instantaneous value exactly at the corner of the second curve.",
            "expectedPerformanceDe": "Die lernende Person leitet den glatten Verlauf qualitativ aus der Steigung ab, lokalisiert größte Beträge an steilsten Stellen und erklärt, dass die klassische Ableitung am Knick keinen eindeutigen Momentanwert liefert.",
            "expectedPerformanceEn": "The learner derives the smooth voltage qualitatively from slope, locates largest magnitudes at steepest points, and explains that the classical derivative gives no unique instantaneous value at the corner.",
            "understandingFocusDe": "Der Transfer prüft Kurvenform und die explizite Differenzierbarkeitsgrenze.",
            "understandingFocusEn": "The transfer tests curve shape and the explicit differentiability limit."
          }
        ]
      }
    },
    {
      "goalId": "692db5b6-8be1-5c7b-8307-3a02afb21ea0",
      "profile": {
        "archetype": "data",
        "expectations": [
          {
            "id": "rl-current-is-continuous-and-exponential",
            "essentialUnderstandingDe": "Im idealisierten linearen RL-Kreis kann der Spulenstrom nicht sprunghaft ändern. Widerstand und Selbstinduktion erzeugen exponentielle Ein- und Ausschaltverläufe mit physikalisch bestimmten Anfangs- und Grenzwerten.",
            "essentialUnderstandingEn": "In an idealized linear RL circuit, inductor current cannot change discontinuously. Resistance and self-induction produce exponential switch-on and switch-off transients with physically determined initial and limiting values.",
            "observablePerformanceDe": "Die lernende Person ordnet aus frischen Strom- und Spannungsdaten Schaltphase und Bauteilgrößen zu, bestimmt Anfangs- und Grenzwerte und verwirft einen Verlauf mit unzulässigem Stromsprung.",
            "observablePerformanceEn": "From fresh current and voltage data, the learner identifies switching phase and component quantities, determines initial and limiting values, and rejects a curve with an inadmissible current jump."
          },
          {
            "id": "time-constant-connects-graph-and-components",
            "essentialUnderstandingDe": "Die Zeitkonstante τ = L/R legt die Zeitskala fest; nach τ ist beim Einschalten ein charakteristischer Anteil des Endwerts erreicht. Bei bekanntem R erlaubt eine aus Daten bestimmte Zeitkonstante die Bestimmung von L.",
            "essentialUnderstandingEn": "The time constant τ = L/R sets the timescale; after one τ a characteristic fraction of the final switch-on value is reached. With known R, a time constant determined from data allows L to be found.",
            "observablePerformanceDe": "Die lernende Person bestimmt τ aus Graph, Tabellenwerten oder einem geeigneten Fit, berechnet L mit Einheit und gibt eine datenangemessene Genauigkeit statt Scheingenauigkeit an.",
            "observablePerformanceEn": "The learner determines τ from a graph, tabulated values, or an appropriate fit, calculates L with units, and reports precision appropriate to the data rather than false precision."
          },
          {
            "id": "changed-parameters-predict-transient",
            "essentialUnderstandingDe": "Größeres L verlangsamt und größeres R beschleunigt über τ = L/R bei sonst gleichem Serien-RL-Modell die zeitliche Annäherung. Bei einem Spannungssprung bestimmen Quellenspannung und Gesamtwiderstand gemeinsam den stationären Grenzstrom U/R, während die Anfangsbedingung den Startwert festlegt; Spannungspolungen folgen der jeweiligen Schaltphase.",
            "essentialUnderstandingEn": "Larger L slows and larger R speeds the approach through τ = L/R in an otherwise unchanged series RL model. For a voltage step, source voltage and total resistance jointly determine the steady-state limiting current U/R, while the initial condition sets the starting value; voltage polarities follow the switching phase.",
            "observablePerformanceDe": "Vor Auswertung eines neuen Datensatzes sagt die lernende Person getrennt voraus, wie R und L die Zeitkonstante, wie Quellenspannung und R den Grenzstrom und wie der Anfangsstrom den Startwert verändern, und prüft die Prognose an Verlauf und Residuen.",
            "observablePerformanceEn": "Before analyzing a fresh data set, the learner separately predicts how R and L affect the time constant, how source voltage and R affect the limiting current, and how initial current sets the starting value, then checks the prediction against the curve and residuals."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "rl-current-is-continuous-and-exponential",
            "time-constant-connects-graph-and-components",
            "changed-parameters-predict-transient"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "transient-type",
            "textDe": "Einschalten, Ausschalten oder Übergang mit nichtverschwindendem Anfangsstrom",
            "textEn": "Switch-on, switch-off, or transition with nonzero initial current"
          },
          {
            "id": "component-change",
            "textDe": "Änderung von R, L oder beiden bei unterschiedlicher Zeitkonstante",
            "textEn": "Change of R, L, or both with different time constants"
          },
          {
            "id": "data-quality",
            "textDe": "Glatter Modellgraph, verrauschte Tabelle oder Datensatz mit erkennbarem Offset",
            "textEn": "Smooth model curve, noisy table, or data set with a detectable offset"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "extract-inductance-from-switch-on-data",
            "taskDemandDe": "Für einen RL-Kreis mit bekanntem R sind Strommesswerte nach dem Einschalten samt Unsicherheiten gegeben. Bestimme Endwert und τ, berechne L und prüfe, ob ein exponentielles Modell die Daten angemessen beschreibt.",
            "taskDemandEn": "For an RL circuit with known R, current measurements after switch-on are supplied with uncertainties. Determine the final value and τ, calculate L, and check whether an exponential model adequately describes the data.",
            "expectedPerformanceDe": "Die lernende Person nutzt mehrere Datenpunkte oder einen Fit, erhält L = Rτ mit Einheit, vergleicht Abweichungen mit Unsicherheiten und formuliert eine begrenzte Modellentscheidung.",
            "expectedPerformanceEn": "The learner uses multiple data points or a fit, obtains L = Rτ with units, compares deviations with uncertainties, and states a bounded model judgment.",
            "understandingFocusDe": "Der Fall prüft die quantitative Verbindung von Kurve, Zeitkonstante und Bauteilwert.",
            "understandingFocusEn": "The case tests the quantitative link among curve, time constant, and component value."
          },
          {
            "id": "resistance-change-switch-off-transfer",
            "taskDemandDe": "Derselbe geladene Induktor wird über zwei verschiedene Widerstände entladen. Prognostiziere vorab die relative Zeitkonstante, ordne zwei unbekannte Stromkurven zu und erkläre Anfangswert sowie Spannungspolung.",
            "taskDemandEn": "The same energized inductor is discharged through two different resistors. Predict the relative time constants, assign two unlabeled current curves, and explain the initial value and voltage polarity.",
            "expectedPerformanceDe": "Die lernende Person erkennt τ = L/R, ordnet dem größeren R den schnelleren Abfall zu, erhält den kontinuierlichen gemeinsamen Anfangsstrom und begründet die Ausschaltpolung aus Selbstinduktion.",
            "expectedPerformanceEn": "The learner uses τ = L/R, assigns faster decay to the larger R, preserves the common continuous initial current, and justifies switch-off polarity from self-induction.",
            "understandingFocusDe": "Der Transfer prüft Parameterwirkung und physikalische Randwerte an einer anderen Schaltphase.",
            "understandingFocusEn": "The transfer tests parameter effects and physical boundary values in a different switching phase."
          }
        ]
      }
    },
    {
      "goalId": "e160acb4-5b88-509e-8055-2653df420c65",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "construct-equation-from-wave-conditions",
            "essentialUnderstandingDe": "Eine harmonische fortschreitende Welle kann etwa als s(x,t)=A cos(kx∓ωt+φ) dargestellt werden, wobei k=2π/λ und ω=2πf gelten. Die Phase ist dimensionslos; das relative Vorzeichen von Orts- und Zeitterm codiert bei festgelegter positiver x-Achse die Ausbreitungsrichtung, während Anfangsbedingungen φ beziehungsweise die Wahl von Sinus oder Kosinus festlegen.",
            "essentialUnderstandingEn": "A progressive harmonic wave can be represented, for example, as s(x,t)=A cos(kx∓ωt+φ), with k=2π/λ and ω=2πf. Phase is dimensionless; for a specified positive x axis, the relative sign of the space and time terms encodes propagation direction, while initial conditions determine φ and the choice of sine or cosine.",
            "observablePerformanceDe": "Die lernende Person wählt für neue Angaben eine konsistente Form, berechnet k und ω mit Einheiten, bestimmt die Phase aus einer Anfangsbedingung und weist die Ausbreitungsrichtung durch konstante Phase statt durch Merken eines isolierten Vorzeichens nach.",
            "observablePerformanceEn": "For fresh information, the learner chooses a consistent form, calculates k and ω with units, determines phase from an initial condition, and establishes propagation direction using constant phase rather than memorizing an isolated sign."
          },
          {
            "id": "interpret-and-transform-wave-parameters",
            "essentialUnderstandingDe": "A, f, λ, φ und die Ausbreitungsrichtung haben unterschiedliche physikalische Bedeutungen; vPhase=ω/k=fλ verbindet räumliche und zeitliche Periodizität. Eine Verschiebung von Orts- oder Zeitnullpunkt kann die Phasenkonstante ändern, ohne Amplitude, Frequenz, Wellenlänge oder physikalische Ausbreitungsgeschwindigkeit zu verändern.",
            "essentialUnderstandingEn": "A, f, λ, φ, and propagation direction have distinct physical meanings; vphase=ω/k=fλ links spatial and temporal periodicity. Shifting the spatial or temporal origin can change the phase constant without changing amplitude, frequency, wavelength, or physical propagation speed.",
            "observablePerformanceDe": "Die lernende Person liest alle Parameter einer unbekannten Gleichung aus, prüft Dimensionen und ausgewählte Werte, verfolgt eine konstante Phase und passt die Gleichung bei geändertem Nullpunkt oder umgekehrter Richtung an, wobei sie unveränderte Größen begründet.",
            "observablePerformanceEn": "The learner extracts all parameters from an unfamiliar equation, checks dimensions and selected values, tracks a constant phase, and adapts the equation for a shifted origin or reversed direction while justifying which quantities remain unchanged."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "construct-equation-from-wave-conditions",
            "interpret-and-transform-wave-parameters"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "given-information",
            "textDe": "Physikalische Größen und Anfangsbedingung, Diagramm oder bereits formulierte Gleichung",
            "textEn": "Physical quantities and an initial condition, a graph, or an already formulated equation"
          },
          {
            "id": "propagation-direction",
            "textDe": "Ausbreitung in positive oder negative Koordinatenrichtung",
            "textEn": "Propagation in the positive or negative coordinate direction"
          },
          {
            "id": "coordinate-origin",
            "textDe": "Unveränderter oder verschobener Orts- beziehungsweise Zeitnullpunkt",
            "textEn": "Unchanged or shifted spatial or temporal origin"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "build-right-moving-wave-equation",
            "taskDemandDe": "Eine Welle besitzt A=3,0 cm, λ=0,80 m und f=5,0 Hz, läuft in positive x-Richtung und hat bei x=0 und t=0 einen Wellenberg. Stelle eine passende SI-Gleichung auf, bestimme die Phasengeschwindigkeit und prüfe die Anfangsbedingung sowie die Ausbreitungsrichtung.",
            "taskDemandEn": "A wave has A=3.0 cm, λ=0.80 m, and f=5.0 Hz, travels in the positive x direction, and has a crest at x=0 and t=0. Formulate a suitable SI equation, determine phase speed, and check both the initial condition and propagation direction.",
            "expectedPerformanceDe": "Die lernende Person formuliert beispielsweise s=0,030 cos(2πx/0,80−2π·5,0t), erhält v=4,0 m/s, prüft s(0,0)=A und zeigt aus konstanter Phase eine Wanderung zu größerem x.",
            "expectedPerformanceEn": "The learner formulates, for example, s=0.030 cos(2πx/0.80−2π·5.0t), obtains v=4.0 m/s, checks s(0,0)=A, and shows from constant phase that the wave moves toward larger x.",
            "understandingFocusDe": "Der Grundfall prüft Auswahl, Parameterumrechnung, Anfangsbedingung und Richtung als zusammenhängendes Modell.",
            "understandingFocusEn": "The direct case tests selection, parameter conversion, initial condition, and direction as one coherent model."
          },
          {
            "id": "interpret-left-moving-equation-and-shift-origin",
            "taskDemandDe": "Gegeben ist s(x,t)=0,020 sin(4πx+10πt+π/3) in SI-Einheiten. Bestimme A, λ, f, Phasengeschwindigkeit und Richtung, prüfe die Einheit des Phasenarguments und formuliere anschließend eine äquivalente Darstellung für einen um x0 verschobenen Ortsnullpunkt.",
            "taskDemandEn": "Given s(x,t)=0.020 sin(4πx+10πt+π/3) in SI units, determine A, λ, f, phase speed, and direction, check the units of the phase argument, and then formulate an equivalent representation for a spatial origin shifted by x0.",
            "expectedPerformanceDe": "Die lernende Person erhält A=0,020 m, λ=0,50 m, f=5,0 Hz, v=2,5 m/s und Ausbreitung in negative x-Richtung; sie hält das Argument dimensionslos und nimmt die Nullpunktverschiebung in die Phase auf, ohne A, λ, f oder v zu ändern.",
            "expectedPerformanceEn": "The learner obtains A=0.020 m, λ=0.50 m, f=5.0 Hz, v=2.5 m/s, and propagation in the negative x direction; the phase argument remains dimensionless and the origin shift is absorbed into phase without changing A, λ, f, or v.",
            "understandingFocusDe": "Der Transfer kehrt die Arbeitsrichtung um und prüft Parameterdeutung sowie Koordinateninvarianz.",
            "understandingFocusEn": "The transfer reverses the direction of work and tests parameter interpretation and coordinate invariance."
          }
        ]
      }
    },
    {
      "goalId": "215f5558-562c-5686-b649-931f324c7983",
      "profile": {
        "archetype": "proof",
        "expectations": [
          {
            "id": "fixed-end-boundary-requires-phase-pi",
            "essentialUnderstandingDe": "Am ideal festen Ende muss die Gesamtauslenkung zu jeder Zeit null sein. Einlaufende und reflektierte Auslenkungswelle erfüllen diese Randbedingung nur mit entgegengesetztem Vorzeichen am Ende; der Reflexionsfaktor ist −1 und entspricht einem Phasensprung von π beziehungsweise einer Pulsinversion.",
            "essentialUnderstandingEn": "At an ideal fixed end, total displacement must be zero at all times. The incident and reflected displacement waves satisfy this boundary condition only with opposite signs at the end; the reflection coefficient is −1, corresponding to a phase shift of π or pulse inversion.",
            "observablePerformanceDe": "Die lernende Person formuliert zu einer neuen einlaufenden Welle eine reflektierte Welle, setzt beide am festen Ende ein und zeigt rechnerisch und an einer eigenständig konstruierten Pulsdarstellung, dass sich die Auslenkungen dort aufheben.",
            "observablePerformanceEn": "For a fresh incident wave, the learner formulates a reflected wave, substitutes both at the fixed end, and shows mathematically and with an independently constructed pulse diagram that the displacements cancel there."
          },
          {
            "id": "free-end-boundary-requires-no-inversion",
            "essentialUnderstandingDe": "Am ideal losen Ende verschwindet die transversale Kraft und damit im linearen Saitenmodell die räumliche Steigung der Gesamtauslenkung. Diese Randbedingung verlangt für die Auslenkungswelle einen Reflexionsfaktor +1: Der reflektierte Puls ist nicht invertiert und besitzt keinen Phasensprung gegenüber dem einlaufenden Puls.",
            "essentialUnderstandingEn": "At an ideal free end, transverse force vanishes and therefore, in the linear string model, so does the spatial slope of total displacement. This boundary condition requires reflection coefficient +1 for the displacement wave: the reflected pulse is not inverted and has no phase shift relative to the incident pulse.",
            "observablePerformanceDe": "Die lernende Person setzt die Ableitungsrandbedingung für eine neue Wellenform ein, begründet das gleiche Vorzeichen der reflektierten Auslenkung und sagt die Reflexionsform nach einem Wechsel zwischen festem und losem Ende korrekt voraus.",
            "observablePerformanceEn": "The learner applies the derivative boundary condition to a fresh waveform, justifies the same sign of reflected displacement, and correctly predicts the reflection shape after switching between fixed and free ends."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "fixed-end-boundary-requires-phase-pi",
            "free-end-boundary-requires-no-inversion"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "termination",
            "textDe": "Ideales festes oder ideales loses Ende",
            "textEn": "Ideal fixed or ideal free end"
          },
          {
            "id": "wave-form",
            "textDe": "Einzelner Puls, harmonische Welle oder Momentanbild der Überlagerung",
            "textEn": "Single pulse, harmonic wave, or snapshot of the superposition"
          },
          {
            "id": "representation-direction",
            "textDe": "Mathematische Randbedingung zur Darstellung oder Darstellung zur Randbedingung",
            "textEn": "Mathematical boundary condition to representation or representation to boundary condition"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "pulse-reflection-fixed-and-free",
            "taskDemandDe": "Ein positiver nicht-sinusförmiger Auslenkungspuls läuft auf ein Seilende zu. Konstruiere getrennt die reflektierte Pulsform für einen ideal festen und einen ideal losen Abschluss, sage das Vorzeichen nach der Reflexion voraus und erkläre den Unterschied aus den jeweiligen Randbedingungen.",
            "taskDemandEn": "A positive nonsinusoidal displacement pulse travels toward the end of a string. Separately construct the reflected pulse for an ideal fixed and an ideal free termination, predict its sign after reflection, and explain the difference from the respective boundary conditions.",
            "expectedPerformanceDe": "Die lernende Person invertiert den Puls am festen Ende und lässt ihn am losen Ende gleich orientiert, erklärt am festen Ende die stets verschwindende Auslenkung und am losen Ende die verschwindende Steigung beziehungsweise Querkraft und nennt die Idealisation.",
            "expectedPerformanceEn": "The learner inverts the pulse at the fixed end and keeps its orientation at the free end, explains zero displacement at the fixed end and zero slope or transverse force at the free end, and states the idealization.",
            "understandingFocusDe": "Der Grundfall prüft den kausalen Zusammenhang zwischen Randbedingung und Pulsphase ohne bekannte Sinusvorlage.",
            "understandingFocusEn": "The direct case tests the causal link between boundary condition and pulse phase without a familiar sinusoidal template."
          },
          {
            "id": "harmonic-boundary-verification-transfer",
            "taskDemandDe": "Für eine einlaufende harmonische Welle y_i(x,t) an einer Grenze x=0 sind zwei Kandidaten für y_r gegeben, einer mit Reflexionsfaktor +1 und einer mit −1. Prüfe für beide Endtypen durch Einsetzen von y_i+y_r beziehungsweise seiner räumlichen Ableitung, welcher Kandidat die Randbedingung erfüllt, und leite die zugehörige Phasendifferenz ab.",
            "taskDemandEn": "For an incident harmonic wave y_i(x,t) at a boundary x=0, two candidates for y_r are supplied, one with reflection coefficient +1 and one with −1. For both termination types, test by substituting y_i+y_r or its spatial derivative which candidate satisfies the boundary condition, and derive the associated phase difference.",
            "expectedPerformanceDe": "Die lernende Person wählt für das feste Ende den Faktor −1 und die Phasendifferenz π und für das lose Ende den Faktor +1 und die Phasendifferenz 0, wobei Vorzeichen- und Phasenkonvention konsistent bleiben.",
            "expectedPerformanceEn": "The learner selects coefficient −1 and phase difference π for the fixed end and coefficient +1 and phase difference 0 for the free end, maintaining a consistent sign and phase convention.",
            "understandingFocusDe": "Der Transfer verlangt eine explizite mathematische Prüfung beider idealen Randfälle.",
            "understandingFocusEn": "The transfer requires explicit mathematical verification of both ideal boundary cases."
          }
        ]
      }
    },
    {
      "goalId": "f6a3a602-1e45-5018-b0ff-3d49933cf634",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "continuous-aperture-model",
            "essentialUnderstandingDe": "Für eine gleichmäßig beleuchtete Einzelöffnung werden die ortsabhängigen Elementarwellenamplituden kohärent addiert. Das Fraunhofer-Modell ergibt I/I0=[sin(πu)/(πu)]² mit u=b sinθ/λ und Grenzwert1 bei u0; unabhängige Intensitäten zu addieren wäre ein anderes Modell.",
            "essentialUnderstandingEn": "For a uniformly illuminated single aperture, position-dependent elementary-wave amplitudes add coherently. The Fraunhofer model gives I/I0=[sin(πu)/(πu)]² with u=b sinθ/λ and limit1 at u0; summing independent intensities would be a different model.",
            "observablePerformanceDe": "Konstruiert oder erläutert die kontinuierliche Phasenaddition, begründet das Quadrieren der resultierenden Amplitude und zeichnet einen normierten Verlauf mit korrektem Zentrum und Nullstellen.",
            "observablePerformanceEn": "Constructs or explains continuous phase addition, justifies squaring the resultant amplitude and draws a normalised curve with the correct centre and zeros."
          },
          {
            "id": "minima-side-maxima-and-validity",
            "essentialUnderstandingDe": "Nichtnullige ganzzahlige u sind Minima, die ersten beiden begrenzen das Zentralmaximum. Nebenmaxima folgen aus dem sinc²-Modell, nicht exakt aus halben Ordnungen. Beleuchtungsverteilung, Fernfeldbedingung und Kleinwinkelannahme sind getrennte Voraussetzungen.",
            "essentialUnderstandingEn": "Nonzero integer u values are minima, with the first pair bounding the central maximum. Secondary maxima follow from the sinc² model, not exact half orders. Illumination profile, far-field condition and small-angle approximation are separate assumptions.",
            "observablePerformanceDe": "Berechnet Minimumorte und Zentralbreite mit begründeter Geometrie, lokalisiert ein Nebenmaximum aus Modelldaten und beurteilt Grenzen bei veränderter Spaltbreite oder Beleuchtung.",
            "observablePerformanceEn": "Calculates minima and central width using justified geometry, locates a secondary maximum from model data and assesses validity under changed slit width or illumination."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "continuous-aperture-model",
            "minima-side-maxima-and-validity"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "model-construction-versus-reading",
            "textDe": "Ein Intensitätsmodell aus kohärenten Amplituden aufbauen statt bloß gegebene Tabellenwerte ablesen.",
            "textEn": "Construct an intensity model from coherent amplitudes rather than merely reading a supplied table."
          },
          {
            "id": "aperture-width-and-illumination",
            "textDe": "Spaltbreite und gleichmäßige Beleuchtung als verschiedene Modellparameter bzw. Annahmen verändern.",
            "textEn": "Vary slit width and uniform illumination as distinct model parameters or assumptions."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "fresh-single-slit-model",
            "taskDemandDe": "Gegebene Fernfeldanordnung: λ=600nm,b=0,30mm,L=1,5m, gleichmäßige Beleuchtung. Erkläre mit phasenabhängigen Elementarwellen, warum Amplituden und nicht Intensitäten addiert werden. Stelle das normierte Intensitätsmodell auf und bestimme erste Minima, Zentralbreite und Intensität des ersten Nebenmaximums beiu≈1,4303.",
            "taskDemandEn": "Given far-field arrangement:λ=600nm,b=0.30mm,L=1.5m with uniform illumination. Use phase-dependent elementary waves to explain why amplitudes, not intensities, are added. Construct the normalised intensity model and find first minima, central width and first secondary-maximum intensity atu≈1.4303.",
            "expectedPerformanceDe": "Leitet/erläutert sinc² aus der Amplitudenüberlagerung und den Zentrumgrenzwert1. Erste Minima etwa±3,0mm, Zentralbreite6,0mm. Nebenmaximum etwa4,29mm mit I/I0≈0,04719; kein künstlich erhöhter Seitenpeak und kein Minimum beiu0.",
            "expectedPerformanceEn": "Derives/explains sinc² from amplitude superposition and centre limit1. First minima are about±3.0mm and central width6.0mm. The side maximum is about4.29mm with I/I0≈0.04719; no artificially enlarged side peak and no minimum atu0.",
            "understandingFocusDe": "Vollständiges Intensitätsmodell statt Austausch einer Minimagleichung.",
            "understandingFocusEn": "A complete intensity model rather than substituting a minimum equation."
          },
          {
            "id": "changed-width-and-model-limit",
            "taskDemandDe": "In derselben Modellanordnung wird b halbiert, λ und L bleiben gleich. Sage die Veränderung der Winkel-/Schirmverteilung voraus und begründe sie. Danach wird nur die Mitte des Spalts stark beleuchtet, die Ränder deutlich schwächer: Darf dieselbe gleichmäßig beleuchtete sinc²-Verteilung unverändert weiterbenutzt werden?",
            "taskDemandEn": "In the same model arrangement b is halved while λ and L stay fixed. Predict and justify the angular and screen-pattern changes. Then illuminate the slit centre much more strongly than its edges: may the same uniformly illuminated sinc² distribution be retained unchanged?",
            "expectedPerformanceDe": "Aus u=b sinθ/λ folgen größere Winkel; im hier kleinen Winkelbereich verdoppeln sich näherungsweise die Orte und Zentralbreite. Die normierte Kurve überu bleibt bei weiterhin gleichmäßiger Beleuchtung gleich; das behauptet keine unveränderte absolute Spitzenintensität. Nichtgleichmäßige Beleuchtung erfordert gewichtete Amplitudenüberlagerung; alte Nullstellen/Seitenhöhen dürfen ohne neues Modell nicht garantiert werden.",
            "expectedPerformanceEn": "u=b sinθ/λ implies larger angles; in this small-angle case positions and central width approximately double. With still-uniform illumination the normalised curve versusu stays the same, not necessarily the absolute peak intensity. Nonuniform illumination requires weighted amplitude superposition; old zeros and side heights cannot be guaranteed without a new model.",
            "understandingFocusDe": "Frischer Transfer über einen Geometrieparameter und eine echte Modellannahme.",
            "understandingFocusEn": "Fresh transfer across a geometry parameter and a genuine model assumption."
          }
        ]
      }
    },
    {
      "goalId": "48e77690-17f7-5ebe-a8f7-87b2ee9820da",
      "profile": {
        "archetype": "concept",
        "expectations": [
          {
            "id": "kontinuum-und-linien",
            "essentialUnderstandingDe": "Abbremsen von Elektronen erzeugt ein kontinuierliches Röntgenspektrum bis zur maximal übertragbaren Energie eU; Übergänge nach innerer Ionisation erzeugen charakteristische Linien.",
            "essentialUnderstandingEn": "Deceleration of electrons produces a continuous X-ray spectrum up to the maximum transferable energy eU; transitions following inner-shell ionization produce characteristic lines.",
            "observablePerformanceDe": "Erklärt die unterschiedlichen Entstehungsprozesse und sagt getrennt voraus, wie Grenzenergie und Linienlagen auf eine Spannungs- oder Materialänderung reagieren.",
            "observablePerformanceEn": "Explains the different production mechanisms and separately predicts how cutoff energy and line positions respond to changes in voltage or material."
          },
          {
            "id": "moseley-zusammenhang",
            "essentialUnderstandingDe": "Für dieselbe charakteristische Linienserie steigt die Frequenz näherungsweise wie (Z−σ)²; effektive Kernladung und Abschirmung erklären die systematische Materialabhängigkeit.",
            "essentialUnderstandingEn": "For the same characteristic line series, frequency rises approximately as (Z−σ)²; effective nuclear charge and screening explain systematic material dependence.",
            "observablePerformanceDe": "Deutet die Moseley-Beziehung an einem Materialvergleich und grenzt sie von der Beschleunigungsspannung als Energiegrenze des Kontinuums ab.",
            "observablePerformanceEn": "Interprets Moseley's relation in a material comparison and distinguishes it from the accelerating voltage as the continuum energy limit."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "kontinuum-und-linien",
            "moseley-zusammenhang"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "spannung-material",
            "textDe": "Gleiches Anodenmaterial bei verändertem U gegenüber verändertem Z bei gleichem U.",
            "textEn": "The same anode material with changing U versus changing Z at fixed U."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "roentgen-spannung",
            "taskDemandDe": "Bereitgestellte Röntgenspektren derselben Anode wurden bei 20 kV und 40 kV aufgenommen. Beide Spannungen liegen über der betrachteten inneren Ionisationsschwelle. Erkläre Kontinuum und Linien sowie die Änderung der maximalen Photonenenergie; eine Intensitätsberechnung ist nicht verlangt.",
            "taskDemandEn": "Supplied X-ray spectra of the same anode were recorded at 20 kV and 40 kV. Both voltages exceed the relevant inner-shell ionization threshold. Explain continuum and lines and the change in maximum photon energy; no intensity calculation is required.",
            "expectedPerformanceDe": "Bremsstrahlung erlaubt verschiedene Energieüberträge, maximal 20 beziehungsweise 40 keV. Die charakteristischen Linien beruhen auf festen inneren Energiedifferenzen und behalten bei gleichem Material ihre Energielagen, auch wenn Intensitäten variieren. Moseley ordnet Linienlagen dem Material zu, nicht einem frei mit U verschiebbaren Niveauabstand.",
            "expectedPerformanceEn": "Bremsstrahlung permits different energy transfers, with maxima of 20 and 40 keV respectively. Characteristic lines arise from fixed inner energy gaps and retain their energy positions for the same material even if intensities vary. Moseley relates line positions to the material, not to a level spacing freely shifted with U.",
            "understandingFocusDe": "Beschleunigungsenergie und innere Atomenergien steuern verschiedene Merkmale desselben Spektrums.",
            "understandingFocusEn": "Acceleration energy and internal atomic energies control different features of the same spectrum."
          },
          {
            "id": "roentgen-material",
            "taskDemandDe": "Zwei Anoden mit Z=20 und Z=30 werden bei gleicher, für beide betrachteten Linien ausreichender Spannung betrieben. Für dieselbe Linienserie werde f=C(Z−1)² angenähert. Vergleiche Linienfrequenzen und Kontinuumsgrenze und erkläre physikalisch.",
            "taskDemandEn": "Two anodes with Z=20 and Z=30 operate at the same voltage, sufficient to excite both considered lines. For the same line series use the approximation f=C(Z−1)². Compare line frequencies and continuum cutoff and explain physically.",
            "expectedPerformanceDe": "f_30/f_20=29²/19²=841/361≈2,33. Größere effektive Kernladung bewirkt größere innere Energiedifferenzen und höhere Linienfrequenz. Die maximale Bremsphotonenenergie eU bleibt gleich. Konstantes σ=1 ist eine vereinfachte Abschirmungsannahme für die ausgewählte Serie, keine universelle exakte Atomformel.",
            "expectedPerformanceEn": "f_30/f_20=29²/19²=841/361≈2.33. Greater effective nuclear charge produces larger inner energy gaps and a higher line frequency. Maximum bremsstrahlung photon energy eU remains unchanged. Constant σ=1 is a simplified screening assumption for the selected series, not a universal exact atomic formula.",
            "understandingFocusDe": "Eine Materialänderung verschiebt charakteristische Linien anders als eine Spannungsänderung die Kontinuumsgrenze.",
            "understandingFocusEn": "Changing the material shifts characteristic lines differently from the way voltage changes the continuum cutoff."
          }
        ]
      }
    },
    {
      "goalId": "57ec031c-9a91-5331-81a7-6ef900f7c63e",
      "profile": {
        "archetype": "procedure",
        "expectations": [
          {
            "id": "transform-same-event",
            "essentialUnderstandingDe": "Für gleich orientierte Achsen und bei t=t′=0 zusammenfallende Ursprünge sei S′ mit v relativ zu S bewegt. Dann gilt x′=γ(x−vt), t′=γ(t−vx/c²) mit γ=1/√(1−v²/c²), |v|<c. Die inverse Zuordnung wechselt das Vorzeichen von v. Die Raum-Zeit-Kopplung ändert Koordinaten, nicht das Ereignis.",
            "essentialUnderstandingEn": "For equally oriented axes and origins coinciding at t=t′=0, let S′ move at v relative to S. Then x′=γ(x−vt), t′=γ(t−vx/c²), with γ=1/√(1−v²/c²), |v|<c. The inverse assignment reverses the sign of v. Space-time coupling changes coordinates, not the event.",
            "observablePerformanceDe": "Die lernende Person legt selbst Umrechnungsrichtung, Achsen, Nullereignis und Geschwindigkeitsvorzeichen fest, wählt die passende Transformation und berechnet Ereigniskoordinaten mit konsistenten Einheiten. Sie erläutert eine entstehende Zeitdifferenz, prüft durch Rücktransformation und deutet Gleichzeitigkeit als Zuordnung synchronisierter Uhren des jeweiligen Systems.",
            "observablePerformanceEn": "The learner independently specifies conversion direction, axes, origin event, and velocity sign, selects the appropriate transformation, and calculates event coordinates with consistent units. They explain a resulting time difference, check by transforming back, and interpret simultaneity as an assignment by clocks synchronized within the respective frame."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "transform-same-event"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "forward-inverse",
            "textDe": "Die Ereignisse werden zuerst in S und in der frischen Aufgabe in S′ vorgegeben.",
            "textEn": "Events are supplied first in S and in the fresh task in S′."
          },
          {
            "id": "sign-and-event-relation",
            "textDe": "Die Relativgeschwindigkeit wechselt ihr Vorzeichen; ein gleichzeitiges Ereignispaar wird durch ein zeitlich getrenntes ersetzt.",
            "textEn": "Relative velocity changes sign, and a simultaneous event pair is replaced by a pair separated in time."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "simultaneous-laboratory-events",
            "taskDemandDe": "S′ bewegt sich mit v=+0,6c relativ zu S; die Achsen sind gleich orientiert und die Ursprünge fallen bei t=t′=0 zusammen. In S liegen A bei (x,t)=(0,0) und B bei (1,5 Lichtsekunden,0). Transformiere beide Ereignisse nach S′, interpretiere die Zeitdifferenz und prüfe die Rücktransformation. Eine Lichtsekunde ist die Strecke, die Licht im Vakuum in einer Sekunde zurücklegt.",
            "taskDemandEn": "S′ moves at v=+0.6c relative to S; the axes have the same orientation and the origins coincide at t=t′=0. In S, A has (x,t)=(0,0) and B has (1.5 light-seconds,0). Transform both events to S′, interpret the time difference, and check the inverse transformation. A light-second is the distance light travels in vacuum in one second.",
            "expectedPerformanceDe": "Die lernende Person begründet γ=1,25 und erhält A′=(0,0), B′=(1,875 Lichtsekunden,−1,125 s). B ist in S gleichzeitig mit A, in S′ früher. Die Zeiten stammen aus jeweils synchronisierten Systemuhren, nicht aus Signalankunft an einem Beobachter. Mit x=γ(x′+vt′), t=γ(t′+vx′/c²) ergibt sich wieder B=(1,5 Lichtsekunden,0); die Einheiten von vx/c² sind Sekunden.",
            "expectedPerformanceEn": "The learner justifies γ=1.25 and obtains A′=(0,0), B′=(1.875 light-seconds,−1.125 s). B is simultaneous with A in S and earlier in S′. Times come from clocks synchronized within each frame, not signal arrival at one observer. Using x=γ(x′+vt′), t=γ(t′+vx′/c²) recovers B=(1.5 light-seconds,0); vx/c² has units of seconds.",
            "understandingFocusDe": "Die gekoppelte Transformation erklärt einen konkreten Gleichzeitigkeitseffekt und wird über ihre inverse Zuordnung überprüft.",
            "understandingFocusEn": "The coupled transformation explains a concrete simultaneity effect and is checked through its inverse assignment."
          },
          {
            "id": "inverse-with-negative-frame-velocity",
            "taskDemandDe": "Nun bewegt sich S′ mit v=−0,6c relativ zu S, bei derselben Ursprungskonvention. In S′ sind A′=(0,0) und B′=(1,6 Lichtsekunden,1 s) gegeben. Bestimme die Koordinaten in S, erläutere das Vorzeichen der Zeitdifferenz und prüfe durch Transformation zurück nach S′.",
            "taskDemandEn": "Now S′ moves at v=−0.6c relative to S, using the same origin convention. S′ supplies A′=(0,0) and B′=(1.6 light-seconds,1 s). Determine the coordinates in S, explain the sign of the time difference, and check by transforming back to S′.",
            "expectedPerformanceDe": "Die lernende Person wählt trotz des negativen v die inverse Form mit +vt′ und +vx′/c² und erhält B=(1,25 Lichtsekunden,0,05 s). B liegt auch in S nach A, aber mit anderem Koordinatenzeitabstand. Die Rückrechnung liefert x′=1,6 Lichtsekunden und t′=1 s. Sie erklärt ihre Vorzeichen über die tatsächliche Bewegungs- und Umrechnungsrichtung.",
            "expectedPerformanceEn": "The learner selects the inverse form with +vt′ and +vx′/c² despite negative v and obtains B=(1.25 light-seconds,0.05 s). B is also later than A in S but with a different coordinate-time interval. Transforming back yields x′=1.6 light-seconds and t′=1 s. They explain the signs through the actual directions of motion and conversion.",
            "understandingFocusDe": "Die Methode wird nach Wechsel von Eingabesystem und Bewegungsrichtung selbstständig gewählt und physikalisch kontrolliert.",
            "understandingFocusEn": "The method is selected independently after changes of input frame and direction of motion and checked physically."
          }
        ]
      }
    },
    {
      "goalId": "2239cb67-82cb-585f-ab82-e1f2510eb4f7",
      "profile": {
        "archetype": "procedure",
        "expectations": [
          {
            "id": "signed-collinear-conversion",
            "essentialUnderstandingDe": "Für S′ mit Geschwindigkeit v relativ zu S und gleich orientierte Achsen gilt u′=(u−v)/(1−uv/c²), umgekehrt u=(u′+v)/(1+u′v/c²). Die Geschwindigkeiten beziehen sich auf Ortsänderung pro Koordinatenzeit im jeweiligen System. Die Umrechnung erhält Lichtgeschwindigkeit und Unterlichtgrenze; für |u|,|v|≪c entsteht die klassische Näherung.",
            "essentialUnderstandingEn": "For S′ moving at velocity v relative to S with equally oriented axes, u′=(u−v)/(1−uv/c²), and inversely u=(u′+v)/(1+u′v/c²). Velocities refer to position change per coordinate time within each frame. Conversion preserves light speed and the subluminal bound; for |u|,|v|≪c it gives the classical approximation.",
            "observablePerformanceDe": "Die lernende Person ordnet u, u′ und v eigenständig den Systemen zu, sagt die Bewegungsrichtung im Zielsystem voraus und begründet die gewählte Umrechnung. Sie berechnet das Ergebnis, interpretiert Betrag und Richtung und prüft Lichtfall und langsamen Grenzfall anhand des dimensionslosen Nenners.",
            "observablePerformanceEn": "The learner independently assigns u, u′, and v to their frames, predicts the direction of motion in the target frame, and justifies the chosen conversion. They calculate the result, interpret magnitude and direction, and check the light case and low-speed limit through the dimensionless denominator."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "signed-collinear-conversion"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "relative-direction",
            "textDe": "Ein in derselben Richtung schnellerer Körper wird durch einen im Ausgangssystem entgegenkommenden ersetzt.",
            "textEn": "A faster body moving in the same direction is replaced by one approaching in the input frame."
          },
          {
            "id": "target-frame-and-limits",
            "textDe": "Die Zielperspektive wechselt zwischen S′ und S; Teilchen-, Licht- und langsamer Grenzfall werden verglichen.",
            "textEn": "The target perspective switches between S′ and S; particle, light, and low-speed limiting cases are compared."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "overtaking-and-low-speed-limit",
            "taskDemandDe": "S′ fährt mit v=+0,6c relativ zu S. Ein Teilchen bewegt sich in S mit u=+0,8c kollinear in derselben Richtung. Sage seine Bewegungsrichtung in S′ voraus, berechne u′ und erkläre die Abweichung von u−v. Prüfe dieselbe Umrechnung für u=c sowie näherungsweise für u=35 m/s und v=30 m/s.",
            "taskDemandEn": "S′ moves at v=+0.6c relative to S. A particle moves collinearly in S at u=+0.8c in the same direction. Predict its direction of motion in S′, calculate u′, and explain the difference from u−v. Check the same conversion for u=c and approximately for u=35 m/s and v=30 m/s.",
            "expectedPerformanceDe": "Die lernende Person sagt Überholen in positiver Richtung voraus und erhält u′=(0,2/0,52)c=(5/13)c≈0,385c. Der Nenner berücksichtigt, dass auch Zeitabstände transformiert werden; die klassische Differenz 0,2c reicht hier nicht. Für u=c folgt u′=c. Bei 35 m/s und 30 m/s ist uv/c² verschwindend klein, daher u′≈5 m/s; die Nennerkorrektur ist dimensionslos.",
            "expectedPerformanceEn": "The learner predicts overtaking in the positive direction and obtains u′=(0.2/0.52)c=(5/13)c≈0.385c. The denominator accounts for time intervals also being transformed; the classical difference 0.2c is insufficient here. For u=c, u′=c follows. At 35 m/s and 30 m/s, uv/c² is negligible, so u′≈5 m/s; the denominator correction is dimensionless.",
            "understandingFocusDe": "Vorhersage, Systemzuordnung und physikalische Grenzfallkontrolle tragen eine konkrete Geschwindigkeitsumrechnung.",
            "understandingFocusEn": "Prediction, frame assignment, and physical limiting-case checks support a concrete velocity conversion."
          },
          {
            "id": "opposing-motion-inverse",
            "taskDemandDe": "In einem unabhängig vorgelegten Fall bewegt sich S′ weiterhin mit +0,6c relativ zu S, aber ein in S′ entgegenkommendes Teilchen hat u′=−0,8c. Gesucht ist nun seine Geschwindigkeit in S. Begründe zunächst deren Richtung, berechne sie und prüfe den geänderten Lichtfall u′=−c. Erläutere, weshalb klassische Addition nahe c unzulässige Ergebnisse erzeugen kann.",
            "taskDemandEn": "In an independently presented case S′ still moves at +0.6c relative to S, but a particle approaching in S′ has u′=−0.8c. Its velocity in S is now required. First justify its direction, calculate it, and check the changed light case u′=−c. Explain why classical addition near c can produce inadmissible results.",
            "expectedPerformanceDe": "Die lernende Person wählt die inverse Umrechnung und erhält u=(−0,2/0,52)c=−(5/13)c≈−0,385c: Das Teilchen bewegt sich auch in S nach −x. Für u′=−c ergibt sich u=−c. Sie begründet am Nenner und den zulässigen Beträgen |u′|,|v|<c, warum der Teilchenbetrag unter c bleibt, und erläutert anhand gleichgerichteter hoher Geschwindigkeiten, weshalb bloßes Addieren diese Grenze verletzen würde.",
            "expectedPerformanceEn": "The learner selects the inverse conversion and obtains u=(−0.2/0.52)c=−(5/13)c≈−0.385c: the particle also moves toward −x in S. For u′=−c, u=−c follows. They use the denominator and admissible magnitudes |u′|,|v|<c to justify the subluminal particle speed and explain using high velocities in the same direction why simple addition would violate that bound.",
            "understandingFocusDe": "Die Umrechnungsrichtung und die physikalischen Vorzeichen werden im entgegenkommenden Fall neu bestimmt.",
            "understandingFocusEn": "Conversion direction and physical signs are determined afresh for opposing motion."
          }
        ]
      }
    },
    {
      "goalId": "79da5c34-86b2-5c10-9726-9de886ccef7d",
      "profile": {
        "archetype": "proof",
        "expectations": [
          {
            "id": "historical-convention-derivation",
            "essentialUnderstandingDe": "Aus der relativistischen Gesamtenergie E = γm₀c² und der historischen Definition m_rel := E/c² folgt algebraisch m_rel = γm₀. Die Geschwindigkeitsabhängigkeit entsteht aus γ und aus der Definition, nicht aus einer Änderung der invarianten Ruhemasse m₀.",
            "essentialUnderstandingEn": "From the relativistic total energy E = γm₀c² and the historical definition m_rel := E/c², it follows algebraically that m_rel = γm₀. The velocity dependence comes from γ and the definition, not from a change in invariant rest mass m₀.",
            "observablePerformanceDe": "Die lernende Person leitet die Beziehung mit expliziten Ausgangsgleichungen und Definitionsschritt her, prüft für v = 0 den Grenzfall γ = 1 und kennzeichnet m_rel als historische Konvention statt als zweite invariante Teilcheneigenschaft.",
            "observablePerformanceEn": "The learner derives the relationship from explicit starting equations and the definitional step, checks the v = 0 limit γ = 1, and identifies m_rel as a historical convention rather than a second invariant particle property."
          },
          {
            "id": "invariant-rest-mass-distinction",
            "essentialUnderstandingDe": "Die Ruhemasse m₀ ist invariant und für dasselbe Teilchen unabhängig vom Inertialsystem. Die Größe γm₀ beziehungsweise E/c² ist dagegen bezugssystem- und geschwindigkeitsabhängig; beide Größen dürfen trotz gleicher Einheit nicht begrifflich gleichgesetzt werden.",
            "essentialUnderstandingEn": "Rest mass m₀ is invariant and independent of inertial frame for the same particle. The quantity γm₀ or E/c² is frame- and velocity-dependent; despite having the same unit, the two quantities must not be conceptually equated.",
            "observablePerformanceDe": "Die lernende Person vergleicht Angaben desselben Teilchens in zwei Inertialsystemen, hält m₀ konstant, ordnet unterschiedliche γ-, E- und m_rel-Werte den Bezugssystemen zu und korrigiert die Aussage, das Teilchen habe dadurch verschiedene invariante Massen.",
            "observablePerformanceEn": "The learner compares descriptions of the same particle in two inertial frames, keeps m₀ constant, assigns different γ, E, and m_rel values to the frames, and corrects the claim that the particle thereby has different invariant masses."
          },
          {
            "id": "modern-energy-momentum-translation",
            "essentialUnderstandingDe": "In moderner Darstellung bleibt die invariante Masse fest, während Gesamtenergie und Impuls mit der Geschwindigkeit zunehmen und durch E² = p²c² + m₀²c⁴ verknüpft sind. Historische Aussagen über „Massenzunahme“ können daher als Aussagen über E/c² übersetzt werden.",
            "essentialUnderstandingEn": "In modern formulation, invariant mass remains fixed while total energy and momentum increase with speed and are related by E² = p²c² + m₀²c⁴. Historical statements about “mass increase” can therefore be translated into statements about E/c².",
            "observablePerformanceDe": "Die lernende Person formuliert eine historische m_rel-Aussage in moderner Energie-Impuls-Sprache um, erklärt den wachsenden Energie- und Impulsbedarf bei Annäherung an c und vermeidet die Behauptung, m₀ selbst wachse oder Energie und Masse seien austauschbare Namen ohne Konvention.",
            "observablePerformanceEn": "The learner reformulates a historical m_rel statement in modern energy-momentum language, explains the increasing energy and momentum requirement as speed approaches c, and avoids claiming that m₀ itself grows or that energy and mass are interchangeable labels without convention."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "historical-convention-derivation",
            "invariant-rest-mass-distinction",
            "modern-energy-momentum-translation"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "speed-regime",
            "textDe": "Ruhe, moderate relativistische Geschwindigkeit oder Annäherung an die Lichtgeschwindigkeit",
            "textEn": "Rest, moderate relativistic speed, or approach to the speed of light"
          },
          {
            "id": "reference-frame",
            "textDe": "Ruhesystem des Teilchens oder relativ dazu bewegtes Inertialsystem",
            "textEn": "Particle rest frame or an inertial frame moving relative to it"
          },
          {
            "id": "language-convention",
            "textDe": "Historische relativistische-Masse-Sprache oder moderne Invariant-Masse-und-Energie-Impuls-Sprache",
            "textEn": "Historical relativistic-mass language or modern invariant-mass and energy-momentum language"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "derive-and-check-limits",
            "taskDemandDe": "Aus E = γm₀c² und der historischen Definition m_rel = E/c² ist m_rel herzuleiten und für v = 0 sowie eine vorgegebene relativistische Geschwindigkeit zu deuten. Dabei ist anzugeben, welche Größe invariant bleibt.",
            "taskDemandEn": "Starting from E = γm₀c² and the historical definition m_rel = E/c², m_rel must be derived and interpreted for v = 0 and a specified relativistic speed. The invariant quantity must be identified.",
            "expectedPerformanceDe": "Die lernende Person erhält m_rel = γm₀, prüft m_rel = m₀ im Ruhegrenzfall, ordnet den größeren Wert bei Bewegung der historischen Definition E/c² zu und hält m₀ für dasselbe Teilchen konstant.",
            "expectedPerformanceEn": "The learner obtains m_rel = γm₀, checks m_rel = m₀ in the rest limit, assigns the larger value in motion to the historical definition E/c², and keeps m₀ constant for the same particle.",
            "understandingFocusDe": "Die Herleitung macht sichtbar, dass die Geschwindigkeitsabhängigkeit aus γ und einer Definition stammt.",
            "understandingFocusEn": "The derivation makes visible that velocity dependence comes from γ and a definition."
          },
          {
            "id": "translate-two-frame-claim",
            "taskDemandDe": "Zwei Beobachter beschreiben dasselbe massive Teilchen mit verschiedenen Geschwindigkeiten. Eine historische Lösung sagt, seine „Masse“ sei im zweiten System größer. Die Aussage ist mathematisch einzuordnen und vollständig in moderne Größen zu übersetzen.",
            "taskDemandEn": "Two observers describe the same massive particle with different velocities. A historical solution says its “mass” is larger in the second frame. The statement must be classified mathematically and translated fully into modern quantities.",
            "expectedPerformanceDe": "Die lernende Person deutet „Masse“ hier als m_rel = E/c², lässt die invariante Ruhemasse unverändert, ordnet dem System mit größerem γ höhere Energie und größeren Impulsbetrag zu und erklärt die Bezugssystemabhängigkeit.",
            "expectedPerformanceEn": "The learner interprets “mass” here as m_rel = E/c², leaves invariant rest mass unchanged, assigns higher energy and greater momentum magnitude to the frame with larger γ, and explains the frame dependence.",
            "understandingFocusDe": "Der Sprachtransfer diagnostiziert die Fehlvorstellung einer physisch anwachsenden invarianten Masse.",
            "understandingFocusEn": "The language transfer diagnoses the misconception of a physically increasing invariant mass."
          }
        ]
      }
    },
    {
      "goalId": "af50bb9a-fd7b-50f5-9698-48c4efe99032",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "functional-understanding",
            "essentialUnderstandingDe": "Ein bipolares Verstärkerbauteil steuert Energie aus der Versorgung durch ein Eingangssignal. Ein geeigneter Arbeitspunkt erlaubt kleine Signaländerungen im aktiven Bereich; Sperren oder Sättigung begrenzen die unverzerrte Ausgangsschwingung.",
            "essentialUnderstandingEn": "A bipolar amplifier device controls energy from its supply through an input signal. A suitable operating point permits small signal variations in the active region; cutoff or saturation limits the undistorted output swing.",
            "observablePerformanceDe": "An der vorgegebenen oder selbst aufgebauten Schaltung verknüpft die lernende Person Eingangssignal, Arbeitspunkt und Kennlinie mit dem Ausgangssignal. Bei einer Emitterschaltung begründet sie gegebenenfalls die Phasenumkehr, ohne sie jeder Verstärkerschaltung zuzuschreiben.",
            "observablePerformanceEn": "In the supplied or self-built circuit, the learner relates the input signal, operating point and characteristic curve to the output signal. For a common-emitter circuit they justify phase inversion where applicable, without attributing it to every amplifier circuit."
          },
          {
            "id": "independent-transfer",
            "essentialUnderstandingDe": "Arbeitspunktlage, Lastkennlinie und Signalhub verändern; aktive Beziehung gilt nicht in Sperre/Sättigung.",
            "essentialUnderstandingEn": "Vary bias, load characteristic and signal swing; the active-region relation does not apply in cutoff/saturation.",
            "observablePerformanceDe": "Bei größerer Eingangsamplitude oder verschobenem Arbeitspunkt prognostiziert die lernende Person anhand der Kennlinien das Abschneiden einer Halbwelle und begründet eine geeignete Korrektur im gegebenen Aufbau.",
            "observablePerformanceEn": "For larger input amplitude or a shifted operating point, the learner uses the curves to predict clipping of a half-wave and justifies a suitable correction in the given setup."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "functional-understanding",
            "independent-transfer"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "physical-condition",
            "textDe": "Arbeitspunktlage, Lastkennlinie und Signalhub verändern; aktive Beziehung gilt nicht in Sperre/Sättigung.",
            "textEn": "Vary bias, load characteristic and signal swing; the active-region relation does not apply in cutoff/saturation."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "fresh-function-case",
            "taskDemandDe": "Analysiere eine neue vorgegebene Emitterschaltung mit Arbeitspunkt und Kennlinientabelle. Sage Ausgangsextrema bei kleinem Eingangssignal voraus und begründe die schaltungsspezifische Phasenumkehr und Energiequelle.",
            "taskDemandEn": "Analyse a fresh supplied common-emitter circuit with a bias point and characteristic table. Predict output extremes for a small input and explain this circuit’s phase inversion and energy source.",
            "expectedPerformanceDe": "Die lernende Person verknüpft Basisansteuerung, Kollektorstrom und Widerstandsspannungsabfall, prüft den aktiven Bereich und schreibt die zusätzliche Signalenergie der Versorgung zu.",
            "expectedPerformanceEn": "The learner connects base drive, collector current and resistor voltage drop, checks the active region and attributes added signal energy to the supply.",
            "understandingFocusDe": "Ein bipolares Verstärkerbauteil steuert Energie aus der Versorgung durch ein Eingangssignal. Ein geeigneter Arbeitspunkt erlaubt kleine Signaländerungen im aktiven Bereich; Sperren oder Sättigung begrenzen die unverzerrte Ausgangsschwingung.",
            "understandingFocusEn": "A bipolar amplifier device controls energy from its supply through an input signal. A suitable operating point permits small signal variations in the active region; cutoff or saturation limits the undistorted output swing."
          },
          {
            "id": "changed-condition-case",
            "taskDemandDe": "Bei gleichem Eingangssignal wird der Arbeitspunkt nahe an die Sättigungsgrenze verschoben. Prognostiziere die neue Ausgangsform und begründe aus den angegebenen Kennlinien eine wirksame Korrektur.",
            "taskDemandEn": "With the same input signal, bias shifts close to saturation. Predict the new output shape and justify an effective correction from the supplied characteristics.",
            "expectedPerformanceDe": "Die lernende Person lokalisiert die zuerst begrenzte Halbwelle, unterscheidet Signalverstärkung von Energieerzeugung und prüft einen verbesserten Arbeitspunkt anhand beider Ausgangsgrenzen.",
            "expectedPerformanceEn": "The learner identifies the half-wave clipped first, distinguishes amplification from energy creation and checks an improved bias against both output limits.",
            "understandingFocusDe": "Arbeitspunktlage, Lastkennlinie und Signalhub verändern; aktive Beziehung gilt nicht in Sperre/Sättigung.",
            "understandingFocusEn": "Vary bias, load characteristic and signal swing; the active-region relation does not apply in cutoff/saturation."
          }
        ]
      }
    },
    {
      "goalId": "4c5c7cb1-f238-52c8-b82c-159c6c299c0e",
      "profile": {
        "archetype": "concept",
        "expectations": [
          {
            "id": "pp-chain",
            "essentialUnderstandingDe": "Die Proton-Proton-Kette bildet insgesamt aus vier Protonen einen Helium-4-Kern; Zwischenschritte, zurückgegebene Protonen und emittierte Teilchen müssen in der Bilanz berücksichtigt werden.",
            "essentialUnderstandingEn": "The proton–proton chain forms a helium-4 nucleus from four protons overall; intermediate steps, returned protons and emitted particles must be included in the balance.",
            "observablePerformanceDe": "Die lernende Person verknüpft gegebene PP-Reaktionen zu einer Nettobilanz und erklärt, warum die Anzahl beteiligter Anfangsprotonen nicht der Zahl dauerhaft verbrauchter Protonen entsprechen muss.",
            "observablePerformanceEn": "The learner combines supplied pp reactions into a net balance and explains why the number of initially participating protons need not equal the number permanently consumed."
          },
          {
            "id": "fusion-energy",
            "essentialUnderstandingDe": "Der gebundene Endzustand hat geringere Ruheenergie; die Differenz erscheint als Energie von Teilchen und Strahlung, einschließlich entweichender Neutrinos.",
            "essentialUnderstandingEn": "The bound final state has lower rest energy; the difference appears as particle and radiation energy, including escaping neutrinos.",
            "observablePerformanceDe": "Die lernende Person erklärt einen gegebenen Massendefekt mit E=Δmc² und unterscheidet Gesamtenergiegewinn von der im Stern deponierten Energie.",
            "observablePerformanceEn": "The learner explains a supplied mass defect through E=Δmc² and distinguishes total released energy from energy deposited in the star."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "pp-chain",
            "fusion-energy"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "net-and-energy",
            "textDe": "Reaktionsbilanz aus Zwischenschritten gegenüber einer Energieangabe mit entweichenden Teilchen.",
            "textEn": "Reaction balance from intermediate steps versus an energy value with escaping particles."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "combine-reactions",
            "taskDemandDe": "Gegeben sind p+p→D+e⁺+ν_e, D+p→³He+γ und ³He+³He→⁴He+2p. Bestimme, wie oft die Schritte für einen ⁴He-Kern stattfinden, und erkläre die Nettobilanz.",
            "taskDemandEn": "Given p+p→D+e⁺+ν_e, D+p→³He+γ and ³He+³He→⁴He+2p, determine how often the steps occur for one ⁴He nucleus and explain the net balance.",
            "expectedPerformanceDe": "Die ersten beiden Schritte erfolgen je zweimal, der dritte einmal. Zwei Protonen werden zurückgegeben; netto werden vier Protonen in ⁴He umgewandelt, dazu entstehen zwei Positronen und zwei Elektron-Neutrinos sowie freiwerdende Energie.",
            "expectedPerformanceEn": "The first two steps each occur twice and the third once. Two protons are returned; net consumption is four protons converted into ⁴He, with two positrons, two electron neutrinos and released energy.",
            "understandingFocusDe": "Zwischenprodukte und Rückgabe erklären die Nettoreaktion, nicht das bloße Zählen aller Pfeile.",
            "understandingFocusEn": "Intermediates and returned particles explain the net reaction, rather than merely counting all arrows."
          },
          {
            "id": "mass-and-escape",
            "taskDemandDe": "Für eine vollständige PP-Bilanz einschließlich Positronannihilation sei Δm=0,0287 u gegeben; 1 u·c²=931,5 MeV. Erkläre den Energiegewinn und prüfe die Aussage, diese Energie müsse vollständig als Sonnenlicht abgegeben werden.",
            "taskDemandEn": "For a complete pp balance including positron annihilation, Δm=0.0287 u is supplied; 1 u·c²=931.5 MeV. Explain the energy release and assess the claim that all this energy must emerge as sunlight.",
            "expectedPerformanceDe": "Der Gesamtgewinn beträgt ungefähr 26,7 MeV pro gebildetem Heliumkern. Er stammt aus verringerter Ruheenergie, nicht aus dem Verschwinden der Nukleonen. Ein Teil wird von Neutrinos fortgetragen; Gesamtgewinn und im Stern verbleibende Energie sind daher nicht identisch.",
            "expectedPerformanceEn": "Total release is approximately 26.7 MeV per helium nucleus formed. It comes from reduced rest energy, not the disappearance of nucleons. Neutrinos carry away some of it, so total release and energy remaining in the star are not identical.",
            "understandingFocusDe": "Massendefekt als Energiequelle und physikalische Bilanzgrenze beim Vergleich mit Sonnenlicht.",
            "understandingFocusEn": "Mass defect as an energy source and the physical accounting boundary when comparing with sunlight."
          }
        ]
      }
    },
    {
      "goalId": "1c430e0a-b63e-5729-8715-a96a5a68740f",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "narrowband-superposition-and-group-velocity",
            "essentialUnderstandingDe": "Ein schmalbandiges Wellenpaket entsteht durch Überlagerung benachbarter Wellenzahlen und Frequenzen zu einer schnellen Trägerstruktur mit langsamer Hüllkurve. Für ein hinreichend schmales Spektrum bewegt sich die Hüllkurve näherungsweise mit der Gruppengeschwindigkeit v_g=dω/dk am zentralen k0; die Phasengeschwindigkeit ω/k beschreibt dagegen die Bewegung einer Trägerphase und muss nicht gleich v_g sein.",
            "essentialUnderstandingEn": "A narrowband wave packet is formed by superposing nearby wavenumbers and frequencies into a rapidly varying carrier and a slowly varying envelope. For a sufficiently narrow spectrum, the envelope moves approximately at group velocity v_g=dω/dk at the central k0; phase velocity ω/k instead describes motion of a carrier phase and need not equal v_g.",
            "observablePerformanceDe": "Die lernende Person identifiziert in neuen Raum-Zeit-Daten Träger und Hüllkurve, bestimmt oder vergleicht deren Geschwindigkeiten mit Achsen und Einheiten und begründet die Gruppengeschwindigkeit aus der lokalen Steigung einer gegebenen Dispersionsrelation.",
            "observablePerformanceEn": "In fresh space-time data, the learner identifies carrier and envelope, determines or compares their velocities with axes and units, and justifies group velocity from the local slope of a supplied dispersion relation."
          },
          {
            "id": "dispersion-changes-envelope-shape-and-width",
            "essentialUnderstandingDe": "In einem nichtdispersiven Medium ist ω proportional zu k, sodass alle Spektralanteile dieselbe Gruppengeschwindigkeit besitzen und ein ideales Paket seine Form behalten kann. Bei gekrümmter Dispersionsrelation bewegen sich Spektralanteile unterschiedlich; ihre relativen Phasen ändern sich und ein zunächst ungechirptes Paket verbreitert oder verformt sich. Bei breitem Spektrum ist eine einzige lokale Gruppengeschwindigkeit nur begrenzt aussagekräftig.",
            "essentialUnderstandingEn": "In a nondispersive medium, ω is proportional to k, so all spectral components have the same group velocity and an ideal packet can retain its shape. With a curved dispersion relation, spectral components move differently; their relative phases change and an initially unchirped packet broadens or deforms. For a broad spectrum, one local group velocity has limited descriptive value.",
            "observablePerformanceDe": "Die lernende Person sagt für neue lineare und gekrümmte ω-k-Beziehungen die Bewegung und Formänderung einer Hüllkurve voraus, erklärt sie aus unterschiedlichen Spektralanteilen und benennt die Schmalbandgrenze der verwendeten Näherung.",
            "observablePerformanceEn": "For fresh linear and curved ω-k relations, the learner predicts envelope motion and shape change, explains them through differing spectral components, and states the narrowband limitation of the approximation used."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "narrowband-superposition-and-group-velocity",
            "dispersion-changes-envelope-shape-and-width"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "dispersion-relation",
            "textDe": "Lineare oder gekrümmte Beziehung zwischen ω und k",
            "textEn": "Linear or curved relationship between ω and k"
          },
          {
            "id": "spectral-width",
            "textDe": "Schmales oder deutlich breiteres Spektrum um k0",
            "textEn": "Narrow or substantially broader spectrum around k0"
          },
          {
            "id": "evidence-representation",
            "textDe": "Folge räumlicher Profile, Raum-Zeit-Diagramm oder Dispersionsdiagramm",
            "textEn": "Sequence of spatial profiles, space-time diagram, or dispersion diagram"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "carrier-envelope-speed-from-data",
            "taskDemandDe": "Eine neue Folge räumlicher Profile zeigt ein schmalbandiges Paket zu drei Zeiten. Verfolge ein Maximum der Hüllkurve und einen Wellenberg der Trägerstruktur, bestimme beide Geschwindigkeiten aus den Achsen und entscheide, ob Phasen- und Gruppengeschwindigkeit übereinstimmen.",
            "taskDemandEn": "A fresh sequence of spatial profiles shows a narrowband packet at three times. Track an envelope maximum and a crest of the carrier, determine both velocities from the axes, and decide whether phase and group velocity agree.",
            "expectedPerformanceDe": "Die lernende Person verwendet jeweils denselben Typ von Merkmal über die Zeit, bestimmt v_g aus der Hüllkurvenwanderung und v_phase aus der Trägerphase mit Einheiten und begründet eine mögliche Differenz, ohne die Hüllkurve als materiellen Körper zu behandeln.",
            "expectedPerformanceEn": "The learner tracks the same type of feature through time, determines v_g from envelope motion and v_phase from carrier phase with units, and explains any difference without treating the envelope as a material body.",
            "understandingFocusDe": "Der Grundfall prüft die operative Trennung von Hüllkurven- und Trägerbewegung an Daten.",
            "understandingFocusEn": "The direct case tests operational separation of envelope and carrier motion from data."
          },
          {
            "id": "linear-versus-curved-dispersion-transfer",
            "taskDemandDe": "Dasselbe zunächst ungechirpte schmalbandige Paket breitet sich in Medium A mit ω=ck und in Medium B mit ω=ck+βk² aus. Bestimme für k0 die jeweilige Gruppengeschwindigkeit, sage die Entwicklung der Paketbreite voraus und beurteile, wie sich die Aussage für ein deutlich breiteres Spektrum ändert.",
            "taskDemandEn": "The same initially unchirped narrowband packet propagates in medium A with ω=ck and in medium B with ω=ck+βk². Determine the group velocity at k0 for each, predict the evolution of packet width, and assess how the conclusion changes for a substantially broader spectrum.",
            "expectedPerformanceDe": "Die lernende Person erhält v_g=c in A und v_g=c+2βk0 in B, erwartet im ideal linearen Fall Formerhalt und bei β≠0 unterschiedliche Geschwindigkeiten der Spektralanteile mit Verbreiterung oder Verformung und begrenzt die Ein-Gruppengeschwindigkeits-Näherung beim breiten Spektrum.",
            "expectedPerformanceEn": "The learner obtains v_g=c in A and v_g=c+2βk0 in B, predicts shape preservation in the ideal linear case and different component velocities with broadening or deformation when β≠0, and limits the single-group-velocity approximation for the broad spectrum.",
            "understandingFocusDe": "Der Transfer verbindet Ableitung der Dispersionsrelation, Paketentwicklung und Schmalbandgrenze in einem neuen Modellregime.",
            "understandingFocusEn": "The transfer connects differentiation of the dispersion relation, packet evolution, and the narrowband limit in a new model regime."
          }
        ]
      }
    },
    {
      "goalId": "c5413852-abae-566b-b435-f9939209ca63",
      "profile": {
        "archetype": "data",
        "expectations": [
          {
            "id": "localized-stochastic-events",
            "essentialUnderstandingDe": "Jedes einzelne Photon wird als lokalisiertes Nachweisereignis an genau einem Detektorort registriert; der Ort des nächsten Ereignisses ist nicht deterministisch aus einer klassischen Bahn vorhersagbar.",
            "essentialUnderstandingEn": "Each individual photon is registered as a localized detection event at exactly one detector position; the location of the next event cannot be predicted deterministically from a classical trajectory.",
            "observablePerformanceDe": "Die lernende Person beschreibt eine neue Folge einzelner Detektortreffer ereignisweise, sagt nur Wahrscheinlichkeiten statt eines sicheren nächsten Ortes voraus und weist eine Zeichnung zurück, die aus einem Treffer eine durchlaufene klassische Bahn rekonstruiert.",
            "observablePerformanceEn": "The learner describes a new sequence of individual detector hits event by event, predicts probabilities rather than a certain next location, and rejects a drawing that reconstructs a traversed classical path from one hit."
          },
          {
            "id": "ensemble-pattern-emergence",
            "essentialUnderstandingDe": "Erst aus vielen unabhängigen Einzelereignissen stabilisieren sich relative Häufigkeiten über dem Ort. Deren räumliche Maxima und Minima machen eine Interferenz-Wahrscheinlichkeitsverteilung sichtbar, obwohl kein einzelner Treffer selbst ein Interferenzmuster bildet.",
            "essentialUnderstandingEn": "Only from many independent individual events do spatial relative frequencies stabilize. Their spatial maxima and minima reveal an interference probability distribution even though no single hit itself forms an interference pattern.",
            "observablePerformanceDe": "Die lernende Person verarbeitet frische Detektorzählungen für aufeinanderfolgende Stichprobengrößen zu relativen Häufigkeiten, beschreibt die zunehmende Stabilisierung des Musters und trennt statistische Schwankungen von dessen systematischer räumlicher Struktur.",
            "observablePerformanceEn": "The learner processes fresh detector counts for successive sample sizes into relative frequencies, describes the increasing stabilization of the pattern, and distinguishes statistical fluctuations from its systematic spatial structure."
          },
          {
            "id": "apparatus-dependent-distribution",
            "essentialUnderstandingDe": "Die Wahrscheinlichkeitsverteilung hängt von der gesamten experimentellen Anordnung ab. Wird beispielsweise eine Öffnung blockiert, ändert sich die Verteilung der späteren Ereignisse; dies rechtfertigt dennoch keine nachträgliche klassische Wegzuweisung für ein einzelnes bereits registriertes Photon.",
            "essentialUnderstandingEn": "The probability distribution depends on the complete experimental arrangement. For example, blocking one opening changes the distribution of later events; this still does not justify retrospectively assigning a classical path to an individual photon already detected.",
            "observablePerformanceDe": "Die lernende Person vergleicht Zählverteilungen zweier geänderter Anordnungen, sagt eine Musteränderung voraus und begründet sie auf Ensembleebene, ohne zu behaupten, ein einzelner Detektionspunkt verrate den genommenen Weg.",
            "observablePerformanceEn": "The learner compares count distributions from two changed arrangements, predicts a pattern change, and justifies it at the ensemble level without claiming that an individual detection point reveals the path taken."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "localized-stochastic-events",
            "ensemble-pattern-emergence",
            "apparatus-dependent-distribution"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "event-count",
            "textDe": "Wenige, mittlere oder sehr viele lokalisierte Einzelereignisse",
            "textEn": "Few, intermediate, or very many localized individual events"
          },
          {
            "id": "aperture-configuration",
            "textDe": "Beide Öffnungen aktiv oder eine Öffnung blockiert",
            "textEn": "Both openings active or one opening blocked"
          },
          {
            "id": "data-representation",
            "textDe": "Rohfolge von Treffern, Orts-Histogramm oder normierte relative Häufigkeiten",
            "textEn": "Raw sequence of hits, spatial histogram, or normalized relative frequencies"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "successive-count-batches",
            "taskDemandDe": "Für dieselbe Doppelöffnungsanordnung werden Detektorpositionen nach 20, 500 und 20 000 einzelnen Photonen bereitgestellt. Die Daten sind in relative Orts-Häufigkeiten zu überführen und hinsichtlich Einzelereignis, Schwankung und Interferenzmuster zu deuten.",
            "taskDemandEn": "Detector positions after 20, 500, and 20,000 individual photons are supplied for the same double-aperture arrangement. The data must be converted into relative spatial frequencies and interpreted in terms of individual events, fluctuations, and the interference pattern.",
            "expectedPerformanceDe": "Die lernende Person behandelt jeden Treffer als lokal, erwartet bei 20 Ereignissen starke Schwankungen und zeigt, wie sich bei größeren Zahlen stabile Maxima und Minima der relativen Häufigkeit herausbilden, ohne einem Treffer zwei Detektororte zuzuschreiben.",
            "expectedPerformanceEn": "The learner treats every hit as local, expects strong fluctuations with 20 events, and shows how stable maxima and minima of relative frequency emerge at larger counts without assigning two detector positions to one event.",
            "understandingFocusDe": "Die Stichprobengrößen trennen stochastisches Einzelereignis und Ensembleverteilung.",
            "understandingFocusEn": "The sample sizes separate the stochastic individual event from the ensemble distribution."
          },
          {
            "id": "blocked-aperture-transfer",
            "taskDemandDe": "Nach einer Referenzmessung mit zwei offenen Öffnungen wird eine Öffnung blockiert und eine neue, gleich große Ereignisstichprobe aufgenommen. Die veränderte Häufigkeitsverteilung und die Aussage „nun weiß man rückwirkend, welchen Weg jedes frühere Photon nahm“ sind zu beurteilen.",
            "taskDemandEn": "After a reference measurement with two open apertures, one aperture is blocked and a new sample with the same event count is recorded. The changed frequency distribution and the claim “we now know retrospectively which path every earlier photon took” must be evaluated.",
            "expectedPerformanceDe": "Die lernende Person erwartet eine andere Ensembleverteilung ohne das frühere Zweifach-Interferenzmuster, führt die Änderung auf die neue Anordnung zurück und verwirft die rückwirkende klassische Bahnzuweisung für einzelne frühere Treffer.",
            "expectedPerformanceEn": "The learner expects a different ensemble distribution without the previous two-aperture interference pattern, attributes the change to the new arrangement, and rejects retrospective classical path assignment for individual earlier hits.",
            "understandingFocusDe": "Der Anordnungswechsel diagnostiziert die Verwechslung einer Wahrscheinlichkeitsverteilung mit verborgenen klassischen Bahnen.",
            "understandingFocusEn": "The apparatus change diagnoses confusion of a probability distribution with hidden classical paths."
          }
        ]
      }
    },
    {
      "goalId": "e6a50c74-c922-508c-aa27-07bac2566955",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "dose-quantity-selection",
            "essentialUnderstandingDe": "D=E_abs/m ist Energiedosis in Gy; H_T=Σ_R w_R D_T,R ist gewichtete Organdosis, E_eff=Σ_T w_T H_T effektive Dosis, beide in Sv. Die Gewichtungen und betroffenen Gewebe müssen angegeben sein.",
            "essentialUnderstandingEn": "D=E_abs/m is absorbed dose in Gy; H_T=Σ_R w_R D_T,R is equivalent tissue dose and E_eff=Σ_T w_T H_T effective dose, both in Sv. Weighting factors and affected tissues must be specified.",
            "observablePerformanceDe": "Wählt die passende Größe, führt die gewichtete Summe mit Einheiten aus und erklärt, weshalb gleiche Einheit bei H und E keine gleiche Aussage bedeutet.",
            "observablePerformanceEn": "Chooses the appropriate quantity, evaluates weighted sums with units and explains why the same unit for H and E does not imply the same meaning."
          },
          {
            "id": "comparable-reduction",
            "essentialUnderstandingDe": "Eine Dosisreduktion bezieht sich auf gleiche Dosisgröße und sonst vergleichbare Exposition. Effektive Dosis ist eine modellgewichtete Strahlenschutzgröße, keine exakte individuelle Gesundheitsschadensprognose.",
            "essentialUnderstandingEn": "Dose reduction compares the same dose quantity under otherwise comparable exposure. Effective dose is a model-weighted protection quantity, not an exact individual health-damage prediction.",
            "observablePerformanceDe": "Quantifiziert absolute/relative Abschirmwirkung, prüft Vergleichsbedingungen und verweigert eine unbegründete Sicherheitsgarantie.",
            "observablePerformanceEn": "Quantifies absolute/fractional shielding reduction, checks comparability and rejects unsupported safety guarantees."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "dose-quantity-selection",
            "comparable-reduction"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "weighting",
            "textDe": "Reine Energieaufnahme mit unterschiedlich gewichteten Strahlungsarten und Geweben vergleichen.",
            "textEn": "Compare energy absorption with different radiation and tissue weightings."
          },
          {
            "id": "exposure",
            "textDe": "Gleiche Bedingungen von veränderter Expositionsdauer trennen.",
            "textEn": "Distinguish equal conditions from changed exposure duration."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "three-dose-levels",
            "taskDemandDe": "Reine Modellrechnung, kein Expositionsversuch: Gewebe A erhält 2 µGy Photonen (w_R=1) und 0,5 µGy einer Strahlungsart mit vorgegebenem w_R=20; Gewebe B erhält nur 4 µGy Photonen. Gegeben sind w_T,A=0,2 und w_T,B=0,1; alle anderen Gewebedosen sind null. Bestimme H_A, H_B und E_eff. Welche Größe beschreibt die ungewichtete Energieaufnahme pro kg?",
            "taskDemandEn": "Model calculation only, not an exposure experiment: tissue A receives 2 µGy photons (w_R=1) and 0.5 µGy of radiation assigned w_R=20; tissue B receives only 4 µGy photons. Given w_T,A=0.2, w_T,B=0.1, all other tissue doses zero. Find H_A, H_B and E_eff. Which quantity is unweighted absorbed energy per kg?",
            "expectedPerformanceDe": "H_A=12 µSv, H_B=4 µSv; E_eff=0,2·12+0,1·4=2,8 µSv. Ungewichtete Energiedosis in A ist 2,5 µGy, in B 4 µGy. Benennt die gegebenen Modellgewichte, keine freie Gleichsetzung Gy=Sv für alle Strahlung.",
            "expectedPerformanceEn": "H_A=12 µSv, H_B=4 µSv; E_eff=0.2·12+0.1·4=2.8 µSv. Unweighted absorbed doses are 2.5 µGy in A and 4 µGy in B. States supplied model weights; no blanket Gy=Sv equivalence.",
            "understandingFocusDe": "Fragestellung bestimmt die Dosisgröße und Gewichtung.",
            "understandingFocusEn": "The question determines dose quantity and weighting."
          },
          {
            "id": "shield-and-time",
            "taskDemandDe": "Bei gleichem Ort, Spektrum und 10 min Exposition sinkt eine gemessene Energiedosis mit Abschirmung von 8 auf 2 µGy. Berechne absolute und relative Reduktion. Ein zweiter Versuch misst ohne Abschirmung 8 µGy in 10 min, mit Abschirmung 2 µGy in 5 min; bei konstanter Dosisleistung: Welche Reduktion ist nun auf gleiche Zeit bezogen belegt? Beurteile „75 % weniger bedeutet sicher unschädlich“.",
            "taskDemandEn": "At equal location, spectrum and 10 min exposure, shielding reduces absorbed dose from 8 to 2 µGy. Find absolute/fractional reduction. Another test has 8 µGy without shielding in 10 min and 2 µGy with shielding in 5 min; assuming constant dose rate, what equal-time reduction is supported? Assess “75% less means certainly harmless.”",
            "expectedPerformanceDe": "Erster Vergleich: 6 µGy weniger, 75 % des Anfangswerts. Zweiter Vergleich: mit Abschirmung 4 µGy pro 10 min, also 50 % weniger bei gleicher Dauer. Keine garantierte Unschädlichkeit oder individuelle Risikozahl folgt daraus; Modell und Vergleichsbedingungen bleiben nötig.",
            "expectedPerformanceEn": "First comparison: 6 µGy less, 75% of the initial value. Second: shielding gives 4 µGy per 10 min, hence 50% less for equal duration. Neither guaranteed harmlessness nor an individual risk number follows; model and comparison conditions remain necessary.",
            "understandingFocusDe": "Vergleich fair normieren, Schutzwirkung nicht zur Garantie überdehnen.",
            "understandingFocusEn": "Normalise comparisons fairly without turning reduction into a guarantee."
          }
        ]
      }
    },
    {
      "goalId": "2fab2e3a-1558-5e67-aed0-15fc51c737cd",
      "profile": {
        "archetype": "data",
        "expectations": [
          {
            "id": "signal-and-inference",
            "essentialUnderstandingDe": "Beschleunigerexperimente prüfen Teilchenmodelle anhand registrierter Wechselwirkungsprodukte und statistischer Vergleiche; ein Modellbefund ist nicht unmittelbar ein gesehenes Teilchen.",
            "essentialUnderstandingEn": "Accelerator experiments test particle models through recorded interaction products and statistical comparisons; a model inference is not a particle directly seen.",
            "observablePerformanceDe": "Die lernende Person erläutert an frischen Ereignisdaten Forschungsfrage, Messprinzip, Untergrundvergleich und begrenzte Aussagekraft einschließlich Unsicherheit.",
            "observablePerformanceEn": "The learner explains the research question, measurement principle, background comparison and limited inferential strength, including uncertainty, using fresh event data."
          },
          {
            "id": "criteria-based-evaluation",
            "essentialUnderstandingDe": "Erkenntnisreichweite, technische Grenzen und Aufwand sind verschiedene Bewertungsaspekte; Messbefunde bestimmen die Gewichtung gesellschaftlicher Kriterien nicht allein.",
            "essentialUnderstandingEn": "Reach of discovery, technical limits and resource demands are different evaluation aspects; measurements alone do not determine the weighting of societal criteria.",
            "observablePerformanceDe": "Die lernende Person begründet ein bedingtes Urteil über eine Anlage, trennt Belege von Kriterien und erklärt, welche zusätzlichen Daten ihr Urteil verändern würden.",
            "observablePerformanceEn": "The learner justifies a conditional judgment about a facility, separates evidence from criteria and explains what additional data would change the judgment."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "signal-and-inference",
            "criteria-based-evaluation"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "research-outcome",
            "textDe": "Kandidatensignal gegenüber Nullbefund; Untergrund und Messgenauigkeit ändern die Schlussfolgerung.",
            "textEn": "Candidate signal versus null result; background and measurement precision change the conclusion."
          },
          {
            "id": "facility-tradeoff",
            "textDe": "Präzision und Energiebereich werden bei verschiedenen Aufwandsgrenzen verglichen.",
            "textEn": "Precision and energy reach are compared under different resource constraints."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "candidate-peak",
            "taskDemandDe": "Ein ausdrücklich hypothetisches Kollisionsdossier nennt 120 Ereignisse in einem Energiefenster und 100 ± 15 erwartete Untergrundereignisse; die Unsicherheit der Differenz ist näherungsweise √(120+15²). Erläutere Suchziel, Detektormethode und vertretbare Schlussfolgerung. Eine leistungsfähigere Anlage könnte mehr Daten liefern, kostet aber mehr Energie und Mittel.",
            "taskDemandEn": "An explicitly hypothetical collision dossier gives 120 events in an energy window and 100 ± 15 expected background events; the uncertainty of the difference is approximately √(120+15²). Explain the search aim, detector method and defensible conclusion. A more capable facility could yield more data but requires more energy and funding.",
            "expectedPerformanceDe": "Ermittelt einen Überschuss von 20 bei etwa 18,6 Ereignissen Unsicherheit, also nur etwa 1,1 Unsicherheitseinheiten; erklärt Rekonstruktion aus Detektorsignalen statt direkter Teilchenansicht. Begründet zusätzlichen Datenbedarf und wägt Erkenntnischance gegen explizit gewichteten Aufwand ab, ohne Entdeckung zu behaupten.",
            "expectedPerformanceEn": "Finds an excess of 20 with uncertainty about 18.6 events, only about 1.1 uncertainty units; explains reconstruction from detector signals rather than direct viewing of particles. Justifies the need for more data and weighs discovery potential against explicitly weighted resource demands without claiming a discovery.",
            "understandingFocusDe": "Indirekte Evidenz und statistisch begrenzte Entdeckungschance tragen ein bedingtes Forschungsurteil.",
            "understandingFocusEn": "Indirect evidence and statistically limited discovery potential support a conditional research judgment."
          },
          {
            "id": "precision-null-result",
            "taskDemandDe": "Ein zweites hypothetisches Dossier gibt ein gemessenes dimensionsloses Zerfallsverhältnis 1,02 ± 0,04 und eine Modellvorhersage 1,00 an. Vergleiche eine Präzisionsanlage, die die Unsicherheit halbieren könnte, mit einer Anlage für neue, höhere Kollisionsenergien; welche Frage prüft jede, und was rechtfertigt der Nullbefund?",
            "taskDemandEn": "A second hypothetical dossier gives a measured dimensionless decay ratio of 1.02 ± 0.04 and a model prediction of 1.00. Compare a precision facility that might halve the uncertainty with a facility accessing new, higher collision energies: what question does each test, and what does the null result justify?",
            "expectedPerformanceDe": "Bestimmt eine Abweichung von 0,02 bzw. 0,5 Unsicherheitseinheiten und erklärt Verträglichkeit mit dem Modell statt dessen endgültiger Bestätigung. Ordnet Präzisionsprüfung und Erschließung neuer Energiebereiche verschiedenen Suchmethoden zu; formuliert ein transparent bedingtes Urteil und benennt weiterhin unzugängliche Bereiche.",
            "expectedPerformanceEn": "Determines a difference of 0.02 or 0.5 uncertainty units and explains compatibility with the model rather than its final confirmation. Relates precision testing and access to new energies to different search methods; gives a transparently conditional judgment and identifies still inaccessible regimes.",
            "understandingFocusDe": "Auch ein Nullbefund begrenzt Modelle nur im untersuchten Mess- und Energiebereich.",
            "understandingFocusEn": "Even a null result constrains models only within the measured and accessible energy regime."
          }
        ]
      }
    },
    {
      "goalId": "aa0fa5fb-7bfb-5f9f-a606-3f7187cfb745",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "redshift-model",
            "essentialUnderstandingDe": "Für dieselbe identifizierte Spektrallinie ist z=(λ_beob−λ_em)/λ_em dimensionslos; im vorgegebenen Expansionsmodell beschreibt dies eine Wellenlängenstreckung.",
            "essentialUnderstandingEn": "For the same identified spectral line, z=(λ_obs−λ_em)/λ_em is dimensionless; in the supplied expansion model it describes wavelength stretching.",
            "observablePerformanceDe": "Die lernende Person berechnet z aus neuen Spektraldaten, prüft Vorzeichen und Einheiten und verbindet das Ergebnis mit der im Fall vorgegebenen Expansion.",
            "observablePerformanceEn": "The learner calculates z from fresh spectral data, checks sign and units and relates the result to the expansion specified in the case."
          },
          {
            "id": "approximation",
            "essentialUnderstandingDe": "Die Näherung z≈H₀d/c gilt nur bei kleinen kosmologischen Rotverschiebungen und passenden Idealannahmen; 1+z=a_heute/a_Emission ist eine andere vorgegebene Modellbeziehung.",
            "essentialUnderstandingEn": "The approximation z≈H₀d/c applies only at small cosmological redshift under suitable idealizations; 1+z=a_today/a_emission is a different supplied model relationship.",
            "observablePerformanceDe": "Die lernende Person wählt zwischen den vorgegebenen Beziehungen, gewinnt eine Vorhersage und benennt, welche Entfernungsaussage bei großem z nicht aus der linearen Näherung folgt.",
            "observablePerformanceEn": "The learner selects between supplied relationships, obtains a prediction and states which distance claim at large z does not follow from the linear approximation."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "redshift-model",
            "approximation"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "model-regime",
            "textDe": "Kleine Rotverschiebung mit linearem Entfernungsmodell gegenüber großer Rotverschiebung mit Skalenfaktormodell.",
            "textEn": "Small redshift with a linear distance model versus large redshift with a scale-factor model."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "small-redshift",
            "taskDemandDe": "Eine sicher identifizierte Linie mit Ruhewellenlänge 500 nm erscheint bei 510 nm. Verwende für diesen idealisierten kosmologischen Fall z≈H₀d/c mit H₀=70 km/s/Mpc und c=300000 km/s; Pekuliarbewegung sei vernachlässigbar. Bestimme z und d und begründe die Näherung.",
            "taskDemandEn": "A securely identified line with rest wavelength 500 nm appears at 510 nm. For this idealized cosmological case use z≈H₀d/c with H₀=70 km/s/Mpc and c=300000 km/s; peculiar motion is negligible. Find z and d and justify the approximation.",
            "expectedPerformanceDe": "z=10/500=0,02 und d≈300000·0,02/70 Mpc≈85,7 Mpc. z ist klein und einheitenlos; die positive Verschiebung passt im gegebenen Modell zur Expansion. Die Entfernung ist modellabhängig, nicht direkt im Spektrum abgelesen.",
            "expectedPerformanceEn": "z=10/500=0.02 and d≈300000·0.02/70 Mpc≈85.7 Mpc. z is small and dimensionless; the positive shift fits expansion in the supplied model. Distance is model-dependent, not read directly from the spectrum.",
            "understandingFocusDe": "Messgröße, daraus berechnete Rotverschiebung und modellabhängige Entfernung werden getrennt.",
            "understandingFocusEn": "The measured quantity, calculated redshift and model-dependent distance are distinguished."
          },
          {
            "id": "large-redshift",
            "taskDemandDe": "Eine Linie von 400 nm wird bei 800 nm beobachtet. Gegeben ist 1+z=a_heute/a_Emission. Bestimme das Verhältnis der Skalenfaktoren und prüfe, ob d=cz/H₀ aus der Kleine-z-Näherung hier eine gerechtfertigte Entfernung liefert.",
            "taskDemandEn": "A 400 nm line is observed at 800 nm. Given 1+z=a_today/a_emission, determine the scale-factor ratio and assess whether d=cz/H₀ from the small-z approximation gives a justified distance here.",
            "expectedPerformanceDe": "z=1 und a_heute/a_Emission=2. Die Wellenlänge hat sich im gegebenen Expansionsmodell verdoppelt. z=1 ist nicht klein; eine Entfernung erfordert ein dafür geeignetes Modell, nicht die unkritische lineare Formel.",
            "expectedPerformanceEn": "z=1 and a_today/a_emission=2. The wavelength has doubled in the supplied expansion model. z=1 is not small; distance requires an appropriate model, not uncritical use of the linear formula.",
            "understandingFocusDe": "Eine sinnvolle Modellrechnung kann zugleich eine andere nicht gedeckte Schlussfolgerung ausschließen.",
            "understandingFocusEn": "A valid model calculation can simultaneously rule out another unsupported inference."
          }
        ]
      }
    },
    {
      "goalId": "db6b8de4-21e0-58e8-a347-2ae39f538f92",
      "profile": {
        "archetype": "data",
        "expectations": [
          {
            "id": "inferred-distance",
            "essentialUnderstandingDe": "Entfernung wird aus Beobachtungsdaten mit einer geeigneten Beziehung erschlossen; beobachteter Fluss und intrinsische Leuchtkraft sind verschiedene Größen.",
            "essentialUnderstandingEn": "Distance is inferred from observational data using an appropriate relationship; observed flux and intrinsic luminosity are different quantities.",
            "observablePerformanceDe": "Die lernende Person verarbeitet neue Parallaxen- oder Flussdaten, begründet die verwendete Beziehung und bestimmt Entfernung oder relative Leuchtkraft mit passenden Einheiten.",
            "observablePerformanceEn": "The learner processes fresh parallax or flux data, justifies the relationship used and determines distance or relative luminosity with suitable units."
          },
          {
            "id": "uncertainty-degeneracy",
            "essentialUnderstandingDe": "Messunsicherheit begrenzt die Schätzung; Fluss allein legt Entfernung und Leuchtkraft nicht gleichzeitig eindeutig fest.",
            "essentialUnderstandingEn": "Measurement uncertainty limits the estimate; flux alone does not uniquely determine both distance and luminosity.",
            "observablePerformanceDe": "Die lernende Person gibt eine begründete Spannweite oder relative Schätzung an und benennt die Zusatzinformation, die eine mehrdeutige Flussmessung auflöst.",
            "observablePerformanceEn": "The learner gives a justified interval or relative estimate and identifies the additional information needed to resolve an ambiguous flux measurement."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "inferred-distance",
            "uncertainty-degeneracy"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "known-information",
            "textDe": "Geometrische Parallaxe mit Unsicherheit gegenüber kalibriertem oder unkalibriertem Leuchtkraft-Fluss-Zusammenhang.",
            "textEn": "Geometric parallax with uncertainty versus calibrated or uncalibrated luminosity–flux relationships."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "parallax-interval",
            "taskDemandDe": "Die jährliche Parallaxe eines nahen Sterns ist p=0,050±0,005 Bogensekunden. Verwende d in pc =1/p in Bogensekunden. Schätze Entfernung und Spannweite und erkläre den Unterschied zwischen gemessener und erschlossener Größe.",
            "taskDemandEn": "A nearby star has annual parallax p=0.050±0.005 arcseconds. Use d in pc =1/p in arcseconds. Estimate distance and an interval and explain the distinction between measured and inferred quantities.",
            "expectedPerformanceDe": "Die zentrale Schätzung ist 20 pc. p=0,055 bzw. 0,045 ergibt ungefähr 18,2 bis 22,2 pc; die größere Parallaxe bedeutet kleinere Entfernung. Der Winkel ist beobachtet, die Entfernung daraus geometrisch erschlossen.",
            "expectedPerformanceEn": "The central estimate is 20 pc. p=0.055 and 0.045 give approximately 18.2 to 22.2 pc; larger parallax means smaller distance. The angle is observed and distance inferred geometrically from it.",
            "understandingFocusDe": "Unsicherheit wird durch die nichtlineare Beziehung in eine asymmetrische Entfernungsspanne übersetzt.",
            "understandingFocusEn": "Uncertainty is translated through the nonlinear relationship into an asymmetric distance interval."
          },
          {
            "id": "flux-calibration",
            "taskDemandDe": "Ein Referenzstern steht in 10 pc Entfernung. Ein gleich leuchtkräftiger Stern zeigt nur ein Neuntel seines Flusses. Schätze dessen Entfernung. Ein weiterer Stern hat denselben Fluss wie die Referenz, aber unabhängig bekannte 20 pc Entfernung. Vergleiche seine Leuchtkraft; vernachlässige Absorption.",
            "taskDemandEn": "A reference star is 10 pc away. A star of equal luminosity has only one ninth of its flux. Estimate its distance. Another star has the same flux as the reference but an independently known distance of 20 pc. Compare its luminosity; neglect absorption.",
            "expectedPerformanceDe": "Aus F=L/(4πd²) folgen 30 pc für den gleich leuchtkräftigen Stern und vierfache Leuchtkraft für den Stern bei 20 pc mit gleichem Fluss. Ohne bekannte Leuchtkraft oder unabhängige Entfernung bliebe die Zuordnung mehrdeutig.",
            "expectedPerformanceEn": "F=L/(4πd²) gives 30 pc for the equal-luminosity star and four times the luminosity for the star at 20 pc with equal flux. Without known luminosity or independent distance, the inference would remain ambiguous.",
            "understandingFocusDe": "Kalibrierung und physikalische Entartung zwischen intrinsischer Strahlung und geometrischer Verdünnung.",
            "understandingFocusEn": "Calibration and the physical degeneracy between intrinsic radiation and geometric dilution."
          }
        ]
      }
    },
    {
      "goalId": "7fe6f8a1-5580-4e37-bf8e-9772964a6b0a",
      "profile": {
        "archetype": "representation",
        "expectations": [
          {
            "id": "velocity-decomposes-relative-to-field",
            "essentialUnderstandingDe": "Die Geschwindigkeit wird relativ zu B in v_parallel und v_perp zerlegt. Nur v_perp erfährt eine magnetische Krümmung; v_parallel bleibt im homogenen Feld unverändert.",
            "essentialUnderstandingEn": "Velocity is decomposed relative to B into v_parallel and v_perp. Only v_perp undergoes magnetic curvature; v_parallel remains unchanged in a uniform field.",
            "observablePerformanceDe": "Die lernende Person konstruiert aus einem gegebenen Geschwindigkeitsvektor beide Komponenten mit klarer Feldrichtung und erklärt, welche Komponente welche Bahninformation trägt.",
            "observablePerformanceEn": "From a given velocity vector, the learner constructs both components with a clear field direction and explains which component carries which trajectory information."
          },
          {
            "id": "components-map-to-straight-circular-or-helical-path",
            "essentialUnderstandingDe": "Reine Parallelbewegung ergibt eine Gerade, reine Senkrechtbewegung einen Kreis und ihre Überlagerung eine Schraubenbahn. Radius und Vorschub werden durch unterschiedliche Komponenten bestimmt.",
            "essentialUnderstandingEn": "Pure parallel motion gives a straight line, pure perpendicular motion a circle, and their superposition a helix. Radius and axial advance are determined by different components.",
            "observablePerformanceDe": "Die lernende Person übersetzt Komponentenwerte in eine räumlich konsistente Bahn und erläutert Radius, Achsenrichtung und Steigung, ohne Feldlinien als materielle Führungsbahnen zu behandeln.",
            "observablePerformanceEn": "The learner translates component values into a spatially consistent path and explains radius, axis direction, and pitch without treating field lines as material guide tracks."
          },
          {
            "id": "sign-and-reversal-change-selected-features",
            "essentialUnderstandingDe": "Ladungsvorzeichen oder Feldumkehr kehren den Umlaufsinn um; eine Umkehr von v_parallel ändert die Vorschubrichtung. Geschwindigkeitsbetrag und magnetisch unveränderte Energie bleiben im idealisierten Feld erhalten.",
            "essentialUnderstandingEn": "Charge sign or field reversal reverses the sense of rotation; reversing v_parallel changes the direction of axial advance. Speed magnitude and magnetically unchanged energy remain conserved in the idealized field.",
            "observablePerformanceDe": "Für einen neuen Vorzeichen-, Feld- oder Winkelwechsel sagt die lernende Person getrennt voraus, welche Bahneigenschaften wechseln und welche erhalten bleiben, und konstruiert die neue Bahn.",
            "observablePerformanceEn": "For a fresh change of sign, field, or angle, the learner separately predicts which trajectory features change and which remain, and constructs the new path."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "velocity-decomposes-relative-to-field",
            "components-map-to-straight-circular-or-helical-path",
            "sign-and-reversal-change-selected-features"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "entry-angle",
            "textDe": "0°, 90° oder ein schräger Eintrittswinkel",
            "textEn": "0°, 90°, or an oblique entry angle"
          },
          {
            "id": "charge-and-field-sign",
            "textDe": "Positive oder negative Ladung und normale oder umgekehrte Feldrichtung",
            "textEn": "Positive or negative charge and normal or reversed field direction"
          },
          {
            "id": "representation-form",
            "textDe": "Vektorangaben, perspektivische Skizze oder Komponenten-Zeitbeschreibung",
            "textEn": "Vector data, perspective sketch, or component-based time description"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "vector-to-helix-construction",
            "taskDemandDe": "B zeigt in positive z-Richtung; für ein positives Teilchen sind v_z und eine v_x-Komponente angegeben. Zerlege v, konstruiere die Schraubenbahn und erkläre Radius, Vorschub und Umlaufsinn.",
            "taskDemandEn": "B points in the positive z direction; v_z and a v_x component are given for a positive particle. Decompose v, construct the helix, and explain radius, axial advance, and sense of rotation.",
            "expectedPerformanceDe": "Die lernende Person ordnet v_z dem unveränderten Vorschub und v_x der Kreisbewegung zu, zeichnet eine konsistente Helix und bestimmt den Umlaufsinn aus q(v×B).",
            "expectedPerformanceEn": "The learner assigns v_z to unchanged axial advance and v_x to circular motion, draws a consistent helix, and determines the sense of rotation from q(v×B).",
            "understandingFocusDe": "Der Fall prüft die eigenständige Übersetzung von Vektoren in eine räumliche Bahn ohne Bildvorlage.",
            "understandingFocusEn": "The case tests independent translation from vectors to a spatial path without a supplied image."
          },
          {
            "id": "angle-and-sign-transfer",
            "taskDemandDe": "Eine negative Ladung tritt zunächst senkrecht und danach unter kleinerem Winkel zu B ein; anschließend wird B umgekehrt. Vergleiche Bahnform, Radiusanteil, Vorschub und Umlaufsinn in allen drei Situationen.",
            "taskDemandEn": "A negative charge enters first perpendicularly and then at a smaller angle to B; B is then reversed. Compare trajectory form, radial component, axial advance, and sense of rotation in all three situations.",
            "expectedPerformanceDe": "Die lernende Person wechselt vom Kreis zur Schraube, verbindet den kleineren senkrechten Anteil mit kleinerem Radius, hält die parallele Bewegung getrennt und kehrt bei Feldumkehr den Umlaufsinn korrekt um.",
            "expectedPerformanceEn": "The learner changes from circle to helix, links the smaller perpendicular component to a smaller radius, keeps the parallel motion separate, and correctly reverses the sense of rotation when the field is reversed.",
            "understandingFocusDe": "Der Transfer prüft selektive Änderungen statt einer pauschalen Umkehr der gesamten Bewegung.",
            "understandingFocusEn": "The transfer tests selective changes rather than blanket reversal of the entire motion."
          }
        ]
      }
    },
    {
      "goalId": "25998fed-ea4d-4c3e-b606-e965b5d7f290",
      "profile": {
        "archetype": "concept",
        "expectations": [
          {
            "id": "closed-system-algebraic-total-is-conserved",
            "essentialUnderstandingDe": "In einem abgeschlossenen System bleibt die algebraische Gesamtladung erhalten: Die Summe aller positiven und negativen Ladungsbeiträge ist nach einer Wechselwirkung dieselbe wie vorher. Erhaltung bezieht sich auf das abgegrenzte Gesamtsystem, nicht darauf, dass jeder einzelne Körper seine Ladung behält.",
            "essentialUnderstandingEn": "In a closed system, total algebraic charge is conserved: the sum of all positive and negative charge contributions is the same after an interaction as before. Conservation applies to the bounded overall system, not to each individual body retaining its charge.",
            "observablePerformanceDe": "Die lernende Person legt für einen unbekannten Umverteilungsfall die Systemgrenze fest, bildet die vorzeichenrichtige Gesamtladung vor und nach dem Vorgang und bestimmt oder kontrolliert eine fehlende Teilladung aus der Erhaltungsbilanz.",
            "observablePerformanceEn": "For an unfamiliar redistribution case, the learner specifies the system boundary, forms the signed total charge before and after the process, and determines or checks a missing component charge from the conservation balance."
          },
          {
            "id": "local-changes-are-transfers-across-subsystem-boundaries",
            "essentialUnderstandingDe": "Wenn ein Teilkörper Ladung gewinnt oder verliert, wird Ladung über dessen Teilgrenze übertragen; im vollständig betrachteten abgeschlossenen System erscheint die entgegengesetzte Änderung an einem anderen Bestandteil. Eine scheinbare Verletzung der Erhaltung zeigt daher häufig, dass ein beteiligter Körper oder die Umgebung außerhalb der gewählten Grenze liegt.",
            "essentialUnderstandingEn": "When one component gains or loses charge, charge is transferred across that component's boundary; within the complete closed system, the opposite change appears on another component. An apparent violation of conservation therefore often shows that an involved body or the surroundings lie outside the chosen boundary.",
            "observablePerformanceDe": "Die lernende Person vergleicht die Bilanz eines Teilsystems mit der eines erweiterten abgeschlossenen Systems, lokalisiert den Ladungstransfer und erklärt die Änderung einzelner Körper, ohne Ladung als neu entstanden oder verschwunden zu beschreiben.",
            "observablePerformanceEn": "The learner compares the balance of a subsystem with that of an expanded closed system, locates the charge transfer, and explains changes of individual bodies without describing charge as newly created or destroyed."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "closed-system-algebraic-total-is-conserved",
            "local-changes-are-transfers-across-subsystem-boundaries"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "system-boundary",
            "textDe": "Ein vollständig abgeschlossenes Mehrkörpersystem oder ein zunächst zu eng gewähltes einzelnes Teilsystem",
            "textEn": "A complete closed multi-body system or an initially too narrowly chosen single subsystem"
          },
          {
            "id": "charge-information",
            "textDe": "Vollständige Vorher-nachher-Werte oder eine aus der Erhaltungsbilanz zu bestimmende Teilladung",
            "textEn": "Complete before-and-after values or one component charge to be determined from conservation"
          },
          {
            "id": "sign-composition",
            "textDe": "Nur gleichnamige Beiträge oder gemischte positive, negative und neutrale Anfangszustände",
            "textEn": "Only like-signed contributions or mixed positive, negative, and neutral initial states"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "three-body-redistribution-balance",
            "taskDemandDe": "Drei Körper befinden sich in einem elektrisch abgeschlossenen Behälter. Vor einer Umverteilung tragen sie +4 nC, −1 nC und 0 nC. Danach werden an zwei Körpern +2 nC und +5 nC bestimmt. Ermittle die Ladung des dritten Körpers und beschreibe, was die Bilanz über Umverteilung und Gesamtladung aussagt.",
            "taskDemandEn": "Three bodies are inside an electrically closed enclosure. Before redistribution they carry +4 nC, −1 nC, and 0 nC. Afterwards, +2 nC and +5 nC are determined on two bodies. Determine the charge of the third body and explain what the balance says about redistribution and total charge.",
            "expectedPerformanceDe": "Die lernende Person bildet vor dem Vorgang Q_ges = +3 nC. Damit die Nachher-Summe ebenfalls +3 nC beträgt, muss der dritte Körper −4 nC tragen, denn +2 nC + 5 nC − 4 nC = +3 nC. Sie erklärt, dass sich die Teilladungen stark geändert haben, die algebraische Gesamtladung des abgeschlossenen Dreikörpersystems aber erhalten blieb.",
            "expectedPerformanceEn": "The learner calculates Q_total = +3 nC before the process. For the final sum also to equal +3 nC, the third body must carry −4 nC because +2 nC + 5 nC − 4 nC = +3 nC. The learner explains that the component charges changed substantially while the algebraic total charge of the closed three-body system remained conserved.",
            "understandingFocusDe": "Der Grundfall prüft vorzeichenrichtige Gesamtbilanz und die Trennung zwischen erhaltener Gesamtladung und veränderlichen Teilladungen.",
            "understandingFocusEn": "The direct case tests a correctly signed total balance and the distinction between conserved total charge and changing component charges."
          },
          {
            "id": "ground-contact-requires-expanded-boundary",
            "taskDemandDe": "Eine leitende Kugel trägt zunächst +6 nC. Nach leitendem Kontakt mit einer geerdeten Verbindung wird an der Kugel näherungsweise 0 nC gemessen. Eine Aussage behauptet, in der Kugel sei Ladung vernichtet worden. Beurteile die Aussage zuerst für das Teilsystem Kugel und dann für ein erweitertes System aus Kugel, Leitung und Erde.",
            "taskDemandEn": "A conducting sphere initially carries +6 nC. After conducting contact with a grounded connection, approximately 0 nC is measured on the sphere. A statement claims that charge was destroyed in the sphere. Assess the statement first for the sphere as a subsystem and then for an expanded system consisting of sphere, connection, and Earth.",
            "expectedPerformanceDe": "Die lernende Person erkennt, dass die Kugel allein während des Kontakts kein abgeschlossenes System ist und Ladung über die Leitung übertragen wird. Sie erweitert die Grenze um Leitung und Erde und deutet die Änderung der Kugelladung als Umverteilung innerhalb dieses größeren Systems; die fehlenden +6 nC werden nicht als vernichtet bezeichnet.",
            "expectedPerformanceEn": "The learner recognizes that the sphere alone is not a closed system during contact and that charge is transferred through the connection. The learner expands the boundary to include the connection and Earth and interprets the sphere's change as redistribution within that larger system; the missing +6 nC is not described as destroyed.",
            "understandingFocusDe": "Der Transfer prüft, ob eine scheinbare Nichterhaltung durch eine sachgerechte Systemgrenze und einen Ladungstransfer erklärt wird.",
            "understandingFocusEn": "The transfer tests whether apparent non-conservation is explained through an appropriate system boundary and charge transfer."
          }
        ]
      }
    },
    {
      "goalId": "38e0ff49-f132-44c8-b17a-73dada5344db",
      "profile": {
        "archetype": "proof",
        "expectations": [
          {
            "id": "independent-review-a-understanding",
            "essentialUnderstandingDe": "Für ideal ausgedehnte, parallele Platten mit homogener freier Flächenladungsdichte überlagern sich die Beiträge beider Platten zwischen ihnen zu einem homogenen Feld und außerhalb zur Aufhebung; im homogenen Medium folgt $E=\\sigma/\\varepsilon$. Endliche Platten, Randfelder und inhomogene Materialien begrenzen diese Beziehung.",
            "essentialUnderstandingEn": "For ideally extended parallel plates with uniform free surface charge density, the contributions of the two plates superpose to form a uniform field between them and cancel outside; in a homogeneous medium, $E=\\sigma/\\varepsilon$. Finite plates, edge fields, and inhomogeneous materials limit this relation.",
            "observablePerformanceDe": "Die lernende Person leitet den Zusammenhang mit einem gültigen mathematischen Weg aus den gebundenen Voraussetzungen her, führt Richtung, Vorzeichen, Einheiten und den Faktor aus der Überlagerung beider Platten konsistent und benennt die Annahmen, unter denen Innen- und Außenfeld so beschrieben werden.",
            "observablePerformanceEn": "Using a valid mathematical route from the stated prerequisites, the learner derives the relation, consistently tracks direction, sign, units, and the factor arising from superposition of both plates, and states the assumptions under which the inner and outer fields are described in this way."
          },
          {
            "id": "independent-review-b-understanding",
            "essentialUnderstandingDe": "Für zwei große parallele, entgegengesetzt geladene Platten ergibt sich das Feld aus der Überlagerung der Felder beider Flächenladungen: Zwischen den Platten addieren sich die Beiträge, außerhalb heben sie sich im idealen Grenzfall auf. Der Zusammenhang zwischen E und σ setzt die benannte Permittivität, gleichmäßige Ladungsverteilung und vernachlässigbare Randeffekte voraus.",
            "essentialUnderstandingEn": "For two large parallel plates carrying opposite charge, the field results from superposing the fields of the two surface charge distributions: between the plates the contributions add, while outside they cancel in the ideal limit. The relation between E and σ assumes the stated permittivity, a uniform charge distribution, and negligible edge effects.",
            "observablePerformanceDe": "Die lernende Person leitet mit Symmetrie und Überlagerung aus dem Feld einer einzelnen idealisierten geladenen Fläche den Feldbetrag zwischen den Kondensatorplatten her, verfolgt Vorzeichen und Richtungen und kennzeichnet jeden Schritt, der von einer Modellannahme abhängt.",
            "observablePerformanceEn": "Using symmetry and superposition, the learner derives the field magnitude between capacitor plates from the field of one idealized charged sheet, tracks signs and directions, and identifies every step that depends on a model assumption."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "independent-review-a-understanding",
            "independent-review-b-understanding"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "changed-physical-condition",
            "textDe": "Mindestens eine relevante Größe, Geometrie, Rand- oder Anfangsbedingung wird gegenüber dem Ausgangsfall verändert.",
            "textEn": "At least one relevant quantity, geometry, boundary condition, or initial condition is changed from the original case."
          },
          {
            "id": "changed-evidence-representation",
            "textDe": "Die fachliche Information liegt in einer anderen geeigneten Darstellung vor, etwa als Diagramm, Datensatz, Skizze, Formel, Simulation oder belegte Quelle.",
            "textEn": "The scientific information is supplied in another suitable representation, such as a diagram, data set, sketch, formula, simulation, or evidenced source."
          },
          {
            "id": "model-validity-boundary",
            "textDe": "Ein Fall erfüllt die idealisierenden Annahmen, der andere enthält eine benannte Nichtidealität oder Informationsgrenze.",
            "textEn": "One case satisfies the idealizing assumptions, while the other contains a stated non-ideality or information limit."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "fresh-independent-case-a",
            "taskDemandDe": "Für einen neuen Fall mit homogenem Dielektrikum oder endlichen Platten passt die lernende Person die Beziehung über die passende Permittivität an beziehungsweise erklärt, warum Randfelder eine ortsunabhängige Feldstärke verhindern, ohne die ideale Herleitung unbesehen zu übertragen.",
            "taskDemandEn": "For a new case with a homogeneous dielectric or finite plates, the learner adapts the relation using the appropriate permittivity or explains why edge fields prevent a position-independent field strength, rather than transferring the ideal derivation uncritically.",
            "expectedPerformanceDe": "Die lernende Person leitet den Zusammenhang mit einem gültigen mathematischen Weg aus den gebundenen Voraussetzungen her, führt Richtung, Vorzeichen, Einheiten und den Faktor aus der Überlagerung beider Platten konsistent und benennt die Annahmen, unter denen Innen- und Außenfeld so beschrieben werden.",
            "expectedPerformanceEn": "Using a valid mathematical route from the stated prerequisites, the learner derives the relation, consistently tracks direction, sign, units, and the factor arising from superposition of both plates, and states the assumptions under which the inner and outer fields are described in this way.",
            "understandingFocusDe": "Für ideal ausgedehnte, parallele Platten mit homogener freier Flächenladungsdichte überlagern sich die Beiträge beider Platten zwischen ihnen zu einem homogenen Feld und außerhalb zur Aufhebung; im homogenen Medium folgt $E=\\sigma/\\varepsilon$. Endliche Platten, Randfelder und inhomogene Materialien begrenzen diese Beziehung.",
            "understandingFocusEn": "For ideally extended parallel plates with uniform free surface charge density, the contributions of the two plates superpose to form a uniform field between them and cancel outside; in a homogeneous medium, $E=\\sigma/\\varepsilon$. Finite plates, edge fields, and inhomogeneous materials limit this relation."
          },
          {
            "id": "fresh-independent-case-b",
            "taskDemandDe": "Bei einer neuen Situation mit nur einer geladenen Fläche, einem vollständig füllenden homogenen Dielektrikum oder einer endlichen Plattengeometrie entscheidet die lernende Person, welche Beiträge und Annahmen der Herleitung erhalten bleiben und wo der ideale Zusammenhang angepasst oder nur näherungsweise verwendet werden darf.",
            "taskDemandEn": "For a new situation involving a single charged sheet, a homogeneous dielectric completely filling the gap, or finite plate geometry, the learner determines which contributions and assumptions of the derivation remain valid and where the ideal relation must be adjusted or used only approximately.",
            "expectedPerformanceDe": "Die lernende Person leitet mit Symmetrie und Überlagerung aus dem Feld einer einzelnen idealisierten geladenen Fläche den Feldbetrag zwischen den Kondensatorplatten her, verfolgt Vorzeichen und Richtungen und kennzeichnet jeden Schritt, der von einer Modellannahme abhängt.",
            "expectedPerformanceEn": "Using symmetry and superposition, the learner derives the field magnitude between capacitor plates from the field of one idealized charged sheet, tracks signs and directions, and identifies every step that depends on a model assumption.",
            "understandingFocusDe": "Für zwei große parallele, entgegengesetzt geladene Platten ergibt sich das Feld aus der Überlagerung der Felder beider Flächenladungen: Zwischen den Platten addieren sich die Beiträge, außerhalb heben sie sich im idealen Grenzfall auf. Der Zusammenhang zwischen E und σ setzt die benannte Permittivität, gleichmäßige Ladungsverteilung und vernachlässigbare Randeffekte voraus.",
            "understandingFocusEn": "For two large parallel plates carrying opposite charge, the field results from superposing the fields of the two surface charge distributions: between the plates the contributions add, while outside they cancel in the ideal limit. The relation between E and σ assumes the stated permittivity, a uniform charge distribution, and negligible edge effects."
          }
        ]
      }
    },
    {
      "goalId": "a08e33db-d821-457b-86dd-870e7648c5f4",
      "profile": {
        "archetype": "procedure",
        "expectations": [
          {
            "id": "round-trip-midpoint-convention",
            "essentialUnderstandingDe": "Zwei im selben Inertialsystem ruhende Uhren A und B werden mit einem Lichtsignal synchronisiert: A sendet bei t₁, B reflektiert das Signal, und A empfängt es bei t₂. Nach der Einstein-Konvention wird dem Reflexionsereignis bei B die Zeit (t₁ + t₂)/2 zugeordnet.",
            "essentialUnderstandingEn": "Two clocks A and B at rest in the same inertial frame are synchronized using a light signal: A sends at t₁, B reflects the signal, and A receives it at t₂. Under the Einstein convention, the reflection event at B is assigned the time (t₁ + t₂)/2.",
            "observablePerformanceDe": "Die lernende Person ordnet in einem neuen Signalprotokoll Sende-, Reflexions- und Empfangsereignis korrekt zu, berechnet die einzustellende B-Zeit und begründet den Mittelpunkt aus der konventionell symmetrisch behandelten Hin- und Rücklaufzeit.",
            "observablePerformanceEn": "In a new signal protocol, the learner correctly assigns emission, reflection, and reception events, calculates the B-clock setting, and justifies the midpoint using the conventionally symmetric treatment of outbound and return travel times."
          },
          {
            "id": "operational-simultaneity-in-frame",
            "essentialUnderstandingDe": "Die Synchronisationsregel definiert, welche räumlich getrennten Ereignisse in diesem Inertialsystem gleiche Zeitkoordinaten erhalten. Sie misst keine zuvor unabhängig gegebene absolute Gleichzeitigkeit und setzt endliche Lichtlaufzeiten ausdrücklich voraus.",
            "essentialUnderstandingEn": "The synchronization rule defines which spatially separated events receive equal time coordinates in this inertial frame. It does not measure a previously existing absolute simultaneity and explicitly accounts for finite light-travel times.",
            "observablePerformanceDe": "Die lernende Person erklärt anhand zweier entfernter Ereignisse, wie synchronisierte Uhren ihnen Zeitkoordinaten zuweisen, und korrigiert sowohl das Ignorieren der Signallaufzeit als auch die Behauptung einer rahmenunabhängigen globalen Jetzt-Zeit.",
            "observablePerformanceEn": "Using two distant events, the learner explains how synchronized clocks assign them time coordinates and corrects both neglect of signal travel time and the claim of a frame-independent global present."
          },
          {
            "id": "frame-and-rest-condition",
            "essentialUnderstandingDe": "Die beiden Uhren müssen für die beschriebene Synchronisation an festen Orten desselben Inertialsystems ruhen. Ein relativ bewegtes Inertialsystem führt seine eigene Einstein-Synchronisation durch und kann entfernte Ereignisse anders als gleichzeitig einordnen.",
            "essentialUnderstandingEn": "For the described synchronization, both clocks must remain at fixed locations in the same inertial frame. A relatively moving inertial frame performs its own Einstein synchronization and may classify distant events differently with respect to simultaneity.",
            "observablePerformanceDe": "Die lernende Person benennt das Bezugssystem und den Ruhezustand der Uhren, trennt die Synchronisationsurteile zweier relativ bewegter Systeme und vermeidet es, eine in einem System festgelegte Gleichzeitigkeit ungeprüft auf das andere zu übertragen.",
            "observablePerformanceEn": "The learner identifies the reference frame and the clocks' state of rest, separates synchronization judgments made in two relatively moving frames, and avoids transferring simultaneity established in one frame to the other without examination."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "round-trip-midpoint-convention",
            "operational-simultaneity-in-frame",
            "frame-and-rest-condition"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "signal-timestamps",
            "textDe": "Unterschiedliche Sende- und Empfangszeiten bei derselben Rundlaufstruktur",
            "textEn": "Different emission and reception times with the same round-trip structure"
          },
          {
            "id": "clock-separation",
            "textDe": "Unterschiedliche feste räumliche Abstände der Uhren innerhalb eines Inertialsystems",
            "textEn": "Different fixed spatial separations of the clocks within an inertial frame"
          },
          {
            "id": "reference-frame",
            "textDe": "Uhren im Labor-Inertialsystem oder Uhren in einem relativ bewegten Inertialsystem",
            "textEn": "Clocks in the laboratory inertial frame or clocks in a relatively moving inertial frame"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "numerical-round-trip-protocol",
            "taskDemandDe": "Uhr A sendet bei 12,0 µs ein Lichtsignal, B reflektiert es unmittelbar und A empfängt es bei 28,0 µs. Die bei B einzustellende Reflexionszeit und die Bedeutung dieser Festlegung sind zu erklären.",
            "taskDemandEn": "Clock A sends a light signal at 12.0 µs, B reflects it immediately, and A receives it at 28.0 µs. The reflection time to be set at B and the meaning of this assignment must be explained.",
            "expectedPerformanceDe": "Die lernende Person stellt B auf 20,0 µs, verwendet die halbe Rundlaufzeit für beide Richtungen und erklärt, dass dies die Gleichzeitigkeit räumlich getrennter Ereignisse im genannten Inertialsystem definiert, nicht eine augenblickliche Signalübertragung belegt.",
            "expectedPerformanceEn": "The learner sets B to 20.0 µs, uses half the round-trip time for each direction, and explains that this defines simultaneity of spatially separated events in the named inertial frame rather than proving instantaneous signal transmission.",
            "understandingFocusDe": "Rechnung und konventionelle Bedeutung müssen gemeinsam sichtbar werden.",
            "understandingFocusEn": "The calculation and the conventional meaning must be made visible together."
          },
          {
            "id": "moving-frame-synchronization",
            "taskDemandDe": "Ein Zug und ein Bahnsteig werden als relativ bewegte Inertialsysteme betrachtet; in jedem ruhen zwei entfernte Uhren, die intern nach Einstein synchronisiert werden. Die Behauptung „wenn die Bahnsteiguhren zwei Ereignisse gleichzeitig nennen, müssen die Zuguhren dasselbe tun“ ist zu beurteilen.",
            "taskDemandEn": "A train and a platform are treated as relatively moving inertial frames; each contains two distant clocks at rest in that frame and internally Einstein-synchronized. The claim “if the platform clocks call two events simultaneous, the train clocks must do the same” must be evaluated.",
            "expectedPerformanceDe": "Die lernende Person ordnet jeder Uhrengruppe ihr eigenes Inertialsystem und Lichtsignalverfahren zu und verwirft die universelle Schlussfolgerung, weil die so definierten Gleichzeitigkeitsebenen bezugssystemabhängig sind.",
            "expectedPerformanceEn": "The learner assigns each set of clocks to its own inertial frame and light-signal procedure and rejects the universal conclusion because the resulting planes of simultaneity are frame dependent.",
            "understandingFocusDe": "Der Rahmenwechsel diagnostiziert die Verwechslung einer operationalen Konvention mit absoluter Gleichzeitigkeit.",
            "understandingFocusEn": "The frame change diagnoses confusion of an operational convention with absolute simultaneity."
          }
        ]
      }
    },
    {
      "goalId": "3ed3279e-c524-5230-a277-dda89493df6d",
      "profile": {
        "archetype": "concept",
        "expectations": [
          {
            "id": "shared-reference",
            "essentialUnderstandingDe": "Eine physikalische Größenangabe verbindet Zahlenwert und Einheit; gemeinsame SI-Bezüge ermöglichen Vergleich und Verständigung unabhängig von lokalen Messgewohnheiten.",
            "essentialUnderstandingEn": "A physical quantity value combines number and unit; shared SI references enable comparison and communication independently of local measuring conventions.",
            "observablePerformanceDe": "Die lernende Person erläutert an zwei Messberichten die Funktion gemeinsamer Einheiten und macht aus einer mehrdeutigen Angabe eine eindeutig benannte Größe mit passender SI-Einheit.",
            "observablePerformanceEn": "The learner explains the role of shared units using two measurement reports and turns an ambiguous entry into a clearly named quantity with an appropriate SI unit."
          },
          {
            "id": "quantity-unit-match",
            "essentialUnderstandingDe": "Einheiten gehören zu bestimmten Größenarten; Meter, Sekunde und Kilogramm sowie einfache abgeleitete Einheiten tragen verschiedene Bedeutungen.",
            "essentialUnderstandingEn": "Units correspond to kinds of quantity; metre, second and kilogram, and simple derived units, carry different meanings.",
            "observablePerformanceDe": "Die lernende Person ordnet einfachen gegebenen Größen passende SI-Einheiten zu und erklärt die Bedeutung einer ausgewählten Angabe einschließlich eines einfachen Vergleichs.",
            "observablePerformanceEn": "The learner assigns suitable SI units to simple supplied quantities and explains the meaning of one entry, including a simple comparison."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "shared-reference",
            "quantity-unit-match"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "report-context",
            "textDe": "Vergleich von Längenangaben gegenüber einem Messprotokoll mit mehreren Größenarten.",
            "textEn": "Comparison of length entries versus a measurement record containing several quantity types."
          },
          {
            "id": "unit-form",
            "textDe": "SI-Vorsatz und Basiseinheit gegenüber einfacher abgeleiteter Einheit.",
            "textEn": "SI prefix and base unit versus a simple derived unit."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "rope-reports",
            "taskDemandDe": "Zwei Gruppen messen dieselbe Schnur: A notiert '120', B '1,20 m'. Die erste Gruppe klärt nachträglich, Zentimeter verwendet zu haben; 100 cm=1 m ist gegeben. Ergänze eindeutige Angaben, vergleiche sie und erläutere, warum ein gemeinsamer Einheitenbezug wichtig ist.",
            "taskDemandEn": "Two groups measure the same cord: A writes '120', B '1.20 m'. Group A later clarifies that it used centimetres; 100 cm=1 m is given. Complete unambiguous entries, compare them and explain why a common unit reference matters.",
            "expectedPerformanceDe": "Schreibt Länge 120 cm=1,20 m und erkennt denselben nominalen Längenwert; ohne Einheit war '120' nicht vergleichbar. Erläutert Meter und SI-Vorsatz als gemeinsame Referenz und trennt Übereinstimmung der Angaben von einer noch nicht angegebenen Messgenauigkeit.",
            "expectedPerformanceEn": "Writes length 120 cm=1.20 m and recognises the same nominal length; '120' without a unit was not comparable. Explains metre and the SI prefix as a shared reference and distinguishes matching entries from measurement precision not yet supplied.",
            "understandingFocusDe": "Gemeinsame Einheiten machen Zahlen zu vergleichbaren physikalischen Angaben.",
            "understandingFocusEn": "Shared units turn numbers into comparable physical quantity values."
          },
          {
            "id": "motion-log",
            "taskDemandDe": "Ein neuer Versuchsbogen enthält die Größen Strecke, Zeitdauer, Masse des Wagens und bereits bestimmte Geschwindigkeit mit Zahlen 0,8; 2; 0,5; 0,4. Die Werte wurden im SI erhoben. Ergänze passende Einheiten, erläutere besonders '0,4 m/s' und erkläre, warum eine Einheit nicht beliebig zwischen Zeilen getauscht werden kann.",
            "taskDemandEn": "A fresh experiment sheet lists distance, elapsed time, cart mass and an already determined speed, with numbers 0.8; 2; 0.5; 0.4. Values were obtained in SI. Add appropriate units, explain '0.4 m/s' in particular and explain why units cannot be arbitrarily exchanged between rows.",
            "expectedPerformanceDe": "Ordnet 0,8 m, 2 s, 0,5 kg und 0,4 m/s zu. Erläutert Meter pro Sekunde als Wegänderung pro Zeit und die Einheit als Kennzeichnung der Größenart; beschreibt, wie andere Gruppen dieselben Angaben nachvollziehbar vergleichen können. Es wird keine neue Bewegungsgleichung verlangt.",
            "expectedPerformanceEn": "Assigns 0.8 m, 2 s, 0.5 kg and 0.4 m/s. Explains metres per second as distance change per time and the unit as identifying the quantity type; describes how other groups can meaningfully compare the same entries. No new equation of motion is required.",
            "understandingFocusDe": "Auch abgeleitete Einheiten erhalten ihre Bedeutung aus den verknüpften physikalischen Größen.",
            "understandingFocusEn": "Derived units also gain their meaning from the physical quantities they combine."
          }
        ]
      }
    },
    {
      "goalId": "b92827a7-5d62-5fdb-a6f5-ac44461f4a7b",
      "profile": {
        "archetype": "concept",
        "expectations": [
          {
            "id": "power-rate-meaning",
            "essentialUnderstandingDe": "Leistung ist übertragene oder umgewandelte Energie pro Zeit, P=E/t; ein Watt ist ein Joule pro Sekunde. Hohe Leistung bedeutet eine hohe Rate, nicht automatisch viel Gesamtenergie.",
            "essentialUnderstandingEn": "Power is energy transferred or converted per unit time, P=E/t; one watt is one joule per second. High power means a high rate, not automatically a large total energy.",
            "observablePerformanceDe": "Die lernende Person identifiziert Energie und Dauer in einem neuen Vorgang, berechnet die mittlere Leistung mit kompatiblen Einheiten und deutet den Wert als Rate.",
            "observablePerformanceEn": "The learner identifies energy and duration in a new process, calculates average power with compatible units, and interprets the value as a rate."
          },
          {
            "id": "comparison-and-inverse-time",
            "essentialUnderstandingDe": "Bei gleicher Energie führt kürzere Dauer zu größerer Leistung; bei gleicher Leistung wächst die übertragene Energie mit der Dauer. Aussagekräftige Vergleiche müssen daher zwei der drei Größen kontrollieren.",
            "essentialUnderstandingEn": "For the same energy, a shorter duration gives greater power; for the same power, transferred energy grows with duration. Meaningful comparisons must therefore control two of the three quantities.",
            "observablePerformanceDe": "Die lernende Person vergleicht unbekannte Geräte- oder Bewegungsfälle, hält die passende Größe konstant und widerlegt eine Rangfolge, die nur Wattzahl oder nur Dauer betrachtet.",
            "observablePerformanceEn": "The learner compares unfamiliar device or motion cases, holds the relevant quantity constant, and refutes a ranking based only on wattage or only on duration."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "power-rate-meaning",
            "comparison-and-inverse-time"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "controlled-quantity",
            "textDe": "Gleiche Energie bei verschiedener Dauer oder gleiche Leistung bei verschiedener Dauer",
            "textEn": "Same energy over different durations or same power over different durations"
          },
          {
            "id": "unit-system",
            "textDe": "Joule und Sekunden oder Kilojoule und Minuten mit notwendiger Umrechnung",
            "textEn": "Joules and seconds or kilojoules and minutes requiring conversion"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "stair-climb-power",
            "taskDemandDe": "Zwei Personen gewinnen beim Treppensteigen jeweils 4,8 kJ Lageenergie, benötigen aber 6 s und 10 s. Ihre Leistungen sind zu berechnen und zu deuten.",
            "taskDemandEn": "Two people each gain 4.8 kJ of gravitational energy climbing stairs but take 6 s and 10 s. Calculate and interpret their powers.",
            "expectedPerformanceDe": "Die lernende Person rechnet 4 800 J durch die jeweilige Zeit zu 800 W und 480 W und erklärt die höhere Leistung durch dieselbe Energie in kürzerer Zeit.",
            "expectedPerformanceEn": "The learner divides 4,800 J by each time to obtain 800 W and 480 W and explains the higher power as the same energy in less time.",
            "understandingFocusDe": "Einheitenrechnung und kontrollierter Energievergleich sichern die Ratendeutung.",
            "understandingFocusEn": "Unit calculation and controlled energy comparison secure the rate interpretation."
          },
          {
            "id": "wattage-duration-countercase",
            "taskDemandDe": "Ein 2-kW-Gerät läuft 3 min, ein 1-kW-Gerät 10 min. Die Behauptung „Das 2-kW-Gerät überträgt immer mehr Energie“ ist zu prüfen.",
            "taskDemandEn": "A 2 kW device runs for 3 min and a 1 kW device for 10 min. Evaluate “The 2 kW device always transfers more energy.”",
            "expectedPerformanceDe": "Die lernende Person berechnet 0,1 kWh gegenüber 1/6 kWh oder entsprechende Joulewerte und verwirft die Aussage wegen der unterschiedlichen Dauer.",
            "expectedPerformanceEn": "The learner calculates 0.1 kWh versus 1/6 kWh or equivalent joule values and rejects the claim because the durations differ.",
            "understandingFocusDe": "Der Gegenfall trennt momentane beziehungsweise mittlere Rate von Gesamtenergie.",
            "understandingFocusEn": "The counterexample separates instantaneous or average rate from total energy."
          }
        ]
      }
    },
    {
      "goalId": "f7f2c254-1663-5861-bed7-a32c00495b19",
      "profile": {
        "archetype": "concept",
        "expectations": [
          {
            "id": "useful-input-ratio",
            "essentialUnderstandingDe": "Der Wirkungsgrad η=E_nutz/E_zu beschreibt den Anteil der zugeführten Energie, der für den festgelegten Zweck nutzbar ist; welche Abgabe nützlich ist, hängt vom Systemzweck ab.",
            "essentialUnderstandingEn": "Efficiency η=E_useful/E_input is the fraction of input energy useful for the specified purpose; which output is useful depends on the system’s purpose.",
            "observablePerformanceDe": "Die lernende Person grenzt für ein neues System Zufuhr, Nutzabgabe und weitere Abgaben ab, berechnet den Wirkungsgrad und erläutert die Zweckabhängigkeit.",
            "observablePerformanceEn": "For a new system, the learner distinguishes input, useful output, and other outputs, calculates efficiency, and explains its dependence on purpose."
          },
          {
            "id": "energy-balance-and-bound",
            "essentialUnderstandingDe": "Energieerhaltung verlangt, dass Nutzenergie und weitere Abgaben zusammen die Zufuhr bilanzieren; deshalb liegt der Wirkungsgrad eines realen einfachen Systems zwischen 0 und 1. Ein Wert über 1 zeigt einen Bilanz-, Bezugs- oder Einheitenfehler.",
            "essentialUnderstandingEn": "Energy conservation requires useful energy and other outputs together to balance the input; therefore a real simple system has efficiency between 0 and 1. A value above 1 signals a balance, boundary, or unit error.",
            "observablePerformanceDe": "Die lernende Person ergänzt eine fehlende Energieabgabe, prüft Summe und Einheit und diagnostiziert eine angebotene Effizienz über 100 Prozent statt sie als besonders gutes Gerät zu akzeptieren.",
            "observablePerformanceEn": "The learner completes a missing energy output, checks sum and units, and diagnoses a proposed efficiency above 100 percent rather than accepting it as an exceptionally good device."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "useful-input-ratio",
            "energy-balance-and-bound"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "system-purpose",
            "textDe": "Motorische, thermische oder optische Nutzabgabe",
            "textEn": "Mechanical, thermal, or optical useful output"
          },
          {
            "id": "error-pattern",
            "textDe": "Korrekte Bilanz, vertauschtes Verhältnis oder fehlender Abgabepfad",
            "textEn": "Correct balance, inverted ratio, or missing output pathway"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "lifting-motor-balance",
            "taskDemandDe": "Ein Motor erhält 500 J elektrische Energie, erhöht die Lageenergie einer Last um 350 J und erwärmt die Umgebung. Wirkungsgrad und weitere Abgabe sind zu bestimmen.",
            "taskDemandEn": "A motor receives 500 J of electrical energy, increases a load’s gravitational energy by 350 J, and warms the surroundings. Determine efficiency and other output.",
            "expectedPerformanceDe": "Die lernende Person erhält η=0,70 beziehungsweise 70 Prozent und bilanziert 150 J als weitere Energieabgabe, ohne Energieverlust im Sinn von Verschwinden zu behaupten.",
            "expectedPerformanceEn": "The learner obtains η=0.70 or 70 percent and balances 150 J as another energy output without claiming energy disappears.",
            "understandingFocusDe": "Quotient und vollständige Bilanz werden gemeinsam geprüft.",
            "understandingFocusEn": "The ratio and complete balance are tested together."
          },
          {
            "id": "efficiency-over-one-audit",
            "taskDemandDe": "Für ein Gerät werden 2,4 kJ Nutzenergie und 2 000 J Zufuhr angegeben; daraus werden 120 Prozent Wirkungsgrad behauptet. Datensatz und Rechnung sind zu prüfen.",
            "taskDemandEn": "A device is said to provide 2.4 kJ useful energy from 2,000 J input, yielding 120 percent efficiency. Audit the data and calculation.",
            "expectedPerformanceDe": "Die lernende Person vereinheitlicht die Einheiten, erkennt E_nutz>E_zu als unvereinbar mit der gesetzten Systemgrenze und fordert eine fehlende Zufuhr, falsche Messung oder andere Grenze statt 120 Prozent zu akzeptieren.",
            "expectedPerformanceEn": "The learner standardizes units, recognizes E_useful>E_input as inconsistent with the stated boundary, and calls for missing input, measurement error, or a different boundary rather than accepting 120 percent.",
            "understandingFocusDe": "Der unmögliche Grenzfall diagnostiziert Formelwendung ohne Energieerhaltung.",
            "understandingFocusEn": "The impossible limiting case diagnoses formula use without energy conservation."
          }
        ]
      }
    },
    {
      "goalId": "66256e22-44a3-5939-8862-821e29d6711d",
      "profile": {
        "archetype": "experiment",
        "expectations": [
          {
            "id": "measurement-circuit-binds-voltage-and-current",
            "essentialUnderstandingDe": "Jeder Kennlinienpunkt besteht aus Spannung am Bauteil und Stromstärke durch dasselbe Bauteil im selben Betriebszustand. Das Strommessgerät liegt im betreffenden Zweig, das Spannungsmessgerät erfasst die Potenzialdifferenz über dem Bauteil; eine falsche Anordnung verändert oder gefährdet den Messaufbau und liefert keine gültige Wertepaarung.",
            "essentialUnderstandingEn": "Each point on a characteristic consists of the voltage across the component and the current through that same component in the same operating state. The ammeter is in the relevant branch and the voltmeter measures the potential difference across the component; an incorrect arrangement changes or endangers the setup and does not yield a valid pair of values.",
            "observablePerformanceDe": "Die lernende Person konstruiert oder korrigiert für ein unbekanntes Bauteil eine sichere Kleinspannungs-Messschaltung, kennzeichnet die beiden gemessenen Größen am Bauteil und begründet, weshalb jedes protokollierte U-I-Paar denselben stabilen Betriebspunkt beschreiben muss.",
            "observablePerformanceEn": "For an unfamiliar component, the learner constructs or corrects a safe low-voltage measuring circuit, labels the two measured quantities at the component, and explains why each recorded voltage-current pair must describe the same stable operating point."
          },
          {
            "id": "controlled-sweep-produces-defensible-data",
            "essentialUnderstandingDe": "Eine aussagekräftige Kennlinie entsteht durch systematische Änderung einer Größe bei kontrollierten Bedingungen, genügend Messpunkten und Einhaltung der bereitgestellten Bauteil- und Kleinspannungsgrenzen. Erwärmung, Polarität, Messbereich und Ableseunsicherheit können die Daten beeinflussen und müssen je nach Bauteil kontrolliert oder dokumentiert werden.",
            "essentialUnderstandingEn": "A defensible characteristic is produced by systematically varying one quantity under controlled conditions, taking enough data points, and respecting supplied component and safe-low-voltage limits. Heating, polarity, instrument range, and reading uncertainty can affect the data and must be controlled or documented as appropriate to the component.",
            "observablePerformanceDe": "Die lernende Person plant für ein bereitgestelltes Kleinspannungsbauteil eine Messreihe mit sinnvoller Schrittfolge, Nullpunkt, Messbereichen, Wiederholungen oder Wartebedingungen, dokumentiert Einheiten und Unsicherheiten und begründet, welche Variable verändert und welche Bedingungen konstant gehalten werden.",
            "observablePerformanceEn": "For a supplied low-voltage component, the learner plans a data series with a sensible sequence of steps, zero point, instrument ranges, repetitions or waiting conditions, records units and uncertainties, and justifies which variable is changed and which conditions are held constant."
          },
          {
            "id": "graph-shape-distinguishes-ohmic-and-nonohmic-behavior",
            "essentialUnderstandingDe": "Bei festgelegter Achsenwahl zeigt ein ohmsches Bauteil unter konstanten Bedingungen eine Gerade durch den Ursprung; dann bleibt U/I konstant. Bei einer gekrümmten oder richtungsabhängigen Kennlinie ändert sich U/I mit dem Betriebspunkt. Wird I über U aufgetragen, beschreibt die Steigung eine Leitfähigkeit und darf nicht ungeprüft als Widerstand bezeichnet werden.",
            "essentialUnderstandingEn": "With a stated choice of axes, an ohmic component under constant conditions gives a straight line through the origin, so U/I remains constant. For a curved or direction-dependent characteristic, U/I changes with the operating point. If current is plotted against voltage, the slope represents conductance and must not be called resistance without checking the axis convention.",
            "observablePerformanceDe": "Die lernende Person erstellt aus frischen Messdaten ein beschriftetes Diagramm, prüft Linearität und Ursprung, bestimmt oder vergleicht U/I an mehreren Punkten, deutet die Form physikalisch und korrigiert eine Steigungsinterpretation, die die Achsen vertauscht.",
            "observablePerformanceEn": "The learner constructs a labelled graph from fresh measurements, checks linearity and the origin, determines or compares U/I at several points, interprets the shape physically, and corrects a slope interpretation that ignores which quantities are on the axes."
          },
          {
            "id": "characteristic-supports-bounded-prediction-and-model-check",
            "essentialUnderstandingDe": "Eine Kennlinie erlaubt Ablesen oder Interpolation nur im untersuchten Zustands- und Messbereich. Abweichende Kurven bei geänderter Temperatur, Polarität oder Bauteilart sind physikalische Information und nicht automatisch Messfehler; weite Extrapolation oder die Annahme eines konstanten Widerstands benötigen zusätzliche Begründung.",
            "essentialUnderstandingEn": "A characteristic supports reading or interpolation only within the investigated state and measurement range. Different curves when temperature, polarity, or component type changes are physical information rather than automatically measurement error; wide extrapolation or assuming constant resistance requires additional justification.",
            "observablePerformanceDe": "Die lernende Person nutzt eine unbekannte Kennlinie für eine Vorhersage innerhalb des Messbereichs, nennt eine angemessene Unsicherheit, vergleicht sie mit einem neuen Datenpunkt und entscheidet begründet, ob Messstreuung, Zustandsänderung oder ein ungeeignetes ohmsches Modell die Abweichung erklärt.",
            "observablePerformanceEn": "The learner uses an unfamiliar characteristic to make a prediction within the measured range, states an appropriate uncertainty, compares it with a new data point, and decides with justification whether scatter, a change of state, or an unsuitable ohmic model explains the discrepancy."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "measurement-circuit-binds-voltage-and-current",
            "controlled-sweep-produces-defensible-data",
            "graph-shape-distinguishes-ohmic-and-nonohmic-behavior",
            "characteristic-supports-bounded-prediction-and-model-check"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 3,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "component-behavior",
            "textDe": "Ohmscher Widerstand, Glühlampe oder polungsabhängiges einfaches Bauteil innerhalb bereitgestellter sicherer Grenzwerte",
            "textEn": "Ohmic resistor, filament lamp, or polarity-dependent simple component within supplied safe limits"
          },
          {
            "id": "state-and-control",
            "textDe": "Konstante Temperatur, merkliche Erwärmung, auf- und absteigende Messfolge oder vertauschte Polarität",
            "textEn": "Constant temperature, appreciable heating, increasing and decreasing sweep, or reversed polarity"
          },
          {
            "id": "data-quality",
            "textDe": "Dichte oder grobe Messpunktfolge, Wiederholungen, Ausreißer und unterschiedliche Messunsicherheiten",
            "textEn": "Dense or coarse sequence of points, repeated readings, outliers, and different measurement uncertainties"
          },
          {
            "id": "representation-and-task",
            "textDe": "Messschaltung, Tabelle, U-über-I- oder I-über-U-Diagramm sowie Vorhersage oder Fehlerdiagnose",
            "textEn": "Measuring circuit, table, voltage-versus-current or current-versus-voltage graph, and prediction or fault diagnosis"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "resistor-data-with-one-mismatched-point",
            "taskDemandDe": "Eine sichere Kleinspannungs-Messreihe an einem Widerstand enthält sechs zusammengehörige U-I-Paare und einen siebten Eintrag, dessen Stromwert versehentlich aus dem vorherigen Betriebspunkt übernommen wurde. Zeichne die Kennlinie mit Unsicherheitsangaben, identifiziere den verdächtigen Punkt und entscheide, welche Nachmessung das ohmsche Modell fair prüft.",
            "taskDemandEn": "A safe low-voltage data series for a resistor contains six paired voltage-current values and a seventh entry whose current was accidentally copied from the preceding operating point. Plot the characteristic with uncertainty information, identify the suspect point, and decide what repeat measurement would fairly test the ohmic model.",
            "expectedPerformanceDe": "Die lernende Person beschriftet Achsen und Einheiten, erkennt sechs annähernd lineare Ursprungspunkte, markiert den unpassenden Wertepaarpunkt, verlangt eine erneute simultane Ablesung dieses Betriebspunkts und entscheidet erst danach anhand von U/I und Unsicherheit über ohmsches Verhalten.",
            "expectedPerformanceEn": "The learner labels axes and units, recognizes six approximately linear points through the origin, marks the inconsistent paired point, calls for a fresh simultaneous reading at that operating point, and only then uses U/I and uncertainty to decide whether the behavior is ohmic.",
            "understandingFocusDe": "Der gebrochene Wertepaarbezug prüft, ob Kennlinienpunkte als reale gemeinsame Betriebszustände verstanden werden.",
            "understandingFocusEn": "The broken pairing tests whether characteristic points are understood as real shared operating states."
          },
          {
            "id": "lamp-heating-up-and-down-sweep",
            "taskDemandDe": "Für eine Kleinspannungs-Glühlampe liegen Messwerte einer langsam aufsteigenden und einer unmittelbar absteigenden Spannungsfolge vor. Erstelle beide Kennlinien, vergleiche U/I bei mehreren Punkten und entwickle eine Erklärung, in der die Temperatur des Glühfadens als kontrollierter beziehungsweise veränderter Zustand vorkommt.",
            "taskDemandEn": "For a low-voltage filament lamp, data are supplied for a slowly increasing voltage sweep and an immediately decreasing sweep. Construct both characteristics, compare U/I at several points, and develop an explanation that treats filament temperature as a controlled or changing state.",
            "expectedPerformanceDe": "Die lernende Person erkennt gekrümmte, gegebenenfalls leicht verschiedene Verläufe, zeigt den nicht konstanten Quotienten U/I, verbindet größeren Widerstand mit dem erwärmten Glühfaden und nennt Messfolge sowie Wartezeit als relevante Bedingungen statt die Kurve als bloßen Messfehler zu verwerfen.",
            "expectedPerformanceEn": "The learner recognizes curved and possibly slightly different traces, demonstrates that U/I is not constant, connects greater resistance with the heated filament, and identifies sweep order and waiting time as relevant conditions instead of dismissing the curve as mere measurement error.",
            "understandingFocusDe": "Die Zustandsänderung trennt nichtohmsches Verhalten von einer formalen Gerade-durch-Ursprung-Prüfung ohne Physik.",
            "understandingFocusEn": "The change of state separates non-ohmic behavior from a purely formal straight-line-through-origin test without physical interpretation."
          },
          {
            "id": "polarity-dependent-component-supplied-data",
            "taskDemandDe": "Eine Simulation eines polungsabhängigen Kleinspannungsbauteils liefert sichere U-I-Daten für beide Polaritäten und nennt eine zulässige Stromgrenze. Plane eine sinnvolle graphische Darstellung, klassifiziere den richtungsabhängigen Verlauf und sage innerhalb des untersuchten Bereichs einen Stromwert für eine neue Spannung voraus, ohne über die Grenze zu extrapolieren.",
            "taskDemandEn": "A simulation of a polarity-dependent low-voltage component supplies safe voltage-current data for both polarities and states an allowable current limit. Plan a suitable graph, classify the direction-dependent behavior, and predict a current for a new voltage within the investigated range without extrapolating beyond the limit.",
            "expectedPerformanceDe": "Die lernende Person erhält Vorzeichen und Polarität in Tabelle und Diagramm, erkennt den asymmetrischen nichtohmschen Verlauf, interpoliert nur im belegten Bereich mit Unsicherheit und erklärt, weshalb weder ein konstanter Widerstand noch eine spiegelbildliche Fortsetzung in die andere Polarität gerechtfertigt ist.",
            "expectedPerformanceEn": "The learner preserves sign and polarity in the table and graph, recognizes the asymmetric non-ohmic behavior, interpolates only within the evidenced range with uncertainty, and explains why neither a constant resistance nor a mirror-image continuation into the other polarity is justified.",
            "understandingFocusDe": "Polaritätswechsel und sichere Bereichsgrenze prüfen Modellwahl, Vorzeichenverständnis und begrenzten Transfer.",
            "understandingFocusEn": "Changing polarity and imposing a safe range limit test model choice, sign understanding, and bounded transfer."
          }
        ]
      }
    },
    {
      "goalId": "27b90ce9-b650-5232-85fb-ce2cb69d59a3",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "ratings-name-distinct-quantities-and-conditions",
            "essentialUnderstandingDe": "Volt, Ampere, Watt und Amperestunde bezeichnen unterschiedliche Größen: Spannung zwischen Anschlüssen, Stromstärke im Betrieb, Leistung als übertragene Energie pro Zeit und Akkuladung als Ladungsmenge. Eine Nennangabe gilt für einen vorgesehenen Anschluss oder Betriebszustand und darf nicht allein wegen einer ähnlichen Zahl mit einer anderen Größe gleichgesetzt werden.",
            "essentialUnderstandingEn": "Volts, amperes, watts, and ampere-hours denote different quantities: voltage between terminals, current in operation, power as energy transferred per unit time, and battery charge as an amount of charge. A rating applies to an intended connection or operating state and must not be equated with another quantity merely because the numbers look similar.",
            "observablePerformanceDe": "Die lernende Person annotiert ein unbekanntes Geräte- oder Akkuetikett, ordnet jeder Zahl Größe, Einheit, Anschlussseite und physikalische Bedeutung zu und korrigiert mindestens zwei Vertauschungen zwischen Stromstärke, Leistung und Akkuladung.",
            "observablePerformanceEn": "The learner annotates an unfamiliar device or battery label, assigns each number its quantity, unit, connection side, and physical meaning, and corrects at least two confusions among current, power, and battery charge."
          },
          {
            "id": "supply-current-rating-is-capability-not-forced-draw",
            "essentialUnderstandingDe": "Bei passender Spannungsart, Nennspannung und Polarität beschreibt eine Stromangabe am Versorgungsgerät typischerweise die maximal vorgesehene Bereitstellung; das angeschlossene Gerät bestimmt durch seinen Betriebszustand die tatsächlich aufgenommene Stromstärke. Eine größere zulässige Stromstärke wird nicht automatisch in das Gerät hineingedrückt, während eine zu kleine Bereitstellungsgrenze den vorgesehenen Betrieb möglicherweise nicht ermöglicht.",
            "essentialUnderstandingEn": "When voltage type, rated voltage, and polarity match, a current rating on a supply typically describes its maximum intended capability; the connected device determines the current actually drawn through its operating state. A larger permissible current is not automatically forced into the device, whereas an insufficient capability may not support intended operation.",
            "observablePerformanceDe": "Für ein neues Paar aus Gerät und hypothetischer sicherer Kleinspannungsversorgung prüft die lernende Person zuerst Spannungsart, Betrag und Polarität, vergleicht anschließend benötigte und bereitstellbare Stromstärke und begründet, warum eine höhere Stromgrenze der Versorgung nicht mit der tatsächlichen Stromaufnahme identisch ist.",
            "observablePerformanceEn": "For a fresh pairing of a device and a hypothetical safe low-voltage supply, the learner first checks voltage type, magnitude, and polarity, then compares required and available current, and explains why a higher supply current limit is not identical to actual current draw."
          },
          {
            "id": "power-rating-links-energy-rate-to-one-operating-point",
            "essentialUnderstandingDe": "Leistung in Watt beschreibt Energieübertragung pro Zeit. Für zusammengehörige Gleichspannungs-Nennwerte kann P = U · I eine Plausibilitätsbeziehung liefern; Rundungen, Wirkungsgrad, Ein- gegenüber Ausgang und mehrere Betriebsarten müssen jedoch beachtet werden. Eine Leistungsangabe ist weder gespeicherte Energie noch automatisch der Verbrauch in einer beliebigen Zeit.",
            "essentialUnderstandingEn": "Power in watts describes energy transfer per unit time. For paired direct-voltage ratings, P = U · I can provide a consistency relation, but rounding, efficiency, input versus output, and multiple operating modes must be considered. A power rating is neither stored energy nor automatically the energy used over an arbitrary time.",
            "observablePerformanceDe": "Die lernende Person wählt auf einem unbekannten Datenblatt zusammengehörige U-I-P-Werte, prüft ihre Größenordnung mit Einheiten, erklärt eine begründbare Rundungsabweichung und weist eine Rechnung zurück, die Eingangs- und Ausgangsangaben oder verschiedene Betriebsmodi vermischt.",
            "observablePerformanceEn": "On an unfamiliar data sheet, the learner selects paired voltage-current-power ratings, checks their order of magnitude with units, explains a defensible rounding discrepancy, and rejects a calculation that mixes input and output ratings or different operating modes."
          },
          {
            "id": "battery-charge-is-not-energy-or-guaranteed-runtime",
            "essentialUnderstandingDe": "Eine Angabe in Ah oder mAh ist elektrische Ladung. Für eine grobe Energieabschätzung werden zusätzlich eine passende Spannung und die Betriebsbedingungen benötigt; bei gleicher Ladungsangabe kann eine höhere Nennspannung mehr nominale Energie bedeuten. Reale Laufzeit hängt außerdem von Laststrom, Spannungsverlauf, Abschaltgrenze, Wirkungsgrad und nutzbarer Kapazität ab.",
            "essentialUnderstandingEn": "A rating in Ah or mAh is electric charge. A rough energy estimate additionally requires an appropriate voltage and the operating conditions; at equal charge rating, a higher nominal voltage can mean more nominal energy. Actual runtime also depends on load current, voltage behavior, cut-off threshold, efficiency, and usable capacity.",
            "observablePerformanceDe": "Die lernende Person vergleicht zwei neue Akkudatensätze mit gleicher Ladungsangabe, aber verschiedener Spannung, erstellt eine begrenzte nominale Energie- oder Laufzeitabschätzung aus konsistenten Angaben und benennt ausdrücklich, weshalb mAh allein weder Watt noch eine garantierte Betriebsdauer liefert.",
            "observablePerformanceEn": "The learner compares two fresh battery data sets with the same charge rating but different voltage, constructs a bounded nominal energy or runtime estimate from consistent data, and explicitly states why mAh alone gives neither watts nor a guaranteed operating time."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "ratings-name-distinct-quantities-and-conditions",
            "supply-current-rating-is-capability-not-forced-draw",
            "power-rating-links-energy-rate-to-one-operating-point",
            "battery-charge-is-not-energy-or-guaranteed-runtime"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 3,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "rating-combination",
            "textDe": "Spannung, Stromstärke, Leistung und Akkuladung einzeln oder als zusammengehörige Nennwertgruppe",
            "textEn": "Voltage, current, power, and battery charge separately or as a paired set of ratings"
          },
          {
            "id": "device-role",
            "textDe": "Verbraucher, sichere Kleinspannungsversorgung, Akku oder Adapter mit getrennten Ein- und Ausgangsangaben",
            "textEn": "Load, safe low-voltage supply, battery, or adapter with separate input and output ratings"
          },
          {
            "id": "operating-condition",
            "textDe": "Nennbetrieb, Maximalangabe, mehrere Betriebsmodi oder unvollständige beziehungsweise gerundete Daten",
            "textEn": "Rated operation, maximum rating, several operating modes, or incomplete or rounded data"
          },
          {
            "id": "performance-mode",
            "textDe": "Etikett annotieren, Kompatibilität begründen, Plausibilität prüfen oder Energie- und Laufzeitaussage begrenzen",
            "textEn": "Annotate a label, justify compatibility, check plausibility, or bound an energy and runtime claim"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "usb-device-and-higher-current-supply",
            "taskDemandDe": "Ein hypothetisches Kleinspannungsgerät ist mit 5 V Gleichspannung, 1,5 A und 7,5 W beschriftet. Zwei passende gepolte Versorgungen liefern 5 V Gleichspannung und sind mit maximal 1,0 A beziehungsweise maximal 3,0 A angegeben. Prüfe die Nennwerte, beurteile beide Optionen und erkläre, ob die 3,0-A-Versorgung dem Gerät automatisch 3,0 A aufzwingt.",
            "taskDemandEn": "A hypothetical low-voltage device is labelled 5 V direct voltage, 1.5 A, and 7.5 W. Two supplies with matching polarity provide 5 V direct voltage and are rated at a maximum of 1.0 A and 3.0 A respectively. Check the ratings, assess both options, and explain whether the 3.0 A supply automatically forces 3.0 A through the device.",
            "expectedPerformanceDe": "Die lernende Person bestätigt 5 V · 1,5 A = 7,5 W als konsistenten Betriebspunkt, erkennt die 1,0-A-Grenze als unzureichend für den angegebenen Bedarf und die 3,0-A-Grenze als ausreichende Bereitstellungsfähigkeit. Sie erklärt, dass das Gerät bei passender Spannung seinen Betriebsstrom bestimmt und die Maximalangabe nicht als erzwungener Strom wirkt.",
            "expectedPerformanceEn": "The learner confirms that 5 V times 1.5 A equals 7.5 W for a consistent operating point, identifies the 1.0 A limit as insufficient for the stated demand and the 3.0 A limit as adequate capability, and explains that the device determines its operating current at the matching voltage rather than the maximum rating being forced through it.",
            "understandingFocusDe": "Die größere Stromreserve deckt die Fehlvorstellung auf, ein Netzteil drücke stets seinen Maximalstrom in ein Gerät.",
            "understandingFocusEn": "The greater current capability exposes the misconception that a supply always pushes its maximum current through a device."
          },
          {
            "id": "lamp-label-cross-check-with-operating-modes",
            "taskDemandDe": "Ein Modellleuchtmittel besitzt bei 12 V Gleichspannung zwei Betriebsmodi: 0,20 A im Sparmodus und 0,50 A im Hellmodus. Ein Datenblatt nennt zusätzlich 2,4 W und 6,0 W. Ordne die Werte paarweise zu, prüfe sie und beurteile eine Rechnung, die 12 V aus dem Sparmodus mit 0,50 A aus dem Hellmodus und einer Akkuladung in mAh vermischt.",
            "taskDemandEn": "A model lamp has two operating modes at 12 V direct voltage: 0.20 A in economy mode and 0.50 A in bright mode. A data sheet also states 2.4 W and 6.0 W. Pair and check the values, and assess a calculation that mixes 12 V from economy mode with 0.50 A from bright mode and a battery charge in mAh.",
            "expectedPerformanceDe": "Die lernende Person bildet die Paare 12 V, 0,20 A, 2,4 W sowie 12 V, 0,50 A, 6,0 W, hält die Betriebsmodi getrennt und weist die Einheitenmischung mit mAh zurück. Sie erklärt Leistung als momentane Energieübertragungsrate, nicht als Akkuladung.",
            "expectedPerformanceEn": "The learner forms the pairs 12 V, 0.20 A, 2.4 W and 12 V, 0.50 A, 6.0 W, keeps the operating modes separate, and rejects mixing the units with mAh. The learner explains power as a rate of energy transfer, not as battery charge.",
            "understandingFocusDe": "Mehrere Betriebsmodi prüfen, ob nur zusammengehörige Nennwerte physikalisch verknüpft werden.",
            "understandingFocusEn": "Multiple operating modes test whether only paired ratings are connected physically."
          },
          {
            "id": "same-charge-different-voltage-batteries",
            "taskDemandDe": "Akku A ist mit 3,7 V und 2000 mAh, Akku B mit 7,4 V und 2000 mAh angegeben. Vergleiche Ladungsmenge und grobe nominale Energie, beurteile die Behauptung gleicher Laufzeit für jedes beliebige Gerät und nenne die zusätzlichen Bedingungen für eine belastbare Betriebsabschätzung.",
            "taskDemandEn": "Battery A is rated 3.7 V and 2000 mAh, while battery B is rated 7.4 V and 2000 mAh. Compare charge and rough nominal energy, assess the claim of equal runtime for any device, and identify the additional conditions needed for a defensible operating estimate.",
            "expectedPerformanceDe": "Die lernende Person erkennt gleiche Nennladung von 2,0 Ah, schätzt nominal ungefähr 7,4 Wh beziehungsweise 14,8 Wh und erklärt, dass unterschiedliche Spannung, Last, Wirkungsgrad, nutzbare Kapazität und Abschaltgrenze eine pauschale Laufzeitgleichheit ausschließen.",
            "expectedPerformanceEn": "The learner identifies the same rated charge of 2.0 Ah, estimates nominal energies of about 7.4 Wh and 14.8 Wh respectively, and explains that voltage, load, efficiency, usable capacity, and cut-off threshold rule out a blanket claim of equal runtime.",
            "understandingFocusDe": "Gleiche mAh bei verschiedener Spannung trennen Ladungsmenge, Energie und reale Laufzeit.",
            "understandingFocusEn": "Equal mAh at different voltages separates amount of charge, energy, and actual runtime."
          }
        ]
      }
    },
    {
      "goalId": "5be98160-5189-58aa-8183-1df1c400cc8c",
      "profile": {
        "archetype": "data",
        "expectations": [
          {
            "id": "reliable-comparable-data-basis",
            "essentialUnderstandingDe": "Ein fachlich belastbarer Vergleich setzt nachvollziehbare Datenquellen, passende Bezugsgrößen und Einheiten, vergleichbare Systemgrenzen sowie eine erkennbare Datenunsicherheit voraus; Werte mit verschiedenen Bezugsbasen dürfen nicht unmittelbar gegeneinander gewertet werden.",
            "essentialUnderstandingEn": "A scientifically sound comparison requires traceable data sources, suitable reference quantities and units, comparable system boundaries, and identifiable data uncertainty; values based on different reference bases must not be evaluated against one another directly.",
            "observablePerformanceDe": "Die lernende Person prüft für einen unbekannten Datensatz zu mehreren Arten der Energieversorgung Quelle, Bezugsgröße, Einheit, Systemgrenze und Unsicherheit, bringt geeignete Werte auf eine gemeinsame Vergleichsbasis und kennzeichnet Daten, die kein belastbares Urteil tragen.",
            "observablePerformanceEn": "For an unfamiliar data set on several forms of energy supply, the learner checks the source, reference quantity, unit, system boundary, and uncertainty, places suitable values on a common comparison basis, and identifies data that cannot support a sound judgment."
          },
          {
            "id": "explicit-multicriteria-climate-classification",
            "essentialUnderstandingDe": "Physikalische, ökologische, ökonomische und gesellschaftliche Aspekte bezeichnen unterschiedliche Bewertungsperspektiven. Klimawirkungen sind innerhalb dieses Vergleichs anhand fachlich begründeter Zusammenhänge und geeigneter Daten einzuordnen und von anderen Umweltfolgen zu unterscheiden.",
            "essentialUnderstandingEn": "Physical, ecological, economic, and social aspects are distinct evaluation perspectives. Within this comparison, climate impacts must be classified using scientifically justified relationships and suitable data and distinguished from other environmental consequences.",
            "observablePerformanceDe": "Die lernende Person legt konkrete Kriterien für alle vier Perspektiven offen, ordnet die belastbaren Daten den Kriterien zu, erklärt die Klimawirkung der verglichenen Versorgungsarten fachlich und erstellt einen nachvollziehbaren Vergleich, ohne ungleichartige Folgen zu einer scheinbar objektiven Einzelzahl zu vermischen.",
            "observablePerformanceEn": "The learner states concrete criteria for all four perspectives, assigns the reliable data to those criteria, explains the climate impact of the compared supply forms scientifically, and constructs a traceable comparison without combining unlike consequences into an apparently objective single number."
          },
          {
            "id": "balanced-transparent-judgment",
            "essentialUnderstandingDe": "Ein abgewogenes Urteil folgt nicht automatisch aus den Daten: Es verbindet empirische Befunde mit einer offengelegten Gewichtung der Kriterien, berücksichtigt Zielkonflikte und Unsicherheiten und bleibt auf die untersuchten Bedingungen begrenzt.",
            "essentialUnderstandingEn": "A balanced judgment does not follow automatically from the data: it combines empirical findings with an explicit weighting of criteria, accounts for trade-offs and uncertainties, and remains limited to the conditions investigated.",
            "observablePerformanceDe": "Die lernende Person trennt Datenbefund, Kriteriengewichtung und Schlussurteil, begründet ihr Urteil mit konkreten Vor- und Nachteilen, nennt entscheidende Unsicherheiten oder Grenzen und prüft, ob eine veränderte Gewichtung oder Versorgungssituation das Urteil ändern würde.",
            "observablePerformanceEn": "The learner separates the data findings, weighting of criteria, and final judgment, justifies the judgment using specific advantages and disadvantages, states decisive uncertainties or limits, and checks whether a changed weighting or supply situation would alter the judgment."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "reliable-comparable-data-basis",
            "explicit-multicriteria-climate-classification",
            "balanced-transparent-judgment"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "data-quality-and-system-boundary",
            "textDe": "Vollständig vergleichbare Daten oder Daten mit abweichender Bezugsgröße, Systemgrenze, Aktualität beziehungsweise Unsicherheit",
            "textEn": "Fully comparable data or data differing in reference quantity, system boundary, recency, or uncertainty"
          },
          {
            "id": "supply-context",
            "textDe": "Unterschiedliche lokale Verfügbarkeit, zeitlicher Bedarfsverlauf und technische Versorgungsbedingungen",
            "textEn": "Different local availability, temporal demand profiles, and technical supply conditions"
          },
          {
            "id": "criterion-priority",
            "textDe": "Veränderte Gewichtung physikalischer, ökologischer, ökonomischer oder gesellschaftlicher Kriterien",
            "textEn": "Changed weighting of physical, ecological, economic, or social criteria"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "regional-electricity-options-data-audit",
            "taskDemandDe": "Für drei Arten der regionalen Stromversorgung liegen Daten zu nutzbarer Energiebereitstellung, zeitlicher Verfügbarkeit, Klimawirkung, weiteren Umweltfolgen, Kosten und gesellschaftlichen Auswirkungen aus unterschiedlich dokumentierten Quellen vor. Die Datenbasis ist zu prüfen, auf eine gemeinsame Bezugsbasis zu bringen und für einen offengelegten Kriterienvergleich zu verwenden.",
            "taskDemandEn": "For three forms of regional electricity supply, data on usable energy provision, temporal availability, climate impact, other environmental consequences, costs, and social effects are provided from sources documented to different degrees. The data basis must be checked, placed on a common reference basis, and used in a comparison with explicit criteria.",
            "expectedPerformanceDe": "Die lernende Person kennzeichnet Quelle, Einheit, Bezugsgröße, Systemgrenze und Unsicherheit, schließt nicht vergleichbare Angaben begründet aus oder relativiert sie, trennt Klimawirkung von anderen Umweltfolgen und formuliert aus dem kriteriensweisen Vergleich ein bedingtes, datenbezogenes Urteil.",
            "expectedPerformanceEn": "The learner identifies source, unit, reference quantity, system boundary, and uncertainty, excludes or qualifies non-comparable information with justification, distinguishes climate impact from other environmental consequences, and formulates a conditional, data-based judgment from the criterion-by-criterion comparison.",
            "understandingFocusDe": "Die Aufgabe prüft, ob Belastbarkeit und Vergleichbarkeit der Daten vor dem Urteil fachlich untersucht werden, statt vorgelegte Kennzahlen ungeprüft zu rangieren.",
            "understandingFocusEn": "The task checks whether the reliability and comparability of the data are examined scientifically before judgment rather than ranking supplied indicators without scrutiny."
          },
          {
            "id": "changed-demand-and-priority-reassessment",
            "taskDemandDe": "Für dieselben Versorgungsarten werden eine veränderte zeitliche Nachfrage, neue Unsicherheitsintervalle für Klimadaten und eine offen begründete stärkere Gewichtung von Versorgungssicherheit und gesellschaftlichen Auswirkungen vorgegeben. Das frühere Urteil ist unabhängig neu zu prüfen.",
            "taskDemandEn": "For the same supply forms, a changed temporal demand profile, new uncertainty intervals for climate data, and an explicitly justified greater weighting of security of supply and social effects are specified. The earlier judgment must be reassessed independently.",
            "expectedPerformanceDe": "Die lernende Person aktualisiert den physikalischen und klimabezogenen Datenvergleich, macht die neue Kriteriengewichtung sichtbar, benennt fortbestehende Zielkonflikte und revidiert oder verteidigt das Urteil mit einer nachvollziehbaren Trennung von Befund, Gewichtung und Schlussfolgerung.",
            "expectedPerformanceEn": "The learner updates the physical and climate-related data comparison, makes the new weighting explicit, identifies remaining trade-offs, and revises or defends the judgment while clearly separating findings, weighting, and conclusion.",
            "understandingFocusDe": "Der veränderte Fall zeigt, ob das Urteil transparent auf Daten, Bedingungen und Wertgewichtungen reagiert, statt als allgemeingültige Rangfolge wiederholt zu werden.",
            "understandingFocusEn": "The changed case reveals whether the judgment responds transparently to data, conditions, and value weightings rather than being repeated as a universally valid ranking."
          }
        ]
      }
    },
    {
      "goalId": "7c986fca-1129-5eff-a17e-0a04bb7346ee",
      "profile": {
        "archetype": "concept",
        "expectations": [
          {
            "id": "astronomical-scales",
            "essentialUnderstandingDe": "AE, Lichtjahr und Parsec bezeichnen Entfernungen; Sonnenmasse und Sonnenleuchtkraft sind Bezugsgrößen für Masse bzw. abgegebene Strahlungsleistung.",
            "essentialUnderstandingEn": "AU, light-year and parsec measure distance; solar mass and solar luminosity are reference quantities for mass and emitted radiative power.",
            "observablePerformanceDe": "Die lernende Person wählt zu gegebenen astronomischen Größen passende Einheiten, erläutert deren Bedeutung und stellt mit bereitgestellten Umrechnungen einen sinnvollen Größenordnungsvergleich her.",
            "observablePerformanceEn": "The learner chooses suitable units for supplied astronomical quantities, explains their meaning and makes a meaningful order-of-magnitude comparison using supplied conversions."
          },
          {
            "id": "comparison-not-number-size",
            "essentialUnderstandingDe": "Zahlenwerte sind nur bei passenden Bezugsgrößen vergleichbar; Lichtjahr ist keine Zeit und Leuchtkraft ist nicht die am Beobachtungsort empfangene Helligkeit.",
            "essentialUnderstandingEn": "Numbers are comparable only with appropriate reference quantities; a light-year is not a time and luminosity is not brightness received at the observer.",
            "observablePerformanceDe": "Die lernende Person ordnet einen zweiten Datensatz trotz gemischter Einheiten ein und erklärt, welche physikalischen Vergleiche durch die Angaben gestützt werden und welche nicht.",
            "observablePerformanceEn": "The learner interprets a second dataset despite mixed units and explains which physical comparisons the entries support and which they do not."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "astronomical-scales",
            "comparison-not-number-size"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "scale-range",
            "textDe": "Sonnensystem und naher Stern gegenüber größerer Sternentfernung und stark verschiedener Leuchtkraft.",
            "textEn": "Solar system and nearby star versus greater stellar distance and widely different luminosities."
          },
          {
            "id": "unit-representation",
            "textDe": "Astronomische Bezugsgrößen gegenüber SI-Angaben und gemischten Entfernungseinheiten.",
            "textEn": "Astronomical reference quantities versus SI entries and mixed distance units."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "solar-system-near-star",
            "taskDemandDe": "Gegeben: 1 AE≈1,50·10¹¹ m, 1 Lj≈9,46·10¹⁵ m, 1 M☉≈1,99·10³⁰ kg, 1 L☉≈3,83·10²⁶ W. Ein Modellplanet umkreist einen Stern in 2 AE; dessen Masse ist 1 M☉, Leuchtkraft 0,5 L☉. Ein Nachbarstern ist 4 Lj entfernt. Beschreibe und ordne diese vier Größen ein.",
            "taskDemandEn": "Given: 1 AU≈1.50·10¹¹ m, 1 ly≈9.46·10¹⁵ m, 1 M☉≈1.99·10³⁰ kg, 1 L☉≈3.83·10²⁶ W. A model planet orbits a star at 2 AU; the star has mass 1 M☉ and luminosity 0.5 L☉. A neighbouring star is 4 ly away. Describe and classify these four quantities.",
            "expectedPerformanceDe": "Ordnet 3,00·10¹¹ m, 1,99·10³⁰ kg, 1,915·10²⁶ W und 3,784·10¹⁶ m zu; die Sternentfernung ist etwa 1,26·10⁵-mal der Modellbahnradius. Erklärt, warum AE für planetare und Lj für stellare Entfernungen handlich sind und Lichtjahr eine Strecke bezeichnet.",
            "expectedPerformanceEn": "Assigns 3.00·10¹¹ m, 1.99·10³⁰ kg, 1.915·10²⁶ W and 3.784·10¹⁶ m; the stellar distance is about 1.26·10⁵ times the model orbital radius. Explains why AU is convenient for planetary and ly for stellar distances and why a light-year denotes length.",
            "understandingFocusDe": "Angemessene Bezugsgrößen machen sehr unterschiedliche astronomische Skalen vergleichbar.",
            "understandingFocusEn": "Suitable reference quantities make very different astronomical scales comparable."
          },
          {
            "id": "mixed-stellar-catalogue",
            "taskDemandDe": "Ein unabhängiger Modellkatalog gibt Stern A: Entfernung 3 pc, Masse 0,2 M☉, Leuchtkraft 0,01 L☉; Stern B: Entfernung 12 Lj, Masse 2 M☉, Leuchtkraft 20 L☉. Gegeben 1 pc≈3,26 Lj. Vergleiche Entfernung, Masse und Leuchtkraft; was folgt daraus nicht unmittelbar über die auf der Erde wahrgenommene Helligkeit?",
            "taskDemandEn": "An independent model catalogue gives star A: distance 3 pc, mass 0.2 M☉, luminosity 0.01 L☉; star B: distance 12 ly, mass 2 M☉, luminosity 20 L☉. Given 1 pc≈3.26 ly. Compare distance, mass and luminosity; what does this not immediately establish about brightness perceived on Earth?",
            "expectedPerformanceDe": "Rechnet 3 pc≈9,78 Lj um und ordnet A als näher ein; B besitzt zehnfache Masse und 2000-fache Leuchtkraft. Erklärt drei verschiedene Größenvergleiche und Leuchtkraft als ausgesandte Leistung; eine wahrgenommene Helligkeit verlangt zusätzlich Ausbreitungs-, Spektral- und Beobachtungsbedingungen, nicht bloß den Leuchtkraftwert.",
            "expectedPerformanceEn": "Converts 3 pc≈9.78 ly and identifies A as nearer; B has ten times the mass and 2000 times the luminosity. Explains three different quantity comparisons and luminosity as emitted power; perceived brightness additionally requires propagation, spectral and observational conditions, not merely a luminosity number.",
            "understandingFocusDe": "Gemischte Einheiten und verschiedene Größenarten dürfen nicht über bloße Zahlenrangfolgen verglichen werden.",
            "understandingFocusEn": "Mixed units and different quantity types cannot be compared by numerical ranking alone."
          }
        ]
      }
    },
    {
      "goalId": "49bb609a-bfb7-5391-9120-f5fc737efb9a",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "stellar-occultation",
            "essentialUnderstandingDe": "Ein Transit schwächt das beobachtete Sternlicht ab, wenn ein Begleiter vor der scheinbaren Sternscheibe vorbeizieht. Wiederholung kann ein periodisches Umlaufmodell stützen, ist allein jedoch kein eindeutiger Planetennachweis.",
            "essentialUnderstandingEn": "A transit attenuates observed starlight when a companion crosses the apparent stellar disc. Recurrence can support a periodic orbital model but alone is not unambiguous proof of a planet.",
            "observablePerformanceDe": "Die lernende Person deutet eine neue Helligkeitskurve kausal, benennt wessen Licht beobachtet wird und verbindet wiederkehrende kurze Einbrüche mit einem möglichen Umlauf, ohne andere Ursachen ungeprüft auszuschließen.",
            "observablePerformanceEn": "The learner causally interprets a fresh light curve, identifies whose light is observed, and connects recurring brief dips to a possible orbit without excluding other causes uncritically."
          },
          {
            "id": "viewing-geometry",
            "essentialUnderstandingDe": "Nur geeignete Blickrichtungen führen zum Transit; ein vorhandener Planet kann den Stern vom Beobachtungsort aus nie verdecken.",
            "essentialUnderstandingEn": "Only suitable viewing directions produce a transit; an existing planet may never occult its star as seen from the observer.",
            "observablePerformanceDe": "Die lernende Person entwirft oder erklärt einen frischen nichttransitierenden Gegenfall und begründet, warum eine konstante Lichtkurve keinen allgemeinen Ausschluss erlaubt.",
            "observablePerformanceEn": "The learner constructs or explains a fresh nontransiting counterexample and justifies why a constant light curve does not permit a general exclusion."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "stellar-occultation",
            "viewing-geometry"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "physical-condition-change",
            "textDe": "Periodische kurze Einbrüche gegenüber einer einzelnen Abschwächung; kantennahe Sicht gegenüber einer Bahn in der Himmelsebene.",
            "textEn": "Recurring brief dips versus a single dimming; nearly edge-on viewing versus an orbit in the plane of the sky."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "fresh-repeating-dips",
            "taskDemandDe": "Eine neue Sternlichtkurve zeigt kurze gleichartige Absenkungen bei 0, 4 und 8 Tagen, dazwischen annähernd konstantes Licht. Erkläre ein mögliches Stern-Planet-Modell und welche Wiederholungszeit es nahelegt. Eine mögliche alternative Ursache soll offen bleiben.",
            "taskDemandEn": "A fresh stellar light curve shows brief similar dips at 0, 4, and 8 days, with approximately constant light between. Explain a possible star–planet model and its suggested recurrence time, leaving a possible alternative cause open.",
            "expectedPerformanceDe": "Ein vor dem Stern vorbeiziehender Begleiter verdeckt einen Teil des Sternlichts; das einfache Modell legt 4 Tage nahe. Es wird nicht die Helligkeit des Planeten gemessen. Etwa ein bedeckender stellarer Begleiter oder systematische Messfehler müssten zusätzlich geprüft werden.",
            "expectedPerformanceEn": "A companion crossing in front of the star blocks some starlight; the simple model suggests 4 days. The planet’s brightness is not being measured. An eclipsing stellar companion or systematic measurement error, for example, needs further checking.",
            "understandingFocusDe": "Eigenständige Signal-zu-Geometrie-Deutung mit begrenzter Nachweisaussage.",
            "understandingFocusEn": "Independent signal-to-geometry interpretation with a bounded detection claim."
          },
          {
            "id": "grazing-transit-with-data-gap",
            "taskDemandDe": "Eine neue Lichtkurve zeigt einen flachen, nur teilweise erfassten Helligkeitseinbruch an Tag 1 und einen ähnlichen an Tag 7; um Tag 13 fehlt das Messfenster. Skizziere eine mögliche streifende Transitgeometrie, sage für Tag 13 eine begründete Erwartung voraus und erläutere, weshalb die Daten weder einen Planeten beweisen noch durch die Messlücke widerlegen.",
            "taskDemandEn": "A new light curve shows a shallow, only partly sampled brightness dip on day 1 and a similar one on day 7; the observing window around day 13 is missing. Sketch a possible grazing-transit geometry, make a justified prediction for day 13, and explain why the data neither prove a planet nor disprove one because of the gap.",
            "expectedPerformanceDe": "Die lernende Person erkennt die mögliche Sechstagesperiode, konstruiert eine streifende Bahn mit nur teilweiser Überdeckung, erwartet um Tag 13 einen weiteren möglichen Einbruch und trennt diese Kandidatenerklärung von Beweis und Messlücke.",
            "expectedPerformanceEn": "The learner identifies the possible six-day period, constructs a grazing orbit with only partial overlap, expects another possible dip around day 13, and distinguishes this candidate explanation from proof and from the observing gap.",
            "understandingFocusDe": "Frischer Transfer von Periodizität und Projektionsgeometrie auf unvollständige Messfenster statt Nacherzählung des vollständigen Bildbeispiels.",
            "understandingFocusEn": "Fresh transfer of periodicity and projection geometry to incomplete observing windows rather than retelling the complete image example."
          }
        ]
      }
    },
    {
      "goalId": "5c0d5040-92e4-50f6-9695-9d33d889a080",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "justified-transfer",
            "essentialUnderstandingDe": "Übertragbare physikalische Beziehungen müssen mit den Größen und Grenzen des Forschungsmodells verknüpft werden; eine bekannte Formel allein ersetzt diese Zuordnung nicht.",
            "essentialUnderstandingEn": "Transferable physical relationships must be connected to quantities and limits of the research model; a familiar formula alone does not replace that mapping.",
            "observablePerformanceDe": "Wählt und begründet eine passende Beziehung, legt System, Größen, Annahmen und Einheiten fest und erzeugt eine prüfbare quantitative Vorhersage.",
            "observablePerformanceEn": "Selects and justifies a suitable relationship, defines system, quantities, assumptions and units and generates a testable quantitative prediction."
          },
          {
            "id": "comparison-and-limit",
            "essentialUnderstandingDe": "Eine Modellvorhersage wird mit Daten samt Messgrenzen verglichen; Vereinbarkeit ist kein eindeutiger Nachweis der Modellursache.",
            "essentialUnderstandingEn": "A model prediction is compared with data and measurement limits; compatibility is not a unique demonstration of the modeled cause.",
            "observablePerformanceDe": "Prüft einen berechneten Wert oder zulässigen Bereich an bereitgestellten Daten, berücksichtigt Unsicherheit und benennt eine konkrete Grenze des übertragenen Modells.",
            "observablePerformanceEn": "Checks a calculated value or admissible range against supplied data, accounts for uncertainty and names a specific limit of the transferred model."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "justified-transfer",
            "comparison-and-limit"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "transferred-method",
            "textDe": "Optische Phasenänderung im Einzeldetektormodell gegenüber Laufzeitgrenze zwischen zwei Messorten.",
            "textEn": "Optical phase change in a single-detector model versus propagation-time bound between two sites."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "interferometer-scale",
            "taskDemandDe": "Vorgeschlagener Forschungsfall, einfaches Michelson-Modell: ΔL=δLₓ−δLᵧ ist die Änderung der Differenz der beiden Armlängen, L ihre gemeinsame Ruhelänge und h=ΔL/L die projizierte differentielle Dehnung. Für den Hin-und-Rückweg gilt Δφ=4πΔL/λ. Gegeben: L=4,0 km, h=1,0·10⁻²¹, λ=1064 nm. Eine synthetische Auswertung liefert Δφ=(4,8±0,5)·10⁻¹¹ rad. Berechne und vergleiche; das Modell ignoriert reale Resonatoren und Regelungen.",
            "taskDemandEn": "Proposed research case, simple Michelson model: ΔL=δLₓ−δLᵧ is the change in the difference between the two arm lengths, L is their common unperturbed length, and h=ΔL/L is the projected differential strain. The out-and-back path gives Δφ=4πΔL/λ. Given L=4.0 km, h=1.0·10⁻²¹, λ=1064 nm, a synthetic analysis gives Δφ=(4.8±0.5)·10⁻¹¹ rad. Calculate and compare; the model ignores real cavities and control systems.",
            "expectedPerformanceDe": "Ordnet ΔL der Änderung der Armlängendifferenz und Δφ dem Lichtvergleich zu; erklärt den Faktor 2 für den Hin-und-Rückweg zur Phasenbeziehung. Erhält ΔL=4,0·10⁻¹⁸ m und Δφ≈4,72·10⁻¹¹ rad. Stellt Vereinbarkeit mit dem Datenintervall fest, nicht einen eindeutigen Wellennachweis, und nennt die vereinfachte Instrumentantwort.",
            "expectedPerformanceEn": "Maps ΔL to the change in arm-length difference and Δφ to the light comparison; explains the factor of 2 for the out-and-back path in the phase relation. Obtains ΔL=4.0·10⁻¹⁸ m and Δφ≈4.72·10⁻¹¹ rad. Establishes compatibility with the data interval, not unique wave detection, and names the simplified instrument response.",
            "understandingFocusDe": "Begründeter Optiktransfer mit Größenordnung und Datenprüfung.",
            "understandingFocusEn": "Justified transfer of optics with scale and data checking."
          },
          {
            "id": "two-site-timing",
            "taskDemandDe": "Im vorgeschlagenen Forschungsfall seien zwei Messorte 3000 km voneinander entfernt; eine gemeinsame ebene Störung breite sich mit c=3,0·10⁸ m/s aus. Prüfe synthetische Laufzeitdifferenzen 7,0±0,2 ms und 12,0±0,2 ms bei als korrekt angenommenen Uhren.",
            "taskDemandEn": "In the proposed research case two sites are 3000 km apart; a common plane disturbance propagates at c=3.0·10⁸ m/s. Assess synthetic time differences of 7.0±0.2 ms and 12.0±0.2 ms with clocks assumed correct.",
            "expectedPerformanceDe": "Leitet |Δt|≤d/c=10 ms aus der maximalen Wegdifferenz ab. 7,0±0,2 ms ist vereinbar, 12,0±0,2 ms nicht. Erklärt die Abhängigkeit von Einfallsrichtung und dass passende Zeitlage allein Quelle und Störungsart nicht beweist.",
            "expectedPerformanceEn": "Derives |Δt|≤d/c=10 ms from the maximum path difference. 7.0±0.2 ms is compatible and 12.0±0.2 ms is not. Explains dependence on arrival direction and that compatible timing alone does not prove source or disturbance type.",
            "understandingFocusDe": "Transfer einer Ausbreitungsgrenze statt Wiederholung der optischen Rechnung.",
            "understandingFocusEn": "Transfer of a propagation bound rather than repetition of the optical calculation."
          }
        ]
      }
    },
    {
      "goalId": "d3c153b9-e09b-5668-8386-73105546a7c1",
      "profile": {
        "archetype": "experiment",
        "expectations": [
          {
            "id": "question-controls",
            "essentialUnderstandingDe": "Ein aussagekräftiger Versuch verbindet eine prüfbare Frage mit gezielter Variation, beobachteter Messgröße und kontrollierten Bedingungen.",
            "essentialUnderstandingEn": "An informative experiment connects a testable question with deliberate variation, a measured response and controlled conditions.",
            "observablePerformanceDe": "Die lernende Person plant für eine neue Frage einen geeigneten Aufbau, nennt unabhängige und abhängige Größe, Kontrollen, Messverfahren und angemessene Sicherheitsmaßnahmen.",
            "observablePerformanceEn": "The learner plans a suitable setup for a fresh question and identifies independent and dependent quantities, controls, measurement method and proportionate safety."
          },
          {
            "id": "record-and-infer",
            "essentialUnderstandingDe": "Messdaten benötigen Größen, Einheiten und Streuungs-/Auflösungsangaben; Diagramme oder einfache Mathematisierung erlauben begrenzte Schlüsse statt einer vorausgesetzten Modellbestätigung.",
            "essentialUnderstandingEn": "Measurements require quantities, units and scatter/resolution information; plots or simple mathematization permit limited conclusions rather than assumed model confirmation.",
            "observablePerformanceDe": "Die lernende Person erstellt ein nachvollziehbares Messprotokoll, wertet frische Daten in einer passenden Darstellung aus und trennt gemessene Werte, daraus berechnete Größen und Schlussfolgerungen einschließlich Unsicherheit.",
            "observablePerformanceEn": "The learner creates a reproducible measurement record, analyses fresh data in a suitable representation and separates measured values, calculated quantities and conclusions including uncertainty."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "question-controls",
            "record-and-infer"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "measurement-principle",
            "textDe": "Direkte Längenmessung gegenüber zeitlicher Mehrfachmessung mit anschließender Mittelung.",
            "textEn": "Direct length measurement versus timing multiple cycles and averaging."
          },
          {
            "id": "data-relationship",
            "textDe": "Annähernd proportionaler Zusammenhang gegenüber sichtbar nichtlinearer Abhängigkeit.",
            "textEn": "Approximately proportional relationship versus visibly nonlinear dependence."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "spring-extension-plan",
            "taskDemandDe": "Plane die sichere Untersuchung, wie die Verlängerung einer kleinen hängenden Feder von angehängter Masse abhängt, innerhalb eines vorgegebenen elastischen Bereichs bis 150 g. Werte danach frische bereitgestellte Daten aus: m=0/50/100/150 g, Verlängerung 0,0/1,0/2,1/3,0 cm, Ableseunsicherheit ±0,1 cm. Keine schwere Last und kein Dehnen über die vorgegebene Grenze.",
            "taskDemandEn": "Plan a safe investigation of how a small suspended spring's extension depends on attached mass, within a supplied elastic range up to 150 g. Then analyse fresh supplied data: m=0/50/100/150 g, extension 0.0/1.0/2.1/3.0 cm, reading uncertainty ±0.1 cm. No heavy load or stretching beyond the supplied limit.",
            "expectedPerformanceDe": "Plant festen Aufhängepunkt, Null-/Längenablesung nach Beruhigung, schrittweise Massenvariation und Wiederholungen bei gleicher Feder; sichert kleine Lasten. Erstellt Tabelle/Diagramm mit Einheiten und Unsicherheit, beschreibt annähernd 1 cm je 50 g als im Bereich verträglich und prüft die 2,1-cm-Abweichung gegen die Auflösung. Unterscheidet abgelesene Länge, berechnete Verlängerung und begrenzte Zusammenhangsaussage.",
            "expectedPerformanceEn": "Plans a fixed support, zero/length reading after settling, stepwise mass variation and repetitions with the same spring; secures small loads. Creates a table/plot with units and uncertainty, describes approximately 1 cm per 50 g as compatible in this range and checks the 2.1-cm deviation against resolution. Distinguishes read length, calculated extension and the bounded relationship claim.",
            "understandingFocusDe": "Ein einfacher Zusammenhang wird aus geordneten kontrollierten Messungen erschlossen.",
            "understandingFocusEn": "A simple relationship is inferred from structured controlled measurements."
          },
          {
            "id": "pendulum-timing-plan",
            "taskDemandDe": "Plane unabhängig eine Untersuchung der Periodendauer eines kleinen Pendels in Abhängigkeit von seiner Länge, bei kleiner gleicher Anfangsauslenkung. Frische Daten für zehn Perioden: L=0,25/0,50/1,00 m; Zeiten je zweimal 10,0/10,2 s, 14,1/14,3 s, 20,0/20,2 s. Die Stoppuhrablesung je Gesamtzeit sei etwa ±0,2 s. Werte ohne vorgegebene Pendelformel aus; nutze kleinen weichen Pendelkörper und freien Schwingbereich.",
            "taskDemandEn": "Independently plan an investigation of a small pendulum's period versus length at the same small initial angle. Fresh data for ten periods: L=0.25/0.50/1.00 m; two times each 10.0/10.2 s, 14.1/14.3 s, 20.0/20.2 s. Stopwatch reading uncertainty per total time is about ±0.2 s. Analyse without a supplied pendulum formula; use a small soft bob and clear swing space.",
            "expectedPerformanceDe": "Beschreibt Längenmessung bis zum Schwerpunkt, kontrollierte Auslenkung, einheitlichen Start-/Enddurchgang und Wiederholung. Ermittelt mittlere Perioden 1,01/1,42/2,01 s; die Ableseunsicherheit pro Periodenwert liegt größenordnungsmäßig bei 0,02 s, ohne systematische Zeitfehler auszuschließen. Zeichnet T gegen L und begründet zunehmenden, nicht proportionalen Zusammenhang; eine genaue allgemeine Gesetzesform folgt daraus noch nicht.",
            "expectedPerformanceEn": "Describes length measurement to the centre of mass, controlled amplitude, consistent start/end crossing and repetition. Obtains mean periods 1.01/1.42/2.01 s; reading uncertainty per period is of order 0.02 s without excluding systematic timing errors. Plots T against L and explains an increasing, nonproportional relationship; these data alone do not establish an exact general law.",
            "understandingFocusDe": "Verfahrenswahl und Mittelung verbessern Messbarkeit, ersetzen aber keine Unsicherheits- und Modellprüfung.",
            "understandingFocusEn": "Choice of procedure and averaging improve measurability but do not replace uncertainty and model checks."
          }
        ]
      }
    },
    {
      "goalId": "d2e6f87d-795b-5631-a7cc-0bfb5dc5142e",
      "profile": {
        "archetype": "data",
        "expectations": [
          {
            "id": "quellenbezug",
            "essentialUnderstandingDe": "Physikalisch relevante Information hängt von Fragestellung, Größe, Einheit und Randbedingungen der Quelle ab; eine Zahl ohne diese Bezüge ist nicht vergleichbar.",
            "essentialUnderstandingEn": "Physically relevant information depends on the question, quantity, unit, and source conditions; a number without these links is not comparable.",
            "observablePerformanceDe": "Entnimmt Angaben mit Herkunft und Bedingungen, ordnet relevante und irrelevante Inhalte und stellt vergleichbare Aussagen zusammen.",
            "observablePerformanceEn": "Extracts information with provenance and conditions, separates relevant from irrelevant content, and assembles comparable statements."
          },
          {
            "id": "fachabgleich",
            "essentialUnderstandingDe": "Ein Abgleich mit bekannten Beziehungen kann Widersprüche oder Grenzen einer Quellenbehauptung zeigen, ohne fehlende Daten zu ersetzen.",
            "essentialUnderstandingEn": "Comparison with known relationships can reveal contradictions or limits in a source claim without replacing missing data.",
            "observablePerformanceDe": "Prüft eine konkrete Behauptung mit passenden physikalischen Größen und kennzeichnet ausdrücklich, was sich aus den Quellen nicht entscheiden lässt.",
            "observablePerformanceEn": "Tests a specific claim using appropriate physical quantities and explicitly states what the sources cannot decide."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "quellenbezug",
            "fachabgleich"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "quellenkonflikt",
            "textDe": "Unvereinbare Einheiten-/Leistungsbehauptung gegenüber unterschiedlicher Systemgrenze und ausgelassenen Verlusten.",
            "textEn": "Incompatible unit/power claim versus a different system boundary and omitted losses."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "leuchtmittelquellen",
            "taskDemandDe": "Nutze drei ausdrücklich fiktive Quellenkarten: A, Messblatt, Lampe 8 W bei 800 lm; B, Werbetext, Vergleichslampe 40 W bei ebenfalls 800 lm, Behauptung 'fünfmal so viel elektrische Energie in einer Stunde'; C, Verpackung, Farbe des Gehäuses blau. Ordne Informationen für die Frage nach elektrischer Energie bei gleicher Lichtstromangabe und prüfe B.",
            "taskDemandEn": "Use three explicitly fictional source cards: A, measurement sheet, lamp 8 W at 800 lm; B, advertising text, comparison lamp 40 W at the same 800 lm, claiming 'five times as much electrical energy in one hour'; C, packaging, blue housing. Organize information about electrical energy at equal stated luminous flux and test B.",
            "expectedPerformanceDe": "Verweist auf A/B, verwendet E=P·t: 8 Wh und 40 Wh in einer Stunde, Verhältnis 5; die Behauptung gilt bei dieser Betriebsdauer und diesen Leistungswerten. Gehäusefarbe ist dafür irrelevant. Gleiche Lumen allein belegen weder gleichen Lichtkegel noch gleiche Lebensdauer; keine zusätzliche Qualitätsbewertung wird erfunden.",
            "expectedPerformanceEn": "References A/B and uses E=P·t: 8 Wh and 40 Wh in one hour, ratio 5; the claim holds for this duration and these power values. Housing colour is irrelevant. Equal lumens alone establish neither equal beam pattern nor equal service life; no additional quality assessment is invented.",
            "understandingFocusDe": "Fragestellungsbezogene Quellenordnung mit überprüfbarem Größenabgleich.",
            "understandingFocusEn": "Question-focused organization of sources with a checkable comparison of quantities."
          },
          {
            "id": "pumpenquellen",
            "taskDemandDe": "Fiktive Quellenkarten: A nennt 12 W elektrische Aufnahme einer Pumpe; B nennt 9 W mechanische Abgabe am Pumpenantrieb unter denselben Bedingungen; C behauptet, daraus folgten 12 W Nutzleistung im angehobenen Wasser; Förderhöhe und Durchfluss fehlen. Werte die Quellen für den Energieübertragungsweg aus.",
            "taskDemandEn": "Fictional source cards: A gives a pump's electrical input as 12 W; B gives 9 W mechanical output at the pump drive under the same conditions; C claims that this implies 12 W useful power in the raised water; head and flow rate are missing. Evaluate the sources for the energy-transfer path.",
            "expectedPerformanceDe": "Ordnet 12 W dem Eingang und 9 W einer späteren Schnittstelle zu; 3 W gehen schon bis dort in andere Übertragungen, η=0,75 für diesen Teil. C ist unter den gegebenen Bedingungen nicht gedeckt. Die Wasser-Nutzleistung ist ohne weitere Daten nicht exakt bestimmbar und kann hier höchstens 9 W sein; die fehlende Systemgrenze wird benannt.",
            "expectedPerformanceEn": "Assigns 12 W to the input and 9 W to a later interface; 3 W already goes to other transfers, with η=0.75 for that segment. C is unsupported under the given conditions. Useful water power cannot be determined exactly without further data and can be at most 9 W here; identifies the missing system boundary.",
            "understandingFocusDe": "Quellenangaben zu verschiedenen Schnittstellen nicht als dieselbe Größe behandeln.",
            "understandingFocusEn": "Do not treat source values at different interfaces as the same quantity."
          }
        ]
      }
    },
    {
      "goalId": "45bbdf6b-6372-5b6a-b7e4-be15a0eb4b83",
      "profile": {
        "archetype": "experiment",
        "expectations": [
          {
            "id": "controlled-force-deformation-measurement",
            "essentialUnderstandingDe": "Der Zusammenhang wird geprüft, indem am selben elastischen Körper die Kraft als unabhängige Größe systematisch verändert, die Verformung relativ zu einer unbelasteten Referenz gemessen und andere Bedingungen möglichst konstant gehalten werden.",
            "essentialUnderstandingEn": "The relationship is tested by systematically varying force as the independent quantity on the same elastic body, measuring deformation relative to an unloaded reference, and keeping other conditions as constant as possible.",
            "observablePerformanceDe": "Die lernende Person plant oder führt eine sichere Messreihe mit benannten Größen, Einheiten, Nullpunkt, ausreichend vielen Belastungsstufen und mindestens einer Wiederholungsmessung aus und dokumentiert die Werte nachvollziehbar in einer Tabelle.",
            "observablePerformanceEn": "The learner plans or carries out a safe measurement series with named quantities, units, a zero reference, enough load levels, and at least one repeated measurement, and documents the values traceably in a table."
          },
          {
            "id": "proportional-range-evidence",
            "essentialUnderstandingDe": "Kraft und Verformung sind nur in einem Messbereich proportional, wenn das Verhältnis der Größen dort innerhalb der Messstreuung konstant ist beziehungsweise ein geeigneter Graph näherungsweise eine Gerade durch den Ursprung bildet; eine beliebige Gerade mit Achsenabschnitt genügt nicht.",
            "essentialUnderstandingEn": "Force and deformation are proportional only over a measurement range in which their ratio is constant within measurement scatter, or an appropriate graph is approximately a straight line through the origin; an arbitrary straight line with an intercept is not sufficient.",
            "observablePerformanceDe": "Die lernende Person erstellt und beschriftet einen geeigneten Graphen, prüft Verhältnis oder Ausgleichsgerade samt Nullpunkt und markiert den durch Daten gestützten proportionalen Bereich, statt die gesamte Messreihe pauschal proportional zu nennen.",
            "observablePerformanceEn": "The learner creates and labels an appropriate graph, checks the ratio or fitted line including the origin, and marks the data-supported proportional range instead of declaring the entire series proportional."
          },
          {
            "id": "departure-and-uncertainty-diagnosis",
            "essentialUnderstandingDe": "Abweichungen können aus Messunsicherheit, Nullpunktfehlern oder dem Verlassen des elastisch-proportionalen Bereichs stammen; bleibende Verformung und systematische Krümmung sind nicht durch bloßes Mitteln zu beseitigen.",
            "essentialUnderstandingEn": "Deviations can arise from measurement uncertainty, zero error, or leaving the elastic proportional range; permanent deformation and systematic curvature cannot be removed by simple averaging.",
            "observablePerformanceDe": "Die lernende Person unterscheidet Streuung von einer systematischen Abweichung, prüft nach Entlastung die Rückkehr zur Ausgangslänge und begrenzt ihre Aussage auf den tatsächlich untersuchten Körper und Messbereich.",
            "observablePerformanceEn": "The learner distinguishes scatter from systematic deviation, checks return to the original length after unloading, and limits the conclusion to the body and measurement range actually investigated."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "controlled-force-deformation-measurement",
            "proportional-range-evidence",
            "departure-and-uncertainty-diagnosis"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "elastic-body",
            "textDe": "Schraubenfeder, Gummiband oder ein anderer elastischer Körper mit unterschiedlichem Arbeitsbereich",
            "textEn": "Coil spring, elastic band, or another elastic body with a different working range"
          },
          {
            "id": "deviation-pattern",
            "textDe": "Zufällige Streuung, Nullpunktverschiebung oder systematische Krümmung bei hoher Belastung",
            "textEn": "Random scatter, zero offset, or systematic curvature at high load"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "spring-load-series",
            "taskDemandDe": "Für eine sicher befestigte Feder sind Belastungskraft und Verlängerung von null bis zu einer vorgegebenen sicheren Höchstlast zu messen, tabellarisch und grafisch darzustellen und der proportionale Bereich zu begründen.",
            "taskDemandEn": "For a safely secured spring, load force and extension must be measured from zero to a specified safe maximum load, represented in a table and graph, and the proportional range justified.",
            "expectedPerformanceDe": "Die lernende Person verwendet eine unbelastete Referenz, variiert nur die Last, beschriftet beide Größen mit Einheiten, prüft Verhältnis und Ursprungslage und nennt den Bereich, in dem die Abweichungen mit der Streuung vereinbar sind.",
            "expectedPerformanceEn": "The learner uses an unloaded reference, varies only the load, labels both quantities with units, checks the ratio and origin, and states the range in which deviations are compatible with the scatter.",
            "understandingFocusDe": "Die Proportionalität wird aus einer kontrollierten Messreihe begründet und nicht aus einem einzelnen Wertepaar behauptet.",
            "understandingFocusEn": "Proportionality is justified from a controlled measurement series rather than asserted from a single pair of values."
          },
          {
            "id": "elastic-band-fresh-data",
            "taskDemandDe": "Eine neue digitale Messreihe eines Gummibands zeigt geringe Streuung bei kleinen Kräften, eine gekrümmte Fortsetzung und nach hoher Belastung einen verschobenen Nullwert. Der vertretbare Proportionalitätsbereich und die Aussagegrenzen sind unabhängig zu bestimmen.",
            "taskDemandEn": "A new digital data set for an elastic band shows small scatter at low forces, a curved continuation, and a shifted zero value after high loading. The defensible proportional range and limits of the conclusion must be determined independently.",
            "expectedPerformanceDe": "Die lernende Person beschränkt die Proportionalitätsaussage auf den gestützten Anfangsbereich, deutet Krümmung und verschobenen Nullwert als systematische Hinweise und lehnt eine Ausgleichsgerade über alle Punkte nachvollziehbar ab.",
            "expectedPerformanceEn": "The learner restricts the proportionality claim to the supported initial range, interprets curvature and the shifted zero as systematic indicators, and gives a reasoned rejection of a fitted line through all points.",
            "understandingFocusDe": "Der Transfer deckt die Fehlvorstellung auf, jede annähernd steigende Messreihe sei über den ganzen Bereich proportional.",
            "understandingFocusEn": "The transfer exposes the misconception that every approximately increasing data series is proportional over its full range."
          }
        ]
      }
    },
    {
      "goalId": "05af2893-0201-4d7f-985b-272d7b88e26e",
      "profile": {
        "archetype": "concept",
        "expectations": [
          {
            "id": "lineare-rueckstellung",
            "essentialUnderstandingDe": "Bei Auslenkung x von der Gleichgewichtslage bedeutet F=-Dx eine zur Auslenkung proportionale, entgegengesetzte resultierende Rückstellkraft; D>0 hat die Einheit N/m.",
            "essentialUnderstandingEn": "For displacement x from equilibrium, F=-Dx means a resultant restoring force proportional and opposite to displacement; D>0 has units N/m.",
            "observablePerformanceDe": "Deutet Vorzeichen und Steigung einer Kraft-Auslenkungs-Darstellung und sagt die Kraftrichtung für positive, negative und verschwindende Auslenkung voraus.",
            "observablePerformanceEn": "Interprets the sign and slope of a force-displacement representation and predicts force direction for positive, negative, and zero displacement."
          },
          {
            "id": "harmonische-idealisierung",
            "essentialUnderstandingDe": "Lineare Rückstellung ermöglicht die harmonische Bewegung eines Systems mit konstanter Masse unter vernachlässigbarer Dämpfung und ohne zusätzlichen Antrieb; das Hooke-Modell besitzt einen Gültigkeitsbereich.",
            "essentialUnderstandingEn": "Linear restoration permits harmonic motion for constant mass with negligible damping and no additional drive; the Hooke model has a validity range.",
            "observablePerformanceDe": "Begründet aus der Form der Rückstellkraft, in welchem Bereich die harmonische Idealisierung passt, und unterscheidet Federdehnung von Auslenkung um ein verschobenes Gleichgewicht.",
            "observablePerformanceEn": "Uses the restoring-force form to justify the range of harmonic idealization and distinguishes spring extension from displacement about a shifted equilibrium."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "lineare-rueckstellung",
            "harmonische-idealisierung"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "nullpunkt-modellbereich",
            "textDe": "Horizontale Feder gegenüber vertikaler Feder mit verschobener Gleichgewichtslage; linearer Teilbereich gegenüber zusätzlichem nichtlinearem Kraftanteil.",
            "textEn": "Horizontal spring versus vertical spring with shifted equilibrium; linear range versus an added nonlinear force term."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "horizontale-feder",
            "taskDemandDe": "Für ein reibungsfrei idealisiertes horizontales Feder-Masse-System gelten die Modellwerte x=(-2;0;3) cm und F=(0,4;0;-0,6) N. Beschreibe den Zusammenhang, zeichne F(x) im gegebenen linearen Bereich und erkläre, warum er harmonische Schwingungen ermöglicht. Keine Periodenformel herleiten.",
            "taskDemandEn": "For an idealized frictionless horizontal spring-mass system, model values are x=(-2;0;3) cm and F=(0.4;0;-0.6) N. Describe the relationship, graph F(x) in the given linear range, and explain why it permits harmonic oscillations. Do not derive a period formula.",
            "expectedPerformanceDe": "Bestimmt D=20 N/m und die negative Geradensteigung -20 N/m. Bei x<0 zeigt F nach rechts, bei x>0 nach links; bei x=0 ist F=0, nicht zwingend v=0. Begründet F proportional -x und damit harmonische Rückstellung unter den Idealisierungen; die wenigen Modellpunkte rechtfertigen keine reale Federlinearität für beliebig große Dehnung.",
            "expectedPerformanceEn": "Determines D=20 N/m and the negative line slope -20 N/m. At x<0 F points right, at x>0 left; at x=0 F=0, not necessarily v=0. Explains F proportional to -x and thus harmonic restoration under the idealizations; a few model points do not establish real spring linearity at arbitrarily large extension.",
            "understandingFocusDe": "Vorzeichen, Gleichgewicht und linearer Modellbereich tragen die harmonische Deutung.",
            "understandingFocusEn": "Sign, equilibrium, and the linear model range support the harmonic interpretation."
          },
          {
            "id": "vertikales-gleichgewicht",
            "taskDemandDe": "Eine vertikale Feder besitzt D=50 N/m und wird durch die Gewichtskraft 1,0 N statisch gedehnt. Definiere danach x als zusätzliche Auslenkung nach unten vom Gleichgewicht. Erkläre die resultierende Kraft bei x=+1 cm und -1 cm. Vergleiche schließlich mit einem gegebenen alternativen Rückstellmodell F=-50x-1000x³ in SI, ohne eine Bewegungsgleichung lösen zu müssen.",
            "taskDemandEn": "A vertical spring has D=50 N/m and is statically extended by a weight of 1.0 N. Then define x as additional downward displacement from equilibrium. Explain the resultant force at x=+1 cm and -1 cm. Finally compare with the supplied alternative restoring model F=-50x-1000x³ in SI without solving an equation of motion.",
            "expectedPerformanceDe": "Erhält statische Dehnung 0,02 m; Gewicht und statischer Federanteil heben sich am Gleichgewicht auf, daher Fres=-50x und bei ±1 cm Kräfte ∓0,5 N. Beim Zusatzterm ist F/x=-50-1000x² nicht konstant: nicht exakt harmonisch für endliche Auslenkung, bei kleinem x näherungsweise linear. Verwechselt nicht die gesamte Federdehnung 0,02 m+x mit x.",
            "expectedPerformanceEn": "Obtains static extension 0.02 m; weight and the static spring contribution cancel at equilibrium, so Fres=-50x and forces at ±1 cm are ∓0.5 N. With the added term, F/x=-50-1000x² is not constant: not exactly harmonic at finite displacement, approximately linear for small x. Does not confuse total spring extension 0.02 m+x with x.",
            "understandingFocusDe": "Verschobenes Gleichgewicht ändert den Bezugspunkt; Nichtlinearität begrenzt die harmonische Idealisierung.",
            "understandingFocusEn": "Shifted equilibrium changes the reference point; nonlinearity limits harmonic idealization."
          }
        ]
      }
    },
    {
      "goalId": "84ddb244-e560-592f-9d43-e84c801fe5b4",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "eye-model-focus",
            "essentialUnderstandingDe": "Eine dünne Sammellinse und ein Schirm modellieren im paraxialen Bereich Brechung und Netzhautabbildung; scharfes Sehen verlangt Bildlage auf dem Schirm und 1/f=1/g+1/b.",
            "essentialUnderstandingEn": "A thin converging lens and screen model refraction and retinal imaging in the paraxial regime; sharp vision requires the image on the screen and 1/f=1/g+1/b.",
            "observablePerformanceDe": "Die lernende Person begründet die Zuordnung von Objekt, Linse und Schirm, konstruiert passende Hauptstrahlen und berechnet eine mit festem Schirm vereinbare Brennweite oder Gegenstandsweite.",
            "observablePerformanceEn": "The learner justifies the mapping of object, lens and screen, constructs appropriate principal rays and calculates a focal length or object distance compatible with a fixed screen."
          },
          {
            "id": "simulation-and-limits",
            "essentialUnderstandingDe": "Eine Simulation prüft Konsequenzen der gewählten Modellannahmen, nicht unabhängig deren biologische Wahrheit; das reale Auge besitzt mehrere brechende Flächen und physiologische Grenzen.",
            "essentialUnderstandingEn": "A simulation tests consequences of chosen model assumptions, not independently their biological truth; the real eye has several refracting surfaces and physiological limits.",
            "observablePerformanceDe": "Die lernende Person variiert gezielt eine Modellgröße, vergleicht Simulation, Strahlenbild und Rechnung und benennt mindestens eine konkrete Grenze der Übertragung auf das Auge.",
            "observablePerformanceEn": "The learner varies one model quantity deliberately, compares simulation, ray diagram and calculation and states at least one specific limit of applying the model to an eye."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "eye-model-focus",
            "simulation-and-limits"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "object-regime",
            "textDe": "Fernobjekt gegenüber endlicher Gegenstandsweite bei festem Schirm.",
            "textEn": "Distant object versus finite object distance with a fixed screen."
          },
          {
            "id": "inverse-model-use",
            "textDe": "Brennweite für ein Objekt bestimmen gegenüber Schärfebereich einer begrenzt veränderlichen Linse vorhersagen.",
            "textEn": "Finding focal length for an object versus predicting the focus range of a lens with limited adjustability."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "far-near-accommodation",
            "taskDemandDe": "Ein vereinfachtes Linsenauge hat b=20,0 mm zwischen dünner Linse und festem Netzhautschirm. Konstruiere Fern- und Nahabbildung für paralleles Licht bzw. g=250 mm und bestimme die jeweils notwendige Brennweite. Begründe die Modellzuordnung.",
            "taskDemandEn": "A simplified lens-eye model has b=20.0 mm between a thin lens and a fixed retinal screen. Construct far and near imaging for parallel light and g=250 mm, and find the focal length required in each case. Justify the model mapping.",
            "expectedPerformanceDe": "Erhält f=20,0 mm für das Fernobjekt und f=gb/(g+b)≈18,52 mm für das Nahobjekt; zeichnet konvergierende Strahlen mit umgekehrtem reellem Bild auf dem Schirm. Erklärt größere Brechkraft beim Nahfokus bei festem b und nennt etwa vernachlässigte Hornhaut oder Linsendicke.",
            "expectedPerformanceEn": "Obtains f=20.0 mm for the distant object and f=gb/(g+b)≈18.52 mm for the near object; draws converging rays with an inverted real image on the screen. Explains greater refractive power for near focus at fixed b and identifies, for example, neglected cornea or lens thickness.",
            "understandingFocusDe": "Schärfe entsteht durch passende Bildlage, nicht allein durch das Vorhandensein einer Sammellinse.",
            "understandingFocusEn": "Sharpness results from the correct image position, not merely from having a converging lens."
          },
          {
            "id": "limited-accommodation-simulation",
            "taskDemandDe": "Ein neuer dünner-Linsen-Simulator lässt f nur zwischen 18,0 und 20,0 mm verändern; der Schirm bleibt bei b=20,0 mm. Prognostiziere unabhängig, ob Objekte bei g=100 mm und g=300 mm scharf abbildbar sind. Konfiguriere diese Werte im Simulator, vergleiche die Strahlenschnittlage und erkläre die Grenze des Modells.",
            "taskDemandEn": "A fresh thin-lens simulator allows f to vary only from 18.0 to 20.0 mm; the screen stays at b=20.0 mm. Independently predict whether objects at g=100 mm and g=300 mm can be focused. Configure these values in the simulator, compare ray intersection positions and explain the model's limit.",
            "expectedPerformanceDe": "Berechnet f≈16,67 mm bzw. 18,75 mm: das erste liegt außerhalb, das zweite innerhalb des Einstellbereichs. Für g=100 mm und kleinstes f=18 mm liegt das Bild bei b≈21,95 mm hinter dem Schirm; dokumentiert entsprechende Simulatorausgabe. Unterscheidet Modellbereich von einer allgemeinen Aussage über individuelle Sehfähigkeit.",
            "expectedPerformanceEn": "Calculates f≈16.67 mm and 18.75 mm: the first is outside, the second inside the adjustment range. For g=100 mm and minimum f=18 mm, the image is at b≈21.95 mm behind the screen; records the corresponding simulator output. Distinguishes the model range from a general claim about individual visual ability.",
            "understandingFocusDe": "Eine inverse Modellvorhersage bleibt an verfügbare Parameter und Idealannahmen gebunden.",
            "understandingFocusEn": "An inverse model prediction remains bound to available parameters and ideal assumptions."
          }
        ]
      }
    },
    {
      "goalId": "ce14a7e7-7e2a-517f-a465-78ba3fbe414d",
      "profile": {
        "archetype": "experiment",
        "expectations": [
          {
            "id": "experimental-eye-mapping",
            "essentialUnderstandingDe": "Im Linse-Schirm-Modell kann eine feste Schirmlage die Netzhaut darstellen; ein davor oder dahinter liegender scharfer Bildort modelliert unterschiedliche Defokussierung, nicht eine vollständige klinische Diagnose.",
            "essentialUnderstandingEn": "In the lens-screen model, a fixed screen can represent the retina; a sharp image location in front of or behind it models different defocus conditions, not a complete clinical diagnosis.",
            "observablePerformanceDe": "Die lernende Person plant einen sicheren optischen Aufbau, legt Gegenstandsweite, Brennweite und Netzhaut-Schirmlage fest und ermittelt den scharfen Bildort durch kontrolliertes Verschieben eines Messschirms.",
            "observablePerformanceEn": "The learner plans a safe optical setup, specifies object distance, focal length and retinal-screen position and finds the sharp image location by controlled movement of a measuring screen."
          },
          {
            "id": "compare-prediction",
            "essentialUnderstandingDe": "Die dünne-Linsen-Gleichung liefert unter paraxialen Bedingungen eine Vorhersage der Bildweite; Messung und Modell können innerhalb ihrer Unsicherheit verglichen werden.",
            "essentialUnderstandingEn": "The thin-lens equation predicts image distance under paraxial conditions; measurement and model can be compared within their uncertainty.",
            "observablePerformanceDe": "Die lernende Person berechnet b aus gegebenem f und g, vergleicht den erwarteten mit dem gemessenen Schärfeort, deutet Kurz-/Weitsichtigkeit im Modell und benennt Unsicherheiten sowie biologische Grenzen.",
            "observablePerformanceEn": "The learner calculates b from supplied f and g, compares predicted and measured focus, interprets model myopia/hyperopia and identifies uncertainties and biological limits."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "experimental-eye-mapping",
            "compare-prediction"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "defocus-direction",
            "textDe": "Scharfes Bild vor gegenüber hinter der festen Modellnetzhaut.",
            "textEn": "Sharp image in front of versus behind the fixed model retina."
          },
          {
            "id": "object-regime",
            "textDe": "Entferntes endliches Objekt gegenüber näherem Objekt bei zwei ausdrücklich festgelegten entspannten Modellaugen.",
            "textEn": "A distant finite object versus a nearer object for two explicitly specified relaxed model eyes."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "myopic-model",
            "taskDemandDe": "Plane mit einer schwachen LED-Objektmarke, dünner Sammellinse f=100 mm als entspanntem Modellauge ohne Akkommodation und Objektweite g=1000 mm ein Modell mit fester Netzhautposition b_R=120 mm. Bestimme den scharfen Bildort mit einem verschiebbaren zweiten Schirm und vergleiche mit 1/f=1/g+1/b. Frische bereitgestellte Messung: b=112±2 mm; f und g gelten im Vergleich als hinreichend genau. Deute den Defokus.",
            "taskDemandEn": "Using a low-power LED object mark, thin converging lens f=100 mm representing a relaxed model eye without accommodation and object distance g=1000 mm, plan a model with fixed retinal position b_R=120 mm. Find the sharp image using a second movable screen and compare with 1/f=1/g+1/b. Fresh supplied measurement: b=112±2 mm; f and g are sufficiently precise for this comparison. Interpret the defocus.",
            "expectedPerformanceDe": "Beschreibt Ausrichtung, konstantes f/g und Ablesen des schärfsten Bildes von der Linsenebene aus; vermeidet Sonne und Laser. Berechnet b≈111,1 mm, verträglich mit 112±2 mm und deutlich vor b_R. Deutet dies als kurzsichtiges Defokusmodell bei diesem entfernten Objekt; nennt subjektive Schärfeschätzung und das vereinfachte Auge als Grenzen.",
            "expectedPerformanceEn": "Describes alignment, constant f/g and reading the sharpest image location from the lens plane; avoids sunlight and lasers. Calculates b≈111.1 mm, compatible with 112±2 mm and clearly in front of b_R. Interprets this as a myopic defocus model for this distant object; identifies subjective focus estimation and the simplified eye as limits.",
            "understandingFocusDe": "Eine nachprüfbare Bildlage vor der Modellnetzhaut trägt die Kurzsichtigkeitsdeutung.",
            "understandingFocusEn": "A verifiable focus in front of the model retina supports the myopia interpretation."
          },
          {
            "id": "hyperopic-near-model",
            "taskDemandDe": "Ein unabhängiger Versuch verwendet ein anderes entspanntes Modellauge mit f=140 mm und fester Netzhautposition b_R=120 mm; Akkommodation wird im Versuch nicht nachgebildet. Das Objekt liegt bei g=420 mm. Plane den Vergleich von Netzhautbild und unabhängig gesuchtem Schärfeort. Frische Messung: scharf bei b=211±3 mm. Prüfe zusätzlich qualitativ den Grenzfall eines sehr fernen Objekts und erläutere, welche Modellbrennweite bei g=420 mm auf b_R fokussieren würde, ohne eine Brillenverordnung abzuleiten.",
            "taskDemandEn": "An independent experiment uses another relaxed model eye with f=140 mm and fixed retinal position b_R=120 mm; accommodation is not modelled in the experiment. The object is at g=420 mm. Plan comparison of the retinal image with an independently located focus. Fresh measurement: sharp at b=211±3 mm. Also check qualitatively the limit of a very distant object and explain which model focal length would focus at b_R for g=420 mm, without deriving an eyeglass prescription.",
            "expectedPerformanceDe": "Berechnet b=210 mm und beurteilt 211±3 mm als verträglich; der Fokus liegt hinter der Modellnetzhaut. Auch im Fernobjekt-Grenzfall liegt b=f=140 mm hinter b_R=120 mm: Damit trägt das ausdrücklich entspannte Modell eine Weitsichtigkeitsdeutung und zeigt nicht bloß unzureichende Nahakkommodation. Bei g=420 mm würde f≈93,3 mm auf b_R fokussieren. Trennt diese Modelländerung von klinischer Diagnose und hält Lichtquelle, Abstände und Messverfahren sicher kontrolliert.",
            "expectedPerformanceEn": "Calculates b=210 mm and judges 211±3 mm compatible; focus lies behind the model retina. Even in the distant-object limit, b=f=140 mm is behind b_R=120 mm: the explicitly relaxed model therefore supports a hyperopia interpretation rather than merely insufficient near accommodation. At g=420 mm, f≈93.3 mm would focus at b_R. Distinguishes this model change from clinical diagnosis and keeps light source, distances and measurement procedure safely controlled.",
            "understandingFocusDe": "Modellierte Fehlsichtigkeit wird durch Lagevergleich und prüfbare optische Vorhersage erklärt.",
            "understandingFocusEn": "Modelled refractive error is explained through position comparison and a testable optical prediction."
          }
        ]
      }
    },
    {
      "goalId": "39ef1e8a-9203-5192-8c76-8e0c3322646f",
      "profile": {
        "archetype": "data",
        "expectations": [
          {
            "id": "reiz-und-wahrnehmung",
            "essentialUnderstandingDe": "Additive Mischung überlagert Licht; die Farbwahrnehmung beruht auf dem gemeinsamen Antwortmuster verschiedener Zapfentypen und ist keine neue mittlere Lichtwellenlänge.",
            "essentialUnderstandingEn": "Additive mixing superposes light; colour perception depends on the joint response pattern of different cone types and is not a new mean wavelength of light.",
            "observablePerformanceDe": "Verknüpft ein gegebenes spektrales oder Zapfenantwort-Diagramm mit einem Farbvergleich und erklärt, wie verschiedene Lichtzusammensetzungen dasselbe Antwortmuster erzeugen können.",
            "observablePerformanceEn": "Connects a supplied spectral or cone-response graph to a colour comparison and explains how different light compositions can produce the same response pattern."
          },
          {
            "id": "grafik-auswertung",
            "essentialUnderstandingDe": "Empirische Antwort- oder Abgleichdaten gelten für bestimmte Reize und Beobachtungsbedingungen; ein vereinfachtes Antwortmodell ersetzt nicht das vollständige Sehsystem.",
            "essentialUnderstandingEn": "Empirical response or matching data apply to specified stimuli and viewing conditions; a simplified response model does not replace the complete visual system.",
            "observablePerformanceDe": "Liest Achsen, relative Antwortwerte und Vergleichsbedingungen korrekt, konstruiert einen passenden Vergleich und begrenzt seine Schlussfolgerung bei veränderter Empfängerausstattung.",
            "observablePerformanceEn": "Reads axes, relative response values, and comparison conditions correctly, constructs an appropriate comparison, and limits the conclusion when receptor equipment changes."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "reiz-und-wahrnehmung",
            "grafik-auswertung"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "reiz-empfaenger",
            "textDe": "Verschiedene Lichtzusammensetzungen bei gleichem Empfänger gegenüber verändertem Empfänger bei festen Reizen.",
            "textEn": "Different light compositions for the same observer versus a changed observer for fixed stimuli."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "gleiches-antwortmuster",
            "taskDemandDe": "Pflichtmaterial für diesen Fall ist eine tatsächlich bereitgestellte empirische Grafik zur Farbangleichung oder Zapfenempfindlichkeit mit überprüfbarer Quellenangabe, Achsen/Einheiten und dokumentierten Reiz-/Messbedingungen. Diese Grafik liegt dem Entwurf noch nicht bei und muss vor Durchführung ergänzt werden; synthetische Daten dürfen sie nicht ersetzen. Werte mindestens zwei Werte oder Kurvenabschnitte aus und verknüpfe einen belegten Vergleich mit dem physiologischen Farbsehen. Bearbeite zusätzlich, ausdrücklich getrennt, diesen Modell-Konsistenzteil: bei festem Adaptationszustand relative Antworten (S,M,L) R=(0,1,4), G=(0,3,2), Y=(0,4,6); im schwachen linearen Modell addieren sich Antworten, die Spektren R+G und Y sind verschieden.",
            "taskDemandEn": "Required material for this case is an actually supplied empirical graph of colour matching or cone sensitivity with a verifiable source citation, axes/units, and documented stimulus/measurement conditions. This graph is not yet included in the draft and must be added before use; synthetic data must not replace it. Analyze at least two values or curve segments and connect one supported comparison to physiological colour vision. Additionally complete this explicitly separate model-consistency component: at fixed adaptation, relative responses (S,M,L) R=(0,1,4), G=(0,3,2), Y=(0,4,6); responses add in the weak linear model, and the spectra of R+G and Y differ.",
            "expectedPerformanceDe": "Belegt Aussagen zuerst an der tatsächlich gelieferten empirischen Grafik: nennt Quelle und Bedingungen, liest Achsen und mindestens zwei Werte/Abschnitte korrekt, beschreibt den erkennbaren Vergleich und dessen Mess-/Modellgrenze, ohne Zahlen oder Befunde zu erfinden. Ohne die Pflichtgrafik ist dieser Datenteil nicht erbracht. Erst im getrennten Modellteil konstruiert die Person R+G=(0,4,6) und erklärt den möglichen gleichen Farbeindruck zu Y durch gleiche Zapfenantworten trotz verschiedener Spektren, nicht durch Entstehung einer neuen mittleren Wellenlänge. Die synthetischen Tripel bestätigen keine empirische Empfindlichkeitskurve.",
            "expectedPerformanceEn": "First supports claims using the actual supplied empirical graph: identifies source and conditions, reads axes and at least two values/segments correctly, describes the observed comparison and its measurement/model limits without inventing numbers or findings. Without the required graph, this data component is not demonstrated. Only in the separate model component does the learner construct R+G=(0,4,6) and explain a possible match to Y by equal cone responses despite different spectra, not by creation of a new mean wavelength. Synthetic triples do not establish an empirical sensitivity curve.",
            "understandingFocusDe": "Echte empirische Grafik fachlich auswerten und von einem synthetischen Modell gleicher sensorischer Antworten unterscheiden.",
            "understandingFocusEn": "Analyze an actual empirical graph scientifically and distinguish it from a synthetic model of equal sensory responses."
          },
          {
            "id": "verringerte-antwortdimension",
            "taskDemandDe": "Eine zweite konstruierte Messgrafik zeigt bei gleicher Helligkeitsabgleich-Bedingung die Antwortmuster A=(1,3,4), B=(1,1,4) in relativen S/M/L-Einheiten. Ein vereinfachtes Empfängermodell registriert zunächst alle drei, dann nur S und L; andere Signale werden im Fall ausgeschlossen. Vergleiche beide Grafiken und die Unterscheidbarkeit, ohne eine medizinische Diagnose zu stellen.",
            "taskDemandEn": "A second constructed measurement graph shows response patterns A=(1,3,4), B=(1,1,4) in relative S/M/L units under the same brightness-matching condition. A simplified receiver first registers all three and then only S and L; other signals are excluded in this case. Compare the graphs and discriminability without making a medical diagnosis.",
            "expectedPerformanceDe": "Liest den Unterschied ausschließlich in M ab, zeichnet für das reduzierte Modell zweimal (1,4) und begründet, weshalb der dort verfügbare Farbinformationsunterschied verschwindet. Mit drei Antworten bleiben A/B unterscheidbar. Verallgemeinert dies nicht auf die gesamte reale Wahrnehmung oder eine konkrete Person; die Grafik modelliert nur diese Reiz-/Empfängerbedingungen.",
            "expectedPerformanceEn": "Reads the difference as confined to M, plots (1,4) twice for the reduced model, and explains why the available colour-information difference disappears there. With three responses A/B remain distinguishable. Does not generalize to all real perception or a specific person; the graph models only these stimulus/receiver conditions.",
            "understandingFocusDe": "Die physiologische Kodierung bestimmt, welche Unterschiede aus Reizdaten nutzbar sind.",
            "understandingFocusEn": "Physiological encoding determines which differences in stimulus data are usable."
          }
        ]
      }
    },
    {
      "goalId": "f06c581a-7157-584e-a692-99bcd613cff9",
      "profile": {
        "archetype": "representation",
        "expectations": [
          {
            "id": "translate-time-and-frequency-representations",
            "essentialUnderstandingDe": "Zeitverlauf und Frequenzspektrum codieren dasselbe Signal unterschiedlich. Bei periodischen Klängen bestimmt die Grundfrequenz die Periodendauer; harmonische und weitere Spektralanteile erscheinen mit ihren relativen Amplituden im Spektrum.",
            "essentialUnderstandingEn": "A time trace and frequency spectrum encode the same signal differently. For periodic complex sounds, fundamental frequency determines period, while harmonic and other spectral components appear with their relative amplitudes in the spectrum.",
            "observablePerformanceDe": "Die lernende Person konstruiert aus angegebenen Komponenten einen qualitativen Zeitverlauf oder ein Spektrum, ordnet zusammengehörige Darstellungen zu und erklärt Frequenz- und Amplitudenkonventionen.",
            "observablePerformanceEn": "The learner constructs a qualitative time trace or spectrum from supplied components, matches corresponding representations, and explains frequency and amplitude conventions."
          },
          {
            "id": "separate-pitch-timbre-and-level",
            "essentialUnderstandingDe": "Tonhöhe folgt vor allem der Grundfrequenz, Klangfarbe der spektralen Struktur und Pegel beziehungsweise Lautstärke der Gesamtsamplitude; diese Eigenschaften können unabhängig verändert werden, soweit das Modell trägt.",
            "essentialUnderstandingEn": "Pitch follows mainly from fundamental frequency, timbre from spectral structure, and level or loudness from overall amplitude; these properties can be changed independently within the model.",
            "observablePerformanceDe": "Die lernende Person sagt bei veränderten Grund- oder Obertonanteilen voraus, welche Wahrnehmungsmerkmale sich ändern, und begründet die Aussage aus den Spektren statt aus Instrumentnamen.",
            "observablePerformanceEn": "The learner predicts which perceptual features change when fundamental or overtone components change and justifies the claim from spectra rather than instrument names."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "translate-time-and-frequency-representations",
            "separate-pitch-timbre-and-level"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "spectral-change",
            "textDe": "Geänderte Grundfrequenz oder geänderte relative Obertonanteile",
            "textEn": "Changed fundamental frequency or changed relative overtone amplitudes"
          },
          {
            "id": "signal-form",
            "textDe": "Nahezu sinusförmiger Ton oder komplexer periodischer Klang",
            "textEn": "Nearly sinusoidal tone or complex periodic sound"
          },
          {
            "id": "representation-given",
            "textDe": "Zeitdiagramm, Spektrum oder Komponentenliste als Ausgangspunkt",
            "textEn": "Time graph, spectrum, or component list as the starting point"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "match-waveforms-and-spectra",
            "taskDemandDe": "Drei unbekannte periodische Zeitdiagramme und drei Spektren besitzen teils gleiche Grundfrequenz, aber verschiedene Obertonstärken. Ordne die Paare zu, bestimme Grund- und Obertöne und vergleiche Tonhöhe sowie Klangfarbe.",
            "taskDemandEn": "Three unfamiliar periodic time traces and three spectra have partly equal fundamentals but different overtone strengths. Match the pairs, identify fundamental and overtones, and compare pitch and timbre.",
            "expectedPerformanceDe": "Die lernende Person nutzt Periodendauer und Linienabstände, ordnet relative Amplituden konsistent zu und erklärt gleiche Tonhöhe bei unterschiedlicher Klangfarbe ohne die Gesamtamplitude mit einem Oberton zu verwechseln.",
            "expectedPerformanceEn": "The learner uses period and line spacing, consistently assigns relative amplitudes, and explains equal pitch with different timbre without confusing overall amplitude with an overtone.",
            "understandingFocusDe": "Der Fall prüft die bidirektionale Übersetzung beider Darstellungen.",
            "understandingFocusEn": "The case assesses bidirectional translation between the representations."
          },
          {
            "id": "filter-harmonics-preserve-fundamental",
            "taskDemandDe": "Ein Klang wird durch einen Tiefpass verändert, der höhere Obertöne stark dämpft, die Grundfrequenz aber erhält. Skizziere das neue Spektrum, sage den qualitativen Zeitverlauf voraus und begründe Änderungen von Tonhöhe, Pegel und Klangfarbe.",
            "taskDemandEn": "A complex sound is changed by a low-pass filter that strongly attenuates higher overtones but preserves the fundamental. Sketch the new spectrum, predict the qualitative time trace, and justify changes in pitch, level, and timbre.",
            "expectedPerformanceDe": "Die lernende Person behält die Grundfrequenz und Periodendauer bei, reduziert die entsprechenden Spektrallinien, erwartet einen glatteren Zeitverlauf und trennt eine mögliche Pegeländerung von der veränderten Klangfarbe.",
            "expectedPerformanceEn": "The learner preserves the fundamental and period, reduces the corresponding spectral lines, expects a smoother time trace, and separates a possible level change from altered timbre.",
            "understandingFocusDe": "Der unabhängige Transfer prüft kausale Vorhersage aus einer spektralen Manipulation.",
            "understandingFocusEn": "The independent transfer assesses causal prediction from a spectral manipulation."
          }
        ]
      }
    },
    {
      "goalId": "8ac61062-f63e-5935-96ae-84014906c368",
      "profile": {
        "archetype": "data",
        "expectations": [
          {
            "id": "level-and-quantity",
            "essentialUnderstandingDe": "Schalldruckpegel ist ein logarithmisches Maß des Effektivschalldrucks; unter gleichen Ausbreitungsbedingungen skaliert Intensität mit dessen Quadrat. Empfundene Lautstärke hängt zusätzlich etwa von Frequenz und Person ab.",
            "essentialUnderstandingEn": "Sound pressure level is a logarithmic measure of RMS sound pressure; under equal propagation conditions, intensity scales with its square. Perceived loudness also depends on factors such as frequency and the listener.",
            "observablePerformanceDe": "Die lernende Person nutzt eine gegebene Pegelrelation oder äquivalente Zuordnungstabelle für einen frischen Zahlenvergleich und trennt Druck-, Intensitäts- und Wahrnehmungsaussagen.",
            "observablePerformanceEn": "The learner uses a supplied level relation or equivalent lookup table for a fresh numerical comparison and separates pressure, intensity and perceptual claims."
          },
          {
            "id": "exposure-judgment",
            "essentialUnderstandingDe": "Gesundheitliche Gefährdung lässt sich nicht aus dem Pegel allein entscheiden; Expositionsdauer, Frequenzbewertung, Spitzen und Unsicherheit begrenzen quantitative Vergleiche.",
            "essentialUnderstandingEn": "Health hazard cannot be decided from level alone; exposure duration, frequency weighting, peaks and uncertainty limit quantitative comparisons.",
            "observablePerformanceDe": "Die lernende Person vergleicht vorgegebene Expositionen unter expliziten Annahmen, begründet eine vorsorgliche Verringerung und nennt fehlende Daten, ohne Sicherheit oder einen individuellen Schaden zu bescheinigen.",
            "observablePerformanceEn": "The learner compares supplied exposures under explicit assumptions, justifies a precautionary reduction and identifies missing data without certifying safety or individual harm."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "level-and-quantity",
            "exposure-judgment"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "quantity-change",
            "textDe": "Pegeländerung bei verändertem Schalldruck gegenüber gemeinsamer Pegel-Dauer-Änderung.",
            "textEn": "Level change with changed pressure versus combined level-duration change."
          },
          {
            "id": "perception-context",
            "textDe": "Vergleich gleicher Frequenzbedingungen gegenüber unbekannter Frequenzbewertung und Wahrnehmung.",
            "textEn": "Comparison under equal frequency conditions versus unknown frequency weighting and perception."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "pressure-ratio",
            "taskDemandDe": "Ein bereitgestellter Messbericht desselben Dauertons nennt 70 und 90 dB mit jeweils ±1 dB. Verwende ΔL=20 log₁₀(p₂/p₁) oder die gleichwertige Tabelle: +20 dB bedeutet Druckfaktor 10 und bei gleichem Medium Intensitätsfaktor 100. Vergleiche die Messsituationen und beurteile die Aussage 'hundertmal so laut'.",
            "taskDemandEn": "A supplied report for the same continuous tone gives 70 and 90 dB, each ±1 dB. Use ΔL=20 log₁₀(p₂/p₁) or the equivalent table: +20 dB means pressure factor 10 and, in the same medium, intensity factor 100. Compare the situations and assess the phrase 'one hundred times as loud'.",
            "expectedPerformanceDe": "Ermittelt nominal Druckfaktor 10 und Intensitätsfaktor 100, kennzeichnet die Faktoren wegen der Messunsicherheit als Näherungen und erklärt, dass daraus kein hundertfaches Lautheitsempfinden folgt. Begründet bei gleicher Dauer die deutlich höhere Schallbelastung und vorsorgliche Reduktion, ohne einen individuellen Hörschaden aus den zwei Werten abzuleiten.",
            "expectedPerformanceEn": "Finds nominal pressure factor 10 and intensity factor 100, identifies these as approximate due to measurement uncertainty and explains that they do not imply one hundred times the perceived loudness. Justifies much greater acoustic exposure at equal duration and precautionary reduction without inferring individual hearing damage from the two values.",
            "understandingFocusDe": "Logarithmische Messgröße und subjektive Lautheit sind quantitativ nicht identisch.",
            "understandingFocusEn": "The logarithmic measured quantity and subjective loudness are not quantitatively identical."
          },
          {
            "id": "duration-compensation",
            "taskDemandDe": "Zwei hypothetische, gleichartig frequenzbewertete konstante Schallbelastungen dauern A: 80 dB für 2 h und B: 90 dB für 0,2 h. Gegeben: +10 dB bedeutet zehnfache Intensität; I·t ist hier nur ein vereinfachter Energieexpositionsvergleich. Vergleiche A und B und erkläre, welche Aussagen über Gesundheitsgefahr damit möglich bleiben.",
            "taskDemandEn": "Two hypothetical, consistently frequency-weighted constant exposures are A: 80 dB for 2 h and B: 90 dB for 0.2 h. Given: +10 dB means tenfold intensity; I·t is only a simplified energy-exposure comparison here. Compare A and B and explain what health-hazard claims remain possible.",
            "expectedPerformanceDe": "Zeigt im vorgegebenen Modell gleiche Energieexposition, da 10·0,2 h=2 h. Begründet, weshalb gleiche I·t-Werte weder identische Wirkung noch Unbedenklichkeit beweisen: Spitzen, tatsächliches Spektrum, Messfehler und individuelle Empfindlichkeit fehlen. Empfiehlt als begründetes Vorsorgeprinzip geringeren Pegel und kürzere Dauer; kein lautes Selbstexperiment.",
            "expectedPerformanceEn": "Shows equal energy exposure in the supplied model because 10·0.2 h=2 h. Explains why equal I·t values prove neither identical effect nor safety: peaks, actual spectrum, measurement error and individual sensitivity are missing. Justifies lower level and shorter duration as precautionary principles; no loud self-experiment.",
            "understandingFocusDe": "Ein rechnerischer Expositionsvergleich ist ein begrenztes Modell, keine medizinische Freigabe.",
            "understandingFocusEn": "A numerical exposure comparison is a limited model, not medical clearance."
          }
        ]
      }
    },
    {
      "goalId": "9678afc1-44ca-54fb-b280-29336d45a928",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "combine-localization-cues",
            "essentialUnderstandingDe": "Interaurale Laufzeitdifferenzen entstehen aus Wegunterschieden, Pegeldifferenzen vor allem durch frequenzabhängigen Kopfschatten, und Ohrmuschel sowie Gehörgang prägen richtungsabhängige Spektren. Das Hörsystem kombiniert diese Hinweise.",
            "essentialUnderstandingEn": "Interaural time differences arise from path differences, level differences mainly from frequency-dependent head shadow, and the pinna and ear canal shape direction-dependent spectra. The auditory system combines these cues.",
            "observablePerformanceDe": "Die lernende Person ordnet für eine Richtung Vorzeichen und relative Größe der Hinweise zu, schätzt Δt = Δs/c ab und erklärt, welcher Hinweis für das gegebene Frequenzband aussagekräftig ist.",
            "observablePerformanceEn": "For a direction, the learner assigns the sign and relative size of the cues, estimates Δt = Δs/c, and explains which cue is informative for the given frequency band."
          },
          {
            "id": "assess-cue-limits-and-ambiguity",
            "essentialUnderstandingDe": "Laufzeit-, Pegel- und spektrale Hinweise besitzen frequenz- und geometrieabhängige Grenzen; etwa können Vorne-hinten-Lagen ähnliche binaurale Werte liefern und tiefe beziehungsweise hohe Frequenzen unterschiedliche Hinweise tragen.",
            "essentialUnderstandingEn": "Timing, level, and spectral cues have frequency- and geometry-dependent limits; for example, front–back positions may yield similar binaural values, while low and high frequencies carry different cues.",
            "observablePerformanceDe": "Die lernende Person erkennt mehrdeutige Datensätze, benennt den fehlenden Hinweis und sagt voraus, wie ein geändertes Frequenzband, eine Kopfbewegung oder Ohrmuschelfilterung die Lokalisierbarkeit beeinflusst.",
            "observablePerformanceEn": "The learner identifies ambiguous data sets, states the missing cue, and predicts how a changed frequency band, head movement, or pinna filtering affects localization."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "combine-localization-cues",
            "assess-cue-limits-and-ambiguity"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "source-direction",
            "textDe": "Links-rechts, vorne-hinten oder Höhenrichtung",
            "textEn": "Left–right, front–back, or elevation direction"
          },
          {
            "id": "frequency-band",
            "textDe": "Tieffrequenter, breitbandiger oder hochfrequenter Schall",
            "textEn": "Low-frequency, broadband, or high-frequency sound"
          },
          {
            "id": "listener-geometry",
            "textDe": "Geänderte Kopfbreite, Kopfhaltung oder Ohrmuschelfilterung",
            "textEn": "Changed head width, head orientation, or pinna filtering"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "side-source-time-delay",
            "taskDemandDe": "Eine Schallquelle steht seitlich; Kopfbreite, Einfallswinkel und Schallgeschwindigkeit sind angegeben. Schätze die interaurale Laufzeitdifferenz, bestimme das Vorzeichen für beide Ohren und beurteile für tiefe und hohe Frequenzen zusätzliche Pegelhinweise.",
            "taskDemandEn": "A sound source is to one side; head width, incidence angle, and sound speed are given. Estimate the interaural time difference, determine the sign for both ears, and assess additional level cues at low and high frequencies.",
            "expectedPerformanceDe": "Die lernende Person modelliert den Wegunterschied plausibel, erhält eine realistische Mikrosekunden-Größenordnung und erklärt, weshalb Kopfschatten bei kurzen Wellenlängen typischerweise stärker beiträgt.",
            "expectedPerformanceEn": "The learner models path difference plausibly, obtains a realistic microsecond scale, and explains why head shadow typically contributes more at short wavelengths.",
            "understandingFocusDe": "Der Fall verbindet Geometrie, Rechnung und frequenzabhängige Hinweiswahl.",
            "understandingFocusEn": "The case connects geometry, calculation, and frequency-dependent cue selection."
          },
          {
            "id": "front-back-spectral-ambiguity",
            "taskDemandDe": "Zwei Quellen vorne und hinten erzeugen nahezu gleiche Laufzeit- und Pegeldifferenzen, aber unterschiedliche Außenohrspektren. Deute die Messdaten und sage voraus, was bei geglätteter Ohrmuschelfilterung oder einer kleinen Kopfbewegung geschieht.",
            "taskDemandEn": "Two sources in front and behind produce nearly equal timing and level differences but different outer-ear spectra. Interpret the data and predict what happens when pinna filtering is smoothed or the head makes a small movement.",
            "expectedPerformanceDe": "Die lernende Person erkennt die binaurale Mehrdeutigkeit, nutzt richtungsabhängige Spektralkerben zur Unterscheidung und erwartet bei geschwächter Filterung mehr, bei dynamischer Kopfbewegung weniger Mehrdeutigkeit.",
            "expectedPerformanceEn": "The learner recognizes the binaural ambiguity, uses direction-dependent spectral notches to distinguish the sources, and expects more ambiguity with weakened filtering and less with dynamic head motion.",
            "understandingFocusDe": "Der unabhängige Transfer prüft spektrale Hinweise jenseits einer Seitenlokalisation.",
            "understandingFocusEn": "The independent transfer assesses spectral cues beyond lateral localization."
          }
        ]
      }
    },
    {
      "goalId": "8cdef591-6ddb-5151-8c74-a80be0271079",
      "profile": {
        "archetype": "experiment",
        "expectations": [
          {
            "id": "cable-current-paths-explain-attenuation",
            "essentialUnderstandingDe": "Im passiven Kabelmodell führt endlicher Membranwiderstand zu Leckstrom, während Axialwiderstand den Längsstrom behindert. Größerer Membranwiderstand vermindert, größerer Axialwiderstand verstärkt daher die räumliche Abschwächung.",
            "essentialUnderstandingEn": "In the passive cable model, finite membrane resistance permits leakage while axial resistance impedes longitudinal current. Greater membrane resistance therefore reduces spatial attenuation, whereas greater axial resistance increases it.",
            "observablePerformanceDe": "Die lernende Person zeichnet oder erläutert die Strompfade und begründet die Richtung einer isolierten Änderung von Membran- beziehungsweise Axialwiderstand.",
            "observablePerformanceEn": "The learner draws or explains the current paths and justifies the direction of an isolated change in membrane or axial resistance."
          },
          {
            "id": "spatial-profile-is-measured-and-modeled",
            "essentialUnderstandingDe": "Ein passives Potenzialprofil fällt näherungsweise exponentiell mit dem Ort ab; die Längskonstante beschreibt die Reichweite und hängt qualitativ wie √(r_m/r_i) vom Membran- und Axialwiderstand pro Länge ab.",
            "essentialUnderstandingEn": "A passive potential profile decays approximately exponentially with position; the length constant describes its reach and depends qualitatively on membrane and axial resistance per length as √(r_m/r_i).",
            "observablePerformanceDe": "Die lernende Person misst oder analysiert Potenziale an mehreren Orten, dokumentiert Referenz und Unsicherheit, prüft ein Exponentialmodell und vergleicht daraus räumliche Reichweiten.",
            "observablePerformanceEn": "The learner measures or analyses potentials at several positions, documents reference and uncertainty, checks an exponential model, and compares spatial reaches."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "cable-current-paths-explain-attenuation",
            "spatial-profile-is-measured-and-modeled"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "resistance-varied",
            "textDe": "Membran- oder Axialwiderstand wird einzeln verändert.",
            "textEn": "Membrane or axial resistance is changed independently."
          },
          {
            "id": "evidence-source",
            "textDe": "sicheres Niederspannungs-Ersatzmodell oder Simulation",
            "textEn": "safe low-voltage analogue or simulation"
          },
          {
            "id": "profile-representation",
            "textDe": "Messwerttabelle, Graph oder Exponentialparameter",
            "textEn": "measurement table, graph, or exponential parameter"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "membrane-resistance-profile-comparison",
            "taskDemandDe": "Ein Modell zeigt V(x)=100 mV·e^(-x/4 cm). Danach wird bei sonst gleichen Parametern der Membranwiderstand vervierfacht. Sage den neuen qualitativen Verlauf voraus, bestimme mit der Kabelmodell-Abhängigkeit die neue Längskonstante und erkläre den Strompfad.",
            "taskDemandEn": "A model gives V(x)=100 mV·e^(-x/4 cm). The membrane resistance is then quadrupled with all other parameters fixed. Predict the new qualitative profile, use the cable-model dependence to determine the new length constant, and explain the current path.",
            "expectedPerformanceDe": "Aus λ proportional √r_m folgt λ = 8 cm; das Potenzial fällt räumlich langsamer ab. Der größere Membranwiderstand vermindert Leckstrom, sodass mehr Längsstrom weiter entfernte Segmente erreicht.",
            "expectedPerformanceEn": "Since λ is proportional to √r_m, λ becomes 8 cm and potential decays more slowly with position. Greater membrane resistance reduces leakage, allowing more longitudinal current to reach distant segments.",
            "understandingFocusDe": "Parameteränderung, Exponentialprofil und physischer Stromweg stimmen überein.",
            "understandingFocusEn": "Parameter change, exponential profile, and physical current path agree."
          },
          {
            "id": "axial-resistance-transfer-with-data",
            "taskDemandDe": "Zwei Simulationen liefern normierte Potenziale bei x = 0, 2, 4 cm: Fall A 1,00; 0,61; 0,37, Fall B 1,00; 0,37; 0,14. Nur der Axialwiderstand wurde verändert. Entscheide, welcher Fall den größeren Axialwiderstand besitzt, und schätze die Längskonstanten.",
            "taskDemandEn": "Two simulations give normalized potentials at x = 0, 2, 4 cm: case A 1.00, 0.61, 0.37; case B 1.00, 0.37, 0.14. Only axial resistance was changed. Decide which case has the greater axial resistance and estimate the length constants.",
            "expectedPerformanceDe": "A entspricht ungefähr e^(-x/4 cm) mit λ≈4 cm, B ungefähr e^(-x/2 cm) mit λ≈2 cm. B besitzt den größeren Axialwiderstand, weil der Längsstrom stärker behindert und die Reichweite kleiner ist.",
            "expectedPerformanceEn": "A is approximately e^(-x/4 cm) with λ≈4 cm, while B is approximately e^(-x/2 cm) with λ≈2 cm. B has greater axial resistance because longitudinal current is impeded more strongly and the reach is shorter.",
            "understandingFocusDe": "Die Richtung des Axialwiderstandseffekts wird aus frischen räumlichen Daten erschlossen.",
            "understandingFocusEn": "The direction of the axial-resistance effect is inferred from fresh spatial data."
          }
        ]
      }
    },
    {
      "goalId": "5f97952e-5ac9-5749-94d0-d1dc50dda358",
      "profile": {
        "archetype": "representation",
        "expectations": [
          {
            "id": "phasor-projection",
            "essentialUnderstandingDe": "Ein Zeiger stellt Amplitude und Phase einer sinusförmigen Größe bei festgelegter Projektion dar; Spannung und Strom eines ideal ohmschen Widerstands sind bei gleicher Bezugsrichtung in Phase.",
            "essentialUnderstandingEn": "A phasor represents amplitude and phase of a sinusoidal quantity using a specified projection; voltage and current in an ideal ohmic resistor are in phase under consistent reference directions.",
            "observablePerformanceDe": "Konstruiert Zeiger aus Zeitfunktionen oder umgekehrt und kennzeichnet Projektion, Drehsinn, Einheiten und Amplitudenskalierung.",
            "observablePerformanceEn": "Constructs phasors from time functions or vice versa and labels projection, rotation direction, units, and amplitude scales."
          },
          {
            "id": "relative-phase",
            "essentialUnderstandingDe": "Die relative Phase zwischen Spannung und Strom ist von der gemeinsamen Phase gegenüber dem Zeitursprung zu unterscheiden; Zeiger sind keine räumlichen Bewegungen von Ladungen.",
            "essentialUnderstandingEn": "Relative phase between voltage and current differs from their common phase relative to the time origin; phasors are not spatial charge trajectories.",
            "observablePerformanceDe": "Deutet Gleichzeitigkeit von Nulldurchgängen und Extrema und überträgt die Darstellung auf einen geänderten Zeitursprung.",
            "observablePerformanceEn": "Interprets simultaneous zero crossings and extrema and transfers the representation to a changed time origin."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "phasor-projection",
            "relative-phase"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "time-to-phasor-and-back",
            "textDe": "Zeitfunktion in ein Zeigerbild übersetzen und ein gegebenes gemeinsam gedrehtes Zeigerpaar zurück in Zeitfunktionen übertragen.",
            "textEn": "Translate a time function into phasors and convert a given commonly rotated phasor pair back into time functions."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "ohmic-sine",
            "taskDemandDe": "Für einen ideal ohmschen Widerstand R=200 Ω in einem Kleinspannungsmodell gilt u(t)=4 sin(200πt) V, t in s. Bestimme i(t), zeichne beide Amplitudenzeiger mit Sinusprojektion und erkläre die Phasenbeziehung.",
            "taskDemandEn": "For an ideal ohmic resistor R=200 Ω in a low-voltage model, u(t)=4 sin(200πt) V with t in s. Determine i(t), draw both amplitude phasors using sine projection, and explain their phase relationship.",
            "expectedPerformanceDe": "i(t)=0,020 sin(200πt) A. f=100 Hz, T=10 ms; beide Zeiger sind gleichgerichtet und rotieren mit derselben Kreisfrequenz. Nulldurchgänge und Maxima sind gleichzeitig, Δφ=0. Zeigerlängen benötigen getrennte V- und A-Skalen; sie werden nicht als gleichartige räumliche Vektoren addiert.",
            "expectedPerformanceEn": "i(t)=0.020 sin(200πt) A. f=100 Hz and T=10 ms; the two phasors are aligned and rotate at the same angular frequency. Zero crossings and maxima coincide, Δφ=0. Lengths need separate V and A scales; the phasors are not added as like physical spatial vectors.",
            "understandingFocusDe": "Ohmsches Verhalten als proportionale, phasengleiche Zeitverläufe darstellen.",
            "understandingFocusEn": "Represent ohmic behaviour as proportional, in-phase time signals."
          },
          {
            "id": "shifted-time-origin",
            "taskDemandDe": "Bei Kosinusprojektion liegen die Amplitudenzeiger eines ohmschen Kreises bei t=0 beide unter −60° zur positiven Projektionsachse; ihre Beträge sind 6 V und 30 mA, ihre gemeinsame Kreisfrequenz ω. Gib Zeitfunktionen und Anfangswerte an. Eilt der Strom um 60° nach?",
            "taskDemandEn": "With cosine projection, both amplitude phasors of an ohmic circuit lie at −60° to the positive projection axis at t=0. Their magnitudes are 6 V and 30 mA and their common angular frequency is ω. State time functions and initial values. Does the current lag by 60°?",
            "expectedPerformanceDe": "u=6 cos(ωt−π/3) V und i=0,030 cos(ωt−π/3) A; u(0)=3 V, i(0)=15 mA. Beide besitzen denselben Anfangswinkel, daher beträgt ihre relative Phase 0 und R=200 Ω. Der gemeinsame Winkel beschreibt den gewählten Zeitursprung, keinen Stromnachlauf.",
            "expectedPerformanceEn": "u=6 cos(ωt−π/3) V and i=0.030 cos(ωt−π/3) A; u(0)=3 V and i(0)=15 mA. Both share the same initial angle, so relative phase is 0 and R=200 Ω. The common angle describes the chosen time origin, not current lag.",
            "understandingFocusDe": "Absolute Zeigerlage von einer physikalischen Phasendifferenz unterscheiden.",
            "understandingFocusEn": "Distinguish absolute phasor orientation from physical phase difference."
          }
        ]
      }
    },
    {
      "goalId": "ef0f2391-fd8e-5ae3-ae86-7adcdd833c7a",
      "profile": {
        "archetype": "procedure",
        "expectations": [
          {
            "id": "differential-phase-relations",
            "essentialUnderstandingDe": "Für ideale Bauteile gilt bei passiver Vorzeichenkonvention i_C=C·du_C/dt und u_L=L·di_L/dt; die Ableitung erzeugt bei Sinussignalen die Viertelperiodenverschiebung.",
            "essentialUnderstandingEn": "For ideal components under the passive sign convention, i_C=C·du_C/dt and u_L=L·di_L/dt; differentiation produces a quarter-period shift for sinusoidal signals.",
            "observablePerformanceDe": "Leitet aus einem angegebenen sinusförmigen Verlauf den anderen her und begründet Richtung und Betrag der Phasenverschiebung.",
            "observablePerformanceEn": "Derives one sinusoidal quantity from the other and justifies the direction and magnitude of phase shift."
          },
          {
            "id": "amplitude-and-frequency",
            "essentialUnderstandingDe": "Die Amplitudenverhältnisse sind Î_C/Û_C=ωC und Û_L/Î_L=ωL; eine Frequenzänderung wirkt bei gleicher Spannungsamplitude auf C und L entgegengesetzt.",
            "essentialUnderstandingEn": "Amplitude ratios are Î_C/Û_C=ωC and Û_L/Î_L=ωL; at equal voltage amplitude, frequency changes affect C and L in opposite ways.",
            "observablePerformanceDe": "Konstruiert konsistente Zeigerdiagramme und prüft Amplituden, Einheiten und geänderte Frequenzfälle.",
            "observablePerformanceEn": "Constructs consistent phasor diagrams and checks amplitudes, units, and changed-frequency cases."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "differential-phase-relations",
            "amplitude-and-frequency"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "capacitor-and-inductor",
            "textDe": "Kapazitiven Stromvorlauf und induktiven Spannungs­vorlauf aus den jeweiligen Differentialbeziehungen selbst erschließen.",
            "textEn": "Derive capacitive current lead and inductive voltage lead independently from their differential relations."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "capacitive-current",
            "taskDemandDe": "Für einen idealen Kondensator C=10 μF gilt u_C=2 sin(1000t) V. Nutze i_C=C·du_C/dt, bestimme den Strom und stelle die Phasen als Zeiger dar. Was ändert sich bei doppelter Frequenz und gleicher Spannungsamplitude?",
            "taskDemandEn": "For an ideal capacitor C=10 μF, u_C=2 sin(1000t) V. Use i_C=C·du_C/dt, determine current, and represent the phases as phasors. What changes at twice the frequency with unchanged voltage amplitude?",
            "expectedPerformanceDe": "i_C=0,020 cos(1000t) A=0,020 sin(1000t+π/2) A: Strom eilt um 90° vor. Î/Û=0,010 A/V=ωC. Bei doppeltem ω verdoppelt sich Î auf 40 mA; die ideale Phasenverschiebung bleibt 90°. Einheiten und passive Bezugsrichtung werden angegeben.",
            "expectedPerformanceEn": "i_C=0.020 cos(1000t) A=0.020 sin(1000t+π/2) A: current leads by 90°. Î/Û=0.010 A/V=ωC. Doubling ω doubles Î to 40 mA; the ideal phase shift remains 90°. Units and the passive reference direction are stated.",
            "understandingFocusDe": "Ableitungsbeziehung statt eines auswendig gelernten Vorlaufmerksatzes verwenden.",
            "understandingFocusEn": "Use the differential relation rather than a memorised lead-lag slogan."
          },
          {
            "id": "inductive-voltage",
            "taskDemandDe": "Für eine ideale Spule L=0,2 H ist i_L=0,010 sin(500t) A gegeben. Nutze u_L=L·di_L/dt und konstruiere ein Zeigerdiagramm. Wie verändert sich die Stromamplitude bei doppelter Frequenz, wenn nun die Spannungsamplitude festgehalten wird?",
            "taskDemandEn": "For an ideal inductor L=0.2 H, i_L=0.010 sin(500t) A is given. Use u_L=L·di_L/dt and construct a phasor diagram. How does current amplitude change at twice the frequency when voltage amplitude is held fixed?",
            "expectedPerformanceDe": "u_L=1,0 cos(500t) V: Spannung eilt dem Strom um 90° vor, Û/Î=100 Ω=ωL. Bei festem Û=1 V und doppeltem ω wird Î=5 mA. Das Vorzeichen der passiven Klemmenspannung ist von einer entgegengesetzt orientierten induzierten EMK zu unterscheiden; ohmsche Spulenverluste sind hier ausgeschlossen.",
            "expectedPerformanceEn": "u_L=1.0 cos(500t) V: voltage leads current by 90°, Û/Î=100 Ω=ωL. At fixed Û=1 V and doubled ω, Î becomes 5 mA. The passive terminal-voltage sign differs from an oppositely oriented induced emf; resistive coil losses are excluded here.",
            "understandingFocusDe": "Den geänderten Bauteiltyp und die festgehaltene Größe in der Vorhersage berücksichtigen.",
            "understandingFocusEn": "Account for the changed component and controlled quantity in the prediction."
          }
        ]
      }
    },
    {
      "goalId": "52b6722a-b3b2-5d2d-a507-0215532b0422",
      "profile": {
        "archetype": "representation",
        "expectations": [
          {
            "id": "amplitudes-to-probabilities",
            "essentialUnderstandingDe": "Im kohärenten Einphotonen-Mach-Zehnder-Interferometer werden Wegamplituden gemäß einer angegebenen Strahlteilerkonvention addiert; Betragsquadrate liefern Ausgangswahrscheinlichkeiten.",
            "essentialUnderstandingEn": "In a coherent single-photon Mach–Zehnder interferometer, path amplitudes are added using a specified beam-splitter convention; squared magnitudes give output probabilities.",
            "observablePerformanceDe": "Die Person erklärt Strahlteiler, Spiegel, Phasenschieber und Detektoren, konstruiert passende Zeiger und begründet komplementäre Ausgangswahrscheinlichkeiten.",
            "observablePerformanceEn": "The learner explains beam splitters, mirrors, phase shifter, and detectors, constructs appropriate phasors, and justifies complementary output probabilities."
          },
          {
            "id": "path-record-and-coherence",
            "essentialUnderstandingDe": "Unterscheidbare Wegmarkierungen ändern die Interferenz der Alternativen; ein einzelner Detektorklick ist keine aufgeteilte Photonenenergie.",
            "essentialUnderstandingEn": "Distinguishable path markers alter interference between alternatives; an individual detector click is not divided photon energy.",
            "observablePerformanceDe": "Die Person sagt die unbedingten Ausgangsstatistiken bei fehlender oder vollständiger Weginformation voraus und unterscheidet Phase von Wegmarkierung.",
            "observablePerformanceEn": "The learner predicts unconditional output statistics with absent or complete path information and distinguishes a phase change from path marking."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "amplitudes-to-probabilities",
            "path-record-and-coherence"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "phase-convention",
            "textDe": "Relative Phase ändern und die ausdrücklich festgelegte Portkonvention beibehalten.",
            "textEn": "Change relative phase while retaining the explicitly specified port convention."
          },
          {
            "id": "path-marking",
            "textDe": "Kohärente Arme mit gleich starken, vollständig unterscheidbaren Wegmarkierungen vergleichen.",
            "textEn": "Compare coherent arms with equally populated, fully distinguishable path markers."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "phasor-output",
            "taskDemandDe": "Für ein verlustfreies balanciertes Mach-Zehnder-Gerät mit einem besetzten Eingang gelten a₀ = (1 + e^{iφ})/2 und a₁ = (1 − e^{iφ})/2. Erkläre die Bauteilfunktionen und bestimme mit Zeigern die Ausgangschancen bei φ = 2π/3; vergleiche mit φ = π.",
            "taskDemandEn": "For a lossless balanced Mach–Zehnder device with one occupied input, a₀ = (1 + e^{iφ})/2 and a₁ = (1 − e^{iφ})/2. Explain the component functions and use phasors to determine output chances at φ = 2π/3; compare with φ = π.",
            "expectedPerformanceDe": "Die Person konstruiert die Amplitudensummen, erhält P₀ = 1/4 und P₁ = 3/4, bei π dagegen 0 und 1, und prüft die Normierung. Sie deutet Zeiger als Amplituden, nicht als Photonenteile.",
            "expectedPerformanceEn": "The learner constructs amplitude sums, obtains P₀ = 1/4 and P₁ = 3/4, and at π obtains 0 and 1, checking normalization. Phasors represent amplitudes, not photon fragments.",
            "understandingFocusDe": "Portverteilung entsteht aus relativer Phase und Amplitudenaddition.",
            "understandingFocusEn": "Output distribution follows from relative phase and amplitude addition."
          },
          {
            "id": "orthogonal-records",
            "taskDemandDe": "Dasselbe balancierte Gerät erhält in seinen gleich stark besetzten Armen verlustfreie, vollständig unterscheidbare Wegmarkierungen. Die Detektoren lesen die Markierung nicht aus. Beschreibe beim Variieren von φ die unbedingten Zählraten und vergleiche mit identischen Markierungen.",
            "taskDemandEn": "The same balanced device receives lossless, fully distinguishable path markers in its equally populated arms. Detectors do not read the markers. Describe unconditional count rates as φ varies and compare with identical markers.",
            "expectedPerformanceDe": "Die Person begründet je 1/2 an beiden Ausgängen ohne Phasenfransen für vollständige Markierung. Identische Markierungen erlauben bei stabiler Phase wieder die kohärente Amplitudenaddition; Nichtlesen allein löscht keine Weginformation.",
            "expectedPerformanceEn": "The learner explains 1/2 at each output without phase fringes for complete marking. Identical markers permit coherent amplitude addition again at stable phase; merely not reading does not erase path information.",
            "understandingFocusDe": "Wegmarkierung und reine Phasenverschiebung sind physisch verschiedene Änderungen.",
            "understandingFocusEn": "Path marking and a pure phase shift are physically different changes."
          }
        ]
      }
    },
    {
      "goalId": "bebc3738-0be6-52cf-83db-f8b948f7cf7b",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "corrected-current-goal-core",
            "essentialUnderstandingDe": "Der Winkeldurchmesser ist eine beobachtete scheinbare Größe. Für den Sonnenradius R, den Winkeldurchmesser θ und die Entfernung d vom Beobachtungsort zum Sonnenzentrum gilt in der Kugelgeometrie exakt R = d·sin(θ/2); für kleine Winkel folgt bei θ im Bogenmaß R ≈ d·θ/2. Unsicherheiten von Winkel und Mittelpunktentfernung begrenzen die Radiusabschätzung.",
            "essentialUnderstandingEn": "Angular diameter is an observed apparent quantity. For solar radius R, angular diameter θ, and distance d from the observer to the Sun's centre, exact spherical geometry gives R = d·sin(θ/2); for small angles, R ≈ d·θ/2 when θ is in radians. Uncertainties in angle and centre distance limit the radius estimate.",
            "observablePerformanceDe": "Mit sicher gewonnenen oder bereitgestellten Daten konstruiert die lernende Person die Sichtliniengeometrie zur kugelförmigen Sonne, unterscheidet Winkelradius und Winkeldurchmesser, rechnet Winkeleinheiten korrekt um, wählt begründet die exakte Sinusbeziehung oder die Kleinwinkelnäherung und berechnet einen plausiblen Sonnenradius einschließlich einer Abschätzung der maßgeblichen Messunsicherheit.",
            "observablePerformanceEn": "Using safely obtained or supplied data, the learner constructs the line-of-sight geometry to the spherical Sun, distinguishes angular radius from angular diameter, converts angular units correctly, justifies using the exact sine relation or the small-angle approximation, and calculates a plausible solar radius including an estimate of the dominant measurement uncertainty."
          },
          {
            "id": "apparent-angle-changes-while-physical-radius-remains",
            "essentialUnderstandingDe": "Der Winkeldurchmesser hängt von Beobachtungsentfernung und physischem Radius ab. Bei unveränderter Sonne wird der scheinbare Durchmesser mit größerer Entfernung kleiner, während eine konsistente Kombination aus Winkel und Entfernung denselben physischen Radius ergeben muss.",
            "essentialUnderstandingEn": "Angular diameter depends on observing distance and physical radius. For an unchanged Sun, the apparent diameter decreases with increasing distance, while a consistent combination of angle and distance must yield the same physical radius.",
            "observablePerformanceDe": "Vor einer Rechnung sagt die lernende Person für eine geänderte Entfernung die Richtung und Größenordnung der Winkeländerung voraus, ermittelt danach aus unabhängigen Daten erneut den Radius und erklärt, warum ein bloßes Ablesen der Bildgröße keine physische Radiusmessung ist.",
            "observablePerformanceEn": "Before calculating, the learner predicts the direction and scale of the angular change for a changed distance, then determines the radius again from independent data and explains why simply reading an image size is not a physical-radius measurement."
          },
          {
            "id": "approximation-and-uncertainty-require-justification",
            "essentialUnderstandingDe": "Die Kleinwinkelnäherung ist nur bei hinreichend kleinem Winkel gerechtfertigt, und die Ergebnisgenauigkeit wird durch Winkel- und Entfernungsunsicherheit bestimmt. Die exakte Beziehung setzt eine ausdrücklich definierte Entfernungskonvention voraus; eine genauere Formel beseitigt außerdem keine ungenauen Eingangsdaten.",
            "essentialUnderstandingEn": "The small-angle approximation is justified only for a sufficiently small angle, and result precision is determined by angular and distance uncertainty. The exact relation requires an explicitly defined distance convention; moreover, a more exact formula does not remove imprecise input data.",
            "observablePerformanceDe": "Die lernende Person definiert die verwendete Entfernung, vergleicht exakte Sinusbeziehung und Kleinwinkelnäherung für den gegebenen Winkel, entscheidet anhand der geforderten Genauigkeit, schätzt die Beiträge beider Messgrößen zur Radiusunsicherheit und berichtet ein plausibles Intervall mit begründeter Stellenzahl.",
            "observablePerformanceEn": "The learner defines the distance being used, compares the exact sine relation and the small-angle approximation for the given angle, decides using the required accuracy, estimates the contributions of both measured quantities to radius uncertainty, and reports a plausible interval with justified precision."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "corrected-current-goal-core",
            "apparent-angle-changes-while-physical-radius-remains",
            "approximation-and-uncertainty-require-justification"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "observing-distance",
            "textDe": "Unterschiedliche Erde-Sonne- beziehungsweise simulierte Beobachtungsentfernung",
            "textEn": "Different Earth–Sun or simulated observing distance"
          },
          {
            "id": "angular-measurement-quality",
            "textDe": "Unterschiedliche Winkelauflösung, Kalibrierung und Messunsicherheit",
            "textEn": "Different angular resolution, calibration, and measurement uncertainty"
          },
          {
            "id": "geometrical-regime",
            "textDe": "Exakte Sinusbeziehung bei Mittelpunktentfernung oder begründet verwendbare Kleinwinkelnäherung",
            "textEn": "Exact sine relation using centre distance or a justifiably applicable small-angle approximation"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "supplied-solar-angular-diameter",
            "taskDemandDe": "Aus einem bereitgestellten und sicher gewonnenen Winkeldurchmesser der Sonne, der zugehörigen Entfernung und ihren Unsicherheiten ist der Sonnenradius zu bestimmen. Konstruiere die Geometrie, entscheide zwischen exakter Beziehung und Näherung und gib ein begründetes Unsicherheitsintervall an.",
            "taskDemandEn": "Determine the solar radius from a supplied, safely obtained angular diameter of the Sun, the corresponding distance, and their uncertainties. Construct the geometry, choose between the exact relation and the approximation, and report a justified uncertainty interval.",
            "expectedPerformanceDe": "Die lernende Person unterscheidet Durchmesser und Radius, wandelt den Winkel in Radiant um, rechnet mit konsistenten Einheiten, prüft Größenordnung und Näherungsfehler und begrenzt die Stellenzahl durch die Eingangsdaten.",
            "expectedPerformanceEn": "The learner distinguishes diameter from radius, converts the angle to radians, calculates with consistent units, checks order of magnitude and approximation error, and limits reported precision according to the input data.",
            "understandingFocusDe": "Der Fall prüft das vollständige geometrische Messmodell statt bloßer Formeleinsetzung.",
            "understandingFocusEn": "The case tests the complete geometrical measurement model rather than mere formula substitution."
          },
          {
            "id": "changed-distance-and-resolution-transfer",
            "taskDemandDe": "Eine unabhängige simulierte Beobachtung derselben Sonne erfolgt aus größerer Entfernung und mit gröberer Winkelauflösung. Sage zuerst den neuen Winkeldurchmesser voraus, erschließe den Radius aus den neuen Daten und vergleiche Ergebnis und Unsicherheitsbilanz mit dem ersten Fall.",
            "taskDemandEn": "An independent simulated observation of the same Sun is made from a greater distance and with coarser angular resolution. First predict the new angular diameter, infer the radius from the new data, and compare the result and uncertainty account with the first case.",
            "expectedPerformanceDe": "Die lernende Person erwartet einen kleineren Winkel bei unverändertem Radius, erkennt die nun stärkere Winkelunsicherheit, wählt die Beziehung erneut begründet und erklärt kompatible beziehungsweise nicht kompatible Radiusintervalle.",
            "expectedPerformanceEn": "The learner expects a smaller angle for an unchanged radius, recognizes the now greater angular uncertainty, again justifies the chosen relation, and explains compatible or incompatible radius intervals.",
            "understandingFocusDe": "Der Transfer prüft die Trennung von scheinbarer Größe, physischem Radius und Messqualität.",
            "understandingFocusEn": "The transfer tests the distinction among apparent size, physical radius, and measurement quality."
          }
        ]
      }
    },
    {
      "goalId": "23335a89-f8e6-5c22-8705-d71193aeac96",
      "profile": {
        "archetype": "data",
        "expectations": [
          {
            "id": "selected-blind-review-core",
            "essentialUnderstandingDe": "Wiedererkennbare Sonnenstrukturen dienen als zeitlich begrenzte Rotationstracer: Ihre Positionsänderung relativ zum Beobachter liefert eine synodische, nicht unmittelbar eine siderische Rotationsdauer. Projektion auf die Bildfläche, Eigenentwicklung der Struktur und breitenabhängige differentielle Rotation beeinflussen die Inferenz.",
            "essentialUnderstandingEn": "Recurring solar features act as time-limited rotation tracers: their positional change relative to the observer yields a synodic period, not directly a sidereal rotation period. Projection onto the image plane, evolution of the feature itself, and latitude-dependent differential rotation affect the inference.",
            "observablePerformanceDe": "In einer sicher gewonnenen oder bereitgestellten, datierten Bildreihe identifiziert die lernende Person begründet dieselbe Struktur, misst ihre Positions- oder Längenänderung in einem erklärten Bezugssystem, schätzt daraus die synodische Rotationsdauer und trennt Messstreuung von systematischen Grenzen durch Projektion, Strukturentwicklung und differentielle Rotation.",
            "observablePerformanceEn": "In a safely obtained or supplied dated image series, the learner justifiably identifies the same feature, measures its positional or longitudinal change in an explained reference system, estimates the synodic rotation period, and distinguishes measurement scatter from systematic limitations due to projection, feature evolution, and differential rotation."
          },
          {
            "id": "image-plane-motion-needs-projection-aware-coordinates",
            "essentialUnderstandingDe": "Eine Verschiebung auf der zweidimensionalen Sonnenscheibe ist nicht unmittelbar derselbe Winkel wie eine Rotation um die Sonnenachse. Scheibenmittelpunkt, Achsenlage, Abstand vom Rand und das gewählte Koordinatensystem bestimmen, wie Bildpositionen in eine beobachterbezogene Längenänderung übersetzt werden dürfen.",
            "essentialUnderstandingEn": "A displacement on the two-dimensional solar disc is not directly the same angle as rotation about the Sun's axis. Disc centre, axis orientation, distance from the limb, and the chosen coordinate system determine how image positions may be translated into an observer-relative change in longitude.",
            "observablePerformanceDe": "Die lernende Person definiert ein reproduzierbares Bild- oder Längenkoordinatensystem, erklärt oder korrigiert die Projektion, verwirft eine naive lineare Randmessung und begründet, welche Messpunkte beziehungsweise welcher Scheibenbereich für die Periodenschätzung tragfähig sind.",
            "observablePerformanceEn": "The learner defines a reproducible image or longitude coordinate system, explains or corrects for projection, rejects a naive linear limb measurement, and justifies which measurement points or disc region support the period estimate."
          },
          {
            "id": "tracer-identity-cadence-and-evolution-limit-the-result",
            "essentialUnderstandingDe": "Die Inferenz setzt voraus, dass tatsächlich dieselbe Struktur verfolgt wird. Beobachtungskadenz, Lücken, Formänderung und Lebensdauer des Tracers beeinflussen Zuordnung und Streuung; unterschiedliche heliografische Breiten können wegen differentieller Rotation systematisch verschiedene Perioden liefern.",
            "essentialUnderstandingEn": "The inference assumes that the same feature is genuinely being tracked. Observing cadence, gaps, shape changes, and tracer lifetime affect matching and scatter; different heliographic latitudes can systematically yield different periods because of differential rotation.",
            "observablePerformanceDe": "Die lernende Person begründet die Strukturzuordnung anhand mehrerer Merkmale, quantifiziert oder begründet ein Periodenintervall, kennzeichnet mehrdeutige Zuordnungen und erklärt eine Breitenabhängigkeit oder Abweichung als physikalische beziehungsweise systematische Grenze statt sie ungeprüft zu mitteln.",
            "observablePerformanceEn": "The learner justifies feature matching using several characteristics, quantifies or justifies a period interval, identifies ambiguous matches, and explains a latitude dependence or discrepancy as a physical or systematic limitation instead of averaging it without examination."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "selected-blind-review-core",
            "image-plane-motion-needs-projection-aware-coordinates",
            "tracer-identity-cadence-and-evolution-limit-the-result"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "tracer-latitude",
            "textDe": "Strukturen auf unterschiedlicher heliografischer Breite",
            "textEn": "Features at different heliographic latitudes"
          },
          {
            "id": "cadence-and-lifetime",
            "textDe": "Dichte oder lückenhafte Zeitabtastung und langlebiger oder sich entwickelnder Tracer",
            "textEn": "Dense or gapped temporal sampling and a long-lived or evolving tracer"
          },
          {
            "id": "projection-position",
            "textDe": "Messungen nahe der Scheibenmitte oder am projizierten Sonnenrand",
            "textEn": "Measurements near disc centre or near the projected solar limb"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "fresh-dated-solar-series",
            "taskDemandDe": "In einer neu bereitgestellten, datierten und sicher aufgenommenen Sonnenbildreihe ist eine langlebige Struktur über mehrere Zeitpunkte zu verfolgen. Definiere die Messkoordinaten, schätze die synodische Periode und begründe Mess- und Modellunsicherheit einschließlich der Randprojektion.",
            "taskDemandEn": "In a newly supplied, dated, safely acquired solar-image series, track a long-lived feature across several times. Define the measurement coordinates, estimate the synodic period, and justify measurement and model uncertainty including limb projection.",
            "expectedPerformanceDe": "Die lernende Person weist die Strukturidentität nachvollziehbar nach, misst in einem erklärten Bezugssystem, verwendet nur geometrisch tragfähige Punkte oder eine begründete Korrektur und berichtet eine synodische Periode mit Unsicherheitsintervall.",
            "expectedPerformanceEn": "The learner establishes feature identity transparently, measures in an explained reference frame, uses only geometrically defensible points or a justified correction, and reports a synodic period with an uncertainty interval.",
            "understandingFocusDe": "Der Fall prüft die vollständige Beobachtungs-Daten-Inferenzkette an einer frischen Serie, nicht das Wiedererkennen einer vorgegebenen Grafik.",
            "understandingFocusEn": "The case tests the complete observation-data-inference chain on a fresh series, not recognition of a supplied graphic."
          },
          {
            "id": "latitude-and-cadence-transfer",
            "taskDemandDe": "Für eine unabhängige Beobachtungsreihe sind bereits identifizierte Tracer auf zwei Breiten, ihre gemessenen Längen mit Unsicherheiten und eine lückenhaftere Kadenz tabelliert. Schätze beide synodischen Perioden, prüfe die Zuverlässigkeit und erkläre eine mögliche Differenz.",
            "taskDemandEn": "For an independent observing series, already identified tracers at two latitudes, their measured longitudes with uncertainties, and a more gapped cadence are tabulated. Estimate both synodic periods, assess reliability, and explain a possible difference.",
            "expectedPerformanceDe": "Die lernende Person passt die Auswertung an die Messlücken an, trennt Streuung und Zuordnungsunsicherheit von differentieller Rotation und verweigert eine einheitliche Periode, wenn die Daten breitenabhängige Unterschiede tragen.",
            "expectedPerformanceEn": "The learner adapts the analysis to the data gaps, distinguishes scatter and matching uncertainty from differential rotation, and does not impose a single period when the data support latitude-dependent differences.",
            "understandingFocusDe": "Der Transfer prüft Referenzrahmen, Unsicherheit und differentielle Rotation ohne Abhängigkeit von der Gestaltung eines Lernzielbildes.",
            "understandingFocusEn": "The transfer tests reference frame, uncertainty, and differential rotation without dependence on the design of a learning-goal image."
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
    },
    {
      "goalId": "a5031dfc-6d25-5a04-850a-5c7d8a254c21",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "selected-blind-review-core",
            "essentialUnderstandingDe": "Eine Gleichgewichtstemperatur folgt im Modell aus der Bilanz von absorbierter Einstrahlung und abgegebener Wärmestrahlung; sie hängt unter anderem von Entfernung, Leuchtkraft, Albedo, Emissivität und angenommener Wärmeverteilung ab. Atmosphäre, innere Wärme, zeitliche Schwankungen und weitere chemische oder geologische Bedingungen können die reale Oberflächentemperatur und mögliche Lebensbedingungen wesentlich verändern.",
            "essentialUnderstandingEn": "In the model, equilibrium temperature follows from balancing absorbed irradiation with emitted thermal radiation; it depends, among other factors, on distance, luminosity, albedo, emissivity, and the assumed redistribution of heat. An atmosphere, internal heat, temporal variation, and further chemical or geological conditions can substantially alter the actual surface temperature and possible conditions for life.",
            "observablePerformanceDe": "Die lernende Person stellt für gegebene Daten eine begründete Strahlungsbilanz mit klarer Bezugsfläche auf, sagt die Wirkung zentraler Parameter voraus, berechnet eine Gleichgewichtstemperatur mit konsistenten Einheiten und erklärt eine Abweichung zur gemessenen Temperatur anhand benannter Modellannahmen, bevor sie eine ausdrücklich begrenzte Aussage zu Lebensbedingungen formuliert.",
            "observablePerformanceEn": "For given data, the learner constructs a justified radiation balance with a clear reference area, predicts the effects of key parameters, calculates an equilibrium temperature with consistent units, and explains a discrepancy from the measured temperature in terms of stated model assumptions before making an explicitly bounded statement about conditions for life."
          },
          {
            "id": "model-temperature-does-not-establish-habitability",
            "essentialUnderstandingDe": "Eine Gleichgewichtstemperatur ist eine durch Systemgrenze und Idealisierungen bestimmte Modellgröße. Selbst ein erdähnlicher Wert belegt weder eine gemessene Oberflächentemperatur noch flüssiges Wasser oder Leben; dafür sind unabhängige atmosphärische, chemische und geologische Daten nötig.",
            "essentialUnderstandingEn": "An equilibrium temperature is a model quantity determined by the system boundary and idealizations. Even an Earth-like value establishes neither a measured surface temperature nor liquid water or life; independent atmospheric, chemical, and geological data are required.",
            "observablePerformanceDe": "Die lernende Person trennt berechnete Modellgröße, Messbefund und Habitabilitätsurteil, nennt fehlende Evidenz und formuliert nur eine konditionale, durch die Daten begrenzte Aussage.",
            "observablePerformanceEn": "The learner separates the calculated model quantity, measured finding, and habitability judgment, identifies missing evidence, and states only a conditional conclusion bounded by the data."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "selected-blind-review-core",
            "model-temperature-does-not-establish-habitability"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "energy-input",
            "textDe": "Unterschiedliche Leuchtkraft, Entfernung und zeitliche Einstrahlung",
            "textEn": "Different luminosity, distance, and time-dependent irradiation"
          },
          {
            "id": "surface-atmosphere",
            "textDe": "Albedo, Emissivität, Wärmeverteilung, Atmosphäre oder innere Wärme",
            "textEn": "Albedo, emissivity, heat redistribution, atmosphere, or internal heat"
          },
          {
            "id": "evidence-state",
            "textDe": "Nur Modelldaten, zusätzlich gemessene Temperatur oder weitere chemisch-geologische Befunde",
            "textEn": "Model data only, an additional measured temperature, or further chemical-geological findings"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "airless-body-radiation-balance",
            "taskDemandDe": "Für einen luftlosen Himmelskörper sind Leuchtkraft des Sterns, Abstand, Albedo und eine Annahme zur Wärmeverteilung gegeben. Sage Parameterwirkungen voraus, stelle die Bilanz mit klarer Bezugsfläche auf, berechne die Gleichgewichtstemperatur und begrenze die Aussage zur realen Oberfläche.",
            "taskDemandEn": "For an airless celestial body, stellar luminosity, distance, albedo, and a heat-redistribution assumption are supplied. Predict parameter effects, set up the balance with a clear reference area, calculate the equilibrium temperature, and bound the claim about the actual surface.",
            "expectedPerformanceDe": "Die lernende Person unterscheidet absorbierende Querschnitts- und abstrahlende Oberfläche, rechnet einheitenrichtig, prüft die Größenordnung und erklärt räumliche beziehungsweise zeitliche Temperaturunterschiede als Modellgrenze.",
            "expectedPerformanceEn": "The learner distinguishes absorbing cross section from emitting area, calculates with consistent units, checks the order of magnitude, and explains spatial or temporal temperature differences as a model limitation.",
            "understandingFocusDe": "Der Fall prüft die physikalische Bilanz statt bloßer Formeleinsetzung.",
            "understandingFocusEn": "The case tests the physical balance rather than mere substitution."
          },
          {
            "id": "same-equilibrium-different-habitability",
            "taskDemandDe": "Zwei Planeten haben rechnerisch dieselbe Gleichgewichtstemperatur, aber unterschiedliche Atmosphären, innere Wärme und Messwerte. Erkläre die Abweichungen und beurteile, welche Aussagen zu Lebensbedingungen jeweils tragfähig sind.",
            "taskDemandEn": "Two planets have the same calculated equilibrium temperature but different atmospheres, internal heat, and measurements. Explain the discrepancies and assess which claims about conditions for life are supported in each case.",
            "expectedPerformanceDe": "Die lernende Person passt Modellannahmen an, trennt Modellwert und Messwert und fordert zusätzliche Evidenz, statt aus einer Temperatur allein auf Habitabilität zu schließen.",
            "expectedPerformanceEn": "The learner adjusts model assumptions, separates model value from measurement, and requires additional evidence instead of inferring habitability from one temperature alone.",
            "understandingFocusDe": "Der Transfer prüft Modellkritik und die Grenze des Habitabilitätsschlusses.",
            "understandingFocusEn": "The transfer tests model criticism and the limit of the habitability inference."
          }
        ]
      }
    },
    {
      "goalId": "6a73cacc-e86d-5248-a180-fd3da8454b0f",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "radius-from-radiative-state",
            "essentialUnderstandingDe": "Leuchtkraft ist die gesamte Strahlungsleistung; im thermischen Kugelmodell hängt sie gemeinsam von Oberfläche und Temperatur hoch vier ab. Die zwei HRD-Koordinaten bestimmen so einen Modellradius, nicht einen räumlichen Ort.",
            "essentialUnderstandingEn": "Luminosity is total radiated power; in the thermal spherical model it depends jointly on surface area and temperature to the fourth power. The two HR-diagram coordinates therefore determine a model radius, not a spatial location.",
            "observablePerformanceDe": "Die lernende Person gewinnt selbstständig aus L=4πR²σT⁴ eine Radius- oder Verhältnisbeziehung, wertet neue HRD-Wertepaare aus und erklärt den Einfluss beider Größen.",
            "observablePerformanceEn": "The learner independently obtains a radius or ratio relation from L=4πR²σT⁴, evaluates fresh HR-diagram value pairs, and explains the effect of both quantities."
          },
          {
            "id": "radius-inference-limits",
            "essentialUnderstandingDe": "Leuchtkraft oder Temperatur allein legt den Radius nicht fest; die thermische Modellannahme und unsichere Eingangsgrößen begrenzen die Aussage.",
            "essentialUnderstandingEn": "Neither luminosity nor temperature alone fixes radius; the thermal-model assumption and uncertain inputs limit the inference.",
            "observablePerformanceDe": "Die lernende Person konstruiert oder deutet einen Gegenfall gleicher Leuchtkraft bei verschiedener Temperatur und benennt die fehlende Information oder eine relevante Unsicherheit.",
            "observablePerformanceEn": "The learner constructs or interprets a counterexample with equal luminosity and different temperatures, and identifies missing information or relevant uncertainty."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "radius-from-radiative-state",
            "radius-inference-limits"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "physical-condition-change",
            "textDe": "Gleiche Temperatur gegenüber gleicher Leuchtkraft; vollständige Wertepaarung gegenüber unvollständiger oder unsicherer Eingabe.",
            "textEn": "Equal temperature versus equal luminosity; complete value pairs versus incomplete or uncertain input."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "equal-temperature",
            "taskDemandDe": "Zwei neue HRD-Punkte besitzen dieselbe Temperatur, aber Leuchtkräfte 1 und 9 L☉. Erkläre mit dem thermischen Modell ihr Radiusverhältnis und warum das HRD keine maßstäbliche Sternkarte ist.",
            "taskDemandEn": "Two fresh HR-diagram points have equal temperature but luminosities of 1 and 9 L☉. Explain their radius ratio using the thermal model and why the diagram is not a spatial star map.",
            "expectedPerformanceDe": "R₂/R₁=√9=3; bei gleicher Temperatur strahlt jede Flächeneinheit gleich viel, also benötigt die neunfache Gesamtleistung die neunfache Oberfläche. Die Achsen beschreiben Zustandsgrößen.",
            "expectedPerformanceEn": "R₂/R₁=√9=3; at equal temperature each unit area radiates equally, so nine times the total power requires nine times the area. The axes represent state quantities.",
            "understandingFocusDe": "Verhältnis aus physikalischer Flächenbedeutung selbst entwickeln.",
            "understandingFocusEn": "Independently develop the ratio from the physical meaning of emitting area."
          },
          {
            "id": "equal-luminosity-temperature-uncertainty",
            "taskDemandDe": "Ein anderer Sternvergleich hat gleiche Leuchtkraft, aber doppelte Temperatur für B. Sage sein Radiusverhältnis voraus. Prüfe zusätzlich, ob eine Radiusangabe aus Leuchtkraft allein eindeutig wäre und wie eine zu hoch geschätzte Temperatur den Radius beeinflusst.",
            "taskDemandEn": "A different pair has equal luminosity but twice the temperature for B. Predict its radius ratio. Also assess whether luminosity alone gives a unique radius and how an overestimated temperature affects the inferred radius.",
            "expectedPerformanceDe": "R_B/R_A=1/4, weil R bei festem L proportional T⁻² ist. Ohne Temperatur bleibt der Radius mehrdeutig; überschätztes T führt bei festem L zu unterschätztem R. Das ist eine Modellinferenz, kein direkt gemessener Sternrand.",
            "expectedPerformanceEn": "R_B/R_A=1/4 because R is proportional to T⁻² at fixed L. Without temperature, radius remains ambiguous; overestimating T underestimates R at fixed L. This is a model inference, not a directly measured stellar edge.",
            "understandingFocusDe": "Transfer vom Flächenvergleich zur kompensierenden Temperaturänderung und Fehlerwirkung.",
            "understandingFocusEn": "Transfer from area comparison to compensating temperature change and error direction."
          }
        ]
      }
    },
    {
      "goalId": "946ecf7b-0fcf-5776-9fb6-d397423c2f12",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "fuel-power-lifetime",
            "essentialUnderstandingDe": "Die Hauptreihenzeit hängt vom nutzbaren Fusionsenergiebudget und der mittleren Leuchtkraft ab. Größere Masse liefert im vereinfachten Vergleich mehr Brennstoff, aber bei L∝M^α mit α>1 steigt die Leistung stärker und die Zeit sinkt.",
            "essentialUnderstandingEn": "Main-sequence lifetime depends on usable fusion energy and average luminosity. Greater mass supplies more fuel in the simplified comparison, but with L∝M^α and α>1 power grows faster and lifetime decreases.",
            "observablePerformanceDe": "Die lernende Person entwickelt t≈E_nutz/L und leitet für eine bereitgestellte massenbereichsgebundene Beziehung eine Lebensdauerabschätzung mit physikalischer Deutung ab.",
            "observablePerformanceEn": "The learner develops t≈E_usable/L and derives a lifetime estimate from a supplied mass-range-limited relation, interpreting the physics."
          },
          {
            "id": "model-regime",
            "essentialUnderstandingDe": "Gleicher nutzbarer Brennstoffanteil, annähernd passende mittlere Leistung, Massenbereich und Hauptreihenphase sind Modellbedingungen; eine Potenzbeziehung gilt nicht universal für sämtliche Sterne und Phasen.",
            "essentialUnderstandingEn": "Comparable usable fuel fraction, an appropriate average power, mass range, and main-sequence phase are model conditions; a power relation is not universal across all stars and phases.",
            "observablePerformanceDe": "Die lernende Person prüft die Abschätzung bei geänderter Brennstoffnutzung oder Entwicklungsphase und erklärt, welche zusätzliche Annahme oder Datenbasis nötig wäre.",
            "observablePerformanceEn": "The learner checks the estimate for changed fuel utilization or evolutionary phase and explains which additional assumption or evidence would be needed."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "fuel-power-lifetime",
            "model-regime"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "physical-condition-change",
            "textDe": "Vergleich bei gleichem gegenüber verändertem nutzbarem Brennstoffanteil; Hauptreihe innerhalb des angegebenen Massenbereichs gegenüber Riesenphase oder Extrapolation.",
            "textEn": "Equal versus changed usable fuel fraction; main sequence within the stated mass range versus giant phase or extrapolation."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "mass-and-consumption",
            "taskDemandDe": "Für ein Modell im Bereich 0,8–2 M☉ sei L/L☉=(M/M☉)³, das nutzbare Energiebudget proportional M und t☉=10 Milliarden Jahre. Leite für 2 M☉ die Zeit ab und prüfe „Doppelter Brennstoff bedeutet doppelte Lebensdauer“.",
            "taskDemandEn": "For a model valid from 0.8 to 2 M☉, take L/L☉=(M/M☉)³, usable energy proportional to M, and t☉=10 billion years. Derive the lifetime for 2 M☉ and assess “Twice the fuel means twice the lifetime.”",
            "expectedPerformanceDe": "Zweifaches Budget und achtfache Leistung ergeben t/t☉=1/4, also 2,5 Milliarden Jahre. Die Aussage ignoriert den veränderten Verbrauch; die Zeit ist nicht aus dem Brennstoff allein bestimmbar.",
            "expectedPerformanceEn": "Twice the energy and eight times the power give t/t☉=1/4, or 2.5 billion years. The claim ignores changed consumption; fuel alone does not determine lifetime.",
            "understandingFocusDe": "Verknüpfung von Energie und Leistung statt Zahleneinsatz in eine unverstandene Lebensdauerformel.",
            "understandingFocusEn": "Connect energy and power rather than merely substitute into an unexplained lifetime formula."
          },
          {
            "id": "fuel-fraction-and-phase",
            "taskDemandDe": "In einem neuen bereitgestellten Hauptreihenmodell erhält Stern B bei sonst gleicher Masse und mittlerer Leuchtkraft den doppelten nutzbaren Brennstoffanteil wie A. Vergleiche die Zeiten. Jemand will die gleiche Masse-Leuchtkraft-Beziehung danach auf einen Roten Riesen anwenden; begrenze diesen Schluss.",
            "taskDemandEn": "In a fresh supplied main-sequence model, B has twice A’s usable fuel fraction at otherwise equal mass and average luminosity. Compare lifetimes. Someone then applies the same mass–luminosity relation to a red giant; limit that inference.",
            "expectedPerformanceDe": "Bei gleichen M und L verdoppelt sich hier E_nutz und damit t; die frühere Annahme gleicher Brennstoffnutzung ist gezielt geändert. Beim Roten Riesen ist die Hauptreihenbedingung verletzt; seine Phase und Energiequellen erfordern eine andere Modellgrundlage.",
            "expectedPerformanceEn": "At equal M and L, E_usable and hence t double; the previous equal-fuel-utilization assumption has deliberately changed. A red giant violates the main-sequence condition; its phase and energy sources require a different model.",
            "understandingFocusDe": "Unabhängiger Transfer auf eine Modellannahme statt bloß neue Sternmasse.",
            "understandingFocusEn": "Independent transfer to a model assumption rather than merely a different stellar mass."
          }
        ]
      }
    },
    {
      "goalId": "44f0eefa-2d93-5954-879f-f6c49e5cebc7",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "selected-blind-review-core",
            "essentialUnderstandingDe": "Die Steigung der näherungsweise linearen Beziehung zwischen Rezessionsgeschwindigkeit und Entfernung liefert die Hubble-Konstante; ihr Kehrwert ist eine Zeitskala. Nur bei idealisiert gleichförmiger Expansion entspricht diese Rückextrapolation unmittelbar einem Alter, während eine durch Materie, Strahlung und dunkle Energie veränderte Expansionsrate eine kosmologische Modellierung erfordert.",
            "essentialUnderstandingEn": "The slope of the approximately linear relation between recession speed and distance gives the Hubble constant, whose inverse is a time scale. Only for idealized uniform expansion does this back-extrapolation directly equal an age; an expansion rate changed by matter, radiation, and dark energy requires a cosmological model.",
            "observablePerformanceDe": "Die lernende Person bestimmt aus bereitgestellten Hubble-Daten eine sinnvolle Steigung oder verwendet einen gegebenen Hubble-Parameter, bildet nach korrekter Einheitenumrechnung dessen Kehrwert, prüft die Größenordnung und erklärt anhand einer Expansionsgeschichte, weshalb das Ergebnis ein Hubble-Alter und nicht ohne Weiteres das gemessene Universumsalter ist.",
            "observablePerformanceEn": "The learner determines a meaningful slope from supplied Hubble data or uses a given Hubble parameter, takes its inverse after correct unit conversion, checks the order of magnitude, and uses an expansion history to explain why the result is a Hubble age rather than automatically the measured age of the universe."
          },
          {
            "id": "inverse-hubble-parameter-is-a-timescale",
            "essentialUnderstandingDe": "Der Kehrwert des heutigen Hubble-Parameters ist zunächst eine Zeitskala. Die lineare Rückrechnung mit den heutigen Fluchtgeschwindigkeiten entspricht einem konstanten Zuwachs des Skalenfaktors, nicht einem konstanten Hubble-Parameter. Eine reale veränderte Expansionsgeschichte verändert den Zusammenhang zwischen dieser Zeitskala und dem Alter.",
            "essentialUnderstandingEn": "The reciprocal of the present Hubble parameter is initially a time scale. Linear backward extrapolation using today's recession velocities corresponds to a constant rate of change of the scale factor, not to a constant Hubble parameter. A changing real expansion history alters the relationship between this time scale and age.",
            "observablePerformanceDe": "Die lernende Person unterscheidet Hubble-Zeit und kosmologisches Alter und vergleicht die heutige Tangenten-Rückextrapolation mit einer konkret vorgegebenen Skalenfaktor-Zeit-Kurve. Die Richtung der Altersabweichung wird aus dieser Kurve begründet, nicht pauschal aus den Stichworten Abbremsung oder Beschleunigung.",
            "observablePerformanceEn": "The learner distinguishes Hubble time from cosmological age and compares backward extrapolation of today's tangent with a specifically supplied scale-factor-versus-time curve. The direction of the age discrepancy is justified from that curve, not generically from the words deceleration or acceleration."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "selected-blind-review-core",
            "inverse-hubble-parameter-is-a-timescale"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "hubble-data",
            "textDe": "Gegebener Parameter oder Steigung aus streuenden Geschwindigkeits-Entfernungs-Daten",
            "textEn": "Given parameter or slope from scattered velocity-distance data"
          },
          {
            "id": "unit-form",
            "textDe": "Kilometer pro Sekunde pro Megaparsec oder inverse SI-Zeit",
            "textEn": "Kilometres per second per megaparsec or inverse SI time"
          },
          {
            "id": "expansion-history",
            "textDe": "Lineare Rückrechnung mit heutiger Fluchtgeschwindigkeit oder konkret vorgegebene zeitlich veränderte Skalenfaktorentwicklung",
            "textEn": "Linear backward extrapolation with today's recession velocity or a specifically supplied time-varying scale-factor history"
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "hubble-slope-to-timescale",
            "taskDemandDe": "Bestimme aus bereitgestellten Galaxien-Daten eine begründete Hubble-Steigung, rechne ihren Kehrwert transparent in Jahre um und beurteile die Aussage, dies sei ohne weitere Annahmen das gemessene Universumsalter.",
            "taskDemandEn": "Determine a justified Hubble slope from supplied galaxy data, transparently convert its reciprocal into years, and assess the claim that this is the measured age of the universe without further assumptions.",
            "expectedPerformanceDe": "Die lernende Person berücksichtigt Streuung, führt die Einheiten vollständig, prüft die Größenordnung und weist den unbedingten Altersanspruch als Modellüberschreitung zurück.",
            "expectedPerformanceEn": "The learner accounts for scatter, carries units fully, checks the order of magnitude, and rejects the unconditional age claim as exceeding the model.",
            "understandingFocusDe": "Der Fall prüft Dateninferenz, Einheiten und Deutungsgrenze zusammen.",
            "understandingFocusEn": "The case jointly tests data inference, units, and interpretive limits."
          },
          {
            "id": "nonconstant-expansion-transfer",
            "taskDemandDe": "Eine neue Skalenfaktor-Zeit-Kurve zeigt eine konkret vorgegebene Expansionsgeschichte einschließlich des heutigen Werts und der heutigen Tangente. Vergleiche den auf a=0 zurückverlängerten Tangentenabschnitt mit dem in dieser Modellkurve ablesbaren Alter. Begründe, ob die heutige Hubble-Zeit dieses Modellalter über- oder unterschätzt, und erläutere die vereinfachende Annahme der linearen Rückrechnung.",
            "taskDemandEn": "A fresh scale-factor-versus-time curve shows a specifically supplied expansion history, including today's value and tangent. Compare the tangent extrapolated back to a=0 with the age read from this model curve. Justify whether today's Hubble time overestimates or underestimates this model age, and explain the simplifying assumption of linear backward extrapolation.",
            "expectedPerformanceDe": "Die lernende Person konstruiert die Rückextrapolation, vergleicht die beiden Zeitintervalle und begründet die Richtung nur für die gegebene Kurve. Sie unterscheidet einen konstanten Skalenfaktor-Zuwachs von einem konstanten Hubble-Parameter und erklärt, weshalb ohne Expansionsgeschichte keine allgemeine Alterskorrektur folgt.",
            "expectedPerformanceEn": "The learner constructs the backward extrapolation, compares the two time intervals, and justifies the direction only for the supplied curve. They distinguish a constant rate of change of the scale factor from a constant Hubble parameter and explain why no general age correction follows without an expansion history.",
            "understandingFocusDe": "Der Transfer verhindert die Gleichsetzung einer Zeitskala mit einem modellunabhängigen Alter.",
            "understandingFocusEn": "The transfer prevents equating a time scale with a model-independent age."
          }
        ]
      }
    },
    {
      "goalId": "f2538793-8b0a-5c3b-b216-5d329a4e87bd",
      "profile": {
        "archetype": "modeling",
        "expectations": [
          {
            "id": "normalised-density-integral",
            "essentialUnderstandingDe": "Die Nachweiswahrscheinlichkeit ist das Integral von |ψ|² über ein Intervall, nicht die Höhe einer Wellenfunktion oder Dichte. Normierung auf [0,L] ergibt Gesamtwahrscheinlichkeit 1; die Dichte hat Einheit 1/Länge, die Wahrscheinlichkeit keine Einheit.",
            "essentialUnderstandingEn": "Detection probability is the integral of |ψ|² over an interval, not the height of a wave function or density. Normalisation on [0,L] gives total probability 1; density has units of inverse length and probability is dimensionless.",
            "observablePerformanceDe": "Bildet aus gegebener normierter ψ die Dichte, integriert innerhalb der Topfgrenzen und prüft Einheiten, Grenzen und den Wahrscheinlichkeitsbereich [0,1].",
            "observablePerformanceEn": "Forms the density from a supplied normalised ψ, integrates within the well and checks units, integration limits and the probability range [0,1]."
          },
          {
            "id": "state-and-interval-shape",
            "essentialUnderstandingDe": "Gleich breite Intervalle können wegen unterschiedlicher Dichte verschiedene Nachweiswahrscheinlichkeiten haben. Eine globale Vorzeichenänderung von ψ verändert die Dichte nicht; punktweise hohe Dichte ist keine sichere Einzeldetektion.",
            "essentialUnderstandingEn": "Equal-width intervals can have different detection probabilities because density varies. A global sign change of ψ leaves density unchanged; a high pointwise density does not imply a certain individual detection.",
            "observablePerformanceDe": "Vergleicht selbst berechnete Intervallflächen bei verändertem Zustand oder Intervall, begründet den Einfluss von Knoten und erklärt Wahrscheinlichkeiten als Aussagen über gleich präparierte Ensembles.",
            "observablePerformanceEn": "Compares independently calculated interval areas for a changed state or interval, explains the role of nodes and interprets probabilities for identically prepared ensembles."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "normalised-density-integral",
            "state-and-interval-shape"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "ground-state-versus-node-at-centre",
            "textDe": "Eine gegebene Wellenfunktion mit Knoten in der Topfmitte statt des Grundzustands untersuchen.",
            "textEn": "Examine a supplied wave function with a node at the well centre rather than the ground state."
          },
          {
            "id": "equal-width-and-global-sign",
            "textDe": "Gleich breite Intervalle an unterschiedlichen Orten und eine globale Vorzeichenänderung vergleichen.",
            "textEn": "Compare equal-width intervals at different positions and a global sign change."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "excited-state-central-window",
            "taskDemandDe": "Gegeben ist ψ(x)=√(2/L) sin(2πx/L) auf [0,L], normiert und außerhalb null. Berechne ohne Buchbild P(3L/8≤x≤5L/8), skizziere die betreffende Dichtefläche und erkläre, warum der zentrale Bereich trotz endlicher Breite wenig Gewicht trägt.",
            "taskDemandEn": "Given ψ(x)=√(2/L) sin(2πx/L) on [0,L], normalised and zero outside, calculate P(3L/8≤x≤5L/8) without the book image. Sketch the density area involved and explain why this finite central window carries little weight.",
            "expectedPerformanceDe": "Erhält durch Integration 1/4−1/(2π)≈0,0908. Ordnet den Knoten bei L/2 korrekt zu und deutet etwa 9,1 % als langfristigen Anteil bei gleich präparierten Elektronen, nicht als klassische Aufenthaltsdauer auf einer Bahn oder sichere Aussage über eine einzelne Messung. Normierung und dimensionslose Fläche werden geprüft.",
            "expectedPerformanceEn": "Integration gives 1/4−1/(2π)≈0.0908. Correctly locates the node at L/2 and interprets about 9.1% as a long-run fraction for identically prepared electrons, not classical time spent on a trajectory or certainty about one measurement. Checks normalisation and dimensionless area.",
            "understandingFocusDe": "Eigenständige Integration und räumliche Deutung bei einem gegenüber dem Bild veränderten Zustand.",
            "understandingFocusEn": "Independent integration and spatial interpretation for a state different from the illustrated one."
          },
          {
            "id": "equal-width-ground-state-intervals",
            "taskDemandDe": "Für die gegebene normierte ψ(x)=√(2/L) sin(πx/L) vergleiche [0,L/4] und [L/4,L/2] quantitativ. Ändern sich die Ergebnisse für −ψ? Ein Vorschlag ersetzt ψ durch 2ψ und verwendet die Integrale unverändert als Wahrscheinlichkeiten; prüfe das mit der Normierung.",
            "taskDemandEn": "For supplied normalised ψ(x)=√(2/L) sin(πx/L), compare [0,L/4] and [L/4,L/2] quantitatively. Do results change for −ψ? A proposal replaces ψ with 2ψ and uses the integrals unchanged as probabilities; assess this through normalisation.",
            "expectedPerformanceDe": "Erhält 1/4−1/(2π)≈0,0908 und 1/4+1/(2π)≈0,4092 trotz gleicher Breite. Begründet dies mit dem Dichteverlauf und erhält für −ψ identische Flächen. 2ψ ist nicht normiert: Gesamtintegral 4; rohe Teilintegrale sind daher keine normierten Wahrscheinlichkeiten. Kein neues Energieniveau berechnen.",
            "expectedPerformanceEn": "Obtains 1/4−1/(2π)≈0.0908 and 1/4+1/(2π)≈0.4092 despite equal widths. Explains the density dependence and identical areas for −ψ. The function 2ψ is not normalised: its total integral is 4, so raw partial integrals are not normalised probabilities. No calculation of an energy level is required.",
            "understandingFocusDe": "Transfer über Intervalllage und Darstellungsänderung; Normierung verhindert eine rein formale Integralrechnung.",
            "understandingFocusEn": "Transfer across interval position and representation change; normalisation prevents merely formal integration."
          }
        ]
      }
    },
    {
      "goalId": "b4772b06-b10c-52dd-841b-a96ffb7c7e28",
      "profile": {
        "archetype": "concept",
        "expectations": [
          {
            "id": "physical-understanding",
            "essentialUnderstandingDe": "Beschleunigte kosmische Expansion bedeutet im qualitativen späten Entwicklungsmodell, dass ein relativer Skalenfaktor in gleichen Zeitabständen zunehmend stärker wächst. Dunkle Energie benennt einen Modellbestandteil zur Beschreibung dieses Befunds; bloßes Wachstum des Skalenfaktors oder der Name des Modellbestandteils ist noch kein Nachweis einer bekannten Substanz.",
            "essentialUnderstandingEn": "In a qualitative model of late cosmic evolution, accelerated expansion means that a relative scale factor increases by progressively larger amounts over equal time intervals. Dark energy names a model component describing this finding; mere growth of the scale factor or the name of the component is not evidence for a known substance.",
            "observablePerformanceDe": "Die lernende Person erläutert anhand einer selbst konstruierten oder aus einfachen Angaben entwickelten Darstellung den Unterschied zwischen Expansion und beschleunigter Expansion, ordnet den Modellbegriff dunkle Energie dem passenden Befund zu und begrenzt ihre Aussage auf die dargestellte Entwicklungsphase.",
            "observablePerformanceEn": "Using a representation they construct themselves or develop from simple information, the learner explains the distinction between expansion and accelerated expansion, relates the model term dark energy to the appropriate finding and limits the claim to the depicted evolutionary phase."
          }
        ],
        "coverageExpectations": {
          "requiredExpectationIds": [
            "physical-understanding"
          ],
          "alternativeExpectationGroups": [],
          "minimumIndependentDemonstrations": 2,
          "freshVariationRequired": true,
          "independentTransferRequired": true
        },
        "variationAxes": [
          {
            "id": "changed-physical-context",
            "textDe": "Gleich große versus wachsende Zuwächse des Skalenfaktors; beobachteter später Ausschnitt versus unzulässige Verallgemeinerung auf die gesamte Geschichte.",
            "textEn": "Equal versus increasing increments of the scale factor; an observed late interval versus an unjustified generalisation to the entire history."
          }
        ],
        "applicationCaseBriefs": [
          {
            "id": "equal-time-increments",
            "taskDemandDe": "Zwei rein schematische Modelle geben den relativen Skalenfaktor zu vier gleich weit auseinanderliegenden Zeitpunkten an: A: 1,0; 1,2; 1,4; 1,6. B: 1,0; 1,1; 1,3; 1,6. Zeichne jeweils eine passende qualitative Darstellung, erläutere den Unterschied und erkläre, zu welchem der beiden Verläufe der Modellbegriff dunkle Energie im Zusammenhang mit beschleunigter Expansion passt. Die Zahlen sind keine kosmologischen Messwerte.",
            "taskDemandEn": "Two purely schematic models give the relative scale factor at four equally spaced times: A: 1.0; 1.2; 1.4; 1.6. B: 1.0; 1.1; 1.3; 1.6. Draw an appropriate qualitative representation for each, explain the difference and state which trend fits the model term dark energy in the context of accelerated expansion. These numbers are not cosmological measurements.",
            "expectedPerformanceDe": "Beide Folgen steigen und stehen damit für Expansion. A hat gleiche Zuwächse von 0,2, B wachsende Zuwächse von 0,1; 0,2; 0,3. Die lernende Person begründet im schematischen Vergleich für B eine beschleunigte Expansion und erläutert dunkle Energie als Modellbestandteil zur Beschreibung dieses Befunds, nicht als aus den Zahlen identifizierte Substanz.",
            "expectedPerformanceEn": "Both sequences increase and thus represent expansion. A has equal increments of 0.2, while B has increasing increments of 0.1, 0.2 and 0.3. In this schematic comparison, the learner justifies accelerated expansion for B and explains dark energy as a model component describing that finding, not a substance identified from the numbers.",
            "understandingFocusDe": "Wachsende Ausdehnung allein ist nicht Beschleunigung; verglichen werden Zuwächse über gleiche Zeitintervalle.",
            "understandingFocusEn": "An increasing extent alone is not acceleration; increments must be compared over equal time intervals."
          },
          {
            "id": "late-epoch-model-explanation",
            "taskDemandDe": "In einer neuen Aufgabe beschreibt ein Beobachtungstext ausschließlich die späte Entwicklung: Über gleiche Zeitspannen nimmt der relative Skalenfaktor zunächst um einen kleinen, später um einen größeren Betrag zu. Verfasse ohne Vorlagenkurve eine kurze Erklärung für eine Schulausstellung und skizziere den beschriebenen Ausschnitt. Gehe dabei darauf ein, welche Rolle der Ausdruck dunkle Energie hat und welche Aussage über die früheste Entwicklung oder die stoffliche Natur damit nicht begründet ist.",
            "taskDemandEn": "In a fresh task, an observation summary describes only late evolution: over equal time intervals the relative scale factor first increases by a smaller amount and later by a larger amount. Without a template curve, write a short explanation for a school exhibition and sketch the described interval. Explain the role of the term dark energy and what this does not establish about the earliest evolution or its material nature.",
            "expectedPerformanceDe": "Die lernende Person konstruiert einen zunehmenden, im beschriebenen Ausschnitt steiler werdenden Verlauf und erklärt die Beschleunigung durch größere Zuwächse bei gleichen Zeitspannen. Sie verwendet dunkle Energie als Modellbegriff für diesen Befund und begründet, warum daraus weder eine stets beschleunigte kosmische Geschichte noch der Nachweis einer konkreten Substanz folgt.",
            "expectedPerformanceEn": "The learner constructs an increasing curve that becomes steeper over the described interval and explains the acceleration through larger increments over equal time spans. They use dark energy as a model term for this finding and explain why it implies neither a cosmic history that was always accelerating nor detection of a specific substance.",
            "understandingFocusDe": "Der Modellbegriff und seine zeitliche Gültigkeit bleiben an den tatsächlich beschriebenen Beobachtungsbereich gebunden.",
            "understandingFocusEn": "The model term and its temporal scope remain tied to the observational interval actually described."
          }
        ]
      }
    }
  ]
}
```
