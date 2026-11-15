"""TMP-only837-goal integration: accepted content, exact ordinary R10 and retained history."""
from pathlib import Path
import json,hashlib,copy,re,datetime
OUT=Path(__file__).parent
CP=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json')
BASE_SHA='1ab730054209aa710b34e852bf3eab4f84e16f348b003fcaba6e2b2988c6b2b1'
BASE=json.loads(CP.read_text());sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
assert sha(CP)==BASE_SHA and len(BASE['goals'])==809
base={g['id']:g for g in BASE['goals']};candidate=copy.deepcopy(BASE);goals={g['id']:g for g in candidate['goals']}
Q1=Path('tmp/physics-q1-current-acquisition-20261115-v3/content-candidate.json')
SEKI=Path('tmp/physics-seki-digital-acquisition-20261115-v1/content-candidate.json')
K12=Path('tmp/physics-k12-biophysics-current-20261115-v2/proposal.actual.json')
OLD8=Path('tmp/physics-q1-root-nine-review-20261115/old-eight-coverage-disposition.actual.json')
assert sha(OLD8)=='bddc7b95aa63fc788e2573507d97a7a5510081a7a762063338a8e4f6c77c3eb7'
old8={r['id'] for r in json.loads(OLD8.read_text())['rows']}
assert sha(Q1)=='9bf270c86a09fd40cfe577fc7a0bf11c1016be95faccc62315adbc62c028a3b9'
assert sha(SEKI)=='bfdebafe7d94c03efa1461999c82e9b47ac31125ce163f05a0af670ce6e8cde6'
review_paths=[Path('tmp/physics-q1-root-nine-review-20261115/review-v3.ACCEPT.actual.json'),Path('tmp/physics-q1-independent-release-review-20261115/review-seal.actual.json'),Path('tmp/physics-q1-independent-release-review-20261115/seki-review-seal.actual.json'),Path('tmp/physics-k12-biophysics-current-20261115-v2/independent-sol-review/review-v2.ACCEPT.actual.json')]
for p in review_paths:assert 'ACCEPT' in p.name or str(json.loads(p.read_text()).get('status','')).startswith('ACCEPT')
assert sha(review_paths[0])=='34ca9e05a7e33c60b7ba83c4abe72af83e0de59a02de44c51baecdd666686059'
assert sha(review_paths[1])=='0ad2ba3230bb6e9cab2f9f0f9592bb2e2b985c8c5bcd4245b4b89ff1b0924678'
assert sha(review_paths[2])=='8713a5371ffd9bc9349963354cb7fa6e9117f49b1af4ad4e16db643c37fa802c'

operations=[]
for row in json.loads(K12.read_text())['rows']:
 gid=row['goalId'];assert goals[gid]['requires']==row['beforeRequires']
 goals[gid]['requires']=row['afterRequires']
 operations.append({'goalId':gid,'operation':'replaceOrdinaryRequiresExactlyK12v2','beforeRequires':row['beforeRequires'],'afterRequires':row['afterRequires']})
assert len(operations)==10

retired=['0432a422-401b-5134-bf08-05cfd8c7a366','367b17f8-972a-5f3e-8915-8cfe743132a3','4ab1cf6d-b808-5b86-9291-85df0b9f2496','d441ee2f-9230-5751-832b-5b0b5cf14605']
retired.extend(sorted(old8));assert len(retired)==12
history='151edbf8-eb68-5ef7-8786-43e56a281b0b'
for gid in retired:
 g=goals[gid];old=copy.deepcopy(g)
 g['examData']['coveredGoalIds']=[]
 g['extendedData']={**g.get('extendedData',{}),'applicabilityProjection':'excluded','applicabilityMappingInheritance':'boundary'}
 g['applicability']={}
 if gid in old8:
  retained_note='Historische Aufgabe; vollständige Whole-Goal-Abdeckungsansprüche nach tatsächlicher unabhängiger Prüfung zurückgezogen. Beleg: curricula/DE/Gymnasium/quality/goal-evidence/2026-11-15/physics-q1-acquisition-current-v1/root-review/old-eight-coverage-disposition.actual.json. Aufgaben-, Lösungs-, Scoring- und bestehende Lernendenergebnisverträge bleiben erhalten; kein Masterytransfer.'
  g['examData']['reviewNote']=(old['examData'].get('reviewNote','')+' '+retained_note).strip()
 for parent in goals.values():
  if gid in parent.get('contains',[]):
   parent['contains'].remove(gid)
   operations.append({'goalId':parent['id'],'operation':'removeHistoricalAssessmentFromActiveContains','removedChild':gid})
 goals[history]['contains'].append(gid)
 restored=copy.deepcopy(g);restored['examData']['coveredGoalIds']=old['examData']['coveredGoalIds']
 for key in ['extendedData','applicability']:
  if key in old:restored[key]=old[key]
  else:restored.pop(key,None)
 if 'reviewNote' in old['examData']:restored['examData']['reviewNote']=old['examData']['reviewNote']
 else:restored['examData'].pop('reviewNote',None)
 assert restored==old
 operations.append({'goalId':gid,'operation':'withdrawCoverageAndExplicitHistoricalApplicabilityOnly','beforeCoveredGoalIds':old['examData']['coveredGoalIds'],'afterCoveredGoalIds':[],'beforeExtendedData':old.get('extendedData'),'afterExtendedData':g['extendedData'],'beforeApplicabilityCache':old.get('applicability'),'afterApplicabilityCache':{},'nativeProof':'tmp/physics-q1-successor-integration-20261115/historical-applicability-proof.actual.json','taskSolutionAndScoringUnchanged':True})

