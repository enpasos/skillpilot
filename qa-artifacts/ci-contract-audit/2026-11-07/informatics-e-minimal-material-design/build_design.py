#!/usr/bin/env python3
"""Finite private design generator. Reads source37; writes only this new QA package."""
import gzip, hashlib, json, pathlib, uuid

R = pathlib.Path('/home/enpasos/projects/skillpilot')
W = pathlib.Path('/dev/shm/informatics-current-cleanup-20261107')
P = pathlib.Path(__file__).resolve().parent
REL = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json'
S = W / 'candidate' / REL
sha = lambda b: hashlib.sha256(b).hexdigest()
assert sha(S.read_bytes()) == 'd163550987320c6c8667fde4782a40ed4308525b8b9f025fcfc7fd6d70591d9c'
src = json.loads(S.read_text()); gs = {g['id']: g for g in src['goals']}
owner = src['landscapeId']
old = ['bb651ed7-2674-580c-8916-ac5aa88d93f8', 'fa47a714-07c3-589b-a4e2-385a33e84c79']
parent = '91c5be09-cc6b-5f57-bfe1-9f0038faf26a'
orientation = 'd848ceb9-cd73-5a13-9407-f3364764c223'
def dump(name, data):
    payload=(json.dumps(data, ensure_ascii=False, indent=2) + '\n').encode()
    if name.endswith('.gz'):
        (P / name).write_bytes(gzip.compress(payload,mtime=0))
    else:
        (P / name).write_bytes(payload)
def goal(prefix):
    rows = [g for i,g in gs.items() if i.startswith(prefix)]
    assert len(rows) == 1, prefix
    return rows[0]['id']
