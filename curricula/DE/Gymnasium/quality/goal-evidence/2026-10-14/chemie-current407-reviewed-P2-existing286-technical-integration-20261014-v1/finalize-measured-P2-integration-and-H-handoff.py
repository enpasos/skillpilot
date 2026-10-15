# Apache-2.0. Finite technical measurement and H handoff, no new science.
import datetime,hashlib,importlib.util,json,pathlib,subprocess,sys
sys.dont_write_bytecode=True
R=pathlib.Path('/home/enpasos/projects/skillpilot');E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14';O=pathlib.Path(__file__).parent
I=E/'chemie-current407-joint-P5-native-D6-existing281-integration-technical-20261014-v1';H=R/'tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host'
G='058dca74-1b57-5eb3-9c94-1c7b6cc795ad';D='d1244f5d-9a12-5b74-97fe-ae974f40af26';rd=lambda p:json.loads(p.read_text());now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}
def wr(n,x):
 p=O/n;assert not p.exists(),p;p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return p
def verify(b):
 p=R/b['path'];assert sha(p)==b['sha256'],p
 if 'bytes'in b:assert p.stat().st_size==b['bytes'],p
def parse_all():
 rows=[]
 for p in sorted(O.rglob('*')):
  if p.is_file()and p.suffix in('.json','.jsonl'):
   if p.suffix=='.json':rd(p);count=1
   else:
    lines=[x for x in p.read_text().splitlines()if x.strip()]
    for x in lines:json.loads(x)
    count=len(lines)
   rows.append({'path':str(p.relative_to(R)),'parsedRecords':count})
 return rows
started=rd(O/'STARTED.actual.json')['startedAt']
before=rd(O/'inputs/BEFORE.exact-I286-current-alias-QA419-root539-assets-NI3-and-D-protection.json')
for b in before['protectedBindings']:verify(b)
cas=rd(O/'CAS.only-new-existing-A058-selection-plus-actual-P2-B-config-on-I286.actual.json')
for b in cas['installedNewImmutableFiles']:verify(b['source']);verify(b['host'])
receipt=O/'receipts/ACTUAL.current407-reviewed-P2-existing286.central.completed-run.json';run=rd(receipt)
assert run['onlyWholeCentralAttempt']and run['exitCode']==0
report_path=O/'receipts/ACTUAL.current407-reviewed-P2-existing286.central.stock-report.json';report=rd(report_path)
assert len(report['subjects'])==1 and report['subjects'][0]['subject']=='chemie'
subject=report['subjects'][0];assert subject['denominator']==407
prior=rd(I/'MEASURE.actual286-five-new-whole-scientific-closures-preserved281-280-262.actual.json')
ids=set(subject['strictCompleteGoalIds']);old=set(prior['strictCompleteGoalIds']);assert len(old)==286
lost=sorted(old-ids);added=sorted(ids-old);assert not lost
assert D not in ids and set(added)<={G}
assert report['blockingIssueCount']==0 and len(subject['requiredChecks'])==6 and all(x['status']=='pass'for x in subject['requiredChecks'])
assert subject['gates']['currentDescriptionResolutions']==prior['gates']['currentDescriptionResolutions']
assert subject['gates']['currentMemoryReviewDecisions']==407
assert subject['gates']['currentVisualizationQaRecords']==prior['gates']['currentVisualizationQaRecords']
measurement=wr('MEASURE.actual-current407-reviewed-P2-on-existing286.actual.json',{
 'schemaVersion':1,'measuredAt':now(),'fullStockReport':bind(report_path),'completedSingleCentralAttempt':bind(receipt),
 'baselineActual286':bind(I/'MEASURE.actual286-five-new-whole-scientific-closures-preserved281-280-262.actual.json'),
 'denominator':subject['denominator'],'strictComplete':subject['strictComplete'],'remaining':subject['remaining'],'percentage':subject['percentage'],
 'strictCompleteGoalIds':subject['strictCompleteGoalIds'],'allPrior286ClosedIdsPreserved':True,'allPrior281_280_262PreservedThroughExact286SetAndOriginalProof':True,
 'addedActualStrictGoalIds':added,'addedActualStrictCount':len(added),'lostPriorGoalIds':lost,'058dActualStockStrict':G in ids,'d124ActualStockStrict':False,
 'restoredExistingA058Selection':True,'newA058ScientificVote':False,'newP2ABScienceActuallyBound':True,
 'newNativeDScienceVotes':0,'priorD058KEEPKEEPResolutionUnchanged':True,'priorDPageWasNotReviewOfCorrectedP2':True,
 'P2VsPriorNativeInputBoundaryStillOpen':bind(O/'BOUNDARY.actual-P2-profile-change-versus-unchanged-prior-native-D-inputs.json'),
 'requiredChecks':subject['requiredChecks'],'gates':subject['gates'],'blockingIssueCount':report['blockingIssueCount'],
 'sourceCourseWholeUnionAndActualPracticalHoldsUnchanged':True,'d124D_SOURCE_GA_SHHoldsNotResolved':True,
 'wholeM7Reached':False,'humanOrReleaseApproval':False,'activeGitEngineRuntimeRegistryWrites':False})
