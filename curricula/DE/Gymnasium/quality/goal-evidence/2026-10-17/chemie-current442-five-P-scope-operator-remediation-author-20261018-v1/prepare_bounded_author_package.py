"""Author candidates only. No normal/config/profile/registry writes or validators."""
from pathlib import Path
import copy
import datetime
import hashlib
import json
import uuid

R = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
N = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17')
O = N / 'chemie-current442-normal-integration-20261017-v1'
C_PATH = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
REG = Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
SOURCE = Path('curricula/DE/Gymnasium/input/HB/upper-secondary/source-extraction/DE_HB_CHEMIE_SEKII_GYO_2022.source-extraction.json')
MAP = Path('curricula/DE/Gymnasium/mapping/DE-HB/upper-secondary/hb_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json')

def read(p):
    return json.loads((R / p).read_text())

def sha(data):
    return hashlib.sha256(data).hexdigest()

def pin(p):
    p = Path(p)
    if p.is_absolute():
        p = p.relative_to(R)
    b = (R / p).read_bytes()
    return {'path': str(p), 'sha256': sha(b), 'bytes': len(b)}

def objsha(x):
    return sha(json.dumps(x, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode())

def dump(name, value):
    p = OUT / name
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    json.loads(p.read_text())
    return pin(p)

def bilingual(de, en):
    return {'de': de, 'en': en}

def exp(id, de, en, obs_de=None, obs_en=None):
    return {'id': id, 'essentialUnderstandingDe': de, 'essentialUnderstandingEn': en,
            'observablePerformanceDe': obs_de or de, 'observablePerformanceEn': obs_en or en}

def case(id, task, answer, focus):
    return {'id': id, 'taskDemandDe': task['de'], 'taskDemandEn': task['en'],
            'expectedPerformanceDe': answer['de'], 'expectedPerformanceEn': answer['en'],
            'understandingFocusDe': focus['de'], 'understandingFocusEn': focus['en']}

def profile(archetype, expectations, cases, axes):
    return {'archetype': archetype, 'expectations': expectations,
            'coverageExpectations': {'requiredExpectationIds': [e['id'] for e in expectations],
                'alternativeExpectationGroups': [], 'minimumIndependentDemonstrations': 2,
                'freshVariationRequired': True, 'independentTransferRequired': True},
            'variationAxes': [{'id': i, 'textDe': t['de'], 'textEn': t['en']} for i, t in axes],
            'applicationCaseBriefs': cases}

C = read(C_PATH)
assert pin(C_PATH)['sha256'] == '1334c2f7e637c23737c32fffcda9adc9273b83e0d61f536c2e6b404699eee262'
BY = {g['id']: g for g in C['goals']}
G = {g['id'].split('-')[0]: g['id'] for g in C['goals']}
CHEM = next(s for s in read(REG)['subjects'] if s['subject'] == 'chemie')
SEM_PATH = Path(CHEM['semanticKindLedgerPath'])
OWNERS = {}
for cfg_path in CHEM['positiveEvidenceConfigPaths']:
    cfg = read(cfg_path)
    for line, text in enumerate((R / cfg['reviewPath']).read_text().splitlines(), 1):
        rec = json.loads(text)
        OWNERS[rec['goalId']] = {'config': pin(cfg_path), 'review': pin(cfg['reviewPath']),
            'lineOneBased': line, 'jsonPointer': '/profile', 'record': rec,
            'wholeProfileObjectSHA256': objsha(rec['profile'])}

IDS = {key: G[key] for key in ['684ffe86', '0278a515', 'd72cbb62', '02634fdd', '87d8cc68', 'dfaef897', 'e0944fbb', 'cc803809']}
NEW = {k: str(uuid.uuid5(uuid.NAMESPACE_URL, 'skillpilot:chemistry:2026-10-18:scope-remediation:' + k))
       for k in ['given-aldose-family-tree', 'own-biobased-pla-property-investigation', 'own-strong-acid-digital-ph-titration']}
src = read(SOURCE)
mapping = read(MAP)
BIO_PATH = N / 'chemie-current439-HB-biomolecules-material-author-20261017-v1/MATERIALS.whole-DE-EN.pending.json'
PLA_PATH = N / 'chemie-current439-HB-materials-resources-material-author-20261017-v1/materials/hb097-real-pla-investigation.DE-EN.json'
DYE_PATH = N / 'chemie-current439-HB-materials-resources-material-author-20261017-v1/materials/hb217-dye-origins-polyenes.DE-EN.json'
DIG_PATH = N / 'chemie-current441-HB134-GK-digital-titration-02634-author-20261017-v1/HB134-GK-own-digital-strong-acid-titration.DE-EN.json'
PRACTICAL_PATH = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-acid-two-pairs-complete-cases-source-memory-author-successor-20261016-v1/materials/NINE.complete-additional-cases-and-practical-rubrics.author.json')
REDOX_PATH = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json')
bio = read(BIO_PATH)['cases'][0]
pla, dye, dig = read(PLA_PATH), read(DYE_PATH), read(DIG_PATH)
redox_originals = read(REDOX_PATH)['cases'][2:4]
assert [c['id'] for c in redox_originals] == ['eqrk16-02-a', 'eqrk16-02-b']

# One shared original data body, two separately selected assessments. The old combined
# whole task is retained as provenance, not selected as the donor goal's obligation.
industrial = {
 'materialId': 'hb145-industrial-carbohydrate-classes-only', 'goalIds': [IDS['684ffe86']],
 'sourceOrdinals': [145], 'givens': bilingual(bio['givenDe'], bio['givenEn']),
 'learnerTask': bilingual(
 'Ordne Glucose, Stärke und Cellulose als Mono- bzw. Polysaccharide ein. Wähle anhand der gegebenen Struktur- und Eigenschaftskarten passende Rohstoffe für die Betriebe A–C und begründe mit Bausteinen, Bindungsart, Quellung/Viskosität bzw. Faserverband. Welche Aussage zur Cellulose-Fermentation bleibt ohne Enzymangaben offen? Der formale Zuckerstammbaum ist hier gegebener Hintergrund, kein zu zeichnendes oder zu bestehendes Zusatzkriterium.',
 'Classify glucose, starch and cellulose as mono- or polysaccharides. Use the supplied structural/property cards to choose feedstocks for factories A–C, explaining units, linkage, swelling/viscosity or fibre structure. Which cellulose-fermentation claim remains unresolved without enzyme information? The formal family tree is supplied context here, not an additional drawing or completion requirement.'),
 'modelSolution': bilingual(
 'A: Glucose als zugängliches Monomer für den gegebenen Organismus; B: Stärke wegen Quellung/Viskosität; C: Cellulose wegen zugfestem Faserverband. Die alpha- bzw. beta-1,4-Verknüpfung beeinflusst Kettenorganisation und enzymatische Zugänglichkeit. Ohne Cellulaseangabe ist Cellulose als fermentierbarer Rohstoff nicht belegt. Fotosynthetische Bildung ist die eigene unveränderte Kompetenz 1051c091; weder deren ganze Leistung noch C2-Epimerie wird aus diesem Klassifikationsfall abgeleitet.',
 'A: glucose as an accessible monomer for the specified organism; B: starch for swelling/viscosity; C: cellulose for strong fibres. Alpha versus beta-1,4 linkage affects chain organisation and enzymatic accessibility. Cellulose fermentation is not established without cellulase information. Photosynthetic formation remains separate unchanged goal 1051c091; this case establishes neither that whole performance nor C2 epimerism.'),
 'freshTransfer': {'task': bilingual('C benötigt jetzt keine Faser, sondern eine quellfähige Papierleimung. Begründe eine neue Auswahl anhand derselben Karten. Darf gleiche Glucose-Bausteinart gleiche Eigenschaften garantieren?', 'C now needs a swelling paper-sizing material rather than a fibre. Justify a new choice using the same cards. Do identical glucose units guarantee identical properties?'),
 'expected': bilingual('Stärke ist nach der gegebenen Quell-/Viskositätskarte plausibel, Cellulose als unlöslicher Faserstoff erfüllt das geänderte Kriterium nicht allein. Verknüpfung und Kettenanordnung bleiben entscheidend; keine neue reale Messung behaupten.', 'Starch is plausible under the supplied swelling/viscosity card; insoluble cellulose fibres alone do not meet the changed criterion. Linkage and chain organisation remain decisive; no new measurement is claimed.')},
 'rubric': bilingual('Klassen, Struktur-Eigenschaftsbegründung für A–C und neuer Nutzungsfall; kein Stammbaum-/C2-Epimerie-Veto.', 'Classes, structure-property reasoning for A–C and the changed-use transfer; no family-tree/C2-epimerism veto.')}
tree = {
 'materialId': 'hb148-given-aldose-formal-family-tree', 'goalIds': [NEW['given-aldose-family-tree']],
 'sourceOrdinals': [148], 'mandatoryTermRef': '/mandatoryTermSets/11/terms/6',
 'officialBoundary': 'Selected HB2.1 vocabulary/stereochemistry context. The full supplied-aldose tree and C2 comparison are an explicit narrow SkillPilot operationalisation, not an extra verbatim universal official command.',
 'givens': bilingual(bio['givenDe'], bio['givenEn']),
 'learnerTask': bilingual(
 'Nutze die vollständig gegebenen OH-Muster und die erklärte formale Erweiterungsregel, um einen beschrifteten Aldosenstammbaum zu konstruieren. Verbinde D-Glucose und D-Mannose mit dem gemeinsamen Pentosemuster. Nummeriere die betreffenden C-Atome, bestimme ihren einzigen Konfigurationsunterschied und ordne D/L anhand des untersten Stereozentrums zu. Erläutere, weshalb der formale Elternpfeil weder eine organismische Biosynthese noch eine Drehungsrichtung behauptet.',
 'Use the complete supplied OH patterns and formal-extension rule to construct a labelled aldose family tree. Link D-glucose and D-mannose to their common pentose pattern. Number the relevant carbons, identify their sole configurational difference and assign D/L from the lowest stereocentre. Explain why a formal parent arrow establishes neither organismic biosynthesis nor optical-rotation sign.'),
 'modelSolution': bilingual(
 'Glucose RLRR und Mannose LLRR haben den gemeinsamen unteren Rest LRR, also formal Arabinose als Pentose-Elternmuster. Sie unterscheiden sich nur am neu eingefügten C2 und sind C2-Epimere, keine Enantiomere und kein alpha/beta-Anomerenpaar. Beide bleiben D, weil das unterste OH rechts steht. R/L bezeichnet hier nur rechts/links, nicht CIP. Der Baum ordnet Strukturen; er beschreibt keinen tatsächlichen Syntheseweg.',
 'Glucose RLRR and mannose LLRR share lower pattern LRR, formally arabinose as pentose parent. They differ only at newly inserted C2 and are C2 epimers, neither enantiomers nor an alpha/beta anomer pair. Both are D because their lowest OH is right. R/L here means right/left, not CIP. The tree organises structures, not an actual biosynthetic route.'),
 'freshTransfer': {'task': bilingual('Ordne jetzt D-Galactose RLLR und D-Xylose RLR unabhängig ein. Widersprich „D bedeutet jedes OH rechts“ und „Stammbaum bedeutet Fotosynthesekette“. Kein neuer Ringschluss wird verlangt.', 'Now independently place D-galactose RLLR and D-xylose RLR. Refute “D means every OH is right” and “the tree is a photosynthesis sequence”. No additional ring closure is required.'),
 'expected': bilingual('Galactose passt formal unter Lyxose LLR, Xylose unter Threose LR. In beiden entscheidet das unterste OH über D. Der obere neue Rest darf nicht mit dem erhaltenen unteren Muster verwechselt werden; keine Biosynthese- oder Drehvorzeichenfolgerung.', 'Galactose formally branches from lyxose LLR and xylose from threose LR. Their lowest OH determines D. Distinguish the new upper centre from the retained lower pattern; no biosynthesis or optical-sign inference.')},
 'rubric': bilingual('Eigener beschrifteter Baum, richtige Mustererhaltung/C2-Beziehung, D/L-Grenze und eigenständige neue Galactose-/Xylose-Zuordnung. Keine Industrie-/Ring-/Polarimeterpflicht.', 'Own labelled tree, correct retained pattern/C2 relationship, D/L limits and independent new galactose/xylose placement. No industry, ring-closure or polarimetry duty.')}

classify = copy.deepcopy(dye)
classify['materialId'] = 'hb217-origin-and-polyene-classification-only'
classify['goalIds'] = [IDS['d72cbb62']]
classify['learnerTask'] = bilingual(
 'Ordne die gegebenen Natur-/Synthesebeispiele getrennt nach Strukturklasse, Herkunft/Gewinnungsart und Verwendung. Erhalte Azo-, Triarylmethan- und Anthocyaninklassen aus den beiden bisherigen Fällen und ergänze Polyene anhand mehrerer C=C-Bindungen. Trenne die angegebene physikalische Isolierung von einer angegebenen Synthese, ohne einen Synthesemechanismus oder ein Experiment ausführen zu müssen. Welche zusätzlichen Qualitäts-/Verwendungsdaten fehlen? Energielücken, Übergangsschemata und die Erklärung des Absorptionswechsels sind hier keine Abschlussbedingungen.',
 'Classify the supplied natural/synthetic examples separately by structural family, origin/isolation route and use. Retain azo, triarylmethane and anthocyanin classes from the two original cases and add polyenes using multiple C=C bonds. Distinguish the stated physical isolation from the stated synthesis without performing a mechanism or experiment. Which quality/use information is missing? Energy gaps, energy-level diagrams and explanation of shifted absorption are not completion conditions here.')
classify['modelSolution'] = bilingual(
 'Die Karten unterscheiden Anthocyaningemisch, Azo-Struktur und beta-Carotin/Polyen. Wasserextraktion/Filtration sind ein gegebener Isolierungsweg, die genannte Azokupplung ein Syntheseweg; beide sind als Herkunftskriterium vom Molekülstrukturkriterium zu trennen. Mehrere C=C erlauben die Polyen-Zuordnung, nicht automatisch Wasserlöslichkeit, eine bestimmte Anwendung, Sicherheit oder Nachhaltigkeit. Die gegebenen Verwendungen bleiben an ihre Bedingungen gebunden; keine Energieerklärung ist hierfür verlangt.',
 'The cards distinguish an anthocyanin mixture, azo structure and beta-carotene/polyene. Water extraction/filtration is a supplied isolation route and azo coupling a supplied synthesis route; origin and molecular family are separate criteria. Multiple C=C bonds support polyene classification, not automatic water solubility, a specific use, safety or sustainability. Supplied uses retain their conditions; no energy explanation is demanded for this classification.')
classify['freshTransfer'] = {'task': bilingual('Ein Produkt enthält strukturidentisches synthetisches statt extrahiertes beta-Carotin; Reinheit und Energieaufwand sind unbekannt. Eine zweite Kette hat mehrere isolierte C=C. Welche Struktur-/Herkunftszuordnungen ändern sich sicher, welche Qualitäts-/Verwendungsaussagen bleiben offen?', 'A product contains structurally identical synthetic rather than extracted beta-carotene; purity and energy use are unknown. Another chain has multiple isolated C=C bonds. Which structure/origin assignments necessarily change and which quality/use claims remain unresolved?'),
 'expected': bilingual('Beim identischen beta-Carotin bleibt die Polyen-Strukturklasse erhalten; der Herkunftsweg wechselt. Ohne weitere Angaben folgt keine Reinheit, Unbedenklichkeit, LCA oder neue Verwendung. Die zweite Kette ist im weiten Strukturgebrauch ein Polyen; aus dieser Klasse allein folgen keine konkrete Farbe oder Anwendung. Eine Energie-/Wellenlängenerklärung gehört zur eigenen 87d8-Aufgabe.', 'Identical beta-carotene retains its polyene family while its origin route changes. Purity, safety, LCA or a new use cannot be inferred. The second chain is a polyene in the broad structural sense; family alone gives no exact colour or use. Energy/wavelength explanation belongs to the separate 87d8 assessment.')}
classify['rubric'] = bilingual('Getrennte Kriterien, gegebene Herkunftswege/Verwendung und Polyenmerkmale; alter Klassenumfang erhalten; neue Zuordnung ohne unbelegte Qualitätsfolgerung. Keine Energie-/Absorptionspflicht.', 'Separate criteria, supplied origins/uses and polyene features; retain original classes; new assignment without unsupported quality claims. No energy/absorption duty.')
energy = copy.deepcopy(dye)
energy['materialId'] = 'hb215-polyene-energy-and-absorption-only'
energy['goalIds'] = [IDS['87d8cc68']]
energy['sourceOrdinals'] = [215]
energy['givens']['de'] += ' Für den Energievergleich ist hc=1240 eV·nm gegeben; hier bezeichnet 400–700 nm den sichtbaren Bereich.'
energy['givens']['en'] += ' For the energy comparison hc=1240 eV·nm is supplied; the visible range here is 400–700 nm.'
energy['learnerTask'] = bilingual('Stelle die gegebenen erlaubten Übergänge der konjugierten und unterbrochenen Modellkette mit aufwärts gerichteten Absorptionspfeilen dar. Bestimme die Energieabstände aus 450 bzw. 300 nm und erkläre den Zusammenhang von wirksamer Delokalisierung, Energielücke und sichtbarer/UV-Absorption. Warum liefert die absorbierte Wellenlänge allein nicht die genaue beobachtete Farbe? Es wird keine zusätzliche Herkunfts- oder Mehrklassenprüfung verlangt.', 'Draw upward absorption arrows for the supplied allowed transitions of the conjugated and interrupted model chains. Obtain gaps from 450 and 300 nm and explain effective delocalisation, energy gap and visible/UV absorption. Why does absorbed wavelength alone not determine exact observed colour? No additional origin or multiple-family assessment is required.')
energy['modelSolution'] = bilingual('450 nm entspricht etwa 2,76 eV, 300 nm etwa 4,13 eV. Im gegebenen Vergleich vergrößert die Unterbrechung den erlaubten Übergangsabstand; die Bande verschiebt sich zu energiereicherem kürzerwelligem UV-Licht. Eine passend konjugierte Kette kann durch sichtbare Absorption farbig erscheinen; austretendes Restlicht, weitere Banden und Beleuchtung begrenzen die genaue Farbaussage. Dies ist ein vorgegebenes Modell, keine eigene Messung.', '450 nm corresponds to about 2.76 eV and 300 nm to about 4.13 eV. In the supplied comparison interruption increases the allowed gap, shifting absorption to shorter higher-energy UV wavelengths. A suitably conjugated chain can appear coloured through visible absorption; residual light, other bands and illumination limit exact colour prediction. This is a supplied model, not a personal measurement.')
energy['freshTransfer'] = {'task': bilingual('Eine neue Kette hat mehrere isolierte C=C. Beweist die Bezeichnung Polyen den gleichen sichtbaren Übergang wie 450 nm? Begründe die Grenze ohne eine fehlende Wellenlänge zu erfinden.', 'A fresh chain has multiple isolated C=C bonds. Does the name polyene establish the same visible transition as 450 nm? Justify limits without inventing an absent wavelength.'), 'expected': bilingual('Nein. Mehrere Doppelbindungen allein belegen kein zusammenhängendes wirksam delokalisiertes Chromophor und keinen bestimmten erlaubten Energieabstand. Keine genaue Wellenlänge/Farbe ohne weitere Daten. Identische Struktur und Herkunftswechsel sind eine andere, nicht hier zu prüfende Klassifikationsfrage.', 'No. Multiple double bonds alone establish neither an extended effectively delocalised chromophore nor a particular allowed gap. No exact wavelength/colour follows without further data. Origin changes at identical structure are a separate classification issue.')}
energy['rubric'] = bilingual('Energieniveaus/Pfeilrichtung, gegebenenfalls Lückenrechnung, Delokalisierung und bedingte Farbigkeit sowie neue Modellgrenze; alte 87d8-Pflichten bleiben erhalten.', 'Energy levels/arrow direction, gap calculation, delocalisation and conditional colour plus a fresh model limit; preserve all original 87d8 duties.')

pla['goalIds'] = [NEW['own-biobased-pla-property-investigation']]
dig['goalIds'] = [NEW['own-strong-acid-digital-ph-titration']]
dig['sourceOrdinals'] = [127, 134]
dig['scope'] = bilingual('Eigene vollständige quantitative Untersuchung einer starken einprotonigen Säure im freigegebenen Unterricht; GK/LK-HB1.2. Die ganze hier gewählte pH-Volumen-Erfassung, praktische Planung/Durchführung und digitale Auswertung gehören diesem Kandidaten. Keine schwache-Säure-, pKa-, Halbäquivalenz- oder Sensorautomationspflicht.', 'A complete personal quantitative investigation of a strong monoprotic acid in released teaching; GK/LK HB1.2. The selected pH/volume acquisition, practical planning/execution and digital evaluation belong to this candidate. No weak-acid, pKa, half-equivalence or sensor-automation requirement.')
dig['strongOnlyPracticalProtocol'] = bilingual(
 'Vollständige starke-Säure-Route als Autorenentwurf aus dem vorhandenen PRACTICAL-PH-CURVES-P1, ohne dessen schwache Säure und Halbpunkt: Nur nach schulischer Gefährdungsbeurteilung und konkreter Freigabe im betreuten Fachraum. Die Lehrkraft stellt 25,00 mL HCl-Probe nahe 0,050 mol/L, standardisierte NaOH 0,0500 mol/L und den im begründeten Plan vorgesehenen Indikator gebrauchsfertig bereit; Lernende verdünnen keine Konzentrate. Schutzbrille/Schutzkleidung nach lokaler Beurteilung, Vollpipette mit Pipettierhilfe, gesicherte 50-mL-Bürette, geeignetes Becherglas, Rührer, pH-Meter/Elektrode, Kalibrierpuffer pH4/7/10 mit Temperaturbezug, Spülwasser, Thermometer und freigegebene Entsorgung stehen bereit. Gerät nach Anleitung kalibrieren/prüfen, Probe quantitativ überführen und konstante Messbedingungen sowie Anfangsstand dokumentieren. Unter kontrolliertem Rühren höchstens2mL fern vom Sprung, höchstens0,2mL im zunächst erwarteten Bereich20–27mL und höchstens0,05mL um den tatsächlich eingegrenzten Sprung zugeben; reale Beobachtungen bestimmen die Anpassung. Nach Stabilisierung jeweils kumulatives Volumen, pH, Temperatur und Auffälligkeiten unmittelbar selbst notieren. In den freigegebenen eindeutigen Nachäquivalenzbereich arbeiten, beispielsweise bis30mL; beobachteten Indikatorendpunkt gesondert festhalten. Keine Sollwerttabelle, keine Bildpunkte als eigene Werte. Aufsicht dokumentiert die tatsächlich selbst ausgeführten Kernhandlungen; fehlen Ausstattung, Freigabe oder geeignete tatsächliche Messungen, bleibt die Durchführung offen. Die eigene digitale Datei und die Begründung der stöchiometrischen Konzentration/Unsicherheit folgen aus genau dieser Rohquelle. Dieser konkrete pH-Meter-Fall ist eine gewählte Operationalisierung, keine aus dem Wort digital abgeleitete universelle Sensor-, Export- oder Loggingpflicht.',
 'Complete strong-acid author route derived from existing PRACTICAL-PH-CURVES-P1, without its weak acid or halfpoint: only in a supervised subject room after the school risk assessment and specific local release. The teacher supplies ready-to-use 25.00mL HCl near0.050mol/L, standardised0.0500mol/L NaOH and the indicator justified in the plan; learners do not dilute concentrates. Provide locally required eye/clothing protection, a volumetric pipette/filler, secured50mL burette, suitable beaker, stirrer, pH meter/electrode, pH4/7/10 calibration buffers with temperature information, rinse water, thermometer and approved waste handling. Calibrate/check as instructed, transfer the sample quantitatively and record constant conditions/initial reading. Under controlled stirring add at most2mL away from the jump,0.2mL in the initially expected20–27mL region and0.05mL around the actually located jump, adapting to real observations. After stable readings personally record cumulative volume,pH,temperature and deviations immediately. Continue into locally released clear excess, for example30mL, separately recording the indicator endpoint. No target table or pictured points may replace own readings. Supervision records actual personal core actions; absent equipment,release or suitable measurements leaves execution open. Derive the digital file and stoichiometric concentration/uncertainty from that same raw source. This selected pH-meter case does not turn digital into a universal sensor,export or logging requirement.')
dig['expectedReasoning']['de'] = dig['expectedReasoning']['de'].replace('dafür bleibt der bisherige eigene praktische Beleg erforderlich', 'dafür ist der eigene praktische Beleg dieses neuen Zielkandidaten erforderlich')
dig['expectedReasoning']['en'] = dig['expectedReasoning']['en'].replace('the existing practical evidence remains required', 'the practical evidence for this new goal candidate remains required')
thermo = {
 'materialId': 'cc803809-own-released-redox-thermometry',
 'goalIds': [IDS['cc803809']], 'sourceOrdinals': [],
 'scope': bilingual(
 'Verbindliche positive Durchführungsevidenz für das bereits unveränderte ganze thermometrische Ziel cc803809 in dessen tatsächlichem bestehendem Geltungsbereich DE-BB/BE/BY/HE. Keine neue HB-Zuordnung, kein neuer amtlicher Quellenabschluss und kein neues Ziel. Die zwei bisherigen Modellfälle und ihre beiden Transfers bleiben vollständig erhalten.',
 'Binding positive execution evidence for the unchanged whole thermometric goal cc803809 within its actual existing DE-BB/BE/BY/HE scope. No new HB assignment, official whole-source completion or new goal. Both original model cases and both transfers remain fully binding.'),
 'givens': bilingual(
 'Der vorhandene Fall eqrk16-02-a liefert Reaktionssystem und Rechenmodell, jedoch keine eigenen Messungen. Für diesen zusätzlichen realen Untersuchungspfad stellt die Lehrkraft nach aktueller schulischer Gefährdungsbeurteilung und konkreter lokaler Freigabe im beaufsichtigten Fachraum eine gebrauchsfertige kleine CuSO4-Probe, definiertes geeignetes Zinkgranulat, offenes isoliertes Messgefäß mit Spritzschutz, Rührer, Temperaturfühler mit Zeitbezug, geeignete Volumen-/Massenmessung und getrennte Schwermetallabfallsammlung bereit. Als an das vorhandene Modell anschließende, vor Ort zu prüfende Auslegung sind 20,0mL einer 0,200mol/L-CuSO4-Lösung und ein von der Lehrkraft festgelegter kleiner Zinküberschuss vorgesehen. Mengen, Konzentration, Metallform, zulässige Temperatur, Messdauer und Aufbau müssen vor Ort freigegeben sein; ohne passende Freigabe wird nicht durchgeführt. Die Lehrkraft stellt/verdünnt sämtliche Lösungen und liefert die für diesen Aufbau tatsächlich bestimmte oder begründet geschätzte effektive Wärmekapazität samt Herkunft und Unsicherheit. Die früheren 15,0J/K Gefäßwärmekapazität, 29,0°C und 887,4J sind ausschließlich Modellwerte und dürfen nicht als echte Kalibrierung oder Rohwerte übernommen werden. Schutzbrille und weitere lokale Schutzmaßnahmen, kein Pulver/keine Flamme/kein verschlossenes Reaktionsgefäß, Suspension nicht berühren, keine Metallsalzlösung selbst ansetzen, keine Heimdurchführung, keine Entsorgung in den Ausguss. Diese Aufgabenbeschreibung ersetzt weder Gefährdungsbeurteilung noch Schullabor-SOP.',
 'Existing case eqrk16-02-a supplies the reaction and calculation model, not personal readings. For this additional real investigation, after the current school risk assessment and specific local release in the supervised subject room, the teacher supplies a ready-to-use small CuSO4 sample, defined suitable zinc granules, an open insulated measuring vessel with splash protection, stirrer, time-referenced temperature probe, suitable volume/mass measurement and separate heavy-metal waste collection. A locally checked design corresponding to the existing model uses20.0mL of0.200mol/L CuSO4 and a small zinc excess specified by the teacher. Quantities, concentration, metal form, permitted temperature, measurement duration and setup require local release; without it no experiment is performed. The teacher prepares/dilutes all solutions and supplies the effective heat capacity actually determined or justifiably estimated for this setup, with origin and uncertainty. The former15.0J/K vessel capacity,29.0°C and887.4J are model values only and must not be passed off as real calibration or readings. Use goggles and further local protection; no powder,flame or sealed reaction vessel, no touching suspension, learner preparation of metal-salt solutions, home execution or drain disposal. This task does not replace risk assessment or the school laboratory SOP.'),
 'learnerTask': bilingual(
 'Plane die freigegebene eigene Untersuchung der Reaktion Zn+Cu2+→Zn2++Cu: formuliere Elektronenbilanz, Systemgrenze, kontrollierte Größen, Zeitpunkt der Zugabe und einen nicht reagierenden Kontrollansatz zur Beurteilung von Drift/Mischwärme. Begründe Messintervall und notwendige Messdauer anhand der Reaktions-/Sensorzeit; es müssen mehrere echte Werte vor Zugabe und eine ausreichend aufgelöste Anstiegs- und Nachphase entstehen. Führe die dir freigegebenen Kernhandlungen selbst unter Aufsicht aus: Probenübernahme und Anfangsbedingungen prüfen, Temperaturfühler/Rührbedingungen kontrollieren, reale Zeit-Temperatur-Werte vor Zugabe erfassen, freigegebenes Zink zu dokumentiertem Zeitpunkt zugeben und Verlauf/Beobachtungen danach selbst erheben. Dokumentiere unverändert die Rohwerte t mit Einheit und T mit Einheit, Zugabezeit, tatsächlich eingesetzte Mengen, Geräteauflösung, Kalibrier-/Wärmekapazitätsquelle, Rühr-/Isolationsbedingungen, Beobachtungen und eigenen Handlungsanteil. Eine einzelne Endtemperatur, eine Solltabelle oder ein fremder Datensatz genügen für eigene Durchführung nicht. Werte genau deine Rohreihe als T(t) aus; begründe den Anfangswert und die gewählte Temperaturänderung einschließlich einer begrenzt tragfähigen Verlustkorrektur. Berechne mit der tatsächlichen effektiven Wärmekapazität q(Umgebung), q(Reaktion) und, soweit der Umsatz begründet ist, eine scheinbare molare Wärme mit Einheiten und Systemvorzeichen. Unterscheide Messbefund, Wärmeverlust, Unsicherheit des Umsatzes und bloße Annahmen. Sind Verlauf, Freigabe oder eigene Kernhandlungen nicht belegt, benenne die Lücke und lasse die praktische Erwartung offen. Eine korrekte Auswertung der alten Modellfälle ersetzt sie nicht.',
 'Plan the released personal investigation of Zn+Cu2+→Zn2++Cu: state electron balance, system boundary, controlled variables, addition time and a nonreacting control for drift/mixing heat. Justify sampling interval and duration from reaction/probe response, obtaining several real pre-addition readings and a sufficiently resolved rising and subsequent phase. Personally perform the released core actions under supervision: check sample and initial conditions, probe/stirring conditions, acquire real pre-addition time/temperature readings, add the released zinc at a recorded time and personally collect subsequent readings/observations. Preserve raw t and T with units, addition time, actual quantities, instrument resolution, calibration/heat-capacity origin, stirring/insulation, observations and your own actions. One final temperature, target table or another person’s dataset cannot demonstrate personal execution. Plot your actual T(t) and justify initial temperature and selected change, including any limited loss correction. Use the actual effective heat capacity to calculate surroundings heat, reaction heat and, where conversion is justified, apparent molar heat with units and system signs. Distinguish observation, heat loss, conversion uncertainty and assumptions. Missing trace,release or personal core actions leaves the practical expectation open; correct arithmetic on the old models does not replace it.'),
 'modelSolution': bilingual(
 'Die Auswertung muss auf der erst zu erhebenden eigenen Rohreihe beruhen; hier gibt es keine vorgegebenen realen Temperaturen oder einen verbindlichen Ergebniswert. Zn wird zu Zn2+ oxidiert, Cu2+ zu Cu reduziert; mögliche Kupferabscheidung/Farbänderung sind echte Beobachtungen nur, wenn tatsächlich protokolliert. ΔT ist die begründet ausgewählte Differenz mit Einheit K bzw. °C; eine Differenz hat in beiden Einheiten denselben Zahlenwert. Für die benannte Bilanzgrenze gilt näherungsweise q(Umgebung)=Ceff·ΔT, q(Reaktion)≈−q(Umgebung), unter Erfassung oder begründeter Vernachlässigung von Metall-/Gefäßbeiträgen und Wärmeverlusten. Ceff ist eine Wärmekapazität in J/K, nicht die spezifische Wärmekapazität in J/(gK). Bei tatsächlich umgesetzten n mol wird q(Reaktion)/n in J/mol bzw. kJ/mol angegeben; n darf nicht allein aus dem Temperaturanstieg erfunden werden. Vollständiger Cu2+-Umsatz ist eine zu begründende Annahme oder mit geeigneter unabhängiger Kontrolle zu prüfen; ohne Umsatzbeleg bleibt eine scheinbare bzw. begrenzte Aussage. ΔH-Bezeichnung setzt geeignete Druck-/Arbeitsbedingungen und die beschriebenen Näherungen voraus; Wärme ist keine Aktivierungsenergie. Auflösung, Kalibrierung, Extrapolation, unvollständiger Umsatz, blank und Verluste begrenzen das Ergebnis. Fehlende eigene Daten oder nicht durchgeführte Schritte werden ehrlich als offen dokumentiert. Betreute reale Durchführung ist Lernnachweis, kein Sicherheitszertifikat.',
 'Evaluation must use the personal raw trace still to be acquired; no real temperatures or required numerical answer are supplied here. Zn is oxidised to Zn2+ and Cu2+ reduced to Cu; copper deposition/fading are actual observations only if recorded. The justified temperature difference has units K or degreesC, with the same numerical difference. For the stated boundary, approximately q(surroundings)=Ceff·ΔT and q(reaction)≈−q(surroundings), accounting for or justifiably neglecting metal/vessel terms and losses. Ceff is heat capacity in J/K, not specific heat capacity in J/(gK). Divide reaction heat by justified converted amount n for J/mol or kJ/mol; do not invent n from a temperature rise alone. Complete Cu2+ conversion is a justified assumption or checked independently; without conversion evidence the claim remains apparent or bounded. Labelling it ΔH requires suitable pressure/work conditions and the stated approximations; heat is not activation energy. Resolution,calibration,extrapolation,incomplete conversion,blank and losses limit the result. Missing own data or unperformed actions remain explicitly open. Supervised performance is learning evidence, not a safety certificate.'),
 'freshTransfer': {
  'task': bilingual(
  'Unabhängige neue Datenprüfung, ausdrücklich fremdes synthetisches Transfermodell und keine eigene Messung: Ein Export nennt t/ms und T/K mit Paaren (−30000;293,15),(0;293,16),(30000;295,10),(60000;294,90),(90000;294,75); Zugabe war bei0ms. Überführe Zeit und Temperatur korrekt nach s und °C, erläutere, ob ΔT durch K→°C verändert wird, und beurteile die Behauptung „30000ms sind30000s und die höchste gespeicherte Temperatur beweist die vollständig freigesetzte Reaktionswärme“. Welche Aussage bleibt wegen des nicht aufgelösten Anstiegs/Verlusts offen? Beziehe deine Schlussfolgerung auf den selbst erhobenen Verlauf. Die bisherigen galvanische-Arbeit- und Qv/ΔH-Transfers bleiben zusätzlich im alten ganzen P erhalten; diese neue Prüfvariation erzwingt keinen zweiten realen Versuch.',
  'Independent fresh data audit, explicitly another person’s synthetic transfer model rather than own measurement: an export labels t/ms and T/K with pairs(−30000;293.15),(0;293.16),(30000;295.10),(60000;294.90),(90000;294.75); addition occurred at0ms. Correctly convert time/temperature to s and degreesC, explain whether K→degreesC changes ΔT and assess “30000ms means30000s and the largest saved temperature proves all reaction heat”. What remains unresolved because rise/losses were not resolved? Relate this to your own acquired trace. Original galvanic-work and Qv/ΔH transfers remain in the old whole P; this new variation does not force a second physical experiment.'),
  'expected': bilingual(
  'Die Zeiten sind−30,0,30,60,90s, Temperaturen20,00;20,01;21,95;21,75;21,60°C. Temperaturdifferenzen bleiben gleich; ein Zeitfaktor1000 und ein Temperatur-Offset dürfen nicht verwechselt werden. Die höchste gespeicherte Temperatur ist wegen des30-s-Abstands und Wärmeverlusts kein gesicherter adiabatischer Peak bzw. vollständiger Reaktionswärmebeleg. Keine fehlenden Werte erfinden oder aus diesem fremden Modell eigene Durchführung ableiten. Die eigene Abtastrate, Rohquelle und Verlust-/Umsatzgrenze sind unabhängig kritisch zu prüfen.',
  'Times are−30,0,30,60,90s and temperatures20.00,20.01,21.95,21.75,21.60degreesC. Temperature differences stay equal; distinguish a time factor1000 from a temperature offset. The largest stored temperature is not a secure adiabatic peak or total reaction-heat measurement because sampling is30s apart and heat escapes. Invent no missing values and claim no personal execution from this external model. Independently audit your actual sampling,raw source and loss/conversion limits.')},
 'criterionToObservableRubric': [
  {'criterionId': 'e4-own-thermometric-execution',
   'observable': bilingual('Eigene freigegebene Kernhandlungen und unveränderte Temperatur-Zeit-Rohreihe einschließlich Vor-/Anstiegs-/Nachphase, Mengen/Einheiten, Geräte- und Ceff-Herkunft sind prüfbar belegt; fremde Modelle sind getrennt.', 'Checkable personal released core actions and unaltered pre/rising/post temperature/time trace, quantities/units, instrument and Ceff origin; external models kept separate.'),
   'criticalBoundary': bilingual('Fehlende echte Rohwerte oder nur Zukunftsplan halten e4 offen, auch bei korrektem Modellrechnen; lokales Sicherheitsrecht wird nicht durch den Nachweis ersetzt.', 'Missing real raw readings or a future plan alone leaves e4 open even with correct model arithmetic; evidence does not replace local safety authorisation.')},
  {'criterionId': 'e1-e3-retained-in-new-application',
   'observable': bilingual('Elektronenbilanz, begrenzte Wärme-/Umsatzbilanz mit Einheiten/Vorzeichen, Unsicherheiten und unabhängige neue Datenprüfung werden am tatsächlichen Befund erklärt. Alle alten e1–e3 und Fälle bleiben erhalten.', 'Explain electron balance,bounded heat/conversion balance with units/signs,uncertainty and independent new data audit using the actual observations. All original e1–e3 and cases remain binding.')}],
 'rubric': bilingual(
 'Positiver Mindestbeleg für e4: belegte eigene Kernhandlungen plus tatsächliche Temperatur-Zeit-Rohreihe und nachvollziehbare eigene Auswertung; realistische Grenzen und frische Daten-/Einheitenprüfung. Rechenmodell, Aufsichtsschein oder Leistungserklärung ohne Daten/Handlungsbeleg genügt nicht. Die bereits erforderliche Evidenzvielfalt bleibt, ohne starre zusätzliche Zahl realer Versuche.',
 'Positive minimum for e4: evidenced personal core actions plus an actual raw temperature/time trace and traceable own analysis; realistic limits and a fresh data/unit audit. A calculation model,supervision slip or assertion without readings/actions is insufficient. Preserve existing evidence variety without a fixed extra number of physical trials.'),
 'provenance': 'Author successor reuses the exact chemical system, boundaries and modelling distinctions from eqrk16-02-a/b. No actual learner measurements, performed trial, school SOP approval or independent science acceptance is asserted.'}
materials = [industrial, tree, pla, classify, energy, dig, thermo]
MATERIAL_FILE = str((OUT / 'AUTHOR.complete-DE-EN-material-routes.pending.json').relative_to(R))
for mat in materials:
    mat['status'] = 'AUTHOR_PENDING_INDEPENDENT_REVIEW'
    mat['active'] = False
    mat['humanApproval'] = False
    mat['actualLearnerPerformanceRecorded'] = False
    mat['M7Claim'] = False
    mat['ownMaterialLicense'] = 'CC-BY-4.0'

def material_case(mat, index, id, focus):
    task = copy.deepcopy(mat['learnerTask'])
    for lang in ['de', 'en']:
        task[lang] = f"{MATERIAL_FILE}#/materials/{index}. " + task[lang]
    answer = mat.get('modelSolution', mat.get('expectedReasoning'))
    return case(id, task, answer, focus)

old = {k: copy.deepcopy(OWNERS[v]['record']['profile']) for k, v in IDS.items()}
proposed = {k: copy.deepcopy(v) for k, v in old.items()}

# Retain every original base expectation and case exactly; replace or move only the
# independently identified extra duty, with its complete evidence route preserved.
sugar = proposed['684ffe86']
sugar['expectations'][2] = exp('hb145-industrial-classes-properties', industrial['modelSolution']['de'], industrial['modelSolution']['en'], industrial['learnerTask']['de'], industrial['learnerTask']['en'])
sugar['coverageExpectations']['requiredExpectationIds'][2] = 'hb145-industrial-classes-properties'
sugar['applicationCaseBriefs'][2] = material_case(industrial, 0, 'hb145-industrial-classes-properties', bilingual('Strukturbezogene Rohstofffunktion, nicht Aldosenstammbaum.', 'Structure-based feedstock function, not an aldose tree.'))
pp = proposed['0278a515']
pp['expectations'] = pp['expectations'][:3]
pp['coverageExpectations']['requiredExpectationIds'] = pp['coverageExpectations']['requiredExpectationIds'][:3]
pp['applicationCaseBriefs'] = pp['applicationCaseBriefs'][:2]
pp['variationAxes'] = pp['variationAxes'][:3]
dc = proposed['d72cbb62']
dc['expectations'][4] = exp('hb217-origin-polyene-classification-only', classify['modelSolution']['de'], classify['modelSolution']['en'], classify['learnerTask']['de'], classify['learnerTask']['en'])
dc['coverageExpectations']['requiredExpectationIds'][4] = 'hb217-origin-polyene-classification-only'
dc['applicationCaseBriefs'][2] = material_case(classify, 3, 'hb217-origin-polyene-classification-only', bilingual('Herkunft/Struktur/Verwendung getrennt; Energielückenleistung unter 87d8.', 'Separate origin/structure/use; energy-gap performance belongs to 87d8.'))
ti = proposed['02634fdd']
ti['expectations'] = ti['expectations'][:4]
ti['coverageExpectations']['requiredExpectationIds'] = ti['coverageExpectations']['requiredExpectationIds'][:4]
ti['variationAxes'] = ti['variationAxes'][:4]
ti['applicationCaseBriefs'] = ti['applicationCaseBriefs'][:4]
assert ti['applicationCaseBriefs'][-1]['id'] != 'hb134-own-digital-strong-acid-curve-and-source-check'
proposed['87d8cc68']['applicationCaseBriefs'].append(material_case(energy, 4, 'hb215-polyene-energy-gap-transfer', bilingual('Weitere Anwendung derselben 87d8-Energiekompetenz; keine zusätzliche starre Aufgabenquote.', 'Another application of the same 87d8 energy competence; no extra fixed task quota.')))
thp = proposed['cc803809']
thp['expectations'].append(exp('e4-own-thermometric-execution',
 'Thermometrische Untersuchung setzt eigene freigegebene Durchführung, eine tatsächliche Temperatur-Zeit-Rohreihe mit prüfbarer Herkunft sowie deren begrenzte Wärme-/Umsatzauswertung voraus; Zukunftsplanung und bereitgestellte Zahlen sind dafür kein Ersatz.',
 'Thermometric inquiry requires personal released execution,an actual raw temperature/time trace of checkable origin and bounded heat/conversion analysis; a future plan and supplied numbers do not replace this.',
 thermo['rubric']['de'], thermo['rubric']['en']))
thp['coverageExpectations']['requiredExpectationIds'].append('e4-own-thermometric-execution')
thp['applicationCaseBriefs'].append(material_case(thermo, 6, 'cc803809-real-thermometry-and-raw-data', bilingual('Positive echte Durchführung plus eigene Rohdaten; alte Modellfälle/Transfers bleiben vollständig verpflichtend.', 'Positive actual execution plus own raw data; original model cases/transfers remain fully binding.')))
thp['variationAxes'].append({'id': 'thermometry-raw-origin-units-fresh-transfer', 'textDe': thermo['freshTransfer']['task']['de'], 'textEn': thermo['freshTransfer']['task']['en']})

def new_goal(key, title, title_en, de, en, requires, phase, area, source_ordinal):
    source_goal = src['sourceGoals'][source_ordinal - 1]
    return {'id': NEW[key], 'shortKey': 'canonical_chemistry_' + key.replace('-', '_'),
        'title': title, 'titleEn': title_en, 'description': de, 'descriptionEn': en,
        'weight': 1, 'tags': ['GK', 'LK', 'canonical', 'SekII'], 'contains': [],
        'requires': requires, 'dimensionTags': {'framework': 'canonical-gymnasium-chemistry',
            'demandLevel': 'AB2', 'phase': phase, 'area': area,
            'processCompetencies': ['PK1_EXPERIMENTIEREN'] if key != 'given-aldose-family-tree' else ['PK2_MODELLIEREN'],
            'guidingIdeas': ['BC_AUFBAU'] if key != 'own-strong-acid-digital-ph-titration' else ['BC_REAKTION']},
        'applicability': {'jurisdiction': ['DE-HB']}, 'type': 'atomic', 'examples': [], 'resourceLinks': [],
        'extendedData': {'applicabilityMappingInheritance': 'boundary', 'provenance': {
            'sourceLandscapeId': src['sourceLandscapeId'], 'sourceGoalId': source_goal['id'],
            'sourceRef': source_goal['sourceRef'], 'sourceClauseIds': source_goal.get('sourceClauseIds', [])},
            'authorCandidate': {'status': 'PENDING_TWO_OTHER_INDEPENDENT_REVIEWERS',
                'sourceOrdinals': [source_ordinal], 'noNativeApproval': True,
                'noObservedLearnerPerformance': True, 'noOfficialWholeCredit': True}}}

new_goals = [
new_goal('given-aldose-family-tree', 'Gegebene Aldosen im formalen Zuckerstammbaum ordnen', 'Organise supplied aldoses in a formal sugar family tree',
 'Die lernende Person kann gegebene Aldosen anhand ihrer Fischer-Projektionen in einem formalen Zuckerstammbaum ordnen, den dabei erhaltenen unteren Konfigurationsrest erläutern und D-/L-Zuordnung sowie C2-Epimerie an den betreffenden Stereozentren begründen, ohne daraus eine Biosynthesekette oder ein optisches Drehvorzeichen abzuleiten.',
 'The learner can organise supplied aldoses in a formal sugar family tree using their Fischer projections, explain the retained lower configuration pattern, and justify D/L assignment and C2 epimerism using the relevant stereocentres without inferring a biosynthetic sequence or optical-rotation sign.',
 [IDS['684ffe86']], 'GLOBAL', 'Kohlenhydrat-Stereochemie', 148),
new_goal('own-biobased-pla-property-investigation', 'Biobasierte PLA-Proben kontrolliert untersuchen', 'Investigate biobased PLA samples under controlled conditions',
 'Die lernende Person kann eine unter fachlicher Aufsicht freigegebene Eigenschaftsuntersuchung an identifizierten biobasierten PLA-Proben planen und selbst durchführen, tatsächliche Rohdaten mit Einheiten und Unsicherheiten dokumentieren und aus dem kontrollierten Vergleich begrenzte Eigenschaftsaussagen ableiten, wobei Geometrie, Konditionierung und Zusammensetzung als mögliche Einflussgrößen sowie Rohstoffherkunft und biologischer Abbau unterschieden werden.',
 'The learner can plan and personally perform a property investigation of identified biobased PLA samples released under qualified supervision, record actual raw data with units and uncertainty, and derive bounded property conclusions from the controlled comparison while distinguishing geometry, conditioning and composition as possible influences and feedstock origin from biodegradation.',
 [G['13d4f336']], 'E', 'Experimentelle Kunststoffuntersuchung', 97),
new_goal('own-strong-acid-digital-ph-titration', 'Starke Säuren mittels eigener digitaler pH-Titration bestimmen', 'Determine strong-acid concentration through a personal digital pH titration',
 'Die lernende Person kann eine quantitative Titration einer starken einprotonigen Säure mit begründeter Maßlösung planen und unter fachlicher Aufsicht selbst durchführen, zugehörige eigene Volumen- und pH-Messwerte mit geeigneter pH-Erfassung dokumentieren, diese mit digitalen Werkzeugen als numerische XY-Titrationskurve darstellen und daraus die Probenkonzentration stöchiometrisch bestimmen sowie Endpunktbeobachtung, Äquivalenzbereich und Messunsicherheit begründet unterscheiden.',
 'The learner can plan and personally perform a quantitative titration of a strong monoprotic acid under qualified supervision using a justified standard solution, record personal volume/pH readings with suitable pH measurement, present them as a numeric XY titration curve using digital tools, and determine sample concentration stoichiometrically while distinguishing observed endpoint, equivalence region and measurement uncertainty with reasons.',
 [G['1c1420c2'], G['1dc15fa2'], G['13d4f336']], 'GLOBAL', 'Protolysegleichgewichte', 134)]

tree_case = material_case(tree, 1, 'given-aldose-tree-initial', bilingual('Ein zusammenhängendes formales Konfigurationsmodell.', 'One connected formal configurational model.'))
tree_transfer = case('given-aldose-tree-fresh-transfer', tree['freshTransfer']['task'], tree['freshTransfer']['expected'], bilingual('Neue Muster unabhängig aus der Erweiterungsregel zuordnen.', 'Independently assign new patterns using the extension rule.'))
pla_case = material_case(pla, 2, 'actual-controlled-pla-investigation', bilingual('Eigene tatsächliche Untersuchung und begrenzte Datenaussage.', 'Actual personal investigation and bounded interpretation.'))
pla_transfer = case('pla-confounder-fresh-transfer', pla['freshTransfer']['task'], pla['freshTransfer']['expected'], bilingual('Störgrößen sind eigenständig zu begründen; kein zusätzlicher realer Versuch allein wegen der Variation.', 'Explain confounders independently; the variation alone requires no extra physical trial.'))
dig_case = material_case(dig, 5, 'actual-strong-acid-digital-curve', bilingual('Eigener vollständiger quantitativer pH-/Digital-Untersuchungsablauf.', 'Personal complete quantitative pH/digital investigation.'))
dig_transfer = case('digital-volume-axis-fresh-transfer', dig['freshTransfer']['task'], dig['freshTransfer']['expected'], bilingual('Neue überprüfbare Datei-/Koordinatenkorrektur mit Mengenbezug.', 'Fresh checkable file/coordinate correction with concentration reference.'))
new_profiles = [
profile('representation', [
 exp('formal-pattern-and-configuration', tree['modelSolution']['de'], tree['modelSolution']['en'], tree['learnerTask']['de'], tree['learnerTask']['en']),
 exp('new-pattern-transfer-and-limit', tree['freshTransfer']['expected']['de'], tree['freshTransfer']['expected']['en'], tree['freshTransfer']['task']['de'], tree['freshTransfer']['task']['en'])],
 [tree_case, tree_transfer], [('new-aldose-pattern', bilingual('Neue OH-Folge bei erhaltener formaler Regel; D/L, Epimerie und Biosynthese unterscheiden.', 'New OH pattern under the same formal rule; distinguish D/L, epimerism and biosynthesis.'))]),
profile('experiment', [
 exp('plan-and-real-execution', 'Kontrollierter Versuchsplan, reale Freigabe und eigene beobachtbare Durchführung; keine Musterdaten ersetzen Rohdaten.', 'Controlled plan, actual release and observable own execution; model data never replace raw readings.', pla['learnerTask']['de'], pla['learnerTask']['en']),
 exp('data-and-bounded-property', pla['modelSolution']['de'], pla['modelSolution']['en']),
 exp('independent-confounder-transfer', pla['freshTransfer']['expected']['de'], pla['freshTransfer']['expected']['en'], pla['freshTransfer']['task']['de'], pla['freshTransfer']['task']['en'])],
 [pla_case, pla_transfer], [('conditioning-geometry-composition', pla['freshTransfer']['task'])]),
profile('experiment', [
 exp('plan-own-quantitative-execution', 'Eigene Planung und Durchführung mit geeigneter Maßlösung, geeignet erfassten pH-Werten und prüfbarer Rohquelle sind nötig; Planung oder Sollkurve allein genügt nicht.', 'Personal planning and execution with a suitable standard solution, suitable pH readings and a checkable raw source are required; a plan or ideal curve alone is insufficient.', dig['givens']['de'], dig['givens']['en']),
 exp('digital-xy-amount-and-uncertainty', dig['expectedReasoning']['de'], dig['expectedReasoning']['en'], dig['learnerTask']['de'], dig['learnerTask']['en']),
 exp('independent-digital-source-correction', dig['freshTransfer']['expected']['de'], dig['freshTransfer']['expected']['en'], dig['freshTransfer']['task']['de'], dig['freshTransfer']['task']['en'])],
 [dig_case, dig_transfer], [('raw-origin-and-real-volume-axis', dig['freshTransfer']['task'])])]

material_pin = dump('AUTHOR.complete-DE-EN-material-routes.pending.json', {
 'artifactType': 'Complete pending routed bilingual cases; no learner work or approvals',
 'materials': materials,
 'originalWholeSourceMaterials': [
     {'source': pin(BIO_PATH), 'pointer': '/cases/0', 'wholeCaseObjectSHA256': objsha(bio)},
     {'source': pin(PLA_PATH), 'pointer': '', 'wholeCaseObjectSHA256': objsha(read(PLA_PATH))},
     {'source': pin(DYE_PATH), 'pointer': '', 'wholeCaseObjectSHA256': objsha(read(DYE_PATH))},
     {'source': pin(DIG_PATH), 'pointer': '', 'wholeCaseObjectSHA256': objsha(read(DIG_PATH))},
     {'source': pin(PRACTICAL_PATH), 'pointer': '/cases/6', 'wholeCaseObjectSHA256': objsha(read(PRACTICAL_PATH)['cases'][6]),
      'selectedRole': 'Only the actually read complete strong-acid procedural component; weak acid and halfpoint are explicitly excluded from the new GK/LK candidate.'},
     *[{'source': pin(REDOX_PATH), 'pointer': '/cases/' + str(i + 2), 'wholeCaseObjectSHA256': objsha(c),
        'selectedRole': 'Whole original model case remains binding and is not represented as actual execution. The actual practical successor adds a separate positive criterion.'} for i,c in enumerate(redox_originals)]],
 'partitionBoundary': 'Shared givens may be read by both target routes; only the explicitly selected route task/rubric is a completion condition. Historical combined tasks are not silently still binding on a donor goal.',
 'noAdditionalFixedTaskQuota': True, 'actualLearnerPerformance': False, 'humanApproval': False})

existing = []
def changed_pointers(before, after, pointer=''):
    if type(before) is not type(after):
        return [pointer]
    if isinstance(before, dict):
        return [q for k in sorted(set(before) | set(after)) for q in
            ([pointer + '/' + k] if k not in before or k not in after else
             changed_pointers(before[k], after[k], pointer + '/' + k))]
    if isinstance(before, list):
        return [q for i in range(max(len(before), len(after))) for q in
            ([pointer + '/' + str(i)] if i >= len(before) or i >= len(after) else
             changed_pointers(before[i], after[i], pointer + '/' + str(i)))]
    return [] if before == after else [pointer]

for key in ['684ffe86', '0278a515', 'd72cbb62', '02634fdd', '87d8cc68', 'cc803809']:
    gid = IDS[key]
    base, prop = old[key], proposed[key]
    existing.append({'goalId': gid, 'wholeCurrentGoal': BY[gid], 'canonicalPointer': '/goals/' + str(C['goals'].index(BY[gid])),
        'goalBodyChanges': [], 'wholeCurrentProfile': base, 'wholeProposedProfile': prop,
        'actualOwner': {k: v for k, v in OWNERS[gid].items() if k != 'record'},
        'exactChangedProfilePointers': changed_pointers(base, prop, '/profile'),
        'profileBeforeObjectSHA256': objsha(base), 'profileAfterObjectSHA256': objsha(prop),
        'candidateOnly': True, 'nativeRecordWriterExecuted': False})

def image_option(goal_prefix, why, limitations):
    gid = G[goal_prefix]
    link = next(l for l in BY[gid].get('resourceLinks', []) if l['type'] == 'goal-visualization')
    path = Path('curricula/DE/Gymnasium/visualizations/chemie') / gid / Path(link['url']).name
    return {'sourceGoalId': gid, 'asset': pin(path), 'actualAuthorNativeView': True,
        'proposal': 'KEEP_EXISTING_BYTES_AS_DIDACTIC_SUPPORT_OPTION_ONLY', 'why': why,
        'limits': limitations, 'newGoalVBindingApproved': False, 'resourceLinksInstalled': False}

new_records = []
for i, (goal, prof) in enumerate(zip(new_goals, new_profiles)):
    option = [image_option('dfaef897', 'Correct given D-glucose Fischer pattern with labelled C2–C5 supports the configuration convention.', 'Does not itself show a whole tree; right Haworth panel is contextual, not a new ring obligation.'),
              image_option('0278a515', 'Existing PLA unit/feedstock image supports identification and distinguishes feedstock origin from environment-dependent degradation.', 'Contains no bending setup, raw data or practical proof; new practical-context V review remains pending.'),
              image_option('02634fdd', 'Existing actual HCl/NaOH setup supports the same strong-acid titration and endpoint-documentation context.', 'It is an indicator illustration, not a pH sensor or data source; weak-acid e094/28c images were inspected and rejected as the primary strong-only reuse option.')][i]
    new_records.append({'goalId': goal['id'], 'wholeGoalCandidate': goal, 'wholeProfileCandidate': prof,
        'candidateSemanticKind': 'curricularAtomic', 'authorAtomicityRationale': [
            'One supplied-pattern stereochemical classification with a fresh application, not a combined industrial/biological competency.',
            'Planning, controlled execution, own data and limitations are stages of one property investigation, not synthesis-description mastery.',
            'Planning, own pH acquisition, digital representation and stoichiometric concentration evaluation form one quantitative titration workflow; no LK weak-acid/halfpoint extension.'][i],
        'memoryProposal': {'status': 'no_memory_needed', 'memoryUseful': False, 'nativeDecision': False,
            'reason': 'The competence is acquired through model-based reconstruction or actual experimental/data reasoning. Necessary conventions/givens are supplied; no new standalone card quota is justified.'},
        'visualizationReuseOption': option,
        'scope': {'jurisdiction': 'DE-HB', 'stage': 'SekII', 'courses': ['GK', 'LK'],
            'officialTopicStatus': 'selected_topic_requirement' if i == 0 else 'mandatory_introductory_phase' if i == 1 else 'mandatory_all_Q_courses_topic',
            'topic': '2.1' if i == 0 else 'E-KUNSTSTOFFE' if i == 1 else '1.2',
            'actualLearnerTopicChoiceClaimed': False,
            'qualification': 'Own explicit operationalisation of selected-topic term/stereochemistry; no literal universal full-tree command.' if i == 0 else 'Actual generic biobased-plastic investigation is official; PLA and bending route are this explicit selected operationalisation.' if i == 1 else 'Common GK/LK quantitative pH/digital investigation; a strong-acid route does not import the independent full LK e094 duty.'},
        'allScientificAndNativeApprovalsPending': True})

# Preserve entire current source unions as read inputs. Only explicitly specified
# carrier changes are candidates; no source review vote or activation is created.
source_rows = []
ordinals = [17, 95, 96, 97, 127, 134, 145, 146, 148, 214, 215, 216, 217]
for ordinal in ordinals:
    decision = mapping['decisions'][ordinal - 1]
    sg = next(g for g in src['sourceGoals'] if g['id'] == decision['sourceGoalId'])
    current = list(decision['canonicalGoalIds'])
    after = list(current)
    why = 'Whole source union retained; changed donor profiles preserve their own matching conceptual/quantitative contribution.'
    if ordinal == 97:
        after = [NEW['own-biobased-pla-property-investigation']]
        why = 'Real investigation is moved intact from the descriptive 0278 profile to an expressly practical candidate.'
    if ordinal in [127, 134]:
        after = list(dict.fromkeys(current + [NEW['own-strong-acid-digital-ph-titration']]))
        why = 'The new whole strong-acid pH/digital candidate preserves the real GK/LK operator. 02634 contributes indicator planning/conduct/quantification only; e094, where already present, remains its actual LK strong+weak+halfpoint contribution. No singleton 02634 whole-digital completion survives.'
    if ordinal == 148:
        after = list(dict.fromkeys(current + [NEW['given-aldose-family-tree']]))
        why = 'Retain the existing stereochemical whole union and add the explicit narrow supplied-tree operationalisation/mandatory-term evidence as a partial contribution. No source145 biological-formation credit is assigned to the tree.'
    carriers = []
    for gid in current:
        carriers.append({'goalId': gid, 'canonicalPointer': '/goals/' + str(C['goals'].index(BY[gid])),
            'wholeGoalObjectSHA256': objsha(BY[gid]), 'wholeCurrentProfile': {k: v for k, v in OWNERS.get(gid, {}).items() if k != 'record'}})
    source_rows.append({'ordinal': ordinal, 'wholeCurrentSourceGoal': sg,
        'sourceGoalPointer': '/sourceGoals/' + str(src['sourceGoals'].index(sg)),
        'currentWholeDecision': decision, 'mappingDecisionPointer': '/decisions/' + str(ordinal - 1),
        'wholeCurrentCarrierIds': current, 'wholeProposedPartialCarrierUnion': after,
        'currentCarrierWholeReferences': carriers, 'reasonForCandidate': why,
        'sourceScopeAndCourseUnchanged': decision.get('sourceScopeExact'),
        'newWholeSourceJudgment': False, 'singleGoalMasteryClosesWholeUnion': False,
        'normalActivation': False, 'wholeUnionIndependentReviewPending': True})

findings = []
for p in sorted(p for batch in ['003','005','006','007','008'] for p in (R / O / 'D-final-native' / ('batch-' + batch)).glob('round-*/results/*.records.jsonl')):
    for line, text in enumerate(p.read_text().splitlines(), 1):
        rec = json.loads(text)
        if rec.get('goalId') in [IDS[k] for k in ['684ffe86', '0278a515', 'd72cbb62', '02634fdd', 'cc803809']]:
            findings.append({'file': pin(p), 'lineOneBased': line, 'wholeRecordObjectSHA256': objsha(rec),
                'goalId': rec['goalId'], 'decision': rec['decision'],
                'evidenceProfileRecommendation': rec.get('evidenceProfileRecommendation'), 'rationale': rec['rationale']})
assert len(findings) == 10
assert all(r['evidenceProfileRecommendation'] == 'revise' for r in findings)

retention = {
 '684-original-two-expectations': proposed['684ffe86']['expectations'][:2] == old['684ffe86']['expectations'][:2],
 '684-original-two-cases': proposed['684ffe86']['applicationCaseBriefs'][:2] == old['684ffe86']['applicationCaseBriefs'][:2],
 '0278-original-three-expectations': proposed['0278a515']['expectations'] == old['0278a515']['expectations'][:3],
 '0278-original-two-cases': proposed['0278a515']['applicationCaseBriefs'] == old['0278a515']['applicationCaseBriefs'][:2],
 'd72-original-four-expectations': proposed['d72cbb62']['expectations'][:4] == old['d72cbb62']['expectations'][:4],
 'd72-original-two-cases': proposed['d72cbb62']['applicationCaseBriefs'][:2] == old['d72cbb62']['applicationCaseBriefs'][:2],
 '02634-original-four-expectations': proposed['02634fdd']['expectations'] == old['02634fdd']['expectations'][:4],
 '02634-original-four-cases': proposed['02634fdd']['applicationCaseBriefs'] == old['02634fdd']['applicationCaseBriefs'][:4],
 '87-original-whole-body-prefix': all(proposed['87d8cc68'][k] == old['87d8cc68'][k] for k in ['archetype','expectations','coverageExpectations','variationAxes']) and proposed['87d8cc68']['applicationCaseBriefs'][:3] == old['87d8cc68']['applicationCaseBriefs'],
 'cc803-original-three-expectations': proposed['cc803809']['expectations'][:3] == old['cc803809']['expectations'],
 'cc803-original-two-whole-cases': proposed['cc803809']['applicationCaseBriefs'][:2] == old['cc803809']['applicationCaseBriefs'],
 'cc803-original-two-transfer-axes': proposed['cc803809']['variationAxes'][:2] == old['cc803809']['variationAxes'],
 'cc803-original-coverage-preserved-with-positive-criterion': proposed['cc803809']['coverageExpectations']['requiredExpectationIds'][:3] == old['cc803809']['coverageExpectations']['requiredExpectationIds'] and all(proposed['cc803809']['coverageExpectations'][k] == v for k,v in old['cc803809']['coverageExpectations'].items() if k != 'requiredExpectationIds'),
 'existing-goal-descriptions-changed': False}
assert all(v for k, v in retention.items() if k != 'existing-goal-descriptions-changed')

output = {
 'artifactType': 'Finite author remediation for five current P operator-scope/performance findings; no acceptance or activation',
 'createdAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'status': 'AUTHOR_PENDING_TWO_OTHER_INDEPENDENT_REVIEWERS',
 'authorRoleDisclosure': 'This is author work informed by the actual newly sealed D findings. The author previously worked on HB232 source-union review/technical selection and reviewed the HB134 whole-P/source proposal; that earlier FIRST is preserved and is not treated as acceptance of this remedy. This is neither a new independent vote nor a blind review.',
 'inputs': {'canonical': pin(C_PATH), 'semanticKinds': pin(SEM_PATH), 'normalRegistry': pin(REG), 'sourceExtraction': pin(SOURCE), 'sourceMapping': pin(MAP), 'currentP442WriterInput': pin(O / 'P442-plan/P442.actual-selected-whole-profile-writer-input.jsonl')},
 'fiveIssues': [
  {'goalId': IDS['684ffe86'], 'finding': 'Class/property D does not own obligatory complete aldose tree/C2-epimer performance.', 'remedy': 'Keep industrial structure/property reasoning at684; move the complete formal-tree performance to the narrow candidate, with shared original givens.'},
  {'goalId': IDS['0278a515'], 'finding': 'Describe synthesis/properties/use does not own actual PLA property investigation.', 'remedy': 'Retain the whole old conceptual profile; move the entire real experiment and confounder transfer to the new practical candidate, preserving official HB97.'},
  {'goalId': IDS['d72cbb62'], 'finding': 'Classification D does not own energy-gap/absorption-change explanation.', 'remedy': 'Retain complete classification/origin/polyene evidence; move the energy/absorption task and transfer to existing87d8 as another application of its unchanged full competence.'},
  {'goalId': IDS['02634fdd'], 'finding': 'Indicator titration D does not own actual pH series/digital XY-file closure.', 'remedy': 'Retain four original whole indicator/concentration expectations and four cases. Move the full strong-acid practical/digital material to an expressly matching GK/LK candidate; do not widen e094 LK.'},
  {'goalId': IDS['cc803809'], 'finding': 'D already owns actual thermometric investigation, but the whole current profile only positively requires model planning/calculation and distinguishing a future experiment from supplied models.', 'remedy': 'Append binding e4 own thermometric execution and a complete practical/raw-data/evaluation case with fresh unit/provenance transfer. Preserve all original expectations, two model cases, both old transfers and coverage conditions exactly. No new goal or HB/source credit.'}],
 'actualFreshDRecords': findings,
 'existingWholeGoalAndProfileCandidates': existing,
 'newWholeGoalAndProfileCandidates': new_records,
 'existingAlternativesActuallyReadAndPreserved': [
  {'goalId': IDS['dfaef897'], 'wholeGoalObjectSHA256': objsha(BY[IDS['dfaef897']]), 'wholeCurrentGoal': BY[IDS['dfaef897']], 'wholeProfileRef': {k:v for k,v in OWNERS[IDS['dfaef897']].items() if k != 'record'}, 'notStretchedBecause': 'Its current D explicitly names glucose/fructose, Fischer/Haworth, ring closure and anomerism. The full many-aldose tree and C2-epimer product is not silently added as a closure condition.'},
  {'goalId': IDS['e0944fbb'], 'wholeGoalObjectSHA256': objsha(BY[IDS['e0944fbb']]), 'wholeCurrentGoal': BY[IDS['e0944fbb']], 'wholeProfileRef': {k:v for k,v in OWNERS[IDS['e0944fbb']].items() if k != 'record'}, 'notStretchedBecause': 'The whole current D/P is LK, both strong and weak acid measurement plus experimental weak halfpoint. Assigning that whole goal to GK would force extra LK work; its old source routes stay unchanged.'}],
 'completeBilingualMaterials': material_pin,
 'sourceUnionCandidates': source_rows,
 'sourceTermAllocation': {'source': pin(SOURCE), 'termPointer': '/mandatoryTermSets/11/terms/6', 'term': 'Zuckerstammbaum', 'fromGoalId': IDS['684ffe86'], 'toCandidateGoalId': NEW['given-aldose-family-tree'], 'newUniversalOfficialDrawingDuty': False, 'source145IndustrialAndFormationUnionRetained': True},
 'officialActualReading': {'pdf': pin(src['sourceDocument']['path']), 'physicalPages': [19,23,26,34,35,37], 'textCopiedToPackage': False, 'scope': 'Introductory E mandatory versus common Q1.2 and selected topics2.1/4.2, with HB37 course choices preserved.'},
 'retentionChecks': retention,
 'counts': {'originalIssueGoals': 5, 'unchangedCurrentGoalBodies': 8, 'existingProfileSuccessorCandidates': 6, 'newAtomicGoalCandidates': 3, 'fullRoutedBilingualMaterials': 7, 'normalFilesChanged': 0, 'nativeApprovals': 0},
 'remainingGates': ['Two other independent whole D/P/A/source/material reviews of these author candidates', 'Actual source/GK-LK/stage/view admission for the exact selected unions', 'New candidates M/V choices and actual native bindings', 'One coherent root final integration and genuine final context/page decisions; no historical reviewer outputs rehashed'],
 'normalActivation': False, 'stockNativeRecordWriterExecuted': False, 'currentDenominatorClaim': 442,
 'candidateCountIsNotInstalledCount': True, 'M7Claim': False, 'humanApproval': False, 'humanTrial': False}
main_pin = dump('AUTHOR.five-current-P-scope-operator-remedies.pending.json', output)
receipt = dump('READ-AND-RETENTION.actual-bounded-author-receipt.json', {
 'inputs': output['inputs'], 'sourcePdf': output['officialActualReading'],
 'materialInputs': read((OUT / 'AUTHOR.complete-DE-EN-material-routes.pending.json').relative_to(R))['originalWholeSourceMaterials'],
 'wholeGoalIdsActuallyRead': list(IDS.values()),
 'additionalWholeDirectPrerequisiteGoalsRead': [{'goalId': gid, 'canonicalPointer': '/goals/' + str(C['goals'].index(BY[gid])), 'wholeGoalObjectSHA256': objsha(BY[gid])} for gid in BY[IDS['cc803809']]['requires']],
 'actualWholeProfilesRead': [{k:v for k,v in OWNERS[g].items() if k != 'record'} for g in IDS.values()],
 'retentionChecks': retention, 'newGoalIds': NEW, 'sourceOrdinalsRead': ordinals,
 'authorJudgmentOnly': True, 'schemaOrGateChecksExecuted': 0, 'normalWrites': 0,
 'currentCanonicalStillExact': pin(C_PATH) == output['inputs']['canonical'],
 'currentSemanticLedgerStillExact': pin(SEM_PATH) == output['inputs']['semanticKinds']})
print(json.dumps({'author': main_pin, 'materials': material_pin, 'readReceipt': receipt, 'newGoals': NEW, 'retention': retention}, ensure_ascii=False, indent=2))
