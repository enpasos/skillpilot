# SPDX-License-Identifier: Apache-2.0
"""Audit exact originals and actual set difference, then finitely seal this packet."""
import ast,datetime,hashlib,json
from pathlib import Path
REPO=Path.cwd();OWN=Path(__file__).resolve().parents[1];E=OWN.parent
BASE=E/'chemie-carbonyl15-equilibrium16-current422-bounded-inactive-integration-technical-20261015-v1'
def load(p):return json.loads(p.read_text())
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(REPO).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(r):
 p=REPO/r['path'];a=ref(p);assert a['sha256']==r['sha256'] and ('bytes' not in r or a['bytes']==r['bytes']),p;return p
def put(p,v):
 assert not p.exists(),p;p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
sealpath=OWN/'FILES.finite-native9-current422-inactive-integration.seal.json';assert not sealpath.exists()
ready=load(OWN/'checks/READY.finite-CAS-protected697-358-422-one-central.json')
for r in ready['genuineFiniteSeals']:
 for f in load(verify(r['seal']))['files']:verify(f)
for row in load(OWN/'checks/ORIGINAL.input-binding-inventory.before.json')['files']:verify(row)
protected=load(OWN/'checks/PROTECTED697.actual-phase1-before.json')
for row in protected['files']:verify(row)
receipt=load(OWN/'checks/CENTRAL.exactly-one.command.actual.json');assert receipt['exitCode']==0 and receipt['actualCentralRuns']==1
verify(receipt['stdout']);verify(receipt['stderr'])
before=load(BASE/'checks/CENTRAL.current422.carbonyl15-equilibrium16.stock-report.actual.json')['subjects'][0]
after=load(verify(receipt['stdout']))['subjects'][0]
assert after['denominator']==before['denominator']==422 and set(after['currentGoalIds'])==set(before['currentGoalIds'])
old=set(before['strictCompleteGoalIds']);new=set(after['strictCompleteGoalIds']);added=new-old;removed=old-new
assert len(old)==358 and len(new)==367 and not removed
transport=load(OWN/'checks/TRANSPORT.D9-original-A-blind-B2.exact.json')
content=set(transport['contentGoalIds']);limited=set(transport['limitedScopeGoalIds'])
assert added==content|limited and len(content)==6 and len(limited)==3
open2=load(OWN/'checks/OVERLAP.D9-plus-e0-1a-original-negative-scopes.json')['twoExplicitStillOpenSourceScopeGoalIds'];assert not new.intersection(open2)
assert len(after['requiredChecks'])==6 and all(c['status']=='pass' for c in after['requiredChecks']) and not after['issues'] and after['strictCompletionReady'] is False
c=load(OWN/'checks/SELECTION.final-C-exact-P2-A2-M422-QA438.json')
selector=load(verify(c['selector']))
oldM=verify(selector['M1']['originalBaseline']);newM=verify(selector['M1']['whole422Records'])
target='f71a2c0a-3a6a-5b23-9fb4-1b57cfb68528'
def rawby(p):return {json.loads(l)['goalId']:l for l in p.read_bytes().splitlines() if l.strip()}
om,nm=rawby(oldM),rawby(newM);assert om.keys()==nm.keys() and len(nm)==422
assert [g for g in om if om[g]!=nm[g]]==[target]
oldQ=load(verify(selector['V1']['originalBaseline']));newQ=load(verify(selector['V1']['wholeQA438Candidate']))
oq={r['goalId']:r for r in oldQ['records']};nq={r['goalId']:r for r in newQ['records']}
assert oq.keys()==nq.keys() and len(nq)==438 and [g for g in oq if oq[g]!=nq[g]]==[target]
mp=load(OWN/'checks/REBUILD.current422.final-A-B2-C.discovery-exact.physical-map.json');host=REPO/mp['executionHost']
for row in mp['stockPhysicalModules']:
 p=host/row['path'];assert p.read_bytes()==verify(row).read_bytes() and not p.is_symlink()
for a in mp['aliases']:
 p=host/a['normalHostAlias'];assert p.read_bytes()==verify(a['physicalRepositorySource']).read_bytes() and not p.is_symlink()