defs = [
 ('netz', 'Schul-AG: Webabruf erklären und absichern', 'School club: explain and protect a web request',
  'Die lernende Person kann an einer vollständigen Netzskizze und HTTP-Spur Netzkomponenten, Namensauflösung, Protokollschichten und Client-Server-Kommunikation erklären sowie die Risiken von unverschlüsselter Übertragung und Tokenprotokollierung begründet beurteilen.',
  'The learner can explain network components, name resolution, protocol layers and client-server communication using a complete network diagram and HTTP trace, and assess the risks of unencrypted transmission and token logging.',
  ['ca07458c','6539320a','ace0c141','6c4fd4a4'], ['ca07458c','ace0c141','6c4fd4a4'],
  ['I4','I5'], ['AB1','AB2','AB3'],
  ['N1.1 Client/Serverprogramme und Geräte korrekt unterscheiden','N1.2 Switch/Router und zwei tatsächliche Wege erklären','N1.3 DNS-Dienst und seinen Weg zuordnen',
   'N2.1 Namen/IP-Adressen und konkrete Auflösung erklären','N2.2 Vier Schichten mit allen gegebenen Protokollen korrekt zuordnen','N2.3 Namensauflösung von Inhaltsabruf unterscheiden',
   'N3.1 Dienst/Protokoll/Rollen am konkreten Dialog erklären','N3.2 Pfad, Status und Nutzdaten korrekt interpretieren','N3.3 Fehlenden Token nach konkretem Serververtrag beurteilen',
   'N4.1 Mitleserisiko, HTTPS-Gegenmaßnahme und Grenze begründen','N4.2 Logrisiko, passende Gegenmaßnahme und Grenze begründen','N4.3 Tokenbesitz/Status von verlässlicher Personenidentität unterscheiden']),
 ('web', 'Schul-AG: HTML-Formular und Grundlayout reparieren', 'School club: repair an HTML form and basic layout',
  'Die lernende Person kann ein vollständiges HTML-Dokument mit Formular eigenständig korrigieren und erweitern, dessen Elementbaum darstellen, ein einfaches einspaltiges CSS-Grid gestalten und die Datenübergabe per GET und POST erklären.',
  'The learner can correct and extend a complete HTML document with a form, represent its element tree, create a simple one-column CSS grid and explain data transfer using GET and POST.',
  ['757256e2','1a03f790','2897717b','4e0d72e9'], ['1a03f790','2897717b','4e0d72e9'],
  ['I2','I3','I4'], ['AB1','AB2'],
  ['W1.1 Vollständiges semantisch strukturiertes und korrekt verschachteltes HTML erstellen','W1.2 Formular mit zwei Eingabetypen nach Serververtrag implementieren','W1.3 id und Übertragungsname am konkreten Element unterscheiden',
   'W2.1 Oberen Elementbaum korrekt modellieren','W2.2 Formularbaum einschließlich Optionen korrekt modellieren',
   'W3.1 Grundtypografie, Breite und Abstände implementieren','W3.2 Einspaltiges Grid und Feldgruppenlayout implementieren','W3.3 Klassen- und ID-Selektor fachlich unterscheiden',
   'W4.1 POST-Body und entsprechende GET-Query korrekt herleiten','W4.2 Transportverschlüsselung von GET/POST unterscheiden']),
 ('code', 'Schul-AG: Buchungslogik implementieren und testen', 'School club: implement and test booking logic',
  'Die lernende Person kann vorgegebenen fehlerhaften Code anhand eines vollständigen Vertrags in eine reine Auswertungsfunktion und eine zustandsändernde Buchungsmethode zerlegen und korrigieren, eine gegebene Ereignishülle zur Ein-/Ausgabe ergänzen sowie Normal-, Grenz-, Fehler- und Folgetests tatsächlich ausführen und dokumentieren.',
  'The learner can correct and decompose faulty code under a complete contract into a pure evaluation function and a state-changing booking method, complete a supplied event handler for input/output, and execute and document normal, boundary, invalid-input and sequential tests.',
  ['18317e31','2aaefe0b','5ca1960e','5961bae4','d5914986','8f1a342c','a45e73d2'], ['2aaefe0b','5961bae4','8f1a342c','a45e73d2'],
  ['I1','I3','I4'], ['AB1','AB2','AB3'],
  ['P1.1 Tatsächlichen Typ-/Werttrace zur Stringadditionsdiagnose nutzen','P1.2 Exaktes Füllen als Gegenfall zur falschen Grenze finden','P1.3 Überschreiben statt Erhöhen des Objektzustands identifizieren',
   'P2.1 Alle Teile mit Schleife und vollständiger Eingabeprüfung verarbeiten','P2.2 Numerische Summe als Rückgabe berechnen','P2.3 Parameter/Rückgabe, Kapazitätsprüfung und unveränderten Ablehnungszustand korrekt implementieren','P2.4 Lauffähige funktionale Zerlegung implementieren und begründen',
   'P3.1 Ereignisgebundene Ein-/Ausgabe selbst ergänzen und Typen/Datenfluss erklären','P3.2 Zustandsentwicklung über aufeinanderfolgende Klicks erklären',
   'P4.1 Systematischen Plan für Normal-, Grenz-, Fehler- und Folgetests begründen','P4.2 Erwartung und tatsächliche Beobachtung für Ausgabe und Zustand dokumentieren','P4.3 Ausgeführten Debugger-/Konsolenbeleg und wirklichen Vorher-/Nachhertest nutzen'])
]
bindings = {
 'ca07458c':['N1.1','N1.2','N1.3'], '6539320a':['N2.1','N2.2','N2.3'],
 'ace0c141':['N3.1','N3.2','N3.3','N4.1'], '6c4fd4a4':['N4.1','N4.2','N4.3'],
 '757256e2':['W1.1','W1.2'], '1a03f790':['W3.1','W3.2','W3.3'],
 '2897717b':['W1.2','W1.3','W4.1','W4.2'], '4e0d72e9':['W2.1','W2.2'],
 '18317e31':['P2.1','P2.2','P3.1'], '2aaefe0b':['P1.3','P3.2'],
 '5ca1960e':['P2.1','P2.2','P2.3'], '5961bae4':['P2.3','P2.4'],
 'd5914986':['P1.1','P1.2','P1.3','P4.3'], '8f1a342c':['P4.1','P4.2','P4.3'],
 'a45e73d2':['P2.4','P4.3']}
