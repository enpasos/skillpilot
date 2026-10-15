import datetime
import hashlib
import json
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent
REPO = next(p for p in OUT.parents if (p / 'AGENTS.md').is_file())
PREP = OUT.parent / 'chemie-bw-lk-memory-support-current422-native13-context-preparation-technical-root-20261015-v1'
SELECTOR = PREP / 'INPUTS.final-native13.physical-exact-selector.json'

def digest(p):
    return 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()

def write(p, x):
    with p.open('x') as f:
        f.write(json.dumps(x, ensure_ascii=False, indent=2) + '\n')

# These are original judgments from this independent review, authored after
# actually seeing every native PDF page and reading the complete context.
# They are not generated from another review, a D resolution, or P verdict.
items = [
 ('e7c363d4-e02d-4895-8750-ba62c2eb63fe',
  'Die Beschreibung verbindet das Lesen von Elementsymbolen mit dem Aufbau einfacher Molekülformeln. Auf PDF-Seite 3 bleibt die Kursauswahl ein nachgelagerter externer Link; die Fälle NH3 und 2 CO gegenüber CO2 verlangen weiterhin eigenständige Teilchenzählung. Die Symbolkarte ersetzt diese Leistung nicht. Die nur unterstützende BW-Klausel wird dadurch nicht zu einer vollständigen Quellenfreigabe.',
  'The description links reading element symbols to constructing simple molecular formulas. On PDF page 3, course selection remains a downstream external link; the NH3 and 2 CO versus CO2 cases still require independent particle counting. Recall does not replace that performance, and the supporting BW clause does not become full source clearance.',
  'Elementsymbole bezeichnen Atomsorten; eine Molekülformel beschreibt Art und Anzahl der Atome innerhalb eines Moleküls.',
  'Element symbols identify atom types; a molecular formula specifies the types and numbers of atoms within one molecule.',
  'Die Person übersetzt ein neues Teilchenbild in eine Molekülformel und erklärt, warum Index und vorangestellte Teilchenzahl verschiedene Angaben sind.',
  'The learner translates a fresh particle diagram into a molecular formula and explains why a subscript differs from a preceding particle count.',
  'Sie wechselt von einem Stickstoff-Wasserstoff-Molekül zu getrennten CO-Molekülen und einem CO2-Molekül und begründet die jeweils gezählte Einheit.',
  'The learner moves from a nitrogen-hydrogen molecule to separate CO molecules and one CO2 molecule, justifying the entity counted in each.'),
 ('1dc15fa2-fca4-56b0-b5c1-4d215613dde0',
  'Festgelegte Teilchen und eindeutige Molangaben begrenzen das Ziel klar. PDF-Seite 4 zeigt Symbolsprache als Voraussetzung und beide Grundlagen-Memoryziele erst als Nachfolger. Der Wechsel O2/He zu NaCl-Formeleinheiten prüft die Bedeutung der Einheit; der exakt angegebene Avogadro-Wert auf der Karte erweitert das Ziel nicht zu einer Rechenquote.',
  'Specified entities and unambiguous mole quantities define the goal clearly. PDF page 4 places symbolic language before it and both basics recall goals after it. Moving from O2/He to NaCl formula units tests the unit meaning; the exact Avogadro value on a card adds no calculation quota.',
  'Die Stoffmenge zählt ausdrücklich bezeichnete Einheiten; gleich viele Moleküle oder Formeleinheiten bedeuten nicht dieselbe Zahl enthaltener Atome oder dieselbe Masse.',
  'Amount of substance counts explicitly named entities; equal numbers of molecules or formula units do not imply equal constituent atom counts or masses.',
  'Sie bezeichnet die gezählten Einheiten und begründet die Stoffmengen von O2-Molekülen, O-Atomen beziehungsweise getrennten Ionensorten.',
  'The learner specifies the counted entities and justifies amounts of O2 molecules, O atoms or separate ion species.',
  'Sie korrigiert eine molekulare Fehlbeschreibung eines NaCl-Kristalls und unterscheidet die Stoffmenge der Formeleinheiten von der aller Ionen.',
  'The learner corrects a molecular misdescription of crystalline NaCl and distinguishes formula-unit amount from the amount of all ions.'),
 ('e9d74940-1e0e-4511-9718-4851f49ad7a5',
  'Die Formulierung verlangt begründete Aussagen aus dem PSE statt bloßen Abruf. PDF-Seite 5 behält das Energiestufenmodell als externe Voraussetzung; die neue Atombau-Kursauswahl ist ein Nachfolger. Die Karte mit ausdrücklich klassischer Hauptgruppennummer und Helium-Ausnahme passt zur begrenzten Deutung. P- und Ca-Fälle verlangen unterschiedliche Gruppen und Perioden.',
  'The wording requires reasoned deductions from the periodic table. PDF page 5 retains the energy-level model as an external prerequisite and places the new atomic-structure recall selection downstream. The card specifies classical main-group numbering and the helium exception; phosphorus and calcium vary both group and period.',
  'Die Ordnungszahl bestimmt die Protonenzahl; bei neutralen Hauptgruppenatomen lassen sich Elektronenzahl und einfache Valenzelektronenbezüge aus der Tabellenstellung erschließen.',
  'Atomic number determines proton count; for neutral main-group atoms, electron count and simple valence-electron relationships follow from table position.',
  'Sie erläutert an P und Ca die Verbindung zwischen Ordnungszahl, neutraler Elektronenzahl, Hauptgruppe und besetzten Schalen.',
  'The learner explains how atomic number, neutral electron count, main group and occupied shells relate in P and Ca.',
  'Sie bearbeitet einen neuen Hauptgruppen-/Periodenfall und prüft dabei, welche Aussagen Neutralität und welches einfache Schalenmodell voraussetzen.',
  'The learner handles a fresh group/period case and checks which deductions require neutrality and the simple shell model.'),
 ('67cd332f-9db7-50e1-87f6-172ef3714300',
  'Erklären und Verknüpfen der Lewis- mit der räumlichen Darstellung bleibt eine kohärente Modellierungsleistung. PDF-Seite 6 zeigt die beiden Bindungsvoraussetzungen und erst danach die Atombau-Memoryauswahl. H2O/CO2 und NH3/CH4 unterscheiden freie Paare und Domänenzahl; der Merksatz auf der EPA-Karte ersetzt diese Ableitung nicht.',
  'Explaining molecular geometry through Lewis representations remains one coherent modeling performance. PDF page 6 lists the two bonding prerequisites and then the atomic-structure recall selection. H2O/CO2 and NH3/CH4 vary lone pairs and domain count; the EPA recall rule does not replace derivation.',
  'Elektronenbereiche ordnen sich im EPA-Modell mit geringer Abstoßung; Elektronenbereichsgeometrie und Lage der gebundenen Atome sind zu unterscheiden.',
  'Electron domains arrange to reduce repulsion in VSEPR; electron-domain geometry differs from the positions of bonded atoms.',
  'Sie zählt bindende und freie Bereiche einer Lewis-Struktur und erklärt damit eine lineare, gewinkelte, pyramidale oder tetraedrische Molekülgestalt.',
  'The learner counts bonding and lone domains in a Lewis structure and uses them to explain linear, bent, pyramidal or tetrahedral shape.',
  'Sie vergleicht NH3 und CH4 trotz gleicher Domänenzahl und erklärt, warum das freie Paar kein zusätzliches Atom ist.',
  'The learner compares NH3 and CH4 despite their equal domain counts and explains why a lone pair is not another atom.'),
 ('dd58c029-176f-5d99-923e-1c1fda6cf58e',
  'Benennung, Skelettdarstellung, Homologie und einfache Isomerie sind hier über dieselbe Kohlenstoffverknüpfung verbunden; die neue Memoryauswahl fügt keine weitere Kompetenz hinzu. PDF-Seite 7 trennt sie vom fachlichen Nachfolger der sauerstoffhaltigen Stoffklassen. Die C4/C5-Fälle unterscheiden Valenz, Bindungsordnung und Konnektivität; die Karte nennt ihre acyclische Ein-Mehrfachbindungs-Grenze.',
  'Naming, skeletal representation, homology and simple isomerism are linked through the same carbon connectivity. PDF page 7 distinguishes the downstream recall selection from the oxygenated-class successor. C4/C5 cases test valence, bond order and connectivity; the card states the acyclic single-multiple-bond limitation.',
  'Kohlenstoffverknüpfung und Bindungsordnung bestimmen Struktur und Namen; Homologe unterscheiden sich von Konstitutionsisomeren.',
  'Carbon connectivity and bond order determine structure and name; homologues differ from constitutional isomers.',
  'Sie benennt und zeichnet einfache Alkane, Alkene und Alkine und begründet aus der Struktur, welche gleiche Summenformeln oder homologe Beziehungen besitzen.',
  'The learner names and draws simple alkanes, alkenes and alkynes, using their structures to justify molecular-formula equality or homologous relationships.',
  'Sie überträgt von linearen C4-Strukturen auf verzweigte C5-Strukturen und unterscheidet eine neue Konnektivität von bloß umgedrehter Darstellung.',
  'The learner transfers from linear C4 to branched C5 structures and distinguishes changed connectivity from merely reversing a drawing.'),
 ('7990387d-f254-5d3b-a589-a3e7ed9502a3',
  'Die Beschreibung macht die funktionelle Gruppe zum Zuordnungskriterium und bleibt von IUPAC-Benennung und experimentellem Nachweis abgegrenzt. Diese Partner stehen auf PDF-Seite 8 getrennt neben der nachgelagerten organischen Memoryauswahl. Die vollständigen Mehrfunktions-/Etherfälle verhindern, dass die knappe Gruppenkarte als vollständige disjunkte Stoffklassifikation gelesen wird.',
  'The description makes functional groups the classification criterion, separated from IUPAC naming and experimental tests. PDF page 8 lists those successors separately from the organic recall selection. Complete multifunctional and ether cases prevent the compact card from becoming an exhaustive disjoint classification.',
  'Funktionelle Gruppen werden mit ihrer Bindungsumgebung erkannt; OH innerhalb einer Carboxygruppe ist keine selbstständige Alkoholgruppe.',
  'Functional groups are identified with their bonding environment; OH within a carboxyl group is not a separate alcohol group.',
  'Sie ordnet gegebene Alltags- oder Technikvertreter anhand ihrer Struktur Alkohol, Aldehyd, Keton oder Carbonsäure zu und begründet die Carbonylunterschiede.',
  'The learner assigns supplied everyday or technical compounds by structure to alcohol, aldehyde, ketone or carboxylic-acid classes and explains their carbonyl differences.',
  'Sie bearbeitet eine Hydroxycarbonsäure mit zwei Gruppen und einen Ether, der außerhalb der vier Klassen liegt.',
  'The learner handles a hydroxycarboxylic acid with two groups and an ether outside the four classes.'),
 ('e9d34f34-2a43-5cc7-bcca-1d08e057531d',
  'Das Ziel bindet Nettoladung und Amphoterie an pH und Strukturformeln. PDF-Seite 9 zeigt den neuen Naturstoff-Memoryknoten ausschließlich als Nachfolger; seine Grundstruktur-/Zwitterionkarten sind keine Ladungsbilanzprüfung. Glycin und Lysin erfordern verschiedene Protonierungsbilanzen. Die BW-Strukturklausel allein belegt weiterhin nicht den vollständigen Säure-Base-Scope.',
  'The goal ties net charge and amphoteric behavior to pH and structural formulas. PDF page 9 places the new biomolecule recall node exclusively downstream; its structure and zwitterion cards do not assess charge balancing. Glycine and lysine require different protonation balances. The BW structure clause alone still does not establish the full acid-base scope.',
  'Protonierung einzelner Gruppen bestimmt die Nettoladung; ein Zwitterion besitzt innere Ladungen und kann Protonen aufnehmen oder abgeben.',
  'Protonation of individual groups determines net charge; a zwitterion contains internal charges and can accept or donate protons.',
  'Sie zeichnet pH-abhängige Formen von Glycin und erklärt die jeweilige Nettoladung sowie die Donator- und Akzeptorrollen.',
  'The learner draws pH-dependent glycine forms and explains their net charges and donor/acceptor roles.',
  'Sie berücksichtigt bei Lysin die zusätzliche protonierbare Seitenkette und begründet die veränderte Ladung und Wanderungsrichtung.',
  'The learner accounts for lysine’s additional protonatable side chain and explains its changed charge and migration direction.'),
 ('48115ff7-7aca-5d0b-a9e7-7fc6c78434ef',
  'Die unveränderte Beschreibung verbindet Protolyse, Gleichgewicht und Stärkevergleich, ohne pH-Rechnung oder Titration zu vereinnahmen. PDF-Seite 10 hält die neue Gleichgewichts-Memoryauswahl nachgelagert. Die sichtbaren getrennten Säure-/Basenbilder passen zu den ganzen G2-C1/C2-Fällen mit negativen Logarithmen, korrespondierenden Paaren und Konzentrationsgrenze; ein Kartenabruf reicht dafür nicht.',
  'The unchanged description connects protolysis, equilibrium and strength comparison without absorbing pH calculations or titration. PDF page 10 places the new equilibria recall selection downstream. Separate acid/base image panels agree with complete G2-C1/C2 cases involving negative logarithms, conjugate pairs and concentration limits; card recall is insufficient.',
  'Säure- und Basenkonstanten beschreiben bestimmte Protonenübertragungen; der negative Logarithmus kehrt die Zahlenordnung um, und korrespondierende Stärken hängen zusammen.',
  'Acid and base constants describe particular proton transfers; the negative logarithm reverses numerical order, and conjugate strengths are related.',
  'Sie stellt beide Protolysegleichgewichte und MWG auf, begründet Stärkereihenfolgen aus K beziehungsweise pK und trennt Stärke von Anfangskonzentration.',
  'The learner constructs both protolysis equilibria and mass-action expressions, explains strength orders from K or pK and distinguishes strength from initial concentration.',
  'Sie wechselt von Säuredaten zu Basendaten, bestimmt die korrespondierenden Partner und erklärt entgegengesetzt bevorzugte Kreuzgleichgewichte.',
  'The learner switches from acid to base data, determines conjugate partners and explains cross-equilibria that favor opposite sides.'),
 ('8be14f15-2258-58e6-ae4e-38953f5d0570',
  'Relative SHE-Potenziale, Redoxrichtung und Standard-Leerlaufspannung bleiben präzise benannt. PDF-Seite 11 zeigt die neue Gleichgewichts-Memoryauswahl neben getrennten Nernst-, SHE- und experimentellen Partnern. Die vollständigen Daniell-/Mg-Fe-Fälle verlangen Referenzwechsel und nicht skalierbare Potenziale. Experimentelle Ermittlung wird durch dieses D-Urteil nicht übernommen.',
  'Relative SHE potentials, redox direction and standard open-circuit voltage remain precise. PDF page 11 lists the new equilibria recall selection alongside distinct Nernst, SHE and experimental partners. Complete Daniell and Mg/Fe cases require reference changes and non-scaled potentials. This D judgment does not take over experimental measurement obligations.',
  'Standard-Reduktionspotenziale sind relative Vergleichswerte; ihre Differenz bestimmt unter angegebenen Standardbedingungen die Zellspannung und begünstigte Redoxrichtung.',
  'Standard reduction potentials are relative comparison values; their difference determines cell voltage and favored redox direction under specified standard conditions.',
  'Sie leitet Anode, Kathode und Reaktionsrichtung aus einer Potenzialtabelle ab und begründet die Spannung als Differenz statt als stöchiometrisch skalierte Größe.',
  'The learner derives anode, cathode and reaction direction from a potential table and explains voltage as a difference rather than a stoichiometrically scaled quantity.',
  'Sie prüft eine negative Vorschlagsrichtung und berechnet dieselbe Zellspannung nach gemeinsamer Verschiebung der Elektrodenreferenz.',
  'The learner checks a proposed negative direction and calculates the unchanged cell voltage after shifting both electrode references.'),
 ('801790f9-be3a-51fe-9b0f-3452c1bba887',
  'Die kurze qualitative Beschreibung bleibt auf Systemarten und Energieerhaltung begrenzt. PDF-Seite 12 zeigt Enthalpie als fachlichen Nachfolger und die Energie-Kursauswahl daneben. Deren korrigierte Karte unterscheidet nun auch Energie mit strömender Materie. Die vollständigen System- und isobar/isochor-Fälle erhalten die Begründung; kein Rückwärtsschluss aus Abruf auf Verstehen entsteht.',
  'The short qualitative description stays within system types and energy conservation. PDF page 12 places enthalpy and the energy recall selection downstream. Its corrected card also distinguishes energy carried by flowing matter. Complete system and constant-pressure/volume cases retain reasoning without inferring understanding from recall.',
  'Systemgrenzen entscheiden über Stoff- und Energieaustausch; konstante Gesamtenergie eines isolierten Systems verbietet innere Umwandlungen und Temperaturänderungen nicht.',
  'System boundaries determine matter and energy exchange; constant total energy in an isolated system does not prohibit internal conversions or temperature changes.',
  'Sie ordnet offene, geschlossene und isolierte Anordnungen begründet zu und erklärt Energieübertragung mit einer konsistenten Vorzeichenkonvention.',
  'The learner classifies open, closed and isolated arrangements with reasons and explains energy transfer using a consistent sign convention.',
  'Sie vergleicht ein starres und ein expandierendes geschlossenes Gefäß und erklärt, warum gleiche Wärmezufuhr verschiedene Änderungen der inneren Energie erzeugen kann.',
  'The learner compares a rigid and an expanding closed vessel, explaining why equal heat input can produce different internal-energy changes.'),
 ('4a08f31f-204c-5339-9d9f-5d2af28d5d5c',
  'Hess und einfache Kalorimetrie sind zwei Zugänge zur selben Reaktionsenthalpie; die Beschreibung bleibt fachlich klar. PDF-Seite 13 ordnet Hauptsatz, Gibbs und Energie-Memoryauswahl nachvollziehbar. Ganze Fälle enthalten Phasen-/Umsatzbasis, echte Durchführungspflichten, Leerproben und Fehlerbetrachtung. Die Hess-Karte ersetzt weder Zyklusbegründung noch Messhandlung; Quellenpartner behalten ihre eigenen Pflichten.',
  'Hess and simple calorimetry are two routes to reaction enthalpy, clearly stated in the description. PDF page 13 orders first law, Gibbs and energy recall selection coherently. Whole cases include phase/extent bases, actual execution duties, blanks and uncertainty. The Hess card replaces neither cycle reasoning nor measurement, and source partners retain their obligations.',
  'Reaktionsenthalpie hängt von Anfangs- und Endzuständen ab; kalorimetrisch erfasste Umgebungswärme benötigt Systemgrenze, Vorzeichen und passende Stoffmengenbasis.',
  'Reaction enthalpy depends on initial and final states; calorimetric surroundings heat requires a system boundary, sign convention and appropriate amount basis.',
  'Sie konstruiert einen Hess-Zyklus mit bilanzierten Reaktionen und wertet einen freigegebenen Kalorimetrieversuch anhand echter Rohdaten und kontrollierter Bedingungen aus.',
  'The learner constructs a Hess cycle with balanced reactions and evaluates an authorized calorimetry experiment using actual raw data and controlled conditions.',
  'Sie wechselt vom thermochemischen CO-Zyklus zu einer Lösungs- oder Neutralisationsmessung und erklärt Änderungen durch Phase, Wärmekapazität und Wärmeverlust.',
  'The learner moves from a thermochemical CO cycle to dissolution or neutralization calorimetry and explains changes due to phase, heat capacity and heat loss.'),
 ('dcbad4e4-e954-51d7-97ca-3bacb6f0d8d5',
  'Berechnung, Richtungsdeutung und Gleichgewichtsaussage bilden eine quantitative Gibbs-Kompetenz mit LK-Kennzeichnung. PDF-Seite 14 fügt die Energie-Memoryauswahl erst als Nachfolger hinzu. Die ganzen Temperatur-, Q-, Bildungsgrößen- und Redoxfälle trennen Standard-/Gemischzustand und Kinetik; die Formelkarte allein bestätigt weder Gleichgewicht noch tatsächlichen Ablauf.',
  'Calculation, direction and equilibrium form one quantitative Gibbs competence labeled LK. PDF page 14 adds energy recall selection downstream. Whole temperature, Q, formation-value and redox cases distinguish standard/mixture states and kinetics; the formula card alone establishes neither equilibrium nor actual reaction progress.',
  'Enthalpie, Entropie und absolute Temperatur bestimmen die freie Reaktionsenthalpie für die betrachteten Bedingungen; Standardwerte und tatsächliche Gemischrichtung sind verschieden.',
  'Enthalpy, entropy and absolute temperature determine reaction Gibbs energy for the stated conditions; standard values differ from actual mixture direction.',
  'Sie rechnet mit konsistenten Einheiten, begründet Vorzeichen und Grenztemperatur und erklärt, warum Gleichgewicht ein Kriterium für das tatsächliche ΔrG benötigt.',
  'The learner uses consistent units, explains signs and threshold temperature, and explains why equilibrium requires a criterion for actual ΔrG.',
  'Sie verändert nach einem Temperaturfall die Zusammensetzung über Q und begründet, weshalb bei gleichem negativem Standardwert die Rückrichtung begünstigt sein kann.',
  'After a temperature case, the learner changes composition through Q and explains why the reverse direction can be favored despite the same negative standard value.'),
 ('5c8f0bbb-103a-579f-87fc-c997afe4fd18',
  'Durchführen und Aussagekraft auswerten bleibt ausdrücklich als zusammenhängende Nachweiskompetenz erhalten. PDF-Seite 15 zeigt die neue Naturstoff-Memoryauswahl nach den analytischen Voraussetzungen. Der ganze betreute Ninhydrin-/Biuretauftrag fordert wirkliche Ausführung und Kontrollen; die korrigierte Biuretkarte begrenzt den Merksatz auf mehrere geeignete Peptidbindungen und identifiziert kein bestimmtes Protein.',
  'Execution and evaluating evidential limits remain an explicit connected assay competence. PDF page 15 places the new biomolecule recall selection after the analytical prerequisites. The complete supervised ninhydrin/biuret task requires actual execution and controls; the corrected biuret card requires multiple suitable peptide bonds and does not identify a particular protein.',
  'Ninhydrin und Biuret reagieren auf unterschiedliche chemische Merkmale; ein positiver Befund stützt begrenzte Stoffklassenaussagen und benötigt Kontrollen.',
  'Ninhydrin and biuret respond to different chemical features; positive findings support bounded class-level conclusions and require controls.',
  'Sie führt freigegebene Vergleichsnachweise mit Glycin, Protein und Blindproben durch, protokolliert wirkliche Befunde und begründet unterschiedliche Reaktionen.',
  'The learner executes authorized comparison assays with glycine, protein and blanks, records actual findings and explains differing responses.',
  'Sie beurteilt ein unabhängig vorgelegtes Lebensmittelprotokoll hinsichtlich Störung und fehlender Kontrollen und unterscheidet dessen Analyse von eigener Durchführung.',
  'The learner evaluates an independently supplied food-analysis record for interference and missing controls, distinguishing record analysis from personal execution.'),
]

