#!/usr/bin/env python3
"""Package exactly twenty privately reviewed origin removals and their finite source bridge."""
import copy,datetime,difflib,gzip,hashlib,json,pathlib
R=pathlib.Path('/home/enpasos/projects/skillpilot');W=pathlib.Path('/dev/shm/math-g17-first-bW32dz');P=pathlib.Path(__file__).resolve().parent
H=lambda b:hashlib.sha256(b).hexdigest()
def dump(name,obj):
    b=(json.dumps(obj,ensure_ascii=False,indent=2)+'\n').encode()
    (P/name).write_bytes(gzip.compress(b,mtime=0) if name.endswith('.gz') else b)
def j(path):return json.loads(path.read_bytes())
i=j(W/'inspection.json');core=j(W/'core-checks.json');rel='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
before=(R/rel).read_bytes();after=(W/'after.json').read_bytes();assert H(before)==i['sourceSha256'];assert H(after)==i['afterSourceSha256']
b=j(R/rel);a=j(W/'after.json');bg={g['id']:g for g in b['goals']};ag={g['id']:g for g in a['goals']};selected={x['id'] for x in i['candidates']};assert len(selected)==20
for k in b:
    if k!='goals':assert b[k]==a[k]
assert list(bg)==list(ag)
for id,g in bg.items():
    expected=copy.deepcopy(g)
    if id in selected:
        assert not g.get('contains');assert g['requires'].count(i['intro'])==1
        expected['requires']=[x for x in g['requires'] if x!=i['intro']]
    assert expected==ag[id]