goals=[]; rows=[]
for key,title,title_en,desc,desc_en,cov,req,strands,demand,criteria in defs:
    cid=str(uuid.uuid5(uuid.UUID(owner), 'private-design:2026-11-07:HE:E:'+key+':v1'))
    assert cid not in gs
    solution=(P/'materials'/f'{key}-solution.md').read_text()
    if key=='web':
        solution+='\n```html\n'+(P/'materials/web-solution.html').read_text()+'```\n\n```css\n'+(P/'materials/web-solution.css').read_text()+'```\n'
    if key=='code': solution+='\n```javascript\n'+(P/'materials/code-solution.mjs').read_text()+'```\n'
    g={'id':cid,'type':'atomic','title':title,'titleEn':title_en,'description':desc,'descriptionEn':desc_en,
       'weight':1,'tags':['GK','LK','Practice','Assessment'],'phase':'E','contains':[],
       'requires':[goal(x) for x in req], 'applicability':{'jurisdiction':['DE-HE']},
       'dimensionTags':{'framework':'hessen-kc-2024-informatics','phase':'E','demandLevel':demand[-1],'processCompetencies':[],'guidingIdeas':strands},
       'extendedData':{'routeTerminal':True,'provenance':{'sourceLandscapeTitle':'Own local HE-compatible E material design; no official exam','sourceGoalId':'private-e-material-'+key+'-20261107'}},
       'examData':{'reviewStatus':'draft','coveredGoalIds':[goal(x) for x in cov], 'coveredStrands':strands,
                   'demandLevels':demand,'taskContent':(P/'materials'/f'{key}-task.md').read_text(),
                   'solutionContent':solution,'scoring':{'maxPoints':len(criteria),'passingPoints':len(criteria),
                     'steps':[{'id':c.split(' ')[0],'points':1,'description':c.split(' ',1)[1]} for c in criteria]}}}
    goals.append(g)
    for x in cov:
        rows.append({'task':key,'draftExamId':cid,'goalId':goal(x),'title':gs[goal(x)]['title'],
                     'fullCurrentGoal':gs[goal(x)],'rubricCriterionIds':bindings[x],
                     'sourceLimit':'Own finite performance supported by local official HE PDF E.1–E.3, printed30–31; not sourceSnapshot wording as direct official quote.'})
assert len(rows)==15 and len({x['goalId'] for x in rows})==15
dump('draft-goals.json',goals);dump('coverage-matrix.json',rows)
reason={
 '8d21085b':'E.4 Projekt: requirements planning and tool selection are not assessed here.',
 'fcdf8e5f':'E.4 Projekt: incremental project/version documentation is not assessed here.',
 'f81be4d3':'E.4 Projekt: no full project presentation/reflection is assessed.',
 '6bba1eda':'E.5 Kryptologie: no classical cipher application/breaking task.',
 'e3e17e48':'E.5 Kryptologie: no demonstration of classical cryptographic attacks.',
 '7ef3293a':'E.5 Kryptologie: HTTPS risk explanation does not assess the full modern-cryptography goal.',
 'f15d09fd':'Ordinary target remains: basic one-column Grid is official E.2 context; adaptation to multiple viewports is not assessed or erased.',
 'e3e5c851':'LK-tagged canonical segmentation/addressing performance remains outside this common GK/LK contract; no general HE E level split inferred.',
 '0ef581d1':'Global software-quality criterion set is not assessed by local correctness/debugging alone.',
 'df1a7c0c':'No independently authored requirements analysis or specification document is assessed.'}
