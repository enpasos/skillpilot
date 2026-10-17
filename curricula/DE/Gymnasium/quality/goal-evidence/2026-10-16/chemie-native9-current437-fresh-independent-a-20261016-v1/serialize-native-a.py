# SPDX-License-Identifier: Apache-2.0
"""Serialize the already frozen first scientific decisions into the supplied contract."""
import datetime
import hashlib
import json
from pathlib import Path

R = Path('/home/enpasos/projects/skillpilot')
E = R / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16'
O = E / 'chemie-native9-current437-fresh-independent-a-20261016-v1'
N = E / 'chemie-current437-nine-targeted-native-pages-combined639-technical-20261016-v1/native-nine'
sha = lambda p: 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
first_path = O / 'FIRST.independent-current-nine-science-and-separate699.frozen.json'
seal = json.loads((O / 'SEAL.first-science-before-native-serialization.json').read_text())
assert sha(first_path) == seal['sha256']
first = json.loads(first_path.read_text())
campaign = json.loads((N / 'round-a/description-review-campaign.json').read_text())
bundle = json.loads((N / 'round-a/review-bundle-manifest.json').read_text())
batch_path = next((N / 'round-a/batches').glob('*.input.jsonl'))
batch = [json.loads(line) for line in batch_path.read_text().splitlines()]
assert [r['goalId'] for r in first['rows']] == [r['goal']['goalId'] for r in batch]