reasons={
 '304111dd':'Matrizenprodukte benötigen das Lokalisieren von Einträgen und das Verstehen von Zeilen/Spalten für Dimensionen und Reihenfolge. Diese fachlichen Forderungen bleiben. Der motivierende Überblick fügt dazu keine weitere Rechen- oder Deutungsleistung hinzu.',
 '4fb40e58':'Die skalare Multiplikation wirkt auf jeden Eintrag. Das sichere Lesen der Einträge und die vorhandene tabellarische Vorbereitung bleiben bestehen; ein zweiter direkter Relevanzüberblick ist keine weitere fachliche Voraussetzung.',
 '6ebdc8cc':'Addition/Subtraktion gleich großer Matrizen verlangt die korrekte Zuordnung entsprechender Einträge. Dieser Zugang und alle übrigen bisherigen Inhaltsanforderungen bleiben. Der Introtext liefert dafür keine zusätzliche Kenntnis.',
 '6f09c97e':'Für Matrix-Vektor-Produkte müssen Zeilen/Spalten und der Zustandsvektor korrekt gelesen werden. Die vorhandenen sachlichen Voraussetzungen werden nicht gekürzt. Der Orientierungsanker enthält weder Produktregel noch Zustandsinterpretation.',
 '5e893892':'Zustands-/Übergangsgraphen werden im bestehenden tabellarischen Zugang beschrieben. Die Eintrags- und Tupelvorbereitung bleibt vollständig. Orientierung über Mathematik liefert weder eine zusätzliche Übergangsregel noch eine eigene Modellleistung; eine allgemeine Notwendigkeit von Tabellenkalkulation wird hier nicht neu behauptet.',
 '14af09c2':'Zielgerichteter Werkzeugeinsatz verlangt richtige Eingaben, passende Funktionen/Einstellungen und die bereits geforderten Darstellungs-/Anwendbarkeitskontrollen. Alle drei Inhaltsvoraussetzungen bleiben. Der Introtext beschreibt allgemeine Relevanz und ist kein Bedienungs- oder Mathematikvertrag.',
 '879f9c84':'Darstellungsparameter müssen zum mathematischen Objekt und zur Interpretation des Ergebnisses passen. Ergebnisrückübersetzung und Term-Graph-Zugang bleiben. Der direkte Motivationsverweis enthält keine zusätzliche Einstellungskompetenz.',
 'dabff49b':'Unabhängigkeit wird über bedingte und gemeinsame Wahrscheinlichkeiten erkannt und berechnet. Genau diese Begriffsunterscheidung bleibt direkte Vorbereitung. Der Introtext enthält keine zusätzliche Regel für Unabhängigkeit.',
 '3e974075':'Die Bewertung von Basisraten und bedingten Datenaussagen benötigt die korrekte Unterscheidung bedingter und gemeinsamer Wahrscheinlichkeiten. Diese Voraussetzung bleibt, ohne sie als hinreichende Gesamtdeckung der anspruchsvollen Kritikaufgabe auszugeben. Motivation ersetzt oder ergänzt keine weitere statistische Prüfung.',
 '5927ca6a':'Zufallsgrößen sind Zuordnungen; Tabellen und Diagramme stellen die Verteilung dar. Der vorhandene Funktions-/Darstellungsbegriff bleibt als fachlicher Zugang erhalten. Der allgemeine Relevanzanker enthält keine zusätzliche Zuordnungsleistung.',
 'd711bc18':'Das Einführen einer Zufallsgröße als Zuordnung von Ergebnissen zu Zahlen nutzt den vorhandenen Zuordnungsbegriff. Diese Vorbereitung bleibt. Ein weiterer direkter Motivationsverweis liefert keine mathematische Definition.',
 'da95ab35':'Die Wahl und Beschreibung eines diskreten Zufallsgrößenmodells nutzt Zuordnungen und Darstellungen. Der entsprechende fachliche Zugang bleibt; die Orientierung fügt keine Modellbedingung oder zusätzliche Verteilungskompetenz hinzu.',
 'f14e1643':'Die Testargumentation, binomialen Kenngrößen und der Funktions-/Parameterbezug bleiben sämtlich erhalten. Sie tragen die Formulierung von H0/H1 zum Parameter p; der Introtext enthält keine zusätzliche Testregel. Der kurze Zeugenpfad allein wird nicht als vollständige Vorbereitung behauptet.',
 'bbef7cf2':'Bogenmaß und periodische Prozesse tragen das Verständnis der Koordinatenverläufe einer Kreisbewegung. Diese konkrete Vorbereitung bleibt direkt erhalten. Der Motivationsüberblick ist keine zusätzliche Sinus-/Kosinusvoraussetzung.',
 'be0e8715':'Die geometrische Deutung von Orts-, Richtungs- und Verschiebungsvektoren baut auf Eintragen/Ablesen im Raum auf. Diese Voraussetzung bleibt. Der Introtext enthält keine zusätzliche Koordinaten- oder Vektorrechnung.',
 '69243680':'Die vorhandene räumliche Vektordeutung bleibt als Zugang zum Prüfen geometrischer Linearität erhalten und führt weiterhin über Koordinatisierung zum Intro. Keine Forderung zu Vektoroperationen wird hier gelöscht oder neu als vollständig beurteilt; entfernt wird nur der zusätzliche Relevanzverweis.',
 '91e2f564':'Parameter im Kontext zu interpretieren und ihren Einfluss zu untersuchen knüpft an die vorhandene Bestimmung aus Kontextbedingungen an. Diese direkte Voraussetzung bleibt. Der Introtext liefert keine weitere Parameterbedingung.',
 '121ef4c5':'Nachvollziehbares Erklären benötigt die im aktuellen Vertrag verlangte Prüfung des Ergebnisses und strukturierte Aussagen. Beide sachlichen Forderungen bleiben. Der allgemeine Mathematiküberblick fügt keine eigene Erklär- oder Begründungsleistung hinzu; seine Wiederholung ist didaktisch nicht erforderlich.',
 'dbc13bb0':'Die Erklärung des Umkehrgraphen setzt die untersuchte Umkehrbarkeit und die Bestimmung einer Umkehrfunktion voraus. Diese direkte Vorbereitung bleibt. Motivation enthält weder Koordinatentausch noch einen zusätzlichen Spiegelungsschritt.',
 'c72a8032':'Logarithmus-/Exponentialwissen und der bestehende Modellierungszugang bleiben vollständig erhalten. Der Introtext liefert keine weitere Analyse- oder Begründungsregel. Die konservativ gehaltene bf17-Intro-Kante bleibt gerade für dessen GK-Scope bestehen; ihre Entfernung wird hier nicht mitgezogen.'}
