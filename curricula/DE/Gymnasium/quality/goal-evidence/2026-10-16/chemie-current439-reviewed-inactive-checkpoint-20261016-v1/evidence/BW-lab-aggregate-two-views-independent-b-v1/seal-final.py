import datetime
import hashlib
import json
from pathlib import Path

R = Path.cwd()
T = R / 'tmp/chemie-m7-resumed-20261016'
O = T / 'BW-lab-aggregate-two-views-independent-b-v1'
A = T / 'BW-lab-aggregate-existing-child-acquisition-author-v1'
L = T / 'chemie-shared640-recycling-native-author-capsule-L6-v1'
read = lambda p: json.loads(p.read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
pin = lambda p: {'path': str(p.relative_to(R)), 'sha256': sha(p), 'bytes': p.stat().st_size}
def put(name, doc):
    p = O / name
    p.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + '\n')
    return pin(p)
now = datetime.datetime.now(datetime.timezone.utc).isoformat()
first = O / 'FIRST.scientific-source-role-acquisition.independent-b.sealed.json'
assert sha(first) == '42927e8e3c86a97814391229a6aeeed8c78ff639ba9a8d93e409205683abc144'
selector = A / 'OUTPUTS.finite-two-BW-views.AUTHOR.inactive.selector.json'
assert sha(selector) == 'f56548f16d1e3d497285991fde36959205bdc7b1a5e8d5567e2c9dc82aa8e60d'
contract = read(O / 'CHECK.actual-whole-CAS-guardedBefore-schema.independent-b.json')
compiler = read(O / 'CHECK.actual-stock-raw-kind-aware-roles-unique-tree.independent-b.json')
assert contract['PASS'] and compiler['exactTwoViewDeltaPASS']
assert not compiler['fullKindAwareAcceptance']
for filepin in [contract['canonical'], contract['semanticKinds'], contract['schema'], *compiler['inputs'].values()]:
    assert sha(R / filepin['path']) == filepin['sha256']
for row in contract['views']:
    for k in ['guardedCurrent', 'before', 'after']:
        assert sha(R / row[k]['path']) == row[k]['sha256']
author_inputs = read(A / 'INPUT.six-whole-goals-two-current-whole-profiles-and-two-DE-EN-material-cases.exact.json')
retained = []
for role in ['currentWholeProfilesSource', 'wholeLinkedMaterialSource', 'officialPrimary']:
    p = R / author_inputs[role]['path']
    assert sha(p) == author_inputs[role]['sha256']
    retained.append({'role': role, **pin(p)})
for item in author_inputs['sourceRoutingInputs']:
    p = R / item['path']
    assert sha(p) == item['sha256']
    retained.append({'role': 'sourceRoutingInput', **pin(p)})
def excerpt(rel, firstline, lastline):
    p = R / rel
    return {'file': pin(p), 'firstLine': firstline, 'lastLine': lastline,
            'exactText': '\n'.join(p.read_text().splitlines()[firstline-1:lastline])}
static = put('EVIDENCE.static-backend-aggregate-role-existing-tests.independent-b.json', {
    'documentType': 'independent-b-static-source-inspection-not-executed-backend-test', 'atUTC': now,
    'executionStatus': 'STATIC_ONLY; backend tests and app full test suite were not executed',
    'backendEvidence': [
        excerpt('backend/src/main/java/com/skillpilot/backend/service/LearnerService.java', 5810, 5823),
        excerpt('backend/src/main/java/com/skillpilot/backend/service/LearnerService.java', 5881, 5910),
        excerpt('backend/src/main/java/com/skillpilot/backend/service/LearnerService.java', 5980, 5990),
        excerpt('backend/src/main/java/com/skillpilot/backend/service/LearnerService.java', 6081, 6118),
        excerpt('backend/src/main/java/com/skillpilot/backend/service/LearnerService.java', 6724, 6784),
        excerpt('backend/src/main/java/com/skillpilot/backend/service/LearnerService.java', 10318, 10415)],
    'existingTestsReadButNotRun': [
        excerpt('backend/src/test/java/com/skillpilot/backend/service/ProjectionRoleLearnerServiceTest.java', 242, 258),
        excerpt('backend/src/test/java/com/skillpilot/backend/service/ProjectionRoleLearnerServiceTest.java', 298, 323),
        excerpt('backend/src/test/java/com/skillpilot/backend/service/ProjectionRoleLearnerServiceTest.java', 536, 557),
        excerpt('app/scripts/testCompositionProjectionRoles.ts', 176, 199)],
    'conclusions': [
        'Direkte goalEntry-Quellen sind spezifischer als canonicalSubtree-Vererbung. Fehlende projectionRole ist target. Beide echten Kindreferenzen bleiben target; der separat ergänzte Cluster bleibt prerequisiteOnly.',
        'Bei angewandter Composition View prüft der einfache wie der reiche Frontier-Pfad direkte bekannte Voraussetzungen fail-closed, wenn deren Rollenreferenz fehlt. Die neue Referenz behebt genau die Rollenlücke des 266a-Clusters.',
        'computeEffectivePrereqMastery bestimmt ein vorhandenes Cluster über min der relevanten Kinder, mit GK-Kernfilter, wenn Kernkinder existieren. Hier haben beide Kinder GK; keines wird ausgelassen. Ein gespeicherter Clusterwert ersetzt bei vorhandenen Kindern das Minimum nicht.',
        'Statische Folgerung bei binären Kindwerten: (0,0), (1,0), (0,1) geben Aggregat 0; (1,1) gibt 1. Die tatsächlich im Code geprüfte Voraussetzungschwelle ist 0.9. Dies ist eine Codeableitung, kein ausgeführter LearnerService-Test.',
        'Die sechs geschlossenen Rolleninterfaces sind keine Behauptung, dass alle übrigen Voraussetzungen, Orientierung, Fokus, Session oder tatsächliche Lernleistung bereits erfüllt wären.'],
    'supplementalPrimaryReadAfterFIRST': {
        'source': retained[2], 'pdfPage': 21, 'printedPage': 19, 'section': '3.2.2.1 (2),(6)',
        'method': 'pdftotext -f 21 -l 21 -layout original-primary.pdf -; actual page read',
        'judgement': 'Planung, tatsächliche Durchführung und Protokoll sind ausdrücklich genannt; Gas- und Ionennachweise sind als Stoff-/Ionennachweise gedeckt. Der kanonische gemeinsame Laborvoraussetzungsverweis ist didaktische Modellierung, keine wörtliche source edge.'}})
