# Apache-2.0. Finite author packet only; no activation or scientific acceptance.
import datetime,hashlib,importlib.util,json,pathlib,subprocess,sys
sys.dont_write_bytecode=True
R=pathlib.Path('/home/enpasos/projects/skillpilot');O=pathlib.Path(__file__).parent;E=O.parent
I=E/'chemie-current407-naturstoffe-seven-paired-resolution-existing274-integration-technical-20261014-v1'
P=E/'chemie-source-duty-conditional-QA-integration-plan-author-20261014-v1'
read=lambda p:json.loads(p.read_text())
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}
def check(b):
 p=R/b['path'];assert p.is_file() and sha(p).removeprefix('sha256:')==b.get('sha256',b.get('rawSHA256')).removeprefix('sha256:'),p
 if 'bytes'in b:assert p.stat().st_size==b['bytes'],p
 return p
def write(n,x):
 p=O/n;assert not p.exists(),p;p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return p
now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
inputs=read(O/'INPUTS.actual280-whole-source-conditions-and-protected-readonly-bindings.json')
for b in inputs['exactInputs']+inputs['wholeOriginalPdfBindings']+inputs['originalSourceA_BBodyJudgmentBindings']:check(b)
for b in inputs['wholePrimaryContextReads']:check(b['completeAlreadyBoundLayoutTextRead'])
ids=inputs['goalIds'];old=read(O/'inputs/canonical533.actual280-base.immutable-hardlink.json');new=read(O/'candidate/canonical539.prospective-current412-on-actual280.author-only.json')
bo={g['id']:g for g in old['goals']};bn={g['id']:g for g in new['goals']};root='442c31c5-c561-5c7a-90bb-2335d779175c'
plan=read(P/'candidate/canonical539.current407-plus-five-source-duty-atoms-and-offering-boundary.author-only.json');planby={g['id']:g for g in plan['goals']}
assert len(bo)==533 and len(bn)==539 and all(bn[i]==planby[i]for i in ids)
assert all(bn[i]==g for i,g in bo.items()if i!=root)
assert {k:v for k,v in bo[root].items()if k not in ['contains','weight']}=={k:v for k,v in bn[root].items()if k not in ['contains','weight']}
assert len(bn[root]['contains'])==len(bo[root]['contains'])+1 and bn[root]['contains'][:-1]==bo[root]['contains'] and bn[root]['weight']==bo[root]['weight']+5
for i,g in bo.items():assert bn[i].get('requires',[])==g.get('requires',[]) and bn[i].get('resourceLinks',[])==g.get('resourceLinks',[])
for i in inputs['currentStrict280Ids']+inputs['protected262Ids']:assert bn[i]==bo[i]
assert len(inputs['currentStrict280Ids'])==280 and len(inputs['protected262Ids'])==262
src=read(O/'inputs/whole-six-original-source-conditions-seven-carrier-unions.exact-from-sealed-plan.json')
assert src==read(P/'SOURCE6.full-original-duty-conditions-partner-unions-and-bound-sealed-decisions.json')
whole=read(O/'WHOLE.five-goals-prerequisites-successors-source-course-and-full-partner-unions.author.json')
assert len(whole['goals'])==5 and len(whole['relationships'])==6
for row in whole['goals']:
 assert row['wholeCurrentCandidateGoal']==bn[row['goalId']]
 assert row['wholeDirectPrerequisites']==[bn[i]for i in bn[row['goalId']]['requires']]
 assert not row['newClassroomSelectionClaim']
 for c in row['wholeSourceRecordAndAllCarrierAlternatives']['wholeOriginalAndConditionalCarrierCAS']:
  check(c['mappingCarrierFrozenBinding']);assert all(m['matchType']=='partial'for m in c['NONOPERATIVEConditionalAfterAllMappingsForSourceCell'])
