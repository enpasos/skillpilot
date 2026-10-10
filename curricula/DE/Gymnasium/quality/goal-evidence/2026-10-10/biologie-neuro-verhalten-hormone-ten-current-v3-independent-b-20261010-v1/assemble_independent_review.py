"""Assemble this reviewer's decisions; never mutate the reviewed candidate."""
from pathlib import Path
import json, hashlib, datetime, re, unicodedata

ROOT = Path('/home/enpasos/projects/skillpilot')
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10'
A = BASE / 'biologie-neuro-verhalten-hormone-ten-whole-material-and-raster-author-candidate-v1'
B = BASE / 'biologie-neuro-verhalten-hormone-ten-current343-source-raster-native-technical-preparation-20261010-v1'
T = BASE / 'biologie-neuro-verhalten-hormone-ten-sehbahn-v3-current343-native-technical-successor-20261010-v2'
OWN = Path(__file__).parent
NS = OWN.name

def read(p): return json.loads(p.read_text())
def sha(b): return 'sha256:' + hashlib.sha256(b).hexdigest()
def ref(p):
    p = p.resolve(); return {'path': str(p.relative_to(ROOT)), 'sha256': sha(p.read_bytes()), 'bytes': p.stat().st_size}
def write(p, d):
    p.parent.mkdir(parents=True, exist_ok=True); p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
def normalize(v): return re.sub(r'\s+', ' ', unicodedata.normalize('NFKC', str(v or ''))).strip()
def semantic_fingerprint(g, rule):
    tags = g.get('dimensionTags', {})
    d = {'ruleVersion':rule,'goalId':g['id'],'shortKey':g.get('shortKey') or '',
         **{k:normalize(g.get(k)) for k in ['title','titleEn','description','descriptionEn','nodeKind']},
         **{k:normalize(tags.get(k)) for k in ['phase','area','topicCode']}}
    return sha(json.dumps(d, ensure_ascii=False, separators=(',', ':'), sort_keys=True).encode())

