"""Serialize this reviewer's individually authored judgments into existing contracts.

No science verdict is inferred from fingerprints or from the native CLI.
The text below records the actual independent reading of all 21 bilingual goals,
42 textual materials, final HTML/PDF pages and bounded primary operators.
"""
from pathlib import Path
import copy
import datetime
import hashlib
import json

BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-neuro-twenty-one-current-continuation-author-v3/stage-02-current-twenty-one-native')
OWN = Path(__file__).resolve().parent.relative_to(Path.cwd())
RAW = json.loads((BASE / 'final-current21-whole-native-source-context-material-review-inputs.author.raw.json').read_text())
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()
REVIEWER = 'Independent reviewer /root/biology_q1_v7_sources_independent_a_followup; GPT-6/Codex; exact serving variant not exposed'

# Six new bilingual D fields and individual P/answer judgments, in exact raw order.
REVIEWS = [
('Dendriten und Zellkörper unterstützen die Aufnahme, das Axon die Weiterleitung und Endigungen die Weitergabe im gegebenen Nervenzellmodell.',
 'Dendrites and the cell body support reception, the axon conduction and terminals transmission in the supplied neuron model.',
 'Die lernende Person stellt die wesentlichen Strukturen dar und begründet deren Funktion entlang einer Signalroute zwischen zwei Zellen.',
 'The learner represents the main structures and explains their functions along a signal route between two cells.',
 'Bei intaktem Axon und getrennten Endigungen erklärt die lernende Person, weshalb eine Axonmessung keine Weitergabe an die nächste Zelle beweist.',
 'With an intact axon and disconnected terminals, the learner explains why an axonal recording does not prove transmission to the next cell.',
 'Struktur-Funktions-Zusammenhang entsprechend BY13 und HE-GK1; die separate AP-Ionenentstehung bleibt bei 04d. Die aktuelle Seite zeigt genau diesen begrenzten Zusammenhang.',
 'Das verbal beschriebene Grundmodell gibt Fortsätze und Legende an; die Antwort verbindet Aufnahme, Axonleitung und Weitergabe, ohne universelle Richtung für alle Neuronentypen.',
 'Intaktes Axon bei getrennter Folgezellverbindung erlaubt die begründete Unterscheidung von Leitung und Übertragung.'),
('In der erregenden ACh-Synapse koppelt präsynaptische spannungsabhängige Ca2+-Öffnung die Freisetzung an postsynaptische ligandengesteuerte Rezeptorkanäle; ein folgendes AP verlangt seine eigene Schwelle.',
 'In an excitatory ACh synapse, presynaptic voltage-gated Ca2+ entry links release to postsynaptic ligand-gated receptor channels; a following AP requires its own threshold.',
 'Die lernende Person erklärt die Übertragungsfolge, unterscheidet Transmitterbindung von Spannungssteuerung und begründet, wann ein nachgeschaltetes AP ausbleibt.',
 'The learner explains the transmission sequence, distinguishes ligand binding from voltage gating and explains when a downstream AP is absent.',
 'An einer neuen Signalreihenfolge mit unterschwelliger postsynaptischer Antwort trennt die lernende Person erfolgreiche chemische Übertragung von nachgeschalteter AP-Auslösung.',
 'In a fresh signal sequence with a subthreshold postsynaptic response, the learner separates successful chemical transmission from downstream AP generation.',
 'Die aktuelle DE/EN-Fassung erfüllt die begrenzte HE-GK2/BY-Komponente ohne elektrische Synapsen hinzuzufügen. ACh ist ausdrücklich an einen erregenden nicotinischen Rezeptorkontext gebunden.',
 'Ca2+-Einstrom, Vesikelfreisetzung, ACh-Bindung und Kationenstrom sind funktional richtig getrennt; ein einzelnes Vesikel garantiert kein AP.',
 'Die verbal vollständig angegebene Signalforderung und unterschwellige Antwort erlauben die neue Kanalzuordnung und die Erklärung eines fehlenden Folge-AP.'),
('Anhaltend geänderte wirksame Verbindungen können bei denselben Eingängen eine andere Ausgabe eines gegebenen Netzes erzeugen; wirksame Gewichte sind kein Nachweis neuer Kontaktstellen.',
 'Persistently changed effective connections can produce different output for identical inputs in a supplied network; effective weights do not establish new contact sites.',
 'Die lernende Person vergleicht vorgegebene Vorher-nachher-Zustände bei konstantem Input und erklärt das veränderte Schwellenverhalten.',
 'The learner compares supplied before-and-after states at fixed input and explains the changed threshold behaviour.',
 'Bei unveränderter starker Erregung und stärkerer Hemmung begründet die lernende Person den ausbleibenden Ausgang und nennt den zusätzlichen Belegbedarf für eine Strukturänderung.',
 'With unchanged strong excitation and stronger inhibition, the learner explains absent output and identifies the extra evidence needed for a structural change.',
 'Explizite LK-Modellspezialisierung der zellulären Plastizität: Vergleich vorgegebener Verbindungen statt Hebb-Update, momentaner Integration oder allgemeinem zellulärem Nachweis. Der Titel, beide Texte und Kontext bleiben konsistent.',
 'Bei (1,0) sind die Werte -64/-54 mV, bei (0,1) -60/-60 und bei (1,1) -54/-44; nur A allein wechselt den Ausgang. Ursache und reale Erinnerung werden nicht behauptet.',
 'P=-55 erreicht die gegebene Schwelle, Q=-60 nicht. Die Gewichtsänderung ist funktionell; eine neue Kontaktstelle verlangt zusätzliche Strukturbeobachtung.'),
('Ein Rezeptorpotenzial ist eine abgestufte reizabhängige Antwort; primäre Sinneszellen leiten über eine eigene Nervenfaser, sekundäre übertragen an ein nachgeschaltetes Neuron.',
 'A receptor potential is a graded stimulus-dependent response; primary sensory cells conduct through their own nerve fibre, while secondary cells transmit to a downstream neuron.',
 'Die lernende Person beschreibt die vorgegebenen Zelltypen und ordnet abgestufte Rezeptorpotenziale sowie mögliche AP-Weiterleitung funktional zu.',
 'The learner describes the supplied cell types and functionally locates graded receptor potentials and possible AP conduction.',
 'An einem hyperpolarisierenden Sinneszellmodell erklärt die lernende Person, weshalb ein Rezeptorsignal nicht immer eine positive Spannungsänderung sein muss.',
 'In a hyperpolarizing sensory-cell model, the learner explains why a receptor signal need not always be a positive voltage change.',
 'HE-LK-Rezeptorpotenzial und primär/sekundär bilden einen zusammenhängenden Organisationsvergleich. Der sensorische Teilchen-/Anwendungsoperator bleibt separat bei 8b, keine Vollfreigabe von Augenphysiologie.',
 'Eigenes Axon bei A und Transmitterübertragung an separate Nervenzelle bei B erlauben die begründete Zuordnung; abgestufte Signale werden nicht als AP bezeichnet.',
 'Die tatsächlich verbal angegebene Hyperpolarisation ist reizabhängig; Vorzeichen allein bestimmt nicht die Rezeptorfunktion.'),
('Neuronale Aktivierung und hormoneller Transport können einen gemeinsamen Steuerweg bilden; nur geeignete Rezeptorzellen antworten auf das gegebene Hormon.',
 'Neural activation and hormonal transport can form a joint control pathway; only suitable receptor-bearing cells respond to the supplied hormone.',
 'Die lernende Person erläutert einen Weg vom neuronalen Signal über eine Drüse zu passenden Zielorganen und trennt Signalweg und Zielantwort.',
 'The learner explains a pathway from a neural signal through a gland to suitable target organs and separates the signalling route from target response.',
 'Beim selektiven Rezeptorblock eines Zielorgans erklärt die lernende Person dessen veränderte Antwort bei unveränderten vorgelagerten Signalen.',
 'When one target organ receptor is selectively blocked, the learner explains its changed response despite unchanged upstream signals.',
 'Die gemeinsame Erklärung entspricht der HE-LK-Verschränkung; sie bleibt ein gekoppelter Steuerzusammenhang und keine zusätzliche allgemeine Hormonprüfung. Die aktuelle Seite verweist auf c05 als externe Voraussetzung.',
 'Der beschriebene neuronale Drüsenweg und rezeptorabhängige Zielwirkung erlauben den Struktur-Funktions-Zusammenhang; kein individueller Gesundheitsbefund.',
 'Nur das ausgewählte Zielorgan kann seine Antwort verlieren; gleiche Hormonsignale belegen weder dessen Wirkung noch einen Ganzsystemblock.'),
('Erregende und hemmende Beiträge sowie ihr zeitlicher Abstand beeinflussen gemeinsam, ob eine gegebene postsynaptische Spannung eine AP-Schwelle erreicht.',
 'Excitatory and inhibitory contributions and their timing jointly affect whether a supplied postsynaptic voltage reaches an AP threshold.',
 'Die lernende Person deutet räumliche und zeitliche Verrechnung an gegebenen Potenzialverläufen und begründet die Auswirkung auf AP-Auslösung.',
 'The learner interprets spatial and temporal integration in supplied potential traces and explains the effect on AP generation.',
 'Bei überlappenden gegenüber getrennt abklingenden EPSP und einem zusätzlichen IPSP erklärt die lernende Person die Timingwirkung und begrenzt eine endgültige Schwellenentscheidung auf die verfügbaren Angaben.',
 'For overlapping versus separately decaying EPSPs and an added IPSP, the learner explains timing effects and limits a final threshold decision to the available information.',
 'HE-LK4 ist explizit räumlich/zeitlich; die aktuelle Fassung erhält beides. Der momentane Verrechnungsoperator wird von anhaltender Plastizität getrennt; die Modellrechnung ist nicht universelle Leitwertphysik.',
 '-70+8+10-5=-57 mV, ohne Hemmung -52 mV; die Schwelle -55 trennt beide Fälle korrekt.',
 'Die Textbeschreibung gibt kurze Überlappung und langes Abklingen tatsächlich an. Die qualitative IPSP-Folge ist begründet; ohne dessen konkrete gemeinsame Größe wird kein Endwert erfunden.'),
('Funktionelle Änderungen der Übertragungsstärke und strukturelle Änderungen von Kontaktstellen sind unterschiedliche zelluläre Plastizitätsbefunde.',
 'Functional changes of transmission strength and structural changes of contact sites are different cellular plasticity findings.',
 'Die lernende Person erklärt anhand gegebener Vorher-nachher-Befunde, auf welcher zellulären Ebene sich die untersuchte Verbindung verändert.',
 'The learner uses supplied before-and-after findings to explain the cellular level at which a studied connection changes.',
 'Bei zusätzlichen Kontakten ohne geänderte Einzelstärke unterscheidet die lernende Person den Strukturhinweis von einer bloßen Antwortverstärkung derselben Verbindung.',
 'With additional contacts but unchanged individual strength, the learner distinguishes structural evidence from a mere response increase at the same connection.',
 'HE-LK5 bleibt allgemeiner zellulärer Befund, während a46/4f/c9 eigene begrenzte Modelle bearbeiten. 347 hat eine neue Provenienzbindung, nicht einen neuen Fachtext oder ein neues wissenschaftliches Profil.',
 'Gleicher schwacher Testreiz, Antwort 2→5 und später 5 stützen eine anhaltende funktionelle Änderung, nicht neue Kontakte oder eine konkrete Erinnerung.',
 'Zusätzliche im Text vorgegebene Kontaktstellen bei gleicher Einzelstärke liefern einen anderen Strukturhinweis; keine tatsächliche Mikroskopie wird behauptet.'),
('Eine vorgegebene Störung neuronaler Verbindungen oder Übertragung kann die Funktion des Modellnetzes verändern; ein Prinzipmodell ersetzt keine klinische Diagnose.',
 'A supplied disturbance of neural connections or transmission can change model network function; a principle model does not replace clinical diagnosis.',
 'Die lernende Person erklärt den materialgebundenen Zusammenhang zwischen einer neuronalen Störung und der vorgegebenen Funktionsänderung.',
 'The learner explains the material-bound relation between a neural disturbance and the supplied functional change.',
 'Beim Vergleich von Strukturverlust und vorübergehend veränderter Transmitterwirkung erklärt die lernende Person, weshalb ähnliche Funktionsprobleme keine identische Ursache oder Erkrankung beweisen.',
 'When comparing structural loss with temporarily altered transmitter action, the learner explains why similar impairments establish neither an identical cause nor an identical disorder.',
 'Der frühere zu weite Krankheitsanspruch ist in beiden Sprachen ausdrücklich auf ein gegebenes Modell begrenzt und passt zum HE-LK-Prinzipbeispiel. Depression und MS/Parkinson bleiben getrennte Originalpflichten.',
 'Der vorgegebene Verbindungsverlust erklärt die schwächere Verarbeitung im Modell; Alltagssymptom wird nicht zur Alzheimerdiagnose.',
 'Strukturverlust und reversible Übertragungsänderung sind nicht gleichgesetzt; symptomatische Ähnlichkeit liefert keinen Erkrankungsbeweis.'),
('Ein Hirnbildgebungsverfahren misst eine methodenspezifische strukturelle oder indirekte funktionelle Größe; ein BOLD-Vergleich ist keine unmittelbare elektrische Neuronenmessung.',
 'A brain-imaging method measures a method-specific structural or indirect functional quantity; a BOLD comparison is not a direct electrical neuronal recording.',
 'Die lernende Person beschreibt das gegebene bildgebende Prinzip und erläutert die Aussage eines bedingungsbezogenen Vergleichs mit Grenzen.',
 'The learner describes the supplied imaging principle and explains a condition-related comparison with its limits.',
 'Bei strukturellem MRT gegenüber funktioneller Vergleichskarte ordnet die lernende Person anatomische und funktionelle Fragen zu, ohne Gedankeninhalt oder Diagnose abzuleiten.',
 'For structural MRI versus a functional comparison map, the learner assigns anatomical and functional questions without inferring thought content or diagnosis.',
 'HE-LK7 verlangt ein Prinzip eines Bildgebungsverfahrens. Der aktuelle direkte Witness ist HE, nicht die sachfremde BY-ENG/EKG-Pflicht; BOLD wird nicht als deren Vollbeleg ausgegeben.',
 'Die verbal beschriebene indirekte BOLD-/Blutversorgungsbeziehung und Kontrollbedingung erlauben eine begrenzte Prinzipantwort, keine Einzelgedankenmessung.',
 'Textlich gegebene Struktur-/Funktionsdarstellungen stützen unterschiedliche Fragen. Es liegt hier kein tatsächlich betrachteter MRT-Rasterdatensatz oder diagnostischer Nachweis vor.'),
('Eine Potenzialmessung braucht definierte Mess- und Referenzorte, kontrollierte Reizbedingungen und einen Zeitverlauf; ein Vorzeichen hängt auch von der Polung ab.',
 'Potential recording requires defined recording and reference sites, controlled stimulation and a time course; measured sign also depends on polarity.',
 'Die lernende Person plant eine begrenzte Modellmessung einschließlich Bezug und Kontrolle und wertet einen neuen Spannungsverlauf aus.',
 'The learner plans a bounded model recording including reference and control and interprets a fresh voltage trace.',
 'Bei vertauschten Elektroden erklärt die lernende Person eine Vorzeichenänderung als Messbedingung statt als neue Zellfunktion.',
 'With reversed electrodes, the learner explains a sign change as a recording condition rather than a new cellular function.',
 'Titel und DE/EN beanspruchen Planung und Auswertung entsprechend HE-GK3; keine praktische Laborleistung. Die sichtbare Seite enthält beide Operatoren und ordnet ce19 als Voraussetzung zu.',
 'Ein Plan soll Referenz, Ruhekontrolle, Reiz und Zeitaufnahme explizit begründen; die Fallbeschreibung ist ein generisches textliches Modellangebot, keine tatsächlich mitgelieferte Gerätegrafik.',
 'Die konkret angegebenen -70→+30→Ausgangswerte passen zur AP-Auswertung; Polungsumkehr verändert die Aufzeichnung, nicht das Neuron.'),
('Anhaltende synaptische Verstärkung oder Abschwächung bei gleichen Tests und geeigneter Kontrolle kann LTP beziehungsweise LTD stützen; kurzfristige Erholung oder geänderter Testreiz genügt nicht.',
 'Persistent synaptic strengthening or weakening under unchanged tests and suitable control can support LTP or LTD; transient recovery or changed test stimulation does not suffice.',
 'Die lernende Person klassifiziert gegebene Zeitreihen mit ihren Testbedingungen und erläutert deren begrenzte Bedeutung für zelluläres Lernen.',
 'The learner classifies supplied time courses with their test conditions and explains their bounded relevance to cellular learning.',
 'An neuen Abschwächungs-, Erholungs- und stärkerem-Testreiz-Fällen unterscheidet die lernende Person Daueränderung von Vergleichsfehler und begrenzt Aussagen zu Erinnerung und unbeobachteter Zeit.',
 'In fresh weakening, recovery and stronger-test cases, the learner distinguishes persistent change from comparison confounding and limits claims about memory and unobserved time.',
 'LK-Modellspezialisierung unter zellulärem Lernen, ausdrücklich vorgegebene Befunde statt echte Experimente. Beide Sprachen enthalten Modellbedeutung und Befundgrenzen; Hebb-Update und Netzvergleich bleiben separat.',
 'T=160/155/160 Prozent seines Basiswerts, Kontrolle ungefähr 100 Prozent über 60 Minuten; passt zu anhaltender Potenzierung, keine Signifikanz- oder molekulare Ursachenaussage.',
 'D bleibt ungefähr 50 Prozent, R kehrt auf 100 Prozent zurück, S ändert die Teststärke. LTD, kurzfristige Änderung und unvergleichbarer LTP-Test werden korrekt getrennt.'),
('Eine gegebene Hebb-Regel verändert Modellgewichte bei gemeinsamer Eingangs-/Ausgangsaktivität; eine zusätzlich gegebene Obergrenze ist eine eigene Modellannahme.',
 'A supplied Hebbian rule changes model weights under co-occurring input and output activity; an added upper bound is a separate modelling assumption.',
 'Die lernende Person wendet die vorgegebene Regel auf vollständig gegebene Aktivitäten an und erklärt die resultierenden Verbindungsänderungen.',
 'The learner applies the supplied rule to fully supplied activities and explains the resulting connection changes.',
 'Beim Vergleich unbeschränkter und ausdrücklich begrenzter Updates erklärt die lernende Person unterschiedliche Vorhersagen und die Grenze unbegrenzten Modellwachstums.',
 'When comparing unbounded with explicitly bounded updates, the learner explains different predictions and the limitation of unbounded model growth.',
 'Eigenständige bewertbare LK-Modellroutine, kein amtlich verpflichtender Name und kein Gedächtnisnachweis. Aktivitäten sind gegeben; die Beschreibung fordert keine unbegründete Ausgabevorhersage.',
 'Die drei Runden liefern (0,4;0,2), (0,4;0,2), (0,5;0,3). Bei y=0 bleibt B trotz xB=1 unverändert.',
 'U liefert A=1,0 dann 1,2; K zweimal 1,0, B jeweils 0,2. Die Grenze 1 ist zusätzliche Modellannahme, kein universeller biologischer Wert.'),
('Erregende und hemmende Verbindungen können postsynaptische Ausgaben in einer gegebenen Verschaltung regulieren; eine Pfeilzeichnung allein erklärt die Schwellenentscheidung nicht.',
 'Excitatory and inhibitory connections can regulate postsynaptic output in a supplied circuit; arrows alone do not explain the threshold decision.',
 'Die lernende Person vergleicht gegebene postsynaptische Potenzialänderungen und leitet den geregelten Beitrag beider Synapsenwirkungen ab.',
 'The learner compares supplied postsynaptic potential changes and infers the regulated contribution of both synaptic effects.',
 'Bei gleichem erregendem Eingang auf zwei Ziele und zusätzlicher selektiver Hemmung erklärt die lernende Person verschiedene Ausgaben ohne plastische Gewichtsänderung.',
 'For a common excitatory input to two targets and selective added inhibition, the learner explains different outputs without plastic weight changes.',
 'Aktuelle DE/EN-Fassung enthält den BY-EA-Vergleich und die Ableitung einer geregelten Übertragung, nicht nur Topologienamen. Der Kontext hält e111 als Voraussetzung und a46 als andere Veränderungsroutine getrennt.',
 'Die Vergleichswerte -62/-53/-58 mV trennen den einzigen Schwellenfall. Die Notwendigkeit beider Wirkungstypen ist auf diese regulierbare Verschaltung beschränkt.',
 'Beide Ziele zunächst -54 mV; später Z1=-54, Z2=-60 durch H. Das erklärt selektive Ausgabe bei gleicher E-Quelle, nicht Lernen.'),
('Ein Wiederaufnahmehemmer verändert im gegebenen Serotoninmodell den Rücktransport vorhandenen Transmitters; diese lokale Wirkung ist nur ein Teil eines multifaktoriellen Depressionsmodells.',
 'A reuptake inhibitor changes uptake of existing transmitter in the supplied serotonin model; this local effect is only part of a multifactorial depression model.',
 'Die lernende Person erklärt Transporterwirkung und lokale Verfügbarkeit und grenzt sie von Rezeptorblockade und vollständiger Krankheitsursache ab.',
 'The learner explains transporter action and local availability and distinguishes it from receptor blockade and complete disease causation.',
 'Bei gleichem synaptischem Modell und verschiedenen psychischen/sozialen Bedingungen begründet die lernende Person, weshalb gleiche Symptome oder Behandlungserfolge nicht folgen.',
 'For the same synaptic model under different psychological/social conditions, the learner explains why identical symptoms or treatment outcomes do not follow.',
 'Die BY-Depressionspflicht ist ausdrücklich nur in ihrer synaptischen Komponente gebunden. Keine HE-ACh-Hormonpflicht, keine Symptome-/Stigma-/Therapie-Gesamtfreigabe und keine Gleichsetzung Serotoninmangel=Depression.',
 '10-8-1=1 gegenüber 10-3-1=6; vorhandenes Serotonin wird langsamer entfernt. Ein Testschritt ist weder Akkumulationsgesetz noch Behandlungsempfehlung.',
 'W verändert den Transporter bei intakten Rezeptoren; gleiche lokale Änderung genügt im multifaktoriellen Modell nicht für gleiche Symptome oder Erfolg.'),
('Ein gezielter Stoffangriff an der erregenden ACh-Synapse betrifft einen definierten Übertragungsschritt; Rezeptorblock und ACh-Abbauhemmung wirken verschieden.',
 'A selective substance action at an excitatory ACh synapse affects a defined transmission step; receptor blockade differs from inhibited ACh breakdown.',
 'Die lernende Person leitet die lokale Informationsänderung aus dem vorgegebenen Wirkort ab und erläutert die entsprechende neuromuskuläre Übertragung.',
 'The learner derives local changes of information transfer from the supplied site of action and explains the corresponding neuromuscular transmission.',
 'Bei partieller ACh-Esterasehemmung gegenüber Rezeptorblock erklärt die lernende Person mögliche verlängerte Endplattenwirkung, ohne größere APs oder sichere Kontraktionssteigerung zu folgern.',
 'For partial ACh esterase inhibition versus receptor blockade, the learner explains possible prolonged endplate effects without inferring larger APs or guaranteed stronger contraction.',
 'Der aktuelle Stoffoperator nennt ACh in beiden Sprachen und ausdrücklich NMJ, passend zur bounded HE-GK2/BY-Komponente. Mechanismus und lokale Übertragung gehören zu einer zusammenhängenden Routine.',
 'X verhindert Kanalöffnung trotz unveränderter Freisetzung; der ACh-bedingte Endplattenweg kann im gegebenen Modell kein Muskel-AP erzeugen.',
 'Y verlängert möglichen ACh-Effekt am intakten Rezeptor; keine Rückaufnahme von intaktem ACh, kein universelles stärkeres Muskelansprechen oder klinischer Dosisschluss.'),
('Im gegebenen Sinneszellmodell koppelt reizabhängige Ionenkanalöffnung die Teilchenbewegung an Rezeptorpotenzial und nachgeschaltetes AP-Muster; Frequenz und Dauer sind verschiedene Signalinformationen.',
 'In the supplied sensory-cell model, stimulus-dependent ion-channel opening links particle movement to receptor potential and downstream AP pattern; frequency and duration carry different information.',
 'Die lernende Person erklärt die gesamte gekoppelte Reizantwort und wendet sie auf einen konkret gegebenen Sinnesfall zur Stärke-/Dauerdeutung an.',
 'The learner explains the entire coupled stimulus response and applies it to a supplied sensory case to interpret intensity and duration.',
 'Bei gleich starker, verschieden langer Druckeinwirkung und selektiver Transduktionsblockade erklärt die lernende Person Zugdauer und ausbleibende reizabhängige Signale, ohne universelle Adaptationsannahme.',
 'For equally strong pressure of differing duration and selective transduction blockade, the learner explains train duration and absent stimulus-dependent signals without assuming universal non-adaptation.',
 'BY-EA-Teilchen- und Anwendungsoperator ist jetzt explizit. Abgrenzung zu 787 Zelltypen und 04d Axonkanälen ist fachlich sinnvoll; Augen-/Retinal-/Nachbild-Gesamtpflicht bleibt offen.',
 'Mechanische Kanalöffnung→Kationeneinstrom→abgestuftes Rezeptorpotenzial→5/15 AP pro Sekunde bei gleichen 2 Sekunden erklärt die Stärke; AP-Höhe bleibt gleich.',
 '15/s über 1 oder 4 Sekunden trennt Dauer bei gleicher Stärke; vollständiger Kanalblock verhindert nur die modellierte reizabhängige Kette. Spontanaktivität und Adaptation werden nicht erfunden.'),
('Dynamische Lipiddoppelschicht und selektive Membranproteine ermöglichen unterschiedliche Transportwege zwischen Kompartimenten; aktiver Transport verlangt Energie.',
 'A dynamic lipid bilayer and selective membrane proteins allow different transport pathways between compartments; active transport requires energy.',
 'Die lernende Person beschreibt das Flüssig-Mosaik-Modell und erklärt anhand gegebener Bedingungen passive und energiegekoppelte Transportwege.',
 'The learner describes the fluid mosaic model and uses supplied conditions to explain passive and energy-coupled transport pathways.',
 'Beim selektiven Kanalverschluss erklärt die lernende Person, weshalb andere Pumpen- und Lipidwege weiterhin möglich bleiben.',
 'For selective channel closure, the learner explains why other pump and lipid pathways can remain possible.',
 'BY13 allgemeiner Membran-Struktur-/Transportzusammenhang bleibt gekoppelt und bilingual gleich; keine neue Proteinbiochemie. Die aktuelle Seitenbindung zeigt e3 als Nachfolger.',
 'A ist im ausdrücklich angegebenen Modell passiver selektiver Weg, B ATP-gekoppelter Transport gegen das Gefälle; keine pauschale Durchlässigkeit oder starre Membran.',
 'A-Route geschlossen bei weitergegebenem B-Pumpbetrieb und passierendem C; selektiver Eingriff ist kein vollständiger Transportstopp.'),
('Ionenverteilung und selektive Permeabilität erzeugen gemeinsam eine Membranspannung; Pumpen erhalten die Gradienten über die Zeit, nicht allein den momentanen Potenzialmechanismus.',
 'Ion distribution and selective permeability jointly produce membrane voltage; pumps maintain gradients over time rather than constituting the entire immediate potential mechanism.',
 'Die lernende Person erklärt aus gegebenen Ionen-/Permeabilitätsangaben die Ladungsverhältnisse am Membranbereich und begründet Energiebedarf zur Gradientenpflege.',
 'The learner uses supplied ionic/permeability information to explain charge relations near the membrane and justify energy for maintaining gradients.',
 'Bei gestopptem ATP-Pumpbetrieb und zunächst vorhandenen Gradienten erklärt die lernende Person fortbestehende Anfangsspannung und spätere Veränderung statt sofortiger Nullsetzung.',
 'With ATP-driven pumping stopped but initially retained gradients, the learner explains initial persistent voltage and later change rather than an instantaneous zero.',
 'Der aktuelle Messdaten-/Energieoperator entspricht BY13 sowie HE-Ruhepotenzial. Genaue Voltzahl wird ohne vollständige Parameter nicht verlangt; keine große Nettoladung im gesamten Zellvolumen.',
 'Hohe Innen-Konzentration und überwiegende K-Permeabilität erklären Ausstrom und elektrische Gegenwirkung; die negative Membranseite ist nicht gleich negativem gesamten Zellinhalt.',
 'Schon vorhandene Gradienten bleiben zunächst wirksam. Die qualitative Zeitfolge begründet Energieerhalt ohne Pumpengleichsetzung mit gesamter Spannung.'),
('Im gegebenen Axonmodell erzeugen schwellenabhängige und zeitlich geänderte Na-/K-Leitfähigkeiten den AP-Verlauf; Reizstärke kann in einem Impulsmuster statt der Einzelhöhe codiert sein.',
 'In the supplied axon model, threshold-dependent and time-varying Na/K conductances generate the AP trace; stimulus intensity can be coded in an impulse pattern rather than individual height.',
 'Die lernende Person erklärt axonale Potenzialänderungen durch die gegebenen Ionenbewegungen und deutet die Information im zugehörigen Impulsmuster.',
 'The learner explains axonal voltage changes through supplied ion movements and interprets information in the associated impulse pattern.',
 'Bei gleicher AP-Höhe, höherer Frequenz und begrenzenden Refraktärabständen erklärt die lernende Person einen stärkeren Dauerreiz ohne unbegrenzte Frequenz oder AP-Amplitude zu behaupten.',
 'For equal AP height, higher frequency and limiting refractory intervals, the learner explains a stronger sustained stimulus without claiming unlimited frequency or AP amplitude.',
 'BY13 und HE-AP-Komponente bleiben axonal; Transduktion in 8b ist kein Ersatz. Teilchenmechanik und Codierung bilden im gegebenen Signalmodell einen begründeten Zusammenhang.',
 'Na-Einstrom trägt den Anstieg; zeitlich veränderte Na-/K-Leitfähigkeit den Rückgang. Pumpen werden nicht als rascher Repolarisationsmechanismus behauptet.',
 'Der tatsächlich verbal beschriebene Vergleich gleicher Höhen und verschiedener Frequenzen erlaubt die Codierungsantwort; Refraktärzeit begrenzt Abstände.'),
('Kontinuierliche und saltatorische Leitung kombinieren passive Stromausbreitung mit erneuerter AP-Bildung verschieden; Myelinisierung und Durchmesser beeinflussen Leistung.',
 'Continuous and saltatory conduction combine passive current spread with regenerated APs differently; myelination and diameter affect performance.',
 'Die lernende Person vergleicht gegebene Nervenfasern und Laufzeiten und erklärt ihren Unterschied durch das bereitgestellte Leitungsmodell.',
 'The learner compares supplied nerve fibres and travel times and explains their difference using the supplied conduction model.',
 'Bei gleichzeitiger Änderung von Durchmesser und Myelin begründet die lernende Person, warum die Tiergruppe allein keine sichere Geschwindigkeitsreihenfolge liefert.',
 'When both diameter and myelin differ, the learner explains why animal group alone does not determine a reliable speed ranking.',
 'Die aktuelle Beschreibung erhält den BY13-Faser-/Tiervergleich ohne universelle Wirbeltiergeschwindigkeitsregel. Energie-Kosten/Nutzen bleibt eine separate breitere Originalquellenpflicht, nicht durch diese zwei Fälle vollständig geschlossen.',
 '1m/(10m/s)=0,1s und 1m/(50m/s)=0,02s; Modellleitung erklärt die Differenz, kein ganzes Teilchen springt zwischen Knoten.',
 'Dicke unmyelinisierte gegenüber dünner myelinisierter Faser verändert mehrere Faktoren; die angegebenen Taxa sind kein ausreichend kontrollierter Geschwindigkeitsbeleg.'),
('Negative hormonelle Rückkopplung wirkt einer Konzentrationsänderung entgegen; ein anhaltender Stressantrieb kann über Glucosebereitstellung zusätzlich einen zweiten Regelkreis beeinflussen.',
 'Negative hormonal feedback counteracts a concentration change; sustained stress drive can additionally affect a second control loop through glucose availability.',
 'Die lernende Person erklärt die gegebene Hormonregulation und begründet einen chronischen Stresseingriff in den ausdrücklich angegebenen verbundenen Regelkreis.',
 'The learner explains the supplied hormone regulation and justifies a chronic-stress influence on the explicitly supplied connected control loop.',
 'Bei fortbestehendem gegenüber entfallendem Stressantrieb erklärt die lernende Person die Cortisol-/Glucose-/Insulin-Rückwirkungen und begrenzt langfristige Konzentrations- und Krankheitsaussagen.',
 'For continuing versus removed stress drive, the learner explains cortisol/glucose/insulin feedback effects and limits claims about long-term concentrations and disease.',
 'Die plurale aktuelle Regelkreisfassung ist mit der BY-EA13-Pflicht eines weiteren Kreises und dem tatsächlichen Zwei-Kreis-Material konsistent. Planung eigener Studien oder Diagnose wird nicht verlangt.',
 'Cortisol hemmt die vorgeordneten Signale; negative Rückkopplung bedeutet entgegenwirkende Regulation statt negativer Konzentration.',
 'Der zweite Kreis ist jetzt vollständig gegeben: Glucose↑→Insulin↑→Aufnahme↑→Glucose↓→Insulin↓. Cortisol liefert den zusätzlichen Antrieb, keine Resistenz- oder Langzeitdiagnose.')
]

