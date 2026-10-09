import json, pathlib, hashlib, datetime, itertools

BASE = pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09')
OWN = BASE / 'chemie-b008-nine-program-role-data-preparation-independent-b-v1'
AUTHOR = BASE / 'chemie-b008-rest-twenty-source-content-and-program-author-root-v1'
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()

def read(p): return json.loads(pathlib.Path(p).read_text())
def bind(p):
    p = pathlib.Path(p); b = p.read_bytes()
    return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(name, v):
    p = OWN / name
    with p.open('x') as f: f.write(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
    return bind(p)

first = read(OWN/'nine-program-roles.actual-contract-input.first.freeze.json')
assert all(bind(x['path']) == x for x in first['inputs'])
inp_path = AUTHOR/'nine-whole-goals.actual-official-program-boundaries.author-input.json'
inp = read(inp_path)
old_path = BASE/'chemie-b008-five-source-content-nine-program-independent-b-v1/five-content-nine-program.independent-b.scientific-first.verdict.json'
old = read(old_path)
canon_path = BASE/'chemie-b008-current-twenty-six-native-preparation-author-v1/candidate/canonical504-current26-resource-links.inactive.json'
canon = read(canon_path)
goals = {g['id']:g for g in canon['goals']}
assert set(x['goalId'] for x in old['programResults']) == set(x['goalId'] for x in inp['items'])
assert all(x['wholeCurrentProspectiveGoal'] == goals[x['goalId']] for x in inp['items'])

labels = {1:'Allgemeine naturwissenschaftliche Kompetenzen und Arbeitsweisen',2:'Verfahren zur Isolierung von Stoffen',3:'Analyseverfahren',4:'Herstellung, Prüfung und Verwendung von Grund- und Werkstoffen',5:'Mikroskopieren',6:'Untersuchungen und Beobachtungen zu grundlegenden Anforderungen an Lebewesen',7:'Ökologische Untersuchungen'}
area_by_prefix = {'3351':6,'7b44':4,'dc4a':4,'e6dc':4,'ebe2':7,'fb41':1,'fec1':5,'ffeb':4}
units=[{'id':'by-bcp-optional','kind':'program','label':'Biologisch-chemisches Praktikum: freiwilliges Zusatzfach'}]
for year in [12,13]:
    yi=f'by-bcp-year-{year}'
    units.append({'id':yi,'kind':'year','label':f'Jahrgangsstufe {year}: bei Belegung des Zusatzfachs','parentUnitId':'by-bcp-optional','order':year})
    for a,label in labels.items(): units.append({'id':f'{yi}-lb{a}','kind':'module','label':f'Lernbereich {a}: {label}','parentUnitId':yi,'order':a})
units.extend([
    {'id':'by-chem-intro','kind':'program','label':'Chemie: Einführungsjahr'},
    {'id':'by-chem-year-11','kind':'year','label':'Jahrgangsstufe 11','parentUnitId':'by-chem-intro'},
    {'id':'by-chem-11-ntg','kind':'track','label':'Naturwissenschaftlich-technologisches Gymnasium','parentUnitId':'by-chem-year-11'},
    {'id':'by-chem-11-ntg-lb1','kind':'module','label':'Wie Chemiker denken und arbeiten','parentUnitId':'by-chem-11-ntg'}])
placements=[]; roles=[]
for i,x in enumerate(inp['items']):
    gid=x['goalId']; c11=gid.startswith('e5a5')
    unit_ids=['by-chem-11-ntg-lb1'] if c11 else [f'by-bcp-year-{year}-lb{area_by_prefix[gid[:4]]}' for year in [12,13]]
    for uid in unit_ids: placements.append({'goalId':gid,'unitId':uid,'relation':'secondary','context':{'schoolForm':'Gymnasium','jurisdiction':'DE-BY','stage':'SekII'}})
    roles.append({'goalId':gid,'wholeOriginalInput':{'binding':bind(inp_path),'pointer':f'/items/{i}'},'immutableOwnScience':{'binding':bind(old_path),'pointer':f'/programResults/{i}'},
                  'sourceGoalIds':[r['sourceGoalId'] for r in x['wholeActualRouteContexts']],
                  'sourceSpans':[r['sourceSpan'] for r in x['wholeActualRouteContexts']],
                  'programme': 'C11 NTG' if c11 else 'Biologisch-chemisches Praktikum',
                  'unitIds':unit_ids,'actualSourceCourseProfile':'unspecified','authoredPlacementRelation':'secondary',
                  'conditionality':('Actual Chemie11 NTG introductory-year competence. No later GA/EA or GK/LK is asserted.' if c11 else 'Potential selected optional-subject content, not universal Chemie-GK/LK target. Original year12/13 occurrences retained; actual chosen year/content/project balance must be authored separately.'),
                  'wholeOperatorLimit':old['programResults'][i]['operatorsAndPartnerDutyLimits'],
                  'normalAtlasRouteApproved':False,'realLearnerExecutionClaim':False})

put('nine-role-program-units-and-secondary-placements.inactive.json',{'programUnits':units,'goalPlacements':placements})
put('nine-whole-original-role-bindings-and-conditionality.preparation.json',{
    'schemaVersion':1,'role':'Inactive content/placement preparation bound to existing whole9 scientific FIRST; no fresh self-review',
    'authority':'ai_candidate','status':'needs_human_review','createdAt':NOW,
    'wholeGoalCount':9,'secondaryPlacementCount':len(placements),'roles':roles,
    'normalProgrammeDataContract':'ProgramUnit and GoalPlacement interfaces in app/src/landscapeTypes.ts; no dedicated closed JSON schema was found or claimed',
    'secondaryMeaning':'Authored association for preparation. Existing placement projection acts only on primary rows; secondary rows neither create a default learner tree nor certify performance.',
    'registerInLearnerOrAtlas':False,'activeWrites':0,'strictGain':0,'humanApproval':False})

views=[]
view_schema='https://skillpilot.com/schemas/curriculum-package/v1/composition-view.schema.json'
for a in [1,4,5,6,7]:
    ids=[x['goalId'] for x in inp['items'] if not x['goalId'].startswith('e5a5') and area_by_prefix[x['goalId'][:4]]==a]
    v={'$schema':view_schema,'viewFormatVersion':'1.0','viewId':f'by-bcp-optional-lb{a}-content-catalogue-candidate','landscapeId':canon['landscapeId'],'language':'de-DE',
       'title':f'Wahlfach Biologisch-chemisches Praktikum: Lernbereich {a}',
       'scope':{'schoolForm':'Gymnasium','jurisdiction':'DE-BY','stage':'SekII'},
       'rootNodes':[{'kind':'structure','id':f'by-bcp-content-lb{a}','label':labels[a], 'children':[{'kind':'goalEntry','goalId':g,'projectionRole':'target'} for g in ids]}]}
    name=f'by-bcp-lb{a}.unregistered-content-catalogue.view.json'; vb=put(name,v);views.append({'binding':vb,'goalIds':ids,'conditionality':f'Unregistered content catalogue only; a selected programme view would need an explicit choice of this area. LB{a} is not universal ordinary Chemie-GK/LK.'})
c11ids=[x['goalId'] for x in inp['items'] if x['goalId'].startswith('e5a5')]
v={'$schema':view_schema,'viewFormatVersion':'1.0','viewId':'by-c11-ntg-content-catalogue-candidate','landscapeId':canon['landscapeId'],'language':'de-DE',
   'title':'Chemie 11 NTG: Einflüsse auf Wissen','scope':{'schoolForm':'Gymnasium','jurisdiction':'DE-BY','stage':'SekII'},
   'rootNodes':[{'kind':'structure','id':'by-c11-ntg-knowledge-content','label':'Einflüsse auf die Entwicklung chemischen Wissens','children':[{'kind':'goalEntry','goalId':g,'projectionRole':'target'} for g in c11ids]}]}
views.append({'binding':put('by-c11-ntg.unregistered-content-catalogue.view.json',v),'goalIds':c11ids,'conditionality':'Unregistered content catalogue only; actual NTG/year11 discriminator is absent from ordinary CompositionView.scope and may not be inferred from scope.stage.'})
put('unregistered-six-catalogue-views.exact-index.json',{'schemaVersion':1,'role':'Finite independently preparable content catalogues, not resolvable optional programme placement','views':views,'whole9Union':sorted(x['goalId'] for x in inp['items']),
                                                     'catalogueScopeDoesNotEncodeProgrammeOrYearSelection':True,'mustNotRegisterOrUseAsAtlasSource':True})

sets=[list(c) for n in range(3,7) for c in itertools.combinations(range(2,8),n)]
put('optional-programme-duration-selection-and-balance.preparation.json',{
    'schemaVersion':1,'role':'Actual source-grounded constraint preparation; this is companion authoring data, not a currently consumed runtime/Atlas contract',
    'actualPrimaryInputs':inp['actualOfficialSources'],'programme':'Biologisch-chemisches Praktikum','jurisdiction':'DE-BY','stage':'SekII',
    'optionalSeparateAdditionalSubject':True,'schoolAvailabilityRequired':True,'normallyWeeklyLessons':2,
    'allowedYearTerms':[[12,12],[13,13],[12,12,13,13]],
    'yearTermsMeaning':'Each year entry represents one full two-term schoolyear; repeated entries are term labels, not twice-counted content areas.',
    'actualSelectedYearTerms':None,'atLeastThreeOfSixContentAreasPerSchoolyear':True,'contentAreaUniverse':[2,3,4,5,6,7],
    'all42AreaSubsetsMeetingCountOnly':sets,'countOnlyIsNotWholeProgrammeApproval':True,
    'biologyChemistryBalance':'Independent review must judge the actual projects and their biological/chemical emphasis and workload in each schoolyear. No rigid LB2–4=chemistry/LB5–7=biology inference: isolation can concern nucleic acids; microscopy can concern materials. A three-area count alone does not prove balance.',
    'allEnumeratedContentMandatory':False,'generalLB1MustBeConsideredAtSuitablePoints':True,
    'practicalExecutionRequired':'Selected investigations/products/preparations require actual planning/conduct/documentation as stated in the complete original competence bodies. Finite synthetic examples or static views do not prove physical learner performance.',
    'whole9GoalsRemainUnchanged':True,'noExistingSourceDutyDeleted':True,
    'minimumIndependentNextInputs':['Actual selected subject/year terms and school availability','Selected practical projects from≥3 distinct areas each year','Project-specific biological/chemical balance rationale','Full retained practical operators, safety and observation/product artefacts','Separate current-source/context/ordinary checks before any active binding'],
    'normalAPIConsumesThisCompanionFile':False,'activeWrites':0,'strictGain':0,'humanApproval':False})

cfg_path=BASE/'chemie-b008-twenty-two-bounded-source-routes-independent-b-v1/technical-v2-pairing-and-source-metadata-v1/whole395-source22-reviewed-metadata.ordinary-inputs.candidate-only.json'
cfg=read(cfg_path)
assert cfg['expectedCurricularAtomicGoalCount']==395 and cfg['expectedUnresolvedScopeDecisionCount']==496
# Normal check writes nothing; preserve the exact existing complete395/496 inputs.
put('whole395-unchanged-programme-uncertainty.ordinary-inputs.candidate-only.json',cfg)
print(json.dumps({'units':len(units),'placements':len(placements),'goals':len(roles),'unregisteredViews':len(views),'areaSubsets':len(sets),'expected395':cfg['expectedCurricularAtomicGoalCount'],'expected496':cfg['expectedUnresolvedScopeDecisionCount']},indent=2))