# These are this agent's independent judgments, written after reading whole DE/EN
# goals, profiles, both full cases with fresh transfer, and the actual 50 images.
J = {
'146d70e0': {
'e': [
'Die Sehbahn überführt retinale Transduktion in afferente Information; die partielle Kreuzung sortiert Gesichtsfelder, und thalamisch-kortikale Stationen verarbeiten die Hauptbahn.',
'The visual pathway turns retinal transduction into afferent information; partial crossing sorts visual hemifields and thalamic and cortical stations process the principal pathway.',
'Die lernende Person ordnet Rezeptor, Bipolar- und Ganglienzelle, Sehnerv, Chiasma, CGL, Sehstrahlung und Sehrinde und verfolgt das rechte Gesichtsfeld aus beiden Augen zur linken Sehrinde.',
'The learner orders receptor, bipolar and ganglion cells, optic nerve, chiasm, LGN, optic radiation and visual cortex, and traces the right hemifield from both eyes to left visual cortex.',
'Sie zeichnet das linke Gesichtsfeld ohne Modellkarten und unterscheidet eine Unterbrechung vor dem Chiasma von einer Unterbrechung des linken Tractus anhand der fehlenden Information.',
'They trace the left hemifield without model cards and distinguish a prechiasmal interruption from interruption of the left optic tract using the information that would be lost.'],
'd':'KEEP: Der knappe DE/EN-Text benennt dieselbe erklärbare Hauptbahn. Kreuzungslogik und Relais sind gemeinsam ein kausales Wegmodell. Beide vollständigen Fälle und die Gegenfeld-/Tractusvarianten liefern getrennte Anwendungsmöglichkeiten. Die BY-B8.2.2-exact-Zuordnung ist sachlich unzutreffend und bleibt ein separater Quellenbefund; KEEP bestätigt keine Quellen- oder Kursvollständigkeit.',
'a':'Die Stationen und Gesichtsfeldkreuzung sind Teil eines zusammenhängenden Informationswegs. Wegdarstellung und begründete Ausfallvorhersage prüfen dasselbe Konstrukt, keine unabhängig abtrennbare zweite Kompetenz.',
'm':'Ein memorierter Stationskatalog genügt nicht: Die entscheidende Leistung ist die Projektion beider Netzhäute auf Hemisphären und die neue Unterbrechungsfolgerung. Modellgestützte Rekonstruktion deckt das Ziel; ein eigener verpflichtender Recall-Deck ist dafür nicht nötig.',
'v':'KEEP v3: Der gelbe Rezeptionsfokus liegt sichtbar auf der Netzhaut oberhalb des Sehnerv-/Gefäßaustritts. Beide Augen führen je einen gekreuzten und ungekreuzten Strang, danach Relais und okzipitale Verarbeitung. ORIGINAL, 360 und 680 lassen die Hauptroute erkennen; keine exakte Gesichtsfeldlegende wird vorgetäuscht.',
'p':['visual-route: Photorezeptortransduktion ist von Ganglienzell-AP getrennt; rechte nasale und linke temporale Retina ergeben linke Sehrinde. Die unabhängige Linksvariante verlangt aktive Neuzeichnung. Die 4/4/2-Kriterien erfassen Weg, Kreuzung und Modellgrenze.',
'visual-interruption: Linker Sehnerv bedeutet fehlende Information des linken Auges; kreuzende nasale Fasern am Chiasma betreffen temporale Felder, linker Tractus das rechte Gesichtsfeld. Die frische C-Variante benötigt Faserbegründung. Keine Diagnose, tatsächliche Verletzung oder Patientendaten behauptet.'],
's':'HE Q2.4 GK/LK fordert ein ausgewähltes Sinnesorgan samt Transduktion, Wahrnehmung, Erregungsweiterleitung und Reaktion. CGL, Gesichtsfeldkreuzung und konkrete Stationsfolge sind authored Vertiefung, kein offizieller vollständiger GK/LK-Pflichtbullet. BY B8.2.2 enthält zusätzlich Sehfehler und Korrektur; der aktuelle exact-Match ist nur Teilüberschneidung.'},
'2706c28e': {
'e': [
'Gehirnleistungen beruhen auf kooperierenden Verarbeitungsschritten; erhaltene Teilfunktionen und gezielte Unterbrechungen begrenzen die Zuordnung zu Netzwerken.',
'Brain performance depends on cooperating processing stages; preserved components and stipulated interruptions constrain what can be attributed to networks.',
'Die lernende Person deutet das S-R-P-C-Modell über Wahrnehmen, Erkennen, Planen und Ausführen und trennt beim H-Modell neue episodische Speicherung von Aufmerksamkeit und vorhandener Erinnerung.',
'The learner interprets the S-R-P-C model through perceiving, recognizing, planning and executing, and distinguishes new episodic encoding from attention and existing memory in the H model.',
'Sie begründet die Wirkung einer neuen P-C-Unterbrechung und prüft bei gemeinsam schlechter neuer und vertrauter Leistung die Alternative Ablenkung anhand eines kontrollierten Vergleichs.',
'They justify the consequence of a new P-C interruption and examine distraction as an alternative when both new and familiar performance decline, using a controlled comparison.'],
'd':'KEEP: DE und EN verlangen Deutung statt bloßer Nennung eines Gehirnzentrums. Netzwerkunterbrechung und Gedächtnissituation operationalisieren dieselbe datenbegrenzte funktionale Deutung. Neue Kanten-/Aufmerksamkeitsvarianten gehen über Wiederholung der Musterlösung hinaus. Der breite HE-LK-Überblick belegt nicht jede detaillierte Netzwerk- oder GK-Einstufung.',
'a':'Objekthandlung und Gedächtnis sind Anwendungen einer gemeinsamen Interpretationsleistung: erhaltene und beeinträchtigte Teilfunktionen in einem vorgegebenen Modell erklären. Der Text verlangt keine eigenständige vollständige Gedächtnisbiologie oder klinische Diagnostik.',
'm':'Die Aufgabe gelingt durch Vergleich erhaltenen Wahrnehmens, Erkennens und Ausführens sowie Prüfung konkurrierender Erklärungen. Eine Liste von Gehirnregionen würde die Modellinterpretation nicht tragen; verbindlicher Recall ist im aktuellen Ziel nicht notwendig.',
'v':'KEEP: Blick des Kindes, gesehenes Objekt, verteiltes Gehirnnetz und greifende Hand ergeben eine plausible Wahrnehmungs-Handlungsroute. Die markierte Unterbrechung ist eine Netzwerkstelle; sie behauptet kein einzelnes reales Krankheitszentrum. Pupillen und Handaktion sind bei allen drei Größen lesbar.',
'p':['brain-object: Die R-Unterbrechung erhält rohe Merkmale und Motorik, beeinträchtigt die Erkennung. Die neue P-C-Kante trennt vorhandenes Planen von Ausführen. Fiktive Netzwerkbuchstaben vermeiden anatomische Scheingenauigkeit; eigene kausale Erklärung erforderlich.',
'brain-memory: Reduziertes H passt zu schwächerem Lernen einer neuen Route bei erhaltener vertrauter Route. Aufmerksamkeitskontrolle und frische Ablenkungsvariante schützen vor monokausaler Lokaldiagnose. Langzeitwissen liegt verteilt, nicht exklusiv im H.'],
's':'HE Q2.4 LK: Aufbau und Funktion des menschlichen Gehirns im Überblick. Q2.3 LK nennt gesondert Störungen und bildgebende Verfahren auf prinzipieller Ebene. Beide Stellen geben begrenzten Kontext; sie verlangen nicht das ganze authored S-R-P-C-/H-Modell und keine uneingeschränkte GK-Rolle.'},
'5670e999': {
'e': [
'Nozizeptive Reizaufnahme, aufsteigende Verarbeitung, Reflex und subjektiver Schmerz sind unterscheidbar; absteigende Einflüsse können synaptische Weiterleitung hemmen oder erleichtern.',
'Nociceptive reception, ascending processing, reflex and subjective pain can be distinguished; descending influences can inhibit or facilitate synaptic transmission.',
'Die lernende Person zeichnet Aufstieg und Abstieg, erklärt den früheren Reflex ohne Gleichsetzung mit bewusstem Schmerz und deutet Ausgangsunterschiede bei identischem modelliertem Eingang.',
'The learner draws ascending and descending routes, explains an earlier reflex without equating it with conscious pain, and interprets output differences at the same modeled input.',
'Sie erklärt einen höheren Ausgang bei gleichem Eingang als mögliche zentrale Verstärkung und benennt, weshalb der Modellwert keine individuelle Schmerzstärke und keine Diagnose ist.',
'They explain higher output at unchanged input as possible central amplification and state why a model value is neither an individual pain rating nor a diagnosis.'],
'd':'KEEP: Die Beschreibung bindet Nozizeption und Schmerzmodulation an denselben Informationsprozess. Reflexzeitmodell und synaptisches Eingangs-/Ausgangsmodell zeigen echte Unterscheidungs- und Transferleistung. Zeiten und Einheiten sind ausdrücklich erfunden. Der HE-Nachweis ist auf synaptische Prinzipien begrenzt, nicht ein offizielles komplettes Nozizeptionsziel.',
'a':'Aufnahme, Aufstieg und absteigende Modulation sind kausal verbundene Aspekte des einen Signalverarbeitungsmodells. Reflex/Schmerz-Unterscheidung ist dessen Verständnisbedingung, kein zusätzliches klinisches Beurteilungsziel.',
'm':'Die Kernleistung liegt im Unterscheiden von Reflex, Weiterleitung und subjektivem Erleben sowie im Deuten veränderten Ausgangs bei gleichem Eingang. Fachbegriffe sind verfügbar; wiederholter Wortabruf ersetzt diese Modellleistung nicht und ist nicht erforderlich.',
'v':'KEEP: Orange verläuft vom Hautende über Rückenmark nach oben, Blau vom Gehirn zurück zur spinalen Modulation mit Plus/Minus. Richtung und Ein-/Ausgang bleiben bei 360 sichtbar. Die stilisierte Route beansprucht keine histologisch vollständige Rückenmarksanatomie und keine Schmerzskala.',
'p':['nociception-reflex: t0/t40/t180 sind synthetische Reihenfolgen, keine realen physiologischen Grenzzeiten. Rückzug vor Bericht belegt nicht fehlende subjektive Erfahrung. Eigene Routenskizze und frische Verzögerungsdeutung prüfen Reflex- und Bewusstseinstrennung.',
'nociception-modulation: Eingang 20 mit Ausgängen 12, 5 und 16 zeigt neutralen, gehemmten und erleichterten Modellfluss. Der höhere Ausgang bei unverändertem Eingang ist mit zentraler Verstärkung vereinbar, keine Patientendiagnose oder behauptet eingebildeter Schmerz.'],
's':'HE physisch/gedruckt43 Q2.3 LK nennt EPSP/IPSP und räumliche/zeitliche Summation. Das trägt Modulationsprinzipien teilweise; Nozizeption/Schmerzbahn steht nicht ausdrücklich in dieser Stelle. Das erhaltene authored topicCode Q2.4 ist kein offizieller Q2.4-Nozizeptionsbullet.'},
'97a15c19': {
'e': [
'Das Ohr überträgt Schall zunächst mechanisch und transduziert Haarbündelbewegung in elektrische Information; zentrale Stationen verarbeiten beidseitige Hörinformation und Frequenzorte.',
'The ear first transmits sound mechanically and transduces hair-bundle movement into electrical information; central stations process bilateral auditory input and frequency location.',
'Die lernende Person ordnet Trommelfell, Gehörknöchelchen, Cochlea, Haarzelle, afferente Faser, Hirnstamm, Thalamus und Hörrinde und erklärt, weshalb ein Haarzellsynapsenblock trotz Mechanik afferente AP verhindert.',
'The learner orders eardrum, ossicles, cochlea, hair cell, afferent fiber, brainstem, thalamus and auditory cortex and explains why a hair-cell synaptic block prevents afferent AP despite intact mechanics.',
'Sie vergleicht neue periphere und zentrale Unterbrechungen sowie Basis-/Apex-Erregung und begrenzt Folgerungen aus einseitigem Inputverlust aufgrund beidseitiger zentraler Verschaltung.',
'They compare new peripheral and central interruptions and base/apex excitation, and constrain conclusions from unilateral input loss because central pathways receive bilateral information.'],
'd':'KEEP: DE/EN markieren denselben Schall-Verarbeitungsweg. Mechanik, Transduktion und zentraler Verlauf sind funktionale Schritte, deren Unterschied die Fälle prüfen. Basis/Apex und einseitiger Ausfall sind neue Anwendungen. Eine Hörstörung wird nicht diagnostiziert; HE ein Sinnesorgan belegt keine vollständige authored Stationspflicht.',
'a':'Mechanische Aufnahme und neuronale zentrale Verarbeitung bilden einen durchgehenden Weg. Unterbrechungsvergleich und Tonortzuordnung sind Begründungen dieses Wegs, keine unabhängigen umfassenden Akustik- oder Krankheitskompetenzen.',
'm':'Der Weg kann aus den funktionalen Rollen konstruiert werden; entscheidend ist, mechanische Bewegung von afferenten AP zu trennen und einen neuen Block zu erklären. Ein Stationen-Recall ist kein notwendiger gesonderter Zielbestandteil.',
'v':'KEEP: Außenschall, Ohrmechanik, Cochlea mit vergrößerten Haarbündeln, elektrische Nervenlinie und laterale kortikale Stelle sind verständlich getrennt. Es werden keine Schallwellen im Nerv dargestellt. Das Orientierungsbild lässt zentrale Relais/Bilateralität weg, beansprucht aber keine vollständige Bahndarstellung; das Material erläutert diese Grenze.',
'p':['hearing-route: Hohe Frequenz Basis, niedrige Apex; Haarzelle mit graduiertem Potential, afferente Faser mit AP. Die frische Synapsenblockvariante trennt mechanisch intakte Weitergabe von unterbrochener neuronaler Information.',
'hearing-blocks: A am Trommelfell, B an Haarzellen und C zentral liefern verschiedene Mechanismen trotz ähnlicher Messfolge. Der neue einseitige periphere Verlust legt wegen bilateraler Zentralwege nicht eine vollständig stille Hörrinde fest.'],
's':'HE Q2.4 GK/LK erlaubt ein Sinnesorgan, also das Ohr als authored Auswahl. Die konkrete zentrale Stationenfolge und bilaterale Verschaltung sind zusätzliche didaktische Operationalisierung. Breite SekI-Organkompetenzen geben keine ganze Hörbahn-/LK-Gleichwertigkeit.'},
'9499943f': {
'e': [
'Strukturen ausgewählter Sinnesorgane ermöglichen mechanische Reizaufnahme und neuronale Transduktion; ein physikalisches Modell kann nur seine tatsächlich enthaltenen Funktionen erklären.',
'Structures of selected sense organs enable mechanical reception and neural transduction; a physical model can explain only functions actually included in it.',
'Die lernende Person erläutert am Auge Optik und Netzhaut sowie am Ohr Membran, Hebel und Haarzellen und plant kontrollierte Änderungen an Linsen- und Membranmodellen mit begründeter Messgröße.',
'The learner explains optics and retina in the eye and membrane, lever and hair cells in the ear, and plans controlled changes in lens and membrane models with a justified measurement.',
'Sie trennt bei veränderter Helligkeit einen helleren unscharfen Fleck von verbessertem Fokus und unterscheidet bessere mechanische Übertragung eines Ohrmodells von nachgewiesener neuronaler Hörleistung.',
'They distinguish a brighter blurred spot from improved focus when brightness changes and separate stronger mechanical transmission in an ear model from demonstrated neural hearing performance.'],
'd':'KEEP: Erläutern ausgewählter Struktur-Funktions-Beziehungen ist verständlich, prüfbar und DE/EN gleich. Eigene Modellplanung macht die Erklärung beobachtbar, erweitert sie nicht zur behaupteten tatsächlichen Versuchsdurchführung. Zwei Organmodelle sind die authored Auswahl; HE nur ein Organ wird dadurch nicht als offizielle Doppelpflicht ausgegeben.',
'a':'Die gleiche Struktur-Funktions-Analyse wird an Auge und Ohr angewandt. Kontrollierte Modelländerung und Modellgrenze dienen der Erklärung; das Ziel fordert keine komplette selbstständige Erforschung sämtlicher Sinnesorgane.',
'm':'Namen von Organbestandteilen unterstützen Orientierung, aber die Kernleistung ist das Zuordnen ihrer Funktionen und das begründete Kontrollieren eines Modells. Die Materialien stellen Teile bereit; ein verpflichtender zusätzlicher Begriffsdeck ist nicht erforderlich.',
'v':'KEEP: Linsenweg mit retinalem Fokus und Ohrmechanik mit neuronalem Ausgang zeigen zwei ausgewählte Sinnesorgane. Reiz und Nervensignal sind getrennt. Iris/Pupille, Cochlea und Signalwege bleiben bei 360 erkennbar; keine tatsächlich durchgeführte Untersuchung wird behauptet.',
'p':['sense-eye: Bei fester Gegenstandsweite, Helligkeit und Schirmlage wird nur die Linse variiert; die Schärfemessung passt zur Optik. Ein hellerer unscharfer Fleck in der frischen Variante ist keine verbesserte Fokussierung. Netzhauttransduktion ist im Linsenmodell ausdrücklich nicht enthalten.',
'sense-ear: Membran-/Hebel-/Wassermodell verlangt konstante Eingabe und gezielte mechanische Variation. Messbare Übertragung zeigt Mechanik; ohne Haarzellen ist kein sensorischer oder neuronaler Nachweis möglich. Eigene kontrollierte Planung bleibt G1-Material, kein Versuchsempfang.'],
's':'HE Q2.4 GK/LK: ein Sinnesorgan. TH gedruckt16/physisch22: Auge oder Ohr; ST verlangt Auge und ein weiteres Organ einschließlich fachpraktischer Anteile. BY B9.5.8 verlangt Insekten/Wirbeltier-Vergleich, der in den authored Auge/Ohr-Fällen nicht enthalten ist. Diese Verbindungen bleiben Teilbelege ohne ganze Kursabdeckung.'},
'a7eee23c': {
'e': [
'Gehirnregionen haben typische funktionale Schwerpunkte und arbeiten zusammen; ihre grobe räumliche Lage bestimmt keine exklusive Zuordnung komplexer Handlungen.',
'Brain regions have typical functional emphases and cooperate; their broad spatial locations do not establish exclusive assignment of complex actions.',
'Die lernende Person ordnet Großhirn, Kleinhirn und Hirnstamm in der Übersicht und erklärt beim Radfahren kooperierende Wahrnehmung, Koordination und autonome Regulation sowie Funktionen innerer Strukturen.',
'The learner places cerebrum, cerebellum and brainstem in an overview and explains cooperating perception, coordination and autonomic regulation during cycling, alongside functions of internal structures.',
'Sie erklärt beim stillen Lesen oder bei neuer Navigation zur Nahrung eine andere Zusammenarbeit und grenzt hippocampale Beteiligung an neuer episodischer Erinnerung von exklusiver Speicherung aller Erinnerungen ab.',
'They explain a different pattern of cooperation during silent reading or new navigation to food, and distinguish hippocampal involvement in new episodic memory from exclusive storage of all memories.'],
'd':'KEEP: Überblick und Funktionszuordnung sind in beiden Sprachen gleich. Groblage und typische Beiträge sind gemeinsam eine funktionale Karte; Handlungsvarianten erfordern Zusammenarbeit statt Wortliste. Innerer Thalamus/Hypothalamus/Hippocampus sind begrenzte authored Vertiefung. HE Q2.4 LK ist der passende Überblick, keine Zulassung aller Kursprofile.',
'a':'Großbereiche und innere Beispiele gehören zur einen funktionalen Orientierungskarte. Das Material bleibt bei typischen Beiträgen und Kooperation, fordert keine unabhängig prüfbare Neuroanatomie-, Endokrinologie- oder Gedächtnistheorie-Gesamtheit.',
'm':'Eine kurze Regionsliste könnte freiwillig hilfreich sein, ist jedoch keine notwendige eigenständige Gedächtnisleistung im Ziel: die beobachtete Kompetenz verbindet Lage, typische Beiträge und Zusammenarbeit in einem neuen Handlungsbeispiel. no_memory_needed wird deshalb beibehalten, nicht aus dem alten generischen Ledgergrund übernommen.',
'v':'KEEP: Oberes gefaltetes Großhirn, posteriores inferiores Kleinhirn und anteriorer Hirnstamm sind räumlich plausibel; Linien enden in ihren jeweiligen Bereichen. Rad-/Balance- und autonome Icons sind Funktionsschwerpunkte, keine exklusiven Zentren. Keine Schrift- oder Perspektivverdeckung.',
'p':['brain-overview: Radfahren verbindet Wahrnehmen/Denken, Koordination und autonome Regulation. Stilles Lesen in der frischen Variante benötigt weiter Motorik und autonome Funktionen; keine Ein-Region-eine-Handlung-Folgerung.',
'brain-inner: Thalamus als Relais, Hypothalamus für Hunger/Temperatur/endokrine Steuerung und Hippocampus für neue Episoden werden im Überblick unterschieden. Neue Nahrungssuche verknüpft Beiträge; alle Erinnerungen werden nicht exklusiv im Hippocampus gespeichert.'],
's':'HE physisch/gedruckt43 Q2.4 LK nennt ausdrücklich Aufbau und Funktion des menschlichen Gehirns im Überblick. Dieser begrenzte Bezug ist tragfähig; die genaue Auswahl innerer Regionen bleibt authored. Breite SekI-Überblicke sind keine LK- oder Vollkursgleichwertigkeit.'},
'3d822550': {
'e': [
'Attrappenversuche isolieren Reizmerkmale und prüfen beobachtbares Verhalten unter kontrollierten inneren und äußeren Bedingungen; Reaktionshäufigkeit ist keine Absichtsdiagnose.',
'Dummy experiments isolate stimulus features and examine observable behavior under controlled internal and external conditions; response frequency is not an intention diagnosis.',
'Die lernende Person vergleicht rote und graue Fischattrappen in zwei Zuständen und prüft bei Vogelattrappen Form und Fleck als zusammen veränderte Merkmale; sie formuliert Kontrollen, Wiederholungen und eine Beobachtungsgröße.',
'The learner compares red and gray fish dummies in two states and identifies shape and spot as jointly changed features in bird dummies; they specify controls, repetition and an observable outcome.',
'Sie erkennt die neue Distanzänderung als Störvariable und entwirft einen Vergleich, der jeweils nur ein Reizmerkmal verändert und Reihenfolge beziehungsweise Zustand kontrolliert.',
'They identify a new distance change as a confound and design a comparison varying only one stimulus feature while controlling order and state.'],
'd':'KEEP: Der ausführlichere DE/EN-Text ist angemessen für eine experimentelle Kompetenz mit Auswertung und Planung. Die beiden Fälle verhindern angeboren/immer/aggressiv-Überinterpretation. Eine frische Distanz- beziehungsweise Merkmalskontrolle verlangt eigenes Handeln am Modell. Zahlen bleiben synthetisch, keine Tierintervention oder echte Durchführung behauptet.',
'a':'Reizmerkmal, Zustand, Kontrolle und Auswertung sind gemeinsam die Kompetenz eines Attrappenversuchs. Fisch und Vogel sind Anwendungswechsel, kein zweites inhaltlich unabhängiges Ziel; aus dem Text folgt keine vollständige Ethologie.',
'm':'Die notwendigen Entscheidungen betreffen Vergleichsgruppen, gleich gehaltene Bedingungen und Grenzen einer Verhaltensfolgerung. Sie werden auf neue Merkmalskonflikte angewandt; ein Recall-Deck für Schlüsselreiznamen oder Tierbeispiele ist nicht erforderlich.',
'v':'KEEP: Lernende beobachten einen Video-/Modellvergleich und führen Notizen. Rote/graue Attrappen haben vergleichbare Geometrie; Fisch und Vogel sind Illustrationen ohne taxonomische Identifikationsaufgabe. Blickrichtung, Bildschirm und rechte Notizperspektive sind plausibel. Tallys sind Illustration, keine Messdaten des Falls.',
'p':['dummy-fish: Synthetisch 8/2 gegenüber 2/1 zeigt einen zustandsabhängigen Reizvergleich. Kein universeller Aggressions- oder Absichtsnachweis. Die neue Attrappendistanz zerstört die isolierte Farbvariation und verlangt eigene Kontrollkorrektur.',
'dummy-bird: Normale Fütterungszustände vor/nach mit 7/2 und 2/1 sind keine Hungerinduktion. Form und Fleck wurden gemeinsam variiert; der Ein-Merkmal-Versuchsplan mit Reihenfolgenkontrolle behebt genau diese Konfundierung.'],
's':'BY8 Verhalten/Signale sowie SH Wirbeltierverhalten und HB Lernbedingungen liefern breite Teilkontexte, kein kompletter offizieller Attrappenversuch. HB physisch31 trägt eine sichtbare Gültigkeitseinschränkung auf Jahrgang5–9; die alte breite Verbindung darf keine aktuelle normative Vollabdeckung erzeugen.'},
'5a5eeff5': {
'e': [
'Klassische Konditionierung verbindet Ereignisse, operante Konditionierung verknüpft Handlung und Konsequenz; passende Kontrollen trennen diese Zusammenhänge von bloßer Wiederholung und Kontextpräferenz.',
'Classical conditioning associates events, whereas operant conditioning links an action to a consequence; suitable controls separate these relations from repetition and context preference.',
'Die lernende Person plant gepaarte gegenüber ungepaarten Ton-Ereignis-Durchgängen mit gleichen Häufigkeiten und einen Handlungspunkt-Vergleich mit zeitgleichen handlungsunabhängigen Punkten.',
'The learner plans paired versus unpaired tone-event trials with equal frequencies and an action-contingent point comparison against equal timed action-independent points.',
'Sie prüft eine Änderung auch in der Kontrollgruppe als mögliche allgemeine Aktivierung und nutzt neue A/B-Orte, um gelerntes Handlungssignal von Ortspräferenz zu unterscheiden.',
'They examine change in the control group as possible general arousal and use new A/B locations to distinguish a learned action cue from location preference.'],
'd':'KEEP: Der Text beschreibt nachvollziehbar eine Planungskompetenz über klassische und operante Lernbeziehungen. Zwei unterschiedliche Kontingenzen verlangen passende eigene Kontrollentwürfe, neue Kontrolländerung und Ortswechsel prüfen Transfer. Mensch-/Tiervergleich wird begrenzt und nicht als Intelligenzrangfolge oder tatsächlich durchgeführter Versuch ausgegeben.',
'a':'Beide Konditionierungsformen operationalisieren eine experimentelle Planungsleistung über Kontingenz, Kontrolle und Beobachtungsmaß. Ihre Unterscheidung ist gerade die Designentscheidung; kein zweites eigenständiges Gesamtziel wird angehängt.',
'm':'Kontrollgruppen und Kontingenzen müssen auf neue Designs übertragen werden. Bloßer Abruf der Begriffe klassisch/operant/Pawlow/Skinner deckt die Planung nicht; ein eigener verpflichtender Recall wird nicht benötigt.',
'v':'KEEP: Gepaarte Glocke/Futter und zeitlich getrennte Kontrollfolge werden durch Pfeile, Uhr und unterbrochene Verbindung unterschieden. Hundedarstellungen illustrieren Erwartung ohne Messanspruch. Board, Blick und Notizen haben passende Orientierung; Kontrollunterschied bleibt bei 360 lesbar.',
'p':['conditioning-pair: Baseline, Ton-allein und ungepaarte gleiche Ereigniszahlen kontrollieren bloßen Kontakt. Freiwilliges virtuelles menschliches Beispiel ist keine Tierdeprivation. Wenn frische Kontrollgruppe ebenfalls steigt, bleibt allgemeine Aktivierung als Alternative.',
'conditioning-action: A-abhängige Punkte gegenüber yoked gleichen Punkten isolieren Handlung-Konsequenz. Neuer A/B-Ortswechsel prüft Cue statt Platzpräferenz. Zwischen Organismen sind Motivation, Wahrnehmung und faire Messung zu prüfen, keine Intelligenzhierarchie.'],
's':'BY B8.4 beinhaltet Verhalten, Konditionierung und Lernen als curricularen Kontext. Der partielle einzelne Witness belegt nicht vollständig die authored kontrollierte Planung, beide Organismenvergleiche oder zusätzliche Kursrollen; keine normative Vollabdeckung behauptet.'},
'5dd66bfd': {
'e': [
'Anlage und Erfahrung können gemeinsam Verhalten beeinflussen; Herkunfts- und Trainingsassoziationen unterscheiden Beiträge, beweisen aber ohne kontrollierte Alternativen keine reine genetische Ursache.',
'Disposition and experience can jointly affect behavior; origin and training associations distinguish contributions but cannot establish a purely genetic cause without controlled alternatives.',
'Die lernende Person beurteilt gemeinsame Aufzucht mit verschiedenen Herkunftsgruppen und Training gegenüber untrainiertem Vergleich und begründet, was die beobachteten Häufigkeiten zulassen.',
'The learner evaluates common rearing with different origin groups and training against an untrained comparison, and justifies what the observed frequencies support.',
'Sie erkennt neue unterschiedliche Aufzucht oder höheres Alter der trainierten Gruppe als Alternativerklärung und fordert einen passenden kontrollierten Vergleich statt einer entweder-oder-Zuordnung.',
'They identify newly differing rearing conditions or older age in the trained group as alternative explanations and request a suitable controlled comparison instead of an either-or attribution.'],
'd':'KEEP: DE/EN verlangen ein begründetes Urteil über Beiträge, keine absolute Trennung in genetisch oder erworben. Herkunft trotz gleicher Aufzucht und kontrolliertes Training sind zwei verschiedene Belegarten; neue Aufzucht-/Alterskonflikte begrenzen das Urteil. Der Text benötigt keine zusätzliche Genetik- oder Vererbungsberechnung.',
'a':'Herkunfts- und Trainingsvergleich dienen derselben Beurteilung relativer Verhaltensbeiträge. Beide sind logisch zusammenhängende Evidenzwege und verlangen keine getrennte vollständige Verhaltensgenetik beziehungsweise Lerntheorie.',
'm':'Die Leistung liegt in begrenztem Schlussfolgern aus Gruppenunterschieden und Kontrollvariablen. Ein Merksatz angeboren/erworben kann sogar zur falschen Dichotomie führen; die konstruktive Vergleichspraxis genügt ohne eigenen Recall-Deck.',
'v':'KEEP: Anlagen plus Erfahrung führen schematisch zum Verhalten; Nest/Eltern/Jungvögel und geführter Flug zeigen beide Beiträge ohne deterministische Einzelursache. Vögel sind illustrativ, kein Genus-/Artbestimmungstarget. Blick- und Fütterungsaktionen sind erkennbar, keine Verdeckung oder falsche Lesrichtung.',
'p':['behavior-rearing: Herkunftsgruppen X/Y mit gleicher Aufzucht unterscheiden sich zunächst 8/10 und 3/10, verändern sich nach Training auf 4/10 und 1/10. Das zeigt Association plus Erfahrung, schließt vorgeburtliche Unterschiede nicht aus. Neue unterschiedliche Aufzucht ist ein Confound.',
'behavior-training: Trainierte 8/10 gegenüber untrainierten 4/10 bei gleicher Baseline 4/10 und gleichem Alter stützt Erfahrungseinfluss. Die frische ältere Trainingsgruppe erlaubt Reifung als Alternative; kein Schluss Gene seien irrelevant.'],
's':'BY8 angeborene und erlernte Verhaltensanteile sowie SH Verhalten liefern begrenzte thematische Quellenrollen. Herkunfts-/Trainingsmodelle sind authored Evidenzdesigns; die breiten Witnesses zertifizieren weder vollständige experimentelle Genetik noch jeden Kurs.'},
'1f3cdf59': {
'e': [
'Insulin und Glukagon koppeln Blutzucker an passende Zielgewebereaktionen und negative Rückkopplung; Insulinmangel und verminderte Insulinwirkung stören dieses System auf verschiedene Weise.',
'Insulin and glucagon couple blood glucose to appropriate target-tissue responses and negative feedback; lack of insulin and reduced insulin responsiveness disrupt this system differently.',
'Die lernende Person zeichnet nach hoher beziehungsweise niedriger Glucose die Regelketten, trennt hormonelles Signal von Glucosetransport und deutet Typ1-Betazellverlust gegenüber Typ2-Resistenz mit begrenzter Kompensation.',
'The learner draws regulation chains after high or low glucose, separates hormonal signaling from glucose transport, and interprets type1 beta-cell loss versus type2 resistance with limited compensation.',
'Sie erklärt vorübergehend kompensierte Resistenz und prüft bei einer neuen familiären Aktivitätsassoziation weitere Einflussfaktoren, ohne daraus individuelle Diagnose, sichere Vorhersage oder Schuld abzuleiten.',
'They explain temporarily compensated resistance and examine other influences in a new family-activity association without deriving an individual diagnosis, certain prediction or blame.'],
'd':'KEEP: Die Regelkompetenz verbindet Normalfunktion mit begründeter Störungsanwendung. Diabetesmechanismen und begrenzte multifaktorielle Risikofolgerung konkretisieren die Regulation, verlangen weder Therapieplanung noch individuelle klinische Bewertung. Die frischen Varianten prüfen Kompensation und Konfundierung. Breite Quellen inklusive Therapieaspekten bleiben partial.',
'a':'Normaler Regelkreis und Störungen sind ein kausales homeostatisches System. Risikodaten werden als begrenzte Anwendung dieses Systems beurteilt, nicht als zusätzliches epidemiologisches oder medizinisches Gesamtziel.',
'm':'Entscheidend sind gerichtete Wirkungen, organspezifische Grenzen und Rückkopplung unter veränderten Bedingungen. Isolierter Hormonabruf reicht nicht, und das Material liefert die Komponenten. Kein eigener verpflichtender Memory-Deck ist notwendig.',
'v':'KEEP: Insulin signalisiert oben getrennt vom Glucosefluss an Leber und Muskel; unten signalisiert Glukagon an die Leber, von dort geht Glucose ins Blut. Muskel wird nicht als Glukagon-vermittelter Blutexportraum dargestellt. Pfeilrichtungen und Farbrouten bleiben bei 360 nachvollziehbar.',
'p':['glucose-feedback: Hohe Glucose löst Insulinaufnahme/-speicherung und reduzierte Leberfreisetzung aus; niedrigere Glucose mindert den Reiz. Glukagon stimuliert vor allem Leberfreisetzung, Muskelglykogen bleibt lokal; die neue kompensierte Resistenz ist möglich, nicht unbegrenzt.',
'diabetes-risk: Typ1 autoimmuner Betazellverlust unterscheidet sich von Typ2 Resistenz plus ungenügender Kompensation. Familiäre/Aktivitätsgruppen erlauben multifaktorielle Association mit Confounds. Die neue Familienassoziation ist keine Diagnose, Therapie oder Schuldzuweisung.'],
's':'TH gedruckt16/physisch22 nennt Insulin/Glukagon-Regelkreis; SN physisch35 verlangt Übertragen des Regelkreises. BW und NW verbinden Diabetes zusätzlich mit Therapien, die das authored Ziel nicht vollständig deckt. SH Hormonsystem und HH Diabetes sind breitere Teilkontexte, keine volle zentrale Regelkreis-/Kursfreigabe.'}
}

