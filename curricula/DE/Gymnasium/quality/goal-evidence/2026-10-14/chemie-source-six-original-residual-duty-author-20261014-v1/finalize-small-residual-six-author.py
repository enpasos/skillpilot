# Apache-2.0 technical finalizer. Authored curriculum content is CC-BY-4.0.
# This script writes only its own inactive evidence root; H is read only.
import copy, datetime, hashlib, importlib.util, json, pathlib, subprocess, sys
sys.dont_write_bytecode = True
R = pathlib.Path('/home/enpasos/projects/skillpilot')
O = pathlib.Path(__file__).parent
B = O.parent/'chemie-current407-naturstoffe-seven-paired-resolution-existing274-integration-technical-20261014-v1'
S6 = O.parent/'chemie-source6-five-actual-current412-full-gate-author-20261014-v1'
F = O.parent/'chemie-six-additional-original-source-obligations-and-BB-BE-target-view-author-20261014-v1'
H = R/'tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host'
read = lambda p: json.loads(p.read_text())
now = lambda: datetime.datetime.now(datetime.timezone.utc).isoformat()
def bind(p):
    return {'path':str(p.relative_to(R)), 'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes':p.stat().st_size}
def write(n, d):
    p=O/n; p.parent.mkdir(parents=True,exist_ok=True)
    assert not p.exists(),p
    p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
    return p
def verify(b):
    p=R/b['path']; a=bind(p)
    assert a['sha256']==b['sha256'],(p,a['sha256'],b['sha256'])
    if 'bytes' in b: assert a['bytes']==b['bytes'],p
    return a
def verify_seal(p):
    s=read(p)
    for b in s['files']: verify(b)
    assert len(s['files'])==s['fileCount']
    return {'seal':bind(p),'allOriginalBoundFilesVerified':len(s['files'])}
def parse_all():
    results=[]
    for p in sorted(O.rglob('*')):
        if p.is_file() and p.suffix in ('.json','.jsonl'):
            if p.suffix=='.json': read(p); lines=1
            else:
                rows=[x for x in p.read_text().splitlines() if x.strip()]
                for x in rows: json.loads(x)
                lines=len(rows)
            results.append({'path':str(p.relative_to(R)),'parsedRecords':lines})
    return results

started=read(O/'STARTED.actual.json')['startedAt']
cc=read(O/'CAS.small-canonical-delta-and-later-Source6-union-preservation.author-only.json')
verify(cc['base']);verify(cc['after'])
base=read(R/cc['base']['path']); candidate=read(R/cc['after']['path'])
bi={g['id']:g for g in base['goals']}; ci={g['id']:g for g in candidate['goals']}
root='442c31c5-c561-5c7a-90bb-2335d779175c'
assert len(bi)==533 and len(ci)==536
assert all(g==ci[i] for i,g in bi.items() if i!=root)
assert all(g.get('requires',[])==ci[i].get('requires',[]) and g.get('resourceLinks',[])==ci[i].get('resourceLinks',[]) for i,g in bi.items())
before_root=copy.deepcopy(bi[root]);after_root=copy.deepcopy(ci[root])
assert set(before_root)==set(after_root)
assert {k:v for k,v in before_root.items() if k not in ('weight','contains')}=={k:v for k,v in after_root.items() if k not in ('weight','contains')}
assert after_root['contains'][:-1]==before_root['contains'] and after_root['weight']==before_root['weight']+2
atoms=read(O/'candidate/two-whole-unapproved-atoms-and-source-boundary-cluster.json')
c307=atoms['reusedExistingPendingWholeAtom']; intro=atoms['oneNewNarrowSN8WholeAtom']
assert c307==read(F/'SCIENTIFIC.six-full-source-duty-fit-and-one-real-missing-operator.author-proposal.json')['newGoal']
assert all(ci[x['id']]==x for x in (c307,intro,atoms['boundaryCluster']))
meas=read(B/'MEASURE.actual280-existing274-and-protected262-retained-N7-P6.actual.json')
assert len(meas['actualStrictGoalIds'])==280 and len(meas['protected262StrictIds'])==262
assert all(bi[i]==ci[i] for i in set(meas['actualStrictGoalIds'])|set(meas['protected262StrictIds']))

