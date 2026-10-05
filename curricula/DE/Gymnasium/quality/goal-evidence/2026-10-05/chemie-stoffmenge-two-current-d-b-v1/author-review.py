import datetime
import hashlib
import json
import pathlib
import subprocess

root = pathlib.Path.cwd()
base = root / 'curricula/DE/Gymnasium/quality/goal-description-review/chemie/rollout-v1/2026-10-05/batch-013w-mol-analysis-corrected-images-current-2-v1'
evidence = root / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-stoffmenge-two-current-d-b-v1'
round_b = base / 'round-b'
campaign = json.loads((round_b / 'description-review-campaign.json').read_text())
review_input = json.loads((round_b / 'description-review-input.json').read_text())
bundle = json.loads((base / 'bundle/manifest.json').read_text())
run_id = 'chemie-013w-current-2-review-b-20261005'
batch = campaign['batches'][0]
results = round_b / 'results'
results.mkdir(parents=True, exist_ok=True)

chains = [
    {
        'essentialUnderstandingDe': 'Die Stoffmenge n beschreibt, wie viele ausdrücklich festgelegte Teilchen eine Stoffportion enthält; mol ist ihre Einheit. Ein Mol umfasst eine festgelegte Anzahl dieser Teilchen, unabhängig davon, welche Teilchenart gemeint ist. Moleküle und die Atome innerhalb dieser Moleküle sind unterschiedliche Zählgegenstände; deshalb benötigt eine eindeutige Stoffmengenangabe neben Zahl und mol auch den Teilchenbezug.',
        'essentialUnderstandingEn': 'Amount of substance n describes how many explicitly specified entities a sample contains; mol is its unit. One mole comprises a fixed number of those entities regardless of their type. Molecules and the atoms within those molecules are different counting entities, so an unambiguous amount statement needs the entity reference as well as a number and mol.',
        'observablePerformanceDe': 'Die lernende Person erläutert ohne die Buchgrafik, was eine Angabe wie n(H₂O-Moleküle) = 1 mol bedeutet, unterscheidet Stoffmenge, Teilchenzahl und Masse und begründet, warum gleich große Stoffmengen verschiedener festgelegter Teilchenarten gleich viele dieser Teilchen umfassen. Sie formuliert eine vorgelegte ungenaue Molangabe mit benannter Teilchenart, Zahlenwert und Einheit eindeutig, statt nur das Einheitenwort zu wiederholen.',
        'observablePerformanceEn': 'Without the book graphic, the learner explains what a statement such as n(H₂O molecules) = 1 mol means, distinguishes amount of substance, particle number and mass, and explains why equal amounts of different specified entity types contain equal numbers of those entities. The learner makes an imprecise mole statement unambiguous by naming its entities, numerical value and unit rather than merely repeating the unit name.',
        'transferExpectationDe': 'In einer neuen, selbstständig zu bearbeitenden Aufgabe zu einer O₂-Stoffportion wechselt der Bezug von Sauerstoffmolekülen zu den darin gebundenen Sauerstoffatomen. Die lernende Person präzisiert beide Molangaben und begründet anhand der Molekülformel, warum der geänderte Zählgegenstand zu einer anderen Stoffmengenangabe für dieselbe Portion führt. Der Transfer betrifft die Festlegung der Teilchen, nicht eine neue Zahl in einer N/N_A-Rechnung.',
        'transferExpectationEn': 'In a fresh task to be completed independently about an O₂ sample, the reference changes from oxygen molecules to the oxygen atoms bound within them. The learner specifies both mole statements and uses the molecular formula to explain why the changed counting entity gives a different amount statement for the same sample. The transfer concerns specifying entities rather than replacing a number in an N/N_A calculation.'
    },
    {
        'essentialUnderstandingDe': 'Bei einer kontrolliert ausgewerteten Verbrennung einer Kohlenwasserstoffprobe werden deren Kohlenstoff- und Wasserstoffatome in den Produkten CO₂ und H₂O wiedergefunden. Kalkwassertrübung und Blaufärbung von zuvor wasserfreiem Kupfersulfat weisen zunächst diese Produkte nach; erst die Herkunft der erhaltenen C- und H-Atome begründet den Rückschluss auf die Probe. Die qualitative Aussage betrifft die Anwesenheit von Elementen, nicht ihre Mengenverhältnisse oder die genaue Molekülformel; Sauerstoff kann aus dem zugeführten O₂ stammen.',
        'essentialUnderstandingEn': 'When the combustion of a hydrocarbon sample is evaluated under controlled conditions, its carbon and hydrogen atoms are accounted for in the products CO₂ and H₂O. Cloudy limewater and the blue colour of initially anhydrous copper sulfate first identify those products; tracing their conserved C and H atoms then supports the inference about the sample. This qualitative conclusion concerns the presence of elements rather than their proportions or the exact molecular formula; oxygen may originate in the supplied O₂.',
        'observablePerformanceDe': 'Die lernende Person wertet bereitgestellte Beobachtungen eines fachgerecht durchgeführten oder beaufsichtigten Nachweises unabhängig aus: weißes wasserfreies CuSO₄ wird blau, klares Kalkwasser wird trüb. Sie trennt Beobachtung, Produktnachweis und Elementschluss, ordnet CO₂ dem Kohlenstoff und H₂O dem Wasserstoff der Probe zu und erklärt mit Atomerhaltung, warum die nachgewiesenen Verbindungen diese Schlüsse tragen. Sie erläutert dabei, warum die Befunde weder ein C:H-Verhältnis noch Sauerstoff in der ursprünglichen Probe belegen.',
        'observablePerformanceEn': 'The learner independently evaluates supplied observations from a properly conducted or supervised test: white anhydrous CuSO₄ turns blue and clear limewater becomes cloudy. The learner separates observation, product identification and inference about elements, links CO₂ to carbon and H₂O to hydrogen in the sample, and uses atom conservation to explain why those compounds support the conclusions. The learner explains why these findings establish neither a C:H ratio nor oxygen in the original sample.',
        'transferExpectationDe': 'Eine neue Aufgabe liefert einen anders dargestellten Versuchsbericht mit einem Wassernachweis erst hinter dem wässrigen Kalkwasser und einem vorgelegten Kontrollbefund. Die lernende Person erkennt, dass dort nachgewiesenes Wasser auch aus der Nachweislösung stammen kann, und begründet, welche vorhandenen Beobachtungen weiterhin einen Elementschluss erlauben und welche Aussage über Wasserstoff in der Probe zusätzliche abgesicherte Produktdaten benötigt. Die Veränderung betrifft die Herkunft des Nachweissignals; sie verlangt keine eigene gefährliche Verbrennung oder quantitative Analyse.',
        'transferExpectationEn': 'A fresh task supplies a differently represented experiment report in which the water test comes after aqueous limewater, together with a provided control observation. The learner recognises that detected water may also originate in the test solution and explains which available observations still support an elemental conclusion and which claim about hydrogen in the sample requires additional reliable product data. The change concerns the origin of the detection signal and requires neither carrying out hazardous combustion nor quantitative analysis.'
    }
]

