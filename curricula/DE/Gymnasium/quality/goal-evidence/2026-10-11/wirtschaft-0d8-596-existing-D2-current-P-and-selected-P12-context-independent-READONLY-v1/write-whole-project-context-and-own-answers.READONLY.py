from pathlib import Path
import datetime, hashlib, importlib.util, json

R = Path.cwd()
O = Path(__file__).resolve().parent
IDS = ['0d8cb18d-7fd9-56f5-8009-8045d44f4127', '596c02e3-6263-5084-8593-c5f51808326b']
guards = {}
sha = lambda p: 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()

def read(p):
    guards[str(p.relative_to(R))] = {'path': str(p.relative_to(R)), 'sha256': sha(p), 'bytes': p.stat().st_size}
    return json.loads(p.read_text())

def jsonl(p):
    guards[str(p.relative_to(R))] = {'path': str(p.relative_to(R)), 'sha256': sha(p), 'bytes': p.stat().st_size}
    return [json.loads(l) for l in p.read_text().splitlines()]

def write(name, value):
    with (O/name).open('x') as f:
        f.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def delta(a, b, path=''):
    if type(a) != type(b): return [{'path': path, 'before': a, 'after': b}]
    if isinstance(a, dict):
        out=[]
        for k in sorted(set(a)|set(b)):
            out += delta(a.get(k), b.get(k), path + '.' + k)
        return out
    if isinstance(a, list):
        if len(a) != len(b): return [{'path': path, 'before': a, 'after': b}]
        return [d for i,(x,y) in enumerate(zip(a,b)) for d in delta(x,y,path+f'[{i}]')]
    return [] if a == b else [{'path': path, 'before': a, 'after': b}]

