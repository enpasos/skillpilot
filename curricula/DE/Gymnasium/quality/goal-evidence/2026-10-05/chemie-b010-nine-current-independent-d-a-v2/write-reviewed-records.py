#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Serialize the nine independently reviewed decisions; never edit their inputs."""
import datetime
import hashlib
import json
import pathlib
import subprocess

OWN = pathlib.Path(__file__).resolve().parent
ROOT = OWN.parents[6]
PREPARED = OWN.parent / 'chemie-b010-five-prospective-current-candidate-v1'
ROUND = PREPARED / 'native-finalbook/round-a'
CAMPAIGN = json.loads((ROUND / 'description-review-campaign.json').read_text())
INPUT = json.loads((ROUND / 'description-review-input.json').read_text())
BUNDLE = json.loads((PREPARED / 'native-finalbook/bundle/manifest.json').read_text())
RUN_ID = 'chemie-b010-nine-independent-current-d-a-20261005-v2'

# These are the reviewer's own judgments from the exact text and actual pages.
# Every field is specific to the goal; they are not imported author evidence.
DECISIONS = {
    'fcc73fb5': {
        'essentialUnderstandingDe': 'Stoffeigenschaften sind vergleichbare Merkmale eines Stoffes unter angegebenen Bedingungen; Löslichkeit, Dichte oder Schmelzverhalten ermöglichen begründete Ordnung statt Zuordnung nach Aussehen allein.',
        'essentialUnderstandingEn': 'Substance properties are comparable characteristics under stated conditions; solubility, density or melting behavior support classification beyond appearance alone.',
        'observablePerformanceDe': 'Die lernende Person ordnet bereitgestellte Eigenschaftsbeobachtungen passenden Stoffen zu, nennt das verwendete Vergleichskriterium und begründet, warum es für die Ordnung geeignet ist.',
        'observablePerformanceEn': 'The learner assigns supplied property observations to substances, identifies the comparison criterion and explains why it supports the classification.',
        'transferExpectationDe': 'Bei ähnlich aussehenden Stoffproben wählt die lernende Person ein unterscheidendes Eigenschaftsmerkmal und begründet die resultierende Ordnung anhand neuer Beobachtungsdaten.',
        'transferExpectationEn': 'For samples with similar appearance, the learner selects a distinguishing property and justifies classification from fresh observation data.',
        'rationale': 'Gezielter Bindungsreview, kein neuer Whole-goal-Abschluss: vollständiges unverändertes Ziel und aktuelles Zucker/Sand-PNG auf tatsächlicher PDF-Seite 3 und HTML-Abschnitt geprüft. Die zusätzliche direkte Rückverbindung zum Halogenziel entspricht dessen fcc-Prerequisite; die bestehende Grundlagenrolle bleibt erhalten. Vollständiger Titel, Beschreibung, öffentliche ID, Breadcrumb und Links sind sichtbar. Kein unabhängiger historischer D-/P-Neustart und keine Bildfreigabe durch diese Seite.'
    },
    '42a84bca': {
        'essentialUnderstandingDe': 'Reinstoff und Gemisch unterscheiden sich durch eine oder mehrere Stoffarten; ein Element enthält eine Atomart, eine Verbindung chemisch gebundene unterschiedliche Atomarten. Diese Ordnung hängt nicht davon ab, ob ein Stoff aus einzelnen Atomen oder Molekülen besteht.',
        'essentialUnderstandingEn': 'A pure substance and a mixture differ by having one or multiple substance types; an element has one atom type, whereas a compound has chemically combined different atom types. The distinction does not depend on whether particles are atoms or molecules.',
        'observablePerformanceDe': 'Die lernende Person erklärt an unabhängigen Teilchenbildern, welche Probe ein Element, eine Verbindung oder ein Gemisch ist, und begründet die Einordnung mit Atomarten, Bindung und Teilchensorten.',
        'observablePerformanceEn': 'The learner identifies elements, compounds and mixtures in independent particle diagrams and explains the classification using atom types, bonding and particle types.',
        'transferExpectationDe': 'Eine neue Darstellung mit einem zweiatomigen Element oder zwei verschiedenen Verbindungen wird nach demselben Ordnungsprinzip eingeordnet, auch wenn Farben oder räumliche Anordnung verändert sind.',
        'transferExpectationEn': 'The learner classifies a new representation containing a diatomic element or two different compounds using the same principle despite changed colors or spatial arrangement.',
        'rationale': 'Gezielte aktuelle Seitenbindung: Gesamtzielobjekt und vorhandenes Bild bleiben unverändert. Neue direkte Rückverbindung zu 584 ist durch dessen tatsächliche requires gedeckt; externer e0-Kontext bleibt offen. PDF-Seite 4 und HTML zeigen die vollständige Beschreibung, ID und richtige Grundlagenposition. Die vier Stoffproben tragen genau die bestehende Abgrenzung. Keine Wiederholung eines historischen Fachabschlusses und keine Ableitung von source coverage aus globaler applicability.'
    },
    '950c73c6': {
        'essentialUnderstandingDe': 'Ein Ionenkristall ist ein räumlich fortgesetztes Gitter entgegengesetzt geladener Ionen. Die Koordinationszahl beschreibt nächste Nachbarn; elektrostatische Anziehung erklärt die feste Struktur, verschobene gleichnamige Nachbarn die Sprödigkeit und bewegliche Ionen die Leitfähigkeit von Schmelze oder Lösung.',
        'essentialUnderstandingEn': 'An ionic crystal is a spatially extended lattice of oppositely charged ions. Coordination number describes nearest neighbors; electrostatic attraction explains the solid structure, shifted like-charged neighbors explain brittleness and mobile ions explain conduction in melts or solutions.',
        'observablePerformanceDe': 'Die lernende Person konstruiert einen einfachen räumlichen Gitterausschnitt, zählt die nächsten Gegenionen eines gewählten Ions und erklärt anhand dieses Modells Sprödigkeit sowie unterschiedliche elektrische Leitfähigkeit im festen und beweglichen Zustand.',
        'observablePerformanceEn': 'The learner constructs a simple spatial lattice section, counts the nearest counterions of a selected ion and uses the model to explain brittleness and differing conductivity when ions are fixed or mobile.',
        'transferExpectationDe': 'Bei einem gedrehten oder anders zugeschnittenen Gitterausschnitt erkennt die lernende Person die räumliche Nachbarschaft wieder und begründet die Leitfähigkeitsänderung beim Schmelzen statt sie aus der Anzahl gezeichneter Ionen abzulesen.',
        'transferExpectationEn': 'For a rotated or differently cropped lattice section, the learner identifies spatial neighbors and explains the conductivity change on melting rather than inferring it from the number of depicted ions.',
        'rationale': 'keep: HE10.1 enthält die gemeinsam modellierbare Gitter-, Koordinations- und Eigenschaftsrelation; der Text operationalisiert sie vollständig ohne Gitterenergie oder sämtliche Kristalltypen zusätzlich zu verlangen. BY8 C8.4 belegt nur die passende Gitter-/Struktur-Eigenschafts-Teilkompetenz; Molekülmodellierung, Formelabgrenzung und Experimentierroutinen bleiben andere Zeugen. Modellieren und Eigenschaftserklärung sind eine zusammenhängende Struktur-Eigenschafts-Kompetenz, kein bloßes Aufsagen der 6. DE/EN sind äquivalent, Sek-I-Niveau bleibt erhalten. PDF-Seite 5 und HTML zeigen einen sichtbaren sechszähligen räumlichen Modell-Ausschnitt und volle Beschreibung. Dieses Zeichnungsmodell ist keine Lernendenleistung.'
    },
    '16a80de2': {
        'essentialUnderstandingDe': 'Ausgewählte Alkalimetalle und ihre einfachen Oxide können mit Wasser alkalische Hydroxidlösungen bilden. Beim Metall entsteht zusätzlich Wasserstoff; bei Natriumoxid entsteht Natriumhydroxid ohne diese Wasserstoffbildung. Hydroxidionen verursachen die alkalische Reaktion, während die Lösung elektrisch neutral bleibt.',
        'essentialUnderstandingEn': 'Selected alkali metals and their simple oxides can form alkaline hydroxide solutions with water. The metal also produces hydrogen; sodium oxide forms sodium hydroxide without this hydrogen production. Hydroxide ions cause alkalinity while the solution remains electrically neutral.',
        'observablePerformanceDe': 'Die lernende Person vergleicht bereitgestellte Beobachtungen oder Reaktionsdarstellungen beider Systeme, benennt das gemeinsame Hydroxidprodukt und das unterschiedliche Gasprodukt und begründet die Alkalität mit OH⁻ statt mit einer negativen Gesamtladung.',
        'observablePerformanceEn': 'The learner compares supplied observations or reaction representations of both systems, identifies their common hydroxide product and different gas production and explains alkalinity through OH⁻ rather than a net negative charge.',
        'transferExpectationDe': 'Für ein neues bereitgestelltes einfaches Metall-/Oxid-Paar entscheidet die lernende Person anhand der Edukte und gegebenen Produkte, welche Erklärung der Gasentwicklung und Indikatorreaktion passt; keine gefährliche Eigenversuchsdurchführung ist erforderlich.',
        'transferExpectationEn': 'For a new supplied simple metal/oxide pair, the learner uses reactants and given products to choose an explanation of gas production and indicator response; no hazardous independent experiment is required.',
        'rationale': 'keep: Die wirkliche HE9.2-Klausel verlangt beide Wasser-Systeme; die neue Beschreibung behält beide und verknüpft sie über Produkte und Hydroxidursache. Der direkte Vergleich ist ein gemeinsames Lernziel, keine bloße Addition zweier Verfahren. Der Text behauptet weder universelle Wasserstoffbildung sämtlicher Alkali-Sauerstoffverbindungen noch unsupervisiertes Experimentieren. Vorausgesetzte alkalische Lösungen und e0-Kontext sind sichtbar; e0 erhält dadurch keinen Abschluss. DE/EN stimmen überein. PDF-Seite 6 und HTML tragen zwei korrekt bilanzierte Natrium-/Natriumoxidfälle und die zutreffende Neutralitätsaussage.'
    },
    '58486300': {
        'essentialUnderstandingDe': 'Eigenschaften eines elementaren Halogens und Eigenschaften seiner Verbindungen müssen stoffgenau unterschieden werden. Eine Verwendung wird durch Eigenschaften des tatsächlich verwendeten Stoffes begründet; Fluorid in Zahnpasta übernimmt nicht die Eigenschaften von F₂.',
        'essentialUnderstandingEn': 'Properties of an elemental halogen must be distinguished from those of its compounds. A use is justified through properties of the substance actually used; fluoride in toothpaste does not inherit the properties of F₂.',
        'observablePerformanceDe': 'Die lernende Person verbindet konkrete Eigenschaftsangaben mit ausgewählten Verwendungen, nennt den eingesetzten Elementstoff oder die Verbindung und begründet, weshalb der Stoff für diese Funktion geeignet ist.',
        'observablePerformanceEn': 'The learner connects concrete property information to selected uses, names the elemental substance or compound involved and explains why it fits the stated function.',
        'transferExpectationDe': 'Bei einem neuen Produkt mit einer Halogenverbindung trennt die lernende Person dessen Eigenschaftsbegründung von derjenigen des Elementstoffs und prüft eine bereitgestellte pauschale Gleichsetzung chemisch begründet.',
        'transferExpectationEn': 'For a new product containing a halogen compound, the learner separates its property-based justification from that of the elemental substance and evaluates a supplied blanket equivalence using chemical reasoning.',
        'rationale': 'keep: HE9.2 unterscheidet Elementgruppen-Eigenschaften und Alltagsverbindungen; die operative Beschreibung macht deren stoffgenaue Zuordnung explizit. Stoffeigenschaft und dadurch begründete Verwendung bilden eine atomare Zusammenhangskompetenz. Die partielle A02-Alltagsklausel wird ausschließlich dafür verwendet; Metallreaktionen, Wasserstoffreaktionen und HCl-Synthese sind nicht mitgeprüft und bleiben Source-HOLD. Bekannte breite Länder-applicability wird nicht als Beweis eigener BY-Zeugen behandelt. DE/EN stimmen überein. PDF-Seite 7 und HTML unterscheiden Elementstoffe und ausgewählte Verbindungsbeispiele; schematische Farben sind keine naturgetreue Stoff-Farbbehauptung.'
    },
    'b5086548': {
        'essentialUnderstandingDe': 'Die betrachteten Salzklassen werden anhand ihrer charakteristischen Anionen unterschieden; Kationen und Ladungsausgleich ergeben konkrete Salzformeln, ohne die Salzklasse durch den Namen des Kations festzulegen.',
        'essentialUnderstandingEn': 'The selected salt classes are distinguished by their characteristic anions; cations and charge balance determine specific salt formulas without classifying the salt solely by its cation name.',
        'observablePerformanceDe': 'Die lernende Person ordnet gegebene Salzformeln Halogeniden, Sulfaten, Nitraten oder Carbonaten zu und nennt jeweils das entscheidende Anion.',
        'observablePerformanceEn': 'The learner classifies given salt formulas as halides, sulfates, nitrates or carbonates and identifies the determining anion.',
        'transferExpectationDe': 'Nach Austausch des Kations ordnet die lernende Person die neue Formel weiterhin derselben Anionenklasse zu und erläutert, weshalb ein veränderter Salzname die Klasse nicht automatisch ändert.',
        'transferExpectationEn': 'After replacing the cation, the learner assigns the new formula to the same anion class and explains why a changed salt name does not automatically change that class.',
        'rationale': 'Gezielter Bindungsreview: Ziel und Bild unverändert, geprüft sind neue Salz-/Anwendungs-Breadcrumbs und Seitenreferenzen. Direkte Voraussetzung 950 liegt auf S.3, Nachfolger d726/414/1f auf S.7/8/9; dies stimmt mit den tatsächlichen requires überein. Die erste scheinbare Clipping-Beobachtung wurde durch unabhängige Neurasterung des exakt gebundenen PDF und direkte HTML-Neurenderung widerlegt: vollständiges „Halogenide,“ bei normalem linken Rand, Text-bbox inbounds. Kein nativer Renderer- oder Fachtextfehler ist dadurch belegt. Nicht erneut als fachlicher Abschluss zählen; keine blinde Umlaut-Stiländerung an historisch gebundenem Text.'
    },
    'd726e00e': {
        'essentialUnderstandingDe': 'Beim Kalkkreislauf wird Calciumcarbonat durch Erhitzen zu Calciumoxid und Kohlenstoffdioxid, durch Wasserzugabe entsteht Calciumhydroxid und durch Kohlenstoffdioxidaufnahme wieder Calciumcarbonat. Die Stufen sind unterschiedliche Stoffumwandlungen mit unterschiedlichen Stoffbilanzen.',
        'essentialUnderstandingEn': 'In the lime cycle, heating calcium carbonate yields calcium oxide and carbon dioxide, adding water produces calcium hydroxide and taking up carbon dioxide restores calcium carbonate. The stages are different chemical transformations with distinct material balances.',
        'observablePerformanceDe': 'Die lernende Person ordnet Stoffe und Bedingungen den drei Stufen zu, erklärt die Rückbildung des Carbonats und begründet, wo Wasser oder Kohlenstoffdioxid abgegeben beziehungsweise aufgenommen werden.',
        'observablePerformanceEn': 'The learner assigns substances and conditions to the three stages, explains carbonate re-formation and identifies where water or carbon dioxide is released or taken up.',
        'transferExpectationDe': 'Bei einem bereitgestellten Mörtel- oder Brennkalkfall bestimmt die lernende Person die relevante Stufe und erklärt die Wirkung einer geänderten Wasser- oder Kohlenstoffdioxidzufuhr anhand des Stoffwegs.',
        'transferExpectationEn': 'For a supplied mortar or quicklime case, the learner identifies the relevant stage and explains the effect of changed water or carbon dioxide supply using the material pathway.',
        'rationale': 'Gezielter aktueller Bild-/Seitenbindungsreview, kein neuer Fachabschluss: das unveränderte Gesamtziel steht im tatsächlichen neuen späten Salzkontext. PDF-Seite 9 und HTML wurden mit dem tatsächlich aktuellen akzeptierten PNG 51341eaf35f02e3bf70b9a65d9187895189c9d98daba97413c97b9eed992f6eb angesehen. Alle drei dargestellten Stoffbilanzen passen zum unveränderten Kalkziel; dies beurteilt die aktuelle konkrete Seite, nicht das historische Stored-JPG 2525c341. Historische Bytes und altes Urteil bleiben erhalten. Die bestehende externe 11bea-Prerequisite-Frage ist keine hier geschlossene Nebenkompetenz. Ziel-/Seitenfingerprints werden exakt aus vorbereitetem Input übernommen.'
    },
    '414489cb': {
        'essentialUnderstandingDe': 'Bei der vereinfachten kalkhaltigen Rauchgaswäsche wird gasförmiges SO₂ in einen calciumhaltigen Stoffstrom überführt; Oxidation ist für den Weg zum Sulfat nötig, und Gips ist Calcium­sulfat-Dihydrat. Das Schema fasst einen mehrstufigen technischen Prozess zusammen.',
        'essentialUnderstandingEn': 'In simplified lime-based flue-gas scrubbing, gaseous SO₂ enters a calcium-containing material stream; oxidation is required on the route to sulfate, and gypsum is calcium sulfate dihydrate. The diagram summarizes a multistage technical process.',
        'observablePerformanceDe': 'Die lernende Person verfolgt Schwefel und Calcium durch ein bereitgestelltes Schema, erklärt die Rolle der Sauerstoffzufuhr für Sulfatbildung und identifiziert Gips als gebundenes Endprodukt, ohne eine SO₂-Absorption bereits mit vollständiger Oxidation gleichzusetzen.',
        'observablePerformanceEn': 'The learner tracks sulfur and calcium through a supplied diagram, explains the role of oxygen supply in sulfate formation and identifies gypsum as the captured product without equating SO₂ absorption with completed oxidation.',
        'transferExpectationDe': 'Für ein Schema mit veränderter oder fehlender Sauerstoffzufuhr erläutert die lernende Person anhand des Stoffwegs, warum derselbe vollständige Sulfat-/Gipsweg nicht unverändert behauptet werden darf.',
        'transferExpectationEn': 'For a diagram with changed or absent oxygen supply, the learner explains from the material pathway why the same complete sulfate/gypsum route cannot be asserted unchanged.',
        'rationale': 'keep: Die HE10.3-Salzbildungszelle benennt Rauchgasgips als abgegrenzten Anwendungsteil; Kalkkreislauf und Dünger haben eigene Zeugen. Das vereinfachte Schema ist methodisch klar benannt, die Oxidation korrigiert eine mögliche Schwefel(IV)/Sulfat-Verwechslung und bleibt Sek-I-gerecht. Eine zusammenhängende chemische Stoffweg-Erklärung trägt die Atomarität, ohne alle Verfahrensdetails zu verlangen. DE/EN stimmen überein. PDF-Seite 10 und HTML zeigen O₂, Wasser und Ca(OH)₂ sowie die bilanzierte Gesamtreaktion zu CaSO₄·2H₂O. Die Beschriftung ist keine Behauptung, ein technischer Reaktor habe nur einen einzelnen Reaktionsschritt.'
    },
    '1f5ee84f': {
        'essentialUnderstandingDe': 'Mineralische Düngesalze liefern Nährstoffionen; deren Nutzen und mögliche Stoffeinträge hängen von Bedarf, Dosis und Transport ab. Nitrat-Auswaschung und phosphathaltige Abschwemmung sind unterschiedliche Transportwege, keine pauschale Eigenschaft jedes Düngers.',
        'essentialUnderstandingEn': 'Mineral fertilizer salts supply nutrient ions; benefits and potential losses depend on demand, dose and transport. Nitrate leaching and phosphate-containing runoff are different pathways rather than a universal property of every fertilizer.',
        'observablePerformanceDe': 'Die lernende Person identifiziert aus gegebenen Salz- oder Produktangaben die Nährstoffionen und begründet für einen bereitgestellten Bedarfs-/Mengen-/Transportfall einen begrenzten Nutzen-Risiko-Zusammenhang.',
        'observablePerformanceEn': 'The learner identifies nutrient ions from supplied salt or product information and justifies a bounded benefit-risk relationship for a case with given demand, amount and transport data.',
        'transferExpectationDe': 'Bei verändertem Pflanzenbedarf oder verändertem Regen-/Transportfall erklärt die lernende Person, warum dieselbe Düngergabe anders zu beurteilen ist, und bindet die Begründung weiterhin an die tatsächlich gegebenen Nährstoffionen und Stoffwege.',
        'transferExpectationEn': 'With changed plant demand or rain/transport conditions, the learner explains why the same fertilizer dose requires a different judgment and grounds it in the supplied nutrient ions and material pathways.',
        'rationale': 'keep: HE10.3 benennt Düngemittel innerhalb der Salz-Anwendungen und Umwelterziehung; die operative Beschreibung begrenzt die Bewertung ausdrücklich auf vorgegebene Bedarfs-, Mengen- und Transportdaten. Salzklassifikation liefert hier die Ursache der bedingten Bewertung, sodass dies eine integrierte Anwendungskompetenz bleibt. Keine agronomische Gesamtausbildung oder pauschale Gefahrbehauptung wird importiert. DE/EN sind äquivalent. PDF-Seite 11 und HTML passen zu den Nährstoff-/Transportkategorien; PO₄³⁻ im schematischen Bild bezeichnet die Kategorie und beweist keine dominierende freie Phosphatspezies im Boden. Ein anderes Länderlabel allein ist kein zusätzlicher Quellenzeuge.'
    },
}

