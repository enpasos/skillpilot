"""Native records from the actual independent A review of the seven final pages."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json

REPO = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
BASE = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06'
AUTHOR = BASE / 'biologie-q1-seven-final-native-review-inputs-author-v1'

def read(path):
    return json.loads(path.read_text())

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def bind(path):
    return {'path': str(path.relative_to(REPO)), 'sha256': sha(path), 'bytes': path.stat().st_size}

def write(name, value):
    (OWN / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def canonical_sha(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

assert not (OWN / 'independent-d-a.final.freeze.json').exists(), 'Frozen review'
stamp = datetime.now(timezone.utc).isoformat()
input = read(AUTHOR / 'round-a/description-review-input.json')
campaign = read(AUTHOR / 'round-a/description-review-campaign.json')
bundle = read(AUTHOR / 'bundle/manifest.json')
exact = read(OWN / 'exact-round-a-bundle-image-source-context-and-pdf-inputs.actual.json')
html = read(OWN / 'actual-bound-html-browser-checks.json')
assert html['allSevenCurrentDescriptionsTitlesImagesAndAltTextsExact']
assert len(exact['selectedSevenRows']) == 7
prior = {row['goalId']: row for row in read(BASE / 'biologie-q1-seven-native-v6-independent-a-v1/seven-science-atomicity-prerequisite-memory.review.json')['goals']}
positive_inputs = read(AUTHOR / 'inputs/positive-review-inputs.native-fingerprints.pending.json')
material_path = REPO / positive_inputs['sourceMaterial']['path']
assert 'sha256:' + sha(material_path) == positive_inputs['sourceMaterial']['sha256']
material = read(material_path)
canon = {goal['id']: goal for goal in read(AUTHOR / 'inputs/canonical-390.de.candidate.json')['goals']}
material_rows = []
for row in positive_inputs['rows']:
    assert row['wholeCurrentCandidateGoal'] == canon[row['goalId']]
    keys = []
    for case in row['currentSourceCaseBodies']:
        actual = material
        for part in case['JSONPointer'].split('/')[1:]:
            actual = actual[int(part)] if isinstance(actual, list) else actual[part]
        assert actual == case['caseBody']
        assert canonical_sha(actual) == case['caseBodyCanonicalJSONSHA256'].replace('sha256:', '')
        keys.append(actual.get('caseId', actual.get('caseKey')))
    assert keys == prior[row['goalId']]['caseKeys']
    material_rows.append({'goalId': row['goalId'], 'actualCaseKeys': keys,
        'actualSourcePointers': [case['JSONPointer'] for case in row['currentSourceCaseBodies']],
        'wholeMaterialBodiesExactPriorOwnA': True, 'wholeCurrentCandidateGoalAndFinalUUIDBindingExact': True,
        'priorMaterialScientificJudgement': 'exact reuse; no new P-profile or learner evidence inferred'})
assert sum(len(row['actualCaseKeys']) for row in material_rows) == 16
source_rows = []
for region in ['BE', 'BB', 'SN', 'TH', 'MV', 'ST']:
    if region in ['BE', 'BB']:
        original = BASE / 'biologie-q1-seven-component-native-source-preparation-author-v6' / f'{region}.source-components.author-candidate.inert-envelope.json'
    elif region == 'MV':
        original = BASE / 'biologie-q1-mv-heading-location-targeted-author-v8/MV.source-components.author-v8.inert-envelope.json'
    else:
        original = BASE / 'biologie-q1-seven-component-source-topic-corrections-author-v7' / f'{region}.source-components.author-v7.inert-envelope.json'
    extraction_path = AUTHOR / f'inputs/source-components/{region}.source-extraction.candidate.json'
    extraction = read(extraction_path)
    assert extraction == read(original)['candidatePayload']
    original_mapping = BASE / 'biologie-q1-seven-component-native-source-preparation-author-v6' / f'{region}.source-component-mappings.author-candidate.inert-envelope.json'
    mapping_path = AUTHOR / f'inputs/source-components/{region}.mapping.candidate.json'
    mapping = read(mapping_path)
    expected_mapping = read(original_mapping)['candidatePayload']
    assert mapping['sourceExtractionPath'] == str(extraction_path.relative_to(REPO))
    expected_mapping['sourceExtractionPath'] = mapping['sourceExtractionPath']
    assert expected_mapping == mapping
    for source_goal, mapped in zip(extraction['sourceGoals'], mapping['mappings'], strict=True):
        assert source_goal['id'] == mapped['legacyGoalId'] and mapped['matchType'] == 'partial'
        assert source_goal['description'] == canon[mapped['canonicalGoalId']]['description']
        source_rows.append({'region': region, 'sourceGoalId': source_goal['id'], 'canonicalGoalId': mapped['canonicalGoalId'],
            'actualCurrentExtraction': bind(extraction_path), 'exactReviewedSourceBasis': bind(original),
            'actualCurrentMapping': bind(mapping_path), 'onlyTechnicalMappingDelta': 'sourceExtractionPath to exact own isolated current extraction',
            'actualSourceTopicCode': source_goal['topicCode'], 'physicalPage': source_goal['physicalPage'], 'printedPage': source_goal['printedPage'],
            'sourceSectionContext': source_goal.get('sourceSectionContext'), 'stage': source_goal['stage'],
            'rawCourseLevel': source_goal.get('rawCourseLevel'), 'wholeOriginalSourceHoldReleased': False,
            'independentScientificSourceDecisionReuse': 'exact own A sources; MV v8 correct body-heading locator; no global source clearance'})
assert len(source_rows) == 13
write('actual-final-thirteen-source-sixteen-material-bindings-and-reuse.json', {
    'schemaVersion': 1, 'createdAtUTC': stamp,
    'sourceRows': source_rows, 'sourceComponents': 13, 'materialRows': material_rows, 'actualCaseCount': 16,
    'materialSource': bind(material_path), 'finalNativePInput': bind(AUTHOR / 'inputs/positive-review-inputs.native-fingerprints.pending.json'),
    'noHistoricalGoalTextOrMaterialReviewRestart': True, 'currentPageImageContextReviewedIndependently': True,
    'positiveProfileCreatedOrApproved': False, 'nativeAOrMemoryRecordsCreated': False,
    'roundBInputOrPeerDConclusionsRead': False, 'activeWrites': False,
})

# Each tuple is an independently written goal-specific chain, not a V2 profile.
chains = {
 'ac9e824f-003c-50ac-8751-2b8456004c63': (
  'DNA ist das Material der Erbinformation; ein Gen ist ein Abschnitt dieser DNA und ein Chromosom ihre organisierte Trägerstruktur. Diese Begriffe beschreiben unterschiedliche Ebenen desselben Modells, keine gleich großen voneinander getrennten Träger.',
  'DNA is the material of genetic information; a gene is a section of that DNA and a chromosome is its organised carrier structure. These terms describe different levels of the same model rather than equally sized separate carriers.',
  'Die lernende Person ordnet in einem vorgegebenen Modell DNA, Genabschnitt und Chromosom begründet einander zu und erklärt, weshalb die Zahl der Chromosomen nicht die Zahl der Gene festlegt und nicht jeder markierte DNA-Abschnitt automatisch ein zusätzliches Chromosom ist.',
  'The learner justifiably relates DNA, a gene section and a chromosome in a supplied model, and explains why chromosome number does not determine gene number and why a labelled DNA section is not an additional chromosome.',
  'In einem neuen Modell mit mehreren Chromosomen und verschieden markierten DNA-Abschnitten stellt die lernende Person dieselbe Träger-Abschnitt-Beziehung ohne die Beschriftungsanordnung des Lernzielbildes her und benennt, welche Information für eine Aussage zur Gesamtzahl der Gene noch fehlt.',
  'In a fresh model with several chromosomes and differently labelled DNA sections, the learner reconstructs the same carrier-section relationship without relying on the learning image layout and identifies the information missing for a claim about total gene number.',
  'KEEP: Eine zusammenhängende Material-Abschnitt-Träger-Beziehung, gleichwertig DE/EN und ohne unbeanspruchte molekulare Details. Die aktuelle reale Seite1/physisch3 zeigt genau diese Verschachtelung; Gen-Klammer und Größenvereinfachung passen zum Alttext. Die sechs Nachfolger beanspruchen eigenständige Mutations-/Variabilitätsroutinen und duplizieren diese Grundrelation nicht. Direkte Quellenkomponenten BE/BB bleiben begrenzt; die vier weiteren rohen Länderattribute bezeichnen deklarierte Voraussetzungverfügbarkeit und keine neue direkte Quellenpflicht. Zwei unveränderte vollständige Modellfälle sind an diese UUID gebunden. Ein Bild oder seine Beschriftung beweist keine unabhängige Leistung.'),
 '5eb7c923-469d-5934-b1e8-292e1bb40d95': (
  'Genmutation, Chromosomenmutation und Genommutation unterscheiden sich nach der Ebene einer vorgegebenen Veränderung: Abschnitt eines Gens, größere Chromosomenstruktur oder Chromosomenzahl. Eine unveränderte Chromosomenzahl schließt die beiden erstgenannten Ebenen nicht aus; Ursachen und unmittelbare Informationsfolgen brauchen passende Belege.',
  'Gene, chromosome and genome mutations differ by the level of a supplied change: a section within a gene, larger chromosome structure or chromosome number. An unchanged chromosome count does not rule out the first two levels; causes and immediate information effects require appropriate evidence.',
  'Die lernende Person vergleicht gegebene DNA-, Abschnitts- und Chromosomensatzmodelle, begründet die drei Zuordnungen anhand der tatsächlich veränderten Ebene und trennt vorgegebene Ursachen beziehungsweise unmittelbar belegte Informationsfolgen von nicht nachgewiesenen Merkmalsfolgen.',
  'The learner compares supplied DNA, segment and chromosome-complement models, justifies the three classifications using the level actually altered and distinguishes given causes or directly evidenced information changes from unestablished trait effects.',
  'In einer frischen Darstellung mit beispielsweise einer Abschnittsverdopplung statt eines Verlusts und einer anderen lokalen DNA-Veränderung hält die lernende Person die Ebenen trotz unveränderter Chromosomenzahl auseinander und begründet die Informationsfolgen mit den neuen Daten statt mit dem Beispielbild.',
  'In a fresh representation using, for example, a segment duplication instead of a deletion and another local DNA change, the learner distinguishes levels despite unchanged chromosome number and justifies information consequences using the new data rather than the example image.',
  'KEEP: Der Zieltext verbindet die Ebenenzuordnung mit ihrer datenbelegten Erklärung; keine zusätzliche unabhängig zu meisternde Vollgenetik- oder Krankheitsroutine. Fachtext und vorausgesetzte Trägerrelation sind unverändert zu gültigem eigenem A. Die finale Seite2/physisch4 zeigt drei deutlich getrennte Ebenen; symbolische DNA-Paare werden im Alttext nicht als konkrete Basen ausgegeben. SN Lernbereich1/Klasse10 und TH2.2.1.3/Klassen9–10 bleiben korrekt gebunden, beide Teilmappings bleiben partial. Zwei vollständige Materialfälle sind exakt erhalten. Die Formulierung fordert keine unbelegten universellen Merkmalsfolgen.'),
 'bfb5dfb6-8e35-5452-b581-96e061d8b826': (
  'Eine Änderung an einer einzelnen Basenpaarposition und eine Änderung der Zahl vollständiger Chromosomen betreffen verschiedene Modellebenen. Die Punkt-/Genomzuordnung richtet sich nach der tatsächlich gezeigten Veränderung, nicht nach einem auffälligen Merkmal oder allein nach unveränderter Chromosomenzahl.',
  'A change at one base-pair position and a change in the number of whole chromosomes affect different model levels. Point/genome classification follows the change actually shown, not a conspicuous trait or unchanged chromosome number alone.',
  'Die lernende Person lokalisiert in vorgegebenen Sequenzen die einzelne geänderte Basenpaarposition, zählt vollständige Chromosomen im Vergleichssatz und begründet beide Zuordnungen; sie erklärt, weshalb gleiche Chromosomenzahl eine lokale Sequenzänderung nicht ausschließt.',
  'The learner locates the single altered base-pair position in supplied sequences, counts whole chromosomes in the comparison complement and justifies both classifications, explaining why equal chromosome number does not rule out a local sequence change.',
  'Bei einer neuen Darstellung mit unveränderter Gesamtzahl und einem bestätigten lokalen Basenpaaraustausch sowie einem zweiten Fall mit veränderter Anzahl, aber unverändertem gezeigtem Sequenzausschnitt, entscheidet die lernende Person anhand der jeweiligen Modelldaten statt einer sichtbaren Merkmalsänderung.',
  'With a fresh representation showing unchanged total chromosome number and a confirmed local base-pair substitution, together with another case of changed number but an unchanged shown sequence region, the learner decides from the respective model data rather than a visible trait change.',
  'KEEP: Enger vergleichender Einordnungsanspruch, gleichwertig DE/EN; keine vollständige Taxonomie aller Punktmutationskonventionen wird hinzugefügt. Auf Seite3/physisch5 wird genau ein G-C→A-T-Austausch und eine vollständige Chromosomenzahländerung gezeigt; beide übrigen Chromosomen bleiben im Modell erhalten. Quelle ST3.5 Einführungsphase nennt Genom-/Punktmutation. Technische gemeinsame GK/LK-Projektion wird nicht als ursprüngliche GK/LK-Quellwortwahl ausgegeben; rawCourseLevel bleibt unspecified. Zwei unveränderte Fälle begrenzen ausdrücklich ihre Modellkonvention.'),
 '3a0d6c82-f9f0-5ad1-bb0b-b948e4450d04': (
  'Mutagene Einwirkungen können DNA-Schäden und bei nicht erfolgreicher Korrektur bleibende Veränderungen begünstigen. Eine verringerte Exposition kann unter den vorgegebenen Bedingungen das Risiko senken; weder ist jede Mutation nur durch diesen Einfluss verursacht noch bedeutet Schutz ein Nullrisiko.',
  'Mutagenic influences can favour DNA damage and persistent change when correction does not succeed. Reduced exposure can lower risk under the supplied conditions; neither is every mutation caused by that influence nor does protection mean zero risk.',
  'Die lernende Person erklärt anhand kontrollierter Materialdaten den Zusammenhang von Einwirkung, möglichem DNA-Schaden und bleibender Veränderung, bewertet genetische Risiken nach den benannten Kriterien und begründet eine tatsächlich geeignete Expositionsverringerung einschließlich der Daten- und Schutzgrenzen.',
  'The learner uses controlled supplied data to explain the relationship among exposure, possible DNA damage and persistent change, evaluates genetic risks using the stated criteria and justifies an actually suitable exposure reduction including limits of the data and protection.',
  'In einer neuen Alltags- oder Umweltsituation mit einer andersartigen vorgegebenen mutagenen Einwirkung und verändertem Vergleich von Dauer oder Abschirmung wählt die lernende Person Schutz anhand der neuen Wirksamkeitsdaten und erläutert, welche Aussagen sich nicht auf andere Einwirkungen oder Menschen übertragen lassen.',
  'In a fresh everyday or environmental situation with a different supplied mutagenic influence and a changed comparison of duration or shielding, the learner chooses protection using the new effectiveness data and explains which claims cannot be transferred to other influences or to people.',
  'KEEP: Erklärung, kriterielle Risikobewertung und passende Schutzwahl bilden eine begründete Umgangsroutine für genau die gegebene Einwirkung. Keine individuelle Gesundheitsprognose oder absolute Sicherheit. Seite4/physisch6 und ihr Alttext zeigen UV mit verringertem Risiko, ein erhaltenes DNA-Rückgrat und symbolische Verbindung benachbarter Basen; daraus wird keine Lernendenleistung abgeleitet. MV3.2/Klasse10 mit tatsächlicher Elternüberschrift17/13 und ST3.5 bleiben korrekt. Vier aktuelle Fälle sind unverändert gebunden und liefern Ursachen-/Schutzbelege ohne reale Versuchsdurchführung zu behaupten.'),
 '9d830422-acc7-5fa8-aee9-4dae4cedbf49': (
  'In einem vorgegebenen Zelllinienmodell begrenzen Abstammung und Zeitpunkt, welche Nachkommenzellen eine Mutation tragen. Eine Mutation der Körperzelllinie ist ebenfalls eine genetische Veränderung; mögliche Weitergabe an Organismusnachkommen erfordert eine betroffene, tatsächlich beteiligte Keimzelle unter den angegebenen Modellbedingungen.',
  'In a supplied lineage model, ancestry and timing constrain which descendant cells carry a mutation. A somatic-lineage mutation is still a genetic change; possible transmission to organismal offspring requires an affected gamete that actually participates under the stated model conditions.',
  'Die lernende Person verfolgt die gegebene Mutation entlang der Zellabstammung, vergleicht einen früheren mit einem späteren Eintritt und unterscheidet Verteilung im Organismus von möglicher Weitergabe durch beteiligte Keimzellen, ohne aus einem Mutationssymbol ein bestimmtes Merkmal abzuleiten.',
  'The learner traces the supplied mutation through cell ancestry, compares earlier and later occurrence and distinguishes distribution within the organism from possible transmission through participating gametes without deriving a particular trait from a mutation symbol.',
  'Bei einem neuen Zelllinienbaum mit anders platziertem Mutationsereignis und einer anderen Verzweigung der Keimbahn kennzeichnet die lernende Person die betroffenen Nachkommenlinien und begründet, welche beobachteten oder nur möglichen Weitergaben aus den vorgegebenen Bedingungen folgen.',
  'In a fresh lineage tree with a differently placed mutation event and a changed germline branching pattern, the learner marks affected descendant lineages and justifies which observed or merely possible transmissions follow from the supplied conditions.',
  'KEEP: Eine gemeinsame Abstammungs-/Zeitpunktroutine, DE/EN gleichwertig und ausdrücklich an ein vorgegebenes Modell gebunden. Seite5/physisch7 zeigt die frühe Embryonalzelle, spätes begrenztes Körperzellereignis und gestrichelte mögliche Keimzellweitergabe. Der Alttext begrenzt Sterne auf Mutationssymbole und nennt die erforderliche Befruchtungsbeteiligung. MV-Körperzell/Keimbahnpunkt ist partial und unverändert mit Klasse10/Klassische Genetik sowie korrekter Elternlokation17/13 verbunden. Zwei genaue Modellfälle tragen dieselbe UUID; es wird keine allgemeine somatische Nichtvererbung über alle Organismen behauptet.'),
 'd0c3e6a7-581b-57bd-8027-e940c6b77af8': (
  'Ein Merkmalsunterschied kann unter den gegebenen Bedingungen auf veränderter Erbinformation oder auf einer Umweltwirkung bei unveränderter Erbinformation beruhen. Gleiches oder verschiedenes Aussehen allein unterscheidet Mutation und Modifikation nicht; genetische und Umweltvergleichsdaten begrenzen die Schlussfolgerung.',
  'Under the supplied conditions, a trait difference can reflect changed genetic information or an environmental influence with unchanged genetic information. Similar or different appearance alone does not distinguish mutation from modification; genetic and environmental comparison data limit the conclusion.',
  'Die lernende Person begründet die Zuordnung mithilfe der vorgegebenen Genotyp-/DNA- und Umweltkontrollen, trennt die sichtbare Merkmalsbeobachtung von der belegten Ursache und nennt, welche Aussage bei fehlenden oder nur abschnittsbezogenen genetischen Daten offenbleibt.',
  'The learner justifies classification using supplied genotype/DNA and environmental controls, distinguishes the visible trait observation from its evidenced cause and identifies what remains unresolved when genetic data are missing or restricted to one region.',
  'In einem neuen kontrollierten Vergleich mit gleichen sichtbaren Merkmalen trotz bestätigter DNA-Veränderung beziehungsweise einer Umweltänderung bei ausdrücklich unveränderter Erbinformation entscheidet die lernende Person aus den neuen Kontrolldaten und weist eine allein aus dem Aussehen abgeleitete Ursachenbehauptung zurück.',
  'In a fresh controlled comparison showing similar visible traits despite confirmed DNA change, or an environmental change with explicitly unchanged genetic information, the learner decides using the new control data and rejects a causal claim based on appearance alone.',
  'KEEP: Enger datenbezogener Unterscheidungsanspruch mit ausdrücklich benannten Schlussgrenzen; gleiche DE/EN-Bedingungen. Die finale Seite6/physisch8 trennt kontrollierte Umwelt- und DNA-Vergleiche und enthält den Hinweis Merkmale allein reichen nicht. Die DNA-Gleichheit ist eine Modellvorgabe, keine allein aus Pflanzenhöhe erschlossene Tatsache. Zwei tatsächliche Fälle und vier Quellenkomponenten SN/TH/MV/ST sind unverändert; alle korrigierten Abschnitts-/Jahrgangs-/Seitenbindungen bleiben exakt. Keine vollständige zusätzliche Epigenetik- oder Universalursachenkompetenz wird eingeführt.'),
 'aab2a358-b2ee-57a5-a957-8fb9845506b1': (
  'Fehlerkontrolle und Reparatur können im vorgegebenen Kopiermodell die ursprüngliche genetische Information erhalten. Eine anfängliche Fehlpaarung ist noch keine nachgewiesene dauerhafte Mutation; erfolglose oder unterlassene Korrektur kann bei weiterer Kopie eine bleibende Veränderung ermöglichen, ohne dass Reparatur vollkommenen Schutz garantiert.',
  'Error control and repair can preserve the original genetic information in the supplied copying model. An initial mispairing is not yet an established permanent mutation; unsuccessful or absent correction can allow persistent change on subsequent copying, while repair does not guarantee perfect protection.',
  'Die lernende Person erkennt eine falsche Paarung mithilfe der angegebenen Paarungsregel und intakten Vorlage, erklärt eine passende Korrektur sowie deren Bedeutung und unterscheidet beobachtete Kopierfehler von im weiteren Verlauf bestätigten bleibenden Sequenzänderungen.',
  'The learner identifies a wrong pairing using the supplied pairing rule and intact template, explains an appropriate correction and its significance, and distinguishes observed copying errors from persistent sequence changes confirmed later.',
  'An einem frischen Kopiermodell mit geänderter Vorlage oder anderem markierten neuen Strang und zusätzlichen späteren Kopierbefunden erklärt die lernende Person erneut die mögliche Korrektur, entscheidet über eine tatsächlich belegte bleibende Änderung und benennt, was ein bloßer Fehlerzählwert noch nicht zeigt.',
  'Using a fresh copying model with a changed template or differently marked new strand and additional later-copy observations, the learner explains the possible correction again, decides whether persistent change is actually evidenced and identifies what a copying-error count alone does not establish.',
  'KEEP: Erklärung einer zusammenhängenden Fehlerkontroll-/Reparaturfunktion mit ausdrücklich erhaltenen Grenzen, ohne neue Enzym-/Mechanismenliste. Seite7/physisch9 zeigt dieselben sechs Paarpositionen, A-C in der Mitte, A-T im Reparaturzweig und mögliches G-C nach weiterer Kopie; gestrichelte Kopie und Alttext verhindern die Gleichsetzung jeder Fehlpaarung mit sicherer bleibender Mutation. TH2.2.1.3/Klassen9–10 bindet genau Fehlerkontrolle/Reparatur; die breite gesamte Replikationspflicht bleibt separat. Zwei vollständige Fälle sind exakt gebunden. Keine Bildbeschriftung gilt als selbst erzeugte Leistung.'),
}
assert set(chains) == {goal['goalId'] for goal in input['goals']}
run_id = 'biologie-q1-seven-final-native-d-independent-a-v1-run-001'
fields = ['essentialUnderstandingDe', 'essentialUnderstandingEn', 'observablePerformanceDe',
          'observablePerformanceEn', 'transferExpectationDe', 'transferExpectationEn']
records = []
for goal in input['goals']:
    chain = chains[goal['goalId']]
    assert len(chain) == 7 and goal['reviewContext']['evidenceProfile'] is None
    records.append({
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1, 'recordId': 'bio-q1-final-d-a-v1-' + goal['goalId'], 'runId': run_id,
        'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
        'bundleFingerprint': input['bundleFingerprint'], 'bookDigest': input['bookDigest'],
        **{field: goal[field] for field in ['goalId', 'goalFingerprint', 'pageFingerprint',
                                          'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']},
        'decision': 'keep', 'understandingEvidence': dict(zip(fields, chain[:6], strict=True)),
        'rationale': chain[6], 'evidenceProfileContract': 'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation': 'create', 'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate',
    })
results = OWN / 'results'
results.mkdir(exist_ok=True)
records_path = results / 'independent-a.batch-001.records.jsonl'
records_path.write_text(''.join(json.dumps(record, ensure_ascii=False, separators=(',', ':')) + '\n' for record in records))
parameters = {
    'reviewer': 'Codex GPT-6 agent', 'exactRuntimeVariantAndGenerationParameters': 'not exposed; not invented',
    'currentReviewScope': 'round-a native seven final pages', 'currentPeerDescriptionRunsRead': False,
    'priorOwnNonNativeScientificJudgementsReused': True,
    'reviewIntent': 'targeted actual final page/image/source/context review, not blanket hash renewal',
    'learnerDataUsed': False,
}
write('truthful-review-parameters.json', parameters)
batch = campaign['batches'][0]
run = {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    'schemaVersion': 1, 'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
    'batchId': batch['batchId'], 'batchInputFingerprint': batch['batchInputFingerprint'],
    'bundleFingerprint': bundle['bundleFingerprint'], 'bookDigest': bundle['bookModelDigest'],
    'provider': 'OpenAI', 'model': 'Codex GPT-6; exact runtime variant not exposed', 'role': 'subject_reviewer',
    'promptFamilyId': 'skillpilot-goal-description-understanding-evidence-v2',
    'promptFingerprint': campaign['promptFingerprint'], 'criteriaFingerprint': campaign['criteriaFingerprint'],
    'generationParametersFingerprint': 'sha256:' + sha(OWN / 'truthful-review-parameters.json'),
    'independenceGroupId': campaign['independenceGroupId'], 'blindToOtherRuns': True,
    'goalIds': batch['goalIds'],
    'inputArtifacts': [{'role': artifact['role'], 'digest': artifact['digest']} for artifact in bundle['artifacts']]
                     + [{'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']}],
    'startedAt': exact['createdAtUTC'], 'completedAt': stamp, 'status': 'completed',
    'outputDigest': 'sha256:' + sha(records_path), 'toolchainVersion': 'skillpilot-goal-description-review-v2',
}
(results / 'independent-a.batch-001.run.json').write_text(json.dumps(run, ensure_ascii=False, indent=2) + '\n')
write('seven-final-page-context.actual-independent-a-review.json', {
    'schemaVersion': 1, 'createdAtUTC': stamp, 'reviewer': 'independent native D A',
    'actualBoundPDFPhysicalPagesViewed': [3, 4, 5, 6, 7, 8, 9],
    'actualBoundHTMLDescriptionsTitlesLoadedImagesAndAltTextsInspected': 7,
    'priorOwnNonNativeAReuse': 'exact valid goal texts and old materials; current page/context/image/source bonds separately checked',
    'roundBInputOtherCurrentDRecordsOrAdjudicationRead': False,
    'KEEP': 7, 'REVISE': 0, 'SPLIT_REVIEW': 0, 'BLOCK': 0,
    'nativeRecords': bind(records_path), 'nativeRun': bind(results / 'independent-a.batch-001.run.json'),
    'evidenceProfileRecommendation': 'create7; no current V2 profile supplied',
    'nativePApprovalGranted': False, 'nativeAtomicityOrMemoryLedgerChanges': False,
    'effectiveWholeGUIScopeIntegrationVerified': False,
    'wholeOriginalSourceHolds': 'preserved separately; no complete3417/ST/SH/BY clearance',
    'activeBiology': '67/383', 'activeChemistry': '112/378',
    'strictNetGain': 0, 'newScientificCompletions': 0, 'restoredActiveBindings': 0,
    'activeWrites': False, 'humanApproval': False, 'humanTrial': False,
})
print(json.dumps({'nativeRecords': len(records), 'KEEP': 7, 'profilesRecommendedCreate': 7,
                  'exactSources': 13, 'exactMaterialCases': 16, 'activeWrites': False, 'strictGain': 0}))