now = datetime.datetime.now(datetime.timezone.utc).isoformat()
inp = read(T/'native/ten-current-native/round-b/description-review-input.json')
campaign = read(T/'native/ten-current-native/round-b/description-review-campaign.json')
bundle = read(T/'native/ten-current-native/bundle/manifest.json')
batch = campaign['batches'][0]
runid = NS + '.round-b.run-001'
records=[]
keys=['essentialUnderstandingDe','essentialUnderstandingEn','observablePerformanceDe','observablePerformanceEn','transferExpectationDe','transferExpectationEn']
for g in inp['goals']:
    j=J[g['goalId'][:8]]
    records.append({'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,
      'recordId':NS+'.'+g['goalId'][:8]+'.D','runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],
      'bundleFingerprint':inp['bundleFingerprint'],'bookDigest':inp['bookDigest'],
      **{k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},
      'decision':'keep','understandingEvidence':dict(zip(keys,j['e'])),'rationale':j['d'],
      'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'none','recordStatus':'candidate','reviewAuthority':'ai_candidate'})
out=OWN/'results'/f"{batch['batchId']}.records.jsonl";out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in records))
params={'provider':'OpenAI','model':'Codex GPT-6 agent','exactRuntimeRevision':'not exposed to this agent', 'samplingParameters':'not exposed to this agent','agent':'/root/biology_neuro_ten_blind_b','decisionAssemblyStartedAt':'2026-10-10T11:45:21.025490+00:00','priorInspectionElapsedStart':'not retained in this artifact; no fabricated duration'}
write(OWN/'runtime-and-generation-parameters.json',params)
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,
 'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],
 'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':bundle['bundleFingerprint'],'bookDigest':bundle['bookModelDigest'],
 'provider':'OpenAI','model':'Codex GPT-6 agent','modelVersion':'Exact runtime revision not exposed','role':'subject_reviewer',
 'promptFamilyId':'goal-description-review-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],
 'generationParametersFingerprint':ref(OWN/'runtime-and-generation-parameters.json')['sha256'],'independenceGroupId':campaign['independenceGroupId'],
 'blindToOtherRuns':True,'goalIds':batch['goalIds'],
 'inputArtifacts':[{'role':r['role'],'digest':r['digest']} for r in bundle['artifacts'] if r['role'] in ['book_model','book_pdf','book_html','review_input_json','review_prompt','review_criteria']]+[{'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']}],
 'startedAt':'2026-10-10T11:45:21.025490+00:00','completedAt':now,'status':'completed','outputDigest':ref(out)['sha256'],'toolchainVersion':'skillpilot-normal-description-review-v2'}