matrix=[]
for n,c in enumerate(i['candidates'],1):
    id=c['id'];g=bg[id];remaining=ag[id]['requires']
    matrix.append({'number':n,'sourceGoalId':id,'removedPrerequisiteId':i['intro'],
       'decision':'SUPPORT_ONLY_THIS_EXACT_ORIENTATION_DUPLICATE_REMOVAL_PENDING_INDEPENDENT_REVIEW',
       'fullSourceBefore':g,'fullSourceAfter':ag[id],'fullRemovedPrerequisite':bg[i['intro']],
       'fullRemainingDirectPrerequisites':[bg[x] for x in remaining],
       'individualNativeWitness':c['originalAudit'],
       'actualPathAfterAll20Removals':c['afterJointRemovalPath'],
       'fullJointPathGoals':[bg[x] for x in c['afterJointRemovalPath']],
       'fachlicheBewertung':reasons[id[:8]],
       'commonLimit':'The actual removed text explicitly requires/tests no subject detail. No content prerequisite is removed, and no review of all surviving prerequisites or official-source coverage is claimed.',
       'goalHasNoContainsChildren':True})
joint=j(W/'joint-native-witnesses.json');assert len(joint)==20
for row in matrix:row['nativeJointOriginWitness']=next(x for x in joint if x['sourceGoalId']==row['sourceGoalId'])
dump('edge-review-matrix.json.gz',matrix)
(P/'candidate.patch').write_text(''.join(difflib.unified_diff(before.decode().splitlines(True),after.decode().splitlines(True),fromfile='a/'+rel,tofile='b/'+rel,n=3)))
(P/'after-source.json.gz').write_bytes(gzip.compress(after,mtime=0))
dump('native-core-checks.json',core);dump('native-scope-checks.json.gz',i)
dump('native-baseline-view-compilation.json.gz',j(W/'native-baseline-view-compilation.json'))
for name in ['strict-before.json.gz','strict-after.json.gz','auditor-test.stdout','auditor-test.stderr','core.stdout','core.stderr','app-before.stdout','app-before.stderr','app-after.stdout','app-after.stderr','final-scope.stdout','final-scope.stderr','joint-witnesses.stdout','joint-witnesses.stderr']:
    (P/name).write_bytes((W/name).read_bytes())