summary = []
for row in compiler['rows']:
    b, a = row['before'], row['after']
    errors = [x for x in a['kindAwareFindings'] if x['severity'] == 'error']
    assert all(x['code'] == 'CPV-009' for x in errors)
    summary.append({'course': row['course'], 'boundedDeltaDecision': 'KEEP',
        'wholeViewDecision': 'HOLD', 'effectiveTargetCount': len(a['effectiveTargets']),
        'ordinaryTargetCount': len(a['ordinaryTargets']),
        'rawCompilerErrorsBeforeAfter': [len([x for x in b['rawFindings'] if x['severity']=='error']), len([x for x in a['rawFindings'] if x['severity']=='error'])],
        'unchangedKindAwareCPV009Count': len(errors),
        'unchangedKindAwareCPV009': errors,
        'missingDirectOrdinaryRoleInterfacesBeforeAfter': [len(b['missingDirectOrdinaryInterfaces']), len(a['missingDirectOrdinaryInterfaces'])],
        'resolvedDirectRoleInterfaces': row['actualDirectContextsResolved'],
        'remainingMissingInterfaces': a['missingDirectOrdinaryInterfaces'],
        'childUniqueTargets': a['children'], 'aggregateRole': a['aggregateRole'],
        'aggregateRenderedCount': a['aggregateRenderedCount'],
        'targetAndOrdinaryTargetSetsExact': b['effectiveTargets']==a['effectiveTargets'] and b['ordinaryTargets']==a['ordinaryTargets'],
        'visibleTreeExact': b['renderedTreeSHA256']==a['renderedTreeSHA256']})