neighbours=read(O/'inputs/whole-neighbour-source-operators-and-all-current-partners.not-cleared.json')
assert len(neighbours['rows'])==14
for x in neighbours['rows']:
 check(x['wholeSourceCarrier'])
 for g in x['wholeCurrentCanonicalPartners']:assert bn[g['id']]==g
casepath=O/'cases/whole-five-goals-ten-complete-bilingual-application-cases.author.json';cases=read(casepath)
assert len(cases['goals'])==5 and [g['goalId']for g in cases['goals']]==ids
profiles=[json.loads(t)for t in (O/'P/five-current-whole-goal-author-E0-G0.profiles.jsonl').read_text().splitlines()if t.strip()]
assert len(profiles)==5 and{r['goalId']for r in profiles}==set(ids)
criteria=O/'P/criteria.whole-five-author-E0-G0.md';assert sha(casepath)in criteria.read_text()
for g in cases['goals']:
 assert len(g['cases'])==2
 r=next(r for r in profiles if r['goalId']==g['goalId'])
 assert r['reviewCriteriaFingerprint']==sha(criteria) and r['evidenceLevel']=='E0' and r['maximumClaimScope']=='G0'
 assert r['status']=='needs_human_review' and r['reviewAuthority']=='ai_candidate' and r['reviewRunIds']==[]
 for c,b in zip(g['cases'],r['profile']['applicationCaseBriefs']):
  assert not c['executed'] and not c['learnerWorkPresent'] and c['evidenceLevel']=='E0' and c['maximumClaimScope']=='G0'
  assert c['maximumPoints']==sum(x['maximumPoints']for x in c['rubric'])==12 and len(c['rubric'])==4
  assert [x['expectationId']for x in c['rubric']]==['e1','e2','e3','e4']
  for key in ['materialDe','materialEn','taskDemandDe','taskDemandEn','modelAnswerDe','modelAnswerEn']:assert isinstance(c[key],str)and len(c[key])>100
  assert b['taskDemandDe']==c['taskDemandDe']and b['taskDemandEn']==c['taskDemandEn']and b['expectedPerformanceDe']==c['modelAnswerDe']and b['expectedPerformanceEn']==c['modelAnswerEn']
for lane in ['A','M']:
 rs=[json.loads(t)for t in (O/f'{lane}/five-{lane}-unapproved-author-candidates.jsonl').read_text().splitlines()if t.strip()]
 assert len(rs)==5 and all(r['status']=='needs_developer_review'for r in rs)
 assert all(r['semanticAtomic'if lane=='A'else'memoryUseful']is None for r in rs)