app1=j(W/'app-before.json');app2=j(W/'app-after.json');assert app1['reports']==app2['reports'];assert i['compiledApplicabilityAll21Unchanged'];assert not i['missing']
dump('applicability-equality.json',{'beforeSourceSha256':i['sourceSha256'],'afterSourceSha256':i['afterSourceSha256'],
 'reports':21,'goals':6524,'fullGoalApplicabilityAndFindingRowsEqual':True,
 'beforeCanonicalReportsSha256':H(json.dumps(app1['reports'],ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()),
 'afterCanonicalReportsSha256':H(json.dumps(app2['reports'],ensure_ascii=False,sort_keys=True,separators=(',',':')).encode())})
dump('held-cases.json',[
 {'id':'ce198bc9-b014-52ba-814f-25cc3e020668','decision':'NO_NEW_CHANGE_ALREADY_ABSENT','fullGoal':bg['ce198bc9-b014-52ba-814f-25cc3e020668'],'reason':'Old2026-11-06 report contained an Intro finding; current goal has no such direct requirement. No progress credit.'},
 {'id':'508292f2-671b-4fd3-acbf-53d705e44693','decision':'KEEP_NONREDUNDANT_ORIGIN','fullGoal':bg['508292f2-671b-4fd3-acbf-53d705e44693'],'reason':'Fresh native audit does not report this origin redundant; exploratory assertion correctly failed. Retained as a carrier, no automatic Intro deletion.'},
 {'id':'bf17cada-3ccd-5d9a-b9e3-42065cfdbb01','decision':'KEEP_ACTUAL_SCOPE_COUNTEREXAMPLE','fullGoal':bg['bf17cada-3ccd-5d9a-b9e3-42065cfdbb01'],'actualCounterexample':j(W/'held-scope-counterexample.json'),'reason':'Global reachability survives, but DE-BW-GK target/available projection loses the path because carrier91e2 is not available. Ordinary scopes are not widened.'},
 {'id':'c2831918-26f1-421e-90fb-ce707689594e','decision':'KEEP_FIRST_BATCH_NARROW_AND_58_GOALS_UNCHANGED','fullGoal':bg['c2831918-26f1-421e-90fb-ce707689594e'],'reason':'Otherwise plausible redundant Intro origin deliberately kept; source revision should change none of the58 full visualization-context goals.'}])

# Compare actual serialized object slices, not just selected review fields.
def raw_goals(raw):
    text=raw.decode();pos=text.index('[',text.index('"goals"'));pos+=1;decoder=json.JSONDecoder();out={}
    while True:
        while text[pos].isspace() or text[pos]==',':pos+=1
        if text[pos]==']':break
        g,end=decoder.raw_decode(text,pos);out[g['id']]=text[pos:end].encode();pos=end
    return out
br=raw_goals(before);ar=raw_goals(after)
pinsPath='contracts/goal-visualization-context/v1/math58-current-supplement-pins-2026-11-07.candidate.json';oldPinsRaw=(R/pinsPath).read_bytes();pins=json.loads(oldPinsRaw);assert H(oldPinsRaw)=='b561cd08c41439154a529b5e8fe3243a41567204ffce9f4c43adca531f843f76'
rows=[]
for row in pins['goalBindings']:
    id=row['goalId'];assert id not in selected;assert bg[id]==ag[id];assert br[id]==ar[id]
    canonical=json.dumps(bg[id],ensure_ascii=False,sort_keys=True,separators=(',',':')).encode();assert H(canonical)==row['wholeCurrentGoalCanonicalSha256']
    assets=[]
    for field in ['publicAssetPath','canonicalAssetPath']:
        path=row[field];raw=(R/path).read_bytes();assert H(raw)==row['assetSha256'];assets.append({'path':path,'sha256':H(raw),'bytes':len(raw)})
    rows.append({'goalId':id,'fullSerializedGoalBytes':len(br[id]),'beforeRawObjectSha256':H(br[id]),'afterRawObjectSha256':H(ar[id]),
       'fullCanonicalGoalSha256':H(canonical),'allFieldsExactlyEqual':True,'assets':assets,
       'currentReviewUnchanged':row['currentReview'],'currentInputUnchanged':row['currentInput'],
       'originalReviewerUnchanged':row['originalReviewer'],'originalTimeUnchanged':row['originalReviewedAt'],
       'currentReviewerUnchanged':row['currentReviewer'],'currentTimeUnchanged':row['currentReviewedAt']})
assert len(rows)==58
protected=j(R/'qa-artifacts/ci-contract-audit/2026-11-07/math58-active-integration/installed-files.json')
for row in protected:
    raw=(R/row['path']).read_bytes();assert H(raw)==row['sha256'],row['path'];assert len(raw)==row['bytes']
dump('protected-active132-inputs.json.gz',protected)
capsule='qa-artifacts/ci-contract-audit/2026-11-07/math58-active-integration/capsule-132/capsule.json'
index='contracts/goal-visualization-context/v1/qualified-context-index-math58-132-2026-11-07.candidate.json'
proof={'kind':'FINITE_PROSPECTIVE_MATH_G17_20_SOURCE_REVISION_EVIDENCE_NOT_APPROVAL','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'owner':i['owner'],'sourcePath':rel,'beforeSourceSha256':H(before),'afterSourceSha256':H(after),'afterSourceBytes':len(after),
 'afterSnapshot':{'path':str((P/'after-source.json.gz').relative_to(R)),'sha256':H((P/'after-source.json.gz').read_bytes()),'encoding':'gzip; decoded source SHA is afterSourceSha256'},
 'exactPatch':{'path':str((P/'candidate.patch').relative_to(R)),'sha256':H((P/'candidate.patch').read_bytes())},
 'exactOnlyChangedGoalIds':sorted(selected),'exactOnlyChangedField':'requires; one direct reference to71cec9fb removed per listed goal; no other field changes',
 'all58FullRawGoalObjectsEqual':True,'full58ObjectRows':rows,'oldPinsPath':pinsPath,'oldPinsSha256':H(oldPinsRaw),
 'wholeCatalogClosureEvidence':{'path':str((P/'native-core-checks.json').relative_to(R)),'sha256':H((P/'native-core-checks.json').read_bytes())},
 'nativeJointOriginWitnessEvidence':{'path':str((P/'edge-review-matrix.json.gz').relative_to(R)),'sha256':H((P/'edge-review-matrix.json.gz').read_bytes())},
 'allAuthoredViewScopeEvidence':{'path':str((P/'native-scope-checks.json.gz').relative_to(R)),'sha256':H((P/'native-scope-checks.json.gz').read_bytes()),'views':88,'filterVariants':792,'selectedTargetCases':sum(len(v['checks'])for x in i['views']for v in x['variants']),'newTargetReachabilityLosses':0},
 'all21CompiledApplicabilityUnchanged':True,
 'runtimeScopeIntegrationHold':{'path':str((P/'focus-boundary.json').relative_to(R)),'sha256':H((P/'focus-boundary.json').read_bytes()),'status':'HOLD_NATIVE_LEVEL2_DIRECT_REF_COUNTEREXAMPLE_METHOD_FIXTURE'},
 'preservedCurrentIndex':{'path':index,'sha256':H((R/index).read_bytes())},
 'preservedCurrent132Capsule':{'path':capsule,'sha256':H((R/capsule).read_bytes())},
 'allInstalled132InputsRechecked':{'count':len(protected),'recordPath':str((P/'protected-active132-inputs.json.gz').relative_to(R)),'recordSha256':H((P/'protected-active132-inputs.json.gz').read_bytes())},
 'newImageReviewClaimed':False,'newHumanApprovalClaimed':False,'oldReviewTimesActorsAndImagesRemainUntouched':True,
 'activationHold':'FIRST close the explicit Level-2 direct-ref integration counterexample in focus-boundary.json; no source application. Then requires independent exact graph/source-revision review and actual existing native V verifier/QA factory checks for the separately pinned successor; current reader intentionally still accepts only old source.'}
dump('source-revision-proof.json',proof)
newPins=copy.deepcopy(pins);newPins['source']['sha256']=H(after)
newPins['sourceRevisionEvidence']={'path':str((P/'source-revision-proof.json').relative_to(R)),'sha256':H((P/'source-revision-proof.json').read_bytes())}
newName='math58-current-supplement-pins-g17-first20-2026-11-07.candidate.json';dump(newName,newPins)
check=copy.deepcopy(newPins);del check['sourceRevisionEvidence'];check['source']['sha256']=pins['source']['sha256'];assert check==pins
futurePath='contracts/goal-visualization-context/v1/'+newName
helperPath='app/scripts/lib/goalVisualizationMath58Contexts.ts';helper=(R/helperPath).read_text()
newHelper=helper.replace("export const MATH58_PIN_PATH = '"+pinsPath+"'","export const MATH58_PIN_PATH = '"+futurePath+"'").replace("export const MATH58_PIN_SHA256 = '"+H(oldPinsRaw)+"'","export const MATH58_PIN_SHA256 = '"+H((P/newName).read_bytes())+"'")
assert helper!=newHelper
(P/'proposed-source-revision-reader.patch').write_text(''.join(difflib.unified_diff(helper.splitlines(True),newHelper.splitlines(True),fromfile='a/'+helperPath,tofile='b/'+helperPath,n=2)))
dump('bridge-proposal.json',{'status':'DRAFT_FOR_SEPARATE_EXTERNAL_PIN_REVIEW_NOT_IMPLEMENTED','successorPinsDraft':{'path':newName,'futureRepositoryPath':futurePath,'sha256':H((P/newName).read_bytes())},
 'onlyDatasetDelta':['source.sha256 exact successor','new sourceRevisionEvidence exact path/hash'],
 'onlyReaderDelta':'MATH58_PIN_PATH and MATH58_PIN_SHA256 constants; no reader branches/checks/WeakSet/receipt logic changed',
 'proposedReaderPatchSha256':H((P/'proposed-source-revision-reader.patch').read_bytes()),
 'preserved':['old pins file','all58 goalBindings','58 original and current reviews','all actor/time fields','all images','all132 receipts','132 accepted index','132 capsule/manifest/objects','capsule transport profiles and budgets','old74 authority/history'],
 'whyExistingTransportCanRemain':'Transport validates the unchanged fixed132 index and transports its historical/current-review evidence. The Math58 helper deliberately reads its pinned source with fromRepository=true, so the external successor data can bind the current source while the supplied full58 goals remain byte-identical. No source bytes are substituted inside the retained capsule.',
 'requiredActualFollowup':['Close focus-boundary.json actual Level-2 loader/public-frontier integration hold before any source application.',
  'Independent finite source-revision/graph review must endorse exact new source and unchanged58 evidence before accepting constants.',
  'Run unchanged capsule materializer and native current verifier for all132 through the prospective reader; old132 index/capsule pins and all budget boundaries remain.',
  'Negative: old source under new constant, a third source, any change to one of58 whole goals/DE/EN/demand/level/phase/assets/supplements, wrong owner/path or embedded proof reference/hash must remain rejected. The proposed two-constant runtime reader does not open the external proof file: its actual bytes must be checked by the source-revision admission review, not falsely claimed as a native V runtime check.',
  'No acceptedSources list, caller-chosen revision/hash, fallback to old source, widened goal selection or new approval/date/actor.'],
 'limits':'Static implementation assessment and a concrete exact draft are supplied. No reader patch applied, no successful successor V/Deep QA run claimed.'})
code=['app/scripts/auditTransitiveMinimality.ts','app/scripts/testTransitiveMinimality.ts','app/scripts/lib/skillGraphIntegrity.ts','app/src/hooks/useLandscapes.ts','app/src/goalTypes.ts','app/src/utils/goalFilters.ts','app/src/utils/authoring/canonicalAuthoring.ts','app/src/utils/authoring/compositionViewAuthoring.ts','app/scripts/applicabilityCompiler.ts','app/scripts/lib/goalVisualizationMath58Contexts.ts','app/scripts/goalVisualizationReviewedContext.ts','app/scripts/lib/qualifiedVisualizationContextAuthority.ts','scripts/visualization_qualified_context_capsule.py']
dump('input-pins.json',{'catalog':i['catalog'],'code':[{'path':f,'sha256':H((R/f).read_bytes())}for f in code],
 'viewSourcePins':[{'path':v['path'],'sha256':v['sha256']}for v in i['views']],
 'routingOnlyHistoricalAudit':[{'path':f,'sha256':H((R/f).read_bytes())}for f in ['docs/dev/learning-units-inventory/2026-11-06/transitive-minimality.md','docs/dev/learning-units-inventory/2026-11-06/transitive-minimality.json']]})
print(json.dumps({'sourceBefore':H(before),'sourceAfter':H(after),'edges':20,'unchanged58':58,'protected132Files':len(protected),'newPinsSha256':H((P/newName).read_bytes()),'proofSha256':H((P/'source-revision-proof.json').read_bytes())},indent=2))
