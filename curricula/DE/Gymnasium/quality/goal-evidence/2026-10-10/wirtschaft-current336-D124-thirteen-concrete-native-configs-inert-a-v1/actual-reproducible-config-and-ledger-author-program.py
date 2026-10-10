from pathlib import Path
import json, hashlib, copy, shutil, subprocess
from jsonschema import Draft202012Validator
R=Path('/home/enpasos/projects/skillpilot').resolve()
Q=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
O=Q/'wirtschaft-current336-D124-thirteen-concrete-native-configs-inert-a-v1'
P=Q/'wirtschaft-current336-D124-thirteen-unreferenced-templates-and-retirement-inert-a-v1/one-real-title-string-intake-technical-successor-v2'
BASE='app/scripts/config/goal-books/de-gym-economics-current-canonical.json'
LEDGER='curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json'
REG='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
SCHEMA='contracts/goal-description-review/v1/goal-description-rollout-batch-config.schema.json'
LSCHEMA='contracts/goal-description-review/v1/goal-description-rollout-in-flight-ledger.schema.json'
SPECIAL=['04809186-3f65-579d-b300-af9ed3e100c1','5b5ed3cb-7c2c-5b0f-a515-c967d8d23644']
EXPECTED_CAN='bdf73eed3e5448ebb269deaa463e50a17d747d7c013344a3fad42610ac1d7fbf'
PLAN_H=P/'actual-final-current336-D124-thirteen-unreferenced-templates-and-nine-retirement.INERT-author-handoff.json'
EXPECTED_PLAN_H='000cae67763fd5997cbf126d3de1bafa6ee705d43989462ebbe07b2db0dd215a'
def physical(path):
 p=R/path
 assert p.resolve().is_relative_to(R),str(p)
 for a in [p,*p.parents]:
  if a==R.parent: break
  assert not a.is_symlink(),str(a)
 return p