assert not (O/'M/empty-new-card-review-stream.jsonl').read_text()
assert read(O/'checks/STOCK.A5.author-pending-report.actual.json')['exitCode']==0
mr=read(O/'checks/STOCK.M5.explicit-empty-cards-author-pending-report.actual.json');assert mr['exitCode']==0 and'Obsolete card review records: 0'in mr['stdout']
fp=read(O/'checks/FINAL.STOCK.P5-current-full-case-fingerprints-schemas-and-five-classification-HOLDs.actual.json')
assert fp['lowLevelSchemasAndCurrentStockModelFingerprintSemanticsPass']==5 and fp['actualMissingAuthoritativeClassifications']==5 and fp['actualDependentKindlessGoalAndInputFingerprintFailures']==10
program=read(O/'checks/STOCK.seven-static-programmes-on-actual280-new-errors0-preexisting-gaps307.actual.json')
assert program['preexistingLayerAAcquisitionGapOccurrences']==307 and program['technicalCompileNewErrors']==0 and program['newGapOccurrencesBeyondBaseline']==0
visuals=read(O/'V/five-specific-comic-PNG-prompts-and-actual-existing-image-fit.NOT-GENERATED.json')
assert len(visuals['prompts'])==5 and visuals['newPixelFiles']==0 and not visuals['newImageGenerationToolsCalled']
for x in visuals['existingActualPixelsInspected']:check(x['actualInspectedPixelBinding'])
for b in inputs['readonlyHostObservedBindings']+inputs['readonlyHostNI3Bindings']:check(b)
active=read(I/'checks/FINAL-CHECK.active-aliases-readonly-observed-bindings.json')
for b in active['files']:check(b)
floor=R/'app/scripts/config/curriculum-maturity-floor-policy.json'
assert sha(floor)=='sha256:2d45ea95d5e40751d57a3470b99ac2fbd6f24887b1ee3c8c7d53983d028783ea'
write('checks/FINAL.whole-current280-and262-bodies-source-unions-cases-profiles-and-protected-files.actual.json',{
 'schemaVersion':1,'checkedAt':now(),'all532OldWholeNonrootGoalsExact':True,'fiveWholeGoalBodiesExactOriginalReviewedSourceAuthor':True,
 'onlyOldRootContainsAppendAndWeightPlus5':True,'allCurrent280AndProtected262WholeBodiesExact':True,
 'allOriginalRequiresAndAllOldResourceLinksExact':True,'allFourN7ReviewedPngLinksExact':True,'threeNIReviewedPartialCarriersExact':inputs['readonlyHostNI3Bindings'],
 'fullSixOriginalSourceRecordAndSevenCarrierUnionDocumentExact':True,'fiveSelectedWholeSourceGoalContexts':5,'fullCarrierRelationshipAlternatives':6,
 'wholeNeighbourOperators':14,'uniqueCurrentWholeNeighbourPartnerGoals':len({g['id']for x in neighbours['rows']for g in x['wholeCurrentCanonicalPartners']}),
 'actualCurrentBeforeMappingsForFiveSelectedCells':'empty; exact empty unions retained. Neighbouring full mapping partners are separately preserved; no surrogate or default-target-only pruning.',
 'tenCompleteBilingualCases':10,'bilingualRubricCriteria':40,'allFivePProfilesE0G0CandidateOnly':True,'allA5M5RecordsUnapproved':True,
 'normalPActualClassificationsMissing':5,'normalPDependentKindlessFingerprintErrors':10,'lowLevelProspectiveKindStockModelChecksPass':5,
 'staticUnregisteredProgrammeDocuments':7,'preexistingAcquisitionGapOccurrences':307,'newAcquisitionGapOccurrences':0,
 'readonlyHostObservedBindingsExact':inputs['readonlyHostObservedBindings'],'activeReadOnlyAliasesExact':active['files'],'protectedUnmodifiedFloorPolicy':bind(floor),
 'Math807Physics478Biology397FloorPolicyNotModified':True,'newScienceAcceptance':False,'newStrictGain':0,'hostWrites':False,'activeWrites':False})
matrix=[]
for g in whole['goals']:
 i=g['goalId'];matrix.append({'goalId':i,'title':bn[i]['title'],'titleEn':bn[i]['titleEn'],'sourceCondition':g['sourceCondition'],'courseEligibility':g['courseEligibility'],
  'D':'AUTHOR_FULL_BILINGUAL_GOAL_AND_CONTEXT_READY; actual native campaign and two independent votes not run; final visual bindings pending',
  'P':{'wholeCases':2,'rubricCriteria':8,'status':'needs_human_review','reviewAuthority':'ai_candidate','evidenceLevel':'E0','maximumClaimScope':'G0','independentReviewPending':True},
  'A':{'authorRecommendation':'atomic','nativeRecordStatus':'needs_developer_review','acceptedDecision':False},
  'M':{'authorRecommendation':'no_memory_needed','nativeRecordStatus':'needs_developer_review','acceptedDecision':False},
  'V':{'specificPromptPrepared':True,'actualNewPngExists':False,'newApproval':False},'strictOrSourceCourseClosure':False})