write(OWN/'results'/f"{batch['batchId']}.run.json",run)

author=read(A/'science/ten-whole-profiles-and-twenty-cases.author.json')
tech=read(T/'neutral-current343-native-ten-Sehbahn-v3.entry.json')
# Locate neutral technical raster mapping without opening any peer verdict.
image_refs=tech['actualCurrentRastersAndNativeCaptures']
if isinstance(image_refs,list): image_refs={r['goalId']:{k:v for k,v in r.items() if k!='goalId'} for r in image_refs}
witness=read(B/'sources/ten-current41-whole-direct-source-witnesses.neutral.json')
by_witness=next(w for row in witness['rows'] for w in row['wholeDirectSourceWitnesses'] if w['wholeCurrentSourceGoal']['id']=='ad855269-70c3-526c-951b-cc2d54106f36')
sources=[]
for row in witness['rows']:
    j=J[row['goalId'][:8]]
    sources.append({'goalId':row['goalId'],'directWitnessCount':len(row['wholeDirectSourceWitnesses']),'whole41RowSha256':sha(json.dumps(row,ensure_ascii=False,separators=(',',':'),sort_keys=True).encode()),'judgment':j['s'],'wholeGoalPrimaryCoverageEstablished':False,'courseApplicabilityApproval':False,'humanApproval':False})