residual=[]
selected={r['goalId'] for r in rows}
for id in gs[old[1]]['examData']['coveredGoalIds']:
    if id in selected:continue
    key=next(k for k in reason if id.startswith(k))
    residual.append({'id':id,'title':gs[id]['title'],'fullCurrentGoal':gs[id],
                     'decision':'PRESERVE_ORDINARY_GOAL_UNCHANGED_NO_COVERAGE_GRANT','reason':reason[key]})
assert len(residual)==10;dump('residual-ten.json',residual)
spec=json.loads(gzip.decompress((W/'five-new-route-need-material-specifications.json.gz').read_bytes()))
e=next(r for r in spec['fourColumnRows'] if r['phase']=='E')
dump('original-e-inputs.json.gz',{'source':str(S),'sha256':sha(S.read_bytes()),'oldAssessments':[gs[i] for i in old],
                             'parent':gs[parent],'orientation':gs[orientation],
                             'eAssociationsOriginal':e['fourColumnAtomInventory'],
                             'warning':'Original associations are sourceSnapshotGoal/other existing routing evidence, not a fresh official clause review.'})
view_dir=R/'curricula/DE/Gymnasium/composition-views/informatik'
positive=['de-he-gym-informatics-crossstage','de-de-gym-informatics-gk','de-de-gym-informatics-lk']
refs=[]
for p in sorted(view_dir.glob('*.view.json')):
    # Source37 may replace the view; always inspect that declared frame first.
    q=W/'candidate'/p.relative_to(R)
    if not q.exists():q=p
    v=json.loads(q.read_text())
    if parent in q.read_text(): refs.append({'path':str(p.relative_to(R)),'sourceFramePath':str(q),'sha256':sha(q.read_bytes()),'viewId':v['viewId'],'decision':'KEEP_LOCAL_E_PARENT' if v['viewId'] in positive else 'WITHHOLD_THIS_UNQUALIFIED_E_SUBTREE_FROM_FOREIGN_JURISDICTION_VIEW'})