# One coherent positive evidence chain per exact goal, authored independently.
chains = [
    [
        'Hybridisierung kombiniert modellhaft Atomorbitale desselben Atoms; sp³, sp² und sp ergeben unterschiedliche lokale σ-Bindungsrichtungen und lassen unterschiedliche p-Orbitale für π-Bindungen übrig.',
        'Hybridization combines atomic orbitals on the same atom as a model; sp³, sp² and sp give different local sigma-bond directions and leave different p orbitals for pi bonding.',
        'Die lernende Person begründet an Methan, Ethen und Ethin die lokale Hybridisierung, ideale Geometrie und σ-/π-Bindungsanteile aus demselben Orbitalmodell.',
        'The learner justifies local hybridization, ideal geometry and sigma/pi components in methane, ethene and ethyne using the same orbital model.',
        'In einem neuen Molekül mit Einfach- und Doppelbindung ordnet sie jedes Kohlenstoffzentrum einzeln zu und erklärt, weshalb nicht alle Zentren dieselbe Hybridisierung besitzen.',
        'In a fresh molecule containing single and double bonds, the learner assigns each carbon centre separately and explains why the centres need not share one hybridization.',
    ],
    [
        'Chiralität folgt hier aus vier verschiedenen Gruppen am tetraedrischen Kohlenstoff. Fischerprojektionen codieren horizontal nach vorn und vertikal nach hinten; D/L wird erst bei COOH oben und Seitenkette unten gelesen.',
        'Here chirality follows from four different groups at tetrahedral carbon. Fischer projections encode horizontal bonds forwards and vertical bonds backwards; D/L is read only with COOH top and the side chain bottom.',
        'Die lernende Person überführt ein eindeutig räumliches Aminosäuremodell in eine vollständige Fischerprojektion, begründet D/L und das nicht deckungsgleiche Spiegelbild und erklärt Glycins Achiralität.',
        'The learner converts an unambiguous spatial amino-acid model into a complete Fischer projection, justifies D/L and the nonsuperimposable mirror image, and explains glycine achirality.',
        'Bei einem gedreht gegebenen Cysteinmodell und einem neuen Serinmodell normalisiert sie die Darstellung ohne Konfigurationswechsel und begründet am Tiefenmodell, weshalb eine erneute Fischerlesart nach 90° die Konfiguration umkehrt.',
        'For a rotated cysteine input and a fresh serine model, the learner normalizes the representation without changing configuration and uses bond depth to explain why renewed Fischer reading after 90° reverses configuration.',
    ],
    [
        'Ester- und Amidkondensation verknüpfen einen Acylkohlenstoff mit O beziehungsweise N. Nucleophiler Angriff, tetraedrischer Zwischenzustand und Eliminierung erfordern passende Protonenübertragung und Aktivierung; Salzbildung allein ergibt kein Amid.',
        'Ester and amide condensation link an acyl carbon to O or N respectively. Nucleophilic attack, a tetrahedral intermediate and elimination require suitable proton transfer and activation; salt formation alone does not give an amide.',
        'Die lernende Person formuliert atomar bilanzierte Produkte und erklärt Elektronenpaarbewegung, Zwischenzustand, Wasserabgang und den Unterschied zwischen protoniertem Amin und verfügbarem Nucleophil.',
        'The learner writes atom-balanced products and explains electron-pair movement, the intermediate, water departure and the distinction between a protonated amine and an available nucleophile.',
        'Sie überträgt das Acylmodell auf einen N-Nucleophilfall und beurteilt an geänderten Bedingungen, weshalb kalte Ammoniumcarboxylatbildung keinen Nachweis einer Amidbindung liefert.',
        'The learner transfers the acyl model to an N-nucleophile case and uses changed conditions to explain why cold ammonium-carboxylate formation does not establish an amide bond.',
    ],
    [
        'Bei festgelegter Elektrodenreaktion bestimmt die dafür genutzte Ladung die Elektronenmenge. Für denselben Stoff wächst der Umsatz proportional; bei verschiedenen Stoffen sind Elektronenbedarf, Stoffmenge und molare Masse zu unterscheiden.',
        'For a specified electrode reaction, its relevant charge determines the electron amount. Conversion of the same substance is proportional to charge; across substances electron requirement, amount and molar mass must be distinguished.',
        'Die lernende Person erklärt ohne Zahlenrechnung den gleichen Kupferumsatz bei gleicher relevanter Ladung und vergleicht Cu/Ni sowie Ag/Cu getrennt nach Elektronenbedarf, Stoffmenge und Masse.',
        'Without numerical calculation, the learner explains equal copper conversion at equal relevant charge and compares Cu/Ni and Ag/Cu separately by electron requirement, amount and mass.',
        'Bei neu auftretender Wasserstoffbildung trennt sie Gesamtladung und Kupfer-Reaktionsladung; im frischen Zn/Cu-Vergleich begründet sie gleiche Stoffmenge und unterschiedliche Masse anhand der vorgegebenen molaren Massen.',
        'When hydrogen formation is newly introduced, the learner separates total charge from copper-reaction charge; in a fresh Zn/Cu comparison, supplied molar masses justify equal amounts but unequal masses.',
    ],
    [
        'Q=I·t verknüpft bei konstantem Strom Ladung und Dauer; die ausgeglichene Elektrodenreaktion bestimmt z in Q=zFn. Masse, Stoffmenge und Anteil des Anfangsstoffs sind verschiedene Größen.',
        'At constant current Q=I·t connects charge and duration; the balanced electrode reaction determines z in Q=zFn. Mass, amount and the fraction of starting material are different quantities.',
        'Die lernende Person leitet z aus der Reaktion ab, berechnet mit Einheiten Ladung, Elektronen- und Metallstoffmenge und stellt dieselbe Bilanz nach Strom oder Zeit um.',
        'The learner derives z from the reaction, calculates charge and electron/metal amounts with units, and solves the same balance for current or time.',
        'Bei neuem Metall mit anderer Elektronenstöchiometrie oder begrenzter Stromausbeute passt sie die Bilanz begründet an und erklärt, warum gleiche Gesamtladung weder gleiche Stoffmenge noch gleiche Masse garantiert.',
        'For a fresh metal with different electron stoichiometry or limited current efficiency, the learner adapts the balance and explains why equal total charge guarantees neither equal amount nor equal mass.',
    ],
    [
        'Chemische Protonenquelle, ATP-gekoppelte Sekretion und Verbrauch vorhandener Säure sind verschiedene Vorgänge. Protonenpumpen-Hemmer vermindern den H⁺/K⁺-ATPase-vermittelten neuen Protonenfluss.',
        'Chemical proton production, ATP-coupled secretion and consumption of existing acid are different processes. Proton-pump inhibitors reduce the new proton flux mediated by H⁺/K⁺-ATPase.',
        'Die lernende Person erklärt Protonenbildung, Pumpenrichtung und getrennten Chloridtransport und nutzt den Mechanismusbeleg, um geringere neue Säuresekretion von direkter Neutralisation abzugrenzen.',
        'The learner explains proton formation, pump direction and separate chloride transport, using the mechanism source to distinguish reduced new acid secretion from direct neutralization.',
        'In einem neuen Modell mit vorhandener Säure und verändertem Zufluss vergleicht sie Pumpenhemmung und Basenverbrauch und begrenzt den Schluss auf die vorgegebenen chemischen Modellbedingungen.',
        'In a fresh model with existing acid and changed influx, the learner compares pump inhibition with base consumption and limits the conclusion to the supplied chemical model conditions.',
    ],
    [
        'Wirkstoffstruktur, Präparatzusammensetzung, Verkauf und dokumentierter Gebrauch sind unterschiedliche Informationen. ASS, Ibuprofen und Paracetamol unterscheiden sich in funktionellen Gruppen; diese allein legen keine klinische Austauschbarkeit fest.',
        'Active-ingredient structure, formulation composition, sales and recorded use are different information. ASA, ibuprofen and paracetamol differ in functional groups; these alone do not determine clinical interchangeability.',
        'Die lernende Person dokumentiert benutzte Quellen, ordnet Säure-, Ester-, Phenol- und Amidgruppen richtig zu und beurteilt Konsum- oder Anwendungsaussagen mit passendem Zeitraum, Nenner und belegten Wirkungsgrenzen.',
        'The learner documents sources used, assigns acid, ester, phenol and amide groups correctly, and evaluates consumption or application claims using the appropriate period, denominator and evidenced effect limits.',
        'An einem neuen Kombinationspräparat mit anderer Wirkstoffmasse und Verkaufsbasis normiert sie die Daten und erklärt, weshalb Verkaufsrang, historische Gebrauchsquote und begründete Anwendung nicht gleichgesetzt werden können.',
        'For a fresh combination product with different ingredient masses and sales bases, the learner normalizes the data and explains why sales rank, historical use prevalence and appropriate application cannot be equated.',
    ],
    [
        'Verdauungsenzyme katalysieren passende Substratumsetzungen, Entschäumer verändern Grenzflächen, Präbiotika liefern mikrobielle Substrate und Probiotika lebende Mikroorganismen. Ein mechanistischer Befund ist kein allgemeiner Nutzenbeweis.',
        'Digestive enzymes catalyse suitable substrate conversions, defoamers change interfaces, prebiotics supply microbial substrates and probiotics live microorganisms. A mechanism finding is not universal evidence of benefit.',
        'Die lernende Person ordnet die vier Gruppen anhand ihrer Wirkprinzipien zu, dokumentiert passende Quellen und bewertet anhand der angegebenen Bedingungen eine Wirkungs- oder Austauschbarkeitsbehauptung.',
        'The learner assigns the four groups by mechanism, documents appropriate sources and uses the specified conditions to assess an effect or interchangeability claim.',
        'Beim Wechsel von Lactose zu einem Fettmodell oder von Hydrolyse zu Schaumdaten begründet sie, welche Aussage über das neue Substrat oder den Endpunkt trägt und weshalb daraus kein allgemeiner Einnahmenutzen folgt.',
        'On changing from lactose to a fat model or from hydrolysis to foam data, the learner justifies what the new substrate or endpoint supports and why general benefit from administration does not follow.',
    ],
    [
        'Forschungsbefunde, chemische Herstellung, Aufarbeitung, Maßstabsübertragung und Vermarktungsdaten beantworten verschiedene Fragen desselben Wirkstoffprojekts. Neue Prozessbefunde können frühere Entscheidungen verändern.',
        'Research findings, chemical manufacture, work-up, scale transfer and marketing data answer different questions within one drug project. New process findings can alter earlier decisions.',
        'Die lernende Person verknüpft am selben materialgestützten Salicylatfall einen Forschungsbefund mit Entwicklungsentscheidungen, unterscheidet Umwandlung und Trennung und begründet Grenzen von Produktions- und Werbeaussagen.',
        'Using the same supplied salicylate case, the learner connects a research finding to development decisions, distinguishes transformation and separation, and justifies limits on production and advertising claims.',
        'Bei neuem Verunreinigungs- oder Lagerbefund leitet sie eine konkrete nächste Untersuchung ab und passt Liefer- oder Vermarktungsaussagen anhand der neuen Produktdaten an, ohne eine ungeklärte Ursache als bewiesen zu behandeln.',
        'For a fresh impurity or storage finding, the learner derives a concrete next investigation and revises supply or marketing claims using the new product data without treating an unresolved cause as proved.',
    ],
]
keys = ['essentialUnderstandingDe', 'essentialUnderstandingEn', 'observablePerformanceDe', 'observablePerformanceEn', 'transferExpectationDe', 'transferExpectationEn']
run_id = 'chemie-native9-current437-fresh-independent-a-20261016-v1'
rows = []
for ordinal, (entry, science, chain) in enumerate(zip(batch, first['rows'], chains), 1):
    g = entry['goal']
    row = {
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1,
        'recordId': f'chemie-native9-current437-a-{ordinal:02d}-20261016',
        'runId': run_id,
        'campaignId': campaign['campaignId'],
        'roundId': campaign['roundId'],
        'bundleFingerprint': campaign['bundleFingerprint'],
        'bookDigest': campaign['bookDigest'],
        **{k: g[k] for k in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']},
        'decision': science['descriptionDecision'],
        'understandingEvidence': dict(zip(keys, chain)),
        'rationale': 'Die vollständige aktuelle DE/EN-Kompetenz ist fachlich klar und auf der tatsächlich angesehenen PDF-Seite vollständig lesbar. ' + science['unit'] + ' ' + science['prerequisites'] + ' Das aktuelle V2-Profil enthält die entsprechende eigenständige Leistung und fachlich veränderten Transfer. Bilder dienen der Lehre; kein Lernerfolg oder menschliche Annahme wird daraus abgeleitet.',
        'evidenceProfileContract': 'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation': 'none',
        'recordStatus': 'candidate',
        'reviewAuthority': 'ai_candidate',
    }
    rows.append(row)
results = O / 'native-description-results'
results.mkdir(exist_ok=True)
record_path = results / (campaign['batches'][0]['batchId'] + '.records.jsonl')
assert not record_path.exists()
record_path.write_text(''.join(json.dumps(r, ensure_ascii=False) + '\n' for r in rows))
params = {'modelVersion': 'unknown', 'seed': 'unknown', 'temperature': 'unknown', 'execution': 'Independent direct Codex session review; no API request or observed learner execution asserted.'}
param_path = O / 'generation-parameters.actual-unknown.json'
param_path.write_text(json.dumps(params, indent=2) + '\n')
run = {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    'schemaVersion': 1, 'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
    'batchId': campaign['batches'][0]['batchId'], 'batchInputFingerprint': campaign['batches'][0]['batchInputFingerprint'],
    'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'],
    'provider': 'OpenAI', 'model': 'Codex session model; exact version not exposed', 'modelVersion': 'unknown',
    'role': 'subject_reviewer', 'promptFamilyId': 'goal-description-understanding-evidence-v2',
    'promptFingerprint': campaign['promptFingerprint'], 'criteriaFingerprint': campaign['criteriaFingerprint'],
    'generationParametersFingerprint': sha(param_path), 'independenceGroupId': campaign['independenceGroupId'],
    'blindToOtherRuns': True, 'goalIds': [r['goalId'] for r in rows],
    'inputArtifacts': [{k: a[k] for k in ['role', 'digest']} for a in bundle['artifacts'] if a['role'] in ['book_pdf', 'book_model', 'review_prompt', 'review_criteria', 'review_input_json']]
        + [{'role': 'description_review_batch_input_jsonl', 'digest': campaign['batches'][0]['batchInputFingerprint']}],
    'startedAt': seal['sealedAt'], 'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'status': 'completed', 'outputDigest': sha(record_path), 'toolchainVersion': 'codex-direct-native-review-v1',
}
run_path = results / (campaign['batches'][0]['batchId'] + '.run.json')
run_path.write_text(json.dumps(run, ensure_ascii=False, indent=2) + '\n')
for line in record_path.read_text().splitlines(): json.loads(line)
json.loads(run_path.read_text())
assert sha(first_path) == seal['sha256']
print(json.dumps({'records': len(rows), 'recordsPath': str(record_path.relative_to(R)), 'recordsSha256': sha(record_path), 'runPath': str(run_path.relative_to(R)), 'firstScienceExact': True}))
