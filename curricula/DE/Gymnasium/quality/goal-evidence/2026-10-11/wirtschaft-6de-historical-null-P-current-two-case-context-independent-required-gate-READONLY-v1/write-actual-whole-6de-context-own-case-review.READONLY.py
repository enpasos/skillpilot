"""Record the actual independent P-null/current-P context review, without new D2."""
from pathlib import Path
import datetime, hashlib, json, subprocess

ROOT = Path.cwd()
OUT = Path(__file__).resolve().parent
ID = '6de44afa-7f91-5fa4-9292-ec06e86e97a4'
SCOPED = ROOT / ('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-forty-nine-valid-D2-current-owner-page-scoping-AUTHOR-INERT-c-v1/whole49-current-and-original-contexts/' + ID + '.READONLY.json')
def read(path):
    return json.loads(Path(path).read_text())
def binding(path):
    path = Path(path)
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT) if path.is_absolute() else path),
            'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}
def write(name, value):
    with (OUT / name).open('x') as target:
        target.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return binding(OUT / name)
def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()

context = read(SCOPED)
book_path = 'app/scripts/config/goal-books/de-gym-economics-current-canonical.json'
registry_path = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
book = read(ROOT / book_path)
canonical = read(ROOT / book['landscapePath'])
goals = {g['id']: g for g in canonical['goals']}
goal = goals[ID]
assert goal == context['actualWholeCurrentGoal']
combined = [json.loads(line) for path in book['evidenceReviewPaths']
            for line in (ROOT / path).read_text().splitlines() if line.strip()]
profile = next(r for r in combined if r['goalId'] == ID)
assert profile == context['actualWholeCurrentPositiveRecord']
assert len(profile['profile']['applicationCaseBriefs']) == 2
qa = read(ROOT / book['goalVisualizationQaPath'])
qa_record = next(r for r in qa['records'] if r['goalId'] == ID)
path_set = {str(SCOPED.relative_to(ROOT)), book_path, registry_path, book['landscapePath'],
            book['semanticKindLedgerPath'], book['compositionViewPath'], book['goalVisualizationQaPath'],
            *book['evidenceReviewPaths'], 'app/public' + goal['resourceLinks'][0]['url']}
for source in context['wholeActualExistingSourceOrigins']:
    source_path = source['sourceFile']['path']
    mapping_path = source['mappingFile']['path']
    extraction = read(ROOT / source_path)
    mapping = read(ROOT / mapping_path)
    atom = next(g for g in extraction['sourceGoals'] if g['id'] == source['wholeCurrentOriginSourceAtom']['id'])
    parent = next(p for p in extraction['passages'] if p.get('id', p.get('passageId')) == atom['passageId'])
    assert atom == source['wholeCurrentOriginSourceAtom'] and parent == source['wholeCurrentParentPassage']
    assert all(edge in mapping['mappings'] for edge in source['wholeCurrentMappings'])
    assert all(row in mapping['decisions'] for row in source['wholeCurrentDecisions'])
    path_set.update([source_path, mapping_path])
for old in context['wholeOriginalBothReviewInputs']:
    path_set.add(old['wholePhysicalInputBinding']['path'])
    assert old['wholeOriginalGoalInput']['reviewContext']['evidenceProfile'] is None
    assert old['wholeOriginalGoalInput']['reviewContext']['page']['evidenceReview'] is None
    assert old['wholeOriginalGoalInput']['canonicalContext'] == context['nativeCurrentCanonicalContext']
for old in context['wholeOriginalBothScientificRecordsAndRuns']:
    path_set.add(old['wholeRunPhysicalBinding']['path'])
    assert old['wholeOriginalScientificRecord']['evidenceProfileRecommendation'] == 'create'
    assert old['wholeOriginalScientificRecord']['decision'] == 'keep'
for old in context['wholeCurrentNeighborGoalBodies']:
    assert goals[old['id']] == old
pair = context['selectedExistingSciencePair']
path_set.update(pair[key]['path'] for key in ['index', 'resolution', 'dualSummary', 'synthesisManifest'])
for round_pair in pair['existingIndependentRounds']:
    path_set.update(round_pair[key]['path'] for key in ['campaign', 'reviewInput', 'runManifest', 'actualResults'])
