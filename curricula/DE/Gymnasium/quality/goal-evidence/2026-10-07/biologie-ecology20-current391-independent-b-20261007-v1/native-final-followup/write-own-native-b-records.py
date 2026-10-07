import datetime
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-ecology20-current391-independent-b-20261007-v1'
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-ecology20-current391-author-v2'
OUT = BASE / 'native-final-followup'
NATIVE = AUTHOR / 'native-raster-candidate/twenty'

def sha(path):
    return 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()

def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

# These independently phrased expectations follow B's sealed whole scientific
# reading. The order is the neutral selected raster manifest, not another review.
expectations = [
    (
        'Ein Lebensraumtyp hat kennzeichnende Umweltmerkmale; seine räumlichen Schichten oder Zonen sind Teilbereiche desselben Lebensraums.',
        'A habitat type has characteristic environmental features; its spatial layers or zones are subareas of that habitat.',
        'Die lernende Person begründet die Einordnung eines beschriebenen Wald- und Gewässerstandorts und unterscheidet jeweils passende Teilbereiche.',
        'The learner justifies the classification of described woodland and water sites and distinguishes their appropriate subareas.',
        'An Nadelwald und Fließgewässer werden veränderte Merkmale für eine neue Gliederung genutzt; eine nicht belegte feinere Typisierung bleibt offen.',
        'For coniferous woodland and running water, changed features support a new classification; an unsupported finer identification remains unresolved.'
    ),
    (
        'Bestimmungen beruhen auf sichtbaren Merkmalen und dem Entscheidungsweg einer Hilfe; ein Nachweis einer Tiergruppe beweist nicht eine bestimmte Art.',
        'Identification rests on observable features and a key\'s decision path; identifying an animal group does not establish a particular species.',
        'Die lernende Person ordnet Blätter, Früchte und Körpermerkmale anhand einer Hilfe begründet zu und benennt verbleibende Unsicherheit.',
        'The learner uses a supplied aid to justify identification from leaves, fruits and body features and states remaining uncertainty.',
        'Bei Gewässerpflanzen und neuen Tiermerkmalen wird derselbe merkmalsgebundene Bestimmungsweg mit anderer Hilfe selbstständig durchgeführt.',
        'For aquatic plants and new animal features, the learner independently follows the same evidence-based process with a different identification aid.'
    ),
    (
        'Nahrungsbeziehungen verbinden Produzenten, Konsumenten und Zersetzer; Nahrungspfeile zeigen zur Aufnahme von Stoffen und Energie.',
        'Feeding relationships connect producers, consumers and decomposers; food arrows point toward uptake of matter and energy.',
        'Die lernende Person erstellt aus Angaben ein Nahrungsnetz, erklärt Partnerwirkungen und leitet eine bedingte Folge einer Bestandsänderung ab.',
        'The learner constructs a food web from supplied information, explains effects on partners and derives a conditional consequence of population change.',
        'In einem Gewässernetz werden andere Partner und Verknüpfungen berücksichtigt; ein Modellfolge wird nicht als sichere Beobachtung ausgegeben.',
        'In an aquatic web the learner considers different partners and connections without presenting a model consequence as a certain observation.'
    ),
    (
        'Abiotische Messwerte sind orts- und methodengebundene Beobachtungen; kontrollierte Bedingungen und Wiederholung begrenzen eine Einflussdeutung.',
        'Abiotic measurements are observations tied to location and method; controlled conditions and repetition constrain interpretation of effects.',
        'Die lernende Person erhebt eigene wiederholte Standortwerte mit Einheiten, protokolliert Rohdaten und erklärt mögliche Einflüsse samt Unsicherheit.',
        'The learner collects repeated site measurements with units, records raw data and explains possible effects and uncertainty.',
        'Ein zweiter Standortvergleich verwendet passende andere Messgrößen und gleiche Vergleichsbedingungen; ein Plan ersetzt keine Durchführung.',
        'A second site comparison uses appropriate different measurements under comparable conditions; planning does not replace carrying out measurements.'
    ),
    (
        'Arten benötigen geeignete Biotope mit Ressourcen und Rückzugsräumen; Strukturvielfalt allein ist keine gemessene Artenzahl.',
        'Species require suitable habitats with resources and refuges; structural diversity alone is not a measured species count.',
        'Die lernende Person begründet eine konkrete Schutzmaßnahme über Lebensraum- und Nahrungsbeziehungen und schlägt eine Erfolgskontrolle vor.',
        'The learner justifies a concrete protective action through habitat and feeding relationships and proposes monitoring of its effectiveness.',
        'Beim Wechsel vom Wald zum Gewässerufer werden artspezifische Strukturen und Zielkonflikte neu berücksichtigt, ohne Erfolg allein aus dem Bau abzuleiten.',
        'Moving from woodland to a waterside habitat, the learner reassesses species-specific structures and trade-offs without inferring success from construction alone.'
    ),
    (
        'Boden besteht aus unbelebten Bedingungen und einer beobachtbaren Lebensgemeinschaft; Streu und unerkannte Mikroorganismen sind nicht gezählte lebende Tiere.',
        'Soil comprises abiotic conditions and an observable biological community; litter and unidentified microbes are not counted living animals.',
        'Die lernende Person untersucht eine eigene Bodenprobe, dokumentiert Ergebnisse auch digital und unterscheidet belegte Biotop- und Biozönosemerkmale.',
        'The learner examines a soil sample, also documents results digitally and distinguishes evidenced habitat conditions from observed community features.',
        'Eine zweite Probe wird unter vergleichbaren Such- und Dokumentationsbedingungen untersucht; begrenzte Beobachtung begrenzt die Aussage über Vielfalt.',
        'A second sample is examined under comparable search and recording conditions; limited observation limits claims about diversity.'
    ),
    (
        'Zersetzung verändert organische Streu über zeitweiligen Humus und Mineralisierung; Stoffpfade sind von einmaligem Energiefluss und Wärmeabgabe verschieden.',
        'Decomposition changes organic litter through temporary humus and mineralization; matter pathways differ from one-way energy flow and heat loss.',
        'Die lernende Person stellt im Boden Stoff- und Energiepfade getrennt dar und erklärt zeitliche Humusbildung sowie Freisetzung anorganischer Nährstoffe.',
        'The learner separates soil matter and energy pathways and explains humus formation over time and release of inorganic nutrients.',
        'In einer veränderten Bodenmodellreihe werden Feuchte, Material und Abbaubedingungen neu eingeordnet; gleichzeitige Veränderungen beweisen keine Einzelursache.',
        'For a changed soil model series the learner reassesses moisture, material and decomposition conditions without inferring a single cause from concurrent changes.'
    ),
    (
        'Kohlenstoffatome wechseln zwischen CO2, Biomasse und Bodenmaterial; Fotosynthese und Atmung verbinden lebende und unbelebte Speicher.',
        'Carbon atoms move among carbon dioxide, biomass and soil material; photosynthesis and respiration connect living and nonliving stores.',
        'Die lernende Person verfolgt einen vollständigen C-Atomweg durch Pflanze, Streu, Bodentier und Zersetzer zurück zur Luft und erklärt die Erhaltung.',
        'The learner traces a complete carbon-atom pathway through plant, litter, soil animal and decomposer back to the air and explains conservation.',
        'Ein frischer Weg über Wurzelreste und zeitweilige Bodenspeicherung wird selbstständig verfolgt; Licht wird nicht als Kohlenstoffquelle oder Stoffkreislauf behandelt.',
        'The learner traces a fresh pathway through root remains and temporary soil storage without treating light as a carbon source or matter cycle.'
    ),
    (
        'Boden trägt langfristige Lebensmittelproduktion über Wasserhaushalt, Nährstoffe und Lebensgemeinschaft; menschliche Eingriffe können verkettete Verluste auslösen.',
        'Soil supports long-term food production through water balance, nutrients and biological communities; human actions can cause linked losses.',
        'Die lernende Person begründet Bodenfunktionen, zeichnet einen bedingten Gefährdungspfad und wägt Ertrag, Erhalt und menschliche Folgen ab.',
        'The learner explains soil functions, constructs a conditional risk pathway and weighs yield, conservation and consequences for people.',
        'Nach Wechsel von Verdichtung zu Deckungsverlust wird ein neuer Wirkpfad bis zum Gewässereintrag begründet und eine passende Maßnahme mit Grenzen bewertet.',
        'Changing from compaction to loss of cover, the learner explains a fresh pathway to aquatic nutrient input and evaluates an appropriate response and its limits.'
    ),
    (
        'Eine Verbreitungskarte zeigt räumliche Nachweise und Untersuchungsgrenzen; abiotische Muster stützen Hypothesen, beweisen aber keine Ursache.',
        'A distribution map records spatial detections and investigation limits; abiotic patterns support hypotheses but do not establish a cause.',
        'Die lernende Person liest Orientierung und Legende, unterscheidet Nichtnachweis von nicht untersuchter Fläche und vergleicht Nachweise mit Umweltangaben.',
        'The learner reads orientation and legend, distinguishes non-detection from unexamined areas and compares records with environmental information.',
        'Auf einer Karte anderer Organismen werden neue Temperatur- oder Feuchtemuster begründet gedeutet, ohne eine exakte Toleranz aus der Karte abzuleiten.',
        'For a map of different organisms the learner interprets new temperature or moisture patterns without deriving exact tolerance from the map.'
    ),
    (
        'Die ökologische Nische ist ein Gefüge biotischer Beziehungen und abiotischer Ansprüche; Konkurrenz, Nahrung und Wechselwirkungen beeinflussen eine Biozönose.',
        'An ecological niche is a combination of biotic relationships and abiotic requirements; competition, food and interactions influence a community.',
        'Die lernende Person erklärt positive und negative Partnerwirkungen und verbindet Ressourcennutzung, Standortbedingungen und mögliche Gemeinschaftsfolgen.',
        'The learner explains positive and negative effects on partners and connects resource use, environmental conditions and possible community consequences.',
        'Bei Vögeln mit räumlich oder zeitlich unterschiedlicher Nahrungssuche wird Koexistenz ohne die falsche Behauptung vollständiger Konkurrenzfreiheit erklärt.',
        'For birds using resources at different places or times, the learner explains coexistence without claiming that competition is completely absent.'
    ),
    (
        'Biodiversität umfasst Variation innerhalb von Arten, Arten und Ökosysteme; evolutive Entstehung und Regeneration begründen begrenzte Schutz- und Nutzungsargumente.',
        'Biodiversity includes within-species variation, species and ecosystems; evolutionary origin and regeneration support bounded arguments for conservation and use.',
        'Die lernende Person unterscheidet die Ebenen, erklärt nicht zielgerichtete Variation und Selektion und begründet eine biologische Schutz- oder Nutzungsentscheidung.',
        'The learner distinguishes levels, explains nondirected variation and selection and justifies a biological conservation or use decision.',
        'Bei genetisch verschiedenen Nutzpflanzensorten werden Risiko und Regeneration neu bewertet; Vielfalt ist keine Garantie gegen Krankheit oder Ertragseinbruch.',
        'For genetically diverse crop varieties the learner reassesses risk and regeneration without treating diversity as a guarantee against disease or yield loss.'
    ),
    (
        'Nachhaltige Bewertung biologischer Anwendungen verbindet ökologische, ökonomische, politische und soziale Kriterien; Sachannahmen sind von Werten zu unterscheiden.',
        'Sustainability evaluation of biological applications connects ecological, economic, political and social criteria; factual assumptions differ from values.',
        'Die lernende Person beurteilt Alternativen aus allen vier Perspektiven und begründet eine bedingte Entscheidung anhand benannter Kriterien und Datenlücken.',
        'The learner evaluates alternatives from all four perspectives and justifies a conditional choice using explicit criteria and data gaps.',
        'Bei einer anderen biologischen Anwendung werden Konflikte und Akteure neu eingeordnet; fehlende Bilanzdaten erlauben keine pauschale Klimaneutralitätsbehauptung.',
        'For another biological application the learner reassesses conflicts and stakeholders; missing life-cycle data do not justify a blanket climate-neutrality claim.'
    ),
    (
        'Exponentielles Wachstum setzt konstante relative Zunahme voraus; logistisches Wachstum modelliert begrenzte Kapazität und dichteabhängige Rückkopplung.',
        'Exponential growth assumes a constant relative increase; logistic growth models limited capacity and density-dependent feedback.',
        'Die lernende Person stellt Populationswerte und Kurven dar, vergleicht Modellannahmen und erklärt biologische Ressourcen- und Dichteeffekte.',
        'The learner represents population values and curves, compares model assumptions and explains biological resource and density effects.',
        'Bei veränderter Kapazität und begrenzter Entnahme werden neue Modellfolgen und Grenzen begründet; reale Populationen müssen keiner idealen Kurve folgen.',
        'For changed capacity and bounded harvesting the learner explains new model consequences and limits; real populations need not follow an ideal curve.'
    ),
    (
        'Ein Stoffkreislauf verbindet gerichtete Austauschprozesse und zeitweilige Speicher; aus Einzelströmen folgt erst unter Grenzen eine Nettobilanz.',
        'A matter cycle connects directed exchange processes and temporary stores; a net balance follows from individual flows only under specified limits.',
        'Die lernende Person analysiert einen Kohlenstoffkreislauf mit Fotosynthese, Atmung und Speicherung und begründet eine begrenzte Bilanz beziehungsweise Senkenaussage.',
        'The learner analyzes a carbon cycle involving photosynthesis, respiration and storage and justifies a bounded balance or sink inference.',
        'Nach Wechsel vom Land-/Bodensystem zum Gewässer/Sediment werden Austausch und Speicher neu verfolgt; zusätzliche oder unbekannte Flüsse begrenzen die Bilanz.',
        'Moving from a land-and-soil system to water and sediment, the learner traces new exchanges and stores; extra or unknown flows limit the balance.'
    ),
    (
        'Licht, Wasser und Temperatur beeinflussen ökologische Standorte gemeinsam; Klima beschreibt langfristige Muster und nicht ein einzelnes Wetterereignis.',
        'Light, water and temperature jointly influence ecological sites; climate describes long-term patterns rather than a single weather event.',
        'Die lernende Person bewertet beschriebene Expositions- und Bodenwasserunterschiede über biologische Wirkmechanismen und nennt bedingte Folgen.',
        'The learner evaluates described exposure and soil-water differences using biological mechanisms and states conditional consequences.',
        'Bei Höhenlage und Vegetationszeit werden neue Steuergrößen bewertet; höhere Temperatur ist nicht allgemein günstiger und ersetzt keine Potenzuntersuchung.',
        'For altitude and growing-season length the learner evaluates new controls; higher temperature is not always beneficial and does not replace a tolerance experiment.'
    ),
    (
        'Arten verändern während Sukzession Licht und Boden und reagieren zugleich auf diese Änderungen; Artenzahl muss dabei nicht ständig steigen.',
        'During succession species change light and soil and also respond to those changes; species number need not increase continually.',
        'Die lernende Person erklärt die gegenseitigen Wirkungen von Vegetationsfolge und Vielfalt und begründet die Rolle einer Störung.',
        'The learner explains reciprocal effects between vegetation succession and diversity and justifies the role of disturbance.',
        'In einem räumlichen Mosaik von Stadien und einer Offenhaltungsmaßnahme werden andere Artenwirkungen erklärt, ohne eine überall feste Klimax zu unterstellen.',
        'For a spatial mosaic of stages and an intervention maintaining open habitat, the learner explains changed species effects without assuming a universal fixed climax.'
    ),
    (
        'Biodiversitätsschutz richtet sich nach artspezifischen Ursachen und Lebensraumfunktionen; ein hoher Artenwert oder fertiges Bauwerk beweist keine Schutzwirkung.',
        'Biodiversity conservation responds to species-specific causes and habitat functions; a high species count or completed construction does not establish effectiveness.',
        'Die lernende Person begründet einen Habitatverbund oder eine andere Schutzstrategie mit Wirkmechanismus, Zielkonflikten und Monitoring.',
        'The learner justifies a habitat connection or another protective strategy with its mechanism, trade-offs and monitoring.',
        'Beim Wechsel von Amphibienverbund zu Gewässerrenaturierung werden neue Ursachen und geeignete Kontrollen bewertet; reine Umsiedlung genügt nicht.',
        'Moving from amphibian habitat connectivity to aquatic restoration, the learner evaluates new causes and suitable monitoring; relocation alone is insufficient.'
    ),
    (
        'Landnutzung, Verschmutzung und Klimawandel verändern Lebensräume über verschiedene bedingte Wirkpfade; eine Wirkungshypothese ist kein gemessener Befund.',
        'Land use, pollution and climate change alter habitats through different conditional pathways; an effect hypothesis is not a measured finding.',
        'Die lernende Person beschreibt Nährstoffeintrag, Abbau und Sauerstoffverbrauch sowie Erwärmungs- und Uferfolgen anhand der gegebenen Informationen.',
        'The learner describes nutrient input, decomposition and oxygen consumption as well as warming and shoreline effects from the supplied information.',
        'Bei einer veränderten Landschaft werden Transport, Zerschneidung und langjährige Trockenheit neu verbunden; unbekannte Sauerstoffwerte oder Aussterbezahlen bleiben offen.',
        'For a changed landscape the learner connects transport, fragmentation and prolonged drought while leaving unknown oxygen values or extinction counts unresolved.'
    ),
    (
        'Nachhaltige Nutzung berücksichtigt Regeneration, langfristige Funktionen, Versorgung und Verteilung; Erneuerbarkeit allein bedeutet keine unbegrenzte Ressource.',
        'Sustainable use considers regeneration, long-term functions, supply and distribution; renewability alone does not mean an unlimited resource.',
        'Die lernende Person erläutert ein Ressourcennutzungskonzept mit biologischer Regeneration, Nutzungsgrenzen und begründeter Anpassung an Kontrolldaten.',
        'The learner explains a resource-use concept with biological regeneration, use limits and justified adaptation to monitoring data.',
        'Nach Wechsel vom Wald zum Grundwasser werden der andere Regenerationsmechanismus, Grundversorgung und Verteilungskonflikte erklärt; Nachpflanzen garantiert keine Nachhaltigkeit.',
        'Moving from forest to groundwater, the learner explains the different regeneration mechanism, basic supply and distribution conflicts; replanting does not guarantee sustainability.'
    ),
]

