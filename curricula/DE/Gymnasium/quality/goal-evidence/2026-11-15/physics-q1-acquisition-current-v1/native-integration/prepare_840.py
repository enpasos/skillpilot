"""Bounded TMP successor: preserve837, add three accepted tasks, repair derived caches and task phases."""
from pathlib import Path
import json,hashlib,copy,datetime,shutil
B=Path(__file__).parent; O=B/'epoch840';O.mkdir(exist_ok=True)
rd=lambda p:json.loads(Path(p).read_text());sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
write=lambda p,d:Path(p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
P=B/'canonical.837.candidate.json';assert sha(P)=='0ee07f2a91e3ac9f33d07db9808bb2c5cbbc662daac954c73323367f19472ef6'
N=Path('tmp/physics-current10-neutral-P-context-20261115-v2'); R=Path('tmp/physics-three-material-root-review-20261115/review.actual.json')
assert sha(R)=='826db3fd8b09a5b0de45be1e1591f5173bb218145920d1334b2e73c9f5e471d1'
assert sha(N/'content-candidate.json')=='42afedb71f8ba3da2a1e63c0db3e628b9cceb1b8a1191c4535f8f2d91f636df1'
assert sha(B/'72eff-root-placement-review.actual.json')=='ff3417ac252cac95acfbbb4e63322d180931bf42ecf42a52ccec1e6f1ad3eee2'
c=rd(P); by={g['id']:g for g in c['goals']};ops=rd(B/'canonical-operations.json');oldids=set(ops['addedTaskIds']);deltas=[]
for r in rd(B/'applicability-baseline-delta.actual.json')['rows']:
 if not r['compiledValueChangedByThisIntegration']:continue
 g=by[r['goalId']];assert g['applicability']==r['stored'] if 'stored' in r else True
 before=copy.deepcopy(g['applicability']);g['applicability']=r['compiled']
 assert set(before['jurisdiction'])-set(g['applicability']['jurisdiction'])=={'DE-BY'}
 assert not(set(g['applicability']['jurisdiction'])-set(before['jurisdiction']))
 deltas.append({'goalId':g['id'],'kind':'derivedApplicabilityCacheOnly','before':before,'after':g['applicability'],'officialSourceChanged':False})
assert len(deltas)==12
for gid in oldids:
 g=by[gid]
 for field,obj in [('phase',g),('dimensionTags.phase',g['dimensionTags'])]:
  key='phase';before=obj.get(key);obj[key]='GLOBAL'
  if before!='GLOBAL':deltas.append({'goalId':gid,'kind':'assessmentTimetableMetadataOnly','field':field,'before':before,'after':'GLOBAL'})
new=rd(N/'content-candidate.json')['tasks'];assert len(new)==3
retained='curricula/DE/Gymnasium/quality/goal-evidence/2026-11-15/physics-q1-acquisition-current-v1'
for t in new:
 before=copy.deepcopy(t);assert t['id'] not in by
 t['examData']['reviewStatus']='released'
 t['examData']['reviewNote']='Begrenzte Inhaltsfreigabe nach tatsächlicher unabhängiger informierter Root-Prüfung der vollständigen DE/EN-Aufgabe, Lösung, sechs unkompensierbaren Zweipunktkriterien, drei ganzen P-Profilen, tatsächlichen Diagrammen und Primärquellen. Exakte Belege: '+retained+'/three-material-root-review/review.actual.json; '+retained+'/retained-artifact-map.actual.json. CIE-Fremdmaterial bleibt getrennt CC-BY-SA-4.0 attribuiert; eigene Spektrenstimuli CC-BY-4.0. Keine native M7-/Routing-/Main-CI-, Runtime- oder Unterrichtsabnahme und kein Lernendenergebnistransfer.'
 t['phase']='GLOBAL';assert t['dimensionTags']['phase']=='GLOBAL'
 clean=copy.deepcopy(t)
 for key in ['reviewStatus','reviewNote']:
  if key in before['examData']:clean['examData'][key]=before['examData'][key]
  else:clean['examData'].pop(key,None)
 clean.pop('phase',None);assert clean==before
 c['goals'].append(t);by[t['id']]=t;by['47dc2c52-b776-5694-9715-ae98c7c23f85']['contains'].append(t['id'])
 ops['addedTaskIds'].append(t['id']);deltas.append({'goalId':t['id'],'kind':'acceptedNewAssessmentMetadata','reviewStatus':'released','canonicalParent':'47dc2c52-b776-5694-9715-ae98c7c23f85','immutableTaskSolutionScoringRequiresCoveredGoalsExact':True})
assert len(c['goals'])==840 and len(ops['addedTaskIds'])==31
for gid in oldids:
 before=next(g for g in rd(P)['goals'] if g['id']==gid);after=by[gid];clean=copy.deepcopy(after)
 if 'phase' in before:clean['phase']=before['phase']
 else:clean.pop('phase',None)
 clean['dimensionTags']['phase']=before['dimensionTags']['phase'];assert clean==before
for gid in ops['historicalTaskIds']:
 before=next(g for g in rd(P)['goals'] if g['id']==gid);assert by[gid]==before
write(O/'canonical.candidate.json',c);write(O/'canonical-operations.json',ops)
write(O/'successor-delta.actual.json',{'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'parent':{'path':str(P),'sha256':sha(P)},'author3':{'path':str(N/'content-candidate.json'),'sha256':sha(N/'content-candidate.json')},'root3Review':{'path':str(R),'sha256':sha(R)},'deltas':deltas,'ordinaryGoalTextOrRequiresChangesFrom837':0,'existingAssessmentContractsUnchanged':True,'whole31TaskContentContractPreserved':True,'newOrdinaryGoals':0,'newClusters':0,'activeWrites':False})
materials=rd(N/'task-material-targets.actual.json')
for url,m in materials.items():
 src=Path(m['sourcePath']);assert sha(src)==m['sha256'];target=O/'public'/m['targetPath'].removeprefix('app/public/');target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,target);m['candidatePath']=str(target);m['actualPublicAssetExists']=Path(m['targetPath']).exists()
write(O/'material-installation.actual.json',{'status':'EXACT_ASSETS_PREPARED_IN_TMP_NOT_ACTIVE_INSTALLED','materials':materials,'nativePReviewDoesNotUseTaskImageAsGoalVisualization':True})
write(O/'input-pins.json',{'baseline':rd(B/'input-pins.json')['baseline'],'parent837':{'path':str(P),'sha256':sha(P)},'addedInputs':[{'path':str(p),'sha256':sha(p)} for p in [N/'content-candidate.json',N/'candidate-artifact-pins.json',R,B/'72eff-early-placement-source-basis.actual.json',B/'72eff-root-placement-review.actual.json',B/'applicability-baseline-delta.actual.json',B/'applicability-fingerprint-impacts.actual.json']],'activeWrites':False})
print(json.dumps({'candidate':str(O/'canonical.candidate.json'),'sha256':sha(O/'canonical.candidate.json'),'goals':840,'newTasks':31,'historicalPreserved':12,'derivedCachesNarrowed':12,'assetFilesPrepared':len(materials)}))