new=json.loads(Q1.read_text())['tasks']+json.loads(SEKI.read_text())['tasks'];assert len(new)==28
taxonomy_source=Path('app/scripts/validateGraph.ts').read_text()
allowed_match=re.search(r'const allowedLeitideen = new Set\(\[(.*?)\]\)',taxonomy_source,re.S);assert allowed_match
allowed=set(re.findall(r"'([^']+)'",allowed_match.group(1)))
classification=[
 ['LI_FELDER'],['LI_FELDER'],['LI_FELDER','LI_ENERGIE','LI_BEWEGUNG'],['LI_FELDER','LI_BEWEGUNG'],['LI_FELDER','LI_BEWEGUNG'],['LI_FELDER','LI_BEWEGUNG'],
 ['LI_FELDER','LI_TECHNIK'],['LI_FELDER','LI_ENERGIE','LI_TECHNIK'],['LI_FELDER','LI_ENERGIE','LI_TECHNIK'],['LI_FELDER','LI_MATERIE'],
 ['LI_FELDER','LI_ENERGIE'],['LI_FELDER'],['LI_FELDER'],['LI_FELDER','LI_ENERGIE'],['LI_FELDER','LI_ENERGIE','LI_MATERIE'],
 ['LI_FELDER','LI_MATERIE'],['LI_FELDER'],['LI_FELDER','LI_MATERIE'],['LI_FELDER','LI_ENERGIE'],['LI_FELDER','LI_MATERIE','LI_TECHNIK'],
 ['LI_FELDER'],['LI_FELDER','LI_TECHNIK'],['LI_FELDER','LI_ENERGIE','LI_TECHNIK'],['LI_FELDER','LI_MATERIE','LI_TECHNIK'],['LI_FELDER'],['LI_FELDER'],['LI_FELDER'],['LI_MATERIE','LI_TECHNIK']]