before = [binding(ROOT / p) for p in sorted(path_set)]
snapshot = write('actual-one-whole-current-goal-P2-QA-source-and-old-null-P-science-context.INPUT.READONLY.json', {
    'observedAtUtc': now(), 'sourceC49WholeInput': binding(SCOPED), 'wholeCurrentGoal': goal,
    'wholeCurrentPositiveRecord': profile, 'wholeCurrentQARecord': qa_record,
    'wholeCurrentNativePage': context['currentNativePage'],
    'wholeCurrentCanonicalContext': context['nativeCurrentCanonicalContext'],
    'wholeOriginalBothReviewInputs': context['wholeOriginalBothReviewInputs'],
    'wholeOriginalBothScientificRecordsAndRuns': context['wholeOriginalBothScientificRecordsAndRuns'],
    'wholeOriginalAcceptedResolution': context['wholeOriginalAcceptedResolution'],
    'wholeCurrentSourceOrigins': context['wholeActualExistingSourceOrigins'],
    'wholeCurrentPrerequisiteAndPractice': context['wholeCurrentNeighborGoalBodies'],
    'oldPReallyNull': True, 'oldPWholeParityWithCurrent': False, 'activeWrites': 0})

own_cases = [
    {
        'caseId': 'health-workers-and-remittances',
        'answerDe': 'Das Entwicklungsland verliert bei vorhandenem Pflegepersonalmangel unmittelbar nutzbare qualifizierte Arbeit. Bei gleichem Bedarf kann dies Zugang zur Versorgung verschlechtern oder die verbleibenden Beschäftigten stärker belasten. Bereits getragene Ausbildungskosten und mögliche künftige Beiträge dürfen getrennt betrachtet werden; sie liefern ohne weitere Daten keine ausrechenbare Gesamtschadenssumme. Rücküberweisungen können die empfangenden Haushalte finanziell unterstützen. Sie sind aber ein Geldstrom, keine zusätzliche Pflegekraft: Empfänger, Verwendung und mögliche Ausbildungskapazitäten bestimmen, ob und wann daraus ein weiterer Versorgungsnutzen entsteht. Im Industrieland können die freien Stellen besetzt und Versorgungsengpässe vermindert werden, soweit Abschlüsse anerkannt werden und die Personen tatsächlich passende Aufgaben übernehmen können. Anerkennungsverzögerung, Sprach- und Einarbeitungsbedarf können Qualifikation zunächst ungenutzt lassen und Übergangskosten verursachen. Auch Interessen der Wandernden und die Verteilung von Nutzen und Belastungen unterscheiden sich. Aus diesem Material folgt weder ein sicherer dauerhafter Gesamtschaden im Herkunftsland noch ein automatischer Gesamtgewinn im Zielland. Für ein Nettoergebnis fehlen unter anderem Zeitverlauf, tatsächliche Beschäftigung, Ersatzqualifizierung, Finanzierung und Verteilungsdaten.',
        'answerEn': 'The developing country immediately loses usable skilled work while nursing staff are already scarce. With unchanged demand, this can reduce access to care or increase the burden on remaining workers. Past training expenditure and possible future contributions should be distinguished; neither yields a numerical total loss without further data. Remittances can support recipient households financially. They are a money flow, not another nurse: recipients, uses and training capacity determine whether and when an additional care benefit results. In the industrialised country, vacancies and care shortages can be reduced if qualifications are recognised and migrants can actually perform suitable work. Delayed recognition, language and induction needs can leave skills unused initially and create transition costs. Migrants’ interests and the distribution of gains and burdens also differ. The material establishes neither inevitable permanent harm at origin nor an automatic overall gain at destination. A net result requires evidence about time, actual employment, replacement training, finance and distribution.',
        'counterexampleDe': 'Eine Person nennt korrekt Brain Drain und Überweisungen, behauptet aber: Jede Überweisung erhöht die Zahl verfügbarer Pflegekräfte sofort, daher ist der Verlust bereits ausgeglichen. Diese Antwort beherrscht die Begriffe, verfehlt aber die Analyse, weil Haushaltsgeld mit qualifizierter öffentlicher Versorgungsleistung gleichgesetzt wird und Anerkennung sowie Zeit ignoriert werden. Eine begründete Gegenantwort kann dagegen positive Haushaltswirkungen anerkennen und einen verbleibenden Pflegeengpass erklären, ohne beides in eine unbelegte Gesamtbilanz zu zwingen.',
        'counterexampleEn': 'A learner names brain drain and remittances correctly but claims that every transfer immediately raises the number of available nurses, so the loss is already offset. This shows vocabulary without the required analysis: household money is equated with skilled public service and recognition and time are ignored. A defensible answer can recognise positive household effects while explaining a remaining care shortage without inventing an overall balance.'
    },
    {
        'caseId': 'return-network-and-unequal-access',
        'answerDe': 'Die technische Abwanderung kann im Herkunftsland knappe Fachkompetenz und Umsetzungskapazität verringern. Wie stark dies wirkt, hängt von tatsächlicher bisheriger Beschäftigung, Ersatzqualifizierung und zeitlichem Verlauf ab. Im Zielland bedeutet Ankunft noch keinen produktiv nutzbaren Fachkräftegewinn: Nicht anerkannte Abschlüsse und begrenzter Jobzugang können qualifizierte Personen zunächst unterhalb ihrer Fähigkeiten beschäftigen. Das Netzwerk eröffnet einen möglichen Wissensrückfluss auch ohne physische Rückkehr. Realer Nutzen setzt aber zugänglichen Austausch, passende Inhalte, benötigte Arbeitsmittel und Menschen oder Organisationen voraus, die das Wissen umsetzen können. Begrenzte Rückkehr schließt deshalb Wissenstransfer nicht aus; ein Netzwerkversprechen beweist ihn jedoch auch nicht. Tatsächlich zurückgekehrte, passend eingesetzte Fachkräfte können Kapazität wieder aufbauen. Ob dies den ursprünglichen Verlust vollständig kompensiert, bleibt anhand des Materials offen. Unterschiedliche Anerkennungs-, Ausbildungs- und Zugangsmöglichkeiten können sowohl die Herkunfts- als auch die Zielwirkungen verändern; Migration ist weder zwangsläufig dauerhafter Verlust noch automatisch Wissensgewinn.',
        'answerEn': 'Technical migration can reduce scarce expertise and implementation capacity at origin. Its scale depends on actual previous employment, replacement training and time. Arrival does not guarantee a usable skilled-labour gain at destination: unrecognised qualifications and restricted job access can leave people working below their capabilities. The network offers a possible knowledge flow back without physical return. Real benefits require accessible exchange, relevant content, appropriate tools and people or organisations able to implement it. Limited return therefore does not rule out knowledge transfer, but a network promise does not establish it. Actual returning professionals employed in suitable positions can rebuild capacity. Whether that fully compensates the original loss remains open. Recognition, training and access conditions can alter effects in both countries; migration is neither inevitable lasting loss nor automatic knowledge gain.',
        'counterexampleDe': 'Die Behauptung Ohne Rückkehr kann es keinen Wissensrückfluss geben ist falsch: Zugänglicher technischer Austausch und lokale Umsetzung können auch auf Distanz stattfinden. Die umgekehrte Behauptung Ein digitales Netzwerk kompensiert jeden Fachkräfteverlust ist ebenfalls unbegründet: Kontakte ohne tatsächlichen Zugang oder Arbeitsmittel schaffen noch keine nutzbare Leistung. Eine strukturelle Variation, in der Anerkennung rasch erfolgt und lokale Teams das übermittelte Wissen tatsächlich anwenden, ändert die Analyse gegenüber einem Fall mit blockiertem Jobzugang und unzugänglichem Netzwerk; die Zahl bloßer Kontakte genügt für diese Änderung nicht.',
        'counterexampleEn': 'No knowledge can flow back without return migration is false: accessible technical exchange and local implementation can occur at a distance. A digital network compensates every skill loss is equally unsupported: contacts without effective access or tools do not create usable capacity. Rapid recognition and local teams actually applying transmitted knowledge change the analysis compared with blocked employment and an inaccessible network; a count of contacts alone does not.'
    }
]
practice_answer = {
    'answerDe': 'Im tatsächlich gebundenen Nachfolger bleiben in Solana100−20=80 qualifizierte Pflegekräfte, also20% weniger. In Norvia schließen nur12 bereits anerkannte Kräfte zunächst12 der20 Stellenlücken;8 Stellen bleiben im vereinfachten Modell offen. Die8 noch nicht anerkannten Zugewanderten sind nicht automatisch8 zusätzliche nutzbare Pflegekräfte.40.000 Geldeinheiten sind ein finanzieller Zufluss an Haushalte, keine belegte Ersatzversorgung. Vier Rückkehrabsichten erhöhen die aktuelle80-Zahl nicht. Qualifizierte tatsächliche Rückkehr oder wirksamer Austausch mit passenden Stellen, Arbeitsmitteln und Zugang könnten spätere Wirkungen entfalten. Geeignete bedingte Reaktionen verbinden in Norvia qualitätsgesicherte Anerkennung und Einarbeitung mit in Solana verbesserten Arbeitsbedingungen und Ausbildungskapazität. Freiwilligkeit, Kosten und Interessen bleiben zu prüfen. Messbar wären tatsächlich qualifiziert besetzte Stellen und Anerkennungszeiten am Ziel sowie Versorgungszugang und qualifizierte Kapazität am Ursprung, nicht allein Überweisungssummen.',
    'answerEn': 'The actual successor leaves100−20=80 qualified nurses in Solana, a20% reduction. Only12 already recognised workers initially fill12 of Norvia’s20 vacancies;8 remain open in the simplified model. The8 still awaiting recognition are not automatically8 usable extra nurses.40,000 monetary units are household finance, not established replacement care. Four intentions to return do not increase the current80. Actual qualified return or effective exchange with suitable jobs, tools and access could produce later effects. A conditional response combines quality-assured recognition and induction at destination with better working conditions and training capacity at origin. Voluntariness, costs and interests require examination. Suitable measures include actually qualified filled posts and recognition time at destination, and access to care and skilled capacity at origin, rather than remittance totals alone.',
    'practiceWholeReviewClaim': False, 'purpose': 'Own bounded answer confirms the existing successor contextualises the same ordinary competence; no new general assessment approval.'}