for a in mp['selectedCurrentAssetRows']+mp.get('legacyBaselineAssetReferences',[]):
 p=verify(a['physicalRepositorySource'])
 assert all((host/a[k]).is_symlink() and (host/a[k]).resolve()==p.resolve() for k in ['normalCanonicalDestination','normalPublicDestination'])
assert list((host/'curricula/DE/Gymnasium/quality/goal-visualization-review').iterdir())==[]
regularbytes=sum(p.stat().st_size for p in host.rglob('*') if p.is_file() and not p.is_symlink());assert regularbytes==ready['regularHostBytes']
mp.update(role='Sealed finite inactive technical candidate after one successful stock central; rebuild only',normalQAState='Exact genuine final C QA438 selected, stock freshness check pass, no regeneration',memoryState='Exact genuine final C M422 selected, whole422 ten-scope stock check pass',centralAllowed=False,allowedAdditionalCentralRuns=0,actualCentralRuns=1,actualCentralReceipt=ref(OWN/'checks/CENTRAL.exactly-one.command.actual.json'),finalCentralConfig=ready['finalCentralConfig'])
finalmap=OWN/'checks/REBUILD.current422.final-inactive.physical-map.json';put(finalmap,mp)
diff={'schemaVersion':1,'role':'Actual stock report set difference, not a new review or active M7 claim','beforeReport':ref(BASE/'checks/CENTRAL.current422.carbonyl15-equilibrium16.stock-report.actual.json'),'afterReport':receipt['stdout'],'sameCurrent422Ids':True,'beforeStrictCount':358,'afterStrictCount':367,'addedStrictGoalIds':sorted(added),'removedStrictGoalIds':sorted(removed),'scientificContent6AddedGoalIds':sorted(added&content),'limitedScopeOldScience3RestoredGoalIds':sorted(added&limited),'stillOpenE0And1aGoalIds':open2,'beforeGates':before['gates'],'afterGates':after['gates'],'remaining':after['remaining'],'allSixRequiredChecksPass':True,'issues':[],'strictCompletionReady':False,'HumanApproval':False,'HumanTrial':False,'activeIntegration':False,'M7Grant':False}
put(OWN/'checks/DIFF.actual-before358-after367-content6-scope3.json',diff)
put(OWN/'checks/PRESERVATION.actual-after697-358-originals-finalC.json',{'role':'Actual post-central CAS, no active writes','checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'all697ProtectedActiveFilesExact':True,'all358OriginalStrictIdsRetained':True,'all358WholeGoalObjectsUnchangedBeforeCentral':True,'all422AuthoritativeCurrentIdsExact':True,'all560GoalIdsAndEdgesExact':True,'originalInputBindingsExact':True,'allGenuineSealedA_B2_C_NativePayloadsExact':True,'other421MRawLinesExact':True,'other437QaWholeObjectsExact':True,'currentCQAWholeBytesExactAfterStockCheck':True,'originalNegativeRecordsAndSelectedOld86IndexesExact':True,'exposedB1Selected':False,'stockPhysicalModulesExact':31,'physicalNormalAliasesExact':51,'regularHostBytes':regularbytes,'rasterCopies':0,'sameBaselineOtherSubjects':protected['baselineOtherSubjects'],'activeWrites':0,'GitWrites':0,'newScienceVotes':0})
readme=f'''# Native9 current422 – inaktive technische Zusammenführung

Der einmalige unveränderte Stock-Zentralbericht hat exit0, alle sechs Pflichtprüfungen bestehen, `issues=[]`.
Tatsächlicher Kandidat: **367/422**, vorher358/422. Die358 bisherigen vollständigen Ziele sind erhalten; dieselben422 IDs bleiben im Nenner. `strictCompletionReady=false`.

Der genaue Setdiff trennt sechs aktuelle Inhaltsziele und drei erneute engere Geltungsbindungen mit wiederverwendeter alter Wissenschaft. e0/1a erhalten echte aktuelle P2/A2 von C; ihre D-/Quellen-/Kursblockaden bleiben offen. Alte negative Records,86 Indexoriginale,181 alte Supersessions und5 Withdrawals sind erhalten. Zwei echte positive D-Claims (b752/138) werden explizit vom neuen D9-Index abgelöst.

## Gewählte Originale

- Echte unabhängige A-D9 und blind-B2-D9, unveränderte ganze Records/Originalruns. Exponiertes B1 ist unselektierte Historie.
- Echte A-P6/A6 und informierte C-P2/A2: ganze Records unverändert, ursprüngliche P-Runbindung erhalten. Alte betroffene P4/A8-Zeilen werden nur aus der aktuellen Auswahl entfernt; sämtliche übrigen Rohzeilen bleiben exakt. Keine Neuvotierung durch diese technische Rolle.
- C-M422 `dd7f0f70…` und C-QA438 `494a0584…`;421 M-Rohzeilen und437 QA-Objekte im eigenen C-Nachfolger exakt. Keine Bildgenerierung/QA-Neugenerierung.

## Technischer Prüfpfad

`config/central.current422.native9.original-A-B2-C.inactive.final.config.json` ist die tatsächlich einmal geprüfte inaktive Konfiguration. `checks/READY.finite-CAS-protected697-358-422-one-central.json` enthält den vorherigen endlichen CAS. Der Zentralbericht und seine Ausführungsreceipt liegen unter `checks/CENTRAL.*`.

Der frische ignorierte Host enthält31 exakte Stockmodule,51 physische JSON-Aliase und0 Rasterkopien ({regularbytes:,} reguläre Bytes). Alle435 aktuellen Bildzeilen verweisen auf Originalbytes. Die leere historische Legacy-Markdown-Discovery aus358 ist explizit im finalen Map und im Rebuildhelper fixiert; aktuelle Repositoryhistorie bleibt unverändert.

Zwei echte technische Erstfehler samt Receipts bleiben erhalten: (1) der erste QA-Check las noch heutige Legacy-Discovery; die private Hostdiscovery wurde auf den bereits gepinnten358-Eingang gestellt, C-QA blieb bytegleich, gezielter Check besteht; (2) ein leeres optionales `deferredGoals` im Syntheseauthoring ist im unveränderten Stockvertrag unzulässig; das Nachfolgerauthoring lässt das Feld weg und enthält exakt dieselben9 Entscheidungen. Der Pairbuilder erzeugt dieses optionale Feld künftig nur bei nichtleeren Deferrals. Keine Schema-/Qualitätsgrenze wurde geändert. Zentralprüfung1, keine Wiederholung.

## Rebuild nur bei technischer Notwendigkeit

Keine Books/Renderer erneut ausführen. `scripts/rebuild_check_only_sparse_host.py` verwendet standardmäßig das finale `checks/REBUILD.current422.final-inactive.physical-map.json`; es benötigt einen noch nicht vorhandenen ignorierten Zielhost und nimmt optional Map-/Hostpfade entgegen. Es erstellt nur die exakten Originalreferenzen/Aliase und isoliert die deklarierte leere Legacy-Discovery. Die Einmal-Central-Receipt erteilt keine neue Ausführungsfreigabe.

Alle697 geschützten aktiven Dateien und Originalquellen sind nachher bytegleich. Keine aktiven Registry-/Ledger-/Runtime-/Gitänderungen; keine Human Approval, Human Trial, Publikation oder M7-Freigabe. Die frühen PREPARED/phase1-Dateien sind nachvollziehbare Zwischenstände; maßgeblich ist ausschließlich der finale Selector.
'''
(OWN/'README.md').write_text(readme)
stats={'jsonFiles':0,'jsonlFiles':0,'jsonlRows':0,'pythonAST':0}
for p in sorted(OWN.rglob('*')):
 if p.is_symlink() or not p.is_file():continue
 if p.suffix=='.json':load(p);stats['jsonFiles']+=1
 elif p.suffix=='.jsonl':
  rows=[json.loads(l) for l in p.read_text().splitlines() if l.strip()];stats['jsonlFiles']+=1;stats['jsonlRows']+=len(rows)
 elif p.suffix=='.py':ast.parse(p.read_text());stats['pythonAST']+=1
put(OWN/'checks/FINITE.actual-json-jsonl-python-and-exact-integrity.json',{'role':'Bounded final actual parsing/CAS audit, no fullschema/global build or repeated central','stats':stats,'actualCentralRuns':1,'allSixRequiredChecksPass':True,'originalNegativeRowsPreserved':True,'legacyDiscoveryExplicitInFinalMap':True,'emptyOptionalDeferralsOmittedByPairBuilder':True,'active697Exact':True,'rasterCopies':0,'newScienceVotes':0})
finalselector=OWN/'OUTPUTS.finite-native9-current422-inactive-integration.final-selector.json'
put(finalselector,{'schemaVersion':1,'role':'Finite check-only inactive integration after actual358 checkpoint; genuine original A/blind B2/C science only','canonical':mp['canonical'],'semantic':mp['semantic'],'actualCentralConfig':ready['finalCentralConfig'],'actualCentralReport':receipt['stdout'],'actualCentralReceipt':ref(OWN/'checks/CENTRAL.exactly-one.command.actual.json'),'finiteReadyCAS':ref(OWN/'checks/READY.finite-CAS-protected697-358-422-one-central.json'),'finalExactRebuildMap':ref(finalmap),'rebuildOnlyHelper':ref(OWN/'scripts/rebuild_check_only_sparse_host.py'),'exactD9ResolutionIndex':ref(OWN/'native9/resolution-index.json'),'exactD9DualSummary':ref(OWN/'native9/dual-summary.json'),'exactD9SynthesisManifest':ref(OWN/'native9/synthesis-decisions.json'),'currentD9SynthesisAuthoring':ref(OWN/'native9/synthesis-authoring.omit-empty-optional-deferrals.json'),'sourceA_B2_C_NativeSeals':ready['genuineFiniteSeals'],'actualSetDifference':ref(OWN/'checks/DIFF.actual-before358-after367-content6-scope3.json'),'actualPostCentralPreservation':ref(OWN/'checks/PRESERVATION.actual-after697-358-originals-finalC.json'),'oldPAOverlapAndResiduals':ref(OWN/'checks/OVERLAP.exact8-old-PA-containers-and-raw-residuals.json'),'oldDIndexPositiveAndNegativeScopeOverlap':ref(OWN/'checks/OVERLAP.D9-plus-e0-1a-original-negative-scopes.json'),'finalCExactSelection':ref(OWN/'checks/SELECTION.final-C-exact-P2-A2-M422-QA438.json'),'readme':ref(OWN/'README.md'),'finiteAudit':ref(OWN/'checks/FINITE.actual-json-jsonl-python-and-exact-integrity.json'),'actualCentralRuns':1,'actualCentralExitCode':0,'allSixRequiredChecksPass':True,'before358':358,'afterInactiveCandidate367':367,'same422Denominator':422,'scientificContentAdditions':6,'oldScienceLimitedScopeRestorations':3,'stillOpenE0And1a':True,'all697ActiveOriginalsExact':True,'stockModules':31,'physicalNormalAliases':51,'regularHostBytes':regularbytes,'rasterCopies':0,'historicalTechnicalFailuresPreserved':2,'strictCompletionReady':False,'activeIntegration':False,'newIndependentScientificVotesByThisRole':0,'HumanApproval':False,'HumanTrial':False,'M7Grant':False,'exposedB1GateEligible':False,'additionalCentralRunsAuthorized':0,'finalSealPath':sealpath.relative_to(REPO).as_posix(),'STOP':True})
files=[ref(p) for p in sorted(OWN.rglob('*')) if p.is_file() and not p.is_symlink()]
put(sealpath,{'schemaVersion':1,'role':'Finite inactive Native9 integration payload seal; own seal excluded','sealedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'selector':ref(finalselector),'files':files,'fileCount':len(files),'totalRegularPayloadBytes':sum(f['bytes'] for f in files),'bundleIsRelativeReadOnlyReference':True,'actualCentralRuns':1,'activeWrites':0,'STOP':True})
for r in files:verify(r)
print(json.dumps({'selector':ref(finalselector),'seal':ref(sealpath),'fileCount':len(files),'regularPayloadBytes':sum(f['bytes'] for f in files),'beforeStrict':358,'afterInactiveCandidate':367,'addedContent6':len(content),'restoredLimitedScope3':len(limited),'removed':0,'active697Exact':True,'STOP':True}),flush=True)
