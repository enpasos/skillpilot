"""Secure this reviewer's actual first scientific judgments; no peer inputs."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
OUT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-current426-q2-three-current-context-native-and-P077-technical-20261015-v1'

def pin(path):
    path = Path(path)
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def evidence(de1, en1, de2, en2, de3, en3):
    return dict(zip(['essentialUnderstandingDe', 'essentialUnderstandingEn', 'observablePerformanceDe', 'observablePerformanceEn', 'transferExpectationDe', 'transferExpectationEn'], [de1,en1,de2,en2,de3,en3]))

rows = [
    {
        'goalId': '96d33fb6-ed14-50ab-b5c7-5ce0559d518a',
        'decision': 'revise',
        'evidenceProfileRecommendation': 'revise',
        'rationale': 'Eigenständiger fachlicher Befund nach Sichtung der echten Native-Seite 3: Die Beschreibung stellt Benedict, Tollens und GOD mit „oder“ in eine Methodenreihe, während Reduktionsvermögen und Glucoseidentität verschiedene analytische Aussagen sind. Der direkte Vorgänger 1d2e7b80 deckt den kontrollierten Reduktionsnachweis bereits ab. Als kleinstes Gegenbeispiel kann jemand allein Benedict mit Fructose positiv ausführen und noch keinen glucosespezifischen Nachweis erklären. Die aktuelle Abbildung und der vollständige Ausführungsfall unterscheiden beide Ebenen richtig; diese Lehrmittel ersetzen die Abgrenzung im eigenen Zieltext nicht. Die lokale Präzisierung erhält die vorhandenen Operatoren und schreibt keine Durchführung aller drei Verfahren vor. BW 3.4.4(5)/(6) benennt Reduktionsuntersuchung und GOD gesondert. Es wird weder eine Durchführung behauptet noch die Quellenunion als Freigabe sämtlicher Länder-/Kursprojektionen behandelt.',
        'proposedDescriptionDe': 'Die lernende Person kann ausgewählte Nachweise für reduzierende Kohlenhydrate und für Glucose durchführen, auswerten und ihre unterschiedliche Aussagekraft anhand von Molekülstruktur und Enzymwirkung erklären.',
        'proposedDescriptionEn': 'The learner can perform and evaluate selected assays for reducing carbohydrates and for glucose, and explain their differing analytical scope using molecular structure and enzyme action.',
        'understandingEvidence': evidence(
            'Benedict- und Tollens-Nachweise erfassen Reduktionsvermögen unter ihren Reaktionsbedingungen; der GOD-Nachweis nutzt Enzymselektivität für Glucose. Ein positiver Reduktionsnachweis identifiziert Glucose nicht eindeutig.',
            'Benedict and Tollens assays detect reducing behaviour under their reaction conditions; a GOD assay uses enzyme selectivity for glucose. A positive reducing assay does not uniquely identify glucose.',
            'Die lernende Person führt die ausgewählten freigegebenen Nachweise mit gültigen Positiv- und Negativkontrollen aus, protokolliert eigene Befunde und erklärt etwa Benedict-positiv/GOD-negativ über die verschiedenen Reaktionsprinzipien und Nachweisgrenzen.',
            'The learner carries out the selected authorised assays with valid positive and negative controls, records actual observations, and explains a Benedict-positive/GOD-negative result using the different reaction principles and detection limits.',
            'In einem frischen Vergleich von Glucose, Fructose und Saccharose oder einem Hydrolysat trennt die lernende Person Reduktionsbefund, spezifischen Glucosebefund und die Grenzen eines negativen Ergebnisses; Kontrollen und Probenbehandlung werden passend angepasst.',
            'In a fresh comparison involving glucose, fructose, sucrose or a hydrolysate, the learner distinguishes reducing behaviour, glucose-specific findings and the limits of a negative result, adapting controls and sample treatment appropriately.'),
        'actualPageObservation': 'Zwei getrennte Bildhälften: links blaue Cu(II)-Lösung mit Erwärmung und rotem Niederschlag, rechts GOD/POD-Reaktionsfolge und glucosespezifischer Farbumschlag. Der vollständige aktuelle Text und beide externen Voraussetzungen sind sichtbar.',
        'sourceBasis': ['BW original PDF physical page 36 / printed page 34: 3.4.4(5); following source passage 3.4.4(6)', 'Whole three current 96 assay cases including execution-1', 'Whole current direct predecessor 1d2e7b80 and its actual Native page']
    },
    {
        'goalId': 'b47d542d-c2d7-5554-95dc-10b47ab622ab',
        'decision': 'keep',
        'evidenceProfileRecommendation': 'revise',
        'rationale': 'Die aktuelle Beschreibung verbindet die Restklassifikation mit der Erklärung zugehöriger Eigenschaften als eine Struktur-Eigenschafts-Kompetenz. Sie behauptet keine alleinige Kausalität der Seitenkette und kein generelles Unlöslichsein unpolarer Aminosäuren. Die echte Seite 4 zeigt Alanin und Serin bei pH7 mit gemeinsamen NH3+/COO−-Gruppen und unterschiedlichen CH3-/CH2OH-Resten; Tropfensymbole sind keine Messdaten. Der aktuelle ganze Glutaminsäurefall liefert ausdrücklich fiktive qualitative Feststoffbeobachtungen und unterscheidet dominierende Spezies, Gemisch und nicht isolierte Gegenionen-/Gittereffekte. Der pH-Wechsel ändert die Protonierung bei gleichem kovalentem Resttyp. BY C13-GA.4.3 trägt die beiden Operatoren; Elektrophorese bleibt beim gesonderten Nachfolger d1244f5d. Profilrevision empfohlen: die sehr allgemeinen essentialUnderstanding-Felder sollen die tatsächlich in den Fällen vorhandenen Beziehungen zwischen Restfunktionalität, Protonierung und Wasserwechselwirkungen positiv benennen.',
        'understandingEvidence': evidence(
            'Funktionelle Gruppen der Seitenkette bestimmen deren Polarität und Ionisierbarkeit; freie Aminosäuren besitzen zusätzlich die gemeinsame Amino-/Carboxylfunktion. Ladung und Hydratation hängen von pH und Struktur ab, Löslichkeit auch vom Feststoff und den Bedingungen.',
            'Side-chain functional groups determine polarity and ionisability, while free amino acids also share amino and carboxyl functions. Charge and hydration depend on pH and structure; solubility also depends on the solid and experimental conditions.',
            'Die lernende Person ordnet vorgelegte Reste als unpolar, polar oder sauer/basisch ein und erklärt konkrete beobachtbare Unterschiede mit Wasserwechselwirkungen und den tatsächlich vorliegenden Ladungsformen, ohne die Gesamtstruktur auszublenden.',
            'The learner classifies supplied side chains as nonpolar, polar or acidic/basic and explains concrete observable differences through interactions with water and the actual charge states without ignoring the whole molecule.',
            'Für einen frischen pH-Vergleich einer Aminosäure mit zusätzlicher Carboxylgruppe bestimmt die lernende Person mithilfe gegebener pKa-Werte die überwiegenden Formen und erklärt begrenzt die vorgegebenen qualitativen Feststoffbefunde; genaue Sättigungen oder isolierte Ursachen werden daraus nicht erfunden.',
            'For a fresh pH comparison involving an amino acid with an additional carboxyl group, the learner uses supplied pKa values to determine predominant forms and gives a bounded explanation of the supplied qualitative solid/no-solid findings without inventing saturation values or isolated causes.'),
        'actualPageObservation': 'Alanin und Serin sind korrekt als vereinfachte Zwitterionen bei pH7 dargestellt; die gemeinsamen geladenen Gruppen bleiben sichtbar. Der volle aktuelle Text und die externe Säure-Base-Voraussetzung sind lesbar.',
        'sourceBasis': ['BY original Chemie.json source goal 474db408-a366-52bd-b1d2-47772ce8b677', 'Both whole final current b47 cases including fictional glutamic-acid case-2', 'Bound current candidate profile in actual page input']
    },
    {
        'goalId': 'ffec1761-c954-5b5d-a0cf-4c8367f91705',
        'decision': 'keep',
        'evidenceProfileRecommendation': 'none',
        'rationale': 'Eine klar begrenzte Nomenklaturkompetenz für einfache 2-Aminocarbonsäuren; die DE/EN-Texte stimmen überein und folgen BY C13-GA.4.2. Die echte Seite 5 markiert an Glycin/Alanin Carboxyl-C1 und benachbartes C2. Ihre Trivialnamen allein würden das Ziel nicht belegen; die ganzen gebundenen Fälle verlangen systematische Namen mit Zählrichtung und eine veränderte Hydroxy-substituierte Konnektivität. R/S-, D/L- oder umfassende Seitenkettenklassifikation werden nicht zusätzlich verlangt. Das gelesene aktuelle Profil enthält bereits den regelbezogenen Verständnis- und frischen Transferfall.',
        'understandingEvidence': evidence(
            'Die Carbonsäurefunktion legt die Stammkette und das Carboxyl-C als C1 fest; „2-Amino“ bezeichnet die Aminogruppe am benachbarten Kohlenstoff. Ein systematischer Name beschreibt die Konnektivität über nachvollziehbare Regeln.',
            'The carboxylic acid function fixes the parent chain and carboxyl carbon as C1; 2-amino places the amino group on the adjacent carbon. A systematic name encodes connectivity through explicit rules.',
            'Die lernende Person benennt eine vorgelegte einfache 2-Aminocarbonsäure systematisch, markiert die Nummerierung und begründet Aminoposition und Stammnamen; ein erinnerter Trivialname reicht dafür nicht.',
            'The learner systematically names a supplied simple 2-amino carboxylic acid, marks its numbering and justifies the amino locant and parent name rather than relying on a recalled trivial name.',
            'Bei einer frisch vorgelegten längeren oder hydroxy-substituierten einfachen Struktur wendet die lernende Person dieselben Regeln an und erkennt eine fehlerhafte Zählung vom falschen Kettenende.',
            'For a fresh longer-chain or hydroxy-substituted simple structure, the learner applies the same naming rules and identifies numbering from the wrong end of the chain.'),
        'actualPageObservation': 'Zwei vollständige vereinfachte Strukturformeln von Glycin und Alanin; C1/C2-Pfeile und „Amino an C2“. Keine festgelegte Stereokonfiguration. Vollständige Beschreibung bleibt sichtbar.',
        'sourceBasis': ['BY original Chemie.json source goal 4ccb88b1-c6cf-5931-af49-7c03f43ce2f3', 'Whole current nomenclature case-a and case-b-transfer plus rubric', 'Bound current candidate profile in actual page input']
    },
    {
        'goalId': '0b5342b9-512d-573f-90d5-7522aee35efa',
        'decision': 'revise',
        'evidenceProfileRecommendation': 'create',
        'rationale': 'Die deutsche Kompetenz ist fachlich schlüssig und übernimmt begrenzt den Operator aus BY C11.2.16. Der konkrete bilinguale Korrekturbefund betrifft „resorption“ im englischen Beschreibungstext: für die hier gemeinte Aufnahme von Nahrungsbestandteilen durch die Darmwand ist „intestinal absorption“ die eindeutige Standardbezeichnung (NLM MeSH D007408). Die neue vollständige englische Beschreibung beseitigt diesen terminologischen Transferfehler; die vollständige deutsche Ersatzfassung bleibt inhaltlich und wörtlich gleich. Auch der englische Titel verwendet resorption und sollte bei einer späteren Autorenänderung konsistent berichtigt werden; dieser D-Record ändert keinen Titel. Die echte Seite 6 zeigt Lactasespaltung als Beispiel, nicht sämtliche Resorptionsmechanismen. Die ganzen Fälle trennen enzymatische Hydrolyse und anschließenden Transport; weder Abbildung noch Modellfälle sind individuelle Diagnosen. Kein aktuelles Profil ist an die wirklich gerenderte Seite gebunden; Empfehlung create.',
        'proposedDescriptionDe': 'Die lernende Person kann genetisch bedingte oder erworbene individuelle Unterschiede bei Verdauung und Resorption von Nahrungsbestandteilen chemisch begründen.',
        'proposedDescriptionEn': 'The learner can explain the chemical basis of genetically determined or acquired individual differences in the digestion and intestinal absorption of food components.',
        'understandingEvidence': evidence(
            'Enzymatische Spaltung macht aus Nahrungsbestandteilen aufnehmbare Produkte; deren Transport durch die Darmwand ist ein weiterer Vorgang. Genetische oder erworbene Unterschiede können Enzymausstattung, Milieu oder Aufnahme verändern.',
            'Enzymatic digestion produces absorbable products from food components; their transport across the intestinal lining is a further process. Genetic or acquired differences may affect enzyme availability, the chemical environment or absorption.',
            'Die lernende Person begründet an gegebenen Vergleichsfällen, ob geringere Produktbildung oder verminderter Transport die Aufnahme begrenzt, und verknüpft die Beobachtung mit Hydrolyse, Enzymwirkung oder Stoffeigenschaften.',
            'Given comparison cases, the learner explains whether reduced product formation or impaired transport limits absorption and relates the findings to hydrolysis, enzyme action or molecular properties.',
            'In einem neuen Fall mit intakter Spaltung und verändertem Transport erklärt die lernende Person den Unterschied zu Lactasemangel; aus einem Modellmechanismus leitet sie keine persönliche Diagnose ab.',
            'In a fresh case with intact digestion but altered transport, the learner explains the difference from lactase deficiency without turning a model mechanism into an individual diagnosis.'),
        'actualPageObservation': 'Lactose bleibt ohne Lactase verbunden und wird mit Lactase in zwei Zuckerbausteine gespalten. Die Darmsymbole werden als allgemeines Verdauungstrakt-Schema gelesen. Die volle Beschreibung unterscheidet genetische/erworbene Ursachen.',
        'sourceBasis': ['BY original Chemie.json source goal f93dde15-1574-52c0-923b-5780ad39f081', 'Whole current digestion case-a and case-b-transfer plus rubric', 'https://www.ncbi.nlm.nih.gov/mesh?Cmd=DetailsSearch&Db=mesh&Term=%22Intestinal+Absorption%22%5BMeSH+Terms%5D']
    },
    {
        'goalId': 'f4d5a02d-711b-5a6b-a41d-971359c1f64d',
        'decision': 'keep',
        'evidenceProfileRecommendation': 'create',
        'rationale': 'Die Beschreibung benennt eine zusammenhängende analytische Kompetenz: optische Aktivität verstehen, spezifische Drehung als bedingte Kenngröße beschreiben und den Beitrag der Polarimetrie zur Charakterisierung einordnen. Das ist durch HE Q2.1 und die gelesene BY-C11.2-Originalpassage zur spezifischen Drehung gedeckt, ohne pauschale Stoffidentifikation zu versprechen. Die echte Seite 7 zeigt einen schematischen Lichtweg und eine gedrehte Ebene, aber keinen Messwert oder D/L-Befund. Alle drei ganzen Fälle des neutralen Addendums wurden gelesen: +6/(2·0,05)=+60 sowie +5,3/(1·0,100)=+53 mit hier allein winkelbedingter Unsicherheit ±1; Referenzwerte sind ausdrücklich spezifische Drehungen. Der Zweikandidatenvergleich und die Racematgrenze verhindern einen universellen Identifikationsschluss. Das Addendum ändert weder Seite noch Profilnull; create bleibt eine Empfehlung.',
        'understandingEvidence': evidence(
            'Optisch aktive Proben drehen die Ebene linear polarisierten Lichts. Spezifische Drehung normiert den Winkel auf Weglänge und Konzentration unter festgelegter Temperatur, Wellenlänge, Lösemittel- und Gleichgewichtskonvention; Drehzeichen und D/L-Konfiguration sind verschiedene Informationen.',
            'Optically active samples rotate the plane of linearly polarised light. Specific rotation normalises the angle for path length and concentration under stated temperature, wavelength, solvent and equilibrium conventions; rotation sign and D/L configuration are different information.',
            'Die lernende Person erklärt den Polarimetrie-Aufbau, unterscheidet beobachteten Winkel und spezifische Referenzdrehung und begründet einen Vergleich nur unter passenden Bedingungen und innerhalb vorgegebener Alternativen.',
            'The learner explains the polarimetry setup, distinguishes observed angle from specific reference rotation, and justifies comparisons only under matching conditions and within stipulated alternatives.',
            'In einer frischen Aufgabe mit anderer Weglänge oder Konzentration sowie einem Racemat wendet die lernende Person die Normierung an und erklärt, weshalb Drehung null oder ein passender Referenzwert allein keine uneingeschränkte Stoffidentität beweist.',
            'In a fresh task involving a changed path length or concentration and a racemate, the learner applies the normalisation and explains why zero rotation or a matching reference value alone does not establish unrestricted substance identity.'),
        'actualPageObservation': 'Lichtquelle, zwei Filter und Probe; die orange Ebene hinter der Probe ist gegenüber der blauen gedreht. Die vergrößerte Skizze bezeichnet nur Drehung. Keine reale Messung und keine Vorzeichen-/Konfigurationszuordnung sind abgebildet.',
        'sourceBasis': ['HE current2026 original PDF physical/printed page 42 Q2.1', 'BY source extraction C11.2 item6 read as supporting original passage', 'Neutral final f4 addendum: all three whole cases, sha256:b56dc642ef442fa8452ab09d4e8fee2fd2eecd14973ad8d10f7e876354055c6f']
    },
    {
        'goalId': '0773a104-aaeb-5e96-a615-2a2bec3eb096',
        'decision': 'keep',
        'evidenceProfileRecommendation': 'none',
        'rationale': 'Die Beschreibung verlangt eine begründete Strukturwahl unter vorgegebenen Waschbedingungen und Zielkriterien; Vergleich und Auswahl bilden eine gemeinsame Optimierungskompetenz. Sie setzt weder universelle Überlegenheit einer Tensidklasse noch Schaum=Fettentfernung voraus. Die echte Seite 8 zeigt Temperatur, Härte und Dosis sowie gleichwertig angeordnete anionische/nichtionische Modelle und getrennte Fettentfernungs-/Schaumkriterien. Die beiden ganzen Fälle verknüpfen Struktur, Konzentration und Temperatur mit Modellgrenzen und ändern im Transfer Temperatur bzw. Zielgewichtung. Das gelesene aktuelle Profil bindet diese Inhalte vollständig; der neue Bildhash ist nicht die wissenschaftliche Begründung. Die englische Folge „objectives,and“ ist ein kleiner Satzabstandsfehler ohne inhaltlichen Bedeutungswechsel.',
        'understandingEvidence': evidence(
            'Tensidkopf und unpolare Kette beeinflussen Hydratation und Wechselwirkungen mit Schmutz; Temperatur, Wasserhärte und Konzentration begrenzen die Eignung. Schaumbildung, Fettentfernung und Umweltwirkung sind unterschiedliche Zielgrößen.',
            'The surfactant head and nonpolar chain affect hydration and interactions with soil; temperature, hardness and concentration constrain suitability. Foaming, fat removal and environmental impact are different objectives.',
            'Die lernende Person vergleicht gegebene Strukturen anhand konkreter Daten und wählt eine unter den angegebenen Temperatur-, Härte- und Dosisgrenzen passende Formulierungskomponente mit chemischer Begründung und benannten Datenlücken.',
            'The learner compares supplied structures using concrete data and selects a formulation component suited to the stated temperature, hardness and dose limits, giving chemical reasons and identifying missing data.',
            'Nach einer frischen Änderung von Waschtemperatur oder Schaumanforderung prüft die lernende Person ihre Wahl neu, fordert erforderliche Trübungs-/Leistungsdaten an und begründet veränderte Zielgewichtungen.',
            'After a fresh change in washing temperature or foam requirements, the learner reassesses the selection, requests necessary cloud-point or performance data and justifies changed objective weights.'),
        'actualPageObservation': 'Die zwei Modelle stehen nebeneinander ohne Rangordnung; negative Kopfgruppenladung links, verlängerter ungeladener hydrophiler Bereich rechts. Die sichtbare Frage verlangt eine Wahl. Die Beschreibung und externe Voraussetzung sind vollständig.',
        'sourceBasis': ['HE current2026 original PDF physical/printed page50 Q4.3 structure/property clause', 'Whole two current own surfactant model cases and rubrics', 'Bound current candidate profile in actual page input']
    },
    {
        'goalId': '1d2e7b80-653d-57b8-a284-8ede5a353b73',
        'decision': 'keep',
        'evidenceProfileRecommendation': 'revise',
        'rationale': 'Die Beschreibung verlangt ausdrücklich kontrollierte Durchführung, Auswertung und Erklärung positiver/negativer Befunde durch zugängliche Carbonylformen und anomere Verknüpfungen. Das ist ein zusammenhängendes Untersuchungsziel und gegenüber dem Nachfolger 96 auf die Strukturbegründung von Reduktionsnachweisen begrenzt. Die echte zusätzliche Native-Seite 3 markiert das Schema als Bausteinmodell; eine direkte C1-C2-Linie wird deshalb nicht als vollständige glycosidische Strukturformel gelesen. Der gebundene ganze Benedict-Doppellauf benennt reale Durchführung, Kontrollen, Abweichungen und Sicherheit ohne erfundene Beobachtungen. Das Profil benötigt lediglich eine fachlich positive Ausformulierung seines derzeit rein operatorischen ersten essentialUnderstanding-Felds; keine neue Beschreibung oder umetikettierte Laborfreigabe.',
        'understandingEvidence': evidence(
            'Ein zugängliches anomeres Zentrum ermöglicht bei geeigneten Kohlenhydraten den Zugang zu reduzierenden Carbonylformen; die Bindung beider anomeren Zentren erklärt unbehandelte Saccharose als nicht reduzierend. Im alkalischen Test kann Fructose über Enediol-Umlagerung ebenfalls positiv reagieren.',
            'An accessible anomeric centre allows suitable carbohydrates to access reducing carbonyl forms; linkage of both anomeric centres explains untreated sucrose as nonreducing. Under alkaline assay conditions, fructose can also react positively through enediol rearrangement.',
            'Die lernende Person führt den in ihrer Quellroute verlangten freigegebenen Fehling- oder Benedict-Nachweis mit Kontrollen durch, dokumentiert tatsächliche Bedingungen/Befunde und erklärt Cu(II)-Reduktion sowie positive und negative Zuckerergebnisse aus der Struktur.',
            'The learner carries out the authorised Fehling or Benedict assay required by the source route with controls, documents actual conditions and findings, and explains Cu(II) reduction and positive or negative sugar results from structure.',
            'Bei frisch vorgelegter Maltose und Fructose prüft die lernende Person die gegenüber Glucose/Saccharose veränderten Strukturgründe und erklärt, weshalb ein positiver Befund weder Glucoseidentität noch ausschließlich eine anfangs vorhandene Aldehydgruppe beweist.',
            'For freshly presented maltose and fructose, the learner examines the structural reasons that differ from glucose/sucrose and explains why a positive assay proves neither glucose identity nor only an aldehyde group present before the test.'),
        'actualPageObservation': 'Echtes Native-Nachbarblatt zeigt freies anomeres C1 bei Glucose, verknüpfte C1/C2-Zentren bei Saccharose, einen positiven roten und negativen blauen Test sowie ausdrücklich „Bausteinmodell“. Ganze Beschreibung und direkte Gegenrichtung zu96 sind sichtbar.',
        'sourceBasis': ['HE current2026 original PDF page42 Kohlenhydrate clauses', 'Whole bound candidate profile with both Fehling cases and final Benedict double-run case', 'Whole direct successor96 and actual Native-six page3']
    },
    {
        'goalId': 'e9d34f34-2a43-5cc7-bcca-1d08e057531d',
        'decision': 'keep',
        'evidenceProfileRecommendation': 'revise',
        'rationale': 'Die Beschreibung umfasst eine fachlich kohärente Säure-Base-Kompetenz: pH-abhängige Protonierung, Ladungszustand und amphoteres Verhalten anhand derselben Strukturformeln. Die echte zusätzliche Native-Seite 4 zeigt an Glycin die +1/0/−1-Formen und beide inneren Ladungen des Zwitterions. pH2 wird als vereinfachte dominante Form gemäß aktueller Bildmetadaten gelesen, nicht als exklusive Spezies; nahe pKa liegen Gemische vor. Klassifikation nach Seitenketten und systematische Benennung bleiben gesonderte direkte Nachfolger. Das aktuelle Profil verlangt im zweiten Fall zusätzlich Wanderung zur Elektrode; diese Anwendung sollte für dieses Ziel optional werden, weil die eigentliche Elektrophoresekompetenz beim eigenen Ziel d1244f5d liegt. Das begründet eine Profilrevision und keine Erweiterung des Zieltextes.',
        'understandingEvidence': evidence(
            'Amino- und Carboxylgruppen können Protonen aufnehmen oder abgeben. Ihr Protonierungszustand hängt vom pH relativ zu den pKa-Werten ab; ein Zwitterion trägt innere entgegengesetzte Ladungen auch bei Nettoladung null.',
            'Amino and carboxyl groups can accept or donate protons. Their protonation states depend on pH relative to pKa values; a zwitterion retains opposite internal charges even when its net charge is zero.',
            'Die lernende Person zeichnet und bilanziert die überwiegenden Ladungsformen einer einfachen Aminosäure bei verschiedenen pH-Werten und erklärt mit konkreter Protonenaufnahme/-abgabe deren Säure- und Baseverhalten.',
            'The learner draws and balances predominant charge forms of a simple amino acid at different pH values and explains its acidic and basic behaviour through specific proton donation and acceptance.',
            'Bei einem frischen pH-Wert nahe einem vorgegebenen pKa oder einer einfachen Aminosäure mit weiterer ionisierbarer Gruppe zählt die lernende Person alle relevanten Ladungen und unterscheidet überwiegende Form und Speziesgemisch.',
            'At a fresh pH near a supplied pKa, or for a simple amino acid with an additional ionisable group, the learner accounts for all relevant charges and distinguishes a predominant form from a mixture of species.'),
        'actualPageObservation': 'Echtes Native-Nachbarblatt zeigt Glycinformen mit NH3+/COOH, NH3+/COO− und NH2/COO− unter pH2/6/12; die Mitte heißt Zwitterion. Ganzer Text, beide Voraussetzungen und die direkten Nachfolger sind sichtbar.',
        'sourceBasis': ['HE current2026 original PDF page42 amino-acid acid-base clause', 'BY source extraction C13-GA.4 item1 as donor-acceptor support', 'Whole bound current candidate profile and all its two cases']
    }
]

selectors = []
page_bindings = {}
for name, expected in [('pages-six','f01198fe12660e6cf4abe931aa863dc20283bfb65e86dddf1af40ca8c6c41dd5'), ('pages-neighbor-two','a8c724856473187ece5e5bd4f181f04b1536e3baa4e00f98c5031d742064d50a')]:
    path = BASE / name / 'NEUTRAL.actual-current-native-pages-and-review-input.selector.json'
    assert pin(path)['sha256'] == 'sha256:' + expected
    selected = json.loads(path.read_text())
    selectors.append(pin(path))
    for entry in selected['actualPages']:
        for key in ['actualWholeGoalAndPageInput','actualPagePng120dpi','actualWholePageText']:
            assert pin(ROOT / entry[key]['path']) == entry[key]
        page_bindings[entry['goalId']] = entry

for row in rows:
    b = page_bindings[row['goalId']]
    row['actualPageBinding'] = b
    pg = json.loads((ROOT / b['actualWholeGoalAndPageInput']['path']).read_text())
    row['wholeCurrentCanonicalGoal'] = pg['wholeCurrentCanonicalGoal']
    row['currentStockInputGoal'] = pg['actualStockDescriptionReviewInputGoal']
    row['actualViewImageCompleted'] = True
    row['reviewAuthority'] = 'ai_candidate'
    row['recordStatus'] = 'candidate'

doc = {
    'schemaVersion': 1,
    'role': 'Fresh independent scientific D first pass B; own judgments secured after actual view_image calls for all eight pages',
    'securedAtUtc': datetime.now(timezone.utc).isoformat(),
    'selectors': selectors,
    'f4SeparateNeutralMaterialAddendum': pin(ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-polarimetry-one-reference-unit-clarification-author-successor-20261015-v1/AUTHOR.f4-three-whole-cases.two-exact-one-unit-corrected.json'),
    'independence': {
        'peerOrHistoricalDRecordsRead': False,
        'synthesesOrTriageMatricesRead': False,
        'earlierScientificDDecisionsUsed': False,
        'ownAuthoritativeApproval': False,
        'disclosure': 'A first source-extraction metadata inspection printed generic mapping pipelineStatus; it contained no D decisions or substantive D rationale. Supplied literal-source/memory boundary was read as preservation context, not as a fresh mapping/M vote.'
    },
    'evidenceLimits': 'Local independent candidate description review and actual Native page sighting. No real learner work, human acceptance, measurements, runtime integration, publication or maturity closure is asserted. Exact source extracts were used only for their named clauses; nationwide mappings were not independently reapproved.',
    'decisions': rows
}
path = OUT / 'FIRST.scientific-eight.actual-read-and-sight.json'
with path.open('x') as f:
    json.dump(doc, f, ensure_ascii=False, indent=2)
    f.write('\n')
assert len(json.loads(path.read_text())['decisions']) == 8
print(json.dumps({'firstJudgmentFile': pin(path), 'decisions': {r['goalId']: r['decision'] for r in rows}},ensure_ascii=False))