sc=read(O/'CAS.six-whole-source-cells-five-carriers-and-one-parent-literal-restoration.author-only.json')
oldrow_count=0; untouched_decisions=0; added_edges=0
assert len(sc['sourceCells'])==6 and len(sc['wholeMappingCarriers'])==5
for c in sc['wholeMappingCarriers']:
    verify(c['before']);verify(c['afterUnactivatedCandidate'])
    bm=read(R/c['before']['path']);am=read(R/c['afterUnactivatedCandidate']['path'])
    assert am['mappings'][:len(bm['mappings'])]==bm['mappings']
    owned=set(c['ownedSourceIds'])
    for d in bm['decisions']:
        ad=next(x for x in am['decisions'] if x['sourceGoalId']==d['sourceGoalId'])
        if d['sourceGoalId'] not in owned: assert ad==d;untouched_decisions+=1
    assert am['status']=='author_candidate_pending_independent_review'
    assert am['authorCandidateProvenance']['independentVotes']==0
    allowed={'mappings','decisions','sourceExtractionPath','status','authorCandidateProvenance'}
    assert {k:v for k,v in bm.items() if k not in allowed}=={k:v for k,v in am.items() if k not in allowed}
    oldrow_count+=len(bm['mappings']);added_edges+=len(am['mappings'])-len(bm['mappings'])
for c in sc['sourceCells']:
    assert all(x in c['wholeProposedPARTIALUnion'] for x in c['wholeOldMappings'])
    assert all(x['matchType']=='partial' for x in c['wholeProposedPARTIALUnion'])
    assert c['wholeProposedDecisionNotApproved']['matchType']=='partial' and not c['independentSourceApproval']
    assert [ci[g['id']] for g in c['wholeProposedPartnerGoals']]==c['wholeProposedPartnerGoals']
ec=sc['oneSourceExtractionCorrection'];verify(ec['before']);verify(ec['after'])
eb=read(R/ec['before']['path']);ea=read(R/ec['after']['path'])
assert set(eb)==set(ea)
assert {k:v for k,v in eb.items() if k!='sourceGoals'}=={k:v for k,v in ea.items() if k!='sourceGoals'}
assert len(eb['sourceGoals'])==len(ea['sourceGoals'])==177
sn8='sn-chem-seki-sn-ch-klassenstufe-8-lb5-035-01-d0f98a3c'
for bg,ag in zip(eb['sourceGoals'],ea['sourceGoals']):
    if bg['id']!=sn8: assert bg==ag
    else:
        bg=copy.deepcopy(bg);ag=copy.deepcopy(ag)
        del bg['sourceText'];del ag['sourceText']
        del ag['metadata']['residualDutyWholeOriginalParentAuthorCorrection']
        assert bg==ag

vc=read(O/'CAS.eight-existing-whole-view-successors-no-target-removals.author-only.json')
stock=read(O/'checks/STOCK.bounded-whole-canonical-eight-views-six-source-joins-and-course.actual.json')
assert len(vc['views'])==len(stock['views'])==8 and stock['newCanonicalErrors']==[]
for c in vc['views']: verify(c['before']);verify(c['afterUnactivatedCandidate']);assert not c['removedTargets']
for v in stock['views']:
    assert not v['lost'] and not v['newCompileErrors'] and not v['newDependenciesOfExistingTargets']
    if v['scope']['jurisdiction'] in ('DE-BB','DE-BE'):
        assert all(len(x['missingOrdinaryTargetPrerequisites'])==52 for x in v['addedGoalAcquisition'])
    else: assert all(not x['missingOrdinaryTargetPrerequisites'] for x in v['addedGoalAcquisition'])
