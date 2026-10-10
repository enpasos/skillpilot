import pathlib,json,hashlib,datetime,subprocess

R=pathlib.Path(__file__).resolve().parents[7]
O=pathlib.Path(__file__).resolve().parent
Q=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10'
def rel(p):return str(pathlib.Path(p).relative_to(R))
def read(p):return json.loads(pathlib.Path(p).read_text())
def bind(p):
 p=pathlib.Path(p);b=p.read_bytes();return {'path':rel(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(name,x):
 p=O/name;p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');json.loads(p.read_text())
def rows(p):return [json.loads(l) for l in pathlib.Path(p).read_text().splitlines() if l.strip()]
def rawrows(p):
 return [(json.loads(l),l.encode()) for l in pathlib.Path(p).read_text().splitlines(keepends=True) if l.strip()]
def whole(p):
 x=read(p)
 if isinstance(x,list):return x
 for key in ['goals','candidates','wholeGoals']:
  if key in x:return x[key]
 if 'id' in x:return [x]
 raise ValueError((str(p),list(x)))
def norm(x):return ' '.join(str(x or '').split())
def payload_fields(g):
 # Field comparison only; intentionally no stableJson/native hash implementation.
 import unicodedata
 n=lambda x:' '.join(unicodedata.normalize('NFKC',str(x or '')).split())
 d=g.get('dimensionTags',{})
 return {'goalId':g['id'],'shortKey':g.get('shortKey',''),'title':n(g.get('title')),'titleEn':n(g.get('titleEn')),'description':n(g.get('description')),'descriptionEn':n(g.get('descriptionEn')),'phase':n(d.get('phase')),'area':n(d.get('area')),'topicCode':n(d.get('topicCode')),'nodeKind':n(g.get('nodeKind'))}

regpath=R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
S=next(s for s in read(regpath)['subjects'] if s['subject']=='wirtschaftswissenschaften')
canpath=R/S['landscapePath'];CAN=read(canpath);by={g['id']:g for g in CAN['goals']}
Aconfig=read(R/S['semanticAtomicityConfigPath']);Mconfig=read(R/S['memoryReviewConfigPath'])
ap=R/Aconfig['reviewPath'];mp=R/Mconfig['reviewPath'];cp=R/Mconfig['cardReviewPath']
ar=rawrows(ap);mr=rawrows(mp);cr=rawrows(cp)
am={x['goalId']:x for x,b in ar};mm={x['goalId']:x for x,b in mr};cm={(x['deckId'],x['cardId']):x for x,b in cr}

sources=[
 Q/'wirtschaft-five-semantic-successor-memory-decisions-three-cards-AUTHOR-INERT-root-v1/five-whole-current-semantic-destinations.READONLY.json',
 Q/'wirtschaft-final56-seven-bounded-description-remedies-WHOLE-INERT-root-author-v1/seven-whole-proposed-goals.INERT.json',
 Q/'wirtschaft-dd38-543b-source-course-f08-036ea-followers-AUTHOR-INERT-round-b-v1/candidates/six-whole-content-successor-goals.INERT.json',
 Q/'wirtschaft-6482-bounded-grammar-and79d-demand-ADDENDUM-INERT-round-b-v1/candidates/whole-goals.unchanged.INERT.json',
 Q/'wirtschaft-7c121-b84-practice-prerequisite-scope-INERT-author-round-a-v1/seven-whole-proposed-goals.INERT.json',
 Q/'wirtschaft-7c121-b84-practice-prerequisite-scope-INERT-author-round-a-v1/072-whole-only-native-derived-applicability.INERT-follower-candidate.json',
]
candidate={};originpaths={}
for p in sources:
 for g in whole(p):
  originpaths.setdefault(g['id'],[]).append(rel(p))
  if g['id'] not in candidate or 'applicability' in g:candidate[g['id']]=g
changed=[];new=[];preserved=[];practice=[]
for gid,g in candidate.items():
 old=by.get(gid)
 if old is None:new.append(gid);continue
 differences=[k for k in set(old)|set(g) if old.get(k)!=g.get(k)]
 changes=[k for k in payload_fields(g) if payload_fields(old)[k]!=payload_fields(g)[k]]
 if gid in am:
  entry={'goalId':gid,'titleCurrent':old['title'],'titleCandidate':g['title'],'wholeChangedKeys':sorted(differences),'nativePayloadFieldsChanged':changes,'currentAStatusObserved':am[gid]['status'],'currentMStatusObserved':mm[gid]['status'],'currentMemoryGoalIdsObserved':mm[gid].get('memoryGoalIds',[]),'currentDeckIdsObserved':mm[gid].get('deckIds',[]),'candidateInputPaths':originpaths[gid],'existingKeptCardIds':[{ 'deckId':c['deckId'],'cardId':c['cardId']} for c,b in cr if gid in c.get('originGoalIds',[])]}
  (changed if changes else preserved).append(entry)
 else:
  practice.append({'goalId':gid,'titleCurrent':old['title'],'wholeChangedKeys':sorted(differences),'nativePayloadFieldsChanged':changes,'candidateInputPaths':originpaths[gid],'nativeOrdinaryALedgerRecordExists':False,'nativeOrdinaryMLedgerRecordExists':False,'reason':'Whole Practice/examData endpoint: excluded by unchanged native A/M relevance filters; requires/coveredGoalIds/applicability need separate whole-practice and runtime/frontier checks.'})
assert len(changed)==12 and len(new)==3,(len(changed),len(new))
changedids={x['goalId'] for x in changed}
unchanged=sorted(set(am)-changedids)
assert len(unchanged)==324 and set(am)==set(mm)

reuse=[]
for gid in unchanged:
 al=next(b for x,b in ar if x['goalId']==gid);ml=next(b for x,b in mr if x['goalId']==gid)
 reuse.append({'goalId':gid,'currentNativeGoalFieldsNotChangedByThisBoundedPackage':True,'aRecordRawLineWithActualNewlineSha256':'sha256:'+hashlib.sha256(al).hexdigest(),'mRecordRawLineWithActualNewlineSha256':'sha256:'+hashlib.sha256(ml).hexdigest(),'aStatusObserved':am[gid]['status'],'mStatusObserved':mm[gid]['status'],'aFingerprintObservedOnly':am[gid]['fingerprint'],'mFingerprintObservedOnly':mm[gid]['fingerprint'],'reuseAction':'Retain exact current raw record bytes and original review metadata. This is not a fresh historical content review or a newly computed native fingerprint.'})
write('324-exact-old-A-and-M-raw-record-reuse.READONLY.json',{'status':'BOUNDED339_DRAFT_REUSE_INVENTORY','aLedger':bind(ap),'mLedger':bind(mp),'count':324,'records':reuse,'limit':'Future BB/final343 content changes can require an additional bounded impact audit; this inventory has not read or qualified those inflight new candidates.'})

deckdata=[];cards={}
for g in CAN['goals']:
 if g.get('nodeKind')!='memory' and 'memorization' not in g.get('tags',[]) and not any(t.startswith('srs-deck:') for t in g.get('tags',[])):continue
 for key in ['vocabularySource','vocabularySourceEn']:
  source=g.get('extendedData',{}).get(key)
  if not source:continue
  p=R/('app/public'+source if source.startswith('/data/') else source.lstrip('/'));d=read(p)
  canonical=R/'curricula/DE/Gymnasium/memory-decks'/p.name
  pair=canonical.exists() and canonical.read_bytes()==p.read_bytes()
  deckdata.append({'memoryGoalId':g['id'],'deckId':d['deckId'],'source':source,'runtimeFile':bind(p),'canonicalSourceFile':bind(canonical) if canonical.exists() else None,'wholeSourceAndRuntimeBytesEqual':pair,'cardCount':len(d['cards'])})
  for c in d['cards']:cards[(d['deckId'],c['id'])]={'card':c,'memoryGoalId':g['id'],'deckFile':rel(p),'canonicalDeckFile':rel(canonical)}
assert len(cards)==66 and len(deckdata)==10 and all(x['wholeSourceAndRuntimeBytesEqual'] for x in deckdata)

fivepath=Q/'wirtschaft-five-semantic-successor-memory-decisions-three-cards-AUTHOR-INERT-root-v1/five-goal-memory-decisions.no-native-fingerprints.AUTHOR-INERT.json'
five=read(fivepath)['decisions']
v2cards=Q/'wirtschaft-nairu-memory-threshold-one-back-string-ADDENDUM-AUTHOR-INERT-root-v2/three-whole-cards.only-one-NAIRU-back-string.AUTHOR-INERT.json'
candidcards=read(v2cards)
replacementDecks={
 'de_gymnasium_economics_macro_money_policy':Q/'wirtschaft-nairu-memory-threshold-one-back-string-ADDENDUM-AUTHOR-INERT-root-v2/candidates/runtime/de_gymnasium_economics_flashcards_macro_money_policy.de.json.AUTHOR-INERT.json',
 'de_gymnasium_economics_market_order_policy':Q/'wirtschaft-five-semantic-successor-memory-decisions-three-cards-AUTHOR-INERT-root-v1/candidates/runtime/de_gymnasium_economics_flashcards_market_order_policy.de.json.AUTHOR-INERT.json',
}
candidatecardmap={}
candidateDeckBindings=[]
for d in deckdata:
 path=replacementDecks.get(d['deckId'],R/d['runtimeFile']['path']);obj=read(path)
 candidateDeckBindings.append({'deckId':d['deckId'],'candidateRuntimeSource':bind(path),'replacementSubmittedByRoot':d['deckId'] in replacementDecks,'untouchedWholeDeckUsesExactCurrentBytes':d['deckId'] not in replacementDecks})
 for c in obj['cards']:candidatecardmap[(obj['deckId'],c['id'])]=c
def cardjson(c):return json.dumps(c,ensure_ascii=False,separators=(',',':')).encode()
unchangedCards=[];changedCards=[]
for key,c in cards.items():
 cc=candidatecardmap.get(key)
 entry={'deckId':key[0],'cardId':key[1],'originGoalIds':c['card'].get('originGoalIds',[]),'currentWholeObjectJsonSha256':'sha256:'+hashlib.sha256(cardjson(c['card'])).hexdigest(),'candidateWholeObjectJsonSha256':'sha256:'+hashlib.sha256(cardjson(cc)).hexdigest() if cc else None,'objectSerialization':'UTF8 JSON compact, ensure_ascii=false, source key order retained. These are object-byte audit hashes, NOT native card fingerprints.'}
 (unchangedCards if cc is not None and cardjson(cc)==cardjson(c['card']) else changedCards).append(entry)
addedCards=[{'deckId':k[0],'cardId':k[1],'wholeCard':v} for k,v in candidatecardmap.items() if k not in cards]
assert len(unchangedCards)==64 and len(changedCards)==2 and len(addedCards)==1 and len(candidatecardmap)==67
write('64-unchanged-whole-cards-actual-mechanical-reuse-2changed-1new.READONLY.json',{'role':'MECHANICAL_WHOLE_OBJECT_REUSE_ONLY','currentCards':66,'candidateCardsBefore625Remedy':67,'unchangedCurrentWholeCards':unchangedCards,'changedCurrentWholeCards':changedCards,'newCard':addedCards,'actualDeckRoutes':candidateDeckBindings,'otherCardsFreshScientificReview':False,'nativeCardFingerprintsComputed':0,'625OriginREVISEStillOpen':'Mechanical whole-card equality is distinct from the current narrowed-origin fit review. Root additive remedy is separate; this original inventory stays intact.'})
write('actual-ten-deck-files-66-card-ledger-observation.READONLY.json',{'status':'MECHANICAL_REUSE_ONLY_EXCEPT_EXPLICIT_TARGETED_CARDS','deckCount':10,'currentCards':66,'keptCurrentCardRecords':len(cr),'decks':deckdata,'cardLedger':bind(cp),'noFreshContentReviewForOtherCards':True,'oldCardRecords':[{'deckId':x['deckId'],'cardId':x['cardId'],'originGoalIds':x['originGoalIds'],'statusObserved':x['status'],'necessaryObserved':x.get('necessary'),'fingerprintObservedOnly':x['fingerprint'],'rawLineWithActualNewlineSha256':'sha256:'+hashlib.sha256(b).hexdigest()} for x,b in cr]})

# Exactly three current whole-card/current whole-profile origin reviews, not a
# blanket new review of unchanged decks and not a native hash qualification.
origin625='625b61ec-8561-5179-b59e-d3742b19c0e2';origin479='479fb87a-3a5a-5892-8b3e-dfb1d07e9612';origin87='87e1971d-d153-59eb-81d9-e361caf83a26'
targetcards=[('de_gymnasium_economics_market_order_policy','economics-market-environment-policy',origin625),('de_gymnasium_economics_business_law','economics-law-contract-types',origin479),('de_gymnasium_economics_business_law','economics-law-performance-disturbance',origin87)]
profiles={};pbindings=[]
for path in S['positiveEvidenceConfigPaths']:
 c=read(R/path)
 selected=[x for x in rows(R/c['reviewPath']) if x['goalId'] in {origin625,origin479,origin87}]
 if selected:
  pbindings.extend([bind(R/path),bind(R/c['reviewPath'])])
  for x in selected:profiles[x['goalId']]={'configPath':path,'reviewPath':c['reviewPath'],'record':x}
wholeinputs=[]
for deck,cid,gid in targetcards:
 c=cards[(deck,cid)]
 wholeinputs.append({'goalId':gid,'currentWholeGoal':by[gid],'proposedWholeGoal':candidate[gid],'wholeCurrentCard':c['card'],'currentCardLedgerRecord':cm[(deck,cid)],'runtimeDeckPath':c['deckFile'],'canonicalDeckPath':c['canonicalDeckFile'],'activeProfileConfigPath':profiles[gid]['configPath'],'activeProfileReviewPath':profiles[gid]['reviewPath'],'wholeActivePositiveEvidenceRecord':profiles[gid]['record']})
write('three-whole-current-cards-origins-and-current-DEEN-P-actual-read.READONLY.json',{'role':'ACTUAL_TARGETED_WHOLE_INPUT_COPIES_ONLY','inputs':wholeinputs,'newDescriptionCandidateInput':bind(sources[1]),'currentProfileBindings':pbindings,'imagesReadOrRequalified':False,'otherCardsFreshContentReview':False})

reviews=[
 {'goalId':origin625,'deckId':targetcards[0][0],'cardId':targetcards[0][1],'decision':'REVISE','reasonDe':'Die neue ganze Beschreibung nennt Umweltsteuern, handelbare Emissionszertifikate und Gebote/Verbote. Das aktive ganze P untersucht genau Steuerpreis, Zertifikatemenge und Vorgabe, Kostenverteilung, Kontrolle, Unsicherheit sowie ausdrücklich vorgegebene Zuständigkeit. Die alte harte strict-minimum-Karte fordert zusätzlich Subventionen, Haftungsregeln und Informationsinstrumente. Diese weiteren Typen sind hier weder erforderlicher Zieltext noch eigener P-Materialauftrag. Ihr generelles umweltpolitisches Vorkommen begründet keine zusätzliche SRS-Pflicht aus diesem alleinigen Origin.','reasonEn':'The whole successor description requires environmental taxes, tradable emissions permits and commands/prohibitions. The whole current P examines tax prices, permit quantities and requirements, cost distribution, enforcement, uncertainty and stipulated authority. The existing strict-minimum card additionally demands subsidies, liability rules and information instruments. These are neither required successor-goal items nor supplied P assignments; their general policy relevance does not establish an extra SRS obligation from this sole origin.','expectedRecallDe':'Die drei erforderlichen Kategorien unterscheiden: Umweltsteuer als Preis-/Abgabeansatz; handelbare Emissionszertifikate als Modell mit begrenzter Gesamtmenge; Gebote/Verbote als verbindliche Vorgaben. Die Kosten-/Wirkungs-/Kontroll-/Ebenenbeurteilung bleibt Fallleistung.','expectedRecallEn':'Distinguish the three required categories: an environmental tax as a price/charge approach, tradable permits as a model with a limited total quantity, and commands/prohibitions as binding requirements. Assessing costs, effects, enforcement and policy levels remains case performance.','transferCounterexampleDe':'Eine Person erklärt beide P-Fälle korrekt, einschließlich Mengen-/Preisunsicherheit und regionalem Vollzug, kann aber die drei zusätzlichen Typnamen nicht nennen. Sie erfüllt den aktuellen Origin-Vertrag, würde an der unveränderten Sechserliste dennoch scheitern. Umgekehrt beweist bloßes Aufzählen aller sechs keine Beurteilung unterschiedlicher Vermeidungskosten.','transferCounterexampleEn':'A learner correctly explains both P cases, including quantity/price uncertainty and regional enforcement, but cannot name the three extra types. This meets the current origin contract yet fails the six-item recall demand. Conversely, listing all six does not demonstrate judgement about different abatement costs.','boundedRemedyNeeded':'Root-authored additive card successor restricted to the three actual categories, retaining useful distinctions; preserve current card/history. No self-edit here.','currentCardCanReceiveFinalKeptSuccessorRebinding':False},
 {'goalId':origin479,'deckId':targetcards[1][0],'cardId':targetcards[1][1],'decision':'KEEP','reasonDe':'Die ganze Karte fragt nach dem Grund, Vertragstypen zu unterscheiden, und verankert typische Hauptpflichten. Die ganze neue DE/EN-Beschreibung und beide P-Fälle klassifizieren anhand des konkret zugesagten Erfolgs, der Tätigkeit oder der Lieferung/Eigentumsverschaffung und beiderseitiger Gegenleistung. Der allgemeine Hinweis auf Rechte und mögliche Ansprüche benennt die Folge der Vertragszuordnung; er verlangt weder eine neue Rechtsbehelfsliste noch eine eigene Nebenpflichtklassifikation. Er ersetzt auch nicht die besondere kaufrechtliche Werklieferungsregel im gelieferten Material.','reasonEn':'The whole card asks why contract types matter and anchors characteristic main obligations. The successor DE/EN description and both P cases classify promised results, services or delivery/transfer of ownership against both parties’ counter-performance. The general reference to rights and possible claims states a consequence of classification; it introduces neither a new remedy list nor a separate incidental-duty classification and does not replace the supplied manufacture-and-delivery rule.','expectedRecallDe':'Der Vertragstyp erklärt typische Hauptpflichten und damit den rechtlichen Rahmen. Die konkrete Zuordnung und der Vergleich mit Kauf werden anhand des Leistungsversprechens und des gelieferten Materials begründet.','expectedRecallEn':'The contract type explains characteristic main obligations and the legal framework. Concrete classification and comparison with a sale require reasoning from the promise and supplied rules.','transferCounterexampleDe':'Dieselbe Fachperson repariert ein Instrument mit zugesagtem Erfolg oder begleitet sorgfältig eine Übungsstunde ohne Erfolgsgarantie. Beides ist bezahlt; dennoch sind die Hauptleistungen verschieden. Die Karte verhindert keine solche Fallbegründung, und ihr bloßer Wortlaut genügt nicht als Nachweis der Klassifikation.','transferCounterexampleEn':'The same specialist promises a successful instrument repair or careful practice guidance without a guaranteed outcome. Both are paid but promise different main performances. The card is compatible with this reasoning; reciting it alone does not establish correct classification.','boundedRemedyNeeded':None,'currentCardCanReceiveFinalKeptSuccessorRebinding':True},
 {'goalId':origin87,'deckId':targetcards[2][0],'cardId':targetcards[2][1],'decision':'KEEP','reasonDe':'Der ganze neue Origin verlangt weiterhin die grundlegende Systematik von Leistungsstörungen und gerechten Interessenausgleich anhand konkreter Fälle; er wurde nicht auf ausschließlich die zwei P-Beispielformen verengt. Die vier kompakten Begriffsanker mangelhafte/verspätete Leistung, Unmöglichkeit und Nebenpflichtverletzung passen zu dieser Systematik. Die Karte behauptet keine überschneidungsfreie oder abschließende gesetzliche Taxonomie und keine automatische Rechtsfolge. Das ganze P ordnet Nichtleistung/Nachfrist und erheblichen Verbrauchermangel/verweigerte Nacherfüllung mit unterschiedlichen Zusatzvoraussetzungen; diese Abwägungs- und Anwendungsleistung bleibt zusätzlich nötig.','reasonEn':'The whole successor origin still requires the basic structure of breach-of-obligation law and fair balancing through cases; it is not restricted exclusively to the two P example forms. The four compact anchors—defective/late performance, impossibility and breach of incidental duties—fit this structure. The card asserts neither an exhaustive disjoint statutory taxonomy nor an automatic remedy. The whole P distinguishes non-performance/additional periods from substantial consumer defects/refused cure and their different conditions; application and balancing remain necessary.','expectedRecallDe':'Die vier gebräuchlichen Störungsbegriffe als Orientierung abrufen; anschließend Pflichtverletzung, möglichen Rechtsbehelf und zusätzliche Voraussetzungen im gegebenen Fall auseinanderhalten. Nebenpflichtverletzung ist hier ein systematischer Begriffsanker und wird nicht durch die Hauptpflichtbegrenzung des anderen Ziels 479 gelöscht.','expectedRecallEn':'Recall the four common breach categories as orientation, then distinguish breach, possible remedy and additional conditions in the supplied case. Incidental-duty breach remains a structural anchor here; the main-obligation limit of the different goal 479 does not remove it.','transferCounterexampleDe':'Ein spät gelieferter Gegenstand kann zugleich mangelhaft sein. Die Begriffe sind daher keine automatische Ein-Fach-Schublade. Ebenso begründet Rücktritt allein keinen unbedingten Schadensersatz; das P verlangt die getrennte Verantwortlichkeits-/Schadensprüfung. Die Karte verlangt keine zusätzlichen gesetzlichen Fristen auswendig.','transferCounterexampleEn':'An item delivered late can also be defective, so the terms are not an automatic one-box classification. Withdrawal alone likewise does not establish unconditional damages; the P requires separate responsibility/loss checks. The card introduces no extra memorised statutory time limits.','boundedRemedyNeeded':None,'currentCardCanReceiveFinalKeptSuccessorRebinding':True},
]
write('three-independent-current-card-origin-fit-KEEP2-REVISE1.READONLY.review.json',{'reviewer':'/root/economics_final56_current_round_a','independence':'Independent of the three existing card authors; previously reviewed seven description candidates. Previous own NAIRU P/7c scope authorship disclosed; this does not requalify NAIRU science or blind D.','reviewAuthority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1','status':'needs_human_review','reviewedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'decisions':reviews,'primaryLegalPagesActuallyOpened':[{'url':'https://www.gesetze-im-internet.de/bgb/__241.html','use':'Performance obligations and duties to consider the other party support the limited structural anchor; no new whole legal source mapping.'},{'url':'https://www.gesetze-im-internet.de/bgb/__275.html','use':'Impossibility and the separation of performance and other rights.'},{'url':'https://www.gesetze-im-internet.de/bgb/__280.html','use':'Additional conditions for delay damages and damages instead of performance.'},{'url':'https://www.gesetze-im-internet.de/bgb/__286.html','use':'Delay has additional conditions; the card does not itself decide them.'}],'nativeCardFingerprintsComputed':0,'cardsAuthoredOrChanged':0,'humanApproval':False,'M6orM7Approval':False})

scope=read(O/'actual-current-and-INCOMPLETE-v3-35-native-scopes-stage-memory-subsets.READONLY.json')
scopeInventory=[]
for v in scope['reports'][0]['views']:
 historical=next((x for x in Mconfig['visibilityScopes'] if x['viewPath']==v['path']),None)
 scopeInventory.append({'viewPath':v['path'],'wholeScope':v['scope'],'isExistingUnmodifiedMConfigVisibilityScope':historical is not None,'existingMConfigEntry':historical,'currentNativeCompileErrors':len(v['compileErrors']),'currentNativeDuplicateCompiledIds':len(v['duplicateCompiledSourceIds']),'currentNativeTargetsUnfiltered':v['nativeRoleTargetCount'],'currentNativeTargetsAfterStageAndScope':v['afterNativeStageAndCountryCourseDurationTargetCount'],'currentMemoryRequiredAfterStageAndScope':len(v['memoryRequiredAfterNativeStageAndScopeFilters']),'currentMissingRequiredMemoryAfterStageAndScope':len(v['missingReferencedMemoryAfterNativeStageAndScopeFilters']),'stableFinalScopeCheck':'PENDING exact stable Sourcecore/343 composite. Compile authored view and roles, runtime projection, actual jurisdiction/course/stage filtering, required-memory node visibility and retained prerequisite-only global IDs. No new Mconfig entry inferred solely from stage/name.'})
assert len(scopeInventory)==35 and sum(x['isExistingUnmodifiedMConfigVisibilityScope'] for x in scopeInventory)==34

prior=Q/'wirtschaft-one-current-682-pure-Q1-terminal-native-technical-independent-a-INERT-v22/actual-final679-AM-native-cli-tool-results.receipt.json'
node=pathlib.Path('/tmp/skillpilot-checkpoint-native-node-path.txt').read_text().strip()
tool={'provider':'OpenAI','modelFamily':'GPT-6','runtime':'Codex','exactModelRevision':'not_exposed','samplingParameters':'not_exposed','nativeNodeVersion':subprocess.check_output([node,'--version'],text=True).strip(),'tsxVersion':read(R/'app/node_modules/tsx/package.json')['version'],'nativeTsxEntrypoint':'app/node_modules/tsx/dist/cli.mjs','actualScopeCommand':{'argvExecutableFrom':'/tmp/skillpilot-checkpoint-native-node-path.txt','argvAfterExecutable':['app/node_modules/tsx/dist/cli.mjs',rel(O/'run-actual-scope-stage-only.READONLY.ts')],'exitCode':0,'stdout':bind(O/'actual-scope-only-native-command.stdout.txt'),'stderr':bind(O/'actual-scope-only-native-command.stderr.txt'),'result':bind(O/'actual-current-and-INCOMPLETE-v3-35-native-scopes-stage-memory-subsets.READONLY.json')},'AorMFingerprintCLIExecutedForThisPlan':False}
write('actual-provider-toolchain-and-scope-command.READONLY.receipt.json',tool)

newentries=[{'goalId':gid,'titleCandidate':candidate[gid]['title'],'candidateInputPaths':originpaths[gid],'ARecordRequired':'Fresh content atomicity decision and current native binding after stable whole composite; no existing record.','MDecisionCandidate':next(x for x in five if x['goalId']==gid),'nativeFingerprints':'NOT_COMPUTED_PENDING_STABLE_SOURCECORE'} for gid in sorted(new)]
write('bounded339-draft-native-A-M-binding-scope-plan.READONLY.json',{
 'role':'BOUNDED339_DRAFT_NATIVE_BINDING_AND_SCOPE_PLAN_ONLY',
 'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'status':'INERT_DRAFT_PENDING_STABLE_SOURCECORE_AND_ADDITIVE_625_CARD_REMEDY',
 'historicalBoundedDenominator':339,'currentDenominator':336,'currentCanonicalGoals':679,
 'rootDisclosedLaterFinalExpectedOrdinaryDenominator':343,
 'scopeWarning':'Root independently found three BB compulsory-source gaps plus an option condition. Sealed SourceScopev3 is explicitly INCOMPLETE; additional four-facet BB package is inflight. This bounded twelve-plus-three inventory is not a final682/339 or final343 integration claim.',
 'disclosures':{'ownPreviousNAIRUWholeGoalAndPAuthorship':True,'ownPrevious7c121B84ScopePracticeAuthorship':True,'independentOfRootMemoryCardAuthor':True,'notIndependentNAIRUGoalPScienceReview':True,'notBlindDescriptionReview':True,'newHistoricalOtherCardContentReviews':0},
 'currentBindings':{'CAN':bind(canpath),'REG':bind(regpath),'SEM':bind(R/S['semanticKindLedgerPath']),'AConfig':bind(R/S['semanticAtomicityConfigPath']),'MConfig':bind(R/S['memoryReviewConfigPath']),'ALedger':bind(ap),'MLedger':bind(mp),'cardLedger':bind(cp),'floors':bind(R/'app/scripts/config/curriculum-maturity-floor-policy.json')},
 'unchangedExistingNativePassEvidence':{'actualToolReceipt':bind(prior),'applicability':'Actual two official current679/336 A/M check-mode results, exit0; valid baseline reuse only. Private portable final config canonical payload is byte-identical to current CAN; unchanged336 records/66cards/34views, no future339/343 claim.','portableAConfig':bind(Q/'wirtschaft-one-current-682-pure-Q1-terminal-native-technical-independent-a-INERT-v22/portable/final/atomicity336.final-native-scope.INERT.config.json'),'portableMConfig':bind(Q/'wirtschaft-one-current-682-pure-Q1-terminal-native-technical-independent-a-INERT-v22/portable/final/memory336.final-native-scope.INERT.config.json'),'declaredCurrentMemoryReportExists':(R/Mconfig['reportPath']).exists()},
 'nativePayloadBoundary':{'goalFields':['ruleVersion','goalId','shortKey','title','titleEn','description','descriptionEn','dimensionTags.phase','dimensionTags.area','dimensionTags.topicCode','nodeKind'],'goalNormalization':'NFKC, whitespace collapse, trim; actual native sorted object serialization. Field comparisons only here; no fingerprint calculation.','excludedFromGoalFingerprint':['requires','contains','applicability','resourceLinks','dimensionTags.demandLevel','tags','extendedData','examData','semanticKind','type'],'cardFields':['ruleVersion','deckId','cardId','normalized front','normalized back','normalized category','normalized tags array in actual order'],'originGoalIdsInNativeCardFingerprint':False,'consequence':'Native card hash equality alone does not establish current origin-fit. Kept origins must independently remain ordinary memory_required goals referencing that deck; necessary cards and visible memory nodes must trace to those origins.'},
 'boundedChangedOldRecordsCount':12,'boundedChangedOldRecords':sorted(changed,key=lambda x:x['goalId']),
 'boundedNewRecordsCount':3,'boundedNewRecords':newentries,
 'unchangedOldRecordCount':324,'exactRecordReuseInventory':bind(O/'324-exact-old-A-and-M-raw-record-reuse.READONLY.json'),
 'scopedOrWholeUnchangedOrdinaryRecordsWithNoNewNativeGoalPayload':sorted(preserved,key=lambda x:x['goalId']),
 'separatePracticeScopeOnly':sorted(practice,key=lambda x:x['goalId']),
 'separateScopePracticeObligations':['121: authored HB/TH prerequisiteOnly visibility is didactic visibility, not invented normative curricular coverage; preserve whole tariff semantics/P and no progress/frontier/book target widening.','b84: actual false NAIRU prerequisite replaced by employment-policy EEE in separate author candidate; A/M semantic payload unchanged.','f93: whole practice directly checks NAIRU and tariff breadth, both required goal IDs and coveredGoalIds must match whole tasks.','da1: whole supplied NAIRU/tariff cases and existing requires/coveredGoalIds checked separately; Practice exclusion is not coverage approval.','28a/81: whole tasks do not justify inherited NAIRU gate; inspect the resolved b84→EEE route and exact coverage, not automatic requires inference.','072: entire derived applicability follower candidate is a Practice endpoint, not a memory goal; current target/prerequisite closure and country/course roles need separate native applicability/runtime verification.','Source mappings, normative country/course roles, current P-context fingerprints, book bindings, images and native fresh D follow the stable composite; no A/M digest substitutes for these gates.'],
 'rootFiveMDecisions':{'authorInput':bind(fivepath),'decisions':five,'existingIndependentReviewSeal':bind(Q/'wirtschaft-five-semantic-successor-memory-three-cards-independent-a-INERT-v1/independent-review-seal.json'),'NAIRUV2AuthorCards':bind(v2cards),'NAIRUIndependentClosureSeal':bind(Q/'wirtschaft-nairu-memory-threshold-one-back-string-independent-a-closure-INERT-v1/independent-targeted-closure-seal.json'),'nativeHashesPending':True,'limit':'Reuse the disclosed independent root-memory/card review and separate substantive NAIRU closure; no new independent NAIRU goal/P science approval. Original M reason non-accelerating must not override v2 precise constant-inflation threshold/DeltaPi=0.'},
 'cards':{'currentPrimaryDecks':10,'currentKeptCards':66,'boundedRootSuccessors':'Two changed whole cards (7c NAIRU v2, 1826 market-power anchor) plus one new PUB definitions card.','boundedProposedCardCountBefore625Remedy':67,'64OtherCurrentWholeCardsMechanicallyUnchanged':True,'actualMechanical64WholeObjectReuseReceipt':bind(O/'64-unchanged-whole-cards-actual-mechanical-reuse-2changed-1new.READONLY.json'),'mechanicalDeckAndLedgerInventory':bind(O/'actual-ten-deck-files-66-card-ledger-observation.READONLY.json'),'additionalTargetedUnchangedCardOriginFitReview':bind(O/'three-independent-current-card-origin-fit-KEEP2-REVISE1.READONLY.review.json'),'originFitKeepCardIds':['economics-law-contract-types','economics-law-performance-disturbance'],'openOriginFitReviseCardId':'economics-market-environment-policy','nativeRebindingSetAfterRoot625Remedy':'7c old card,1826 old card,new PUB card,plus 625 additive reduced-origin-fit successor if independently closed. Other64 current rows are preserved; after625 content remedy,63 unchanged rows plus625 changed row. All67 primary rows/deck traces still checked by native M.','noInfoOrEU5aafSRS':'INFO has supplied-data understanding; EU5aaf supplied bilingual rule is case material. No extra flashcard unaided-recall obligation.','noBlanketCardRefresh':True},
 'all35ActualScopes':scopeInventory,
 'actualScopeOnlyObservations':{'report':bind(O/'actual-current-and-INCOMPLETE-v3-35-native-scopes-stage-memory-subsets.READONLY.json'),'currentAndV3CompilerErrors':0,'currentAndV3CompiledDuplicates':0,'currentAndV3MissingRequiredMemoryAfterFilters':0,'SekIActualCurrent':{'unfilteredTargetCount':146,'afterNativeStageCount':8,'unfilteredRequiredMemoryGoalCount':26,'afterNativeStageRequiredMemoryGoalCount':0},'SekIHistoricalIncompleteV3':{'unfilteredTargetCount':148,'afterNativeStageCount':8,'unfilteredRequiredMemoryGoalCount':27,'afterNativeStageRequiredMemoryGoalCount':0},'scopeConfigWrites':0,'privateNativeMVisibilityCollectorExecuted':False,'scopeFinding':'Zero required-memory subset is an actual native Stage-filter result for these two exact input stands. The private native M collector has no stage/jurisdiction filter and still sees26/27 before stage. Final source/343 composite must repeat the explicit35th check; no final null subset is presumed.'},
 'futureNativeStepsAfterStableSourceScope':[
  {'step':1,'action':'Freeze an exact whole source/country/course/placement/contains/requires/practice composite and35whole views; close BB compulsory/option-condition work, independently resolve625 card remedy, preserve all history/current/floor guards. Recalculate actual ordinary denominator from real current graph and SEM, expected343 from Root rather than assuming this bounded339 inventory is final.'},
  {'step':2,'action':'Author/review the twelve existing changed and three new A/M records substantively from stable whole goals, plus separate BB additions. Reuse324 exact raw A/M rows within this bounded package. No mass no_memory/atomic stamping. Preserve truthful authorities/statuses and original provenance on untouched rows.'},
  {'step':3,'action':'Create new private candidate A/M/config/card-ledger files only. A explicit leafGoalIds includes every actual ordinary goal exactly once; M root reachability includes the new ordinary atoms. Point both configs at the exact same stable landscape and SEM; M points at current10canonical/runtime deck pairs and actual candidate card ledger. Keep existing34 visibility entries unless an explicitly authored final decision changes them; separate35th SekI run is mandatory.'},
  {'step':4,'nativeCommand':'nativeNode app/node_modules/tsx/dist/cli.mjs app/scripts/semanticAtomicityReview.ts --config <private-stable-A-config> --write-fingerprints','action':'Use only the unmodified native generator after authored records exist; it updates existing records and does not create/qualify missing new ones. Confirm324raw unchanged rows remain byte-exact (candidate serialization alone can rewrite lines). Retain raw actual tool output.'},
  {'step':5,'nativeCommand':'nativeNode app/node_modules/tsx/dist/cli.mjs app/scripts/memoryCardReview.ts --config <private-stable-M-config> --write-fingerprints','action':'Bind existing authored whole-goal/card records to exact stable bytes. Add the genuinely reviewed newPUB and any BB records beforehand; replace7c/1826/625 records only after actual whole-card independent content closure. Check all originGoalIds although they are excluded from native card hash; preserve untouched rows.'},
  {'step':6,'nativeCommands':['nativeNode app/node_modules/tsx/dist/cli.mjs app/scripts/semanticAtomicityReview.ts --config <private-stable-A-config> --mode=check','nativeNode app/node_modules/tsx/dist/cli.mjs app/scripts/memoryCardReview.ts --config <private-stable-M-config> --mode=check'],'action':'Actual native independent check-mode results must pass A scope set, current decisions, cards/deck traces, every configured34 memory visibility scope and cross-goal origin validity. No preview-only/hash-only success claim.'},
  {'step':7,'action':'Repeat native whole35view compiler/role/runtime plus actual country/course/duration/stage filters on the stable composite. Explicitly report final SekI memory_required subset and referenced visible memory nodes; include final cards needing visibility7c/1826/PUB/625/479/87 and all other unchanged needed goals. Repeat f93/da1/072 prerequisite closure and121HBTH global prerequisiteOnly preservation outside target/frontier/progress/book.'},
  {'step':8,'action':'Regenerate current curriculum QA and run protected floor checks using exact final paths. No floor-policy edits or claimedM6/M7 merely from nativehashes; P/D/V/source and human/trial gates remain separately truthful.'},
 ],
 'machineTruth':{'nativeGoalFingerprintsComputed':0,'nativeCardFingerprintsComputed':0,'newALedgerRecordsAuthored':0,'newMLedgerRecordsAuthored':0,'activeWrites':0,'newCardObjectsAuthored':0,'sourceMappingsAuthored':0,'AorMFinalApproval':False,'currentM6orM7Approval':False,'humanApproval':False,'humanTrial':False},
 'toolchain':tool,
})
print(json.dumps({'boundedOldChanged':len(changed),'new':len(new),'exactOldAandMReuse':len(reuse),'currentDecks':len(deckdata),'currentCards':len(cards),'threeCardOriginReview':['REVISE','KEEP','KEEP'],'actualScopes':len(scopeInventory),'nativeFPsComputed':0,'activeWrites':0}))
