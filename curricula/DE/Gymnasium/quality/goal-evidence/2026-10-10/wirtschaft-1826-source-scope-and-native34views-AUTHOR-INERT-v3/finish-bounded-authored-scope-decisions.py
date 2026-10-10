import copy,json,pathlib,hashlib
OUT=pathlib.Path(__file__).resolve().parent
ROOT=OUT.parents[6]
def load(p):return json.loads(p.read_text())
def write(p,obj):
 assert p.is_relative_to(OUT)
 if p.is_symlink():p.unlink()
 p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
MONO='1826fe19-4d06-5183-9b41-9121ae1cc219'
EXT='bad728f2-e375-5f98-8f65-511a9e2e6751'
E3FD='e3fd58d1-f16a-523c-ad64-7c0b3be5e366'
canpath=OUT/'canonical-candidate/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
can=load(canpath);by={g['id']:g for g in can['goals']}
assert by[E3FD]['requires'] and MONO in by[E3FD]['requires']
by[EXT].setdefault('extendedData',{})['applicabilityOverrides']={'jurisdiction':['DE-BB']}
by[EXT]['applicability']['jurisdiction']=sorted(set(by[EXT]['applicability']['jurisdiction'])|{'DE-BB','DE-NI'})
write(canpath,can);write(OUT/'native-capsule/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json',can)
roles=load(OUT/'actual-35-view-authored-country-course-role-decisions.AUTHOR-INERT.json')
needs=load(OUT/'actual-native-35views-first-pass-and-real-prerequisite-role-needs.READONLY.json')
chosen_countries=['DE-HH','DE-MV','DE-RP','DE-SH','DE-SL','DE-SN','DE-ST']
for name in [f'de-{x[3:].lower()}-gym-economics-{course}.view.json' for x in chosen_countries for course in ['gk','lk']]:
 p=OUT/'view-candidates'/name;v=load(p)
 report=next(x for x in needs if x['name']==name)
 assert report['currentTargetPrerequisiteIdsMissingExplicitRole']==[MONO]
 # This is an explicit human-reviewable author decision after inspecting the
 # real whole E3FD -> MONO prerequisite contract, not runtime inference.
 inserted=[]
 def walk(nodes):
  for n in list(nodes):
   if n.get('goalId')==EXT and n.get('kind')=='goalEntry':
    nodes.insert(nodes.index(n)+1,{'kind':'goalEntry','goalId':MONO,'projectionRole':'prerequisiteOnly','displayLabel':by[MONO]['title']});inserted.append(MONO)
   if 'children' in n:walk(n['children'])
 walk(v['rootNodes']);assert inserted==[MONO]
 write(p,v);write(OUT/'native-capsule/curricula/DE/Gymnasium/composition-views/wirtschaft'/name,v)
 row=next(x for x in roles if pathlib.Path(x['viewPath']).name==name)
 row['addedExplicitPrerequisiteOnlyIds']=[MONO]
 row['explicitAuthoredPrerequisiteOnlyReason']='Existing whole target E3FD directly requires MONO. Retain its canonical/global-mastery prerequisite check, omit MONO from this learner target tree/progress. No curricular target or country source obligation is created.'
 row['wholeActualDependentGoal']=copy.deepcopy(by[E3FD])
 row['wholeActualPrerequisiteGoal']=copy.deepcopy(by[MONO])
write(OUT/'actual-35-view-authored-country-course-role-decisions.AUTHOR-INERT.json',roles)

v2=OUT.parent/'wirtschaft-1826-classical-source-operator-fidelity-and-BB-claim-retirement-AUTHOR-INERT-v2'
old='Whole original compares ideal consumer sovereignty and experienced reality under information AND power asymmetry.'
new='Whole original analyses ideal consumer sovereignty and experienced reality under information AND power asymmetry.'
deltas=[]
for name in ['actual-twenty-route-proposals-with-whole-source-limits.AUTHOR-INERT.json','actual-twenty-whole-route-source-operator-and-target-strength-author-audit.AUTHOR-INERT.json']:
 p=v2/name;obj=load(p);changes=[]
 def fix(o,path):
  if isinstance(o,dict):return {k:fix(v,path+[k]) for k,v in o.items()}
  if isinstance(o,list):return [fix(v,path+[i]) for i,v in enumerate(o)]
  if isinstance(o,str) and old in o:
   changes.append({'jsonPath':path,'before':o,'after':o.replace(old,new)});return o.replace(old,new)
  return o
 result=fix(obj,[]);assert len(changes)==1
 write(OUT/('metadata-addendum-'+name),result)
 deltas.append({'historicalFile':str(p.relative_to(ROOT)),'historicalSha256':hashlib.sha256(p.read_bytes()).hexdigest(),'changes':changes,'sourceAtomsMappingsAndTargetContractsUnchanged':True})
write(OUT/'actual-two-additive-NW-g03-analyses-prose-corrections.AUTHOR-INERT.json',deltas)
write(OUT/'actual-separate-practice-and-current-M6-boundaries.AUTHOR-INERT.json',{
 'status':'open_followup_not_machine_approved',
 'separateMemoryWorkNotConsumed':True,
 'explicitExistingExtBBExtension':{'nativeOverride':['DE-BB'],'why':'Retain the existing learning offer after retiring its unsupported BB externality source claim. This is an authored didactic extension, not new normative BB evidence.'},
 'existingPracticeConsequences':[
 {'id':'67204661-44f9-54d4-b901-6271c9d5ff86','mechanism':'Native applicabilityFromRequires intersection adds NI from ExistingEXT. Whole existing practice contract and cases not reviewed or changed here; NI projection/future applicability normalization remains a separate practice/scope followup.'},
 {'id':'bac0f1d3-e671-5c2b-bd6d-2947f1fe6d9b','mechanism':'Native requires-intersection adds NI with ExistingEXT. Whole terminal contract not reapproved; target/app consistency and practice evidence remain a separate followup.'},
 {'id':E3FD,'mechanism':'Historical whole case materials include more market-failure mechanisms than surviving MONO. Exact requires/coveredGoalIds and complete practice contracts require separate bounded author/reviewer work; this source packet does not bind the six new ordinary positive-understanding cases to the terminal goal.'}],
 'currentM6NotClaimed':'No memory-card, Source-Coverage, country/course complete normative coverage, source fingerprint, A/M/D/P/V or maturity release gate is completed by these native compilation results.',
 'sourceExtractionFingerprints':'Source text and mapping candidates are concrete semantic changes; native source fingerprint/extraction validation waits for independent whole-source qualification.'})
print(json.dumps({'explicitPrerequisiteOnlyViews':14,'BBExistingEXTDidacticOverride':True,'NWProseCorrections':len(deltas)}))