selector = json.loads(SELECTOR.read_text())
assert [x[0] for x in items] == selector['scopeGoalIds']
now = datetime.datetime.now(datetime.timezone.utc).isoformat()
judgments = []
for row in items:
    gid, de, en, eu_de, eu_en, op_de, op_en, tr_de, tr_en = row
    judgments.append({'goalId':gid,'decision':'KEEP','normalDecision':'keep',
        'rationaleDe':de,'rationaleEn':en,'evidenceProfileRecommendation':'none',
        'understandingEvidence':dict(zip(
            ['essentialUnderstandingDe','essentialUnderstandingEn','observablePerformanceDe','observablePerformanceEn','transferExpectationDe','transferExpectationEn'],
            [eu_de,eu_en,op_de,op_en,tr_de,tr_en]))})
first = {'schemaVersion':1,'role':'Original independent D13 FIRST science, sealed before normal result records or validator runs',
    'reviewerId':'chemie-memory13-independent-a-20261015','scienceId':'chemie-memory13-native-context-independent-a-first-20261015-v1',
    'finalSelector':{'path':str(SELECTOR.relative_to(REPO)),'sha256':digest(SELECTOR)},
    'startedAt':json.loads((OUT/'checks/START.actual-native-review.json').read_text())['nativeReviewStartedAt'],
    'completedAt':now,'actualSeenPages':list(range(1,16)),'frontPagesSeen':[1,2],
    'nativeGoalPageNumbersSeen':list(range(1,14)),'blindToOtherDReviews':True,
    'peerDRecordsRead':0,'targetedContextReviewOnly':True,'descriptionChanges':0,
    'newStrictClosures':0,'sourceCourseHoldsCleared':False,'humanApproval':False,'humanTrial':False,
    'sourceBoundary':'Native pages contain no sourceBindings fields or printed source blocks. External bound BW clauses and whole primary extraction passages were read separately. Four indirect/partial and nine residual source/course holds are not cleared.',
    'laneBoundary':'No P, A, M or V vote. Existing whole profiles and corrected cards are context. No mastery, release or whole-course approval.',
    'judgments':judgments}
write(OUT/'FIRST.original-independent-D13-science.json',first)
write(OUT/'FIRST.original-independent-D13-science.seal.json',{'schemaVersion':1,'role':'Immutable FIRST science byte seal','sealedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'path':str((OUT/'FIRST.original-independent-D13-science.json').relative_to(REPO)),'sha256':digest(OUT/'FIRST.original-independent-D13-science.json'),'bytes':(OUT/'FIRST.original-independent-D13-science.json').stat().st_size,'normalResultsExistAtSeal':bool(list((OUT/'round-a/results').glob('*'))),'peerDRecordsRead':0})
print(json.dumps({'completedAt':now,'goals':len(judgments),'decisions':{'KEEP':len(judgments)},'FIRST':digest(OUT/'FIRST.original-independent-D13-science.json'),'seal':digest(OUT/'FIRST.original-independent-D13-science.seal.json')}))
