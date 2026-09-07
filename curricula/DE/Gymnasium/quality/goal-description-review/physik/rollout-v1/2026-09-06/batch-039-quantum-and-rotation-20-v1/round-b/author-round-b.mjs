import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

// Independent review B. All source records and all 20 bound images were read
// individually. This helper only binds the individually authored decisions.
// It emits artifacts to stdout; the caller installs them using apply_patch.
const directory = path.dirname(fileURLToPath(import.meta.url));
const campaign = JSON.parse(fs.readFileSync(path.join(directory, 'description-review-campaign.json')));
const batch = campaign.batches[0];
const rows = fs.readFileSync(path.join(directory, 'batches', batch.batchId + '.input.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
const hash = bytes => 'sha256:' + crypto.createHash('sha256').update(bytes).digest('hex');
const runId = 'physik-b039-openai-codex-independent-b-20260906';
const generationParameters = {
  provider: 'OpenAI', model: 'Codex', exactModelIdentifier: 'not disclosed',
  generationParameters: 'not exposed by this environment',
  execution: 'independent blind first-pass review B; no other reviewer outputs read',
};
const judgments = [
  {
    goalId: 'd5bff282-741f-4cc5-9622-b77584fdcc5a', decision: 'keep',
    understanding: [
      'Bei festgelegtem Anfangszustand und festgelegter Dynamik entwickelt sich ein ungestörter Quantenzustand im Modell eindeutig; daraus folgen Wahrscheinlichkeiten möglicher Messwerte, nicht generell ein vorherbestimmter Einzelmesswert.',
      'For a specified initial state and dynamics, an undisturbed quantum state evolves uniquely in the model; this determines probabilities of possible measurement values, not generally a predetermined individual outcome.',
      'Die lernende Person erläutert selbstständig an einer vorgegebenen Zustandsentwicklung, was eindeutig berechnet wird und was in wiederholten gleich präparierten Messungen streut; sie trennt Zustand, Wahrscheinlichkeitsverteilung und Einzelereignis.',
      'The learner independently explains, for a supplied state evolution, what is calculated uniquely and what varies across repeated identically prepared measurements, distinguishing state, probability distribution, and individual event.',
      'In einer neuen Aufgabe vergleicht sie eine frei laufende Entwicklung mit einer Entwicklung, die durch eine Zwischenmessung unterbrochen wird, und erläutert, weshalb die ursprüngliche Zustandsvorhersage dann nicht unverändert weiterverwendet werden darf.',
      'In a fresh task, the learner compares uninterrupted evolution with evolution interrupted by an intermediate measurement and explains why the original state prediction cannot then be reused unchanged.',
    ],
    rationale: 'KEEP: Der Satz benennt bereits die fachlich entscheidende Unterscheidung zwischen deterministischer Modellentwicklung und probabilistischen Messergebnissen in beiden Sprachen. Das gelesene Bild stellt genau diese beiden Ebenen gegenüber. Anfangsbedingungen, ungestörte Entwicklung und die Bedeutung wiederholter Präparation werden im Evidenzfeld konkretisiert; ein Schrödinger-Rechenziel wird nicht hinzugefügt.',
  },
  {
    goalId: '1a1c09f0-96b7-4c33-a623-0e8101537876', decision: 'keep',
    understanding: [
      'Einzeln registrierte Quantenobjekte ergeben bei gleicher kohärenter Präparation statistisch ein Interferenzmuster. Die ortsabhängige Trefferwahrscheinlichkeit ist vorhersagbar, der einzelne Treffer im Allgemeinen nicht; gleichzeitige Wechselwirkung mehrerer Quantenobjekte ist dafür nicht erforderlich.',
      'Individually detected quantum objects statistically produce an interference pattern under the same coherent preparation. Position-dependent detection probability is predictable, whereas an individual hit generally is not; simultaneous interaction of multiple quantum objects is unnecessary.',
      'Die lernende Person deutet selbstständig eine neue Folge von Trefferbildern, erklärt die Entwicklung zu häufig und selten getroffenen Bereichen und begründet, weshalb ein Einzelereignis weder das gesamte Muster noch eine klassische Bahn nachweist.',
      'The learner independently interprets a new sequence of detection images, explains the emergence of frequently and rarely hit regions, and justifies why an individual event establishes neither the full pattern nor a classical trajectory.',
      'Sie überträgt die Erklärung von punktförmigen Trefferbildern auf ein unabhängig vorgelegtes Häufigkeitshistogramm bei stark verringerter Emissionsrate und begründet, weshalb dieselbe normierte Verteilung bei ausreichend vielen Ereignissen möglich bleibt.',
      'The learner transfers the explanation from point-detection images to an independently supplied frequency histogram at a greatly reduced emission rate and explains why the same normalized distribution remains possible after enough events.',
    ],
    rationale: 'KEEP: Einzelereignis und Ensembleaufbau bilden eine zusammenhängende qualitative Kompetenz; DE und EN stimmen überein. Das gelesene Bild illustriert den Musteraufbau, ist jedoch kein unabhängiger Leistungsnachweis; seine Beschriftung „20 Treffer“ wird nicht als exakte Zählvorgabe übernommen. Welcher-Weg-Komplementarität bleibt Schwerpunkt des direkten Nachfolgers.',
  },
  {
    goalId: '6031bed0-9baa-4f45-b2a5-57ffb00d39cc', decision: 'keep',
    understanding: [
      'Interferenzsichtbarkeit und physikalische Unterscheidbarkeit der Wege begrenzen einander. Vollständige Weginformation verhindert das zugehörige Interferenzmuster im unselektierten Ensemble; das tatsächliche Ablesen durch einen Menschen ist nicht der entscheidende Vorgang.',
      'Interference visibility and physical distinguishability of paths limit one another. Complete path information prevents the corresponding interference pattern in the unselected ensemble; a person actually reading the information is not the decisive process.',
      'Die lernende Person vergleicht selbstständig zwei ansonsten gleiche Aufbauten mit und ohne Wegmarkierung und sagt die Änderung der Interferenzsichtbarkeit begründet voraus, ohne die Erklärung auf bewusste Beobachtung zu stützen.',
      'The learner independently compares two otherwise identical setups with and without path marking and predicts the change in interference visibility with reasoning that does not rely on conscious observation.',
      'Bei einer neuen Aufgabe mit nur teilweise unterscheidbaren Wegmarkierungen erwartet sie eine teilweise verringerte Sichtbarkeit und erklärt, weshalb das bloße Nichtablesen gespeicherter vollständiger Weginformation die Interferenz nicht wiederherstellt.',
      'For a fresh task with only partially distinguishable path markers, the learner expects partially reduced visibility and explains why merely not reading stored complete path information does not restore interference.',
    ],
    rationale: 'KEEP: Die kurze Beschreibung enthält bereits die benötigte Beziehung und behauptet keine Bewusstseinswirkung. Die zwei Felder des gelesenen Bildes werden als idealisierte Grenzfälle verstanden; partielle Weginformation gehört in den Transfer. Die Beschreibung wird nicht mit Delayed Choice oder Verschränkung aus den Nachfolgerzielen erweitert.',
  },
  {
    goalId: 'f6e5929f-d52a-42a4-a5d2-ff498ee7083f', decision: 'keep',
    understanding: [
      'Eine engere Ortsverteilung verlangt im Wellenmodell eine breitere Verteilung der zugehörigen Impulskomponente. Die Unbestimmtheit betrifft Zustandsverteilungen und ist nicht bloß schlechte Geräteauflösung; ein gleichzeitig beliebig scharf bestimmter klassischer Phasenraumpunkt ist damit nicht gegeben.',
      'A narrower position distribution requires a broader distribution of the corresponding momentum component in the wave model. Uncertainty concerns state distributions and is not merely poor instrument resolution; an arbitrarily sharp classical phase-space point is therefore unavailable.',
      'Die lernende Person begründet selbstständig qualitativ, weshalb eine engere Ortspräparation quer zur Ausbreitung eine größere Streuung des Querimpulses erzeugt, und erklärt daran die Grenze einer gleichzeitig scharfen Orts- und Impulsbeschreibung entlang einer klassischen Bahn.',
      'The learner independently explains qualitatively why narrower position preparation transverse to propagation produces a larger spread in transverse momentum and uses this to explain the limit of simultaneously sharp position and momentum along a classical trajectory.',
      'In einer frischen Aufgabe überträgt sie das Argument von einer Spaltskizze auf Orts- und Impulsverteilungen und ordnet begründet zu, welche Verteilung zur engeren Präparation gehört, auch wenn die Messgeräteauflösung in beiden Fällen gleich bleibt.',
      'In a fresh task, the learner transfers the argument from a slit sketch to position and momentum distributions and identifies which distribution corresponds to narrower preparation even when instrument resolution is identical in both cases.',
    ],
    rationale: 'KEEP: Die Grenze des Bahnbegriffs ist eine ausdrücklich aus der Unbestimmtheit abzuleitende Folgerung und keine zweite unabhängige Routine. Der qualitative Anspruch bleibt trotz unterschiedlicher GK/LK-Seitenprojektionen erhalten. Das gelesene Spaltbild liefert eine Illustration; eine Aussage über alle Interpretationen der Quantenmechanik oder ein Messfehlerargument folgt daraus nicht.',
  },
  {
    goalId: '727d0946-7019-50ed-8fc6-85db12508733', decision: 'keep',
    understanding: [
      'Präparation legt den untersuchten Zustand fest, die Messanordnung legt die erfragte Größe fest und das Modell liefert Wahrscheinlichkeiten. Aussagen darüber, welche Eigenschaften unabhängig davon real vorhanden seien, müssen von beobachteten Daten und operationalen Vorhersagen unterschieden werden.',
      'Preparation specifies the state under investigation, the measurement arrangement specifies the quantity being queried, and the model supplies probabilities. Claims about properties existing independently must be distinguished from observed data and operational predictions.',
      'Die lernende Person diskutiert selbstständig zwei vorgelegte Aussagen zur Realität einer Quanteneigenschaft, benennt deren empirischen Gehalt und interpretative Annahmen und begründet, welche Aussagen durch eine beschriebene Präparation und Messserie tatsächlich gestützt werden.',
      'The learner independently discusses two supplied claims about the reality of a quantum property, identifies their empirical content and interpretative assumptions, and explains which claims a described preparation and measurement series actually support.',
      'Bei unveränderter Präparation und einem neu vorgelegten anderen Messkontext prüft sie erneut die Reichweite der Realitätsaussagen, statt eine Deutung des ersten Messwerts automatisch auf jede mögliche Messgröße auszudehnen.',
      'With unchanged preparation and a newly supplied different measurement context, the learner reexamines the scope of the reality claims instead of automatically extending an interpretation of the first measurement value to every possible observable.',
    ],
    rationale: 'KEEP: Das Diskussionsziel ist durch Präparation, Messung und Wahrscheinlichkeit hinreichend fachlich begrenzt und in DE/EN gleich. Es verlangt keine bestimmte metaphysische Position. Die im gelesenen Bild gezeigte Folge Quelle–Wahrscheinlichkeit–Messung dient als Einstieg; belastbare Argumente und die Trennung von Befund und Deutung werden separat als Evidenz formuliert.',
  },
  {
    goalId: 'e296aba6-f407-5944-a2bd-e5296e4c9f06', decision: 'keep',
    understanding: [
      'Die Beschleunigungsspannung bestimmt den Elektronenimpuls; die Beugungsgeometrie an der Kristallstruktur verbindet gemessene Ringdurchmesser mit der Materiewellenlänge. Größerer Impuls entspricht kleinerer De-Broglie-Wellenlänge, wobei Ringgröße auch von Abstand und Gitterstruktur abhängt.',
      'The accelerating voltage determines electron momentum; diffraction geometry at the crystal structure connects measured ring diameters to matter wavelength. Larger momentum corresponds to a smaller de Broglie wavelength, while ring size also depends on distance and lattice structure.',
      'Die lernende Person erklärt selbstständig die Funktion von Elektronenquelle, Beschleunigung, Beugungsfolie und Schirm und wertet bereitgestellte sichere Messdaten mit bekannter Geometrie aus, um den Zusammenhang zwischen Impuls und Wellenlänge unter Berücksichtigung der Messunsicherheit zu erschließen.',
      'The learner independently explains the functions of electron source, acceleration, diffraction foil, and screen and analyzes supplied safe measurement data with known geometry to infer the momentum–wavelength relationship while considering measurement uncertainty.',
      'Sie beurteilt in einem neuen Datensatz mit verändertem Folien-Schirm-Abstand, ob größere Ringe auf eine größere Wellenlänge schließen lassen, und korrigiert den geometrischen Einfluss, bevor sie eine Aussage über den Impuls trifft.',
      'In a fresh data set with a changed foil-to-screen distance, the learner assesses whether larger rings imply a larger wavelength and accounts for geometry before drawing a conclusion about momentum.',
    ],
    rationale: 'KEEP: Aufbau, Bilddeutung und Datenauswertung gehören zur einen experimentellen Schlusskette dieses Materiewellenversuchs. Die DE/EN-Fassungen sind gleichwertig und behaupten keine direkte Beobachtung der Wellenfunktion. Das gelesene Bild zeigt Spannung, Folie und Ringe sowie den korrekten qualitativen Spannungstrend; eigenständige Hochspannungsdurchführung wird nicht verlangt.',
  },
  {
    goalId: '52b6722a-b3b2-5d2d-a507-0215532b0422', decision: 'keep',
    understanding: [
      'Bei kohärenten, ununterscheidbaren Wegen bestimmt die Addition der Wahrscheinlichkeitsamplituden einschließlich ihrer relativen Phasen die Detektorwahrscheinlichkeiten. Phasenzeiger sind Modelldarstellungen; unterscheidbare Wegmarkierungen verändern die Interferenz, ohne dass ein Photon als zwei halbe Treffer aufgefasst wird.',
      'For coherent indistinguishable paths, adding probability amplitudes including their relative phases determines detector probabilities. Phasors are model representations; distinguishable path markings alter interference without a photon being treated as two half detections.',
      'Die lernende Person konstruiert selbstständig zu einem vorgegebenen idealen Interferometer mit festgelegter Strahlteilerkonvention Phasenzeiger, begründet hohe oder geringe Detektorwahrscheinlichkeiten und vergleicht das Ergebnis mit einem Aufbau mit verfügbarer Weginformation.',
      'The learner independently constructs phasors for a supplied ideal interferometer with specified beam-splitter conventions, justifies high or low detector probabilities, and compares the result with an arrangement providing path information.',
      'In einer neuen Aufgabe entscheidet sie bei einer eingefügten Phasenplatte und anschließend bei einer unterscheidbaren Wegmarkierung, ob sich Wahrscheinlichkeiten phasenabhängig verschieben oder der Interferenzbeitrag entfällt; sie begründet den Unterschied mit den Amplituden.',
      'In a fresh task, the learner determines whether an inserted phase plate and then distinguishable path marking cause phase-dependent probability shifts or remove the interference contribution, explaining the difference through amplitudes.',
    ],
    rationale: 'KEEP: Die genannten Darstellungen und Weginformation sind koordinierte Mittel zur Deutung desselben Experiments und keine Aufzählung fremder Lernziele. Das gelesene Bild bindet zwei Strahlteiler, eine Phase und zwei Detektoren; es legt keine vollständige Phasenkonvention fest. Diese muss in einer konkreten Evidenzaufgabe geliefert werden, nicht als Geräteanleitung in der Beschreibung stehen.',
  },
  {
    goalId: 'accb1d9e-cd48-5983-bcef-9b9bca4a9114', decision: 'keep',
    understanding: [
      'Bei gleichförmiger Kreisbewegung bleibt der Geschwindigkeitsbetrag konstant, während sich die Richtung ändert. Die zum Zentrum gerichtete resultierende Kraft liefert die Radialbeschleunigung; ihre Größe hängt von Masse, Bahnradius und Geschwindigkeitsbetrag ab.',
      'In uniform circular motion, speed remains constant while direction changes. The net force directed toward the center provides radial acceleration; its magnitude depends on mass, path radius, and speed.',
      'Die lernende Person zeichnet selbstständig Geschwindigkeits- und Kraftpfeile an verschiedenen Bahnpunkten, identifiziert die tatsächlich wirkende Kraft als Zentripetalkraft und löst eine passende quantitative Aufgabe mit Einheiten und begründeter Abhängigkeit von Radius und Geschwindigkeit.',
      'The learner independently draws velocity and force arrows at different points on the path, identifies the actual force providing centripetal force, and solves an appropriate quantitative task with units and justified radius and speed dependence.',
      'In einer neuen Anordnung übernimmt eine andere Wechselwirkung die nach innen gerichtete Kraft; sie erklärt, weshalb dieselbe Kreisbewegungsbeziehung gilt, und sagt bei Wegfall dieser Kraft die anfänglich tangentiale Fortsetzung voraus.',
      'In a fresh arrangement a different interaction provides the inward force; the learner explains why the same circular-motion relation applies and predicts the initially tangential continuation if that force disappears.',
    ],
    rationale: 'KEEP: Die Beschreibung ist fachlich eindeutig und auch für die gebundene Sek-I-Projektion ohne Analysis formulierbar. Die Rechnung im gelesenen Bild ergibt korrekt 12 N. Die genaue Kräfteidentifikation und der Unterschied zwischen Richtungs- und Betragsänderung konkretisieren die bestehende Analysekompetenz; Spezialfälle der direkten Nachfolger werden nicht eingemischt.',
  },
  {
    goalId: 'e2da5eec-45de-5527-9ad7-16f41cacbe58', decision: 'keep',
    understanding: [
      'In einer einfachen ebenen Kurvenfahrt liefert Haftreibung die nötige radiale Kraft bis zu einer Obergrenze. Die tatsächlich nötige Haftreibung ist nicht stets gleich ihrem Maximalwert; Kreisfahrt ist im Modell nur möglich, wenn der Bedarf die verfügbare Haftreibung nicht überschreitet.',
      'In a simple level turn, static friction supplies the required radial force up to a limit. The actual required static friction is not always its maximum value; the model permits circular motion only when demand does not exceed available static friction.',
      'Die lernende Person stellt selbstständig für eine gleichförmige ebene Kurvenfahrt die Kraftbedingung auf, vergleicht den Bedarf mit der Haftgrenze und begründet ein quantitatives Urteil zur möglichen Geschwindigkeit oder zum erforderlichen Kurvenradius.',
      'The learner independently formulates the force condition for a uniform level turn, compares demand with the friction limit, and justifies a quantitative conclusion about possible speed or required turn radius.',
      'Für eine neu vorgelegte Kurve mit einer nassen statt trockenen Fahrbahn begründet sie die veränderte Haftgrenze und unterscheidet zwischen unverändertem Kraftbedarf bei gleicher Fahrt und verringerter maximal möglicher Geschwindigkeit.',
      'For a newly supplied turn on a wet rather than dry road, the learner explains the changed friction limit and distinguishes unchanged force demand for the same motion from reduced maximum possible speed.',
    ],
    rationale: 'KEEP: Der Anwendungsbereich ist durch Kurvenfahrt, Haftreibung und Zentripetalkraft ausreichend konkret; beide Sprachen haben dieselbe quantitative Anforderung. Das gelesene Bild trennt korrekt 2000 N Bedarf von 5000 N Haftgrenze. Ein realer Fahrversuch an der Rutschgrenze gehört nicht zur unabhängigen Leistung; Datenfälle reichen aus.',
  },
  {
    goalId: '39b2a0c4-eecf-5049-b58f-e790790a3bf2', decision: 'keep',
    understanding: [
      'Scheinkräfte entstehen in der Bewegungsbeschreibung durch die Beschleunigung des Bezugssystems. Für denselben Körper werden Wechselwirkungskräfte und zusätzliche Bezugssystemterme getrennt bilanziert; die Zentrifugalkraft des mitrotierenden Systems ist kein zusätzliches Wechselwirkungspaar zur Zentripetalkraft.',
      'Fictitious forces arise in a motion description from acceleration of the reference frame. Interaction forces and additional frame terms are accounted for separately for the same body; centrifugal force in a co-rotating frame is not an additional interaction pair with centripetal force.',
      'Die lernende Person erklärt selbstständig dieselbe Kreisbewegung aus einem Inertialsystem und einem mitrotierenden System und ordnet die jeweiligen Kraftpfeile und die beobachtete Ruhe oder Beschleunigung widerspruchsfrei zu.',
      'The learner independently explains the same circular motion from an inertial and a co-rotating frame and consistently assigns the respective force arrows and observed rest or acceleration.',
      'In einer unabhängigen neuen Aufgabe mit einem geradlinig beschleunigten Fahrzeug überträgt sie das Bezugsrahmenargument und begründet die Richtung der dortigen Scheinkraft, ohne eine Rotation vorauszusetzen.',
      'In an independent fresh task involving a vehicle accelerating in a straight line, the learner transfers the reference-frame argument and justifies the fictitious-force direction without assuming rotation.',
    ],
    rationale: 'KEEP: Beschleunigte Bezugssysteme und qualitative Deutung sind bereits ausdrücklich genannt. Das gelesene Bild trennt Inertial- und mitrotierende Beschreibung; die zusätzliche Scheinkraft wird nicht als neue Wechselwirkung behandelt. Der knappe sourceRef ist keine eigenständig geprüfte Quellenzuordnung; das Urteil betrifft die vorliegende Kompetenzformulierung.',
  },
  {
    goalId: 'cf570e66-2ce2-5923-9033-c97d74119553', decision: 'keep',
    understanding: [
      'Die Drehwirkung einer Kraft bezüglich einer festgelegten Achse hängt von Kraftbetrag, Wirkungslinie und senkrechtem Hebelarm ab. Gleiche Kräfte können deshalb verschiedene Drehmomente erzeugen; eine Wirkungslinie durch die Achse erzeugt kein Drehmoment um diese Achse.',
      'The turning effect of a force about a specified axis depends on force magnitude, line of action, and perpendicular lever arm. Equal forces can therefore produce different torques; a line of action through the axis produces no torque about that axis.',
      'Die lernende Person markiert selbstständig Drehachse, Kraft und wirksamen Hebelarm an einem einfachen Hebel, berechnet das Drehmoment in N m und erklärt den Drehsinn und den Vergleich zweier Angriffspunkte.',
      'The learner independently marks the axis, force, and effective lever arm on a simple lever, calculates torque in N m, and explains the turning direction and comparison of two application points.',
      'In einer frischen Tür- oder Hebelaufgabe mit schräg statt senkrecht angesetzter Kraft bestimmt sie den passenden senkrechten Hebelarm und begründet, weshalb derselbe Kraftbetrag eine kleinere Drehwirkung haben kann.',
      'In a fresh door or lever task with oblique rather than perpendicular force, the learner identifies the appropriate perpendicular lever arm and explains why the same force magnitude can have a smaller turning effect.',
    ],
    rationale: 'KEEP: Definition, Berechnung und einfache Anwendung beziehen sich durchgehend auf dieselbe Größe und bilden keine semantische Aufteilung. Das gelesene Bild vergleicht kurze und lange Hebelarme bei gleicher senkrechter Kraft. Achsenbezug und Wirkungslinie werden im Evidenzfeld präzisiert; ein allgemeiner dreidimensionaler Vektorformalismus wird für AB1 nicht verlangt.',
  },
  {
    goalId: '37f17e7e-9fcf-5dca-ac10-e94cb8420be5', decision: 'keep',
    understanding: [
      'Der Drehimpuls beschreibt den Rotationszustand bezüglich eines Bezugspunkts oder einer Achse. Ohne resultierendes äußeres Drehmoment bleibt der Gesamtdrehimpuls des gewählten Systems erhalten; eine veränderte Massenverteilung kann dabei die Winkelgeschwindigkeit verändern.',
      'Angular momentum describes rotational motion relative to a reference point or axis. Without net external torque, the total angular momentum of the chosen system is conserved; changing mass distribution can nevertheless change angular velocity.',
      'Die lernende Person definiert selbstständig den Drehimpuls im einfachen Achsenmodell, nennt das betrachtete System und begründet an einer Skizze, weshalb eine innere Umverteilung der Masse die Drehgeschwindigkeit ändern kann, obwohl der Drehimpuls gleich bleibt.',
      'The learner independently defines angular momentum in a simple axis model, identifies the system considered, and uses a sketch to explain why internal redistribution of mass can change rotation speed while angular momentum stays unchanged.',
      'Bei einem neuen Beispiel mit äußerem Bremsmoment prüft sie die Erhaltungsbedingung erneut und erklärt, weshalb die zuvor zulässige Gleichsetzung des anfänglichen und abschließenden Drehimpulses nun nicht gilt.',
      'For a fresh example with an external braking torque, the learner reevaluates the conservation condition and explains why equating initial and final angular momentum is no longer valid.',
    ],
    rationale: 'KEEP: „Drehmomentfrei“ benennt bereits die zentrale Erhaltungsbedingung; der ausdrücklich qualitative Beispielanspruch bleibt erhalten. Das gelesene Bild konkretisiert sie mit M_ext = 0. Die Systemgrenze und das resultierende äußere Moment gehören zur sauberen Anwendung dieser vorhandenen Aussage, nicht zu einer neuen Beschreibungserweiterung.',
  },
  {
    goalId: '642aebd7-66cd-5a50-b543-73c4b207525d', decision: 'keep',
    understanding: [
      'Das Trägheitsmoment charakterisiert die Verteilung der Masse relativ zur gewählten Drehachse. Bei gleichem Winkelgeschwindigkeitsbetrag benötigt eine Verteilung mit größerem Trägheitsmoment mehr Rotationsenergie; Energievergleiche müssen deshalb die Achse und die konstant gehaltene Größe benennen.',
      'Moment of inertia characterizes mass distribution relative to the chosen rotation axis. At the same angular speed, a distribution with greater moment of inertia carries more rotational energy; energy comparisons must therefore specify the axis and the quantity held constant.',
      'Die lernende Person vergleicht selbstständig zwei einfache Massenanordnungen bezüglich derselben Achse, begründet deren unterschiedliche Trägheitsmomente und leitet bei gleicher Winkelgeschwindigkeit den qualitativen Rotationsenergievergleich ab.',
      'The learner independently compares two simple mass arrangements about the same axis, explains their different moments of inertia, and derives the qualitative rotational-energy comparison at equal angular speed.',
      'In einer neuen Aufgabe bleibt der Körper gleich, aber die Drehachse wird verschoben; sie prüft die neuen Massenabstände und begründet, weshalb sich Trägheitsmoment und Rotationsenergie bei gleicher Winkelgeschwindigkeit ändern.',
      'In a fresh task, the body stays unchanged but its rotation axis is shifted; the learner examines the new mass distances and explains why moment of inertia and rotational energy change at equal angular speed.',
    ],
    rationale: 'KEEP: Die Beschreibung verlangt eine qualitative Erklärung des Trägheitsmoments einschließlich seiner Energiebedeutung, keine lose Sammlung zweier Rechenverfahren. Das gelesene Bild zeigt passende Massenverteilungen und benennt gleiches omega als Vergleichsbedingung. Umfangreiche Trägheitsmomentintegrale oder Rotationsdynamik werden nicht ergänzt.',
  },
  {
    goalId: '5a951a0b-fd6c-51a1-9ffb-2a34ed6d3931', decision: 'split_review',
    understanding: [
      'Rotationsenergie ist eine Zustandsgröße aus Trägheitsmoment und Winkelgeschwindigkeit; Beschleunigungsmoment beschreibt dagegen die Änderung der Winkelgeschwindigkeit. Die Beziehungen E_rot = I omega²/2 und M_res = I alpha setzen im einfachen Modell eine feste Achse und ein konstantes Trägheitsmoment voraus.',
      'Rotational energy is a state quantity determined by moment of inertia and angular velocity; acceleration torque instead concerns the change in angular velocity. In the simple model, E_rot = I omega²/2 and M_net = I alpha require a fixed axis and constant moment of inertia.',
      'Die lernende Person bestimmt selbstständig einerseits die Energie eines vorgegebenen Rotationszustands und andererseits das nötige resultierende Moment eines Beschleunigungsvorgangs, erklärt Einheiten und Vorzeichen und unterscheidet mittlere von momentaner Winkelbeschleunigung.',
      'The learner independently determines the energy of a specified rotational state and, separately, the required net torque for an acceleration process, explains units and signs, and distinguishes average from instantaneous angular acceleration.',
      'Eine frische Aufgabe kehrt den Drehsinn eines Zustands um und ersetzt in einem zweiten Fall Beschleunigen durch Abbremsen; sie begründet, weshalb das Energievorzeichen unverändert bleibt, während die Richtung des resultierenden Moments vom Änderungsverlauf abhängt.',
      'A fresh task reverses the direction of a rotational state and, in a second case, replaces speeding up with slowing down; the learner explains why energy retains its sign while net-torque direction depends on the evolution of the motion.',
    ],
    rationale: 'SPLIT_REVIEW: Der Wortlaut verbindet zwei unabhängig prüfbare Routinen: E_rot aus I und omega bestimmen sowie ein Beschleunigungsmoment aus alpha bestimmen. Es wird keine gemeinsame Energie-Dynamik-Beziehung verlangt, die sie zu einer einzigen Kompetenz verbinden würde; auch das gelesene Bild stellt zwei getrennte Rechnungen dar. Eine längere Ersatzbeschreibung würde diese Atomicitätsfrage verdecken. Zusätzlich muss bei einer späteren Aufteilung „mittleres“ Moment mit einer mittleren oder konstanten Winkelbeschleunigung und konstantem I abgeglichen werden. DE/EN sind in diesem Punkt gleich.',
  },
  {
    goalId: 'b49e0f6b-df2a-5643-b3ce-a9dfdf25f3bc', decision: 'revise',
    proposedDescriptionDe: 'Die lernende Person kann die Präzession von Kreiseln oder Gyroskopen qualitativ als Änderung der Drehimpulsrichtung durch ein äußeres Drehmoment erklären und von der Drehimpulserhaltung ohne äußeres Drehmoment abgrenzen.',
    proposedDescriptionEn: 'The learner can qualitatively explain the precession of tops or gyroscopes as a change in angular momentum direction caused by an external torque and distinguish it from angular momentum conservation without an external torque.',
    understanding: [
      'Bei der betrachteten drehmomentbedingten Präzession verändert ein äußeres Drehmoment die Richtung des Drehimpulses. Ein näherungsweise konstanter Betrag bedeutet keine Erhaltung des gesamten Vektors.',
      'In the torque-induced precession considered here, an external torque changes angular momentum direction. An approximately constant magnitude does not imply conservation of the full vector.',
      'Die lernende Person erklärt selbstständig an einer Kreiselskizze, wie ein seitlich zu L gerichtetes Drehmoment dessen Richtung verändert, und grenzt dies vom drehmomentfreien Fall ab.',
      'The learner independently uses a gyroscope sketch to explain how torque transverse to L changes its direction and distinguishes this from the torque-free case.',
      'In einer neuen Aufgabe mit umgekehrtem Rotorsinn erklärt sie bei gleichem äußerem Drehmoment die umgekehrte Präzessionsrichtung.',
      'In a fresh task with reversed rotor spin, the learner explains the reversed precession direction under the same external torque.',
    ],
    rationale: 'REVISE: Die unqualifizierte Verknüpfung mit „Drehimpulserhaltung“ lässt offen, dass ein äußeres Drehmoment den Drehimpulsvektor gerade verändert. Das gelesene Bild mit festem Auflagepunkt löst diese Ambiguität nicht auf. Die knappe Korrektur hält den qualitativen Präzessionsumfang und die vorhandene Erhaltungsabgrenzung. Fachabgleich: MIT OCW, Kapitel 22, Gleichung 22.2.6 und Abschnitt 22.3: https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/mit8_01scs22_chapter22.pdf ; keine normative Curriculum-Zuordnung verifiziert.',
  },
  {
    goalId: '21c0a5f2-4152-549a-aa9c-e02ab772f589', decision: 'keep',
    understanding: [
      'Während einer Pirouette mit vernachlässigbarem äußerem Drehmoment um die Drehachse bleibt der Drehimpuls näherungsweise gleich. Das Heranziehen von Armen oder Beinen verringert das Trägheitsmoment und erhöht die Winkelgeschwindigkeit; das Ausstrecken bewirkt die umgekehrte Änderung.',
      'During a pirouette with negligible external torque about the rotation axis, angular momentum remains approximately unchanged. Bringing arms or legs inward reduces moment of inertia and increases angular speed; extending them produces the reverse change.',
      'Die lernende Person erklärt selbstständig eine unbekannte Bildfolge einer Pirouette über Körperhaltung, Massenabstände, Trägheitsmoment und Winkelgeschwindigkeit und nennt die Erhaltungsbedingung, statt nur die Regel „Arme rein – schneller“ wiederzugeben.',
      'The learner independently explains an unfamiliar pirouette image sequence through posture, mass distances, moment of inertia, and angular speed and states the conservation condition rather than merely repeating “arms in means faster.”',
      'Eine neue Pirouettenaufgabe verändert nur die Beinhaltung oder zeigt das anschließende Ausstrecken; sie sagt die Geschwindigkeitsänderung anhand der Massenverteilung voraus und berücksichtigt ein ausdrücklich vorgegebenes äußeres Bremsmoment als Grenze.',
      'A fresh pirouette task changes only leg position or shows subsequent extension; the learner predicts the speed change from mass distribution and treats an explicitly supplied external braking torque as a limit.',
    ],
    rationale: 'KEEP: Eine konkrete Anwendung der zuvor gebundenen Erhaltungskompetenz, in beiden Sprachen gleich. Das gelesene Bild zeigt die maßgebliche Bedingung ohne äußeres Drehmoment und den richtigen Trend von I und omega. Körperhaltungswechsel werden als Transfer konkretisiert; eine eigenständige Energiebilanz oder gefährliche praktische Pirouette wird nicht verlangt.',
  },
  {
    goalId: '8daaf751-93fe-56d9-8697-ac30237061bd', decision: 'keep',
    understanding: [
      'Die Drehimpulse rollender Räder koppeln bei wirkenden Drehmomenten Neigung und Lenken. Kreiselwirkung kann zum Fahrradverhalten beitragen, begründet aber allein weder notwendige noch hinreichende Selbststabilität.',
      'The angular momenta of rolling wheels couple lean and steering when torques act. Gyroscopic effects can contribute to bicycle behavior but alone establish neither necessary nor sufficient self-stability.',
      'Die lernende Person deutet selbstständig eine vorgelegte Neigungs- und Lenkfolge mit Drehmoment- und Drehimpulsargumenten und begrenzt ihre Aussage über den Kreiselbeitrag anhand der angegebenen Fahrradgeometrie und Beobachtungen.',
      'The learner independently interprets a supplied lean-and-steer sequence using torque and angular-momentum arguments and limits the claimed gyroscopic contribution according to the specified bicycle geometry and observations.',
      'In einer frischen Gegenprobe mit kompensiertem Raddrehimpuls erklärt sie, weshalb entfallende Kreiselwirkung allein noch keine Aussage „das Fahrrad muss umfallen“ rechtfertigt.',
      'In a fresh counterexample with canceled wheel angular momentum, the learner explains why removing gyroscopic effects alone does not justify “the bicycle must fall.”',
    ],
    rationale: 'KEEP: Der Wortlaut fordert eine qualitative Deutung mit Drehmomenten und Kreiselwirkung und behauptet keine alleinige Ursache. Das gelesene Bild nennt die Kreiselwirkung ausdrücklich einen Beitrag. Die notwendige Grenze wird als Evidenz präzisiert, bestätigt durch Kooijman et al. (2011), Primärforschungsabstract: https://pubmed.ncbi.nlm.nih.gov/21493856/ . Eine vollständige Stabilitätstheorie oder ein riskanter Fahrversuch wird nicht hinzugefügt.',
  },
  {
    goalId: '07f298b2-2f5e-5b16-8150-bc603fa78ecd', decision: 'keep',
    understanding: [
      'Ein rotierender Kreisel besitzt gerichteten Drehimpuls, dessen Änderung ein Drehmoment verlangt. Wie diese Eigenschaft ein technisches System stabilisiert, hängt von Lagerung, möglichen Präzessionsbewegungen und Momentenübertragung ab; ein beliebiger Rotor garantiert keine Stabilität um alle Achsen.',
      'A spinning gyroscope carries directed angular momentum whose change requires torque. How this property stabilizes a technical system depends on mounting, permitted precession, and torque transfer; an arbitrary rotor does not guarantee stability about every axis.',
      'Die lernende Person begründet selbstständig an einer vollständig beschriebenen technischen Kreiselanordnung, welches Störmoment wirkt, wie sich der Drehimpuls ändern würde und wie die vorgegebene Lagerung oder Kopplung eine stabilisierende Wirkung ermöglicht.',
      'The learner independently explains for a fully specified technical gyroscope arrangement which disturbance torque acts, how angular momentum would change, and how the given mounting or coupling enables a stabilizing effect.',
      'In einer neuen Anordnung wird die Störmomentrichtung von quer zur Rotorachse auf parallel zu ihr geändert; sie erklärt, weshalb die zuvor begründete Richtungsstabilisierung nicht unverändert auf diesen Fall übertragbar ist.',
      'In a fresh arrangement, disturbance torque changes from transverse to parallel to the rotor axis; the learner explains why the previously justified directional stabilization does not transfer unchanged.',
    ],
    rationale: 'KEEP: Die Beschreibung nennt die richtigen physikalischen Argumente und überlässt die konkrete Technik der Anwendung. Das gelesene Bild zeigt eine Kamera mit Kreisel und Momentenpfeilen; daraus wird keine universelle Gegenmomentwirkung oder allgemeine Gimbal-Funktionsgarantie abgeleitet. Lagerung, Systemgrenze und Störungsrichtung müssen in einer unabhängigen Aufgabe explizit vorliegen.',
  },
  {
    goalId: 'd02438ba-0cc9-5993-831e-5e44d35e32c4', decision: 'keep',
    understanding: [
      'Ein magnetischer Dipol im homogenen Feld erfährt ein Drehmoment mit Betrag mu B sin(alpha), wobei alpha der Winkel zwischen magnetischem Moment und Feld ist. Parallele Ausrichtung ist stabil, antiparallele instabil; das Erreichen einer ruhenden Ausrichtung setzt die passende Dämpfung voraus.',
      'A magnetic dipole in a uniform field experiences torque of magnitude mu B sin(alpha), where alpha is the angle between magnetic moment and field. Parallel alignment is stable and antiparallel alignment unstable; settling into a stationary orientation requires suitable damping.',
      'Die lernende Person berechnet selbstständig das Drehmoment für vorgegebene Dipolrichtungen, zeichnet den Drehsinn und erklärt, weshalb das Moment bei paralleler und antiparalleler Lage verschwindet, die beiden Gleichgewichte aber verschieden stabil sind.',
      'The learner independently calculates torque for supplied dipole orientations, draws its turning direction, and explains why torque vanishes in both parallel and antiparallel positions although the equilibria differ in stability.',
      'In einer frischen Aufgabe wird das homogene Feld bei zunächst unveränderter Nadelrichtung umgekehrt; sie sagt neuen Drehsinn beziehungsweise Gleichgewichtsstabilität voraus und begründet die spätere Ausrichtung bei vorhandener Dämpfung.',
      'In a fresh task, the uniform field is reversed while the needle initially keeps its orientation; the learner predicts the new turning direction or equilibrium stability and explains subsequent alignment when damping is present.',
    ],
    rationale: 'KEEP: Homogenitätsbedingung, Drehmomentbeziehung und Erklärung der Ausrichtung sind bereits Teil einer kohärenten Kompetenz mit DE/EN-Parität. Das gelesene Bild zeigt die Nadel im Feld und einen ausrichtenden Drehsinn. Die Bedeutung von alpha, die Betragskonvention sowie stabile und instabile Lage konkretisieren die Anwendung; Feldgradientkräfte oder Quantenspin werden nicht ergänzt.',
  },
  {
    goalId: '58db62d4-458f-5e2d-9ca0-968e09f4944b', decision: 'keep',
    understanding: [
      'Ablenkung und Schwingung liefern komplementäre Beziehungen zwischen magnetischem Moment und horizontalem Erdmagnetfeld. Ihre gemeinsame Auswertung erlaubt die Feldbestimmung ohne vorher bekanntes magnetisches Moment; Hauptlagengeometrie und Trägheitsmoment müssen bekannt sein.',
      'Deflection and oscillation provide complementary relations between magnetic moment and the horizontal terrestrial field. Combining them determines the field without a previously known magnetic moment; principal-position geometry and moment of inertia must be known.',
      'Die lernende Person erklärt selbstständig die beiden Messprinzipien und kombiniert vorgelegte Winkel-, Abstands- und Periodendaten samt Trägheitsmoment zu einer Feldbestimmung; sie unterscheidet Messwerte, Modellgrößen und Unsicherheiten.',
      'The learner independently explains both measurement principles and combines supplied angle, distance, and period data with moment of inertia to determine the field, distinguishing measurements, model quantities, and uncertainties.',
      'In einer neuen Aufgabe mit anderer Gaußscher Hauptlage begründet sie den geänderten Geometriefaktor der Ablenkung und prüft die Konsistenz mit der unveränderten Schwingungsauswertung.',
      'In a fresh task using another Gauss principal position, the learner explains the changed deflection geometry factor and checks consistency with the unchanged oscillation analysis.',
    ],
    rationale: 'KEEP: Die zwei Methoden bilden gemeinsam das ausdrücklich benannte Messverfahren; eine Aufteilung würde dessen Eliminationsgedanken verlieren. Das gelesene Bild zeigt beide Aufbauten, ersetzt aber keine Messdaten. Der fachliche Zusammenhang wurde mit der Darstellung der betreibenden Erdbebenwarte abgeglichen: https://www.erdbebenwarte.de/gaussversuch-und-erdmagnetfeld/ . Das ist keine normative Quellenmapping-Prüfung.',
  },
];

if (judgments.length !== 20 || rows.length !== 20) throw new Error('Expected exactly 20 independently authored decisions');
const evidenceKeys = ['essentialUnderstandingDe', 'essentialUnderstandingEn', 'observablePerformanceDe', 'observablePerformanceEn', 'transferExpectationDe', 'transferExpectationEn'];
const records = rows.map((row, index) => {
  const goal = row.goal;
  const judgment = judgments[index];
  if (goal.goalId !== judgment.goalId) throw new Error('Goal order mismatch at ' + index);
  const record = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1, recordId: runId + '.record-' + String(index + 1).padStart(3, '0'),
    runId, campaignId: campaign.campaignId, roundId: campaign.roundId,
    bundleFingerprint: row.bundleFingerprint, bookDigest: row.bookDigest,
    ...Object.fromEntries(['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn'].map(key => [key, goal[key]])),
    decision: judgment.decision,
    ...(judgment.decision === 'revise' ? {proposedDescriptionDe: judgment.proposedDescriptionDe, proposedDescriptionEn: judgment.proposedDescriptionEn} : {}),
    understandingEvidence: Object.fromEntries(evidenceKeys.map((key, position) => [key, judgment.understanding[position]])),
    rationale: judgment.rationale,
    evidenceProfileContract: 'positive-understanding-evidence-v2', evidenceProfileRecommendation: 'create',
    recordStatus: 'candidate', reviewAuthority: 'ai_candidate',
  };
  const v = goal.reviewContext.page.visualization;
  const repository = directory.slice(0, directory.indexOf('/curricula/'));
  if (hash(fs.readFileSync(path.join(repository, 'app/public', v.url))) !== v.originalDigest) throw new Error('Image drift: ' + goal.goalId);
  return record;
});
const recordsText = records.map(record => JSON.stringify(record)).join('\n') + '\n';
const run = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
  schemaVersion: 1, runId, campaignId: campaign.campaignId, roundId: campaign.roundId,
  batchId: batch.batchId, batchInputFingerprint: batch.batchInputFingerprint,
  bundleFingerprint: campaign.bundleFingerprint, bookDigest: campaign.bookDigest,
  provider: 'OpenAI', model: 'Codex', modelVersion: 'Exact model identifier not disclosed by the environment',
  role: 'subject_reviewer', promptFamilyId: 'goal-description-understanding-evidence-review-v2',
  promptFingerprint: campaign.promptFingerprint, criteriaFingerprint: campaign.criteriaFingerprint,
  generationParametersFingerprint: hash(JSON.stringify(generationParameters)),
  independenceGroupId: campaign.independenceGroupId, blindToOtherRuns: true, goalIds: batch.goalIds,
  inputArtifacts: [
    {role:'description_review_batch_input_jsonl', digest:batch.batchInputFingerprint},
    {role:'review_prompt', digest:campaign.promptFingerprint},
    {role:'review_criteria', digest:campaign.criteriaFingerprint},
  ],
  startedAt: '2026-09-06T22:04:49.000Z', completedAt: new Date().toISOString(), status: 'completed',
  outputDigest: hash(recordsText), toolchainVersion: 'codex-independent-review-node20-v1',
};
process.stdout.write(JSON.stringify({batchId:batch.batchId, recordsText, runText:JSON.stringify(run,null,2)+'\n'}));