baseline=rd(I/'HANDOFF.exact-reusable-current286-config-and-private-H-state.actual.json')
cfg=O/'config/chemie-current407-reviewed-P2-existing286.inactive.config.json';c=rd(cfg);s=c['subjects'][0]
assert sha(H/cfg.relative_to(R))==sha(cfg)
aliases={k:bind(H/s[p])for k,p in [('canonical','landscapePath'),('semantic','semanticKindLedgerPath'),('QA','visualizationQaPath')]}
for k,key in [('canonical','actualCurrentCanonical'),('semantic','actualWholeCurrentSEM'),('QA','actualWholeCurrentQA')]:assert aliases[k]['sha256']==baseline[key]['sha256']
floor=bind(R/'app/scripts/config/curriculum-maturity-floor-policy.json');assert floor['sha256']=='sha256:2d45ea95d5e40751d57a3470b99ac2fbd6f24887b1ee3c8c7d53983d028783ea'
activeroot=E/'chemie-current407-naturstoffe-seven-paired-resolution-existing274-integration-technical-20261014-v1';active=[]
for b in rd(activeroot/'checks/FINAL-CHECK.active-aliases-readonly-observed-bindings.json')['files']:verify(b);active.append(b)
handoff=wr('HANDOFF.exact-measured-P2-on286-config-and-unchanged-H-state.actual.json',{
 'schemaVersion':1,'handedBackAt':now(),'H':str(H),'ownership':'Exclusive H task finished. Root may resume mutations after receiving this handoff.',
 'actualMeasuredCentralConfig':bind(cfg),'actualSingleCentralReport':bind(report_path),'actualMeasurement':bind(measurement),
 'actualCanonical533Current407CandidateUnchanged':baseline['actualCurrentCanonical'],'actualWholeQA419CandidateUnchanged':baseline['actualWholeCurrentQA'],
 'actualSEM533Current407CandidateUnchanged':baseline['actualWholeCurrentSEM'],'currentPrivateNormalAliases':aliases,
 'operativeP2BConfig':bind(O/'config/P2.b.actual-independent-whole-profile.normal-alias.config.json'),
 'independentP2AConfigCheckedAndBound':bind(O/'config/P2.a.actual-independent-whole-profile.normal-alias.config.json'),
 'restoredExistingA058Config':bind(O/'config/A1.058d.exact-existing-science.normal-alias.config.json'),
 'exactWholeCentralM407ConfigUnchanged':{'path':s['memoryReviewConfigPath'],'hostSHA256':sha(H/s['memoryReviewConfigPath'])},
 'scopedM2WasValidationOnly':True,'allOtherP_AConfigsUnchanged':True,'allOld286ClosedIdsRetained':True,
 'newActualStrictCount':subject['strictComplete'],'addedActualStrictGoalIds':added,'newStrictDenominator':407,
 'sameDIndexSupersessionWithdrawalChains':True,'noNewNativeDescriptionReview':'Prior058KEEP/KEEP andd124BLOCK retained verbatim. Changed P2 material was not inspected by those old D reviewers; this is an explicit open cross-input boundary.',
 'd124SourceDAndCourseHoldsRemain':True,'sourceExecutionAndWholeUnionHoldsRemain':True,'M311BBBESeparateHoldsNotRejudged':True,
 'rootSeparate539CandidateAndSEMAllFiveFilesUnchanged':True,'NI3AndPriorPNGsUnchanged':True,
 'mutatedExistingHostAliasesAssetsOrSources':[],'newHostEntries':'Only exact immutable original P2 evidence and new inactive local selection configs/A058/M2 extracts; detailed CAS lists45 new links.',
 'protectedMaturityFloor':floor,'activeAliasesUnchanged':active,'activeGitEngineRuntimeRegistryWrites':False,'humanOrReleaseApproval':False})