write('AUTHOR.five-full-gate-readiness-matrix-and-explicit-HOLDs.json',{'schemaVersion':1,'authorOnly':True,'rows':matrix,
 'wholeGoalTextDeltaFindings':'No demonstrated text defect requiring a silent goal revision. All five exact whole bodies retained; independent reviewers may block them.',
 'independentReviewFocus':['HB: actual manufacture+structure+properties+uses for oil,resin,rubber; sparse-versus-dense networks and grade limits.',
 'RP03: charge/valence-correct local electron-pair and mediated proton-transfer scheme, explicitly a teaching model; no unique elementary-route or kinetic claim. Genuine chain/end-cap transfer.',
 'RPd72: azo plus two other classes and all five criterion types, including honest missing data; no mechanism duty for the other classes.',
 'SN: soluble Ag(I)-thiosulfate complex and retained Ag0 image; ideal ligand-capacity calculation not execution, total speciation or real fixing time.',
 'TH: complete comparison of all three routes with chemical reasons; changed examples must defeat universal heat/moisture/catalyst claims.',
 'Existing prerequisites remain unchanged. Judge whether their preparation plus supplied concept glossary is sufficient; do not silently remove or invent global prerequisite edges.'],
 'remainingScopeHolds':['Four optional source selections remain conditional, with no inferred actual classroom choice or universal default duty. TH LK three-route comparison remains mandatory.',
 'Seven static programme views remain unregistered and307 pre-existing acquisition-gap occurrences remain; static author curation is distinct from actual human teaching selection.',
 'New authoritative semantic classifications absent; no new D/P/A/M/V accepted. NormalP has5 missing-classification and10 derived kindless-fingerprint errors, deliberately not masked.',
 'Five new images do not yet exist. No generated pixels, V approvals, human/release claims or final image-bound D/P records.',
 'Current682 promised-formula material HOLD, four BB/BE M311 acquisition HOLDs and sourceM1/M6/CQR003/004 boundaries from actual280 remain unchanged.',
 'SN neighbouring practical fixing/solubility experiment and TH actual polymer-manufacture experiment remain separate whole obligations; paper solutions supply no practical execution.'],
 'twoIndependentScientificReviewsNext':True,'scientificReviewerMayReject':True,'authorNotAnAdditionalIndependentVote':True,'newStrictGain':0})
write('D.five-whole-native-review-preparation.NO-EXECUTED-CAMPAIGN.json',{'schemaVersion':1,'authorOnly':True,'goalIds':ids,
 'fullCurrentWholeCanonical':bind(O/'candidate/canonical539.prospective-current412-on-actual280.author-only.json'),
 'fullDEENGoalsPrerequisitesReversePrerequisitesAndSourceConditions':bind(O/'WHOLE.five-goals-prerequisites-successors-source-course-and-full-partner-unions.author.json'),
 'fullOriginalNeighbourOperatorsAndAllPartners':bind(O/'inputs/whole-neighbour-source-operators-and-all-current-partners.not-cleared.json'),
 'fullTenDEENCasesActualInlineMaterialsModelAnswersAndRubrics':bind(casepath),'actualP5Candidates':bind(O/'P/five-current-whole-goal-author-E0-G0.profiles.jsonl'),
 'imageState':'Five prompts only. Existing inspected neighbouring images are not relabelled as full new-goal approvals. No native pages/current campaign claimed.',
 'next':'After actual correct pixels are selected and independently V-reviewed, prepare genuine stock native goals/pages/contexts and fresh independent A/B D records. Rebind affected P inputs normally and assess scientific effects; no hash-only approval.',
 'futureBuilderPreflightContract':bind(I/'CHECK.finite-pre-central-raw-types-stock-V-and-terminal-D-chain.actual.json'),
 'futureImageQAFormat':'Every present approval field is the stock yes/no string; preserve original actual pixelSHA/reviewer/date/reason. Verify canonical,public,approvedSHA independently and run whole stock V --check before any central six-check run. No approval minted here.',
 'newDRecordsOrRunManifestsInvented':False,'activeWrites':False})
