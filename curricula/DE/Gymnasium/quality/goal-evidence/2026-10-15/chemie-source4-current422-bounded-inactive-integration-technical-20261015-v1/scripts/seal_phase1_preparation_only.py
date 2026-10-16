# SPDX-License-Identifier: Apache-2.0
"""Finite immutable phase1 preparation, not final integration or scientific approval."""
import ast,datetime,hashlib,json
from pathlib import Path
REPO=Path.cwd();OWN=Path(__file__).resolve().parents[1];E=OWN.parent;BASE=E/'chemie-native9-current422-bounded-inactive-integration-technical-20261015-v1'
def load(p):return json.loads(p.read_text())
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(REPO).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(r):
 p=REPO/r['path'];a=ref(p);assert a['sha256']==r['sha256'] and ('bytes' not in r or a['bytes']==r['bytes']);return p
def put(p,v):
 assert not p.exists(),p;p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
seal=OWN/'FILES.finite-phase1-preparation-only.seal.json';assert not seal.exists()
selection=OWN/'candidate/PREPARED.exact-current422-selection.awaiting-genuine-B-and-ROOTREADY.json';s=load(selection);assert not s['ROOTREADY'] and not s['centralAllowed'] and s['newD4ResolutionIndex'] is None and s['genuineBSource4Selector'] is None
for r in load(OWN/'checks/ORIGINAL.all-selected-source-bindings.before.json')['files']:verify(r)
for r in load(BASE/'FILES.finite-native9-current422-inactive-integration.seal.json')['files']:verify(r)
protection=load(OWN/'checks/PROTECTED697.actual-before-phase1.json')
for r in protection['files']:verify(r)
mpath=OWN/'checks/REBUILD.phase1.final-current-aliases.reference-only-assets.physical-map.json';mp=load(mpath);host=REPO/mp['executionHost']
for r in mp['stockPhysicalModules']:
 p=host/r['path'];assert not p.is_symlink() and p.read_bytes()==verify(r).read_bytes()
for r in mp['aliases']:
 p=host/r['normalHostAlias'];assert p.read_bytes()==verify(r['physicalRepositorySource']).read_bytes()
 if r['physicalWithinHost']:assert not p.is_symlink()
for r in mp['selectedCurrentAssetRows']+mp['legacyBaselineAssetReferences']:
 src=verify(r['physicalRepositorySource'])
 for key in ['normalPublicDestination','normalCanonicalDestination']:
  p=host/r[key];assert p.read_bytes()==src.read_bytes()
  if key=='normalPublicDestination':assert p.is_symlink()
assert list((host/'curricula/DE/Gymnasium/quality/goal-visualization-review').iterdir())==[]
regular=sum(p.stat().st_size for p in host.rglob('*') if p.is_file() and not p.is_symlink());assert regular==4032724
base=load(BASE/'OUTPUTS.finite-native9-current422-inactive-integration.final-selector.json');report=load(verify(base['actualCentralReport']))['subjects'][0]
old={g['id']:g for g in load(verify(base['canonical']))['goals']};new={g['id']:g for g in load(verify(s['canonical']))['goals']}
assert report['strictComplete']==367 and len(report['currentGoalIds'])==422 and len(old)==len(new)==560
assert list(old)==list(new) and all(old[g]==new[g] for g in report['strictCompleteGoalIds'])
assert all(old[g].get('requires',[])==new[g].get('requires',[]) and old[g].get('contains',[])==new[g].get('contains',[]) for g in old)
currentids={r['goalId'] for r in load(verify(s['semantic']))['decisions'] if r['semanticKind']=='curricularAtomic'};assert currentids==set(report['currentGoalIds'])
C=E/'chemie-equilibrium-kpkc-pourbaix-two-wording-current422-informed-P2-A2-M2-V2-20261015-v1';c=load(C/'SELECTION.final-current-Kp-Pourbaix-informed-P2-A2-M2-V2.json')
def rawby(p):return {json.loads(l)['goalId']:l for l in p.read_bytes().splitlines(keepends=True) if l.strip()}
om=rawby(verify(c['M2']['baseline']));nm=rawby(verify(s['memory422ExactOriginal']));assert om.keys()==nm.keys() and len(nm)==422 and set(g for g in om if om[g]!=nm[g])==set(c['goalIds'])
oq={r['goalId']:r for r in load(verify(c['V2']['baseline']))['records']};nq={r['goalId']:r for r in load(verify(s['visualizationQA438ExactOriginal']))['records']};assert oq.keys()==nq.keys() and len(nq)==438 and set(g for g in oq if oq[g]!=nq[g])==set(c['goalIds'])
preflight=load(OWN/'checks/PREFLIGHT.phase1-five-affected-actual-checks.json');assert len(preflight['results'])==5 and all(r['exitCode']==0 for r in preflight['results'])
for cfg in [OWN/'config/P2.genuine-informed-C.normal-address-only.config.json',OWN/'config/A2.genuine-informed-C.normal-address-only.config.json']:
 q=load(cfg);kind=cfg.name[0];assert verify(c[kind+'2']['records']).read_bytes()==(REPO/q['reviewPath']).read_bytes()
 if kind=='P':assert q['reviewRunManifestPaths']==load(verify(c['P2']['config']))['reviewRunManifestPaths']