rationales = [
    'keep. Die DE/EN-Beschreibungen sind bedeutungsgleich, kurz und für Sek I verständlich: Stoffmenge wird als Maß für die Anzahl ausdrücklich festgelegter Teilchen und mol als Einheit dieser Größe beansprucht. Dies entspricht der aktuell eingesehenen Primärdefinition des BIPM (https://www.bipm.org/en/si-base-units/mole): n bezieht sich auf spezifizierte elementare Einheiten; die Moldefinition fixiert exakt 6,02214076 × 10²³ solcher Einheiten. Der amtliche HE-G9-Lehrplan, 9.1, gedruckte S. 16 / PDF-S. 17 (curricula/DE/Gymnasium/input/HE/lower-secondary/g9-chemie.pdf), nennt Stoffmenge und ihre Einheit als eigene Klausel neben molarer Masse, u/g und dem Proportionalitätsfaktor. Diese benachbarten Klauseln erweitern dieses Ziel nicht. Begriffsdeutung und eindeutige Molangabe bilden eine atomare Kompetenz, weil die korrekte Angabe gerade den verstandenen Teilchenbezug ausdrückt. AB2 wird durch Erläutern und Begründen sichtbar; bloßes Abschreiben von mol reicht nicht. Die Vorbedingung e7c363d4 (Symbole/Molekülformeln) trägt das Benennen der Zählgegenstände. Die gebundenen externen Nachfolger zu molarer Masse, u/g, Avogadro-Konstante, Gasvolumina und Stoffumsätzen grenzen die Reichweite ab: keine ausführliche N/n-Umrechnung, Massenrechnung, Gasgesetzanwendung oder Reaktionsstöchiometrie als zusätzliche D-Forderung. In den tatsächlich angesehenen PNG-, HTML- und PDF-Zielseiten (PDF-S. 3) sind beide gerundeten 6,022 × 10²³-Angaben nun mit ≈ ausgezeichnet; die Dutzendangabe bleibt exakt. Damit wird der fachliche Unterschied zwischen festgelegter Moldefinition und verkürzter Zahlendarstellung korrekt unterstützt. Die Brücke und wenigen gezeichneten Wasser-Moleküle sind schematische Lehrhilfen; die gezeichnete Teilchenzahl zählt kein reales Mol und die Zählanalogie setzt Stoffmenge nicht mit dimensionsloser Teilchenzahl gleich. n = N/N_A ist fachlich konsistent, dient hier der Anschauung und zieht nicht die eigenständige Folgekompetenz vor. Alle Texte, ID, externe Voraussetzungen und Bildbeschriftungen sind vollständig im aktuellen Seitenkontext sichtbar. sourceRef und semanticAtomic sind im Eigeninput null: weder vollständige Bundesland-Mapping-/Projektionsprüfung noch eine formale A-Freigabe wird daraus behauptet. Das gebundene evidenceProfile ist null; deshalb create als Empfehlung, ohne irgendein externes Profil zu lesen oder zu ersetzen. Entscheidung bleibt candidate/ai_candidate und enthält keine menschliche, Veröffentlichungs- oder Lernendenfreigabe.',
    'keep. DE und EN beschreiben dieselbe begrenzte Sek-I-Kompetenz: gegebene qualitative Elementaranalysen auswerten und C/H aus den nachgewiesenen Verbrennungsprodukten erschließen. Die Beschreibung fordert kein selbstständiges Durchführen, keine Elementmengenverhältnisse, empirische Formel oder Bestimmung beliebiger weiterer Elemente. Die beiden Nachweise sind die zusammengehörige Begründung eines einzigen C/H-Elementschlusses für Kohlenwasserstoffe; sie begründen keinen Split. Der amtliche HE-G9-Lehrplan, 10.4, gedruckte S. 26 / PDF-S. 27 (curricula/DE/Gymnasium/input/HE/lower-secondary/g9-chemie.pdf), nennt qualitative Elementaranalyse bei gesättigten Kohlenwasserstoffen; benachbarte Aussagen zu Eigenschaften, Strukturformeln, Rohölverarbeitung oder Umweltbewertung gehören nicht zusätzlich zu diesem Ziel. Die zwei gebundenen Vorbedingungen e7c363d4 (Symbole/Formeln) und 11bea4c6 (Reaktionsgleichungen) ermöglichen, Produktformeln und Atomerhaltung zu verstehen; das Nachweisschema und Beobachtungsdaten dürfen als Lernmaterial bereitgestellt werden. Direkte in-book/externe Reverse-requires sind im Eigeninput leer; daraus folgt keine Behauptung über ungebundene Folgezielpfade. Die chemische Kette Beobachtung → H₂O/CO₂-Identifikation → H/C in der Ausgangsprobe ist schlüssig, wenn der Produktursprung abgesichert ist. Sauerstoff aus O₂ bleibt als Reaktionspartner getrennt; qualitative positive Tests bestimmen keine Molekülformel und belegen kein O in der Probe. Als unabhängige fachliche Primärkontrolle bestätigt Pearson, offizielles 8CH0/01 Mark Scheme Summer 2022, Aufgabe 9(b), PDF-S. 35 (https://qualifications.pearson.com/content/dam/pdf/A-Level/Chemistry/2015/Exam-materials/8ch0-01-rms-20220818.pdf), die beiden Testsignale sowie die Reihenfolge Wassernachweis vor Kalkwasser, um Wasser aus der wässrigen Nachweislösung nicht als Verbrennungsprodukt zu verwechseln. Das ist eine fachliche Kontrolle, keine deutsche Scope-/Mappingquelle. Im aktuellen PNG und auf den tatsächlich angesehenen HTML-/PDF-Zielseiten (PDF-S. 4) sind CO₂-Kugeln nun eindeutig O–C–O und H₂O-Kugeln H–O–H beschriftet; Summenformeln und Elementschlüsse stimmen. Gasstrom und Reihenfolge CuSO₄ vor Kalkwasser sind nachvollziehbar. Das Bild zeigt ein gegebenes didaktisches Nachweisschema, keine vollständige Bau-, Dosierungs- oder Sicherheitsanleitung; Laborversuche benötigen eine beaufsichtigte fachgerechte Ausführung oder vorgelegte Daten. Das Bild liefert keine eigenständige Leistung der lernenden Person. Die Kontrollfrage zur Signalherkunft konkretisiert Auswertung innerhalb des beanspruchten Ziels; eine Methodenplanungs- oder Sicherheitskompetenz wird nicht hinzugefügt. Eine knappe Beschreibung muss diese detaillierte Evidenzkette nicht auflisten. ID, Beschreibung und Voraussetzungen sind vollständig und lesbar auf einer Zielseite. sourceRef und semanticAtomic sind null: keine vollständige Jurisdiktions-/Projektionsprüfung oder formale A-Freigabe wird beansprucht. Eigeninput evidenceProfile=null führt ehrlich zu create. Ausschließlich candidate/ai_candidate, keine menschliche, Produktions- oder Lernendenfreigabe.'
]