hold=read(O/'HOLD.BB-BE-c307-exact52-current-ordinary-acquisition-goals.no-blanket-scope-grant.json')
assert len(set(hold['exactUniqueMissingOrdinaryIds']))==len(hold['wholeCurrentGoalBodies'])==52
assert all(ci[g['id']]==g for g in hold['wholeCurrentGoalBodies'])

cases_path=O/'cases/two-pending-whole-goals-four-complete-DEEN-cases.author.json'
cases=read(cases_path);n_cases=0;n_rubrics=0
for g in cases['goals']:
    assert ci[g['goalId']]==g['wholeGoal'] and len(g['cases'])==2
    for c in g['cases']:
        for k in ('materialDe','materialEn','taskDemandDe','taskDemandEn','modelAnswerDe','modelAnswerEn','transferDemandDe','transferDemandEn'):assert c[k].strip()
        assert c['evidenceLevel']=='E0' and c['maximumClaimScope']=='G0' and not c['executed'] and not c['learnerWorkPresent']
        assert len(c['rubric'])==4 and sum(x['maximumPoints'] for x in c['rubric'])==c['maximumPoints']==12
        assert c['fullCreditRequiresAllFourExpectations']
        for q in c['rubric']:
            for k in ('fullCreditDe','fullCreditEn','partialCreditDe','partialCreditEn'):assert q[k].strip()
        n_cases+=1;n_rubrics+=len(c['rubric'])
profiles=[json.loads(x) for x in (O/'P/two-whole-goal-author-E0-G0.profiles.jsonl').read_text().splitlines() if x.strip()]
assert len(profiles)==2 and all(x['evidenceLevel']=='E0' and x['maximumClaimScope']=='G0' and x['status']=='needs_human_review' and x['reviewAuthority']=='ai_candidate' and x['reviewRunIds']==[] for x in profiles)
for branch in ('A','M'):
    rows=[json.loads(x) for x in (O/branch/'two-native-pending-author-records.jsonl').read_text().splitlines() if x.strip()]
    assert len(rows)==2 and all(x['status']=='needs_developer_review' for x in rows)
    assert read(O/f'checks/STOCK.{branch}2.pending-author-native-report.actual.json')['exitCode']==0
pc=read(O/'checks/STOCK.P2-schema-current-prospective-FP-and-normal-six-expected-kind-HOLDs.actual.json')
assert pc['lowLevelCurrentSchemasAndProspectiveKindFingerprintsPass']==2 and pc['missingAuthoritativeKinds']==2 and pc['dependentKindlessFingerprintFailures']==4 and pc['newGateClosures']==0
assert read(O/'checks/FINAL.STOCK.explicit-unapproved-five-source-carriers-six-joins-course.actual.json')['course']['status']=='pass'

source6=verify_seal(S6/'SEAL.finite-source6-five-whole-gate-author-current280-prospective412.actual.json')
ni=[]
for b in read(B/'FINAL.native7-existing274-to-actual280-technical-integration.manifest.json')['allThreeNIReviewedPartialCarrierHashesRetained']:
    verify(b['candidate']);actual=bind(H/b['logicalHostPath']);assert actual['sha256']==b['candidate']['sha256']
    ni.append({'immutableReviewedCandidate':b['candidate'],'readOnlyCurrentHost':actual})
active=[]
for b in read(B/'checks/FINAL-CHECK.active-aliases-readonly-observed-bindings.json')['files']:
    verify(b);active.append(bind(R/b['path']))
floor=bind(R/'app/scripts/config/curriculum-maturity-floor-policy.json')
assert floor['sha256']=='sha256:2d45ea95d5e40751d57a3470b99ac2fbd6f24887b1ee3c8c7d53983d028783ea'
inputs=read(O/'INPUTS.whole-original-six-and-primary-course-contexts.actual.json')
for b in inputs['exactInputs']+inputs['fullPrimaryContextTextBindings']+[inputs['exactOldUncoveredTwelveSelection'],inputs['actualBroadArchivedCQRInventory']]:verify(b)