def digest(data):
    return 'sha256:' + hashlib.sha256(data).hexdigest()

def save(name, value):
    p = OWN / name
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

assert len(REVIEWS) == len(RAW['wholeCurrent21CandidateNativeRows']) == 21
manual = []
cases = []
for g, words in zip(RAW['wholeCurrent21CandidateNativeRows'], REVIEWS):
    evidence = dict(zip(['essentialUnderstandingDe', 'essentialUnderstandingEn', 'observablePerformanceDe', 'observablePerformanceEn', 'transferExpectationDe', 'transferExpectationEn'], words[:6]))
    manual.append({'goalId': g['goalId'], 'Ddecision': 'KEEP', 'Pdecision': 'KEEP', 'understandingEvidence': evidence, 'descriptionAndSourceScopeReasonDe': words[6], 'bilingualEquivalent': True, 'sourceClaim': 'only the actual bounded operators and declared LK model role; no whole-original-source or national-view closure', 'nativePagePersonallyViewed': True, 'visualizationMissing': True, 'Vapproval': False})
    for material, reason in zip(g['completeDEENCases'], words[7:]):
        cases.append({'goalId': g['goalId'], 'caseId': material['caseId'], 'wholeMaterialObjectSha256': digest(json.dumps(material, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()), 'verdict': 'KEEP', 'taskAndReferenceDEENPersonallyRead': True, 'bilingualEquivalent': True, 'scientificAndMaterialReasonDe': reason, 'actualExperimentConducted': False, 'actualLearnerEvidence': False, 'fixedTaskQuota': False, 'noUnseenDiagramOrRasterClaim': True})
save('twenty-one.independent-a.substantive-description-positive-judgments.json', {'reviewer': REVIEWER, 'reviewedAt': NOW, 'scope': 'current author-v3 complete bilingual 21 goals and actual native 20+1 pages', 'records': manual, 'Dkeep': 21, 'Pkeep': 21, 'nativeAVGrant': False, 'wholeOriginalSourceClosure': False, 'humanApproval': False, 'humanTrial': False, 'strictNetIncrease': 0})
save('forty-two.independent-a.complete-textual-material-judgments.json', {'reviewer': REVIEWER, 'reviewedAt': NOW, 'cases': cases, 'textualSuppliedModelReadings': True, 'noActualRasterDatasetClaim': True, 'fullExamDataOrLaboratoryAcceptanceClaim': False})

parameters = {'agent': '/root/biology_q1_v7_sources_independent_a_followup', 'role': 'independent current D-A/P-A', 'provider': 'OpenAI', 'model': 'GPT-6/Codex', 'exactServingVariant': 'not exposed', 'temperatureSeedOtherSamplingParameters': 'not exposed', 'authorRoleOnTheseGoalsOrMaterials': False, 'currentPeerBResultsRead': False, 'newSourceAPeerVerdictsRead': False, 'historicalV1FindingsRead': True, 'historicalFindingReadAuthorization': 'Parent expressly authorized targeted reuse and resolution of prior21 A/B-v1 findings; blind flag applies to the new current author-v3 review runs.', 'noClaimOfDifferentServingModels': True, 'actualPDFGoalPagesViewed': 21, 'actualNewGoalImageRasterCount': 0}
save('independence-and-actual-reading.provenance.json', parameters)
for part in ['twenty', 'one']:
    campaign = json.loads((BASE / f'native-d-{part}/round-a/description-review-campaign.json').read_text())
    inp = json.loads((BASE / f'native-d-{part}/round-a/description-review-input.json').read_text())
    batch = campaign['batches'][0]
    batch_path = BASE / f'native-d-{part}/round-a/batches/{batch["batchId"]}.input.jsonl'
    actual_inputs = [json.loads(line)['goal'] for line in batch_path.read_text().splitlines()]
    run_id = f'bio-neuro-current21-independent-a-{part}-20261007-v3'
    out_dir = OWN / f'native-d-{part}/results'
    out_dir.mkdir(parents=True, exist_ok=True)
    records = []
    for goal in actual_inputs:
        note = next(m for m in manual if m['goalId'] == goal['goalId'])
        records.append({'$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json', 'schemaVersion': 1, 'recordId': f'{run_id}:{goal["goalId"]}', 'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'], 'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'], **{key: goal[key] for key in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']}, 'decision': 'keep', 'understandingEvidence': note['understandingEvidence'], 'rationale': note['descriptionAndSourceScopeReasonDe'] + ' Eigene tatsächliche HTML-/PDF-Seitenprüfung, aktueller Quellen-/Kontextbezug und beide vollständigen textlichen DE/EN-Fälle sind getrennt dokumentiert. Keine Zielvisualisierung vorhanden; keine V-/Human- oder Whole-Source-Freigabe.', 'evidenceProfileContract': 'positive-understanding-evidence-v2', 'evidenceProfileRecommendation': 'create', 'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate'})
    out_path = out_dir / f'{batch["batchId"]}.records.jsonl'
    out_path.write_text(''.join(json.dumps(record, ensure_ascii=False, separators=(',', ':')) + '\n' for record in records))
    manifest = json.loads((BASE / f'native-d-{part}/bundle/manifest.json').read_text())
    run = {'$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json', 'schemaVersion': 1, 'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'], 'batchId': batch['batchId'], 'batchInputFingerprint': batch['batchInputFingerprint'], 'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'], 'provider': 'OpenAI', 'model': 'GPT-6/Codex (exact serving variant not exposed)', 'role': 'subject_reviewer', 'promptFamilyId': 'biologie-neuro-current21-native-description-positive-independent-a-v3', 'promptFingerprint': campaign['promptFingerprint'], 'criteriaFingerprint': campaign['criteriaFingerprint'], 'generationParametersFingerprint': digest((OWN / 'independence-and-actual-reading.provenance.json').read_bytes()), 'independenceGroupId': campaign['independenceGroupId'], 'blindToOtherRuns': True, 'goalIds': batch['goalIds'], 'inputArtifacts': [{'role': artifact['role'], 'digest': artifact['digest']} for artifact in manifest['artifacts']] + [{'role': 'description_review_batch_input_jsonl', 'digest': digest(batch_path.read_bytes())}], 'startedAt': '2026-10-07T00:00:00Z', 'completedAt': NOW, 'status': 'completed', 'outputDigest': digest(out_path.read_bytes()), 'toolchainVersion': 'independent-native-D-A-current21-20261007-v3'}
    # The exact first-pass wall-clock start was not exposed; do not invent it.
    # Bound actual input-freeze receipt mtime is the observed start of our own files.
    run['startedAt'] = datetime.datetime.fromtimestamp((OWN / 'author-v3-input-freeze-verification.independent-a.json').stat().st_mtime, datetime.timezone.utc).isoformat()
    save(f'native-d-{part}/results/{batch["batchId"]}.run.json', run)