write('checks/INITIAL.author-helper-errors-and-corrections.preserved.json',{'schemaVersion':1,'recordedAt':now(),
 'emptyNeighbourSelection':{'retainedRaw':'checks/INITIAL.empty-neighbour-selection-before-sourceGoals-key-correction.json','cause':'Initial helper read goals rather than sourceGoals. Corrected selector now preserves14 whole neighbour rows and24 unique current partner bodies; no source cell changed.'},
 'initialMCardStreamFallback':{'retainedActualReceipt':'checks/STOCK.M5.author-pending-report.actual.json','initialConfig':'config/M5.author-pending-review.config.json','correction':'Explicit empty new card stream and additive config/M5.author-pending-review.explicit-empty-cards.config.json. Corrected scoped report has0 missing/stale goal records and0 duplicate/obsolete card records. Five unresolved M decisions remain.'},
 'initialFinalPErrorCountAssertion':{'actualFailedToolChunkId':'d4c045','exitCode':1,'cause':'Helper incorrectly expected only5 missing-kind errors. Actual normal stock also produces10 dependent kindless fingerprint errors. Candidate fingerprints correctly bind prospective kind; no authority or checker change used to suppress errors.','correctedActualToolChunkId':'0b4a49','finalReceipt':'checks/FINAL.STOCK.P5-current-full-case-fingerprints-schemas-and-five-classification-HOLDs.actual.json'},
 'authorTypo':'Dichteeignung corrected to Dichtungseignung in new unreviewed case/profile only. Whole case digest, criteria and all currentP fingerprints rebound and checked afterward.',
 'noOriginalScientificArtifactsRewritten':True})
write('PROVENANCE.actual-author-role-and-scope.no-independent-vote.json',{'schemaVersion':1,'startedAt':read(O/'STARTED.actual.json')['startedAt'],'completedAt':now(),
 'provider':'OpenAI','agent':'Codex','exactModelVersion':'not exposed by this author execution environment','samplingControls':'not exposed; not invented',
 'role':'Author successor only. Earlier sourceB and conditional-programme author history disclosed; this package is not an independent vote on its own new cases.',
 'reviewRunIds':[],'actualAuthorProducedWholeCases':10,'actualExecutedLearnerCases':0,'newIndependentScientificVotes':0,
 'stockExecuted':'Finite canonical and seven-view checks, P schema/model checks plus actual full-config HOLD, A/M scoped report mode, final finite parse and actual curriculum symlink guard only.',
 'noCentral412ReportOrNewStrictMeasurement':True,'actual280BaseRemainsMeasuredReference':True,'hostReadOnly':True,'engineRuntimeRegistryGitActiveWrites':False})
