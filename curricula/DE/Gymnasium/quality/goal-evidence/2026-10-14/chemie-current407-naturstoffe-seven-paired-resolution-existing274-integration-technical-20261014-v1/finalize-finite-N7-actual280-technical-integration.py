# Apache-2.0. Finite inactive technical closure; no new scientific decision.
import datetime, hashlib, importlib.util, json, pathlib, subprocess, sys
sys.dont_write_bytecode=True
R=pathlib.Path('/home/enpasos/projects/skillpilot');O=pathlib.Path(__file__).parent
H=R/'tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host'
read=lambda p:json.loads(p.read_text())
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':str(p.relative_to(R)),'bytes':p.stat().st_size,'sha256':sha(p)}
def checked(b):
 p=R/b['path'];assert p.is_file() and sha(p)==b['sha256'],p
 if 'bytes' in b:assert p.stat().st_size==b['bytes'],p
 return p
def write(n,x):
 p=O/n;p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists(),p
 p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return p
now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
p=read(O/'PREFLIGHT.exact-N7-I274-canonical-QA-P-A-M-and-NI3-preservation.actual.json')
inp=read(O/'INPUTS.exact-D7-independent-seals-and-original-campaign-transport.actual.json')
hold=read(O/'HOLD.exact682-missing-supplied-Maltose-Saccharose-formula-material-and-P6-selection.actual.json')
imported=read(O/'CHECK.private-host-detached-aliases-seven-actual-assets-and-NI3-preserved.actual.json')
base=read(O/'inputs/whole533-I274-canonical.before.byte-exact.json');current=read(O/'candidate/canonical533.current407.N7.inactive.json')
bi={g['id']:g for g in base['goals']};ci={g['id']:g for g in current['goals']}
assert len(bi)==len(ci)==533 and bi.keys()==ci.keys()
assert {k:v for k,v in base.items() if k!='goals'}=={k:v for k,v in current.items() if k!='goals'}
changed=[g for g in bi if bi[g]!=ci[g]];assert set(changed)==set(p['canonicalChangedGoalIds']) and len(changed)==4
for g in bi:assert {k:v for k,v in bi[g].items() if k!='resourceLinks'}=={k:v for k,v in ci[g].items() if k!='resourceLinks'}
canon='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
sem='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
qa='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
qc=O/'candidate/QA.current407.N7.I274-other412-exact-and-seven-stock-YesNo-bindings.inactive.json'
sc=O/'candidate/semantic533.current407.N7.normal-alias.inactive.json'
for logical,actual in [(canon,O/'candidate/canonical533.current407.N7.inactive.json'),(sem,sc),(qa,qc)]:assert (H/logical).read_bytes()==actual.read_bytes()
assert (O/'inputs/whole533-I274-semantic.before.byte-exact.json').read_bytes()==sc.read_bytes()
beforeqa=read(O/'inputs/whole419-I274-QA.before.byte-exact.json');afterqa=read(qc);raw=read(O/'inputs/N7.first-attempt-QA.boolean-approval-serialization.byte-exact.json')
ids=set(p['scopeGoalIds']);qb={x['goalId']:x for x in beforeqa['records']};qn={x['goalId']:x for x in afterqa['records']}
assert len(qb)==len(qn)==419 and qb.keys()==qn.keys()
assert {k:v for k,v in beforeqa.items() if k!='records'}=={k:v for k,v in afterqa.items() if k!='records'}
for g in qb:
 if g not in ids:assert qb[g]==qn[g]
for a,b in zip(raw['records'],afterqa['records']):
 if a['goalId'] in ids:assert a['aiApproved'] is True and b['aiApproved']=='yes' and {k:v for k,v in a.items() if k!='aiApproved'}=={k:v for k,v in b.items() if k!='aiApproved'}
 else:assert a==b
preflight=read(O/'CHECK.finite-pre-central-raw-types-stock-V-and-terminal-D-chain.actual.json')
assert preflight['all419RawLedgerFieldTypesAssertedNow'] and len(preflight['allSevenOriginalPixelReviewerDateVerbatimAndThreeWayBindings'])==7
for a in preflight['allSevenOriginalPixelReviewerDateVerbatimAndThreeWayBindings']:
 checked(a['actualCanonical']);checked(a['actualPublic'])
