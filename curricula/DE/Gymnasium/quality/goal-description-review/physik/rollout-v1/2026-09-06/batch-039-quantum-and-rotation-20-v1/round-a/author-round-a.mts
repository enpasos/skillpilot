import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { stableGoalBookJson } from '/home/enpasos/projects/skillpilot/app/scripts/goalBookModel.ts'
import { validateGoalDescriptionReviewBatch } from '/home/enpasos/projects/skillpilot/app/scripts/validateGoalDescriptionReviewCampaign.ts'

// Individual blind review A. Current input pages and all 20 hash-matched images
// were read/opened in this review. No other rounds or synthesis were inspected.
// Exact provider model identifier and generation settings are not disclosed.
const reviewStartedAt = '2026-09-06T22:01:33Z'
const here = dirname(fileURLToPath(import.meta.url))
const readJson = async (name: string) => JSON.parse(await readFile(resolve(here, name), 'utf8'))
const input = await readJson('description-review-input.json')
const campaign = await readJson('description-review-campaign.json')
const bundle = await readJson('review-bundle-manifest.json')
const batch = campaign.batches[0]
const sha256 = (value: string | Buffer) => 'sha256:' + createHash('sha256').update(value).digest('hex')
const runId = 'physics-b039-a-codex-20260906T220133Z'
type Decision = { id: string; decision: 'keep' | 'revise' | 'split_review' | 'block'; rationale: string; evidence: [string,string,string,string,string,string]; proposedDescriptionDe?: string; proposedDescriptionEn?: string }
const decisions: Decision[] = [
  {
    id: 'd5bff282-741f-4cc5-9622-b77584fdcc5a', decision: 'keep',
    rationale: 'Der kurze DE/EN-Text trennt bereits die Modellzeitentwicklung von probabilistischen Messergebnissen. Die Voraussetzungen zur Wahrscheinlichkeitsdeutung begrenzen den Anschluss; eine Lösung der Schrödingergleichung wird nicht beansprucht. Die Bedingungen der deterministischen Entwicklung und der Ensemblebezug werden im Profil konkretisiert. Das geöffnete Bild trennt Modell und Messung ebenfalls, ersetzt aber keine selbstständige Erklärung.',
    evidence: [
      'Bei festgelegtem Anfangszustand und festgelegter Dynamik ist die ungestörte Zustandsentwicklung im quantenmechanischen Modell eindeutig. Der entwickelte Zustand legt Wahrscheinlichkeiten möglicher Messergebnisse fest, ohne damit im Allgemeinen das einzelne Ergebnis festzulegen.',
      'With a specified initial state and dynamics, undisturbed state evolution is unique in the quantum model. The evolved state determines probabilities of possible measurement outcomes without generally fixing the individual outcome.',
      'Die lernende Person erklärt an einer vorgegebenen zeitlichen Zustandsdarstellung selbstständig, was das Modell eindeutig vorhersagt und welche Aussagen erst viele gleich präparierte Messungen prüfen. Sie unterscheidet einen veränderten Zustand von einem einzelnen registrierten Messwert.',
      'Using a supplied representation of state evolution, the learner independently explains what the model predicts uniquely and which statements are tested using many identically prepared measurements. They distinguish a changed state from an individual recorded value.',
      'In einer neuen Aufgabe wird bei gleicher Präparation zu einem anderen Zeitpunkt gemessen, an dem eine andere Ergebnisverteilung vorgegeben ist. Die lernende Person erklärt, warum diese Änderung mit deterministischer Zustandsentwicklung und weiterhin probabilistischen Einzelereignissen vereinbar ist.',
      'A fresh task measures the same preparation at a different time with a different supplied outcome distribution. The learner explains why that change is compatible with deterministic state evolution and still-probabilistic individual events.',
    ],
  },
  {
    id: '1a1c09f0-96b7-4c33-a623-0e8101537876', decision: 'keep',
    rationale: 'Die beiden Beschreibungen operationalisieren einen zusammenhängenden Kern: die statistische Entstehung des Interferenzmusters aus Einzelereignissen. Weginformation und Messkontext gehören zum Nachfolger und werden hier nicht als neue Kompetenz eingeführt. Im geöffneten Bild ist das Feld mit der Beschriftung „20 Treffer“ mit deutlich mehr Punkten gezeichnet; das ist ein separater Bildhinweis, kein Defekt der Beschreibung und keine Publikationsfreigabe.',
    evidence: [
      'Ein einzelnes Quantenobjekt wird lokal registriert; ein Interferenzmuster zeigt sich in der Häufigkeitsverteilung vieler gleich präparierter Einzelereignisse. Das Muster beschreibt Trefferwahrscheinlichkeiten und setzt keine Wechselwirkung zwischen gleichzeitig anwesenden Quantenobjekten voraus.',
      'An individual quantum object is detected locally; an interference pattern appears in the frequency distribution of many identically prepared events. The pattern describes detection probabilities and does not require interaction between simultaneously present quantum objects.',
      'Die lernende Person deutet selbstständig eine neue Folge kumulierter Trefferbilder, benennt statistische Schwankungen bei kleinen Anzahlen und begründet, weshalb aus dem späteren Muster kein sicherer Ort des nächsten Treffers folgt.',
      'The learner independently interprets a new sequence of cumulative detection images, identifies statistical fluctuations in small samples, and explains why the later pattern does not determine the next detection position with certainty.',
      'Eine neue Aufgabe verändert die Emissionsrate so, dass die Quantenobjekte zeitlich noch weiter getrennt sind, während Präparation und Anordnung gleich bleiben. Die lernende Person begründet das gleichartige relative Muster bei gleicher Gesamtzahl und die längere Aufbauzeit.',
      'A fresh task lowers the emission rate so quantum objects are further separated in time while preparation and apparatus stay unchanged. The learner explains the similar relative pattern at the same total count and its longer accumulation time.',
    ],
  },
  {
    id: '6031bed0-9baa-4f45-b2a5-57ffb00d39cc', decision: 'keep',
    rationale: 'Die Beschreibung setzt Interferenzsichtbarkeit ausdrücklich zur verfügbaren Weginformation in Beziehung und behauptet keinen bewussten Beobachter als Ursache. Beide Sprachen decken dieselbe atomare Beziehung ab. Das geöffnete Zwei-Felder-Bild liefert qualitative Grenzfälle; Teilunterscheidbarkeit und unabhängige Begründung lassen sich im Profil präzisieren.',
    evidence: [
      'Die Unterscheidbarkeit der Wege begrenzt die mögliche Interferenzsichtbarkeit. Vollständig unterscheidbare Wege tragen im unbedingten Ergebnisensemble kein Interferenzmuster; die physikalische Verfügbarkeit der Information ist entscheidend, nicht ihre bewusste Kenntnisnahme.',
      'Path distinguishability limits possible interference visibility. Fully distinguishable paths produce no interference pattern in the unconditional outcome ensemble; physical availability of the information matters, not conscious awareness of it.',
      'Die lernende Person vergleicht selbstständig zwei vorgegebene Anordnungen mit und ohne eindeutige Wegmarkierung und begründet den Unterschied ihrer möglichen Interferenzsichtbarkeit aus der Unterscheidbarkeit der Alternativen.',
      'The learner independently compares two supplied setups with and without definite path marking and explains their different possible interference visibility from the distinguishability of the alternatives.',
      'In einer neuen Aufgabe bleibt eine eindeutige Wegmarkierung physikalisch gespeichert, wird aber von niemandem abgelesen. Die lernende Person erklärt, warum das Weglassen des Ablesens allein kein Interferenzmuster wiederherstellt.',
      'In a fresh task, definite path information remains physically recorded but nobody reads it. The learner explains why omitting that reading alone does not restore an interference pattern.',
    ],
  },
  {
    id: 'f6e5929f-d52a-42a4-a5d2-ff498ee7083f', decision: 'keep',
    rationale: 'Qualitative Begründung der Orts-Impuls-Unbestimmtheit und ihre Konsequenz für den klassischen Bahnbegriff bilden hier eine Argumentationskette. Eine Aufspaltung würde diese direkte Begründungsbeziehung zerlegen. DE/EN sind äquivalent; der Seitenkontext verlangt keinen formalen Beweis. Die geöffnete Spaltdarstellung wird als Modellhilfe für die zusammengehörigen transversalen Größen gelesen.',
    evidence: [
      'Eine räumlich eng lokalisierte Wellenpaketbeschreibung benötigt eine breitere Verteilung der zugehörigen Impulskomponente. Die Unbestimmtheit betrifft Zustandsverteilungen und kann nicht allein auf ungenaue Geräte zurückgeführt werden; ein klassischer Zustand mit zugleich beliebig scharfem Ort und Impuls steht damit nicht allgemein zur Verfügung.',
      'A narrowly localized wave-packet description requires a wider distribution of the corresponding momentum component. Uncertainty concerns state distributions and cannot be attributed solely to inaccurate instruments; a classical state with arbitrarily sharp position and momentum is not generally available.',
      'Die lernende Person erklärt selbstständig anhand zweier Spaltpräparationen den Zusammenhang zwischen transversaler Ortslokalisierung und Impulsstreuung und begründet daraus die Grenze einer klassischen, durch scharfe Anfangswerte bestimmten Bahn.',
      'The learner independently explains the relationship between transverse localization and momentum spread for two slit preparations and uses it to justify the limit of a classical trajectory determined by sharp initial values.',
      'Eine neue Aufgabe vertauscht die Orientierung des einengenden Spalts. Die lernende Person ordnet die größere Impulsstreuung der nun eingeengten Raumrichtung zu und erklärt, warum damit keine gleichzeitige exakte Bahnrekonstruktion gewonnen wird.',
      'A fresh task rotates the confining slit. The learner assigns the greater momentum spread to the newly confined spatial direction and explains why this does not yield an exact simultaneous trajectory reconstruction.',
    ],
  },
  {
    id: '727d0946-7019-50ed-8fc6-85db12508733', decision: 'keep',
    rationale: 'Der diskursive Anspruch ist durch Präparation, Messung und Wahrscheinlichkeitsaussagen ausreichend physikalisch eingegrenzt. Der Text behauptet weder eine bestimmte Interpretation als Tatsache noch eine Bewusstseinswirkung. Das Profil macht die fachlichen Kriterien einer Diskussion sichtbar, ohne weitere Interpretationsschulen zur Pflicht zu machen. Das geöffnete Bild unterscheidet Präparation, Modellverteilung und Klick.',
    evidence: [
      'Präparation legt die experimentellen Bedingungen fest; Messungen liefern Einzelereignisse und statistische Daten. Die quantenmechanische Beschreibung verbindet diese mit Wahrscheinlichkeiten. Aussagen über eine unabhängig davon bestehende Realität sind von direkt geprüften Aussagen und interpretativen Zusatzannahmen zu unterscheiden.',
      'Preparation specifies experimental conditions; measurements yield individual events and statistical data. The quantum description connects them through probabilities. Claims about reality existing independently of those procedures must be distinguished from directly tested statements and additional interpretative assumptions.',
      'Die lernende Person prüft selbstständig eine vorgelegte Aussage über vor der Messung vorhandene Eigenschaften, benennt ihre empirische Grundlage und etwaige Zusatzannahmen und formuliert eine fachlich begründete, hinsichtlich ihrer Reichweite begrenzte Position.',
      'The learner independently examines a supplied claim about properties existing before measurement, identifies its empirical basis and additional assumptions, and formulates a scientifically reasoned position with an explicit limit to its reach.',
      'Eine neue Aufgabe bietet zwei Deutungen, die dieselben angegebenen Messhäufigkeiten vorhersagen. Die lernende Person erklärt, welche Aussagen die Daten stützen und welche Unterschiede anhand dieser Daten allein nicht entschieden werden können.',
      'A fresh task presents two interpretations predicting the same supplied measurement frequencies. The learner explains which statements the data support and which differences those data alone cannot decide.',
    ],
  },
  {
    id: 'e296aba6-f407-5944-a2bd-e5296e4c9f06', decision: 'keep',
    rationale: 'Aufbau, Ringdeutung und Erschließen des Impuls-Wellenlängen-Zusammenhangs sind die zusammenhängenden Schritte dieses konkreten Auswertungsexperiments. Das ist keine bloße Sammlung unabhängiger Routinen. Beide Sprachen benennen denselben Versuch; die geöffneten Ringe und der Spannungstrend dienen nur als Lernhilfe. Messunsicherheit und nichtrelativistische Auswertung gehören in das Profil.',
    evidence: [
      'Die Beschleunigungsspannung bestimmt im geeigneten nichtrelativistischen Modell den Elektronenimpuls; die Beugungsgeometrie des Kristalls verknüpft Ringradien mit Wellenlängen. Spannung und Ringdurchmesser sind Messgrößen, Impuls und Wellenlänge daraus erschlossene Größen; ihr Zusammenhang ist λ = h/p.',
      'Within an appropriate nonrelativistic model, accelerating voltage determines electron momentum; crystal diffraction geometry relates ring radii to wavelengths. Voltage and ring diameter are measured quantities, while momentum and wavelength are inferred from them; their relationship is λ = h/p.',
      'Die lernende Person erklärt selbstständig Quelle, Beschleunigung, Graphitfolie und Schirm und wertet bereitgestellte Spannungs- und Ringdaten mit vorgegebener Geometrie aus. Sie beurteilt den inversen Impuls-Wellenlängen-Trend unter Berücksichtigung ablesbarer Unsicherheiten.',
      'The learner independently explains the source, acceleration, graphite foil, and screen and analyzes supplied voltage and ring data with specified geometry. They assess the inverse momentum-wavelength trend while considering available reading uncertainties.',
      'In einer neuen Datenauswertung wird der Abstand zwischen Folie und Schirm verändert. Die lernende Person trennt die dadurch veränderten Ringradien von einer tatsächlichen Wellenlängenänderung und prüft den Impulszusammenhang erneut; ein eigener Hochspannungsversuch ist nicht erforderlich.',
      'A fresh data task changes the foil-to-screen distance. The learner distinguishes the resulting change in ring radii from an actual wavelength change and checks the momentum relationship again; no independent high-voltage experiment is required.',
    ],
  },
  {
    id: '52b6722a-b3b2-5d2d-a507-0215532b0422', decision: 'keep',
    rationale: 'Phasenbeziehungen, Zeigerdiagramme und Weginformation sind hier koordinierte Erklärungswerkzeuge für dasselbe Einzelphotonenexperiment. Die Beschreibungen sind äquivalent und konkret genug. Das geöffnete Bild zeigt Strahlteiler, zwei Wege und Ausgänge; seine Verbindungslinien dürfen nicht zu verborgenen klassischen Photonbahnen umgedeutet werden.',
    evidence: [
      'Bei kohärenten ununterscheidbaren Alternativen bestimmen die relativen Phasen der Wahrscheinlichkeitsamplituden die Ausgangswahrscheinlichkeiten. Zeiger repräsentieren diese Amplituden; Weginformation verändert die Interferenzfähigkeit. Ein einzelnes Photon wird an einem Ausgang registriert und nicht als zwei halbe Detektorklicks.',
      'For coherent indistinguishable alternatives, the relative phases of probability amplitudes determine output probabilities. Phasors represent those amplitudes; path information changes interference capability. An individual photon is recorded at one output, not as two half-clicks.',
      'Die lernende Person konstruiert selbstständig aus vorgegebenen Strahlteiler- und Phasenkonventionen passende Zeigerdiagramme für beide Ausgänge und deutet die erwarteten Klickhäufigkeiten. Sie erklärt, wie eindeutige Wegmarkierung diese Vorhersage verändert.',
      'Using supplied beam-splitter and phase conventions, the learner independently constructs phasor diagrams for both outputs and interprets expected click frequencies. They explain how definite path marking changes that prediction.',
      'In einer neuen Aufgabe wird der zweite Strahlteiler entfernt. Die lernende Person erklärt, warum die Ausgänge nun Weginformation liefern und eine reine Phasenänderung im idealen Aufbau ihre Zählwahrscheinlichkeiten nicht mehr durch Interferenz verschiebt.',
      'A fresh task removes the second beam splitter. The learner explains why the outputs now provide path information and why a pure phase change in the ideal setup no longer shifts their counting probabilities through interference.',
    ],
  },
  {
    id: 'accb1d9e-cd48-5983-bcef-9b9bca4a9114', decision: 'keep',
    rationale: 'Die gleichförmige Kreisbewegung und ihre quantitative Analyse sind klar benannt. Der Voraussetzungsnachbar trägt bereits die Herleitung der resultierenden Zentripetalkraft; sie wird nicht erneut verlangt. Der gebundene Seitenkontext enthält eine Sek-I-Projektion, weshalb das Profil bei elementaren Kräften, Richtungen und Algebra bleibt. Das geöffnete Rechenbild ist als Beispiel konsistent.',
    evidence: [
      'Bei gleichförmiger Kreisbewegung bleibt der Geschwindigkeitsbetrag konstant, seine Richtung ändert sich. Die nach innen gerichtete resultierende Kraft hat den Betrag mv²/r und wird durch konkrete Wechselwirkungen bereitgestellt; sie ist keine zusätzliche Kraft neben diesen.',
      'In uniform circular motion, speed stays constant while velocity direction changes. The inward resultant force has magnitude mv²/r and is supplied by concrete interactions; it is not an additional force alongside them.',
      'Die lernende Person benennt in einer einfachen neuen Situation die nach innen wirkende Kraft, zeichnet Kraft- und Geschwindigkeitsrichtung und berechnet eine gesuchte Größe mit passenden Einheiten. Sie erläutert den Zusammenhang zwischen Kreisradius, Geschwindigkeit und Kraftbedarf.',
      'In a simple new situation, the learner identifies the inward force, draws force and velocity directions, and calculates an unknown with appropriate units. They explain the relationship between radius, speed, and required force.',
      'Eine unabhängige Aufgabe ersetzt den Faden durch eine Feder, die dieselbe Kreisbewegung ermöglicht. Die lernende Person bestimmt den nötigen Federkraftbetrag und erklärt, weshalb die Zentripetalkraftbeziehung trotz anderer Wechselwirkung gilt.',
      'An independent task replaces the string with a spring providing the same circular motion. The learner determines the required spring force and explains why the centripetal-force relation remains valid despite the different interaction.',
    ],
  },
  {
    id: 'e2da5eec-45de-5527-9ad7-16f41cacbe58', decision: 'keep',
    rationale: 'Die Verbindung von Haftreibung und Zentripetalkraft ist eine konkrete quantitative Anwendung. Weder überhöhte Kurven noch vollständige Fahrdynamik müssen in diesen Text aufgenommen werden; dafür bestehen eigene Nachbarn. Das geöffnete Beispiel unterscheidet benötigte und maximale Haftreibung korrekt. Modellbedingungen und Grenzprüfung werden im Profil festgelegt.',
    evidence: [
      'Bei einer einfachen ebenen Kurvenfahrt mit konstantem Geschwindigkeitsbetrag liefert die seitliche Haftreibung die erforderliche Zentripetalkraft. Die tatsächlich benötigte Reibung mv²/r muss unter ihrer Grenze μN liegen; auf horizontaler Fahrbahn ohne zusätzliche Vertikalkräfte gilt N = mg.',
      'In simple level cornering at constant speed, lateral static friction supplies the required centripetal force. The required friction mv²/r must not exceed μN; on a level road without additional vertical forces, N = mg.',
      'Die lernende Person erstellt selbstständig eine Kräftebilanz für ein vereinfachtes Fahrzeugmodell, berechnet benötigte und maximal verfügbare Haftreibung und begründet, ob die vorgegebene Kurvenfahrt im Modell möglich ist.',
      'The learner independently sets up a force balance for a simplified vehicle model, calculates required and maximum available static friction, and explains whether the specified cornering is possible within that model.',
      'Eine neue Aufgabe wechselt bei gleicher Bahn von trockenem zu nassem Belag und gibt die jeweiligen Haftreibungswerte vor. Die lernende Person erklärt den Regimewechsel zur Haftgrenze und leitet eine passende Geschwindigkeitsbeschränkung im Modell ab.',
      'A fresh task changes the same road from dry to wet and supplies the corresponding static-friction coefficients. The learner explains crossing the friction limit and derives a suitable speed limit within the model.',
    ],
  },
  {
    id: '39b2a0c4-eecf-5049-b58f-e790790a3bf2', decision: 'keep',
    rationale: 'Die Beschreibung ist ausdrücklich qualitativ und bezugssystembezogen. Der Bezug auf rotierende Systeme macht den Kompetenzkern greifbar; ein vollständiger mathematischer Katalog von Trägheitskräften wäre eine Ausweitung. Das geöffnete Bild stellt dieselbe Kreisbewegung in zwei Systemen dar. Der allgemeine sourceRef ist kein eigenständig geprüfter normativer Mappingnachweis.',
    evidence: [
      'In einem beschleunigten Bezugssystem können zusätzliche Trägheitskraftterme nötig sein, um Bewegungen mit einer Newton-artigen Kräftebilanz zu beschreiben. Sie entstehen durch die Systemwahl; dieselbe Bewegung wird im Inertialsystem durch reale Wechselwirkungen erklärt.',
      'In an accelerated reference frame, additional inertial-force terms may be needed to describe motion with a Newton-style force balance. They arise from the frame choice; the same motion is explained through real interactions in an inertial frame.',
      'Die lernende Person erklärt selbstständig einen auf einer gleichförmig rotierenden Plattform relativ ruhenden Körper aus beiden Bezugssystemen. Sie unterscheidet die reale Haltekraft von der im mitrotierenden System eingeführten Zentrifugalkraft.',
      'The learner independently explains a body at rest relative to a uniformly rotating platform from both reference frames. They distinguish the real restraining force from the centrifugal force introduced in the co-rotating frame.',
      'Eine neue Aufgabe betrachtet einen in einem geradlinig beschleunigenden Wagen ruhenden Gegenstand. Die lernende Person überträgt die Bezugssystemargumentation und erklärt die Richtung der dort angesetzten Scheinkraft qualitativ.',
      'A fresh task considers an object at rest in a linearly accelerating carriage. The learner transfers the reference-frame reasoning and qualitatively explains the direction of the fictitious force used there.',
    ],
  },
  {
    id: 'cf570e66-2ce2-5923-9033-c97d74119553', decision: 'keep',
    rationale: 'Definition, Berechnung und einfache Hebelanwendung konkretisieren dieselbe Drehwirkung. Der AB1-Anspruch bleibt erhalten; eine formale Vektorrechnung ist nicht erforderlich. Beide Sprachen passen zusammen. Das geöffnete Bild verdeutlicht den Hebelarm; das Profil klärt dessen senkrechte Messrichtung und Drehsinn.',
    evidence: [
      'Die Drehwirkung einer Kraft hängt von der gewählten Achse, dem Kraftbetrag und dem senkrechten Abstand ihrer Wirkungslinie zur Achse ab. M = F mal Hebelarm beschreibt den Betrag; der Drehsinn muss zusätzlich aus der Anordnung bestimmt werden.',
      'The turning effect of a force depends on the chosen axis, force magnitude, and perpendicular distance of its line of action from the axis. M = F times lever arm gives the magnitude; the turning direction must also be determined from the arrangement.',
      'Die lernende Person markiert an einem einfachen Hebel selbstständig Drehachse, Wirkungslinie und Hebelarm, berechnet das Moment in Nm und erklärt, wie eine andere Angriffsstelle die Drehwirkung verändert.',
      'On a simple lever, the learner independently marks the rotation axis, line of action, and lever arm, calculates torque in Nm, and explains how a different application point changes the turning effect.',
      'Eine neue Aufgabe dreht bei gleicher Angriffsstelle die Kraftrichtung so, dass ihre Wirkungslinie durch die Achse läuft. Die lernende Person begründet das verschwindende Moment trotz unverändertem Kraftbetrag.',
      'A fresh task rotates the force at the same application point so its line of action passes through the axis. The learner explains the zero torque despite an unchanged force magnitude.',
    ],
  },
  {
    id: '37f17e7e-9fcf-5dca-ac10-e94cb8420be5', decision: 'keep',
    rationale: 'Der Text nennt die Erhaltungsbedingung bereits ausdrücklich und verbindet Definition und qualitative Anwendung. „Drehmomentfrei“ wird für das gewählte System als verschwindendes resultierendes äußeres Drehmoment präzisiert. Das geöffnete Bild zeigt genau diese Bedingung und L = Iω. Der spezielle Pirouettennachfolger kann die Anwendung vertiefen, ohne eine Textrevision dieses Grundlagenziels zu erzwingen.',
    evidence: [
      'Drehimpuls beschreibt den Rotationszustand bezüglich einer festgelegten Achse bzw. eines Bezugspunkts. Bei verschwindendem resultierendem äußeren Drehmoment bleibt er erhalten; im einfachen Achsenmodell gilt L = Iω, sodass Änderungen der Massenverteilung durch Änderungen der Winkelgeschwindigkeit ausgeglichen werden können.',
      'Angular momentum describes rotational motion about a specified axis or reference point. It is conserved when the resultant external torque vanishes; in a simple axial model L = Iω, so changes in mass distribution can be compensated by changes in angular velocity.',
      'Die lernende Person erklärt selbstständig für ein einfaches Rotationssystem, welche äußeren Drehmomente vernachlässigt werden und welche Größe deshalb erhalten bleibt. Sie begründet den qualitativen Zusammenhang zwischen Massenverteilung und Rotationsgeschwindigkeit.',
      'For a simple rotating system, the learner independently explains which external torques are neglected and which quantity is therefore conserved. They justify the qualitative relationship between mass distribution and rotation rate.',
      'In einer neuen Aufgabe wird an derselben rotierenden Anordnung eine äußere Bremse wirksam. Die lernende Person erklärt, warum die bisherige Drehimpulserhaltung für dieses System nicht mehr gilt, und sagt die Änderungsrichtung voraus.',
      'A fresh task applies an external brake to the same rotating arrangement. The learner explains why angular momentum conservation no longer holds for that system and predicts the direction of change.',
    ],
  },
  {
    id: '642aebd7-66cd-5a50-b543-73c4b207525d', decision: 'keep',
    rationale: 'Der qualitative Vergleich von Massenverteilungen wird unmittelbar mit ihrer energetischen Bedeutung verbunden; das ist ein zusammenhängender Verständnisgegenstand. Der Text verlangt noch nicht die eigenständigen Berechnungsroutinen des Nachfolgers. Das geöffnete Bild benennt Achsenabhängigkeit und den Vergleich bei gleichem ω; das Profil hält diese Bedingung explizit.',
    evidence: [
      'Das Trägheitsmoment hängt von der Massenverteilung relativ zur Drehachse ab. Weiter außen liegende Masse trägt stärker bei. Für Rotation um die betrachtete Achse verbindet E_rot = ½Iω² diese Verteilung mit der Rotationsenergie; ein größerer I-Wert bedeutet bei gleichem ω mehr Rotationsenergie.',
      'Moment of inertia depends on mass distribution relative to the rotation axis. Mass farther out contributes more. For rotation about that axis, E_rot = ½Iω² connects the distribution to rotational energy; larger I means greater rotational energy at the same ω.',
      'Die lernende Person vergleicht selbstständig zwei gleich schwere rotierende Anordnungen mit unterschiedlichen Massenabständen und begründet ihre Reihenfolge nach Trägheitsmoment und Energie bei gleichem ω, ohne bloß die Gesamtmasse heranzuziehen.',
      'The learner independently compares two equally massive rotating arrangements with different mass distances and explains their ordering by moment of inertia and energy at equal ω without relying only on total mass.',
      'Eine neue Aufgabe verlegt bei unverändertem Körper die Drehachse von einer zentralen zu einer randnahen Lage. Die lernende Person begründet aus den Massenabständen den veränderten Energiebedarf bei gleicher Winkelgeschwindigkeit qualitativ.',
      'A fresh task moves the rotation axis of the same body from a central to a near-edge position. The learner uses mass distances to explain qualitatively the changed energy requirement at the same angular velocity.',
    ],
  },
  {
    id: '5a951a0b-fd6c-51a1-9ffb-2a34ed6d3931', decision: 'split_review',
    rationale: 'Konkreter Atomaritätsbefund: E_rot aus I und ω ist eine Zustandsenergie-Berechnung; das Beschleunigungsmoment aus I und α ist eine davon unabhängig prüfbare Dynamik-Berechnung. Der Text verbindet beide mit „sowie“, ohne eine gemeinsame Bilanz- oder Untersuchungsfrage zu beanspruchen; das geöffnete Bild zeigt entsprechend zwei getrennte Formeln und Beispiele. Eine längere Ersatzbeschreibung würde dieses Doppelziel verdecken. Zusätzlich muss beim späteren Momentziel die mittlere von der momentanen Winkelbeschleunigung unterschieden werden.',
    evidence: [
      'Der aktuelle Knoten umfasst zwei getrennte Beziehungen: Rotationsenergie E_rot = ½Iω² beschreibt einen Zustand, während das resultierende Beschleunigungsmoment M = Iα bei konstantem I die Bewegungsänderung beschreibt. Ein mittleres Moment gehört zur mittleren Winkelbeschleunigung über dasselbe Zeitintervall.',
      'The current node covers two separate relationships: rotational energy E_rot = ½Iω² describes a state, while resultant acceleration torque M = Iα for constant I describes change in motion. Mean torque corresponds to mean angular acceleration over the same interval.',
      'Die lernende Person begründet und berechnet die Energie eines vorgegebenen Rotationszustands sowie separat das resultierende Moment einer vorgegebenen Beschleunigung bei konstantem I. Sie unterscheidet die Größen trotz derselben Basiseinheiten und erläutert das Zeitintervall eines Mittelwerts.',
      'The learner explains and calculates the energy of a specified rotational state and separately the resultant torque for specified acceleration at constant I. They distinguish the quantities despite identical base dimensions and explain the averaging interval.',
      'In getrennten frischen Fällen wird erst der Drehsinn bei gleichem Geschwindigkeitsbetrag umgekehrt, danach eine Beschleunigung durch Abbremsen ersetzt. Die lernende Person begründet die unveränderte Energie im ersten und das Vorzeichen des Moments im zweiten Fall; die unabhängigen Nachweise verdeutlichen den Aufteilungsbedarf.',
      'Separate fresh cases first reverse rotation at equal speed magnitude and then replace speeding up with braking. The learner explains unchanged energy in the first case and torque sign in the second; these independent demonstrations expose the need for an atomicity review.',
    ],
  },
  {
    id: 'b49e0f6b-df2a-5643-b3ce-a9dfdf25f3bc', decision: 'revise',
    proposedDescriptionDe: 'Die lernende Person kann die Präzession von Kreisel- oder Gyroskopsystemen qualitativ durch die Änderung der Drehimpulsrichtung infolge eines äußeren Drehmoments erklären und von der Erhaltung des Drehimpulsvektors ohne äußeres Drehmoment unterscheiden.',
    proposedDescriptionEn: 'The learner can qualitatively explain the precession of top or gyroscope systems through the change in angular momentum direction caused by an external torque and distinguish it from conservation of the angular momentum vector in the absence of external torque.',
    rationale: 'Die aktuelle Verknüpfung von Präzession mit „Drehimpulserhaltung“ lässt offen, was trotz äußeren Drehmoments erhalten sein soll. Bei der hier gemeinten erzwungenen Kreiselpräzession ändert sich die Richtung des Drehimpulsvektors; dessen Erhaltung darf nicht pauschal behauptet werden. Die lokale DE/EN-Präzisierung trennt diesen Fall vom drehmomentfreien Grenzfall, ohne Nutation oder quantitative Kreiselgleichungen hinzuzunehmen. Fachabgleich: MIT OCW, Kapitel 22.2–22.3, https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/mit8_01scs22_chapter22.pdf . Das geöffnete Bild zeigt Achsenstellungen, klärt die Erhaltungsfrage aber nicht.',
    evidence: [
      'Ein äußeres Drehmoment ändert den Drehimpuls bezüglich desselben Bezugspunkts. Bei einfacher langsamer Präzession eines schnell rotierenden Kreisels ändert es vor allem dessen Richtung; ein näherungsweise gleicher Betrag ist keine Erhaltung des gesamten Vektors. Ohne äußeres Drehmoment bleibt der Vektor erhalten.',
      'External torque changes angular momentum about the same reference point. In simple slow precession of a rapidly spinning gyroscope, it mainly changes the direction; approximately constant magnitude is not conservation of the full vector. Without external torque, the vector is conserved.',
      'Die lernende Person zeichnet selbstständig Drehimpuls, äußeres Drehmoment und die kleine Drehimpulsänderung für einen vorgegebenen Kreisel und erklärt damit die Präzessionsrichtung. Sie benennt den Bezugspunkt und begründet, weshalb das keine pauschale Drehimpulserhaltung des Kreisels ist.',
      'The learner independently draws angular momentum, external torque, and the small angular-momentum change for a supplied gyroscope and uses them to explain precession direction. They identify the reference point and explain why this is not blanket conservation of the gyroscope angular momentum.',
      'Eine neue Aufgabe kehrt bei gleicher Belastung den schnellen Eigendrehsinn um. Die lernende Person leitet die veränderte Präzessionsrichtung qualitativ aus den Vektorrichtungen ab; eine zweite vorgegebene Situation ohne äußeres Moment dient als Erhaltungsgrenzfall.',
      'A fresh task reverses the rapid spin while keeping the load unchanged. The learner qualitatively derives the changed precession direction from the vector directions; a second supplied situation without external torque serves as the conservation limit.',
    ],
  },
  {
    id: '21c0a5f2-4152-549a-aa9c-e02ab772f589', decision: 'keep',
    rationale: 'Die Pirouettenbeschreibung nennt die benötigten beiden Größen und die Erhaltungsbeziehung kompakt und zweisprachig konsistent. Die Näherung kleiner äußerer Drehmomente lässt sich im Profil bestimmen, ohne den Text unnötig zu verlängern. Das geöffnete Bild zeigt diese Bedingung ausdrücklich. Eine umfassende Energiebilanz würde den hier beanspruchten qualitativen Anwendungsumfang erweitern.',
    evidence: [
      'Bei einer Pirouette ist der Drehimpuls um die vertikale Achse während einer kurzen Bewegung mit vernachlässigbarem äußeren Drehmoment näherungsweise konstant. Das Einziehen von Körpermasse zur Achse verkleinert I und erhöht deshalb ω; Arme können I auch verändern, ohne die Gesamtmasse zu verändern.',
      'During a short part of a pirouette with negligible external torque, angular momentum about the vertical axis is approximately constant. Drawing body mass toward the axis decreases I and therefore increases ω; arms can change I without changing total mass.',
      'Die lernende Person deutet selbstständig eine neue Folge von Körperhaltungen, vergleicht die Massenverteilung relativ zur Achse und begründet die Änderungen der Drehgeschwindigkeit mit L = Iω bei genanntem System und vernachlässigtem äußeren Moment.',
      'The learner independently interprets a new sequence of body postures, compares mass distribution relative to the axis, and explains rotation-rate changes with L = Iω for a stated system and negligible external torque.',
      'Eine frische Aufgabe lässt die Arme unverändert, während ein zuvor ausgestrecktes Bein an die Achse herangeführt wird. Die lernende Person überträgt das Massenverteilungsargument auf diese veränderte Haltung und sagt die qualitative Drehgeschwindigkeitsänderung voraus.',
      'A fresh task leaves the arms unchanged while drawing a previously extended leg toward the axis. The learner transfers the mass-distribution argument to that changed posture and predicts the qualitative change in rotation rate.',
    ],
  },
  {
    id: '8daaf751-93fe-56d9-8697-ac30237061bd', decision: 'keep',
    rationale: 'Der Text beansprucht eine qualitative Deutung mit Drehmomenten und Kreiselwirkung, aber keine ausschließlich kreiselbedingte Stabilität. Diese Begrenzung kann im Profil erhalten werden. Das geöffnete Bild benennt Kreiselwirkung ausdrücklich als einen Beitrag sowie Nachlauf und Massenverteilung. Der Fachabgleich mit der Autorenquelle https://arendschwab.com/research/stablebicycle/ bestätigt, dass Kreiselwirkung nicht notwendig für jede Selbststabilität ist; daraus folgt hier keine erzwungene Textrevision.',
    evidence: [
      'Rotierende Räder tragen Drehimpuls; Drehmomente koppeln Änderungen ihrer Orientierung an Lenk- und Neigungsbewegungen. Diese Kreiselwirkung ist ein möglicher Beitrag zur Fahrraddynamik. Lenkgeometrie, Massenverteilung und gegebenenfalls aktive Lenkbewegungen beeinflussen die Stabilität ebenfalls.',
      'Rotating wheels carry angular momentum; torques couple changes in wheel orientation to steering and lean motion. This gyroscopic effect is one possible contribution to bicycle dynamics. Steering geometry, mass distribution, and possibly active steering also influence stability.',
      'Die lernende Person erläutert selbstständig an einem vorgegebenen vereinfachten Fahrradschema, wie ein Lenkmoment die Richtung des Raddrehimpulses verändert und mit Neigung gekoppelt ist. Sie begrenzt die Erklärung ausdrücklich, statt jede aufrechte Fahrt allein aus Kreiselwirkung abzuleiten.',
      'Using a supplied simplified bicycle diagram, the learner independently explains how steering torque changes wheel angular-momentum direction and couples to lean. They explicitly limit the explanation instead of attributing all upright riding solely to gyroscopic effects.',
      'In einer neuen Aufgabe sind zwei ansonsten beschriebene Fahrradmodelle mit unterschiedlichem Raddrehimpuls gegeben. Die lernende Person vergleicht ihren Kreiselbeitrag und erklärt, warum daraus allein noch keine vollständige Rangfolge der Gesamtstabilität folgt.',
      'A fresh task supplies two otherwise described bicycle models with different wheel angular momentum. The learner compares their gyroscopic contributions and explains why those alone do not determine a complete ranking of overall stability.',
    ],
  },
  {
    id: '07f298b2-2f5e-5b16-8150-bc603fa78ecd', decision: 'keep',
    rationale: 'Das Ziel fordert bereits eine Begründung mit den einschlägigen Größen und bleibt methodenoffen. Konkrete Grenzen und die Auswahl einer tatsächlich mechanischen Kreiselanwendung gehören in das Profil. Das geöffnete Bild zeigt einen Rotor an einer Kamera; daraus wird weder abgeleitet, dass jedes Kameragimbal einen solchen Rotor besitzt, noch dass ein Kreisel beliebige Störungen unverändert abfängt.',
    evidence: [
      'Ein rotierender technischer Kreisel besitzt Drehimpuls, dessen Änderung durch äußere Drehmomente bestimmt wird. Ein großer Drehimpuls begrenzt bei gleichem kurzen quer wirkenden Drehmoment die Richtungsänderung; die Lagerung bestimmt, wie Präzession und Reaktionsmomente auf das zu stabilisierende System wirken.',
      'A spinning technical gyroscope carries angular momentum whose change is determined by external torques. Larger angular momentum limits directional change for the same brief transverse torque; mounting determines how precession and reaction torques affect the system being stabilized.',
      'Die lernende Person erklärt selbstständig an einer vorgegebenen mechanischen Kreiselanwendung Rotor, Lagerung und Störmoment und begründet deren stabilisierenden Beitrag mit der Änderung des Drehimpulses. Sie benennt eine Grenze der Stabilisierung aus der Richtung oder Dauer der Störung.',
      'For a supplied mechanical gyroscope application, the learner independently explains the rotor, mounting, and disturbing torque and justifies its stabilizing contribution through angular-momentum change. They identify a limitation arising from disturbance direction or duration.',
      'Eine neue Aufgabe verlegt dieselbe kurze Störung von quer zur parallel zur Rotorachse. Die lernende Person unterscheidet die Richtungsänderung von einer Änderung des Drehimpulsbetrags und begründet, warum die Stabilisierung nicht für beide Störungen gleich beschrieben werden darf.',
      'A fresh task changes the same brief disturbance from transverse to parallel to the rotor axis. The learner distinguishes direction change from change in angular-momentum magnitude and explains why stabilization cannot be described identically for both disturbances.',
    ],
  },
  {
    id: 'd02438ba-0cc9-5993-831e-5e44d35e32c4', decision: 'keep',
    rationale: 'Die Beschreibungen verbinden Berechnung und fachliche Deutung eines klar begrenzten Dipolmodells im homogenen Feld. DE/EN sind gleichwertig. Die Symbolbedeutung, Winkeldefinition sowie stabile und instabile Ausrichtung können im Profil konkretisiert werden. Das geöffnete Bild zeigt Feld und Nadel; sein Winkelbogen ist kein Ersatz für eine saubere selbstständige Definition des Winkels zwischen magnetischem Moment und Feld.',
    evidence: [
      'Das magnetische Dipolmoment beschreibt die Orientierung der Nadel; im homogenen Feld beträgt das Drehmoment μB sin α mit α zwischen Dipolmoment und Feld. Parallelstellung ist stabil, Antiparallelstellung trotz verschwindendem Moment instabil. Eine dauerhafte Ruheausrichtung setzt bei Bewegung Dämpfung voraus.',
      'The magnetic dipole moment describes needle orientation; in a homogeneous field torque magnitude is μB sin α with α between dipole moment and field. Parallel alignment is stable, while antiparallel alignment is unstable despite zero torque. Settling into a resting orientation requires damping when motion is present.',
      'Die lernende Person definiert selbstständig μ, B und α in einer neuen Nadelskizze, berechnet den Momentbetrag mit Einheiten und bestimmt den Drehsinn. Sie begründet die Ausrichtung durch eine kleine Auslenkung aus paralleler bzw. antiparalleler Lage.',
      'The learner independently defines μ, B, and α in a new needle diagram, calculates torque magnitude with units, and determines turning direction. They justify alignment by considering a small displacement from parallel or antiparallel orientation.',
      'Eine neue Aufgabe kehrt die Feldrichtung bei zunächst unveränderter Nadel um. Die lernende Person beurteilt die neue Gleichgewichtslage und erklärt die Reaktion auf eine kleine Störung, einschließlich des Sonderfalls eines anfangs verschwindenden Moments.',
      'A fresh task reverses the field while initially leaving the needle unchanged. The learner assesses the new equilibrium and explains the response to a small disturbance, including the special case of initially zero torque.',
    ],
  },
  {
    id: '58db62d4-458f-5e2d-9ca0-968e09f4944b', decision: 'keep',
    rationale: 'Ablenkungs- und Schwingungsmethode sind hier zwei zusammenwirkende Messschritte zur Bestimmung derselben unbekannten Horizontalintensität; das ist ein integriertes Messverfahren und kein zwingender Split. DE/EN stimmen überein. Das geöffnete Bild zeigt Kompassablenkung und aufgehängten Magneten, legt aber weder die genaue Hauptlagengeometrie noch die Rechenkonvention fest; diese werden bei der unabhängigen Aufgabe angegeben und im Profil kontrolliert.',
    evidence: [
      'Beim Gauß-Verfahren liefert die Ablenkung in festgelegter Hauptlage eine Beziehung zwischen Magnetmoment und horizontalem Erdmagnetfeld; die kleine Schwingung desselben Magneten liefert bei bekanntem Trägheitsmoment eine zweite Beziehung. Beide Messungen erlauben gemeinsam, das unbekannte Magnetmoment zu eliminieren.',
      'In the Gauss method, deflection in a specified principal position relates magnetic moment to the horizontal geomagnetic field; small oscillations of the same magnet provide a second relation when its moment of inertia is known. Together the measurements allow the unknown magnetic moment to be eliminated.',
      'Die lernende Person erklärt selbstständig die angegebene Hauptlage und Schwingungsanordnung, wertet bereitgestellte Winkel-, Abstands- und Periodendaten mit den zugehörigen Beziehungen aus und bestimmt die horizontale Feldkomponente. Sie trennt Messwerte von erschlossenen Größen und berücksichtigt Winkel- und Zeitunsicherheit sowie die Kleinwinkelnäherung.',
      'The learner independently explains the specified principal-position and oscillation arrangements, analyzes supplied angle, distance, and period data using the corresponding relations, and determines the horizontal field component. They distinguish measured from inferred quantities and consider angular and timing uncertainty and the small-angle approximation.',
      'Eine neue Aufgabe ersetzt den Magneten durch einen mit anderem unbekannten Magnetmoment und vorgegebenem Trägheitsmoment. Die lernende Person kombiniert die neuen Ablenkungs- und Schwingungsdaten und begründet, warum trotz veränderter Einzelmesswerte dasselbe lokale Erdmagnetfeld ermittelt werden kann.',
      'A fresh task replaces the magnet with one having a different unknown magnetic moment and specified moment of inertia. The learner combines the new deflection and oscillation data and explains why the same local geomagnetic field can be found despite different individual readings.',
    ],
  },
]