account=[]
for c in sc['sourceCells']:
    sid=c['sourceGoalId'];bb=sid.startswith(('bb-','be-'));sn8row=sid==sn8
    account.append({'sourceGoalId':sid,'wholeOriginalCell':c['wholeOriginalSourceCell'],
        'wholeOriginalCourseContext':c['wholeOriginalPrimaryDocuments'],
        'retainedOriginalPartners':c['wholeOldMappedPartnerGoals'],'wholeProposedPARTIALPartnerUnion':c['wholeProposedPartnerGoals'],
        'authorRecommendation':'Retain the entire original mandatory operator and teach it through this whole-goal union, pending two independent source/scope and new-goal gate reviews.',
        'courseBoundary':'Q1 LK only; no GK expansion, obligatory SN1/SN2 comparison, real preparation or complete polyester experiment is inferred.' if bb else 'The original lower-secondary obligation remains mandatory. GK/LK CrossStage views are compatibility acquisition routes, not a change of source stage.',
        'wholeDutyDistinction':'Explain an alcohol monomer mechanism using structural formulae and electron-pair arrows; old donor/acceptor and overall equation partners alone do not teach that operator.' if bb else ('Original mandatory meaning/use/handling parent plus actual pupil indicator investigation are retained. New narrow introductory goal and current d2 divide the whole obligation. Right-column remarks are retained and distinguished under the actual SN primary p4 rule.' if sn8row else 'Current whole d2 requires actual suitable school investigations with an indicator-specific colour scale and coarse pH classification. Material cases or historical positive votes do not prove a future learner performed that investigation.'),
        'unresolvedAcquisition':'52 exact ordinary prerequisite targets missing per BB/BE view; no automatic target widening or edge removal.' if bb else 'No missing ordinary prerequisite targets for the additions in the six MV/SN/TH views; official source authority for whole135 solution preparation remains separately unresolved.',
        'independentApproval':False,'wholeSingleCellTargetGrant':False})
account_path=write('AUTHOR.whole-six-original-operator-accounting-and-minimal-next-integration.json',{
    'schemaVersion':1,'completedAt':now(),'role':'Author successor, not an independent science vote',
    'priorRolesDisclosed':['Earlier residual-six source/target author inputs read and reused as author proposals; earlier Source-B work is prior knowledge, not a fresh independent vote.','Finished Source6 five-gate package author; its whole sealed package is unchanged.','Earlier current d2/2652 and native integration history is provenance only; no new learner performance or source acceptance is inferred.'],
    'provider':'OpenAI','agent':'Codex','modelVersion':'Not exposed in this execution context; no invented version or sampling controls.',
    'sixWholeOriginalOperators':account,'candidateAtomicCountArithmetic':{'baseCurrent407':407,'twoPendingAtoms':2,'ownProspective409':409,'combinedWithSeparateSource6Prospective412WouldBe414':414,'combinedRawNodeCountWouldBe542':542,'combinedCandidateMaterialized':False,'newStrictGainMeasured':0},
    'whyOneGenuinelyNewSN8IntroGoal':'Whole current0bf requires broader discussion across everyday life, technology and biology plus pH-change consequences; it is not a narrow whole-goal proxy for an introductory everyday meaning/use/handling operator. Current4b6d covers handling but not significance and use. Narrow new e5d6 teaches the uncovered mandatory parent without widening or silently changing d2 or those whole goals.',
    'prerequisiteTreatment':'Every old canonical requires and inherited relationship stays exact. d2 retains solution preparation135 and safety13d4/416. c307 keeps its original pending d492 requirement. No prerequisiteOnly stranding or 52-target blanket grant.',
    'minimalNextSequence':['Independent targeted source/scope review of all six whole cells, original primary columns/course rules and the full old-plus-proposed partner union.','Independent new-goal A/M/kind and whole-P reviews of c307 and e5d6; four complete bilingual E0/G0 cases are input proposals only.','Resolve the exact 52 BB/BE acquisition goals against real course/source scope or a separately justified bounded prerequisite correction; keep all current whole goals stable.','Resolve the three pre-existing solution-preparation source-authority tuples separately.','After actual reviews, append only accepted local deltas to the then-current reviewed views/canonical candidate; preserve every intervening reviewed change. New D/V and normal integration remain required.'],
    'unclosedHolds':['All six original source-duty closures pending independent review and normal integration.','BB/BE c307 acquisition: same52 missing ordinary IDs in each of two existing LK views,104 distinct view/ID tuples; three route-goal repetitions are not new unique gaps.','Three original MV/SN/TH whole135 source-authority questions remain; legitimate prerequisite acquisition is not an official whole-source grant.','Broader BB/BE course/target scope debt from earlier author drafts remains open.','Two author kind proposals have no authoritative ledger rows; normal P reports two missing-kind plus four dependent fingerprint errors.','A2/M2 are pending records; P2 is unexecuted E0/G0 ai_candidate/needs_human_review; D/V not reviewed.','AgentA owns the separate M311 BB/BE work; this package neither changes nor judges it.','Legacy SN source qualityReview still says176 while actual sourceGoals are177; that old count and acceptance metadata is retained exactly as history, not adopted as current approval. All177 actual cells are preserved.','Other mandatory primary neighbours and the remaining original source contexts are retained; no whole-page, whole-course, M6, M7, human or release clearance.'],
    'neighbourContext':bind(O/'inputs/whole-original-neighbour-duty-contexts-and-current-partner-bodies.not-cleared.json'),
    'source6Unchanged':source6,'hostReadOnly':True,'activeEngineRegistryRuntimeGitWrites':False,'newIndependentVotes':0})