records = []
for index, goal in enumerate(review_input['goals']):
    record = {
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1,
        'recordId': f'{run_id}.goal-{index + 1:03}',
        'runId': run_id,
        'campaignId': campaign['campaignId'],
        'roundId': campaign['roundId'],
        'bundleFingerprint': review_input['bundleFingerprint'],
        'bookDigest': review_input['bookDigest'],
        **{key: goal[key] for key in ('goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn')},
        'decision': 'keep',
        'understandingEvidence': chains[index],
        'rationale': rationales[index],
        'evidenceProfileContract': 'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation': 'create',
        'recordStatus': 'candidate',
        'reviewAuthority': 'ai_candidate'
    }
    assert len(record['rationale']) <= 4000
    records.append(record)
records_path = results / (batch['batchId'] + '.records.jsonl')
records_path.write_text(''.join(json.dumps(record, ensure_ascii=False, separators=(',', ':')) + '\n' for record in records))
digest = lambda data: 'sha256:' + hashlib.sha256(data).hexdigest()
parameters = {
    'provider': 'OpenAI',
    'model': 'GPT-6 (Codex; exact service variant not exposed to reviewer)',
    'temperature': 'not exposed by runtime',
    'seed': 'not exposed by runtime',
    'reviewRole': 'independent subject reviewer B',
    'scope': batch['goalIds'],
    'blindToOtherReviewOutputs': True,
    'profileInput': 'null for both assigned goals; no external profiles consulted'
}
parameters_path = evidence / 'generation-parameters.json'
parameters_path.write_text(json.dumps(parameters, ensure_ascii=False, indent=2) + '\n')
completed_at = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z')
started_at = datetime.datetime.fromtimestamp((evidence / 'pdf-pages/page-1.png').stat().st_mtime, datetime.timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z')
run = {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    'schemaVersion': 1,
    'runId': run_id,
    'campaignId': campaign['campaignId'],
    'roundId': campaign['roundId'],
    'batchId': batch['batchId'],
    'batchInputFingerprint': batch['batchInputFingerprint'],
    'bundleFingerprint': bundle['bundleFingerprint'],
    'bookDigest': bundle['bookModelDigest'],
    'provider': parameters['provider'],
    'model': parameters['model'],
    'role': 'subject_reviewer',
    'promptFamilyId': 'goal-description-understanding-evidence-review-v2',
    'promptFingerprint': campaign['promptFingerprint'],
    'criteriaFingerprint': campaign['criteriaFingerprint'],
    'generationParametersFingerprint': digest(parameters_path.read_bytes()),
    'independenceGroupId': campaign['independenceGroupId'],
    'blindToOtherRuns': True,
    'goalIds': batch['goalIds'],
    'inputArtifacts': [{ 'role': artifact['role'], 'digest': artifact['digest'] } for artifact in bundle['artifacts']] + [{ 'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint'] }],
    'startedAt': started_at,
    'completedAt': completed_at,
    'status': 'completed',
    'outputDigest': digest(records_path.read_bytes()),
    'toolchainVersion': 'skillpilot-goal-description-review-v1'
}
run_path = results / (batch['batchId'] + '.run.json')
run_path.write_text(json.dumps(run, ensure_ascii=False, indent=2) + '\n')

he_source = root / 'curricula/DE/Gymnasium/input/HE/lower-secondary/g9-chemie.pdf'
he_pages = subprocess.check_output(['pdftotext', '-layout', str(he_source), '-'], text=True).split('\f')
(evidence / 'sources/he-g9-target-extract.txt').write_text('PDF physical page 17, printed page 16\n' + he_pages[16] + '\nPDF physical page 27, printed page 26\n' + he_pages[26])
pearson = evidence / 'sources/pearson-8ch0-01-rms-20220818.pdf'
pearson_pages = subprocess.check_output(['pdftotext', '-layout', str(pearson), '-'], text=True).split('\f')
pearson_target_page = next(index for index, text in enumerate(pearson_pages, 1) if 'limewater turns cloudy' in text)
(evidence / 'sources/pearson-9b-extract.txt').write_text(f'PDF physical page {pearson_target_page}\n' + pearson_pages[pearson_target_page - 1])
print(json.dumps({'records': str(records_path.relative_to(root)), 'run': str(run_path.relative_to(root)), 'outputDigest': run['outputDigest'], 'pearsonTargetPhysicalPage': pearson_target_page, 'rationaleLengths': [len(r) for r in rationales]}, ensure_ascii=False, indent=2))
