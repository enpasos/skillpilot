from pathlib import Path
import datetime,hashlib,json,subprocess
R=Path.cwd();O=Path(__file__).resolve().parent
load=lambda p:json.loads(p.read_text());sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
guards={}
def read(p):
 guards[str(p.relative_to(R))]={'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size};return load(p)
def write(p,v):
 with p.open('x')as f:f.write(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
id='e2ac2cc2-894a-5e61-8acb-f5d88811739d'
S=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-current-D246-open100-whole-binding-package-scoping-READONLY-c-v1'
scope=read(S/'actual-current100-six-disjoint-packages-and-current49-concrete-owner-context-inputs.READONLY.json');row=next(x for x in scope['current100Rows']if x['goalId']==id);pair=row['existingOriginalTwoRoundPair']
cfg=read(R/'app/scripts/config/goal-books/de-gym-economics-current-canonical.json');can=read(R/cfg['landscapePath']);byid={g['id']:g for g in can['goals']};g=byid[id]
ppath=R/cfg['evidenceReviewPaths'][0];guards[str(ppath.relative_to(R))]={'path':str(ppath.relative_to(R)),'sha256':sha(ppath),'bytes':ppath.stat().st_size};p=next(json.loads(l)for l in ppath.read_text().splitlines()if json.loads(l)['goalId']==id)
currentNative=read(S/'actual-post-RootP2-original-native-current-open100-full-page-and-canonical-contexts.READONLY.json');page=next(x for x in currentNative['wholeCurrentOpenPages']if x['goalId']==id);ctx=next(x for x in currentNative['wholeCurrentCanonicalContexts']if x['goalId']==id)['context']
original=[]
for rd in pair['existingIndependentRounds']:
 inp=read(R/rd['reviewInput']['path']);ig=next(x for x in inp['goals']if x['goalId']==id)
 rp=R/rd['actualResults']['path'];guards[str(rp.relative_to(R))]={'path':str(rp.relative_to(R)),'sha256':sha(rp),'bytes':rp.stat().st_size};record=next(json.loads(l)for l in rp.read_text().splitlines()if json.loads(l).get('goalId')==id)
 run=read(R/rd['runManifest']['path']);original.append({'round':rd['round'],'wholeOriginalInputGoal':ig,'wholeOriginalScientificRecord':record,'wholeOriginalScientificRun':run,
  'canonicalContextWholeExact':ig['canonicalContext']==ctx,'wholeCurrentPExact':ig['reviewContext']['evidenceProfile']==p,
  'wholeDEENExact':(ig['currentTitleDe'],ig['currentTitleEn'],ig['currentDescriptionDe'],ig['currentDescriptionEn'])==(g['title'],g['titleEn'],g['description'],g['descriptionEn'])})
assert all(x['canonicalContextWholeExact']and x['wholeCurrentPExact']and x['wholeDEENExact']for x in original)
res=read(R/pair['resolution']['path']);m=read(R/'curricula/DE/Gymnasium/mapping/DE-BE/lower-secondary/be_wat_lower_secondary_source_extraction_to_canonical_wirtschaft.review.json');src=read(R/m['sourceExtractionPath']);p6=next(x for x in src['sourceGoals']if x['id']=='be-wat-seki-p6-markt-kreislauf-g01-dfa8e713');parent=next(x for x in src['passages']if x['id']==p6['passageId']);assert not [x for x in m['mappings']if x['canonicalGoalId']==id]
classic=read(R/'curricula/DE/Gymnasium/input/BY/gymnasium/Wirtschaft_und_Recht.json');legacyid=g['extendedData']['provenance']['sourceGoalId'];classicg=next(x for x in classic['goals']if x['id']==legacyid);classicparents=[x for x in classic['goals']if legacyid in x.get('contains',[])]
native32path=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-final970-boundaries-native32-full-target-support-memory-delta-READONLY-v1/final32-after970-active-whole-target-support-memory-IDsets.READONLY.json';native32=read(native32path);berows=native32['DE-BE'];assert all(id not in x['wholeTargetGoalIds']and id in x['prerequisiteOnlyGoalIds']for x in berows.values())
qa=read(R/cfg['goalVisualizationQaPath']);qaRows=qa.get('records',[])
input={'status':'READONLY-whole-current-and-original-bound-contexts','goalId':id,'wholeCurrentDEENGoal':g,'wholeCurrentP2':p,'currentNativePage':page,'currentNativeCanonicalContext':ctx,
 'wholeOriginalBothSelectedD2InputsRecordsAndRuns':original,'wholeOriginalAcceptedSynthesisAndResolution':res,
 'wholeCurrentPrerequisite':byid[g['requires'][0]],'wholeCurrentDependentConsumerGoal':byid['a60e0541-80e1-5f94-86fd-073f5a00bee8'],
 'currentClassicalProvenanceGoalAndParent':{'sourceGoal':classicg,'parents':classicparents,'officialSourceApprovalReperformed':False},
 'changedBESourceBoundary':{'wholeCurrentP6RightsAtom':p6,'wholeCurrentP6Parent':parent,'paymentDirectEdges':[],'wholeP6AndOtherSourceFacetsReviewClaim':False,'currentBEG8G9NativeRows':berows},
 'fullCurrentSourceOrQAApprovalClaim':False,'activeWrites':0,'newD2Review':False}
write(O/'actual-whole-e2ac-current-P2-old-D2-and-qualified-payment-scope.INPUT.READONLY.json',input)
answers=[{
 'caseId':'offline-market',
 'ownCompleteAnswerDe':'Für den unmittelbaren kleinen Kauf würde ich Bargeld wählen, sofern der Kaufpreis innerhalb des angegebenen Bargeldbudgets liegt: Es wird akzeptiert und die Zahlung hängt nicht von der störanfälligen Datenverbindung ab. Aus dem Fall ergibt sich kein zusätzlicher Gebührenvorteil einer anderen Art. Bei Bargeld bleibt ein Verlust- und Wechselgeldrisiko; deshalb ist es keine allgemein sicherere Methode. Reicht das Budget nicht, ist diese Wahl nicht durchführbar; Karte kommt dann nur bei tatsächlich funktionierender Verbindung in Betracht. Entscheidend sind der unmittelbare Kaufzweck, die konkrete Akzeptanz und Verfügbarkeit sowie die genannten Kosten- und Sicherheitsbedingungen.',
 'ownCompleteAnswerEn':'For the immediate small purchase I would choose cash if the price fits the stated cash budget: the stall accepts it and completion does not depend on the unreliable data connection. The facts establish no additional fee advantage for another method. Cash still carries a loss or change-related drawback, so this is not a claim that it is universally safer. If the budget is insufficient, this choice is unavailable; a card then works only when the connection actually works. The immediate purpose, actual acceptance and availability, and stated cost and security conditions determine the choice.',
 'masteryCounterexample':'Choosing the card merely because it is modern ignores connection availability; choosing cash regardless of its stated budget ignores feasibility. Neither demonstrates the supplied four-criterion decision.'},
 {'caseId':'online-method-table',
 'ownCompleteAnswerDe':'Ich würde die angebotenen Verfahren zeilenweise vergleichen: Welche Gebühr nennt die Tabelle, welche Daten muss ich preisgeben, wann wird gezahlt und welche genau begrenzten Schutzbedingungen gelten? Bei Vorkasse wird nach der genannten Zeitregel vor dem Empfang gezahlt; für einen Erstkauf muss ich das Händlervertrauen besonders prüfen. Bei Rechnung oder Zahlungsdienst darf ich einen Schutz oder späteren Zahlungstermin nur annehmen, wenn die Tabelle ihn tatsächlich nennt. Ich wähle das Verfahren, das die für diesen Erstkauf wichtigsten Sicherheits-, Kosten-, Verfügbarkeits- und Zweckbedingungen am besten erfüllt, und benenne seinen verbleibenden Nachteil, etwa eine gegebene Gebühr oder zusätzliche Datenpreisgabe. Ohne die konkreten Tabellenwerte ist keine eindeutige Rangfolge oder universelle sichere Empfehlung begründet. Begrenzter Schutz ist keine Erstattungsgarantie.',
 'ownCompleteAnswerEn':'I would compare the offered methods row by row: what fee is stated, what personal data is required, when is payment due, and what precisely limited protection conditions apply? Under the stated timing rule, advance payment occurs before receipt, so trust in an unfamiliar seller deserves particular attention. For invoice or a payment service I would assume a protection or later payment date only if the table states it. I choose the method that best fits the security, cost, availability and purpose requirements of this first purchase and identify its remaining drawback, such as a stated fee or additional disclosure. Without the table values no unique ranking or universally safe recommendation follows. Limited protection is not a refund guarantee.',
 'masteryCounterexample':'Calling every payment service risk-free, or inventing zero fees or refund rights missing from the table, fails the material-bound comparison even if the selected method happens to be convenient.'}]
review={'status':'INDEPENDENT-READONLY-KEEP-existing-description-science-current-qualified-source-scope-context-fit-only','goalId':id,'actualUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'actualReviewer':'/root/economics_final679_required_gate_plan, current Codex assistant; exact model revision not exposed','newOriginalD2RoundCreated':False,
 'actualReadWholeDEENCurrentGoalAndP2AndBothHistoricalRecordsAndAcceptedSynthesis':True,'ownFullCaseAnswersAndNegativeMasteryExamples':answers,
 'semanticDecision':'KEEP: comparison and choice are one situation-bound payment decision. Every original criterion remains explicit and every current P expectation remains identical; changing the payment setting changes criterion weights, not the skill contract.',
 'changedSourceScopeDecision':'KEEP compatibility only: qualified Berlin P6 concerns legal rights/duties, not the whole four-criterion payment comparison. There is no direct BE-lower payment edge, and actual BE G8/G9 payment is prerequisiteOnly, not target. Retaining the dependent consumer goal requires this canonical prerequisite without creating a separate normative Berlin payment mandate. The narrower country offer therefore removes a false source claim and does not alter the canonical payment skill or the two current P cases.',
 'classicalOriginBoundary':'The existing Bavarian archived atom names situation-specific selection of payment methods in WR8 household content. The explicit four criteria are the canonical operationalization already present in both accepted reviews, not a newly asserted verbatim official bullet or current source-fidelity approval.',
 'prerequisiteDecision':'Existing consumer-behaviour prerequisite provides the decision setting; it does not add payment guarantees, banking-law recall, a specific technology requirement, or an extra assessment quota.',
 'observablePerformanceUnchanged':'Compare supplied options using security, cost, actual availability and payment purpose; justify a conditional choice and one remaining drawback. No option receives universal superiority.',
 'wholeOriginalCanonicalContextAndDEENAndCurrentPExact':True,'oldCurrentWholePageExact':False,
 'pageContextDeltaBoundary':'Current full-book page position and links differ from the historical subset page; this is disclosed navigation/container change, not falsely claimed whole-page parity. Current imagery asset identity and description remain identical; no new visual approval.',
 'originalReviewTimesProviderStatusAndAcceptedSynthesisRemainHistorical':True,'currentRecordStatus':'needs_human_review','currentAuthority':'ai_candidate','currentEvidence':'E1/G1',
 'sourceCoverageOrMatchTypeOrCourseUpgrade':False,'humanApproval':False,'activeWrites':0,'newD2Reviews':0,'newModelInferenceRuns':0,'strictClosures':0}
write(O/'actual-independent-e2ac-whole-description-P2-and-qualified-payment-source-scope-context-KEEP.READONLY.receipt.json',review)
end=[]
for p,b in guards.items():
 a={'path':p,'sha256':sha(R/p),'bytes':(R/p).stat().st_size};assert a==b;end.append({'before':b,'after':a,'exact':True})
write(O/'actual-payment-context-input-before-after.READONLY.json',{'actualUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'inputGuards':end,'activeWrites':0})
artifacts=[{'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}for p in sorted(O.rglob('*'))if p.is_file()]
write(O/'SEALED-e2ac-existing-D2-current-whole-P-and-qualified-payment-scope-context-KEEP.READONLY.json',{'status':'SEALED-independent-READONLY-KEEP-context-fit-not-new-D2-or-source-approval','actualUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'artifacts':artifacts,'inputGuardCount':len(end),'activeWrites':0,'newD2Reviews':0,'sourceApprovalUpgrade':False,'humanApproval':False,'strictClosures':0})
print(json.dumps({'goalId':id,'contextDecision':'KEEP','guards':len(end),'activeWrites':0,'newD2Reviews':0,'sourceUpgrade':False}))