preservation=write('checks/CHECK.finite-whole-source-goal-view-P-AM-preservation-and-readonly-guards.actual.json',{
    'schemaVersion':1,'checkedAt':now(),'stockChecksUnmodified':True,'base533ToOwn536':True,'allOther532WholeNodesExact':True,'allOldRequiresAndResourceLinksExact':True,
    'whole280HistoricalAndProtected262BodiesExact':True,'currentLiveStrictCountNotRerunOrClaimed':True,
    'sourceCells':6,'wholeMappingCarriers':5,'oldMappingRowsRetainedInExactOrder':oldrow_count,'unownedWholeDecisionsExact':untouched_decisions,'addedPARTIALEdges':added_edges,
    'sourceExtractionCells':177,'unchangedOther176Cells':True,'legacyQualityReviewCount176NotAdoptedAsCurrentApproval':True,'onlySN8SourceTextAndOneExplicitMetadataFieldChanged':True,'allOriginalRawFieldsExact':True,
    'existingWholeViews':8,'lostOldTargets':0,'newCanonicalOrViewCompileErrors':0,'BBBEUniqueMissingOrdinaryIds':52,'BBBEViewIdTuples':104,'sixMV_SN_THViewAdditionsAcquirable':True,
    'wholeCases':n_cases,'bilingualRubricCriteria':n_rubrics,'P2E0G0AiCandidateNeedsHumanReview':True,'A2M2Pending':True,'newAuthoritativeKinds':0,'newD_VRows':0,
    'unchangedSource6Packet':source6,'unchangedReadOnlyNI3':ni,'activeObservedBindingsUnchanged':active,'protectedMaturityFloorUnchanged':floor,
    'newStrictClosures':0,'newIndependentScientificVotes':0,'hostWrites':False,'activeEngineRegistryRuntimeGitWrites':False})
write('checks/PRESERVED.preparation-attempt-and-final-eight-existing-view-boundary.actual.json',{
    'schemaVersion':1,'kind':'Preserved factual preparation history, not a scientific receipt',
    'initialAttempt':{'toolChunkId':'4d2a3d','exitCode':1,'reason':'The earlier R1 ten-view author draft included two nonexisting stage-specific BB/BE files. Attempt stopped when reading de-bb-gym-sekii-chemistry-lk.view.json.','noActiveOrHostWrites':True},
    'correction':{'successfulResumeToolChunkId':'8f7895','existingWholeViewsUsed':8,'unregisteredEarlierTwoStageViewsNotRepresentedAsCurrent':True,'allEightBeforeFilesActuallyMatched':True},
    'fiveSourceCarriersFinalStatus':'author_candidate_pending_independent_review; original complete status remains in exact before carriers; no automatic approval created.',
    'initialFinalizerCountAssertion':{'toolChunkId':'98e8b1','exitCode':1,'beforeAnyFinalizerOutputWrite':True,'reason':'Legacy qualityReview said176; actual sourceGoals length177. Final check now counts177 and retains the old count metadata as explicitly non-authoritative history.'}})