for x in p['sourceNI3MustRemainExact']:
 checked(x['candidate']);assert sha(H/x['logicalHostPath'])==x['candidate']['sha256']
for x in imported['protectedOtherCanonicalAndOverviewWholeFileBindings']:checked(x)
active=read(O/'checks/FINAL-CHECK.active-aliases-readonly-observed-bindings.json')
for x in active['files']:checked(x)
for x in inp['actualFinalPeerSeals']:checked(x)
for x in inp['actualOriginalRecordsAndRuns']:
 assert checked(x['source']).read_bytes()==checked(x['target']).read_bytes()
for x in p['exactScopedRecordConfigTransports']:
 assert checked(x['originalRecord']).read_bytes()==checked(x['exactCopiedRecord']).read_bytes()
for x in hold['actualScopedP6Selections']:
 lines=checked(x['wholeOriginalP7']).read_text().splitlines(keepends=True)
 assert ''.join(t for t in lines if json.loads(t)['goalId']!=hold['goalId'])==checked(x['selectedExactP6']).read_text()
 assert ''.join(t for t in lines if json.loads(t)['goalId']==hold['goalId'])==checked(x['heldWholeOriginal682']).read_text()
 mc=read(checked(x['scopedP6Config']));assert len(mc['scope']['goalIds'])==6 and hold['goalId'] not in mc['scope']['goalIds']
oldm=(O/'inputs/M407.previous-whole-original-science.byte-exact.jsonl').read_text().splitlines(keepends=True)
newm=(O/'M/M407.actual-original-science-plus-exact-N7-seven.jsonl').read_text().splitlines(keepends=True)
origm={json.loads(t)['goalId']:t for t in (O/'M/originals/M7.a.exact-original-lines.jsonl').read_text().splitlines(keepends=True)}
assert len(oldm)==len(newm)==407 and len(origm)==7
for a,b in zip(oldm,newm):assert b==origm.get(json.loads(a)['goalId'],a)
assert p['actualOriginalM7StatusCounts']=={'no_memory_needed':6,'memory_required':1}
cfg=O/'config/chemie-current407-N7-existing274.inactive.config.json';conf=read(cfg);sub=conf['subjects'][0]
assert len(conf['subjects'])==1 and sub['subject']=='chemie'
assert str((O/'config/P6.a.original-science-except-held682.normal-alias.config.json').relative_to(R)) in sub['positiveEvidenceConfigPaths']
assert str((O/'config/P7.a.preserved-original-stock-check.config.json').relative_to(R)) not in sub['positiveEvidenceConfigPaths']
run=read(O/'receipts/CORRECTED.current407-N7-existing274-central.completed-run.json');report=read(checked(run['fullStockReport']));subject=report['subjects'][0]
assert run['exitCode']==0 and report['blockingIssueCount']==0 and all(c['status']=='pass' for c in subject['requiredChecks']) and len(subject['requiredChecks'])==6
old=set(p['baseStrict274Ids']);protected=set(p['protected262StrictIds']);new=set(subject['strictCompleteGoalIds']);h=hold['goalId']
assert len(old)==274 and len(protected)==262 and len(new)==280 and old<=new and protected<=new
assert new-old==ids-{h} and h not in new and subject['denominator']==407 and not subject['strictCompletionReady']
measurement=write('MEASURE.actual280-existing274-and-protected262-retained-N7-P6.actual.json',{
 'schemaVersion':1,'measuredAt':now(),'fullStockReport':run['fullStockReport'],'completedActualCentralRun':bind(O/'receipts/CORRECTED.current407-N7-existing274-central.completed-run.json'),
 'priorStrictCount':274,'actualStrictCount':280,'denominator':407,'percentage':subject['percentage'],'remaining':subject['remaining'],
 'actualStrictGoalIds':subject['strictCompleteGoalIds'],'preservedPrevious274StrictGoalIds':p['baseStrict274Ids'],'protected262StrictIds':p['protected262StrictIds'],
 'actualAddedSixGoalIds':sorted(new-old),'lostPreviousStrictGoalIds':sorted(old-new),'held682NotStrict':True,'newOperative682PSelected':False,
 'actualGateCounts':subject['gates'],'actualSixRequiredChecks':subject['requiredChecks'],'blockingIssueCount':0,
 'wholeM7Reached':False,'strictCompletionReady':False,'actualMachineIntersectionOnly':True,'newScientificVotes':0,'activeWrites':False})