write(OWN/'source-review.json',{'schemaVersion':1,'status':'SOURCE_HOLD','reviewAuthority':'ai_candidate',
 'current41Input':ref(B/'sources/ten-current41-whole-direct-source-witnesses.neutral.json'),
 'sixDeltaInput':ref(A/'sourcefix/six-exact-primary-source-precision-deltas.author.json'),
 'HEPrimaryRead':{'document':ref(A/'primary/HE-KC2024-biologie.whole-current.pdf.snapshot'),'physicalPage':43,'printedPage':43,'officialNumbering':'Q2.3/Q2.4 headings with unnumbered bullets; no official Q2.4.1–6','GK_LK':'Q2.4 one selected sense organ including transduction, perception/conduction/reaction','LK':'Q2.4 human brain structure/function overview; Q2.3 synaptic integration, receptor potentials, diseases and imaging on their stated level'},
 'goalSpecificSourceLimits':sources,
 'sixCurrentPrecisionAssessments':[{'wholeAuthorChange':change,
    'independentJudgment':J[change['goalId'][:8]]['s'],
    'decision':'KEEP_bounded_authored_operationalization_only',
    'primaryActuallyRead':'HE whole PDF physical/printed page43, Q2.3/Q2.4 actual GK/LK and LK rows; text and raster viewed',
    'officialBulletOrNumberClaimAccepted':False,'wholeCourseApproval':False}
    for change in read(A/'sourcefix/six-exact-primary-source-precision-deltas.author.json')['changes']],
 'findings':[{'findingId':NS+'.BY-exact-overclaim','severity':'material_source_mapping','wholeCurrentWitness':by_witness,
   'officialReviewerPrimary':read(OWN/'primary/retrieval-receipts.json')[0],
   'actualReadLocation':'Gymnasium Biologie8 / B8.2, second competence statement (source alias B8.2.2); main competence list, excluding cross-reference taxonomy labels',
   'primaryParaphrase':'Explain perception by cooperation of optical apparatus, retinal visual cells and brain, and derive causes of refractive visual errors and possibilities for correction.',
   'wholeCanonicalGoal':next(g for g in author['wholeGoalsAndProfilesAndCases'] if g['goalId'].startswith('146'))['wholeCurrentGoal'],
   'actualReason':'The advanced canonical main visual route with chiasm, thalamic relay and cortex overlaps the retinal-to-brain component but does not require causes/correction of refractive errors. The official source is broader in one aspect and less detailed in crossing; exact same-granularity coverage is false. Existing decision rationale merely asserts seeded equivalence.',
   'requestedDisposition':'AUTHOR successor should bound this relation as partial with the omitted/extended aspects made explicit. No review write to candidate was made.'},
  {'findingId':NS+'.BY-derived-json-primary-label','severity':'material_primary_provenance',
   'currentWronglyLabeledPrimary':by_witness['currentActualPrimaryBytes'],'sourceDocumentMetadata':by_witness['sourceDocument'],
   'actualByteType':'JSON SkillLandscape, byte-identical to curricula/DE/Gymnasium/input/BY/gymnasium/Biologie.json; title Biologie (Gymnasium), goal tree, landscapeId 357a7003-b636-570e-a0bd-6bb63518d2f6; not provider HTML',
   'preciseClaim':'The filename book.html and currentActualPrimaryBytes role do not turn derived graph/source material into an official primary snapshot. sourceDocument official=true can identify intended source authority but does not establish these bytes as provider bytes.',
   'actualReviewerOfficialSnapshots':read(OWN/'primary/retrieval-receipts.json'),
   'requestedDisposition':'Preserve old bytes and history as derived graph evidence; bind actual retrieved official provider HTML and URL/retrieval metadata in a new neutral AUTHOR source successor. Reviewer retrieval alone does not repair the selected current input.'}],
 'wholeCourseClearance':False,'humanApproval':False,'humanTrial':False,'activeGain':0})