selector=write('NEUTRAL.exact-six-original-duty-source-goal-view-author-inputs.json',{
    'schemaVersion':1,'createdAt':now(),'kind':'Exact neutral whole-input selection for independent reviews of unactivated AUTHOR proposals',
    'root':str(O.relative_to(R)),'independentScientificVotesInThisPacket':0,
    'wholeCanonical':bind(R/cc['after']['path']),'wholeBaseline':cc['base'],'wholeProposedGoalsAndBoundary':bind(O/'candidate/two-whole-unapproved-atoms-and-source-boundary-cluster.json'),
    'wholeOriginalSixAndPrimaryContexts':bind(O/'INPUTS.whole-original-six-and-primary-course-contexts.actual.json'),
    'wholeOriginalSixBaseline':bind(O/'inputs/whole-six-original-source-baseline.exact.json'),
    'wholeNeighbourCellsAndCurrentPartners':bind(O/'inputs/whole-original-neighbour-duty-contexts-and-current-partner-bodies.not-cleared.json'),
    'sourceCAS':bind(O/'CAS.six-whole-source-cells-five-carriers-and-one-parent-literal-restoration.author-only.json'),
    'fiveWholeUnactivatedMappingCarriers':[c['afterUnactivatedCandidate']for c in sc['wholeMappingCarriers']],
    'wholeSN8SourceExtraction':ec['after'],'viewCAS':bind(O/'CAS.eight-existing-whole-view-successors-no-target-removals.author-only.json'),
    'eightWholeUnactivatedViews':[c['afterUnactivatedCandidate']for c in vc['views']],
    'wholeBilingualCasesAndRubrics':bind(cases_path),'P2':bind(O/'P/two-whole-goal-author-E0-G0.profiles.jsonl'),
    'P2Criteria':bind(O/'P/criteria.complete-residual-two-E0-G0.md'),
    'A2':bind(O/'A/two-native-pending-author-records.jsonl'),'M2':bind(O/'M/two-native-pending-author-records.jsonl'),
    'proposedAtomicityMemoryAndKinds':bind(O/'AUTHOR.two-whole-goal-atomicity-memory-and-kind-pending-proposals.json'),
    'existingD2HistoryNotNewApproval':bind(O/'inputs/current-d2-existing-whole-P-A-history.not-new-grants.json'),
    'exact52AcquisitionHOLD':bind(O/'HOLD.BB-BE-c307-exact52-current-ordinary-acquisition-goals.no-blanket-scope-grant.json'),
    'authorWholeOperatorAccounting':bind(account_path),'preservationCheck':bind(preservation),
    'unchangedSeparateSource6Seal':source6['seal'],
    'conditions':'Do not treat technical schema/course checks, old votes or whole partner union proposals as new source/kind/P/A/M/D/V approval. New P is E0/G0 only; source and course holds remain.'})
def check_bindings(x):
    if isinstance(x,dict):
        if isinstance(x.get('path'),str) and isinstance(x.get('sha256'),str): verify(x)
        for v in x.values(): check_bindings(v)
    elif isinstance(x,list):
        for v in x:check_bindings(v)
check_bindings(read(selector))