manifest = json.loads((BASE / 'visual-followup/selected20.neutral.frozen.json').read_text())
assert len(expectations) == len(manifest['images']) == 20
evidence = dict(zip([x['goalId'] for x in manifest['images']], expectations))
science = json.loads((BASE / 'whole20-D-P-source.independent-b.science-first.json').read_text())
science_by_id = {x['goalId']: x for x in science['verdicts']}
visual = json.loads((BASE / 'visual-followup/first-actual-V20-independent-b.findings.json').read_text())
visual_by_id = {x['goalId']: x for x in visual['rows']}
campaign = json.loads((NATIVE / 'round-b/description-review-campaign.json').read_text())
inputs = json.loads((NATIVE / 'round-b/description-review-input.json').read_text())
batch = campaign['batches'][0]
run_id = campaign['roundId'] + '.actual-independent-b.run-001'
results = OUT / 'native-D-results'
results.mkdir(exist_ok=True)
records = []
field_names = ['essentialUnderstandingDe', 'essentialUnderstandingEn', 'observablePerformanceDe', 'observablePerformanceEn', 'transferExpectationDe', 'transferExpectationEn']
for goal in inputs['goals']:
    goal_id = goal['goalId']
    notes = science_by_id[goal_id]
    row = {
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1,
        'recordId': campaign['roundId'] + '.' + goal_id,
        'runId': run_id,
        'campaignId': campaign['campaignId'],
        'roundId': campaign['roundId'],
        'bundleFingerprint': campaign['bundleFingerprint'],
        'bookDigest': campaign['bookDigest'],
        **{k: goal[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},
        'decision': 'keep',
        'understandingEvidence': dict(zip(field_names, evidence[goal_id])),
        'rationale': notes['descriptionReason'] + ' Ganze DE/EN-Fälle und aktuelle V2-Profile wurden unabhängig gelesen: ' + notes['positiveProfileReason'] + ' Aktuelle gebundene PDF-Seite tatsächlich gesehen; ganzes ausgewähltes PNG sowie echte Browseransichten 360/680 geprüft. ' + visual_by_id[goal_id]['visualAndScientificRationale'],
        'evidenceProfileContract': 'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation': 'create',
        'recordStatus': 'candidate',
        'reviewAuthority': 'ai_candidate',
    }
    records.append(row)
record_path = results / (batch['batchId'] + '.records.jsonl')
record_path.write_text(''.join(json.dumps(r, ensure_ascii=False, separators=(',', ':')) + '\n' for r in records))
run = {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    'schemaVersion': 1,
    'runId': run_id,
    'campaignId': campaign['campaignId'],
    'roundId': campaign['roundId'],
    'batchId': batch['batchId'],
    'batchInputFingerprint': batch['batchInputFingerprint'],
    'bundleFingerprint': campaign['bundleFingerprint'],
    'bookDigest': campaign['bookDigest'],
    'provider': 'OpenAI',
    'model': 'GPT-6 (Codex runtime identity)',
    'role': 'subject_reviewer',
    'promptFamilyId': 'goal-description-understanding-evidence-v2',
    'promptFingerprint': campaign['promptFingerprint'],
    'criteriaFingerprint': campaign['criteriaFingerprint'],
    'generationParametersFingerprint': 'sha256:' + hashlib.sha256(b'independent-b-whole-DP-source-actual20PNG-40browser-20PDF-review').hexdigest(),
    'independenceGroupId': campaign['independenceGroupId'],
    'blindToOtherRuns': True,
    'goalIds': batch['goalIds'],
    'inputArtifacts': [
        {'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']},
        {'role':'book_pdf','digest':sha(NATIVE / 'book.pdf')},
        {'role':'book_model','digest':sha(NATIVE / 'book-model.json')},
        {'role':'book_pdf_render_manifest','digest':sha(NATIVE / 'book.pdf.render-manifest.json')},
        {'role':'review_prompt','digest':campaign['promptFingerprint']},
        {'role':'review_criteria','digest':campaign['criteriaFingerprint']},
        {'role':'run_manifest_schema','digest':sha(NATIVE / 'bundle/contracts/goal-evidence-ai-run-manifest.schema.json')},
    ],
    'startedAt': datetime.datetime.fromtimestamp((OUT / 'current-neutral-full-input.json').stat().st_mtime, datetime.timezone.utc).isoformat(),
    'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'status': 'completed',
    'outputDigest': sha(record_path),
    'toolchainVersion': 'skillpilot-native-description-review-v2',
}
run_path = results / (batch['batchId'] + '.run.json')
write(run_path, run)
command = [str(ROOT / 'app/node_modules/.bin/tsx'), str(ROOT / 'app/scripts/validateGoalDescriptionReviewCampaign.ts'), '--bundle', str(NATIVE / 'round-b/review-bundle-manifest.json'), '--input', str(NATIVE / 'round-b/description-review-input.json'), '--campaign', str(NATIVE / 'round-b/description-review-campaign.json'), '--run', str(run_path), '--batch-input', str(NATIVE / 'round-b/batches' / (batch['batchId'] + '.input.jsonl')), '--records', str(record_path)]
result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True)
(OUT / 'native-D20-independent-b.stdout.txt').write_text(result.stdout)
(OUT / 'native-D20-independent-b.stderr.txt').write_text(result.stderr)
write(OUT / 'native-D20-independent-b.command-result.json', {'command':command, 'exitCode':result.returncode, 'actualExecution':True})
print(result.stdout, result.stderr)
assert result.returncode == 0