retained='curricula/DE/Gymnasium/quality/goal-evidence/2026-11-15/physics-q1-acquisition-current-v1'
metadata=[]
app_proof=json.loads((OUT/'new-task-applicability-proof.actual.json').read_text())
task_apps={r['goalId']:r['after']['compiledApplicability'] for r in app_proof['rows']}
for index,(task,strands) in enumerate(zip(new,classification)):
 assert task['id'] not in goals and task['type']=='atomic' and not task['contains'] and task.get('examData')
 assert set(strands)<=allowed
 orig=copy.deepcopy(task)
 task['dimensionTags']['framework']=BASE['frameworkId']
 task['dimensionTags']['guidingIdeas']=strands
 task['examData']['coveredStrands']=strands
 task['examData']['reviewStatus']='released'
 task['extendedData']={**task.get('extendedData',{}),'applicabilityFromRequires':True,'applicabilityMappingInheritance':'boundary'}
 task['applicability']=task_apps[task['id']]
 proof_files=['independent-review/seki-review-seal.actual.json'] if index==27 else ['root-review/review-v3.ACCEPT.actual.json','independent-review/review-seal.actual.json']
 task['examData']['reviewNote']='Inhaltsfreigabe nach tatsächlicher unabhängiger informierter KI-Prüfung des vollständig gebundenen Whole-P-Ziels, DE/EN-Materials, der Lösungen und der unkompensierbaren Schrittrubrik. Exakte Autoren-/Reviewbytes: '+retained+'/retained-artifact-map.actual.json; '+', '.join(retained+'/'+x for x in proof_files)+'. Nur freigegebener Aufgabeninhalt und getrennte Taxonomie-/Statusmetadaten; keine native M7-/Routing-/Main-CI-Abnahme, Unterrichtserprobung oder Lernendenergebnisübertragung.'
 clean=copy.deepcopy(task)
 clean['dimensionTags']=orig['dimensionTags'];clean['examData']['coveredStrands']=orig['examData']['coveredStrands'];clean['examData']['reviewStatus']=orig['examData']['reviewStatus']
 clean['applicability']=orig['applicability']
 if 'extendedData' in orig:clean['extendedData']=orig['extendedData']
 else:clean.pop('extendedData',None)
 if 'reviewNote' in orig['examData']:clean['examData']['reviewNote']=orig['examData']['reviewNote']
 else:del clean['examData']['reviewNote']
 assert clean==orig,task['id']
 goals[task['id']]=task;candidate['goals'].append(task)
 parent='21ab0854-4d67-5233-9495-ae208e152a3c' if index==27 else '549a427d-f10a-5537-990e-6fdd7466848b'
 goals[parent]['contains'].append(task['id'])
 metadata.append({'goalId':task['id'],'index':index,'beforeFramework':orig['dimensionTags']['framework'],'afterFramework':task['dimensionTags']['framework'],'beforeGuidingIdeas':orig['dimensionTags']['guidingIdeas'],'afterGuidingIdeas':strands,'beforeCoveredStrands':orig['examData']['coveredStrands'],'afterCoveredStrands':strands,'reviewStatusBefore':orig['examData']['reviewStatus'],'reviewStatusAfter':'released','reviewNote':task['examData']['reviewNote'],'beforeApplicability':orig['applicability'],'afterApplicability':task['applicability'],'ownApplicabilityFromRequires':True,'ownMappingInheritanceBoundary':True,'allStimuliSolutionsRubricsAndRequiresIdentical':True,'canonicalParent':parent})

assert len(candidate['goals'])==837
for gid in base:
 if gid not in {r['goalId'] for r in json.loads(K12.read_text())['rows']} and gid not in retired and gid not in {op['goalId'] for op in operations if op['operation']=='removeHistoricalAssessmentFromActiveContains'} and gid not in [history,'21ab0854-4d67-5233-9495-ae208e152a3c','549a427d-f10a-5537-990e-6fdd7466848b']:
  assert goals[gid]==base[gid],gid

(OUT/'canonical.candidate.json').write_text(json.dumps(candidate,ensure_ascii=False,indent=2)+'\n')
(OUT/'canonical-operations.json').write_text(json.dumps({'operations':operations,'addedTaskIds':[t['id'] for t in new],'historicalTaskIds':retired,'existingHistoryCluster':history},ensure_ascii=False,indent=2)+'\n')
(OUT/'task-release-metadata.actual.json').write_text(json.dumps({'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'taxonomyInputs':[{'path':'app/scripts/validateGraph.ts','sha256':sha('app/scripts/validateGraph.ts')},{'path':'scripts/adopt_hessen_upper_secondary_into_canonical.py','sha256':sha('scripts/adopt_hessen_upper_secondary_into_canonical.py')}],'canonicalFrameworkId':BASE['frameworkId'],'allowedGuidingIdeas':sorted(allowed),'classificationPolicy':'Authored content taxonomy, not an official Land source claim. Coherent fields/energy/motion/matter/technology labels only; legacy PK aliases retain their existing PROCESS.PK1-PK5 mapping. No stimulus/rubric change.','rows':metadata,'actualInputReviews':[{'path':str(p),'sha256':sha(p)} for p in review_paths]},ensure_ascii=False,indent=2)+'\n')
(OUT/'input-pins.json').write_text(json.dumps({'baseline':{'path':str(CP),'sha256':BASE_SHA},'inputs':[{'path':str(p),'sha256':sha(p)} for p in [Q1,SEKI,K12,OLD8,*review_paths]],'activeSourceWrites':0,'learnerResultWrites':False},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'candidate':str(OUT/'canonical.candidate.json'),'sha256':sha(OUT/'canonical.candidate.json'),'goals':len(candidate['goals']),'ordinaryRequiresChanges':10,'newAssessmentTasks':28,'retiredTaskClaims':len(retired),'newClusters':0,'stimulusOrRubricChanges':0}))