neutral=write('NEUTRAL.exact-five-stable-whole-goals-current280-to-prospective412-author-inputs.json',{
 'schemaVersion':1,'selectedAt':now(),'authorOnly':True,'goalIds':ids,'currentOperativeAtomicCount':407,'prospectiveCandidateAtomicCount':412,
 'baseActualStrictCount':280,'newMeasuredStrictGain':0,'wholeCurrentCandidate':bind(O/'candidate/canonical539.prospective-current412-on-actual280.author-only.json'),
 'wholeOriginalSourceBodiesAndConditions':bind(O/'inputs/whole-six-original-source-conditions-seven-carrier-unions.exact-from-sealed-plan.json'),
 'wholeCurrentPrerequisitesSuccessorsAndAllPartners':bind(O/'WHOLE.five-goals-prerequisites-successors-source-course-and-full-partner-unions.author.json'),
 'wholeNeighbourSourceAndPartnerCompanion':bind(O/'inputs/whole-neighbour-source-operators-and-all-current-partners.not-cleared.json'),
 'actualWholePrimaryBindings':inputs['wholePrimaryContextReads'],'wholeOriginalPdfBindings':inputs['wholeOriginalPdfBindings'],
 'wholeTenBilingualCasesAndRubrics':bind(casepath),'P5E0G0':bind(O/'P/five-current-whole-goal-author-E0-G0.profiles.jsonl'),'exactPCriteria':bind(criteria),
 'nativeA5PendingCandidates':bind(O/'A/five-A-unapproved-author-candidates.jsonl'),'nativeM5PendingCandidates':bind(O/'M/five-M-unapproved-author-candidates.jsonl'),
 'AMAuthorRecommendationsAndReasons':bind(O/'AUTHOR.five-semantic-atomicity-and-memory-proposals.not-independent.json'),
 'PConfigNotOperativeUntilFiveClassifications':bind(O/'config/P5.author-E0-G0.NONOPERATIVE-pending-five-classifications.config.json'),
 'AConfig':bind(O/'config/A5.author-pending-review.config.json'),'MConfigCorrectedExplicitEmptyCards':bind(O/'config/M5.author-pending-review.explicit-empty-cards.config.json'),
 'visualPromptsAndActuallyInspectedExistingPixels':bind(O/'V/five-specific-comic-PNG-prompts-and-actual-existing-image-fit.NOT-GENERATED.json'),
 'DNativePreparationNotExecuted':bind(O/'D.five-whole-native-review-preparation.NO-EXECUTED-CAMPAIGN.json'),
 'sevenStaticProgrammeDocumentsUnregistered':bind(O/'inputs/whole-seven-static-programme-candidates.exact-from-sealed-plan.json'),
 'actualBoundedSevenViewChecks':bind(O/'checks/STOCK.seven-static-programmes-on-actual280-new-errors0-preexisting-gaps307.actual.json'),
 'preciseReadinessAndHolds':bind(O/'AUTHOR.five-full-gate-readiness-matrix-and-explicit-HOLDs.json'),
 'all280And262BodiesRequiresFourPNGsNI3PreservationProof':bind(O/'checks/FINAL.whole-current280-and262-bodies-source-unions-cases-profiles-and-protected-files.actual.json'),
 'authorHistoryAndNoIndependenceClaim':bind(O/'PROVENANCE.actual-author-role-and-scope.no-independent-vote.json'),
 'peerReviewProtocol':'Two actual independent reviewers read the whole inputs and form their own first sealed science decisions before peer results. Do not count author recommendations or stock checks as science votes; reject/HOLD is allowed. No arbitrary extra-task or third-vote quota.',
 'actualClassroomSelectionClaim':False,'newGateClosures':0,'newAuthoritativeSemanticClassifications':0,'newImages':0,'activeWrites':False})