put(OWN/'checks/PRESERVATION.phase1-post-checks-367-697-and-current-C-exact.json',{'role':'Actual bounded phase1 postcheck CAS, not new count','old367SealAndAll142PayloadFilesExact':True,'all367StrictGoalIdsAndWholeBodiesPreserved':True,'all697ProtectedActiveFilesExact':True,'all422AuthoritativeCurrentIdsExact':True,'all560IdsAndEdgesExact':True,'other390PAnd398AWholeRecordsExact':True,'other420MRawLinesExact':True,'other436QaWholeObjectsExact':True,'CWholeP2A2RecordsAndOriginalPRunExact':True,'genuineA4OriginalsExact':True,'oldD9AndAllOtherIndexRowsExact':True,'emptyLegacyDiscoveryExplicit':True,'normalDataAliases':51,'physicalDataAliases':3,'stockModules':31,'physicalRegularHostBytes':regular,'physicalRasterCopies':0,'actualAffectedChecks':5,'actualAffectedCheckExitCodes':[0]*5,'M422COriginalStockCheckReusedNoNewMVote':c['M2']['stockExitCode']==0,'ROOTREADY':False,'BPending':True,'newD4ResolutionChecks':0,'centralRuns':0,'nativeBuilds':0,'newD_P_A_M_VVotes':0,'activeWrites':0,'GitWrites':0})
readme='''# Source4 – begrenzte inaktive Integrationsvorbereitung auf367

**Nur Phase1, keine D4-Paarung und kein Zentralbericht.** Eigenständiges B ist noch kein gewählter Input; sein Ergebnis wird nicht vorweggenommen. ROOTREADY fehlt. Der vorbereitete Kandidat ist eine Auswahlvorlage und keine ausführbare finale Centralkonfiguration.

Aktuelle Basis: a142/c443, echte aktuelle C-P2/A2 sowie genau C-M422 `fa34d4de…` und C-QA438 `c9cc9c5c…`. P2/A2 ersetzen ausschließlich die alten ausgewählten Bindungen von a8/f0. Je ein alter P-/A-Container wird auf unveränderte ganze Rohzeilen reduziert; alle anderen390 P- und398 A-Zeilen sowie ursprüngliche Kriterien, ResourceScopes und originale P-Runbindungen bleiben exakt. Die400 ausgewählten A-Rohzeilen sind keine Behauptung400 gültiger atomarer Freigaben. Neue ganze C-P2/A2-Records sind bytegleiche Originalkopien mit unveränderter ursprünglicher Runbindung; die lokalen Konfigurationen ändern nur Dateiadressen.

Genau vier betroffene normale P/A-Prüfungen plus einmal QA438-Stockfrischecheck wurden erfolgreich ausgeführt. Keine QA-Neugenerierung. Der echte vorhandene C-M422-Check wird als Originalnachweis referenziert; hier wird kein weiteres M-Votum erfunden.420 andere M-Rohzeilen und436 andere QA-Objekte sind nach tatsächlichem Vergleich gleich.

Vier künftige D4-Ziele: a8/f0 besitzen geänderte ganze Beschreibungen und a8 eine geänderte Bild-/Standardzustandsdarstellung; e0/1a behalten ihre Ziele/Fälle/Profilkörper/Bilder und benötigen unabhängige Bewertung des zusätzlichen Quellen-/Kursdeklarationskontexts. Diese beiden sind keine Wiederherstellung eines aktuell vorhandenen positiven D-Claims. Keines der vier Ziele besitzt in den87 ausgewählten alten D-Indizes einen positiven aktuellen Claim. Historische negative/Deferralzeilen bleiben mit ihren ganzen Originalrunden erhalten. Alte D9 und alle anderen Indizes, Supersessions und Withdrawals bleiben unverändert. Erst nach finit gelieferten echten B-FIRST-/Normaloriginalen und Rootfreigabe darf die originale A/B-D4-Paarung erfolgen; ein optionales `deferredGoals`-Feld wird nur bei einer nichtleeren Liste geschrieben.

Die acht Autorenquellenkomponenten und die LK-Deklaration bleiben ungeprüfte zusätzliche Inputs. Sie werden nicht als amtliche M3-Entscheidungen, SourceAtlas-Registrierung, Kursfreigabe oder optionale Runtimefunktion übernommen. Eine spätere maschinelle D-/Strict-Auswertung ersetzt diese Quellen-/Kursgrenzen nicht.

Minimaler frischer ignorierter Host:31 exakte physische Stockmodule,51 exakt gebundene Datenaliase (nur drei JSON-Dateien physisch; übrige Originalreferenzen),4,032,724 reguläre Bytes und keine Rasterkopien. Die bestehende gepinnte leere Legacy-Markdown-Discovery aus367 ist im Hostmap und im readonly Rebuildhelper explizit fixiert; die heutige Repositoryhistorie wird nicht als andere Eingabe eingelesen. Rebuildhelper führt keine Renderer/Checks/Central aus.

Nachher-CAS: alter367-Root mit allen142 Nutzdateien und Siegel exakt; alle367 bisherigen vollständigen Zielkörper, dieselben422 IDs, alle560 IDs/Kanten und697 geschützte aktive Dateien exakt. Keine neue Strictzahl, keine Integration, keine neuen wissenschaftlichen D/P/A/M/V-Voten, keine Aktiv-/Runtime-/Gitänderung und keine Human-/M7-Freigabe. Native4 und seine vier echten Zielseiten bleiben unverändert und werden nicht neu erzeugt.

Der Phase1-Selector und sein Seal schließen genau diesen Vorbereitungsstand ab. Später autorisierte Folgearbeit kann neue Dateien ergänzen; alle hier versiegelten Bytes bleiben unverändert.
'''
(OWN/'README.phase1-preparation-only.md').write_text(readme)
stats={'jsonFiles':0,'jsonlFiles':0,'jsonlRows':0,'pythonAST':0}
for p in sorted(OWN.rglob('*')):
 if p.is_symlink() or not p.is_file():continue
 if p.suffix=='.json':load(p);stats['jsonFiles']+=1
 elif p.suffix=='.jsonl':
  rs=[json.loads(l) for l in p.read_text().splitlines() if l.strip()];stats['jsonlFiles']+=1;stats['jsonlRows']+=len(rs)
 elif p.suffix=='.py':ast.parse(p.read_text());stats['pythonAST']+=1