am=[]; rows=[]; errors=[]
for ar in author['wholeGoalsAndProfilesAndCases']:
    gid=ar['goalId'];j=J[gid[:8]];g=ar['wholeCurrentGoal'];p=ar['profile'];cases=ar['wholeMaterialCases']
    assert len(cases)==2 and len(j['p'])==2
    for c,brief in zip(cases,p['applicationCaseBriefs']):
        assert c['id']==brief['id']
        for lang in ['De','En']:
            assert c['task'+lang]==brief['taskDemand'+lang]
            assert c['workedSolution'+lang]==brief['expectedPerformance'+lang]
        assert c['syntheticData'] is True and c['actualExperimentPerformed'] is False
        assert sum(x['points'] for x in c['rubric']['criteria'])==c['rubric']['totalPoints']==10
    assert p['coverageExpectations']['minimumIndependentDemonstrations']==2
    assert p['coverageExpectations']['freshVariationRequired'] is True
    assert p['coverageExpectations']['independentTransferRequired'] is True
    assert set(p['coverageExpectations']['requiredExpectationIds'])=={x['id'] for x in p['expectations']}
    base={'schemaVersion':1,'reviewId':NS,'landscapeId':'08a43a1b-d97e-522c-9dfa-c950a493364e','goalId':gid,'reviewedAt':now,'reviewer':'OpenAI Codex GPT-6 agent /root/biology_neuro_ten_blind_b'}
    aa={**base,'ruleVersion':'semantic-atomicity-v1','fingerprint':semantic_fingerprint(g,'semantic-atomicity-v1'),'status':'atomic','semanticAtomic':True,'reason':j['a']}
    mm={**base,'ruleVersion':'memory-card-review-v1','fingerprint':semantic_fingerprint(g,'memory-card-review-v1'),'status':'no_memory_needed','memoryUseful':False,'reason':j['m']}
    am.append((aa,mm))
    current=next(x for x in inp['goals'] if x['goalId']==gid)
    rows.append({'goalId':gid,'wholeCurrentGoal':g,'normalCurrentBindings':{k:current[k] for k in ['goalFingerprint','pageFingerprint']},
      'D':next(x for x in records if x['goalId']==gid),
      'P':{'decision':'KEEP_science_profile','evidenceProfileRecommendation':'none','currentProfileFingerprint':current['reviewContext']['page']['evidenceReview']['profileFingerprint'],
           'wholeProfileActuallyRead':p,'wholeCasesActuallyRead':cases,
           'individualCaseJudgments':[{'caseId':c['id'],'decision':'KEEP','reason':reason,'freshTransferCheckedDe':c['freshTransferDe'],'freshTransferCheckedEn':c['freshTransferEn'],'freshTransferSolutionCheckedDe':c['freshTransferSolutionDe'],'freshTransferSolutionCheckedEn':c['freshTransferSolutionEn']} for c,reason in zip(cases,j['p'])],
           'claimBounds':'G1/E1 authored material adequacy and prospective observable actions only; no actual learner solution, experiment, mastery, trial or human acceptance.',
           'profileDisposition':'retain; all e1-e3 required, two independent demonstrations with fresh variation and independent transfer. Coverage sufficiency remains a prospective profile contract, not an accomplished learner performance.'},
      'A':aa,'M':mm,
      'V':{'decision':'KEEP','actualViewed':['originalPNG','proportional360','proportional680','nativeHTMLPage','nativePDFPage'],'boundActualImages':image_refs[gid],'reason':j['v'],
           'nativeReceipt':'Read actual complete native HTML and PDF goal pages including full title/description, breadcrumb chapter, linked prerequisites/successors and this image. No clipping, obscured mandatory text, incorrect ID/image pairing or unreadable route found. Captured pages establish local static rendering, not browser interaction, client receipt, learner performance, trial or human approval.'},
      'sourceCourseJudgment':j['s'],'status':'needs_human_review','reviewAuthority':'ai_candidate','humanApproval':False,'humanTrial':False})