(O/'README.md').write_text('''# Fünf Source6-Atome: vollständiges inaktives Autorenpaket

Ausgangspunkt ist der versiegelte tatsächliche Stand280/407. Der Kandidat enthält539 Knoten und prospektiv412 curriculare Atome: fünf unveränderte vollständige DE/EN-Ziele und ein separater Angebotscluster. d72 ist die exakte Wiederverwendung eines bereits vorhandenen unregistrierten Entwurfs. Alle532 bisherigen Nicht-Wurzel-Knoten, insbesondere alle280 strikten und262 geschützten Zielkörper, sämtliche ursprünglichen requires und Bildlinks bleiben exakt. Nur root442 enthält zusätzlich den separaten Cluster und Gewicht+5. Es gibt keine operative412-Auswahl und keinen neuen strikten Abschluss.

## Tatsächlich geliefert

- Fünf ganze Ziel-/Voraussetzungs-/Nachfolger-/Quellen-/Kurskontexte, die vollständige ursprüngliche Source6-Union mit sieben Carrieralternativen, sechs relevante Carrierbeziehungen und zusätzlich14 Nachbaroperator-Zeilen mit24 ganzen aktuellen Partnerzielen. Leere aktuelle Before-Unionen werden ausdrücklich als leer erhalten. RP-Klassifikation, Azo-Synthese, SN-Praktikum und TH-Monomer-/Polymervergleich bzw. Herstellung bleiben getrennte Originalpflichten.
- Zehn vollständige bilinguale Anwendungsfälle mit vollständig eingebettetem Material, Musterlösungen und40 Rubrikkriterien. HB verlangt Öl/Harz/Kautschuk einschließlich Herstellung, Bau, Eigenschaften und Verwendung. RP03 enthält echte Elektronenpaar-/ladungserhaltende Protonenrelay-Mechanismen und Endkappen-Transfer. SN behandelt AgBr-Thiosulfat-Fixierung, nicht EDTA. TH vergleicht in beiden Fällen alle drei Routen. RPd72 trennt fünf Klassifikationskriterien bei Azo und zwei weiteren Klassen.
- Fünf aktuell fingerprintgebundene P-Profile: E0/G0,ai_candidate,needs_human_review,keine Run- oder Lernendenleistungsbehauptung. A/M enthalten begründete Autorenempfehlungen, bleiben im nativen Format sämtlich needs_developer_review. Keine erfundenen unabhängigen Stimmen.
- Vier tatsächlich angesehene vorhandene Nachbarbilder mit konkreten Fit-Grenzen und fünf freundliche fachlich konkrete Comic-PNG-Prompts. Keine Bildgenerierung, kein SVG und keine neue V-Zustimmung.

## Eng geprüft, Grenzen erhalten

Unveränderte Stock-Schemas/Modelle bestätigen die fünf prospektiven P-Fingerprints; normaleP-Auswahl bleibt HOLD: fünf fehlende autoritative Klassifikationen und zehn daraus folgende kindless-Fingerprint-Fallbackfehler. Diese15 tatsächlichen Fehler stehen vollständig im finalen Receipt; keine Authority oder Prüferänderung wurde zum Grünmachen erzeugt. A/M-Reportmodus meldet jeweils fünf ungeprüfte Entscheidungen, keine fehlenden oder veralteten Goalrecords. Ein initialer M-Kartenpfadfehler ist separat erhalten und durch einen expliziten leeren neuen Kartenstream korrigiert; das ist kein M-Grant.

Die sieben vorhandenen unregistrierten statischen Programm-Dokumente wurden auf dem aktuellen Basiskörper erneut begrenzt kompiliert: neueFehler0,entfernteBasistargets0,neueVoraussetzungenalterTargets0.307 vorbestehende Layer-A-Erwerbslücken-Vorkommen bleiben; keine neuen kamen hinzu. Vier optionale Quellbereiche bleiben bedingt (HB-SiliconeGK/LK,RP6.2LK-Additum,RP-PolyadditionsvertiefungGK/LK,SN11GK-Wahlbereich1). THLK verlangt den Drei-Routen-Vergleich verbindlich. Statische Programmauswahl ist Autorenkuratierung; tatsächliche menschliche Unterrichtsauswahl wird nicht behauptet und keine zusätzliche menschliche M7-Freigabe erfunden.

Es folgen zwei echte unabhängige fachliche Prüfungen. Nach tatsächlicher Bildauswahl sind nativeD-Kampagnen und betroffeneP-Bindungen normal vorzubereiten/zu prüfen. Die neueBild-QA muss die versiegelte Preflight-Vorlage mit yes/no-Feldtypen, Originalpixel-/Reviewer-/Datumsbindung, Canonical/Public/Approval-SHA und ganzem StockV--check vor einem zentralen Gesamtlauf erfüllen. Dieses Paket hat keine neuen Pixel, keine nativenD-Urteile und keinen zentralen412-Lauf.

Der aktuelle682-Material-HOLD, die vier BB/BE-M311-Erwerbs-HOLDs, QuellenM1/M6/CQR003/004 und Human-/Release-Grenzen bleiben erhalten. H wurde ausschließlich gelesen. Engine,Runtime,Registry,aktive Dateien,Gitrepository und geschützte Math/Phys/Bio-Untergrenzen wurden nicht verändert. Maßgeblich sind die exakte NEUTRAL-Auswahl, tatsächlichen Receipts und der finite Seal.
''')
# Check every own JSON/JSONL and exact selector binding; no broad project validation.
parsed=[]
for f in sorted(O.rglob('*')):
 assert not f.is_symlink(),f
 if not f.is_file():continue
 if f.suffix=='.json':read(f);parsed.append({'path':str(f.relative_to(O)),'kind':'json'})
 elif f.suffix=='.jsonl':
  lines=[t for t in f.read_text().splitlines()if t.strip()]
  for t in lines:json.loads(t)
  parsed.append({'path':str(f.relative_to(O)),'kind':'jsonl','rows':len(lines)})