sourceholds={'sourceMaturity':'M1 remains the last broadly measured source status; this package performs no new M6/CQR003/004 source closure.',
 'M311FourBBBEAcquisitionHold':{'receipt':p['M311BoundedScientificReceipt'],'finding':p['M311ScopeAcquisitionHolds'],'relevantLayerAM7Blocker':True,'globalMCheckDoesNotSupplyMissingCourseAcquisition':True},
 '682TaskMaterial':bind(O/'HOLD.exact682-missing-supplied-Maltose-Saccharose-formula-material-and-P6-selection.actual.json'),
 '5cOriginalMemoryRequiredRetained':True,'globalM407TechnicalPassDoesNotClaimAllResolvedCourseScopesPass':True,
 'sourceNI3OnlyPreviouslyReviewedPartialRelationshipsRetained':True,'Source34NoBroadActiveApplicationOrNewClosure':True,
 'humanTrialOrHumanApproval':False,'releaseOrActivation':False}
write('CHECK.final-exact-whole-content-records-and-host-preservation.actual.json',{
 'schemaVersion':1,'checkedAt':now(),'all533NonresourceFieldsAndOther529WholeGoalsExact':True,'exactFourResourceChanges':changed,
 'QA419Other412WholeRecordsExact':True,'sevenOnlyStockYesNoSerializationChangesAfterFailedRun':True,'originalSevenVReviewersDatesReasonsAndApprovedPixelsVerbatim':True,
 'actualCanonicalPublicAndApprovedShaBindings':7,'D7OriginalPeerRecordsAndRunsByteExact':True,'P6BothExactOriginalLineSubsetsP7AndHeld682Preserved':True,
 'A7OriginalLinesExact':True,'M407Other400LinesAndSevenActualOriginalScientificLinesExact':True,'M75WholeCardRecordsPreserved':True,
 'MRoot442AndNineOriginalVisibilityScopesRetained':True,'actualOriginalM7StatusCounts':p['actualOriginalM7StatusCounts'],
 'NI3PreviouslySealedCandidateHashesStillExact':p['sourceNI3MustRemainExact'],'protectedMathPhysBioAndHubFiles':imported['protectedOtherCanonicalAndOverviewWholeFileBindings'],
 'activeAliasesUnchangedFromReadOnlyObservation':active['files'],'measurement':bind(measurement),'remainingHolds':sourceholds,'newScienceVotes':0,'activeWrites':False})
write('checks/INITIAL.finite-preflight-receipt-Path-wrapper-error.actual.json',{
 'schemaVersion':1,'recordedAt':now(),'kind':'Preserved builder invocation failure; no fabricated run timestamp',
 'toolChunkId':'e6ed9b','exitCode':1,'failure':'read helper received a string instead of pathlib.Path while reading the neutral selector; all419 approval-type assertions ran before this builder receipt construction failed.',
 'correction':'Wrap neutral selector relative path with repo pathlib.Path before read. No H or scientific record change.',
 'subsequentActualInvocationChunkId':'78d1bb','subsequentExitCode':0})
