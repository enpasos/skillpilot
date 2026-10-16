# SPDX-License-Identifier: Apache-2.0
"""Post-render exact CAS and finite technical handoff; no additional stock execution."""
import ast,datetime,hashlib,json
from pathlib import Path
REPO=Path.cwd();OWN=Path(__file__).resolve().parents[1]
def load(p):return json.loads(p.read_text())
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(REPO).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(r):
 p=REPO/r['path'];a=ref(p);assert a['sha256']==r['sha256'] and ('bytes' not in r or a['bytes']==r['bytes']),p;return p
def put(p,v):
 assert not p.exists(),p;p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
outerseal=OWN/'FILES.finite-native4-technical-preparation.seal.json';assert not outerseal.exists()
science=OWN/'INPUTS.blind-native4-final-whole-scientific-sources-and-pages.selector.json';ss=OWN/'FILES.finite-final-native4-scientific-inputs.allowed.seal.json'
for r in load(ss)['files']+load(ss)['externalWholePrimaryPageTexts']:verify(r)
plan=load(OWN/'checks/INPUTS.no-render-stock-context.final-QA-ready.plan.technical.json');base=load(verify(plan['base367Selector']));oldseal=verify(plan['base367Seal'])
for r in load(oldseal)['files']:verify(r)
baseRoot=Path(base['actualPostCentralPreservation']['path']).parent.parent
protected=load(baseRoot/'checks/PROTECTED697.actual-phase1-before.json')
for r in protected['files']:verify(r)
cseal=load(verify(plan['genuineCSealTechnicalOnly']))
for r in cseal['files']:verify(r)
mpath=OWN/'checks/REBUILD.final-native4.minimal-exact-physical-map.json';mp=load(mpath);host=REPO/mp['executionHost']
for r in mp['stockPhysicalModules']:
 p=host/r['path'];assert not p.is_symlink() and p.read_bytes()==verify(r).read_bytes()
for r in mp['aliases']:
 p=host/r['normalHostAlias'];assert not p.is_symlink() and p.read_bytes()==verify(r['physicalRepositorySource']).read_bytes()
for r in mp['selectedCurrentAssetRows']:
 src=verify(r['physicalRepositorySource']);p=host/r['normalPublicDestination']
 if r['publicMustBePhysicalWithinHostPublicRoot']:assert not p.is_symlink() and p.read_bytes()==src.read_bytes()
 else:assert p.is_symlink() and p.resolve()==src.resolve()
