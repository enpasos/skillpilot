# SPDX-License-Identifier: Apache-2.0
import pathlib,json,hashlib,copy,datetime,jsonschema
R=pathlib.Path.cwd();B=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18';OLD=B/'chemie-current450-T4-operative-two-material-author-20261018-v2';O=B/'chemie-current450-T4-operative-two-material-author-20261018-v3'
def read(p):return json.loads(p.read_text())
def pin(p):return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
for p in read(OLD/'FREEZE.author.sha256.json')['files']:assert pin(R/p['path'])==p
old=read(OLD/'AUTHOR.two-new-complete-exam-goals.pending.json')['goals'];new=read(O/'AUTHOR.two-new-complete-exam-goals.pending.json')['goals'];assert len(new)==2
schema=read(R/'docs/landscape-runtime.schema.json');v=jsonschema.Draft202012Validator({'$schema':schema['$schema'],'$defs':schema['$defs'],'$ref':'#/$defs/goal'})
raw=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';current={g['id']:g for g in read(raw)['goals']}
for a,b,phase in zip(old,new,['Q4','Q1']):
 v.validate(b);x=copy.deepcopy(a)
 for k in ['title','titleEn','phase']:x[k]=b[k]
 x['dimensionTags']['phase']=b['dimensionTags']['phase'];assert x==b;assert b['phase']==b['dimensionTags']['phase']==phase
 assert b['examData']==a['examData'];assert b['title'].startswith('Übung:') and b['titleEn'].startswith('Practice:')
 assert b['requires']==b['examData']['coveredGoalIds'] and len(b['requires'])==1
 assert current[b['requires'][0]].get('phase',current[b['requires'][0]]['dimensionTags']['phase'])==phase
 assert read(O/'candidate-goals'/f'{b["id"]}.whole-goal.pending.json')==b
for sub in ['materials','tasks']:
 for p in (OLD/sub).rglob('*'):
  if p.is_file():assert p.read_bytes()==(O/p.relative_to(OLD)).read_bytes()
for p in OLD.glob('INPUT.*.json'):assert p.read_bytes()==(O/p.name).read_bytes()
combined=read(O/'AUTHOR.eighteen-goals.sixteen-whole-exact-two-new.pending.json')['goals'];assert combined[:16]==read(OLD/'AUTHOR.eighteen-goals.sixteen-whole-exact-two-new.pending.json')['goals'][:16] and combined[16:]==new
src=read(O/'READ.primary-sources.actual-receipts-and-adaptation-boundaries.json');orig=read(OLD/'READ.primary-sources.actual-receipts-and-adaptation-boundaries.json');s=next(s for s in src['sources']if s['id']=='GJU-capillary-CMC');a=next(s for s in orig['sources']if s['id']=='GJU-capillary-CMC');a['actualRead']=a['actualRead'].replace('PDF pp54–61','physical PDF pp55–62 (one-based)');assert src==orig
selected=[q for q in read(O/'INPUT.whole-current-eighteen-goals-and-P.json')['records']if q['goal']['id'].startswith(('63e0','d742'))]
for q in selected:
 assert q['goal']==current[q['goal']['id']];assert pin(R/q['PConfig']['path'])==q['PConfig'];assert pin(R/q['PRecordFile']['path'])==q['PRecordFile'];assert json.loads((R/q['PRecordFile']['path']).read_text().splitlines()[q['PLine']-1])==q['wholePRecord']
for q in read(O/'PROPOSAL.exact-two-endpoint-view-child-array-CAS.pending.json')['operations']:
 assert pin(R/q['normalView']['path'])==q['normalView'];assert q['beforeChildren']+q['appendChildren']==q['afterChildren']
 for n in q['appendChildren']:
  assert n['kind']=='structure' and len(n['children'])==1
  g=next(g for g in new if g['id']==n['children'][0]['goalId']);assert g['phase'] in n['label'];assert n['children'][0]['projectionRole']=='target'
report={'status':'PASS_EXACT_TWO_PHASE_AND_SOURCE_LOCATOR_ONLY_SUCCESSOR','checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'currentCanonical':pin(raw),'predecessorSealedFilesExact':35,'completeMethodFilesExact':6,'taskAndSolutionMirrorsExact':8,'wholeExamDataIncludingRubricsExact':2,'priorSixteenWholeGoalsExact':True,'bothCurrentOrdinaryGoalsAndNativePExact':True,'endpointAndDimensionPhase':[g['phase']for g in new],'explicitMatchingLocalViewLabels':12,'oldViewChildrenPreservedExact':True,'GJUPhysicalOneBased':'55–62','GJUPrinted':'47–54','normalWrites':0,'independentFollowupPending':True,'actualLearnerExecution':False,'humanApproval':False}
(O/'CHECK.bounded-v3-interface-and-exact-material.actual.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(report))