final=write('FINAL.native7-existing274-to-actual280-technical-integration.manifest.json',{
 'schemaVersion':1,'completedAt':now(),'kind':'Inactive technical integration of actual independent D7, original A7/P6 and M407; no new science review',
 'operativeCentralConfig':bind(cfg),'canonicalCandidate':bind(O/'candidate/canonical533.current407.N7.inactive.json'),
 'semanticCandidate':bind(sc),'operativeQACandidate':bind(qc),'actualD7Index':bind(O/'native-seven/resolution-index.json'),
 'actualOriginalIndependentDSeals':inp['actualFinalPeerSeals'],'originalDProvenance':bind(O/'INPUTS.exact-D7-independent-seals-and-original-campaign-transport.actual.json'),
 'terminalIndexSelectionCAS':bind(O/'CAS.final-D7-index-terminal-owner-and-P6-selection.actual.json'),
 'operativeA7Config':bind(O/'config/A7.a.preserved-original-stock-check.config.json'),
 'operativeP6Config':bind(O/'config/P6.a.original-science-except-held682.normal-alias.config.json'),
 'independentOriginalP6BConfig':bind(O/'config/P6.b.original-science-except-held682.normal-alias.config.json'),
 'operativeSingleM407Config':bind(O/'config/M407.original-science-plus-seven.normal-alias.config.json'),
 'actual280Measurement':bind(measurement),'sixChecksActualCorrectedReceipt':bind(O/'receipts/CORRECTED.current407-N7-existing274-central.completed-run.json'),
 'preservedInitialFullFailure':bind(O/'receipts/ACTUAL.current407-N7-existing274-central.completed-run.json'),
 'actualCompleteCentralAttempts':2,'necessaryRetryReason':'First complete run exposed seven raw Boolean V approvals. Exact original approvals were serialized to stock yes/no, whole stock V check passed, and the necessary corrected complete run passed. No checker or gate changed.',
 'finiteFutureBuilderPreflightTemplate':bind(O/'CHECK.finite-pre-central-raw-types-stock-V-and-terminal-D-chain.actual.json'),
 'preflightChronology':'The dedicated419 raw-type receipt was assembled after corrected-run launch. Exact seven serialization and whole stock V check preceded the corrected run; future builder contract requires the complete receipt before the first central run.',
 'physicalHost':str(H.relative_to(R)),'allThreeNIReviewedPartialCarrierHashesRetained':p['sourceNI3MustRemainExact'],
 'remainingHolds':sourceholds,'newScienceVotes':0,'activeWrites':False,'engineOrRegistryOrGitWrites':False,'humanApproval':False,'release':False})
(O/'README.md').write_text('''# Native7: technische Integration, tatsächlich280/407

Nur inaktive Chemie-Auswahl und der ausdrücklich freigegebene physische Prüfhost wurden beschrieben. Echte frischeD7-A/B-Records und Runmanifeste sind bytegleich erhalten; unveränderte Stock-Werkzeuge haben sieben aktuelle Resolutionen materialisiert. Der bisherigen Auswahl wurden einD-Index und keine erfundenen Supersessions hinzugefügt: keines der sieben Ziele hatte einen bisherigen operativenD-Owner.

Der tatsächliche korrigierte Zentralbericht besteht alle sechs Stock-Prüfungen: **280/407,68,8%,127 offen,blocking0**. Alle274 bisherigen und262 geschützten strikten IDs sind enthalten; exakt sechs hinzugekommene IDs stehen im MEASURE-Nachweis.682 erhältD/A/V, aber keinen neu ausgewähltenP-Abschluss: FallA verspricht vollständige Maltose-/Saccharose-Strukturformeln, die der gebundene ganze Fallträger nicht liefert. Beide ursprünglichenP7-Dateien, die sechs ausgewählten Originalzeilen und die zurückgehaltenen682-Zeilen bleiben erhalten.

Der erste vollständige Lauf scheiterte an sieben aus dem neutralen technischen Paket übernommenen Boolean-aiApproved-Feldern. Die tatsächlichen ursprünglichenV-Urteile wurden anschließend lediglich in das Stockformat yes/no übertragen; Pixel, Reviewer, Datum, Gründe und übrige412 QA-Records blieben identisch. Der enge unveränderte ganze Chemie-V-Check bestand vor dem nötigen zweiten Zentrallauf. Beide tatsächlichen Läufe bleiben dokumentiert. Die separate Vorlage CHECK.finite-pre-central-raw-types-stock-V-and-terminal-D-chain verlangt künftig vor dem ersten Gesamtlauf alle Feldtypen, Original-Provenienz, tatsächliche Canonical-/Public-/Approval-Bindungen, normalen ganzenV-Check und gültige terminaleD-Ketten. Ihre nachträgliche Zusammenstellung ist ausdrücklich datiert; sie wird nicht rückwirkend als erster Preflight ausgegeben.

M407 enthält dieselben tatsächlichen wissenschaftlichen Originalzeilen; die sieben übernommene Urteile sind sechs no_memory_needed und5c memory_required.75 Karten, root442 und neun Sichtbarkeitsscopes bleiben erhalten. Die vier BB/BE-Erwerbs-HOLDs zuM311 sind relevante Layer-A/M7-Grenzen trotz globalem Stock-M-PASS. QuellenstatusM1/fehlendeM6-/CQR-Abschlüsse, partielleNI3-Beziehungen, Human- und Freigabegrenzen werden nicht hochgestuft. Alle drei vorher versiegeltenNI-Transportträger und die geschützten anderen Fachdateien sind unverändert. Es gibt keine Aktivierung, neue Wissenschaftsstimme oder Engine-/Registry-/Git-Änderung.
''')
# Only finite parsing and the actual unchanged stock symlink guard; no broad build.
parsed=[]
for f in sorted(O.rglob('*')):
 assert not f.is_symlink(),f
 if not f.is_file():continue
 if f.suffix=='.json':read(f);parsed.append({'path':str(f.relative_to(O)),'format':'json'})
 elif f.suffix=='.jsonl':
  lines=[t for t in f.read_text().splitlines() if t.strip()]
  for t in lines:json.loads(t)
  parsed.append({'path':str(f.relative_to(O)),'format':'jsonl','records':len(lines)})
