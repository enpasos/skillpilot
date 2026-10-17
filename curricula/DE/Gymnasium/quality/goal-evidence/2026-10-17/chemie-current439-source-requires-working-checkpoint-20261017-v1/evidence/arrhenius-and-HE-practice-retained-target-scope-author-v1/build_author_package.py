import copy,datetime,hashlib,json,math
from pathlib import Path

ROOT=Path('/home/enpasos/projects/skillpilot')
BASE=Path('/mnt/e/skillpilot-chemie-L7-20261017')
OUT=BASE/'arrhenius-and-HE-practice-retained-target-scope-author-v1'
C20=BASE/'paired-twenty-foundations-and-coordinate-priors-actual-whole650-assembly-root-v1/candidate.canonical650.paired-c95-twenty-foundations-and-coordinate-priors.private.json'
V39=C20.parent/'candidate.whole39views.paired48-plus20-foundations.private.json'
STOCK=BASE/'actual650-paired-twenty-foundations-and-coordinate-stock-applicability-root-v1'
INV=STOCK/'INVENTORY.root-current149-seven-finite-packages.json'
MEASURE=STOCK/'MEASUREMENT.actual650-compiled-course-jurisdiction-duration-frontend-targets.not-backend-acceptance.json'
APV=STOCK/'STOCK.actual650-paired-twenty-foundations-and-coordinate-applicability.json'
CAP=BASE/'current650-post20-P439-SEM-paired-context-final-technical-b-v1/capsule'
P439=CAP/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current650-post20-final-363-one-record-technical-v1/P439.current.exact438-plus-one-paired-363-context.jsonl'
ARR='28bb9d15-f865-5843-a035-6066580fea64';MEM='417e65ec-68be-5f2e-9452-c3ba9b1d362f'
JURIS=['DE-HH','DE-MV','DE-ST','DE-TH']
def pin(p):
    p=Path(p)
    if not p.is_absolute():p=ROOT/p
    return {'path':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def digest(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def write(name,obj):
    p=OUT/name
    with p.open('x') as f:json.dump(obj,f,ensure_ascii=False,indent=2);f.write('\n')
    return p
for p,h in [(C20,'48482f9f092028b1f33c41e9223c250dbeb0f00750614f42cb613b6f72cd51dd'),(V39,'f3989d39a8096f160de40c35b81281054cbe06012626a227439a7f5895bfd9ac'),(P439,'469ab00b73a9b1454d853fc9ce7db6cbfce1e2c5968a5b19e9ad807875b70b3e'),(INV,'f137545b633e8c5482a7b1cf3c75aa4d9e38445c4c196c178023e161e3528e5f')]:assert pin(p)['sha256']==h
can=json.loads(C20.read_text());goals={g['id']:g for g in can['goals']};views=json.loads(V39.read_text());viewmap={v['viewId']:v for v in views}
profiles={r['goalId']:r['profile'] for r in map(json.loads,P439.read_text().splitlines())};inv=json.loads(INV.read_text());measurement=json.loads(MEASURE.read_text())
assert pin(MEASURE)==inv['currentMeasurement']
inventory=[r for r in inv['goals'] if r['packageId'] in ['01-arrhenius-memory','02-he-practice-derived']]
assert len(goals)==650 and len(views)==39 and len(profiles)==439 and len(inventory)==7
targets=[r['goalId'] for r in inventory];ends=[r['goalId'] for r in inventory if r['packageId']=='02-he-practice-derived']
heviews=[v['viewId'] for v in views if v['scope'].get('jurisdiction')=='DE-HE']
arrviews=[v['viewId'] for v in views if v['scope'].get('jurisdiction') in JURIS and v['scope'].get('courseProfile') in ['GK','LK']]
assert len(heviews)==4 and len(arrviews)==8
compiled={r['goalId']:r for report in json.loads(APV.read_text())['reports'] if report['landscapeId']==can['landscapeId'] for r in report['goals']}
def walk(nodes):
    for n in nodes:
        yield n
        yield from walk(n.get('children',[]))
def projection(v):
    cl={}
    def sub(i,r,d,path=()):
        assert i not in path
        cl.setdefault(i,[]).append((-d,r))
        for q in goals[i].get('contains',[]):sub(q,r,d+1,path+(i,))
    for n in walk(v['rootNodes']):
        if n['kind']=='goalEntry':cl.setdefault(n['goalId'],[]).append((1000000,n.get('projectionRole','target')))
        elif n['kind']=='canonicalSubtree':sub(n['goalId'],n.get('projectionRole','target'),0)
    return {i:('target' if any(r=='target' and d==max(a for a,b in rr) for d,r in rr) else 'prerequisiteOnly') for i,rr in cl.items()}
def closure(ids):
    seen=set();st=list(ids)
    while st:
        q=st.pop()
        if q in seen:continue
        seen.add(q);st.extend(goals[q].get('requires',[]))
    return seen
before_roles={v['viewId']:projection(v) for v in views}
missing_by_view={}
for vid in heviews:
    applicable_ends=[i for i in ends if viewmap[vid]['scope']['courseProfile'] in goals[i]['tags']]
    missing_by_view[vid]=sorted(i for i in closure(applicable_ends) if not goals[i].get('contains') and goals[i].get('semanticKind')!='orientation' and before_roles[vid].get(i)!='target' and before_roles[vid].get(i,'absent')=='absent')
he_teachers=sorted(set().union(*map(set,missing_by_view.values())))
assert len(he_teachers)==11 and all(i not in targets for i in he_teachers)
assert sum(map(len,missing_by_view.values()))==40

source_bounds={
 'DE-HH':'Hamburg GYO2022, physisch/gedruckt30, S1–4/2.4: gemeinsamer Inhalt ist Brønsted, Oxonium/Hydroxid, pH und starke Säure-/Basentitration; zusätzliche quantitative schwache Protolyse/Titrationskurven sind erhöht. Die ganze neunstoffige Arrhenius-Namens-/Lösungsroutine steht hier nicht als Vollvorgabe. Sie wird als eigener vorbereitender Erwerbsumfang für die schon verfassten GK/LK-Targets beibehalten; keine zusätzliche amtliche Pflicht oder tatsächliche Themenwahl.',
 'DE-MV':'MV Erprobungsfassung Gymnasium11/12, physisch28/gedruckt24 nennt Arrhenius im gemeinsamen verbindlichen Inhalt links; rechts stehen Hinweise. Physisch29/gedruckt25 beginnt ausdrücklich zusätzlich LK. Der gemeinsame Arrheniuskontext trägt die Grundidee, schreibt aber nicht sämtliche neun Stoff-/Lösungsnamen und jeden ganzen P-Transfer vor. Die vollständige eigene Routine ergänzt beide vorhandenen GK/LK-Targets, ohne LK-Zusätze umzudeuten oder Indikator-/Titrationsversuche als ausgeführt auszugeben.',
 'DE-ST':'ST Fachlehrplan2022, physisch/gedruckt26–27 sind ausdrücklich Schuljahrgänge7/8: Arrhenius-Säure/Base, ausgewählte Namen/Formeln und Ionen.40 ist11/12 gAN,49 eAN mit Brønsted/Protolyse und zusätzlichen quantitativen schwachen Gleichgewichten. Die ganze feste neunstoffige Wiederholungsroutine wird als eigene Grundlage der bestehenden CrossStage-GK/LK-Targets aufgenommen; die SekI-Quelle wird nicht als aktuelle vollständige SekII-Kursvorschrift umetikettiert. Alle verbindlichen realen Schülerexperimente bleiben separat.',
 'DE-TH':'TH2024, physisch23/gedruckt18, Abschnitte2.1.1.5/6: ausgewählte Säure-/Metallhydroxidnamen, Formeln, Arrhenius-Dissoziation und Stoff/Lösungsunterscheidung.36/31 enthält Brønsted-Abgrenzung in einer späteren Zusatzspalte;43/38 erklärt die getrennten gAN/eAN-Spalten der Oberstufe. Dies ist kein Vollkredit für die feste neun Stoffe umfassende Routine in jedem Kurs. Die schon authored GK/LK-Targets erhalten eine explizite eigene Wiederholungsgrundlage; keine reale Herstellung oder Kurswahl wird behauptet.',
 'DE-HE':'HE gepinnte KC-Datei:24–28 enthalten E1–E12 und B10–B14;35 E.2 nennt die neun Säuren/Hydroxide als Wiederholung.33/45–49 trennen Themenfeld-/Erlass- und gAN/eAN-Grenzen:46 dynamisches Gleichgewicht/Le Chatelier,47 Protolyse/Redox; quantitative schwache Säuren und Titrationskurven sind LK-Zusätze. Die ganzen eigenen Hypothesen-, Analyse-, Digital-, Reflexions-, Gültigkeits-/Nachhaltigkeits- und BW-Protokollfälle sind konkrete eigene Grundlagen zu bereits authored lokalen HE-Endpunkten. Diese Erweiterung umfasst im GK auch ausdrücklich eigene mathematische/analytische Vertiefungen über die genannte amtliche GK-Zeile hinaus. Sie beansprucht weder exakte amtliche Vollabdeckung noch persönliche Wahl, beseitigt keine alten BY-C11-Kurs-/Quellenholds und erteilt keine Laborfreigabe.',
 'DE-BW':'BW BP2016/V2 vom25.03.2022: physisch27/gedruckt25 Basisfach3.3.2(7) fordert experimentelle Gleichgewichtsuntersuchung. Physisch33/31 Leistungsfach3.4.2(6) fordert das tatsächliche Modellexperiment;41/39 Leistungsfach3.4.7(6) tatsächliche Zellspannungsmessung. Die eigenen vollständigen Fe/SCN-, Austausch- und hochohmigen Zellprotokolle konkretisieren diese ursprünglichen Grenzen. Ihre eigene HE-Verwendung überträgt keine BW-Kursnorm und erlässt keine Ausführungspflicht.'}

scope_text={
 '28bb9d15':'Whole unchanged nine-substance Arrhenius P: five acid/four hydroxide names and formulas, solution names, hydrated H3O+/OH-, HCl(g) versus hydrochloric acid, clear limewater and conditional dissociation/solubility. Existing18-card bidirectional recall remains separate.',
 'd2d735de':'Whole unchanged actual experimental concentration-variation skill: Fe(III)/SCN controls, matched addition/blank/temperature, Q versus K and dilution/colour limits, both complete original protocols and fresh independent disturbance. Real observed actions and own raw records remain necessary.',
 'a0f6ba09':'Whole unchanged actual reversible water-exchange model: both transfers from one round start, all recorded amounts and continuing positive rates, conservation/resolution, swapped fractions/starting state and changed-rule/leak transfers. It is not a chemical transformation or measured molecular rate.',
 '7b39fa19':'Whole unchanged actual high-impedance galvanic voltage measurement: corresponding half-cells, compatible bridge, polarity, near-open-circuit versus standard/load, condition-specific comparison and fresh lead/AgCl issues. Own observed assembly and raw measurements remain necessary.',
 '75e2eff1':'Whole unchanged own lower-question/hypothesis P in this upper-stage preparatory module: sugar rate versus solubility and apple browning; own testable question, reasoned prediction, controls and counterfinding without invented performance.',
 '503dedcb':'Whole unchanged own theory-based question P: provided weak-acid approximation and tenfold dilution, strong-acid contrast, Q/K perturbation, product removal and catalyst limits. In HE GK this deliberately includes own extra quantitative weak-acid work rather than an official GK requirement.',
 'f79f15c0':'Whole unchanged mostly independently planned AND actually executed qualitative/quantitative acid or dye investigation, substance-specific release, own raw logs/standards, endpoint choice, common-standard bias and calibration-domain/new-dilution transfer. No paper value replaces execution.',
 '9e3fae29':'Whole unchanged own actual digital workbook on labelled synthetic calibration and first-order kinetics: raw versions, offset/regression, formulas, scatter/residuals, validity flag, changed data/refit and bounded hypothesis inference. Author calculations are not a learner file.',
 '99d41b0f':'Whole unchanged reflection on actually own guided sugar or own planned ion investigation, own logs and method decisions, concrete recorded uncertainty and improved next investigation. Supplied model logs do not satisfy this requirement.',
 'a8800c36':'Whole unchanged analysis of supplied foreign metal-displacement/gas archives, controls, observation versus interpretation and limits; new product analysis/contamination controls. It does not establish own execution or the full five-criterion E12 performance.',
 'a0080b5f':'Whole unchanged application of all five scientific validity criteria to validated counterfinding and Q-versus-K/temperature contexts, calibration missing, and a new testable bounded claim. Repetition alone does not validate a faulty device.',
 '9f892457':'Whole unchanged historical AND current effects of products/methods/processes/knowledge, all environmental/economic/social perspectives, own possible action and fresh knowledge-access/leakage transfer, with original primary source and model boundaries.'}
newcan=copy.deepcopy(can);newgoals={g['id']:g for g in newcan['goals']};goal_changes=[]
for gid in [ARR]+he_teachers:
    before=copy.deepcopy(goals[gid]);after=newgoals[gid]
    assert 'applicabilityOverrides' not in after.get('extendedData',{}) and 'skillPilotAcquisitionExtensions' not in after.get('extendedData',{})
    js=JURIS if gid==ARR else ['DE-HE'];after.setdefault('extendedData',{})['applicabilityOverrides']={'jurisdiction':js}
    ext=[]
    for j in js:
        vids=[vid for vid in arrviews if viewmap[vid]['scope']['jurisdiction']==j] if gid==ARR else [vid for vid in heviews if gid in missing_by_view[vid]]
        ext.append({'extensionId':'arrhenius-or-HE-terminal-foundation-'+j+'-'+gid[:8],'jurisdiction':j,'viewIds':vids,
         'courseProfiles':sorted({viewmap[v]['scope']['courseProfile'] for v in vids}),'stageIntent':'SekII foundation in retained current CrossStage/SekII views; no new stage override',
         'role':'own-explicit-acquisition-foundation-for-retained-targets','officialWholeSourceCredit':False,'sourceContextAndLimits':source_bounds[j],
         'wholeUnchangedAcquisitionScope':scope_text[gid[:8]],
         'compilerInputBoundary':'Only existing supported applicabilityOverrides.jurisdiction is used; course/stage/view fields describe placements and do not implement new compiler dimensions.',
         'practicalEvidenceBoundary':'All original actual execution, independent planning, own raw log/digital product/reflection and local safety-release duties remain. Synthetic numbers, author answers and old review metadata are not learner evidence.',
         'officialChoiceBoundary':'Concrete own route supporting already authored targets; no universal state requirement, personal theme selection or new runtime topic selector is claimed.'})
    after['extendedData']['skillPilotAcquisitionExtensions']=ext
    restored=copy.deepcopy(after);restored['extendedData'].pop('applicabilityOverrides');restored['extendedData'].pop('skillPilotAcquisitionExtensions');assert restored==before
    goal_changes.append({'goalId':gid,'beforeDigest':digest(before),'afterDigest':digest(after),'before':before,'after':copy.deepcopy(after),'onlyChangedFields':['extendedData.applicabilityOverrides','extendedData.skillPilotAcquisitionExtensions']})
for gid in goals:
    if gid not in [ARR]+he_teachers:assert goals[gid]==newgoals[gid]
assert all(goals[i]==newgoals[i] and goals[i]['extendedData'].get('applicabilityFromRequires') is True and goals[i]['nodeKind']=='exam' and not goals[i]['contains'] and set(goals[i]['requires'])==set(goals[i]['examData']['coveredGoalIds']) for i in ends)
assert goals[MEM]==newgoals[MEM] and not newgoals[MEM]['extendedData'].get('applicabilityOverrides')

newviews=copy.deepcopy(views);newviewmap={v['viewId']:v for v in newviews};view_changes=[];new_pairs=[]
for vid in heviews:
    before=copy.deepcopy(viewmap[vid]);after=newviewmap[vid];assert all(n['kind']=='structure' for n in after['rootNodes'])
    teaching_ids=missing_by_view[vid]
    after['rootNodes'].append({'kind':'structure','id':vid+'-retained-terminal-own-acquisition-foundations','label':'Eigener Lernpfad: Grundlagen zu den vorhandenen Übungs- und Prüfungszielen',
      'children':[{'kind':'goalEntry','goalId':i,'projectionRole':'target'} for i in teaching_ids]})
    restored=copy.deepcopy(after);restored['rootNodes'].pop();assert restored==before
    before_r=before_roles[vid];after_r=projection(after)
    for i,r in before_r.items():assert after_r[i]==r
    assert set(after_r)-set(before_r)==set(teaching_ids)
    new_pairs.extend({'viewId':vid,'goalId':i,'beforeRole':'absent','afterRole':'target'} for i in teaching_ids)
    view_changes.append({'viewId':vid,'beforeDigest':digest(before),'afterDigest':digest(after),'before':before,'after':copy.deepcopy(after),'addedOwnAcquisitionGoalIds':teaching_ids,'existingRoleDeletedOrDemoted':False})
for vid in viewmap:
    if vid not in heviews:assert viewmap[vid]==newviewmap[vid]
assert len(new_pairs)==40
cas={'role':'INACTIVE_WHOLE_OBJECT_COMPARE_AND_SWAP_PROPOSAL','baseWholeCanonical':pin(C20),'baseWhole39Views':pin(V39),'baseWholeP439':pin(P439),
 'ordinaryWholeGoalChanges':goal_changes,'wholeHEViewChanges':view_changes,
 'unchangedDerivedAssessmentWholeGoals':[{'goalId':i,'wholeGoal':goals[i],'digest':digest(goals[i])} for i in ends],
 'unchangedArrheniusMemoryWholeGoal':{'goalId':MEM,'wholeGoal':goals[MEM],'digest':digest(goals[MEM])},
 'wholePositiveProfileChanges':[],'noAutoApply':True,'onAnyWholeBaseOrObjectMismatch':'abort/rebase; never partially apply or patch around failed guards','normalL6L7WritesAuthorized':False}
caspath=write('CAS.whole-twelve-ordinary-goals-and-four-HE-views.unapplied.json',cas)
cpath=write('candidate.canonical650.arrhenius-and-HE-teachers.private.json',newcan);vpath=write('candidate.whole39views.with-four-HE-teacher-branches.private.json',newviews)

cfgpath=CAP/'curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json';cfg=json.loads(cfgpath.read_text());mpath=CAP/cfg['reviewPath'];crpath=CAP/cfg['cardReviewPath']
mrows=[json.loads(l) for l in mpath.read_text().splitlines()];cardrows=[json.loads(l) for l in crpath.read_text().splitlines()]
mr=[{'goalId':r['goalId'],'existingInputRole':r['status'],'memoryGoalIds':r.get('memoryGoalIds',[]),'deckIds':r.get('deckIds',[]),'notNewFormalMVote':True} for r in mrows if r['goalId'] in [ARR]+he_teachers]
assert next(r for r in mr if r['goalId']==ARR)['memoryGoalIds']==[MEM]
origins=sorted(r['goalId'] for r in mrows if r['status']=='memory_required' and MEM in r.get('memoryGoalIds',[]));assert origins==[ARR]
deckpaths=sorted((CAP/'curricula/DE/Gymnasium/memory-decks').glob('*.json'));decks={json.loads(p.read_text())['deckId']:(p,json.loads(p.read_text())) for p in deckpaths}
exclude={'structure','root','module','lesson','vocabulary','grammar','practice','memorization','A1','A2','B1','B2','C1','C2'};selections=[]
for g in goals.values():
    if g.get('nodeKind')!='memory' and 'memorization' not in g.get('tags',[]):continue
    ts=g['tags'];filters=[t for t in ts if t.startswith('select:')]
    if not filters:filters=[t for t in ts if not t.startswith('srs-deck') and t not in exclude]
    did=next(t.split(':',1)[1] for t in ts if t.startswith('srs-deck:'));p,d=decks[did]
    cards=[c['id'] for c in d['cards'] if not filters or set(filters)&set(c.get('tags',[]))]
    selections.append({'goalId':g['id'],'actualFilterTags':filters,'actualSelectedCardIds':cards,'actualDeckPin':pin(p),'selectionRule':'Unchanged select-tag priority; otherwise OR overlap; no all-of origin rewrite.'})
assert len(selections)==67 and len(deckpaths)==7
arrsel=next(r for r in selections if r['goalId']==MEM);assert len(arrsel['actualSelectedCardIds'])==18
arrdeck=decks['de_gymnasium_chemistry_arrhenius_names_formulas'][1]
arrcards=[c for c in arrdeck['cards'] if c['id'] in arrsel['actualSelectedCardIds']]
arrcardbindings=[{k:r[k] for k in ['deckId','cardId','status','necessary','originGoalIds'] if k in r} for r in cardrows if r['cardId'] in arrsel['actualSelectedCardIds']]

source_rows=json.loads((OUT/'PRIMARY.discovery.json').read_text());pages={'DE-HE':[24,25,26,27,28,32,33,35,45,46,47,48,49],'DE-BW':[27,33,34,41],'DE-HH':[30],'DE-MV':[28,29],'DE-ST':[26,27,40,49],'DE-TH':[22,23,29,30,36,43]};primary=[]
for r in source_rows:
    j=r['jurisdiction'];assert pin(r['originalPDF']['path'])==r['originalPDF'];ps=Path(r['ownWholeExtraction']).read_text().split('\f');literal=[]
    for n in pages[j]:
        p=OUT/f'{j}-physical-{n}.whole.layout.txt';p.write_text(ps[n-1]+'\n');literal.append({'physicalPageOneBased':n,'wholeLiteralLayoutText':ps[n-1],'ownPageExtractionPin':pin(p)})
    primary.append({'jurisdiction':j,'originalPrimaryPDF':r['originalPDF'],'wholeRelevantOriginalPages':literal,'courseAndSourceBoundary':source_bounds[j],'officialWholeTargetCredit':False})
rasters=[pin(p) for p in sorted(OUT.glob('primary-*-*.png'))]
assert len(rasters)==9
practical_material=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-q3-three-BW-context-bound-practical-companions-author-v1/science/whole-six-new-practical-protocol-cases.de-en.author-candidate.json'
methods_material=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-b008-colour-calibration-domain-targeted-author-v10/fifty-two-cases.de-en.author-candidate.json'
methodkeys={c['id'] for i in he_teachers if profiles[i]['archetype']!='experiment' or not i.startswith(('d2d735de','a0f6ba09','7b39fa19')) for c in profiles[i]['applicationCaseBriefs']}
selected_method_cases=[{k:v for k,v in c.items() if k in ['caseKey','candidateKey','originalFamilyGoalId','materialOrigin','suppliedMaterial','learnerTask','expectedAnswer','requiredAssessmentCriteria','transfer','sourceOperatorScopeContractDe']} for c in json.loads(methods_material.read_text())['cases'] if c['caseKey'] in methodkeys]
assert len(selected_method_cases)==16
exam_source_paths=sorted({goals[i]['examData']['sourceArtifactPath'] for i in ends})
source_tasks=[{'originalArtifactPin':pin(p),'wholeOriginalTaskArtifact':(ROOT/p).read_text()} for p in exam_source_paths]
contexts=closure(targets+he_teachers)
relatedmem=set()
for r in mrows:
    if r['goalId'] in contexts:relatedmem.update(r.get('memoryGoalIds',[]))
contexts.update(relatedmem)
original_pairs=[]
for r in inventory:
    for vid in r['viewIds']:
        assert before_roles[vid].get(r['goalId'])=='target'
        original_pairs.append({'packageId':r['packageId'],'goalId':r['goalId'],'viewId':vid,'scope':viewmap[vid]['scope'],'existingProjectionRole':'target','actualBeforeCompiledApplicability':compiled[r['goalId']]['compiledApplicability'],'actualBeforeEvidence':compiled[r['goalId']]['evidence']})
assert len(original_pairs)==32
rolecontext=[]
for vid in heviews+arrviews:
    roots=[r['goalId'] for r in inventory if vid in r['viewIds']];cl=closure(roots);after_r=projection(newviewmap[vid]);prior_support=[]
    for i in sorted(cl):
        if before_roles[vid].get(i)=='prerequisiteOnly':prior_support.append({'goalId':i,'title':goals[i]['title'],'ordinary':not bool(goals[i].get('contains')),'roleRemains':'prerequisiteOnly'})
    missing_ordinary=[{'goalId':i,'title':goals[i]['title'],'role':after_r.get(i,'absent')} for i in sorted(cl) if i not in roots and not goals[i].get('contains') and goals[i].get('semanticKind')!='orientation' and after_r.get(i)!='target']
    rolecontext.append({'viewId':vid,'scope':viewmap[vid]['scope'],'wholeRelevantRequiresClosure':[{'wholeGoal':goals[i],'wholeProfile':profiles.get(i),'beforeRole':before_roles[vid].get(i,'absent'),'afterRole':after_r.get(i,'absent'),'currentCompiledApplicability':compiled[i]['compiledApplicability']} for i in sorted(cl)],
      'retainedPriorSupportRoles':prior_support,'ordinaryAcquisitionRoleBoundariesAfterProposal':missing_ordinary,'actualMasteryOfSupportNotKnown':True})
derivation=[]
for i in ends:
    g=goals[i];req=g['requires'];scope_sets=[set(compiled[q]['compiledApplicability'].get('jurisdiction',[]))|({'DE-HE'} if q in he_teachers else set()) for q in req]
    inter=sorted(set.intersection(*scope_sets));assert 'DE-HE' in inter
    derivation.append({'goalId':i,'existingRule':'applicabilityFromRequires=true; assessment-requires intersection of all unchanged mandatory requires','wholeExistingEndpoint':g,
       'wholeExistingRequiredTeachers':[goals[q] for q in req],'coveredGoalIdsExactlyEqualRequires':set(req)==set(g['examData']['coveredGoalIds']),
       'onlyTerminalAssessmentNoNewOrdinaryRule':True,'unmodifiedWholePAndRealExecutionDuties':True,'expectedJurisdictionIntersectionAfterOrdinaryInputs':inter,'actualAfterCompilerObserved':False})
inputs=[pin(p) for p in [C20,V39,P439,INV,MEASURE,APV,cfgpath,mpath,crpath,practical_material,methods_material,ROOT/'app/scripts/applicabilityCompiler.ts',ROOT/'app/src/utils/srsTags.ts',ROOT/'app/src/components/srs/FlashcardDrill.tsx']]+[pin(p) for p in deckpaths]
clean={'role':'CLEAN_WHOLE_CONTENT_FOR_TWO_OTHER_INDEPENDENT_REVIEWERS','authorIsIndependentReviewerOfThisCandidate':False,'packageIds':['01-arrhenius-memory','02-he-practice-derived'],
 'baseWholeCanonical':pin(C20),'baseWhole39Views':pin(V39),'actualCurrentWholeP439':pin(P439),'inputPins':inputs,'guardedWholeCAS':cas,'candidateWholeCanonical':pin(cpath),'candidateWhole39Views':pin(vpath),
 'wholeCurrentSevenInventoryTargets':[goals[i] for i in targets],'actualOriginal32TargetViewContexts':original_pairs,
 'wholeTwelveOrdinaryBeforeAndAfterGoals':goal_changes,'wholeTwelveUnchangedCurrentPositiveProfiles':[{'goalId':i,'wholeProfile':profiles[i]} for i in [ARR]+he_teachers],
 'wholeFourHEViewChanges':view_changes,'wholeEightOtherAffectedViews':[viewmap[v] for v in arrviews],
 'wholeCurrentFiveTerminalTasksSolutionsRubrics':[goals[i] for i in ends],'actualFiveExistingDerivedRuleChecks':derivation,
 'wholeActualTeacherAndSupportRoleContexts':rolecontext,'newFortyExplicitOrdinaryAcquisitionPlacements':new_pairs,
 'wholeCurrentContextGoalsAndProfiles':[{'wholeGoal':goals[i],'wholeCurrentProfile':profiles.get(i)} for i in sorted(contexts)],
 'wholeSixOriginalPracticalMaterialCases':json.loads(practical_material.read_text())['cases'],'originalSixCaseSource':pin(practical_material),
 'wholeSixteenOriginalMethodMaterialCasesContentOnly':selected_method_cases,'originalMethodCaseSource':pin(methods_material),'wholeOriginalEndpointTaskArtifacts':source_tasks,
 'operativeMaterialBoundary':'All actual current full P bodies and full exam tasks/rubrics remain operative and unchanged. Retained original historical cases supply complete material/procedure/reference data; later current P clarifications/transfer duties are retained and no original answer key is learner evidence.',
 'primarySourcesWithWholePagesAndActualCourseBoundaries':primary,'originalPrimaryPageRastersActuallyViewed':rasters,
 'additionalActuallyReadPrimaryCaptures':json.loads((OUT/'PRIMARY.external-captures.json').read_text()),'actualIEA2021PrimaryReadingCapture':json.loads((OUT/'PRIMARY.IEA-capture.json').read_text()),
 'externalPrimaryReadingBoundary':'BASF1913 opening paragraphs, UNEP2022 Twenty Questions preface/ozone-substitute-and-climate distinction, UNEP About Montreal introduction/substitution sections and IEA2021 Executive Summary read. Blocked local HTTP403 captures are explicitly not claimed as binary pins; the actual successful captures and URL/read-section witness remain distinct. No current legal compliance, updated2026 numerical estimate or real company/learner measurement is asserted.',
 'actualCurrentMemoryInputsForTwelveOrdinaryGoals':mr,'arrheniusOnlyCurrentReviewedOrigin':origins,'wholeUnchangedArrheniusMemoryGoal':goals[MEM],
 'wholeActualEighteenArrheniusCards':arrcards,'actualCurrentArrheniusCardOriginInputsNoNewVote':arrcardbindings,'all67UnchangedActualMemorySelections':selections,'allSevenActualUnchangedDeckPins':[pin(p) for p in deckpaths],
 'memoryBoundary':'18 existing cards cover nine substance/formula pairs bidirectionally; tags select them with existing OR semantics. Conceptual Arrhenius P is separate from recall. Compiler visibility follows the single actual28bb origin; no independent memory override and no all-of origin change.',
 'noNewScopeOverrideOnAnyTerminalAssessmentOrMemory':True,'ordinaryContentRequiresAndGoalTextsChanged':False,'PBodyCardDeckImageChanges':[],
 'sourceCreditBoundary':'New entries are explicit own acquisition scope and placements supporting already authored targets. They confer no exact/full official source mapping, actual course/theme choice, human permission or source-partner clearance.',
 'finiteOverlapForLaterComposition':[{'goalId':i,'note':'Also belongs to inventory07; this package adds only its concrete HE prerequisite acquisition route. Other independently reviewed source scopes must be combined by explicit rebase/new whole-object guards, never blind sequential application.'} for i in he_teachers if i.startswith(('75e2eff1','503dedcb'))],
 'questions':['Check the whole Arrhenius P, eighteen real selected cards, real source/course boundaries and actual one-origin visibility route. Is the own four-jurisdiction foundation justified without an independent memory override?',
 'Judge the five actual existing assessment-requires endpoints from their whole tasks/solutions/rubrics and unchanged mandatory teachers. Does every endpoint remain terminal, while each true ordinary experimental skill retains actual execution?',
 'Judge each of the eleven concrete missing HE teacher capabilities and their forty own acquisition placements. Does this fix a real missing prerequisite-learning route rather than merely make the five endpoints visible?',
 'Check the ordinary twelve whole-goal/four whole-view CAS, exact old roles and five retained ordinary SekI support roles. Do not infer their mastery, a complete path, or final compiler acceptance.',
 'Check all original full material/transfer/actual-execution duties, current P9 bodies and actual memory selection semantics. Do not read AUTHOR rationale or peer findings before the reviewer own sealed FIRST.'],
 'canonicalRecordCount':650,'wholeViewCount':39,'protectedCurricularAtomicBaseline':439,'oldTargetSupportMemoryRolesDeletedOrDemoted':False,
 'normalMainOtherCapsuleWrites':False,'fullAPVNativeOrBuildPerformed':False,'actualAfterCompilerObserved':False,'M7':False,'HumanApproval':False,'HumanTrial':False,'actualLearnerPerformance':False,'hostAcceptance':False}
reviewpath=write('REVIEW-INPUT.clean-arrhenius-and-five-HE-endpoints-whole-content.json',clean)
selectorpath=write('SELECTOR.clean-content-for-two-other-reviewers.json',{'role':'CLEAN_WHOLE_CONTENT_ONLY_FOR_TWO_OTHER_INDEPENDENT_REVIEWERS','authorIsIndependentReviewer':False,'reviewInput':pin(reviewpath),'wholeGuardedCAS':pin(caspath),
 'readingBoundary':'No AUTHOR rationale, old review votes or peer findings before your own sealed FIRST. Existing embedded canonical review metadata is frozen historical base metadata, not a new verdict. Whole current tasks, profiles, primary pages, cards and exact role changes are the operative input.',
 'M7':False,'HumanApproval':False,'normalL6L7Writes':False})

mathchecks={'sourceType':'own arithmetic on original synthetic teaching material; no actual experiment',
 'arrheniusCaOH2Ratio':{'Ca2+':1,'OH-':2},'exchangeStationaryCases':[{'forwardFraction':1/3,'reverseFraction':1/6,'total':90,'stationaryA':30,'stationaryB':60,'positiveTransfer':10},{'forwardFraction':1/6,'reverseFraction':1/3,'total':90,'stationaryA':60,'stationaryB':30,'positiveTransfer':10}],
 'voltageMeans':[sum([1.082,1.086,1.085])/3,sum([0.421,0.425,0.424])/3],
 'voltageRanges':[max([1.082,1.086,1.085])-min([1.082,1.086,1.085]),max([0.421,0.425,0.424])-min([0.421,0.425,0.424])],
 'weakAcidTenfoldDilutionDeltaPH':0.5,'strongAcidTenfoldDilutionDeltaPH':1,
 'f79TwofoldNominalFactorBounds':[19.98/10.02,20.02/9.98],'digitalKineticsHalfLifeIfK005':math.log(2)/0.05,
 'acidEndpointSyntheticConcentrations':[0.1000*sum(z)/len(z)/10 for z in [[9.95,10.05,10.00],[5.02,4.98,5.01],[2.51,2.49,2.52]]]}
mathpath=write('CHECK.own-synthetic-arithmetic-not-execution.json',mathchecks)
boundary_by_view=[{'viewId':r['viewId'],'retainedOrdinarySupportNotPromoted':[q for q in r['retainedPriorSupportRoles'] if q['ordinary']],'noMasteryClaim':True} for r in rolecontext if r['viewId'] in heviews]
rationale={'role':'AUTHOR_RATIONALE_SEPARATE_FROM_CLEAN_FIRST_INPUT','createdAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'ai_candidate','humanReviewStatus':'needs_human_review','packageIds':['01-arrhenius-memory','02-he-practice-derived'],
 'contentDecision':'KEEP whole current12 ordinary goals/P bodies,5 whole current endpoint tasks/solutions/rubrics,18 Arrhenius cards and all decks; no content error requiring a new P/body/image/card mutation was established.',
 'arrheniusReasonDe':'Die neun Stoffe sind eine klar begrenzte Wiederholungsroutine: Namen/Formeln, wässrige H3O+/OH--Wirkung, Stoff/Lösung,1:2 beim zweiwertigen Hydroxid und Grenzen schwacher Säuren/Löslichkeit. Der Rückwärtsabruf liegt in18 bestehenden Karten, ersetzt aber die chemische Erklärung nicht. HH/MV/ST/TH-Kontexte tragen konkrete Anschlüsse; die vollständige feste Liste ist dort nicht universell wortgetreu vorgeschrieben. Vier eigene ordinary jurisdiction-Eingaben erhalten die acht vorhandenen Erwerbsplätze. Der vorhandene Memoryknoten folgt seinem tatsächlichen einzigen28bb-Origin; ein eigener Memoryoverride wäre eine sachlich falsche Ursache.',
 'HEReasonDe':'Alle fünf Ziele sind bereits echte terminale exam-Endpunkte mit unveränderten Pflichtlehrern und coveredGoalIds. Ihre vorhandene assessment-requires-Intersection ist richtig; sie ist nicht die Fehlerursache. Tatsächlich fehlen neun direkte gewöhnliche Erwerbslehrer plus zwei tiefere gewöhnliche Grundlagen als HE-Targets und Scope. Deshalb werden genau diese elf vorhandenen ganzen Fähigkeiten explizit als eigener HE-Erwerbspfad angeboten, in40 schon fehlenden ordinary Platzierungen: neun je GK und elf je LK, jeweils in CrossStage und SekII. Die drei echten experimentellen Lehrer bleiben gewöhnliche experiment-Ps; sie werden nicht zu abgeleiteten Assessments umgebaut. Die fünf Endpunkte und alle requires bleiben unverändert. Die Anwendung wird an den realen ganzen Aufgaben und HE E1–E12/B10–B14 sowie Q3-Kontexten begründet, nicht an16 weniger Filterausfällen.',
 'wholeTeacherReasons':[{'goalId':i,'title':goals[i]['title'],'wholePerformanceKept':scope_text[i[:8]],'parentEndpointsUsingIt':[e for e in ends if i in closure(goals[e]['requires'])]} for i in he_teachers],
 'sourceBoundaries':source_bounds,
 'experimentalBoundaryDe':'Fe/SCN-Modelldaten begrenzen Farb-/Verdünnungsdeutung undQ/K, sind kein Durchführungslog. Das Austauschmodell bewahrt90mL, zeigt weiterhin positive gleiche Transfers und ist keine chemische Reaktion. Die hochohmigen Messwerte1,0843/0,4233V werden mit bedingungsspezifischen Referenzen verglichen; weder0,100mol/L noch10MΩ bedeuten ideale Standard-/exakt stromlose Bedingungen. Alle realen Aufbauten, Kontrollen, Beobachtungen und Entsorgungs-/SOP-Pflichten bleiben unverzichtbar. Die große saure Eigenuntersuchung verlangt weiterhin selbst formulierte Hypothese/Plan, tatsächliche qualitative UND quantitative Durchführung, eigenes digitales Produkt und eigene Prozessreflexion. Der schriftliche Ammoniakendpunkt verlangt weiterhin fünf Gültigkeitskriterien, Geschichte/Gegenwart, drei Perspektiven und eigene mögliche Handlung; kein Hochdruckversuch wird angeboten.',
 'fiveRetainedOrdinarySupportRoleBoundaries':boundary_by_view,
 'boundedResultDe':'Die32 vorhandenen ausgeschlossenen Ziel/View-Paare erhalten einen begrenzten, ursächlichen Vorschlag;40 zusätzlich explizite gewöhnliche Erwerbsplätze sind für die tatsächlichen HE-Voraussetzungen nötig. Dies ist keine vollständige Pfadschließung und keine Erledigung der fünf bewusst prerequisiteOnly bleibenden SekI-/Sicherheitsgrundlagen in den reinen SekII-Ansichten. Deren globales Mastery ist unbekannt und darf nicht als vorhanden erfunden werden.',
 'scopeGuardBoundary':'12 whole ordinary goal CAS +4 whole HE view CAS on exact current Post20 base. No terminal, memory, atom/text/edge/P/image/deck mutation. Only existing supported jurisdiction override; no new runtime selector/stage/course dimension.',
 'parallelPackageOverlap':clean['finiteOverlapForLaterComposition'],
 'open':['Two foreign independent FIRSTs','actual new compiler result','final current P/D/M/V/native/source/context bindings','actual learner acquisition, files, practical execution and logs','actual mastery of retained support prerequisites','any source-partner/individual-choice/human/host acceptance'],
 'normalMainL6L7OtherCapsulesMutated':False,'M7':False,'HumanApproval':False,'HumanTrial':False,'actualLearnerPerformance':False,'hostAcceptance':False}
rpath=write('AUTHOR.scientific-rationale.separate.json',rationale)
md=OUT/'AUTHOR.scientific-rationale.separate.md'
with md.open('x') as f:
    f.write('# Autorstand Pakete01/02 – vor fremdem FIRST getrennt halten\n\n`ai_candidate / needs_human_review`. Kein Autor kann diesen eigenen Stand später unabhängig akzeptieren.\n\n'+rationale['arrheniusReasonDe']+'\n\n'+rationale['HEReasonDe']+'\n\n'+rationale['experimentalBoundaryDe']+'\n\n'+rationale['boundedResultDe']+'\n\n## Quellen und Kursgrenzen\n\n'+'\n\n'.join(j+': '+v for j,v in source_bounds.items())+'\n\nDer historische Stoffkontext wurde an [BASF1913](https://www.basf.com/global/en/who-we-are/history/chronology/1902-1924/1913), der zeitgebundenen [IEA-Roadmap2021](https://www.iea.org/reports/ammonia-technology-roadmap/executive-summary) und den [UNEP20-Fragen2022](https://ozone.unep.org/20-questions-and-answers) tatsächlich gelesen. Keine heutigen regulatorischen oder aktualisierten2026-Zahlen werden daraus abgeleitet. Erfolgreiche Binärcaptures und blockierte lokale403-Abrufe sind getrennt dokumentiert.\n\n## Noch offen\n\n'+ '\n'.join('- '+s for s in rationale['open'])+'\n\nDie beiden inventory07-Ziele75e2/503d sind als HE-Voraussetzungen ebenfalls berührt. Eine spätere Zusammenfügung mit anderen Scopeänderungen verlangt neue explizite Whole-CAS-Befunde/Rebase; blindes nacheinander Anwenden ist ausgeschlossen.\n')
tech=write('CHECK.bounded-preparation-not-compiler-acceptance.json',{'role':'bounded local preparation only','basePins':inputs,'ordinaryGoalChanges':len(goal_changes),'wholeViewChanges':len(view_changes),'originalTargetViewPairsPreserved':32,'newOrdinaryTargetViewPairs':40,
 'allOldRoleAssignmentsPreserved':True,'terminalRulesWholeTasksAndRequiresUnchanged':True,'memoryWholeGoal18CardsAnd67SelectorsUnchanged':True,
 'wholeP439BodiesUnchanged':True,'allOtherGoals638Unchanged':True,'allOtherViews35Unchanged':True,'actualAfterCompilerObserved':False,'fullAPVNativeOrBuildInvocations':0,'noNormalMutation':True})
seal=write('SEAL.author-package01-02.json',{'role':'AUTHOR_PACKAGE_SEAL_NOT_INDEPENDENT_ACCEPTANCE','createdAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'ai_candidate','humanReviewStatus':'needs_human_review',
 'cleanSelector':pin(selectorpath),'cleanInput':pin(reviewpath),'wholeCAS':pin(caspath),'separateAuthorRationale':[pin(rpath),pin(md)],'boundedChecks':[pin(tech),pin(mathpath)],
 'allOwnFilesBeforeSeal':[pin(p) for p in sorted(OUT.iterdir()) if p.is_file() and p.name not in ['SEAL.author-package01-02.json','SEAL.sha256']],
 'sourceInputPins':inputs,'laterEditsRequireAdditiveSuccessor':True,'M7':False,'HumanApproval':False,'HumanTrial':False,'actualLearnerPerformance':False,'hostAcceptance':False})
(OUT/'SEAL.sha256').write_text(pin(seal)['sha256']+'  SEAL.author-package01-02.json\n')
for p in OUT.iterdir():
    if p.is_file():p.chmod(0o444)
for row in inputs:assert pin(row['path'])==row
print(json.dumps({'selector':pin(selectorpath),'reviewInput':pin(reviewpath),'CAS':pin(caspath),'seal':pin(seal),'candidateCanonical':pin(cpath),'candidateViews':pin(vpath),'ordinaryChanges':12,'viewChanges':4,'preservedOriginalPairs':32,'newRealTeacherAcquisitionPairs':40,'PChanges':0},ensure_ascii=False,indent=2))