verdict = put('VERDICT.bounded-KEEP-whole-views-HOLD.independent-b.json', {
    'documentType': 'bounded-independent-b-scientific-role-QA-verdict', 'atUTC': now,
    'candidate': pin(selector), 'firstIndependentScience': pin(first),
    'scope': 'Exactly two inactive whole BW GK/LK CrossStage view replacements; existing laboratory aggregate acquisition only',
    'boundedDecision': 'KEEP', 'wholeViewAcceptance': 'HOLD',
    'reason': 'Beide Views ergänzen ausschließlich einen prerequisiteOnly canonicalSubtree für den unveränderten curricularArea-Cluster 266a. Dessen genau zwei vorhandene Kinder bleiben als spezifische direkte uniqueTargets sichtbar und erwerben die bestehende Laborvoraussetzung. Es entsteht kein Atom, kein neuer fachlicher Pflichtstoff und kein zweiter Lernweg.',
    'sourceAndAcquisition': 'Primär-PDF 2.1 (5),(6), 3.2.1.1 (1),(3),(4) und ergänzend 3.2.2.1 (2),(6) gelesen. Ganze sechs Goals, zwei ganze aktuelle Profile sowie zwei ganze verknüpfte DE/EN-Materialfälle gelesen und gegen originale Inputs gleich geprüft. Ausführung/Dokumentation bleiben echte praktische Nachweisanforderungen. Historische Kind-AMVP-Urteile werden nicht neu erstellt.',
    'wholeViewCASAndGuardedBefore': pin(O / 'CHECK.actual-whole-CAS-guardedBefore-schema.independent-b.json'),
    'actualFiniteProofs': pin(O / 'CHECK.actual-stock-raw-kind-aware-roles-unique-tree.independent-b.json'),
    'staticBackendEvidence': static,
    'results': summary,
    'dissentAgainstThisBoundedDelta': [],
    'retainedDissentAndLimits': [
        'Die alten CPV-009-Fehler und die verbleibenden fehlenden direkten ordinary Rollen bleiben offen. Raw-Compiler-Erfolg ohne SEM-Typen ist kein kind-aware Vollpass.',
        'Die unveränderten Profile behalten needs_human_review/ai_candidate, E0/G0 bzw. E1/G1 und sämtliche vorhandene Dissent-/Whole-source/course/placement-HOLD-Grenzen.',
        'Die Rolle schafft keine neue Quelle für vollständige Quellabdeckung und keine tatsächliche Lernendenleistung. Das sind getrennte Aussagen.',
        'Backend-Mastery und vorhandene Testfälle nur statisch gelesen. Keine Backend-Suite, kein Runtime-/Hosttest, kein Voll-APV, kein Build, kein Central, kein nativeD.',
        'Keine M7-, Human- oder Lernendenerprobungsfreigabe. Keine R/L6-, Normal- oder kanonischen Änderungen; Kandidat bleibt inaktiv.'],
    'executedCommands': [
        {'command': 'PYTHONDONTWRITEBYTECODE=1 python tmp/chemie-m7-resumed-20261016/BW-lab-aggregate-two-views-independent-b-v1/check-finite-contract.py', 'exitCode': 0,
         'stdout': pin(O/'actual-contract-schema.stdout.txt'), 'stderr': pin(O/'actual-contract-schema.stderr.txt')},
        {'command': 'TSX_DISABLE_CACHE=1 app/node_modules/.bin/tsx tmp/chemie-m7-resumed-20261016/BW-lab-aggregate-two-views-independent-b-v1/check-finite-compiler.mts', 'exitCode': 0,
         'stdout': pin(O/'actual-stock-compiler.stdout.txt'), 'stderr': pin(O/'actual-stock-compiler.stderr.txt')} ]})
retention = put('CHECK.final-inputs-retained.independent-b.json', {
    'atUTC': now, 'FIRST': pin(first), 'candidateSelector': pin(selector),
    'canonical': contract['canonical'], 'semanticKinds': contract['semanticKinds'],
    'exactWholeBeforeAfterAndGuardedCurrent': contract['views'],
    'originalSourceProfileMaterialInputs': retained, 'allCheckedSHA256StillExact': True,
    'writesOutsideOwnDirectory': False})
files = []
for p in sorted(O.iterdir()):
    if p.is_file() and p.name not in ['MANIFEST.final.independent-b.json', 'OUTPUTS.independent-b.selector.json']:
        if p.suffix == '.json': read(p)
        files.append(pin(p))
manifest = put('MANIFEST.final.independent-b.json', {'documentType':'independent-b-finite-output-manifest', 'atUTC':now,
    'files':files,'verdict':verdict,'retention':retention,'noFullPass':True})
final = put('OUTPUTS.independent-b.selector.json', {
    'documentType':'bounded-independent-b-output-selector', 'atUTC':now,
    'candidateSelector':pin(selector), 'baseCanonicalSHA256':contract['canonical']['sha256'],
    'FIRST':pin(first), 'verdict':verdict,
    'actualWholeCASGuardedBeforeSchemaProof':pin(O/'CHECK.actual-whole-CAS-guardedBefore-schema.independent-b.json'),
    'actualFiniteStockRoleRawCompilerKindAwareAndUniqueTreeProof':pin(O/'CHECK.actual-stock-raw-kind-aware-roles-unique-tree.independent-b.json'),
    'staticBackendEvidence':static,'retention':retention,'manifest':manifest,
    'boundedDecision':'KEEP','wholeViewDecision':'HOLD',
    'wholeViewReplacements':2,'resolvedDirectOrdinaryRoleInterfaces':6,
    'unchangedKindAwareCPV009':25,'remainingDirectOrdinaryRoleInterfaces':77,
    'newOrdinaryTargetRequirements':0,'newCompileErrors':0,'fullKindAwareAcceptance':False,
    'appliedToPrivateL6OrNormal':False,'humanOrM7Claim':False})
for item in read(O/'MANIFEST.final.independent-b.json')['files']:
    assert sha(R/item['path'])==item['sha256']
assert sha(first)=='42927e8e3c86a97814391229a6aeeed8c78ff639ba9a8d93e409205683abc144'
assert sha(selector)=='f56548f16d1e3d497285991fde36959205bdc7b1a5e8d5567e2c9dc82aa8e60d'
print(json.dumps({'selector':final,'boundedDecision':'KEEP','wholeViewDecision':'HOLD','actualFiniteChecks':'PASS','oldKindAwareErrorsRetained':25,'bytesOwnOutputs':sum(p.stat().st_size for p in O.iterdir() if p.is_file())},ensure_ascii=False))