assert list((host/'curricula/DE/Gymnasium/quality/goal-visualization-review').iterdir())==[]
old=load(verify(base['canonical']));new=load(verify(plan['canonical']));oldby={g['id']:g for g in old['goals']};newby={g['id']:g for g in new['goals']}
before=load(verify(base['actualCentralReport']))['subjects'][0];assert before['strictComplete']==367 and before['denominator']==422
assert len(oldby)==560 and list(oldby)==list(newby)
assert all(oldby[g]==newby[g] for g in before['strictCompleteGoalIds'])
assert all(oldby[g].get('requires',[])==newby[g].get('requires',[]) and oldby[g].get('contains',[])==newby[g].get('contains',[]) for g in oldby)
changed=[g for g in oldby if oldby[g]!=newby[g]];assert set(changed)==set(plan['descriptionChangeGoalIds'])
semantic=load(verify(plan['semantic']));current={r['goalId'] for r in semantic['decisions'] if r['semanticKind']=='curricularAtomic'};assert current==set(before['currentGoalIds']) and len(current)==422
sourceAuthor=OWN.parent/'chemie-equilibrium-four-source-scope-candidate-author-20261015-v1/NEUTRAL.finite-four-source-scope-candidate-author.selector.json';author=load(sourceAuthor)
corpus=load(verify(author['whole32CaseCorpusExact']));cases=corpus.get('cases',[]);casesby={r['id']:r for r in cases}
material=load(OWN/'inputs/eight-whole-DEEN-cases-four-scientific-profile-bodies.neutral.json');assert len(material['cases'])==8
for case in material['cases']:assert case==casesby[case['id']]
assert all(sum(c['goalId']==g for c in material['cases'])==2 for g in plan['targetGoalIds'])
scientific={json.loads(l)['goalId']:json.loads(l)['profile'] for l in verify(author['whole16ProfileCorpusExact']).read_text().splitlines()}
raws=[json.loads(l) for l in (OWN/'profiles/four-current-raw-E0G0.stock-bound.neutral.jsonl').read_text().splitlines()]
assert len(raws)==4 and all(r['profile']==scientific[r['goalId']] and r['evidenceLevel']=='E0' and r['maximumClaimScope']=='G0' and r['reviewRunIds']==[] for r in raws)
baseqa=load(verify(plan['baseQA']));finalqa=load(verify(plan['finalQA']));bq={r['goalId']:r for r in baseqa['records']};fq={r['goalId']:r for r in finalqa['records']};assert len(fq)==438 and bq.keys()==fq.keys() and set(g for g in bq if bq[g]!=fq[g])==set(plan['descriptionChangeGoalIds'])
receipts=[load(OWN/f'checks/NATIVE4.{mode}.command.actual.json') for mode in ['prepare','check']];assert all(r['exitCode']==0 and r['actualRunNumberForThisMode']==1 and '--write' not in r['argv'] for r in receipts)
pages=load(OWN/'checks/PAGES.actual-final-native4-pdf-to-png-and-text.json');assert pages['actualPhysicalPdfPages']==6 and pages['actualGoalPages']==4
for r in pages['rows']:verify(r['actualFullPagePng']);verify(r['actualExtractedText'])
diag=load(OWN/'checks/DIFF.actual-stock422-goal-page-contexts.no-render.json');pdiag=load(OWN/'checks/DIFF.actual-all392-selected-P-binding-scope-preservation.no-new-review.json')
assert len(diag['unchangedStockContextGoalIds'])==418 and pdiag['oldSelectedRows']==392 and len(pdiag['unchangedGoalIds'])==390
post={'schemaVersion':1,'role':'Actual bounded post-render integrity audit; no stock checker rerun, review, integration or new count','checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'old367FiniteSeal':ref(oldseal),'allOld367PayloadFilesExact':True,'all367PriorStrictGoalBodiesExact':True,'all697ProtectedActiveFilesExact':True,'all422CurrentIdsExact':True,'all560GoalIdsAndEdgesExact':True,'onlyTwoWholeGoalBodiesChanged':changed,'allEightWholeCasesEqualCurrent32CaseCorpus':True,'allFourWholeProfileBodiesEqualCurrent16BodyCorpus':True,'allFourRawProfilesE0G0NoRuns':True,'QA438Other436WholeObjectsExact':True,'whole422InMemoryDiffScope':'Four selected profile records only; other pages consistently omit profiles in both comparison variants. Actual392 selected P records separately checked with each original resource scope. No comparison with every historical rendered page is claimed.','actual422ContextsCompared':422,'unchanged418StudyContexts':418,'actual392OriginalPBindingsExact':True,'unchanged390PBindings':True,'sourceAndCourseSidecarsAbsentFromEffectiveNormalStockFields':True,'sourceOrCourseOrSourceAtlasRegistrationApplied':False,'sourceOnlyV2AndFinalScienceAllowlistExact':True,'actualPrepareRuns':1,'actualCheckRuns':1,'actualNativeExitCodes':[0,0],'actualPhysicalPdfPages':6,'actualGoalPagesAndRasterExports':4,'stockModulesExact':31,'physicalJsonAliasesExact':3,'physicalSelectedImageCopies':4,'other431PublicImagesReferencedOnly':True,'centralRuns':0,'newD_P_A_M_VVotes':0,'activeRegistryLedgerRuntimeGitWrites':0,'HumanApproval':False,'M7Grant':False}
put(OWN/'checks/FINAL.actual-post-render-CAS-and-limited-read-scope.json',post)
readme='''# Native4 – finale inaktive technische Vorbereitung

Maßgebliche wissenschaftliche Eingabe ist `INPUTS.blind-native4-final-whole-scientific-sources-and-pages.selector.json` mit eigenem endlichem Allowlist-Seal. Sie enthält endgültige a142/c443-Ziele, Quellen/ganze Fälle/Profilkörper und die tatsächlich erzeugten vier Native-Zielseiten. Beide normalen A/B-Campaigns, ganze DE/EN-Inputs und Batchcontracts sind ausdrücklich verlinkt. Keine Peer-/C-Urteile oder Autoren-FIRSTs sind als wissenschaftliche Leseinputs ausgewählt. Technische Dateien außerhalb dieser Allowlist sind kein Auftrag an unabhängige Leser.

Unveränderter Stock-Prepare und Check wurden nach finaler C-QA-Bereitschaft jeweils genau einmal ohne `--write` ausgeführt: beide exit0. Ergebnis: vier Zielseiten, sechs physische PDF-Seiten und vier echte PDF-Seitenexporte als PNG. Alle vier tatsächlichen PNG-Seiten wurden technisch auf Bild-/Textpräsenz angesehen; dies ist kein neues wissenschaftliches V-Review. Kein weiterer Nativebuild/Check wurde ausgeführt.

Der frische private Host enthält31 exakte Stockmodule, drei physische normale JSON-Aliase, vier für den unveränderten Renderer erforderliche physische Rasterkopien (6,642,770B) und431 weitere öffentliche Originalreferenzen. Die bestehende gepinnte leere Legacy-Markdown-Discovery ist im Map und im readonly Rebuildhelper explizit fixiert; tatsächliche Repositoryhistorie bleibt unverändert. Der Rebuildhelper erzeugt ausschließlich einen noch nicht vorhandenen ignorierten Host und führt weder Renderer noch Reviews oder Central aus.

Die vorangehende reine Stock-Kontextdiagnose erzeugte alle422 Seiten im Speicher mit genau den vier relevanten Profilen. Nur a8/f0 ändern die fachlichen Ziel-/Seitenkörper; e0/1a erhalten zusätzlich rohe E0/G0-Metadaten. Die anderen418 Studienkontexte bleiben gleich. Für die tatsächlichen392 ausgewählten alten P-Records wurden die Stockfingerprintfunktionen zusätzlich unter den jeweils originalen ResourceScopes aufgerufen: alle392 alten Bindungen exakt, nur a8/f0 unter dem finalen Kandidaten verändert,390 unverändert. Dies behauptet keinen Abgleich jeder historischen PDF-Seite oder eine neue fachliche Freigabe.

Ehrlich erhaltene private Diagnosefehler vor dem Nativeprepare: ein unbeteiligter heterogener P-ResourceScope im anfänglichen All392-GoalBook-Profilinput, fehlende öffentliche Assetreferenzen beim zu engen Vier-Asset-Diagnosehost, ein unzulässiger Großbuchstabe im technischen ReviewId und ein nicht vorhandenes `url`-Feld im ursprünglichen physischen Assetmap. Diese Fehler wurden gezielt korrigiert; ursprüngliche Fehlertexte/Receipts und ungültige kleine Rohsamples bleiben nachvollziehbar. Keine Schema-/Qualitätsgrenze, Originalreviewzeile oder positive Freigabe wurde verändert. Große ausschließlich selbst erzeugte unversiegelte All392-Diagnoseduplikate wurden mit eigenem Hash-/Quellnachweis entfernt. Die normale erste Native4-Prepare-/Check-Ausführung war erfolgreich.

Die vorläufige Source-only-v2-Auswahl ergänzt acht tatsächliche BY13-Partner außerhalb des übernommenen70er-Kontexts; sämtliche44 verschiedenen Partner der76 ausgewählten vorhandenen Kanten liegen nun als ganze aktuelle Körper vor. Die acht Autorenkomponenten und LK-Deklarationen bleiben ungeprüfte zusätzliche Leseinputs. Die Stock-D-Felder transportieren diese externen Deklarationen nicht automatisch. Sie wurden nicht als offizielle M3-Entscheidungen, aktive SourceAtlas-Komponenten, Kursfreigabe oder optionales Runtimefeature registriert. Das normale nationale und HE-LK-Zieluniversum enthält weiterhin alle vier; der bestehende BY-/HE-LK-SourceAtlas enthält sie nicht. Der ganze HE2027-Chemie-Primärtext stammt unmittelbar aus dem amtlichen PDF, nicht aus einem Autoren-FIRST.

Nachher-CAS: altes367-Siegel samt allen Nutzdateien exakt, alle367 bisherigen vollständigen Zielkörper exakt, alle697 geschützten aktiven Dateien exakt, dieselben422 IDs sowie alle560 IDs/Kanten. Acht ganze Fälle und vier ganze wissenschaftliche Profilkörper stimmen mit den vorhandenen aktuellen Korpora überein. Rohprofile bleiben E0/G0. C-QA438 wurde exakt ausgewählt;436 andere QA-Objekte stimmen mit367 überein. Kein neuer Zentralbericht, keine Integration, kein D/P/A/M/V-Votum dieser Rolle, keine Git-/Aktivänderung, keine Human-/M7-Freigabe. WAIT/STOP nach Versiegelung; zwei tatsächliche unabhängige D4-Rollen bleiben ein eigener Schritt.
'''
(OWN/'README.technical-only.md').write_text(readme)
stats={'json':0,'jsonl':0,'jsonlRows':0,'pythonAST':0}
for p in sorted(OWN.rglob('*')):
 if p.is_symlink() or not p.is_file():continue
 if p.suffix=='.json':load(p);stats['json']+=1
 elif p.suffix=='.jsonl':
  rows=[json.loads(l) for l in p.read_text().splitlines() if l.strip()];stats['jsonl']+=1;stats['jsonlRows']+=len(rows)
 elif p.suffix=='.py':ast.parse(p.read_text());stats['pythonAST']+=1
put(OWN/'checks/FINITE.actual-bounded-json-jsonl-python-integrity.json',{'role':'Own finite payload parsing only, no global/fullschema/stock rerun','stats':stats,'allSelectedScientificAllowlistHashesExact':True,'old367And697Exact':True,'nativePrepareRuns':1,'nativeCheckRuns':1,'centralRuns':0,'newVotes':0})
out=OWN/'OUTPUTS.finite-native4-technical-handoff.final-selector.json'
put(out,{'schemaVersion':1,'role':'Finite inactive technical Native4 preparation; scientific neutral input separate from technical provenance','neutralScientificSelector':ref(science),'neutralScientificSeal':ref(ss),'sourceOnlyCompletePartnerSelector':ref(OWN/'NEUTRAL.preliminary-source-only-four-final-a142-c443-complete-union-partners.v2.selector.json'),'canonical':plan['canonical'],'semantic':plan['semantic'],'actualNativeBatchManifest':ref(OWN/'native-four/batch-manifest.json'),'actualNativeConfig':ref(OWN/'config/native4.final-once.normal-prepare.config.json'),'actualPrepareReceipt':ref(OWN/'checks/NATIVE4.prepare.command.actual.json'),'actualCheckReceipt':ref(OWN/'checks/NATIVE4.check.command.actual.json'),'actualPageExports':ref(OWN/'checks/PAGES.actual-final-native4-pdf-to-png-and-text.json'),'finalExactHostMap':ref(mpath),'readonlyRebuildHelper':ref(OWN/'scripts/rebuild_final_native4_host_readonly.py'),'actual422ContextDiff':ref(OWN/'checks/DIFF.actual-stock422-goal-page-contexts.no-render.json'),'actual392SelectedPBindingsDiff':ref(OWN/'checks/DIFF.actual-all392-selected-P-binding-scope-preservation.no-new-review.json'),'actualAbsenceOfSourceSidecarFields':ref(OWN/'checks/ABSENCE.authored-source-and-LK-declaration-in-normal-stock-D-context.json'),'postRenderCAS':ref(OWN/'checks/FINAL.actual-post-render-CAS-and-limited-read-scope.json'),'boundedFiniteAudit':ref(OWN/'checks/FINITE.actual-bounded-json-jsonl-python-integrity.json'),'technicalReadme':ref(OWN/'README.technical-only.md'),'finalQATechnicalReferenceOnly':plan['finalQA'],'genuineCSelectorTechnicalReferenceOnly':plan['genuineCSelectorTechnicalOnly'],'genuineCSealTechnicalReferenceOnly':plan['genuineCSealTechnicalOnly'],'old367SealExact':ref(oldseal),'all697ProtectedActiveFilesExact':True,'all367PriorStrictGoalBodiesExact':True,'all422IdsExact':True,'actualPrepareRuns':1,'actualCheckRuns':1,'actualExitCodes':[0,0],'actualGoalPages':4,'actualPhysicalPdfPages':6,'rawScientificProfiles':4,'wholeCases':8,'newScientificVotes':0,'D4Claims':0,'sourceOrCourseOrSourceAtlasRegistrationApplied':False,'centralRuns':0,'activeWrites':0,'GitWrites':0,'HumanApproval':False,'M7Grant':False,'finalTechnicalSealPath':outerseal.relative_to(REPO).as_posix(),'WAIT_STOP':True})
files=[ref(p) for p in sorted(OWN.rglob('*')) if p.is_file() and not p.is_symlink()]
put(outerseal,{'schemaVersion':1,'role':'Finite technical preparation payload seal, scientific reader allowlist remains distinct','sealedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'technicalSelector':ref(out),'neutralScientificSelector':ref(science),'files':files,'fileCount':len(files),'totalBytes':sum(f['bytes'] for f in files),'actualPrepareRuns':1,'actualCheckRuns':1,'centralRuns':0,'activeWrites':0,'WAIT_STOP':True})
for r in files:verify(r)
print(json.dumps({'technicalSelector':ref(out),'technicalSeal':ref(outerseal),'neutralScientificSelector':ref(science),'neutralScientificSeal':ref(ss),'files':len(files),'bytes':sum(f['bytes'] for f in files),'all697And367Exact':True,'WAIT_STOP':True}),flush=True)