# Independent P records preserve the actual scientific profile byte values, with
# new truthful reviewer provenance. These are E1/G1 AI candidates, not approved.
p_review_id = 'biologie-neuro-current21-native-positive-independent-a-20261007-v3'
p_records = []
for g, note in zip(RAW['wholeCurrent21CandidateNativeRows'], manual):
    record = copy.deepcopy(g['positiveCandidateRecord'])
    record.update(reviewId=p_review_id, reviewedAt=NOW, reviewer=REVIEWER, status='needs_human_review', reviewAuthority='ai_candidate', reason=note['descriptionAndSourceScopeReasonDe'] + ' Independent P-A read both complete bilingual task/reference materials and checked their exact goal alignment and fresh structural transfer; see own42 per-case judgments. No actual learner evidence or human approval.', reviewRunIds=[], dissent=['Other current independent round, active integration and native A/M decisions remain separate.', 'All21 have no primary goal image, so V and strict M7 remain open.', '189 country-goal source/view preservation holds and whole-original-source duties are not closed by this bounded P review.'])
    p_records.append(record)
p_path = OWN / 'positive-evidence.current21.independent-a.review.jsonl'
p_path.write_text(''.join(json.dumps(record, ensure_ascii=False, separators=(',', ':')) + '\n' for record in p_records))
config = json.loads((BASE / 'positive-evidence.current21.native.config.json').read_text())
config.update(reviewId=p_review_id, reviewPath=str(p_path), reviewRunManifestPaths=[])
config['scope']['label'] = 'Independent P-A current21 actual bilingual material/model content KEEP; no Human Approval, V/strict completion or whole-source closure'
save('positive-evidence.current21.independent-a.config.json', config)
print('Created21 own D KEEP records in native20+1 scopes;21 P AI candidates;42 own per-case judgments.')