neutral=wr('NEUTRAL.exact-measured-P2-pair-existing286-technical-selection.json',{
 'schemaVersion':1,'createdAt':now(),'kind':'Finite technical selection with measured stock intersection; no new scientific verdict',
 'operativeCentralConfig':bind(cfg),'handoff':bind(handoff),'actualMeasurement':bind(measurement),
 'CAS':bind(O/'CAS.only-new-existing-A058-selection-plus-actual-P2-B-config-on-I286.actual.json'),
 'actualABAndPvsNativeBoundary':bind(O/'BOUNDARY.actual-P2-profile-change-versus-unchanged-prior-native-D-inputs.json'),
 'preCentralRawTypesAndAllStockPreflights':bind(O/'checks/CHECK.finite-pre-central-raw-types-stock-V-and-terminal-D-chain.actual.json'),
 'allPrior286AndProtected262Preserved':True,'noSourceCoursePracticalHumanGrant':True,'newNativeVotes':0})
(O/'README.md').write_text(f'''# Tatsächliche P2-Integration auf I286

Die eine unveränderte zentrale Chemie-Prüfung misst **{subject['strictComplete']}/407 ({subject['percentage']}), {subject['remaining']} offen**. Alle sechs Checks bestehen, null Blocker, alle bisherigen286ClosedIDs und damit281/280/262 erhalten. Tatsächlicher Zuwachs: {len(added)}; 058d im Stock-Strict-Satz: {G in ids}. d124 bleibt ausdrücklich außerhalb.

Neu ausgewählt sind die echten unabhängigen korrigierten P2-B-Records mit vollständigem Originalrun sowie die unveränderte vorhandene A058-Originalzeile. Die ganze frühere und aktuelle058-Kompetenz ist identisch, ihr alter Fingerprint besteht normal ohne Umschreiben. Die unabhängigen aktuellen P2-A-Records sind ebenfalls normal geprüft und exakt gebunden. M407 und alle75Karten/Sichten bleiben operativ unverändert; der enge M2-Check verwendet ausschließlich zwei Originalrecords.

Vor dem Zentralversuch bestanden A058, M2, P2-A/B, ganze QA419, ursprünglicher Native-D7-Batch und Kanonik533. Alle419 Roh-QA-Zeilen bleiben exakt: gültige Zeichenkettenwerte,408 aiApproved=yes und11 alte Nullwerte ohne neue Freigabe. Drei PNGs und die zwei ausgewählten JPGs sind gegen kanonische/public/Approval-SHAs geprüft.113 geschützte Bindungen, der separate539/412-Kandidat, NI3, D-Indizes/Supersessionketten und alle bestehenden Aliasse bleiben identisch. Keine neue große Hostkopie.

**Die neue P2-Science ist keine neue D-Science.** Vorhandene058KEEP/KEEP und d124BLOCK werden nicht verändert. Diese alten D-Reviewer sahen das frühere P-Material; der genaue Unterschied zu den neuen P2-Aufgaben/Profilen ist als offene Eingangsgrenze vollständig dokumentiert. Eine Stock-Schnittmengenmessung ersetzt keine neue Native-P-Kontextprüfung, keine ganze Quellenunion und keine Kursautorität. BW/TH/SN-Durchführungspflichten sowie d124/BY-GA/SH- und weitere Quellen-/Scope-Holds bleiben bestehen. Kein Human-, M6/M7- oder Veröffentlichungsabschluss.

Der Host ist mit dem genauen HANDOFF zurückgegeben. Seine normale Kanonik bleibt533/407, QA419 und SEM bleiben exakt I286. Der separate539-Kandidatenpfad wurde nicht überschrieben. Aktive Dateien, Engine, Registry, Git und geschützte Fachuntergrenzen unverändert.

Einstieg: `NEUTRAL.exact-measured-P2-pair-existing286-technical-selection.json`.
''')
assert not any(p.is_symlink()for p in O.rglob('*'))
spec=importlib.util.spec_from_file_location('p2_integration_finite_stock_guard',R/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
errors=mod.curriculum_symlink_errors(str(R));assert not errors,errors
names='\n'.join(str(p.relative_to(R))for p in sorted(O.rglob('*'))if p.is_file())+'\n';ignored=subprocess.run(['git','check-ignore','--no-index','--stdin'],cwd=R,input=names,text=True,capture_output=True);assert ignored.returncode==1 and not ignored.stdout
parsed=parse_all()
wr('checks/FINAL.full-JSON-JSONL-parse-stock-symlink-guard-and-unchanged-host-bindings.actual.json',{
 'schemaVersion':1,'checkedAt':now(),'parsedBeforeThisReceipt':parsed,'parseErrors':0,'stockCurriculumSymlinkErrors':errors,'ownSymlinks':0,'ignoredOwnFiles':[],
 'protectedBindingsVerifiedAfterSingleCentralRun':len(before['protectedBindings']),'allNewHostHardlinkBytesExact':True,'Handoff':bind(handoff),'activeAndProtectedFloorUnchanged':True})
parse_all();files=[bind(p)for p in sorted(O.rglob('*'))if p.is_file()]
seal=wr('SEAL.finite-reviewed-P2-existing286-technical-integration.actual.json',{
 'schemaVersion':1,'startedAt':started,'completedAt':now(),'root':str(O.relative_to(R)),
 'kind':'Finite actual paired-P2 technical selection and one stock central measurement on I286; not new science',
 'fileCount':len(files),'totalBytes':sum(x['bytes']for x in files),'files':files,'neutralSelector':bind(neutral),'handoff':bind(handoff),
 'actualStrictComplete':subject['strictComplete'],'denominator':407,'addedActualStrictCount':len(added),'allPrevious286Retained':True,
 'requiredChecksPassed':6,'centralAttempts':1,'stockGuardErrors':0,'newScienceVotes':0,'newNativeVotes':0,'d124StrictGrant':False,
 'sourceCoursePracticalHumanAndNativePDeltaHoldsRetained':True,'normal533AliasAndRoot539Preserved':True,'activeGitEngineRegistryRuntimeWrites':False})
for b in rd(seal)['files']:verify(b)
parse_all()
print(json.dumps({'root':str(O.relative_to(R)),'seal':bind(seal),'neutral':bind(neutral),'handoff':bind(handoff),'actualStrictComplete':subject['strictComplete'],'denominator':407,'added':added,'files':len(files),'totalBytes':sum(x['bytes']for x in files),'parsedJSONJSONLIncludingSeal':len(parse_all()),'guardErrors':0},ensure_ascii=False))