for index,name in [(0,'A10.current.independent.jsonl'),(1,'M10.current.independent.jsonl')]:
    (OWN/name).write_text(''.join(json.dumps(x[index],ensure_ascii=False,separators=(',',':'))+'\n' for x in am))

blinding={'agent':'/root/biology_neuro_ten_blind_b','currentIndependentCampaign':campaign['campaignId'],
 'currentAV3OrD10PeerVerdictsRead':False,'rootCurrentReviewVerdictsOrAuthorObservationsRead':False,
 'currentFirstDecisionsSealedBeforePeerComparison':True,
 'historicalDisclosure':{'source':ref(T/'neutral-current343-native-ten-Sehbahn-v3.entry.json'),
 'field':'historicalReportedV2VisualHold','whatWasExposed':'Historical A-v2 visual hold described retinal reception focus at the optic nerve/vessel exit (blindspot), embedded in the explicitly authorized neutral technical entry.',
 'notErased':True,'parentInformed':True,'parentAuthorization':'Root authorized explicit historical disclosure and targeted follow-up of the repaired point. Current A-v3/D10/root review judgments remain unopened.',
 'boundary':'Genuine independence of this current v3 first judgment; no claim of global blindness to all v2 history.'},
 'activeAMHistoricalLedgerRead':'Active historical May atomicity/memory rows and configuration consulted for current fingerprints and scope; their generic reasons were not substituted for the individual independent reasons here.',
 'provider':'OpenAI','model':'Codex GPT-6 agent','exactRuntimeRevision':'not exposed','providerDiversityClaim':False,'independenceBasis':'distinct delegated agent, current input and current judgments formed without current peer verdict access'}