assert len(refs)==18
dump('integration-contract.json',{
 'status':'CONCRETE_PRIVATE_MATERIAL_DESIGN_FOR_INDEPENDENT_REVIEW_NOT_CURRENT_AUTHORITY',
 'sourceSha256':sha(S.read_bytes()),'owner':owner,'draftNewExamIds':[g['id'] for g in goals],
 'newIdMethod':'UUIDv5 namespace=canonical Informatik landscapeId; name=private-design:2026-11-07:HE:E:<netz|web|code>:v1. Prospective new identities, no alias or result transfer.',
 'supersededCurrentAssessmentIds':old,'replacementIsExplicitNotSilentSemanticRebinding':True,
 'legacySnapshotMappingDisposition':{'sourceGoalId':'7fc8c5e4-5d0b-4a4e-b94b-5b743c93816a','oldTarget':old[0],
   'decision':'Withdraw its current exact mapping to the retired assessment; preserve historical audit. Never rebind this single snapshot promise to the three new tasks.',
   'parentSourceGoalId':'b9cb98f0-16c5-5b5a-a15a-8f9e718a07c1','parentTarget':parent,
   'parentLimit':'Structural provenance only; not official obligation or material evidence.'},
 'reuseDecision':'Reuse school-AG/web-debugging context only. bb651 announces but does not supply actual materials; its three clusters resolve to17 content atoms and inherited preparation includes18 leaves. No reviewed task/solution bytes can be reused as completed materials.',
 'parentPatch':{'id':parent,'beforeContains':gs[parent]['contains'],'afterContains':[g['id'] for g in goals],
                'beforeRequires':gs[parent]['requires'],'afterRequires':[],
                'beforeWeight':gs[parent]['weight'],'afterWeight':3,
                'afterApplicability':{'jurisdiction':['DE-HE']},
                'afterDescription':'Die lernende Person kann drei lokale Aufgaben zu Rechnernetzen, Webdokumenten und grundlegender Programmierung selbständig bearbeiten.',
                'afterDescriptionEn':'The learner can independently complete three local tasks on computer networks, web documents and basic programming.',
                'reason':'No prerequisite from another local task is universal to all three. Current inherited three-topic requirements would reintroduce17 content atoms, including the LK-only packet goal, behind smaller leaf arrays.'},
 'viewDecisions':refs,'positiveScopes':positive,
 'jurisdictionLimit':'HE-compatible own local offering, both technical GK/LK profiles. E itself has no official GK/LK split in the read PDF. No BY or other-state approval, no statewide exam/language/cohort claim.',
 'scopeEnforcement':'Merely setting applicability=DE-HE is insufficient: current composition subtree collection follows contains. Remove the old E assessment subtree reference in the15 foreign-state views; preserve every ordinary goal and every other route. Those states then honestly lack this qualified E endpoint. Do not grant them the HE tasks.',
 'noSilentReduction':'All25 ordinary E inventory definitions remain byte-identical;15 covered,10 openly residual. Do not use completion of these three as all-E/HE curricular-completeness proof.',
 'otherPlaceholdersUnchanged':[{'id':r['prospectiveNewGoalId'],'goalCanonicalSha256':sha(json.dumps(gs[r['prospectiveNewGoalId']],sort_keys=True,ensure_ascii=False,separators=(',',':')).encode())} for r in spec['fourColumnRows'] if r['phase']!='E'],
 'ownQ2Unchanged':{'id':goal('6ebc'),'limit':'Own20 coverage/material/scope authority untouched; no new scope inference or rewrite.'},
 'grading':'Use existing scoring schema only:12/12,10/10,12/12 binary minimum criteria. No new runtime gating field. Equivalent correct reasoning counts; optional stylistic perfection does not. This is a local mastery check, no official marks policy.',
 'hardImplementationConditions':['Keep every current definition in quality checks, including draft and nonoffered assessments.',
   'Retire the two old assessment definitions explicitly in the same reviewed current identity/ref transaction; do not alias or transfer results. Update current refs exactly; retain historical audits unchanged.',
   'Remove the old parent inherited requires in the final source; prove native whole-material preparation has only local content plus the already existing orientation.',
   'Preserve all ordinary definitions and the four other placeholders; no change to Own20.',
   'Use complete inline task/solution/rubric from these candidates, not filenames as substitutes for missing material.',
   'Independent subject/material review and native current scoped readiness/identity bind remain required; design syntax and tests are not approval.'],
 'residualOfficialLimits':['E.1–E.3 source alignment does not prove every official detail or all language/data-type variants assessed.',
   'One supplied JavaScript environment is an own offering; school language choice and cohort remain separately unresolved.',
   'Basic Grid has direct E.2 support; this does not establish the broader multi-viewport canonical performance.',
   'Other-state E routes, remaining source gaps, four other placeholders and existing graph findings remain open.']})
pinpaths=[S,R/'AGENTS.md',R/'curricula/DE/Gymnasium/input/HE/upper-secondary/kernkurriculum_gymnasiale_oberstufe-informatik.pdf',
 W/'five-new-route-need-material-specifications.json.gz',W/'native-graph-scope.json.gz',
 R/'app/src/landscapeTypes.ts',R/'app/scripts/lib/retainedAssessmentCoverage.ts',
 R/'app/src/utils/authoring/compositionViewAuthoring.ts',R/'app/scripts/generateCurriculumQualityStatus.ts',
 pathlib.Path('/dev/shm/informatics-q2-source-scope-v3-20261107/native-closure-functions.mts')]
dump('input-pins.json',[{'path':str(p),'sha256':sha(p.read_bytes()),'bytes':p.stat().st_size} for p in pinpaths])
print(json.dumps({'newTasks':len(goals),'exactCoverage':len(rows),'ordinaryResidual':len(residual),'parent':parent,'viewReferences':len(refs),'foreignViewHolds':sum(r['decision'].startswith('WITHHOLD') for r in refs)}))