put(OWN/'checks/FINITE.phase1-bounded-parse-integrity.actual.json',{'role':'Own finite files only; no fullschema/global build','stats':stats,'old367AndProtected697Exact':True,'centralRuns':0,'ROOTREADY':False})
selector=OWN/'OUTPUTS.finite-phase1-preparation-only.selector.json'
put(selector,{'schemaVersion':1,'role':'Finite phase1 bounded inactive source4 integration preparation only','preparedSelection':ref(selection),'exactOverlapResidualAndRowProof':ref(OWN/'checks/PHASE1.exact-selection-and-raw-preservation.json'),'originalBindingsInventory':ref(OWN/'checks/ORIGINAL.all-selected-source-bindings.before.json'),'hostMap':ref(mpath),'readonlyHostBuilder':ref(OWN/'scripts/rebuild_phase1_current_alias_host_readonly.py'),'actualFiveAffectedChecks':ref(OWN/'checks/PREFLIGHT.phase1-five-affected-actual-checks.json'),'postCheckPreservation':ref(OWN/'checks/PRESERVATION.phase1-post-checks-367-697-and-current-C-exact.json'),'genuineA4ReferenceOnly':ref(OWN/'checks/D4.original-A-and-existing-index-reference-only.no-pair.json'),'README':ref(OWN/'README.phase1-preparation-only.md'),'finiteAudit':ref(OWN/'checks/FINITE.phase1-bounded-parse-integrity.actual.json'),'canonical':s['canonical'],'semantic':s['semantic'],'currentM422':s['memory422ExactOriginal'],'currentQA438':s['visualizationQA438ExactOriginal'],'old367AndAll142PayloadFilesExact':True,'all697ProtectedActiveFilesExact':True,'all367PriorStrictWholeGoalBodiesExact':True,'same422Ids':True,'P2A2ReplacedIdsOnly':c['goalIds'],'selectedPWholeRows':392,'selectedAWholeRows':400,'otherWholeRowsExact':{'P':390,'A':398,'M':420,'QA':436},'rasterCopies':0,'physicalRegularHostBytes':regular,'BPending':True,'ROOTREADY':False,'centralRuns':0,'newD4ResolutionChecks':0,'nativeBuilds':0,'newScienceVotes':0,'sourceMapOrCourseRegistrationApplied':False,'activeWrites':0,'HumanApproval':False,'M7Grant':False,'phase1SealPath':seal.relative_to(REPO).as_posix(),'WAIT_STOP':True})
rows=[ref(p) for p in sorted(OWN.rglob('*')) if p.is_file() and not p.is_symlink()]
put(seal,{'schemaVersion':1,'role':'Finite immutable phase1 payload; no D4/Central authority','sealedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'selector':ref(selector),'files':rows,'fileCount':len(rows),'totalBytes':sum(r['bytes'] for r in rows),'BPending':True,'ROOTREADY':False,'centralRuns':0,'WAIT_STOP':True})
for r in rows:verify(r)
print(json.dumps({'selector':ref(selector),'seal':ref(seal),'files':len(rows),'bytes':sum(r['bytes'] for r in rows),'physicalRegularHostBytes':regular,'rasterCopies':0,'BPending':True,'centralRuns':0,'WAIT_STOP':True}))