if (decisions.length !== 20 || input.goals.length !== 20) throw new Error('Expected exactly 20 individual reviews')
const evidenceKeys = ['essentialUnderstandingDe','essentialUnderstandingEn','observablePerformanceDe','observablePerformanceEn','transferExpectationDe','transferExpectationEn']
const commonLimits = ' Kein aktuelles V2-Profil wurde mitgeliefert: create bleibt eine Empfehlung. Die Bewertung verwendet die gebundenen Seitenscopes; ein vollständiges normatives Mapping- oder Quellenmatrix-Audit und eine Bildpublikationsfreigabe werden nicht behauptet.'
const records = input.goals.map((goal: any, index: number) => {
  const d = decisions[index]
  if (goal.goalId !== d.id) throw new Error('Review order differs from bound input')
  const keys = ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']
  return {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1, recordId: runId + '.' + String(index + 1).padStart(2, '0'), runId,
    campaignId: campaign.campaignId, roundId: campaign.roundId,
    bundleFingerprint: campaign.bundleFingerprint, bookDigest: campaign.bookDigest,
    ...Object.fromEntries(keys.map(key => [key, goal[key]])),
    decision: d.decision,
    ...(d.decision === 'revise' ? { proposedDescriptionDe: d.proposedDescriptionDe, proposedDescriptionEn: d.proposedDescriptionEn } : {}),
    understandingEvidence: Object.fromEntries(evidenceKeys.map((key, k) => [key, d.evidence[k]])),
    rationale: d.rationale + commonLimits,
    evidenceProfileContract: 'positive-understanding-evidence-v2',
    evidenceProfileRecommendation: 'create', recordStatus: 'candidate', reviewAuthority: 'ai_candidate',
  }
})
for (const goal of input.goals) {
  const image = goal.reviewContext.page.visualization
  const bytes = await readFile('/home/enpasos/projects/skillpilot/app/public' + image.url)
  if (sha256(bytes) !== image.originalDigest) throw new Error('Image drift: ' + goal.goalId)
}
for (const [file, expected] of [['prompt.md', campaign.promptFingerprint], ['criteria.md', campaign.criteriaFingerprint], ['contracts/goal-description-review-record.schema.json', campaign.recordSchemaDigest]]) {
  if (sha256(await readFile(resolve(here, file))) !== expected) throw new Error('Bound artifact drift: ' + file)
}
const bytes = Buffer.from(records.map(record => stableGoalBookJson(record)).join('\n') + '\n')
const parameters = { provider: 'OpenAI', model: 'Codex', exactModelIdentifier: 'not_disclosed', generationSettings: 'not_disclosed', mode: 'independent_blind_first_pass', reviewedImages: input.goals.map((g: any) => ({ goalId: g.goalId, digest: g.reviewContext.page.visualization.originalDigest, inspectedWith: 'view_image' })) }
const run = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
  schemaVersion: 1, runId, campaignId: campaign.campaignId, roundId: campaign.roundId,
  batchId: batch.batchId, batchInputFingerprint: batch.batchInputFingerprint,
  bundleFingerprint: campaign.bundleFingerprint, bookDigest: campaign.bookDigest,
  provider: 'OpenAI', model: 'Codex', modelVersion: 'Exact model identifier not disclosed',
  role: 'subject_reviewer', promptFamilyId: 'goal-description-understanding-evidence-review-v2',
  promptFingerprint: campaign.promptFingerprint, criteriaFingerprint: campaign.criteriaFingerprint,
  generationParametersFingerprint: sha256(stableGoalBookJson(parameters)),
  independenceGroupId: campaign.independenceGroupId, blindToOtherRuns: true, goalIds: batch.goalIds,
  inputArtifacts: [
    { role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint },
    ...bundle.artifacts.filter((a: any) => ['review_prompt','review_criteria','run_manifest_schema'].includes(a.role)).map(({role,digest}: any) => ({role,digest})),
  ],
  startedAt: reviewStartedAt, completedAt: new Date().toISOString(), status: 'completed',
  outputDigest: sha256(bytes), toolchainVersion: 'skillpilot-goal-description-review-v3-node20',
}
const batchInputBytes = await readFile(resolve(here, 'batches', batch.batchId + '.input.jsonl'))
const validation = await validateGoalDescriptionReviewBatch({ bundle, input, campaign, run, batchInputBytes, recordsBytes: bytes })
if (validation.errors.length) throw new Error(validation.errors.join('\n'))
await mkdir(resolve(here, 'results'), { recursive: true })
await writeFile(resolve(here, 'results', batch.batchId + '.records.jsonl'), bytes, { flag: 'wx' })
await writeFile(resolve(here, 'results', batch.batchId + '.run.json'), JSON.stringify(run, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify({ records: records.length, decisions: records.reduce((m: any, r: any) => ({...m, [r.decision]: (m[r.decision] ?? 0) + 1}), {}), startedAt: run.startedAt, completedAt: run.completedAt, validated: true }))