spec=importlib.util.spec_from_file_location('finite_stock_curriculum_guard',R/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
errors=mod.curriculum_symlink_errors(str(R));assert not errors,errors
paths='\n'.join(str(f.relative_to(R)) for f in O.rglob('*') if f.is_file())+'\n'
ignored=subprocess.run(['git','check-ignore','--no-index','--stdin'],cwd=R,input=paths,text=True,capture_output=True);assert ignored.returncode==1 and not ignored.stdout
write('checks/FINAL.finite-json-jsonl-parse-and-actual-stock-symlink-guard.actual.json',{
 'schemaVersion':1,'checkedAt':now(),'allFiniteJsonJsonlParsed':parsed,'stockFunction':'scripts/validate_schemas.py::curriculum_symlink_errors',
 'actualGlobalCurriculumSymlinkErrors':errors,'ownRootSymlinks':0,'ownIgnoredPublicFiles':0,'fullBuildOrGlobalValidationRun':False,'pass':True})
sealname='SEAL.finite-native7-existing274-to-actual280-technical-integration.actual.json'
files=[bind(f) for f in sorted(O.rglob('*')) if f.is_file() and f.name!=sealname]
seal=write(sealname,{'schemaVersion':1,'startedAt':read(O/'STARTED.actual.json')['startedAt'],'completedAt':now(),
 'kind':'Finite actual280 inactive technical integration seal; no scientific vote or release',
 'root':str(O.relative_to(R)),'fileCount':len(files),'totalBytes':sum(f['bytes'] for f in files),'files':files,
 'actualStrictComplete':280,'denominator':407,'actualGain':6,'all274And262Retained':True,'remainingHolds':sourceholds,
 'stockGuardErrors':0,'newScienceVotes':0,'activeWrites':False,'engineRegistryGitWrites':False})
for b in read(seal)['files']:checked(b)
assert len([f for f in O.rglob('*') if f.is_file()])==len(files)+1
print(json.dumps({'seal':bind(seal),'fileCount':len(files),'bytes':sum(f['bytes'] for f in files),'actual':280,'denominator':407,'gain':6,'old274And262Retained':True,'held682NotStrict':True,'stockGuardErrors':0,'finiteParses':len(parsed)}))