# Keep the actual whole reviewed profile bodies, scope limits, truthful E1/G1
# status and original dissent. No second fake blind experiment or human approval.
positive = [json.loads(line) for line in (AUTHOR / 'native-raster-candidate/P20.actual-raster-author.review.jsonl').read_text().splitlines() if line]
old_material = json.loads((BASE / 'neutral-inputs/materials-revision-v3/P20.current-text-preimage.author-v3.candidates.json').read_text())
old_by_id = {x['goalId']: x for x in old_material['goals']}
for row in positive:
    goal_id = row['goalId']
    assert row['profile'] == old_by_id[goal_id]['profile']
    assert row['status'] == 'needs_human_review' and row['reviewAuthority'] == 'ai_candidate'
    assert row['evidenceLevel'] == 'E1' and row['maximumClaimScope'] == 'G1' and row['reviewRunIds'] == []
    row['reviewId'] = 'biologie-ecology20-current391-positive-independent-b-20261007-v1'
    row['reviewer'] = 'independent-b-codex-gpt-6-runtime-exact-serving-revision-unavailable'
    row['reviewedAt'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    row['reason'] = 'Eigene unabhängige ganze DE/EN-Beschreibung, zwei komplette Modellfälle und V2-Profil fachlich geprüft; tatsächliche ausgewählte PNGs sowie 360/680- und PDF-Seitenkontexte geprüft. ' + science_by_id[goal_id]['positiveProfileReason'] + ' E1/G1-Modellkandidat; keine Lernendenbeobachtung oder menschliche Freigabe. Historische Dissents und Kurs-/Quellenpflichtgrenzen bleiben erhalten.'
(OUT / 'P20.current-actual-raster.independent-b.review.jsonl').write_text(''.join(json.dumps(row, ensure_ascii=False, separators=(',', ':')) + '\n' for row in positive))
print('Own native D20 and independent P20 records written; public-P CLI pending Root approved integration.')
