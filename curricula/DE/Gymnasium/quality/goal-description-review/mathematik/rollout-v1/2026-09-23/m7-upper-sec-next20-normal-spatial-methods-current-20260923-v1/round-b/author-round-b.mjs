import { createHash } from 'node:crypto'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const here = dirname(new URL(import.meta.url).pathname)
const campaign = JSON.parse(readFileSync(resolve(here, 'description-review-campaign.json'), 'utf8'))
const bundle = JSON.parse(readFileSync(resolve(here, 'review-bundle-manifest.json'), 'utf8'))
const batch = campaign.batches[0]
const batchPath = resolve(here, 'batches', `${batch.batchId}.input.jsonl`)
const pages = readFileSync(batchPath, 'utf8').trim().split('\n').map((line) => JSON.parse(line))
const runId = `${campaign.roundId}-run-001`
const digest = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`

// This is an independent candidate review. The three bilingual evidence pairs
// below were authored from the bound Round B pages, not from other reviews.
const decisions = [
  {
    decision: 'revise',
    rationale: 'The formula and parameter interpretation belong to this LK goal, but "basic properties" leaves the intended graph reading vague. Naming position, spread and symmetry makes the already claimed interpretation concrete.',
    proposedDescriptionDe: (g) => g.currentDescriptionDe.replace('die Rolle der Parameter $\\mu$ und $\\sigma$ erläutern und grundlegende Eigenschaften interpretieren.', 'erläutern, wie $\\mu$ die Lage und $\\sigma$ die Streuung der symmetrischen Dichtekurve bestimmen.'),
    proposedDescriptionEn: (g) => g.currentDescriptionEn.replace('explain the role of the parameters $\\mu$ and $\\sigma$, and interpret basic properties.', 'explain how $\\mu$ determines the location and $\\sigma$ the spread of the symmetric density curve.'),
    evidence: [
      'Die Dichte ist eine nichtnegative Flächenbeschreibung mit Gesamtfläche 1; $\\mu$ legt Zentrum und Symmetrieachse fest, während $\\sigma>0$ die Breite und damit die Gipfelhöhe bestimmt.',
      'The density is a nonnegative area description with total area 1; $\\mu$ fixes the center and symmetry axis, while $\\sigma>0$ determines the spread and hence the peak height.',
      'Die lernende Person ordnet Formel und Dichtegraph einander zu und erklärt an zwei Kurven, warum eine Änderung von $\\mu$ verschiebt und eine Änderung von $\\sigma$ streckt, ohne die Gesamtfläche zu ändern.',
      'The learner matches the formula to a density graph and explains from two curves why changing $\\mu$ shifts the graph and changing $\\sigma$ spreads it without changing total area.',
      'Bei einem unabhängig vorgelegten Kurvenpaar mit gleicher Lage, aber unterschiedlicher Breite, bestimmt die lernende Person die passende Parameterbeziehung und begründet die unterschiedliche Gipfelhöhe.',
      'Given a fresh pair of curves with the same center but different widths, the learner identifies the parameter relationship and explains the different peak heights.',
    ],
  },
  {
    decision: 'keep',
    rationale: 'The description already connects normal probabilities, a density-area or digital approach, and contextual interpretation without imposing one computation method.',
    evidence: [
      'Ein Ereignis für eine stetige normalverteilte Zufallsgröße entspricht einem Intervall unter der Dichtekurve; die Fläche, nicht die Höhe an einem Einzelpunkt, ist seine Wahrscheinlichkeit.',
      'An event for a continuous normally distributed random variable corresponds to an interval under the density curve; its area, not the height at one point, is its probability.',
      'Die lernende Person übersetzt eine Sachbedingung in passende Grenzen, bestimmt die zugehörige Wahrscheinlichkeit grafisch oder digital und erklärt den Zahlenwert samt Gegenereignis im Sachkontext.',
      'The learner translates a contextual condition into appropriate bounds, determines its probability graphically or digitally, and explains the value and complementary event in context.',
      'Nach einer einseitigen Grenzfrage löst die lernende Person eine neue Frage zu einem begrenzten Intervall bei veränderter Lage oder Streuung und prüft, ob die resultierende Fläche plausibel ist.',
      'After a one-sided threshold question, the learner solves a fresh bounded-interval question with changed location or spread and checks whether the resulting area is plausible.',
    ],
  },
  {
    decision: 'split_review',
    rationale: 'A quantile or interval-boundary problem with fixed distribution and identification of an unknown distribution parameter from a fixed probability are separately assessable inverse tasks. A single wording change would conceal that distinction.',
    evidence: [
      'Bei umgekehrten Normalverteilungsfragen ist die Wahrscheinlichkeit vorgegeben; eine unbekannte Grenze wird über die kumulierte Fläche gefunden, während ein unbekannter Parameter die Dichte selbst verändert.',
      'In inverse normal-distribution questions the probability is given; an unknown boundary is found from cumulative area, whereas an unknown parameter changes the density itself.',
      'Die lernende Person formuliert für eine vorgegebene Wahrscheinlichkeit eine passende Gleichung, löst entweder nach einer Intervallgrenze oder nach einem Verteilungsparameter und prüft die Lösung durch Rückeinsetzen und Kontextdeutung.',
      'The learner formulates an equation for a given probability, solves either for an interval boundary or for a distribution parameter, and checks the result by substitution and contextual interpretation.',
      'Ausgehend von einer oberen Quantilfrage bearbeitet die lernende Person eine neue Spezifikationsfrage mit festem Schwellenwert und unbekanntem Streuungsparameter und erkennt den veränderten Lösungsgegenstand.',
      'Starting from an upper-quantile question, the learner handles a fresh specification problem with a fixed threshold and unknown spread parameter, recognizing the changed unknown.',
    ],
  },
  {
    decision: 'keep',
    rationale: 'Range, probability representation and justified classification are explicitly connected and delimit one distinction between discrete and continuous variables.',
    evidence: [
      'Diskrete Zufallsgrößen haben einzelne mögliche Werte mit Punktwahrscheinlichkeiten; bei stetigen Zufallsgrößen werden Wahrscheinlichkeiten über Intervalle einer Dichte beschrieben und einzelne Werte haben Wahrscheinlichkeit null.',
      'Discrete random variables have individual possible values with point probabilities; for continuous variables probabilities are described over intervals of a density and single values have probability zero.',
      'Die lernende Person klassifiziert eine Zählgröße und eine Messgröße anhand möglicher Werte und erklärt, warum eine Tabelle von Punktwahrscheinlichkeiten beziehungsweise eine Dichtefläche passt.',
      'The learner classifies a count and a measurement from their possible values and explains why a table of point probabilities or a density area is appropriate.',
      'Bei einer neu dargestellten gerundeten Messung unterscheidet die lernende Person die diskreten Anzeigewerte von der zugrunde liegenden stetigen Größe und begründet die gewählte Modellierung.',
      'For a newly presented rounded measurement, the learner distinguishes the discrete displayed values from the underlying continuous quantity and justifies the chosen model.',
    ],
  },
  {
    decision: 'keep',
    rationale: 'The integral formula and its interpretation as accumulated density area already express the intended LK relationship accurately and concisely.',
    evidence: [
      '$\\Phi_{\\mu,\\sigma}(x)$ sammelt die Fläche unter der nichtnegativen Dichte links von $x$; mit wachsendem $x$ kann der Wert nicht abnehmen, und die Dichte ist keine Punktwahrscheinlichkeit.',
      '$\\Phi_{\\mu,\\sigma}(x)$ accumulates the area under the nonnegative density to the left of $x$; its value cannot decrease as $x$ grows, and density is not a point probability.',
      'Die lernende Person markiert zu einem gegebenen $x$ die passende Fläche, erläutert ihre Bedeutung als $P(X\\le x)$ und verknüpft eine Veränderung der Grenze mit dem Verlauf der Verteilungsfunktion.',
      'The learner marks the area corresponding to a given $x$, explains its meaning as $P(X\\le x)$, and relates a change of boundary to the cumulative distribution graph.',
      'Bei einer neuen Normalverteilung mit verschobener Mitte erklärt die lernende Person, wie sich der Wert bei einem festen Schwellenwert verändert, und bestimmt eine Intervallwahrscheinlichkeit als Differenz zweier kumulierter Flächen.',
      'For a fresh normal distribution with a shifted center, the learner explains how the value at a fixed threshold changes and obtains an interval probability as the difference of two accumulated areas.',
    ],
  },
  {
    decision: 'revise',
    rationale: '"Recognize and investigate situations" does not state what warrants the approximation or how its limits are examined. The local revision names a justified assessment of plausibility and its assumptions without prescribing a particular approximation theorem.',
    proposedDescriptionDe: 'Die lernende Person kann in stochastischen Situationen begründet einschätzen, ob eine Zufallsgröße näherungsweise normalverteilt sein kann, und die Annahmen und Grenzen dieser Einordnung erläutern.',
    proposedDescriptionEn: 'The learner can judge with reasons whether a random variable in a stochastic situation may be approximately normally distributed and explain the assumptions and limits of that judgment.',
    evidence: [
      'Eine Normalverteilung ist ein Modell für eine annähernd symmetrische, eingipflige Streuung um eine Mitte; Entstehung der Werte, Schranken und auffällige Schiefe begrenzen seine Plausibilität.',
      'A normal distribution models approximately symmetric, single-peaked variation around a center; how values arise, bounds, and marked skewness limit its plausibility.',
      'Die lernende Person untersucht eine beschriebene Zufallsgröße und ihre Datenform, nennt tragfähige Hinweise für oder gegen ein Normalmodell und formuliert die Modellannahme ausdrücklich als Näherung.',
      'The learner examines a described random variable and its data shape, names relevant evidence for or against a normal model, and explicitly treats the model as an approximation.',
      'Nach einem Messfehlerbeispiel beurteilt die lernende Person unabhängig eine Wartezeit- oder Grenzwertsituation mit anderer Entstehung und begründet, weshalb dieselbe Modellannahme dort schwächer oder stärker ist.',
      'After a measurement-error example, the learner independently judges a waiting-time or bounded-value situation with a different generating mechanism and explains why the same model assumption is weaker or stronger there.',
    ],
  },
  {
    decision: 'keep',
    rationale: 'The description specifically ties orthogonal projection to the geometric meaning of the dot product; its signed character can be made explicit in the evidence profile.',
    evidence: [
      'Das Skalarprodukt verbindet die Länge eines Vektors mit der vorzeichenbehafteten Komponente des anderen in dessen Richtung; bei rechten Winkeln ist diese Komponente null und bei stumpfen Winkeln negativ.',
      'The dot product combines one vector length with the signed component of the other in its direction; that component is zero at a right angle and negative at an obtuse angle.',
      'Die lernende Person konstruiert die orthogonale Projektion zweier gegebener Vektoren, erklärt die zugehörige gerichtete Komponente und verbindet sie mit dem Vorzeichen und Betrag des Skalarprodukts.',
      'The learner constructs the orthogonal projection of two given vectors, explains the directed component, and relates it to the sign and magnitude of the dot product.',
      'Bei einem neu orientierten Vektorpaar mit stumpfem statt spitzem Winkel erläutert die lernende Person ohne bloßes Einsetzen, warum die Projektion in Gegenrichtung und das Skalarprodukt negativ sind.',
      'For a newly oriented vector pair with an obtuse rather than acute angle, the learner explains without mere substitution why the projection points oppositely and the dot product is negative.',
    ],
  },
  {
    decision: 'split_review',
    rationale: 'The phrase "distances between points and lines" spans distinct point-to-point and point-to-line configurations and overlaps the adjacent dedicated point-line goal. Those can be mastered independently; narrowing one sentence would change the present goal identity.',
    evidence: [
      'Ein Abstand im Raum ist die Länge der kürzesten Verbindungsstrecke; Punkt-Punkt-Längen folgen aus dem Differenzvektor, während Punkt-Gerade-Abstände eine senkrechte Komponente zur Geraden erfordern.',
      'A spatial distance is the length of the shortest connecting segment; point-to-point lengths come from a difference vector, whereas point-to-line distances require a component perpendicular to the line.',
      'Die lernende Person identifiziert für eine gegebene Punkt- oder Geradenkonfiguration die gesuchte Strecke, berechnet sie mit passenden Koordinaten- oder Projektionsbeziehungen und deutet die Länge geometrisch.',
      'The learner identifies the required segment in a given point or line configuration, computes it with suitable coordinate or projection relations, and interprets its length geometrically.',
      'Nach einer Punkt-Punkt-Länge bearbeitet die lernende Person eine frische Punkt-Gerade-Konfiguration mit schräger Geraden und erklärt, warum die bloße Länge eines beliebigen Verbindungsvektors kein Abstand ist.',
      'After a point-to-point length, the learner handles a fresh point-to-line configuration with an oblique line and explains why the length of an arbitrary connecting vector is not the distance.',
    ],
  },
  {
    decision: 'keep',
    rationale: 'The dedicated point-line configuration, perpendicular relation, analytic representation and geometric interpretation form one coherent competence.',
    evidence: [
      'Der Abstand eines Punkts zu einer Geraden ist die Länge des Lots; die Differenz zwischen Punkt und Lotfuß steht senkrecht zum Richtungsvektor der Geraden.',
      'The distance from a point to a line is the length of the perpendicular; the difference between the point and its foot is orthogonal to the line direction vector.',
      'Die lernende Person bestimmt für eine Raumgerade den Lotfuß oder die senkrechte Restkomponente, prüft die Orthogonalität mit dem Skalarprodukt und gibt die resultierende Strecke als Abstand an.',
      'For a spatial line, the learner determines the foot or perpendicular remainder, checks orthogonality with the dot product, and gives the resulting segment length as the distance.',
      'Bei einer neuen schrägen Raumgeraden statt einer achsenparallelen Geraden konstruiert die lernende Person dieselbe Lotbeziehung aus der Parameterdarstellung und kontrolliert die Lage des Lotfußes.',
      'For a fresh oblique spatial line instead of an axis-parallel line, the learner constructs the same perpendicular relation from the parametric representation and checks the foot position.',
    ],
  },
  {
    decision: 'keep',
    rationale: 'Choosing a method suited to the point, line or plane configuration is itself the stated competence; the present wording is concise and does not falsely mandate one procedure.',
    evidence: [
      'Das geeignete Abstandsverfahren hängt von den geometrischen Objekten, ihrer Lagebeziehung und der verfügbaren Darstellung ab; jedes Verfahren muss die kürzeste Verbindung oder eine äquivalente Normalenprojektion liefern.',
      'The suitable distance method depends on the geometric objects, their relative position, and the given representation; every method must yield the shortest connection or an equivalent normal projection.',
      'Die lernende Person erkennt die Konfiguration, begründet etwa die Wahl eines Lot-, Projektions- oder Normalenverfahrens und berechnet damit einen nichtnegativen Abstand, den sie geometrisch prüft.',
      'The learner identifies the configuration, justifies a perpendicular, projection, or normal-vector method as appropriate, and computes a nonnegative distance that is checked geometrically.',
      'Nach einem Punkt-Ebene-Abstand erhält die lernende Person eine neue windschiefe oder parallele Konfiguration und passt die Methodenwahl anhand der Lagebeziehung statt durch Übernahme des ersten Rezepts an.',
      'After a point-to-plane distance, the learner receives a fresh skew or parallel configuration and adapts the method to the relative position rather than reusing the first recipe.',
    ],
  },
  {
    decision: 'keep',
    rationale: 'The description already requires analysis, algebraic justification and geometric reading of a line relative to coordinate axes and planes.',
    evidence: [
      'Richtungsvektor und Stützpunkt einer Geraden bestimmen, ob sie zu einer Koordinatenachse oder -ebene parallel ist, darin liegt oder eine Ebene durchstößt; Nullkomponenten allein entscheiden nicht jede Lage.',
      'A line direction vector and support point determine whether it is parallel to a coordinate axis or plane, lies in one, or intersects a plane; zero components alone do not settle every position.',
      'Die lernende Person liest die Parameterform einer Geraden, prüft relevante Koordinatengleichungen und begründet die besondere Lage rechnerisch und in einer räumlichen Skizze.',
      'The learner reads a line in parametric form, checks the relevant coordinate equations, and justifies the special position algebraically and in a spatial sketch.',
      'Bei einer neuen Geraden mit gleichem Richtungsvektor, aber verändertem Stützpunkt erkennt die lernende Person den Wechsel von "in der Ebene" zu "parallel zur Ebene" und begründet ihn.',
      'For a fresh line with the same direction vector but changed support point, the learner detects the change from lying in a plane to being parallel to it and justifies it.',
    ],
  },
  {
    decision: 'revise',
    rationale: '"Division ratios in volumes" does not say which volumes are compared. The replacement clarifies ratios among parts and to the whole while retaining the spatial division, comparison and justification already claimed.',
    proposedDescriptionDe: 'Die lernende Person kann bei räumlichen Teilungen die Verhältnisse der entstehenden Teilvolumina zueinander und zum Gesamtvolumen bestimmen, vergleichen und geometrisch begründen.',
    proposedDescriptionEn: 'The learner can determine, compare, and justify geometrically the ratios of resulting partial volumes to one another and to the total volume in spatial divisions.',
    evidence: [
      'Ein Volumenteilungsverhältnis vergleicht klar benannte Teilkörper oder Teil und Ganzes; bei ähnlichen Körpern wirken lineare Maßstabsfaktoren kubisch, während andere Schnitte eigene Geometrie verlangen.',
      'A volume-division ratio compares clearly identified parts or a part with the whole; for similar solids linear scale factors act cubically, while other cuts require their own geometry.',
      'Die lernende Person bezeichnet die verglichenen Körper, ermittelt ihre Volumina oder nutzt begründete Symmetrie- und Ähnlichkeitsbeziehungen und kontrolliert, ob die Teilvolumina das Ganze ergeben.',
      'The learner names the compared solids, obtains their volumes or uses justified symmetry and similarity relations, and checks whether the partial volumes make up the whole.',
      'Nach einer Halbierung eines Prismas untersucht die lernende Person einen unabhängig gezeigten Schnitt einer Pyramide mit anderer Form und erklärt, ob ein Längenverhältnis dort als Volumenverhältnis taugt.',
      'After dividing a prism in half, the learner examines an independently shown cut through a differently shaped pyramid and explains whether a length ratio is also a volume ratio there.',
    ],
  },
  {
    decision: 'keep',
    rationale: 'The oblique prism, its base area and perpendicular height, the formula, and Cavalieri as a plausibility argument are all explicit without overclaiming a formal proof.',
    evidence: [
      'Schiefes und gerades Prisma mit gleicher Grundfläche und senkrechter Höhe haben in jeder Höhe gleich große parallele Querschnitte; deshalb stützt Cavalieri für beide $V=G\\cdot h$.',
      'An oblique and a right prism with the same base area and perpendicular height have equal parallel cross-section areas at every height; Cavalieri therefore supports $V=G\\cdot h$ for both.',
      'Die lernende Person vergleicht entsprechende Querschnitte eines schiefen und eines geraden Prismas, benennt die senkrechte Höhe und erklärt, warum die Schrägstellung allein das Volumen nicht ändert.',
      'The learner compares corresponding sections of an oblique and a right prism, identifies perpendicular height, and explains why slant alone does not change the volume.',
      'Bei einem neuen schiefen Prisma mit anders geformter Grundfläche und gleicher Höhe begründet die lernende Person erneut über Querschnitte das Volumen und weist die schräge Kantenlänge als falsche Höhe zurück.',
      'For a fresh oblique prism with a differently shaped base and the same height, the learner again argues from sections for its volume and rejects the slanted edge as the height.',
    ],
  },
  {
    decision: 'keep',
    rationale: 'The formula, a suitable decomposition or comparison, and the meaning of the one-third factor are clear and are one justification competence.',
    evidence: [
      'Bei gleicher Grundfläche und senkrechter Höhe hat eine Pyramide ein Drittel des Volumens des entsprechenden Prismas; der Faktor $\\frac13$ beschreibt eine geometrische Volumenbeziehung, nicht eine verkürzte Höhe.',
      'With the same base area and perpendicular height, a pyramid has one third of the volume of the corresponding prism; the factor $\\frac13$ describes a geometric volume relationship, not a shortened height.',
      'Die lernende Person führt einen geeigneten Zerlegungs- oder Vergleichsgedanken aus, benennt Grundfläche und senkrechte Höhe und erklärt damit den Faktor $\\frac13$ statt ihn nur in eine Formel einzusetzen.',
      'The learner carries out a suitable decomposition or comparison, identifies base area and perpendicular height, and thereby explains the factor $\\frac13$ instead of merely substituting into a formula.',
      'Nach einer geraden Pyramide über rechteckiger Grundfläche überträgt die lernende Person den Vergleich auf eine schiefe Pyramide mit anderer Grundfläche und prüft die Rolle der senkrechten Höhe.',
      'After a right pyramid on a rectangular base, the learner transfers the comparison to an oblique pyramid with a different base and checks the role of perpendicular height.',
    ],
  },
  {
    decision: 'keep',
    rationale: 'The LK process goal already names explicit constraints and requires a justified strategy choice; details of comparisons belong in the evidence profile.',
    evidence: [
      'Eine mathematische Strategie ist unter gegebenen Randbedingungen tragfähig, wenn ihr Aufwand, verfügbare Hilfsmittel und erreichbare Genauigkeit zum Problem und zur Zielvorgabe passen.',
      'A mathematical strategy is suitable under given constraints when its effort, available tools, and attainable accuracy fit the problem and target.',
      'Die lernende Person vergleicht zwei mögliche Lösungswege für ein konkretes Problem anhand von Zeit, Hilfsmitteln und Genauigkeitsziel und begründet ihre Wahl mit einem entscheidenden Kriterium.',
      'The learner compares two possible routes for a concrete problem in terms of time, tools, and target accuracy and justifies the choice using a decisive criterion.',
      'Wird dasselbe Problem als neue Aufgabe ohne digitales Werkzeug oder mit engerer Fehlertoleranz gestellt, überprüft die lernende Person ihre frühere Entscheidung und wählt gegebenenfalls einen anderen Weg.',
      'When the same problem is posed afresh without a digital tool or with a tighter error tolerance, the learner revisits the earlier decision and, if warranted, chooses another route.',
    ],
  },
  {
    decision: 'keep',
    rationale: 'The goal already links the informative value of a visualization to scaling, data quality and a reasoned improvement, rather than claiming that a diagram alone proves a conclusion.',
    evidence: [
      'Eine Visualisierung zeigt nur ausgewählte Aspekte der Daten; Achsenskalierung, Auslassungen und Datenqualität beeinflussen, welche Vergleiche und Schlussfolgerungen sie trägt.',
      'A visualization shows selected aspects of data only; axis scaling, omissions, and data quality affect which comparisons and conclusions it supports.',
      'Die lernende Person benennt an einer konkreten Datendarstellung eine belastbare Aussage, eine durch Skalierung oder Datenlage verursachte Grenze und eine dazu passende Verbesserung.',
      'The learner identifies one warranted statement, one limitation caused by scaling or data quality, and a suitable improvement in a concrete data display.',
      'Bei einer unabhängig vorgelegten Darstellung derselben Daten mit anderer Achse oder Stichprobenbasis vergleicht die lernende Person die scheinbare Aussage und begründet, welche Deutung weiterhin tragfähig ist.',
      'Given an independently presented display of the same data with a changed axis or sample basis, the learner compares the apparent message and explains which interpretation remains warranted.',
    ],
  },
  {
    decision: 'keep',
    rationale: 'Effort, accuracy and suitable comparison criteria are already present as the complete LK process competence.',
    evidence: [
      'Verfahren können sich in Zahl und Art der Rechenschritte, Rechenzeit, Näherungsfehler und Kontrollierbarkeit unterscheiden; ein Kriterium ist nur sinnvoll im Verhältnis zum geforderten Ergebnis.',
      'Methods can differ in the number and type of steps, computation time, approximation error, and ease of checking; a criterion matters only relative to the required result.',
      'Die lernende Person vergleicht für ein gegebenes Problem zwei Verfahren anhand expliziter Aufwands- und Genauigkeitskriterien und erklärt, wann der Genauigkeitsgewinn den Mehraufwand rechtfertigt.',
      'For a given problem, the learner compares two methods using explicit effort and accuracy criteria and explains when the accuracy gain justifies the extra effort.',
      'Bei einer neuen Aufgabe mit größeren Datenmengen oder strengerer Fehlerschranke überprüft die lernende Person die Rangfolge der Verfahren und passt die Bewertung an.',
      'For a fresh task with more data or a stricter error bound, the learner rechecks the ranking of methods and adapts the assessment.',
    ],
  },
  {
    decision: 'keep',
    rationale: 'Finding parameter-dependent extremum coordinates, eliminating the parameter and deriving the locus form a coherent single construction, with parameter restrictions left to the evidence profile.',
    evidence: [
      'Die Ortskurve enthält genau die Extrempunkte gültiger Scharmitglieder; Ableitungsbedingungen liefern parameterabhängige Koordinaten, und die Parameterelimination darf keine unzulässigen Punkte hinzufügen.',
      'The locus contains precisely the extrema of valid members of the function family; derivative conditions give parameter-dependent coordinates, and eliminating the parameter must not add inadmissible points.',
      'Die lernende Person bestimmt für eine Schar tatsächliche Extrempunkte, schreibt deren Koordinaten als Funktionen des Parameters, eliminiert ihn und prüft die resultierende Kurve an Parameterbereich und Extremumbedingung.',
      'The learner finds actual extrema of a family, writes their coordinates as functions of the parameter, eliminates it, and checks the resulting curve against the parameter domain and extremum condition.',
      'Bei einer neuen Schar, in der ein Parameterwert keinen Extrempunkt liefert, leitet die lernende Person die Ortskurve her und begründet, warum ein algebraisch möglicher Punkt ausgeschlossen bleibt.',
      'For a fresh family in which one parameter value produces no extremum, the learner derives the locus and explains why an algebraically possible point remains excluded.',
    ],
  },
  {
    decision: 'keep',
    rationale: 'The description gives the specific inflection-point construction and parameter elimination; checking actual changes of curvature belongs in the evidence profile.',
    evidence: [
      "Die Ortskurve von Wendepunkten besteht aus den tatsächlichen Krümmungswechselpunkten gültiger Scharmitglieder; $f''(x)=0$ allein ist nur ein Kandidatenkriterium, und Parameterelimination kann fremde Punkte erzeugen.",
      "The locus of inflection points consists of actual curvature-change points of valid family members; $f''(x)=0$ alone gives only candidates, and parameter elimination can create extraneous points.",
      'Die lernende Person prüft bei einer Schar den Krümmungswechsel, bestimmt die parameterabhängigen Wendepunktkoordinaten, eliminiert den Parameter und kontrolliert die zulässige Punktmenge.',
      'The learner checks the change of curvature in a family, determines parameter-dependent inflection-point coordinates, eliminates the parameter, and checks the admissible point set.',
      'Bei einer neuen Schar mit einem Parameterwert ohne Krümmungswechsel unterscheidet die lernende Person den bloßen Nullstellenkandidaten vom Wendepunkt und beschränkt die hergeleitete Ortskurve entsprechend.',
      'For a fresh family with a parameter value lacking a curvature change, the learner distinguishes a mere zero candidate from an inflection point and restricts the derived locus accordingly.',
    ],
  },
  {
    decision: 'revise',
    rationale: '"Without a jump or kink" has precise conditions at the join. Naming equality of function values and first derivatives makes the already claimed modeling competence directly understandable without adding a new method.',
    proposedDescriptionDe: 'Die lernende Person kann Anschlüsse ganzrationaler Funktionen ohne Sprung und Knick modellieren, indem sie Funktionswerte und erste Ableitungen an der Anschlussstelle passend gleichsetzt und die Bedingungen deutet.',
    proposedDescriptionEn: 'The learner can model joins of polynomial functions without jumps or kinks by matching function values and first derivatives at the join and interpreting those conditions.',
    evidence: [
      'Ein Anschluss ohne Sprung verlangt gleiche Funktionswerte; ein Anschluss ohne Knick verlangt zusätzlich gleiche erste Ableitungen am selben Übergangspunkt, also passende Lage und Steigung.',
      'A join without a jump requires equal function values; a join without a kink additionally requires equal first derivatives at the same joining point, matching both position and slope.',
      'Die lernende Person stellt für zwei ganzrationale Teilfunktionen an einer vorgegebenen Anschlussstelle Wert- und Steigungsgleichungen auf, bestimmt freie Koeffizienten und erklärt die geometrische Wirkung beider Bedingungen.',
      'The learner sets up value and slope equations for two polynomial pieces at a specified join, determines free coefficients, and explains the geometric effect of both conditions.',
      'Bei einer frischen stückweisen Modellierung mit anderer Anschlussstelle und vorgegebener Tangentensteigung passt die lernende Person die Gleichungen an und prüft den fertigen Graphen auf Sprung und Knick.',
      'For a fresh piecewise model with a different join and specified tangent slope, the learner adapts the equations and checks the resulting graph for a jump and a kink.',
    ],
  },
]

if (pages.length !== decisions.length || pages.length !== batch.goalIds.length) {
  throw new Error('Round B authoring count differs from the bound batch')
}
const records = pages.map((page, index) => {
  const g = page.goal
  const d = decisions[index]
  const [essentialUnderstandingDe, essentialUnderstandingEn, observablePerformanceDe, observablePerformanceEn, transferExpectationDe, transferExpectationEn] = d.evidence
  const record = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1,
    recordId: `${runId}.goal-${String(index + 1).padStart(3, '0')}`,
    runId,
    campaignId: campaign.campaignId,
    roundId: campaign.roundId,
    bundleFingerprint: campaign.bundleFingerprint,
    bookDigest: campaign.bookDigest,
    goalId: g.goalId,
    goalFingerprint: g.goalFingerprint,
    pageFingerprint: g.pageFingerprint,
    currentTitleDe: g.currentTitleDe,
    currentTitleEn: g.currentTitleEn,
    currentDescriptionDe: g.currentDescriptionDe,
    currentDescriptionEn: g.currentDescriptionEn,
    decision: d.decision,
    ...(d.decision === 'revise' ? {
      proposedDescriptionDe: typeof d.proposedDescriptionDe === 'function' ? d.proposedDescriptionDe(g) : d.proposedDescriptionDe,
      proposedDescriptionEn: typeof d.proposedDescriptionEn === 'function' ? d.proposedDescriptionEn(g) : d.proposedDescriptionEn,
    } : {}),
    understandingEvidence: { essentialUnderstandingDe, essentialUnderstandingEn, observablePerformanceDe, observablePerformanceEn, transferExpectationDe, transferExpectationEn },
    rationale: d.rationale,
    evidenceProfileContract: 'positive-understanding-evidence-v2',
    evidenceProfileRecommendation: 'create',
    recordStatus: 'candidate',
    reviewAuthority: 'ai_candidate',
  }
  if (record.goalId !== batch.goalIds[index]) throw new Error(`Wrong goal order at ${index + 1}`)
  if (d.decision === 'revise' && (record.proposedDescriptionDe === g.currentDescriptionDe || record.proposedDescriptionEn === g.currentDescriptionEn)) {
    throw new Error(`Revision did not change both languages for ${g.goalId}`)
  }
  return record
})

const resultsDir = resolve(here, 'results')
mkdirSync(resultsDir, { recursive: true })
const recordsPath = resolve(resultsDir, `${batch.batchId}.records.jsonl`)
const recordsBytes = `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
writeFileSync(recordsPath, recordsBytes)