def inspect_bindings(x):
 if isinstance(x,dict):
  if 'path'in x and 'sha256'in x:check(x)
  for v in x.values():inspect_bindings(v)
 elif isinstance(x,list):
  for v in x:inspect_bindings(v)
inspect_bindings(read(neutral))
spec=importlib.util.spec_from_file_location('bounded_stock_guard',R/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
errors=mod.curriculum_symlink_errors(str(R));assert not errors,errors
paths='\n'.join(str(f.relative_to(R))for f in O.rglob('*')if f.is_file())+'\n'
ignored=subprocess.run(['git','check-ignore','--no-index','--stdin'],cwd=R,input=paths,text=True,capture_output=True);assert ignored.returncode==1 and not ignored.stdout
write('checks/FINAL.finite-full-json-jsonl-parse-exact-selector-and-stock-symlink-guard.actual.json',{'schemaVersion':1,'checkedAt':now(),
 'allOwnJsonJsonlParsed':parsed,'exactNeutralInputOutputBindingsRechecked':True,'actualStockFunction':'scripts/validate_schemas.py::curriculum_symlink_errors',
 'actualGlobalCurriculumSymlinkErrors':errors,'ownRootSymlinks':0,'ownIgnoredPublicFiles':0,'globalBuildOrCentral412Run':False,'pass':True})
sealname='SEAL.finite-source6-five-whole-gate-author-current280-prospective412.actual.json'
files=[bind(f)for f in sorted(O.rglob('*'))if f.is_file()and f.name!=sealname]
sp=write(sealname,{'schemaVersion':1,'startedAt':read(O/'STARTED.actual.json')['startedAt'],'completedAt':now(),
 'kind':'Five complete whole-goal gate AUTHOR proposals, not independent acceptance or activation',
 'root':str(O.relative_to(R)),'fileCount':len(files),'totalBytes':sum(f['bytes']for f in files),'files':files,'neutralSelector':bind(neutral),
 'currentActualStrict':280,'currentOperativeAtomicCount':407,'prospectiveAtomicCount':412,'newMeasuredStrictGain':0,'fiveGoalTextsStable':True,
 'wholeCases':10,'bilingualRubricCriteria':40,'allP5E0G0Candidates':True,'allA5M5Unapproved':True,'newD_VRecords':0,
 'all280And262Preserved':True,'optionalSelectionsNotUnconditionallyGranted':True,'staticProgrammeDocumentsUnregistered':7,'preexistingLayerAAcquisitionGapOccurrences':307,
 'newIndependentScientificVotes':0,'actualStockGuardErrors':0,'hostWrites':False,'activeEngineRuntimeRegistryGitWrites':False,'humanOrReleaseClaim':False})
for f in read(sp)['files']:check(f)
for f in O.rglob('*'):
 if f.is_file()and f.suffix=='.json':read(f)
 elif f.is_file()and f.suffix=='.jsonl':
  for t in f.read_text().splitlines():
   if t.strip():json.loads(t)
print(json.dumps({'seal':bind(sp),'files':len(files),'bytes':sum(f['bytes']for f in files),'wholeGoals':5,'wholeDEENCases':10,'rubricCriteria':40,'newClosures':0,'actualGuardErrors':0,'hostReadOnly':True}))