write(OWN/'blinding-and-claim-bounds.json',blinding)
write(OWN/'whole-ten-independent-DPAMV-review.json',{'schemaVersion':1,'reviewId':NS,'createdAt':now,'role':'independent_current_v3_reviewer_b','blinding':blinding,
 'selectedInputs':[ref(A/'neutral-ten-whole-science-rasters-sourcefix.author-checkpoint.entry.json'),ref(A/'FINAL.ten-whole-science-and-rasters.author.freeze.json'),ref(T/'neutral-current343-native-ten-Sehbahn-v3.entry.json'),ref(T/'FINAL.current343-normal-P10-native10-Sehbahn-v3.technical.freeze.json'),ref(T/'native/ten-current-native/bundle/manifest.json'),ref(T/'native/ten-current-native/round-b/description-review-input.json')],
 'wholeScienceInput':ref(A/'science/ten-whole-profiles-and-twenty-cases.author.json'),
 'whole41SourceInput':ref(B/'sources/ten-current41-whole-direct-source-witnesses.neutral.json'),
 'scopeCounts':{'goals':10,'wholeBilingualCases':20,'originalRasters':10,'proportional360':10,'proportional680':10,'actualNativeHtmlPages':10,'actualNativePdfPages':10,'directSourceWitnesses':41,'HEAuthoredPrecisionDeltas':6},
 'rows':rows,'result':{'D_keep':10,'P_keep':10,'A_atomic':10,'M_no_memory_needed':10,'V_KEEP':10,'SOURCE':'HOLD until a truthful primary/mapping successor is bound and reviewed','approved':0,'activeGain':0},
 'authorizationBounds':'Curriculum M7 Chem/Bio local review only. Current Bio343/394, all protected343, Math807 and Phys478 untouched. No operative author/source fixes, historical restarts, Git/GH writes, client acceptance, human approval, learner performance or human trial.'})
print(json.dumps({'written':NS,'D':len(records),'P_cases':sum(len(r['P']['wholeCasesActuallyRead']) for r in rows),'SOURCE':'HOLD','approved':0,'activeGain':0}))