review = write('actual-independent-6de-old-null-P-current-two-case-and-accepted-synthesis-context-KEEP.READONLY.receipt.json', {
    'artifactKind': 'INDEPENDENT_BOUNDED_CONTEXT_COMPATIBILITY_NOT_NEW_DUAL_REVIEW',
    'recordedAtUtc': now(), 'headAtReview': subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip(),
    'goalId': ID, 'reviewer': '/root/economics_final679_required_gate_plan',
    'provider': 'OpenAI/Codex', 'model': 'Exact serving model identifier not exposed in this session',
    'independence': {'ownGoalOrPAuthoringFor6deInThisSession': False,
                     'actualPAuthorLabel': profile['reviewer'],
                     'identifiedOwnNineO10GoalPAuthorsExclude6de': True,
                     'originalDualRoundAndSynthesisWereRead': True,
                     'rootRequestedCompatibilityQuestionKnown': True,
                     'currentD12OrD10ReviewerDecisionsRead': False,
                     'historicalBlindnessClaim': False},
    'wholeBoundInput': snapshot, 'decision': 'KEEP',
    'oldPWasActuallyNullForBothOriginalReviews': True,
    'oldProfileCreateRecommendationsAndReviewTimesRemainHistory': True,
    'oldPWholeParityWithCurrent': False,
    'currentPCompatibleWithAcceptedOriginalUnderstandingEvidence': True,
    'ownWholeTwoBilingualCaseAnswersAndMasteryCounterexamples': own_cases,
    'ownBoundedExistingPracticeAnswer': practice_answer,
    'rationaleDe': 'Die neue Bindung liefert den bislang im Buch fehlenden P-Kontext, ohne die gewöhnliche Kompetenz umzudefinieren. Beide P-Fälle operationalisieren die in der akzeptierten zweiten D-Runde und Synthese bereits vollständig formulierte Trennung von Geld, qualifizierter Arbeit, Rückkehrabsicht, tatsächlicher Rückkehr und umgesetztem Wissenstransfer. Der Pflegefall verlangt die Herkunfts-/Zielanalyse unter Knappheit und Anerkennung; der technische Fall verändert Berufsqualifikation, Anerkennung, Dauer und Transferzugang. Meine beiden vollständigen Antworten und gegensätzlichen Gegenbeispiele zeigen dieselbe konditionale Analyseoperation und keine neue selbständige Recall-, Rechts- oder Rechenpflicht. Die vorhandene Voraussetzung Inklusive Entwicklung erklärt die Verteilungs-/Nachhaltigkeitsperspektive, der unveränderte Nachfolger macht genau diese Migrationsanalyse beobachtbar. Das neue Profil ist E1/G1/ai_candidate/needs_human_review, keine Lernendenleistung oder menschliche Freigabe. Die originalen create-Empfehlungen sind zur alten P-null-Epoche wahr und werden nicht nachträglich zu P-KEEP umgeschrieben. KEEP betrifft ausschließlich die fachliche Kompatibilität des heutigen P-/Nachbarkontexts mit der intakten akzeptierten D2-Science; technische Ownerbindung und Aktivierung bleiben Root vorbehalten.',
    'rationaleEn': 'The new binding supplies the P context previously absent from the Book without redefining the ordinary competence. Both cases operationalise distinctions already fully stated in the accepted second D round and synthesis: money, skilled work, intended and actual return, and implemented knowledge transfer. Nursing requires origin/destination analysis under scarcity and recognition, while the technical case varies qualifications, recognition, duration and transfer access. My complete answers and opposing counterexamples demonstrate the same conditional analysis without adding independent recall, legal or calculation demands. Inclusive development supports the distribution and sustainability perspective and the unchanged successor makes this migration analysis observable. Current E1/G1/AI-candidate status is neither learner evidence nor human approval. Historical create recommendations remain truthful to their P-null epoch. KEEP is limited to current context compatibility with intact accepted D2 science; technical ownership and activation remain with Root.',
    'sourceAndCourseBoundary': {'currentDirectMappingWholeObjectVerified': True,
                              'canonicalHELKQ4Retained': True,
                              'oldSourceSnapshotGK_LKIsOverriddenByExistingQualifiedLKDecision': True,
                              'snapshotQ4_15NotOfficialBulletOrVerbatimPDFClaim': True,
                              'existingSourceQualificationReused': True, 'newWholePrimarySourceApproval': False},
    'newNativeD2ReviewRuns': 0, 'newOwnerArtifacts': 0, 'newReviewerTimestampsInHistoricalRuns': 0,
    'currentPScientificStatusChanged': False, 'activeWrites': 0,
    'newM7OrStrictCompletionClaim': False, 'humanApprovalClaim': False})
after = [binding(ROOT / p) for p in sorted(path_set)]
assert before == after
guards = write('actual-6de-bounded-input-before-after.READONLY.json', {
    'recordedAtUtc': now(), 'beforeBindings': before, 'afterBindings': after,
    'inputCount': len(before), 'actualChanges': [], 'activeWrites': 0})
artifacts = [binding(p) for p in sorted(OUT.iterdir()) if p.is_file()]
seal = write('SEALED-independent-6de-old-null-P-current-whole-two-case-context-KEEP.READONLY.json', {
    'sealedAtUtc': now(), 'artifactKind': 'BOUNDED_INDEPENDENT_CONTEXT_KEEP_NOT_NEW_D2',
    'reviewReceipt': review, 'inputEndguards': guards, 'artifacts': artifacts,
    'historicalPNullTruthPreserved': True, 'falsePWholeParityClaim': False,
    'activeWrites': 0, 'newD2Runs': 0, 'newStrictCompletionClaims': 0})
print(json.dumps({'seal': seal, 'review': review, 'inputs': len(before), 'decision': 'KEEP'}))