const artifactDigest = (role) => bundle.artifacts.find((artifact) => artifact.role === role)?.digest
const now = new Date().toISOString()
const run = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
  schemaVersion: 1,
  runId,
  campaignId: campaign.campaignId,
  roundId: campaign.roundId,
  batchId: batch.batchId,
  batchInputFingerprint: batch.batchInputFingerprint,
  bundleFingerprint: campaign.bundleFingerprint,
  bookDigest: campaign.bookDigest,
  provider: 'openai',
  model: 'gpt-6-astra',
  role: 'subject_reviewer',
  promptFamilyId: 'goal-description-understanding-evidence-review-v2',
  promptFingerprint: campaign.promptFingerprint,
  criteriaFingerprint: campaign.criteriaFingerprint,
  generationParametersFingerprint: digest('interactive-codex-independent-round-b-review'),
  independenceGroupId: campaign.independenceGroupId,
  blindToOtherRuns: true,
  goalIds: batch.goalIds,
  inputArtifacts: [
    { role: 'review_prompt', digest: artifactDigest('review_prompt') },
    { role: 'review_criteria', digest: artifactDigest('review_criteria') },
    { role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint },
  ],
  startedAt: now,
  completedAt: now,
  status: 'completed',
  outputDigest: digest(recordsBytes),
  toolchainVersion: 'goal-description-review-v2',
}
writeFileSync(resolve(resultsDir, `${batch.batchId}.run.json`), `${JSON.stringify(run, null, 2)}\n`)
console.log(JSON.stringify({ recordsPath, count: records.length, decisions: records.reduce((counts, record) => (counts[record.decision] = (counts[record.decision] || 0) + 1, counts), {}), outputDigest: run.outputDigest }))