def digest(b):
    return 'sha256:' + hashlib.sha256(b).hexdigest()

results = OWN / 'results'
results.mkdir(exist_ok=False)
records = []
for goal in INPUT['goals']:
    judgment = DECISIONS[goal['goalId'][:8]]
    record = {
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1,
        'recordId': RUN_ID + '.' + goal['goalId'],
        'runId': RUN_ID,
        'campaignId': CAMPAIGN['campaignId'],
        'roundId': CAMPAIGN['roundId'],
        'bundleFingerprint': INPUT['bundleFingerprint'],
        'bookDigest': INPUT['bookDigest'],
        **{k: goal[k] for k in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']},
        'decision': 'keep',
        'understandingEvidence': {k: v for k, v in judgment.items() if k != 'rationale'},
        'rationale': judgment['rationale'],
        'evidenceProfileContract': 'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation': 'create',
        'recordStatus': 'candidate',
        'reviewAuthority': 'ai_candidate',
    }
    records.append(record)
batch = CAMPAIGN['batches'][0]
output = results / (batch['batchId'] + '.records.jsonl')
output.write_text(''.join(json.dumps(r, ensure_ascii=False, separators=(',', ':')) + '\n' for r in records))
params = {'provider': 'OpenAI Codex', 'modelIdentity': 'Exact model identifier not exposed in this reviewer tool context', 'agentTask': 'chem_b010_current_d_a', 'reviewScope': 'Five scientific descriptions and four targeted current page bindings; no other independent verdicts read', 'blindToOtherRuns': True, 'temperature': None, 'note': 'No generation setting invented; this is actual tool-assisted reviewer analysis, not a subprocess LLM API call'}
(OWN / 'actual-review-parameters.json').write_text(json.dumps(params, ensure_ascii=False, indent=2) + '\n')
birth = subprocess.check_output(['stat', '-c', '%w', str(OWN)], text=True).strip()
start = datetime.datetime.fromisoformat(birth).isoformat()
run = {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    'schemaVersion': 1, 'runId': RUN_ID,
    'campaignId': CAMPAIGN['campaignId'], 'roundId': CAMPAIGN['roundId'], 'batchId': batch['batchId'],
    'batchInputFingerprint': batch['batchInputFingerprint'],
    'bundleFingerprint': BUNDLE['bundleFingerprint'], 'bookDigest': BUNDLE['bookModelDigest'],
    'provider': 'OpenAI Codex', 'model': 'Codex reviewer; exact model identifier not exposed',
    'role': 'subject_reviewer', 'promptFamilyId': 'goal-description-understanding-evidence-v2',
    'promptFingerprint': CAMPAIGN['promptFingerprint'], 'criteriaFingerprint': CAMPAIGN['criteriaFingerprint'],
    'generationParametersFingerprint': digest((OWN / 'actual-review-parameters.json').read_bytes()),
    'independenceGroupId': CAMPAIGN['independenceGroupId'], 'blindToOtherRuns': True,
    'goalIds': [r['goalId'] for r in records],
    'inputArtifacts': [{'role': a['role'], 'digest': a['digest']} for a in BUNDLE['artifacts'] if a['role'] in {'book_pdf', 'book_pdf_render_manifest', 'book_html', 'book_html_render_manifest', 'book_model', 'review_input_json', 'review_input_jsonl', 'review_markdown', 'review_prompt', 'review_criteria', 'finding_schema', 'run_manifest_schema'}] + [{'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']}],
    'startedAt': start, 'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'status': 'completed', 'outputDigest': digest(output.read_bytes()), 'toolchainVersion': 'goal-description-review-v1',
}
(results / (batch['batchId'] + '.run.json')).write_text(json.dumps(run, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'records': len(records), 'decisionCounts': {'keep': len(records)}, 'recordsPath': str(output), 'recordsSHA256': hashlib.sha256(output.read_bytes()).hexdigest()}, ensure_ascii=False))