S=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-current-D246-open100-whole-binding-package-scoping-READONLY-c-v1'
scope=read(S/'actual-current100-six-disjoint-packages-and-current49-concrete-owner-context-inputs.READONLY.json')
native=read(S/'actual-post-RootP2-original-native-current-open100-full-page-and-canonical-contexts.READONLY.json')
cfg=read(R/'app/scripts/config/goal-books/de-gym-economics-current-canonical.json')
can=read(R/cfg['landscapePath']); byid={g['id']:g for g in can['goals']}
profiles={p['goalId']:p for p in jsonl(R/cfg['evidenceReviewPaths'][0])}
qa=read(R/cfg['goalVisualizationQaPath'])
mapping=read(R/'curricula/DE/Gymnasium/mapping/DE-BE/lower-secondary/be_wat_lower_secondary_source_extraction_to_canonical_wirtschaft.review.json')
source=read(R/mapping['sourceExtractionPath'])
atom=next(x for x in source['sourceGoals'] if x['id']=='be-wat-seki-p12-projektmethoden-g01-ea879d83')
parent=next(x for x in source['passages'] if x['id']==atom['passageId'])
decision=next(x for x in mapping['decisions'] if x['sourceGoalId']==atom['id'])
edges=[x for x in mapping['mappings'] if x['legacyGoalId']==atom['id']]
assert set(decision['canonicalGoalIds'])==set(IDS) and decision['matchType']=='partial'
assert len(edges)==2 and all(x['matchType']=='partial' for x in edges)
classic=read(R/'curricula/DE/Gymnasium/input/BY/gymnasium/Wirtschaft_und_Recht.json')
native32=read(R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-final970-boundaries-native32-full-target-support-memory-delta-READONLY-v1/final32-after970-active-whole-target-support-memory-IDsets.READONLY.json')
for row in native32['DE-BE'].values(): assert set(IDS)<=set(row['wholeTargetGoalIds'])
whole=[]
for gid in IDS:
    row=next(x for x in scope['current100Rows'] if x['goalId']==gid); pair=row['existingOriginalTwoRoundPair']
    page=next(x for x in native['wholeCurrentOpenPages'] if x['goalId']==gid)
    ctx=next(x for x in native['wholeCurrentCanonicalContexts'] if x['goalId']==gid)['context']
    rounds=[]
    for rd in pair['existingIndependentRounds']:
        inp=read(R/rd['reviewInput']['path']); ig=next(x for x in inp['goals'] if x['goalId']==gid)
        record=next(x for x in jsonl(R/rd['actualResults']['path']) if x['goalId']==gid)
        run=read(R/rd['runManifest']['path'])
        pd=delta(ig['reviewContext']['evidenceProfile'],profiles[gid])
        assert ig['canonicalContext']==ctx
        assert (ig['currentTitleDe'],ig['currentTitleEn'],ig['currentDescriptionDe'],ig['currentDescriptionEn'])==(byid[gid]['title'],byid[gid]['titleEn'],byid[gid]['description'],byid[gid]['descriptionEn'])
        assert ig['reviewContext']['evidenceProfile']['profile']['applicationCaseBriefs']==profiles[gid]['profile']['applicationCaseBriefs']
        if gid==IDS[1]: assert not pd
        else:
            assert {x['path'] for x in pd}=={'.profile.expectations[0].observablePerformanceDe','.profile.expectations[0].observablePerformanceEn','.profile.variationAxes[0].textDe','.profile.variationAxes[0].textEn','.profileFingerprint','.reason','.reviewedAt','.reviewer'}
        rounds.append({'round':rd['round'],'wholeOriginalInputGoal':ig,'wholeOriginalScientificRecord':record,'wholeOriginalScientificRun':run,'wholeCurrentCanonicalContextAndDEENExact':True,'wholeCurrentPExact':not pd,'wholeCaseBriefsExact':True,'actualWholePDelta':pd})
    legacy=byid[gid]['extendedData']['provenance']['sourceGoalId']
    whole.append({'goalId':gid,'wholeCurrentGoal':byid[gid],'wholeCurrentP2':profiles[gid],'wholeCurrentNativePage':page,'wholeCurrentCanonicalContext':ctx,'selectedOriginalPairClaims':pair,'wholeBothOriginalRecordsAndInputsAndRuns':rounds,'wholeAcceptedResolutionAndSynthesis':read(R/pair['resolution']['path']),'wholeCurrentClassicalOrigin':next(x for x in classic['goals'] if x['id']==legacy),'wholeCurrentClassicalParents':[x for x in classic['goals'] if legacy in x.get('contains',[])]})
write('actual-whole-two-project-goals-current-P4-original-D2-and-selected-P12.INPUT.READONLY.json',{'status':'READONLY-whole-selected-current-and-original-contexts','wholeGoals':whole,'wholeCurrentSelectedP12SourceAtom':atom,'wholeCurrentSelectedP12Parent':parent,'wholeCurrentP12DecisionAndTwoPartialEdges':{'decision':decision,'edges':edges},'wholeCurrentPrerequisiteOrientation':byid['6bf2d1cc-e745-50dd-a617-71c06a6c6945'],'actualPublicBEG8G9Rows':native32['DE-BE'],'noWholeSourceOrQAApproval':True,'activeWrites':0,'newD2Reviews':0})

answers0d=[
 {'caseId':'actual-team-network-cost-chart-and-delay',
  'ownCompleteAnswerDe':'Ich setze einen ausdrücklich fiktiven Rollendurchlauf mit Datenprüfung A, Kostenrechnung B, Diagramm C und Zusammenführung D auf. A liefert geprüfte 100 Nutzungen; ich berechne B: Einweg 100×0,20=20, Mehrweg 12+100×0,05=17. C erstellt aus denselben Zahlen zwei beschriftete Balken, damit beide Ergebnisse vergleichbar bleiben. Das Netz lautet A→B→D und A→C→D. A läuft 0–2, B 2–5, C 2–4, D 5–6; Abschluss 6, kritischer Weg A–B–D, C hat einen Tag Puffer. Ich dokumentiere den Übergang jeder Rolle und eine gemeinsame Version mit Freigabespalte. Bei C=4 läuft C 2–6 und D 6–7; Abschluss 7, kritischer Weg A–C–D. Im simulierten Abstimmungsprotokoll übernehme ich die neue Freigabezeit und lasse D erst nach beiden vorliegenden Produkten beginnen. Das gemeinsame Tabellen-/Diagrammdokument eignet sich, weil Zahlen, Diagramm und Änderungsverlauf zusammen prüfbar sind; eine unversionierte Chatnachricht reicht dafür nicht. Das Ergebnis gilt für die gegebenen Geldkosten, nicht für unbelegte Umweltwirkungen und nicht als echte beobachtete Teamarbeit.',
  'ownCompleteAnswerEn':'I run an explicitly fictional role simulation: A checks the data, B computes costs, C charts them and D combines the outputs. A supplies the checked 100 uses; B computes disposable cost 100×0.20=20 and reusable cost 12+100×0.05=17. C creates two labelled bars from those same values. The network is A→B→D and A→C→D. A runs 0–2, B 2–5, C 2–4 and D 5–6: completion 6, critical path A–B–D and one day of float for C. I record each role handoff and a shared version with an approval column. When C takes 4 days it runs 2–6 and D 6–7: completion 7, critical path A–C–D. The simulated coordination log adopts the new approval time and starts D only after both outputs are available. A shared versioned spreadsheet/chart suits the need because figures, chart and revisions are checkable together; an unversioned chat message does not. These are supplied monetary costs, not proven environmental effects or observed real teamwork.',
  'masteryCounterexample':'A nice board with role labels but no executed calculation, chart or coordinated change fails the performance. Adding parallel durations as if B and C were sequential also fails the actual dependency model.'},
 {'caseId':'actual-team-network-budget-change-and-alternative',
  'ownCompleteAnswerDe':'Ich trenne Anforderungs-, Angebots-, Raum-, Material- und Aufbaupaket und führe einen ausdrücklich gekennzeichneten Rollendurchlauf durch. Das kleine Standartefakt ist eine beschriftete Informationstafel mit dem vereinbarten Inhalt; die gemeinsame Statusdatei verbindet Verantwortliche, Abhängigkeiten und Kosten. Zunächst laufen A 0–1, B 1–3, C 1–4, D 3–5, E 5–6. A–B–D–E dauert 6, A–C–E 5; Kosten 20+15+10=45, Reserve 15. Nach Druck 35 und D=4 liegen Kosten bei 60, Reserve 0; D endet 7, E 8 und der Termin 6 wird verfehlt. Bei der ausdrücklich angebotenen Digitalalternative kostet der Stand 25+15+10=50, Reserve 10; D läuft 3–4, C endet 4 und E endet 5. Ich stimme den Ersatz eines Druckteils und die neue Übergabe mit den Rollen ab und protokolliere die Änderung. Sie ist nur passend, wenn die vorgegebene Anzeige verfügbar ist und den benötigten Inhalt tatsächlich trägt; sonst wäre die errechnete Entlastung kein durchführbarer Plan. Die Auswertung vergleicht erstelltes Artefakt, Kosten, Termin und dokumentierte Rollenentscheidung mit dem Auftrag, statt die Nutzung einer Software als Erfolg zu zählen.',
  'ownCompleteAnswerEn':'I separate requirements, quotes, venue booking, materials and setup and carry them out in an explicitly labelled role simulation. The bounded stand artefact is a labelled information panel carrying the agreed content; a shared status file links owners, dependencies and costs. Initially A runs 0–1, B 1–3, C 1–4, D 3–5 and E 5–6. A–B–D–E takes 6 and A–C–E 5; cost is 20+15+10=45 with reserve 15. Printing at 35 and D of 4 make cost 60 and reserve 0; D ends at 7 and E at 8, missing deadline 6. The stated digital alternative costs 25+15+10=50 with reserve 10; D runs 3–4, C ends at 4 and E ends at 5. I coordinate the partial print replacement and new handoff with the roles and record the revision. It fits only if the available display actually carries the required content. Evaluation compares the produced artefact, cost, deadline and documented coordination with the assignment rather than treating software use as success.',
  'masteryCounterexample':'Reducing the printing figure without checking display availability/content, or reporting unchanged completion 6 after D rises to 4, fails results-oriented coordinated application.'}]
answers596=[
 {'caseId':'fictional-canteen-reuse-study',
  'ownCompleteAnswerDe':'Meine abgegrenzte Frage lautet: Welche Variante verursacht für die zwei gegebenen Öffnungstage geringere Geldkosten? Im ersten ausdrücklich vorläufigen Plan wähle ich Tag A als repräsentativ, weil seine hohe Menge die Auslastung zeigt. Ich führe die Extrapolation aus: zweimal 100×0,20=40 Einweg; zweimal (12+100×0,05)=34 Mehrweg. Das ergibt zunächst einen scheinbaren Vorteil von 6 für Mehrweg. Danach prüfe ich den tatsächlichen fiktiven zweiten Tag mit 40 Verkäufen und ersetze die Annahme durch getrennte Rechnungen: A 20/17, B 8/14, insgesamt 28/31. Jetzt ist Einweg bei den gelieferten Geldkosten um 3 günstiger. Der Bericht hält beide Arbeitswege, Produkte und Revision fest: unterschiedliche Mengen und Reinigung pro Öffnungstag werden durch die erste Auswahl nicht angemessen repräsentiert. Würde ich B wählen, lautete die erste Prognose 16/28 und ebenfalls nicht die vollständige 28/31-Aggregation. Ich empfehle für genau diese Daten Einweg als kostengünstiger, begrenzt auf Geldkosten. Rückgabequote, Umweltwirkungen und Nachfrageänderungen sind nicht geliefert; ich bezeichne die Arbeit als fiktive Datenstudie, nicht als realen Schulversuch.',
  'ownCompleteAnswerEn':'My bounded question is which option has lower monetary cost over the two supplied opening days. In an explicitly provisional plan I choose day A as representative because its high volume illustrates utilisation. I execute the extrapolation: twice 100×0.20=40 disposable, twice (12+100×0.05)=34 reusable, initially suggesting a reusable advantage of 6. I then test this using the supplied fictional second day of 40 sales and replace the assumption with separate calculations: A 20/17, B 8/14, total 28/31. Disposable is now cheaper by 3 under the supplied monetary costs. My report records both procedures, work products and revision: the selected-day forecast does not adequately represent varying volumes and cleaning per open day. Choosing B would instead give an initial 16/28 forecast, also different from complete aggregation 28/31. I recommend disposable as cheaper for these data, confined to monetary cost. Returns, environmental effects and demand changes are not supplied; this is a fictional-data study, not an actual school trial.',
  'masteryCounterexample':'A plan without either executed forecast and revised aggregation does not show execution. Reporting reuse as environmentally superior from cost figures, or retaining the initial 40/34 recommendation after examining both days, fails subject evaluation.'},
 {'caseId':'consumer-rights-explainer-trial',
  'ownCompleteAnswerDe':'Ich plane eine kurze Karte für einen fiktiven Käufer behebbar mangelhafter Kopfhörer. Mein tatsächlicher Kartenentwurf lautet: Nach den bereitgestellten Regeln kannst du Reparatur oder mangelfreie Lieferung verlangen; die Auswahl steht unter den angegebenen gesetzlichen Verweigerungsgrenzen. Stelle die Sache zur Nacherfüllung bereit. Mein Mustertext verlangt Reparatur und bietet die Sache zur Prüfung und Abhilfe an; er fordert keine automatische sofortige Erstattung. Zunächst wähle ich als Prüffrage: Verstehst du, welche Abhilfe du verlangen und was du dafür bereitstellen musst? Im gelieferten Protokoll sagen A und B Ja, also würde diese erste Methode beide als verstanden markieren. Ich ändere sie zu zwei Fallschritten: Welche konkrete Abhilfe verlangt die Antwort, und wird die Sache bereitgestellt? Mein Raster prüft passende Abhilfe statt unbelegter Erstattung, Bereitstellung und Beachtung der gelieferten Grenzen. Tatsächlich angewendet: A fordert automatische sofortige Geldrückgabe und zeigt damit keine passende Abhilfe; eine Bereitstellung ist nicht belegt. B fordert Reparatur und bietet die Sache an, erfüllt also die beiden belegten Anwendungspunkte. Das revidierte Ergebnis widerspricht der anfänglichen Ja/Ja-Einstufung. Ich ergänze die Karte um den klaren Hinweis, dass die gelieferten Regeln keine automatische sofortige Rückzahlung begründen. Zwei fiktive Antworten zeigen die Unzulänglichkeit der Selbstauskunft, aber keine allgemeine menschliche Erprobung oder Vollbeherrschung aller Käuferrechte.',
  'ownCompleteAnswerEn':'I plan a short card for a fictional buyer of repairably defective headphones. My actual card draft says: under the supplied rules you may request repair or defect-free replacement, subject to the stated statutory refusal limits; make the item available for cure. My model request asks for repair and offers the item for examination and remedy; it does not demand an automatic immediate refund. Initially I choose this check: Do you understand what remedy to request and what to make available? The supplied log gives Yes from A and B, so this method would classify both as understanding. I replace it with two case steps: what specific remedy does the answer demand, and is the item made available? My rubric checks an appropriate remedy rather than an unsupported automatic refund, availability of the item and the supplied limits. Applied to the actual fictional answers, A demands automatic immediate repayment and does not demonstrate the appropriate remedy; availability is not established. B requests repair and offers the item, satisfying the two stated application points. This revised finding contradicts the initial Yes/Yes classification. I add a clear card sentence that these supplied rules do not establish automatic immediate repayment. Two fictional answers demonstrate the self-report weakness, not a general human trial or mastery of every consumer right.',
  'masteryCounterexample':'Merely replacing a word on the card without applying a changed case rubric to both provided answers does not show method evaluation. Treating two Yes replies as proof of correct legal application fails the actual supplied evidence.'}]

review={'status':'INDEPENDENT-READONLY-KEEP-existing-D2-science-selected-source-and-current-P-context-fit-only','actualUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualReviewer':'/root/economics_final679_required_gate_plan, current Codex assistant; exact model revision not exposed','newD2Reviews':0,'newModelRuns':0,'activeWrites':0,'humanApproval':False,'sourceCoverageUpgrade':False,'strictClosures':0,
 'individualContextDecisions':[
  {'goalId':IDS[0],'decision':'KEEP','ownCompleteDEENAnswersAndNegativeExamples':answers0d,'meaning':'One concrete coordinated team-project performance uses task analysis, network dependencies, execution, change coordination and needs-based media together. A mere tool list or completed plan is insufficient. The fresh network/budget changes require actual adaptation, not a second independent competence quota.','historicalPBoundary':'Whole current P is NOT identical to the selected historical D56 P: exactly four profile language strings and four fingerprint/author metadata fields changed. Historical first-round P-REVISE and accepted synthesis preserve this editorial finding; current strings replace author claims with observable work and genuine variation. Both whole case briefs, coverage configuration and all remaining profile fields are exact. Existing description science remains valid; this is not a false P-parity claim.','historicalCanonicalAndDEENExact':True,'sourceFit':'The existing classical WR9 team-project description explicitly includes results-oriented methods and needs-based digital media. Qualified BE P12 selects economic/service project methods and documentation; this goal covers team coordination and media, not the complete selected project cycle or all technical/innovative P12 content.'},
  {'goalId':IDS[1],'decision':'KEEP','ownCompleteDEENAnswersAndNegativeExamples':answers596,'meaning':'Plan, actual execution and subject evaluation form the closed cycle of one selected project. The supplied cost study and legal-card trial demonstrate execution, a self-chosen unsuitable method, executed revision and explained changed results. No mastery of every economic or legal topic is implied.','historicalWholePAndCanonicalAndDEENExact':True,'sourceFit':'The classical WR8 WWG profile project clause and selected BE economic/service P12 aspect fit a bounded subject project. This goal covers plan, execution and subject evaluation, not all technical production, all services, or every P12 representation.'}],
 'jointSourceBoundary':'KEEP only the already independently qualified selected economic/service P12 facet: printed28 mandatory parent, printed41 grades9/10, own derived competency aspect; two edges remain partial and only their union covers the stated bounded facet. Neither goal alone is advertised as the whole P12 obligation. There is no source match/type/course/stage or official-verbatim upgrade.',
 'prerequisiteBoundary':'Both current requires point only to the whole fachfreie 6bf2 orientation. This matches both selected accepted D2 contexts; no technical calculation, legal recall, corporate strategy or actual outside-person contact is presupposed. Supplied figures/rules and role simulations allow real performed products without invented learner work.',
 'scopeBoundary':'Actual already-qualified BE G8/G9 public projections contain both as ordinary targets. The source scope is the selected economic/service grades9/10 P12 facet; technical GK projection is not an assertion of an upper-school course mandate. Unchanged BY/HE/TH source obligations are not newly qualified here.',
 'pageAndVisualBoundary':'Current full-book page paths/container binding may differ from historical subset pages. Current full pages are captured; no false whole-page or whole-QA approval. The existing image link identity and descriptions do not replace execution evidence.',
 'originalReviewProviderTimesRecordStatusSynthesisPreservedAsHistory':True,'currentPStatus':'needs_human_review/ai_candidate/E1/G1'}
write('actual-independent-two-whole-project-descriptions-P4-and-selected-P12-context-KEEP.READONLY.receipt.json',review)
end=[]
for path,before in guards.items():
    after={'path':path,'sha256':sha(R/path),'bytes':(R/path).stat().st_size}; assert before==after
    end.append({'before':before,'after':after,'exact':True})
write('actual-project-context-input-before-after.READONLY.json',{'actualUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'inputGuards':end,'activeWrites':0})
spec=importlib.util.spec_from_file_location('native_schema_validator',R/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
symlink_errors=mod.curriculum_symlink_errors(str(R)); assert not symlink_errors
parsed=[]
for p in O.iterdir():
    if p.suffix=='.json':json.loads(p.read_text());parsed.append(str(p.relative_to(R)))
write('actual-original-symlink-validator-and-complete-own-JSON-parse.READONLY.json',{'originalCall':'scripts/validate_schemas.py:curriculum_symlink_errors(repo_root)','errors':symlink_errors,'ownSymlinks':0,'completeJSONParsedPaths':parsed,'activeWrites':0})
artifacts=[{'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size} for p in sorted(O.rglob('*')) if p.is_file()]
write('SEALED-two-existing-project-D2-current-P4-and-selected-P12-context-KEEP.READONLY.json',{'status':'SEALED-independent-READONLY-KEEP-context-fit-not-new-D2-or-source-approval','actualUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'goalIds':IDS,'artifacts':artifacts,'inputGuardCount':len(end),'activeWrites':0,'newD2Reviews':0,'humanApproval':False,'sourceApprovalUpgrade':False,'strictClosures':0})
print(json.dumps({'goalIds':IDS,'contextDecisions':['KEEP','KEEP'],'current0dWholePExact':False,'current596WholePExact':True,'oldFourCasesExact':True,'guards':len(end),'activeWrites':0,'newD2Reviews':0}))