readme='''# Sechs ursprüngliche Restpflichten: inaktiver Autorenkandidat

Dies ist ein Autorenpaket mit **null neuen unabhängigen Freigaben**. Die sechs ursprünglichen Pflichten bleiben vollständig erhalten: vier Sek-I-Zellen sowie dieselbe LK-Mechanismuspflicht für Berlin und Brandenburg. Primärkontexte, ganze Originalzellen, alle alten Partner und 75 Nachbarzellen mit 42 unterschiedlichen ganzen Partnerzielen sind gebunden.

## Kleiner konkreter Nachfolger

- Vier Indikatorpflichten verwenden das ganze vorhandene Ziel d2ccd1d5. Seine Labor- und Vorbereitungsvoraussetzungen bleiben exakt.
- c3077d95 wird mit unveränderter stabiler ID und ganzem früherem Autorenwortlaut übernommen. Neu sind zwei ganze bilinguale Mechanismusfälle samt Material, Modellantworten und Rubriken.
- Eine echte zusätzliche SN8-Lücke wird durch e5d6de7e geschlossen vorgeschlagen: Bedeutung, Verwendung und Umgang mit sauren Alltagslösungen auf Einblicksniveau. Der originale verpflichtende linke Elternoperator wird im konsumierten Quelltext wiederhergestellt; empfohlene rechte Hinweise bleiben vollständig erhalten. Zwei ganze bilinguale Materialfälle sind beigefügt.
- Insgesamt: zwei unregistrierte Zielkandidaten, vier DE/EN-Fälle, 16 bilinguale Rubrikkriterien, P2 E0/G0 ai_candidate/needs_human_review, A2/M2 needs_developer_review und zwei ausstehende Kindentscheidungen. Keine Lernendenleistung, kein neues D/V und keine Bildgenerierung.
- Fünf ganze Quellenpartnerträger, eine vollständige SN-Extraktion und acht vorhandene ganze Ansichten sind ausschließlich inaktiv vorgeschlagen. Jeder alte Targeteintrag bleibt erhalten. Alle Träger sind ausdrücklich author_candidate_pending_independent_review.

## Tatsächliche enge Prüfungen und Grenzen

Unveränderte Stockfunktionen melden keine neuen kanonischen oder Ansichtsfehler, keinen Verlust alter Targets und gültige Quellenjoins; die begrenzte Kursprüfung besteht. Die normalen A/M-Berichte erkennen je zwei ausstehende Entscheidungen. P-Schema und prospektive Fingerprints sind gültig; die normale P-Konfiguration bleibt mit zwei fehlenden autoritativen Kindentscheidungen und vier daraus folgenden Fingerprintfehlern gesperrt.

Die BB/BE-Mechanismusroute hat in jeder der beiden LK-Ansichten dieselben **52 fehlenden gewöhnlichen Erwerbsziele** (104 Sicht/ID-Tupel). Sie werden weder blind ergänzt noch durch Entfernen globaler Voraussetzungen übersprungen. Die sechs MV/SN/TH-Ansichten haben für ihre Ergänzungen keine fehlenden gewöhnlichen Voraussetzungen. Drei frühere Quellenautoritätsfragen zur ganzen Lösungsvorbereitung135 bleiben trotzdem offen. Quellenbeleg und Erwerbsziel sind unterschiedliche Aussagen. Das breitere BB/BE-Kursscope-Draft erhält keine Freigabe. AgentA bearbeitet M311 separat; dieses Paket entscheidet darüber nicht.

Die 532 alten Nichtwurzelziele, alle ursprünglichen requires und Ressourcen sowie die ganzen 280 historischen und 262 geschützten Ziele bleiben identisch. Die drei NI-Quellenträger und das gesamte fertige Source6-Fünferpaket sind unverändert nachgeprüft. Der eigene Kandidat hat rechnerisch 536 Knoten / prospektiv409 Atome. Ein späterer rein additiver Zusammenschluss mit dem getrennten Source6-Kandidaten wäre 542/414, ist hier nicht materialisiert oder operativ gemessen. Kein neuer Strict-Abschluss wird behauptet; der Hauptprozess darf aktuelle P-Metadaten unabhängig fortschreiben.

Die nächste fachliche Handlung ist die unabhängige Prüfung der ganzen sechs Operator-/Partnerunionen und der beiden neuen Zielentwürfe. Danach bleiben begrenzte Erwerbs-/Quellfragen, neue D/V-Nachweise und normale Integration. Kein M6/M7-, Human-, Veröffentlichungs- oder Aktivierungsabschluss. H wurde nur gelesen; aktive Dateien, Git, Engine, Registry und die drei geschützten Fächer wurden nicht verändert.

Einstieg: `NEUTRAL.exact-six-original-duty-source-goal-view-author-inputs.json`. Die genaue Folge und alle offenen Grenzen stehen in `AUTHOR.whole-six-original-operator-accounting-and-minimal-next-integration.json`.

Eigene Inhalte: CC-BY-4.0; technische Skripte: Apache-2.0. Amtliche Primärquellen und ihre Rechte bleiben getrennt.
'''
(O/'README.md').write_text(readme)
assert not any(p.is_symlink() for p in O.rglob('*'))
spec=importlib.util.spec_from_file_location('residual6_stock_schema_guard',R/'scripts/validate_schemas.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
guard_errors=module.curriculum_symlink_errors(str(R));assert not guard_errors,guard_errors
names='\n'.join(str(p.relative_to(R)) for p in sorted(O.rglob('*')) if p.is_file())+'\n'
ignored=subprocess.run(['git','check-ignore','--no-index','--stdin'],input=names,text=True,cwd=R,capture_output=True)
assert ignored.returncode==1 and not ignored.stdout
parsed=parse_all()
write('checks/CHECK.finite-JSON-JSONL-parse-selector-bindings-and-stock-symlink-guard.actual.json',{
    'schemaVersion':1,'checkedAt':now(),'parsedBeforeThisReceipt':parsed,'parsedFileCountBeforeThisReceipt':len(parsed),
    'exactNeutralBindingsPass':True,'stockGuard':'scripts/validate_schemas.py::curriculum_symlink_errors',
    'stockCurriculumSymlinkErrors':guard_errors,'ownSymlinks':0,'ignoredOwnFiles':[],
    'stockGuardCode':bind(R/'scripts/validate_schemas.py'),'noIgnoredTmpCurriculumLinksIntroduced':True,
    'noFullGlobalQAOrHostCopy':True})
parse_all()
files=[bind(p) for p in sorted(O.rglob('*')) if p.is_file()]
seal=write('SEAL.finite-six-original-residual-duty-author.actual.json',{
    'schemaVersion':1,'startedAt':started,'completedAt':now(),'root':str(O.relative_to(R)),
    'kind':'Finite whole-six-original-duty AUTHOR successor; no independent vote or gate closure',
    'fileCount':len(files),'totalBytes':sum(x['bytes'] for x in files),'files':files,'neutralSelector':bind(selector),
    'wholeOriginalCells':6,'wholeMappingCarriers':5,'wholeExistingViews':8,'pendingWholeAtoms':2,'genuinelyNewSN8Atom':1,
    'wholeDEENCases':4,'bilingualRubricCriteria':16,'P2E0G0':True,'A2M2Pending':True,'authoritativeNewKindRows':0,
    'historical280AndProtected262WholeBodiesExact':True,'unchangedSource6PacketFiles':source6['allOriginalBoundFilesVerified'],
    'unchangedNI3':True,'stockGuardErrors':0,'allJSON_JSONLParsed':True,'newScientificVotes':0,'newMeasuredStrictGain':0,
    'HReadOnly':True,'activeEngineRuntimeRegistryGitWrites':False,'humanOrReleaseApproval':False})
verified=verify_seal(seal); parsed_final=parse_all()
print(json.dumps({'root':str(O.relative_to(R)),'neutral':bind(selector),'seal':bind(seal),
    'fileCount':len(files),'bytes':sum(x['bytes'] for x in files),'allJSONJSONLIncludingSeal':len(parsed_final),
    'guardErrors':0,'oldMappingRowsPreserved':oldrow_count,'unchangedDecisions':untouched_decisions,
    'addedPARTIALEdges':added_edges,'newClosures':0},ensure_ascii=False))