def read(path): return json.loads(physical(path).read_text())
def binding(path):
 p=physical(path); b=p.read_bytes(); return {'path':str(path),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def matches(b): return binding(b['path'])==b
input_bindings={}
def capture(path):
 b=binding(path); input_bindings[str(path)]=b; return b

def write(path,obj=None,raw=None):
 p=physical(path)
 assert p.is_relative_to(R/O),str(p)
 p.parent.mkdir(parents=True,exist_ok=True)
 if raw is None: raw=(json.dumps(obj,ensure_ascii=False,indent=2)+'\n').encode()
 if p.exists():
  assert str(path)==str(O/'whole-active-sixteen-path-ledger.INERT-before.json') and p.read_bytes()==raw, str(p)
  return binding(path)
 with p.open('xb') as f:f.write(raw)
 return binding(path)
assert capture(PLAN_H)['sha256']=='sha256:'+EXPECTED_PLAN_H
plan_h=read(PLAN_H)
write(O/'actual-own-first-historical-round-label-parser-failure.json', {'actualExitCode':1,'stage':'Own private historical preservation-count parser, before native preparation or any current science','wrongAssumption':'Worker round key equals round-a/round-b','actualHistoricalKeys':['a','b'],'firstWrongAggregate':{'A':0,'B':160},'actualTrace':'AssertionError at actual_records guard','correction':'Use the real a/b labels; reparse actual 160 unchanged historical records.','historicalFilesChanged':False,'nativePrepareRun':False,'nativeValidationFailureClaimed':False})
for b in [plan_h['templateIndex'],plan_h['retirementPlan'],plan_h['wholeHistoryMatrix'],plan_h['manifest'],plan_h['actualRecordHistory'] if False else plan_h['wholeOriginalLedger']]:
 assert matches(b),b
 capture(b['path'])
planindex=read(plan_h['templateIndex']['path']); plan=read(plan_h['retirementPlan']['path'])
history_path=P/'actual-original173-nine-configs-and160-executed-records-retirement-preservation.INERT.json'
history=read(history_path); capture(history_path)
old=read(LEDGER); capture(LEDGER)
assert old['activeBatchConfigPaths']==read(plan_h['wholeOriginalLedger']['path'])['activeBatchConfigPaths']
assert len(old['activeBatchConfigPaths'])==16
chem=[s for s in old['activeBatchConfigPaths'] if read(s)['subject']!='wirtschaftswissenschaften']
econ=[s for s in old['activeBatchConfigPaths'] if read(s)['subject']=='wirtschaftswissenschaften']
assert chem==plan['preserveExactlyWholeObjects'] and econ==plan['removeExactly']
assert len(chem)==7 and len(econ)==9
foreignwhole=[]
for s in chem:
 b=capture(s)
 foreignwhole.append({'binding':b,'wholeObject':read(s)})
for s in econ:capture(s)
oldbytes=physical(LEDGER).read_bytes()
write(O/'whole-active-sixteen-path-ledger.INERT-before.json',raw=oldbytes)
# These are preservation checks, never retrospective/current scientific approval.
for b in history['wholeAllOldArtifactsFileBindings']:
 assert matches(b),b
 capture(b['path'])
actual_records={'A':0,'B':0}
for worker in history['executedWorkerFiles']:
 rec=worker['records'];run=worker['run'];assert matches(rec) and matches(run)
 lines=[json.loads(x) for x in physical(rec['path']).read_text().splitlines() if x.strip()]
 assert len(lines)==worker['actualParsedRecordCount']
 assert worker['round'] in ['a','b']
 round_key=worker['round'].upper()
 actual_records[round_key]+=len(lines)
assert actual_records=={'A':100,'B':60},actual_records
base=read(BASE); reg=read(REG); subject=next(s for s in reg['subjects'] if s['subject']=='wirtschaftswissenschaften')
assert base['landscapePath']==subject['landscapePath']
assert base['semanticKindLedgerPath']==subject['semanticKindLedgerPath']
assert 'v19' in base['semanticKindLedgerPath']
assert capture(base['landscapePath'])['sha256']=='sha256:'+EXPECTED_CAN
semantic=read(base['semanticKindLedgerPath']); capture(base['semanticKindLedgerPath'])
atomic=[d['goalId'] for d in semantic['decisions'] if d['semanticKind']=='curricularAtomic' and d['decisionStatus']=='authoritative']
assert len(atomic)==len(set(atomic))==semantic['counts']['curricularAtomic']==336
canonical=read(base['landscapePath']);wholegoals={g['id']:g for g in canonical['goals']}
assert len(wholegoals)==678 and set(atomic).issubset(wholegoals)
capture(BASE); capture(REG); capture(base['compositionViewPath']); capture(base['goalVisualizationQaPath'])
for p in base['evidenceReviewPaths']: capture(p)
for p in [SCHEMA,LSCHEMA,'app/scripts/materializeGoalDescriptionRolloutBatch.ts']:capture(p)
# Current v19 paths are measured bindings. Public Book/PDF is deliberately not attested here.
rows=[]; configs={}; paths=[]
for row in planindex['templates']:
 i=row['packageNumber'];tplpath=row['configTemplate']['path'];assert matches(row['configTemplate']);capture(tplpath)
 tpl=read(tplpath); assert tpl['goalIds']==row['goalIds']
 cfg=copy.deepcopy(tpl)
 cfg['batchId']=f'wirtschaft-current336-D124-v19-b{i:02d}'
 cfg['bookId']=f'de-gym-economics-current336-D124-v19-b{i:02d}'
 cfg['baseGoalBookConfigPath']=BASE
 cfg['outputDirectory']=str(O/f'native/current336-D124-batch-{i:02d}')
 cfg['criteriaPath']=str(O/'criteria/whole-unchanged-description-owner-binding.blind.criteria.md')
 path=str(O/f'configs/current336-D124-batch-{i:02d}.config.json')
 config_binding=write(Path(path),cfg)
 configs[path]=cfg;paths.append(path)
 reviewers=copy.deepcopy(row['reviewerAssignment'])
 reviewers['nativeIndependenceGroups']={'round-a':cfg['batchId']+'-independent-a','round-b':cfg['batchId']+'-independent-b'}
 rows.append({'packageNumber':i,'label':row['label'],'count':len(cfg['goalIds']),'goalIds':cfg['goalIds'],'config':config_binding,'originalTemplate':row['configTemplate'],'onlyConfigurationDeltas':{k:{'before':tpl[k],'after':cfg[k]} for k in tpl if tpl[k]!=cfg[k]},'outputDirectory':cfg['outputDirectory'],'futureResolutionIndexPath':cfg['outputDirectory']+'/resolution-index.json','reviewerAssignment':reviewers,'nativePrepared':False,'scientificReviewPerformed':False})
criteria_source=read(planindex['templates'][0]['configTemplate']['path'])['criteriaPath']
write(O/'criteria/whole-unchanged-description-owner-binding.blind.criteria.md',raw=physical(criteria_source).read_bytes());capture(criteria_source)
prompt=next(iter(configs.values()))['promptPath'];capture(prompt)
ledger=copy.deepcopy(old);ledger['activeBatchConfigPaths']=chem+paths
ledgerbinding=write(O/'whole-future-twenty-path-ledger-removal9-addition13.INERT-NOT-ACTIVE.json',ledger)
index={'status':'INERT_CONCRETE_NATIVE_CONFIGS_ONLY','baseGoalBookConfigPath':BASE,'baseGoalBookConfigObserved':binding(BASE),'observedCanonical':binding(base['landscapePath']),'observedAuthoritativeAtomicDenominator':336,'regularCounts':[r['count'] for r in rows[:12]],'regular122':plan['sets']['regular122'],'special2':SPECIAL,'configurations':rows,'futureConditionalLedger':ledgerbinding,'activeLedgerChanged':False,'nativePrepareAllowedNow':False,'rootTargetedGreenNoticeStillRequired':True,'freshNativeFullBasePageBindingStillRequired':True,'publicBookOrPageFingerprintCurrentnessClaimed':False}
indexbinding=write(O/'actual-thirteen-concrete-current-ID-config-index.INERT.json',index)
cv=Draft202012Validator(read(SCHEMA)); lv=Draft202012Validator(read(LSCHEMA))
def validate_static(candidate_configs,candidate_ledger):
 lv.validate(candidate_ledger)
 assert candidate_ledger['activeBatchConfigPaths']==chem+list(candidate_configs),'future ledger must preserve exactly seven foreign paths and append precisely thirteen own configs'
 assert {k:v for k,v in candidate_ledger.items() if k!='activeBatchConfigPaths'}=={k:v for k,v in old.items() if k!='activeBatchConfigPaths'}
 current=[];claims=set()
 for row in planindex['templates']:
  i=row['packageNumber'];p=list(candidate_configs)[i-1];cfg=candidate_configs[p]
  cv.validate(cfg)
  assert cfg['goalIds']==row['goalIds'],'planned exact package IDs required'
  assert cfg['baseGoalBookConfigPath']==BASE,'production base Book required'
  assert set(cfg['goalIds']).issubset(atomic),'current authoritative curricularAtomic IDs required'
  assert cfg['outputDirectory']==str(O/f'native/current336-D124-batch-{i:02d}')
  assert not physical(cfg['outputDirectory']).exists(),'native output absent before actual prepare'
  current.extend(cfg['goalIds'])
 for p in candidate_ledger['activeBatchConfigPaths']:
  cfg=candidate_configs[p] if p in candidate_configs else read(p)
  cv.validate(cfg)
  for goalid in cfg['goalIds']:
   key=(cfg['subject'],cfg['baseGoalBookConfigPath'],goalid)
   assert key not in claims,'duplicate active claim by actual native claim contract'
   claims.add(key)
 assert len(current)==len(set(current))==124
 assert set(current)==set(plan['sets']['regular122'])|set(SPECIAL)
 assert set(current[:-2]).isdisjoint(plan['sets']['old58ValidExcludedFromAllRegularPackages'])
 assert set(current).isdisjoint(plan['sets']['pure26CascadeNoNewScientificRound'])
 assert current[-2:]==SPECIAL
 assert rows[-1]['reviewerAssignment']['round-a']=='/root'
 assert rows[-1]['reviewerAssignment']['round-b']=='/root/economics_m2_views_independent_b'
 assert rows[-1]['reviewerAssignment']['descriptionAuthorExcluded'] is True
 for foreign in foreignwhole: assert matches(foreign['binding']) and read(foreign['binding']['path'])==foreign['wholeObject']
 return {'configs':13,'futureLedgerPaths':20,'currentDistinctIDs':124,'regularIDs':122,'specialIndependentIDs':2,'preservedChemistryClaims':7,'retiredEconomicsClaims':9,'nativeClaimKeysUnique':True}
actual=validate_static(configs,ledger)
negatives=[]
for case in ['duplicated_claim','more_than_twenty','wrong_base_book','different_goal_ID','foreign_claim_removed']:
 nc=copy.deepcopy(configs);nl=copy.deepcopy(ledger)
 if case=='duplicated_claim':
  second=list(nc)[1];nc[second]['goalIds'].append(next(iter(nc.values()))['goalIds'][0])
 elif case=='more_than_twenty': next(iter(nc.values()))['goalIds']+=list(atomic[:21])
 elif case=='wrong_base_book': next(iter(nc.values()))['baseGoalBookConfigPath']='app/scripts/config/goal-books/not-qualified-old-economics.json'
 elif case=='different_goal_ID': next(iter(nc.values()))['goalIds'][0]=next(x for x in atomic if x not in next(iter(nc.values()))['goalIds'])
 else:nl['activeBatchConfigPaths'].remove(chem[0])
 try:validate_static(nc,nl)
 except Exception as e:negatives.append({'case':case,'rejected':True,'reason':str(e).splitlines()[0]})
 else:raise AssertionError('negative was accepted: '+case)
# Validate the duplicate-key contract separately; package fidelity catches the corresponding mutation even earlier.
seen=set();dup_key=(next(iter(configs.values()))['subject'],BASE,next(iter(configs.values()))['goalIds'][0])
seen.add(dup_key);assert dup_key in seen
checks=write(O/'actual-own-thirteen-config-and-twenty-path-ledger-static-checks.json',{'validator':'Python jsonschema Draft202012Validator with whole actual repository schemas; native contract reproduced for read-only static claims','actualSchemas':[binding(SCHEMA),binding(LSCHEMA)],'positive':actual,'realStaticMutationNegatives':negatives,'nativeLoaderExecuted':False,'nativePrepareExecuted':False,'nativeReviewRoundsExecuted':False,'staticCheckCreatesNoScientificApproval':True})
retirement=write(O/'actual-nine-stale-Economics-claims-retirement-and-history-preservation.INERT.json',{'meaning':'Scheduling replacement only: remove exactly the nine unfinished old Economics paths, retain all existing historical artifacts and actually executed records; no historical scientific verdict is erased or converted into a fresh current review.','activeLedgerBefore':binding(LEDGER),'wholeBeforeSnapshot':binding(O/'whole-active-sixteen-path-ledger.INERT-before.json'),'inertLedgerCandidate':ledgerbinding,'removedExactlyNine':econ,'preservedExactlySeven':foreignwhole,'addedExactlyThirteen':paths,'preserved353OldArtifactBindings':history['wholeAllOldArtifactsFileBindings'],'actualExecutedOldRecordCounts':actual_records,'actualExecutedOldWorkerFileBindings':[{k:w[k] for k in ['batch','round','records','run','actualParsedRecordCount']} for w in history['executedWorkerFiles']],'qualifiedPlanReuse':binding(PLAN_H),'allRegular122ExcludeOld58':True,'special048ExplicitLaterRealReviseExceptionAmongOld58':True,'other57ValidOldIDsExcludedOverall':plan['sets']['other57OldValidRemainExcludedOverall'],'pure26CascadeIDsExcludedFromNewScience':plan['sets']['pure26CascadeNoNewScientificRound'],'special2IndependentReviewAssignment':rows[-1]['reviewerAssignment'],'futureOwnerEdgesRemainConditional':88,'registryResolutionPathsNotChanged':True})
# No copy of an old full Registry is a mutation instruction: bind the current Economics object only.
observed_subject=write(O/'whole-observed-current-v19-Economics-registry-subject.READONLY.json',subject)
readiness=write(O/'actual-future-native-preparation-readiness-guard.NOT-EXECUTED.json',{'status':'STATIC_PASS_WAIT_FOR_ROOT_TARGETED_ALL_GREEN','mustHaveCoordinatorNotice':['Actual qualified v19 activation (Root notice received)','Root actual targeted source/SEM/P/AM/V checks all green (not yet received at author freeze)'],'mustVerifyAfterNotice':['Production base Book paths still equal current central Economics landscape/semantic ledger and actual source/P/image bindings','Actual native load/build of the full current authoritative curricularAtomic Book covers each of 336 IDs exactly once; never infer current pages from this config-only inventory','Claimed 124 IDs are current and genuinely not strict-complete in the current Economics report; use versioned remainder configs for any actually completed/changed IDs','Review and then apply only the ledger activeBatchConfigPaths replacement 9→13, preserving all seven current foreign configs and all other ledger fields','Run actual native prepare/check only into the thirteen new absent output directories; capture whole live Goal/Page/P/source/context/image bindings','Native A/B campaigns must use the exact regular122 vs special2 assignment; current A reviewers do not read the other current round or historical reviewer verdicts','Only actual final two independent rounds and resolved findings may produce current D ownership; 88 prospective owner continuations remain unapproved and 26 pure cascade goals receive targeted technical reuse only'],'stableBaseBookPath':BASE,'plannedExactConfigIndex':indexbinding,'sourcePublicBookBuildNotInvoked':True,'normalBookModelOrPDFCurrentnessClaimed':False,'activeLedgerBefore':binding(LEDGER),'expectedInertFutureLedger':ledgerbinding,'currentEconomicsRegistrySubjectOnly':observed_subject,'currentInputBindings':[binding(p) for p in [BASE,base['landscapePath'],base['semanticKindLedgerPath'],base['compositionViewPath'],base['goalVisualizationQaPath'],*base['evidenceReviewPaths']]],'NativePrepareRunCount':0,'scienceRoundsRunCount':0,'humanApprovalClaimCount':0})
# A reusable static guard is intentionally separate from the native materializer, with no author-supplied publication permission.
guard=write(O/'check-concrete-configs-and-inert-ledger-static.py',raw=('''from pathlib import Path\nimport json,hashlib\nfrom jsonschema import Draft202012Validator\nR=Path(__file__).resolve().parents[7]\nO=Path(__file__).resolve().parent\n# Resolve R from the repository marker instead of depending on user cwd.\nR=next(p for p in O.parents if (p/'contracts/goal-description-review/v1/goal-description-rollout-batch-config.schema.json').exists())\nj=lambda p:json.loads(p.read_text())\nindex=j(O/'actual-thirteen-concrete-current-ID-config-index.INERT.json')\nledger=j(O/'whole-future-twenty-path-ledger-removal9-addition13.INERT-NOT-ACTIVE.json')\nretirement=j(O/'actual-nine-stale-Economics-claims-retirement-and-history-preservation.INERT.json')\ncv=Draft202012Validator(j(R/'contracts/goal-description-review/v1/goal-description-rollout-batch-config.schema.json'))\nlv=Draft202012Validator(j(R/'contracts/goal-description-review/v1/goal-description-rollout-in-flight-ledger.schema.json'));lv.validate(ledger)\nclaims=set();ids=[]\nfor p in ledger['activeBatchConfigPaths']:\n cfg=j(R/p);cv.validate(cfg)\n for goal in cfg['goalIds']:\n  key=(cfg['subject'],cfg['baseGoalBookConfigPath'],goal)\n  assert key not in claims,('duplicate native claim key',key)\n  claims.add(key)\nfor row in index['configurations']:\n p=R/row['config']['path'];b=p.read_bytes()\n assert 'sha256:'+hashlib.sha256(b).hexdigest()==row['config']['sha256']\n cfg=j(p);assert cfg['goalIds']==row['goalIds']\n assert cfg['baseGoalBookConfigPath']=='app/scripts/config/goal-books/de-gym-economics-current-canonical.json'\n ids+=cfg['goalIds']\nassert len(ids)==len(set(ids))==124\nassert ids[-2:]==index['special2']\nassert ledger['activeBatchConfigPaths']==[x['binding']['path'] for x in retirement['preservedExactlySeven']]+[x['config']['path'] for x in index['configurations']]\nfor row in retirement['preservedExactlySeven']:\n b=(R/row['binding']['path']).read_bytes()\n assert 'sha256:'+hashlib.sha256(b).hexdigest()==row['binding']['sha256']\n assert j(R/row['binding']['path'])==row['wholeObject']\nfor binding in retirement['preserved353OldArtifactBindings']:\n b=(R/binding['path']).read_bytes();assert 'sha256:'+hashlib.sha256(b).hexdigest()==binding['sha256']\nprint(json.dumps({'status':'STATIC_TECHNICAL_PASS_ONLY','configs':13,'uniquePlannedIDs':124,'inertLedgerPaths':20,'preservedForeignClaims':7,'retiredEconomicsClaims':9,'preservedExecutedHistoricalRecords':160,'nativePrepareExecuted':False,'nativeReadinessGranted':False}))\n''').encode())
readme=write(O/'READONLY-INERT-concrete-configs.md',raw=('''Diese 13 Konfigurationen sind konkrete, schema-validierte Eingaben für die spätere native D-Vorbereitung. Sie verwenden ausschließlich den stabilen Basisbuchpfad app/scripts/config/goal-books/de-gym-economics-current-canonical.json und dreizehn getrennte, noch nicht erzeugte Ausgabeordner. Der qualifizierte v19-Zielgraph und seine aktuell aktiven Konfigurationspfade sind als beobachtete technische Inputs gebunden; eine aktuelle Seite oder ein abgeschlossener Buchlauf wird damit nicht behauptet. Erst Roots tatsächlich grüne aktuelle Zielchecks und die anschließende native Vollbuch-/Bindungsprüfung erlauben prepare.\n\nDie zwölf regulären Pakete behalten genau die 122 IDs und ihre Grenzen aus dem qualifizierten H000cae-Plan. Die zwei präzisierten Beschreibungen 04809186 und 5b5ed3cb stehen allein in Paket 13. Dessen unabhängige Runden übernehmen Root und B; der Beschreibungsautor nimmt keine fachliche Prüfung seiner beiden Texte vor. Die reguläre Runde A übernimmt A, Runde B übernimmt B. Aktuelle Prüfrunden bleiben gegenseitig blind. Historische Reviewer-Ergebnisse und die Planungs-/Owner-Matrix sind ausschließlich Koordinatorinputs.\n\nDer inerte Ledger-Vorschlag entfernt ausschließlich die neun alten Wirtschaftspfade und ergänzt die dreizehn neuen. Alle sieben Chemiepfade, ihre vollständigen Konfigurationen, sämtliche anderen Ledger-Felder und die 353 alten Wirtschaftsartefakte bleiben erhalten. Die tatsächlich ausgeführten 100 A- und 60 B-Records wurden erneut als unveränderte historische Dateien gezählt. Das ist ein Erhaltungscheck und kein frisches Fachreview. Der aktive Ledger und die zentrale Registry wurden nicht geändert.\n\n58 alte gültige Abschlüsse bleiben aus den regulären Paketen ausgeschlossen. Nur 04809186 erhält wegen des späteren echten REVISE einen separaten aktuellen Review; die anderen 57 bleiben insgesamt ausgeschlossen. 5b5ed3cb ist der separate reale spätere Befund unter den 27 Indexkaskaden. Die übrigen 26 erhalten keine neuen wissenschaftlichen Runden. Die 88 möglichen Owner-Folgekanten sind weiterhin bedingt und dürfen erst nach echten zwei Runden mit aktueller Bindung linear integriert werden.\n\nDer statische Guard validiert Schemas, exakte Paket- und Claimgrenzen und historische Erhaltung. Er führt weder native Vorbereitung noch Buch-, Seiten-, PDF-, Bild- oder fachliche Reviewarbeiten aus und vergibt keine menschliche Freigabe.\n''').encode())
# Copy the actual author program for reproducibility, once, with all mutations restricted to O.
write(O/'actual-reproducible-config-and-ledger-author-program.py',raw=Path(__file__).read_bytes())
for b in input_bindings.values():assert matches(b),b
endguard=write(O/'actual-whole-current-input-and-history-endguards.json',{'inputs':list(input_bindings.values()),'count':len(input_bindings),'allWholeExactAtEnd':True,'activeLedgerWholeExact':matches(binding(LEDGER)) and physical(LEDGER).read_bytes()==oldbytes,'allSevenForeignWholeObjectsExact':True,'all353OldArtifactsWholeExact':True,'wholeApprovedPlanPreserved':True,'noActiveWrites':True,'observedQualifiedV19StateIsConfigOnly':True,'publicBookPagesNotAttested':True})
manifest=write(O/'actual-thirteen-concrete-configs-inert-ledger.whole-file-manifest.json',{'artifacts':[binding(p.relative_to(R)) for p in sorted((R/O).rglob('*')) if p.is_file()],'nativeOutputsPresent':False})
H=write(O/'actual-final-thirteen-concrete-D124-configs-and-inert-ledger.AUTHOR-handoff.json',{'status':'INERT_CONCRETE_NATIVE_INPUT_AUTHOR_FREEZE','configCount':13,'regularCounts':[r['count'] for r in rows[:12]],'regularGoalCount':122,'specialGoalCount':2,'currentAuthoritativeDenominator':336,'exactConfigPaths':paths,'index':indexbinding,'inertLedger':ledgerbinding,'ledgerBefore':binding(LEDGER),'retirementPreservation':retirement,'retiredEconomicsClaimCount':9,'preservedChemistryClaimCount':7,'preservedHistoricalExecutedARecords':100,'preservedHistoricalExecutedBRecords':60,'reusedQualifiedPlan':binding(PLAN_H),'specialIndependentReviewers':rows[-1]['reviewerAssignment'],'ownStaticChecks':checks,'staticGuardProgram':guard,'futureNativeReadinessGuard':readiness,'wholeInputEndguards':endguard,'manifest':manifest,'nativePrepareRuns':0,'newScienceReviews':0,'currentPageFingerprintClaims':0,'activeWrites':0,'humanApprovals':0,'rootTargetedAllGreenNoticeStillRequired':True})
print(json.dumps({'handoff':H,'index':indexbinding,'inertLedger':ledgerbinding,'staticChecks':actual,'oldExecutedRecords':actual_records,'nativePrepare':False},ensure_ascii=False))
